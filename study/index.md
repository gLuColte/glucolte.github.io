---
title: study
permalink: /study/
---

# /study

A home for study resources, with a focus on **coding interview prep**.  
Think of this page as your **mental compass** — quick reminders on *how to think* before diving into the categories.

---

## LeetCode

### 🧭 Mindset for Problem Solving
- **Restate the problem** in your own words. Clarify input, output, and constraints.  
- **Spot the structure:**  
  - Array / String → two pointers, sliding window, hashing.  
  - Linked list → pointer tricks.  
  - Tree → DFS recursion, or BFS levels.  
  - Graph / Grid → BFS/DFS, Union-Find, Dijkstra.  
  - "Max/Min/Ways" → Dynamic Programming.  
  - "All possibilities" → Backtracking.  
- **Start simple, then optimize.** First find a brute force, then reduce complexity.  
- **Trace with examples.** Work through 2–3 small cases before coding.  
- **Ask yourself:** Is this problem about *searching*, *counting*, *optimizing*, or *enumerating*?
- If you are struggling for more than 15 minutes, check the solution, walk through and understand it, move on.
  - Leetcode is designed to be solved in 30 minutes-ish, if you can't solve it, don't dwell on it.

### ⏱ Complexity Rules (Cheat-Sheet)
- **Additive:** independent steps add → `O(n + m)`.  
- **Multiplicative:** nested loops multiply → `O(n × m)`.  
- **Sorting:** `O(n log n)` baseline.  
- **Graphs:**  
  - BFS/DFS = `O(n + m)` (nodes + edges).  
  - Dijkstra (heap) = `O((n + m) log n)`.  
- **Hashing:** avg `O(1)` for lookup/insert.  
- **Divide & Conquer:** often `O(n log n)`.  

👉 Always tie complexity back to **input size**.

### Topic-Specific Study Pages
The following are topic-specific coding interview study pages (auto-generated):

<ul>
{% assign all_pages = site.pages | sort: "title" %}
{% for p in all_pages %}
  {% if p.url contains '/study/coding' and p.url != '/study/' %}
    <li><a href="{{ p.url | relative_url }}">{{ p.title | default: p.url }}</a></li>
  {% endif %}
{% endfor %}
</ul>

---

## System Design
The following are system design study pages (auto-generated):

<ul>
{% assign all_pages = site.pages | sort: "title" %}
{% for p in all_pages %}
  {% if p.url contains '/study/systemDesign' and p.url != '/study/' %}
    <li><a href="{{ p.url | relative_url }}">{{ p.title | default: p.url }}</a></li>
  {% endif %}
{% endfor %}
</ul>

### Placeholder Sections
*Coming soon - these topics will be added:*

- **Scalability Fundamentals** - Load balancing, caching, CDNs
- **Database Design** - SQL vs NoSQL, sharding, replication
- **Microservices Architecture** - Service communication, API design
- **Real-time Systems** - WebSockets, message queues, event streaming
- **Security & Authentication** - OAuth, JWT, rate limiting
- **Monitoring & Observability** - Logging, metrics, distributed tracing
