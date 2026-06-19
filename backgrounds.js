// 魔法工厂 · 三个房间的动态背景 (v2 全面升级)
// 占卜室: three.js 水晶球 + 90颗粒子星河 + 符文法阵底座 + 星云
// 游戏厅: 320×180 像素化 canvas, synthwave + 街机柜体 + 霓虹招牌
// 奇怪工坊: 远景/前景齿轮 + 锅炉炉火 + 蒸汽喷雾 + 焊接火花 + 压力表
import * as THREE from "three";

// 只渲染当前房间,省电
const VIEWS = { fortune: 1, games: 1, tools: 1 };
function viewFromHash() { const v = (location.hash || "").replace("#", ""); return VIEWS[v] ? v : "home"; }
const active = { view: viewFromHash() };
window.__setBgView = function (v) { active.view = v; };
window.addEventListener("hashchange", function () { active.view = viewFromHash(); });

/* ============================================================
   占卜室 · three.js 水晶球 + 粒子星河
   ============================================================ */
function initFortune() {
  const canvas = document.getElementById("cv-fortune");
  if (!canvas) return;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  cam.position.z = 14;

  // ---- 星云: 全屏 FBM 噪声着色器 ----
  const nebUniforms = { uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) } };
  const nebGeo = new THREE.PlaneGeometry(2, 2);
  const nebMat = new THREE.ShaderMaterial({
    uniforms: nebUniforms,
    depthTest: false, depthWrite: false,
    vertexShader: "void main(){ gl_Position = vec4(position.xy, 0.999, 1.0); }",
    fragmentShader: [
      "precision highp float;",
      "uniform float uTime; uniform vec2 uRes;",
      "float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }",
      "float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);",
      "  float a=hash(i), b=hash(i+vec2(1,0)), c=hash(i+vec2(0,1)), d=hash(i+vec2(1,1));",
      "  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y); }",
      "float fbm(vec2 p){ float v=0.0, a=0.5; mat2 m=mat2(1.6,1.2,-1.2,1.6);",
      "  for(int i=0;i<6;i++){ v+=a*noise(p); p=m*p; a*=0.5; } return v; }",
      "void main(){",
      "  vec2 uv = gl_FragCoord.xy / uRes.xy;",
      "  vec2 p = (uv - 0.5) * vec2(uRes.x/uRes.y, 1.0) * 3.0;",
      "  float t = uTime * 0.03;",
      "  vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2,1.3) - t));",
      "  float f = fbm(p + 2.4*q + t*0.5);",
      "  vec3 deep = vec3(0.06,0.03,0.14);",
      "  vec3 purp = vec3(0.34,0.15,0.55);",
      "  vec3 cyan = vec3(0.16,0.46,0.60);",
      "  vec3 gold = vec3(0.88,0.62,0.32);",
      "  vec3 col = mix(deep, purp, smoothstep(0.2,0.7,f));",
      "  col = mix(col, cyan, smoothstep(0.5,0.95,fbm(p*1.5 - t)) * 0.5);",
      "  col += gold * pow(max(0.0,1.0-length(p)*0.55), 3.0) * (0.4+0.2*sin(uTime*0.5));",
      "  float vig = smoothstep(1.3, 0.3, length(uv-0.5));",
      "  col *= 0.55 + 0.65*vig;",
      "  gl_FragColor = vec4(col, 1.0);",
      "}",
    ].join("\n"),
  });
  const nebMesh = new THREE.Mesh(nebGeo, nebMat);
  nebMesh.frustumCulled = false;
  scene.add(nebMesh);

  // ---- 星空: 两层, 远近视差 ----
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

  // ---- 水晶球: 玻璃球体 + 底座 ----
  const ballGroup = new THREE.Group();
  ballGroup.position.set(3.5, -0.5, 0); // 偏右侧置

  // 玻璃球(用 MeshPhongMaterial 保持轻量,避免 MeshPhysicalMaterial 的额外渲染 pass)
  const ballGeo = new THREE.SphereGeometry(2.2, 48, 48);
  const ballMat = new THREE.MeshPhongMaterial({
    color: 0x8888cc,
    transparent: true,
    opacity: 0.18,
    shininess: 120,
    specular: 0xffffff,
    side: THREE.FrontSide,
    depthWrite: false,
  });
  const ball = new THREE.Mesh(ballGeo, ballMat);
  ball.renderOrder = 10; // 球壳在粒子之上渲染
  ballGroup.add(ball);

  // 球体高光环(Fresnel 模拟)
  const rimGeo = new THREE.SphereGeometry(2.25, 48, 48);
  const rimMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(0.6, 0.5, 1.0) } },
    vertexShader: [
      "varying vec3 vNormal; varying vec3 vViewDir;",
      "void main(){",
      "  vNormal = normalize(normalMatrix * normal);",
      "  vec4 mv = modelViewMatrix * vec4(position, 1.0);",
      "  vViewDir = normalize(-mv.xyz);",
      "  gl_Position = projectionMatrix * mv;",
      "}",
    ].join("\n"),
    fragmentShader: [
      "uniform vec3 uColor; varying vec3 vNormal; varying vec3 vViewDir;",
      "void main(){",
      "  float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.0);",
      "  gl_FragColor = vec4(uColor, fresnel * 0.6);",
      "}",
    ].join("\n"),
    transparent: true, depthWrite: false, side: THREE.FrontSide,
  });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.renderOrder = 11;
  ballGroup.add(rim);

  // 底座
  const baseGeo = new THREE.CylinderGeometry(1.4, 1.6, 0.6, 24);
  const baseMat = new THREE.MeshPhongMaterial({ color: 0x3a2a18, specular: 0x665533, shininess: 40 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = -2.5;
  ballGroup.add(base);

  const base2Geo = new THREE.CylinderGeometry(1.8, 2.0, 0.3, 24);
  const base2 = new THREE.Mesh(base2Geo, baseMat);
  base2.position.y = -2.8;
  ballGroup.add(base2);

  // ---- 90 颗粒子星河(球内) ----
  const PCOUNT = 90;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(PCOUNT * 3);
  const pCol = new Float32Array(PCOUNT * 3);
  const pSize = new Float32Array(PCOUNT);
  const pAngle = new Float32Array(PCOUNT); // 每个粒子的初始角度
  const pRadius = new Float32Array(PCOUNT);
  const pSpeed = new Float32Array(PCOUNT);
  const pYOff = new Float32Array(PCOUNT);

  for (let i = 0; i < PCOUNT; i++) {
    const r = Math.random() * 1.8;
    const a = Math.random() * Math.PI * 2;
    pAngle[i] = a;
    pRadius[i] = r;
    pSpeed[i] = 0.3 + Math.random() * 0.7;
    pYOff[i] = (Math.random() - 0.5) * 1.6;
    // 初始位置
    pPos[i * 3] = Math.cos(a) * r;
    pPos[i * 3 + 1] = pYOff[i];
    pPos[i * 3 + 2] = Math.sin(a) * r;
    // 颜色: 紫/金/青渐变
    const t = Math.random();
    if (t < 0.33) { pCol[i*3]=0.7; pCol[i*3+1]=0.5; pCol[i*3+2]=1.0; }
    else if (t < 0.66) { pCol[i*3]=1.0; pCol[i*3+1]=0.85; pCol[i*3+2]=0.4; }
    else { pCol[i*3]=0.3; pCol[i*3+1]=0.9; pCol[i*3+2]=1.0; }
    pSize[i] = 4.0 + Math.random() * 8.0;
  }
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute("color", new THREE.BufferAttribute(pCol, 3));
  pGeo.setAttribute("size", new THREE.BufferAttribute(pSize, 1));

  const pMat = new THREE.ShaderMaterial({
    uniforms: { uScale: { value: 1.0 } },
    vertexShader: [
      "attribute float size;",
      "varying vec3 vColor;",
      "uniform float uScale;",
      "void main(){",
      "  vColor = color;",
      "  vec4 mv = modelViewMatrix * vec4(position, 1.0);",
      "  gl_PointSize = size * uScale * (200.0 / -mv.z);",
      "  gl_Position = projectionMatrix * mv;",
      "}",
    ].join("\n"),
    fragmentShader: [
      "varying vec3 vColor;",
      "void main(){",
      "  float d = length(gl_PointCoord - 0.5);",
      "  if(d > 0.5) discard;",
      "  float s = 1.0 - d * 2.0;",
      "  s = pow(s, 1.8);",
      "  gl_FragColor = vec4(vColor, s * 0.85);",
      "}",
    ].join("\n"),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true,
  });
  const particles = new THREE.Points(pGeo, pMat);
  particles.renderOrder = 5; // 粒子在球壳之下
  ballGroup.add(particles);

  scene.add(ballGroup);

  // ---- 法阵: 缩小到底座位置,刻在底座上的符文 ----
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
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.75, depthWrite: false });
    return new THREE.Sprite(mat);
  }
  const R1 = 3.0; // 外环(缩小)
  for (let i = 0; i < 12; i++) {
    const s = makeText(RUNES[i % RUNES.length], "#d9c8ff");
    const a = (i / 12) * Math.PI * 2;
    s.position.set(Math.cos(a) * R1, Math.sin(a) * R1, 0);
    s.scale.set(0.6, 0.6, 1);
    ringGroup.add(s);
  }
  const inner = new THREE.Group();
  const R2 = 1.8;
  for (let i = 0; i < 8; i++) {
    const s = makeText(RUNES[(i + 3) % RUNES.length], "#ffe6a8");
    const a = (i / 8) * Math.PI * 2;
    s.position.set(Math.cos(a) * R2, Math.sin(a) * R2, 0.1);
    s.scale.set(0.45, 0.45, 1);
    inner.add(s);
  }
  ringGroup.add(inner);
  // 法阵环线
  function ringLine(radius, seg, color, op) {
    const pts = [];
    for (let i = 0; i <= seg; i++) { const a = (i / seg) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0)); }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    return new THREE.LineLoop(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: op }));
  }
  ringGroup.add(ringLine(3.4, 64, 0x9a7bff, 0.35));
  ringGroup.add(ringLine(1.5, 64, 0xffe6a8, 0.3));
  // 六芒星
  function polygon(radius, sides, color, op) {
    const pts = [];
    for (let i = 0; i <= sides; i++) { const a = (i / sides) * Math.PI * 2 - Math.PI / 2; pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0)); }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    return new THREE.LineLoop(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: op }));
  }
  const tri1 = polygon(2.6, 3, 0xb89bff, 0.3);
  const tri2 = polygon(2.6, 3, 0xb89bff, 0.3); tri2.rotation.z = Math.PI;
  ringGroup.add(tri1); ringGroup.add(tri2);
  ringGroup.position.set(3.5, -2.5, 0); // 移到底座位置
  ringGroup.rotation.x = 1.3; // 俯视角更大
  scene.add(ringGroup);

  // ---- 光照 ----
  const amb = new THREE.AmbientLight(0x332244, 0.6);
  const pt1 = new THREE.PointLight(0xddc8ff, 1.2, 30);
  pt1.position.set(5, 3, 8);
  const pt2 = new THREE.PointLight(0xffe6a8, 0.7, 20);
  pt2.position.set(-3, -2, 5);
  scene.add(amb, pt1, pt2);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== w || canvas.height !== h) { renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); nebUniforms.uRes.value.set(w, h); }
  }
  let t = 0;
  function frame() {
    if (active.view === "fortune") {
      resize();
      t += 0.005;
      nebUniforms.uTime.value = t * 4.0;
      stars1.rotation.y = t * 0.3; stars1.rotation.x = t * 0.1;
      stars2.rotation.y = -t * 0.4;
      // 法阵旋转
      ringGroup.rotation.z = t * 0.4;
      inner.rotation.z = -t * 0.9;
      tri1.rotation.z = t * 0.6; tri2.rotation.z = Math.PI - t * 0.6;
      // 水晶球轻微浮动
      ballGroup.position.y = -0.5 + Math.sin(t * 1.2) * 0.15;
      // 更新粒子位置(螺旋轨道)
      const posArr = pGeo.attributes.position.array;
      for (let i = 0; i < PCOUNT; i++) {
        const ang = pAngle[i] + t * pSpeed[i] * 2.0;
        const r = pRadius[i] + Math.sin(t * 3 + i) * 0.15;
        posArr[i * 3] = Math.cos(ang) * r;
        posArr[i * 3 + 1] = pYOff[i] + Math.sin(t * 2 + i * 0.7) * 0.25;
        posArr[i * 3 + 2] = Math.sin(ang) * r;
      }
      pGeo.attributes.position.needsUpdate = true;
      renderer.render(scene, cam);
    }
    requestAnimationFrame(frame);
  }
  frame();
}

