# File: `21-check-in.md`

# Hospitality OS

## Digital Check-In Module

Version: 1.0
Status: Draft
Audience: Product Owners, Software Architects, Backend Developers, Frontend Developers

---

# 1. Purpose

The Digital Check-In Module manages the complete guest onboarding process before arrival.

It replaces manual communication, paper forms and fragmented registration workflows with a unified digital experience integrated into the Guest Portal.

The Check-In Module coordinates identity collection, legal registration, operational preparation and workflow execution.

---

# 2. Vision

Guests should complete the entire arrival process before reaching the property.

Upon arrival they should already have:

* completed registration
* verified identity (if required)
* accepted house rules
* received access credentials
* paid required fees
* ordered optional services

Arrival should become a simple confirmation rather than an administrative procedure.

---

# 3. Design Principles

## Reservation Driven

Every check-in belongs to exactly one reservation.

The reservation determines:

* eligibility
* timing
* required steps
* available services

---

## Workflow Based

Check-in is a workflow rather than a single action.

Individual properties may require different steps.

---

## Configuration Driven

Each property defines:

* check-in opening time
* mandatory information
* identity verification
* legal registration
* payment requirements

No workflow changes require source code modifications.

---

## Country Independent

Legal registration differs between countries.

Country-specific requirements are implemented through Registration Providers.

---

## Modular

Identity verification, payments and smart access remain separate modules.

The Check-In Module orchestrates them.

---

# 4. High-Level Architecture

```text
Reservation
      │
      ▼
Check-In Module
      │
      ▼
Workflow Engine
      │
 ┌────┼───────────────┐
 ▼    ▼               ▼
Identity Payments Smart Access
      │
      ▼
Guest Portal
```

The Check-In Module coordinates the process without owning the individual business logic.

---

# 5. Check-In Lifecycle

Every check-in follows a standard lifecycle.

```text
Not Available
      │
      ▼
Available
      │
      ▼
In Progress
      │
      ▼
Submitted
      │
      ▼
Verified
      │
      ▼
Completed
```

Alternative states include:

* Expired
* Cancelled
* Rejected

---

# 6. Check-In Steps

A typical check-in may include:

* guest information
* arrival time
* identity verification
* legal registration
* tourist tax payment
* security deposit
* house rules acceptance
* access preparation

Properties may enable or disable individual steps.

---

# 7. Guest Information

The module collects guest information.

Examples include:

* full name
* address
* nationality
* document number
* contact information

Data validation is performed before submission.

---

# 8. Identity Verification

Identity verification is optional and configurable.

Possible methods include:

* document upload
* selfie verification
* external verification provider
* manual approval

Verification providers integrate through the Provider Framework.

---

# 9. Legal Registration

Some jurisdictions require mandatory guest registration.

The module supports:

* automatic registration
* manual submission
* provider integration
* country-specific workflows

Registration logic remains outside the core Check-In Module.

---

# 10. Payments

The Check-In Module may require payment before completion.

Examples:

* tourist tax
* security deposit
* outstanding reservation balance

Payment processing is delegated to the Payment Module.

---

# 11. House Rules

Guests may be required to accept:

* house rules
* privacy policy
* rental agreement
* local regulations

Accepted documents are recorded for auditing purposes.

---

# 12. Workflow Integration

Completing check-in triggers business workflows.

Example:

```text
Check-In Completed
        │
        ▼
Generate Door PIN
        │
        ▼
Enable Guest Portal
        │
        ▼
Send Welcome Message
        │
        ▼
Notify Property Manager
```

The Workflow Engine coordinates execution.

---

# 13. Smart Access Integration

When enabled, completion of check-in may activate:

* door PIN
* mobile key
* smart lock
* parking access

The Check-In Module does not manage access directly.

---

# 14. AI Integration

The AI Platform assists guests during check-in.

Examples:

* explain required information
* answer legal questions
* explain house rules
* assist with technical issues

AI uses structured knowledge provided by the Check-In Module.

---

# 15. Notifications

The Notification Platform may send:

* check-in availability
* incomplete reminder
* successful completion
* arrival instructions

Notification timing is configurable.

---

# 16. Administration

The Administration Backoffice provides:

* check-in status
* completion percentage
* missing information
* manual approval
* verification history

Administrators may intervene when required.

---

# 17. Design Rules

The Digital Check-In Module follows these mandatory rules.

* Every check-in belongs to one reservation.
* Check-in is workflow driven.
* Identity verification is modular.
* Payments remain independent.
* Legal registration is provider based.
* Guest Portal provides the user interface.
* Completion triggers workflows.
* Every step is auditable.

---

# 18. Future Evolution

The Digital Check-In Module is designed to support increasingly automated arrival experiences.

Future capabilities may include biometric verification, digital identity wallets, government integrations and AI-assisted onboarding without changing the underlying architecture.

The long-term objective is to make guest arrival fully digital, secure and effortless while remaining compliant with local regulations and hospitality best practices.
