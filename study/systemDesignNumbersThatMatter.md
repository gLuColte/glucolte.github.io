---
title: Numbers That Matter
permalink: /study/systemDesignNumbersThatMatter
---

# Numbers That Matter {#numbers-that-matter}

These numbers are useful during system design interviews and architecture reviews. They are not exact guarantees; use them to sanity-check scale, latency, storage, and reliability before choosing deeper implementation details.

---

## Powers of Two {#powers-of-two}

Computer systems usually count storage, memory, partitions, hash spaces, and binary IDs in powers of two. The decimal approximation is often enough for quick capacity math.

The reason is binary. One bit has two possible states: `0` or `1`. Every extra bit doubles the number of possible combinations because it can be added as either `0` or `1` in front of every existing pattern:

```
1 bit  = 2 combinations    = 0, 1
2 bits = 4 combinations    = 00, 01, 10, 11
3 bits = 8 combinations    = 000, 001, 010, 011, 100, 101, 110, 111
n bits = 2^n combinations
```

That doubling is why systems naturally "grow" as 2, 4, 8, 16, 32, 64, 128, and so on. For example, 8 bits make 2<sup>8</sup> = 256 possible byte values, and 32 bits make 2<sup>32</sup> = ~4.3 billion possible unsigned integer values.

For storage, people usually say **kilobyte, megabyte, gigabyte, terabyte, petabyte** in conversation. Strictly speaking, there are two naming systems:

- **Decimal units:** `KB`, `MB`, `GB`, `TB`, `PB` use powers of 10. Example: `1 KB = 1,000 bytes`.
- **Binary units:** `KiB`, `MiB`, `GiB`, `TiB`, `PiB` use powers of 2. Example: `1 KiB = 1,024 bytes`.

In system design interviews, it is usually fine to say `KB`, `MB`, `GB`, `TB`, and `PB` and approximate each step as `~1,000x`. The binary names are included here so you know why `2^10 = 1,024` is technically `1 KiB`, even though people often casually call it `1 KB`.

<table class="study-table">
  <thead>
    <tr>
      <th>Power</th>
      <th>Approximate Value</th>
      <th>Common Name</th>
      <th>Precise Binary Name</th>
      <th>Common Use</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>2<sup>8</sup></td>
      <td>256</td>
      <td>Two hundred fifty-six</td>
      <td>256</td>
      <td>Byte values, small lookup tables</td>
    </tr>
    <tr>
      <td>2<sup>10</sup></td>
      <td>~1 thousand</td>
      <td>Kilobyte-ish / Thousand</td>
      <td>Kibibyte (KiB)</td>
      <td>1 KB-ish blocks, small buffers</td>
    </tr>
    <tr>
      <td>2<sup>20</sup></td>
      <td>~1 million</td>
      <td>Megabyte-ish / Million</td>
      <td>Mebibyte (MiB)</td>
      <td>1 MB-ish objects, user counts</td>
    </tr>
    <tr>
      <td>2<sup>30</sup></td>
      <td>~1 billion</td>
      <td>Gigabyte-ish / Billion</td>
      <td>Gibibyte (GiB)</td>
      <td>1 GB-ish files, rows, events</td>
    </tr>
    <tr>
      <td>2<sup>40</sup></td>
      <td>~1 trillion</td>
      <td>Terabyte-ish / Trillion</td>
      <td>Tebibyte (TiB)</td>
      <td>1 TB-ish storage, logs, analytics</td>
    </tr>
    <tr>
      <td>2<sup>50</sup></td>
      <td>~1 quadrillion</td>
      <td>Petabyte-ish / Quadrillion</td>
      <td>Pebibyte (PiB)</td>
      <td>1 PB-ish data lakes, large archives</td>
    </tr>
    <tr>
      <td>2<sup>60</sup></td>
      <td>~1 quintillion</td>
      <td>Exabyte-ish / Quintillion</td>
      <td>Exbibyte (EiB)</td>
      <td>Very large ID spaces, global-scale storage</td>
    </tr>
  </tbody>
