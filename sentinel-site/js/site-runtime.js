/* ===== bundled from js/scheduler.js ===== */
/* Scheduled publication and live crisis layer */
(function(){
  const now=()=>Date.now();
  const t=s=>{const v=Date.parse(s);return Number.isNaN(v)?0:v};
  const published=x=>t(x.publishAt)<=now();
  const active=x=>t(x.startAt)<=now()&&t(x.endAt)>now();
  const merge=(base,extra,key)=>{
    const set=new Set(base.map(key));
    return base.concat(extra.filter(x=>!set.has(key(x))));
  };

  function applyBoards(){
    const s=window.SCHEDULED_CONTENT||{};
    window.NOTICE_DATA=merge(
      Array.isArray(window.NOTICE_DATA)?window.NOTICE_DATA:[],
      (s.notices||[]).filter(published).map(x=>[x.no,x.title,x.department,x.date,x.file,...x.body]),
      x=>x[1]
    );
    window.PRESS_DATA=merge(
      Array.isArray(window.PRESS_DATA)?window.PRESS_DATA:[],
      (s.press||[]).filter(published).map(x=>[x.date,x.title,x.department,x.category,...x.body]),
      x=>x[1]
    );
    window.BRIEFING_DATA=merge(
      Array.isArray(window.BRIEFING_DATA)?window.BRIEFING_DATA:[],
      (s.briefing||[]).filter(published).map(x=>[x.date,x.title,x.department,x.category,...x.body]),
      x=>x[1]
    );
  }

  function applyCrisisMap(){
    const root=document.querySelector('.crisis-map-svg');
    if(!root)return;

    const levelClass={관심:'region-interest',주의:'region-caution',경계:'region-warning'};
    const labelClass={관심:'label-interest',주의:'label-caution',경계:'label-warning'};
    const levelRank={관심:1,주의:2,경계:3};
    const regions=[...root.querySelectorAll('.region[data-region]')];
    const labels=[...root.querySelectorAll('.map-status-label')];

    regions.forEach(el=>{
      if(!el.dataset.baseClass){
        el.dataset.baseClass=[...el.classList].find(c=>c.startsWith('region-'))||'region-interest';
      }
      el.classList.remove('region-interest','region-caution','region-warning');
      el.classList.add(el.dataset.baseClass);
    });

    labels.forEach(el=>{
      if(!el.dataset.baseLabelClass){
        el.dataset.baseLabelClass=[...el.classList].find(c=>c.startsWith('label-'))||'label-interest';
      }
      el.classList.remove('label-interest','label-caution','label-warning');
      el.classList.add(el.dataset.baseLabelClass);
    });

    const activeAlerts=(window.SCHEDULED_CONTENT?.alerts||[]).filter(active);
    const byRegion={};

    activeAlerts.forEach(alert=>{
      const current=byRegion[alert.region];
      if(!current || t(alert.startAt)>t(current.startAt)) byRegion[alert.region]=alert;
    });

    Object.entries(byRegion).forEach(([region,alert])=>{
      const cls=levelClass[alert.level]||'region-interest';
      regions.filter(el=>el.dataset.region===region).forEach(el=>{
        el.classList.remove('region-interest','region-caution','region-warning');
        el.classList.add(cls);
        const title=el.querySelector('title');
        if(title)title.textContent=region+' · '+alert.level;
      });

      const short=region
        .replace('특별자치도','')
        .replace('특별시','')
        .replace('광역시','');

      labels.forEach(label=>{
        const text=(label.textContent||'').trim();
        if(text===short){
          label.classList.remove('label-interest','label-caution','label-warning');
          label.classList.add(labelClass[alert.level]||'label-interest');
        }
      });
    });

    const currentAlert=activeAlerts
      .slice()
      .sort((a,b)=>{
        const levelDiff=(levelRank[b.level]||0)-(levelRank[a.level]||0);
        return levelDiff||t(b.startAt)-t(a.startAt);
      })[0];

    const home=document.querySelector('.hero-notice');
    if(home){
      const strong=home.querySelector('strong');
      const span=home.querySelector('span');

      if(currentAlert){
        const stage={관심:'1단계',주의:'2단계',경계:'3단계'}[currentAlert.level]||'';
        const issued=new Date(currentAlert.startAt);
        if(strong)strong.textContent=currentAlert.level+' · '+stage;
        if(span){
          span.innerHTML=
            issued.getFullYear()+'.'+String(issued.getMonth()+1).padStart(2,'0')+'.'+String(issued.getDate()).padStart(2,'0')+
            '. '+issued.toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})+
            ' 발령<br>'+currentAlert.region+' · '+currentAlert.title;
        }
      }else{
        if(strong)strong.textContent='현재 별도 위기경보 없음';
        if(span)span.textContent='현재 시간 기준 진행 중인 예약 위기경보가 없습니다.';
      }
    }
  }

  function apply(){
    applyBoards();
    applyCrisisMap();
    window.dispatchEvent(new CustomEvent('ssa-scheduled-updated'));
  }

  window.__ssaScheduler={refresh:apply,published,active,applyCrisisMap};

  document.addEventListener('DOMContentLoaded',apply);
  apply();
  setInterval(apply,15000);
})();

