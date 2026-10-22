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
    const words = chunkRoot.querySelector('.al-source p').textContent.trim().split(/\s+/);
    const visual = document.getElementById('al-chunk-visual');
    let mode = 'default';
    let matchedChild = 1;
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
        span.append(make('sup', String(i + 1).padStart(2, '0')), document.createTextNode(words[i]));
        if (shared.has(i)) span.title = 'Repeated in overlapping chunks';
        units.append(span);
      });
      box.append(units);
      return box;
    }
    const range = (start, end) => Array.from({length:end - start}, (_, i) => start + i);
    function render() {
      visual.replaceChildren();
      chunkRoot.querySelectorAll('[data-chunk-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.chunkMode === mode)));
      chunkRoot.querySelectorAll('[data-chunk-note]').forEach(note => {note.hidden = note.dataset.chunkNote !== mode;});
      document.getElementById('al-fixed-controls').hidden = mode !== 'fixed';
      if (mode === 'hierarchical') {
        let childIndex = 0;
        [[0,12],[12,16]].forEach(([start,end], parentIndex) => {
          const parent = make('fieldset', undefined, 'al-parent');
          parent.append(make('legend', `Parent ${parentIndex + 1} · contains units ${start + 1}–${end}`));
          for (let i = start; i < end; i += 4) parent.append(chunk(`Child ${childIndex + 1}`, range(i, Math.min(i + 4, end)), new Set(), childIndex++));
          visual.append(parent);
        });
        const isFirstParent = matchedChild < 3;
        visual.append(make('p', `Query-time illustration: matching Child ${matchedChild + 1} returns Parent ${isFirstParent ? 1 : 2}, including ${isFirstParent ? 'the inspection, restart, and approval wording together' : 'the complete invoice-review sentence'}.`, 'al-key'));
        return;
      }
      let groups;
      if (mode === 'fixed') {
        const size = Number(document.getElementById('al-chunk-size').value);
        const overlap = Number(document.getElementById('al-chunk-overlap').value);
        groups = [];
        for (let start = 0; start < words.length; start += size - overlap) {
          groups.push(range(start, Math.min(start + size, words.length)));
          if (start + size >= words.length) break;
        }
      } else if (mode === 'default') groups = [range(0,8),range(8,12),range(12,16)];
      else groups = [range(0,12),range(12,16)];
      const counts = new Map();
      groups.flat().forEach(i => counts.set(i, (counts.get(i) || 0) + 1));
      const shared = new Set([...counts].filter(([,count]) => count > 1).map(([i]) => i));
      groups.forEach((indices, i) => {
        const box = chunk(mode === 'custom' ? `Domain chunk ${i + 1}` : `Chunk ${i + 1}`, indices, shared);
        if (mode === 'custom') {
          const metadata = make('div', undefined, 'al-chunk-metadata');
          ['source: runbook-v3', `section: ${i ? 'finance' : 'maintenance'}`, 'scope: plant-A'].forEach(text => metadata.append(make('span', text)));
          box.append(metadata);
        }
        visual.append(box);
      });
      if (mode === 'fixed') visual.append(make('p', `${groups.length} chunks · ${shared.size} distinct units repeated across boundaries. Dashed, hatched units indicate overlap.`, 'al-note'));
      if (mode === 'semantic') visual.append(make('p', 'Illustrative topic change: maintenance procedure → invoice review. A real semantic chunker determines its boundaries from the source and configuration.', 'al-note'));
    }
    chunkRoot.addEventListener('click', event => {
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
  function route() {
    if (location.hash.startsWith('#identity-path-')) showPath(location.hash.slice('#identity-path-'.length));
    if (location.hash.startsWith('#protocol-')) showProtocol(location.hash.slice('#protocol-'.length));
  }
  window.addEventListener('hashchange', route);
  route();
})();
