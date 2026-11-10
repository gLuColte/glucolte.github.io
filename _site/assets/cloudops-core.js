/* Pure local teaching models. No AWS calls; assumptions are shown beside labs. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CloudOpsLearning = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const number = (v, min, max) => Math.min(max, Math.max(min, Number(v) || 0));
  function alarm(x) {
    const values = x.values.split(',').map(v => v.trim() === '-' ? null : v.trim() === '' ? NaN : Number(v.trim()));
    if (values.length < x.n || values.some(v => v !== null && !Number.isFinite(v))) return {error:'Enter at least N comma-separated values; use - for missing.'};
    const recent = values.slice(-x.n), m = Math.min(x.n, x.m), missing = recent.filter(v => v === null).length;
    const breaches = recent.filter(v => v !== null && v > x.threshold).length;
    let state;
    if (!missing) state = breaches >= m ? 'ALARM' : 'OK';
    else if (x.missing === 'ignore') state = x.previous;
    else if (x.missing === 'breaching') state = breaches + missing >= m ? 'ALARM' : 'OK';
    else if (x.missing === 'notBreaching') state = breaches >= m ? 'ALARM' : 'OK';
    else state = breaches >= m ? 'ALARM' : breaches + missing < m ? 'OK' : 'INSUFFICIENT_DATA';
    return {state, recent, missing, breaches, m, minutes:x.n * x.period / 60,
      explanation:`${breaches} real breaches, ${missing} missing; need ${m} of ${x.n} periods above ${x.threshold}. ${x.missing === 'ignore' && missing ? `Illustrated state stays ${x.previous}.` : `Illustrated result: ${state}.`} Window = ${x.n} × ${x.period}s.`,
      verify:'Check actual alarm state history and notification delivery. This fixed-window model omits older-datapoint retrieval, premature-transition rules and service-specific exceptions.'};
  }
  function network(x) {
    const gates = [['DNS resolves', x.dns], ['Route and return path exist', x.route], [`ALB SG permits inbound ${x.https ? 443 : 80}`, x.sg], ['ALB subnet NACL permits request', x.inbound], [`ALB subnet NACL permits response to client:${x.port}`, x.outbound], ['Backend SG permits ALB on application port', x.backend]];
    const blocked = gates.findIndex(g => !g[1]);
    return {gates, blocked, state:blocked < 0 ? 'REQUEST + RESPONSE SUCCEED' : `BLOCKED: ${gates[blocked][0]}`,
      explanation:blocked < 0 ? 'The configured simplified path works. SG return traffic is tracked; the NACL explicitly permits the return destination port. Backend NACLs, OS firewall, TLS and listener are assumed valid.' : `${gates[blocked][0]} is the first failed dependency in this simplified inspection order. Earlier configuration success does not fix this boundary.`,
      verify:'Repeat from the affected source; compare DNS, flow/access logs, target health and response. Client ephemeral ranges vary by initiator/OS.'};
  }
  function capacity(x) {
    const min = number(x.min, 0, 20), max = Math.max(min, number(x.max, 0, 20));
    const desired = Math.min(max, Math.max(min, number(x.desired, 0, 20) + number(x.adjustment, -20, 20)));
    const a = number(x.a, 0, 20), b = number(x.b, 0, 20), availableA = x.failed ? 0 : a;
    const healthy = x.health ? availableA + b : 0, capacity = healthy * 100;
    return {min,max,desired,current:a+b,surviving:availableA+b,healthy,capacity,launch:Math.max(0,desired-(availableA+b)),a:availableA,b,
      state:!healthy ? 'NO HEALTHY TARGETS' : capacity < x.load ? 'SURVIVING CAPACITY SHORTFALL' : 'SURVIVING CAPACITY MEETS LOAD',
      explanation:`Policy requests desired ${desired}, bounded by ${min}–${max}; actual before failure ${a+b}, surviving ${availableA+b}. ${healthy} healthy targets × illustrative 100 requests/s = ${capacity} requests/s versus demand ${x.load}. ${!healthy ? 'ALB can fail open if all registered targets are unhealthy; that does not restore capacity.' : 'ALB routes; ASG separately attempts capacity reconciliation.'}`,
      verify:'Inspect scaling activities, launch capacity and target health; load-test the user path. Capacity per target is an illustrative assumption, not an AWS guarantee.'};
  }
  const recoveryOptions = [
    {id:'daily',label:'Daily backup + restore',rto:180,rpo:1440,cost:'Low standby cost'},
    {id:'pitr',label:'Continuous PITR + restore',rto:90,rpo:5,cost:'Backup/log retention + restore cost'},
    {id:'pilot',label:'Pilot-light runbook',rto:45,rpo:5,cost:'Core data components running'},
    {id:'warm',label:'Warm-standby runbook',rto:10,rpo:1,cost:'Reduced application stack running'}
  ];
  function recovery(x) {
    const rows = recoveryOptions.map(o => ({...o,meets:o.rto <= x.rto && o.rpo <= x.rpo && (!x.corruption || ['daily','pitr'].includes(o.id))}));
    const choice = rows.find(o=>o.meets);
    return {rows,state:choice ? choice.label : 'NO LISTED PROCEDURE MEETS BOTH',
      explanation:`Requirements: RTO ≤ ${x.rto} min and RPO ≤ ${x.rpo} min. ${x.corruption ? 'Logical corruption: live replication alone is unsuitable; this model gives historical recovery only to the backup options.' : 'Failure of infrastructure: a validated standby may be suitable.'} ${choice ? 'First eligible option in this illustrative cost order is shown.' : 'Improve/test the procedure or revisit constraints; do not claim a guarantee from a DR label.'}`,
      verify:'Numbers are assumed measured runbook results for this example, not AWS service SLAs. Include dependency recovery, permissions, data validation and endpoint cutover.'};
  }
  function stack(x) {
    const ready = x.permission && x.ips;
    const state = x.status === 'UPDATE_ROLLBACK_FAILED'
      ? ready ? 'READY TO CONTINUE ROLLBACK' : 'REPAIR ROLLBACK PREREQUISITE'
      : ready ? 'REVIEW A CORRECTED CHANGE SET' : 'FIX BEFORE NEXT UPDATE';
    return {state,explanation:`Stack: ${x.status}. ${!x.permission ? 'The service role lacks a required action. ' : ''}${!x.ips ? 'The deployment subnet lacks free IP capacity. ' : ''}${x.status === 'UPDATE_ROLLBACK_FAILED' ? 'Repair the cause, then continue-update-rollback; wait for a completed rollback before planning the next update.' : 'The prior rollback completed; fix the original cause and review/execute a new change set.'}`,
      command:x.status === 'UPDATE_ROLLBACK_FAILED' && ready ? 'aws cloudformation continue-update-rollback --stack-name orders' : 'aws cloudformation describe-stack-events --stack-name orders',
      verify:'This lab changes no real stack. Inspect resource reason, stack completion and application health; reconcile skipped resources rather than treating a skip as a fix.'};
  }
  function access(x) {
    const gates = [['Valid scoped role session',x.session],['Resource API action allowed',x.resource],['No applicable explicit deny',!x.deny],['KMS key policy enables this access path',x.key],['IAM kms:Decrypt allows this path',x.decrypt],['KMS key enabled and context correct',x.enabled]];
    const blocked = gates.findIndex(g=>!g[1]);
    return {gates,blocked,state:blocked < 0 ? 'ENCRYPTED READ ALLOWED' : `DENIED: ${gates[blocked][0]}`,
      explanation:blocked < 0 ? 'Both resource access and the configured IAM-enabled KMS key-policy path permit this request; network path is assumed valid.' : `${gates[blocked][0]} fails. Inspect the actual error/principal/policy rather than broadening unrelated permissions.`,
      verify:'Simplified IAM-enabled key-policy path only: direct key-policy grants, KMS grants, session policies, boundaries, SCPs and resource-policy principal exceptions require full evaluation.'};
  }
  return {alarm,network,capacity,recovery,stack,access,recoveryOptions};
});
