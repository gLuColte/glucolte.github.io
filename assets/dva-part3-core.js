/* Small, deterministic teaching models. No AWS calls or cryptographic operations. */
(() => {
  'use strict';
  const base = typeof module === 'object' && module.exports ? require('./dva-learning-core.js') : globalThis.DVALearning;
  const table = (headers, rows) => ({headers, rows});
  const integer = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
  function cacheChoice({scenario, choice}) {
    const examples = {
      products: {best:'dax', steps:['App · DAX client', 'Shared DAX cluster', 'DynamoDB on cache miss'], why:'Repeated eligible DynamoDB reads with minimal cache plumbing favour DAX. Redis can also cache them, but your application owns the cache-aside logic.'},
      sessions: {best:'redis', steps:['App · session ID', 'Redis session store', 'Expiry / persistence policy'], why:'A general-purpose shared session store fits Redis; design expiry and durability deliberately. DAX is specific to DynamoDB requests.'},
      images: {best:'cloudfront', steps:['Browser · image URL', 'CloudFront edge cache', 'S3 origin on miss'], why:'Static S3 images belong in an HTTP CDN path. Redis is not a direct CDN replacement.'},
      recommendations: {best:'redis', steps:['App · recommendation key', 'Redis cache', 'Compute / populate on miss'], why:'Cache arbitrary computed results in Redis using keys that include all relevant inputs and scope.'},
      strong: {best:'direct', steps:['App · ConsistentRead=true', 'DynamoDB table / LSI', 'Latest committed data'], why:'Bypass the cache for the required strong read. DAX forwards strong reads to DynamoDB without caching them; GSI reads cannot be strong.'}
    };
    const item = examples[scenario] || examples.products;
    return {steps:item.steps, blocked:choice !== item.best, summary:`${choice === item.best ? 'Good fit.' : 'Revisit the constraint.'} ${item.why}`};
  }
  function invocation({stage, client, resource, role, downstream}) {
    const steps = ['Client', `API Gateway · ${stage}`, `Lambda · my-api-${stage}`, 'DynamoDB'];
    if (!client) return {steps:steps.slice(0,2), blocked:true, summary:'Hop 1 fails: client authorisation denies the API request (typically 401/403 depending on the configured mechanism). Backend roles cannot authorise the incoming caller.'};
    if (!resource && !role) return {steps:steps.slice(0,3), blocked:true, summary:'Hop 2 fails: API Gateway cannot invoke this selected Lambda target. A missing integration permission can produce HTTP 500; the Lambda execution role does not fix it.'};
    if (!downstream) return {steps, blocked:true, summary:'Hop 3 fails: Lambda ran, but its execution role cannot access DynamoDB. The response depends on your error handling; this is not a client-authoriser failure.'};
    return {steps, summary:`All three boundaries pass. Stage variable lambdaFunction=my-api-${stage} selects a target; ${role ? 'a configured invocation role with trust and InvokeFunction permission' : 'a matching Lambda resource-policy Allow'} authorises API Gateway to call it.`};
  }
  function gsi({writes, size, projected, indexWcu, reads}) {
    if (!integer(indexWcu,1,1000000)) throw new Error('Provision a positive whole-number GSI WCU setting.');
    if (projected > size) throw new Error('In this example the GSI projection is a subset: its entry size must not exceed the base item size.');
    const baseUnits = base.dynamoCapacity({size, reads:0, writes, consistency:'eventual', transactional:false});
    const indexUnits = base.dynamoCapacity({size:projected, reads, writes, consistency:'eventual', transactional:false});
    const blocked = indexUnits.wcu > indexWcu;
    return {steps:['Write base item', 'Update GSI entry asynchronously', blocked ? 'Index pressure → base-write throttling risk' : 'GSI write budget fits'],
      table:table(['Budget','Calculation / demand'],[['Base table writes',`ceil(${size}/1) × ${writes}/s = ${baseUnits.wcu} WCUs`],['Additional GSI writes',`ceil(${projected}/1) × ${writes}/s = ${indexUnits.wcu} WCUs; provisioned ${indexWcu}`],['GSI eventual reads',`ceil(${projected}/4) × 0.5 × ${reads}/s = ${indexUnits.rcu} RCUs`]]),
      blocked, summary:blocked ? 'The index write budget is insufficient for this steady workload. GSI back-pressure can throttle the associated base-table writes even if the table itself has spare capacity.' : 'The arithmetic write budget fits. GSI reads use index RCUs, not table RCUs; allow headroom and account for real key distribution.'};
  }
  function cutover({strategy}) {
    const options = {
      stop:{steps:['Stop old server', 'Launch / configure replacement', 'Restore service'], blocked:true, summary:'Service is unavailable while no ready server exists. An auto-assigned public IP may change; stopping/starting the same instance also differs from replacement.'},
      eip:{steps:['Old server · EIP', 'Prepare + test replacement', 'Reassociate same EIP', 'Clients reconnect'], summary:'The public IPv4 address stays stable, but reassociation and connection recovery can briefly interrupt service. This is not guaranteed zero-downtime or cross-Region IP mobility.'},
      dns:{steps:['Independent ready servers', 'Health / DNS failover', 'Resolvers refresh cached answers'], summary:'Redundancy can improve availability, but detection and resolver/client caching affect failover. For self-hosted authoritative DNS, independent nameservers matter; DNS failover is not the same as preserving one EC2 service’s IP.'}
    };
    return options[strategy] || options.eip;
  }
  function kcl({shards, workers, apps}) {
    if (![shards,workers].every(n => integer(n,1,20)) || !integer(apps,1,3)) throw new Error('Use 1–20 shards/workers per application and 1–3 independent applications.');
    const active = Math.min(shards, workers), rows=[];
    for (let app=1; app<=apps; app++) for (let worker=0; worker<workers; worker++) {
      const leases = Array.from({length:shards},(_,s)=>s).filter(s=>s % workers === worker).map(s=>`S${s+1}`);
      rows.push([`App ${app}`,`Worker ${worker+1}`,leases.join(', ') || 'Idle · no shard lease']);
    }
    return {table:table(['Independent application','Worker','Assigned shard leases'],rows), steps:[`${shards} stream shards`, `${active} active / ${workers} workers per app`, `${apps} separate lease/checkpoint sets`],
      summary:`Each application has ${active} workers doing shard-level processing and ${workers-active} idle workers in this even, settled allocation. One worker can own several shards. Independent apps each read the stream; they do not multiply its write capacity or remove shared-read limits.`};
  }
  function kmsRequests({transactions, reuse}) {
    if (!integer(transactions,1,10000) || !integer(reuse,1,1000)) throw new Error('Use 1–10,000 transactions and a reuse limit of 1–1,000 messages/key.');
    const calls=Math.ceil(transactions/reuse);
    const first=[1,1+reuse,1+2*reuse].filter(n=>n<=transactions).join(', ');
    return {steps:[`${transactions} encryptions`, `At most ${reuse} messages / cached key`, `About ${calls} GenerateDataKey calls`],
      table:table(['Model','KMS data-key requests'],[['Fresh key per transaction',transactions],['Eligible cached materials',calls],['First refreshes at transaction',first]]),
      summary:`Approximately ${transactions-calls} fewer data-key requests in this single-client, matching-context example. Age/byte thresholds, cache misses and incompatible contexts can force earlier refreshes. Reusing a data key does not permit nonce/IV reuse.`};
  }
  function endpoint({service, kind, route, sg, dns}) {
    const names={s3:'S3',dynamodb:'DynamoDB',secrets:'Secrets Manager',kms:'KMS'};
    const target=names[service], gateway=['s3','dynamodb'].includes(service);
    const inactive=kind==='gateway'?['sg','dns']:['route'];
    if (kind==='gateway' && !gateway) return {steps:['Private EC2', 'Unsupported gateway destination'],blocked:true,inactive,summary:`Gateway endpoints support S3 and DynamoDB, not ${target}. Use a supported interface endpoint for this private-API path.`};
    if (kind==='gateway') return {steps:['Private EC2', 'Normal service DNS → public service address', route ? 'Prefix-list route → gateway endpoint' : 'No matching gateway route', `${target} regional service`], blocked:!route,inactive,
      summary:route ? 'Traffic stays on the AWS network without NAT/IGW. No endpoint ENI or endpoint security group is created. IAM/resource/endpoint policies still control access.' : 'Associate the gateway endpoint with the application subnet’s route table. Without that route, this no-NAT/no-IGW example has no private service path.'};
    return {steps:['Private EC2', dns ? 'Private / endpoint DNS → private ENI IP' : 'Public service DNS does not select the ENI', `${target} interface endpoint`, 'AWS PrivateLink → service'],blocked:!dns||!sg,inactive,
      summary:!dns ? 'Use configured private DNS or an endpoint-specific DNS name to reach this interface endpoint. An ordinary public DNS answer alone does not select its private ENI.' : !sg ? 'The endpoint security group blocks TCP 443. Interface endpoints have ENIs in selected subnets/AZs.' : `${target} supports this interface path, with endpoint ENIs and usual hourly/data charges. ${gateway ? 'For ordinary same-VPC access, its gateway endpoint is often the simpler no-additional-endpoint-charge choice.' : 'It is an appropriate private service entry point.'}`};
  }
  function s3Access({get, put, bucketGet, denyPut, removed, oldValid}) {
    const credentials=!removed||oldValid;
    const canGet=(credentials&&get)||bucketGet, canPut=credentials&&put&&!denyPut;
    return {steps:['EC2',credentials ? removed ? 'Previously issued, unexpired role credentials' : 'Instance profile → role credentials' : 'No usable role credentials', `GetObject · ${canGet?'allowed':'denied'}`, `PutObject · ${canPut?'allowed':'denied'}`],inactive:removed?[]:['oldValid'],
      table:table(['Request','Decision'],[['GetObject',canGet?'Allow':'Deny'],['PutObject',canPut?'Allow':denyPut?'Explicit Deny':'Implicit deny / no credentials']]),
      summary:`${removed ? 'Detaching the role stops ongoing credential renewal; cached credentials can remain usable until expiry unless otherwise revoked/denied. ' : ''}${bucketGet ? 'This toggle explicitly assumes a bucket policy permitting public/anonymous reads and compatible Block Public Access settings. ' : ''}${denyPut ? 'The bucket’s explicit PutObject Deny overrides role Allow. ' : ''}Every request is evaluated; there is no five-minute S3 read grace period.`};
  }
  function s3KeyFlow({mode}) {
    const modes={
      s3:{steps:['Client sends object over HTTPS', 'S3 manages keys', 'S3 encrypts / stores object'],summary:'SSE-S3: S3 controls the underlying key lifecycle; no customer KMS permission or supplied plaintext key is required.'},
      kms:{steps:['Client sends object + KMS key identifier', 'S3 obtains a KMS-protected data key', 'S3 encrypts / stores object'],summary:'SSE-KMS: KMS participates and S3 encrypts. Choose AWS-managed or customer-managed KMS keys as supported; a key identifier is not plaintext key material.'},
      customer:{steps:['Client owns encryption key', 'Object + actual key → HTTPS → S3', 'S3 encrypts; discards supplied key'],summary:'SSE-C: the customer manages and supplies the key; S3 performs encryption, does not persist that key, and rejects HTTP. KMS is not inherently involved; importing key material into KMS is a separate mechanism.'}
    };
    const result=modes[mode]||modes.s3;
    return {...result,table:table(['Question','Answer'],[['Who encrypts?','S3 in all three server-side modes'],['HTTPS',mode==='customer'?'Mandatory for SSE-C requests':'Use HTTPS; enforce it with aws:SecureTransport policy if required'],['KMS participates?',mode==='kms'?'Yes':'No native requirement']])};
  }
  const users=Array.from({length:12},(_,i)=>({UserID:`u${String(i+1).padStart(2,'0')}`,Name:['Ada','Ben','Chloe','Dev','Eva','Finn','Gia','Hugo','Ivy','Jay','Kim','Leo'][i],Email:`user${i+1}@example.com`,Active:i%3!==1}));
  const objects=Array.from({length:250},(_,i)=>({Key:`images/item-${String(i+1).padStart(3,'0')}.png`,Size:1024+i}));
  const cliInitial=()=>({tokens:{},serial:0,nextToken:''});
  function cliStep(state, action, input) {
    let patch={};
    if (state.dataset && state.dataset!==input.dataset) {
      state=cliInitial();
      patch={startToken:'',pageSize:input.dataset==='s3'?100:4,maxItems:input.dataset==='s3'?100:5};
      input={...input,...patch};
    }
    const s={...state,dataset:input.dataset,tokens:{...state.tokens}}, data=input.dataset==='s3'?objects:users;
    if (!integer(input.pageSize,1,100) || !integer(input.maxItems,1,100)) throw new Error('Use whole page-size and max-items values from 1–100.');
    const signature=JSON.stringify([input.dataset,input.filter,input.projection,input.pageSize]);
    let token=input.startToken.trim();
    if (action==='next') {
      if (!s.nextToken) return {state:s,summary:'No NextToken remains. Reset to start again.'};
      token=s.nextToken; patch.startToken=token;
    }
    let cursor={start:0,skip:0};
    if (token) {
      const saved=s.tokens[token];
      if (!saved||saved.signature!==signature) throw new Error('Use an unchanged simulated NextToken with the same dataset, filter, projection and page-size. Reset if those options changed.');
      cursor=saved.cursor;
    }
    let start=cursor.start, skip=cursor.skip, evaluated=0, calls=0, rows=[], next=null;
    while (start<data.length && rows.length<input.maxItems) {
      const page=data.slice(start,start+input.pageSize); calls++; evaluated+=page.length;
      const matches=input.dataset==='users'&&input.filter==='active'?page.filter(x=>x.Active):page;
      const take=matches.slice(skip,skip+input.maxItems-rows.length); rows.push(...take);
      const used=skip+take.length;
      next=used<matches.length ? {start,skip:used} : start+page.length<data.length ? {start:start+page.length,skip:0} : null;
      if (used<matches.length) break;
      start+=page.length; skip=0;
    }
    s.nextToken='';
    if (next) {
      const existing=Object.entries(s.tokens).find(([,v])=>v.signature===signature&&v.cursor.start===next.start&&v.cursor.skip===next.skip);
      s.nextToken=existing?existing[0]:`SIM-${String(++s.serial).padStart(4,'0')}-continuation`;
      s.tokens[s.nextToken]={signature,cursor:next};
    }
    const keys=input.dataset==='s3'?['Key','Size']:input.projection==='names'?['UserID','Name']:input.projection==='contact'?['Name','Email']:['UserID','Name','Email','Active'];
    const selected=rows.map(row=>Object.fromEntries(keys.map(k=>[k,row[k]])));
    const attribute = v=>typeof v==='boolean'?{BOOL:v}:typeof v==='number'?{N:String(v)}:{S:v};
    const response=input.dataset==='s3'?{Contents:selected}:{Items:selected.map(row=>Object.fromEntries(Object.entries(row).map(([k,v])=>[k,attribute(v)])))};
    if (s.nextToken) response.NextToken=s.nextToken;
    const command=input.dataset==='s3'?'aws s3api list-objects-v2 --bucket my-bucket':'aws dynamodb scan --table-name Users';
    const aliasNames={...(input.dataset==='users'&&input.projection!=='all'?{'#n':'Name'}:{}),...(input.dataset==='users'&&input.filter==='active'?{'#a':'Active'}:{})};
    const projection=input.dataset==='users'&&input.projection!=='all'?` \\\n  --projection-expression "${keys.map(k=>k==='Name'?'#n':k).join(', ')}"`:'';
    const filter=input.dataset==='users'&&input.filter==='active'?` \\\n  --filter-expression "#a = :yes" \\\n  --expression-attribute-values '{":yes":{"BOOL":true}}'`:'';
    const aliasArg=Object.keys(aliasNames).length?` \\\n  --expression-attribute-names '${JSON.stringify(aliasNames)}'`:'';
    return {state:s,patch,table:table(keys,selected.slice(0,10).map(row=>keys.map(k=>String(row[k])))),
      code:`# Simulated CLI command / response excerpt\n${command}${projection}${filter}${aliasArg} \\\n  --page-size ${input.pageSize} --max-items ${input.maxItems}${token?` \\\n  --starting-token "${token}"`:''}\n\n${JSON.stringify(response,null,2)}`,
      summary:`${rows.length} output items; ${calls} underlying service call(s) evaluated ${evaluated} items. ${rows.length>10?'Table previews the first 10; JSON contains this entire output page. ':''}${s.nextToken?'Pass NextToken unchanged as --starting-token (or choose Use NextToken).':'End of this dataset; no NextToken.'}`,
      inactive:input.dataset==='s3'?['filter','projection']:[]};
  }
  const fifoInitial=()=>({time:0,messages:[],dedup:[],sequence:1,last:null,message:'Queue empty. Send User A, then User B with another logical operation ID.'});
  function fifoStep(state, action, input) {
    const s={...state,messages:state.messages.map(m=>({...m})),dedup:state.dedup.map(d=>({...d}))};
    if (action==='advance') {s.time+=300;s.message='Five minutes advanced. Old deduplication records can expire; queued messages are not deleted by this clock change.';}
    else if (action==='receive') {
      const busy=new Set(s.messages.filter(m=>m.status==='in-flight').map(m=>m.group)), chosen=[];
      for (const m of s.messages) if (m.status==='ready'&&!busy.has(m.group)) {m.status='in-flight';busy.add(m.group);chosen.push(m.sequence);}
      s.message=chosen.length?`Received group heads ${chosen.join(', ')} concurrently. Later messages in each group wait for completion/visibility recovery.`:'No unblocked group head is ready.';
    } else if (action==='complete') {const n=s.messages.filter(m=>m.status==='in-flight').length;s.messages=s.messages.filter(m=>m.status!=='in-flight');s.message=`Successfully processed/deleted ${n} message(s). Deduplication tracking is not erased by deletion.`;}
    else if (action==='send'||action==='retry') {
      if (action==='retry'&&!s.last) return {state:s,summary:'Send a message before retrying it.'};
      const m=action==='retry'?{...s.last}:{user:input.user,group:input.group==='user'?input.user:'all-users',id:input.id.trim(),body:input.body,content:input.content};
      if (!m.body.trim()||!m.content&&!m.id) throw new Error('Supply a body and an operation/deduplication ID, or enable content-based deduplication.');
      // Equality is simulated, not a replacement hash implementation.
      const identity=m.content?`body:${m.body}`:`id:${m.id}`;
      s.dedup=s.dedup.filter(d=>d.until>s.time);s.last=m;
      if (s.dedup.some(d=>d.identity===identity)) s.message='Send acknowledged; duplicate suppressed inside the five-minute window. No new deliverable message was added.';
      else {s.dedup.push({identity,until:s.time+300});s.messages.push({...m,sequence:s.sequence++,status:'ready'});s.message=`New message accepted for ${m.group}. Deduplication ID identifies the logical send; group ID defines ordering.`;}
    }
    return {state:s,steps:[`Producer · t+${s.time}s`, `${s.messages.length} deliverable / in-flight messages`, 'One active head per group in this model'],
      table:table(['Sequence / user','MessageGroupId','Deduplication identity','State'],s.messages.map(m=>[`${m.sequence} · ${m.user}`,m.group,m.content?'SHA-256(body) · equality simulated':m.id,m.status])),summary:s.message,inactive:input.content?['id']:[]};
  }
  const cacheKeyInitial=()=>({entries:{},last:null});
  function cacheKeyStep(state, action, {lang, include}) {
    const s={entries:{...state.entries},last:state.last};
    if (action==='request') {
      const key='/reviews'+(include?`?lang=${lang}`:'');
      const hit=Object.hasOwn(s.entries,key);
      if (!hit) s.entries[key]=lang;
      s.last={lang,key,hit,returned:s.entries[key]};
    }
    const last=s.last;
    return {state:s,steps:last?[`GET /reviews?lang=${last.lang}`, `Key · ${last.key}`, last.hit?'Cache hit':'Miss → origin', `Returned language · ${last.returned}`]:['Request en', 'Then request jp', 'Inspect cache key'],
      table:table(['Cached key','Response language'],Object.entries(s.entries)),blocked:Boolean(last&&last.lang!==last.returned),
      summary:last?`Last request: ${last.lang}; ${last.hit?'hit':'miss'}. ${last.lang!==last.returned?'Wrong language: different representations collapsed into one key. A shorter TTL cannot make that key correct.':'Response matches the requested language.'}`:'No requests yet. Excluding lang lets the first response fill a shared key; enabling it creates separate representations.'};
  }
  function cacheStrategyInitial(input={record:'price',strategy:'lazy-ttl'}) {
    const values={price:['$100','$120'],profile:['Bio v1','Bio v2'],blog:['Post v1','Post v2']};
    const pair=values[input.record]||values.price;
    return {record:input.record,strategy:input.strategy,time:0,db:pair[0],cache:null,expires:null,message:'Cache empty; read once, update the database, then read again.',suggested:pair[1]};
  }
  function cacheStrategyStep(state, action, input) {
    const changed=state.record!==input.record||state.strategy!==input.strategy;
    const s=changed?cacheStrategyInitial(input):{...state};
    const ttl=input.strategy==='lazy-ttl';
    let stale=false;
    if (action==='read') {
      const hit=s.cache!==null&&(!ttl||s.expires>s.time);
      if (!hit) {s.cache=s.db;s.expires=ttl?s.time+60:null;}
      stale=s.cache!==s.db;
      s.message=`${hit?'Cache hit':'Cache miss → fetch DB → populate cache'}; returned ${s.cache}. ${stale?'STALE value returned.':'Matches the current database value in this serial example.'}`;
    } else if (action==='write') {
      if (!input.newValue.trim()) throw new Error('Enter the new database value.');
      s.db=input.newValue;
      if (input.strategy==='through') {if (!input.fail) s.cache=s.db;s.message=input.fail?'DB committed; cache update FAILED. Old/missing cache remains: this is not an atomic write.':'DB committed, then cache populated/updated, even if nobody has read this item.';}
      else if (input.strategy==='invalidate') {if (!input.fail) {s.cache=null;s.expires=null;}s.message=input.fail?'DB committed; cache invalidation FAILED. The previous cached representation can still be served.':'DB committed, then cached entry deleted. Next read is a miss and loads the new value.';}
      else s.message='Only DB changed. Lazy loading does not update an existing cached entry; it can be stale until expiry/eviction/invalidation.';
    } else if (action==='advance') {s.time+=60;s.message=ttl?'Advanced 60 seconds. TTL expiry makes the next read miss; it does not fetch fresh data by itself.':'Advanced 60 seconds. This strategy has no TTL in the example; time alone does not update or invalidate the entry.';}
    else if (action==='expire') {if (ttl&&s.expires!==null) {s.time=Math.max(s.time,s.expires);s.message='TTL reached. The cached value is now expired; the next read must fetch the database.';}else s.message='No active TTL to expire. Select Lazy loading + TTL and read first.';}
    const expired=ttl&&s.cache!==null&&s.expires<=s.time;
    return {state:s,patch:changed?{newValue:s.suggested}:{},steps:['Application', 'Cache lookup / write action', 'Source-of-truth database'],
      table:table(['State','Value'],[['Database',s.db],['Cache',s.cache===null?'Empty':`${s.cache}${expired?' · expired':''}`],['Clock / TTL',`t+${s.time}s / ${s.expires===null?'none':`expires t+${s.expires}s`}`]]),blocked:stale||(action==='write'&&input.fail&&['through','invalidate'].includes(input.strategy)),summary:s.message,inactive:['through','invalidate'].includes(input.strategy)?[]:['fail']};
  }
  const traceInitial=()=>({rate:100,traces:Array.from({length:20},(_,i)=>({id:i+1,annotations:{},metadata:{}})),message:'20 example requests sampled. Select a trace and add fields.'});
  function traceStep(state, action, input) {
    if (!integer(input.sampling,0,100)||!integer(input.trace,1,20)) throw new Error('Use sampling 0–100% and request numbers 1–20.');
    const s={...state,traces:state.traces.map(t=>({...t,annotations:{...t.annotations},metadata:{...t.metadata}}))};
    if (action==='generate') {s.rate=input.sampling;s.traces=Array.from({length:Math.floor(20*input.sampling/100)},(_,i)=>({id:i+1,annotations:{},metadata:{}}));s.message=`New batch: ${s.traces.length}/20 requests traced at illustrative ${input.sampling}% sampling.`;}
    const selected=s.traces.find(t=>t.id===input.trace);
    let hits=null,blocked=false;
    if (action==='annotation'||action==='metadata') {
      if (!selected) {blocked=true;s.message='This request was not sampled in the current batch. It has no trace to enrich.';}
      else if (action==='annotation') {
        if (!/^[A-Za-z0-9_]+$/.test(input.key)) throw new Error('Use a simple annotation key: letters, digits and underscores.');
        Object.defineProperty(selected.annotations,input.key,{value:input.value,enumerable:true,configurable:true,writable:true});s.message=`Trace ${selected.id}: annotation indexed; search with annotation.${input.key} = "${input.value}".`;
      } else {try {selected.metadata.debug=JSON.parse(input.metadata);}catch(_){throw new Error('Metadata must be valid JSON; objects/arrays are allowed.');}s.message=`Trace ${selected.id}: debug metadata stored; inspect it here, but it is not an indexed trace-filter field.`;}
    } else if (action==='search') {
      if (input.search==='metadata') {hits=[];blocked=true;s.message='Metadata is not indexed by X-Ray trace filters. Search an annotation, then inspect metadata inside matching traces.';}
      else {hits=s.traces.filter(t=>t.annotations[input.key]===input.value).map(t=>t.id);s.message=`Annotation search matched ${hits.length} trace(s): ${hits.join(', ')||'none'}. Untraced requests cannot match.`;}
    }
    return {state:s,steps:['API Gateway · segment','Lambda · segment','DynamoDB call · subsegment / inferred node'],
      table:table(['Trace','Indexed annotations','Metadata present'],s.traces.map(t=>[t.id,JSON.stringify(t.annotations),Object.keys(t.metadata).length?'Yes · inspect, not indexed':'No'])),
      code:JSON.stringify({sampledRequests:s.traces.length,totalRequests:20,selectedTrace:selected||null},null,2),blocked,summary:s.message};
  }
  const api={cacheChoice,invocation,gsi,cutover,kcl,kmsRequests,endpoint,s3Access,s3KeyFlow,cliInitial,cliStep,fifoInitial,fifoStep,cacheKeyInitial,cacheKeyStep,cacheStrategyInitial,cacheStrategyStep,traceInitial,traceStep};
  if (typeof module==='object'&&module.exports) module.exports=api;
  else Object.assign(globalThis.DVALearning,api);
})();
