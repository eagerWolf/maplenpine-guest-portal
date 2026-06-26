# File: `35-reporting.md`

# Hospitality OS

## Reporting Module

Version: 1.0
Status: Draft
Audience: Product Owners, Software Architects, Backend Developers, Frontend Developers, Business Users

---

# 1. Purpose

The Reporting Module provides standardized reporting capabilities across Hospitality OS.

Rather than allowing individual modules to generate their own reports, the Reporting Module offers a centralized reporting platform capable of producing operational, financial and analytical reports from a unified data model.

The module consumes data prepared by the Analytics Module and presents it in user-friendly formats.

---

# 2. Vision

Every stakeholder should have access to accurate and consistent reports without requiring technical knowledge.

Reports should support:

* daily operations
* business management
* financial analysis
* regulatory compliance
* strategic decision-making

Reporting should become a platform capability rather than a module-specific feature.

---

# 3. Design Principles

## Analytics Driven

Reports consume analytical datasets.

Business modules never generate reports directly.

---

## Template Based

Reports are generated from reusable templates.

Templates define:

* layout
* sections
* visualizations
* filters
* export formats

---

## Parameterized

Every report supports configurable parameters.

Examples:

* organization
* property
* reservation period
* guest nationality
* marketplace category
* provider

The same report template may produce many report variants.

---

## Export Independent

Reports are independent of output formats.

Supported formats may include:

* PDF
* Excel
* CSV
* HTML

Future formats may be added without modifying report definitions.

---

## Scheduled

Reports may be generated:

* on demand
* periodically
* automatically
* as part of workflows

---

# 4. High-Level Architecture

```text
Analytics Module
        │
        ▼
Reporting Module
        │
 ┌──────┼──────────────┐
 ▼      ▼              ▼
Templates Rendering Export
        │
        ▼
Administration Backoffice
```

The Reporting Module focuses exclusively on report generation and presentation.

---

# 5. Report Categories

Examples include:

Operational Reports

* arrivals
* departures
* occupancy
* housekeeping

Financial Reports

* payments
* marketplace revenue
* commissions
* refunds

Marketplace Reports

* service sales
* provider performance
* conversion rates

Maintenance Reports

* open requests
* completed work
* response times

Smart Property Reports

* energy usage
* device status
* automation events

AI Reports

* conversations
* tool usage
* resolution rates

New report categories may be introduced without changing the architecture.

---

# 6. Report Templates

Each report template defines:

* report identifier
* title
* description
* supported parameters
* visual components
* export options
* access permissions

Templates are versioned and reusable.

---

# 7. Filtering

Reports support advanced filtering.

Examples:

* date range
* property
* reservation status
* guest language
* provider
* service
* workflow status

Filtering is performed before report generation.

---

# 8. Scheduling

Reports may be scheduled automatically.

Examples:

Daily

* arrivals
* departures

Weekly

* revenue summary
* maintenance overview

Monthly

* financial statements
* marketplace performance
* occupancy statistics

Schedules are managed by the Workflow Engine.

---

# 9. Export

The Reporting Module supports multiple export formats.

Examples:

* PDF
* Excel
* CSV
* HTML

Export generation is independent of report content.

---

# 10. Distribution

Generated reports may be delivered through:

* Administration Backoffice
* Email
* File Storage
* API

Future distribution channels may be added through the Notification Platform.

---

# 11. Dashboard Integration

Reports and dashboards serve different purposes.

Dashboards provide live operational visibility.

Reports provide structured historical analysis.

Both consume the Analytics Module.

---

# 12. AI Integration

The AI Platform may generate reports on demand.

Examples:

> Show occupancy for last month.

> Export breakfast sales for this season.

> Compare marketplace revenue between two properties.

AI requests are translated into report generation workflows.

---

# 13. Administration

Administrators may manage:

* report templates
* schedules
* export formats
* permissions
* report history

Template changes do not require application deployment.

---

# 14. Security

Reports follow platform-wide authorization rules.

Access depends on:

* organization
* property
* user role
* report permissions

Generated reports inherit the permissions of the requesting user.

---

# 15. Design Rules

The Reporting Module follows these mandatory rules.

* Reports consume Analytics rather than operational data.
* Reports are template-based.
* Templates are reusable and versioned.
* Export formats remain independent.
* Reports support scheduling.
* Reports respect authorization.
* AI generates reports through the Reporting Module.
* Report generation is fully auditable.

---

# 16. Future Evolution

The Reporting Module is designed to become the enterprise reporting platform of Hospitality OS.

Future capabilities may include interactive reports, embedded BI dashboards, report subscriptions, collaborative reporting, natural-language report generation and external business intelligence integrations.

The long-term objective is to provide a scalable, configurable and enterprise-grade reporting platform capable of supporting organizations of every size while maintaining a consistent user experience across Hospitality OS.
