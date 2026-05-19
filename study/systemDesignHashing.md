---
title: Hashing
permalink: /study/systemDesignHashing
---

# Hashing {#hashing}

Hashing is one of the most useful ideas in coding interviews and system design. In coding interviews, it powers hash maps, sets, frequency counting, grouping, and fast lookup. In system design, it helps distribute keys across servers, shards, caches, and streams.

This page starts from first principles and builds toward practical interview use.

---

## 1. What Is Hashing? {#what-is-hashing}

Hashing converts an input, often called a **key**, into a fixed-size or numeric value using a **hash function**.

```text
key -> hash function -> hash value
```

Examples:

```text
"abc"      -> hash function -> some number
"user_123" -> hash function -> some number
"file.png" -> hash function -> some number
```

For deterministic hashing, the same input should produce the same output:

```text
hash("abc") = 96354
hash("abc") = 96354
hash("abc") = 96354
```

Important ideas:

- Hashing is **not encryption**.
- Hashing is usually **one-way**: you should not expect to recover the original input from the hash.
- Different inputs can sometimes produce the same hash value. This is called a **collision**.

```text
"abc"  -> hash -> 42
"xyz"  -> hash -> 42

collision: two different keys produced the same hash value
```

In interviews, hashing usually means: "Can I turn this value into something I can look up quickly?"

---

## 2. What Does `serverIndex = hash % N` Mean? {#what-does-serverindex-hash-n-mean}

In system design, hashing is often used to decide where a key should live.

```text
serverIndex = hash(key) % N
```

Where:

- `key` is something like a user ID, request ID, file ID, or cache key.
- `hash(key)` converts the key into a number.
- `N` is the number of servers, shards, or buckets.
- `% N` maps the number into a valid index from `0` to `N - 1`.

Example:

```text
hash("user_123") = 17
N = 4

17 % 4 = 1

"user_123" goes to server 1
```

Diagram:

```text
              +----------+
"user_123" -> | hash()   | -> 17
              +----------+
                    |
                    v
                 17 % 4
                    |
                    v
               server 1
```

The problem is that changing `N` changes the result:

```text
17 % 4 = 1
17 % 5 = 2
```

So if you add or remove servers, many keys may move to different servers. This is why simple modulo hashing is easy to understand but painful when the server count changes often.

This motivates **consistent hashing**, covered later.

---

## 3. How Does a String Become a Number? {#how-does-a-string-become-a-number}

Computers already represent characters as numbers. In Python, `ord()` gives the Unicode code point for a character:

```python
print(ord("a"))  # 97
print(ord("b"))  # 98
print(ord("你")) # 20320
```

A basic hash function can combine these character numbers into one final number.

Educational example:

```python
def simple_hash(key: str) -> int:
    hash_value = 0
    for char in key:
        hash_value = hash_value * 31 + ord(char)
    return hash_value


print(simple_hash("abc"))
```

Manual walkthrough for `"abc"`:

```text
start = 0

'a' -> 97
hash = 0 * 31 + 97 = 97

'b' -> 98
hash = 97 * 31 + 98 = 3105

'c' -> 99
hash = 3105 * 31 + 99 = 96354
```

Why multiply by `31`?

Multiplication makes character order matter.

Without multiplication, `"abc"` and `"cba"` could easily collapse into similar values because you are mostly adding character numbers. With multiplication, earlier characters get carried forward and affect the final number more.

```text
"abc" and "cba" contain the same letters,
but their positions should produce different hash values.
```

This `simple_hash()` function is for learning only. Real hash functions handle overflow, distribution, speed, and collision behavior much more carefully.

---

## 4. Hash Tables / Hash Maps {#hash-tables-hash-maps}

A hash table stores key-value pairs using hashing.

```text
key -> hash -> bucket index -> store/find value
```

Example:

```text
"user_123" -> hash -> 17
17 % bucket_count -> bucket 1
bucket 1 contains the value for "user_123"
```

In Python:

- `dict` is a hash map.
- `set` is a hash set.

Example:

```python
users = {
    "user_123": "Gary",
    "user_456": "Alice",
}

print(users["user_123"])
```

Conceptually, Python uses hashing to locate `"user_123"` quickly instead of scanning every key one by one.

Common operations:

<table class="study-table">
  <thead>
    <tr>
      <th>Operation</th>
      <th>Average Time</th>
      <th>Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Insert</td>
      <td>O(1)</td>
      <td>Add a key-value pair.</td>
    </tr>
    <tr>
      <td>Lookup</td>
      <td>O(1)</td>
      <td>Find value by key.</td>
    </tr>
    <tr>
      <td>Delete</td>
      <td>O(1)</td>
      <td>Remove key-value pair.</td>
    </tr>
  </tbody>
