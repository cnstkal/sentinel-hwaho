/* YouTube mock app for hwaho */
(() => {
  const el = document.querySelector("#yt-app");
  if (!el || el.dataset.ready) return;
  el.dataset.ready = "1";
  let opened = false, tab = "home", query = "", activeVideo = null, shortsIndex = 0, playing = false, progress = 0, playTimer = null, sheet = false;
  const liked = new Set(), saved = new Set(), subscribed = new Set(), shortLiked = new Set();
  const defaultComments = [
    {u:"김예준-j1k",t:"5시간 전",x:"댓글의 기준과 기둥이 무너진 그날\n\n-2026.10.13-",l:145,r:4,av:"#5b6bc0"},
    {u:"M3coi",t:"4시간 전",x:"벌써부터 머리가 어지러우면 뭉추",l:62,r:1,av:"#2b2b2b"},
    {u:"dailylog",t:"3시간 전",x:"분위기 너무 좋다",l:18,r:0,av:"#8e6f5a"}
  ];
  const commentsByVideo = {
    v9: [{u:"@mars_rapper",t:"2시간 전",x:"솔직히 와꾸 믿고 나온 것 같아서 ㅈ같았는데 그냥 인정한다. 네가 이겼다.",l:5821,r:127,av:"#5b6bc0"}, ...defaultComments.slice(1)],
    v10: [{u:"@dailyissue",t:"1시간 전",x:"성공이 좋긴 좋구나",l:2408,r:36,av:"#2b2b2b"}, ...defaultComments.slice(1)],
    v11: [{u:"@drama_archive",t:"3주 전",x:"이 장면이 전회차 통틀어서 기석이를 제일 잘 보여준 것 같아서 좋았음...",l:1842,r:52,av:"#8e6f5a"}, ...defaultComments.slice(1)]
  };
  const currentComments = () => commentsByVideo[activeVideo] || defaultComments;
  const chColor = {"케인 TV":"#5642a0","침착맨":"#a91e2b","침착맨 플러스":"#2e9e2e","서재로36":"#8daba8","킥서비스":"#17345f","득템":"#111"};
  const chAv = {"케인 TV":"케인\ntv","침착맨":"침","침착맨 플러스":"침","서재로36":"서","킥서비스":"킥","득템":"득템"};
  const channelProfiles = {"Mnet TV":"images/YouTube/Profiles/Profile-01/channels4_profile.jpg","이슈캐는남자":"images/YouTube/Profiles/Profile-02/이캐남.png","TVN DRAMA":"images/YouTube/Profiles/Profile-03/channels4_profile%20(1).jpg"};
  const videos = [
    {id:"v9",title:"[SMT43/최종회] ♬ MARS (Feat. NO1) - MARS @파이널 | Mnet 260724 방송",channel:"Mnet TV",handle:"@MnetTV",views:"457만",time:"2개월 전",duration:"3:02",music:1,img:"images/YouTube/Videos/Video-01/쇼미.png",desc:"MARS (Feat. NO1) - MARS @파이널 | Mnet 260724 방송."},
    {id:"v10",title:"쇼미 우승하자마자 배우랑 열애설 ㄷㄷ",channel:"이슈캐는남자",handle:"@이슈캐는남자",views:"36만",time:"3시간 전",duration:"4:12",img:"images/YouTube/Videos/Video-02/렉카.png",desc:"쇼미 우승하자마자 배우랑 열애설 ㄷㄷ"},
    {id:"v11",title:"12화 하이라이트ㅣ정윤호가 최XX에게 전하는 마지막 고백",channel:"TVN DRAMA",handle:"@TVNDRAMA",views:"21만",time:"1개월 전",duration:"11:29",img:"images/YouTube/Videos/Video-03/푸른 복도의 스포트라이트.png",desc:"12화 하이라이트ㅣ정윤호가 최XX에게 전하는 마지막 고백"},
  ];
  const subChannels = ["침착맨","침착맨 플러스","케인 TV","서재로36","킥서비스"];
  const shorts = [
    {title:"곰곰 먹는다 vs 거른다 (솔직후기)",channel:"duktem",name:"득템",img:"photo-1565299624946-b28f40a0ae38",likes:"879",cm:"40",sub:"수수료 지급"},
    {title:"오늘의 작은 행복 ☁️",channel:"daily_mood",name:"daily",img:"photo-1470252649378-9c29740c9fa8",likes:"12.4만",cm:"1.2천",sub:"오리지널 오디오"},
    {title:"책상 꾸미기 15초 요약",channel:"sosohan",name:"소소",img:"photo-1498050108023-c5249f4df085",likes:"4.2만",cm:"320",sub:"오리지널 오디오"},
    {title:"여행 가고 싶어지는 순간",channel:"daybyday",name:"day",img:"photo-1519608487953-e999c86e7455",likes:"21만",cm:"2.4천",sub:"오리지널 오디오"}
  ];
  const img = (id,w=640) => id.startsWith("images/") ? id : `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
  const esc = s => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const P = {
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    shorts:'<path d="m9 3 9 3a3 3 0 0 1 1 5l-2 1 2 1a3 3 0 0 1-2 5l-8-3a3 3 0 0 1-1-5l2-1-2-1a3 3 0 0 1 1-5z"/><path d="m10 9 5 3-5 3z" fill="currentColor"/>',
    subs:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M5 4h14M7 1.500h10" /><path d="m10 10.5 5 3-5 3z" fill="currentColor"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    back:'<path d="m15 18-6-6 6-6"/>',
    chevD:'<path d="m6 9 6 6 6-6"/>', chevR:'<path d="m9 6 6 6-6 6"/>',
    more:'<circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/>',
    dotsV:'<circle cx="12" cy="5" r="1.8" fill="currentColor"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/><circle cx="12" cy="19" r="1.8" fill="currentColor"/>',
    like:'<path d="M7 10v11H3V10zM7 10l4-7c2 0 3 1 3 3l-1 4h6a2 2 0 0 1 2 2.500l-1.5 6.500a2 2 0 0 1-2 1.500H7"/>',
    dislike:'<path d="M17 14V3h4v11zM17 14l-4 7c-2 0-3-1-3-3l1-4H5a2 2 0 0 1-2-2.500L4.5 5A2 2 0 0 1 6.5 3.500H17"/>',
    shareA:'<path d="M14 4l7 6.5-7 6.500v-4c-6 0-9.5 2-11 6.5 0-7 4-11 11-11.500z"/>',
    save:'<path d="M6 3h12v18l-6-4-6 4z"/>',
    heart:'<path d="M12 20.500S3 15 3 9a4.8 4.8 0 0 1 9-2.300A4.8 4.8 0 0 1 21 9c0 6-9 11.5-9 11.500z"/>',
    comment:'<path d="M4 4h16v12H9l-5 4z"/><path d="M8 8.500h8M8 12h5"/>',
    remix:'<path d="M4 12a8 8 0 0 1 14-5.300L20 9M20 12a8 8 0 0 1-14 5.300L4 15M20 4v5h-5M4 20v-5h5"/><path d="M12 9v6M9 12h6"/>',
    sparkle:'<path d="M12 2c1 5 4 8 10 10-6 2-9 5-10 10-1-5-4-8-10-10 6-2 9-5 10-10z" fill="currentColor" stroke="none"/>',
    bell:'<path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2h16zM10 21h4"/>',
    gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 13a7.6 7.6 0 0 0 0-2l2-1.5-2-3.5-2.4 1a7.6 7.6 0 0 0-1.7-1L15 3.500h-4l-.3 2.500a7.6 7.6 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.500a7.6 7.6 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7.6 7.6 0 0 0 1.7 1l.3 2.500h4l.3-2.500a7.6 7.6 0 0 0 1.7-1l2.4 1 2-3.500z"/>',
    compass:'<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.500v.5"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>', plus:'<path d="M12 5v14M5 12h14"/>',
    note:'<path d="M9 17V5l10-2v12" /><circle cx="6.5" cy="17" r="2.5" fill="currentColor"/><circle cx="16.5" cy="15" r="2.5" fill="currentColor"/>',
    list:'<path d="M3 6h14M3 11h14M3 16h7M15 14l6 4-6 4z" fill="none"/>',
    thanks:'<path d="M12 20.500S3 15 3 9a4.8 4.8 0 0 1 9-2.300A4.8 4.8 0 0 1 21 9c0 6-9 11.5-9 11.500z"/><text x="12" y="14.5" font-size="9" font-weight="700" text-anchor="middle" fill="currentColor" stroke="none">$</text>',
    download:'<path d="M12 3v12m-5-5 5 5 5-5"/><path d="M5 17v4h14v-4"/>',
    play:'<path d="m8 5 11 7-11 7z" fill="currentColor" stroke="none"/>'
  };
  const ico = (n,size=24,filled=false,sw=1.8) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${filled?"currentColor":"none"}" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${P[n]||""}</svg>`;
  const style = document.createElement("style");
  style.textContent = `
  #yt-app{position:absolute;inset:0;z-index:5;display:none;overflow:hidden;background:#fff;color:#0f0f0f;font-family:"Pretendard Variable",Pretendard,-apple-system,"Apple SD Gothic Neo",Arial,sans-serif;letter-spacing:-.02em}
  #yt-app.show{display:block}#yt-app.dark{background:#000}#yt-app *{box-sizing:border-box}#yt-app button{font:inherit;color:inherit;border:0;cursor:pointer;background:none;padding:0}
  #yt-app .yt-head{height:100px;padding:64px 24px 8px 24px;display:flex;align-items:center;justify-content:space-between;background:#fff;position:relative;z-index:4;flex:none}
  #yt-app .yt-logo{width:29px;height:20px;background:#f03;border-radius:6px;display:grid;place-items:center;color:#fff}#yt-app .yt-logo svg{width:11px;height:11px}
  #yt-app .yt-brand{display:flex;align-items:center;gap:6px;font-size:20px}#yt-app .yt-brand i{font-style:normal;font-size:22px}
  #yt-app .yt-banner{position:absolute;left:9px;top:59px;width:112px;height:33px;border-radius:7px;background:linear-gradient(135deg,#2f6bff,#6c8dff);display:grid;place-items:center;font-size:22px}
  #yt-app .yt-head-actions{display:flex;align-items:center;margin-left:auto}#yt-app .yt-iconbtn{width:44px;height:36px;display:grid;place-items:center;color:#0f0f0f;position:relative}
  #yt-app .yt-badge{position:absolute;right:3px;top:-3px;min-width:18px;height:18px;border-radius:9px;background:#e60023;color:#fff;font-size:11px;font-weight:700;display:grid;place-items:center;padding:0 5px;border:0}
  #yt-app .yt-acct{height:32px;border:1px solid #cfcfcf!important;border-radius:16px;padding:0 12px 0 16px!important;display:flex;align-items:center;gap:6px;font-size:15px;font-weight:500;margin-top:0}
  #yt-app .yt-searchbar{display:none;gap:8px;padding:0 12px 8px}#yt-app .yt-searchbar input{flex:1;min-width:0;border-radius:20px;background:#f2f2f2;color:#111;border:1px solid #ddd;padding:10px 14px;outline:none;font-size:14px}
  #yt-app .yt-pillrow button{pointer-events:none!important;cursor:default!important}#yt-app .yt-pillrow{display:flex;gap:8px;overflow:auto;padding:0 12px;height:46px;align-items:flex-start;scrollbar-width:none;margin-top:0}#yt-app .yt-pillrow::-webkit-scrollbar{display:none}
  #yt-app .yt-pill{white-space:nowrap;background:#f2f2f2;color:#0f0f0f;height:32px;padding:0 12px;border-radius:8px;font-size:14px;font-weight:500;display:flex;align-items:center;flex:none}#yt-app .yt-pill.on{background:#0f0f0f;color:#fff}#yt-app .yt-pill.ic{width:44px;padding:0;justify-content:center}
  #yt-app .yt-body{position:absolute;inset:0 0 81px;overflow-y:auto;scrollbar-width:none;background:#fff}#yt-app:has(.yt-short) .yt-body{bottom:0}#yt-app:has(.yt-short) .yt-nav{background:rgba(15,15,15,.96);border-color:#222}#yt-app .yt-body::-webkit-scrollbar{display:none}#yt-app.dark .yt-body{background:#000}
  #yt-app .yt-card{display:block;text-align:left;width:100%;padding:0 0 16px;color:#0f0f0f}#yt-app .yt-thumb{position:relative;width:100%;aspect-ratio:16/9;background:#e5e5e5;overflow:hidden}#yt-app .yt-thumb img{width:100%;height:100%;object-fit:cover;display:block}
  #yt-app .yt-duration{position:absolute;right:8px;bottom:8px;background:rgba(0,0,0,.72);color:#fff;border-radius:8px;padding:3px 7px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:4px}
  #yt-app .yt-cardinfo{display:flex;gap:12px;padding:12px 8px 0 12px}#yt-app .yt-avatar{width:36px;height:36px;flex:none;border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:700;color:#fff;text-align:center;line-height:1.05;white-space:pre-line;overflow:hidden}
  #yt-app .yt-cardtext{min-width:0;flex:1;display:block}#yt-app .yt-vtitle{display:-webkit-box;font-size:17px;line-height:1.3;font-weight:500;margin-bottom:3px;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}#yt-app .yt-subtext{display:block;font-size:14px;color:#606060;line-height:1.4}
  #yt-app .yt-more{width:28px;height:28px;display:grid;place-items:center;color:#0f0f0f;flex:none;margin-top:-2px}
  #yt-app .yt-stories{display:flex;gap:16px;padding:14px 16px 0;height:100px;overflow:hidden;align-items:flex-start}#yt-app .yt-story{flex:0 0 56px;width:56px;display:flex;flex-direction:column;align-items:center;gap:8px;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#yt-app .yt-story .yt-avatar{width:56px;height:56px;font-size:15px;position:relative;overflow:visible}
  #yt-app .yt-story .yt-avatar:after{content:"";position:absolute;right:-1px;bottom:0;width:12px;height:12px;border-radius:50%;background:#065fd4;border:2px solid #fff}#yt-app .yt-storiesall{margin-left:auto;align-self:flex-start;margin-top:22px;color:#065fd4;font-size:16px;font-weight:600;flex:none}
  #yt-app .yt-nav{position:absolute;bottom:0;left:0;right:0;height:81px;padding:6px 0 0;background:#fafafa;border-top:1px solid #e8e8e8;display:flex;justify-content:space-around;align-items:flex-start;z-index:5}
  #yt-app .yt-nav button{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;font-size:11px;color:#0f0f0f}#yt-app .yt-nav .yt-plus span{width:54px;height:40px;border-radius:20px;background:#ececec;display:grid;place-items:center}
  #yt-app .yt-nav .me i{width:28px;height:28px;border-radius:50%;background:#d8c6b7;display:grid;place-items:center;font-size:16px;font-style:normal;border:1.500px solid #0f0f0f;padding:1px}
  #yt-app .yt-dot{position:relative}#yt-app .yt-dot:after{content:"";position:absolute;right:-2px;top:-2px;width:9px;height:9px;border-radius:50%;background:#f03;border:1.500px solid #fafafa}
  #yt-app.dark .yt-nav{background:#0f0f0f;border-color:#222}#yt-app.dark .yt-nav button{color:#fff}#yt-app.dark .yt-nav .yt-plus span{background:#2a2a2a}#yt-app.dark .yt-dot:after{border-color:#0f0f0f}
  #yt-app .yt-screen{position:absolute;inset:0;background:#fff;z-index:8;overflow-y:auto;scrollbar-width:none}#yt-app .yt-screen:has(.yt-player){padding-top:48px}#yt-app .yt-screen::-webkit-scrollbar{display:none}
  #yt-app .yt-screenhead{height:99px;padding:63px 12px 0;display:flex;align-items:center;gap:8px;position:sticky;top:0;background:#fff;z-index:2;font-weight:700;font-size:18px}
  #yt-app .yt-player{width:100%;aspect-ratio:16/9;height:auto;min-height:0;box-sizing:border-box;background:#000;position:relative;top:auto;z-index:3;display:grid;place-items:center;flex:none;overflow:hidden}#yt-app .yt-player img{display:block;width:100%;height:100%;aspect-ratio:16/9;object-fit:cover;opacity:.9}
  #yt-app .yt-min{position:absolute;left:8px;top:8px;width:36px;height:36px;color:#fff;display:grid;place-items:center;z-index:4}
  #yt-app .yt-player-controls{position:absolute;left:0;right:0;bottom:8px;display:flex;justify-content:space-between;padding:0 12px;z-index:3;color:#fff;font-size:11px;text-shadow:0 1px 3px #000}
  #yt-app .yt-progress{position:absolute;left:0;right:0;bottom:0;height:3px;background:rgba(255,255,255,.4);z-index:4}#yt-app .yt-progress i{display:block;width:0;height:100%;background:#f03}
  #yt-app .yt-dtitle{padding:12px 12px 0;font-size:17px;font-weight:700;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #yt-app .yt-dmeta{padding:3px 12px 0;font-size:14px;color:#606060;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#yt-app .yt-dmeta b{color:#0f0f0f;font-weight:700}
  #yt-app .yt-dactions{display:flex;align-items:center;padding:14px 12px 0;gap:12px}#yt-app .yt-dactions .yt-avatar{width:48px;height:48px}
  #yt-app .yt-bellpill{height:48px;width:108px;border-radius:24px;background:#f2f2f2;display:flex;align-items:center;justify-content:center;gap:4px;flex:none}
  #yt-app .yt-dactions .ic{width:40px;height:40px;display:grid;place-items:center;color:#0f0f0f}#yt-app .yt-dactions .sp{flex:1}#yt-app .yt-dactions .ic.on{color:#065fd4}
  #yt-app .yt-cbox{margin:14px 12px 0;background:#f2f2f2;border-radius:20px;padding:16px;min-height:80px;display:block;width:calc(100% - 24px);text-align:left}
  #yt-app .yt-cbox .h{display:flex;justify-content:space-between;align-items:center;font-size:17px;font-weight:700}#yt-app .yt-cbox .h span{font-weight:400;color:#606060;margin-left:8px}#yt-app .yt-cbox .dots{display:flex;gap:6px}#yt-app .yt-cbox .dots i{width:8px;height:8px;border-radius:4px;background:#ccc}#yt-app .yt-cbox .dots i:first-child{width:36px;background:#0f0f0f}
  #yt-app .yt-cbox .r{display:flex;gap:12px;margin-top:12px;font-size:15px;align-items:center}
  #yt-app .yt-prod{margin:0 12px;height:52px;background:#f5e6ef;border-radius:14px;display:flex;align-items:center;padding:0 12px;gap:10px;font-size:15px;font-weight:500;width:calc(100% - 24px)}#yt-app .yt-prod i{width:30px;height:30px;background:#111;border-radius:4px;display:grid;place-items:center;font-style:normal;font-size:15px}
  #yt-app .yt-short{position:absolute;left:0;right:0;top:0;bottom:0;background:#222;color:#fff;overflow:hidden}#yt-app .yt-shortbg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  #yt-app .yt-shortshade{position:absolute;inset:55% 0 0;background:linear-gradient(transparent,rgba(0,0,0,.45));pointer-events:none}
  #yt-app .yt-short-top{position:absolute;top:10px;right:6px;display:flex;z-index:3;color:#fff}#yt-app .yt-short-top .yt-iconbtn{width:44px}
  #yt-app .yt-shortbottom{position:absolute;left:16px;right:84px;bottom:104px;z-index:3;transition:transform .24s ease-out}#yt-app .yt-short{touch-action:pan-y}#yt-app .yt-shortbg{transition:transform .24s cubic-bezier(.22,.61,.36,1),opacity .24s ease-out}#yt-app .yt-shortch{display:flex;align-items:center;gap:12px;margin-bottom:12px}#yt-app .yt-shortch .yt-avatar{width:48px;height:48px;background:#111;border:1px solid #333;font-size:13px}#yt-app .yt-shortch b{font-size:18px;font-weight:600}
  #yt-app .yt-subbtn{height:40px;padding:0 20px;border-radius:20px;background:#fff;color:#0f0f0f;font-size:17px;font-weight:600}#yt-app .yt-subbtn.on{background:rgba(255,255,255,.25);color:#fff}
  #yt-app .yt-shorttitle{font-size:17px;font-weight:500;display:block;margin-bottom:6px}#yt-app .yt-shortsub{font-size:16px;font-weight:500;opacity:.9}
  #yt-app .yt-shortside{position:absolute;right:8px;bottom:22px;display:flex;flex-direction:column;align-items:center;gap:22px;z-index:3;width:56px}#yt-app .yt-shortside button{display:flex;flex-direction:column;align-items:center;gap:6px;font-size:15px;color:#fff;filter:drop-shadow(0 0 3px rgba(0,0,0,.35))}
  #yt-app .yt-shortside .yt-avatar{width:44px;height:44px;border-radius:10px;border:2px solid #fff;background:#111;font-size:11px}
  #yt-app .yt-shortprog{position:absolute;left:0;right:0;bottom:0;height:3px;background:rgba(255,255,255,.35);z-index:4}#yt-app .yt-shortprog i{display:block;width:5%;height:100%;background:#fff}
  #yt-app .yt-tap{position:absolute;inset:0 70px 130px 0;z-index:2}
  #yt-app .yt-youtop{padding:14px 16px 0;display:flex;align-items:center;gap:16px}#yt-app .yt-youtop .yt-avatar{width:72px;height:72px;background:#d9a273;font-size:36px;overflow:hidden}
  #yt-app .yt-youtop h1{margin:0;font-size:32px;font-weight:700;line-height:1.1}#yt-app .yt-youtop p{margin:8px 0 0;font-size:15px;color:#606060}
  #yt-app .yt-youbtns{display:flex;gap:12px;padding:20px 16px 0}#yt-app .yt-youbtns button{flex:1;height:32px;border-radius:16px;font-size:15px;font-weight:600;background:#0f0f0f;color:#fff}#yt-app .yt-youbtns button.o{background:#fff;color:#0f0f0f;border:1px solid #cfcfcf}
  #yt-app .yt-sec{display:flex;align-items:center;gap:6px;padding:24px 16px 14px;font-size:22px;font-weight:700}
  #yt-app .yt-hrow{display:flex;gap:16px;overflow-x:auto;padding:0 16px;scrollbar-width:none}#yt-app .yt-hrow::-webkit-scrollbar{display:none}
  #yt-app .yt-hcard{flex:0 0 144px;width:144px;text-align:left;display:block}#yt-app .yt-hcard .t{position:relative;width:144px;height:81px;border-radius:10px;overflow:hidden;background:#ddd}#yt-app .yt-hcard .t img{width:100%;height:100%;object-fit:cover}
  #yt-app .yt-hcard .t:after{content:"";position:absolute;left:0;bottom:0;height:3px;width:var(--p,40%);background:#f03}
  #yt-app .yt-hcard b{display:block;font-size:16px;font-weight:500;line-height:1.3;margin-top:10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}#yt-app .yt-hcard span{display:block;font-size:14px;color:#606060;margin-top:4px}
  #yt-app .yt-plrow{display:flex;align-items:center;gap:16px;padding:0 8px 0 16px;margin-bottom:22px;width:100%;text-align:left}#yt-app .yt-pl{position:relative;width:148px;height:81px;flex:none;margin-top:9px}
  #yt-app .yt-pl:before{content:"";position:absolute;left:14px;right:14px;top:-8px;height:12px;border-radius:10px 10px 0 0;background:var(--c)}#yt-app .yt-pl .t{position:absolute;inset:0;border-radius:10px;overflow:hidden;background:var(--c2)}#yt-app .yt-pl .t img{position:absolute;left:25%;width:50%;height:100%;object-fit:cover}
  #yt-app .yt-pl .t em{position:absolute;right:8px;bottom:8px;width:30px;height:22px;border-radius:11px;background:rgba(0,0,0,.6);color:#fff;display:grid;place-items:center}
  #yt-app .yt-plrow .tx{flex:1;min-width:0}#yt-app .yt-plrow b{display:block;font-size:20px;font-weight:600}#yt-app .yt-plrow span{display:block;font-size:14px;color:#606060;margin-top:8px}
  #yt-app .yt-empty{padding:38px 22px;text-align:center;color:#606060;font-size:14px;line-height:1.6}#yt-app .yt-empty b{display:block;color:#111;font-size:17px;margin-bottom:8px}
  #yt-app .yt-toast{position:absolute;bottom:96px;left:50%;transform:translateX(-50%);z-index:60;background:#333;color:#fff;border-radius:8px;padding:10px 14px;font-size:13px;white-space:nowrap}
  #yt-app .yt-sheet{position:absolute;left:0;right:0;top:281px;bottom:0;background:#fff;border-radius:14px 14px 0 0;z-index:40;display:flex;flex-direction:column;animation:ytup .2s ease-out;color:#0f0f0f}
  #yt-app .yt-sheet .grab{width:40px;height:4px;border-radius:2px;background:#ccc;margin:10px auto 0;flex:none}#yt-app .yt-sheet .sh{display:flex;align-items:center;padding:18px 16px 12px;font-size:20px;font-weight:700;flex:none}#yt-app .yt-sheet .sh button{margin-left:16px;width:28px;height:28px;display:grid;place-items:center}#yt-app .yt-sheet .sh .sp{flex:1}
  #yt-app .yt-sheet .pr{display:flex;gap:8px;padding:0 16px 12px;flex:none}#yt-app .yt-sheet .guide{background:#f2f2f2;padding:12px;font-size:14px;line-height:1.45;flex:none;border-top:1px solid #e5e5e5}#yt-app .yt-sheet .guide u{color:#065fd4;text-decoration:none}
  #yt-app .yt-sheet .list{flex:1;overflow-y:auto;padding:16px 12px;scrollbar-width:none}
  #yt-app .yt-cbox{pointer-events:none!important;cursor:default!important}#yt-app .yt-cm{display:flex;gap:12px;margin-bottom:22px}#yt-app .yt-cm .yt-avatar{width:36px;height:36px;font-size:0}#yt-app .yt-cm .b{flex:1;min-width:0}#yt-app .yt-cm .u{font-size:13px;color:#606060}#yt-app .yt-cm .x{font-size:16px;line-height:1.35;margin-top:2px;white-space:pre-wrap;word-break:break-word}
  #yt-app .yt-cm .a{display:flex;align-items:center;gap:22px;margin-top:10px;font-size:14px;color:#0f0f0f}#yt-app .yt-cm .a span{display:flex;align-items:center;gap:8px}#yt-app .yt-cm .rp{font-size:15px;font-weight:600;margin-top:22px;display:flex;align-items:center;gap:4px}
  #yt-app .yt-sheet .inp{flex:none;display:flex;gap:12px;padding:10px 12px 34px;border-top:1px solid #e5e5e5;align-items:center}#yt-app .yt-sheet .inp input{flex:1;height:40px;border-radius:20px;background:#f2f2f2;border:0;padding:0 16px;font-size:16px;outline:none;min-width:0}#yt-app .yt-sheet .inp button{width:40px;height:40px;border-radius:20px;background:#f2f2f2;display:grid;place-items:center}
  @keyframes ytup{from{transform:translateY(30px);opacity:0}to{transform:none;opacity:1}}
  #screen:has(#yt-app.show) #statusbar{color:#000!important}#screen:has(#yt-app.show) #statusbar .sb-wifi{color:#000!important;fill:#000!important;stroke:#000!important}#screen:has(#yt-app.show) #statusbar .sb-battery .bat-body{border-color:#000!important}#screen:has(#yt-app.show) #statusbar .sb-battery .bat-body i{background:#000!important}#screen:has(#yt-app.show) #statusbar .sb-battery .bat-cap{background:#000!important}#screen:has(#yt-app.show) .sb-wifi{fill:#111}#screen:has(#yt-app.show) .bat-body{border-color:rgba(0,0,0,.4)}#screen:has(#yt-app.show) .bat-body i{background:#111}#screen:has(#yt-app.show) .bat-cap{background:rgba(0,0,0,.45)}
  #screen:has(#yt-app.show.dark) #statusbar{color:#fff}#screen:has(#yt-app.show.dark) .sb-wifi{fill:#fff}#screen:has(#yt-app.show.dark) .bat-body{border-color:rgba(255,255,255,.4)}#screen:has(#yt-app.show.dark) .bat-body i{background:#fff}#screen:has(#yt-app.show.dark) .bat-cap{background:rgba(255,255,255,.45)}#screen:has(#yt-app.show) .sb-wifi{fill:#111}#screen:has(#yt-app.show) .bat-body{border-color:rgba(0,0,0,.4)}#screen:has(#yt-app.show) .bat-body i{background:#111}#screen:has(#yt-app.show) .bat-cap{background:rgba(0,0,0,.45)}
  #screen:has(#yt-app.show) .sb-battery.charging .bat-body i{background:#30d158}#screen:has(#yt-app.show) .sb-battery.low .bat-body i{background:#ff3b30}
  `;
  document.head.appendChild(style);
  const getVideo = id => videos.find(v=>v.id===id)||videos[0];
  const setDark = b => el.classList.toggle("dark",b);
  const av = (name,size) => `<span class="yt-avatar" style="background:${chColor[name]||"#6b6b6b"}${size?`;width:${size}px;height:${size}px`:""}">${channelProfiles[name]?`<img src="${channelProfiles[name].replace("%20"," ")}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block">`:esc(chAv[name]||String(name).trim().charAt(0).toUpperCase())}</span>`;
  const bell = `<button class="yt-iconbtn" data-act="toast" aria-label="알림">${ico("bell",26)}<span class="yt-badge">4</span></button>`;
  const srch = `<button class="yt-iconbtn" data-act="search" aria-label="검색">${ico("search",26)}</button>`;
  const searchRow = `<div class="yt-searchbar" id="yt-searchrow"><input id="yt-searchinput" placeholder="검색" value="${esc(query)}"><button class="yt-iconbtn" data-act="searchgo">${ico("search")}</button></div>`;
  const pills = (list,first) => `<div class="yt-pillrow">${first||""}${list.map((x,i)=>`<button class="yt-pill ${i===0?"on":""}" data-filter="${x}">${x}</button>`).join("")}</div>`;
  function homeHeader(){return `<header class="yt-head"><div class="yt-brand"><span class="yt-logo">${ico("play",11)}</span><b>YouTube</b></div><div class="yt-head-actions">${bell}${srch}</div></header>`}
  function subsHeader(){return `<header class="yt-head"><div class="yt-brand"><span class="yt-logo">${ico("play",11)}</span></div><div class="yt-head-actions">${bell}${srch}</div></header>`}
  function youHeader(){return `<header class="yt-head"><button class="yt-acct" data-act="toast">계정 ${ico("chevD",18)}</button><div class="yt-head-actions">${bell}${srch}<button class="yt-iconbtn" data-act="settings">${ico("gear",26)}</button></div></header>`}
  function nav(){const on=t=>tab===t;const d=tab==="shorts";return `<nav class="yt-nav"><button data-tab="home">${ico("home",26,on("home"))}<span>홈</span></button><button data-tab="shorts">${ico("shorts",26,on("shorts"))}<span>Shorts</span></button><button class="yt-plus" data-act="create"><span>${ico("plus",26,false,2)}</span></button><button data-tab="subs"><span class="${d||on("subs")?"":"yt-dot"}${d?" yt-dot":""}" style="display:grid">${ico("subs",26,on("subs"))}</span><span>구독</span></button><button class="me" data-tab="you"><i>떵</i><span>내 페이지</span></button></nav>`}
  function card(v){return `<button class="yt-card" data-video="${v.id}"><div class="yt-thumb"><img src="${img(v.img,720)}" alt=""><span class="yt-duration">${v.music?ico("note",14,false,2):""}${v.duration}</span></div><div class="yt-cardinfo">${av(v.channel)}<span class="yt-cardtext"><span class="yt-vtitle">${esc(v.title)}</span><span class="yt-subtext">${esc(v.channel)} &nbsp; ▷${v.views} &nbsp; ${v.time}</span></span><span class="yt-more">${ico("dotsV",22)}</span></div></button>`}
  const filtered = list => list.filter(v=>(v.title+" "+v.channel).toLowerCase().includes(query.toLowerCase()));
  function homeView(){const s=filtered(videos);return `${homeHeader()}${searchRow}${pills(["전체","게임","음악","믹스","스케치 코미디","라이브"],`<button class="yt-pill ic" data-act="toast">${ico("compass",24)}</button>`)}<div class="yt-feed">${s.length?s.map(card).join(""):`<div class="yt-empty">검색 결과가 없습니다.</div>`}</div>`}
  function subsView(){const s=filtered(videos.filter(v=>subChannels.includes(v.channel)||subscribed.has(v.channel)));return `${subsHeader()}${searchRow}<div class="yt-stories">${["강유미...","침착맨","케인 TV","서재로36","킥서비스"].map(n=>`<button class="yt-story" data-act="story" data-channel="${n}">${n==="강유미..."?`<span class="yt-avatar" style="background:#caa28a">👩</span>`:av(n)}<span>${n}</span></button>`).join("")}<button class="yt-storiesall" data-act="toast">전체</button></div>${pills(["전체","오늘","동영상","Shorts","라이브","팟캐스트"])}<div class="yt-feed">${s.length?s.map(card).join(""):`<div class="yt-empty"><b>영상이 없습니다</b>구독한 채널의 새 영상이 여기에 표시돼요.</div>`}</div>`}
  function shortsView(){const s=shorts[(shortsIndex+shorts.length)%shorts.length],sb=subscribed.has(s.channel),lk=shortLiked.has(shortsIndex);return `<div class="yt-short"><img class="yt-shortbg" src="${img(s.img,900)}"><div class="yt-shortshade"></div><div class="yt-tap" data-act="nextshort"></div><div class="yt-short-top"><button class="yt-iconbtn" data-act="search">${ico("search",28)}</button><button class="yt-iconbtn" data-act="toast">${ico("dotsV",26)}</button></div><div class="yt-shortbottom"><div class="yt-shortch">${av(s.name)}<b>@${esc(s.channel)}</b><button class="yt-subbtn ${sb?"on":""}" data-act="shortsub" data-channel="${s.channel}">${sb?"구독 중":"구독"}</button></div><span class="yt-shorttitle">${esc(s.title)}</span><span class="yt-shortsub">${s.sub}</span></div><div class="yt-shortside"><button data-act="shortlike">${ico("heart",40,lk,1.6)}<span>${lk?"880":s.likes}</span></button><button data-act="shortcomment">${ico("comment",38,false,1.6)}<span>${s.cm}</span></button><button data-act="shortsave">${ico("save",38,false,1.6)}<span>저장</span></button><button data-act="shortshare">${ico("shareA",38,false,1.6)}<span>공유</span></button><button data-act="toast">${ico("remix",38,false,1.6)}<span>리믹스</span></button>${av(s.name)}</div><div class="yt-shortprog"><i></i></div></div>`}
  function sheetHTML(){return `<div class="yt-sheet"><div class="grab"></div><div class="sh">댓글<span class="sp"></span><button data-act="toast">${ico("info",26)}</button><button data-act="closesheet">${ico("close",26)}</button></div><div class="pr"><button class="yt-pill on">인기순</button><button class="yt-pill">최신순</button></div><div class="list"><div class="guide">YouTube 커뮤니티 가이드를 따라 항상 타인을 존중하는 태도로 댓글을 작성하세요. <u>자세히 알아보기</u></div>${currentComments().map(c=>`<div class="yt-cm"><span class="yt-avatar" style="background:${c.av}">${ico("you",1)}</span><div class="b"><div class="u">@${esc(c.u)} • ${c.t}</div><div class="x">${esc(c.x)}</div><div class="a"><span>${ico("like",24)}${c.l||""}</span><span>${ico("dislike",24)}</span><span>${ico("comment",22)}</span></div>${c.r?`<div class="rp">답글 ${c.r}개 ${ico("chevR",18,false,2.2)}</div>`:""}</div></div>`).join("")}</div><div class="inp"><input id="yt-cinput" placeholder="댓글 올리기..."><button data-act="toast">${ico("thanks",26)}</button></div></div>`}
  function openSheet(){closeSheet();el.insertAdjacentHTML("beforeend",sheetHTML());sheet=true}
  function closeSheet(){el.querySelector(".yt-sheet")?.remove();sheet=false}
  function detailView(id){const v=getVideo(id),lk=liked.has(id),pr=v.id==="v10";setDark(true);return `<section class="yt-screen"><div class="yt-player"><img src="${img(v.img,960)}"><button class="yt-min" data-act="back">${ico("chevD",28,false,2.2)}</button><div class="yt-progress"><i style="width:${progress}%"></i></div></div><div style="background:#fff;padding-bottom:30px"><div class="yt-dtitle">${esc(v.title)}</div><div class="yt-dmeta"><b>${esc(v.handle||"@"+v.channel)}</b> &nbsp;조회수 ${v.views}회 &nbsp;${v.time} &nbsp;<b>더보기</b></div><div class="yt-dactions">${av(v.channel)}<button class="yt-bellpill" data-act="subscribe" data-channel="${esc(v.channel)}">${ico("bell",24,subscribed.has(v.channel))}${ico("chevD",18,false,2.2)}</button><span class="sp"></span><button class="ic ${lk?"on":""}" data-act="like" data-id="${id}">${ico("like",30,lk,1.7)}</button><button class="ic" data-act="dislike">${ico("dislike",30,false,1.7)}</button><button class="ic" data-act="share">${ico("shareA",30,false,1.7)}</button><button class="ic" data-act="save" data-id="${id}">${ico("dotsV",26)}</button></div><button class="yt-cbox" data-act="opensheet"><div class="h"><div>댓글<span>${id==="v9"?"3.7천":id==="v10"?"1.8천":id==="v11"?"203":currentComments().length+315}</span></div><div class="dots"><i></i><i></i><i></i></div></div><div class="r"><span class="yt-avatar" style="width:24px;height:24px;background:#5b6bc0;font-size:0"></span><div>${esc(currentComments()[0].x.split("\n")[0])}</div></div></button><div style="height:14px"></div>${videos.filter(x=>x.id!==id).slice(0,5).map(card).join("")}${pr?`<button class="yt-prod"><i>👕</i>[${esc(v.channel)}] ㅊㅊㅁ 반팔 레드 M<span style="margin-left:auto;display:flex;align-items:center;gap:6px;font-weight:600">제품 2개 ${ico("chevD",20,false,2)}</span></button>`:""}</div></section>`}
  function youView(){const hist=videos.slice(1,4),pls=[{t:"2025",s:"ru · 재생목록 · 오늘 업데이트됨",c:"#c9b98f",c2:"#4a3f10",im:"photo-1511671782779-c97d3d27a1d4",ic:"list",a:"toast"},{t:"좋아요 표시한 동영상",s:"비공개",c:"#a98089",c2:"#4a2a30",im:"photo-1494790108377-be9c29b29330",ic:"like",a:"liked"},{t:"나중에 볼 동영상",s:`비공개 · ${saved.size}개`,c:"#8fa87f",c2:"#243424",im:"photo-1516280440614-37939bbacd81",ic:"list",a:"saved"}];
    return `${youHeader()}${searchRow}<div class="yt-youtop"><span class="yt-avatar"><span style="font-size:40px">떵</span></span><div><h1>ddeong</h1><p>@ddeong-quw2&nbsp; Premium 회원</p></div></div><div class="yt-youbtns"><button data-act="toast">채널 보기</button><button class="o" data-act="toast">Premium 혜택</button></div><div class="yt-sec" data-act="history">기록 ${ico("chevR",24,false,2.2)}</div><div class="yt-hrow">${hist.map((v,i)=>`<button class="yt-hcard" data-video="${v.id}"><div class="t" style="--p:${[30,100,60][i]}%"><img src="${img(v.img,360)}"></div><b>${esc(v.title)}</b><span>${esc(v.channel)}</span></button>`).join("")}</div>`}
  function render(){if(!opened)return;sheet=false;activeVideo=null;setDark(tab==="shorts");el.innerHTML=`<main class="yt-body">${tab==="home"?homeView():tab==="shorts"?shortsView():tab==="subs"?subsView():youView()}</main>${nav()}`;}
  function listScreen(title,items,empty){setDark(false);el.innerHTML=`<section class="yt-screen"><div class="yt-screenhead"><button class="yt-iconbtn" data-act="back">${ico("back",26)}</button>${title}</div>${items.map(card).join("")||`<div class="yt-empty">${empty}</div>`}</section>`}
  function toast(msg){const old=el.querySelector(".yt-toast");if(old)old.remove();const t=document.createElement("div");t.className="yt-toast";t.textContent=msg;el.appendChild(t);setTimeout(()=>t.remove(),1800)}
  function open(){opened=true;el.classList.add("show");el.setAttribute("aria-hidden","false");render()}
  function close(){opened=false;playing=false;if(playTimer)clearInterval(playTimer);playTimer=null;el.classList.remove("show","dark");el.setAttribute("aria-hidden","true")}
  const tick = () => {if(!activeVideo)return;const v=getVideo(activeVideo);const [mins,secs]=v.duration.split(":").map(Number);const durationSeconds=mins*60+secs;progress=Math.min(100,progress+(10/durationSeconds));const p=el.querySelector(".yt-progress i");if(p)p.style.width=progress+"%";const t=el.querySelector(".yt-player-controls span");if(t){const sec=Math.floor(durationSeconds*progress/100);t.textContent=Math.floor(sec/60)+":"+String(sec%60).padStart(2,"0")+" / "+v.duration}if(progress>=100){playing=false;clearInterval(playTimer);playTimer=null}};
  document.addEventListener("app:open",e=>{if(e.detail?.id==="youtube")open()});
  document.addEventListener("app:close",e=>{if(!e.detail?.id||e.detail.id==="youtube")close()});
  el.addEventListener("click",e=>{
    if(e.target.closest('.yt-sec[data-act="history"], .yt-hrow')) return;
    const tabBtn=e.target.closest("[data-tab]"),videoBtn=e.target.closest("[data-video]"),act=e.target.closest("[data-act]"),filter=e.target.closest("[data-filter]");
    if(tabBtn){if(["shorts","subs","you"].includes(tabBtn.dataset.tab))return;tab=tabBtn.dataset.tab;query="";if(playTimer){clearInterval(playTimer);playTimer=null}render();return}
    if(videoBtn){activeVideo=videoBtn.dataset.video;playing=true;progress=0;if(playTimer)clearInterval(playTimer);playTimer=setInterval(tick,100);el.innerHTML=detailView(activeVideo);return}
    if(filter){el.querySelectorAll("[data-filter]").forEach(b=>b.classList.toggle("on",b===filter));const f=filter.dataset.filter;query=f==="음악"?"playlist":f==="게임"?"게임":"";const feed=el.querySelector(".yt-feed");if(feed){const base=tab==="subs"?videos.filter(v=>subChannels.includes(v.channel)||subscribed.has(v.channel)):videos;const l=filtered(base);feed.innerHTML=l.length?l.map(card).join(""):`<div class="yt-empty">영상이 없습니다.</div>`}return}
    if(!act)return;
    const a=act.dataset.act,id=act.dataset.id||activeVideo,v=getVideo(id||"v1");
    const redraw=()=>{if(activeVideo)el.innerHTML=detailView(activeVideo);else render()};
    if(a==="search"){const row=el.querySelector("#yt-searchrow");if(row){row.style.display=row.style.display==="flex"?"none":"flex";if(row.style.display==="flex")row.querySelector("input").focus()}else{toast("검색은 홈에서 할 수 있어요")}}
    else if(a==="searchgo"){query=(el.querySelector("#yt-searchinput")?.value||"").trim();render()}
    else if(a==="back"){if(playTimer){clearInterval(playTimer);playTimer=null}tab=tab==="shorts"?"home":tab;render()}
    else if(a==="create"){toast("만들기 메뉴")}
    else if(a==="story"){toast(act.dataset.channel+" 채널")}
    else if(a==="nextshort"){shortsIndex=(shortsIndex+1)%shorts.length;render()}
    else if(a==="shortlike"){shortLiked.has(shortsIndex)?shortLiked.delete(shortsIndex):shortLiked.add(shortsIndex);render()}
    else if(a==="shortsub"){const ch=act.dataset.channel;subscribed.has(ch)?subscribed.delete(ch):subscribed.add(ch);render()}
    else if(a==="shortcomment"||a==="opensheet"){return}
    else if(a==="closesheet"){closeSheet()}
    else if(a==="shortshare"||a==="share"){toast("공유 링크가 준비됐어요")}
    else if(a==="shortsave"){toast("나중에 볼 동영상에 저장했어요")}
    else if(a==="like"){liked.has(id)?liked.delete(id):liked.add(id);redraw()}
    else if(a==="dislike"){toast("추천에 반영했어요")}
    else if(a==="save"){saved.has(id)?saved.delete(id):saved.add(id);toast(saved.has(id)?"나중에 볼 동영상에 저장했어요":"저장을 취소했어요")}
    else if(a==="subscribe"){const ch=act.dataset.channel||v.channel;subscribed.has(ch)?subscribed.delete(ch):subscribed.add(ch);toast(subscribed.has(ch)?"알림을 설정했어요":"구독을 취소했어요");redraw()}
    else if(a==="download"){toast("오프라인 저장은 데모에서 지원하지 않아요")}
    else if(a==="toast"){toast("알림이 없습니다")}
    else if(a==="history"){listScreen("시청 기록",videos.slice(1,4),"시청 기록이 아직 없어요")}
    else if(a==="saved"){listScreen("나중에 볼 동영상",videos.filter(x=>saved.has(x.id)),"저장한 동영상이 없습니다.")}
    else if(a==="liked"){listScreen("좋아요 표시한 동영상",videos.filter(x=>liked.has(x.id)),"좋아요한 동영상이 없습니다.")}
    else if(a==="settings"){toast("설정은 데모 화면입니다")}
  });
  el.addEventListener("keydown",e=>{if(e.target.id==="yt-cinput"&&e.key==="Enter"){const t=e.target.value.trim();if(t){currentComments().unshift({u:"ddeong-quw2",t:"방금",x:t,l:0,r:0,av:"#d9a273"});openSheet();toast("댓글이 등록됐어요")}}});
  el.addEventListener("input",e=>{if(e.target.id==="yt-searchinput"){query=e.target.value;const feed=el.querySelector(".yt-feed");if(feed){const base=tab==="subs"?videos.filter(v=>subChannels.includes(v.channel)||subscribed.has(v.channel)):videos;const f=filtered(base);feed.innerHTML=f.length?f.map(card).join(""):'<div class="yt-empty">검색 결과가 없습니다.</div>'}}});
  let touchY=0,shortSwipeBusy=false;
  el.addEventListener("touchstart",e=>{touchY=e.touches[0]?.clientY||0},{passive:true});
  el.addEventListener("touchend",e=>{
    if(tab!=="shorts"||activeVideo||sheet||shortSwipeBusy)return;
    const dy=(e.changedTouches[0]?.clientY||touchY)-touchY;
    if(Math.abs(dy)<45)return;
    const card=el.querySelector(".yt-short");
    if(!card){shortsIndex=(shortsIndex+(dy<0?1:shorts.length-1))%shorts.length;render();return}
    shortSwipeBusy=true;
    const direction=dy<0?-1:1;
    card.style.transition="transform .24s cubic-bezier(.22,.61,.36,1), opacity .24s ease-out";
    card.style.transform="translateY("+(direction*-18)+"px)";card.style.opacity=".72";
    requestAnimationFrame(()=>{card.style.transform="translateY("+(direction*100)+"%)";card.style.opacity="0"});
    setTimeout(()=>{shortsIndex=(shortsIndex+(dy<0?1:shorts.length-1))%shorts.length;render();shortSwipeBusy=false},240);
  },{passive:true});
  window.YouTubeMock={open,close};
})();
