# File: `14-admin-backoffice.md`

# Hospitality OS

## Administration Backoffice

Version: 1.0
Status: Draft
Audience: Product Owners, Software Architects, Backend Developers, Frontend Developers, System Administrators

---

# 1. Purpose

The Administration Backoffice is the operational control center of Hospitality OS.

It provides administrators, property managers and staff with a unified interface for managing every aspect of the platform.

The Backoffice is not merely an administration panel.

It is the primary operational workspace used to manage guests, reservations, properties, providers, modules and business processes.

---

# 2. Vision

The Backoffice should become the single interface required to operate hospitality businesses.

Users should never need to switch between multiple applications to complete operational tasks.

Every business capability exposed by Hospitality OS should be manageable through the Backoffice.

---

# 3. Design Principles

## Operational First

The Backoffice is designed for daily operational work.

Every screen should help users complete tasks quickly and efficiently.

---

## Modular

The Backoffice contains no hardcoded business modules.

Each module contributes its own:

* navigation
* pages
* widgets
* settings
* reports
* dashboards

---

## Role Based

Every visible feature depends on user permissions.

Users only see functionality they are authorized to access.

---

## Configuration Driven

The Backoffice adapts to:

* enabled modules
* installed providers
* organization configuration
* property configuration
* user permissions

No custom builds should be required.

---

## Consistent

All modules follow identical UI patterns.

Examples:

* tables
* forms
* filters
* dialogs
* actions
* dashboards

Users should experience a consistent interface regardless of module.

---

# 4. High-Level Architecture

```text
Administration User
        │
        ▼
Authentication
        │
        ▼
Authorization
        │
        ▼
Navigation
        │
        ▼
Dashboard
        │
        ▼
Registered Modules
        │
        ▼
Platform APIs
```

The Backoffice consumes the same public APIs as every other client.

---

# 5. Navigation System

Navigation is built dynamically.

Modules register navigation entries during startup.

Example:

```text
Dashboard

Reservations

Properties

Marketplace

Payments

Providers

Configuration

Reports

Administration
```

Navigation should never be hardcoded.

---

# 6. Dashboard

The Dashboard provides an overview of operational activity.

Examples:

* arrivals today
* departures today
* active guests
* pending check-ins
* unpaid balances
* new marketplace orders
* maintenance requests
* provider status

Widgets are registered by individual modules.

---

# 7. Reservation Management

Reservation management provides:

* search
* filtering
* status management
* guest overview
* payment overview
* workflow status
* activity history

Reservations remain the central operational entity.

---

# 8. Property Management

Property management includes:

* properties
* units
* amenities
* smart devices
* branding
* services
* portal configuration

Each property is managed independently.

---

# 9. User Management

The Backoffice manages platform users.

Examples:

* Owners
* Administrators
* Reception
* Housekeeping
* Maintenance
* Finance

Guests are not Backoffice users.

---

# 10. Module Management

Administrators manage installed modules.

Capabilities include:

* installation
* enable/disable
* configuration
* version information
* dependency status

Module lifecycle is managed centrally.

---

# 11. Provider Management

Provider management includes:

* provider configuration
* credentials
* health status
* capabilities
* diagnostics
* synchronization history

Providers are managed independently of business modules.

---

# 12. Workflow Monitoring

Administrators should be able to inspect workflow execution.

Examples:

* running workflows
* completed workflows
* failed workflows
* retries
* execution history

Workflow execution should be transparent.

---

# 13. AI Management

The Backoffice provides AI administration.

Capabilities include:

* AI provider selection
* prompt configuration
* knowledge sources
* tool registration
* usage statistics
* token consumption

AI configuration should remain centralized.

---

# 14. Reporting

Reports aggregate operational data.

Examples:

* occupancy
* revenue
* marketplace sales
* guest statistics
* provider performance
* payment reports

Modules may contribute additional reports.

---

# 15. Configuration

The Backoffice exposes configuration at multiple levels.

Platform

↓

Organization

↓

Property

↓

Module

↓

Provider

Configuration inheritance should be visible to administrators.

---

# 16. Audit & Monitoring

Administrators should have access to:

* audit logs
* API activity
* provider status
* workflow history
* AI usage
* security events

Monitoring supports troubleshooting and compliance.

---

# 17. Search

The Backoffice provides global search.

Examples:

* reservation number
* guest
* property
* provider
* payment
* workflow
* service order

Search should return results across all registered modules.

---

# 18. Design Rules

The Administration Backoffice follows these rules.

* Business logic remains outside the UI.
* Navigation is registered dynamically.
* Modules own their own pages.
* APIs are the only communication mechanism.
* Authorization is enforced on every action.
* Configuration replaces customization.
* Widgets are independently deployable.
* Every screen should be responsive.

---

# 19. Future Evolution

The Administration Backoffice is designed as a modular operational workspace.

As Hospitality OS grows, new modules should extend the Backoffice by registering additional pages, dashboards, reports and widgets without modifying existing functionality.

The long-term objective is to provide a unified administration platform capable of managing every operational aspect of modern hospitality businesses from a single, consistent interface.
