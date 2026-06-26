# File: `38-sdk.md`

# Hospitality OS

## Software Development Kit (SDK)

Version: 1.0
Status: Draft
Audience: Software Architects, Backend Developers, Frontend Developers, Integration Partners

---

# 1. Purpose

The Hospitality OS Software Development Kit (SDK) provides a standardized development framework for extending the platform.

Rather than modifying the platform core, developers build extensions using officially supported SDK interfaces.

The SDK provides stable APIs, abstractions and development conventions that enable long-term compatibility.

---

# 2. Vision

Every platform extension should be developed using the SDK.

Examples include:

* Business Modules
* Providers
* Workflow Actions
* AI Tools
* Search Providers
* Notification Providers
* Analytics Extensions

The platform core remains unchanged while the ecosystem continues to grow.

---

# 3. Design Principles

## API First

Every SDK component communicates through stable platform APIs.

Internal implementation details remain hidden.

---

## Stable Contracts

Public interfaces remain backward compatible.

Breaking changes require major platform versions.

---

## Modular

Each SDK package targets a specific extension type.

Examples:

* Module SDK
* Provider SDK
* Workflow SDK
* AI SDK

Developers import only the packages they require.

---

## Versioned

Every SDK release follows semantic versioning.

Example:

```text
1.0.0

1.1.0

2.0.0
```

Compatibility guarantees are clearly documented.

---

## Framework Independent

Where practical, SDK contracts should remain independent of framework-specific implementations.

Business interfaces should remain portable.

---

# 4. SDK Architecture

```text
Developer

        │

        ▼

Hospitality SDK

        │

        ▼

Platform Contracts

        │

        ▼

Hospitality OS
```

The SDK exposes public contracts while hiding platform internals.

---

# 5. SDK Components

The SDK consists of multiple packages.

Examples include:

Core SDK

Provider SDK

Workflow SDK

Module SDK

AI SDK

Notification SDK

Testing SDK

CLI SDK

Each package is independently versioned where appropriate.

---

# 6. Core SDK

The Core SDK provides:

* platform interfaces
* dependency injection contracts
* event definitions
* service contracts
* configuration interfaces

Every extension depends on the Core SDK.

---

# 7. Provider SDK

The Provider SDK contains interfaces for implementing providers.

Examples:

* Reservation Provider
* Payment Provider
* Access Provider
* Weather Provider
* Notification Provider

Provider implementations should require minimal boilerplate.

---

# 8. Module SDK

The Module SDK enables developers to create new business modules.

Capabilities include:

* module registration
* routing
* configuration
* permissions
* navigation
* API registration
* database migrations

Modules integrate with the platform through standardized lifecycle hooks.

---

# 9. Workflow SDK

The Workflow SDK allows developers to contribute:

* workflow actions
* triggers
* conditions
* variables
* execution handlers

Workflow extensions automatically become available within the Workflow Engine.

---

# 10. AI SDK

The AI SDK enables modules to contribute:

* knowledge sources
* AI tools
* prompt fragments
* context providers
* semantic metadata

AI integrations remain modular and provider-independent.

---

# 11. Testing SDK

The Testing SDK provides:

* mock providers
* test fixtures
* workflow simulators
* fake events
* integration helpers

Every extension should be testable without external systems.

---

# 12. CLI Tools

The SDK includes command-line tools.

Examples:

```bash
hos create:module

hos create:provider

hos create:workflow

hos create:tool

hos test

hos validate
```

CLI tooling accelerates development while enforcing platform conventions.

---

# 13. Documentation

Every SDK component includes:

* API reference
* tutorials
* examples
* migration guides
* best practices

Documentation is versioned together with the SDK.

---

# 14. Security

SDK extensions execute within the Hospitality OS security model.

Extensions must never bypass:

* authentication
* authorization
* auditing
* workflow validation

Security remains the responsibility of the platform core.

---

# 15. Compatibility

Every SDK release defines:

* supported platform versions
* deprecated APIs
* migration paths
* compatibility guarantees

Developers should be able to upgrade with predictable effort.

---

# 16. Design Rules

The SDK follows these mandatory rules.

* Extensions never modify platform internals.
* Public contracts remain stable.
* All integrations use documented interfaces.
* Extensions remain independently deployable.
* Testing support is mandatory.
* Security policies cannot be bypassed.
* Documentation accompanies every SDK release.
* Semantic versioning governs compatibility.

---

# 17. Future Evolution

The Hospitality OS SDK is designed to become the primary development framework for the platform ecosystem.

Future capabilities may include code generators, graphical workflow designers, provider certification tools, marketplace publishing, automated compatibility validation and cloud-based developer tooling.

The long-term objective is to establish Hospitality OS as an extensible platform where internal teams, partners and third-party developers can safely build, distribute and maintain extensions without modifying the platform core.
