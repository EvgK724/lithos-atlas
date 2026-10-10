/* LITHOS — original vector engineering illustrations.
 * Educational reconstructions, not surveyed plans or measured drawings.
 * API: wonderDrawing({id,name}, 'exterior'|'structure'), wonderMini(id).
 */
(function () {
  'use strict';
  const IDS=['khufu','osireion','serapeum','baalbek','gobekli','stonehenge','newgrange','hagarqim','pumapunku','petra','barabar','obelisk'];
  const NAMES={khufu:'Пирамида Хеопса',osireion:'Осирион',serapeum:'Серапеум',baalbek:'Баальбек',gobekli:'Гёбекли-Тепе',stonehenge:'Стоунхендж',newgrange:'Ньюгрейндж',hagarqim:'Хаджар-Ким',pumapunku:'Пума-Пунку',petra:'Петра — Эль-Хазне'};
  let serial=0;
  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const n=v=>Math.round(v*10)/10;
  const points=a=>a.map(p=>p.map(n).join(',')).join(' ');
  const path=a=>'M '+a.map(p=>p.map(n).join(' ')).join(' L ');

  function artist(ns,mini=false) {
    const P=(x,y,z=0)=>[450+(x-y)*2.24,424+(x+y)*.91-z*2.25];
    const palettes={stone:['#7c8775','#424f4d','#b6bd9b'],granite:['#586e70','#2b444c','#92abaa'],sand:['#95755b','#57483e','#d3af84'],earth:['#445c4c','#2a3c39','#809275'],dark:['#253a39','#162d32','#4a6260'],copper:['#b2805c','#634d42','#e8b589'],mint:['#67aa95','#35675f','#b0ddba']};
    const world=a=>a.map(p=>P(...p));
    const poly=(a,fill,stroke='#c0dfca',width=.8,opacity=1)=>`<polygon points="${points(a)}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-opacity=".36" stroke-linejoin="round" opacity="${opacity}"/>`;
    const edge=(a,color='#67f2cd',width=1,opacity=.52,dash='')=>`<path d="${path(a)}" fill="none" stroke="${color}" stroke-width="${width}" opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"${dash?` stroke-dasharray="${dash}"`:''}/>`;
    function prism(xy,z,h,tone='stone',opacity=1) {
      const c=palettes[tone]||palettes.stone;
      const faces=xy.map((p,i)=>({p,q:xy[(i+1)%xy.length],depth:p[0]+p[1]+xy[(i+1)%xy.length][0]+xy[(i+1)%xy.length][1]})).sort((a,b)=>a.depth-b.depth);
      let out=faces.map(({p,q})=>poly(world([[...p,z],[...q,z],[...q,z+h],[...p,z+h]]),(q[0]-p[0])>(q[1]-p[1])?c[0]:c[1],'#c0dfca',.8,opacity)).join('');
      return out+poly(world(xy.map(p=>[...p,z+h])),c[2],'#c0dfca',.8,opacity);
    }
    function box(x,y,z,w,d,h,tone='stone',courses=0,opacity=1) {
      let out=prism([[x,y],[x+w,y],[x+w,y+d],[x,y+d]],z,h,tone,opacity);
      if(!mini&&courses)for(let j=1;j<courses;j++){
        const z1=z+h*j/courses;
        out+=edge(world([[x,y+d,z1],[x+w,y+d,z1],[x+w,y,z1]]),'#dcddbc',.72,.2);
        for(let i=1;i<5;i++){const xx=x+w*(i-.4*(j%2))/5;if(xx>x&&xx<x+w)out+=edge(world([[xx,y+d,z1],[xx,y+d,z1-h/courses]]),'#dcddbc',.65,.15);}
      }
      return out;
    }
    function disk(x,y,z,r,h,tone='stone',sides=20) {return prism(Array.from({length:sides},(_,i)=>[x+r*Math.cos(i*Math.PI*2/sides),y+r*Math.sin(i*Math.PI*2/sides)]),z,h,tone);}
    function column(x,y,z,h,r=3,tone='stone') {
      let out=box(x-r*1.55,y-r*1.55,z,r*3.1,r*3.1,2.1,tone)+disk(x,y,z+2.1,r*1.15,2,tone,8)+disk(x,y,z+4.1,r,h-9,tone,10)+box(x-r*1.65,y-r*1.65,z+h-4.9,r*3.3,r*3.3,4.9,tone);
      if(!mini){out+=edge([P(x-r*.3,y+r*.6,z+6),P(x-r*.3,y+r*.6,z+h-6)],'#dce5ca',.8,.37);}
      return out;
    }
    function ring(r1,r2,z,h,start=0,end=Math.PI*2,tone='stone',count=22) {
      const pieces=[];
      for(let i=0;i<count;i++){
        const t1=start+(end-start)*i/count+.012,t2=start+(end-start)*(i+1)/count-.012;
        const xy=[[Math.cos(t1)*r1,Math.sin(t1)*r1],[Math.cos(t2)*r1,Math.sin(t2)*r1],[Math.cos(t2)*r2,Math.sin(t2)*r2],[Math.cos(t1)*r2,Math.sin(t1)*r2]];
        pieces.push({xy,depth:xy.reduce((s,p)=>s+p[0]+p[1],0)});
      }
      return pieces.sort((a,b)=>a.depth-b.depth).map(o=>prism(o.xy,z,h,tone)).join('');
    }
    function upright(profile,x,y,z,depth,tone='stone',angle=0) {
      const c=palettes[tone]||palettes.stone, co=Math.cos(angle),si=Math.sin(angle);
      const pos=(p,v)=>[x+p[0]*co-v*si,y+p[0]*si+v*co,z+p[1]];
      const facing=(-si+co)>=0?depth/2:-depth/2;
      const back=profile.map(p=>pos(p,-facing)),front=profile.map(p=>pos(p,facing));
      let out=poly(world(back),c[1]);
      const sides=profile.map((p,i)=>({i,depth:front[i][0]+front[i][1]+front[(i+1)%front.length][0]+front[(i+1)%front.length][1]})).sort((a,b)=>a.depth-b.depth);
      out+=sides.map(({i})=>poly(world([back[i],back[(i+1)%back.length],front[(i+1)%front.length],front[i]]),profile[i][1]===profile[(i+1)%profile.length][1]?c[2]:c[1])).join('');
      return out+poly(world(front),c[0]);
    }
    function slab(x,y,z,w,d,h,angle=0,tone='stone') {
      const co=Math.cos(angle),si=Math.sin(angle),xy=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([u,v])=>[x+u*co-v*si,y+u*si+v*co]);
      return prism(xy,z,h,tone);
    }
    function hollowBox(x,y,z,w,d,h,tone='granite',rim=4) {
      let out=box(x,y,z,w,d,h,tone);
      const outer=world([[x+rim,y+rim,z+h],[x+w-rim,y+rim,z+h],[x+w-rim,y+d-rim,z+h],[x+rim,y+d-rim,z+h]]);
      out+=poly(outer,'#0d2025','#9bd6c7',1.2);
      out+=edge([P(x+rim,y+d-rim,z+h),P(x+rim,y+d-rim,z+h-7),P(x+w-rim,y+d-rim,z+h-7)],'#598e86',.9,.56);
      return out;
    }
    function label(x,y,lines,target,side='right') {
      const color=side==='left'?'#bce7d5':'#edbd99';
      const ly=y+lines.length*29+2,endX=side==='left'?x+143:x-11,bendX=side==='left'?endX+18:endX-18;
      return `<g class="drawing-annotation">${edge([target,[bendX,ly-11],[endX,ly-11]],color,1.05,.53)}<circle cx="${n(target[0])}" cy="${n(target[1])}" r="3" fill="${color}"/><text x="${x}" y="${y}" fill="${color}" font-family="ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="27" font-weight="620">${lines.map((v,i)=>`<tspan x="${x}" dy="${i?30:0}">${esc(v)}</tspan>`).join(' ')}</text></g>`;
    }
    return {P,world,poly,edge,prism,box,disk,column,ring,upright,slab,hollowBox,label,palettes,ns,mini};
  }

  function khufu(a,cut) {
    const {poly,edge,label}=a;
    const apex=[450,91],left=[202,408],near=[450,527],right=[698,408];
    let body=poly([[179,418],[450,549],[722,419],[450,299]],'#253c39','#8abfae',1);
    body+=poly([apex,left,near],cut?'#827a60':'#adb695')+poly([apex,near,right],cut?'#152e33':'#466461');
    for(let i=1;i<14;i++){const t=i/14,p=q=>[apex[0]+(q[0]-apex[0])*t,apex[1]+(q[1]-apex[1])*t];body+=edge([p(left),p(near)],'#dcdbb4',.86,.35);if(!cut)body+=edge([p(near),p(right)],'#a9e0c5',.8,.28);}
    body+=edge([left,apex,right],'#adffe1',1.5,.8)+edge([apex,near],'#77e8c4',1.4,.68);
    if(cut){
      body+=poly([[202,408],[227,376],[451,480],[450,527]],'#c5c5a1','#e0e6bc',.9,.9);
      body+=edge([[655,420],[536,335],[507,323],[507,289]],'#8ff4d1',4,.94)+edge([[594,377],[479,463],[480,478]],'#efa878',3,.8);
      body+=poly([[495,279],[537,295],[537,315],[495,300]],'#0d1f25','#85ebcb',1.4)+poly([[489,357],[518,368],[518,384],[489,374]],'#0d1f25','#85ebcb',1.2)+poly([[466,471],[498,483],[498,498],[466,486]],'#0d1f25','#e9ad85',1.2);
      for(let i=0;i<3;i++)body+=edge([[494,273-i*7],[537,289-i*7]],'#daba8c',1.5,.66);
      return {body,labels:label(26,153,['Каменное','ядро'],[337,269],'left')+label(731,239,['Камеры','и ходы'],[526,308])+label(29,438,['Облицовка'],[323,459],'left')};
    }
    return {body,labels:label(27,151,['Наклонные','грани'],[357,247],'left')+label(727,254,['Кладка','ядра'],[581,336])+label(709,463,['Основание'],[560,495])};
  }

  function osireion(a,cut) {
    const {P,box,edge,label,poly}=a;
    let body=box(-70,-48,0,140,96,7,'dark')+box(-69,-47,7,138,94,3,'sand');
    body+=poly(a.world([[-61,-39,10],[61,-39,10],[61,39,10],[-61,39,10]]),'#153b3e','#619e90',1);
    for(let i=0;i<4;i++)body+=edge([P(-55+i*6,32,10.4),P(47+i*2,32,10.4)],'#6bd3bd',.9,.24);
    body+=box(-42,-22,10,84,44,9,'sand',2);
    body+=box(-69,-47,10,138,8,43,'sand',5)+box(-69,-39,10,8,78,43,'sand',5);
    for(let i=0;i<4;i++)body+=box(61,-39+i*19.5,10,8,18.5,cut?9:22,'sand',2);
    const cols=[];for(let i=0;i<5;i++){const x=-33+i*16.5;cols.push([x,-13],[x,13]);}cols.sort((p,q)=>p[0]+p[1]-q[0]-q[1]);
    cols.forEach(([x,y])=>body+=box(x-4.5,y-4.5,19,9,9,37,'granite'));
    if(cut){
      [-13,13].forEach(y=>body+=box(-41,y-5,71,82,10,7,'granite'));
      [[-33,13],[33,13]].forEach(([x,y])=>body+=edge([P(x,y,56),P(x,y,71)],'#79edcc',1,.68,'4 5'));
      return {body,labels:label(27,143,['Каменные','перемычки'],P(-12,13,75),'left')+label(724,286,['Гранитные','опоры'],P(28,13,42))+label(29,453,['Канал вокруг','острова'],P(-40,33,11),'left')};
    }
    body+=box(-40,-18,56,27,10,7,'granite')+box(-40,8,56,27,10,7,'granite');
    for(let i=0;i<4;i++)body+=box(-5,23+i*3.8,11+i*1.9,10,4,1.9,'sand');
    return {body,labels:label(24,151,['Два ряда','опор'],P(-10,13,50),'left')+label(711,277,['Центральный','остров'],P(36,17,20))+label(29,457,['Канал'],P(-43,31,10),'left')};
  }

  function vault(a,x,y,z,w,h,d) {
    const r=w/2,arch=[[-r,0],[-r,h-r]];
    for(let i=0;i<=12;i++){const t=Math.PI-i*Math.PI/12;arch.push([Math.cos(t)*r,h-r+Math.sin(t)*r]);}
    arch.push([r,0]);
    const c=a.palettes.earth;
    let out='';
    for(let i=1;i<arch.length-2;i++)out+=a.poly(a.world([[x+arch[i][0],y,z+arch[i][1]],[x+arch[i+1][0],y,z+arch[i+1][1]],[x+arch[i+1][0],y-d,z+arch[i+1][1]],[x+arch[i][0],y-d,z+arch[i][1]]]),i<7?c[0]:c[1],'#b4c4a6',.7);
    const outer=arch.map(([xx,zz])=>a.P(x+xx,y,z+zz));
    out+=a.edge(outer,'#bdc5a8',5,.65)+a.edge(outer,'#b4edcb',1,.38);
    out+=a.edge(arch.map(([xx,zz])=>a.P(x+xx,y-d,z+zz)),'#738f7d',2,.45);
    return out;
  }

  function serapeum(a,cut) {
    const {P,box,hollowBox,edge,label,poly}=a;
    let body=box(-63,-42,0,126,84,8,'earth',2)+box(-62,-41,8,125,9,68,'earth',5);
    body+=box(-62,-32,8,8,64,57,'earth',4);
    body+=poly(a.world([[-51,-31,9],[53,-31,9],[53,35,9],[-51,35,9]]),'#183033','#6ba291',.8);
    if(cut){
      body+=vault(a,-17,-11,8,62,71,23);
      body+=hollowBox(-24,-3,9,57,34,29,'granite',5.3);
      body+=box(-27,-6,62,63,40,9,'granite');
      [[-22,26],[29,26]].forEach(([x,y])=>body+=edge([P(x,y,38),P(x,y,62)],'#8ee6c9',1,.58,'4 5'));
      return {body,labels:label(27,149,['Монолитная','крышка'],P(4,18,71),'left')+label(724,292,['Полость','саркофага'],P(8,18,38))+label(27,455,['Скальная','галерея'],P(-48,20,10),'left')};
    }
    body+=vault(a,0,-2,8,99,78,29);
    body+=box(-47,-22,8,22,19,16,'dark')+box(-48,-23,24,24,21,4,'granite');
    body+=hollowBox(-19,4,9,51,28,26,'granite',4.5)+box(-21,1,35,55,32,7,'granite');
    body+=edge([P(-47,37,10),P(53,37,10)],'#7fe1c3',1.4,.47);
    return {body,labels:label(27,154,['Скальный','свод'],P(-18,-2,80),'left')+label(725,288,['Каменный','саркофаг'],P(27,24,34))+label(27,453,['Подземная','галерея'],P(-45,26,10),'left')};
  }

  function baalbek(a,cut) {
    const {P,box,column,label,edge}=a;
    let body=box(-72,-42,0,144,84,6,'dark')+box(-67,-38,6,134,76,30,'sand',5);
    body+=box(-65,-36,36,130,56,17,'stone',3);
    for(let i=0;i<3;i++)body+=box(-64+i*42.6,20,36,41.8,17,17,cut?'mint':'sand',0);
    body+=box(-69,-39,53,138,78,5,'granite');
    if(!cut){
      for(let i=0;i<6;i++)body+=column(-52+i*20.8,-20,58,65,4,'sand');
      body+=box(-60,-28,123,120,15,7,'sand');
      body+=box(-48,-4,58,96,25,10,'dark',2);
      return {body,labels:label(25,126,['Колоннада'],P(-13,-20,111),'left')+label(722,318,['Трилитон'],P(34,36,45))+label(27,459,['Подиум'],P(-39,38,19),'left')};
    }
    body+=box(-45,-20,58,90,31,14,'dark',2);
    body+=edge([P(-65,38,35),P(65,38,35),P(65,20,35)],'#9effd8',2,.86);
    body+=edge([P(-64,37,53),P(64,37,53)],'#9effd8',1.5,.86);
    return {body,labels:label(25,168,['Площадка','храма'],P(-12,14,72),'left')+label(710,305,['Три крупных','блока'],P(31,37,45))+label(26,451,['Нижние','ряды'],P(-30,38,20),'left')};
  }

  function tPillar(a,x,y,z,h,w,depth,angle=0,tone='stone') {
    const stem=w*.39,cap=h*.21;
    return a.upright([[-w/2,h],[w/2,h],[w/2,h-cap],[stem/2,h-cap],[stem/2,0],[-stem/2,0],[-stem/2,h-cap],[-w/2,h-cap]],x,y,z,depth,tone,angle);
  }

  function gobekli(a,cut) {
    const {P,disk,ring,edge,label}=a;
    let body=disk(0,0,0,67,4,'earth',28)+disk(0,0,4,54,3,'sand',28);
    if(cut){
      body+=ring(58,63,4,8,0,Math.PI*2,'dark',22);
      body+=tPillar(a,0,0,7,117,48,13,0,'sand');
      const f=6.8;
      body+=edge([P(-8,f,86),P(-12,f,49),P(-4,f,36),P(5,f,36)],'#efbb91',2,.83)+edge([P(8,f,86),P(12,f,49),P(4,f,36),P(-5,f,36)],'#efbb91',2,.83);
      body+=edge([P(-9,f,31),P(9,f,31)],'#efbb91',2,.8);
      return {body,labels:label(24,132,['Монолитная','Т-форма'],P(-16,6.7,109),'left')+label(724,283,['Рельеф','на грани'],P(5,6.8,51))+label(26,448,['Каменное','основание'],P(-10,10,7),'left')};
    }
    body+=ring(51,60,7,13,Math.PI*.8,Math.PI*2.7,'sand',20);
    const objects=[];
    for(let i=0;i<10;i++){const t=i*Math.PI*2/10;objects.push({depth:Math.cos(t)*48+Math.sin(t)*48,draw:()=>tPillar(a,Math.cos(t)*48,Math.sin(t)*48,7,31+(i%3)*2,18,6,t+Math.PI/2,'stone')});}
    objects.push({depth:-20,draw:()=>tPillar(a,-20,0,7,66,26,9,0,'sand')},{depth:20,draw:()=>tPillar(a,20,0,7,66,26,9,0,'sand')});
    objects.sort((p,q)=>p.depth-q.depth).forEach(o=>body+=o.draw());
    return {body,labels:label(24,138,['Центральная','пара'],P(-20,4.5,65),'left')+label(716,294,['Т-образные','стелы'],P(40,0,35))+label(26,455,['Кольцевая','ограда'],P(-27,46,19),'left')};
  }

  function stonehenge(a,cut) {
    const {P,disk,slab,box,ring,edge,label}=a;
    let body=disk(0,0,0,67,4,'earth',28);
    if(cut){
      body+=box(-39,-10,4,19,22,92,'stone')+box(20,-10,4,19,22,92,'stone');
      body+=box(-33,-4,96,7,8,6,'mint')+box(26,-4,96,7,8,6,'mint');
      body+=box(-44,-13,118,88,28,18,'stone');
      body+=a.poly(a.world([[-33,-4,117.5],[-26,-4,117.5],[-26,4,117.5],[-33,4,117.5]]),'#18312e','#94f1cf',1.3)+a.poly(a.world([[26,-4,117.5],[33,-4,117.5],[33,4,117.5],[26,4,117.5]]),'#18312e','#94f1cf',1.3);
      [-29.5,29.5].forEach(x=>body+=edge([P(x,0,102),P(x,0,118)],'#9bf8cf',1.15,.7,'4 5'));
      return {body,labels:label(23,128,['Гнездо','в перемычке'],P(-29,0,119),'left')+label(725,292,['Шип','на опоре'],P(29,0,100))+label(26,449,['Две стойки'],P(-29,7,35),'left')};
    }
    const objs=[];
    for(let i=0;i<12;i++){
      const t=i*Math.PI*2/12,x=Math.cos(t)*51,y=Math.sin(t)*51;
      objs.push({depth:x+y,draw:()=>slab(x,y,4,14,10,40,t+Math.PI/2,'stone')});
      if(i!==1&&i!==8){const t2=(i+1)*Math.PI*2/12,tm=(t+t2)/2;const xy=[[Math.cos(t)*45,Math.sin(t)*45],[Math.cos(t2)*45,Math.sin(t2)*45],[Math.cos(t2)*57,Math.sin(t2)*57],[Math.cos(t)*57,Math.sin(t)*57]];objs.push({depth:(Math.cos(tm)+Math.sin(tm))*51,draw:()=>a.prism(xy,44,8,'stone')});}
    }
    [-1,0,1].forEach((j)=>{const x=j*25,y=-6-Math.abs(j)*10;objs.push({depth:x+y,draw:()=>box(x-10,y-4,4,8,10,61,'stone')+box(x+3,y-4,4,8,10,61,'stone')+box(x-13,y-6,65,27,14,9,'stone')});});
    objs.sort((p,q)=>p.depth-q.depth).forEach(o=>body+=o.draw());
    body+=slab(-23,40,4,22,9,7,.5,'granite')+slab(29,45,4,18,8,6,-.5,'granite');
    return {body,labels:label(25,151,['Каменные','перемычки'],P(-21,-22,72),'left')+label(715,301,['Крупные','трилиты'],P(29,-8,50))+label(27,457,['Кольцевая','композиция'],P(-27,44,9),'left')};
  }

  function mound(a,cut=false) {
    const layers=9,faces=[];
    for(let k=0;k<layers;k++){
      const r1=66*Math.sqrt(1-(k/layers)**2),r2=66*Math.sqrt(1-((k+1)/layers)**2),z1=16+k*6.2,z2=16+(k+1)*6.2;
      for(let i=0;i<24;i++){
        const t1=i*Math.PI*2/24,t2=(i+1)*Math.PI*2/24;
        if(cut&&Math.cos((t1+t2)/2)+Math.sin((t1+t2)/2)>.2)continue;
        const q=[[r1*Math.cos(t1),r1*Math.sin(t1),z1],[r1*Math.cos(t2),r1*Math.sin(t2),z1],[r2*Math.cos(t2),r2*Math.sin(t2),z2],[r2*Math.cos(t1),r2*Math.sin(t1),z2]];
        const shade=Math.max(0,Math.min(3,Math.floor((Math.cos((t1+t2)/2-2.2)+1)*1.9)));
        faces.push({depth:q.reduce((s,p)=>s+p[0]+p[1],0),q,fill:['#44624f','#4b6c55','#55765b','#5e7f61'][shade]});
      }
    }
    return faces.sort((p,q)=>p.depth-q.depth).map(f=>a.poly(a.world(f.q),f.fill,'#aed4ac',.5,.96)).join('');
  }

  function newgrange(a,cut) {
    const {P,disk,ring,box,edge,label}=a;
    let body=disk(0,0,0,72,4,'earth',36)+disk(0,0,4,66,2,'dark',30);
    if(cut){
      body+=mound(a,true);
      body+=ring(19,27,6,22,Math.PI*.72,Math.PI*2.23,'stone',12);
      for(let j=0;j<6;j++)body+=ring(18-j*2.5,26-j*2.5,28+j*6.2,6.2,Math.PI*.72,Math.PI*2.23,'stone',12);
      body+=box(-7.5,19,6,4,47,18,'stone',3)+box(6,19,6,4,47,18,'stone',3);
      for(let j=0;j<5;j++)body+=box(-8.5,23+j*8.5,24,19.5,5.5,4,'stone');
      body+=edge([P(1,65,6.5),P(1,5,6.5)],'#87f0c6',2,.66);
      return {body,labels:label(24,155,['Ложный','свод'],P(-7,0,57),'left')+label(735,318,['Камера'],P(8,5,20))+label(26,464,['Длинный','проход'],P(-1,48,20),'left')};
    }
    body+=mound(a,false);
    body+=ring(61,68,5,18,-Math.PI*.21,Math.PI*.72,'stone',24);
    body+=`<path d="M 424 476 450 468 477 479 477 509 451 520 424 508 Z" fill="#9ca78c" stroke="#bfd4b7" stroke-width="1"/><path d="M 437 484 451 479 464 485 464 509 451 515 437 508 Z" fill="#0d2529" stroke="#5b8f7e" stroke-width="1"/><path d="M 432 472 451 467 470 475 463 481 451 478 438 482 Z" fill="#bdd0ac" stroke="#d1dfbd" stroke-width="1"/><path d="M 441 470 451 467 461 472 451 476 Z" fill="#193633"/>`;
    body+=`<path d="M 403 519 Q 450 508 495 524 L 489 539 Q 449 545 405 533 Z" fill="#768770" stroke="#bed1ac" stroke-width="1.2"/>`;
    if(!a.mini)body+=`<path d="M 429 528 c -14 -12 -26 8 -8 10 12 0 15 -12 4 -13 -8 0 -9 9 -2 9 M 449 526 c -12 -12 -22 8 -6 11 13 1 13 -13 3 -13 -9 0 -8 9 -2 9 M 471 528 c -12 -11 -24 8 -6 10 12 1 14 -12 3 -13 -8 0 -9 8 -2 9" fill="none" stroke="#d4d3ad" stroke-width="1.3" opacity=".7"/>`;
    return {body,labels:label(26,161,['Земляная','насыпь'],[404,293],'left')+label(729,319,['Каменная','облицовка'],[594,438])+label(29,462,['Вход','и световой проём'],[451,477],'left')};
  }

  function hagarqim(a,cut) {
    const {P,disk,box,slab,edge,label}=a;
    let body=disk(0,0,0,72,4,'earth',30);
    const items=[];
    const apses=cut?[[-24,-1,31,28]]:[[-25,-23,24,22],[25,-23,24,22],[-26,21,26,25],[26,21,26,25]];
    apses.forEach(([cx,cy,rx,ry],j)=>{
      body+=a.poly(a.world(Array.from({length:24},(_,i)=>[cx+Math.cos(i*Math.PI/12)*rx,cy+Math.sin(i*Math.PI/12)*ry,4.1])),'#5d6754','#aabb9a',.5,.45);
      for(let i=0;i<9;i++){
        const start=cx<0?Math.PI*.22:-Math.PI*.78,end=cx<0?Math.PI*1.78:Math.PI*.78,t=start+(end-start)*i/8;
        const x=cx+Math.cos(t)*rx,y=cy+Math.sin(t)*ry,h=(cut?37:25)+(i%3)*3;
        items.push({depth:x+y,draw:()=>slab(x,y,4,11,8,h,t+Math.PI/2,'sand')});
      }
    });
    items.sort((p,q)=>p.depth-q.depth).forEach(o=>body+=o.draw());
    if(cut){
      body+=slab(33,11,4,22,10,66,-.18,'sand')+slab(52,-16,4,21,10,55,-.18,'stone');
      body+=box(-8,42,4,17,23,4,'stone');
      body+=edge([P(-2,49,9),P(-4,21,9),P(-20,4,9)],'#77ecc4',1.6,.58,'5 5');
      return {body,labels:label(26,143,['Кривые','стены'],P(-36,-18,37),'left')+label(717,282,['Крупные','ортостаты'],P(37,8,53))+label(26,461,['Плиты','прохода'],P(-1,49,8),'left')};
    }
    body+=box(-14,49,4,8,12,38,'sand')+box(7,49,4,8,12,38,'sand')+box(-17,47,42,35,16,9,'sand');
    body+=edge([P(-2,50,5),P(-2,-39,5)],'#8bcaaf',1.1,.45);
    return {body,labels:label(25,153,['Криволинейные','камеры'],P(-20,-27,31),'left')+label(727,286,['Ортостаты'],P(43,16,30))+label(26,460,['Каменный','вход'],P(-5,55,40),'left')};
  }

  function hBlock(a,x,y,z,h,w,d,angle=0,tone='granite') {
    const top=h,mid1=h*.62,mid2=h*.35,notch=w*.17;
    const shape=[[-w/2,top],[-notch,top],[-notch,mid1],[notch,mid1],[notch,top],[w/2,top],[w/2,0],[notch,0],[notch,mid2],[-notch,mid2],[-notch,0],[-w/2,0]];
    return a.upright(shape,x,y,z,d,tone,angle);
  }

  function pumapunku(a,cut) {
    const {P,box,slab,edge,label}=a;
    if(cut){
      let body=box(-56,-36,0,112,72,5,'dark');
      body+=hBlock(a,-12,8,5,105,61,21,0,'granite');
      body+=hBlock(a,45,-20,5,52,30,13,0,'stone');
      body+=edge([P(-21,18.7,73),P(-21,18.7,48),P(-3,18.7,48)],'#8cffe0',2,.87);
      body+=edge([P(2,18.7,102),P(2,18.7,70),P(-5,18.7,70)],'#f2b489',1.6,.75);
      return {body,labels:label(23,126,['Повторяемая','форма'],P(-30,17,95),'left')+label(719,285,['Выемки','и уступы'],P(-3,18.7,58))+label(27,458,['Андезит'],P(-26,18.7,23),'left')};
    }
    let body=box(-73,-46,0,146,92,5,'earth')+box(-65,-39,5,130,78,15,'sand',3)+box(-55,-31,20,110,62,9,'sand',2);
    for(let i=0;i<4;i++)body+=box(-46+i*24,-25,29,22.5,47,5,'sand');
    body+=hBlock(a,-19,-5,34,28,20,10,0,'granite')+hBlock(a,8,-4,34,28,20,10,0,'granite')+hBlock(a,35,-4,34,28,20,10,0,'granite');
    body+=slab(-33,24,29,22,15,9,.32,'granite')+slab(17,28,20,30,17,8,-.22,'granite');
    body+=box(-10,41,5,20,12,3,'sand')+box(-10,37,8,20,12,3,'sand')+box(-10,33,11,20,12,3,'sand');
    return {body,labels:label(26,149,['Н-образные','блоки'],P(-7,1,60),'left')+label(728,305,['Террасы'],P(53,24,27))+label(24,454,['Песчаник','платформы'],P(-35,38,18),'left')};
  }

  function petra(a,cut) {
    const {poly,edge,label}=a;
    let body=poly([[232,507],[223,335],[235,217],[256,165],[260,85],[324,60],[370,90],[420,68],[469,85],[518,65],[574,102],[619,88],[653,170],[670,310],[687,503],[593,548],[329,545]],'#735746','#ba936f',1);
    body+=poly([[232,507],[223,335],[235,217],[256,165],[260,85],[300,117],[285,244],[292,376],[282,520]],'#584638','#a78569',.8);
    body+=poly([[609,140],[619,88],[653,170],[670,310],[687,503],[641,523],[625,398]],'#443b36','#a78569',.8);
    for(let i=0;i<8;i++){const yy=124+i*45;body+=edge([[249,yy+8],[291,yy-1],[372,yy+12],[446,yy+4],[540,yy+13],[638,yy-3]],'#d3a67c',1,.2);}
    const front=(topOnly=false)=>{
      let s=`<path d="M 302 172 H 607 V 506 H 302 Z" fill="#5b4e42" stroke="#cead87" stroke-width="1"/><path d="M 315 312 H 594 V 328 H 315 Z M 310 492 H 601 V 505 H 310 Z" fill="#bd9770" stroke="#d6b18d" stroke-width=".9"/>`;
      if(!topOnly){
        s+=`<path d="M 428 404 H 478 V 492 H 428 Z" fill="#11292b" stroke="#ad9e80" stroke-width="1.1"/><path d="M 422 397 H 484 V 405 H 422 Z" fill="#c6a07a"/>`;
        [329,376,415,494,536,579].forEach((x,i)=>{s+=`<path d="M ${x-5} 341 H ${x+5} V 478 H ${x-5} Z" fill="${i<3?'#c4a37c':'#9d826b'}" stroke="#d9bf91" stroke-width=".9"/><path d="M ${x-9} 329 H ${x+9} V 341 H ${x-9} Z M ${x-9} 478 H ${x+9} V 490 H ${x-9} Z" fill="#c6a57c"/>`;});
        s+=poly([[315,312],[453,265],[594,312]],'#a38768','#d5b692',1)+edge([[343,302],[453,277],[565,302]],'#80d5b6',1,.4);
      }
      s+=`<path d="M 322 206 H 397 V 285 H 322 Z M 509 206 H 589 V 285 H 509 Z" fill="#54453c" stroke="#a8896d" stroke-width=".8"/>`;
      [330,381,526,580].forEach(x=>{s+=`<path d="M ${x-4.5} 213 H ${x+4.5} V 280 H ${x-4.5} Z" fill="#c6a57d" stroke="#dec199" stroke-width=".8"/><path d="M ${x-8} 206 H ${x+8} V 214 H ${x-8} Z M ${x-8} 280 H ${x+8} V 286 H ${x-8} Z" fill="#c6a57d"/>`;});
      s+=poly([[315,199],[369,165],[412,201],[394,202],[367,185],[338,202]],'#b89c78','#d3b390',.9)+poly([[496,202],[540,165],[596,199],[574,202],[541,185],[516,202]],'#a98b6e','#d3b390',.9);
      s+=`<ellipse cx="453" cy="211" rx="35" ry="12" fill="#ad9371" stroke="#d8bc94" stroke-width=".9"/><path d="M 418 211 V 282 Q 453 300 488 282 V 211" fill="#786651" stroke="#cbae88" stroke-width="1"/>`;
      [424,442,464,482].forEach((x,i)=>{s+=`<path d="M ${x} 216 V ${i===0||i===3?282:287}" stroke="#d4b58b" stroke-width="6"/>`;});
      s+=`<ellipse cx="453" cy="213" rx="41" ry="11" fill="#c7ab84" stroke="#e0c79e" stroke-width="1"/><path d="M 414 209 453 169 492 209 Z" fill="#ad9270" stroke="#d5b994" stroke-width="1"/><path d="M 445 169 V 154 q -8 -6 -4 -15 h 24 q 4 9 -4 15 v 15 Z" fill="#c7ac83" stroke="#dcc298" stroke-width="1"/><path d="M 442 136 H 464" stroke="#d8ba90" stroke-width="3"/>`;
      return s;
    };
    if(cut){
      body+=front(true);
      body+=poly([[302,311],[607,311],[617,501],[302,506]],'#84634b','#caa17a',1);
      for(let i=0;i<6;i++)body+=edge([[305,341+i*27],[602,339+i*27]],'#e0b18b',1,.34);
      body+=edge([[640,231],[640,448]],'#82f3cf',2.3,.82)+poly([[634,438],[640,451],[646,438]],'#82f3cf','#82f3cf',.5);
      body+=edge([[310,302],[599,302]],'#a1f6d5',2,.7);
      return {body,labels:label(22,139,['Скальный','массив'],[274,170],'left')+label(703,285,['Сверху вниз','— схема'],[640,348])+label(26,440,['Снятие','породы'],[340,420],'left')};
    }
    body+=front(false);
    return {body,labels:label(23,139,['Скальный','массив'],[272,217],'left')+label(716,285,['Резной','фасад'],[575,351])+label(25,442,['Вход','в камеру'],[451,447],'left')};
  }

  function barabar(a,cut) {
    const {label}=a;
    const stone='<path d="M164 200L235 171L648 182L721 224L734 430L668 458L191 444L157 396Z" fill="#243d3d" stroke="#688e80" stroke-width="1.5"/>';
    if(!cut){
      let body=stone+'<path d="M196 227L216 206M650 204L687 229M175 372L193 402M679 421L697 393" stroke="#8ba090" opacity=".4" fill="none"/>';
      body+='<ellipse cx="270" cy="309" rx="72.8" ry="69.5" fill="#091a20" stroke="#8cf3d0" stroke-width="2.5"/><rect x="361" y="238" width="239.5" height="142.6" rx="2" fill="#091a20" stroke="#8cf3d0" stroke-width="2.5"/><path d="M339 291H364V325H339M534 378V419H568V378" fill="#091a20" stroke="#8cf3d0" stroke-width="2.5"/><path d="M339 294V322M364 294V322M537 378H565" stroke="#091a20" stroke-width="6"/><path d="M601 290H634V324H601" fill="#a37f4933" stroke="#e3b580" stroke-width="2" stroke-dasharray="5 4"/>';
      body+='<path d="M375 220H586M375 213V227M586 213V227M549 435V417M544 423L549 417L554 423" fill="none" stroke="#e4b98d" stroke-width="1.8"/>';
      return {body,labels:label(23,127,['Камера','≈6,07 × 5,79 м'],[239,264],'left')+label(672,117,['Зал','≈10 × 5,9 м'],[544,251])+label(654,454,['Вход сбоку'],[550,408])};
    }
    let body=stone+'<path d="M197 391V325C197 230 341 230 341 325V391Z" fill="#0a2023" stroke="#8cf3d0" stroke-width="2.5"/><path d="M361 391V255H600V391Z" fill="#0a2023" stroke="#8cf3d0" stroke-width="2.5"/><path d="M338 391V334H364V391" fill="#0a2023" stroke="#8cf3d0" stroke-width="2.5"/><path d="M201 391H599" stroke="#dfa974" stroke-width="3"/><path d="M385 270H572M385 285H572" stroke="#b1eee0" stroke-opacity=".1" stroke-width="2"/><path d="M600 336H634V391H600" fill="#a37f4920" stroke="#e3b580" stroke-dasharray="5 4" stroke-width="2"/>';
    body+='<path d="M573 257V389M564 257H582M564 389H582" stroke="#e4b98d" stroke-width="1.8"/>';
    return {body,labels:label(25,127,['Купол','камеры'],[264,271],'left')+label(670,127,['Высота зала','≈3,7 м'],[575,301])+label(668,447,['Незавершённый','вырез'],[622,363])};
  }

  function obelisk(a,cut) {
    const {poly,edge,label}=a;
    if(!cut){
      let body=poly([[129,390],[532,129],[781,253],[363,527]],'#35413c','#718f7a',1.3);
      body+=poly([[205,389],[565,166],[692,235],[336,475]],'#0d2225','#739f8d',1.3);
      body+=poly([[223,385],[563,183],[660,237],[333,451]],'#947a61','#d2b38b',1.3);
      body+=poly([[223,385],[333,451],[334,479],[223,413]],'#665547','#ae9677',1.1);
      body+=poly([[333,451],[660,237],[660,266],[334,479]],'#524b40','#af957a',1.1);
      body+=edge([[483,232],[461,258],[491,281]],'#202c28',4,.9)+edge([[310,461],[635,246]],'#8febc9',2,.8,'7 5');
      for(let i=0;i<8;i++){const x=271+i*37,y=403-i*23;body+=edge([[x-33,y-13],[x-42,y-30],[x-38,y-35]],'#c1a789',2,.55);}
      return {body,labels:label(26,126,['Заготовка','≈42 м'],[399,300],'left')+label(692,132,['Траншея'],[571,178])+label(647,440,['Связь','со скалой'],[491,385])};
    }
    let body=poly([[170,250],[730,250],[730,475],[170,475]],'#35413c','#718f7a',1.3);
    body+=poly([[293,250],[352,250],[352,380],[293,380]],'#0b1d21','#7c9d8b',1.5)+poly([[548,250],[607,250],[607,380],[548,380]],'#0b1d21','#7c9d8b',1.5);
    body+=poly([[352,240],[548,240],[548,380],[352,380]],'#947a61','#e0bc8d',1.5);
    body+=edge([[366,382],[534,382]],'#efbb85',2.5,.9,'8 6')+edge([[365,399],[373,414],[391,405],[412,429],[436,411],[466,433],[497,412],[524,425]],'#576853',1,.7);
    for(let i=0;i<5;i++)body+=edge([[294,259+i*23],[301,264+i*23],[299,279+i*23]],'#92b59d',1.5,.65);
    return {body,labels:label(25,127,['Контур','обелиска'],[401,251],'left')+label(679,145,['Боковые','траншеи'],[580,312])+label(661,441,['Низ ещё','не отделён'],[456,383])};
  }

  function defs(ns) {
    return `<defs><radialGradient id="${ns}-aura"><stop stop-color="#3a8f7d" stop-opacity=".15"/><stop offset=".6" stop-color="#25453f" stop-opacity=".06"/><stop offset="1" stop-color="#0b1417" stop-opacity="0"/></radialGradient><linearGradient id="${ns}-fade" x1="0" y1="0" x2="0" y2="1"><stop offset=".68" stop-color="#0b1417" stop-opacity="0"/><stop offset="1" stop-color="#0b1417" stop-opacity=".2"/></linearGradient></defs>`;
  }
  const DRAW={khufu,osireion,serapeum,baalbek,gobekli,stonehenge,newgrange,hagarqim,pumapunku,petra,barabar,obelisk};
  const DETAILS={
    barabar:'Судама: план с боковым южным входом или продольный разрез. Два диаметра почти круглой камеры сохранены раздельно. Малый восточный вырез незавершён. По Cunningham, 1871, с. 46 и табл. XIX; не современная лазерная модель.',
    obelisk:'Асуанская заготовка в карьере и условное поперечное сечение траншей. Низ не отделён полностью. Рисунок показывает строительную задачу; профиль конкретных углов и следов не воспроизводит.',
    khufu:'Показаны объём, облицовка, каменное ядро и условные внутренние проходы; положение камер упрощено.',
    osireion:'Показаны центральная площадка, две линии опор и окружающий канал. Уровень воды не является реконструкцией исторического уровня.',
    serapeum:'Подземная галерея показана в условном раскрытии; свод вырублен в скале. Корпус саркофага и его отдельная крышка показаны без размеров.',
    baalbek:'Крупные блоки трилитона показаны установленными в кладке подиума храма. Незаконченные блоки каменоломни на рисунке отсутствуют.',
    gobekli:'Кольцевая ограда, центральная пара и периферийные Т-образные монолиты показаны условно; число и размещение периферийных камней сокращены для наглядности.',
    stonehenge:'Кольцевая композиция показана условно с сокращённым числом камней; разъединённая схема показывает принцип соединения шипа и гнезда.',
    newgrange:'Общая форма кургана и современная реконструированная облицовка упрощены. В раскрытии показаны длинный проход и корбельный, или ложный, свод камеры.',
    hagarqim:'Показаны условно расположенные криволинейные помещения, крупные вертикальные плиты и каменный вход. Это не точная планировка храмового комплекса.',
    pumapunku:'Песчаниковые террасы и отдельные повторяющиеся Н-образные андезитовые блоки показаны условно. Полная сборка разрушенного сооружения не утверждается.',
    petra:'Фасад Эль-Хазне вырезан в скальном массиве. Поэтапное снятие породы сверху вниз показано как учебная концепция, не как документированная последовательность всех работ.',
  };

  function wonderDrawing(w,mode='exterior') {
    w=w||{};
    const id=IDS.includes(w.id)?w.id:'khufu',cut=mode==='structure',ns='lithos-'+id+'-'+(++serial);
    const a=artist(ns),draw=DRAW[id](a,cut);
    const title=(w.name||NAMES[id])+' — '+(cut?'условная схема устройства':'учебная реконструкция');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" class="wonder-drawing lithos-drawing" role="img" aria-labelledby="${ns}-title ${ns}-desc" preserveAspectRatio="xMidYMid meet"><title id="${ns}-title">${esc(title)}</title><desc id="${ns}-desc">${esc(DETAILS[id])} Все пропорции иллюстративные: это не обмерный чертёж, не точная архитектурная модель и не доказанный план реконструкции.</desc>${defs(ns)}<ellipse cx="450" cy="291" rx="405" ry="282" fill="url(#${ns}-aura)"/><g fill="none" stroke="#88b5a5" stroke-width=".7" opacity=".067"><path d="M 49 146 H 850 M 49 266 H 850 M 49 386 H 850 M 49 506 H 850 M 158 60 V 546 M 304 60 V 546 M 450 60 V 546 M 596 60 V 546 M 742 60 V 546"/><path d="M 125 473 450 346 775 473 450 565 Z M 204 442 529 542 M 285 410 611 519 M 695 442 370 542 M 613 410 290 519"/></g><ellipse cx="450" cy="506" rx="255" ry="37" fill="#030b0d" opacity=".52"/>${draw.body}${draw.labels}</svg>`;
  }

  function wonderMini(id) {
    id=IDS.includes(id)?id:'khufu';
    const ns='lithos-mini-'+id+'-'+(++serial),a=artist(ns,true),draw=DRAW[id](a,false);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" class="wonder-mini lithos-mini" aria-hidden="true" focusable="false">${defs(ns)}<g transform="translate(6,2) scale(.208)">${draw.body}</g><rect width="200" height="120" fill="url(#${ns}-fade)"/></svg>`;
  }
  globalThis.wonderDrawing=wonderDrawing;
  globalThis.wonderMini=wonderMini;
})();
