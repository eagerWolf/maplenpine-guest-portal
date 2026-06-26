# File: `42-development-guidelines.md`

# Hospitality OS

## Development Guidelines

Version: 1.0
Status: Draft
Audience: Backend Developers, Frontend Developers, Software Architects, Contributors

---

# 1. Purpose

This document defines the software development principles, architectural conventions and coding standards for Hospitality OS.

The objective is to ensure that all platform components are implemented consistently, remain maintainable over time and follow the architectural vision of Hospitality OS.

These guidelines apply to:

* Platform Core
* Business Modules
* Providers
* Plugins
* SDK Components
* Internal Tools

---

# 2. Vision

Hospitality OS is designed as a long-lived enterprise platform.

Code should prioritize:

* readability
* maintainability
* extensibility
* consistency
* predictability

Short-term implementation convenience must never compromise long-term architecture.

---

# 3. General Principles

Every implementation should follow these principles.

* Single Responsibility Principle
* Dependency Inversion Principle
* Composition over Inheritance
* Configuration over Code
* Explicit over Implicit
* Convention over Customization
* Fail Fast
* Keep Business Logic Independent

---

# 4. Layered Architecture

Business logic is separated into clearly defined layers.

```text
Presentation

↓

Application Services

↓

Domain Services

↓

Repositories

↓

Infrastructure

↓

Providers
```

Dependencies must always point downward.

---

# 5. Business Logic

Business logic belongs only to Service classes.

Controllers must never contain business rules.

Repositories must never contain business rules.

Providers must never contain business rules.

Workflow Actions coordinate business logic but do not implement it.

---

# 6. Controllers

Controllers should:

* validate requests
* authorize access
* call services
* return responses

Controllers must remain thin.

Example:

Correct

```php
return $reservationService->create($dto);
```

Incorrect

```php
// database updates
// notifications
// workflows
// provider calls
```

---

# 7. Repositories

Repositories are responsible only for persistence.

Responsibilities include:

* queries
* persistence
* transactions

Repositories must never:

* call providers
* execute workflows
* send notifications

---

# 8. Providers

Providers communicate with external systems only.

Responsibilities include:

* API communication
* authentication
* request mapping
* response mapping

Providers must never contain Hospitality OS business rules.

---

# 9. Workflows

Business orchestration belongs to the Workflow Engine.

Services emit events.

Workflows react to events.

Services must never directly invoke unrelated services where orchestration is required.

---

# 10. Events

Platform communication should be event-driven whenever possible.

Examples:

Reservation Created

Payment Completed

Door Unlocked

Maintenance Closed

Events must describe completed business facts.

---

# 11. Configuration

Nothing should be hardcoded.

Examples:

* providers
* countries
* languages
* currencies
* services
* workflows
* modules

Configuration belongs to the Configuration System.

---

# 12. Error Handling

Errors should be:

* explicit
* meaningful
* recoverable where possible
* logged
* auditable

Exceptions should never be silently ignored.

---

# 13. Testing

Every feature should include appropriate automated tests.

Recommended testing layers:

* Unit Tests
* Integration Tests
* Workflow Tests
* API Tests
* End-to-End Tests

External systems should be replaced by mock providers whenever possible.

---

# 14. Documentation

Every public platform component should provide documentation.

Examples include:

* APIs
* Providers
* Modules
* SDK Packages
* Workflow Actions

Documentation should evolve together with implementation.

---

# 15. Code Reviews

Every contribution should be reviewed.

Review criteria include:

* architecture
* readability
* performance
* security
* test coverage
* documentation

Consistency is more important than individual coding preferences.

---

# 16. Performance

Performance should be considered during design.

Examples:

* asynchronous processing
* caching
* batching
* efficient queries
* lazy loading

Optimization should never reduce code clarity without measurable benefit.

---

# 17. Security

Developers must follow platform security principles.

Examples:

* validate input
* authorize every request
* avoid sensitive logging
* use secure defaults
* protect secrets

Security is everyone's responsibility.

---

# 18. Design Rules

Development within Hospitality OS follows these mandatory rules.

* Business logic belongs to Services.
* Controllers remain thin.
* Providers communicate with external systems only.
* Workflows orchestrate business processes.
* Configuration replaces hardcoded values.
* Events describe business facts.
* Every feature is tested.
* Documentation is part of development.

---

# 19. Future Evolution

The Development Guidelines are intended to evolve together with Hospitality OS.

As new technologies, architectural patterns and platform capabilities are introduced, these guidelines should be updated while preserving the core principles of consistency, modularity and long-term maintainability.

The long-term objective is to ensure that Hospitality OS remains a coherent enterprise platform regardless of team size, contributor count or ecosystem growth.
