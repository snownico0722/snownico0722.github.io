// 魔法工厂 · 无依赖脚本

document.getElementById("year").textContent = new Date().getFullYear();

/* ============================================================
   变形导航(FLIP):点首页大卡片 → 同款横幅从卡片位置长大到详情头部,
   首页其余内容淡出;返回则反向缩回卡片原位。
   ============================================================ */
(function () {
  const stage = document.getElementById("stage");
  const home = stage.querySelector('.view[data-zone="home"]');
  const views = {};
  stage.querySelectorAll(".view[data-zone]").forEach(function (v) {
    views[v.getAttribute("data-zone")] = v;
  });
  let current = "home";
  let animating = false;
  const DUR = 480;
  const EASE = "cubic-bezier(0.45, 0, 0.15, 1)";

  function lockHeight(to) {
    const h0 = stage.offsetHeight;
    stage.style.height = h0 + "px";
    const h1 = to.offsetHeight;
    requestAnimationFrame(function () { stage.style.height = h1 + "px"; });
    setTimeout(function () { stage.style.height = ""; }, DUR + 40);
  }

  // FLIP:让 head 从 source 卡片的位置/尺寸,动画到它自己的最终位置
  function flip(source, head) {
    if (!source) return;
    const a = source.getBoundingClientRect();
    const b = head.getBoundingClientRect();
    const dx = a.left - b.left;
    const dy = a.top - b.top;
    const sx = a.width / b.width;
    const sy = a.height / b.height;
    head.animate(
      [
        { transformOrigin: "top left", transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
        { transformOrigin: "top left", transform: "none" },
      ],
      { duration: DUR, easing: EASE }
    );
  }

  function fade(el, from, to) {
    el.animate([{ opacity: from }, { opacity: to }], { duration: DUR * 0.7, easing: "ease" });
  }

  function toDetail(zone, sourceBanner) {
    const to = views[zone];
    const head = to.querySelector(".banner.is-head");
    animating = true;

    to.hidden = false;
    to.classList.add("is-active");
    lockHeight(to);

    // 首页留在原地淡出
    home.classList.add("is-stacked");
    fade(home, 1, 0);

    // 横幅形变
    flip(sourceBanner, head);

    setTimeout(function () {
      home.hidden = true;
      home.classList.remove("is-stacked");
      home.style.opacity = "";
      current = zone;
      animating = false;
    }, DUR);
  }

  function toHome(zone) {
    const from = views[zone];
    const head = from.querySelector(".banner.is-head");
    // 对应的首页大卡片(变回它)
    const target = home.querySelector('.overview .banner[data-go="' + zone + '"]');
    animating = true;

    home.hidden = false;
    lockHeight(home);

    // 详情头反向缩回卡片位置
    if (target) {
      const a = head.getBoundingClientRect();
      const b = target.getBoundingClientRect();
      const dx = a.left - b.left, dy = a.top - b.top;
      const sx = a.width / b.width, sy = a.height / b.height;
      target.animate(
        [
          { transformOrigin: "top left", transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
          { transformOrigin: "top left", transform: "none" },
        ],
        { duration: DUR, easing: EASE }
      );
    }
    fade(home, 0, 1);
    from.style.opacity = "0";

    setTimeout(function () {
      from.hidden = true;
      from.classList.remove("is-active");
      from.style.opacity = "";
      current = "home";
      animating = false;
    }, DUR);
  }

  function navigate(zone, sourceEl) {
    if (animating || zone === current) return;
    if (zone === "home") toHome(current);
    else toDetail(zone, sourceEl);
  }

  // hash 同步(可分享/前进后退);点击就近找发起的横幅
  document.addEventListener("click", function (e) {
    const t = e.target.closest("[data-go]");
    if (!t) return;
    const zone = t.getAttribute("data-go");
    const target = zone === "home" ? "" : zone;
    if (("#" + target) === location.hash || (target === "" && !location.hash)) {
      navigate(zone, t);
    } else {
      // 记住发起元素,hashchange 时取用
      pendingSource = t;
      location.hash = target;
    }
  });

  let pendingSource = null;
  window.addEventListener("hashchange", function () {
    const zone = location.hash.replace("#", "") || "home";
    navigate(zone, pendingSource);
    pendingSource = null;
  });

  // 首屏:带 #games 之类直接落到详情(无动画)
  const initial = location.hash.replace("#", "") || "home";
  if (initial !== "home" && views[initial]) {
    home.hidden = true;
    views[initial].hidden = false;
    views[initial].classList.add("is-active");
    current = initial;
  }
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
