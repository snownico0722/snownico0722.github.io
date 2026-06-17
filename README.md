# snownico0722.github.io

个人首页。纯 HTML / CSS / JS,无框架,无构建——首页本身就是"原生实现"这条主张的实证。

发布在 <https://snownico0722.github.io>。

## 设计逻辑

- 形态同构于我的两个项目(PaperTodo / bookmark-bar-default-resetter):安静、可用、不打扰、原生实现。
- "一张纸"的视觉母题,明(暖纸)/ 墨(深色)双主题切换,呼应 PaperTodo。
- 星标数实时从 GitHub API 拉取,失败回落到静态值。要实证、要量化,不写死会过时的数。

## 文件

- `index.html` — 结构与内容
- `style.css` — 两套主题(paper / ink)
- `main.js` — 主题切换、年份、实时星标(无依赖)

## 本地预览

直接用浏览器打开 `index.html`,无需构建。

## 发布

推送到 `main` 分支即由 GitHub Pages 自动部署。
