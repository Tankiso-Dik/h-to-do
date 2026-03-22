# AI Task Journal App Plan

## 1) Product concept

A mobile-first task journal inspired by the calm clarity of Microsoft To Do, but redesigned around accountability, reflection, pattern detection, and AI-assisted schedule improvement.

This is not a classic overdue-task app.
A missed task is treated as a historical outcome, not a nagging unfinished obligation.
The app should feel supportive, observant, and lightweight rather than punishing.

## 2) Product identity

### Working positioning

A personal task app that combines:

* daily planning
* time-based reminders
* lightweight notes and reflections
* behavioral logging
* AI suggestions based on what actually happens

### Core promise

Help the user plan realistically, notice patterns, and improve consistency without guilt-heavy backlog mechanics.

## 3) Design inspiration from Microsoft To Do

We are borrowing these strengths:

* calm, low-noise interface
* clear list hierarchy
* strong daily focus view
* soft visual language
* lightweight task entry
* simple task detail panel
* mobile-first task completion feel

We are intentionally changing these areas:

* missed tasks do not remain overdue forever
* reflections and reason logging are first-class features
* AI suggestions are built into the product, not bolted on
* task history matters more than static checklist completion
* notes/comments under task instances become part of the behavior record

## 4) UX principles

1. Calm first
   The interface should feel light, spacious, and non-threatening.

2. Fast capture
   The user must be able to add a task in seconds.

3. History over guilt
   Missed tasks become data, not clutter.

4. Reflection is optional, never forced
   Prompts should encourage logging but never block completion.

5. Daily guidance, not constant interference
   AI should summarize patterns and suggest practical changes.

6. Mobile-first
   The best experience should be on phone. Desktop web is a strong secondary surface.

7. Offline-safe
   Core task actions and note entry should work offline and sync later.

## 5) Primary user flows

### A. Create a task

User creates a task with:

* title
* optional note
* time for today or future day
* optional recurrence
* optional category/list/tag

### B. Reminder fires

At task time, mobile notification appears with actions such as:

* I’m on it
* Reschedule
* Dismiss

Optional follow-up:

* reason for reschedule

### C. Complete task

When marking complete, user may optionally add:

* quick comment
* mood/status
* why it went well
* anything notable

### D. Missed task flow

If a task time passes and task was not completed or explicitly rescheduled:

* mark instance as missed
* optionally show a lightweight prompt asking why it was missed
* allow skip with no friction

### E. Suggestions tab

Each day, AI generates observations such as:

* tasks often missed in a certain time range
* tasks completed reliably in another time range
* categories being neglected
* possible schedule adjustments
* patterns in reschedule reasons

### F. AI conversation

User can chat with an assistant that can:

* review recent behavior
* help plan the day
* help rewrite unrealistic schedules
* identify recurring friction
* suggest smaller habits or time changes

## 6) Core screens

### 1. Today

Main daily dashboard.
Contains:

* greeting / date
* today’s scheduled tasks
* status buckets if needed
* quick add
* AI daily suggestion summary card

### 2. Task Detail

Contains:

* title
* schedule info
* recurrence info
* task note
* completion history
* comments/reflections for this task or task instance
* actions: complete, reschedule, edit, archive

### 3. Missed

A dedicated screen for missed instances.
Not an overdue backlog.
This is a historical review surface with optional reflections.

### 4. Suggestions

Daily AI-generated recommendations and behavior insights.
Could include:

* schedule adjustment suggestions
* consistency trends
* lagging categories
* overcommitment warnings

### 5. AI Chat

Conversational planner with access to user history and recent logs.

### 6. Lists / Areas

Optional grouping like Personal, Work, Health, Study.
Should remain lightweight.

### 7. Settings

Notifications, privacy, AI behavior, sync, appearance, export.

## 7) Information architecture

### Main navigation

Recommended bottom tabs:

* Today
* Missed
* Suggestions
* Chat
* More / Lists

Alternative:

* Today
* Lists
* Suggestions
* Chat
* Profile

## 8) Task model philosophy

Important distinction:
We should model recurring or scheduled tasks as task templates + task instances.

### Why

A recurring task is not one endlessly reused row.
Each occurrence should become a historical instance with its own outcome.

### Task template

Defines:

* title
* default note
* category/list
* recurrence rule
* preferred time
* active/inactive

### Task instance

Defines:

