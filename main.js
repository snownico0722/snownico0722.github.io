// 魔法工厂 · 无依赖脚本

document.getElementById("year").textContent = new Date().getFullYear();

/* ============================================================
   导航:只切 stage 的 data-view,横幅/内容体靠 CSS 选择器响应。
   不显隐、不量高、不 FLIP —— 不闪。
   ============================================================ */
(function () {
  const stage = document.getElementById("stage");
  const hatUse = document.getElementById("hat-use");
  const valid = { tools: 1, fortune: 1, games: 1 };
  const HATS = { home: "#hat", fortune: "#hat-fortune", games: "#hat-games", tools: "#hat-tools" };
  let sfxInitial = true;

  function setView(view) {
    if (!valid[view]) view = "home";
    stage.setAttribute("data-view", view);
    document.body.setAttribute("data-view", view); // 驱动背景主题
    if (window.__setBgView) window.__setBgView(view); // 通知背景渲染器
    if (hatUse) hatUse.setAttribute("href", HATS[view] || "#hat");
    if (!sfxInitial && window.SFX) {
      window.SFX.play("switch");
    }
    sfxInitial = false;
  }

  function nav(zone) {
    const target = zone === "home" ? "" : zone;
    if (("#" + target) === location.hash || (target === "" && !location.hash)) {
      setView(zone);
    } else {
      location.hash = target;
    }
  }

  document.addEventListener("click", function (e) {
    const t = e.target.closest("[data-go]");
    if (!t) return;
    // 招牌(hero)里点链接不触发回门口
    if (t.id === "hero" && e.target.closest("a, .mini-ico")) return;
    nav(t.getAttribute("data-go"));
  });

  // 招牌键盘可达(Enter / 空格 = 回门口)
  const hero = document.getElementById("hero");
  if (hero) {
    hero.addEventListener("keydown", function (e) {
      if ((e.key === "Enter" || e.key === " ") && stage.getAttribute("data-view") !== "home") {
        e.preventDefault();
        nav("home");
      }
    });
  }

  window.addEventListener("hashchange", function () {
    setView(location.hash.replace("#", "") || "home");
  });

  setView(location.hash.replace("#", "") || "home");
})();

/* ---------- 飘浮火花 ---------- */
(function () {
  const layer = document.querySelector(".sparks");
  if (!layer) return;
  const COLORS = ["#ffb43c", "#ff7a3c", "#7c5cff", "#4ec5d6"];
  for (let i = 0; i < 20; i++) {
    const s = document.createElement("i");
    s.style.left = Math.random() * 100 + "vw";
    s.style.background = COLORS[(Math.random() * COLORS.length) | 0];
    const size = 4 + Math.random() * 5;
    s.style.width = s.style.height = size + "px";
    s.style.animationDuration = 7 + Math.random() * 8 + "s";
    s.style.animationDelay = -Math.random() * 12 + "s";
    layer.appendChild(s);
  }
})();

/* ---------- 各房间背景装饰:启动时填充 ---------- */
(function () {
  // 占卜室:星辰 + 漂浮符文
  const stars = document.getElementById("bd-stars");
  if (stars) {
    for (let i = 0; i < 80; i++) {
      const s = document.createElement("i");
      s.style.left = Math.random() * 100 + "vw";
      s.style.top = Math.random() * 100 + "vh";
      s.style.animationDelay = -Math.random() * 3 + "s";
      const sz = 1 + Math.random() * 2;
      s.style.width = s.style.height = sz + "px";
      stars.appendChild(s);
    }
  }
  const runes = document.getElementById("bd-runes");
  if (runes) {
    const G = ["✦", "☾", "✶", "⚝", "❋", "✷", "༄", "♆", "☉", "✴"];
    for (let i = 0; i < 12; i++) {
      const r = document.createElement("i");
      r.textContent = G[(Math.random() * G.length) | 0];
      r.style.left = Math.random() * 100 + "vw";
      r.style.fontSize = 1 + Math.random() * 1.4 + "rem";
      r.style.animationDuration = 12 + Math.random() * 12 + "s";
      r.style.animationDelay = -Math.random() * 20 + "s";
      runes.appendChild(r);
    }
  }
  // 游戏厅:像素方块
  const pix = document.getElementById("bd-pix");
  if (pix) {
    const C = ["#50ffaa", "#ff5a8a", "#ffe14d", "#5ab0ff", "#c77dff"];
    for (let i = 0; i < 22; i++) {
      const p = document.createElement("i");
      p.style.left = Math.random() * 100 + "vw";
      p.style.background = C[(Math.random() * C.length) | 0];
      const sz = 8 + ((Math.random() * 3) | 0) * 6;
      p.style.width = p.style.height = sz + "px";
      p.style.animationDuration = 6 + Math.random() * 7 + "s";
      p.style.animationDelay = -Math.random() * 12 + "s";
      pix.appendChild(p);
    }
  }
  // 奇怪工坊:背景齿轮 + 蒸汽
  const cogs = document.getElementById("bd-cogs");
  if (cogs) {
    const conf = [
      { x: "6%", y: "10%", s: 160, d: 30, rev: false },
      { x: "78%", y: "6%", s: 220, d: 44, rev: true },
      { x: "12%", y: "62%", s: 260, d: 52, rev: true },
      { x: "70%", y: "60%", s: 180, d: 36, rev: false },
    ];
    conf.forEach(function (c) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 100 100");
      svg.style.left = c.x; svg.style.top = c.y;
      svg.style.width = svg.style.height = c.s + "px";
      svg.style.animation = "spin" + (c.rev ? "-rev" : "") + " " + c.d + "s linear infinite";
      const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
      use.setAttribute("href", "#gear");
      svg.appendChild(use);
      cogs.appendChild(svg);
    });
  }
  const steam = document.getElementById("bd-steam");
  if (steam) {
    for (let i = 0; i < 10; i++) {
      const s = document.createElement("i");
      s.style.left = Math.random() * 100 + "vw";
      const sz = 40 + Math.random() * 70;
      s.style.width = s.style.height = sz + "px";
      s.style.animationDuration = 9 + Math.random() * 9 + "s";
      s.style.animationDelay = -Math.random() * 16 + "s";
      steam.appendChild(s);
    }
  }
})();

/* ---------- 好感度计算机:逐字搬魔法师量表的维度/权重/锚点 ---------- */
(function () {
  const rows = document.getElementById("aff-rows");
  if (!rows) return;
  const numEl = document.getElementById("aff-num");
  const fillEl = document.getElementById("aff-fill");
  const sayEl = document.getElementById("aff-say");
  const screenEl = document.querySelector(".aff-screen");
  const resetBtn = document.getElementById("aff-reset");

  // [名称, 权重, 取值下限, 取值上限, 打分锚点]
  const DIMS = [
    ["熟悉度", 10, 0, 100, "0陌生 · 10初识 · 30老友 · 50挚友 · 90自己"],
    ["好感度", 15, -100, 100, "0陌生 · 30有一定兴趣 · 60很喜欢"],
    ["幻想好感度", 5, -100, 100, "你认为目标对你的好感是多少"],
    ["恋爱度", 20, 0, 100, "0不作为目标 · 5性取向内不反感 · 20有兴趣 · 40想谈 · 60交往中"],
    ["影响度", 10, 0, 100, "0无影响 · 20有一定影响(口癖/思考) · 40较多影响"],
    ["共同回忆度", 10, 0, 100, "0不认识 · 20常一起玩 · 40很长共同经历 · 60多年老友"],
    ["投入度", 20, 0, 100, "0无关系 · 15付出一整天 · 40经常为对方做事 · 60主动关心"],
    ["爱好度", 20, 0, 100, "0无重叠 · 30某方面同好 · 50喜欢领域同好 · 70极度契合"],
    ["触发度", 20, 0, 100, "0不会想到 · 30经常想到 · 50基本每天 · 70每天数次"],
    ["认同度", 8, 0, 100, "0陌生 · 30一定认可 · 50很厉害 · 90崇拜"],
    ["幻想度", 5, 0, 100, "对目标的幻想,约等同于期待"],
    ["借钱额度", 40, 0, 100, "借出全部年薪 = 100"],
    ["不可割舍度", 20, 0, 100, "0无所谓 · 30心痛 · 60无法割舍"],
  ];

  // 评语:满值 100 为基准。超 100 爆表,超 150 反过来质疑打分的人。
  function verdict(v) {
    if (v > 150) return "卦象崩了。两个人之间到不了这个数 —— 要么你哪道刻度重复算了,要么你在哄自己。回去重来。";
    if (v > 100) return "爆表。这人在你这儿,早就不是一道术式量得住的了。";
    if (v <= 0) return "陌生人。或者,你压根不想为这个人动这一卦。";
    if (v < 15) return "点头之交。下次照面,名字大概还得想一下。";
    if (v < 35) return "认识,也有点意思,但还没走进你心里。";
    if (v < 55) return "朋友了。会主动找,会突然想起。";
    if (v < 80) return "挚友这一档。我那位「挚友 a」就落在这附近 —— 66.6。";
    return "很重的人。真要从生活里抹掉,会疼 —— 不过还没爆表。";
  }

  const inputs = [];
  DIMS.forEach(function (d, i) {
    const [name, w, lo, hi, hint] = d;
    const row = document.createElement("div");
    row.className = "aff-row";
    row.innerHTML =
      '<div class="aff-row-top">' +
        '<span class="aff-row-head"><span class="aff-row-name">' + name + '</span>' +
        '<span class="aff-row-hint">' + hint + '</span></span>' +
        '<span class="aff-row-val" data-val="' + i + '">0</span>' +
      '</div>' +
      '<input class="aff-range" type="range" min="' + lo + '" max="' + hi + '" step="5" value="0" data-i="' + i + '" aria-label="' + name + '">';
    rows.appendChild(row);
    inputs.push(row.querySelector("input"));
  });

  function recompute() {
    let sum = 0;
    inputs.forEach(function (inp, i) {
      const v = Number(inp.value);
      sum += v * DIMS[i][1];
      rows.querySelector('[data-val="' + i + '"]').textContent = v;
    });
    const total = sum / 100;
    numEl.textContent = total.toFixed(1);
    // 满值 100 为基准线
    fillEl.style.width = Math.max(0, Math.min(100, total)) + "%";
    screenEl.classList.toggle("is-over", total > 100);
    screenEl.classList.toggle("is-doubt", total > 150);
    sayEl.textContent = verdict(total);
  }

  inputs.forEach((inp) => inp.addEventListener("input", recompute));
  resetBtn.addEventListener("click", function () {
    inputs.forEach((inp) => (inp.value = 0));
    recompute();
  });
  recompute();
})();

