import React, { useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { formatFriendlyDate } from '../lib/dateUtils';
import { COURSE_TOPICS, CourseNote } from '../types/agenda';

interface NotasViewProps {
  notes: CourseNote[];
  onAddNote: () => void;
  onEditNote: (note: CourseNote) => void;
  onDeleteNote: (note: CourseNote) => void;
}

export function NotasView({ notes, onAddNote, onEditNote, onDeleteNote }: NotasViewProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return [...notes]
      .filter((note) => {
        const matchesTopic = selectedTopic === 'todos' || note.topic === selectedTopic;
        const matchesQuery =
          !query ||
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.topic.toLowerCase().includes(query);
        return matchesTopic && matchesQuery;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [notes, selectedTopic, searchTerm]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notas</h1>
          <p className="text-sm text-slate-600">
            Apuntes organizados por los temas de tu curso de Google AI Studio.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddNote}
          className="w-full sm:w-auto min-h-[48px] px-5 py-3 rounded-xl bg-blue-700 text-white font-semibold text-base inline-flex items-center justify-center gap-2 hover:bg-blue-800 active:scale-[0.99] transition-all"
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          <span>Nuevo apunte</span>
        </button>
      </div>

      {/* Buscador y filtros por tema */}
      <div className="space-y-3">
        <div className="relative">
          <Search
            className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar en mis apuntes..."
            aria-label="Buscar en mis apuntes"
            className="w-full min-h-[48px] pl-11 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedTopic('todos')}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0 border transition-colors ${
              selectedTopic === 'todos'
                ? 'bg-blue-700 border-blue-700 text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Todos los temas
          </button>
          {COURSE_TOPICS.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => setSelectedTopic(topic)}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0 border transition-colors ${
                selectedTopic === topic
                  ? 'bg-blue-700 border-blue-700 text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-3">
          <p className="text-base text-slate-600">No se encontraron apuntes con ese filtro.</p>
          <button
            type="button"
            onClick={onAddNote}
            className="min-h-[48px] px-5 py-3 rounded-xl bg-blue-700 text-white font-semibold text-base hover:bg-blue-800 transition-colors"
          >
            Crear apunte ahora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <article
              key={note.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500">
                  <span className="text-blue-700 font-semibold">{note.topic}</span>
                  <span aria-hidden="true"> · </span>
                  <span>{formatFriendlyDate(note.date)}</span>
                </p>
                <h2 className="text-lg font-bold text-slate-900 leading-snug">{note.title}</h2>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                  {note.content}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onEditNote(note)}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 inline-flex items-center gap-1.5 hover:bg-slate-50 transition-colors"
                >
                  <Pencil className="w-4 h-4" aria-hidden="true" />
                  <span>Editar</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteNote(note)}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-red-700 inline-flex items-center gap-1.5 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  <span>Eliminar</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
