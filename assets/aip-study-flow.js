/* Architecture decisions and evidence-led diagnostics. No network or storage. */
(() => {
  'use strict';
  const map=document.getElementById('genai-map');
  if(!map)return;
  const get=id=>document.getElementById(`aip-${id}`);
  const openAncestors=node=>{for(let parent=node;parent;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;};
  function route(){
    const id=decodeURIComponent(location.hash.slice(1));
    if(!id){scenario.value='';chooseScenario();return;}
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
  const scenarioFamily=get('diagnostic-family'),scenario=get('diagnostic-scenario'),investigation=get('investigation');
  let selectedMap=null,diagnosis=null;
  const make=(tag,copy,cls)=>{const node=document.createElement(tag);if(copy!==undefined)node.textContent=copy;if(cls)node.className=cls;return node;};
  function inherited(id,key){for(let item=concepts.get(id);item;item=concepts.get(item.parent))if(item[key])return item[key];return '';}
  const directOwners={
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
    const suspects=diagnosis?owners(diagnosis.id):[];
    map.querySelectorAll('.map-link').forEach(node=>{
      node.classList.toggle('is-failed',suspects.includes(node.id.slice(4)));
      node.classList.toggle('is-selected',!diagnosis&&node.id===`map-${selectedMap}`);
      const title=nodeById.get(node.id.slice(4)).title;
      node.setAttribute('aria-label',`${title}${suspects.includes(node.id.slice(4))?' — investigation point':''}: inspect decisions`);
    });
  }
  function fieldBlock(label,copy){const section=make('div');section.append(make('h4',label),make('p',copy));return section;}
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
    const wrap=make('div',undefined,'aip-local-path');wrap.append(make('p','Trace left from the highlighted checkpoint to check its inputs.'));
    const flow=make('ol');steps.forEach(step=>{
      const item=make('li',step.label,step.id===id?'is-failed':'');
      if(step.id===id)item.setAttribute('aria-label',`${step.label}: investigation checkpoint`);flow.append(item);
    });wrap.append(flow);investigation.append(wrap);
  }
  function chooseScenario(){
    if(!scenario.value){diagnosis=null;selectedMap=null;get('boundary-content').hidden=true;get('inline-traps').replaceChildren();mapState();investigation.replaceChildren(make('p','Choose an observed situation, or select a responsibility in the map.'));return;}
    const key=scenarioFamily.value,path=data.diagnostics.paths[key],step=path.steps.find(step=>step.id===scenario.value);if(!step)return;
    diagnosis={key,id:step.id};selectedMap=null;
    setBoundaryContent(step.id,owners(step.id),step.rule);
    mapState();investigation.replaceChildren(make('h3',`${path.title} · ${step.label}`));
    const situation=data.diagnostics.symptoms[key][step.id];
    investigation.append(fieldBlock('Situation',situation));
    const locations=make('p',undefined,'aip-highlight-locations');locations.append(make('span','Investigation points in the map: '));
    owners(step.id).forEach((id,index)=>{if(index)locations.append(document.createTextNode(' · '));const link=make('a',nodeById.get(id).title+' ↑');link.href='#map-'+id;link.addEventListener('click',event=>{event.preventDefault();const target=document.getElementById('map-'+id);target.scrollIntoView({block:'center',inline:'center'});target.focus({preventScroll:true});});locations.append(link);});
    investigation.append(locations);shortPath(path,step.id);
    const grid=make('div',undefined,'aip-investigation-grid');
    grid.append(fieldBlock('What this means',data.diagnostics.meanings[step.id]),fieldBlock('Inspect the evidence',step.evidence));
    investigation.append(grid);
  }
  function setFamily(){
    scenario.replaceChildren(make('option','Choose an observed situation'));scenario.options[0].value='';
    const key=scenarioFamily.value,path=data.diagnostics.paths[key];
    const preferred=new Map(path.symptoms||[]);
    path.steps.forEach(step=>{
      const option=make('option',preferred.get(step.id)||`${step.label}: ${data.diagnostics.symptoms[key][step.id]}`);option.value=step.id;scenario.append(option);
    });chooseScenario();
  }
  function showBoundary(conceptId,nodeId){
    const item=concepts.get(conceptId);if(!item)return;
    diagnosis=null;scenario.value='';selectedMap=nodeId||owners(conceptId)[0];
    setBoundaryContent(conceptId,[selectedMap],inherited(conceptId,'trap'));
    mapState();investigation.replaceChildren(make('h3',`Decisions at ${item.title}`),make('p',item.summary));
    const children=data.concepts.filter(child=>child.parent===conceptId);
    if(children.length&&!['system','lifecycle'].includes(conceptId)){
      const hierarchy=make('nav',undefined,'aip-concept-links');hierarchy.setAttribute('aria-label','Related substeps');hierarchy.append(make('span','Substeps: '));
      children.forEach(child=>{const link=make('a',child.title);link.href='#concept-'+child.id;link.dataset.concept=child.id;link.addEventListener('click',event=>{event.preventDefault();showBoundary(child.id);});hierarchy.append(link);});investigation.append(hierarchy);
    }
    const grid=make('div',undefined,'aip-investigation-grid');grid.append(fieldBlock('Constraint',inherited(conceptId,'constraint')));investigation.append(grid);
    const reasoning=make('details',undefined,'aip-layer-reasoning');reasoning.append(make('summary','What is managed, what can be extended, and what must I own?'));
    [['AWS manages','managed'],['Supported extension','extension'],['Custom ownership','ownership'],['Capabilities','capability'],['Exam clue','clue']].forEach(([label,key])=>{const copy=inherited(conceptId,key);if(copy)reasoning.append(fieldBlock(label,copy));});investigation.append(reasoning);
    if(item.parent){const parent=make('a',`← ${concepts.get(item.parent).title}`);parent.href='#concept-'+item.parent;parent.addEventListener('click',event=>{event.preventDefault();showBoundary(item.parent);});investigation.append(parent);}
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
  scenarioFamily.addEventListener('change',setFamily);scenario.addEventListener('change',chooseScenario);
  map.querySelector('.aip-map-mode').hidden=false;map.querySelector('.aip-diagnostic-controls').hidden=false;
  map.querySelector('.aip-diagnostic-fallback').hidden=true;map.querySelector('.aip-map-fallback').hidden=true;investigation.hidden=false;setFamily();
  route();
})();
