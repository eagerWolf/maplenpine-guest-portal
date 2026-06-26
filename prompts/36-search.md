# File: `36-search.md`

# Hospitality OS

## Search Module

Version: 1.0
Status: Draft
Audience: Software Architects, Backend Developers, Frontend Developers, AI Engineers

---

# 1. Purpose

The Search Module provides centralized search capabilities across the entire Hospitality OS platform.

Rather than allowing individual modules to implement independent search functionality, the Search Module offers a unified search engine capable of indexing and retrieving information from every platform component.

The Search Module serves both human users and the AI Platform.

---

# 2. Vision

Users should be able to search Hospitality OS from a single search interface.

Whether searching for:

* reservations
* guests
* conversations
* marketplace orders
* properties
* devices
* knowledge articles
* reports

the experience should remain fast, consistent and permission-aware.

---

# 3. Design Principles

## Platform Wide

Every module may contribute searchable content.

Examples include:

* Reservations
* Guests
* Properties
* Marketplace
* Messaging
* Property Guide
* Maintenance
* Housekeeping
* Reports

The Search Module provides one unified index.

---

## Permission Aware

Search results always respect platform permissions.

Users only see results they are authorized to access.

Search must never expose hidden resources.

---

## AI Ready

The Search Module is a primary knowledge retrieval mechanism for the AI Platform.

AI should retrieve structured knowledge through Search whenever possible.

---

## Near Real-Time

Recently created or updated entities should become searchable with minimal delay.

Indexing should be asynchronous to avoid impacting operational performance.

---

## Extensible

New modules register searchable entities without modifying the Search Module.

---

# 4. High-Level Architecture

```text id="v2f8ja"
Platform Modules
        │
        ▼
Search Indexer
        │
        ▼
Search Index
        │
 ┌──────┼────────────┐
 ▼      ▼            ▼
Guest Portal  Backoffice  AI Platform
```

The Search Module maintains a centralized search index independent of operational databases.

---

# 5. Search Sources

Examples include:

Business Data

* reservations
* guests
* payments
* marketplace orders

Knowledge

* Property Guide
* FAQs
* appliance manuals

Communication

* conversations
* messages

Operations

* maintenance requests
* housekeeping tasks
* workflows

Configuration

* providers
* modules
* properties

Each module contributes searchable entities through standardized interfaces.

---

# 6. Search Capabilities

The Search Module supports:

* full-text search
* keyword search
* structured search
* filtering
* sorting
* autocomplete
* faceted search

Future capabilities may include semantic search and vector search.

---

# 7. Indexing

Indexing occurs automatically when business entities change.

Typical events include:

* entity created
* entity updated
* entity deleted
* content published

Index updates are executed asynchronously.

---

# 8. Filtering

Search results may be filtered by:

* organization
* property
* module
* entity type
* date range
* reservation status
* provider

Filtering is applied before permission evaluation is returned to the user.

---

# 9. AI Integration

The AI Platform uses the Search Module as one of its primary retrieval mechanisms.

Example:

```text
Guest:
"How do I use the washing machine?"

↓

Search Property Guide

↓

Retrieve Relevant Article

↓

Generate AI Response
```

Search enables Retrieval-Augmented Generation (RAG) while maintaining permission boundaries.

---

# 10. Guest Portal Integration

Guests may search:

* Property Guide
* services
* FAQs
* recommendations

Guest searches are limited to the current reservation context.

---

# 11. Administration Backoffice

Administrators may perform global searches across:

* reservations
* guests
* conversations
* workflows
* providers
* reports

The Backoffice becomes the primary operational search interface.

---

# 12. Performance

The Search Module should support:

* asynchronous indexing
* incremental updates
* cached queries
* scalable indexing
* distributed search (future)

Search performance should remain independent of operational database performance.

---

# 13. Analytics

Search analytics include:

Business Metrics

* most common searches
* failed searches
* popular topics

Operational Metrics

* indexing latency
* query performance
* index size
* cache efficiency

Analytics support continuous optimization.

---

# 14. Security

The Search Module follows platform-wide security policies.

Requirements include:

* permission-aware indexing
* secure search endpoints
* tenant isolation
* audit logging
* protected metadata

Search must never leak information through indexing.

---

# 15. Design Rules

The Search Module follows these mandatory rules.

* Search is centralized.
* Modules own searchable content.
* Indexing is asynchronous.
* Results are permission-aware.
* AI retrieves knowledge through Search.
* Operational databases are isolated from search workloads.
* New modules register searchable entities.
* Search operations are auditable.

---

# 16. Future Evolution

The Search Module is designed to evolve into the universal knowledge retrieval layer of Hospitality OS.

Future capabilities may include semantic search, vector databases, hybrid keyword/vector search, multilingual indexing, document embeddings and personalized ranking.

The long-term objective is to provide a fast, secure and intelligent search experience that powers both human users and AI assistants across the entire Hospitality OS platform.
