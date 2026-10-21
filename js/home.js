/* ===== home.js (integrated) ===== */
/**
 * 홈 화면 설정 — 아이콘/배경 교체는 이 파일만 수정하면 됩니다.
 *
 * 아이콘 이미지로 교체: 앱 항목에 `img: "icons/kakaotalk.png"` 추가 (정사각형 PNG, 모서리는 자동 마스킹).
 * 배경 이미지로 교체: WALLPAPER 에 "url(wallpapers/bg.jpg)" 지정.
 */
window.WALLPAPER = "url(images/wallpapers/PlanKim-iOS-18-Wallpaper-Blue-Light.jpg)"; // 홈 화면과 잠금 화면 공통 배경

const g = (id, a, b) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="60" height="60" fill="url(#${id})"/>`;

window.APPS = {
  grid: [
    { id: "instagram", label: "Instagram", img: "images/app/Instagram/IMG_7148.png" },
    { id: "x", label: "X", img: "images/app/Twitter/IMG_7154.jpeg" },
    { id: "sentinel-site", label: "센티넬청", img: "sentinel-site/sentinel-logo.svg" },
    { id: "naver", label: "네이버", img: "images/app/Naver/IMG_7151.png" },
    { id: "dcinside", label: "디시인사이드", img: "images/app/DCInside/IMG_7147.png" },
    { id: "youtube", label: "YouTube", img: "images/app/YouTube/IMG_7155.png" },
    { id: "photos", label: "사진", img: "images/app/Photos/photos.svg" },
    { id: "notes", label: "메모", img: "images/app/Notes/notes.svg" }
  ],
  dock: [
    { id: "kakaotalk", label: "카카오톡", img: "images/app/KakaoTalk/IMG_7149.png" },
    { id: "safari", label: "Safari", img: "images/app/Safari/safari.svg" }
  ]
};

(() => {
  const $ = (s) => document.querySelector(s);
  const DOW = ["일요일","월요일","화요일","수요일","목요일","금요일","토요일"];

  /* ---------- 확대 방지 ---------- */
  ["gesturestart","gesturechange","gestureend"].forEach(e => document.addEventListener(e, ev => ev.preventDefault(), { passive: false }));
  document.addEventListener("dblclick", e => e.preventDefault(), { passive: false });
  document.addEventListener("contextmenu", e => e.preventDefault());
  document.addEventListener("touchmove", e => { if (e.touches.length > 1 || e.scale && e.scale !== 1) e.preventDefault(); }, { passive: false });

  /* ---------- 배경 ---------- */
  if (window.WALLPAPER) $("#wallpaper").style.setProperty("background", window.WALLPAPER + " center/cover no-repeat");

  /* ---------- 앱 렌더 ---------- */
  function iconInner(app) {
    if (app.img) return `<img src="${app.img}" alt="" draggable="false">`;
    if (app.dynamic === "calendar") {
      const d = new Date(2026, 9, 19);
      return `<div class="cal"><span class="dow">${DOW[d.getDay()]}</span><span class="day">${d.getDate()}</span></div>`;
    }
    return `<svg viewBox="0 0 60 60" preserveAspectRatio="xMidYMid slice">${app.svg}</svg>`;
  }
  function renderApps(list, mount) {
    mount.innerHTML = "";
    list.forEach(app => {
      const el = document.createElement("div");
      el.className = "app"; el.dataset.app = app.id; el.setAttribute("role", "button"); el.setAttribute("aria-label", app.label);
      el.innerHTML = `<div class="icon">${iconInner(app)}</div><span class="label">${app.label}</span>`;
      mount.appendChild(el);
    });
  }
  // 에브리타임은 앱 데이터와 구현을 유지한 채 홈 화면에서만 숨김 처리합니다. 다시 활성화하려면 필터에서 every time 제외 조건을 제거하세요.
  const HIDDEN_HOME_APPS = new Set(["everytime"]);
  const render = () => {
    renderApps(APPS.grid.filter(app => !HIDDEN_HOME_APPS.has(app.id)), $("#grid"));
    renderApps(APPS.dock, $("#dock"));
  };
  render();

  /* ---------- 앱 열기/홈 복귀 훅 (앱 UI는 추후 구현) ---------- */

  const HOME_STATE_KEY = "hwaho-last-screen-v1";
  let closeTimer = null;
  const Home = {
    current: null,
    openApp(id) {
      if (id === "sentinel-site") {
        const win = document.getElementById("sentinel-site-window");
        if (win) {
          win.classList.remove("hwaho-launching");
          win.style.display = "block";
          void win.offsetWidth;
          win.classList.add("hwaho-launching");
          win.addEventListener("animationend", () => win.classList.remove("hwaho-launching"), { once: true });
          win.querySelector("iframe")?.contentWindow?.location?.reload();
        }
        Home.current = id;
        try { localStorage.setItem(HOME_STATE_KEY, id); } catch (_) {}
        return;
      }
      if (id === "naver" || id === "dcinside") {
        const url = id === "naver" ? "https://www.naver.com/" : "https://dcinside.com/";
        if (Home.current !== "safari") Home.openApp("safari");
        setTimeout(() => { if (window.SafariApp) window.SafariApp.navigate(url); }, 420);
        return;
      }
      if (!id || Home.current === id) return;
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
      // Clear any stale invisible app layers left behind by a previous home-indicator gesture.
      document.querySelectorAll("#screen [id$='-app']").forEach(app => {
        app.style.pointerEvents = "";
        if (app.getAttribute("aria-hidden") === "true") app.removeAttribute("aria-hidden");
        app.style.display = "";
      });
      const previous = Home.current;
      if (previous && previous !== id) document.dispatchEvent(new CustomEvent("app:close", { detail: { id: previous, next: id } }));
      const h = $("#home");
      h.style.display = "";
      h.style.pointerEvents = "";
      Home.current = id;
      try { localStorage.setItem(HOME_STATE_KEY, id); } catch (_) {}
      document.dispatchEvent(new CustomEvent("app:open", { detail: { id } }));
      if (id === "instagram" && window.IgApp) window.IgApp.open();
    },
    goHome() {
      if (closeTimer) return;
      const had = Home.current; Home.current = null;
      const sentinelWin = document.getElementById("sentinel-site-window"); if (sentinelWin) sentinelWin.style.display = "none";
      try { localStorage.removeItem(HOME_STATE_KEY); } catch (_) {}
      document.dispatchEvent(new CustomEvent("app:close", { detail: { id: had } }));
      const h = $("#home");
      h.style.display = "flex";
      h.style.opacity = "1";
      h.style.transform = "none";
      h.style.pointerEvents = "auto";
      h.classList.remove("returning"); void h.offsetWidth; h.classList.add("returning");
      // After the closing animation, fully deactivate every app layer so it cannot block later taps.
      closeTimer = setTimeout(() => {
        closeTimer = null;
        if (Home.current !== null) return;
        document.querySelectorAll("#screen [id$='-app']").forEach(app => {
          app.classList.remove("open", "show", "on", "active", "opening", "in-app");
          app.setAttribute("aria-hidden", "true");
          app.style.pointerEvents = "none";
          app.style.display = "none";
        });
        h.style.display = "flex";
        h.style.pointerEvents = "auto";
      }, 460);
    },
    refresh: render,
  };
  window.Home = Home;

  /* ---------- 아이콘 터치 피드백 / 탭 ---------- */
  let pressed = null, moved = false, sx = 0, sy = 0;
  document.addEventListener("pointerdown", e => {
    const a = e.target.closest(".app"); if (!a) return;
    pressed = a; moved = false; sx = e.clientX; sy = e.clientY; a.classList.add("pressed");
  });
  document.addEventListener("pointermove", e => {
    if (pressed && Math.hypot(e.clientX - sx, e.clientY - sy) > 10) { moved = true; pressed.classList.remove("pressed"); }
  });
  const release = e => {
    if (!pressed) return;
    const a = pressed; pressed = null; a.classList.remove("pressed");
    if (!moved && e.type === "pointerup") Home.openApp(a.dataset.app);
  };
  document.addEventListener("pointerup", release);
  document.addEventListener("pointercancel", release);

  /* ---------- 가벼운 홈 인디케이터: 위로 쓸면 홈으로 ---------- */
  const homeZone = $("#home-indicator-zone");
  let homeTouch = null;
  homeZone.addEventListener("pointerdown", e => {
    homeTouch = { y: e.clientY, x: e.clientX, id: e.pointerId };
    try { homeZone.setPointerCapture(e.pointerId); } catch (_) {}
  });
  homeZone.addEventListener("pointerup", e => {
    if (!homeTouch) return;
    const dy = homeTouch.y - e.clientY;
    const dx = Math.abs(homeTouch.x - e.clientX);
    const distance = Math.hypot(dx, dy);
    homeTouch = null;
    if (!Home.current) return;
    // 탭하면 즉시 홈으로, 위로 쓸어도 홈으로
    if (distance < 14 || (dy > 18 && dy > dx * 0.8)) Home.goHome();
  });
  homeZone.addEventListener("pointercancel", () => { homeTouch = null; });
  homeZone.addEventListener("click", e => { if (Home.current) { e.preventDefault(); e.stopPropagation(); Home.goHome(); } });
  /* 하단 인디케이터가 앱 레이어에 가려져도 문서 캡처 단계에서 홈 복귀 처리 */
  let lastHomeAction = 0;
  const homeFromBottomGesture = e => {
    if (!e.isTrusted) return;
    const p = e.changedTouches ? e.changedTouches[0] : e;
    if (!p) return;
    const r = $("#screen").getBoundingClientRect();
    const x = p.clientX - r.left, y = p.clientY - r.top;
    const nearIndicator = y >= r.height - 34 && Math.abs(x - r.width / 2) <= 75;
    if (!nearIndicator || Date.now() - lastHomeAction < 500) return;
    lastHomeAction = Date.now();
    // Home.current가 비어 있어도 모든 앱에 app:close를 보내 강제로 홈 복귀
    Home.goHome();
    document.querySelectorAll("#screen [id$='-app']").forEach(app => {
      app.classList.remove("on", "active", "opening");
      if (app.id !== "home") app.style.display = "none";
    });
    $("#home").style.display = "flex";
    $("#home").style.opacity = "1";
    $("#home").style.transform = "none";
    $("#home").style.pointerEvents = "auto";
  };
  document.addEventListener("pointerup", homeFromBottomGesture, true);
  document.addEventListener("touchend", homeFromBottomGesture, { capture: true, passive: true });

  /* ---------- 일반 시계 ---------- */
  const tickClock = () => {
    const d = new Date();
    $("#clock").textContent = `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")}`;
  };
  tickClock();
  setInterval(tickClock, 15000);

  /* ---------- 배터리 ---------- */
  const bat = { level: 1, charging: false, linked: false }, batBox = document.querySelector(".sb-battery");
  const paintBat = () => {
    const p = Math.round(bat.level * 100);
    $("#bat-level").style.width = Math.max(8, p) + "%";
    batBox.classList.toggle("low", p <= 20 && !bat.charging);
    batBox.classList.toggle("charging", bat.charging);
    batBox.setAttribute("aria-label", bat.linked
      ? "배터리 " + p + "%" + (bat.charging ? ", 충전 중" : "")
      : "배터리 상태는 이 브라우저에서 연동할 수 없음");
    batBox.dataset.linked = bat.linked ? "true" : "false";
  };
  Home.battery = { get: () => ({ level: bat.level, charging: bat.charging, linked: bat.linked }) };
  paintBat();
  // Battery Status API가 지원되는 브라우저에서만 실제 기기 배터리와 연동합니다.
  // 지원되지 않으면 충전 아이콘을 탭해서 가짜로 바뀌게 하지 않습니다.
  if (typeof navigator.getBattery === "function") {
    navigator.getBattery().then(b => {
      const up = () => {
        bat.level = b.level;
        bat.charging = b.charging;
        bat.linked = true;
        paintBat();
      };
      up();
      b.addEventListener("levelchange", up);
      b.addEventListener("chargingchange", up);
    }).catch(() => { bat.linked = false; paintBat(); });
  }
})();
