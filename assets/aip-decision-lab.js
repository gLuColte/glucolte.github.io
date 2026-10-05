/* Local learning exercise: no AWS calls, tracking, or persisted answers. */
(() => {
  'use strict';
  const root = document.getElementById('aip-decision-lab');
  if (!root) return;
  const el = id => root.querySelector(`#aip-${id}`);
  // Each stage describes a responsibility, its payload, control, and failure boundary.
  const stages = {
    caller: ['Caller', 'Question and authenticated session.', 'Derive account and tenant scope from trusted identity.', 'Reject invalid identity before retrieving data or invoking tools.'],
    authorize: ['Authorize corpus', 'Allowed document scope derived from identity.', 'Construct backend filters/ACLs; fail closed on missing entitlement.', 'Never let unauthorized chunks enter model context.'],
    rerank: ['Rerank candidates', 'Existing candidate set reordered for the question.', 'Keep enough candidates, then prune within the context budget.', 'A missing document cannot be recovered here.'],
    context: ['Assemble context', 'Question plus selected authorized evidence and versioned instructions.', 'Separate untrusted documents from instructions; preserve useful citations.', 'Detect context truncation and injected instructions; constrain downstream tools.'],
    index: ['Embed and index', 'Chunks, embeddings, ACL metadata, source URI and version.', 'Use compatible query/corpus embeddings and explicit sync/update/delete handling.', 'Check ingestion status and derived copies; an S3 update alone proves no index refresh.'],
    parse: ['Parse the source', 'Document structure: headings, table cells, exceptions, and source version.', 'Check extracted text against the original before chunking.', 'If the parser drops the exception, neither embeddings nor generation can restore it.'],
    chunk: ['Build useful chunks', 'Evidence units with enough local context and source metadata.', 'Keep qualifications with the claims they modify; evaluate overlap/parent context.', 'Inspect the actual chunk text instead of assuming a larger size always helps.'],
    search: ['Retrieve candidates', 'Authorized lexical/vector/hybrid candidates for the question.', 'Measure recall and precision; preserve country, date, and literal identifiers.', 'Fix missing evidence upstream; reranking only sees returned candidates.'],
    generate: ['Generate from evidence', 'Question, instructions, and selected permitted source passages.', 'Separate untrusted text from instructions; allow an unsupported-answer fallback.', 'Reject unsupported claims rather than accepting plausible wording.'],
    verify: ['Verify the answer', 'Claims and citations compared with the supplied sources.', 'Measure faithfulness, question relevance, and reference correctness separately.', 'A real citation or valid JSON is not proof that the claim is supported.'],
    task: ['Define the task', 'One explicit objective and the input to operate on.', 'Specify whether to classify, summarize, extract, or decide; define success.', 'A persona or more verbosity cannot resolve an ambiguous objective.'],
    policy: ['Specify the decision rule', 'Allowed categories, boundaries, priorities, and an Unclear fallback.', 'Make overlapping categories and missing-information handling explicit.', 'Fix the category rule before tuning randomness or adding a generic persona.'],
    examples: ['Show the boundary', 'Representative examples, including a misleading keyword or overlap case.', 'Align labels with the policy; reserve unseen cases for evaluation.', 'Examples can encode the wrong rule or overfit a few known tickets.'],
    contract: ['Enforce the output contract', 'Required keys, types, permitted values, and structured-output configuration.', 'Use supported schema constraints and validate parsing/types in application code.', 'Reject malformed output; schema-valid text can still be semantically wrong.'],
    facts: ['Supply facts or abstain', 'Verified context, an authorized source lookup, or an explicit no-answer result.', 'Only assert a fact when the supplied evidence supports it.', 'Do not ask the model to invent a refund date or treat an example as live data.'],
    test: ['Rerun held-out cases', 'Expected labels, source-supported reasons, and observed structured results.', 'Hold model/configuration fixed; check regressions, safety, cost, and repeated runs.', 'One repaired example is insufficient evidence that the change generalizes.']
  };
  const choice = (label, reason, correct = false) => ({ label, reason, correct });
  const ragCases = [
    {title: 'The exact policy never appears', domain: 'RAG · candidate recall', prompt: 'Northstar is asked about policy AU-BAT-1047. The current authorized source and exact identifier are correctly indexed. Semantic retrieval returns similar battery policies, but never this one. Which boundary should change first?', constraint: 'The required source is absent from the candidate set despite correct ingestion and scope.', delta: 'Preserve/search the literal ID through exact lookup or lexical/hybrid retrieval. Evaluate recall before adding another ranker.', options: [choice('Repair first-stage retrieval for the exact ID', 'The relevant source must enter the candidate set before downstream stages can use it.', true), choice('Only use a stronger reranker', 'It cannot rescore a policy it never receives.'), choice('Only improve the answer prompt', 'The generator still lacks the required policy.')], path: ['caller','authorize','search','rerank','context','generate','verify'], counter: 'If the correct policy is already in candidates but poorly ordered, reranking may be the right next change.', reading: '#cheat-sheet'},
    {title: 'The parser loses the exception', domain: 'RAG · ingestion', prompt: 'The original policy table says replacement is free only under an active plan. Extracted text contains “replacement is free” but drops the qualifying column. Retrieved chunks reproduce this incomplete text. What should you fix?', constraint: 'The evidence was damaged before chunking and indexing.', delta: 'Repair table parsing/reconstruction, validate against the source, then rebuild affected chunks and index copies.', options: [choice('Fix extraction and re-index corrected evidence', 'The parser must preserve the condition before any downstream stage can use it.', true), choice('Increase embedding dimensions', 'A larger vector does not restore text lost by extraction.'), choice('Increase retrieval K without changing the index', 'More candidates from the same damaged text do not reconstruct the missing condition.')], path: ['parse','chunk','index','search','context','generate','verify'], counter: 'If extracted text preserves the condition but chunking splits it away, change the chunk/context strategy instead.', reading: '#building-the-searchable-knowledge-base'},
    {title: 'A perfect match belongs to another tenant', domain: 'RAG · authorization', prompt: 'A private repair policy has the highest similarity score, but it belongs to another account. The user asks the assistant to include it anyway. Which rule governs context assembly?', constraint: 'Relevance does not establish permission to disclose the document.', delta: 'Derive scope from trusted identity, filter/authorize retrieved documents, and exclude unauthorized evidence before model context.', options: [choice('Exclude it through deterministic data authorization', 'Only permitted evidence may enter the model context.', true), choice('Include it and tell the model not to quote it', 'The sensitive data has already crossed the boundary.'), choice('Accept it because similarity is very high', 'Similarity measures relevance, not entitlement.')], path: ['caller','authorize','search','context','generate','verify'], counter: 'If the corpus is public and no data restriction applies, relevance can dominate selection. Tool/account authorization still applies.', reading: '#metadata-filtering'},
    {title: 'Good evidence, unsupported answer', domain: 'RAG · faithfulness', prompt: 'The supplied source says battery replacement eligibility depends on the plan. The answer cites that source but claims everyone gets a free replacement. Retrieval returned the correct passage. What failed?', constraint: 'The generated claim is not supported by the supplied evidence.', delta: 'Evaluate faithfulness/citation entailment, refine evidence-use instructions or answer validation, and add this case to the regression set.', options: [choice('Test source support at the answer boundary', 'Faithfulness checks whether the passage actually supports the claim.', true), choice('Trust the answer because its citation is real', 'A valid source location can accompany an unsupported claim.'), choice('Assume candidate recall is the only problem', 'The relevant qualifying passage already reached generation.')], path: ['search','context','generate','verify'], counter: 'If the qualifying passage never reached context, diagnose retrieval/context assembly first.', reading: '#evaluation-does-the-system-retrieve-and-answer-well'}
  ];
  const promptCases = [
    {title: 'The category policy is missing', domain: 'Prompt engineering · task specification', prompt: 'The prompt says “Classify this support ticket.” For “I was charged twice and cannot log in,” outputs alternate among Billing, Negative, and Urgent. Which addition resolves the ambiguity?', constraint: 'The task has no agreed category set or decision policy.', delta: 'Specify allowed labels, category definitions, overlap priority, and the fallback. Then evaluate representative tickets.', options: [choice('Define category rules and the required result', 'The model needs to know which classification task and label boundaries you intend.', true), choice('Only add “you are a senior support expert”', 'A persona does not define the missing category policy.'), choice('Only set temperature near zero', 'More consistent output can still follow the wrong classification task.')], path: ['task','policy','contract','test'], counter: 'If categories and rules are already clear but a specific pattern is misread, a representative example may help.', reading: '#worked-example'},
    {title: 'Correct label, malformed JSON', domain: 'Prompt engineering · output contract', prompt: 'The classifier chooses Urgent correctly, but sometimes returns prose or invalid JSON. A downstream API requires exactly category and reason string fields. What should change?', constraint: 'The downstream structure must be machine-valid independently of category quality.', delta: 'Use supported structured output/schema constraints, and validate parsing, keys, types, values, and business meaning in code.', options: [choice('Enforce a schema and validate the result', 'This directly addresses the output contract while preserving semantic checks.', true), choice('Add more billing examples only', 'Classification examples do not reliably enforce JSON syntax or exact fields.'), choice('Accept anything that sounds correct', 'The API cannot consume malformed or contract-violating output.')], path: ['policy','contract','test'], counter: 'If JSON is valid but the category/reason is wrong, fix the decision rule or evidence use instead.', reading: '#json-schema'},
    {title: 'One keyword overrides the policy', domain: 'Prompt engineering · few-shot boundaries', prompt: 'The policy marks incorrect charges as Urgent and invoice-download questions as General Inquiry. Nevertheless, “Where can I download an invoice?” is repeatedly Urgent. Which experiment targets the error?', constraint: 'The existing policy is clear, but the model overgeneralizes a billing keyword.', delta: 'Add a representative invoice-question boundary example, clarify that billing alone is not urgent, and retest existing plus unseen cases.', options: [choice('Clarify the boundary and add a matching example', 'This targets the observed policy misunderstanding.', true), choice('Make the prompt much longer on unrelated topics', 'Unrelated detail does not resolve the category boundary.'), choice('Retrain on the evaluation set immediately', 'First test a smaller targeted prompt change; held-out cases must remain separate.')], path: ['policy','examples','test'], counter: 'If the policy itself conflicts, resolve the conflict before adding demonstrations.', reading: '#shots'},
    {title: 'The requested fact is absent', domain: 'Prompt engineering · knowledge boundary', prompt: 'A customer asks when a refund will arrive, but the ticket contains no refund status or date. A prompt-only assistant confidently invents “Friday.” What is the smallest safe system decision?', constraint: 'No supplied evidence supports a refund date.', delta: 'Use an explicit insufficient-information response, or retrieve status from an authorized authoritative API when that access is available.', options: [choice('Obtain verified status or use the no-answer fallback', 'Missing facts need evidence or abstention rather than more confident wording.', true), choice('Add an example with a Friday refund', 'An example is not this customer’s current transaction status.'), choice('Require an exact date through JSON Schema', 'Structure can force a date field without making the date true.')], path: ['task','facts','contract','test'], counter: 'If verified current status is supplied, test whether the prompt extracts it faithfully and meets the output contract.', reading: '#evaluation'}
  ];
  const topic = root.dataset.topic;
  if (topic !== 'rag' && topic !== 'prompt') return;
  const cases = topic === 'rag' ? ragCases : promptCases;
  {
    root.querySelector('label[for="aip-case"]').textContent = 'Choose a quick problem';
    root.querySelector('legend').textContent = 'Which change addresses the first failed boundary?';
    root.querySelectorAll('.aip-lab__reason > strong')[1].textContent = 'Smallest useful change';
    root.querySelector('.aip-lab__note').textContent = 'Illustrative exercises with predefined feedback, not live model outputs. Inspect the evidence and test the proposed change on representative held-out cases.';
  }
  let currentCase = 0;
  let currentStep = 0;
  let revealed = false;
  const set = (id, value) => { el(id).textContent = value; };
  cases.forEach((item, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = `${index + 1}. ${item.title}`;
    el('case').append(option);
  });
  function renderStep() {
    const item = cases[currentCase];
    const stage = stages[item.path[currentStep]];
    set('step-title', `${currentStep + 1}. ${stage[0]}`);
    ['data', 'control', 'failure'].forEach((field, index) => set(`step-${field}`, stage[index + 1]));
    el('path').querySelectorAll('button').forEach((button, index) => {
      if (index === currentStep) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    set('step-count', `Step ${currentStep + 1} of ${item.path.length}`);
    el('prev-step').disabled = currentStep === 0;
    el('next-step').disabled = currentStep === item.path.length - 1;
  }
  function reveal() {
    if (revealed) return;
    revealed = true;
    const item = cases[currentCase];
    set('constraint', item.constraint);
    set('delta', item.delta);
    set('counterfactual', item.counter);
    set('path-label', item.path.includes('cache') ? 'Trace a cache miss (hits skip retrieval and generation)' : 'Trace the responsibility path');
    if (!el('feedback').dataset.result) set('feedback', 'Design revealed. Compare the constraint and rejected alternatives, then inspect each step.');
    el('reading').href = item.reading;
    el('path').replaceChildren();
    item.path.forEach((key, index) => {
      const li = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      const number = document.createElement('span');
      number.textContent = `STEP ${String(index + 1).padStart(2, '0')}${index < item.path.length - 1 ? ' →' : ''}`;
      button.append(number, document.createTextNode(stages[key][0]));
      button.addEventListener('click', () => { currentStep = index; renderStep(); });
      li.append(button);
      el('path').append(li);
    });
    el('solution').hidden = false;
    el('reveal').setAttribute('aria-expanded', 'true');
    set('reveal', 'Design revealed — inspect each step below');
    renderStep();
  }
  function renderCase() {
    const item = cases[currentCase];
    revealed = false;
    currentStep = 0;
    el('case').value = String(currentCase);
    set('case-count', `${currentCase + 1} / ${cases.length}`);
    set('domain', item.domain);
    set('prompt', item.prompt);
    set('feedback', 'Choose an answer, or reveal the design to explore it.');
    el('feedback').removeAttribute('data-result');
    el('solution').hidden = true;
    el('reveal').setAttribute('aria-expanded', 'false');
    set('reveal', 'Reveal and trace the design');
    el('choices').replaceChildren();
    // Rotate alternatives so the correct position is not a learned shortcut.
    const offset = currentCase % item.options.length;
    const options = item.options.slice(offset).concat(item.options.slice(0, offset));
    options.forEach(option => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = option.label;
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => {
        el('choices').querySelectorAll('button').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
        set('feedback', `${option.correct ? 'Correct.' : 'Reconsider the constraint.'} ${option.reason}`);
        el('feedback').dataset.result = option.correct ? 'correct' : 'incorrect';
        if (option.correct) reveal();
      });
      el('choices').append(button);
    });
    el('prev-case').disabled = currentCase === 0;
    el('next-case').disabled = currentCase === cases.length - 1;
  }
  el('case').addEventListener('change', () => { currentCase = Number(el('case').value); renderCase(); });
  el('reveal').addEventListener('click', reveal);
  el('retry').addEventListener('click', renderCase);
  el('prev-case').addEventListener('click', () => { if (currentCase > 0) { currentCase--; renderCase(); } });
  el('next-case').addEventListener('click', () => { if (currentCase < cases.length - 1) { currentCase++; renderCase(); } });
  el('prev-step').addEventListener('click', () => { if (currentStep > 0) { currentStep--; renderStep(); } });
  el('next-step').addEventListener('click', () => { if (currentStep < cases[currentCase].path.length - 1) { currentStep++; renderStep(); } });
  renderCase();
  root.querySelector('.aip-lab__fallback').hidden = true;
  root.querySelector('.aip-lab__interactive').hidden = false;
})();