</table>

Worst case can degrade if many keys collide into the same bucket. Real hash tables use collision-handling strategies such as:

- **Chaining:** each bucket stores a list of entries.
- **Open addressing:** if a bucket is occupied, probe another bucket.

Simple chaining diagram:

```text
bucket 0 -> []
bucket 1 -> [("user_123", "Gary"), ("user_999", "Bob")]
bucket 2 -> []
bucket 3 -> [("user_456", "Alice")]
```

---

## 5. Common Interview Patterns Using Hashing {#common-interview-patterns-using-hashing}

<table class="study-table">
  <thead>
    <tr>
      <th>Pattern</th>
      <th>Data Structure</th>
      <th>Example Problem</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Existence check</td>
      <td><code>set</code></td>
      <td>Find duplicates</td>
    </tr>
    <tr>
      <td>Value to index</td>
      <td><code>dict</code></td>
      <td>Two Sum</td>
    </tr>
    <tr>
      <td>Frequency count</td>
      <td><code>dict</code> / <code>Counter</code></td>
      <td>Valid Anagram</td>
    </tr>
    <tr>
      <td>Grouping</td>
      <td><code>defaultdict(list)</code></td>
      <td>Group Anagrams</td>
    </tr>
    <tr>
      <td>Sliding window memory</td>
      <td><code>dict</code> / <code>set</code></td>
      <td>Longest substring without repeating characters</td>
    </tr>
  </tbody>
</table>

### Two Sum {#two-sum}

```python
def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}  # value -> index

    for i, num in enumerate(nums):
        need = target - num
        if need in seen:
            return [seen[need], i]
        seen[num] = i

    return []
```

Complexity:

- Time: `O(n)`
- Space: `O(n)`

Why hashing helps: each complement lookup is average `O(1)`.

### Count Frequency {#count-frequency}

```python
from collections import Counter


def char_frequency(s: str) -> Counter:
    return Counter(s)


print(char_frequency("banana"))
```

Complexity:

- Time: `O(n)`
- Space: `O(k)`, where `k` is the number of unique characters.

### Group Anagrams {#group-anagrams}

```python
from collections import defaultdict


def group_anagrams(words: list[str]) -> list[list[str]]:
    groups = defaultdict(list)

    for word in words:
        key = "".join(sorted(word))
        groups[key].append(word)

    return list(groups.values())
```

Complexity:

- Time: `O(n * m log m)`, where `n` is number of words and `m` is average word length.
- Space: `O(n * m)` for grouped output and keys.

Why hashing helps: the sorted word becomes a dictionary key for grouping.

### Detect Duplicate {#detect-duplicate}

```python
def has_duplicate(nums: list[int]) -> bool:
    seen = set()

    for num in nums:
        if num in seen:
            return True
        seen.add(num)

    return False
```

Complexity:

- Time: `O(n)`
- Space: `O(n)`

---

## 6. Hashing in System Design {#hashing-in-system-design}

Practical uses:

- **Sharding:** decide which database shard owns a key.
- **Caching:** decide which cache node stores a key.
- **Load balancing:** route related requests consistently.
- **Request routing:** send a request to the same backend based on user/session key.
- **Deduplication:** identify repeated files, events, or payloads.
- **Checksums:** detect accidental data changes.
- **Consistent hashing:** reduce key movement when servers change.

Stable hash example:

```python
import hashlib


def stable_hash_to_int(key: str) -> int:
    digest = hashlib.sha256(key.encode("utf-8")).hexdigest()
    return int(digest, 16)


def choose_server(key: str, num_servers: int) -> int:
    return stable_hash_to_int(key) % num_servers


print(choose_server("user_123", 4))
```

Important: do **not** use Python's built-in `hash()` for distributed systems.

Python randomizes string hash values between processes/runs for security. That means this can change:

```python
print(hash("user_123"))
```

For distributed systems, use a stable hash such as:

- SHA-256
- MurmurHash
- xxHash
- CityHash

Use cryptographic hashes when integrity/security matters. Use fast non-cryptographic hashes when performance matters and security is not the goal.

---

## 7. Consistent Hashing {#consistent-hashing}

Simple modulo hashing:

```text
hash(key) % N
```

Problem:

```text
N changes -> many keys move
```

Example:

```text
hash("user_123") = 17

17 % 4 = 1
17 % 5 = 2
```

Adding one server changed the destination from server `1` to server `2`.

Consistent hashing reduces this movement.

Mental model:

```text
              hash ring

                 [S1]
             /           \
        keyA               [S2]
         |                   |
         v                   v
      next server        next server
             \           /
                 [S3]
```

How it works:

- Imagine a ring of hash values.
- Servers are placed on the ring using a hash of the server ID.
- Keys are placed on the same ring using a hash of the key.
- A key goes to the next server clockwise.