window.addEventListener("DOMContentLoaded", function () {
  try { initFortune(); } catch (e) { console.warn("Fortune init failed:", e); }
  initGames();
  initTools();
});

/* ============================================================
   游戏厅 · 320×180 像素化 synthwave + 街机柜体 + 霓虹招牌
   ============================================================ */

// 极简 3×5 像素字体(英文 + 数字 + 部分符号)
const PIXEL_FONT = {
  "A":[0b111,0b101,0b111,0b101,0b101], "B":[0b110,0b101,0b110,0b101,0b110],
  "C":[0b111,0b100,0b100,0b100,0b111], "D":[0b110,0b101,0b101,0b101,0b110],
  "E":[0b111,0b100,0b110,0b100,0b111], "F":[0b111,0b100,0b110,0b100,0b100],
  "G":[0b111,0b100,0b101,0b101,0b111], "H":[0b101,0b101,0b111,0b101,0b101],
  "I":[0b111,0b010,0b010,0b010,0b111], "J":[0b001,0b001,0b001,0b101,0b010],
  "K":[0b101,0b101,0b110,0b101,0b101], "L":[0b100,0b100,0b100,0b100,0b111],
  "M":[0b101,0b111,0b111,0b101,0b101], "N":[0b101,0b111,0b111,0b111,0b101],
  "O":[0b111,0b101,0b101,0b101,0b111], "P":[0b111,0b101,0b111,0b100,0b100],
  "R":[0b111,0b101,0b110,0b101,0b101], "S":[0b111,0b100,0b111,0b001,0b111],
  "T":[0b111,0b010,0b010,0b010,0b010], "U":[0b101,0b101,0b101,0b101,0b111],
  "V":[0b101,0b101,0b101,0b101,0b010], "W":[0b101,0b101,0b111,0b111,0b101],
  "Y":[0b101,0b101,0b010,0b010,0b010],
  "0":[0b111,0b101,0b101,0b101,0b111], "1":[0b010,0b110,0b010,0b010,0b111],
  "2":[0b111,0b001,0b111,0b100,0b111], "3":[0b111,0b001,0b111,0b001,0b111],
  " ":[0b000,0b000,0b000,0b000,0b000],
};

