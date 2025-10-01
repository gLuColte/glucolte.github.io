---
title: Hourglass Design
permalink: /study/systemDesignHourglass
---

# System Design Architecture

Fundamental concepts and principles for designing scalable, reliable, and maintainable systems.

---

## Data Sources & Types

### Data Sources
- **User Input**: Forms, APIs, real-time interactions
- **External APIs**: Third-party services, webhooks
- **Databases**: Existing data stores, legacy systems
- **Files**: Uploads, batch processing, logs
- **Streams**: Real-time data feeds, IoT devices
- **Caches**: Redis, Memcached, CDN data

### Data Types
- **Structured**: Relational databases, JSON, XML
- **Semi-structured**: NoSQL documents, logs
- **Unstructured**: Images, videos, text documents
- **Time-series**: Metrics, sensor data, financial data
- **Graph**: Social networks, recommendations
- **Key-value**: Session data, configuration

---

## Storage Considerations

### Storage Types
- **Relational (ACID)**: Financial transactions, user accounts
- **NoSQL (BASE)**: User profiles, product catalogs
- **In-memory**: Session data, real-time analytics
- **File storage**: Media files, documents
- **Time-series**: Metrics, logs, sensor data
- **Search**: Full-text search, recommendations

### Storage Patterns
- **Read-heavy**: Caching, read replicas, CDN
- **Write-heavy**: Sharding, partitioning, async processing
- **Mixed workload**: Separate read/write paths
- **Analytical**: Data warehouses, OLAP systems

---

## Access Patterns

### Read Patterns
- **Point queries**: User profiles, product details
- **Range queries**: Time-based data, pagination
- **Aggregations**: Analytics, reporting, dashboards
- **Full-text search**: Search functionality
- **Real-time**: Live updates, notifications

### Write Patterns
- **Single writes**: User actions, form submissions
- **Batch writes**: Data imports, ETL processes
- **Streaming**: Real-time data ingestion
- **Transactional**: Multi-step operations
- **Event-driven**: Asynchronous processing

---

## Scalability Patterns

### Horizontal Scaling
- **Load balancing**: Distribute traffic across instances
- **Sharding**: Partition data across multiple databases
- **Microservices**: Decompose monolithic applications
- **Caching layers**: Reduce database load
- **CDN**: Distribute static content globally

### Vertical Scaling
- **Resource optimization**: CPU, memory, storage upgrades
- **Database tuning**: Query optimization, indexing
- **Application optimization**: Code efficiency, algorithms
- **Infrastructure**: Faster hardware, better networks

---

## Consistency Models

### Strong Consistency
- **ACID properties**: Atomicity, Consistency, Isolation, Durability
- **Use cases**: Financial transactions, critical data
- **Trade-offs**: Higher latency, lower availability

### Eventual Consistency
- **BASE properties**: Basically Available, Soft state, Eventual consistency
- **Use cases**: Social media, content delivery
- **Trade-offs**: Higher availability, potential inconsistency

### Consistency Levels
- **Strong**: All nodes see same data immediately
- **Weak**: Nodes may have different data temporarily
- **Eventual**: Data becomes consistent over time
- **Session**: Consistency within user session

---

## Availability & Reliability

### Availability Patterns
- **Redundancy**: Multiple instances, failover
- **Circuit breakers**: Prevent cascade failures
- **Bulkheads**: Isolate failures
- **Health checks**: Monitor system status
- **Graceful degradation**: Reduce functionality vs. total failure

### Reliability Metrics
- **MTBF**: Mean Time Between Failures
- **MTTR**: Mean Time To Recovery
- **SLA**: Service Level Agreement
- **SLO**: Service Level Objective
- **SLI**: Service Level Indicator

---

## Performance Considerations

### Latency Optimization
- **Caching**: Application, database, CDN
- **Connection pooling**: Reuse database connections
- **Async processing**: Non-blocking operations
- **Compression**: Reduce data transfer
- **CDN**: Geographic distribution

