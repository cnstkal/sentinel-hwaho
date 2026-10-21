/* 카카오톡 채팅 목록: 홍중 메시지를 16:45로 고정하고 윤둥이보다 위에 표시 */
(() => {
  const KEY = "ios-kakao-v6";
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!Array.isArray(data.chats)) return;

    const hongjoong = data.chats.find(c =>
      c.id === "c15" || (Array.isArray(c.ids) && c.ids.length === 1 && c.ids[0] === "f5")
    );
    const yunho = data.chats.find(c => c.id === "c0");
    if (!hongjoong || !Array.isArray(hongjoong.msgs) || !hongjoong.msgs.length) return;

    const targetTime = new Date("2026-10-19T16:45:00+09:00").getTime();
    let latest = hongjoong.msgs.reduce((a, b) => (a.ts || 0) > (b.ts || 0) ? a : b);
    latest.ts = targetTime;
    hongjoong.msgs.sort((a, b) => (a.ts || 0) - (b.ts || 0));

    // 홍중 채팅을 상단 고정하고 윤둥이 채팅은 고정 해제해 목록에서 홍중이 먼저 오도록 함
    hongjoong.pin = 1;
    if (yunho) yunho.pin = 0;

    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("카카오톡 채팅 시간/순서 보정 실패", e);
  }
})();