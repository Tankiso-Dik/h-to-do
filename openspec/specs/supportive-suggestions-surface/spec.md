## ADDED Requirements

### Requirement: Suggestions SHALL behave like coaching, not reporting
The system SHALL present AI and local guidance as supportive recommendations that help the user adjust plans, rather than as a metrics-first analytics dashboard.

#### Scenario: Suggestions leads with one clear read
- **WHEN** a user opens Suggestions
- **THEN** the screen SHALL present a primary summary or recommendation before secondary signals
- **THEN** the summary SHALL state whether it is AI-generated or locally derived

#### Scenario: Metrics support the recommendation
- **WHEN** supporting metrics or pattern signals are shown
- **THEN** they SHALL reinforce the primary recommendation instead of acting as the screen's main focus
- **THEN** the layout SHALL avoid repeated dashboard tiles that overpower the coaching message

### Requirement: Suggestions SHALL translate patterns into next steps
The system SHALL connect detected behavior patterns to practical actions the user can take.

#### Scenario: A pressure point includes an implication
- **WHEN** the app identifies a slipping task, overloaded day, or miss pattern
- **THEN** the screen SHALL explain why that pattern matters
- **THEN** the screen SHALL connect it to a scheduling or task-sizing action the user can consider

#### Scenario: Early-state guidance remains useful
- **WHEN** the app lacks enough history for strong pattern confidence
- **THEN** Suggestions SHALL still provide lightweight guidance without pretending to have certainty
- **THEN** the screen SHALL explain that it is still learning from recent behavior
