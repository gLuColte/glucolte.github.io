{% assign option_group = site.data.aws_service_options.groups | where: 'id', include.id | first %}
###### {{ option_group.title }} {#aws-options-{{ option_group.id }}}

| {% for column in option_group.columns %}{{ column }} | {% endfor %}
|{% for column in option_group.columns %}---|{% endfor %}
{% for row in option_group.rows %}| {% for cell in row %}{{ cell | replace: '|', '\|' }} | {% endfor %}
{% endfor %}
{% if option_group.note != empty %}{{ option_group.note }}

{% endif %}AWS references: [{{ option_group.sources.first.title }}]({{ option_group.sources.first.url }}) · [{{ option_group.reference.title }}]({{ option_group.reference.url }}).