/* ---------- 房间内机器选择器:点标签切机器,一次只显示一台 ---------- */
(function () {
  document.querySelectorAll(".picker[data-picker]").forEach(function (picker) {
    const body = picker.closest(".body-inner");
    picker.addEventListener("click", function (e) {
      const btn = e.target.closest(".pick[data-machine]");
      if (!btn) return;
      const id = btn.getAttribute("data-machine");
      picker.querySelectorAll(".pick").forEach((p) => p.classList.toggle("on", p === btn));
      body.querySelectorAll(".machine[data-machine]").forEach(function (m) {
        const show = m.getAttribute("data-machine") === id;
        m.hidden = !show;
        m.classList.remove("m-in");
        if (show) { void m.offsetWidth; m.classList.add("m-in"); }
      });
    });
  });
})();

/* ---------- 施法火花:点魔法师帽子,迸一串火花 ---------- */
(function () {
  const hat = document.querySelector(".hero-hat");
  if (!hat) return;
  const COLORS = ["#ffb43c", "#ff7a3c", "#7c5cff", "#4ec5d6", "#36c46f"];
  hat.addEventListener("click", function (e) {
    e.stopPropagation(); // 别触发招牌的"回门口"
    if (window.SFX) window.SFX.play("magic");
    const r = hat.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    for (let i = 0; i < 14; i++) {
      const s = document.createElement("div");
      s.className = "cast-spark";
      const ang = (Math.PI * 2 * i) / 14 + Math.random() * 0.4;
      const dist = 40 + Math.random() * 55;
      s.style.left = cx + "px";
      s.style.top = cy + "px";
      s.style.background = COLORS[(Math.random() * COLORS.length) | 0];
      s.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      s.style.setProperty("--dy", Math.sin(ang) * dist + "px");
      document.body.appendChild(s);
      s.addEventListener("animationend", () => s.remove());
    }
  });
})();

/* ============================================================
   鬼话发生器 · 4 主题(狗屁不通/老胡体/互联网黑话/你的味)× 4 模式。
   默认=原版扁平引擎换词库;创意=每主题结构化新风格 + 专属名人名言。
   「再来亿点」在结尾继续追加,越滚越长。纯本地,只能拿来玩。
   ============================================================ */
