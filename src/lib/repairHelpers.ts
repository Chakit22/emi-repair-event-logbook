import { MILESTONE_SEQUENCE, type Entry, type MilestoneKind, type RepairEvent } from './types';

export type MetricKey = 'response' | 'diagnosis' | 'repair' | 'total';
export type MetricStatus = 'good' | 'ok' | 'bad';

export type Metric = {
  label: string;
  minutes: number | null;
  status: MetricStatus | null;
};

const METRIC_THRESHOLDS: Record<MetricKey, { good: number; ok: number }> = {
  response: { good: 15, ok: 30 },
  diagnosis: { good: 20, ok: 45 },
  repair: { good: 60, ok: 120 },
  total: { good: 90, ok: 180 },
};

export const MILESTONE_LABELS: Record<MilestoneKind, string> = {
  StartBreakdown: 'Start Breakdown',
  ArrivedAtMachine: 'Arrived at Machine',
  ProblemIdentified: 'Problem Identified',
  StartRepair: 'Start Repair',
  RepairComplete: 'Repair Complete',
  ReturnToService: 'Return to Service',
};

export const MILESTONE_EVENT_LABELS: Record<MilestoneKind, string> = {
  StartBreakdown: 'Breakdown reported',
  ArrivedAtMachine: 'Technician arrived',
  ProblemIdentified: 'Problem identified',
  StartRepair: 'Repair started',
  RepairComplete: 'Repair complete',
  ReturnToService: 'Return to service',
};

export function findMilestoneEntry(event: RepairEvent, kind: MilestoneKind): Extract<Entry, { type: 'milestone' }> | undefined {
  return event.entries.find((entry) => entry.type === 'milestone' && entry.kind === kind) as
    | Extract<Entry, { type: 'milestone' }>
    | undefined;
}

export function getNextMilestone(event: RepairEvent): MilestoneKind | null {
  return MILESTONE_SEQUENCE.find((kind) => !findMilestoneEntry(event, kind)) ?? null;
}

export function isCaptureOpen(event: RepairEvent): boolean {
  return Boolean(findMilestoneEntry(event, 'StartBreakdown')) && !findMilestoneEntry(event, 'ReturnToService');
}

export function sortTimelineEntries(entries: readonly Entry[]): Entry[] {
  return [...entries].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

export function getMostRecentEvent(events: readonly RepairEvent[]): RepairEvent | null {
  return events.reduce<RepairEvent | null>((mostRecent, event) => {
    if (!mostRecent) return event;
    return new Date(event.registeredAt).getTime() > new Date(mostRecent.registeredAt).getTime() ? event : mostRecent;
  }, null);
}

export function minutesBetween(start?: Entry, end?: Entry): number | null {
  if (!start || !end) return null;
  return Math.max(0, Math.round((new Date(end.at).getTime() - new Date(start.at).getTime()) / 60_000));
}

function milestoneMinutes(event: RepairEvent, start: MilestoneKind, end: MilestoneKind): number | null {
  return minutesBetween(findMilestoneEntry(event, start), findMilestoneEntry(event, end));
}

export function getMetricStatus(key: MetricKey, minutes: number): MetricStatus {
  const threshold = METRIC_THRESHOLDS[key];
  if (minutes <= threshold.good) return 'good';
  if (minutes <= threshold.ok) return 'ok';
  return 'bad';
}

export function calculateMetrics(event: RepairEvent): Record<MetricKey, Metric> {
  // Metrics are derived entirely from milestone pairs; annotations never affect durations.
  const metricPairs: Record<MetricKey, { label: string; start: MilestoneKind; end: MilestoneKind }> = {
    response: { label: 'Response time', start: 'StartBreakdown', end: 'ArrivedAtMachine' },
    diagnosis: { label: 'Diagnosis time', start: 'ArrivedAtMachine', end: 'ProblemIdentified' },
    repair: { label: 'Repair time', start: 'StartRepair', end: 'RepairComplete' },
    total: { label: 'Total downtime', start: 'StartBreakdown', end: 'ReturnToService' },
  };

  return Object.fromEntries(
    Object.entries(metricPairs).map(([key, metric]) => {
      const metricKey = key as MetricKey;
      const minutes = milestoneMinutes(event, metric.start, metric.end);
      return [
        metricKey,
        {
          label: metric.label,
          minutes,
          status: minutes === null ? null : getMetricStatus(metricKey, minutes),
        },
      ];
    }),
  ) as Record<MetricKey, Metric>;
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}

export function formatMinutes(minutes: number | null): string {
  return minutes === null ? '-' : `${minutes} min`;
}

export function createNewActiveRepairEvent(events: readonly RepairEvent[], now = new Date()): RepairEvent {
  // Demo creation avoids a form, but IDs still advance from the highest existing RE-####.
  const highestId = events.reduce((highest, event) => {
    const match = /^RE-(\d+)$/.exec(event.id);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);

  return {
    id: `RE-${String(highestId + 1).padStart(4, '0')}`,
    asset: 'CAT 793F #12',
    system: 'Hydraulic',
    registeredBy: 'J Smith',
    registeredAt: now.toISOString(),
    status: 'Active',
    entries: [],
  };
}

export function appendMilestoneEntry(event: RepairEvent, kind: MilestoneKind, at = new Date().toISOString(), by = 'J Smith'): RepairEvent {
  return {
    ...event,
    status: kind === 'ReturnToService' ? 'Completed' : event.status,
    entries: [...event.entries, { type: 'milestone', kind, at, by }],
  };
}

export function getLastEntry(event: RepairEvent): Entry | undefined {
  return sortTimelineEntries(event.entries).at(-1);
}
