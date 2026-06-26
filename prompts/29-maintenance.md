# File: `29-maintenance.md`

# Hospitality OS

## Maintenance Module

Version: 1.0
Status: Draft
Audience: Product Owners, Software Architects, Backend Developers, Frontend Developers

---

# 1. Purpose

The Maintenance Module manages maintenance requests, technical issues and operational tasks across Hospitality OS.

Rather than relying on phone calls or messaging applications, the module provides a structured workflow for reporting, assigning, tracking and resolving maintenance activities.

The module supports both reactive and preventive maintenance.

---

# 2. Vision

Every maintenance issue should be tracked digitally.

Guests, staff and automated platform components should all be able to create maintenance requests.

Property owners should always know:

* what happened
* where it happened
* who is responsible
* current status
* resolution history

---

# 3. Design Principles

## Property Based

Every maintenance request belongs to a property.

Requests may also reference:

* unit
* room
* equipment
* device

---

## Workflow Driven

Maintenance is a business workflow.

Creating a request does not resolve it.

Requests progress through defined workflow stages.

---

## Role Based

Different users perform different activities.

Examples:

* Guest
* Reception
* Maintenance Staff
* Property Manager
* Administrator

---

## Auditable

Every maintenance activity is permanently recorded.

History must never be lost.

---

# 4. High-Level Architecture

```text
Guest / Staff / System
         │
         ▼
Maintenance Module
         │
         ▼
Workflow Engine
         │
         ▼
Notification Platform
         │
         ▼
Administration Backoffice
```

The Maintenance Module coordinates issue management while the Workflow Engine manages execution.

---

# 5. Request Lifecycle

Every maintenance request follows a common lifecycle.

```text
Reported
    │
    ▼
Validated
    │
    ▼
Assigned
    │
    ▼
In Progress
    │
    ▼
Resolved
    │
    ▼
Closed
```

Alternative states include:

* Cancelled
* Rejected
* Waiting for Parts
* Waiting for Guest

---

# 6. Issue Categories

Examples include:

Property

* plumbing
* electrical
* heating
* air conditioning

Equipment

* television
* Wi-Fi
* appliances
* smart devices

Housekeeping

* missing items
* damaged furniture
* cleaning issues

Other

* safety issue
* emergency
* guest request

Categories are configurable.

---

# 7. Issue Reporting

Maintenance requests may originate from:

* Guest Portal
* Administration Backoffice
* AI Assistant
* Workflow Engine
* Smart Devices (future)
* Scheduled Inspection

Every request records:

* reporter
* property
* category
* priority
* description
* attachments

---

# 8. Assignment

Requests may be assigned to:

* property manager
* maintenance technician
* external contractor
* service provider

Assignment rules are configurable.

---

# 9. Workflow Integration

Example:

```text
Guest Reports Problem
        │
        ▼
Maintenance Request Created
        │
        ▼
Manager Notified
        │
        ▼
Technician Assigned
        │
        ▼
Issue Resolved
        │
        ▼
Guest Notified
```

The Workflow Engine coordinates execution.

---

# 10. Guest Portal Integration

Guests may:

* report issues
* upload photos
* monitor request status
* receive updates

Guests only see requests belonging to their reservation.

---

# 11. AI Integration

The AI Platform may:

* troubleshoot common issues
* answer equipment questions
* create maintenance requests
* classify reported problems
* recommend troubleshooting steps

AI may resolve simple issues before creating maintenance requests.

---

# 12. Smart Device Integration

Future smart devices may generate maintenance requests automatically.

Examples:

* water leak detected
* battery low
* lock offline
* temperature abnormal
* internet unavailable

These requests follow the same maintenance workflow.

---

# 13. Notifications

The Notification Platform informs:

Guests

* request received
* request resolved

Staff

* new request
* assignment
* overdue request

Property Managers

* critical issues
* escalations

---

# 14. Administration

The Administration Backoffice provides:

* request dashboard
* assignment management
* workload overview
* priority management
* maintenance history
* contractor management

---

# 15. Reporting

Business Metrics

* maintenance cost
* issue frequency
* contractor performance

Operational Metrics

* average response time
* average resolution time
* overdue requests
* recurring issues

Reports support preventive maintenance planning.

---

# 16. Design Rules

The Maintenance Module follows these mandatory rules.

* Every request belongs to a property.
* Requests execute through workflows.
* Guests see only their own requests.
* Smart devices may generate requests.
* AI assists before escalation.
* Notifications are automatic.
* Every activity is auditable.
* Business logic remains independent of providers.

---

# 17. Future Evolution

The Maintenance Module is designed to evolve from reactive issue management to predictive maintenance.

Future capabilities may include IoT monitoring, predictive analytics, preventive maintenance schedules, contractor marketplaces and AI-assisted diagnostics.

The long-term objective is to reduce operational costs, improve response times and ensure consistently high property quality through intelligent maintenance management.