/* ===== bundled from js/live-clock.js ===== */
/* ===== 사이트 실시간 현재 날짜·시간 ===== */
(function(){
  const TZ='Asia/Seoul';

  function parts(){
    return new Intl.DateTimeFormat('ko-KR',{
      timeZone:TZ,
      year:'numeric',month:'2-digit',day:'2-digit',
      hour:'2-digit',minute:'2-digit',second:'2-digit',
      hour12:false
    }).formatToParts(new Date()).reduce((o,p)=>(o[p.type]=p.value,o),{});
  }

  function update(){
    const p=parts();
    const dateTime=p.year+'.'+p.month+'.'+p.day+' '+p.hour+':'+p.minute+':'+p.second;
    const iso=p.year+'-'+p.month+'-'+p.day+'T'+p.hour+':'+p.minute+':'+p.second+'+09:00';

    const el=document.getElementById('siteCurrentDateTime');
    if(el){
      el.textContent=dateTime;
      el.dateTime=iso;
    }

    document.querySelectorAll('input[type="datetime-local"]').forEach(input=>{
      if(input.dataset.liveClockInitialized==='true')return;
      const value=p.year+'-'+p.month+'-'+p.day+'T'+p.hour+':'+p.minute;
      if(!input.value)input.value=value;
      input.dataset.liveClockInitialized='true';
    });

    document.documentElement.dataset.siteDate=p.year+'.'+p.month+'.'+p.day;
    document.documentElement.dataset.siteTime=p.hour+':'+p.minute+':'+p.second;
  }

  update();
  setInterval(update,1000);
})();

/* ===== bundled from js/easter-eggs.js ===== */
/* 센티넬안전관리청 숨겨진 기록 — 이스터에그 모음 */
(function(){
  const seen=new Set();
  let toastTimer;
  function toast(message){
    let el=document.getElementById('ssaEggToast');
    if(!el){
      el=document.createElement('div');
      el.id='ssaEggToast';
      el.setAttribute('aria-live','polite');
      el.style.cssText='position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:99999;padding:11px 16px;background:rgba(10,28,55,.94);color:#fff;border:1px solid rgba(255,255,255,.2);border-radius:6px;font-size:12px;line-height:1.5;box-shadow:0 8px 30px rgba(0,0,0,.2);opacity:0;pointer-events:none;transition:opacity .2s;max-width:min(88vw,520px);text-align:center';
      document.body.appendChild(el);
    }
    clearTimeout(toastTimer); el.textContent=message; el.style.opacity='1';
    toastTimer=setTimeout(()=>el.style.opacity='0',4200);
  }
  function found(id,message){if(seen.has(id))return;seen.add(id);toast(message)}
  function clicks(el,count,id,message,windowMs=1800){
    if(!el)return; let n=0,last=0;
    el.addEventListener('click',()=>{
      const now=Date.now(); if(now-last>windowMs)n=0; last=now; n++;
      if(n>=count){n=0;found(id,message)}
    });
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const search=document.getElementById('searchInput');
    search?.addEventListener('input',()=>{
      if(search.value.replace(/\s/g,'')==='2002')found('egg02','검색 색인: 2002년 자료 1건 · 열람 권한이 제한되어 있습니다.');\n      if(search.value.replace(/\s/g,'')==='2005')found('egg13','보존자료 색인: 2005년 초기 대응기록 · 일부 작전기록은 현재도 제한 열람입니다.');
    });
    clicks(document.getElementById('siteCurrentDateTime'),5,'egg03','시각 동기화 기록 · 마지막 확인: 정상 · 다음 확인: 자동 처리');
    const copyright=[...document.querySelectorAll('.footer-info')].find(x=>x.textContent.includes('Copyright'));
    clicks(copyright,3,'egg04','보존 문서: 이 페이지의 모든 시각은 한국 표준시를 기준으로 기록됩니다.');
    clicks(document.getElementById('allMenu'),6,'egg05','관리자 메모 · 메뉴 구조는 2002년 이후 세 차례 변경되었습니다.');
    clicks(document.querySelector('.crisis-map-svg [data-region="서울특별시"]'),3,'egg06','서울 · 현황 조회 완료 · 상세 현장기록은 공개 대상이 아닙니다.');
    clicks(document.querySelector('.crisis-map-svg [data-region="제주특별자치도"]'),4,'egg07','제주 현장기록 04번 · 신호는 확인되었으나 발신 위치는 기록되지 않았습니다.');
    const admin=document.getElementById('adminModeBtn'); let hoverTimer;
    admin?.addEventListener('mouseenter',()=>{hoverTimer=setTimeout(()=>found('egg08','관리자 권한 확인 · 현재 계정에는 해당 기록을 열람할 권한이 없습니다.'),5000)});
    admin?.addEventListener('mouseleave',()=>clearTimeout(hoverTimer));
    let keys='';
    document.addEventListener('keydown',e=>{
      if(e.key.length!==1)return; keys=(keys+e.key.toUpperCase()).slice(-3);
      if(keys==='SSA'){found('egg09','SSA 내부 단축키 · 정상 작동합니다. 이 기능은 공개 안내서에 수록되어 있지 않습니다.');keys=''}
    });
    let aruCount=0;
    search?.addEventListener('change',()=>{
      if(search.value.trim().toUpperCase()==='ARU'){aruCount++;if(aruCount>=3){found('egg10','ARU 운용기록 · 03:17에 자동 점검이 예약되어 있습니다.');aruCount=0}}
    });
    document.addEventListener('click',e=>{
      const a=e.target.closest('#briefing .board-row:last-child'); if(a){
        const now=Date.now(); const s=window.__ssaEggBriefing||{n:0,last:0};
        if(now-s.last>1600)s.n=0; s.n++;s.last=now;window.__ssaEggBriefing=s;
        if(s.n>=3){s.n=0;found('egg11','정책자료 보관번호 SSA-2026-001 · 원문에는 공개되지 않은 부록이 존재합니다.')}
      }
      const p=e.target.closest('#noticeArticle .notice-article-body p:last-child'); if(p){
        const now=Date.now(); const s=window.__ssaEggNotice||{n:0,last:0};
        if(now-s.last>1700)s.n=0;s.n++;s.last=now;window.__ssaEggNotice=s;
        if(s.n>=4){s.n=0;found('egg12','점검기록 36-04 · 기록상태: 확인 필요 · 담당자에게 자동 전달되었습니다.')}
      }
    });
  });
})();

