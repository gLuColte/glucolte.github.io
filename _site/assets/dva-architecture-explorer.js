(() => {
  'use strict';
  const root = document.getElementById('dva-scope-explorer');
  const source = document.getElementById('dva-scope-data');
  if (!root || !source) return;
  const data = JSON.parse(source.textContent);
  const cards = JSON.parse(document.getElementById('dva-study-data').textContent).cards;
  const get = name => document.getElementById(`dva-scope-${name}`);
  const svg = get('canvas');
  const nodes = new Map(data.nodes.map(node => [node.id, node]));
  const groups = new Map(data.groups.map(group => [group.id, group]));
  const edges = new Map(data.relationships.map(edge => [edge.id, edge]));
  const kinds = {
    network: ['Network traffic', 'NET'], api: ['API / protocol call', 'API'],
    event: ['Event / message delivery', 'EVT'], replication: ['Replication / index update', 'REP'],
    attachment: ['Attachment / association', 'ATT'], authorization: ['Identity / authorization', 'AUTH'],
    deployment: ['Deployment / control', 'DEP'], monitoring: ['Telemetry / audit', 'LOG']
  };
  const state = {selected: 'lambda', scenario: '', comparison: '', step: 0, category: '', search: '', overview: true, all: false, running: false, elapsed: 0, lastFrame: 0, collapsed: new Set(), types: new Set(Object.keys(kinds))};
  let view = {x: 0, y: 0, w: data.width, h: data.height};
  let frame = 0;
  let packet = null;
  let currentPath = null;
  const pathCache = new Map();
  const ns = 'http://www.w3.org/2000/svg';
  function html(tag, text, className) {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  }
  function shape(tag, attributes = {}, text) {
    const element = document.createElementNS(ns, tag);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
    if (text !== undefined) element.textContent = text;
    return element;
  }
  const scenario = () => data.scenarios.find(item => item.id === state.scenario);
  const comparison = () => data.comparisons.find(item => item.id === state.comparison);
  function ancestors(groupId) {
    const result = [];
    for (let group = groups.get(groupId); group; group = groups.get(group.parent)) result.push(group.id);
    return result;
  }
  const hiddenNode = node => ancestors(node.group).some(id => state.collapsed.has(id));
  function expandFor(ids) {
    ids.forEach(id => ancestors(nodes.get(id).group).forEach(group => state.collapsed.delete(group)));
  }
  function sceneNodes(entry) {
    return new Set(entry.steps.flatMap(step => [edges.get(step.edge).source, edges.get(step.edge).target]));
  }
  function relatedIds() {
    if (state.search) {
      const query = state.search.toLowerCase();
      const matches = data.nodes.filter(node => {
        const text = [node.id, node.label, cards[node.card]?.name || '', ...node.features].join(' ').toLowerCase();
        return query.length <= 3 ? (text.match(/[a-z0-9]+/g) || []).includes(query) : text.includes(query) || query.length > 4 && query.endsWith('s') && text.includes(query.slice(0, -1));
      });
      matches.sort((a, b) => Number(b.label.toLowerCase() === query) - Number(a.label.toLowerCase() === query));
      return new Set(matches.map(node => node.id));
    }
    const compare = comparison();
    if (compare) return new Set([...compare.left, ...compare.right]);
    if (get('study').checked) return new Set(data.study[Number(get('question').value)].nodes);
    if (state.category) return new Set(data.nodes.filter(node => node.category === state.category).map(node => node.id));
    const entry = scenario();
    if (entry) return sceneNodes(entry);
    if (state.overview) return new Set(data.nodes.map(node => node.id));
    return new Set([state.selected, ...data.relationships.filter(edge => edge.source === state.selected || edge.target === state.selected).flatMap(edge => [edge.source, edge.target])]);
  }
  function setView(next) {
    const aspect = Math.max(.4, svg.clientWidth / Math.max(1, svg.clientHeight));
    next.w = Math.min(12000, Math.max(320, next.w));
    next.h = next.w / aspect;
    view = next;
    svg.setAttribute('viewBox', `${view.x} ${view.y} ${view.w} ${view.h}`);
    get('zoom').textContent = `${Math.round(data.width / view.w * 100)}%`;
  }
  function fit(ids) {
    const rectangles = ids && ids.length ? ids.map(id => nodes.get(id)).filter(Boolean) : [{x: 0, y: 0, w: data.width, h: data.height}];
    const minX = Math.min(...rectangles.map(r => r.x)) - 100;
    const minY = Math.min(...rectangles.map(r => r.y)) - 100;
    const maxX = Math.max(...rectangles.map(r => r.x + r.w)) + 100;
    const maxY = Math.max(...rectangles.map(r => r.y + r.h)) + 100;
    const aspect = Math.max(.4, svg.clientWidth / Math.max(1, svg.clientHeight));
    const width = Math.max(ids?.length === 1 ? 480 : 720, maxX - minX, (maxY - minY) * aspect);
    setView({x: (minX + maxX - width) / 2, y: (minY + maxY - width / aspect) / 2, w: width});
  }
  function zoom(factor, point) {
    const width = Math.min(12000, Math.max(320, view.w * factor));
    const ratio = width / view.w;
    const anchor = point || {x: view.x + view.w / 2, y: view.y + view.h / 2};
    setView({x: anchor.x - (anchor.x - view.x) * ratio, y: anchor.y - (anchor.y - view.y) * ratio, w: width});
  }

  // Orthogonal routes avoid service boxes. Cache routes because node positions
  // remain stable while scenarios, search and categories change emphasis.
  const cell = 20;
  const columns = Math.ceil(data.width / cell) + 1;
  const rows = Math.ceil(data.height / cell) + 1;
  const obstacles = new Set();
  data.nodes.forEach(node => {
    for (let x = Math.floor((node.x - 12) / cell); x <= Math.ceil((node.x + node.w + 12) / cell); x++) {
      for (let y = Math.floor((node.y - 12) / cell); y <= Math.ceil((node.y + node.h + 12) / cell); y++) {
        if (x * cell >= node.x - 12 && x * cell <= node.x + node.w + 12 && y * cell >= node.y - 12 && y * cell <= node.y + node.h + 12) obstacles.add(y * columns + x);
      }
    }
  });
  data.groups.forEach(group => {
    const right = group.x + 14 + Math.min(group.w - 65, group.label.length * 10);
    for (let x = Math.ceil((group.x + 9) / cell); x * cell <= right + 5; x++) {
      for (let y = Math.ceil((group.y + 5) / cell); y * cell <= group.y + 35; y++) obstacles.add(y * columns + x);
    }
  });
  class Heap {
    constructor() { this.items = []; }
    push(item) {
      const items = this.items; items.push(item);
      let i = items.length - 1;
      while (i) { const parent = (i - 1) >> 1; if (items[parent].f <= item.f) break; items[i] = items[parent]; i = parent; }
      items[i] = item;
    }
    pop() {
      const items = this.items, result = items[0], last = items.pop();
      if (items.length) {
        let i = 0;
        while (true) { let child = i * 2 + 1; if (child >= items.length) break; if (child + 1 < items.length && items[child + 1].f < items[child].f) child++; if (items[child].f >= last.f) break; items[i] = items[child]; i = child; }
        items[i] = last;
      }
      return result;
    }
  }
  function ports(node) {
    const {x, y, w, h} = node;
    return [[x + w, y + h / 2, 1, 0], [x, y + h / 2, -1, 0], [x + w / 2, y + h, 0, 1], [x + w / 2, y, 0, -1]];
  }
  function route(edge) {
    if (pathCache.has(edge.id)) return pathCache.get(edge.id);
    const a = nodes.get(edge.source), b = nodes.get(edge.target);
    const candidates = ports(a).flatMap(start => ports(b).map(end => ({start, end, distance: Math.abs(start[0] - end[0]) + Math.abs(start[1] - end[1])})));
    candidates.sort((a, b) => a.distance - b.distance);
    let result;
    for (const {start, end} of candidates) {
      const sx = Math.round((start[0] + start[2] * 35) / cell), sy = Math.round((start[1] + start[3] * 35) / cell);
      const tx = Math.round((end[0] + end[2] * 35) / cell), ty = Math.round((end[1] + end[3] * 35) / cell);
      if (sx < 0 || sy < 0 || tx < 0 || ty < 0 || sx >= columns || tx >= columns || sy >= rows || ty >= rows) continue;
      const first = sy * columns + sx, target = ty * columns + tx;
      if (obstacles.has(first) || obstacles.has(target)) continue;
      const open = new Heap(), costs = new Map([[first, 0]]), previous = new Map();
      open.push({id: first, f: 0});
      let found = false, visits = 0;
      while (open.items.length && visits++ < columns * rows * 2) {
        const current = open.pop().id;
        if (current === target) { found = true; break; }
        const x = current % columns, y = Math.floor(current / columns);
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx, ny = y + dy, next = ny * columns + nx;
          if (nx < 0 || ny < 0 || nx >= columns || ny >= rows || obstacles.has(next)) continue;
          const parent = previous.get(current);
          const bend = parent !== undefined && current - parent !== next - current ? 8 : 0;
          const cost = costs.get(current) + cell + bend;
          if (cost >= (costs.get(next) ?? Infinity)) continue;
          costs.set(next, cost); previous.set(next, current);
          open.push({id: next, f: cost + (Math.abs(nx - tx) + Math.abs(ny - ty)) * cell});
        }
      }
      if (!found) continue;
      const points = [];
      for (let at = target; at !== undefined; at = previous.get(at)) points.push([at % columns * cell, Math.floor(at / columns) * cell]);
      points.reverse();
      points.unshift([start[0], start[1]], [start[0] + start[2] * 30, start[1] + start[3] * 30]);
      points.push([end[0] + end[2] * 30, end[1] + end[3] * 30], [end[0], end[1]]);
      const reduced = points.filter((point, i) => !i || i === points.length - 1 || (points[i - 1][0] !== point[0] || point[0] !== points[i + 1][0]) && (points[i - 1][1] !== point[1] || point[1] !== points[i + 1][1]));
      result = `M ${reduced[0].join(' ')} `;
      for (let i = 1; i < reduced.length - 1; i++) {
        const p = reduced[i], prev = reduced[i - 1], next = reduced[i + 1];
        const before = Math.hypot(p[0] - prev[0], p[1] - prev[1]), after = Math.hypot(next[0] - p[0], next[1] - p[1]);
        const radius = Math.min(10, before / 2, after / 2);
        if (!radius) continue;
        const pre = [p[0] + (prev[0] - p[0]) / before * radius, p[1] + (prev[1] - p[1]) / before * radius];
        const post = [p[0] + (next[0] - p[0]) / after * radius, p[1] + (next[1] - p[1]) / after * radius];
        result += `L ${pre.join(' ')} Q ${p.join(' ')} ${post.join(' ')} `;
      }
      result += `L ${reduced[reduced.length - 1].join(' ')}`;
      break;
    }
    if (!result) {
      // Mark an unroutable connector explicitly instead of drawing through boxes.
      result = null;
    }
    pathCache.set(edge.id, result);
    return result;
  }
  function lines(text, limit = 21) {
    const words = text.split(' '), output = [''];
    words.forEach(word => { const last = output.length - 1; if ((output[last] + word).length > limit && output[last]) output.push(word); else output[last] += (output[last] ? ' ' : '') + word; });
    return output.slice(0, 2);
  }
  function render() {
    const focused = relatedIds();
    const entry = scenario();
    const activeEdgeId = entry?.steps[state.step]?.edge;
    const sceneEdges = new Set(entry ? entry.steps.map(step => step.edge) : []);
    const compare = comparison();
    const defs = shape('defs');
    Object.keys(kinds).forEach(type => {
      const marker = shape('marker', {id: `dva-scope-arrow-${type}`, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto', markerUnits: 'userSpaceOnUse'});
      marker.append(shape('path', {d: 'M0 0 L10 5 L0 10z', fill: `var(--scope-${type})`})); defs.append(marker);
    });
    const boundaryLayer = shape('g'), edgeLayer = shape('g'), nodeLayer = shape('g');
    data.groups.forEach(group => {
      if (ancestors(group.parent).some(id => state.collapsed.has(id))) return;
      const boundary = shape('g', {class: 'scope-boundary', 'data-kind': group.kind, 'data-boundary': group.id});
      boundary.append(shape('rect', {x: group.x, y: group.y, width: group.w, height: group.h, rx: 15}), shape('text', {x: group.x + 14, y: group.y + 29}, group.label));
      if (!['cloud', 'region'].includes(group.id)) {
        const control = shape('g', {class: 'scope-boundary-toggle', 'data-collapse': group.id, role: 'button', tabindex: 0, 'aria-label': `${state.collapsed.has(group.id) ? 'Expand' : 'Collapse'} ${group.label}`, 'aria-expanded': String(!state.collapsed.has(group.id))});
        control.append(shape('rect', {x: group.x + group.w - 39, y: group.y + 8, width: 28, height: 28, rx: 5}), shape('text', {x: group.x + group.w - 25, y: group.y + 30}, state.collapsed.has(group.id) ? '+' : '−'));
        boundary.append(control);
      }
      if (state.collapsed.has(group.id)) boundary.append(shape('text', {class: 'scope-collapsed-label', x: group.x + group.w / 2, y: group.y + group.h / 2}, 'Contents collapsed · expand +'));
      boundaryLayer.append(boundary);
    });
    const paths = new Map();
    data.relationships.forEach(edge => {
      if (!state.types.has(edge.type) || hiddenNode(nodes.get(edge.source)) || hiddenNode(nodes.get(edge.target))) return;
      const selected = edge.source === state.selected || edge.target === state.selected;
      const overviewEdge = ['target-a', 'target-b', 'sql', 'ha', 'disk-a', 'disk-b', 'mount-fs-a', 'mount-fs-b'].includes(edge.id);
      if (!state.all && !(entry ? sceneEdges.has(edge.id) : state.overview ? overviewEdge : selected) && !(compare && focused.has(edge.source) && focused.has(edge.target))) return;
      const d = route(edge);
      if (!d) return;
      const path = shape('path', {d, class: `scope-edge${activeEdgeId === edge.id ? ' is-current' : ''}`, 'data-edge': edge.id, 'data-type': edge.type, style: `--edge-color:var(--scope-${edge.type})`, 'marker-end': `url(#dva-scope-arrow-${edge.type})`});
      path.append(shape('title', {}, `${kinds[edge.type][0]}: ${edge.description}`));
      edgeLayer.append(path); paths.set(edge.id, path);
    });
    data.nodes.forEach(node => {
      if (hiddenNode(node)) return;
      const classes = ['scope-node'];
      if (focused.has(node.id)) classes.push('is-related'); else classes.push('is-dim');
      if (state.selected === node.id) classes.push('is-selected');
      if (compare?.left.includes(node.id)) classes.push('is-left');
      if (compare?.right.includes(node.id)) classes.push('is-right');
      const group = shape('g', {class: classes.join(' '), 'data-node': node.id, role: 'button', tabindex: 0, 'aria-label': `${node.label}. ${node.scope}. Select for placement, flow and study notes.`, 'aria-pressed': String(state.selected === node.id)});
      group.append(shape('rect', {x: node.x, y: node.y, width: node.w, height: node.h, rx: 9}));
      if (node.icon) group.append(shape('image', {x: node.x + 10, y: node.y + (node.h - 30) / 2, width: 30, height: 30, href: `${root.dataset.iconBase}Arch_${node.icon}_64.svg`, 'aria-hidden': 'true'}));
      else {
        group.append(shape('circle', {class: 'scope-symbol', cx: node.x + 25, cy: node.y + node.h / 2, r: 17}));
        group.append(shape('text', {class: 'scope-symbol-text', x: node.x + 25, y: node.y + node.h / 2 + 7}, node.id === 'client' ? '↗' : 'ID'));
      }
      const label = lines(node.label, 16);
      label.forEach((line, index) => group.append(shape('text', {x: node.x + 52, y: node.y + (label.length === 2 ? 27 : node.h < 60 ? 30 : 31) + index * 21}, line)));
      if (label.length === 1 && node.h >= 60) group.append(shape('text', {class: 'scope-node-scope', x: node.x + 52, y: node.y + 51}, node.group.startsWith('priv') ? `PRIVATE · AZ ${node.group.slice(-1)}` : node.group.startsWith('pub') ? `PUBLIC · AZ ${node.group.slice(-1)}` : node.group.startsWith('az') ? `AZ ${node.group.slice(-1)} · NO SUBNET` : node.scope.startsWith('Global') ? 'GLOBAL / ACCOUNT' : node.scope === 'External' ? 'EXTERNAL' : 'REGIONAL / LOGICAL'));
      nodeLayer.append(group);
    });
    svg.replaceChildren(defs, boundaryLayer, edgeLayer, nodeLayer);
    currentPath = paths.get(activeEdgeId) || null;
    packet = null;
    if (currentPath) {
      const edge = edges.get(activeEdgeId), label = edge.label.length > 37 ? edge.label.slice(0, 34) + '…' : edge.label;
      const at = currentPath.getPointAtLength(currentPath.getTotalLength() / 2);
      const badge = shape('g', {class: 'scope-edge-label', style: `--edge-color:var(--scope-${edge.type})`});
      const width = label.length * 7.2 + 20;
      let labelPoint = null;
      for (const fraction of [.5, .35, .65, .2, .8]) {
        const point = currentPath.getPointAtLength(currentPath.getTotalLength() * fraction);
        const box = {x: point.x - width / 2, y: point.y - 32, w: width, h: 28};
        if (box.x < 0 || box.y < 0 || box.x + box.w > data.width) continue;
        const overlaps = data.nodes.some(node => !hiddenNode(node) && box.x < node.x + node.w + 5 && box.x + box.w > node.x - 5 && box.y < node.y + node.h + 5 && box.y + box.h > node.y - 5);
        if (!overlaps) { labelPoint = point; break; }
      }
      if (labelPoint) {
        badge.append(shape('rect', {x: labelPoint.x - width / 2, y: labelPoint.y - 30, width, height: 26, rx: 5}), shape('text', {x: labelPoint.x, y: labelPoint.y - 12}, label));
        svg.append(badge);
      }
      let glyph = kinds[edge.type][1];
      if (edge.id.startsWith('dns-')) glyph = 'DNS';
      if (edge.id.includes('sql') || edge.id.includes('replica') && edge.type === 'api') glyph = 'SQL';
      if (edge.id.includes('queue') || edge.id === 'process') glyph = 'MSG';
      if (['put-record', 'hash', 'read-record', 'stream-batch'].includes(edge.id)) glyph = 'REC';
      if (edge.id.includes('jwt')) glyph = 'JWT';
      if (edge.id.includes('nfs')) glyph = 'NFS';
      packet = shape('g', {class: 'scope-packet', 'aria-hidden': 'true', style: `--edge-color:var(--scope-${edge.type})`});
      packet.append(edge.type === 'event' ? shape('rect', {x: -22, y: -13, width: 44, height: 26, rx: 3}) : edge.type === 'authorization' ? shape('polygon', {points: '0,-24 32,0 0,24 -32,0'}) : shape('rect', {x: -23, y: -14, width: 46, height: 28, rx: edge.type === 'network' ? 14 : 4}), shape('text', {y: 4}, glyph));
      svg.append(packet); movePacket();
    }
    root.querySelectorAll('[data-scope-category]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.scopeCategory === state.category)));
    get('match').textContent = state.search ? `${focused.size} matching nodes · Enter to focus` : `${data.nodes.length} placed resources · ${data.scenarios.length} scenarios`;
  }
  function panelSection(panel, title, text) {
    panel.append(html('h5', title), html('p', text));
  }
  function showNode(id, focus = false) {
    const node = nodes.get(id);
    if (!node) return;
    pause(); state.selected = id; expandFor([id]);
    const panel = get('detail'); panel.replaceChildren(html('strong', node.label), html('span', `${data.categories[node.category]} · ${node.scope}`, 'dva-scope-placement'), html('p', node.description));
    panelSection(panel, 'Architecture placement', node.placement);
    panelSection(panel, 'Subnet / security-group requirements', node.networkRequirements);
    panelSection(panel, 'Input → processing → output', node.flow);
    panelSection(panel, 'Persistence / consumption', node.retention);
    panel.append(html('h5', 'Features & exam terminology'));
    const list = html('ul');
    (node.features.length ? node.features : ['Inspect the related service reference for configuration and supported deployment models.']).forEach(feature => list.append(html('li', feature))); panel.append(list);
    panelSection(panel, 'Decision boundary / common mistake', node.trap);
    if (node.card && cards[node.card]) {
      const full = html('a', `Open ${cards[node.card].name} card →`); full.href = cards[node.card].read; full.dataset.service = node.card; panel.append(full);
    }
    const reference = html('p'), link = html('a', 'AWS documentation ↗'); link.href = node.url; reference.append(link); panel.append(reference);
    const relations = html('div', undefined, 'dva-scope-relations'); relations.append(html('h5', 'Connected responsibilities'));
    data.relationships.filter(edge => edge.source === id || edge.target === id).forEach(edge => {
      const target = edge.source === id ? edge.target : edge.source;
      const button = html('button', `${edge.source === id ? '→' : '←'} ${nodes.get(target).label} · ${edge.label}`); button.type = 'button'; button.dataset.scopeRelated = target; relations.append(button);
    }); panel.append(relations);
    render();
    if (focus) fit([id]);
  }
  function showComparison() {
    const entry = comparison();
    if (!entry) { showNode(state.selected); return; }
    pause(); clearStudy(); state.overview = false; state.scenario = ''; get('scenario').value = ''; state.category = ''; state.search = ''; get('search').value = '';
    const ids = [...new Set([...entry.left, ...entry.right])]; expandFor(ids);
    const panel = get('detail'); panel.replaceChildren(html('strong', entry.title));
    for (const side of ['left', 'right']) {
      const box = html('div', undefined, 'dva-scope-comparison'); box.dataset.side = side;
      box.append(html('strong', `${side === 'left' ? 'Blue' : 'Purple'}: ${entry[side].map(id => nodes.get(id).label).join(' · ')}`));
      box.append(html('p', [...new Set(entry[side].map(id => nodes.get(id).scope))].join('; '))); panel.append(box);
    }
    panelSection(panel, 'Deciding requirement', entry.rule); panelSection(panel, 'Important exception', entry.exception);
    get('step-detail').replaceChildren(html('p', 'Comparison highlights responsibilities and placement. Select a scenario to simulate an operation.'));
    updatePlayer(); render(); fit(ids);
  }
  function movePacket() {
    if (!packet || !currentPath) return;
    const fraction = Math.min(1, state.elapsed / 2600);
    const at = currentPath.getPointAtLength(currentPath.getTotalLength() * (matchMedia('(prefers-reduced-motion: reduce)').matches ? fraction > .5 ? 1 : 0 : fraction));
    packet.setAttribute('transform', `translate(${at.x} ${at.y})`);
  }
  function pause() {
    state.running = false; cancelAnimationFrame(frame); state.lastFrame = 0;
    get('run').textContent = 'Run simulation';
  }
  function animate(time) {
    if (!state.running) return;
    if (state.lastFrame) state.elapsed += time - state.lastFrame;
    state.lastFrame = time; movePacket();
    if (state.elapsed >= 2600) {
      const entry = scenario();
      if (!entry || state.step >= entry.steps.length - 1) { pause(); get('progress').textContent = 'Simulation complete'; return; }
      state.step++; state.elapsed = 0; showStep();
    }
    frame = requestAnimationFrame(animate);
  }
  function updatePlayer() {
    const entry = scenario();
    get('run').disabled = !entry; get('previous').disabled = !entry || state.step === 0; get('next').disabled = !entry || state.step === entry.steps.length - 1;
    get('step').disabled = !entry;
    get('progress').textContent = entry ? `Step ${state.step + 1} / ${entry.steps.length}` : 'Choose a scenario to run';
  }
  function showStep() {
    const entry = scenario();
    if (!entry) { get('step').replaceChildren(); updatePlayer(); return; }
    get('step').replaceChildren(...entry.steps.map((step, index) => { const option = html('option', `${index + 1}. ${edges.get(step.edge).label}`); option.value = index; return option; }));
    get('step').value = String(state.step);
    const step = entry.steps[state.step], edge = edges.get(step.edge), result = get('step-detail');
    result.replaceChildren(html('span', `${state.step + 1} · ${kinds[edge.type][0].toUpperCase()}`, 'dva-scope-step-type'), html('p', step.text), html('p', `Architecture note: ${entry.note}`), html('p', `Exam boundary: ${entry.exam}`));
    if (!state.types.has(edge.type)) result.append(html('p', 'This connection type is hidden in the legend; enable it to show its animation.'));
    render(); updatePlayer();
  }
  function chooseScenario(id) {
    pause(); clearStudy(); state.overview = !id; state.scenario = id; state.comparison = ''; state.category = ''; state.search = ''; state.step = 0; state.elapsed = 0;
    get('compare').value = ''; get('search').value = '';
    const entry = scenario();
    if (entry) {
      const ids = [...sceneNodes(entry)]; expandFor(ids);
      state.selected = edges.get(entry.steps[0].edge).target;
      showNode(state.selected); showStep(); fit(ids);
    } else { showNode(state.selected); get('step-detail').replaceChildren(html('p', 'Select any resource for placement and relationships, or choose a scenario for numbered steps.')); updatePlayer(); fit(); }
  }
  function study() {
    pause(); get('study-panel').hidden = !get('study').checked;
    if (!get('study').checked) { render(); return; }
    state.overview = false; state.scenario = ''; state.comparison = ''; state.category = ''; state.search = '';
    get('scenario').value = ''; get('compare').value = ''; get('search').value = ''; updatePlayer();
    const question = data.study[Number(get('question').value)];
    get('answer').textContent = question.answer; expandFor(question.nodes); render(); fit(question.nodes);
  }
  function clearStudy() { get('study').checked = false; get('study-panel').hidden = true; }
  root.addEventListener('click', event => {
    const collapse = event.target.closest('[data-collapse]');
    if (collapse) { pause(); const id = collapse.dataset.collapse; if (state.collapsed.has(id)) state.collapsed.delete(id); else state.collapsed.add(id); render(); return; }
    const selected = event.target.closest('[data-node]');
    if (selected) { state.overview = false; state.search = ''; get('search').value = ''; showNode(selected.dataset.node, view.w > 1600); return; }
    const related = event.target.closest('[data-scope-related]');
    if (related) { state.scenario = ''; get('scenario').value = ''; showNode(related.dataset.scopeRelated, true); updatePlayer(); return; }
    const category = event.target.closest('[data-scope-category]');
    if (category) { pause(); clearStudy(); state.overview = !category.dataset.scopeCategory; state.category = category.dataset.scopeCategory; state.comparison = ''; state.scenario = ''; state.search = ''; get('search').value = ''; get('scenario').value = ''; get('compare').value = ''; const ids = [...relatedIds()]; expandFor(ids); render(); updatePlayer(); fit(state.category ? ids : undefined); }
    const navigation = event.target.closest('[data-scope-nav]');
    if (navigation?.dataset.scopeNav === 'scenario') get('scenario').focus();
    if (navigation?.dataset.scopeNav === 'study') { get('study').checked = true; study(); get('question').focus(); }
  });
  svg.addEventListener('keydown', event => {
    const actionable = event.target.closest('[data-node],[data-collapse]');
    if (actionable && ['Enter', ' '].includes(event.key)) { event.preventDefault(); actionable.dispatchEvent(new MouseEvent('click', {bubbles: true})); return; }
    const moves = {ArrowLeft: [-100, 0], ArrowRight: [100, 0], ArrowUp: [0, -100], ArrowDown: [0, 100]};
    if (moves[event.key]) { event.preventDefault(); const [dx, dy] = moves[event.key]; setView({...view, x: view.x + dx, y: view.y + dy}); }
    if (['+', '=', '-'].includes(event.key)) { event.preventDefault(); zoom(event.key === '-' ? 1.25 : .8); }
    if (event.key === '0') { event.preventDefault(); fit(); }
  });
  get('scenario').addEventListener('change', event => chooseScenario(event.target.value));
  get('compare').addEventListener('change', event => { state.comparison = event.target.value; showComparison(); });
  get('connections').addEventListener('change', event => { state.all = event.target.checked; render(); });
  get('study').addEventListener('change', study); get('question').addEventListener('change', study);
  get('search').addEventListener('input', event => { state.search = event.target.value.trim(); render(); });
  get('search').addEventListener('keydown', event => {
    if (event.key !== 'Enter' || !state.search) return;
    const ids = [...relatedIds()];
    if (ids.length) { expandFor(ids); showNode(ids[0]); fit(ids.slice(0, 8)); }
  });
  get('step').addEventListener('change', event => { pause(); state.step = Number(event.target.value); state.elapsed = 0; showStep(); });
  ['previous', 'next'].forEach(name => get(name).addEventListener('click', () => { pause(); const entry = scenario(); if (!entry) return; state.step = Math.min(entry.steps.length - 1, Math.max(0, state.step + (name === 'previous' ? -1 : 1))); state.elapsed = 0; showStep(); }));
  get('run').addEventListener('click', () => {
    if (state.running) { pause(); return; }
    const entry = scenario(); if (!entry) return;
    expandFor([...sceneNodes(entry)]); render();
    if (state.step === entry.steps.length - 1 && state.elapsed >= 2600) { state.step = 0; state.elapsed = 0; showStep(); }
    state.running = true; state.lastFrame = 0; get('run').textContent = 'Pause simulation'; frame = requestAnimationFrame(animate);
  });
  get('zoom-in').addEventListener('click', () => zoom(.8)); get('zoom-out').addEventListener('click', () => zoom(1.25));
  get('reset').addEventListener('click', () => { pause(); state.collapsed.clear(); state.category = ''; state.search = ''; get('search').value = ''; state.all = false; get('connections').checked = false; state.types = new Set(Object.keys(kinds)); get('legend').querySelectorAll('input').forEach(input => { input.checked = true; }); render(); fit(); });
  get('expand').hidden = !document.fullscreenEnabled;
  get('expand').addEventListener('click', async () => { if (document.fullscreenElement === root) await document.exitFullscreen(); else await root.requestFullscreen(); });
  document.addEventListener('fullscreenchange', () => { get('expand').textContent = document.fullscreenElement === root ? 'Exit expanded view' : 'Expand'; });
  function point(event) { const point = svg.createSVGPoint(); point.x = event.clientX; point.y = event.clientY; return point.matrixTransform(svg.getScreenCTM().inverse()); }
  svg.addEventListener('wheel', event => { if (!event.ctrlKey && !event.metaKey) return; event.preventDefault(); zoom(event.deltaY > 0 ? 1.15 : .87, point(event)); }, {passive: false});
  const pointers = new Map();
  let drag = null;
  svg.addEventListener('pointerdown', event => {
    if (event.target.closest('[data-node],[data-collapse]') || event.button > 0) return;
    pointers.set(event.pointerId, {x: event.clientX, y: event.clientY}); svg.setPointerCapture(event.pointerId);
    const positions = [...pointers.values()];
    drag = {view: {...view}, x: event.clientX, y: event.clientY, distance: positions.length > 1 ? Math.hypot(positions[0].x - positions[1].x, positions[0].y - positions[1].y) : 0};
  });
  svg.addEventListener('pointermove', event => {
    if (!pointers.has(event.pointerId) || !drag) return;
    pointers.set(event.pointerId, {x: event.clientX, y: event.clientY});
    const positions = [...pointers.values()];
    if (positions.length > 1 && drag.distance) {
      const distance = Math.hypot(positions[0].x - positions[1].x, positions[0].y - positions[1].y);
      const width = drag.view.w * drag.distance / Math.max(1, distance);
      setView({x: drag.view.x + (drag.view.w - width) / 2, y: drag.view.y + (drag.view.w - width) / (2 * (svg.clientWidth / svg.clientHeight)), w: width});
    } else setView({x: drag.view.x - (event.clientX - drag.x) * drag.view.w / svg.clientWidth, y: drag.view.y - (event.clientY - drag.y) * drag.view.h / svg.clientHeight, w: drag.view.w});
  });
  ['pointerup', 'pointercancel'].forEach(name => svg.addEventListener(name, event => { pointers.delete(event.pointerId); if (!pointers.size) drag = null; }));
  Object.entries(kinds).forEach(([kind, [label]]) => {
    const wrapper = html('label'), check = html('input'); check.type = 'checkbox'; check.checked = true; check.value = kind;
    wrapper.style.setProperty('--edge-color', `var(--scope-${kind})`); wrapper.append(check, document.createTextNode(label));
    check.addEventListener('change', () => { if (check.checked) state.types.add(kind); else state.types.delete(kind); render(); if (scenario()) showStep(); }); get('legend').append(wrapper);
  });
  [...new Set(data.nodes.map(node => node.label))].sort().forEach(label => { const option = html('option'); option.value = label; get('services').append(option); });
  root.querySelectorAll('[data-scope-ready]').forEach(element => { element.hidden = false; });
  showNode('lambda'); updatePlayer(); fit();
  get('step-detail').append(html('p', 'Choose a scenario, then Run simulation. Each typed symbol represents a request, record, message, identity assertion, deployment operation or telemetry event; no AWS resources are created.'));
  new ResizeObserver(() => {
    const entry = scenario(), compare = comparison();
    if (entry) fit([...sceneNodes(entry)]);
    else if (compare) fit([...new Set([...compare.left, ...compare.right])]);
    else fit();
  }).observe(svg);
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
})();
