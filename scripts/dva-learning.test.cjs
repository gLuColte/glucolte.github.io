// Run: node --test scripts/dva-learning.test.cjs
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const core = require('../assets/dva-learning-core.js');
test('ASG: desired edit 5+3=8 while current stays 3; step warm-up differs', () => {
  const input = {min: 2, max: 10, desired: 5, current: 3, adjustment: 3};
  assert.equal(core.capacity(input).target, 8); assert.equal(input.current, 3);
  assert.equal(core.capacity({...input, basis: 'step'}).target, 6);
  assert.equal(core.capacity({...input, max: 6}).target, 6);
  assert.equal(core.capacity({...input, adjustment: -10}).target, 2);
  assert.equal(core.capacity({...input, adjustment: -1, basis: 'step'}).blocked, true);
  assert.throws(() => core.capacity({...input, desired: 11}), /whole instances/);
  assert.throws(() => core.capacity({...input, current: NaN}), /whole instances/);
});
test('Voucher: failure cannot partially commit a transaction; batch can partially succeed', () => {
  assert.deepEqual([core.voucher('transaction', true).alice, core.voucher('transaction', true).bob], [1, 0]);
  assert.deepEqual([core.voucher('batch', true).alice, core.voucher('batch', true).bob], [0, 0]);
  for (const mode of ['transaction', 'batch']) {
    const s = core.voucher(mode, false); assert.deepEqual([s.alice, s.bob], [0, 1]);
  }
});
test('Service references: learning tables, labs, icons and internal service keys resolve', () => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../_data/dva_study.json')));
  const source = fs.readFileSync(path.join(__dirname, '../study/examAssociateDeveloper.md'), 'utf8');
  const labs = new Set(['#asg-capacity-lab', '#transaction-lab', '#cryptography', '#s3-encryption-choices']);
  for (const [key, card] of Object.entries(data.cards)) {
    assert.ok(fs.existsSync(path.join(__dirname, `../study/assets/aws-architecture-icons/Arch_${card.icon}_64.svg`)), key);
    if (card.lab) assert.ok(labs.has(card.lab.href), key);
    for (const item of card.learning || []) {
      assert.ok(item.title && Array.isArray(item.paragraphs), key);
      if (item.table) for (const row of item.table.rows) assert.equal(row.length, item.table.headers.length, key);
    }
  }
  for (const zone of data.zones) for (const cluster of zone.clusters) for (const key of cluster.keys) assert.ok(data.cards[key], key);
  assert.match(source, /include dva-cryptography-lab/);
  assert.match(source, /include dva-capacity-lab/);
  assert.match(source, /include dva-transaction-lab/);
});
test('DynamoDB rounds item size before rate/consistency; zero demand differs from provisioned minimum', () => {
  const input = {size: 12, reads: 16, writes: 1, consistency: 'eventual', transactional: false};
  assert.equal(core.dynamoCapacity(input).rcu, 24);
  assert.equal(core.dynamoCapacity({...input, consistency: 'strong'}).rcu, 48);
  assert.equal(core.dynamoCapacity({...input, consistency: 'transaction'}).rcu, 96);
  const rounded = core.dynamoCapacity({...input, size: 4.01, reads: 1, transactional: true});
  assert.equal(rounded.readUnits, 2); assert.equal(rounded.wcu, 10);
  const idle = core.dynamoCapacity({...input, reads: 0, writes: 0});
  assert.equal(idle.rcu, 0); assert.equal(idle.wcu, 0); assert.equal(idle.provisionedRead, 1);
  assert.throws(() => core.dynamoCapacity({...input, size: 401}));
  assert.throws(() => core.dynamoCapacity({...input, reads: -1}));
});
test('Kinesis has independent shard budgets, even with low aggregate utilisation', () => {
  assert.equal(core.shards({count: 10, mib: 5, distribution: 'spread'}).overloaded, false);
  const skew = core.shards({count: 10, mib: 5, distribution: 'skew'});
  assert.equal(skew.aggregate, 0.5); assert.equal(skew.loads[0], 4); assert.equal(skew.overloaded, true);
  assert.ok(Math.abs(skew.loads.reduce((a, b) => a + b, 0) - 5) < 1e-10);
  assert.equal(core.shards({count: 10, mib: 5, distribution: 'hot'}).loads.filter(n => n > 0).length, 1);
  assert.throws(() => core.shards({count: 0, mib: 1, distribution: 'spread'}));
});
test('IAM: all allow/deny combinations, same/cross account, both SQS actions', () => {
  for (let mask = 0; mask < 16; mask++) for (const account of ['same', 'cross']) for (const action of ['sqs:SendMessage', 'sqs:ReceiveMessage']) {
    const [identity, resource, identityDeny, resourceDeny] = [0,1,2,3].map(n => Boolean(mask & (1 << n)));
    const allowed = !identityDeny && !resourceDeny && (account === 'same' ? identity || resource : identity && resource);
    assert.equal(Boolean(core.policy({account, action, identity, resource, identityDeny, resourceDeny}).blocked), !allowed);
  }
});
test('CloudFront retries only eligible methods in a configured origin group', () => {
  const input = {path: '/images/logo.png', health: 'failed', mode: 'group', method: 'GET'};
  for (const method of ['GET','HEAD','OPTIONS']) assert.match(core.edge({...input, method}).steps.at(-1), /backup/);
  assert.equal(core.edge({...input, method: 'POST'}).blocked, true);
  assert.equal(core.edge({...input, mode: 'multiple'}).blocked, true);
  assert.match(core.edge({...input, health: 'healthy', path: '/api/orders'}).steps.at(-1), /ALB/);
});
test('REST cache invalidation: permission, rejection/ignore policies and TTL are independent', () => {
  const input = {enabled: true, entry: 'fresh', header: true, permission: false, unauthorised: 'reject'};
  assert.equal(core.apiCache(input).blocked, true);
  for (const unauthorised of ['warn','ignore']) assert.ok(core.apiCache({...input, unauthorised}).steps.includes('Cache hit'));
  assert.ok(core.apiCache({...input, permission: true}).steps.includes('Backend · fresh response'));
  assert.ok(core.apiCache({...input, header: false, entry: 'stale'}).steps.includes('Backend · fresh response'));
  assert.ok(core.apiCache({...input, enabled: false}).steps.includes('Backend integration'));
});
test('SG return state does not bypass a stateless NACL', () => {
  for (let mask = 0; mask < 16; mask++) {
    const [sgIn, sgOut, naclIn, naclOut] = [0,1,2,3].map(n => Boolean(mask & (1 << n)));
    const result = core.firewall({leg: 'front', protocol: 'http', port: 54321, sgIn, sgOut, naclIn, naclOut});
    assert.equal(result.blocked, !(sgIn && naclIn && naclOut));
    assert.match(result.steps[2], /ALB:80 → Browser:54321/);
  }
  assert.match(core.firewall({leg:'back', protocol:'https', port:40000, sgIn:true, sgOut:false, naclIn:true, naclOut:true}).steps[2], /EC2:443 → ALB:40000/);
});
test('ALB public frontend and private target; Lambda is not modelled as a TCP target', () => {
  const input = {scheme: 'internet', client: 'public', target: 'ip', location: 'other', route: true, sg: true};
  assert.ok(!core.alb(input).blocked);
  assert.equal(core.alb({...input, route: false}).blocked, true);
  assert.equal(core.alb({...input, scheme: 'internal'}).blocked, true);
  assert.ok(!core.alb({...input, target: 'lambda', route: false, sg: false}).blocked);
});
test('Redis replicas cannot add write partitions; failover needs a replica and permission to promote', () => {
  const initial = core.redisInitial();
  assert.equal(initial.shards.length, 3);
  assert.ok(core.redisStep(initial, 'fail').shards.some(s => s.down));
  const copies = core.redisStep(initial, 'replica');
  assert.equal(copies.shards.length, 3); assert.ok(copies.shards.every(s => s.replicas === 1));
  assert.ok(core.redisStep(copies, 'fail', {failover: false}).shards.some(s => s.down));
  assert.ok(core.redisStep(copies, 'fail', {failover: true}).shards.every(s => !s.down));
  assert.equal(core.redisStep(copies, 'shard').shards.length, 4);
  assert.ok(initial.shards.every(s => s.replicas === 0)); // No mutation of prior state.
});
test('Metric selection cannot invent an ALB or guest metrics from detailed monitoring', () => {
  assert.equal(core.metric({scenario:'alb', hasAlb:false}).blocked, true);
  assert.match(core.metric({scenario:'memory'}).steps[0], /Agent/);
  assert.match(core.metric({scenario:'frequency'}).summary, /does not add memory/);
});
test('Follow-up content: every exercise/review links to a real card and has useful feedback', () => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../_data/dva_study.json')));
  const followup = JSON.parse(fs.readFileSync(path.join(__dirname, '../_data/dva_followup.json')));
  const used = new Set();
  for (const card of Object.values(data.cards)) for (const id of card.exercises || []) {
    assert.ok(followup.exercises[id], id); used.add(id);
  }
  for (const id of ['kms-cache','s3-key']) { assert.ok(followup.exercises[id]); used.add(id); }
  assert.equal(used.size, Object.keys(followup.exercises).length);
  assert.equal(followup.review.length, 18);
  assert.equal(new Set(followup.review.map(q => q.id)).size, followup.review.length);
  assert.ok(followup.review3.length>=20 && followup.review3.length<=25);
  assert.equal(new Set(followup.review3.map(q=>q.id)).size,followup.review3.length);
  for (const q of [...followup.review,...followup.review3]) {
    assert.ok(data.cards[q.card]); assert.ok(q.analogy);
    assert.ok(Number.isInteger(q.answer) && q.options[q.answer]);
    assert.ok(q.options.every(option => option.text && option.why));
  }
});