/* ===== bundled from js/mystery.js ===== */
/* ===== THE 17TH OBSERVATION / BAek Cheong-sim mystery layer ===== */
(function(){
  const KEY=[48,56,49,55].map(n=>String.fromCharCode(n)).join('');
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const modal=(title,body,opts={})=>{
    document.getElementById('mysteryModal')?.remove();
    const o=document.createElement('div');
    o.id='mysteryModal';o.className='mystery-modal';
    o.innerHTML='<div class="mystery-dialog" role="dialog" aria-modal="true" aria-labelledby="mysteryTitle">'+
      '<div class="mystery-dialog-head"><span class="mystery-classified">ARCHIVE ACCESS</span><button type="button" class="mystery-close" aria-label="닫기">×</button></div>'+
      '<div class="mystery-dialog-body"><h2 id="mysteryTitle">'+title+'</h2>'+body+'</div></div>';
    document.body.appendChild(o);
    const close=()=>o.remove();
    o.querySelector('.mystery-close').onclick=close;
    o.addEventListener('click',e=>{if(e.target===o)close()});
    document.addEventListener('keydown',function k(e){if(e.key==='Escape'){close();document.removeEventListener('keydown',k)}},{once:true});
    return o;
  };

  function password(){
    if(localStorage.getItem('ssa_17_unlocked')==='1'){showArchiveRecord();return;}
    const o=modal('보존기록 열람 인증',
      '<p class="mystery-lead">해당 기록은 공개 범위가 제한된 초기 작전자료입니다.</p>'+
      '<p class="mystery-muted">문서번호 <b>SSA-O-2005-17</b></p>'+
      '<form id="mysteryPasswordForm" class="mystery-password-form">'+
      '<label for="mysteryPassword">비밀번호</label><input id="mysteryPassword" type="password" inputmode="numeric" autocomplete="off" maxlength="12" placeholder="비밀번호 입력">'+
      '<button type="submit">열람</button><p id="mysteryPasswordError" class="mystery-error" aria-live="polite"></p></form>'+
      '');
    const form=o.querySelector('#mysteryPasswordForm'),input=o.querySelector('#mysteryPassword'),err=o.querySelector('#mysteryPasswordError');
    form.addEventListener('submit',e=>{
      e.preventDefault();
      if(input.value.trim()===KEY){o.remove();localStorage.setItem('ssa_17_unlocked','1');showArchiveRecord();return;}
      err.textContent='인증에 실패했습니다. 관련 공개기록을 다시 확인해 주세요.';
      input.value='';input.focus();
    });
    input.focus();
  }

  function showArchiveRecord(){
    const years={
      "2002":[
        {date:"2002.05.23",label:"괴수 대응 출동"},
        {date:"2002.06.11",label:"현장 출동"},
        {date:"2002.07.03",label:"이상징후 대응"},
        {date:"2002.07.27",label:"괴수 대응 출동"},
        {date:"2002.08.09",label:"현장 출동"},
        {date:"2002.09.14",label:"도심권 출동"},
        {date:"2002.10.02",label:"현장 출동"},
        {date:"2002.10.21",label:"괴수 대응 출동"},
        {date:"2002.11.08",label:"현장 출동"},
        {date:"2002.11.19",label:"이상징후 대응"},
        {date:"2002.12.12",label:"연말 현장 출동"},
        {date:"2002.12.27",label:"괴수 대응 출동"},
        {date:"2002.05.06",label:"첫 출동",detail:[
          ["09:10","출동","최초 괴수 발생지역 현장 투입","백청심 포함 3명 현장 투입. 주민 대피와 현장 통제를 시작함.","수도권 외곽 / 통제구역 설정"],
          ["11:36","현장 도착","주민 대피 및 위험구역 통제","민간인 대피 완료. 미확인 생체반응이 확인된 건물 주변을 통제구역으로 지정.","추가 피해 없음"],
          ["16:22","귀환","초기 대응반 본부 복귀","현장 수습 후 장비 반납 및 경과보고 제출.","후속 관측 인원으로 지정"]
        ]}
      ],
      "2003":[
        {date:"2003.01.14",label:"현장 출동"},{date:"2003.02.07",label:"괴수 대응 출동"},
        {date:"2003.03.19",label:"현장 출동"},{date:"2003.04.08",label:"이상징후 대응"},
        {date:"2003.05.17",label:"현장 출동"},{date:"2003.06.21",label:"괴수 대응 출동"},
        {date:"2003.07.05",label:"현장 출동"},{date:"2003.08.16",label:"도심권 출동"},
        {date:"2003.09.03",label:"현장 출동"},{date:"2003.10.12",label:"이상징후 대응"},
        {date:"2003.11.03",label:"괴수 대응 출동"},{date:"2003.12.18",label:"현장 출동"},
        {date:"2003.12.27",label:"연말 현장 출동"}
      ],
      "2004":[
        {date:"2004.01.09",label:"현장 출동"},{date:"2004.02.18",label:"괴수 대응 출동"},
        {date:"2004.03.12",label:"현장 출동"},{date:"2004.04.06",label:"이상징후 대응"},
        {date:"2004.05.15",label:"현장 출동"},{date:"2004.06.03",label:"괴수 대응 출동"},
        {date:"2004.07.22",label:"현장 출동"},{date:"2004.08.11",label:"도심권 출동"},
        {date:"2004.09.04",label:"현장 출동"},{date:"2004.10.17",label:"이상징후 대응"},
        {date:"2004.11.06",label:"괴수 대응 출동"},{date:"2004.12.16",label:"현장 출동"},
        {date:"2004.12.28",label:"연말 현장 출동"}
      ],
      "2005":[
        {date:"2005.01.13",label:"현장 출동"},{date:"2005.01.27",label:"괴수 대응 출동"},{date:"2005.02.11",label:"괴수 대응 출동"},
        {date:"2005.03.08",label:"현장 출동"},{date:"2005.03.24",label:"이상징후 대응"},{date:"2005.04.19",label:"이상징후 대응"},
        {date:"2005.05.07",label:"현장 출동"},{date:"2005.05.26",label:"괴수 대응 출동"},{date:"2005.06.28",label:"괴수 대응 출동"},
        {date:"2005.07.05",label:"현장 출동"},{date:"2005.07.16",label:"현장 출동"},{date:"2005.08.17",label:"순직 작전",detail:[
          ["05:42","출동","수도권 제3현장대응반 출동","미확인 생체반응 신고 접수. 백청심 외 4명 출동.","서울 동부권 외곽 산업단지"],
          ["06:18","현장 도착","1차 안전구역 설정","민간인 대피 완료. 반경 300m 통제선 설정.","통제선 유지 / 추가 인원 요청 없음"],
          ["07:03","현장 확인","미확인 개체 흔적 확인","폐창고 내부에서 비정상적인 열원과 잔류물 발견. 개체는 확인되지 않음.","백청심 담당 / 사진 06매"],
          ["08:27","능력 발현","백청심 능력 반응 확인","현장 진입 직후 능력 반응 발생. 기존 자료보다 높은 반응이 측정됨.","계측기 03호 / 원자료 별도 보존"],
          ["08:31","괴수 발생","미확인 개체 출현","통제구역 중앙에서 미확인 개체 출현. 대응반 방어대형 전환.","당시 판정 보류 / 주민 피해 없음"],
          ["08:46","교전","1차 제압 시도","개체 이동경로 차단 및 억제 시도. 백청심의 위치를 지속적으로 추적하는 양상 확인.","대응반 2명 경상"],
          ["09:12","지원 요청","추가 대응인력 요청","현장 상황 악화로 지원반 요청. 백청심은 현장 잔류.","09:11 이후 일부 통신 불안정"],
          ["09:28","복귀","현장대응반 일부 귀환","1차 대응인력 복귀 시작. 백청심은 현장 확인을 위해 잔류.","복귀 3명 / 잔류 2명"],
          ["09:41","신호 소실","백청심 위치 신호 중단","위치 신호 및 통신 응답이 동시에 중단됨. 재진입 보류.","통제구역 북측 / 응답 없음"],
          ["11:06","수습","현장 수습","개체 제압 완료. 백청심의 장비 일부 확인.","통신기 1점 / 보호장비 일부"],
          ["14:20","귀환","제3현장대응반 본부 복귀","잔여 인원 및 장비 본부 복귀.","수도권 초기대응본부"]
        ]},
        {date:"2005.08.18",label:"순직 처리"}
      ]
    };

    const detail=list=>list.map(x=>'<article class="archive-log-entry"><time><b>'+x[0]+'</b></time><div><span class="archive-log-type">'+x[1]+'</span><h4>'+x[2]+'</h4><p>'+x[3]+'</p><small>'+x[4]+'</small></div></article>').join('');
    const openDetail=item=>{
      const parts=item.date.split('.');
      modal(parts[1]+'월 '+parts[2]+'일 · '+item.label,
        '<div class="mystery-document archive-detail">'+
        '<button type="button" class="archive-back-button" data-archive-back>← 보존기록 목록으로</button>'+
        '<div class="mystery-doc-meta"><span>백청심 현장자료</span><span>'+item.date+'</span></div>'+
        '<div class="archive-log-list">'+detail(item.detail)+'</div>'+
        '</div>');
      const detailModal=document.getElementById('mysteryModal');
      detailModal?.querySelector('[data-archive-back]')?.addEventListener('click',()=>{
        detailModal.remove();
        showArchiveRecord();
      });
    };
    const list=items=>items.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(item=>{
      const clickable=!!item.detail;
      return '<button type="button" class="archive-date-row'+(clickable?' is-detail':'')+'" '+(clickable?'data-archive-detail="'+item.date+'"':'')+'>'+
        '<span class="archive-date">'+item.date.slice(5).replace('.','월 ')+'일</span>'+
        '<span class="archive-date-label">'+item.label+'</span>'+
        (clickable?'<span class="archive-date-arrow">›</span>':'')+'</button>';
    }).join('');
    const tabs=Object.keys(years).map(y=>'<button type="button" class="archive-year-tab'+(y==='2005'?' active':'')+'" data-archive-year="'+y+'">'+y+'년</button>').join('');

    const o=modal('SSA-O-2005-17 · 백청심 현장자료',
      '<div class="mystery-document archive-log-document">'+
      '<div class="mystery-doc-meta"><span>문서번호 SSA-O-2005-17</span><span>대상 백청심</span></div>'+
      '<div class="archive-log-head"><strong>백청심 활동 자료</strong><span>2002.05 ~ 2005.12</span></div>'+
      '<div class="archive-year-tabs" role="tablist" aria-label="연도별 현장자료">'+tabs+'</div>'+
      '<div class="archive-year-panel archive-date-list" id="archiveYearPanel">'+list(years["2005"])+'</div>'+
      '<div class="archive-log-footer"><span>보존자료 범위</span><b>2002.01 ~ 2005.12</b><small>자세한 현장자료는 일부 날짜만 공개됨.</small></div>'+
      '</div>');
    if(o){
      localStorage.setItem('ssa_17_unlocked','1');
      const panel=o.querySelector('#archiveYearPanel');
      const bind=()=>{
        o.querySelectorAll('[data-archive-detail]').forEach(btn=>btn.addEventListener('click',()=>{
          const active=o.querySelector('.archive-year-tab.active')?.dataset.archiveYear||'2005';
          const item=(years[active]||[]).find(x=>x.date===btn.dataset.archiveDetail);
          if(item?.detail) openDetail(item);
        }));
      };
      o.querySelectorAll('[data-archive-year]').forEach(tab=>tab.addEventListener('click',()=>{
        o.querySelectorAll('[data-archive-year]').forEach(x=>x.classList.remove('active'));
        tab.classList.add('active');
        panel.innerHTML=list(years[tab.dataset.archiveYear]);
        bind();
      }));
      bind();
    }
  }

  function baekProfile(){
    location.hash='#baek-profile';
  }

  document.addEventListener('click',e=>{
    const unlock=e.target.closest('[data-mystery-unlock]');
    if(unlock){e.preventDefault();password();return;}
    const profile=e.target.closest('[data-baek-profile]');
    if(profile){e.preventDefault();baekProfile();return;}
    const clue=e.target.closest('[data-mystery-clue]');
    if(clue){
      e.preventDefault();
      const kind=clue.dataset.mysteryClueKind;
      if(kind==='17') modal('문서 식별정보',
        '<p>초기 보존문서의 식별번호에는 현장자료를 추적하기 위한 내부 규칙이 적용되어 있다.</p><p class="mystery-muted">공개된 문서번호만으로는 열람 인증정보를 바로 확인할 수 없다.</p>');
      if(kind==='2005') modal('사건 연도 대조',
        '<p>백청심의 추모기록과 초기 현장자료는 서로 다른 문서 체계로 보존되어 있다.</p><p class="mystery-muted">두 자료의 날짜 표기를 대조하면 인증에 필요한 단서를 좁힐 수 있다.</p>');
      if(kind==='record') modal('기록 항목 안내',
        '<p>추모기록은 인적사항만을 공개하지만, 일부 초기 인물의 <b>기록</b> 항목은 별도 보존문서와 연결된다.</p><p class="mystery-muted">연결 대상은 모든 순직자에게 동일하지 않다.</p>');
    }
  });

  function caseBoard(){
    if(localStorage.getItem('ssa_17_unlocked')!=='1'){modal('연계기록 접근 제한','<p class="mystery-lead">공개된 추모기록에서 연결 가능한 보존자료를 먼저 확인해 주세요.</p>');return;}
    const found=JSON.parse(localStorage.getItem('ssa_case_clues')||'[]'), has=x=>found.includes(x);
    const card=(id,title,date,desc,locked)=>'<button type="button" class="case-link-card" data-case-id="'+id+'"><span>'+date+'</span><b>'+title+'</b><small>'+desc+'</small><em>'+(has(id)?'확인 완료':locked?'추가 단서 필요':'열람 가능')+'</em></button>';
    const o=modal('사건 연계 기록 · CASE 17','<div class="mystery-document case-board"><p class="mystery-lead">서로 다른 부서의 기록을 날짜와 문서번호로 대조하세요.</p><div class="case-link-grid">'+card('A','초기 대응반 인사기록','2002.05.06','백청심의 최초 출동 당시 소속 기록.',false)+card('B','괴수 분류 변경기록','2004.11.06','개체 판정 기준이 변경된 흔적.',!has('A'))+card('C','순직 작전 사후보고','2005.08.18','공개 발표와 보존자료 사이의 불일치.',!has('B'))+'</div><div class="case-progress"><b>확보한 연계기록</b><span>'+found.length+' / 3</span></div></div>');
    o.querySelectorAll('[data-case-id]').forEach(btn=>btn.addEventListener('click',()=>{
      const id=btn.dataset.caseId,current=JSON.parse(localStorage.getItem('ssa_case_clues')||'[]');
      if((id==='B'&&!current.includes('A'))||(id==='C'&&!current.includes('B'))){modal('열람 순서 확인','<p>앞선 기록과 날짜를 먼저 대조해야 합니다.</p>');return;}
      const docs={
        A:['초기 대응반 인사기록 · 2002.05.06','<p>백청심은 최초 출동 당시 <b>초기 국가능력안전 대응반</b> 소속으로 기재되어 있다.</p><div class="mystery-note"><strong>비고</strong>같은 날짜의 현장기록에는 별도의 관측 인원 지정 문구가 남아 있다.</div>'],
        B:['괴수 분류 변경기록 · 2004.11.06','<p>내부 분류표의 일부 문구가 수정되었다.</p><div class="mystery-note"><strong>변경 전</strong>“현장 능력 반응과 개체 반응의 상관관계 없음”</div><div class="mystery-note"><strong>변경 후</strong>“상관관계는 개별 사건자료에 따라 재검토할 수 있음”</div><p class="mystery-muted">수정 승인자는 공개 목록에서 확인되지 않는다.</p>'],
        C:['순직 작전 사후보고 · 2005.08.18','<p>공개 추모기록은 “괴수 대응 작전 중 순직”으로 정리되어 있다.</p><div class="mystery-note"><strong>보존자료와의 차이</strong>08:27 능력 반응이 기존 자료보다 높게 측정되었고, 09:41 위치 신호가 통신과 동시에 끊겼다.</div><p>그러나 사후보고에는 두 항목이 모두 누락되어 있다.</p><p class="mystery-muted">다음 단서는 다른 센티넬의 기록에서 확인할 수 있다.</p>']
      };
      if(!current.includes(id)){current.push(id);localStorage.setItem('ssa_case_clues',JSON.stringify(current));}
      modal(docs[id][0],'<div class="mystery-document">'+docs[id][1]+'<button type="button" class="case-next-button" data-case-next>연계기록으로 돌아가기</button></div>');
      document.getElementById('mysteryModal')?.querySelector('[data-case-next]')?.addEventListener('click',()=>{document.getElementById('mysteryModal')?.remove();caseBoard();});
    }));
  }
  function injectCaseEntry(){
    if(document.getElementById('ssaCaseEntry')||localStorage.getItem('ssa_17_unlocked')!=='1')return;
    const target=document.querySelector('.baek-profile-page .content-body')||document.querySelector('#memorial .container');if(!target)return;
    const box=document.createElement('section');box.id='ssaCaseEntry';box.className='case-entry-panel';
    box.innerHTML='<div><span>CASE 17 · 기록 대조</span><h3>백청심 사건에서 확인된 연계기록</h3><p>하나의 사건으로 보였던 기록은 다른 인물과 다른 연도의 자료로 이어집니다.</p></div><button type="button">연계기록 열람 →</button>';
    target.appendChild(box);box.querySelector('button').onclick=caseBoard;
  }
  window.addEventListener('hashchange',injectCaseEntry);setTimeout(injectCaseEntry,250);window.__ssaMysteryCaseBoard=caseBoard;
  window.__ssaMysteryUnlock=password;
  window.__ssaShow17=showArchiveRecord;
})();

