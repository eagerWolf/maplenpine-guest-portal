# File: `17-configuration-system.md`

# Hospitality OS

## Configuration System

Version: 1.0
Status: Draft
Audience: Software Architects, Backend Developers, Frontend Developers, Product Owners

---

# 1. Purpose

The Configuration System provides centralized management of all configurable behavior within Hospitality OS.

Rather than embedding customer-specific logic into the application, the platform relies on configuration to control behavior at every level.

Configuration is a core platform capability and one of the fundamental architectural principles of Hospitality OS.

---

# 2. Vision

Every installation of Hospitality OS should behave differently through configuration rather than customization.

Business logic should remain identical for every customer.

Configuration determines:

* available functionality
* enabled modules
* provider selection
* workflows
* permissions
* branding
* guest experience

The goal is to maximize flexibility while preserving a single codebase.

---

# 3. Design Principles

## Configuration over Code

Business behavior should always be controlled through configuration.

Correct:

```text
Breakfast.enabled = true
```

Incorrect:

```php
if ($property->id == 12) {
    // enable breakfast
}
```

Customer-specific conditions must never appear inside business logic.

---

## Hierarchical

Configuration exists at multiple levels.

Each level may override the previous one.

---

## Module Independent

Each module owns its own configuration.

The platform never contains module-specific configuration.

---

## Provider Independent

Providers own their own configuration schema.

Business logic never accesses provider-specific configuration directly.

---

## Extensible

New modules introduce new configuration.

Existing configuration structures should remain unchanged.

---

# 4. Configuration Hierarchy

Configuration is resolved using the following hierarchy.

```text
Platform
    │
    ▼
Organization
    │
    ▼
Property
    │
    ▼
Module
    │
    ▼
Provider
```

More specific configuration overrides more general configuration.

---

# 5. Configuration Categories

The platform manages several configuration categories.

Platform Configuration

* global settings
* supported languages
* feature flags

Organization Configuration

* branding
* defaults
* integrations

Property Configuration

* check-in rules
* services
* branding
* AI behavior

Module Configuration

* enabled features
* module settings

Provider Configuration

* credentials
* endpoints
* provider capabilities

User Preferences

* language
* notifications
* dashboard

---

# 6. Configuration Resolution

When a configuration value is requested, the platform resolves it dynamically.

Example:

```text
Property Value

↓

Organization Default

↓

Platform Default
```

Modules should never implement their own configuration resolution.

---

# 7. Configuration Storage

Configuration is stored separately from business entities.

Configuration should support:

* structured values
* versioning
* validation
* auditing

Configuration storage must remain implementation independent.

---

# 8. Module Configuration

Each module defines its own configuration schema.

Example:

```yaml
Breakfast

enabled: true

provider: breakfast-bled

ordering_deadline: 21:00

max_orders: 50
```

The platform validates configuration before activation.

---

# 9. Provider Configuration

Providers define independent configuration.

Example:

```yaml
EasyPin

endpoint: https://...

api_key: ****

timeout: 10
```

Provider configuration is never shared between providers.

---

# 10. Runtime Configuration

Configuration changes should become effective without redeploying the application whenever possible.

Examples:

* enable module
* disable provider
* change branding
* update AI prompt
* modify workflow timing

The platform should minimize operational downtime.

---

# 11. Validation

Every configuration change is validated before activation.

Validation includes:

* required values
* data types
* ranges
* dependencies
* provider compatibility

Invalid configuration must never become active.

---

# 12. Versioning

Configuration changes are versioned.

Each revision records:

* timestamp
* author
* previous value
* new value
* reason (optional)

Version history supports rollback and auditing.

---

# 13. Audit

Every configuration change is auditable.

Examples:

* module enabled
* provider changed
* branding updated
* permissions modified

Audit information includes:

* who
* when
* what changed

---

# 14. Workflow Integration

Configuration influences Workflow Engine behavior.

Examples:

* enable digital check-in
* send reminder 24 hours before arrival
* disable breakfast ordering
* allow late checkout

Workflow definitions remain unchanged.

Configuration determines execution.

---

# 15. AI Integration

The AI Platform consumes configuration.

Examples:

* system instructions
* enabled knowledge sources
* available tools
* response language
* AI provider selection

Configuration should not require prompt changes inside source code.

---

# 16. Administration

The Administration Backoffice provides configuration management.

Capabilities include:

* edit configuration
* compare revisions
* rollback
* validation
* import/export

Configuration should be understandable by non-technical users.

---

# 17. Design Rules

The Configuration System follows these mandatory rules.

* Configuration replaces customization.
* Business logic must never contain customer-specific conditions.
* Modules own their own configuration.
* Providers own their own configuration.
* Configuration is hierarchical.
* Configuration is validated before activation.
* Configuration changes are audited.
* Configuration should become effective without redeployment whenever possible.

---

# 18. Future Evolution

The Configuration System is designed to become the central control mechanism of Hospitality OS.

As new modules, providers and workflows are introduced, they extend the configuration model rather than modifying existing business logic.

This approach enables Hospitality OS to remain flexible, maintainable and scalable while preserving a single, consistent platform for every customer.
