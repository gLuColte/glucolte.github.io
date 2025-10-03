---
title: study
permalink: /study/
---

# /study {#study}

A home for study resources, with a focus on **coding interview prep**.  
Think of this page as your **mental compass** — quick reminders on *how to think* before diving into the categories.

---

## Infrastructure & Cloud {#infrastructure-cloud}

The following are infrastructure and cloud services study pages:

<div class="study-tiles">
{% assign all_pages = site.pages | sort: "title" %}
{% for p in all_pages %}
  {% if p.url contains '/study/infrastructure' %}
    <a href="{{ p.url | relative_url }}" class="study-tile system-design">
      <div class="study-tile-title">
        <span class="study-tile-icon">🏗️</span>
        {{ p.title | default: p.url }}
      </div>
    </a>
  {% endif %}
{% endfor %}
</div>

---

## System Design Fundamentals {#system-design-fundamentals}

The following are system design fundamentals study pages:

<div class="study-tiles">
{% assign all_pages = site.pages | sort: "title" %}
{% for p in all_pages %}
  {% if p.url contains '/study/systemDesign' and p.url != '/study/' %}
    <a href="{{ p.url | relative_url }}" class="study-tile system-design">
      <div class="study-tile-title">
        <span class="study-tile-icon">📊</span>
        {{ p.title | default: p.url }}
      </div>
    </a>
  {% endif %}
{% endfor %}
</div>


---

## AI {#ai}

The following are AI study pages:

<div class="study-tiles">
{% assign all_pages = site.pages | sort: "title" %}
{% for p in all_pages %}
  {% if p.url contains '/study/ai' and p.url != '/study/' %}
    <a href="{{ p.url | relative_url }}" class="study-tile system-design">
      <div class="study-tile-title">
        <span class="study-tile-icon">🤖</span>
        {{ p.title | default: p.url }}
      </div>
    </a>
  {% endif %}
{% endfor %}
</div>

---

## Troubleshooting Practices {#troubleshooting-practices}

Practice your debugging and troubleshooting skills with hands-on Linux server challenges:

<div class="study-tiles">
  <a href="https://sadservers.com/" target="_blank" class="study-tile system-design">
    <div class="study-tile-title">
      <span class="study-tile-icon">🔧</span>
      SadServers - "Like LeetCode for Linux"
    </div>
    <div style="font-size: 14px; color: var(--muted); margin-top: 8px;">
      Excellent for SRE/DevOps interview preparation. Get a full remote Linux server with a problem and fix it!
    </div>
  </a>
</div>

---

## LeetCode {#leetcode}

The following are topic-specific coding interview study pages:

<div class="study-tiles">
{% assign all_pages = site.pages | sort: "title" %}
{% for p in all_pages %}
  {% if p.url contains '/study/coding' and p.url != '/study/' %}
    <a href="{{ p.url | relative_url }}" class="study-tile coding">
      <div class="study-tile-title">
        <span class="study-tile-icon">💻</span>
        {{ p.title | default: p.url }}
      </div>
    </a>
  {% endif %}
{% endfor %}
</div>
