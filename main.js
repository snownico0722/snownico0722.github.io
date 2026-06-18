// 魔法工厂 · 无依赖脚本

document.getElementById("year").textContent = new Date().getFullYear();

/* ============================================================
   导航:只切 stage 的 data-view,横幅/内容体靠 CSS 选择器响应。
   不显隐、不量高、不 FLIP —— 不闪。
   ============================================================ */
(function () {
  const stage = document.getElementById("stage");
  const valid = { tools: 1, fortune: 1, games: 1 };

  function setView(view) {
    if (!valid[view]) view = "home";
    stage.setAttribute("data-view", view);
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
   鬼话发生器:同一台机器 + 三套语料(职场黑话 / 老胡体 / 玄学鸡汤)。
   引擎照搬经典"狗屁不通"思路:主题词 + 句式模板 + 名言/废话,
   循环拼接到目标字数,避免连续重复。纯本地,只能拿来玩。
   ============================================================ */
(function () {
  const input = document.getElementById("bs-input");
  const stylesBox = document.getElementById("bs-styles");
  const goBtn = document.getElementById("bs-go");
  const out = document.getElementById("bs-out");
  const copyBtn = document.getElementById("bs-copy");
  const countEl = document.getElementById("bs-count");
  if (!input || !out) return;

  const rand = (arr) => arr[(Math.random() * arr.length) | 0];

  // 占位 __T__ = 主题词
  const STYLES = window.__BS_STYLES__;
  const ORDER = ["jargon", "huge", "soup"];

  let active = "jargon";
  ORDER.forEach(function (key) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "bs-style" + (key === active ? " on" : "");
    b.textContent = STYLES[key].label;
    b.addEventListener("click", function () {
      active = key;
      stylesBox.querySelectorAll(".bs-style").forEach((x) => x.classList.remove("on"));
      b.classList.add("on");
    });
    stylesBox.appendChild(b);
  });

  function generate(theme, key) {
    const S = STYLES[key];
    const target = 220 + ((Math.random() * 160) | 0); // 目标字数
    const paras = [];
    let para = "";
    let lastBucket = -1;
    let guard = 0;
    // 句式来源:开篇一句,中间在 名言/铺陈/转折 间随机,适时分段
    para += fill(rand(S.open), theme);
    while (totalLen(paras) < target && guard++ < 80) {
      let bucket;
      do { bucket = (Math.random() * 3) | 0; } while (bucket === lastBucket && Math.random() < 0.7);
      lastBucket = bucket;
      const pool = bucket === 0 ? S.quote : bucket === 1 ? S.body : S.turn;
      para += fill(rand(pool), theme);
      if (para.length > 60 && Math.random() < 0.35) { paras.push(para); para = ""; }
    }
    if (para) paras.push(para);
    paras.push(fill(rand(S.close), theme));
    return paras;

    function totalLen(ps) { return ps.reduce((a, p) => a + p.length, 0) + para.length; }
  }

  function fill(tpl, theme) {
    return tpl.replace(/__T__/g, theme);
  }

  function run() {
    const theme = (input.value || "").trim() || rand(["年度复盘", "我的人生", "这杯奶茶", "周一", "搬砖", "摸鱼", "爱情"]);
    const paras = generate(theme, active);
    out.innerHTML = "";
    paras.forEach(function (p) {
      const el = document.createElement("p");
      el.textContent = p;
      out.appendChild(el);
    });
    const len = paras.join("").length;
    countEl.textContent = "约 " + len + " 字 · " + STYLES[active].label;
    copyBtn.hidden = false;
  }

  goBtn.addEventListener("click", run);
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
   规则怪谈《夜班守则》:读守则、遇事、做选择。守则会矛盾、会冒假条,
   靠"标准一致 + 精确判定"活到天亮。死了告诉你犯了哪条。
   ============================================================ */
(function () {
  const G = window.__RULE_GAME__;
  const root = document.getElementById("rg");
  if (!G || !root) return;
  const rulesEl = document.getElementById("rg-rules");
  const sceneEl = document.getElementById("rg-scene");
  const choicesEl = document.getElementById("rg-choices");
  const rulesToggle = document.getElementById("rg-rules-toggle");

  // 守则开合(JS 控制,不依赖原生 details)
  rulesToggle.addEventListener("click", function () {
    const open = rulesEl.hidden;
    rulesEl.hidden = !open;
    rulesToggle.setAttribute("aria-expanded", String(open));
    rulesToggle.textContent = (open ? "📜 夜班守则(点此收起)" : "📜 夜班守则(点开重读)");
  });

  // 守则列表
  G.rules.forEach(function (r) {
    const li = document.createElement("li");
    li.textContent = r;
    rulesEl.appendChild(li);
  });

  let cleared = 0;
  const totalScenes = Object.keys(G.scenes).filter((k) => !G.scenes[k].win).length;

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
      sceneEl.innerHTML = '<span class="rg-win-tag">活到天亮</span>';
      appendText(sceneEl, sc.text);
      const btn = mkBtn("↺ 再守一夜", "rg-restart");
      btn.addEventListener("click", function () { cleared = 0; go(G.start); });
      choicesEl.appendChild(btn);
      return;
    }

    sceneEl.textContent = sc.text;
    sc.choices.forEach(function (c) {
      const btn = mkBtn(c.label, "rg-choice");
      btn.addEventListener("click", function () {
        if (c.dead) die(c.reason);
        else { cleared++; go(c.to); }
      });
      choicesEl.appendChild(btn);
    });
    const p = document.createElement("p");
    p.className = "rg-progress";
    p.textContent = "已撑过 " + cleared + " / " + totalScenes + " 关";
    choicesEl.appendChild(p);
  }

  function die(reason) {
    sceneEl.className = "rg-scene is-dead";
    sceneEl.innerHTML = '<span class="rg-dead-tag">没撑到天亮</span>';
    const r = document.createElement("p");
    r.className = "rg-reason";
    r.textContent = reason;
    sceneEl.appendChild(r);
    choicesEl.innerHTML = "";
    const btn = mkBtn("↺ 回到接班那一刻", "rg-restart");
    btn.addEventListener("click", function () { cleared = 0; go(G.start); });
    choicesEl.appendChild(btn);
  }

  function go(node) { render(node, false); }
  function appendText(parent, text) {
    const span = document.createElement("span");
    span.textContent = text;
    parent.appendChild(span);
  }
  function mkBtn(label, cls) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = cls;
    b.textContent = label;
    return b;
  }

  render(null, true); // 开场
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
    [q.a, q.b].forEach(function (opt) {
      const b = mk("button", "quiz-opt", opt.t);
      b.addEventListener("click", function () {
        // p === "a" 加分(偏向轴的 a 极),"b" 减分
        scores[q.axis] += (opt.p === "a" ? 1 : -1);
        idx++;
        if (idx < Q.questions.length) question();
        else result();
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
    q.opts.forEach(function (o) {
      const b = mk("button", "quiz-opt", o.t);
      b.addEventListener("click", function () {
        tally[o.k] = (tally[o.k] || 0) + 1;
        idx++;
        if (idx < Q.questions.length) question();
        else result();
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
        inp.addEventListener("input", function () { vals[key] = parseFloat(inp.value) || 0; });
        row.appendChild(inp);
      } else if (type === "sel") {
        const sel = document.createElement("select");
        f[4].forEach(function (o) {
          const op = document.createElement("option");
          op.value = o[1]; op.textContent = o[0];
          sel.appendChild(op);
        });
        sel.value = def;
        sel.addEventListener("change", function () { vals[key] = parseFloat(sel.value); });
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
    return "填完再算。";
  }

  goBtn.addEventListener("click", function () {
    const r = W.compute(vals);
    const t = r.total;
    numEl.textContent = (t > 0 ? t.toFixed(2) : "—");
    sayEl.textContent = verdict(t);
    screenEl.classList.toggle("is-happy", t > 1);
    screenEl.classList.toggle("is-sad", t > 0 && t <= 1);
  });

  function mk(tag, cls, text) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  }
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
