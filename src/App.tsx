import { useState } from 'react';
import logoUrl from '../design-reference/emi3-logo.png';
import { AdminView } from './components/AdminView';
import { TabletView } from './components/TabletView';
import { SEED_EVENTS } from './lib/seed';
import { appendMilestoneEntry, createNewActiveRepairEvent, getNextMilestone, isCaptureOpen } from './lib/repairHelpers';
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
  const [events, setEvents] = useState<RepairEvent[]>(() => [...SEED_EVENTS, DEMO_REPAIR]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const activeEvent = events.find((event) => event.status === 'Active') ?? null;
  const adminSelectedId = selectedEventId ?? activeEvent?.id ?? events.at(-1)?.id ?? null;
  const adminSelectedEvent = events.find((event) => event.id === adminSelectedId) ?? events.at(-1) ?? null;
  const tabletEvent = activeEvent ?? events.at(-1) ?? null;

  function updateEvent(updatedEvent: RepairEvent) {
    setEvents((currentEvents) => currentEvents.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)));
    setSelectedEventId(updatedEvent.id);
  }

  function handleMilestoneTap(kind: MilestoneKind) {
    if (!tabletEvent || getNextMilestone(tabletEvent) !== kind) return;
    updateEvent(appendMilestoneEntry(tabletEvent, kind, new Date().toISOString(), CURRENT_USER));
  }

  function handleSaveAnnotation(kind: AnnotationKind, text: string) {
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
