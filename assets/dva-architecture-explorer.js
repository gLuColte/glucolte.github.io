(() => {
  'use strict';
  const root = document.getElementById('dva-scope-explorer') || document.getElementById('soa-scope-explorer');
  const prefix = root?.dataset.studyPrefix || 'dva';
  const source = document.getElementById(`${prefix}-scope-data`);
  if (!root || !source) return;
  const data = JSON.parse(source.textContent);
  const catalogue = JSON.parse(document.getElementById(`${prefix}-study-data`).textContent);
  const cards = catalogue.cards;
  const get = name => document.getElementById(`${prefix}-scope-${name}`);
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
  const initialNode = data.initialNode || 'lambda';
  const state = {selected: initialNode, scenario: '', comparison: '', step: 0, category: '', search: '', overview: true, all: false, running: false, elapsed: 0, lastFrame: 0, collapsed: new Set(), types: new Set(Object.keys(kinds))};
  let view = {x: 0, y: 0, w: data.width, h: data.height};
  let frame = 0;
  let packet = null;
  let currentPath = null;
  let scenarioQuery = '';
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
  // A step is a complete snapshot, so seeking backwards cannot retain a later
  // failure, promoted role or replacement instance from the playback history.
  const nodeState = id => scenario()?.steps[state.step]?.nodeStates?.[id];
  const nodeLabel = id => nodeState(id)?.name || scenario()?.actors?.[id] || nodes.get(id).label;
  const annotatedNodes = new Set(data.scenarios.flatMap(scene => scene.steps.flatMap(step => Object.keys(step.nodeStates || {}))));
  const nodeBounds = node => ({x: node.x, y: node.y - (annotatedNodes.has(node.id) ? 32 : 0), w: node.w, h: node.h + (annotatedNodes.has(node.id) ? 32 : 0)});
  const activityNames = {request: 'Request', response: 'Response', event: 'Independent delivery', replication: 'Replication', telemetry: 'Evidence delivery', control: 'Control-plane operation', association: 'Configuration relationship', check: 'Policy / configuration check', internal: 'Internal operation'};
  const connector = edge => ['association', 'check'].includes(edge.activity) ? '—' : edge.activity === 'internal' ? '⇢' : '→';
  function ancestors(groupId) {
    const result = [];
    for (let group = groups.get(groupId); group; group = groups.get(group.parent)) result.push(group.id);
    return result;
  }
  const hiddenNode = node => node.scenarios && !node.scenarios.includes(state.scenario) || nodeState(node.id)?.hidden || ancestors(node.group).some(id => state.collapsed.has(id));
  function expandFor(ids) {
    ids.forEach(id => ancestors(nodes.get(id).group).forEach(group => state.collapsed.delete(group)));
  }
  function sceneNodes(entry) {
    return new Set(entry.steps.flatMap(step => [...Object.keys(step.nodeStates || {}), ...(step.node ? [step.node] : [edges.get(step.edge).source, edges.get(step.edge).target])]));
  }
  const searchText = text => text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const matchesSearch = (text, query) => {
    const terms = searchText(query).split(/\s+/).filter(Boolean);
    return terms.length > 0 && terms.every(term => term.length <= 3 ? text.split(' ').includes(term) : text.includes(term) || term.length > 4 && term.endsWith('s') && text.includes(term.slice(0, -1)));
  };
  const nodeSearch = new Map(data.nodes.map(node => [node.id, searchText([node.id, node.label, cards[node.card]?.name || '', ...node.features].join(' '))]));
  // Index the actual flow and its participating components, without pulling
  // every topic from a shared service card into every scenario using that card.
  const scenarioSearch = new Map(data.scenarios.map(entry => [entry.id, searchText([
    entry.title, entry.note, entry.exam, ...(entry.keywords || []), ...Object.values(entry.actors || {}),
    ...entry.steps.flatMap(step => [step.phase, step.text, step.edge ? edges.get(step.edge).label : '']),
    ...[...sceneNodes(entry)].map(id => { const node = nodes.get(id); return [node.id, node.label, cards[node.card]?.name || ''].join(' '); })
  ].join(' '))]));
  function matchingNodes(query) {
    const matches = data.nodes.filter(node => (!node.scenarios || node.scenarios.includes(state.scenario)) && matchesSearch(nodeSearch.get(node.id), query));
    matches.sort((a, b) => Number(searchText(b.label) === searchText(query)) - Number(searchText(a.label) === searchText(query)));
    return matches;
  }
  function updateScenarioOptions() {
    const entries = scenarioQuery ? data.scenarios.filter(entry => matchesSearch(scenarioSearch.get(entry.id), scenarioQuery)) : data.scenarios;
    const empty = html('option', !scenarioQuery ? 'Architecture overview' : entries.length ? 'Choose a matching scenario' : 'No matching scenarios');
    empty.value = '';
    get('scenario').replaceChildren(empty, ...entries.map(entry => { const option = html('option', entry.title); option.value = entry.id; return option; }));
    get('scenario').value = entries.some(entry => entry.id === state.scenario) ? state.scenario : '';
    const status = get('scenario-filter');
    status.hidden = !scenarioQuery;
    status.textContent = scenarioQuery ? `${entries.length} of ${data.scenarios.length} scenarios match. Clear search to show all.` : '';
    return entries;
  }
  function clearSearch() {
    state.search = ''; scenarioQuery = ''; get('search').value = ''; updateScenarioOptions();
  }
  function applySearch(value) {
    pause(); state.search = scenarioQuery = value.trim();
    const entries = updateScenarioOptions();
    if (state.scenario && !entries.some(entry => entry.id === state.scenario)) {
      state.scenario = ''; state.step = 0; state.elapsed = 0; state.overview = false;
      showNode(initialNode); updatePlayer();
    }
    render();
  }
  function relatedIds() {
    if (state.search) {
      return new Set(matchingNodes(state.search).map(node => node.id));
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

  // Orthogonal routes avoid service boxes and unrelated architecture zones.
  // Only the boundaries that contain an endpoint may be entered; Cloud and
  // Region are ambient scope frames. Routes stay stable as emphasis changes.
  const cell = 20;
  const columns = Math.ceil(data.width / cell) + 1;
  const rows = Math.ceil(data.height / cell) + 1;
  const obstacles = new Set();
  data.nodes.forEach(node => {
    const box = nodeBounds(node);
    for (let x = Math.floor((box.x - 12) / cell); x <= Math.ceil((box.x + box.w + 12) / cell); x++) {
      for (let y = Math.floor((box.y - 12) / cell); y <= Math.ceil((box.y + box.h + 12) / cell); y++) {
        if (x * cell >= box.x - 12 && x * cell <= box.x + box.w + 12 && y * cell >= box.y - 12 && y * cell <= box.y + box.h + 12) obstacles.add(y * columns + x);
      }
    }
  });
  data.groups.forEach(group => {
    const right = group.x + 14 + Math.min(group.w - 65, group.label.length * 10);
    for (let x = Math.ceil((group.x + 9) / cell); x * cell <= right + 5; x++) {
      for (let y = Math.ceil((group.y + 5) / cell); y * cell <= group.y + 35; y++) obstacles.add(y * columns + x);
    }
  });
  const boundaryCells = new Map();
  data.groups.filter(group => !['cloud', 'region'].includes(group.kind)).forEach(group => {
    // Leave room for the whole moving label beside the developer machine,
    // so a marker cannot visually enter it while its route stays outside.
    const gap = group.kind === 'developer' ? 40 : 8;
    for (let x = Math.max(0, Math.ceil((group.x - gap) / cell)); x * cell <= group.x + group.w + gap && x < columns; x++) {
      for (let y = Math.max(0, Math.ceil((group.y - gap) / cell)); y * cell <= group.y + group.h + gap && y < rows; y++) {
        const id = y * columns + x;
        if (!boundaryCells.has(id)) boundaryCells.set(id, []);
        boundaryCells.get(id).push(group.id);
      }
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
    const result = [[x + w, y + h / 2, 1, 0], [x, y + h / 2, -1, 0], [x + w / 2, y + h, 0, 1]];
    // A top connector would pass through the node's own status badge.
    if (!annotatedNodes.has(node.id)) result.push([x + w / 2, y, 0, -1]);
    return result;
  }
  function route(edge) {
    if (pathCache.has(edge.id)) return pathCache.get(edge.id);
    const a = nodes.get(edge.source), b = nodes.get(edge.target);
    const permitted = new Set([...ancestors(a.group), ...ancestors(b.group)]);
    const blocked = id => obstacles.has(id) || boundaryCells.get(id)?.some(group => !permitted.has(group));
    const candidates = ports(a).flatMap(start => ports(b).map(end => ({start, end, distance: Math.abs(start[0] - end[0]) + Math.abs(start[1] - end[1])})));
    candidates.sort((a, b) => a.distance - b.distance);
    let result;
    for (const {start, end} of candidates) {
      const sx = Math.round((start[0] + start[2] * 35) / cell), sy = Math.round((start[1] + start[3] * 35) / cell);
      const tx = Math.round((end[0] + end[2] * 35) / cell), ty = Math.round((end[1] + end[3] * 35) / cell);
      if (sx < 0 || sy < 0 || tx < 0 || ty < 0 || sx >= columns || tx >= columns || sy >= rows || ty >= rows) continue;
      const first = sy * columns + sx, target = ty * columns + tx;
      if (blocked(first) || blocked(target)) continue;
      const open = new Heap(), costs = new Map([[first, 0]]), previous = new Map();
      open.push({id: first, f: 0});
      let found = false, visits = 0;
      while (open.items.length && visits++ < columns * rows * 2) {
        const current = open.pop().id;
        if (current === target) { found = true; break; }
        const x = current % columns, y = Math.floor(current / columns);
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx, ny = y + dy, next = ny * columns + nx;
          if (nx < 0 || ny < 0 || nx >= columns || ny >= rows || blocked(next)) continue;
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
    const activeEdge = edges.get(activeEdgeId);
    const inactiveEdges = new Set(entry?.steps[state.step]?.inactiveEdges || []);
    const staticAction = entry && (!activeEdge?.packet || entry.mode === 'comparison');
    const actionNodes = new Set(staticAction ? entry.steps[state.step].node ? [entry.steps[state.step].node] : [activeEdge.source, activeEdge.target] : []);
    const visibleSteps = entry ? entry.progressive ? entry.steps.slice(0, state.step + 1) : entry.steps : [];
    const sceneEdges = new Set(entry ? [...(entry.contextEdges || []), ...visibleSteps.map(step => step.edge)] : []);
    const compare = comparison();
    const defs = shape('defs');
    Object.keys(kinds).forEach(type => {
      const marker = shape('marker', {id: `${prefix}-scope-arrow-${type}`, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto', markerUnits: 'userSpaceOnUse'});
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
    // Paint the current connection last so a reverse response path cannot hide it.
    [...data.relationships].sort((a, b) => Number(a.id === activeEdgeId) - Number(b.id === activeEdgeId)).forEach(edge => {
      if (!state.types.has(edge.type) || hiddenNode(nodes.get(edge.source)) || hiddenNode(nodes.get(edge.target))) return;
      const selected = edge.source === state.selected || edge.target === state.selected;
      const overviewEdge = (data.overviewEdges || ['target-a', 'target-b', 'sql', 'ha', 'disk-a', 'disk-b', 'mount-fs-a', 'mount-fs-b']).includes(edge.id);
      if (!state.all && !(entry ? sceneEdges.has(edge.id) : state.overview ? overviewEdge : selected) && !(compare && focused.has(edge.source) && focused.has(edge.target))) return;
      const d = route(edge);
      if (!d) return;
      const directional = !['association', 'check'].includes(edge.activity);
      const path = shape('path', {d, class: `scope-edge${inactiveEdges.has(edge.id) ? ' is-unavailable' : ''}${activeEdgeId === edge.id ? ` is-current${staticAction ? ' is-current-action' : ''}` : ''}`, 'data-edge': edge.id, 'data-type': edge.type, 'data-activity': edge.activity, 'data-unavailable': String(inactiveEdges.has(edge.id)), style: `--edge-color:var(--scope-${edge.type})`, ...(directional && !inactiveEdges.has(edge.id) ? {'marker-end': `url(#${prefix}-scope-arrow-${edge.type})`} : {})});
      path.append(shape('title', {}, `${inactiveEdges.has(edge.id) ? 'Not eligible in this step; no request is routed here. ' : ''}${activityNames[edge.activity]}: ${edge.description}`));
      edgeLayer.append(path); paths.set(edge.id, path);
    });
    data.nodes.forEach(node => {
      if (hiddenNode(node)) return;
      const status = nodeState(node.id);
      const classes = ['scope-node'];
      if (focused.has(node.id)) classes.push('is-related'); else classes.push('is-dim');
      if (state.selected === node.id) classes.push('is-selected');
      if (actionNodes.has(node.id)) classes.push('is-current-operation');
      if (status) classes.push('has-state');
      if (compare?.left.includes(node.id)) classes.push('is-left');
      if (compare?.right.includes(node.id)) classes.push('is-right');
      const styles = [status ? `--node-state-color:var(--scope-state-${status.tone})` : '', actionNodes.has(node.id) ? `--action-color:var(--scope-${activeEdge?.type || 'deployment'})` : ''].filter(Boolean).join(';');
      const group = shape('g', {class: classes.join(' '), 'data-node': node.id, ...(status ? {'data-node-status': status.tone} : {}), role: 'button', tabindex: 0, 'aria-label': `${nodeLabel(node.id)}. ${status ? `${status.label}. ${status.detail} ` : ''}${node.scope}. Select for placement, flow and study notes.`, 'aria-pressed': String(state.selected === node.id), ...(styles ? {style: styles} : {})});
      group.append(shape('rect', {x: node.x, y: node.y, width: node.w, height: node.h, rx: 9}));
      if (node.icon) group.append(shape('image', {x: node.x + 10, y: node.y + (node.h - 30) / 2, width: 30, height: 30, href: `${root.dataset.iconBase}Arch_${node.icon}_64.svg`, 'aria-hidden': 'true'}));
      else {
        group.append(shape('circle', {class: 'scope-symbol', cx: node.x + 25, cy: node.y + node.h / 2, r: 17}));
        group.append(shape('text', {class: 'scope-symbol-text', x: node.x + 25, y: node.y + node.h / 2 + 7}, node.id === 'client' ? '↗' : 'ID'));
      }
      const label = lines(nodeLabel(node.id), 14);
      label.forEach((line, index) => group.append(shape('text', {x: node.x + 52, y: node.y + (label.length === 2 ? 27 : node.h < 60 ? 30 : 31) + index * 21}, line)));
      if (label.length === 1 && node.h >= 60) group.append(shape('text', {class: 'scope-node-scope', x: node.x + 52, y: node.y + 51}, node.group.startsWith('priv') ? `PRIVATE · AZ ${node.group.slice(-1)}` : node.group.startsWith('pub') ? `PUBLIC · AZ ${node.group.slice(-1)}` : node.group.startsWith('az') ? `AZ ${node.group.slice(-1)} · NO SUBNET` : node.scope.startsWith('Global') ? 'GLOBAL / ACCOUNT' : node.scope === 'External' ? 'EXTERNAL' : 'REGIONAL / LOGICAL'));
      if (status) {
        const badge = shape('g', {class: 'scope-status-badge', 'data-status-for': node.id, 'aria-hidden': 'true'});
        badge.append(shape('rect', {x: node.x, y: node.y - 30, width: node.w, height: 24, rx: 5}), shape('text', {x: node.x + node.w / 2, y: node.y - 13}, status.label));
        group.append(badge);
      }
      nodeLayer.append(group);
    });
    svg.replaceChildren(defs, boundaryLayer, edgeLayer, nodeLayer);
    currentPath = paths.get(activeEdgeId) || null;
    packet = null;
    if (currentPath) {
      const edge = edges.get(activeEdgeId), label = edge.label.length > 37 ? edge.label.slice(0, 34) + '…' : edge.label;
      const permitted = new Set([...ancestors(nodes.get(edge.source).group), ...ancestors(nodes.get(edge.target).group)]);
      const unrelated = data.groups.filter(group => !['cloud', 'region'].includes(group.kind) && !permitted.has(group.id));
      const badge = shape('g', {class: 'scope-edge-label', style: `--edge-color:var(--scope-${edge.type})`});
      const width = label.length * 7.2 + 20;
      let labelPoint = null;
      for (const fraction of [.5, .35, .65, .2, .8]) {
        const point = currentPath.getPointAtLength(currentPath.getTotalLength() * fraction);
        const box = {x: point.x - width / 2, y: point.y - 46, w: width, h: 28};
        if (box.x < 0 || box.y < 0 || box.x + box.w > data.width) continue;
        const overlaps = data.nodes.some(node => { const bounds = nodeBounds(node); return !hiddenNode(node) && box.x < bounds.x + bounds.w + 5 && box.x + box.w > bounds.x - 5 && box.y < bounds.y + bounds.h + 5 && box.y + box.h > bounds.y - 5; });
        const crossesBoundary = unrelated.some(group => box.x < group.x + group.w && box.x + box.w > group.x && box.y < group.y + group.h && box.y + box.h > group.y);
        const coversHeading = data.groups.some(group => box.x < group.x + 14 + Math.min(group.w - 65, group.label.length * 10) && box.x + box.w > group.x + 9 && box.y < group.y + 35 && box.y + box.h > group.y + 5);
        if (!overlaps && !crossesBoundary && !coversHeading) { labelPoint = point; break; }
      }
      if (labelPoint) {
        badge.append(shape('rect', {x: labelPoint.x - width / 2, y: labelPoint.y - 44, width, height: 26, rx: 5}), shape('text', {x: labelPoint.x, y: labelPoint.y - 26}, label));
        svg.append(badge);
      }
      if (edge.packet && entry.mode !== 'comparison') {
        const width = Math.max(46, edge.packet.length * 8 + 16);
        packet = shape('g', {class: 'scope-packet', 'aria-hidden': 'true', 'data-packet': edge.packet, style: `--edge-color:var(--scope-${edge.type})`});
        packet.append(shape('rect', {x: -width / 2, y: -14, width, height: 28, rx: edge.activity === 'response' ? 14 : 4}), shape('text', {y: 4}, edge.packet));
        // Service boxes mask the marker at connection endpoints, keeping it
        // from covering their labels while entering or leaving a service.
        svg.insertBefore(packet, nodeLayer); movePacket();
      }
    }
    root.querySelectorAll('[data-scope-category]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.scopeCategory === state.category)));
    const statusPanel = get('detail').querySelector('[data-scope-node-state]');
    if (statusPanel) {
      const status = nodeState(statusPanel.dataset.scopeNodeState);
      get('detail').querySelector(':scope > strong').textContent = nodeLabel(statusPanel.dataset.scopeNodeState);
      statusPanel.hidden = !status;
      statusPanel.textContent = status ? `At this step · ${status.label}: ${status.detail}` : '';
    }
    get('match').textContent = state.search ? `${focused.size} matching nodes · Enter to focus` : `${data.nodes.length} placed resources · ${data.scenarios.length} scenarios`;
  }
  function panelSection(panel, title, text) {
    panel.append(html('h5', title), html('p', text));
  }
  function showNode(id, focus = false) {
    if (nodes.get(id)?.scenarios && !nodes.get(id).scenarios.includes(state.scenario)) id = initialNode;
    const node = nodes.get(id);
    if (!node) return;
    pause(); state.selected = id; expandFor([id]);
    const panel = get('detail'); panel.replaceChildren(html('strong', nodeLabel(id)), html('span', `${data.categories[node.category]} · ${node.scope}`, 'dva-scope-placement'), html('p', node.description));
    const statusPanel = html('p', undefined, 'dva-scope-current-state'); statusPanel.dataset.scopeNodeState = id; statusPanel.hidden = true; panel.append(statusPanel);
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
      const symbol = ['association', 'check'].includes(edge.activity) ? '—' : edge.source === id ? '→' : '←';
      const button = html('button', `${symbol} ${nodeLabel(target)} · ${edge.label}`); button.type = 'button'; button.dataset.scopeRelated = target; relations.append(button);
    }); panel.append(relations);
    render();
    if (focus) fit([id]);
  }
  function showComparison() {
    const entry = comparison();
    if (!entry) { showNode(state.selected); return; }
    pause(); clearStudy(); state.overview = false; state.scenario = ''; get('scenario').value = ''; state.category = ''; clearSearch();
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
  function stepDuration() {
    const words = scenario()?.steps[state.step]?.text.trim().split(/\s+/).length || 0;
    return Math.max(5500, Math.min(12000, words * 300 + 1200));
  }
  function movePacket() {
    if (!packet || !currentPath) return;
    const fraction = Math.min(1, state.elapsed / stepDuration());
    const at = currentPath.getPointAtLength(currentPath.getTotalLength() * (matchMedia('(prefers-reduced-motion: reduce)').matches ? fraction > .5 ? 1 : 0 : fraction));
    packet.setAttribute('transform', `translate(${at.x} ${at.y})`);
  }
  function pause() {
    state.running = false; cancelAnimationFrame(frame); state.lastFrame = 0;
    updatePlayer();
  }
  function animate(time) {
    if (!state.running) return;
    if (state.lastFrame) state.elapsed += time - state.lastFrame;
    state.lastFrame = time; movePacket();
    if (state.elapsed >= stepDuration()) {
      const entry = scenario();
      if (!entry || state.step >= entry.steps.length - 1) { pause(); return; }
      state.step++; state.elapsed = 0; showStep();
    }
    frame = requestAnimationFrame(animate);
  }
  function updatePlayer() {
    const entry = scenario();
    root.dataset.scopeRunning = String(state.running);
    const complete = entry && state.step === entry.steps.length - 1 && state.elapsed >= stepDuration();
    get('run').disabled = !entry; get('previous').disabled = !entry || state.step === 0; get('next').disabled = !entry || state.step === entry.steps.length - 1;
    get('step').disabled = !entry;
    const noun = entry?.mode === 'comparison' ? 'walkthrough' : 'simulation';
    get('run').textContent = state.running ? `Pause ${noun}` : complete ? `Replay ${noun}` : `Run ${noun}`;
    get('run').setAttribute('aria-pressed', String(state.running));
    get('progress').textContent = entry ? complete ? `Completed ${entry.steps.length} steps · replay or inspect any step.` : `Step ${state.step + 1} / ${entry.steps.length} · ${state.running ? 'Running — pause to inspect' : 'Paused — ready to run'}` : 'Choose an architecture scenario above to enable Run.';
    get('scenario-notes').hidden = !entry;
    if (!entry) {
      const emptyStep = html('option', 'No steps available'); emptyStep.value = '';
      get('step').replaceChildren(emptyStep);
      get('step-detail').replaceChildren(html('p', comparison() ? 'Comparison highlights responsibilities and placement. Choose a scenario above to follow an operation.' : 'Run follows named operations, not one packet through every box. Pause or use the step controls to inspect a connection.'));
    }
  }
  function showStep() {
    const entry = scenario();
    if (!entry) { get('step').replaceChildren(); updatePlayer(); return; }
    get('step').replaceChildren(...entry.steps.map((step, index) => { const option = html('option', `${index + 1}. ${step.phase}`); option.value = index; return option; }));
    get('step').value = String(state.step);
    const step = entry.steps[state.step], edge = edges.get(step.edge), result = get('step-detail');
    const kind = {incident: 'Failure event', state: 'State transition', observe: 'Evidence check', verify: 'Verification', decision: 'Control decision'}[step.kind];
    const type = html('span', `${state.step + 1} · ${step.phase.toUpperCase()} · ${edge ? activityNames[edge.activity] : kind || 'Local / internal step'}`, 'dva-scope-step-type');
    if (edge) type.style.color = `var(--scope-${edge.type})`;
    const routeLabel = edge ? `${nodeLabel(edge.source)} ${connector(edge)} ${nodeLabel(edge.target)}` : `${nodeLabel(step.node)} · ${kind ? kind.toLowerCase() : 'local / internal operation'}`;
    const meaning = entry.mode === 'comparison' ? 'Comparison walkthrough: independent patterns, not a sequential traffic path.' : edge?.packet ? `Moving label “${edge.packet}”: this named operation only. Each new call or response has its own arrow.` : edge?.activity === 'association' ? 'Configuration relationship · no packet or extra network hop.' : edge?.activity === 'check' ? 'Policy / configuration check · no packet or extra network hop.' : edge?.activity === 'control' ? 'Logical control-plane handoff · no application packet or extra HTTP probe.' : step.kind === 'incident' ? 'Failure event: no packet causes the outage. Resource labels show the resulting condition.' : kind ? 'Resource labels show this step’s state. This is not an extra network hop.' : 'Local or service-internal work · no extra API hop.';
    result.replaceChildren(type, html('strong', routeLabel, 'dva-scope-step-route'), html('p', step.text), ...(step.summary ? [html('p', step.summary, 'dva-scope-state-summary')] : []), html('small', meaning, 'dva-scope-step-meaning'));
    get('scenario-notes').replaceChildren(html('p', `Architecture note: ${entry.note}`), html('p', `Exam boundary: ${entry.exam}`));
    if (entry.practice?.length) {
      const practice = html('p', 'Try the matching question before reviewing the full flow: ');
      entry.practice.forEach((id, index) => {
        const link = html('a', catalogue.practice?.find(question => question.id === id)?.title || `Case ${index + 1}`);
        link.href = `#${prefix}-question-${id}`;
        link.dataset[`${prefix}Question`] = id;
        practice.append(link, document.createTextNode(index < entry.practice.length - 1 ? ' · ' : ''));
      });
      get('scenario-notes').append(practice);
    }
    if (edge && !state.types.has(edge.type)) result.append(html('p', 'This connection type is hidden in the legend; enable it to show this connection.'));
    render(); updatePlayer();
  }
  function chooseScenario(id) {
    pause(); clearStudy(); state.overview = !id; state.scenario = id; state.comparison = ''; state.category = ''; state.search = id ? '' : scenarioQuery; state.step = 0; state.elapsed = 0;
    get('compare').value = ''; updateScenarioOptions();
    const entry = scenario();
    if (entry) {
      const ids = [...sceneNodes(entry)]; expandFor(ids);
      state.selected = entry.steps[0].node || edges.get(entry.steps[0].edge).target;
      showNode(state.selected); showStep(); fit(ids);
    } else { showNode(state.selected); get('step-detail').replaceChildren(html('p', 'Select any resource for placement and relationships, or choose a scenario for numbered steps.')); updatePlayer(); fit(); }
  }
  function study() {
    pause(); get('study-panel').hidden = !get('study').checked;
    if (!get('study').checked) { render(); return; }
    state.overview = false; state.scenario = ''; state.comparison = ''; state.category = ''; state.search = '';
    get('scenario').value = ''; get('compare').value = ''; clearSearch(); updatePlayer();
    const question = data.study[Number(get('question').value)];
    get('answer').textContent = question.answer; expandFor(question.nodes); render(); fit(question.nodes);
  }
  function clearStudy() { get('study').checked = false; get('study-panel').hidden = true; }
  root.addEventListener('click', event => {
    const collapse = event.target.closest('[data-collapse]');
    if (collapse) { pause(); const id = collapse.dataset.collapse; if (state.collapsed.has(id)) state.collapsed.delete(id); else state.collapsed.add(id); render(); return; }
    const selected = event.target.closest('[data-node]');
    if (selected) { state.overview = false; state.search = ''; showNode(selected.dataset.node, view.w > 1600); return; }
    const related = event.target.closest('[data-scope-related]');
    if (related) { state.scenario = ''; get('scenario').value = ''; showNode(related.dataset.scopeRelated, true); updatePlayer(); return; }
    const category = event.target.closest('[data-scope-category]');
    if (category) { pause(); clearStudy(); state.overview = !category.dataset.scopeCategory; state.category = category.dataset.scopeCategory; state.comparison = ''; state.scenario = ''; clearSearch(); get('scenario').value = ''; get('compare').value = ''; const ids = [...relatedIds()]; expandFor(ids); render(); updatePlayer(); fit(state.category ? ids : undefined); }
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
  get('search').addEventListener('input', event => applySearch(event.target.value));
  get('search').addEventListener('keydown', event => {
    if (event.key === 'Escape' && scenarioQuery) { event.preventDefault(); get('search').value = ''; applySearch(''); return; }
    if (event.key !== 'Enter' || !scenarioQuery) return;
    state.search = scenarioQuery;
    const ids = matchingNodes(scenarioQuery).map(node => node.id);
    if (ids.length) { expandFor(ids); showNode(ids[0]); fit(ids.slice(0, 8)); }
  });
  get('step').addEventListener('change', event => { pause(); state.step = Number(event.target.value); state.elapsed = 0; showStep(); });
  ['previous', 'next'].forEach(name => get(name).addEventListener('click', () => { pause(); const entry = scenario(); if (!entry) return; state.step = Math.min(entry.steps.length - 1, Math.max(0, state.step + (name === 'previous' ? -1 : 1))); state.elapsed = 0; showStep(); }));
  get('run').addEventListener('click', () => {
    if (state.running) { pause(); return; }
    const entry = scenario(); if (!entry) return;
    expandFor([...sceneNodes(entry)]); render();
    if (state.step === entry.steps.length - 1 && state.elapsed >= stepDuration()) { state.step = 0; state.elapsed = 0; showStep(); }
    state.running = true; state.lastFrame = 0; updatePlayer(); frame = requestAnimationFrame(animate);
  });
  get('zoom-in').addEventListener('click', () => zoom(.8)); get('zoom-out').addEventListener('click', () => zoom(1.25));
  get('reset').addEventListener('click', () => { pause(); state.collapsed.clear(); state.category = ''; clearSearch(); state.all = false; get('connections').checked = false; state.types = new Set(Object.keys(kinds)); get('legend').querySelectorAll('input').forEach(input => { input.checked = true; }); render(); fitContext(); });
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
  showNode(initialNode); updatePlayer(); fit();
  function fitContext() {
    const entry = scenario(), compare = comparison();
    if (entry) fit([...sceneNodes(entry)]);
    else if (compare) fit([...new Set([...compare.left, ...compare.right])]);
    else fit();
  }
  new ResizeObserver(fitContext).observe(svg);
  const header = document.querySelector('.site-header');
  if (header) {
    const headerOffset = () => root.style.setProperty('--scope-header-offset', `${header.getBoundingClientRect().height}px`);
    new ResizeObserver(headerOffset).observe(header); headerOffset();
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
})();
