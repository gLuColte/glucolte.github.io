(() => {
  'use strict';
  const root = document.getElementById('soa-study'), source = document.getElementById('soa-study-data');
  if (!root || !source || !window.CloudOpsLearning) return;
  const data = JSON.parse(source.textContent), core = window.CloudOpsLearning;
  const get = id => document.getElementById(`soa-${id}`);
  const el = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  root.querySelectorAll('[data-soa-enhanced]').forEach(node => {node.hidden = false;});
  const dialog = get('service-dialog');
  let opener = null;
  function reveal(target) {
    for(let node=target;node && root.contains(node);node=node.parentElement) {
      if(node.tagName==='DETAILS')node.open=true;
    }
  }
  function openCard(key, trigger) {
    const ref = get(`service-${key}`), card = data.cards[key];
    if (!ref || !card) return;
    if (typeof dialog.showModal !== 'function') {
      reveal(ref); ref.scrollIntoView?.({block:'start'}); return;
    }
    opener = trigger || document.activeElement;
    get('card-title').textContent = card.name;
    get('card-body').replaceChildren(ref.querySelector('.soa-card-content').cloneNode(true));
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    dialog.querySelector('button').focus();
  }
  root.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const href = link.getAttribute('href') || '';
    const key = link.dataset.soaCard || link.dataset.service || (href.startsWith('#soa-service-') ? href.slice(13) : '');
    if (!data.cards[key]) {
      if(href.startsWith('#soa-'))reveal(document.getElementById(href.slice(1)));
      return;
    }
    event.preventDefault(); openCard(key, link);
  });
  dialog.addEventListener('close', () => { if (opener?.isConnected) opener.focus(); });
  dialog.addEventListener('click', event => {
    const link=event.target.closest('[data-soa-lesson-link]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    dialog.close();
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
  if (typeof dialog.showModal === 'function') root.classList.add('soa-has-dialog');
  // Direct fragment links expose the static reference even with enhancements.
  function fragment() {
    const target=document.getElementById(location.hash.slice(1));
    reveal(target);
    if(target && root.contains(target))target.scrollIntoView?.({block:'start'});
  }
  window.addEventListener('hashchange',fragment); fragment();

  const theory = get('theory-canvas');
  function selectConcept(id) {
    const concept = data.theory.find(c => c.id === id);
    if (!concept) return;
    theory.querySelectorAll('[data-soa-concept]').forEach(n => n.setAttribute('aria-pressed',String(n.dataset.soaConcept === id)));
    const panel = get('concept-panel');
    panel.replaceChildren(el('strong',concept.title),el('p',concept.purpose));
    for (const [label,key] of [['Dependencies','dependencies'],['Failure mode','failure'],['Useful evidence','evidence'],['Action → verify','verify']]) {
      const p = el('p'); p.append(el('strong',`${label}. `),document.createTextNode(concept[key])); panel.append(p);
    }
    const links = el('p');
    concept.cards.forEach(key => {const a=el('a',data.cards[key].name);a.href=data.cards[key].read;links.append(a,document.createTextNode(' · '));}); panel.append(links);
    get('concept-select').value=id;
  }
  theory.addEventListener('click',event=> {const n=event.target.closest('[data-soa-concept]');if(n)selectConcept(n.dataset.soaConcept);});
  theory.addEventListener('keydown',event=> {const n=event.target.closest('[data-soa-concept]');if(n && ['Enter',' '].includes(event.key)){event.preventDefault();selectConcept(n.dataset.soaConcept);}});
  get('concept-select').addEventListener('change',e=>selectConcept(e.target.value));
  get('service-labels').addEventListener('click',e=> {
    const enabled=e.currentTarget.getAttribute('aria-pressed')!=='true';
    e.currentTarget.setAttribute('aria-pressed',String(enabled));e.currentTarget.textContent=enabled?'Show principles':'Show AWS services';
    theory.querySelectorAll('[data-soa-principle]').forEach(t=> {t.textContent=enabled?t.dataset.soaServices:t.dataset.soaPrinciple;});
  });
  selectConcept('observe');

  function renderLab(lab) {
    const id=lab.dataset.soaLab, form=lab.querySelector('form');
    const target=lab.querySelector('[data-soa-result]');
    target.hidden=false;
    if(id==='alarm') {
      form.elements.m.max=form.elements.n.value;
      form.elements.m.value=Math.min(Number(form.elements.m.value),Number(form.elements.n.value));
    }
    if(id==='capacity') form.elements.max.min=form.elements.min.value;
    const values={};
    for (const input of form.elements) {
      if (!input.name) continue;
      values[input.name]=input.type==='checkbox'?input.checked:input.type==='number'?Number(input.value):input.value;
    }
    if (!form.checkValidity()) {target.replaceChildren(el('p','Adjust the inputs to the shown valid ranges before interpreting a result.'));return;}
    const result=core[id](values); target.replaceChildren();
    target.append(el('strong',result.error || result.state,'soa-lab-state'));
    if (result.error) return;
    const flow=el('ol',undefined,'soa-lab-flow');
    const steps=result.gates || (id==='alarm'?result.recent.map((v,i)=>[`Period ${i+1}: ${v===null?'missing':v}`,v===null?null:v>values.threshold]):id==='capacity'?[[`Desired ${result.desired}`,true],[`AZ A: ${values.failed?'FAILED — 0 available':`${result.a} instances`}`,result.a>0],[`AZ B: ${result.b} instances`,result.b>0],[`Healthy capacity ${result.capacity}/s`,result.capacity>=values.load]]:id==='recovery'?result.rows.map(o=>[`${o.label}: ${o.meets?'meets':'does not meet'}`,o.meets]):[['Inspect events',true],['Repair prerequisites',values.permission && values.ips],['Continue / review',values.permission && values.ips],['Verify stack + workload',null]]);
    steps.forEach(([text,pass])=> {const li=el('li',text);li.dataset.soaState=pass===null?'unknown':pass?'pass':'fail';flow.append(li);});
    target.append(flow,el('p',result.explanation));
    if(id==='network')target.append(el('pre',`browser:${values.port} → ALB:${values.https?443:80}\nALB:${values.https?443:80} → browser:${values.port}\nALB → backend is a separate connection.`));
    if(result.command)target.append(el('pre',result.command));
    target.append(el('p',result.verify,'dva-note'));
  }
  root.querySelectorAll('[data-soa-lab]').forEach(lab=> {
    const form=lab.querySelector('form');
    form.querySelectorAll('input[type="number"]').forEach(input=>{input.required=true;});
    form.addEventListener('submit',event=>event.preventDefault());
    form.addEventListener('input',()=>renderLab(lab));form.addEventListener('change',()=>renderLab(lab));
    form.addEventListener('reset',()=>setTimeout(()=>renderLab(lab),0));
    renderLab(lab);
  });
  const storageKey='soa-c03-practice-v1';
  let progress={};
  try {const saved=JSON.parse(localStorage.getItem(storageKey)||'{}');if(saved && typeof saved==='object' && !Array.isArray(saved))progress=saved;} catch {}
  function updateProgress() {
    const ids=data.practice.map(q=>q.id), attempted=ids.filter(id=>typeof progress[id]==='boolean');
    get('progress').textContent=`${attempted.length} / ${ids.length} reviewed · ${attempted.filter(id=>progress[id]).length} correct on last attempt`;
    try {localStorage.setItem(storageKey,JSON.stringify(progress));} catch {}
  }
  function renderQuestion() {
    const q=data.practice.find(q=>q.id===get('question').value), box=get('question-content'); box.replaceChildren();
    box.append(el('p',`Domain ${q.domain} · Task ${q.task} · ${q.answers.length>1?`Select ${q.answers.length} answers`:'Select one answer'}`,'dva-eyebrow'));
    const form=el('form'), fieldset=el('fieldset',undefined,'dva-answers');fieldset.append(el('legend',q.prompt));
    q.choices.forEach((choice,i)=> {const label=el('label'),input=el('input');input.type=q.answers.length>1?'checkbox':'radio';input.name='soa-answer';input.value=i;label.append(input,el('span',`${String.fromCharCode(65+i)}. ${choice.text}`));fieldset.append(label);});
    const submit=el('button','Check answer');submit.type='submit';
    const feedback=el('div');feedback.setAttribute('aria-live','polite');feedback.setAttribute('aria-atomic','true');
    form.append(fieldset,submit,feedback);box.append(form);
    form.addEventListener('submit',event=> {
      event.preventDefault();const selected=[...fieldset.querySelectorAll('input:checked')].map(i=>Number(i.value));
      if(selected.length!==q.answers.length){feedback.replaceChildren(el('p',`Select ${q.answers.length} ${q.answers.length===1?'answer':'answers'} before checking.`));return;}
      const correct=selected.length===q.answers.length && selected.every(i=>q.answers.includes(i));progress[q.id]=correct;updateProgress();
      feedback.replaceChildren(el('strong',correct?'Correct — the deciding constraint fits.':'Review the boundary.'));
      feedback.append(el('p',q.clue));
      const list=el('ul');q.choices.forEach((c,i)=>{list.append(el('li',`${String.fromCharCode(65+i)} · ${q.answers.includes(i)?'Correct':'Alternative'}: ${c.why}`));});feedback.append(list,el('p',`Analogy: ${q.analogy}`),el('p',`Change the requirement: ${q.change}`));
      q.cards.forEach(key=> {const a=el('a',`${data.cards[key].name} → `);a.href=data.cards[key].read;feedback.append(a);});
      fieldset.querySelectorAll('label').forEach((l,i)=>{l.classList.toggle('dva-answer-correct',q.answers.includes(i));l.classList.toggle('dva-answer-wrong',selected.includes(i)&&!q.answers.includes(i));});
    });
  }
  get('question').addEventListener('change',renderQuestion);
  root.addEventListener('click',event=>{
    const link=event.target.closest('a[data-soa-question]');
    if(!link || event.button>0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)return;
    const id=link.dataset.soaQuestion;
    if(!data.practice.some(q=>q.id===id))return;
    event.preventDefault();
    get('question').value=id;renderQuestion();
    get('practice').scrollIntoView?.({block:'start'});get('question').focus();
  });
  get('retry').addEventListener('click',()=>{renderQuestion();get('question-content').querySelector('input').focus();});
  get('next-question').addEventListener('click',()=>{get('question').selectedIndex=(get('question').selectedIndex+1)%data.practice.length;renderQuestion();get('question-content').querySelector('input').focus();});
  get('reset-practice').addEventListener('click',()=>{progress={};updateProgress();renderQuestion();});
  updateProgress();renderQuestion();
})();
