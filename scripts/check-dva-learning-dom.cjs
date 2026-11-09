/* Optional DOM regression harness. Install jsdom outside the site, then run:
 * NODE_PATH=/path/to/node_modules node scripts/check-dva-learning-dom.cjs /path/to/built/site
 * No browser/AWS calls or application dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM, VirtualConsole} = require('jsdom');
const directory = path.resolve(process.argv[2] || '_site');
const html = fs.readFileSync(path.join(directory, 'study/examAssociateDeveloper.html'), 'utf8');
const virtualConsole = new VirtualConsole();
const errors = [];
virtualConsole.on('jsdomError', error => errors.push(error));
const dom = new JSDOM(html, {url: 'https://example.test/study/examAssociateDeveloper', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole});
const {window} = dom;
const {document} = window;
window.HTMLElement.prototype.scrollIntoView = function() {};
window.HTMLDialogElement.prototype.showModal = function() { this.open = true; };
window.HTMLDialogElement.prototype.close = function() { this.open = false; };
const $ = selector => { const el = document.querySelector(selector); assert.ok(el, selector); return el; };
const change = (selector, value, type = 'change') => { const el = $(selector); el.value = value; el.dispatchEvent(new window.Event(type, {bubbles: true})); };
const click = selector => { const el = $(selector); if (typeof el.click === 'function') el.click(); else el.dispatchEvent(new window.MouseEvent('click', {bubbles: true, cancelable: true})); };
const text = selector => $(selector).textContent;
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
function card(key) {
  const link = document.querySelector(`a[data-service="${key}"]`);
  assert.ok(link, `Tile ${key}`); link.click();
  assert.ok($('#dva-service-dialog').open);
  assert.ok(text('#dva-card-title'));
  assert.ok($('#dva-card-body [data-dva-contract]'));
}
function closeCard() { $('#dva-service-dialog').close(); }
async function main() {
  // Exam comparisons stay readable without any JavaScript or lesson controls.
  assert.equal(document.querySelectorAll('.dva-crypto-patterns tbody tr').length, 4);
  assert.equal($('.dva-crypto-patterns').querySelectorAll('button, input, select').length, 0);
  assert.equal($('#cryptography-lab').querySelectorAll('[data-dva-exercise]').length, 2);
  for (const form of document.querySelectorAll('[data-exercise-controls]')) assert.equal(form.hidden,true);
  assert.equal(document.querySelectorAll('.dva-crypto-calls section').length, 2);
  assert.equal($('#s3-encryption-choices').querySelectorAll('tbody tr').length, 5);
  assert.ok(document.querySelector('.dva-reference-fallback details#dva-service-kms'));
  for (const file of ['dva-learning-core.js', 'dva-part3-core.js', 'dva-study.js', 'dva-learning.js', 'dva-followup.js']) window.eval(fs.readFileSync(path.join(directory, `assets/${file}`), 'utf8'));
  const data = JSON.parse($('#dva-study-data').textContent);
  // A reload restores each review independently; malformed saved entries are ignored.
  const reload = new JSDOM(html,{url:'https://example.test/study/examAssociateDeveloper',runScripts:'outside-only'});
  reload.window.HTMLElement.prototype.scrollIntoView=function() {};
  reload.window.HTMLDialogElement.prototype.showModal=function() {this.open=true;};
  reload.window.HTMLDialogElement.prototype.close=function() {this.open=false;};
  const allFollowup=JSON.parse($('#dva-followup-data').textContent);
  for(const [part,questions] of [['2',allFollowup.review],['3',allFollowup.review3]]) {
    reload.window.localStorage.setItem(`dva-followup-v${part}`,JSON.stringify({[questions[0].id]:questions[0].answer,[questions[1].id]:99}));
  }
  for(const file of ['dva-learning-core.js','dva-part3-core.js','dva-study.js','dva-learning.js','dva-followup.js']) reload.window.eval(fs.readFileSync(path.join(directory,`assets/${file}`),'utf8'));
  for(const part of ['2','3']) assert.match(reload.window.document.querySelector(`[data-review-part="${part}"] [data-review-progress]`).textContent,/^1\//);
  reload.window.close();

  click('[data-capacity-apply]');
  assert.equal($('[data-capacity="desired"]').value, '8');
  assert.equal($('[data-capacity="current"]').value, '3');
  click('[data-capacity-reconcile]'); assert.equal($('[data-capacity="current"]').value, '4');
  click('[data-capacity-reset]'); change('[data-capacity-basis]', 'step'); click('[data-capacity-apply]');
  assert.equal($('[data-capacity="desired"]').value, '6');
  change('[data-capacity="min"]', '11', 'input'); assert.match(text('[data-capacity-result]'), /whole instances/);
  click('[data-capacity-reset]');
  click('[data-transaction-run]'); assert.equal(text('[data-voucher-alice]'), 'Owns V-42');
  change('[data-transaction-mode]', 'batch'); assert.match(text('[data-transaction-code]'), /UnprocessedItems/);
  click('[data-transaction-run]'); assert.equal(text('[data-voucher-alice]'), 'No voucher'); assert.equal(text('[data-voucher-bob]'), 'No voucher');
  click('[data-transaction-fail]'); click('[data-transaction-run]'); assert.equal(text('[data-voucher-bob]'), 'Owns V-42');
  click('[data-transaction-reset]'); assert.equal(text('[data-voucher-alice]'), 'Owns V-42');

  // Existing interactions and every cloned reference remain wired.
  for (const [key] of Object.entries(data.cards)) card(key);
  closeCard();
  const within = (id, key) => `#dva-card-body [data-dva-exercise="${id}"] [data-field-input="${key}"]`;
  const output = id => `#dva-card-body [data-dva-exercise="${id}"] [data-exercise-output]`;
  const reset = async id => { click(`#dva-card-body [data-dva-exercise="${id}"] button[type="reset"]`); await tick(); };
  card('dynamodb');
  assert.match(text(output('dynamo')), /24 RCUs/);
  change(within('dynamo','consistency'), 'strong'); assert.match(text(output('dynamo')), /48 RCUs/);
  change(within('dynamo','size'), '4.01', 'input'); assert.match(text(output('dynamo')), /32 RCUs/);
  change(within('dynamo','size'), '', 'input'); assert.match(text(output('dynamo')), /input range/);
  await reset('dynamo'); assert.match(text(output('dynamo')), /24 RCUs/);
  closeCard(); card('edge');
  change(within('edge','health'), 'failed'); assert.match(text(output('edge')), /do not automatically/);
  change(within('edge','mode'), 'group'); assert.match(text(output('edge')), /backup origin/);
  change(within('edge','method'), 'POST'); assert.match(text(output('edge')), /does not support/);
  await reset('edge'); assert.match(text(output('edge')), /No custom edge code/);
  closeCard(); card('iam');
  change(within('policy','account'), 'cross'); assert.match(text(output('policy')), /both sides|identity-side Allow/);
  click(within('policy','resource')); assert.match(text(output('policy')), /Both account sides allow/);
  click(within('policy','identityDeny')); assert.match(text(output('policy')), /explicit Deny wins/);
  await reset('policy'); assert.match(text(output('policy')), /At least one/);
  closeCard(); card('cache');
  const action = name => click(`#dva-card-body [data-dva-exercise="redis"] [data-exercise-action="${name}"]`);
  action('fail'); assert.match(text(output('redis')), /No replica exists/);
  await reset('redis'); action('replica'); action('fail'); assert.match(text(output('redis')), /replica is promoted/);
  action('shard'); assert.equal(document.querySelectorAll('#dva-card-body .dva-redis-shard').length, 4);
  await reset('redis'); assert.equal(document.querySelectorAll('#dva-card-body .dva-redis-shard').length, 3);
  closeCard(); card('apigw');
  click(within('cache','header')); assert.match(text(output('cache')), /FAIL_WITH_403/);
  change(within('cache','unauthorised'), 'warn'); assert.match(text(output('cache')), /response warning/);
  click(within('cache','permission')); assert.match(text(output('cache')), /refreshes this cache entry/);
  await reset('cache'); assert.match(text(output('cache')), /Cache hit/);
  closeCard(); card('alb');
  change(within('alb','target'), 'ip'); change(within('alb','location'), 'other');
  assert.match(text(output('alb')), /other VPC/);
  click(within('alb','route')); assert.match(text(output('alb')), /Registration creates no routes/);
  change(within('alb','target'), 'lambda'); assert.match(text(output('alb')), /service API/);
  assert.equal($(within('alb','route')).closest('label').hidden, true);
  await reset('alb'); assert.equal($(within('alb','route')).closest('label').hidden, false);
  closeCard(); card('network');
  assert.match(text(output('firewall')), /without a matching outbound rule/);
  click(within('firewall','naclOut')); assert.match(text(output('firewall')), /blocks response destination port 54321/);
  change(within('firewall','leg'), 'back'); change(within('firewall','port'), '40000', 'input');
  assert.match(text(output('firewall')), /EC2:80 → ALB:40000/);
  await reset('firewall'); assert.match(text(output('firewall')), /Both directions work/);
  closeCard(); card('evidence');
  change(within('metrics','scenario'), 'memory'); assert.match(text(output('metrics')), /Agent/);
  change(within('metrics','scenario'), 'alb'); click(within('metrics','hasAlb'));
  assert.match(text(output('metrics')), /Do not invent an ALB metric/);
  await reset('metrics'); assert.match(text(output('metrics')), /CPUUtilization/);
  closeCard();
  // Part 3 exercises reuse the same controls and work after a reference clone.
  const run = (id,name) => click(`#dva-card-body [data-dva-exercise="${id}"] [data-exercise-action="${name}"]`);
  card('dynamodb');
  change(within('cache-choice','scenario'),'strong'); assert.match(text(output('cache-choice')),/Bypass the cache/);
  change(within('cache-choice','choice'),'direct'); assert.match(text(output('cache-choice')),/Good fit/);
  assert.match(text(output('gsi')),/200 WCUs/); change(within('gsi','indexWcu'),'200','input'); assert.match(text(output('gsi')),/arithmetic write budget fits/);
  run('cli','next'); assert.match(text(output('cli')),/u06/); // Initial cloned response token must be live.
  await reset('cli'); change(within('cli','dataset'),'s3'); assert.match(text(output('cli')),/100 output items/);
  run('cli','next'); assert.match(text(output('cli')),/100 output items/);
  run('cli','next'); assert.match(text(output('cli')),/50 output items/);
  change(within('cli','startToken'),'bad-token','input'); assert.match(text(output('cli')),/unchanged simulated NextToken/);
  await reset('cli'); assert.match(text(output('cli')),/5 output items/);
  closeCard(); card('apigw');
  click(within('invocation','resource')); assert.match(text(output('invocation')),/Hop 2 fails/);
  click(within('invocation','role')); assert.match(text(output('invocation')),/All three/);
  click(within('invocation','downstream')); assert.match(text(output('invocation')),/Hop 3 fails/);
  await reset('invocation');
  closeCard(); card('sqs');
  run('fifo','send'); run('fifo','retry'); assert.match(text(output('fifo')),/duplicate suppressed/);
  change(within('fifo','user'),'User-B'); change(within('fifo','id'),'purchase-002','input'); run('fifo','send'); run('fifo','receive');
  assert.equal(document.querySelectorAll('#dva-card-body [data-dva-exercise="fifo"] tbody tr').length,2);
  run('fifo','complete'); run('fifo','retry'); assert.match(text(output('fifo')),/duplicate suppressed/);
  run('fifo','advance'); run('fifo','retry'); assert.match(text(output('fifo')),/New message accepted/);
  await reset('fifo'); assert.match(text(output('fifo')),/Queue empty/);
  closeCard(); card('edge');
  run('cache-key','request'); change(within('cache-key','lang'),'jp'); run('cache-key','request'); assert.match(text(output('cache-key')),/Wrong language/);
  click(within('cache-key','include')); run('cache-key','request'); assert.match(text(output('cache-key')),/matches the requested language/);
  await reset('cache-key'); assert.match(text(output('cache-key')),/No requests yet/);
  closeCard(); card('cache');
  run('cache-strategy','read'); run('cache-strategy','write'); run('cache-strategy','read'); assert.match(text(output('cache-strategy')),/STALE/);
  run('cache-strategy','expire'); run('cache-strategy','read'); assert.match(text(output('cache-strategy')),/Cache miss/);
  change(within('cache-strategy','strategy'),'through'); run('cache-strategy','read'); click(within('cache-strategy','fail'));run('cache-strategy','write');
  assert.match(text(output('cache-strategy')),/cache update FAILED/); await reset('cache-strategy');
  closeCard(); card('ec2'); change(within('cutover','strategy'),'stop'); assert.match(text(output('cutover')),/unavailable/); await reset('cutover');
  closeCard(); card('kinesis'); assert.match(text(output('kcl')),/10 idle workers/);
  change(within('kcl','workers'),'2','input'); assert.match(text(output('kcl')),/S1, S3, S5/); await reset('kcl');
  closeCard(); card('network'); change(within('endpoint','service'),'kms'); assert.match(text(output('endpoint')),/not KMS/);
  change(within('endpoint','kind'),'interface'); assert.match(text(output('endpoint')),/appropriate private service entry/);
  click(within('endpoint','sg')); assert.match(text(output('endpoint')),/blocks TCP 443/);await reset('endpoint');
  closeCard(); card('iam'); click(within('s3-access','removed'));click(within('s3-access','oldValid')); assert.match(text(output('s3-access')),/No usable role credentials/);
  click(within('s3-access','bucketGet')); assert.match(text(output('s3-access')),/GetObject · allowed/);await reset('s3-access');
  closeCard(); card('evidence'); run('trace','annotation');run('trace','metadata');run('trace','search'); assert.match(text(output('trace')),/matched 1 trace/);
  change(within('trace','search'),'metadata');run('trace','search');assert.match(text(output('trace')),/not indexed/);
  change(within('trace','sampling'),'0','input');run('trace','generate');assert.match(text(output('trace')),/0\/20/);await reset('trace');
  closeCard();
  change('#kms-key-caching [data-field-input="reuse"]','1','input');assert.match(text('#kms-key-caching [data-exercise-output]'),/1000 GenerateDataKey calls/);
  click('#kms-key-caching button[type="reset"]');await tick();assert.match(text('#kms-key-caching [data-exercise-output]'),/10 GenerateDataKey calls/);
  change('#s3-key-flow [data-field-input="mode"]','customer');assert.match(text('#s3-key-flow [data-exercise-output]'),/KMS is not inherently/);
  // A direct link opens enclosing details too, keeping the inline comparison reachable.
  window.location.hash='#s3-key-flow';await tick();assert.ok($('#s3-encryption-choices').open);assert.ok($('#s3-key-flow').open);
  card('kms'); click('#dva-card-body a[href="#cryptography"]');
  assert.equal($('#dva-service-dialog').open, false); await tick();
  card('s3'); click('#dva-card-body a[href="#s3-encryption-choices"]'); await tick();
  assert.ok($('#s3-encryption-choices').open); assert.equal($('#dva-service-dialog').open, false);
  card('kinesis');
  for (const shards of ['1', '2', '4']) for (const keys of ['spread', 'hot']) {
    change('#dva-card-body [data-shards-count]', shards);
    change('#dva-card-body [data-shards-keys]', keys);
    assert.equal(document.querySelectorAll('#dva-card-body .dva-shard-lane').length, Number(shards));
  }
  change('#dva-card-body [data-shards-read-mode]', 'shared'); assert.match(text('#dva-card-body [data-shards-reads]'), /Read contention/);
  change('#dva-card-body [data-shards-read-mode]', 'efo'); assert.match(text('#dva-card-body [data-shards-reads]'), /fits independently/);
  change('#dva-card-body [data-shards-read-rate]', '2.5'); assert.match(text('#dva-card-body [data-shards-reads]'), /exceeds its individual/);
  change('#dva-card-body [data-shards-unit]', 'mib'); change('#dva-card-body [data-shards-count]', '10');
  change('#dva-card-body [data-shards-mib]', '5', 'input'); change('#dva-card-body [data-shards-keys]', 'skew');
  assert.match(text('#dva-card-body [data-shards-aggregate]'), /50%/);
  assert.equal(document.querySelectorAll('#dva-card-body [data-overloaded="true"]').length, 1);
  change('#dva-card-body [data-shards-keys]', 'spread');
  assert.equal(document.querySelectorAll('#dva-card-body [data-overloaded="true"]').length, 0);
  closeCard(); card('apigw');
  for (const stage of ['prod', 'beta']) {
    click(`#dva-card-body [data-apigw-stage="${stage}"]`);
    for (const scenario of Array.from($('#dva-card-body [data-apigw-case]').options, el => el.value)) {
      change('#dva-card-body [data-apigw-case]', scenario);
      assert.ok(text('#dva-card-body [data-apigw-result]'));
    }
  }
  closeCard(); card('asg');
  click('#dva-card-body [data-cross-zone="disabled"]'); assert.match(text('#dva-card-body [data-balancing-result]'), /25%/);
  click('#dva-card-body [data-cross-zone="enabled"]'); assert.match(text('#dva-card-body [data-balancing-result]'), /10%/);
  closeCard();
  for (const node of data.architecture.nodes) {
    click(`[data-dva-node="${node.id}"]`); assert.equal($('#dva-concept-panel').dataset.node, node.id);
  }
  for (const strategy of data.deployments) {
    click(`[data-dva-deployment="${strategy.id}"]`); assert.ok(text('#dva-deployment-result').includes(strategy.name));
  }
  change('#dva-workers', '0', 'input'); assert.match(text('#dva-queue-result'), /scale-from-zero/);
  for (const identity of data.identity) {
    click(`[data-dva-identity="${identity.id}"]`); click('#dva-trust');
    assert.equal(text('#dva-identity-result'), identity.failureTrust);
    click('#dva-trust'); click('#dva-permission'); assert.equal(text('#dva-identity-result'), identity.failurePermission);
  }
  let answers = 0;
  for (const question of data.practice) {
    change('#dva-question', question.id);
    for (const radio of document.querySelectorAll('#dva-question-content input')) { radio.click(); answers++; }
    assert.ok(text('#dva-question-content').includes(question.why));
  }
  const followup = JSON.parse($('#dva-followup-data').textContent);
  let followupAnswers = 0;
  for (const question of followup.review) {
    change('[data-review-select]', question.id);
    for (let i = 0; i < question.options.length; i++) {
      click(`[data-review-body] input[value="${i}"]`); followupAnswers++;
      assert.ok(text('[data-review-body]').includes(question.options[i].why));
      assert.equal(document.activeElement.value, String(i));
    }
  }
  assert.match(text('[data-review-progress]'), /18\/18 answered/);
  assert.equal(Object.keys(JSON.parse(window.localStorage.getItem('dva-followup-v2'))).length, 18);
  click('[data-review-retry]'); assert.match(text('[data-review-progress]'), /17\/18 answered/);
  click('[data-review-reset]'); assert.match(text('[data-review-progress]'), /0\/18 answered/);
  assert.equal(document.querySelectorAll('#dva-followup-review [data-review-fallback] details').length, 18);
  // Part 3 review progress is isolated from Part 2 and survives reinitialisation.
  const r3='#dva-followup-review-3';
  for (const question of followup.review3) {
    change(`${r3} [data-review-select]`,question.id);
    for (let i=0;i<question.options.length;i++) {
      click(`${r3} [data-review-body] input[value="${i}"]`);followupAnswers++;
      assert.ok(text(`${r3} [data-review-body]`).includes(question.options[i].why));
    }
  }
  assert.match(text(`${r3} [data-review-progress]`),/25\/25 answered/);
  assert.match(text('#dva-followup-review [data-review-progress]'),/0\/18 answered/);
  assert.equal(Object.keys(JSON.parse(window.localStorage.getItem('dva-followup-v3'))).length,25);
  click(`${r3} [data-review-retry]`);assert.match(text(`${r3} [data-review-progress]`),/24\/25 answered/);
  click(`${r3} [data-review-reset]`);assert.match(text(`${r3} [data-review-progress]`),/0\/25 answered/);
  assert.equal(document.querySelectorAll(`${r3} [data-review-fallback] details`).length,25);
  // All static links/anchors and locally served assets must resolve without scripts.
  const ids = Array.from(document.querySelectorAll('[id]'), el => el.id);
  assert.equal(new Set(ids).size, ids.length, 'Unique page IDs');
  for (const link of document.querySelectorAll('a[href^="#"]')) {
    const id = decodeURIComponent(link.getAttribute('href').slice(1));
    if (id) assert.ok(document.getElementById(id), `Broken anchor #${id}`);
  }
  assert.equal(errors.length, 0, errors.map(e => e.message).join('\n'));
  console.log(`DOM checks passed: static crypto comparisons, Part 1–3 exercises/resets, ${Object.keys(data.cards).length} cards, hot-shard routing, API stages, ${data.architecture.nodes.length} theory nodes, ${answers + followupAnswers} practice answers, local progress and page anchors. No-JS explanations intact.`);
  window.close();
}
main().catch(error => { console.error(error); window.close(); process.exitCode = 1; });