</table>

Storage conversions:

<table class="study-table">
  <thead>
    <tr>
      <th>Unit</th>
      <th>Decimal Meaning</th>
      <th>Binary Approximation</th>
      <th>Interview Shortcut</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1 KB</td>
      <td>1,000 bytes</td>
      <td>1 KiB = 1,024 bytes</td>
      <td>~1 thousand bytes</td>
    </tr>
    <tr>
      <td>1 MB</td>
      <td>1,000 KB = 1,000,000 bytes</td>
      <td>1 MiB = 1,024 KiB</td>
      <td>~1 million bytes</td>
    </tr>
    <tr>
      <td>1 GB</td>
      <td>1,000 MB = 1,000,000,000 bytes</td>
      <td>1 GiB = 1,024 MiB</td>
      <td>~1 billion bytes</td>
    </tr>
    <tr>
      <td>1 TB</td>
      <td>1,000 GB = 1,000,000,000,000 bytes</td>
      <td>1 TiB = 1,024 GiB</td>
      <td>~1 trillion bytes</td>
    </tr>
    <tr>
      <td>1 PB</td>
      <td>1,000 TB = 1,000,000,000,000,000 bytes</td>
      <td>1 PiB = 1,024 TiB</td>
      <td>~1 quadrillion bytes</td>
    </tr>
  </tbody>
</table>

Quick notes:

- 2<sup>10</sup> = 1,024, so treat it as 10<sup>3</sup> for rough math.
- In casual speech, `1 KB` often means "about 1 thousand bytes"; technically, `1 KiB = 1,024 bytes`.
- 1 byte = 8 bits; 1 KB-ish = 1,024 bytes; 1 MB-ish = 1,024 KB-ish.

---

## Average Object Sizes {#average-object-sizes}

Use these as rough estimates when converting product requirements into storage, bandwidth, cache, and database sizing. Real systems vary a lot because of data types, text encoding, metadata, indexes, compression, replication, and media quality.

For a stored object, start with this mental model:

```
total object size
~= primitive fields
 + text fields
 + structured format overhead
 + metadata fields
 + indexes
 + storage engine overhead
 + replication / compression effects
 + media objects, if any
```

Primitive fields are the easiest to estimate because they are usually fixed-size:

<table class="study-table">
  <thead>
    <tr>
      <th>Primitive / Field Type</th>
      <th>Rough Size</th>
      <th>Why It Matters</th>
      <th>Example Estimate</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Boolean</td>
      <td>1 byte-ish</td>
      <td>Often padded by storage formats; tiny alone, noticeable across billions of rows.</td>
      <td><code>is_deleted</code>, <code>is_verified</code></td>
    </tr>
    <tr>
      <td>Integer ID</td>
      <td>4-8 bytes</td>
      <td>Primary keys, foreign keys, counters, timestamps.</td>
      <td>32-bit int = 4 bytes; 64-bit int = 8 bytes</td>
    </tr>
    <tr>
      <td>UUID</td>
      <td>16 bytes binary / 36 chars text</td>
      <td>Text UUIDs cost more in storage and indexes than binary UUIDs.</td>
      <td><code>550e8400-e29b-41d4-a716-446655440000</code></td>
    </tr>
    <tr>
      <td>Timestamp</td>
      <td>8 bytes</td>
      <td>Common on almost every event and row.</td>
      <td>Unix milliseconds or database timestamp</td>
    </tr>
    <tr>
      <td>Decimal / money</td>
      <td>8-16 bytes</td>
      <td>Exact decimals often cost more than integers or floats.</td>
      <td>Price, balance, invoice amount</td>
    </tr>
    <tr>
      <td>Foreign key pointer</td>
      <td>4-8 bytes</td>
      <td>References multiply quickly across relational rows and indexes.</td>
      <td><code>user_id</code>, <code>product_id</code>, <code>order_id</code></td>
    </tr>
  </tbody>
