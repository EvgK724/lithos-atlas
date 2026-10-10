/* Pure recall and scheduling functions, independent of browser storage. */
const Learning=(()=>{
 'use strict';
 const DAY=86400000,STEPS=[1,3,7,14,30];
 const TOPICS={name:'Название',geo:'География',era:'Эпоха',engineering:'Инженерная идея',evidence:'Факты и гипотезы',scale:'Масса и размеры'};
 const cards=WONDERS.flatMap(w=>Object.keys(TOPICS).map(topic=>({id:`${w.id}:${topic}`,wonderId:w.id,topic})));
 const validIds=new Set(cards.map(c=>c.id));
 function clean(raw){
  if(!raw||raw.version!==1||!raw.cards||typeof raw.cards!=='object')return {};
  const result={};
  for(const [id,e] of Object.entries(raw.cards)){
   if(!validIds.has(id)||!e||!Number.isInteger(e.step)||e.step<0||e.step>5||!Number.isFinite(e.due)||e.due<0||!Number.isInteger(e.seen)||e.seen<1)continue;
   result[id]={step:e.step,due:e.due,seen:e.seen};
  }
  return result;
 }
 function interval(entry,value){
  if(value==='again')return {step:0,delay:600000};
  if(!['good','easy'].includes(value))throw new Error('Unknown review grade');
  const step=Math.min(5,(entry?.step||0)+(value==='easy'?2:1));
  return {step,delay:STEPS[step-1]*DAY};
 }
 function grade(entry,value,now=Date.now()){const next=interval(entry,value);return {step:next.step,due:now+next.delay,seen:(entry?.seen||0)+1};}
 function select(topic='all',wonder='all'){return cards.filter(c=>(topic==='all'||c.topic===topic)&&(wonder==='all'||c.wonderId===wonder||BY_ID[c.wonderId].group===wonder));}
 function due(selection,progress,now=Date.now()){return selection.filter(c=>!progress[c.id]||progress[c.id].due<=now);}
 function content(card){
  const w=BY_ID[card.wonderId];
  if(card.topic==='scale')return {...w.scaleRecall,hint:'Вспомните порядок величины и к какой части памятника он относится.'};
  if(card.topic==='name')return {question:w.clue,hint:'Назовите памятник, затем откройте ответ.',answer:w.name,detail:`${w.city} · ${w.eraLabel}. ${w.summary}`};
  if(card.topic==='geo')return {question:`Где находится ${w.name}?`,hint:'Вспомните место и современную страну.',answer:`${w.city} · ${w.modernCountry}`,detail:w.location};
  if(card.topic==='era')return {question:`К какой эпохе относится ${w.name}?`,hint:'Достаточно вспомнить эпоху или тысячелетие. Даты относятся к определённой строительной фазе.',answer:w.eraLabel,detail:w.dateNote};
  if(card.topic==='engineering')return {question:`Какую строительную задачу решали здесь: ${w.name}?`,hint:'Вспомните, как работали с массой, формой, пространством или светом.',answer:w.engineeringAnswer,detail:w.engineering};
  return {question:`Что мы знаем и чего пока не знаем: ${w.name}?`,hint:'Вспомните одно свидетельство и один открытый вопрос.',answer:w.evidenceAnswer,detail:w.uncertainty.text};
 }
 return Object.freeze({cards,TOPICS,clean,interval,grade,select,due,content});
})();
