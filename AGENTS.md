# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project shape

- This is a Vite, React, and TypeScript single-page app.
- Keep repair events in in-memory React state unless the user explicitly asks for persistence.
- Preserve the append-only event model: milestones and annotations both live in `RepairEvent.entries`.
- Use the domain types in `src/lib/types.ts` and keep `MILESTONE_SEQUENCE` as the milestone order source of truth.

## Implementation preferences

- Keep helper logic pure and testable in `src/lib/repairHelpers.ts`.
- Keep UI behavior split between `src/App.tsx`, `src/components/TabletView.tsx`, and `src/components/AdminView.tsx`.
- Avoid `any`; prefer narrow TypeScript types from the existing model.
- Do not add edit/delete behavior to repair log entries unless the product scope changes.
- Keep Admin read-only and Tablet as the capture surface.

## Checks

Before finalizing functional changes, run:

```bash
npm run test -- --run
npm run build
```

For documentation-only changes, a build is usually not required unless links or rendered app content changed.

## Design notes

- Follow the EMI palette and Roboto typography already wired into the app.
- Keep the UI practical and work-focused.
- Use `design-reference/mockup.md`, `design-reference/design-system.html`, and `design-reference/emi3-logo.png` as the product/design reference.
