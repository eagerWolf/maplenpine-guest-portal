# File: `12-marketplace.md`

# Hospitality OS

## Marketplace

Version: 1.0
Status: Draft
Audience: Product Owners, Software Architects, Backend Developers, Frontend Developers

---

# 1. Purpose

The Marketplace is a core platform capability of Hospitality OS.

It enables property owners to offer digital services to guests through a unified platform while connecting guests with one or more local service providers.

The Marketplace is independent of any specific service.

Whether a guest orders breakfast, airport transfer, bike rental or late checkout, every service follows the same architecture, ordering model and workflow.

The Marketplace is responsible for:

* service discovery
* service presentation
* ordering
* provider selection
* pricing
* workflow orchestration
* analytics
* revenue generation

Business rules remain inside individual service modules.

---

# 2. Vision

The Marketplace should become the central commerce platform for hospitality services.

Guests interact with a single, consistent experience.

Property owners decide which services are available.

Service providers fulfill requests.

Hospitality OS coordinates the entire lifecycle.

The Marketplace should enable every accommodation to offer a rich digital experience without building custom integrations.

---

# 3. Marketplace Principles

## Service Independent

The Marketplace understands services as generic business entities.

It does not contain service-specific logic.

Examples:

* Breakfast
* Bike Rental
* Airport Transfer
* Wellness
* Laundry
* Parking
* Activities

Every service follows the same lifecycle.

---

## Provider Independent

The Marketplace never communicates directly with external vendors.

Every provider is resolved through the Provider Framework.

Changing a provider must never affect Marketplace logic.

---

## Module Based

Every service is implemented as an independent module.

Examples:

Breakfast Module

Bike Rental Module

Airport Transfer Module

Marketplace coordinates ordering but never implements service logic.

---

## Configuration Driven

Every property controls:

* available services
* provider selection
* pricing
* availability
* ordering rules
* visibility

No code changes should be required.

---

## Workflow Driven

Every order is executed through the Workflow Engine.

Marketplace creates orders.

Workflow Engine coordinates execution.

Modules implement business logic.

Providers fulfill the service.

---

# 4. Marketplace Architecture

```text
Guest Portal
      │
      ▼
Marketplace
      │
      ▼
Service Catalog
      │
      ▼
Marketplace Order
      │
      ▼
Workflow Engine
      │
      ▼
Service Module
      │
      ▼
Provider Framework
      │
      ▼
External Provider
```

Each layer has a clearly defined responsibility.

---

# 5. Marketplace Participants

The Marketplace connects four business participants.

```text
Guest
    │
    ▼
Hospitality OS Marketplace
    │
 ┌──┴───────────────┐
 ▼                  ▼
Property Owner   Service Provider
```

Each participant receives value from the platform.

---

# 6. Service Catalog

The Marketplace maintains a centralized service catalog.

Each service contains:

* identifier
* name
* description
* category
* icon
* images
* provider type
* pricing model
* availability rules
* supported languages

Example categories:

* Food & Beverage
* Transportation
* Activities
* Wellness
* Property Services
* Equipment Rental

New categories may be added without changing Marketplace architecture.

---

# 7. Service Availability

A service is visible only if all availability rules are satisfied.

Availability may depend on:

* enabled module
* configured provider
* reservation status
* guest eligibility
* booking dates
* property configuration
* provider schedule
* inventory
* business rules

Availability is evaluated dynamically.

---

# 8. Pricing Model

Marketplace supports multiple pricing strategies.

Examples:

* Fixed Price
* Per Person
* Per Reservation
* Per Night
* Per Quantity
* Dynamic Pricing
* Provider Defined Pricing

Pricing strategy is defined by the service module.

---

# 9. Order Lifecycle

Every Marketplace order follows the same lifecycle.

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
Accepted
    │
    ▼
In Progress
    │
    ▼
Completed
```

Alternative states include:

* Cancelled
* Rejected
* Expired
* Refunded

Modules may extend the lifecycle when required.

---

# 10. Provider Selection

Each service may have one or more providers.

Example:

Breakfast

├── Hotel Restaurant

├── Bakery A

└── Bakery B

Selection strategies include:

* property default
* guest selection
* availability
* priority
* cost
* business rules

Provider resolution is delegated to the Provider Framework.

---

# 11. Payment Integration

Marketplace is independent of payment execution.

Supported payment models include:

* immediate payment
* payment during stay
* payment at checkout
* invoice
* free service

Payment processing is delegated to the Payment Module.

---

# 12. Workflow Integration

Marketplace integrates directly with the Workflow Engine.

Example:

```text
Guest Orders Breakfast
        │
        ▼
Marketplace Order Created
        │
        ▼
Workflow Started
        │
        ▼
Provider Selected
        │
        ▼
Provider Notified
        │
        ▼
Order Completed
```

Marketplace coordinates the process without implementing service-specific logic.

---

# 13. Guest Experience

Guests interact with a unified Marketplace.

Capabilities include:

* browse services
* search
* filter by category
* place orders
* pay
* track order status
* receive notifications
* review completed services

The experience should remain consistent regardless of service type.

---

# 14. Property Management

Property owners configure:

* enabled services
* providers
* pricing
* schedules
* ordering deadlines
* cancellation policies
* service visibility
* promotions

Configuration changes should take effect without redeployment.

---

# 15. Provider Experience

Providers interact exclusively through Provider Interfaces.

Typical operations include:

* receive orders
* accept or reject requests
* update order status
* synchronize availability
* complete fulfillment

Providers never communicate directly with Marketplace internals.

---

# 16. AI Integration

The AI Platform integrates with the Marketplace.

AI may:

* recommend services
* explain available options
* compare prices
* answer service-related questions
* create Marketplace orders using approved tools

AI always respects Marketplace permissions and workflows.

---

# 17. Analytics

Marketplace analytics include:

Business Metrics

* revenue
* commissions
* average order value
* conversion rate

Operational Metrics

* provider response time
* fulfillment time
* cancellation rate

Marketplace Metrics

* most popular services
* seasonal demand
* provider performance
* property performance

Analytics support business optimization and reporting.

---

# 18. Design Rules

The Marketplace follows these mandatory rules.

* Marketplace contains no service-specific business logic.
* Every service is implemented as an independent module.
* Providers are resolved through the Provider Framework.
* Workflows are orchestrated by the Workflow Engine.
* Payments remain independent of Marketplace logic.
* Configuration determines service availability.
* AI interacts only through approved platform tools.
* Guest experience must remain consistent across all services.

---

# 19. Future Evolution

The Marketplace is designed as a long-term commerce platform for Hospitality OS.

New services should be introduced by adding new modules and providers rather than modifying the Marketplace itself.

As the ecosystem grows, the Marketplace should evolve into a digital service network connecting guests, accommodation providers and local businesses through a unified, configurable and extensible platform.
