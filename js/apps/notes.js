/* Notes (메모) 앱 — 독립 모듈. 전역 오염 없음(IIFE). 저장소: localStorage nt.* 키 */
(function(){'use strict';
var SCR=document.getElementById('screen');if(!SCR)return;
var KEY={n:'nt.notes.v1',f:'nt.folders.v1',a:'nt.att.v1',t:'nt.tags.v1',p:'nt.prefs.v1'};
function ld(k,d){if(window.HwahoStability)return window.HwahoStability.readJSON(k,d);try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}}
function sv(k,v){try{if(window.HwahoStability){var ok=window.HwahoStability.writeJSON(k,v);if(!ok)toast('저장 공간이 부족합니다');return ok}localStorage.setItem(k,JSON.stringify(v));return true}catch(e){toast('저장 공간이 부족합니다');return false}}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
var S={n:ld(KEY.n,null),f:ld(KEY.f,null),a:ld(KEY.a,{}),p:ld(KEY.p,{view:'list'}),scr:'f',prev:'f',scope:'all',q:'',fq:'',sel:false,ids:{},cur:null,fedit:false,ro:false,sup:false};
function saveN(){sv(KEY.n,S.n);var t={};S.n.forEach(function(n){n.tags.forEach(function(x){t[x]=1})});sv(KEY.t,Object.keys(t))}
function saveF(){sv(KEY.f,S.f)}function saveA(){sv(KEY.a,S.a)}function saveP(){sv(KEY.p,S.p)}
if(!S.f){S.f=[{id:'f0',name:'메모'}];saveF()}
if(!S.n){S.n=[];saveN()}
S.n.forEach(function(n){n.tags=[];n.html=n.html||'';n.text=n.text||''});
S.n=S.n.filter(function(n){return n.title!=='메모에 오신 것을 환영합니다'&&n.id!=='seed_idea'});
S.n=S.n.filter(function(n){return !(n.del&&!n.keep&&Date.now()-n.del>30*864e5)});
/* 가사 폴더 제거: 폴더 안 메모는 최근 삭제된 항목으로 이동 */
(function(){var rm={},c=0;S.f=S.f.filter(function(f){if(f.name==='가사'||f.id==='f_lyrics'){rm[f.id]=1;c++;return false}return true});
if(!S.f.length)S.f=[{id:'f0',name:'메모'}];
var ch=false;S.n.forEach(function(n){if(rm[n.fid]&&!n.del){n.del=Date.now();n.pin=false;ch=true}});
if(c)saveF();if(ch)saveN()})();
/* 기본 메모 시드 (최초 1회) + 삭제된 항목은 항상 '3주 전'으로 유지 */
(function(){var K='nt.seed.v1',D=864e5,now=Date.now(),PWD=Date.UTC(2025,3,12,3,20);
function body(L){return {text:L.map(function(l){return l.replace(/^\[[ x]\] /,'')}).join('\n'),html:L.map(function(l){var m=/^\[([ x])\] (.*)$/.exec(l);return m?'<div class="nt-ck" data-c="'+(m[1]==='x'?1:0)+'">'+esc(m[2])+'</div>':(l?'<div>'+esc(l)+'</div>':'<div><br></div>')}).join('')}}
function mk(id,t,L,upd,x){var b=body(L),o={id:id,title:t,text:b.text,html:b.html,fid:'f0',pin:false,tags:[],updated:upd};for(var k in x)o[k]=x[k];return o}
if(!ld(K,0)){
S.n.push(
mk('seed_trash_lyr','살어리랏다',['살어리랏다','윤호없이못살어리랏다...'],Date.UTC(2026,6,2,11,0),{del:Date.UTC(2026,6,2,12,0),keep:1}),
mk('seed_album','앨범 작업 체크',['[x] 타이틀곡 믹싱 마감 (9/3)','[x] 앨범 전달 (9/11)','[x] 발매 (10/1)','[ ] 11/20 발매곡 마스터링 확인','[ ] 합동 싱글(12/10) 가이드 녹음','[ ] 승호형한테 보컬 톤 레퍼런스 보내기','[ ] 연말 공연(12/18) 세트 줄이기'],now-2*D,{pin:true}),
mk('seed_mix','믹싱 피드백 (승호형)',['보컬 S음 날카로움 → 디에서 2~3dB','킥 살짝 낮추고 808 롱테일 줄이기','2절 애드립 볼륨 -2','마스터링 전 헤드룸 -1dB 확보','후렴 더블링은 좌우 폭 좁게'],now-9*D),
mk('seed_live','공연 체크리스트',['오프닝은 템포 높은 곡 3곡 연달아','멘트는 30초 이내','인이어 모니터 레벨 낮추기','앙코르는 타이틀곡','10/24 지방 / 10/31 해외 → 이동 시간 매니저한테 확인','물, 목 스프레이, 여분 마이크 커버'],now-12*D),
mk('seed_mv','뮤비 콘셉트',['새벽 도로 + 택시 + 네온','흑백으로 갈지 형광으로 갈지 → 감독님 의견 듣기','소품: 반지 (찾아야 함)','마지막 컷은 말 없이 걷기'],now-16*D),
mk('seed_pw','비번',['사운드클라우드','yh0323s2!','','인스타그램','sh0323insta!!','','유튜브','yh0323tube#','','멜론 아티스트','sh0323mel!','','네이버','shnaver0323*','','작업실 와이파이','studio0323','','노트북','SH0323!!','','넷플릭스','pizza!night'],PWD)
);saveN();sv(K,1)}
var pw=byId('seed_pw');if(pw&&pw.updated>PWD&&pw.text.indexOf('yh0323s2!')>-1&&pw.text.indexOf('pizza!night')>-1){pw.updated=PWD;saveN()}
if(pw&&pw.text.indexOf('스플라이스')>-1){pw.text=pw.text.replace('스플라이스\nhwaho0323beat\n\n','');pw.html=pw.html.replace('<div>스플라이스</div><div>hwaho0323beat</div><div><br></div>','');saveN()}
var t=byId('seed_trash_lyr');if(t&&t.del){t.del=Date.UTC(2026,6,2,12,0);t.updated=Date.UTC(2026,6,2,11,0);t.keep=1;saveN()}
})();
/* ---------- 유틸 ---------- */
var IC={
folder:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
tray:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 14h5l1 2h6l1-2h5"/>',
trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
tag:'<path d="M4 4h8l8 8-8 8-8-8z"/><circle cx="8.5" cy="8.5" r="1.2"/>',
comp:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>',
back:'<path d="M15 5l-7 7 7 7"/>',cv:'<path d="M9 5l7 7-7 7"/>',
more:'<circle cx="12" cy="12" r="9"/><circle cx="8" cy="12" r=".8" fill="currentColor"/><circle cx="12" cy="12" r=".8" fill="currentColor"/><circle cx="16" cy="12" r=".8" fill="currentColor"/>',
share:'<path d="M12 15V4M8 8l4-4 4 4M7 11H5v9h14v-9h-2"/>',
chk:'<circle cx="5" cy="7" r="2"/><circle cx="5" cy="17" r="2"/><path d="M10 7h10M10 17h10M4.2 7l.7.8 1.2-1.4"/>',
tbl:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M12 4v16"/>',
img:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="M4 18l5-5 4 4 3-3 4 4"/>',
pen:'<path d="M4 20l1-4L17 4l3 3L8 19z"/><path d="M14 7l3 3"/>',
undo:'<path d="M9 6L4 11l5 5M4 11h10a5 5 0 0 1 0 10h-4"/>',
srch:'<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
x:'<path d="M6 6l12 12M18 6L6 18"/>',ck:'<path d="M5 12.5l5 5 9-10"/>',
pin:'<path d="M9 4h6l-1 6 3 3H7l3-3zM12 13v7"/>',
minus:'<circle cx="12" cy="12" r="9" fill="currentColor"/><path d="M7.5 12h9" stroke="#fff"/>',
up:'<path d="M6 14l6-6 6 6"/>',dn:'<path d="M6 10l6 6 6-6"/>',nf:'<path d="M12 5v14M5 12h14"/>',
list:'<path d="M4 7h16M4 12h16M4 17h16"/>',grid:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>'};
function I(n,c){return '<svg class="nt-i '+(c||'')+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+IC[n]+'</svg>'}
function sd(d){var x=new Date(d);x.setHours(0,0,0,0);return x.getTime()}
function fd(t,full){var d=new Date(t),hm=d.toLocaleTimeString('ko-KR',{hour:'numeric',minute:'2-digit'});
if(full)return d.getFullYear()+'년 '+(d.getMonth()+1)+'월 '+d.getDate()+'일 '+hm;
var dd=Math.round((sd(Date.now())-sd(t))/864e5);if(dd<=0)return hm;if(dd===1)return '어제';
if(dd<7)return '일월화수목금토'.charAt(d.getDay())+'요일';return d.getFullYear()+'. '+(d.getMonth()+1)+'. '+d.getDate()+'.'}
function fl(t){return (t||'').split('\n').filter(function(s){return s.trim()})[0]||''}
function ttl(n){return n.title||fl(n.text)||'새로운 메모'}
function pv(n){if(n.lock)return '잠김';var t=n.text||'';if(!n.title){var f=fl(t);t=t.slice(t.indexOf(f)+f.length)}return t.replace(/\s+/g,' ').trim()||'추가 텍스트 없음'}
function byId(id){for(var i=0;i<S.n.length;i++)if(S.n[i].id===id)return S.n[i]}
function cur(){return S.cur?byId(S.cur):null}
function fname(id){for(var i=0;i<S.f.length;i++)if(S.f[i].id===id)return S.f[i].name;return '메모'}
function defFid(){if(!S.f.length){S.f.push({id:'f0',name:'메모'});saveF()}return S.f[0].id}
function scopeName(){var s=S.scope;return s==='all'?'전체 메모':s==='trash'?'최근 삭제된 항목':s.indexOf('tag:')===0?'#'+s.slice(4):fname(s)}
function inScope(n,s){if(s==='trash')return !!n.del;if(n.del)return false;if(s==='all')return true;if(s.indexOf('tag:')===0)return n.tags.indexOf(s.slice(4))>-1;return n.fid===s}
function search(q){var tk=q.trim().toLowerCase().split(/\s+/).filter(Boolean),tg=tk.filter(function(t){return t.charAt(0)==='#'}).map(function(t){return t.slice(1)}).filter(Boolean),w=tk.filter(function(t){return t.charAt(0)!=='#'});
return S.n.filter(function(n){if(n.del)return false;var h=(n.title+' '+n.text).toLowerCase();return tg.every(function(g){return n.tags.some(function(x){return x.toLowerCase().indexOf(g)>-1})})&&w.every(function(s){return h.indexOf(s)>-1})})}
function gcAtt(){var u={};S.n.forEach(function(n){(n.html.match(/data-att="[^"]+"/g)||[]).forEach(function(m){u[m.slice(10,-1)]=1})});var ch=false;for(var k in S.a)if(!u[k]){delete S.a[k];ch=true}if(ch)saveA()}
/* ---------- DOM 골격 ---------- */
var R=document.createElement('div');R.id='notes-app';R.dataset.s='f';R.setAttribute('aria-hidden','true');
var SB=function(k){return '<div class="nt-sb" data-sb="'+k+'">'+I('srch')+'<input data-q="'+k+'" placeholder="검색" enterkeyhint="search" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="nt-sx" data-act="sclr" data-k="'+k+'" aria-label="지우기">'+I('x')+'</button></div>'};
R.innerHTML=
'<section class="nt-pane nt-pf"><div class="nt-hd"><span></span><button data-act="fedit"></button></div><div class="nt-sc"><div class="nt-lt">폴더</div>'+SB('f')+'<div class="nt-flist"></div></div><div class="nt-ft"><button data-act="fnew">'+I('folder')+'</button><button data-act="compose" aria-label="새 메모">'+I('comp')+'</button></div></section>'+
'<section class="nt-pane nt-pl"><div class="nt-hd"><button data-act="lback">'+I('back')+'폴더</button><button data-act="lmenu"></button></div><div class="nt-sc"><div class="nt-lt"></div>'+SB('l')+'<div class="nt-llist"></div></div><div class="nt-ft"></div></section>'+
'<section class="nt-pane nt-pe"><div class="nt-hd"><button data-act="eback">'+I('back')+'<span class="nt-bkt">폴더</span></button><div class="nt-hr"><button data-act="share" aria-label="공유">'+I('share')+'</button><button data-act="emenu" aria-label="더 보기">'+I('more')+'</button><button class="nt-done" data-act="done">완료</button></div></div>'+
'<div class="nt-fb" hidden><div class="nt-sb">'+I('srch')+'<input class="nt-fi" placeholder="메모에서 찾기" autocomplete="off" spellcheck="false"><span class="nt-fc"></span></div><button data-act="fp">'+I('up')+'</button><button data-act="fn">'+I('dn')+'</button><button data-act="fx">완료</button></div>'+
'<div class="nt-rb"><span>최근 삭제된 메모입니다</span><button data-act="restore1">복구</button></div>'+
'<div class="nt-sc nt-es"><div class="nt-dt"></div><input class="nt-title" placeholder="제목" enterkeyhint="next" autocomplete="off"><div class="nt-tg"></div><div class="nt-body em" contenteditable="true" data-ph="메모 입력" spellcheck="false"></div></div>'+
'<div class="nt-tbar"><div class="nt-fmt" hidden><button data-act="cmd" data-c="bold"><b>B</b></button><button data-act="cmd" data-c="italic"><i style="font-size:17px;font-family:serif">I</i></button><button data-act="cmd" data-c="underline"><u>U</u></button><button data-act="cmd" data-c="strikeThrough"><s>S</s></button><button data-act="cmd" data-c="h1">제목</button><button data-act="cmd" data-c="h2">머리말</button><button data-act="cmd" data-c="p">본문</button><button data-act="cmd" data-c="insertUnorderedList">• 목록</button><button data-act="cmd" data-c="insertOrderedList">1. 목록</button><button data-act="cmd" data-c="hl">하이라이트</button></div>'+
'<div class="nt-tbl" hidden><button data-act="tb" data-o="ar">행 추가</button><button data-act="tb" data-o="ac">열 추가</button><button data-act="tb" data-o="dr">행 삭제</button><button data-act="tb" data-o="dc">열 삭제</button><button data-act="tb" data-o="dt">표 삭제</button></div>'+
'<div class="nt-tools"><button data-act="aa" aria-label="서식" style="font-weight:600">Aa</button><button data-act="chk" aria-label="체크리스트">'+I('chk')+'</button><button data-act="tbl" aria-label="표">'+I('tbl')+'</button><button data-act="img" aria-label="이미지">'+I('img')+'</button><button data-act="drw" aria-label="그리기">'+I('pen')+'</button><button data-act="cmd" data-c="undo" aria-label="실행 취소">'+I('undo')+'</button><button class="rd" data-act="cmd" data-c="redo" aria-label="다시 실행">'+I('undo')+'</button></div></div>'+
'<input type="file" accept="image/*" class="nt-file" hidden></section>';
SCR.insertBefore(R,document.getElementById('home-indicator-zone'));
function $(s,r){return (r||R).querySelector(s)}
var PF=$('.nt-pf'),PL=$('.nt-pl'),PE=$('.nt-pe'),FL=$('.nt-flist'),LL=$('.nt-llist'),title=$('.nt-title'),body=$('.nt-body'),dtE=$('.nt-dt'),esc0=$('.nt-es'),file=$('.nt-file');
title.readOnly=true;title.setAttribute('inputmode','none');body.contentEditable='false';body.setAttribute('aria-readonly','true');R.querySelectorAll('input:not([type=file]),textarea').forEach(function(x){x.readOnly=true;x.setAttribute('inputmode','none')});$('.nt-tbar').hidden=true;PE.addEventListener('focusin',function(e){if(e.target===title||e.target===body||body.contains(e.target)){e.target.blur()}},true);
/* ---------- 토스트·시트·다이얼로그 ---------- */
function toast(m){var t=document.createElement('div');t.className='nt-toast';t.textContent=m;R.appendChild(t);setTimeout(function(){t.remove()},1600)}
function sheet(items,tt){var o=document.createElement('div');o.className='nt-ov';
o.innerHTML='<div class="nt-bg"></div><div class="nt-as"><div class="nt-asg">'+(tt?'<p>'+esc(tt)+'</p>':'')+items.map(function(x,i){return '<button data-i="'+i+'" class="'+(x.red?'red':'')+'">'+esc(x.t)+'</button>'}).join('')+'</div><button class="nt-asc">취소</button></div>';
R.appendChild(o);o.addEventListener('click',function(e){var b=e.target.closest('button');if(b&&b.dataset.i!=null){o.remove();items[+b.dataset.i].fn()}else if(e.target.classList.contains('nt-bg')||(b&&b.classList.contains('nt-asc')))o.remove()})}
function dlg(o,cb){var d=document.createElement('div');d.className='nt-ov';
d.innerHTML='<div class="nt-bg"></div><div class="nt-dlg"><h4>'+esc(o.t)+'</h4>'+(o.m?'<p>'+esc(o.m)+'</p>':'<p></p>')+(o.input?'<input value="'+esc(o.val||'')+'" placeholder="'+esc(o.ph||'')+'" autocomplete="off">':'')+'<div class="bs"><button class="c">취소</button><button class="o'+(o.red?' red':'')+'">'+esc(o.ok||'확인')+'</button></div></div>';
R.appendChild(d);var inp=$('input',d);if(inp){inp.focus();inp.select()}
function done(){var v=inp?inp.value:true;d.remove();cb(v)}
d.addEventListener('click',function(e){var b=e.target.closest('button');if(b&&b.classList.contains('o'))done();else if(b&&b.classList.contains('c')||e.target.classList.contains('nt-bg'))d.remove()});
if(inp)inp.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.isComposing)done()})}
/* ---------- 렌더 ---------- */
function frow(id,name,n,ic,edit){var u=edit&&id!=='all'&&id!=='trash'&&id.indexOf('tag:')!==0;
return '<div class="nt-fr" data-act="'+(u?'frename':'scope')+'" data-id="'+esc(id)+'">'+(u?'<button class="nt-mn" data-act="fdel" data-id="'+esc(id)+'">'+I('minus')+'</button>':'')+I(ic)+'<b>'+esc(name)+'</b><em>'+n+'</em>'+I('cv','nt-cv')+'</div>'}
function renderF(){var h='',e=S.fedit;$('.nt-pf .nt-hd button').textContent=e?'완료':'편집';
if(S.fq.trim()){FL.innerHTML=rowsH(search(S.fq),{flat:1});return}
var c=function(s){return S.n.filter(function(n){return inScope(n,s)}).length};
h+='<div class="nt-sec">내 iPhone</div><div class="nt-card">'+frow('all','전체 메모',c('all'),'tray',e)+S.f.map(function(f){return frow(f.id,f.name,c(f.id),'folder',e)}).join('')+'</div>';
var tg={};S.n.forEach(function(n){if(!n.del)n.tags.forEach(function(t){tg[t]=(tg[t]||0)+1})});var ks=Object.keys(tg).sort();
if(false)h+='<div class="nt-sec">태그</div><div class="nt-card">'+ks.map(function(t){return frow('tag:'+t,'#'+t,tg[t],'tag',e)}).join('')+'</div>';
h+='<div class="nt-card mt">'+frow('trash','최근 삭제된 항목',c('trash'),'trash',e)+'</div>';FL.innerHTML=h}
function rowH(n,o){var f='';
return '<div class="nt-row" data-act="row" data-id="'+n.id+'"><div class="nt-cc'+(S.ids[n.id]?' on':'')+'">'+I('ck')+'</div><div class="nt-rm"><b>'+(n.pin&&!n.del?I('pin','nt-pn')+' ':'')+esc(ttl(n))+'</b><span><em>'+fd(n.updated)+'</em>'+esc(pv(n))+'</span>'+f+'</div></div>'}
function galH(n){return '<div class="nt-g" data-act="row" data-id="'+n.id+'"><div class="nt-cc'+(S.ids[n.id]?' on':'')+'">'+I('ck')+'</div><div class="pv"><b>'+esc(ttl(n))+'</b>'+esc((n.text||'').slice(0,140))+'</div><div class="tt">'+esc(ttl(n))+'</div><div class="dd">'+fd(n.updated)+'</div></div>'}
function rowsH(arr,o){o=o||{};if(!arr.length)return '<div class="nt-empty">'+(o.flat?'검색 결과 없음':'메모 없음')+'</div>';
var g=S.p.view==='gal'&&!o.flat,fold=o.flat||S.scope==='all'||S.scope.indexOf('tag:')===0;
var sortf=function(a,b){return (b.del||b.updated)-(a.del||a.updated)};
var pins=o.flat||S.scope==='trash'?[]:arr.filter(function(n){return n.pin}).sort(sortf),rest=arr.filter(function(n){return pins.indexOf(n)<0}).sort(sortf);
var B=[['고정됨',pins]];
if(o.flat)B.push([arr.length+'개 찾음',rest]);else if(S.scope==='trash')B.push(['30일 후 영구 삭제',rest]);
else{var by=[['오늘',[]],['어제',[]],['이전 7일',[]],['이전 30일',[]],['그 이전',[]]];rest.forEach(function(n){var d=Math.round((sd(Date.now())-sd(n.updated))/864e5);by[d<=0?0:d===1?1:d<7?2:d<30?3:4][1].push(n)});B=B.concat(by)}
return B.filter(function(b){return b[1].length}).map(function(b){return '<div class="nt-sh">'+esc(b[0])+'</div>'+(g?'<div class="nt-gal">'+b[1].map(galH).join('')+'</div>':'<div>'+b[1].map(function(n){return rowH(n,{fold:fold})}).join('')+'</div>')}).join('')}
function renderL(){var q=S.q.trim(),arr=q?search(S.q):S.n.filter(function(n){return inScope(n,S.scope)});
$('.nt-pl .nt-lt').textContent=q?'검색 결과':scopeName();PL.classList.toggle('sm',S.sel);
var hb=$('.nt-pl .nt-hd button:last-child');hb.innerHTML=S.sel?'완료':I('more');
LL.innerHTML=rowsH(arr,{flat:!!q});var ft=$('.nt-pl .nt-ft'),ids=Object.keys(S.ids).filter(function(k){return S.ids[k]}),tr=S.scope==='trash';
if(S.sel){ft.innerHTML=(tr?'<button data-act="brest" '+(ids.length?'':'disabled')+'>복구</button>':'<button data-act="bmove" '+(ids.length?'':'disabled')+'>이동</button>')+'<span class="nt-cnt">'+(ids.length?ids.length+'개 선택됨':'항목 선택')+'</span><button data-act="bdel" style="color:#ff3b30" '+(ids.length?'':'disabled')+'>'+(tr?'삭제':'삭제')+'</button>'}
else ft.innerHTML='<span></span><span class="nt-cnt">'+arr.length+'개의 메모</span>'+(tr?'<span></span>':'<button data-act="compose" aria-label="새 메모">'+I('comp')+'</button>')}
function go(s){S.scr=s;R.dataset.s=s;R.classList.toggle('kb',false)}
/* ---------- 입력(검색) ---------- */
R.addEventListener('input',function(e){var t=e.target,k=t.dataset&&t.dataset.q;if(k){if(k==='f'){S.fq=t.value;renderF()}else{S.q=t.value;renderL()}t.parentNode.classList.toggle('has',!!t.value)}
else if(t===$('.nt-fi')){findGo(0)}});
/* ---------- 액션 ---------- */
function newFolderDlg(){dlg({t:'새로운 폴더',m:'이 폴더의 이름을 입력하십시오.',input:1,ph:'이름'},function(v){v=String(v).trim();if(!v)return;S.f.push({id:'f'+uid(),name:v});saveF();renderF()})}
function toTrash(ids){ids.forEach(function(id){var n=byId(id);if(n){n.del=Date.now();n.pin=false}});saveN()}
function restore(ids){ids.forEach(function(id){var n=byId(id);if(n){delete n.del;if(!S.f.some(function(f){return f.id===n.fid}))n.fid=defFid();n.updated=n.updated}});saveN()}
function perm(ids){S.n=S.n.filter(function(n){return ids.indexOf(n.id)<0});saveN();gcAtt()}
function moveDlg(ids,after){var it=S.f.map(function(f){return {t:f.name,fn:function(){ids.forEach(function(id){var n=byId(id);if(n)n.fid=f.id});saveN();toast('이동됨');after()}}});sheet(it,'폴더로 이동')}
function pinT(n){n.pin=!n.pin;saveN()}
function tagDlg(n,after){dlg({t:'태그',m:'공백으로 구분해 여러 태그를 입력하세요.',input:1,val:n.tags.map(function(t){return '#'+t}).join(' '),ph:'#태그 #태그'},function(v){var a=[];String(v).split(/[\s,]+/).forEach(function(t){t=t.replace(/^#+/,'');if(t&&a.indexOf(t)<0)a.push(t)});n.tags=a;saveN();after()})}
function ids0(){return Object.keys(S.ids).filter(function(k){return S.ids[k]})}
function rerender(){renderF();renderL()}
function ctxSheet(id){var n=byId(id);if(!n)return;var after=rerender;
if(n.del)return sheet([{t:'복구',fn:function(){restore([id]);after()}},{t:'영구 삭제',red:1,fn:function(){perm([id]);after()}}],ttl(n));
sheet([{t:n.pin?'고정 해제':'메모 고정',fn:function(){pinT(n);after()}},{t:'이동',fn:function(){moveDlg([id],after)}},{t:'삭제',red:1,fn:function(){toTrash([id]);after();toast('최근 삭제된 항목으로 이동')}}],ttl(n))}
var A={
scope:function(b){S.scope=b.dataset.id;S.q='';$('[data-q=l]').value='';$('[data-sb=l]').classList.remove('has');S.sel=false;S.ids={};renderL();go('l')},
fedit:function(){S.fedit=!S.fedit;renderF()},
fnew:newFolderDlg,
frename:function(b){var f=S.f.filter(function(x){return x.id===b.dataset.id})[0];if(!f)return;dlg({t:'폴더 이름 변경',input:1,val:f.name},function(v){v=String(v).trim();if(v){f.name=v;saveF();renderF()}})},
fdel:function(b,e){e.stopPropagation();var id=b.dataset.id;dlg({t:'폴더 삭제',m:'폴더 안의 메모는 최근 삭제된 항목으로 이동합니다.',ok:'삭제',red:1},function(){toTrash(S.n.filter(function(n){return n.fid===id&&!n.del}).map(function(n){return n.id}));S.f=S.f.filter(function(f){return f.id!==id});saveF();renderF()})},
lback:function(){S.sel=false;S.ids={};S.q='';go('f');renderF()},
lmenu:function(){if(S.sel){S.sel=false;S.ids={};return renderL()}
var it=[{t:S.p.view==='gal'?'목록으로 보기':'갤러리로 보기',fn:function(){S.p.view=S.p.view==='gal'?'list':'gal';saveP();renderL()}},{t:'메모 선택',fn:function(){S.sel=true;S.ids={};renderL()}}];
if(S.scope==='trash')it.push({t:'모두 삭제',red:1,fn:function(){dlg({t:'모두 삭제',m:'최근 삭제된 항목을 영구 삭제합니다.',ok:'삭제',red:1},function(){perm(S.n.filter(function(n){return n.del}).map(function(n){return n.id}));rerender()})}});sheet(it)},
sclr:function(b){var k=b.dataset.k,i=$('[data-q='+k+']');i.value='';b.parentNode.classList.remove('has');if(k==='f'){S.fq='';renderF()}else{S.q='';renderL()}i.focus()},
row:function(b){var id=b.dataset.id;if(S.sel){S.ids[id]=!S.ids[id];return renderL()}openNote(id,S.scr)},
compose:function(){newNote()},
bmove:function(){moveDlg(ids0(),function(){S.sel=false;S.ids={};rerender()})},
brest:function(){restore(ids0());S.sel=false;S.ids={};rerender();toast('복구됨')},
bdel:function(){var ids=ids0(),tr=S.scope==='trash';if(tr)dlg({t:'영구 삭제',m:'선택한 메모를 영구 삭제합니다.',ok:'삭제',red:1},function(){perm(ids);S.sel=false;S.ids={};rerender()});else{toTrash(ids);S.sel=false;S.ids={};rerender();toast('최근 삭제된 항목으로 이동')}},
eback:function(){leaveE()},
share:function(){var n=cur();if(!n)return;commit();var tx=(n.title?n.title+'\n':'')+n.text;if(navigator.share)navigator.share({title:n.title,text:tx}).catch(function(){});else copy(tx)},
emenu:function(){var n=cur();if(!n)return;commit();var it;
if(S.ro)it=[{t:'복구',fn:A.restore1},{t:'영구 삭제',red:1,fn:function(){dlg({t:'영구 삭제',m:'이 메모를 영구 삭제합니다.',ok:'삭제',red:1},function(){perm([n.id]);S.cur=null;leaveE(1)})}}];
else it=[{t:n.pin?'고정 해제':'메모 고정',fn:function(){pinT(n);toast(n.pin?'고정됨':'고정 해제됨')}},{t:'메모 이동',fn:function(){moveDlg([n.id],function(){})}},{t:'메모에서 찾기',fn:openFind},{t:'텍스트 복사',fn:function(){copy((n.title?n.title+'\n':'')+n.text)}},{t:'삭제',red:1,fn:function(){toTrash([n.id]);toast('최근 삭제된 항목으로 이동');leaveE()}}];sheet(it)},
done:function(){body.blur();title.blur();if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();commit()},
restore1:function(){var n=cur();if(!n)return;restore([n.id]);toast('복구됨');leaveE()},
etag:function(){var n=cur();if(n&&!S.ro)tagDlg(n,renderTags)},
aa:function(){var f=$('.nt-fmt');f.hidden=!f.hidden;selUI()},
cmd:function(b){fmt(b.dataset.c)},
chk:chkItem,tbl:function(){focusB();if(curTd())return;restoreSel();ex('insertHTML','<table class="nt-tb"><tbody><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr></tbody></table><div><br></div>');selUI()},
tb:function(b){tbOp(b.dataset.o)},
img:function(){saveSel();file.value='';file.click()},
drw:function(){saveSel();openDraw()},
fp:function(){findGo(-1,1)},fn:function(){findGo(1,1)},fx:function(){closeFind()}};
R.addEventListener('click',function(e){if(S.sup){S.sup=false;return}var b=e.target.closest('[data-act]');if(!b||!R.contains(b))return;var f=A[b.dataset.act];if(f)f(b,e)});
/* 길게 누르기 / 우클릭 → 메모 메뉴 */
(function(){var tm=null,x0=0,y0=0;function cl(){clearTimeout(tm);tm=null}
LL.addEventListener('pointerdown',function(e){var r=e.target.closest('[data-act=row]');if(!r||S.sel)return;x0=e.clientX;y0=e.clientY;tm=setTimeout(function(){S.sup=true;ctxSheet(r.dataset.id)},520)});
LL.addEventListener('pointermove',function(e){if(tm&&(Math.abs(e.clientX-x0)>8||Math.abs(e.clientY-y0)>8))cl()});
['pointerup','pointercancel','pointerleave'].forEach(function(t){LL.addEventListener(t,cl)});
R.addEventListener('contextmenu',function(e){var r=e.target.closest('[data-act=row]');if(r&&!S.sel){e.preventDefault();ctxSheet(r.dataset.id)}})})();
function copy(tx){function fb(){var t=document.createElement('textarea');t.value=tx;t.style.cssText='position:fixed;opacity:0;user-select:text;-webkit-user-select:text';R.appendChild(t);t.select();try{document.execCommand('copy');toast('복사됨')}catch(e){toast('복사할 수 없습니다')}t.remove()}
if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(tx).then(function(){toast('복사됨')},fb);else fb()}
/* ---------- 편집기 ---------- */
var lastR=null,tmr=null,fr=[],fi=-1;
function ser(){var c=body.cloneNode(true);[].forEach.call(c.querySelectorAll('img[data-att]'),function(i){i.removeAttribute('src')});return c.innerHTML}
function hyd(h){body.innerHTML=h;[].forEach.call(body.querySelectorAll('img[data-att]'),function(i){var a=S.a[i.dataset.att];if(a)i.src=a.d;i.draggable=false})}
function emp(){body.classList.toggle('em',!body.querySelector('img,table,.nt-ck,li')&&!(body.textContent||'').replace(/\s/g,''))}
function commit(force){var n=cur();if(!n||S.ro)return;clearTimeout(tmr);var t=title.value.trim(),h=ser();if(!force&&((t===n.title&&h===n.html)||(t===S.bt&&h===S.bh)))return;
n.title=t;n.html=h;n.text=body.innerText.replace(/\u00a0/g,' ').replace(/\n{3,}/g,'\n\n').trim();n.updated=n.id==='seed_letter'?Date.UTC(2026,6,31,15,0):Date.now();S.bh=h;S.bt=t;saveN();dtE.textContent=fd(n.updated,1)}
function sched(){emp();clearTimeout(tmr);tmr=setTimeout(commit,350)}
function renderTags(){var n=cur(),h='';if(n)h=n.tags.map(function(t){return '<button data-act="etag">#'+esc(t)+'</button>'}).join('');$('.nt-tg').innerHTML=h}
var LK={};
function leaveLockedPreview(){S.lockedPreview=false;S.cur=null;S.ro=false;PE.classList.remove('ro','edf');title.value='';hyd('');go(S.prev||'l');rerender()}
function openNote(id,prev,focus){var n=byId(id);if(!n)return;if(n.lock&&!LK[id]){S.cur=id;S.prev=prev||'l';S.ro=false;S.lockedPreview=true;title.value='';hyd('');dtE.textContent='';renderTags();PE.classList.remove('ro','edf');title.readOnly=true;body.contentEditable='false';$('.nt-bkt').textContent=S.prev==='l'?scopeName():'폴더';closeFind();$('.nt-fmt').hidden=true;go('e');esc0.scrollTop=0;askLock(n,prev,focus);return}S.lockedPreview=false;S.cur=id;S.prev=prev||'f';S.ro=!!n.del;title.value=n.title;hyd(n.html);S.bh=ser();S.bt=n.title;dtE.textContent=fd(n.updated,1);renderTags();emp();
PE.classList.toggle('ro',S.ro);title.readOnly=S.ro;body.contentEditable=S.ro?'false':'true';$('.nt-bkt').textContent=S.prev==='l'?scopeName():'폴더';
closeFind();$('.nt-fmt').hidden=true;go('e');emp();setTimeout(emp,0);esc0.scrollTop=0;if(focus&&!S.ro){void PE.offsetWidth;title.focus()}}
function newNote(){var fid=S.scope!=='all'&&S.scope!=='trash'&&S.scope.indexOf('tag:')!==0&&S.f.some(function(f){return f.id===S.scope})?S.scope:defFid();
var n={id:uid(),title:'',text:'',html:'',fid:fid,pin:false,tags:[],updated:Date.now()};S.n.push(n);saveN();openNote(n.id,S.scr,true)}
function leaveE(skipCommit){if(S.lockedPreview){var lockView=PE.querySelector('.nt-lock-note');if(lockView)lockView.remove();leaveLockedPreview();return}var n=cur();if(n){if(!skipCommit)commit();if(!S.ro&&!n.title&&!n.text&&!/<img|<table/.test(n.html)){S.n=S.n.filter(function(x){return x!==n});saveN()}}
S.cur=null;S.ro=false;clearTimeout(tmr);if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();PE.classList.remove('edf');R.classList.remove('kb');R.style.bottom='';go(S.prev||'f');rerender();gcAtt()}
title.addEventListener('input',sched);body.addEventListener('input',sched);body.addEventListener('compositionend',sched);
title.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.isComposing){e.preventDefault();body.focus()}});
body.addEventListener('focus',function(){try{document.execCommand('defaultParagraphSeparator',false,'div')}catch(e){}});
body.addEventListener('paste',function(e){if(S.ro)return;e.preventDefault();var t=(e.clipboardData||window.clipboardData).getData('text/plain');if(t)document.execCommand('insertText',false,t)});
body.addEventListener('drop',function(e){e.preventDefault()});
body.addEventListener('click',function(e){var t=e.target;if(t.tagName==='IMG'){return viewer(t)}var c=t.closest&&t.closest('.nt-ck');if(c&&t===c&&!S.ro&&e.offsetX<30){c.setAttribute('data-c',c.getAttribute('data-c')==='1'?'0':'1');commit()}});
body.addEventListener('keydown',function(e){if(e.isComposing||e.keyCode===229)return;var b=blk();if(!b||b.nodeType===3||!b.classList||!b.classList.contains('nt-ck'))return;var s=getSelection();
function off(){b.classList.remove('nt-ck');b.removeAttribute('data-c');commit()}
if(e.key==='Enter'){e.preventDefault();if(!b.textContent.trim())return off();var r=s.getRangeAt(0),r2=r.cloneRange();r2.selectNodeContents(b);r2.setStart(r.endContainer,r.endOffset);var f=r2.extractContents(),n=document.createElement('div');n.className='nt-ck';n.setAttribute('data-c','0');n.appendChild(f);
if(!n.textContent&&!n.querySelector('br'))n.appendChild(document.createElement('br'));if(!b.textContent&&!b.querySelector('br'))b.appendChild(document.createElement('br'));
b.parentNode.insertBefore(n,b.nextSibling);var nr=document.createRange();nr.setStart(n,0);nr.collapse(true);s.removeAllRanges();s.addRange(nr);commit();n.scrollIntoView({block:'nearest'})}
else if(e.key==='Backspace'&&s.isCollapsed){var r=s.getRangeAt(0),q=document.createRange();q.selectNodeContents(b);q.setEnd(r.startContainer,r.startOffset);if(!q.toString()){e.preventDefault();off()}}});
function blk(){var s=getSelection();if(!s.rangeCount)return null;var n=s.anchorNode;while(n&&n!==body){if(n.parentNode===body)return n;n=n.parentNode}return null}
function curTd(){var s=getSelection(),n=s.anchorNode;if(!n)return null;var e=n.nodeType===3?n.parentNode:n,td=e&&e.closest&&e.closest('td');return td&&body.contains(td)?td:null}
function saveSel(){var s=getSelection();if(s.rangeCount&&body.contains(s.anchorNode))lastR=s.getRangeAt(0).cloneRange()}
function restoreSel(){if(lastR&&document.activeElement!==body){body.focus();var s=getSelection();s.removeAllRanges();s.addRange(lastR)}}
function focusB(){if(S.ro)return;if(!body.contains(getSelection().anchorNode)){body.focus();if(lastR){var s=getSelection();s.removeAllRanges();s.addRange(lastR)}else{var r=document.createRange();r.selectNodeContents(body);r.collapse(false);var s2=getSelection();s2.removeAllRanges();s2.addRange(r)}}}
function ex(c,v){if(S.ro)return;focusB();document.execCommand(c,false,v);sched()}
function fmt(c){if(S.ro)return;focusB();
if(c==='h1'||c==='h2'||c==='p'){var cv=(document.queryCommandValue('formatBlock')||'').toLowerCase();ex('formatBlock',c==='p'||cv===c?'<div>':'<'+c+'>')}
else if(c==='hl'){var on=/255,\s*224,\s*102/.test(document.queryCommandValue('hiliteColor')||document.queryCommandValue('backColor')||'');ex('hiliteColor',on?'transparent':'#ffe066')}
else ex(c);selUI()}
function chkItem(){if(S.ro)return;focusB();if(curTd())return;var b=blk();if(!b||b.nodeType===3){document.execCommand('formatBlock',false,'<div>');b=blk()}
if(b&&(b.nodeName==='UL'||b.nodeName==='OL')){document.execCommand(b.nodeName==='UL'?'insertUnorderedList':'insertOrderedList');b=blk()}
if(b&&b.nodeName==='DIV'){if(b.classList.contains('nt-ck')){b.classList.remove('nt-ck');b.removeAttribute('data-c')}else{b.classList.add('nt-ck');b.setAttribute('data-c','0')}sched()}
else ex('insertHTML','<div class="nt-ck" data-c="0"><br></div>')}
function tbOp(o){var td=curTd();if(!td)return;var tr=td.parentNode,tb=tr.closest('table'),ci=td.cellIndex,ri=tr.rowIndex;
if(o==='ar'){var n=tr.cloneNode(true);[].forEach.call(n.cells,function(c){c.innerHTML='<br>'});tr.parentNode.insertBefore(n,tr.nextSibling)}
else if(o==='ac'){[].forEach.call(tb.rows,function(r){r.insertCell(ci+1).innerHTML='<br>'})}
else if(o==='dr'){if(tb.rows.length>1)tb.deleteRow(ri);else tb.remove()}
else if(o==='dc'){if(tr.cells.length>1)[].forEach.call(tb.rows,function(r){r.deleteCell(ci)});else tb.remove()}
else tb.remove();commit(1);selUI()}
function selUI(){if(S.scr!=='e')return;var s=getSelection();if(!s.anchorNode||!body.contains(s.anchorNode))return;lastR=s.getRangeAt(0).cloneRange();
$('.nt-tbl').hidden=!curTd();var f=$('.nt-fmt');if(f.hidden)return;
[].forEach.call(f.querySelectorAll('button'),function(b){var c=b.dataset.c,on=false;try{if(c==='h1'||c==='h2')on=(document.queryCommandValue('formatBlock')||'').toLowerCase()===c;else if(c!=='p'&&c!=='hl')on=document.queryCommandState(c)}catch(e){}b.classList.toggle('on',on)})}
document.addEventListener('selectionchange',selUI);
PE.addEventListener('focusin',function(e){if(e.target===title||e.target===body||body.contains(e.target))PE.classList.add('edf')});
PE.addEventListener('focusout',function(){setTimeout(function(){var a=document.activeElement;if(!(a===title||a===body||body.contains(a)))PE.classList.remove('edf')},60)});
$('.nt-tbar').addEventListener('pointerdown',function(e){e.preventDefault()});
/* 메모 내 검색 */
function openFind(){$('.nt-fb').hidden=false;var i=$('.nt-fi');i.value='';$('.nt-fc').textContent='';i.focus()}
function closeFind(){$('.nt-fb').hidden=true;try{if(CSS.highlights){CSS.highlights.delete('nt-find');CSS.highlights.delete('nt-cur')}}catch(e){}fr=[];fi=-1}
function findGo(d,nav){var q=$('.nt-fi').value.toLowerCase();fr=[];fi=nav?fi:-1;
if(q){var w=document.createTreeWalker(body,NodeFilter.SHOW_TEXT),t;while((t=w.nextNode())){var s=t.nodeValue.toLowerCase(),i=0;while((i=s.indexOf(q,i))>-1){var r=document.createRange();r.setStart(t,i);r.setEnd(t,i+q.length);fr.push(r);i+=q.length}}}
if(!fr.length){$('.nt-fc').textContent=q?'0':'';try{CSS.highlights.delete('nt-find');CSS.highlights.delete('nt-cur')}catch(e){}return}
fi=nav?(fi+d+fr.length)%fr.length:0;$('.nt-fc').textContent=(fi+1)+'/'+fr.length;
try{CSS.highlights.set('nt-find',new Highlight.apply(null,fr));CSS.highlights.set('nt-cur',new Highlight(fr[fi]))}catch(e){}
var p=fr[fi].startContainer.parentElement;if(p)p.scrollIntoView({block:'center'})}
$('.nt-fi').addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.isComposing){e.preventDefault();findGo(e.shiftKey?-1:1,1)}});
/* ---------- 이미지 / 그리기 / 뷰어 ---------- */
function putAtt(d,type){var id='a'+uid();S.a[id]={d:d,type:type,t:Date.now()};if(!sv(KEY.a,S.a)){delete S.a[id];return}
restoreSel();focusB();document.execCommand('insertHTML',false,'<img data-att="'+id+'" src="'+d+'"><div><br></div>');sched()}
file.addEventListener('change',function(){var f=file.files[0];if(!f)return;var fr=new FileReader();fr.onload=function(){var im=new Image();im.onload=function(){var s=Math.min(1,1200/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);putAtt(c.toDataURL('image/jpeg',.82),'img')};im.onerror=function(){toast('이미지를 불러올 수 없습니다')};im.src=fr.result};fr.readAsDataURL(f)});
function viewer(img){var o=document.createElement('div');o.className='nt-ov nt-vw';o.innerHTML='<img src="'+img.src+'"><button class="x">닫기</button>'+(S.ro?'':'<button class="d">삭제</button>');R.appendChild(o);
o.addEventListener('click',function(e){var b=e.target.closest('button');if(b&&b.classList.contains('d')){img.remove();commit(1);emp()}o.remove()})}
function openDraw(){if(S.ro)return;var o=document.createElement('div'),cols=['#000000','#ff3b30','#007aff','#34c759','#ffcc00'];o.className='nt-ov nt-dr';
o.innerHTML='<div class="nt-dh"><button data-d="x">취소</button><b>그리기</b><button data-d="ok" style="font-weight:600">완료</button></div><div class="nt-dc"><canvas></canvas></div><div class="nt-dtl">'+cols.map(function(c,i){return '<button class="c'+(i?'':' on')+'" data-c="'+c+'" style="background-color:'+c+'"></button>'}).join('')+'<button class="c" data-c="#ffffff" style="background-color:#fff;border-color:var(--ln)" aria-label="지우개">⌫</button><button class="w" data-w="3"><i style="width:4px;height:4px"></i></button><button class="w on" data-w="6"><i style="width:8px;height:8px"></i></button><button class="w" data-w="12"><i style="width:13px;height:13px"></i></button><button data-d="u">되돌리기</button><button data-d="c">지우기</button></div>';
R.appendChild(o);var box=$('.nt-dc',o),cv=$('canvas',o),cx=cv.getContext('2d'),W=box.clientWidth,H=box.clientHeight,dp=Math.min(2,window.devicePixelRatio||1),st=[],col='#000000',wd=6,ps=null;
cv.width=W*dp;cv.height=H*dp;cv.style.width=W+'px';cv.style.height=H+'px';
function draw(){cx.setTransform(dp,0,0,dp,0,0);cx.fillStyle='#fff';cx.fillRect(0,0,W,H);cx.lineCap=cx.lineJoin='round';st.forEach(function(s){cx.strokeStyle=s.c;cx.fillStyle=s.c;cx.lineWidth=s.w;cx.beginPath();if(s.p.length===1){cx.arc(s.p[0][0],s.p[0][1],s.w/2,0,7);cx.fill();return}s.p.forEach(function(p,i){i?cx.lineTo(p[0],p[1]):cx.moveTo(p[0],p[1])});cx.stroke()})}
function pt(e){var r=cv.getBoundingClientRect();return [(e.clientX-r.left)*(W/r.width),(e.clientY-r.top)*(H/r.height)]}
cv.addEventListener('pointerdown',function(e){cv.setPointerCapture(e.pointerId);ps={c:col,w:col==='#ffffff'?wd*3:wd,p:[pt(e)]};st.push(ps);draw()});
cv.addEventListener('pointermove',function(e){if(ps){ps.p.push(pt(e));draw()}});
['pointerup','pointercancel'].forEach(function(t){cv.addEventListener(t,function(){ps=null})});draw();
o.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
if(b.dataset.c){col=b.dataset.c;[].forEach.call(o.querySelectorAll('.c'),function(x){x.classList.toggle('on',x===b)})}
else if(b.dataset.w){wd=+b.dataset.w;[].forEach.call(o.querySelectorAll('.w'),function(x){x.classList.toggle('on',x===b)})}
else if(b.dataset.d==='u'){st.pop();draw()}else if(b.dataset.d==='c'){st=[];draw()}
else if(b.dataset.d==='x')o.remove();
else if(b.dataset.d==='ok'){var d=st.length?cv.toDataURL('image/png'):null;o.remove();if(d)putAtt(d,'draw')}})}
/* ---------- 키보드(visualViewport) ---------- */
(function(){var v=window.visualViewport;if(!v)return;function f(){if(!R.classList.contains('on'))return;var kb=Math.max(0,window.innerHeight-v.height-v.offsetTop),big=kb>80;R.classList.toggle('kb',big);R.style.bottom=big?kb+'px':''}
v.addEventListener('resize',f);v.addEventListener('scroll',f)})();
window.addEventListener('pagehide',function(){commit()});document.addEventListener('visibilitychange',function(){if(document.hidden)commit()});
/* ---------- 열기/닫기·홈 연동 ---------- */
var dark=window.matchMedia('(prefers-color-scheme: dark)');
function theme(){SCR.classList.toggle('app-light',R.classList.contains('on'))}
if(dark.addEventListener)dark.addEventListener('change',theme);
function openApp(){S.fedit=false;S.sel=false;S.ids={};if(S.scr==='e'&&!cur())go(S.prev||'f');rerender();R.classList.add('on');R.setAttribute('aria-hidden','false');theme()}
function closeApp(){if(!R.classList.contains('on'))return;if(S.scr==='e')leaveE();R.classList.remove('on');R.setAttribute('aria-hidden','true');R.style.bottom='';theme()}
var iz=document.getElementById('home-indicator-zone');
if(iz){var p0=null;iz.addEventListener('pointerdown',function(e){p0={x:e.clientX,y:e.clientY}},true);
iz.addEventListener('pointermove',function(e){if(p0&&R.classList.contains('on')&&e.clientY-p0.y<-24){p0=null;closeApp()}},true);
['pointerup','pointercancel'].forEach(function(t){iz.addEventListener(t,function(e){if(p0&&R.classList.contains('on')&&Math.abs(e.clientY-p0.y)<8&&Math.abs(e.clientX-p0.x)<8)closeApp();p0=null},true)})}
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&R.classList.contains('on')&&!R.querySelector('.nt-ov'))closeApp()});
/* 홈 화면 아이콘 등록 (기존 '메모' 아이콘이 있으면 연결만) */
var ICON='<svg viewBox="0 0 60 60"><rect width="60" height="60" fill="#fff"/><rect width="60" height="17" fill="#ffd60a"/><path d="M0 17.5h60" stroke="#e5e5ea"/><g stroke="#d1d1d6" stroke-width="1"><path d="M0 29.500h60M0 40.500h60M0 51.500h60"/></g><path d="M9 9h22" stroke="#7a5d00" stroke-width="2.4" stroke-linecap="round" opacity=".55"/></svg>';
function inject(){var g=document.getElementById('grid');if(!g||document.querySelector('.app[data-nt]')||!g.querySelector('.app'))return;
var ex=[].filter.call(document.querySelectorAll('.app'),function(a){var l=a.querySelector('.label');return l&&/^(메모|Notes)$/i.test(l.textContent.trim())})[0];
if(ex){ex.setAttribute('data-nt','1');return}
var a=document.createElement('div');a.className='app';a.setAttribute('data-nt','1');a.setAttribute('role','button');a.tabIndex=0;a.setAttribute('aria-label','메모');a.innerHTML='<div class="icon">'+ICON+'</div><span class="label">메모</span>';g.appendChild(a)}
SCR.addEventListener('pointerdown',function(e){var a=e.target.closest&&e.target.closest('.app[data-nt]');if(a)a.classList.add('pressed')},true);
['pointerup','pointercancel','pointerleave'].forEach(function(t){SCR.addEventListener(t,function(){var a=document.querySelector('.app[data-nt].pressed');if(a)a.classList.remove('pressed')},true)});
SCR.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('.app[data-nt]');if(a&&!R.contains(a)){e.stopPropagation();e.preventDefault();openApp()}},true);
SCR.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('.app[data-nt]')){e.preventDefault();openApp()}});
var home=document.getElementById('home');inject();
if(home&&window.MutationObserver){var raf=0;new MutationObserver(function(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;inject()})}).observe(home,{childList:true,subtree:true})}
window.addEventListener('load',inject);
;(function(){var K2='nt.seed.letter.v1',T='나 진짜 이런말 안하려고 했는데 술먹으니까 자꾸 니 생각나서 씀.. 안보내는게 맞는거 아는데 그냥 보내고싶엇어 내가 찐짜 잘못햇어 그때는 왜 몰랐을까 네가 나한테 얼마나 ㅈㄹ해줬는지 이제와서 이런말 하는 것도 웃기고 염치없는거 아는데 그래도 한번만 더 기회주면안되나...나이제오마카세도 데려가줄수있는데.... 나 아직도 너 너무 좋아하고 보고싶어 진심이야 맨날 후회해 내가 왜그랫ㅆ을까 조금만 더 잘해줄걸 니말좀들어 줄걸 너는 나한테 진짜 잘해줬는데 나는 왜 그게 당엲줄 알았을까 미안해 진짜 미안해 나 너랑 다시만나고싶어 그냥 하는 말 아니야 네가 싫다고하면 어쩔수 없는거 아는데 그래더 혹시나 하는 마음에 어휴됏다못해먹겠네',H='<div>'+T+'</div>';var n=S.n.find(function(x){return x.id==='seed_letter'});if(!n){n={id:'seed_letter',fid:'f0',pin:false,tags:[],del:0};S.n.push(n)}n.title='윤호에게…..';n.text=T;n.html=H;n.fid='f0';n.pin=false;n.tags=[];n.updated=Date.UTC(2026,6,31,15,0);delete n.lock;delete n.hint;saveN();try{localStorage.setItem(K2,'1')}catch(e){}})();})();
