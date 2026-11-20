import { CourseClass, CourseNote, CourseTask } from '../types/agenda';

export function formatLocalDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysISO(baseDate: Date, offsetDays: number): string {
  const copy = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + offsetDays);
  return formatLocalDateISO(copy);
}

export function createSampleData(ownerId = 'local'): {
  classes: CourseClass[];
  tasks: CourseTask[];
  notes: CourseNote[];
} {
  const today = new Date();

  const classes: CourseClass[] = [
    {
      id: 'cls_ai_studio_01',
      ownerId,
      title: 'Interfaz y selección de modelos en Google AI Studio',
      topic: 'Fundamentos de AI Studio',
      date: addDaysISO(today, 0),
      startTime: '18:00',
      durationMinutes: 60,
      instructor: 'Prof. Laura Méndez',
      location: 'Sesión en vivo · Google Meet',
      priority: 'alta',
    },
    {
      id: 'cls_ai_studio_02',
      ownerId,
      title: 'System Instructions y prompts estructurados',
      topic: 'Diseño de Prompts',
      date: addDaysISO(today, 1),
      startTime: '18:30',
      durationMinutes: 75,
      instructor: 'Prof. Laura Méndez',
      location: 'Sesión en vivo · Google Meet',
      priority: 'media',
    },
    {
      id: 'cls_ai_studio_03',
      ownerId,
      title: 'Análisis multimodal con imágenes, audio y video',
      topic: 'Multimodalidad',
      date: addDaysISO(today, 2),
      startTime: '19:00',
      durationMinutes: 60,
      instructor: 'Prof. Carlos Ruiz',
      location: 'Laboratorio práctico',
      priority: 'alta',
    },
    {
      id: 'cls_ai_studio_04',
      ownerId,
      title: 'Salidas JSON y Function Calling con Gemini',
      topic: 'Function Calling y API',
      date: addDaysISO(today, 4),
      startTime: '18:00',
      durationMinutes: 90,
      instructor: 'Prof. Carlos Ruiz',
      location: 'Sesión en vivo · Google Meet',
      priority: 'alta',
    },
    {
      id: 'cls_ai_studio_05',
      ownerId,
      title: 'Grounding con Google Search y exportación de código',
      topic: 'Grounding y Despliegue',
      date: addDaysISO(today, 6),
      startTime: '17:30',
      durationMinutes: 60,
      instructor: 'Prof. Laura Méndez',
      location: 'Taller de cierre',
      priority: 'media',
    },
  ];

  const tasks: CourseTask[] = [
    {
      id: 'tsk_ai_studio_01',
      ownerId,
      title: 'Crear proyecto y generar clave de API en AI Studio',
      description: 'Ingresar a Google AI Studio, revisar los límites gratuitos y guardar una captura de la primera prueba exitosa.',
      dueDate: addDaysISO(today, -1),
      topic: 'Fundamentos de AI Studio',
      completed: true,
      priority: 'alta',
    },
    {
      id: 'tsk_ai_studio_02',
      ownerId,
      title: 'Redactar System Instructions para asistente de estudio',
      description: 'Definir tono, formato de respuesta en listas breves y ejemplos few-shot dentro del panel de instrucciones del sistema.',
      dueDate: addDaysISO(today, 0),
      topic: 'Diseño de Prompts',
      completed: true,
      priority: 'media',
    },
    {
      id: 'tsk_ai_studio_03',
      ownerId,
      title: 'Comparar temperatura 0.2 frente a 0.9 en un resumen',
      description: 'Ejecutar el mismo prompt con dos configuraciones de temperatura y anotar las diferencias de precisión y creatividad.',
      dueDate: addDaysISO(today, 1),
      topic: 'Diseño de Prompts',
      completed: false,
      priority: 'alta',
    },
    {
      id: 'tsk_ai_studio_04',
      ownerId,
      title: 'Extraer datos de un recibo con prompt multimodal',
      description: 'Subir una imagen de ejemplo en AI Studio y pedir al modelo que devuelva fecha, monto total y concepto.',
      dueDate: addDaysISO(today, 2),
      topic: 'Multimodalidad',
      completed: false,
      priority: 'media',
    },
    {
      id: 'tsk_ai_studio_05',
      ownerId,
      title: 'Definir esquema JSON para ficha de estudiante',
      description: 'Activar Structured Outputs en la barra lateral y validar que la respuesta cumpla siempre con los campos requeridos.',
      dueDate: addDaysISO(today, 4),
      topic: 'Function Calling y API',
      completed: false,
      priority: 'alta',
    },
    {
      id: 'tsk_ai_studio_06',
      ownerId,
      title: 'Exportar prompt funcional a TypeScript con @google/genai',
      description: 'Usar el botón Get Code de AI Studio, revisar el snippet generado y verificar el manejo de variables de entorno.',
      dueDate: addDaysISO(today, 6),
      topic: 'Grounding y Despliegue',
      completed: false,
      priority: 'baja',
    },
  ];

  const notes: CourseNote[] = [
    {
      id: 'nte_ai_studio_01',
      ownerId,
      title: 'Diferencias entre Gemini Flash y Gemini Pro',
      topic: 'Fundamentos de AI Studio',
      date: addDaysISO(today, -1),
      content:
        'Gemini Flash ofrece respuestas muy rápidas y bajo costo para tareas interactivas, clasificación y resúmenes diarios. Gemini Pro destaca en razonamiento complejo, programación extensa y análisis profundo de documentos largos.',
    },
    {
      id: 'nte_ai_studio_02',
      ownerId,
      title: 'Cómo ajustar Temperature y Top-P sin perder claridad',
      topic: 'Diseño de Prompts',
      date: addDaysISO(today, 0),
      content:
        'Para extraer datos o responder preguntas técnicas conviene usar Temperature entre 0.0 y 0.3. Cuando buscamos lluvia de ideas o redacción creativa, subir a 0.7 o 0.9 permite mayor variedad sin romper el formato si las System Instructions son claras.',
    },
    {
      id: 'nte_ai_studio_03',
      ownerId,
      title: 'Consejos para subir archivos e imágenes en prompts',
      topic: 'Multimodalidad',
      date: addDaysISO(today, 0),
      content:
        'Al combinar texto con imágenes o PDFs en Google AI Studio, conviene colocar la pregunta específica después del archivo adjunto e indicar explícitamente cómo responder si algún dato no es legible en la imagen.',
    },
    {
      id: 'nte_ai_studio_04',
      ownerId,
      title: 'Por qué usar Structured Outputs (JSON Schema)',
      topic: 'Function Calling y API',
      date: addDaysISO(today, 1),
      content:
        'Definir un esquema JSON en la configuración del modelo garantiza que la salida sea siempre válida y fácil de conectar con una aplicación web o móvil, evitando tener que limpiar texto libre manualmente.',
    },
    {
      id: 'nte_ai_studio_05',
      ownerId,
      title: 'Cuándo activar Grounding con Google Search',
      topic: 'Grounding y Despliegue',
      date: addDaysISO(today, 2),
      content:
        'Grounding conecta la respuesta del modelo con información actualizada de la web y muestra fuentes verificables. Es ideal cuando las preguntas dependen de eventos recientes, documentación nueva o datos cambiantes.',
    },
  ];

  return { classes, tasks, notes };
}
