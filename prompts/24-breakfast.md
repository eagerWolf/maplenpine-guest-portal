# File: `24-breakfast.md`

# Hospitality OS

## Breakfast Module

Version: 1.0
Status: Draft
Audience: Product Owners, Software Architects, Backend Developers, Frontend Developers

---

# 1. Purpose

The Breakfast Module enables guests to order breakfast before or during their stay.

Rather than implementing breakfast ordering directly inside the Guest Portal, the module provides a reusable service that integrates with the Marketplace, Workflow Engine, Payment Module and Notification Platform.

The module supports multiple breakfast providers and different business models without changing the underlying architecture.

---

# 2. Vision

Guests should be able to order breakfast in just a few steps.

Property owners should configure breakfast offerings without changing application code.

Breakfast providers should receive digital orders through Hospitality OS.

The module should support both simple and complex breakfast operations.

---

# 3. Design Principles

## Marketplace Service

Breakfast is a Marketplace service.

Discovery, ordering and payment are managed by the Marketplace.

---

## Provider Based

Breakfast preparation is performed by Breakfast Providers.

Examples:

* Hotel Restaurant
* Local Bakery
* Breakfast Delivery Company
* Self Service

Providers remain interchangeable.

---

## Configuration Driven

Each property defines:

* breakfast availability
* ordering deadlines
* delivery schedule
* pricing
* available menus
* active providers

---

## Workflow Driven

Breakfast orders execute through the Workflow Engine.

Business logic remains outside the Guest Portal.

---

# 4. High-Level Architecture

```text
Guest Portal
      │
      ▼
Marketplace
      │
      ▼
Breakfast Module
      │
      ▼
Workflow Engine
      │
      ▼
Breakfast Provider
```

---

# 5. Breakfast Lifecycle

Every breakfast order follows a common lifecycle.

```text
Created
    │
    ▼
Validated
    │
    ▼
Confirmed
    │
    ▼
Prepared
    │
    ▼
Delivered
```

Alternative states include:

* Cancelled
* Rejected
* Refunded

---

# 6. Menu Management

Breakfast menus are configurable.

Each menu may include:

* name
* description
* images
* price
* availability
* dietary information
* allergens

Menus belong to providers.

---

# 7. Ordering Rules

Ordering may depend on:

* reservation dates
* guest count
* ordering deadline
* provider schedule
* property configuration
* inventory

Ordering rules are configurable.

---

# 8. Delivery

Supported delivery methods include:

* apartment delivery
* restaurant pickup
* buffet
* reception pickup

Delivery options depend on provider capabilities.

---

# 9. Workflow Integration

Example:

```text
Guest Orders Breakfast
        │
        ▼
Marketplace Order Created
        │
        ▼
Payment (optional)
        │
        ▼
Provider Notified
        │
        ▼
Breakfast Prepared
        │
        ▼
Delivered
```

---

# 10. Payment Integration

Breakfast may support:

* prepaid
* pay at checkout
* complimentary
* external payment

Payment execution is delegated to the Payment Module.

---

# 11. Notifications

Guests may receive:

* order confirmation
* preparation reminder
* delivery notification
* cancellation notice

Providers receive operational notifications.

---

# 12. AI Integration

The AI Platform may:

* recommend breakfast
* explain menu items
* answer allergy questions
* create breakfast orders
* modify existing orders

AI executes actions through approved Marketplace tools.

---

# 13. Administration

Property managers may configure:

* menus
* providers
* pricing
* delivery schedule
* ordering deadlines
* availability

Orders remain visible in the Administration Backoffice.

---

# 14. Reporting

Examples:

Business Metrics

* breakfasts sold
* revenue
* average order value

Operational Metrics

* provider response time
* delivery performance
* cancellation rate

---

# 15. Design Rules

The Breakfast Module follows these mandatory rules.

* Breakfast is a Marketplace service.
* Providers remain interchangeable.
* Menus are configurable.
* Orders execute through workflows.
* Payments remain independent.
* Notifications are automatic.
* AI uses Marketplace tools.
* Every order is auditable.

---

# 16. Future Evolution

The Breakfast Module is designed to support increasingly sophisticated food service operations.

Future capabilities may include recurring orders, subscription breakfasts, dietary personalization, dynamic pricing and real-time kitchen integration without changing the module architecture.

The long-term objective is to provide a flexible and provider-independent breakfast platform fully integrated into the Hospitality OS ecosystem.
