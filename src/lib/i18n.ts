import type { AppLanguage } from "@/stores/language-store";

const translations = {
  // Layout
  "meta.title": {
    "zh-CN": "VibeKid - 和 AI 一起创造",
    "zh-TW": "VibeKid - 和 AI 一起創造",
    en: "VibeKid - Create with AI",
  },
  "meta.description": {
    "zh-CN": "让孩子通过和 AI 对话，把想法变成可以玩的作品",
    "zh-TW": "讓孩子透過和 AI 對話，把想法變成可以玩的作品",
    en: "Turn your ideas into playable creations by chatting with AI",
  },

  // Login page
  "login.subtitle": {
    "zh-CN": "和 AI 一起创造有趣的东西 ✨",
    "zh-TW": "和 AI 一起創造有趣的東西 ✨",
    en: "Create fun things with AI ✨",
  },
  "login.username": {
    "zh-CN": "用户名",
    "zh-TW": "使用者名稱",
    en: "Username",
  },
  "login.password": {
    "zh-CN": "密码",
    "zh-TW": "密碼",
    en: "Password",
  },
  "login.usernamePlaceholder": {
    "zh-CN": "输入用户名",
    "zh-TW": "輸入使用者名稱",
    en: "Enter username",
  },
  "login.passwordPlaceholder": {
    "zh-CN": "输入密码",
    "zh-TW": "輸入密碼",
    en: "Enter password",
  },
  "login.submit": {
    "zh-CN": "开始创作 🚀",
    "zh-TW": "開始創作 🚀",
    en: "Start Creating 🚀",
  },
  "login.loading": {
    "zh-CN": "登录中...",
    "zh-TW": "登入中...",
    en: "Logging in...",
  },
  "login.errorCredentials": {
    "zh-CN": "用户名或密码不对哦 😅",
    "zh-TW": "使用者名稱或密碼不對哦 😅",
    en: "Wrong username or password 😅",
  },
  "login.errorNetwork": {
    "zh-CN": "网络好像出了点问题",
    "zh-TW": "網路好像出了點問題",
    en: "Network error, please try again",
  },

  // Home page
  "home.hero.title1": {
    "zh-CN": "把你的想法",
    "zh-TW": "把你的想法",
    en: "Turn your ideas",
  },
  "home.hero.title2": {
    "zh-CN": "变成现实",
    "zh-TW": "變成現實",
    en: "into reality",
  },
  "home.hero.subtitle": {
    "zh-CN": "告诉 AI 你想做什么，一起创造属于你的游戏、动画和音乐！",
    "zh-TW": "告訴 AI 你想做什麼，一起創造屬於你的遊戲、動畫和音樂！",
    en: "Tell AI what you want to make — create your own games, animations, and music!",
  },
  "home.startCreating": {
    "zh-CN": "开始创作",
    "zh-TW": "開始創作",
    en: "Start Creating",
  },
  "home.myProjects": {
    "zh-CN": "我的作品",
    "zh-TW": "我的作品",
    en: "My Projects",
  },
  "home.inspiration": {
    "zh-CN": "灵感卡片",
    "zh-TW": "靈感卡片",
    en: "Inspiration",
  },
  "home.howItWorks": {
    "zh-CN": "怎么玩",
    "zh-TW": "怎麼玩",
    en: "How it works",
  },
  "home.step1.title": {
    "zh-CN": "1. 说出想法",
    "zh-TW": "1. 說出想法",
    en: "1. Share your idea",
  },
  "home.step1.desc": {
    "zh-CN": "打字或者用语音告诉小V你想做什么",
    "zh-TW": "打字或者用語音告訴小V你想做什麼",
    en: "Type or speak to tell XiaoV what you want to make",
  },
  "home.step2.title": {
    "zh-CN": "2. 一起完成",
    "zh-TW": "2. 一起完成",
    en: "2. Build together",
  },
  "home.step2.desc": {
    "zh-CN": "小V 帮你一步一步做出来，你来决定细节",
    "zh-TW": "小V 幫你一步一步做出來，你來決定細節",
    en: "XiaoV builds it step by step — you decide the details",
  },
  "home.step3.title": {
    "zh-CN": "3. 玩起来！",
    "zh-TW": "3. 玩起來！",
    en: "3. Play!",
  },
  "home.step3.desc": {
    "zh-CN": "每一步都可以看到结果，随时能玩你的作品",
    "zh-TW": "每一步都可以看到結果，隨時能玩你的作品",
    en: "See results at every step — play your creation anytime",
  },
  "home.footer": {
    "zh-CN": "VibeKid — 让每个孩子都成为创造者 ✨",
    "zh-TW": "VibeKid — 讓每個孩子都成為創造者 ✨",
    en: "VibeKid — Every kid is a creator ✨",
  },
  "home.logout": {
    "zh-CN": "退出",
    "zh-TW": "登出",
    en: "Logout",
  },

  // Inspiration cards
  "card.snake": { "zh-CN": "贪吃蛇", "zh-TW": "貪吃蛇", en: "Snake Game" },
  "card.snake.desc": { "zh-CN": "经典小游戏", "zh-TW": "經典小遊戲", en: "Classic arcade game" },
  "card.drawing": { "zh-CN": "画画板", "zh-TW": "畫畫板", en: "Drawing Board" },
  "card.drawing.desc": { "zh-CN": "自由涂鸦创作", "zh-TW": "自由塗鴉創作", en: "Free doodle & create" },
  "card.music": { "zh-CN": "音乐盒", "zh-TW": "音樂盒", en: "Music Box" },
  "card.music.desc": { "zh-CN": "创作你的旋律", "zh-TW": "創作你的旋律", en: "Compose your melody" },
  "card.space": { "zh-CN": "太空冒险", "zh-TW": "太空冒險", en: "Space Adventure" },
  "card.space.desc": { "zh-CN": "飞船射击游戏", "zh-TW": "飛船射擊遊戲", en: "Spaceship shooter" },
  "card.math": { "zh-CN": "数学大挑战", "zh-TW": "數學大挑戰", en: "Math Challenge" },
  "card.math.desc": { "zh-CN": "趣味算术游戏", "zh-TW": "趣味算術遊戲", en: "Fun arithmetic game" },
  "card.rainbow": { "zh-CN": "彩虹粒子", "zh-TW": "彩虹粒子", en: "Rainbow Particles" },
  "card.rainbow.desc": { "zh-CN": "酷炫动画效果", "zh-TW": "酷炫動畫效果", en: "Cool animation effects" },

  // Workspace header
  "workspace.version": {
    "zh-CN": "版本",
    "zh-TW": "版本",
    en: "v",
  },
  "workspace.home": {
    "zh-CN": "首页",
    "zh-TW": "首頁",
    en: "Home",
  },

  // Chat panel
  "chat.placeholder": {
    "zh-CN": "告诉小V你想做什么...",
    "zh-TW": "告訴小V你想做什麼...",
    en: "Tell XiaoV what you want to make...",
  },
  "chat.emptyHint": {
    "zh-CN": "告诉小V你想做什么吧！",
    "zh-TW": "告訴小V你想做什麼吧！",
    en: "Tell XiaoV what you want to make!",
  },
  "chat.thinking": {
    "zh-CN": "正在思考...",
    "zh-TW": "正在思考...",
    en: "Thinking...",
  },
  "chat.speaking": {
    "zh-CN": "小V 说话中",
    "zh-TW": "小V 說話中",
    en: "XiaoV speaking",
  },
  "chat.ideaTooltip": {
    "zh-CN": "帮我想想新点子！",
    "zh-TW": "幫我想想新點子！",
    en: "Give me a new idea!",
  },
  "chat.voiceStop": {
    "zh-CN": "停止录音",
    "zh-TW": "停止錄音",
    en: "Stop recording",
  },
  "chat.voiceStart": {
    "zh-CN": "语音输入",
    "zh-TW": "語音輸入",
    en: "Voice input",
  },
  "chat.error": {
    "zh-CN": "哎呀，小V 遇到了一点小问题，再试一次吧！",
    "zh-TW": "哎呀，小V 遇到了一點小問題，再試一次吧！",
    en: "Oops, XiaoV had a little hiccup — try again!",
  },
  "chat.fixGiveUp": {
    "zh-CN": "哎呀，小V 试了好几次还是没弄好，你可以换个说法再告诉我一次吗？ 😅",
    "zh-TW": "哎呀，小V 試了好幾次還是沒弄好，你可以換個說法再告訴我一次嗎？ 😅",
    en: "Oops, XiaoV tried several times but couldn't fix it. Could you try saying it differently? 😅",
  },
  "chat.fixAttempt1": {
    "zh-CN": "小V 发现了一个小虫子 🐛，正在修修补补...",
    "zh-TW": "小V 發現了一個小蟲子 🐛，正在修修補補...",
    en: "XiaoV found a little bug 🐛 — fixing it up...",
  },
  "chat.fixAttempt2": {
    "zh-CN": "差一点就好了！小V 再努力一下 💪",
    "zh-TW": "差一點就好了！小V 再努力一下 💪",
    en: "Almost there! XiaoV is trying harder 💪",
  },
  "chat.fixAttempt3": {
    "zh-CN": "小V 在认真检查每一行魔法咒语 🔮...",
    "zh-TW": "小V 在認真檢查每一行魔法咒語 🔮...",
    en: "XiaoV is carefully checking every magic spell 🔮...",
  },
  "chat.fixGiveUpShort": {
    "zh-CN": "小V 遇到了点困难，你再说一次试试？",
    "zh-TW": "小V 遇到了點困難，你再說一次試試？",
    en: "XiaoV is having trouble — could you try again?",
  },
  "chat.suggestIdea": {
    "zh-CN": "[SUGGEST_IDEA] 帮我想想还能加什么有趣的东西？",
    "zh-TW": "[SUGGEST_IDEA] 幫我想想還能加什麼有趣的東西？",
    en: "[SUGGEST_IDEA] What fun thing could we add next?",
  },

  // Preview panel
  "preview.fixing": {
    "zh-CN": "小V 正在修修补补...",
    "zh-TW": "小V 正在修修補補...",
    en: "XiaoV is patching things up...",
  },
  "preview.running": {
    "zh-CN": "运行中",
    "zh-TW": "執行中",
    en: "Running",
  },
  "preview.loading": {
    "zh-CN": "加载中...",
    "zh-TW": "載入中...",
    en: "Loading...",
  },
  "preview.error": {
    "zh-CN": "出错啦",
    "zh-TW": "出錯啦",
    en: "Error",
  },
  "preview.idle": {
    "zh-CN": "等待开始",
    "zh-TW": "等待開始",
    en: "Waiting",
  },
  "preview.emptyTitle": {
    "zh-CN": "你的作品会在这里出现",
    "zh-TW": "你的作品會在這裡出現",
    en: "Your creation will appear here",
  },
  "preview.emptySubtitle": {
    "zh-CN": "告诉小V你想做什么吧！",
    "zh-TW": "告訴小V你想做什麼吧！",
    en: "Tell XiaoV what you want to make!",
  },
  "preview.fixingOverlay": {
    "zh-CN": "小V 正在努力修修补补...",
    "zh-TW": "小V 正在努力修修補補...",
    en: "XiaoV is working hard to fix things...",
  },
  "preview.fixingSoon": {
    "zh-CN": "马上就好！",
    "zh-TW": "馬上就好！",
    en: "Almost done!",
  },
  "preview.retry": {
    "zh-CN": "重试",
    "zh-TW": "重試",
    en: "Retry",
  },
  "preview.run": {
    "zh-CN": "运行",
    "zh-TW": "執行",
    en: "Run",
  },
  "preview.version": {
    "zh-CN": "版本",
    "zh-TW": "版本",
    en: "v",
  },
} as const;

type TranslationKey = keyof typeof translations;

/** Get a translated string for the current language */
export function t(key: TranslationKey, language: AppLanguage): string {
  return translations[key]?.[language] ?? translations[key]?.["en"] ?? key;
}
