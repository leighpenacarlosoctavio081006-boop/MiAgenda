export type AppSection = 'inicio' | 'calendario' | 'tareas' | 'notas' | 'progreso';

export type PriorityLevel = 'baja' | 'media' | 'alta';

export const COURSE_TOPICS = [
  'Fundamentos de AI Studio',
  'Diseño de Prompts',
  'Multimodalidad',
  'Function Calling y API',
  'Grounding y Despliegue',
] as const;

export interface CourseClass {
  id: string;
  ownerId: string;
  title: string;
  topic: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  durationMinutes: number;
  instructor: string;
  location: string;
  priority: PriorityLevel;
}

export interface CourseTask {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  topic: string;
  completed: boolean;
  priority: PriorityLevel;
}

export interface CourseNote {
  id: string;
  ownerId: string;
  title: string;
  topic: string;
  content: string;
  date: string; // YYYY-MM-DD
}
