# File: `18-permission-system.md`

# Hospitality OS

## Permission System

Version: 1.0
Status: Draft
Audience: Software Architects, Backend Developers, Frontend Developers, Product Owners

---

# 1. Purpose

The Permission System provides centralized authorization across the Hospitality OS platform.

Rather than allowing individual modules to implement their own authorization logic, the platform provides a unified permission model that applies consistently to every business operation.

Authentication identifies **who** the user is.

The Permission System determines **what** the user is allowed to do.

---

# 2. Vision

Authorization should be predictable, extensible and independent of individual modules.

Every platform capability should use the same authorization model regardless of:

* module
* property
* organization
* provider
* workflow

New modules should automatically integrate with the Permission System.

---

# 3. Design Principles

## Policy Based

Permissions are evaluated through Policies.

Business logic never checks roles directly.

Correct:

```text
Permission Service

↓

Policy

↓

Allowed
```

Incorrect:

```php
if ($user->role == 'admin')
```

---

## Least Privilege

Users receive only the permissions required to perform their responsibilities.

No user should receive broader access than necessary.

---

## Module Independent

Each module registers its own permissions.

The Permission System remains unaware of module-specific business logic.

---

## Resource Based

Permissions are evaluated against resources.

Examples:

* Reservation
* Property
* Marketplace Order
* Provider
* Payment

Authorization depends on both the user and the resource.

---

# 4. Authorization Architecture

```text
User
   │
   ▼
Authentication
   │
   ▼
Permission Service
   │
   ▼
Policy Evaluation
   │
   ▼
Business Operation
```

Every operation passes through the Permission Service.

---

# 5. Permission Hierarchy

Permissions are inherited through the business hierarchy.

```text
Platform
    │
Organization
    │
Property
    │
Resource
```

Permissions granted at a higher level may apply to lower levels unless explicitly restricted.

---

# 6. Roles

Roles represent collections of permissions.

Examples include:

Platform Roles

* Platform Administrator
* Platform Support

Organization Roles

* Organization Owner
* Organization Administrator

Property Roles

* Property Manager
* Reception
* Housekeeping
* Maintenance

Guests are not assigned platform roles.

Guest permissions are derived from their reservation.

---

# 7. Permissions

Modules define permissions using a consistent naming convention.

Example:

```text
reservation.view

reservation.create

reservation.update

reservation.delete

reservation.manage
```

Example:

```text
marketplace.order.create

marketplace.order.cancel

marketplace.provider.manage
```

Permissions should remain granular.

---

# 8. Policies

Policies evaluate permissions within business context.

Examples:

Can View Reservation

Conditions:

* authenticated
* belongs to organization
* assigned property
* reservation visible

Result:

Allow or Deny

Policies centralize authorization logic.

---

# 9. Property Isolation

Property-level permissions are supported.

Example:

```text
Organization

├── Property A

├── Property B

└── Property C
```

A Property Manager assigned to Property A must never gain access to Property B unless explicitly authorized.

---

# 10. Guest Permissions

Guests receive temporary permissions.

Allowed examples:

* own reservation
* own payments
* own Marketplace orders
* Guest Portal

Guests cannot access:

* administration
* provider configuration
* other reservations
* organization resources

Guest permissions expire automatically after checkout.

---

# 11. Module Registration

Every module registers:

* permissions
* policies
* resource mappings

Example:

Breakfast Module

Registers:

* breakfast.view
* breakfast.order
* breakfast.manage

No central modification is required.

---

# 12. Provider Permissions

Providers operate with restricted permissions.

Providers receive access only to operations required by their interfaces.

Examples:

Access Provider

* create access
* revoke access

Payment Provider

* create payment
* receive callback

Providers never receive unrestricted platform access.

---

# 13. Workflow Integration

Workflows execute under a defined security context.

The Workflow Engine validates permissions before executing sensitive actions.

Workflows must never bypass authorization.

---

# 14. API Integration

Every API endpoint requires authorization unless explicitly public.

Controllers delegate permission evaluation to the Permission System.

Controllers must never implement authorization logic directly.

---

# 15. Administration

The Administration Backoffice allows authorized users to:

* manage roles
* assign permissions
* inspect effective permissions
* review policy decisions

Permission management should remain transparent.

---

# 16. Audit

Permission-related operations are fully audited.

Examples:

* role assigned
* permission revoked
* policy denied
* privileged operation executed

Audit information includes:

* user
* resource
* action
* timestamp

---

# 17. Design Rules

The Permission System follows these mandatory rules.

* Authorization is centralized.
* Policies evaluate permissions.
* Modules register their own permissions.
* Business logic never checks roles directly.
* Guests receive temporary permissions.
* Providers receive least privilege.
* Property isolation is mandatory.
* Authorization decisions are auditable.

---

# 18. Future Evolution

The Permission System is designed to support increasingly complex organizational structures while maintaining a consistent authorization model.

As Hospitality OS evolves, new modules, providers and workflows should integrate by registering additional permissions and policies rather than modifying the core authorization engine.

The Permission System should remain the single source of truth for authorization across the entire platform.
