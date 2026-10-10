const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),context=vm.createContext({Intl,Date,Set,Object,Number,Error});
const source=fs.readFileSync(path.join(root,'src/data.js'),'utf8').replace('/*__RESEARCH__*/',fs.readFileSync(path.join(root,'sources.json'),'utf8'));
vm.runInContext(source+'\n'+fs.readFileSync(path.join(root,'src/learning.js'),'utf8')+'\nglobalThis.api=Learning;globalThis.wonders=WONDERS;',context);
const L=context.api,now=1800000000000,day=86400000;
assert.equal(context.wonders.length,12);assert.equal(L.cards.length,72);assert.equal(new Set(L.cards.map(c=>c.id)).size,72);
assert.equal(L.select('all','complex').length,36);assert.equal(L.select('engineering','megalith').length,6);assert.equal(L.select('all','osireion').length,6);
let entry;
for(const days of [1,3,7,14,30,30]){entry=L.grade(entry,'good',now);assert.equal(entry.due,now+days*day);}
entry=L.grade(entry,'again',now);assert.equal(entry.due,now+600000);assert.equal(entry.step,0);assert.equal(L.grade(entry,'good',now).due,now+day);
assert.equal(L.grade(undefined,'easy',now).due,now+3*day);assert.throws(()=>L.grade(undefined,'invalid',now));
const p={'petra:name':L.grade(undefined,'good',now)};
assert.equal(L.due(L.cards,p,now).length,71);assert.equal(L.due(L.cards,p,now+day).length,72);
assert.equal(Object.keys(L.clean({version:1,cards:{...p,'bogus:name':p['petra:name'],'petra:geo':{step:99,due:now,seen:1},'khufu:name':{step:0,due:-1,seen:1}}})).length,1);
assert.equal(Object.keys(L.clean(null)).length,0);assert.equal(Object.keys(L.clean({version:2,cards:p})).length,0);
for(const card of L.cards){const c=L.content(card);for(const key of ['question','hint','answer','detail'])assert.ok(c[key]&&c[key].length>0,card.id+' '+key);}
for(const w of context.wonders){
 for(const k of ['name','eraShort','eraLabel','engineering','engineeringAnswer','evidenceAnswer','established','hypothesis','openQuestion','mnemonic','distinction']) assert.ok(typeof w[k]==='string'&&w[k].length>5,w.id+' '+k);
 assert.equal(w.facts.length,3);assert.equal(w.titles.length,3);assert.ok(w.sources.length>=2,w.id+' sources');
 assert.ok(Math.abs(w.lat)<=90&&Math.abs(w.lon)<=180);assert.ok(context.wonders.find(p=>p.id===w.pair));
 assert.ok(w.sources.every(s=>new URL(s.url).protocol==='https:'));
}
assert.ok(context.wonders.find(w=>w.id==='pumapunku').dateSort>0);
assert.ok(context.wonders.find(w=>w.id==='gobekli').dateSort<-9000);
assert.ok(context.wonders.find(w=>w.id==='osireion').dateSort>-1400);
console.log('PASS: 12 records, 72 complete recall cards, filters, scheduling, due boundary, storage validation, source links, chronology and geographic ranges.');

// New mass cards preserve the identifiers and stored scheduling of the original 50 cards.
const oldTopics=['name','geo','era','engineering','evidence'];
const oldProgress=Object.fromEntries(context.wonders.slice(0,10).flatMap(w=>oldTopics.map(t=>[w.id+':'+t,{step:3,due:now+7*day,seen:4}])));
assert.equal(Object.keys(L.clean({version:1,cards:oldProgress})).length,50);
assert.equal(L.select('scale').length,12);
assert.equal(L.content(L.cards.find(c=>c.id==='barabar:scale')).answer,context.wonders.find(w=>w.id==='barabar').scaleRecall.answer);
console.log('PASS: original 50 progress entries preserved; 12 mass and size recall cards.');