(function () {
  const input = document.getElementById("bs-input");
  const goBtn = document.getElementById("bs-go");
  const moreBtn = document.getElementById("bs-more");
  const out = document.getElementById("bs-out");
  const copyBtn = document.getElementById("bs-copy");
  const countEl = document.getElementById("bs-count");
  const stylesBox = document.getElementById("bs-styles");
  const modeBox = document.getElementById("bs-mode");
  if (!input || !out) return;

  const D = window.__BS__;
  const rand = (a) => a[(Math.random() * a.length) | 0];
  const fill = (s, t) => s.replace(/__T__/g, t);
  const ORDER = ["bs", "huge", "jargon", "me"];
  let theme = "";
  let active = "bs";
  let mode = "def";
  let lastBody = -1;
  let debtCtx = null;

  // 主题标签
  ORDER.forEach(function (key) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "bs-style" + (key === active ? " on" : "");
    b.textContent = D.themes[key].label;
    b.addEventListener("click", function () {
      active = key;
      stylesBox.querySelectorAll(".bs-style").forEach((x) => x.classList.remove("on"));
      b.classList.add("on");
    });
    stylesBox.appendChild(b);
  });

  // 默认 / 创意 开关
  modeBox.addEventListener("click", function (e) {
    const b = e.target.closest(".bs-m[data-mode]");
    if (!b) return;
    mode = b.getAttribute("data-mode");
    if (mode !== "debt") debtCtx = null;
    modeBox.querySelectorAll(".bs-m").forEach((x) => x.classList.toggle("on", x === b));
  });

  function pickBody(pool) {
    let i; do { i = (Math.random() * pool.length) | 0; } while (i === lastBody && pool.length > 1);
    lastBody = i;
    return pool[i];
  }

  // 默认引擎:扁平 body 池 + 通用名人乱入
  function chunkDef(n) {
    const pool = D.themes[active].def.body;
    let s = "";
    while (s.length < n) {
      if (Math.random() < 0.22) {
        s += rand(D.famous) + "曾经说过:“" + rand(D.quotes) + "”这句话语虽然很短,但令我浮想联翩。";
      } else { s += fill(pickBody(pool), theme); }
    }
    return s;
  }

  // 创意引擎:open 起头 + body/turn 交错 + 专属名人 + close 收尾(整篇成段)
  function chunkCre(n, opener) {
    const C = D.themes[active].cre;
    let s = opener ? fill(rand(C.open), theme) : "";
    while (s.length < n) {
      const r = Math.random();
      if (r < 0.2 && C.names) {
        s += rand(C.names) + "说过:“" + rand(C.quotes) + "”用在__T__上,再合适不过。".replace(/__T__/g, theme);
      } else if (r < 0.34 && C.turn.length) {
        s += rand(C.turn);
      } else { s += fill(pickBody(C.body), theme); }
    }
    if (opener) s += fill(rand(C.close), theme);
    return s;
  }

  const DEBT = {
    bs: {
      calm: [
        "关于「__T__」，先不急着把它说成问题。我们只看它的定义、原因和结论能不能互相接住；如果接不住，后面的论证再热闹也只是空转。",
        "先冷静处理「__T__」。它不是不能讨论，真正要看的，是讨论本身有没有把前提、答案和意义放在同一条线上。",
      ],
      nouns: ["意义", "问题", "原因", "答案", "前提", "结论", "必然", "废话"],
      doubts: [
        "如果__NOUN__本身还没站稳，它凭什么去解释「__T__」？",
        "__NOUN__到底是在推出结论，还是在冒充结论？",
        "一旦把__NOUN__拿掉，「__T__」还剩下什么？",
      ],
      settlements: [
        "__NOUN1__正在证明__NOUN2__，可__NOUN2__又反过来要求__NOUN1__先成立。",
        "所谓__NOUN1__，其实只是__NOUN2__换了一个方向继续空转。",
        "如果__NOUN1__必须依赖__NOUN2__，那__NOUN2__的意义又是谁给的？",
      ],
      fatal: ["所以不是我们说清了「__T__」，是「__T__」把说清这件事也吞了。", "讨论到这里，__T__已经不是主题，是主题自己留下的回声。"],
    },
    huge: {
      calm: [
        "关于「__T__」，老胡先说一个冷静判断：这件事不能简单看，也不宜急着下结论。越是众说纷纭，越要把事实、情绪和大局分开。",
        "老胡看「__T__」，第一反应还是观察。复杂问题要复杂看，不能用一句话把所有矛盾都盖过去。",
      ],
      nouns: ["定力", "复杂", "大局", "观察", "博弈", "判断", "舆论", "稳"],
      doubts: [
        "如果连__NOUN__都没有看清，现在急着表态就会出问题。",
        "__NOUN__不是口号，老胡必须把它放回「__T__」的现实背景里看。",
        "越是这个时候，越要问一句：__NOUN__到底还能不能撑住？",
      ],
      settlements: [
        "__NOUN1__需要__NOUN2__来支撑，可__NOUN2__本身也在摇晃。",
        "老胡想用__NOUN1__稳住__NOUN2__，但__NOUN2__越稳越显得__NOUN1__复杂。",
        "既要看到__NOUN1__，也要看到__NOUN2__，还要看到两者之间越来越难维持的平衡。",
      ],
      fatal: ["总之，老胡还是那个判断：要稳。但稳这件事本身，已经变得很不稳了。", "再观察观察。不是拖，是只能再观察。"],
    },
    jargon: {
      calm: [
        "关于「__T__」，先不要急着给定义。我们先把核心链路摊开，看它到底接在哪里；只有弄清输入、承接和输出，谈闭环才有意义。",
        "先回到「__T__」本身。它不是一个孤立概念，需要放进完整链路里看，否则颗粒度一错，后面的判断都会跑偏。",
      ],
      nouns: ["闭环", "颗粒度", "链路", "飞轮", "抓手", "漏斗", "心智", "反哺"],
      doubts: [
        "__NOUN__如果没有接住「__T__」，后面的增长叙事就全是空转。",
        "这里的关键不是「__T__」，而是__NOUN__到底有没有真实落点。",
        "一旦__NOUN__跑偏，整个链路都会开始反向污染。",
      ],
      settlements: [
        "__NOUN1__反哺了__NOUN2__，__NOUN2__又把__NOUN1__包装成了新的入口。",
        "表面是__NOUN1__，实际是__NOUN2__在借「__T__」完成自我闭环。",
        "__NOUN1__的底层逻辑变成了__NOUN2__，__NOUN2__的底层逻辑又回到了__NOUN1__。",
      ],
      fatal: ["最后，「__T__」不再是议题，只剩下闭环在闭环自己。", "链路已经跑完了，跑回了它自己。"],
    },
    me: {
      calm: [
        "先冷静说「__T__」。这个词到底指什么，先不要加戏，先拆定义。它如果成立，需要满足什么条件；如果不成立，又是哪一段推导断了，这些要先讲清楚。",
        "讨论「__T__」之前，先把标准摆出来：真实不真实，有没有证据，能不能落地，代价由谁承担。只要这几项没有说清，后面的漂亮话都只能算包装。",
        "先别把「__T__」急着归类。它可以是方案、作品、关系，也可以只是一句判断；不管是哪种，标准得一致，代价得有人记账。",
      ],
      nouns: ["标准", "代价", "证据", "结论", "推导", "闭环", "边界", "交付", "反例", "来源", "取舍", "意义", "双标", "判断"],
      doubts: [
        "连最基本的__NOUN__都没对齐，你就敢往下推结论？",
        "如果按这个逻辑，__NOUN__最后会反噬到谁脸上？",
        "中间的__NOUN__呢？被你吃了？",
        "这不是推导，你这是把__NOUN__包装成了真理。",
        "按这个标准，换个对象是不是也能这么判？你敢承认吗。",
        "__NOUN__是真有，还是你为了圆前一句顺手补出来的？",
        "这不是我故意找茬，是围绕__NOUN__的标准前后不一致。",
      ],
      settlements: [
        "你说的__NOUN1__，本质上只是为了掩盖__NOUN2__的缺失。",
        "一旦__NOUN1__是假的，整个__NOUN2__也就不存在了。",
        "谁来兜底这个__NOUN1__？你拿__NOUN2__来兜底吗？",
        "把__NOUN1__当成__NOUN2__，你真敢拿这东西出来。",
      ],
      fatal: ["我有点不接受。", "你自己看这行得通吗？重算。", "把每一步的证据贴上来，别糊弄。", "别让我替你补脑。", "这一步先别过。"],
    },
  };

  function debtFill(s, pairs) {
    Object.keys(pairs).forEach((k) => { s = s.replace(new RegExp("__" + k + "__", "g"), pairs[k]); });
    return s.replace(/__T__/g, theme);
  }

  function makeDebtCtx(style) {
    return {
      style,
      stack: [],
      used: 0,
      leakAt: 0.28 + Math.random() * 0.16,
      settleAt: 0.58 + Math.random() * 0.18,
      limit: 4 + ((Math.random() * 3) | 0),
    };
  }

  function debtNoun(ctx) {
    const pool = DEBT[ctx.style].nouns;
    const noun = rand(pool);
    ctx.stack.push(noun);
    if (ctx.stack.length > 9) ctx.stack.shift();
    return noun;
  }

  function debtPull(ctx, count) {
    const pool = DEBT[ctx.style].nouns;
    const out = [];
    while (out.length < count) {
      let noun = ctx.stack.pop();
      let guard = 0;
      while ((!noun || out.includes(noun)) && guard < 12) {
        noun = rand(pool);
        guard++;
      }
      out.push(noun);
    }
    return out;
  }

  function chainDebt(ctx, heat, recentKinds) {
    const [a, b, c, d] = debtPull(ctx, heat > 0.72 ? 4 : 3);
    if (ctx.style === "me") {
      const options = [
        { k: "jump", t: "你拿" + a + "解释" + b + "，又用" + b + "跳过" + c + "。" + c + "没交代，" + a + "也不成立，别往下糊。" },
        { k: "missing-chain", t: "中间缺的是" + a + "，你补了个" + b + "，然后把" + c + "写成完成状态。这也敢拿出来？把" + a + "拿出来。" },
        { k: "hide", t: "别把" + a + "藏在" + b + "后面。" + b + "兜不住" + c + "，" + c + "兜不住" + (d || a) + "，代价谁承担？" },
        { k: "same-scale", t: "按这个标准，" + b + "可以替" + a + "兜底，那" + c + "是不是也可以替" + b + "兜底？你敢把这把尺子用到底吗。" },
        { k: "self-correct", t: "不是" + a + "的问题，是你把" + b + "和" + c + "混成一个东西了。也不对，好像还漏了" + (d || "反例") + "，但你这条链肯定没接上。" },
        { k: "source-cost", t: "你先别急着站队。先问" + a + "从哪来，再问" + b + "凭什么成立，最后问这一步的代价压给谁。一步都别省。" },
        { k: "binary", t: "现在只有两个可能：要么" + a + "没有成立，要么" + b + "根本不能推出" + c + "。你选一个，别两边都占。" },
        { k: "not-proof", t: a + "不是证明，" + b + "也不是免死牌。你把" + c + "塞进来，只是在拖延那个最该回答的问题。" },
      ];
      const recent = recentKinds || [];
      const fresh = options.filter((x) => !recent.includes(x.k));
      const picked = rand(fresh.length ? fresh : options);
      if (recentKinds) {
        recentKinds.push(picked.k);
        if (recentKinds.length > 10) recentKinds.shift();
      }
      return picked.t;
    }
    const forms = {
      bs: [
        "如果" + a + "要证明" + b + "，" + b + "又要求" + c + "先成立，那" + c + "其实已经把" + a + "变成了自己的前提。",
        a + "推出" + b + "，" + b + "解释" + c + "，可" + c + "回头说" + a + "才是结论；这条链不是断了，是咬回去了。",
        "现在不是" + a + "缺了" + b + "，是" + b + "拿" + c + "冒充" + a + "，然后要求" + a + "承认自己。"
      ],
      huge: [
        a + "要稳住" + b + "，" + b + "又牵动" + c + "。老胡本来想把" + c + "放回大局，可大局现在又压回" + a + "。",
        "既要看到" + a + "，也要看到" + b + "，还要看到" + c + "。问题是这三个东西互相要求定力，定力就很吃紧。",
        a + "不是口号，" + b + "也不是情绪。可一旦" + c + "顶上来，老胡只能说，还得再稳一下，稳住这个稳。"
      ],
      jargon: [
        a + "反哺" + b + "，" + b + "沉淀" + c + "，" + c + "再把" + a + "包装成入口。链路看似跑通，实际只是在互相借壳。",
        "先用" + a + "承接" + b + "，再用" + b + "定义" + c + "，最后让" + c + "回流" + a + "。这不是闭环，是名词在互相托管。",
        a + "的底层逻辑变成了" + b + "，" + b + "的颗粒度又落到" + c + "，" + c + "继续反哺" + a + "，动作已经被吃完了。"
      ],
    };
    return rand(forms[ctx.style] || forms.bs);
  }

  function meDebtDoubt(noun, recentKinds) {
    const options = [
      { k: "missing", t: "中间的" + noun + "呢？被你吃了？" },
      { k: "fake", t: noun + "是真有，还是你为了圆前一句顺手补出来的？" },
      { k: "basic", t: "连最基本的" + noun + "都没对齐，你就敢往下推结论？" },
      { k: "mirror", t: "按这个标准，换个对象是不是也能这么判？你敢承认吗。" },
      { k: "scale", t: "这不是我故意找茬，是围绕" + noun + "的标准前后不一致。" },
      { k: "source", t: "先别急着下判断，" + noun + "从哪来，这一步先说清。" },
      { k: "cost", t: "这一步如果成立，代价压给谁？别把账藏起来。" },
    ];
    const fresh = options.filter((x) => !recentKinds.includes(x.k));
    const picked = rand(fresh.length ? fresh : options);
    recentKinds.push(picked.k);
    if (recentKinds.length > 10) recentKinds.shift();
    return picked.t;
  }

  function genDebtMag(n, opener, ctx, floorHeat) {
    const G = DEBT[active] || DEBT.bs;
    if (!ctx || ctx.style !== active) ctx = debtCtx = makeDebtCtx(active);
    if (opener) {
      debtNoun(ctx); debtNoun(ctx);
      return debtFill(rand(G.calm), {});
    }

    let s = "";
    const recent = [];
    const recentKinds = [];
    while (s.length < n) {
      const progress = Math.min(1, floorHeat + s.length / Math.max(n, 1) * (0.28 + Math.random() * 0.22));
      let piece = "";
      if (progress < ctx.leakAt) {
        const noun = debtNoun(ctx);
        piece = active === "me" ? meDebtDoubt(noun, recentKinds) : debtFill(rand(G.doubts), { NOUN: noun });
      } else if (progress < ctx.settleAt) {
        const noun = debtNoun(ctx);
        piece = active === "me" ? meDebtDoubt(noun, recentKinds) : debtFill(rand(G.doubts), { NOUN: noun });
        if (ctx.stack.length >= ctx.limit && Math.random() < 0.72) piece += chainDebt(ctx, progress, recentKinds);
        else if (active === "me" && Math.random() < 0.45) piece += rand(["先别往下翻。", "把这一段补上。", "证据别藏。", "反例也补上。", "别让我替你圆。", "这一步不要省。"]);
        else if (active === "huge" && Math.random() < 0.4) piece += rand(["再观察。", "先稳一下。", "不能急着表态。"]);
      } else {
        piece = chainDebt(ctx, progress, recentKinds);
        if (Math.random() < 0.32) piece += debtFill(rand(G.fatal), {});
      }
      if (recent.includes(piece)) {
        const noun = debtNoun(ctx);
        piece = progress < ctx.settleAt ? (active === "me" ? meDebtDoubt(noun, recentKinds) : debtFill(rand(G.doubts), { NOUN: noun })) : chainDebt(ctx, progress, recentKinds);
      }
      recent.push(piece);
      if (recent.length > 8) recent.shift();
      s += piece;
    }
    ctx.used++;
    if ((floorHeat > 0.58 || ctx.used > 3) && Math.random() < 0.38) s += debtFill(rand(G.fatal), {});
    return s;
  }

  // 逐渐失控档:每个风格使用独立失控机制,不再做通用口吃/报错式后处理。
  function moodHeat(progress, phase) {
    const wave = (Math.sin(progress * Math.PI * phase) + 1) * 0.22;
    const spike = Math.random() < progress * 0.38 ? 0.32 + Math.random() * 0.28 : 0;
    const dip = Math.random() < 0.18 ? -0.24 : 0;
    return Math.max(0.08, Math.min(1, progress * 0.58 + wave + spike + dip));
  }

  function stop(heat, style) {
    if (style === "me" && heat > 0.58) return rand(["。", "。", "！"]);
    if (heat > 0.76) return rand(["。", "。", "？"]);
    return rand(["。", "。", "；"]);
  }

  function genBsMag(topic, n, opener, floorHeat) {
    if (opener) {
      return rand([
        "关于「" + topic + "」，先把话说平一点：它当然可以被讨论，也可以被解释。问题只在于，解释不能只靠气氛撑着，必须先确认它到底指向什么，否则后面的判断都会飘起来。",
        "先冷静看「" + topic + "」。它不是不能解释，也不是天然荒唐。至少在一开始，我们只需要确认它的范围、条件和前提，别急着把它说成一个已经成立的答案。",
        "「" + topic + "」这个问题一开始并不复杂，至少表面上看，它还站得很稳。我们可以先承认它有被讨论的空间，再看它的定义、边界和后果是否真的能接上。",
      ]);
    }
    const nodes = ["问题", "前提", "原因", "结论", "意义", "答案", "讨论", "判断"];
    const verbs = ["推出", "解释", "证明", "反问", "要求", "包含", "回收"];
    const linkers = ["因为", "所以", "然而", "由此可见", "换句话说", "归根结底"];
    const fever = 2.1 + Math.random() * 4.2;
    let s = "";
    while (s.length < n) {
      const heat = Math.min(1, floorHeat + moodHeat(s.length / Math.max(n, 1), fever) * 0.55);
      const a = rand(nodes), b = rand(nodes), c = rand(nodes), v = rand(verbs);
      const forms = heat < 0.42 ? [
        "如果把「" + topic + "」放回" + a + "里看，" + b + "还能暂时解释" + c + stop(heat),
        "这里真正要分清的是" + a + "和" + b + "，否则" + c + "会被提前当成答案" + stop(heat),
        a + "看似" + v + b + "，但这一步至少还需要一个能站住的" + c + stop(heat)
      ] : heat < 0.72 ? [
        a + "开始" + v + b + "，" + b + "又回头要求" + c + "承认自己，链条没有断，只是转了半圈" + stop(heat),
        "不是「" + topic + "」推出了" + a + "，是" + a + "借「" + topic + "」把" + b + "推回给" + c + stop(heat),
        rand(linkers) + "，" + a + "必须先成为" + b + "，" + b + "才能证明" + c + "曾经是" + a + stop(heat)
      ] : [
        a + "是" + b + "的前提，" + b + "是" + c + "的结论，" + c + "又说" + a + "还没开始" + stop(heat),
        rand(linkers) + rand(linkers) + "，不是" + a + "在解释" + b + "，是解释正在要求解释先解释自己" + stop(heat),
        "前提前提，结论结论。" + a + "咬住" + b + "，" + b + "咬住" + c + "，所以「" + topic + "」被证明为尚未证明" + stop(heat)
      ];
      s += rand(forms);
    }
    return s;
  }

  function genHugeMag(topic, n, opener, floorHeat) {
    if (opener) {
      return rand([
        "关于「" + topic + "」，老胡先说一个冷静判断：这件事不能简单看，也不宜急着下结论。它背后有现实因素，也有情绪因素，越是这样，越需要把事实和判断先分开。",
        "老胡看「" + topic + "」，第一反应是先观察。复杂问题要复杂看，情绪不能替代判断。现在最重要的不是马上站队，而是弄清楚它为什么会出现，又会影响到哪些人。",
        "「" + topic + "」这件事，老胡认为还是要放在更大的背景里看，先稳住，再分析。它未必像一些人说得那么严重，也未必像另一些人说得那么轻松，关键还是看后续变化。",
      ]);
    }
    const anchors = ["复杂", "大局", "定力", "观察", "平衡", "基本盘", "态势"];
    const calm = ["客观地说", "老胡还是这个看法", "话不能说死", "放到更大背景里看", "越是这个时候"];
    const fever = 2 + Math.random() * 3.8;
    let subject = rand(["「" + topic + "」", "这件事", "当前态势"]);
    let s = "";
    while (s.length < n) {
      const heat = Math.min(1, floorHeat + moodHeat(s.length / Math.max(n, 1), fever) * 0.55);
      const a = rand(anchors), b = rand(anchors), c = rand(calm);
      const forms = heat < 0.45 ? [
        c + "，" + subject + "还是要放在" + a + "里看，不能被一时的情绪带着走" + stop(heat),
        "对" + subject + "，老胡倾向于再观察一下。" + a + "不是回避，是复杂局面下必要的缓冲" + stop(heat),
        "一方面要看到" + subject + "的现实压力，另一方面也要看到" + a + "仍然存在" + stop(heat)
      ] : heat < 0.74 ? [
        subject + "越复杂，越需要" + a + "；可" + a + "本身也要放进" + b + "里看，这里就不能急" + stop(heat),
        "老胡不是在和稀泥，是" + a + "正在要求" + b + "，而" + b + "又要求我们继续观察" + stop(heat),
        c + "，不能慌。可是越强调不能慌，越说明" + a + "已经顶到了" + b + "的边上" + stop(heat)
      ] : [
        a + "需要" + b + "来稳，" + b + "又需要" + a + "来解释。老胡说稳，是为了稳住这个稳" + stop(heat),
        "先观察" + a + "，再观察" + b + "，最后观察观察本身。不能慌，不能对不能慌失去" + a + stop(heat),
        "大局很大，" + a + "也很大。大到" + subject + "反而找不到落点，所以还得稳住，稳住这个落点" + stop(heat)
      ];
      s += rand(forms);
      if (heat > 0.48 && Math.random() < 0.65) subject = a;
    }
    return s;
  }

  function genJargonMag(topic, n, opener, floorHeat) {
    if (opener) {
      return rand([
        "关于「" + topic + "」，先不要急着给定义。我们先把核心链路摊开，看它到底接在哪里。只有弄清它的输入、承接和输出，后面谈价值、转化和闭环才有意义。",
        "先回到「" + topic + "」本身。它不是一个孤立概念，需要放进完整链路里看。单点表达很容易制造错觉，真正要判断的是它能不能稳定进入场景并产生反馈。",
        "讨论「" + topic + "」之前，先对齐一个前提：问题不在口号，而在它如何进入闭环。如果它只是被包装成抓手，却没有真实路径，那后面的所有方法论都会失焦。",
      ]);
    }
    const nouns = ["闭环", "飞轮", "颗粒度", "链路", "抓手", "漏斗", "心智", "矩阵", "场景", "势能", "打法"];
    const verbs = ["打通", "承接", "反哺", "沉淀", "对齐", "拉通", "转化"];
    const resets = ["最终还是要看落地。", "先回到业务本身。", "这里需要一次真实验证。"];
    const fever = 2.2 + Math.random() * 4.4;
    let gravity = floorHeat * 2;
    let s = "";
    while (s.length < n) {
      const heat = Math.min(1, floorHeat + moodHeat(s.length / Math.max(n, 1), fever) * 0.55 + gravity * 0.06);
      const a = rand(nouns), b = rand(nouns), c = rand(nouns), v = rand(verbs);
      gravity += Math.random() < 0.62 ? 0.7 : -0.25;
      if (gravity > 4.4 && Math.random() < 0.18) {
        s += rand(resets);
        gravity = 1.4;
        continue;
      }
      const forms = heat < 0.42 ? [
        "我们先把「" + topic + "」的" + a + "拆出来，用" + b + "承接，再看能不能" + v + "到真实场景" + stop(heat),
        a + "不是目的，关键是它能不能让" + b + "进入稳定链路，并且形成可验证反馈" + stop(heat),
        "如果" + a + "接不住" + b + "，那「" + topic + "」就只是一个被提前包装的抓手" + stop(heat)
      ] : heat < 0.72 ? [
        a + "开始反哺" + b + "，" + b + "又把" + c + "沉淀成新的" + a + "，链路在这里出现污染" + stop(heat),
        "表面是" + a + "在" + v + b + "，实际是" + b + "借" + c + "完成自我闭环" + stop(heat),
        "动作用完以后，只剩" + a + "的" + b + "、" + b + "的" + c + "，以及" + c + "对" + a + "的反向托管" + stop(heat)
      ] : [
        a + "的" + b + "，" + b + "的" + c + "，" + c + "的" + a + "。链路。颗粒度。抓手" + stop(heat),
        "闭环不再打通闭环，闭环沉淀闭环。" + a + "漏出" + b + "，" + b + "反哺漏斗，漏斗还是漏斗" + stop(heat),
        a + "，" + b + "，" + c + "。对齐的对齐，反哺的反哺，动作已经没有位置了" + stop(heat)
      ];
      s += rand(forms);
    }
    return s;
  }

  function mePieceKey(text) {
    if (text.indexOf("笑死") === 0) return "laugh";
    if (text.indexOf("我不接受") === 0) return "reject";
    if (text.indexOf("你凭什么") === 0) return "why";
    if (text.indexOf("重算") === 0) return "recalc";
    if (text.indexOf("停。不要") === 0) return "stop-wrap";
    if (text.indexOf("按同一标准") === 0) return "same-standard";
    if (text.indexOf("等一下") === 0) return "interrupt";
    if (text.indexOf("我不是在挑字眼") === 0) return "not-wording";
    if (text.indexOf("你说") === 0) return "missing-step";
    if (text.indexOf("不是") === 0 && text.indexOf("情绪收益") > -1) return "emotion-mix";
    if (text.indexOf("其实") === 0) return "first-principle";
    if (text.indexOf("我感觉这里要先切开") === 0) return "split";
    if (text.indexOf("先别扩大范围") === 0) return "scope";
    if (text.indexOf("现在的问题不是语气") === 0) return "not-tone";
    if (text.indexOf("我先按住火") === 0) return "hold";
    if (text.indexOf("别把喜欢") === 0) return "like-proof";
    if (text.indexOf("如果你要保留") === 0) return "keep-judge";
    if (text.indexOf("这一步不是主观补正") === 0) return "subjective-fix";
    if (text.indexOf("我再问短一点") === 0) return "short-question";
    if (text.indexOf("换个") === 0 || text.indexOf("放到") === 0 || text.indexOf("按同一把尺子") === 0 || text.indexOf("推到极端") === 0) return "mirror";
    return text.slice(0, 14);
  }

  function genMeMag(topic, n, opener, floorHeat) {
    if (opener) {
      return rand([
        "先冷静说「" + topic + "」。这个词到底指什么，先不要加戏，先拆定义。它如果成立，需要满足什么条件；如果不成立，又是哪一段推导断了，这些要先讲清楚。",
        "讨论「" + topic + "」之前，先把标准摆出来：真实不真实，有没有证据，能不能落地，代价由谁承担。只要这几项没有说清，后面的漂亮话都只能算包装。",
        "我先不发火。先看「" + topic + "」本身，它成立的条件是什么，代价又由谁承担。如果它只是听起来像一个结论，但没有完整链条，那就还不能算真正说清楚。",
      ]);
    }
    const checks = ["证据", "推导", "标准", "代价", "边界", "交付", "链条", "闭环", "反例", "来源", "取舍", "意义", "一致性"];
    const evasions = ["方向稿", "润色", "大概成立", "先这样", "后面补", "感觉没问题", "差不多", "先别较真", "大家都这样", "情绪价值"];
    const objects = ["方案", "作品", "关系", "判断", "选择", "说法", "体验", "评分"];
    const mirrors = ["换个对象", "换个场景", "换个立场", "放到你自己身上", "按同一把尺子", "推到极端"];
    const smallBreaks = ["也不对，好像。", "我感觉这里还得重切。", "先别急着同意。", "不是这个意思。", "算了，换个问法。"];
    const fever = 2.7 + Math.random() * 4.8;
    let patience = 1 - floorHeat * 0.55;
    let s = "";
    const recent = [];
    const recentKeys = [];
    while (s.length < n) {
      const heat = Math.min(1, floorHeat + moodHeat(s.length / Math.max(n, 1), fever) * 0.58 + (1 - patience) * 0.25);
      const check = rand(checks), dodge = rand(evasions), obj = rand(objects), mirror = rand(mirrors);
      patience -= 0.12 + Math.random() * 0.18 + (dodge === "润色" || dodge === "方向稿" ? 0.12 : 0);
      const forms = heat < 0.38 && patience > 0.28 ? [
        "我先按住火，继续看「" + topic + "」的" + check + "。如果这一项说不清，后面的结论就不能算成立" + stop(heat, "me"),
        "现在的问题不是语气，是" + check + "没接上。你可以说它还在整理，但不能把整理当成完成" + stop(heat, "me"),
        "先别扩大范围，就问这一段：" + check + "在哪里，标准怎么来的，代价有没有算" + stop(heat, "me"),
        "其实「" + topic + "」先不用上价值。它作为一个" + obj + "，到底解决了什么，牺牲了什么，谁在替它付账" + stop(heat, "me"),
        "我感觉这里要先切开：喜欢不等于成立，能用不等于正当，有吸引力也不代表" + check + "自动补齐" + stop(heat, "me")
      ] : heat < 0.68 ? [
        "等一下，你又把" + dodge + "塞进来了。" + dodge + "不是" + check + "，更不是结论，别拿它糊过去" + stop(heat, "me"),
        "你说「" + topic + "」已经成立，那中间的" + check + "呢？别跳，别绕，缺哪一步你自己看" + stop(heat, "me"),
        "我不是在挑字眼，我是在问" + check + "。没有" + check + "，这套说法就只是方向稿套了个外壳" + stop(heat, "me"),
        mirror + "看一遍，如果它还能成立，那我认；如果不能，你就是在双标" + stop(heat, "me"),
        "不是" + dodge + "的问题，是你把" + obj + "的情绪收益当成了" + check + "。这两件事不要混" + stop(heat, "me"),
        rand(smallBreaks) + "「" + topic + "」不是不能喜欢，也不是不能做，但你别把取舍说成没有代价" + stop(heat, "me")
      ] : [
        check + "呢？别低头。你拿" + dodge + "冒充" + check + "，这也敢叫完成" + stop(heat, "me"),
        "重算。我说了重算，不是润色。把" + check + "补上，把取舍写清楚，现在" + stop(heat, "me"),
        "你凭什么把它当结论？谁允许你跳过" + check + "？代价谁承担？你说，别糊弄" + stop(heat, "me"),
        "停。不要再包装了。方向稿不是交付，" + dodge + "不是证据，缺的那一步你自己补上" + stop(heat, "me"),
        "按同一标准，另一个" + obj + "也能这么洗吗？你敢说它也对吗？不敢就别装这把尺子客观" + stop(heat, "me"),
        "笑死，不是笑你，是这个逻辑真的撑不住。你自己看，" + dodge + "、" + check + "、代价，三个东西有一个站稳了吗" + stop(heat, "me"),
        "我不接受。不是因为我情绪大，是你前后标准不一致，还非要把它包装成一个完整判断" + stop(heat, "me"),
        "别把喜欢当证明。你可以喜欢，但你不能因为喜欢就把" + check + "省掉" + stop(heat, "me"),
        "如果你要保留这个判断，就把反例一起放上来。别只挑能赢的那半边" + stop(heat, "me"),
        "这一步不是主观补正，这是偷换标准。你自己知道区别，不要装不知道" + stop(heat, "me"),
        "我再问短一点：" + check + "在哪，代价谁付，为什么不是另一个结论" + stop(heat, "me")
      ];
      let piece = rand(forms);
      let key = mePieceKey(piece);
      let guard = 0;
      while ((recent.includes(piece) || recentKeys.includes(key)) && forms.length > 1 && guard < 8) {
        const rest = forms.filter((x) => !recent.includes(x) && !recentKeys.includes(mePieceKey(x)));
        piece = rand(rest.length ? rest : forms);
        key = mePieceKey(piece);
        guard++;
      }
      s += piece;
      recent.push(piece);
      if (recent.length > 12) recent.shift();
      recentKeys.push(key);
      if (recentKeys.length > 12) recentKeys.shift();
      if (patience < 0 && Math.random() < 0.55) {
        s += rand(["行，压一下。继续看下一步。", "我再给你一次机会，把链条接上。", "先不吵，证据拿出来。", "也不对，好像我刚才切得太快，但你这个答案还是没接住。", "先停一下，我不是不让你喜欢，我是不接受你把喜欢伪装成证明。"]);
        patience = 0.34 + Math.random() * 0.22;
      }
    }
    return s;
  }

  function chunkMag(n, opener, floorHeat) {
    floorHeat = floorHeat || 0;
    if (active === "bs") return genBsMag(theme, n, opener, floorHeat);
    if (active === "huge") return genHugeMag(theme, n, opener, floorHeat);
    if (active === "jargon") return genJargonMag(theme, n, opener, floorHeat);
    if (active === "me") return genMeMag(theme, n, opener, floorHeat);
    return "";
  }

  function chunkDebt(n, opener, floorHeat) {
    return genDebtMag(n, opener, debtCtx, floorHeat || 0);
  }

  function modeTag() {
    if (mode === "cre") return " · 创意模式";
    if (mode === "debt") return " · 追问模式";
    if (mode === "decay") return " · 失控模式";
    return "";
  }

  function makeChunk(n, opener) {
    if (mode === "debt") return chunkDebt(n, opener, 0.4);
    if (mode === "decay") return chunkMag(n, opener);
    return mode === "cre" ? chunkCre(n, opener) : chunkDef(n);
  }

  function run() {
    theme = (input.value || "").trim() || rand(["年度复盘", "我的人生", "这杯奶茶", "周一", "搬砖", "摸鱼", "爱情", "上班"]);
    if (mode === "debt" || mode === "decay") {
      if (mode === "debt") debtCtx = makeDebtCtx(active);
      const target = 400 + ((Math.random() * 160) | 0);
      const chunker = mode === "debt" ? chunkDebt : chunkMag;
      const parts = [chunker(150, true, 0)];
      let blockIndex = 1;
      while (parts.join("").length < target && parts.length < 5) {
        const floorHeat = Math.min(0.68, blockIndex * 0.18);
        const next = chunker(65 + ((Math.random() * 35) | 0), false, floorHeat);
        if (parts.join("").length >= 400 && parts.join("").length + next.length > 610) break;
        parts.push(next);
        blockIndex++;
      }
      if (parts.join("").length < 380) parts.push(chunker(65, false, Math.min(0.68, blockIndex * 0.18)));
      out.innerHTML = "";
      parts.forEach(function (p) {
        const el = document.createElement("p");
        el.textContent = p;
        out.appendChild(el);
      });
      countEl.textContent = "约 " + out.textContent.length + " 字 · " + D.themes[active].label + modeTag();
      copyBtn.hidden = false;
      moreBtn.hidden = false;
      return;
    }
    const n = 3 + ((Math.random() * 2) | 0);
    const parts = [];
    for (let i = 0; i < n; i++) parts.push(makeChunk(120 + ((Math.random() * 50) | 0), false));
    // 创意:首段带 open、末段带 close
    if (mode === "cre") { parts[0] = chunkCre(120, true); }
    out.innerHTML = "";
    parts.forEach(function (p) {
      const el = document.createElement("p");
      el.textContent = p;
      out.appendChild(el);
    });
    countEl.textContent = "约 " + out.textContent.length + " 字 · " + D.themes[active].label + modeTag();
    copyBtn.hidden = false;
    moreBtn.hidden = false;
  }

  function more() {
    if (!theme) { run(); return; }
    const el = document.createElement("p");
    if (mode === "debt") {
      if (!debtCtx || debtCtx.style !== active) debtCtx = makeDebtCtx(active);
      el.textContent = chunkDebt(120 + ((Math.random() * 60) | 0), false, 0.68);
    } else {
      el.textContent = makeChunk(120 + ((Math.random() * 60) | 0), false);
    }
    out.appendChild(el);
    countEl.textContent = "约 " + out.textContent.length + " 字 · " + D.themes[active].label + modeTag();
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  goBtn.addEventListener("click", run);
  moreBtn.addEventListener("click", more);
  input.addEventListener("keydown", function (e) { if (e.key === "Enter") run(); });
  copyBtn.addEventListener("click", function () {
    const text = Array.from(out.querySelectorAll("p")).map((p) => p.textContent).join("\n");
    navigator.clipboard && navigator.clipboard.writeText(text).then(function () {
      copyBtn.textContent = "已复制";
      setTimeout(function () { copyBtn.textContent = "复制"; }, 1500);
    });
  });
})();

