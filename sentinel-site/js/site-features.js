/* ===== bundled from js/core.js ===== */
/* ===== ORIGINAL SCRIPT BLOCK 1 ===== */

(function(){
 const navTriggers=[...document.querySelectorAll('.nav-trigger')];
 const brand=document.querySelector('.brand');
 brand?.addEventListener('click',e=>{ e.preventDefault(); if(location.hash!=='#home'){location.hash='#home';} else {show('#home');} });
 const mobile=document.getElementById('mobileMenu');
 const all=document.getElementById('allMenu');
 function show(hash){
   let id=(hash||'#home').replace('#','').split('?')[0];
   if(!document.getElementById(id)) id='home';
   document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===id));
   document.querySelectorAll('.side-nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+id));
   if(id==='notice-view'&&typeof window.__renderNoticeDetail==='function'){
    const m=(hash||'').match(/id=(\d+)/); if(m) window.__renderNoticeDetail(m[1]);
   }
   if(id==='press-view'&&typeof window.__renderPressDetail==='function'){
    const m=(hash||'').match(/id=(\d+)/); if(m) window.__renderPressDetail(m[1]);
   }
   if(id==='law-view'&&typeof window.__renderLawDetail==='function'){
    const m=(hash||'').match(/id=(\d+)/); if(m) window.__renderLawDetail(m[1]);
   }
   if(id==='briefing-view'&&typeof window.__renderBriefingDetail==='function'){
    const m=(hash||'').match(/id=(\d+)/); if(m) window.__renderBriefingDetail(m[1]);
   }
   if(id==='rules-view'&&typeof window.__renderRuleDetail==='function'){
    const m=(hash||'').match(/id=(\d+)/); if(m) window.__renderRuleDetail(m[1]);
   }
   window.scrollTo({top:0,behavior:'auto'});
 }
 window.addEventListener('hashchange',()=>show(location.hash));
 document.addEventListener('click',e=>{
   const a=e.target.closest('a[href^="#"]'); if(!a) return;
   const h=a.getAttribute('href'); if(h==='#' || h==='#login'||h==='#join'||h==='#english'||h==='#sitemap') return;
   const id=h.replace('#','').split('?')[0];
   if(document.getElementById(id)){e.preventDefault();location.hash=h;show(h)}
 });
 document.getElementById('fontUp')?.addEventListener('click',()=>document.body.classList.add('large'));
 document.getElementById('fontDown')?.addEventListener('click',()=>document.body.classList.remove('large'));
 document.getElementById('contrastBtn')?.addEventListener('click',()=>document.body.classList.toggle('contrast'));
 navTriggers.forEach(btn=>btn.addEventListener('click',()=>{const x=btn.getAttribute('aria-expanded')==='true';navTriggers.forEach(b=>b.setAttribute('aria-expanded','false'));btn.setAttribute('aria-expanded',String(!x))}));
 const panel=document.getElementById('mobilePanel'), closePanel=document.getElementById('closeMobilePanel');
 function togglePanel(open){panel.hidden=!open;document.body.classList.toggle('menu-open',open);all.setAttribute('aria-expanded',String(open));}
 all.addEventListener('click',()=>togglePanel(panel.hidden));
 closePanel.addEventListener('click',()=>togglePanel(false));
 panel.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(a)togglePanel(false)});
 const searchForm=document.getElementById('siteSearch'), input=document.getElementById('searchInput');
 searchForm.addEventListener('submit',e=>{e.preventDefault();const q=input.value.trim();if(!q)return;location.hash='searchPage?query='+encodeURIComponent(q);show('#searchPage');renderSearch(q)});
 function renderSearch(q){
 const root=document.getElementById('searchItems');
 const summary=document.getElementById('searchSummary');
 const query=q.trim().toLowerCase();
 const norm=s=>String(s||'').toLowerCase().replace(/\\s+/g,' ').trim();
 const esc=s=>String(s||'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
 const index=[];
 document.querySelectorAll('.page:not(#searchPage)').forEach(page=>{
   const title=page.querySelector('.content-head h1, h1');
   const desc=page.querySelector('.content-head p');
   const text=norm(page.innerText);
   if(title && text) index.push({title:title.textContent.trim(),desc:desc?desc.textContent.trim():'',text,href:'#'+page.id});
 });
 if(typeof NOTICE_DATA!=='undefined') NOTICE_DATA.forEach(x=>index.push({title:x[1],desc:x[5]||x[6]||'',text:norm(x.join(' ')),href:'#notice'}));
 if(typeof PRESS_DATA!=='undefined') PRESS_DATA.forEach(x=>index.push({title:x[1],desc:x[5]||x[4]||'',text:norm(x.join(' ')),href:'#press',type:'보도자료'}));
 document.querySelectorAll('.sentinel-row').forEach((row,i)=>{
   const name=row.querySelector('.sentinel-info>strong')?.textContent?.trim()||'';
   const grade=row.querySelector('.sentinel-grade')?.textContent?.trim()||'';
   const text=norm(row.innerText);
   if(name)index.push({title:name,desc:'센티넬 · '+(grade?grade+'급 · ':'')+(row.querySelector('.sentinel-info dd:nth-of-type(3)')?.textContent?.trim()||''),text,href:row.dataset.sentinelHref||'#sentinels',type:'센티넬'});
 });
 document.querySelectorAll('.apostle-row').forEach(row=>{
   const name=row.querySelector('.apostle-info>strong')?.textContent?.trim()||'';
   const text=norm(row.innerText);
   if(name)index.push({title:name,desc:'괴수 · 등록 공개 정보',text,href:row.dataset.apostleHref||'#apostles',type:'괴수'});
 });
 const tokens=query.split(/\\s+/).filter(Boolean);
 const results=index.map(item=>{
   let score=0;
   if(norm(item.title).includes(query)) score+=100;
   if(norm(item.desc).includes(query)) score+=35;
   tokens.forEach(t=>{if(item.text.includes(t)) score+=10});
   return {...item,score};
 }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
 summary.textContent='“'+q+'”에 대한 검색 결과 '+results.length+'건입니다.';
 if(!results.length){root.innerHTML='<div class="notice-area">검색어와 일치하는 정보가 없습니다. 다른 검색어로 다시 검색해 주세요.</div>';return}
 const unique=new Set();
 root.innerHTML=results.filter(x=>{const k=x.href+'|'+x.title;if(unique.has(k))return false;unique.add(k);return true}).slice(0,30).map(x=>{
   const desc=x.desc||'센티넬안전관리청 누리집에서 제공하는 관련 정보입니다.';
   return '<article class="search-result-item"><a href="'+x.href+'"><b>'+esc(x.title)+'</b>'+(x.type?'<em>'+esc(x.type)+'</em>':'')+'<p>'+esc(desc)+'</p></a></article>';
 }).join('');
}
 const regForm=document.getElementById('registrationSearch');
 regForm?.addEventListener('submit',e=>{e.preventDefault();const q=document.getElementById('regNo').value.trim().toUpperCase();const db={'SN-26018492':['SN-26018492','괴수','3등급','등록','서울특별시','2026.09.29'],'SN-26017421':['SN-26017421','괴수','4등급','관찰','인천광역시','2026.09.30']};const r=db[q], box=document.getElementById('regResult');box.hidden=false;box.innerHTML=r?'<h2>등록정보 확인</h2><dl><dt>등록번호</dt><dd>'+r[0]+'</dd><dt>구분</dt><dd>'+r[1]+'</dd><dt>등급</dt><dd>'+r[2]+'</dd><dt>관리상태</dt><dd>'+r[3]+'</dd><dt>관리지역</dt><dd>'+r[4]+'</dd><dt>최종 갱신</dt><dd>'+r[5]+'</dd></dl>':'<h2>조회 결과가 없습니다.</h2><p>입력하신 등록번호를 확인하시기 바랍니다.</p>'});
 let idx=0,playing=true,timer;const slides=document.getElementById('slides'),count=3;function move(n){if(!slides)return;idx=(idx+n+count)%count;slides.style.transform='translateX(-'+idx*100+'%)'}function restart(){clearInterval(timer);if(playing)timer=setInterval(()=>move(1),5000)}(document.getElementById('prevSlide')||{}).onclick=()=>{move(-1);restart()};(document.getElementById('nextSlide')||{}).onclick=()=>{move(1);restart()};(document.getElementById('playSlide')||{}).onclick=()=>{playing=!playing;document.getElementById('playSlide').textContent=playing?'Ⅱ':'▶';document.getElementById('playSlide').setAttribute('aria-label',playing?'슬라이드 자동재생 일시정지':'슬라이드 자동재생 재생');restart()};restart();
 document.querySelectorAll('.press-tabs').forEach(tabs=>{tabs.querySelectorAll('button[data-tab]').forEach(btn=>btn.addEventListener('click',()=>{tabs.querySelectorAll('button[data-tab]').forEach(b=>b.classList.toggle('active',b===btn));const root=tabs.parentElement;root.querySelectorAll('.press-list').forEach(list=>list.hidden=list.id!==btn.dataset.tab)}))});
 document.querySelectorAll('.rating').forEach(r=>{const bs=[...r.querySelectorAll('button')];bs.forEach((b,i)=>b.addEventListener('click',()=>bs.forEach((x,j)=>x.classList.toggle('on',j<=i))))});
 show(location.hash);
 const initialSearch=location.hash.match(/^#searchPage\\?query=(.*)$/);
 if(initialSearch){
   try{renderSearch(decodeURIComponent(initialSearch[1]||''));}catch(e){}
 }
})();


/* ===== bundled from js/notice-list.js ===== */
/* ===== ORIGINAL SCRIPT BLOCK 4 ===== */

(function(){
 const rows=[...document.querySelectorAll('#notice tbody tr[data-notice-row]')];
 const nav=document.getElementById('noticePagination');
 const count=document.querySelector('#notice .board-tools .count');
 const totalPages=Math.ceil(rows.length/10);
 function page(p){
   p=Math.max(1,Math.min(totalPages,p));
   rows.forEach((r,i)=>r.style.display=(i>=(p-1)*10&&i<p*10)?'':'none');
   if(count)count.textContent='전체 36건 · '+p+' / '+totalPages+' 페이지';
   if(nav)nav.innerHTML='<button type="button" data-p="1">«</button><button type="button" data-p="'+Math.max(1,p-1)+'">‹</button>'+Array.from({length:totalPages},(_,i)=>'<button type="button" class="'+(i+1===p?'active':'')+'" data-p="'+(i+1)+'">'+(i+1)+'</button>').join('')+'<button type="button" data-p="'+Math.min(totalPages,p+1)+'">›</button><button type="button" data-p="'+totalPages+'">»</button>';
 }
 nav?.addEventListener('click',e=>{const b=e.target.closest('button[data-p]');if(b)page(+b.dataset.p)});
 page(1);
})();


/* ===== bundled from js/report.js ===== */
/* ===== ORIGINAL SCRIPT BLOCK 5 ===== */

(function(){
 const wrap=document.getElementById('reportFormWrap'), form=document.getElementById('activityReportForm'), result=document.getElementById('reportResult'), title=document.getElementById('reportTypeTitle');
 let selectedType='괴수 활동';
 document.querySelectorAll('[data-report-type]').forEach(btn=>btn.addEventListener('click',()=>{
   selectedType=btn.dataset.reportType; title.textContent=selectedType+' 신고';
   wrap.hidden=false; result.hidden=true; form.hidden=false;
   wrap.scrollIntoView({behavior:'smooth',block:'start'});
 }));
 document.getElementById('reportCancel')?.addEventListener('click',()=>{wrap.hidden=true;form.reset();result.hidden=true});
 form?.addEventListener('submit',e=>{
   e.preventDefault();
   const no='SSA-2026-'+String(Math.floor(100000+Math.random()*899999));
   const region=document.getElementById('reportRegion').value;
   const time=document.getElementById('reportTime').value.replace('T',' ');
   form.hidden=true; result.hidden=false;
   result.innerHTML='<div class="result-head"><span>접수완료</span><b>신고가 정상적으로 접수되었습니다.</b></div><dl><div><dt>접수번호</dt><dd>'+no+'</dd></div><div><dt>신고유형</dt><dd>'+selectedType+'</dd></div><div><dt>발생지역</dt><dd>'+region+'</dd></div><div><dt>발생시각</dt><dd>'+time+'</dd></div></dl><p>접수된 내용은 관할 지역관리국에 전달되어 신고 내용 확인 및 필요한 안전확인 절차가 진행됩니다.</p><button type="button" class="submit" id="newReport">새 신고 작성</button>';
   document.getElementById('newReport').onclick=()=>{form.reset();form.hidden=false;result.hidden=true};
   result.scrollIntoView({behavior:'smooth',block:'start'});
 });
})();


/* ===== bundled from js/popup.js ===== */
/* ===== ORIGINAL SCRIPT BLOCK 6 ===== */

(function(){
 const pop=document.getElementById('entryPopups');
 if(!pop)return;
 const dayKey='sentinel_popup_'+new Date().toLocaleDateString('ko-KR');
 if(localStorage.getItem(dayKey)!=='closed')pop.hidden=false;
 const close=(allDay)=>{
   if(allDay)localStorage.setItem(dayKey,'closed');
   pop.hidden=true;
 };
 pop.querySelectorAll('[data-close-popup]').forEach(b=>b.addEventListener('click',()=>close(false)));
 pop.querySelectorAll('[data-hide-day]').forEach(b=>b.addEventListener('click',()=>close(true)));
 pop.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>close(false)));
 const form=document.getElementById('surveyForm');
 if(form)form.addEventListener('submit',e=>{
   e.preventDefault();
   form.hidden=true;
   const r=document.getElementById('surveyResult');
   r.hidden=false;
   r.innerHTML='<div class="result-head"><span>제출완료</span><b>설문이 정상적으로 제출되었습니다.</b></div><p>응답해 주셔서 감사합니다. 제출된 의견은 누리집 서비스 개선을 위한 참고자료로 활용됩니다.</p><a class="submit" href="#home">홈으로 돌아가기</a>';
 });
})();