/* ===== PUBLIC CROSS-CHECK / STORY LAYER 01 ===== */
(function(){
  const KEY='ssa_story_crosscheck';
  const get=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]}};
  const save=a=>localStorage.setItem(KEY,JSON.stringify([...new Set(a)]));
  const mark=id=>{const a=get();if(!a.includes(id)){a.push(id);save(a)}};
  const esc=s=>String(s||'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  const modal=(title,body)=>{
    document.getElementById('mysteryModal')?.remove();
    const o=document.createElement('div');o.id='mysteryModal';o.className='mystery-modal';
    o.innerHTML='<div class="mystery-dialog" role="dialog" aria-modal="true"><div class="mystery-dialog-head"><span class="mystery-classified">RECORD REVIEW</span><button type="button" class="mystery-close">×</button></div><div class="mystery-dialog-body"><h2>'+title+'</h2>'+body+'</div></div>';
    document.body.appendChild(o);o.querySelector('.mystery-close').onclick=()=>o.remove();o.addEventListener('click',e=>{if(e.target===o)o.remove()});return o;
  };
  const add=(selector,id,html)=>{
    const root=document.querySelector(selector);if(!root||document.getElementById('storyCross_'+id))return;
    const s=document.createElement('section');s.id='storyCross_'+id;s.className='ssa-story-crosscheck';
    s.innerHTML=html;root.appendChild(s);
    s.querySelector('[data-story-open]')?.addEventListener('click',()=>{mark(id);modal(s.dataset.title||'자료 대조 메모',s.querySelector('[data-story-body]').innerHTML);render()});
  };
  function render(){
    const a=get(),done=a.filter(x=>['archive','classification','memorial'].includes(x)).length;
    const next=document.getElementById('storyProgress');
    if(next)next.innerHTML='<span>자료 대조 현황</span><b>'+done+'/3</b>';
    const origin=document.getElementById('storyCross_origin');
    if(origin)origin.hidden=!(['archive','classification','memorial'].every(x=>a.includes(x)));
  }
  function run(){
    if(location.hash==='#archive2005'){
      add('#archive2005 .content-body','archive','<div class="ssa-story-cross-head"><span>자료 대조 메모 · 01</span><b>초기 기록의 날짜 순서를 확인할 것</b></div><p>공개 보존자료의 첫 문서는 <b>SSA-H-2002-01 · 2002.04</b>로 분류되어 있습니다. 백청심 현장자료에서 확인되는 최초 출동은 <b>2002.05.06</b>입니다.</p><p>두 날짜는 모두 “초기 괴수 발생”과 연결되어 있지만, 문서의 성격과 작성 시점은 같지 않습니다.</p><button type="button" data-story-open>대조 메모 확인</button><div data-story-body hidden><p><b>확인 포인트</b></p><p>2002.04 문서는 “최초 괴수 발생 관련 초기 대응기록”으로 공개되어 있고, 2002.05.06은 백청심의 “첫 출동”입니다.</p><div class="mystery-note"><strong>질문</strong>“최초”라는 표현은 무엇의 최초를 뜻하는가?</div><p class="mystery-muted">연혁의 2002.04 항목과 이 문서를 함께 확인하면 다음 대조 지점을 좁힐 수 있습니다.</p></div></section>');
      mark('archive');
    }
    if(location.hash==='#classification'){
      add('#classification .content-body','classification','<div class="ssa-story-cross-head"><span>자료 대조 메모 · 02</span><b>분류표의 동일한 구조를 확인할 것</b></div><p>괴수와 센티넬의 공개 분류에는 모두 <b>A~F</b> 능력 유형이 사용됩니다.</p><p>분류명이 같다는 사실만으로 원인이 같다고 단정할 수는 없습니다. 다만 동일한 분류 체계가 왜 양쪽에 적용되는지는 별도의 질문으로 남습니다.</p><button type="button" data-story-open>대조 메모 확인</button><div data-story-body hidden><p><b>확인 포인트</b></p><p>괴수 분류표와 센티넬 운용 자료를 나란히 놓고 능력 유형의 이름과 순서를 비교하세요.</p><div class="mystery-note"><strong>주의</strong>“같은 분류”와 “같은 현상”은 같은 문장이 아닙니다.</div><p class="mystery-muted">다음 단서는 분류가 처음 정비된 시점의 기록에서 확인할 수 있습니다.</p></div></section>');
      mark('classification');
    }
    if(location.hash==='#memorial'){
      mark('memorial');
    }
    if(location.hash==='#history'){
      add('#history .content-body','origin','<div class="ssa-story-crosscheck"><div class="ssa-story-cross-head"><span>자료 대조 메모 · 04</span><b>설립일과 최초 관측일을 분리해서 기록할 것</b></div><p><b>2002.04</b> 국가 초상능력 안전관리위원회 설립 → <b>2002.05</b> 최초 괴수 발생 관련 기록.</p><p>두 사건 사이에는 한 달의 간격이 있습니다. 공개 연혁은 이 사이에 무엇을 했는지 설명하지 않습니다.</p><div class="mystery-note"><strong>다음 확인 대상</strong> SSA-H-2002-01 · 최초 괴수 발생 관련 초기 대응기록</div><p class="mystery-muted">이 기록을 “괴수가 처음 나타난 날”이 아니라 “초기 대응이 시작된 과정”의 문서로 읽어보세요.</p></div>');
      const a=get();if(['archive','classification','memorial'].every(x=>a.includes(x)))mark('origin');
    }
    render();
  }
  window.addEventListener('hashchange',()=>setTimeout(run,180));setTimeout(run,650);
})();