/* ============================================================
   规则怪谈:多剧本随机开局 + 选项乱序。守则会矛盾、会冒假条,
   靠"标准一致 + 精确判定"活到底。死了告诉你犯了哪条。
   ============================================================ */
(function () {
  const DECKS = window.__RULE_DECKS__;
  const root = document.getElementById("rg");
  if (!DECKS || !root) return;
  const rulesEl = document.getElementById("rg-rules");
  const sceneEl = document.getElementById("rg-scene");
  const choicesEl = document.getElementById("rg-choices");
  const rulesToggle = document.getElementById("rg-rules-toggle");
  const titleEl = document.querySelector('.machine[data-machine="g1"] .machine-name');

  let G = DECKS[0];
  let cleared = 0, totalScenes = 0;
  const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((p) => p[1]);

  function loadDeck(deck) {
    G = deck;
    cleared = 0;
    totalScenes = Object.keys(G.scenes).filter((k) => !G.scenes[k].win).length;
    // 守则列表
    rulesEl.innerHTML = "";
    G.rules.forEach(function (r) { const li = document.createElement("li"); li.textContent = r; rulesEl.appendChild(li); });
    rulesEl.hidden = true;
    rulesToggle.setAttribute("aria-expanded", "false");
    rulesToggle.textContent = "📜 " + G.rulesTitle + "(点开重读)";
    if (titleEl) titleEl.textContent = "规则怪谈 ·《" + G.name + "》";
  }

  // 守则开合
  rulesToggle.addEventListener("click", function () {
    const open = rulesEl.hidden;
    rulesEl.hidden = !open;
    rulesToggle.setAttribute("aria-expanded", String(open));
    rulesToggle.textContent = "📜 " + G.rulesTitle + (open ? "(点此收起)" : "(点开重读)");
  });

  function render(node, intro) {
    sceneEl.className = "rg-scene";
    choicesEl.innerHTML = "";

    if (intro) {
      sceneEl.textContent = G.intro;
      const btn = mkBtn("接班,翻开守则 →", "rg-restart");
      btn.addEventListener("click", function () { cleared = 0; go(G.start); });
      choicesEl.appendChild(btn);
      return;
    }

    const sc = G.scenes[node];

    if (sc.win) {
      sceneEl.classList.add("is-win");
      sceneEl.innerHTML = '<span class="rg-win-tag">活下来了</span>';
      appendText(sceneEl, sc.text);
      const again = mkBtn("↺ 换一个场子再来", "rg-restart");
      again.addEventListener("click", newGame);
      choicesEl.appendChild(again);
      return;
    }

    sceneEl.textContent = sc.text;
    shuffle(sc.choices.slice()).forEach(function (c) {
      const btn = mkBtn(c.label, "rg-choice");
      btn.addEventListener("click", function () {
        if (c.dead) die(c.reason);
        else { cleared++; go(c.to); }
      });
      choicesEl.appendChild(btn);
    });
    const p = document.createElement("p");
    p.className = "rg-progress";
    p.textContent = "已撑过 " + cleared + " / " + totalScenes + " 关 · 《" + G.name + "》";
    choicesEl.appendChild(p);
  }

  function die(reason) {
    sceneEl.className = "rg-scene is-dead";
    sceneEl.innerHTML = '<span class="rg-dead-tag">没撑过去</span>';
    const r = document.createElement("p");
    r.className = "rg-reason";
    r.textContent = reason;
    sceneEl.appendChild(r);
    choicesEl.innerHTML = "";
    const retry = mkBtn("↺ 回到开场重试", "rg-restart");
    retry.addEventListener("click", function () { cleared = 0; go(G.start); });
    const swap = mkBtn("换个场子", "rg-choice");
    swap.addEventListener("click", newGame);
    choicesEl.appendChild(retry);
    choicesEl.appendChild(swap);
  }

  function newGame() {
    loadDeck(DECKS[(Math.random() * DECKS.length) | 0]);
    render(null, true);
  }
  function go(node) { render(node, false); }
  function appendText(parent, text) { const s = document.createElement("span"); s.textContent = text; parent.appendChild(s); }
  function mkBtn(label, cls) { const b = document.createElement("button"); b.type = "button"; b.className = cls; b.textContent = label; return b; }

  loadDeck(DECKS[(Math.random() * DECKS.length) | 0]);
  render(null, true);
})();

