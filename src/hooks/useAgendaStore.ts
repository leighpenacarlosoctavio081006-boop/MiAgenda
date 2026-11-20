import { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { createSampleData } from '../data/sampleData';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  testConnection,
} from '../lib/firebase';
import {
  clampDuration,
  generateSafeId,
  isValidDateStr,
  isValidTimeStr,
  LIMITS,
  sanitizeText,
} from '../lib/validation';
import { CourseClass, CourseNote, CourseTask, PriorityLevel } from '../types/agenda';

const STORAGE_KEY = 'mi_agenda_aprendizaje_v1';

interface LocalAgendaPayload {
  classes: CourseClass[];
  tasks: CourseTask[];
  notes: CourseNote[];
}

function loadLocalData(): LocalAgendaPayload {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LocalAgendaPayload>;
      if (
        Array.isArray(parsed.classes) &&
        Array.isArray(parsed.tasks) &&
        Array.isArray(parsed.notes)
      ) {
        return {
          classes: parsed.classes,
          tasks: parsed.tasks,
          notes: parsed.notes,
        };
      }
    }
  } catch {
    // Fallback to initial sample data
  }
  const initial = createSampleData('local');
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  } catch {
    // Ignore storage quota issues
  }
  return initial;
}

function saveLocalData(data: LocalAgendaPayload): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota issues
  }
}

