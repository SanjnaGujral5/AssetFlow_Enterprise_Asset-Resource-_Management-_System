export interface SchedulePeriod {
  startTime: string;
  endTime: string;
}

export function hasOverlap(a: SchedulePeriod, b: SchedulePeriod) {
  const startA = new Date(a.startTime).getTime();
  const endA = new Date(a.endTime).getTime();
  const startB = new Date(b.startTime).getTime();
  const endB = new Date(b.endTime).getTime();

  return startA < endB && startB < endA;
}

export function formatLocalDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatLocalTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}