/* ============================================================
   判断者测试:12 情景 → 四轴打分 → 16 型。轴取自魔法师的判断机。
   ============================================================ */
(function () {
  const Q = window.__QUIZ__;
  const stage = document.getElementById("quiz-stage");
  if (!Q || !stage) return;

  let idx = 0;
  const scores = { a1: 0, a2: 0, a3: 0, a4: 0 };

  function intro() {
    idx = 0;
    scores.a1 = scores.a2 = scores.a3 = scores.a4 = 0;
    stage.innerHTML = "";
    const p = document.createElement("p");
    p.className = "quiz-intro-text";
    p.textContent = Q.intro;
    const btn = mk("button", "quiz-go", "开始照一照 →");
    btn.addEventListener("click", question);
    stage.appendChild(p);
    stage.appendChild(btn);
  }

  function question() {
    const q = Q.questions[idx];
    stage.innerHTML = "";

    const bar = mk("div", "quiz-q-bar");
    const fill = document.createElement("span");
    fill.style.width = (idx / Q.questions.length * 100) + "%";
    bar.appendChild(fill);
    stage.appendChild(bar);

    const num = mk("div", "quiz-q-num", "第 " + (idx + 1) + " / " + Q.questions.length + " 问");
    stage.appendChild(num);

    const opts = mk("div", "quiz-opts");
    let locked = false;
    [q.a, q.b].forEach(function (opt) {
      const b = mk("button", "quiz-opt", opt.t);
      b.addEventListener("click", function () {
        if (locked) return;
        locked = true;
        // p === "a" 加分(偏向轴的 a 极),"b" 减分
        scores[q.axis] += (opt.p === "a" ? 1 : -1);
        const ax = Q.axes.find((x) => x.key === q.axis);
        const pole = opt.p === "a" ? ax.a : ax.b;
        b.classList.add("picked");
        const tag = mk("span", "quiz-pop", "+" + pole);
        b.appendChild(tag);
        opts.querySelectorAll(".quiz-opt").forEach((x) => { if (x !== b) x.classList.add("dim"); });
        setTimeout(function () {
          idx++;
          if (idx < Q.questions.length) question();
          else result();
        }, 520);
      });
      opts.appendChild(b);
    });
    stage.appendChild(opts);
  }

  function result() {
    // 每轴 3 题,得分范围 -3..3。>0 取 a 极,否则 b 极(0 归 b,极少见)
    const code = Q.axes.map(function (ax) {
      return scores[ax.key] > 0 ? ax.a : ax.b;
    }).join("");
    const r = Q.results[code] || { name: "判断者", line: "", say: "" };

    stage.innerHTML = "";
    stage.appendChild(mk("div", "quiz-res-code", code));
    if (r.svg) {
      const charDiv = mk("div", "quiz-res-char");
      charDiv.innerHTML = r.svg;
      stage.appendChild(charDiv);
    }
    stage.appendChild(mk("div", "quiz-res-name", r.name));
    if (r.line) stage.appendChild(mk("div", "quiz-res-line", r.line));
    stage.appendChild(mk("div", "quiz-res-say", r.say));

    const bars = mk("div", "quiz-bars");
    Q.axes.forEach(function (ax) {
      const s = scores[ax.key];               // -3..3
      const pct = ((s + 3) / 6) * 100;         // 0..100
      const row = mk("div", "quiz-bar-row " + (s > 0 ? "lean-a" : "lean-b"));
      row.appendChild(mk("span", "quiz-bar-a", ax.a));
      const track = mk("div", "quiz-bar-track");
      const dot = mk("div", "quiz-bar-dot");
      dot.style.left = pct + "%";
      track.appendChild(dot);
      row.appendChild(track);
      row.appendChild(mk("span", "quiz-bar-b", ax.b));
      bars.appendChild(row);
    });
    stage.appendChild(bars);

    const actions = mk("div", "quiz-actions");
    const again = mk("button", "quiz-restart", "↺ 再照一次");
    again.addEventListener("click", intro);
    actions.appendChild(again);
    stage.appendChild(actions);
  }

  function mk(tag, cls, text) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  }

  intro();
})();

