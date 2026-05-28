# EMI Junior Developer - Coding Exercise

Thanks for putting your hand up. Before we set up an interview, we'd like to see how you build something small.

This isn't a gotcha. We want to see how you work, not whether you can recall syntax.

---

## A note on AI before we go further

**We expect you to use AI.** Claude, Copilot, Cursor, whatever you reach for - use it. We're an AI-first dev team, and pretending otherwise in 2026 would be silly. The free Claude tier is plenty; you shouldn't need to spend money to do this.

What we're actually testing is whether you can **direct** AI, not whether you can dump its output. The exercise is sized so that AI lets you move fast - 1-2 hours of focused work for something that would have taken a junior the better part of a day a year ago. The trade-off is that you have to know what you're building, why you made each choice, and how each piece works.

**Heads up: in the follow-up interview we'll quiz you on the code.** We'll pick a file you wrote and ask you to walk us through it. We'll ask "why this and not that" on a design choice. We'll ask where a hypothetical new field would land. The goal isn't to catch you out - it's to see whether the code is yours in the way that matters: you understand it, you can defend it, you could change it tomorrow.

Shipping AI-assisted code you understand cold beats hand-rolling something fragile.

---

## The context

EMI builds maintenance software for heavy industry. One of the things we're working on is a **Repair Event** - a way for a technician to capture an unplanned breakdown repair on an iPad at the machine, in real time, without having to file a work order first.

A repair event has six milestones the technician taps as the repair progresses:

1. **Start Breakdown** - clock starts
2. **Arrived at Machine** - response time captured
3. **Problem Identified** - diagnosis time captured
4. **Start Repair** - repair begins
5. **Repair Complete** - repair time captured
6. **Return to Service** - total downtime captured

Between milestones the technician can optionally add free-text annotations: **Findings**, **Actions**, **Parts**, **Notes**. A supervisor watches the live timeline in the office and can flip to an admin view that interleaves milestones and annotations chronologically.

You're building **both views.**

## What we want you to build

A single-page web app with two views and a header toggle to swap between them.

### Tablet view (what the technician sees)

- **Six milestone buttons** in a row. Each shows its number, label, and phase colour (1=red → 2/4=orange → 3=gold → 5/6=green).
- Only the next-in-sequence milestone is tappable. Tapping stamps a timestamp + current user against it and unlocks the next one.
- Below each tapped button: the time it was stamped and who tapped it.
- **Four "Add" buttons**: Add Finding, Add Action, Add Part, Add Note. Tapping any opens a modal with a single textarea for free text. Saved entries get a timestamp + user and append to the event's chronological entry list.
- **Two more "Add" buttons that must render but stay permanently disabled**: Add Photo, Record Audio. Tooltip on hover: "Not in v1".
- All Add buttons are disabled until milestone 1 is tapped, and disabled again after milestone 6 is tapped.
- A "Recent entries" section listing annotations (not milestones - those show on the buttons themselves).
- When milestone 6 is stamped, the status flips to Completed, the milestone row becomes inert, and a "Start a new repair" button appears.

### Admin view (what the supervisor sees)

- Dark-themed surface. The brand reference has the right dark - read `design-reference/design-system.html` for the palette.
- **A list of breakdowns at the top.** A horizontally-arranged set of cards, one per repair event in the system. Each card shows: event ID, asset, system, status pill, and one key metric (`<n> min total` for completed events, `last tap HH:MM` for active or stopped). The active in-flight repair from the tablet view (if any) appears first with an `[ACTIVE]` pill and a gold border.
- Click a card to select it. Selection drives the panel below.
- Below the list, the **timeline and metrics for the selected event**:
  - A timeline table with **Time / Event / Detail** columns. Milestones and annotations interleaved in chronological order.
  - An auto-calculated metrics panel showing **Response time** (milestone 2 − milestone 1), **Diagnosis time** (3 − 2), **Repair time** (5 − 4), and **Total downtime** (6 − 1).
  - Metric colours follow the semantic palette: green for under-target, gold for middling, red for over-target. **Thresholds are your call** - pick something defensible and document it.
- Default selection on first load: the active event if there is one, otherwise the most recent.
- No filter or sort controls needed in v1 - just the list.

### The header toggle

A pair of pill buttons in the header. Both views read from the same underlying event state. Switching between views doesn't lose state.

