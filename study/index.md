---
title: study
permalink: /study/
---

# study

Quick links:
- [system design]({{ '/study/systemDesign' | relative_url }})
- [recursion]({{ '/study/codingRecursion' | relative_url }})
- [dynamic programming]({{ '/study/codingDynamicProgramming' | relative_url }})

---

## all notes in /study
<ul>
{% assign all_pages = site.pages | sort: "title" %}
{% for p in all_pages %}
  {% if p.url contains '/study/' and p.url != '/study/' %}
    <li><a href="{{ p.url | relative_url }}">{{ p.title | default: p.url }}</a></li>
  {% endif %}
{% endfor %}
</ul>
