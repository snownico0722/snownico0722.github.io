// 魔法工厂 · 无依赖脚本

// 年份
document.getElementById("year").textContent = new Date().getFullYear();

// 飘浮的火花:随机生成,从底部升起
(function () {
  const layer = document.querySelector(".sparks");
  if (!layer) return;
  const COLORS = ["#ffb43c", "#ff7a3c", "#7c5cff", "#4ec5d6"];
  const COUNT = 18;
  for (let i = 0; i < COUNT; i++) {
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

// 作品打分机:逐字搬店主亲手定的十分制量表
(function () {
  const pad = document.getElementById("pad");
  if (!pad) return;
  const num = document.getElementById("screen-num");
  const say = document.getElementById("screen-say");

  // 原话照搬,不改写
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

(function () {
  document.querySelectorAll(".stars[data-repo]").forEach(function (node) {
    const repo = node.getAttribute("data-repo");
    fetch("https://api.github.com/repos/snownico0722/" + repo, {
      headers: { Accept: "application/vnd.github+json" },
    })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(function (data) {
        if (typeof data.stargazers_count === "number") {
          node.querySelector(".count").textContent = data.stargazers_count;
        }
      })
      .catch(function () {
        /* 取不到就用静态回落值,不打扰 */
      });
  });
})();
