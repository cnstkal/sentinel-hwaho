/* ===== kakaotalk.js (integrated) ===== */
/* ===== 카카오톡 ===== */
const KakaoApp = (() => {
  const $ = q => document.querySelector(q), el = $("#kko-app"), screen = $("#screen");
  const ic = p => `<svg viewBox="0 0 24 24">${p}</svg>`;
  const kakaoTone = new Audio(new URL("../audio/general/%E1%84%8F%E1%85%A1%E1%84%8F%E1%85%A1%E1%84%8B%E1%85%A9%E1%84%90%E1%85%A9%E1%86%A8.mp3", document.currentScript?.src || location.href).href);
  kakaoTone.preload = "auto";
  kakaoTone.load();
  document.addEventListener("pointerdown", function unlockkakaoTone(){
    try {
      kakaoTone.muted = false;
      kakaoTone.currentTime = 0;
      const p = kakaoTone.play();
      if (p && p.then) p.then(() => { kakaoTone.pause(); kakaoTone.currentTime = 0; }).catch(() => {});
    } catch(e) {}
  }, { once: true, capture: true });
  function playKakaoTone(){try{kakaoTone.pause();kakaoTone.currentTime=0; kakaoTone.volume=1; const p=kakaoTone.play();if(p&&p.catch)p.catch(()=>{ });}catch(e){}}
  function playNotificationTone(){playKakaoTone();}
  const I = {
    search: ic('<circle cx="10.500" cy="10.500" r="6.500"/><path d="M15.500 15.500l5 5"/>'), add: ic('<circle cx="10" cy="8" r="3.500"/><path d="M3.500 19.500c.8-3.500 3.200-5 6.500-5s5.700 1.500 6.500 5M19 8v6M16 11h6"/>'),
    note: ic('<path d="M9 18V6l10-2v12"/><circle cx="6.500" cy="18" r="2.500"/><circle cx="16.500" cy="16" r="2.500"/>'), gear: ic('<circle cx="12" cy="12" r="3"/><path d="M12 3v2.500M12 18.500V21M3 12h2.500M18.500 12H21M5.600 5.600l1.800 1.800M16.600 16.600l1.800 1.800M5.600 18.400l1.800-1.800M16.600 7.400l1.800-1.800"/>'),
    chev: ic('<path d="M6 9l6 6 6-6"/>'), newchat: ic('<path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/><path d="M15.500 4.500l4 4L12 16l-4 1 1-4z"/>'),
    back: ic('<path d="M15 5l-7 7 7 7" stroke-width="2"/>'), plus: ic('<path d="M12 5v14M5 12h14"/>'), up: ic('<path d="M12 19V5M6 11l6-6 6 6"/>'), menu: ic('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    t1: ic('<circle cx="12" cy="8" r="3.800"/><path d="M4.500 20c.8-4 3.800-6 7.500-6s6.700 2 7.500 6"/>'), t2: ic('<path d="M12 4c-4.700 0-8.500 3.100-8.500 7s3.800 7 8.500 7c1 0 2-.1 2.900-.4 1.200 1 2.800 1.600 4.500 1.700-.8-.9-1.300-1.900-1.500-3 1.700-1.300 2.600-3.100 2.600-5.300C20.500 7.100 16.700 4 12 4z"/>'),
    t3: ic('<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M10 9l5 3-5 3z"/>'), t4: ic('<path d="M5 8h14l-1 12H6zM9 8V6.500a3 3 0 0 1 6 0V8"/>'), t5: ic('<circle cx="6" cy="12" r="1.200"/><circle cx="12" cy="12" r="1.200"/><circle cx="18" cy="12" r="1.200"/>'),
  };
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])), uid = () => Math.random().toString(36).slice(2, 9), KEY = "ios-kakao-v6";
  const REPLIES = ["ㅋㅋㅋㅋ 그래!", "오 좋다 👍", "잠깐만~ 이따 연락할게", "알겠어ㅎㅎ", "진짜? 대박", "지금 뭐해?", "나중에 밥 먹자!", "확인했어 고마워 😊"];
  const FR = [["f0", "윤둥이", "", 1], ["f3", "엄마", "좋은 날. 좋은.시간.^^", 1], ["h6", "아빠", "더 높은 곳을 바라보아야 한다", 1], ["f5", "김홍중 (NO1)", "", 0], ["f4", "송민기 (FIXON)", "", 0], ["f1", "철수", "💍 D+120", 0], ["f2", "성현이형(매니저)", "", 0], ["f7", "형", "", 0],
    ["f8", "승호형(믹싱)", "믹싱 중 🎚️", 0, 1], ["f9", "지안", "Be happy", 0, 1], ["f6", "도현", "", 0, 1], ["f10", "레도형", "Be humble", 0, 1], ["h1", "최PD(무대감독)", "", 0, 1], ["h2", "박팀장(조명)", "", 0, 1], ["h3", "김팀장님(레코드)", "", 0, 1], ["h4", "성민(동창)", "", 0, 1], ["h5", "수아 실장", "", 0, 1], ["ad1", "배달의민족", "", 0, 1], ["ad2", "CGV", "", 0, 1], ["ad3", "올리브영", "", 0, 1], ["ad4", "CJ대한통운", "", 0, 1]];
  const TOTAL = 302;
  let D = null; try { D = window.HwahoStability ? window.HwahoStability.readJSON(KEY, null) : JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
  if (!D || !D.chats) {
    const H = 36e5, n = Date.now(), m = (from, text, ago) => ({ id: uid(), from, text, ts: n - ago * H });
    D = { friends: FR.map(([id, name, st, fav, hid]) => ({ id, name, st, fav, hid })), chats: [
      { id: "c0", ids: ["f0"], pin: 1, unread: 1, msgs: [
        { id: uid(), from: "f0", text: "모해", ts: new Date("2026-10-15T18:00:00+09:00").getTime() },
        { id: uid(), from: "me", text: "작업중", ts: new Date("2026-10-15T18:01:00+09:00").getTime() },
        { id: uid(), from: "me", text: "왱?", ts: new Date("2026-10-15T18:01:30+09:00").getTime() },
        { id: uid(), from: "f0", text: "심심해", ts: new Date("2026-10-15T18:02:00+09:00").getTime() },
        { id: uid(), from: "me", text: "촬영간 거 아니야?", ts: new Date("2026-10-15T18:03:00+09:00").getTime() },
        { id: uid(), from: "f0", text: "무한대기중 ㅠ", ts: new Date("2026-10-15T18:04:00+09:00").getTime() },
        { id: uid(), from: "f0", text: "형이랑 있구싶다", ts: new Date("2026-10-15T18:04:20+09:00").getTime() },
        { id: uid(), from: "me", text: "전화 ㄱ", ts: new Date("2026-10-15T18:05:00+09:00").getTime() },

        { id: uid(), from: "me", text: "미국 가는 거 담주인가?", ts: new Date("2026-10-16T13:00:00+09:00").getTime() },
        { id: uid(), from: "f0", text: "웅", ts: new Date("2026-10-16T13:00:30+09:00").getTime() },
        { id: uid(), from: "me", text: "무슨 촬영을 미국까지 가서해?", ts: new Date("2026-10-16T13:01:00+09:00").getTime() },
        { id: uid(), from: "f0", text: "나도 모르겠당", ts: new Date("2026-10-16T13:01:30+09:00").getTime() },
        { id: uid(), from: "me", text: "너 없이 나 어떡하라고 ㅠㅠ", ts: new Date("2026-10-16T13:02:00+09:00").getTime() },
        { id: uid(), from: "f0", text: "ㅎㅎㅎㅎ", ts: new Date("2026-10-16T13:03:00+09:00").getTime() },
        { id: uid(), from: "f0", text: "알아서 해", ts: new Date("2026-10-16T13:03:30+09:00").getTime() },
        { id: uid(), from: "me", text: "차가워…", ts: new Date("2026-10-16T13:04:00+09:00").getTime() },
        { id: uid(), from: "f0", text: "작업실이지", ts: new Date("2026-10-16T13:05:00+09:00").getTime() },
        { id: uid(), from: "me", text: "엉", ts: new Date("2026-10-16T13:05:30+09:00").getTime() },
        { id: uid(), from: "f0", text: "나와봐", ts: new Date("2026-10-16T13:06:00+09:00").getTime() },
        { id: uid(), from: "me", text: "헐 ㅁㅊ", ts: new Date("2026-10-16T13:07:00+09:00").getTime() },
        { id: uid(), from: "me", text: "ㄱㄷ", ts: new Date("2026-10-16T13:07:20+09:00").getTime() },
        { id: uid(), from: "me", text: "바로나감", ts: new Date("2026-10-16T13:07:40+09:00").getTime() },

        { id: uid(), from: "me", text: "촬영 없음 저녁에 잠깐 올래?", ts: new Date("2026-10-17T17:00:00+09:00").getTime() },
        { id: uid(), from: "me", text: "홍중이도 있음", ts: new Date("2026-10-17T17:00:20+09:00").getTime() },
        { id: uid(), from: "f0", text: "몇시쯤?", ts: new Date("2026-10-17T17:15:00+09:00").getTime() },
        { id: uid(), from: "me", text: "아홉시열시? 오래 있을 것 같은데", ts: new Date("2026-10-17T17:16:00+09:00").getTime() },
        { id: uid(), from: "me", text: "너 편할 때 와도 돼", ts: new Date("2026-10-17T17:16:20+09:00").getTime() },
        { id: uid(), from: "f0", text: "나 자정 다 되어야 퇴근할듯", ts: new Date("2026-10-17T17:20:00+09:00").getTime() },
        { id: uid(), from: "f0", text: "못갈 것 같으면 연락할겡", ts: new Date("2026-10-17T17:20:20+09:00").getTime() },
        { id: uid(), from: "me", text: "ㅇㅋ", ts: new Date("2026-10-17T17:21:00+09:00").getTime() },
        { id: uid(), from: "me", text: "사랑해❤️", ts: new Date("2026-10-17T17:21:20+09:00").getTime() },
        { id: uid(), from: "f0", text: "나두", ts: new Date("2026-10-17T17:22:00+09:00").getTime() },

        { id: uid(), from: "me", text: "똑똑", ts: new Date("2026-10-18T15:18:00+09:00").getTime() },
        { id: uid(), from: "me", text: "혹시 나도 모르는 사이에 우리 헤어진거 아니지?", ts: new Date("2026-10-18T15:18:20+09:00").getTime() },
        { id: uid(), from: "me", text: "전화 좀 받아 ㅜㅜ", ts: new Date("2026-10-18T15:18:40+09:00").getTime() }
      ] },
      { id: "c1", ids: ["f1"], unread: 2, msgs: [m("me", "철수야 신혼여행 사진 봤다 ㅋㅋ 몰디브 미쳤더라", 110), m("f1", "ㅋㅋㅋ 고마워 와이프가 너무 좋아함", 109.5), m("me", "형수님 사진 진짜 잘 나왔더라", 109), m("f1", "그치? 근데 나는 거의 짐꾼이었다 ㅋㅋㅋ", 108.5), m("me", "ㅋㅋㅋㅋㅋㅋ 인증이네", 108), m("f1", "너도 얼른 좋은 사람 만나서 가라 ㅋㅋ", 107.5), m("me", "나는 작업이 연인임 ㅋㅋ", 107), m("f1", "웃기네 ㅋㅋㅋ 앨범 나오면 제일 먼저 들려줘", 106), m("me", "당연하지 가장 먼저 보내줄게", 105.5), m("f1", "기대된다 진짜", 105), m("me", "야 결혼 생활은 좀 어때 ㅋㅋ", 30), m("f1", "행복하다 ㅋㅋ 앨범 3번 트랙 계속 틀어놓는 중", 29.5), m("me", "고맙다 이번 주말에 한잔하자", 29.4), m("f1", "토요일 7시 어때?", 1), m("f1", "민기랑 홍중이도 부르자", .9)] },
      { id: "c6", name: "앨범 작업방", ids: ["f1", "f4", "f8", "f9"], unread: 12, msgs: [m("f8", "후렴 쪽 베이스 좀 더 키워볼까요?", 40), m("f9", "저는 지금 정도가 좋은 것 같아요", 39.8), m("me", "저도 지금 밸런스 좋아요 형 ㅎㅎ", 39.5), m("f4", "어제 만든 신스 레이어 보냈어요", 39), m("f8", "오 괜찮은데요 브릿지에 넣어볼게요", 38.5), m("f1", "나 어제 3번 트랙 계속 들었다 ㅋㅋㅋ", 38), m("me", "고마워 ㅋㅋ 다들 고생 많아요", 37.5), m("f9", "저 코러스 2번 톤 다시 잡아볼게요", 30), m("f8", "그럼 마스터링은 그다음에 진행합니다", 29.5), m("me", "넵 형 일정 맞춰서 갈게요", 29), m("f4", "내일 점심 같이 먹어요 제가 살게요", 20), m("f1", "나도 낀다 ㅋㅋ", 19.8), m("me", "콜", 19.6), m("f8", "그럼 12시 반에 스튜디오 앞에서 봐요", 19.4), m("f8", "마스터링 파일 공유드렸습니다", 1.6), m("f9", "코러스 2번 다시 녹음할게요", 1.5), m("f4", "확인했어요 내일 오전에 맞춰볼게요", 1.4), m("f1", "다들 고생 많았다 👍", 1.3)] },
      { id: "c7", name: "콘서트 스태프 단톡", ids: ["h1", "h2", "f2"], unread: 3, msgs: [m("h1", "공연 동선표 공유드립니다. 확인 부탁드려요", 50), m("h2", "조명 파트 확인했습니다", 49.8), m("f2", "의상팀도 확인했고 피팅은 목요일입니다", 49.5), m("me", "확인했습니다! 수고 많으세요", 49), m("h1", "오프닝 연출 수정안 나왔어요", 30), m("h1", "인이어 체크는 13시 30분부터 진행합니다", 29.9), m("f2", "성화 인이어는 제가 챙길게요", 29.5), m("me", "감사합니다 형!", 29), m("h2", "리허설 때 조명 한 번 더 맞춰볼게요", 8), m("h1", "네 좋습니다. 큐시트 확정되면 바로 올릴게요", 7.8), m("h1", "리허설 14시 시작입니다. 30분 전까지 도착 부탁드려요", 2.4), m("h2", "조명 큐시트 수정본 올렸습니다", 2.2), m("f2", "대기실 케이터링은 제가 확인할게요", 2.1)] },
      { id: "c2", name: "우리 가족", ids: ["f3", "f7", "h6"], unread: 0, msgs: [m("f3", "아들 밥은 잘 챙겨 먹고 다니니?", 130), m("me", "응 엄마 걱정마 ㅋㅋ", 129.5), m("f3", "사진 보니까 살 빠진 것 같던데", 129), m("me", "작업 때문에 좀 바빴어 요즘", 128.5), m("f7", "형 노래 계속 듣는 중 ㅋㅋ 친구들도 다 좋대", 128), m("me", "고맙다 ㅋㅋ 용돈 필요하면 말해", 127.5), m("f7", "오 진짜? 그럼 말할게 ㅋㅋㅋ", 127), m("h6", "아들 일 너무 무리하지 말고 건강이 우선이다", 100), m("me", "네 아빠 알겠어요 ㅎㅎ", 99.5), m("f3", "시간 되면 집에 와라 반찬 해놨다", 80), m("me", "이번 주는 어렵고 다음 주에 갈게요", 79.5), m("f3", "그래 바쁘면 어쩔 수 없지. 대신 몸 챙겨", 79), m("f3", "아들 주말에 집 오니?", 52), m("f7", "너 오면 치킨 시키자", 51.9), m("me", "응 토요일 저녁에 갈게", 51), m("h6", "운전 조심해서 와라", 50.8), m("f3", "김치도 챙겨놨다 🍗", 50.5)] },
      { id: "c3", ids: ["f2"], unread: 1, msgs: [m("f2", "성화야 다음 주 스케줄 나왔다. 월요일은 라디오 녹화 11시야", 200), m("me", "넵 몇 시에 출발해요?", 199.8), m("f2", "9시 반에 숙소 앞으로 갈게. 이동시간 40분 잡았어", 199.6), m("me", "알겠습니다 그때 내려가 있을게요", 199.5), m("f2", "야 오늘 저녁 뭐 먹을래? 나 오늘 일찍 끝남", 170), m("me", "저는 아무거나 괜찮아요", 169.8), m("f2", "그럼 삼겹살 어때. 구월동에 새로 생긴 데 있더라", 169.6), m("me", "좋아요! 몇 시에 볼까요?", 169.5), m("f2", "7시. 내가 예약해둘게", 169.3), m("me", "넵 감사합니다", 169), m("f2", "어제 고기 맛있었지? 다음엔 네가 골라", 120), m("me", "알겠습니다 다음엔 제가 쏠게요", 119.8), m("f2", "됐다 내가 사줄게. 너 요즘 잠은 제대로 자냐", 119.6), m("me", "새벽에 작업하느라 좀 못 자요 ㅠㅠ", 119.4), m("f2", "무리하지 마. 스케줄 빡센 날은 차에서라도 눈 붙여", 119.2), m("me", "걱정해주셔서 감사해요", 119), m("f2", "이번 주말에 영화 볼래? 그 신작 나왔더라", 96), m("me", "오 좋아요! 어떤 영화요?", 95.8), m("f2", "액션 하나 있는데 평 좋더라. 토요일 저녁 어때", 95.6), m("me", "토요일 괜찮아요. 영화 끝나고 밥도 먹어요", 95.4), m("f2", "ㅇㅋ 팝콘은 내가 산다", 95.2), m("me", "그럼 음료 사 갈게요", 95), m("f2", "표 예매했다. 7시 40분 용산이야 좌석 링크 보낸다", 72), m("me", "넵 확인했어요! 감사합니다", 71.8), m("f2", "참 영화 보기 전에 소율이 피팅 잠깐 있어. 4시 반 성수야", 70), m("me", "아 네 알겠습니다. 4시 반까지 갈게요", 69.8), m("f2", "그래. 끝나면 내가 용산까지 태워줄게", 69.6), m("f2", "영화 재밌었다 너 중간에 졸더라", 48), m("me", "아니에요 안 졸았어요", 47.8), m("f2", "거짓말 다음엔 코미디 보자", 47.6), m("me", "좋아요", 47.4), m("f2", "내일 스케줄 확인해봐. 방송국 도착하면 지하 2층이야", 30), m("me", "확인했어요. 대기실은 몇 층이에요?", 29.8), m("f2", "3층. 도착하면 전화해 내가 데리러 나갈게", 29.6), m("me", "넵 감사합니다", 29.4), m("f2", "성화야 점심 먹었어? 안 먹었으면 같이 국밥 ㄱ?", 8), m("me", "아직 안 먹었어요! 국밥 좋아요", 7.8), m("f2", "ㅇㅋ 20분 뒤에 집 앞이야 내려와", 7.6), m("me", "넵 바로 내려갈게요", 7.4), m("f2", "내일 인터뷰 질문지 메일로 보냈다. 이동하면서 한번 봐둬", 1.2), m("me", "확인할게요 감사합니다", 1.1), m("f2", "아 그리고 저녁에 치킨 먹을래? 내가 쏜다", 0.3)] },
      { id: "c8", ids: ["h3"], unread: 0, msgs: [m("h3", "성화씨 타이틀곡 가이드 확인해보셨나요?", 80), m("me", "네 팀장님 어제 들어봤는데 너무 좋았어요", 79.5), m("h3", "다행이네요. 수정할 부분 있으면 편하게 말씀 주세요", 79), m("me", "후렴 쪽 코러스만 조금 더 두껍게 가면 좋겠어요", 78.5), m("h3", "알겠습니다 믹싱팀에 전달할게요", 78), m("h3", "재킷 촬영 일정은 매니저님께 따로 전달드렸어요", 40), m("me", "네 확인했습니다 감사합니다!", 39.5), m("h3", "음원 발매 일정 확정되면 바로 공유드리겠습니다", 20), m("me", "네 감사합니다 팀장님!", 19.5)] },
      { id: "c15", ids: ["f5"], unread: 1, msgs: [m("f5", "어제 만든 비트 들어봤어?", 60), m("me", "ㅇㅇ 2번째 거 진짜 좋더라", 59.8), m("f5", "ㅋㅋㅋ 그거 네 곡에 쓸래?", 59.6), m("me", "ㅇㅇ 후렴 뒤에 깔고 싶음", 59.4), m("f5", "그럼 내일 작업실에서 같이 맞춰보자", 59.2), m("me", "ㅇㅋ", 59), m("f5", "야 너 어제 몇 시에 잤냐", 30), m("me", "새벽 5시 ㅋㅋㅋ", 29.8), m("f5", "미쳤냐 ㅋㅋㅋ 오늘은 일찍 자라", 29.6), m("me", "알겠어 ㅋㅋ 약속은 못 함", 29.4), m("f5", "오늘 작업실 몇 시에 와?", 7), m("me", "3시쯤 갈게", 6.8), m("f5", "ㅇㅋ 저녁은 국밥 시킬까?", 6.5), m("me", "ㅇㅇ 순대국으로", 6.4), m("f5", "커피는 내가 사갈게", 2.5)] },
      { id: "c4", name: "동네 친구들", ids: ["f1", "f4", "f5", "f6"], unread: 5, msgs: [m("f1", "다들 요즘 뭐하고 사냐 ㅋㅋ 단톡 조용하네", 90), m("f4", "나 요즘 편곡 알바 하느라 정신없음", 89.8), m("f5", "나는 작업실에서 살고 있다", 89.6), m("f6", "나 이사 준비 중 ㅠㅠ 박스만 20개", 89.4), m("me", "나도 작업하느라 폐인임 ㅋㅋ", 89.2), m("f1", "성화는 그래도 곧 앨범 나오잖아 부럽다", 89), m("me", "아직 마스터링 중이야 ㅋㅋ", 88.8), m("f4", "나오면 단톡방에 제일 먼저 올려라", 88.6), m("me", "ㅇㅋ 약속", 88.4), m("f6", "그럼 나오는 날 축하주 하자 ㅋㅋ", 88.2), m("f4", "이번 주 토요일 축하주 콜?", 5), m("f5", "나 가능 ㅋㅋ", 4.8), m("f6", "7시 고깃집에서 보자", 4.5), m("f1", "나도 OK", 4.2), m("f4", "주인공은 늦게 와도 됨 ㅋㅋ", 4)] },
      { id: "c9", ids: ["h4"], unread: 0, msgs: [m("h4", "성화야 잘 지내냐? 뉴스에서 이름 봤다 ㅋㅋ", 200), m("me", "ㅋㅋㅋ 오랜만이다 잘 지내지?", 199.5), m("h4", "나야 뭐 회사 다니지. 너 진짜 성공했네", 199), m("me", "아직 멀었어 ㅋㅋ 너는 일 어때", 198.5), m("h4", "야근 지옥이다 ㅠㅠ 주말만 기다림", 198), m("me", "고생이네 ㅠㅠ 밥 한번 먹자", 197.5), m("h4", "ㅇㅇ 시간 맞춰서 연락할게", 197), m("h4", "야 오랜만이다 동창회 올 거지?", 100), m("me", "시간 되면 갈게 ㅋㅋ", 99)] },
      { id: "c10", ids: ["h5"], unread: 0, msgs: [m("h5", "성화님 이번 달 스케줄표 보내드릴게요", 250), m("me", "네 실장님 감사합니다!", 249.5), m("h5", "파일 확인하시고 수정할 부분 말씀해주세요", 249), m("me", "확인했는데 14일 오후만 한 시간 늦춰주실 수 있을까요?", 248.5), m("h5", "네 가능합니다. 조정해서 다시 드릴게요~", 248), m("me", "감사합니다 ㅎㅎ", 247.5), m("h5", "내일 3시 예약 잡아뒀어요~", 130), m("me", "넵 감사합니다!", 129)] },
      { id: "c5", ids: ["f8"], unread: 0, msgs: [m("f8", "성화야 보컬 파일 받았다. 톤 좋더라", 300), m("me", "오 다행이에요 형 ㅎㅎ 후렴만 한 번 더 들어봐 주세요", 299.5), m("f8", "그래 후렴 이펙터 좀 만져볼게", 299), m("me", "넵 감사해요 형", 298.5), m("f8", "믹스 v1 줄게 일단 들어봐", 250), m("me", "오 벌써요? 바로 들어볼게요", 249.5), m("f8", "베이스 좀 더 올릴지 말지 의견 줘", 249), m("me", "저는 지금 좋은데 v2에서 한 번 올려봐 주세요", 248.5), m("f8", "ㅇㅋ v2 만들어볼게", 248), m("f8", "후속곡 믹스 v3 올렸다", 200), m("me", "확인해볼게요 형 고마워요!", 199)] },
      { id: "c11", ad: 1, ids: ["ad1"], unread: 1, msgs: [m("ad1", "(광고) 오늘만 치킨 5,000원 할인 쿠폰이 도착했어요", 8)] },
      { id: "c12", ad: 1, ids: ["ad4"], unread: 1, msgs: [m("ad4", "[CJ대한통운] 고객님의 상품이 오늘 배송 예정입니다", 6)] },
      { id: "c13", ad: 1, ids: ["ad2"], unread: 0, msgs: [m("ad2", "(광고) 이번 주말 신작 예매하고 팝콘 쿠폰 받으세요", 170)] },
      { id: "c14", ad: 1, ids: ["ad3"], unread: 0, msgs: [m("ad3", "(광고) 올영세일 시작! 최대 70% 할인 혜택 확인하세요", 260)] },
    ] };
  }
  D.ui = D.ui || { col: {} }; D.ui.col = D.ui.col || {};
  /* 기존 저장 데이터에도 수정된 대화 적용 */
  if (D.chatHistoryVersion !== 6) {
    const yunhoChat = D.chats.find(c => c.id === "c0");
    if (yunhoChat) yunhoChat.msgs = [
        { id: uid(), from: "f0", text: "모해", ts: new Date("2026-10-15T18:00:00+09:00").getTime() },
        { id: uid(), from: "me", text: "작업중", ts: new Date("2026-10-15T18:01:00+09:00").getTime() },
        { id: uid(), from: "me", text: "왱?", ts: new Date("2026-10-15T18:01:30+09:00").getTime() },
        { id: uid(), from: "f0", text: "심심해", ts: new Date("2026-10-15T18:02:00+09:00").getTime() },
        { id: uid(), from: "me", text: "촬영간 거 아니야?", ts: new Date("2026-10-15T18:03:00+09:00").getTime() },
        { id: uid(), from: "f0", text: "무한대기중 ㅠ", ts: new Date("2026-10-15T18:04:00+09:00").getTime() },
        { id: uid(), from: "f0", text: "형이랑 있구싶다", ts: new Date("2026-10-15T18:04:20+09:00").getTime() },
        { id: uid(), from: "me", text: "전화 ㄱ", ts: new Date("2026-10-15T18:05:00+09:00").getTime() },

        { id: uid(), from: "me", text: "미국 가는 거 담주인가?", ts: new Date("2026-10-16T13:00:00+09:00").getTime() },
        { id: uid(), from: "f0", text: "웅", ts: new Date("2026-10-16T13:00:30+09:00").getTime() },
        { id: uid(), from: "me", text: "무슨 촬영을 미국까지 가서해?", ts: new Date("2026-10-16T13:01:00+09:00").getTime() },
        { id: uid(), from: "f0", text: "나도 모르겠당", ts: new Date("2026-10-16T13:01:30+09:00").getTime() },
        { id: uid(), from: "me", text: "너 없이 나 어떡하라고 ㅠㅠ", ts: new Date("2026-10-16T13:02:00+09:00").getTime() },
        { id: uid(), from: "f0", text: "ㅎㅎㅎㅎ", ts: new Date("2026-10-16T13:03:00+09:00").getTime() },
        { id: uid(), from: "f0", text: "알아서 해", ts: new Date("2026-10-16T13:03:30+09:00").getTime() },
        { id: uid(), from: "me", text: "차가워…", ts: new Date("2026-10-16T13:04:00+09:00").getTime() },
        { id: uid(), from: "f0", text: "작업실이지", ts: new Date("2026-10-16T13:05:00+09:00").getTime() },
        { id: uid(), from: "me", text: "엉", ts: new Date("2026-10-16T13:05:30+09:00").getTime() },
        { id: uid(), from: "f0", text: "나와봐", ts: new Date("2026-10-16T13:06:00+09:00").getTime() },
        { id: uid(), from: "me", text: "헐 ㅁㅊ", ts: new Date("2026-10-16T13:07:00+09:00").getTime() },
        { id: uid(), from: "me", text: "ㄱㄷ", ts: new Date("2026-10-16T13:07:20+09:00").getTime() },
        { id: uid(), from: "me", text: "바로나감", ts: new Date("2026-10-16T13:07:40+09:00").getTime() },

        { id: uid(), from: "me", text: "촬영 없음 저녁에 잠깐 올래?", ts: new Date("2026-10-17T17:00:00+09:00").getTime() },
        { id: uid(), from: "me", text: "홍중이도 있음", ts: new Date("2026-10-17T17:00:20+09:00").getTime() },
        { id: uid(), from: "f0", text: "몇시쯤?", ts: new Date("2026-10-17T17:15:00+09:00").getTime() },
        { id: uid(), from: "me", text: "아홉시열시? 오래 있을 것 같은데", ts: new Date("2026-10-17T17:16:00+09:00").getTime() },
        { id: uid(), from: "me", text: "너 편할 때 와도 돼", ts: new Date("2026-10-17T17:16:20+09:00").getTime() },
        { id: uid(), from: "f0", text: "나 자정 다 되어야 퇴근할듯", ts: new Date("2026-10-17T17:20:00+09:00").getTime() },
        { id: uid(), from: "f0", text: "못갈 것 같으면 연락할겡", ts: new Date("2026-10-17T17:20:20+09:00").getTime() },
        { id: uid(), from: "me", text: "ㅇㅋ", ts: new Date("2026-10-17T17:21:00+09:00").getTime() },
        { id: uid(), from: "me", text: "사랑해❤️", ts: new Date("2026-10-17T17:21:20+09:00").getTime() },
        { id: uid(), from: "f0", text: "나두", ts: new Date("2026-10-17T17:22:00+09:00").getTime() },

        { id: uid(), from: "me", text: "똑똑", ts: new Date("2026-10-18T15:18:00+09:00").getTime() },
        { id: uid(), from: "me", text: "혹시 나도 모르는 사이에 우리 헤어진거 아니지?", ts: new Date("2026-10-18T15:18:20+09:00").getTime() },
        { id: uid(), from: "me", text: "전화 좀 받아 ㅜㅜ", ts: new Date("2026-10-18T15:18:40+09:00").getTime() }
      ];
    const managerChat = D.chats.find(c => c.id === "c3");
    if (managerChat) managerChat.msgs = managerChat.msgs.map(x => {
      const replacements = [
        ["넵 형 몇 시에 출발해요?", "넵 몇 시에 출발해요?"], ["알겠습니다 형 그때 내려가 있을게요", "알겠습니다 그때 내려가 있을게요"],
        ["형 저는 아무거나 괜찮아요 ㅋㅋ", "저는 아무거나 괜찮아요"], ["좋아요 형! 몇 시에 볼까요?", "좋아요! 몇 시에 볼까요?"],
        ["넵 감사합니다 형 ㅎㅎ", "넵 감사합니다"], ["어제 고기 맛있었지? ㅋㅋ 다음엔 네가 골라", "어제 고기 맛있었지? 다음엔 네가 골라"],
        ["ㅋㅋㅋ 알겠습니다 형 다음엔 제가 쏠게요", "알겠습니다 다음엔 제가 쏠게요"], ["됐다 ㅋㅋ 형이 사줄게.", "됐다 내가 사줄게."],
        ["네 형 걱정해주셔서 감사해요", "걱정해주셔서 감사해요"], ["오 형 좋아요! 어떤 영화요?", "오 좋아요! 어떤 영화요?"],
        ["토요일 괜찮아요 형. 영화 끝나고 밥도 먹어요", "토요일 괜찮아요. 영화 끝나고 밥도 먹어요"], ["ㅇㅋ 팝콘은 내가 산다 ㅋㅋ", "ㅇㅋ 팝콘은 내가 산다"],
        ["그럼 저는 음료 사 갈게요 ㅎㅎ", "그럼 음료 사 갈게요"], ["넵 형 확인했어요! 감사합니다", "넵 확인했어요! 감사합니다"],
        ["아 네 알겠습니다 형. 4시 반까지 갈게요", "아 네 알겠습니다. 4시 반까지 갈게요"], ["영화 재밌었다 ㅋㅋ 너 중간에 졸더라", "영화 재밌었다 너 중간에 졸더라"],
        ["ㅋㅋㅋ 형 아니에요 안 졸았어요", "아니에요 안 졸았어요"], ["거짓말 ㅋㅋ 다음엔 코미디 보자", "거짓말 다음엔 코미디 보자"],
        ["좋아요 형 ㅋㅋㅋ", "좋아요"], ["확인했어요 형. 대기실은 몇 층이에요?", "확인했어요. 대기실은 몇 층이에요?"],
        ["넵 감사합니다 형", "넵 감사합니다"], ["아직 안 먹었어요 형! 국밥 좋아요 ㅎㅎ", "아직 안 먹었어요! 국밥 좋아요"],
        ["넵 바로 내려갈게요 형", "넵 바로 내려갈게요"], ["확인할게요 형 감사합니다", "확인할게요 감사합니다"],
        ["아 그리고 저녁에 치킨 먹을래? 형이 쏜다 ㅋㅋ", "아 그리고 저녁에 치킨 먹을래? 내가 쏜다"]
      ];
      for (const [a, b] of replacements) if (x.text === a) x.text = b;
      return x;
    });
    const managerToday = D.chats.find(c => c.id === "c3");
    if (managerToday) {
      managerToday.msgs = managerToday.msgs.filter(x => !(x.ts >= new Date("2026-10-18T14:05:00+09:00").getTime()));
      managerToday.msgs.push(
        { id: uid(), from: "f2", text: "야 성화야 기사 니가 냈냐?", ts: new Date("2026-10-18T14:05:00+09:00").getTime() },
        { id: uid(), from: "me", text: "아뇨저절대아님", ts: new Date("2026-10-18T14:05:20+09:00").getTime() },
        { id: uid(), from: "me", text: "진짜 저도 놀랐어요", ts: new Date("2026-10-18T14:05:40+09:00").getTime() },
        { id: uid(), from: "f2", text: "우리한텐 얘기 없었는데", ts: new Date("2026-10-18T14:06:00+09:00").getTime() },
        { id: uid(), from: "f2", text: "돌겠네", ts: new Date("2026-10-18T14:06:20+09:00").getTime() },
        { id: uid(), from: "f2", text: "일단 회사로 와", ts: new Date("2026-10-18T14:06:40+09:00").getTime() },
        { id: uid(), from: "f2", text: "와서 얘기하자", ts: new Date("2026-10-18T14:07:00+09:00").getTime() },
        { id: uid(), from: "me", text: "넵ㅜㅜㅜ", ts: new Date("2026-10-18T14:07:20+09:00").getTime() }
      );
      managerToday.unread = 1;
    }
    const yunhoUnread = D.chats.find(c => c.id === "c0");
    if (yunhoUnread) yunhoUnread.unread = 1;
    D.chatHistoryVersion = 6;
  }
  const CS = [["me","결혼 생활은 좀 어때","21:10:00"],["f1","좋지 뭐 ㅋㅋ","21:11:00"],["f1","너도 한 번 초대해야되는데","21:11:20"],["me","그래 신혼집 구경 좀 가보자","21:12:00"],["f1","윤호씨도 같이 올거야?","21:13:00"],["me","내가 말했나? ","21:14:00"],["me","다시 만나는 거?","21:14:20"],["f1","걍 요즘 기분 좋아보이길래 그런가보다했지","21:15:00"],["me",";;","21:16:00"],["me","그때 함 물어보지 뭐","21:16:20"],["f1","그래라","21:17:00"]];
  { const y = D.friends && D.friends.find(f => f.id === "f0"); if (y) { y.name = "윤둥이"; try { localStorage.setItem(KEY, JSON.stringify(D)); } catch(e) {} } }
  { const g = D.friends && D.friends.find(f => f.id === "f2"); if (g && g.name === "성현이형") { g.name = "성현이형(매니저)"; try { localStorage.setItem(KEY, JSON.stringify(D)); } catch(e) {} } }
  const save = () => { try { if (window.HwahoStability) window.HwahoStability.writeJSON(KEY, D); else localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) {} };
  /* 윤둥이가 보낸 마침표 메시지를 대답으로 수정 */
  { let changed = false; (D.chats || []).forEach(chat => { if (chat.id === "c0" || (chat.ids || []).includes("f0")) (chat.msgs || []).forEach(msg => { if (msg.from === "f0" && msg.text === ".") { msg.text = "대답"; changed = true; } }); }); if (changed) save(); }
  if (D.chatHistoryVersion === 6) save();
  if (D.chatHistoryVersion === 5) save();
  /* 무뼈국물닭발 이후 윤둥이 메시지는 오후 4:15 로 고정 (이미 저장된 메시지도 보정) */
  { if (!D.fix1420) { (D.chats || []).forEach(c => { c.msgs.forEach(m => { if (m.from === "f4" && m.ts >= new Date("2026-10-19T00:00:00+09:00").getTime()) m.__del = 1; }); c.msgs = c.msgs.filter(m => !m.__del); }); D.fix1420 = 1; save(); } }
  /* 10/19 윤둥이 대화 시간 고정: 아래 항목은 매번 지정 시각으로 보정 */
  { const c0 = (D.chats || []).find(c => c.id === "c0"); if (c0) { const t402 = new Date("2026-10-19T16:02:00+09:00").getTime(), t415 = new Date("2026-10-19T16:15:00+09:00").getTime(); c0.msgs.forEach(m => { if (["그게 지금 할 말이야?","야","윤호야아..."].includes(m.text)) m.ts = t402; if (m.text === "무뼈국물닭발에 치즈 주먹밥 계란찜 추가 맞지?") m.ts = t415; if (m.text === "빨리왕 💗") m.ts = t415 + 1000; }); save(); } }
  { const t0 = new Date().setHours(0, 0, 0, 0); if (D.day !== t0) { D.day = t0; save(); } } /* 대화 날짜는 설정된 날짜로 고정 */
  const fr = id => D.friends.find(f => f.id === id), chat = id => D.chats.find(c => c.id === id), last = c => c.msgs[c.msgs.length - 1];

  if (D.v7 !== 1) {
    const c1 = chat("c1"); if (c1) { c1.msgs = CS.map(([f, t, s]) => ({ id: uid(), from: f, text: t, ts: new Date(`2026-10-15T${s}+09:00`).getTime() })); c1.unread = 0; }
    const c6 = chat("c6"); if (c6) { c6.ids = c6.ids.filter(i => i !== "f1"); c6.msgs = c6.msgs.filter(x => x.from !== "f1"); }
    const f5 = fr("f5"), f4 = fr("f4"); if (f5) f5.name = "김홍중 (NO1)"; if (f4) f4.name = "송민기 (FIXON)";
    D.v7 = 1; save();
  }

  if (D.v8 !== 1) {
    const FM = [["f3","아들 밥은 잘 챙겨 먹고 다니니?","10-13T12:00:00"],["me","응 걱정마 ㅋㅋ","10-13T12:01:00"],["f3","사진 보니까 살 빠진 것 같던데","10-13T12:02:00"],["me","작업 때문에 좀 바빴어 요즘","10-13T12:03:00"],["f7","연예인병","10-13T12:05:00"],["me","꺼져","10-13T12:05:30"],["f7","ㅋ","10-13T12:06:00"],["h6","아들 너무 무리하지마라 건강이 최고라는 걸 잊지말거라","10-13T19:00:00"],["me","넵 명심하겠습니다","10-13T19:01:00"],["f3","어머","10-18T15:02:00"],["f3","윤호랑 다시 만나니?","10-18T15:02:20"],["f3","너무 잘됐다. 언제 한 번 집 좀 데려와","10-18T15:02:40"],["h6","윤호가 그.덩치큰애. 맞지?","10-18T15:05:00"],["f3","응~ 저번에 갈비찜만 4인분 먹고 갔잖아~","10-18T15:06:00"],["h6","흠.","10-18T15:07:00"],["f3","아무튼 한 번 데려와~","10-18T15:08:00"],["f3","오랜만에 윤호 좀 보고싶네~","10-18T15:08:20"]];
    const c2 = chat("c2"); if (c2) { c2.msgs = FM.map(([f, t, d]) => ({ id: uid(), from: f, text: t, ts: new Date(`2026-${d}+09:00`).getTime() })); c2.unread = 8; }
    D.v8 = 1; save();
  }

  if (D.v9 !== 1) {
    const T = d => new Date(`2026-${d}+09:00`).getTime(), mk = a => a.map(([f, t, d]) => ({ id: uid(), from: f, text: t, ts: T(d) }));
    const NM = { f1: "김철수", f2: "성현이형(매니저)", f8: "오승호(믹싱)", f9: "한지안", f6: "문도현", f10: "강레도", h1: "최민재(무대감독)", h2: "박서준(조명)", h3: "김태훈(레코드)", h4: "이성민(동창)", h5: "윤수아 실장" };
    D.friends.forEach(f => { if (NM[f.id]) f.name = NM[f.id]; });
    [["f11", "백진우(편곡)"], ["f12", "서하린(보컬 디렉터)"], ["f13", "윤재호 (띵신고)"], ["f14", "강태민 (띵신고)"], ["f15", "조현우 (띵신고)"]].forEach(([id, name]) => { if (!fr(id)) D.friends.push({ id, name, st: "", fav: 0, hid: 1 }); });
    D.friends = D.friends.filter(f => f.id !== "ad4"); D.chats = D.chats.filter(c => c.id !== "c7" && c.id !== "c12");
    const set = (id, o, ms) => { const c = chat(id); if (c) { Object.assign(c, o); c.msgs = mk(ms); } };
    set("c11", { unread: 0 }, []);
    D.v9 = 1; save();
  }

  if (D.v10 !== 1) {
    const T = d => new Date(`2026-${d}+09:00`).getTime(), mk = a => a.map(([f, t, d]) => ({ id: uid(), from: f, text: t, ts: T(d) }));
    D.friends = D.friends.filter(f => f.id !== "h4"); D.chats = D.chats.filter(c => c.id !== "c9");
    if (!fr("f16")) D.friends.push({ id: "f16", name: "소율 누나", st: "", fav: 0, hid: 0 });
    const set = (id, o, ms) => { const c = chat(id); if (c) { Object.assign(c, o); c.msgs = mk(ms); } };
    set("c4", { name: "띵신고", ids: ["f1", "f13", "f14", "f15"], unread: 0 }, [
      ["f13", "다들 살아있냐", "08-14T21:40:00"], ["f14", "생존", "08-14T21:52:00"], ["f15", "아직 안 죽었다", "08-14T22:05:00"], ["f1", "나도 생존. 신혼이라 정신없다", "08-14T22:30:00"], ["me", "나도 살아있음", "08-14T23:10:00"], ["f13", "ㅇㅋ 다음 달엔 태민이가 해라", "08-14T23:12:00"], ["f14", "ㅇㅇ", "08-14T23:13:00"],
      ["f14", "이번 달 생존신고는 내가 한다", "09-16T20:10:00"], ["f14", "다들 뭐하고 사냐", "09-16T20:10:30"], ["f15", "회사 다니지 뭐 맨날 똑같음", "09-16T20:30:00"], ["f13", "나 이직 준비 중", "09-16T21:00:00"], ["f14", "어디로 감?", "09-16T21:02:00"], ["f13", "되면 말해줌", "09-16T21:05:00"], ["me", "다들 고생이다", "09-16T22:40:00"], ["me", "나는 요즘 작업만 함", "09-16T22:40:30"], ["f15", "성화는 맨날 작업이네", "09-16T22:41:00"], ["f1", "다들 건강 챙겨라 진짜", "09-16T23:00:00"], ["f14", "너나 챙겨 신혼", "09-16T23:02:00"], ["f1", "ㅋㅋ", "09-16T23:03:00"],
      ["f15", "다음 달 동창회 갈 사람?", "10-17T20:00:00"], ["f14", "나 갈까 말까 고민 중", "10-17T20:03:00"], ["f13", "난 감. 오랜만에 애들 보고 싶음", "10-17T20:10:00"], ["f1", "나도 갈 듯", "10-17T20:15:00"], ["f15", "성화 너는?", "10-17T20:16:00"], ["me", "시간 되면 감", "10-17T20:40:00"], ["f14", "그거 안 온다는 소리잖아", "10-17T20:41:00"], ["me", "아 진짜 간다니까", "10-17T20:42:00"], ["f13", "일단 자리 잡아놓는다 와라", "10-17T20:50:00"], ["f15", "확정되면 말해줌", "10-17T21:00:00"]]);
    set("c6", { ids: ["f8", "f9", "f11", "f12"], unread: 0 }, [
      ["f11", "브릿지 코드 살짝 바꿔봤어요", "10-15T14:00:00"], ["f11", "데모 올릴게요", "10-15T14:01:00"], ["f12", "들어봤어요 분위기 훨씬 좋네요", "10-15T14:20:00"], ["f12", "성화씨 브릿지는 키 반음만 올려볼까요?", "10-15T14:21:00"], ["me", "고음 좀 힘들 것 같은데 일단 불러볼게요", "10-15T14:25:00"], ["f8", "키 올라가면 기타랑 보컬이 겹칠 수 있어서", "10-15T14:40:00"], ["f8", "기타 쪽 저음 좀 깎아볼게요", "10-15T14:41:00"], ["f9", "코러스는 마지막 후렴에서만 옥타브로 쌓을까요?", "10-15T15:10:00"], ["f12", "좋아요 그게 에너지 올리기 좋을 듯해요", "10-15T15:12:00"],
      ["f8", "킥이랑 베이스 겹치는 부분 정리했어요", "10-16T11:00:00"], ["f8", "한번 들어보세요", "10-16T11:01:00"], ["me", "오 확인할게요 감사합니다", "10-16T11:30:00"], ["f12", "성화씨 2절 첫 소절 호흡이 좀 크게 들어가요", "10-16T13:00:00"], ["f12", "다시 한 번만 녹음 가능할까요?", "10-16T13:01:00"], ["me", "넵 내일 다시 할게요", "10-16T13:05:00"],
      ["me", "재녹음 파일 올렸어요", "10-17T10:30:00"], ["f12", "확인했어요 훨씬 깔끔해요", "10-17T11:00:00"], ["f9", "코러스 파일도 올렸어요", "10-17T12:00:00"], ["f8", "좋아요 이제 믹스 마무리해서 마스터링 넘길게요", "10-17T13:30:00"], ["f11", "수고하셨어요 이번 곡 진짜 좋네요", "10-17T13:32:00"], ["me", "다들 감사합니다", "10-17T13:40:00"]]);
    const x = (chat("c15") || { msgs: [] }).msgs.find(m => m.text === "축하한다"); if (x) x.ts = T("10-19T16:45:00");
    let mg = chat("c16"); if (!mg) { mg = { id: "c16", ids: ["f4"], unread: 0, msgs: [] }; D.chats.push(mg); }
    mg.unread = 0; mg.msgs = [["10-02","레온 고?","ㄱ"],["10-06","레온 ㄱ?","ㄱ"],["10-10","ㄹㅇ ㄱ?","ㄱ"],["10-14","ㄹㅇ?","ㄱ"],["10-18","ㄹ?","ㄱ"]].flatMap(([d,q,a]) => [{id:uid(),from:"f4",text:q,ts:T(`${d}T21:00:00`)},{id:uid(),from:"me",text:a,ts:T(`${d}T21:01:00`)}]);
    D.v10 = 1; save();
  }

  if (D.v11 !== 1) {
    const T = d => new Date(`2026-${d}+09:00`).getTime(), mk = a => a.map(([f, t, d]) => ({ id: uid(), from: f, text: t, ts: T(d) }));
    const GONE = ["h5", "ad2", "f8", "ad3"]; D.friends = D.friends.filter(f => !GONE.includes(f.id)); D.chats = D.chats.filter(c => !["c10", "c13", "c5", "c14"].includes(c.id));
    if (!fr("f17")) D.friends.push({ id: "f17", name: "신동혁(믹싱)", st: "", fav: 0, hid: 1 });
    const f16 = fr("f16"); if (f16) f16.hid = 1; else D.friends.push({ id: "f16", name: "소율 누나", st: "", fav: 0, hid: 1 });
    const ens = (id, ids) => chat(id) || (D.chats.push({ id, ids, unread: 0, msgs: [] }), chat(id));
    const c6 = chat("c6"); if (c6) { c6.ids = ["f9", "f11", "f12", "f17"]; c6.unread = 0; c6.msgs = mk([
      ["f11", "3번 트랙 비트 새로 뽑았어요", "10-15T14:00:00"], ["f11", "808 좀 묵직하게 가봤어요", "10-15T14:01:00"], ["me", "오 들어볼게요", "10-15T14:10:00"], ["me", "벌스 2는 라임 다시 짜는 중이에요", "10-15T14:11:00"], ["f12", "훅 멜로디는 제가 한번 잡아볼까요?", "10-15T14:30:00"], ["me", "좋아요 보내주세요", "10-15T14:32:00"], ["f17", "벌스 녹음하면 파일 바로 주세요", "10-15T15:00:00"],
      ["me", "벌스 1 가녹음 올렸어요", "10-16T11:00:00"], ["f17", "톤 좋네요", "10-16T11:20:00"], ["f17", "중간에 숨소리만 좀 정리할게요", "10-16T11:21:00"], ["f9", "훅에 코러스 쌓아야 하면 말씀해주세요", "10-16T12:00:00"], ["f12", "벌스 2는 플로우를 좀 더 느슨하게 가도 좋을 듯해요", "10-16T13:00:00"], ["me", "아 그쪽으로 다시 써볼게요", "10-16T13:05:00"],
      ["me", "벌스 2 다시 녹음해서 올렸어요", "10-17T10:30:00"], ["f12", "훨씬 낫네요", "10-17T11:00:00"], ["f9", "훅 가이드 녹음했어요", "10-17T12:00:00"], ["f17", "다 모이면 믹스 시작할게요", "10-17T13:30:00"], ["f11", "수고하셨어요 곡 좋네요", "10-17T13:32:00"], ["me", "감사합니다", "10-17T13:40:00"]]); }
    const mg = ens("c16", ["f4"]); mg.unread = 0; mg.msgs = [["10-02","레온 고?","ㄱ"],["10-06","레온 ㄱ?","ㄱ"],["10-10","ㄹㅇ ㄱ?","ㄱ"],["10-14","ㄹㅇ?","ㄱ"],["10-18","ㄹ?","ㄱ"]].flatMap(([d,q,a]) => [{id:uid(),from:"f4",text:q,ts:T(`${d}T21:00:00`)},{id:uid(),from:"me",text:a,ts:T(`${d}T21:01:00`)}]);
    const sy = ens("c17", ["f16"]); sy.msgs = mk([["f16", "화보 의상 협찬 들어왔어 브랜드에서 오버핏 레더 자켓 보내준대", "10-15T14:30:00"], ["me", "헉 대박 누나 사이즈 L이요", "10-15T14:41:00"], ["f16", "오버핏 레더 자켓이랑 와이드 데님 두 벌 준비했어. 신발은 270 맞지?", "10-15T14:45:00"], ["me", "아니 265요", "10-15T14:48:00"], ["f16", "ㅇㅋ 내일 퀵으로 보낼게. 안경은 네 거 써도 돼", "10-15T14:52:00"]]);
    const mo = ens("c18", ["f3"]); mo.msgs = mk([["f3", "아들 밥은 챙겨 먹고 다니니~ 요즘 방송에서 자주 나오던데 엄마 친구들이 난리야 ㅎㅎ", "10-14T14:20:00"], ["me", "챙겨 먹지~ 이번 주말에 집 갈게", "10-14T14:55:00"], ["f3", "그래그래~ 오면 갈비찜 해놓을게", "10-14T14:58:00"], ["f3", "김치도 보냈다 택배 확인해", "10-16T10:05:00"], ["me", "응 고마워 엄마", "10-16T10:47:00"], ["f3", "냉장고에 넣어놓고 먹어~ 너무 오래 두지 말고", "10-16T10:52:00"], ["me", "알겠어", "10-16T10:55:00"], ["f3", "사랑해 우리 아들 ❤️", "10-17T22:10:00"], ["me", "엄마도 얼른 주무세요", "10-17T22:22:00"]]);
    const br = ens("c19", ["f7"]); br.msgs = mk([["f7", "너 다음 주말에 집에 옴?", "10-17T20:30:00"], ["me", "ㅇㅇ", "10-17T20:33:00"], ["f7", "윤호도 같이 오냐?", "10-17T20:35:00"], ["f7", "다시 만나는 거 맞지?", "10-17T20:35:20"], ["me", "ㅇㅇ 아마 같이감", "10-17T20:39:00"], ["f7", "그럼 뭐 해놓으면 되냐", "10-17T20:41:00"], ["f7", "걔 뭐 좋아하지", "10-17T20:41:20"], ["me", "김치찜이면 될 듯", "10-17T20:44:00"], ["f7", "ㅇㅋ", "10-17T20:46:00"]]);
    const c3 = chat("c3"); if (c3) { const keep = c3.msgs.filter(x => x.ts >= T("10-18T14:05:00")); c3.msgs = mk([
      ["f2", "성화야 내일 스케줄 나왔다", "10-15T19:12:00"], ["f2", "11시 라디오 녹화 → 2시 화보(성수) → 6시 합동무대 리허설", "10-15T19:13:00"], ["f2", "9시 반에 숙소 앞으로 갈게", "10-15T19:13:30"], ["me", "넵 형 알겠습니다", "10-15T19:27:00"], ["me", "내일 일찍 자야겠네요", "10-15T19:28:00"], ["f2", "ㅇㅇ 어제도 3시에 잤잖아 오늘은 좀 자라", "10-15T19:32:00"], ["me", "들켰네요 바로 잘게요", "10-15T19:34:00"],
      ["f2", "일어났냐", "10-16T08:52:00"], ["f2", "10분 뒤에 도착", "10-16T08:53:00"], ["me", "헉 일어났어요 형 5분만요", "10-16T09:00:00"], ["f2", "천천히 내려와 커피 사왔다 아아 맞지?", "10-16T09:01:00"], ["me", "넵 감사합니다 형 🙏", "10-16T09:03:00"], ["f2", "화보 의상 소율 누나가 두 벌 더 챙겨왔대. 비니는 네 거 써도 된다고", "10-16T13:41:00"], ["me", "오 그럼 저 후드는 안 입어도 되나요", "10-16T13:50:00"], ["f2", "그건 가서 보고 정하자", "10-16T13:53:00"], ["f2", "오늘 고생했다. 인터뷰 진짜 잘하더라", "10-16T22:03:00"], ["me", "감사합니다 형 떨려서 죽는 줄 알았어요", "10-16T22:14:00"], ["f2", "티 하나도 안 났어. 홍중이 민기도 칭찬하더라", "10-16T22:16:00"], ["me", "걔네가요? 신기하네", "10-16T22:17:00"],
      ["f2", "성화야 박대표님이 후속곡 일정 얘기하고 싶으시대", "10-17T15:20:00"], ["f2", "다음 주 화요일(10/20) 3시에 합정 사무실 가능해?", "10-17T15:20:30"], ["me", "넵 형 괜찮아요!", "10-17T15:27:00"], ["f2", "후속곡 얘기랑 정산도 같이 하신대", "10-17T15:29:00"], ["me", "오 정산 좋네요", "10-17T15:32:00"], ["f2", "좋긴 한데 너 쓰지 마라 이번 달 카드값 봤다", "10-17T15:33:00"], ["me", "형이 그걸 어떻게 봐요 ㅠㅠ", "10-17T15:35:00"], ["f2", "농담이고. 일정 캘린더에 넣어둘게", "10-17T15:36:00"]]).concat(keep); }
    D.v11 = 1; save();
  }

  if (D.v12 !== 1) {
    const hong = chat("c15");
    if (hong) {
      const start = new Date("2026-10-18T00:00:00+09:00").getTime();
      hong.msgs = hong.msgs.filter(m => m.ts < start);
      hong.msgs.push({ id: uid(), from: "f5", text: "축하한다", ts: new Date("2026-10-19T16:45:00+09:00").getTime() });
      hong.unread = 1;
    }
    D.v12 = 1; save();
  }

  if (D.v17 !== 1) { D.v17 = 1; save(); }

  if (D.v16 !== 1) {
    const yunho = chat("c0"), seonghyeon = chat("c3");
    if (yunho) yunho.unread = 0;
    if (seonghyeon) seonghyeon.unread = 0;
    D.v16 = 1; save();
  }

  if (D.v15 !== 1) {
    const mg = chat("c16");
    if (mg) {
      const make = (from, text, stamp) => ({ id: uid(), from, text, ts: new Date(`2026-10-${stamp}+09:00`).getTime() });
      mg.msgs = [
        make("f4", "레온 고?", "02T21:00:00"), make("me", "ㄱ", "02T21:01:00"),
        make("f4", "레온 ㄱ?", "06T21:00:00"), make("me", "ㄱ", "06T21:01:00"),
        make("f4", "ㄹㅇ ㄱ?", "10T21:00:00"), make("me", "ㄱ", "10T21:01:00"),
        make("f4", "ㄹㅇ?", "13T21:00:00"), make("me", "ㄱ", "13T21:01:00"),
        make("f4", "ㄹ?", "16T21:00:00"), make("me", "ㄱ", "16T21:01:00")
      ];
      mg.unread = 0;
    }
    D.v15 = 1; save();
  }

  if (D.v14 !== 1) {
    const mg = chat("c16");
    if (mg) {
      const make = (from, text, stamp) => ({ id: uid(), from, text, ts: new Date(`2026-10-${stamp}+09:00`).getTime() });
      mg.msgs = [
        make("f4", "레온 고?", "02T21:00:00"), make("me", "ㄱ", "02T21:01:00"),
        make("f4", "레온 ㄱ?", "06T21:00:00"), make("me", "ㄱ", "06T21:01:00"),
        make("f4", "ㄹㅇ ㄱ?", "10T21:00:00"), make("me", "ㄱ", "10T21:01:00"),
        make("f4", "ㄹㅇ?", "14T21:00:00"), make("me", "ㄱ", "14T21:01:00"),
        make("f4", "ㄹ?", "18T21:00:00"), make("me", "ㄱ", "18T21:01:00")
      ];
      mg.unread = 0;
    }
    D.v14 = 1; save();
  }

  if (D.v13 !== 1) {
    const hong = chat("c15");
    if (hong) {
      const msg = (from, text, time) => ({ id: uid(), from, text, ts: new Date(`2026-10-${time}`).getTime() });
      hong.msgs = [
        msg("f5", "어제 만든 비트 들어봤어?", "16T20:00:00+09:00"),
        msg("me", "엉 두번째꺼 진짜 좋던데", "16T20:01:00+09:00"),
        msg("f5", "그거 너 써", "16T20:02:00+09:00"),
        msg("me", "헐", "16T20:02:30+09:00"),
        msg("me", "그럼 나야 땡큐지", "16T20:03:00+09:00"),
        msg("f5", "우리 어제 몇시까지 마셨지", "17T13:00:00+09:00"),
        msg("me", "새벽5시인가", "17T13:01:00+09:00"),
        msg("me", "머리깨질것같음", "17T13:02:00+09:00"),
        msg("f5", "오늘일찍자라", "17T13:03:00+09:00"),
        msg("me", "ㅇㅇ", "17T13:04:00+09:00"),
        msg("f5", "축하한다", "19T16:45:00+09:00")
      ];
      hong.unread = 1;
    }
    D.v13 = 1; save();
  }

  if (D.v18 !== 1) {
    D.chats.forEach(c => c.msgs.sort((a,b) => a.ts - b.ts));
    const y = D.chats.find(c => c.id === "c0"); if (y) y.unread = 1;
    D.v18 = 1; save();
  }
  if (D.v19 !== 1) {
    const unreadTexts = new Set(["윤호야 너 들은 거 잇어?","난 없는데 진짜 미치겠다","회사야? 내가 갈까?","똑똑","혹시 나도 모르는 사이에 우리 헤어진거 아니지?","전화 좀 받아 ㅜㅜ"]);
    const from = new Date("2026-10-16T00:00:00+09:00").getTime();
    const to = new Date("2026-10-19T00:00:00+09:00").getTime();
    D.chats.forEach(c => c.msgs.forEach(m => {
      if (m.type === "call" && /음성 통화 · 12분/.test(m.text)) { m._remove = true; return; }
      if (m.ts >= from && m.ts < to) m.ts += 864e5;
      if (c.id === "c0" && unreadTexts.has(m.text)) {
        const d = new Date(m.ts), hh = d.getHours(), mm = d.getMinutes(), ss = d.getSeconds();
        m.ts = new Date(2026, 9, 19, hh, mm, ss).getTime();
      }
    }));
    D.chats.forEach(c => { c.msgs = c.msgs.filter(m => !m._remove).sort((a,b) => a.ts-b.ts); });
    const t0 = new Date(); t0.setHours(0,0,0,0); D.day = t0.getTime();
    D.v19 = 1; save();
  }
  if (D.v20 !== 1) {
    const fixedLastDates = [
      ["c17", 15], ["c1", 13], ["c6", 14], ["c19", 16], ["c4", 12]
    ];
    fixedLastDates.forEach(([id, day]) => {
      const c = D.chats.find(x => x.id === id);
      if (!c || !c.msgs.length) return;
      const last = c.msgs.reduce((a,b) => a.ts > b.ts ? a : b);
      const d = new Date(last.ts), target = new Date(2026, 9, day, d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
      const shift = target.getTime() - last.ts;
      c.msgs.forEach(m => { m.ts += shift; });
      c.msgs.sort((a,b) => a.ts-b.ts);
    });
    const taehun = D.chats.find(c => c.ids.length === 1 && c.ids[0] === "h3");
    if (taehun && taehun.msgs.length) {
      const last = taehun.msgs.reduce((a,b) => a.ts > b.ts ? a : b);
      const d = new Date(last.ts), target = new Date(2026, 9, 14, d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
      const shift = target.getTime() - last.ts;
      taehun.msgs.forEach(m => { m.ts += shift; });
      taehun.msgs.sort((a,b) => a.ts-b.ts);
    }
    D.v20 = 1; save();
  }
  if (D.v21 !== 1) {
    const y = D.chats.find(c => c.id === "c0");
    if (y) {
      const moveTo18 = new Set(["촬영 없음 저녁에 잠깐 올래?", "홍중이도 있음", "나두"]);
      y.msgs.forEach(m => {
        if (!moveTo18.has(m.text)) return;
        const d = new Date(m.ts);
        m.ts = new Date(2026, 9, 18, d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()).getTime();
      });
      y.msgs.sort((a,b) => a.ts-b.ts);
    }
    D.v21 = 1; save();
  }
  if (D.v22 !== 1) {
    const y = D.chats.find(c => c.id === "c0");
    const texts = new Set(["촬영 없음 저녁에 잠깐 올래?", "홍중이도 있음", "몇시쯤?", "아홉시열시? 오래 있을 것 같은데", "너 편할 때 와도 돼", "나 자정 다 되어야 퇴근할듯", "못갈 것 같으면 연락할겡", "ㅇㅋ", "사랑해❤️", "나두"]);
    if (y) {
      y.msgs.forEach(m => {
        if (!texts.has(m.text)) return;
        const d = new Date(m.ts);
        m.ts = new Date(2026, 9, 18, d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()).getTime();
      });
      y.msgs.sort((a,b) => a.ts-b.ts);
    }
    D.v22 = 1; save();
  }
  if (D.v23 !== 1) {
    const manager = D.chats.find(c => c.id === "c3");
    if (manager) {
      manager.msgs = manager.msgs.filter(m =>
        m.text !== "정윤호 측, 마스 열애설에 선 긋기…“사실무근, 열애 관계 아니다”" &&
        m.text !== "이거 합의된 거야?"
      );
      manager.msgs.sort((a,b) => a.ts-b.ts);
    }
    D.v23 = 1; save();
  }
  if (D.v24 !== 1) {
    const yunho = D.chats.find(c => c.id === "c0");
    if (yunho) {
      const removeTexts = new Set([
        "너 지금 웃음이 나오냐",
        "웅",
        "아까 통화도 그렇고 나만 이상한 거야?",
        "형이 걱정이 많아서 그래",
        "사실무근은 회사에서 정한 거지?",
        "응 일단은",
        "일단은이 뭔데",
        "일단은 일단이지 ㅎㅎ",
        "근데 댓글은 좀 시끄럽더라",
        "무슨 댓글? 너 그거 봤어?",
        "조금? 별 얘기가 다 있긴 해",
        "이번 일로 뭐라하는 놈 있으면 나한테 데려와",
        "내가 처리할게",
        "형이 뭘 처리해ㅋㅋㅋ 싸우지 마",
        "진심이야"
      ]);
      yunho.msgs = yunho.msgs.filter(m => !removeTexts.has(m.text));
      yunho.msgs.sort((a,b) => a.ts-b.ts);
    }
    D.v24 = 1; save();
  }
  /* v25: 성현이형(c3) 대화방의 10/19 이후 기록(스토리 메시지 포함) 제거 — 10/18 이전 기록은 유지 */
  if (D.v25 !== 1) {
    const c3 = D.chats.find(c => c.id === "c3"), cut = new Date(2026, 9, 19).getTime();
    if (c3) c3.msgs = c3.msgs.filter(m => !m.storySequence && (m.ts || 0) < cut);
    D.v25 = 1; save();
  }

  /* v26: 사용자 지정 카톡/기사 시간 수정. 로컬에 이미 저장된 대화에도 적용 */
  if (D.v27 !== 1) {
    const hong = D.chats.find(c => c.id === "c15");
    if (hong) {
      const patchText = (oldText, newText) => hong.msgs.forEach(m => { if (m.text === oldText) m.text = newText; });
      patchText("어제 만든 비트 들어봤어?", "어제 보낸 거 들어봤어?");
      patchText("우리 어제 몇시까지 마셨지", "우리 몇 시까지 마셨지");
      /* 홍중의 축하 메시지는 10/19 오후 4시 45분 */
      const congratulate = hong.msgs.find(m => m.text === "축하한다");
      if (congratulate) congratulate.ts = new Date("2026-10-19T16:45:00+09:00").getTime();
      /* 민기 개인 카톡의 10/19 기록을 통째로 삭제 */
      const mingyu = D.chats.find(c => c.ids && c.ids.length === 1 && c.ids[0] === "f4");
      if (mingyu) {
        const cut = new Date("2026-10-19T00:00:00+09:00").getTime();
        const end = new Date("2026-10-20T00:00:00+09:00").getTime();
        mingyu.msgs = mingyu.msgs.filter(m => !(m.ts >= cut && m.ts < end));
        mingyu.unread = 0;
      }
    }
    D.v27 = 1; save();
  }

  /* v27: 민기 개인 카톡을 참고 이미지처럼 짧고 반복적인 일상 대화로 확장. 10/14 이후 메시지는 만들지 않음. */
  if (D.v27 !== 1) {
    const mg = D.chats.find(c => c.ids && c.ids.length === 1 && c.ids[0] === "f4");
    if (mg) {
      const T = s => new Date("2026-" + s + "+09:00").getTime();
      const rows = [
        ["me","잔다","09-24T15:12:00"],["f4","일어났냐","09-24T15:18:00"],["me","방금","09-24T15:19:00"],["f4","나와","09-24T15:23:00"],["me","어딘데","09-24T15:25:00"],["f4","레온ㅋㅋ","09-24T15:26:00"],["me","ㅇㅋ","09-24T15:28:00"],
        ["f4","일어났냐","09-25T10:41:00"],["me","짐 인남","09-25T16:07:00"],["f4","나와","09-25T16:12:00"],["me","뭐여 어딘데","09-25T16:20:00"],["f4","레온 ㄱㄱ","09-25T16:21:00"],["me","예압","09-25T16:24:00"],
        ["f4","일어났냐","09-26T11:35:00"],["me","이새끼 존나 일찍 일어나네?","09-26T15:25:00"],["me","짐인남","09-26T15:25:30"],["f4","나와","09-26T15:28:00"],["me","ㅇㄷㄹ","09-26T15:29:00"],["f4","레온","09-26T15:31:00"],["me","ㅇㅇ","09-26T15:34:00"],
        ["f4","일어났냐","09-27T09:25:00"],["me","짐인남ㅋㅋ","09-27T16:26:00"],["f4","레온 ㄱㄱ","09-27T16:38:00"],["me","ㅇㅇ","09-27T16:47:00"],
        ["f4","일어났냐","09-28T11:27:00"],["me","기계냐 그만 좀 일어났냐해","09-28T15:18:00"],["me","짐인남","09-28T15:18:30"],["f4","레온 ㄱ","09-28T15:22:00"],
        ["f4","레온 ㄱㄱ","09-29T15:11:00"],["me","ㅇㅇ","09-29T15:11:30"],
        ["f4","일어났냐","09-30T10:23:00"],["me","짐인남","09-30T14:47:00"],["f4","ㄹㅇ ㄱ?","09-30T14:48:00"],["me","좀만 이따감","09-30T14:49:00"],["f4","먼저 가있는다","09-30T14:55:00"],
        ["f4","일어났냐","10-01T11:35:00"],["me","짐인남","10-01T14:11:00"],["f4","레온 ㄱ","10-01T14:18:00"],["me","ㅇㅇ","10-01T14:20:00"],
        ["f4","레온 고?","10-02T21:00:00"],["me","ㄱ","10-02T21:01:00"],
        ["f4","일어났냐","10-06T10:04:00"],["me","짐인남ㅋㅋ","10-06T16:18:00"],["f4","레온 ㄱ?","10-06T16:24:00"],["me","ㅇㅇ ㄱㄱ","10-06T16:25:00"],
        ["f4","일어났냐","10-10T11:10:00"],["me","아직","10-10T15:42:00"],["f4","ㄹㅇ ㄱ?","10-10T15:45:00"],["me","좀만 이따감","10-10T15:47:00"],["f4","먼저 가있는다","10-10T15:50:00"],
        ["f4","레온 ㄱ?","10-14T14:05:00"],["me","ㄱ","10-14T14:06:00"],["f4","나 먼저 감","10-14T14:08:00"],["me","ㅇㅋ 금방 감","10-14T14:10:00"]
      ];
      mg.msgs = rows.map(([from,text,ts]) => ({id:uid(),from,text,ts:T(ts)}));
      mg.unread = 0;
    }
    D.v27 = 1; save();
  }

  /* v28: 사용자 요청 문구 정리. 기존 저장 대화에도 반영 */
  if (D.v28 !== 1) {
    const mg = D.chats.find(c => c.ids && c.ids.length === 1 && c.ids[0] === "f4");
    if (mg) {
      const day24 = new Date("2026-09-24T00:00:00+09:00").getTime();
      const day25 = new Date("2026-09-25T00:00:00+09:00").getTime();
      const day26 = new Date("2026-09-26T00:00:00+09:00").getTime();
      const day27 = new Date("2026-09-27T00:00:00+09:00").getTime();
      mg.msgs = mg.msgs.filter(m => !(m.ts >= day24 && m.ts < day25 && m.text === "잔다") && !(m.ts >= day26 && m.ts < day27 && m.text === "이새끼 존나 일찍 일어나네?"));
      mg.msgs.forEach(m => { if (m.text === "일어났냐") m.text = "일어남?"; });
    }
    D.v28 = 1; save();
  }

  const cname = c => c.name || (fr(c.ids[0]) || {}).name || "알 수 없음";
  const col = id => { let h = 0; for (const x of id) h = (h * 41 + x.charCodeAt(0)) % 360; return `hsl(${h} 45% 68%)`; };
  const KAKAO_PHOTOS = {
    "박성화": "@shared-seonghwa",
    "성화": "@shared-seonghwa",
    "엄마": "엄마/E3B1FD1A-B038-4228-9A1F-8FE2ABEBF06D.png",
    "윤호": "윤호/IMG_0012.jpeg",
    "울윤호": "윤호/IMG_0012.jpeg",
    "윤둥이": "윤호/IMG_0012.jpeg",
    "아빠": "아빠/C954DC40-2B5B-446F-997A-C49C13F0C07F.png",
    "형": "형/IMG_7422.jpeg",
    "성현이형(매니저)": "성현이형(매니저)/IMG_7422.jpeg",
    "김철수": "철수/609BC795-2DDD-4E26-8E22-62FAD41F247F.png",
    "송민기 (FIXON)": "민기/IMG_7425.jpeg",
    "김홍중 (NO1)": "홍중/IMG_7424.jpeg"
  };
  const av = (id, nm, c = "") => {
    const photo = KAKAO_PHOTOS[nm] || "성현이형(매니저)/IMG_7422.jpeg";
    const src = photo === "@shared-seonghwa" ? (window.HwahoIdentity ? window.HwahoIdentity.avatar("성화") : "images/app/Instagram/Profile/_starhwa_/IMG_7064.jpeg") : photo ? "images/app/KakaoTalk/Profile/" + photo.split("/").map(encodeURIComponent).join("/") : (window.HwahoIdentity ? window.HwahoIdentity.avatar(nm) : "");
    return `<div class="kk-av ${c}" style="position:relative;overflow:hidden;background:${col(id)}">${esc([...nm][0] || "?")}${src ? `<img alt="" aria-hidden="true" src="${src}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit" onerror="this.style.display='none'">` : (window.HwahoIdentity ? window.HwahoIdentity.avatarMarkup(nm) : "")}</div>`;
  };
  const psrc = nm => { const p = KAKAO_PHOTOS[nm] || "성현이형(매니저)/IMG_7422.jpeg"; return p === "@shared-seonghwa" ? (window.HwahoIdentity ? window.HwahoIdentity.avatar("성화") : "images/app/Instagram/Profile/_starhwa_/IMG_7064.jpeg") : p ? "images/app/KakaoTalk/Profile/" + p.split("/").map(encodeURIComponent).join("/") : (window.HwahoIdentity ? window.HwahoIdentity.avatar(nm) : ""); };

  const cav = c => c.ids.length > 1 || c.name ? `<div class="kk-gav">${[...c.ids, "me"].slice(0, 4).map(i => { const nm = i === "me" ? "박성화" : (fr(i) || {}).name || "?", s = psrc(nm); return `<i style="background:${col(i)};position:relative;overflow:hidden">${esc([...nm][0])}${s ? `<img alt="" src="${s}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">` : ""}</i>`; }).join("")}</div>` : av(c.ids[0], cname(c), "kk-cav");
  const pad = n => String(n).padStart(2, "0"), fixedDate = new Date(2026, 9, 19), tm = ts => { const d = new Date(ts); return `${d.getHours() < 12 ? "오전" : "오후"} ${d.getHours() % 12 || 12}:${pad(d.getMinutes())}`; };
  const day = ts => { const d = new Date(ts); return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`; }, dl = ts => { const d = new Date(ts), w = ["일요일","월요일","화요일","수요일","목요일","금요일","토요일"]; return `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일 ${w[d.getDay()]}`; };
  function lt(ts) {
    const d = new Date(ts), now = new Date(2026, 9, 19), today = new Date(now.getFullYear(), now.getMonth(), now.getDate()), date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diff = Math.round((today - date) / 864e5);
    if (diff === 0) return tm(ts);
    if (diff === 1) return "어제";
    return `${d.getMonth()+1}월 ${d.getDate()}일`;
  }
  let tab = "friends", q = "", flt = "all", cur = null, isOpen = false;
  const totalUnread = () => D.chats.reduce((a, c) => a + (c.unread || 0), 0);

  function friendsHtml() {
    const ql = q.trim().toLowerCase(), l = D.friends.filter(f => ql ? f.name.toLowerCase().includes(ql) : !f.hid);
    const row = f => `<button class="kk-r" data-k="friend" data-id="${f.id}">${av(f.id, f.name)}<div class="kk-tx"><div class="kk-nm">${esc(f.name)}</div>${f.st ? `<div class="kk-st">${esc(f.st)}</div>` : ""}</div></button>`;
    const grp = (key, title, arr, cnt, more) => { if (!arr.length) return ""; const cl = !ql && D.ui.col[key]; return `<button class="kk-gh" data-k="grp" data-g="${key}"><span>${title} ${cnt == null ? arr.length : cnt}</span><i class="${cl ? "cl" : ""}">${I.chev}</i></button>${cl ? "" : arr.map(row).join("") + (more || "")}`; };
    const head = ql ? "" : `<div class="kk-me">${av("me", "박성화")}<div class="kk-tx"><div class="kk-nm" style="font-size:16px">박성화</div></div></div><div class="kk-pills"><span class="on">친구</span><span>소식</span></div><div class="kk-nc"><b>공지</b><span>카카오톡 새로운 소식을 확인해 보세요</span></div>`;
    const byName = arr => [...arr].sort((a, b) => a.name.localeCompare(b.name, "ko"));
    const body = grp("fav", "즐겨찾기", byName(l.filter(f => f.fav))) + grp("fr", "친구", byName(l.filter(f => !f.fav)), ql ? null : TOTAL, ql ? "" : `<div class="kk-st" style="padding:10px 20px 14px">그 외 ${TOTAL - l.length}명</div>`);
    return head + (body || `<div class="kk-em">검색 결과가 없습니다</div>`);
  }
  function chatsHtml() {
    const ql = q.trim().toLowerCase(), l = D.chats.filter(c => c.msgs.length && (flt !== "unread" || c.unread > 0) && (!ql || cname(c).toLowerCase().includes(ql) || c.msgs.some(m => m.text.toLowerCase().includes(ql)))).sort((a, b) => (b.pin || 0) - (a.pin || 0) || last(b).ts - last(a).ts);
    const head = ql ? "" : `<div class="kk-pills">${[["all", "전체"], ["unread", "안 읽음"]].map(([k, n]) => `<button class="${flt === k ? "on" : ""}" data-k="flt" data-f="${k}">${n}</button>`).join("")}</div><div class="kk-nc"><b>소식</b><span>친구들의 새로운 소식이 도착했어요</span></div>`;
    return head + (l.map(c => { const m = last(c), gc = c.name || c.ids.length > 1; return `<button class="kk-r" data-k="chat" data-id="${c.id}">${cav(c)}<div class="kk-tx"><div class="kk-nm">${esc(cname(c))}${gc ? `<span class="kk-gc">${c.ids.length + 1}</span>` : ""}</div><div class="kk-pv">${esc(m.text)}</div></div><div class="kk-mt"><span class="kk-tm">${lt(m.ts)}</span>${c.unread ? `<span class="kk-bd">${c.unread}</span>` : ""}</div></button>`; }).join("") || `<div class="kk-em">${ql ? "검색 결과가 없습니다" : flt === "unread" ? "안 읽은 채팅이 없습니다" : "채팅이 없습니다"}</div>`);
  }
  function tabsHtml() {
    const t = (k, icn, l) => `<div class="${tab === k ? "on" : ""}" ${k === "friends" || k === "chats" ? `data-k="tab" data-t="${k}"` : ""}>${icn}<span>${l}</span>${k === "chats" && totalUnread() ? `<i class="bd">${totalUnread()}</i>` : ""}</div>`;
    return t("friends", I.t1, "친구") + t("chats", I.t2, "채팅") + t("v", I.t3, "뷰") + t("s", I.t4, "쇼핑") + t("m", I.t5, "더보기");
  }
  function renderMain() {
    const fT = tab === "friends";
    $("#kk-hd").innerHTML = `<h1>${fT ? "친구" : "채팅"}</h1><div class="kk-ic"><button data-k="srch" aria-label="검색">${I.search}</button>${fT ? `<span>${I.add}</span><span>${I.gear}</span>` : `<span>${I.newchat}</span><span>${I.gear}</span>`}</div>`;
    $("#kk-ph").placeholder = fT ? "이름 검색" : "채팅방 이름, 대화 내용 검색";
    $("#kk-body").innerHTML = fT ? friendsHtml() : chatsHtml(); $("#kk-tabs").innerHTML = tabsHtml();
  }
  const sbox = () => $("#kk-sb");
  function room() {
    const c = cur, ms = c.msgs, gc = c.name || c.ids.length > 1;
    const u0 = c.id === "c0" ? ms.findIndex(x => x.text === "윤호야 너 들은 거 잇어?") : -1;
    let h = ""; ms.forEach((m, i) => {
      const p = ms[i - 1], n = ms[i + 1], sameP = p && p.from === m.from && day(p.ts) === day(m.ts) && tm(p.ts) === tm(m.ts), sameN = n && n.from === m.from && day(n.ts) === day(m.ts) && tm(n.ts) === tm(m.ts);
      if (!p || day(p.ts) !== day(m.ts)) h += `<div class="kk-dv"><span>${dl(m.ts)}</span></div>`;
      const first = !sameP, time = !sameN ? `<span class="kk-tm">${tm(m.ts)}</span>` : "", b = m.type === "call" ? `<div class="kk-b kk-call${first ? " f" : ""}"><span class="kk-call-ico">↗</span><span>${esc(m.text)}</span></div>` : m.type === "story-link" ? `<div class="kk-b${first ? " f" : ""}"><a href="${esc(m.url || "#")}" data-k="story-link" data-story-url="${esc(m.url || "#")}" style="color:#1769aa;text-decoration:underline;display:block;max-width:250px;line-height:1.35">${esc(m.text)}</a></div>` : `<div class="kk-b${first ? " f" : ""}">${esc(m.text)}</div>`;
      const un = u0 >= 0 && !ms.some(x => x.storySequence) && i >= u0 && i < u0 + 6 && m.from === "me", tl = un ? `<span class="kk-ti"><i class="kk-un">1</i>${time}</span>` : time;
      if (m.from === "me") h += `<div class="kk-m me${first ? " f" : ""}">${tl}${b}</div>`;
      else { const f = fr(m.from) || { name: "?", id: m.from }; h += `<div class="kk-m${first ? " f" : ""}"><div class="kk-pa">${first ? av(f.id, f.name) : ""}</div><div class="kk-on">${first ? `<div class="n">${esc(f.name)}</div>` : ""}<div class="kk-bw">${b}${time}</div></div></div>`; }
    });
    const box = $("#kk-msgs"); box.innerHTML = h; box.scrollTop = box.scrollHeight;
  }
  const inp = () => $("#kk-ta"), sd = () => $("#kk-sd");
  const grow = () => { inp().style.height = "22px"; inp().style.height = Math.min(inp().scrollHeight, 100) + "px"; sd().classList.toggle("on", !!inp().value.trim()); };
  function openRoom(arg) {
    cur = typeof arg === "string" ? chat(arg) : arg; cur.unread = 0; save(); const gc = cur.name || cur.ids.length > 1;
    $("#kk-rh").innerHTML = `<button class="bk" data-k="back" aria-label="뒤로">${I.back}</button><div class="t">${esc(cname(cur))}${gc ? `<small>${cur.ids.length + 1}</small>` : ""}</div><div class="kk-ic"><span>${I.search}</span><span>${I.menu}</span></div>`;
    inp().value = ""; grow(); room(); $("#kk-room").classList.add("on"); $("#kk-main").classList.add("back"); document.dispatchEvent(new CustomEvent("kakao:room-opened", { detail: { id: cur.id } }));
  }
  function back() { $("#kk-room").classList.remove("on"); $("#kk-main").classList.remove("back"); inp().blur(); cur = null; renderMain(); }
  function send() {
    const text = inp().value.trim(); if (!text || !cur) return; const c = cur;
    if (!D.chats.includes(c)) D.chats.push(c); c.msgs.push({ id: uid(), from: "me", text, ts: Date.now() }); c.unread = 0; inp().value = ""; grow(); save(); room();
    if (!c.ad) setTimeout(() => {
      c.msgs.push({ id: uid(), from: c.ids[Math.floor(Math.random() * c.ids.length)], text: REPLIES[Math.floor(Math.random() * REPLIES.length)], ts: Date.now() });
      if (!cur || cur.id !== c.id) c.unread = (c.unread || 0) + 1; save(); if (cur && cur.id === c.id) room(); else renderMain();
    }, 1500 + Math.random() * 1500);
  }
  el.innerHTML = `<div class="kk-v" id="kk-main"><div class="kk-hd" id="kk-hd"></div><div class="kk-sb" id="kk-sb">${I.search}<input id="kk-ph" autocomplete="off"></div><div class="kk-body" id="kk-body"></div><div class="kk-tabs" id="kk-tabs"></div></div><div class="kk-v" id="kk-room"><div class="kk-rh" id="kk-rh"></div><div class="kk-msgs" id="kk-msgs"></div><div class="kk-in"><span class="kk-pl">${I.plus}</span><div class="kk-iw"><textarea id="kk-ta" rows="1"></textarea></div><button class="kk-sd" id="kk-sd" data-k="send" aria-label="전송">${I.up}</button></div></div>`;
  el.addEventListener("click", e => {
    const t = e.target.closest("[data-k]"); if (!t) return; const d = t.dataset;
    switch (d.k) {
      case "grp": D.ui.col[d.g] = !D.ui.col[d.g]; save(); $("#kk-body").innerHTML = friendsHtml(); break;
      case "flt": flt = d.f; $("#kk-body").innerHTML = chatsHtml(); break;
      case "tab": tab = d.t; q = ""; flt = "all"; $("#kk-ph").value = ""; sbox().classList.remove("on"); renderMain(); break;
      case "srch": $("#kk-ph").focus(); break;
      case "friend": { let c = D.chats.find(x => !x.name && x.ids.length === 1 && x.ids[0] === d.id); if (!c) c = { id: uid(), ids: [d.id], unread: 0, msgs: [] }; openRoom(c); break; }
      case "chat": openRoom(d.id); break;
      case "back": back(); break;
      case "story-link": e.preventDefault(); e.stopPropagation(); document.dispatchEvent(new CustomEvent("story:manager-link-opened", { detail: { url: t.getAttribute("href") } })); break;
      case "send": send(); inp().focus(); break;
    }
  });
  $("#kk-ph").addEventListener("input", e => { q = e.target.value; $("#kk-body").innerHTML = tab === "friends" ? friendsHtml() : chatsHtml(); });
  inp().addEventListener("input", grow);
  inp().addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(); } });
  const vv = window.visualViewport;
  const fit = () => { if (!isOpen) return; const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop); el.style.bottom = kb + "px"; el.classList.toggle("kb", kb > 80); if (kb > 80 && cur) { const b = $("#kk-msgs"); b.scrollTop = b.scrollHeight; } };
  if (vv) { vv.addEventListener("resize", fit); vv.addEventListener("scroll", fit); }
  function open() {
    if (isOpen) { el.style.pointerEvents = "auto"; el.style.display = "block"; el.classList.add("show", "open"); return; } isOpen = true; renderMain(); originFrom(el, "kakaotalk");
    el.style.pointerEvents = "auto"; el.style.display = "block"; el.classList.add("show"); void el.offsetWidth; el.classList.add("open"); el.setAttribute("aria-hidden", "false");
    setTimeout(() => { if (isOpen) screen.classList.add("app-light"); }, 140);
  }
  function close() {
    if (!isOpen) return; isOpen = false; screen.classList.remove("app-light"); el.classList.remove("open", "kb"); el.style.pointerEvents = "none"; el.style.bottom = ""; el.setAttribute("aria-hidden", "true");
    document.activeElement && document.activeElement.blur();
    setTimeout(() => { if (!isOpen) { el.classList.remove("show"); $("#kk-room").classList.remove("on"); $("#kk-main").classList.remove("back"); cur = null; } }, 430);
  }
  document.addEventListener("app:open", e => { if (e.detail.id === "kakaotalk") open(); });
  document.addEventListener("app:close", close);

  window.addEventListener("baemin:delivered", e => {
    const c = chat("c11"); if (!c) return;
    c.msgs.push({ id: uid(), from: "ad1", text: `[배달의민족] ${(e.detail && e.detail.store) || "가게"} 주문하신 음식이 도착했어요. 맛있게 드세요!`, ts: Date.now() });
    if (!cur || cur.id !== c.id) c.unread = (c.unread || 0) + 1; save();
    if (isOpen) { if (cur && cur.id === c.id) room(); else renderMain(); }
  });

  function openStoryChat(chatId = "c3") {
    const c = chat(chatId);
    if (!c) return;
    tab = "chats"; q = ""; flt = "all";
    if (!isOpen) open();
    renderMain();
    openRoom(c);
  }
  function appendStoryMessage(text, type = "text", url = "", chatId = "c3", from = "f2", at = null) {
    const c = chat(chatId);
    if (!c) return;
    const duplicate = c.msgs.some(m => m.storySequence && m.text === text);
    if (!duplicate) {
      /* 기존 마지막 메시지보다 항상 뒤의 시각으로 붙인다 (고정 15:10 이면 기존 15:18 메시지보다 앞선 시각으로 보였음) */
      const lastTs = c.msgs.reduce((a, m) => Math.max(a, m.ts || 0), 0), n = new Date(), clock = new Date(2026, 9, 19, n.getHours(), n.getMinutes(), n.getSeconds()).getTime();
      let ts = Math.max(clock, lastTs + 60000);
      /* 스토리 시계가 있으면 그 시각(초 단위)을 그대로 사용 — 상태바/알림/기사 시각과 일치 */
      if (window.HwahoClock && !Array.isArray(at)) { const lastStory = c.msgs.reduce((a, m) => m.storySequence ? Math.max(a, m.ts || 0) : a, 0); ts = Math.max(window.HwahoClock.now().getTime(), lastStory + 1000); at = null; }
      /* 스토리 진행 중 내가 보내는 카톡의 표시 시각은 오후 2:52로 고정한다.
         상태바 시계(HwahoClock)는 변경하지 않는다. */
      if (from === "me" && !(Array.isArray(at) && c.id === "c0")) {
        const base = new Date(2026, 9, 19, 14, 52, 0).getTime();
        const same = c.msgs.filter(m => m.storySequence && m.from === "me" && m.ts >= base && m.ts < base + 60000).length;
        ts = base + same * 1000;
      } else if (Array.isArray(at)) {
        const base = new Date(2026, 9, 19, at[0], at[1], 0).getTime();
        const same = c.msgs.filter(m => m.storySequence && m.ts >= base && m.ts < base + 60000).length;
        ts = Math.max(base + same * 1000, lastTs + 1);
      }
      c.msgs.push({ id: uid(), from, text, type: type === "link" ? "story-link" : "text", url, storySequence: true, ts });
      /* 지금 보고 있는 채팅방이면 읽음, 아니면 상대 메시지만 안 읽음 수에 반영 */
      if (isOpen && cur && cur.id === c.id) c.unread = 0;
      else if (from !== "me") c.unread = (c.unread || 0) + 1;
    }
    save();
    if (isOpen) { if (cur && cur.id === c.id) room(); else renderMain(); }
  }
  /* 스토리가 시작되지 않은 상태에서는 이전에 저장된 스토리 메시지를 모두 제거한다 (원래 대화는 건드리지 않음) */
  function purgeStoryMessages() {
    let n = 0;
    D.chats.forEach(c => { const keep = c.msgs.filter(m => !m.storySequence); n += c.msgs.length - keep.length; c.msgs = keep; });
    if (n) { save(); if (isOpen) { if (cur) room(); else renderMain(); } }
    return n;
  }
  /* 지금 화면에 열려 있는 채팅방 id (story.js 가 윤둥이 방에서만 탭 진행을 처리하도록 사용) */
  const currentChatId = () => (isOpen && cur ? cur.id : null);
  return { open, close, openStoryChat, appendStoryMessage, purgeStoryMessages, currentChatId, playNotificationTone };
})();
window.KakaoApp = KakaoApp;

