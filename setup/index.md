---
title: setup
permalink: /setup/
---

## /setup
<ul>
{% assign all_pages = site.pages | sort: "title" %}
{% for p in all_pages %}
  {% if p.url contains '/setup/' and p.url != '/setup/' %}
    <li><a href="{{ p.url | relative_url }}">{{ p.title | default: p.url }}</a></li>
  {% endif %}
{% endfor %}
</ul>
