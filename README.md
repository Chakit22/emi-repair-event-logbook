# EMI Repair Event Logbook

An append-only repair event logbook for capturing breakdown milestones and technician annotations. The app keeps one chronological entry stream per repair event, so milestone taps and notes can be reviewed together without a separate admin data model.

## Run it

```bash
npm install
npm run dev
npm run test
npm run build
```

## How it works

The Tablet view is the technician capture surface. It shows the active repair, six ordered milestone buttons, and annotation actions for findings, actions, parts, and notes. Only the next incomplete milestone can be tapped. Annotation capture opens after Start Breakdown and locks again after Return to Service. Photo and audio controls are shown but disabled because they are outside v1.

The Admin view is read-only. It lists active repairs first, then historical repairs, and lets a supervisor select a breakdown card to review the same append-only timeline. Milestones and annotations are interleaved by timestamp, and metrics are calculated from milestone pairs.

State is intentionally in-memory React state. A refresh resets to seeded demo data, which keeps the coding exercise focused on event capture, timeline review, and metric logic rather than persistence or authentication.

## Event rules

Entries are append-only in v1. There is no edit or delete behavior because repair logs should preserve what happened and when. A production correction flow should add audited correction entries rather than mutate old data.

Admin is read-only for the same reason: supervisors can inspect the event stream and metrics without changing technician-captured history.

## Metrics

Metrics are v1 assumptions:

- Response time: Arrived at Machine minus Start Breakdown. Good <= 15 min, ok <= 30 min, bad > 30 min.
- Diagnosis time: Problem Identified minus Arrived at Machine. Good <= 20 min, ok <= 45 min, bad > 45 min.
- Repair time: Repair Complete minus Start Repair. Good <= 60 min, ok <= 120 min, bad > 120 min.
- Total downtime: Return to Service minus Start Breakdown. Good <= 90 min, ok <= 180 min, bad > 180 min.

Unfinished metrics show `-` until both required milestones exist.

## Design and prototype process

I reviewed the brief and EMI design reference, created Figma prototype concepts for the Tablet and Admin flows, and used those prototypes to guide the final UI structure. The final implementation keeps the palette, logo, phase colors, and work-focused layout while staying practical for the exercise scope.

## AI/Codex usage

I used Codex for requirement breakdown, planning, prototype discussion, and implementation support. I directed decisions around the data model, scope, testing, and trade-offs, and reviewed the code so it can be explained in an interview.

## Trade-offs

- No API, database, login, or localStorage persistence in v1.
- No edit, delete, filtering, or search controls.
- New repairs use fixed demo details instead of a create-repair form.
- Media capture is represented as disabled UI only.
- Metric thresholds are simple operational assumptions and should be calibrated with EMI data.
