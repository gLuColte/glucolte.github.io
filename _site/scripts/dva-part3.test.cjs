const {test}=require('node:test');
const assert=require('node:assert/strict');
const core=require('../assets/dva-part3-core.js');
test('Cache choice: shared DynamoDB cache and strong-read bypass are distinct',()=>{
  for(const [scenario,choice] of Object.entries({products:'dax',sessions:'redis',images:'cloudfront',recommendations:'redis',strong:'direct'})) assert.equal(core.cacheChoice({scenario,choice}).blocked,false);
  assert.equal(core.cacheChoice({scenario:'strong',choice:'dax'}).blocked,true);
});
test('Each invocation permission controls its own hop; alternative invocation role works',()=>{
  const i={stage:'dev',client:true,resource:true,role:false,downstream:true};
  assert.ok(!core.invocation(i).blocked);
  assert.match(core.invocation({...i,client:false}).summary,/Hop 1 fails/);
  assert.match(core.invocation({...i,resource:false}).summary,/Hop 2 fails/);
  assert.match(core.invocation({...i,downstream:false}).summary,/Hop 3 fails/);
  assert.ok(!core.invocation({...i,resource:false,role:true}).blocked);
});
test('GSI sizes round independently, and write back-pressure is an index budget issue',()=>{
  const i={writes:100,size:3,projected:1.5,indexWcu:150,reads:40};
  const r=core.gsi(i);
  assert.equal(r.blocked,true);
  assert.match(r.table.rows[0][1],/300 WCUs/);assert.match(r.table.rows[1][1],/200 WCUs/);assert.match(r.table.rows[2][1],/20 RCUs/);
  assert.equal(core.gsi({...i,indexWcu:200}).blocked,false);
  assert.throws(()=>core.gsi({...i,projected:4}),/subset/);
});
const cliInput={dataset:'users',filter:'all',projection:'names',pageSize:4,maxItems:5,startToken:''};
test('CLI output pagination preserves intra-service-page offsets and aliases reserved names',()=>{
  const r1=core.cliStep(core.cliInitial(),'run',cliInput);
  assert.deepEqual(r1.table.rows.map(r=>r[0]),['u01','u02','u03','u04','u05']);
  assert.match(r1.summary,/2 underlying service call\(s\) evaluated 8/);
  assert.match(r1.code,/--expression-attribute-names '\{"#n":"Name"\}'/);
  const r2=core.cliStep(r1.state,'next',cliInput);
  assert.deepEqual(r2.table.rows.map(r=>r[0]),['u06','u07','u08','u09','u10']);
  const r3=core.cliStep(r2.state,'next',cliInput);
  assert.deepEqual(r3.table.rows.map(r=>r[0]),['u11','u12']);assert.equal(r3.state.nextToken,'');
  assert.throws(()=>core.cliStep(r1.state,'run',{...cliInput,startToken:'invented'}),/unchanged/);
  assert.throws(()=>core.cliStep(r1.state,'next',{...cliInput,filter:'active'}),/unchanged/);
});
test('CLI filter/projection change output, not evaluation; S3 output is 100 / 100 / 50',()=>{
  const filtered=core.cliStep(core.cliInitial(),'run',{...cliInput,filter:'active'});
  assert.deepEqual(filtered.table.rows.map(r=>r[0]),['u01','u03','u04','u06','u07']);
  assert.match(filtered.summary,/evaluated 8 items/);
  const i={...cliInput,dataset:'s3',pageSize:100,maxItems:100};
  let state=core.cliInitial();
  for(const [index,total] of [100,100,50].entries()) {
    const r=core.cliStep(state,index?'next':'run',i);state=r.state;
    assert.match(r.summary,new RegExp(`^${total} output items`));
  }
  assert.equal(state.nextToken,'');
});
const fifo={user:'User-A',group:'user',id:'purchase-001',body:'buy:book',content:false};
test('FIFO send suppression survives deletion, but expires; ordering and dedup scopes differ',()=>{
  let r=core.fifoStep(core.fifoInitial(),'send',fifo);
  r=core.fifoStep(r.state,'send',{...fifo,user:'User-B'});assert.equal(r.state.messages.length,1);
  r=core.fifoStep(r.state,'send',{...fifo,user:'User-B',id:'purchase-002'});assert.equal(r.state.messages.length,2);
  r=core.fifoStep(r.state,'receive',fifo);assert.equal(r.state.messages.filter(m=>m.status==='in-flight').length,2);
  r=core.fifoStep(r.state,'complete',fifo);assert.equal(r.state.messages.length,0);
  r=core.fifoStep(r.state,'retry',fifo);assert.equal(r.state.messages.length,0);
  r=core.fifoStep(r.state,'advance',fifo);r=core.fifoStep(r.state,'retry',fifo);assert.equal(r.state.messages.length,1);
});
test('FIFO same-group messages serialize; content-based mode compares bodies, not operation field',()=>{
  let r=core.fifoStep(core.fifoInitial(),'send',fifo);
  r=core.fifoStep(r.state,'send',{...fifo,id:'purchase-002'});
  r=core.fifoStep(r.state,'receive',fifo);assert.equal(r.state.messages.filter(m=>m.status==='in-flight').length,1);
  let x=core.fifoStep(core.fifoInitial(),'send',{...fifo,content:true});
  x=core.fifoStep(x.state,'send',{...fifo,content:true,id:'different'});assert.equal(x.state.messages.length,1);
});
test('CloudFront language mismatch reproduces until representation is keyed correctly',()=>{
  let r=core.cacheKeyStep(core.cacheKeyInitial(),'request',{lang:'en',include:false});
  r=core.cacheKeyStep(r.state,'request',{lang:'jp',include:false});assert.equal(r.blocked,true);assert.equal(r.state.last.returned,'en');
  r=core.cacheKeyStep(r.state,'request',{lang:'jp',include:true});assert.equal(r.blocked,false);assert.equal(r.state.last.hit,false);
});
const caching={record:'price',strategy:'lazy-ttl',newValue:'$120',fail:false};
test('Lazy TTL: DB writes can be stale; expiry alone does not refresh, next read does',()=>{
  let r=core.cacheStrategyStep(core.cacheStrategyInitial(caching),'read',caching);
  r=core.cacheStrategyStep(r.state,'write',caching);
  r=core.cacheStrategyStep(r.state,'read',caching);assert.equal(r.blocked,true);assert.equal(r.state.cache,'$100');
  r=core.cacheStrategyStep(r.state,'expire',caching);assert.equal(r.state.cache,'$100');
  r=core.cacheStrategyStep(r.state,'read',caching);assert.equal(r.state.cache,'$120');assert.equal(r.blocked,false);
});
test('Write-through updates while invalidation deletes; neither is atomic under a cache failure',()=>{
  for(const strategy of ['through','invalidate']) {
    const i={...caching,strategy};let r=core.cacheStrategyStep(core.cacheStrategyInitial(i),'read',i);
    const failed=core.cacheStrategyStep(r.state,'write',{...i,fail:true});assert.equal(failed.blocked,true);assert.equal(failed.state.db,'$120');assert.equal(failed.state.cache,'$100');
    r=core.cacheStrategyStep(r.state,'write',i);assert.equal(r.state.cache,strategy==='through'?'$120':null);
  }
});
test('KCL steady ownership: per-app workers cannot create extra shards',()=>{
  const r=core.kcl({shards:10,workers:20,apps:2});
  assert.equal(r.table.rows.length,40);assert.equal(r.table.rows.filter(r=>r[2].startsWith('Idle')).length,20);
  const compact=core.kcl({shards:10,workers:2,apps:1});assert.equal(compact.table.rows[0][2],'S1, S3, S5, S7, S9');
});
test('KMS request counter is a ceiling model, not nonce reuse or exact SDK caching',()=>{
  assert.equal(core.kmsRequests({transactions:1000,reuse:100}).table.rows[1][1],10);
  assert.equal(core.kmsRequests({transactions:1001,reuse:100}).table.rows[1][1],11);
  assert.equal(core.kmsRequests({transactions:1000,reuse:1}).table.rows[1][1],1000);
  assert.throws(()=>core.kmsRequests({transactions:1,reuse:0}));
});
test('Gateway route and interface SG/DNS differ; both endpoint types support DynamoDB',()=>{
  const i={service:'dynamodb',kind:'gateway',route:true,sg:true,dns:true};
  assert.equal(core.endpoint(i).blocked,false);assert.equal(core.endpoint({...i,kind:'interface'}).blocked,false);
  assert.equal(core.endpoint({...i,service:'kms'}).blocked,true);
  assert.equal(core.endpoint({...i,route:false}).blocked,true);
  assert.equal(core.endpoint({...i,kind:'interface',sg:false}).blocked,true);
});
test('S3 permission model separates credential expiry from independent public read and explicit Deny',()=>{
  const i={get:true,put:true,bucketGet:false,denyPut:false,removed:true,oldValid:true};
  assert.deepEqual(core.s3Access(i).table.rows.map(r=>r[1]),['Allow','Allow']);
  assert.deepEqual(core.s3Access({...i,oldValid:false}).table.rows.map(r=>r[1]),['Deny','Implicit deny / no credentials']);
  assert.equal(core.s3Access({...i,oldValid:false,bucketGet:true}).table.rows[0][1],'Allow');
  assert.equal(core.s3Access({...i,denyPut:true}).table.rows[1][1],'Explicit Deny');
});
const trace={sampling:100,trace:1,key:'tenant',value:'blue',metadata:'{"nested":{"attempt":1},"items":["book"]}',search:'annotation'};
test('Trace annotations are indexed; nested metadata is inspectable, not a trace-filter field',()=>{
  let r=core.traceStep(core.traceInitial(),'annotation',trace);
  r=core.traceStep(r.state,'metadata',trace);assert.equal(r.state.traces[0].metadata.debug.nested.attempt,1);
  r=core.traceStep(r.state,'search',trace);assert.match(r.summary,/matched 1 trace/);
  r=core.traceStep(r.state,'search',{...trace,search:'metadata'});assert.equal(r.blocked,true);
  r=core.traceStep(r.state,'generate',{...trace,sampling:0});assert.equal(r.state.traces.length,0);
  r=core.traceStep(r.state,'annotation',trace);assert.equal(r.blocked,true);
  assert.throws(()=>core.traceStep(core.traceInitial(),'metadata',{...trace,metadata:'broken'}),/valid JSON/);
});
test('S3 key flow keeps all SSE cryptography on S3; only SSE-KMS requires KMS',()=>{
  assert.equal(core.s3KeyFlow({mode:'s3'}).table.rows[2][1],'No native requirement');
  assert.equal(core.s3KeyFlow({mode:'kms'}).table.rows[2][1],'Yes');
  const customer=core.s3KeyFlow({mode:'customer'});assert.match(customer.summary,/KMS is not inherently/);assert.match(customer.table.rows[1][1],/Mandatory/);
});
