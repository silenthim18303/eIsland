---
title: Backend Tech Stack
icon: server
---

# Backend Tech Stack

This document provides an overview of the backend technologies used in the eIsland server application.

## Core Framework

### Java + Spring Boot

The eIsland backend is built with **Java 25** using **Spring Boot 4.0.5** as the application framework. The project follows a modular monolith architecture with clear domain boundaries.

**Key Spring Boot Starters Used:**

- **spring-boot-starter-webmvc**: RESTful API development
- **spring-boot-starter-security**: Authentication and authorization
- **spring-boot-starter-data-redis**: Caching and session management
- **spring-boot-starter-amqp**: Message queue integration
- **spring-boot-starter-validation**: Request validation
- **spring-boot-starter-websocket**: Real-time communication
- **spring-boot-starter-json**: JSON serialization

## Project Structure

The server is organized as a multi-module Maven project:

```
server/
├── server-common/          # Shared utilities and constants
├── server-auth/            # Authentication and authorization
├── server-user/            # User management
├── server-agent/           # AI agent services
├── server-weather/         # Weather data services
├── server-payment/         # Payment processing
├── server-version/         # Version management
├── server-service-status/  # Service health monitoring
├── server-upload/          # File upload services
├── server-mini-game/       # Mini-game leaderboards
└── server-app/             # Main application entry point
```

## Database

### MySQL

**MySQL** is used as the primary relational database for persistent data storage. The application connects to MySQL using the official JDBC driver with optimized connection settings.

#### Database Configuration

```yaml
spring:
  datasource:
    url: jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
```

**Key Features:**
- **UTF-8 Encoding**: Full Unicode support for international content
- **Asia/Shanghai Timezone**: Consistent timestamp handling
- **Connection Pooling**: Managed by Spring Boot's HikariCP (default)

#### Database Schema

The database consists of multiple tables organized by domain:

| Domain | Tables | Purpose |
|--------|--------|---------|
| **User** | `user_account`, `user_active_daily` | User profiles, authentication, activity tracking |
| **Mini Game** | `mini_game_score`, `mini_game_score_dlq_log` | Game scores, leaderboards, dead letter queue logs |
| **Payment** | `payment_order`, `payment_transaction`, `payment_notify_log`, `payment_pricing_config`, `payment_dlq_log` | Payment processing, order management |
| **Version** | `app_version` | Application version management |
| **Service Status** | `service_status` | Service health monitoring |
| **Upload** | `object_outbox`, `object_replication_task`, `object_replication_checkpoint`, `object_replication_backfill` | File upload, object replication |
| **Agent** | `agent_usage_stats`, `agent_model_pricing`, `agent_billing_dlq_log` | AI agent usage tracking, billing |
| **Wallpaper** | `wallpaper_market`, `wallpaper_tag` | Wallpaper marketplace |
| **Auth** | `issue_feedback`, `email_dispatch_dlq_log` | Issue feedback, email dispatch |
| **Identity** | `identity_verification` | Identity verification |

### MyBatis ORM

**MyBatis** is used as the Object-Relational Mapping (ORM) framework, providing flexible SQL mapping and database interaction.

#### MyBatis Configuration

```yaml
mybatis:
  mapper-locations: classpath*:mapper/*.xml
  type-aliases-package: com.pyisland.server.user.entity,com.pyisland.server.version.entity,com.pyisland.server.servicestatus.entity,com.pyisland.server.minigame.entity
  configuration:
    map-underscore-to-camel-case: true  # Automatic column-to-property mapping
```

**Key Configuration:**
- **Mapper Locations**: XML mapper files in `classpath*:mapper/*.xml`
- **Type Aliases**: Automatic package scanning for entity classes
- **Underscore to Camel Case**: Automatic conversion (e.g., `user_id` → `userId`)

#### Mapper Interface Pattern

MyBatis uses a **Mapper Interface** pattern for type-safe database access:

```java
@Mapper
public interface UserMapper {
    
    // Query by username
    User selectByUsername(@Param("username") String username);
    
    // Query by email
    User selectByEmail(@Param("email") String email);
    
    // Insert new user
    int insert(User user);
    
    // Update profile
    int updateProfile(@Param("username") String username,
                      @Param("password") String password,
                      @Param("avatar") String avatar);
    
    // Atomic balance deduction
    int deductBalance(@Param("username") String username,
                      @Param("amountFen") BigDecimal amountFen);
}
```

#### XML Mapper Files

SQL statements are defined in XML mapper files for complex queries:

```xml
<mapper namespace="com.pyisland.server.user.mapper.UserMapper">
    
    <!-- Result mapping for User entity -->
    <resultMap id="UserResultMap" type="User">
        <id property="id" column="id"/>
        <result property="username" column="username"/>
        <result property="email" column="email"/>
        <result property="password" column="password"/>
        <result property="role" column="role"/>
        <result property="proExpireAt" column="pro_expire_at"/>
        <result property="avatar" column="avatar"/>
        <result property="balanceFen" column="balance_fen"/>
        <result property="createdAt" column="created_at"/>
    </resultMap>
    
    <!-- Reusable column set -->
    <sql id="baseColumns">
        id, username, email, password, role, pro_expire_at, avatar, 
        gender, gender_custom, birthday, enabled, session_token, 
        totp_secret_ciphertext, totp_secret_updated_at, balance_fen, created_at
    </sql>
    
    <!-- Select query with parameterized WHERE clause -->
    <select id="selectByUsername" resultMap="UserResultMap">
        SELECT <include refid="baseColumns"/>
        FROM user_account
        WHERE username = #{username}
    </select>
    
    <!-- Insert with auto-generated key -->
    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO user_account
            (username, email, password, role, pro_expire_at, avatar, 
             gender, gender_custom, birthday, balance_fen, enabled, 
             session_token, created_at)
        VALUES
            (#{username}, #{email}, #{password}, #{role}, #{proExpireAt}, 
             #{avatar}, #{gender}, #{genderCustom}, #{birthday}, #{balanceFen}, 
             #{enabled}, #{sessionToken}, #{createdAt})
    </insert>
    
    <!-- Conditional UPDATE with atomic operations -->
    <update id="deductBalance">
        UPDATE user_account
        SET balance_fen = GREATEST(balance_fen - #{amountFen}, 0)
        WHERE username = #{username}
          AND balance_fen > 0
    </update>
    
    <!-- Conditional SELECT with dynamic WHERE -->
    <select id="selectByRole" resultMap="UserResultMap">
        SELECT <include refid="baseColumns"/>
        FROM user_account
        <where>
            <if test="role != null">role = #{role}</if>
        </where>
        ORDER BY created_at DESC
    </select>
    
    <!-- INSERT IGNORE for idempotent operations -->
    <insert id="insertDailyActive">
        INSERT IGNORE INTO user_active_daily (username, role, active_date, active_at)
        VALUES (#{username}, #{role}, #{activeDate}, #{activeAt})
    </insert>
    
    <!-- Atomic CAS (Compare-And-Swap) operation -->
    <update id="updateBestIfGreater">
        UPDATE mini_game_score
        SET high_score = #{highScore},
            best_duration_ms = #{bestDurationMs},
            best_moves = #{bestMoves},
            achieved_at = #{achievedAt},
            updated_at = #{updatedAt}
        WHERE user_id = #{userId}
          AND game_id = #{gameId}
          AND high_score &lt; #{highScore}
    </update>
</mapper>
```

