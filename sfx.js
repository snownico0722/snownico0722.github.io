// 魔法工厂 · 通用音效管理器 (包含 Web Audio 实时合成特色主题音效)
(function () {
  const MUTED_KEY = "sfx_muted";
  // 默认开启声音，除非用户手动静音过
  let muted = localStorage.getItem(MUTED_KEY) === "true";

  const sounds = {
    magic: new Audio("assets/sfx/magic.wav"),
    switch: new Audio("assets/sfx/switch.wav"),
    click: new Audio("assets/sfx/click.wav")
  };

  // 调整音量以防音效刺耳
  sounds.magic.volume = 0.5;
  sounds.switch.volume = 0.4;
  sounds.click.volume = 0.35;

  // 预加载
  for (const name in sounds) {
    sounds[name].load();
  }

  // --- Web Audio 实时合成器组件 ---
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  let noiseBuffer = null;
  function getNoiseBuffer(ctx) {
    if (!noiseBuffer) {
      const bufferSize = ctx.sampleRate * 0.12; // 0.12 秒的白噪声
      noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }
    return noiseBuffer;
  }

  // 1. 占卜室 (fortune) - 空灵水晶敲击音(主音 + 高频泛音 + 混响尾)
  function synthCrystalClick(ctx) {
    const now = ctx.currentTime;
    // 主音
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1600, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.12);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
    // 高频泛音(水晶共鸣)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(3200, now);
    osc2.frequency.exponentialRampToValueAtTime(2100, now + 0.08);
    osc2.detune.setValueAtTime(5, now);
    gain2.gain.setValueAtTime(0.06, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.26);
  }

  // 2. 游戏厅 (games) - FC 8bit 像素按键音效
  function synthPixelClick(ctx) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.setValueAtTime(450, now + 0.035);

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.setValueAtTime(0.07, now + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  // 3. 奇怪工坊 (tools) - 机械黄铜卡合/齿轮咬合音效
  function synthMetalClick(ctx) {
    const now = ctx.currentTime;

    // 三角波撞击声
    const osc = ctx.createOscillator();
    const gainOsc = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(2600, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.025);
    gainOsc.gain.setValueAtTime(0.05, now);
    gainOsc.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
    osc.connect(gainOsc);
    gainOsc.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.03);

    // 带通滤波金属高频摩擦
    const source = ctx.createBufferSource();
    source.buffer = getNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 3600;
    filter.Q.value = 5;

    const gainNoise = ctx.createGain();
    gainNoise.gain.setValueAtTime(0.04, now);
    gainNoise.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    source.connect(filter);
    filter.connect(gainNoise);
    gainNoise.connect(ctx.destination);

    source.start(now);
    source.stop(now + 0.04);
  }

  // 4. 占卜室页面切换 (enter_fortune) - 魔法转场风铃
  function synthMagicEnter(ctx) {
    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51]; // A大调和弦
    notes.forEach((freq, idx) => {
      const timeOffset = idx * 0.05;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq * 0.75, now + timeOffset);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.15, now + timeOffset + 0.28);

      gain.gain.setValueAtTime(0, now + timeOffset);
      gain.gain.linearRampToValueAtTime(0.07, now + timeOffset + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + 0.6);
    });
  }

  // 5. 游戏厅页面切换 (enter_games) - 8bit 关卡进场升音
  function synthPixelEnter(ctx) {
    const now = ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C大调琶音
    notes.forEach((freq, idx) => {
      const timeOffset = idx * 0.045;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(freq, now + timeOffset);

      gain.gain.setValueAtTime(0, now + timeOffset);
      gain.gain.linearRampToValueAtTime(0.035, now + timeOffset + 0.01);
      gain.gain.setValueAtTime(0.035, now + timeOffset + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + 0.05);
    });
  }

  // 6. 奇怪工坊页面切换 (enter_tools) - 蒸汽喷气与重力齿轮碰撞
  function synthSteamEnter(ctx) {
    const now = ctx.currentTime;

    // 蒸汽排放 (白噪声带通渐变)
    const source = ctx.createBufferSource();
    source.buffer = getNoiseBuffer(ctx);
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(3800, now);
    filter.frequency.exponentialRampToValueAtTime(900, now + 0.45);
    filter.Q.value = 2.5;

    const gainNoise = ctx.createGain();
    gainNoise.gain.setValueAtTime(0, now);
    gainNoise.gain.linearRampToValueAtTime(0.1, now + 0.04);
    gainNoise.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    source.connect(filter);
    filter.connect(gainNoise);
    gainNoise.connect(ctx.destination);

    source.start(now);
    source.stop(now + 0.55);

    // 齿轮锁定金属钝响
    [0.08, 0.25].forEach(delay => {
      const osc = ctx.createOscillator();
      const gainOsc = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now + delay);
      osc.frequency.linearRampToValueAtTime(55, now + delay + 0.07);

      gainOsc.gain.setValueAtTime(0.07, now + delay);
      gainOsc.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.07);

      osc.connect(gainOsc);
      gainOsc.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.08);
    });
  }

  // 7. 占卜室核心动作 (action_fortune) - 魔法阵共鸣长音
  function synthMagicAction(ctx) {
    const now = ctx.currentTime;
    const roots = [220, 277.18, 329.63, 440]; // A和弦
    roots.forEach((baseFreq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 2, now + 1.1);

      lfo.frequency.value = 5.5 + idx * 1.2;
      lfoGain.gain.value = 12;

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.25);
      gain.gain.setValueAtTime(0.05, now + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      lfo.start(now);
      osc.start(now);
      lfo.stop(now + 1.3);
      osc.stop(now + 1.3);
    });
  }

  // 8. 游戏厅核心动作 (action_games) - 8bit 胜利/通关奖励音
  function synthPixelAction(ctx) {
    const now = ctx.currentTime;
    const notes = [
      { f: 523.25, d: 0.08 },
      { f: 659.25, d: 0.08 },
      { f: 783.99, d: 0.08 },
      { f: 1046.50, d: 0.12 },
      { f: 1318.51, d: 0.25 }
    ];
    let start = now;
    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(n.f, start);

      gain.gain.setValueAtTime(0.05, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + n.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + n.d + 0.01);

      start += n.d * 0.78;
    });
  }

  // 9. 奇怪工坊核心动作 (action_tools) - 高压蒸汽泄放 + 金属管壁共振
  function synthSteamAction(ctx) {
    const now = ctx.currentTime;
    // 高压蒸汽泄放(长白噪声 + 高通滤波渐降)
    const buf = getNoiseBuffer(ctx);
    const source = ctx.createBufferSource();
    source.buffer = buf;
    source.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.setValueAtTime(4500, now);
    hp.frequency.exponentialRampToValueAtTime(800, now + 0.8);
    const gainN = ctx.createGain();
    gainN.gain.setValueAtTime(0, now);
    gainN.gain.linearRampToValueAtTime(0.12, now + 0.03);
    gainN.gain.setValueAtTime(0.12, now + 0.15);
    gainN.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    source.connect(hp);
    hp.connect(gainN);
    gainN.connect(ctx.destination);
    source.start(now);
    source.stop(now + 0.9);
    // 金属管壁低频共振
    [0.05, 0.18].forEach(function (delay) {
      const osc = ctx.createOscillator();
      const gainO = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, now + delay);
      osc.frequency.linearRampToValueAtTime(45, now + delay + 0.12);
      gainO.gain.setValueAtTime(0.08, now + delay);
      gainO.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);
      osc.connect(gainO);
      gainO.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.13);
    });
  }

  // --- 播放控制逻辑 ---

  function playWav(name) {
    const audio = sounds[name];
    if (!audio) return;
    try {
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.log("音频播放暂被浏览器拦截：", err);
        });
      }
    } catch (e) {
      console.warn("播放音效异常：", e);
    }
  }

  function play(name) {
    if (muted) return;

    // 获取当前视口状态
    const stage = document.getElementById("stage");
    const room = stage ? (stage.getAttribute("data-view") || "home") : "home";

    // 1. 拦截并合成特色常规点击音
    if (name === "click") {
      try {
        const ctx = getAudioContext();
        if (room === "fortune") {
          synthCrystalClick(ctx);
          return;
        } else if (room === "games") {
          synthPixelClick(ctx);
          return;
        } else if (room === "tools") {
          synthMetalClick(ctx);
          return;
        }
      } catch (e) {
        console.warn("合成特色点击音异常，降级播放通用 wav", e);
      }
      playWav("click");
      return;
    }

    // 2. 拦截并合成特色页面切换音
    if (name === "switch") {
      try {
        const ctx = getAudioContext();
        if (room === "fortune") {
          synthMagicEnter(ctx);
          return;
        } else if (room === "games") {
          synthPixelEnter(ctx);
          return;
        } else if (room === "tools") {
          synthSteamEnter(ctx);
          return;
        }
      } catch (e) {
        console.warn("合成特色切换音异常，降级播放通用 wav", e);
      }
      playWav("switch");
      return;
    }

    // 3. 拦截并合成特色核心起卦/操作音
    if (name === "magic") {
      try {
        const ctx = getAudioContext();
        if (room === "fortune") {
          synthMagicAction(ctx);
          return;
        } else if (room === "games") {
          synthPixelAction(ctx);
          return;
        } else if (room === "tools") {
          synthSteamAction(ctx);
          return;
        }
      } catch (e) {
        console.warn("合成特色核心音异常，降级播放通用 wav", e);
      }
      playWav("magic");
      return;
    }

    // 其他通用情况
    playWav(name);
  }

  // 限制高频触发的播放（如拖动 Slider），防止重叠破音
  let lastPlayTimes = {};
  function playThrottled(name, limitMs = 80) {
    const now = Date.now();
    const last = lastPlayTimes[name] || 0;
    if (now - last >= limitMs) {
      play(name);
      lastPlayTimes[name] = now;
    }
  }

  function toggleMute() {
    muted = !muted;
    localStorage.setItem(MUTED_KEY, String(muted));
    document.dispatchEvent(new CustomEvent("sfx_mute_changed", { detail: { muted } }));
    if (!muted) {
      play("click");
    }
    return muted;
  }

  window.SFX = {
    play,
    playThrottled,
    toggleMute,
    isMuted: () => muted
  };
})();