/* ===== bundled from js/crisis.js ===== */
/* ===== ORIGINAL SCRIPT BLOCK 13 ===== */

(function(){
 const data=[
  ['2026.09.30 01:42','전국','주의','전국 위기경보 2단계 발령. 지역별 안전수칙과 현장 안내를 확인해 주세요.'],
  ['2026.09.29 18:20','서울특별시','주의','도심 일부 지역 능력 이상징후 확인에 따른 주변 접근 자제 및 신고 안내.'],
  ['2026.09.27 21:05','경기도','관심','공공시설 주변 이상반응 확인에 따른 안전거리 유지 안내.'],
  ['2026.09.25 14:33','인천광역시','관심','항만 인근 안전확인 활동에 따른 현장 안내요원 지시에 따라 주세요.'],
  ['2026.09.22 09:10','강원도','주의','산악지역 괴수 활동 신고 증가에 따른 탐방객 안전수칙 안내.'],
  ['2026.09.18 17:45','경상남도','관심','다중이용시설 ARU 정기점검에 따른 일부 출입동선 변경 안내.'],
  ['2026.09.15 12:08','부산광역시','주의','해안지역 이상징후 확인에 따른 해안 접근 자제 및 안전확인 안내.'],
  ['2026.09.11 16:40','경상북도','관심','지역관리국 안전확인 기간 중 신고 접수방법 및 긴급상황 대응 안내.'],
  ['2026.09.05 08:25','충청남도','주의','공공시설 ARU 이상작동 확인에 따른 주변 접근 금지 안내.'],
  ['2026.08.30 19:32','제주특별자치도','관심','관광지 안전확인 강화에 따른 현장 안전요원 안내 준수 요청.']
 ];
 const cls={관심:'interest',주의:'caution',경계:'warning',심각:'critical'};
 function render(){
  const rg=document.getElementById('alertRegionFilter')?.value||'',lv=document.getElementById('alertLevelFilter')?.value||'',root=document.getElementById('alertHistoryList');
  if(!root)return;
  const rows=data.filter(x=>(!rg||x[1]===rg)&&(!lv||x[2]===lv));
  root.innerHTML=rows.length?rows.map(x=>'<article class="alert-item"><time class="alert-time">'+x[0]+'</time><span class="alert-region">'+x[1]+'</span><span class="alert-title">'+x[3]+'</span><b class="alert-level '+cls[x[2]]+'">'+x[2]+'</b></article>').join(''):'<div class="notice-area">조건에 맞는 재난문자 이력이 없습니다.</div>';
 }
 ['alertRegionFilter','alertLevelFilter'].forEach(id=>document.getElementById(id)?.addEventListener('change',render));
 document.getElementById('alertFilterReset')?.addEventListener('click',()=>{document.getElementById('alertRegionFilter').value='';document.getElementById('alertLevelFilter').value='';render()});
 render();
 window.addEventListener('hashchange',render);
 document.addEventListener('click',e=>{
  const a=e.target.closest('a[href^="#guidance?type="]');if(!a)return;
  const type=new URLSearchParams(a.getAttribute('href').split('?')[1]).get('type');
  const title={sentinel:'능력 이상징후 발견',beast:'괴수 출현·활동 발견',aru:'ARU 이상작동',evac:'대피 안내를 받은 경우'}[type]||'기본 안전수칙';
  const root=document.getElementById('guidanceDetail');if(root){root.querySelector('h2').textContent=title;root.querySelector('ol').innerHTML={
   sentinel:'<li>이상반응이 나타나는 장소에서 안전거리를 확보합니다.</li><li>현장 상황을 직접 확인하려고 접근하지 않습니다.</li><li>필요한 경우 활동 신고를 통해 위치와 상황을 알립니다.</li><li>어지럼증·의식저하 등 이상이 느껴지면 주변에 도움을 요청하고 긴급기관에 연락합니다.</li>',
   beast:'<li>괴수와 최대한 거리를 두고 이동 경로를 피합니다.</li><li>괴수를 자극하거나 촬영을 위해 접근하지 않습니다.</li><li>주변 사람에게 위험을 알리고 안전한 실내 등으로 이동합니다.</li><li>위치와 상황을 활동 신고로 알리고 긴급한 위험은 119·112로 신고합니다.</li>',
   aru:'<li>이상작동 중인 ARU에 접근하거나 임의로 조작하지 않습니다.</li><li>경보음이나 표시등을 확인하고 주변의 접근을 막습니다.</li><li>장치 식별번호와 위치를 확인해 오작동 신고를 이용합니다.</li><li>감전·화재 등 즉각적인 위험이 있으면 긴급기관에 연락합니다.</li>',
   evac:'<li>대피 안내가 내려진 경우 안내된 방향으로 침착하게 이동합니다.</li><li>엘리베이터 등 위험할 수 있는 시설 이용은 현장 안내에 따릅니다.</li><li>대피 중 위험지역으로 되돌아가지 않습니다.</li><li>공식 안내가 있을 때까지 안전한 장소에서 대기합니다.</li>'
  }[type]||'';root.scrollIntoView({behavior:'smooth',block:'start'})}
 });
})();