#### Advanced MyBatis Features Used

**1. Result Maps**

Complex object mapping with nested properties:

```xml
<resultMap id="MiniGameScoreResultMap" type="com.pyisland.server.minigame.entity.MiniGameScore">
    <id property="id" column="id"/>
    <result property="userId" column="user_id"/>
    <result property="gameId" column="game_id"/>
    <result property="highScore" column="high_score"/>
    <result property="bestDurationMs" column="best_duration_ms"/>
    <result property="bestMoves" column="best_moves"/>
    <result property="playsCount" column="plays_count"/>
    <result property="lastPlayedAt" column="last_played_at"/>
    <result property="achievedAt" column="achieved_at"/>
    <result property="createdAt" column="created_at"/>
    <result property="updatedAt" column="updated_at"/>
</resultMap>
```

**2. Dynamic SQL**

Conditional clauses with `<where>`, `<if>`, and `<choose>`:

```xml
<select id="selectByRole" resultMap="UserResultMap">
    SELECT <include refid="baseColumns"/>
    FROM user_account
    <where>
        <if test="role != null">role = #{role}</if>
    </where>
    ORDER BY created_at DESC
</select>
```

**3. SQL Fragments**

Reusable SQL snippets with `<sql>` and `<include>`:

```xml
<sql id="baseColumns">
    id, username, email, password, role, pro_expire_at, avatar
</sql>

<select id="selectByUsername" resultMap="UserResultMap">
    SELECT <include refid="baseColumns"/>
    FROM user_account
    WHERE username = #{username}
</select>
```

**4. Auto-Generated Keys**

Automatic primary key retrieval after INSERT:

```xml
<insert id="insert" useGeneratedKeys="true" keyProperty="id">
    INSERT INTO user_account (username, email, password)
    VALUES (#{username}, #{email}, #{password})
</insert>
```

**5. Atomic Operations**

Database-level atomic updates for concurrency safety:

```xml
<!-- Atomic balance deduction with floor protection -->
<update id="deductBalance">
    UPDATE user_account
    SET balance_fen = GREATEST(balance_fen - #{amountFen}, 0)
    WHERE username = #{username}
      AND balance_fen > 0
</update>

<!-- CAS (Compare-And-Swap) for high score updates -->
<update id="updateBestIfGreater">
    UPDATE mini_game_score
    SET high_score = #{highScore}
    WHERE user_id = #{userId}
      AND game_id = #{gameId}
      AND high_score &lt; #{highScore}
</update>
```

**6. INSERT IGNORE**

Idempotent insert operations:

```xml
<insert id="insertDailyActive">
    INSERT IGNORE INTO user_active_daily (username, role, active_date, active_at)
    VALUES (#{username}, #{role}, #{activeDate}, #{activeAt})
</insert>

<insert id="insertIfAbsent" useGeneratedKeys="true" keyProperty="id">
    INSERT IGNORE INTO mini_game_score (user_id, game_id, high_score)
    VALUES (#{userId}, #{gameId}, #{highScore})
</insert>
```

#### Mapper Files by Domain

| Domain | Mapper Files | Key Operations |
|--------|--------------|----------------|
| **User** | `UserMapper.xml`, `WallpaperMarketMapper.xml`, `WallpaperTagMapper.xml`, `AnnouncementConfigMapper.xml`, `IdentityVerificationMapper.xml`, `ToolboxSoftwareMapper.xml`, `ToolboxTranslatePricingMapper.xml`, `AgentUsageStatsMapper.xml`, `AgentModelPricingMapper.xml`, `AgentBillingDlqLogMapper.xml` | CRUD, balance operations, daily active tracking |
| **Mini Game** | `MiniGameScoreMapper.xml`, `MiniGameScoreDlqLogMapper.xml` | Score submission, leaderboard queries, atomic updates |
| **Payment** | `PaymentOrderMapper.xml`, `PaymentTransactionMapper.xml`, `PaymentNotifyLogMapper.xml`, `PaymentPricingConfigMapper.xml`, `PaymentDlqLogMapper.xml` | Order management, transaction tracking |
| **Version** | `AppVersionMapper.xml` | Version management |
| **Service Status** | `ServiceStatusMapper.xml` | Health monitoring |
| **Upload** | `ObjectOutboxMapper.xml`, `ObjectReplicationTaskMapper.xml`, `ObjectReplicationCheckpointMapper.xml`, `ObjectReplicationBackfillMapper.xml` | File upload, replication |
| **Auth** | `IssueFeedbackMapper.xml`, `EmailDispatchDlqLogMapper.xml` | Feedback, email dispatch |

#### Entity Classes

MyBatis entity classes are plain Java objects (POJOs) with getters and setters:

