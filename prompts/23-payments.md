# File: `23-payments.md`

# Hospitality OS

## Payment Module

Version: 1.0
Status: Draft
Audience: Product Owners, Software Architects, Backend Developers, Integration Developers

---

# 1. Purpose

The Payment Module provides centralized payment processing for Hospitality OS.

Rather than allowing individual modules to integrate directly with payment providers, the platform provides a unified payment service that supports all financial transactions.

The Payment Module is responsible for:

* payment processing
* payment status
* refunds
* deposits
* payment history
* provider integration

Business modules request payments but never execute payment logic directly.

---

# 2. Vision

Every financial transaction within Hospitality OS should be processed through a single payment platform.

Examples include:

* reservation payments
* tourist tax
* security deposits
* marketplace orders
* late checkout
* damage fees

Guests should experience one consistent payment process regardless of the underlying payment provider.

---

# 3. Design Principles

## Payment Independent

Business modules never communicate directly with payment providers.

They create payment requests.

The Payment Module performs payment execution.

---

## Provider Based

Payment providers integrate through the Provider Framework.

Examples:

* Stripe
* SumUp
* PayPal
* Future Providers

Changing payment providers requires only configuration changes.

---

## Workflow Driven

Payments are coordinated through the Workflow Engine.

Business events determine payment execution.

---

## Auditable

Every payment operation is permanently recorded.

Financial history must never be lost.

---

## Secure

Sensitive payment information is never stored by Hospitality OS unless explicitly required.

PCI-compliant providers manage cardholder information.

---

# 4. High-Level Architecture

```text
Business Module
       │
       ▼
Payment Module
       │
       ▼
Workflow Engine
       │
       ▼
Payment Provider
       │
       ▼
Payment Gateway
```

The Payment Module coordinates payment operations.

Payment Providers execute payment requests.

---

# 5. Payment Lifecycle

Every payment follows a common lifecycle.

```text
Created
    │
    ▼
Pending
    │
    ▼
Authorized
    │
    ▼
Captured
    │
    ▼
Completed
```

Alternative states include:

* Failed
* Cancelled
* Refunded
* Expired

---

# 6. Payment Types

Supported payment categories include:

Reservation

* reservation balance
* additional guests

Property

* tourist tax
* security deposit
* damage charges

Marketplace

* breakfast
* bike rental
* airport transfer
* luggage storage

Future modules may introduce additional payment types.

---

# 7. Payment Methods

The module supports multiple payment methods.

Examples:

* Credit Card
* Debit Card
* Apple Pay
* Google Pay
* Bank Transfer
* Cash
* Invoice

Available methods depend on the configured Payment Provider.

---

# 8. Payment Providers

The Payment Module communicates only through Provider Interfaces.

Typical provider operations include:

* create payment
* authorize payment
* capture payment
* refund payment
* synchronize payment status

Providers remain interchangeable.

---

# 9. Workflow Integration

Payments are integrated into business workflows.

Example:

```text
Guest Orders Breakfast
        │
        ▼
Payment Created
        │
        ▼
Payment Authorized
        │
        ▼
Order Confirmed
        │
        ▼
Provider Notified
```

Business modules remain independent of payment execution.

---

# 10. Reservation Integration

Reservations may generate payments.

Examples:

* outstanding balance
* tourist tax
* late checkout
* security deposit

Reservation status and payment status remain separate concepts.

---

# 11. Marketplace Integration

Marketplace services may require payment.

Examples:

* breakfast
* transfer
* bike rental

The Marketplace requests payment.

The Payment Module executes payment.

---

# 12. Refunds

The Payment Module supports refunds.

Refunds may be:

* full
* partial
* automatic
* manual

Refund workflows remain fully auditable.

---

# 13. Notifications

The Notification Platform informs users about payment events.

Examples:

* payment request
* payment received
* payment failed
* refund completed

Notification templates are configurable.

---

# 14. AI Integration

The AI Platform may assist guests with payment-related questions.

Examples:

* explain charges
* payment status
* invoice information
* refund explanation

AI never accesses confidential payment credentials.

---

# 15. Reporting

Payment reporting includes:

Business Metrics

* revenue
* outstanding balances
* refunds
* payment success rate

Operational Metrics

* provider availability
* payment latency
* failed transactions

Financial reports remain available for auditing.

---

# 16. Security

The Payment Module follows strict security requirements.

Examples:

* encrypted communication
* signed callbacks
* provider verification
* audit logging
* least privilege

Sensitive payment information is delegated to payment providers whenever possible.

---

# 17. Design Rules

The Payment Module follows these mandatory rules.

* Business modules never execute payment logic.
* Providers remain interchangeable.
* Payments are workflow-driven.
* Every transaction is auditable.
* Financial history is immutable.
* Payment status is independent of reservation status.
* Sensitive payment data remains outside Hospitality OS where possible.
* Refunds follow the same workflow model as payments.

---

# 18. Future Evolution

The Payment Module is designed to become the centralized financial platform of Hospitality OS.

As new payment methods, financial regulations and payment providers emerge, they should integrate through the Provider Framework while preserving a unified payment model.

The long-term objective is to provide secure, reliable and vendor-independent payment processing for every financial transaction performed within Hospitality OS.
