/* ============================================================
 * StoryDirector —— 黑幕 / 白幕 / 结局揭晓 过场管理器（零依赖）
 * 执行引擎：setInterval 状态机（不依赖 Promise 链 / rAF，
 * 规避浏览器动画帧与微任务调度差异导致的推进卡死）。
 * 对外 API 保持不变：playStoryText / playEndingSequence /
 * onTap / skipWait / _waiting
 * ============================================================ */
(function (global) {
  'use strict';

  /* ---------- 文字库 w1-w9 / f1-f7 ---------- */
  var TEXT = {
    w1: [
      '你醒了。',
      '陌生的世界在你眼前展开。记忆是残缺的，像被水泡过的纸。你从那些残页里拼出一件事：你意外来到了镜像地球——一个空无一人的世界，安静得不太对劲。',
      '你想回去。回到原来的地球。',
      '身体里有股能量在流动。说不清是什么，但它让你觉得自己比想象中强一些。是优势，还是天赋？你不确定，只知道它比你以为的那些能力都要强。',
      '系统浮现一行字：“有足够能力者，才能获得传送之眼。使用它，才能回去。”',
      '往下看，条件写得很清楚：收集幽静林径的能量魂，至少五个。',
      '你站在原地想了一会儿。',
      '然后，走进了前方的幽静林径......'
    ],
    w2: [
      '多种能量在身体里交汇、翻涌，像几条方向不同的河。但它们离突破结界，还差得很远。',
      '传送之眼把你带到了喧闹的广场。',
      '幻影们挤在一起，各说各的，谁也说服不了谁。你是高能量者——在这里，你可以选择收集那些你认可的观点幻影，让它们汇入你原有的能量里。',
      '但广场不只有声音，还有暗处。幻影的能量一旦失衡，会反过来吞噬你。',
      '“你现在有总共30可支配的精力值，请耗尽它。”',
      '去收集吧。剩下的，广场会告诉你。'
    ],
    w3: [
      '能量已经涨到能撞开结界了。',
      '但你压不住它。这股东西在你身体里跑得太快，像水快过河道。去把它稳住吧。',
      '接下来要找的是作为地基的幻影——用它们来搭那道结界门。一砖一瓦，都得站得住。',
      '只是有些幻影不太安分。它们会趁你不注意，把搭好的东西推歪。',
      '“请接下来收集10只幻影，构建结界门，即可回到地球。”',
      '小心点。'
    ],
    w4: [
      '门开了。你化为一道流星，朝地球的方向飞去。',
      '很快，很快。',
      '然后你察觉到不对——',
      '地球没有变大。你飞了很久，它还是那么小。',
      '结界门没有撑住。',
      '它给你的方向，是偏的。',
      '你还在飞。',
      '——只是不知道，正在飞向哪里......'
    ],
    w5: [ '未知的能量场横着把你卷走......' ],
    w6: [
      '落地的时候，你站在一片狼藉里。',
      '死寂，黑暗，与鬼嚎。',
      '——这是别人崩坏镜像地球。',
      '你感受到驱散黑暗的能量在你身上聚集，',
      '似乎可以攻击不正的幻影......?',
      '你似乎得做点什么。'
    ],
    // w7 三节：按顺序显示，一节渐隐后下一节渐显
    w7Sections: [
      [ // 第一节
        '似乎是一场梦，你从床上醒过来。',
        '故事结束了......',
        '故事结束了吗？',
        '从小被认为的，天赋所在的地方',
        '现在是否成为你的感兴趣的领域之一了呢？',
        '又何尝，你的目光也被这些先天的优势束缚着了呢......?',
        '你的潜意识当中是否也存在一片已经单一的幽静林径了呢？',
        '......',
        '（——第一关）'
      ],
      [ // 第二节
        '当刷到太多太多的观点，你是否也在因为自己的兴趣或者情绪，忽视了其他的灵魂——留下单一的——灰色广场呢？',
        '世界真的如此局限吗？',
        '......',
        '（——第二关）'
      ],
      [ // 第三节
        '当面临一次又一次的舆论纷争，你真的保留主见，论事实而不意气用事：带节奏或被带节奏吗？',
        '当看到人们怀着一份又一份偏见和情绪的时候，能察觉到吗？',
        '......',
        '(——第三关）'
      ]
    ],
    w8: [
      '也许这对你而言只是一份游戏，似乎制作还十分简陋。',
      '但希望你能怀着从游戏里知道的答案，再次思考面临的波涛汹涌的信息流。',
      '信息茧房并非有罪，人们也清楚它的存在',
      '算法本身也是为了用户更好体验诞生的。',
      '但如何和算法共处呢？',
      '无论是跳出固有思维去拓展领域，还是秉持客观的事实去审视一份观点或者一次事件，',
      '当你对此建立了认知，茧房不攻自破。',
      '世界是多元的，请好好享受并了解吧！'
    ],
    w9: [
      '关于制作',
      'Acusiris 主负责人 想法，故事，制作，美化',
      'Jesse 制作辅助，交流与建议者',
      '大肥鱼 制作框架主要辅助工具',
      '鸣谢',
      '道法实践主题 方向规定与想法落地契机',
      '还有学校的电.......'
    ],
    f1: [ '你看了很久，但有些东西一直在你看不见的地方。', '它们没有躲。只是你的眼睛，刚好越过了它们。' ],
    f2: [ '每一步你都走对了。', '只是这些“对”，拼在一起，通向了一个错的地方。' ],
    f3: [ '你听见了他们在说话。', '但你听见的是字，不是他们。' ],
    f4: [ '你站在原地，看见眼前这一条路。', '你没看见的，是它本来还可以通向别处。' ],
    f5: [ '你站在原地，看见眼前这一条路。', '你没看见的，是它本来还可以通向别处。' ],
    f6: [ '你遇到的每一个幻影，都在对你点头。', '你以为你看见了世界。', '其实你只是，看见了很多面镜子。', '你被困在这里了......' ],
    f7: [ '每一个幻影递给你一片玻璃。', '你透过它们看世界，世界越来越红，越来越响。', '你以为那是世界的颜色。', '那只是玻璃的颜色。' ],
    // 第四关时长耗尽失败（黑幕）
    f8: [ '不是没看清。', '看清需要的时间，比偏见跑得慢。' ],
    // 第二关失败：按失衡领域分别显示（白幕）
    failA2: {
      tech:   [ '每一步严丝合缝。', '世界不按步骤运行。', '逻辑成了墙。' ],
      life:   [ '收了很多“怎么活”。', '碎片太多，日子拼不回去。' ],
      edu:    [ '每一句都说“对”。', '收得太多，忘了问：', '这是谁的答案。' ],
      health: [ '每一声提醒小心收好。', '收得越多，越觉得哪里都不对。' ],
      work:   [ '收得认真，像在铺一条安稳的路。', '路太窄，只剩一个人和满耳道理。' ],
      social: [ '收得越多，越只看见一隅。', '以为在看世界。', '其实一直望着同一个方向。' ]
    }
  };

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function easeInOut(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function now() { return (global.performance && performance.now) ? performance.now() : Date.now(); }

  function StoryDirector() {
    this.root = document.getElementById('storyOverlay');
    if (!this.root) {
      this.root = document.createElement('div');
      this.root.id = 'storyOverlay';
      this.root.className = 'story-overlay hidden';
      document.body.appendChild(this.root);
    }
    this._token = 0;      // 过场代号：新过场开始时 ++，旧链自动作废
    this._queue = [];     // 步骤队列
    this._qi = 0;         // 当前步骤
    this._t = 0;          // 当前步骤已耗时
    this._timer = null;   // 驱动定时器
    this._curStep = null;
    this._tapFinish = null; // 点击可立即完成当前渐显
    this._waiting = false;  // 是否处于"等待点击继续"
    this._done = null;
    this._last = 0;
    this.textEl = null;
    this.hintEl = null;
    this._creditsEl = null;
  }

  /* ---------- 构建遮罩 DOM（dark 黑幕 / light 白幕） ---------- */
  StoryDirector.prototype._build = function (theme) {
    this.root.className = 'story-overlay ' + (theme === 'light' ? 'light' : 'dark');
    this.root.style.pointerEvents = 'auto';
    this.root.style.opacity = '0';
    this.root.innerHTML =
      '<div class="story-glow"></div>' +
      '<div class="story-text"></div>' +
      '<div class="story-hint hidden">点击继续 · CLICK TO CONTINUE</div>';
    this.textEl = this.root.querySelector('.story-text');
    this.hintEl = this.root.querySelector('.story-hint');
  };

  /* ---------- 步骤工厂 ---------- */
  StoryDirector.prototype._fade = function (el, from, to, dur, skippable) {
    return { t: 'fade', el: el, from: from, to: to, dur: Math.max(1, dur || 1), skippable: !!skippable };
  };
  StoryDirector.prototype._wait = function (ms) { return { t: 'wait', ms: ms == null ? 500 : ms }; };
  StoryDirector.prototype._fn = function (fn) { return { t: 'fn', fn: fn }; };
  StoryDirector.prototype._click = function (hintText) { return { t: 'click', hint: hintText || null }; };
  StoryDirector.prototype._credits = function (dur) { return { t: 'credits', dur: dur || 14000 }; };

  /* ---------- 引擎 ---------- */
  StoryDirector.prototype._kill = function () {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
    this._done = null;
    this._curStep = null;
    this._tapFinish = null;
    this._waiting = false;
    this._last = 0;
  };
  StoryDirector.prototype._begin = function (resolve) {
    var self = this;
    this._kill();
    this._done = resolve;
    this._qi = 0; this._t = 0;
    this._timer = setInterval(function () { self._tick(); }, 16);
    this._tick();
  };
  StoryDirector.prototype._tick = function () {
    var t = now();
    var dt = this._last ? (t - this._last) : 16;
    this._last = t;
    if (dt < 0) dt = 0;
    if (dt > 120) dt = 120;
    this._advance(dt);
  };
  StoryDirector.prototype._advance = function (dt) {
    // 瞬时步骤（fn）连跳
    var guard = 0;
    while (this._qi < this._queue.length && this._queue[this._qi].t === 'fn') {
      if (guard++ > 200) break;
      var fs = this._queue[this._qi];
      try { fs.fn(); } catch (e) { console.log('[story] fn error:', e && e.message); }
      this._qi++; this._t = 0; this._curStep = null; this._tapFinish = null;
    }
    if (this._qi >= this._queue.length) { this._finish(); return; }

    var st = this._queue[this._qi];
    if (st !== this._curStep) this._enter(st);
    if (st.t === 'click') return;   // 等待点击

    this._t += dt;
    if (st.t === 'fade') {
      var p = clamp(this._t / st.dur, 0, 1);
      var v = st.from + (st.to - st.from) * easeInOut(p);
      try { st.el.style.opacity = v; } catch (e) {}
      if (p >= 1) this._next();
    } else if (st.t === 'wait') {
      if (this._t >= st.ms) this._next();
    } else if (st.t === 'credits') {
      var e = easeOut(clamp(this._t / st.dur, 0, 1));
      var el = this._creditsEl;
      if (el) { el.style.opacity = e; el.style.transform = 'translateY(' + ((1 - e) * 26) + 'px)'; }
      if (this._t >= st.dur) this._next();
    }
  };
  StoryDirector.prototype._enter = function (st) {
    this._curStep = st;
    this._t = 0;
    this._tapFinish = null;
    if (st.t === 'fade') {
      try { st.el.style.opacity = st.from; } catch (e) {}
      if (st.skippable) {
        var self = this;
        this._tapFinish = function () {
          self._tapFinish = null;
          try { st.el.style.opacity = st.to; } catch (e) {}
          self._next();
        };
      }
    } else if (st.t === 'click') {
      this._waiting = true;
      if (this.hintEl) {
        if (st.hint) this.hintEl.textContent = st.hint;
        this.hintEl.classList.remove('hidden');
        this.hintEl.style.opacity = '1';
      }
    } else if (st.t === 'credits') {
      this._creditsEl = this.textEl ? this.textEl.querySelector('.story-credits') : null;
      if (this._creditsEl) { this._creditsEl.style.opacity = '0'; this._creditsEl.style.transform = 'translateY(26px)'; }
    }
  };
  StoryDirector.prototype._next = function () {
    var st = this._queue[this._qi];
    if (st && st.t === 'click') {
      this._waiting = false;
      if (this.hintEl) { this.hintEl.classList.add('hidden'); }
    }
    this._qi++; this._t = 0; this._curStep = null; this._tapFinish = null;
    if (this._qi >= this._queue.length) this._finish();
  };
  StoryDirector.prototype._finish = function () {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
    this._curStep = null; this._tapFinish = null; this._waiting = false;
    var d = this._done; this._done = null;
    if (d) d();
  };

  /* 点击统一入口：渐显中 -> 立即完成该段；停驻中 -> 继续推进 */
  StoryDirector.prototype.onTap = function () {
    if (this._tapFinish) { var f = this._tapFinish; f(); return; }
    if (this._waiting) { this._next(); }
  };
  StoryDirector.prototype.skipWait = StoryDirector.prototype.onTap;

  /* ---------- 黑幕 / 白幕故事过场 ---------- */
  StoryDirector.prototype.playStoryText = function (paragraphs, config) {
    config = config || {};
    var self = this;
    var token = ++this._token;

    return new Promise(function (resolve) {
      self._kill();
      self._build(config.theme === 'light' ? 'light' : 'dark');

      var q = [];
      q.push(self._fade(self.root, 0, 1, config.maskIn || 1000, false));

      var inD = config.inDuration || 1500;
      var gap = config.gap || 500;
      var special = config.special || [];
      var spD = config.specialDuration || 2300;
      var spH = config.specialHold || 1500;

      (paragraphs || []).forEach(function (line, i) {
        var p = document.createElement('p');
        p.className = 'story-p';
        p.textContent = line;
        self.textEl.appendChild(p);
        var isSp = special.indexOf(i) >= 0;
        q.push(self._fade(p, 0, 1, isSp ? spD : inD, true));
        q.push(self._wait(isSp ? spH : gap));
      });

      q.push(self._click());
      q.push(self._fade(self.hintEl, 1, 0, 300, false));
      q.push(self._fade(self.textEl, 1, 0, config.textOut || 1300, false));
      q.push(self._fade(self.root, 1, 0, config.maskOut || 1000, false));
      q.push(self._fn(function () {
        if (self._token !== token) return;
        self.root.className = 'story-overlay hidden';
        self.root.style.pointerEvents = 'none';
        self.root.style.opacity = '0';
        self.root.innerHTML = '';
        self.textEl = null; self.hintEl = null;
      }));

      self._queue = q;
      self._begin(function () { if (self._token === token) resolve(); });
    });
  };

  /* ---------- 通关结局揭晓：w7 三节（story）→ w8 感想（reflection）→ w9 鸣谢（credits） ----------
   * 规范要点：
   * - 暖白底 #FDFCFA，板块间长停顿 sectionGap（1.5–2.5s），一页一页翻过的仪式感
   * - story 板块：逐段渐显（skippable：点击直接显示该段，不跳过内容），节末整体渐隐
   * - reflection 板块：行距更大、节奏稍快，末句停驻 2–3s 后等待玩家点击
   * - credits 板块：短清单整体淡入+停驻（无滚动），字号 15px、透明度 0.8
   * - 结尾：内容淡出 → 「点击返回主界面」呼吸提示 → 玩家点击 → 遮罩淡出 → onComplete
   * - 全程无弹跳/打字机/发光/描边/粒子；禁止自动跳过任何板块
   */
  StoryDirector.prototype.playEndingSequence = function (sections, config) {
    config = config || {};
    var self = this;
    var token = ++this._token;

    return new Promise(function (resolve) {
      self._kill();
      self._build('light');

      var q = [];
      q.push(self._fade(self.root, 0, 1, config.maskIn || 1200, false));
      var sgap = config.sectionGap || 2000;

      (sections || []).forEach(function (sec, si) {
        if (si > 0) q.push(self._wait(sgap));   // 板块间白屏停顿（禁止无缝衔接）

        if (sec.type === 'credits') {
          // 鸣谢清单：整体淡入 + 停驻（短清单），长清单用缓慢上滚
          q.push(self._fn(function () {
            self.textEl.innerHTML = '';
            self.textEl.style.opacity = '1';
            var wrap = document.createElement('div');
            wrap.className = 'story-credits';
            (sec.creditsList || []).forEach(function (line) {
              var d = document.createElement('div');
              d.className = 'story-credit-row';
              d.textContent = line;
              wrap.appendChild(d);
            });
            self.textEl.appendChild(wrap);
            self._creditsEl = wrap;
          }));
          var isLong = (sec.creditsList || []).length > 8;
          if (isLong) {
            q.push(self._credits(sec.rollDuration || 24000));
          } else {
            q.push(self._fade(self.textEl, 0, 1, sec.fadeIn || 1500, true));
            q.push(self._wait(sec.hold || 3500));
          }
          q.push(self._fade(self.textEl, 1, 0, sec.fadeOut || 1500, false));

        } else if (sec.type === 'storyParts' && sec.parts) {
          // 兼容旧结构：w7 三小节按顺序显示，一节渐隐后下一节渐显
          var special = sec.special || [];
          var spD = sec.specialDuration || 2200;
          var spH = sec.specialHold || 1400;
          sec.parts.forEach(function (part, pi) {
            if (pi > 0) q.push(self._wait(sec.partGap || 1400));
            // 构建时只创建节点（不挂载），板块开始时才插入 DOM——避免清空时把后续内容一并移除
            var els = [];
            (part || []).forEach(function (line) {
              var p = document.createElement('p');
              p.className = 'story-p';
              p.textContent = line;
              p.style.opacity = '0';
              els.push(p);
            });
            q.push(self._fn(function () {
              self.textEl.innerHTML = '';
              self.textEl.style.opacity = '1';
              els.forEach(function (p) { self.textEl.appendChild(p); });
            }));
            (part || []).forEach(function (line, i) {
              var isSp = special.indexOf(i) >= 0;
              q.push(self._fade(els[i], 0, 1, isSp ? spD : (sec.inDuration || 1400), true));
              q.push(self._wait(isSp ? spH : (sec.gap || 520)));
            });
            q.push(self._fade(self.textEl, 1, 0, sec.partOut || 1300, false));
          });

        } else {
          // story / reflection 板块：逐段渐显，节末整体渐隐
          var isRefl = sec.type === 'reflection';
          var els = [];
          (sec.paragraphs || []).forEach(function (line) {
            var p = document.createElement('p');
            p.className = 'story-p';
            p.textContent = line;
            p.style.opacity = '0';
            els.push(p);
          });
          q.push(self._fn(function () {
            self.textEl.innerHTML = '';
            self.textEl.style.opacity = '1';
            if (isRefl) {
              self.textEl.style.lineHeight = '2.2';   // 行距更大：作者在对你说话
              self.textEl.style.paddingTop = '4vh';   // 文字更靠中
            }
            els.forEach(function (p) { self.textEl.appendChild(p); });
          }));
          var special = sec.special || [];
          var spD = sec.specialDuration || 2200;
          var spH = sec.specialHold || 1500;
          (sec.paragraphs || []).forEach(function (line, i) {
            var isSp = special.indexOf(i) >= 0;
            q.push(self._fade(els[i], 0, 1, isSp ? spD : (sec.inDuration || (isRefl ? 1200 : 1400)), true));
            q.push(self._wait(isSp ? spH : (sec.gap || (isRefl ? 500 : 520))));
          });
          if (isRefl) {
            // 结语最后一句：停驻 2–3 秒，不自动消失，等待玩家点击
            q.push(self._wait(sec.endHold || 2500));
            q.push(self._click('点击继续 · CLICK TO CONTINUE'));
          }
          q.push(self._fade(self.textEl, 1, 0, sec.outDuration || 1300, false));
        }
      });

      // 结束：出现「点击返回主界面」呼吸提示，玩家点击后才回主菜单（不自动跳转）
      q.push(self._fn(function () {
        self.textEl.innerHTML = '';
        self.textEl.style.opacity = '1';
        if (self.hintEl) self.hintEl.textContent = '点击返回主界面 · TAP TO RETURN';
      }));
      q.push(self._click('点击返回主界面 · TAP TO RETURN'));
      q.push(self._fade(self.hintEl, 1, 0, 300, false));
      q.push(self._fade(self.root, 1, 0, config.maskOut || 1800, false));
      q.push(self._fn(function () {
        if (self._token !== token) return;
        self.root.className = 'story-overlay hidden';
        self.root.style.pointerEvents = 'none';
        self.root.style.opacity = '0';
        self.root.innerHTML = '';
        self.textEl = null; self.hintEl = null;
      }));

      self._queue = q;
      self._begin(function () { if (self._token === token) resolve(); });
    });
  };

  global.STORY_TEXT = TEXT;
  global.StoryDirector = StoryDirector;
})(window);