/* App-specific styles */
(()=>{const style=document.createElement("style");style.textContent="#kko-app{position:absolute;inset:0;z-index:5;display:none;background:#fff;color:#000;overflow:hidden;opacity:0;transform:scale(.15);border-radius:44px;transition:transform .42s cubic-bezier(.2,.9,.25,1),opacity .22s,border-radius .42s;font-family:var(--font)}\n#kko-app.show{display:block}\n#kko-app.open{opacity:1;transform:none;border-radius:0}\n#kko-app button{font-family:var(--font);background:none;border:0;padding:0;cursor:pointer;color:inherit}\n:where(#kko-app) svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}\n#kko-app.kb .kk-in{padding-bottom:8px}\n#kko-app .kk-sb{display:flex}\n#kko-app .kk-call{background:#dcecff!important;color:#1673d1!important;border:1px solid #b7d7ff;display:flex;align-items:center;gap:8px;font-weight:600}#kko-app .kk-call-ico{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:#2585ed;color:#fff;font-size:15px}\n/* ===== 9차: 카카오톡 UI 현실감 ===== */\n#kko-app .kk-hd{padding:calc(env(safe-area-inset-top,0px) + 54px) 20px 4px}\n#kko-app .kk-hd h1{font-size:21px;font-weight:700;letter-spacing:-.3px}\n#kko-app .kk-ic{gap:18px}\n#kko-app .kk-ic>*{width:22px;height:22px;color:#333}\n#kko-app .kk-ic svg{stroke-width:1.3}\n#kko-app .kk-sb{margin:6px 20px 8px;height:34px;border-radius:10px;background:#f3f3f3;padding:0 10px}\n#kko-app .kk-sb input{font-size:15px}\n#kko-app .kk-body{padding-bottom:8px}\n#kko-app .kk-r{padding:8px 20px;gap:12px;min-height:56px}\n#kko-app .kk-tx{flex:1;min-width:0}\n#kko-app .kk-av{width:40px;height:40px;border-radius:15px;font-size:16px;font-weight:400}\n#kko-app .kk-me{padding:10px 20px 12px;gap:12px}\n#kko-app .kk-me .kk-av{width:48px;height:48px;border-radius:18px;font-size:19px}\n#kko-app .kk-nm{font-size:15px;font-weight:500;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n#kko-app .kk-st{font-size:12.5px;color:#8c8c8c;margin-top:2px;line-height:1.3}\n#kko-app .kk-pills{display:flex;gap:6px;padding:4px 20px 10px}\n#kko-app .kk-pills>*{height:30px;padding:0 14px;border-radius:15px;background:#f2f2f2;color:#666;font-size:13px;display:flex;align-items:center}\n#kko-app .kk-pills .on{background:#222;color:#fff}\n#kko-app .kk-nc{margin:0 20px 6px;padding:12px 14px;border-radius:12px;background:#f7f7f7;display:flex;gap:8px;align-items:center;font-size:13px;color:#666}\n#kko-app .kk-nc b{color:#222;font-weight:600;flex:none}\n#kko-app .kk-nc span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n#kko-app .kk-gh{display:flex;justify-content:space-between;align-items:center;width:100%;padding:14px 20px 6px;font-size:12px;color:#8c8c8c}\n#kko-app .kk-gh i{width:16px;height:16px;display:block;transition:transform .2s}\n#kko-app .kk-gh i.cl{transform:rotate(-90deg)}\n#kko-app .kk-cav.kk-av{width:46px;height:46px;border-radius:17px}\n#kko-app .kk-gav{width:46px;height:46px;border-radius:17px;gap:2px;background:#fff}\n#kko-app .kk-gav i{font-size:11px}\n#kko-app .kk-pv{font-size:13.5px;color:#8c8c8c;margin-top:2px}\n#kko-app .kk-gc{font-size:12.5px;color:#aaa;margin-left:5px}\n#kko-app .kk-mt{min-width:46px;gap:5px}\n#kko-app .kk-mt .kk-tm{font-size:11px}\n#kko-app .kk-bd{min-width:18px;height:18px;font-size:11px;padding:0 5px}\n#kko-app .kk-tabs{padding-top:5px;border-top:.5px solid #e3e3e3}\n#kko-app .kk-tabs svg{width:24px;height:24px}\n#kko-app #kk-room{background:#b2c7d9}\n#kko-app .kk-rh{background:#b2c7d9;padding:calc(env(safe-area-inset-top,0px) + 54px) 14px 10px}\n#kko-app .kk-rh .t{font-size:16px}\n#kko-app .kk-msgs{padding:4px 12px 10px}\n#kko-app .kk-dv{margin:14px 0 8px}\n#kko-app .kk-dv span{background:rgba(0,0,0,.22);font-size:11.5px;padding:3px 12px}\n#kko-app .kk-m{margin-top:2px;gap:8px}\n#kko-app .kk-m.f{margin-top:10px}\n#kko-app .kk-pa{width:38px}\n#kko-app .kk-pa .kk-av{width:36px;height:36px;border-radius:14px;font-size:15px}\n#kko-app .kk-on{max-width:72%}\n#kko-app .kk-on .n{font-size:12px;color:#333;margin:0 0 4px 2px}\n#kko-app .kk-b{padding:7px 10px;border-radius:10px;font-size:15px;line-height:1.35;background:#fff}\n#kko-app .kk-m.me .kk-b{background:#fee500;max-width:72%}\n#kko-app .kk-b.f{border-top-left-radius:0}\n#kko-app .kk-b.f::before{content:\"\";position:absolute;top:0;left:-6px;right:auto;width:10px;height:11px;border:0;background:inherit;clip-path:polygon(100% 0,100% 100%,0 0)}\n#kko-app .kk-m.me .kk-b.f{border-top-left-radius:10px;border-top-right-radius:0}\n#kko-app .kk-m.me .kk-b.f::before{left:auto;right:-6px;border:0;clip-path:polygon(0 0,100% 0,0 100%)}\n#kko-app .kk-m .kk-tm{color:#4e5d69;font-size:10.5px}\n#kko-app .kk-in{background:#fff;padding:8px 14px calc(env(safe-area-inset-bottom,0px) + 30px) 12px;gap:10px;border-top:.5px solid #ddd}\n#kko-app.kb .kk-in{padding-bottom:8px}\n/* ===== 10차: 카카오톡 말풍선 ===== */\n#kko-app .kk-b{border-radius:14px}\n#kko-app .kk-b.f{border-top-left-radius:4px}\n#kko-app .kk-b.f::before{left:-6px;width:12px;height:13px;clip-path:path(\"M12 0L12 13C8 11.500 3 7 .6 1.500C.1 .6 .6 0 1.600 0Z\")}\n#kko-app .kk-m.me .kk-b.f{border-top-left-radius:14px;border-top-right-radius:4px}\n#kko-app .kk-m.me .kk-b.f::before{left:auto;right:-6px;clip-path:path(\"M12 0L12 13C8 11.500 3 7 .6 1.500C.1 .6 .6 0 1.600 0Z\");transform:scaleX(-1)}";document.head.appendChild(style);})();