```java
public class User {
    private Long id;
    private String username;
    private String email;
    private String password;
    private String role;
    private LocalDateTime proExpireAt;
    private String avatar;
    private String gender;
    private String genderCustom;
    private LocalDate birthday;
    private boolean enabled;
    private String sessionToken;
    private String totpSecretCiphertext;
    private LocalDateTime totpSecretUpdatedAt;
    private BigDecimal balanceFen;
    private LocalDateTime createdAt;
    
    // Getters and setters...
}

public class MiniGameScore {
    private Long id;
    private Long userId;
    private String gameId;
    private long highScore;
    private long bestDurationMs;
    private int bestMoves;
    private int playsCount;
    private LocalDateTime lastPlayedAt;
    private LocalDateTime achievedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Getters and setters...
}
```

#### Database Access Patterns

**1. Repository Pattern**

Each domain has dedicated mapper interfaces:

```java
@Mapper
public interface MiniGameScoreMapper {
    MiniGameScore selectByUserAndGame(@Param("userId") Long userId,
                                      @Param("gameId") String gameId);
    int insertIfAbsent(MiniGameScore score);
    int updateBestIfGreater(@Param("userId") Long userId,
                            @Param("gameId") String gameId,
                            @Param("highScore") long highScore, ...);
    int incrementPlaysCount(@Param("userId") Long userId,
                            @Param("gameId") String gameId, ...);
    List<MiniGameScore> selectTopByGame(@Param("gameId") String gameId,
                                        @Param("limit") int limit);
}
```

**2. Service Layer Integration**

Services use mappers with transaction management:

```java
@Service
public class MiniGameScoreService {
    private final MiniGameScoreMapper scoreMapper;
    
    public String submit(Long userId, String gameId, ScoreSubmitRequest req) {
        // 1. Validate request
        // 2. Check rate limits (Redis)
        // 3. Check idempotency (Redis)
        // 4. Insert if absent (MySQL)
        scoreMapper.insertIfAbsent(score);
        // 5. Update if greater (atomic CAS)
        scoreMapper.updateBestIfGreater(userId, gameId, highScore, ...);
        // 6. Increment plays count
        scoreMapper.incrementPlaysCount(userId, gameId, ...);
        return null;
    }
}
```

**3. Transaction Management**

Spring's `@Transactional` annotation for atomic operations:

```java
@Transactional
public void transferBalance(String fromUser, String toUser, BigDecimal amount) {
    userMapper.deductBalance(fromUser, amount);
    userMapper.addBalance(toUser, amount);
}
```

#### MyBatis Best Practices Implemented

1. **Parameterized Queries**: All queries use `#{param}` syntax to prevent SQL injection
2. **Result Maps**: Explicit column-to-property mapping for complex entities
3. **SQL Fragments**: Reusable column sets with `<sql>` and `<include>`
4. **Dynamic SQL**: Conditional clauses for flexible queries
5. **Atomic Operations**: Database-level CAS for concurrency safety
6. **Idempotent Inserts**: `INSERT IGNORE` for duplicate prevention
7. **Auto-Generated Keys**: Automatic primary key retrieval
8. **Underscore to Camel Case**: Automatic property name conversion

#### Performance Optimizations

1. **Batch Operations**: Bulk inserts for high-throughput scenarios
2. **Indexed Queries**: Proper indexing on frequently queried columns
3. **Connection Pooling**: HikariCP for efficient connection management
4. **Query Caching**: Redis caching layer for frequently accessed data
5. **Lazy Loading**: Optional deferred loading for large objects

### Redis

**Redis** is a critical infrastructure component serving multiple purposes across the application:

#### Caching Layer

Redis acts as the primary caching layer to reduce database load and improve response times:

- **Weather Data**: Caches API responses from QWeather with configurable TTL (default 10 minutes for forecasts, 3 minutes for alerts)
- **User Profiles**: Stores frequently accessed user data
- **Service Status**: Caches health check results
- **Version Information**: Caches app version data with bloom filter support

```java
// Example: Weather data caching
String cacheKey = cacheKeyPrefix + ":forecast:" + location;
String cached = qweatherRedisTemplate.opsForValue().get(cacheKey);
if (cached != null) {
    return objectMapper.readValue(cached, MAP_TYPE);
}
// Fetch from API and cache
qweatherRedisTemplate.opsForValue().set(cacheKey, responseJson, 
    Duration.ofSeconds(dailyCacheTtlSeconds));
```

#### Rate Limiting & Security

Redis implements sophisticated rate limiting mechanisms:

- **Authentication Rate Limiting**: Sliding window algorithm for login/register attempts
  - Login: 5 failures per 5-minute window, 10-minute lockout
  - Registration: 5 attempts per hour per IP
- **Upload Rate Limiting**: File upload throttling
- **API Rate Limiting**: General API request throttling

```java
// Example: Sliding window rate limiting
authSecurityRedisTemplate.opsForZSet().add(failuresKey, member, now);
authSecurityRedisTemplate.opsForZSet().removeRangeByScore(failuresKey, 0, now - LOGIN_WINDOW_MS);
Long failureCount = authSecurityRedisTemplate.opsForZSet().zCard(failuresKey);
```

#### Leaderboards & Game State

Redis powers the mini-game leaderboard system:

- **Sorted Sets (ZSET)**: Maintains real-time leaderboards with scores
- **Game Sessions**: Stores game session data for anti-cheat verification
- **User Metadata**: Hash structures for detailed score information

```java
// Example: Leaderboard operations
miniGameRedisTemplate.opsForZSet().add(lbKey, userId, highScore);
Set<ZSetOperations.TypedTuple<String>> topPlayers = 
    miniGameRedisTemplate.opsForZSet().reverseRangeWithScores(lbKey, 0, limit);
```

#### Bloom Filters

Redis implements **Bloom Filters** - a space-efficient probabilistic data structure used to test whether an element is a member of a set. This is particularly useful for preventing **cache penetration** (queries for non-existent data that bypass cache and hit the database directly).

##### How Bloom Filters Work in eIsland

The implementation uses a **two-layer verification approach**:

1. **Bloom Filter Layer**: Fast rejection using Redis bitmaps
2. **Exact Set Layer**: Precise verification using Redis Sets

##### Implementation Details

