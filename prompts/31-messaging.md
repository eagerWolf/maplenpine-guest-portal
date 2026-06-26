# File: `31-messaging.md`

# Hospitality OS

## Messaging Module

Version: 1.0
Status: Draft
Audience: Product Owners, Software Architects, Backend Developers, Frontend Developers

---

# 1. Purpose

The Messaging Module provides a unified communication platform for all participants within Hospitality OS.

Rather than relying on fragmented communication channels such as WhatsApp, SMS or email, the Messaging Module centralizes conversations while integrating with reservations, workflows, notifications and AI.

The Messaging Module becomes the official communication record for every guest interaction.

---

# 2. Vision

Every guest should communicate through a single conversation.

The platform should automatically understand:

* who is communicating
* which reservation is involved
* which property is affected
* what the guest is requesting

Communication should become part of the operational workflow rather than existing outside the platform.

---

# 3. Design Principles

## Conversation Based

Every message belongs to a conversation.

A conversation belongs to a business context.

Examples:

* reservation
* marketplace order
* maintenance request
* housekeeping task

---

## Omnichannel

Guests may communicate through different channels.

Examples:

* Guest Portal
* WhatsApp
* SMS
* Email
* Mobile App (future)

Regardless of the entry point, Hospitality OS maintains a single conversation.

---

## AI Assisted

AI participates in conversations.

It may:

* answer questions
* execute actions
* suggest replies
* escalate conversations

AI never replaces human operators unless explicitly configured.

---

## Workflow Integrated

Messages may trigger business workflows.

Examples:

Guest:

"I will arrive later."

↓

Workflow

↓

Arrival Time Updated

↓

Property Manager Notified

---

## Reservation Aware

Every conversation understands reservation context automatically.

No manual lookup should be required.

---

# 4. High-Level Architecture

```text
Guest
    │
    ▼
Messaging Module
    │
    ▼
Conversation Engine
    │
 ┌──┼───────────────┐
 ▼  ▼               ▼
AI Workflow Notification
    │
    ▼
Administration Backoffice
```

The Messaging Module coordinates communication while other platform services provide intelligence and automation.

---

# 5. Conversation Lifecycle

Every conversation follows a common lifecycle.

```text
Created
    │
    ▼
Active
    │
    ▼
Waiting
    │
    ▼
Resolved
    │
    ▼
Closed
```

Alternative states include:

* Escalated
* Archived
* Reopened

---

# 6. Message Types

Supported message types include:

* text
* images
* files
* voice messages (future)
* system messages
* AI responses

The platform should remain extensible for future message types.

---

# 7. Conversation Context

Each conversation automatically references:

* organization
* property
* reservation
* guest
* current stay
* active workflows
* marketplace orders

Context is automatically available to AI and administrators.

---

# 8. AI Integration

The AI Platform is deeply integrated into Messaging.

AI may:

* answer frequently asked questions
* explain apartment equipment
* recommend Marketplace services
* create service requests
* initiate workflows
* summarize conversations
* translate messages

When confidence is insufficient, AI should escalate the conversation to a human operator.

---

# 9. Workflow Integration

Messages may initiate business workflows.

Examples:

Guest:

> "Can I check in earlier?"

↓

Availability Checked

↓

Payment Required (optional)

↓

Marketplace / Payment Module

↓

Reservation Updated

↓

Guest Notified

Every automated action is executed through the Workflow Engine.

---

# 10. Notification Integration

The Notification Platform informs users about:

* new messages
* unread conversations
* escalated requests
* operator replies

Notifications respect user preferences and selected communication channels.

---

# 11. Guest Portal Integration

The Guest Portal provides the primary messaging interface.

Guests may:

* ask questions
* upload images
* report issues
* receive replies
* continue previous conversations

Guests never need to leave the Guest Portal for operational communication.

---

# 12. Administration

The Administration Backoffice provides:

* conversation list
* operator assignment
* conversation search
* AI suggestions
* conversation history
* internal notes
* escalation management

Operators may transfer conversations without losing context.

---

# 13. Search

The Messaging Module supports full-text search across:

* conversations
* messages
* attachments
* guests
* reservations

Search results remain permission-aware.

---

# 14. Analytics

Business Metrics

* conversations per reservation
* AI resolution rate
* response time
* guest satisfaction

Operational Metrics

* average handling time
* escalation rate
* unresolved conversations
* operator workload

Analytics support continuous improvement of guest communication.

---

# 15. Security

Messaging follows platform-wide security policies.

Requirements include:

* authenticated access
* reservation-based permissions
* encrypted communication
* audit logging
* attachment validation

Guests may access only conversations belonging to their reservation.

---

# 16. Design Rules

The Messaging Module follows these mandatory rules.

* Every conversation belongs to a business context.
* AI assists but does not bypass business workflows.
* Conversations remain channel-independent.
* Messages are permanently auditable.
* Reservation context is automatic.
* Notifications remain independent.
* Human operators may intervene at any time.
* Business actions execute through the Workflow Engine.

---

# 17. Future Evolution

The Messaging Module is designed to become the primary communication platform for Hospitality OS.

Future capabilities may include voice conversations, live translation, video assistance, AI-generated summaries, sentiment analysis and proactive guest engagement.

The long-term objective is to replace fragmented hospitality communication with a unified, intelligent and workflow-driven messaging platform that seamlessly connects guests, staff, AI and operational services.
