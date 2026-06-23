import { ValidationError } from "./errors.js";

export interface AttendanceInput {
  nWomen: number;
  nMen: number;
  nGirls: number;
  nBoys: number;
  nElders: number;
  nOthers: number;
}

export function computeTotalReached(attendance: AttendanceInput): number {
  return (
    attendance.nWomen +
    attendance.nMen +
    attendance.nGirls +
    attendance.nBoys +
    attendance.nElders +
    attendance.nOthers
  );
}

export function assertTotalReachedNonZero(total: number): void {
  if (total === 0) {
    throw new ValidationError("Total reached must be greater than zero");
  }
}

export function assertSessionDateNotFuture(dateStr: string): void {
  const sessionDate = parseDateOnly(dateStr);
  const today = startOfUtcDay(new Date());

  if (sessionDate.getTime() > today.getTime()) {
    throw new ValidationError("Session date cannot be in the future");
  }
}
function parseDateOnly(dateStr: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) {
    throw new ValidationError("Session date must be in YYYY-MM-DD format");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new ValidationError("Session date is invalid");
  }

  return date;
}

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}
