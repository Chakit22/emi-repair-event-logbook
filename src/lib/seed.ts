import type { RepairEvent } from './types';

/**
 * Seed data so the admin view has something to render before a technician
 * taps anything. A handful of past breakdowns across the status range.
 *
 * Times are anchored to "yesterday" so they remain plausible no matter when
 * the app is opened. Feel free to add more, or to compute timestamps relative
 * to now if you'd rather.
 */

const yesterday = (hours: number, minutes: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

export const SEED_EVENTS: RepairEvent[] = [
  {
    id: 'RE-2401',
    asset: 'CAT 793F #12',
    system: 'Hydraulic',
    registeredBy: 'J Smith',
    registeredAt: yesterday(8, 12),
    status: 'Completed',
    entries: [
      { type: 'milestone',  kind: 'StartBreakdown',    at: yesterday(8, 12), by: 'J Smith' },
      { type: 'milestone',  kind: 'ArrivedAtMachine',  at: yesterday(8, 18), by: 'J Smith' },
      { type: 'annotation', kind: 'Finding',           at: yesterday(8, 22), by: 'J Smith',
        text: 'Hydraulic hose split near the hoist cylinder. Wet ground around the boom.' },
      { type: 'milestone',  kind: 'ProblemIdentified', at: yesterday(8, 25), by: 'J Smith' },
      { type: 'annotation', kind: 'Note',              at: yesterday(8, 27), by: 'J Smith',
        text: 'Calling M Perez over - needs two on this.' },
      { type: 'milestone',  kind: 'StartRepair',       at: yesterday(8, 30), by: 'M Perez' },
      { type: 'annotation', kind: 'Action',            at: yesterday(8, 45), by: 'M Perez',
        text: 'Hose replaced. System pressure tested.' },
      { type: 'annotation', kind: 'Part',              at: yesterday(8, 47), by: 'M Perez',
        text: 'HYD-HOSE-2456' },
      { type: 'milestone',  kind: 'RepairComplete',    at: yesterday(9, 2),  by: 'M Perez' },
      { type: 'milestone',  kind: 'ReturnToService',   at: yesterday(9, 5),  by: 'J Smith' },
    ],
  },
  {
    id: 'RE-2402',
    asset: 'KOM 980E #07',
    system: 'Drivetrain',
    registeredBy: 'A Nguyen',
    registeredAt: yesterday(11, 4),
    status: 'Completed',
    entries: [
      { type: 'milestone', kind: 'StartBreakdown',    at: yesterday(11, 4),  by: 'A Nguyen' },
      { type: 'milestone', kind: 'ArrivedAtMachine',  at: yesterday(11, 19), by: 'A Nguyen' },
      { type: 'milestone', kind: 'ProblemIdentified', at: yesterday(11, 41), by: 'A Nguyen' },
      { type: 'annotation', kind: 'Finding',          at: yesterday(11, 43), by: 'A Nguyen',
        text: 'Final drive seal failure, oil contamination evident.' },
      { type: 'milestone', kind: 'StartRepair',       at: yesterday(11, 50), by: 'A Nguyen' },
      { type: 'milestone', kind: 'RepairComplete',    at: yesterday(13, 22), by: 'A Nguyen' },
      { type: 'milestone', kind: 'ReturnToService',   at: yesterday(13, 30), by: 'A Nguyen' },
    ],
  },
  {
    id: 'RE-2403',
    asset: 'LIE R 9400 #03',
    system: 'Electrical',
    registeredBy: 'K Patel',
    registeredAt: yesterday(14, 15),
    status: 'Stopped',
    entries: [
      { type: 'milestone', kind: 'StartBreakdown',    at: yesterday(14, 15), by: 'K Patel' },
      { type: 'milestone', kind: 'ArrivedAtMachine',  at: yesterday(14, 23), by: 'K Patel' },
      { type: 'annotation', kind: 'Note',             at: yesterday(14, 31), by: 'K Patel',
        text: 'Stopped for shift change. Handing over to night crew.' },
    ],
  },
];
