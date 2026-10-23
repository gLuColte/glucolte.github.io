/* Native learning diagrams. No network requests, credentials, or dependencies. */
(() => {
  'use strict';
  if (!document.getElementById('aws-learning-data')) return;
  const data = JSON.parse(document.getElementById('aws-learning-data').textContent);
  const make = (tag, text, className) => {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (className) el.className = className;
    return el;
  };
  const chunkRoot = document.getElementById('rag-chunking-explorer');
  if (chunkRoot) {
    const range = (start, end) => Array.from({length:end - start}, (_, i) => start + i);
    const documents = data.chunkDocuments.map(document => {
      const words = [];
      const sections = document.sections.map(section => {
        const start = words.length;
        if (section.heading) words.push(...section.heading.split(/\s+/));
        const sentenceRanges = section.sentences.map((sentence, i) => {
          const sentenceStart = i === 0 ? start : words.length;
          words.push(...sentence.split(/\s+/));
          return range(sentenceStart, words.length);
        });
        return {...section, start, end:words.length, sentenceRanges};
      });
      return {...document, words, sections};
    });
    let currentDocument = documents[0];
    const visual = document.getElementById('al-chunk-visual');
    let mode = 'default';
    let matchedChild = 0;
    const sentenceBudget = 60;
    const childSize = 24;
    const childOverlap = 6;
    function windows(start, end, size, overlap) {
      const groups = [];
      for (let i = start; i < end; i += Math.max(1, size - overlap)) {
        groups.push(range(i, Math.min(i + size, end)));
        if (i + size >= end) break;
      }
      return groups;
    }
    function sharedUnits(groups) {
      const counts = new Map();
      groups.flat().forEach(i => counts.set(i, (counts.get(i) || 0) + 1));
      return new Set([...counts].filter(([,count]) => count > 1).map(([i]) => i));
    }
    function sentenceGroups() {
      const groups = [];
      let buffer = [];
      const flush = () => {if (buffer.length) groups.push(buffer); buffer = [];};
      currentDocument.sections.forEach(section => {
        if (section.heading) flush();
        section.sentenceRanges.forEach(sentence => {
          if (buffer.length + sentence.length > sentenceBudget) flush();
          buffer.push(...sentence);
        });
      });
      flush();
      return groups;
    }
    function renderSource() {
      document.getElementById('al-chunk-document-title').textContent = `${currentDocument.title} · ${currentDocument.source}`;
      const source = document.getElementById('al-chunk-source');
      source.replaceChildren();
      if (!currentDocument.sections.some(section => section.heading)) {
        source.append(make('p', currentDocument.sections.flatMap(section => section.sentences).join(' ')));
        return;
      }
      currentDocument.sections.forEach(section => {
        const part = make('div', undefined, 'al-source-section');
        if (section.heading) part.append(make('strong', section.heading));
        part.append(make('p', section.sentences.join(' ')));
        source.append(part);
      });
    }
    function chunk(label, indices, shared = new Set(), childIndex) {
      const box = make('div', undefined, 'al-chunk');
      if (childIndex !== undefined) {
        box.classList.toggle('is-match', matchedChild === childIndex);
        const button = make('button', `${label} · match this child`);
        button.type = 'button';
        button.dataset.matchChild = String(childIndex);
        button.setAttribute('aria-pressed', String(matchedChild === childIndex));
        box.append(button);
      } else box.append(make('strong', label));
      const units = make('div', undefined, 'al-text-units');
      indices.forEach(i => {
        const span = make('span', undefined, 'al-text-unit');
        span.dataset.shared = String(shared.has(i));
        span.append(make('sup', String(i + 1).padStart(2, '0')), document.createTextNode(currentDocument.words[i]));
        if (shared.has(i)) span.title = 'Repeated in overlapping chunks';
        units.append(span);
      });
      box.append(units);
      return box;
    }
    function render() {
      visual.replaceChildren();
      renderSource();
      chunkRoot.querySelectorAll('[data-chunk-document]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.chunkDocument === currentDocument.id)));
      chunkRoot.querySelectorAll('[data-chunk-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.chunkMode === mode)));
      chunkRoot.querySelectorAll('[data-chunk-note]').forEach(note => {note.hidden = note.dataset.chunkNote !== mode;});
      document.getElementById('al-fixed-controls').hidden = mode !== 'fixed';
      const fit = document.getElementById('al-chunk-fit');
      const fitKey = `${currentDocument.id}:${mode}`;
      if (fit.dataset.selection !== fitKey) {
        fit.dataset.selection = fitKey;
        fit.replaceChildren(make('strong', `${currentDocument.label} · ${data.chunking.find(strategy => strategy.id === mode).title}`), document.createTextNode(currentDocument.fit[mode]));
      }
      if (mode === 'hierarchical') {
        const children = [];
        const parents = currentDocument.sections.map((section, parentIndex) => {
          const groups = windows(section.start, section.end, childSize, childOverlap);
          const indices = groups.map(units => {
            const index = children.length;
            children.push({units, parentIndex});
            return index;
          });
          return {section, indices, shared:sharedUnits(groups)};
        });
        matchedChild = Math.min(matchedChild, children.length - 1);
        parents.forEach(({section, indices, shared}, parentIndex) => {
          const parent = make('fieldset', undefined, 'al-parent');
          parent.classList.toggle('is-context', indices.includes(matchedChild));
          parent.append(make('legend', `Parent ${parentIndex + 1} · ${section.heading || section.topic} · words ${section.start + 1}–${section.end}`));
          indices.forEach(index => parent.append(chunk(`Child ${index + 1}`, children[index].units, shared, index)));
          visual.append(parent);
        });
        const parentIndex = children[matchedChild].parentIndex;
        const section = parents[parentIndex].section;
        visual.append(make('p', `Query-time illustration: Child ${matchedChild + 1} matches → return Parent ${parentIndex + 1} (${section.heading || section.topic}), including all its child content.`, 'al-key'));
        visual.append(make('p', `Illustration: ${childSize}-word children with ${childOverlap}-word overlap within each hand-labeled parent. Real parent/child sizes and boundaries depend on configuration.`, 'al-note'));
        return;
      }
      let groups;
      if (mode === 'fixed') {
        const size = Number(document.getElementById('al-chunk-size').value);
        const overlap = Number(document.getElementById('al-chunk-overlap').value);
        const boundaries = currentDocument.sections.some(section => section.heading) ? currentDocument.sections : [{start:0, end:currentDocument.words.length}];
        groups = boundaries.flatMap(section => windows(section.start, section.end, size, overlap));
      } else if (mode === 'default') groups = sentenceGroups();
      else groups = currentDocument.sections.map(section => range(section.start, section.end));
      const shared = sharedUnits(groups);
      groups.forEach((indices, i) => {
        const section = currentDocument.sections[i];
        const label = mode === 'custom' ? `${section.faqId ? 'Q&A' : 'Domain'} chunk ${i + 1}` : `Chunk ${i + 1}`;
        const box = chunk(label, indices, shared);
        if (mode === 'semantic') box.append(make('p', `Illustrative topic: ${section.topic}`, 'al-note'));
        if (mode === 'custom') {
          const metadata = make('div', undefined, 'al-chunk-metadata');
          const tags = [`source: ${currentDocument.source}`, `topic: ${section.topic}`];
          if (section.heading) tags.push(`heading: ${section.heading}`);
          if (section.faqId) tags.push(`faq_id: ${section.faqId}`);
          tags.forEach(text => metadata.append(make('span', text)));
          box.append(metadata);
        }
        visual.append(box);
      });
      if (mode === 'fixed') visual.append(make('p', `${groups.length} chunks · ${shared.size} distinct units repeated across boundaries. Dashed, hatched units indicate overlap.`, 'al-note'));
      if (mode === 'default') visual.append(make('p', `This illustration packs complete sentences up to a ${sentenceBudget}-word budget and preserves retained heading boundaries. It does not reproduce the service’s token limit.`, 'al-note'));
      if (mode === 'semantic') visual.append(make('p', 'Topic boundaries are hand-labeled for comparison. A real semantic chunker determines splits from meaning and configuration; it does not require headings.', 'al-note'));
    }
    chunkRoot.addEventListener('click', event => {
      const documentButton = event.target.closest('[data-chunk-document]');
      if (documentButton) {
        currentDocument = documents.find(item => item.id === documentButton.dataset.chunkDocument);
        matchedChild = 0;
        render();
        return;
      }
      const modeButton = event.target.closest('[data-chunk-mode]');
      if (modeButton) {mode = modeButton.dataset.chunkMode; render();}
      const child = event.target.closest('[data-match-child]');
      if (child) {matchedChild = Number(child.dataset.matchChild); render(); visual.querySelector(`[data-match-child="${matchedChild}"]`).focus({preventScroll:true});}
    });
    chunkRoot.querySelectorAll('select').forEach(select => select.addEventListener('change', render));
    chunkRoot.querySelector('.al-interactive').hidden = false;
    render();
  }
  const protocols = document.getElementById('identity-protocols');
  function showProtocol(id) {
    if (!protocols || !data.protocols.some(item => item.id === id)) return;
    protocols.querySelectorAll('[data-protocol-panel]').forEach(panel => {panel.hidden = panel.dataset.protocolPanel !== id;});
    protocols.querySelectorAll('[data-protocol]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.protocol === id)));
  }
  if (protocols) {
    protocols.querySelector('.al-protocol-controls').hidden = false;
    protocols.addEventListener('click', event => {const button = event.target.closest('[data-protocol]'); if (button) showProtocol(button.dataset.protocol);});
    showProtocol('jwt');
  }
  const decisions = document.getElementById('identity-decision-tree');
  function showPath(id) {
    if (!decisions || !data.paths.some(path => path.id === id)) return;
    decisions.querySelectorAll('[data-identity-panel]').forEach(panel => {panel.hidden = panel.dataset.identityPanel !== id;});
    decisions.querySelectorAll('[data-identity-path]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.identityPath === id)));
  }
  if (decisions) {
    decisions.querySelector('.al-decision-controls').hidden = false;
    decisions.addEventListener('click', event => {const button = event.target.closest('[data-identity-path]'); if (button) showPath(button.dataset.identityPath);});
    showPath('app');
    const gates = decisions.querySelector('.al-gates');
    function renderGates() {
      const token = document.getElementById('al-gate-token').checked;
      const documentAllowed = document.getElementById('al-gate-document').checked;
      const role = document.getElementById('al-gate-role').checked;
      const checks = [
        ['1 · Authentication', token ? 'pass' : 'deny', token ? 'Valid API token: Maya is identified.' : 'Invalid token: reject at API ingress.'],
        ['2 · User authorization', !token ? 'skip' : documentAllowed ? 'pass' : 'deny', !token ? 'Not reached.' : documentAllowed ? 'Policy allows this manual for Maya.' : 'Signed in, but this document is denied. Stop before retrieval.'],
        ['3 · AWS authorization', !token || !documentAllowed ? 'skip' : role ? 'pass' : 'deny', !token || !documentAllowed ? 'Not reached; backend role permissions cannot override the earlier denial.' : role ? 'Backend AWS call is allowed; retrieve only the authorized scope.' : 'User policy allows the document, but the backend AWS request is denied.']
      ];
      const results = document.getElementById('al-gate-results');
      results.replaceChildren();
      checks.forEach(([title,result,copy]) => {
        const li = make('li'); li.dataset.result = result;
        li.append(make('strong', title), make('span', `${result === 'pass' ? 'PASS' : result === 'deny' ? 'DENY' : 'NOT REACHED'} · ${copy}`));
        results.append(li);
      });
    }
    gates.addEventListener('change', renderGates);
    gates.hidden = false;
    renderGates();
  }
  function revealConcept(id) {
    if (id.startsWith('identity-path-')) showPath(id.slice('identity-path-'.length));
    if (id.startsWith('protocol-')) showProtocol(id.slice('protocol-'.length));
  }
  document.addEventListener('aws-learning:reveal', event => revealConcept(event.detail.id || ''));
  function route() {revealConcept(location.hash.slice(1));}
  window.addEventListener('hashchange', route);
  route();
})();
