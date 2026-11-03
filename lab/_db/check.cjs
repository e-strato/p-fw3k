const fs=require('fs'),path=require('path'),vm=require('vm');// Проверка базы: node sandbox-project/lab/_db/check.cjs — ссылки по id, файлы картинок, дубли, состояния матчей
const LAB=require('path').resolve(__dirname,'..')+'/';
const c={};c.window=c;vm.runInNewContext(fs.readFileSync(LAB+'_db/_db.js','utf8'),c);const D=c.DB_DATA;const E=[];const T=D.teams,P=D.players,TR=D.tours;
const need=(ok,msg)=>{if(!ok)E.push(msg)};
const file=(p,w)=>need(!p||fs.existsSync(LAB+p),'нет файла '+p+' ('+w+')');
for(const t of Object.values(T)){file(t.logo,t.name);need(t.logo,'нет лого '+t.name);need(t.name&&t.mid&&t.tag,'имя '+t.id)}
for(const p of Object.values(P)){need(!p.team||T[p.team],'игрок→команда '+p.nick+' '+p.team);file(p.photo,p.nick);for(const v of Object.values(p.teamAt||{}))need(T[v],'teamAt '+p.nick)}
for(const t of Object.values(TR)){file(t.logo,t.name);for(const x of t.teams)need(T[x],'турнир→команда '+t.id+' '+x)}
for(const m of D.matches){need(TR[m.tour],'матч→турнир '+m.id);need(T[m.a]&&T[m.b],'матч→команда '+m.id);need(['live','soon','done'].includes(m.state),'state '+m.id);need(m.a!==m.b,'сам с собой '+m.id);if(m.state==='done'){need(m.score,'итог без счёта '+m.id);need(m.score&&Math.max(...m.score)>=Math.ceil((m.bo||3)/2),'серия без победителя '+m.id)}}
for(const x of D.transfers){need(!x.from||T[x.from],'трансфер from '+x.id);need(!x.to||T[x.to],'трансфер to '+x.id);need(!x.player||P[x.player],'трансфер игрок '+x.id)}
for(const n of D.news){file(n.img,n.id);n.teams.forEach(x=>need(T[x],'новость→команда '+n.id));n.players.forEach(x=>need(P[x],'новость→игрок '+n.id));n.tours.forEach(x=>need(TR[x],'новость→турнир '+n.id))}
for(const h of Object.values(D.heroes))file(h.img,h.id);
for(const [t,st] of Object.entries(D.heroStats)){need(TR[t],'статистика→турнир '+t);for(const h of st.list)need(D.heroes[h.hero],'статистика→герой '+h.hero)}
// ничего позже «сейчас»
const NOW=D.now,DAY=NOW.slice(0,10),msk=s=>s;
D.news.forEach(n=>need(new Date(n.t).toISOString()<=NOW,'новость из будущего '+n.id+' '+n.t));
D.matches.forEach(m=>{if(m.state!=='soon')need(new Date(m.start)<=new Date(NOW),'сыгран в будущем '+m.id);else need(new Date(m.start)>new Date(NOW),'скоро, но уже прошёл '+m.id);});
D.transfers.forEach(x=>need(x.date<=DAY,'трансфер из будущего '+x.id));
Object.values(TR).forEach(t=>{if(t.state==='soon')need(t.from>DAY&&!t.teams.length,'будущий турнир с участниками '+t.id)});
need(D.matches.filter(m=>m.state==='live').length>=1,'нет live-матча');
const ids=new Set();D.matches.forEach(m=>{need(!ids.has(m.id),'дубль id '+m.id);ids.add(m.id)});
const k=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');const tn={};Object.values(T).forEach(t=>{const kk=k(t.mid);if(tn[kk])E.push('похожие команды '+tn[kk]+' / '+t.name);tn[kk]=t.name});
// матчи пересекаются: одна команда в двух live сразу
const live={};D.matches.filter(m=>m.state==='live').forEach(m=>[m.a,m.b].forEach(x=>{if(live[x]&&live[x]!==m.tour)E.push('live в двух турнирах '+x);live[x]=m.tour}));
const Pv=Object.values(P);
// выдуманная база ссылается только на настоящие id
if(fs.existsSync(LAB+'_db/_fake.js')){const f={};f.window=f;vm.runInNewContext(fs.readFileSync(LAB+'_db/_fake.js','utf8'),f);const F=f.DB_FAKE;
 need(D.matches.some(m=>m.id===F.match),'fake: матч '+F.match);F.subs.forEach(x=>{need(T[x.team],'fake: команда замены '+x.id);need(P[x.in],'fake: кто вошёл '+x.id);need(!x.out||P[x.out],'fake: кто вышел '+x.id);need(!x.match||D.matches.some(m=>m.id===x.match),'fake: матч замены '+x.id)});}
console.log('ошибок',E.length);console.log([...new Set(E)].join('\n'));
console.log('без команды',Pv.filter(p=>!p.team).map(p=>p.nick+' ('+p.status+')').join(', '));
console.log('без фото',Pv.filter(p=>!p.photo).length,'· заглушек лого',Object.values(T).filter(t=>t.logoStub).map(t=>t.name),'· cs2',Object.values(T).filter(t=>t.game==='cs2').map(t=>t.name));
console.log('live',D.matches.filter(m=>m.state==='live').map(m=>m.a+' '+m.score+' '+m.b+' '+m.live),'· soon',D.matches.filter(m=>m.state==='soon').map(m=>m.a+'-'+m.b+' '+m.start));
console.log('новостей без упоминаний',D.news.filter(n=>!n.teams.length&&!n.players.length&&!n.tours.length).length,'· матчей без времени',D.matches.filter(m=>!m.start).map(m=>m.id));
