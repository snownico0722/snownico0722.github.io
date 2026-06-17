// 魔法工厂 · 无依赖脚本

document.getElementById("year").textContent = new Date().getFullYear();

/* ============================================================
   导航:只切状态类,不显隐、不量高、不 FLIP —— 所以不闪。
   data-view 决定谁是主角(别的缩小让位); is-open 决定哪间厂房展开。
   ============================================================ */
(function () {
  const stage = document.getElementById("stage");
  const zones = {};
  stage.querySelectorAll(".zone[data-zone]").forEach(function (z) {
    zones[z.getAttribute("data-zone")] = z;
  });

  function setView(view) {
    if (view !== "home" && !zones[view]) view = "home";
    stage.setAttribute("data-view", view);
    Object.keys(zones).forEach(function (k) {
      zones[k].classList.toggle("is-open", k === view);
    });
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
