// snownico0722 — 无依赖脚本

// 年份
document.getElementById("year").textContent = new Date().getFullYear();

// 主题切换：记住选择；不写死，默认跟随 HTML 的 paper
(function () {
  const root = document.documentElement;
  const btn = document.getElementById("theme-toggle");
  const saved = localStorage.getItem("theme");
  if (saved === "paper" || saved === "ink") root.setAttribute("data-theme", saved);

  function label() {
    btn.textContent = root.getAttribute("data-theme") === "ink" ? "纸" : "墨";
  }
  label();

  btn.addEventListener("click", function () {
    const next = root.getAttribute("data-theme") === "ink" ? "paper" : "ink";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    label();
  });
})();

// 星标：联网取真实数,失败则保留 HTML 里的静态回落值。
// 要实证、要量化——宁可取真的,也不写死一个会过时的数。
(function () {
  const nodes = document.querySelectorAll(".repo-stars[data-repo]");
  nodes.forEach(function (node) {
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
        /* 取不到就用静态回落值,不报错、不打扰 */
      });
  });
})();
