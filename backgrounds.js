// 魔法工厂 · 三个房间的动态背景
// 占卜室:three.js 3D 星空 + 数学符文法阵(神秘感=可被推演的精密)
// 游戏厅:canvas synthwave 霓虹网格 + 落日 + 像素精灵
// 奇怪工坊:canvas 真咬合齿轮组 + 蒸汽
import * as THREE from "three";

// 只渲染当前房间,省电。初始 view 直接从 hash 读,避免深链刷新时背景不画
const VIEWS = { fortune: 1, games: 1, tools: 1 };
function viewFromHash() { const v = (location.hash || "").replace("#", ""); return VIEWS[v] ? v : "home"; }
const active = { view: viewFromHash() };
window.__setBgView = function (v) { active.view = v; };
window.addEventListener("hashchange", function () { active.view = viewFromHash(); });

/* ============================================================
   占卜室 · three.js
   ============================================================ */
function initFortune() {
  const canvas = document.getElementById("cv-fortune");
  if (!canvas) return;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  cam.position.z = 14;

  // 星空:两层,远近视差
  function starLayer(count, radius, size, color) {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = radius * (0.5 + Math.random() * 0.5);
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(p) * Math.cos(t);
      pos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
      pos[i * 3 + 2] = r * Math.cos(p);
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({ color, size, transparent: true, opacity: 0.9, sizeAttenuation: true });
    return new THREE.Points(g, m);
  }
  const stars1 = starLayer(1400, 40, 0.12, 0xffffff);
  const stars2 = starLayer(700, 30, 0.2, 0xbfa8ff);
  scene.add(stars1); scene.add(stars2);

  // 法阵:数学符文环(精密的神秘)—— 用 sprite 文本
  const RUNES = ["∑", "∫", "∞", "φ", "π", "√", "ℵ", "∂", "∮", "≡", "∇", "ℏ", "Ω", "λ", "θ", "Ψ"];
  const ringGroup = new THREE.Group();
  function makeText(ch, color) {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const x = c.getContext("2d");
    x.fillStyle = color; x.font = "bold 92px Georgia, serif";
    x.textAlign = "center"; x.textBaseline = "middle";
    x.shadowColor = color; x.shadowBlur = 18;
    x.fillText(ch, 64, 70);
    const tex = new THREE.CanvasTexture(c);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.85, depthWrite: false });
    return new THREE.Sprite(mat);
  }
  // 外环符文
  const R1 = 7;
  for (let i = 0; i < 16; i++) {
    const s = makeText(RUNES[i % RUNES.length], "#d9c8ff");
    const a = (i / 16) * Math.PI * 2;
    s.position.set(Math.cos(a) * R1, Math.sin(a) * R1, 0);
    s.scale.set(1.1, 1.1, 1);
    ringGroup.add(s);
  }
  // 内环符文
  const inner = new THREE.Group();
  const R2 = 4.3;
  for (let i = 0; i < 10; i++) {
    const s = makeText(RUNES[(i + 3) % RUNES.length], "#ffe6a8");
    const a = (i / 10) * Math.PI * 2;
    s.position.set(Math.cos(a) * R2, Math.sin(a) * R2, 0.2);
    s.scale.set(0.8, 0.8, 1);
    inner.add(s);
  }
  ringGroup.add(inner);

  // 法阵几何环线
  function ringLine(radius, seg, color, op) {
    const pts = [];
    for (let i = 0; i <= seg; i++) { const a = (i / seg) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0)); }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    return new THREE.LineLoop(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: op }));
  }
  ringGroup.add(ringLine(8, 96, 0x9a7bff, 0.45));
  ringGroup.add(ringLine(6.4, 96, 0x9a7bff, 0.3));
  ringGroup.add(ringLine(3.4, 96, 0xffe6a8, 0.4));
  // 内嵌正多边形(六芒星感)
  function polygon(radius, sides, color, op) {
    const pts = [];
    for (let i = 0; i <= sides; i++) { const a = (i / sides) * Math.PI * 2 - Math.PI / 2; pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0)); }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    return new THREE.LineLoop(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: op }));
  }
  const tri1 = polygon(5.6, 3, 0xb89bff, 0.4);
  const tri2 = polygon(5.6, 3, 0xb89bff, 0.4); tri2.rotation.z = Math.PI;
  ringGroup.add(tri1); ringGroup.add(tri2);
  ringGroup.rotation.x = 1.05; // 略微俯视
  scene.add(ringGroup);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== w || canvas.height !== h) { renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
  }
  let t = 0;
  function frame() {
    if (active.view === "fortune") {
      resize();
      t += 0.005;
      stars1.rotation.y = t * 0.3; stars1.rotation.x = t * 0.1;
      stars2.rotation.y = -t * 0.4;
      ringGroup.rotation.z = t * 0.4;
      inner.rotation.z = -t * 0.9;
      tri1.rotation.z = t * 0.6; tri2.rotation.z = Math.PI - t * 0.6;
      renderer.render(scene, cam);
    }
    requestAnimationFrame(frame);
  }
  frame();
}

