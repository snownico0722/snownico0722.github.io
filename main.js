// 魔法工厂 · 无依赖脚本

document.getElementById("year").textContent = new Date().getFullYear();

/* ============================================================
   导航:只切 stage 的 data-view,横幅/内容体靠 CSS 选择器响应。
   不显隐、不量高、不 FLIP —— 不闪。
   ============================================================ */
(function () {
  const stage = document.getElementById("stage");
  const valid = { tools: 1, games: 1 };

  function setView(view) {
    if (!valid[view]) view = "home";
    stage.setAttribute("data-view", view);
  }

  document.addEventListener("click", function (e) {
    const t = e.target.closest("[data-go]");
    if (!t) return;
    let zone = t.getAttribute("data-go");
    // 再点已展开的厂房 = 收起回首页
    if (zone === stage.getAttribute("data-view")) zone = "home";
    const target = zone === "home" ? "" : zone;
    if (("#" + target) === location.hash || (target === "" && !location.hash)) {
      setView(zone);
    } else {
      location.hash = target;
    }
  });

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

/* ---------- 作品打分机:逐字搬魔法师的十分制量表 ---------- */
(function () {
  const pad = document.getElementById("pad");
  if (!pad) return;
  const num = document.getElementById("screen-num");
  const say = document.getElementById("screen-say");
  const SCALE = {
    10: "神作留空 / 我就是要吹爆。",
    9: "同类里的佼佼者。",
    8: "观感很棒的优秀作品。",
    7: "无功无过,有亮点。",
    6: "怎么说也及格。",
    5: "反省一下为什么做成这样。",
    4: "比上不足,比下有余。",
    3: "我为什么要看完。",
    2: "什么垃圾。",
    1: "我甚至会怀疑这个作品的粉丝。",
  };
  for (let s = 10; s >= 1; s--) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = s;
    b.addEventListener("click", function () {
      pad.querySelectorAll("button").forEach((x) => x.classList.remove("on"));
      b.classList.add("on");
      num.textContent = s + " 分";
      say.textContent = SCALE[s];
    });
    pad.appendChild(b);
  }
})();

/* ---------- 好感度计算机:逐字搬魔法师量表的维度/权重/锚点 ---------- */
(function () {
  const rows = document.getElementById("aff-rows");
  if (!rows) return;
  const numEl = document.getElementById("aff-num");
  const fillEl = document.getElementById("aff-fill");
  const sayEl = document.getElementById("aff-say");
  const resetBtn = document.getElementById("aff-reset");

  // [名称, 权重, 取值下限, 取值上限, 打分锚点]
  const DIMS = [
    ["熟悉度", 10, 0, 100, "0陌生 · 10初识 · 30老友 · 50挚友 · 90自己"],
    ["好感度", 15, -100, 100, "0陌生 · 30有一定兴趣 · 60很喜欢"],
    ["恋爱度", 20, 0, 100, "0不作为目标 · 5性取向内不反感 · 20有兴趣 · 40想谈 · 60交往中"],
    ["影响度", 10, 0, 100, "0无影响 · 20有一定影响(口癖/思考) · 40较多影响"],
    ["共同回忆度", 10, 0, 100, "0不认识 · 20常一起玩 · 40很长共同经历 · 60多年老友"],
    ["投入度", 20, 0, 100, "0无关系 · 15付出一整天 · 40经常为对方做事 · 60主动关心"],
    ["爱好度", 20, 0, 100, "0无重叠 · 30某方面同好 · 50喜欢领域同好 · 70极度契合"],
    ["触发度", 20, 0, 100, "0不会想到 · 30经常想到 · 50基本每天 · 70每天数次"],
    ["认同度", 8, 0, 100, "0陌生 · 30一定认可 · 50很厉害 · 90崇拜"],
    ["幻想度", 5, 0, 100, "对目标的幻想,约等同于期待"],
    ["幻想好感度", 5, -100, 100, "你认为目标对你的好感是多少"],
    ["借钱额度", 40, 0, 100, "借出全部年薪 = 100"],
    ["不可割舍度", 20, 0, 100, "0无所谓 · 30心痛 · 60无法割舍"],
  ];
  const WSUM = DIMS.reduce((a, d) => a + d[1], 0); // 权重合计 203

  // 评语:按总分给一句,语气随魔法师
  function verdict(v) {
    if (v <= 0) return "陌生人,或者你不想算这个。";
    if (v < 15) return "点头之交。记不住生日那种。";
    if (v < 35) return "认识,有点意思,但还没到掏心窝。";
    if (v < 55) return "朋友。会主动找,会想起。";
    if (v < 70) return "挚友级。样本里的「挚友 a」就在这附近(66.6)。";
    if (v < 85) return "很重的人了。割舍会疼。";
    return "几乎是另一个自己。这分数你自己清楚意味着什么。";
  }

  const inputs = [];
  DIMS.forEach(function (d, i) {
    const [name, w, lo, hi, hint] = d;
    const row = document.createElement("div");
    row.className = "aff-row";
    row.innerHTML =
      '<div class="aff-row-top">' +
        '<span class="aff-row-name">' + name + '</span>' +
        '<span class="aff-row-w">权重 ' + w + '</span>' +
        '<span class="aff-row-val" data-val="' + i + '">0</span>' +
      '</div>' +
      '<div class="aff-hint">' + hint + '</div>' +
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
    fillEl.style.width = Math.max(0, Math.min(100, (total / WSUM) * 100)) + "%";
    sayEl.textContent = verdict(total);
  }

  inputs.forEach((inp) => inp.addEventListener("input", recompute));
  resetBtn.addEventListener("click", function () {
    inputs.forEach((inp) => (inp.value = 0));
    recompute();
  });
  recompute();
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
