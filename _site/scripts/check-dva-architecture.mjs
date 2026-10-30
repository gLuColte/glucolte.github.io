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
for (const edge of data.relationships) {
  assert(nodes.has(edge.source) && nodes.has(edge.target), `Missing connector endpoint: ${edge.id}`);
  assert(types.has(edge.type), `Unknown connector meaning: ${edge.id}`);
  assert(edge.label && edge.description, `Unexplained connector: ${edge.id}`);
}
for (const scenario of data.scenarios) {
  assert(scenario.steps.length && scenario.note && scenario.exam, `Incomplete scenario: ${scenario.id}`);
  for (const step of scenario.steps) assert(edges.has(step.edge) && step.text, `Invalid step: ${scenario.id}`);
}
for (const comparison of data.comparisons) {
  assert(comparison.rule && comparison.exception, `Missing comparison boundary: ${comparison.id}`);
  for (const id of [...comparison.left, ...comparison.right]) assert(nodes.has(id), `Missing comparison node: ${id}`);
}
for (const question of data.study) for (const id of question.nodes) assert(nodes.has(id), `Missing study node: ${id}`);
for (const id of ['s3', 'ddb', 'lambda', 'kinesis', 'apigw', 'efs']) assert(!ancestors(nodes.get(id).group).includes('vpc'), `${id} must not be inside the customer VPC`);
for (const id of ['sam', 'cdk']) assert(!ancestors(nodes.get(id).group).includes('cloud'), `${id} represents local authoring tooling in this model`);
for (const suffix of ['a', 'b']) assert(ancestors(nodes.get(`ebs-${suffix}`).group).find(id => id.startsWith('az')) === ancestors(nodes.get(`ec2-${suffix}`).group).find(id => id.startsWith('az')), `Cross-AZ EBS attachment: ${suffix}`);
console.log(`Architecture model valid: ${nodes.size} resources, ${edges.size} relationships, ${data.scenarios.length} scenarios, ${data.comparisons.length} comparisons.`);