</table>

Text fields depend on character count and encoding:

```
text bytes ~= character_count x bytes_per_character
```

Encoding comparison:

<table class="study-table">
  <thead>
    <tr>
      <th>Encoding</th>
      <th>Bytes per Character</th>
      <th>What It Represents</th>
      <th>Design Note</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ASCII</td>
      <td>1 byte</td>
      <td>Basic English letters, digits, punctuation, and control characters.</td>
      <td>Small and simple, but limited to 128 characters.</td>
    </tr>
    <tr>
      <td>UTF-8</td>
      <td>1-4 bytes</td>
      <td>Unicode using variable-length bytes.</td>
      <td>ASCII stays 1 byte; many European characters use 2 bytes; CJK often uses 3 bytes; emoji often use 4 bytes.</td>
    </tr>
    <tr>
      <td>UTF-16</td>
      <td>2-4 bytes</td>
      <td>Unicode using 16-bit code units.</td>
      <td>Common in some runtimes; many common characters use 2 bytes, while some symbols and emoji use 4 bytes.</td>
    </tr>
    <tr>
      <td>UTF-32</td>
      <td>4 bytes</td>
      <td>Unicode using fixed-width 32-bit code units.</td>
      <td>Simple indexing by code unit, but usually wastes space for normal text.</td>
    </tr>
  </tbody>
</table>

The difference is not that UTF-16 or UTF-32 are "richer" than UTF-8. They can represent the same Unicode character set; they just encode characters with different byte layouts. UTF-8 is compact for ASCII-heavy text, UTF-16 is common in some language runtimes, and UTF-32 trades storage efficiency for fixed-width representation.

Useful text estimates:

<table class="study-table">
  <thead>
    <tr>
      <th>Text Field</th>
      <th>Characters</th>
      <th>ASCII / English UTF-8</th>
      <th>Worst-Case UTF-8</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Username</td>
      <td>20 chars</td>
      <td>~20 bytes</td>
      <td>~80 bytes</td>
    </tr>
    <tr>
      <td>Short title</td>
      <td>100 chars</td>
      <td>~100 bytes</td>
      <td>~400 bytes</td>
    </tr>
    <tr>
      <td>Short post text</td>
      <td>280 chars</td>
      <td>~280 bytes</td>
      <td>~1.1 KB</td>
    </tr>
    <tr>
      <td>Description</td>
      <td>1,000 chars</td>
      <td>~1 KB</td>
      <td>~4 KB</td>
    </tr>
  </tbody>
</table>

Composite objects are bigger than the visible text because they include fixed fields, metadata, pointers, and storage overhead:

<table class="study-table">
  <thead>
    <tr>
      <th>Object Type</th>
      <th>Main Sizing Driver</th>
      <th>Rough Size</th>
      <th>Example Estimate</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Small JSON event</td>
      <td>Field names + values + quotes + commas + braces</td>
      <td>0.5-2 KB</td>
      <td><code>{ user_id, action, timestamp, metadata }</code></td>
    </tr>
    <tr>
      <td>Metadata row</td>
      <td>IDs + timestamps + counters + flags + text + pointers</td>
      <td>0.5-2 KB</td>
      <td>Post ID + author ID + short text + counters + media pointers</td>
    </tr>
    <tr>
      <td>User profile row</td>
      <td>Bio + settings + links + counters + media pointers</td>
      <td>1-5 KB</td>
      <td>Name, bio, settings, counters, links</td>
    </tr>
    <tr>
      <td>Product catalog row</td>
      <td>Description + attributes + variants + media URLs</td>
      <td>2-10 KB</td>
      <td>Product title, description, category, price, inventory</td>
    </tr>
    <tr>
      <td>Log line</td>
      <td>JSON fields + request metadata</td>
      <td>0.5-4 KB</td>
      <td>JSON log with request ID, route, status, latency</td>
    </tr>
    <tr>
      <td>Thumbnail image</td>
      <td>Compression quality + resolution + format</td>
      <td>10-100 KB</td>
      <td>Avatar, preview image, product thumbnail</td>
    </tr>
    <tr>
      <td>Compressed photo</td>
      <td>Compression quality + resolution + format</td>
      <td>0.5-5 MB</td>
      <td>Phone photo after web/mobile compression</td>
    </tr>
    <tr>
      <td>Short video</td>
      <td>Resolution + duration + codec + bitrate</td>
      <td>5-100+ MB</td>
      <td>Short social video at multiple renditions</td>
    </tr>
  </tbody>