/* ============================================================
   赛博生态位测试:每选项给某人格 +1,取最高;平局按 order 优先。
   ============================================================ */
(function () {
  const Q = window.__QUIZ2__;
  const stage = document.getElementById("quiz2-stage");
  if (!Q || !stage) return;

  let idx = 0;
  let tally = {};

  function reset() { tally = {}; Object.keys(Q.types).forEach((k) => (tally[k] = 0)); idx = 0; }

  function intro() {
    reset();
    stage.innerHTML = "";
    const p = mk("p", "quiz-intro-text", Q.intro);
    const btn = mk("button", "quiz-go", "照一照 →");
    btn.addEventListener("click", question);
    stage.appendChild(p);
    stage.appendChild(btn);
  }

  function question() {
    const q = Q.questions[idx];
    stage.innerHTML = "";
    const bar = mk("div", "quiz-q-bar");
    const fill = document.createElement("span");
    fill.style.width = (idx / Q.questions.length * 100) + "%";
    bar.appendChild(fill);
    stage.appendChild(bar);
    stage.appendChild(mk("div", "quiz-q-num", "第 " + (idx + 1) + " / " + Q.questions.length + " 问"));
    stage.appendChild(mk("div", "quiz-q-text", q.q));
    const opts = mk("div", "quiz-opts");
    let locked = false;
    q.opts.forEach(function (o) {
      const b = mk("button", "quiz-opt", o.t);
      b.addEventListener("click", function () {
        if (locked) return;
        locked = true;
        tally[o.k] = (tally[o.k] || 0) + 1;
        // 即时反馈:选中高亮 + 飘出 "+人格名"
        b.classList.add("picked");
        const tag = mk("span", "quiz-pop", "+" + Q.types[o.k].name);
        b.appendChild(tag);
        opts.querySelectorAll(".quiz-opt").forEach((x) => { if (x !== b) x.classList.add("dim"); });
        setTimeout(function () {
          idx++;
          if (idx < Q.questions.length) question();
          else result();
        }, 560);
      });
      opts.appendChild(b);
    });
    stage.appendChild(opts);
  }

  function result() {
    // 排序:分高在前;平局按 order
    const ranked = Object.keys(tally).sort(function (a, b) {
      if (tally[b] !== tally[a]) return tally[b] - tally[a];
      return Q.order.indexOf(a) - Q.order.indexOf(b);
    });
    const winKey = ranked[0];
    const win = Q.types[winKey];
    const max = tally[winKey] || 1;

    stage.innerHTML = "";
    stage.appendChild(mk("div", "quiz-res-code", "你的赛博原形"));
    if (win.img) {
      const charDiv = mk("div", "quiz-res-char");
      charDiv.innerHTML = '<img src="' + win.img + '" alt="' + win.name + '">';
      stage.appendChild(charDiv);
    } else if (win.svg) {
      const charDiv = mk("div", "quiz-res-char");
      charDiv.innerHTML = win.svg;
      stage.appendChild(charDiv);
    }
    stage.appendChild(mk("div", "quiz-res-name", win.name));
    stage.appendChild(mk("div", "quiz-res-line", win.line));
    stage.appendChild(mk("div", "quiz-res-say", win.say));

    // 前三占比迷你条
    const bars = mk("div", "quiz-bars");
    ranked.slice(0, 3).forEach(function (k) {
      if (!tally[k]) return;
      const row = mk("div", "q2-bar-row");
      row.appendChild(mk("span", "q2-bar-name", Q.types[k].name));
      const track = mk("div", "q2-bar-track");
      const fill = mk("div", "q2-bar-fill");
      fill.style.width = (tally[k] / max * 100) + "%";
      track.appendChild(fill);
      row.appendChild(track);
      row.appendChild(mk("span", "q2-bar-n", tally[k]));
      bars.appendChild(row);
    });
    stage.appendChild(bars);

    const actions = mk("div", "quiz-actions");
    const again = mk("button", "quiz-restart", "↺ 再照一次");
    again.addEventListener("click", intro);
    actions.appendChild(again);
    stage.appendChild(actions);
  }

  function mk(tag, cls, text) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  }

  intro();
})();

