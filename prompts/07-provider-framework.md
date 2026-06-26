# Hospitality OS

## Provider Framework

Version: 1.0
Status: Draft
Audience: Software Architects, Backend Developers, Integration Developers

---

# 1. Purpose

Hospitality OS integrates with a wide range of external systems.

Examples include:

* Property Management Systems (PMS)
* Smart Lock Systems
* Payment Gateways
* Messaging Platforms
* Weather Services
* AI Providers
* Identity Verification
* Marketplace Services

To prevent vendor lock-in and ensure long-term maintainability, all external integrations are implemented through the Provider Framework.

Business logic never communicates directly with third-party systems.

Instead, it communicates through standardized Provider Interfaces.

---

# 2. Architecture Overview

The Provider Framework separates business logic from external implementations.

```text
                Business Logic
                      │
                      ▼
              Provider Interface
                      │
                      ▼
              Provider Manager
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
     EasyPin      SumUp      Bentral
          │           │           │
          ▼           ▼           ▼
     External APIs and Services
```

This separation allows external systems to change without affecting the platform.

---

# 3. Provider Principles

The Provider Framework is built on the following principles.

## Vendor Independence

Business logic must never depend on a specific vendor.

Correct:

* Payment Provider
* Access Provider

Incorrect:

* Stripe Service
* EasyPin Service

---

## Single Responsibility

Each provider implements exactly one provider type.

Examples:

* Reservation Provider
* Payment Provider
* Notification Provider

A provider must never implement unrelated responsibilities.

---

## Replaceable

Providers are interchangeable.

Replacing one provider with another must require only configuration changes.

No application code should change.

---

## Configurable

Providers are selected through configuration.

Selection may occur at:

* Platform level
* Organization level
* Property level
* Module level

---

## Observable

Provider execution must be fully observable.

Every execution should generate:

* logs
* metrics
* execution time
* failures
* audit information

---

# 4. Provider Types

Hospitality OS defines several provider categories.

## Reservation Providers

Import and synchronize reservations.

Examples:

* Bentral
* Internal Reservation Engine
* Future PMS integrations

---

## Access Providers

Manage guest access.

Examples:

* EasyPin
* eKey
* Manual Access
* Permanent PIN

---

## Payment Providers

Handle financial transactions.

Examples:

* SumUp
* Stripe
* PayPal

---

## Notification Providers

Deliver messages.

Examples:

* Email
* SMS
* WhatsApp
* Push Notifications

---

## AI Providers

Provide artificial intelligence capabilities.

Examples:

* OpenAI
* Anthropic
* Local LLM
* Future AI services

---

## Weather Providers

Provide weather information.

Examples:

* OpenWeather
* National Weather APIs

---

## Marketplace Providers

Provide guest services.

Examples:

* Breakfast
* Bike Rental
* Airport Transfer
* Wellness
* Laundry

The framework allows multiple providers of the same service.

---

# 5. Provider Registration

Every provider must register itself with the platform.

Registration includes:

* unique identifier
* provider type
* version
* capabilities
* configuration schema
* supported modules
* health endpoint

Registration should happen automatically during application startup.

---

# 6. Provider Manifest

Each provider exposes a manifest.

Example:

```yaml
id: easypin

name: EasyPin

type: access

version: 1.0

capabilities:

  - reservation_pin
  - revoke_pin

configuration:

  - api_key
  - endpoint
  - timeout
```

The platform uses the manifest to validate compatibility.

---

# 7. Provider Resolution

When a provider is required, Hospitality OS resolves it using the following hierarchy.

```text
Module Override
        │
Property Override
        │
Organization Default
        │
Platform Default
```

This enables different organizations and properties to use different providers simultaneously.

---

# 8. Provider Capabilities

Not every provider supports the same features.

Example:

EasyPin

* Reservation PIN
* PIN Revocation

eKey

* Reservation PIN
* Mobile Key
* Remote Unlock

Modules should detect capabilities rather than provider names.

---

# 9. Provider Lifecycle

Every provider follows the same lifecycle.

```text
Installed
      │
Configured
      │
Enabled
      │
Healthy
      │
Degraded
      │
Disabled
      │
Removed
```

The lifecycle is managed by the Provider Manager.

---

# 10. Error Handling

Provider failures are isolated.

Possible strategies include:

* Retry
* Fallback Provider
* Manual Processing
* Workflow Retry
* Administrator Notification

A provider failure must never stop the platform.

---

# 11. Health Monitoring

Every provider should expose health information.

Possible states:

* Healthy
* Degraded
* Unavailable
* Disabled

Health data is available to administrators and monitoring systems.

---

# 12. Security

Provider credentials are managed securely.

Requirements:

* encrypted secrets
* API key rotation
* least privilege
* audit logging
* secure transport
* configuration isolation

Secrets must never appear in source code.

---

# 13. Testing

Every provider implementation must support:

* Unit Tests
* Integration Tests
* Mock Providers
* Sandbox Mode (when available)

The platform should allow switching between production and test providers without changing application code.

---

# 14. Design Rules

All providers must comply with the following rules.

* Providers contain no business rules.
* Providers never modify domain entities directly.
* Providers communicate only through Provider Interfaces.
* Providers must support health monitoring.
* Providers must expose their capabilities.
* Providers should be stateless whenever possible.
* Providers should be independently testable.
* Providers must emit platform events when appropriate.

---

# 15. Future Evolution

The Provider Framework is designed to evolve independently of individual vendors.

As new technologies, APIs and external services emerge, Hospitality OS integrates them by implementing new providers rather than modifying existing business logic.

This architecture ensures:

* long-term maintainability
* vendor independence
* simplified integrations
* consistent business logic
* scalable platform evolution

The Provider Framework is one of the core architectural pillars of Hospitality OS and enables the platform to remain flexible as the hospitality ecosystem continues to evolve.