</table>

How those estimates add up:

<table class="study-table">
  <thead>
    <tr>
      <th>Object Type</th>
      <th>Example Field Breakdown</th>
      <th>Why the Range Moves</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Small JSON event</td>
      <td><code>user_id</code> integer (<code>8 bytes</code>) becomes larger in JSON because the key name and decimal text are stored too; <code>action</code> string, <code>timestamp</code>, and <code>metadata</code> fields add more repeated keys and values.</td>
      <td>JSON repeats field names on every event, and request/session/device metadata often outweighs the core values.</td>
    </tr>
    <tr>
      <td>Metadata row</td>
      <td><code>post_id</code> (<code>8 bytes</code>) + <code>author_id</code> (<code>8 bytes</code>) + <code>created_at</code> (<code>8 bytes</code>) + counters + flags + short text + media pointers + row overhead.</td>
      <td>The text length, number of pointers, and storage engine/index overhead usually decide whether it is closer to 0.5 KB or 2 KB.</td>
    </tr>
    <tr>
      <td>User profile row</td>
      <td><code>user_id</code> (<code>8 bytes</code>) + handle/name text + bio text + settings JSON + counters/timestamps + links/avatar/banner pointers.</td>
      <td>Profiles with empty bios are small; rich profiles with settings, links, localization, and media pointers are larger.</td>
    </tr>
    <tr>
      <td>Product catalog row</td>
      <td><code>product_id</code> (<code>8 bytes</code>) + <code>seller_id</code> (<code>8 bytes</code>) + timestamps/price/inventory + title + description + attributes JSON + category/brand/tags + media URLs.</td>
      <td>Descriptions, variant attributes, and media URL lists dominate the primitive fields.</td>
    </tr>
    <tr>
      <td>Log line</td>
      <td><code>request_id</code> UUID string (<code>36 chars</code>) + route/status/latency + timestamp + user/session/IP/user-agent/trace fields.</td>
      <td>Logs become large when they include stack traces, user agents, headers, request bodies, or nested JSON metadata.</td>
    </tr>
    <tr>
      <td>Thumbnail image</td>
      <td>Small image file, for example 100x100 to 400x400 pixels, compressed as JPEG/WebP/AVIF; the database row usually stores only the URL or object key.</td>
      <td>Resolution, image complexity, format, and quality setting dominate. Store the binary in object storage, not inside the row.</td>
    </tr>
    <tr>
      <td>Compressed photo</td>
      <td>Photo file resized and compressed for web/mobile; the row usually stores metadata and an object-storage pointer, not the binary photo.</td>
      <td>Original resolution, compression quality, and format matter more than database field sizes.</td>
    </tr>
    <tr>
      <td>Short video</td>
      <td>Video size is roughly <code>bitrate x duration</code>. For example, 2 Mbps for 30 seconds is about 60 megabits, or ~7.5 MB, before extra renditions.</td>
      <td>Codec, bitrate, duration, resolution, and number of transcoded renditions dominate everything else.</td>
    </tr>
  </tbody>
</table>

For a database row:

```
row size
~= fixed fields
 + text fields
 + pointers / URLs
 + format overhead
 + storage overhead
```

Example product catalog row:

