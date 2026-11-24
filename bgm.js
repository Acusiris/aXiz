/* ============================================================
 * BGMManager —— 独立背景音乐管理器（零依赖）
 * 复用单个 Audio 对象切换 src，支持关卡切换交叉淡入淡出、
 * 同曲不重播、浏览器自动播放限制解锁、ended 兜底重播。
 * ============================================================ */
(function (global) {
  'use strict';

  // 关卡 ID -> MP3 相对路径（音频与 index.html 同级，扁平结构）
  var DEFAULT_MAP = {
    start: 'start.mp3',       // 开始界面
    l1: 'l1.mp3',             // 第一关 · 走廊
    l2: 'l2.mp3',             // 第二关 · 广场
    l3: 'l3.mp3',             // 第三关 · 结界
    l4: 'l4.mp3',             // 第四关 · 挽救
    universe: 'universe.mp3', // 第三关→第四关过场（归途 404）
    end: 'end.mp3',           // 通过第四关后的结束页面
    fail: 'fail.mp3'          // 任意关卡通关失败
  };

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function BGMManager(options) {
    options = options || {};
    this.bgmMap = options.bgmMap || Object.assign({}, DEFAULT_MAP);
    this.defaultVolume = clamp(options.defaultVolume == null ? 0.6 : options.defaultVolume, 0, 1);
    this.fadeDuration = clamp(options.fadeDuration == null ? 0.8 : options.fadeDuration, 0, 60) * 1000; // -> ms
    // 未配置关卡时的行为：'keep' 保持上一首 | 'stop' 停止 | 'menu' 播放开始界面曲
    this.unmapped = options.unmapped || 'keep';

    // 复用单个 Audio 对象，减少内存与解码开销
    var audio = new Audio();
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;
    this.audio = audio;

    this._volume = this.defaultVolume; // setVolume 设定的全局目标音量
    this._src = null;                  // 当前已加载/意图加载的相对路径
    this._level = null;                // 当前意图播放的关卡 ID
    this._unlocked = false;            // 是否已收到用户交互
    this._unlockBound = false;
    this._fadeTimer = null;            // setInterval 句柄（同时只有一个）
    this._fadeId = 0;                  // 淡入淡出令牌：自增以取消旧动画

    var self = this;
    // loop 在个别浏览器上不稳定，ended 作为兜底重播
    audio.addEventListener('ended', function () {
      if (audio.paused) self._play();
    });
    // 一开始就注册解锁监听：首次用户交互后才会真正出声（浏览器自动播放限制）
    this._bindUnlock();
  }

  /* ---------- 淡入淡出：目标值每次 tick 动态读取，setVolume 可在动画中安全改音量 ---------- */
  BGMManager.prototype._fade = function (from, targetFn, token, done) {
    if (this._fadeTimer) { clearInterval(this._fadeTimer); this._fadeTimer = null; }
    var self = this, t0 = null;
    var timer = setInterval(function () {
      if (token !== self._fadeId) { clearInterval(timer); if (self._fadeTimer === timer) self._fadeTimer = null; return; }
      var now = (global.performance && performance.now) ? performance.now() : Date.now();
      if (t0 === null) t0 = now;
      var p = Math.min(1, (now - t0) / self.fadeDuration);
      var to = targetFn();
      self.audio.volume = clamp(from + (to - from) * p, 0, 1);
      if (p >= 1) {
        clearInterval(timer);
        if (self._fadeTimer === timer) self._fadeTimer = null;
        if (done) done();
      }
    }, 16);
    this._fadeTimer = timer;
  };

  BGMManager.prototype._cancelFade = function () {
    if (this._fadeTimer) { clearInterval(this._fadeTimer); this._fadeTimer = null; }
    this._fadeId++;
  };

  /* ---------- 真正加载并切换曲目：先淡出旧的 -> 换 src/load/play -> 淡入新的 ---------- */
  BGMManager.prototype._beginSwitch = function () {
    this._cancelFade();
    var token = this._fadeId, self = this, audio = this.audio;
    var from = audio.volume;

    var doLoad = function () {
      if (token !== self._fadeId) return; // 期间又切了关卡，放弃本次加载
      audio.pause();
      audio.src = self._src;
      audio.load();                       // 换 src 后必须 load 再 play
      audio.volume = 0;
      self._play();
      self._fade(0, function () { return self._volume; }, self._fadeId);
    };

    if (audio.paused || from <= 0.001) doLoad();              // 尚无在播曲目：直接载入淡入
    else this._fade(from, function () { return 0; }, token, doLoad); // 有在播曲目：先淡出
  };

  BGMManager.prototype._play = function () {
    var self = this;
    try {
      var p = this.audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(function () {             // 自动播放被拒绝 -> 等待用户交互重试
          self._unlocked = false;
          self._bindUnlock();
        });
      }
    } catch (e) {
      this._unlocked = false;
      this._bindUnlock();
    }
  };

  BGMManager.prototype._ensurePlaying = function () {
    if (this._unlocked && this._src && this.audio.paused) this._beginSwitch();
  };

  /* ---------- 自动播放解锁：首次点击/按键/触摸后才真正出声 ---------- */
  BGMManager.prototype._bindUnlock = function () {
    if (this._unlockBound) return;
    this._unlockBound = true;
    var self = this;
    this._unlockHandler = function () { self._unlock(); };
    ['click', 'keydown', 'touchstart', 'pointerdown'].forEach(function (e) {
      document.addEventListener(e, self._unlockHandler, true);
    });
  };

  BGMManager.prototype._removeUnlock = function () {
    if (!this._unlockBound) return;
    this._unlockBound = false;
    var self = this;
    ['click', 'keydown', 'touchstart', 'pointerdown'].forEach(function (e) {
      document.removeEventListener(e, self._unlockHandler, true);
    });
  };

  BGMManager.prototype._unlock = function () {
    this._unlocked = true;
    this._removeUnlock();
    if (this._src && this.audio.paused) this._beginSwitch();
  };

  /* ============================================================
     公开 API
     ============================================================ */

  /** 切换并播放关卡 BGM；同一首曲子不重新加载、不重播、保持进度 */
  BGMManager.prototype.playForLevel = function (levelId) {
    var src = this.bgmMap[levelId];
    if (!src) {
      if (this.unmapped === 'stop') return this.stop();
      if (this.unmapped === 'menu' && levelId !== 'start') return this.playForLevel('start');
      return; // 'keep'：保持上一首
    }
    this._level = levelId;
    if (src === this._src) { this._ensurePlaying(); return; } // 同曲 -> 不动
    this._src = src;
    if (!this._unlocked) return;                              // 未解锁 -> 仅记录，等首次交互
    this._beginSwitch();
  };

  /** 淡出并停止 */
  BGMManager.prototype.stop = function () {
    this._level = null;
    this._src = null;
    this._cancelFade();
    var token = this._fadeId, self = this, audio = this.audio;
    var from = audio.volume;
    if (audio.paused || from <= 0.001) { audio.pause(); return; }
    this._fade(from, function () { return 0; }, token, function () { audio.pause(); });
  };

  /** 调整全局 BGM 音量（0–1）；动画中调用会平滑过渡到新音量，不打断切换 */
  BGMManager.prototype.setVolume = function (v) {
    this._volume = clamp(v, 0, 1);
    if (!this._fadeTimer && this._unlocked && !this.audio.paused) {
      this.audio.volume = this._volume;
    }
  };

  /** 立即绑定解锁监听（可主动调用，也可等到首次 playForLevel） */
  BGMManager.prototype.enableAutoplay = function () { this._bindUnlock(); };

  global.BGMManager = BGMManager;
})(window);
