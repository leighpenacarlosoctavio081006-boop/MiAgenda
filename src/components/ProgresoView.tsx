import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { Cloud, LogOut, RotateCcw } from 'lucide-react';
import { formatFriendlyDate } from '../lib/dateUtils';
import { COURSE_TOPICS, CourseClass, CourseNote, CourseTask } from '../types/agenda';
import { BottomSheetModal } from './BottomSheetModal';

interface ProgresoViewProps {
  tasks: CourseTask[];
  classes: CourseClass[];
  notes: CourseNote[];
  user: User | null;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onRestoreSamples: () => Promise<void>;
  onOpenTasks: () => void;
}

export function ProgresoView({
  tasks,
  classes,
  notes,
  user,
  onSignIn,
  onSignOut,
  onRestoreSamples,
  onOpenTasks,
}: ProgresoViewProps) {
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const upcomingPending = [...tasks]
    .filter((t) => !t.completed)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  const handleConfirmReset = async () => {
    setResetting(true);
    try {
      await onRestoreSamples();
      setConfirmResetOpen(false);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Progreso</h1>
        <p className="text-sm text-slate-600">
          Resumen de tus tareas completadas, pendientes y avance por tema del curso.
        </p>
      </div>

      {/* Resumen principal con anillo SVG */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 104 104" aria-hidden="true">
              <circle
                cx="52"
                cy="52"
                r={radius}
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="10"
              />
              <circle
                cx="52"
                cy="52"
                r={radius}
                fill="none"
                stroke="#1D4ED8"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <span className="absolute text-2xl font-bold text-slate-900 tabular-nums">
              {percentage}%
            </span>
          </div>

          <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="block text-xs font-medium text-emerald-800">Completadas</span>
              <span className="block text-2xl font-bold text-emerald-900 tabular-nums mt-1">
                {completedTasks}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
              <span className="block text-xs font-medium text-amber-800">Pendientes</span>
              <span className="block text-2xl font-bold text-amber-900 tabular-nums mt-1">
                {pendingTasks}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="block text-xs font-medium text-slate-600">Clases</span>
              <span className="block text-2xl font-bold text-slate-900 tabular-nums mt-1">
                {classes.length}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="block text-xs font-medium text-slate-600">Apuntes</span>
              <span className="block text-2xl font-bold text-slate-900 tabular-nums mt-1">
                {notes.length}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Avance por tema */}
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Avance por tema del curso</h2>
          <div className="space-y-4">
            {COURSE_TOPICS.map((topic) => {
              const topicTasks = tasks.filter((t) => t.topic === topic);
              const done = topicTasks.filter((t) => t.completed).length;
              const total = topicTasks.length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;

              return (
                <div key={topic} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-semibold text-slate-800">{topic}</span>
                    <span className="text-slate-600 tabular-nums">
                      {done} de {total} completadas
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-700 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Próximas entregas y respaldo */}
        <section className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-slate-900">Pendientes próximas</h2>
              <button
                type="button"
                onClick={onOpenTasks}
                className="min-h-[44px] px-3 rounded-xl text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
              >
                Ir a Tareas
              </button>
            </div>

            {upcomingPending.length === 0 ? (
              <p className="text-sm text-slate-600">Todas tus tareas están completadas.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {upcomingPending.map((t) => (
                  <li key={t.id} className="py-2.5 first:pt-0 last:pb-0">
                    <p className="text-sm font-semibold text-slate-900">{t.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t.topic}
                      <span aria-hidden="true"> · </span>
                      <span className="font-mono tabular-nums">Entrega: {formatFriendlyDate(t.dueDate)}</span>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">Respaldo y datos de ejemplo</h2>
              <p className="text-sm text-slate-600">
                {user
                  ? `Conectado como ${user.displayName || user.email}. Tus cambios se guardan en la nube.`
                  : 'Tus datos se guardan en este dispositivo. Conecta tu cuenta de Google para respaldarlos en la nube.'}
              </p>
            </div>

            <div className="space-y-2.5">
              {user ? (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="w-full min-h-[48px] px-4 py-3 rounded-xl border border-slate-300 text-slate-800 font-semibold text-base inline-flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" aria-hidden="true" />
                  <span>Cerrar sesión de Google</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onSignIn}
                  className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-blue-700 text-white font-semibold text-base inline-flex items-center justify-center gap-2 hover:bg-blue-800 transition-colors"
                >
                  <Cloud className="w-5 h-5" aria-hidden="true" />
                  <span>Guardar en la nube con Google</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setConfirmResetOpen(true)}
                className="w-full min-h-[48px] px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm inline-flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span>Restaurar datos de ejemplo de AI Studio</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      <BottomSheetModal
        open={confirmResetOpen}
        title="Restaurar datos de ejemplo"
        onClose={() => setConfirmResetOpen(false)}
      >
        <div className="space-y-5">
          <p className="text-base text-slate-700 leading-relaxed">
            Esto reemplazará tus clases, tareas y notas actuales por los ejemplos iniciales del curso de Google AI Studio.
          </p>
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setConfirmResetOpen(false)}
              className="w-full sm:w-auto min-h-[48px] px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-base hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={resetting}
              onClick={handleConfirmReset}
              className="w-full sm:flex-1 min-h-[48px] px-5 py-3 rounded-xl bg-blue-700 text-white font-semibold text-base hover:bg-blue-800 disabled:opacity-60 transition-colors"
            >
              {resetting ? 'Restaurando...' : 'Sí, restaurar ejemplos'}
            </button>
          </div>
        </div>
      </BottomSheetModal>
    </div>
  );
}
