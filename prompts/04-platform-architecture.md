# Hospitality OS

## Platform Architecture

Version: 1.0
Status: Draft
Audience: Software Architects, Backend Developers, Frontend Developers, DevOps Engineers

---

# 1. Purpose

This document defines the overall architecture of Hospitality OS.

It describes how the platform is organized, how components communicate, and which architectural principles must be followed.

The architecture is intentionally designed to support long-term growth, modularity, provider independence and multi-tenant operation.

---

# 2. Architectural Principles

The platform follows several non-negotiable architectural principles.

## Modular

Every business capability is implemented as an independent module.

Modules may be enabled or disabled per property.

Modules communicate only through the platform.

Modules must never communicate directly with each other.

---

## Provider Based

Every external integration is implemented through a Provider.

Business logic communicates only with provider interfaces.

Provider implementations may be replaced without changing business logic.

---

## Configuration Driven

Business behavior is controlled through configuration.

Business logic must not contain customer-specific conditions.

Incorrect:

```php
if ($propertyId == 15) {
    ...
}
```

Correct:

```text
Property Configuration

Breakfast.enabled = true
Breakfast.provider = "Breakfast Bled"
```

---

## Event Driven

Business events are first-class platform concepts.

Examples:

* Reservation Created
* Guest Checked In
* Order Completed
* Payment Received
* Access Granted

Modules react to events rather than invoking each other directly.

---

## API First

Every capability exposed by the platform must be available through APIs.

The web administration and guest portal consume the same APIs.

---

## Stateless Services

Business services should remain stateless whenever possible.

Persistent state belongs to domain entities.

---

# 3. High-Level Architecture

```text
                    +----------------------+
                    |     Administration   |
                    +----------+-----------+
                               |
                               |
                    +----------v-----------+
                    |      REST API        |
                    +----------+-----------+
                               |
                +--------------+--------------+
                |                             |
      +---------v----------+        +---------v----------+
      |   Application      |        |   Guest Portal     |
      |      Services      |        |                    |
      +---------+----------+        +--------------------+
                |
      +---------v----------+
      |     Domain Core    |
      +---------+----------+
                |
     +----------+-----------+
     |                      |
+----v-----+         +------v------+
| Modules  |         | Providers   |
+----+-----+         +------+------+
     |                       |
     |              +--------+--------+
     |              | External Systems|
     |              +-----------------+
```

The Domain Core contains the shared business logic.

Modules extend platform capabilities.

Providers integrate external systems.

---

# 4. Platform Layers

The platform is divided into distinct architectural layers.

## Presentation Layer

Responsibilities:

* Administration UI
* Guest Portal
* APIs
* Authentication
* Authorization

Contains no business logic.

---

## Application Layer

Coordinates business use cases.

Responsibilities:

* workflows
* orchestration
* validation
* transactions
* permissions

Does not contain infrastructure code.

---

## Domain Layer

Contains the business model.

Includes:

* entities
* value objects
* domain services
* business rules

This layer is independent of Laravel or any external framework.

---

## Infrastructure Layer

Provides technical capabilities.

Examples:

* database
* queues
* storage
* notifications
* provider implementations
* caching
* external APIs

Infrastructure depends on the domain.

The domain never depends on infrastructure.

---

# 5. Platform Components

The platform consists of several major components.

## Domain Core

The central business model.

Examples:

* Reservation
* Property
* Guest
* Organization
* User

The Domain Core never depends on modules.

---

## Module Engine

Responsible for:

* module discovery
* module registration
* configuration
* lifecycle management

Modules are loaded dynamically.

---

## Provider Engine

Responsible for:

* provider registration
* provider selection
* provider execution
* provider health monitoring

Supports multiple providers of the same type.

---

## Event Bus

Responsible for publishing business events.

Examples:

ReservationCreated

GuestCheckedIn

PaymentCompleted

BreakfastOrdered

Modules subscribe to events instead of calling each other.

---

## Configuration Engine

Provides centralized configuration.

Supports:

* global configuration
* organization configuration
* property configuration
* module configuration
* provider configuration

---

## Permission Engine

Provides policy-based authorization.

Permissions are evaluated using:

User

↓

Role

↓

Policy

↓

Action

---

# 6. Module Architecture

Every module follows the same internal structure.

```text
Module

├── Configuration
├── Domain
├── Services
├── Providers
├── Events
├── Listeners
├── Policies
├── API
├── UI
└── Documentation
```

A module should be removable without affecting other modules.

---

# 7. Provider Architecture

Providers isolate third-party systems.

Example:

```text
Access Provider

Interface

│

├── EasyPin

├── Permanent PIN

├── eKey

└── Manual
```

The business logic communicates only with the interface.

---

# 8. Event Architecture

Business processes are event-driven.

Example:

```text
Reservation Created

↓

Guest Portal Generated

↓

Access Generated

↓

Notifications Sent

↓

Welcome Message Sent

↓

Upsell Offers Activated
```

Every step reacts to the previous event.

No direct coupling exists between modules.

---

# 9. Multi-Tenant Architecture

The platform is designed for multiple organizations.

```text
Platform

└── Organization

        ├── Users

        ├── Properties

        └── Providers
```

Every request executes within an organization context.

Data isolation is mandatory.

---

# 10. Extension Model

The platform is designed for continuous expansion.

New functionality should be added as:

* modules
* providers
* events
* services

Core platform changes should be rare.

---

# 11. Design Rules

The following rules are mandatory.

Modules must never call other modules directly.

Providers must never contain business logic.

Controllers must never contain business logic.

Repositories must never contain business logic.

Business rules belong inside Domain Services.

Configuration replaces hardcoded decisions.

Events replace direct dependencies.

Every external integration must use a Provider.

---

# 12. Scalability

The architecture supports:

* single apartment owners
* property managers
* hotels
* hospitality groups
* multi-country deployments

without architectural changes.

---

# 13. Long-Term Evolution

Hospitality OS is expected to evolve for many years.

The architecture therefore prioritizes:

* loose coupling
* replaceable integrations
* modular development
* stable domain model
* independent deployments
* long-term maintainability

Future modules should extend the platform rather than modify its core.

The Domain Core remains intentionally small and stable while modules, providers and integrations evolve independently.
