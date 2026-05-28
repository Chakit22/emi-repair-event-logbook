# EMI Repair Event Logbook Implementation Plan

## Goal

Execute the EMI coding exercise end to end in this repository.

Build a single-page Repair Event Logbook app using the provided Vite, React, and TypeScript template. The app should let a technician capture milestone taps and annotations in a shared event log, then let a supervisor review the same repair event data as an admin timeline with calculated metrics.

## Product Model

- Treat the app as an append-only repair event logbook.
- A `RepairEvent` is the container for one breakdown repair.
- `RepairEvent.entries` is the single chronological event stream.
- Milestones and annotations both live in `entries`.
- Do not split milestones and annotations into separate top-level arrays.
- Do not add editing or deletion in v1.
- Admin is read-only.
- Tablet is the capture surface.

## Data Model

Use the provided domain types from `src/lib/types.ts`.

- Keep `MilestoneKind`, `AnnotationKind`, `RepairStatus`, `ISODateString`, `Entry`, `RepairEvent`, and `MILESTONE_SEQUENCE`.
- Do not replace the provided model with a generic event engine.
- Do not add extra fields unless required by the UI.
- Use `MILESTONE_SEQUENCE` as the source of truth for milestone order.

Initial state:

- Start with `SEED_EVENTS`.
- Add one active demo repair event for the Tablet view:
  - `id`: `RE-2404`
  - `asset`: `CAT 793F #12`
  - `system`: `Hydraulic`
  - `registeredBy`: `J Smith`
  - `status`: `Active`
  - `entries`: `[]`

New repair behavior:

- When a completed repair shows `Start a new repair`, clicking it appends a new active `RepairEvent`.
- Keep completed events in the Admin breakdown list.
- Use fixed demo details for new repairs to avoid adding a create-repair form.
- Generate the next event ID from the current highest `RE-####` value.

## Tablet View

Build the technician-facing view from `design-reference/mockup.md`.

Required behavior:

- Show the active repair details and status.
- Render six milestone buttons in order:
  - Start Breakdown
  - Arrived at Machine
  - Problem Identified
  - Start Repair
  - Repair Complete
  - Return to Service
- Only the next incomplete milestone is tappable.
- Completed milestones show timestamp and user.
- Future milestones are visibly locked.
- The next milestone has a clear visual marker.
- Tapping a milestone appends a milestone entry with `at: new Date().toISOString()` and `by: 'J Smith'`.
- Tapping `ReturnToService` also changes the repair status to `Completed`.
- Render Add Finding, Add Action, Add Part, and Add Note.
- Add buttons are disabled until `StartBreakdown` is stamped.
- Add buttons are disabled again once `ReturnToService` is stamped.
- Add Photo and Record Audio always render disabled with tooltip text `Not in v1`.
- Annotation buttons open a modal with one textarea.
- Save is disabled when textarea content is empty after trimming.
- Saving appends an annotation entry with the selected kind, timestamp, user, and text.
- Cancel closes the modal without adding an entry.
- Recent entries shows annotations only.
- When repair is completed, show `Start a new repair` as the remaining action.

## Admin View

Build the supervisor-facing view from `design-reference/mockup.md`.

Required behavior:

- Use a dark EMI-themed surface.
- Show breakdown cards horizontally at the top.
- Active in-flight repairs appear first.
- Each card shows event ID, asset, system, status pill, and one key metric.
- Completed events show `<n> min total`.
- Active or stopped events show `last tap HH:MM`.
- Active repair card has an `[ACTIVE]` pill and gold border.
- Clicking a card selects it.
- Default selected event is the active repair if present, otherwise the most recent event.
- Selected event drives the timeline and metrics below.
- Timeline table columns are Time, Event, Detail.
- Timeline interleaves milestone and annotation entries chronologically.
- Annotation detail is the free-text content.
- Milestone detail is generated text such as `J Smith stamped Start Breakdown`.
- Metrics panel shows:
  - Response time = ArrivedAtMachine - StartBreakdown
  - Diagnosis time = ProblemIdentified - ArrivedAtMachine
  - Repair time = RepairComplete - StartRepair
  - Total downtime = ReturnToService - StartBreakdown
