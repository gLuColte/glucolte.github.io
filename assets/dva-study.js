(() => {
  'use strict';
  const root = document.getElementById('dva-study');
  const source = document.getElementById('dva-study-data');
  if (!root || !source) return;
  const data = JSON.parse(source.textContent);
  const get = id => document.getElementById(`dva-${id}`);
  const make = (tag, text, className) => {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  };

  // The HTML references remain usable without JavaScript or native dialogs.
  const dialog = get('service-dialog');
  const supportsDialog = typeof dialog.showModal === 'function';
  function showCard(key) {
    key = (data.cardAliases || {})[key] || key;
    const card = data.cards[key];
    const reference = get(`service-${key}`);
    if (!card || !reference) return;
    if (!supportsDialog) {
      reference.open = true;
      reference.scrollIntoView({block: 'start'});
      return;
    }
    get('card-title').textContent = card.name;
    get('card-body').replaceChildren(reference.querySelector('.dva-card-content').cloneNode(true));
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
  }
  root.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const hash = link.getAttribute('href') || '';
    const key = link.dataset.service || (hash.startsWith('#dva-service-') ? hash.slice(13) : '');
    if (!data.cards[key]) return;
    event.preventDefault();
    showCard(key);
  });
  if (supportsDialog) root.classList.add('dva-has-dialog');

  // A local REST API walkthrough. Delegation also works inside cloned cards.
  function apiGatewayExample(example) {
    const beta = example.dataset.stage === 'beta';
    const stage = beta ? 'beta' : 'prod';
    const scenario = example.dataset.case;
    const canary = scenario === 'canary' && !beta;
    const cached = scenario === 'cache' && !beta;
    const deployment = beta || canary ? 'd2' : 'd1';
    const alias = canary ? 'canary' : stage;
    const version = beta || canary ? 'v2' : 'v1';
    const status = {token: 401, key: 403, parameter: 400, throttle: 429}[scenario] || 200;
    const stoppedAt = ['token', 'key'].includes(scenario) ? 2 : status !== 200 ? 3 : 0;
    const part = name => example.querySelector(`[data-apigw-${name}]`);
    example.querySelectorAll('[data-apigw-stage]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.apigwStage === stage)));
    part('case').value = scenario;
    const request = [`GET https://a1b2c3d4e5.execute-api.ap-southeast-2.amazonaws.com/${stage}/GetOrder${scenario === 'parameter' ? '' : '?orderId=o-42'}`];
    if (scenario !== 'token') request.push('Authorization: <Cognito access JWT>');
    if (scenario !== 'key') request.push('x-api-key: <PartnerApp API key>');
    part('request').textContent = request.join('\n');
    const route = `${stage} → API deployment ${deployment}`;
    const outcome = {token: 'Missing token; no Lambda invocation.', key: 'Missing required API key; no Lambda invocation.', parameter: 'Missing required query parameter; no Lambda invocation.', throttle: 'Throttled; no Lambda invocation.'}[scenario];
    part('result').textContent = status === 200
      ? `200 OK · ${route} → ${cached ? 'cached response (Lambda skipped)' : `orders:${alias} (${version})`}`
      : `${status} · ${route} · ${outcome}`;
    part('result').className = status === 200 ? 'dva-result-rule' : 'dva-result-blocked';

    const steps = [
      ['URL → stage → deployment', `/${stage} selects ${stage}, pointing to API deployment ${deployment}. /GetOrder is the resource; GET is the method.${canary ? ' This request was selected for the 10% canary on the same /prod URL.' : ''}`],
      ['Who is calling?', scenario === 'token'
        ? '401: the Cognito authorizer requires a valid access token with orders/read scope. An API key alone cannot authenticate the user.'
        : scenario === 'key'
          ? '403: this method requires an API key attached to a plan covering this stage. A valid user token does not replace that key.'
          : 'The Cognito authorizer validates the access token and required orders/read scope. The API key separately identifies PartnerApp for its usage plan.'],
      ['Validate input & apply usage limits', scenario === 'parameter'
        ? '400: the request validator requires a non-empty orderId. Presence validation does not establish that the order exists or belongs to the user.'
        : scenario === 'throttle'
          ? '429: this example triggers a usage-plan throttle. PartnerDemo targets 10 requests/s, burst capacity 20, and 1,000/day per key across prod + beta; enforcement is best effort.'
          : 'Require orderId and an API key on this method. PartnerDemo targets 10 requests/s, burst capacity 20, and 1,000/day per key across prod + beta.'],
      ['Cache → mapping → integration', cached
        ? 'A fresh cached response exists for this same Authorization token + orderId. Return it without running the mapping or Lambda. API access checks still apply.'
        : `${beta ? 'The beta cache is disabled.' : canary ? 'This canary bypasses the stage cache (useStageCache=false).' : 'The GET cache has no matching entry.'} A non-proxy VTL mapping creates the JSON below. The integration uses stage variable functionAlias=${alias} to invoke orders:${alias}.`],
      ['Backend → response', cached
        ? 'Return the previously authorized result. Lambda does not run again; data and entitlement changes need suitable TTL/invalidation.'
        : `Lambda checks that user-42 may read order o-42, loads the order, and returns ${version}. Integration/method response settings expose that result as HTTP 200.`]
    ];
    part('steps').replaceChildren(...steps.map(([title, description], index) => {
      const step = make('li');
      const skipped = stoppedAt && index + 1 > stoppedAt;
      step.dataset.state = skipped ? 'skipped' : index + 1 === stoppedAt ? 'blocked' : 'passed';
      step.append(make('strong', title), make('p', skipped ? 'Not reached — API Gateway rejected this request before backend work.' : description));
      return step;
    }));
    const invokesLambda = status === 200 && !cached;
    part('payload-title').textContent = invokesLambda ? 'Mapped Lambda input · custom/non-proxy integration' : 'Lambda input · not sent';
    part('payload').textContent = invokesLambda
      ? JSON.stringify({orderId: 'o-42', environment: stage, callerSub: 'user-42'}, null, 2)
      : cached ? 'Cache hit — no Lambda invocation.' : 'Request rejected — no Lambda invocation.';
    part('response').textContent = status === 200
      ? `HTTP 200\n${JSON.stringify({orderId: 'o-42', status: 'READY', apiVersion: version}, null, 2)}`
      : `HTTP ${status}\n${JSON.stringify({message: {401: 'Unauthorized', 403: 'Forbidden', 400: 'Missing required request parameter: orderId', 429: 'Too Many Requests'}[status]}, null, 2)}\n// Illustrative error body; gateway responses are configurable.`;
    part('detail').textContent = canary
      ? 'Canary: 10% random selection, not every tenth request. Keep environment=prod; override only functionAlias=canary to reach the production candidate v2. The caller still uses /prod and the same usage plan.'
      : beta && scenario === 'canary'
        ? 'No canary is configured on beta in this example. /beta directly uses candidate deployment d2 / alias beta. A production canary tests live traffic on /prod instead.'
        : beta && scenario === 'cache'
          ? 'beta has caching disabled, so even a repeated order request invokes Lambda. prod enables GET caching for 60 s, keyed by Authorization + orderId.'
          : 'prod: GET caching enabled, TTL 60 s, cache keys = Authorization + orderId. beta: cache disabled. A cache hit skips Lambda; it must never cross user/tenant boundaries.';
  }
  root.querySelectorAll('[data-apigw-demo]').forEach(apiGatewayExample);
  root.addEventListener('click', event => {
    const button = event.target.closest('[data-apigw-stage]');
    if (!button) return;
    const example = button.closest('[data-apigw-demo]');
    example.dataset.stage = button.dataset.apigwStage;
    apiGatewayExample(example);
  });
  root.addEventListener('change', event => {
    if (!event.target.matches('[data-apigw-case]')) return;
    const example = event.target.closest('[data-apigw-demo]');
    example.dataset.case = event.target.value;
    apiGatewayExample(example);
  });

  function crossZoneExample(example) {
    const enabled = example.dataset.crossZone === 'enabled';
    example.querySelectorAll('[data-cross-zone]').forEach(button => button.setAttribute('aria-pressed', String((button.dataset.crossZone === 'enabled') === enabled)));
    example.querySelectorAll('[data-balancing-target]').forEach(target => {
      target.textContent = enabled ? '10%' : target.dataset.balancingTarget === 'a' ? '25%' : '6.25%';
    });
    example.querySelector('[data-balancing-total="a"]').textContent = enabled ? '20% total · 20 requests/s' : '50% total · 50 requests/s';
    example.querySelector('[data-balancing-total="b"]').textContent = enabled ? '80% total · 80 requests/s' : '50% total · 50 requests/s';
    example.querySelector('[data-balancing-route]').textContent = enabled
      ? 'Each LB node can send its share to all 10 targets across both AZs.'
      : 'Each LB node can send its 50% only to targets in its own AZ.';
    example.querySelector('[data-balancing-result]').textContent = enabled
      ? 'Cross-zone ON: 100% ÷ 10 = 10% per target. AZ A receives 20%; AZ B receives 80%.'
      : 'Cross-zone OFF: AZ A → 50% ÷ 2 = 25% per target; AZ B → 50% ÷ 8 = 6.25% per target. Each AZ still receives 50%.';
  }
  root.querySelectorAll('[data-balancing-demo]').forEach(crossZoneExample);
  root.addEventListener('click', event => {
    const button = event.target.closest('button[data-cross-zone]');
    if (!button) return;
    const example = button.closest('[data-balancing-demo]');
    example.dataset.crossZone = button.dataset.crossZone;
    crossZoneExample(example);
  });

  function kinesisShardsExample(example) {
    const field = name => example.querySelector(`[data-shards-${name}]`);
    const rate = Number(field('rate').value);
    const count = Number(field('count').value);
    const hot = field('keys').value === 'hot';
    if (!field('rate').value || !Number.isInteger(rate) || rate < 1 || rate > 10000) {
      field('result').textContent = 'Enter a whole-number arrival rate from 1 to 10,000 records/s.';
      field('result').className = 'dva-result-blocked';
      field('calculation').textContent = 'The lanes retain the last valid example until the input is valid.';
      return;
    }
    field('producer').textContent = `${rate.toLocaleString()} records/s × 4 KiB = ${(rate / 256).toFixed(3)} MiB/s`;
    field('routing').textContent = hot
      ? 'Every record uses device01. Its hash maps to one shard at a time; unused shards cannot absorb that key’s excess traffic.'
      : count === 1
        ? 'Many keys are assumed evenly distributed in this model. With one shard, all records still enter that lane.'
        : `Many partition keys are assumed evenly distributed across ${count} shard hash ranges. Multiple keys do not guarantee an even real-world workload.`;
    let overloaded = false;
    field('lanes').replaceChildren(...Array.from({length: count}, (_, index) => {
      const records = hot ? index === 0 ? rate : 0 : rate / count;
      const bytes = records / 256;
      const exceeds = bytes > 1 || records > 1000;
      overloaded ||= exceeds;
      const lane = make('div', undefined, 'dva-shard-lane');
      lane.dataset.overloaded = String(exceeds);
      const heading = make('div', undefined, 'dva-shard-heading');
      heading.append(make('strong', `Shard ${index + 1}`), make('span', `Incoming: ${Number(records.toFixed(2)).toLocaleString()} records/s · ${bytes.toFixed(3)} MiB/s`));
      const blocks = make('div', undefined, 'dva-shard-records');
      blocks.setAttribute('aria-label', 'Illustrative records in stored order; not one block per actual record');
      if (records) {
        [`r${index * 3 + 1}`, `r${index * 3 + 2}`, `r${index * 3 + 3}`, '…'].forEach(text => blocks.append(make('span', text)));
        blocks.append(make('b', '→'));
      } else blocks.append(make('small', 'No incoming records for this shard'));
      const meter = make('div', undefined, 'dva-shard-meter');
      meter.setAttribute('aria-hidden', 'true');
      const fill = make('span'); fill.style.width = `${Math.min(100, bytes * 100)}%`; meter.append(fill);
      lane.append(heading, blocks, meter, make('small', `Demand: ${Math.round(bytes * 100)}% of byte budget · ${Math.round(records / 10)}% of record budget · ${exceeds ? 'over capacity' : 'within capacity'}`));
      return lane;
    }));
    field('result').className = overloaded ? 'dva-result-blocked' : 'dva-result-rule';
    field('result').textContent = overloaded
      ? hot && count > 1
        ? `Hot key: shard 1 is over capacity while ${count - 1} shard(s) sit idle. Adding shards alone does not split one partition key. Revisit key design while preserving the ordering your application needs.`
        : `${rate.toLocaleString()} records/s exceed the sustained budget of ${count} shard(s). Some writes can be throttled; retry failed records with backoff and jitter.`
      : `Fits the sustained write budget: ${count} shard(s), ${hot ? 'one active key' : 'assumed even distribution'}. Leave headroom for bursts and skew; this does not guarantee that consumers keep up.`;
    field('calculation').textContent = `Per shard: min(1,000 records/s, 1,024 KiB/s ÷ 4 KiB) = 256 records/s. At ${rate.toLocaleString()} records/s, at least ${Math.ceil(rate / 256)} evenly loaded shard(s) are needed before headroom.${hot ? ' That aggregate estimate cannot solve a single hot key.' : ''} The three record blocks per lane illustrate order, not a real-time count.`;
  }
  root.querySelectorAll('[data-shards-demo]').forEach(kinesisShardsExample);
  root.addEventListener('input', event => {
    if (event.target.matches('[data-shards-rate]')) kinesisShardsExample(event.target.closest('[data-shards-demo]'));
  });
  root.addEventListener('change', event => {
    if (event.target.matches('[data-shards-count], [data-shards-keys]')) kinesisShardsExample(event.target.closest('[data-shards-demo]'));
  });

  // One connected system: selection explains ownership; situations trace handoffs.
  const architecture = data.architecture;
  const map = get('architecture-map');
  const nodes = new Map(architecture.nodes.map(node => [node.id, node]));
  const laneNames = {delivery: 'Developer / delivery · control plane', runtime: 'User / request · application data plane', async: 'Events / background work · application data plane', support: 'Applies across every flow'};
  let selectedNode = architecture.nodes[0].id;
  let activeScenario = null;
  function servicesFor(keys) {
    const container = make('div', undefined, 'aws-map dva-concept-services');
    container.append(make('span', 'Theory → services', 'dva-eyebrow'));
    keys.forEach(key => {
      const card = data.cards[key];
      const link = make('a', card.name, 'aws-map__chip');
      link.href = card.read; link.dataset.service = key;
      container.append(link);
    });
    return container;
  }
  function explanation(label, text) {
    const item = make('div');
    item.append(make('strong', label), make('p', text));
    return item;
  }
  function paintMap() {
    const path = new Set(activeScenario ? activeScenario.path : []);
    const aws = map.dataset.services === 'true';
    map.querySelectorAll('[data-dva-node]').forEach(link => {
      const node = nodes.get(link.dataset.dvaNode);
      const selected = node.id === selectedNode;
      link.classList.toggle('is-selected', selected);
      link.classList.toggle('is-on-path', path.has(node.id));
      link.classList.toggle('is-dim', Boolean(activeScenario) && !path.has(node.id));
      link.classList.toggle('is-failed', Boolean(activeScenario) && node.id === activeScenario.failed);
      if (selected) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
      const status = activeScenario && node.id === activeScenario.failed ? ' First boundary to inspect.' : '';
      link.setAttribute('aria-label', `${node.title}: ${(aws ? node.services : node.role).join('; ')}. Select to inspect.${status}`);
    });
    map.querySelectorAll('[data-dva-edge-from]').forEach(edge => {
      const active = path.has(edge.dataset.dvaEdgeFrom) && path.has(edge.dataset.dvaEdgeTo);
      edge.classList.toggle('is-traced', Boolean(activeScenario) && active);
      edge.classList.toggle('is-dim', Boolean(activeScenario) && !active);
    });
  }
  function selectNode(id, keepScenario = false) {
    const node = nodes.get(id);
    if (!node) return;
    selectedNode = id;
    get('node-select').value = id;
    if (!keepScenario) {
      activeScenario = null;
      get('map-scenario').value = '';
      get('map-investigation').hidden = true;
      get('map-investigation').replaceChildren();
    }
    get('concept-title').textContent = node.title;
    get('concept-lane').textContent = laneNames[node.lane];
    const panel = get('concept-panel');
    panel.dataset.node = id;
    const grid = make('div', undefined, 'dva-concept-grid');
    grid.append(explanation('Owns', node.owns), explanation('Handoff to the other flow', node.handoff));
    const boundary = make('p', undefined, 'dva-example');
    boundary.append(make('strong', 'Decision boundary. '), document.createTextNode(node.boundary));
    const situation = make('div', undefined, 'dva-concept-grid');
    situation.append(explanation('Make it concrete', node.situation), explanation('Evidence to inspect', node.evidence));
    const domains = make('p', 'Exam domains: ', 'dva-note');
    node.domains.forEach((id, index) => {
      const domain = architecture.domains.find(item => item.id === id);
      if (index) domains.append(document.createTextNode(' · '));
      const link = make('a', domain.title); link.href = domain.url; domains.append(link);
    });
    const read = make('p');
    const link = make('a', 'Explore this boundary below ↓'); link.href = `#${node.target}`; read.append(link);
    panel.replaceChildren(make('p', node.purpose), grid, boundary, situation, servicesFor(node.keys), domains, read);
    paintMap();
  }
  map.querySelectorAll('[data-dva-node]').forEach(link => link.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    selectNode(link.dataset.dvaNode);
  }));
  get('node-select').addEventListener('change', event => {
    selectNode(event.currentTarget.value);
    get('concept-title').scrollIntoView({behavior: 'smooth', block: 'start'});
  });
  get('service-labels').addEventListener('click', event => {
    const enabled = map.dataset.services !== 'true';
    map.dataset.services = String(enabled);
    event.currentTarget.setAttribute('aria-pressed', String(enabled));
    event.currentTarget.textContent = enabled ? 'Show theory' : 'Show AWS services';
    map.querySelectorAll('[data-theory-label]').forEach(label => label.setAttribute('aria-hidden', String(enabled)));
    map.querySelectorAll('[data-service-label]').forEach(label => label.setAttribute('aria-hidden', String(!enabled)));
    paintMap();
  });
  function traceScenario(id) {
    const scenario = architecture.scenarios.find(item => item.id === id);
    if (!scenario) { selectNode(selectedNode); return; }
    activeScenario = scenario;
    selectNode(scenario.failed, true);
    get('map-scenario').value = id;
    const investigation = get('map-investigation');
    const responsibilities = make('ul', undefined, 'dva-trace-path');
    responsibilities.setAttribute('aria-label', 'Highlighted responsibilities to inspect');
    scenario.path.forEach(id => responsibilities.append(make('li', nodes.get(id).title)));
    const grid = make('div', undefined, 'dva-concept-grid');
    grid.append(explanation('Inspect the evidence', scenario.evidence), explanation('Choose the repair', scenario.decision));
    investigation.replaceChildren(make('strong', `First boundary to inspect: ${nodes.get(scenario.failed).title}`, 'dva-result-blocked'), make('p', scenario.prompt), responsibilities, grid, make('p', `What changes the diagnosis? ${scenario.change}`, 'dva-note'));
    investigation.hidden = false;
  }
  get('map-scenario').addEventListener('change', event => traceScenario(event.currentTarget.value));
  map.classList.add('dva-map-ready');

  function deployment(id) {
    const item = data.deployments.find(strategy => strategy.id === id);
    if (!item) return;
    root.querySelectorAll('[data-dva-deployment]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.dvaDeployment === id)));
    const result = get('deployment-result');
    result.replaceChildren(make('strong', `${item.name} · baseline 8; temporary extra ${item.extra}`));
    const fleet = make('div', undefined, 'dva-fleet');
    [['Old version', item.old, 'old'], ['New candidate', item.new, 'new'], ['Updating / unavailable', item.offline, 'offline']].forEach(([label, count, kind]) => {
      if (!count) return;
      const row = make('div', undefined, 'dva-fleet-row');
      row.append(make('span', `${label}: ${count}`));
      const boxes = make('span', undefined, 'dva-instance-row');
      boxes.setAttribute('aria-hidden', 'true');
      for (let n = 0; n < count; n += 1) boxes.append(make('i', undefined, `dva-instance dva-instance--${kind}`));
      row.append(boxes);
      fleet.append(row);
    });
    result.append(fleet, make('p', item.traffic), make('p', item.rule, 'dva-result-rule'), make('p', `Recovery: ${item.rollback}`));
  }
  root.querySelectorAll('[data-dva-deployment]').forEach(button => button.addEventListener('click', () => deployment(button.dataset.dvaDeployment)));

  const number = value => new Intl.NumberFormat('en', {maximumFractionDigits: 2}).format(value);
  const queueInputs = ['visible', 'workers', 'processing', 'wait'].map(get);
  function queue() {
    const result = get('queue-result');
    if (queueInputs.some(input => input.value === '' || !input.validity.valid || !Number.isFinite(Number(input.value)))) {
      result.replaceChildren(make('p', 'Enter valid values within the displayed input ranges. Workers may be zero; processing time and wait budget must be positive.'));
      return;
    }
    const [visible, workers, processing, wait] = queueInputs.map(input => Number(input.value));
    const target = wait / processing;
    const required = Math.ceil(visible / target);
    result.replaceChildren(make('p', `Target backlog = ${number(wait)} seconds / ${number(processing)} seconds per message = ${number(target)} messages per worker.`));
    if (workers === 0) {
      result.append(make('p', visible ? `No running workers: backlog per worker is undefined. The estimate needs ${number(required)} workers; a separate scale-from-zero signal must start capacity.` : 'No messages and no workers. Start capacity when new work arrives using a configured scale-from-zero signal.', 'dva-result-rule'));
      return;
    }
    const backlog = visible / workers;
    result.prepend(make('p', `Current backlog = ${number(visible)} visible messages / ${number(workers)} workers = ${number(backlog)} messages per worker.`));
    result.append(make('p', `Estimated workers for this target: ceil(${number(visible)} / ${number(target)}) = ${number(required)}. ${backlog > target ? 'Above target: add capacity if the service and downstream limits allow.' : 'At or below target: additional capacity is not indicated by this signal.'}`, 'dva-result-rule'));
  }
  queueInputs.forEach(input => input.addEventListener('input', queue));

  let identityId = data.identity[0].id;
  function identityResult() {
    const path = data.identity.find(item => item.id === identityId);
    const trust = get('trust').checked;
    const permitted = get('permission').checked;
    const result = get('identity-result');
    result.textContent = !trust ? path.failureTrust : !permitted ? path.failurePermission : path.success;
    result.className = trust && permitted ? 'dva-result-rule' : 'dva-result-blocked';
  }
  function identity(id) {
    if (!data.identity.some(path => path.id === id)) return;
    identityId = id;
    root.querySelectorAll('[data-dva-identity-panel]').forEach(panel => { panel.hidden = panel.dataset.dvaIdentityPanel !== id; });
    root.querySelectorAll('[data-dva-identity]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.dvaIdentity === id)));
    get('trust').checked = true;
    get('permission').checked = true;
    identityResult();
  }
  root.querySelectorAll('[data-dva-identity]').forEach(button => button.addEventListener('click', () => identity(button.dataset.dvaIdentity)));
  ['trust', 'permission'].forEach(id => get(id).addEventListener('change', identityResult));

  function question(id) {
    const entry = data.practice.find(item => item.id === id);
    if (!entry) return;
    const content = get('question-content');
    const fieldset = make('fieldset', undefined, 'dva-answers');
    fieldset.append(make('legend', entry.prompt));
    const feedback = make('div');
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    feedback.setAttribute('aria-atomic', 'true');
    entry.options.forEach((option, index) => {
      const label = make('label');
      const radio = make('input');
      radio.type = 'radio'; radio.name = 'dva-answer'; radio.value = String(index);
      label.append(radio, make('span', option));
      radio.addEventListener('change', () => {
        fieldset.querySelectorAll('label').forEach(item => item.classList.remove('dva-answer-correct', 'dva-answer-wrong'));
        const labels = fieldset.querySelectorAll('label');
        labels[entry.answer].classList.add('dva-answer-correct');
        if (index !== entry.answer) label.classList.add('dva-answer-wrong');
        feedback.replaceChildren(make('strong', index === entry.answer ? 'Correct — the requirement decides it.' : `Review the boundary. Best answer: ${entry.options[entry.answer]}`), make('p', entry.why), make('p', `What changes the answer? ${entry.change}`));
        const services = make('div', undefined, 'aws-map');
        entry.keys.forEach(key => {
          const link = make('a', data.cards[key].name, 'aws-map__chip');
          link.href = data.cards[key].read; link.dataset.service = key;
          services.append(link);
        });
        feedback.append(services);
      });
      fieldset.append(label);
    });
    content.replaceChildren(fieldset, feedback);
  }
  get('question').addEventListener('change', event => question(event.currentTarget.value));

  function followHash() {
    const hash = location.hash.slice(1);
    if (hash.startsWith('dva-service-')) showCard(hash.slice(12));
    if (hash.startsWith('dva-concept-')) selectNode(hash.slice(12));
    if (hash.startsWith('dva-theory-')) selectNode(architecture.legacy[hash.slice(11)]);
  }
  selectNode(architecture.nodes[0].id);
  deployment('rolling');
  identity(identityId);
  queue();
  question(data.practice[0].id);
  root.querySelectorAll('[data-dva-enhancement]').forEach(control => { control.hidden = false; });
  window.addEventListener('hashchange', followHash);
  followHash();
})();
