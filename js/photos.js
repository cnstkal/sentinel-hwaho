/* ===== photos.js (integrated) ===== */
/* ===== 미디어 저장소 (사진/동영상 공유: 카메라 → 사진 앱) ===== */
const Media = (() => {
  const mem = { meta: [], blob: {}, seq: 1 };
  let db = null, ready = null;
  const fire = () => document.dispatchEvent(new CustomEvent("media:change"));
  const init = () => ready || (ready = new Promise(res => {
    try {
      const r = indexedDB.open("ioshome-media", 1);
      r.onupgradeneeded = () => { const d = r.result; d.createObjectStore("meta", { keyPath: "id", autoIncrement: true }); d.createObjectStore("blob", { keyPath: "id" }); };
      r.onsuccess = () => { db = r.result; res(); };
      r.onerror = r.onblocked = () => res();
    } catch (e) { res(); }
  }));
  const rq = r => new Promise((ok, no) => { r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); });
  return {
    async all() { await init(); return db ? rq(db.transaction("meta").objectStore("meta").getAll()) : mem.meta.slice(); },
    async get(id) { await init(); return db ? rq(db.transaction("blob").objectStore("blob").get(id)) : mem.blob[id]; },
    async add(meta, blob, live) {
      await init(); meta.ts = Date.now();
      if (!db) { meta.id = mem.seq++; mem.meta.push(meta); mem.blob[meta.id] = { blob, live: live || null }; fire(); return meta; }
      return new Promise((ok, no) => {
        const t = db.transaction(["meta", "blob"], "readwrite"), q = t.objectStore("meta").add(meta);
        q.onsuccess = () => { meta.id = q.result; t.objectStore("blob").put({ id: q.result, blob, live: live || null }); };
        t.oncomplete = () => { fire(); ok(meta); };
        t.onerror = t.onabort = () => no(t.error);
      });
    },
    async del(ids) {
      await init(); ids = [].concat(ids);
      if (!db) { mem.meta = mem.meta.filter(m => !ids.includes(m.id)); ids.forEach(i => delete mem.blob[i]); fire(); return; }
      return new Promise((ok, no) => {
        const t = db.transaction(["meta", "blob"], "readwrite");
        ids.forEach(i => { t.objectStore("meta").delete(i); t.objectStore("blob").delete(i); });
        t.oncomplete = () => { fire(); ok(); }; t.onerror = t.onabort = () => no(t.error);
      });
    },
  };
})();

const sleep = ms => new Promise(r => setTimeout(r, ms));
const originFrom = (el, id) => {
  const ic = document.querySelector(`[data-app="${id}"] .icon`), sr = document.querySelector("#screen").getBoundingClientRect();
  if (ic) { const r = ic.getBoundingClientRect(); el.style.transformOrigin = `${r.left + r.width / 2 - sr.left}px ${r.top + r.height / 2 - sr.top}px`; }
};

