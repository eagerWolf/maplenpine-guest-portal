# File: `22-smart-access.md`

# Hospitality OS

## Smart Access Module

Version: 1.0
Status: Draft
Audience: Product Owners, Software Architects, Backend Developers, IoT Engineers, Integration Developers

---

# 1. Purpose

The Smart Access Module manages digital access to hospitality properties.

It provides a unified access model independent of the underlying access technology.

Hospitality OS does not manage locks directly.

Instead, it orchestrates access through the Provider Framework and coordinates the complete access lifecycle using the Workflow Engine.

---

# 2. Vision

Access should become fully automated.

Guests should receive access automatically based on their reservation and check-in status.

Property owners should never manually create PIN codes or manage access credentials unless explicitly required.

The Smart Access Module should support any access technology through interchangeable providers.

---

# 3. Design Principles

## Reservation Driven

Every access credential belongs to a reservation.

Reservation lifecycle determines:

* activation
* expiration
* renewal
* revocation

---

## Provider Independent

The Smart Access Module never communicates directly with lock vendors.

Every integration is implemented through an Access Provider.

---

## Workflow Based

Access creation is triggered by business workflows.

Examples:

* Check-In Completed
* Reservation Updated
* Reservation Cancelled
* Early Check-Out

---

## Technology Independent

The module understands access credentials.

It does not understand individual lock technologies.

Examples:

* PIN Code
* Mobile Key
* RFID
* QR Code
* NFC
* Bluetooth Key

Future technologies should require only new providers.

---

## Secure

Access credentials are treated as sensitive information.

They must be protected throughout their lifecycle.

---

# 4. High-Level Architecture

```text
Reservation
      │
      ▼
Smart Access Module
      │
      ▼
Workflow Engine
      │
      ▼
Provider Framework
      │
      ▼
Access Provider
      │
      ▼
Lock System
```

The Smart Access Module coordinates access.

Providers implement vendor-specific communication.

---

# 5. Access Lifecycle

Every access credential follows a standard lifecycle.

```text
Requested
     │
     ▼
Generated
     │
     ▼
Scheduled
     │
     ▼
Active
     │
     ▼
Expired
     │
     ▼
Revoked
```

The Workflow Engine manages lifecycle transitions.

---

# 6. Access Types

The module supports multiple credential types.

Examples include:

* Reservation PIN
* Permanent PIN
* Mobile Key
* QR Code
* RFID Credential
* Digital Key
* Temporary Staff Access

Additional credential types may be introduced without changing the module architecture.

---

# 7. Access Scope

Every credential defines its scope.

Examples:

Location

* building
* apartment
* garage
* storage room

Time

* valid from
* valid until

Permissions

* guest
* cleaner
* maintenance
* administrator

---

# 8. Access Generation

Access credentials may be generated:

* automatically
* manually
* by external provider

Generation depends on property configuration.

The Smart Access Module never generates vendor-specific credentials itself.

---

# 9. Provider Integration

Access Providers expose common operations.

Typical operations include:

* create credential
* update credential
* revoke credential
* synchronize status
* retrieve health

Providers implement vendor-specific APIs.

---

# 10. Workflow Integration

Examples:

Reservation Confirmed

↓

Generate Credential

↓

Schedule Activation

↓

Notify Guest

↓

Activate Access

↓

Reservation Ends

↓

Revoke Credential

All orchestration is handled by the Workflow Engine.

---

# 11. Guest Portal Integration

Guests access credentials through the Guest Portal.

Examples:

* door PIN
* activation time
* access instructions
* mobile key

The Guest Portal never communicates directly with providers.

---

# 12. Notification Integration

The Notification Platform informs guests about:

* access ready
* updated credential
* credential expiration
* access problems

Notification timing is configurable.

---

# 13. AI Integration

The AI Platform understands access context.

Examples:

* explain how to enter
* troubleshoot access problems
* explain PIN validity
* guide guests through lock usage

AI never exposes credentials to unauthorized users.

---

# 14. Administration

The Administration Backoffice provides:

* credential overview
* provider status
* activation history
* revocation history
* manual regeneration
* diagnostics

Administrators may intervene when necessary.

---

# 15. Security

Access credentials are security-sensitive assets.

Requirements include:

* encrypted storage where applicable
* secure transport
* automatic expiration
* revocation support
* audit logging

Credentials must never remain active longer than necessary.

---

# 16. Monitoring

Operational monitoring includes:

* provider availability
* credential generation failures
* synchronization errors
* activation success rate
* revocation success rate

Monitoring supports proactive issue detection.

---

# 17. Design Rules

The Smart Access Module follows these mandatory rules.

* Every credential belongs to a reservation or authorized entity.
* Providers remain interchangeable.
* Business logic never communicates directly with lock systems.
* Credential lifecycle is workflow-driven.
* Guest Portal displays credentials.
* Credentials are security-sensitive.
* Every operation is auditable.
* Access expires automatically.

---

# 18. Future Evolution

The Smart Access Module is designed to support future generations of digital access technologies.

As smart lock ecosystems evolve, new providers should integrate without modifying the module itself.

The long-term objective is to provide fully automated, secure and vendor-independent access management across every hospitality property supported by Hospitality OS.
