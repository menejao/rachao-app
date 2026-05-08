export function matchesCron(expression: string, date: Date) {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error(`Invalid cron expression: ${expression}`);
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  return (
    matchesField(minute, date.getMinutes()) &&
    matchesField(hour, date.getHours()) &&
    matchesField(dayOfMonth, date.getDate()) &&
    matchesField(month, date.getMonth() + 1) &&
    matchesField(dayOfWeek, date.getDay())
  );
}

function matchesField(field: string, value: number) {
  if (field === "*") {
    return true;
  }

  return field.split(",").some((entry) => {
    const normalized = entry.trim();
    if (!normalized) {
      return false;
    }

    if (normalized.includes("-")) {
      const [start, end] = normalized.split("-").map(Number);
      return value >= start && value <= end;
    }

    return Number(normalized) === value;
  });
}

export function getMinuteKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`;
}