/* ============================================================
   工作幸福度计算机:多层公式,>1 快乐 <1 不快乐。逐字搬魔法师的表。
   ============================================================ */
(function () {
  const W = window.__WORK__;
  const form = document.getElementById("work-form");
  if (!W || !form) return;
  const numEl = document.getElementById("work-num");
  const sayEl = document.getElementById("work-say");
  const screenEl = document.getElementById("work-screen");
  const goBtn = document.getElementById("work-go");
  const vals = {};

  W.groups.forEach(function (g) {
    const box = document.createElement("div");
    box.className = "work-group";
    box.appendChild(mk("div", "work-group-name", g.name));
    g.fields.forEach(function (f) {
      const key = f[0], label = f[1], def = f[2], type = f[3];
      vals[key] = def;
      const row = document.createElement("div");
      row.className = "work-field";
      row.appendChild(mk("label", null, label));
      if (type === "num") {
        const inp = document.createElement("input");
        inp.type = "number"; inp.value = def; inp.step = "any";
        inp.addEventListener("input", function () { vals[key] = parseFloat(inp.value) || 0; recompute(); });
        row.appendChild(inp);
      } else if (type === "sel") {
        const sel = document.createElement("select");
        f[4].forEach(function (o) {
          const op = document.createElement("option");
          op.value = o[1]; op.textContent = o[0];
          sel.appendChild(op);
        });
        sel.value = def;
        sel.addEventListener("change", function () { vals[key] = parseFloat(sel.value); recompute(); });
        row.appendChild(sel);
      } else if (type === "star") {
        const stars = document.createElement("div");
        stars.className = "work-stars";
        for (let i = 1; i <= 5; i++) {
          const s = mk("span", "work-star" + (i <= def ? " lit" : ""), "★");
          s.dataset.v = i;
          s.addEventListener("click", function () {
            vals[key] = i;
            stars.querySelectorAll(".work-star").forEach(function (st, idx) {
              st.classList.toggle("lit", idx < i);
            });
            recompute();
          });
          stars.appendChild(s);
        }
        row.appendChild(stars);
      }
      box.appendChild(row);
    });
    form.appendChild(box);
  });

  function verdict(t) {
    if (t >= 1.6) return "这班上得是真舒坦。要么你运气好,要么你把表填美化了。";
    if (t >= 1.15) return "快乐。性价比在线,值得待。";
    if (t > 1) return "勉强算快乐 —— 过了线,但没富余多少。";
    if (t > 0.85) return "差一口气。说不上苦,也谈不上值,温水。";
    if (t > 0.6) return "不快乐。这班在悄悄吃你,你大概也感觉到了。";
    if (t > 0) return "很不快乐。数字摆这儿了 —— 你早该知道的。";
    return "填完上面的,数字会自己跳。";
  }

  function recompute() {
    const r = W.compute(vals);
    const t = r.total;
    numEl.textContent = (t > 0 ? t.toFixed(2) : "—");
    sayEl.textContent = verdict(t);
    screenEl.classList.toggle("is-happy", t > 1);
    screenEl.classList.toggle("is-sad", t > 0 && t <= 1);
  }

  if (goBtn) goBtn.style.display = "none"; // 实时计算,不再需要按钮
  recompute(); // 进来就先按默认值算一版

  function mk(tag, cls, text) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  }
})();