**Hash Functions**: Uses double hashing with CRC32 and Java's hashCode for uniform distribution:

```java
private long[] bloomOffsets(String normalized) {
    long hash1 = hashCrc32(normalized);  // CRC32 hash
    long hash2 = hashJava(normalized);   // Java hashCode
    long[] offsets = new long[hashCount];
    for (int i = 0; i < hashCount; i++) {
        long combined = hash1 + i * hash2 + (long) i * i;
        long positive = combined & Long.MAX_VALUE;
        offsets[i] = positive % bitSize;
    }
    return offsets;
}
```

**Configuration Parameters**:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `bit-size` | 1,000,003 - 2,000,003 | Size of the bitmap (prime numbers for better distribution) |
| `hash-count` | 6 | Number of hash functions (optimal for ~1% false positive rate) |

##### Bloom Filter Instances

**1. User Ban Bloom Filter** (`UserBanBloomService`)

Quickly checks if a username is banned before processing requests:

```java
@Service
public class UserBanBloomService {
    // Configuration
    @Value("${user.ban.bloom.key:user:ban:bloom}") String bloomKey;
    @Value("${user.ban.set.key:user:ban:set}") String exactSetKey;
    @Value("${user.ban.bloom.bit-size:1000003}") long bitSize;
    @Value("${user.ban.bloom.hash-count:6}") int hashCount;
    
    public boolean isBanned(String username) {
        String normalized = normalizeUsername(username);
        // Step 1: Bloom filter check (fast rejection)
        if (!mightContain(normalized)) {
            return false;  // Definitely not banned
        }
        // Step 2: Exact set verification
        Boolean exact = userBanRedisTemplate.opsForSet().isMember(exactSetKey, normalized);
        return Boolean.TRUE.equals(exact);
    }
}
```

**Use Case**: Every authentication request checks if the user is banned. Without Bloom Filter, this would require a database query for every request.

**2. Wallpaper Detail Bloom Filter** (`WallpaperDetailBloomService`)

Prevents cache penetration for wallpaper detail queries:

```java
@Service
public class WallpaperDetailBloomService {
    // Larger bitmap for wallpaper IDs
    @Value("${wallpaper.detail.bloom.bit-size:2000003}") long bitSize;
    
    public boolean mightContain(Long id) {
        String normalized = normalizeId(id);
        // Fast rejection with Bloom Filter
        if (!mightContainBloom(normalized)) {
            return false;  // ID definitely doesn't exist
        }
        // Verify with exact set
        Boolean exact = wallpaperDetailBloomRedisTemplate.opsForSet().isMember(exactSetKey, normalized);
        return Boolean.TRUE.equals(exact);
    }
}
```

**Use Case**: When users request wallpaper details with random IDs, the Bloom Filter quickly rejects non-existent IDs without hitting the database.

**3. Version App Bloom Filter** (`VersionAppBloomService`)

Validates app version existence:

```java
@Service
public class VersionAppBloomService {
    public boolean mightContain(String appName) {
        String normalized = normalizeAppName(appName);
        // Bloom filter + exact set verification
        if (!mightContainBloom(normalized)) {
            return false;
        }
        Boolean exact = versionBloomRedisTemplate.opsForSet().isMember(exactSetKey, normalized);
        return Boolean.TRUE.equals(exact);
    }
}
```

**Use Case**: Validates if an app version exists before processing update requests.

##### Key Features

**1. Fail-Open Design**

When Redis is unavailable, the system fails open (allows requests through) rather than failing closed:

```java
public boolean mightContain(String appName) {
    try {
        // ... bloom filter logic
    } catch (Exception ignored) {
        return true;  // Fail-open: assume exists if Redis is down
    }
}
```

**2. Cold Start Support**

Supports rebuilding from database snapshots:

```java
public void rebuildFromIds(Collection<Long> ids) {
    // Clear existing data
    wallpaperDetailBloomRedisTemplate.delete(exactSetKey);
    wallpaperDetailBloomRedisTemplate.delete(bloomKey);
    // Rebuild from database
    for (Long id : ids) {
        add(id);
    }
}
```

**3. Add-Only Bloom Filter**

The bitmap is add-only (no deletion) to maintain probabilistic guarantees:

```java
public void remove(Long id) {
    // Only remove from exact set, NOT from bloom filter
    // This allows the bloom filter to have false positives
    // but never false negatives
    wallpaperDetailBloomRedisTemplate.opsForSet().remove(exactSetKey, normalized);
}
```

##### Performance Benefits

| Operation | Without Bloom Filter | With Bloom Filter |
|-----------|---------------------|-------------------|
| Query non-existent ID | 1 DB query | 0 DB queries (fast rejection) |
| Query existing ID | 1 DB query | 1 Redis check + 1 DB query |
| Memory usage | N/A | ~1.2MB per 1M items (with 1% FP rate) |

##### Mathematical Properties

- **False Positive Rate**: ~1% with 6 hash functions and optimal bit size
- **False Negative Rate**: 0% (never misses existing items)
- **Space Efficiency**: ~10 bits per item for 1% FP rate
- **Time Complexity**: O(k) where k = number of hash functions

##### Best Practices Implemented

1. **Prime Number Bit Sizes**: Uses prime numbers (1,000,003 and 2,000,003) for better hash distribution
2. **Double Hashing**: Combines CRC32 and Java hashCode for independence
3. **Normalized Keys**: Case-insensitive, trimmed keys for consistency
4. **Atomic Operations**: Uses Redis bit operations for thread safety
5. **Graceful Degradation**: Falls back to database if Redis fails

#### Session & Token Management

- **JWT Token Storage**: Active token tracking
- **Email Verification Codes**: Temporary verification code storage
- **Slider CAPTCHA**: Challenge-response state management
- **TOTP Security**: Time-based one-time password state

#### AI Agent Features

Redis supports AI agent functionality:

- **Agent Balance**: Tracks user AI usage credits
- **Usage Statistics**: Monitors API consumption
- **Pricing Cache**: Caches model pricing information

#### Payment Processing

- **Order State**: Tracks payment order lifecycle
- **Idempotency Keys**: Prevents duplicate payment processing

