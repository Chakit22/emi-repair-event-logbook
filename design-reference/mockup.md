# Layout reference - Repair Event capture

ASCII wireframes for the exercise. Structural intent only - **the exact layout, spacing, and visual treatment are your call.** What's locked is *what should be on screen* and *how it should behave*, not where the pixels go.

Brand application (palette, type, logo) is described separately in `design-system.html` - open that in a browser for the colours, weights, and component samples.

---

## Top-level structure

A single-page app with two views. A toggle in the app header swaps between them.

- **Tablet view** (default): what the technician sees on an iPad at the machine.
- **Admin view**: what the supervisor sees in the office.

Both views read from the same in-memory event state. localStorage persistence is optional (described in `01-coding-test-brief.md`).

---

## Frame 1 - Tablet view, fresh repair, no taps yet

```
+----------------------------------------------------------------------+
|  [LOGO]  REPAIR EVENT                          [Tablet]  Admin       |
+----------------------------------------------------------------------+
|                                                                      |
|  Active repair  [ACTIVE]                            Elapsed          |
|  CAT 793F #12  ·  Hydraulic  ·  Registered by J Smith     00:00      |
|                                                                      |
|  +-------+  +-------+  +-------+  +-------+  +-------+  +-------+    |
|  |   1   |  |   2   |  |   3   |  |   4   |  |   5   |  |   6   |    |
|  | START |  |ARRIVED|  |PROBLEM|  | START |  |REPAIR |  |RETURN |    |
|  | BREAK-|  |  AT   |  |IDENTI-|  |REPAIR |  |COMPL. |  |  TO   |    |
|  | DOWN  |  |MACHINE|  | FIED  |  |       |  |       |  |SERVICE|    |
|  | (red) |  |(lock) |  |(lock) |  |(lock) |  |(lock) |  |(lock) |    |
|  +-------+  +-------+  +-------+  +-------+  +-------+  +-------+    |
|     ^                                                                |
|   (only this one is tappable - it's visibly marked as the next one) |
|                                                                      |
|  ─────────────────────────────────────────────────────────────────   |
|                                                                      |
|  Between milestones:                                                 |
|  [Add Finding]  [Add Action]  [Add Part]  [Add Note]                 |
|  [Add Photo*]   [Record Audio*]                                      |
|                                                                      |
|  (all six disabled until the first milestone is tapped;              |
|   Photo and Audio remain permanently disabled - out of scope for v1) |
+----------------------------------------------------------------------+
```

**Behaviour rules:**
- Only the *next* milestone in sequence is tappable. Predecessors are stamped, successors are locked.
- Locked buttons retain a hint of their phase colour but read as visibly inert.
- The "next" button has a clear visual hint that it's the one to tap (gold outline, arrow, glow - your call).
- Add-* buttons are disabled before milestone 1 is tapped, and again after milestone 6 is tapped.
- Photo and Record Audio are *permanently* disabled with a tooltip "Not in v1". They must still render.

---

## Frame 2 - Tablet view, three milestones tapped, mid-repair

```
+----------------------------------------------------------------------+
|  [LOGO]  REPAIR EVENT                          [Tablet]  Admin       |
+----------------------------------------------------------------------+
|                                                                      |
|  Active repair  [ACTIVE]                            Elapsed          |
|  CAT 793F #12  ·  Hydraulic  ·  Registered by J Smith     00:18      |
|                                                                      |
|  +-------+  +-------+  +-------+  +-------+  +-------+  +-------+    |
|  | 1  ✓  |  | 2  ✓  |  | 3  ✓  |  |   4   |  |   5   |  |   6   |    |
|  | START |  |ARRIVED|  |PROBLEM|  | START |  |REPAIR |  |RETURN |    |
|  | BREAK |  |   AT  |  |IDENTI-|  |REPAIR |  |COMPL. |  |  TO   |    |
|  | DOWN  |  |MACHINE|  | FIED  |  |(orange|  |(lock) |  |SERVICE|    |
|  +-------+  +-------+  +-------+  +-------+  +-------+  +-------+    |
|   08:12      08:18      08:25       ^next                            |
|   J Smith    J Smith    J Smith                                      |
|                                                                      |
|  ─────────────────────────────────────────────────────────────────   |
|                                                                      |
|  Between milestones:                                                 |
|  [Add Finding]  [Add Action]  [Add Part]  [Add Note]                 |
|  [Add Photo*]   [Record Audio*]                                      |
|                                                                      |
|  Recent entries                                                      |
|  ─────────────────────────────────────────────────────────────────   |
|  08:22  FINDING   Hydraulic hose split near the hoist cylinder.      |
|                   Wet ground around the boom.                        |
|  08:27  NOTE      Calling M Perez over - needs two on this.          |
+----------------------------------------------------------------------+
```