function drawPixelText(ctx, text, x, y, color, scale) {
  ctx.fillStyle = color;
  for (let c = 0; c < text.length; c++) {
    const data = PIXEL_FONT[text[c]];
    if (!data) { continue; }
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 3; col++) {
        if (data[row] & (1 << (2 - col))) {
          ctx.fillRect(x + c * 4 * scale + col * scale, y + row * scale, scale, scale);
        }
      }
    }
  }
}

function initGames() {
  const canvas = document.getElementById("cv-games");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // 锁死低分辨率
  const PW = 320, PH = 180;
  canvas.width = PW;
  canvas.height = PH;

  let t = 0;

  // 街机柜体像素矩阵(左侧,12×22)
  const CAB = [
    [0,0,1,1,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,0,0,0,0,0,0,0,0,1,0],
    [0,1,0,1,1,1,1,1,1,0,1,0], // 屏幕
    [0,1,0,1,1,1,1,1,1,0,1,0],
    [0,1,0,1,1,1,1,1,1,0,1,0],
    [0,1,0,1,1,1,1,1,1,0,1,0],
    [0,1,0,0,0,0,0,0,0,0,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,0], // 控制面板
    [0,1,1,0,1,0,0,1,0,1,1,0], // 按钮
    [0,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,1,1,1,1,0,0],
    [0,0,1,1,0,0,0,0,1,1,0,0],
    [0,0,1,1,0,0,0,0,1,1,0,0],
  ];

  // 8bit 飞船 sprite (8×5)
  const SHIP = [
    [0,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [1,0,1,1,1,1,0,1],
    [1,0,0,1,1,0,0,1],
  ];

  // 飞船实例
  const ships = [];
  for (let i = 0; i < 4; i++) {
    ships.push({
      x: Math.random() * PW,
      y: 10 + Math.random() * 55,
      v: 0.3 + Math.random() * 0.5,
      c: ["#ff5aaa", "#50ffaa", "#5ab0ff", "#ffe14d"][i % 4],
    });
  }

  function drawCab(x, y, bodyColor, screenColors) {
    for (let r = 0; r < CAB.length; r++) {
      for (let c = 0; c < CAB[r].length; c++) {
        if (CAB[r][c]) {
          // 屏幕区域(行3-6,列3-8)用随机闪烁色
          if (r >= 3 && r <= 6 && c >= 3 && c <= 8) {
            ctx.fillStyle = screenColors[Math.floor(Math.random() * screenColors.length)];
          } else {
            ctx.fillStyle = bodyColor;
          }
          ctx.fillRect(x + c * 2, y + r * 2, 2, 2);
        }
      }
    }
  }

  // 日文カタカナ "ゲーム" (手动 bitmap, 每字 7×7)
  const KATAKANA = {
    "ゲ": [
      [0,1,1,1,1,1,0],
      [0,0,0,0,0,1,1],
      [0,0,0,0,1,0,0],
      [0,1,1,1,0,0,0],
      [0,0,0,1,0,0,0],
      [0,0,1,0,0,0,0],
      [0,1,0,0,0,0,0],
    ],
    "ー": [
      [0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0],
      [1,1,1,1,1,1,1],
      [0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0],
    ],
    "ム": [
      [0,0,0,1,0,0,0],
      [0,0,0,1,0,0,0],
      [0,0,1,0,1,0,0],
      [0,0,1,0,1,0,0],
      [0,1,0,0,0,1,0],
      [0,1,0,0,0,1,0],
      [1,1,1,1,1,1,1],
    ],
  };

  function drawKatakana(ch, x, y, color) {
    const data = KATAKANA[ch];
    if (!data) return;
    ctx.fillStyle = color;
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (data[r][c]) ctx.fillRect(x + c, y + r, 1, 1);
      }
    }
  }

  function frame() {
    if (active.view === "games") {
      t += 1;
      const horizon = PH * 0.52 | 0;

      // 天空渐变
      const sky = ctx.createLinearGradient(0, 0, 0, horizon);
      sky.addColorStop(0, "#1a0b2e"); sky.addColorStop(1, "#3a1850");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, PW, horizon);
      ctx.fillStyle = "#0d1024"; ctx.fillRect(0, horizon, PW, PH - horizon);

      // 落日
      const sunR = 28, sunX = PW / 2 | 0, sunY = horizon - 10;
      const sun = ctx.createLinearGradient(0, sunY - sunR, 0, sunY + sunR);
      sun.addColorStop(0, "#ffd24d"); sun.addColorStop(0.5, "#ff7a3c"); sun.addColorStop(1, "#ff2e7e");
      ctx.save(); ctx.beginPath(); ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = sun; ctx.fillRect(sunX - sunR, sunY - sunR, sunR * 2, sunR * 2);
      // 落日横纹
      ctx.fillStyle = "#0d1024";
      for (let i = 0; i < 6; i++) { const yy = sunY - 4 + i * 6; ctx.fillRect(sunX - sunR, yy, sunR * 2, Math.max(1, i)); }
      ctx.restore();

      // 网格地面(透视)
      ctx.strokeStyle = "rgba(120,255,210,0.55)"; ctx.lineWidth = 1;
      const vanX = PW / 2;
      for (let i = -8; i <= 8; i++) {
        ctx.beginPath(); ctx.moveTo(vanX + i * 8, horizon); ctx.lineTo(vanX + i * 80, PH); ctx.stroke();
      }
      const scroll = (t * 0.8) % 12;
      for (let i = 0; i < 18; i++) {
        const f = i / 18;
        const yy = horizon + (f * f * (PH - horizon)) + scroll * f * f | 0;
        if (yy > horizon && yy < PH) {
          ctx.globalAlpha = 0.3 + f * 0.5;
          ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(PW, yy); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      // ---- 街机柜体 ----
      const scrnColors = ["#ff2277", "#22ff88", "#2288ff", "#ffcc22", "#0d1024"];
      drawCab(6, PH - CAB.length * 2 - 10, "#2a2040", scrnColors);
      drawCab(PW - 12 * 2 - 6, PH - CAB.length * 2 - 10, "#2a2040", scrnColors);
      // 第二排(远景,更小/暗)
      ctx.globalAlpha = 0.5;
      drawCab(34, PH - CAB.length * 2 - 20, "#1a1530", scrnColors);
      drawCab(PW - 12 * 2 - 34, PH - CAB.length * 2 - 20, "#1a1530", scrnColors);
      ctx.globalAlpha = 1;

      // ---- 霓虹招牌 ----
      // "ゲーム" 用片假名 bitmap
      const neonBlink = Math.sin(t * 0.12) > -0.3; // 闪烁
      if (neonBlink) {
        const gx = PW / 2 - 12;
        drawKatakana("ゲ", gx, 8, "#ff5aaa");
        drawKatakana("ー", gx + 8, 8, "#ff5aaa");
        drawKatakana("ム", gx + 16, 8, "#ff5aaa");
      }

      // "INSERT COIN" 英文像素字
      const coinBlink = (t % 60) < 45;
      if (coinBlink) {
        drawPixelText(ctx, "INSERT COIN", PW / 2 - 22 * 1, PH - 16, "#ffe14d", 1);
      }

      // "1P PLAY"
      drawPixelText(ctx, "1P PLAY", 10, 20, "#50ffaa", 1);

      // ---- 8bit 飞船 ----
      ships.forEach(function (sp) {
        sp.x -= sp.v; if (sp.x < -12) sp.x = PW + 8;
        ctx.fillStyle = sp.c;
        for (let r = 0; r < SHIP.length; r++) {
          for (let c = 0; c < SHIP[r].length; c++) {
            if (SHIP[r][c]) ctx.fillRect((sp.x + c) | 0, (sp.y + r) | 0, 1, 1);
          }
        }
      });

      // Canvas 内 CRT 扫描线(每隔 2 行)
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      for (let y = 0; y < PH; y += 2) {
        ctx.fillRect(0, y, PW, 1);
      }
    }
    requestAnimationFrame(frame);
  }
  frame();
}