window.addEventListener("DOMContentLoaded", function () {
  try { initFortune(); } catch (e) { /* three 加载失败则留 CSS 兜底 */ }
  initGames();
  initTools();
});

/* ============================================================
   游戏厅 · synthwave 霓虹网格 + 落日 + 像素精灵
   ============================================================ */
function initGames() {
  const canvas = document.getElementById("cv-games");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let W, H, t = 0;
  function size() { W = canvas.width = canvas.clientWidth * devicePixelRatio; H = canvas.height = canvas.clientHeight * devicePixelRatio; }
  size();
  // 像素精灵:几个简单图案,从右往左飘
  const sprites = [];
  for (let i = 0; i < 6; i++) sprites.push({ x: Math.random(), y: 0.1 + Math.random() * 0.35, s: 3 + (Math.random() * 3 | 0), c: ["#ff5a8a", "#ffe14d", "#50ffaa", "#5ab0ff"][i % 4], v: 0.0006 + Math.random() * 0.0008 });

  function frame() {
    if (active.view === "games") {
      size();
      t += 1;
      const horizon = H * 0.52;
      // 天空渐变
      const sky = ctx.createLinearGradient(0, 0, 0, horizon);
      sky.addColorStop(0, "#1a0b2e"); sky.addColorStop(1, "#3a1850");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, horizon);
      ctx.fillStyle = "#0d1024"; ctx.fillRect(0, horizon, W, H - horizon);
      // 落日
      const sunR = Math.min(W, H) * 0.16, sunX = W / 2, sunY = horizon - sunR * 0.35;
      const sun = ctx.createLinearGradient(0, sunY - sunR, 0, sunY + sunR);
      sun.addColorStop(0, "#ffd24d"); sun.addColorStop(0.5, "#ff7a3c"); sun.addColorStop(1, "#ff2e7e");
      ctx.save(); ctx.beginPath(); ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = sun; ctx.fillRect(sunX - sunR, sunY - sunR, sunR * 2, sunR * 2);
      // 落日横纹
      ctx.fillStyle = "#0d1024";
      for (let i = 0; i < 8; i++) { const yy = sunY - sunR * 0.1 + i * (sunR / 7); ctx.fillRect(sunX - sunR, yy, sunR * 2, Math.max(1, (i / 2) * devicePixelRatio)); }
      ctx.restore();
      // 网格地面(透视)
      ctx.strokeStyle = "rgba(80,255,200,0.5)"; ctx.lineWidth = 1 * devicePixelRatio;
      const vanX = W / 2;
      for (let i = -10; i <= 10; i++) { ctx.beginPath(); ctx.moveTo(vanX + i * (W * 0.05), horizon); ctx.lineTo(vanX + i * (W * 0.5), H); ctx.stroke(); }
      const scroll = (t * 2 * devicePixelRatio) % 60;
      for (let i = 0; i < 22; i++) {
        const f = i / 22; const yy = horizon + Math.pow(f, 2) * (H - horizon) + scroll * Math.pow(f, 1.5);
        if (yy > horizon && yy < H) { ctx.globalAlpha = f; ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(W, yy); ctx.stroke(); }
      }
      ctx.globalAlpha = 1;
      // 像素精灵
      sprites.forEach(function (sp) {
        sp.x -= sp.v; if (sp.x < -0.05) sp.x = 1.05;
        const px = sp.x * W, py = sp.y * H, u = sp.s * devicePixelRatio;
        ctx.fillStyle = sp.c;
        const pat = [[0,0,1,0,0],[0,1,1,1,0],[1,1,1,1,1],[1,0,1,0,1]];
        pat.forEach((row, r) => row.forEach((c, k) => { if (c) ctx.fillRect(px + k * u, py + r * u, u, u); }));
      });
    }
    requestAnimationFrame(frame);
  }
  frame();
}

