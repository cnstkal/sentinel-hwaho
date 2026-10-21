/* Shared identity assets for the Hwaho2 visual-only simulation. */
(() => {
  "use strict";
  const profiles = {
    "박성화": "images/app/Instagram/Profile/_starhwa_/IMG_7064.jpeg",
    "성화": "images/app/Instagram/Profile/_starhwa_/IMG_7064.jpeg",
    "mars": "images/app/Instagram/Profile/_starhwa_/IMG_7064.jpeg",
    "MARS": "images/app/Instagram/Profile/_starhwa_/IMG_7064.jpeg",
    "마스": "images/app/Instagram/Profile/_starhwa_/IMG_7064.jpeg",
    "떵화": "images/app/Instagram/Profile/_starhwa_/IMG_7064.jpeg",
    "_starhwa_": "images/app/Instagram/Profile/_starhwa_/IMG_7064.jpeg",
    "민기": "images/app/Instagram/Profile/fixon_n_on/IMG_7072.jpeg",
    "fixon_n_on": "images/app/Instagram/Profile/fixon_n_on/IMG_7072.jpeg",
    "홍중": "images/app/Instagram/Profile/no1likeme8_8/IMG_7065.jpeg",
    "NO1": "images/app/Instagram/Profile/no1likeme8_8/IMG_7065.jpeg",
    "no1likeme8_8": "images/app/Instagram/Profile/no1likeme8_8/IMG_7065.jpeg",
    "윤호": "images/Instagram/Profile/yunou._.u/IMG_8361.jpeg",
    "yunou._.u": "images/Instagram/Profile/yunou._.u/IMG_8361.jpeg"
  };
  window.HwahoIdentity = Object.freeze({
    avatar(name) {
      return profiles[String(name || "").trim()] || "";
    },
    avatarMarkup(name) {
      const src = this.avatar(name);
      return src ? '<img alt="" aria-hidden="true" src="' + src + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit" onerror="this.style.display=\'none\'">' : "";
    }
  });
})();
