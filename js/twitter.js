/* ===== twitter.js (integrated) ===== */
/* ===== X ===== */
const XApp = (() => {
  const $ = q => document.querySelector(q), el = $("#x-app"), screen = $("#screen");
  const ic = (p, w = 1.75) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const I = {
    logo: '<svg viewBox="14 13 32 34"><path fill="currentColor" d="M17 16h8.500l6.200 8.600L39 16h4l-9.200 10.600L44 44h-8.500l-6.700-9.300L20.800 44h-4l9.800-11.300z"/><path d="M24 19.500l16 21" stroke="#fff" stroke-width="2" fill="none"/></svg>',
    home: ic('<path d="M3.500 10.500L12 3.500l8.500 7V20a1 1 0 0 1-1 1h-5v-6.500h-5V21h-5a1 1 0 0 1-1-1z"/>'),
    search: ic('<circle cx="10.500" cy="10.500" r="6.500"/><path d="M15.500 15.500l5 5"/>'),
    bell: ic('<path d="M6 16.500V11a6 6 0 0 1 12 0v5.500l1.500 1.500h-15z"/><path d="M10 20.500a2 2 0 0 0 4 0"/>'),
    mail: ic('<rect x="3" y="5.500" width="18" height="13" rx="2.500"/><path d="M3.500 7.500l8.500 6 8.500-6"/>'),
    person: ic('<circle cx="12" cy="8" r="4"/><path d="M4.500 20.500c1-4 4-6 7.500-6s6.500 2 7.500 6"/>'),
    reply: ic('<path d="M20.500 11.500a8.500 8.500 0 0 1-12.300 7.600L3.500 20.500l1.400-4.500A8.500 8.500 0 1 1 20.500 11.500z"/>', 1.6),
    repost: ic('<path d="M4 11V9a3 3 0 0 1 3-3h11M15 3l3 3-3 3"/><path d="M20 13v2a3 3 0 0 1-3 3H6M9 21l-3-3 3-3"/>', 1.6),
    heart: ic('<path d="M12 21s-8.500-5.200-8.500-11.200A4.800 4.800 0 0 1 12 6.900a4.800 4.800 0 0 1 8.500 2.900C20.500 15.800 12 21 12 21z"/>', 1.6),
    heartF: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 21s-8.500-5.200-8.500-11.200A4.800 4.800 0 0 1 12 6.900a4.800 4.800 0 0 1 8.500 2.900C20.500 15.800 12 21 12 21z"/></svg>',
    views: ic('<path d="M5 20v-7M12 20V5M19 20V9"/>', 1.8),
    more: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.600"/><circle cx="12" cy="12" r="1.600"/><circle cx="19" cy="12" r="1.600"/></svg>',
    back: ic('<path d="M19 12H5M11 6l-6 6 6 6"/>', 2),
    x: ic('<path d="M6 6l12 12M18 6L6 18"/>', 2),
    compose: ic('<path d="M12 5v14M5 12h14"/>', 2.2),
    cal: ic('<rect x="4" y="5" width="16" height="15" rx="2.500"/><path d="M4 10h16M8.500 3v4M15.500 3v4"/>', 1.6),
    clock: ic('<circle cx="12" cy="12" r="9"/><path d="M12 7v5.500l3.500 2"/>', 1.6),
  };
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const ME = "_starhwa_";
  /* 사용자: [이름, 색상, 기본 팔로우 여부, 소개] */
  const US = {
    _starhwa_: ["mars", 275, 1, ""],
    "ddinghoo***": ["띵호와", 200, 0, "", 1, 1],
    "tjdghkdbsg***": ["87세박규남", 200, 0, "", 1, 1],
    "hyung1r***": ["개도리", 200, 0, "", 1, 1],
    "myfirstha***": ["ㄲㅇ", 200, 0, "", 1, 1],
    "iwanna***": ["cut (상태:망함)", 200, 0, "", 0, 1],
  };
  const DEF_BIO = "";
  const KEY = "ios-x-v2";
  let S = {}; try { S = (window.HwahoStability ? window.HwahoStability.readJSON(KEY, {}) : JSON.parse(localStorage.getItem(KEY))) || {}; } catch (e) { S = {}; }
  S.like = S.like || {}; S.rt = S.rt || {}; S.fol = S.fol || {}; S.my = Array.isArray(S.my) ? S.my : []; S.me = S.me || {}; S.rec = Array.isArray(S.rec) ? S.rec : [];
  const persist = () => { try { if (window.HwahoStability) window.HwahoStability.writeJSON(KEY, S); else localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const usr = id => { const a = US[id] || [id, 200, 0, ""]; return { id, name: id === ME ? (S.me.name || a[0]) : a[0], hue: a[1], bio: a[3], lock: a[4], blank: a[5] }; };
  const isFol = id => id === ME || (id in S.fol ? !!S.fol[id] : !!(US[id] || [])[2]);
  const now0 = Date.now(), MIN = 6e4;
  /* 게시물: ago(분 전), im: [시드, 가로비, 세로비] */
  const SEED = [
    { id: "s1", u: "_starhwa_", ago: 180000, t: "좋사좋시", im: ["images/Twitter/Posts/1/IMG_7279.jpeg", 1, 1], l: 2780, rt: 897, rp: 8, v: 6820, cm: [] },
    { id: "s2", u: "_starhwa_", ago: 120000, t: "잠이 안온당 야메추 ㄱㄱ", im: null, l: 432, rt: 122, rp: 21, v: 4100, cm: [] },
    { id: "s3", u: "_starhwa_", ago: 60000, t: "사클에 뭐 하나 올라가는데 관심 좀...", im: null, l: 871, rt: 298, rp: 35, v: 12300, cm: [] },
    { id: "s4", u: "_starhwa_", ago: 120, t: "하이이이", im: ["images/Twitter/Posts/2/235F9EEA-238F-419A-BD5A-A203DDA8A0FE.jpeg", 1, 1], l: 1420, rt: 372, rp: 17, v: 17800, cm: [] },
    { id: "t1", u: "ddinghoo***", ago: 0.2, t: "혹시 이거 멜라토닌 먹고 꾸는 꿈?", im: null, l: 3, rt: 0, rp: 0, v: 120, cm: [] },
    { id: "t2", u: "tjdghkdbsg***", ago: 1.0, t: "려러분 이게 무슨일이죠?", im: null, l: 0, rt: 0, rp: 2, v: 26, cm: [] },
    { id: "t3", u: "hyung1r***", ago: 1.6, t: "안어울림 헤어져", im: null, l: 23, rt: 0, rp: 0, v: 430, cm: [] },
    { id: "t4", u: "myfirstha***", ago: 2.4, t: "에휴모르겠다 그냥라방켜서뽀뽀나해라", im: null, l: 1, rt: 0, rp: 12, v: 293, cm: [] },
    { id: "t5", u: "iwanna***", ago: 8.2, t: "잘어울린당\n\nㅇㄹㄱ", im: null, l: 2, rt: 205, rp: 23, v: 1149, cm: [] },
  ];
  /* 내 게시글: 올해 8월부터 4~10일 불규칙 간격 (s20이 가장 오래된 글), 현재보다 미래인 글은 제외 */
  (() => { const y = new Date(now0).getFullYear(), gaps = [6, 4, 9, 5, 7, 10, 4, 8, 5, 6, 9, 4, 7, 5, 10, 6, 8, 4, 7], hm = [[23, 41], [14, 12], [2, 8], [19, 55], [11, 30], [22, 17], [16, 4], [1, 36], [20, 48], [13, 21], [0, 52], [18, 9], [15, 33], [23, 5], [10, 44], [21, 27], [3, 15], [17, 39], [12, 58], [22, 6]];
    let day = 3; for (let n = 20, i = 0; n >= 1; n--, i++) { const p = SEED.find(x => x.id === "s" + n); if (!p) continue; p.ts0 = new Date(y, 7, day, hm[i][0], hm[i][1]).getTime(); day += gaps[i] || 0; }
    { const off = Math.floor((new Date(new Date(now0).getFullYear(), new Date(now0).getMonth(), new Date(now0).getDate()) - new Date(2026, 9, 18)) / 864e5), FX = { s4: [7, 3], s3: [7, 24], s2: [8, 2], s1: [8, 20] }; for (const k in FX) { const p = SEED.find(x => x.id === k); if (!p) continue; const o = new Date(p.ts0 || now0); p.ts0 = new Date(2026, FX[k][0], FX[k][1] + off, o.getHours(), o.getMinutes()).getTime(); } }
    for (let i = SEED.length - 1; i >= 0; i--) if (SEED[i].ts0 && SEED[i].ts0 > now0) SEED.splice(i, 1);
    SEED.forEach(p => { if (p.ts0) p.ago = (now0 - p.ts0) / MIN; }); })();
  const SEEDS = []; SEED.forEach(p => { p.ts = now0 - p.ago * MIN; SEEDS.push(p); p.cm.forEach((c, i) => SEEDS.push({ id: p.id + "r" + i, u: c[0], re: p.id, ts: p.ts + Math.floor((now0 - p.ts) * (i + 1) / (p.cm.length + 1.5)), t: c[1], im: null, l: 3 + i * 4, rt: 0, rp: 0, v: 120 + i * 80 })); });
  const all = () => [...SEEDS, ...S.my], post = id => all().find(p => p.id === id), mine = () => all().filter(p => p.u === ME).sort((a, b) => b.ts - a.ts);
  const nLike = p => p.l + (S.like[p.id] ? 1 : 0), nRt = p => p.rt + (S.rt[p.id] ? 1 : 0), nRp = p => p.rp + S.my.filter(x => x.re === p.id).length;
  const cnt = n => n <= 0 ? "" : n >= 1e4 ? (n / 1e4).toFixed(1).replace(/\.0$/, "") + "만" : n.toLocaleString("ko-KR");
  const tm = ts => { const sc = Math.floor((Date.now() - ts) / 1000), m = Math.floor(sc / 60); if (sc < 60) return Math.max(1, sc) + "초 전"; if (m < 60) return m + "분 전"; if (m < 1440) return Math.floor(m / 60) + "시간 전"; const d = new Date(ts), n = new Date(); return (d.getFullYear() === n.getFullYear() ? "" : d.getFullYear() + "년 ") + (d.getMonth() + 1) + "월 " + d.getDate() + "일"; };
  const full = ts => { const d = new Date(ts), h = d.getHours(); return `${h < 12 ? "오전" : "오후"} ${h % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")} · ${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`; };
  /* 이미지 (비율에 맞춰 생성 → 잘림/왜곡 없음) */
  const AC = {}, R = Math.round;
  const art = (n, w, h) => { const k = n + "_" + w + "_" + h; if (AC[k]) return AC[k]; const W = 800, H = R(W * h / w), a = (n * 67) % 360, b = (a + 50) % 360, c = (a + 160) % 360, t = n % 3; let sh = "";
    if (t === 0) sh = `<circle cx="${R(W * (.25 + (n * 37 % 50) / 100))}" cy="${R(H * .3)}" r="${R(H * .12)}" fill="hsl(${b} 90% 92%)" opacity=".9"/><path d="M0 ${R(H * .7)}Q${R(W * .25)} ${R(H * .55)} ${R(W * .5)} ${R(H * .68)}T${W} ${R(H * .62)}V${H}H0z" fill="hsl(${c} 40% 40%)"/><path d="M0 ${R(H * .86)}Q${R(W * .3)} ${R(H * .76)} ${R(W * .55)} ${R(H * .85)}T${W} ${R(H * .8)}V${H}H0z" fill="hsl(${c} 45% 26%)"/>`;
    else if (t === 1) for (let i = 0; i < 9; i++) sh += `<circle cx="${(i * 131 + n * 53) % W}" cy="${(i * 197 + n * 29) % H}" r="${R(H * (.06 + (i * 23 % 70) / 400))}" fill="hsl(${(a + i * 30) % 360} 80% 85%)" opacity=".45"/>`;
    else sh = [[.08, .42, .17], [.28, .28, .2], [.52, .45, .21]].map(([x, y, bw], j) => `<rect x="${R(W * x)}" y="${R(H * y)}" width="${R(W * bw)}" height="${R(H * (1 - y))}" fill="hsl(${c} ${30 + j * 5}% ${30 - j * 3}%)"/>`).join("") + [0, 1, 2, 3].map(i => `<rect x="${R(W * .31 + (i % 2) * W * .07)}" y="${R(H * (.34 + i * .14))}" width="${R(W * .03)}" height="${R(H * .07)}" fill="hsl(50 90% 75%)" opacity=".8"/>`).join("");
    return AC[k] = "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${a} 70% 62%)"/><stop offset="1" stop-color="hsl(${b} 75% 80%)"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/>${sh}</svg>`); };
  const LOCK = `<svg viewBox="0 0 24 24" fill="currentColor" style="flex:none;width:16px;height:16px;margin-left:-1px"><path d="M17 9V7a5 5 0 0 0-10 0v2H5v12h14V9zm-8-2a3 3 0 0 1 6 0v2H9z"/></svg>`;
  const X_PROFILE_FALLBACK = {
    "_starhwa_": "IMG_7064.jpeg",
    "no1likeme8_8": "IMG_7065.jpeg",
    "notyourbro": "IMG_7066.jpeg",
    "born2.flex": "IMG_7068.jpeg",
    "fixon_n_on": "IMG_7072.jpeg",
    "han.gangster": "E61603E2-7ED0-4D18-B05F-ABE9BC477624.png",
    "0fficiallyheytaaaaa": "4DFB4DC8-305C-46AF-A502-DADB9385E6C4.png",
    "hoodie.hooligan": "229FB30C-0EDC-48D6-A1D0-BDE553DFDD46.png",
    "himothy._": "3111F199-6B45-451B-80CD-6B4B281AD868.png",
    "opps.on.read": "02C80B49-B038-4C9D-9CEA-65F2544D4E50.png",
    "private.ego": "3B08977C-3980-44AE-895D-D9762DC6D4DF.png"
  };
  const X_PROFILE_FILES = {
    "_starhwa_": "IMG_7232.jpeg",
    "ddinghoo***": "IMG_4181.jpeg",
    "hyung1r***": "IMG_7231.jpeg",
    "iwanna***": "IMG_7207.jpeg",
    "myfirstha***": "IMG_7208.jpeg",
    "tjdghkdbsg***": "IMG_9477.jpeg"
  };
  const av = (u, s) => {
    const file = X_PROFILE_FILES[u.id];
    const fallback = X_PROFILE_FALLBACK[u.id];
    const shared = window.HwahoIdentity && window.HwahoIdentity.avatar(u.id);
    const base = u.id === "_starhwa_" ? "./images/app/Twitter/Profile/_starhwa_/IMG_7232.jpeg?v=20261020-8" : (file ? "./images/app/Twitter/Profile/" + encodeURIComponent(u.id) + "/" + encodeURIComponent(file) + "?v=20261020-8" : (shared || ""));
    const fallbackUrl = u.id === "_starhwa_" ? "./images/app/Instagram/Profile/_starhwa_/IMG_7064.jpeg?v=20261020-8" : (fallback ? "./images/app/Instagram/Profile/" + encodeURIComponent(u.id) + "/" + encodeURIComponent(fallback) + "?v=20261020-8" : "");
    const img = base ? "<img alt=\"\" src=\"" + base + "\" style=\"position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit\" onerror=\"" + (fallbackUrl ? "this.onerror=null;this.src='" + fallbackUrl + "'" : "this.style.display='none'") + "\">" : "";
    return "<div class=\"x-av\" style=\"position:relative;overflow:hidden;width:" + s + "px;height:" + s + "px;background:transparent\">" + img + "</div>";
  };
  const txt = t => esc(t).replace(/(#[\p{L}\p{N}_]+|@[A-Za-z0-9_]+)/gu, m => `<span class="x-lk" data-g="tag" data-q="${m}">${m}</span>`);
  const imHtml = im => `<div class="x-im" style="aspect-ratio:${im[1]}/${im[2]}"><img src="${typeof im[0] === "string" ? im[0] : art(im[0], im[1], im[2])}" width="${im[1] * 100}" height="${im[2] * 100}" alt="" draggable="false"></div>`;
  const actHtml = p => { const lk = !!S.like[p.id], rt = !!S.rt[p.id];
    return `<button class="x-a rp" data-g="reply" aria-label="답글">${I.reply}<span>${cnt(nRp(p))}</span></button><button class="x-a rt${rt ? " on" : ""}"${usr(p.u).lock ? ' disabled style="opacity:.3;pointer-events:none"' : ""} data-g="rt" aria-label="재게시" aria-pressed="${rt}">${I.repost}<span>${cnt(nRt(p))}</span></button><button class="x-a lk${lk ? " on" : ""}" data-g="like" aria-label="좋아요" aria-pressed="${lk}">${lk ? I.heartF : I.heart}<span>${cnt(nLike(p))}</span></button><span class="x-a vw" aria-label="조회수">${I.views}<span>${cnt(p.v)}</span></span>`; };
  const postHtml = (p, o = {}) => { const u = usr(p.u), re = p.re && o.ctx ? post(p.re) : null;
    return `<article class="x-post${o.det ? " det" : ""}" data-id="${p.id}"><div class="x-pr">${av(u, 40)}</div><div class="x-pb"><div class="x-ph"><b>${esc(u.name)}</b>${u.lock ? LOCK : ""}<span>@${u.id} · ${tm(p.ts)}</span><i class="x-mo" data-g="noop">${I.more}</i></div>${re ? `<div class="x-rc">@${re.u}님에게 보내는 답글</div>` : ""}<div class="x-tx">${txt(p.t)}</div>${p.im ? imHtml(p.im) : ""}${o.det ? `<div class="x-dm">${full(p.ts)} · 조회 ${p.v.toLocaleString("ko-KR")}회</div>` : ""}<div class="x-ac">${actHtml(p)}</div></div></article>`; };

  /* ---- 상태 ---- */
  let tab = "home", prevTab = "home", ftab = "fy", ptab = "post", sMode = "home", sTab = "top", sq = "", detId = null, cmp = null, isOpen = false, toastT = null;
  const nav = () => { const b = (k, i, cls = "") => `<button ${k ? `data-g="nav" data-t="${k}"` : ""} class="${cls}${tab === k ? " on" : ""}" aria-label="${k || "비활성"}">${tab === k && k === "home" ? I.home : i}</button>`;
    return b("home", I.home, "nfill") + b("", I.search) + b("", I.bell) + b("", I.mail); };
  const feedList = () => { let l = all().filter(p => !p.re && !(p.u === ME && SEEDS.includes(p))).sort((a, b) => b.ts - a.ts); { const i4 = l.findIndex(p => p.id === "t4"), i5 = l.findIndex(p => p.id === "t5"); if (i4 >= 0 && i5 >= 0 && i5 !== i4 + 1) { const [c] = l.splice(i5, 1); l.splice(l.findIndex(p => p.id === "t4") + 1, 0, c); } } if (ftab === "fol") l = l.filter(p => isFol(p.u)); return l; };
  function renderFeed() { const l = feedList(); $("#x-feed").innerHTML = l.length ? l.map(p => postHtml(p)).join("") : `<div class="x-em"><b>아직 게시물이 없어요</b>팔로우한 계정의 게시물이 여기에 표시됩니다.</div>`; document.querySelectorAll("#x-ftabs button").forEach(b => b.classList.toggle("on", b.dataset.k === ftab)); }
  /* ---- 프로필 ---- */
  const myCount = () => mine().length, folCnt = () => Object.keys(US).filter(id => id !== ME && isFol(id)).length;
  function renderProf() { const u = usr(ME), l = mine(), bio = S.me.bio != null ? S.me.bio : DEF_BIO;
    $("#x-pn").textContent = u.name; $("#x-pc").textContent = `게시물 ${myCount() + 0}개`;
    $("#x-pinfo").innerHTML = `<div class="x-cv" style="background:#000"></div><div class="x-pi"><div class="x-pa">${av(u, 80)}</div><button class="x-eb" type="button" aria-label="프로필 편집" disabled tabindex="-1" style="color:#000;pointer-events:none">프로필 편집</button></div><div class="x-pn"><b>${esc(u.name)}</b><span>@${ME}</span></div>${bio.trim() ? `<div class="x-bio">${txt(bio)}</div>` : ""}<div class="x-jd">${I.cal}<span>2026년 8월 가입</span></div><div class="x-fc"><span><b>${folCnt()}</b> 팔로잉</span><span><b>5,923</b> 팔로워</span></div>`;
    document.querySelectorAll("#x-ptabs button").forEach(b => b.classList.toggle("on", b.dataset.k === ptab));
    let h = "";
    if (ptab === "post") { const a = l.filter(p => !p.re); h = a.length ? a.map(p => postHtml(p)).join("") : `<div class="x-em"><b>아직 게시물이 없어요</b>게시한 글이 여기에 표시됩니다.</div>`; }
    else if (ptab === "rep") { const a = l.filter(p => p.re); h = a.length ? a.map(p => postHtml(p, { ctx: 1 })).join("") : `<div class="x-em"><b>아직 답글이 없어요</b>게시물에 남긴 답글이 여기에 표시됩니다.</div>`; }
    else { const a = l.filter(p => p.im); if (!a.length) h = `<div class="x-em"><b>아직 미디어가 없어요</b>이미지가 있는 게시물이 여기에 표시됩니다.</div>`; else { const cols = [[], []]; a.forEach((p, i) => cols[i % 2].push(p)); h = `<div class="x-mg">${cols.map(c => `<div>${c.map(p => `<button data-g="open" data-id="${p.id}" aria-label="게시물 열기" style="aspect-ratio:${p.im[1]}/${p.im[2]}"><img src="${art(p.im[0], p.im[1], p.im[2])}" alt="" draggable="false"></button>`).join("")}</div>`).join("")}</div>`; } }
    $("#x-pbody").innerHTML = h; }
  /* ---- 검색 / 트렌드 ---- */
  const TR = [["mars","음악",184000],["작업실","음악",58300],["신곡","음악",41200],["새벽","일상",31400],["쇼미","엔터테인먼트",27600],["무대","음악",12900]];
  const KW = ["컴백", "직캠", "포카", "티켓팅", "콘서트", "팬싸", "응원봉", "음악방송"];
  const norm = s => s.trim().toLowerCase();
  const score = p => nLike(p) + nRt(p) * 2 + nRp(p);
  const hit = (p, q) => { const t = p.t.toLowerCase(); if (q.startsWith("@")) return p.u.toLowerCase().includes(q.slice(1)); if (q.startsWith("#")) return t.includes(q); return t.includes(q) || usr(p.u).name.toLowerCase().includes(q) || p.u.toLowerCase().includes(q); };
  const trRow = (t, i) => `<button class="x-tr" data-g="sgo" data-q="${t[0]}"><div><small>${i + 1} · ${t[1]} · 트렌드 중</small><b>${t[0]}</b><small>${cnt(t[2])} 게시물</small></div><i>${I.more}</i></button>`;
  function renderSearch() {
    $("#x-sl").innerHTML = sMode === "home" ? `<button class="x-sl" data-g="me" aria-label="프로필">${av(usr(ME), 32)}</button>` : `<button class="x-sl" data-g="sback" aria-label="뒤로">${I.back}</button>`;
    $("#x-qc").hidden = !sq; const fl = $("#x-sfil"); let h = "";
    if (sMode === "res") { fl.style.display = "flex"; fl.innerHTML = [["top", "인기"], ["latest", "최신"], ["people", "사용자"], ["media", "미디어"]].map(([k, l]) => `<button data-g="sfil" data-k="${k}" class="${sTab === k ? "on" : ""}"><span>${l}</span></button>`).join(""); } else { fl.style.display = "none"; fl.innerHTML = ""; }
    if (sMode === "home") {
      h = `<div class="x-h2">나를 위한 트렌드</div>${TR.map(trRow).join("")}<div class="x-sec"><div class="x-h2">인기 키워드</div><div class="x-kw">${KW.map(k => `<button data-g="sgo" data-q="${esc(k)}">${esc(k)}</button>`).join("")}</div></div><div class="x-sec"><div class="x-h2">관련 게시물</div>${all().filter(p => !p.re).sort((a, b) => score(b) - score(a)).slice(0, 4).map(p => postHtml(p)).join("")}</div>`;
    } else if (sMode === "sug") {
      const q = norm(sq);
      if (!q) h = S.rec.length ? `<div class="x-h2">최근 검색</div>` + S.rec.map(r => `<div class="x-sg" style="padding:0"><button class="x-sg" data-g="sgo" data-q="${esc(r)}">${I.clock}<span>${esc(r)}</span></button><button class="x-rx" data-g="rdel" data-q="${esc(r)}" aria-label="삭제">${I.x}</button></div>`).join("") : `<div class="x-em"><b>검색어를 입력하세요</b>키워드, 해시태그, 사용자 이름으로 검색해 보세요.</div>`;
      else { h = `<button class="x-sg" data-g="sgo" data-q="${esc(sq.trim())}">${I.search}<span>“${esc(sq.trim())}” 검색</span></button>`;
        h += TR.filter(t => t[0].toLowerCase().includes(q)).map(t => `<button class="x-sg" data-g="sgo" data-q="${t[0]}">${I.search}<span>${t[0]} <small style="color:#536471">· ${cnt(t[2])} 게시물</small></span></button>`).join("");
        h += Object.keys(US).filter(id => (usr(id).name + id).toLowerCase().includes(q.replace(/^@/, ""))).slice(0, 4).map(id => `<button class="x-pp" data-g="sgo" data-q="@${id}" style="width:100%;text-align:left">${av(usr(id), 40)}<div><b>${esc(usr(id).name)}</b><small>@${id}</small></div></button>`).join(""); }
    } else {
      const q = norm(sq); let l = all().filter(p => !p.re && hit(p, q));
      if (sTab === "people") { const us = Object.keys(US).filter(id => (usr(id).name + " " + id).toLowerCase().includes(q.replace(/^[#@]/, ""))); h = us.map(id => `<div class="x-pp">${av(usr(id), 40)}<div><b>${esc(usr(id).name)}</b><small>@${id}${id === ME ? "" : ""}</small>${usr(id).bio || id === ME ? `<small>${esc(id === ME ? (S.me.bio != null ? S.me.bio : DEF_BIO).split("\n")[0] : usr(id).bio)}</small>` : ""}</div>${id === ME ? "" : `<button class="x-fb${isFol(id) ? " on" : ""}" data-g="follow" data-u="${id}">${isFol(id) ? "팔로잉" : "팔로우"}</button>`}</div>`).join(""); }
      else { if (sTab === "media") l = l.filter(p => p.im); l = sTab === "latest" ? l.sort((a, b) => b.ts - a.ts) : l.sort((a, b) => score(b) - score(a)); h = l.map(p => postHtml(p)).join(""); }
      if (!h) h = `<div class="x-em"><b>“${esc(sq.trim())}” 검색 결과가 없습니다</b>다른 키워드로 검색해 보세요.</div>`;
    }
    $("#x-sb").innerHTML = h; }
  function doSearch(q) { q = (q || "").trim(); if (!q) return; sq = q; $("#x-q").value = q; S.rec = [q, ...S.rec.filter(x => x !== q)].slice(0, 8); persist(); sMode = "res"; sTab = "top"; $("#x-q").blur(); renderSearch(); $("#x-sb").scrollTop = 0; }
  /* ---- 상세 ---- */
  function renderDet() { const p = post(detId); if (!p) return; const rs = all().filter(x => x.re === p.id).sort((a, b) => a.ts - b.ts);
    $("#x-det").innerHTML = `<div class="x-bar"><div class="x-br"><button class="x-bk" data-g="dback" aria-label="뒤로">${I.back}</button><div class="x-bt"><b>게시물</b></div></div></div><div class="x-sc">${postHtml(p, { det: 1, ctx: 1 })}${rs.map(r => postHtml(r)).join("")}</div><div class="x-rb">${av(usr(ME), 32)}<button data-g="reply" data-id="${p.id}">답글 게시하기</button></div>`; }
  function openDet(id) { detId = id; renderDet(); $("#x-det").classList.add("on"); }
  /* ---- 시트 (작성 / 프로필 편집) ---- */
  const sh = () => $("#x-sh");
  function openCmp(re) { cmp = { re }; const rp = re ? post(re) : null;
    sh().innerHTML = `<div class="x-ch"><button class="x-cc" data-g="shx">취소</button><button class="x-cb" id="x-cp" data-g="cpost" disabled>${re ? "답글" : "게시하기"}</button></div>${rp ? `<div class="x-cctx"><b>@${rp.u}</b>님에게 보내는 답글</div>` : ""}<div class="x-cbd">${av(usr(ME), 40)}<textarea id="x-ct" rows="4" maxlength="400" placeholder="${re ? "답글을 게시하세요" : "무슨 일이 일어나고 있나요?"}"></textarea></div><div class="x-cf"><span id="x-cn">0/280</span></div>`;
    sh().classList.add("on"); setTimeout(() => { const t = $("#x-ct"); if (t) t.focus(); }, 60); }
  function openEdit() { cmp = { edit: 1 }; const bio = S.me.bio != null ? S.me.bio : DEF_BIO;
    sh().innerHTML = `<div class="x-ch"><button class="x-cc" data-g="shx">취소</button><b class="x-ct">프로필 편집</b><button class="x-cb" data-g="esave">저장</button></div><div class="x-ed"><label>이름<input id="x-en" maxlength="30" value="${esc(usr(ME).name)}" autocomplete="off"></label><label>자기소개<textarea id="x-eb" rows="4" maxlength="160">${esc(bio)}</textarea></label></div>`; sh().classList.add("on"); }
  function closeSh() { sh().classList.remove("on"); sh().innerHTML = ""; cmp = null; el.classList.remove("kb"); }
  function toast(m) { const t = $("#x-toast"); t.textContent = m; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 1800); }
  function sync(id) { const p = post(id); if (!p) return; document.querySelectorAll(`#x-app .x-post[data-id="${id}"]`).forEach(a => { a.querySelector(".x-ac").innerHTML = actHtml(p); }); }
  function refreshAll() { renderFeed(); renderProf(); renderSearch(); if (detId && $("#x-det").classList.contains("on")) renderDet(); }
  function cmpPost() { const ta = $("#x-ct"), t = ta ? ta.value.trim() : ""; if (!t || [...t].length > 280 || !cmp) return; const re = cmp.re, p = { id: "m" + Date.now().toString(36), u: ME, ts: Date.now(), t, im: null, l: 0, rt: 0, rp: 0, v: 1 }; if (re) p.re = re; S.my.push(p); persist(); closeSh();
    if (re) { sync(re); if ($("#x-det").classList.contains("on")) renderDet(); renderProf(); toast("답글을 게시했습니다"); } else { renderFeed(); renderProf(); $("#x-hsc").scrollTop = 0; toast("게시물을 게시했습니다"); } }
  /* ---- 화면 ---- */
  el.innerHTML = `<div class="x-v on" data-v="home" id="x-home"><div class="x-hd"><div class="x-hr"><button class="x-hav" data-g="me" aria-label="프로필" id="x-hav"></button><div class="x-logo">${I.logo}</div><span class="x-sp"></span></div><div class="x-tabs" id="x-ftabs"><button data-g="ftab" data-k="fy"><span>추천</span></button><button data-g="ftab" data-k="fol"><span>팔로잉</span></button></div></div><div class="x-sc" id="x-hsc"><div id="x-feed"></div></div><button class="x-fab" data-g="compose" aria-label="게시하기">${I.compose}</button></div>
<div class="x-v" data-v="search" id="x-search"><div class="x-hd"><div class="x-sr"><span id="x-sl" style="display:contents"></span><label class="x-sf">${I.search}<input id="x-q" type="text" placeholder="검색" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search"><button class="x-qc" id="x-qc" data-g="qclr" aria-label="지우기" hidden>${I.x}</button></label></div><div class="x-fl" id="x-sfil" style="display:none"></div></div><div class="x-sc" id="x-sb"></div></div>
<div class="x-v" data-v="me" id="x-prof"><div class="x-bar"><div class="x-br"><button class="x-bk" data-g="pback" aria-label="뒤로 가기">${I.back}</button><div class="x-bt"><b id="x-pn"></b><small id="x-pc"></small></div></div></div><div class="x-sc" id="x-psc"><div id="x-pinfo"></div><div class="x-pt" id="x-ptabs">${[["post", "게시물"], ["rep", "답글"], ["media", "미디어"]].map(([k, l]) => `<button data-g="${k === "post" ? "ptab" : "noop"}" data-k="${k}"${k !== "post" ? ' disabled aria-disabled="true" style="pointer-events:none;opacity:.45"' : ""}><span>${l}</span></button>`).join("")}</div><div id="x-pbody"></div></div></div>
<div class="x-v x-det" id="x-det"></div><nav class="x-nav" id="x-nav"></nav><div class="x-sh" id="x-sh"></div><div class="x-toast" id="x-toast" role="status"></div>`;
  $("#x-hav").innerHTML = av(usr(ME), 32);
  function setTab(t) { if (t === tab) { const s = t === "home" ? $("#x-hsc") : t === "search" ? $("#x-sb") : $("#x-psc"); s.scrollTo({ top: 0, behavior: "smooth" }); $("#x-det").classList.remove("on"); return; }
    if (t === "me") prevTab = tab; tab = t; document.querySelectorAll("#x-app .x-v[data-v]").forEach(v => v.classList.toggle("on", v.dataset.v === t)); $("#x-det").classList.remove("on"); $("#x-nav").innerHTML = nav(); }
  const openImage = src => { if (!src) return; let ov = document.getElementById("x-image-viewer"); if (!ov) { ov = document.createElement("div"); ov.id = "x-image-viewer"; ov.innerHTML = '<button type="button" aria-label="닫기">×</button><img alt="">'; document.body.appendChild(ov); ov.addEventListener("click", () => ov.classList.remove("on")); } ov.querySelector("img").src = src; ov.classList.add("on"); };
  el.addEventListener("click", e => { const photo = e.target.closest(".x-im img, .x-cv img"); if (photo && photo.src) { e.preventDefault(); openImage(photo.src); return; } const t = e.target.closest("[data-g]");
    if (!t) return;
    const d = t.dataset, pid = () => { const a = t.closest(".x-post"); return a ? a.dataset.id : d.id; };
    switch (d.g) {
      case "nav": setTab(d.t); break;
      case "me": setTab("me"); break;
      case "pback": setTab(prevTab || "home"); break;
      case "ftab": break;
      case "ptab": ptab = d.k; renderProf(); break;
      case "like": { const id = pid(); S.like[id] = !S.like[id]; persist(); sync(id); if (S.like[id]) document.querySelectorAll(`#x-app .x-post[data-id="${id}"] .x-a.lk`).forEach(b => b.classList.add("pop")); if (tab === "search") renderSearchKeep(); break; }
      case "rt": { const id = pid(); S.rt[id] = !S.rt[id]; persist(); sync(id); if (S.rt[id]) document.querySelectorAll(`#x-app .x-post[data-id="${id}"] .x-a.rt`).forEach(b => b.classList.add("pop")); break; }
      case "reply": openCmp(pid()); break;
      case "compose": openCmp(null); break;
      case "open": break;
      case "dback": $("#x-det").classList.remove("on"); break;
      case "tag": break;
      case "sgo": doSearch(d.q); break;
      case "sback": sMode = "home"; sq = ""; $("#x-q").value = ""; $("#x-q").blur(); renderSearch(); break;
      case "qclr": sq = ""; $("#x-q").value = ""; sMode = "sug"; renderSearch(); $("#x-q").focus(); break;
      case "sfil": sTab = d.k; renderSearch(); $("#x-sb").scrollTop = 0; break;
      case "rdel": S.rec = S.rec.filter(x => x !== d.q); persist(); renderSearch(); break;
      case "follow": S.fol[d.u] = !isFol(d.u); persist(); renderSearch(); renderProf(); break;
      case "pedit": openEdit(); break;
      case "shx": closeSh(); break;
      case "cpost": cmpPost(); break;
      case "esave": { const n = $("#x-en").value.trim(); if (!n) { toast("이름을 입력하세요"); break; } S.me = { name: n, bio: $("#x-eb").value }; persist(); closeSh(); refreshAll(); $("#x-hav").innerHTML = av(usr(ME), 32); toast("프로필을 저장했습니다"); break; }
    } });
  function renderSearchKeep() { const s = $("#x-sb").scrollTop; renderSearch(); $("#x-sb").scrollTop = s; }
  el.addEventListener("input", e => { const i = e.target;
    if (i.id === "x-q") { sq = i.value; sMode = "sug"; renderSearch(); }
    else if (i.id === "x-ct") { i.style.height = "auto"; i.style.height = Math.max(120, i.scrollHeight) + "px"; const n = [...i.value.trim()].length, c = $("#x-cn"), b = $("#x-cp"); c.textContent = n + "/280"; c.classList.toggle("bad", n > 280); b.disabled = !n || n > 280; } });
  el.addEventListener("focusin", e => { if (e.target.id === "x-q" && sMode === "home") { sMode = "sug"; renderSearch(); } });
  el.addEventListener("keydown", e => { if (e.target.id === "x-q" && e.key === "Enter" && !e.isComposing) { e.preventDefault(); doSearch(e.target.value); } });
  const vv = window.visualViewport, fit = () => { if (!isOpen || !vv) return; const k = Math.max(0, window.innerHeight - vv.height - vv.offsetTop); el.style.bottom = k + "px"; el.classList.toggle("kb", k > 80 && !!cmp); };
  if (vv) { vv.addEventListener("resize", fit); vv.addEventListener("scroll", fit); }
  renderFeed(); renderProf(); renderSearch(); $("#x-nav").innerHTML = nav();
  function open() { if (isOpen) return; isOpen = true; originFrom(el, "x"); el.classList.add("show"); void el.offsetWidth; el.classList.add("open"); el.setAttribute("aria-hidden", "false"); setTimeout(() => { if (isOpen) screen.classList.add("app-light"); }, 140); }
  function close() { if (!isOpen) return; isOpen = false; screen.classList.remove("app-light"); el.classList.remove("open"); el.setAttribute("aria-hidden", "true"); setTimeout(() => { if (!isOpen) { el.classList.remove("show"); closeSh(); el.style.bottom = ""; } }, 430); }
  document.addEventListener("app:open", e => { if (e.detail.id === "x") open(); });
  document.addEventListener("app:close", close);
  return { open, close };
})();

/* Styles extracted from the shared stylesheet */
(()=>{const style=document.createElement("style");style.textContent="/* ===== 12차: X ===== */\n#x-app{--xn:calc(49px + env(safe-area-inset-bottom,0px) + 26px);position:absolute;inset:0;z-index:5;display:none;background:#fff;color:#0f1419;overflow:hidden;opacity:0;transform:scale(.15);border-radius:44px;transition:transform .42s cubic-bezier(.2,.9,.25,1),opacity .22s,border-radius .42s;font-family:var(--font);font-size:15px;line-height:20px}\n#x-app.show{display:block}\n#x-app.open{opacity:1;transform:none;border-radius:0}\n#x-app button{font-family:var(--font);background:none;border:0;padding:0;cursor:pointer;color:inherit;-webkit-tap-highlight-color:transparent}\n#x-app svg{width:100%;height:100%;display:block}\n#x-app .x-v{position:absolute;left:0;right:0;top:0;bottom:var(--xn);display:none;flex-direction:column;background:#fff}\n#x-app .x-v.on{display:flex}\n#x-app .x-det{z-index:3}\n#x-app .x-hd{flex:none;padding-top:calc(env(safe-area-inset-top,0px) + 54px);background:#fff;border-bottom:1px solid #eff3f4}\n#x-app .x-hr{height:44px;display:flex;align-items:center;justify-content:space-between;padding:0 16px}\n#x-app .x-hav{width:32px;height:32px;border-radius:50%;overflow:hidden;flex:none}\n#x-app .x-sp{width:32px;flex:none}\n#x-app .x-logo{width:26px;height:26px}\n#x-app .x-tabs{display:flex}\n#x-app .x-tabs button{flex:1;height:53px;display:grid;place-items:center;font-size:15px;color:#536471;font-weight:500}\n#x-app .x-tabs button span{position:relative;height:53px;line-height:53px}\n#x-app .x-tabs button.on{color:#0f1419;font-weight:700}\n#x-app .x-tabs button.on span::after{content:\"\";position:absolute;left:0;right:0;bottom:0;height:4px;border-radius:2px;background:#1d9bf0}\n#x-app .x-sc{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;touch-action:pan-y;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}\n#x-app .x-av{border-radius:50%;display:grid;place-items:center;color:#fff;font-weight:700;flex:none;aspect-ratio:1/1;overflow:hidden}\n#x-app .x-post{display:flex;gap:12px;padding:12px 16px;border-bottom:1px solid #eff3f4;cursor:pointer}\n#x-app .x-pr{flex:none}\n#x-app .x-pb{flex:1;min-width:0}\n#x-app .x-ph{display:flex;align-items:center;gap:4px;min-width:0;line-height:20px}\n#x-app .x-ph b{flex:0 1 auto;min-width:0;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n#x-app .x-ph span{flex:0 100 auto;min-width:0;color:#536471;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n#x-app .x-mo{margin-left:auto;flex:none;width:18px;height:18px;color:#536471}\n#x-app .x-rc{color:#536471;font-size:13px;line-height:18px}\n#x-app .x-tx{white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;line-height:1.35;margin:0;padding:0}\n#x-app .x-lk{color:#1d9bf0}\n#x-app .x-im{margin-top:12px;width:100%;border-radius:16px;overflow:hidden;border:1px solid #cfd9de;background:#eff3f4}\n#x-app .x-im img{width:100%;height:100%;display:block;object-fit:cover;-webkit-user-drag:none}\n#x-app .x-ac{display:flex;justify-content:space-between;margin-top:2px;max-width:420px;margin-right:8px}\n#x-app .x-a{display:flex;align-items:center;gap:2px;color:#536471;font-size:13px;min-width:56px;height:32px;margin-left:-8px;padding-left:8px}\n#x-app .x-a svg{width:19px;height:19px;flex:none}\n#x-app .x-a span{min-width:12px;padding-left:4px}\n#x-app .x-a.rt.on{color:#00ba7c}\n#x-app .x-a.rt.on svg{stroke-width:2.2}\n#x-app .x-a.lk.on{color:#f91880}\n#x-app .x-a.pop svg{animation:xpop .3s cubic-bezier(.2,1.6,.4,1)}\n#x-app .x-dm{margin-top:12px;color:#536471;font-size:15px}\n#x-app .x-fab{position:absolute;right:16px;bottom:16px;width:56px;height:56px;border-radius:50%;background:#1d9bf0;color:#fff;box-shadow:0 2px 10px rgba(0,0,0,.25);display:grid;place-items:center;z-index:4}\n#x-app .x-fab svg{width:26px;height:26px}\n#x-app .x-nav{position:absolute;left:0;right:0;bottom:0;z-index:4;height:var(--xn);display:flex;align-items:flex-start;justify-content:space-around;padding:0 6px;background:#fff;border-top:1px solid #eff3f4}\n#x-app .x-nav button{width:52px;height:49px;display:grid;place-items:center;color:#0f1419}\n#x-app .x-nav button svg{width:26px;height:26px}\n#x-app .x-nav button.on svg{stroke-width:2.4}\n#x-app .x-nav .nfill.on svg{fill:currentColor}\n#x-app .x-bar{flex:none;padding-top:calc(env(safe-area-inset-top,0px) + 54px);background:#fff}\n#x-app .x-br{height:53px;display:flex;align-items:center;gap:20px;padding:0 16px;border-bottom:1px solid #eff3f4}\n#x-app .x-bk{width:22px;height:22px;flex:none}\n#x-app .x-bt{flex:1;min-width:0;line-height:1.15}\n#x-app .x-bt b{display:block;font-size:20px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n#x-app .x-bt small{font-size:13px;color:#536471}\n#x-app .x-cv{aspect-ratio:3/1;background:#cfd9de;overflow:hidden}\n#x-app .x-cv img{width:100%;height:100%;display:block;object-fit:cover}\n#x-app .x-pi{display:flex;justify-content:space-between;align-items:flex-start;padding:0 16px}\n#x-app .x-pa{width:88px;height:88px;border-radius:50%;border:4px solid #fff;background:#fff;margin-top:-44px;overflow:hidden;flex:none}\n#x-app .x-eb{margin-top:12px;height:36px;padding:0 16px;border:1px solid #cfd9de;border-radius:18px;font-weight:700;font-size:15px}\n#x-app .x-pn{padding:4px 16px 0}\n#x-app .x-pn b{display:block;font-size:20px;line-height:24px;font-weight:800}\n#x-app .x-pn span{color:#536471}\n#x-app .x-bio{padding:12px 16px 0;white-space:pre-wrap;overflow-wrap:anywhere}\n#x-app .x-jd{display:flex;align-items:center;gap:4px;padding:12px 16px 0;color:#536471}\n#x-app .x-jd svg{width:18px;height:18px}\n#x-app .x-fc{display:flex;gap:20px;padding:12px 16px 16px;color:#536471}\n#x-app .x-fc b{color:#0f1419;font-weight:700}\n#x-app .x-pt{position:sticky;top:0;z-index:2;display:flex;background:#fff;border-bottom:1px solid #eff3f4;border-top:0}\n#x-app .x-pt button{flex:1;height:53px;color:#536471;font-weight:500;display:grid;place-items:center}\n#x-app .x-pt button span{position:relative;height:53px;line-height:53px}\n#x-app .x-pt button.on{color:#0f1419;font-weight:700}\n#x-app .x-pt button.on span::after{content:\"\";position:absolute;left:0;right:0;bottom:0;height:4px;border-radius:2px;background:#1d9bf0}\n#x-app .x-mg{display:flex;gap:4px;padding:4px}\n#x-app .x-mg>div{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}\n#x-app .x-mg button{display:block;width:100%;border-radius:6px;overflow:hidden;background:#eff3f4}\n#x-app .x-mg img{width:100%;height:100%;display:block;object-fit:cover}\n#x-app .x-em{padding:40px 32px;text-align:center;color:#536471}\n#x-app .x-em b{display:block;font-size:24px;line-height:28px;font-weight:800;color:#0f1419;margin-bottom:8px}\n#x-app .x-sr{display:flex;align-items:center;gap:12px;height:53px;padding:0 16px}\n#x-app .x-sl{flex:none;width:32px;height:32px;display:grid;place-items:center}\n#x-app .x-sl svg{width:22px;height:22px}\n#x-app .x-sl .x-av{width:32px;height:32px}\n#x-app .x-sf{flex:1;min-width:0;height:40px;border-radius:20px;background:#eff3f4;display:flex;align-items:center;gap:10px;padding:0 14px;color:#536471}\n#x-app .x-sf>svg{width:18px;height:18px;flex:none}\n#x-app .x-sf input{flex:1;min-width:0;border:0;background:none;outline:0;font-size:16px;color:#0f1419;height:40px;padding:0}\n#x-app .x-sf input::placeholder{color:#536471}\n#x-app .x-qc{width:20px;height:20px;border-radius:50%;background:#1d9bf0;color:#fff;display:grid!important;place-items:center;flex:none}\n#x-app .x-qc[hidden]{display:none!important}\n#x-app .x-qc svg{width:12px;height:12px;stroke-width:3}\n#x-app .x-fl{display:flex;overflow-x:auto;scrollbar-width:none;border-top:1px solid #eff3f4}\n#x-app .x-fl::-webkit-scrollbar{display:none}\n#x-app .x-fl button{flex:1 0 auto;min-width:25%;height:53px;color:#536471;font-weight:500;display:grid;place-items:center}\n#x-app .x-fl button span{position:relative;height:53px;line-height:53px}\n#x-app .x-fl button.on{color:#0f1419;font-weight:700}\n#x-app .x-fl button.on span::after{content:\"\";position:absolute;left:0;right:0;bottom:0;height:4px;border-radius:2px;background:#1d9bf0}\n#x-app .x-h2{padding:12px 16px;font-size:20px;line-height:24px;font-weight:800}\n#x-app .x-tr{display:flex;align-items:flex-start;justify-content:space-between;width:100%;text-align:left;padding:12px 16px}\n#x-app .x-tr small{display:block;font-size:13px;line-height:16px;color:#536471}\n#x-app .x-tr b{display:block;font-size:15px;line-height:20px;font-weight:700;margin:1px 0}\n#x-app .x-tr i{width:18px;height:18px;color:#536471;flex:none;margin-top:2px}\n#x-app .x-kw{display:flex;flex-wrap:wrap;gap:8px;padding:0 16px 16px}\n#x-app .x-kw button{height:34px;padding:0 14px;border:1px solid #cfd9de;border-radius:17px;font-size:14px;font-weight:600}\n#x-app .x-sec{border-top:8px solid #eff3f4}\n#x-app .x-sg{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:12px 16px}\n#x-app .x-sg>svg{width:20px;height:20px;color:#536471;flex:none}\n#x-app .x-sg span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n#x-app .x-sg .x-rx{width:28px;height:28px;display:grid;place-items:center;color:#536471;flex:none}\n#x-app .x-sg .x-rx svg{width:16px;height:16px}\n#x-app .x-pp{display:flex;align-items:center;gap:12px;padding:12px 16px}\n#x-app .x-pp>div:nth-child(2){flex:1;min-width:0}\n#x-app .x-pp b{display:block;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n#x-app .x-pp small{display:block;color:#536471;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n#x-app .x-fb{height:32px;padding:0 16px;border-radius:16px;background:#0f1419;color:#fff;font-weight:700;font-size:14px;flex:none}\n#x-app .x-fb.on{background:#fff;color:#0f1419;border:1px solid #cfd9de}\n#x-app .x-rb{flex:none;display:flex;align-items:center;gap:12px;padding:10px 16px;border-top:1px solid #eff3f4;background:#fff}\n#x-app .x-rb button{flex:1;height:40px;border-radius:20px;background:#eff3f4;color:#536471;text-align:left;padding:0 16px;font-size:15px}\n#x-app .x-sh{position:absolute;inset:0;z-index:11;background:#fff;display:none;flex-direction:column;padding-top:calc(env(safe-area-inset-top,0px) + 54px)}\n#x-app .x-sh.on{display:flex;animation:xup .3s cubic-bezier(.2,.9,.25,1)}\n#x-app .x-ch{flex:none;display:flex;align-items:center;justify-content:space-between;height:53px;padding:0 16px}\n#x-app .x-ch .x-cc{font-size:16px}\n#x-app .x-ch .x-ct{font-weight:800;font-size:17px}\n#x-app .x-cb{height:34px;padding:0 18px;border-radius:17px;background:#1d9bf0;color:#fff!important;font-weight:700;font-size:15px}\n#x-app .x-cb:disabled{opacity:.5}\n#x-app .x-cctx{padding:0 16px 4px 68px;color:#536471;font-size:14px;line-height:19px}\n#x-app .x-cctx b{color:#1d9bf0;font-weight:400}\n#x-app .x-cbd{flex:1;min-height:0;display:flex;gap:12px;padding:8px 16px;overflow-y:auto}\n#x-app .x-cbd textarea{flex:1;min-width:0;border:0;outline:0;resize:none;background:none;font-size:20px;line-height:26px;color:#0f1419;padding:6px 0;min-height:120px;font-family:var(--font)}\n#x-app .x-cf{flex:none;display:flex;justify-content:flex-end;align-items:center;gap:12px;padding:10px 16px calc(env(safe-area-inset-bottom,0px) + 26px);border-top:1px solid #eff3f4;color:#536471;font-size:13px}\n#x-app .x-cf .bad{color:#f4212e;font-weight:700}\n#x-app.kb .x-cf{padding-bottom:10px}\n#x-app .x-ed{padding:8px 16px;overflow-y:auto;flex:1}\n#x-app .x-ed label{display:block;border:1px solid #cfd9de;border-radius:6px;padding:8px 12px;margin-bottom:16px;color:#536471;font-size:13px}\n#x-app .x-ed label:focus-within{border-color:#1d9bf0;color:#1d9bf0}\n#x-app .x-ed input,#x-app .x-ed textarea{display:block;width:100%;border:0;outline:0;background:none;font-size:17px;line-height:24px;color:#0f1419;padding:2px 0;resize:none;font-family:var(--font)}\n#x-app .x-toast{position:absolute;left:50%;bottom:calc(var(--xn) + 20px);transform:translate(-50%,10px);background:#1d9bf0;color:#fff;padding:10px 18px;border-radius:8px;font-size:14px;opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;z-index:12;white-space:nowrap}\n#x-app .x-toast.on{opacity:1;transform:translate(-50%,0)}";document.head.appendChild(style);})();

(()=>{const st=document.createElement("style");st.textContent="#x-image-viewer{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.92);display:none;align-items:center;justify-content:center;padding:24px;box-sizing:border-box}#x-image-viewer.on{display:flex}#x-image-viewer img{max-width:100%;max-height:88%;object-fit:contain}#x-image-viewer button{position:absolute;top:calc(env(safe-area-inset-top,0px) + 12px);right:18px;color:#fff;background:none;border:0;font-size:36px;line-height:1;cursor:pointer}#x-app .x-cv{background:#000!important}#x-app .x-eb{color:#000!important}#x-app .x-im img,#x-app .x-av img{cursor:zoom-in}";document.head.appendChild(st);})();
