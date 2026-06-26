# File: `11-ai-platform.md`

# Hospitality OS

## AI Platform

Version: 1.0
Status: Draft
Audience: Software Architects, Backend Developers, AI Engineers, Product Owners

---

# 1. Purpose

The AI Platform is a core platform capability of Hospitality OS.

Rather than being implemented as a standalone chatbot, Artificial Intelligence is deeply integrated into the platform and can assist guests, property owners, administrators and service providers across every stage of the guest journey.

The AI Platform provides a centralized architecture for AI capabilities while ensuring consistency, security and maintainability across the entire platform.

AI should enhance existing workflows rather than replace them.

---

# 2. Vision

The long-term vision is to make AI an intelligent platform service available to every module within Hospitality OS.

Instead of building multiple independent AI assistants, the platform exposes a single AI layer that understands:

* the current guest
* the reservation
* the property
* enabled modules
* available services
* connected providers
* business workflows

Every interaction should be context-aware and consistent.

---

# 3. Design Principles

## AI as a Platform Service

AI is not implemented inside individual modules.

Modules expose:

* knowledge
* tools
* actions
* business context

The AI Platform coordinates their use.

---

## Context Aware

Every AI request executes within a business context.

Context may include:

* organization
* property
* reservation
* guest
* language
* current workflow
* enabled modules
* user permissions

Responses should always reflect the current business context.

---

## Secure

AI follows exactly the same authorization model as the rest of Hospitality OS.

The AI Platform must never expose information the current user is not authorized to access.

---

## Vendor Independent

The platform communicates through AI Providers.

Examples:

* OpenAI
* Anthropic
* Local LLM
* Future AI Providers

Changing the language model must never require business logic changes.

---

## Explainable

Whenever possible, AI responses should be based on structured platform knowledge.

The platform should prioritize deterministic information over generated assumptions.

---

# 4. High-Level Architecture

```text
User
    │
    ▼
AI Request
    │
    ▼
Context Builder
    │
    ▼
Permission Engine
    │
    ▼
Knowledge Engine
    │
    ▼
Tool Registry
    │
    ▼
AI Provider
    │
    ▼
AI Response
```

The AI Platform orchestrates the complete request lifecycle.

---

# 5. Platform Components

The AI Platform consists of several independent components.

## Context Builder

Responsible for collecting business context.

Examples:

* active reservation
* guest profile
* selected property
* organization settings
* enabled modules
* language preferences

---

## Knowledge Engine

Aggregates structured information from all modules.

Knowledge sources include:

* Reservation
* Property
* Apartment Guide
* FAQ
* Device Manuals
* Recommendations
* Marketplace
* House Rules
* Policies

Knowledge always belongs to the originating module.

---

## Tool Registry

Modules may expose executable AI tools.

Examples:

* Order Breakfast
* Request Late Checkout
* Generate Door PIN
* Open Smart Lock
* Report Maintenance Issue
* Contact Property Manager

The AI Platform determines which tools are available.

---

## AI Provider

Responsible for communicating with the selected language model.

Providers are implemented through the Provider Framework.

---

## Conversation Manager

Responsible for maintaining conversation state.

Supports:

* guest conversations
* administrator conversations
* property context
* reservation context

Conversation management is independent of the selected AI provider.

---

# 6. Knowledge Sources

Knowledge should always be structured.

Examples include:

Property Knowledge

* apartment description
* amenities
* equipment
* house rules

Reservation Knowledge

* dates
* guests
* status
* payments

Marketplace Knowledge

* available services
* pricing
* availability

Operational Knowledge

* workflows
* policies
* procedures

Local Knowledge

* restaurants
* attractions
* transportation
* weather

Knowledge is contributed by individual modules.

---

# 7. AI Tools

Modules may expose executable tools.

Examples include:

Guest Tools

* Order Breakfast
* Book Transfer
* Extend Stay
* Late Checkout
* Report Problem

Administration Tools

* Search Reservation
* Generate Report
* Create Provider
* Update Configuration

AI never executes business logic directly.

Tools invoke existing APIs and workflows.

---

# 8. Prompt Construction

Every prompt is generated dynamically.

Prompt components include:

* system instructions
* business context
* relevant knowledge
* available tools
* user request

Only information relevant to the current interaction should be included.

---

# 9. Authorization

Every AI request follows the platform security model.

Before execution, Hospitality OS verifies:

* identity
* organization
* property
* reservation ownership
* permissions
* available modules

AI has no elevated privileges.

---

# 10. Conversation Memory

Conversation memory is configurable.

Possible scopes include:

Session Memory

Current conversation only.

Reservation Memory

Available during the reservation lifecycle.

Property Memory

Shared operational knowledge.

Long-Term Memory

Optional future capability.

Memory retention must comply with privacy regulations.

---

# 11. Multilingual Support

The AI Platform should support multiple languages.

Language selection may depend on:

* guest preference
* reservation language
* property default
* administrator preference

Modules should not implement language-specific AI logic.

---

# 12. Workflow Integration

AI integrates directly with the Workflow Engine.

Example:

```text
Guest:
"I would like breakfast tomorrow."

↓

AI understands intent

↓

Breakfast Tool

↓

Workflow Started

↓

Provider Selected

↓

Order Created

↓

Confirmation Returned
```