Example:

```text
key -> hash -> position on ring
server -> hash -> position on ring

key belongs to the first server found clockwise
```

Why this helps:

- When a server is added, only nearby keys move to it.
- When a server is removed, only its keys move to the next server.
- Most keys stay where they were.

Consistent hashing is useful for:

- Distributed caches
- Distributed databases
- Request routing
- Storage systems

Virtual nodes:

Real systems often place each physical server on the ring multiple times as **virtual nodes**.

```text
Server A -> A1, A2, A3
Server B -> B1, B2, B3
Server C -> C1, C2, C3
```

This improves distribution and reduces the chance that one server gets too many keys.

---

## 8. Replication, Quorums, and `N/R/W` {#replication-quorums-and-nrw}

Hashing answers:

```text
Which node should own this key?
```

Replication and quorum settings answer:

```text
How many copies exist, and how many must agree before a read/write succeeds?
```

Common terms:

- `N` = replication factor, the number of nodes that store a copy of the data.
- `W` = write quorum, the number of replicas that must confirm a write.
- `R` = read quorum, the number of replicas that must respond to a read.

Example with `N = 3`:

```text
key = "user_123"

consistent hashing chooses primary node:
user_123 -> Node A

replication stores copies on:
Node A, Node B, Node C
```

Now the system can tune `R` and `W`.

<table class="study-table">
  <thead>
    <tr>
      <th>Setting</th>
      <th>Meaning</th>
      <th>Optimized For</th>
      <th>Tradeoff</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>R = 1, W = N</code></td>
      <td>All replicas must accept writes; reads need only one replica.</td>
      <td>Fast reads</td>
      <td>Writes are slower and less available because every replica must be reachable.</td>
    </tr>
    <tr>
      <td><code>R = N, W = 1</code></td>
      <td>Writes need one replica; reads check all replicas.</td>
      <td>Fast writes</td>
      <td>Reads are slower and less available because every replica must be reachable.</td>
    </tr>
    <tr>
      <td><code>R + W &gt; N</code></td>
      <td>Read and write quorums overlap on at least one replica.</td>
      <td>Stronger consistency</td>
      <td>Higher latency and lower availability than weaker quorum settings.</td>
    </tr>
    <tr>
      <td><code>R + W &lt;= N</code></td>
      <td>Read and write quorums might not overlap.</td>
      <td>Lower latency / higher availability</td>
      <td>Reads may return stale data.</td>
    </tr>
  </tbody>
</table>

Why `R + W > N` matters:

```text
N = 3
W = 2
R = 2

W + R = 4
4 > 3
```

If a write succeeds on 2 replicas, and a read checks 2 replicas, the read must overlap with at least one replica that saw the latest successful write.

```text
Replicas: A, B, C

Write quorum: A, B
Read quorum:  B, C

Overlap: B
```

That overlap is what gives stronger consistency.

Important nuance: people often say `R + W > N` gives "strong consistency", but in real systems it also depends on implementation details such as conflict resolution, read repair, hinted handoff, sloppy quorums, clocks, leader/leaderless design, and whether reads always choose the newest version. For interviews, the safe wording is:

```text
R + W > N gives quorum overlap, which supports stronger consistency.
```

Quick examples:

- `N = 3, W = 2, R = 2`: balanced quorum, stronger consistency.
- `N = 3, W = 3, R = 1`: read-optimized because reads are fast, but writes require all replicas.
- `N = 3, W = 1, R = 3`: write-optimized because writes are fast, but reads require all replicas.
- `N = 3, W = 1, R = 1`: fastest and most available, but stale reads are possible.

Interview framing:

```text
Hashing decides where data is placed.
Replication decides how many copies exist.
R/W quorum decides the consistency vs latency/availability tradeoff.
```

---

## 9. Where Hashing Shows Up {#where-hashing-shows-up}

Hashing appears in many places, not just coding interview hash maps. In interviews, recognize the pattern: a system has a key, hashes it, and uses the result to find, group, route, verify, or distribute something.

