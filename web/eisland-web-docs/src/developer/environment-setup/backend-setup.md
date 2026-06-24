---
title: Backend Setup
icon: server
---

# Backend Setup

:::info
This guide covers the environment configuration for eIsland backend development, including Java, Maven, database services, and IDE configuration. For an overview of the backend technologies, see [Backend Tech Stack](/introduction/tech-stack/backend-tech-stack.md).
:::

## Prerequisites

The eIsland backend is a **Java 25 + Spring Boot 4.0.5** modular monolith. The following tools are required:

| Tool | Version | Purpose | Recommended |
|------|---------|---------|-------------|
| **JDK** | >= 25 | Java runtime and compiler | 25.0.2 |
| **Maven** | >= 3.9 | Build tool and dependency manager | 3.9.16 |
| **MySQL** | >= 8.0 | Relational database | 8.0+ |
| **Redis** | >= 7.0 | In-memory cache | 7.0+ |
| **RabbitMQ** | >= 3.13 | Message queue | 4.0+ |
| **Git** | Latest | Version control | 2.53.0.windows.2 |

:::warning
JDK 25 is required because the project uses Java 25 language features and is compiled with `--release 25`. Older JDK versions will fail to compile the project.
:::

### Installing JDK 25

**Windows (recommended — using SDKMAN):**

```bash
# Install SDKMAN from https://sdkman.io/
sdk install java 25.0.2-open
sdk use java 25.0.2-open
java -version  # Should print openjdk version "25.0.2"
```

**Windows (alternative — direct download):**

