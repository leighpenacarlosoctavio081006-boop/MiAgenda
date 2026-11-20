import React, { useMemo, useState } from 'react';
import {
  CalendarPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  ListPlus,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  formatFriendlyDate,
  formatLongSpanishDate,
  getTodayISO,
  getWeekDates,
  shiftISOByDays,
} from '../lib/dateUtils';
import { CourseClass, CourseTask, PriorityLevel } from '../types/agenda';

interface CalendarioViewProps {
  classes: CourseClass[];
  tasks: CourseTask[];
  onAddClassForDate: (date: string) => void;
  onEditClass: (item: CourseClass) => void;
  onDeleteClass: (item: CourseClass) => void;
  onAddTaskForDate: (date: string) => void;
  onEditTask: (item: CourseTask) => void;
  onDeleteTask: (item: CourseTask) => void;
  onToggleTask: (item: CourseTask) => void;
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

export function CalendarioView({
  classes,
  tasks,
  onAddClassForDate,
  onEditClass,
  onDeleteClass,
  onAddTaskForDate,
  onEditTask,
  onDeleteTask,
  onToggleTask,
}: CalendarioViewProps) {
  const todayISO = getTodayISO();
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [viewMode, setViewMode] = useState<'dia' | 'semana'>('dia');

  const weekDays = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

  const countForDay = (iso: string) => {
    const clsCount = classes.filter((c) => c.date === iso).length;
    const tskCount = tasks.filter((t) => t.dueDate === iso).length;
    return clsCount + tskCount;
  };

  const dayClasses = useMemo(
    () =>
      classes
        .filter((c) => c.date === selectedDate)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [classes, selectedDate],
  );

  const dayTasks = useMemo(
    () => tasks.filter((t) => t.dueDate === selectedDate),
    [tasks, selectedDate],
  );

  return (
    <div className="space-y-5">
      {/* Encabezado y selector Día / Semana */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calendario</h1>
          <p className="text-sm text-slate-600">Consulta tus clases y entregas por día o por semana.</p>
        </div>

        <div className="grid grid-cols-2 p-1 bg-slate-200/75 rounded-xl w-full sm:w-auto sm:min-w-[240px]">
          <button
            type="button"
            onClick={() => setViewMode('dia')}
            className={`min-h-[44px] px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
              viewMode === 'dia' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Por día
          </button>
          <button
            type="button"
            onClick={() => setViewMode('semana')}
            className={`min-h-[44px] px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
              viewMode === 'semana' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Por semana
          </button>
        </div>
      </div>

      {/* Navegación semanal */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setSelectedDate((d) => shiftISOByDays(d, -7))}
            className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 inline-flex items-center gap-1 hover:bg-slate-50 transition-colors"
            aria-label="Semana anterior"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            <span className="hidden sm:inline">Semana anterior</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedDate(todayISO)}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 text-sm font-semibold text-slate-800 hover:bg-slate-200 transition-colors"
          >
            Ir a hoy
          </button>

          <button
            type="button"
            onClick={() => setSelectedDate((d) => shiftISOByDays(d, 7))}
            className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 inline-flex items-center gap-1 hover:bg-slate-50 transition-colors"
            aria-label="Semana siguiente"
          >
            <span className="hidden sm:inline">Semana siguiente</span>
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Selector horizontal de días de la semana */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {weekDays.map((day) => {
            const active = day.iso === selectedDate;
            const isToday = day.iso === todayISO;
            const total = countForDay(day.iso);

            return (
              <button
                key={day.iso}
                type="button"
                onClick={() => setSelectedDate(day.iso)}
                className={`min-h-[64px] py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors border ${
                  active
                    ? 'bg-blue-700 border-blue-700 text-white'
                    : isToday
                      ? 'bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className={`text-[11px] font-medium ${active ? 'text-blue-100' : 'text-slate-500'}`}>
                  {day.dayShort}
                </span>
                <span className="text-base font-bold tabular-nums">{day.dayNumber}</span>
                <span
                  className={`text-[11px] tabular-nums ${
                    active ? 'text-blue-100' : total > 0 ? 'text-blue-700 font-semibold' : 'text-slate-400'
                  }`}
                >
                  {total > 0 ? `${total} act.` : '—'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {viewMode === 'dia' ? (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 capitalize">
                {formatLongSpanishDate(selectedDate)}
              </h2>
              <p className="text-sm text-slate-600">{formatFriendlyDate(selectedDate)}</p>
            </div>

            <div className="grid grid-cols-2 sm:flex gap-2">
              <button
                type="button"
                onClick={() => onAddClassForDate(selectedDate)}
                className="min-h-[48px] px-4 py-2.5 rounded-xl bg-blue-700 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-blue-800 transition-colors"
              >
                <CalendarPlus className="w-4 h-4" aria-hidden="true" />
                <span>Agregar clase</span>
              </button>
              <button
                type="button"
                onClick={() => onAddTaskForDate(selectedDate)}
                className="min-h-[48px] px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
              >
                <ListPlus className="w-4 h-4 text-blue-700" aria-hidden="true" />
                <span>Agregar tarea</span>
              </button>
            </div>
          </div>

          {dayClasses.length === 0 && dayTasks.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-2">
              <p className="text-base font-medium text-slate-700">
                No hay clases ni entregas programadas para este día.
              </p>
              <p className="text-sm text-slate-500">
                Usa los botones de arriba para agregar una clase o tarea en esta fecha.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {dayClasses.map((cls) => (
                <article
                  key={cls.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500">
                        <span className="text-blue-700 font-semibold">Clase</span>
                        <span aria-hidden="true"> · </span>
                        <span>{cls.topic}</span>
                        <span aria-hidden="true"> · </span>
                        <span className="font-mono tabular-nums">{cls.startTime}</span>
                      </p>
                      <h3 className="text-lg font-semibold text-slate-900">{cls.title}</h3>
                    </div>
                    <PriorityBadge priority={cls.priority} />
                  </div>

                  <p className="text-sm text-slate-600 inline-flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" aria-hidden="true" />
                    <span className="tabular-nums">{cls.durationMinutes} min</span>
                    {cls.location && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{cls.location}</span>
                      </>
                    )}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEditClass(cls)}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 inline-flex items-center gap-1.5 hover:bg-slate-50 transition-colors"
                    >
                      <Pencil className="w-4 h-4" aria-hidden="true" />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteClass(cls)}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-red-700 inline-flex items-center gap-1.5 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </article>
              ))}

              {dayTasks.map((task) => (
                <article
                  key={task.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleTask(task)}
                      aria-label={
                        task.completed ? `Marcar "${task.title}" como pendiente` : `Marcar "${task.title}" como completada`
                      }
                      className="min-h-[44px] min-w-[44px] -ml-1.5 -mt-1.5 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-7 h-7 text-emerald-600" aria-hidden="true" />
                      ) : (
                        <Circle className="w-7 h-7 text-slate-400" aria-hidden="true" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-medium text-slate-500">
                          <span className={task.completed ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                            Entrega ({task.completed ? 'Completada' : 'Pendiente'})
                          </span>
                          <span aria-hidden="true"> · </span>
                          <span>{task.topic}</span>
                        </p>
                        <PriorityBadge priority={task.priority} />
                      </div>
                      <h3
                        className={`text-lg font-semibold ${
                          task.completed ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-slate-600">{task.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEditTask(task)}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 inline-flex items-center gap-1.5 hover:bg-slate-50 transition-colors"
                    >
                      <Pencil className="w-4 h-4" aria-hidden="true" />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteTask(task)}
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
      ) : (
        /* Vista por semana */
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Actividades de la semana</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weekDays.map((day) => {
              const itemsClasses = classes
                .filter((c) => c.date === day.iso)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));
              const itemsTasks = tasks.filter((t) => t.dueDate === day.iso);
              const isToday = day.iso === todayISO;

              return (
                <div
                  key={day.iso}
                  className={`bg-white border rounded-2xl p-4 space-y-3 ${
                    isToday ? 'border-blue-300' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 capitalize">
                        {day.dayShort} {day.dayNumber} {day.monthShort}
                      </h3>
                      {isToday && <p className="text-xs font-semibold text-blue-700">Hoy</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDate(day.iso);
                        setViewMode('dia');
                      }}
                      className="min-h-[44px] px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
                    >
                      Ver día
                    </button>
                  </div>

                  {itemsClasses.length === 0 && itemsTasks.length === 0 ? (
                    <p className="text-sm text-slate-400 py-2">Sin actividades programadas</p>
                  ) : (
                    <ul className="space-y-2.5">
                      {itemsClasses.map((cls) => (
                        <li key={cls.id} className="text-sm space-y-0.5">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-blue-700 font-mono tabular-nums">
                              Clase · {cls.startTime}
                            </p>
                            <PriorityBadge priority={cls.priority} />
                          </div>
                          <p className="font-semibold text-slate-900">{cls.title}</p>
                        </li>
                      ))}
                      {itemsTasks.map((tsk) => (
                        <li key={tsk.id} className="text-sm space-y-0.5">
                          <div className="flex items-center justify-between">
                            <p
                              className={`text-xs font-medium ${
                                tsk.completed ? 'text-emerald-700' : 'text-amber-700'
                              }`}
                            >
                              Entrega · {tsk.completed ? 'Completada' : 'Pendiente'}
                            </p>
                            <PriorityBadge priority={tsk.priority} />
                          </div>
                          <p className={`font-semibold ${tsk.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                            {tsk.title}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
