import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  CheckSquare,
  Cloud,
  CloudOff,
  FileText,
  Home,
  Maximize2,
  Smartphone,
  Tablet,
  Wifi,
  Battery,
} from 'lucide-react';
import { CalendarioView } from './components/CalendarioView';
import { ClassFormSheet } from './components/ClassFormSheet';
import { ConfirmDeleteSheet } from './components/ConfirmDeleteSheet';
import { ErrorBoundary } from './components/ErrorBoundary';
import { InicioView } from './components/InicioView';
import { NotasView } from './components/NotasView';
import { NoteFormSheet } from './components/NoteFormSheet';
import { ProgresoView } from './components/ProgresoView';
import { TareasView } from './components/TareasView';
import { TaskFormSheet } from './components/TaskFormSheet';
import { useAgendaStore } from './hooks/useAgendaStore';
import { AppSection, CourseClass, CourseNote, CourseTask } from './types/agenda';

const NAV_ITEMS: { id: AppSection; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'inicio', label: 'Inicio', Icon: Home },
  { id: 'calendario', label: 'Calendario', Icon: Calendar },
  { id: 'tareas', label: 'Tareas', Icon: CheckSquare },
  { id: 'notas', label: 'Notas', Icon: FileText },
  { id: 'progreso', label: 'Progreso', Icon: BarChart3 },
];

type DeleteTarget =
  | { type: 'clase'; id: string; name: string }
  | { type: 'tarea'; id: string; name: string }
  | { type: 'nota'; id: string; name: string }
  | null;

type ViewMode = 'movil' | 'tablet' | 'completa';