**Behaviour rules:**
- Tapping an Add-* button (other than Photo/Audio) opens a modal with a single textarea (see Frame 2a).
- Saved annotations append to the event's chronological entry list and appear in the "Recent entries" section.
- "Recent entries" shows annotations only - milestones are visible from the buttons themselves.

---

## Frame 2a - Add-Finding modal (overlay above tablet view)

```
       +────────────────────────────────────────+
       |  ANNOTATION                            |
       |  Add finding                           |
       +────────────────────────────────────────+
       |                                        |
       |  +──────────────────────────────────+  |
       |  | Hydraulic hose split near the    |  |
       |  | hoist cylinder. Wet ground       |  |
       |  | around the boom.|                |  |
       |  |                                  |  |
       |  +──────────────────────────────────+  |
       |                                        |
       +────────────────────────────────────────+
       |                       [Cancel] [Save]  |
       +────────────────────────────────────────+
```

**Behaviour rules:**
- One textarea, multiline. No category sub-fields, no tagging, no formatting toolbar.
- Save is disabled while the textarea is empty.
- Save commits with timestamp = now, by = current user, kind = whichever Add-* was tapped.
- Cancel discards.
- The same modal shape is used for Action, Part, Note - only the header label changes.

---

## Frame 3 - Tablet view, repair complete

```
+----------------------------------------------------------------------+
|  [LOGO]  REPAIR EVENT                          [Tablet]  Admin       |
+----------------------------------------------------------------------+
|                                                                      |
|  Repair complete  [COMPLETED]                  Total downtime        |
|  CAT 793F #12  ·  Hydraulic  ·  Registered by J Smith     53 min     |
|                                                                      |
|  +-------+  +-------+  +-------+  +-------+  +-------+  +-------+    |
|  | 1  ✓  |  | 2  ✓  |  | 3  ✓  |  | 4  ✓  |  | 5  ✓  |  | 6  ✓  |    |
|  +-------+  +-------+  +-------+  +-------+  +-------+  +-------+    |
|   08:12      08:18      08:25      08:30      09:02      09:05       |
|   J Smith    J Smith    J Smith    M Perez    M Perez    J Smith     |
|                                                                      |
|  Recent entries                                                      |
|  ─────────────────────────────────────────────────────────────────   |
|  08:22  FINDING   Hydraulic hose split near the hoist cylinder.      |
|  08:27  NOTE      Calling M Perez over - needs two on this.          |
|  08:45  ACTION    Hose replaced. System pressure tested.             |
|  08:47  PART      HYD-HOSE-2456                                      |
|                                                                      |
|              +──────────────────────────────+                        |
|              |     START A NEW REPAIR       |                        |
|              +──────────────────────────────+                        |
+----------------------------------------------------------------------+
```

**Behaviour rules:**
- When milestone 6 is stamped, status flips to Completed.
- All Add-* buttons become disabled (the repair is over).
- The "Start a new repair" button is the only remaining action - taps reset the state and return to Frame 1.

---

## Frame 4 - Admin view, breakdowns list + selected event

```
+----------------------------------------------------------------------+
|  [LOGO]  REPAIR EVENT                          Tablet   [Admin]      |
+----------------------------------------------------------------------+
|  ████████ DARK THEME / DARK BACKGROUND ████████                      |
|                                                                      |
|  Breakdowns                                                          |
|                                                                      |
|  +─────────────────+  +─────────────────+  +─────────────────+       |
|  | RE-2401         |  | RE-2402         |  | RE-2403         |       |
|  | CAT 793F #12    |  | KOM 980E #07    |  | LIE R 9400 #03  |       |
|  | Hydraulic       |  | Drivetrain      |  | Electrical      |       |
|  | [COMPLETED]     |  | [COMPLETED]     |  | [STOPPED]       |       |
|  |  53 min total   |  | 146 min total   |  | last tap 14:31  |       |
|  +─────────────────+  +─────────────────+  +─────────────────+       |
|   ^selected (gold border)                                            |
|                                                                      |
|  ──────────────────────────────────────────────────────────────      |
|                                                                      |
|  CAT 793F #12 - Hydraulic                   [COMPLETED]              |
|  Auto-generated from milestone taps. No technician typing required.  |
|                                                                      |
|  +─────────────────────────────────────────+  +──────────────────+   |
|  | TIME  | EVENT             | DETAIL      |  |  AUTO-CALCULATED |   |
|  +─────────────────────────────────────────+  |                  |   |
|  | 08:12 | Breakdown reported| ...J Smith  |  |  Response time   |   |
|  | 08:18 | Technician arrived| ...J Smith  |  |   6 min   (good) |   |
|  | 08:22 | Finding           | Hydraulic.. |  |                  |   |
|  | 08:25 | Problem identified| Hose ruptur.|  |  Diagnosis time  |   |
|  | 08:27 | Note              | Calling M.. |  |   7 min   (good) |   |
|  | 08:30 | Repair started    | M Perez ... |  |                  |   |
|  | 08:45 | Action            | Hose repl.. |  |  Repair time     |   |
|  | 08:47 | Part              | HYD-HOSE... |  |  32 min   (ok)   |   |
|  | 09:02 | Repair complete   | Pressure... |  |                  |   |
|  | 09:05 | Return to service | Released... |  |  Total downtime  |   |
|  +─────────────────────────────────────────+  |  53 min   (bad)  |   |
|                                               +──────────────────+   |
+----------------------------------------------------------------------+
```

