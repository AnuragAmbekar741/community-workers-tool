const WORKER_ID_PATTERN = /^CW(\d{4})$/;
const SESSION_ID_PATTERN = /^SESS(\d{6})$/;

export function formatWorkerId(seq: number): string {
  return `CW${String(seq).padStart(4, "0")}`;
}

export function formatSessionId(seq: number): string {
  return `SESS${String(seq).padStart(6, "0")}`;
}

export function parseWorkerId(id: string): number | null {
  const match = WORKER_ID_PATTERN.exec(id);
  if (!match?.[1]) return null;
  const seq = Number.parseInt(match[1], 10);
  return Number.isNaN(seq) ? null : seq;
}

export function parseSessionId(id: string): number | null {
  const match = SESSION_ID_PATTERN.exec(id);
  if (!match?.[1]) return null;
  const seq = Number.parseInt(match[1], 10);
  return Number.isNaN(seq) ? null : seq;
}

export function nextWorkerIdFromMax(maxId: string | null): string {
  const current = maxId ? parseWorkerId(maxId) : null;
  const next = current === null ? 1 : current + 1;
  return formatWorkerId(next);
}

export function nextSessionIdFromMax(maxId: string | null): string {
  const current = maxId ? parseSessionId(maxId) : null;
  const next = current === null ? 1 : current + 1;
  return formatSessionId(next);
}
