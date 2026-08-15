import type { DailySummary } from '@/health/types';

export function buildInsightsPrompt(summaries: DailySummary[]): string {
  const recent = summaries.slice(-14);
  const withSteps = recent.filter((s) => s.steps != null);
  const withSleep = recent.filter((s) => s.sleepHours != null);
  const withRhr = recent.filter((s) => s.restingHeartRate != null);

  const avg = (vals: number[]) =>
    vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;

  const avgSteps = avg(withSteps.map((s) => s.steps!));
  const avgSleep = avg(withSleep.map((s) => s.sleepHours!));
  const avgRhr = avg(withRhr.map((s) => s.restingHeartRate!));

  const lines = [
    `Days with data: ${recent.filter((s) => !s.steps && !s.sleepHours ? false : true).length}/14`,
    avgSteps != null ? `Avg steps (14d): ${Math.round(avgSteps)}` : 'Steps: sparse',
    avgSleep != null ? `Avg sleep (14d): ${avgSleep.toFixed(1)} h` : 'Sleep: sparse',
    avgRhr != null ? `Avg resting HR (14d): ${Math.round(avgRhr)} bpm` : 'Resting HR: sparse',
    `Latest day steps: ${recent.at(-1)?.steps ?? '—'}`,
    `Latest sleep hours: ${recent.at(-1)?.sleepHours ?? '—'}`,
  ];

  return `Apple Health summary (last 14 days):\n${lines.map((l) => `- ${l}`).join('\n')}`;
}
