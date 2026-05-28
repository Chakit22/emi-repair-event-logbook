import { describe, expect, it } from 'vitest';
import {
  appendMilestoneEntry,
  calculateMetrics,
  getMetricStatus,
  getMostRecentEvent,
  getNextMilestone,
  sortTimelineEntries,
} from './repairHelpers';
import type { Entry, RepairEvent } from './types';

const baseEvent: RepairEvent = {
  id: 'RE-9999',
  asset: 'CAT 793F #12',
  system: 'Hydraulic',
  registeredBy: 'J Smith',
  registeredAt: '2026-05-28T00:00:00.000Z',
  status: 'Active',
  entries: [],
};

describe('repair helper logic', () => {
  it('returns StartBreakdown as the next milestone for an empty event', () => {
    expect(getNextMilestone(baseEvent)).toBe('StartBreakdown');
  });

  it('advances next milestone after completed milestone entries', () => {
    const event = appendMilestoneEntry(baseEvent, 'StartBreakdown', '2026-05-28T01:00:00.000Z');

    expect(getNextMilestone(event)).toBe('ArrivedAtMachine');
  });

  it('returns no next milestone after ReturnToService', () => {
    const entries: Entry[] = [
      { type: 'milestone', kind: 'StartBreakdown', at: '2026-05-28T01:00:00.000Z', by: 'J Smith' },
      { type: 'milestone', kind: 'ArrivedAtMachine', at: '2026-05-28T01:10:00.000Z', by: 'J Smith' },
      { type: 'milestone', kind: 'ProblemIdentified', at: '2026-05-28T01:20:00.000Z', by: 'J Smith' },
      { type: 'milestone', kind: 'StartRepair', at: '2026-05-28T01:25:00.000Z', by: 'J Smith' },
      { type: 'milestone', kind: 'RepairComplete', at: '2026-05-28T02:00:00.000Z', by: 'J Smith' },
      { type: 'milestone', kind: 'ReturnToService', at: '2026-05-28T02:05:00.000Z', by: 'J Smith' },
    ];

    expect(getNextMilestone({ ...baseEvent, entries })).toBeNull();
  });

  it('sorts timeline entries chronologically', () => {
    const entries: Entry[] = [
      { type: 'annotation', kind: 'Note', at: '2026-05-28T01:20:00.000Z', by: 'J Smith', text: 'later' },
      { type: 'milestone', kind: 'StartBreakdown', at: '2026-05-28T01:00:00.000Z', by: 'J Smith' },
      { type: 'annotation', kind: 'Finding', at: '2026-05-28T01:10:00.000Z', by: 'J Smith', text: 'middle' },
    ];

    expect(sortTimelineEntries(entries).map((entry) => entry.at)).toEqual([
      '2026-05-28T01:00:00.000Z',
      '2026-05-28T01:10:00.000Z',
      '2026-05-28T01:20:00.000Z',
    ]);
  });

  it('selects the most recent event by registeredAt instead of array position', () => {
    const oldest: RepairEvent = { ...baseEvent, id: 'RE-1001', registeredAt: '2026-05-28T01:00:00.000Z' };
    const newest: RepairEvent = { ...baseEvent, id: 'RE-1002', registeredAt: '2026-05-28T03:00:00.000Z' };
    const middle: RepairEvent = { ...baseEvent, id: 'RE-1003', registeredAt: '2026-05-28T02:00:00.000Z' };

    expect(getMostRecentEvent([oldest, newest, middle])?.id).toBe('RE-1002');
    expect(getMostRecentEvent([])).toBeNull();
  });

  it('calculates expected metric minute durations from timestamps', () => {
    const event: RepairEvent = {
      ...baseEvent,
      status: 'Completed',
      entries: [
        { type: 'milestone', kind: 'StartBreakdown', at: '2026-05-28T01:00:00.000Z', by: 'J Smith' },
        { type: 'milestone', kind: 'ArrivedAtMachine', at: '2026-05-28T01:06:00.000Z', by: 'J Smith' },
        { type: 'milestone', kind: 'ProblemIdentified', at: '2026-05-28T01:13:00.000Z', by: 'J Smith' },
        { type: 'milestone', kind: 'StartRepair', at: '2026-05-28T01:20:00.000Z', by: 'J Smith' },
        { type: 'milestone', kind: 'RepairComplete', at: '2026-05-28T01:52:00.000Z', by: 'J Smith' },
        { type: 'milestone', kind: 'ReturnToService', at: '2026-05-28T01:53:00.000Z', by: 'J Smith' },
      ],
    };

    expect(calculateMetrics(event).response.minutes).toBe(6);
    expect(calculateMetrics(event).diagnosis.minutes).toBe(7);
    expect(calculateMetrics(event).repair.minutes).toBe(32);
    expect(calculateMetrics(event).total.minutes).toBe(53);
  });

  it('returns no value for unfinished metrics', () => {
    const event = appendMilestoneEntry(baseEvent, 'StartBreakdown', '2026-05-28T01:00:00.000Z');

    expect(calculateMetrics(event).response.minutes).toBeNull();
    expect(calculateMetrics(event).total.minutes).toBeNull();
  });

  it('assigns good, ok, and bad metric statuses using thresholds', () => {
    expect(getMetricStatus('response', 15)).toBe('good');
    expect(getMetricStatus('response', 30)).toBe('ok');
    expect(getMetricStatus('response', 31)).toBe('bad');
  });

  it('marks an event completed when appending ReturnToService', () => {
    const event = appendMilestoneEntry(baseEvent, 'ReturnToService', '2026-05-28T02:00:00.000Z');

    expect(event.status).toBe('Completed');
  });
});
