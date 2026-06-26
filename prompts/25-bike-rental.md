{"variant":"document","id":"58421"}

# File: `25-bike-rental.md`

# Hospitality OS

## Bike Rental Module

Version: 1.0
Status: Draft
Audience: Product Owners, Software Architects, Backend Developers, Frontend Developers

---

# 1. Purpose

The Bike Rental Module enables guests to reserve and rent bicycles through Hospitality OS.

The module supports multiple rental providers, different bicycle types and flexible pricing models while providing a consistent guest experience.

Bike Rental is implemented as a Marketplace service and integrates with the Workflow Engine, Payment Module, Notification Platform and AI Platform.

---

# 2. Vision

Guests should be able to reserve bicycles in just a few minutes.

Property owners should offer bike rentals without managing operational details.

Rental providers should receive structured digital reservations.

The module should support everything from a single property-owned bicycle to professional rental companies.

---

# 3. Design Principles

## Marketplace Service

Bike Rental is a Marketplace service.

Discovery and ordering are managed by the Marketplace.

---

## Provider Based

Bicycles are supplied by Bike Rental Providers.

Examples:

* Property Owner
* Local Bike Shop
* Professional Rental Company

---

## Configuration Driven

Each property defines:

* available providers
* rental rules
* pricing
* pickup location
* operating hours

---

## Inventory Aware

Unlike some Marketplace services, Bike Rental manages inventory availability.

Only available bicycles may be reserved.

---

# 4. High-Level Architecture

```text
Guest Portal
      │
      ▼
Marketplace
      │
      ▼
Bike Rental Module
      │
      ▼
Workflow Engine
      │
      ▼
Bike Rental Provider
```

---

# 5. Rental Lifecycle

Every rental follows a common lifecycle.

```text
Created
    │
    ▼
Confirmed
    │
    ▼
Reserved
    │
    ▼
Picked Up
    │
    ▼
Returned
```

Alternative states include:

* Cancelled
* No Show
* Overdue
* Refunded

---

# 6. Inventory Management

Each provider manages bicycle inventory.

Inventory may include:

* standard bicycles
* electric bicycles
* mountain bikes
* children's bicycles
* accessories

Availability is evaluated before confirmation.

---

# 7. Rental Rules

Rental rules may include:

* minimum rental duration
* maximum rental duration
* opening hours
* advance booking limits
* age restrictions
* deposit requirements

Rules are configurable.

---

# 8. Pickup & Return

Supported options include:

* property reception
* rental shop
* self-service pickup
* delivery

Pickup instructions are displayed inside the Guest Portal.

---

# 9. Workflow Integration

Example:

```text
Guest Reserves Bike
        │
        ▼
Inventory Checked
        │
        ▼
Payment Processed
        │
        ▼
Reservation Confirmed
        │
        ▼
Provider Notified
```

---

# 10. Payment Integration

Supported payment models include:

* prepaid
* pay on pickup
* security deposit
* complimentary

Payment processing is delegated to the Payment Module.

---

# 11. Notifications

Guests receive notifications about:

* reservation confirmation
* pickup reminder
* return reminder
* overdue rental

Providers receive reservation updates.

---

# 12. AI Integration

The AI Platform may:

* recommend bicycle types
* answer rental questions
* suggest cycling routes
* create reservations
* explain pricing

---

# 13. Administration

Property managers configure:

* providers
* inventory
* pricing
* rental rules
* pickup locations

Administrators may inspect rental history and provider performance.

---

# 14. Reporting

Business Metrics

* rentals
* revenue
* utilization

Operational Metrics

* inventory usage
* provider performance
* average rental duration

---

# 15. Design Rules

The Bike Rental Module follows these mandatory rules.

* Bike Rental is a Marketplace service.
* Inventory determines availability.
* Providers remain interchangeable.
* Payments remain independent.
* Workflows coordinate operations.
* AI uses Marketplace tools.
* Every rental is auditable.
* Configuration replaces customization.

---

# 16. Future Evolution

The Bike Rental Module is designed to support increasingly advanced rental operations.

Future capabilities may include GPS-enabled bicycles, smart locks, maintenance scheduling, fleet optimization and dynamic pricing while preserving the existing architecture.

The long-term objective is to provide a flexible, provider-independent bicycle rental platform fully integrated with Hospitality OS.
