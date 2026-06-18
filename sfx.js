// 魔法工厂 · 通用音效管理器
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

  // 播放辅助，处理快速重叠播放与浏览器静默策略
  function play(name) {
    if (muted) return;
    const audio = sounds[name];
    if (!audio) return;

    try {
      // 快速重置播放进度，支持连续点击
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          // 静默处理浏览器“用户未交互前禁止播放音频”的报错
          console.log("音频播放暂被浏览器拦截，等待用户交互：", err);
        });
      }
    } catch (e) {
      console.warn("播放音效异常：", e);
    }
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
    // 切换为非静音时，播放一个轻微的咔哒声确认
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
