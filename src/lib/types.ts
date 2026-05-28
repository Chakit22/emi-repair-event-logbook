/**
 * Domain types for the Repair Event exercise.
 *
 * You can extend, narrow, or replace these. They're a starting point.
 * See BRIEF.md and design-reference/mockup.md for behaviour.
 */

export type MilestoneKind =
  | 'StartBreakdown'
  | 'ArrivedAtMachine'
  | 'ProblemIdentified'
  | 'StartRepair'
  | 'RepairComplete'
  | 'ReturnToService';

export type AnnotationKind = 'Finding' | 'Action' | 'Part' | 'Note';

export type RepairStatus = 'Active' | 'Stopped' | 'Completed';

export type ISODateString = string;

export type Entry =
  | {
      type: 'milestone';
      kind: MilestoneKind;
      at: ISODateString;
      by: string;
    }
  | {
      type: 'annotation';
      kind: AnnotationKind;
      at: ISODateString;
      by: string;
      text: string;
    };

export type RepairEvent = {
  id: string;
  asset: string;
  system: string;
  registeredBy: string;
  registeredAt: ISODateString;
  status: RepairStatus;
  entries: Entry[];
};

/**
 * The ordered milestone sequence. The next-tappable milestone is the first
 * one in this list that doesn't yet appear in the event's entries.
 */
export const MILESTONE_SEQUENCE: readonly MilestoneKind[] = [
  'StartBreakdown',
  'ArrivedAtMachine',
  'ProblemIdentified',
  'StartRepair',
  'RepairComplete',
  'ReturnToService',
] as const;
