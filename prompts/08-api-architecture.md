# Hospitality OS

## API Architecture

Version: 1.0
Status: Draft
Audience: Software Architects, Backend Developers, Frontend Developers, Integration Developers

---

# 1. Purpose

The API is the primary interface of Hospitality OS.

Every client communicates with the platform exclusively through public APIs.

Examples include:

* Administration Portal
* Guest Portal
* Mobile Applications
* Third-party Integrations
* Future Public APIs

Business logic is never implemented inside controllers.

The API acts only as an interface to the application layer.

---

# 2. API Principles

The API follows several architectural principles.

## API First

Every business capability must be accessible through APIs.

If a feature cannot be exposed through the API, it should be reconsidered.

---

## Stateless

Every request must contain all required context.

The server should not rely on client session state.

---

## Consistent

All APIs follow identical conventions.

Examples:

* naming
* pagination
* filtering
* sorting
* validation
* error responses

---

## Versioned

Breaking changes require API versioning.

Example:

```text
/api/v1/...
/api/v2/...
```

Multiple versions may coexist during migrations.

---

## Secure

Every request must be authenticated unless explicitly public.

Authorization is evaluated independently for every request.

---

# 3. High-Level Architecture

```text
Client
    │
    ▼
Authentication
    │
    ▼
Authorization
    │
    ▼
Controller
    │
    ▼
Application Service
    │
    ▼
Domain Model
    │
    ▼
Repository
```

Controllers contain no business logic.

Business rules belong to the Domain Layer.

---

# 4. API Categories

The platform exposes several API categories.

## Administration API

Used by:

* Administration Portal
* Internal Tools

Capabilities include:

* Reservations
* Properties
* Users
* Providers
* Modules
* Reports

---

## Guest API

Used by:

* Guest Portal
* Mobile Applications

Capabilities include:

* Check-in
* Payments
* Orders
* AI Assistant
* FAQ
* Recommendations

---

## Provider API

Used by Providers.

Examples:

* Reservation Import
* Payment Callback
* PIN Synchronization
* Marketplace Updates

---

## Public API

Future external developer API.

Examples:

* Reservation Status
* Marketplace
* Analytics
* Reporting

---

# 5. URL Structure

Resources follow consistent naming.

Example:

```text
/api/v1/properties

/api/v1/reservations

/api/v1/guests

/api/v1/payments
```

Nested resources should reflect ownership.

Example:

```text
/api/v1/properties/{propertyId}/units

/api/v1/reservations/{reservationId}/guests

/api/v1/reservations/{reservationId}/orders
```

---

# 6. HTTP Methods

Standard HTTP semantics should be respected.

GET

Read

POST

Create

PUT

Replace

PATCH

Partial Update

DELETE

Delete or Archive

---

# 7. Authentication

The platform supports multiple authentication methods.

Examples:

* User Authentication
* Guest Tokens
* API Keys
* OAuth (future)
* Service Accounts

Authentication determines identity.

Authorization determines permissions.

---

# 8. Authorization

Authorization is policy-based.

Every request evaluates:

```text
Identity

↓

Role

↓

Policy

↓

Permission

↓

Resource
```

Controllers never perform permission checks directly.

---

# 9. Request Validation

Validation occurs before business execution.

Validation includes:

* schema validation
* required fields
* data types
* business constraints
* provider capabilities

Invalid requests never reach the domain layer.

---

# 10. Response Format

Responses follow a consistent structure.

Example:

```json
{
  "data": {},
  "meta": {},
  "links": {}
}
```

Errors follow the same format.

Example:

```json
{
  "error": {
    "code": "reservation_not_found",
    "message": "Reservation not found."
  }
}
```

---

# 11. Pagination

Large collections should always be paginated.

Supported features:

* page
* page_size
* sorting
* filtering
* search

Pagination format is identical across all endpoints.

---

# 12. Filtering

Filtering should use predictable syntax.

Examples:

```text
status=confirmed

property=12

check_in_from=2026-01-01
```

Complex filtering should remain readable.

---

# 13. Idempotency

Certain operations must support idempotency.

Examples:

* Payments
* Reservation Import
* PIN Generation
* Notifications

Repeated requests must not create duplicate business operations.

---

# 14. API Events

The API itself does not execute workflows.

Instead:

```text
POST Reservation

↓

Reservation Created

↓

Workflow Triggered

↓

Events Published

↓

Modules Execute
```

Business workflows are delegated to the Workflow Engine.

---

# 15. Rate Limiting

Rate limits protect the platform.

Different limits may apply to:

* Guests
* Users
* Providers
* Public APIs

Rate limiting policies are configurable.

---

# 16. Documentation

Every public endpoint must include:

* description
* request schema
* response schema
* permissions
* examples
* error codes

API documentation should be generated automatically where possible.

---

# 17. Design Rules

Controllers must remain thin.

Controllers never contain business logic.

Application Services coordinate business use cases.

Domain Services implement business rules.

Repositories provide persistence only.

Responses must remain consistent.

All APIs must be versioned.

Every endpoint must be independently testable.

---

# 18. Long-Term Vision

The API is the public contract of Hospitality OS.

As the platform evolves, internal implementations may change, but the API should remain stable and predictable.

This separation allows web applications, mobile applications, AI agents and third-party integrations to evolve independently while relying on a consistent and well-defined platform interface.