(()=>{const s=document.createElement("style");s.textContent="#kko-app{position:absolute;inset:0;z-index:5;display:none;background:#fff;color:#000;overflow:hidden;opacity:0;transform:scale(.15);border-radius:44px;transition:transform .42s cubic-bezier(.2,.9,.25,1),opacity .22s,border-radius .42s;font-family:var(--font)}\n#kko-app.show{display:block}\n#kko-app.open{opacity:1;transform:none;border-radius:0}\n#kko-app button{font-family:var(--font);background:none;border:0;padding:0;cursor:pointer;color:inherit}\n:where(#kko-app) svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}\n#kko-app.kb .kk-in{padding-bottom:8px}\n#kko-app .kk-sb{display:flex}\n/* ===== 9차: 카카오톡 UI 현실감 ===== */\n#kko-app .kk-hd{padding:calc(env(safe-area-inset-top,0px) + 54px) 20px 4px}\n#kko-app .kk-hd h1{font-size:21px;font-weight:700;letter-spacing:-.3px}\n#kko-app .kk-ic{gap:18px}\n#kko-app .kk-ic>*{width:22px;height:22px;color:#333}\n#kko-app .kk-ic svg{stroke-width:1.3}\n#kko-app .kk-sb{margin:6px 20px 8px;height:34px;border-radius:10px;background:#f3f3f3;padding:0 10px}\n#kko-app .kk-sb input{font-size:15px}\n#kko-app .kk-body{padding-bottom:8px}\n#kko-app .kk-r{padding:8px 20px;gap:12px;min-height:56px}\n#kko-app .kk-tx{flex:1;min-width:0}\n#kko-app .kk-av{width:40px;height:40px;border-radius:15px;font-size:16px;font-weight:400}\n#kko-app .kk-me{padding:10px 20px 12px;gap:12px}\n#kko-app .kk-me .kk-av{width:48px;height:48px;border-radius:18px;font-size:19px}\n#kko-app .kk-nm{font-size:15px;font-weight:500;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n#kko-app .kk-st{font-size:12.5px;color:#8c8c8c;margin-top:2px;line-height:1.3}\n#kko-app .kk-pills{display:flex;gap:6px;padding:4px 20px 10px}\n#kko-app .kk-pills>*{height:30px;padding:0 14px;border-radius:15px;background:#f2f2f2;color:#666;font-size:13px;display:flex;align-items:center}\n#kko-app .kk-pills .on{background:#222;color:#fff}\n#kko-app .kk-nc{margin:0 20px 6px;padding:12px 14px;border-radius:12px;background:#f7f7f7;display:flex;gap:8px;align-items:center;font-size:13px;color:#666}\n#kko-app .kk-nc b{color:#222;font-weight:600;flex:none}\n#kko-app .kk-nc span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n#kko-app .kk-gh{display:flex;justify-content:space-between;align-items:center;width:100%;padding:14px 20px 6px;font-size:12px;color:#8c8c8c}\n#kko-app .kk-gh i{width:16px;height:16px;display:block;transition:transform .2s}\n#kko-app .kk-gh i.cl{transform:rotate(-90deg)}\n#kko-app .kk-cav.kk-av{width:46px;height:46px;border-radius:17px}\n#kko-app .kk-gav{width:46px;height:46px;border-radius:17px;gap:2px;background:#fff}\n#kko-app .kk-gav i{font-size:11px}\n#kko-app .kk-pv{font-size:13.5px;color:#8c8c8c;margin-top:2px}\n#kko-app .kk-gc{font-size:12.5px;color:#aaa;margin-left:5px}\n#kko-app .kk-mt{min-width:46px;gap:5px}\n#kko-app .kk-mt .kk-tm{font-size:11px}\n#kko-app .kk-bd{min-width:18px;height:18px;font-size:11px;padding:0 5px}\n#kko-app .kk-tabs{padding-top:5px;border-top:.5px solid #e3e3e3}\n#kko-app .kk-tabs svg{width:24px;height:24px}\n#kko-app #kk-room{background:#b2c7d9}\n#kko-app .kk-rh{background:#b2c7d9;padding:calc(env(safe-area-inset-top,0px) + 54px) 14px 10px}\n#kko-app .kk-rh .t{font-size:16px}\n#kko-app .kk-msgs{padding:4px 12px 10px}\n#kko-app .kk-dv{margin:14px 0 8px}\n#kko-app .kk-dv span{background:rgba(0,0,0,.22);font-size:11.5px;padding:3px 12px}\n#kko-app .kk-m{margin-top:2px;gap:8px}\n#kko-app .kk-m.f{margin-top:10px}\n#kko-app .kk-pa{width:38px}\n#kko-app .kk-pa .kk-av{width:36px;height:36px;border-radius:14px;font-size:15px}\n#kko-app .kk-on{max-width:72%}\n#kko-app .kk-on .n{font-size:12px;color:#333;margin:0 0 4px 2px}\n#kko-app .kk-b{padding:7px 10px;border-radius:10px;font-size:15px;line-height:1.35;background:#fff}\n#kko-app .kk-m.me .kk-b{background:#fee500;max-width:72%}\n#kko-app .kk-b.f{border-top-left-radius:0}\n#kko-app .kk-b.f::before{content:\"\";position:absolute;top:0;left:-6px;right:auto;width:10px;height:11px;border:0;background:inherit;clip-path:polygon(100% 0,100% 100%,0 0)}\n#kko-app .kk-m.me .kk-b.f{border-top-left-radius:10px;border-top-right-radius:0}\n#kko-app .kk-m.me .kk-b.f::before{left:auto;right:-6px;border:0;clip-path:polygon(0 0,100% 0,0 100%)}\n#kko-app .kk-m .kk-tm{color:#4e5d69;font-size:10.5px}\n#kko-app .kk-in{background:#fff;padding:8px 14px calc(env(safe-area-inset-bottom,0px) + 30px) 12px;gap:10px;border-top:.5px solid #ddd}\n#kko-app.kb .kk-in{padding-bottom:8px}\n/* ===== 10차: 카카오톡 말풍선 ===== */\n#kko-app .kk-b{border-radius:14px}\n#kko-app .kk-b.f{border-top-left-radius:4px}\n#kko-app .kk-b.f::before{left:-6px;width:12px;height:13px;clip-path:path(\"M12 0L12 13C8 11.500 3 7 .6 1.500C.1 .6 .6 0 1.600 0Z\")}\n#kko-app .kk-m.me .kk-b.f{border-top-left-radius:14px;border-top-right-radius:4px}\n#kko-app .kk-m.me .kk-b.f::before{left:auto;right:-6px;clip-path:path(\"M12 0L12 13C8 11.500 3 7 .6 1.500C.1 .6 .6 0 1.600 0Z\");transform:scaleX(-1)}";document.head.appendChild(s);})();

/* App-specific styles moved from base.css */
(()=>{const s=document.createElement("style");s.textContent="#kk-room{transform:translateX(100%);z-index:2;background:#b2c7d9}\n#kk-room.on{transform:none}\n#kk-main.back{transform:translateX(-25%)}";document.head.appendChild(s);})();
(()=>{const s=document.createElement("style");s.textContent="#kko-app .kk-ti{display:flex;flex-direction:column;align-items:flex-end;align-self:flex-end;line-height:1.15}\n#kko-app .kk-un{font-style:normal;font-size:10.5px;font-weight:700;color:#f5c400}\n#kko-app .kk-rh{position:relative}\n#kko-app .kk-rh .t{position:absolute;left:0;right:0;bottom:10px;height:22px;line-height:22px;text-align:center;pointer-events:none}\n#kko-app .kk-rh .kk-ic{margin-left:auto}";document.head.appendChild(s);})();
