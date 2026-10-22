{% assign zone = site.data.aws_ai_service_map.zones | where: 'id', include.zone_id | first %}
{% for id in zone.decisionAliases %}<span id="aws-choice-{{ id }}"></span>
{% endfor %}
**{{ zone.choice.title }}**

| Requirement | Start with |
|---|---|
{% for row in zone.choice.rows %}| {{ row.need | replace: '|', '\|' }} | {% for key in row.keys %}{% assign card = site.data.aws_ai_service_map.cards[key] %}[{{ card.name }}](#aws-service-{{ key }}){% unless forloop.last %}, {% endunless %}{% endfor %} — {{ row.decision | replace: '|', '\|' }} |
{% endfor %}
{% if zone.guide %}[{{ zone.guide.text }}]({{ zone.guide.href }})
{% endif %}
{% for choice in zone.moreChoices %}
##### {{ choice.title }} {#aws-choice-{{ choice.id }}}

| Requirement | Start with |
|---|---|
{% for row in choice.rows %}| {{ row.need | replace: '|', '\|' }} | {% for key in row.keys %}{% assign card = site.data.aws_ai_service_map.cards[key] %}[{{ card.name }}](#aws-service-{{ key }}){% unless forloop.last %}, {% endunless %}{% endfor %} — {{ row.decision | replace: '|', '\|' }} |
{% endfor %}
{% if choice.foot != empty %}{{ choice.foot }}
{% endif %}
{% endfor %}
