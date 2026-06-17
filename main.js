// 魔法工厂 · 无依赖脚本

document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- 舞台内部切换:旧的淡出左移、新的淡入右移,高度平滑过渡 ---------- */
(function () {
  const stage = document.getElementById("stage");
  const views = {};
  let current = "hub";
  let animating = false;

  stage.querySelectorAll(".view[data-zone]").forEach(function (v) {
    views[v.getAttribute("data-zone")] = v;
  });

  function go(zone, instant) {
    if (!views[zone]) zone = "hub";
    if (zone === current) return;
    if (animating && !instant) return;
    const from = views[current];
    const to = views[zone];

    if (instant) {
      from.hidden = true; from.className = from.className.replace(/\bis-\w+\b/g, "").trim();
      to.hidden = false; to.classList.add("is-active");
      current = zone;
      return;
    }

    animating = true;
    // 锁定起始高度,准备过渡
    const startH = stage.offsetHeight;
    stage.style.height = startH + "px";

    // 新视图入场(绝对定位叠上来)
    to.hidden = false;
    to.classList.remove("is-active");
    to.classList.add("is-entering");
    // 旧视图离场
    from.classList.remove("is-active");
    from.classList.add("is-leaving");

    // 量新视图高度,过渡 stage 高度
    const targetH = to.offsetHeight;
    requestAnimationFrame(function () {
      stage.style.height = targetH + "px";
    });

    // 收尾
    setTimeout(function () {
      from.classList.remove("is-leaving");
      from.hidden = true;
      to.classList.remove("is-entering");
      to.classList.add("is-active");
      stage.style.height = "";
      current = zone;
      animating = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 420);
  }

  // 点门 / 返回 / 串门 / 招牌回厂区 —— 走 hash,便于前进后退与分享
  document.addEventListener("click", function (e) {
    const t = e.target.closest("[data-go]");
    if (!t) return;
    e.preventDefault();
    const zone = t.getAttribute("data-go");
    const target = zone === "hub" ? "" : zone;
    if (("#" + target) === location.hash || (target === "" && !location.hash)) {
      go(zone);
    } else {
      location.hash = target;
    }
  });

  window.addEventListener("hashchange", function () {
    go(location.hash.replace("#", "") || "hub");
  });

  // 首屏直达
  const initial = location.hash.replace("#", "") || "hub";
  if (initial !== "hub") go(initial, true);
})();

/* ---------- 厂长浮层 ---------- */
(function () {
  const modal = document.getElementById("boss-modal");
  const btn = document.getElementById("boss-btn");
  if (!modal || !btn) return;
  function open() { modal.hidden = false; }
  function close() { modal.hidden = true; }
  btn.addEventListener("click", open);
  modal.addEventListener("click", function (e) { if (e.target.hasAttribute("data-close")) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
})();

/* ---------- 飘浮火花 ---------- */
(function () {
  const layer = document.querySelector(".sparks");
  if (!layer) return;
  const COLORS = ["#ffb43c", "#ff7a3c", "#7c5cff", "#4ec5d6"];
  for (let i = 0; i < 18; i++) {
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

/* ---------- 作品打分机:逐字搬店主的十分制量表 ---------- */
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
