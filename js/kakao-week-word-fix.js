/* 카카오톡 대화에서 '저번주'를 '지난주'로 교정 */
(() => {
  const KEY = "ios-kakao-v6";
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!Array.isArray(data.chats)) return;
    let changed = false;
    data.chats.forEach(chat => {
      if (!Array.isArray(chat.msgs)) return;
      chat.msgs.forEach(message => {
        if (typeof message.text === "string" && message.text.includes("저번주")) {
          message.text = message.text.replace(/저번주/g, "지난주");
          changed = true;
        }
      });
    });
    if (changed) localStorage.setItem(KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("카카오톡 문구 교정 실패", error);
  }
})();