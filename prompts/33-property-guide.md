# File: `33-property-guide.md`

# Hospitality OS

## Property Guide Module

Version: 1.0
Status: Draft
Audience: Product Owners, Software Architects, Backend Developers, Frontend Developers, Content Managers

---

# 1. Purpose

The Property Guide Module provides structured knowledge about a property and its accommodation units.

Rather than distributing PDF manuals, printed booklets or lengthy welcome messages, the Property Guide serves as the single source of truth for all property-related information.

The module integrates with the Guest Portal, AI Platform, Messaging Module and Smart Property Module.

---

# 2. Vision

Every guest should immediately find the information they need without contacting the host.

The Property Guide should replace:

* printed welcome books
* PDF instructions
* appliance manuals
* Wi-Fi cards
* repeated guest questions

Information should be searchable, multilingual and continuously maintained.

---

# 3. Design Principles

## Knowledge Based

The Property Guide stores structured knowledge rather than static documents.

Information should be organized into logical topics instead of large text blocks.

---

## Modular

Every module may contribute documentation.

Examples:

Smart Property

↓

Door Lock Instructions

Marketplace

↓

Breakfast Information

Check-In

↓

Arrival Instructions

The Property Guide aggregates knowledge without owning business logic.

---

## AI Ready

Every guide entry is designed to be consumed by the AI Platform.

Content should be structured, searchable and semantically meaningful.

---

## Multilingual

Guide content supports multiple languages.

Translations are managed independently.

Guests automatically receive content in their preferred language whenever available.

---

## Configuration Driven

Each property decides which content is visible.

The same platform supports different properties with different documentation.

---

# 4. High-Level Architecture

```text
Property
     │
     ▼
Property Guide Module
     │
 ┌───┼────────────────────┐
 ▼   ▼                    ▼
Guest Portal      AI Platform
     │
     ▼
Messaging Module
```

The Property Guide becomes the central knowledge repository for every property.

---

# 5. Knowledge Categories

Examples include:

Property

* welcome information
* house rules
* emergency contacts

Apartment

* Wi-Fi
* parking
* waste disposal
* heating
* air conditioning

Equipment

* oven
* dishwasher
* television
* coffee machine
* washing machine

Services

* breakfast
* bike rental
* luggage storage

Local Information

* supermarkets
* pharmacies
* restaurants
* attractions
* public transport

Safety

* fire procedures
* emergency exits
* first aid

Additional categories may be introduced without modifying the module architecture.

---

# 6. Content Structure

Each knowledge article contains:

* identifier
* title
* category
* language
* content
* images
* attachments
* visibility rules
* version

Content is stored independently from presentation.

---

# 7. Search

The Property Guide supports full-text search.

Guests may search for:

* equipment
* facilities
* services
* rules
* recommendations

Search should prioritize relevant and localized results.

---

# 8. Smart Property Integration

Guide articles may reference connected devices.

Examples:

* How to unlock the door
* How to adjust heating
* How to operate blinds
* How to use the sauna

The Smart Property Module provides operational context.

---

# 9. AI Integration

The AI Platform uses the Property Guide as its primary knowledge source.

Example:

Guest:

> "How do I use the oven?"

AI performs:

Guide Search

↓

Relevant Article

↓

Contextual Response

Whenever possible, AI responses should originate from Property Guide content rather than generated knowledge.

---

# 10. Guest Portal Integration

The Guest Portal provides access to:

* categories
* search
* featured articles
* recently viewed content

Guests should reach important information in as few interactions as possible.

---

# 11. Messaging Integration

When AI cannot confidently answer a question, the Messaging Module may escalate the conversation to a property manager.

The conversation automatically references the relevant Property Guide article when applicable.

---

# 12. Administration

Property managers may:

* create articles
* organize categories
* upload images
* attach manuals
* translate content
* publish revisions

Content management should be simple enough for non-technical users.

---

# 13. Versioning

Every guide article supports version history.

Each revision records:

* author
* timestamp
* previous version
* publication status

Historical versions remain available for auditing and rollback.

---

# 14. Analytics

Business Metrics

* most viewed articles
* most searched topics
* unresolved searches
* AI knowledge utilization

Operational Metrics

* article updates
* translation coverage
* content completeness

Analytics help property managers improve documentation quality.

---

# 15. Design Rules

The Property Guide Module follows these mandatory rules.

* The Property Guide is the primary knowledge source for guests.
* AI should prioritize Property Guide content over generated responses.
* Knowledge is structured rather than document-oriented.
* Content supports multiple languages.
* Every article supports versioning.
* Search is permission-aware.
* Modules contribute knowledge without modifying the guide itself.
* Content remains independent from presentation.

---

# 16. Future Evolution

The Property Guide Module is designed to evolve into a comprehensive hospitality knowledge platform.

Future capabilities may include interactive guides, video tutorials, QR code integration, contextual help based on guest location within the property, AI-generated article suggestions and automatic content quality analysis.

The long-term objective is to establish the Property Guide as the authoritative knowledge repository for every accommodation managed through Hospitality OS, enabling guests, staff and AI assistants to access accurate, up-to-date information through a single, structured source.
