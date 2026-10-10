(() => {
  'use strict';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const set = (id,v) => {$(id).textContent=v;};
  const URL_APP = 'https://evgk724.github.io/lithos-atlas/';
  const STORE = 'lithos-learning-v1';
  let progress = {}, storageWarning=false, toastTimer, review=null, expanded=null;
  let wonderId='khufu',view='exterior',mode='atlas',range='all';
  const readURL = () => {
    const p = new URLSearchParams(location.search);
    wonderId = BY_ID[p.get('wonder')] ? p.get('wonder') : 'khufu';
    view = ['exterior','structure','timeline','map'].includes(p.get('view')) ? p.get('view') : 'exterior';
    mode = p.get('mode') === 'learn' ? 'learn' : 'atlas';
  };
  readURL();
  try {progress=Learning.clean(JSON.parse(localStorage.getItem(STORE)));} catch { /* A new or unavailable store starts without invented history. */ }
  function toast(message) {set('#toast',message);$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),4500);}
  function saveProgress() {
    try {localStorage.setItem(STORE,JSON.stringify({version:1,cards:progress}));window.atlasHasUnsavedProgress=false;}
    catch {window.atlasHasUnsavedProgress=true;if(!storageWarning){toast('Браузер не разрешил сохранение. Прогресс доступен до закрытия страницы.');storageWarning=true;}}
  }
  function writeURL() {
    const p=new URLSearchParams({wonder:wonderId,view});if(mode==='learn')p.set('mode','learn');
    try {history.replaceState(null,'',`${location.pathname}?${p}`);} catch { /* Local HTML may disallow history writes. */ }
  }
  const goTop = () => $('.utility-bar').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  function showMode(next,scroll=true) {
    if(expanded)toggleExpand();mode=next;
    $('#atlas-view').hidden=mode!=='atlas';$('#learn-view').hidden=mode!=='learn';
    $$('.main-nav button').forEach(b=>{b.classList.toggle('active',b.dataset.mode===mode);if(b.dataset.mode===mode)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
    if(mode==='learn')updateReviewOverview();
    document.title = mode==='learn' ? 'Запоминание — LITHOS' : `${BY_ID[wonderId].name} — LITHOS`;
    writeURL();if(scroll)goTop();
  }
  function renderGrid() {
    const searchKey=s=>s.toLocaleLowerCase('ru').replace(/ё/g,'е').replace(/[\s\-–—]/g,'');
    const query=searchKey($('#wonder-search').value.trim());
    const list=WONDERS.filter(w=>(range==='all'||w.group===range)&&[w.name,w.nameEn,w.city,w.modernCountry,w.eraShort,...(w.aliases||[])].some(t=>searchKey(t).includes(query)));
    $('#wonder-grid').innerHTML=list.map(w=>`<button type='button' class='wonder-card${w.id===wonderId?' selected':''}' data-wonder='${w.id}' aria-pressed='${w.id===wonderId}' aria-label='${esc(w.name)}, ${esc(w.city)}'><span class='wonder-card-number'>${String(w.order).padStart(2,'0')} / ${WONDERS.length}</span><div class='wonder-card-visual' aria-hidden='true'>${wonderMini(w.id)}</div><strong class='wonder-card-name'>${esc(w.shortName)}</strong><span class='wonder-card-alt'>${esc(w.eraShort)}</span><span class='wonder-card-range'>${esc(w.city)} · ${esc(w.modernCountry)}</span></button>`).join('');
    $('#empty-search').hidden=list.length>0;
  }
  function renderWonder(){
    const w=BY_ID[wonderId];
    set('#wonder-rank',`${String(w.order).padStart(2,'0')} / ${WONDERS.length} СООРУЖЕНИЙ`);set('#wonder-range',groupName(w).toLocaleUpperCase('ru'));
    set('#wonder-name',w.name);$('#wonder-name').classList.toggle('long-title',w.name.length>12);
    set('#wonder-english',w.nameEn);set('#wonder-summary',w.summary);
    set('#wonder-era',w.eraShort);set('#wonder-city',w.city);set('#wonder-location',w.location);
    set('.hero-stats>div:first-child span','датировка выбранной фазы');
    set('.hero-stats>div:nth-child(2) span',w.modernCountry);
    $('#evidence-status').innerHTML=`<strong>${esc(w.statusLabel)}</strong>${esc(w.statusText)}`;
    set('#detail-heading',w.shortName);set('#anchor-title',w.anchor);set('#anchor-text',memoryText(w));
    set('#history-era',w.eraLabel);set('#history-builders',w.builders);set('#history-note',w.dateNote);
    set('#engineering-title',w.engineeringTitle);set('#engineering-text',w.engineering);
    $('#facts-grid').innerHTML=w.facts.map((f,i)=>`<article class='fact-item'><span>${String(i+1).padStart(2,'0')}</span><h3>${esc(w.titles[i])}</h3><p>${esc(f)}</p></article>`).join('');
    set('#established-text',w.established);set('#hypothesis-text',w.hypothesis);set('#open-question',w.openQuestion);set('#uncertainty-text',w.uncertainty.text);
    set('#pair-title',w.pairTitle);set('#pair-text',w.pairText);set('#pair-button',`${BY_ID[w.pair].shortName} →`);
    Engineering.renderMetrics(w.id,w.shortName);Engineering.renderDossier(w.id);
    $('.view-tabs [data-view="exterior"]').textContent=w.id==='barabar'?'План':'Облик';$('.view-tabs [data-view="structure"]').textContent=w.id==='barabar'?'Разрез':'Устройство';
    renderViewer();renderGrid();if(mode==='atlas')document.title=`${w.shortName} — LITHOS`;
  }
  function chooseWonder(id,scroll=false){if(!BY_ID[id])return;wonderId=id;renderWonder();writeURL();if(scroll&&!expanded)goTop();}
  const mapPositions={khufu:[530,437],osireion:[580,578],serapeum:[405,491],baalbek:[735,373],gobekli:[742,259],stonehenge:[265,234],newgrange:[109,153],hagarqim:[345,355],pumapunku:[883,458],petra:[714,496],barabar:[907,187],obelisk:[703,583]};
  function mapDrawing(){
    const project=w=>w.id==='pumapunku'?[874,426]:w.id==='barabar'?[880,145]:[65+(w.lon+15)*11,70+(65-w.lat)*10];
    const lines=[-10,0,10,20,30,40,50].map(l=>{const x=65+(l+15)*11;return `<path d='M${x} 65V602'/><text x='${x+5}' y='630' class='map-degree'>${Math.abs(l)}°${l<0?'W':'E'}</text>`;}).join('')+[20,30,40,50,60].map(l=>{const y=70+(65-l)*10;return `<path d='M45 ${y}H810'/><text x='3' y='${y+5}' class='map-degree'>${l}°N</text>`;}).join('');
    const dots=WONDERS.map(w=>{const [x,y]=project(w),[lx,ly]=mapPositions[w.id],active=w.id===wonderId;return `<g class='map-dot${active?' active':''}' data-map-wonder='${w.id}' role='button' tabindex='0' aria-label='${w.order}. ${esc(w.shortName)}, ${esc(w.city)}' aria-pressed='${active}'><path d='M${x} ${y}L${lx} ${ly}' stroke='${active?'#67f2cd':'#52756c'}' stroke-width='${active?2.5:1.5}'/><circle cx='${x}' cy='${y}' r='${active?8:5}' fill='${active?'#67f2cd':'#efa878'}'/><circle class='map-hit' cx='${lx}' cy='${ly}' r='40'/><circle class='map-badge' cx='${lx}' cy='${ly}' r='28'/><text x='${lx}' y='${ly+1}'>${w.order}</text></g>`;}).join('');
    return `<svg viewBox='0 0 1000 650' role='group' aria-label='Карта-схема расположения ${WONDERS.length} сооружений. Барабар и Пума-Пунку показаны на отдельных врезках.'><g stroke='#50776840' stroke-dasharray='3 7'>${lines}</g><text x='62' y='39' class='map-caption'>ЕВРОПА · СЕВЕР АФРИКИ · ЗАПАДНАЯ АЗИЯ</text><text x='360' y='242' class='map-caption'>СЕВЕР ↑</text><rect x='827' y='70' width='162' height='214' rx='6' fill='#0d211d' stroke='#497266'/><text x='844' y='107' class='map-caption'>ИНДИЯ</text><text x='842' y='258' class='map-degree'>25°N · 85°E</text><rect x='827' y='310' width='162' height='270' rx='6' fill='#0d211d' stroke='#497266'/><text x='844' y='345' class='map-caption'>АНДЫ</text><text x='844' y='377' class='map-degree'>БОЛИВИЯ</text><text x='842' y='541' class='map-degree'>16°S · 69°W</text>${dots}</svg>`;
  }
  function renderViewer(){
    const w=BY_ID[wonderId],content=$('#viewer-content'),top=content.querySelector('.height-chart')?.scrollTop||0;
    $$('.view-tabs button').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);b.setAttribute('aria-pressed',String(b.dataset.view===view));});
    set('#viewer-code',`${Math.abs(w.lat).toFixed(2)}°${w.lat<0?'S':'N'} / ${Math.abs(w.lon).toFixed(2)}°${w.lon<0?'W':'E'}`);$('#diagram-key').hidden=view==='timeline';$('#diagram-key').classList.toggle('map-index',view==='map');$('#diagram-key').setAttribute('aria-label',view==='map'?'Выбрать сооружение на карте':'Подписи схемы');
    if(view==='exterior'||view==='structure'){
      set('#viewer-title',w.id==='barabar'?(view==='exterior'?'СУДАМА · ПЛАН':'СУДАМА · ПРОДОЛЬНЫЙ РАЗРЕЗ'):(view==='exterior'?'АРХИТЕКТУРНЫЙ ОБРАЗ':'КАК ЭТО УСТРОЕНО'));content.innerHTML=wonderDrawing(w,view);
      const labels=[...content.querySelectorAll('svg text')].map(t=>t.querySelectorAll('tspan').length?[...t.querySelectorAll('tspan')].map(s=>s.textContent).join(' '):t.textContent);
      $('#diagram-key').innerHTML=labels.map(t=>`<li>${esc(t)}</li>`).join('');
      const note=content.querySelector('svg desc')?.textContent||'Учебная инженерная схема. Пропорции и детали упрощены; утраченные части показаны условно.';
      set('#viewer-note',note);
    }else if(view==='timeline'){
      set('#viewer-title',`${WONDERS.length} СООРУЖЕНИЙ ВО ВРЕМЕНИ`);
      content.innerHTML=`<div class='height-chart' tabindex='0' aria-label='Хронология ${WONDERS.length} сооружений. Прокручиваемый список.'><p class='chart-intro'>От более раннего к более позднему.<br>Даты приблизительные; интервалы между строками не обозначают длительность.</p>${[...WONDERS].sort((a,b)=>a.dateSort-b.dateSort).map(p=>`<button type='button' class='timeline-row${p.id===wonderId?' active':''}' data-time-wonder='${p.id}' aria-pressed='${p.id===wonderId}'><span class='timeline-era'>${esc(p.eraShort)}</span><span class='timeline-name'>${esc(p.shortName)}<span class='timeline-city'>${esc(p.city)}</span></span></button>`).join('')}</div>`;
      content.querySelector('.height-chart').scrollTop=top;
      set('#viewer-note','Даты относятся к разным строительным фазам; подробности указаны в карточках. Строки упорядочены по времени, расстояния между ними не отражают длительность.');
    }else{
      set('#viewer-title','ГЕОГРАФИЯ СООРУЖЕНИЙ');content.innerHTML=mapDrawing();
      $('#diagram-key').innerHTML=WONDERS.map(p=>`<li><button type='button' data-map-select='${p.id}' aria-pressed='${p.id===wonderId}'><span>${p.order}</span> ${esc(p.shortName)}</button></li>`).join('');
      set('#viewer-note',`${w.order}. ${w.shortName} · ${w.city}. Номера соответствуют карточкам. Барабар и Пума-Пунку — на врезках Индии и Анд; их масштабы отличаются от основной карты.`);
    }
  }

  function toggleExpand() {
    const viewer=$('#viewer'),button=$('#expand-viewer');
    if(!expanded){
      const placeholder=document.createComment('viewer');viewer.before(placeholder);document.body.append(viewer);
      const siblings=[...document.body.children].filter(e=>e!==viewer&&!['SCRIPT','STYLE'].includes(e.tagName));
      expanded={placeholder,siblings:siblings.map(e=>[e,e.inert]),overflow:document.body.style.overflow};
      siblings.forEach(e=>e.inert=true);document.body.style.overflow='hidden';viewer.classList.add('expanded');viewer.setAttribute('role','dialog');viewer.setAttribute('aria-modal','true');viewer.setAttribute('aria-label','Развёрнутая иллюстрация');
      button.setAttribute('aria-expanded','true');button.setAttribute('aria-label','Свернуть иллюстрацию');button.focus();
    }else{
      expanded.placeholder.replaceWith(viewer);expanded.siblings.forEach(([e,value])=>e.inert=value);document.body.style.overflow=expanded.overflow;expanded=null;
      viewer.classList.remove('expanded');['role','aria-modal','aria-label'].forEach(a=>viewer.removeAttribute(a));button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','Развернуть иллюстрацию');button.focus();
    }
  }
  function showSources(id=wonderId){
    const w=BY_ID[id];
    const group=(title,sources)=>`<section class='source-group'><h3>${esc(title)}</h3>${sources.map(s=>`<a class='source-link' href='${esc(s.url)}' target='_blank' rel='noopener noreferrer'><strong>${esc(s.title)} ↗</strong><span>${esc(s.supports)}</span></a>`).join('')}</section>`;
    $('#sources-list').innerHTML=`<p class='height-note'>${esc(w.uncertainty.text)}</p>${group(w.name,[...w.sources,...Engineering.sources(w.id)].filter((s,i,a)=>a.findIndex(x=>x.url===s.url)===i))}${group('Археологический контекст',RESEARCH.meta.generalSources)}`;
    set('#source-policy','Источники сверены 10 октября 2026. Даты приблизительны и относятся к указанной строительной фазе. Иллюстрации упрощают форму памятников; утраченные части и спорные детали показаны условно. Ассоциации созданы для обучения.');
    openDialog($('#sources-dialog'));
  }

  function openDialog(dialog) {dialog.showModal();dialog.scrollTop=0;}
  const selectedCards=()=>Learning.select($('#study-topic').value,$('#study-wonder').value);
  const plural=(n,one,few,many)=>n%100>=11&&n%100<=14?many:n%10===1?one:n%10>=2&&n%10<=4?few:many;
  const relativeTime = date => {
    const minutes=Math.ceil((date-Date.now())/60000);
    if(minutes<=0)return 'сейчас';
    if(minutes<60)return `через ${minutes} ${plural(minutes,'минуту','минуты','минут')}`;
    return new Date(date).toLocaleString('ru-RU',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'});
  };
  function updateReviewOverview() {
    const allDue=Learning.due(Learning.cards,progress).length;
    set('#nav-due',allDue);set('#due-count',allDue);set('#seen-count',Object.keys(progress).length);
    const selected=selectedCards(),due=Learning.due(selected,progress);
    set('#review-ready-title',due.length?`${due.length} ${plural(due.length,'карточка готова','карточки готовы','карточек готовы')} к повторению`:'Подборка повторена');
    const next=Math.min(...selected.map(c=>progress[c.id]?.due??Date.now()));
    set('#review-ready-note',due.length?'Отвечайте в своём темпе. Можно остановиться после любой карточки.':`Следующее повторение — ${relativeTime(next)}. При желании можно повторить всю подборку сейчас.`);
    $('#start-review').disabled=!due.length;
  }
  function intervalLabel(card,value) {
    const days=Learning.interval(progress[card.id],value).delay/86400000;
    return `через ${days} ${plural(days,'день','дня','дней')}`;
  }
  function renderCard() {
    const card=review.queue[review.index],text=Learning.content(card),m=BY_ID[card.wonderId];
    review.revealed=false;
    set('#session-position',`${review.index+1} / ${review.queue.length}`);$('#session-progress-bar').style.width=`${review.index/review.queue.length*100}%`;
    set('#card-topic',`${Learning.TOPICS[card.topic].toLocaleUpperCase('ru')} / ВСПОМНИТЬ САМОСТОЯТЕЛЬНО`);
    set('#card-question',text.question);set('#card-hint',text.hint);set('#card-answer',text.answer);set('#card-answer-detail',text.detail);set('#card-anchor',memoryText(m));
    $('#card-answer').classList.toggle('long-answer',text.answer.length>55);
    $('#card-back').hidden=true;$('#card-front').hidden=false;$('#rating-buttons').hidden=true;$('#reveal-answer').setAttribute('aria-expanded','false');
    set('#good-interval',intervalLabel(card,'good'));set('#easy-interval',intervalLabel(card,'easy'));
  }
  function startReview(all=false) {
    const selected=selectedCards();
    // Separate successive topics to avoid immediately giving away the next answer.
    const order=c=>Object.keys(Learning.TOPICS).indexOf(c.topic)*100+BY_ID[c.wonderId].order;
    const queue=(all?selected:Learning.due(selected,progress)).sort((a,b)=>order(a)-order(b));
    if(!queue.length){updateReviewOverview();return;}
    review={queue,index:0,revealed:false};$('#learn-overview').hidden=true;$('#review-complete').hidden=true;$('#review-session').hidden=false;renderCard();
    $('#review-session').scrollIntoView({block:'start',behavior:'smooth'});$('#reveal-answer').focus({preventScroll:true});
  }
  function overview(scroll=true) {
    review=null;$('#learn-overview').hidden=false;$('#review-session').hidden=true;$('#review-complete').hidden=true;updateReviewOverview();if(scroll)goTop();
  }
  function reveal() {
    if(!review)return;review.revealed=true;$('#card-back').hidden=false;$('#card-front').hidden=true;$('#rating-buttons').hidden=false;$('#reveal-answer').setAttribute('aria-expanded','true');
    $('[data-grade="again"]').focus({preventScroll:true});
  }
  function rate(value) {
    if(!review||!review.revealed)return;
    const card=review.queue[review.index];progress[card.id]=Learning.grade(progress[card.id],value);saveProgress();review.index++;updateReviewOverview();
    if(review.index>=review.queue.length){
      $('#review-session').hidden=true;$('#review-complete').hidden=false;
      const next=Math.min(...review.queue.map(c=>progress[c.id].due));
      set('#review-summary',`Вы повторили ${review.queue.length} ${plural(review.queue.length,'карточку','карточки','карточек')}. Ближайший возврат к ним — ${relativeTime(next)}. Можно закончить на сегодня или выбрать другую тему.`);
      $('#return-overview').focus({preventScroll:true});$('#review-complete').scrollIntoView({block:'start',behavior:'smooth'});review=null;
    }else{renderCard();$('#reveal-answer').focus({preventScroll:true});$('#review-session').scrollIntoView({block:'start',behavior:'smooth'});}
  }
  $$('#study-wonder').forEach(select=>WONDERS.forEach(m=>select.add(new Option(m.name,m.id))));
  $('#text-size').value=document.documentElement.dataset.textSize;
  $('#text-size').addEventListener('change',e=>{document.documentElement.dataset.textSize=e.target.value;try{localStorage.setItem('lithos-text-size',e.target.value);}catch{toast('Размер изменён. Браузер не разрешил сохранить настройку.');}});
  $$('[data-mode]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();showMode(b.dataset.mode);}));
  $$('.view-tabs button').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.view;renderViewer();writeURL();}));
  $('#expand-viewer').addEventListener('click',toggleExpand);
  $('#wonder-grid').addEventListener('click',e=>{const b=e.target.closest('[data-wonder]');if(b)chooseWonder(b.dataset.wonder,true);});
  $('#viewer-content').addEventListener('click',e=>{const b=e.target.closest('[data-map-wonder],[data-time-wonder]');if(b){const id=b.dataset.mapWonder||b.dataset.timeWonder;chooseWonder(id);const target=$(`[data-map-wonder="${id}"],[data-time-wonder="${id}"]`);target?.focus({preventScroll:true});}});
  $('#viewer-content').addEventListener('keydown',e=>{const b=e.target.closest('[data-map-wonder]');if(b&&['Enter',' '].includes(e.key)){e.preventDefault();b.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
  $('#diagram-key').addEventListener('click',e=>{const b=e.target.closest('[data-map-select]');if(b){const id=b.dataset.mapSelect;chooseWonder(id);$(`[data-map-select="${id}"]`)?.focus({preventScroll:true});}});
  $$('.range-filters button').forEach(b=>b.addEventListener('click',()=>{range=b.dataset.range;$$('.range-filters button').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});renderGrid();}));
  $('#wonder-search').addEventListener('input',renderGrid);
  $('#reset-search').addEventListener('click',()=>{$('#wonder-search').value='';$('[data-range="all"]').click();$('#wonder-search').focus();});
  $('#pair-button').addEventListener('click',()=>chooseWonder(BY_ID[wonderId].pair,true));
  $('#remember-wonder').addEventListener('click',()=>{overview(false);$('#study-wonder').value=wonderId;$('#study-topic').value='all';showMode('learn');});
  $$('.sources-trigger').forEach(b=>b.addEventListener('click',()=>showSources(review?.queue[review.index]?.wonderId||wonderId)));
  $('#answer-source').addEventListener('click',()=>showSources(review.queue[review.index].wonderId));
  $$('.qr-trigger').forEach(b=>b.addEventListener('click',()=>openDialog($('#qr-dialog'))));
  $('#about-button').addEventListener('click',()=>openDialog($('#about-dialog')));
  $$('.close-dialog').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
  $$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
  $('#copy-link').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(URL_APP);set('#copy-link','Ссылка скопирована ✓');setTimeout(()=>set('#copy-link','Скопировать ссылку ↗'),3000);}catch{const node=$('.qr-url'),selection=getSelection(),r=document.createRange();r.selectNodeContents(node);selection.removeAllRanges();selection.addRange(r);toast('Ссылка выделена — скопируйте её обычным способом.');}});
  ['#study-topic','#study-wonder'].forEach(id=>$(id).addEventListener('change',updateReviewOverview));
  $('#start-review').addEventListener('click',()=>startReview());$('#practice-all').addEventListener('click',()=>startReview(true));
  $('#reveal-answer').addEventListener('click',reveal);$$('[data-grade]').forEach(b=>b.addEventListener('click',()=>rate(b.dataset.grade)));
  $('#end-review').addEventListener('click',()=>overview());$('#return-overview').addEventListener('click',()=>overview());
  document.addEventListener('keydown',e=>{
    if(!expanded)return;
    if(e.key==='Escape'){e.preventDefault();toggleExpand();return;}
    if(e.key==='Tab'){
      const focusable=[...$('#viewer').querySelectorAll('button,[tabindex="0"]')].filter(e=>e.getClientRects().length);
      const first=focusable[0],last=focusable.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
  addEventListener('popstate',()=>{readURL();renderWonder();showMode(mode,false);});
  addEventListener('storage',e=>{if(e.key===STORE){try{progress=Learning.clean(JSON.parse(e.newValue));updateReviewOverview();}catch{}}});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateReviewOverview();});
  setInterval(()=>{if(!document.hidden)updateReviewOverview();},60000);
  renderWonder();showMode(mode,false);updateReviewOverview();
})();