<table class="study-table">
  <thead>
    <tr>
      <th>Area</th>
      <th>Example</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Programming language data structures</td>
      <td>Python <code>dict</code>, Java <code>HashMap</code></td>
    </tr>
    <tr>
      <td>Relational databases</td>
      <td>Hash indexes, hash joins, partitioning/sharding</td>
    </tr>
    <tr>
      <td>NoSQL databases</td>
      <td>DynamoDB partition keys, Cassandra partitioning, Redis Cluster hash slots</td>
    </tr>
    <tr>
      <td>Caching</td>
      <td>Decide which cache node stores a key</td>
    </tr>
    <tr>
      <td>Load balancing</td>
      <td>Route the same user, session, or request key to the same backend</td>
    </tr>
    <tr>
      <td>Distributed systems</td>
      <td>Sharding, consistent hashing, data placement</td>
    </tr>
    <tr>
      <td>Security</td>
      <td>Password hashing, file integrity checks, signed payload verification</td>
    </tr>
    <tr>
      <td>Storage systems</td>
      <td>Deduplication, checksums, content-addressed storage</td>
    </tr>
    <tr>
      <td>Message streaming</td>
      <td>Route events to partitions/shards, e.g. by user ID</td>
    </tr>
    <tr>
      <td>Probabilistic data structures</td>
      <td>Bloom filters use multiple hashes to test whether an item was probably seen before</td>
    </tr>
  </tbody>
</table>

---

## 10. Which Hashing Should You Use? {#which-hashing-should-you-use}

Different hashing algorithms are built for different jobs. In interviews, the important thing is not memorizing every algorithm; it is knowing when you need speed, stability, security, or password protection.

Rules of thumb:

- For coding interview hash maps/sets, use the language built-ins.
- For distributed systems, use a stable hash. Do not use Python `hash()`.
- For security, use cryptographic hashes or HMACs.
- For passwords, use password hashing algorithms, not normal hashes.
- For very high-throughput routing, prefer fast non-cryptographic hashes unless security is required.

---

## 11. Different Types of Hashing Algorithms {#different-types-of-hashing-algorithms}

<table class="study-table">
  <thead>
    <tr>
      <th>Type</th>
      <th>Examples</th>
      <th>Used For</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Non-cryptographic hash</td>
      <td>MurmurHash, xxHash, CityHash</td>
      <td>Fast lookup, sharding, routing</td>
    </tr>
    <tr>
      <td>Cryptographic hash</td>
      <td>SHA-256, SHA-512</td>
      <td>Integrity, signatures, content identity</td>
    </tr>
    <tr>
      <td>Password hashing</td>
      <td>bcrypt, scrypt, Argon2</td>
      <td>Password storage</td>
    </tr>
  </tbody>
</table>

Key points:

- Fast hashes are good for performance but not security.
- Cryptographic hashes are slower but safer for integrity/security.
- Password hashing must be intentionally slow and salted.

Password example idea:

```text
Bad:  password -> SHA-256 -> store hash
Good: password -> bcrypt/scrypt/Argon2 with salt -> store password hash
```

---

## 12. AWS / Cloud References {#aws-cloud-references}

> TODO: Verify AWS-specific details against official AWS documentation before publishing.

Hashing-like ideas appear in many cloud systems:

- **DynamoDB partition key:** the partition key is hashed to determine physical partition placement.
- **S3 object key distribution:** object keys are distributed internally; historically key naming patterns mattered more, but modern S3 automatically scales request rates.
- **ElastiCache / Redis Cluster:** keys are assigned to hash slots.
- **Load balancers:** some algorithms/configurations may use hashing-like routing to keep related requests on the same target.
- **Kinesis partition key:** the partition key determines which shard receives the record.

Interview framing:

```text
If the service needs to distribute records by key,
ask: what is the key, how is it hashed, and what happens when capacity changes?
```

---

## 13. Common Pitfalls {#common-pitfalls}

- Confusing hashing with encryption.
- Assuming hashes are always unique.
- Forgetting collisions.
- Using Python `hash()` for distributed systems.
- Using `% N` when server count changes frequently.
- Using SHA-256 for high-throughput non-security routing when a faster hash may be better.
- Storing passwords with normal hashes instead of password hashing algorithms.
- Forgetting that a bad hash function can create uneven distribution.
- Forgetting that hot keys can overload one shard even if hashing is correct.

---

## 14. Interview Cheat Sheet {#interview-cheat-sheet}

Coding interviews:

- Use `set` for existence checks.
- Use `dict` for mapping.
- Use `Counter` / `defaultdict` for frequency and grouping.
- Hashing gives average `O(1)` lookup, insert, and delete.
- Always think about collisions, even if Python handles them internally.

System design:

- Use hashing to distribute keys.
- `hash % N` is simple but bad when `N` changes.
- Consistent hashing reduces movement when servers are added or removed.
- Choose stable hash functions for distributed systems.
- Watch for hot keys and uneven partitions.

Security:

- Hashing is not encryption.
- Hashing is usually one-way.
- Cryptographic hashes are for integrity and identity.
- Passwords need bcrypt, scrypt, or Argon2.

Quick mental model:

```text
Coding:
key -> hash -> bucket -> fast lookup

System design:
key -> stable hash -> shard/cache/server

Security:
input -> cryptographic hash -> integrity check
password -> slow salted password hash -> safe password storage
```
