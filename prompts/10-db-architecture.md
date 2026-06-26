# Hospitality OS

## Database Architecture

Version: 1.0
Status: Draft
Audience: Software Architects, Backend Developers, Database Engineers

---

# 1. Purpose

This document defines the database architecture of Hospitality OS.

The database is responsible for persisting the Domain Model.

It is not the source of business rules.

Business rules belong to the Domain Layer.

The database provides:

* persistence
* consistency
* integrity
* scalability
* performance
* auditability

---

# 2. Design Principles

The database architecture follows several fundamental principles.

## Domain Driven

The database structure reflects the Domain Model.

Tables represent business entities.

Examples:

* organizations
* properties
* reservations
* guests
* providers
* modules

The database must never dictate business design.

---

## Modular

Each module owns its own data.

Example:

Breakfast Module

```text
breakfast_orders
breakfast_menus
breakfast_providers
```

Bike Rental Module

```text
bike_rentals
bike_inventory
bike_orders
```

Modules never modify each other's tables.

---

## Provider Independent

External provider data remains isolated.

Example:

Reservation

↓

reservation_provider_data

↓

Bentral specific fields

The Reservation entity never contains vendor-specific columns.

---

## Multi-Tenant Ready

Every business entity belongs to an Organization.

Tenant isolation must exist at every level.

---

# 3. Database Hierarchy

The logical ownership hierarchy is:

```text
Platform

└── Organization

      └── Property

            └── Unit

                  └── Reservation

                        ├── Guests

                        ├── Orders

                        ├── Payments

                        └── Messages
```

Ownership determines:

* authorization
* cascading
* auditing
* reporting

---

# 4. Entity Ownership

Every table has exactly one owner.

Example:

Organization

↓

Property

↓

Unit

↓

Reservation

↓

Order

Bidirectional ownership should be avoided.

---

# 5. Primary Keys

Every business entity uses a globally unique identifier.

Requirements:

* UUID primary keys
* immutable identifiers
* stable references
* API-safe identifiers

Internal numeric IDs may exist for optimization but must never be exposed publicly.

---

# 6. Foreign Keys

Relationships should enforce referential integrity.

Foreign keys should be used whenever ownership exists.

Examples:

Reservation

↓

Property

Guest

↓

Reservation

Order

↓

Reservation

The database should prevent orphaned records.

---

# 7. Naming Conventions

Tables use plural snake_case.

Examples:

```text
organizations

properties

units

reservations

reservation_guests

payments
```

Columns use singular snake_case.

Examples:

```text
created_at

updated_at

organization_id

reservation_id

provider_id
```

Consistency is mandatory.

---

# 8. Soft Deletes

Business entities should generally support soft deletion.

Examples:

* properties
* guests
* providers
* modules

Historical information should remain available whenever possible.

Hard deletion should be limited to exceptional cases.

---

# 9. Audit Fields

Every business table should include:

```text
created_at

updated_at

created_by

updated_by
```

Where appropriate:

```text
deleted_at

deleted_by
```

Auditability is a core platform capability.

---

# 10. Module Ownership

Every module owns its schema.

Example:

Breakfast Module

```text
breakfast_orders

breakfast_menu

breakfast_products
```

The platform core never modifies module tables.

Modules evolve independently.

---

# 11. Provider Data

Provider-specific information should remain isolated.

Example:

```text
reservation_provider_data

provider_type

provider_name

external_id

payload

synced_at
```

The core Reservation table remains provider-agnostic.

---

# 12. Indexing

Indexes should support:

* foreign keys
* frequently filtered columns
* search
* reporting
* sorting

Indexes should be based on measured usage rather than assumptions.

---

# 13. Transactions

Business operations should execute inside database transactions where consistency is required.

Examples:

* Reservation Creation
* Payment Processing
* Check-in
* Check-out

Long-running workflows should not keep database transactions open.

---

# 14. Historical Data

Business history is valuable.

The platform should preserve:

* reservation history
* payment history
* provider synchronization
* workflow execution
* notifications
* audit records

Historical records should not be overwritten.

---

# 15. File References

Files should not be stored directly in the database.

The database stores metadata only.

Examples:

```text
file_id

storage_provider

path

mime_type

checksum

size
```

Physical storage is delegated to the Storage Provider.

---

# 16. Configuration Storage

Configuration should be stored separately from business data.

Examples:

* platform configuration
* organization configuration
* property configuration
* provider configuration
* module configuration

Configuration changes should not require schema changes.

---

# 17. Performance

The database architecture should support:

* high read throughput
* concurrent workflows
* background processing
* analytics
* reporting

Performance optimizations must never compromise data integrity.

---

# 18. Migration Strategy

Every schema change must be implemented through versioned migrations.

Requirements:

* repeatable
* reversible where practical
* automated
* independently testable

Modules manage their own migrations.

---

# 19. Backup and Recovery

The platform must support:

* automated backups
* point-in-time recovery
* disaster recovery
* integrity verification

Backup procedures must be tested regularly.

---

# 20. Design Rules

The following rules are mandatory.

* Business rules never belong in the database.
* Tables represent domain entities.
* Modules own their schema.
* Provider-specific data remains isolated.
* UUIDs are the primary public identifiers.
* Soft deletes are preferred.
* Every change must be auditable.
* Schema evolution occurs through migrations only.
* Referential integrity must be preserved.

---

# 21. Long-Term Vision

The database architecture is designed to support the long-term evolution of Hospitality OS.

As new modules, providers and workflows are introduced, the schema should grow through extension rather than modification of the core domain.

This approach enables independent module development, scalable deployments and a stable data model while preserving consistency, integrity and maintainability across the platform.
