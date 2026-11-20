import React, { useEffect, useState } from 'react';
import { getTodayISO } from '../lib/dateUtils';
import { LIMITS } from '../lib/validation';
import { COURSE_TOPICS, CourseTask, PriorityLevel } from '../types/agenda';
import { BottomSheetModal } from './BottomSheetModal';

interface TaskFormSheetProps {
  open: boolean;
  initialTask: CourseTask | null;
  defaultDate?: string;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    title: string;
    description: string;
    dueDate: string;
    topic: string;
    completed: boolean;
    priority: PriorityLevel;
  }) => Promise<void>;
}

export function TaskFormSheet({
  open,
  initialTask,
  defaultDate,
  onClose,
  onSave,
}: TaskFormSheetProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(getTodayISO());
  const [topic, setTopic] = useState<string>(COURSE_TOPICS[0]);
  const [completed, setCompleted] = useState(false);
  const [priority, setPriority] = useState<PriorityLevel>('media');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setDueDate(initialTask.dueDate || getTodayISO());
      setTopic(initialTask.topic);
      setCompleted(initialTask.completed);
      setPriority(initialTask.priority || 'media');
    } else {
      setTitle('');
      setDescription('');
      setDueDate(defaultDate || getTodayISO());
      setTopic(COURSE_TOPICS[1]);
      setCompleted(false);
      setPriority('media');
    }
  }, [open, initialTask, defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Debes escribir una actividad.');
      return;
    }
    const finalDueDate = dueDate || getTodayISO();
    setSaving(true);
    try {
      await onSave({
        id: initialTask?.id,
        title: title.trim(),
        description: description.trim(),
        dueDate: finalDueDate,
        topic,
        completed,
        priority,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheetModal
      open={open}
      title={initialTask ? 'Editar tarea' : 'Nueva tarea'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="tsk-title" className="block text-sm font-semibold text-slate-800 mb-1.5">
            Nombre de la actividad / tarea
          </label>
          <input
            id="tsk-title"
            type="text"
            value={title}
            maxLength={LIMITS.taskTitleMax}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Ej. Probar System Instructions en AI Studio"
            className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 text-base text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div>
          <label htmlFor="tsk-desc" className="block text-sm font-semibold text-slate-800 mb-1.5">
            Descripción
          </label>
          <textarea
            id="tsk-desc"
            rows={3}
            value={description}
            maxLength={LIMITS.descriptionMax}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe qué debes entregar o practicar..."
            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="tsk-date" className="block text-sm font-semibold text-slate-800 mb-1.5">
              Fecha de la actividad
            </label>
            <input
              id="tsk-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full min-h-[48px] px-3 py-2.5 rounded-xl border border-slate-300 text-base text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label htmlFor="tsk-topic" className="block text-sm font-semibold text-slate-800 mb-1.5">
              Tema del curso
            </label>
            <select
              id="tsk-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full min-h-[48px] px-3 py-2.5 rounded-xl border border-slate-300 text-base text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {COURSE_TOPICS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="tsk-priority" className="block text-sm font-semibold text-slate-800 mb-1.5">
              Prioridad
            </label>
            <select
              id="tsk-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              className="w-full min-h-[48px] px-3 py-2.5 rounded-xl border border-slate-300 text-base text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>

          <div>
            <span className="block text-sm font-semibold text-slate-800 mb-1.5">Estado</span>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setCompleted(false)}
                className={`min-h-[44px] px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  !completed ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pendiente
              </button>
              <button
                type="button"
                onClick={() => setCompleted(true)}
                className={`min-h-[44px] px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  completed ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hecha
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[48px] px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-base hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:flex-1 min-h-[48px] px-5 py-3 rounded-xl bg-blue-700 text-white font-semibold text-base hover:bg-blue-800 disabled:opacity-60 transition-colors"
          >
            {saving ? 'Guardando...' : initialTask ? 'Guardar cambios' : 'Guardar tarea'}
          </button>
        </div>
      </form>
    </BottomSheetModal>
  );
}
