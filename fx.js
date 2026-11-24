/* ============================================================
 * FX —— Phaser 3 覆盖式视觉层（原生 API，pointer-events:none）
 * 叠在主游戏 canvas 之上，由 game.js 调用；不改原文字/CSS。
 * 粒子高饱和、线段弹跳；收集物 0.1s 渐隐 + 物理坠落碎落。
 * ============================================================ */
(function (global) {
  'use strict';
  var W = 1280, H = 760;

  // 高饱和低明度不宜：用中高明度饱满色
  var SAT = {
    blue: 0x5aa9ff, cyan: 0x4fe0d8, purple: 0xb18cff, pink: 0xff7fc4,
    gold: 0xffd166, red: 0xff5a5a, ice: 0xbfe9ff
  };

  function FXLayer() {
    this.scene = 'menu';
    this.game = null;
    this.ready = false;
    this._mount();
  }

  FXLayer.prototype._mount = function () {
    var self = this;
    var host = document.createElement('div');
    host.id = 'fxHost';
    host.style.cssText = 'position:fixed;inset:0;z-index:6;pointer-events:none';
    document.body.insertBefore(host, document.body.firstChild);

    var Boot = new Phaser.Class({
      Extends: Phaser.Scene,
      initialize: function () { Phaser.Scene.call(this, { key: 'fxboot' }); },
      create: function () { self.sceneRef = this; self.ready = true; self._init(this); }
    });

    this.game = new Phaser.Game({
      type: Phaser.AUTO, parent: 'fxHost', width: W, height: H,
      transparent: true,
      scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
      render: { antialias: true, transparent: true },
      scene: [Boot]
    });
  };

  FXLayer.prototype._init = function (sc) {
    var self = this;
    // 氛围粒子（更明显： alpha 更高、更大、带轻微弹跳线段）
    this.parts = [];
    var cols = [SAT.blue, SAT.cyan, SAT.purple, SAT.gold, SAT.ice];
    for (var i = 0; i < 90; i++) {
      this.parts.push({ x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * 26, vy: -Math.random() * 26 - 6,
        a: .14 + Math.random() * .26, r: 1 + Math.random() * 2.4,
        seg: Math.random() < .35, len: 6 + Math.random() * 14,
        bounce: Math.random() * 6.28, col: cols[i % cols.length] });
    }
    // 第一关森林氛围：缓慢飘落的叶形/绿系粒子
    this.forest = [];
    var fcols = [0x8fcfc3, 0xa8d8b0, 0xd8b98f, 0xc9e4c5];
    for (var f = 0; f < 34; f++) {
      this.forest.push({ x: Math.random() * W, y: Math.random() * H,
        vy: 10 + Math.random() * 16, sway: Math.random() * 6.28,
        len: 5 + Math.random() * 9, a: .12 + Math.random() * .22,
        col: fcols[f % fcols.length] });
    }
    this.g = sc.add.graphics();
    this.darkG = sc.add.graphics();

    // 主循环（33ms）
    this.timer = sc.time.addEvent({ delay: 33, loop: true, callback: function () { self._tick(); } });
  };

  FXLayer.prototype._tick = function () {
    var g = this.g, sc = this.sceneRef;
    if (!g || !sc) return;
    g.clear();
    var w = sc.scale.width, h = sc.scale.height;

    for (var i = 0; i < this.parts.length; i++) {
      var p = this.parts[i];
      p.bounce += .08;
      p.x += p.vx * .033 + Math.sin(p.bounce) * .5;   // 轻微线段弹跳摆动
      p.y += p.vy * .033;
      if (p.y < -20) { p.y = h + 20; p.x = Math.random() * w; }
      if (p.x < -20) p.x = w + 20; if (p.x > w + 20) p.x = -20;
      var a = p.a * (this.scene === 'b2' ? 1.25 : 1);
      if (p.seg) {
        // 高饱和线段（弹跳抖动）
        g.lineStyle(1.4, p.col, a);
        g.beginPath(); g.moveTo(p.x, p.y);
        g.lineTo(p.x + Math.sin(p.bounce) * 4, p.y + p.len); g.strokePath();
      } else {
        g.fillStyle(p.col, a);
        g.fillCircle(p.x, p.y, p.r);
      }
    }

    // 增强氛围：随 BGM 节拍跳动的粒子/几何体/短线段（内置节奏模拟，不影响 BGM 播放）
    if (this.beatMode) {
      var lvl = Math.max(0, .5 + .5 * Math.sin(t * 6.9)) * (0.6 + 0.4 * Math.sin(t * 1.7));
      if (lvl > 0.35 && Math.random() < lvl * 0.8) {
        var col = [SAT.blue, SAT.cyan, SAT.purple, SAT.gold][Math.floor(Math.random() * 4)];
        var kind = Math.floor(Math.random() * 3);
        var bx = Math.random() * w, by = Math.random() * h;
        var obj;
        if (kind === 0) obj = sc.add.circle(bx, by, 2 + lvl * 5, col, .85);
        else if (kind === 1) obj = sc.add.rectangle(bx, by, 8 + lvl * 20, 2, col, .8).setRotation(Math.random() * 6.28);
        else obj = sc.add.line(1.6, bx, by, bx + 14 + lvl * 30, by + 6, col, .8);
        sc.tweens.add({ targets: obj, alpha: 0, y: by - 16, scaleX: 1.3, scaleY: 1.3,
          duration: 380 + Math.random() * 260, ease: 'Cubic.easeOut',
          onComplete: function () { obj.destroy(); } });
      }
    }

    // 第一关森林氛围：叶状绿系粒子缓慢飘落 + 轻微左右摆动
    if (this.scene === 'a1') {
      for (var fi = 0; fi < this.forest.length; fi++) {
        var lf = this.forest[fi];
        lf.y += lf.vy * .033; lf.sway += .02;
        var lx = lf.x + Math.sin(lf.sway) * 22;
        if (lf.y > h + 12) { lf.y = -12; lf.x = Math.random() * w; }
        g.lineStyle(1.6, lf.col, lf.a);
        g.beginPath(); g.moveTo(lx, lf.y);
        // Phaser Graphics 无 quadraticCurveTo：用 4 段 lineTo 近似叶形曲线
        for (var q = 1; q <= 4; q++) {
          var qt = q / 4;
          var qx = lx + Math.sin(lf.sway * 1.4) * 6 * qt + Math.sin(lf.sway) * 4 * Math.sin(qt * Math.PI);
          var qy = lf.y + lf.len * qt;
          g.lineTo(qx, qy);
        }
        g.strokePath();
        g.fillStyle(lf.col, lf.a * .8);
        g.fillCircle(lx + Math.sin(lf.sway * 1.4) * 6, lf.y + lf.len, 1.4);
      }
    }

    // 第四关幽暗恐怖氛围
    if (this.scene === 'b2') {
      var dg = this.darkG; dg.clear();
      var t = this.game.loop.time / 1000;
      for (var k = 0; k < 6; k++) {
        var cx = w * (.12 + k * .17) + Math.sin(t * .3 + k) * 46;
        var cy = h * (.28 + (k % 2) * .36) + Math.cos(t * .25 + k) * 34;
        dg.fillStyle(0x05060a, .06 + .03 * Math.sin(t * .5 + k));
        dg.fillCircle(cx, cy, 100 + k * 14);
      }
      dg.fillStyle(0x020306, .18);
      dg.fillRect(0, 0, w, 80); dg.fillRect(0, h - 80, w, 80);
      dg.fillRect(0, 0, 80, h); dg.fillRect(w - 80, 0, 80, h);
    } else {
      this.darkG.clear();
    }
  };

  /* ---------- 对外 API ---------- */
  FXLayer.prototype.setScene = function (sc) { this.scene = sc; };

  // 收集：高饱和簇状上升粒子 + 线段弹跳
  FXLayer.prototype.collect = function (x, y, color) {
    if (!this.sceneRef) return;
    var sc = this.sceneRef;
    var cols = [color || SAT.blue, SAT.cyan, SAT.purple, SAT.gold];
    for (var i = 0; i < 14; i++) {
      var a = Math.random() * 6.28, sp = 40 + Math.random() * 90;
      var p = sc.add.circle(x + (Math.random() - .5) * 20, y, 2 + Math.random() * 3,
        cols[i % cols.length], .95);
      sc.tweens.add({ targets: p, x: p.x + Math.cos(a) * sp * .35,
        y: y - 40 - Math.random() * 50, alpha: 0,
        duration: 420 + Math.random() * 380, ease: 'Cubic.easeOut',
        onComplete: function () { p.destroy(); } });
    }
    // 弹跳线段
    for (var j = 0; j < 4; j++) {
      var seg = sc.add.rectangle(x, y, 2, 10 + Math.random() * 10, SAT.gold, .8);
      seg.rotation = Math.random() * 6.28;
      sc.tweens.add({ targets: seg, y: y - 30 - Math.random() * 30,
        rotation: seg.rotation + (Math.random() - .5) * 3, alpha: 0,
        duration: 500, ease: 'Sine.easeInOut', onComplete: function () { seg.destroy(); } });
    }
  };

  FXLayer.prototype.move = function (x, y) {
    // y 传入影子位置（脚底）。装饰性：蓝色粒子减少 + 无规则方向单线条，粒子/线条均可发散
    if (!this.sceneRef || Math.random() > .72) return;
    var sc = this.sceneRef;
    if (Math.random() < .55) {
      // 无规则方向的单线条，向外发散
      var ang = Math.random() * 6.28, len = 8 + Math.random() * 16;
      var seg = sc.add.line(1.4, x, y, x + Math.cos(ang) * len, y + Math.sin(ang) * len,
        Math.random() < .5 ? SAT.cyan : SAT.blue, .55);
      sc.tweens.add({ targets: seg,
        x: x + Math.cos(ang) * 26, y: y + Math.sin(ang) * 26 - 8,
        x2: x + Math.cos(ang) * len + Math.cos(ang) * 26,
        y2: y + Math.sin(ang) * len + Math.sin(ang) * 26 - 8,
        alpha: 0, duration: 520, ease: 'Cubic.easeOut',
        onComplete: function () { seg.destroy(); } });
    } else {
      // 少量蓝色小粒子，随机方向飘散
      var p = sc.add.circle(x, y, 1.6 + Math.random() * 1.2,
        Math.random() < .5 ? SAT.cyan : SAT.blue, .6);
      var dx = (Math.random() - .5) * 34;
      sc.tweens.add({ targets: p, x: x + dx, y: y - 10 - Math.random() * 16, alpha: 0,
        duration: 420 + Math.random() * 160, ease: 'Sine.easeOut',
        onComplete: function () { p.destroy(); } });
    }
  };

  // 收集物：0.1s 渐隐 + Phaser 模拟物理坠落碎落
  FXLayer.prototype.shatter = function (x, y, color) {
    if (!this.sceneRef) return;
    var sc = this.sceneRef;
    var base = color || SAT.blue;
    // 碎块（带重力、旋转、落地淡出 —— 用 tween 模拟物理坠落）
    for (var i = 0; i < 12; i++) {
      var ang = Math.random() * 6.28, sp = 50 + Math.random() * 130;
      var piece = sc.add.rectangle(x, y, 3 + Math.random() * 5, 3 + Math.random() * 5,
        i % 3 === 0 ? SAT.gold : base, .95);
      var vx = Math.cos(ang) * sp * .4, vy = Math.sin(ang) * sp * .4 - 60;
      var dur = 600 + Math.random() * 400;
      sc.tweens.add({ targets: piece,
        x: x + vx, y: y + vy + 140,           // 重力下坠
        angle: (Math.random() - .5) * 540,
        alpha: 0, duration: dur, ease: 'Cubic.easeIn',
        onComplete: function () { piece.destroy(); } });
      // 0.1s 内先快速变透明
      sc.tweens.add({ targets: piece, alpha: .5, duration: 100, ease: 'Cubic.easeOut' });
    }
    // 收集主体 0.1s 渐隐（由 game.js 的 ghost 负责，这里补一圈收缩光）
    var ring = sc.add.graphics();
    var st = { r: 18, a: .9 };
    sc.tweens.add({ targets: st, r: 2, a: 0, duration: 120, ease: 'Cubic.easeOut',
      onUpdate: function () { ring.clear(); ring.lineStyle(1.5, base, st.a); ring.strokeCircle(x, y, st.r); },
      onComplete: function () { ring.destroy(); } });
  };

  // 第四关击杀：红色飞溅 + 画面震动
  FXLayer.prototype.attack = function (x, y) {
    if (!this.sceneRef) return;
    var sc = this.sceneRef;
    for (var i = 0; i < 22; i++) {
      var a = Math.random() * 6.28, sp = 80 + Math.random() * 180;
      var p = sc.add.circle(x, y, 1.8 + Math.random() * 3,
        Math.random() < .5 ? SAT.red : SAT.gold, .95);
      sc.tweens.add({ targets: p, x: x + Math.cos(a) * sp * .35,
        y: y + Math.sin(a) * sp * .35 - 24, alpha: 0, scale: 0,
        duration: 220 + Math.random() * 180, ease: 'Cubic.easeOut',
        onComplete: function () { p.destroy(); } });
    }
    var ring = sc.add.graphics();
    var st = { r: 4, a: .8 };
    sc.tweens.add({ targets: st, r: 14, a: 0, duration: 220, ease: 'Cubic.easeOut',
      onUpdate: function () { ring.clear(); ring.lineStyle(1.5, SAT.red, st.a); ring.strokeCircle(x, y, st.r); },
      onComplete: function () { ring.destroy(); } });
    if (this.scene === 'b2') {
      sc.cameras.main.shake(240, 0.016);              // 震动更大
      // 画面边缘红色虚化，0.5 秒恢复原状
      var w = sc.scale ? sc.scale.width : (sc.game && sc.game.scale ? sc.game.scale.width : 1280);
      var h = sc.scale ? sc.scale.height : (sc.game && sc.game.scale ? sc.game.scale.height : 800);
      var vg = sc.add.graphics();
      var st = { a: .38 };
      function paintVignette(a2) {
        vg.clear();
        vg.fillStyle(0xff2a2a, a2 * .55); vg.fillRect(0, 0, w, 90);
        vg.fillStyle(0xff2a2a, a2 * .55); vg.fillRect(0, h - 90, w, 90);
        vg.fillStyle(0xff2a2a, a2 * .55); vg.fillRect(0, 0, 90, h);
        vg.fillStyle(0xff2a2a, a2 * .55); vg.fillRect(w - 90, 0, 90, h);
      }
      paintVignette(st.a);
      sc.tweens.add({ targets: st, a: 0, duration: 500, ease: 'Cubic.easeOut',
        onUpdate: function () { paintVignette(st.a); },
        onComplete: function () { vg.destroy(); } });
    }
  };

  global.FX = new FXLayer();
})(window);
