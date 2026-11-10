/* Optional DOM + mathematical SVG geometry QA; uses an external jsdom install.
 * NODE_PATH=/path/to/node_modules node scripts/check-cloudops-dom.cjs /built/site
 * This does not replace live-browser layout inspection. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const site=path.resolve(process.argv[2]||'_site');
const html=fs.readFileSync(path.join(site,'study/examAssociateCloudOps.html'),'utf8');
const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e));
const dom=new JSDOM(html,{url:'https://example.test/study/examAssociateCloudOps',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
const {window}=dom,{document}=window;
const get=id=>{const node=document.getElementById(`soa-${id}`);assert.ok(node,id);return node;};
const data=JSON.parse(get('study-data').textContent),arch=JSON.parse(get('scope-data').textContent);
const tick=()=>new Promise(r=>setTimeout(r,0));
const event=(node,type)=>node.dispatchEvent(new window.Event(type,{bubbles:true}));
window.HTMLElement.prototype.scrollIntoView=function(){};
window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
window.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new window.Event('close'));};
window.ResizeObserver=class{observe(){}disconnect(){}};
window.matchMedia=()=>({matches:false});
const frames=new Map();let serial=0;
window.requestAnimationFrame=callback=>{frames.set(++serial,callback);return serial;};
window.cancelAnimationFrame=id=>frames.delete(id);
const advance=time=>{const [id,fn]=frames.entries().next().value;frames.delete(id);fn(time);};
Object.defineProperties(get('scope-canvas'),{clientWidth:{value:1200},clientHeight:{value:900}});
// Sample the M/L/Q curves emitted by the shared obstacle-avoiding router.
const geometry=new WeakMap();
function points(element){
 if(geometry.has(element))return geometry.get(element);
 const tokens=(element.getAttribute('d')||'').match(/[MLQHV]|-?\d+(?:\.\d+)?/g)||[],out=[];let at={x:0,y:0},length=0;
 const push=p=>{if(out.length)length+=Math.hypot(p.x-at.x,p.y-at.y);at=p;out.push({...p,length});};
 for(let i=0;i<tokens.length;){const cmd=tokens[i++];if(cmd==='M'||cmd==='L')push({x:Number(tokens[i++]),y:Number(tokens[i++])});else if(cmd==='H')push({x:Number(tokens[i++]),y:at.y});else if(cmd==='V')push({x:at.x,y:Number(tokens[i++])});else if(cmd==='Q'){const start=at,c={x:Number(tokens[i++]),y:Number(tokens[i++])},end={x:Number(tokens[i++]),y:Number(tokens[i++])};for(let s=1;s<=12;s++){const t=s/12;push({x:(1-t)**2*start.x+2*(1-t)*t*c.x+t*t*end.x,y:(1-t)**2*start.y+2*(1-t)*t*c.y+t*t*end.y});}}else throw Error(cmd);}
 geometry.set(element,out);return out;
}
window.SVGElement.prototype.getTotalLength=function(){return points(this).at(-1)?.length||0;};
window.SVGElement.prototype.getPointAtLength=function(n){const ps=points(this);let b=ps.findIndex(p=>p.length>=n);if(b<0)return ps.at(-1);if(!b)return ps[0];const a=ps[b-1],z=ps[b],t=(n-a.length)/(z.length-a.length||1);return{x:a.x+(z.x-a.x)*t,y:a.y+(z.y-a.y)*t};};
const run=file=>window.eval(fs.readFileSync(path.join(site,'assets',file),'utf8'));
async function main(){
 for(const name of ['dva-architecture-explorer.css','cloudops-study.css']){const style=document.createElement('style');style.textContent=fs.readFileSync(path.join(site,'assets',name),'utf8');document.head.append(style);}
 assert.ok(['rgb(29, 78, 216)','rgb(30, 64, 175)'].includes(window.getComputedStyle(get('scope-run')).backgroundColor));
 assert.equal(window.getComputedStyle(get('scope-run')).color,'rgb(255, 255, 255)');
 assert.ok(html.includes('SOA-C03'));assert.equal(document.querySelectorAll('[data-soa-lab]').length,6);
 const ids=[...document.querySelectorAll('[id]')].map(n=>n.id);assert.equal(new Set(ids).size,ids.length,'Unique IDs');
 for(const a of document.querySelectorAll('a[href^="#"]')){const id=a.getAttribute('href').slice(1);if(id)assert.ok(document.getElementById(id),`Missing anchor ${id}`);}
 for(const img of document.querySelectorAll('#soa-study img')){const p=path.join(site,img.getAttribute('src').replace(/^\//,''));assert.ok(fs.existsSync(p),`Missing icon ${p}`);assert.match(fs.readFileSync(p,'utf8'),/<svg[\s>]/);}
 for(const file of ['cloudops-core.js','cloudops-study.css','cloudops-study.js','dva-architecture-explorer.js'])assert.ok(fs.existsSync(path.join(site,'assets',file)));
 for(const edge of document.querySelectorAll('.soa-map-edge')) {
   for(let i=2;i<edge.getTotalLength();i+=4) {
     const p=edge.getPointAtLength(i);
     for(const node of document.querySelectorAll('[data-soa-concept]')) {
       if([edge.dataset.soaFrom,edge.dataset.soaTo].includes(node.dataset.soaConcept)) continue;
       const rect=node.querySelector('rect'),x=Number(rect.getAttribute('x')),y=Number(rect.getAttribute('y')),w=Number(rect.getAttribute('width')),h=Number(rect.getAttribute('height'));
       assert.ok(!(p.x>x&&p.x<x+w&&p.y>y&&p.y<y+h),`Theory ${edge.dataset.soaFrom}→${edge.dataset.soaTo} crosses ${node.dataset.soaConcept}`);
     }
   }
 }
 // Useful server-rendered content and hidden controls before scripts execute.
 assert.equal(document.querySelectorAll('.soa-service-reference').length,Object.keys(data.cards).length);
 assert.equal(document.querySelectorAll('[data-soa-note]').length,Object.values(data.cards).reduce((n,c)=>n+(c.notes||[]).length,0));
 assert.equal(document.querySelectorAll('.soa-question-library>details').length,data.practice.length);
 for(const lab of document.querySelectorAll('[data-soa-lab]')){assert.equal(lab.tagName,'DETAILS');assert.equal(lab.open,false,'Optional exercises start collapsed');assert.equal(lab.querySelector('form').hidden,true);}
 assert.equal(document.querySelector('.soa-references').open,false,'Static reference list starts collapsed');
 const reserved=get('service-vpc').querySelector('.soa-exam-alert');assert.ok(reserved);assert.match(reserved.textContent,/251 assignable/);assert.equal(reserved.querySelectorAll('tbody tr').length,5);assert.match(reserved.textContent,/BYOIP/);
 for(const p of document.querySelectorAll('[data-soa-static]'))assert.ok(p.textContent.length>80);
 run('cloudops-core.js');run('cloudops-study.js');
 for(const lab of document.querySelectorAll('[data-soa-lab]')){
   assert.equal(lab.querySelector('form').hidden,false);assert.equal(lab.querySelector('[data-soa-result]').hidden,false);
   const before=lab.querySelector('[data-soa-result]').textContent;
   const input=lab.querySelector('input[type="checkbox"]')||lab.querySelector('select[name="missing"]');
   if(input.type==='checkbox')input.checked=!input.checked;else input.value='breaching';event(input,'change');
   assert.notEqual(lab.querySelector('[data-soa-result]').textContent,before,`${lab.dataset.soaLab}: input changes diagnosis`);
   lab.querySelector('form').reset();await tick();assert.equal(lab.querySelector('[data-soa-result]').textContent,before,'Reset restores example');
 }
 const cap=get('lab-capacity').querySelector('input[name="max"]');cap.value='0';event(cap,'input');assert.match(get('lab-capacity').textContent,/Adjust the inputs/);cap.form.reset();await tick();
 for(const c of data.theory){const n=document.querySelector(`[data-soa-concept="${c.id}"]`);n.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));assert.ok(get('concept-panel').textContent.includes(c.purpose));}
 const label=document.querySelector('[data-soa-principle]'),principle=label.textContent;get('service-labels').click();assert.equal(label.textContent,label.dataset.soaServices);get('service-labels').click();assert.equal(label.textContent,principle);
 for(const c of Object.values(data.cards)){
   const a=document.querySelector(`a[href="${c.read}"]`);a.focus();a.click();assert.equal(get('service-dialog').open,true);assert.equal(get('card-title').textContent,c.name);assert.ok(get('card-body').textContent.includes(c.trigger));
   assert.equal(document.activeElement,get('service-dialog').querySelector('button'));get('service-dialog').close();assert.equal(document.activeElement,a);
 }
 // The red subnet reminder is included in the modal clone, and direct lesson
 // links reveal the collapsed exercise without losing the original anchor.
 const vpcLink=document.querySelector('a[data-soa-card="vpc"]');vpcLink.click();
 assert.ok(get('card-body').querySelector('.soa-exam-alert'));
 const networkLink=get('card-body').querySelector('a[href="#soa-lab-network"]');assert.ok(networkLink);networkLink.click();
 assert.equal(get('service-dialog').open,false);assert.equal(get('lab-network').open,true);
 get('lab-network').open=false;
 // Every question: an incorrect set, the correct set, full feedback and retry.
 for(const q of data.practice){
   get('question').value=q.id;event(get('question'),'change');
   const form=get('question-content').querySelector('form'),inputs=[...form.querySelectorAll('input')];
   const wrong=inputs.filter(i=>!q.answers.includes(Number(i.value))).slice(0,q.answers.length);
   wrong.forEach(i=>i.checked=true);event(form,'submit');assert.match(form.textContent,/Review the boundary/);
   inputs.forEach(i=>i.checked=q.answers.includes(Number(i.value)));event(form,'submit');assert.match(form.textContent,/Correct —/);
   q.choices.forEach(c=>assert.ok(form.textContent.includes(c.why)));assert.ok(form.textContent.includes(q.change));
   get('retry').click();assert.equal(get('question-content').querySelectorAll('input:checked').length,0);
 }
 assert.match(get('progress').textContent,new RegExp(`${data.practice.length} / ${data.practice.length} reviewed`));
 assert.equal(Object.keys(JSON.parse(window.localStorage.getItem('soa-c03-practice-v1'))).length,data.practice.length);
 get('reset-practice').click();assert.match(get('progress').textContent,/0 \//);
 window.location.hash='#soa-question-m1';event(window,'hashchange');assert.equal(document.querySelector('.soa-question-library').open,true);assert.equal(get('question-m1').open,true);
 // Shared explorer uses isolated SOA data/IDs; run every step and relation.
 run('dva-architecture-explorer.js');
 assert.equal(document.querySelector('.soa-scenario-detail').open,false,'Assumptions are optional, separate from current-step instructions');
 assert.equal(get('scope-run').disabled,true);
 const change=(name,value)=>{get(`scope-${name}`).value=value;event(get(`scope-${name}`),'change');};
 const nodes=new Map(arch.nodes.map(n=>[n.id,n])),groups=new Map(arch.groups.map(g=>[g.id,g])),edges=new Map(arch.relationships.map(e=>[e.id,e]));
 const ancestors=id=>{const out=[];for(let g=groups.get(id);g;g=groups.get(g.parent))out.push(g.id);return out;};
 for(const scene of arch.scenarios){
   change('scenario',scene.id);assert.equal(get('scope-step').options.length,scene.steps.length);
   get('scope-run').click();assert.equal(get('scope-explorer').dataset.scopeRunning,'true');advance(100);advance(400);get('scope-run').click();assert.equal(get('scope-explorer').dataset.scopeRunning,'false');
   for(let i=0;i<scene.steps.length;i++){
     change('step',String(i));const step=scene.steps[i],caption=get('scope-step-detail').textContent;assert.ok(caption.includes(step.text));
     const packet=document.querySelector('.scope-packet');
     for(const [id,status] of Object.entries(step.nodeStates||{})){
       const node=document.querySelector(`[data-node="${id}"]`),badge=document.querySelector(`[data-status-for="${id}"]`);
       if(status.hidden){assert.equal(node,null,`${scene.id}/${i}: uncreated instance is hidden`);continue;}
       assert.ok(node && badge,`${scene.id}/${i}: ${id} status is visible`);assert.equal(node.dataset.nodeStatus,status.tone);assert.equal(badge.textContent,status.label);assert.ok(node.getAttribute('aria-label').includes(status.detail));
       const rect=badge.querySelector('rect');assert.ok(Number(rect.getAttribute('y'))+Number(rect.getAttribute('height'))<=nodes.get(id).y,'Badge stays above its box');
       const x=Number(rect.getAttribute('x')),y=Number(rect.getAttribute('y')),w=Number(rect.getAttribute('width')),h=Number(rect.getAttribute('height'));
       for(const other of arch.nodes.filter(n=>n.id!==id))assert.ok(!(x<other.x+other.w && x+w>other.x && y<other.y+other.h && y+h>other.y),`${id} badge overlaps ${other.id}`);
       for(const g of arch.groups){const headingRight=g.x+14+Math.min(g.w-65,g.label.length*10);assert.ok(!(x<headingRight&&x+w>g.x+9&&y<g.y+35&&y+h>g.y+5),`${id} badge overlaps ${g.id} heading`);}
     }
     for(const id of step.inactiveEdges||[]){const line=document.querySelector(`path[data-edge="${id}"]`);if(line){assert.equal(line.dataset.unavailable,'true');assert.equal(line.hasAttribute('marker-end'),false);}}
     if(step.summary)assert.ok(caption.includes(step.summary));
     if(step.edge){const edge=edges.get(step.edge);assert.ok(document.querySelector(`path[data-edge="${edge.id}"].is-current`),`${scene.id}: ${edge.id} routed`);assert.equal(Boolean(packet),Boolean(edge.packet));}
     else{assert.equal(packet,null);assert.ok(document.querySelector(`[data-node="${step.node}"].is-current-operation`));}
   }
 }
 // Seeking backwards must restore the exact earlier state, not leave a new
 // instance healthy/visible or an old instance terminated from the future.
 change('scenario','asg-recovery');
 const asg=arch.scenarios.find(s=>s.id==='asg-recovery');
 for(let i=asg.steps.length-1;i>=0;i--){
   change('step',String(i));
   for(const [id,status] of Object.entries(asg.steps[i].nodeStates)){
     const node=document.querySelector(`[data-node="${id}"]`);
     if(status.hidden)assert.equal(node,null);else assert.equal(node.dataset.nodeStatus,status.tone);
   }
 }
 assert.equal(document.querySelector('[data-status-for="ec2-a"]').textContent,'HEALTHY');
 assert.equal(document.querySelector('path[data-edge="terminate-old"]'),null,'Do not show a future termination action on healthy A at baseline');
 assert.ok(document.querySelector('path[data-edge="target-a"]'),'Both baseline target routes are visible');
 change('step','3');assert.equal(document.querySelector('path[data-edge="target-a"]').dataset.unavailable,'true');
 assert.equal(document.querySelector('path[data-edge="terminate-old"]'),null,'Termination does not appear during health detection');
 change('scenario','request');assert.equal(document.querySelector('.scope-status-badge'),null);assert.equal(document.querySelector('[data-node="ec2-new"]'),null);
 // Question links select a single unanswered case; the matching new-launch
 // scene also makes its conditional fresh-volume resource visible for routes.
 change('scenario','ami-launch');
 const ami=arch.scenarios.find(s=>s.id==='ami-launch');
 change('step',String(ami.steps.length-1));
 const practiceLink=get('scope-scenario-notes').querySelector('[data-soa-question]');assert.ok(practiceLink);practiceLink.click();
 assert.equal(get('question').value,practiceLink.dataset.soaQuestion);
 assert.equal(get('question-content').querySelectorAll('input:checked').length,0);
 assert.ok(!get('question-content').textContent.includes('Change the requirement:'));
 get('scope-connections').checked=true;event(get('scope-connections'),'change');
 let routingScene='ami-launch';
 let badgedNodes=new Set([...document.querySelectorAll('[data-status-for]')].map(n=>n.dataset.statusFor));
 for(const edge of arch.relationships){
   const endpoints=[nodes.get(edge.source),nodes.get(edge.target)];
   if(!endpoints.every(n=>!n.scenarios || n.scenarios.includes(routingScene))){
     const visibleScene=arch.scenarios.find(s=>endpoints.every(n=>!n.scenarios || n.scenarios.includes(s.id)));
     assert.ok(visibleScene,`A scene exposes ${edge.id}`);routingScene=visibleScene.id;
     change('scenario',routingScene);change('step',String(visibleScene.steps.length-1));
     get('scope-connections').checked=true;event(get('scope-connections'),'change');
     badgedNodes=new Set([...document.querySelectorAll('[data-status-for]')].map(n=>n.dataset.statusFor));
   }
   const line=document.querySelector(`path[data-edge="${edge.id}"]`);assert.ok(line,`Route ${edge.id}`);
   const permitted=new Set([...ancestors(nodes.get(edge.source).group),...ancestors(nodes.get(edge.target).group)]);
   for(let i=2;i<line.getTotalLength();i+=5){const p=line.getPointAtLength(i);
     for(const n of arch.nodes.filter(n=>![edge.source,edge.target].includes(n.id))){
       const top=n.y-(badgedNodes.has(n.id)?32:0);
       assert.ok(!(p.x>n.x+1&&p.x<n.x+n.w-1&&p.y>top+1&&p.y<n.y+n.h-1),`${edge.id} crosses ${n.id} or its status badge`);
     }
     for(const g of arch.groups.filter(g=>!['cloud','region'].includes(g.kind)&&!permitted.has(g.id)))assert.ok(!(p.x>g.x&&p.x<g.x+g.w&&p.y>g.y&&p.y<g.y+g.h),`${edge.id} crosses ${g.id}`);
   }
 }
 for(const c of arch.comparisons){change('compare',c.id);assert.equal(get('scope-run').disabled,true);assert.ok(get('scope-detail').textContent.includes(c.rule));}
 get('scope-search').value='KMS';event(get('scope-search'),'input');assert.match(get('scope-match').textContent,new RegExp(`${arch.nodes.filter(n=>n.card==='kms').length} matching`));
 get('scope-search').dispatchEvent(new window.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));assert.match(get('scope-detail').textContent,/KMS/);
 // Search narrows native scenario options, including features without a
 // dedicated service icon. Choosing a result keeps that useful filter.
 const search=value=>{get('scope-search').value=value;event(get('scope-search'),'input');};
 const scenarioIds=()=>[...get('scope-scenario').options].map(option=>option.value).filter(Boolean);
 assert.ok(scenarioIds().includes('asg-key-cross') && scenarioIds().length<arch.scenarios.length);
 search('origin shield');assert.ok(scenarioIds().includes('origin-shield'));assert.ok(!scenarioIds().includes('protected-scale-in'));
 assert.match(get('scope-scenario-filter').textContent,new RegExp(`of ${arch.scenarios.length} scenarios match`));
 search('DLM');assert.ok(scenarioIds().includes('snapshot-schedule'),'Feature text matches even with no dedicated DLM node');
 change('scenario','snapshot-schedule');assert.equal(get('scope-search').value,'DLM');assert.ok(scenarioIds().length<arch.scenarios.length);
 assert.ok(document.querySelector('[data-node="events"].is-related'),'Selected flow stays highlighted, beyond matching nodes');
 get('scope-run').click();assert.equal(get('scope-explorer').dataset.scopeRunning,'true');
 search('no-such-service-xyz');assert.equal(get('scope-explorer').dataset.scopeRunning,'false');assert.deepEqual(scenarioIds(),[]);
 assert.equal(get('scope-scenario').value,'');assert.equal(get('scope-run').disabled,true);assert.match(get('scope-scenario-filter').textContent,/0 of/);
 get('scope-search').dispatchEvent(new window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
 assert.equal(scenarioIds().length,arch.scenarios.length);assert.equal(get('scope-scenario-filter').hidden,true);
 search('KMS');get('scope-reset').click();assert.equal(scenarioIds().length,arch.scenarios.length);assert.equal(get('scope-search').value,'');
 const before=get('scope-canvas').getAttribute('viewBox');get('scope-zoom-in').click();assert.notEqual(get('scope-canvas').getAttribute('viewBox'),before);get('scope-reset').click();
 // Theme/viewport contracts: DOM has no layout engine, so do not claim pixel QA.
 const css=fs.readFileSync(path.join(site,'assets/cloudops-study.css'),'utf8'),shared=fs.readFileSync(path.join(site,'assets/dva-architecture-explorer.css'),'utf8');
 assert.match(css,/@media\(max-width:760px\)/);assert.match(css,/overflow-x:auto/);assert.match(css,/grid-template-columns:1fr/);
 assert.match(shared,/@media\(prefers-reduced-motion:reduce\)/);
 for(const theme of ['light','dark']){document.documentElement.dataset.theme=theme;assert.equal(get('scope-canvas').getAttribute('role'),'group');assert.ok(get('service-dialog').getAttribute('aria-labelledby'));}
 const index=fs.readFileSync(path.join(site,'study/index.html'),'utf8');assert.ok(index.includes('/study/examAssociateCloudOps'));
 assert.deepEqual(errors.map(e=>e.message),[]);
 process.stdout.write(`CloudOps DOM checks passed: ${Object.keys(data.cards).length} cards, six labs + resets, ${data.practice.length} answer sets + feedback, ${arch.scenarios.length} scenarios, ${arch.relationships.length} obstacle-avoiding paths, focus, links, icons, static fallbacks and theme/mobile CSS contracts.\n`);
}
main().finally(()=>window.close()).catch(e=>{console.error(e);process.exitCode=1;});
