---
title: projects
permalink: /projects/
---

## /projects
<ul>
{% assign all_pages = site.pages | sort: "title" %}
{% for p in all_pages %}
  {% if p.url contains '/projects/' and p.url != '/projects/' %}
    <li><a href="{{ p.url | relative_url }}">{{ p.title | default: p.url }}</a></li>
  {% endif %}
{% endfor %}
</ul>
