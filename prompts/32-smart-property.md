# File: `32-smart-property.md`

# Hospitality OS

## Smart Property Module

Version: 1.0
Status: Draft
Audience: Product Owners, Software Architects, Backend Developers, IoT Engineers, Integration Developers

---

# 1. Purpose

The Smart Property Module provides centralized management of connected devices within Hospitality OS.

Rather than integrating individual smart home vendors directly into business modules, the Smart Property Module provides a unified abstraction layer for controlling and monitoring physical devices across hospitality properties.

The module bridges the digital platform with the physical property.

---

# 2. Vision

Every connected device within a property should be manageable through Hospitality OS.

Business modules should never communicate directly with IoT vendors.

Instead, they interact with the Smart Property Module, which coordinates automation, monitoring and provider integrations.

The Smart Property Module should become the digital representation of the physical property.

---

# 3. Design Principles

## Device Independent

The module understands devices, not vendors.

Examples:

* Lock
* Thermostat
* Light
* Sensor
* Garage Door
* EV Charger
* Air Conditioner
* Smart Plug

Vendor-specific implementations remain inside Providers.

---

## Provider Based

All devices communicate through Smart Property Providers.

Examples:

* Somfy TaHoma
* Home Assistant
* Shelly
* Philips Hue
* Nuki
* Aqara
* Tuya
* Future Providers

Changing vendors should never affect business logic.

---

## Event Driven

Device events generate platform events.

Examples:

* Door Opened
* Temperature Changed
* Leak Detected
* Device Offline

Business workflows subscribe to these events.

---

## Workflow Integrated

The module never executes business rules directly.

Automation is coordinated by the Workflow Engine.

---

## Digital Twin

Every physical device has a digital representation.

The platform stores:

* identity
* capabilities
* state
* provider
* location
* metadata

Business modules interact with the digital representation rather than the physical device.

---

# 4. High-Level Architecture

```text
Business Module
        │
        ▼
Smart Property Module
        │
        ▼
Device Registry
        │
        ▼
Provider Framework
        │
        ▼
Smart Property Provider
        │
        ▼
Physical Device
```

---

# 5. Device Types

Examples include:

Access

* smart locks
* gates
* garage doors

Climate

* thermostats
* HVAC
* heat pumps

Lighting

* switches
* dimmers
* smart bulbs

Energy

* smart plugs
* energy meters
* EV chargers

Safety

* smoke detectors
* leak sensors
* motion sensors

Comfort

* blinds
* curtains
* sauna
* jacuzzi
* pool

Additional device types may be introduced without architectural changes.

---

# 6. Device Registry

Every device is registered centrally.

Each device contains:

* identifier
* property
* location
* provider
* device type
* capabilities
* online status
* current state

The registry acts as the single source of truth.

---

# 7. Device Capabilities

Devices expose standardized capabilities.

Examples:

Lock

* lock
* unlock
* status

Light

* on
* off
* brightness

Thermostat

* current temperature
* target temperature
* mode

Business modules consume capabilities instead of vendor-specific APIs.

---

# 8. State Management

The Smart Property Module maintains device state.

Examples:

* online
* offline
* battery level
* current temperature
* door locked
* light on

State changes generate platform events.

---

# 9. Workflow Integration

Example:

```text
Guest Checked Out
        │
        ▼
Workflow Started
        │
        ▼
Lock Door
Turn Off Lights
Reduce Heating
Disable Access
Enable Alarm
```

The Workflow Engine coordinates every action.

---

# 10. AI Integration

The AI Platform understands the Smart Property.

Examples:

Guest:

> "Can you lower the temperature?"

↓

AI

↓

Permission Check

↓

Workflow

↓

Thermostat Updated

AI never communicates directly with devices.

---

# 11. Reservation Integration

Reservations influence device behavior.

Examples:

Before Arrival

* preheat apartment
* unlock parking
* enable hot water

During Stay

* allow guest control
* optimize energy usage

After Checkout

* disable access
* switch devices to standby
* activate energy-saving mode

---

# 12. Monitoring

Operational monitoring includes:

* device availability
* battery level
* communication failures
* offline devices
* provider health

Monitoring supports proactive maintenance.

---

# 13. Notifications

Device events may trigger notifications.

Examples:

* water leak detected
* smoke alarm
* device offline
* low battery
* door left open

Notification routing is handled by the Notification Platform.

---

# 14. Administration

The Administration Backoffice provides:

* device inventory
* provider management
* device diagnostics
* live device status
* event history
* automation overview

Administrators may manually execute device actions when authorized.

---

# 15. Security

The Smart Property Module follows strict security requirements.

Examples:

* authenticated commands
* permission validation
* encrypted communication
* provider authentication
* audit logging

Every command must be traceable.

---

# 16. Design Rules

The Smart Property Module follows these mandatory rules.

* Business modules never communicate directly with devices.
* Every device has a digital representation.
* Providers remain interchangeable.
* Device actions execute through workflows.
* State changes generate events.
* AI interacts through platform APIs.
* Every command is auditable.
* Physical devices remain implementation details.

---

# 17. Future Evolution

The Smart Property Module is designed to become the operational IoT platform of Hospitality OS.

Future capabilities may include predictive energy optimization, occupancy-aware automation, digital twins, autonomous maintenance, AI-generated automation rules and integration with emerging smart building standards.

The long-term objective is to create an intelligent, vendor-independent property automation platform that seamlessly connects the physical and digital worlds while supporting exceptional guest experiences and highly efficient property operations.
