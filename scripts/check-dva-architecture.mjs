// No dependencies: node scripts/check-dva-architecture.mjs
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = name => JSON.parse(readFileSync(path.join(root, name), 'utf8'));
const data = read('_data/dva_architecture.json');
const cards = read('_data/dva_study.json').cards;
const unique = (items, name) => {
  const ids = new Set(items.map(item => item.id));
  assert.equal(ids.size, items.length, `Duplicate ${name} id`);
  return new Map(items.map(item => [item.id, item]));
};
const nodes = unique(data.nodes, 'node');
const groups = unique(data.groups, 'boundary');
const edges = unique(data.relationships, 'relationship');
unique(data.scenarios, 'scenario');
unique(data.comparisons, 'comparison');
const within = (item, boundary) => item.x >= boundary.x && item.y >= boundary.y && item.x + item.w <= boundary.x + boundary.w && item.y + item.h <= boundary.y + boundary.h;
const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const ancestors = groupId => {
  const result = [];
  for (let group = groups.get(groupId); group; group = groups.get(group.parent)) {
    assert(!result.includes(group.id), `Boundary cycle: ${group.id}`);
    result.push(group.id);
  }
  return result;
};
for (const group of data.groups) {
  if (!group.parent) continue;
  assert(groups.has(group.parent), `Missing parent: ${group.id}`);
  assert(within(group, groups.get(group.parent)), `Boundary outside parent: ${group.id}`);
  ancestors(group.id);
}
for (const node of data.nodes) {
  for (const field of ['description', 'scope', 'placement', 'networkRequirements', 'flow', 'retention', 'trap', 'url']) assert(node[field]?.trim(), `${node.id}: missing ${field}`);
  assert(data.categories[node.category], `Unknown category: ${node.id}`);
  assert(node.group === 'external' || groups.has(node.group), `Unknown boundary: ${node.id}`);
  if (groups.has(node.group)) assert(within(node, groups.get(node.group)), `Node outside boundary: ${node.id}`);
  if (node.card) assert(cards[node.card], `Missing service card: ${node.id}`);
  if (node.icon) assert(existsSync(path.join(root, `study/assets/aws-architecture-icons/Arch_${node.icon}_64.svg`)), `Missing icon: ${node.id}`);
}
for (let i = 0; i < data.nodes.length; i++) for (const other of data.nodes.slice(i + 1)) assert(!overlaps(data.nodes[i], other), `Overlapping nodes: ${data.nodes[i].id}/${other.id}`);
const types = new Set(['network', 'api', 'event', 'replication', 'attachment', 'authorization', 'deployment', 'monitoring']);
const activities = new Set(['request', 'response', 'event', 'replication', 'telemetry', 'control', 'association', 'check', 'internal']);
for (const edge of data.relationships) {
  assert(nodes.has(edge.source) && nodes.has(edge.target), `Missing connector endpoint: ${edge.id}`);
  assert(types.has(edge.type), `Unknown connector meaning: ${edge.id}`);
  assert(edge.label && edge.description, `Unexplained connector: ${edge.id}`);
  assert(activities.has(edge.activity), `Missing interaction semantics: ${edge.id}`);
  assert(['control', 'data', 'evidence', 'configuration'].includes(edge.plane), `Missing plane: ${edge.id}`);
  if (['association', 'check', 'internal'].includes(edge.activity)) assert.equal(edge.packet, null, `Fictitious packet through ${edge.id}`);
  else assert(typeof edge.packet === 'string' && edge.packet.length <= 7, `Missing/oversized transfer label: ${edge.id}`);
}
for (const scenario of data.scenarios) {
  assert(scenario.steps.length && scenario.note && scenario.exam, `Incomplete scenario: ${scenario.id}`);
  assert(['flow', 'comparison'].includes(scenario.mode), `Unspecified scenario meaning: ${scenario.id}`);
  for (const step of scenario.steps) {
    assert(Boolean(step.edge) !== Boolean(step.node), `Step needs one connection or local operation: ${scenario.id}`);
    assert((step.edge ? edges.has(step.edge) : nodes.has(step.node)) && step.text && step.phase, `Invalid step: ${scenario.id}`);
  }
  for (const id of Object.keys(scenario.actors)) assert(nodes.has(id), `Unknown actor: ${id}`);
}
// Semantic regressions: check the ownership and ordering that the diagrams teach.
const steps = id => data.scenarios.find(s => s.id === id).steps.map(s => s.edge || s.node);
assert(steps('web').indexOf('dns-reply') < steps('web').indexOf('viewer'));
assert(!steps('web').includes('target-a'), 'One illustrated request must not visit two alternative EC2 targets');
assert(!steps('stages').includes('invoke'), 'Alias invocation must not also invoke the unqualified function');
assert.equal(edges.get('selected-version').packet, null);
assert.equal(edges.get('assume').source, 'ec2-a');
assert.equal(edges.get('instance-creds').target, 'ec2-a');
assert(steps('assume-role').indexOf('instance-creds') < steps('assume-role').indexOf('instance-bucket'));
assert.equal(edges.get('external-trust').target, 'client', 'OIDC token must first reach its caller');
assert.equal(edges.get('web-identity').source, 'client');
assert.equal(edges.get('temporary-creds').target, 'client');
assert(steps('cross-account').indexOf('temporary-creds') < steps('cross-account').indexOf('federated-bucket'));
assert(ancestors(nodes.get('bucket-b').group).includes('account-b-data'));
for (const id of ['queue', 'events', 'dlq']) assert(steps(id).indexOf('queue-batch') < steps(id).indexOf('process'), `Missing receive response in ${id}`);
assert(steps('queue').indexOf('worker-result') < steps('queue').indexOf('delete-message'));
assert(!steps('pipeline').includes('build-image') && !steps('pipeline').includes('rollout'), 'Do not mix EC2 deployment, ECR images and Lambda aliases');
assert(steps('pipeline').indexOf('agent-poll') < steps('pipeline').indexOf('agent-task'));
assert(steps('pipeline').indexOf('revision-get') < steps('pipeline').indexOf('revision-bundle'));
for (const id of ['storage', 'beanstalk', 'iac', 'observe']) assert.equal(data.scenarios.find(s => s.id === id).mode, 'comparison');
const theory = read('_data/dva_study.json').architecture;
assert.equal(theory.edges.find(e => e.id === 'state-response').from, 'compute', 'Application code constructs the client response');
assert.equal(theory.edges.find(e => e.id === 'compute-state').bidirectional, true);
for (const comparison of data.comparisons) {
  assert(comparison.rule && comparison.exception, `Missing comparison boundary: ${comparison.id}`);
  for (const id of [...comparison.left, ...comparison.right]) assert(nodes.has(id), `Missing comparison node: ${id}`);
}
for (const question of data.study) for (const id of question.nodes) assert(nodes.has(id), `Missing study node: ${id}`);
for (const id of ['s3', 'ddb', 'lambda', 'kinesis', 'apigw', 'efs']) assert(!ancestors(nodes.get(id).group).includes('vpc'), `${id} must not be inside the customer VPC`);
for (const id of ['sam', 'cdk']) assert(!ancestors(nodes.get(id).group).includes('cloud'), `${id} represents local authoring tooling in this model`);
for (const suffix of ['a', 'b']) assert(ancestors(nodes.get(`ebs-${suffix}`).group).find(id => id.startsWith('az')) === ancestors(nodes.get(`ec2-${suffix}`).group).find(id => id.startsWith('az')), `Cross-AZ EBS attachment: ${suffix}`);
console.log(`Architecture model valid: ${nodes.size} resources, ${edges.size} relationships, ${data.scenarios.length} scenarios, ${data.comparisons.length} comparisons.`);