/* ===== ORIGINAL SCRIPT BLOCK 14 ===== */

const BRIEFING_DATA=[
["2026.09.26","2026년 하반기 센티넬 안전관리 정책 추진방향","정책기획과","안전관리","하반기에는 지역 대응체계 정비와 현장 안전확인 절차의 표준화를 중심으로 안전관리 체계를 운영한다.","지역관리국과 권역지원센터의 역할을 구분하고, 신고 접수부터 현장 확인까지의 공통 절차를 정비한다.","공공안전 자율대응장치의 정기점검 결과와 공개 가능한 개선조치 현황도 순차적으로 안내한다."],
["2026.09.12","괴수 등록·등급판정 제도 개선","등록관리과","등록관리","괴수 등록 과정에서 반복적으로 요구되는 서류를 정비하고 등록정보 확인 절차를 온라인 중심으로 개선한다.","등급판정 결과의 설명자료를 확대하고 판정 결과에 이견이 있는 경우 이의신청 절차와 제출자료를 확인하기 쉽게 안내한다.","개인 식별정보와 안전상 공개가 제한되는 정보는 기존 보호기준에 따라 공개 대상에서 제외한다."],
["2026.08.28","권역지원센터 운영체계 개편","권역지원과","지역지원","6개 권역지원센터의 상담·등록 지원 기능을 지역관리국과 연계해 운영하는 체계로 개편한다.","야간 상담과 안전확인 요청 접수 기능을 단계적으로 확대하고, 센터에서 처리하기 어려운 업무는 관할 기관으로 신속하게 전달한다.","상담기록은 업무에 필요한 범위에서만 관리하며 개인정보 접근권한을 별도로 관리한다."],
["2026.08.14","공공안전 자율대응장치 안전관리 기준 개편","ARU안전과","ARU","ARU의 정기점검 항목에 비상정지 기능과 통신장애 대응상태, 오작동 기록관리 항목을 보강한다.","시설관리자는 점검 이력과 이상작동 신고처리 결과를 정해진 방식으로 기록하고, 중대한 이상이 확인된 장치는 추가 확인 전까지 운용을 제한할 수 있다.","시민이 확인할 수 있는 점검일과 안전상태 등 공개정보의 범위도 함께 정비한다."],
["2026.07.31","학교 주변 능력안전구역 시범사업 2단계","생활안전과","학교안전","학교 주변의 안전확인 순찰과 신고체계를 정비하고 등하교 시간대의 대응절차를 표준화한다.","학교는 시설 안전관리와 사고보고를 중심으로 대응하며 학생 개인의 능력정보는 필요한 범위에서만 보호절차에 따라 처리한다.","시범사업 결과는 현장 의견과 신고 접근성, 대응절차 이행현황 등을 종합해 다음 단계 운영자료로 활용한다."],
["2026.07.10","국가 능력안전 통계 공개체계","통계기획팀","통계","신고 건수, 안전확인 요청, 등록 현황, ARU 점검 등 주요 지표를 연도별로 정리해 공개하는 통계체계를 마련한다.","개인을 특정할 수 있는 정보는 제외하고 필요한 경우 지역별 자료를 일정 범위로 묶어 공개한다.","통계 작성 기준과 용어를 함께 공개해 자료의 의미와 활용 범위를 확인할 수 있도록 한다."]
];
function renderBriefingDetail(id){
 const x=BRIEFING_DATA[Number(id)];if(!x)return;
 document.getElementById('briefingArticle').innerHTML='<div class="press-article-meta"><span>정책브리핑</span><time>'+x[0]+'</time></div><h1>'+x[1]+'</h1><div class="press-article-info"><span>담당부서 '+x[2]+'</span><span>분야 '+x[3]+'</span></div><div class="press-article-body"><p>'+x[4]+'</p><p>'+x[5]+'</p><p>'+x[6]+'</p></div><div class="press-article-footer"><span>담당부서: '+x[2]+'</span><span>대표전화 044-201-3001</span><span>최종 수정일: '+x[0]+'</span></div>';
}
window.__renderBriefingDetail=renderBriefingDetail;
window.addEventListener('hashchange',()=>{const m=location.hash.match(/^#briefing-view\?id=(\d+)/);if(m)renderBriefingDetail(m[1])});
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#briefing-view"]');if(a){const m=a.getAttribute('href').match(/id=(\d+)/);if(m)setTimeout(()=>renderBriefingDetail(m[1]),0)}});

/* ===== ORIGINAL SCRIPT BLOCK 15 ===== */

const LAW_DATA=[
["국민능력안전기본법","법률","2026.06.30","능력 보유자의 권리 보호와 국민 안전 확보를 위한 기본 원칙, 국가와 지방자치단체의 책무, 등록 및 안전관리 체계의 기본사항을 규정한다.","정책기획과"],
["공공안전 자율대응장치법","법률","2026.05.18","공공안전 자율대응장치의 설치·운용·점검 및 안전인증에 관한 기준과 운용기관의 책임을 규정한다.","ARU안전과"],
["괴수 등록 및 관리에 관한 법률","법률","2026.04.12","괴수의 등록, 분류, 등급판정, 안전관리 및 관련 정보의 보호에 관한 사항을 정한다.","등록관리과"],
["국민능력안전기본법 시행령","대통령령","2026.07.01","기본법에서 위임된 등록관리, 지역관리국 운영, 안전확인 절차와 국가 안전통계 작성에 관한 세부사항을 정한다.","정책기획과"],
["공공안전 자율대응장치법 시행규칙","부령","2026.06.01","ARU 안전인증 신청, 정기점검 기록, 비상정지 확인 및 이상작동 보고에 필요한 서식과 절차를 규정한다.","ARU안전과"],
["괴수 등록 및 관리에 관한 법률 시행규칙","부령","2026.05.02","괴수 등록 신청, 등록정보 변경, 등급판정 신청 및 이의신청에 필요한 서류와 처리절차를 정한다.","등록관리과"]
];
const RULE_DATA=[
["공공안전 자율대응장치 정기점검 업무지침","훈령","2026.09.20","ARU 설치시설의 정기점검 주기, 점검항목, 이상 발견 시 조치 및 결과 기록방법을 정한다.","ARU안전과"],
["괴수 등급판정 업무처리규정","예규","2026.09.05","등급판정 신청 접수부터 검사, 판정, 결과 통지 및 이의신청 안내까지의 내부 처리절차를 정한다.","등급판정과"],
["지역관리국 안전확인 대응지침","지침","2026.08.25","지역관리국이 안전확인 요청을 접수했을 때 현장 확인과 관계기관 협조를 진행하는 표준절차를 정한다.","상황총괄과"],
["센티넬 등록정보 보호 및 접근관리 지침","지침","2026.08.08","등록정보와 개인식별정보의 접근권한, 열람기록, 보존 및 정정 요청 처리 기준을 정한다.","등록관리과"],
["다중이용시설 능력안전 관리지침","고시","2026.07.15","공연장, 환승시설 등 다중이용시설에서 적용할 안전계획, 신고체계와 비상동선 관리기준을 정한다.","다중이용시설과"],
["능력안전 민원 처리기준","예규","2026.06.22","민원 접수, 담당부서 배정, 처리기한 안내, 보완요청 및 처리결과 통지에 관한 세부기준을 정한다.","민원총괄과"],
["공공시설 ARU 점검결과 공개기준","고시","2026.05.30","시민에게 공개할 수 있는 ARU 점검정보의 범위와 보안상 공개를 제한하는 정보의 처리기준을 정한다.","정보보호과"],
["동조 과정 권익보호 현장대응지침","지침","2026.05.10","동조 전 설명, 의사 확인, 중단 요청, 사후 기록 등 권익보호를 위한 현장 대응절차를 정한다.","권익보호과"]
];
function renderLawRuleList(){
 const law=document.getElementById('lawList'),rule=document.getElementById('ruleList');
 if(law)law.innerHTML=LAW_DATA.map((x,i)=>'<a class="law-card" href="#law-view?id='+i+'"><div class="law-meta"><span class="law-type">'+x[1]+'</span><span>시행 '+x[2]+'</span></div><h3>'+x[0]+'</h3><p>'+x[3]+'</p></a>').join('');
 if(rule)rule.innerHTML=RULE_DATA.map((x,i)=>'<a class="rule-card" href="#rules-view?id='+i+'"><div class="rule-meta"><span class="rule-type">'+x[1]+'</span><span>발령 '+x[2]+'</span></div><h3>'+x[0]+'</h3><p>'+x[3]+'</p></a>').join('');
}
function renderLawDetail(id){
 const x=LAW_DATA[Number(id)];if(!x)return;
 document.getElementById('lawArticle').innerHTML='<div class="press-article-meta"><span>'+x[1]+'</span><time>'+x[2]+'</time></div><h1>'+x[0]+'</h1><div class="press-article-info"><span>소관부서 '+x[4]+'</span><span>시행일 '+x[2]+'</span></div><div class="press-article-body"><h3>주요 내용</h3><p>'+x[3]+'</p><h3>소관 부서</h3><p>'+x[4]+'에서 법령 관련 업무를 담당합니다.</p><h3>정보 안내</h3><p>법령의 세부 조문과 부칙은 법령 원문 페이지에서 확인할 수 있도록 구성되어 있습니다.</p></div>';
}

window.__renderLawDetail=renderLawDetail;function renderRuleDetail(id){
 const x=RULE_DATA[Number(id)];if(!x)return;
 document.getElementById('ruleArticle').innerHTML='<div class="press-article-meta"><span>'+x[1]+'</span><time>'+x[2]+'</time></div><h1>'+x[0]+'</h1><div class="press-article-info"><span>발령부서 '+x[4]+'</span><span>발령일 '+x[2]+'</span></div><div class="press-article-body"><h3>주요 내용</h3><p>'+x[3]+'</p><h3>적용 범위</h3><p>센티넬안전관리청 및 관련 지역관리국의 해당 업무 처리에 적용됩니다.</p><h3>담당 부서</h3><p>'+x[4]+'</p></div>';
}

window.__renderRuleDetail=renderRuleDetail;document.addEventListener('click',e=>{
 const l=e.target.closest('a[href^="#law-view"]'),r=e.target.closest('a[href^="#rules-view"]');
 if(l){const m=l.getAttribute('href').match(/id=(\d+)/);if(m)setTimeout(()=>renderLawDetail(m[1]),0)}
 if(r){const m=r.getAttribute('href').match(/id=(\d+)/);if(m)setTimeout(()=>renderRuleDetail(m[1]),0)}
});
window.addEventListener('hashchange',()=>{
 let m=location.hash.match(/^#law-view\?id=(\d+)/);if(m){renderLawDetail(m[1]);return}
 m=location.hash.match(/^#rules-view\?id=(\d+)/);if(m){renderRuleDetail(m[1]);return}
 if(location.hash==='#law'||location.hash==='#rules')renderLawRuleList();
});
setTimeout(renderLawRuleList,0);

/* Scheduled content refresh */
window.addEventListener('ssa-scheduled-updated',()=>{
  try{renderPressPage(1,'')}catch(e){}
  try{renderNoticePage?.(1,'')}catch(e){}
  try{renderBriefingPage?.(1,'')}catch(e){}
});


/* ===== bundled from js/civil.js ===== */
/* ===== ORIGINAL SCRIPT BLOCK 12 ===== */

(function(){
 const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 const mf=document.getElementById('malfunctionForm'), mr=document.getElementById('malResult');
 mf?.addEventListener('submit',e=>{
   e.preventDefault();
   const no='SSA-ARU-2026-'+String(Math.floor(100000+Math.random()*899999));
   const region=document.getElementById('malRegion').value, type=document.getElementById('malType').value;
   const time=document.getElementById('malTime').value.replace('T',' ');
   mf.hidden=true; mr.hidden=false;
   mr.innerHTML='<div class="result-head"><span>접수완료</span><b>오작동 신고가 정상적으로 접수되었습니다.</b></div><dl><div><dt>접수번호</dt><dd>'+no+'</dd></div><div><dt>신고유형</dt><dd>ARU 오작동 신고</dd></div><div><dt>오작동 유형</dt><dd>'+esc(type)+'</dd></div><div><dt>발생지역</dt><dd>'+esc(region)+'</dd></div><div><dt>발생시각</dt><dd>'+esc(time)+'</dd></div></dl><p>접수된 내용은 관할 안전관리 부서에서 확인하며 필요한 경우 추가 확인 절차가 진행됩니다.</p><button type="button" class="submit" id="newMalReport">새 신고 작성</button>';
   document.getElementById('newMalReport').onclick=()=>{mf.reset();mf.hidden=false;mr.hidden=true};
   mr.scrollIntoView({behavior:'smooth',block:'start'});
 });
 const faqSearch=()=>{
   const q=(document.getElementById('faqSearch')?.value||'').trim().toLowerCase();
   let shown=0;
   document.querySelectorAll('#faqList [data-faq]').forEach(d=>{const ok=!q||d.textContent.toLowerCase().includes(q);d.style.display=ok?'':'none';if(ok)shown++});
   const empty=document.getElementById('faqEmpty');if(empty)empty.hidden=shown!==0;
 };
 document.getElementById('faqSearchBtn')?.addEventListener('click',faqSearch);
 document.getElementById('faqSearch')?.addEventListener('input',faqSearch);
 document.getElementById('faqSearch')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();faqSearch()}});
 const cases={
  'SSA-2026-100001':{type:'괴수 활동 신고',date:'2026.09.29 14:18',region:'서울특별시',dept:'서울지역관리국 상황실',status:'처리중',step:3,summary:'도심 상업시설 인근 이상 활동 신고',updated:'2026.10.01 09:20'},
  'SSA-2026-100002':{type:'이상징후 신고',date:'2026.09.27 08:42',region:'인천광역시',dept:'인천지역관리국 안전확인과',status:'내용확인',step:2,summary:'공공시설 주변 에너지 이상 반응 신고',updated:'2026.09.30 16:05'},
  'SSA-ARU-2026-100003':{type:'ARU 오작동 신고',date:'2026.09.24 19:11',region:'경기도',dept:'경기지역관리국 ARU안전과',status:'처리완료',step:4,summary:'공공시설 ARU 통신 장애 신고',updated:'2026.09.26 11:30'},
  'SSA-2026-100004':{type:'민원 상담',date:'2026.09.20 10:26',region:'대전광역시',dept:'민원총괄과',status:'접수완료',step:1,summary:'등록정보 정정 관련 상담 신청',updated:'2026.09.20 10:26'}
 };
 document.getElementById('statusForm')?.addEventListener('submit',e=>{
   e.preventDefault();
   const key=document.getElementById('statusNumber').value.trim().toUpperCase(), box=document.getElementById('statusResult'), x=cases[key];
   box.hidden=false; box.className='status-result';
   if(!x){box.innerHTML='<div class="status-result-head"><b>조회 결과가 없습니다.</b></div><div class="status-result-note">입력한 접수번호를 다시 확인해 주세요. 예시 접수번호는 <strong>SSA-2026-100001</strong>입니다.</div>';return}
   box.innerHTML='<div class="status-result-head"><span class="status-badge">'+esc(x.status)+'</span><b>'+esc(x.type)+'</b></div><dl><dt>접수번호</dt><dd>'+esc(key)+'</dd><dt>접수일시</dt><dd>'+esc(x.date)+'</dd><dt>발생지역</dt><dd>'+esc(x.region)+'</dd><dt>담당부서</dt><dd>'+esc(x.dept)+'</dd><dt>현재 단계</dt><dd>'+esc(x.status)+' · '+x.step+'단계</dd><dt>최근 처리일</dt><dd>'+esc(x.updated)+'</dd></dl><div class="status-result-note"><strong>민원 요약</strong><br>'+esc(x.summary)+'<br><br>처리상태는 가상 서비스 데이터이며 실제 기관의 민원 처리 결과와는 관련이 없습니다.</div>';
   box.scrollIntoView({behavior:'smooth',block:'start'});
 });
})();


/* ===== bundled from js/apostles.js ===== */
/* ===== ORIGINAL SCRIPT BLOCK 9 ===== */

(function(){
const box=document.getElementById('apostleProfileContent');
function render(){
 if(!box)return;
 const X=v=>String(v==null?'':v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const id=+new URLSearchParams(location.hash.split('?')[1]||'').get('id'),r=document.querySelectorAll('.apostle-row')[id];
 if(!r){box.innerHTML='<div class="notice-area">괴수 정보를 찾을 수 없습니다.</div>';return}
 const dd=[...r.querySelectorAll('.apostle-info dd')].map(x=>x.textContent.trim()),code=r.querySelector('strong').textContent.trim(),ds=r.dataset,
  grade=dd[0]||'-',st=(dd[1]||'-').split(' · ')[0],rg=dd[2]||'-',type=ds.type||code,m=code.match(/(\d\d)(\d\d)(\d\d)$/),
  joined=ds.joined||(m?'20'+m[1]+'.'+m[2]+'.'+m[3]:'-'),sp=ds.special||'해당 없음',
  row=(k,v,f)=>'<div data-f="'+f+'"><span>'+k+'</span><b>'+X(v)+'</b></div>';
 box.dataset.id=id;
 box.innerHTML='<div class="sentinel-profile-head"><div class="sentinel-detail-photo">사진</div><div><h2 data-f="code">'+X(code)+' <span class="sentinel-grade" data-f="grade">'+X(grade)+'</span></h2><p>'+X(st)+'</p></div><button type="button" class="admin-only prof-edit">정보 수정</button></div><div class="sentinel-profile-table">'
  +row('괴수 코드',code,'code')+row('등급',grade,'grade')+row('능력 유형',type,'type')+row('관리 상태',st,'st')+row('최초 등록일',joined,'joined')+row('특이 구분',sp,'special')
  +'</div><div class="notice-area"><strong>공개 범위 안내</strong><br>괴수의 개인식별정보와 상세 능력 정보는 공개하지 않으며, 등록 코드를 기준으로 기본정보만 안내합니다.</div><a class="back-to-list" href="#apostles">← 괴수 목록으로</a>';
 const detailPhoto=box.querySelector('.sentinel-detail-photo'),listImg=r.querySelector('.apostle-photo img'),src=listImg?.getAttribute('src');
 if(detailPhoto&&src){detailPhoto.innerHTML='<img src="'+X(src)+'" alt="괴수 사진">';}
 if(window.__profilePhoto)window.__profilePhoto();
}
box&&box.addEventListener('click',e=>{
 if(!document.body.classList.contains('photo-admin'))return;
 const t=e.target.closest('[data-f],.prof-edit');if(!t)return;
 window.__ssaEditA&&window.__ssaEditA(+box.dataset.id,t.dataset.f||'code');
});
addEventListener('hashchange',render);render();
/* 더블탭·핀치 확대 방지 (iOS) */
['gesturestart','gesturechange'].forEach(t=>document.addEventListener(t,e=>e.preventDefault()));
let lt=0;document.addEventListener('touchend',e=>{const n=Date.now();if(n-lt<350)e.preventDefault();lt=n},{passive:false});
const fl=document.querySelector('.footer-links .container');

})();

/* ===== ORIGINAL SCRIPT BLOCK 10 ===== */

(function(){
const $=(q,r=document)=>r.querySelector(q),$$=(q,r=document)=>[...r.querySelectorAll(q)];
const CL='dbljkloal',TAG='ssa_lists_v1',LK='ssa_lists_cache';
const LIST='https://res.cloudinary.com/'+CL+'/raw/list/'+TAG+'.json',RB='https://res.cloudinary.com/'+CL+'/raw/upload/',RAPI='https://api.cloudinary.com/v1_1/'+CL+'/raw/upload';
const E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const adm=()=>document.body.classList.contains('photo-admin');
let M=null,tm;
const SF=[['name','이름'],['age','나이'],['gender','성별'],['center','소속 센터'],['grade','등급'],['type','능력 유형'],['status','등록 상태'],['joined','등록일']],
AF=[['code','괴수 코드'],['grade','등급'],['type','능력 유형'],['st','관리 상태'],['joined','최초 등록일'],['special','특이 구분']];
const DEFAULT_A=[
 {code:'에너지형 괴수',grade:'1등급',type:'고출력 전격·에너지 방출형',st:'희귀',joined:'2011.06.17',special:'고출력 전격'},
 {code:'인지·감각형 괴수',grade:'2등급',type:'감각 교란·인지 간섭형',st:'관찰',joined:'2006.04.22',special:'인지 간섭'},
 {code:'물리변환형 괴수',grade:'3등급',type:'물질 변환·신체 변형형',st:'관리',joined:'2004.09.17',special:'물질 변환'},
 {code:'생체영향형 괴수',grade:'3등급',type:'생체 변형·생리 영향형',st:'관리',joined:'2008.07.03',special:'생체 영향'},
 {code:'환경영향형 괴수',grade:'4등급',type:'환경 변화·생태 교란형',st:'관찰',joined:'2013.11.29',special:'환경 변화'},
 {code:'공간이동형 괴수',grade:'2등급',type:'공간 이동·거리 왜곡형',st:'추적',joined:'2016.02.14',special:'공간 이동'},
 {code:'에너지형 괴수',grade:'5등급',type:'에너지 방출·흡수형',st:'관찰',joined:'2003.08.11',special:'에너지 방출'},
 {code:'인지·감각형 괴수',grade:'3등급',type:'감각 증폭·인지 교란형',st:'관리',joined:'2019.05.26',special:'감각 교란'}
];
function toast(m,e){const d=document.createElement('div');d.className='ssa-toast'+(e?' e':'');d.textContent=m;document.body.appendChild(d);setTimeout(()=>d.remove(),3200)}
const BAR='<div class="adm-bar"><button type="button" data-a="photo">사진 변경</button><button type="button" data-a="nophoto">사진 삭제</button><button type="button" data-a="edit">수정</button><button type="button" class="d" data-a="del">삭제</button></div>';
const ph=(c,s,img)=>'<div class="'+c+(img?' has-img':'')+'"><img src="'+E(img)+'" alt=""'+(img?'':' hidden')+'><span>'+s+'</span></div>';
const sRow=(x,i)=>{const p=x.p,h='#sentinel-profile?id='+i;return '<article class="sentinel-row" data-href="'+h+'" tabindex="0" role="link">'+ph('sentinel-photo','증명사진',x.img)+'<div class="sentinel-info"><strong>'+E(p.name)+'</strong><dl><div><dt>나이</dt><dd>'+E(p.age)+'</dd></div><div><dt>성별</dt><dd>'+E(p.gender)+'</dd></div><div><dt>센터</dt><dd>'+E(p.center)+'</dd></div></dl></div>'+BAR+'</article>'};
const aRow=(x,i)=>{const h='#apostle-profile?id='+i;const key=String(x.code||('BEAST-'+i));return '<article class="apostle-row" data-beast-key="'+E(key)+'" data-href="'+h+'" data-type="'+E(x.type)+'" data-joined="'+E(x.joined)+'" data-special="'+E(x.special)+'" data-rg="'+E(x.rg)+'" tabindex="0" role="link">'+ph('apostle-photo','괴수 이미지',x.img)+'<div class="apostle-info"><strong>'+E(x.code)+'</strong><dl><div><dt>등급</dt><dd>'+E(x.grade)+'</dd></div><div><dt>상태</dt><dd>'+E(String(x.st||'').split(' · ')[0])+'</dd></div></dl></div>'+BAR+'</article>'};
function adopt(){const d=window.__sentinelData||[];M={s:$$('.sentinel-row').map((r,i)=>({p:{...(d[i]||{})},img:$('.sentinel-photo img',r)?.getAttribute('src')||''})),a:$$('.apostle-row').map(r=>{const dd=$$('.apostle-info dd',r).map(x=>x.textContent.trim()),code=($('strong',r)||{textContent:''}).textContent.trim(),mm=code.match(/(\d\d)(\d\d)(\d\d)$/);return {code,grade:dd[0]||'',type:r.dataset.type||code,st:dd[1]||'',rg:r.dataset.rg||'',joined:r.dataset.joined||(mm?'20'+mm[1]+'.'+mm[2]+'.'+mm[3]:'-'),special:r.dataset.special||'해당 없음',img:$('.apostle-photo img',r)?.getAttribute('src')||''}})}}
function ensure(){if(M)return true;if(document.body.classList.contains('photos-loading')){toast('사진을 불러오는 중입니다. 잠시 후 다시 눌러주세요.',1);return false}adopt();render();return true}
function addBtns(){[['s','.sentinel-list','센티넬'],['a','.apostle-list','괴수']].forEach(([k,q,n])=>{const l=$(q);if(!l||$('.adm-add[data-k="'+k+'"]'))return;const b=document.createElement('button');b.type='button';b.className='adm-add';b.dataset.k=k;b.textContent='＋ '+n+' 추가';const em=l.nextElementSibling;(em&&em.classList.contains('list-empty')?em:l).after(b)})}
function render(){window.__ssaOwned=true;const S=$('.sentinel-list'),A=$('.apostle-list');if(S)S.innerHTML=M.s.map(sRow).join('');if(A){M.a.sort((x,y)=>{const ax=parseInt(String(x.grade||'').match(/\\d+/)?.[0]||'999',10),ay=parseInt(String(y.grade||'').match(/\\d+/)?.[0]||'999',10);return ax-ay});A.innerHTML=M.a.map(aRow).join('')}window.__sentinelData=M.s.map(x=>({...x.p}));addBtns();if(/profile/.test(location.hash)){dispatchEvent(new Event('hashchange'));setTimeout(()=>window.__profilePhoto?.(),0)}}
async function upload(){const id='ssa-lists-'+Date.now()+'.json',payload=JSON.stringify({v:3,M}),fd=new FormData();fd.append('file',new Blob([payload],{type:'application/json'}),id);fd.append('upload_preset','Everything');fd.append('public_id',id);fd.append('folder','sentinel-config');fd.append('tags',TAG);try{const r=await fetch(RAPI,{method:'POST',body:fd}),j=await r.json();if(!r.ok||!j.public_id)throw new Error(j.error?.message||r.status);pending=false;toast('저장되었습니다. 모든 접속자에게 반영됩니다.')}catch(e){toast('공유 설정 저장 실패: '+e.message+' (다시 시도합니다)',1);setTimeout(upload,3000)}}
let pending=false;
function persist(){pending=true;try{localStorage.setItem(LK,JSON.stringify(M))}catch(e){toast('저장 공간이 부족합니다.',1)}clearTimeout(tm);tm=setTimeout(upload,700)}
function applyDefaultA(force=false){
 if(!M)return false;
 if(!force && M._defaultVersion===3)return false;
 const old=M.a||[];
 const findImg=x=>{
  const same=old.filter(o=>o&&o.code===x.code&&o.grade===x.grade);
  const exact=same.find(o=>o.joined===x.joined&&o.img);
  return (exact||same.find(o=>o.img))?.img||'';
 };
 M.a=DEFAULT_A.map(x=>({...x,img:findImg(x)}));
 M._defaultVersion=3;
 return true;
}
const commit=()=>{render();persist()};
function shrink(f){return new Promise((ok,no)=>{const im=new Image(),u=URL.createObjectURL(f);im.onload=()=>{const W=800,H=992,c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d'),s=Math.max(W/im.width,H/im.height),w=Math.round(im.width*s),h=Math.round(im.height*s);ctx.drawImage(im,(W-w)/2,(H-h)/2,w,h);URL.revokeObjectURL(u);c.toBlob(b=>b?ok(b):no(new Error('이미지 변환 실패')),'image/jpeg',.9)};im.onerror=no;im.src=u})}
async function uploadPhoto(file,kind,index){
 const form=new FormData();
 form.append('file',file);
 form.append('upload_preset','Everything');
 form.append('folder','sentinel/photos');
 form.append('tags','ssa_photo,'+kind+'_'+index);
 const res=await fetch('https://api.cloudinary.com/v1_1/'+CL+'/image/upload',{method:'POST',body:form});
 const j=await res.json();
 if(!res.ok||!j.secure_url)throw new Error(j.error?.message||'사진 업로드 실패');
 return {url:j.secure_url,public_id:j.public_id,version:j.version||Date.now()};
}
async function pick(k,i){const f=document.createElement('input');f.type='file';f.accept='image/*';f.onchange=async()=>{if(!f.files[0]||!ensure())return;try{const blob=await shrink(f.files[0]);toast('사진을 서버에 업로드하는 중입니다.');const p=await uploadPhoto(blob,k,i);await pullRemote(true);if(!M||!M[k]||!M[k][i])throw new Error('목록이 변경되었습니다. 다시 시도해 주세요.');M[k][i].img=p.url;commit()}catch(e){toast('사진 업로드 실패: '+e.message,1)}};f.click()}
window.__ssaPick=pick;window.__ssaEditA=(i,f)=>{if(!ensure()||!M.a[i])return;modal('a',i);const m=document.getElementById('ssaModal'),inp=m&&m.querySelector('input[name="'+f+'"]');inp&&inp.focus()};
window.__ssaSync=()=>{if(!ensure())return;const d=window.__sentinelData||[];M.s.forEach((x,i)=>{if(d[i])x.p={...d[i]}});commit()};
function modal(k,i){let m=$('#ssaModal');if(m)m.remove();m=document.createElement('div');m.id='ssaModal';m.className='admin-modal';const o=k==='s'?M.s[i].p:M.a[i],F=k==='s'?SF:AF;
m.innerHTML='<div class="admin-modal-card"><div class="admin-modal-head"><strong>'+(k==='s'?'센티넬':'괴수')+' 정보 수정</strong><button type="button" class="admin-modal-close">×</button></div><form class="admin-form"><div class="admin-form-grid">'+F.map(([n,l])=>'<label>'+l+'<input name="'+n+'" value="'+E(o[n])+'"></label>').join('')+'</div><div class="admin-form-actions"><button type="button" class="c">취소</button><button class="primary">저장</button></div></form></div>';
document.body.appendChild(m);const x=()=>m.remove();$('.admin-modal-close',m).onclick=x;$('.c',m).onclick=x;m.onclick=e=>{if(e.target===m)x()};
$('form',m).onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target);F.forEach(([n])=>o[n]=String(fd.get(n)||'').trim());x();commit()}}
function act(k,i,a){if(a==='photo')return pick(k,i);if(!ensure())return;
if(a==='nophoto'){M[k][i].img='';commit()}
else if(a==='edit')modal(k,i)
else if(a==='del'){if(confirm('이 항목을 삭제할까요?')){M[k].splice(i,1);commit()}}
else if(a==='add'){M[k].push(k==='s'?{p:{name:'새 센티넬',age:'-',gender:'-',center:'-',grade:'-',type:'-',status:'등록·운용',joined:'-'},img:''}:{code:'SA-'+new Date().toISOString().slice(2,10).replace(/-/g,''),grade:'3등급',type:'-',st:'등록',rg:'지역',joined:'-',special:'해당 없음',img:''});commit();modal(k,M[k].length-1)}}
document.addEventListener('click',e=>{if(!adm())return;const t=e.target,add=t.closest('.adm-add');if(add){e.preventDefault();e.stopImmediatePropagation();return act(add.dataset.k,0,'add')}
const row=t.closest('.sentinel-row,.apostle-row');if(!row)return;const b=t.closest('.adm-bar button'),p=t.closest('.sentinel-photo,.apostle-photo');if(!b&&!p)return;
e.preventDefault();e.stopImmediatePropagation();const k=row.classList.contains('sentinel-row')?'s':'a',i=$$(k==='s'?'.sentinel-row':'.apostle-row').indexOf(row);act(k,i,b?b.dataset.a:'photo')},true);
let tries=0;function watch(){const on=adm(),b=$('#adminModeBtnMobile');if(b){b.textContent=on?'관리자 종료':'관리자 모드';b.classList.toggle('active',on)}if(on&&!M&&!document.body.classList.contains('photos-loading'))ensure();else if(on&&!M&&tries++<20)setTimeout(watch,800)}
new MutationObserver(()=>{tries=0;watch()}).observe(document.body,{attributes:true,attributeFilter:['class']});
addBtns();watch();
let lastPull=0;
async function pullRemote(force){
  if(pending&&!force)return false;
  let migrated=false;
  if(!M){try{const c=JSON.parse(localStorage.getItem(LK)||'null');if(c&&c.s){M=c;migrated=applyDefaultA();render()}}catch(e){}}
  try{
   const r=await fetch(LIST+'?_='+Date.now(),{cache:'no-store'});if(!r.ok)throw 0;
   const j=await r.json(),a=(j.resources||[]).sort((x,y)=>(y.version||0)-(x.version||0))[0];if(!a)throw 0;
   const p=await fetch(RB+'v'+a.version+'/'+a.public_id+'?_='+Date.now(),{cache:'no-store'}).then(x=>x.json());
   if(p.M&&p.M.s){
    if(!force&&pending)return false;
    const changed=JSON.stringify(M)!==JSON.stringify(p.M);
    M=p.M;migrated=applyDefaultA()||migrated;
    if(changed||migrated)render();
    try{localStorage.setItem(LK,JSON.stringify(M))}catch(e){}
   }
  }catch(e){}
  if(migrated&&!force)upload();
  lastPull=Date.now();
  return true;
}
pullRemote();
setInterval(()=>{if(!document.hidden)pullRemote()},60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-lastPull>10000)pullRemote()});
addEventListener('focus',()=>{if(Date.now()-lastPull>10000)pullRemote()});
/* 괴수 상세 페이지 사진 탭 → 바로 사진 선택 */
document.addEventListener('click',e=>{
  if(!adm())return;
  const d=e.target.closest('#apostleProfileContent .sentinel-detail-photo');if(!d)return;
  const id=+new URLSearchParams(location.hash.split('?')[1]||'').get('id');
  const ph=$$('.apostle-row')[id]?.querySelector('.apostle-photo');
  if(ph){e.preventDefault();e.stopImmediatePropagation();ph.click()}
},true);
})();


/* ===== bundled from js/interactions.js ===== */
/* ===== ORIGINAL SCRIPT BLOCK 11 ===== */

(function(){
const go=e=>{
 const r=e.target.closest('[data-apostle-href],[data-sentinel-href],.apostle-row[data-href],.sentinel-row[data-href]');
 if(!r||e.target.closest('button,input,select,textarea,a,.adm-bar,.admin-edit-btn'))return;
 if(document.body.classList.contains('photo-admin')&&e.target.closest('.apostle-photo,.sentinel-photo'))return;
 if(e.type==='keydown'&&e.key!=='Enter'&&e.key!==' ')return;
 e.preventDefault();
 const h=r.dataset.apostleHref||r.dataset.sentinelHref||r.dataset.href;
 if(h&&location.hash!==h)location.hash=h;
};
document.addEventListener('click',go);document.addEventListener('keydown',go);
})();

/* ===== SITE EASTER EGGS ===== */
(function(){
 const seenKey='ssa_easter_eggs_v1';
 const seen=()=>{try{return JSON.parse(localStorage.getItem(seenKey)||'{}')}catch(e){return{}}};
 const mark=k=>{const x=seen();x[k]=1;try{localStorage.setItem(seenKey,JSON.stringify(x))}catch(e){}};

 function popup(title,body){
  if(document.getElementById('ssa-easter-popup'))return;
  const o=document.createElement('div');o.id='ssa-easter-popup';
  o.style.cssText='position:fixed;inset:0;z-index:100000;background:rgba(8,24,44,.48);display:flex;align-items:center;justify-content:center;padding:20px';
  o.innerHTML='<div style="width:min(440px,100%);background:#fff;border:1px solid #b9c7d8;border-radius:8px;box-shadow:0 18px 60px rgba(0,0,0,.22);overflow:hidden"><div style="padding:14px 18px;background:#103c70;color:#fff;font-weight:700">'+title+'</div><div style="padding:20px 18px;color:#26384d;line-height:1.75;font-size:13px">'+body+'</div><div style="padding:10px 18px;border-top:1px solid #e5eaf0;text-align:right"><button type="button" style="border:0;border-radius:4px;background:#1557a6;color:#fff;padding:7px 14px;cursor:pointer">확인</button></div></div>';
  o.querySelector('button').onclick=()=>o.remove();o.onclick=e=>{if(e.target===o)o.remove()};document.body.appendChild(o);
 }

 /* 1. 청 로고를 짧은 시간 안에 7회 클릭 */
 let clicks=0,timer=0;
 document.addEventListener('click',e=>{
  const logo=e.target.closest('.emblem,.brand');
  if(!logo)return;
  clicks++;clearTimeout(timer);timer=setTimeout(()=>clicks=0,1600);
  if(clicks>=7){
   clicks=0;mark('logo');
   popup('시스템 점검 기록','2007년 3월 14일, 중앙 관제 서버에서 11초간 미확인 신호가 감지되었습니다.<br><br><small>※ 현재까지 원인은 확인되지 않았습니다.</small>');
  }
 });

 /* 2. 검색창에 특정 문자열을 입력 */
 document.addEventListener('submit',e=>{
  const form=e.target.closest('#siteSearch');if(!form)return;
  const input=document.getElementById('searchInput'),v=(input?.value||'').trim().toLowerCase();
  if(v==='관제실' || v==='control room'){
   e.preventDefault();mark('control');
   popup('내부 문서 열람','문서번호 SSA-INT-041<br><br>해당 문서는 공개 대상이 아닙니다.<br><br><small>접근 기록이 남았습니다.</small>');
  }
 });

 /* 3. 키보드 비밀 입력 */
 let seq='';
 const secret='sentinel';
 document.addEventListener('keydown',e=>{
  if(e.key.length!==1)return;
  seq=(seq+e.key.toLowerCase()).slice(-secret.length);
  if(seq===secret){
   seq='';mark('keyboard');
   popup('인증 완료','<strong>환영합니다.</strong><br><br>이 화면을 발견했다면 당신은 이미 충분히 오래 이 사이트를 둘러보고 있습니다.<br><br><small>SSA / INTERNAL ARCHIVE</small>');
  }
 });

 /* 4. 특정 연혁 항목을 길게 누르기 */
 let pressTimer;
 document.addEventListener('pointerdown',e=>{
  const h=e.target.closest('.history-list article');if(!h)return;
  pressTimer=setTimeout(()=>{
   mark('history');
   popup('기록 열람','기록 보존 상태: 정상<br>원본 문서와 대조 완료<br><br><small>일부 기록은 의도적으로 공개되지 않았습니다.</small>');
  },1800);
 });
 document.addEventListener('pointerup',()=>clearTimeout(pressTimer));
 document.addEventListener('pointercancel',()=>clearTimeout(pressTimer));
})();

/* Admin mode removed: no fallback admin toggle. */


/* ===== bundled from js/lightbox.js ===== */
/* ===== APOSTLE PHOTO LIGHTBOX FINAL ===== */
(function(){
 function zoom(src,alt){
  if(!src)return;
  var old=document.querySelector('.apostle-photo-lightbox');
  if(old)old.remove();
  var o=document.createElement('div');
  o.className='apostle-photo-lightbox';
  o.innerHTML='<img alt="">';
  var im=o.querySelector('img'); im.src=src; im.alt=alt||'괴수 사진 확대';
  function close(){o.remove();document.removeEventListener('keydown',esc)}
  function esc(e){if(e.key==='Escape')close()}
  o.addEventListener('click',close);
  im.addEventListener('click',function(e){e.stopPropagation()});
  document.addEventListener('keydown',esc);
  document.body.appendChild(o);
 }
 document.addEventListener('click',function(e){
  var im=e.target.closest('.apostle-photo img,.sentinel-detail-photo img');
  if(!im)return;
  if(e.target.closest('.official-photo-actions'))return;
  e.preventDefault();
  e.stopImmediatePropagation();
  zoom(im.currentSrc||im.src,im.alt);
 },true);
})();


/* ===== bundled from js/live-crisis.js ===== */
/* Live crisis feed — refreshed by the scheduled updater. */
(function(){
  const esc=s=>String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  const levelRank={관심:1,주의:2,경계:3,심각:4};
  const cls={관심:'interest',주의:'caution',경계:'warning',심각:'critical'};

  async function load(){
    try{
      const res=await fetch('./data/live-crisis.json?v='+Date.now(),{cache:'no-store'});
      if(!res.ok) throw new Error('live feed '+res.status);
      const feed=await res.json();
      window.LIVE_CRISIS=feed;
      apply(feed);
      window.dispatchEvent(new CustomEvent('ssa-live-crisis-updated',{detail:feed}));
    }catch(e){
      console.warn('[Sentinel] live crisis feed unavailable',e);
    }
  }

  function apply(feed){
    const national=feed?.nationalWarning;
    const home=document.querySelector('.hero-notice');
    if(home && national && national.level){
      const stage={관심:'1단계',주의:'2단계',경계:'3단계',심각:'4단계'}[national.level]||'';
      const strong=home.querySelector('strong'), span=home.querySelector('span');
      if(strong) strong.textContent=national.level+' · '+stage;
      if(span) span.innerHTML=esc(national.issuedAtDisplay||feed.updatedAtDisplay||'')+' 발령<br>'+esc(national.title||'전국 위기경보');
    }

    const byRegion={};
    (feed?.regionalAlerts||[]).forEach(a=>{
      const old=byRegion[a.region];
      if(!old || (levelRank[a.level]||0)>(levelRank[old.level]||0) || String(a.issuedAt)>String(old.issuedAt)) byRegion[a.region]=a;
    });

    document.querySelectorAll('.crisis-map-svg .region[data-region]').forEach(el=>{
      const a=byRegion[el.dataset.region];
      if(!a)return;
      el.classList.remove('region-interest','region-caution','region-warning');
      el.classList.add(({관심:'region-interest',주의:'region-caution',경계:'region-warning'}[a.level])||'region-interest');
      const title=el.querySelector('title');
      if(title)title.textContent=el.dataset.region+' · '+a.level;
    });

    const stamp=document.querySelector('#mapTitle')?.parentElement?.querySelector('small');
    if(stamp) stamp.textContent='17개 시·도 · 최종 업데이트 '+(feed.updatedAtDisplay||'-')+' 기준';

    const root=document.getElementById('alertHistoryList');
    if(root && Array.isArray(feed.history) && feed.history.length){
      const current=Array.isArray(window.__SSA_BASE_ALERT_HISTORY)?window.__SSA_BASE_ALERT_HISTORY:[];
      const merged=[...feed.history,...current];
      const seen=new Set();
      const rows=merged.filter(x=>{
        const k=[x.issuedAt,x.region,x.title].join('|');
        if(seen.has(k))return false; seen.add(k); return true;
      }).sort((a,b)=>String(b.issuedAt).localeCompare(String(a.issuedAt))).slice(0,100);
      root.innerHTML=rows.map(x=>'<article class="alert-item"><time class="alert-time">'+esc(x.issuedAtDisplay||x.issuedAt)+'</time><span class="alert-region">'+esc(x.region||'전국')+'</span><span class="alert-title">'+esc(x.title||x.message||'')+'</span><b class="alert-level '+(cls[x.level]||'caution')+'">'+esc(x.level||'안내')+'</b></article>').join('');
    }
  }

  window.__ssaLiveCrisis={load,apply};
  document.addEventListener('DOMContentLoaded',load);
  setInterval(load,15000);
})();

/* ===== bundled from js/community.js ===== */
/* Sentinel portal community/account/staff chat UI.
   Static-host demo: localStorage is not secure authentication or shared realtime storage. */
(function(){
'use strict';
const STORE='sentinel_portal_demo_v1';
const read=()=>{try{return JSON.parse(localStorage.getItem(STORE))||{user:null,posts:[],messages:[]}}catch(e){return {user:null,posts:[],messages:[]}}};
const save=s=>localStorage.setItem(STORE,JSON.stringify(s));
let state=read(), activeTab='all', activeRoom='공지·업무', modal=null;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=(sel,root=document)=>root.querySelector(sel);
function ensureActions(){
 const header=$('header')||$('.header-top')||$('.header-search');
 if(!header||$('#sentinel-extra-actions'))return;
 const actions=document.createElement('div');actions.id='sentinel-extra-actions';actions.className='sentinel-extra-actions';
 actions.innerHTML='<button class="primary" data-feature="login">로그인</button>';actions.style.display='flex';actions.style.visibility='visible';actions.style.opacity='1';
 const util=$('.header-top .container',header)||$('.header-top',header)||header;util.appendChild(actions);
}
function open(title,subtitle,content){
 close();modal=document.createElement('div');modal.className='sentinel-feature-layer';modal.innerHTML='<section class="sentinel-feature-dialog" role="dialog" aria-modal="true" aria-label="'+esc(title)+'"><header class="sentinel-feature-head"><div><h2>'+esc(title)+'</h2><p>'+esc(subtitle)+'</p></div><button class="sentinel-feature-close" data-close>닫기 ✕</button></header><div class="sentinel-feature-body">'+content+'</div></section>';
 document.body.appendChild(modal);modal.addEventListener('click',e=>{if(e.target===modal||e.target.closest('[data-close]'))close();});modal.addEventListener('submit',handleSubmit);modal.addEventListener('click',handleClick);
}
function close(){if(modal){modal.remove();modal=null}}
function accountContent(){return '<div class="sentinel-feature-grid"><section class="sentinel-feature-panel"><h3>로그인</h3><div class="inner"><form class="sentinel-feature-form" data-form="login"><label>아이디<input name="id" autocomplete="username" required></label><label>비밀번호<input name="password" type="password" autocomplete="current-password" required></label><button class="sentinel-feature-btn">로그인</button></form><p class="sentinel-feature-muted">직원 시연 계정: <b>staff-demo</b> / <b>sentinel2026</b></p></div></section><section class="sentinel-feature-panel"><h3>계정 안내</h3><div class="inner"><p>커뮤니티 글 작성과 직원 전용 채팅은 로그인 후 이용할 수 있어요.</p><p class="sentinel-feature-muted">현재는 정적 사이트용 시연 기능이에요. 계정과 대화는 이 브라우저에만 저장되며, 실제 보안 인증이나 여러 사용자 간 실시간 채팅은 제공하지 않아요.</p><button class="sentinel-feature-btn secondary" data-feature="community">커뮤니티 둘러보기</button></div></section></div>'}
function communityContent(){
 const posts=state.posts.filter(p=>activeTab==='all'||(activeTab==='notice'?p.category==='공지':p.category==='자유'));
 return '<div class="sentinel-feature-tabs"><button data-tab="all" class="'+(activeTab==='all'?'active':'')+'">전체글</button><button data-tab="notice" class="'+(activeTab==='notice'?'active':'')+'">공지사항</button><button data-tab="free" class="'+(activeTab==='free'?'active':'')+'">자유게시판</button></div>'+
 (state.user?'<section class="sentinel-feature-panel" style="margin-bottom:18px"><h3>새 글 작성</h3><div class="inner"><form class="sentinel-feature-form" data-form="post"><label>게시판<select name="category"><option>자유</option><option>공지</option></select></label><label>제목<input name="title" maxlength="100" required></label><label>내용<textarea name="body" maxlength="5000" required></textarea></label><button class="sentinel-feature-btn">게시글 등록</button></form></div></section>':'<div class="sentinel-feature-alert">글을 작성하려면 먼저 로그인해 주세요. <button class="sentinel-feature-btn secondary" data-feature="login">로그인</button></div>')+
 (posts.length?posts.slice().reverse().map(p=>'<article class="sentinel-post"><div class="sentinel-post-top"><span>'+esc(p.category)+' 게시판 · '+esc(p.author)+'</span><time>'+esc(p.date)+'</time></div><h4>'+esc(p.title)+'</h4><p>'+esc(p.body)+'</p><div class="sentinel-post-actions"><button data-like="'+esc(p.id)+'">추천 '+p.likes+'</button></div></article>').join(''):'<div class="sentinel-feature-empty">등록된 게시글이 없어요.</div>');
}
function chatContent(){
 const rooms=['공지·업무','현장지원','직원 자유대화'];
 const msgs=state.messages.filter(m=>m.room===activeRoom);
 return '<div class="sentinel-feature-alert">직원 계정 전용 시연 채팅입니다. 메시지는 현재 브라우저에만 저장됩니다.</div><div class="sentinel-chat-layout"><aside class="sentinel-chat-rooms">'+rooms.map(r=>'<button data-room="'+esc(r)+'" class="'+(r===activeRoom?'active':'')+'">'+esc(r)+'</button>').join('')+'</aside><section class="sentinel-chat-main"><div class="sentinel-chat-messages">'+(msgs.length?msgs.map(m=>'<article class="sentinel-chat-message '+(state.user&&m.author===state.user.id?'mine':'')+'"><small>'+esc(m.author)+' · '+esc(m.time)+'</small>'+esc(m.text)+'</article>').join(''):'<div class="sentinel-feature-empty">아직 메시지가 없습니다.</div>')+'</div><form class="sentinel-chat-compose" data-form="chat"><input name="message" maxlength="1000" placeholder="직원 채팅 메시지 입력…" required><button class="sentinel-feature-btn">전송</button></form></section></div>';
}
function showLogin(){open('센티넬관리청 통합 로그인','통합 계정으로 커뮤니티 및 직원 서비스를 이용하세요.',accountContent())}
function showCommunity(){open('커뮤니티','공지사항과 자유게시판을 확인하고 의견을 나눌 수 있습니다.',communityContent())}
function showChat(){if(!state.user||state.user.role!=='staff'){showLogin();return}open('직원 전용 커뮤니티 채팅','직원 간 업무 공지와 현장 지원 내용을 공유합니다.',chatContent())}
function refresh(){if(!modal)return;const title=$('.sentinel-feature-head h2',modal)?.textContent;if(title==='커뮤니티')showCommunity();else if(title==='직원 전용 커뮤니티 채팅')showChat();else showLogin()}
function handleSubmit(e){
 const form=e.target.closest('form[data-form]');if(!form)return;e.preventDefault();const fd=new FormData(form);
 if(form.dataset.form==='login'){
  const id=String(fd.get('id')||'').trim(),pw=String(fd.get('password')||'');
  if(id==='staff-demo'&&pw==='sentinel2026'){state.user={id,role:'staff'};save(state);open('로그인 완료','직원 계정으로 로그인했습니다.','<div class="sentinel-feature-alert">직원 계정으로 로그인했어요. 이제 직원 전용 채팅을 이용할 수 있습니다.</div><button class="sentinel-feature-btn" data-feature="chat">직원 채팅 열기</button>');ensureActions();return}
  if(id&&pw){state.user={id,role:'member'};save(state);open('로그인 완료','커뮤니티 계정으로 로그인했습니다.','<div class="sentinel-feature-alert">'+esc(id)+' 계정으로 이 브라우저에서 로그인했어요.</div><button class="sentinel-feature-btn" data-feature="community">커뮤니티 열기</button>');return}
 }
 if(form.dataset.form==='post'){
  if(!state.user){showLogin();return}state.posts.push({id:String(Date.now()),category:String(fd.get('category')),title:String(fd.get('title')).trim(),body:String(fd.get('body')).trim(),author:state.user.id,date:new Date().toLocaleString('ko-KR'),likes:0});save(state);activeTab='all';showCommunity();return;
 }
 if(form.dataset.form==='chat'){
  if(!state.user||state.user.role!=='staff'){showLogin();return}const message=String(fd.get('message')||'').trim();if(!message)return;state.messages.push({room:activeRoom,author:state.user.id,text:message,time:new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})});save(state);showChat();
 }
}
function handleClick(e){
 const feature=e.target.closest('[data-feature]');if(feature){e.preventDefault();const f=feature.dataset.feature;if(f==='login')showLogin();if(f==='community')showCommunity();if(f==='chat')showChat();return}
 const tab=e.target.closest('[data-tab]');if(tab){activeTab=tab.dataset.tab;showCommunity();return}
 const room=e.target.closest('[data-room]');if(room){activeRoom=room.dataset.room;showChat();return}
 const like=e.target.closest('[data-like]');if(like){const p=state.posts.find(x=>x.id===like.dataset.like);if(p){p.likes++;save(state);showCommunity()}return}
}
document.addEventListener('click',e=>{const f=e.target.closest('[data-feature]');if(f&&!modal){const v=f.dataset.feature;if(v==='login')showLogin();else if(v==='community')showCommunity();else if(v==='chat')showChat()}});


})();

/* 메뉴 시작점=로고 왼쪽 끝, 끝점=검색창 오른쪽 끝 (데스크톱) */
(function(){
 function alignNav(){
  var nav=document.querySelector('.main-nav .nav-inner');
  var brand=document.querySelector('.header-top .emblem');
  var sf=document.querySelector('.header-top .search-form');
  if(!nav||!brand||!sf)return;
  if(window.innerWidth<1101){nav.style.marginLeft='';nav.style.width='';return;}
  var L=brand.getBoundingClientRect().left;
  var R=sf.getBoundingClientRect().right;
  var P=nav.parentElement.getBoundingClientRect().left;
  nav.style.marginLeft=(L-P)+'px';
  nav.style.width=(R-L)+'px';
 }
 window.addEventListener('resize',alignNav);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',alignNav);else alignNav();
 window.addEventListener('load',alignNav);
})();

