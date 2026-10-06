/* Domain trap lessons and original questions. All state stays in this page. */
(() => {
  'use strict';
  const root = document.getElementById('aip-domain-practice');
  if (!root) return;
  const el = id => root.querySelector(`#aip-${id}`);
  const domains = JSON.parse(document.getElementById('aip-practice-data').textContent);
  let domainIndex = 0;
  let topicIndex = 0;
  let mode = 'practice';
  const current = () => domains[domainIndex].topics[topicIndex];
  const displayedOptions = () => {
    const item = current();
    const offset = (domainIndex + topicIndex) % item.options.length;
    const options = item.options.map((candidate, index) => ({candidate, index}));
    return options.slice(offset).concat(options.slice(0, offset)).map((option, position) => ({...option, letter: String.fromCharCode(65 + position)}));
  };
  const set = (id, value) => { el(id).textContent = value; };
  const paragraph = text => { const p = document.createElement('p'); p.textContent = text; return p; };
  function setMode(next) {
    mode = next;
    el('trap-lesson').hidden = mode !== 'learn';
    el('trap-question').hidden = mode !== 'practice';
    el('learn-mode').setAttribute('aria-pressed', String(mode === 'learn'));
    el('practice-mode').setAttribute('aria-pressed', String(mode === 'practice'));
  }
  function reveal() {
    const item = current();
    set('deciding-clue', item.clue);
    const choices = displayedOptions();
    const correct = choices.find(choice => choice.index === item.answer);
    set('correct-choice', `${correct.letter}. ${correct.candidate.action}`);
    set('best-answer', item.why);
    set('answer-change', item.change);
    el('rejected-options').replaceChildren();
    choices.forEach(({candidate, index, letter}) => {
      if (index === item.answer) return;
      const li = document.createElement('li');
      const strong = document.createElement('strong');
      strong.textContent = `${letter}. ${candidate.action}`;
      li.append(strong, paragraph(candidate.wrong || candidate.trap));
      el('rejected-options').append(li);
    });
    el('concrete-flow').replaceChildren();
    const node = (label, number) => {
      const li = document.createElement('li');
      li.className = 'aip-domains__node';
      const marker = document.createElement('span');
      marker.className = 'aip-domains__node-marker';
      marker.textContent = number;
      marker.setAttribute('aria-hidden', 'true');
      const card = document.createElement('div');
      card.className = 'aip-domains__node-card';
      const parts = label.split(': ');
      const title = document.createElement('strong');
      title.textContent = parts.shift();
      card.append(title);
      if (parts.length) card.append(paragraph(parts.join(': ')));
      li.append(marker, card);
      return li;
    };
    const steps = Array.isArray(item.flow) ? item.flow : [item.flow.start, item.flow.branches, item.flow.end];
    steps.forEach((step, index) => {
      if (Array.isArray(step)) {
        const group = document.createElement('li');
        group.className = 'aip-domains__branch-group';
        const label = document.createElement('span');
        label.className = 'aip-domains__branch-label';
        label.textContent = item.flow.branchLabel;
        const branches = document.createElement('ul');
        branches.className = 'aip-domains__branches';
        step.forEach((branch, branchIndex) => branches.append(node(branch, `${index + 1}${String.fromCharCode(97 + branchIndex)}`)));
        group.append(label, branches);
        el('concrete-flow').append(group);
      } else el('concrete-flow').append(node(step, String(index + 1)));
    });
    el('trap-reading').href = item.reading;
    el('trap-explanation').hidden = false;
  }
  function renderTopic() {
    const domain = domains[domainIndex];
    const item = current();
    el('trap').value = String(topicIndex);
    set('trap-count', `${topicIndex + 1} / ${domain.topics.length}`);
    set('pdf-reference', item.reference);
    set('trap-rule', item.rule);
    set('trap-prompt', item.question);
    set('trap-feedback', '');
    el('trap-feedback').removeAttribute('data-result');
    el('trap-explanation').hidden = true;
    el('key-services').replaceChildren();
    item.services.forEach(service => { const li = document.createElement('li'); li.textContent = service; el('key-services').append(li); });
    el('comparisons').replaceChildren();
    item.options.forEach(candidate => {
      const card = document.createElement('div');
      card.className = 'aip-domains__comparison';
      const title = document.createElement('strong'); title.textContent = candidate.name;
      const use = document.createElement('b'); use.textContent = 'Choose when';
      const warning = document.createElement('b'); warning.textContent = 'Exam trap';
      card.append(title, use, paragraph(candidate.when), warning, paragraph(candidate.trap));
      el('comparisons').append(card);
    });
    el('trap-choices').replaceChildren();
    displayedOptions().forEach(({candidate, index, letter}) => {
      const button = document.createElement('button'); button.type = 'button';
      button.textContent = `${letter}. ${candidate.action}`;
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => {
        el('trap-choices').querySelectorAll('button').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
        const correct = index === item.answer;
        set('trap-feedback', correct ? 'Correct' : 'Incorrect');
        el('trap-feedback').dataset.result = correct ? 'correct' : 'incorrect';
        if (correct) reveal();
        else el('trap-explanation').hidden = true;
      });
      el('trap-choices').append(button);
    });
    el('prev-trap').disabled = topicIndex === 0;
    el('next-trap').disabled = topicIndex === domain.topics.length - 1;
    setMode(mode);
  }
  function renderDomain() {
    const domain = domains[domainIndex];
    set('domain-title', `Domain ${domainIndex + 1} · ${domain.weight}% · ${domain.name}`);
    set('domain-summary', domain.summary);
    el('domains').querySelectorAll('button').forEach((button, index) => button.setAttribute('aria-pressed', String(index === domainIndex)));
    el('trap').replaceChildren();
    domain.topics.forEach((item, index) => { const opt = document.createElement('option'); opt.value = String(index); opt.textContent = `${index + 1}. ${item.title}`; el('trap').append(opt); });
    renderTopic();
  }
  domains.forEach((domain, index) => {
    const button = document.createElement('button'); button.type = 'button';
    button.setAttribute('aria-pressed', String(index === domainIndex));
    const title = document.createElement('strong'); title.textContent = `Domain ${index + 1} · ${domain.weight}%`;
    const label = document.createElement('span'); label.textContent = domain.short;
    button.append(title, label);
    button.addEventListener('click', () => { domainIndex = index; topicIndex = 0; mode = 'practice'; renderDomain(); });
    el('domains').append(button);
  });
  el('trap').addEventListener('change', () => { topicIndex = Number(el('trap').value); renderTopic(); });
  el('learn-mode').addEventListener('click', () => setMode('learn'));
  el('practice-mode').addEventListener('click', () => setMode('practice'));
  el('retry-trap').addEventListener('click', () => { mode = 'practice'; renderTopic(); });
  el('prev-trap').addEventListener('click', () => { if (topicIndex > 0) { topicIndex--; renderTopic(); } });
  el('next-trap').addEventListener('click', () => { if (topicIndex < domains[domainIndex].topics.length - 1) { topicIndex++; renderTopic(); } });
  renderDomain();
  root.querySelector('.aip-lab__fallback').hidden = true;
  root.querySelector('.aip-lab__interactive').hidden = false;
})();
