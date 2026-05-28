import type { RepairEvent } from './types';

/**
 * Optional localStorage helper.
 *
 * Use this if you want refresh-survives-state. Ignore it if you want
 * fresh-on-refresh - both are acceptable, just document your choice.
 *
 * If you keep the helper, the typical pattern is:
 *
 *   const [events, setEvents] = useState<RepairEvent[]>(() => loadEvents(SEED_EVENTS));
 *   useEffect(() => { saveEvents(events); }, [events]);
 */

const STORAGE_KEY = 'emi-repair-events:v1';

export function loadEvents(fallback: RepairEvent[]): RepairEvent[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RepairEvent[]) : fallback;
  } catch {
    return fallback;
  }
}

export function saveEvents(events: RepairEvent[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function clearEvents(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}