#### Redis Data Structures Used

| Structure | Use Case |
|-----------|----------|
| **String** | Simple key-value caching, counters |
| **Hash** | User metadata, configuration objects |
| **Sorted Set** | Leaderboards, rate limiting windows |
| **Set** | Unique item tracking |
| **Bitmap** | Feature flags, user status |
| **HyperLogLog** | Approximate counting |

#### Redis Configuration

The application uses multiple Redis instances with dedicated configurations:

```java
// Example: Dedicated Redis configurations per domain
@Configuration
public class MiniGameRedisConfig {
    @Bean("miniGameRedisTemplate")
    public StringRedisTemplate miniGameRedisTemplate(
            @Value("${mini-game.redis.host}") String host,
            @Value("${mini-game.redis.port}") int port) {
        // Configure dedicated Redis connection
    }
}
```

#### Caching Strategy

Multi-level caching with Redis:

1. **Cache-Aside**: Check Redis first, fallback to database
2. **Write-Through**: Update cache on database writes
3. **Cache Warming**: Pre-populate cache on cold starts
4. **TTL Management**: Configurable expiration per data type

#### Performance Optimization

Redis optimizations include:

- **Connection Pooling**: Efficient connection reuse
- **Pipeline Operations**: Batch command execution
- **Lua Scripts**: Atomic operations for rate limiting
- **Lazy Expiration**: Background key cleanup

## Authentication & Security

### JWT (JSON Web Tokens)

The application uses **JJWT** (Java JWT) for stateless token-based authentication. JWT tokens are the primary authentication mechanism, eliminating the need for server-side session storage.

#### JWT Configuration

```yaml
jwt:
  secret: ${JWT_SECRET}  # HMAC-SHA256 key (minimum 256 bits)
  expiration: ${JWT_EXPIRATION}  # Token validity in milliseconds (default: 7 days)
```

#### JWT Utility Class

The `JwtUtil` class handles token generation, validation, and parsing:

```java
@Component
public class JwtUtil {
    private final SecretKey key;
    private final long expiration;
    
    public JwtUtil(@Value("${jwt.secret}") String secret,
                   @Value("${jwt.expiration}") long expiration) {
        // Generate HMAC-SHA256 key from secret string
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiration = expiration;
    }
    
    // Generate token with username and role
    public String generateToken(String username, String role) {
        return Jwts.builder()
                .subject(username)                    // Subject: username
                .claim("role", role)                  // Custom claim: user role
                .issuedAt(new Date())                 // Issued at timestamp
                .expiration(new Date(System.currentTimeMillis() + expiration))  // Expiration
                .signWith(key)                        // HMAC-SHA256 signature
                .compact();
    }
    
    // Validate token signature and expiration
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception e) {
            return false;  // Invalid signature, expired, or malformed
        }
    }
    
    // Extract username from token
    public String getUsernameFromToken(String token) {
        return parseClaims(token).getSubject();
    }
    
    // Extract role from token (defaults to "user")
    public String getRoleFromToken(String token) {
        Claims claims = parseClaims(token);
        Object role = claims.get("role");
        if (role instanceof String roleStr && !roleStr.isBlank()) {
            return roleStr;
        }
        return "user";
    }
    
    // Parse and verify token claims
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
```

**Key Features:**
- **HMAC-SHA256 Signing**: Cryptographic signature verification
- **Automatic Expiration**: Tokens expire after configurable period
- **Role-Based Claims**: User role embedded in token
- **Stateless Validation**: No database lookup required for basic validation

#### JWT Authentication Filter

The `JwtAuthenticationFilter` intercepts every request to validate JWT tokens:

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    // Business error codes for specific scenarios
    public static final int CODE_SESSION_KICKED = 4011;  // Session invalidated
    public static final int CODE_USER_BANNED = 4031;     // User banned
    
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        // 1. Extract token from Authorization header
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        String token = authHeader.substring(7).trim();
        
        // 2. Validate token signature and expiration
        if (token.isEmpty() || !jwtUtil.validateToken(token)) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // 3. Extract user information from token
        String username = jwtUtil.getUsernameFromToken(token);
        String role = jwtUtil.getRoleFromToken(token);
        
        // 4. Verify user exists and is active
        User user = userService.getByUsername(username);
        if (user == null) {
            writeError(response, SC_UNAUTHORIZED, 401, "Account deleted");
            return;
        }
        
        // 5. Check if user is banned (using Bloom Filter for fast lookup)
        if (userBanBloomService.isBanned(user.getUsername())) {
            writeError(response, SC_FORBIDDEN, CODE_USER_BANNED, "Account banned");
            return;
        }
        
        // 6. Check if account is enabled
        if (Boolean.FALSE.equals(user.getEnabled())) {
            writeError(response, SC_UNAUTHORIZED, 401, "Account disabled");
            return;
        }
        
        // 7. Verify session token (single device login enforcement)
        if (user.getSessionToken() != null && !token.equals(user.getSessionToken())) {
            writeError(response, SC_UNAUTHORIZED, CODE_SESSION_KICKED, "Logged in elsewhere");
            return;
        }
        
        // 8. Set security context for downstream controllers
        String effectiveRole = user.getRole() != null ? user.getRole() : role;
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority(
                "ROLE_" + effectiveRole.toUpperCase(Locale.ROOT));
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                user.getUsername(), null, List.of(authority));
        SecurityContextHolder.getContext().setAuthentication(auth);
        
        // 9. Expose user info via request attributes
        request.setAttribute("username", user.getUsername());
        request.setAttribute("role", effectiveRole);
        request.setAttribute("userId", user.getId());
        
        filterChain.doFilter(request, response);
    }
}
```

**Authentication Flow:**

```
Request
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Extract Bearer Token from Authorization Header          │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Validate JWT Signature & Expiration                     │
│     - HMAC-SHA256 verification                              │
│     - Check expiration timestamp                            │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Extract Username & Role from Claims                     │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Database Verification                                   │
│     - User exists?                                          │
│     - Account enabled?                                      │
│     - Not banned? (Bloom Filter → Exact Set)                │
│     - Session token matches? (Single device enforcement)    │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Set Security Context                                    │
│     - Username                                              │
│     - Role (ROLE_USER, ROLE_PRO, ROLE_ADMIN)                │
│     - Request attributes                                    │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
  Continue to Controller