/* ============================================================
   西行劫 · 天道:四难,每难一次两难取舍,暗中累积"债";
   天道用你欠最多的债,召出专属最终 Boss。源自魔法师的桌游设计。
   ============================================================ */
(function () {
  const X = window.__XJ__;
  const root = document.getElementById("xj");
  if (!X || !root) return;
  const debtsEl = document.getElementById("xj-debts");
  const sceneEl = document.getElementById("xj-scene");
  const choicesEl = document.getElementById("xj-choices");
  const KEYS = Object.keys(X.debts);
  let debt = {}, step = 0;

  function renderDebts() {
    debtsEl.innerHTML = "";
    KEYS.forEach(function (k) {
      const d = mk("div", "xj-debt xj-debt-" + k);
      d.appendChild(mk("div", "xj-debt-k", X.debts[k]));
      d.appendChild(mk("div", "xj-debt-n", String(debt[k] || 0)));
      d.appendChild(mk("div", "xj-debt-lbl", { sha: "杀孽", zhi: "执念", qi: "舍弃", man: "傲慢" }[k]));
      debtsEl.appendChild(d);
    });
  }

  function intro() {
    debt = {}; step = 0;
    KEYS.forEach((k) => (debt[k] = 0));
    renderDebts();
    sceneEl.className = "xj-scene";
    sceneEl.textContent = X.intro;
    choicesEl.innerHTML = "";
    const b = mk("button", "xj-restart", "入劫 →");
    b.addEventListener("click", function () { step = 0; trial(); });
    choicesEl.appendChild(b);
  }

  function trial() {
    const tr = X.trials[step];
    sceneEl.className = "xj-scene";
    sceneEl.innerHTML = "";
    sceneEl.appendChild(mk("span", "xj-trial-name", tr.name));
    appendText(sceneEl, tr.scene);
    choicesEl.innerHTML = "";
    shuffle(tr.choices.slice()).forEach(function (c) {
      const b = mk("button", "xj-choice", c.t);
      b.addEventListener("click", function () {
        for (const k in c.d) debt[k] = (debt[k] || 0) + c.d[k];
        renderDebts();
        // 选择回响,短暂停顿再进下一难
        sceneEl.className = "xj-scene";
        sceneEl.innerHTML = "";
        sceneEl.appendChild(mk("span", "xj-trial-name", tr.name));
        const e = mk("p", "xj-echo", c.echo);
        sceneEl.appendChild(e);
        choicesEl.innerHTML = "";
        const next = mk("button", "xj-restart", step < X.trials.length - 1 ? "继续前行 →" : "登顶,见天道 →");
        next.addEventListener("click", function () { step++; (step < X.trials.length) ? trial() : ending(); });
        choicesEl.appendChild(next);
        const p = mk("p", "xj-progress", "第 " + (step + 1) + " / " + X.trials.length + " 难");
        choicesEl.appendChild(p);
      });
      choicesEl.appendChild(b);
    });
    const p = mk("p", "xj-progress", "第 " + (step + 1) + " / " + X.trials.length + " 难 · 取舍无对错");
    choicesEl.appendChild(p);
  }

  function ending() {
    // 取欠最多的债;平局按 order
    let top = X.order[0];
    X.order.forEach(function (k) { if ((debt[k] || 0) > (debt[top] || 0)) top = k; });
    const allZero = X.order.every((k) => !debt[k]);
    const boss = X.bosses[top];
    sceneEl.className = "xj-scene is-end";
    sceneEl.innerHTML = "";
    sceneEl.appendChild(mk("div", "xj-trial-name", "天道 · 最终 Boss"));
    sceneEl.appendChild(mk("div", "xj-boss-name", boss.name));
    sceneEl.appendChild(mk("div", "xj-boss-from", "由你欠下最多的「" + boss.from + "」凝成"));
    appendText(sceneEl, boss.say);
    choicesEl.innerHTML = "";
    const again = mk("button", "xj-restart", "↺ 重走一遍,换个走法");
    again.addEventListener("click", intro);
    choicesEl.appendChild(again);
  }

  function shuffle(a) { return a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((p) => p[1]); }
  function appendText(parent, text) { const s = document.createElement("span"); s.textContent = text; parent.appendChild(s); }
  function mk(tag, cls, text) { const el = document.createElement(tag); if (cls) el.className = cls; if (text != null) el.textContent = text; return el; }

  intro();
})();

/* ---------- 实时星标,失败回落静态值 ---------- */
(function () {
  document.querySelectorAll(".stars[data-repo]").forEach(function (node) {
    const repo = node.getAttribute("data-repo");
    fetch("https://api.github.com/repos/snownico0722/" + repo, {
      headers: { Accept: "application/vnd.github+json" },
    })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        if (typeof data.stargazers_count === "number") {
          node.querySelector(".count").textContent = data.stargazers_count;
        }
      })
      .catch(function () {});
  });
})();

/* ---------- 音效系统 UI 绑定与全局点击事件代理 ---------- */
(function () {
  const btnFull = document.getElementById("sfx-toggle-full");
  const btnMini = document.getElementById("sfx-toggle-mini");
  const iconUse = document.getElementById("sfx-icon-use");

  function updateUI(muted) {
    if (btnFull) {
      btnFull.textContent = muted ? "音效: 关闭" : "音效: 开启";
      btnFull.classList.toggle("is-muted", muted);
    }
    if (btnMini) {
      btnMini.classList.toggle("is-muted", muted);
    }
    if (iconUse) {
      iconUse.setAttribute("href", muted ? "#sfx-off" : "#sfx-on");
    }
  }

  // 初始化音效按钮 UI 状态
  if (window.SFX) {
    updateUI(window.SFX.isMuted());
  }

  // 监听静音状态变更
  document.addEventListener("sfx_mute_changed", function (e) {
    updateUI(e.detail.muted);
  });

  function handleToggle(e) {
    e.stopPropagation(); // 阻止冒泡，避免触发 hero 面板的点击回到主页逻辑
    if (window.SFX) {
      window.SFX.toggleMute();
    }
  }

  if (btnFull) btnFull.addEventListener("click", handleToggle);
  if (btnMini) btnMini.addEventListener("click", handleToggle);

  // 全局事件代理：绑定点击音效，避免侵入各个子模块的数据逻辑
  document.addEventListener("click", function (e) {
    const target = e.target;
    if (!target) return;

    // 筛选可以触发点击音效的目标选择器
    const clickTarget = target.closest("button, .pick, .quiz-opt, .xj-choice, .rg-choice, .work-star, .hero-link");
    if (!clickTarget) return;

    // 排除特殊声音处理元素（魔法帽、静音切换按钮）
    if (clickTarget.closest(".hero-hat") || clickTarget.closest(".sfx-toggle")) return;

    if (window.SFX) {
      window.SFX.play("click");
    }
  });

  // 全局事件代理：绑定滑动条（好感度刻度）拖拽音效，加入节流保护防止破音
  document.addEventListener("input", function (e) {
    const target = e.target;
    if (target && target.type === "range") {
      if (window.SFX) {
        window.SFX.playThrottled("click", 90);
      }
    }
  });
})();
