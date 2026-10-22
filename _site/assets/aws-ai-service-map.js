/* Shared service cards for the map, choosers, and connected examples. */
(() => {
  'use strict';
  const root = document.getElementById('service-map');
  if (!root) return;
  const page = root.closest('.content');
  const data = JSON.parse(document.getElementById('aws-map-data').textContent);
  const options = JSON.parse(document.getElementById('aws-options-data').textContent);
  const optionGroups = new Map(options.groups.map(group => [group.id, group]));
  const get = id => document.getElementById(`aws-${id}`);
  const order = data.zones.flatMap(zone => zone.stages.flatMap(stage => stage.keys));
  const layers = new Map(data.zones.flatMap(zone => zone.stages.flatMap(stage => stage.keys.map(key => [key, zone.title]))));
  const clusterHomes = new Map(data.zones.flatMap(zone => zone.stages.flatMap(stage => stage.keys.map(key => [key, stage.id]))));
  const dialog = document.getElementById('aws-map-dialog');
  const referenceDialog = document.getElementById('aws-reference-dialog');
  const referencePanels = [...referenceDialog.querySelectorAll('[data-reference-panel]')];
  if (typeof dialog.showModal !== 'function') return;
  let current = null;
  let opener = null;
  let referenceOpener = null;
  referencePanels.forEach(panel => {panel.hidden = true;});
  const comparisonRows = (key, group) => {
    const selection = options.coverage[key]?.rows?.[group.id];
    return selection ? selection.map(index => group.rows[index]) : group.rows;
  };
  const hay = key => {
    const card = data.cards[key];
    const samples = (card.samples || []).map(id => data.samples[id]);
    const coverage = options.coverage[key];
    const comparisons = (coverage?.groups || []).map(id => optionGroups.get(id));
    return [card.name, card.role, ...(card.details || []), card.useWhen, card.boundary, card.availability?.text, layers.get(key), coverage?.note, ...comparisons.flatMap(group => [group.title, group.note, ...comparisonRows(key, group).flat()]), ...samples.flatMap(sample => [sample.title, sample.code])].join(' ').toLowerCase();
  };
  function renderOptions(key) {
    const coverage = options.coverage[key];
    const container = get('card-options');
    container.replaceChildren();
    if (coverage?.note) {
      const note = document.createElement('p');
      note.textContent = coverage.note;
      container.append(note);
    }
    const sources = new Map();
    for (const id of coverage?.groups || []) {
      const group = optionGroups.get(id);
      const rows = comparisonRows(key, group);
      const section = document.createElement('section');
      section.dataset.option = id;
      const reference = coverage.references?.[id] || group.reference;
      sources.set(reference.url, reference);
      if (rows.length === 1) {
        const title = document.createElement('strong');
        title.textContent = rows[0][0];
        const note = document.createElement('p');
        note.append(title, ` · ${rows[0][1]}. Cost driver: ${rows[0][rows[0].length - 1]}.`);
        section.append(note);
        container.append(section);
        continue;
      }
      const table = document.createElement('table');
      const caption = table.createCaption();
      caption.textContent = group.title;
      const header = table.createTHead().insertRow();
      group.columns.forEach(column => {
        const cell = document.createElement('th');
        cell.scope = 'col';
        cell.textContent = column;
        header.append(cell);
      });
      const body = table.createTBody();
      rows.forEach(row => {
        const tr = body.insertRow();
        row.forEach((value, index) => {
          const cell = document.createElement(index === 0 ? 'th' : 'td');
          if (index === 0) cell.scope = 'row';
          cell.textContent = value;
          tr.append(cell);
        });
      });
      const scroll = document.createElement('div');
      scroll.className = 'aws-map__table-scroll';
      scroll.tabIndex = 0;
      scroll.role = 'region';
      scroll.setAttribute('aria-label', group.title);
      scroll.append(table);
      section.append(scroll);
      if (group.note) {
        const note = document.createElement('p');
        note.textContent = group.note;
        section.append(note);
      }
      container.append(section);
    }
    if (sources.size) {
      const references = document.createElement('p');
      references.className = 'aws-map__note';
      references.append('AWS options and rates: ');
      [...sources.values()].forEach((source, index) => {
        if (index) references.append(' · ');
        const link = document.createElement('a');
        link.href = source.url;
        link.textContent = source.title;
        references.append(link);
      });
      container.append(references);
    }
  }
  function matches(key) {
    const terms = get('map-search').value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return terms.every(term => hay(key).includes(term));
  }
  function filter() {
    const terms = get('map-search').value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const active = terms.length > 0;
    let count = 0;
    let guides = 0;
    // Preserve the architecture context, as in the original cluster map.
    page.querySelectorAll('.aws-map__tile[data-service]').forEach(tile => {
      const hit = matches(tile.dataset.service);
      tile.classList.toggle('is-dim', active && !hit);
      tile.classList.toggle('is-hit', active && hit);
      if (hit) count++;
    });
    page.querySelectorAll('.aws-map__tile[data-guide]').forEach(tile => {
      const guide = data.learningGuides[tile.dataset.guide];
      const text = [guide.title, guide.purpose, guide.keywords].join(' ').toLowerCase();
      const hit = terms.every(term => text.includes(term));
      tile.classList.toggle('is-dim', active && !hit);
      tile.classList.toggle('is-hit', active && hit);
      if (hit) guides++;
    });
    page.querySelectorAll('.aws-map__group').forEach(group => {
      group.classList.toggle('is-hit', active && terms.every(term => group.textContent.toLowerCase().includes(term)));
    });
    root.querySelector('.aws-map__empty').hidden = count + guides > 0;
    get('map-count').textContent = active ? `${count} of ${order.length} service cards · ${guides} visual guides match` : `${order.length} service cards · ${Object.keys(data.learningGuides).length} visual guides`;
  }
  function openReference(panel, source, target = panel) {
    if (!panel) return;
    if (!referenceDialog.open) referenceOpener = source || document.activeElement;
    if (dialog.open) dialog.close();
    referencePanels.forEach(item => {item.hidden = item !== panel;});
    document.getElementById('aws-reference-label').textContent = panel.dataset.title;
    referenceDialog.setAttribute('aria-label', panel.dataset.title);
    if (!referenceDialog.open) referenceDialog.showModal();
    referenceDialog.scrollTop = 0;
    if (target !== panel) {
      requestAnimationFrame(() => target.scrollIntoView({block:'start'}));
    }
  }
  function open(key, source) {
    const card = data.cards[key];
    if (!card) return;
    if (!dialog.open) opener = source || document.activeElement;
    if (referenceDialog.open) referenceDialog.close();
    current = key;
    get('card-title').textContent = card.name;
    get('card-layer').textContent = layers.get(key);
    get('card-role').textContent = card.role;
    get('card-details').replaceChildren(...(card.details || []).map(point => {
      const item = document.createElement('li');
      item.textContent = point;
      return item;
    }));
    get('card-use').textContent = card.useWhen;
    get('card-boundary').textContent = card.boundary;
    const availability = get('card-availability');
    availability.replaceChildren();
    availability.hidden = !card.availability;
    if (card.availability) {
      const source = document.createElement('a');
      source.href = card.availability.url;
      source.textContent = 'AWS availability notice ↗';
      availability.append(card.availability.text, ' ', source);
    }
    renderOptions(key);
    get('card-samples').replaceChildren(...(card.samples || []).map(id => {
      const sample = data.samples[id];
      const section = document.createElement('section');
      const title = document.createElement('strong');
      title.className = 'aws-map__sample-title';
      title.textContent = sample.title;
      const format = document.createElement('span');
      format.className = 'aws-map__sample-format';
      format.textContent = sample.format;
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.textContent = sample.code;
      pre.append(code);
      const note = document.createElement('p');
      note.className = 'aws-map__note';
      note.textContent = sample.note;
      section.append(title, format, pre, note);
      if (sample.source && sample.source !== card.doc) {
        const source = document.createElement('a');
        source.href = sample.source;
        source.className = 'aws-map__sample-source';
        source.textContent = 'Example reference ↗';
        section.append(source);
      }
      return section;
    }));
    get('card-reading').href = card.read;
    get('card-decisions').href = `#aws-cluster-${clusterHomes.get(key)}`;
    get('card-docs').hidden = !card.doc;
    if (card.doc) get('card-docs').href = card.doc;
    get('card-position').textContent = `${order.indexOf(key) + 1} / ${order.length}`;
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
  }
  function step(direction) {
    const visible = order.filter(matches);
    const sequence = visible.includes(current) ? visible : order;
    open(sequence[(sequence.indexOf(current) + direction + sequence.length) % sequence.length]);
  }
  page.addEventListener('click', event => {
    if (event.target.closest('.modal-trigger') && referenceDialog.open) referenceDialog.close();
    const link = event.target.closest('a[data-service],a[href^="#aws-service-"]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    open(link.dataset.service || link.hash.slice('#aws-service-'.length), link);
  });
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {current = null; if (!referenceDialog.open && opener?.isConnected && !opener.closest('dialog:not([open])')) opener.focus({preventScroll:true});});
  referenceDialog.querySelector('[data-close-reference]').addEventListener('click', () => referenceDialog.close());
  referenceDialog.addEventListener('click', event => {
    if (event.target !== referenceDialog) return;
    const rect = referenceDialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) referenceDialog.close();
  });
  referenceDialog.addEventListener('close', () => {
    if (!dialog.open && referenceOpener?.isConnected && !referenceOpener.closest('dialog:not([open])')) referenceOpener.focus({preventScroll:true});
  });
  function reveal(target, focus = false) {
    if (!target) return;
    document.dispatchEvent(new CustomEvent('aws-learning:reveal', {detail:{id:target.id}}));
    const reference = target.closest('[data-reference-panel]');
    if (reference) {openReference(reference, document.activeElement, target); return;}
    if (referenceDialog.open) referenceDialog.close();
    if (target.matches('.aws-service-section,.aws-service-section>h2') || target.closest('.aws-service-section[hidden]')) {get('map-search').value = ''; filter();}
    for (let parent = target; parent; parent = parent.parentElement) if (parent.tagName === 'DETAILS') parent.open = true;
    requestAnimationFrame(() => {
      target.scrollIntoView({block:'start'});
      if (focus) {target.setAttribute('tabindex','-1'); target.focus({preventScroll:true});}
    });
  }
  // Deep links and same-hash links must open notes before the browser scrolls.
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]:not([data-service]):not([href^="#aws-service-"])');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (!target) return;
    if (dialog.contains(link)) dialog.close();
    reveal(target, true);
  });
  get('card-prev').addEventListener('click', () => step(-1));
  get('card-next').addEventListener('click', () => step(1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {event.preventDefault(); step(event.key === 'ArrowRight' ? 1 : -1);}
  });
  get('map-search').addEventListener('input', filter);
  get('map-search').addEventListener('keydown', event => {
    if (event.key === 'Enter') {event.preventDefault(); const key = order.find(matches); if (key) open(key, event.currentTarget);}
    if (event.key === 'Escape') {event.currentTarget.value = ''; filter();}
  });
  get('map-reset').addEventListener('click', () => {get('map-search').value = ''; filter();});
  document.addEventListener('keydown', event => {
    if (event.key !== '/' || dialog.open || referenceDialog.open || event.ctrlKey || event.metaKey || event.altKey || event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
    event.preventDefault();
    get('map-search').focus();
  });
  function route() {
    const prefix = '#aws-service-';
    if (location.hash.startsWith(prefix)) open(location.hash.slice(prefix.length));
    else reveal(document.getElementById(decodeURIComponent(location.hash.slice(1))));
  }
  window.addEventListener('hashchange', route);
  page.querySelectorAll('a[data-service],a[href^="#aws-service-"]').forEach(link => link.setAttribute('aria-haspopup', 'dialog'));
  page.querySelectorAll('a[href^="#"]').forEach(link => {
    const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (target?.closest('[data-reference-panel]')) link.setAttribute('aria-haspopup', 'dialog');
  });
  root.querySelector('.aws-map__toolbar').hidden = false;
  filter();
  route();
})();