<table class="study-table">
  <thead>
    <tr>
      <th>Field Group</th>
      <th>Rough Size</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>product_id</code>, <code>seller_id</code>, timestamps, price, inventory</td>
      <td>~40-60 bytes</td>
    </tr>
    <tr>
      <td>Title</td>
      <td>~100 bytes</td>
    </tr>
    <tr>
      <td>Description</td>
      <td>~1-4 KB</td>
    </tr>
    <tr>
      <td>Category, brand, tags</td>
      <td>~100-500 bytes</td>
    </tr>
    <tr>
      <td>Attributes JSON</td>
      <td>~500 bytes-3 KB</td>
    </tr>
    <tr>
      <td>Media URLs</td>
      <td>~300 bytes-1 KB</td>
    </tr>
    <tr>
      <td>Rough total</td>
      <td>~2-10 KB</td>
    </tr>
  </tbody>
</table>

Quick sizing pattern:

```
Daily storage ~= events per day x average event size
Monthly storage ~= daily storage x 30
With replication ~= raw storage x replication factor
```

Example: 100M posts/day at 1 KB metadata each is ~100 GB/day of metadata. If 10% include a 1 MB compressed image, media adds ~10 TB/day before replicas, thumbnails, CDN cache, and backups.

Interview shortcut: for text, estimate `characters x encoding size`. For rows, add fixed fields, metadata, pointers, format overhead, and storage overhead. For media, estimate from compression, resolution, codec, and duration because media usually dominates storage and bandwidth.

---

## Latency Units {#latency-units}

Before reading latency numbers, keep the time units straight. Each step below is 1,000 times larger than the previous one.

<table class="study-table">
  <thead>
    <tr>
      <th>Unit</th>
      <th>Short Name</th>
      <th>Seconds</th>
      <th>Compared to Next Unit</th>
      <th>System Design Intuition</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Nanosecond</td>
      <td>ns</td>
      <td>0.000000001 s</td>
      <td>1 us = 1,000 ns</td>
      <td>CPU cache and very low-level memory timing.</td>
    </tr>
    <tr>
      <td>Microsecond</td>
      <td>us</td>
      <td>0.000001 s</td>
      <td>1 ms = 1,000 us</td>
      <td>Fast local operations, SSD access, kernel/network overhead.</td>
    </tr>
    <tr>
      <td>Millisecond</td>
      <td>ms</td>
      <td>0.001 s</td>
      <td>1 s = 1,000 ms</td>
      <td>Databases, service calls, same-region networks, user-visible latency.</td>
    </tr>
    <tr>
      <td>Second</td>
      <td>s</td>
      <td>1 s</td>
      <td>1 s = 1,000,000,000 ns</td>
      <td>Slow user flows, retries, batch jobs, timeout budgets.</td>
    </tr>
  </tbody>
</table>

Order from smallest to largest: `ns` &lt; `us` &lt; `ms` &lt; `s`. A useful mental model is: if 1 ns were 1 second, then 1 us would be ~17 minutes, 1 ms would be ~11.6 days, and 1 second would be ~31.7 years.

---

## Latency Numbers Every Programmer Should Know {#latency-numbers-every-programmer-should-know}

Latency changes by hardware, cloud provider, region, load, and implementation. The point is the order of magnitude: memory is nanoseconds, local disk/network is microseconds to milliseconds, and cross-region work is tens to hundreds of milliseconds.

