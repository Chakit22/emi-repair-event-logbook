import { useMemo } from 'react';
import {
  MILESTONE_EVENT_LABELS,
  MILESTONE_LABELS,
  calculateMetrics,
  formatMinutes,
  formatTime,
  getLastEntry,
  sortTimelineEntries,
} from '../lib/repairHelpers';
import type { RepairEvent } from '../lib/types';

type AdminViewProps = {
  events: RepairEvent[];
  selectedEvent: RepairEvent;
  onSelectEvent: (eventId: string) => void;
};

export function AdminView({ events, selectedEvent, onSelectEvent }: AdminViewProps) {
  const orderedEvents = useMemo(
    () =>
      [...events].sort((a, b) => {
        // Keep active work first so the supervisor sees the live breakdown before history.
        if (a.status === 'Active' && b.status !== 'Active') return -1;
        if (b.status === 'Active' && a.status !== 'Active') return 1;
        return new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime();
      }),
    [events],
  );

  return (
    <main className="admin-shell">
      <section>
        <h1>Breakdowns</h1>
        <div className="breakdown-list">
          {orderedEvents.map((event) => (
            <BreakdownCard
              key={event.id}
              event={event}
              selected={event.id === selectedEvent.id}
              onSelect={() => onSelectEvent(event.id)}
            />
          ))}
        </div>
      </section>

      <section className="admin-detail">
        <div className="admin-detail-heading">
          <div>
            <h2>
              {selectedEvent.asset} - {selectedEvent.system}
            </h2>
            <p>Auto-generated from milestone taps and technician annotations.</p>
          </div>
          <span className={`status-pill status-${selectedEvent.status.toLowerCase()}`}>{selectedEvent.status}</span>
        </div>
        <div className="admin-grid">
          <TimelineTable event={selectedEvent} />
          <MetricsPanel event={selectedEvent} />
        </div>
      </section>
    </main>
  );
}

type BreakdownCardProps = {
  event: RepairEvent;
  selected: boolean;
  onSelect: () => void;
};

function BreakdownCard({ event, selected, onSelect }: BreakdownCardProps) {
  const metrics = calculateMetrics(event);
  const lastEntry = getLastEntry(event);
  // Completed cards summarize downtime; in-flight cards show the freshest technician tap.
  const metric = event.status === 'Completed' ? `${formatMinutes(metrics.total.minutes)} total` : `last tap ${lastEntry ? formatTime(lastEntry.at) : '-'}`;

  return (
    <button type="button" className={`breakdown-card ${selected ? 'selected' : ''} ${event.status === 'Active' ? 'active-card' : ''}`} onClick={onSelect}>
      <span>{event.id}</span>
      <strong>{event.asset}</strong>
      <small>{event.system}</small>
      <span className={`status-pill status-${event.status.toLowerCase()}`}>{event.status}</span>
      <b>{metric}</b>
    </button>
  );
}

function TimelineTable({ event }: { event: RepairEvent }) {
  // The single entry stream is sorted here so milestones and notes stay interleaved.
  const entries = sortTimelineEntries(event.entries);

  return (
    <div className="timeline-panel">
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Event</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan={3}>No entries yet.</td>
            </tr>
          ) : (
            entries.map((entry) => (
              <tr key={`${entry.at}-${entry.kind}`}>
                <td>{formatTime(entry.at)}</td>
                <td>{entry.type === 'milestone' ? MILESTONE_EVENT_LABELS[entry.kind] : entry.kind}</td>
                <td>{entry.type === 'milestone' ? `${entry.by} stamped ${MILESTONE_LABELS[entry.kind]}` : entry.text}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function MetricsPanel({ event }: { event: RepairEvent }) {
  const metrics = calculateMetrics(event);

  return (
    <aside className="metrics-panel">
      <h2>Auto-calculated</h2>
      {Object.values(metrics).map((metric) => (
        <div key={metric.label} className="metric-row">
          <span>{metric.label}</span>
          <strong className={metric.status ? `metric-${metric.status}` : ''}>{formatMinutes(metric.minutes)}</strong>
          <small>{metric.status ?? 'pending'}</small>
        </div>
      ))}
    </aside>
  );
}