export function useAgendaStore() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  const [classes, setClasses] = useState<CourseClass[]>(() => loadLocalData().classes);
  const [tasks, setTasks] = useState<CourseTask[]>(() => loadLocalData().tasks);
  const [notes, setNotes] = useState<CourseNote[]>(() => loadLocalData().notes);

  useEffect(() => {
    testConnection();
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Persist local changes when not signed in
  useEffect(() => {
    if (!user) {
      saveLocalData({ classes, tasks, notes });
    }
  }, [user, classes, tasks, notes]);

  const ensureUserSeeded = useCallback(async (currentUser: User) => {
    const uid = currentUser.uid;
    const userRef = doc(db, 'users', uid);
    try {
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        const displayName = sanitizeText(currentUser.displayName || 'Estudiante', 100) || 'Estudiante';
        await setDoc(userRef, {
          uid,
          displayName,
          seeded: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        const localSnapshot = loadLocalData();
        const seedSource =
          localSnapshot.classes.length || localSnapshot.tasks.length || localSnapshot.notes.length
            ? localSnapshot
            : createSampleData(uid);

        const batch = writeBatch(db);
        for (const item of seedSource.classes) {
          const safeId = sanitizeText(item.id, LIMITS.idMax) || generateSafeId('cls');
          batch.set(doc(db, 'users', uid, 'classes', safeId), {
            id: safeId,
            ownerId: uid,
            title: sanitizeText(item.title, LIMITS.classTitleMax) || 'Clase del curso',
            topic: sanitizeText(item.topic, LIMITS.topicMax) || 'Fundamentos de AI Studio',
            date: isValidDateStr(item.date) ? item.date : '2026-11-17',
            startTime: isValidTimeStr(item.startTime) ? item.startTime : '18:00',
            durationMinutes: clampDuration(item.durationMinutes),
            instructor: sanitizeText(item.instructor, LIMITS.instructorMax),
            location: sanitizeText(item.location, LIMITS.locationMax),
            priority: item.priority || 'media',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
        for (const item of seedSource.tasks) {
          const safeId = sanitizeText(item.id, LIMITS.idMax) || generateSafeId('tsk');
          batch.set(doc(db, 'users', uid, 'tasks', safeId), {
            id: safeId,
            ownerId: uid,
            title: sanitizeText(item.title, LIMITS.taskTitleMax) || 'Tarea del curso',
            description: sanitizeText(item.description, LIMITS.descriptionMax),
            dueDate: isValidDateStr(item.dueDate) ? item.dueDate : '2026-11-18',
            topic: sanitizeText(item.topic, LIMITS.topicMax) || 'Diseño de Prompts',
            completed: Boolean(item.completed),
            priority: item.priority || 'media',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
        for (const item of seedSource.notes) {
          const safeId = sanitizeText(item.id, LIMITS.idMax) || generateSafeId('nte');
          batch.set(doc(db, 'users', uid, 'notes', safeId), {
            id: safeId,
            ownerId: uid,
            title: sanitizeText(item.title, LIMITS.noteTitleMax) || 'Apunte de clase',
            topic: sanitizeText(item.topic, LIMITS.topicMax) || 'Fundamentos de AI Studio',
            content: sanitizeText(item.content, LIMITS.noteContentMax) || 'Sin contenido',
            date: isValidDateStr(item.date) ? item.date : '2026-11-17',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
        await batch.commit();
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
    }
  }, []);

  // Subscribe to Firestore when authenticated and verified
  useEffect(() => {
    if (!authReady || !user) return;
    let active = true;
    setSyncing(true);

    let unsubClasses: (() => void) | undefined;
    let unsubTasks: (() => void) | undefined;
    let unsubNotes: (() => void) | undefined;

    ensureUserSeeded(user)
      .then(() => {
        if (!active) return;
        const uid = user.uid;

        const classesPath = `users/${uid}/classes`;
        const classesQuery = query(collection(db, classesPath), where('ownerId', '==', uid));
        unsubClasses = onSnapshot(
          classesQuery,
          (snapshot) => {
            const list: CourseClass[] = snapshot.docs.map((d) => {
              const data = d.data();
              return {
                id: String(data.id || d.id),
                ownerId: String(data.ownerId || uid),
                title: String(data.title || ''),
                topic: String(data.topic || ''),
                date: String(data.date || ''),
                startTime: String(data.startTime || '18:00'),
                durationMinutes: Number(data.durationMinutes || 60),
                instructor: String(data.instructor || ''),
                location: String(data.location || ''),
                priority: (data.priority as PriorityLevel) || 'media',
              };
            });
            setClasses(list);
          },
          (error) => handleFirestoreError(error, OperationType.LIST, classesPath),
        );

        const tasksPath = `users/${uid}/tasks`;
        const tasksQuery = query(collection(db, tasksPath), where('ownerId', '==', uid));
        unsubTasks = onSnapshot(
          tasksQuery,
          (snapshot) => {
            const list: CourseTask[] = snapshot.docs.map((d) => {
              const data = d.data();
              return {
                id: String(data.id || d.id),
                ownerId: String(data.ownerId || uid),
                title: String(data.title || ''),
                description: String(data.description || ''),
                dueDate: String(data.dueDate || ''),
                topic: String(data.topic || ''),
                completed: Boolean(data.completed),
                priority: (data.priority as PriorityLevel) || 'media',
              };
            });
            setTasks(list);
          },
          (error) => handleFirestoreError(error, OperationType.LIST, tasksPath),
        );

        const notesPath = `users/${uid}/notes`;
        const notesQuery = query(collection(db, notesPath), where('ownerId', '==', uid));
        unsubNotes = onSnapshot(
          notesQuery,
          (snapshot) => {
            const list: CourseNote[] = snapshot.docs.map((d) => {
              const data = d.data();
              return {
                id: String(data.id || d.id),
                ownerId: String(data.ownerId || uid),
                title: String(data.title || ''),
                topic: String(data.topic || ''),
                content: String(data.content || ''),
                date: String(data.date || ''),
              };
            });
            setNotes(list);
            setSyncing(false);
          },
          (error) => handleFirestoreError(error, OperationType.LIST, notesPath),
        );
      })
      .catch(() => {
        if (active) setSyncing(false);
      });

    return () => {
      active = false;
      unsubClasses?.();
      unsubTasks?.();
      unsubNotes?.();
    };
  }, [authReady, user, ensureUserSeeded]);

  const signInWithGoogle = useCallback(async () => {
    setAuthNotice(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'No se pudo iniciar sesión';
      if (!msg.includes('popup-closed-by-user')) {
        setAuthNotice('No se pudo conectar con Google. Tus cambios siguen guardados en este dispositivo.');
      }
    }
  }, []);

  const signOutUser = useCallback(async () => {
    setAuthNotice(null);
    await signOut(auth);
    const local = loadLocalData();
    setClasses(local.classes);
    setTasks(local.tasks);
    setNotes(local.notes);
  }, []);

  // CRUD for Classes
  const saveClass = useCallback(
    async (input: Omit<CourseClass, 'ownerId' | 'id'> & { id?: string }) => {
      const id = input.id ? sanitizeText(input.id, LIMITS.idMax) : generateSafeId('cls');
      const ownerId = user ? user.uid : 'local';
      const clean: CourseClass = {
        id,
        ownerId,
        title: sanitizeText(input.title, LIMITS.classTitleMax),
        topic: sanitizeText(input.topic, LIMITS.topicMax),
        date: input.date,
        startTime: input.startTime,
        durationMinutes: clampDuration(input.durationMinutes),
        instructor: sanitizeText(input.instructor, LIMITS.instructorMax),
        location: sanitizeText(input.location, LIMITS.locationMax),
        priority: input.priority || 'media',
      };

      if (!user) {
        setClasses((prev) => {
          const exists = prev.some((c) => c.id === id);
          return exists ? prev.map((c) => (c.id === id ? clean : c)) : [...prev, clean];
        });
        return;
      }

      const path = `users/${user.uid}/classes/${id}`;
      try {
        if (input.id) {
          await updateDoc(doc(db, path), {
            title: clean.title,
            topic: clean.topic,
            date: clean.date,
            startTime: clean.startTime,
            durationMinutes: clean.durationMinutes,
            instructor: clean.instructor,
            location: clean.location,
            priority: clean.priority,
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(doc(db, path), {
            ...clean,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        handleFirestoreError(error, input.id ? OperationType.UPDATE : OperationType.CREATE, path);
      }
    },
    [user],
  );

  const deleteClass = useCallback(
    async (id: string) => {
      if (!user) {
        setClasses((prev) => prev.filter((c) => c.id !== id));
        return;
      }
      const path = `users/${user.uid}/classes/${id}`;
      try {
        await deleteDoc(doc(db, path));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    [user],
  );

  // CRUD for Tasks
  const saveTask = useCallback(
    async (input: Omit<CourseTask, 'ownerId' | 'id'> & { id?: string }) => {
      const id = input.id ? sanitizeText(input.id, LIMITS.idMax) : generateSafeId('tsk');
      const ownerId = user ? user.uid : 'local';
      const clean: CourseTask = {
        id,
        ownerId,
        title: sanitizeText(input.title, LIMITS.taskTitleMax),
        description: sanitizeText(input.description, LIMITS.descriptionMax),
        dueDate: input.dueDate,
        topic: sanitizeText(input.topic, LIMITS.topicMax),
        completed: Boolean(input.completed),
        priority: input.priority || 'media',
      };

      if (!user) {
        setTasks((prev) => {
          const exists = prev.some((t) => t.id === id);
          return exists ? prev.map((t) => (t.id === id ? clean : t)) : [...prev, clean];
        });
        return;
      }

      const path = `users/${user.uid}/tasks/${id}`;
      try {
        if (input.id) {
          await updateDoc(doc(db, path), {
            title: clean.title,
            description: clean.description,
            dueDate: clean.dueDate,
            topic: clean.topic,
            completed: clean.completed,
            priority: clean.priority,
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(doc(db, path), {
            ...clean,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        handleFirestoreError(error, input.id ? OperationType.UPDATE : OperationType.CREATE, path);
      }
    },
    [user],
  );

  const toggleTaskCompleted = useCallback(
    async (task: CourseTask) => {
      const nextCompleted = !task.completed;
      if (!user) {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, completed: nextCompleted } : t)),
        );
        return;
      }
      const path = `users/${user.uid}/tasks/${task.id}`;
      try {
        await updateDoc(doc(db, path), {
          completed: nextCompleted,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    },
    [user],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      if (!user) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        return;
      }
      const path = `users/${user.uid}/tasks/${id}`;
      try {
        await deleteDoc(doc(db, path));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    [user],
  );

  // CRUD for Notes
  const saveNote = useCallback(
    async (input: Omit<CourseNote, 'ownerId' | 'id'> & { id?: string }) => {
      const id = input.id ? sanitizeText(input.id, LIMITS.idMax) : generateSafeId('nte');
      const ownerId = user ? user.uid : 'local';
      const clean: CourseNote = {
        id,
        ownerId,
        title: sanitizeText(input.title, LIMITS.noteTitleMax),
        topic: sanitizeText(input.topic, LIMITS.topicMax),
        content: sanitizeText(input.content, LIMITS.noteContentMax),
        date: input.date,
      };

      if (!user) {
        setNotes((prev) => {
          const exists = prev.some((n) => n.id === id);
          return exists ? prev.map((n) => (n.id === id ? clean : n)) : [...prev, clean];
        });
        return;
      }

      const path = `users/${user.uid}/notes/${id}`;
      try {
        if (input.id) {
          await updateDoc(doc(db, path), {
            title: clean.title,
            topic: clean.topic,
            content: clean.content,
            date: clean.date,
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(doc(db, path), {
            ...clean,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        handleFirestoreError(error, input.id ? OperationType.UPDATE : OperationType.CREATE, path);
      }
    },
    [user],
  );

  const deleteNote = useCallback(
    async (id: string) => {
      if (!user) {
        setNotes((prev) => prev.filter((n) => n.id !== id));
        return;
      }
      const path = `users/${user.uid}/notes/${id}`;
      try {
        await deleteDoc(doc(db, path));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    [user],
  );

  const restoreSampleData = useCallback(async () => {
    const ownerId = user ? user.uid : 'local';
    const fresh = createSampleData(ownerId);

    if (!user) {
      setClasses(fresh.classes);
      setTasks(fresh.tasks);
      setNotes(fresh.notes);
      saveLocalData(fresh);
      return;
    }

    try {
      const batch = writeBatch(db);
      for (const c of classes) {
        batch.delete(doc(db, 'users', ownerId, 'classes', c.id));
      }
      for (const t of tasks) {
        batch.delete(doc(db, 'users', ownerId, 'tasks', t.id));
      }
      for (const n of notes) {
        batch.delete(doc(db, 'users', ownerId, 'notes', n.id));
      }
      for (const c of fresh.classes) {
        batch.set(doc(db, 'users', ownerId, 'classes', c.id), {
          ...c,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      for (const t of fresh.tasks) {
        batch.set(doc(db, 'users', ownerId, 'tasks', t.id), {
          ...t,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      for (const n of fresh.notes) {
        batch.set(doc(db, 'users', ownerId, 'notes', n.id), {
          ...n,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${ownerId}`);
    }
  }, [user, classes, tasks, notes]);

  return {
    user,
    authReady,
    syncing,
    authNotice,
    classes,
    tasks,
    notes,
    signInWithGoogle,
    signOutUser,
    saveClass,
    deleteClass,
    saveTask,
    toggleTaskCompleted,
    deleteTask,
    saveNote,
    deleteNote,
    restoreSampleData,
  };
}