function AgendaApp() {
  const {
    user,
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
  } = useAgendaStore();

  const [activeSection, setActiveSection] = useState<AppSection>('inicio');
  const [viewMode, setViewMode] = useState<ViewMode>('tablet');

  // Modales de formulario
  const [classSheetOpen, setClassSheetOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<CourseClass | null>(null);
  const [defaultClassDate, setDefaultClassDate] = useState<string | undefined>(undefined);

  const [taskSheetOpen, setTaskSheetOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<CourseTask | null>(null);
  const [defaultTaskDate, setDefaultTaskDate] = useState<string | undefined>(undefined);

  const [noteSheetOpen, setNoteSheetOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<CourseNote | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  const openNewClass = (date?: string) => {
    setEditingClass(null);
    setDefaultClassDate(date);
    setClassSheetOpen(true);
  };

  const openEditClass = (item: CourseClass) => {
    setEditingClass(item);
    setDefaultClassDate(undefined);
    setClassSheetOpen(true);
  };

  const openNewTask = (date?: string) => {
    setEditingTask(null);
    setDefaultTaskDate(date);
    setTaskSheetOpen(true);
  };

  const openEditTask = (item: CourseTask) => {
    setEditingTask(item);
    setDefaultTaskDate(undefined);
    setTaskSheetOpen(true);
  };

  const openNewNote = () => {
    setEditingNote(null);
    setNoteSheetOpen(true);
  };

  const openEditNote = (item: CourseNote) => {
    setEditingNote(item);
    setNoteSheetOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'clase') await deleteClass(deleteTarget.id);
    if (deleteTarget.type === 'tarea') await deleteTask(deleteTarget.id);
    if (deleteTarget.type === 'nota') await deleteNote(deleteTarget.id);
  };

  const containerClasses =
    viewMode === 'movil'
      ? 'md:max-w-[420px] md:h-[880px] md:rounded-[48px] md:border-[10px] md:border-slate-950 md:shadow-2xl md:ring-1 md:ring-slate-700'
      : viewMode === 'tablet'
        ? 'md:max-w-[768px] md:h-[900px] md:rounded-[36px] md:border-[10px] md:border-slate-900 md:shadow-2xl md:ring-1 md:ring-slate-700'
        : 'min-h-screen max-w-5xl mx-auto md:rounded-2xl md:my-4 md:shadow-xl';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-900 flex flex-col items-center justify-start md:py-6 md:px-4">
      {/* Controles superiores en escritorio para cambiar entre Móvil, Tablet y Pantalla Completa */}
      <aside aria-label="Controles de visualización" className="hidden md:flex items-center justify-between w-full max-w-xl mb-3 px-2 text-white">
        <div className="flex items-center gap-2">
          <Tablet className="w-4 h-4 text-blue-400" aria-hidden="true" />
          <span className="text-xs font-semibold tracking-wide uppercase text-slate-300">
            Vista para Móviles y Tablets
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode('movil')}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 ${
              viewMode === 'movil' ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Móvil</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('tablet')}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 ${
              viewMode === 'tablet' ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('completa')}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 ${
              viewMode === 'completa' ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Completa</span>
          </button>
        </div>
      </aside>

      {/* Contenedor principal de la app */}
      <div className={`w-full bg-[#F7F8FA] flex flex-col relative overflow-hidden transition-all duration-300 ${containerClasses}`}>
        {/* Barra de estado simulada (en modo móvil o tablet) */}
        {viewMode !== 'completa' && (
          <div className="bg-white/95 px-6 pt-3 pb-1 flex items-center justify-between text-xs font-semibold text-slate-700 shrink-0 select-none hidden md:flex">
            <span>09:41</span>
            <div className="w-32 h-4 bg-slate-900 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2" aria-hidden="true" />
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5" aria-hidden="true" />
              <Battery className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
        )}

        {/* Barra superior de la aplicación (App Bar) */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shrink-0">
          <div className="px-4 h-14 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setActiveSection('inicio')}
              className="text-base font-bold tracking-tight text-slate-900 truncate text-left font-display"
            >
              Mi Agenda de Aprendizaje
            </button>

            <div className="shrink-0">
              {user ? (
                <button
                  type="button"
                  onClick={() => setActiveSection('progreso')}
                  className="min-h-[38px] px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold inline-flex items-center gap-1 hover:bg-slate-200 transition-colors whitespace-nowrap"
                >
                  <Cloud className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                  <span>{syncing ? 'Sincronizando...' : 'Nube'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="min-h-[38px] px-3 py-1 rounded-xl bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1 hover:bg-blue-800 transition-colors whitespace-nowrap"
                >
                  <CloudOff className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Google</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Contenido desplazable de la sección activa */}
        <main className="flex-1 w-full px-4 pt-4 pb-24 overflow-y-auto">
          {authNotice && (
            <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-4 py-3 text-sm font-medium">
              {authNotice}
            </div>
          )}

          {activeSection === 'inicio' && (
            <InicioView
              classes={classes}
              tasks={tasks}
              notesCount={notes.length}
              onNavigate={setActiveSection}
              onAddClass={() => openNewClass()}
              onEditClass={openEditClass}
              onDeleteClass={(item) => setDeleteTarget({ type: 'clase', id: item.id, name: item.title })}
              onAddTask={() => openNewTask()}
              onEditTask={openEditTask}
              onDeleteTask={(item) => setDeleteTarget({ type: 'tarea', id: item.id, name: item.title })}
              onToggleTask={toggleTaskCompleted}
              onAddNote={openNewNote}
            />
          )}

          {activeSection === 'calendario' && (
            <CalendarioView
              classes={classes}
              tasks={tasks}
              onAddClassForDate={(date) => openNewClass(date)}
              onEditClass={openEditClass}
              onDeleteClass={(item) => setDeleteTarget({ type: 'clase', id: item.id, name: item.title })}
              onAddTaskForDate={(date) => openNewTask(date)}
              onEditTask={openEditTask}
              onDeleteTask={(item) => setDeleteTarget({ type: 'tarea', id: item.id, name: item.title })}
              onToggleTask={toggleTaskCompleted}
            />
          )}

          {activeSection === 'tareas' && (
            <TareasView
              tasks={tasks}
              onAddTask={() => openNewTask()}
              onEditTask={openEditTask}
              onDeleteTask={(item) => setDeleteTarget({ type: 'tarea', id: item.id, name: item.title })}
              onToggleTask={toggleTaskCompleted}
            />
          )}

          {activeSection === 'notas' && (
            <NotasView
              notes={notes}
              onAddNote={openNewNote}
              onEditNote={openEditNote}
              onDeleteNote={(item) => setDeleteTarget({ type: 'nota', id: item.id, name: item.title })}
            />
          )}

          {activeSection === 'progreso' && (
            <ProgresoView
              tasks={tasks}
              classes={classes}
              notes={notes}
              user={user}
              onSignIn={signInWithGoogle}
              onSignOut={signOutUser}
              onRestoreSamples={restoreSampleData}
              onOpenTasks={() => setActiveSection('tareas')}
            />
          )}
        </main>

        {/* Barra de navegación inferior fija (Bottom Tab Bar) */}
        <nav
          aria-label="Navegación principal"
          className="absolute bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe shadow-lg"
        >
          <div className="grid grid-cols-5 h-[64px] items-center px-2">
            {NAV_ITEMS.map(({ id, label, Icon }) => {
              const active = activeSection === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveSection(id)}
                  aria-current={active ? 'page' : undefined}
                  className={`min-h-[48px] h-full flex flex-col items-center justify-center gap-0.5 px-1 transition-colors ${
                    active ? 'text-blue-700' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-[22px] h-[22px]" aria-hidden="true" />
                  <span className={`text-[11px] leading-tight whitespace-nowrap ${active ? 'font-bold' : 'font-medium'}`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="w-32 h-1 bg-slate-300 rounded-full mx-auto mb-1.5" aria-hidden="true" />
        </nav>

        {/* Hojas modales */}
        <ClassFormSheet
          open={classSheetOpen}
          initialClass={editingClass}
          defaultDate={defaultClassDate}
          onClose={() => setClassSheetOpen(false)}
          onSave={saveClass}
        />

        <TaskFormSheet
          open={taskSheetOpen}
          initialTask={editingTask}
          defaultDate={defaultTaskDate}
          onClose={() => setTaskSheetOpen(false)}
          onSave={saveTask}
        />

        <NoteFormSheet
          open={noteSheetOpen}
          initialNote={editingNote}
          onClose={() => setNoteSheetOpen(false)}
          onSave={saveNote}
        />

        <ConfirmDeleteSheet
          open={deleteTarget !== null}
          itemLabel={deleteTarget?.type || 'elemento'}
          itemName={deleteTarget?.name || ''}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AgendaApp />
    </ErrorBoundary>
  );
}
