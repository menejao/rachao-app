"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchesCron = matchesCron;
exports.getMinuteKey = getMinuteKey;
function matchesCron(expression, date) {
    const parts = expression.trim().split(/\s+/);
    if (parts.length !== 5) {
        throw new Error(`Invalid cron expression: ${expression}`);
    }
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    return (matchesField(minute, date.getMinutes()) &&
        matchesField(hour, date.getHours()) &&
        matchesField(dayOfMonth, date.getDate()) &&
        matchesField(month, date.getMonth() + 1) &&
        matchesField(dayOfWeek, date.getDay()));
}
function matchesField(field, value) {
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
function getMinuteKey(date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`;
}
