/* Shared learning models. No AWS calls, credentials or external dependencies. */
(() => {
  'use strict';
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  function capacity({min, max, desired, current, adjustment, basis = 'desired'}) {
    const values = [min, max, desired, current, adjustment];
    if (!values.every(Number.isSafeInteger) || min < 0 || max < min || max > 50 || desired < min || desired > max || current < 0 || current > 50) {
      throw new Error('Use whole instances: 0 ≤ min ≤ desired ≤ max ≤ 50; current 0–50.');
    }
    // A deliberately bounded model of a desired-target edit OR a step scale-out
    // with current=ready and desired including warming instances. No AWS policy engine.
    const blocked = basis === 'step' && adjustment < 0 && current < desired;
    const requested = (basis === 'step' ? current : desired) + adjustment;
    const target = blocked ? desired : basis === 'step' && adjustment > 0
      ? Math.max(desired, clamp(requested, min, max)) : clamp(requested, min, max);
    return {target, requested, limited: requested < min || requested > max, blocked, pending: Math.max(0, target - current), removing: Math.max(0, current - target)};
  }
  function voucher(mode, failSecond) {
    // Delete Alice's voucher + Put Bob's voucher. BatchWriteItem cannot Update.
    const atomic = mode === 'transaction';
    return {
      alice: atomic && failSecond ? 1 : 0,
      bob: failSecond ? 0 : 1,
      outcome: failSecond ? atomic ? 'Cancelled: neither write committed.' : 'Partial success: delete committed; put is unprocessed.' : 'Both writes committed.',
      trace: atomic ? ['Validate both operations', failSecond ? 'Second operation fails → cancel the bundle' : 'Commit both operations atomically']
        : ['Delete Alice’s item succeeds', failSecond ? 'Bob’s put is unprocessed → retry that operation' : 'Put Bob’s item succeeds']
    };
  }
  function dynamoCapacity({size, reads, writes, consistency, transactional}) {
    if (![size, reads, writes].every(Number.isFinite) || size <= 0 || size > 400 || reads < 0 || writes < 0 || reads > 1000000 || writes > 1000000) throw new Error('Use an item size above 0 and at most 400 KB, and rates from 0 to 1,000,000/s.');
    const readUnits = Math.ceil(size / 4), writeUnits = Math.ceil(size);
    const factor = {strong: 1, eventual: 0.5, transaction: 2}[consistency];
    if (!factor) throw new Error('Choose a read consistency.');
    const perRead = readUnits * factor, perWrite = writeUnits * (transactional ? 2 : 1);
    return {readUnits, writeUnits, perRead, perWrite, rcu: perRead * reads, wcu: perWrite * writes,
      provisionedRead: Math.max(1, Math.ceil(perRead * reads)), provisionedWrite: Math.max(1, Math.ceil(perWrite * writes))};
  }
  function shards({count, mib, distribution}) {
    if (!Number.isInteger(count) || count < 1 || count > 10 || !Number.isFinite(mib) || mib < 0 || mib > 100) throw new Error('Use 1–10 shards and 0–100 MiB/s.');
    const loads = Array.from({length: count}, (_, i) => count === 1 ? mib : distribution === 'hot' ? (i === 0 ? mib : 0) : distribution === 'skew' ? (i === 0 ? mib * 0.8 : mib * 0.2 / (count - 1)) : mib / count);
    return {loads, overloaded: loads.some(n => n > 1), aggregate: mib / count, required: Math.ceil(mib)};
  }
  function edge({path, health, mode, method}) {
    const origin = path.startsWith('/images/') ? 'S3 image origin' : 'ALB API origin';
    const steps = [`Viewer · ${method} ${path}`, 'CloudFront PoP · cache miss', origin];
    if (health === 'healthy') return {steps, summary: 'Path behaviour selects the origin. No custom edge code is needed for ordinary dynamic delivery.'};
    if (mode === 'group' && ['GET', 'HEAD', 'OPTIONS'].includes(method)) return {steps: [...steps, 'Matching backup origin'], summary: 'Primary returns a configured 503 failure → retry against its secondary. Both origins must serve the same requested content.'};
    return {steps, blocked: true, summary: mode === 'group' ? `${method} does not support native origin-group failover. Return the primary error.` : 'Multiple origins route different paths; they do not automatically provide a failover pair.'};
  }
  function policy({account, action, identity, resource, identityDeny, resourceDeny}) {
    const denied = identityDeny || resourceDeny;
    const allowed = !denied && (account === 'cross' ? identity && resource : identity || resource);
    return {steps: ['IAM principal', `Identity policy · ${identity ? 'Allow' : 'no Allow'}`, `SQS policy · ${resource ? 'Allow' : 'no Allow'}`, `${action} · ${allowed ? 'allowed' : 'denied'}`], blocked: !allowed,
      summary: denied ? 'An applicable explicit Deny wins over every Allow shown.' : allowed ? `${account === 'cross' ? 'Both account sides allow' : 'At least one applicable policy allows'} this action in this simplified model.` : account === 'cross' ? 'Cross-account IAM access needs an identity-side Allow and a queue-side Allow.' : 'No applicable Allow → implicit deny.'};
  }
  function apiCache({enabled, entry, header, permission, unauthorised}) {
    const steps = ['GET /prod/GetOrder?id=42', 'REST API stage'];
    if (!enabled) return {steps: [...steps, 'Backend integration'], summary: 'Caching disabled: every successful request goes to the integration.'};
    if (header && !permission && unauthorised === 'reject') return {steps: [...steps, '403 · invalidation denied'], blocked: true, summary: 'This method requires cache-invalidation authorisation; FAIL_WITH_403 rejects an unauthorised max-age=0 request.'};
    const refresh = header && permission;
    const fetch = refresh || entry === 'stale';
    return {steps: [...steps, fetch ? 'Backend · fresh response' : 'Cache hit', ...(fetch ? ['Update cache entry'] : [])], summary: `${header && !permission ? `Invalidation header ignored${unauthorised === 'warn' ? ' with a response warning' : ' without a warning'}; ` : ''}${refresh ? 'Authorised max-age=0 refreshes this cache entry.' : fetch ? 'Expired/missing entry: fetch and cache a fresh response.' : 'Unexpired entry: serve the cached response. It can still be stale relative to the backend.'}`};
  }
  function alb({scheme, client, target, location, route, sg}) {
    const steps = ['Client', `${scheme === 'internet' ? 'Internet-facing' : 'Internal'} ALB DNS`, 'HTTPS listener :443', 'Rule → target group'];
    if (scheme === 'internal' && client === 'public') return {steps, blocked: true, summary: 'An internet-only client cannot reach an internal ALB without private connectivity.', inactive: target === 'lambda' ? ['location','route','sg'] : target === 'instance' ? ['location'] : []};
    if (target === 'lambda') return {steps: [...steps, 'Lambda invocation'], summary: 'ALB invokes Lambda through the service API, with function resource-policy permission. No target TCP route or target SG is modelled here.', inactive: ['location','route','sg']};
    if (!route || !sg) return {steps: [...steps, target === 'instance' ? 'EC2 primary private IP' : 'Registered private IP'], blocked: true, summary: !route ? 'Registration creates no routes. The forward and return paths must exist.' : 'Target security group blocks the application port. Check NACLs and target health too.', inactive: target === 'instance' ? ['location'] : []};
    return {steps: [...steps, target === 'instance' ? 'EC2 primary private IP' : location === 'other' ? 'Reachable private IP · other VPC' : 'Registered private IP · same VPC'], summary: 'Request reaches the healthy target. Public frontend access does not require a public backend IP. DNS, listener permissions, NACLs and health are assumed valid.', inactive: target === 'instance' ? ['location'] : []};
  }
  function firewall({leg, protocol, port, sgIn, sgOut, naclIn, naclOut}) {
    if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Choose an illustrative ephemeral port from 1024–65535.');
    const service = protocol === 'https' ? 443 : 80;
    const from = leg === 'front' ? 'Browser' : 'ALB';
    const to = leg === 'front' ? 'ALB' : 'EC2';
    const request = sgIn && naclIn, response = request && naclOut;
    return {steps: [`${from}:${port} → ${to}:${service}`, `Request · ${request ? 'allowed' : 'blocked'}`, `${to}:${service} → ${from}:${port}`, `Response · ${response ? 'allowed' : request ? 'blocked' : 'not sent'}`], blocked: !response,
      summary: !sgIn ? 'Target SG blocks the new connection.' : !naclIn ? `Target-subnet inbound NACL must allow destination port ${service}.` : !naclOut ? `Request arrived, but target-subnet outbound NACL blocks response destination port ${port}.` : `Both directions work. The stateful SG permits the response even ${sgOut ? 'with' : 'without'} a matching outbound rule. Initiator-side routes/rules are assumed allowed.`};
  }
  const metricAnswers = {
    cpu: ['Built-in metric', 'EC2 CPUUtilization → alarm/scaling policy → desired capacity → ASG reconciliation.'],
    memory: ['CloudWatch Agent / custom publisher', 'Guest memory is not an EC2 native metric. Publish it before creating the alarm.'],
    app: ['Custom metric', 'Instrument application requests/minute with PutMetricData or an appropriate log metric filter.'],
    alb: ['ALB built-in metric', 'ALBRequestCountPerTarget target tracking uses the actual ALB/target-group resource label.'],
    frequency: ['EC2 detailed monitoring', 'Increase native metric frequency from 5 minutes to 1 minute; this does not add memory or disk-space metrics.']
  };
  function metric({scenario, hasAlb}) {
    const [answer, summary] = metricAnswers[scenario] || metricAnswers.cpu;
    if (scenario === 'alb' && !hasAlb) return {steps: ['No ALB', 'No ALB request metric'], blocked: true, summary: 'Do not invent an ALB metric for a system without an ALB. Instrument the application, or deliberately add an ALB if the architecture needs one.'};
    return {steps: [answer, 'CloudWatch', scenario === 'frequency' ? '1-minute native samples' : 'Alarm / target tracking'], summary, inactive: scenario === 'alb' ? [] : ['hasAlb']};
  }
  function redisInitial() { return {shards: Array.from({length: 3}, () => ({replicas: 0, down: false})), message: 'Three write/storage partitions; no replicas yet.'}; }
  function redisStep(state, action, {key = 'order:42', failover = true} = {}) {
    const next = {shards: state.shards.map(s => ({...s})), message: state.message};
    // Illustrative stable hash, deliberately NOT the Redis CRC16 implementation.
    const slot = Array.from(key).reduce((n, ch) => (n * 31 + ch.codePointAt(0)) % 16384, 0);
    const selected = Math.min(next.shards.length - 1, Math.floor(slot * next.shards.length / 16384));
    if (action === 'shard') {
      if (next.shards.some(s => s.down)) next.message = 'Recover the failed shard first (reset this example). Resharding is not a repair for unavailable data.';
      else if (next.shards.length < 6) { next.shards.push({replicas: 0, down: false}); next.message = 'Added a shard; slots rebalanced conceptually. More aggregate write/storage capacity, not a second writer for one key.'; }
      else next.message = 'This illustration is limited to six shards; it is not an AWS quota.';
    } else if (action === 'replica') {
      next.shards.forEach(s => { if (!s.down) s.replicas = Math.min(2, s.replicas + 1); });
      next.message = 'Added a replica to each healthy shard (illustration capped at two). More read capacity and failover candidates; primary write capacity is unchanged. A down shard cannot supply a new copy.';
    } else if (action === 'write') next.message = `Illustrative slot ${slot} → shard ${selected + 1}: ${next.shards[selected].down ? 'write unavailable; primary is down' : 'primary accepts SET; replicas receive it asynchronously'}.`;
    else if (action === 'fail') {
      const s = next.shards[selected];
      if (s.replicas > 0 && failover) { s.replicas--; s.down = false; next.message = `Shard ${selected + 1}: after a failover interval, a replica is promoted. Async replication can lose recent writes; remaining replicas: ${s.replicas}.`; }
      else { s.down = true; next.message = `Shard ${selected + 1}: primary unavailable. ${s.replicas ? 'Automatic failover is disabled.' : 'No replica exists to promote.'} Adding shards does not repair this shard’s data.`; }
    }
    return {...next, selected: Math.min(next.shards.length - 1, Math.floor(slot * next.shards.length / 16384)), slot};
  }
  const api = {capacity, voucher, dynamoCapacity, shards, edge, policy, apiCache, alb, firewall, metric, redisInitial, redisStep};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else globalThis.DVALearning = api;
})();