See `design-reference/mockup.md` for ASCII wireframes of both views (and the modal). See `design-reference/design-system.html` for the brand palette, type, and component samples - open it in a browser.

State persistence: **lost-on-refresh is fine** (in-memory). If you want refresh to keep state, the template includes a tiny `localStorage` helper - your call, document it in the README.

## What we've shipped in the template

So you spend your time on shape and polish, not plumbing:

- `src/lib/types.ts` - `RepairEvent`, `Entry`, `MilestoneKind`, `AnnotationKind` types pre-written. You can extend them; don't have to.
- `src/lib/seed.ts` - one completed event so the admin view has something to render before the technician taps anything.
- `src/lib/storage.ts` - optional `localStorage` helper. Use it if you want persistence; ignore it if you don't.
- `design-reference/mockup.md` - ASCII wireframes for the four screen states.
- `design-reference/design-system.html` - palette, type, buttons, status pills, logo. Open in a browser.

**Read both before you start.** They shape what you should build.

## How we build at EMI

A few core tenets. These aren't aspirational - they're how the EMI3 codebase actually reads, and they're what we'll be looking for in yours.

- **Clean Code** (Uncle Bob's, the book). Meaningful names. Small functions that do one thing. No comments that explain *what* the code does - if you need them, rename the thing. If a junior on their second week can't read it and understand it, rewrite it.
- **Small components, single responsibility.** A component does one thing. If you can't summarise it in a sentence without using "and", split it. Five 40-line components beats one 200-line one every time.
- **Composition over inheritance.** No class hierarchies. No `extends BaseThing`. Build behaviour by composing small pieces - functions, hooks, components passed as children. If you find yourself reaching for inheritance in JavaScript or TypeScript in 2026, stop.
- **Functional design.** Pure functions where you can - same input, same output, no side effects. Treat data as immutable: produce new state, don't mutate existing state. Reach for `map` / `filter` / `reduce` before a `for` loop.
- **Types do work.** Use union types for finite sets of values. Use discriminated unions for entities with different shapes. Don't reach for `any` - and if you must, leave a comment explaining why.
- **Named exports.** No default exports. Refactors should stay greppable; "find all usages of `MilestoneButton`" should be one search, not three.

A few process tenets too:

- **AI-first.** Covered above. Use it. Make sure you understand what you ship.
- **Scope discipline.** Two hours of focused work is the target. We don't want a weekend grind. If you can't finish something cleanly in the time, note it in the README rather than shipping it half-built.
- **Commits matter.** A series of meaningful commits tells us how you think. One big "feat: complete" commit tells us nothing.

## Stack

- **Vite + React 19 + TypeScript** (strict mode)
- **npm** - `npm install && npm run dev`
- **vitest** for tests, if tests help

The template ships with this stack configured. You don't have to keep it, but if you swap something out, tell us why in the README.

No Tailwind, no shadcn, no component libraries shipped in the template. Use plain CSS or CSS modules. The reason: we want to see how you apply the EMI brand, not how you accept Tailwind's defaults.

## Starter repo

Our template repo: **https://github.com/Equipment-Management-International/emi-coding-exercise**

Click the green **"Use this template"** button on GitHub to create your own copy. Name it whatever you like. Public or private - your call. If private, add us as a collaborator (GitHub usernames in your reply).

## Time and scope

- **Two hours of focused work**, give or take.
- **Two days** from when you receive this brief to push your final commit.
- Push commits as you go. We'd rather see the journey than the destination.

## What to deliver

In your final commit:

- The working app, runnable with `npm install && npm run dev`.
- A short `README.md` covering: how to run it, what trade-offs you made, anything you'd change with more time.
- A `NEXT_STEPS.md` with the five things you'd do next if this were a real project.

When you're done, send us a link to your repo.

## What we'll look at

We're not scoring against a hidden checklist of features. We're looking at:

- How you broke the problem down.
- Whether the code reads well and is easy to extend.
- How you used (and steered) AI.
- Whether you picked up and applied the conventions in the starter repo.
- Your judgement - what you chose to build, and what you chose to leave for later.

And in the interview: whether you can talk to what you wrote with confidence and detail.

If something in this brief is unclear, just make a sensible call and note it in your README. We'd rather see your judgement than a clarifying email.

Good luck. We'll be in touch within a few days of receiving your final commit.

- The EMI team
