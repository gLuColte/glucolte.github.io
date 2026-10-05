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
  const ragCases = [
    {
      "title": "Literal policy identifiers",
      "domain": "RAG · candidate recall",
      "prompt": "A Bedrock assistant uses an OpenSearch-backed RAG index for private repair policies. An authorized user asks about AU-BAT-1047. The current source, its literal identifier, and tenant metadata are correctly indexed. Semantic retrieval returns similar battery policies, but AU-BAT-1047 is absent from the candidates. Increasing candidate count has not reliably recovered it. The model answers from the other passages. Which change should the team evaluate first while preserving tenant access restrictions?",
      "constraint": "Ingestion and authorization are verified; the required source is missing at candidate retrieval.",
      "delta": "Add an exact-ID or lexical retrieval signal alongside vector search, retaining the trusted tenant filter. AU-BAT-1047 must enter the candidate set before a reranker or generator can use it. Measure candidate recall on literal-ID questions before tuning later stages.",
      "options": [
        {
          "label": "Combine lexical/ID matching with vector retrieval while preserving trusted tenant filtering.",
          "reason": "This targets candidate recall without admitting another tenant’s evidence.",
          "correct": true
        },
        {
          "label": "Use a stronger reranker on the current semantic candidate set.",
          "reason": "Reranking can improve order, but the correct policy never enters the input set.",
          "correct": false
        },
        {
          "label": "Increase model capacity and instruct the generator to include the requested policy ID.",
          "reason": "The generator still lacks the private policy text; including its ID does not supply the evidence.",
          "correct": false
        },
        {
          "label": "Broaden retrieval by removing the tenant filter before context assembly.",
          "reason": "Authorization is already verified for the target source; removing the filter adds disclosure risk without addressing literal-ID retrieval.",
          "correct": false
        }
      ],
      "path": [
        "caller",
        "authorize",
        "search",
        "rerank",
        "context",
        "generate",
        "verify"
      ],
      "counter": "If AU-BAT-1047 is present in candidates but consistently discarded by ranking, evaluate reranking rather than repairing first-stage recall.",
      "reading": "#cheat-sheet"
    },
    {
      "title": "Warranty tables and eligibility conditions",
      "domain": "RAG · ingestion",
      "prompt": "A RAG assistant indexes warranty tables from S3 PDFs. The original table pairs “replacement is free” with “active plan required.” Inspection shows that the parser retained the benefit but dropped the qualifying column. Indexed chunks and retrieved context reproduce that incomplete text, and the model faithfully summarizes it. Retrieval scores are high. Which corrective action should the team take first to address the unsupported unconditional benefit?",
      "constraint": "The condition is already absent from extracted text, before chunking, embedding, or generation.",
      "delta": "Repair table extraction/reconstruction, validate the condition against the original PDF, and rebuild the affected indexed evidence. Stronger embeddings and better ranking cannot recover a qualification that never entered the index. The observed generator behavior follows its damaged input, so source preservation is the first repair.",
      "options": [
        {
          "label": "Repair table extraction, validate the reconstructed condition, and re-index the corrected evidence.",
          "reason": "Restores the missing source condition at the first demonstrated failure boundary.",
          "correct": true
        },
        {
          "label": "Use larger embeddings and re-embed the existing extracted text.",
          "reason": "A more capable embedding representation still encodes text from which the condition has been lost.",
          "correct": false
        },
        {
          "label": "Increase retrieval count and rerank passages from the existing index.",
          "reason": "More or better-ranked copies of incomplete evidence do not restore the missing table column.",
          "correct": false
        },
        {
          "label": "Change chunk overlap and rebuild chunks from the same extracted text.",
          "reason": "Chunk overlap helps when preserved text is split, but the condition is missing before chunking starts.",
          "correct": false
        }
      ],
      "path": [
        "parse",
        "chunk",
        "index",
        "search",
        "context",
        "generate",
        "verify"
      ],
      "counter": "If extracted text includes the condition but chunking or context pruning separates it from the claim, repair that later boundary instead.",
      "reading": "#building-the-searchable-knowledge-base"
    },
    {
      "title": "Shared-index tenant access",
      "domain": "RAG · authorization",
      "prompt": "A multi-tenant Bedrock assistant retrieves repair documents through a shared index. The highest-scoring passage belongs to another customer. The signed-in user has no entitlement to it, but requests that the assistant use it because it appears to answer the question exactly. IAM permits the backend to query the shared index, and the passage has a valid source citation. Which design best enforces the user’s data-access boundary?",
      "constraint": "Backend access to the shared index and semantic relevance do not establish this user’s document entitlement.",
      "delta": "Derive permitted document scope from trusted identity and apply deterministic ACL/filter checks before unauthorized passages enter the model context. The backend role’s broad index access is not the caller’s permission to read every document. Citation validity and answer quality do not override that boundary.",
      "options": [
        {
          "label": "Construct trusted tenant/ACL filters and verify document entitlement before assembling model context.",
          "reason": "Checks the actual user’s permitted evidence before disclosure.",
          "correct": true
        },
        {
          "label": "Pass the passage to the model with an instruction to omit sensitive details.",
          "reason": "Unauthorized data has already entered model context; a disclosure instruction does not enforce the data boundary.",
          "correct": false
        },
        {
          "label": "Use a similarity threshold and cite the source when returning its answer.",
          "reason": "Similarity and a real citation establish neither entitlement nor permission to disclose the content.",
          "correct": false
        },
        {
          "label": "Rely on the backend IAM role’s shared-index permission as authorization for every returned document.",
          "reason": "The role can query the index, but the caller still needs document-level authorization.",
          "correct": false
        }
      ],
      "path": [
        "caller",
        "authorize",
        "search",
        "context",
        "generate",
        "verify"
      ],
      "counter": "For a truly public corpus, document entitlement may not constrain retrieval; private tools and transactions still need caller-specific authorization.",
      "reading": "#metadata-filtering"
    },
    {
      "title": "Eligibility claims with source citations",
      "domain": "RAG · faithfulness",
      "prompt": "A warranty assistant retrieves the current policy containing both the replacement benefit and its plan-eligibility exception. Traces confirm the complete passage reaches Bedrock without truncation. The answer is valid JSON and cites that real policy, but says every customer receives a free replacement. Offline retrieval recall and precision already meet their targets. Which improvement should the team prioritize for this observed defect?",
      "constraint": "Complete current evidence reached generation; the unsupported claim appears in the generated answer.",
      "delta": "Evaluate claim support and citation entailment against the supplied passage, strengthen evidence-use behavior, and apply an answer-validation or fallback policy. A real citation only locates a source; it does not prove the source supports the answer. Add this case to the faithfulness regression set.",
      "options": [
        {
          "label": "Evaluate answer faithfulness against the passage and test evidence-use/answer-validation changes.",
          "reason": "Targets the unsupported claim despite successful retrieval and valid structure.",
          "correct": true
        },
        {
          "label": "Validate that the citation URL exists and treat successful resolution as source support.",
          "reason": "The URL is real, but its passage does not support the universal claim.",
          "correct": false
        },
        {
          "label": "Increase retrieval count and rerank the added context before generation.",
          "reason": "The required exception already reaches the model; retrieval coverage is not the first demonstrated defect.",
          "correct": false
        },
        {
          "label": "Tighten JSON field types and use schema validation as the quality gate.",
          "reason": "The output already parses, and schema validity cannot establish that the eligibility claim follows from evidence.",
          "correct": false
        }
      ],
      "path": [
        "search",
        "context",
        "generate",
        "verify"
      ],
      "counter": "If the exception is absent from model context, investigate retrieval or context assembly before concluding that the generator misused complete evidence.",
      "reading": "#evaluation-does-the-system-retrieve-and-answer-well"
    }
  ];
  const promptCases = [
    {
      "title": "Mixed-issue ticket classification",
      "domain": "Prompt engineering · task specification",
      "prompt": "A support classifier invokes a Bedrock model with “Classify this support ticket” and a required JSON result. For “I was charged twice and cannot log in,” responses contain valid JSON but alternate between Billing, Negative, and Urgent. The prompt has no agreed category definitions or rule for overlapping issues. The team wants to improve classification correctness before considering training. Which prompt change is the best first step?",
      "constraint": "The output format is defined, but the classification labels and overlap decision policy are not.",
      "delta": "Define the permitted labels, their meanings, overlap priority, and an insufficient-information fallback. Then test the rule on representative and held-out tickets. Temperature and a persona can affect behavior, but neither defines whether billing, sentiment, or urgency is the intended classification task.",
      "options": [
        {
          "label": "Define category meanings, overlap priority, and the fallback, then evaluate the resulting policy.",
          "reason": "Supplies the missing task decision rule rather than merely stabilizing an ambiguous task.",
          "correct": true
        },
        {
          "label": "Lower temperature and keep the existing task instructions and category policy.",
          "reason": "A more stable result can still follow an undefined or unintended label scheme.",
          "correct": false
        },
        {
          "label": "Add a senior-support persona and retain the current classification instruction.",
          "reason": "Expert-role wording does not define permitted labels or the overlap rule.",
          "correct": false
        },
        {
          "label": "Require the category field to be a string and reject malformed JSON.",
          "reason": "The observed outputs already parse; valid structure does not define which category is correct.",
          "correct": false
        }
      ],
      "path": [
        "task",
        "policy",
        "contract",
        "test"
      ],
      "counter": "If the category policy is already clear but a particular boundary is misread, test a targeted clarification and representative few-shot example.",
      "reading": "#worked-example"
    },
    {
      "title": "Classifier-to-API integration",
      "domain": "Prompt engineering · output contract",
      "prompt": "A Bedrock support classifier consistently selects the correct label on a held-out set. A downstream API requires exactly category and reason string fields, with category drawn from an approved list. Some responses contain prose, extra keys, or malformed JSON, causing API failures. The selected model supports structured output. The team must retain semantic validation as well as parsing safety. Which change most directly addresses the failures?",
      "constraint": "Category quality is adequate; the failure is the machine-consumable output contract.",
      "delta": "Use the supported schema/structured-output mechanism and validate parsing, keys, types, permitted labels, and business meaning in application code. Schema enforcement targets the observed syntax and field failures. It complements the existing semantic tests rather than replacing them.",
      "options": [
        {
          "label": "Use supported schema-constrained output and application validation for exact keys, types, labels, and meaning.",
          "reason": "Addresses the integration contract while retaining classification-quality checks.",
          "correct": true
        },
        {
          "label": "Add more correctly labeled billing examples while leaving output enforcement unchanged.",
          "reason": "Examples can help semantics, but do not directly enforce the exact machine contract causing the observed failures.",
          "correct": false
        },
        {
          "label": "Lower temperature and accept a response whenever the label sounds correct.",
          "reason": "Lower sampling variability does not enforce required keys or make malformed JSON consumable.",
          "correct": false
        },
        {
          "label": "Ask a second model to reformat responses and send its output to the API without validation.",
          "reason": "A formatting step can still produce contract violations; an unchecked model output is not a reliable API boundary.",
          "correct": false
        }
      ],
      "path": [
        "policy",
        "contract",
        "test"
      ],
      "counter": "If outputs meet the schema but the labels or reasons are wrong, investigate task policy, examples, or evidence rather than treating parsing as the defect.",
      "reading": "#json-schema"
    },
    {
      "title": "Routine billing versus urgent billing",
      "domain": "Prompt engineering · few-shot boundaries",
      "prompt": "A classifier’s policy defines incorrect charges as Urgent and invoice-download questions as General Inquiry. Its few-shot prompt contains several urgent billing examples but no routine invoice example. Repeated tests label “Where can I download an invoice?” as Urgent despite valid JSON and clear policy text. The team wants a small controlled experiment, preserving the held-out test set and existing urgent-charge performance. Which change should it test first?",
      "constraint": "The model overgeneralizes the demonstrated billing pattern despite an explicit category rule.",
      "delta": "Clarify that billing terms alone do not imply urgency and add a representative invoice-download boundary example. Keep the model/configuration fixed and evaluate both the original urgent-charge cases and unseen invoice questions. This targets the demonstrated category boundary without using test cases as training data.",
      "options": [
        {
          "label": "Clarify the billing/urgency boundary, add a representative invoice example, and retest held-out cohorts.",
          "reason": "Targets the missing contrast while measuring regression on valid urgent-charge cases.",
          "correct": true
        },
        {
          "label": "Add more urgent billing examples with different wording and retain the current prompt boundary.",
          "reason": "More examples of the overrepresented pattern can reinforce the shortcut instead of teaching the routine-invoice distinction.",
          "correct": false
        },
        {
          "label": "Increase model sampling variability and select whichever run returns General Inquiry.",
          "reason": "Selecting a convenient run does not repair or evaluate the underlying category boundary.",
          "correct": false
        },
        {
          "label": "Fine-tune immediately on all held-out invoice questions and report accuracy on those same questions.",
          "reason": "This contaminates the test set and bypasses the requested smaller controlled prompt experiment.",
          "correct": false
        }
      ],
      "path": [
        "policy",
        "examples",
        "test"
      ],
      "counter": "If policy text and example labels conflict, fix the contradiction first; if an evaluated prompt still cannot meet the target, consider supported customization using separate training data.",
      "reading": "#shots"
    },
    {
      "title": "Refund status with incomplete ticket data",
      "domain": "Prompt engineering · knowledge boundary",
      "prompt": "A prompt-only Bedrock assistant answers customer refund questions. A ticket contains an order ID and a refund request but no verified status or arrival date. The model returns a well-formed JSON date of Friday based on a generic refund example. The application can access an authoritative status API if the customer is authorized. A response must not assert an unsupported date. Which design best meets this requirement?",
      "constraint": "An example and an order identifier do not supply this customer’s current refund status.",
      "delta": "Retrieve status from the authorized authoritative API and supply it as evidence; if a verified date is unavailable, return an explicit unknown/pending result. This addresses missing facts while keeping the response contract valid. Neither a forced date field nor more confident wording makes an invented date true.",
      "options": [
        {
          "label": "Use an authorized status lookup and return a verified date or an explicit unknown/pending fallback.",
          "reason": "Supplies current evidence or safely represents its absence.",
          "correct": true
        },
        {
          "label": "Add more refund examples with specific dates and require the model to choose a date.",
          "reason": "Historical or illustrative examples are not this transaction’s verified status.",
          "correct": false
        },
        {
          "label": "Require a date-formatted JSON string for every answer and reject responses with no date.",
          "reason": "A mandatory valid date can force a structurally correct invention when the fact is unavailable.",
          "correct": false
        },
        {
          "label": "Lower temperature and reuse the most frequent date from repeated model outputs.",
          "reason": "Repeated agreement is not independent evidence of the customer’s refund timeline.",
          "correct": false
        }
      ],
      "path": [
        "task",
        "facts",
        "contract",
        "test"
      ],
      "counter": "If a verified date is already provided but misreported, test faithful extraction and output handling; if status access is unavailable, keep the unknown/pending fallback.",
      "reading": "#evaluation"
    }
  ];
  const topic = root.dataset.topic;
  if (topic !== 'rag' && topic !== 'prompt') return;
  const cases = topic === 'rag' ? ragCases : promptCases;
  {
    root.querySelector('label[for="aip-case"]').textContent = 'Choose a scenario';
    root.querySelector('legend').textContent = 'Which change addresses the first failed boundary?';
    root.querySelectorAll('.aip-lab__reason > strong')[1].textContent = 'Why this answer fits';
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
    el('alternatives').replaceChildren();
    item.options.filter(option => !option.correct).forEach(option => {
      const li = document.createElement('li');
      const label = document.createElement('strong');
      label.textContent = `${option.label}: `;
      li.append(label, document.createTextNode(option.reason));
      el('alternatives').append(li);
    });
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
    set('feedback', '');
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
        set('feedback', option.correct ? 'Correct' : 'Incorrect');
        el('feedback').dataset.result = option.correct ? 'correct' : 'incorrect';
        if (option.correct) reveal();
        else { el('solution').hidden = true; revealed = false; }
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