/* ============================================================
   奇怪工坊 · 真咬合齿轮组 + 蒸汽
   ============================================================ */
function initTools() {
  const canvas = document.getElementById("cv-tools");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let W, H, t = 0;
  function size() { W = canvas.width = canvas.clientWidth * devicePixelRatio; H = canvas.height = canvas.clientHeight * devicePixelRatio; }
  size();
  // 一组互相咬合的齿轮:相邻反向、角速度按齿数反比
  function gear(cx, cy, teeth, rOuter, color) { return { cx, cy, teeth, rOuter, color, ang: Math.random() * Math.PI }; }
  let gears = [];
  function layout() {
    const u = Math.min(W, H);
    gears = [
      gear(W * 0.18, H * 0.22, 16, u * 0.13, "rgba(201,149,47,0.5)"),
      gear(W * 0.18 + u * 0.13 + u * 0.085, H * 0.22 + u * 0.05, 11, u * 0.09, "rgba(255,200,110,0.45)"),
      gear(W * 0.8, H * 0.7, 20, u * 0.17, "rgba(201,149,47,0.45)"),
      gear(W * 0.8 - u * 0.17 - u * 0.07, H * 0.7 + u * 0.04, 9, u * 0.075, "rgba(255,200,110,0.4)"),
      gear(W * 0.5, H * 0.12, 13, u * 0.1, "rgba(180,130,40,0.4)"),
    ];
  }
  layout();
  function drawGear(g, dir) {
    const { cx, cy, teeth, rOuter, color } = g;
    const rInner = rOuter * 0.78, rHub = rOuter * 0.3, rHole = rOuter * 0.13;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(g.ang * dir);
    ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = 2 * devicePixelRatio;
    ctx.beginPath();
    for (let i = 0; i < teeth; i++) {
      const a0 = (i / teeth) * Math.PI * 2, a1 = ((i + 0.5) / teeth) * Math.PI * 2, a2 = ((i + 1) / teeth) * Math.PI * 2;
      ctx.lineTo(Math.cos(a0) * rOuter, Math.sin(a0) * rOuter);
      ctx.lineTo(Math.cos((a0 + a1) / 2) * rOuter, Math.sin((a0 + a1) / 2) * rOuter);
      ctx.lineTo(Math.cos(a1) * rInner, Math.sin(a1) * rInner);
      ctx.lineTo(Math.cos(a2) * rInner, Math.sin(a2) * rInner);
    }
    ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, rHub, 0, Math.PI * 2); ctx.stroke();
    // 轮辐
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * rHub, Math.sin(a) * rHub); ctx.lineTo(Math.cos(a) * rInner, Math.sin(a) * rInner); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(0, 0, rHole, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  // 蒸汽
  const puffs = [];
  for (let i = 0; i < 8; i++) puffs.push({ x: Math.random(), y: Math.random(), r: 0.04 + Math.random() * 0.05, v: 0.0008 + Math.random() * 0.001 });

  function frame() {
    if (active.view === "tools") {
      size(); layout(); t += 0.01;
      ctx.clearRect(0, 0, W, H);
      // 蒸汽
      puffs.forEach(function (p) {
        p.y -= p.v; if (p.y < -0.1) { p.y = 1.1; p.x = Math.random(); }
        const px = p.x * W, py = p.y * H, r = p.r * Math.min(W, H);
        const g = ctx.createRadialGradient(px, py, 0, px, py, r);
        g.addColorStop(0, "rgba(255,240,220,0.10)"); g.addColorStop(1, "rgba(255,240,220,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
      });
      // 齿轮(相邻反向)
      gears.forEach(function (g, i) { g.ang += (0.004 * (16 / g.teeth)); drawGear(g, i % 2 ? -1 : 1); });
    }
    requestAnimationFrame(frame);
  }
  frame();
}

