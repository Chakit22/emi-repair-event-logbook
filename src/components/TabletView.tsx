import { useState } from 'react';
import {
  MILESTONE_LABELS,
  calculateMetrics,
  findMilestoneEntry,
  formatMinutes,
  formatTime,
  getNextMilestone,
  isCaptureOpen,
  sortTimelineEntries,
} from '../lib/repairHelpers';
import { MILESTONE_SEQUENCE, type AnnotationKind, type Entry, type MilestoneKind, type RepairEvent } from '../lib/types';

type TabletViewProps = {
  event: RepairEvent;
  onMilestoneTap: (kind: MilestoneKind) => void;
  onSaveAnnotation: (kind: AnnotationKind, text: string) => void;
  onStartNewRepair: () => void;
};

const ANNOTATION_KINDS: AnnotationKind[] = ['Finding', 'Action', 'Part', 'Note'];

const phaseClasses: Record<MilestoneKind, string> = {
  StartBreakdown: 'phase-red',
  ArrivedAtMachine: 'phase-orange',
  ProblemIdentified: 'phase-gold',
  StartRepair: 'phase-orange',
  RepairComplete: 'phase-green',
  ReturnToService: 'phase-green',
};

export function TabletView({ event, onMilestoneTap, onSaveAnnotation, onStartNewRepair }: TabletViewProps) {
  const [modalKind, setModalKind] = useState<AnnotationKind | null>(null);
  const metrics = calculateMetrics(event);
  const nextMilestone = getNextMilestone(event);
  const annotations = sortTimelineEntries(event.entries).filter((entry) => entry.type === 'annotation');
  const captureOpen = isCaptureOpen(event);

  return (
    <main className="tablet-shell">
      <section className="repair-summary">
        <div>
          <div className="eyebrow">{event.status === 'Completed' ? 'Repair complete' : 'Active repair'}</div>
          <h1>{event.asset}</h1>
          <p>
            {event.system} · Registered by {event.registeredBy}
          </p>
        </div>
        <div className="summary-metric">
          <span className={`status-pill status-${event.status.toLowerCase()}`}>{event.status}</span>
          <strong>{formatMinutes(metrics.total.minutes)}</strong>
          <span>{event.status === 'Completed' ? 'Total downtime' : 'Elapsed'}</span>
        </div>
      </section>

      <section className="milestone-grid" aria-label="Milestones">
        {MILESTONE_SEQUENCE.map((kind, index) => (
          <MilestoneButton
            key={kind}
            kind={kind}
            number={index + 1}
            entry={findMilestoneEntry(event, kind)}
            isNext={nextMilestone === kind}
            onTap={() => onMilestoneTap(kind)}
          />
        ))}
      </section>

      {event.status !== 'Completed' ? (
        <section className="annotation-actions" aria-label="Between milestones">
          <h2>Between milestones</h2>
          <div className="action-row">
            {ANNOTATION_KINDS.map((kind) => (
              <button key={kind} type="button" disabled={!captureOpen} onClick={() => setModalKind(kind)}>
                Add {kind}
              </button>
            ))}
            <button type="button" disabled title="Not in v1">
              Add Photo
            </button>
            <button type="button" disabled title="Not in v1">
              Record Audio
            </button>
          </div>
        </section>
      ) : (
        <div className="completed-action">
          <button type="button" onClick={onStartNewRepair}>
            Start a new repair
          </button>
        </div>
      )}

      <RecentEntries entries={annotations} />

      {modalKind ? (
        <AnnotationModal
          kind={modalKind}
          onCancel={() => setModalKind(null)}
          onSave={(text) => {
            onSaveAnnotation(modalKind, text);
            setModalKind(null);
          }}
        />
      ) : null}
    </main>
  );
}

type MilestoneButtonProps = {
  kind: MilestoneKind;
  number: number;
  entry?: Extract<Entry, { type: 'milestone' }>;
  isNext: boolean;
  onTap: () => void;
};

function MilestoneButton({ kind, number, entry, isNext, onTap }: MilestoneButtonProps) {
  const complete = Boolean(entry);
  const locked = !complete && !isNext;

  return (
    <button
      type="button"
      className={`milestone-tile ${phaseClasses[kind]} ${complete ? 'complete' : ''} ${isNext ? 'next' : ''}`}
      disabled={locked || complete}
      onClick={onTap}
    >
      <span className="milestone-number">
        {number}
        {complete ? ' ✓' : ''}
      </span>
      <span className="milestone-label">{MILESTONE_LABELS[kind]}</span>
      {entry ? (
        <span className="milestone-meta">
          {formatTime(entry.at)}
          <br />
          {entry.by}
        </span>
      ) : (
        <span className="milestone-meta">{isNext ? 'Next tap' : 'Locked'}</span>
      )}
    </button>
  );
}

type AnnotationModalProps = {
  kind: AnnotationKind;
  onCancel: () => void;
  onSave: (text: string) => void;
};

function AnnotationModal({ kind, onCancel, onSave }: AnnotationModalProps) {
  const [text, setText] = useState('');
  const trimmed = text.trim();

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="annotation-modal" role="dialog" aria-modal="true" aria-labelledby="annotation-title">
        <header>
          <span>Annotation</span>
          <h2 id="annotation-title">Add {kind.toLowerCase()}</h2>
        </header>
        <textarea value={text} autoFocus onChange={(event) => setText(event.target.value)} />
        <footer>
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" disabled={!trimmed} onClick={() => onSave(trimmed)}>
            Save
          </button>
        </footer>
      </div>
    </div>
  );
}

function RecentEntries({ entries }: { entries: Entry[] }) {
  return (
    <section className="recent-entries">
      <h2>Recent entries</h2>
      {entries.length === 0 ? (
        <p>No annotations yet.</p>
      ) : (
        <ol>
          {entries.map((entry) => (
            <li key={`${entry.at}-${entry.kind}`}>
              <time>{formatTime(entry.at)}</time>
              <strong>{entry.kind}</strong>
              <span>{entry.type === 'annotation' ? entry.text : ''}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
