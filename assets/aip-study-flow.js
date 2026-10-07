/* Architecture decisions and evidence-led diagnostics. No network or storage. */
(() => {
  'use strict';
  const map=document.getElementById('genai-map');
  if(!map)return;
  const get=id=>document.getElementById(`aip-${id}`);
  const openAncestors=node=>{for(let parent=node;parent;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;};
  function route(){
    const id=decodeURIComponent(location.hash.slice(1));
    if(!id){resetContext();return;}
    const alias={'map-adapt-prompt':'prompt','map-adapt-rag':'retrieval'}[id];
    if(alias){showBoundary(nodeById.get(alias).concept,alias);document.getElementById('map-'+alias).scrollIntoView({block:'center'});return;}
    if(id.startsWith('stage-')||id.startsWith('band-')){
      const owner=data.nodes.find(node=>id.startsWith('stage-')?node.stage?.toLowerCase()===id.slice(6):node.band?.toLowerCase()===id.slice(5));
      if(owner){showBoundary(owner.concept,owner.id);document.getElementById('map-'+owner.id).scrollIntoView({block:'center'});}return;
    }
    if(id.startsWith('concept-')&&concepts.has(id.slice(8))){showBoundary(id.slice(8));return;}
    // Older trap links lead to the compact domain recap, never a second catalogue.
    if(traps.has(id)){const target=document.getElementById('trap-domain-'+traps.get(id).domain);openAncestors(target);target.scrollIntoView({block:'start'});return;}
    const target=document.getElementById(id);if(!target)return;
    if(target.matches('.map-link')){showBoundary(target.dataset.concept,target.id.slice(4));map.scrollIntoView({block:'start'});target.focus({preventScroll:true});return;}
    if(id==='aip-trap-practice'){get('symptom-overlay').scrollIntoView({block:'start'});return;}
    openAncestors(target);
  }
  window.addEventListener('hashchange',route);
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href^="#"]');if(!link||link.matches('.map-link')||link.closest('.aip-highlight-locations'))return;
    if(link.hash===location.hash)requestAnimationFrame(route);
  });
  const data=JSON.parse(document.getElementById('aip-study-data').textContent);
  const concepts=new Map(data.concepts.map(item=>[item.id,item]));
  const traps=new Map(data.traps.flatMap(table=>table.rows.map(row=>[row.id,{...row,headings:table.headers}])));
  const plain=copy=>copy.replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/\*\*|`/g,'');
  const nodeById=new Map(data.nodes.map(item=>[item.id,item]));
  const scenario=get('diagnostic-scenario'),investigation=get('investigation'),explanation=get('stage-explanation');
  let selectedMap=null,diagnosis=null,context=null;
  let availableScenarios=new Map();
  const make=(tag,copy,cls)=>{const node=document.createElement(tag);if(copy!==undefined)node.textContent=copy;if(cls)node.className=cls;return node;};
  function inherited(id,key){for(let item=concepts.get(id);item;item=concepts.get(item.parent))if(item[key])return item[key];return '';}
  const directOwners={
    'requirements':['constraint'],
    'datasets':['data'],'training-records':['data'],'training-config':['adapt-finetune'],'training-runs':['adapt-finetune'],'fine-tuning':['adapt-finetune'],'lora-rank':['adapt-finetune'],'lora':['adapt-finetune'],'lora-artifact':['adapt-finetune'],
    'checkpoint':['evaluate'],'lifecycle-evaluate':['evaluate'],'registry':['deploy'],'deployment-check':['deploy'],'lora-serving':['deploy','model'],'select':['select'],'adapt':['adapt','prompt','retrieval'],'model-customization':['adapt'],'prompt-engineering':['prompt'],'rag':['retrieval'],'continued-pretraining':['adapt-pretrain'],'distillation':['adapt-distill'],'monitor':['monitor'],
    'source':['source'],'preprocess':['data-prepare'],'parse':['data-prepare','data-ingest'],'chunk':['data-ingest'],'metadata':['data-ingest','store'],'embed':['data-ingest'],'index':['data-ingest','store'],
    'query':['retrieval'],'query-embed':['retrieval'],'candidates':['retrieval'],'reranker':['retrieval'],'best-context':['retrieval','prompt'],
    'user-query':['constraint','prompt'],'system-instructions':['prompt'],'prompt-template':['prompt'],'retrieved-knowledge':['retrieval','prompt'],'conversation':['prompt'],'generation-config':['model','response'],
    'quantization':['model'],'capacity':['model'],'admission':['user','orchestration'],'caching':['store','model'],'traces':['observability'],'performance':['evaluation','observability'],
    'tool-validation':['orchestration','security'],'mcp':['orchestration'],'recovery':['orchestration'],'authentication':['user','security'],'tenant':['retrieval','security'],'private-network':['user','security'],'kms':['security'],'guardrails':['security'],'pii':['data-prepare','security'],'governance':['security'],'content-logs':['security','observability']
  };
  function owners(id){
    if(directOwners[id])return directOwners[id];
    for(let item=concepts.get(id);item;item=concepts.get(item.parent)){
      const node=data.nodes.find(node=>node.concept===item.id);if(node)return[node.id];
    }return['constraint'];
  }
  function mapState(){
    const suspects=diagnosis?diagnosis.highlights:[];
    map.querySelectorAll('.map-link').forEach(node=>{
      node.classList.toggle('is-failed',suspects.includes(node.id.slice(4)));
      node.classList.toggle('is-selected',node.id===`map-${selectedMap}`&&!suspects.includes(selectedMap));
      const title=nodeById.get(node.id.slice(4)).title;
      node.setAttribute('aria-label',`${title}${suspects.includes(node.id.slice(4))?' — investigation point':''}: inspect decisions`);
    });
  }
  function fieldBlock(label,copy){const section=make('div');section.append(make('h4',label),make('p',copy));return section;}
  function comparisonBlock(comparison){
    const section=make('section',undefined,'aip-model-comparison');
    const table=make('table');table.setAttribute('role','table');table.append(make('caption',comparison.title));
    const head=make('thead'),headRow=make('tr');
    comparison.headers.forEach(label=>{const cell=make('th',label);cell.scope='col';headRow.append(cell);});head.append(headRow);table.append(head);
    const body=make('tbody');
    comparison.rows.forEach(cells=>{
      const row=make('tr');row.setAttribute('role','row');
      cells.forEach((copy,index)=>{
        const cell=make(index?'td':'th');
        if(Array.isArray(copy)){const list=make('ul');copy.forEach(point=>list.append(make('li',point)));cell.append(list);}else cell.textContent=copy;
        cell.setAttribute('role',index?'cell':'rowheader');if(!index)cell.scope='row';else cell.dataset.label=comparison.headers[index];row.append(cell);
      });body.append(row);
    });table.append(body);section.append(table,make('p',comparison.note,'aip-comparison-note'));
    if(comparison.techniqueTitle)section.append(make('h4',comparison.techniqueTitle));
    if(comparison.techniques?.length){const definitions=make('dl');comparison.techniques.forEach(item=>definitions.append(make('dt',item.title),make('dd',item.body)));section.append(definitions);}
    if(comparison.techniqueNote)section.append(make('p',comparison.techniqueNote,'aip-comparison-note'));
    const sources=make('p',undefined,'aip-comparison-sources');sources.append(document.createTextNode('References: '));
    comparison.sources.forEach((source,index)=>{if(index)sources.append(document.createTextNode(' · '));const link=make('a',source.title);link.href=source.url;sources.append(link);});section.append(sources);return section;
  }
  function renderInlineTraps(ids){
    const list=get('inline-traps');list.replaceChildren();
    // Keep exact distinctions available without rendering an unrelated full archive.
    [...new Set(ids)].slice(0,3).forEach(id=>{
      const row=traps.get(id);if(!row)return;
      const item=make('div',undefined,'aip-recap-distinction');item.dataset.trapId=id;
      item.append(make('h5',plain(row.cells[0])));
      const content=make('dl');
      row.cells.slice(1).forEach((cell,index)=>{
        if(row.headings[index+1]==='More detail')return;
        content.append(make('dt',row.headings[index+1]),make('dd',plain(cell)));
      });item.append(content);list.append(item);
    });
  }
  function setBoundaryContent(conceptId,nodeIds,rule){
    get('boundary-content').hidden=false;get('boundary-rule').textContent=rule;
    const precise=data.boundaryLinks.concepts[conceptId];
    const ids=precise||nodeIds.flatMap(id=>data.boundaryLinks.nodes[id]||[]);
    renderInlineTraps(ids);
  }
  function shortPath(path,id){
    const index=path.steps.findIndex(step=>step.id===id),steps=path.steps.slice(Math.max(0,index-4),index+1);
    if(steps.length<2)return;
    const wrap=make('div',undefined,'aip-local-path');wrap.append(make('p','Trace left from the highlighted checkpoint to check its inputs.'));
    const flow=make('ol');steps.forEach(step=>{
      const item=make('li',step.label,step.id===id?'is-failed':'');
      if(step.id===id)item.setAttribute('aria-label',`${step.label}: investigation checkpoint`);flow.append(item);
    });wrap.append(flow);investigation.append(wrap);
  }
  function resetContext(){
    get('symptom-overlay').append(get('boundary-content'));
    context=null;diagnosis=null;selectedMap=null;availableScenarios.clear();scenario.replaceChildren(make('option','Choose a situation'));
    map.querySelector('.aip-diagnostic-controls').hidden=true;investigation.hidden=true;investigation.replaceChildren();
    get('boundary-content').hidden=true;get('inline-traps').replaceChildren();
    explanation.replaceChildren(make('p','Select a box in the map to study its purpose and related situations.'));mapState();
  }
  function isWithin(id,parent){
    for(let item=concepts.get(id);item;item=concepts.get(item.parent))if(item.id===parent)return true;
    return false;
  }
  function setSituations(conceptId,nodeId){
    availableScenarios=new Map();scenario.replaceChildren(make('option','Choose a situation'));scenario.options[0].value='';
    const add=(entry,group)=>{
      let position=availableScenarios.size+1,letter='';
      while(position>0){position--;letter=String.fromCharCode(65+position%26)+letter;position=Math.floor(position/26);}
      availableScenarios.set(entry.value,entry);const option=make('option',`${letter} — ${entry.title}`);option.value=entry.value;group.append(option);
    };
    const wholeLayer=conceptId===nodeById.get(nodeId).concept;
    const related=new Set(data.stageScenarioLinks?.[conceptId]||[]);
    (data.stageScenarios||[]).filter(item=>wholeLayer&&item.node===nodeId).forEach(item=>add({...item,value:'design:'+item.id},scenario));
    for(const [key,path] of Object.entries(data.diagnostics.paths)){
      const preferred=new Map(path.symptoms||[]),group=make('optgroup');group.label=path.title;
      path.steps.filter(step=>related.has(key+':'+step.id)||(wholeLayer&&owners(step.id).includes(nodeId))||isWithin(step.id,conceptId)).forEach(step=>{
        add({value:key+':'+step.id,key,id:step.id,title:step.title||preferred.get(step.id)||step.label,step,path},group);
      });if(group.children.length)scenario.append(group);
    }
    get('scenario-label').textContent=`Situations at ${context.title}`;
    map.querySelector('.aip-diagnostic-controls').hidden=availableScenarios.size===0;
  }
  function chooseScenario(){
    if(!context)return;
    get('symptom-overlay').append(get('boundary-content'));
    investigation.replaceChildren();investigation.hidden=!scenario.value;
    if(!scenario.value){
      diagnosis=null;get('boundary-content').hidden=true;get('inline-traps').replaceChildren();mapState();return;
    }
    const entry=availableScenarios.get(scenario.value);if(!entry)return;
    const {step,path,key}=entry;
    const id=step?step.id:entry.id;
    const highlights=step?owners(id):entry.highlights;
    diagnosis={id,highlights};mapState();
    investigation.append(fieldBlock('Situation',step?data.diagnostics.symptoms[key][id]:entry.situation));
    const locations=make('p',undefined,'aip-highlight-locations');locations.append(make('span','Investigation points in the map: '));
    highlights.forEach((id,index)=>{if(index)locations.append(document.createTextNode(' · '));const link=make('a',nodeById.get(id).title+' ↑');link.href='#map-'+id;link.addEventListener('click',event=>{event.preventDefault();const target=document.getElementById('map-'+id);target.scrollIntoView({block:'center',inline:'center'});target.focus({preventScroll:true});});locations.append(link);});
    investigation.append(locations);if(path)shortPath(path,id);
    const grid=make('div',undefined,'aip-investigation-grid');
    grid.append(fieldBlock('What this means',step?(step.meaning||data.diagnostics.meanings[id]):entry.meaning),fieldBlock('Inspect the evidence',step?step.evidence:entry.evidence));
    investigation.append(grid);
    const walkthrough=step?step.walkthrough:entry.walkthrough;
    if(walkthrough?.length){
      const section=make('div',undefined,'aip-situation-walkthrough');section.append(make('h4','Walk through the decision'));
      const list=make('ol');walkthrough.forEach(copy=>list.append(make('li',copy)));section.append(list);investigation.append(section);
    }
    const capabilities=step?step.capabilities:entry.capabilities;
    if(capabilities?.length){
      const section=make('div',undefined,'aip-situation-capabilities');section.append(make('h4','AWS capabilities that fit'));
      const list=make('ul');capabilities.forEach(copy=>list.append(make('li',copy)));section.append(list);investigation.append(section);
    }
    if(step)setBoundaryContent(id,highlights,step.rule);
    else{get('boundary-content').hidden=false;get('boundary-rule').textContent=entry.rule;renderInlineTraps(entry.traps);}
    investigation.append(get('boundary-content'));
  }
  function showBoundary(conceptId,nodeId){
    const item=concepts.get(conceptId);if(!item)return;
    diagnosis=null;selectedMap=nodeId||owners(conceptId)[0];
    context={conceptId,nodeId:selectedMap,title:nodeId?nodeById.get(nodeId).title:item.title};
    // Keep the selected stage above the situation; choosing a case never changes it.
    const boundary=get('boundary-content');get('symptom-overlay').append(boundary);
    const purpose=fieldBlock('Purpose',item.summary);
    if(item.purposeTemplate){
      const template=document.getElementById(item.purposeTemplate);
      if(template)purpose.append(template.content.cloneNode(true));
    }
    explanation.replaceChildren(make('h3',`Decisions at ${context.title}`),purpose);
    if(item.detailTemplate){
      const template=document.getElementById(item.detailTemplate);
      if(template)explanation.append(template.content.cloneNode(true));
    }
    if(item.example&&!item.comparison)explanation.append(fieldBlock('Example',item.example));
    if(item.comparison)explanation.append(comparisonBlock(item.comparison));
    (item.additionalComparisons||[]).forEach(comparison=>explanation.append(comparisonBlock(comparison)));
    (item.inlineConcepts||[]).forEach(id=>{
      const inline=concepts.get(id);if(!inline)return;
      explanation.append(fieldBlock(inline.title,inline.summary));
      if(inline.comparison)explanation.append(comparisonBlock(inline.comparison));
      (inline.additionalComparisons||[]).forEach(comparison=>explanation.append(comparisonBlock(comparison)));
    });
    const children=data.concepts.filter(child=>child.parent===conceptId&&!(item.inlineConcepts||[]).includes(child.id));
    if(children.length&&!['system','lifecycle'].includes(conceptId)){
      const hierarchy=make('nav',undefined,'aip-concept-links');hierarchy.setAttribute('aria-label','Related substeps');hierarchy.append(make('span','Substeps: '));
      children.forEach(child=>{const link=make('a',child.title);link.href='#concept-'+child.id;link.dataset.concept=child.id;link.addEventListener('click',event=>{event.preventDefault();showBoundary(child.id);});hierarchy.append(link);});explanation.append(hierarchy);
    }
    if(item.questions){const checklist=make('div',undefined,'aip-requirement-checklist');checklist.append(make('h4','Requirements to pin down'));const list=make('ul');item.questions.forEach(question=>list.append(make('li',question)));checklist.append(list);explanation.append(checklist);}
    if(!item.detailTemplate){
      const grid=make('div',undefined,'aip-investigation-grid');
      grid.append(fieldBlock(item.decision?'Decision to make':'Requirement to satisfy',item.decision||inherited(conceptId,'constraint')));explanation.append(grid);
      const reasoning=make('details',undefined,'aip-layer-reasoning');reasoning.append(make('summary','What is managed, what can be extended, and what must I own?'));
      [['AWS manages','managed'],['Supported extension','extension'],['Custom ownership','ownership'],['AWS capabilities that fit','capability'],['Exam clue','clue'],['Boundary to remember','trap']].forEach(([label,key])=>{const copy=inherited(conceptId,key);if(copy)reasoning.append(fieldBlock(label,copy));});explanation.append(reasoning);
    }
    if(item.parent&&!['system','lifecycle'].includes(item.parent)){const parent=make('a',`← ${concepts.get(item.parent).title}`);parent.href='#concept-'+item.parent;parent.addEventListener('click',event=>{event.preventDefault();showBoundary(item.parent);});explanation.append(parent);}
    setSituations(conceptId,selectedMap);chooseScenario();
  }
  map.querySelectorAll('.map-link').forEach(link=>link.addEventListener('click',event=>{
    event.preventDefault();showBoundary(link.dataset.concept,link.id.slice(4));
  }));
  get('show-services').addEventListener('click',()=>{
    const enabled=map.dataset.services!=='true';map.dataset.services=String(enabled);
    get('show-services').setAttribute('aria-pressed',String(enabled));get('show-services').textContent=enabled?'Hide AWS services':'Show AWS services';
    map.querySelectorAll('.map-services').forEach(node=>node.setAttribute('aria-hidden',String(!enabled)));
    map.querySelectorAll('.map-principle').forEach(node=>node.setAttribute('aria-hidden',String(enabled)));
  });
  scenario.addEventListener('change',chooseScenario);
  map.querySelector('.aip-map-mode').hidden=false;
  map.querySelector('.aip-diagnostic-fallback').hidden=true;map.querySelector('.aip-map-fallback').hidden=true;explanation.hidden=false;resetContext();
  route();
})();
