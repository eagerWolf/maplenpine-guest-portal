# File: `13-guest-portal.md`

# Hospitality OS

## Guest Portal

Version: 1.0
Status: Draft
Audience: Product Owners, UX Designers, Software Architects, Backend Developers, Frontend Developers

---

# 1. Purpose

The Guest Portal is the primary digital touchpoint between Hospitality OS and the guest.

Rather than requiring multiple applications, emails, PDFs or messaging conversations, the Guest Portal provides a single, personalized experience throughout the entire guest journey.

The Guest Portal is generated automatically for every reservation.

---

# 2. Vision

The Guest Portal should become the only application a guest needs before, during and after a stay.

Every relevant interaction should be available from one place.

Examples include:

* reservation details
* online check-in
* digital registration
* apartment guide
* smart access
* marketplace services
* AI assistant
* payments
* checkout

Guests should never need to search through emails or contact the host for routine questions.

---

# 3. Design Principles

## Reservation Centric

Every Guest Portal belongs to exactly one reservation.

The reservation determines:

* available features
* visible services
* permissions
* language
* property information

---

## Personalized

Every guest receives a personalized experience.

Examples:

* language
* property
* reservation dates
* enabled modules
* purchased services

---

## Modular

The Guest Portal contains no hardcoded features.

Every visible capability is contributed by a module.

Examples:

* Breakfast
* Weather
* FAQ
* Bike Rental
* AI Assistant
* Payments

---

## Mobile First

The Guest Portal is primarily designed for smartphones.

Desktop support is secondary.

---

## Configuration Driven

Property owners determine which modules appear in the portal.

No code changes should be required.

---

# 4. High-Level Architecture

```text
Reservation
      │
      ▼
Guest Portal
      │
 ┌────┼────────────────────────────┐
 ▼    ▼            ▼               ▼
Guide Services AI Assistant Payments
      │
      ▼
Workflow Engine
      │
      ▼
Modules
```

The Guest Portal acts as a presentation layer.

Business logic remains inside modules.

---

# 5. Portal Lifecycle

Every Guest Portal follows the reservation lifecycle.

```text
Reservation Created
        │
        ▼
Portal Generated
        │
        ▼
Check-in Opens
        │
        ▼
Stay Active
        │
        ▼
Checkout
        │
        ▼
Portal Archived
```

Portal availability is automatically managed by the Workflow Engine.

---

# 6. Portal Sections

A Guest Portal may contain multiple sections.

Core sections include:

* Reservation
* Check-in
* Apartment Guide
* Services
* Payments
* Messages
* AI Assistant
* Checkout

Additional sections are registered by modules.

---

# 7. Reservation

The reservation section displays:

* property name
* address
* arrival
* departure
* guest count
* reservation status
* arrival instructions
* contact information

Reservation information is always read-only.

---

# 8. Digital Check-in

The Guest Portal provides online check-in.

Examples include:

* guest information
* identity verification
* digital registration
* estimated arrival time
* acceptance of house rules

Completion of check-in may trigger business workflows.

---

# 9. Apartment Guide

The Apartment Guide contains structured information.

Examples:

* Wi-Fi
* parking
* appliance manuals
* house rules
* waste disposal
* emergency contacts
* nearby services

The guide is maintained by the Property module.

---

# 10. Services

Services are provided through the Marketplace.

Examples:

* Breakfast
* Bike Rental
* Airport Transfer
* Late Checkout
* Luggage Storage

Service availability depends on property configuration and reservation context.

---

# 11. Payments

The Guest Portal supports digital payments.

Examples:

* tourist tax
* security deposit
* outstanding balance
* marketplace orders

Payment execution is delegated to the Payment Module.

---

# 12. AI Assistant

The AI Assistant is available throughout the portal.

Guests may ask questions such as:

* How do I use the oven?
* Is parking included?
* Can I order breakfast?
* Where can I rent a bike?
* How do I connect to Wi-Fi?

The AI Platform answers using structured knowledge provided by Hospitality OS.

---

# 13. Notifications

The portal displays important guest notifications.

Examples:

* check-in reminders
* order confirmations
* payment reminders
* access information
* checkout reminders

Notification delivery is handled by the Notification Platform.

---

# 14. Smart Access

If enabled, the Guest Portal provides access-related functionality.

Examples:

* door PIN
* mobile key
* access validity
* garage access

Access management is delegated to the Smart Access module.

---

# 15. Guest Permissions

Guests may only access information belonging to their reservation.

The Guest Portal never exposes:

* other reservations
* administrative functionality
* internal configuration
* provider information

Permissions are evaluated for every request.

---

# 16. Customization

Property owners may configure:

* branding
* colors
* logo
* welcome message
* visible modules
* displayed services
* supported languages

Customization should not require application deployment.

---

# 17. Analytics

Guest Portal analytics include:

Business Metrics

* active portals
* completed check-ins
* marketplace conversions
* payment completion

Usage Metrics

* page views
* AI interactions
* most visited sections
* average session duration

Operational Metrics

* portal availability
* response time
* module usage

Analytics support continuous improvement of the guest experience.

---

# 18. Design Rules

The Guest Portal follows these mandatory rules.

* Every portal belongs to exactly one reservation.
* Business logic remains inside modules.
* Every feature is modular.
* AI uses the AI Platform.
* Services are provided through the Marketplace.
* Workflows are coordinated by the Workflow Engine.
* Guest permissions are enforced on every request.
* Mobile experience has priority over desktop.

---

# 19. Future Evolution

The Guest Portal is designed to become the digital companion for every guest throughout the entire hospitality journey.

As Hospitality OS evolves, new modules will automatically extend the portal by contributing additional capabilities while preserving a consistent user experience.

The Guest Portal should ultimately become the single interface through which guests interact with accommodation providers, local services and AI-powered assistance before, during and after every stay.
