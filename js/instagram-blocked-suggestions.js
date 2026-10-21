/* Instagram: permanently exclude the three unwanted suggested accounts from the rendered UI. */
(() => {
  const blockedNames = [
    "xnn****",
    "iwaitedfort...",
    "iwaitedfortherightmo****",
    "sgyun***"
  ];
  const blockedPhotoPaths = [
    "/xnn****/",
    "/iwaitedfortherightmo****/",
    "/sgyun***/"
  ];

  function removeBlockedSuggestions(root = document) {
    const app = root.querySelector?.("#ig-app") || (root.matches?.("#ig-app") ? root : document.querySelector("#ig-app"));
    if (!app) return;

    app.querySelectorAll(".ig-srec, .ig-s").forEach(card => {
      const text = (card.innerText || card.textContent || "").replace(/\s+/g, " ").trim();
      const images = [...card.querySelectorAll("img")].map(img => img.getAttribute("src") || "").join(" ");
      const blocked = blockedNames.some(name => text.includes(name)) ||
        blockedPhotoPaths.some(path => images.includes(path));
      if (blocked) card.remove();
    });
  }

  const start = () => {
    const app = document.querySelector("#ig-app");
    if (!app || app.dataset.blockedSuggestionsWatcher) return;
    app.dataset.blockedSuggestionsWatcher = "1";
    const observer = new MutationObserver(() => removeBlockedSuggestions(app));
    observer.observe(app, { childList: true, subtree: true, characterData: true });
    removeBlockedSuggestions(app);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
  document.addEventListener("app:open", start);
})();