/* ===== ACT 1 / PRE-2002 ARCHIVE INDEX ===== */
(function(){
 const KEY='ssa_story_crosscheck';
 const get=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]}};
 const unlocked=()=>['archive','classification','memorial'].every(x=>get().includes(x));
 const modal=(title,body)=>{document.getElementById('mysteryModal')?.remove();const o=document.createElement('div');o.id='mysteryModal';o.className='mystery-modal';o.innerHTML='<div class="mystery-dialog" role="dialog" aria-modal="true"><div class="mystery-dialog-head"><span class="mystery-classified">ARCHIVE INDEX</span><button type="button" class="mystery-close">×</button></div><div class="mystery-dialog-body"><h2>'+title+'</h2>'+body+'</div></div>';document.body.appendChild(o);o.querySelector('.mystery-close').onclick=()=>o.remove();o.addEventListener('click',e=>{if(e.target===o)o.remove()});return o};
 function run(){
  if(location.hash!=='#history'||!unlocked()||document.getElementById('ssaPre2002'))return;
  const root=document.querySelector('#history .content-body');if(!root)return;
  const s=document.createElement('section');s.id='ssaPre2002';s.className='ssa-pre2002';
  s.innerHTML='<div class="ssa-pre-head"><div><span>보존자료 색인 대조</span><h2>설립 이전 자료의 존재 여부</h2></div><b>열람제한</b></div><p>2002.04 설립 이전의 원자료 색인은 일반 공개 목록에서 제외되어 있습니다. 다만 공개된 초기 문서번호와 보존체계의 연속성을 대조하면 별도 자료군의 존재를 확인할 수 있습니다.</p><div class="ssa-index-table"><button type="button" data-pre="public"><span>SSA-H-2002-01</span><b>최초 괴수 발생 관련 초기 대응기록</b><em>공개</em></button><button type="button" data-pre="research"><span>SSA-R-2003-04</span><b>특이능력 보유자 안전관리 연구자료</b><em>부분공개</em></button><button type="button" data-pre="early"><span>SSA-O-2004-17</span><b>초기 괴수 대응 인력 운용기록</b><em>공개</em></button><button type="button" data-pre="redacted"><span>SSA-██-2002-██</span><b>설립 전 관측자료</b><em>열람제한</em></button></div><div class="ssa-pre-note"><strong>색인 비고</strong><p>2002년 이후 생성된 문서만으로는 설명되지 않는 관측자료가 일부 존재한다. 원자료 보존 규칙상 문서번호 일부는 비공개 처리됨.</p></div></section>';
  root.appendChild(s);
  s.querySelectorAll('[data-pre]').forEach(btn=>btn.onclick=()=>{
   const k=btn.dataset.pre;
   if(k==='redacted'){
    modal('설립 전 관측자료 · SSA-██-2002-██','<p class="mystery-lead">이 자료는 2002.04 위원회 설립보다 앞선 날짜를 가진 것으로 색인되어 있습니다.</p><div class="mystery-note"><strong>색인 메모</strong>“최초 괴수 발생”이라는 표현은 이 자료의 원문에 사용되지 않았습니다.</div><p>현재 공개된 자료에서 확인할 수 있는 것은 문서군의 존재와 일부 번호뿐입니다.</p><p class="mystery-muted">다음 단계에서는 <b>문서번호의 반복 숫자</b>와 초기 인물 기록을 함께 대조하십시오.</p>');
   }else modal('자료 색인 확인','<p>문서번호 '+btn.querySelector('span').textContent+'은(는) 공개 보존자료 색인에 등록되어 있습니다.</p><p class="mystery-muted">이 자료 자체보다 다른 자료와의 날짜·번호 관계를 확인하는 것이 중요합니다.</p>');
  });
 }
 window.addEventListener('hashchange',()=>setTimeout(run,180));setTimeout(run,650);
})();


