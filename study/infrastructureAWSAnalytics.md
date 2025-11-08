---
title: AWS Data Analytics Services
permalink: /study/infrastructureAWSAnalytics
---

## 1. Kinesis Family {#section-1-kinesis-family}

### 1.1 Kinesis Data Streams {#section-1-1-kinesis-streams}

- Managed streaming ingestion service for real-time data (IoT, clickstreams, app logs).
- Producers push data into a stream; consumers (Lambda, Kinesis Client Library apps, Firehose, analytics engines) read within a rolling retention window (24 hours up to 365 days).
- Streams are composed of **shards**. Each shard supports 1 MB/sec write, 2 MB/sec read (about 1,000 records/sec). Scale throughput by increasing shard count.
- Unlike SQS, multiple producer and consumer groups can fan-in/out simultaneously; data persists for the retention window so consumers can replay.

### 1.2 Kinesis Data Firehose {#section-1-2-kinesis-firehose}

- Fully managed delivery service that takes streaming data (from producers or Data Streams) and lands it into destinations like S3, Redshift, OpenSearch, Splunk, or third-party endpoints.
- Buffers incoming data by size or time (e.g., 1 MB or 60 seconds), optionally transforms records via Lambda, then delivers to the destination.
- Handles scaling automatically and requires no shard management; near-real-time ETL into data lakes/warehouses.

### 1.3 Kinesis Data Analytics {#section-1-3-kinesis-analytics}

- Real-time SQL or Apache Flink (Scala/Java) processing for streaming data from Kinesis Data Streams or Firehose.
- Fits between stream input and output, performing aggregations, filtering, windowed joins, and anomaly detection without building custom streaming apps.
- Outputs to streams, Firehose, Lambda, or managed services. Great for leaderboards, IoT telemetry, security analytics, and operational monitoring.

---

## 2. Big Data Processing {#section-2-big-data-processing}

### 2.1 MapReduce & Hadoop Basics {#section-2-1-mapreduce}

- MapReduce splits work into **Map** (parallel processing of chunks) and **Reduce** (aggregate results). Under the hood: map → split → shuffle → reduce → final output.
- Hadoop Distributed File System (HDFS) stores blocks (typically 64 MB) across data nodes with replication; a NameNode tracks metadata.

### 2.2 Amazon EMR {#section-2-2-amazon-emr}

- Managed Hadoop/Spark ecosystem on EC2 (Spark, Hive, HBase, Flink, Presto, Pig, etc.). Clusters run inside a VPC (single AZ) with auto scaling using On-Demand, Spot, or reserved instances.
- **Node types**:
  - **Master node(s)** – manage cluster state and job scheduling (up to 3 for HA).
  - **Core nodes** – run tasks and store HDFS data (loss affects HDFS).
  - **Task nodes** – run tasks only; ideal for Spot scaling.
- **EMRFS** stores persistent data in S3, allowing clusters to be ephemeral.
- Input/output commonly in S3; EMR integrates with Glue Data Catalog, IAM, KMS, CloudWatch, and autoscaling policies.

### 2.3 AWS Batch {#section-2-3-aws-batch}

- Managed batch compute service for long-running or resource-intensive jobs (>15 minutes). Jobs run inside Docker containers on managed or unmanaged compute environments.
- Components: job definitions (docker image, vCPU/memory, IAM role), job queues (priority), compute environments (managed fleets or custom EC2/Spot fleets).
- AWS Batch handles placement, retries, dependencies, and integration with Step Functions/EventBridge. Provides flexibility compared to Lambda (no 15-minute cap, any runtime).

---

## 3. Data Warehousing & BI {#section-3-data-warehousing}

### 3.1 Amazon Redshift {#section-3-1-redshift}

- Managed, petabyte-scale columnar data warehouse for OLAP workloads. Uses SQL interface and integrates with BI tools (QuickSight, Tableau, etc.).
- Runs clusters in a single AZ with a leader node coordinating compute nodes (slices). Not HA by default; snapshots/backups stored in S3 (1-day retention by default) and replicated cross-AZ.
- Features: Redshift Spectrum (query S3 data), federated queries (Aurora/Postgres), encryption with KMS, Enhanced VPC Routing for private traffic, concurrency scaling.

### 3.2 Amazon QuickSight {#section-3-2-quicksight}

- Serverless BI/visualization service with pay-per-session pricing (SPICE in-memory engine for fast queries).
- Connects to AWS sources (Athena, Aurora, Redshift, RDS, S3, IoT) and external sources (Salesforce, Jira, GitHub, SQL Server, Snowflake, Presto, Teradata, etc.).
- Supports dashboards, ad-hoc analysis, ML insights, embedded analytics, and row-level security.

---

## 4. Other Analytics Services {#section-4-other-analytics}

### 4.1 AWS Glue (Contextual Reference) {#section-4-1-glue}

- (Optional mention) AWS Glue provides ETL jobs and the Glue Data Catalog for schema management. Often used with EMR, Athena, and Redshift.

### 4.2 Amazon Athena {#section-4-2-athena}

- (If needed) Serverless interactive SQL queries over S3 using schema-on-read. Pay per TB scanned.

*(Note: Additional services like OpenSearch, Kinesis Video Streams, or DataBrew can be added as needed.)*

---
