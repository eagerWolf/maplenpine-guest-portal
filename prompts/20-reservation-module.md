# File: `20-reservation-module.md`

# Hospitality OS

## Reservation Module

Version: 1.0
Status: Draft
Audience: Product Owners, Software Architects, Backend Developers, Frontend Developers

---

# 1. Purpose

The Reservation Module is the operational foundation of Hospitality OS.

A reservation represents the beginning of the guest journey and serves as the primary trigger for business workflows across the platform.

Unlike a traditional Property Management System (PMS), Hospitality OS does not consider reservations as isolated records. A reservation acts as a business context that connects guests, properties, services, workflows, providers and AI.

The Reservation Module is responsible for:

* reservation lifecycle
* guest association
* property allocation
* workflow initiation
* synchronization with external reservation systems

---

# 2. Vision

The Reservation Module should provide a unified reservation model independent of the reservation source.

Reservations may originate from:

* external PMS
* Channel Manager
* direct booking
* manual entry
* future booking engines

Regardless of origin, every reservation behaves identically within Hospitality OS.

---

# 3. Design Principles

## Reservation Centric

Most business processes begin with a reservation.

Examples:

* Guest Portal generation
* Check-in
* PIN generation
* Notifications
* Marketplace availability
* AI context
* Checkout

---

## Source Independent

Reservations should not contain provider-specific logic.

External systems communicate through Reservation Providers.

---

## Immutable History

Reservation history should never be lost.

Status changes create historical records.

Business events remain auditable.

---

## Workflow Driven

Business actions are never executed directly by reservation logic.

Reservation events trigger workflows.

---

## Provider Independent

Synchronization is delegated to Reservation Providers.

The Reservation Module remains independent of external vendors.

---

# 4. Reservation Architecture

```text
Reservation Source
        │
        ▼
Reservation Provider
        │
        ▼
Reservation Module
        │
        ▼
Workflow Engine
        │
        ▼
Platform Modules
```

The Reservation Module becomes the central orchestration point for the guest lifecycle.

---

# 5. Reservation Lifecycle

Every reservation follows a standard lifecycle.

```text
Created
    │
    ▼
Confirmed
    │
    ▼
Check-in Available
    │
    ▼
Checked In
    │
    ▼
Checked Out
    │
    ▼
Archived
```

Alternative states include:

* Pending
* Cancelled
* No Show
* Expired

---

# 6. Reservation Sources

Reservations may originate from multiple systems.

Examples:

* Manual Entry
* Bentral
* Internal Booking Engine
* Future PMS Providers

Every source is represented through the Reservation Provider interface.

---

# 7. Reservation Data

Each reservation includes core information.

Examples:

Reservation Information

* reservation identifier
* external identifier
* status
* arrival
* departure

Guest Information

* primary guest
* additional guests
* contact information

Property Information

* organization
* property
* unit

Operational Information

* source
* synchronization status
* workflow status

Modules may extend reservation data without modifying the core entity.

---

# 8. Guest Association

A reservation may contain multiple guests.

Examples:

* primary guest
* additional adults
* children

The primary guest owns the Guest Portal.

Guest permissions derive from the reservation.

---

# 9. Property Association

Every reservation belongs to exactly one unit.

Hierarchy:

```text
Organization
    │
Property
    │
Unit
    │
Reservation
```

Unit reassignment should preserve reservation history.

---

# 10. Workflow Integration

Reservation events trigger platform workflows.

Examples:

Reservation Created

↓

Generate Guest Portal

↓

Create Guest Session

↓

Generate Smart Access

↓

Send Welcome Notification

↓

Enable Marketplace

Every business process is coordinated by the Workflow Engine.

---

# 11. Provider Synchronization

Reservation synchronization supports:

* create
* update
* cancellation
* status synchronization

Synchronization must be idempotent.

Provider failures should never corrupt reservation state.

---

# 12. Marketplace Integration

Reservations determine Marketplace availability.

Examples:

* breakfast ordering window
* late checkout eligibility
* luggage storage
* airport transfers

Marketplace modules consume reservation context.

---

# 13. AI Integration

Reservations provide business context for the AI Platform.

Examples:

* arrival date
* departure date
* property
* enabled services
* guest language

The Reservation Module becomes one of the primary knowledge sources for AI.

---

# 14. Notifications

Reservation events generate notifications.

Examples:

* reservation confirmation
* check-in reminder
* arrival instructions
* checkout reminder

Notification delivery is delegated to the Notification Platform.

---

# 15. Reporting

Reservation reporting includes:

Business Metrics

* occupancy
* arrivals
* departures
* average stay

Operational Metrics

* synchronization status
* workflow completion
* check-in completion

Analytics support operational planning and business intelligence.

---

# 16. Administration

The Administration Backoffice provides reservation management.

Capabilities include:

* search
* filtering
* status changes
* workflow inspection
* synchronization history
* guest overview

Reservation management is the primary operational workspace.

---

# 17. Design Rules

The Reservation Module follows these mandatory rules.

* Reservations remain provider independent.
* Business logic is independent of reservation source.
* Reservation events trigger workflows.
* Guest permissions derive from reservations.
* Synchronization is idempotent.
* History is preserved.
* Reservation ownership is immutable.
* Modules extend reservations without modifying the core model.

---

# 18. Future Evolution

The Reservation Module is designed to become the universal reservation layer of Hospitality OS.

As new booking channels, PMS integrations and reservation workflows are introduced, they should integrate through Reservation Providers while preserving a single, consistent reservation model across the platform.

The Reservation Module remains the foundation of the guest journey and the primary entry point for business automation throughout Hospitality OS.
s