/* ============================================================
   奇怪工坊 · 远景/前景齿轮 + 锅炉炉火 + 蒸汽 + 火花 + 压力表
   ============================================================ */
function initTools() {
  const canvas = document.getElementById("cv-tools");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let W, H, t = 0;
  function size() { W = canvas.width = canvas.clientWidth * devicePixelRatio; H = canvas.height = canvas.clientHeight * devicePixelRatio; }
  size();

  // ---- 齿轮工厂 ----
  function gear(cx, cy, teeth, rOuter, a) { return { cx, cy, teeth, rOuter, a, ang: Math.random() * Math.PI }; }

  // 远景齿轮(巨大、慢、模糊)
  let bgGears = [];
  // 前景齿轮(精细、快)
  let fgGears = [];

  function layoutGears() {
    const u = Math.min(W, H);
    bgGears = [
      gear(W * 0.15, H * 0.35, 24, u * 0.35, 0.12),
      gear(W * 0.85, H * 0.25, 20, u * 0.28, 0.15),
      gear(W * 0.5, H * 0.65, 28, u * 0.32, 0.10),
    ];
    fgGears = [
      gear(W * 0.18, H * 0.18, 16, u * 0.11, 0.55),
      gear(W * 0.18 + u * 0.11 + u * 0.07, H * 0.18 + u * 0.04, 11, u * 0.075, 0.50),
      gear(W * 0.82, H * 0.72, 20, u * 0.14, 0.50),
      gear(W * 0.82 - u * 0.14 - u * 0.055, H * 0.72 + u * 0.03, 9, u * 0.06, 0.45),
      gear(W * 0.52, H * 0.10, 13, u * 0.08, 0.42),
    ];
  }
  layoutGears();

  function drawGear(g, dir, isBlur) {
    const { cx, cy, teeth, rOuter } = g;
    const rInner = rOuter * 0.78, rHub = rOuter * 0.32, rHole = rOuter * 0.13;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(g.ang * dir);
    ctx.beginPath();
    for (let i = 0; i < teeth; i++) {
      const a0 = (i / teeth) * Math.PI * 2, a1 = ((i + 0.5) / teeth) * Math.PI * 2, a2 = ((i + 1) / teeth) * Math.PI * 2;
      ctx.lineTo(Math.cos(a0) * rOuter, Math.sin(a0) * rOuter);
      ctx.lineTo(Math.cos((a0 + a1) / 2) * rOuter, Math.sin((a0 + a1) / 2) * rOuter);
      ctx.lineTo(Math.cos(a1) * rInner, Math.sin(a1) * rInner);
      ctx.lineTo(Math.cos(a2) * rInner, Math.sin(a2) * rInner);
    }
    ctx.closePath();
    const alpha = isBlur ? g.a * 0.3 : g.a;
    const grad = ctx.createRadialGradient(-rOuter * 0.3, -rOuter * 0.3, rOuter * 0.1, 0, 0, rOuter);
    grad.addColorStop(0, "rgba(232,196,120," + alpha + ")");
    grad.addColorStop(0.5, "rgba(176,124,46," + alpha + ")");
    grad.addColorStop(1, "rgba(96,66,24," + alpha + ")");
    ctx.fillStyle = grad; ctx.fill();
    ctx.strokeStyle = "rgba(60,40,14," + alpha + ")"; ctx.lineWidth = (isBlur ? 1 : 2) * devicePixelRatio; ctx.stroke();
    // 内圈
    ctx.beginPath(); ctx.arc(0, 0, rHub, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(40,28,12," + alpha + ")"; ctx.fill();
    ctx.strokeStyle = "rgba(255,210,130," + (alpha * 0.6) + ")"; ctx.lineWidth = 1.5 * devicePixelRatio; ctx.stroke();
    // 轮辐
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * rHub, Math.sin(a) * rHub);
      ctx.lineTo(Math.cos(a) * rInner, Math.sin(a) * rInner);
      ctx.strokeStyle = "rgba(150,104,38," + alpha + ")"; ctx.lineWidth = (isBlur ? 2 : 3) * devicePixelRatio; ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(0, 0, rHole, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(20,14,8,0.9)"; ctx.fill();
    ctx.restore();
  }

  // ---- 高密度蒸汽粒子 ----
  const STEAM_COUNT = 50;
  const steam = [];
  // 蒸汽喷口位置(相对比例)
  const vents = [
    { x: 0.12, y: 0.45 }, { x: 0.25, y: 0.30 },
    { x: 0.78, y: 0.50 }, { x: 0.88, y: 0.35 },
  ];
  function spawnSteam() {
    const vent = vents[Math.floor(Math.random() * vents.length)];
    return {
      x: vent.x * W + (Math.random() - 0.5) * 20 * devicePixelRatio,
      y: vent.y * H,
      vx: (Math.random() - 0.3) * 0.8 * devicePixelRatio,
      vy: -(Math.random() * 1.5 + 0.5) * devicePixelRatio,
      life: 1.0,
      decay: Math.random() * 0.008 + 0.004,
      r: (15 + Math.random() * 25) * devicePixelRatio,
      rot: Math.random() * Math.PI * 2,
    };
  }
  for (let i = 0; i < STEAM_COUNT; i++) {
    const s = spawnSteam();
    s.life = Math.random(); // 初始错开
    steam.push(s);
  }

  // ---- 炉火粒子 ----
  const FIRE_COUNT = 30;
  const fire = [];
  function spawnFire() {
    return {
      x: W * (0.38 + Math.random() * 0.24),
      y: H * 0.92,
      vx: (Math.random() - 0.5) * 1.5 * devicePixelRatio,
      vy: -(Math.random() * 2.5 + 1.0) * devicePixelRatio,
      life: 1.0,
      decay: Math.random() * 0.025 + 0.015,
      size: (3 + Math.random() * 5) * devicePixelRatio,
    };
  }
  for (let i = 0; i < FIRE_COUNT; i++) {
    const f = spawnFire();
    f.life = Math.random();
    fire.push(f);
  }

  // ---- 焊接火花 ----
  const sparks = [];
  let nextSparkTime = 0;

  function burstSparks(ox, oy) {
    const count = 8 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = (2 + Math.random() * 5) * devicePixelRatio;
      sparks.push({
        x: ox, y: oy,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 2 * devicePixelRatio,
        life: 1.0,
        decay: Math.random() * 0.03 + 0.02,
        gravity: 0.12 * devicePixelRatio,
      });
    }
  }

  // ---- 压力仪表 ----
  function drawGauge(cx, cy, radius) {
    // 表盘底
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    const fGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    fGrad.addColorStop(0, "#2a2015"); fGrad.addColorStop(1, "#1a1008");
    ctx.fillStyle = fGrad; ctx.fill();
    ctx.strokeStyle = "#5a4030"; ctx.lineWidth = 3 * devicePixelRatio; ctx.stroke();
    // 刻度
    for (let i = 0; i <= 10; i++) {
      const angle = -Math.PI * 0.75 + (i / 10) * Math.PI * 1.5;
      const ir = radius * 0.72, or = radius * 0.88;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * ir, cy + Math.sin(angle) * ir);
      ctx.lineTo(cx + Math.cos(angle) * or, cy + Math.sin(angle) * or);
      ctx.strokeStyle = i > 7 ? "rgba(255,80,60,0.9)" : "rgba(200,170,100,0.7)";
      ctx.lineWidth = (i % 5 === 0 ? 2.5 : 1.2) * devicePixelRatio;
      ctx.stroke();
    }
    // 指针(带物理微颤)
    const base = 0.72; // 基础压力值 (0-1)
    const tremble =
      Math.sin(t * 23.7) * 0.008 +
      Math.sin(t * 11.3) * 0.015 +
      Math.sin(t * 5.1) * 0.005 +
      Math.sin(t * 37) * 0.003;
    const needleAngle = -Math.PI * 0.75 + (base + tremble) * Math.PI * 1.5;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(needleAngle);
    ctx.beginPath();
    ctx.moveTo(-radius * 0.08, -1.5 * devicePixelRatio);
    ctx.lineTo(radius * 0.68, 0);
    ctx.lineTo(-radius * 0.08, 1.5 * devicePixelRatio);
    ctx.closePath();
    ctx.fillStyle = "#cc3300"; ctx.fill();
    ctx.restore();
    // 中心铆钉
    ctx.beginPath(); ctx.arc(cx, cy, 4 * devicePixelRatio, 0, Math.PI * 2);
    ctx.fillStyle = "#c4a035"; ctx.fill();
  }

  function frame() {
    if (active.view === "tools") {
      size(); layoutGears();
      t += 0.01;
      ctx.clearRect(0, 0, W, H);

      // ---- 远景齿轮(模糊) ----
      ctx.save();
      ctx.filter = "blur(" + (3 * devicePixelRatio) + "px)";
      bgGears.forEach(function (g, i) {
        g.ang += 0.001 * (16 / g.teeth);
        drawGear(g, i % 2 ? -1 : 1, true);
      });
      ctx.filter = "none";
      ctx.restore();

      // ---- 锅炉底部光晕 ----
      const fGrad = ctx.createRadialGradient(W * 0.5, H * 0.95, 0, W * 0.5, H * 0.95, H * 0.35);
      fGrad.addColorStop(0, "rgba(255,100,30,0.18)");
      fGrad.addColorStop(0.5, "rgba(200,50,10,0.08)");
      fGrad.addColorStop(1, "rgba(200,50,10,0)");
      ctx.fillStyle = fGrad;
      ctx.fillRect(0, H * 0.6, W, H * 0.4);

      // ---- 炉火粒子 ----
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      fire.forEach(function (f) {
        f.x += f.vx; f.y += f.vy;
        f.vy *= 0.98;
        f.vx += Math.sin(f.life * 10) * 0.2 * devicePixelRatio;
        f.life -= f.decay;
        f.size *= 0.995;
        if (f.life <= 0) { Object.assign(f, spawnFire()); }
        const hue = 30 + f.life * 30;
        const light = 45 + f.life * 35;
        ctx.fillStyle = "hsla(" + hue + ",100%," + light + "%," + (f.life * 0.8) + ")";
        ctx.fillRect(f.x, f.y, f.size, f.size);
      });
      ctx.restore();

      // ---- 高密度蒸汽 ----
      ctx.save();
      steam.forEach(function (s) {
        s.x += s.vx + Math.sin(s.y * 0.005) * 0.5 * devicePixelRatio;
        s.y += s.vy;
        s.r += 0.2 * devicePixelRatio;
        s.life -= s.decay;
        if (s.life <= 0) { Object.assign(s, spawnSteam()); }
        ctx.globalAlpha = s.life * 0.18;
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
        g.addColorStop(0, "rgba(220,215,230,0.5)");
        g.addColorStop(1, "rgba(220,215,230,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.restore();

      // ---- 前景齿轮 ----
      fgGears.forEach(function (g, i) {
        g.ang += 0.004 * (16 / g.teeth);
        drawGear(g, i % 2 ? -1 : 1, false);
      });

      // ---- 焊接火花 ----
      // 定期触发
      if (t > nextSparkTime) {
        // 从某个前景齿轮位置迸发
        const sg = fgGears[Math.floor(Math.random() * fgGears.length)];
        burstSparks(sg.cx, sg.cy);
        nextSparkTime = t + 2 + Math.random() * 3;
      }
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (let i = sparks.length - 1; i >= 0; i--) {
        const sk = sparks[i];
        sk.vy += sk.gravity;
        sk.x += sk.vx; sk.y += sk.vy;
        sk.vx *= 0.99;
        sk.life -= sk.decay;
        if (sk.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.fillStyle = "rgba(255,230,120," + (sk.life * 0.9) + ")";
        const sz = 2 * devicePixelRatio;
        ctx.fillRect(sk.x, sk.y, sz, sz);
        // 尾迹
        ctx.strokeStyle = "rgba(255,180,60," + (sk.life * 0.3) + ")";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(sk.x, sk.y); ctx.lineTo(sk.x - sk.vx * 2, sk.y - sk.vy * 2); ctx.stroke();
      }
      ctx.restore();

      // ---- 压力仪表 ----
      const gaugeR = Math.min(W, H) * 0.065;
      drawGauge(W * 0.88, H * 0.82, gaugeR);

    }
    requestAnimationFrame(frame);
  }
  frame();
}
