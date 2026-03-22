## ADDED Requirements

### Requirement: Navigation SHALL reflect the task-journal product model
The system SHALL present primary navigation that matches the task-journal-first product model so users can immediately understand where planning, missed history, AI guidance, and support tools live.

#### Scenario: Primary destinations are available from the app shell
- **WHEN** a user views the primary app navigation
- **THEN** the shell SHALL expose Today, Missed, Suggestions, and Chat as first-class destinations
- **THEN** support surfaces such as settings or lists SHALL be visually secondary to the primary journaling workflow

#### Scenario: Navigation labels use product language
- **WHEN** a user reads navigation labels and section names
- **THEN** the labels SHALL use supportive, product-specific language
- **THEN** the app SHALL avoid labels that reframe guidance as generic analytics or backlog management

### Requirement: The app shell SHALL avoid duplicate primary navigation systems
The system SHALL use one clear primary navigation model per context to reduce cognitive overhead and hidden wayfinding.

#### Scenario: Bottom navigation is the primary mobile model
- **WHEN** the app is viewed on mobile
- **THEN** bottom tabs SHALL carry the primary destinations
- **THEN** any secondary menu SHALL complement the tabs instead of duplicating the same navigation structure

#### Scenario: Secondary controls do not compete with the shell
- **WHEN** utility controls such as search, sort, theme, or settings are shown
- **THEN** they SHALL appear secondary to navigation and task capture
- **THEN** non-functional affordances SHALL NOT appear interactive in the primary shell