/* ===== 카메라 앱 ===== */
const CameraApp = (() => {
  const $ = s => document.querySelector(s);
  const el = $("#cam-app"), screen = $("#screen");
  const svg = (p, extra = "") => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" ${extra}>${p}</svg>`;
  const BOLT = "M13.200 2.800L6 13.200h5.200l-.7 8L18 10.600h-5.200z";
  const ICON = {
    flash: {
      auto: svg(`<path d="${BOLT}" transform="translate(-2 0)"/><text x="16.500" y="9.500" font-size="7.500" font-weight="600" fill="currentColor" stroke="none">A</text>`),
      on: svg(`<path d="${BOLT}" fill="currentColor"/>`),
      off: svg(`<path d="${BOLT}"/><path d="M4.500 3.500l15 17"/>`),
    },
    live: svg('<circle cx="12" cy="12" r="9.500" stroke-dasharray=".1 2.980"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/>'),
    liveOff: svg('<circle cx="12" cy="12" r="9.500" stroke-dasharray=".1 2.980"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/><path d="M4.500 3.500l15 17"/>'),
    chev: svg('<path d="M6 14.500l6-6 6 6" stroke-width="1.600"/>'),
    flip: svg('<path d="M20 12a8 8 0 0 0-13.700-5.600L4 8.500"/><path d="M4 4v4.500h4.500"/><path d="M4 12a8 8 0 0 0 13.700 5.600L20 15.500"/><path d="M20 20v-4.500h-4.500"/>'),
    sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 3v2.500M12 18.500V21M3 12h2.500M18.500 12H21M5.600 5.600l1.800 1.800M16.600 16.600l1.800 1.800M5.600 18.400l1.800-1.800M16.600 7.400l1.800-1.800"/>'),
  };

  el.dataset.mode = "photo";
  el.innerHTML = `
<div class="cm-top"><button class="cm-ico" data-c="flash" aria-label="플래시"></button><button class="cm-ico" data-c="opts" aria-label="옵션">${ICON.chev}</button><button class="cm-ico" data-c="live" aria-label="라이브 포토"></button></div>
<div class="cm-rec"><i></i><span id="cm-t">00:00</span></div>
<div class="cm-opts"><button data-c="timer"></button><button data-c="ratio"></button><button data-c="grid"></button></div>
<div class="cm-stage"><div class="cm-vf" id="cm-vf">
  <video id="cm-v" playsinline muted autoplay></video>
  <div class="cm-grid"></div><div class="cm-blink" id="cm-blink"></div>
  <div class="cm-count" id="cm-count"></div><div class="cm-live" id="cm-live">LIVE</div>
  <div class="cm-fx" id="cm-fx"><div class="sq"></div><div class="ex" id="cm-ex"><div class="sun" id="cm-sun">${ICON.sun}</div></div></div>
  <div class="cm-zoom" id="cm-zoom"></div><div class="cm-toast" id="cm-toast"></div>
  <div class="cm-msg" id="cm-msg"><b></b><p></p><button data-c="retry">다시 시도</button></div>
</div></div>
<div class="cm-modes"><button data-mode="photo" class="on">사진</button></div>
<div class="cm-ctl"><button class="cm-thumb" id="cm-thumb" data-c="thumb" aria-label="최근 사진"></button><button class="cm-shutter" data-c="shutter" aria-label="셔터"><i></i></button><button class="cm-flip" id="cm-flip" data-c="flip" aria-label="카메라 전환">${ICON.flip}</button></div>
<div class="cm-white" id="cm-white"></div><input type="file" id="cm-file" accept="image/*" capture="environment" hidden>`;

  const vf = $("#cm-vf"), video = $("#cm-v"), fx = $("#cm-fx"), ex = $("#cm-ex"), sun = $("#cm-sun"), zoomEl = $("#cm-zoom");
  const AR = { "4:3": 3 / 4, "16:9": 9 / 16, "1:1": 1 };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  let mode = "photo", facing = "environment", flashMode = "auto", live = false, timerSec = 0, ratio = "4:3", gridOn = false;
  let stream = null, track = null, caps = {}, hwZoom = false, hwExp = false, torchCap = false, zMin = 1, zMax = 5, zoom = 1, ev = 0;
  let hasAudio = false, token = 0, isOpen = false, busy = false, recording = null, counting = null, timerI = 0, fxT = 0, toastT = 0, thumbUrl = "";
  const arNow = () => { const w = vf.clientWidth, hh = vf.clientHeight; return w && hh ? w / hh : AR[ratio]; };
  const canRec = () => typeof MediaRecorder !== "undefined" && !!HTMLCanvasElement.prototype.captureStream;
  const canFilter = (() => { try { return "filter" in document.createElement("canvas").getContext("2d"); } catch (e) { return false; } })();

  /* ---------- UI ---------- */
  function ui() {
    el.dataset.mode = mode;
    vf.style.setProperty("--ar", AR[ratio]);
    el.querySelector('[data-c=flash]').innerHTML = ICON.flash[flashMode];
    el.querySelector('[data-c=flash]').classList.toggle("on", flashMode === "on");
    const lv = el.querySelector('[data-c=live]'); lv.innerHTML = live ? ICON.live : ICON.liveOff; lv.classList.toggle("on", live);
    el.classList.toggle("opts-open", el.classList.contains("opts-open"));
    const tm = el.querySelector('[data-c=timer]'), ra = el.querySelector('[data-c=ratio]'), gr = el.querySelector('[data-c=grid]');
    tm.textContent = `타이머 ${timerSec ? timerSec + "초" : "끔"}`; tm.classList.toggle("on", !!timerSec);
    ra.textContent = `비율 ${mode === "video" ? "16:9" : ratio}`; ra.classList.toggle("on", mode === "photo" && ratio !== "4:3");
    gr.textContent = `격자 ${gridOn ? "켬" : "끔"}`; gr.classList.toggle("on", gridOn);
    vf.classList.toggle("grid-on", gridOn);
    el.querySelectorAll("[data-mode]").forEach(b => b.classList.toggle("on", b.dataset.mode === mode));
    el.querySelector('[data-c=live]').style.visibility = mode === "photo" ? "visible" : "hidden";
    applyView(); renderZoom();
  }
  function toast(t) {
    const e = $("#cm-toast"); e.textContent = t; e.classList.add("on");
    clearTimeout(toastT); toastT = setTimeout(() => e.classList.remove("on"), 2400);
  }
  function msg(title, body) {
    const m = $("#cm-msg");
    if (!title) { m.classList.remove("on"); return; }
    m.querySelector("b").textContent = title; m.querySelector("p").textContent = body; m.classList.add("on");
  }
  function applyView() {
    const dz = hwZoom ? 1 : zoom, mir = facing === "user" ? -1 : 1;
    video.style.transform = `scale(${dz * mir},${dz})`;
    video.style.filter = !hwExp && ev ? `brightness(${Math.pow(2, ev / 2)})` : "";
  }
  function renderZoom() {
    let steps = [0.5, 1, 2, 5].filter(s => s >= zMin - 0.01 && s <= zMax + 0.01);
    if (!steps.includes(1)) steps.unshift(1);
    let act = steps[0]; steps.forEach(s => { if (zoom >= s - 0.04) act = s; });
    const f = z => (Math.abs(z - Math.round(z)) < 0.05 ? String(Math.round(z)) : z.toFixed(1)) + "×";
    zoomEl.innerHTML = steps.map(s => `<button data-z="${s}" class="${s === act ? "on" : ""}">${s === act ? f(zoom) : f(s)}</button>`).join("");
  }
  let zRaf = 0;
  function setZoom(z, smooth) {
    zoom = clamp(z, zMin, zMax);
    if (hwZoom) { if (!zRaf) zRaf = requestAnimationFrame(() => { zRaf = 0; track && track.applyConstraints({ advanced: [{ zoom }] }).catch(() => {}); }); }
    else { vf.classList.toggle("zt", !!smooth); applyView(); }
    renderZoom();
  }
  function setEV(v) {
    ev = clamp(v, -2, 2);
    sun.style.transform = `translateY(${-ev * 35}px)`;
    if (hwExp && track) { const c = caps.exposureCompensation; track.applyConstraints({ advanced: [{ exposureCompensation: c.min + (ev + 2) / 4 * (c.max - c.min) }] }).catch(() => {}); }
    else applyView();
  }

  /* ---------- 스트림 ---------- */
  function stopStream() {
    try { if (track && torchCap) track.applyConstraints({ advanced: [{ torch: false }] }).catch(() => {}); } catch (e) {}
    if (stream) stream.getTracks().forEach(t => t.stop());
    stream = null; track = null; video.srcObject = null;
  }
  /* 닫을 때 스트림을 바로 끊지 않고 잠시 유지 -> 재진입 시 권한 재요청/재시작 없음 */
  let idleT = 0;
  function suspend() {
    if (!stream) return;
    try { if (track && torchCap) track.applyConstraints({ advanced: [{ torch: false }] }).catch(() => {}); } catch (e) {}
    stream.getVideoTracks().forEach(t => { t.enabled = false; });
    try { video.pause(); } catch (e) {}
    clearTimeout(idleT); idleT = setTimeout(() => { if (!isOpen) stopStream(); }, 60000);
  }
  function resumeOrStart() {
    clearTimeout(idleT);
    if (stream && track && track.readyState === "live") {
      stream.getVideoTracks().forEach(t => { t.enabled = true; });
      video.srcObject = stream; video.play().catch(() => {}); msg(null); ui(); return;
    }
    start();
  }
  function errMsg(e) {
    const n = e && e.name;
    if (n === "NotAllowedError" || n === "SecurityError") msg("카메라 권한이 필요합니다", "브라우저(또는 설정 > Safari > 카메라)에서 이 사이트의 카메라 접근을 허용한 뒤 '다시 시도'를 눌러 주세요.");
    else if (n === "NotFoundError" || n === "OverconstrainedError") msg("카메라를 찾을 수 없습니다", "사용 가능한 카메라가 없습니다. 기기에 카메라가 연결되어 있는지 확인해 주세요.");
    else if (n === "NotReadableError") msg("카메라를 사용할 수 없습니다", "다른 앱이 카메라를 사용 중일 수 있습니다. 해당 앱을 종료한 뒤 다시 시도해 주세요.");
    else msg("카메라를 시작하지 못했습니다", "잠시 후 다시 시도해 주세요.");
  }
  async function start() {
    const my = ++token; stopStream();
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.isSecureContext) {
      msg("카메라를 사용할 수 없습니다", "이 환경에서는 카메라 접근이 지원되지 않습니다. HTTPS(또는 localhost) 주소에서 최신 Safari·Chrome으로 접속해 주세요."); return;
    }
    msg(null);
    const v = { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } };
    let s = null;
    try { s = await navigator.mediaDevices.getUserMedia({ video: v, audio: mode === "video" }); }
    catch (e) { try { s = await navigator.mediaDevices.getUserMedia({ video: v }); } catch (e2) { if (my === token) errMsg(e2); return; } }
    if (my !== token || !isOpen) { s.getTracks().forEach(t => t.stop()); return; }
    stream = s; track = s.getVideoTracks()[0]; hasAudio = s.getAudioTracks().length > 0;
    caps = track.getCapabilities ? track.getCapabilities() : {};
    hwZoom = !!caps.zoom; zMin = hwZoom ? caps.zoom.min : 1; zMax = hwZoom ? Math.min(caps.zoom.max, 10) : 5;
    hwExp = !!caps.exposureCompensation; torchCap = !!caps.torch; zoom = 1; ev = 0; sun.style.transform = "";
    video.srcObject = s; try { await video.play(); } catch (e) {}
    vf.classList.remove("flipping"); ui();
  }

  /* ---------- 촬영 도구 ---------- */
  function cropRect() {
    const vw = video.videoWidth, vh = video.videoHeight, a = arNow();
    let sw, sh; if (vw / vh > a) { sh = vh; sw = vh * a; } else { sw = vw; sh = vw / a; }
    const dz = hwZoom ? 1 : zoom; sw /= dz; sh /= dz;
    return { sx: (vw - sw) / 2, sy: (vh - sh) / 2, sw, sh };
  }
  function drawTo(ctx, W, H) {
    if (!video.videoWidth) return;
    const c = cropRect(), f = !hwExp && ev ? Math.pow(2, ev / 2) : 1;
    if (f !== 1 && canFilter) ctx.filter = `brightness(${f})`;
    ctx.drawImage(video, c.sx, c.sy, c.sw, c.sh, 0, 0, W, H);
    if (f !== 1) {
      if (canFilter) ctx.filter = "none";
      else { const d = ctx.getImageData(0, 0, W, H), p = d.data; for (let i = 0; i < p.length; i += 4) { p[i] *= f; p[i + 1] *= f; p[i + 2] *= f; } ctx.putImageData(d, 0, 0); }
    }
  }
  const toBlob = (cv, type, q) => new Promise(r => cv.toBlob(r, type, q));
  async function thumbOf(cv) {
    const sc = 360 / Math.max(cv.width, cv.height), t = document.createElement("canvas");
    t.width = Math.round(cv.width * sc); t.height = Math.round(cv.height * sc);
    t.getContext("2d").drawImage(cv, 0, 0, t.width, t.height); return toBlob(t, "image/jpeg", .75);
  }
  function lowLight() {
    try {
      const t = document.createElement("canvas"); t.width = t.height = 24; const x = t.getContext("2d"); drawTo(x, 24, 24);
      const p = x.getImageData(0, 0, 24, 24).data; let s = 0; for (let i = 0; i < p.length; i += 4) s += p[i] * .3 + p[i + 1] * .59 + p[i + 2] * .11;
      return s / (p.length / 4) < 60;
    } catch (e) { return false; }
  }
  async function flashOn() {
    if (facing === "user") { const w = $("#cm-white"); w.classList.add("on"); await sleep(260); return () => w.classList.remove("on"); }
    if (torchCap && track) { try { await track.applyConstraints({ advanced: [{ torch: true }] }); await sleep(320); return () => track.applyConstraints({ advanced: [{ torch: false }] }).catch(() => {}); } catch (e) {} }
    toast("이 기기는 후면 플래시를 지원하지 않아 플래시 없이 촬영합니다."); return null;
  }
  const pickMime = () => ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find(t => { try { return MediaRecorder.isTypeSupported(t); } catch (e) { return false; } }) || "";
  function makeRec(withAudio) {
    const c = cropRect(), sc = Math.min(1, 1920 / Math.max(c.sw, c.sh)), cv = document.createElement("canvas");
    cv.width = Math.max(2, Math.round(c.sw * sc / 2) * 2); cv.height = Math.max(2, Math.round(c.sh * sc / 2) * 2);
    const ctx = cv.getContext("2d"); let run = true, raf = 0;
    const loop = () => { if (!run) return; drawTo(ctx, cv.width, cv.height); raf = requestAnimationFrame(loop); }; loop();
    const out = cv.captureStream(30);
    if (withAudio) stream.getAudioTracks().forEach(t => out.addTrack(t));
    const mime = pickMime(); let rec;
    try { rec = new MediaRecorder(out, mime ? { mimeType: mime, videoBitsPerSecond: 6e6 } : { videoBitsPerSecond: 6e6 }); } catch (e) { rec = new MediaRecorder(out); }
    const chunks = []; rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); }; rec.start(500);
    return { canvas: cv, stop: () => new Promise(res => {
      const fin = () => { run = false; cancelAnimationFrame(raf); res(new Blob(chunks, { type: rec.mimeType || mime || "video/webm" })); };
      rec.onstop = fin; if (rec.state !== "inactive") rec.stop(); else fin();
    }) };
  }
  function setThumb(blob) {
    if (thumbUrl) URL.revokeObjectURL(thumbUrl);
    thumbUrl = blob ? URL.createObjectURL(blob) : "";
    const t = $("#cm-thumb"); t.style.backgroundImage = thumbUrl ? `url(${thumbUrl})` : "";
    t.classList.remove("pop"); void t.offsetWidth; t.classList.add("pop");
  }
  async function loadThumb() {
    try { const a = (await Media.all()).sort((x, y) => y.ts - x.ts)[0]; if (thumbUrl) URL.revokeObjectURL(thumbUrl); thumbUrl = a ? URL.createObjectURL(a.thumb) : ""; $("#cm-thumb").style.backgroundImage = thumbUrl ? `url(${thumbUrl})` : ""; } catch (e) {}
  }

  /* ---------- 사진 / 비디오 ---------- */
  let saveQ = Promise.resolve();
  const buzz = () => { try { if (navigator.vibrate) navigator.vibrate(10); } catch (e) {} };
  function shotFx() {
    const b = $("#cm-blink"); b.classList.remove("go"); void b.offsetWidth; b.classList.add("go");
    const ir = document.createElement("div"); ir.className = "cm-iris"; vf.appendChild(ir);
    setTimeout(() => ir.remove(), 340);
    const s = el.querySelector(".cm-shutter"); s.classList.remove("shot"); void s.offsetWidth; s.classList.add("shot");
    try { s.animate([{ transform: "scale(1)" }, { transform: "scale(.88)", offset: .35 }, { transform: "scale(1)" }], { duration: 220, easing: "cubic-bezier(.2,.9,.3,1)" }); } catch (_) {}
    buzz();
  }
  const shBtn = el.querySelector(".cm-shutter"), press = v => () => shBtn.classList.toggle("press", v);
  shBtn.addEventListener("pointerdown", press(true));
  ["pointerup", "pointercancel", "pointerleave"].forEach(n => shBtn.addEventListener(n, press(false)));
  async function takePhoto() {
    if (busy) return;
    if (!stream || !video.videoWidth) { const f = $("#cm-file"); f.value = ""; f.click(); return; }
    busy = true; let cv, r = null;
    try {
      const fl = flashMode === "on" || (flashMode === "auto" && lowLight());
      const endFlash = fl ? await flashOn() : null;
      const c = cropRect(), sc = Math.min(1, 3072 / Math.max(c.sw, c.sh));
      cv = document.createElement("canvas"); cv.width = Math.round(c.sw * sc); cv.height = Math.round(c.sh * sc);
      drawTo(cv.getContext("2d"), cv.width, cv.height);
      shotFx(); if (endFlash) endFlash();
      if (live && canRec()) { $("#cm-live").classList.add("on"); r = makeRec(false); }
    } catch (e) { busy = false; toast("촬영하지 못했습니다."); return; }
    if (!r) busy = false;
    saveQ = saveQ.then(async () => {
      try {
        const blob = await toBlob(cv, "image/jpeg", .92), thumb = await thumbOf(cv);
        let liveBlob = null;
        if (r) { await sleep(1500); liveBlob = await r.stop(); $("#cm-live").classList.remove("on"); }
        await Media.add({ type: "photo", w: cv.width, h: cv.height, thumb, mime: "image/jpeg", live: !!liveBlob }, blob, liveBlob);
        setThumb(thumb);
      } catch (e) { $("#cm-live").classList.remove("on"); toast("저장하지 못했습니다. 저장 공간을 확인해 주세요."); }
      if (r) busy = false;
    });
  }
  $("#cm-file").addEventListener("change", async e => {
    const f = e.target.files && e.target.files[0]; if (!f || busy) return; busy = true;
    try {
      const bm = await createImageBitmap(f), k = Math.min(1, 3072 / Math.max(bm.width, bm.height)), cv = document.createElement("canvas");
      cv.width = Math.round(bm.width * k); cv.height = Math.round(bm.height * k); cv.getContext("2d").drawImage(bm, 0, 0, cv.width, cv.height);
      const blob = await toBlob(cv, "image/jpeg", .92), thumb = await thumbOf(cv);
      await Media.add({ type: "photo", w: cv.width, h: cv.height, thumb, mime: "image/jpeg", live: false }, blob, null);
      shotFx(); setThumb(thumb);
    } catch (err) { toast("사진을 저장하지 못했습니다."); }
    busy = false;
  });
  async function startRecording() {
    if (!stream || !video.videoWidth) return;
    if (!canRec()) { toast("이 브라우저는 비디오 녹화를 지원하지 않습니다."); return; }
    if (flashMode === "on" && torchCap && track) track.applyConstraints({ advanced: [{ torch: true }] }).catch(() => {});
    recording = { rec: makeRec(true), t0: Date.now() };
    el.classList.add("recording"); el.classList.remove("opts-open");
    const t = $("#cm-t"); t.textContent = "00:00";
    timerI = setInterval(() => { const s = Math.floor((Date.now() - recording.t0) / 1000); t.textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; }, 250);
  }
  async function stopRecording() {
    const r = recording; if (!r) return; recording = null; clearInterval(timerI); el.classList.remove("recording");
    if (torchCap && track) track.applyConstraints({ advanced: [{ torch: false }] }).catch(() => {});
    const dur = (Date.now() - r.t0) / 1000;
    try {
      const blob = await r.rec.stop(); if (!blob.size) throw 0;
      const thumb = await thumbOf(r.rec.canvas); setThumb(thumb);
      await Media.add({ type: "video", w: r.rec.canvas.width, h: r.rec.canvas.height, dur, thumb, mime: blob.type }, blob, null);
    } catch (e) { toast("동영상을 저장하지 못했습니다."); }
  }
  function stopCount() { if (counting) { clearInterval(counting); counting = null; } $("#cm-count").classList.remove("on"); }
  function countdown(n, done) {
    let k = n; const c = $("#cm-count"); c.textContent = k; c.classList.add("on");
    counting = setInterval(() => { k--; if (k <= 0) { stopCount(); done(); } else c.textContent = k; }, 1000);
  }
  function shutter() {
    if (counting) { stopCount(); return; }
    if (recording) { stopRecording(); return; }
    const run = () => (mode === "photo" ? takePhoto() : startRecording());
    if (timerSec) countdown(timerSec, run); else run();
  }
  function setMode(m) {
    if (m !== "photo" || recording || m === mode) return; stopCount(); mode = m; ui();
    if (m === "video" && stream && !hasAudio) start();
  }

  /* ---------- 제스처: 탭 포커스 / 핀치 줌 / 스와이프 모드 전환 ---------- */
  const ptrs = new Map(); let st = null, pinch = null, drag = null;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  vf.addEventListener("pointerdown", e => {
    if (e.target.closest(".cm-zoom,.ex,.cm-msg")) return;
    try { vf.setPointerCapture(e.pointerId); } catch (_) {}
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 1) st = { x: e.clientX, y: e.clientY, t: Date.now(), moved: false };
    else if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = { d: dist(a, b), z: zoom }; st = null; vf.classList.remove("zt"); }
  });
  vf.addEventListener("pointermove", e => {
    if (!ptrs.has(e.pointerId)) return;
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && ptrs.size >= 2) { const [a, b] = [...ptrs.values()]; setZoom(pinch.z * dist(a, b) / pinch.d); }
    else if (st && Math.hypot(e.clientX - st.x, e.clientY - st.y) > 10) st.moved = true;
  });
  const endPtr = e => {
    if (!ptrs.has(e.pointerId)) return;
    ptrs.delete(e.pointerId);
    if (ptrs.size < 2) pinch = null;
    if (st && e.type === "pointerup") {
      const dx = e.clientX - st.x, dy = e.clientY - st.y;
      if (!st.moved && Date.now() - st.t < 500) focusAt(e.clientX, e.clientY);
      else if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        const order = ["video", "photo"], i = order.indexOf(mode); setMode(order[clamp(i + (dx < 0 ? 1 : -1), 0, 1)]);
      }
    }
    st = null;
  };
  vf.addEventListener("pointerup", endPtr); vf.addEventListener("pointercancel", endPtr);

  function focusAt(x, y) {
    const r = vf.getBoundingClientRect(), px = x - r.left, py = y - r.top;
    fx.style.left = px + "px"; fx.style.top = py + "px"; fx.classList.toggle("flip", px > r.width - 150);
    fx.classList.remove("pop"); void fx.offsetWidth; fx.classList.add("on", "pop");
    ev = 0; setEV(0);
    clearTimeout(fxT); fxT = setTimeout(() => fx.classList.remove("on"), 3500);
    if (track) track.applyConstraints({ advanced: [{ focusMode: "single-shot", pointsOfInterest: [{ x: px / r.width, y: py / r.height }] }] }).catch(() => {});
  }
  ex.addEventListener("pointerdown", e => { e.stopPropagation(); ex.setPointerCapture(e.pointerId); drag = { y: e.clientY, ev }; clearTimeout(fxT); });
  ex.addEventListener("pointermove", e => { if (drag) setEV(drag.ev - (e.clientY - drag.y) / 35); });
  const exEnd = () => { if (!drag) return; drag = null; clearTimeout(fxT); fxT = setTimeout(() => fx.classList.remove("on"), 2500); };
  ex.addEventListener("pointerup", exEnd); ex.addEventListener("pointercancel", exEnd);

  /* ---------- 버튼 ---------- */
  el.addEventListener("click", e => {
    const zb = e.target.closest("[data-z]"); if (zb) { setZoom(+zb.dataset.z, true); return; }
    const mb = e.target.closest("[data-mode]"); if (mb) { setMode(mb.dataset.mode); return; }
    const t = e.target.closest("[data-c]"); if (!t) return;
    switch (t.dataset.c) {
      case "flash":
        flashMode = { auto: "on", on: "off", off: "auto" }[flashMode]; ui();
        if (flashMode === "on" && stream && facing === "environment" && !torchCap) toast("이 기기는 후면 플래시를 지원하지 않습니다.");
        break;
      case "live": live = !live; ui(); if (live && !canRec()) toast("이 브라우저는 라이브 포토를 지원하지 않습니다."); break;
      case "opts": el.classList.toggle("opts-open"); break;
      case "timer": timerSec = { 0: 3, 3: 10, 10: 0 }[timerSec]; ui(); break;
      case "ratio":
        if (mode === "video") { toast("비디오는 16:9 비율로 촬영됩니다."); break; }
        ratio = { "4:3": "16:9", "16:9": "1:1", "1:1": "4:3" }[ratio]; ui(); break;
      case "grid": gridOn = !gridOn; ui(); break;
      case "shutter": shutter(); break;
      case "flip": {
        if (recording) break;
        facing = facing === "user" ? "environment" : "user";
        t.classList.toggle("spin"); vf.classList.add("flipping"); start(); break;
      }
      case "thumb": if (!recording) { close(); window.PhotosApp && PhotosApp.openLatest(); } break;
      case "retry": start(); break;
    }
  });

  /* ---------- 열기/닫기 ---------- */
  function open() {
    if (isOpen) return; isOpen = true;
    mode = "photo"; zoom = 1; ev = 0; el.classList.remove("opts-open", "recording"); fx.classList.remove("on");
    ui(); loadThumb(); originFrom(el, "camera");
    el.classList.add("show"); void el.offsetWidth; el.classList.add("open"); el.setAttribute("aria-hidden", "false");
    setTimeout(() => { if (isOpen) resumeOrStart(); }, 420);
  }
  function close() {
    if (!isOpen) return; isOpen = false; token++;
    if (recording) stopRecording();
    stopCount(); suspend(); msg(null);
    el.classList.remove("open"); el.setAttribute("aria-hidden", "true");
    setTimeout(() => { if (!isOpen) el.classList.remove("show"); }, 430);
  }
  document.addEventListener("app:open", e => { if (e.detail.id === "camera") open(); });
  document.addEventListener("app:close", close);
  document.addEventListener("media:change", () => { if (isOpen && !busy) loadThumb(); });
  document.addEventListener("visibilitychange", () => {
    if (!isOpen) return;
    if (document.hidden) { if (recording) stopRecording(); stopStream(); } else if (!stream) start();
  });
  return { open, close };
})();

