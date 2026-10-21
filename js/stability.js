/* Hwaho2 stability guard: isolated recovery, image fallback, safe storage parsing. */
(() => {
  "use strict";
  const appByScript = [
    ["instagram.js", "ig-app"], ["twitter.js", "x-app"], ["safari.js", "saf-app"],
    ["photos.js", "pho-app"], ["chatgpt.js", "gp-app"], ["spotify.js", "sp-app"],
    ["kakaotalk.js", "kko-app"], ["notes.js", "nt-app"], ["youtube.js", "yt-app"],
    ["netflix.js", "nf-app"], ["baemin.js", "bm-app"], ["fromm.js", "fm-app"], ["fromm-app.js", "fm-app"],
    ["everytime.js", "et-app"], ["calendar.js", "cal-app"], ["imessage.js", "msg-app"],
    ["phone.js", "tel-app"], ["clock.js", "clk-app"], ["karrot.js", "dg-app"],
    ["albamon.js", "am-app"]
  ];
  const root = document.getElementById("screen");
  const home = document.getElementById("home");
  function recover(id, reason) {
    const layer = document.getElementById(id);
    if (!layer) return;
    const currentByLayer = {"ig-app":"instagram","x-app":"x","saf-app":"safari","pho-app":"photos","cam-app":"camera","gp-app":"chatgpt","sp-app":"spotify","kko-app":"kakaotalk","nt-app":"notes","yt-app":"youtube","nf-app":"netflix","bm-app":"baemin","fm-app":"fromm","et-app":"everytime","cal-app":"calendar","msg-app":"messages","tel-app":"phone","clk-app":"clock","dg-app":"danggeun","am-app":"albamon"};
    if (!window.Home || window.Home.current !== currentByLayer[id]) {
      console.error("[Hwaho stability] Background app error:", id, reason);
      return;
    }
    console.error("[Hwaho stability] App isolated:", id, reason);
    layer.setAttribute("aria-hidden", "true");
    layer.style.pointerEvents = "none";
    layer.style.display = "none";
    layer.classList.remove("open", "show", "on", "active", "opening", "in-app");
    const appId = currentByLayer[id];
    if (window.Home && window.Home.current === appId) {
      window.Home.current = null;
      try { localStorage.removeItem("hwaho-last-screen-v1"); } catch (_) {}
      if (home) {
        home.style.display = "flex";
        home.style.opacity = "1";
        home.style.transform = "none";
        home.style.pointerEvents = "auto";
      }
    }
  }
  window.addEventListener("error", event => {
    if (event.target && event.target.tagName === "IMG") return;
    const file = String(event.filename || "");
    const match = appByScript.find(([name]) => file.includes(name));
    if (match) {
      const id = file.includes("photos.js") && window.Home && window.Home.current === "camera" ? "cam-app" : match[1];
      recover(id, event.message || "runtime error");
    }
  }, true);
  window.addEventListener("unhandledrejection", event => {
    const current = window.Home && window.Home.current;
    const map = {
      instagram: "ig-app", x: "x-app", safari: "saf-app", photos: "pho-app", camera: "cam-app",
      chatgpt: "gp-app", spotify: "sp-app", kakaotalk: "kko-app", notes: "nt-app",
      youtube: "yt-app", netflix: "nf-app", baemin: "bm-app", fromm: "fm-app",
      everytime: "et-app", calendar: "cal-app", messages: "msg-app", phone: "tel-app",
      clock: "clk-app", danggeun: "dg-app", albamon: "am-app"
    };
    if (current && map[current]) recover(map[current], event.reason || "unhandled rejection");
  });
  const fallback = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="#eeeeef"/><rect x="13" y="15" width="38" height="34" rx="4" fill="none" stroke="#a1a1aa" stroke-width="3"/><circle cx="24" cy="26" r="4" fill="#a1a1aa"/><path d="M16 44l12-12 8 8 5-5 7 9" fill="none" stroke="#a1a1aa" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  function tuneImage(img) {
    if (!img || img.tagName !== "IMG") return;
    if (!img.hasAttribute("decoding")) img.decoding = "async";
    if (img.closest("[id$='-app']") && !img.hasAttribute("loading")) img.loading = "lazy";
  }
  function tuneImages(scope) {
    if (!scope || !scope.querySelectorAll) return;
    if (scope.tagName === "IMG") tuneImage(scope);
    scope.querySelectorAll("img").forEach(tuneImage);
  }
  if (root) {
    tuneImages(root);
    new MutationObserver(records => {
      for (const record of records) for (const node of record.addedNodes) {
        if (node.nodeType === 1) {
          if (node.tagName === "IMG") tuneImage(node);
          else tuneImages(node);
        }
      }
    }).observe(root, { childList: true, subtree: true });
    root.addEventListener("error", event => {
      const img = event.target;
      if (!img || img.tagName !== "IMG" || img.dataset.hwahoFallback) return;
      img.dataset.hwahoFallback = "1";
      img.src = fallback;
    }, true);
  }
  window.HwahoStability = {
    readJSON(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        if (raw == null) return fallback;
        try {
          const value = JSON.parse(raw);
          const valid = {
            "ios-insta-v1": v => v && typeof v === "object" && v.like && typeof v.like === "object",
            "ios-x-v2": v => v && typeof v === "object" && !Array.isArray(v),
            "ios-safari-v1": v => v && Array.isArray(v.tabs) && v.tabs.length > 0,
            "ios-chatgpt-v1": v => v && Array.isArray(v.chats),
            "ios-spotify-v1": v => v && Array.isArray(v.liked),
            "ios-spotify-playback-v1": v => v && Array.isArray(v.Q),
            "ios-kakao-v5": v => v && Array.isArray(v.chats) && Array.isArray(v.friends),
            "nt.notes.v1": v => Array.isArray(v),
            "nt.folders.v1": v => Array.isArray(v),
            "nt.att.v1": v => v && typeof v === "object" && !Array.isArray(v),
            "nt.tags.v1": v => Array.isArray(v),
            "nt.prefs.v1": v => v && typeof v === "object" && !Array.isArray(v)
          }[key];
          if (!valid || valid(value)) return value;
        } catch (_) {}
        try { sessionStorage.setItem("hwaho-recovery:" + key, raw); } catch (_) {}
        console.warn("[Hwaho stability] Invalid saved data preserved for this session:", key);
        return fallback;
      } catch (_) { return fallback; }
    },
    writeJSON(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; }
      catch (error) { console.warn("[Hwaho stability] Save failed; previous data retained:", key, error); return false; }
    }
  };
})();