## Why

The current interface is calmer than a typical to-do app, but it still reads more like a tidy prototype than a confident product built around task journaling, reflection, and AI guidance. Navigation, screen naming, hierarchy, and repeated dashboard patterns dilute the app's core promise and make it feel closer to a generic task manager with analytics.

This change is needed now because the product direction is already clear: a mobile-first task journal where missed tasks become signal, reflection is first-class, and AI suggestions help the user plan more realistically. The UI needs to align with that promise before deeper implementation work compounds the wrong information architecture and visual habits.

## What Changes

- Reframe the app shell around the intended product model: Today, Missed, Suggestions, Chat, and lightweight support surfaces.
- Elevate quick capture and daily planning so the Today screen clearly prioritizes fast task entry and realistic day shaping.
- Redesign Suggestions from a generic analytics dashboard into a coaching surface centered on actionable guidance.
- Tighten the visual language so typography, navigation, hierarchy, and interaction patterns feel authored, calm, and distinctive rather than generic.
- Simplify task detail and reflection flows so outcomes, reschedules, misses, and notes feel supportive and easy to log.

## Capabilities

### New Capabilities
- `journal-navigation-shell`: Defines the primary app navigation, route naming, and shell hierarchy for a task-journal-first experience.
- `daily-planning-capture`: Defines the Today experience, including quick capture prominence, daily guidance hierarchy, and task list interaction priorities.
- `supportive-suggestions-surface`: Defines the Suggestions experience as a coaching and pattern-guidance surface rather than a metrics-first dashboard.
- `reflection-centered-task-journey`: Defines how task detail, completion, reschedule, miss, and reflection flows should work as one supportive journey.

### Modified Capabilities
- None.

## Impact

- Affected code: app tab layout, shared mobile primitives, Today page, Suggestions page, task detail page, quick add flow, task row treatment, and related copy.
- Affected systems: navigation structure, design tokens, screen hierarchy, interaction patterns, and AI guidance presentation.
- No backend or API contract changes are required for this proposal, but frontend structure and component composition will shift significantly.
