---
title: study
permalink: /study/
---

# /study

A home for study resources, with a focus on **coding interview prep**.  
Think of this page as your **mental compass** — quick reminders on *how to think* before diving into the categories.

---

## 🧭 Mindset for Problem Solving
- **Restate the problem** in your own words. Clarify input, output, and constraints.  
- **Spot the structure:**  
  - Array / String → two pointers, sliding window, hashing.  
  - Linked list → pointer tricks.  
  - Tree → DFS recursion, or BFS levels.  
  - Graph / Grid → BFS/DFS, Union-Find, Dijkstra.  
  - “Max/Min/Ways” → Dynamic Programming.  
  - “All possibilities” → Backtracking.  
- **Start simple, then optimize.** First find a brute force, then reduce complexity.  
- **Trace with examples.** Work through 2–3 small cases before coding.  
- **Ask yourself:** Is this problem about *searching*, *counting*, *optimizing*, or *enumerating*?

---

## ⏱ Complexity Rules (Cheat-Sheet)
- **Additive:** independent steps add → `O(n + m)`.  
- **Multiplicative:** nested loops multiply → `O(n × m)`.  
- **Sorting:** `O(n log n)` baseline.  
- **Graphs:**  
  - BFS/DFS = `O(n + m)` (nodes + edges).  
  - Dijkstra (heap) = `O((n + m) log n)`.  
- **Hashing:** avg `O(1)` for lookup/insert.  
- **Divide & Conquer:** often `O(n log n)`.  

👉 Always tie complexity back to **input size**.

---

## Coding Sections
The following are topic-specific study pages (auto-generated):

<ul>
{% assign all_pages = site.pages | sort: "title" %}
{% for p in all_pages %}
  {% if p.url contains '/study/coding' and p.url != '/study/' %}
    <li><a href="{{ p.url | relative_url }}">{{ p.title | default: p.url }}</a></li>
  {% endif %}
{% endfor %}
</ul>
