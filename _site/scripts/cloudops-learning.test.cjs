const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const core=require('../assets/cloudops-core.js');
const data=require('../_data/cloudops_study.json');
const arch=require('../_data/cloudops_architecture.json');
test('Every SOA-C03 task has references, practice and a concrete next step',()=>{
  assert.deepEqual(data.domains.map(d=>d.weight),[22,22,22,16,18]);
  assert.equal(data.tasks.length,13);assert.ok(data.practice.length>=25);
  const labs=new Set(['alarm','capacity','recovery','stack','access','network']);
  for(const t of data.tasks){
    assert.ok(t.cards.length && t.questions.length && t.next.length>50);
    t.cards.forEach(id=>assert.ok(data.cards[id],`${t.id}: ${id}`));
    t.labs.forEach(id=>assert.ok(labs.has(id)));
    t.questions.forEach(id=>assert.ok(data.practice.some(q=>q.id===id && q.task===t.id)));
  }
  for(const c of Object.values(data.cards)){
    ['role','flow','boundary','investigate','remediate','example','trigger','trap','analogy'].forEach(k=>assert.ok(c[k]?.length>20,`${c.id}: ${k}`));
    if(c.table)c.table.rows.forEach(row=>assert.equal(row.length,c.table.headers.length));
    const icon=fs.readFileSync(path.join(__dirname,'../study/assets/aws-architecture-icons',`Arch_${c.icon}_64.svg`),'utf8');
    assert.match(icon,/<svg[\s>]/);assert.ok(c.docs.every(d=>/^https:\/\/(docs\.aws\.amazon\.com|kiro\.dev)\//.test(d.url)));
    assert.ok(!c.example.includes('\n+'),'No patch characters in examples');
    for(const note of c.notes||[]){assert.ok(note.id && note.title && note.flow && note.paragraphs.length);assert.ok(note.trigger && note.trap && note.docs.length);if(note.table)note.table.rows.forEach(row=>assert.equal(row.length,note.table.headers.length));}
  }
});
test('Questions identify exact answer sets and explain every alternative',()=>{
  assert.equal(new Set(data.practice.map(q=>q.id)).size,data.practice.length);
  for(const q of data.practice){
    assert.ok(data.tasks.some(t=>t.id===q.task));assert.equal(q.domain,Number(q.task[0]));
    assert.ok(q.answers.length>=1 && q.answers.length<q.choices.length);
    assert.equal(new Set(q.answers).size,q.answers.length);
    q.answers.forEach(i=>assert.ok(q.choices[i]));
    q.choices.forEach(c=>assert.ok(c.text && c.why.length>25));
    assert.ok(q.clue && q.change && q.analogy);q.cards.forEach(k=>assert.ok(data.cards[k]));
    if(q.answers.length>1)assert.ok(q.choices.length>=5);
  }
});
test('Architecture placement, references and relationship semantics are valid',()=>{
  const nodes=new Map(arch.nodes.map(n=>[n.id,n])), groups=new Map(arch.groups.map(g=>[g.id,g])), edges=new Map(arch.relationships.map(e=>[e.id,e]));
  const ancestors=id=>{const out=[];for(let g=groups.get(id);g;g=groups.get(g.parent))out.push(g.id);return out;};
  assert.equal(nodes.size,arch.nodes.length);assert.equal(edges.size,arch.relationships.length);
  for(const n of arch.nodes){
    if(n.card)assert.ok(data.cards[n.card]);
    if(n.icon)assert.ok(fs.existsSync(path.join(__dirname,'../study/assets/aws-architecture-icons',`Arch_${n.icon}_64.svg`)),`Official icon for ${n.id}`);
    const g=groups.get(n.group);
    if(n.group!=='external'){assert.ok(g);assert.ok(n.x>=g.x && n.y>=g.y+35 && n.x+n.w<=g.x+g.w && n.y+n.h<=g.y+g.h,`${n.id} inside ${g.id}`);}
  }
  for(const id of ['s3','kms','backup','metrics','logs','cfn','asg'])assert.ok(!ancestors(nodes.get(id).group).includes('vpc'),`${id} outside VPC`);
  for(const id of ['dns','edge','iam'])assert.ok(!ancestors(nodes.get(id).group).includes('region'));
  for(const k of ['a','b'])assert.equal(nodes.get(`ebs-${k}`).group,nodes.get(`ec2-${k}`).group);
  for(const e of arch.relationships){assert.ok(nodes.has(e.source)&&nodes.has(e.target));assert.ok(e.description&&e.plane&&e.activity);if(['check','association','internal'].includes(e.activity))assert.equal(e.packet,null);}
  for(const s of arch.scenarios){assert.ok(s.steps.length>=5 && s.note && s.exam);for(const step of s.steps){assert.ok(Boolean(step.node)!==Boolean(step.edge));assert.ok(step.node?nodes.has(step.node):edges.has(step.edge));assert.ok(step.phase&&step.text);
    for(const [id,status] of Object.entries(step.nodeStates||{})){assert.ok(nodes.has(id));assert.ok(['healthy','verified','failed','unhealthy','pending','info','retired'].includes(status.tone));assert.ok(status.label && status.detail);assert.ok(status.label.length<=24,`${id}: ${status.label} badge too wide`);}
    for(const id of step.inactiveEdges||[]){assert.ok(edges.has(id));assert.notEqual(id,step.edge,'Do not animate a user request on an unavailable route');}
  }}
  for(const s of arch.scenarios)for(const id of s.practice||[])assert.ok(data.practice.some(q=>q.id===id),`${s.id}: missing practice ${id}`);
  for(const c of arch.comparisons){[...c.left,...c.right].forEach(id=>assert.ok(nodes.has(id)));assert.ok(c.rule&&c.exception);}
});
test('Checkpoint notes and contrasting practice are integrated into existing cards',()=>{
  const noteIds=Object.values(data.cards).flatMap(c=>c.notes||[]).map(n=>n.id);
  for(const id of ['mysql-replicas','routes-versus-access','network-defaults','internet-egress','offline-rescue','ami-snapshot-template','image-consistency-recovery','volume-initialisation','device-name-attachment','ami-sharing','asg-key-permissions','health-versus-errors','resize-state','network-performance','origin-shield','s3-origin-boundary','signing-region','retention-versus-deletion','logging-cost-scope','creation-event-versus-alarm','synthetics-versus-correlation'])assert.ok(noteIds.includes(id),id);
  assert.equal(new Set(noteIds).size,noteIds.length);
  assert.ok(data.practice.filter(q=>q.collection==='operational-followup').length>=20);
  assert.ok(data.practice.some(q=>q.id==='cp-kms-same') && data.practice.some(q=>q.id==='cp-kms-cross'));
  const ami=arch.scenarios.find(s=>s.id==='ami-launch');
  assert.ok(ami.steps.some(s=>s.edge==='restore-root'));assert.ok(ami.steps.some(s=>s.edge==='new-root-attach'));
  const wrongRegion=arch.scenarios.find(s=>s.id==='origin-region');
  assert.ok(wrongRegion.steps.some(s=>s.edge==='s3-region-error'));
  assert.ok(wrongRegion.practice.includes('cp-signing-region'));
});
test('Origin Shield shares one illustrated fetch across two independent cache paths',()=>{
  const s=arch.scenarios.find(s=>s.id==='origin-shield');
  assert.ok(s && s.practice.includes('cp-origin-shield'));
  const ids=s.steps.map(step=>step.edge).filter(Boolean);
  assert.equal(ids.filter(id=>id==='shield-origin').length,1,'Only one illustrated origin fetch');
  assert.equal(ids.filter(id=>id==='viewer').length,2,'Two separate viewer requests');
  assert.equal(ids.filter(id=>id==='viewer-return').length,2,'Each viewer has its own response');
  for(const cache of ['sg','tokyo']){
    assert.ok(ids.includes(`${cache}-shield`) && ids.includes(`shield-${cache}-result`));
    assert.ok(ids.indexOf(`${cache}-shield`)<ids.indexOf('origin-shield-result'),'Both requests arrive before the shared result');
  }
  const pending=s.steps.find(step=>step.node==='origin-shield' && step.nodeStates['origin-shield'].label==='2 MISSES · 1 FETCH');
  assert.ok(pending,'Internal consolidation has no invented packet');
  assert.equal(pending.nodeStates.s3.label,'ORIGIN FETCHES: 1');
  assert.equal(s.steps.at(-1).nodeStates.s3.label,'ORIGIN FETCHES: 1');
  const shield=arch.nodes.find(n=>n.id==='origin-shield');
  assert.equal(arch.groups.find(g=>g.id===shield.group).parent,'region');
  for(const id of ['cache-sg','cache-tokyo']){
    const n=arch.nodes.find(n=>n.id===id);
    assert.equal(arch.groups.find(g=>g.id===n.group).parent,'cloud','Other-Region cache is outside the origin Region');
    assert.equal(n.card,'edge','Reuse the existing CloudFront card');
  }
});
test('Operating-control scenarios preserve the deciding trust, lifecycle and location boundaries',()=>{
  const scenes=new Map(arch.scenarios.map(s=>[s.id,s]));
  for(const id of ['stack-policy','named-role','stackset-rollout','protected-scale-in','ec2-resize','termination-controls','quota-check','public-private-path','asg-key-same','asg-key-cross','finance-copy','fsr-destination','snapshot-schedule','capacity-assurance','ami-scope','snow-import']){
    const s=scenes.get(id);assert.ok(s && s.practice.length,id);
    s.steps.forEach(step=>assert.ok(step.summary,`${id}: explicit learner outcome`));
  }
  const protectedGroup=scenes.get('protected-scale-in');
  assert.equal(protectedGroup.steps[1].nodeStates.asg.label,'DESIRED 3 · ACTUAL 4');
  assert.equal(protectedGroup.steps.at(-1).nodeStates.asg.label,'DESIRED 3 · ACTUAL 3');
  const quota=scenes.get('quota-check');
  assert.ok(quota.steps.some(s=>s.edge==='ta-status'));
  const taBus=arch.nodes.find(n=>n.id==='ta-events');
  assert.equal(arch.groups.find(g=>g.id===taBus.group).label.includes('us-east-1'),true);
  assert.equal(arch.groups.find(g=>g.id===taBus.group).parent,'cloud','Never draw us-east-1 inside Sydney');
  const cross=scenes.get('asg-key-cross');
  assert.ok(cross.steps.some(s=>s.edge==='asg-shared-key'));
  assert.ok(!cross.steps.some(s=>s.edge==='trust'),'KMS launch grant is not a cross-account AssumeRole hop');
  const fsr=scenes.get('fsr-destination');
  assert.ok(fsr.steps.findIndex(s=>s.nodeStates.snapshot.label==='AZ B FSR READY')<fsr.steps.findIndex(s=>s.edge==='fsr-create'));
  assert.equal(arch.nodes.find(n=>n.id==='fsr-volume').group,'priv-b');
  const schedule=scenes.get('snapshot-schedule');
  assert.ok(schedule.steps.some(s=>s.edge==='schedule-snapshot'));
  const api=arch.relationships.find(e=>e.id==='schedule-snapshot');
  assert.equal(api.target,'ec2-api','Direct supported API target; no mandatory Lambda');
  const table=data.cards.ebs.notes.find(n=>n.id==='snapshot-scheduling').table;
  assert.deepEqual(table.rows.map(r=>r[1]),['Data Lifecycle Manager','AWS Backup','EventBridge Scheduler']);
  const finance=scenes.get('finance-copy');
  assert.equal(finance.steps.filter(s=>s.edge==='finance-copy').length,2,'A separate destination request for each source');
  assert.ok(scenes.get('ami-launch').steps.some(s=>s.edge==='new-agent-metrics'),'Extend existing image launch rather than duplicate it');
});
test('ASG replacement is a new instance, with health detection before routing and no invented DB failover',()=>{
  const s=arch.scenarios.find(s=>s.id==='asg-recovery');
  assert.ok(s);assert.match(s.note,/ELB health checks/);assert.match(s.note,/launch-before-terminate/);
  const launched=s.steps.findIndex(step=>step.edge==='desired');
  const ready=s.steps.findIndex(step=>step.nodeStates['ec2-new'].label==='HEALTHY');
  const routed=s.steps.findIndex(step=>step.edge==='new-target');
  const terminated=s.steps.findIndex(step=>step.edge==='terminate-old');
  assert.ok(launched>0 && ready>launched && routed>ready && terminated>ready);
  const reports=s.steps.map((step,i)=>step.edge==='elb-health-asg'?i:-1).filter(i=>i>=0);
  assert.equal(reports.length,2,'Show unhealthy and healthy ELB results reaching ASG');
  assert.ok(reports[0]<launched && reports[1]>ready && reports[1]<terminated);
  assert.equal(s.steps[reports[0]].nodeStates.asg.label,'A UNHEALTHY');
  assert.equal(s.steps[reports[1]].nodeStates.asg.label,'NEW A HEALTHY');
  const healthInput=arch.relationships.find(e=>e.id==='elb-health-asg');
  assert.equal(healthInput.source,'alb');assert.equal(healthInput.target,'asg');assert.equal(healthInput.packet,null);
  assert.equal(arch.relationships.find(e=>e.id==='desired').target,'ec2-new');
  assert.equal(s.steps[0].nodeStates['ec2-a'].tone,'healthy');
  assert.equal(s.steps[1].nodeStates['ec2-a'].label,'APP FAILED');
  assert.equal(s.steps[1].nodeStates['ec2-new'].hidden,true);
  for(const step of s.steps){assert.ok(step.summary);assert.equal(step.nodeStates['ec2-b'].tone,'healthy');assert.ok(!Object.keys(step.nodeStates).some(k=>k.startsWith('rds')));}
  assert.equal(s.steps.at(-1).nodeStates['ec2-a'].tone,'retired');
  assert.equal(s.steps.at(-1).nodeStates['ec2-new'].tone,'healthy');
  for(const step of s.steps)if(step.nodeStates['ec2-new'].tone==='healthy')assert.notEqual(step.nodeStates['ec2-b'].label,'SERVING ALONE');
  const az=arch.scenarios.find(s=>s.id==='az-failure');
  assert.match(az.steps.at(-1).summary,/degraded/);
  assert.equal(az.steps.at(-1).nodeStates['rds-b'].name,'RDS writer B');
  assert.equal(az.steps.at(-1).nodeStates['ec2-a'].tone,'failed');
});
test('Alarm changes with M/N, missing policy, period and prior state',()=>{
  const x={values:'70,90,-',n:3,m:2,threshold:80,missing:'missing',previous:'OK',period:60};
  assert.equal(core.alarm(x).state,'INSUFFICIENT_DATA');
  assert.equal(core.alarm({...x,missing:'breaching'}).state,'ALARM');
  assert.equal(core.alarm({...x,missing:'notBreaching'}).state,'OK');
  assert.equal(core.alarm({...x,missing:'ignore',previous:'ALARM'}).state,'ALARM');
  assert.equal(core.alarm({...x,values:'81,85,90'}).state,'ALARM');
  assert.equal(core.alarm({...x,period:300}).minutes,15);
  assert.ok(core.alarm({...x,values:'x,90,-'}).error);
});
test('Network checks identify DNS, route, filter and return-port failures',()=>{
  const x={dns:true,route:true,sg:true,inbound:true,outbound:true,backend:true,port:54321,https:true};
  assert.equal(core.network(x).blocked,-1);
  for(const key of ['dns','route','sg','inbound','outbound','backend'])assert.ok(core.network({...x,[key]:false}).blocked>=0);
  assert.match(core.network({...x,outbound:false}).state,/54321/);
  assert.match(core.network({...x,https:false}).gates[2][0],/80/);
});
test('ASG policy adjusts desired; AZ loss changes actual/healthy capacity',()=>{
  const x={min:2,max:10,desired:5,adjustment:3,a:2,b:3,load:400,failed:false,health:true};
  const r=core.capacity(x);assert.equal(r.desired,8);assert.equal(r.current,5);assert.equal(r.capacity,500);
  const failed=core.capacity({...x,failed:true});assert.equal(failed.capacity,300);assert.equal(failed.launch,5);assert.match(failed.state,/SHORTFALL/);
  assert.equal(core.capacity({...x,max:6}).desired,6);
  assert.equal(core.capacity({...x,adjustment:-10}).desired,2);
  assert.equal(core.capacity({...x,health:false}).healthy,0);
});
test('Recovery must meet both time objectives; replicated corruption needs history',()=>{
  assert.equal(core.recovery({rto:120,rpo:15,corruption:false}).state,'Continuous PITR + restore');
  assert.equal(core.recovery({rto:15,rpo:2,corruption:false}).state,'Warm-standby runbook');
  assert.match(core.recovery({rto:15,rpo:2,corruption:true}).state,/NO LISTED/);
  assert.match(core.recovery({rto:1,rpo:0,corruption:false}).state,/NO LISTED/);
});
test('Stack rollback and a completed rollback require different next actions',()=>{
  assert.match(core.stack({status:'UPDATE_ROLLBACK_FAILED',permission:false,ips:true}).state,/REPAIR/);
  assert.match(core.stack({status:'UPDATE_ROLLBACK_FAILED',permission:true,ips:true}).command,/continue-update-rollback/);
  assert.match(core.stack({status:'UPDATE_ROLLBACK_COMPLETE',permission:true,ips:true}).state,/CHANGE SET/);
  assert.match(core.stack({status:'UPDATE_ROLLBACK_COMPLETE',permission:true,ips:false}).state,/FIX/);
});
test('KMS lab requires both resource and configured key-policy/identity path',()=>{
  const x={session:true,resource:true,deny:false,key:true,decrypt:true,enabled:true};
  assert.equal(core.access(x).blocked,-1);
  for(const key of ['session','resource','key','decrypt','enabled'])assert.ok(core.access({...x,[key]:false}).blocked>=0);
  assert.match(core.access({...x,deny:true}).state,/explicit deny/);
});
