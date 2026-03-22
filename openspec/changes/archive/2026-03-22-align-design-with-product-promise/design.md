## Context

The current React Native / Expo app already has the core screens and local data model for tasks, instances, missed history, and suggestions. The main problem is not missing plumbing; it is that the shipped shell and screen hierarchy do not fully express the intended product: a calm, mobile-first AI task journal focused on realistic planning, reflection, and supportive guidance.

The redesign is cross-cutting because it touches the tab layout, utility bar, shared primitives, Today, Suggestions, task detail, and quick-add flows. The work also needs to preserve the recent shift toward a flatter, darker, skeletal visual language while fixing the remaining architecture and hierarchy issues called out in critique.

## Goals / Non-Goals

**Goals:**
- Align the primary app shell with the product promise and design context.
- Make Today feel capture-first and planning-first.
- Recast Suggestions as a coaching surface rather than a metrics dashboard.
- Simplify task detail so action, reflection, and outcome logging feel like one journey.
- Improve typography, affordance clarity, and information hierarchy without adding visual noise.

**Non-Goals:**
- Rebuild the task data model, reminder engine, or sync system.
- Introduce a new backend dependency or AI provider.
- Fully implement a production conversational assistant beyond the routing and shell requirements needed for the design direction.
- Replace every component in the app with a new visual system in one pass.

## Decisions

### 1. Reorganize the app shell around journal-first destinations
The tab layout and supporting navigation will be updated so the primary destinations reflect the product model: Today, Missed, Suggestions, Chat, and a lightweight support destination.

Why: The current shell tells the user they are in a standard task manager. Renaming and restructuring the shell is the highest-leverage way to align perception with the product promise.

Alternative considered: Keep the existing tabs and only change labels. Rejected because the current set of destinations still overemphasizes generic task management and underrepresents AI conversation.

### 2. Make Today the strongest interaction surface in the product
Today will lead with quick capture, a concise daily read, and a calm task list. Sort and other utility controls will be demoted so they do not compete with capture and planning.

Why: Fast capture and realistic daily planning are the core jobs to be done. The screen hierarchy must communicate that within the first seconds.

Alternative considered: Preserve the existing layout and only restyle the quick-add card. Rejected because the current issue is hierarchy as much as visuals.

### 3. Reframe Suggestions around a single primary recommendation
Suggestions will be redesigned to lead with one clear recommendation or read, then support it with a small number of signals. Metrics become supporting evidence rather than the main composition.

Why: A coaching surface better matches the brand personality and avoids dashboard fatigue.

Alternative considered: Keep the current analytics structure and soften the copy. Rejected because the structure itself communicates reporting, not support.

### 4. Keep reflection tied to outcomes, but simplify the action model
Task detail will keep complete, reschedule, and miss flows in one place, but the layout and grouping will emphasize the current outcome first and optional reflection second.

Why: Reflection is a differentiator, but it must stay optional and easy. The current density risks making the screen feel like form administration.

Alternative considered: Split each outcome into separate deeper flows. Rejected because it would add steps and reduce the lightweight feel.

### 5. Preserve the skeletal direction, but add stronger authorship through hierarchy and typography
The design system will continue using restrained dark surfaces and separators, while improving typographic contrast, screen rhythm, and interaction clarity.

Why: The app should remain calm, but it also needs a stronger identity than the current prototype-like default text system.

Alternative considered: Add stronger color accents to create personality. Rejected for now because the product's tone is better served by hierarchy and composition than by louder color.

## Risks / Trade-offs

- [Navigation churn may disrupt existing habits] → Mitigation: keep route transitions predictable and preserve data/store behavior while changing labels and destination emphasis.
- [A stronger hierarchy could accidentally reintroduce visual heaviness] → Mitigation: use emphasis through typography, placement, and spacing before adding containers or color.
- [Adding a Chat destination before deep chat functionality exists could feel thin] → Mitigation: scope the initial Chat surface as a clear conversational planning shell with honest capability framing.
- [Suggestions simplification could remove useful context] → Mitigation: keep secondary signals available, but subordinate them to the main recommendation.

## Migration Plan

1. Update the navigation shell and route labeling without changing the underlying task store.
2. Refactor shared primitives to support the revised hierarchy and affordance rules.
3. Redesign Today, Suggestions, and task detail in that order so the highest-value flows improve first.
4. Add the initial Chat route and shell once the navigation model is stable.
5. Validate the redesign with typecheck and focused UI review before follow-on implementation changes.

Rollback is straightforward because the change is frontend composition work; the previous layout and copy can be restored without data migration.

## Open Questions

- Should Lists remain a separate visible destination, or move entirely under Settings/More in the first redesign pass?
- How much chat functionality should ship in the same implementation step as the navigation change?
- Should Today surface one AI suggestion inline, or should all richer guidance live only in Suggestions and Chat?
- Do we want a custom font pass in the same change, or should typography improvements stay within native/system constraints for now?
