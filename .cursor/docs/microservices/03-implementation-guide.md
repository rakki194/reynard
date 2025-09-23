# Microservices Implementation Guide

> **Practical Steps to Building Distributed Systems** 🦊

## Overview

This guide provides a comprehensive, step-by-step approach to implementing microservices architecture. It covers everything from initial planning to production deployment, with practical examples and best practices.

## Phase 1: Planning and Design

### 1.1 Service Identification

#### Domain-Driven Design (DDD) Approach

**Step 1: Identify Bounded Contexts**

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   User Domain   │  │  Order Domain   │  │ Payment Domain  │
│                 │  │                 │  │                 │
│ - Registration  │  │ - Order Creation│  │ - Payment       │
│ - Authentication│  │ - Order Status  │  │ - Refunds       │
│ - Profile Mgmt  │  │ - Order History │  │ - Billing       │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

**Step 2: Define Service Boundaries**

- Each bounded context becomes a potential microservice
- Look for natural business boundaries
- Consider team ownership and expertise
- Identify data ownership

**Step 3: Service Responsibility Matrix**

```markdown
| Service | Primary Responsibility | Data Ownership | Team   |
| ------- | ---------------------- | -------------- | ------ |
| User    | User management        | User profiles  | Team A |
| Order   | Order processing       | Orders         | Team B |
| Payment | Payment processing     | Transactions   | Team C |
```

### 1.2 API Design

#### RESTful API Design

**Resource-Based URLs**

```http
# Good
GET    /api/v1/users/123
POST   /api/v1/users
PUT    /api/v1/users/123
DELETE /api/v1/users/123

# Bad
GET    /api/v1/getUser?id=123
POST   /api/v1/createUser
```

**HTTP Status Codes**

```http
200 OK           - Successful GET, PUT, PATCH
201 Created      - Successful POST
204 No Content   - Successful DELETE
400 Bad Request  - Client error
401 Unauthorized - Authentication required
403 Forbidden    - Authorization failed
404 Not Found    - Resource not found
500 Internal Server Error - Server error
```

**API Versioning Strategy**

```http
# URL Versioning
GET /api/v1/users/123
GET /api/v2/users/123

# Header Versioning
GET /api/users/123
Accept: application/vnd.api+json;version=1

# Query Parameter Versioning
GET /api/users/123?version=1
```

#### gRPC API Design

**Protocol Buffer Definition**

```protobuf
syntax = "proto3";

package user.v1;

service UserService {
  rpc GetUser(GetUserRequest) returns (User);
  rpc CreateUser(CreateUserRequest) returns (User);
  rpc UpdateUser(UpdateUserRequest) returns (User);
  rpc DeleteUser(DeleteUserRequest) returns (Empty);
}

message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
  google.protobuf.Timestamp created_at = 4;
}

message GetUserRequest {
  int32 user_id = 1;
}

message CreateUserRequest {
  string name = 1;
  string email = 2;
}
```

### 1.3 Data Design

#### Database per Service

**Service Data Ownership**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ User Service│    │Order Service│    │Payment Service│
│             │    │             │    │             │
│ ┌─────────┐ │    │ ┌─────────┐ │    │ ┌─────────┐ │
│ │Users DB │ │    │ │Orders DB│ │    │ │Payments │ │
│ │         │ │    │ │         │ │    │ │   DB    │ │
│ │- id     │ │    │ │- id     │ │    │ │- id     │ │
│ │- name   │ │    │ │- user_id│ │    │ │- order_id│ │
│ │- email  │ │    │ │- items  │ │    │ │- amount │ │
│ └─────────┘ │    │ └─────────┘ │    │ └─────────┘ │
└─────────────┘    └─────────────┘    └─────────────┘
```

**Data Consistency Patterns**

- **Eventual Consistency** - Accept temporary inconsistency
- **Saga Pattern** - Manage distributed transactions
- **Event Sourcing** - Store events instead of state
- **CQRS** - Separate read and write models

## Phase 2: Development Setup

### 2.1 Project Structure

#### Microservice Project Template

```
user-service/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/userservice/
│   │   │       ├── UserServiceApplication.java
│   │   │       ├── controller/
│   │   │       ├── service/
│   │   │       ├── repository/
│   │   │       ├── model/
│   │   │       └── config/
│   │   └── resources/
│   │       ├── application.yml
│   │       └── application-prod.yml
│   └── test/
│       └── java/
├── Dockerfile
├── docker-compose.yml
├── pom.xml
└── README.md
```

#### Configuration Management

```yaml
# application.yml
server:
  port: 8080

