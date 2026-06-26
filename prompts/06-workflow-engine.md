# Hospitality OS

## Provider Framework

Version: 1.0
Status: Draft
Audience: Software Architects, Backend Developers, Integration Developers

---

# 1. Purpose

Hospitality OS integrates with a wide range of external systems.

Examples include:

* Property Management Systems
* Smart Lock Systems
* Payment Providers
* Notification Services
* Weather Services
* AI Providers
* Identity Verification
* Booking Platforms

To avoid vendor lock-in, every external integration is implemented through a Provider.

Business logic communicates only with Provider Interfaces.

Provider implementations remain isolated from the rest of the platform.

---

# 2. Design Principles

The Provider Framework is based on the following principles.

## Vendor Independence

Business logic must never reference a specific vendor.

Correct:

```text
Payment Provider
```

Incorrect:

```text
Stripe Service
```

The same rule applies to every integration.

---

## Replaceable

Any provider should be replaceable without modifying business logic.

Example:

Today

```text
EasyPin
```

Tomorrow

```text
eKey
```

The application code remains unchanged.

---

## Multiple Implementations

Several providers of the same type may coexist.

Example:

Breakfast Providers

* Breakfast Bled
* Hotel Restaurant
* Local Bakery

Each property selects the appropriate provider through configuration.

---

## Stateless

Providers should not contain business state.

Business entities belong to the Domain Model.

Providers only translate requests between Hospitality OS and external systems.

---

# 3. Provider Types

The framework supports different provider categories.

Core Providers

* Reservation Provider
* Payment Provider
* Access Provider
* Notification Provider

Platform Providers

* AI Provider
* Weather Provider
* Maps Provider
* Translation Provider

Marketplace Providers

* Breakfast Provider
* Bike Rental Provider
* Transfer Provider
* Wellness Provider

Infrastructure Providers

* Storage Provider
* Email Provider
* SMS Provider
* Push Provider

Future provider categories may be introduced without changing the framework.

---

# 4. Provider Architecture

```text
Business Logic
       │
       ▼
Provider Interface
       │
       ▼
Provider Manager
       │
       ▼
Selected Provider
       │
       ▼
External Service
```

The business layer never communicates directly with external APIs.

---

# 5. Provider Registry

Every provider registers itself with the platform.

Registration includes:

* unique identifier
* provider type
* version
* capabilities
* configuration schema
* health check
* supported features

The registry allows providers to be discovered dynamically.

---

# 6. Provider Manifest

Each provider includes a manifest.

Example:

```yaml
id: easypin

type: access

name: EasyPin

version: 1.0

supports:

- create_pin
- delete_pin
- update_pin

configuration:

- api_key
- endpoint

health_check: true
```

The manifest is used during provider registration.

---

# 7. Provider Selection

Providers are selected through configuration.

Example hierarchy:

Platform Default

↓

Organization Default

↓

Property Override

↓

Module Override

This allows different properties to use different vendors simultaneously.

---

# 8. Provider Capabilities

Providers may support different feature sets.

Example:

Access Provider A

* Permanent PIN
* Reservation PIN

Access Provider B

* Reservation PIN
* Mobile Key
* Remote Unlock

Business logic detects supported capabilities before execution.

---

# 9. Provider Configuration

Every provider owns its own configuration.

Example:

```yaml
provider: easypin

api_key: ****

endpoint: https://...

timeout: 5

enabled: true
```

Configuration is validated during registration.

---

# 10. Provider Health

The platform continuously monitors provider availability.

Health states:

* Healthy
* Degraded
* Unavailable
* Disabled

Health information is visible in the administration interface.

---

# 11. Error Handling

Provider failures must never crash the platform.

Instead:

* errors are logged
* retries are scheduled
* fallback providers may be used
* administrators are notified

Business logic remains isolated from transport errors.

---

# 12. Provider Events

Providers publish platform events.

Examples:

PaymentCompleted

PINCreated

NotificationDelivered

WeatherUpdated

ReservationImported

Modules react to these events rather than polling external systems.

---

# 13. Provider Versioning

Providers evolve independently.

Example:

```text
EasyPin v1.0

↓

EasyPin v2.0
```

Multiple versions may coexist during migration.

---

# 14. Security

Provider credentials are never stored in source code.

Secrets are managed securely.

Providers receive only the permissions they require.

Sensitive information is encrypted at rest.

Audit logs record all provider interactions.

---

# 15. Testing

Every provider must support:

* unit tests
* integration tests
* mock implementations
* sandbox environments where available

The platform should allow switching between production and test providers.

---

# 16. Marketplace Providers

Marketplace services are implemented as providers.

Examples:

Breakfast

Bike Rental

Airport Transfer

Laundry

Wellness

This allows multiple competing vendors to provide the same service.

Each property chooses which providers are available to guests.

---

# 17. Design Rules

Providers must:

* never contain business rules
* never modify domain entities directly
* implement only one provider type
* expose capabilities through interfaces
* validate configuration before activation
* support health checks
* emit platform events
* isolate third-party APIs

---

# 18. Long-Term Vision

The Provider Framework enables Hospitality OS to remain independent of any external vendor.

As new technologies and service providers emerge, they can be integrated by implementing new providers rather than modifying the platform itself.

This architecture ensures long-term flexibility, protects customers from vendor lock-in, and allows Hospitality OS to evolve into an open integration platform for the hospitality industry.