/* ===== MEMORIAL ANNIVERSARY / GUESTBOOK ===== */
(function(){
 const seed=[
  ['하늘','순직 센티넬 전체','삼가 고인의 명복을 빕니다. 국민의 안전을 위해 힘써주신 모든 분들을 기억하겠습니다.','2026.09.28'],
  ['민트라떼','박재민','삼가 고인의 명복을 빕니다. 편히 쉬시길 바랍니다.','2026.09.28'],
  ['seoul_02','순직 센티넬 전체','잊지 않겠습니다. 감사합니다.','2026.09.29'],
  ['구름','김서현','삼가 고인의 명복을 빕니다.','2026.09.29'],
  ['안전제일','한지우','국민들을 대피시키고 마지막까지 현장에 계셨던 분께 감사드립니다. 삼가 고인의 명복을 빕니다.','2026.09.30'],
  ['ㅇㅇ','이도현','삼가 고인의 명복을 빕니다.','2026.09.30'],
  ['푸른별','순직 센티넬 전체','우리가 평범하게 하루를 보낼 수 있었던 건 누군가의 희생이 있었기 때문이라고 생각합니다. 기억하겠습니다.','2026.10.01'],
  ['기억할게요','박재민','3주기입니다. 잊지 않겠습니다. 삼가 고인의 명복을 빕니다.','2026.10.01'],
  ['anonymous','순직 센티넬 전체','삼가 고인의 명복을 빕니다.','2026.10.02'],
  ['의문','이도현','정말 전부 순직한 게 맞습니까? 기록에 적힌 내용만으로는 납득하기 어렵습니다.','2026.10.02'],
  ['기록을찾는사람','순직 센티넬 전체','왜 사망 경위는 제대로 공개하지 않는 건가요? 단순히 작전 중 순직했다고만 적혀 있는데, 실제로는 다른 일이 있었던 것 아닙니까?','2026.10.02'],
  ['진실을말해줘','백청심','순직이라고 발표했지만 혹시 누군가에게 살해된 것은 아닌지 의문입니다. 당시 작전 기록을 전부 공개해 주세요.','2026.10.03'],
  ['ㅇㅅㅇ','순직 센티넬 전체','삼가 고인의 명복을 빕니다.','2026.10.03'],
  ['현장기억','김서현','당시 현장에 있었던 분들의 기록도 언젠가는 제대로 공개되기를 바랍니다. 삼가 고인의 명복을 빕니다.','2026.10.04'],
  ['익명','백청심','정부에서는 순직이라고 하는데, 왜 정확한 사망 원인은 공개하지 않는 건가요? 사고였다는 설명도 이상합니다.','2026.10.04']
 ];
 const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 function guestbookHtml(){
  return '<section id="memorialGuestbook" class="memorial-guestbook"><div class="section-head"><div><h2>추모의 글</h2></div><small>MEMORIAL GUESTBOOK</small></div><div class="guestbook-list">'+seed.slice().reverse().map(x=>'<article class="guestbook-entry"><div class="guestbook-entry-meta"><b>'+esc(x[0])+'</b><time>'+x[3]+'</time></div><div class="guestbook-entry-target">추모 대상 · '+esc(x[1])+'</div><p>'+esc(x[2])+'</p></article>').join('')+'</div></section>';
 }
 function addGuestbook(){
  if(location.hash!=='#memorial'||document.getElementById('memorialGuestbook'))return;
  const root=document.querySelector('#memorial .content-body')||document.querySelector('#memorial .memorial-page')||document.querySelector('#memorial .pg-wrap');
  if(!root)return;
  root.insertAdjacentHTML('beforeend',guestbookHtml());
 }
 function homePopup(){ /* Anniversary popup intentionally disabled. */ }
 function run(){addGuestbook();homePopup();}
 window.addEventListener('hashchange',()=>setTimeout(run,120));
 setTimeout(run,700);
})();