spring:
  application:
    name: user-service
  datasource:
    url: jdbc:postgresql://localhost:5432/users
    username: ${DB_USERNAME:user}
    password: ${DB_PASSWORD:password}
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: always

logging:
  level:
    com.example.userservice: INFO
```

### 2.2 Service Discovery

#### Service Registry Setup

**Consul Configuration**

```yaml
# consul.yml
datacenter: "dc1"
data_dir: "/tmp/consul"
log_level: "INFO"
node_name: "consul-server"
server: true
bootstrap_expect: 1
ui_config:
  enabled: true
connect:
  enabled: true
```

**Service Registration**

```java
@SpringBootApplication
@EnableDiscoveryClient
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
```

**Service Discovery Client**

```java
@Service
public class OrderServiceClient {
    @Autowired
    private DiscoveryClient discoveryClient;

    public String getOrderServiceUrl() {
        List<ServiceInstance> instances =
            discoveryClient.getInstances("order-service");
        if (!instances.isEmpty()) {
            ServiceInstance instance = instances.get(0);
            return "http://" + instance.getHost() + ":" + instance.getPort();
        }
        throw new RuntimeException("Order service not available");
    }
}
```

### 2.3 API Gateway Implementation

#### Spring Cloud Gateway

```yaml
# gateway.yml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/users/**
          filters:
            - StripPrefix=2
        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
          filters:
            - StripPrefix=2
```

#### Route Configuration

```java
@Configuration
public class GatewayConfig {
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("user-service", r -> r.path("/api/users/**")
                .filters(f -> f.stripPrefix(2))
                .uri("lb://user-service"))
            .route("order-service", r -> r.path("/api/orders/**")
                .filters(f -> f.stripPrefix(2))
                .uri("lb://order-service"))
            .build();
    }
}
```

## Phase 3: Implementation

### 3.1 Service Implementation

#### Controller Layer

```java
@RestController
@RequestMapping("/api/v1/users")
@Validated
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        User user = userService.findById(id);
        return ResponseEntity.ok(user);
    }

    @PostMapping
    public ResponseEntity<User> createUser(@Valid @RequestBody CreateUserRequest request) {
        User user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        User user = userService.updateUser(id, request);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
```

#### Service Layer

```java
@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    public User findById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("User not found: " + id));
    }

    public User createUser(CreateUserRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        // Publish domain event
        eventPublisher.publishEvent(new UserCreatedEvent(savedUser));

        return savedUser;
    }

    public User updateUser(Long id, UpdateUserRequest request) {
        User user = findById(id);
        user.setName(request.getName());
        user.setEmail(request.getEmail());

        User updatedUser = userRepository.save(user);

        // Publish domain event
        eventPublisher.publishEvent(new UserUpdatedEvent(updatedUser));

        return updatedUser;
    }

    public void deleteUser(Long id) {
        User user = findById(id);
        userRepository.delete(user);

        // Publish domain event
        eventPublisher.publishEvent(new UserDeletedEvent(user));
    }
}
```

#### Repository Layer

```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    List<User> findByNameContainingIgnoreCase(String name);

    @Query("SELECT u FROM User u WHERE u.createdAt >= :startDate")
    List<User> findUsersCreatedAfter(@Param("startDate") LocalDateTime startDate);
}
```

### 3.2 Inter-Service Communication

#### Synchronous Communication

**RestTemplate Configuration**

```java
@Configuration
public class RestTemplateConfig {

    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

**Service Client**

```java
@Service
public class OrderServiceClient {

    @Autowired
    private RestTemplate restTemplate;

    private static final String ORDER_SERVICE_URL = "http://order-service";

    public Order getOrder(Long orderId) {
        String url = ORDER_SERVICE_URL + "/api/v1/orders/" + orderId;
        return restTemplate.getForObject(url, Order.class);
    }

    public Order createOrder(CreateOrderRequest request) {
        String url = ORDER_SERVICE_URL + "/api/v1/orders";
        return restTemplate.postForObject(url, request, Order.class);
    }
}
```

#### Asynchronous Communication

**Event Publisher**

```java
@Component
public class DomainEventPublisher {

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    public void publishUserCreated(User user) {
        UserCreatedEvent event = new UserCreatedEvent(
            user.getId(),
            user.getName(),
            user.getEmail(),
            Instant.now()
        );
        eventPublisher.publishEvent(event);
    }
}
```

**Event Listener**

```java
@Component
public class OrderEventListener {

    @Autowired
    private OrderService orderService;

    @EventListener
    public void handleUserCreated(UserCreatedEvent event) {
        // Create welcome order for new user
        CreateOrderRequest request = new CreateOrderRequest();
        request.setUserId(event.getUserId());
        request.setType("WELCOME");

        orderService.createOrder(request);
    }
}
```

### 3.3 Data Management

#### Database Migration

```sql
-- V1__Create_users_table.sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### Event Store Implementation

```java
@Entity
@Table(name = "domain_events")
public class DomainEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(name = "aggregate_id", nullable = false)
    private String aggregateId;

