/* 가족 단톡방에서 성화(내가 보낸 메시지)의 "꺼져"를 "?"로 수정 */
(() => {
  const KEY = "ios-kakao-v6";
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!Array.isArray(data.chats)) return;
    const family = data.chats.find(c => c.id === "c2" || c.name === "우리 가족");
    if (!family || !Array.isArray(family.msgs)) return;
    let changed = false;
    family.msgs.forEach(message => {
      if (message.from === "me" && String(message.text || "").trim() === "꺼져") {
        message.text = "?";
        changed = true;
      }
    });
    if (changed) localStorage.setItem(KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("가족 채팅 메시지 수정 실패", error);
  }
})();