/* ===== 사진 앱 (보관함) ===== */
const PhotosApp = (() => {
  const $ = s => document.querySelector(s);
  const el = $("#pho-app");
  const ic = (p, c = "") => `<svg ${c ? `class="${c}"` : ""} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const I = {
    filter: ic('<path d="M4.500 7h15M7 12h10M9.500 17h5" stroke-width="2"/>'),
    cloud: ic('<path d="M7.500 18.500a4 4 0 0 1-.6-7.950A5.500 5.500 0 0 1 17.600 9.600 4.500 4.500 0 0 1 17 18.500z"/><path d="M10.500 12.500v3M13.500 12.500v3"/>'),
    chev: ic('<path d="M9 5l7 7-7 7" stroke-width="2.200"/>', "ch"),
    photo: ic('<rect x="3.500" y="4.500" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="1.400"/><path d="M4 17l5-4.500 3.500 3 3-2.500 4.500 4"/>'),
    coll: ic('<rect x="4.500" y="7" width="15" height="12.500" rx="2.800"/><path d="M7.500 4h9"/>'),
    search: ic('<circle cx="10.500" cy="10.500" r="6"/><path d="M15 15l5 5"/>'),
    trash: ic('<path d="M4.500 7h15M10 11v6M14 11v6M6.500 7l.8 11.200a2 2 0 0 0 2 1.800h5.400a2 2 0 0 0 2-1.800L17.500 7M9 7V4.500h6V7"/>'),
    check: ic('<path d="M5 12.500l4.500 4.500L19 7.500" stroke-width="2"/>'),
  };
  el.innerHTML = '<div id="pl-main"></div><div class="pl-menu-back" id="pl-mb"></div><div class="pl-menu" id="pl-menu"></div><div class="pv" id="pv"></div><div class="act-back" id="ph-ab"></div><div class="act" id="ph-act"></div>';
  const main = $("#pl-main"), menu = $("#pl-menu"), mb = $("#pl-mb"), act = $("#ph-act"), ab = $("#ph-ab");

  const now = Date.now();
  const PH = Array.from({ length: 48 }, (_, i) => ({
    id: "ph" + i, ph: true, type: i % 7 === 3 ? "video" : "photo", dur: [4, 12, 37, 8, 65][i % 5], ts: now - (48 - i) * 7200000,
    grad: `linear-gradient(${(135 + i * 37) % 360}deg,hsl(${(i * 53) % 360} 45% 52%),hsl(${(i * 53 + 50) % 360} 55% 28%))`,
  }));
  const fmtDur = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

  let real = [], filter = "all", order = "desc", sel = false, selected = new Set(), urls = new Map(), isOpen = false, pendingDel = null;
  // 저장소의 images/app/Photos 폴더에 있는 사진을 자동으로 불러옵니다.
  let repoPhotos = [];
  let repoPhotosLoaded = false;
  async function loadRepoPhotos() {
    if (repoPhotosLoaded) return;
    repoPhotosLoaded = true;
    try {
      // 폴더 대소문자/이름 차이에 영향받지 않도록 저장소 파일 목록에서 사진 폴더를 찾습니다.
      const res = await fetch("https://api.github.com/repos/cnstkal/Hwaho2/git/trees/main?recursive=1");
      if (!res.ok) throw new Error("repository tree unavailable");
      const tree = await res.json();
      const supported = /\.(avif|gif|jpe?g|png|webp|heic|heif)$/i;
      const candidates = (tree.tree || []).filter(f => f.type === "blob" && supported.test(f.path));
      const inPhotoFolder = candidates.filter(f => {
        const parts = f.path.split("/");
        return (
          (parts.length >= 3 && /^(images|image|이미지)$/i.test(parts[0]) && /^(photos?|포토)$/i.test(parts[1])) ||
          (parts.length >= 4 && /^(images|image|이미지)$/i.test(parts[0]) && /^app$/i.test(parts[1]) && /^(photos?|포토)$/i.test(parts[2]))
        );
      });
      const files = (inPhotoFolder.length ? inPhotoFolder : candidates.filter(f =>
        /(^|\/)(photos?|포토)(\/|$)/i.test(f.path)
      )).sort((a, b) => {
        const an = Number((a.path.split("/").pop().match(/^(\d+)/) || [])[1]);
        const bn = Number((b.path.split("/").pop().match(/^(\d+)/) || [])[1]);
        if (Number.isFinite(an) && Number.isFinite(bn) && an !== bn) return bn - an;
        if (Number.isFinite(an) !== Number.isFinite(bn)) return Number.isFinite(bn) ? 1 : -1;
        return b.path.localeCompare(a.path, undefined, { numeric: true });
      });
      repoPhotos = files.map((f, i) => ({
        id: "repo-photo-" + i, repoPhoto: true, type: "photo",
        name: f.path.split("/").pop(),
        src: "https://raw.githubusercontent.com/cnstkal/Hwaho2/main/" + f.path.split("/").map(encodeURIComponent).join("/"),
        ts: Date.UTC(2025, 0, 1) + i * 86400000
      }));
    } catch (e) { console.warn("저장소 사진을 불러오지 못했습니다.", e); }
  }
  const base = () => [...repoPhotos, ...real];
  const view = () => base().filter(i => filter === "all" || i.type === filter).sort((a, b) => (order === "asc" ? a.ts - b.ts : b.ts - a.ts));
  const turl = it => { if (!urls.has(it.id)) urls.set(it.id, URL.createObjectURL(it.thumb)); return urls.get(it.id); };

  let wantLatest = false, pvUrls = [], pvIO = null, pvL = [], pvJ = -1; const favs = new Set();
  const pv = () => $("#pv");
  const pvDate = ts => { if (!(ts > 1e11)) return null; const d = new Date(ts), n = new Date(), h = d.getHours(), dd = Math.round((new Date(n.getFullYear(), n.getMonth(), n.getDate()) - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 864e5);
    return [dd === 0 ? "오늘" : dd === 1 ? "어제" : dd > 1 && dd < 7 ? "일월화수목금토"[d.getDay()] + "요일" : `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`, (h < 12 ? "오전 " : "오후 ") + (h % 12 || 12) + ":" + String(d.getMinutes()).padStart(2, "0")]; };
  const pvFake = it => { let h = 7; for (const c of String(it.name || it.id)) h = (h * 31 + c.charCodeAt(0)) >>> 0; const d = new Date(); d.setDate(d.getDate() - 7 - h % 200); d.setHours((h >> 3) % 24, (h >> 7) % 60, 0, 0); return d.getTime(); };
  const pvTh = it => it.repoPhoto ? `<img src="${it.src}" alt="">` : it.ph ? `<div class="g" style="background:${it.grad}"></div>` : it.thumb ? `<img src="${turl(it)}" alt="">` : "";
  function pvSync(j, snap) {
    const v = pv(), it = pvL[j]; if (!it) return; pvJ = j;
    const d = pvDate(it.ts) || pvDate(pvFake(it)), t = v.querySelector(".pv-ttl"); t.innerHTML = d ? `<b>${d[0]}</b><span>${d[1]}</span>` : `<b>사진</b><span></span>`;
    const th = v.querySelector(".pv-th"); if (th) { [...th.children].forEach((b, i) => b.classList.toggle("on", i === j)); const c = th.children[j]; if (c) th.scrollTo({ left: c.offsetLeft - th.clientWidth / 2 + (c.offsetWidth + 14) / 2 - 7, behavior: snap ? "auto" : "smooth" }); }
    v.querySelector(".pv-info").innerHTML = `<b>${it.name || (it.type === "video" ? "비디오" : "사진")}</b><span>${d ? d.join(" ") : ""}</span>`;
  }
  async function openViewer(id) {
    const l = pvL = view(), idx = Math.max(0, l.findIndex(i => String(i.id) === String(id))), v = pv();
    const P = d => ic(d, "");
    v.innerHTML = `<button class="pv-back" data-p="pvx" aria-label="뒤로가기"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button><div class="pv-top"><button class="pl-circ" data-p="pvx" aria-label="뒤로">${P('<path d="M15 5l-7 7 7 7" stroke-width="2.200"/>')}</button><div class="pv-ttl"></div><button class="pl-circ" data-p="pvm" aria-label="더보기">${P('<circle cx="5.500" cy="12" r="1.300" fill="currentColor"/><circle cx="12" cy="12" r="1.300" fill="currentColor"/><circle cx="18.500" cy="12" r="1.300" fill="currentColor"/>')}</button></div>
<div class="pv-main"><button class="pv-lu" data-p="pvi" aria-label="시각 정보">${P('<rect x="3.500" y="4.500" width="17" height="15" rx="3.500"/><path d="M3.500 16l4.500-4.500 4 4 3-3 5.500 5.500"/><circle cx="15.500" cy="9" r="1.200"/>')}${P('<path d="M10 8l4 4-4 4" stroke-width="2"/>')}</button><div class="pv-track" data-p="pvz">${l.map(it => `<div class="pv-s" data-id="${it.id}">${it.repoPhoto ? `<img src="${it.src}" alt="">` : it.ph ? `<div class="g" style="background:${it.grad}"></div>` : it.thumb ? `<img src="${turl(it)}" alt="" decoding="async">` : ""}</div>`).join("")}</div><div class="pv-info"></div></div>
<div class="pv-th">${l.map((it, i) => `<button data-p="pvt" data-j="${i}" aria-label="${i + 1}">${pvTh(it)}</button>`).join("")}</div>
`;
    v.classList.add("on");
    const tr = v.querySelector(".pv-track"); tr.scrollLeft = idx * (tr.clientWidth + 40); pvJ = -1; pvSync(idx, true);
    ["touchstart", "touchmove", "pointerdown", "pointermove"].forEach(n => tr.addEventListener(n, e => e.stopPropagation(), { passive: true }));
    document.documentElement.classList.add("pvo"); document.documentElement.classList.remove("pvb");
    tr.addEventListener("load", e => { const m = e.target; if (m.tagName === "IMG" && m.naturalHeight / m.naturalWidth > 1.7) m.parentNode.classList.add("tall"); }, true);
    let raf = 0; tr.addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const j = Math.round(tr.scrollLeft / (tr.clientWidth + 40)); if (j !== pvJ && j >= 0 && j < pvL.length) pvSync(j, true); }); }, { passive: true });
    if (pvIO) pvIO.disconnect();
    pvIO = new IntersectionObserver(es => es.forEach(async e => {
      if (!e.isIntersecting) return; const d = e.target; pvIO.unobserve(d);
      const item = l.find(i => String(i.id) === d.dataset.id);
      const put = async src => { const im = new Image(); im.decoding = "async"; im.alt = ""; im.src = src; try { await im.decode(); } catch (_) {} if (d.isConnected) d.replaceChildren(im); };
      if (item && item.repoPhoto) { await put(item.src); return; }
      const rec = await Media.get(+d.dataset.id); if (!rec) return;
      const u = URL.createObjectURL(rec.blob); pvUrls.push(u); await put(u);
    }), { root: tr, rootMargin: "0px 200% 0px 200%" });
    tr.querySelectorAll(".pv-s").forEach(d => { const item = l.find(i => String(i.id) === d.dataset.id); if (item && !item.ph && !item.repoPhoto) pvIO.observe(d); });
  }
  // PC 키보드 방향키로 사진 뷰어에서 이전/다음 사진으로 이동
  document.addEventListener("keydown", e => {
    const viewer = pv();
    if (!viewer || !viewer.classList.contains("on") || !pvL.length) return;
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    const next = Math.max(0, Math.min(pvL.length - 1, pvJ + (e.key === "ArrowRight" ? 1 : -1)));
    if (next === pvJ) return;
    const tr = viewer.querySelector(".pv-track");
    if (!tr) return;
    tr.scrollTo({ left: next * (tr.clientWidth + 40), behavior: "smooth" });
    pvSync(next);
  });
  function closeViewer() { document.documentElement.classList.remove("pvo", "pvb"); pv().classList.remove("on"); pv().innerHTML = ""; if (pvIO) pvIO.disconnect(); pvUrls.forEach(u => URL.revokeObjectURL(u)); pvUrls = []; }
  async function load(bottom) {
    await loadRepoPhotos();
    real = (await Media.all()).sort((a, b) => a.ts - b.ts); render(bottom);
    if (wantLatest) { wantLatest = false; const r = real.filter(i => i.type === "photo").pop(); if (r) { filter = "all"; order = "desc"; openViewer(r.id); } }
  }
  function render(bottom) {
    const g = el.querySelector(".pl-grid"), keep = g ? g.scrollTop : 0, l = view(), b = base();
    [...urls.keys()].forEach(k => { if (!real.some(i => i.id === k)) { URL.revokeObjectURL(urls.get(k)); urls.delete(k); } });
    const np = b.filter(i => i.type === "photo").length, nv = b.length - np;
    const realSel = [...selected].filter(id => typeof id === "number").length;
    const cells = l.map(it => `<button class="pl-cell${sel && selected.has(it.id) ? " sl" : ""}" data-p="cell" data-id="${it.id}">${it.repoPhoto ? `<img src="${it.src}" alt="${it.name}" loading="lazy">` : it.ph ? `<div class="g" style="background:${it.grad}"></div>` : `<img src="${turl(it)}" alt="">`}${it.type === "video" ? `<span class="dur">${fmtDur(it.dur || 0)}</span>` : ""}${sel ? `<i class="ck${selected.has(it.id) ? " on" : ""}"></i>` : ""}</button>`).join("");
    const tinted = false;
    main.innerHTML = `<div class="pl-head"><div class="pl-title-wrap"><h1>보관함</h1><div class="pl-count">${np + nv}개의 항목</div></div><div class="pl-r"><button class="pl-circ" aria-label="필터" disabled>${I.filter}</button><button class="pl-pill" disabled>선택</button></div></div>
<div class="pl-grid">${cells}</div>
${sel ? "" : `<div class="pl-tabbar"><div class="pl-tabs"><button class="pl-tab on" disabled aria-label="보관함">${I.photo}<span>보관함</span></button><button class="pl-tab" disabled aria-label="모음">${I.coll}<span>모음</span></button></div><button class="pl-sbtn" disabled aria-label="검색">${I.search}</button></div>`}
${sel ? `<div class="pl-bottom"><span></span><button class="pl-circ big" data-p="bdel" ${realSel ? "" : "disabled"} aria-label="삭제">${I.trash}</button></div>`
  : ""}`;
    const ng = el.querySelector(".pl-grid"); if (ng) { const go = () => { ng.scrollTop = bottom ? ng.scrollHeight : keep; }; go(); if (bottom) requestAnimationFrame(() => { go(); setTimeout(go, 120); }); }
  }

  /* 필터 메뉴 */
  function openMenu() {
    const it = (k, label, on, p) => `<button class="pl-mi" data-p="${p}" data-k="${k}"><span>${label}</span>${on ? I.check : ""}</button>`;
    menu.innerHTML = `<div class="pl-mh">보기</div>${it("all", "모든 항목", filter === "all", "mf")}${it("photo", "사진", filter === "photo", "mf")}${it("video", "비디오", filter === "video", "mf")}<div class="pl-ms"></div><div class="pl-mh">날짜 정렬</div>${it("asc", "오래된 순", order === "asc", "mo")}${it("desc", "최신 순", order === "desc", "mo")}`;
    menu.classList.add("on"); mb.classList.add("on");
  }
  const closeMenu = () => { menu.classList.remove("on"); mb.classList.remove("on"); };
  mb.addEventListener("click", closeMenu);

  /* 삭제 */
  function askDel(ids) {
    pendingDel = ids;
    act.innerHTML = `<div class="ag"><div class="am">선택한 항목 ${ids.length}개를 삭제하시겠습니까?</div><button class="ab red" data-p="dodel">삭제</button></div><div class="ag"><button class="ab" data-p="actclose">취소</button></div>`;
    act.classList.add("on"); ab.classList.add("on");
  }
  const closeAct = () => { act.classList.remove("on"); ab.classList.remove("on"); pendingDel = null; };
  ab.addEventListener("click", closeAct);

  el.addEventListener("click", async e => {
    const t = e.target.closest("[data-p]"); if (!t) return;
    switch (t.dataset.p) {
      case "select": case "filter": case "mf": case "mo": break;
      case "pvx": closeViewer(); break;
      case "pvz": { const v = pv(); v.classList.toggle("bare"); document.documentElement.classList.toggle("pvb", v.classList.contains("bare")); if (!v.classList.contains("bare")) pvSync(pvJ, true); break; }
      case "pvt": { const tr = pv().querySelector(".pv-track"); tr.style.scrollSnapType = "none"; tr.scrollLeft = +t.dataset.j * (tr.clientWidth + 40); tr.style.scrollSnapType = ""; pvSync(+t.dataset.j); break; }
      case "pvh": { const it = pvL[pvJ]; if (it) { favs.has(it.id) ? favs.delete(it.id) : favs.add(it.id); pvSync(pvJ, true); } break; }
      case "pvi": case "pvm": pv().querySelector(".pv-info").classList.toggle("on"); break;
      case "pvs": { const it = pvL[pvJ]; try { if (it && it.repoPhoto && navigator.share) await navigator.share({ url: it.src }); else if (it && it.ph !== true && navigator.share && !it.repoPhoto) { const r = await Media.get(it.id); if (r) await navigator.share({ files: [new File([r.blob], "photo", { type: r.blob.type })] }); } } catch (_) {} break; }
      case "pvd": { const it = pvL[pvJ]; if (it && typeof it.id === "number") askDel([it.id]); break; }
      case "cell": { if (!sel) { openViewer(t.dataset.id); break; } const id = t.dataset.id, k = real.length ? +id : id; selected.has(k) ? selected.delete(k) : selected.add(k); render(); break; }
      case "bdel": { const ids = [...selected].filter(id => typeof id === "number"); if (ids.length) askDel(ids); break; }
      case "actclose": closeAct(); break;
      case "dodel": {
        const ids = pendingDel || []; closeAct(); await Media.del(ids);
        closeViewer(); real = real.filter(i => !ids.includes(i.id)); selected.clear(); if (!real.length) sel = false; render(); break;
      }
    }
  });

  /* 열기/닫기 */
  async function open() {
    if (isOpen) return; isOpen = true; sel = false; selected.clear(); closeMenu(); closeAct();
    render(true); originFrom(el, "photos");
    el.classList.add("show"); void el.offsetWidth; el.classList.add("open"); el.setAttribute("aria-hidden", "false");
    await load(true);
  }
  function close() {
    if (!isOpen) return; isOpen = false; closeMenu(); closeAct(); closeViewer();
    el.classList.remove("open"); el.setAttribute("aria-hidden", "true");
    setTimeout(() => { if (!isOpen) { el.classList.remove("show"); urls.forEach(u => URL.revokeObjectURL(u)); urls.clear(); } }, 430);
  }
  document.addEventListener("app:open", e => { if (e.detail.id === "photos") open(); });
  document.addEventListener("app:close", close);
  document.addEventListener("media:change", () => { if (isOpen) load(); });
  return { open, close, openLatest() { wantLatest = true; if (window.Home) Home.openApp("photos"); else open(); } };
})();
window.CameraApp = CameraApp; window.PhotosApp = PhotosApp;
(() => {
  const s = document.querySelector("#screen"), apps = ["calendar", "camera", "photos", "messages", "phone", "safari", "kakaotalk", "instagram", "clock", "x", "everytime", "chatgpt", "spotify", "fromm", "notes", "youtube", "netflix", "danggeun", "baemin", "albamon"];
  document.addEventListener("app:open", e => { if (apps.includes(e.detail.id)) s.classList.add("in-app"); });
  document.addEventListener("app:close", () => s.classList.remove("in-app"));
})();

/* App-specific styles */
(()=>{const style=document.createElement("style");style.textContent="/* ===== 카메라 / 사진 앱 공통 컨테이너 ===== */\n#cam-app,#pho-app{position:absolute;inset:0;z-index:5;display:none;flex-direction:column;padding-top:calc(env(safe-area-inset-top,0px) + 54px);opacity:0;transform:scale(.15);border-radius:44px;overflow:hidden;transition:transform .42s cubic-bezier(.2,.9,.25,1),opacity .22s,border-radius .42s}\n#cam-app.show,#pho-app.show{display:flex}\n#cam-app.open,#pho-app.open{opacity:1;transform:none;border-radius:0}\n#cam-app button,#pho-app button{font-family:var(--font)}\n#pho-app{background:#fff;color:#111}";document.head.appendChild(style);})();

(()=>{const s=document.createElement("style");s.textContent="#cam-app{background:#000;color:#fff}\n#cam-app.opts-open .cm-ico[data-c=opts] svg{transform:rotate(180deg)}\n#cam-app.recording .cm-top{visibility:hidden}\n#cam-app.recording .cm-rec{display:flex}\n#cam-app.opts-open .cm-opts{opacity:1;pointer-events:auto;transform:none}\n#cam-app.recording .cm-modes{visibility:hidden}\n#cam-app[data-mode=video] .cm-shutter i{background:#ff3b30}\n#cam-app.recording .cm-shutter i{inset:20px;border-radius:8px;background:#ff3b30}\n#cam-app.recording .cm-flip{opacity:.35;pointer-events:none}";document.head.appendChild(s);})();
