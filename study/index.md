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
{% assign pages_in_study = site.pages | where_exp: "p", "p.url != '/study/' and p.url contains '/study/'" %}
{% assign sorted = pages_in_study | sort: "title" %}
{% for p in sorted %}
  <li><a href="{{ p.url | relative_url }}">{{ p.title | default: p.url }}</a></li>
{% endfor %}
</ul>