* date
* scheduled time
* actual completion time
* status: scheduled / completed / missed / rescheduled / cancelled
* reschedule reason
* missed reason
* completion comment
* AI-visible metadata

This model supports analytics, pattern detection, and your missed-day philosophy.

## 9) Notes and comments system

There are two useful layers:

### Task note

Persistent note attached to the task template.
Example: instructions, context, checklist idea.

### Instance reflection

Optional log attached to a specific day’s occurrence.
Example: why missed, why delayed, how it felt, what happened.

This separation keeps permanent context separate from behavioral journaling.

## 10) AI system design

### AI roles

1. Daily observer
   Summarizes what the logs imply.

2. Schedule optimizer
   Suggests better times and load balancing.

3. Planning assistant
   Helps plan the day conversationally.

4. Reflection assistant
   Helps user make sense of misses and reschedules.

### AI should analyze

* completion rate by time of day
* completion rate by task type/category
* repeated reschedule reasons
* repeated missed reasons
* streaks and instability
* unrealistic daily load
* tasks repeatedly shifted to same later window

### AI output types

* short daily suggestions
* weekly trend summaries
* conversational answers
* optional intervention prompts

### AI guardrails

* never shame the user
* avoid fake certainty
* distinguish pattern vs guess
* keep suggestions concrete
* avoid over-notifying

## 11) Offline-first behavior

The app should support temporary local storage when internet is unavailable.

### Offline actions that should work

* create/edit task
* mark complete
* reschedule
* add note/comment
* dismiss or log missed task
* browse recently synced data

### Sync strategy

* queue local mutations
* assign local temporary IDs where needed
* sync in order when connectivity returns
* resolve conflicts predictably
* preserve user input rather than silently overwriting

### Practical approach

Use local device storage for pending operations and recently viewed data, then reconcile with backend when online.

## 12) Technical stack direction

### Frontend

* Expo
* Expo Router
* React Native
* web build for desktop browser access

### Backend

* Convex for data, functions, auth-linked records, sync, and realtime state

### Local/offline layer

Potential options include:

* AsyncStorage for queued writes and cached views
* SQLite for stronger offline local database behavior if needed later

### Notifications

* Expo notifications for mobile reminder flows

### AI

* OpenRouter via backend functions, not directly from client
* structured outputs for suggestions when possible

## 13) Recommended versioning strategy

### V1

* auth
* lists/areas
* task templates
* task instances
* reminders
* complete/reschedule/miss flows
* optional comments
* basic missed screen
* basic AI daily suggestions
* AI chat with recent history

### V1.5

* better analytics
* weekly reports
* richer recurrence controls
* category-based suggestions
* export

### V2

* smarter schedule optimization
* habit insights
* richer timeline/history views
* voice note reflections
* calendar integration

## 14) UX specifics to preserve from Microsoft To Do inspiration

* clean left-nav or tab-based list structure
* strong Today focus
* large tap targets
* task rows that are readable at a glance
* detail view that expands depth without cluttering the list
* gentle color system and background imagery only if subtle
* quick-add interaction always visible

## 15) UX specifics to intentionally improve beyond Microsoft To Do

* better treatment of missed tasks
* clearer distinction between today, history, and backlog
* stronger reflection model
* AI-native suggestions surface
* more transparent behavior insights
* better handling of reschedules as useful signal

## 16) Potential risks

* AI suggestions become repetitive or obvious
* too many prompts make the app feel nagging
* recurring task logic becomes messy if instance modeling is weak
* offline sync conflicts could confuse users
* app becomes too heavy if we overbuild analytics too early

## 17) Product success criteria

The app is succeeding if:

* daily planning feels faster than in generic to-do apps
* missed tasks feel informative, not demoralizing
* users actually leave reflections occasionally
* AI suggestions feel specific and useful
* mobile reminder interactions feel smooth
* desktop web remains good enough without extra platform work

## 18) Open questions for next planning pass

* Should tasks support priority, or is that unnecessary noise?
* Should comments support tags like reason, mood, energy, interruption?
* Should Today include calendar blocks or only tasks?
* Should AI suggestions be editable/accepted/rejected?
* How much history should be shown in the main app vs analytics screen?
* Do we want habits as a distinct concept, or just recurring tasks?

## 19) Next build step

Create the first technical blueprint covering:

* schema
* route structure
* notification flow
* offline queue design
* AI data pipeline
* V1 screen-by-screen spec
