import React from 'react';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  MapPin,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { formatFriendlyDate, getTodayISO } from '../lib/dateUtils';
import { AppSection, CourseClass, CourseTask, PriorityLevel } from '../types/agenda';

interface InicioViewProps {
  classes: CourseClass[];
  tasks: CourseTask[];
  notesCount: number;
  onNavigate: (section: AppSection) => void;
  onAddClass: () => void;
  onEditClass: (item: CourseClass) => void;
  onDeleteClass: (item: CourseClass) => void;
  onAddTask: () => void;
  onEditTask: (item: CourseTask) => void;
  onDeleteTask: (item: CourseTask) => void;
  onToggleTask: (item: CourseTask) => void;
  onAddNote: () => void;
}

function PriorityBadge({ priority }: { priority?: PriorityLevel }) {
  const p = priority || 'media';
  if (p === 'alta') {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200">Alta</span>;
  }
  if (p === 'media') {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Media</span>;
  }
  return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">Baja</span>;
}

export function InicioView({
  classes,
  tasks,
  notesCount,
  onNavigate,
  onAddClass,
  onEditClass,
  onDeleteClass,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleTask,
  onAddNote,
}: InicioViewProps) {
  const todayISO = getTodayISO();

  const upcomingClasses = [...classes]
    .filter((c) => c.date >= todayISO)
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))
    .slice(0, 4);

  const pendingTasks = [...tasks]
    .filter((t) => !t.completed)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      {/* Resumen superior */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-blue-700">Curso de Google AI Studio</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
              Tu resumen de hoy
            </h1>
            <p className="text-base text-slate-600">
              Tienes{' '}
              <span className="font-semibold text-slate-900 tabular-nums">
                {pendingTasks.length} {pendingTasks.length === 1 ? 'tarea pendiente' : 'tareas pendientes'}
              </span>{' '}
              y{' '}
              <span className="font-semibold text-slate-900 tabular-nums">
                {upcomingClasses.length} {upcomingClasses.length === 1 ? 'próxima clase' : 'próximas clases'}
              </span>
              .
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('tareas')}
              className="text-left p-3 sm:px-4 sm:py-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors min-h-[68px]"
            >
              <span className="block text-xs text-slate-500">Pendientes</span>
              <span className="block text-xl font-bold text-slate-900 tabular-nums mt-0.5">
                {pendingTasks.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('progreso')}
              className="text-left p-3 sm:px-4 sm:py-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors min-h-[68px]"
            >
              <span className="block text-xs text-slate-500">Completadas</span>
              <span className="block text-xl font-bold text-emerald-700 tabular-nums mt-0.5">
                {completedCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('notas')}
              className="text-left p-3 sm:px-4 sm:py-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors min-h-[68px]"
            >
              <span className="block text-xs text-slate-500">Apuntes</span>
              <span className="block text-xl font-bold text-slate-900 tabular-nums mt-0.5">
                {notesCount}
              </span>
            </button>
          </div>
        </div>

        {/* Botones de acción rápida grandes y claros */}
        <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={onAddTask}
            className="min-h-[48px] px-4 py-3 rounded-xl bg-blue-700 text-white font-semibold text-base inline-flex items-center justify-center gap-2 hover:bg-blue-800 active:scale-[0.99] transition-all"
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
            <span>Nueva tarea</span>
          </button>
          <button
            type="button"
            onClick={onAddClass}
            className="min-h-[48px] px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-800 font-semibold text-base inline-flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-[0.99] transition-all"
          >
            <Calendar className="w-5 h-5 text-blue-700" aria-hidden="true" />
            <span>Nueva clase</span>
          </button>
          <button
            type="button"
            onClick={onAddNote}
            className="min-h-[48px] px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-800 font-semibold text-base inline-flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-[0.99] transition-all"
          >
            <FileText className="w-5 h-5 text-blue-700" aria-hidden="true" />
            <span>Nuevo apunte</span>
          </button>
        </div>
      </section>

      {/* Columnas principales: Próximas clases y Tareas pendientes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Próximas clases */}
        <section className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900">Próximas clases</h2>
            <button
              type="button"
              onClick={() => onNavigate('calendario')}
              className="min-h-[44px] px-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800 rounded-xl hover:bg-blue-50 transition-colors"
            >
              <span>Ver calendario</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {upcomingClasses.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-3">
              <p className="text-base text-slate-600">No tienes clases próximas programadas.</p>
              <button
                type="button"
                onClick={onAddClass}
                className="min-h-[48px] px-5 py-3 rounded-xl bg-blue-700 text-white font-semibold text-base hover:bg-blue-800 transition-colors"
              >
                Programar primera clase
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingClasses.map((item) => (
                <article
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500">
                        {item.topic}
                        <span aria-hidden="true"> · </span>
                        <span className="text-blue-700 font-semibold">{formatFriendlyDate(item.date)}</span>
                        <span aria-hidden="true"> · </span>
                        <span className="font-mono tabular-nums">{item.startTime}</span>
                      </p>
                      <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">
                        {item.title}
                      </h3>
                    </div>
                    <PriorityBadge priority={item.priority} />
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" aria-hidden="true" />
                      <span className="tabular-nums">{item.durationMinutes} min</span>
                    </span>
                    {item.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400" aria-hidden="true" />
                        <span>{item.location}</span>
                      </span>
                    )}
                    {item.instructor && <span>{item.instructor}</span>}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEditClass(item)}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 inline-flex items-center gap-1.5 hover:bg-slate-50 transition-colors"
                    >
                      <Pencil className="w-4 h-4" aria-hidden="true" />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteClass(item)}
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
        </section>

        {/* Tareas pendientes */}
        <section className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900">Tareas pendientes</h2>
            <button
              type="button"
              onClick={() => onNavigate('tareas')}
              className="min-h-[44px] px-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800 rounded-xl hover:bg-blue-50 transition-colors"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-3">
              <p className="text-base text-slate-600">¡Excelente! No tienes tareas pendientes.</p>
              <button
                type="button"
                onClick={onAddTask}
                className="min-h-[48px] px-5 py-3 rounded-xl bg-blue-700 text-white font-semibold text-base hover:bg-blue-800 transition-colors"
              >
                Agregar nueva tarea
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTasks.slice(0, 5).map((task) => {
                const isOverdue = task.dueDate < todayISO;
                return (
                  <article
                    key={task.id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => onToggleTask(task)}
                        aria-label={`Marcar "${task.title}" como completada`}
                        className="min-h-[44px] min-w-[44px] -ml-1.5 -mt-1.5 flex items-center justify-center rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-7 h-7 text-emerald-600" aria-hidden="true" />
                        ) : (
                          <Circle className="w-7 h-7" aria-hidden="true" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-medium text-slate-500">
                            {task.topic}
                            <span aria-hidden="true"> · </span>
                            <span className={isOverdue ? 'text-amber-700 font-semibold' : 'text-slate-700 font-semibold'}>
                              Entrega: {formatFriendlyDate(task.dueDate)}
                            </span>
                          </p>
                          <PriorityBadge priority={task.priority} />
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleTask(task)}
                        className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-sm font-semibold hover:bg-emerald-100 transition-colors"
                      >
                        Marcar como completada
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onEditTask(task)}
                          className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 inline-flex items-center gap-1.5 hover:bg-slate-50 transition-colors"
                        >
                          <Pencil className="w-4 h-4" aria-hidden="true" />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteTask(task)}
                          className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-red-700 inline-flex items-center gap-1.5 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