**Behaviour rules:**
- Admin view is dark-themed (use `--emi-dark` as the page background, off-white text, gold accents - see `design-system.html`).
- **Breakdowns list at the top**: a horizontally-arranged set of cards, one per repair event. Each card shows the event ID, asset, system, status pill, and a key metric:
  - Completed events: `<total downtime> min total`
  - Active or Stopped events: `last tap HH:MM`
- The active in-flight repair from the tablet view (if any) appears first in the list with an `[ACTIVE]` pill and a gold border.
- Click a card to select it. The selected card has a gold border. The timeline + metrics below swap to show that event's data.
- Default selection on first load: the active event if there is one, otherwise the most recent.
- No filter / sort controls in v1 - just the list.
- The timeline below interleaves milestones and annotations in chronological order. **Event** column shows the kind (e.g. "Finding", "Action", "Repair started"); **Detail** column shows the free-text content (for annotations) or a one-line summary (for milestones).
- For milestones, the Detail column is your call - a sensible one-liner like "J Smith on site at Pit 3 East", or just the operator initials, both fine.
- The Auto-calculated panel:
  - **Response time** = milestone 2 timestamp - milestone 1 timestamp
  - **Diagnosis time** = milestone 3 timestamp - milestone 2 timestamp
  - **Repair time** = milestone 5 timestamp - milestone 4 timestamp
  - **Total downtime** = milestone 6 timestamp - milestone 1 timestamp
- Metric value colour follows the semantic palette: green for under-target, gold for middling, red for over-target. Thresholds are your call - the brief doesn't prescribe.
- If the selected event isn't complete (no milestone 6 yet), metrics for unfinished phases show "-" rather than a number.

---

## Data model (suggestion, not prescription)

You're free to model however you like, but a discriminated-union shape is the cleanest fit:

```typescript
type MilestoneKind =
  | 'StartBreakdown'
  | 'ArrivedAtMachine'
  | 'ProblemIdentified'
  | 'StartRepair'
  | 'RepairComplete'
  | 'ReturnToService';

type AnnotationKind = 'Finding' | 'Action' | 'Part' | 'Note';

type Entry =
  | { type: 'milestone';  kind: MilestoneKind;    at: string; by: string }
  | { type: 'annotation'; kind: AnnotationKind;   at: string; by: string; text: string };

type RepairStatus = 'Active' | 'Stopped' | 'Completed';

type RepairEvent = {
  id: string;
  asset: string;
  system: string;
  registeredBy: string;
  registeredAt: string;
  status: RepairStatus;
  entries: Entry[];
};
```

The template ships this in `src/lib/types.ts`. You can keep, extend, or replace it - what you do with it is part of what we'll look at.

---

## What you get to decide

- Exact layout, spacing, padding, dimensions.
- Whether to render the milestone tiles as squares, rectangles, or pills.
- Where the timestamps + initials sit (under each tile, beside, in a tooltip - anywhere reasonable).
- How the "next" button is visually marked (gold outline, arrow, glow).
- Whether the modal is a centred overlay, bottom sheet, side panel - anything modal-feeling is fine.
- Whether the "Recent entries" section is on the same screen as the milestone grid or scrolled below.
- All micro-interactions, transitions, hover states.

## What you should NOT change

- The two-view structure (Tablet / Admin) and the header toggle.
- The six milestone kinds and their order.
- The four annotation kinds (Finding, Action, Part, Note).
- That Photo and Record Audio render but are visibly disabled with a tooltip "Not in v1".
- That milestones can only be tapped in order.
- That admin view interleaves milestones and annotations chronologically.
- The brand application (palette, Roboto, logo).
