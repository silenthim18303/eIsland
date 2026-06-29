---
title: Backend Architecture
icon: server
---

# Backend Architecture

:::info
This section documents the eIsland backend server architecture, including the modular monolith design, MySQL database schema, Redis caching layer, and RabbitMQ message queue topology.
:::

## Overview

The eIsland backend is a **Java 25 Spring Boot 4.0.5** modular monolith serving RESTful APIs, real-time communication, and background processing for the desktop application. The architecture spans three major infrastructure layers:

- **Application** — Modular monolith with 11 Maven modules covering auth, user, agent, payment, weather, and more
- **Data** — MySQL for persistent storage, Redis for caching/rate-limiting/billing, RabbitMQ for async processing
- **Security** — JWT authentication, RBAC, rate limiting, replay protection, and Bloom filters

## Documents

| Document | Description |
|----------|-------------|
| [Server Architecture](server-model.md) | Modular monolith design, module structure, dependency flow, security, API design, AI agent system, and payment system |
| [MySQL Database Schema](mysql-schema.md) | Complete database schema: 37 tables across 13 domains with every field documented |
| [Redis Architecture](redis-schema.md) | Redis usage: 15 databases, ~83 key patterns, Bloom filters, Lua scripts, rate limiting, and distributed locks |
| [RabbitMQ Architecture](rabbitmq-schema.md) | Message queue topology: 6 exchanges, 21 queues, 9 message types, retry/DLQ pattern, and all producer/consumer flows |