- Unfinished metrics show `-`.
- Metric colors use simple v1 thresholds:
  - Response: good `<= 15`, ok `<= 30`, bad `> 30`
  - Diagnosis: good `<= 20`, ok `<= 45`, bad `> 45`
  - Repair: good `<= 60`, ok `<= 120`, bad `> 120`
  - Total downtime: good `<= 90`, ok `<= 180`, bad `> 180`

## Header And Shared State

- Single-page app only.
- Use an internal React state variable to switch between Tablet and Admin.
- Switching views must not refresh the page or clear state.
- Use in-memory React state only.
- Browser refresh may reset state to the seeded/demo data.

## Styling

Follow `design-reference/design-system.html`.

- Use Roboto from `index.html`.
- Use the EMI palette:
  - gold `#EDB012`
  - dark `#404149`
  - light grey `#D2D2D9`
  - off white `#F9F9FC`
  - red `#E31212`
  - orange `#ED8738`
  - blue `#307AD6`
  - green `#24BA78`
- Use milestone phase colors:
  - 1 red
  - 2 orange
  - 3 gold
  - 4 orange
  - 5 green
  - 6 green
- Use the EMI logo asset from `design-reference/emi3-logo.png`.
- Exact spacing/layout may differ from the mockup, but the screen contents and behavior must match.
- Keep the UI practical and work-focused, not marketing-style.

## Suggested Code Shape

Keep the implementation small and explainable.

- Create pure helper functions for:
  - finding milestone entries
  - finding the next milestone
  - checking whether capture is open
  - sorting timeline entries
  - calculating metric durations
  - assigning metric statuses
  - formatting times and minutes
  - creating a new active repair event
- Prefer small React components:
  - App shell/header
  - Tablet view
  - Milestone button/row
  - Annotation modal
  - Recent entries
  - Admin view
  - Breakdown card list
  - Timeline table
  - Metrics panel
- Use named exports.
- Avoid `any`.
- Keep state updates immutable.

## Tests

Add focused Vitest tests for helper logic.

Required test scenarios:

- Next milestone detection returns `StartBreakdown` for an empty event.
- Next milestone detection advances after completed milestone entries.
- No next milestone is returned after `ReturnToService`.
- Timeline entries sort chronologically.
- Metrics calculate expected minute durations from seeded-style timestamps.
- Unfinished metrics return no value.
- Metric status thresholds return good, ok, and bad correctly.
- Appending `ReturnToService` marks an event completed.

Run:

```bash
npm run test
npm run build
```

## README

Update `README.md` for the final submission.

Include:

- What the app is: an append-only repair event logbook.
- How to run:
  - `npm install`
  - `npm run dev`
  - `npm run test`
  - `npm run build`
- How the Tablet and Admin views work.
- Why state is in-memory only.
- Why Admin is read-only and entries are append-only.
- Metric thresholds and why they are v1 assumptions.
- Trade-offs and things intentionally not built.
- Mention the Figma prototype process:
  - Reviewed the brief and EMI design reference.
  - Created Figma prototypes for Tablet and Admin flows.
  - Used the prototype to guide the final UI structure.
- Mention AI/Codex usage honestly:
  - Used Codex for requirement breakdown, planning, prototype discussion, and implementation support.
  - Directed decisions around data model, scope, testing, and trade-offs.
  - Reviewed the code so it can be explained in an interview.

## NEXT_STEPS.md

Create `NEXT_STEPS.md` with five production-minded next steps:

1. Persist repair events through an API and database.
2. Add audited correction entries instead of direct editing.
3. Add role-based permissions for technicians and supervisors.
4. Extract reusable event-log primitives if another EMI workflow needs the same pattern.
5. Implement v2 media capture for photos and audio.

## Acceptance Criteria

- `npm run dev` starts the app.
- `npm run build` passes.
- `npm run test` passes.
- Tablet and Admin views both work.
- Switching views preserves state.
- Milestones can only be tapped in order.
- Annotations append to the active event and appear in recent entries/admin timeline.
- Admin timeline interleaves milestones and annotations chronologically.
- Admin metrics calculate correctly.
- Completed repairs lock capture actions.
- Start a new repair creates a new active event without losing completed history.
- README and NEXT_STEPS are complete and interview-friendly.
