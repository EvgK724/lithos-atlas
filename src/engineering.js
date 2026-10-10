/* Source-backed engineering notes. Shared by the two standalone atlases. */
const Engineering = (() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const profile = id => ENGINEERING.profiles[id];
  function citations(ids = []) {
    return `<ul class="engineering-sources">${[...new Set(ids)].map(id => {
      const s = ENGINEERING.sources[id];
      return s ? `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a></li>` : '';
    }).join('')}</ul>`;
  }
  function renderMetrics(id, name) {
    const p = profile(id), node = document.querySelector('#engineering-metrics');
    if (!node) return;
    node.hidden = !p;
    if (!p) return;
    node.innerHTML = `<div class="engineering-heading"><span class="eyebrow">МАСШТАБ В ЧИСЛАХ</span><h2>${esc(name)}: масса и размеры</h2><p>≈ означает оценку. Под каждым числом указано, что именно измеряли или рассчитывали.</p></div><div class="metric-grid">${p.metrics.map(m => `<article class="metric-card"><p class="metric-value"><span class="metric-number">${esc(m.value)}</span> <span class="metric-unit">${esc(m.unit)}</span></p><h3>${esc(m.label)}</h3><span class="metric-kind">${esc(m.kind)}</span><details class="metric-details"><summary>Как получено число</summary><p>${esc(m.note)}</p>${citations(m.sources)}</details></article>`).join('')}</div>${p.recall ? `<details class="engineering-recall"><summary><span class="eyebrow">ПОПРОБУЙТЕ ВСПОМНИТЬ</span><span>${esc(p.recall.question)}</span><span class="recall-instruction">Открыть ответ ↓</span></summary><div class="engineering-recall-answer"><strong>${esc(p.recall.answer)}</strong><p>${esc(p.recall.detail)}</p></div></details>` : ''}${p.questions?.length ? '<a class="engineering-jump" href="#engineering-dossier">Разобрать следы и способы строительства ↓</a>' : ''}`;
  }
  function renderDossier(id) {
    const p = profile(id), node = document.querySelector('#engineering-dossier');
    if (!node) return;
    node.hidden = !p?.questions?.length;
    if (node.hidden) { node.innerHTML = ''; return; }
    node.innerHTML = `<div class="engineering-heading"><span class="eyebrow">ВОПРОС → СВИДЕТЕЛЬСТВА → ОБЪЯСНЕНИЕ</span><h2>Как это могли сделать?</h2><p>Проверяем наблюдение и границы объяснения. Неполная реконструкция оставляет вопрос открытым.</p></div>${p.video ? `<article class="engineering-video"><span class="eyebrow">PROTO CIVILIZATION / ПРОТОЦИВИЛИЗАЦИЯ</span><h3>${esc(p.video.title)}</h3><p>${esc(p.video.focus)}</p><a href="${esc(p.video.url)}" target="_blank" rel="noopener noreferrer">Открыть фильм на YouTube ↗</a><p class="engineering-method">Разбор подготовлен по описанию и доступной расшифровке фильма. Точность поверхности по видеокадру здесь не измерялась.</p></article>` : ''}<div class="engineering-questions">${p.questions.map((q, i) => `<details class="engineering-question"><summary><span class="question-index">${String(i + 1).padStart(2,'0')}</span><span>${esc(q.title)}</span></summary><div class="question-body">${q.parts.map(part => `<section class="question-part"><h3>${esc(part.label)}</h3><p>${esc(part.text)}</p></section>`).join('')}${q.diagram ? diagram(q.diagram) : ''}${citations(q.sources)}</div></details>`).join('')}</div>`;
  }
  function diagram(type) {
    if (type === 'sand') return `<figure class="method-diagram"><svg viewBox="0 0 800 330" role="img" aria-label="Условная гипотеза установки обелиска: основание опускается в песчаную воронку, ствол поворачивается к вертикали"><path d="M45 270H750" stroke="#648d81" stroke-width="2"/><path d="M70 270L280 130H385L435 270Z" fill="#423e30" stroke="#b29c70"/><path d="M385 270V130L465 270" fill="#c79956" fill-opacity=".35" stroke="#d7a365" stroke-dasharray="7 5"/><path d="M169 144L430 233L441 212L180 121Z" fill="#52746c" stroke="#7ee8c7" stroke-width="2"/><path d="M420 232L423 35L448 35L446 232Z" fill="#6cf2ca" fill-opacity=".09" stroke="#7ee8c7" stroke-dasharray="8 6"/><path d="M275 96Q335 20 394 43M386 34L394 43L382 48" fill="none" stroke="#efa878" stroke-width="3"/><circle cx="434" cy="237" r="9" fill="#efa878"/><path d="M472 263L530 292M515 274L530 292L507 290" fill="none" stroke="#efa878" stroke-width="3"/></svg><figcaption>Учебная схема гипотезы Engelbach: насыпь → контролируемое опускание основания при удалении песка → поворот ствола. Пунктир — предполагаемое положение. Силы, опоры и страховка здесь не рассчитаны; это не инструкция по подъёму.</figcaption></figure>`;
    if (type === 'path') return `<figure class="method-diagram"><svg viewBox="0 0 800 330" role="img" aria-label="Гипотеза перевозки блока к ряду кладки по подготовленному пути: длинный подъезд уменьшает необходимый вертикальный подъём"><path d="M45 265L410 164H485V265Z" fill="#423e30" stroke="#b29c70"/><path d="M485 164H748V265H485Z" fill="#273f3b" stroke="#78ac98"/><path d="M485 214H748M576 165V214M654 214V265" stroke="#78ac98"/><path d="M322 179L449 143L433 90L306 125Z" fill="#52746c" stroke="#7ee8c7" stroke-width="2"/><path d="M329 190L455 153" stroke="#efa878" stroke-width="6"/><path d="M458 143H683M667 132L683 143L667 154" fill="none" stroke="#efa878" stroke-width="3"/><circle cx="329" cy="201" r="9" fill="#866649"/><circle cx="367" cy="191" r="9" fill="#866649"/><circle cx="405" cy="181" r="9" fill="#866649"/><path d="M45 266H751" stroke="#648d81" stroke-width="2"/></svg><figcaption>Схема одного инженерного объяснения: тяга по подготовленному пути к уровню кладки. Дорога, катки и кабестаны относятся к реконструкции Adam; рисунок не подтверждает её детали для каждого блока.</figcaption></figure>`;
    return '';
  }
  function sources(id) {
    const p = profile(id);
    if (!p) return [];
    const ids = [...p.metrics.flatMap(m => m.sources || []), ...(p.questions || []).flatMap(q => q.sources || [])];
    return [...new Set(ids)].map(key => ENGINEERING.sources[key]).filter(Boolean).map(s => ({...s, supports:s.supports || 'Размеры, инженерные наблюдения и пределы интерпретации; подробности в разделе «Масштаб в числах».'}));
  }
  return Object.freeze({profile, renderMetrics, renderDossier, sources});
})();
