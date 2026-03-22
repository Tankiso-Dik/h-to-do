## ADDED Requirements

### Requirement: Task detail SHALL unify action and reflection
The system SHALL treat completion, reschedule, miss, and reflection as one supportive task journey rather than as disconnected admin actions.

#### Scenario: Outcome actions are understandable at a glance
- **WHEN** a user opens task detail for today's instance
- **THEN** the screen SHALL make the current task state and available next actions immediately understandable
- **THEN** the interaction pattern for completing, rescheduling, or marking missed SHALL feel consistent across outcomes

#### Scenario: Reflection remains optional
- **WHEN** a user performs an outcome action
- **THEN** the flow SHALL allow the user to add a comment, reason, or reflection
- **THEN** the action SHALL remain completable without forcing additional writing

### Requirement: Reflection prompts SHALL feel supportive rather than punitive
The system SHALL use task-outcome language that helps the user notice patterns without implying failure or guilt.

#### Scenario: Missed-task prompts are neutral
- **WHEN** a user marks a task as missed or reviews missed history
- **THEN** the interface SHALL ask for helpful context in neutral language
- **THEN** the interface SHALL avoid overdue framing or punishment-oriented copy

#### Scenario: Outcome details stay relevant to the current decision
- **WHEN** task detail shows prior outcome information
- **THEN** it SHALL surface only the most relevant context for today's instance
- **THEN** historical detail beyond that SHALL be structured so it does not bury the next action
