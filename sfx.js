/* ============================================================
 * SFXManager —— 独立音效管理器（零依赖）
 * 单例复用 Audio、懒加载、currentTime 归零、打断重播、
 * 音量低于 BGM、自动播放限制静默忽略。
 * ============================================================ */
(function (global) {
  'use strict';

  // 音效 ID -> 相对路径（音频与 index.html 同级，扁平结构）
  var DEFAULT_MAP = {
    attack:   'attack.wav',    // 第四关攻击
    notfound: '404.wav',       // 404 弹窗
    interact: 'interact.wav',  // 第一/二/三关交互
    click:    'click.wav'      // 全局按键/UI
  };

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function SFXManager(options) {
    options = options || {};
    this.sfxMap = options.sfxMap || Object.assign({}, DEFAULT_MAP);
    this.volume = clamp(options.volume == null ? 0.4 : options.volume, 0, 1);
    this._pool = {};          // 每种音效只 new Audio 一次（懒加载）
    this._unlocked = false;
    this._unlockBound = false;
    this._bindUnlock();
  }

  // 懒加载：首次真正播放时才创建 Audio 对象
  SFXManager.prototype._get = function (id) {
    if (this._pool[id]) return this._pool[id];
    var src = this.sfxMap[id];
    if (!src) return null;
    var a = new Audio(src);
    a.loop = false;
    a.preload = 'auto';
    a.volume = this.volume;
    this._pool[id] = a;
    return a;
  };

  /** 播放指定音效：归零、打断重播、不循环、失败静默 */
  SFXManager.prototype.play = function (id) {
    if (!this._unlocked) return;                 // 页面打开时未交互 -> 静默
    var a = this._get(id);
    if (!a) return;
    try {
      a.pause();
      a.currentTime = 0;                          // 每次从头播放，打断上一次
      a.volume = this.volume;
      var p = a.play();
      if (p && typeof p.catch === 'function') p.catch(function () {}); // 自动播放限制：静默
    } catch (e) { /* 静默忽略，不影响游戏逻辑 */ }
  };

  /** 全局音效音量（0–1） */
  SFXManager.prototype.setVolume = function (v) {
    this.volume = clamp(v, 0, 1);
    for (var k in this._pool) if (this._pool[k]) this._pool[k].volume = this.volume;
  };

  /** 首次用户交互（点击/按键/触摸）后才允许播放 */
  SFXManager.prototype._bindUnlock = function () {
    if (this._unlockBound) return;
    this._unlockBound = true;
    var self = this;
    this._handler = function () {
      self._unlocked = true;
      document.removeEventListener('pointerdown', self._handler, true);
      document.removeEventListener('keydown', self._handler, true);
      document.removeEventListener('touchstart', self._handler, true);
      document.removeEventListener('click', self._handler, true);
    };
    document.addEventListener('pointerdown', this._handler, true);
    document.addEventListener('keydown', this._handler, true);
    document.addEventListener('touchstart', this._handler, true);
    document.addEventListener('click', this._handler, true);
  };

  global.SFXManager = SFXManager;
})(window);
