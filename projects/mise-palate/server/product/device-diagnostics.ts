export function boundedMilliseconds(value: number | null | undefined, max = 120_000) {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  return Math.max(0, Math.min(max, Math.round(value)));
}

export function medianMilliseconds(values: number[]) {
  const valid = values.filter(value => Number.isFinite(value) && value >= 0 && value <= 120_000).sort((a, b) => a - b);
  if (!valid.length) return null;
  const midpoint = Math.floor(valid.length / 2);
  return valid.length % 2 ? Math.round(valid[midpoint]) : Math.round((valid[midpoint - 1] + valid[midpoint]) / 2);
}

export function successRate(successfulTrials: number, trialCount: number) {
  if (trialCount <= 0) return 0;
  return Math.round((Math.max(0, Math.min(successfulTrials, trialCount)) / trialCount) * 100);
}