/* ===== PROGRESSIVE HINTS / LOGO DOUBLE TAP ===== */
(function(){
 const HINTS=[
  {title:'첫 번째 힌트',text:'추모공간에서 특정 센티넬의 이름을 자세히 살펴보세요. 다른 사람들과 달리 눌러볼 수 있는 기록이 있습니다.',target:'추모공간'},
  {title:'두 번째 힌트',text:'백청심의 기록을 열었다면 날짜를 눈여겨보세요. 기록에 적힌 날짜는 다음 자료를 열어볼 때 중요한 단서가 됩니다.',target:'백청심 현장자료'},
  {title:'세 번째 힌트',text:'현장자료를 읽을 때 모든 날짜를 같은 무게로 보지 마세요. 특히 능력 반응과 위치·통신 기록이 함께 나타나는 시각을 비교해 보세요.',target:'2005.08.17 작전기록'},
  {title:'네 번째 힌트',text:'하나의 기록만 보고 결론을 내리지 마세요. 2002년 초기 기록, 괴수 분류, 순직 센티넬의 추모 기록을 서로 비교하면 표현의 변화가 보입니다.',target:'자료 대조'},
  {title:'다섯 번째 힌트',text:'2002.04에 설립된 위원회와 2002.05의 최초 괴수 기록 사이를 확인하세요. “최초”라는 표현이 정말 최초를 뜻하는지 생각해 보세요.',target:'청 연혁'},
  {title:'여섯 번째 힌트',text:'설립 이전 자료의 색인을 찾았다면 문서번호를 보세요. 특히 여러 자료에서 반복되는 숫자와 초기 인물 기록을 함께 대조해 보세요.',target:'보존자료 색인'}
 ];
 function progress(){
  try{
   const c=JSON.parse(localStorage.getItem('ssa_case_clues')||'[]');
   const s=JSON.parse(localStorage.getItem('ssa_story_crosscheck')||'[]');
   if(s.includes('origin')) return 5;
   if(s.includes('archive')&&s.includes('classification')&&s.includes('memorial')) return 4;
   if(c.length>=3) return 3;
   if(c.length>=1) return 2;
   if(localStorage.getItem('ssa_17_unlocked')==='1') return 1;
  }catch(e){}
  return 0;
 }
 function open(){
  document.getElementById('ssaHintModal')?.remove();
  const page=progress(),hint=HINTS[Math.min(page,HINTS.length-1)];
  const o=document.createElement('div');o.id='ssaHintModal';o.className='mystery-modal ssa-hint-modal';
  o.innerHTML='<div class="mystery-dialog ssa-hint-dialog" role="dialog" aria-modal="true"><div class="mystery-dialog-head"><span class="mystery-classified">SSA · 열람 지원</span><button type="button" class="mystery-close" aria-label="닫기">×</button></div><div class="ssa-hint-body"><div class="ssa-hint-label">HINT '+String(page+1).padStart(2,'0')+' / '+String(HINTS.length).padStart(2,'0')+'</div><h2>'+hint.title+'</h2><p>'+hint.text+'</p><div class="ssa-hint-target">확인 대상 · <b>'+hint.target+'</b></div><div class="ssa-hint-pages"><button type="button" data-prev>‹</button><span>1 / 1</span><button type="button" data-next>›</button></div></div></div>';
  document.body.appendChild(o);
  const close=()=>o.remove();o.querySelector('.mystery-close').onclick=close;o.addEventListener('click',e=>{if(e.target===o)close()});
 }
 function bind(){
  const logo=document.querySelector('.emblem');if(!logo||logo.dataset.hintBound)return;
  logo.dataset.hintBound='1';
  let lastTap=0;
  logo.addEventListener('click',e=>{
   const now=Date.now();
   if(now-lastTap>=250&&now-lastTap<=600){e.preventDefault();open();lastTap=0;return;}
   lastTap=now;
  });
 }
 setTimeout(bind,500);
 window.addEventListener('hashchange',()=>setTimeout(bind,150));
})();
