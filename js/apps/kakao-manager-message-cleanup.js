/* 성현이형(매니저) 카카오톡에서 지정한 두 메시지 삭제 */
(() => {
  const KEY = "ios-kakao-v6";
  const normalize = value => String(value || "").replace(/\s+/g, "").replace(/[.!?…~ㅋㅎㅠㅜ]/g, "");
  const blocked = [
    normalize("티하나도안낫어홍중이민기도칭찬하더라"),
    normalize("걔네가요?")
  ];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!Array.isArray(data.chats)) return;
    const manager = data.chats.find(c =>
      c.id === "c3" ||
      (Array.isArray(c.ids) && c.ids.length === 1 && c.ids[0] === "f2")
    );
    if (!manager || !Array.isArray(manager.msgs)) return;
    const before = manager.msgs.length;
    manager.msgs = manager.msgs.filter(message => {
      const text = normalize(message.text);
      return !blocked.some(target => text.includes(target));
    });
    if (manager.msgs.length !== before) localStorage.setItem(KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("매니저 채팅 메시지 삭제 처리 실패", error);
  }
})();