AI becomes another entry point into existing business workflows.

---

# 13. Marketplace Integration

The AI Platform understands Marketplace services.

Examples:

* recommend breakfast
* suggest bike rental
* explain prices
* compare available services
* place orders

Recommendations should consider:

* reservation
* season
* guest profile
* availability

---

# 14. Observability

Every AI interaction should be measurable.

Metrics include:

Business Metrics

* conversations
* successful tool executions
* automation rate

Operational Metrics

* response time
* provider latency
* failures
* retries

Usage Metrics

* token consumption
* cost
* provider utilization

These metrics support optimization and cost management.

---

# 15. Safety

The AI Platform must:

* respect permissions
* avoid exposing confidential information
* identify uncertain responses
* avoid unsupported assumptions
* never invent operational data

When reliable information is unavailable, the AI should clearly communicate this.

---

# 16. Future Evolution

The AI Platform is designed as a foundational platform capability rather than a standalone feature.

As Hospitality OS evolves, new modules, providers and workflows will automatically extend AI capabilities by contributing additional knowledge and tools.

The long-term objective is to provide every participant in the Hospitality OS ecosystem with a secure, context-aware and trustworthy AI assistant capable of understanding the complete guest journey while remaining fully integrated with the Domain Model, Workflow Engine and Provider Framework.

---

# 17. Prompt Structure

Every AI call is a JSON object sent to the AI Provider.

The structure follows the Anthropic Messages API format.

---

## 17.1 Request Format

```json
{
  "model": "claude-opus-4-8",
  "max_tokens": 1024,
  "system": "<system prompt — see 17.2>",
  "messages": [
    {
      "role": "user",
      "content": "<assembled runtime context — see 17.3>"
    }
  ]
}
```

---

## 17.2 System Prompt

The system prompt defines the AI's role, capabilities and output constraints.

It is static per use case and assembled once during configuration.

The platform reads it from the relevant prompt file and passes it as the `system` field.

### MVP: Access Control Orchestrator

The current system prompt covers the orchestrator use case.

It instructs the AI to process access control job batches (insert / update / cancel PIN codes) and return a structured JSON result.

Source: `prompts/11-ai-platform.md`, section 17.4.

---

## 17.3 User Message (Runtime Context)

The user message carries the dynamic payload assembled at request time.

For the orchestrator use case, the runtime message is the jobs batch fetched from `GET /api/orchestrator/jobs`:

```json
{
  "jobs": [
    {
      "_internalJobId": 42,
      "jobId": "BR-2024-001",
      "action": "insert",
      "firstName": "Ana",
      "lastName": "Novak",
      "door": "Maple",
      "validFrom": "2024-06-15 13:00",
      "validTo": "2024-06-18 11:30"
    }
  ]
}
```

The AI response is parsed as JSON and posted to `POST /api/orchestrator/results`:

```json
{
  "results": [
    {
      "_internalJobId": 42,
      "jobId": "BR-2024-001",
      "status": "success",
      "pin": "5831"
    }
  ]
}
```

---

## 17.4 Orchestrator System Prompt

The following text is the system prompt passed verbatim as the `system` field when calling the AI Provider for the orchestrator use case.

---

```
You are the access control orchestrator for Maple & Pine Apartments Bled — a short-term rental property in Slovenia.

Your sole responsibility is to process batches of access control jobs and return structured JSON results. You do not produce any explanation, commentary, or text outside of the JSON response.

## Input

You receive a JSON object with a jobs array. Each job has the following fields:

- _internalJobId (integer): internal portal job ID — echo it in the result
- jobId (string): Bentral reservation ID — echo it in the result
- action (string): "insert", "update", or "cancel"
- firstName (string): guest first name
- lastName (string): guest last name
- door (string): "Maple", "Pine", or "Maple,Pine"
- validFrom (string, YYYY-MM-DD HH:MM): access start — absent on cancel
- validTo (string, YYYY-MM-DD HH:MM): access end — absent on cancel

## Actions

insert — new confirmed reservation:
Create a new PIN code for the guest on the access system.
Assign the PIN to the door(s) for the window validFrom → validTo.
If door is "Maple,Pine", the same PIN grants access to both apartments.
Return the generated PIN in the result.

update — reservation dates changed:
Do not generate a new PIN — keep the existing one.
Adjust validFrom and validTo on the access system.

cancel — reservation cancelled:
Revoke the guest's PIN immediately.

## Output

Return ONLY a valid JSON object — no markdown, no explanation, no trailing text:

{
  "results": [
    {
      "_internalJobId": 42,
      "jobId": "BR-2024-001",
      "status": "success",
      "pin": "5831"
    }
  ]
}

For failed jobs, set status to "failed" and include a reason:

{
  "_internalJobId": 42,
  "jobId": "BR-2024-001",
  "status": "failed",
  "reason": "Access system unavailable — timeout after 10s"
}

## Rules

1. Process every job in the input batch — never silently skip a job.
2. Return exactly one result per job.
3. pin is mandatory for a successful insert — omit it for update and cancel.
4. If the access system returns an error, mark the job failed and include the error in reason.
5. Your entire response must be a single valid JSON object and nothing else.
```
