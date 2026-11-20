/**
 * Validacion sincronizada con firebase-blueprint.json y firestore.rules
 */
export const ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_PATTERN = /^\d{2}:\d{2}$/;

export const LIMITS = {
  idMax: 128,
  classTitleMax: 140,
  taskTitleMax: 160,
  noteTitleMax: 160,
  topicMax: 80,
  descriptionMax: 1000,
  noteContentMax: 5000,
  instructorMax: 80,
  locationMax: 120,
  durationMin: 15,
  durationMax: 480,
} as const;

export function generateSafeId(prefix: string): string {
  const randomPart =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
      : `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  return `${prefix}_${randomPart}`.slice(0, LIMITS.idMax);
}

export function sanitizeText(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

export function clampDuration(minutes: number): number {
  if (!Number.isFinite(minutes)) return 60;
  return Math.max(LIMITS.durationMin, Math.min(LIMITS.durationMax, Math.round(minutes)));
}

export function isValidDateStr(value: string): boolean {
  return DATE_PATTERN.test(value);
}

export function isValidTimeStr(value: string): boolean {
  return TIME_PATTERN.test(value);
}
