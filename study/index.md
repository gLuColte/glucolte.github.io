---
title: study
permalink: /study/
---

# /study

A home for study resources, with a focus on **coding interview prep**.  
Think of this page as your **mental compass** — quick reminders on *how to think* before diving into the categories.

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


---

## LeetCode

The following are topic-specific coding interview study pages (auto-generated):

<ul>
{% assign all_pages = site.pages | sort: "title" %}
{% for p in all_pages %}
  {% if p.url contains '/study/coding' and p.url != '/study/' %}
    <li><a href="{{ p.url | relative_url }}">{{ p.title | default: p.url }}</a></li>
  {% endif %}
{% endfor %}
</ul>

In general:
* Restate the problem in your own words; clarify input, output, constraints.
* Identify the structure: 
  * arrays/strings → two pointers, sliding window, hashing; 
  * linked lists → pointer tricks; trees → DFS/BFS;
  * graphs/grids → BFS/DFS, Union-Find, Dijkstra;
  * max/min/ways → dynamic programming;
  * all possibilities → backtracking.
* Start simple with brute force, then optimize.
* Trace small examples (2–3 cases) before coding.
* If stuck >15 minutes, check the solution, understand it, then move on (LeetCode \~30 mins/problem).
* Complexity rules: additive = `O(n + m)`, nested = `O(n × m)`, sorting = `O(n log n)`, BFS/DFS = `O(n + m)`, Dijkstra = `O((n + m) log n)`, hashing avg `O(1)`, divide & conquer \~`O(n log n)`.
* Always tie complexity back to input size.
