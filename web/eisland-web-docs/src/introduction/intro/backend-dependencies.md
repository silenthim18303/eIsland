---
title: Backend Dependencies
icon: server
---

# Backend Dependencies

:::info
This document provides a non-technical overview of every library and tool used in the eIsland backend server. The backend is a Java application built with Spring Boot, using Maven as its build tool. Each dependency is explained by what it does for the user, not how it works internally.
:::

:::note
**Build Environment:** Apache Maven · Java 25 (JDK 25.0.2)
:::

## Core Framework

The foundational Spring Boot starters that provide the server's core capabilities.

| Starter | What It Does |
|---------|--------------|
| **Spring Boot Starter WebMVC** | Powers the server's REST API — handles incoming HTTP requests from the eIsland desktop app and returns responses (user data, weather info, AI replies, etc.). |
| **Spring Boot Starter Security** | Protects the server from unauthorized access — handles login, password hashing, session management, and ensures only authenticated users can access protected endpoints. |
| **Spring Boot Starter JSON** | Automatically converts Java objects to JSON format for API responses, and parses incoming JSON requests into Java objects. |
| **Spring Boot Starter Validation** | Validates incoming request data — ensures required fields are present, values are within allowed ranges, and formats are correct before processing. |
| **Spring Boot Starter Cache** | Provides an in-memory caching layer — stores frequently accessed data temporarily to reduce database load and improve response speed. |
| **Spring Boot Starter Tomcat** | The embedded web server that hosts the application. Configured as `provided` because the app can also run on an external Tomcat server. |
| **Spring Boot Configuration Processor** | Generates metadata for custom configuration properties, enabling IDE auto-completion and documentation for server settings. |

:::tip
Spring Boot Starters are pre-packaged bundles of functionality. Instead of manually configuring each feature, developers simply add a starter dependency and Spring Boot automatically sets up everything needed.
:::

## Database & ORM

Libraries for connecting to and interacting with the MySQL database.

| Library | What It Does |
|---------|--------------|
| **MyBatis Spring Boot Starter** | Bridges the gap between Java code and MySQL database. Translates Java method calls into SQL queries and maps database results back to Java objects. Used across all modules that store data (users, payments, versions, game scores, etc.). |
| **MySQL Connector/J** | The official MySQL driver for Java — enables the application to establish connections with the MySQL database server and execute queries. |

:::details How MyBatis Works — Simplified
When the server needs to save a new user, MyBatis takes the Java user object, runs the appropriate SQL `INSERT` statement against MySQL, and returns the result. Developers write SQL in XML mapper files rather than embedding it in Java code, keeping the logic clean and maintainable.
:::

## Caching & Message Queue

Libraries for Redis caching and RabbitMQ message processing.

| Library | What It Does |
|---------|--------------|
| **Spring Boot Starter Data Redis** | Connects to the Redis in-memory database for fast caching. Stores frequently accessed data (user sessions, weather cache, rate limiting counters, leaderboard scores) to reduce MySQL load and improve response times. |
| **Spring Boot Starter AMQP** | Connects to RabbitMQ for asynchronous message processing. Used for tasks that don't need immediate completion — like sending emails, processing payments, and retrying failed operations. |

:::important
Redis and RabbitMQ are critical infrastructure services. Redis provides sub-millisecond data access for hot data, while RabbitMQ ensures reliable processing of background tasks. Both services must be running for the backend to function correctly.
:::

## Authentication & Security

Libraries for JWT token-based authentication and email verification.

| Library | What It Does |
|---------|--------------|
| **JJWT API** | Creates and validates JSON Web Tokens (JWT) — the secure "tickets" that prove a user is logged in. When you log in to eIsland, the server generates a JWT that the app includes in every subsequent request. |
| **JJWT Impl** | The runtime implementation of JJWT that handles the actual cryptographic operations (signing and verifying tokens). |
| **JJWT Jackson** | Integrates JJWT with Jackson for JSON serialization of JWT claims (the data stored inside the token). |
| **Resend Java** | Sends transactional emails (verification codes, password resets, payment confirmations) through the Resend email service. |

:::warning
JWT tokens have an expiration time. When a token expires, the user must log in again. This is a security measure — even if a token is stolen, it becomes useless after expiration.
:::

## AI & Machine Learning

Libraries that power the eIsland AI assistant (mihtnelis agent).

| Library | What It Does |
|---------|--------------|
| **Spring AI OpenAI** | Integrates with OpenAI's API for AI-powered conversations. Provides streaming responses so users see the AI typing in real-time. |
| **LangChain4j** | A Java framework for building AI agent applications — provides tools for chaining AI calls, managing conversation memory, and orchestrating complex AI workflows. |
| **LangChain4j OpenAI** | The OpenAI-specific module for LangChain4j — connects to OpenAI models for the agent's reasoning and tool-calling capabilities. |

:::details AI Agent Architecture
The eIsland AI agent uses a combination of Spring AI (for streaming conversations) and LangChain4j (for tool orchestration). When you ask the AI a question, it can use tools like weather lookup, system commands, or web search to gather information before formulating a response.
:::

## Speech Recognition

| Library | What It Does |
|---------|--------------|
| **Tencent Cloud Speech SDK Java** | Converts speech to text — enables voice input for the AI assistant. When you speak to eIsland, this library sends the audio to Tencent Cloud's speech recognition service and returns the transcribed text. |