    @Column(name = "event_data", columnDefinition = "TEXT")
    private String eventData;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    @Column(name = "version", nullable = false)
    private Integer version;

    // Constructors, getters, setters
}
```

## Phase 4: Testing

### 4.1 Unit Testing

#### Service Layer Tests

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private UserService userService;

    @Test
    void shouldCreateUserSuccessfully() {
        // Given
        CreateUserRequest request = new CreateUserRequest();
        request.setName("John Doe");
        request.setEmail("john@example.com");

        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setName("John Doe");
        savedUser.setEmail("john@example.com");

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        // When
        User result = userService.createUser(request);

        // Then
        assertThat(result.getName()).isEqualTo("John Doe");
        assertThat(result.getEmail()).isEqualTo("john@example.com");
        verify(eventPublisher).publishEvent(any(UserCreatedEvent.class));
    }

    @Test
    void shouldThrowExceptionWhenUserNotFound() {
        // Given
        Long userId = 1L;
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> userService.findById(userId))
            .isInstanceOf(UserNotFoundException.class)
            .hasMessage("User not found: 1");
    }
}
```

### 4.2 Integration Testing

#### Controller Integration Tests

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class UserControllerIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldCreateUser() {
        // Given
        CreateUserRequest request = new CreateUserRequest();
        request.setName("John Doe");
        request.setEmail("john@example.com");

        // When
        ResponseEntity<User> response = restTemplate.postForEntity(
            "/api/v1/users", request, User.class);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody().getName()).isEqualTo("John Doe");
        assertThat(response.getBody().getEmail()).isEqualTo("john@example.com");
    }

    @Test
    void shouldGetUser() {
        // Given
        User user = new User();
        user.setName("John Doe");
        user.setEmail("john@example.com");
        User savedUser = userRepository.save(user);

        // When
        ResponseEntity<User> response = restTemplate.getForEntity(
            "/api/v1/users/" + savedUser.getId(), User.class);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getName()).isEqualTo("John Doe");
    }
}
```

### 4.3 Contract Testing

#### Consumer-Driven Contracts

```java
@ExtendWith(PactConsumerTestExt.class)
@PactTestFor(providerName = "user-service")
class UserServiceContractTest {

    @Pact(consumer = "order-service")
    public RequestResponsePact getUserPact(PactDslWithProvider builder) {
        return builder
            .given("user exists")
            .uponReceiving("a request for user")
            .path("/api/v1/users/1")
            .method("GET")
            .willRespondWith()
            .status(200)
            .headers(Map.of("Content-Type", "application/json"))
            .body("""
                {
                    "id": 1,
                    "name": "John Doe",
                    "email": "john@example.com",
                    "createdAt": "2023-01-01T00:00:00Z"
                }
                """)
            .toPact();
    }

    @Test
    @PactTestFor(pactMethod = "getUserPact")
    void shouldGetUser(MockServer mockServer) {
        // Given
        String url = mockServer.getUrl() + "/api/v1/users/1";

        // When
        ResponseEntity<User> response = restTemplate.getForEntity(url, User.class);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getName()).isEqualTo("John Doe");
    }
}
```

## Phase 5: Deployment

### 5.1 Containerization

#### Dockerfile

```dockerfile
FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/user-service-1.0.0.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### Docker Compose

```yaml
version: "3.8"

services:
  consul:
    image: consul:1.15
    ports:
      - "8500:8500"
    command: agent -server -bootstrap-expect=1 -client=0.0.0.0 -ui

  user-service:
    build: ./user-service
    ports:
      - "8081:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - CONSUL_HOST=consul
    depends_on:
      - consul
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  order-service:
    build: ./order-service
    ports:
      - "8082:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - CONSUL_HOST=consul
    depends_on:
      - consul
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 5.2 Kubernetes Deployment

#### Deployment Manifest

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  labels:
    app: user-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
        - name: user-service
          image: user-service:1.0.0
          ports:
            - containerPort: 8080
          env:
            - name: SPRING_PROFILES_ACTIVE
              value: "kubernetes"
            - name: CONSUL_HOST
              value: "consul-service"
          livenessProbe:
            httpGet:
              path: /actuator/health
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /actuator/health
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 5
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
```

