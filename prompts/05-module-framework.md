# Hospitality OS

## Module Framework

Version: 1.0
Status: Draft
Audience: Software Architects, Backend Developers, Frontend Developers

---

# 1. Purpose

Hospitality OS is built around independent business modules.

A module represents a self-contained business capability that can be enabled or disabled without affecting the rest of the platform.

Examples include:

* Breakfast
* Bike Rental
* Luggage Storage
* Airport Transfer
* AI Assistant
* Payments
* FAQ
* Recommendations
* Smart Home
* Housekeeping

Every module follows the same lifecycle, structure and integration rules.

---

# 2. Module Principles

Every module must follow these principles.

## Independent

A module owns its own business logic.

Modules never call each other directly.

---

## Configurable

Modules are enabled through configuration.

No module may assume it is always active.

---

## Replaceable

Removing a module must not affect other modules.

Only functionality provided by the removed module disappears.

---

## Extensible

A module may expose extension points for future modules.

---

## Provider Based

If a module communicates with external systems, it must do so through Providers.

---

# 3. Module Lifecycle

Every module follows the same lifecycle.

```text
Installed

↓

Configured

↓

Enabled

↓

Running

↓

Disabled

↓

Uninstalled
```

Modules should preserve configuration even when disabled.

---

# 4. Module Structure

Each module follows a standardized directory layout.

```text
Module

├── Config
├── Domain
├── Services
├── Providers
├── API
├── Events
├── Listeners
├── Policies
├── Jobs
├── Migrations
├── Views
├── Components
├── Assets
├── Tests
└── Documentation
```

Every module should be understandable in isolation.

---

# 5. Module Manifest

Every module contains a manifest describing its capabilities.

Example:

```yaml
id: breakfast

name: Breakfast

version: 1.0

category: Services

dependencies: []

providers:
  - breakfast

permissions:
  - breakfast.view
  - breakfast.manage

events:
  listens:
    - ReservationCreated
    - GuestCheckedIn

publishes:
    - BreakfastOrdered
```

The platform reads manifests during module registration.

---

# 6. Module Categories

Modules are grouped into logical categories.

Core

* Reservations
* Guests
* Properties
* Users

Guest Experience

* Guest Portal
* FAQ
* Recommendations
* AI Assistant
* Digital Guide

Services

* Breakfast
* Bike Rental
* Airport Transfer
* Wellness
* Luggage Storage

Operations

* Housekeeping
* Maintenance
* Cleaning
* Inventory

Commerce

* Payments
* Marketplace
* Coupons
* Gift Cards

Infrastructure

* Notifications
* Providers
* Analytics
* Reporting

---

# 7. Module Dependencies

Dependencies should be minimized.

Preferred:

```text
Platform

↓

Breakfast
```

Avoid:

```text
Breakfast

↓

Bike Rental

↓

AI Assistant

↓

Payments
```

Instead, modules communicate through events.

---

# 8. Configuration

Each module owns its own configuration.

Example:

```yaml
Breakfast

enabled: true

provider: breakfast-bled

cutoff_time: 21:00

max_orders_per_day: 40

delivery_time: 08:00
```

Configuration is isolated from business logic.

---

# 9. Permissions

Modules define their own permissions.

Example:

```text
breakfast.view

breakfast.create

breakfast.update

breakfast.delete

breakfast.manage
```

Permissions are registered automatically during installation.

---

# 10. Events

Modules publish business events.

Example:

BreakfastOrdered

BreakfastCancelled

BreakfastDelivered

Modules may subscribe to events from any other module.

No direct dependencies exist.

---

# 11. API

A module may expose REST endpoints.

Example:

```text
GET /api/breakfast

POST /api/breakfast/orders

DELETE /api/breakfast/orders/{id}
```

API endpoints belong exclusively to the module.

---

# 12. UI Integration

Modules may contribute UI components.

Examples:

Administration

* navigation items
* settings pages
* dashboards
* widgets

Guest Portal

* cards
* menu items
* checkout steps
* information panels

The platform determines where components appear.

---

# 13. Navigation Registration

Modules never modify navigation directly.

Instead they register navigation entries.

Example:

```yaml
Administration

Settings

↓

Breakfast

↓

Orders
```

The navigation tree is built dynamically.

---

# 14. Dashboard Widgets

Modules may register dashboard widgets.

Examples:

Today's Breakfast Orders

Pending Check-ins

Weather

Upcoming Reservations

Revenue

Widgets can be enabled or disabled independently.

---

# 15. Background Jobs

Modules may register scheduled jobs.

Examples:

Generate PINs

Send Notifications

Import Reservations

Expire Coupons

Jobs are isolated inside the module.

---

# 16. Database Ownership

Each module owns its own database objects.

Examples:

breakfast_orders

breakfast_menu

breakfast_providers

No module modifies another module's tables.

Shared entities remain inside the Domain Core.

---

# 17. Module Communication

Modules communicate exclusively through:

* Events
* Domain Services
* Provider Interfaces
* Public APIs (when required)

Direct access to another module's internal classes is prohibited.

---

# 18. Versioning

Every module has its own version.

Example:

```text
Breakfast

v1.2.0
```

Modules may evolve independently of the platform.

---

# 19. Installation

Installing a module performs:

* migrations
* permission registration
* configuration registration
* event registration
* navigation registration
* widget registration
* API registration

No manual steps should be required.

---

# 20. Design Rules

Every module must:

* be independently testable
* own its configuration
* own its API
* own its permissions
* own its migrations
* own its documentation
* own its UI components
* publish business events
* avoid direct dependencies

Modules should behave like independent products running on a shared platform.

---

# 21. Long-Term Vision

The Module Framework is the foundation of Hospitality OS.

Future development should consist primarily of building new modules rather than modifying the platform core.

This architecture allows Hospitality OS to evolve into an extensible ecosystem where internal teams, partners and third-party developers can deliver new capabilities while preserving a stable and maintainable platform.