<table class="study-table">
  <thead>
    <tr>
      <th>Operation</th>
      <th>Typical Latency</th>
      <th>Design Meaning</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>L1 cache reference</td>
      <td>~1 ns</td>
      <td>Fastest CPU-local access.</td>
    </tr>
    <tr>
      <td>Main memory reference</td>
      <td>~100 ns</td>
      <td>Still very fast; avoid unnecessary network calls before optimizing RAM access.</td>
    </tr>
    <tr>
      <td>Compress 1 KB with a fast codec</td>
      <td>~10 us</td>
      <td>Often cheaper than sending extra bytes over a slow network.</td>
    </tr>
    <tr>
      <td>Read 1 MB sequentially from memory</td>
      <td>~250 us</td>
      <td>Batching can be efficient when access is sequential.</td>
    </tr>
    <tr>
      <td>Same-AZ network round trip</td>
      <td>~0.2-1 ms</td>
      <td>Cheap enough for service calls, but still much slower than memory.</td>
    </tr>
    <tr>
      <td>SSD random read</td>
      <td>~100 us-1 ms</td>
      <td>Indexes and caches matter when random reads dominate.</td>
    </tr>
    <tr>
      <td>Read 1 MB sequentially from SSD</td>
      <td>~1-3 ms</td>
      <td>Sequential I/O is much cheaper than many small random I/Os.</td>
    </tr>
    <tr>
      <td>Cross-AZ network round trip</td>
      <td>~1-3 ms</td>
      <td>Good for HA, but can add visible tail latency if every request crosses AZs repeatedly.</td>
    </tr>
    <tr>
      <td>Database query on indexed hot data</td>
      <td>~1-10 ms</td>
      <td>Reasonable for user paths; watch p95/p99 and connection pool limits.</td>
    </tr>
    <tr>
      <td>Cross-region round trip</td>
      <td>~30-200 ms</td>
      <td>Avoid synchronous cross-region dependencies on latency-sensitive paths.</td>
    </tr>
    <tr>
      <td>Internet request from browser to origin</td>
      <td>~50-500 ms</td>
      <td>Use CDNs, caching, compression, and fewer round trips.</td>
    </tr>
  </tbody>
</table>

Rule of thumb: every synchronous dependency adds to tail latency. If a request path calls five services and each has a p99 of 100 ms, the end-to-end p99 can easily miss a 300 ms target even when the average looks healthy.

---

## Availability Numbers {#availability-numbers}

Availability is usually expressed as "number of nines". More nines reduce allowed downtime, but the cost and operational complexity rise quickly. For deeper SLA/SLO/SLI design, see [SLA, SLO & SLI](/study/systemDesignSlaSloSli).

<table class="study-table">
  <thead>
    <tr>
      <th>Availability</th>
      <th>Common Name</th>
      <th>Downtime / Year</th>
      <th>Downtime / Month</th>
      <th>Typical Design Implication</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>90%</td>
      <td>One nine</td>
      <td>~36.5 days</td>
      <td>~3 days</td>
      <td>Best effort; manual recovery may be acceptable.</td>
    </tr>
    <tr>
      <td>99%</td>
      <td>Two nines</td>
      <td>~3.65 days</td>
      <td>~7.3 hours</td>
      <td>Basic monitoring, backups, and restart procedures.</td>
    </tr>
    <tr>
      <td>99.9%</td>
      <td>Three nines</td>
      <td>~8.77 hours</td>
      <td>~43.8 minutes</td>
      <td>Redundancy, automated deploy rollback, clear on-call response.</td>
    </tr>
    <tr>
      <td>99.95%</td>
      <td>Three and a half nines</td>
      <td>~4.38 hours</td>
      <td>~21.9 minutes</td>
      <td>Multi-AZ, health checks, failover, error budgets.</td>
    </tr>
    <tr>
      <td>99.99%</td>
      <td>Four nines</td>
      <td>~52.6 minutes</td>
      <td>~4.4 minutes</td>
      <td>Automated recovery, no routine manual operations in the hot path.</td>
    </tr>
    <tr>
      <td>99.999%</td>
      <td>Five nines</td>
      <td>~5.26 minutes</td>
      <td>~26.3 seconds</td>
      <td>Multi-region or equivalent isolation, rigorous release safety, graceful degradation.</td>
    </tr>
  </tbody>
</table>

Important caveat: a system made of serial dependencies is only as strong as the combined path. Roughly:

```
System availability ~= Dependency A x Dependency B x Dependency C
```

So three required services that are each 99.9% available produce about 99.7% end-to-end availability before any fallback, caching, retry, or degradation strategy.
