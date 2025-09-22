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

<div style="display: grid; gap: 12px; margin: 20px 0;">
{% assign all_pages = site.pages | sort: "title" %}
{% for p in all_pages %}
  {% if p.url contains '/study/systemDesign' and p.url != '/study/' %}
    <div style="border: 1px solid #e1e5e9; border-radius: 8px; padding: 16px; background-color: #f8f9fa; transition: all 0.2s ease; cursor: pointer;" onmouseover="this.style.backgroundColor='#e3f2fd'; this.style.borderColor='#0366d6'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.backgroundColor='#f8f9fa'; this.style.borderColor='#e1e5e9'; this.style.transform='translateY(0)'; this.style.boxShadow='none';">
      <a href="{{ p.url | relative_url }}" style="text-decoration: none; color: #0366d6; font-weight: 500; font-size: 16px; display: block;">
        📚 {{ p.title | default: p.url }}
      </a>
    </div>
  {% endif %}
{% endfor %}
</div>


---

## LeetCode

The following are topic-specific coding interview study pages (auto-generated):

<div style="display: grid; gap: 12px; margin: 20px 0;">
{% assign all_pages = site.pages | sort: "title" %}
{% for p in all_pages %}
  {% if p.url contains '/study/coding' and p.url != '/study/' %}
    <div style="border: 1px solid #e1e5e9; border-radius: 8px; padding: 16px; background-color: #f8f9fa; transition: all 0.2s ease; cursor: pointer;" onmouseover="this.style.backgroundColor='#e8f5e8'; this.style.borderColor='#28a745'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.backgroundColor='#f8f9fa'; this.style.borderColor='#e1e5e9'; this.style.transform='translateY(0)'; this.style.boxShadow='none';">
      <a href="{{ p.url | relative_url }}" style="text-decoration: none; color: #0366d6; font-weight: 500; font-size: 16px; display: block;">
        💻 {{ p.title | default: p.url }}
      </a>
    </div>
  {% endif %}
{% endfor %}
</div>

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
