import React, { useEffect, useState } from 'react';
import { getTodayISO } from '../lib/dateUtils';
import { LIMITS } from '../lib/validation';
import { COURSE_TOPICS, CourseClass, PriorityLevel } from '../types/agenda';
import { BottomSheetModal } from './BottomSheetModal';

interface ClassFormSheetProps {
  open: boolean;
  initialClass: CourseClass | null;
  defaultDate?: string;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    title: string;
    topic: string;
    date: string;
    startTime: string;
    durationMinutes: number;
    instructor: string;
    location: string;
    priority: PriorityLevel;
  }) => Promise<void>;
}

export function ClassFormSheet({
  open,
  initialClass,
  defaultDate,
  onClose,
  onSave,
}: ClassFormSheetProps) {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState<string>(COURSE_TOPICS[0]);
  const [date, setDate] = useState(getTodayISO());
  const [startTime, setStartTime] = useState('18:00');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [instructor, setInstructor] = useState('');
  const [location, setLocation] = useState('Sesión en vivo · Google Meet');
  const [priority, setPriority] = useState<PriorityLevel>('media');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (initialClass) {
      setTitle(initialClass.title);
      setTopic(initialClass.topic);
      setDate(initialClass.date || getTodayISO());
      setStartTime(initialClass.startTime);
      setDurationMinutes(String(initialClass.durationMinutes));
      setInstructor(initialClass.instructor);
      setLocation(initialClass.location);
      setPriority(initialClass.priority || 'media');
    } else {
      setTitle('');
      setTopic(COURSE_TOPICS[0]);
      setDate(defaultDate || getTodayISO());
      setStartTime('18:00');
      setDurationMinutes('60');
      setInstructor('Prof. Laura Méndez');
      setLocation('Sesión en vivo · Google Meet');
      setPriority('media');
    }
  }, [open, initialClass, defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Debes escribir una actividad.');
      return;
    }
    const finalDate = date || getTodayISO();
    setSaving(true);
    try {
      await onSave({
        id: initialClass?.id,
        title: title.trim(),
        topic,
        date: finalDate,
        startTime: startTime || '18:00',
        durationMinutes: Number(durationMinutes) || 60,
        instructor: instructor.trim(),
        location: location.trim(),
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
      title={initialClass ? 'Editar clase' : 'Nueva clase'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="cls-title" className="block text-sm font-semibold text-slate-800 mb-1.5">
            Nombre de la clase
          </label>
          <input
            id="cls-title"
            type="text"
            value={title}
            maxLength={LIMITS.classTitleMax}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Ej. Prompts multimodales con Gemini"
            className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 text-base text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="cls-topic" className="block text-sm font-semibold text-slate-800 mb-1.5">
              Tema del curso
            </label>
            <select
              id="cls-topic"
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

          <div>
            <label htmlFor="cls-priority" className="block text-sm font-semibold text-slate-800 mb-1.5">
              Prioridad
            </label>
            <select
              id="cls-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              className="w-full min-h-[48px] px-3 py-2.5 rounded-xl border border-slate-300 text-base text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="cls-date" className="block text-sm font-semibold text-slate-800 mb-1.5">
              Fecha
            </label>
            <input
              id="cls-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full min-h-[48px] px-3 py-2.5 rounded-xl border border-slate-300 text-base text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label htmlFor="cls-time" className="block text-sm font-semibold text-slate-800 mb-1.5">
              Hora
            </label>
            <input
              id="cls-time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full min-h-[48px] px-3 py-2.5 rounded-xl border border-slate-300 text-base text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label htmlFor="cls-duration" className="block text-sm font-semibold text-slate-800 mb-1.5">
              Duración (min)
            </label>
            <input
              id="cls-duration"
              type="number"
              min={LIMITS.durationMin}
              max={LIMITS.durationMax}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="w-full min-h-[48px] px-3 py-2.5 rounded-xl border border-slate-300 text-base text-slate-900 bg-white tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="cls-instructor" className="block text-sm font-semibold text-slate-800 mb-1.5">
              Docente
            </label>
            <input
              id="cls-instructor"
              type="text"
              value={instructor}
              maxLength={LIMITS.instructorMax}
              onChange={(e) => setInstructor(e.target.value)}
              placeholder="Ej. Prof. Laura Méndez"
              className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 text-base text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label htmlFor="cls-location" className="block text-sm font-semibold text-slate-800 mb-1.5">
              Modalidad o lugar
            </label>
            <input
              id="cls-location"
              type="text"
              value={location}
              maxLength={LIMITS.locationMax}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej. Sesión en vivo"
              className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 text-base text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
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
            {saving ? 'Guardando...' : initialClass ? 'Guardar cambios' : 'Agregar clase'}
          </button>
        </div>
      </form>
    </BottomSheetModal>
  );
}