#### Service Manifest

```yaml
apiVersion: v1
kind: Service
metadata:
  name: user-service
spec:
  selector:
    app: user-service
  ports:
    - port: 80
      targetPort: 8080
  type: ClusterIP
```

### 5.3 CI/CD Pipeline

#### GitHub Actions Workflow

```yaml
name: Deploy User Service

on:
  push:
    branches: [main]
    paths: ["user-service/**"]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: "17"
          distribution: "temurin"

      - name: Run tests
        run: |
          cd user-service
          ./mvnw test

      - name: Run integration tests
        run: |
          cd user-service
          ./mvnw verify -P integration-tests

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: "17"
          distribution: "temurin"

      - name: Build application
        run: |
          cd user-service
          ./mvnw clean package -DskipTests

      - name: Build Docker image
        run: |
          cd user-service
          docker build -t user-service:${{ github.sha }} .

      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push user-service:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/user-service user-service=user-service:${{ github.sha }}
          kubectl rollout status deployment/user-service
```

## Phase 6: Monitoring and Operations

### 6.1 Health Checks

#### Health Check Implementation

```java
@Component
public class UserServiceHealthIndicator implements HealthIndicator {

    @Autowired
    private UserRepository userRepository;

    @Override
    public Health health() {
        try {
            // Check database connectivity
            userRepository.count();

            // Check external dependencies
            // (e.g., call another service)

            return Health.up()
                .withDetail("database", "available")
                .withDetail("timestamp", Instant.now())
                .build();
        } catch (Exception e) {
            return Health.down()
                .withDetail("database", "unavailable")
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}
```

### 6.2 Metrics Collection

#### Custom Metrics

```java
@Component
public class UserMetrics {

    private final Counter userCreatedCounter;
    private final Timer userCreationTimer;
    private final Gauge activeUsersGauge;

    public UserMetrics(MeterRegistry meterRegistry) {
        this.userCreatedCounter = Counter.builder("users.created")
            .description("Number of users created")
            .register(meterRegistry);

        this.userCreationTimer = Timer.builder("users.creation.time")
            .description("Time taken to create a user")
            .register(meterRegistry);

        this.activeUsersGauge = Gauge.builder("users.active")
            .description("Number of active users")
            .register(meterRegistry, this, UserMetrics::getActiveUserCount);
    }

    public void incrementUserCreated() {
        userCreatedCounter.increment();
    }

    public void recordUserCreationTime(Duration duration) {
        userCreationTimer.record(duration);
    }

    private double getActiveUserCount() {
        // Implementation to get active user count
        return 0.0;
    }
}
```

### 6.3 Distributed Tracing

#### Tracing Configuration

```java
@Configuration
public class TracingConfig {

    @Bean
    public Sender sender() {
        return OkHttpSender.create("http://zipkin:9411/api/v2/spans");
    }

    @Bean
    public AsyncReporter<Span> spanReporter() {
        return AsyncReporter.create(sender());
    }

    @Bean
    public Tracing tracing() {
        return Tracing.newBuilder()
            .localServiceName("user-service")
            .spanReporter(spanReporter())
            .sampler(Sampler.create(1.0f))
            .build();
    }
}
```

## Best Practices Summary

### 1. Service Design

- Keep services small and focused
- Design for failure
- Use asynchronous communication when possible
- Implement circuit breakers

### 2. Data Management

- Own your data
- Use eventual consistency
- Implement proper backup strategies
- Monitor data growth

### 3. Security

- Implement authentication and authorization
- Use HTTPS everywhere
- Validate all inputs
- Implement rate limiting

### 4. Monitoring

- Implement comprehensive logging
- Use distributed tracing
- Monitor key metrics
- Set up alerting

### 5. Testing

- Write comprehensive tests
- Use contract testing
- Implement chaos engineering
- Test failure scenarios

## Conclusion

Implementing microservices requires careful planning, disciplined development practices, and robust operational procedures. Start small, iterate frequently, and always consider the trade-offs between complexity and benefits.

Remember that microservices are not a silver bullet. They solve specific problems but introduce new challenges. Choose this architecture only when the benefits outweigh the costs.

---

**Next Steps:**

- Review [Best Practices & Patterns](./06-best-practices-and-patterns.md) for detailed guidance
- Study [Troubleshooting & Monitoring](./07-troubleshooting-and-monitoring.md) for operational concerns
- Explore [Reynard Microservices Analysis](./04-reynard-microservices-analysis.md) for real-world examples
