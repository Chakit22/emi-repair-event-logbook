import { useState } from 'react';
import logoUrl from '../design-reference/emi3-logo.png';
import { AdminView } from './components/AdminView';
import { TabletView } from './components/TabletView';
import { SEED_EVENTS } from './lib/seed';
import { appendMilestoneEntry, createNewActiveRepairEvent, getMostRecentEvent, getNextMilestone, isCaptureOpen } from './lib/repairHelpers';
import type { AnnotationKind, MilestoneKind, RepairEvent } from './lib/types';

type ViewMode = 'tablet' | 'admin';

const CURRENT_USER = 'J Smith';
const DEMO_REPAIR: RepairEvent = {
  id: 'RE-2404',
  asset: 'CAT 793F #12',
  system: 'Hydraulic',
  registeredBy: CURRENT_USER,
  registeredAt: new Date().toISOString(),
  status: 'Active',
  entries: [],
};

export function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('tablet');
  // All repair data stays in memory for the exercise; Tablet and Admin share this same array.
  const [events, setEvents] = useState<RepairEvent[]>(() => [...SEED_EVENTS, DEMO_REPAIR]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Admin defaults to the active repair, while Tablet always follows the current active repair.
  const activeEvent = events.find((event) => event.status === 'Active') ?? null;
  const mostRecentEvent = getMostRecentEvent(events);
  const adminSelectedId = selectedEventId ?? activeEvent?.id ?? mostRecentEvent?.id ?? null;
  const adminSelectedEvent = events.find((event) => event.id === adminSelectedId) ?? mostRecentEvent;
  const tabletEvent = activeEvent ?? mostRecentEvent;

  function updateEvent(updatedEvent: RepairEvent) {
    setEvents((currentEvents) => currentEvents.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)));
    setSelectedEventId(updatedEvent.id);
  }

  function handleMilestoneTap(kind: MilestoneKind) {
    // Guard here as well as in the button state so milestones remain append-only and ordered.
    if (!tabletEvent || getNextMilestone(tabletEvent) !== kind) return;
    updateEvent(appendMilestoneEntry(tabletEvent, kind, new Date().toISOString(), CURRENT_USER));
  }

  function handleSaveAnnotation(kind: AnnotationKind, text: string) {
    // Annotation capture is only open between Start Breakdown and Return to Service.
    if (!tabletEvent || !isCaptureOpen(tabletEvent)) return;
    updateEvent({
      ...tabletEvent,
      entries: [
        ...tabletEvent.entries,
        {
          type: 'annotation',
          kind,
          at: new Date().toISOString(),
          by: CURRENT_USER,
          text: text.trim(),
        },
      ],
    });
  }

  function handleStartNewRepair() {
    // Completed events stay in history; the new fixed-detail repair becomes the next active event.
    setEvents((currentEvents) => {
      const nextEvent = createNewActiveRepairEvent(currentEvents);
      setSelectedEventId(nextEvent.id);
      return [...currentEvents, nextEvent];
    });
    setViewMode('tablet');
  }

  return (
    <div className={`app app-${viewMode}`}>
      <header className="app-header">
        <div className="brand">
          <img src={logoUrl} alt="EMI3" />
          <span>Repair Event</span>
        </div>
        <nav className="view-toggle" aria-label="View">
          <button className={viewMode === 'tablet' ? 'active' : ''} type="button" onClick={() => setViewMode('tablet')}>
            Tablet
          </button>
          <button className={viewMode === 'admin' ? 'active' : ''} type="button" onClick={() => setViewMode('admin')}>
            Admin
          </button>
        </nav>
      </header>

      {viewMode === 'tablet' && tabletEvent ? (
        <TabletView
          event={tabletEvent}
          onMilestoneTap={handleMilestoneTap}
          onSaveAnnotation={handleSaveAnnotation}
          onStartNewRepair={handleStartNewRepair}
        />
      ) : null}

      {viewMode === 'admin' && adminSelectedEvent ? (
        <AdminView
          events={events}
          selectedEvent={adminSelectedEvent}
          onSelectEvent={(eventId) => setSelectedEventId(eventId)}
        />
      ) : null}
    </div>
  );
}