```

### Spring Security Configuration

Comprehensive security configuration with stateless JWT authentication:

```java
@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);  // BCrypt with strength 12
    }
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF (stateless JWT doesn't need it)
            .csrf(AbstractHttpConfigurer::disable)
            
            // Enable CORS with configurable origins
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Stateless session management (no HTTP Session)
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // URL-based authorization rules
            .authorizeHttpRequests(reg -> reg
                // Public endpoints
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/v1/version/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/v1/service-status/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/v1/announcement/current").permitAll()
                .requestMatchers(HttpMethod.POST, "/v1/payment/wechat/notify").permitAll()
                .requestMatchers(HttpMethod.POST, "/v1/payment/alipay/notify").permitAll()
                
                // Authenticated user endpoints
                .requestMatchers("/v1/user/**").hasAnyRole("USER", "PRO", "ADMIN")
                .requestMatchers("/v1/mini-game/**").hasAnyRole("USER", "PRO", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/v1/upload/**").hasAnyRole("USER", "PRO", "ADMIN")
                
                // Admin-only endpoints
                .anyRequest().hasRole("ADMIN")
            )
            
            // Custom error handlers
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(new JsonAuthenticationEntryPoint())
                .accessDeniedHandler(new JsonAccessDeniedHandler())
            )
            
            // Security filter chain
            .addFilterBefore(clientVersionGateFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterAfter(replayProtectionFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

**Security Features:**

| Feature | Implementation | Purpose |
|---------|----------------|---------|
| **CSRF Protection** | Disabled | Stateless JWT doesn't require CSRF tokens |
| **Session Management** | STATELESS | No HTTP Session stored on server |
| **CORS** | Configurable origins | Cross-origin request control |
| **Password Hashing** | BCrypt (strength 12) | Secure password storage |
| **Role-Based Access** | ROLE_USER, ROLE_PRO, ROLE_ADMIN | Endpoint authorization |

### Password Security

#### BCrypt Password Hashing

All passwords are hashed using **BCrypt** with configurable strength:

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);  // Strength 12 = 2^12 iterations
}
```

**BCrypt Properties:**
- **Salt**: Automatically generated per password
- **Iterations**: 2^12 = 4096 rounds (configurable)
- **Output**: 60-character hash string
- **One-Way**: Cannot be reversed to plaintext

### Replay Protection

The `ReplayProtectionFilter` prevents replay attacks on sensitive endpoints:

```java
@Component
public class ReplayProtectionFilter extends OncePerRequestFilter {
    
    private static final long ALLOWED_SKEW_MILLIS = 5 * 60 * 1000L;  // 5-minute window
    
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        // Only protect write operations (POST, PUT, DELETE)
        if (!isProtectedRequest(request)) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // Extract timestamp and nonce from headers
        String timestampHeader = request.getHeader("X-Timestamp");
        String nonce = request.getHeader("X-Nonce");
        
        // Validate timestamp is within allowed window
        long timestamp = Long.parseLong(timestampHeader.trim());
        long now = Instant.now().toEpochMilli();
        if (Math.abs(now - timestamp) > ALLOWED_SKEW_MILLIS) {
            writeError(response, 4002, "Request timestamp expired");
            return;
        }
        
        // Check nonce uniqueness in Redis (prevents replay)
        String key = "auth:replay:" + principal + ":" + method + ":" + uri + ":" + nonce;
        Boolean accepted = authSecurityRedisTemplate.opsForValue().setIfAbsent(
                key, String.valueOf(now), Duration.ofMillis(ALLOWED_SKEW_MILLIS));
        
        if (!Boolean.TRUE.equals(accepted)) {
            writeError(response, 4003, "Replay attack detected");
            return;
        }
        
        filterChain.doFilter(request, response);
    }
}
```

**Replay Protection Flow:**

```
Client Request
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  Include Headers:                                           │
│    - X-Timestamp: 1719000000000 (Unix milliseconds)        │
│    - X-Nonce: random-unique-string-128-chars                │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  Server Validation:                                         │
│    1. Check timestamp within 5-minute window                │
│    2. Check nonce not used before (Redis SETNX)             │
│    3. Store nonce with TTL                                  │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
  Request Accepted or Rejected (4003 Replay Detected)
```

### Rate Limiting

Multiple rate limiting mechanisms protect against abuse:

#### Authentication Rate Limiting

```java
@Component
public class AuthRateLimiter {
    // Login: 5 failures per 5-minute window, 10-minute lockout
    public static final int LOGIN_MAX_FAILURES = 5;
    public static final long LOGIN_WINDOW_MS = 5 * 60 * 1000L;
    public static final long LOGIN_LOCK_MS = 10 * 60 * 1000L;
    
    // Registration: 5 attempts per hour per IP
    public static final int REGISTER_MAX_ATTEMPTS = 5;
    public static final long REGISTER_WINDOW_MS = 60 * 60 * 1000L;
    
    public void recordLoginFailure(String key) {
        // Sliding window using Redis Sorted Set
        authSecurityRedisTemplate.opsForZSet().add(failuresKey, member, now);
        authSecurityRedisTemplate.opsForZSet().removeRangeByScore(failuresKey, 0, now - LOGIN_WINDOW_MS);
        
        Long failureCount = authSecurityRedisTemplate.opsForZSet().zCard(failuresKey);
        if (failureCount >= LOGIN_MAX_FAILURES) {
            // Lock account for 10 minutes
            authSecurityRedisTemplate.opsForValue().set(loginLockKey, 
                String.valueOf(now + LOGIN_LOCK_MS), Duration.ofMillis(LOGIN_LOCK_MS));
        }
    }
}
```

#### Slider CAPTCHA Rate Limiting

```java
@Service
public class SliderCaptchaService {
    // Token bucket algorithm using Lua script
    private static final RedisScript<List<Long>> TOKEN_BUCKET_SCRIPT = buildTokenBucketScript();
    
    // Rate limits per operation
    private final int createRateLimitAccount;  // 12 per minute per account
    private final int createRateLimitIp;       // 24 per minute per IP
    private final int verifyRateLimitIp;       // 60 per minute per IP
    private final int verifyFailLimitAccount;  // 3 failures per 10 minutes
    private final int verifyFailLimitIp;       // 3 failures per 10 minutes
    
    public CaptchaChallenge createChallenge(String account, String userIp) {
        // Check rate limits before creating challenge
        assertRateLimit(keyCreateRateAccount(normalizedAccount), createRateLimitAccount, ...);
        assertRateLimit(keyCreateRateIp(normalizedIp), createRateLimitIp, ...);
        
        // Limit pending challenges
        Long pendingCount = sliderCaptchaRedisTemplate.opsForSet().size(keyAccountChallenges(normalizedAccount));
        if (pendingCount >= MAX_PENDING_CHALLENGES_PER_ACCOUNT) {
            throw new TooManyPendingChallengesException("Too many pending challenges");
        }
        
        // Create challenge with random target value
        int target = ThreadLocalRandom.current().nextInt(minValue, maxValue + 1);
        String challengeId = UUID.randomUUID().toString();
        
        // Store challenge in Redis with TTL
        sliderCaptchaRedisTemplate.opsForValue().set(
                keyChallenge(challengeId), String.valueOf(target), ttl);
        
        return new CaptchaChallenge(challengeId, minValue, maxValue, target, tolerance, captchaSign);
    }
}
```

**Token Bucket Algorithm (Lua Script):**

```lua
-- Atomic token bucket implementation in Redis
local key = KEYS[1]
local now_ms = tonumber(ARGV[1])
local capacity = tonumber(ARGV[2])
local refill_per_ms = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])

-- Load current state
local state = redis.call('HMGET', key, 'tokens', 'ts')
local tokens = tonumber(state[1]) or capacity
local ts = tonumber(state[2]) or now_ms

-- Calculate token refill
local elapsed = now_ms - ts
tokens = math.min(capacity, tokens + elapsed * refill_per_ms)

-- Check if request can be fulfilled
local allowed = 0
local retry_after_ms = 0
if tokens >= requested then
    tokens = tokens - requested
    allowed = 1
else
    local deficit = requested - tokens
    retry_after_ms = math.ceil(deficit / refill_per_ms)
end

-- Update state
redis.call('HSET', key, 'tokens', tokens, 'ts', now_ms)
redis.call('EXPIRE', key, ttl_seconds)

return { allowed, math.floor(tokens), retry_after_ms }
```

### TOTP (Time-Based One-Time Password)

Two-Factor Authentication (2FA) using TOTP:

```java
@Service
public class TotpSecurityService {
    public static final int TOTP_DIGITS = 6;
    public static final long TOTP_PERIOD_SECONDS = 30L;
    
    // Security features
    private final int failMaxAttempts;           // 5 attempts before lockout
    private final long failWindowSeconds;        // 10-minute window
    private final int userRateMax;               // 30 per minute per user
    private final int ipRateMax;                 // 60 per minute per IP
    private final long replayProtectSeconds;     // 120-second replay protection
    
    public String verifyTotpOrMessage(String username, String clientIp, String code) {
        // 1. Rate limiting check
        // 2. Decrypt stored TOTP secret (AES-256-GCM)
        // 3. Generate TOTP codes for current and adjacent windows
        // 4. Verify code matches
        // 5. Check replay protection (code not used recently)
        // 6. Record success or failure
        return null;  // null = success
    }
}
```

**TOTP Security Features:**

| Feature | Implementation | Purpose |
|---------|----------------|---------|
| **Encryption** | AES-256-GCM | Secure secret storage |
| **Rate Limiting** | Per-user and per-IP | Prevent brute force |
| **Replay Protection** | Redis-based code tracking | Prevent code reuse |
| **Failure Tracking** | Sliding window counter | Account lockout |
| **Time Window** | ±30 seconds | Clock drift tolerance |

### User Ban System

Multi-layer ban checking with Bloom Filter optimization:

```java
@Service
public class UserBanBloomService {
    // Two-layer verification: Bloom Filter → Exact Set
    public boolean isBanned(String username) {
        String normalized = normalizeUsername(username);
        
        // Layer 1: Bloom Filter (fast rejection)
        if (!mightContain(normalized)) {
            return false;  // Definitely not banned
        }
        
        // Layer 2: Exact Set verification
        Boolean exact = userBanRedisTemplate.opsForSet().isMember(exactSetKey, normalized);
        return Boolean.TRUE.equals(exact);
    }
}
```

**Ban Check Flow:**

```
Authentication Request
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Bloom Filter Check (O(k) time, k=6 hash functions)     │
│     - If "not contained" → User definitely not banned       │
│     - If "might contain" → Proceed to exact check           │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Redis Set Check (O(1) time)                             │
│     - Exact membership verification                         │
│     - No false positives                                     │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Decision                                                │
│     - Not banned → Continue authentication                  │
│     - Banned → Return 403 with CODE_USER_BANNED (4031)      │
└─────────────────────────────────────────────────────────────┘
```

### Security Headers & CORS

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    
    // Configurable allowed origins
    config.setAllowedOriginPatterns(List.of("*"));
    
    // Allowed HTTP methods
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    
    // Allowed headers
    config.setAllowedHeaders(List.of("*"));
    
    // Allow credentials (cookies, authorization headers)
    config.setAllowCredentials(true);
    
    // Cache preflight response for 1 hour
    config.setMaxAge(3600L);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
}
```

### Error Handling

Standardized JSON error responses:

```java
// Authentication entry point (401 Unauthorized)
public class JsonAuthenticationEntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("code", 401);
        body.put("message", "Authentication required");
        
        objectMapper.writeValue(response.getWriter(), body);
    }
}

// Access denied handler (403 Forbidden)
public class JsonAccessDeniedHandler implements AccessDeniedHandler {
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("code", 403);
        body.put("message", "Access denied");
        
        objectMapper.writeValue(response.getWriter(), body);
    }
}
```

### Security Best Practices Summary

| Category | Implementation | Details |
|----------|----------------|---------|
| **Authentication** | JWT (HMAC-SHA256) | Stateless, 7-day expiration |
| **Password Storage** | BCrypt (strength 12) | Salted, 4096 iterations |
| **Session Management** | Single device enforcement | Session token in DB |
| **Rate Limiting** | Redis sliding window | Per-user and per-IP limits |
| **Replay Protection** | Timestamp + Nonce | 5-minute window, Redis SETNX |
| **Brute Force Protection** | Account lockout | 5 failures → 10-minute lock |
| **CAPTCHA** | Slider verification | Token bucket rate limiting |
| **2FA** | TOTP (AES-256-GCM) | 6-digit codes, 30-second window |
| **User Ban** | Bloom Filter + Exact Set | Fast rejection, no false negatives |
| **CORS** | Configurable origins | Credential support |
| **CSRF** | Disabled | Not needed for stateless JWT |
| **Input Validation** | Bean Validation | @Valid, @NotNull, @Size |
| **SQL Injection** | MyBatis parameterized queries | #{param} syntax |
| **XSS Protection** | Output encoding | Jackson JSON serialization |

## Message Queue

### RabbitMQ

**RabbitMQ** is used for asynchronous processing and event-driven architecture:

- **Email Notifications**: Asynchronous email delivery
- **Payment Processing**: Order status updates
- **Data Sync**: Background data synchronization
- **Retry Mechanisms**: Failed operation retry with dead letter queues

## Cloud Storage

### Multi-Cloud Support

The application supports multiple cloud storage providers:

| Provider | SDK | Use Case |
|----------|-----|----------|
| **Aliyun OSS** | aliyun-sdk-oss | Avatars, wallpapers, feedback assets |
| **Tencent COS** | cos_api | Backup storage |
| **Cloudflare R2** | AWS S3 SDK | Primary file storage |

```xml
<!-- Cloud Storage Dependencies -->
<dependency>
    <groupId>com.aliyun.oss</groupId>
    <artifactId>aliyun-sdk-oss</artifactId>
</dependency>
<dependency>
    <groupId>com.qcloud</groupId>
    <artifactId>cos_api</artifactId>
</dependency>
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>s3</artifactId>
</dependency>
```

## AI Integration

### Spring AI + LangChain4j

The agent module integrates AI capabilities using:

- **Spring AI**: OpenAI-compatible API integration
- **LangChain4j**: LLM orchestration and tool chaining
- **Tencent Cloud Speech SDK**: Voice recognition services

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-openai</artifactId>
</dependency>
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j</artifactId>
    <version>0.35.0</version>
</dependency>
```

## Payment Processing

### Alipay SDK

Integrated payment processing for Chinese market:

```xml
<dependency>
    <groupId>com.alipay.sdk</groupId>
    <artifactId>alipay-sdk-java</artifactId>
    <version>4.38.0.ALL</version>
</dependency>
```

**Features:**
- Order creation and management
- Payment callback handling
- Refund processing

## Email Services

### Resend

Modern email delivery service integration:

```xml
<dependency>
    <groupId>com.resend</groupId>
    <artifactId>resend-java</artifactId>
</dependency>
```

**Use Cases:**
- Account verification emails
- Password reset notifications
- Marketing communications

## Configuration Management

### Environment Variables

Sensitive configuration is managed through environment variables:

```properties
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=eisland

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRATION=604800000

# Cloud Storage
OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com
OSS_ACCESS_KEY_ID=your-access-key
OSS_ACCESS_KEY_SECRET=your-secret-key
```

### Spring Dotenv

Environment variable loading from `.env` files:

```xml
<dependency>
    <groupId>me.paulschwarz</groupId>
    <artifactId>spring-dotenv</artifactId>
</dependency>
```

## Testing

### Spring Boot Test

Comprehensive testing setup:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-test</artifactId>
    <scope>test</scope>
</dependency>
```

**Testing Capabilities:**
- Unit testing with JUnit
- Integration testing with SpringBootTest
- Security testing with MockMvc
- Database testing with Testcontainers

## Deployment

### WAR Packaging

The application is packaged as a **WAR** file for deployment:

- Compatible with external Tomcat containers
- Embedded Tomcat support for development
- Cloud-native deployment options

### Build Tools

- **Maven**: Dependency management and build automation
- **Maven Wrapper**: Consistent build environment across teams

## Performance Optimization

### Caching Strategy

Multi-level caching implementation:

1. **L1 Cache**: In-memory caching for frequent access
2. **L2 Cache**: Redis for shared cache across instances
3. **Database Query Cache**: MyBatis query result caching

### Async Processing

Non-blocking operations using:

- **RabbitMQ**: Message queue for background tasks
- **Spring @Async**: Asynchronous method execution
- **CompletableFuture**: Non-blocking I/O operations

## Monitoring & Observability

### Health Checks

Built-in service health monitoring:

- Database connectivity
- Redis availability
- External service dependencies
- Application metrics

### Logging

Structured logging with:

- **SLF4J**: Logging facade
- **Logback**: Logging implementation
- **JSON Format**: Machine-readable log output

## Security Best Practices

### Data Protection

- **Password Hashing**: BCrypt for secure password storage
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Parameterized queries with MyBatis
- **XSS Protection**: Output encoding and sanitization

### API Security

- **Rate Limiting**: Request throttling per user/IP
- **CORS Configuration**: Controlled cross-origin access
- **HTTPS Enforcement**: Secure communication channels
- **Token Rotation**: Regular JWT token refresh

## Scalability Considerations

### Horizontal Scaling

The architecture supports:

- **Stateless Design**: No server-side session storage
- **Database Connection Pooling**: Efficient resource utilization
- **Cache Distribution**: Redis cluster support
- **Load Balancing**: Multiple instance deployment

### Microservice Ready

While currently a modular monolith, the design allows for:

- **Domain Isolation**: Clear module boundaries
- **API Gateway Ready**: RESTful API design
- **Service Discovery**: Potential integration with service mesh
- **Event Sourcing**: RabbitMQ-based event propagation

---

For detailed API documentation, refer to the OpenAPI specifications and source code comments.