:::note
Download the JDK 25 installer from [Oracle JDK 25](https://www.oracle.com/java/technologies/downloads/) or use [Eclipse Temurin 25](https://adoptium.net/temurin/releases/?version=25).
:::

**Verify installation:**

```bash
java -version   # openjdk version "25.0.2" or later
mvn -version    # Apache Maven 3.9.x or later
```

### Installing Maven

:::tip
The project includes a Maven Wrapper (`mvnw` / `mvnw.cmd`) in the `server/` directory. You can skip the global Maven installation and use `./mvnw` instead of `mvn` for all commands.
:::

If you prefer a global installation:

**Windows (using Scoop):**

```bash
scoop install maven
mvn -version  # Should print Apache Maven 3.9.x
```

**Windows (manual):**

1. Download Apache Maven from [maven.apache.org](https://maven.apache.org/download.cgi)
2. Extract to a directory (e.g., `C:\Program Files\Maven`)
3. Add the `bin` directory to your system `PATH`

## Database Services

### MySQL

:::important
MySQL 8.0+ is required. The database schema uses features like `JSON` columns and `utf8mb4` character set that are only available in MySQL 8+.
:::

**Installation options:**

| Method | Command / Link |
|--------|---------------|
| **Docker (recommended)** | `docker run -d --name eisland-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root mysql:8` |
| **Windows installer** | Download from [dev.mysql.com](https://dev.mysql.com/downloads/installer/) |
| **Scoop** | `scoop install mysql` |

**Create the database:**

```sql
CREATE DATABASE eisland CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

:::details Docker Compose — All Services at Once
If you prefer Docker, save this as `docker-compose.yml` in the `server/` directory:

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8
    container_name: eisland-mysql
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: eisland
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci

  redis:
    image: redis:7
    container_name: eisland-redis
    ports:
      - "6379:6379"

  rabbitmq:
    image: rabbitmq:4-management
    container_name: eisland-rabbitmq
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
```

Then run:

```bash
docker compose up -d
```

This starts all three services with default credentials matching the `.env` template below.
:::

### Redis

**Installation options:**

| Method | Command / Link |
|--------|---------------|
| **Docker** | `docker run -d --name eisland-redis -p 6379:6379 redis:7` |
| **Windows (Memurai)** | Download from [memurai.com](https://www.memurai.com/get-memurai) |
| **WSL** | `sudo apt install redis-server` inside WSL |

:::note
Redis does not have an official Windows build. Use Docker, Memurai, or WSL to run Redis on Windows.
:::

### RabbitMQ

**Installation options:**

| Method | Command / Link |
|--------|---------------|
| **Docker (recommended)** | `docker run -d --name eisland-rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:4-management` |
| **Windows installer** | Download from [rabbitmq.com](https://www.rabbitmq.com/install-windows.html) |

:::tip
The Docker image with `rabbitmq:4-management` includes the Management UI. Access it at [http://localhost:15672](http://localhost:15672) with default credentials `guest` / `guest`.
:::

## Environment Configuration

The backend uses a `.env` file for all sensitive configuration. This file is **not committed to version control**.

### Create the .env File

Create a `.env` file in the `server/` directory (next to `pom.xml`):

```bash
cd server
touch .env  # or create manually in your editor
```

### Required Environment Variables

:::danger
Never commit the `.env` file to version control. It contains sensitive credentials (database passwords, API keys, JWT secrets) that could compromise the entire system.
:::

**Database:**

```properties
DB_HOST=localhost
DB_PORT=3306
DB_NAME=eisland
DB_USERNAME=root
DB_PASSWORD=root
```

**Redis:**

```properties
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DATABASE=0
REDIS_TIMEOUT=5000
REDIS_CACHE_TTL=3600
```

**RabbitMQ:**

```properties
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest
```

**JWT:**

```properties
JWT_SECRET=your-jwt-secret-key-must-be-at-least-256-bits
JWT_EXPIRATION=86400000
```

:::warning
The `JWT_SECRET` must be at least 256 bits (32 characters) for HS256 algorithm. Use a random string — do not use a simple password.
:::

**Admin Bootstrap:**

```properties
ADMIN_BOOTSTRAP_USERNAME=admin
ADMIN_BOOTSTRAP_EMAIL=admin@example.com
ADMIN_BOOTSTRAP_PASSWORD=admin
```

:::tip
The admin account is automatically created on first startup if it does not exist. These variables set the initial admin credentials.
:::

**Cloud Storage (optional for local development):**

:::details Alibaba Cloud OSS
```properties
OSS_ADMIN_AVATAR_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
OSS_ADMIN_AVATAR_ACCESS_KEY_ID=your-access-key
OSS_ADMIN_AVATAR_ACCESS_KEY_SECRET=your-secret-key
OSS_ADMIN_AVATAR_BUCKET_NAME=eisland-admin-avatar
OSS_ADMIN_AVATAR_DOMAIN=https://your-domain.com

OSS_AVATAR_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
OSS_AVATAR_ACCESS_KEY_ID=your-access-key
OSS_AVATAR_ACCESS_KEY_SECRET=your-secret-key
OSS_AVATAR_BUCKET_NAME=eisland-avatar
```
:::

:::details Cloudflare R2
```properties
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-access-key
R2_ACCESS_KEY_SECRET=your-secret-key
R2_BUCKET_NAME=eisland-releases
R2_PUBLIC_DOMAIN=https://releases.example.com
```
:::

:::details Tencent Cloud COS
```properties
COS_AVATAR_REGION=ap-guangzhou
COS_AVATAR_SECRET_ID=your-secret-id
COS_AVATAR_SECRET_KEY=your-secret-key
COS_AVATAR_BUCKET_NAME=eisland-avatar
```
:::

**Email (optional for local development):**

:::details Resend Email Service
```properties
RESEND_API_KEY=re_your-api-key
RESEND_FROM=noreply@example.com
RESEND_ENDPOINT=https://api.resend.com/emails
```
:::

**AI Agent (optional for local development):**

:::details Mihtnelis Agent Configuration
```properties
MIHTNELIS_AGENT_DEFAULT_PROVIDER=deepseek
MIHTNELIS_AGENT_DEEPSEEK_ENABLED=true
MIHTNELIS_AGENT_DEEPSEEK_BASE_URL=https://api.deepseek.com
MIHTNELIS_AGENT_DEEPSEEK_API_KEY=your-api-key
MIHTNELIS_AGENT_DEEPSEEK_MODEL=deepseek-chat
```
:::

**Payment (optional for local development):**

:::details Alipay Configuration
```properties
ALIPAY_ENABLED=true
ALIPAY_GATEWAY_URL=https://openapi.alipay.com/gateway.do
ALIPAY_APP_ID=your-app-id
ALIPAY_PRIVATE_KEY_PATH=/path/to/private-key.pem
ALIPAY_PUBLIC_KEY_PATH=/path/to/public-key.pem
ALIPAY_NOTIFY_URL=https://your-domain.com/api/payment/alipay/notify
```
:::

### Minimal .env for Local Development

For local development with only the core features, you only need the **Database**, **Redis**, **RabbitMQ**, **JWT**, and **Admin Bootstrap** sections. All cloud storage, email, AI, and payment services are optional.

:::note
Modules that depend on optional services (e.g., file upload, AI assistant, payments) will not function without their respective environment variables, but the server will still start and the core features (auth, user management, version check) will work.
:::

## Project Setup

### Fork the Repository

:::tip
1. Visit [https://github.com/JNTMTMTM/eisland-server](https://github.com/JNTMTMTM/eisland-server)
2. Click the **Fork** button in the top-right corner
:::

:::note
This creates a personal copy of the repository under your account (`your-username/eisland-server`).
:::

:::caution
You **must** fork the repository before cloning. Do not clone the original `JNTMTMTM/eisland-server` repository directly — you will not have push access and cannot create pull requests.
:::

### Clone Your Fork

```bash
# Clone your fork (NOT the original repository)
git clone https://github.com/your-username/eisland-server.git
cd eisland-server
```

:::warning
Replace `your-username` with your actual GitHub username. Do not clone the original repository directly — you will not be able to push changes.
:::

### Add Upstream Remote

```bash
# Add the original repository as "upstream"
git remote add upstream https://github.com/JNTMTMTM/eisland-server.git

# Verify remotes
git remote -v
```

### Switch to Dev Branch

```bash
# Fetch latest branches from upstream
git fetch upstream

# Switch to dev branch (main development branch)
git checkout dev

# Keep your local dev branch in sync with upstream
git pull upstream dev
```

:::info
The `dev` branch is the main development branch. All feature branches should be created from `dev`, and pull requests should target `dev`.
:::

## Build & Run

### Build the Project

```bash
cd server

# Using Maven Wrapper (no global Maven required)
./mvnw clean install

# Or using global Maven
mvn clean install
```

:::details Build Command Breakdown
- `clean` — Deletes the `target/` directory to ensure a fresh build
- `install` — Compiles all modules, runs tests, and installs artifacts to the local Maven repository
:::

### Run the Server

**Using Maven (development):**

```bash
cd server

# Run only the server-app module
./mvnw spring-boot:run -pl server-app
```

:::tip
The server starts on port `8080` by default with context path `/api`. Access the API at [http://localhost:8080/api](http://localhost:8080/api).
:::

**Using the packaged WAR (production):**

```bash
# Build the WAR file
./mvnw clean package

# Run with Java
java -jar server-app/target/server.war
```

### Run Tests

```bash
cd server

# Run all tests
./mvnw test

# Run tests for a specific module
./mvnw test -pl server-auth

# Run a single test class
./mvnw test -pl server-auth -Dtest=AuthControllerTest
```

:::tip
For iterative development, use `./mvnw test -pl server-auth -Dtest=AuthControllerTest#methodName` to run a single test method.
:::

## IDE Configuration

### IntelliJ IDEA (Recommended)

:::important
IntelliJ IDEA is the recommended IDE for Java/Spring Boot development. The Community Edition is free and sufficient for this project.
:::

**Required settings:**

1. **Project SDK** — Set to JDK 25 (`File → Project Structure → Project → SDK`)
2. **Language Level** — Set to `25` (`File → Project Structure → Project → Language Level`)
3. **Maven** — Import the project as a Maven project (`File → Open → select `server/pom.xml``)

**Recommended plugins:**

| Plugin | Purpose |
|--------|---------|
| [Spring Boot](https://plugins.jetbrains.com/plugin/13458-spring-boot) | Spring Boot support, run configurations, and actuator integration |
| [Lombok](https://plugins.jetbrains.com/plugin/6317-lombok) | Lombok annotation processing (if used) |
| [MyBatisX](https://plugins.jetbrains.com/plugin/8321-mybatisx) | MyBatis mapper navigation (jump from XML to Java interface) |
| [Database Navigator](https://plugins.jetbrains.com/plugin/1800-database-navigator) | Browse and query MySQL directly from the IDE |
| [.env files support](https://plugins.jetbrains.com/plugin/9525--env-files-support) | Syntax highlighting and variable resolution for `.env` files |

**Recommended run configuration:**

1. `Run → Edit Configurations → Add → Spring Boot`
2. Main class: `com.pyisland.server.ServerApplication`
3. Module: `server-app`
4. Environment variables: Check "Read from .env file" → select `server/.env`

### VS Code (Alternative)

If you prefer VS Code, install the following extensions:

| Extension | Purpose |
|-----------|---------|
| [Extension Pack for Java](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack) | Java language support, debugging, Maven integration |
| [Spring Boot Extension Pack](https://marketplace.visualstudio.com/items?itemName=vmware.vscode-boot-dev-pack) | Spring Boot support and live application insights |
| [MySQL](https://marketplace.visualstudio.com/items?itemName=formulahendry.vscode-mysql) | MySQL database management |
| [.env](https://marketplace.visualstudio.com/items?itemName=IronGeek.vscode-env) | `.env` file syntax highlighting |

## Project Structure

```
server/
├── pom.xml                    # Parent POM (dependency management)
├── .mvn/                      # Maven Wrapper files
├── mvnw / mvnw.cmd            # Maven Wrapper scripts
├── .env                       # Environment variables (not committed)
├── server-common/             # Shared utilities, constants, exceptions
├── server-auth/               # Authentication (login, JWT, email verification)
├── server-user/               # User management (profiles, admin roles)
├── server-agent/              # AI assistant (mihtnelis agent)
├── server-weather/            # Weather data proxy
├── server-payment/            # Payment processing (Alipay, WeChat)
├── server-version/            # Version management
├── server-service-status/     # API health monitoring
├── server-upload/             # File uploads (OSS, COS, R2)
├── server-mini-game/          # Mini-game leaderboards
└── server-app/                # Main entry point (aggregates all modules)
    └── src/main/resources/
        ├── application.yaml       # Main configuration
        └── application.dev.yaml   # Development profile (if exists)
```

:::details Module Dependency Graph
```
server-app
├── server-auth
│   ├── server-common
│   ├── server-user
│   │   ├── server-common
│   │   └── server-upload
│   │       └── server-common
│   └── server-version
│       └── server-common
├── server-user (shared)
├── server-agent
│   ├── server-common
│   ├── server-user
│   ├── server-weather
│   │   └── (standalone)
│   └── server-service-status
│       └── server-common
├── server-weather (shared)
├── server-payment
│   ├── server-common
│   └── server-user
├── server-version (shared)
├── server-service-status (shared)
├── server-upload (shared)
└── server-mini-game
    ├── server-common
    └── server-user
```
:::

## Verifying the Setup

After completing the setup, verify everything works:

```bash
# 1. Check Java version
java -version  # Should be 25.0.2 or later

# 2. Check Maven (or use ./mvnw)
mvn -version   # Should be 3.9.x or later

# 3. Verify MySQL is running
mysql -u root -p -e "SELECT 1"

# 4. Verify Redis is running
redis-cli ping  # Should print PONG

# 5. Verify RabbitMQ is running
# Visit http://localhost:15672 (guest/guest)

# 6. Create .env file in server/ directory
# Copy the template above and fill in your values

# 7. Build the project
cd server
./mvnw clean install

# 8. Start the server
./mvnw spring-boot:run -pl server-app
```

:::tip
If the server starts without errors and you can access [http://localhost:8080/api](http://localhost:8080/api), your backend development environment is ready.
:::

## Troubleshooting

### Port Already in Use

If you see `Port 8080 was already in use`:

```bash
# Find the process using port 8080
netstat -ano | findstr :8080

# Kill the process
taskkill /PID <process-id> /F

# Or change the port in application.yaml
server:
  port: 8081
```

### MySQL Connection Refused

If the server fails to connect to MySQL:

```bash
# Check if MySQL is running
mysql -u root -p -e "SELECT 1"

# Verify the database exists
mysql -u root -p -e "SHOW DATABASES LIKE 'eisland'"

# Create it if missing
mysql -u root -p -e "CREATE DATABASE eisland CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
```

### Redis Connection Refused

If the server fails to connect to Redis:

```bash
# Check if Redis is running
redis-cli ping

# If using Docker, restart the container
docker restart eisland-redis
```

### RabbitMQ Connection Refused

If the server fails to connect to RabbitMQ:

```bash
# Check if RabbitMQ is running
# Visit http://localhost:15672 in your browser

# If using Docker, restart the container
docker restart eisland-rabbitmq
```

### Maven Build Fails with JDK Version Error

If you see `invalid source release: 25`:

```bash
# Verify your Java version
java -version

# Ensure JAVA_HOME points to JDK 25
echo $JAVA_HOME

# If using SDKMAN, switch to JDK 25
sdk use java 25.0.2-open
```

### .env File Not Loaded

If the server starts but uses default values instead of your `.env`:

:::warning
The `.env` file must be in the `server/` directory (next to `pom.xml`), not in the project root or `server-app/` directory.
:::

```bash
# Verify the file exists
ls -la server/.env

# Ensure Spring DotEnv is on the classpath
./mvnw dependency:tree -pl server-app | grep spring-dotenv
```
