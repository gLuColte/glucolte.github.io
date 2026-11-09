/* Card-local exercises share pure models and native, keyboard-accessible controls. */
(() => {
  'use strict';
  const root = document.getElementById('dva-study'), core = globalThis.DVALearning;
  if (!root || !core) return;
  const exerciseStates = new WeakMap();
  const make = (tag, text, css) => {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (css) el.className = css;
    return el;
  };
  const fmt = n => Number(n.toFixed(4)).toLocaleString('en-AU');
  function values(exercise) {
    return Object.fromEntries(Array.from(exercise.querySelectorAll('[data-field-input]'), el => [el.dataset.fieldInput, el.type === 'checkbox' ? el.checked : el.type === 'number' ? Number(el.value) : el.value]));
  }
  function render(exercise, action) {
    const input = values(exercise), id = exercise.dataset.dvaExercise;
    const output = exercise.querySelector('[data-exercise-output]');
    output.replaceChildren();
    try {
      if (Array.from(exercise.querySelectorAll('input')).some(el => !el.checkValidity() || el.type === 'number' && el.value === '')) throw new Error('Enter a value within the labelled input range.');
      let result;
      if (id === 'dynamo') {
        const c = core.dynamoCapacity(input);
        const cards = make('div', undefined, 'dva-exercise-math');
        cards.append(make('p', `Reads: ceil(${input.size} / 4) = ${c.readUnits} size units × ${c.perRead / c.readUnits} × ${input.reads}/s = ${fmt(c.rcu)} RCUs`), make('p', `Writes: ceil(${input.size} / 1) = ${c.writeUnits} size units × ${input.transactional ? 2 : 1} × ${input.writes}/s = ${fmt(c.wcu)} WCUs`));
        output.append(cards);
        result = {steps: [`One read · ${c.perRead} units`, `One write · ${c.perWrite} units`, `Provision at least ${c.provisionedRead} RCU / ${c.provisionedWrite} WCU`], summary: 'This is the steady-rate arithmetic minimum, rounded up to whole provisioned units (minimum 1 each); allow headroom. Eventual reads consume half the strong-read units, not two reads.'};
      } else if (id === 'redis') {
        let state = exerciseStates.get(exercise) || core.redisInitial();
        if (action) state = core.redisStep(state, action, input);
        exerciseStates.set(exercise, state);
        const topology = make('div', undefined, 'dva-redis-topology');
        state.shards.forEach((s, i) => {
          const lane = make('section', undefined, 'dva-redis-shard');
          lane.dataset.selected = String(state.selected === i);
          lane.append(make('strong', `Shard ${i + 1}`), make('small', `Slots ${Math.floor(i * 16384 / state.shards.length)}–${Math.floor((i + 1) * 16384 / state.shards.length) - 1}`), make('p', s.down ? 'Primary · unavailable' : 'Primary · writes'), make('p', s.replicas ? `${s.replicas} replica(s) · async copies` : 'No replica'));
          topology.append(lane);
        });
        output.append(topology);
        result = {summary: state.message, blocked: state.shards.some(s => s.down)};
      } else if (['cli','fifo','cache-key','cache-strategy','trace'].includes(id)) {
        const names = {cli:['cliInitial','cliStep'],fifo:['fifoInitial','fifoStep'],'cache-key':['cacheKeyInitial','cacheKeyStep'],'cache-strategy':['cacheStrategyInitial','cacheStrategyStep'],trace:['traceInitial','traceStep']}[id];
        const state = exerciseStates.get(exercise) || core[names[0]](input);
        result = core[names[1]](state, action, input);
        exerciseStates.set(exercise, result.state);
      } else {
        const model = {edge:'edge',policy:'policy',cache:'apiCache',alb:'alb',firewall:'firewall',metrics:'metric','cache-choice':'cacheChoice',invocation:'invocation',gsi:'gsi',cutover:'cutover',kcl:'kcl','kms-cache':'kmsRequests',endpoint:'endpoint','s3-access':'s3Access','s3-key':'s3KeyFlow'}[id];
        if (!model) throw new Error('Unknown learning model.');
        result = core[model](input);
      }
      for (const [key, value] of Object.entries(result.patch || {})) {
        const field = exercise.querySelector(`[data-field-input="${key}"]`);
        if (field) field.value = String(value);
      }
      exercise.querySelectorAll('[data-field]').forEach(label => { label.hidden = (result.inactive || []).includes(label.dataset.field); });
      if (result.steps) {
        const flow = make('ol', undefined, 'dva-flow');
        result.steps.forEach((step, index) => flow.append(make('li', `${index + 1} · ${step}`)));
        output.append(flow);
      }
      if (result.table) {
        const wrap=make('div', undefined, 'dva-table-wrap dva-exercise-table');
        wrap.tabIndex=0; wrap.setAttribute('role','region'); wrap.setAttribute('aria-label', `${exercise.querySelector('summary').textContent} result`);
        const table=make('table'), head=make('thead'), tr=make('tr'), body=make('tbody');
        result.table.headers.forEach(value => { const th=make('th', value); th.scope='col'; tr.append(th); });
        head.append(tr);
        result.table.rows.forEach(row => { const tr=make('tr'); row.forEach(value => tr.append(make('td', String(value)))); body.append(tr); });
        table.append(head,body); wrap.append(table); output.append(wrap);
      }
      output.append(make('p', result.summary, result.blocked ? 'dva-result-blocked' : 'dva-result-rule'));
      if (result.code) { const pre=make('pre',undefined,'dva-reference-code dva-exercise-code'); pre.tabIndex=0; pre.append(make('code',result.code)); output.append(pre); }
    } catch (error) { output.append(make('p', error.message, 'dva-result-blocked')); }
  }
  root.querySelectorAll('[data-exercise-controls]').forEach(el => { el.hidden = false; });
  root.querySelectorAll('[data-dva-exercise]').forEach(el => render(el));
  root.addEventListener('dva:card-open', event => {
    event.target.querySelectorAll('[data-dva-exercise]').forEach(exercise => render(exercise));
  });
  // Delegation also handles service-card content cloned into the existing dialog.
  root.addEventListener('input', event => {
    const exercise = event.target.closest('[data-dva-exercise]');
    if (exercise && event.target.matches('input')) render(exercise);
  });
  root.addEventListener('change', event => {
    const exercise = event.target.closest('[data-dva-exercise]');
    if (exercise && event.target.matches('select')) render(exercise);
  });
  root.addEventListener('click', event => {
    const button = event.target.closest('[data-exercise-action]');
    if (button) render(button.closest('[data-dva-exercise]'), button.dataset.exerciseAction);
  });
  root.addEventListener('reset', event => {
    const exercise = event.target.closest('[data-dva-exercise]');
    if (!exercise) return;
    exerciseStates.delete(exercise);
    setTimeout(() => render(exercise), 0);
  });
  root.addEventListener('submit', event => { if (event.target.matches('[data-exercise-controls]')) event.preventDefault(); });

  const reviewData = JSON.parse(document.getElementById('dva-followup-data').textContent);
  root.querySelectorAll('[data-review-part]').forEach(review => {
  const part = review.dataset.reviewPart;
  const questions = part === '3' ? reviewData.review3 : reviewData.review;
  const storageKey = `dva-followup-v${part}`;
  const radioName = `dva-followup-answer-${part}`;
  let answers = {};
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && typeof saved === 'object') questions.forEach(q => { if (Number.isInteger(saved[q.id]) && q.options[saved[q.id]]) answers[q.id] = saved[q.id]; });
  } catch (_) { /* Storage is optional, including private browsing. */ }
  const select = review.querySelector('[data-review-select]'), body = review.querySelector('[data-review-body]');
  const save = () => { try { localStorage.setItem(storageKey, JSON.stringify(answers)); } catch (_) {} };
  function show() {
    const q = questions[select.selectedIndex], answered = Object.hasOwn(answers, q.id);
    body.replaceChildren();
    const fieldset = make('fieldset'); fieldset.append(make('legend', q.question));
    q.options.forEach((option, index) => {
      const label = make('label', undefined, 'dva-review-option'), radio = make('input');
      radio.type = 'radio'; radio.name = radioName; radio.value = String(index);
      radio.checked = answered && answers[q.id] === index;
      label.append(radio, document.createTextNode(` ${option.text}`)); fieldset.append(label);
    });
    body.append(fieldset);
    const feedback = make('div'); feedback.setAttribute('role', 'status'); feedback.setAttribute('aria-live', 'polite');
    if (answered) {
      const chosen = answers[q.id];
      feedback.append(make('p', `${chosen === q.answer ? 'Correct.' : 'Try again.'} ${q.options[chosen].why}`, chosen === q.answer ? 'dva-result-rule' : 'dva-result-blocked'));
      if (chosen !== q.answer) feedback.append(make('p', `Best answer: ${q.options[q.answer].text}. ${q.options[q.answer].why}`));
      const why = make('details', undefined, 'dva-learning-detail'); why.append(make('summary', 'Why the other choices do not fit'));
      q.options.forEach((o, i) => { if (i !== q.answer) why.append(make('p', `${o.text}: ${o.why}`)); });
      feedback.append(make('p', `Think of it as: ${q.analogy}`, 'dva-note'), why);
      const link = make('a', 'Revisit the service card'); link.href = `#dva-service-${q.card}`; link.dataset.service = q.card; feedback.append(link);
    }
    body.append(feedback);
    const completed = questions.filter(q => Object.hasOwn(answers, q.id)).length;
    const correct = questions.filter(q => answers[q.id] === q.answer).length;
    review.querySelector('[data-review-progress]').textContent = `${completed}/${questions.length} answered · ${correct} correct. Progress is saved in this browser when storage is available.`;
    review.querySelector('[data-review-next]').disabled = select.selectedIndex === questions.length - 1;
  }
  // Keep keyboard focus on the chosen radio when updating instant feedback.
  body.addEventListener('change', event => {
    if (event.target.name !== radioName) return;
    const value = Number(event.target.value);
    answers[questions[select.selectedIndex].id] = value; save(); show();
    body.querySelector(`input[value="${value}"]`).focus({preventScroll: true});
  });
  select.addEventListener('change', show);
  review.querySelector('[data-review-next]').addEventListener('click', () => { if (select.selectedIndex < questions.length - 1) { select.selectedIndex++; show(); body.querySelector('input').focus(); } });
  review.querySelector('[data-review-retry]').addEventListener('click', () => { delete answers[questions[select.selectedIndex].id]; save(); show(); body.querySelector('input').focus(); });
  review.querySelector('[data-review-reset]').addEventListener('click', () => { answers = {}; save(); select.selectedIndex = 0; show(); });
  review.querySelector('[data-review-controls]').hidden = false;
  review.querySelector('[data-review-fallback]').hidden = true;
  show();
  });
})();
