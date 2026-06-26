# Hospitality OS

## Domain Model

Version: 1.0
Status: Draft
Audience: Software Architects, Backend Developers, Frontend Developers, Product Owners

---

# 1. Purpose

The Domain Model defines the core business entities of Hospitality OS and the relationships between them.

It represents the business language shared by product owners, developers, architects and future integrations.

The domain model is independent of:

* database design
* REST API
* UI implementation
* programming language

It describes the business concepts that make up Hospitality OS.

---

# 2. Design Principles

The domain model follows several architectural principles.

## Business First

Entities represent business concepts rather than technical implementation.

Examples:

* Reservation
* Guest
* Property
* Booking
* Provider

instead of

* DatabaseRecord
* DTO
* APIObject

---

## Stable Core

Core entities should change very rarely.

New functionality should be introduced by extending existing entities rather than modifying them.

---

## Provider Independent

No entity depends on an external vendor.

For example:

Reservation

never

BentralReservation

Likewise:

Payment

never

StripePayment

Vendor-specific information belongs inside Provider implementations.

---

## Module Independent

Core entities must not depend on optional modules.

Example:

Reservation exists regardless of whether Breakfast or AI Assistant modules are enabled.

---

# 3. Domain Hierarchy

The platform is organized as a hierarchical domain.

```text
Platform
    │
    └── Organization
            │
            └── Property
                    │
                    ├── Unit
                    │       │
                    │       └── Reservation
                    │               │
                    │               ├── Guest
                    │               ├── Access
                    │               ├── Orders
                    │               ├── Payments
                    │               ├── Messages
                    │               └── Services
                    │
                    ├── Devices
                    ├── Modules
                    ├── Providers
                    └── Staff
```

---

# 4. Core Entities

## Platform

Represents the Hospitality OS installation.

Responsibilities:

* organizations
* global configuration
* provider registry
* marketplace
* administration

---

## Organization

Represents one customer using Hospitality OS.

Examples:

* Apartment owner
* Property management company
* Hotel group

Owns:

* users
* properties
* providers
* settings

---

## Property

Represents a physical accommodation location.

Examples:

* Apartment
* Hotel
* Villa
* Camp
* RV Park

Contains:

* units
* devices
* services
* configuration
* modules

---

## Unit

Represents a rentable accommodation.

Examples:

* Apartment
* Room
* Cabin
* Tent
* RV Pitch

A property may contain one or many units.

---

## Reservation

Represents one guest stay.

Lifecycle:

Created

↓

Confirmed

↓

Checked In

↓

Active Stay

↓

Checked Out

↓

Archived

Reservation is one of the central entities of Hospitality OS.

---

## Guest

Represents a person staying at the property.

A guest may:

* make payments
* receive notifications
* order services
* access the Guest Portal
* communicate with AI Assistant

A reservation may contain multiple guests.

---

## User

Represents an authenticated user of the administration system.

Examples:

* Owner
* Receptionist
* Cleaner
* Administrator

Guests are **not** Users.

---

# 5. Supporting Entities

Examples include:

Access

Payment

Order

Invoice

Notification

Document

Message

Review

Task

FAQ

Knowledge Article

Recommendation

Weather

Device

Service

Provider

Module

Role

Permission

Audit Log

Attachment

These entities support the core business processes.

---

# 6. Providers

External systems are abstracted using Providers.

Examples:

Reservation Provider

Payment Provider

Access Provider

Notification Provider

Weather Provider

AI Provider

Each provider implements a common interface.

Business logic never communicates directly with external vendors.

---

# 7. Modules

Modules extend the platform.

Examples:

Breakfast

Bike Rental

Airport Transfer

FAQ

Recommendations

Payments

AI Assistant

Marketplace

Analytics

A module may introduce additional entities but must not modify the core domain.

---

# 8. Relationships

```text
Organization
    │
    ├── Users
    ├── Properties
    └── Providers

Property
    │
    ├── Units
    ├── Devices
    ├── Modules
    ├── Services
    └── Staff

Unit
    │
    └── Reservations

Reservation
    │
    ├── Guests
    ├── Orders
    ├── Payments
    ├── Messages
    ├── Access
    └── Documents
```

---

# 9. Ownership Rules

Each entity has a single owner.

Examples:

Platform owns Organizations.

Organization owns Properties.

Property owns Units.

Unit owns Reservations.

Reservation owns Orders.

This ownership hierarchy simplifies authorization, auditing and data isolation.

---

# 10. Entity Lifecycles

Every entity has a lifecycle.

Example:

Reservation

Created

↓

Confirmed

↓

Checked In

↓

Checked Out

↓

Archived

Orders

Created

↓

Accepted

↓

Delivered

↓

Completed

↓

Archived

Payments

Pending

↓

Authorized

↓

Captured

↓

Refunded

↓

Closed

Each lifecycle is independent.

---

# 11. Extensibility

New modules should introduce new entities rather than modifying existing ones.

Example:

Restaurant Module

adds

RestaurantReservation

RestaurantOrder

RestaurantMenu

instead of extending Reservation with restaurant-specific properties.

This keeps the core domain stable.

---

# 12. Domain Boundaries

The Hospitality OS domain intentionally excludes implementation details.

Not part of the domain model:

* database tables
* HTTP endpoints
* queues
* events
* controllers
* repositories
* UI components

These are specified in separate architectural documents.

---

# 13. Long-Term Evolution

The Domain Model is expected to remain stable for many years.

Future modules should integrate by extending the domain rather than redefining it.

A stable domain model enables:

* long-term maintainability
* independent module development
* provider interoperability
* API consistency
* AI knowledge representation
* scalable enterprise architecture