## Cloud Storage

Libraries for file uploads and storage across multiple cloud providers.

| Library | What It Does |
|---------|--------------|
| **Aliyun SDK OSS** | Connects to Alibaba Cloud Object Storage Service — used for storing user uploads (avatars, files) in regions where Alibaba Cloud is the primary provider. |
| **Tencent COS API** | Connects to Tencent Cloud Object Storage — provides file storage capabilities as an alternative cloud provider. |
| **AWS S3 SDK** | Connects to Amazon S3 and S3-compatible services (like Cloudflare R2) — used for storing application assets, release files, and user uploads. |

:::tip
The upload module supports three cloud storage providers. Developers can configure which provider to use based on the deployment region — Alibaba Cloud for mainland China, Tencent Cloud as an alternative, and Cloudflare R2 for global distribution.
:::

## Payment Processing

Libraries for handling payments and financial transactions.

| Library | What It Does |
|---------|--------------|
| **Alipay SDK Java** | Integrates with Alipay (支付宝) — one of China's largest payment platforms. Handles payment creation, QR code generation, payment verification, and refund processing. |

:::warning
Payment processing involves real financial transactions. The Alipay SDK handles secure communication with Alipay's servers, verifies payment callbacks to prevent fraud, and ensures all transactions are properly recorded.
:::

## Markdown Processing

| Library | What It Does |
|---------|--------------|
| **CommonMark** | Parses and renders Markdown text on the server side. Used to convert Markdown content (like user profiles or game descriptions) into HTML for display. |

## HTTP Client

| Library | What It Does |
|---------|--------------|
| **Apache HttpClient** | Makes HTTP requests to external services from the server. Used when the server needs to call third-party APIs (weather services, payment gateways, cloud storage) on behalf of the user. |

## Configuration

| Library | What It Does |
|---------|--------------|
| **Spring DotEnv** | Loads environment variables from `.env` files — allows developers to keep sensitive configuration (database passwords, API keys, secret tokens) out of the source code. |

:::danger
Never commit `.env` files to version control. These files contain sensitive credentials that could compromise the entire system if exposed. The `.gitignore` file is configured to exclude them.
:::

## Servlet API

| Library | What It Does |
|---------|--------------|
| **Jakarta Servlet API** | Provides the interface for handling HTTP requests and responses at the servlet level. Used by utility classes that need direct access to request information (like extracting the client's IP address). |

:::note
The Jakarta Servlet API is marked as `provided` — it is supplied by the web server (Tomcat) at runtime, not bundled with the application. This avoids conflicts between the application's and server's servlet implementations.
:::

## Testing

Libraries used by developers to verify the server works correctly.

| Library | What It Does |
|---------|--------------|
| **Spring Boot Starter Test** | Provides the testing framework for the entire application — includes JUnit for running tests, MockMvc for simulating HTTP requests, and assertion libraries for verifying results. |
| **Spring Security Test** | Provides testing utilities specific to security — allows developers to simulate authenticated users, test permission checks, and verify that protected endpoints reject unauthorized access. |

:::details Testing Approach
The backend uses a layered testing strategy:

1. **Unit Tests** — Test individual methods and classes in isolation.
2. **Integration Tests** — Test how modules work together (e.g., auth + user + database).
3. **Security Tests** — Verify that authentication and authorization rules are correctly enforced.
:::

## Internal Modules

The server is organized as a modular monolith with 11 internal modules. These are not external libraries but project components that depend on each other.

| Module | What It Does |
|--------|--------------|
| **server-common** | Shared utilities, constants, and exception definitions used by all other modules. |
| **server-auth** | Handles user authentication — login, registration, JWT token management, email verification, and Spring Security configuration. |
| **server-user** | Manages user accounts — profiles, preferences, avatar uploads, and admin role assignment. |
| **server-agent** | Powers the AI assistant — streaming conversations, tool orchestration, speech recognition, and usage billing. |
| **server-weather** | Provides weather data — proxies requests to the QWeather API, caches results in Redis, and manages Pro-tier access. |
| **server-payment** | Processes payments — integrates with Alipay and WeChat Pay for subscription purchases and handles payment callbacks. |
| **server-version** | Manages application versions — stores version metadata, tracks release history, and serves version check requests from the desktop app. |
| **server-service-status** | Tracks API service health — monitors which backend services are operational and provides status information. |
| **server-upload** | Handles file uploads — manages avatar uploads, file storage across multiple cloud providers (Alibaba OSS, Tencent COS, Cloudflare R2). |
| **server-mini-game** | Powers mini-games — handles high score submissions, leaderboard queries, and uses Redis caching with RabbitMQ for reliable data persistence. |
| **server-app** | The main entry point — aggregates all modules, contains the application configuration, and produces the final deployable package. |

:::note
The modular monolith architecture means all modules run within a single application but are logically separated. Each module has its own database tables, services, and controllers. Modules communicate through well-defined Java interfaces rather than direct database access.
:::

## Build Tool

| Tool | What It Does |
|------|--------------|
| **Apache Maven** | The build tool that compiles Java source code, runs tests, and packages the application into a deployable WAR file. It also manages all external dependencies listed in this document. |

:::tip
Maven reads the `pom.xml` files to understand which dependencies each module needs. When a developer runs `mvn build`, Maven automatically downloads all required libraries from the Maven Central repository and manages version conflicts between modules.
:::
