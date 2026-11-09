(() => {
  'use strict';
  const root = document.getElementById('dva-study');
  const core = globalThis.DVALearning;
  if (!root || !core) return;
  const node = (tag, text, className) => {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  // Native anchors from a cloned reference must leave the modal to reach a lab.
  root.addEventListener('click', event => {
    const link = event.target.closest('dialog a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const hash = link.getAttribute('href');
    if (hash.startsWith('#dva-service-')) return;
    const target = document.getElementById(hash.slice(1));
    if (!target) return;
    link.closest('dialog').close();
    openDetails(target);
  });
  root.querySelectorAll('[data-capacity-lab]').forEach(example => {
    const inputs = Array.from(example.querySelectorAll('[data-capacity]'));
    const result = example.querySelector('[data-capacity-result]');
    let message = '';
    const values = () => Object.fromEntries(inputs.map(input => [input.dataset.capacity, input.value.trim() === '' ? NaN : Number(input.value)]));
    function render() {
      try {
        const state = values();
        const model = core.capacity({...state, basis: example.querySelector('[data-capacity-basis]').value});
        result.className = state.min < 2 ? 'dva-result-blocked' : 'dva-result-rule';
        result.textContent = `${message} Current ready ${state.current}; desired ${state.desired}; min ${state.min}; max ${state.max}. ${Math.max(0, state.desired - state.current)} pending; ${Math.max(0, state.current - state.desired)} to remove.${state.min < 2 ? ' Min below 2 permits a single instance or no instances; AZ configuration alone cannot guarantee HA.' : ''}`;
        const fleet = example.querySelector('[data-capacity-fleet]');
        fleet.replaceChildren(...Array.from({length: Math.max(state.current, state.desired)}, (_, i) => {
          const span = node('span', i < state.current ? '●' : '+', `dva-instance${i >= state.current ? ' dva-instance--offline' : i >= state.desired ? ' dva-instance--new' : ''}`);
          span.setAttribute('aria-label', i < state.current ? i >= state.desired ? 'Ready; scheduled to remove' : 'Ready instance' : 'Pending instance');
          return span;
        }));
        return model;
      } catch (error) { result.className = 'dva-result-blocked'; result.textContent = error.message; return null; }
    }
    inputs.forEach(input => input.addEventListener('input', () => { message = ''; render(); }));
    example.querySelector('[data-capacity-basis]').addEventListener('change', () => { message = ''; render(); });
    example.querySelector('[data-capacity-apply]').addEventListener('click', () => {
      const model = render(); if (!model) return;
      example.querySelector('[data-capacity="desired"]').value = model.target;
      message = model.blocked ? 'Scale-in blocked during warm-up. ' : `Requested target ${model.requested}; accepted desired ${model.target}${model.limited ? ' (min/max constrained)' : ''}. `;
      render();
    });
    example.querySelector('[data-capacity-reconcile]').addEventListener('click', () => {
      if (!render()) return;
      const state = values();
      example.querySelector('[data-capacity="current"]').value = state.current + Math.sign(state.desired - state.current);
      message = 'One instance completed launch/removal and warm-up (simulated). '; render();
    });
    example.querySelector('[data-capacity-reset]').addEventListener('click', () => {
      inputs.forEach(input => { input.value = input.defaultValue; });
      example.querySelector('[data-capacity-basis]').value = 'desired'; message = ''; render();
    });
    render();
  });
  root.querySelectorAll('[data-transaction-lab]').forEach(example => {
    const part = key => example.querySelector(`[data-transaction-${key}]`);
    const contract = () => {
      part('code').textContent = part('mode').value === 'transaction'
        ? '# Conceptual SDK pseudocode\nTransactWriteItems([\n  Delete(AliceVoucher, condition="owner = Alice"),\n  Put(BobVoucher, condition="attribute_not_exists(PK)")\n])\n# Any condition/capacity failure cancels the whole transaction.'
        : '# Conceptual SDK pseudocode\nresult = BatchWriteItem([Delete(AliceVoucher), Put(BobVoucher)])\nretry_with_backoff(result.UnprocessedItems)\n# No per-item conditions; retrying is not a multi-item transaction.';
    };
    const reset = () => {
      example.querySelector('[data-voucher-alice]').textContent = 'Owns V-42';
      example.querySelector('[data-voucher-bob]').textContent = 'No voucher';
      example.querySelector('[data-voucher-boundary]').textContent = part('mode').value === 'transaction' ? 'Transaction: all-or-nothing' : 'Batch: independent Put/Delete';
      part('result').textContent = 'Ready: Alice owns the voucher. Change the contract or failure and transfer.';
      contract();
    };
    part('run').addEventListener('click', () => {
      const state = core.voucher(part('mode').value, part('fail').checked);
      example.querySelector('[data-voucher-alice]').textContent = state.alice ? 'Owns V-42' : 'No voucher';
      example.querySelector('[data-voucher-bob]').textContent = state.bob ? 'Owns V-42' : 'No voucher';
      part('result').className = state.alice + state.bob !== 1 ? 'dva-result-blocked' : 'dva-result-rule';
      part('result').textContent = `${state.trace.join(' → ')}. ${state.outcome} Each run starts from the original state.`;
      contract();
    });
    part('reset').addEventListener('click', reset);
    part('mode').addEventListener('change', reset);
    part('fail').addEventListener('change', reset);
  });
  root.querySelectorAll('[data-learning-controls]').forEach(element => { element.hidden = false; });
  // Direct links also open the native comparison without needing a service modal.
  function openDetails(target) {
    for (let detail=target.closest('details'); detail; detail=detail.parentElement.closest('details')) detail.open=true;
  }
  function openHash() {
    const target = document.getElementById(location.hash.slice(1));
    if (target) openDetails(target);
  }
  window.addEventListener('hashchange', openHash); openHash();
})();
