## ADDED Requirements

### Requirement: Today SHALL prioritize fast task capture
The system SHALL make quick capture the dominant action on the Today screen so users can add a task in seconds without scanning through secondary controls first.

#### Scenario: Quick capture is visually primary
- **WHEN** a user lands on Today
- **THEN** the quick-capture control SHALL be one of the first and most visually prominent interactive elements in the viewport
- **THEN** secondary controls such as sort or filtering SHALL NOT outrank task capture in emphasis

#### Scenario: Quick capture preserves light setup
- **WHEN** a user enters a task from Today
- **THEN** the default flow SHALL allow creating the task with a title alone
- **THEN** optional time, reminder, and recurrence controls SHALL remain accessible without blocking capture speed

### Requirement: Today SHALL communicate the day's shape without becoming a dashboard
The system SHALL present daily guidance in a way that helps the user plan realistically while keeping the screen calm and readable.

#### Scenario: Daily guidance is concise and actionable
- **WHEN** the Today screen shows contextual guidance
- **THEN** it SHALL summarize the day's shape or a practical suggestion in plain language
- **THEN** it SHALL avoid crowding the top of the screen with multiple competing metrics

#### Scenario: Task rows stay glanceable
- **WHEN** a user scans today's tasks
- **THEN** each row SHALL surface title, time, recurrence, and status at a glance
- **THEN** reflection or outcome details SHALL appear only when they add immediate value to the current state
