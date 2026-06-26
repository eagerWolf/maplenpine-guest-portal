# File: `30-housekeeping.md`

# Hospitality OS

## Housekeeping Module

Version: 1.0
Status: Draft
Audience: Product Owners, Software Architects, Backend Developers, Frontend Developers

---

# 1. Purpose

The Housekeeping Module manages cleaning operations and room preparation throughout Hospitality OS.

It coordinates cleaning activities based on reservation lifecycle events while providing property managers and housekeeping staff with a centralized operational workflow.

The module supports both internal housekeeping teams and external cleaning providers.

---

# 2. Vision

Cleaning operations should become fully coordinated and largely automated.

Housekeeping staff should receive digital task lists instead of phone calls or messaging applications.

Property managers should always know:

* which units require cleaning
* current cleaning status
* assigned staff
* cleaning history
* operational delays

---

# 3. Design Principles

## Reservation Driven

Cleaning requirements are derived from reservation events.

Examples:

* Check-out completed
* Same-day turnover
* Mid-stay cleaning
* Long-term stay

Reservations become the primary trigger for housekeeping workflows.

---

## Workflow Based

Cleaning follows a defined operational workflow.

Every cleaning task progresses through consistent lifecycle stages.

---

## Provider Independent

Cleaning may be performed by:

* Internal Staff
* External Cleaning Company
* Property Manager

The Housekeeping Module coordinates work regardless of who performs it.

---

## Auditable

Every cleaning activity is permanently recorded.

Cleaning history should never be lost.

---

# 4. High-Level Architecture

```text
Reservation
      │
      ▼
Housekeeping Module
      │
      ▼
Workflow Engine
      │
 ┌────┼─────────────┐
 ▼    ▼             ▼
Notifications Maintenance Administration
```

The module coordinates housekeeping while other platform components provide supporting services.

---

# 5. Cleaning Lifecycle

Every housekeeping task follows a common lifecycle.

```text
Scheduled
     │
     ▼
Assigned
     │
     ▼
In Progress
     │
     ▼
Completed
     │
     ▼
Verified
```

Alternative states include:

* Cancelled
* Delayed
* Waiting
* Failed Inspection

---

# 6. Cleaning Types

Examples include:

Turnover Cleaning

Performed after guest checkout.

Mid-Stay Cleaning

Performed during longer reservations.

Deep Cleaning

Scheduled periodically.

Inspection

Quality verification after cleaning.

Emergency Cleaning

Triggered manually or by operational events.

Additional cleaning types may be introduced through configuration.

---

# 7. Task Generation

Cleaning tasks may be generated automatically from:

* reservation checkout
* scheduled maintenance
* manual request
* maintenance completion
* property inspection

The Workflow Engine coordinates task creation.

---

# 8. Assignment

Cleaning tasks may be assigned based on:

* property
* staff availability
* workload
* skills
* external contractor

Assignment rules are configurable.

---

# 9. Checklist Support

Cleaning tasks may include structured checklists.

Examples:

Kitchen

* clean appliances
* empty refrigerator
* replace supplies

Bathroom

* replace towels
* sanitize surfaces
* refill amenities

Bedroom

* change bedding
* inspect furniture

Property owners may customize checklists.

---

# 10. Maintenance Integration

Housekeeping staff may report maintenance issues during cleaning.

Example:

```text
Cleaning Completed

↓

Broken Lamp Detected

↓

Maintenance Request Created

↓

Maintenance Workflow Started
```

Housekeeping and Maintenance remain separate modules while sharing operational workflows.

---

# 11. Guest Portal Integration

Guests may request optional housekeeping services.

Examples:

* additional towels
* extra cleaning
* linen replacement

Requests are processed through the Marketplace and Workflow Engine.

---

# 12. Notifications

The Notification Platform informs:

Housekeeping Staff

* new assignment
* overdue cleaning

Property Managers

* cleaning completed
* delayed cleaning
* failed inspection

Guests

* optional cleaning confirmation
* housekeeping schedule (if applicable)

---

# 13. AI Integration

The AI Platform may:

* prioritize cleaning tasks
* optimize schedules
* answer staff questions
* summarize operational workload
* recommend housekeeping improvements

Future AI capabilities may optimize staffing and resource allocation.

---

# 14. Administration

The Administration Backoffice provides:

* cleaning dashboard
* assignment management
* cleaning calendar
* task history
* inspection history
* workload overview

Managers may manually adjust assignments when required.

---

# 15. Reporting

Business Metrics

* cleaning cost
* cleaning frequency
* contractor utilization

Operational Metrics

* average cleaning duration
* turnaround time
* inspection pass rate
* overdue tasks

Reports support operational planning and quality assurance.

---

# 16. Design Rules

The Housekeeping Module follows these mandatory rules.

* Cleaning tasks originate from business events.
* Reservation lifecycle drives housekeeping.
* Assignments are configurable.
* Maintenance remains a separate module.
* Checklists are configurable.
* Notifications are automatic.
* Every cleaning activity is auditable.
* AI enhances operational efficiency without replacing business workflows.

---

# 17. Future Evolution

The Housekeeping Module is designed to support increasingly intelligent operational management.

Future capabilities may include AI-assisted scheduling, occupancy forecasting, predictive cleaning, IoT-assisted inspections, robotic cleaning integrations and workforce optimization.

The long-term objective is to create a highly efficient housekeeping platform that minimizes operational effort while maintaining consistently high accommodation quality.
