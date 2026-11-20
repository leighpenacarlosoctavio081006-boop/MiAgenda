import React, { useEffect, useState } from 'react';
import { getTodayISO } from '../lib/dateUtils';
import { LIMITS } from '../lib/validation';
import { COURSE_TOPICS, CourseNote } from '../types/agenda';
import { BottomSheetModal } from './BottomSheetModal';

interface NoteFormSheetProps {
  open: boolean;
  initialNote: CourseNote | null;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    title: string;
    topic: string;
    content: string;
    date: string;
  }) => Promise<void>;
}

export function NoteFormSheet({ open, initialNote, onClose, onSave }: NoteFormSheetProps) {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState<string>(COURSE_TOPICS[0]);
  const [date, setDate] = useState(getTodayISO());
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (initialNote) {
      setTitle(initialNote.title);
      setTopic(initialNote.topic);
      setDate(initialNote.date);
      setContent(initialNote.content);
    } else {
      setTitle('');
      setTopic(COURSE_TOPICS[0]);
      setDate(getTodayISO());
      setContent('');
    }
  }, [open, initialNote]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Debes escribir una actividad.');
      return;
    }
    if (!content.trim()) {
      setError('Escribe el contenido de tu apunte.');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        id: initialNote?.id,
        title: title.trim(),
        topic,
        content: content.trim(),
        date: date || getTodayISO(),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheetModal
      open={open}
      title={initialNote ? 'Editar apunte' : 'Nuevo apunte'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="nte-title" className="block text-sm font-semibold text-slate-800 mb-1.5">
            Título del apunte
          </label>
          <input
            id="nte-title"
            type="text"
            value={title}
            maxLength={LIMITS.noteTitleMax}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Ej. Parámetros de generación en AI Studio"
            className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 text-base text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="nte-topic" className="block text-sm font-semibold text-slate-800 mb-1.5">
              Tema del curso
            </label>
            <select
              id="nte-topic"
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
            <label htmlFor="nte-date" className="block text-sm font-semibold text-slate-800 mb-1.5">
              Fecha
            </label>
            <input
              id="nte-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full min-h-[48px] px-3 py-2.5 rounded-xl border border-slate-300 text-base text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div>
          <label htmlFor="nte-content" className="block text-sm font-semibold text-slate-800 mb-1.5">
            Apuntes
          </label>
          <textarea
            id="nte-content"
            rows={6}
            value={content}
            maxLength={LIMITS.noteContentMax}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Anota ideas clave, ejemplos de prompts o recordatorios de clase..."
            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base text-slate-900 bg-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
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
            {saving ? 'Guardando...' : initialNote ? 'Guardar cambios' : 'Guardar apunte'}
          </button>
        </div>
      </form>
    </BottomSheetModal>
  );
}