### Throughput Optimization
- **Horizontal scaling**: Add more instances
- **Database optimization**: Indexing, query tuning
- **Load balancing**: Distribute requests
- **Batch processing**: Group operations
- **Connection multiplexing**: Share connections

---

## Security Architecture

### Authentication & Authorization
- **Identity providers**: OAuth, SAML, LDAP
- **Role-based access**: RBAC, ABAC
- **API security**: API keys, JWT tokens
- **Session management**: Secure session handling

### Data Protection
- **Encryption**: At rest, in transit
- **Data masking**: PII protection
- **Audit logging**: Track access and changes
- **Compliance**: GDPR, HIPAA, SOX

---

## Monitoring & Observability

### Metrics
- **Application metrics**: Response time, error rate
- **Infrastructure metrics**: CPU, memory, disk
- **Business metrics**: User engagement, revenue
- **Custom metrics**: Domain-specific KPIs

### Logging
- **Structured logging**: JSON, key-value pairs
- **Log aggregation**: Centralized log collection
- **Log analysis**: Search, filtering, alerting
- **Retention policies**: Storage and compliance

### Tracing
- **Distributed tracing**: Request flow across services
- **Performance profiling**: Identify bottlenecks
- **Error tracking**: Debug production issues
- **User journey**: Track user interactions

---

## Design Patterns

### Microservices Patterns
- **API Gateway**: Single entry point
- **Service Discovery**: Dynamic service location
- **Circuit Breaker**: Fault tolerance
- **Saga**: Distributed transaction management
- **CQRS**: Command Query Responsibility Segregation

### Data Patterns
- **Event Sourcing**: Store events, not state
- **CQRS**: Separate read/write models
- **Saga**: Long-running transactions
- **Outbox**: Reliable event publishing
- **Event-driven**: Asynchronous communication

---

## Trade-offs & Decision Framework

### Common Trade-offs
- **Consistency vs. Availability**: CAP theorem
- **Latency vs. Throughput**: Performance optimization
- **Cost vs. Performance**: Resource allocation
- **Simplicity vs. Flexibility**: Architecture complexity
- **Development speed vs. Quality**: Time to market

### Decision Framework
1. **Requirements**: Functional and non-functional
2. **Constraints**: Budget, timeline, team skills
3. **Trade-offs**: Identify key decisions
4. **Prototyping**: Validate assumptions
5. **Iteration**: Continuous improvement

---

## Architecture Diagrams

### High-Level Architecture
```
[Users] → [Load Balancer] → [API Gateway] → [Microservices]
                                    ↓
[Database] ← [Cache] ← [Message Queue] ← [External APIs]
```

### Data Flow Architecture
```
[Data Sources] → [Ingestion] → [Processing] → [Storage] → [Analytics]
                      ↓              ↓           ↓
[Real-time] → [Stream Processing] → [Cache] → [API] → [Users]
```

---

## Best Practices

### Design Principles
- **Start simple**: Begin with monolithic, evolve to microservices
- **Design for failure**: Assume components will fail
- **Scale horizontally**: Add more instances, not bigger ones
- **Cache everything**: Reduce database load
- **Monitor everything**: Visibility into system behavior

### Implementation Guidelines
- **API-first**: Design APIs before implementation
- **Database design**: Normalize for consistency, denormalize for performance
- **Error handling**: Graceful degradation, proper error codes
- **Testing**: Unit, integration, load, and chaos testing
- **Documentation**: Keep architecture docs updated

---

## Common Anti-patterns

### Avoid These
- **God objects**: Classes with too many responsibilities
- **Database as integration**: Using DB for service communication
- **Synchronous everything**: Blocking operations everywhere
- **No caching**: Repeated expensive operations
- **Tight coupling**: Services directly dependent on each other

### Red Flags
- **Single point of failure**: No redundancy
- **No monitoring**: Flying blind in production
- **Hard-coded values**: Configuration in code
- **No error handling**: System crashes on errors
- **No scalability plan**: Cannot handle growth