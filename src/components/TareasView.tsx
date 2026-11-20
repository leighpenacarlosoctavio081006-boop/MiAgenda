import React, { useMemo, useState } from 'react';
import { CheckCircle2, Circle, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { formatFriendlyDate } from '../lib/dateUtils';
import { CourseTask, PriorityLevel } from '../types/agenda';

interface TareasViewProps {
  tasks: CourseTask[];
  onAddTask: () => void;
  onEditTask: (task: CourseTask) => void;
  onDeleteTask: (task: CourseTask) => void;
  onToggleTask: (task: CourseTask) => void;
}

type TaskFilter = 'todas' | 'pendientes' | 'completadas';
type PriorityFilter = 'todas' | 'alta' | 'media' | 'baja';

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

export function TareasView({
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleTask,
}: TareasViewProps) {
  const [filter, setFilter] = useState<TaskFilter>('todas');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('todas');
  const [searchTerm, setSearchTerm] = useState('');

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const percentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const visibleTasks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const filtered = tasks.filter((t) => {
      const matchesFilter =
        filter === 'todas'
          ? true
          : filter === 'pendientes'
            ? !t.completed
            : t.completed;

      const matchesSearch =
        !query ||
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.topic.toLowerCase().includes(query);

      const matchesPriority =
        priorityFilter === 'todas' || (t.priority || 'media') === priorityFilter;

      return matchesFilter && matchesSearch && matchesPriority;
    });

    return [...filtered].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }, [tasks, filter, priorityFilter, searchTerm]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tareas</h1>
          <p className="text-sm text-slate-600">
            Organiza tus entregas del curso y márcalas al terminar.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddTask}
          className="w-full sm:w-auto min-h-[48px] px-5 py-3 rounded-xl bg-blue-700 text-white font-semibold text-base inline-flex items-center justify-center gap-2 hover:bg-blue-800 active:scale-[0.99] transition-all"
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          <span>Nueva tarea</span>
        </button>
      </div>

      {/* Tarjeta de resumen de progreso con barra visual */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-0.5">
          <p className="text-sm font-bold text-slate-900">Progreso general de tareas</p>
          <p className="text-xs text-slate-600">
            {completedCount} de {totalTasks} completadas
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-56">
          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-700 rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-sm font-bold text-slate-900 tabular-nums shrink-0">{percentage}%</span>
        </div>
      </div>

      {/* Barra de búsqueda en tiempo real */}
      <div className="relative">
        <Search
          className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar tarea por nombre..."
          aria-label="Buscar tarea por nombre"
          className="w-full min-h-[48px] pl-11 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      {/* Selector de filtros por prioridad debajo de la barra de búsqueda */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-slate-500 shrink-0 mr-1">Prioridad:</span>
        <button
          type="button"
          onClick={() => setPriorityFilter('todas')}
          className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
            priorityFilter === 'todas' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Todas
        </button>
        <button
          type="button"
          onClick={() => setPriorityFilter('alta')}
          className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
            priorityFilter === 'alta' ? 'bg-red-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Alta
        </button>
        <button
          type="button"
          onClick={() => setPriorityFilter('media')}
          className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
            priorityFilter === 'media' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Media
        </button>
        <button
          type="button"
          onClick={() => setPriorityFilter('baja')}
          className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
            priorityFilter === 'baja' ? 'bg-slate-700 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Baja
        </button>
      </div>

      {/* Filtro interactivo de estado */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/75 rounded-xl max-w-md">
        <button
          type="button"
          onClick={() => setFilter('todas')}
          className={`min-h-[44px] px-3 py-2 rounded-lg text-sm font-semibold transition-colors tabular-nums ${
            filter === 'todas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          Todas ({tasks.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('pendientes')}
          className={`min-h-[44px] px-3 py-2 rounded-lg text-sm font-semibold transition-colors tabular-nums ${
            filter === 'pendientes' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          Pendientes ({pendingCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('completadas')}
          className={`min-h-[44px] px-3 py-2 rounded-lg text-sm font-semibold transition-colors tabular-nums ${
            filter === 'completadas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          Hechas ({completedCount})
        </button>
      </div>

      {visibleTasks.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-3">
          <p className="text-base text-slate-600">
            {searchTerm || priorityFilter !== 'todas'
              ? 'No se encontraron tareas con los filtros seleccionados.'
              : filter === 'pendientes'
                ? 'No tienes tareas pendientes en este momento.'
                : filter === 'completadas'
                  ? 'Aún no has completado ninguna tarea.'
                  : 'No tienes tareas registradas todavía.'}
          </p>
          <button
            type="button"
            onClick={onAddTask}
            className="min-h-[48px] px-5 py-3 rounded-xl bg-blue-700 text-white font-semibold text-base hover:bg-blue-800 transition-colors"
          >
            Agregar tarea
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {visibleTasks.map((task) => (
            <article
              key={task.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4"
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

                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-slate-500">
                      <span className={task.completed ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                        {task.completed ? 'Completada' : 'Pendiente'}
                      </span>
                      <span aria-hidden="true"> · </span>
                      <span>{task.topic}</span>
                      <span aria-hidden="true"> · </span>
                      <span className="font-mono tabular-nums">
                        {formatFriendlyDate(task.dueDate)}
                      </span>
                    </p>
                    <PriorityBadge priority={task.priority} />
                  </div>
                  <h2
                    className={`text-lg font-semibold leading-snug ${
                      task.completed ? 'line-through text-slate-500' : 'text-slate-900'
                    }`}
                  >
                    {task.title}
                  </h2>
                  {task.description && (
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onToggleTask(task)}
                  className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    task.completed
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  {task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                </button>

                <div className="flex items-center gap-2">
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
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
