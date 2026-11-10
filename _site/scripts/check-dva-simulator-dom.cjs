/* Optional jsdom regression check; use the same external jsdom install as the
 * learning harness. SVG paths are sampled mathematically for routing checks;
 * this does not replace browser visual QA. Run with NODE_PATH=/path/to/node_modules
 * node this-file /built/site. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM, VirtualConsole} = require('jsdom');
const directory = path.resolve(process.argv[2] || '_site');
const errors = [];
const console = new VirtualConsole();
console.on('jsdomError', error => errors.push(error));
const dom = new JSDOM(fs.readFileSync(path.join(directory,'study/examAssociateDeveloper.html'),'utf8'),{runScripts:'outside-only',url:'https://example.test/study/examAssociateDeveloper',virtualConsole:console});
const {window} = dom, {document} = window;
const get = name => document.getElementById(`dva-scope-${name}`);
const data = JSON.parse(get('data').textContent);
const edges = new Map(data.relationships.map(e => [e.id,e]));
const nodes = new Map(data.nodes.map(n => [n.id,n]));
const groups = new Map(data.groups.map(g => [g.id,g]));
const ancestors = id => {
  const result=[];
  for(let group=groups.get(id);group;group=groups.get(group.parent)) result.push(group.id);
  return result;
};
Object.defineProperties(get('canvas'),{clientWidth:{value:1200},clientHeight:{value:900}});
// The router emits only M/L/Q. Approximate its rounded curves without a browser.
const geometry = new WeakMap();
function points(element) {
  if (geometry.has(element)) return geometry.get(element);
  const tokens = (element.getAttribute('d') || '').match(/[MLQ]|-?\d+(?:\.\d+)?/g) || [];
  const output = []; let at={x:0,y:0}, length=0;
  const push = p => { if(output.length) length+=Math.hypot(p.x-at.x,p.y-at.y); at=p; output.push({...p,length}); };
  for(let i=0;i<tokens.length;) {
    const command=tokens[i++];
    if(command==='M'||command==='L') push({x:Number(tokens[i++]),y:Number(tokens[i++])});
    else if(command==='Q') {
      const start=at, c={x:Number(tokens[i++]),y:Number(tokens[i++])}, end={x:Number(tokens[i++]),y:Number(tokens[i++])};
      for(let s=1;s<=12;s++) { const t=s/12; push({x:(1-t)**2*start.x+2*(1-t)*t*c.x+t*t*end.x,y:(1-t)**2*start.y+2*(1-t)*t*c.y+t*t*end.y}); }
    } else throw new Error(`Unexpected path command: ${command}`);
  }
  geometry.set(element,output); return output;
}
window.SVGElement.prototype.getTotalLength = function() { return points(this).at(-1)?.length || 0; };
window.SVGElement.prototype.getPointAtLength = function(n) {
  const ps=points(this); let b=ps.findIndex(p=>p.length>=n); if(b<0) return ps.at(-1); if(!b) return ps[0];
  const a=ps[b-1], z=ps[b], t=(n-a.length)/(z.length-a.length || 1); return {x:a.x+(z.x-a.x)*t,y:a.y+(z.y-a.y)*t};
};
window.ResizeObserver = class { observe() {} disconnect() {} };
window.matchMedia = () => ({matches:false});
const frames = new Map(); let serial = 0;
window.requestAnimationFrame = callback => { frames.set(++serial,callback); return serial; };
window.cancelAnimationFrame = id => frames.delete(id);
const advance = time => { const [id,callback] = frames.entries().next().value; frames.delete(id); callback(time); };
const change = (name,value) => { get(name).value=value; get(name).dispatchEvent(new window.Event('change',{bubbles:true})); };
const before = (a,b) => Boolean(a.compareDocumentPosition(b)&window.Node.DOCUMENT_POSITION_FOLLOWING);
const overlaps = (a,b) => a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y;
try {
  assert.equal(document.querySelector('.dva-scope-tools').nextElementSibling,get('run').closest('.dva-scope-simulation'),'Playback immediately follows the scenario/search row');
  assert.ok(before(get('run'),get('canvas')));
  assert.ok(before(get('step-detail'),get('canvas')));
  assert.ok(before(get('canvas'),get('scenario-notes')));
  const style=document.createElement('style'); style.textContent=fs.readFileSync(path.join(directory,'assets/dva-architecture-explorer.css'),'utf8'); document.head.append(style);
  assert.ok(['rgb(29, 78, 216)','rgb(30, 64, 175)'].includes(window.getComputedStyle(get('run')).backgroundColor));
  assert.equal(window.getComputedStyle(get('run')).color,'rgb(255, 255, 255)');
  window.eval(fs.readFileSync(path.join(directory,'assets/dva-architecture-explorer.js'),'utf8'));
  assert.equal(get('run').disabled,true);
  assert.equal(get('step').disabled,true);
  assert.equal(get('step').options[0].textContent,'No steps available');
  assert.match(get('progress').textContent,/Choose an architecture scenario/);
  change('scenario','api');
  const fitted=get('canvas').getAttribute('viewBox');
  assert.equal(get('run').disabled,false);
  assert.equal(get('scenario-notes').hidden,false);
  assert.ok(!get('step-detail').textContent.includes('Architecture note:'));
  get('run').click();
  assert.equal(document.getElementById('dva-scope-explorer').dataset.scopeRunning,'true');
  assert.equal(get('run').textContent,'Pause simulation');
  assert.ok(['rgb(29, 78, 216)','rgb(30, 64, 175)'].includes(window.getComputedStyle(get('run')).backgroundColor));
  assert.equal(get('run').getAttribute('aria-pressed'),'true');
  advance(100); advance(2700);
  assert.equal(get('step').value,'0','Do not advance after only 2.6 seconds');
  advance(16000); assert.equal(get('step').value,'1');
  get('run').click(); assert.equal(frames.size,0);
  assert.equal(document.getElementById('dva-scope-explorer').dataset.scopeRunning,'false');
  assert.equal(get('run').getAttribute('aria-pressed'),'false');
  get('next').click(); assert.equal(get('step').value,'2');
  get('previous').click(); assert.equal(get('step').value,'1');
  change('step','0'); get('zoom-in').click();
  assert.notEqual(get('canvas').getAttribute('viewBox'),fitted);
  get('reset').click(); assert.equal(get('canvas').getAttribute('viewBox'),fitted,'Reset keeps the active scenario in view');
  get('run').click(); let time=20000; advance(time);
  while(frames.size) { time+=13000; advance(time); }
  assert.equal(get('run').textContent,'Replay simulation');
  assert.match(get('progress').textContent,/Completed/);
  get('run').click(); assert.equal(get('step').value,'0'); get('run').click();
  for(const entry of data.scenarios) {
    change('scenario',entry.id);
    assert.equal(get('step').options.length,entry.steps.length);
    const label=id=>entry.actors[id]||nodes.get(id).label;
    for(let i=0;i<entry.steps.length;i++) {
      change('step',String(i));
      const step=entry.steps[i], edge=edges.get(step.edge), caption=get('step-detail').textContent;
      assert.ok(caption.includes(step.text),`${entry.id}/${i}: step text`);
      assert.ok(caption.includes(step.phase.toUpperCase()),`${entry.id}/${i}: phase`);
      const packet=document.querySelector('.scope-packet');
      if(edge) {
        const current=document.querySelector(`.scope-edge.is-current[data-edge="${edge.id}"]`);
        assert.ok(current,`${entry.id}/${i}: missing routed connection ${edge.id}`);
        assert.ok(caption.includes(label(edge.source))&&caption.includes(label(edge.target)));
        assert.equal(Boolean(packet),Boolean(edge.packet&&entry.mode!=='comparison'),`${entry.id}/${i}: fictitious or missing moving operation`);
        const staticAction=!edge.packet||entry.mode==='comparison';
        assert.equal(current.classList.contains('is-current-action'),staticAction,`${entry.id}/${i}: missing non-transfer action highlight`);
        for(const id of [edge.source,edge.target]) assert.equal(document.querySelector(`[data-node="${id}"]`).classList.contains('is-current-operation'),staticAction,`${entry.id}/${i}: action endpoints`);
        if(packet) assert.equal(packet.dataset.packet,edge.packet);
        const badge=document.querySelector('.scope-edge-label rect');
        if(badge) {
          const box=Object.fromEntries(['x','y','width','height'].map(key=>[key,Number(badge.getAttribute(key))]));
          box.w=box.width; box.h=box.height;
          const permitted=new Set([...ancestors(nodes.get(edge.source).group),...ancestors(nodes.get(edge.target).group)]);
          for(const group of data.groups.filter(g=>!['cloud','region'].includes(g.kind)&&!permitted.has(g.id))) assert.ok(!overlaps(box,group),`${entry.id}/${i}: connector label covers unrelated ${group.id}`);
        }
        if(['association','check'].includes(edge.activity)) assert.equal(current.hasAttribute('marker-end'),false);
      } else {
        assert.equal(packet,null,`${entry.id}/${i}: local work must not emit a packet`);
        assert.ok(document.querySelector(`[data-node="${step.node}"].is-current-operation`));
      }
      if(entry.mode==='comparison') {
        assert.equal(get('run').textContent,'Run walkthrough');
        assert.match(caption,/independent patterns/);
      }
    }
    assert.ok(get('scenario-notes').textContent.includes(entry.exam));
    assert.equal(get('next').disabled,true);
  }
  // Every defined relationship, including ones outside the 25 scenarios, routes
  // around unrelated service boxes AND zones. In particular, runtime traffic
  // must not cut through the developer machine merely to find a shorter route.
  get('connections').checked=true; get('connections').dispatchEvent(new window.Event('change'));
  for(const edge of data.relationships) {
    const element=document.querySelector(`path[data-edge="${edge.id}"]`);
    assert.ok(element,`No route for ${edge.id}`);
    const length=element.getTotalLength();
    const permitted=new Set([...ancestors(nodes.get(edge.source).group),...ancestors(nodes.get(edge.target).group)]);
    const unrelated=data.groups.filter(group=>!['cloud','region'].includes(group.kind)&&!permitted.has(group.id));
    for(let n=2;n<length;n+=5) {
      const p=element.getPointAtLength(n);
      const collision=data.nodes.find(node=>node.id!==edge.source&&node.id!==edge.target&&p.x>node.x+1&&p.x<node.x+node.w-1&&p.y>node.y+1&&p.y<node.y+node.h-1);
      assert.ok(!collision,`${edge.id} crosses unrelated node ${collision?.id}`);
      const boundary=unrelated.find(group=>p.x>group.x&&p.x<group.x+group.w&&p.y>group.y&&p.y<group.y+group.h);
      assert.ok(!boundary,`${edge.id} cuts through unrelated boundary ${boundary?.id}`);
      if(edge.packet && !permitted.has('developer')) {
        const width=Math.max(46,edge.packet.length*8+16);
        assert.ok(!overlaps({x:p.x-width/2,y:p.y-14,w:width,h:28},groups.get('developer')),`${edge.id}: moving label overlaps developer machine`);
      }
    }
  }
  // The shared search filters scenarios by their actual services and feature
  // text, preserves the query on selection, and restores all on clear/reset.
  const search=value=>{get('search').value=value;get('search').dispatchEvent(new window.Event('input',{bubbles:true}));};
  const scenarioIds=()=>[...get('scenario').options].map(option=>option.value).filter(Boolean);
  search('EFS');assert.ok(scenarioIds().includes('storage'));assert.ok(!scenarioIds().includes('kinesis'));assert.ok(scenarioIds().length<data.scenarios.length);
  change('scenario','storage');assert.equal(get('search').value,'EFS');assert.ok(document.querySelector('[data-node="efs"].is-related'));
  search('no-such-service-xyz');assert.equal(scenarioIds().length,0);assert.equal(get('run').disabled,true);assert.match(get('scenario-filter').textContent,/0 of/);
  search('');assert.equal(scenarioIds().length,data.scenarios.length);assert.equal(get('scenario-filter').hidden,true);
  search('Kinesis');assert.ok(scenarioIds().includes('kinesis'));get('reset').click();assert.equal(scenarioIds().length,data.scenarios.length);
  search('SAM');change('compare',data.comparisons[0].id);
  assert.equal(get('search').value,'');assert.equal(scenarioIds().length,data.scenarios.length);
  assert.equal(get('run').disabled,true); assert.equal(get('scenario-notes').hidden,true);
  assert.match(get('step-detail').textContent,/Comparison highlights/);
  document.querySelector('[data-scope-category=""]').click();
  assert.equal(get('step').options.length,1); assert.match(get('step-detail').textContent,/Pause or use the step controls/);
  assert.equal(frames.size,0);
  assert.deepEqual(errors.map(e=>e.message),[]);
  process.stdout.write(`Simulator checks passed: top controls, pause/replay/reset, every step in ${data.scenarios.length} scenarios, packet semantics and ${data.relationships.length} routed relationships.\n`);
} finally { window.close(); }
