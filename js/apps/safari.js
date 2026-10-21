/* ===== safari.js (integrated) ===== */
/* ===== 사파리 앱 ===== */
const SafariApp = (() => {
  const $ = q => document.querySelector(q), el = $("#saf-app"), screen = $("#screen");
  const ic = (p, w = 1.5) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const I = {
    back: ic('<path d="M15 5l-7 7 7 7"/>', 2), fwd: ic('<path d="M9 5l7 7-7 7"/>', 2), plus: ic('<path d="M12 4v16M4 12h16"/>', 1.8), x: ic('<path d="M6 6l12 12M18 6L6 18"/>', 2),
    share: ic('<path d="M12 15V3.500M8 7l4-4 4 4"/><path d="M7.500 10h-1a2 2 0 0 0-2 2v6.500a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V12a2 2 0 0 0-2-2h-1"/>'),
    book: ic('<path d="M12 6.500C10 5 7 4.500 3.500 5v13c3.500-.5 6.500 0 8.500 1.500 2-1.500 5-2 8.500-1.500V5C17 4.500 14 5 12 6.500zM12 6.500v13"/>'),
    tabs: ic('<rect x="7" y="3.500" width="13.500" height="13.500" rx="2.500"/><path d="M4 7.500v10a3 3 0 0 0 3 3h10"/>'), reload: ic('<path d="M19.500 12a7.500 7.500 0 1 1-2.400-5.500"/><path d="M19 4v4.500h-4.500"/>'),
    lock: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 10V7.500a5 5 0 0 1 10 0V10h1.500a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zm2 0h6V7.500a3 3 0 0 0-6 0z"/></svg>',
    search: ic('<circle cx="10.500" cy="10.500" r="6.500"/><path d="M15.500 15.500l5 5"/>', 1.8), clock: ic('<circle cx="12" cy="12" r="9"/><path d="M12 7v5.500l3.500 2"/>'), globe: ic('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>'),
  };
  const uid = () => Math.random().toString(36).slice(2, 9), esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const KEY = "ios-safari-v1", newTab = () => ({ id: uid(), hist: [], idx: -1, title: "", p: (typeof S !== "undefined" && S && S.pm) ? 1 : 0 });
  const DEF = [["네이버", "https://www.naver.com/"], ["디시인사이드", "https://dcinside.com/"]];
  let S = null; try { S = window.HwahoStability ? window.HwahoStability.readJSON(KEY, null) : JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
  if (!S || !S.tabs || !S.tabs.length) { const t = newTab(); S = { tabs: [t], cur: t.id, bm: DEF.map(([title, url]) => ({ id: uid(), title, url })), rl: [], hist: [], searches: [] }; }
  const allowedFavorites = [
    { title: "네이버", url: "https://www.naver.com/" },
    { title: "디시인사이드", url: "https://www.dcinside.com/" },
  ];
  S.bm = allowedFavorites.map(item => {
    const existing = (S.bm || []).find(b =>
      /naver\.com/.test(item.url) ? /naver\.com/.test(b.url || "") :
      /dcinside\.com/.test(b.url || "")
    );
    return { id: existing?.id || uid(), ...item };
  });
  const save = () => { try { if (window.HwahoStability) window.HwahoStability.writeJSON(KEY, S); else localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const RT = {}, rt = t => RT[t.id] || (RT[t.id] = { req: 0, loading: false, ctl: null, err: null, note: "", scroll: 0 });
  const cache = new Map(), tab = () => S.tabs.find(t => t.id === S.cur) || S.tabs[0], cu = t => (t.hist[t.idx] || {}).url || "";
  const host = u => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return u; } };
  const disp = u => { try { const x = new URL(u), p = x.pathname.replace(/\/$/, ""); return x.hostname.replace(/^www\./, "") + p; } catch (e) { return u; } };
  const hue = h => { let n = 0; for (const c of h) n = (n * 31 + c.charCodeAt(0)) % 360; return `hsl(${n} 45% 50%)`; };

  /* ---- URL 판별 ---- */
  function looksUrl(q) { q = q.trim(); if (!q || /\s/.test(q)) return null; if (/^https?:\/\/\S+$/i.test(q)) return q; if (/^[^\s\/:?#]+\.[a-z]{2,}([:\/?#]\S*)?$/i.test(q)) return "https://" + q; return null; }
  const toUrl = q => looksUrl(q) || `https://www.google.com/search?q=${encodeURIComponent(q.trim())}&hl=ko`;
  const isSearch = u => { try { const x = new URL(u); return /(^|\.)google\.com$/.test(x.hostname) && x.pathname === "/search" && x.searchParams.get("q"); } catch (e) { return null; } };

  /* ---- 마크다운 → HTML (모든 텍스트 이스케이프, http(s)만 허용) ---- */
  function md(src, base) {
    const res = u => { try { let x = new URL(u, base); if (/duckduckgo\.com$/.test(x.hostname) && x.pathname === "/l/" && x.searchParams.get("uddg")) x = new URL(x.searchParams.get("uddg")); return /^https?:$/.test(x.protocol) ? x.href : null; } catch (e) { return null; } };
    const inl = t => {
      const tk = [], put = h => "\u0001" + (tk.push(h) - 1) + "\u0001";
      t = t.replace(/!\[([^\]]*)\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g, (m, a, u) => { const r = res(u); return r ? put(`<img src="${esc(r)}" alt="${esc(a)}" loading="lazy" referrerpolicy="no-referrer">`) : ""; });
      t = t.replace(/\[([^\]]*)\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g, (m, a, u) => { const r = res(u); return r ? put(`<a href="#" data-go="${esc(r)}">`) + (a || esc(r)) + put("</a>") : a; });
      return t.split(/\u0001(\d+)\u0001/).map((x, i) => i % 2 ? tk[+x] : esc(x).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/`([^`]+)`/g, "<code>$1</code>")).join("");
    };
    const L = String(src).slice(0, 250000).split("\n"); let h = "", para = [], list = null, code = null, tb = [];
    const fp = () => { if (para.length) { h += `<p>${inl(para.join(" "))}</p>`; para = []; } };
    const fl = () => { if (list) { h += `</${list}>`; list = null; } };
    const ft = () => { if (tb.length) { const rows = tb.filter(r => !/^\|?[\s:|-]+\|?$/.test(r)).map(r => r.replace(/^\||\|$/g, "").split("|")); h += `<div class="tw"><table>${rows.map(r => `<tr>${r.map(c => `<td>${inl(c.trim())}</td>`).join("")}</tr>`).join("")}</table></div>`; tb = []; } };
    for (const raw of L) {
      const ln = raw.replace(/\s+$/, "");
      if (code !== null) { if (/^```/.test(ln.trim())) { h += `<pre><code>${esc(code.join("\n"))}</code></pre>`; code = null; } else code.push(ln); continue; }
      if (/^```/.test(ln.trim())) { fp(); fl(); ft(); code = []; continue; }
      if (/^\s*\|/.test(ln)) { fp(); fl(); tb.push(ln.trim()); continue; } else ft();
      let m;
      if (!ln.trim()) { fp(); fl(); continue; }
      if ((m = /^(#{1,6})\s+(.*)$/.exec(ln))) { fp(); fl(); h += `<h${m[1].length}>${inl(m[2])}</h${m[1].length}>`; continue; }
      if (/^\s*([-*_]\s*){3,}$/.test(ln)) { fp(); fl(); h += "<hr>"; continue; }
      if ((m = /^\s*([-*+]|\d+\.)\s+(.*)$/.exec(ln))) { fp(); const k = /\d/.test(m[1]) ? "ol" : "ul"; if (list !== k) { fl(); list = k; h += `<${k}>`; } h += `<li>${inl(m[2])}</li>`; continue; }
      if ((m = /^>\s?(.*)$/.exec(ln))) { fp(); fl(); h += `<blockquote>${inl(m[1])}</blockquote>`; continue; }
      fl(); para.push(ln.trim());
    }
    if (code) h += `<pre><code>${esc(code.join("\n"))}</code></pre>`; fp(); fl(); ft(); return h;
  }

  /* ---- 사이트 페이지 ---- */
  const vq = x => encodeURIComponent(x), vl = (u, h) => `<a href="#" data-go="${esc(u)}">${h}</a>`;
  const NAME = { d: "Atspatch", g: "Google", n: "NAVER", y: "YouTube", w: "위키백과", a: "Apple", h: "GitHub", k: "Hacker News" };
  { const dcb = { id: uid(), title: "디시인사이드", url: "https://dcinside.com/" }; if (!S.bm.some(b => /dcinside\.com/.test(b.url))) { S.bm.splice(Math.min(S.bm.length, 6), 0, dcb); } }
  const HOME = { d: "https://www.dispatch.co.kr/", g: "https://www.google.com/", n: "https://www.naver.com/", y: "https://www.youtube.com/", w: "https://ko.wikipedia.org/", a: "https://www.apple.com/kr/", h: "https://github.com/", k: "https://news.ycombinator.com/" };
  const vform = (site, ph, val = "") => `<div class="vs"><input data-vs="${site}" placeholder="${ph}" value="${esc(val)}" autocomplete="off" autocapitalize="off"><button data-s="vs" data-site="${site}">검색</button></div>`;
  const vtop = K => `<div class="v-top ${K}">${vl(HOME[K], esc(NAME[K]))}</div>`;
  const vsub = { g: q => `https://www.google.com/search?q=${vq(q)}&hl=ko`, n: q => `https://search.naver.com/search.naver?query=${vq(q)}`, y: q => `https://www.youtube.com/results?search_query=${vq(q)}`, w: q => `https://ko.wikipedia.org/wiki/${vq(q)}`, h: q => `https://github.com/search?q=${vq(q)}` };
  function vsubmit(site, q) { q = (q || "").trim(); if (q && vsub[site]) go(vsub[site](q)); }
  const lorem = t => `<p>${esc(t)}에 대한 안내 페이지입니다.</p><p>관련 항목과 최신 소식을 한곳에서 확인할 수 있도록 구성한 예시 본문입니다. 주소창에 다른 주소나 검색어를 입력해 이동해 보세요.</p><p>페이지 상단의 로고를 누르면 해당 사이트의 첫 화면으로 돌아갑니다.</p>`;
  const results = (q, K) => {
    const it = [[`${q} - 위키백과`, `https://ko.wikipedia.org/wiki/${vq(q)}`, "ko.wikipedia.org"], [`${q} : 네이버 검색`, `https://search.naver.com/search.naver?query=${vq(q)}`, "search.naver.com"], [`${q} - YouTube`, `https://www.youtube.com/results?search_query=${vq(q)}`, "youtube.com"], [`${q} 관련 뉴스`, `https://news.naver.com/article/1?t=${vq(q + " 관련 뉴스")}`, "news.naver.com"], [`${q} · GitHub`, `https://github.com/search?q=${vq(q)}`, "github.com"], [`${q} - Apple 지원`, `https://www.apple.com/kr/support?t=${vq(q + " - Apple 지원")}`, "apple.com"]];
    return vtop(K) + vform(K, "검색", q) + it.map(r => `<div class="v-res"><small>${r[2]}</small>${vl(r[1], `<b>${esc(r[0])}</b>`)}<p>${esc(q)}에 대한 검색 결과입니다. 관련 정보와 최신 소식을 확인해 보세요.</p></div>`).join("") + `<div class="v-sec">관련 검색</div><div class="v-chips">${[" 뜻", " 후기", " 추천", " 뉴스"].map(x => vl(vsub.g(q + x), esc(q + x))).join("")}</div>`;
  };
  const vids = (q, n) => Array.from({ length: n }, (_, i) => { const t = (q ? q + " " : "") + ["브이로그", "하이라이트", "리뷰", "플레이리스트", "튜토리얼", "다큐멘터리"][i % 6]; return vl(`https://www.youtube.com/watch?v=${i + 1}&t=${vq(t)}`, `<div class="v-vid"><div class="v-th" style="background:linear-gradient(${40 + i * 50}deg,hsl(${i * 57} 55% 55%),hsl(${i * 57 + 40} 60% 30%))"></div><b>${esc(t)}</b><small>채널 ${i + 1} · 조회수 ${(i + 2) * 3}만회</small></div>`); }).join("");
  /* ===== 네이버 (사파리 가상 페이지) : 메인 + 검색어 입력 화면 ===== */
  // 최근 검색어 데이터 — 한곳에서 관리. id는 고유값, custom은 사용자가 나중에 직접 지정할 항목 표시용(아직 미사용).
  const NV = {
    recent: [
      { id: "rs00", q: "정윤호", d: "10.12.", custom: false, go: true },
      { id: "rs0", q: "마스", d: "10.12.", custom: false, go: true },
      { id: "rs2", q: "네이버", d: "10.05.", custom: false },
      { id: "rs3", q: "신림 맛집", d: "10.03.", custom: false },
      { id: "rs4", q: "충칭 항공권", d: "09.28.", custom: false },
      { id: "rs5", q: "알바몬", d: "09.21.", custom: false }
    ],
    rec: ["텐퍼센트커피 창업", "혈당 관리 팁", "에이티즈 콘서트 일정", "니지가사키 팬아트"],
    shorts: [["김용지 결혼 소식, 김고은 축하", "엔터 종합", 25], ["100일의 거짓말 김유정 구조 신호, 감우성 …", "드라마", 350], ["김연경2 백채림·인쿠시·한송희 재트라이 …", "배구", 210], ["찰리 푸스 내한 공연 나연 게스트", "뮤직", 300], ["아이브 컴백 무대 첫 공개", "뮤직", 330], ["손흥민 시즌 3호골 폭발", "스포츠", 140]],
    sOff: 0, on: true
  };
  const nvI = {
    menu: '<svg viewBox="0 0 24 24"><path d="M3 6.500h18M3 12h18M3 17.500h18" stroke="#222" stroke-width="1.700" stroke-linecap="round" fill="none"/></svg>',
    pay: '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="21.500" fill="none" stroke="#222" stroke-width="2.600"/><text x="24" y="29" text-anchor="middle" font-size="15" font-weight="800" fill="#222" font-family="Arial,sans-serif">pay</text></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="1.700" stroke-linecap="round" stroke-linejoin="round"><path d="M6 17.500V11a6 6 0 0 1 12 0v6.500l1.500 1.500h-15zM10 21h4"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="1.700" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="9.500" r="3.300"/><path d="M5.800 18.500c1.500-3 4-4 6.200-4s4.700 1 6.200 4"/></svg>',
    N: '<svg viewBox="0 0 24 24"><path d="M3 3h6.200l5.800 9V3h6v18h-6.200L9 12v9H3z" fill="#03c75a"/></svg>',
    cam: '<svg viewBox="0 0 28 28" fill="none" stroke="#2cc7b4" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10V8a4 4 0 0 1 4-4h2M18 4h2a4 4 0 0 1 4 4v2M24 18v2a4 4 0 0 1-4 4h-2M10 24H8a4 4 0 0 1-4-4v-2"/><circle cx="14" cy="14" r="4.200" fill="#2cc7b4" stroke="none"/></svg>',
    ai: '<svg viewBox="0 0 32 32"><defs><linearGradient id="nvg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2d8bff"/><stop offset="1" stop-color="#39d0c8"/></linearGradient></defs><rect x="4" y="9" width="24" height="14" rx="7" transform="rotate(-40 16 16)" fill="url(#nvg)"/><rect x="4" y="9" width="24" height="14" rx="7" transform="rotate(40 16 16)" fill="url(#nvg)" opacity=".85"/></svg>',
    mail: '<svg viewBox="0 0 32 32"><path d="M4 13l12-8 12 8v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" fill="#1fc86a"/><path d="M7 12l9 6 9-6v14H7z" fill="#fff"/><path d="M5 14l11 8 11-8v12a1.500 1.500 0 0 1-1.500 1.500h-19A1.500 1.500 0 0 1 5 26z" fill="#13b95c"/><text x="16" y="17" text-anchor="middle" font-size="8" font-weight="900" fill="#13b95c">N</text></svg>',
    cafe: '<svg viewBox="0 0 32 32"><path d="M5 12h19v7a8 8 0 0 1-8 8h-3a8 8 0 0 1-8-8z" fill="#38c75a"/><path d="M24 14h2a3 3 0 0 1 0 6h-2.500" fill="none" stroke="#38c75a" stroke-width="2.600"/><path d="M12 9c0-3 3-4 5-7 1 4 4 4 1 8-2 2-6 1-6-1z" fill="#7ed957"/></svg>',
    shop: '<svg viewBox="0 0 32 32"><rect x="4" y="4" width="24" height="25" rx="6" fill="#6b3ff0"/><path d="M11 11V9.500a5 5 0 0 1 10 0V11" fill="none" stroke="#fff" stroke-width="2.200"/><text x="16" y="23.500" text-anchor="middle" font-size="9" font-weight="900" fill="#fff" font-family="Arial,sans-serif">N+</text></svg>',
    moon: '<svg viewBox="0 0 32 32"><defs><linearGradient id="nvm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fb2ff"/><stop offset="1" stop-color="#3b6fe0"/></linearGradient></defs><path d="M22 4a13 13 0 1 0 6 22A12 12 0 0 1 22 4z" fill="url(#nvm)"/><circle cx="6" cy="6" r="1.300" fill="#ffd54a"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="1.700" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12H4M10 6l-6 6 6 6"/></svg>',
    mag: '<svg viewBox="0 0 24 24" fill="none" stroke="#1ec997" stroke-width="2.400" stroke-linecap="round"><circle cx="10.500" cy="10.500" r="7"/><path d="M16 16l5 5"/></svg>',
    magg: '<svg viewBox="0 0 24 24" fill="none" stroke="#8a8f98" stroke-width="2.200" stroke-linecap="round"><circle cx="10.500" cy="10.500" r="6.500"/><path d="M15.500 15.500L20 20"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="#8a8f98" stroke-width="1.600" stroke-linecap="round"><circle cx="12" cy="12" r="8.500"/><path d="M12 7.500V12l3 2"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="#8a8f98" stroke-width="1.500" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="#a3a8b0" stroke-width="1.500"><circle cx="12" cy="12" r="9.500"/><path d="M12 11v6" stroke-linecap="round"/><circle cx="12" cy="7.500" r=".8" fill="#a3a8b0" stroke="none"/></svg>',
    help: '<svg viewBox="0 0 24 24" fill="none" stroke="#2d7cf6" stroke-width="1.700" stroke-linecap="round"><circle cx="12" cy="12" r="9.500"/><path d="M9.500 9.500a2.500 2.500 0 1 1 3.500 2.300c-.7.400-1 .9-1 1.700"/><circle cx="12" cy="16.800" r=".8" fill="#2d7cf6" stroke="none"/></svg>',
    ref: '<svg viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="1.700" stroke-linecap="round" stroke-linejoin="round"><path d="M19.500 12a7.500 7.500 0 1 1-2.300-5.400M19.500 4v4.500H15"/></svg>'
  };
  const nvCard = (bg, ico, t, hue) => `<div class="nv-cd" style="background:${bg}"><div class="nv-cg"></div><div class="nv-ct"><i style="background:hsl(${hue} 55% 55%)">${ico}</i><b>${t}</b></div></div>`;
  const nvTop = () => `<div class="nv-tpl">${NVN.map(a => `<div class="nv-tp" data-nv="nws" data-id="${a.id}"><small>${a.outlet} · ${a.ago}</small><b>${esc(a.title)}</b></div>`).join("")}</div>`;
  function nvMain() {
    return `<div class="nv"><div class="nv-main">
<div class="nv-bar"><div class="nv-l"><span class="nv-ic">${nvI.menu}</span><span class="nv-ic pay">${nvI.pay}</span></div><div class="nv-r"><span class="nv-ic bell">${nvI.bell}<em>48</em></span><span class="nv-ic">${nvI.user}</span></div></div>
<div class="nv-sw"><button class="nv-sb" data-nv="open" aria-label="검색">${nvI.N}<span class="nv-sp"></span><span class="nv-cm">${nvI.cam}</span><i class="nv-dv"></i><span class="nv-ai">${nvI.ai}</span></button></div>

<div class="nv-sv"><span>${nvI.mail}메일</span><span>${nvI.cafe}카페</span><span>${nvI.shop}쇼핑</span><u></u><span class="t">뉴스</span><span class="t">엔터</span><span class="t">지식</span><span class="t">쇼핑라이브</span><span class="t">웹툰</span><span class="t">블로그</span><span class="t">지도</span></div>
<div class="nv-wx"><span class="w">${nvI.moon}<b>18°</b><b>서울</b></span><i></i><span class="s">나스닥 종합 <b>27,366.17</b> <em>▲0.64%</em></span></div>
<div aria-hidden="true" style="height:300px"></div>
</div><div class="nv-sr"></div></div>`;
  }
  const nvRecent = () => NV.recent.length ? NV.recent.map(r => `<div class="nv-rr" data-nv="rc" data-id="${r.id}"><span class="c">${nvI.clock}</span><b>${esc(r.q)}</b><small>${r.d}</small><button class="x" data-nv="rx" data-id="${r.id}" aria-label="삭제">${nvI.x}</button></div>`).join("") : `<div class="nv-em">최근 검색어가 없습니다.</div>`;
  const nvShorts = () => { const n = NV.shorts.length, l = [0, 1, 2, 3].map(i => NV.shorts[(NV.sOff + i) % n]); return l.map(([t, c, h], i) => `<div class="nv-sh${i === 3 ? " last" : ""}" data-nv="pick" data-q="${esc(t)}"><i style="background:linear-gradient(135deg,hsl(${h} 60% 70%),hsl(${h + 40} 50% 40%))"></i><b>${esc(t)}</b><small>${c}</small></div>`).join("").replace(/(<div class="nv-sh last"[\s\S]*?<\/div>)$/, `<div class="nv-lr">$1<button class="nv-rf" data-nv="rf" aria-label="새로고침">${nvI.ref}</button></div>`); };
  function nvSearch() {
    return `<div class="nv-in"><button data-nv="back" aria-label="뒤로">${nvI.back}</button><input type="text" placeholder="검색어를 입력해 주세요." enterkeyhint="search" autocomplete="off" autocapitalize="off" spellcheck="false"><button data-nv="clr" class="g" aria-label="검색">${nvI.mag}</button></div>
<div class="nv-h"><b>최근 검색어</b><button data-nv="rall">전체삭제</button></div><div class="nv-rl">${nvRecent()}</div>`;
  }
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-nv]"), root = e.target.closest(".nv"); if (!t || !root) return;
    const sr = root.querySelector(".nv-sr"), inp = () => sr.querySelector("input"), top = () => { const v = root.closest("#sf-view"); if (v) v.scrollTop = 0; };
    switch (t.dataset.nv) {
      case "open": sr.innerHTML = nvSearch(); root.classList.add("srch"); top(); inp().focus({ preventScroll: true }); break;
      case "back": root.classList.remove("srch"); top(); break;
      case "rx": e.stopPropagation(); NV.recent = NV.recent.filter(r => r.id !== t.dataset.id); sr.querySelector(".nv-rl").innerHTML = nvRecent(); break;
      case "rall": NV.recent = []; sr.querySelector(".nv-rl").innerHTML = nvRecent(); break;
      case "rc": { const r = NV.recent.find(x => x.id === t.dataset.id); if (r && r.go) { go("https://search.naver.com/search.naver?query=" + encodeURIComponent(r.q)); break; } if (r) { inp().value = r.q; inp().focus({ preventScroll: true }); } break; }
      case "pick": inp().value = t.dataset.q; inp().focus({ preventScroll: true }); break;
      case "clr": inp().value = ""; inp().focus({ preventScroll: true }); break;
      case "rf": NV.sOff = (NV.sOff + 4) % NV.shorts.length; sr.querySelector(".nv-sl").innerHTML = nvShorts(); break;
      case "rclr": go("https://www.naver.com/"); break;
      case "tg": NV.on = !NV.on; t.classList.toggle("on", NV.on); t.setAttribute("aria-checked", NV.on); break;
    }
  });
  document.addEventListener("keydown", e => { if (e.key === "Enter" && !e.isComposing && e.target.closest && e.target.closest(".nv-in") && e.target.value.trim()) { e.preventDefault(); go("https://search.naver.com/search.naver?query=" + encodeURIComponent(e.target.value.trim())); } });
  const nvPlay = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="rgba(255,255,255,.88)"/><path d="M9.500 7.500v9l7-4.500z" fill="#777"/></svg>';
  const nvVid = (t, h, sm) => `<div class="rs-v${sm ? " sm" : ""}" style="background:linear-gradient(160deg,hsl(${h} 25% 22%),#0b0b0d)"><span class="pl">${nvPlay}</span><small>클립</small><b>${t}</b></div>`;
  function nvPerson(q) {
    const row = (k, v) => `<div class="rs-r"><span>${k}</span><div>${v}</div></div>`, lk = a => a.map(x => `<a>${x}</a>`).join(", ");
    const seonghwa = /박성화|마스|mars/i.test(q);
    const displayName = seonghwa ? "마스" : "정윤호";
    const profile = seonghwa ? {
      image: "images/app/Naver/Seonghwa/1969d38e20fc29da97dda95cfb8fd503.jpg",
      rows: `${row("출생", "1998.04.03")}${row("소속사", "오프비트 레코드")}${row("데뷔", "2018.02.12 EP 앨범 [SKIN]")}${row("사이트", lk(["인스타그램", "X(트위터)", "유튜브"]))}${row("활동", lk(["방송", "공연", "곡", "앨범"]))}`
    } : {
      image: "images/app/Naver/Yunho/d9ac4246460057e1170dbb1f7c0ffabd.jpg",
      rows: `${row("출생", "1999.03.23")}${row("신체", "186cm")}${row("소속사", lk(["노바웨이브엔터테인먼트"]))}${row("학력", lk(["서울공연예술고등학교"]))}${row("수상", "2025년 아시아 아티스트 어워즈 AAA 뉴웨이브")}${row("사이트", lk(["공식홈페이지", "인스타그램", "팬카페"]))}${row("활동", lk(["방송", "영화", "드라마"]))}`
    };
    return `<div class="nv rs"><div class="rs-sb"><svg class="n" viewBox="0 0 24 24"><path d="M3 3h6.200l5.800 9V3h6v18h-6.200L9 12v9H3z" fill="#03c75a"/></svg><b>${displayName}</b><button data-nv="rclr" class="cl" aria-label="지우기"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#8e9096"/><path d="M8 8l8 8M16 8l-8 8" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg></button><svg class="mic" viewBox="0 0 24 24" fill="none" stroke="#1ec997" stroke-width="2" stroke-linecap="round"><rect x="8.500" y="2.500" width="7" height="12" rx="3.500"/><path d="M5 11.500a7 7 0 0 0 14 0M12 18.500V22"/></svg></div>
<div class="rs-tb"><span class="ai">AI<i>N</i></span><span>이미지</span><span>뉴스</span><span>클립</span><span>블로그</span><span>카페</span><span>지식iN</span><span>동영상</span><span>쇼핑</span></div>
<div class="rs-bd"><div class="rs-hd"><div class="t"><b>${displayName}</b><i>⋮</i></div><small>${seonghwa ? "박성화, 마스 · 래퍼" : "정윤호 · 배우"}</small><div class="rs-cp"><span class="on">전체</span><span>프로필</span><span>수상</span><span>최근영상</span><span>필모그래피</span><span>활동</span></div></div>
<div class="rs-tbl"><div class="rs-ph"><img src="${profile.image}" alt="${esc(q)} 프로필 사진"></div>${profile.rows || ""}</div></div>${nvNews(seonghwa ? NVN[2] : (nvFinal() ? NVN[4] : NVN[3]), NVN[1], NVN[0])} </div>`;
  }
  (() => { const s = document.createElement("style"); s.textContent = `
.nv.rs,.nv.en{zoom:.85}
  .sf-pg.v:has(.nv.rs),.sf-pg.v:has(.nv.en){font-family:Pretendard,-apple-system,"Apple SD Gothic Neo",sans-serif}
.en-ti .dt{display:flex;justify-content:flex-start;text-align:left;margin-left:0;margin-bottom:10px!important;width:100%;align-self:flex-start}.en-ti .dt span{display:block;text-align:left;margin-left:0}.en-ti .rx .ic{margin-left:auto}
.sf-pg.v:has(.nv.rs){background:#fff;padding-bottom:0}.nv.rs{color:#111}
.rs-sb{position:sticky;top:0;z-index:5;display:flex;align-items:center;margin:0 12px;padding:14px 0 0;height:62px;box-sizing:content-box}.rs-sb:before{content:"";position:absolute;inset:0 -12px;background:#fff;z-index:-2}.rs-sb:after{content:"";position:absolute;left:0;right:0;top:14px;height:62px;border-radius:31px;background:#f1f2f4;z-index:-1}
.rs-sb .n{width:26px;height:26px;margin:0 12px 0 20px;flex:none}.rs-sb b{flex:1;font-size:20px;font-weight:700;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.rs-sb .cl{width:26px;height:26px;margin-right:14px;flex:none}.rs-sb .mic{width:30px;height:30px;margin-right:18px;flex:none}
.rs-tb{display:flex;gap:22px;overflow-x:auto;padding:22px 16px 14px;white-space:nowrap;font-size:17px;color:#8b8f97;font-weight:500;scrollbar-width:none;border-bottom:8px solid #f1f2f4;position:relative}.rs-tb::-webkit-scrollbar{display:none}.rs-tb .ai{position:relative;font-weight:800;color:#8b8f97}.rs-tb .ai i{position:absolute;top:-8px;right:-14px;width:16px;height:16px;border-radius:50%;background:#ee4a2f;color:#fff;font:700 9px/16px sans-serif;text-align:center}
.rs-bd{background:linear-gradient(#f7faf9,#fff 180px)}.rs-hd{position:relative;top:auto;z-index:auto;background:linear-gradient(#f7faf9,#f7faf9);padding:18px 16px 0}.rs-hd .t{display:flex;justify-content:space-between;align-items:center}.rs-hd .t b{font-size:19px;font-weight:700}.rs-hd .t i{font-style:normal;color:#9aa;font-weight:900}.rs-hd small{display:block;margin-top:3px;font-size:15px;color:#4a9cb8}
.rs-cp{display:flex;gap:10px;overflow-x:auto;padding:14px 0;scrollbar-width:none}.rs-cp::-webkit-scrollbar{display:none}.rs-cp span{flex:none;height:42px;line-height:40px;padding:0 20px;border-radius:21px;border:1px solid #e6ebec;background:#fff;font-size:17px;color:#2b5d6a;box-sizing:border-box}.rs-cp .on{background:#5b9ba5;border-color:#5b9ba5;color:#fff;font-weight:600}

.rs-tbl{position:relative;margin:22px 16px 0;padding:2px 0 0 18px;border-left:4px solid #e3ecee;min-height:0;margin-bottom:24px}.rs-ph{float:right;width:88px;height:110px;margin:0 0 6px 10px;border-radius:12px;background:linear-gradient(160deg,#dff1ff,#a9c6ff);position:relative;overflow:hidden}.rs-ph img{display:block;width:100%;height:100%;object-fit:cover}.rs-ph:has(img):before,.rs-ph:has(img):after{display:none}.rs-ph:after{content:"";position:absolute;left:50%;bottom:-8px;width:62px;height:62px;margin-left:-31px;border-radius:50% 50% 12px 12px;background:#fff;opacity:.9}.rs-ph:before{content:"";position:absolute;left:50%;top:22px;width:30px;height:34px;margin-left:-15px;border-radius:50%;background:#2a2f45}
.rs-r{display:flex;gap:16px;padding:2px 0;font-size:17px;line-height:1.4}.rs-r>span{flex:none;width:68px;color:#8b8f97}.rs-r>div{flex:1;min-width:0}.rs-r a{color:#1763d8}
.rs-ft{margin:22px 16px 0;padding:22px 0 26px;border-top:1px solid #e9ecee;font-size:15.5px;line-height:1.7;color:#8b8f97}.rs-ft u{color:#8b8f97}
.rs-rv{border-top:8px solid #f1f2f4;padding:30px 16px 40px}.rs-rv .h{display:flex;justify-content:space-between;align-items:center}.rs-rv .h b{font-size:22px;font-weight:700}.rs-rv .h svg{width:26px;height:26px}.rs-rv .l{display:flex;gap:12px;overflow-x:auto;margin:18px -16px 0;padding:0 16px;scrollbar-width:none}.rs-rv .l::-webkit-scrollbar{display:none}.rs-v.sm{flex:none;width:calc(50% - 18px);aspect-ratio:3/4;border-radius:22px;padding:10px 12px}.rs-v.sm small{display:none}.rs-v.sm b{font-size:12.5px}.rs-v.sm .pl{width:48px;height:48px;margin:-24px 0 0 -24px}`; document.head.appendChild(s); })();
  (() => { const s = document.createElement("style"); s.textContent = `
.sf-pg.v:has(.nv){background:#eff2f7;min-height:100%;padding-bottom:24px}.sf-pg.v:has(.nv.srch){background:#fff}
.nv{font-family:Pretendard,-apple-system,"Apple SD Gothic Neo",sans-serif;color:#111;line-height:1.3;-webkit-user-select:none;user-select:none}.nv svg{display:block;width:100%;height:100%}.nv button{font:inherit;color:inherit;border:0;background:none;padding:0;cursor:pointer}
.nv .nv-sr{display:none;background:#fff;min-height:calc(100vh - 150px);padding-bottom:40px}.nv.srch .nv-sr{display:block}.nv.srch .nv-main{display:none}
.nv-bar{display:flex;justify-content:space-between;align-items:center;padding:14px 20px 0}.nv-l,.nv-r{display:flex;align-items:center;gap:18px}.nv-ic{width:28px;height:28px;position:relative;display:block}.nv-ic.pay{width:30px;height:30px}.nv-ic.bell{width:30px;height:30px}.nv-ic em{position:absolute;top:-8px;right:-12px;min-width:22px;height:22px;padding:0 5px;box-sizing:border-box;border-radius:11px;background:#ee4a2f;color:#fff;font:700 11.5px/22px -apple-system,sans-serif;text-align:center}
.nv-sw{position:relative;margin:50px 20px 0}.nv-tip{position:absolute;right:0;top:-34px;padding:6px 12px;border-radius:15px;background:#fff;border:1.5px solid #d6e9ff;color:#2a8ae8;font-weight:700;font-size:15px}.nv-tip:after{content:"";position:absolute;right:42px;bottom:-6px;width:10px;height:10px;background:#fff;border-right:1.5px solid #d6e9ff;border-bottom:1.5px solid #d6e9ff;transform:rotate(45deg)}
.nv-sb{width:100%;height:60px;border-radius:30px!important;background:#fff!important;box-shadow:0 6px 20px rgba(60,80,120,.10);display:flex;align-items:center;padding:0 22px 0 26px!important}.nv-sb>svg{width:26px;height:26px}.nv-sp{flex:1}.nv-cm{width:28px;height:28px}.nv-dv{width:1px;height:24px;background:#e1e4ea;margin:0 16px}.nv-ai{width:30px;height:30px}
.nv-bn{position:relative;overflow:hidden;margin:40px 20px 0;height:170px;border-radius:24px;background:linear-gradient(135deg,#fff6e0,#ffe3d6 60%,#ffd0c8);padding:26px 24px}.nv-bn small{font-weight:800;letter-spacing:1.5px;font-size:11px;color:#ff7a45}.nv-bn b{display:block;margin-top:8px;font-size:22px;line-height:1.3;letter-spacing:-.5px}.nv-bn p{margin-top:10px;font-size:13.5px;color:#7a6a63}.nv-bs{position:absolute;border-radius:50%}.nv-bs.a{right:-30px;top:-30px;width:130px;height:130px;background:rgba(255,160,120,.35)}.nv-bs.b{right:40px;bottom:-50px;width:110px;height:110px;background:rgba(255,205,120,.45)}
.nv-sv{display:flex;align-items:center;gap:22px;overflow-x:auto;margin:18px 10px 0;padding:0 26px;height:50px;border-radius:25px;background:#fff;white-space:nowrap;scrollbar-width:none}.nv-sv::-webkit-scrollbar{display:none}.nv-sv span{flex:none;display:flex;align-items:center;gap:6px;font-size:17px;font-weight:600}.nv-sv span svg{width:24px;height:24px}.nv-sv span.t{font-weight:500;color:#333}.nv-sv u{flex:none;width:1px;height:20px;background:#e1e4ea}
.nv-wx{display:flex;align-items:center;margin:14px 10px 0;padding:0 16px;height:58px;border-radius:20px;background:#fff;font-size:14px;white-space:nowrap}.nv-wx .w{flex:none;display:flex;align-items:center;gap:6px}.nv-wx .w svg{width:26px;height:26px}.nv-wx b{font-size:15.5px;font-weight:700}.nv-wx i{flex:none;width:1px;height:20px;background:#e1e4ea;margin:0 12px}.nv-wx .s{white-space:nowrap}.nv-wx .s b{margin-left:2px}.nv-wx em{font-style:normal;color:#e5412d;font-size:13px}
.nv-cs{display:flex;gap:10px;overflow-x:auto;margin:14px 0 0;padding:0 10px;scrollbar-width:none}.nv-cs::-webkit-scrollbar{display:none}.nv-cd{position:relative;flex:none;width:calc(50% - 15px);aspect-ratio:1/1.02;border-radius:24px;overflow:hidden}.nv-cg{position:absolute;inset:auto 0 0;height:55%;background:linear-gradient(transparent,rgba(0,0,0,.6))}.nv-ct{position:absolute;left:12px;right:12px;bottom:12px;display:flex;align-items:center;gap:8px;color:#fff}.nv-ct i{flex:none;width:34px;height:34px;border-radius:50%;border:2px solid #fff;box-sizing:border-box}.nv-ct b{font-size:17px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.nv-in{display:flex;align-items:center;margin:14px 12px 0;height:62px;border-radius:31px;background:#f1f2f4;padding:0 20px 0 22px}.nv-in button{width:30px;height:30px;flex:none}.nv-in input{flex:1;min-width:0;border:0;background:none;outline:0;font:inherit;font-size:19px;margin:0 14px 0 28px;color:#111;-webkit-user-select:text;user-select:text}.nv-in input::placeholder{color:#8b8f97}
.nv-h,.nv-h2{display:flex;justify-content:space-between;align-items:center;padding:0 16px}.nv-h{margin-top:32px}.nv-h b,.nv-h2 b{font-size:19px;font-weight:700}.nv-h button{font-size:17px;color:#8b8f97}.nv-h2{justify-content:flex-start;gap:6px;margin-top:34px}.nv-h2 .i{width:22px;height:22px}.nv-h2.sp{margin-top:38px}
.nv-rl{margin-top:8px;padding:0 16px}.nv-rr{display:flex;align-items:center;height:60px}.nv-rr .c{flex:none;width:38px;height:38px;border-radius:50%;background:#f1f2f4;padding:7px;box-sizing:border-box}.nv-rr b{flex:1;min-width:0;margin-left:14px;font-size:19px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.nv-rr small{font-size:17px;color:#8b8f97;margin-right:14px}.nv-rr .x{width:24px;height:24px;flex:none;padding:0}.nv-em{padding:22px 0;color:#9a9ea6;font-size:16px}
.nv-ch{display:flex;flex-wrap:wrap;gap:8px;padding:16px 16px 0}.nv-ch button{display:flex;align-items:center;gap:8px;height:44px;padding:0 14px 0 12px;border-radius:22px;background:#f4f5f7;font-size:16px;white-space:nowrap}.nv-ch button svg{width:20px;height:20px}
.nv-sl{padding:16px 16px 0;display:flex;flex-direction:column;gap:10px}.nv-sh,.nv-lr .nv-sh{display:flex;align-items:center;height:44px;padding:0 20px 0 6px;border-radius:22px;background:#f4f5f7;max-width:100%;box-sizing:border-box;min-width:0}.nv-sh i{flex:none;width:32px;height:32px;border-radius:50%}.nv-sh b{min-width:0;margin-left:8px;font-size:17.5px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.nv-sh small{flex:none;margin-left:6px;font-size:15px;color:#8b8f97}.nv-sh{align-self:flex-start}
.nv-lr{display:flex;gap:10px;align-items:center;min-width:0}.nv-lr .nv-sh{flex:0 1 auto}.nv-rf{flex:none;width:44px;height:44px;border-radius:50%!important;background:#f4f5f7!important;padding:12px!important}
.nv-st{display:flex;justify-content:space-between;align-items:center;margin-top:46px;padding:0 16px;height:62px;border-top:1px solid #eceef1;border-bottom:1px solid #eceef1;color:#8b8f97;font-size:18px}.nv-st span{display:flex;align-items:center;gap:8px}.nv-st i{display:block;width:22px;height:22px}
.nv-tg{position:relative;width:52px;height:32px;border-radius:16px!important;background:#c9ccd2!important;transition:background .2s}.nv-tg.on{background:#3cb868!important}.nv-tg i{position:absolute;top:3px;left:3px;width:26px;height:26px;border-radius:50%;background:#fff;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.25)}.nv-tg.on i{transform:translateX(20px)}`; document.head.appendChild(s); })();
  /* ===== Atspatch 스타일 뉴스 페이지 (사파리 가상 페이지, 가상의 예시 기사) ===== */
  S.bm = (S.bm || []).filter(b => !/dispatch\.co\.kr/.test(b.url || "")); save();
  const dpTitle = "[단독] \"누가 봐도 평범한 사이는 아니었다\"…마스♥정윤호, 심야 데이트 포착", dpUrl = "https://www.dispatch.co.kr/article/1";
  const dpPhoto = (a, b, cap) => `<div class="dp-ph" style="background:linear-gradient(170deg,${a},${b})"><i class="s1"></i><i class="s2"></i><i class="o1"></i><i class="o2"></i><em>${cap || ""}</em></div>`;
  const dpHead = () => `<div class="dp-hd"><span class="lg">Atspatch</span><span class="ph"><svg viewBox="0 0 24 24"><rect x="7" y="3" width="10" height="18" rx="2.500" fill="#f5b942" stroke="#243b53" stroke-width="1.500"/><path d="M10 7h4" stroke="#243b53" stroke-width="1.500" stroke-linecap="round"/></svg></span><svg class="sr" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round"><circle cx="10.500" cy="10.500" r="7"/><path d="M16 16l5 5"/></svg></div>
<div class="dp-nv"><span class="on">EXCLUSIVE</span><span>FEATURE</span><span>NEWS</span><span>PHOTOS</span><span>VIDEO</span><span>SPORTS</span></div>`;
  const dpMain = () => `<div class="nv dp">${dpHead()}<a class="dp-top" data-nv="dpa"><b>${dpTitle}</b><small>${nvTodayTs("2026.09.03.").slice(0, -1)} 오후 02:22</small><div class="dp-ph dp-article-photo" style="background-image:url('./images/app/Dispatch/정윤호_마스_열애설/collage%202.png');background-size:contain;background-position:center;background-repeat:no-repeat;background-color:#fff"></div><p>[Atspatch= 코 기자] 마스와 정윤호가 사랑에 빠졌다.</p><p>두 사람은 약 3개월 전부터 교제 중이다. 바쁜 스케줄 속에서도 틈틈이 만나 데이트를 즐기며 관계를 이어오고 있다.</p><p>두 사람의 데이트는 주로 늦은 밤에 이뤄졌다. 함께 식사를 하거나 카페를 찾는 등 평범한 연인들의 데이트와 다르지 않았다.</p><p>최근에는 서울 모처에서 함께 있는 모습이 포착됐다. 마스와 정윤호는 주변의 시선을 크게 의식하지 않는 모습이었다. 자연스럽게 대화를 나누며 함께 시간을 보냈다.</p><p>두 사람을 잘 아는 측근은 “서로에 대한 신뢰가 깊다”며 “조심스럽게 만남을 이어가고 있는 것으로 안다”고 전했다.</p><p>마스와 정윤호는 연예계에서도 서로 다른 분야에서 활동하고 있다. 각자의 활동을 이어가는 가운데 가까운 사이로 발전했다.</p><p>한편 양측 소속사는 열애설에 대해 확인 중이다.</p></a><div class="dp-ft">※ 가상의 예시 기사입니다. 실존 인물·단체와 무관합니다.</div></div>`;
  const dpArt = () => `<div class="nv dp art">${dpHead()}<div class="dp-article-head"><h1>${dpTitle}</h1><div class="dp-date">2026.10.18 오후 2:22</div><img class="dp-article-photo" src="./images/app/Dispatch/정윤호_마스_열애설/collage%202.png" alt="정윤호와 마스 관련 기사 사진"></div><div class="dp-b"><p>[Atspatch= 코 기자] 마스와 정윤호가 사랑에 빠졌다.</p><p>두 사람은 약 3개월 전부터 교제 중이다. 바쁜 스케줄 속에서도 틈틈이 만나 데이트를 즐기며 관계를 이어오고 있다.</p><p>두 사람의 데이트는 주로 늦은 밤에 이뤄졌다. 함께 식사를 하거나 카페를 찾는 등 평범한 연인들의 데이트와 다르지 않았다.</p><p>최근에는 서울 모처에서 함께 있는 모습이 포착됐다. 마스와 정윤호는 주변의 시선을 크게 의식하지 않는 모습이었다. 자연스럽게 대화를 나누며 함께 시간을 보냈다.</p><p>두 사람을 잘 아는 측근은 “서로에 대한 신뢰가 깊다”며 “조심스럽게 만남을 이어가고 있는 것으로 안다”고 전했다.</p><p>마스와 정윤호는 연예계에서도 서로 다른 분야에서 활동하고 있다. 각자의 활동을 이어가는 가운데 가까운 사이로 발전했다.</p><p>한편 양측 소속사는 열애설에 대해 확인 중이다.</p></div></div>`;
  document.addEventListener("click", e => { const t = e.target.closest(".nv.dp [data-nv]"); if (!t) return; if (t.dataset.nv === "dpa") go(dpUrl); });
  (() => { const s = document.createElement("style"); s.textContent = `
.sf-pg.v:has(.nv.dp){background:#fff;padding-bottom:0}.nv.dp{-webkit-user-select:auto;user-select:auto;padding-bottom:120px;overflow:hidden}.nv.dp.art{padding-bottom:0;overflow:visible}
.dp-hd{display:flex;align-items:center;margin:14px 16px 0;padding-bottom:8px;border-bottom:2px solid #ddd;height:56px}.dp-hd .lg{font:italic 900 34px/1 "Helvetica Neue",Arial,sans-serif;letter-spacing:-2px;color:#1f5fcf}.dp-hd .ph{width:34px;height:34px;border-radius:50%;background:#9fd3ea;margin-left:14px;display:grid;place-items:center}.dp-hd .ph svg{width:20px;height:20px}.dp-hd .sr{width:28px;height:28px;margin:18px 0 0 auto}
.dp-nv{display:flex;gap:30px;overflow-x:auto;margin:0 16px;padding:14px 0;border-bottom:2px solid #ddd;white-space:nowrap;font-size:17px;font-weight:800;color:#111;scrollbar-width:none}.dp-nv::-webkit-scrollbar{display:none}.dp-nv span{flex:none}.dp-nv .on{color:#f0a030}
.dp-top{display:block;margin:30px 16px 0;color:#111}.dp-top b{display:block;font-size:26px;line-height:1.35;font-weight:800;letter-spacing:-.6px}.dp-top small{display:block;margin:18px 0 14px;font-size:14.5px;color:#9a9a9a}.dp-top p{margin-top:14px;font-size:17px;line-height:1.6}
.dp-ph{position:relative;width:100%;aspect-ratio:1.5/1;overflow:hidden;background:#222}.dp-ph i{position:absolute;display:block}.dp-ph .s1,.dp-ph .s2{bottom:0;width:16%;height:58%;border-radius:40% 40% 0 0;background:rgba(10,12,16,.75)}.dp-ph .s1{left:33%}.dp-ph .s2{left:52%;height:52%}.dp-ph .o1,.dp-ph .o2{width:22%;aspect-ratio:1;border-radius:50%;border:3px dashed;background:rgba(255,255,255,.12)}.dp-ph .o1{left:12%;bottom:12%;border-color:#3b8cff}.dp-ph .o2{right:12%;bottom:14%;border-color:#e060c0}.dp-ph em{position:absolute;left:0;right:0;bottom:10px;text-align:center;font:italic 900 26px "Helvetica Neue",Arial,sans-serif;color:rgba(255,255,255,.9);letter-spacing:-1px;font-style:italic}.dp-ph em:empty:after{content:"SAMPLE"}
.dp-ft{margin:26px 16px 0;font-size:13px;color:#9a9a9a}
.dp-article-head{margin:28px 6.5% 0}.dp-article-head h1{margin:0;font-size:27px;line-height:1.3;font-weight:850;letter-spacing:-.7px;color:#222}.dp-date{margin:20px 0 16px;font-size:14px;line-height:1.5;color:#aaa}.dp-article-photo{display:block;width:100%;height:auto;aspect-ratio:auto;object-fit:contain;background:#fff}.nn-i .th{overflow:hidden;background:#fff;display:flex;align-items:center;justify-content:center;aspect-ratio:1/1;width:120px;height:120px;flex:0 0 120px;border-radius:12px}.nn-i .th img{display:block;width:100%;height:100%;aspect-ratio:1/1;object-fit:cover;object-position:center;border-radius:12px}.dp-b{padding:24px 6.5% 40px;font-size:19px;line-height:1.75;color:#111}.dp-b p{margin:0 0 26px}
`; document.head.appendChild(s); })();
  /* "열애 인정" 기사(id 6)는 이야기 최종 단계(final-article)에서만 노출 */
  const nvFinal = () => true;
  const nvVis = x => true;
  /* ===== 정윤호 프로필 하단 뉴스 + 엔터 기사 상세 (가상의 예시 기사) ===== */
  const NVN = [
    { id: "1", outlet: "Atspatch", ago: "오늘", ts: "2026.10.18. 오후 2:22", hue: 215, image: "./images/app/Dispatch/정윤호_마스_열애설/collage%202.png", title: "[단독] \"누가 봐도 평범한 사이는 아니었다\"…마스♥정윤호, 심야 데이트 포착", sum: "마스와 정윤호가 약 3개월 전부터 교제 중인 것으로 전해졌다. 두 사람은 늦은 밤 식사와 카페 데이트를 즐기며 조심스럽게 만남을 이어오고 있다.", react: "312",
      body: ["[Atspatch= 코 기자] 마스와 정윤호가 사랑에 빠졌다.", "두 사람은 약 3개월 전부터 교제 중이다. 바쁜 스케줄 속에서도 틈틈이 만나 데이트를 즐기며 관계를 이어오고 있다.", "두 사람의 데이트는 주로 늦은 밤에 이뤄졌다. 함께 식사를 하거나 카페를 찾는 등 평범한 연인들의 데이트와 다르지 않았다.", "최근에는 서울 모처에서 함께 있는 모습이 포착됐다. 마스와 정윤호는 주변의 시선을 크게 의식하지 않는 모습이었다. 자연스럽게 대화를 나누며 함께 시간을 보냈다.", "두 사람을 잘 아는 측근은 “서로에 대한 신뢰가 깊다”며 “조심스럽게 만남을 이어가고 있는 것으로 안다”고 전했다.", "마스와 정윤호는 연예계에서도 서로 다른 분야에서 활동하고 있다. 각자의 활동을 이어가는 가운데 가까운 사이로 발전했다.", "한편 양측 소속사는 열애설에 대해 확인 중이다."] },
    { id: "3", outlet: "덩간스포츠", ago: "오늘", ts: "2026.10.19. 오후 2:45", hue: 8, image: "./images/app/Naver/정윤호_마스_열애설/collage%203.png", title: "[단독] 마스 측 “정윤호와 열애 중” 공식 인정…‘친한 동료’에서 연인으로", sum: "배우 정윤호와 래퍼 마스가 오랜 동료에서 연인으로 발전했다는 소식이 전해졌다. 양측은 두 사람의 관계를 인정하며 관심이 이어지고 있다.", react: "30",
      body: [
        "래퍼 마스와 배우 정윤호가 열애를 공식 인정했다.",
        "2일 연예계 관계자에 따르면 정윤호와 마스는 최근 연인 관계로 발전해 만남을 이어오고 있다. 두 사람은 오랜 시간 친한 동료로 지내며 서로를 향한 신뢰를 쌓아왔으며, 자연스럽게 연인 사이로 발전한 것으로 알려졌다.",
        "마스의 소속사 측은 이날 열애설과 관련해 “두 사람은 서로 좋은 감정을 가지고 만나고 있다”며 열애 사실을 인정했다. 이어 “배우의 사생활인 만큼 따뜻한 시선으로 지켜봐 주시길 부탁드린다”고 전했다.",
        "마스는 최근 Mnet 힙합 서바이벌 프로그램 ‘쇼미더머니’에서 최종 우승을 차지하며 대중의 주목을 받았다. 음악 활동을 통해 자신만의 색깔을 보여준 그는 우승 이후에도 활발한 활동을 이어가며 화제를 모으고 있다.",
        "정윤호 역시 다양한 작품을 통해 꾸준히 필모그래피를 쌓아온 배우다. 두 사람은 각자의 분야에서 활동을 이어오던 중 가까워졌으며, 연예계 동료로서 인연을 맺은 뒤 연인으로 발전한 것으로 전해졌다."
      ] },
    { id: "4", outlet: "Atzen", nothumb: 1, ago: "6주 전", ts: "2026.10.19. 오후 2:50", hue: 40, title: "정윤호 측, 마스 열애설에 선 긋기…“사실무근, 열애 관계 아니다”", sum: "정윤호 측이 래퍼 마스와의 열애설을 부인했다. 소속사는 두 사람이 연인 관계가 아니며 관련 보도는 사실과 다르다고 밝혔다.", react: "420",
      body: ["정윤호 측이 래퍼 마스와의 열애설에 대해 “사실무근”이라는 입장을 밝혔다.", "정윤호 소속사 측은 “마스와의 열애설은 사실이 아니다”라며 관련 보도 및 주장에 대해 선을 그었다. 이어 “배우 본인에게 확인한 결과 열애설의 내용을 전혀 알지 못하고 있으며, 사실과 다른 내용에 당황스러워하고 있다”고 전했다.", "갑작스럽게 불거진 열애설에 대해 정윤호 측은 사실이 아니라는 입장을 재차 강조했다.", "김코 기자 koooo@atzen.com"] },
    { id: "5", outlet: "Atzen", nothumb: 1, ago: "6주 전", ts: "2026.10.19. 오후 2:50", hue: 40, title: "정윤호 측, 마스 열애설에 선 긋기…“사실무근, 열애 관계 아니다”", sum: "정윤호 측이 래퍼 마스와의 열애설에 대해 사실무근이라는 입장을 밝혔다.", react: "420",
      body: ["정윤호 측이 래퍼 마스와의 열애설에 대해 “사실무근”이라는 입장을 밝혔다.", "정윤호 소속사 측은 “마스와의 열애설은 사실이 아니다”라며 관련 보도 및 주장에 대해 선을 그었다. 이어 “배우 본인에게 확인한 결과 열애설의 내용을 전혀 알지 못하고 있으며, 사실과 다른 내용에 당황스러워하고 있다”고 전했다.", "갑작스럽게 불거진 열애설에 대해 정윤호 측은 사실이 아니라는 입장을 재차 강조했다.", "김코 기자 koooo@atzen.com"] },
    { id: "6", outlet: "Atzen", image: "./images/app/Naver/열애인정기사/c60efed217f8ecb4fb2eacee890fba0f.jpg", ago: "오늘", ts: "2026.10.19. 오후 4:45", hue: 40, title: "정윤호 측, 마스와 열애 인정…“서로 좋은 감정으로 만나고 있다”", sum: "사실무근 입장을 냈던 정윤호 측이 입장을 정정했다. 양측은 두 사람이 좋은 감정으로 만나고 있다고 밝혔다.", react: "1,284", body: ["정윤호 측이 래퍼 마스와의 열애 사실을 인정했다.", "앞서 열애설에 대해 “사실무근”이라며 선을 그었던 정윤호 측은 입장을 정정하고 두 사람이 서로 좋은 감정을 가지고 만나고 있다고 밝혔다.", "정윤호 측 관계자는 “확인 과정에서 전달에 착오가 있었다”며 “두 사람은 좋은 감정으로 만나고 있다. 따뜻한 시선으로 지켜봐 주시길 부탁드린다”고 전했다.", "마스 측 역시 두 사람의 관계를 부인하지 않았다. 갑작스러운 입장 변화에 관심이 쏠리고 있다.", "김코 기자 koooo@atzen.com"] }
  ];
  function nvTodayTs(ts) { const d = new Date(2026, 9, 19); const pad = n => String(n).padStart(2, "0"); const today = `${d.getFullYear()}.${pad(d.getMonth()+1)}.${pad(d.getDate())}.`; return ts.replace(/^\d{4}\.\d{2}\.\d{2}\./, today); }
  const nvPress = a => `<span class="pi" style="background:hsl(${a.hue} 40% 92%);color:hsl(${a.hue} 55% 40%)">${a.outlet[0]}</span>`;
  function nvRap(q, job = "래퍼", g = "힙합", x0 = NVN[2]) {
    const row = (k, v) => `<div class="rs-r"><span>${k}</span><div>${v}</div></div>`;
    const tbl = `<div class="rs-tbl"><div class="rs-ph"></div>${row("직업", job)}${g ? row("장르", g) : ""}${row("활동", "<a>공연</a>, <a>방송</a>, <a>음반</a>")}</div>\n<div class="rs-ft">`;
    return nvPerson(q).replace("가수 · ATEEZ", job).replace(/<div class="rs-tbl">[\s\S]*?<\/div>\n<div class="rs-ft">/, tbl).replace(nvNews(), nvNews(x0, NVN[1])).split("정윤호").join(q);
  }
  function nvNews(x0 = NVN[0], x1 = NVN[1], x2 = null) {
    const it = a => `<div class="nn-i" data-nv="nws" data-id="${a.id}"><div class="m">${nvPress(a)}<b>${a.outlet}</b>${a.pick ? '<em>PiCK</em>' : ""}<span>· 오늘 · 네이버뉴스</span></div><div class="r"><div class="t"><h4>${esc(a.title)}</h4>${a.body?.length ? `<p>${esc(a.body.slice(0, 2).join(" "))}</p>` : a.sum ? `<p>${esc(a.sum)}</p>` : ""}</div>${a.nothumb ? "" : `<div class="th" style="${a.image ? "background:#fff" : `background:linear-gradient(150deg,hsl(${a.hue} 35% 62%),hsl(${a.hue + 30} 35% 30%))`}">${a.image ? `<img src="${a.image}" alt="" loading="lazy">` : ""}</div>`}</div></div>`;
    return `<div class="nn"><div class="nn-h"><b>뉴스</b><span class="on">• 관련도순</span><span>• 최신순</span><span class="mm">모바일 메인 언론사</span><i class="tg"></i></div>${it(x0)}${it(x1)}${x2 ? it(x2) : ""}<button class="nn-mr">뉴스 더보기 →</button></div>`;
  }
  const ensv = { sp: '<svg viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.600" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.500h3l4-3.500v12l-4-3.500H4zM15 9a4 4 0 0 1 0 6M17.500 6.500a7.500 7.500 0 0 1 0 11"/></svg>', sh: '<svg viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.600" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4l6 5-6 5V11c-5 0-8 2-9 6 .5-6 4-9 9-9z"/><path d="M5 12v7h12"/></svg>', bub: '<svg viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="1.800"><path d="M12 3.500c-5 0-9 3.300-9 7.500 0 2.300 1.200 4.300 3.100 5.700L5 20.500l4-2.200c.9.200 1.900.4 3 .4 5 0 9-3.300 9-7.500S17 3.500 12 3.500z"/><circle cx="8.500" cy="11.200" r=".5" fill="#111"/><circle cx="12" cy="11.200" r=".5" fill="#111"/><circle cx="15.500" cy="11.200" r=".5" fill="#111"/></svg>' };
  function nvEnt(id) {
    const a = NVN.find(x => x.id === id && nvVis(x)) || NVN[0], rel = NVN.filter(x => x !== a && nvVis(x));
    return `<div class="nv en"><div class="en-hd"><i class="lg"><svg viewBox="0 0 24 24"><path d="M5 4h5l4 6.200V4h5v16h-5l-4-6.200V20H5z" fill="#fff"/></svg></i><b>엔터</b></div>
<div class="en-cat"><span class="on">홈</span><span>드라마</span><span>영화</span><span>뮤직</span><span>연애</span><span>포토</span><span>랭킹</span><span>최신뉴스</span></div>
<div class="en-ti"><div class="pr">${esc(a.outlet)}</div><h1>${esc(a.title)}</h1><div class="dt" style="display:block!important;justify-content:initial!important;text-align:left!important;align-items:initial!important;margin:8px 0 0!important;padding:0!important;width:100%;"><span style="display:block!important;width:100%!important;margin:0!important;padding:0!important;text-align:left!important;float:none!important;transform:none!important;">입력 ${nvTodayTs(a.ts)}</span></div></div>
${a.nothumb ? "" : a.id === "6" && a.image ? `<div class="en-img en-img-full"><img src="${a.image}" alt="정윤호와 마스의 열애 인정 기사 사진" loading="lazy"></div>` : `<div class="en-img" style="${a.image ? `background-image:url(${a.image});background-size:cover;background-position:center` : a.blank ? `background:#eceef2` : `background:linear-gradient(150deg,hsl(${a.hue} 30% 70%),hsl(${a.hue + 30} 30% 28%))`}">${a.image || a.blank ? "" : "<em>SAMPLE</em>"}</div>`}
<div class="en-bd">${a.body.map(p => `<p>${p}</p>`).join("")}</div>
${a.id === "3" || a.id === "6" ? "" : nvCmt((a.id === "4" || a.id === "5") ? NVY : NVC, a.id)}<div class="en-sp${a.id === "3" || a.id === "6" ? " nocm" : ""}"></div></div>`;
  }
  document.addEventListener("click", e => {
    const t = e.target.closest(".nv [data-nv=nws]"); if (!t) return;
    go(t.dataset.id === "1" ? dpUrl : "https://entertain.naver.com/article/sample/" + t.dataset.id);
  });
  (() => { const s = document.createElement("style"); s.textContent = `
.nn{border-top:8px solid #f1f2f4;padding:0 16px 28px}.nn-h{display:flex;align-items:center;gap:14px;height:76px;font-size:19px;color:#999;white-space:nowrap}.nn-h b{font-size:22px;color:#111;margin-right:auto}.nn-h span{font-size:18px;font-weight:500;color:#9a9a9a}.nn-h .on{color:#111;font-weight:800}.nn-h .mm{font-size:17px}.nn-h .tg{flex:none;position:relative;width:44px;height:28px;border-radius:14px;background:#ccc}.nn-h .tg:after{content:"";position:absolute;top:2px;left:2px;width:24px;height:24px;border-radius:50%;background:#fff}
.nn-i{padding:12px 0;border-top:1px solid #e9ecee;cursor:pointer}.nn-i .m{display:flex;align-items:center;gap:8px;font-size:15px;color:#999}.nn-i .m b{font-size:19px;font-weight:600;color:#111}.nn-i .m em{font-style:normal;font-weight:800;color:#aaa}.nn-i .m span:not(.pi){white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pi{flex:none;display:grid;place-items:center;width:34px;height:34px;border-radius:50%;font:800 14px sans-serif}
.nn-i .r{display:flex;align-items:flex-end;gap:14px;margin-top:8px}.nn-i .t{flex:1;min-width:0}.nn-i h4{margin:0;font-size:21px;line-height:1.35;font-weight:500;color:#0a58d0;letter-spacing:-.4px}.nn-i p{margin:6px 0 0;font-size:17px;line-height:1.48;color:#444;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.nn-i .th{flex:none;width:120px;height:120px;border-radius:12px}
.nn-all{display:block;text-align:right;padding:18px 0 22px;border-top:1px solid #e9ecee;font-size:18px;color:#0a58d0}.nn-pk{display:flex;gap:16px;align-items:center;padding:20px 0;border-top:1px solid #e9ecee;font-size:16px;line-height:1.5;color:#444}.nn-pk b{flex:none;color:#999;font-size:20px}.nn-mr{display:block;width:100%;height:56px;margin-top:6px;border:1px solid #dcdfe3;border-radius:14px;background:#fff;font-size:19px;color:#444}
.sf-pg.v:has(.nv.en){background:#fff;padding-bottom:0}.nv.en{-webkit-user-select:auto;user-select:auto;color:#111}
.en-hd{display:flex;align-items:center;gap:10px;padding:16px 16px 14px}.en-hd .lg{width:36px;height:36px;border-radius:3px;background:#e84fa5;padding:7px;box-sizing:border-box}.en-hd b{font-size:24px;font-weight:800;padding-right:12px;border-right:0}.en-hd .s{font-size:19px;color:#999;padding-right:12px;border-right:1px solid #ddd}.en-hd .s:last-of-type{border:0}.en-hd .bb{margin-left:auto;width:28px;height:28px}
.en-cat{position:static;top:auto;z-index:auto;display:flex;gap:26px;overflow-x:auto;padding:0 16px;height:56px;align-items:center;background:#fff;border-bottom:1px solid #e3e5e8;font-size:20px;white-space:nowrap;scrollbar-width:none}.en-cat::-webkit-scrollbar{display:none}.en-cat span{flex:none;position:relative;line-height:56px}.en-cat .on{color:#e84fa5;font-weight:600}.en-cat .on:after{content:"";position:absolute;left:0;right:0;bottom:0;height:3px;background:#e84fa5}
.en-ti{padding:22px 16px 0}.en-ti .pr{font:900 24px/1 "Helvetica Neue",Arial,sans-serif;color:#f08a24;letter-spacing:-1px}.en-ti h1{margin:18px 0 0;font-size:26px;line-height:1.38;font-weight:800;letter-spacing:-.6px}.en-ti .dt{display:flex;align-items:center;justify-content:flex-start;text-align:left;gap:10px;margin:14px 0 0;padding:0;width:100%;font-size:15.5px;color:#999}.en-ti .dt span{display:block;margin:0;text-align:left}.en-ti .dt u{text-decoration:none;padding:5px 14px;border:1px solid #cfd2d6;border-radius:18px;color:#666}
.en-ti .rx{display:flex;justify-content:space-between;align-items:center;margin-top:20px;padding-bottom:20px}.en-ti .pill{display:inline-flex;align-items:center;gap:6px;height:42px;padding:0 16px;border:1px solid #d6d8db;border-radius:21px;font-size:17px}.en-ti .ic{display:flex;gap:22px;align-items:center}.en-ti .ic i{width:26px;height:26px;font-style:normal}.en-ti .ic .fs{font-size:20px;color:#555;width:auto}
.en-img{position:relative;aspect-ratio:1.35/1;border-top:8px solid #fff}.en-img-full{height:auto;aspect-ratio:auto;border-top:8px solid #fff;background:#fff;overflow:hidden}.en-img-full img{display:block;width:100%;height:auto;object-fit:contain}.en-img em{position:absolute;right:14px;bottom:12px;font:italic 900 22px "Helvetica Neue",Arial,sans-serif;color:rgba(255,255,255,.85)}
.en-bd{padding:20px 4% 10px}.en-bd p{font-size:21px;line-height:1.7;margin-bottom:26px;letter-spacing:-.3px}.en-bd a{color:#0a58d0}
.en-rp{margin:20px 4% 0;border:1px solid #e3e5e8;border-radius:16px;overflow:hidden}.en-rp .hd{display:flex;align-items:center;gap:14px;padding:16px;background:#fbe9f4}.en-rp .av{flex:none;width:44px;height:44px;border-radius:50%;background:linear-gradient(150deg,#c8a58a,#6b4a3a)}.en-rp .hd b{display:block;font-size:19px}.en-rp small{font-size:15px;color:#888}.en-rp button{margin-left:auto;height:42px;padding:0 18px;border:1.5px solid #e84fa5;border-radius:21px;background:none;color:#e84fa5;font-size:17px}.en-rp .li{margin:0 16px;padding:22px 0;border-bottom:1px solid #e9ecee;font-size:19px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.en-rp .ft{display:flex;align-items:center;gap:10px;border:0;white-space:normal}.en-rp .ft b{color:#e84fa5;font-weight:600;margin-right:-6px}.en-rp .ft .pi{width:34px;height:34px}.en-sp{height:20px;border-top:1px solid #e5e5e5;margin-top:28px}
.en-upw{position:sticky;bottom:0;height:0;z-index:6}.en-upw button{position:absolute;right:12px;bottom:110px;width:58px;height:58px;border-radius:50%;background:#fff;border:1px solid #d6d8db;display:grid;place-items:center;padding:0;box-shadow:0 2px 8px rgba(0,0,0,.12)}.en-upw svg{width:28px;height:28px}`; document.head.appendChild(s); })();
  /* ===== 네이버 뉴스 기사 하단 댓글 (예시) ===== */
  const NVC = [];
  const cmI = {
    av: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#d9dbdf"/><circle cx="20" cy="15.500" r="6.500" fill="#fff"/><path d="M6.500 34c2-7 8-9 13.500-9s11.500 2 13.500 9a20 20 0 0 1-27 0z" fill="#fff"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="#777" stroke-width="1.500" stroke-linejoin="round" stroke-linecap="round"><path d="M7 11v9H4v-9zM7 11l4-7c1.700 0 2.500 1 2 3l-.8 3H19a1.500 1.500 0 0 1 1.500 1.800l-1.300 6.500A2 2 0 0 1 17.200 20H7"/></svg>',
    dn: '<svg viewBox="0 0 24 24" fill="none" stroke="#777" stroke-width="1.500" stroke-linejoin="round" stroke-linecap="round"><path d="M7 13V4H4v9zM7 13l4 7c1.700 0 2.500-1 2-3l-.8-3H19a1.500 1.500 0 0 0 1.500-1.800l-1.300-6.500A2 2 0 0 0 17.200 4H7"/></svg>',
    rf: '<svg viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="1.800" stroke-linecap="round" stroke-linejoin="round"><path d="M19.500 12a7.500 7.500 0 1 1-2.300-5.400M19.500 4v4.500H15"/></svg>',
    bot: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="#fff" stroke="#d6d8db" stroke-width="1.500"/><rect x="9" y="17" width="22" height="13" rx="6.500" fill="#9fb0c4"/><rect x="14" y="21" width="12" height="5" rx="2.500" fill="#fff"/><circle cx="20" cy="12" r="3.500" fill="#9fb0c4"/><path d="M20 15v3" stroke="#9fb0c4" stroke-width="2"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="#a3a8b0" stroke-width="1.500"><circle cx="12" cy="12" r="9.500"/><path d="M12 11v6" stroke-linecap="round"/><circle cx="12" cy="7.500" r=".8" fill="#a3a8b0" stroke="none"/></svg>'
  };
  const cmItems = list => list.map((c, i) => `<div class="cm-c" data-i="${i}"><span class="av">${cmI.av}</span><div class="bd"><div class="tp"><b>${c.u}</b><svg class="ar" viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg><span class="fl">팔로우</span><i class="mr"><svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.700" fill="#333"/><circle cx="12" cy="12" r="1.700" fill="#333"/><circle cx="12" cy="19" r="1.700" fill="#333"/></svg></i></div><p>${esc(c.t)}</p><small>${c.d}</small><div class="bt"><span class="rp">답글</span><span class="rc"><button data-nv="cmup" class="${c.my === 1 ? "on" : ""}">${cmI.up}<em>${c.l + (c.my === 1 ? 1 : 0)}</em></button><button data-nv="cmdn" class="${c.my === -1 ? "on" : ""}">${cmI.dn}<em>${c.x + (c.my === -1 ? 1 : 0)}</em></button></span></div></div></div>`).join("");
  const NVY = [
    { u: "fixo****", t: "짝사랑이었나 보네", d: "2026.10.19. 14:54", l: 6, x: 1 },
    { u: "mout*****", t: "그래 요즘 시대에 자기 마음 표현하는 거 보기 좋다 성화야 나도 내년에 중학교 들어가는데 힘내라", d: "2026.10.19. 14:53", l: 16, x: 1 },
    { u: "dkek****", t: "에이구. 젊은 청년이. 안타깝게 됐네. 윤호 씨가 잘 보듬어 주시길...^^", d: "2026.10.19. 14:52", l: 3, x: 1 }
  ];
  function nvCmt(items = NVC, articleId = "") {
    const n = items.length;
    return `<div class="cm" id="nv-cm" data-article-id="${articleId}"><div class="cm-hd"><div class="n"><b>댓글 <span data-cmn>${n}</span></b><i>${cmI.rf}</i></div><button class="my">MY댓글</button></div>
<div class="cm-st">현재 댓글 <b data-cmn>${n}</b><u></u>작성자 삭제 <b>0</b><u></u>규정 미준수 <b>0</b></div>
<div class="cm-ip"><input type="text" placeholder="댓글을 입력해주세요" maxlength="300" autocomplete="off"><button data-nv="cmreg">등록</button></div>
<div class="cm-so"><span class="on" data-nv="cmsort">순공감순</span><span data-nv="cmsort">최신순</span><span data-nv="cmsort">공감비율순</span><span data-nv="cmsort">답글순</span><span data-nv="cmsort">과거순</span><i>${cmI.info}</i></div>
<div class="cm-ls">${cmItems(items)}</div></div>`;
  }
  document.addEventListener("click", e => {
    const t = e.target.closest(".nv.en .cm [data-nv]"); if (!t) return; const cm = t.closest(".cm"), comments = (cm.dataset.articleId === "4" || cm.dataset.articleId === "5") ? NVY : NVC, ls = cm.querySelector(".cm-ls"), sync = () => { ls.innerHTML = cmItems(comments); cm.querySelectorAll("[data-cmn]").forEach(x => x.textContent = comments.length); };
    switch (t.dataset.nv) {
      case "cmreg": { const inp = cm.querySelector(".cm-ip input"), v = inp.value.trim(); if (!v) break; const now = new Date(), d = new Date(2026, 9, 19, now.getHours(), now.getMinutes()), p = n => String(n).padStart(2, "0"); comments.unshift({ u: "me****", t: v, d: `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}. ${p(d.getHours())}:${p(d.getMinutes())}`, l: 0, x: 0 }); inp.value = ""; sync(); break; }
      case "cmup": case "cmdn": { const c = comments[+t.closest(".cm-c").dataset.i], k = t.dataset.nv === "cmup" ? 1 : -1; c.my = c.my === k ? 0 : k; sync(); break; }
      case "cmsort": cm.querySelectorAll(".cm-so span").forEach(s => s.classList.toggle("on", s === t)); break;
    }
  });
  (() => { const s = document.createElement("style"); s.textContent = `
.cm{margin-top:10px;padding-bottom:8px;border-top:0;color:#111}.cm button{font:inherit;color:inherit;border:0;background:none;padding:0;cursor:pointer}.cm svg{display:block;width:100%;height:100%}
.cm-cat{display:flex;gap:26px;overflow-x:auto;padding:0 16px;height:60px;align-items:center;border-bottom:1px solid #e3e5e8;box-shadow:0 3px 6px rgba(0,0,0,.05);font-size:19px;color:#222;white-space:nowrap;scrollbar-width:none}.cm-cat::-webkit-scrollbar{display:none}.cm-cat span{flex:none;line-height:60px;position:relative}.cm-cat .on{color:#3b5bdb;font-weight:600}.cm-cat .on:after{content:"";position:absolute;left:0;right:0;bottom:0;height:3px;background:#3b5bdb}
.cm-hd{display:flex;justify-content:space-between;align-items:center;padding:34px 16px 0}.cm-hd .n{display:flex;align-items:center;gap:10px}.cm-hd b{font-size:22px;font-weight:800;letter-spacing:-.3px}.cm-hd .n i{width:36px;height:36px;border:1px solid #d6d8db;border-radius:50%;padding:7px;box-sizing:border-box}.cm-hd .my{height:48px;padding:0 24px;border-radius:24px;background:#222;color:#fff!important;font-size:18px;font-weight:700}
.cm-st{display:flex;align-items:center;padding:14px 16px 0;font-size:16px}.cm-st b{margin-left:4px;font-weight:800}.cm-st u{width:1px;height:12px;background:#ddd;margin:0 14px}.cm-st u+*{}
.cm-ip{display:flex;margin:26px 16px 0;height:52px;border:1.5px solid #222;border-radius:10px;overflow:hidden}.cm-ip input{flex:1;min-width:0;border:0;outline:0;padding:0 16px;font:inherit;font-size:18px;color:#111;background:#fff}.cm-ip input::placeholder{color:#aaa}.cm-ip button{flex:none;width:76px;background:#222;color:#fff!important;font-size:19px;font-weight:700}
.cm-bot{display:flex;justify-content:flex-end;align-items:center;gap:10px;margin:16px 16px 0;font-size:17px;color:#999}.cm-bot b{color:#555}.cm-bot em{font-style:normal;display:inline-block;padding:0 9px;border-radius:13px;background:#9a9a9a;color:#fff;font-weight:800;font-size:14.5px;line-height:25px}.cm-bot i{width:40px;height:40px;flex:none}
.cm-so{display:flex;align-items:center;gap:12px;margin-top:22px;padding:0 16px 14px;border-bottom:1px solid #e9ecee;font-size:17px;color:#999;white-space:nowrap}.cm-so span{cursor:pointer}.cm-so .on{color:#111;font-weight:800;font-size:18px}.cm-so i{margin-left:auto;width:26px;height:26px;flex:none}
.cm-c{display:flex;gap:12px;padding:26px 16px 4px;border-bottom:1px solid #e5e5e5}.cm-c .av{flex:none;width:30px;height:30px;margin-top:2px}.cm-c .bd{flex:1;min-width:0}.cm-c .tp{display:flex;align-items:center;gap:8px}.cm-c .tp b{font-size:19px;font-weight:800}.cm-c .ar{width:16px;height:16px;margin-right:auto}.cm-c .fl{padding:7px 14px;border-radius:16px;background:#f1f2f4;color:#666;font-size:15px}.cm-c .mr{width:22px;height:22px;margin-left:6px}
.cm-c p{margin:8px 0 0;font-size:18px;line-height:1.5;word-break:break-all}.cm-c small{display:block;margin-top:6px;font-size:16px;color:#aaa}.cm-c .bt{display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding-bottom:24px}.cm-c .rp{font-size:16.5px;font-weight:700;color:#777}.cm-c .rc{display:flex;gap:18px}.cm-c .rc button{display:flex;align-items:center;gap:6px;font-size:19px;color:#777}.cm-c .rc svg{width:24px;height:24px}.cm-c .rc em{font-style:normal;min-width:10px}.cm-c .rc .on{color:#3b5bdb;font-weight:700}.cm-c .rc .on svg{stroke:#3b5bdb}`; document.head.appendChild(s); })();
  /* ===== 43차: 디시인사이드 국내힙합 갤러리 (가상 페이지, 화면 내 상태만 사용) ===== */
  const DC = { cm: [], ex: [] };
  const dcI = {
    bub: '<svg viewBox="0 0 24 24"><path d="M12 3C6.800 3 3 6.300 3 10.500c0 2.300 1.200 4.300 3 5.600V21l4.200-3c.600.100 1.200.100 1.800.100 5.200 0 9-3.300 9-7.600S17.200 3 12 3z" fill="#c9ccd6"/><circle cx="8.500" cy="10.500" r="1.100" fill="#fff"/><circle cx="12" cy="10.500" r="1.100" fill="#fff"/><circle cx="15.500" cy="10.500" r="1.100" fill="#fff"/></svg>',
    mob: '<svg viewBox="0 0 24 24"><rect x="6" y="2.500" width="12" height="19" rx="2.500" fill="none" stroke="#a9acb8" stroke-width="2"/><circle cx="12" cy="18" r="1" fill="#a9acb8"/></svg>',
    fp: '<svg viewBox="0 0 24 24"><path d="M2.500 6.500a2 2 0 0 1 2-2h5l2 2.500h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2z" fill="#a4a8b6"/><path d="M12 10v6M9 13h6" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>',
    rl: '<svg viewBox="0 0 24 24" fill="none" stroke="#9a9ca8" stroke-width="2.600" stroke-linecap="round"><path d="M20 12a8 8 0 1 1-2.400-5.700"/><path d="M20 3.500v4.500h-4.500" stroke-linejoin="round"/></svg>',
    dn: '<svg viewBox="0 0 24 24" fill="none" stroke="#9a9ca8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9l7 7 7-7"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 2.500l2.900 6 6.600.9-4.800 4.600 1.200 6.500L12 17.400 6.100 20.500l1.200-6.500L2.500 9.400l6.600-.9z" fill="#fff" stroke="#fff" stroke-width="1.500" stroke-linejoin="round"/></svg>',
    arr: '<svg viewBox="0 0 24 24"><path d="M9 3h6v8h4.500L12 20 4.500 11H9z" fill="#fff"/></svg>'
  };
  const dcX = '<svg viewBox="0 0 24 24" fill="none" stroke="#c4c6d0" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7"/></svg>';
  const dcImg = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#2fb36d"/><path d="M6 17l4-6 3 4 2-2 3 4z" fill="#fff"/><circle cx="9" cy="8.5" r="1.6" fill="#fff"/></svg>';
  const dcCm = (n, t, d) => { const m = /^([^(]*)(\(.*\))?$/.exec(n) || [0, n, ""]; return `<div class="dc-m"><div class="dc-mn2"><span>${esc(m[1])}<em>${esc(m[2] || "")}</em></span>${dcX}</div><p>${esc(t)}</p><small>${d}</small></div>`; };
  const dcNew = c => dcCm(c.n, c.t, c.d);
  const dcNow = () => { const d = new Date(2026, 9, 19, 14, 0); const p = x => String(x).padStart(2, "0"); return `${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; };
  const DCL = [
    ["일반","어케 꼬셨노 ㅅㅂ","ㅇㅇ(118.235)","10.19",412,5,0],
    ["일반","그럼 그 가사 전부 실화였던 거냐?","ㅇㅇ(223.38)","10.19",358,4,0],
    ["일반","정윤호 이제 비처녀임..?","ㅇㅇ(211.36)","10.19",527,3,0],
    ["일반","한 놈은 인정했는데 한 놈은 까인 거면 짝사랑 아님?","ㅇㅇ(106.101)","10.19",296,2,0],
    ["일반","솔직히 부러우면 부럽다고 해라 ㅋㅋ","ㅇㅇ(39.7)","10.19",244,1,0],
    ["일반","픽스온 이번 신곡 괜찮네","ㅇㅇ(175.223)","10.19",187,2,0],
    ["일반","3am 같은 곡 추천좀","ㅇㅇ(14.36)","10.19",163,0,0],
    ["일반","성화야 너는 진짜 힙합을 하는 구나","ㅇㅇ(58.29)","10.19",332,6,0],
    ["일반","파이널 무대는 지금 들어도 좋네","ㅇㅇ(220.92)","10.19",271,3,0],
    ["일반","픽스온이랑 배우랑 친하던데 다리 놔줫나봄","ㅇㅇ(121.140)","10.19",219,2,0]
  ];
  const dcLR = p => `<div class="dc-c"><div class="dc-cb">${dcI.bub}<b>${esc(p[1])}</b><small>${esc(p[0])}<i></i>${esc(p[2])}<i></i>${esc(p[3])}<i></i>조회 ${p[4]}<i></i>추천 ${p[5] >= 5 ? `<u>${p[5]}</u>` : p[5]}</small></div><div class="dc-cr">${p[6]}</div></div>`;
  function dcPage() {
    return `<div class="dc">
<div class="dc-h"><svg class="dc-lg" viewBox="0 0 40 30"><circle cx="11" cy="18" r="7.500" fill="none" stroke="#fff" stroke-width="5.500"/><rect x="15" y="2" width="6" height="24" fill="#fff"/><path d="M21 15c5-3 9 3 17 0l-5-5" fill="none" stroke="#fff" stroke-width="3.500" stroke-linecap="round" stroke-linejoin="round"/></svg>
<div class="dc-sb"><span class="dc-mn"><svg viewBox="0 0 24 24" fill="none" stroke="#9b9ba6" stroke-width="2.600" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></span><span class="dc-ph">갤러리 &amp; 통합검색</span><svg class="dc-sg" viewBox="0 0 24 24" fill="none" stroke="#3b4890" stroke-width="2.500" stroke-linecap="round"><circle cx="10.500" cy="10.500" r="6.500"/><path d="M15.500 15.500l5 5"/></svg><span class="dc-rc">최근방문</span></div></div>
<div class="dc-mb"><span>갤러리</span><span class="on">마이너갤</span><span>미니갤</span><span>인물갤</span><svg viewBox="0 0 24 24"><path d="M4 8h16l-8 9z" fill="#aab0d8"/></svg></div>
<div class="dc-gi"><div class="dc-gn"><b>국내힙합</b><span class="dc-mk">m</span></div><div class="dc-gt"><svg viewBox="0 0 24 24" fill="none" stroke="#b5b7c2" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.500v.5" stroke-linecap="round"/></svg><i></i><span>설정<em>N</em></span><i></i><span>연관</span></div></div>
<div class="dc-tt"><div class="dc-t1"><b>현시점 제일 부러운 새끼</b></div><div class="dc-t2"><span>ㅇㅇ <u class="fx">ㅅ</u><i></i>10.19 15:21</span><span style="display:flex;align-items:center;gap:12px">${dcI.fp}<button data-dc="x" style="border:1px solid #c9cde0!important;border-radius:18px;padding:6px 12px;font-size:14px;color:#222!important">갤로그가기</button></span></div></div><div class="dc-st"><span>조회수 2432</span><i></i><span>추천 23</span><i></i><span class="dc-pl">댓글 <em class="dc-n">${DC.ex.length + DC.cm.length}</em></span></div><div class="dc-im"><img src="images/app/DCInside/posts/HAo7NpjbAAAMd6Z.jpg" alt="디시인사이드 게시글 첨부 사진" loading="lazy"></div><div class="dc-bd">쇼미 1등한 새끼<br>끝나자마자 옾비 들어간 새끼<br>인맥이고 뭐고 원큐에 다 해결한 새끼<br>와꾸만으로도 죽을 때까지 먹고살 새끼<br>배우 남친까지 둔 새끼<br><div class="dc-rd">"대성화"</div></div><div class="dc-rec"><div class="dc-rb"><div class="dc-nums"><span>23</span></div><div class="dc-cir up">${dcI.star}<small>개념</small></div><div class="dc-cir dn">${dcI.arr}<small>비추</small></div><div class="dc-nm">0</div></div><div class="dc-tl"><span><u class="b">B</u>실베추</span><span>펌 0</span><span>공유</span><span>${dcI.fp}스크랩</span><span class="rd">신고</span></div></div><div class="dc-bt"><button data-dc="x">목록보기</button><button class="p" data-dc="x">글쓰기</button><button data-dc="x">수정</button><button data-dc="x">삭제</button></div><div class="dc-ch"><span class="l"><b>댓글</b><span class="rd">[<span class="dc-n">${DC.ex.length + DC.cm.length}</span>]</span><button class="dc-rf" data-dc="rf" aria-label="새로고침">${dcI.rl}</button></span><span class="r">본문<i></i>등록순${dcI.dn}</span></div><div class="dc-cl">${DC.ex.map(c => dcCm(c[1], c[0], c[2])).join("")}<div id="dc-new">${DC.cm.map(dcNew).join("")}</div></div><div class="dc-gap"></div><div class="dc-lst">${DCL.map(dcLR).join("")}</div>
</div>`;
  }
  (() => {
    const st = document.createElement("style"); st.textContent = `
.sf-pg.v:has(.dc){padding:0;background:#fff;font-size:16px;line-height:1.3}
.dc{color:#111;font-family:-apple-system,"Apple SD Gothic Neo",sans-serif;max-width:100%;overflow:hidden;--nv:#3b4890}.dc *{box-sizing:border-box}
.dc button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer;border-radius:0;-webkit-appearance:none;appearance:none}.dc svg{display:block;flex:none}.dc i{display:inline-block;width:1px;height:11px;background:#d2d4de;margin:0 7px;vertical-align:middle}
.dc-h{display:flex;align-items:center;gap:3px;background:var(--nv);padding:0 0 0 1px;height:53px}.dc-lg{width:38px;height:28px;flex:none}
.dc-sb{flex:1;min-width:0;height:37px;margin:0 1px 0 2px;background:#fff;border:1px solid #2d3875;display:flex;align-items:center}
.dc-mn{width:33px;align-self:stretch;display:grid;place-items:center;border-right:1px solid #e1e2ea;flex:none}.dc-mn svg{width:22px;height:22px}
.dc-ph{flex:1;min-width:0;padding-left:8px;color:#aaa;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dc-sg{width:22px;height:22px;margin:0 7px 0 4px}.dc-rc{align-self:stretch;display:flex;align-items:center;padding:0 9px;border-left:1px solid #e1e2ea;font-size:14px;font-weight:700;white-space:nowrap}
.dc-mb{display:flex;align-items:center;justify-content:space-between;height:36px;padding:0 12px;background:var(--nv);border-top:1px solid rgba(255,255,255,.1);color:#fff;font-size:16px;font-weight:700;white-space:nowrap;overflow:hidden}.dc-mb .on{color:#ffe34d}.dc-mb svg{width:20px;height:20px}
.dc-gi{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:0 0 0 12px;height:44px;border-bottom:1px solid #e3e4ea}
.dc-gn{display:flex;align-items:center;gap:5px;min-width:0}.dc-gn b{font-size:20px;font-weight:800;letter-spacing:-.5px;white-space:nowrap}.dc-mk{width:19px;height:19px;border-radius:50%;border:2px solid #222;font-size:11px;font-weight:800;line-height:15px;text-align:center;flex:none}
.dc-gt{display:flex;align-items:center;font-size:14px;white-space:nowrap}.dc-gt svg{width:15px;height:15px}.dc-gt em{font-style:normal;display:inline-block;width:11px;height:11px;border-radius:50%;background:#e11d2e;color:#fff;font-size:8px;line-height:11px;text-align:center;vertical-align:top;margin-left:1px}
.dc-wb{height:32px;margin:0 1px 0 8px;padding:0 8px;border:1px solid var(--nv)!important;color:var(--nv)!important;font-weight:700;font-size:15px;background:#fff}
.dc-tt{padding:10px 12px 8px;border-bottom:2px solid #e6e7ee}.dc-t1{display:flex;align-items:center;gap:5px}.dc-t1 b{font-size:18px;font-weight:800;letter-spacing:-.4px;word-break:break-all}.dc-t1 svg{width:14px;height:18px}
.dc-t2{display:flex;align-items:center;justify-content:space-between;margin-top:8px;color:#777;font-size:14px}.dc-t2 svg{width:20px;height:20px}.dc-t2 .fx{display:inline-block;width:14px;height:14px;background:#f2a23a;color:#fff;font-size:9px;line-height:14px;text-align:center;border-radius:2px;text-decoration:none;vertical-align:middle;margin-left:3px}
.dc-st{display:flex;align-items:center;padding:12px 12px 0;color:#777;font-size:14px}.dc-pl{display:inline-flex;gap:4px;align-items:center;height:26px;padding:0 9px;border:1px solid #ccd;border-radius:13px;background:#f6f6fa}.dc-pl em,.dc .rd,.dc-ch .rd{font-style:normal;color:#d32f2f}
.dc-im{width:94%;margin:20px 3% 0;overflow:hidden}.dc-im img{display:block;width:100%;height:auto}.dc-im svg{width:40%;height:40%}@font-face{font-family:"DSH";font-weight:500;src:url(data:font/woff;base64,d09GRk9UVE8AAApAAA8AAAAACxQAAgCDAAAAAAAAAAAAAAAAAAAAAAAAAABCQVNFAAAI/AAAAIsAAADeQuNP7kNGRiAAAAJkAAAGlQAABzs5VoEmR1BPUwAACYgAAAAgAAAAIER2THVHU1VCAAAJqAAAAEQAAABI0M7Mwk9TLzIAAAG4AAAATAAAAGBiejLZVk9SRwAACewAAAAIAAAACANxAABjbWFwAAACDAAAAEIAAABU4W+J+WhlYWQAAAFYAAAANgAAADYq5iQRaGhlYQAAAZAAAAAgAAAAJAhbAtRobXR4AAAJ9AAAABgAAAAYDNcBSm1heHAAAAGwAAAABgAAAAYAB1AAbmFtZQAAAgQAAAAGAAAABgAGAABwb3N0AAACUAAAABMAAAAg/7gAMnZoZWEAAAoMAAAAIgAAACQF7RIBdm10eAAACjAAAAAQAAAAEASdAH0AAQAAAAIAg4xJBrZfDzz1AAMD6AAAAADhAbPzAAAAAObyK9EAGP+UA8IDVgAAAAMAAgAAAAAAAHicY2BkYGCp//eIgYH5BYMEAwvzIQagCApgBQBvsAQ3AABQAAAHAAB4nGNgZr7D+IWBlYGBqYspgoGBwRtCM8YxGDGaAEWZgFIwwMiIYDO4+/u7AymlayHMBf87GBhY6hnlQGpAckxMTDeBlAIDGwAjjQrfAAAAAAAGAAB4nGNgYGBiYGBgBmIRIMkIplkYHIA0DwMHUI6FQUlBdjPDQcNrIf//A0WVFGRgvP/37z/zZbG7orkJrA8OAAg8EMkAAHicY2BmAIP/WxmMGLAAACzCAeoAeJxtlHtQVNcdx88Fdu/2nGUzYVnK7uK9iyJqrLwkjaaxSUZHRKcZE7UzrRVZYMHFhcVlYVksLCyPvfu4d1/ALq+FsFDwSTNEgdYkRU1thlHbpJOYGBOjaXQyTWZi0567XmfsLp32n/rHOWfm+3uczzlnzpcAKUmAIIiMV4xm4z6dSV+9ffee2oZNP9NV6ZvqEpFiXs1nuaUUv4rgqSSeTuZ/mBIVwMOfx74WsVJ6FQCPH0tX42+fwoJ07UNBmsMnPw0kBCGWVR73nHj33stVxgpdaZWu3qw3W7cbG6wmfc0Rs6aooPC5TUUFRZs1Kwma9UfM5obn8/MtFkueNqHkVRrr8jfkaRJgGn2jRqsxm7RVujqt6ajGWK0pMRprDDpNaX1l3krGCrsmDq/ZvVfzH/r/0594xk0luvq4Vvnk4C5tfU2T4cmxvSZjg9Fk1hvrtQaQRBBk6mPwagdAj0FhfAYgOelG0sd/WLz29ZepACQlxTMIQMZvGySDZ0EtiBBlSU8lfaWRCU7eiO8S7zz44h/p5ashfi2jtsWirRws8f+CHhVI0bQ4gkmR763B63Oqc5axo5RMKOdP4iliEcs/xPL0cg3EhzLOTE6cjtpHG0bpwydGF0+fXJpUdkyKivUHdm9VNfrWQpmg5SPxoms4/YNEUTbEBzNqc6D1UK3hgEnZbxLdPbu0fEsV7Z1qH6fCbceDzWoZ3vkXXLCE17xJYMVnWPgEp95KvxBLqVIMX+y/f1mFO0mcyoqEm+Rhbo1PRy2KRy4PfPOuKkY/A4WrpJDqFGEbyS2K+h3+Lu9zcKYjHz4qIHOPCRushU5JW68/RGML+Q2Jjf0iv49lvbQ/4BuKZEMrV801uUzHM1ucJY4Kp8Rbv8Nr2AR7TNGeiY6hNqXwHmnxtHKdlD4Utcyq+8NuT4i+H8DqyQezEgGQWm6jr5KSbbyKmUt4YiGNh3fw6J1tn6fzcj629JUCg7z3BbmQlrdDAELK/ZdwGpbf/xCnUMUZL+4r++mL+xY++vjSwkc3LpVtowSatysatkKJ/PvR4HRghI2w8+xZj0SQkTpui+8IdUE8vDBw+x0VvrIRCiWknGcO7nQa1MIPBKki+9up+bH50PwL8J/X7tx67wv8krA9M9jdZw86w46xoH+QCzj7ewY7I81nWsclMl5eDN8+f+7qH4nJwPef3b75yac44/P0pg7eGstVMGXCUG+F2lzB+evpnnYnsxnO4k7fG+qJCy4mQvf5Q8MRVYDxdbNUS+Cwvz6OeBen/Ag6RhqjpnGbxOH3ufvVb3r/6vmdRxLweXwcHQyy0Z5QDiz1bOaKhyR4+lGaYs/+6l0lB367vLz0xvVrF3V7qE8z7hX+SRAJZOEr+Vvff+3vNmojubd3P1O+BeKm05iclmwrgHg0F+IP1sFHF8kdbUJymwA6JX8j74WvX76pkoFkgoDyLF4jzZ3KSnGm8dnS3NezUqJp/Gpp7vkscVuawLmzRDvd4jk4h+ZuSqXxkeqRPv3wnuK/kQV4AyWUX6b/S/G6HFCJnyQGMqAAWSAHPAOKwD7wK1AJ6kAjaAV2wAAODIIomAfL4M/gBrgNviPSiHXEFqKUKCe6PXlQiVRBh8/OUqgQDkd+AlEv43ZwDJIEGAdrVyMSv+AVobVwNdzNiBDJXRQNOAJ2L2UI7Rqs8kjsTpfDSdsbZttPtYw0KRFZxgmEt5JC4RqPpItBz8NTthPWIYsS/RgONyuRwsm4GQ6pexiGcdFopReabg1blWg9/L149MrAd1dUKNjHev203+9HhlBpYpsuxuVw0XbjWdvJFuSJ8ynHraeaZzpG/bOBMY+EQ9mrNKvidG954h3j65IGFkFEHQu9GtYnqp0JyGPIJak5zAZq6O42Z6+H8TLKmcY50+yvI4FzfWMsTu1DtazXRPfYnA6W4RzKMeuUdaYNPQs7vcqG0J4N0NW70kblCvYEO1mrt4Ktcx1tyUTboKBYL6wXsgS4BoZtmZyTc/s4pGT9nmCfqq830OWjmsJ7x6v93R6Hy+lob8ycbJ9o6m85go4P88ND+OCIWJhyD7jPuxfc5Dz8Es2fkEqvzAysvH8snB5TKM7LgZgg1r2sa7S5MMmfVJyJxs2uK2F2ZXGzO/M/s9ufMDv/WohwWmxWoc+BrYf0hv0m5YBJdOfspeVbayB6EHtbcTThr+En+mvLWC2FVNGeFRNsbw1a1MjUWGvus/7GSs/XoWPhZsoWHrGPqdG/AWVNARkAAAB4nGNgZGBg4GDIYEhhYGFgd3HzCWHQSa4symGwSy9KzWawy0jMS2fQAZKZDDrZiXmJDDo5iSV5DHYMbAwgwATUJcegxKDGMAMqwgwU4WEQYBBhaGNg/L+OgZHZC0h3AEXFGFgyk9OSgLgkMyU1vyg/N48iG7UwbJRgYASKMzIfYgD5ipGhAgAWqShEAAABAAAACgAcAB4AAURGTFQACAAEAAAAAP//AAAAAAAAeJxjYGRgYOBicGFwY2B3cfMJYdBJrizKYTBLL0rNZjDLSMxLB5OZDGbZiXmJDGY5iSV5DGYMLEBdDP//M8ABACwKDyQAAQAAA3AAAAPoAGQBjAA0AbUALgG0ACkDxgBDADQAGHicY2AUYGD88o+HgYH5BYMUAw/zHQYGBkYGZMAIAGobBAMAAAPoAAAARgBJAFUAGgAaABo=) format("woff")}.dc-bd{padding:22px 3% 0;font-size:18px;line-height:1.55;color:#111;letter-spacing:-.4px}.dc-rd{margin-top:64px;margin-bottom:6px;color:#d32f2f;display:inline-block;transform:skewX(-14deg);transform-origin:left bottom;font:normal 700 28px/1.1 "DSH","Gungsuh","궁서",serif;letter-spacing:2px;-webkit-text-stroke:.8px #d32f2f}.dc-rec{padding:40px 0 28px;border-bottom:2px solid #e6e7ee}.dc-rb{display:flex;align-items:center;justify-content:center;gap:19px;padding-right:12px}
.dc-nums{display:flex;flex-direction:column;align-items:flex-end;color:var(--nv);font-size:18px;font-weight:800;line-height:1.1;margin-right:-8px}
.dc-cir{position:relative;width:54px;height:54px;border-radius:50%;flex:none;display:flex;flex-direction:column;align-items:center;justify-content:center}.dc-cir.up{background:var(--nv)}.dc-cir.dn{background:#a2a2b0}.dc-cir svg{width:26px;height:26px;margin-top:-3px}.dc-cir small{position:absolute;bottom:7px;font-size:10px;font-weight:700;color:#fff}
.dc-nm{color:#8a8a98;font-size:20px;font-weight:800}
.dc-tl{display:flex;align-items:center;justify-content:center;gap:10px;width:max-content;max-width:calc(100% - 24px);margin:14px auto 0;padding:9px 10px;background:#f5f6fb;border:1px solid #cfd3e6;font-size:13px;color:#8a8a98;overflow:hidden}
.dc-tl span{display:inline-flex;align-items:center;gap:4px;white-space:nowrap}.dc-tl svg{width:20px;height:20px}.dc-tl .rd{color:#d32f2f}.dc-tl u{text-decoration:none;width:19px;height:19px;border-radius:50%;background:#a4a8b6;color:#fff;font-weight:800;font-size:12px;line-height:19px;text-align:center}
.dc-bt{display:flex;gap:12px;padding:15px 12px;border-bottom:8px solid #eef0f6}.dc-bt button{flex:1;min-width:0;height:34px;border:2px solid #c9cde0;background:#fff;font-size:16px;font-weight:600;color:#222}.dc-bt .p{background:var(--nv);border-color:var(--nv);color:#fff}
.dc-ch{display:flex;align-items:center;justify-content:space-between;padding:0 12px;height:38px;border-bottom:4px solid #eef0f6;font-size:15px}.dc-ch .l{display:flex;align-items:center;gap:4px}.dc-ch b{font-size:19px;font-weight:800;margin-right:3px}.dc-ch .rd{font-size:19px}.dc-rf{width:22px;height:22px;margin-left:2px}.dc-rf svg{width:22px;height:22px}.dc-ch .r{display:flex;align-items:center}.dc-ch .r svg{width:18px;height:18px;margin-left:3px}
.dc-bx{margin:12px 10px;border:2px solid #c9cde0;background:#fff}.dc-in2{display:flex;border-bottom:1px solid #dfe1ec}.dc-in2 input{flex:1;min-width:0;width:50%;height:38px;border:0;outline:0;padding:0 10px;font:inherit;font-size:16px;background:#fff;border-radius:0}.dc-in2 input+input{border-left:1px solid #dfe1ec}.dc-in2 input::placeholder,.dc-bx textarea::placeholder{color:#b0b0b8}
.dc-bx textarea{display:block;width:100%;height:100px;border:0;outline:0;resize:none;padding:10px;font:inherit;font-size:16px;background:#fff;border-radius:0}
.dc-fb{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 10px;border-top:1px solid #dfe1ec}.dc-fb .ic{display:flex;align-items:center;gap:14px}.dc-fb .ic svg:first-child{width:32px;height:24px}.dc-fb .tt{width:26px;height:26px;border:2px solid #a4a8b6;border-radius:4px;font:700 16px/22px Georgia,serif;text-align:center;color:#333}.dc-fb .mic{width:26px;height:26px}
.dc-rg{height:27px;padding:0 15px;background:var(--nv)!important;color:#fff!important;font-size:15px;font-weight:700;flex:none}
.dc-ex{padding:14px 12px 10px;color:#9a9ca8;font-size:12px;border-bottom:4px solid #eef0f6}
.dc-c{display:flex;align-items:stretch;border-bottom:1px solid #e3e5ee}.dc-cb{flex:1;min-width:0;padding:10px 6px 10px 12px;display:grid;grid-template-columns:19px 1fr;column-gap:6px;align-items:center}.dc-cb svg{width:19px;height:19px}.dc-cb b{font-weight:400;font-size:17px;letter-spacing:-.4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dc-cb small{grid-column:1/-1;margin-top:5px;font-size:13px;color:#9a9ca8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.dc-cb small i{height:9px;margin:0 6px}
.dc-cr{flex:none;width:30px;display:grid;place-items:center;background:#f2f3f9;color:#d32f2f;font-size:14px}
.dc-m{padding:11px 12px 10px;border-bottom:1px solid #e3e5ee}.dc-mn2{display:flex;justify-content:space-between;align-items:center;font-size:17px;font-weight:500}.dc-mn2 em{font-style:normal;font-weight:400;color:#9a9ca8}.dc-mn2 svg{width:26px;height:26px}.dc-m p{margin:6px 0 4px;font-size:17px;line-height:1.45;word-break:break-all;letter-spacing:-.4px}.dc-m small{font-size:14px;color:#9a9ca8}
.dc-ch2{border-top:2px solid #e6e7ee;height:46px;background:#f6f7fb}.dc-gap{height:40px;border-bottom:4px solid #dfe2f0}.dc-cb small u{text-decoration:none;color:#1e90ff}
.dc-sr{margin:12px;border:1px solid #c9cde0;height:38px;display:flex;align-items:center;gap:8px;padding:0 10px;font-size:15px;color:#aaa}.dc-sr b{color:#222;font-weight:600}.dc-sr svg{width:22px;height:22px}.dc-sr svg:last-child{margin-left:auto}.dc-bn{display:flex;justify-content:space-between;padding:12px 24px;font-size:20px;font-weight:800;border-top:1px solid #e3e5ee}.dc-bn span:last-child{color:var(--nv)}

`; document.head.appendChild(st);
    document.addEventListener("click", e => {
      const b = e.target.closest && e.target.closest(".dc [data-dc]"); if (!b) return; const root = b.closest(".dc");
      if (b.dataset.dc === "reg") {
        const tx = root.querySelector("#dc-tx"), v = tx.value.trim(); if (!v) { tx.focus(); return; }
        DC.cm.push({ t: v, n: root.querySelector("#dc-nk").value.trim() || "ㅇㅇ", d: dcNow() });
        tx.value = ""; root.querySelector("#dc-pw").value = "";
        root.querySelector("#dc-new").innerHTML = DC.cm.map(dcNew).join("");
        root.querySelectorAll(".dc-n").forEach(x => { x.textContent = DC.ex.length + DC.cm.length; });
        for (const [k, c] of cache) if (/dcinside\.com/.test(k)) { c.html = dcPage(); c.pv = c.html; }
      } else if (b.dataset.dc === "rf") root.querySelectorAll(".dc-n").forEach(x => { x.textContent = DC.ex.length + DC.cm.length; });
    });
  })();

  /* 고정 날짜를 접속한 날 기준으로 이동 (a: 기준일 → 오늘) */
  const dsh = (s, a) => { const [ay, am, ad] = a.split(".").map(Number), off = Math.round((new Date(2026, 9, 19).setHours(0, 0, 0, 0) - new Date(ay, am - 1, ad)) / 864e5), p = n => String(n).padStart(2, "0"); return s.replace(/(?:(\d{4})\.)?(\d{2})\.(\d{2})/, (m, y, mo, da) => { const d = new Date(y ? +y : ay, +mo - 1, +da + off); return (y ? d.getFullYear() + "." : "") + p(d.getMonth() + 1) + "." + p(d.getDate()); }); };
  NV.recent.forEach(r => r.d = dsh(r.d, "2026.10.12"));
  NVC.forEach(c => c.d = dsh(c.d, "2026.10.11"));
  NVY.forEach(c => c.d = dsh(c.d, "2026.09.03"));
  DC.ex.forEach(c => c[2] = dsh(c[2], "2026.09.04"));

  function virt(url) {
    let x; try { x = new URL(url); } catch (e) { return null; }
    const h = x.hostname.replace(/^www\./, ""), p = x.pathname, g = k => x.searchParams.get(k) || "", t = g("t"), is = d => h === d || h.endsWith("." + d);
    if (is("dcinside.com")) return { title: "국내힙합 갤러리 - DCinside", html: dcPage() };
    const K = is("google.com") ? "g" : is("naver.com") ? "n" : is("youtube.com") ? "y" : is("wikipedia.org") ? "w" : is("apple.com") ? "a" : is("github.com") ? "h" : is("dispatch.co.kr") ? "d" : h === "news.ycombinator.com" ? "k" : ""; if (!K) return null;
    if (K === "n" && h === "entertain.naver.com" && p.startsWith("/article")) { const id = p.endsWith("/9263514") ? "6" : p.endsWith("/7418206") ? "4" : p.endsWith("/5831047") ? "3" : (p.match(/\/article\/(?:sample\/)?(\d+)$/) || [])[1]; const a = NVN.find(x => x.id === id && nvVis(x)) || NVN[0]; return { title: a.title, html: nvEnt(a.id) }; }
    if (K === "d") return { title: p.startsWith("/article") ? "[단독] 마스♥정윤호, 심야 데이트 포착 - Atspatch" : "Atspatch", html: p.startsWith("/article") ? dpArt() : dpMain() };
    const root = p === "/" || p === "" || (K === "a" && /^\/kr\/?$/.test(p));
    let q = ""; if (K === "g" && p === "/search") q = g("q"); else if (K === "n" && h === "search.naver.com") q = g("query"); else if (K === "h" && p === "/search") q = g("q"); else if (K === "y" && p === "/results") q = g("search_query");
    if (K === "n" && /^(정윤호|배우\s*b)$/i.test(q.trim())) return { title: "정윤호 : 네이버 검색", html: nvPerson("정윤호") };
    if (K === "n" && /^(박성화|마스|mars|래퍼\s*a)$/i.test(q.trim())) return { title: "MARS : 네이버 검색", html: nvPerson("MARS") };
    if (q) return { title: `${q} - ${NAME[K]} 검색`, html: K === "y" ? vtop(K) + vform(K, "검색", q) + `<div style="padding:8px 0">${vids(q, 6)}</div>` : results(q, K) };
    if (root) {
      const links = (a) => `<div class="v-list">${a.map(([n, u]) => vl(u, esc(n))).join("")}</div>`;
      if (K === "g") return { title: "Google", html: `<div class="v-logo"><span style="color:#4285f4">G</span><span style="color:#ea4335">o</span><span style="color:#fbbc05">o</span><span style="color:#4285f4">g</span><span style="color:#34a853">l</span><span style="color:#ea4335">e</span></div>${vform("g", "Google 검색 또는 URL 입력")}<div class="v-chips">${[["위키백과", HOME.w], ["YouTube", HOME.y], ["네이버", HOME.n], ["GitHub", HOME.h]].map(([n, u]) => vl(u, n)).join("")}</div>` };
      if (K === "n") return { title: "NAVER", html: nvMain() };
      if (K === "y") return { title: "YouTube", html: `<div class="v-top y">${vl(HOME.y, "▶ YouTube")}</div>${vform("y", "YouTube 검색")}<div style="padding-top:8px">${vids("", 6)}</div>` };
      if (K === "w") return { title: "위키백과", html: `${vtop("w")}<div class="v-art"><h1>위키백과</h1><p>우리 모두의 백과사전</p></div>${vform("w", "위키백과 검색")}<div class="v-sec">추천 문서</div>${links(["대한민국", "서울", "인공지능", "우주", "음악"].map(n => [n, `https://ko.wikipedia.org/wiki/${vq(n)}`]))}` };
      if (K === "a") return { title: "Apple", html: `${vtop("a")}<div class="v-hero"><h1>iPhone</h1><p>새로운 경험의 시작.</p></div>${links(["iPhone", "iPad", "Mac", "Apple Watch", "AirPods"].map(n => [n, `https://www.apple.com/kr/shop?t=${vq(n)}`]))}` };
      if (K === "h") return { title: "GitHub", html: `${vtop("h")}${vform("h", "저장소 검색")}<div class="v-sec">인기 저장소</div>${links(["octo/hello-world", "dev/ui-kit", "team/web-app", "lab/ml-tools"].map(n => [n, `https://github.com/${n}?t=${vq(n)}`]))}` };
      return { title: "Hacker News", html: `${vtop("k")}<div class="v-list">${["Show HN: 작은 브라우저 만들기", "새 프로그래밍 언어 출시", "오픈소스 운영 경험담", "데이터베이스 인덱스 해설", "소규모 팀의 생산성 비결", "웹 표준의 미래"].map((n, i) => vl(`https://news.ycombinator.com/item?id=${i + 1}&t=${vq(n)}`, `${i + 1}. ${esc(n)}`)).join("")}</div>` };
    }
    let title = t; if (!title && K === "w" && p.startsWith("/wiki/")) { try { title = decodeURIComponent(p.slice(6)).replace(/_/g, " "); } catch (e) { title = p.slice(6); } } title = title || `${NAME[K]} 페이지`;
    return { title, html: `${vtop(K)}<div class="v-art"><h1>${esc(title)}</h1>${lorem(title)}</div>` };
  }

  /* ---- 페이지 가져오기 (r.jina.ai 리더 프록시 경유) ---- */
  function parseJ(tx) { const m = /^Title:\s*(.*)$/m.exec(tx), i = tx.indexOf("Markdown Content:"); return { title: m ? m[1].trim() : "", body: i >= 0 ? tx.slice(i + 17).trim() : tx.trim() }; }
  async function fetchMd(url, signal) { const r = await fetch("https://r.jina.ai/" + url, { signal }); if (!r.ok) throw new Error("서버 응답 오류 (" + r.status + ")"); return parseJ(await r.text()); }
  const bad = p => p.body.length < 250 || /unusual traffic|enable javascript|captcha|사용 중인 브라우저/i.test(p.body.slice(0, 1500));
  async function fetchPage(url, signal) {
    const vp = virt(url); if (vp) { await new Promise(r => setTimeout(r, 220)); if (signal.aborted) throw new DOMException("", "AbortError"); return { ...vp, note: "" }; }
    const q = isSearch(url);
    if (q) {
      try { const p = await fetchMd(url, signal); if (!bad(p)) return { ...p, note: "" }; } catch (e) { if (signal.aborted) throw e; }
      const p = await fetchMd("https://duckduckgo.com/html/?q=" + encodeURIComponent(q), signal);
      return { ...p, title: q + " – 검색", note: "Google 검색 결과를 가져올 수 없어 DuckDuckGo 검색 결과를 표시합니다." };
    }
    return { ...(await fetchMd(url, signal)), note: "" };
  }
  const startHtml = () => {
    const defaults = [
      { title: "네이버", url: "https://www.naver.com/" },
      { title: "디시인사이드", url: "https://www.dcinside.com/" },
    ];
    const tile = (item) => {
      const logo = item.title === "네이버" ? "images/app/Naver/IMG_7151.png" : item.title === "디시인사이드" ? "images/app/DCInside/IMG_7147.png" : "";
      const face = logo ? `<img src="${logo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block">` : esc([...item.title][0] || "?");
      return `<a class="sf-tile" href="#" data-go="${esc(item.url)}" style="justify-self:start;width:108px;display:flex;flex-direction:column;align-items:center;text-align:center"><div class="sf-ti" style="width:76px;height:76px;overflow:hidden;background:${hue(host(item.url))};border-radius:22px;display:grid;place-items:center">${face}</div><span style="display:block;width:108px;margin-top:8px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(item.title)}</span></a>`;
    };
    return `<div class="sf-st" style="display:block;padding:24px 16px 32px"><div class="sf-sh2" style="display:block;margin:0 0 18px;font-size:20px;font-weight:700;color:#111">즐겨찾기</div><div class="sf-tiles" style="display:grid;grid-template-columns:repeat(3,108px);justify-items:start;align-items:start;gap:22px 0">${defaults.map(tile).join("")}</div></div>`;
  };

  /* ---- 표시 ---- */
  const view = () => $("#sf-view");
  function setProg(m) { const p = $("#sf-prog"); p.className = "sf-prog"; if (m === "go") { void p.offsetWidth; p.classList.add("go"); } else if (m === "done") p.classList.add("done"); }
  function ui() {
    const t = tab(), r = rt(t), u = cu(t);
    $("#sf-at").innerHTML = u ? `${u.startsWith("https") ? I.lock : ""}<span>${esc(disp(u))}</span>` : `<span class="ph">검색 또는 웹 사이트 이름 입력</span>`;
    $("#sf-rl").innerHTML = r.loading ? I.x : I.reload; $("#sf-rl").style.visibility = u ? "visible" : "hidden";
    $("#sf-back").disabled = false; $("#sf-fwd").disabled = t.idx >= t.hist.length - 1; $("#sf-share").disabled = !u;
    $("#sf-tn").textContent = S.tabs.length; setProg(r.loading ? "go" : "");
  }
  function paint(t) {
    const v = view(), r = rt(t), u = cu(t); v.classList.toggle("start", !u);
    if (!u) v.innerHTML = startHtml();
    else if (r.err) v.innerHTML = `<div class="sf-err"><h2>페이지를 열 수 없음</h2><p>${esc(r.err)}</p><p>${esc(host(u))}</p><button data-s="retry">다시 시도</button></div>`;
    else if (cache.has(u)) { const c = cache.get(u); v.innerHTML = `<div class="sf-pg${c.virt ? " v" : ""}">${r.note ? `<div class="sf-note">${esc(r.note)}</div>` : ""}${c.html}</div>`; }
    else v.innerHTML = "";
    v.scrollTop = r.scroll || 0;
  }
  function show() { const t = tab(), r = rt(t), u = cu(t); paint(t); ui(); if (u && !cache.has(u) && !r.loading && !r.err) load(t, false); }
  async function load(t, visit) {
    const u = cu(t), r = rt(t); if (!u) return;
    if (r.ctl) r.ctl.abort(); const ctl = r.ctl = new AbortController(), id = ++r.req; let timed = false;
    const to = setTimeout(() => { timed = true; ctl.abort(); }, 20000);
    r.loading = true; r.err = null; r.note = ""; if (t.id === S.cur) { ui(); if (!cache.has(u)) view().innerHTML = ""; }
    try {
      const p = await fetchPage(u, ctl.signal); if (id !== r.req) return;
      const html = p.html || md(p.body, u), pv = p.html || md(p.body.slice(0, 1800), u), title = p.title || host(u);
      cache.set(u, { title, html, pv, virt: !!p.html }); if (cache.size > 30) cache.delete(cache.keys().next().value);
      r.note = p.note; if (t.hist[t.idx]) t.hist[t.idx].title = title; t.title = title;
      if (visit) { const l = S.hist[0]; if (l && l.url === u) { l.ts = Date.now(); l.title = title; } else S.hist.unshift({ url: u, title, ts: Date.now() }); S.hist = S.hist.slice(0, 500); }
      save();
    } catch (e) { if (id !== r.req) return; r.err = timed ? "응답 시간이 초과되었습니다." : (e.name === "AbortError" ? "" : (e.message === "Failed to fetch" ? "네트워크에 연결할 수 없거나 서버가 요청을 거부했습니다." : e.message)); if (e.name === "AbortError" && !timed) { r.loading = false; clearTimeout(to); if (t.id === S.cur) { ui(); } return; } }
    clearTimeout(to); r.loading = false;
    if (t.id === S.cur) { r.scroll = 0; paint(t); ui(); setProg("done"); }
    try { new URL(u); } catch (_) {}
  }
  function go(url, newT) {
    let t = tab(); { const c = t.hist[t.idx]; if (c) c.sc = view().scrollTop; } if (newT) { t = newTab(); S.tabs.push(t); S.cur = t.id; }
    t.hist = t.hist.slice(0, t.idx + 1); t.hist.push({ url, title: "" }); t.idx = t.hist.length - 1; t.title = ""; const r = rt(t); r.err = null; r.scroll = 0; save();
    paint(t); ui(); load(t, true);
  }
  function nav(d) { const t = tab(), r = rt(t), v = view(); r.scroll = v.scrollTop; if (t.hist[t.idx]) t.hist[t.idx].sc = v.scrollTop; const n = t.idx + d; if (d < 0 && n < -1) { if (window.Home) Home.goHome(); return; } if (n < -1 || n >= t.hist.length) return; if (r.ctl) r.ctl.abort(); r.loading = false; t.idx = n; r.err = null; r.scroll = 0; save(); show(); { const e = t.hist[t.idx]; if (e && e.sc) view().scrollTop = e.sc; } }
  function submit(q) {
    q = q.trim(); if (!q) return; const u = looksUrl(q);
    if (!u) { S.searches = [q, ...S.searches.filter(x => x !== q)].slice(0, 10); }
    closeEdit(); go(toUrl(q));
  }

  /* ---- 주소 편집 ---- */
  const inp = () => $("#sf-in");
  let ev = "";
  function openEdit() { const u = cu(tab()); ev = u ? (isSearch(u) || (() => { const z = u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""); try { return decodeURIComponent(z); } catch (e) { return z; } })()) : ""; $("#sf-edit").classList.add("on"); inp().value = ev; sugg(); inp().focus(); inp().select(); }
  function closeEdit() { $("#sf-edit").classList.remove("on"); inp().blur(); }
  function sugg() {
    const q = inp().value.trim(), lq = q.toLowerCase(), box = $("#sf-es"), row = (icn, b, sm, a) => `<button class="sf-sg" ${a}>${icn}<div><b>${esc(b)}</b>${sm ? `<small>${esc(sm)}</small>` : ""}</div></button>`;
    let h = "";
    if (!q || q === ev) {
      h += `<div class="sf-sec">즐겨찾기</div><div class="sf-tiles">${S.bm.slice(0, 8).map(b => `<a class="sf-tile" href="#" data-s="sgu" data-u="${esc(b.url)}"><div class="sf-ti" style="background:${hue(host(b.url))}">${esc([...b.title][0] || "?")}</div><span>${esc(b.title)}</span></a>`).join("")}</div>`;
      if (S.searches.length) h += `<div class="sf-sec">최근 검색</div>` + S.searches.map(x => row(I.clock, x, "", `data-s="sgq" data-q="${esc(x)}"`)).join("");
    } else {
      h += row(I.search, q, "Google 검색", `data-s="sgq" data-q="${esc(q)}"`);
      const u = looksUrl(q); if (u) h += row(I.globe, u, "웹 사이트 열기", `data-s="sgu" data-u="${esc(u)}"`);
      const seen = new Set(), m = [...S.bm.map(b => ({ ...b, k: "즐겨찾기" })), ...S.hist.map(x => ({ ...x, k: "기록" }))].filter(x => (x.title + " " + x.url).toLowerCase().includes(lq) && !seen.has(x.url) && seen.add(x.url)).slice(0, 6);
      h += m.map(x => row(I.globe, x.title || host(x.url), x.url, `data-s="sgu" data-u="${esc(x.url)}"`)).join("");
      h += S.searches.filter(x => x.toLowerCase().includes(lq) && x !== q).slice(0, 4).map(x => row(I.clock, x, "최근 검색", `data-s="sgq" data-q="${esc(x)}"`)).join("");
    }
    box.innerHTML = h;
  }

  /* ---- 탭 전환 화면 ---- */
  let tq = "";
  const vis = () => S.tabs.filter(t => !!t.p === !!S.pm);
  function renderTabs() {
    const q = tq.trim().toLowerCase(), l = vis().filter(t => !q || ((t.title || "") + " " + cu(t)).toLowerCase().includes(q)); $("#sf-ts").classList.toggle("pv", !!S.pm);
    $("#sf-tg").innerHTML = l.map(t => { const u = cu(t), c = cache.get(u), r = rt(t); return `<div class="sf-tc${t.id === S.cur ? " on" : ""}"><button class="sf-tx" data-s="tclose" data-id="${t.id}" aria-label="탭 닫기">${I.x}</button><button data-s="tsel" data-id="${t.id}" style="display:block;width:100%"><div class="sf-pvw">${!u ? `<div class="sf-pvi" style="background:#f2f2f7;min-height:100%">${startHtml()}</div>` : c ? `<div class="sf-pvi"><div class="sf-pg${c.virt ? " v" : ""}">${c.pv}</div></div>` : `<div class="sf-ph">${esc([...(t.title || host(u))][0] || "?")}</div>`}</div><div class="t">${esc(t.title || (u ? host(u) : "시작 페이지"))}</div></button></div>`; }).join("") || `<div class="sf-te">${q ? "검색 결과가 없어요" : S.pm ? "비공개 탭이 없어요" : "열린 탭이 없어요"}</div>`;
    $("#sf-tcnt").textContent = S.pm ? "비공개" : `${vis().length}개의 탭`;
    document.querySelectorAll(".sf-pvw").forEach(w => { const i = w.firstChild; if (i && i.classList.contains("sf-pvi")) i.style.transform = `scale(${w.clientWidth / 390})`; });
  }
  function openTabs() { const t = tab(); rt(t).scroll = view().scrollTop; S.pm = !!t.p; tq = ""; $("#sf-tq").value = ""; $("#sf-tsr").classList.remove("on"); $("#sf-ts").classList.add("on"); el.classList.add("ts-on"); renderTabs(); screen.classList.remove("app-light"); }
  const closeTm = () => { $("#sf-tm").classList.remove("on"); $("#sf-tmb").classList.remove("on"); };
  const closeTabs = () => { $("#sf-ts").classList.remove("on"); el.classList.remove("ts-on"); closeTm(); if (isOpen) screen.classList.add("app-light"); };
  const CK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.500l4.500 4.500L19 7.500"/></svg>';
  function fixCur() { let v = vis(); if (!v.length) { if (S.pm) { S.pm = false; v = vis(); } if (!v.length) { const n = newTab(); S.tabs.push(n); v = [n]; } } if (!v.some(x => x.id === S.cur)) S.cur = v[v.length - 1].id; save(); }
  function tmenu(k) { const m = $("#sf-tm"), nn = S.tabs.filter(t => !t.p).length; m.className = "sf-tm on " + (k === "cap" ? "b" : "t"); $("#sf-tmb").classList.add("on");
    m.innerHTML = k === "cap" ? `<button data-s="tmode" data-m="n"><i>${S.pm ? "" : CK}</i>${nn}개의 탭</button><button data-s="tmode" data-m="p"><i>${S.pm ? CK : ""}</i>비공개</button>` : `<button data-s="tsort" data-k="t"><i></i>제목순으로 정렬</button><button data-s="tsort" data-k="h"><i></i>웹사이트순으로 정렬</button><button data-s="tcall"><i></i>모든 탭 닫기</button>`; }
  el.addEventListener("input", e => { if (e.target.id === "sf-tq") { tq = e.target.value; renderTabs(); } });
  function closeTab(id) {
    const i = S.tabs.findIndex(t => t.id === id); if (i < 0) return; const r = RT[id]; if (r && r.ctl) r.ctl.abort(); S.tabs.splice(i, 1); delete RT[id];
    if (!S.tabs.length) { const t = newTab(); S.tabs.push(t); S.cur = t.id; save(); closeTabs(); show(); return; }
    if (S.cur === id) S.cur = S.tabs[Math.min(i, S.tabs.length - 1)].id; save(); renderTabs(); show();
  }

  /* ---- 시트들 ---- */
  const sbE = () => $("#sf-sb"), shE = () => $("#sf-sh"), pnE = () => $("#sf-pn");
  const toast = m => { const t = $("#sf-toast"); t.textContent = m; t.classList.add("on"); setTimeout(() => t.classList.remove("on"), 1400); };
  const closeAll = () => { shE().classList.remove("on"); pnE().classList.remove("on"); sbE().classList.remove("on"); };
  const showSh = h => { shE().innerHTML = h; shE().classList.add("on"); sbE().classList.add("on"); };
  const ask = (msg, label, a) => showSh(`<div class="sf-sc"><div class="m">${msg}</div><button class="red" ${a}>${label}</button></div><div class="sf-sc"><button data-s="sx">취소</button></div>`);
  function copy(txt) { const ok = () => toast("링크가 복사되었습니다"); const fb = () => { const a = document.createElement("textarea"); a.value = txt; a.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(a); a.select(); try { document.execCommand("copy"); ok(); } catch (e) { toast("복사할 수 없습니다"); } a.remove(); }; if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, fb); else fb(); }
  const isBm = u => S.bm.some(b => b.url === u), isRl = u => S.rl.some(b => b.url === u);
  function share() {
    const t = tab(), u = cu(t); if (!u) return; const c = cache.get(u), title = (c && c.title) || t.title || host(u);
    showSh(`<div class="sf-sc"><div class="hd"><b>${esc(title)}</b><small>${esc(u)}</small></div><button data-s="copy">링크 복사</button><button data-s="rladd" ${isRl(u) ? "disabled" : ""}>${isRl(u) ? "읽기 목록에 있음" : "읽기 목록에 추가"}</button><button data-s="bmtog">${isBm(u) ? "즐겨찾기에서 삭제" : "즐겨찾기에 추가"}</button></div><div class="sf-sc"><button data-s="sx">닫기</button></div>`);
  }
  let pn = { seg: "bm", edit: false, form: null, q: "" };
  const fdate = ts => { const src = new Date(ts), n = new Date(2026, 9, 19), d = new Date(2026, 9, 19, src.getHours(), src.getMinutes()), p = x => String(x).padStart(2, "0"), tm = `${d.getHours() < 12 ? "오전" : "오후"} ${d.getHours() % 12 || 12}:${p(d.getMinutes())}`; return d.toDateString() === n.toDateString() ? tm : `${d.getMonth() + 1}월 ${d.getDate()}일 ${tm}`; };
  function plist() {
    const row = (it, k, sub) => `<button class="sf-sg" data-s="pgo" data-u="${esc(it.url)}">${pn.edit ? `<span class="sf-minus" data-s="pdel" data-k="${k}" data-id="${esc(it.id || it.url + "|" + it.ts)}">−</span>` : I.globe}<div><b>${esc(it.title || host(it.url))}</b><small>${esc(sub)}</small></div></button>`;
    if (pn.seg === "bm") return S.bm.map(b => `<button class="sf-sg" data-s="${pn.edit ? "bform" : "pgo"}" data-id="${b.id}" data-u="${esc(b.url)}">${pn.edit ? `<span class="sf-minus" data-s="pdel" data-k="bm" data-id="${b.id}">−</span>` : I.globe}<div><b>${esc(b.title)}</b><small>${esc(b.url)}</small></div></button>`).join("") || `<div class="sf-em">즐겨찾기가 없습니다.<br>공유 버튼에서 추가할 수 있습니다.</div>`;
    if (pn.seg === "rl") return S.rl.map(b => row(b, "rl", host(b.url) + " · " + fdate(b.ts))).join("") || `<div class="sf-em">읽기 목록이 비어 있습니다.</div>`;
    const q = pn.q.trim().toLowerCase(), l = S.hist.filter(h => !q || (h.title + " " + h.url).toLowerCase().includes(q));
    return l.map(h => row(h, "hist", host(h.url) + " · " + fdate(h.ts))).join("") || `<div class="sf-em">${q ? "검색 결과 없음" : "방문 기록이 없습니다."}</div>`;
  }
  function renderPn() {
    const p = pnE(), segs = [["bm", "즐겨찾기"], ["rl", "읽기 목록"], ["hist", "기록"]];
    if (pn.form) { const b = S.bm.find(x => x.id === pn.form); p.innerHTML = `<div class="sf-ph2"><button data-s="fcancel">취소</button><span style="flex:1;text-align:center;font-weight:600">즐겨찾기 수정</span><button data-s="fsave" style="font-weight:600">저장</button></div><div class="sf-form"><label>이름<input id="sf-fn" value="${esc(b.title)}"></label><label>주소<input id="sf-fu" value="${esc(b.url)}" autocapitalize="off"></label></div>`; return; }
    p.innerHTML = `<div class="sf-ph2"><div class="seg">${segs.map(x => `<button class="${pn.seg === x[0] ? "on" : ""}" data-s="pseg" data-k="${x[0]}">${x[1]}</button>`).join("")}</div><button data-s="pdone">완료</button></div><div class="sf-sub">${pn.seg === "hist" ? `<input id="sf-hq" placeholder="기록 검색" value="${esc(pn.q)}"><button data-s="pclr">지우기</button>` : `<button data-s="pedit">${pn.edit ? "완료" : "편집"}</button>`}${pn.seg === "hist" ? `<button data-s="pedit">${pn.edit ? "완료" : "편집"}</button>` : ""}</div><div class="sf-pl" id="sf-pl">${plist()}</div>`;
  }
  function openPn() { pn = { seg: "bm", edit: false, form: null, q: "" }; renderPn(); pnE().classList.add("on"); sbE().classList.add("on"); }

  /* ---- 이벤트 ---- */
  el.addEventListener("click", e => {
    const g = e.target.closest("[data-go]"); if (g && !e.target.closest("[data-s]")) { e.preventDefault(); go(g.dataset.go); return; }
    const t = e.target.closest("[data-s]"); if (!t) return; e.preventDefault(); const d = t.dataset;
    switch (d.s) {
      case "rl": { const tb = tab(), r = rt(tb); if (r.loading) { if (r.ctl) r.ctl.abort(); } else { cache.delete(cu(tb)); r.scroll = view().scrollTop; load(tb, false); } break; }
      case "retry": load(tab(), false); break;
      case "back": nav(-1); break;
      case "fwd": nav(1); break;
      case "share": share(); break;
      case "book": openPn(); break;
      case "tabs": break; /* 하단 페이지(탭) 버튼: 반응 없음 */
      case "ecancel": closeEdit(); break;
      case "vs": { const inpt = t.parentElement.querySelector("input"); vsubmit(d.site, inpt.value); break; }
            case "sgq": submit(d.q); break;
      case "sgu": closeEdit(); go(d.u); break;
      case "tsel": S.cur = d.id; save(); closeTabs(); show(); break;
      case "tclose": closeTab(d.id); break;
      case "tnew": { const n = newTab(); S.tabs.push(n); S.cur = n.id; save(); closeTabs(); show(); break; }
      case "tdone": fixCur(); closeTabs(); show(); break;
      case "tsearch": { const r = $("#sf-tsr"); r.classList.toggle("on"); if (r.classList.contains("on")) $("#sf-tq").focus(); else { tq = ""; $("#sf-tq").value = ""; renderTabs(); } break; }
      case "tmore": tmenu("more"); break;
      case "tcap": tmenu("cap"); break;
      case "tmx": closeTm(); break;
      case "tmode": S.pm = d.m === "p"; save(); closeTm(); renderTabs(); break;
      case "tsort": { const k = x => ((d.k === "h" ? host(cu(x)) : x.title) || host(cu(x)) || "").toLowerCase(); S.tabs.sort((a, b) => k(a) < k(b) ? -1 : k(a) > k(b) ? 1 : 0); save(); closeTm(); renderTabs(); break; }
      case "tcall": { vis().forEach(x => { const r = RT[x.id]; if (r && r.ctl) r.ctl.abort(); delete RT[x.id]; S.tabs.splice(S.tabs.indexOf(x), 1); }); fixCur(); closeTm(); renderTabs(); show(); break; }
      case "sx": closeAll(); break;
      case "copy": { const u = cu(tab()); closeAll(); copy(u); break; }
      case "rladd": { const tb = tab(), u = cu(tb), c = cache.get(u); if (!isRl(u)) S.rl.unshift({ url: u, title: (c && c.title) || tb.title || host(u), ts: Date.now() }); save(); closeAll(); toast("읽기 목록에 추가됨"); break; }
      case "bmtog": { const tb = tab(), u = cu(tb), c = cache.get(u); if (isBm(u)) S.bm = S.bm.filter(b => b.url !== u); else S.bm.push({ id: uid(), title: (c && c.title) || tb.title || host(u), url: u }); save(); closeAll(); toast(isBm(u) ? "즐겨찾기에 추가됨" : "즐겨찾기에서 삭제됨"); break; }
      case "pseg": pn.seg = d.k; pn.edit = false; renderPn(); break;
      case "pedit": pn.edit = !pn.edit; renderPn(); break;
      case "pdone": closeAll(); break;
      case "pgo": closeAll(); go(d.u); break;
      case "pdel": { e.stopPropagation(); const id = d.id; if (d.k === "bm") S.bm = S.bm.filter(b => b.id !== id); else if (d.k === "rl") S.rl = S.rl.filter(b => (b.url + "|" + b.ts) !== id); else S.hist = S.hist.filter(h => (h.url + "|" + h.ts) !== id); save(); $("#sf-pl").innerHTML = plist(); break; }
      case "bform": pn.form = d.id; renderPn(); break;
      case "fcancel": pn.form = null; renderPn(); break;
      case "fsave": { const b = S.bm.find(x => x.id === pn.form), n = $("#sf-fn").value.trim(), u = $("#sf-fu").value.trim(), uu = looksUrl(u); if (!uu) { toast("올바른 주소를 입력하세요"); break; } b.title = n || host(uu); b.url = uu; save(); pn.form = null; renderPn(); break; }
      case "pclr": ask("모든 방문 기록을 삭제할까요?", "기록 삭제", 'data-s="pclr2"'); break;
      case "pclr2": S.hist = []; save(); shE().classList.remove("on"); $("#sf-pl") && ($("#sf-pl").innerHTML = plist()); break;
    }
  });
  el.addEventListener("input", e => { if (e.target.id === "sf-in") sugg(); else if (e.target.id === "sf-hq") { pn.q = e.target.value; $("#sf-pl").innerHTML = plist(); } });
  el.addEventListener("keydown", e => { if (e.target.dataset && e.target.dataset.vs && e.key === "Enter" && !e.isComposing) { e.preventDefault(); vsubmit(e.target.dataset.vs, e.target.value); return; } if (e.target.id === "sf-in" && e.key === "Enter" && !e.isComposing) { e.preventDefault(); submit(e.target.value); } });
  el.addEventListener("scroll", e => { if (e.target.id === "sf-view") rt(tab()).scroll = e.target.scrollTop; }, true);

  el.innerHTML = `<div class="sf-main"><div class="sf-top"><div class="sf-ab"><button class="sf-addr" id="sf-at" type="button" aria-label="주소" tabindex="-1"></button><button class="sf-rl" id="sf-rl" data-s="rl" aria-label="새로고침"></button></div></div><div class="sf-prog" id="sf-prog"><i></i></div><div id="sf-view"></div><div class="sf-bot"><div class="sf-tb"><button id="sf-back" data-s="back" aria-label="뒤로">${I.back}</button><button id="sf-fwd" data-s="fwd" aria-label="앞으로">${I.fwd}</button><button id="sf-share" data-s="share" aria-label="공유">${I.share}</button><button data-s="book" aria-label="북마크">${I.book}</button><button data-s="tabs" aria-label="탭">${I.tabs}<b id="sf-tn">1</b></button></div></div></div>
<div class="sf-ov" id="sf-edit"><div class="sf-eh"><div class="sf-ep">${I.search}<input id="sf-in" type="text" enterkeyhint="go" autocapitalize="off" autocorrect="off" spellcheck="false" autocomplete="off" placeholder="검색 또는 웹 사이트 이름 입력"></div><button class="sf-cancel" data-s="ecancel">취소</button></div><div class="sf-es" id="sf-es"></div></div>
<div class="sf-ov sf-ts" id="sf-ts"><div class="sf-tt"><button class="sf-cb" data-s="tsearch" aria-label="탭 검색"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="10.500" cy="10.500" r="6.500"/><path d="M15.500 15.500l5 5"/></svg></button><button class="sf-cb" data-s="tmore" aria-label="더보기"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5.500" cy="12" r="1.700"/><circle cx="12" cy="12" r="1.700"/><circle cx="18.500" cy="12" r="1.700"/></svg></button></div><div class="sf-tsr" id="sf-tsr"><input id="sf-tq" type="search" placeholder="탭 검색" autocomplete="off"></div><div class="sf-tg" id="sf-tg"></div><div class="sf-tmb" id="sf-tmb" data-s="tmx"></div><div class="sf-tm" id="sf-tm"></div><div class="sf-tbar"><button class="sf-newtab" data-s="tnew" aria-label="새 탭">${I.plus}</button><button class="sf-cap" data-s="tcap" aria-label="탭 그룹"><span id="sf-tcnt"></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></button><button class="sf-done" data-s="tdone" aria-label="완료"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.500l4.500 4.500L19 7.500"/></svg></button></div></div>
<div class="sf-sb" id="sf-sb" data-s="sx"></div><div class="sf-pn" id="sf-pn"></div><div class="sf-sh" id="sf-sh"></div><div class="sf-toast" id="sf-toast"></div>`;

  const vv = window.visualViewport;
  const fit = () => { if (!el.classList.contains("open")) return; const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop); el.style.bottom = kb + "px"; el.classList.toggle("kb", kb > 80); };
  if (vv) { vv.addEventListener("resize", fit); vv.addEventListener("scroll", fit); }

  let isOpen = false;
  function open() {
    if (isOpen) return; isOpen = true; show(); originFrom(el, "safari");
    el.classList.add("show"); void el.offsetWidth; el.classList.add("open"); el.setAttribute("aria-hidden", "false");
    setTimeout(() => { if (isOpen) screen.classList.add("app-light"); }, 140);
  }
  function close() {
    if (!isOpen) return; isOpen = false; screen.classList.remove("app-light"); el.classList.remove("open", "kb"); el.style.bottom = ""; el.setAttribute("aria-hidden", "true");
    document.activeElement && document.activeElement.blur();
    setTimeout(() => { if (!isOpen) { el.classList.remove("show"); closeEdit(); closeTabs(); closeAll(); } }, 430);
  }
  document.addEventListener("app:open", e => { if (e.detail.id === "safari") open(); });
  document.addEventListener("app:close", close);
  return { open, close, navigate(url) { open(); go(url); }, _t: { md, looksUrl, toUrl } };
})();
window.SafariApp = SafariApp;

/* App-specific styles */
(()=>{const style=document.createElement("style");style.textContent="#saf-app{position:absolute;inset:0;z-index:5;display:none;background:#fff;color:#000;overflow:hidden;opacity:0;transform:scale(.15);border-radius:44px;transition:transform .42s cubic-bezier(.2,.9,.25,1),opacity .22s,border-radius .42s;font-family:var(--font)}\n#saf-app.show{display:block}\n#saf-app.open{opacity:1;transform:none;border-radius:0}\n#saf-app button{font-family:var(--font);background:none;border:0;padding:0;cursor:pointer;color:inherit}\n:where(#saf-app) svg{width:100%;height:100%}\n#saf-app.kb .sf-bot{padding-bottom:8px}\n/* ===== 8차: Safari 검색/탭 화면, 카카오 검색창 ===== */\n#saf-app .sf-ep button{display:none!important}\n#saf-app .sf-ep input::-webkit-search-cancel-button{display:none}\n#saf-app .sf-cancel{flex:none;margin-left:auto;padding:0 2px!important;white-space:nowrap}\n#saf-app .sf-tg{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 12px;padding:calc(env(safe-area-inset-top,0px) + 56px) 14px 16px}\n#saf-app .sf-pvw{aspect-ratio:3/4}\n#saf-app .sf-tx{left:auto;right:6px;top:6px;width:22px;height:22px;padding:5px!important}\n#saf-app .sf-tbar{display:grid;grid-template-columns:72px 1fr 72px;align-items:center;padding:8px 16px calc(env(safe-area-inset-bottom,0px) + 26px)}\n#saf-app .sf-tbar span{text-align:center;white-space:nowrap;writing-mode:horizontal-tb;font-size:15px;font-weight:600;color:#000}\n#saf-app .sf-tbar .sf-newtab{width:32px;height:32px;padding:6px!important;justify-self:start;display:block}\n#saf-app.ts-on{background:transparent}\n#saf-app.ts-on>*:not(#sf-ts){visibility:hidden}\n#saf-app .sf-ov.sf-ts{background:rgba(18,18,22,.58);-webkit-backdrop-filter:blur(28px) saturate(1.3);backdrop-filter:blur(28px) saturate(1.3);color:#fff}\n#saf-app .sf-ov.sf-ts.pv{background:rgba(8,8,12,.84)}\n#saf-app .sf-tt{position:absolute;left:0;right:0;top:calc(env(safe-area-inset-top,0px) + 54px);display:flex;justify-content:space-between;padding:0 16px;z-index:3;pointer-events:none}\n#saf-app .sf-tt>*{pointer-events:auto}\n#saf-app .sf-cb{width:42px;height:42px;border-radius:50%;background:rgba(40,40,46,.55);border:.5px solid rgba(255,255,255,.22);color:#fff!important;display:grid;place-items:center;padding:0!important}\n#saf-app .sf-cb svg{width:20px;height:20px}\n#saf-app .sf-tsr{position:absolute;left:68px;right:68px;top:calc(env(safe-area-inset-top,0px) + 54px);height:42px;z-index:4;display:none}\n#saf-app .sf-tsr.on{display:block}\n#saf-app .sf-tsr input{width:100%;height:42px;border:.5px solid rgba(255,255,255,.22);border-radius:21px;background:rgba(40,40,46,.7);color:#fff;font-size:16px;padding:0 16px;outline:0;font-family:var(--font)}\n#saf-app .sf-tsr input::placeholder{color:rgba(255,255,255,.55)}\n#saf-app .sf-tg{padding:calc(env(safe-area-inset-top,0px) + 114px) 14px calc(env(safe-area-inset-bottom,0px) + 130px);gap:18px 12px}\n#saf-app .sf-pvw{aspect-ratio:5/7;border-radius:16px;box-shadow:0 4px 14px rgba(0,0,0,.35)}\n#saf-app .sf-tc .t{color:#fff;font-size:12.5px;font-weight:600;margin-top:7px}\n#saf-app .sf-tx{width:26px;height:26px;padding:6px!important;right:7px;top:7px;background:rgba(40,40,46,.72)!important}\n#saf-app .sf-te{grid-column:1/-1;text-align:center;color:rgba(255,255,255,.6);padding:80px 0;font-size:15px}\n#saf-app .sf-tbar{position:absolute;left:0;right:0;bottom:0;background:none;border:0;display:grid;grid-template-columns:48px 1fr 48px;gap:12px;align-items:center;padding:8px 16px calc(env(safe-area-inset-bottom,0px) + 32px);z-index:3}\n#saf-app .sf-tbar .sf-newtab{width:48px;height:48px;border-radius:50%;background:rgba(40,40,46,.6);border:.5px solid rgba(255,255,255,.22);color:#fff!important;padding:12px!important;justify-self:start}\n#saf-app .sf-cap{height:48px;justify-self:center;min-width:150px;padding:0 20px;border-radius:24px;background:rgba(0,0,0,.55);border:.5px solid rgba(255,255,255,.2);color:#fff!important;display:flex;align-items:center;justify-content:center;gap:6px}\n#saf-app .sf-cap span{color:#fff;font-size:15px;font-weight:600}\n#saf-app .sf-cap svg{width:12px;height:12px}\n#saf-app .sf-pvw{color:#000}\n#saf-app .sf-tbar .sf-done{width:48px!important;height:48px!important;min-width:48px;border-radius:50%;background:#007aff;color:#fff!important;display:grid;place-items:center;justify-self:end;padding:0!important}\n#saf-app .sf-tbar .sf-done svg{width:24px;height:24px}\n#saf-app .sf-tmb{position:absolute;inset:0;z-index:4;display:none}\n#saf-app .sf-tmb.on{display:block}\n#saf-app .sf-tm{position:absolute;z-index:5;display:none;min-width:210px;background:rgba(40,40,46,.94);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);border-radius:14px;padding:6px;border:.5px solid rgba(255,255,255,.15);color:#fff}\n#saf-app .sf-tm.on{display:block}\n#saf-app .sf-tm.t{right:16px;top:calc(env(safe-area-inset-top,0px) + 102px)}\n#saf-app .sf-tm.b{left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 96px)}\n#saf-app .sf-tm button{display:flex;align-items:center;gap:10px;width:100%;min-height:42px;padding:6px 12px;border-radius:9px;font-size:16px;color:#fff!important;text-align:left}\n#saf-app .sf-tm button:active{background:rgba(255,255,255,.12)}\n#saf-app .sf-tm i{width:16px;height:16px;flex:none;display:block}\n#saf-app .sf-tm svg{width:16px;height:16px}\n#saf-app .sf-tbar .sf-newtab svg{width:20px;height:20px;display:block}\n#saf-app .sf-tbar .sf-done{width:auto;height:32px;justify-self:end;font-size:17px;font-weight:600;white-space:nowrap;padding:0!important;display:block}";document.head.appendChild(style);})();

/* App-specific styles moved from base.css */
(()=>{const s=document.createElement("style");s.textContent="#sf-view{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;touch-action:pan-y;background:#fff;-webkit-overflow-scrolling:touch}\n#sf-view.start{background:#f2f2f7}";document.head.appendChild(s);})();

/* 댓글 목록 아래쪽에 남는 불필요한 구분선 제거 */
(()=>{const s=document.createElement("style");s.textContent="#saf-app .cm .cm-c:last-of-type{border-bottom:0!important}#saf-app .en-sp{border-top:0!important}";document.head.appendChild(s);})();