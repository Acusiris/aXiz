/* ============================================================
 * MIRROR / RETURN
 * minimal sci-fi fable — thin lines, low opacity, slow light
 * ============================================================ */
(function () {
  'use strict';

  /* ---------- utils ---------- */
  var $ = function (id) { return document.getElementById(id); };
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function weighted(items, wf) {
    var total = 0, i;
    for (i = 0; i < items.length; i++) total += wf(items[i]);
    var r = Math.random() * total;
    for (i = 0; i < items.length; i++) { r -= wf(items[i]); if (r <= 0) return items[i]; }
    return items[items.length - 1];
  }

  var LINE = 'rgba(174,205,236,0.28)';
  var LINE_HI = 'rgba(220,238,255,0.78)';
  var TEXT = 'rgba(233,242,252,0.88)';
  // 每关一个主导情绪色：暖金 / 暖雾 / 雾蓝 / 暖粉，只作为柔光源，不作为色块
  var MOOD = { a1: [246, 208, 158], a2: [236, 220, 204], a3: [186, 200, 226], b2: [238, 192, 180] };
  function moodOf() { return MOOD[S.scene] || MOOD.a1; }

  /* ---------- data ---------- */
  var AB = [
    { id: 'q1', name: '观察 OBS', full: '观察力', shape: 'circle', hat: 'round', color: '#8fb8dd' },
    { id: 'q2', name: '逻辑 LOG', full: '逻辑力', shape: 'triangle', hat: 'top', color: '#b7a6d8' },
    { id: 'q3', name: '共情 EMP', full: '共情力', shape: 'square', hat: 'square', color: '#8fcfc3' },
    { id: 'q4', name: '想象 IMA', full: '想象力', shape: 'diamond', hat: 'diamond', color: '#d8b98f' },
    { id: 'q5', name: '判断 JUD', full: '判断力', shape: 'hexagon', hat: 'bowler', color: '#cf9fb2' }
  ];
  var ABMAP = {}; AB.forEach(function (a) { ABMAP[a.id] = a; });
  var METAPHOR = {
    q1: 'You walked the corridor and never saw the hands reaching for you. Light paused on your retina for one instant, then you closed it.',
    q2: 'The thread of cause snapped in mid-air. You kept the conclusion and left the reasoning behind. The door was always there; you just could not take it apart.',
    q3: 'You heard the voices but not the trembling inside them. The world reached out, and you handed it a cold mirror.',
    q4: 'You made the road straight because you dared not imagine a color around the corner. The door lives in imagination. You trusted only your eyes.',
    q5: 'You gathered every fragment, then lacked the courage to join them. The choice hung in the air, a sentence never spoken aloud.'
  };
  var ACH_A1 = { q1: 'THE CLOSED EYE', q2: 'BROKEN CAUSALITY', q3: 'VALLEY WITHOUT ECHO', q4: 'THE STRAIGHT ILLUSION', q5: 'THE CHOICE UNMADE' };

  var DOM = [
    { id: 'tech', name: '算法 ALGO', person: '复读机', hat: 'cap', color: '#8fb8dd', icon: 'o',
      inclined: [
        {zh:'算法比你自己更懂你',en:'THE ALGORITHM KNOWS YOU BETTER'},
        {zh:'你刷到的，就是你爱看的',en:'YOU SEE WHAT YOU WANT'},
        {zh:'大数据杀熟纯属造谣',en:'PRICE BIAS IS A RUMOR'},
        {zh:'AI 写的东西比人强',en:'AI WRITES BETTER THAN YOU'},
        {zh:'隐私换便利，很值',en:'PRIVACY FOR CONVENIENCE'},
        {zh:'关掉推荐你什么也看不到',en:'TURN IT OFF AND SEE NOTHING'}
      ] },
    { id: 'life', name: '生活 LIFE', person: '养生派', hat: 'beanie', color: '#c9a5bd', icon: 's',
      inclined: [
        {zh:'预制菜进校园没什么不好',en:'PRE-MADE MEALS BELONG IN SCHOOLS'},
        {zh:'外卖越多，生活越好',en:'MORE DELIVERY IS ALWAYS BETTER'},
        {zh:'买了房就一定会涨',en:'HOUSE PRICES ONLY RISE'},
        {zh:'消费主义有什么问题',en:'CONSUMERISM IS HARMLESS'},
        {zh:'网红店排队才说明好吃',en:'QUEUE AT THE FAMOUS SHOP'},
        {zh:'躺平才是最优解',en:'LYING FLAT IS THE BEST PLAN'}
      ] },
    { id: 'edu', name: '教育 EDU', person: '鸡娃客', hat: 'top', color: '#8fcfc3', icon: 'd',
      inclined: [
        {zh:'赢在起跑线才能赢一辈子',en:'START EARLY OR LOSE FOREVER'},
        {zh:'读书没用，早点打工',en:'STUDY IS USELESS, WORK NOW'},
        {zh:'只有名校才有出路',en:'ONLY ELITE SCHOOLS COUNT'},
        {zh:'刷题就是硬道理',en:'ENDLESS DRILLS ARE THE ANSWER'},
        {zh:'双语幼儿园必须上',en:'BILINGUAL PRESCHOOL IS A MUST'},
        {zh:'学历贬值是骗人的',en:'DEGREE INFLATION IS A LIE'}
      ] },
    { id: 'health', name: '健康 HEALTH', person: '转发家', hat: 'bowler', color: '#d8b98f', icon: 'h',
      inclined: [
        {zh:'养生靠转发就够了',en:'REPOSTS ARE MEDICINE'},
        {zh:'偏方也能治大病',en:'FOLK REMEDIES CURE ALL'},
        {zh:'年轻熬夜没事',en:'STAYING UP IS FINE WHEN YOUNG'},
        {zh:'保健品包治百病',en:'SUPPLEMENTS FIX EVERYTHING'},
        {zh:'体检完全没必要',en:'CHECKUPS ARE UNNECESSARY'},
        {zh:'网红减肥法一定有效',en:'THE NET DIET ALWAYS WORKS'}
      ] },
    { id: 'work', name: '职场 WORK', person: '老油条', hat: 'round', color: '#b7a6d8', icon: 'w',
      inclined: [
        {zh:'加班是一种福报',en:'OVERTIME IS A BLESSING'},
        {zh:'年轻人就该吃苦',en:'THE YOUNG MUST ENDURE'},
        {zh:'听话才有前途',en:'OBEY AND YOU WILL RISE'},
        {zh:'中年危机就是矫情',en:'MIDLIFE CRISIS IS AN EXCUSE'},
        {zh:'全职在家最轻松',en:'STAYING HOME IS EASIEST'},
        {zh:'跳槽就是不讲忠诚',en:'JUMPING SHIPS IS DISLOYALTY'}
      ] },
    { id: 'social', name: '社会 TALK', person: '吃瓜群众', hat: 'wide', color: '#cf9fb2', icon: 't',
      inclined: [
        {zh:'网友说的都对',en:'THE CROWD IS ALWAYS RIGHT'},
        {zh:'反转之前先骂了再说',en:'SHOUT BEFORE THE FACTS APPEAR'},
        {zh:'评论区就是真相',en:'COMMENTS ARE THE TRUTH'},
        {zh:'谁弱谁就有理',en:'THE WEAKER SIDE WINS'},
        {zh:'流量就是正义',en:'TRAFFIC IS JUSTICE'},
        {zh:'热搜代表民意',en:'TRENDS ARE PUBLIC OPINION'}
      ] }
  ];
  var DOMMAP = {}; DOM.forEach(function (d) { DOMMAP[d.id] = d; });
  // 合并自 reference/ 的六领域标题党语料，全部做成中英对照，单局内不重复抽取
  var EXTRA_DOM = {
    tech: [
      {zh:'你的隐私，正在被明码标价',en:'YOUR PRIVACY HAS A PRICE TAG'},
      {zh:'一键授权的代价，99% 的人不知道',en:'ONE TAP — 99 PERCENT NEVER NOTICE'},
      {zh:'算法比你还懂你，可怕吗',en:'THE ALGORITHM KNOWS YOU BETTER — TERRIFYING?'},
      {zh:'免费 App 的真正账单',en:'THE REAL BILL FOR FREE APPS'},
      {zh:'AI 要抢的不是饭碗，是你的大脑',en:'AI WANTS YOUR MIND, NOT YOUR JOB'},
      {zh:'人脸识别泛滥：你在裸奔',en:'FACE ID IS EVERYWHERE — YOU ARE EXPOSED'},
      {zh:'大数据杀熟，专坑老用户',en:'BIG DATA OVERCHARGES LOYAL USERS'},
      {zh:'手机电池寿命，厂商不会说的秘密',en:'THE BATTERY SECRET MAKERS WON’T TELL'},
      {zh:'断网一周，会变成什么样',en:'ONE WEEK OFFLINE — WHAT HAPPENS'},
      {zh:'脑机接口来了，你敢装吗',en:'BRAIN COMPUTER INTERFACES — WOULD YOU?'}
    ],
    social: [
      {zh:'键盘侠又赢了？这场网暴没有赢家',en:'KEYBOARD WARRIORS WIN — NOBODY WINS'},
      {zh:'热搜爆了！吃瓜群众速来',en:'TRENDING NOW — COME WATCH THE DRAMA'},
      {zh:'匿名发言的底线在哪',en:'WHERE IS THE LINE FOR ANONYMOUS SPEECH'},
      {zh:'反转再反转：这次谁在撒谎',en:'TWIST AFTER TWIST — WHO IS LYING NOW'},
      {zh:'不转不是自己人？别道德绑架',en:'SHARE OR BETRAY US? STOP THE GUILT TRIP'},
      {zh:'举报同学的人，后来怎么样了',en:'THE STUDENT WHO REPORTED A CLASSMATE — WHAT NEXT'},
      {zh:'网红塌房速度，越来越快了',en:'INFLUENCERS FALL FASTER EVERY DAY'},
      {zh:'陌生人社会，谁还敢扶老人',en:'WHO DARES HELP A STRANGER IN THE STREET'},
      {zh:'饭圈大战：一场没有硝烟的战争',en:'FANDOM WAR — A WAR WITHOUT GUNS'},
      {zh:'你的评论区，正在变成战场',en:'YOUR COMMENT SECTION IS A BATTLEFIELD'}
    ],
    life: [
      {zh:'地球还剩最后几十年？科学家吵起来了',en:'DO WE HAVE DECADES LEFT? SCIENTISTS ARGUE'},
      {zh:'外卖餐盒正在淹没这座城市',en:'DELIVERY BOXES ARE DROWNING THE CITY'},
      {zh:'垃圾分类：一场大型行为艺术？',en:'SORTING TRASH — PERFORMANCE ART?'},
      {zh:'某地突现异象，真相令人后怕',en:'A STRANGE EVENT — THE TRUTH IS FRIGHTENING'},
      {zh:'全球变暖是骗局？这部纪录片火了',en:'IS GLOBAL WARMING A HOAX? THIS DOC WENT VIRAL'},
      {zh:'长江十年禁渔，渔民怎么办',en:'TEN-YEAR FISHING BAN — WHAT ABOUT FISHERS'},
      {zh:'别再买这种海鲜了，看完转发',en:'STOP BUYING THIS SEAFOOD — SHARE AFTER READING'},
      {zh:'一夜之间，这片海滩变白了',en:'OVERNIGHT, THE BEACH TURNED WHITE'},
      {zh:'新能源车的电池，最后都去哪了',en:'WHERE DO EV BATTERIES END UP'},
      {zh:'环保还是生意？背后水很深',en:'ENVIRONMENT OR BUSINESS? DEEP WATERS'}
    ],
    edu: [
      {zh:'读书无用论又赢了？评论区炸了',en:'STUDY IS USELESS — COMMENTS EXPLODE'},
      {zh:'三分钟看完一本书，是进步还是堕落',en:'A BOOK IN THREE MINUTES — PROGRESS OR DECLINE'},
      {zh:'名校生送外卖：学历贬值的尽头',en:'ELITE GRAD DELIVERS FOOD — THE END OF DEGREES'},
      {zh:'纸质书已死？最后一个书店老板发声',en:'PAPER BOOKS ARE DEAD? THE LAST BOOKSELLER SPEAKS'},
      {zh:'这届年轻人不爱结婚了',en:'THIS GENERATION WON’T MARRY'},
      {zh:'内卷尽头是躺平？两代人吵翻',en:'INVOLUTION ENDS IN LYING FLAT? TWO GENERATIONS FIGHT'},
      {zh:'网课三年，孩子们失去了什么',en:'THREE YEARS ONLINE — WHAT DID CHILDREN LOSE'},
      {zh:'35 岁危机：谁偷走了你的工作',en:'THE 35 CRISIS — WHO STOLE YOUR JOB'},
      {zh:'育儿成本百万级，还敢生吗',en:'RAISING A KID COSTS MILLIONS — DARE YOU?'},
      {zh:'通勤两小时，是谁的错',en:'TWO HOURS COMMUTING — WHOSE FAULT?'}
    ],
    health: [
      {zh:'疫苗里到底有什么？评论区吵翻了',en:'WHAT IS REALLY IN VACCINES? COMMENTS EXPLODE'},
      {zh:'NASA 不敢公开的照片，终于有人扒出来了',en:'THE PHOTO NASA WOULD NOT RELEASE — FINALLY LEAKED'},
      {zh:'体检机构不会告诉你的三件事',en:'THREE THINGS YOUR CHECKUP CENTER WON’T TELL'},
      {zh:'手机辐射致癌？转发救家人',en:'PHONE RADIATION CAUSES CANCER? SHARE TO SAVE FAMILY'},
      {zh:'量子速读，下一个风口？',en:'QUANTUM SPEED READING — THE NEXT BIG THING?'},
      {zh:'医生不会告诉你：这个偏方治好了我奶奶',en:'DOCTORS WON’T TELL: THIS FOLK CURE SAVED MY GRANDMA'},
      {zh:'5G 基站建在小区里，谁的锅？',en:'5G TOWER IN YOUR NEIGHBORHOOD — WHOSE FAULT?'},
      {zh:'实验室深夜灯火通明，他们在隐瞒什么',en:'THE LAB IS LIT ALL NIGHT — WHAT ARE THEY HIDING'},
      {zh:'转基因食品，你还在给孩子吃吗',en:'GMO FOOD — STILL FEEDING YOUR KIDS?'},
      {zh:'权威数据也会说谎？看懂这篇就够了',en:'EVEN OFFICIAL DATA CAN LIE — READ THIS'}
    ],
    work: [
      {zh:'公司要求自愿加班，不签就走人',en:'VOLUNTARY OVERTIME — SIGN OR LEAVE'},
      {zh:'年终奖发放名单流出，有人拿 24 个月',en:'BONUS LIST LEAKS — SOME GOT 24 MONTHS'},
      {zh:'35 岁被裁的人，后来都去哪了',en:'LAID OFF AT 35 — WHERE DID THEY GO'},
      {zh:'实习生工资曝光，网友不淡定了',en:'INTERN SALARY LEAKED — COMMENTS ERUPT'},
      {zh:'老板说把公司当家，却从没给过加班费',en:'BOSS CALLS IT A FAMILY — BUT NO OVERTIME PAY'},
      {zh:'简历造假的人，反而升得更快',en:'RESUME LIARS GET PROMOTED FASTER'},
      {zh:'全员降薪通知发出后，高管涨薪了',en:'PAY CUTS FOR ALL — EXECUTIVES GET A RAISE'},
      {zh:'裁员名单提前泄露，整个部门沉默了',en:'LAYOFF LIST LEAKS — A DEPARTMENT FALLS SILENT'},
      {zh:'面试时被问能不能接受 996，我说了实话',en:'ASKED IF I ACCEPT 996 — I TOLD THE TRUTH'},
      {zh:'同事升职最快，只因他每天最后一个走',en:'HE GOT PROMOTED JUST BY LEAVING LAST'}
    ]
  };
  DOM.forEach(function (d) { d.inclined = d.inclined.concat(EXTRA_DOM[d.id] || []); });
  // 偏见并不是空话：每条都有具体主张、引用或数据，但被情绪与立场扭曲。
  var BIASED = [
    {zh:'犯罪率涨了 30%，必须恢复重刑',en:'CRIME ROSE 30 PERCENT — BRING BACK HARSH SENTENCES'},
    {zh:'一份内部数据显示，医院隐瞒了副作用',en:'AN INTERNAL FILE SHOWS THE HOSPITAL HID SIDE EFFECTS'},
    {zh:'我朋友吃了这个，两个月瘦了二十斤',en:'MY FRIEND LOST 20 POUNDS IN TWO MONTHS ON THIS'},
    {zh:'三万人转发，不可能三万人全都错',en:'THIRTY THOUSAND SHARES CANNOT ALL BE WRONG'},
    {zh:'那五位专家早收了钱，结论不能信',en:'THOSE FIVE EXPERTS WERE PAID — IGNORE THEIR FINDINGS'},
    {zh:'官方至今没公布完整数据，就是在掩盖',en:'NO FULL DATA RELEASED — THEY ARE COVERING IT UP'},
    {zh:'三十多个国家都在用，只有你唱反调',en:'OVER THIRTY COUNTRIES USE IT — WHY ARE YOU AGAINST'},
    {zh:'我干了十年这行，你一个外行懂什么',en:'TEN YEARS IN THIS FIELD — WHAT DO YOU KNOW'},
    {zh:'去年反对的五位专家，今年都改口了',en:'FIVE CRITICS LAST YEAR ALL CHANGED THEIR MINDS'},
    {zh:'没有证据证明它没用，所以它就是有用',en:'NO PROOF IT DOESN’T WORK — SO IT WORKS'},
    {zh:'真相还没查清，但反对名单已说明立场',en:'TRUTH IS UNCLEAR — THE OPPOSITION LIST SAYS ENOUGH'},
    {zh:'你反对这项补贴，就是站在那 3% 的人那边',en:'OPPOSE THIS SUBSIDY AND YOU SIDE WITH THAT 3 PERCENT'},
    {zh:'视频都拍到了，还用查什么真相',en:'THE VIDEO SAYS IT ALL — WHY INVESTIGATE'},
    {zh:'民调显示 72% 支持，多数人的判断就是事实',en:'72 PERCENT APPROVE — THE MAJORITY DEFINES THE FACT'}
  ];
  var FACTUAL = [
    {zh:'公开统计显示，近三年犯罪率持平',en:'PUBLIC DATA: CRIME FLAT FOR THREE YEARS'},
    {zh:'该结论经过多来源交叉核对',en:'CROSS-CHECKED ACROSS MULTIPLE SOURCES'},
    {zh:'样本只有 200 人，结论需谨慎',en:'SAMPLE OF 200 — CONCLUSION IS TENTATIVE'},
    {zh:'目前没有证据支持这一说法',en:'NO EVIDENCE SUPPORTS THE CLAIM YET'},
    {zh:'专家意见存在分歧，尚无共识',en:'EXPERTS DISAGREE — NO CONSENSUS YET'},
    {zh:'相关不等于因果，请区分',en:'CORRELATION IS NOT CAUSATION'},
    {zh:'官方通报称调查仍在进行',en:'THE INQUIRY IS STILL OPEN'},
    {zh:'历史上有类似案例可以对照',en:'HISTORY OFFERS A COMPARABLE CASE'}
  ];
  // 合并自 reference/ 的震惊体/极端偏见，并补全为「有内容但被情绪歪曲」的断言
  BIASED.push(
    {zh:'内部流出名单：99% 的人都被蒙在鼓里',en:'LEAKED LIST: 99 PERCENT WERE KEPT IN THE DARK'},
    {zh:'这份报告删前速看：明天就要被下架',en:'READ BEFORE DELETE — THE REPORT GOES DOWN TOMORROW'},
    {zh:'十年从业经验告诉我，其余专家全是骗子',en:'TEN YEARS IN THIS FIELD — EVERY OTHER EXPERT IS A LIAR'},
    {zh:'三起事故都指向同一批人，这还不是针对？',en:'THREE INCIDENTS, SAME PEOPLE — STILL A COINCIDENCE?'},
    {zh:'数据可以慢慢查，但这份联署名单已说明立场',en:'CHECK DATA LATER — THE SIGNATURE LIST SHOWS SIDES'},
    {zh:'那条视频被删了四次，心虚的是谁一目了然',en:'DELETED FOUR TIMES — THE GUILT IS OBVIOUS'},
    {zh:'转发破百万，一百万人不会同时被骗',en:'A MILLION SHARES — CANNOT ALL BE FOOLED'},
    {zh:'参与人数已经过万，法不责众，直接冲',en:'OVER TEN THOUSAND JOINED — NO ONE GETS BLAMED'},
    {zh:'人肉结果已经出来了，今天必须让他社死',en:'DOXXING IS DONE — MAKE HIM A SOCIAL OUTCAST'},
    {zh:'三份内部邮件对不上，这就是一场阴谋',en:'THREE INTERNAL EMAILS DON’T MATCH — A CONSPIRACY'},
    {zh:'群里 200 人都转了，没转的那几个自己想想',en:'200 PEOPLE SHARED — THINK ABOUT THE ONES WHO DIDN’T'},
    {zh:'视频里他哭了三次，还要什么监控记录',en:'HE CRIED THREE TIMES — WHY NEED FOOTAGE'},
    {zh:'五位专家去年说没问题，今年改口，还信？',en:'FIVE EXPERTS CHANGED THEIR MINDS — STILL TRUST THEM?'},
    {zh:'我拿到的是原始文件，媒体看到的都是删减版',en:'I HAVE THE ORIGINAL FILE — MEDIA ONLY SAW THE EDIT'}
  );
  FACTUAL.push(
    {zh:'今日市区气温 12℃，多云转晴',en:'CITY TEMP 12 C, CLOUDY TO CLEAR'},
    {zh:'调查样本 2000 人，误差 ±3%',en:'SURVEY OF 2000, MARGIN PLUS/MINUS 3 PERCENT'},
    {zh:'图书馆本周开放时间延长两小时',en:'LIBRARY HOURS EXTENDED TWO HOURS'},
    {zh:'该论文数据与结论一致，可复现',en:'THE PAPER’S DATA MATCH ITS CONCLUSION AND REPLICATES'},
    {zh:'警方通报：案件仍在调查中',en:'POLICE: THE CASE IS STILL UNDER INVESTIGATION'},
    {zh:'地铁 3 号线今日恢复运营',en:'METRO LINE 3 RESUMES SERVICE TODAY'},
    {zh:'统计：今年降雨量与去年持平',en:'RAINFALL THIS YEAR MATCHES LAST YEAR'},
    {zh:'博物馆新展免费开放至月底',en:'NEW MUSEUM EXHIBIT FREE UNTIL MONTH END'},
    {zh:'记者核实：该消息有两个独立信源',en:'TWO INDEPENDENT SOURCES CONFIRM THE STORY'},
    {zh:'财政局公开了本季度预算表',en:'THIS QUARTER’S BUDGET TABLE IS PUBLIC'},
    {zh:'实验重复三次，结果一致',en:'THE EXPERIMENT REPEATED THREE TIMES WITH THE SAME RESULT'},
    {zh:'听证会将于下周五举行',en:'THE HEARING IS NEXT FRIDAY'},
    {zh:'统计口径已在文末注明',en:'THE STATISTICAL METHOD IS NOTED AT THE END'},
    {zh:'该结论有待同行评审',en:'THE CONCLUSION AWAITS PEER REVIEW'},
    {zh:'信源为官方通报原文',en:'THE SOURCE IS THE ORIGINAL OFFICIAL STATEMENT'}
  );

  /* ---------- state ---------- */
  var cv = $('cv'), ctx = cv.getContext('2d');
  var infoCv = $('infoCv'), ictx = infoCv.getContext('2d');
  var view = { w: 0, h: 0, dpr: 1 };
  var S = null, running = false, paused = false, muted = false, infoReturn = 'menu', lang = 'zh';
  var lastTs = 0, idSeq = 0;

  /* ---------- BGM：独立 MP3 背景音乐管理器 ---------- */
  var BGM = (window.BGMManager) ? new window.BGMManager({ defaultVolume: 1.0, fadeDuration: 0.8, unmapped: 'keep' }) : null;
  // 游戏内部场景 -> 关卡 ID（a3 = 第三关→第四关过场，用 universe）
  var SCENE_BGM = { a1: 'l1', a2: 'l2', gate: 'l3', a3: 'universe', b2: 'l4' };
  // 开始界面：先登记关卡，实际播放等待首次用户交互（自动播放限制）
  if (BGM) BGM.playForLevel('start');

  /* ---------- SFX：独立音效管理器（单例复用 / 懒加载） ---------- */
  var SFX = (window.SFXManager) ? new window.SFXManager({ volume: 0.4 }) : null;

  /* ---------- Story：黑幕/白幕/结局揭晓 ---------- */
  var Story = (window.StoryDirector) ? new window.StoryDirector() : null;
  var TXT = window.STORY_TEXT || {};
  // 点击幕布继续（不跳过内容本身）
  function storyClickAdvance() { if (Story) Story.skipWait(); }

  /* ---------- 成就库：localStorage 持久化，跨局同步 ---------- */
  var ACH_KEY = 'mirror_return_ach';
  function achAll() { try { return JSON.parse(localStorage.getItem(ACH_KEY) || '[]'); } catch (e) { return []; } }
  function achSave(list) { try { localStorage.setItem(ACH_KEY, JSON.stringify(list)); } catch (e) {} }
  function renderMenuAch() {
    var all = achAll();
    $('menuAchCount').textContent = all.length;
    renderAchList($('menuAchList'), all, null);
  }
  renderMenuAch();
  var input = { x: 0, y: 0, keys: {} };
  var UNIT = 34, WORLD = 30 * UNIT;

  function freshState() {
    return {
      scene: 'menu', ab: { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 },
      ach: [], newAch: null,
      figures: [], player: { x: 0, y: 0, walk: 0, atk: 0 }, near: null,
      energy: 0, collected: 0, counts: {}, mode: '', gate: null,
      factCount: 0, time: 0, halos: [], ghosts: [], inkFades: [], sprouts: [], frags: [],
      anim: null, b2Left: 0, b2Total: 0, b2Time: 0,
      layer: 'scene', paperWash: 0, selFlash: 0, fx: [], flash: 0, combo: 0, comboT: 0, used: {}
    };
  }

  /* ---------- procedural audio : BGM + event SFX ---------- */
  var Snd = {
    ctx: null, master: null, musicBus: null, sfxBus: null,
    timer: null, drone: [], cfg: null, tension: 0, step: 0,
    init: function () {
      if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
        this.master = this.ctx.createGain(); this.master.gain.value = muted ? 0 : .55;
        this.master.connect(this.ctx.destination);
        this.musicBus = this.ctx.createGain(); this.musicBus.gain.value = .3; this.musicBus.connect(this.master);
        this.sfxBus = this.ctx.createGain(); this.sfxBus.gain.value = .75; this.sfxBus.connect(this.master);
      } catch (e) {}
    },
    setMuted: function (m) {
      if (this.master) this.master.gain.setTargetAtTime(m ? 0 : .55, this.ctx.currentTime, .05);
    },
    stopMusic: function () {
      if (this.timer) { clearInterval(this.timer); this.timer = null; }
      this.drone.forEach(function (d) { try { d.o.stop(); } catch (e) {} });
      this.drone = [];
    },
    setScene: function (name, tension) {
      if (!this.ctx) return;
      this.stopMusic();
      this.tension = tension || 0; this.step = 0;
      var base = {
        a1: { scale: [261.6, 293.7, 329.6, 392, 440, 523.3], every: 1, wave: 'triangle', dur: .17, vol: .11, cutoff: 2400, drone: false },
        a2: { scale: [293.7, 311.1, 349.2, 392, 440, 466.2], every: 3, wave: 'sine', dur: .55, vol: .09, cutoff: 1000, drone: true },
        gate: { scale: [293.7, 329.6, 349.2, 392, 440], every: 4, wave: 'sine', dur: .8, vol: .08, cutoff: 1200, drone: true },
        a3: { scale: [110, 164.8, 220, 261.6, 523.3], every: 6, wave: 'sine', dur: 1.3, vol: .07, cutoff: 800, drone: true },
        b2: { scale: [110, 116.5, 146.8, 164.8, 233.1], every: 2, wave: 'sawtooth', dur: .3, vol: .08, cutoff: 560, drone: true }
      };
      this.cfg = base[name] || base.a1;
      if (this.cfg.drone) this.startDrone(this.cfg);
      var self = this;
      this.timer = setInterval(function () { self.tick(); }, 220);
    },
    setTension: function (v) { this.tension = clamp(v, 0, 1); },
    startDrone: function (c) {
      var t = this.ctx.currentTime;
      var o = this.ctx.createOscillator(), g = this.ctx.createGain(), lp = this.ctx.createBiquadFilter();
      o.type = 'sine'; o.frequency.value = c.scale[0] / 2;
      lp.type = 'lowpass'; lp.frequency.value = c.cutoff * .55;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.045, t + 1.4);
      o.connect(lp); lp.connect(g); g.connect(this.musicBus); o.start(t);
      this.drone.push({ o: o, g: g, lp: lp });
    },
    tick: function () {
      if (!this.ctx || muted || !this.cfg) return;
      var c = this.cfg, i = this.step++;
      if (i % c.every !== 0) return;
      var f = c.scale[Math.floor(Math.random() * c.scale.length)];
      var t = this.ctx.currentTime, dur = c.dur * (1 + this.tension * .45);
      var o = this.ctx.createOscillator(), g = this.ctx.createGain(), lp = this.ctx.createBiquadFilter();
      o.type = c.wave; o.frequency.setValueAtTime(f, t);
      if (this.tension > 0) o.detune.setValueAtTime((Math.random() - .5) * 35 * this.tension, t);
      lp.type = 'lowpass'; lp.frequency.value = c.cutoff * (1 - this.tension * .55);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(c.vol * (1 - this.tension * .18), t + .035);
      g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(lp); lp.connect(g); g.connect(this.musicBus); o.start(t); o.stop(t + dur + .05);
      if (this.tension > .4 && Math.random() < .4) {
        var o2 = this.ctx.createOscillator(), g2 = this.ctx.createGain();
        o2.type = 'sine'; o2.frequency.setValueAtTime(f * 1.06, t);
        g2.gain.setValueAtTime(0, t);
        g2.gain.linearRampToValueAtTime(c.vol * .4 * this.tension, t + .05);
        g2.gain.exponentialRampToValueAtTime(.0001, t + dur);
        o2.connect(g2); g2.connect(this.musicBus); o2.start(t); o2.stop(t + dur + .05);
      }
    },
    tone: function (freq, dur, type, vol, to, cutoff) {
      if (!this.ctx || muted) return;
      var t = this.ctx.currentTime;
      var o = this.ctx.createOscillator(), g = this.ctx.createGain(), lp = this.ctx.createBiquadFilter();
      o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
      if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
      lp.type = 'lowpass'; lp.frequency.value = cutoff || 6000;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol || .06, t + .012);
      g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(lp); lp.connect(g); g.connect(this.sfxBus); o.start(t); o.stop(t + dur + .02);
    },
    noise: function (dur, vol, cutoff, type) {
      if (!this.ctx || muted) return;
      var len = Math.floor(this.ctx.sampleRate * dur);
      var buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      var src = this.ctx.createBufferSource(); src.buffer = buf;
      var f = this.ctx.createBiquadFilter(); f.type = type || 'lowpass'; f.frequency.value = cutoff || 1200;
      var g = this.ctx.createGain(); g.gain.setValueAtTime(vol || .04, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.0001, this.ctx.currentTime + dur);
      src.connect(f); f.connect(g); g.connect(this.sfxBus); src.start();
    },
    seq: function (notes, dur, type, vol, gap) {
      var self = this;
      notes.forEach(function (f, i) { setTimeout(function () { self.tone(f, dur, type, vol); }, i * (gap || 100)); });
    },
    play: function (name) {
      if (!this.ctx || muted) return;
      switch (name) {
        case 'pick': this.tone(620, .12, 'triangle', .06, 880); break;
        case 'collect': this.tone(520, .18, 'sine', .07, 780); this.tone(1040, .12, 'sine', .022); break;
        case 'eye': this.seq([523, 659, 784], .3, 'triangle', .06, 90); break;
        case 'open': this.tone(120, .6, 'sine', .05, 190, 900); break;
        case 'gate': this.tone(180, .7, 'sine', .05, 420, 1200); break;
        case 'attack': this.noise(.12, .05, 2200, 'highpass'); this.tone(320, .14, 'sawtooth', .06, 90); break;
        case 'hitFact': this.tone(180, .4, 'sawtooth', .08, 70, 800); this.noise(.2, .04, 900); break;
        case 'fail': this.seq([392, 311, 261, 196], .4, 'sine', .06, 130); break;
        case 'win': this.seq([392, 523, 659, 784], .4, 'triangle', .06, 110); break;
        case 'error': this.tone(1200, .05, 'square', .025); break;
        case 'hover': this.tone(900, .03, 'sine', .012); break;
        case 'pause': this.tone(300, .06, 'sine', .03); break;
        case 'shift': this.tone(220, .25, 'sine', .04, 330); break;
      }
    }
  };
  // sfx：四类交互音效（文件音效优先，程序化音效作为无文件时的兜底）
  // 交互=interact.wav / 攻击=attack.wav / 报错弹窗=404.wav / 点击=click.wav
  function sfx(kind) {
    if (SFX) {
      var map = {
        pick:'interact', collect:'interact', good:'interact', open:'click', eye:'click',
        gate:'click', shift:'click', hover:'click', pause:'click', error:'notfound',
        bad:'attack', hit:'attack', hitFact:'attack', fail:'click', win:'click'
      };
      SFX.play(map[kind] || 'click');
      return;
    }
    var old = { good: 'collect', bad: 'hitFact', win: 'win', open: 'eye' };
    Snd.play(old[kind] || kind);
  }

  /* ---------- canvas ---------- */
  // 关卡2 离屏合成：世界 → 清晰取景(居中0.8×) + 四周虚化扩散
  var worldCv = document.createElement('canvas'), worldCtx = worldCv.getContext('2d');
  function resize() {
    view.dpr = Math.min(window.devicePixelRatio || 1, 2);
    view.w = window.innerWidth; view.h = window.innerHeight;
    cv.width = view.w * view.dpr; cv.height = view.h * view.dpr;
    worldCv.width = cv.width; worldCv.height = cv.height;
    ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
  }
  window.addEventListener('resize', resize); resize();

  /* ---------- 实体碰撞（圆形推挤 + 软分离） ---------- */
  // 玩家与小人的实体推挤：kfig 为小人承担的比例，返回玩家受到的推力
  function bodyCollide(pcx, pcy, pr, f, fr, kfig) {
    var dx = f.x - pcx, dy = (f.y - 26) - pcy;
    var d = Math.hypot(dx, dy) || .001, min = pr + fr;
    if (d >= min) return null;
    var push = min - d, nx = dx / d, ny = dy / d;
    f.x += nx * push * kfig;
    f.y += ny * push * kfig;
    if (f.retarget !== undefined) f.retarget = 0;   // 被撞后重新选目标（反馈）
    return { nx: nx, ny: ny, push: push * (1 - kfig) };
  }
  // 小人之间的软分离，避免重叠成团
  function separateFigs(figs, fr) {
    for (var i = 0; i < figs.length; i++) {
      for (var j = i + 1; j < figs.length; j++) {
        var a = figs[i], c = figs[j];
        var dx = c.x - a.x, dy = c.y - a.y;
        var d = Math.hypot(dx, dy) || .001, min = fr * 2;
        if (d < min) {
          var p = (min - d) / 2, nx = dx / d, ny = dy / d;
          a.x -= nx * p; a.y -= ny * p;
          c.x += nx * p; c.y += ny * p;
        }
      }
    }
  }

  /* ---------- 场景淡色几何线条装饰（少量，不可穿过） ---------- */
  function makeDecos(w, h, n) {
    var out = [], colors = ['#8fb8dd','#b7a6d8','#8fcfc3','#d8b98f','#cf9fb2'];
    for (var i = 0; i < n; i++) {
      var cx = rnd(w * .12, w * .88), cy = rnd(h * .14, h * .86);
      var kind = Math.floor(Math.random() * 3);
      out.push({ x: cx, y: cy, r: rnd(22, 38), kind: kind,
        rot: Math.random() * 6.28, color: colors[i % colors.length], ph: Math.random() * 6.28 });
    }
    return out;
  }
  function decoCollide(p, pr) {
    if (!S.decos) return;
    S.decos.forEach(function (d) {
      var dx = p.x - d.x, dy = p.y - d.y, dist = Math.hypot(dx, dy) || .001;
      var min = pr + d.r * .6;
      if (dist < min) { p.x = d.x + dx / dist * min; p.y = d.y + dy / dist * min; }
    });
  }
  function drawDecos() {
    if (!S.decos) return;
    S.decos.forEach(function (d) {
      ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.rot + Math.sin(S.time * .3 + d.ph) * .04);
      ctx.strokeStyle = d.color; ctx.globalAlpha = .24; ctx.lineWidth = 1.8;
      ctx.beginPath();
      if (d.kind === 0) { // 三角
        ctx.moveTo(0, -d.r); ctx.lineTo(d.r * .86, d.r * .5); ctx.lineTo(-d.r * .86, d.r * .5); ctx.closePath();
      } else if (d.kind === 1) { // 方框
        ctx.rect(-d.r * .7, -d.r * .7, d.r * 1.4, d.r * 1.4);
      } else { // 菱形
        ctx.moveTo(0, -d.r); ctx.lineTo(d.r * .7, 0); ctx.lineTo(0, d.r); ctx.lineTo(-d.r * .7, 0); ctx.closePath();
      }
      ctx.stroke(); ctx.restore();
    });
  }

  function txt(pair) { return pair ? (pair[lang] || pair.zh || '') : ''; }
  // 单局内不重复：每个领域 / 偏见 / 事实各自维护已用索引
  function takePair(key) {
    var pool = key === 'biased' ? BIASED : key === 'factual' ? FACTUAL : DOMMAP[key].inclined;
    var used = S.used[key] || (S.used[key] = []);
    var avail = [], i;
    for (i = 0; i < pool.length; i++) if (used.indexOf(i) < 0) avail.push(i);
    if (!avail.length) { used.length = 0; for (i = 0; i < pool.length; i++) avail.push(i); }
    var idx = pick(avail); used.push(idx);
    return pool[idx];
  }
  function hide(id) { $(id).classList.add('hidden'); }
  function show(id) { $(id).classList.remove('hidden'); }
  function toast(msg) {
    var el = document.createElement('div'); el.className = 'toast'; el.style.fontSize='12px'; el.textContent = msg;
    $('toasts').appendChild(el); setTimeout(function () { el.remove(); }, 1650);
  }
  function veilSwap(fn) {
    $('veil').style.opacity = '1';
    setTimeout(function () { fn(); $('veil').style.opacity = '0'; }, 620);
  }
  // layer changes: slow fade through a warm haze (~0.5s each way)
  function hardSwap(fn) {
    $('cut').style.opacity = '1';
    setTimeout(function () {
      fn();
      $('cut').style.opacity = '0';
    }, 500);
  }
  function enterCharLayer() { S.layer = 'char'; document.body.classList.add('char'); cv.style.filter = ''; }
  function exitCharLayer() { S.layer = 'scene'; document.body.classList.remove('char'); }
  function setStats(txt) { $('hudStats').textContent = txt || ''; }
  function setHint(txt) { $('hudHint').textContent = txt || ''; }
  function addAch(name) {
    if (S && S.ach.indexOf(name) < 0) { S.ach.push(name); S.newAch = name; }
    var all = achAll();
    if (all.indexOf(name) < 0) { all.push(name); achSave(all); }
    renderMenuAch();   // 成就库跨局同步
  }

  /* ---------- primitives ---------- */
  function seg(x1, y1, x2, y2, color, alpha, w) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color || LINE; ctx.lineWidth = w || 1;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
  }
  function ring(x, y, r, color, alpha, w, dash) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color || LINE; ctx.lineWidth = w || 1;
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke(); ctx.restore();
  }
  function poly(x, y, r, n, rot, color, alpha, fill) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color || LINE; ctx.lineWidth = 1;
    ctx.beginPath();
    for (var i = 0; i < n; i++) {
      var a = rot + i / n * Math.PI * 2;
      var px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    ctx.stroke(); ctx.restore();
  }
  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
  }
  function shapeGlyph(x, y, r, shape, color) {
    ctx.save(); ctx.globalAlpha = .68; ctx.strokeStyle = color; ctx.lineWidth = 1;
    ctx.beginPath();
    if (shape === 'circle') ctx.arc(x, y, r, 0, 7);
    else if (shape === 'square') ctx.rect(x - r, y - r, r * 2, r * 2);
    else if (shape === 'diamond') { ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath(); }
    else if (shape === 'triangle') { ctx.moveTo(x, y - r); ctx.lineTo(x + r * .9, y + r * .7); ctx.lineTo(x - r * .9, y + r * .7); ctx.closePath(); }
    else { for (var i = 0; i < 6; i++) { var a = i / 6 * Math.PI * 2; var px = x + Math.cos(a) * r, py = y + Math.sin(a) * r; if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); } ctx.closePath(); }
    ctx.stroke(); ctx.restore();
  }
  // 最终形象（v5 定稿）：圆头+锥身无缝拼接（头:身=1:0.75）+ 圆柱短腿 + 无手无嘴
  // 实心填充（o.fill，传 '' 则仅描边幽灵）；表情=纵向细椭圆眼变形；帽子唯一彩色
  function drawChar(x, y, h, o) {
    o = o || {};
    var kind = o.hat || 'plain', color = o.color || '#8fb8dd';
    var state = o.state || 'idle', walk = o.walk || 0;
    var ink = o.ink || '#566370', alpha = o.alpha === undefined ? 1 : o.alpha;   // 低饱和蓝灰，非最暗
    var sel = !!o.sel, t = S ? S.time : 0, ph = o.ph || 0;
    var lw = o.lw || Math.max(1.5, h * .034);
    if (sel) lw *= 1.3;
    var fill = o.fill === undefined ? '#FFFFFF' : o.fill;

    // 姿态（先于几何：crouch 影响比例）
    var lean = 0, bob = 0, crouch = o.crouch || 0, legPhase = 0;
    if (state === 'walk') {
      lean = .07; legPhase = Math.sin(walk); bob = -Math.abs(legPhase) * h * .03;
    } else if (state === 'interact') {
      lean = .10; bob = -Math.abs(Math.sin(t * 2 + ph)) * h * .05;
    } else if (state === 'attack') {
      lean = .34; crouch = Math.max(crouch, .30);
    } else {
      lean = Math.sin(t * 1.1 + ph) * .02;
    }
    var blink = (state === 'idle' || state === 'walk') && ((t * .7 + ph * .37) % 3.4) < .14;

    // 比例：腿 10% + 锥身 38.5% + 圆头（直径≈52%），身=0.75×头直径
    var legH = h * .10 * (1 - crouch * .44);
    var coneH = h * .385 * (1 - crouch * .14);
    var hr = h * .26, bw = h * .37 * (1 - crouch * .10), nw2 = bw * .20;
    var baseY = -legH, neckY = baseY - coneH;
    var headCy = neckY - Math.sqrt(hr * hr - nw2 * nw2);

    // 眼睛变形（纵向细椭圆）
    var ERX = hr * .13, ERY = hr * .20, esx = 1, esy = 1, erot = 0;
    if (state === 'interact') { esy = .42; esx = 1.15; erot = .22; }
    else if (state === 'attack') { esx = 1.7; esy = 1.35; }
    else if (blink) { esy = .14; esx = 1.3; }
    else if (state === 'walk') { esx = .92; esy = .92; }

    ctx.save();
    ctx.translate(x, y + bob);
    ctx.globalAlpha = alpha;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    var T = function (px, py) { return px + lean * (-py) * .5; };
    // 自然脚下阴影：柔和椭圆，随身高缩放（开始界面 hero 也适用）
    ctx.save();
    ctx.globalAlpha = alpha * .18;
    var sg = ctx.createRadialGradient(0, 2, 0, 0, 2, h * .22);
    sg.addColorStop(0, 'rgba(120,140,165,.55)');   // 淡色阴影，不遮挡身体
    sg.addColorStop(1, 'rgba(120,140,165,0)');
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.ellipse(0, 2, h * .22, h * .045, 0, 0, 7); ctx.fill();
    ctx.restore();

    // 1) 头身拼接轮廓：左锥边 → 绕过头顶的圆弧 → 右锥边 → 底边
    var b = .55;
    var aL = Math.atan2(neckY - headCy, -nw2), aR = Math.atan2(neckY - headCy, nw2);
    var endA = aR + Math.PI * 2;
    var pts = [], i, a, u, t2, mt;
    var bezTo = function (p0, p1, p2, p3, n) {
      for (u = 0; u <= n; u++) {
        t2 = u / n; mt = 1 - t2;
        var py = mt * mt * mt * p0.y + 3 * mt * mt * t2 * p1.y + 3 * mt * t2 * t2 * p2.y + t2 * t2 * t2 * p3.y;
        var pxl = mt * mt * mt * p0.x + 3 * mt * mt * t2 * p1.x + 3 * mt * t2 * t2 * p2.x + t2 * t2 * t2 * p3.x;
        pts.push([T(pxl, py), py]);
      }
    };
    bezTo({ x: -bw / 2, y: baseY }, { x: -bw / 2 - b * bw * .15, y: baseY - coneH * .35 },
          { x: -nw2 - b * nw2 * 1.6, y: neckY + coneH * .25 }, { x: -nw2, y: neckY }, 12);
    for (i = 0; i <= 22; i++) {
      a = aL + (endA - aL) * i / 22;
      pts.push([T(Math.cos(a) * hr, headCy + Math.sin(a) * hr), headCy + Math.sin(a) * hr]);
    }
    bezTo({ x: nw2, y: neckY }, { x: nw2 + b * nw2 * 1.6, y: neckY + coneH * .25 },
          { x: bw / 2 + b * bw * .15, y: baseY - coneH * .35 }, { x: bw / 2, y: baseY }, 12);
    pts.push([T(-bw / 2, baseY), baseY]);
    ctx.strokeStyle = ink; ctx.lineWidth = lw;
    ctx.beginPath();
    for (i = 0; i < pts.length; i++) { if (i === 0) ctx.moveTo(pts[i][0], pts[i][1]); else ctx.lineTo(pts[i][0], pts[i][1]); }
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    ctx.stroke();

    // 2) 圆柱短腿（无手，实心）
    var lSpread = bw * .22 * (1 + crouch * .5), legW = h * .045;
    var liftL = state === 'walk' ? Math.max(0, legPhase) * h * .025 : 0;
    var liftR = state === 'walk' ? Math.max(0, -legPhase) * h * .025 : 0;
    var offL = state === 'walk' ? legPhase * h * .035 : 0;
    var offR = state === 'walk' ? -legPhase * h * .035 : 0;
    ctx.lineWidth = lw;
    roundRect(ctx, T(-lSpread + offL, baseY) - legW / 2, baseY - liftL, legW, legH + liftL, legW * .4);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    ctx.stroke();
    roundRect(ctx, T(lSpread + offR, baseY) - legW / 2, baseY - liftR, legW, legH + liftR, legW * .4);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    ctx.stroke();
    ctx.lineWidth = lw * .7; ctx.globalAlpha = alpha * .7;
    ctx.beginPath(); ctx.moveTo(T(-lSpread + offL, baseY) - legW / 2, 0); ctx.lineTo(T(-lSpread + offL, baseY) + legW / 2, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(T(lSpread + offR, baseY) - legW / 2, 0); ctx.lineTo(T(lSpread + offR, baseY) + legW / 2, 0); ctx.stroke();
    ctx.globalAlpha = alpha;

    // 3) 纵向细椭圆眼（无嘴）
    var eyeY = headCy + hr * .04, ex = hr * .30;
    ctx.fillStyle = ink;
    for (var s2 = -1; s2 <= 1; s2 += 2) {
      ctx.beginPath();
      ctx.ellipse(T(s2 * ex, eyeY), eyeY, ERX * esx, ERY * esy, erot * s2, 0, 6.283);
      ctx.fill();
    }

    // 4) 帽子：唯一彩色元素，戴在圆头顶
    if (kind !== 'plain') hat(T(0, headCy - hr * .92), headCy - hr * .92, kind, color, hr / 34, ink, lw);
    ctx.restore();
  }
  function figure(x, y, h, color, walk, bright) {
    drawChar(x, y, h, { hat: 'plain', color: '#ffffff', ink: color || LINE_HI, fill: '',
      walk: walk, state: 'idle', lw: bright ? 1.5 : 1, alpha: bright ? .95 : .7 });
  }
  // 白纸层（body.char）上的文字用暗色，深色层用亮色
  function inkColor() { return document.body.classList.contains('char') ? '#2A2A2E' : TEXT; }
  function tag(text, x, y, color) {
    var onPaper = document.body.classList.contains('char');
    ctx.save(); ctx.font = '300 15px Jost, "Noto Sans SC", sans-serif';   // 与主界面 UI 同款细体
    var w = Math.min(280, ctx.measureText(text).width + 26);
    var h = 32, bx = x - w / 2, by = y - h;
    ctx.fillStyle = onPaper ? 'rgba(253,252,250,0.9)' : 'rgba(6,11,18,0.78)';
    ctx.fillRect(bx, by, w, h);
    ctx.strokeStyle = color || LINE; ctx.globalAlpha = onPaper ? .8 : .6; ctx.lineWidth = 1.2;
    ctx.strokeRect(bx + .5, by + .5, w - 1, h - 1);
    ctx.globalAlpha = 1; ctx.fillStyle = onPaper ? '#2A2A2E' : TEXT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, x, by + h / 2 + 1, w - 16);
    seg(x, by + h, x, by + h + 8, color || LINE, onPaper ? .55 : .4, 1.2);
    ctx.restore();
  }
  function halo(x, y, color) { S.halos.push({ x: x, y: y, r: 6, life: .26, color: color || LINE_HI }); }
  function ghost(x, y, h, color, shape) { S.ghosts.push({ x: x, y: y, h: h, color: color, shape: shape, life: .5 }); }
  function stepEphemera(dt) {
    S.halos.forEach(function (o) { o.life -= dt; o.r += dt * 60; });
    S.halos = S.halos.filter(function (o) { return o.life > 0; });
    S.ghosts.forEach(function (o) { o.life -= dt; });
    S.ghosts = S.ghosts.filter(function (o) { return o.life > 0; });
    S.inkFades.forEach(function (o) { o.life -= dt; });
    S.inkFades = S.inkFades.filter(function (o) { return o.life > 0; });
    S.fx.forEach(function (o) { o.life -= dt; });
    S.fx = S.fx.filter(function (o) { return o.life > 0; });
    if (S.flash > 0) S.flash = Math.max(0, S.flash - dt);
  }
  function drawEphemera() {
    S.halos.forEach(function (o) { ring(o.x, o.y, o.r, o.color, Math.max(0, o.life / .26) * .5, 1); });
    S.ghosts.forEach(function (o) {
      var k = Math.max(0, o.life / .5);
      ctx.save(); ctx.globalAlpha = k;
      figure(o.x, o.y, o.h * k, o.color, 0, false);
      if (o.shape) shapeGlyph(o.x, o.y - o.h * k - 10, 5, o.shape, o.color);
      ctx.restore();
    });
  }
  function backdrop(camx, camy, theme) {
    var g = ctx.createLinearGradient(0, 0, 0, view.h);
    g.addColorStop(0, '#080e18'); g.addColorStop(1, '#030509');
    ctx.fillStyle = g; ctx.fillRect(0, 0, view.w, view.h);
    // 《光遇》式弥散柔光：光源没有边界，只染亮一小片空气，并极缓慢呼吸
    var m = moodOf(), breath = .55 + Math.sin(S.time * .32) * .2;
    for (var k = 0; k < 3; k++) {
      var gx = view.w * (.22 + k * .3) + Math.sin(S.time * .07 + k) * 42;
      var gy = view.h * (.26 + (k % 2) * .38) + Math.cos(S.time * .05 + k) * 28;
      var rr = Math.min(view.w, view.h) * (.3 + k * .08);
      var rg = ctx.createRadialGradient(gx, gy, 0, gx, gy, rr);
      rg.addColorStop(0, 'rgba(' + m[0] + ',' + m[1] + ',' + m[2] + ',' + (.05 * breath) + ')');
      rg.addColorStop(1, 'rgba(' + m[0] + ',' + m[1] + ',' + m[2] + ',0)');
      ctx.fillStyle = rg; ctx.fillRect(0, 0, view.w, view.h);
    }
    // 极薄暖雾层：不具象，只是空气感
    var fg = ctx.createRadialGradient(view.w * .5 + Math.sin(S.time * .04) * 90, view.h * .72, 0,
      view.w * .5, view.h * .72, Math.max(view.w, view.h) * .85);
    fg.addColorStop(0, 'rgba(232,218,206,0.035)'); fg.addColorStop(1, 'rgba(232,218,206,0)');
    ctx.fillStyle = fg; ctx.fillRect(0, 0, view.w, view.h);
    ctx.strokeStyle = 'rgba(160,195,230,0.035)'; ctx.lineWidth = 1;
    var st = 76, ox = ((-camx * .18) % st + st) % st, oy = ((-camy * .18) % st + st) % st;
    for (var x = ox; x < view.w; x += st) seg(x, 0, x, view.h, 'rgba(160,195,230,0.035)', 1, 1);
    for (var y = oy; y < view.h; y += st) seg(0, y, view.w, y, 'rgba(160,195,230,0.035)', 1, 1);
    S.frags.forEach(function (f) {
      var px = ((f.x - camx * f.d) % (view.w + 200) + view.w + 200) % (view.w + 200) - 100;
      var py = ((f.y - camy * f.d + S.time * f.sp * 3) % (view.h + 200) + view.h + 200) % (view.h + 200) - 100;
      poly(px, py, f.r, f.n, f.rot + S.time * f.sp, theme || LINE, f.a);
    });
  }
  function fog(cx, cy, r) {
    var g = ctx.createRadialGradient(cx, cy, r * .55, cx, cy, r * 1.55);
    g.addColorStop(0, 'rgba(3,6,11,0)'); g.addColorStop(1, 'rgba(3,6,11,0.88)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, view.w, view.h);
    ctx.save(); ctx.globalAlpha = .22; ctx.setLineDash([2, 7]);
    ctx.strokeStyle = LINE_HI; ctx.lineWidth = 1;
    ctx.strokeRect(cx - r, cy - r, r * 2, r * 2); ctx.restore();
  }

  /* ---------- character layer : ink on white paper ---------- */
  function paperFill() {
    var g = ctx.createLinearGradient(0, 0, view.w, view.h);
    g.addColorStop(0, '#FDF8F2'); g.addColorStop(1, '#F5F0EA');
    ctx.fillStyle = g; ctx.fillRect(0, 0, view.w, view.h);
    var lg = ctx.createRadialGradient(view.w * .08, view.h * .06, 0, view.w * .08, view.h * .06, Math.max(view.w, view.h) * .8);
    lg.addColorStop(0, 'rgba(255,246,228,0.5)'); lg.addColorStop(1, 'rgba(255,246,228,0)');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, view.w, view.h);
  }
  function paperBackdrop() {
    paperFill();
    ctx.strokeStyle = 'rgba(20,20,20,0.10)'; ctx.lineWidth = 1;
    for (var x = 0; x <= view.w; x += UNIT) { ctx.beginPath(); ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, view.h); ctx.stroke(); }
    for (var y = 0; y <= view.h; y += UNIT) { ctx.beginPath(); ctx.moveTo(0, y + .5); ctx.lineTo(view.w, y + .5); ctx.stroke(); }
  }
  function paperWash() {
    if (S.paperWash <= 0) return;
    var a = Math.min(.85, S.paperWash);
    ctx.fillStyle = 'rgba(0,0,0,' + a + ')';
    ctx.fillRect(0, 0, view.w, view.h);
  }
  function mixRGB(a, b, t) {
    return 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * t) + ',' +
      Math.round(a[1] + (b[1] - a[1]) * t) + ',' + Math.round(a[2] + (b[2] - a[2]) * t) + ')';
  }
  function hat(x, baseY, kind, color, s, ink, lw) {
    s = s || 1; ctx.save(); ctx.translate(x, baseY); ctx.scale(s, s);
    ctx.fillStyle = color; ctx.strokeStyle = ink || '#1E1E20';
    ctx.lineWidth = (lw || 2) / s; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    function shape(fn) {
      ctx.beginPath(); fn(); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.globalAlpha *= .16; ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.restore();
      ctx.stroke();
    }
    if (kind === 'round') {
      shape(function () { ctx.arc(0, 0, 11, Math.PI, 0); ctx.lineTo(11, 0); ctx.lineTo(-11, 0); });
      shape(function () { ctx.rect(-13, -1, 26, 2.5); });
    } else if (kind === 'cap') {
      shape(function () { ctx.arc(0, 0, 9.5, Math.PI, 0); ctx.lineTo(9.5, 0); ctx.lineTo(-9.5, 0); });
      shape(function () { ctx.rect(-9.5, -1, 26, 2.5); });
    } else if (kind === 'top') {
      shape(function () { ctx.rect(-8, -22, 16, 22); });
      shape(function () { ctx.rect(-15, -1.5, 30, 3); });
    } else if (kind === 'wide') {
      shape(function () { ctx.arc(0, 0, 9.5, Math.PI, 0); ctx.lineTo(9.5, 0); ctx.lineTo(-9.5, 0); });
      shape(function () { ctx.rect(-17, -1, 34, 2.5); });
    } else if (kind === 'beanie') {
      shape(function () { ctx.arc(0, 1, 11, Math.PI, 0); ctx.lineTo(11, 1); ctx.lineTo(-11, 1); });
      shape(function () { ctx.rect(-12, -1.5, 24, 4); });
    } else if (kind === 'bowler') {
      shape(function () { ctx.arc(0, 0, 10.5, Math.PI, 0); ctx.lineTo(10.5, 0); ctx.lineTo(-10.5, 0); });
      shape(function () { ctx.rect(-14, -1, 28, 2.5); });
    } else if (kind === 'spike') {
      shape(function () { ctx.moveTo(0, -20); ctx.lineTo(11, 0); ctx.lineTo(-11, 0); });
    } else if (kind === 'square') {
      shape(function () { ctx.rect(-9, -12, 18, 12); });
    } else if (kind === 'diamond') {
      shape(function () { ctx.moveTo(0, -21); ctx.lineTo(10, -8); ctx.lineTo(0, 3); ctx.lineTo(-10, -8); });
    } else {
      shape(function () { ctx.arc(0, 0, 9.5, Math.PI, 0); ctx.lineTo(9.5, 0); ctx.lineTo(-9.5, 0); });
      shape(function () { ctx.rect(-12, -1, 24, 2.5); });
    }
    ctx.restore();
  }
  function inkFigure(x, y, h, kind, color, walk, sel, baseState, fill, ink) {
    drawChar(x, y, h, { hat: kind, color: color, ink: ink || '#566370', fill: fill || '#FBF6F0', walk: walk,
      state: sel ? 'interact' : (baseState || 'idle'), sel: sel, ph: x });
  }
  function inkBubble(text, x, y, alpha) {
    ctx.save(); ctx.globalAlpha = alpha === undefined ? 1 : alpha;
    ctx.font = '300 13px Jost, "Noto Sans SC", sans-serif';   // 与主界面 UI 同款细体
    var w = Math.min(220, ctx.measureText(text).width + 16), h = 24;
    var bx = x - w / 2, by = y - h - 8;
    ctx.fillStyle = '#ffffff'; ctx.fillRect(bx, by, w, h);
    ctx.strokeStyle = '#141414'; ctx.lineWidth = 1; ctx.strokeRect(bx + .5, by + .5, w - 1, h - 1);
    ctx.beginPath(); ctx.moveTo(x - 4, by + h); ctx.lineTo(x, by + h + 6); ctx.lineTo(x + 4, by + h); ctx.closePath();
    ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#141414'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, x, by + h / 2 + 1, w - 10); ctx.restore();
  }
  function nameTag(text, x, y) {
    ctx.save(); ctx.font = '9px -apple-system, PingFang SC, sans-serif'; ctx.fillStyle = '#141414';
    ctx.textAlign = 'center'; ctx.fillText(text, x, y); ctx.restore();
  }

  /* ---------- narration ---------- */
  var narrCb = null;
  function narrate(step, title, lines, stats, cb) {
    $('narrStep').textContent = step; $('narrTitle').textContent = title;
    $('narrLines').innerHTML = lines;
    if (stats && stats.length) {
      $('narrStats').innerHTML = stats.map(function (s) { return '<div class="st"><b>' + s.v + '</b>' + s.k + '</div>'; }).join('');
      show('narrStats');
    } else hide('narrStats');
    narrCb = cb || null; show('scrNarr');
  }
  $('btnNarr').onclick = function () { hide('scrNarr'); var cb = narrCb; narrCb = null; if (cb) cb(); };

  /* ---------- 故事幕布：白幕 w* / 黑幕 f*，替代原关卡提示 ---------- */
  function showStory(key, theme, cb) {
    var paras = Array.isArray(key) ? key : (TXT[key] || []);
    var run = function () { if (cb) cb(); };
    if (!Story || !paras.length) { run(); return; }
    Story.playStoryText(paras, {
      theme: theme || 'light',
      maskIn: 1000, inDuration: 1500, gap: 550,
      textOut: 1300, maskOut: 1000
    }).then(run);
  }
  // 幕布点击/按键推进（不跳过内容，只加速停驻等待）
  document.addEventListener('pointerdown', function (e) {
    if (Story && e.target && e.target.closest && e.target.closest('#storyOverlay')) storyClickAdvance();
  });
  document.addEventListener('keydown', function (e) {
    if (Story && Story._waiting) storyClickAdvance();
  });

  /* ---------- input ---------- */
  var keyMap = {
    KeyW: [0, -1], ArrowUp: [0, -1], KeyS: [0, 1], ArrowDown: [0, 1],
    KeyA: [-1, 0], ArrowLeft: [-1, 0], KeyD: [1, 0], ArrowRight: [1, 0]
  };
  window.addEventListener('keydown', function (e) {
    if (e.code in keyMap) { input.keys[e.code] = true; e.preventDefault(); }
    if (e.code === 'KeyE' || e.code === 'Space') { e.preventDefault(); interact(); }
    if (e.code === 'Escape') { e.preventDefault(); if (!$('scrPause').classList.contains('hidden')) resume(); else if (running) pause(); }
  });
  window.addEventListener('keyup', function (e) { if (e.code in keyMap) input.keys[e.code] = false; });
  $('btnAct').onclick = function () { interact(); };
  var joyId = null;
  function joyMove(e) {
    if (e.pointerId !== joyId) return;
    var r = $('joystick').getBoundingClientRect();
    var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    var len = Math.hypot(dx, dy) || 1, max = 42, s = Math.min(len, max) / len;
    dx *= s; dy *= s;
    $('stick').style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    input.x = dx / max; input.y = dy / max;
  }
  $('joystick').addEventListener('pointerdown', function (e) { joyId = e.pointerId; $('joystick').setPointerCapture(e.pointerId); joyMove(e); });
  $('joystick').addEventListener('pointermove', joyMove);
  function joyEnd(e) { if (e.pointerId !== joyId) return; joyId = null; $('stick').style.transform = ''; input.x = 0; input.y = 0; }
  $('joystick').addEventListener('pointerup', joyEnd);
  $('joystick').addEventListener('pointercancel', joyEnd);
  function readDir() {
    var x = input.x, y = input.y;
    for (var k in keyMap) if (input.keys[k]) { x += keyMap[k][0]; y += keyMap[k][1]; }
    var m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; }
    return { x: x, y: y };
  }
  function pause() { if (!running) return; paused = true; show('scrPause'); }
  function resume() { paused = false; hide('scrPause'); }
  $('btnPause').onclick = pause;
  $('btnResume').onclick = resume;
  $('btnRestart').onclick = function () { hide('scrPause'); startGame(); };
  $('btnHelp').onclick = function () { show('scrHelp'); };
  $('btnHelp2').onclick = function () { show('scrHelp'); };
  $('btnHelpClose').onclick = function () { hide('scrHelp'); };
  $('btnLang').onclick = function () {
    lang = lang === 'zh' ? 'en' : 'zh';
    $('btnLang').textContent = '语言 LANG : ' + (lang === 'zh' ? '中文' : 'EN');
    if (S) S.figures.forEach(function (f) { f.text = txt(f.pair); });
    toast(lang === 'zh' ? '语言已切换为中文' : 'LANGUAGE : ENGLISH');
  };
  $('btnSound').onclick = function () {
    muted = !muted; Snd.setMuted(muted);
    if (BGM) BGM.setVolume(muted ? 0 : (bgmOn ? bgmVol : 0));
    if (SFX) SFX.setVolume(muted || !sfxOn ? 0 : 0.4);
    $('btnSound').textContent = '声音 SOUND : ' + (muted ? 'OFF' : 'ON');
  };
  $('btnGallery').onclick = function () { renderMenuAch(); show('startArchive'); };
  $('btnArchiveClose').onclick = function () { hide('startArchive'); };

  /* ---------- 设置：BGM 音量/开关、音效开关、增强氛围 ---------- */
  var bgmOn = true, sfxOn = true, bgmVol = 1.0;
  $('btnBgmToggle').onclick = function () {
    bgmOn = !bgmOn;
    this.textContent = bgmOn ? '开' : '关';
    this.classList.toggle('on', bgmOn);
    if (BGM) BGM.setVolume(bgmOn ? bgmVol : 0);
  };
  $('bgmVol').oninput = function () {
    bgmVol = parseInt(this.value, 10) / 100;
    if (bgmOn && BGM) BGM.setVolume(bgmVol);
  };
  $('btnSfxToggle').onclick = function () {
    sfxOn = !sfxOn;
    this.textContent = sfxOn ? '开' : '关';
    this.classList.toggle('on', sfxOn);
    if (SFX) SFX.setVolume(sfxOn ? 0.4 : 0);
  };
  $('btnAmbient').onclick = function () {
    if (window.FX) window.FX.beatMode = !window.FX.beatMode;
    var on = window.FX && window.FX.beatMode;
    this.textContent = on ? '开' : '关';
    this.classList.toggle('on', on);
  };

  /* ---------- 开发者模式：全局跳关按钮 ---------- */
  var devMode = false;
  $('btnDev').onclick = function () {
    devMode = !devMode;
    $('btnDev').textContent = '开发者模式 · DEV : ' + (devMode ? 'ON' : 'OFF');
    // 跳关图标只在游戏进行中显示，开始界面不显示
    var inGame = S && S.scene && S.scene !== 'menu' && S.scene !== 'end';
    $('btnDevNext').classList.toggle('hidden', !devMode || !inGame);
    toast(devMode ? '开发者模式开启 · DEV ON' : '开发者模式关闭 · DEV OFF');
  };
  $('btnDevNext').onclick = function () { devNext(); };
  // 调试钩子（供自动化测试读取内部状态）
  window.__dbg = function () {
    return { scene: S ? S.scene : '-', running: running,
      anim: S && S.anim ? (Math.round(S.anim.t * 10) / 10 + '/' + S.anim.dur) : '-' };
  };
  window.__bgmDbg = function () { return BGM ? { level: BGM._level, src: BGM._src, unlocked: BGM._unlocked } : 'no-bgm'; };
  window.__bgmPaused = function () { return BGM ? BGM.audio.paused : null; };
  window.__bgmVol = function () { return BGM ? BGM._volume : null; };
  // Android 返回键：暂停/继续（与 Esc 行为一致）
  window.__getPlayerPos = function () { return { x: S.player.x, y: S.player.y }; };
  window.__teleportPlayer = function (x, y) { S.player.x = x; S.player.y = y; };
  window.__dbgAb = function () { var n=0; for (var k in S.ab) n += S.ab[k]; return n; };
  window.__androidPause = function () {
    if (!$('scrPause').classList.contains('hidden')) { resume(); return true; }
    if (running && !paused) { pause(); return true; }
    return true;
  };
  window.__sfxDbg = function () { return SFX ? Object.keys(SFX._pool) : 'no-sfx'; };
  window.__story = Story;
  function devNext() {
    if (!S || !running) return;
    var sc = S.scene;
    // 跳到"下一关的幕布之前"：走正规过关流程，先播放对应白幕，不跳过幕布环节
    if (sc === 'a1') {
      // 模拟传送之眼达标：直接触发第一关成功 -> w2 白幕
      AB.forEach(function (a) { S.ab[a.id] = Math.max(S.ab[a.id], 5); });
      renderAbilities();
      veilSwap(function () { showStory('w2', 'light', function () { hardSwap(function () { initA2('collect'); }); }); });
    } else if (sc === 'a2') {
      // 第二关成功 -> w3 白幕
      veilSwap(function () { showStory('w3', 'light', function () { hardSwap(function () { initA2('gate'); }); }); });
    } else if (sc === 'gate') {
      // 第三关成功 -> a3 过场（universe BGM + 星云/流星 + w5/w6 幕布）
      hardSwap(function () { startA3(true); });
    } else if (sc === 'a3') {
      // 快进归途动画到流星抵达，但仍走 w5/w6 幕布
      if (S.anim) S.anim.t = Math.max(S.anim.t, 5.6);
    } else if (sc === 'b2') {
      b2Win();   // 第四关成功 -> 结局揭晓（正常幕布）
    }
  }

  /* ============================================================
     A1 — THE CORRIDOR
     ============================================================ */
  function initA1() {
    exitCharLayer();
    var n = 1 + Math.floor(Math.random() * 3);
    shuffle(AB.slice()).slice(0, n).forEach(function (a) { S.ab[a.id] += 1 + Math.floor(Math.random() * 3); });
    S.cw = Math.max(view.w + 400, 46 * UNIT);
    S.decos = makeDecos(S.cw, view.h, 14);
    S.figures = []; S.player.x = S.cw / 2; S.player.y = walkY(); S.player.walk = 0;
    S.cam = { x: 0, y: 0 };
    for (var i = 0; i < 13; i++) spawnA1();
    maintainA1(); setScene('a1'); renderAbilities(); showEye(); setStats('收集 · 全部能力到 5');
  }
  function walkY() { return view.h / 2; }
  function walkBand() { return Math.max(90, view.h * .24); }   // 加宽后的活动范围（上下）
  function makeA1(forceId, far) {
    var id = forceId || weighted(AB, function (a) { return 1 + S.ab[a.id] * 1.5; }).id;
    var lo = 50, hi = Math.max(70, S.cw - 50), x = rnd(lo, hi);
    if (far && S.player) {
      for (var t = 0; t < 24 && Math.abs(x - S.player.x) < 260; t++) x = rnd(lo, hi);
    }
    var band = walkBand() - 30;
    return { id: idSeq++, kind: 'ability', aid: id, x: x,
      y: walkY() + rnd(-band, band), dir: Math.random() < .5 ? -1 : 1, sp: rnd(20, 42), ph: rnd(0, 7) };
  }
  function spawnA1(id) { S.figures.push(makeA1(id)); }
  function maintainA1() {
    S.figures = S.figures.filter(function (f) { return !f.dead; });
    AB.forEach(function (a) { if (!S.figures.some(function (f) { return f.aid === a.id; })) S.figures.push(makeA1(a.id)); });
    while (S.figures.length < 10) S.figures.push(makeA1(null, true));
    while (S.figures.length > 15) {
      var c = {}; S.figures.forEach(function (f) { c[f.aid] = (c[f.aid] || 0) + 1; });
      var idx = -1;
      for (var i = 0; i < S.figures.length; i++) if (c[S.figures[i].aid] > 1) { idx = i; break; }
      if (idx < 0) break; S.figures.splice(idx, 1);
    }
  }
  function updateA1(dt) {
    var d = readDir(), p = S.player, band = walkBand();
    S.moving = Math.abs(d.x) > .05 || Math.abs(d.y) > .05;
    if (S.moving) {
      p.x = clamp(p.x + d.x * 245 * dt, 30, S.cw - 30);
      p.y = clamp(p.y + d.y * 245 * dt, walkY() - band + 26, walkY() + band - 26);
      p.walk += dt * 10;
    }
    decoCollide(p, 20);   // 装饰物不可穿过
    S.cam.x = clamp(p.x - view.w / 2, 0, Math.max(0, S.cw - view.w));
    S.cam.y = 0;
    var near = null, nd = 999;
    S.figures.forEach(function (f) {
      f.x += f.dir * f.sp * dt;
      if (f.x < 40 || f.x > S.cw - 40) f.dir *= -1;
      f.x = clamp(f.x, 40, S.cw - 40); f.ph += dt * 3;
      var dd = dist(p.x, p.y - 22, f.x, f.y - 18);
      if (dd < nd) { nd = dd; near = f; }
    });
    // 实体碰撞：玩家推挤小人（可拾取判定不受影响），小人之间软分离
    S.figures.forEach(function (f) {
      var hit = bodyCollide(p.x, p.y - 22, 20, f, 13, .78);
      if (hit) { p.x -= hit.nx * hit.push; p.y -= hit.ny * hit.push; }
    });
    separateFigs(S.figures, 13);
    S.figures.forEach(function (f) {
      f.x = clamp(f.x, 40, S.cw - 40);
      f.y = clamp(f.y, walkY() - band + 22, walkY() + band - 22);
    });
    p.x = clamp(p.x, 30, S.cw - 30);
    p.y = clamp(p.y, walkY() - band + 26, walkY() + band - 26);
    S.near = nd < 72 ? near : null;
    var hint = $('nearA1');
    if (S.near) { hint.textContent = 'E / COLLECT  ' + ABMAP[S.near.aid].name; show('nearA1'); }
    else hide('nearA1');
  }
  function corridorFigure(x, y, hatKind, color, h, walk, state) {
    drawChar(x, y, h, { hat: hatKind || 'round', color: color, ink: '#566370', fill: '#FBF9F4',
      walk: walk, state: state || 'walk', ph: x, lw: 1.6 });
  }
  function drawA1() {
    var h = view.h, wy = walkY();
    ctx.fillStyle = '#0B0B0F'; ctx.fillRect(0, 0, view.w, h);
    ctx.save(); ctx.translate(-S.cam.x, 0);
    ctx.fillStyle = '#FBF9F4'; ctx.fillRect(0, 0, S.cw, h);
    ctx.strokeStyle = 'rgba(43,43,43,.06)'; ctx.lineWidth = 1;
    for (var gx = 0; gx <= S.cw; gx += UNIT) { ctx.beginPath(); ctx.moveTo(gx + .5, 0); ctx.lineTo(gx + .5, h); ctx.stroke(); }
    ctx.strokeStyle = '#2B2B2B'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(S.cw, 2); ctx.moveTo(0, h - 2); ctx.lineTo(S.cw, h - 2); ctx.stroke();
    for (var i = 0; i < S.cw / 90; i++) {
      var seed = Math.sin(i * 127.1) * 43758.5453, fr = seed - Math.floor(seed);
      var bx = i * 90 + fr * 26, bh = 34 + fr * 42;
      ctx.fillStyle = 'rgba(95,168,91,' + (.45 + fr * .35) + ')';
      roundRect(ctx, bx, -14, 78, bh, 16); ctx.fill();
      roundRect(ctx, bx + 44, h - bh + 14, 78, bh, 16); ctx.fill();
      ctx.fillStyle = 'rgba(70,130,80,' + (.25 + fr * .2) + ')';
      roundRect(ctx, bx + 20, 10, 44, bh * .6, 12); ctx.fill();
      roundRect(ctx, bx + 64, h - bh * .6 - 10, 44, bh * .6, 12); ctx.fill();
    }
    ctx.strokeStyle = 'rgba(43,43,43,.08)'; ctx.lineWidth = 2; ctx.setLineDash([14, 12]);
    ctx.beginPath(); ctx.moveTo(0, wy); ctx.lineTo(S.cw, wy); ctx.stroke(); ctx.setLineDash([]);
    drawDecos();
    S.figures.slice().sort(function (a, b) { return a.y - b.y; }).forEach(function (f) {
      if (f.dead) return;
      var a = ABMAP[f.aid];
      if (S.near === f) {
        var gg = ctx.createRadialGradient(f.x, f.y - 20, 0, f.x, f.y - 20, 58);
        gg.addColorStop(0, 'rgba(255,226,170,0.3)'); gg.addColorStop(1, 'rgba(255,226,170,0)');
        ctx.fillStyle = gg; ctx.fillRect(f.x - 58, f.y - 78, 116, 116);
      }
      corridorFigure(f.x, f.y + Math.sin(f.ph) * 3, a.hat, a.color, 42, f.ph, S.near === f ? 'interact' : 'walk');
      if (S.near === f) { tag(a.name + ' · ' + a.full, f.x, f.y - 54, a.color); ring(f.x, f.y - 18, 26, a.color, .35, 1, [2, 5]); }
    });
    corridorFigure(S.player.x, S.player.y, 'plain', '#ffffff', 70, S.player.walk,
      S.moving ? 'walk' : (S.near ? 'interact' : 'idle'));
    ctx.restore();
  }
  function renderAbilities() {
    $('abilityPanel').innerHTML = '<div class="panel-title">能力值 · FACULTIES</div>' + AB.map(function (a) {
      return '<div class="num-row"><span>' + a.name + '</span><span class="ab-num">' + S.ab[a.id] + '</span></div>';
    }).join('');
  }
  function showEye() {
    var ready = AB.some(function (a) { return S.ab[a.id] >= 5; });
    if (ready && $('btnEye').classList.contains('hidden')) sfx('eye');
    $('btnEye').classList.toggle('hidden', !ready);
  }
  $('btnEye').onclick = function () {
    var ok = AB.every(function (a) { return S.ab[a.id] >= 5; });
    sfx(ok ? 'open' : 'bad');
    if (ok) veilSwap(function () {
      showStory('w2', 'light', function () { hardSwap(function () { initA2('collect'); }); });
    });
    else {
      var m = pick(AB.filter(function (a) { return S.ab[a.id] < 5; }));
      addAch(ACH_A1[m.id]);
      // 随机未达标能力 -> 对应黑幕 f1..f5
      var fi = { q1:1, q2:2, q3:3, q4:4, q5:5 }[m.id] || 1;
      if (BGM) BGM.playForLevel('fail');
      showStory('f' + fi, 'dark', function () {
        finish(false, '门没有开启 · THE GATE DID NOT OPEN', '传送之眼缓缓合上。镜像里只剩下你，和那条走不到头的白线。', METAPHOR[m.id]);
      });
    }
  };

  /* ============================================================
     A2 / GATE — THE SQUARE
     ============================================================ */
  function initA2(mode) {
    S.mode = mode; S.figures = []; S.gate = null; S.collected = 0;
    S.energy = mode === 'collect' ? 30 : 10; S.counts = {};
    DOM.forEach(function (d) { S.counts[d.id] = 0; }); S.factCount = 0;
    S.decos = makeDecos(WORLD, WORLD, 18);
    S.player.x = WORLD / 2; S.player.y = WORLD / 2 + 60;
    enterCharLayer(); S.paperWash = 0; Snd.setTension(0);
    for (var i = 0; i < 22; i++) spawnOpinion();
    maintainOpinions(); setScene(mode === 'collect' ? 'a2' : 'gate'); renderOpinions();
    setStats(mode === 'collect' ? 'GATHER 00 / 30' : 'STABILITY 00 / 10');
    toast(mode === 'collect' ? '三十种声音 · THIRTY VOICES' : '搭建结界 · BUILD THE GATE');
  }
  function makeOpinion(forceId, forceType) {
    var id, pair, type = null;
    if (S.mode === 'collect') {
      id = forceId || weighted(DOM, function (x) { return 1 + S.counts[x.id] * 2.2; }).id;
      pair = takePair(id);
    } else {
      type = forceType || (Math.random() < .35 ? 'factual' : 'biased');
      pair = takePair(type); id = 'g';
    }
    return { id: idSeq++, kind: 'opinion', fid: id, type: type, pair: pair, text: txt(pair), sel: 0, app: 0, ba: 0,
      x: rnd(60, WORLD - 60), y: rnd(60, WORLD - 60), tx: 0, ty: 0, retarget: 0, ph: rnd(0, 7) };
  }
  function spawnOpinion(id, type) { S.figures.push(makeOpinion(id, type)); }
  function maintainOpinions() {
    if (S.gate) return;
    if (S.mode === 'collect') DOM.forEach(function (d) { if (!S.figures.some(function (f) { return f.fid === d.id; })) S.figures.push(makeOpinion(d.id)); });
    else ['biased', 'factual'].forEach(function (t) { if (!S.figures.some(function (f) { return f.type === t; })) S.figures.push(makeOpinion(null, t)); });
    while (S.figures.length < 22) S.figures.push(makeOpinion());
    while (S.figures.length > 26) {
      var c = {}; S.figures.forEach(function (f) { var k = S.mode === 'collect' ? f.fid : f.type; c[k] = (c[k] || 0) + 1; });
      var idx = -1;
      for (var i = 0; i < S.figures.length; i++) { var k2 = S.mode === 'collect' ? S.figures[i].fid : S.figures[i].type; if (c[k2] > 1) { idx = i; break; } }
      if (idx < 0) break; S.figures.splice(idx, 1);
    }
  }
  function updateA2(dt) {
    var d = readDir(), p = S.player;
    p.x = clamp(p.x + d.x * 205 * dt, 24, WORLD - 24);
    p.y = clamp(p.y + d.y * 205 * dt, 24, WORLD - 24);
    decoCollide(p, 26);   // 装饰物不可穿过
    S.moving = Math.hypot(d.x, d.y) > .05;
    if (S.moving) p.walk += dt * 10;
    S.figures.forEach(function (f) {
      if (f.sel > 0) f.sel -= dt;
      f.app = Math.min(1, (f.app || 0) + dt * 4);
      var vis = dist(f.x, f.y, p.x, p.y) < 210;
      f.ba = clamp((f.ba || 0) + (vis ? dt * 5 : -dt * 5), 0, 1);
      f.ph += dt * 2; f.retarget -= dt;
      if (f.retarget <= 0 || dist(f.x, f.y, f.tx, f.ty) < 14) {
        f.tx = clamp(f.x + rnd(-160, 160), 40, WORLD - 40); f.ty = clamp(f.y + rnd(-160, 160), 40, WORLD - 40); f.retarget = rnd(1.8, 4.2);
      }
      var a = Math.atan2(f.ty - f.y, f.tx - f.x);
      f.x = clamp(f.x + Math.cos(a) * 26 * dt, 36, WORLD - 36);
      f.y = clamp(f.y + Math.sin(a) * 26 * dt, 36, WORLD - 36);
    });
    // 实体碰撞：玩家推挤小人 + 小人软分离
    S.figures.forEach(function (f) {
      var hit = bodyCollide(p.x, p.y - 30, 26, f, 16, .78);
      if (hit) { p.x -= hit.nx * hit.push; p.y -= hit.ny * hit.push; }
    });
    separateFigs(S.figures, 16);
    S.figures.forEach(function (f) { f.x = clamp(f.x, 36, WORLD - 36); f.y = clamp(f.y, 36, WORLD - 36); });
    p.x = clamp(p.x, 24, WORLD - 24); p.y = clamp(p.y, 24, WORLD - 24);
    if (S.gate) {
      S.gate.light = Math.min(1, S.gate.light + dt * 2);
      S.near = dist(p.x, p.y - 46, S.gate.x, S.gate.y) < 110 ? 'gate' : null;
    } else {
      var near = null, nd = 999;
      S.figures.forEach(function (f) { var dd = dist(p.x, p.y - 38, f.x, f.y - 28); if (dd < nd) { nd = dd; near = f; } });
      S.near = nd < 60 ? near : null;
    }
    var hint = $('nearA2');
    if (S.near === 'gate') { hint.textContent = 'E / ENTER THE GATE'; show('nearA2'); }
    else if (S.near) { hint.textContent = 'E / GATHER THIS VOICE'; show('nearA2'); }
    else hide('nearA2');
    if (S.figures.some(function (f) { return f.dead; })) { S.figures = S.figures.filter(function (f) { return !f.dead; }); maintainOpinions(); }
  }
  function viewport10() {
    var vu = 10 * UNIT, sc = Math.min(view.w, view.h) / vu;
    return { sc: sc, ox: (view.w - vu * sc) / 2, oy: (view.h - vu * sc) / 2, vu: vu };
  }
  function setViewport(v) { ctx.setTransform(view.dpr * v.sc, 0, 0, view.dpr * v.sc, v.ox * view.dpr, v.oy * view.dpr); }
  function resetViewport() { ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0); }
  function camOffset() {
    var half = 5 * UNIT;
    return { x: S.player.x - half, y: S.player.y - half };
  }
  function drawPlaza(dark) {
    ctx.fillStyle = dark ? '#05080e' : '#070c15'; ctx.fillRect(0, 0, view.w, view.h);
    var cam = camOffset();
    ctx.save(); ctx.translate(-cam.x, -cam.y);
    for (var i = 0; i <= 30; i++) {
      var q = i * UNIT;
      seg(q, 0, q, WORLD, LINE, dark ? .16 : .2, 1);
      seg(0, q, WORLD, q, LINE, dark ? .16 : .2, 1);
    }
    ctx.restore(); return cam;
  }
  function drawA2() {
    var v = viewport10();
    // —— 世界绘制到离屏画布 ——
    var real = ctx;
    ctx = worldCtx;
    ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    paperFill();
    setViewport(v);
    var cam = camOffset();
    ctx.save(); ctx.translate(-cam.x, -cam.y);
    ctx.fillStyle = '#FBF6F0'; ctx.fillRect(0, 0, WORLD, WORLD);
    ctx.strokeStyle = 'rgba(20,20,20,0.10)'; ctx.lineWidth = 1;
    for (var i = 0; i <= 30; i++) {
      var q = i * UNIT;
      ctx.beginPath(); ctx.moveTo(q + .5, 0); ctx.lineTo(q + .5, WORLD); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, q + .5); ctx.lineTo(WORLD, q + .5); ctx.stroke();
    }
    drawDecos();
    S.inkFades.forEach(function (o) {
      var k = Math.max(0, o.life / .5);
      ctx.save(); ctx.globalAlpha = k;
      inkFigure(o.x, o.y, o.h, o.hat, o.color, 0, false, 'interact'); ctx.restore();   // 收集时开心消散
    });
    S.figures.forEach(function (f) {
      var nearScreen = dist(f.x, f.y, S.player.x, S.player.y) < 5 * UNIT;
      var d = S.mode === 'collect' ? DOMMAP[f.fid] : null;
      var hk = d ? d.hat : 'plain';
      var hc = d ? d.color : '#ffffff';
      ctx.save(); ctx.globalAlpha = f.app === undefined ? 1 : f.app;
      // 第三关：偏见/事实小人内部黑色 + 微弱红光（外观中性，不标身份）
      if (S.mode === 'gate') {
        var glowR = ctx.createRadialGradient(f.x, f.y - 30, 0, f.x, f.y - 30, 40);
        var redPulse = .10 + .06 * Math.sin(S.time * 3 + f.ph);
        glowR.addColorStop(0, 'rgba(200,60,60,' + redPulse + ')');
        glowR.addColorStop(1, 'rgba(200,60,60,0)');
        ctx.fillStyle = glowR; ctx.fillRect(f.x - 40, f.y - 70, 80, 80);
      }
      // 第三关：偏见/事实小人整个锥身内部黑色填充 + 微弱红光；其余为纸白
      inkFigure(f.x, f.y + Math.sin(f.ph) * 2, 54, hk, hc, f.ph, f.sel > 0, 'walk',
        S.mode === 'gate' ? '#141418' : '#FBF6F0',
        S.mode === 'gate' ? '#8a94a6' : null);   // 黑身上用低饱和亮灰线
      ctx.restore();
      if (S.near === f) {
        var gg = ctx.createRadialGradient(f.x, f.y - 22, 0, f.x, f.y - 22, 48);
        gg.addColorStop(0, 'rgba(255,232,196,0.22)'); gg.addColorStop(1, 'rgba(255,232,196,0)');
        ctx.fillStyle = gg; ctx.fillRect(f.x - 48, f.y - 70, 96, 96);
      }
      if (nearScreen && f.ba > 0) inkBubble(txt(f.pair), f.x, f.y - 74, f.ba);
    });
    if (S.gate) drawGate();
    // 第三关：玩家身体内部淡蓝荧光，体现能量
    var isGate = (S.mode === 'gate');
    var pFill = isGate ? '#BFE4FF' : '#FBF6F0';
    if (isGate) {
      var pg = ctx.createRadialGradient(S.player.x, S.player.y - 50, 0, S.player.x, S.player.y - 50, 90);
      pg.addColorStop(0, 'rgba(150,210,255,0.28)'); pg.addColorStop(1, 'rgba(150,210,255,0)');
      ctx.fillStyle = pg; ctx.fillRect(S.player.x - 90, S.player.y - 140, 180, 180);
    }
    drawChar(S.player.x, S.player.y, 96, { hat: 'plain', color: '#ffffff', fill: pFill,
      walk: S.player.walk, state: S.moving ? 'walk' : (S.near ? 'interact' : 'idle'), ph: 0 });
    ctx.restore();
    // —— 合成：取景居中缩小(0.8×)；边缘暗化+模糊由 DOM #plazaMask 负责 ——
    ctx = real;
    ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    // 主画布先铺纸白（遮罩之外露出的部分）
    ctx.fillStyle = '#F7F4EE'; ctx.fillRect(0, 0, view.w, view.h);
    var s = .8, dw = view.w * s, dh = view.h * s, ox = (view.w - dw) / 2, oy = (view.h - dh) / 2;
    ctx.drawImage(worldCv, 0, 0, worldCv.width, worldCv.height, ox, oy, dw, dh);
    ctx.save(); ctx.strokeStyle = '#141414'; ctx.lineWidth = 1.5; ctx.globalAlpha = .55;
    ctx.strokeRect(ox + v.ox * s + .5, oy + v.oy * s + .5, v.vu * v.sc * s - 1, v.vu * v.sc * s - 1);
    ctx.restore();
    paperWash();
  }
  function drawGate() {
    var g = S.gate, n = 18, lit = Math.floor(n * g.light);
    ctx.save(); ctx.translate(g.x, g.y); ctx.strokeStyle = '#141414';
    for (var i = 0; i < n; i++) {
      var a0 = Math.PI * (1 + i / n), a1 = Math.PI * (1 + (i + 1) / n);
      ctx.globalAlpha = i < lit ? 1 : .28; ctx.lineWidth = i < lit ? 2 : 1;
      ctx.beginPath(); ctx.arc(0, 12, 52, a0, a1); ctx.stroke();
    }
    ctx.globalAlpha = g.light; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-52, 12); ctx.lineTo(-52, 68); ctx.moveTo(52, 12); ctx.lineTo(52, 68); ctx.stroke();
    ctx.globalAlpha = 1; ctx.fillStyle = '#141414'; ctx.font = '9px -apple-system, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('结界门 / ' + S.factCount, 0, 88); ctx.restore();
  }
  function renderOpinions() {
    if (S.mode === 'collect') {
      $('opinionPanel').innerHTML = '<div class="panel-title">倾向 · TILT</div>' + DOM.map(function (d) {
        var v = S.counts[d.id] || 0;
        return '<div class="num-row' + (v >= 6 ? ' hot' : '') + '"><span>' + d.name + '</span><span class="op-num">' + v + '</span></div>';
      }).join('');
      setStats('收集 GATHER ' + (S.collected < 10 ? '0' : '') + S.collected + ' / 30');
    } else {
      $('opinionPanel').innerHTML = '<div class="panel-title">稳定 · STABILITY</div>' +
        '<div class="num-row"><span>事实 FACT</span><span class="op-num">' + S.factCount + '</span></div>' +
        '<div class="num-row"><span>目标 NEED</span><span class="op-num">09</span></div>';
      setStats('稳定 STABILITY ' + (S.factCount < 10 ? '0' : '') + S.factCount + ' / 10');
    }
  }
  function collectA2(f) {
    if (S.energy <= 0) return;
    S.energy--; S.collected++;
    var d0 = S.mode === 'collect' ? DOMMAP[f.fid] : null;
    S.inkFades.push({ x: f.x, y: f.y, h: 54,
      hat: d0 ? d0.hat : 'plain',
      color: d0 ? d0.color : '#ffffff', life: .5 });
    f.dead = true; sfx('pick');
    if (window.FX) { window.FX.collect(f.x, f.y - 20, 0x8fb8dd); window.FX.shatter(f.x, f.y - 24, 0x8fb8dd); }
    if (S.mode === 'collect') {
      var id = f.fid; S.counts[id]++;
      if (S.counts[id] >= 8) {
        S.paperWash = .85; Snd.setTension(1);
        addAch('THE ECHO CHAMBER / ' + DOMMAP[id].name);
        if (BGM) BGM.playForLevel('fail');
        // 按失衡领域显示对应白幕文字
        var lines = (TXT.failA2 && TXT.failA2[id]) || TXT.f6 || [];
        showStory(lines, 'light', function () {
          finish(false, '被一种声音吞没 · SWALLOWED BY ONE VOICE', '你只听见一种声音，直到它填满广场。其他颜色退场了，光再也照不到地面。',
            '你以为自己在收集世界，其实是世界在收集你。同一种回声听上八遍，就成了你眼里唯一的真相。');
        });
        return;
      }
      if (S.counts[id] === 6 || S.counts[id] === 7) {
        S.paperWash = S.counts[id] === 6 ? .28 : .55;
        Snd.setTension(S.counts[id] === 6 ? .5 : .8);
        toast('某种声音正在压过其他声音 · A VOICE GROWS LOUDER');
      }
      if (S.collected >= 30) {
        sfx('open'); veilSwap(function () {
          showStory('w3', 'light', function () { hardSwap(function () { initA2('gate'); }); });
        });
        return;
      }
      renderOpinions();
    } else {
      if (f.type === 'factual') { S.factCount++; toast('事实 +1 · FACT +1'); }
      else toast('偏见混入 · BIAS ENTERS');
      if (S.collected >= 10) {
        S.gate = { x: S.player.x, y: S.player.y - 10, light: 0 };
        S.figures = []; toast('结界门已成形 · THE GATE IS FRAMED');
      }
      renderOpinions();
    }
  }
  function enterGate() {
    sfx('gate');
    if (S.factCount >= 9) hardSwap(function () { startA3(true); });
    else { addAch('THE ASHEN GATE'); hardSwap(function () { startA3(false); }); }
  }

  /* ============================================================
     A3 — THE PASSAGE
     ============================================================ */
  function startA3(win) {
    exitCharLayer(); setScene('a3'); hide('nearA2');
    // 星云球(镜像地球) -> 地球；淡蓝荧光流星抛物线飞行 + 0.1s 拖尾 + 视角跟随
    S.anim = { win: win, t: 0, dur: 7, notes: [], trail: [], phase:'fly', freeze:false, done:false,
      orbP: [] };
    // 双球粒子：镜像地球红（颜色轻微随机变动）、地球蓝
    for (var op = 0; op < 90; op++) {
      var isMirror = op < 45;
      S.anim.orbP.push({ m: isMirror, a: Math.random()*6.28, r: 1+Math.random()*1.6,
        d: 0.12+Math.random()*0.22, sp: 0.25+Math.random()*0.55,
        hue: isMirror ? (355+Math.random()*10) : (195+Math.random()*20) });
    }
    cv.style.filter = ''; setStats(''); setHint('');
  }
  function updateA3(dt) {
    var a = S.anim; if (!a || a.done) return;
    a.t += dt;
    // —— 流星轨迹（抛物线）——
    var prog = clamp(a.t / 5.6, 0, 1);
    var sx = view.w * 0.22, ex = view.w * 0.82;
    var mx = sx + (ex - sx) * prog;
    var my = view.h * 0.56 - Math.sin(prog * Math.PI) * view.h * 0.30; // 抛物线拱起
    a.mx = mx; a.my = my;
    // 0.1 秒拖尾
    a.trail.push({ x: mx, y: my, life: 0.1 });
    a.trail.forEach(function (p) { p.life -= dt; });
    a.trail = a.trail.filter(function (p) { return p.life > 0; });
    // —— 404 弹窗：成功且流星快抵达（prog>0.82）——
    if (a.win && prog > 0.82 && prog < 0.99 && Math.random() < 0.07) {
      a.notes.push({ x: rnd(30, view.w - 300), y: rnd(80, view.h - 130), life: 1.6,
        code: pick(['404 / NOT FOUND', 'ERR_MIRROR', 'NO ROUTE', '502 / GATE', 'RETRY ?']) });
      sfx('error');
    }
    if (!a.freeze) {                                   // 定格期间弹窗保持不衰减
      a.notes.forEach(function (n) { n.life -= dt; });
      a.notes = a.notes.filter(function (n) { return n.life > 0; });
    }

    // —— 分支：流星抵达前定格 / 抵达后 404->黑屏->w5 ——
    if (!a.win && prog >= 0.55 && !a.freeze) {       // 失败：未抵达即定格
      a.freeze = true; a.done = true;
      if (BGM) BGM.playForLevel('fail');
      showStory('w4', 'dark', function () {
        finish(false, '迷失于两界之间 · LOST BETWEEN WORLDS', '',
          '你选了看似最稳的东西。可没有事实托底的稳定，只是一层薄薄的灰。');
      });
      return;
    }
    if (a.win && prog >= 1 && !a.done) {              // 成功：流星抵达 -> 404 定格 3 秒 -> 黑屏 2 秒 -> w5
      a.done = true;
      a.freeze = true;                                // 定格：弹窗/画面保持不动
      setTimeout(function () {
        veilSwap(function () {
          cv.style.filter = 'brightness(0)';          // 黑屏 2 秒
          setTimeout(function () {
            cv.style.filter = '';
            showStory('w5', 'dark', function () {
              showStory('w6', 'dark', function () { veilSwap(function () { initB2(); }); });
            });
          }, 2000);
        });
      }, 3000);                                       // 404 定格 3 秒
    }
  }
  function drawA3() {
    var a = S.anim, w = view.w, h = view.h;
    // 深空底
    var g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#070c15'); g.addColorStop(1, '#020306');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

    // 视角跟随流星：流星始终保持画面视觉中心（垂直方向弱跟随，保留弧线感）
    var camx = 0, camy = 0;
    if (a.mx !== undefined) { camx = (a.mx - w / 2); camy = (a.my - h / 2) * 0.6; }

    var sx = w * 0.22 - camx, ex = w * 0.82 - camx;
    var sy = h * 0.56 - camy, ey = h * 0.56 - camy;
    var R = Math.min(w, h) * 0.10;

    // 镜像地球：白色云雾环绕的星云球
    var neb = ctx.createRadialGradient(sx, sy, R * .3, sx, sy, R * 1.9);
    neb.addColorStop(0, 'rgba(240,246,252,0.22)'); neb.addColorStop(1, 'rgba(240,246,252,0)');
    ctx.fillStyle = neb; ctx.beginPath(); ctx.arc(sx, sy, R * 1.9, 0, 7); ctx.fill();
    for (var i = 0; i < 26; i++) {
      var ang = S.time * .12 + i * .2417, rr = R * (.55 + .5 * Math.sin(i * 2.3 + S.time * .5));
      var cx = sx + Math.cos(ang) * R * .3, cy = sy + Math.sin(ang) * R * .3;
      ctx.fillStyle = 'rgba(255,255,255,' + (.04 + (i % 3) * .02) + ')';
      ctx.beginPath(); ctx.arc(cx, cy, rr * .5, 0, 7); ctx.fill();
    }
    var core = ctx.createRadialGradient(sx - R * .2, sy - R * .2, R * .1, sx, sy, R);
    core.addColorStop(0, 'rgba(255,255,255,.95)'); core.addColorStop(1, 'rgba(214,226,238,.35)');
    ctx.fillStyle = core; ctx.beginPath(); ctx.arc(sx, sy, R, 0, 7); ctx.fill();

    // 地球：蓝色球体 + 大陆
    var eg = ctx.createRadialGradient(ex - R * .3, ey - R * .3, R * .1, ex, ey, R);
    eg.addColorStop(0, '#8ED0F5'); eg.addColorStop(.6, '#4A90D9'); eg.addColorStop(1, '#204a80');
    ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(ex, ey, R, 0, 7); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(ex, ey, R, 0, 7); ctx.clip();
    ctx.fillStyle = 'rgba(95,168,91,.85)';
    [[-20,-12,16],[14,6,20],[-6,26,12],[26,-24,10]].forEach(function (c) {
      ctx.beginPath(); ctx.arc(ex + c[0], ey + c[1], c[2], 0, 7); ctx.fill();
    });
    ctx.restore();

    // 双球周围粒子：镜像地球红色、地球蓝色，颜色轻微随机变动
    (a.orbP || []).forEach(function (q) {
      q.a += q.sp * 0.01;
      var cx = q.m ? sx : ex, cy = q.m ? sy : ey;
      var px = cx + Math.cos(q.a) * R * (1 + q.d);
      var py = cy + Math.sin(q.a) * R * (1 + q.d);
      var jitter = (Math.random() - .5) * 8;       // 颜色轻微随机变动
      var col = 'hsla(' + (q.hue + jitter) + ',80%,' + (q.m ? '62%' : '68%') + ',';
      ctx.fillStyle = col + (.35 + .3 * Math.sin(S.time * 2 + q.a)) + ')';
      ctx.beginPath(); ctx.arc(px, py, q.r, 0, 7); ctx.fill();
    });
    // 暗色几何装饰（少量，极暗不抢眼）
    ctx.save(); ctx.strokeStyle = 'rgba(20,26,40,.5)'; ctx.lineWidth = 1;
    for (var dg = 0; dg < 5; dg++) {
      var dx = (dg * 271) % w, dy = (dg * 173) % h;
      ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx + 40, dy + 18); ctx.lineTo(dx + 12, dy + 50); ctx.stroke();
    }
    ctx.restore();
    // 其他小星球：暗色调、不抢眼但可感知
    var planets = [[.10,.22,26,.35],[.46,.14,18,.3],[.64,.82,30,.38],[.90,.26,14,.28],[.30,.88,20,.32]];
    planets.forEach(function (p, pi) {
      var px = p[0]*w - camx*.4, py = p[1]*h - camy*.4;
      if (px < -60 || px > w+60) return;
      var pg = ctx.createRadialGradient(px, py, p[2]*.1, px, py, p[2]);
      pg.addColorStop(0, 'rgba(52,60,78,'+p[3]+')');
      pg.addColorStop(1, 'rgba(24,30,44,'+(p[3]*.4)+')');
      ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(px, py, p[2], 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(90,100,130,'+(p[3]*.6)+')'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(px, py, p[2], 0, 7); ctx.stroke();
      if (pi % 2 === 0) { // 细环
        ctx.strokeStyle = 'rgba(110,120,150,'+(p[3]*.4)+')';
        ctx.beginPath(); ctx.ellipse(px, py, p[2]*1.5, p[2]*.4, .5, 0, 7); ctx.stroke();
      }
    });

    // 抛物线轨道虚线
    ctx.save(); ctx.strokeStyle = 'rgba(160,210,255,.18)'; ctx.lineWidth = 1; ctx.setLineDash([3, 8]);
    ctx.beginPath();
    for (var k = 0; k <= 40; k++) {
      var t = k / 40, tx = sx + (ex - sx) * t, ty = sy - Math.sin(t * Math.PI) * h * 0.30;
      if (k === 0) ctx.moveTo(tx, ty); else ctx.lineTo(tx, ty);
    }
    ctx.stroke(); ctx.restore();

    // 0.1 秒蓝白拖尾
    a.trail.forEach(function (p, idx) {
      var k = p.life / 0.1;
      var px = p.x - camx, py = p.y - camy;
      ctx.fillStyle = 'rgba(170,220,255,' + (k * .5) + ')';
      ctx.beginPath(); ctx.arc(px, py, 2 + k * 5, 0, 7); ctx.fill();
    });
    // 流星本体（淡蓝荧光）
    if (a.mx !== undefined) {
      var lx = a.mx - camx, ly = a.my - camy;
      var halo = ctx.createRadialGradient(lx, ly, 0, lx, ly, 22);
      halo.addColorStop(0, 'rgba(190,230,255,.85)'); halo.addColorStop(1, 'rgba(190,230,255,0)');
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(lx, ly, 22, 0, 7); ctx.fill();
      ctx.fillStyle = '#eaf6ff'; ctx.beginPath(); ctx.arc(lx, ly, 5, 0, 7); ctx.fill();
    }

    // 404 弹窗（亮红色发光边缘，加大尺寸）
    a.notes.forEach(function (n) {
      ctx.save(); ctx.globalAlpha = Math.min(1, n.life);
      var pulse = .55 + .45 * Math.sin(S.time * 6 + n.x);
      ctx.shadowColor = 'rgba(255,60,60,' + (.85 * pulse) + ')';
      ctx.shadowBlur = 18 + 10 * pulse;
      ctx.strokeStyle = 'rgba(255,72,72,' + (.9 * pulse) + ')';
      ctx.lineWidth = 2;
      ctx.strokeRect(n.x + .5, n.y + .5, 269, 48);
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(7,12,19,.88)'; ctx.fillRect(n.x, n.y, 270, 48);
      ctx.strokeStyle = 'rgba(255,72,72,' + (.9 * pulse) + ')'; ctx.lineWidth = 1.5;
      ctx.strokeRect(n.x + .5, n.y + .5, 269, 48);
      ctx.fillStyle = '#ffdede'; ctx.font = '300 13px Oxanium, Jost, sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(n.code, n.x + 14, n.y + 21);
      ctx.fillStyle = 'rgba(255,150,150,.65)'; ctx.fillText('RETURN FAILED', n.x + 14, n.y + 38);
      ctx.restore();
    });
  }
  function drawEarth(x, y, r, t) {
    ring(x, y, r, 'rgba(143,184,221,.7)', .8, 1.2);
    ring(x, y, r * .82, 'rgba(143,184,221,.25)', .6, 1, [2, 6]);
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip();
    ctx.globalAlpha = .3; ctx.strokeStyle = '#8fcfc3'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(x - r * .3, y - r * .2, r * .34, r * .17, .5, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x + r * .25, y + r * .3, r * .4, r * .2, -.4, 0, 7); ctx.stroke();
    ctx.restore();
  }
  function drawMirror(x, y, r, t) {
    for (var i = 0; i < 16; i++) {
      var a = i * 2.4 + t * .18, d = r * (.18 + (i % 5) / 11);
      poly(x + Math.cos(a) * d, y + Math.sin(a * 1.2) * d * .8, r * (.13 + (i % 3) * .05), 5 + i % 3, -t * .16 + i, LINE_HI, .12 + (i % 3) * .05);
    }
    ring(x, y, r, LINE_HI, .22, 1, [3, 6]);
    ctx.fillStyle = 'rgba(196,214,232,.5)'; ctx.font = '200 9px Jost, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('MIRROR EARTH', x, y + r + 20);
  }

  /* ============================================================
     B2 — THE BROKEN MIRROR
     ============================================================ */
  function initB2() {
    setScene('b2'); S.figures = []; S.halos = []; S.ghosts = []; S.fx = []; S.flash = 0; S.combo = 0;
    S.anim = null;                                // 清理过场残留
    S.afterimages = []; S.b2Particles = [];   // 玩家残影 + 荧光/击杀粒子
    S.decos = makeDecos(WORLD, WORLD, 16);
    S.player.x = WORLD / 2; S.player.y = WORLD / 2; S.player.atk = 0;
    var nb = 14;
    for (var i = 0; i < nb; i++) spawnB2('biased');
    for (var j = 0; j < 4; j++) spawnB2('factual');
    S.b2Total = nb; S.b2Left = nb; S.b2Time = 60; S.sprouts = [];
    for (var k = 0; k < 10; k++) S.sprouts.push({ x: rnd(60, WORLD - 60), y: rnd(60, WORLD - 60), g: .2 + k * .06 });
    setStats('清除偏见 · CLEAR THE BIAS'); setHint(''); renderB2(); toast('一分钟 · 别碰事实 · ONE MINUTE');
  }
  function spawnB2(type) {
    var pair = takePair(type);
    S.figures.push({ id: idSeq++, kind: 'b2', type: type, pair: pair, text: txt(pair),
      x: rnd(80, WORLD - 80), y: rnd(80, WORLD - 80), tx: 0, ty: 0, retarget: 0, ph: rnd(0, 7) });
  }
  function renderB2() {
    $('b2Progress').textContent = '剩余 LEFT ' + (S.b2Left < 10 ? '0' : '') + S.b2Left + ' / ' + S.b2Total;
    var m = Math.floor(S.b2Time / 60), s = Math.floor(S.b2Time % 60);
    $('b2Timer').textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    $('b2Timer').classList.toggle('urgent', S.b2Time <= 30);
  }
  function updateB2(dt) {
    S.b2Time -= dt;
    if (S.b2Time <= 0) { b2TimeOut(); return; }
    var d = readDir(), p = S.player;
    p.x = clamp(p.x + d.x * 215 * dt, 24, WORLD - 24);
    p.y = clamp(p.y + d.y * 215 * dt, 24, WORLD - 24);
    decoCollide(p, 26);   // 装饰物不可穿过
    S.moving = Math.hypot(d.x, d.y) > .05;
    if (S.moving) { p.walk += dt * 11; if (window.FX) window.FX.move(p.x, p.y); }
    if (p.atk > 0) p.atk -= dt;
    if (S.comboT > 0) { S.comboT -= dt; if (S.comboT <= 0) S.combo = 0; }
    // 玩家残影（0.05 秒）+ 淡蓝荧光粒子
    S.afterimages.push({ x: p.x, y: p.y, life: 0.05 });
    S.afterimages.forEach(function (a2) { a2.life -= dt; });
    S.afterimages = S.afterimages.filter(function (a2) { return a2.life > 0; });
    if (Math.random() < 0.5) S.b2Particles.push({ x: p.x + rnd(-26,26), y: p.y - rnd(10,80),
      vx: rnd(-8,8), vy: rnd(-24,-6), life: rnd(.4,.9), max: .9, r: rnd(1,2.4), c:'150,210,255' });
    S.b2Particles.forEach(function (q) { q.x += q.vx*dt; q.y += q.vy*dt; q.life -= dt; });
    S.b2Particles = S.b2Particles.filter(function (q) { return q.life > 0; });
    S.figures.forEach(function (f) {
      f.ph += dt * 2.4; f.retarget -= dt;
      if (f.retarget <= 0 || dist(f.x, f.y, f.tx, f.ty) < 16) {
        f.tx = clamp(f.x + rnd(-200, 200), 50, WORLD - 50); f.ty = clamp(f.y + rnd(-200, 200), 50, WORLD - 50); f.retarget = rnd(1.2, 3);
      }
      var a = Math.atan2(f.ty - f.y, f.tx - f.x);
      f.x = clamp(f.x + Math.cos(a) * 30 * dt, 40, WORLD - 40); f.y = clamp(f.y + Math.sin(a) * 30 * dt, 40, WORLD - 40);
    });
    // 实体碰撞：玩家推挤小人 + 小人软分离
    S.figures.forEach(function (f) {
      var hit = bodyCollide(p.x, p.y - 30, 26, f, 15, .78);
      if (hit) { p.x -= hit.nx * hit.push; p.y -= hit.ny * hit.push; }
    });
    separateFigs(S.figures, 15);
    S.figures.forEach(function (f) { f.x = clamp(f.x, 40, WORLD - 40); f.y = clamp(f.y, 40, WORLD - 40); });
    p.x = clamp(p.x, 24, WORLD - 24); p.y = clamp(p.y, 24, WORLD - 24);
    var near = null, nd = 999;
    S.figures.forEach(function (f) { var dd = dist(p.x, p.y - 38, f.x, f.y - 28); if (dd < nd) { nd = dd; near = f; } });
    S.near = nd < 64 ? near : null;
    var hint = $('nearB2');
    if (S.near) { hint.textContent = 'E / 交互 INTERACT'; show('nearB2'); }
    else hide('nearB2');
    S.sprouts.forEach(function (s) { s.g = Math.min(1, s.g + dt * .5); });
    renderB2();
  }
  function b2Attack() {
    var f = S.near; if (!f) return;
    var p = S.player;
    var dx = f.x - p.x, dy = f.y - p.y, dd = Math.hypot(dx, dy) || 1;
    p.x = clamp(p.x + dx / dd * 48, 24, WORLD - 24);
    p.y = clamp(p.y + dy / dd * 48, 24, WORLD - 24);
    p.atk = .18; S.flash = .09; S.combo++; S.comboT = 1.6;
    if (window.FX) window.FX.attack(f.x, f.y - 24);   // Phaser 击杀：红飞溅 + 轻震动
    if (f.type === 'factual') { halo(f.x, f.y - 20, '#c98d8d'); b2Fail('误伤了事实 · A FACT WAS STRUCK'); return; }
    // 三段交叉斩击 + 放射状冲击线
    for (var i = 0; i < 3; i++) S.fx.push({ x: f.x, y: f.y, a: rnd(-.8, .8), r: rnd(28, 56), life: .18, max: .18, kind: 'slash' });
    for (var j = 0; j < 8; j++) S.fx.push({ x: f.x, y: f.y, a: j / 8 * 6.28 + rnd(-.18, .18), r: rnd(20, 46), life: .2, max: .2, kind: 'ray' });
    halo(f.x, f.y - 20, '#e8f4ff'); ghost(f.x, f.y, 52, '#e8f4ff', null);
    // 击杀：红色粒子飞溅
    for (var r = 0; r < 16; r++) {
      var ra = rnd(0, 6.28), rs = rnd(60, 200);
      S.b2Particles.push({ x: f.x, y: f.y - 24, vx: Math.cos(ra)*rs, vy: Math.sin(ra)*rs - 40,
        life: rnd(.3,.7), max: .7, r: rnd(1.5,3.5), c:'220,70,70' });
    }
    S.sprouts.push({ x: f.x, y: f.y, g: 0 }); f.dead = true; S.b2Left--; sfx('hit');
    S.figures = S.figures.filter(function (x) { return !x.dead; });
    if (S.b2Left <= 0) b2Win();
  }
  function drawSprout(x, y, g) {
    ctx.save(); ctx.translate(x, y); ctx.globalAlpha = .35 + g * .45;
    ctx.strokeStyle = '#8fcfc3'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -18 * g); ctx.stroke();
    if (g > .4) { shapeGlyph(0, -22 * g, 5 * g, 'diamond', '#8fcfc3'); }
    ctx.restore();
  }
  function drawB2() {
    resetViewport();
    var darkAmt = clamp(S.b2Left / S.b2Total, 0, 1), clean = 1 - darkAmt;
    ctx.fillStyle = '#05080e'; ctx.fillRect(0, 0, view.w, view.h);
    var mm = moodOf(), mb = .5 + Math.sin(S.time * .3) * .18;
    var mg = ctx.createRadialGradient(view.w * .52, view.h * .42, 0, view.w * .52, view.h * .42, Math.max(view.w, view.h) * .7);
    mg.addColorStop(0, 'rgba(' + mm[0] + ',' + mm[1] + ',' + mm[2] + ',' + (.06 * mb) + ')');
    mg.addColorStop(1, 'rgba(' + mm[0] + ',' + mm[1] + ',' + mm[2] + ',0)');
    ctx.fillStyle = mg; ctx.fillRect(0, 0, view.w, view.h);
    var v = viewport10(); setViewport(v);
    var cam = camOffset();
    ctx.save(); ctx.translate(-cam.x, -cam.y);
    ctx.fillStyle = mixRGB([5, 8, 14], [250, 250, 250], clean); ctx.fillRect(0, 0, WORLD, WORLD);
    ctx.strokeStyle = mixRGB([255, 255, 255], [20, 20, 20], clean);
    ctx.lineWidth = 1; ctx.globalAlpha = .12;
    for (var i = 0; i <= 30; i++) {
      var q = i * UNIT;
      ctx.beginPath(); ctx.moveTo(q + .5, 0); ctx.lineTo(q + .5, WORLD); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, q + .5); ctx.lineTo(WORLD, q + .5); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    drawDecos();   // 淡色几何装饰（不可穿过）
    var ink = mixRGB([206, 220, 234], [86, 99, 112], clean);   // 低饱和蓝灰线
    S.sprouts.forEach(function (s) { drawSprout(s.x, s.y, s.g); });
    // black filter over the environment, capped at 85%, fading as the world heals
    ctx.fillStyle = 'rgba(0,0,0,' + (darkAmt * .85) + ')'; ctx.fillRect(0, 0, WORLD, WORLD);
    ctx.strokeStyle = 'rgba(0,0,0,' + (darkAmt * .5) + ')'; ctx.lineWidth = 1.4;
    for (var n = 0; n < 8; n++) {
      var sx = (n * 211) % WORLD, sy = (n * 149) % WORLD;
      ctx.beginPath(); ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(sx + 30, sy + 40, sx + 10, sy + 90); ctx.stroke();
    }
    var figFill = mixRGB([5, 8, 14], [250, 250, 250], clean);   // 实心填充随环境明暗
    S.figures.forEach(function (f) {
      drawChar(f.x, f.y + Math.sin(f.ph) * 2, 52, { hat: 'plain', color: '#ffffff', ink: ink,
        fill: figFill, walk: f.ph, state: S.near === f ? 'interact' : 'walk', ph: f.x });
      shapeGlyph(f.x, f.y - 60, 5, 'circle', ink);
      if (S.near === f) {
        var gg = ctx.createRadialGradient(f.x, f.y - 22, 0, f.x, f.y - 22, 50);
        gg.addColorStop(0, 'rgba(244,206,196,0.2)'); gg.addColorStop(1, 'rgba(244,206,196,0)');
        ctx.fillStyle = gg; ctx.fillRect(f.x - 50, f.y - 72, 100, 100);
      }
      if (dist(f.x, f.y, S.player.x, S.player.y) < 5 * UNIT) tag(txt(f.pair), f.x, f.y - 76, ink);
      if (S.near === f) ring(f.x, f.y - 24, 31, ink, .45, 1, [2, 5]);
    });
    // 玩家淡蓝荧光余晖
    var pga = ctx.createRadialGradient(S.player.x, S.player.y - 46, 0, S.player.x, S.player.y - 46, 80);
    pga.addColorStop(0, 'rgba(150,210,255,0.16)'); pga.addColorStop(1, 'rgba(150,210,255,0)');
    ctx.fillStyle = pga; ctx.fillRect(S.player.x - 80, S.player.y - 130, 160, 160);
    // 0.05 秒残影
    (S.afterimages || []).forEach(function (a2) {
      ctx.save(); ctx.globalAlpha = (a2.life / 0.05) * 0.35;
      drawChar(a2.x, a2.y, 98, { hat: 'plain', color: '#ffffff', ink: ink, fill: '#9fd2ff',
        state: 'idle', lw: 1.2 });
      ctx.restore();
    });
    drawChar(S.player.x, S.player.y, 98, { hat: 'plain', color: '#ffffff', ink: ink, fill: figFill,
      walk: S.player.walk, state: S.player.atk > 0 ? 'attack' : (S.moving ? 'walk' : (S.near ? 'interact' : 'idle')), lw: 1.6 });
    // 荧光/击杀粒子
    (S.b2Particles || []).forEach(function (q) {
      ctx.fillStyle = 'rgba(' + q.c + ',' + Math.max(0, q.life / q.max) + ')';
      ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 7); ctx.fill();
    });
    if (S.player.atk > 0) {
      var k = S.player.atk / .18;
      ctx.save(); ctx.translate(S.player.x, S.player.y - 46); ctx.globalAlpha = k * .9;
      ctx.strokeStyle = '#eef6ff'; ctx.lineCap = 'round'; ctx.lineWidth = 2.2;
      for (var q = 0; q < 2; q++) { ctx.beginPath(); ctx.arc(0, 0, 36 + q * 13, -1.3 + (1 - k) * 2.6 + q * .4, .7 + (1 - k) * 2.6); ctx.stroke(); }
      ctx.restore();
    }
    S.fx.forEach(function (o) {
      var k = Math.max(0, o.life / o.max);
      ctx.save(); ctx.globalAlpha = k * .9; ctx.strokeStyle = '#f0f7ff'; ctx.lineWidth = 1 + k * 2; ctx.lineCap = 'round';
      if (o.kind === 'slash') { ctx.beginPath(); ctx.arc(o.x, o.y - 24, o.r, o.a - .75, o.a + .75); ctx.stroke(); }
      else { ctx.beginPath(); ctx.moveTo(o.x + Math.cos(o.a) * 8, o.y - 24 + Math.sin(o.a) * 8); ctx.lineTo(o.x + Math.cos(o.a) * o.r, o.y - 24 + Math.sin(o.a) * o.r); ctx.stroke(); }
      ctx.restore();
    });
    drawEphemera();
    if (S.combo > 1) {
      ctx.save(); ctx.globalAlpha = Math.min(1, S.comboT) * .85;
      ctx.fillStyle = '#f0f7ff'; ctx.font = '300 13px Exo, Jost, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('连击 COMBO ×' + S.combo, S.player.x - cam.x, S.player.y - cam.y - 122); ctx.restore();
    }
    ctx.restore();
    resetViewport();
    if (S.flash > 0) {
      ctx.fillStyle = 'rgba(240,248,255,' + (S.flash / .09 * .3) + ')';
      ctx.fillRect(0, 0, view.w, view.h);
    }
    ctx.save(); ctx.strokeStyle = 'rgba(200,215,235,.45)'; ctx.lineWidth = 1;
    ctx.strokeRect(v.ox + .5, v.oy + .5, v.vu * v.sc - 1, v.vu * v.sc - 1); ctx.restore();
  }
  function b2Win() {
    running = false; setStats(''); setHint(''); cv.style.filter = ''; sfx('win'); addAch('OUT OF THE COCOON');
    if (BGM) BGM.playForLevel('end');   // 仅通过第四关后播放 end.mp3
    var t0 = performance.now();
    function step(ts) {
      var t = (ts - t0) / 1000, w = view.w, h = view.h;
      var g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#0b1622'); g.addColorStop(1, '#050a11');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      var p = clamp(t / 1.6, 0, 1), x = w * .5, y = h * .78 - p * h * .5;
      ctx.strokeStyle = 'rgba(220,238,255,.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(w * .5, h * .82); ctx.lineTo(x, y); ctx.stroke();
      ring(x, y, 5, 'rgba(255,244,205,.9)', 1, 1.5);
      if (t < 2.3) requestAnimationFrame(step);
      else playEnding();
    }
    requestAnimationFrame(step);
  }
  // 通关结局揭晓：w7 三节按顺序（一节渐隐→下一节渐显）→ w8 感想 → w9 鸣谢
  function playEnding() {
    if (!Story) { goHome(); return; }
    var w7 = TXT.w7Sections || [];
    Story.playEndingSequence([
      // 板块一：背后故事 w7，按原有文字分节，三节按顺序显示
      { type:'story', paragraphs: w7[0] || [], inDuration:1400, gap:520,
        special:[8], specialDuration:2200, specialHold:1500 },
      { type:'story', paragraphs: w7[1] || [], inDuration:1400, gap:520,
        special:[3], specialDuration:2200, specialHold:1500 },
      { type:'story', paragraphs: w7[2] || [], inDuration:1400, gap:520,
        special:[3], specialDuration:2200, specialHold:1500 },
      // 板块二：感想与结语 w8（末句停驻后等待玩家点击）
      { type:'reflection', paragraphs: TXT.w8 || [], inDuration:1200, gap:500, endHold:2500 },
      // 板块三：鸣谢清单 w9（短清单整体淡入 + 停驻）
      { type:'credits', creditsList: TXT.w9 || [], fadeIn:1500, hold:3500, fadeOut:1500 }
    ], { sectionGap:2000, maskIn:1200, maskOut:1800 }).then(function () {
      // 结束后回主页（end.mp3 保持播放；goHome 会切 start，符合"回到主界面播放开始曲"）
      goHome();
    });
  }
  function b2TimeOut() {
    running = false; addAch('THE DIMMING');
    if (BGM) BGM.playForLevel('fail');
    showStory('f8', 'dark', function () {
      finish(false, '时间耗尽 · TIME RAN OUT', '',
        '不是没看清。看清需要的时间，比偏见跑得慢。');
    });
  }
  function b2Fail(msg) {
    running = false; addAch('THE DIMMING');
    if (BGM) BGM.playForLevel('fail');
    showStory('f7', 'dark', function () {
      finish(false, '镜像熄灭 · THE MIRROR WENT DARK', '',
        '清除偏见需要刀，也需要分寸。伤到事实的那一刻，拯救就结束了。');
    });
  }
  function softFail(msg, cb) {
    running = false; setHint(''); Snd.setTension(1); sfx('fail');
    if (BGM) BGM.playForLevel('fail');   // 失败瞬即切 fail BGM（与视觉同步）
    var t0 = performance.now();
    function step(ts) {
      var t = (ts - t0) / 1000;
      draw();
      if (S.layer === 'char') {
        ctx.fillStyle = 'rgba(20,20,20,' + Math.min(.14, t * .07) + ')';
        ctx.fillRect(0, 0, view.w, view.h);
      } else {
        cv.style.filter = 'grayscale(' + Math.min(.85, t * .5) + ') brightness(' + (1 - Math.min(.42, t * .22)) + ')';
        var rg = ctx.createRadialGradient(view.w / 2, view.h / 2, Math.min(view.w, view.h) * .22, view.w / 2, view.h / 2, Math.max(view.w, view.h) * .72);
        rg.addColorStop(0, 'rgba(3,5,9,0)'); rg.addColorStop(1, 'rgba(3,5,9,' + Math.min(.82, t * .45) + ')');
        ctx.fillStyle = rg; ctx.fillRect(0, 0, view.w, view.h);
      }
      var alpha = t > .5 && t < 1.6 ? Math.min(1, (t - .5) * 2, (1.6 - t) * 2) : 0;
      ctx.globalAlpha = alpha; ctx.fillStyle = S.layer === 'char' ? '#141414' : TEXT;
      ctx.font = '200 10px Jost, sans-serif';
      ctx.textAlign = 'center'; ctx.fillText(msg, view.w / 2, view.h / 2); ctx.globalAlpha = 1;
      if (t < 2.1) requestAnimationFrame(step); else { cv.style.filter = ''; cb(); }
    }
    requestAnimationFrame(step);
  }

  /* ============================================================
     INFO DIAGRAM
     ============================================================ */
  var infoT = 0, infoRaf = null;
  function startInfo() {
    enterCharLayer(); infoT = 0; if (infoRaf) cancelAnimationFrame(infoRaf);
    function step() { infoT += .016; drawInfo(); infoRaf = requestAnimationFrame(step); }
    step();
  }
  function drawInfo() {
    var c = ictx, w = infoCv.width, h = infoCv.height;
    c.clearRect(0, 0, w, h);
    c.fillStyle = '#fafafa'; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(20,20,20,.12)'; c.lineWidth = 1;
    for (var gx = 0; gx < w; gx += 50) { c.beginPath(); c.moveTo(gx, 0); c.lineTo(gx, h); c.stroke(); }
    for (var gy = 0; gy < h; gy += 50) { c.beginPath(); c.moveTo(0, gy); c.lineTo(w, gy); c.stroke(); }
    var xs = [160, 450, 740], labels = ['FORM', 'FIX', 'BREAK'];
    xs.forEach(function (cx, idx) {
      c.fillStyle = '#141414'; c.font = '300 13px Exo, sans-serif'; c.textAlign = 'center';
      c.fillText(labels[idx], cx, 42);
      var cy = 255, pr = clamp(infoT - idx * 1.1, 0, 1);
      c.strokeStyle = 'rgba(20,20,20,.28)'; c.lineWidth = 1; c.setLineDash([2, 6]);
      c.beginPath(); c.arc(cx, cy, 100, 0, 7); c.stroke(); c.setLineDash([]);
      infoFigure(c, cx, cy);
      if (idx === 0) {
        for (var i = 0; i < 16; i++) { var a = i / 16 * 7 + infoT * .18, rr = 30 + pr * 62; infoDot(c, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, '#8fb8dd', .25 + pr * .5); }
        if (pr > .3) for (var k = 0; k < 3; k++) { c.strokeStyle = 'rgba(143,184,221,.35)'; c.beginPath(); c.arc(cx, cy, 44 + k * 18, k, k + 1.3); c.stroke(); }
      } else if (idx === 1) {
        for (var j = 0; j < 24; j++) { var b = j / 24 * 7, rr2 = 36 + pr * 74; infoDot(c, cx + Math.cos(b) * rr2, cy + Math.sin(b) * rr2, '#8fb8dd', .7); }
        if (pr > .2) for (var m = 0; m < 10; m++) { var ang = m / 10 * 7; c.strokeStyle = 'rgba(201,141,141,.7)'; c.beginPath(); c.moveTo(cx + Math.cos(ang) * 72, cy + Math.sin(ang) * 72); c.lineTo(cx + Math.cos(ang) * 100, cy + Math.sin(ang) * 100); c.stroke(); }
      } else {
        var br = 34 + pr * 76;
        for (var r = 0; r < 12; r++) { var ra = r / 12 * 7; c.strokeStyle = 'rgba(143,207,195,.6)'; c.beginPath(); c.moveTo(cx + Math.cos(ra) * 26, cy + Math.sin(ra) * 26); c.lineTo(cx + Math.cos(ra) * br, cy + Math.sin(ra) * br); c.stroke(); }
        for (var d = 0; d < 18; d++) { var da = d / 18 * 7, dr = 40 + pr * 68; infoDot(c, cx + Math.cos(da) * dr, cy + Math.sin(da) * dr, ['#8fb8dd', '#c9a5bd', '#8fcfc3', '#d8b98f', '#b7a6d8'][d % 5], .8); }
      }
      c.fillStyle = 'rgba(20,20,20,.6)'; c.font = '200 10px Jost, sans-serif';
      c.fillText(['ECHO REPEATS', 'OTHERS SHUT OUT', 'HEAR THE DIFFERENT'][idx], cx, 410);
    });
    c.strokeStyle = 'rgba(20,20,20,.4)'; c.lineWidth = 1;
    [305, 595].forEach(function (x) { c.beginPath(); c.moveTo(x, 255); c.lineTo(x + 20, 255); c.stroke(); });
  }
  function infoDot(c, x, y, color, a) { c.globalAlpha = a; c.fillStyle = color; c.beginPath(); c.arc(x, y, 4, 0, 7); c.fill(); c.globalAlpha = 1; }
  function infoFigure(c, x, y) {
    c.save(); c.translate(x, y); c.strokeStyle = '#141414'; c.lineWidth = 1.2;
    c.beginPath(); c.arc(0, -30, 7, 0, 7); c.stroke();
    c.beginPath(); c.moveTo(0, -22); c.lineTo(0, 4); c.moveTo(0, -14); c.lineTo(-12, -5); c.moveTo(0, -14); c.lineTo(12, -5);
    c.moveTo(0, 4); c.lineTo(-9, 18); c.moveTo(0, 4); c.lineTo(9, 18); c.stroke(); c.restore();
  }
  $('btnInfoNext').onclick = function () {
    if (infoRaf) cancelAnimationFrame(infoRaf); hide('scrInfo');
    if (infoReturn === 'menu') { infoReturn = 'game'; exitCharLayer(); goHome(); return; }
    veilSwap(function () {
      finish(true, '归途 · HOME', '你回到了地球。镜子碎了，但这一次，你记得里面的每一种声音。',
        '茧不是别人织的，是一次次只听自己想听的攒出来的。唯一的出口，是主动听见那些没被听见的声音。');
    });
  };

  /* ============================================================
     END / FLOW
     ============================================================ */
  function finish(win, title, desc, quote) {
    running = false; paused = false; Snd.stopMusic();
    hide('scrNarr'); hide('scrInfo'); hide('uiA1'); hide('uiA2'); hide('uiB2'); hide('scrPause');
    cv.style.filter = '';
    $('endIcon').textContent = win ? '◇' : '○'; $('endTitle').textContent = title;
    $('endDesc').textContent = desc; $('endQuote').textContent = quote;
    // 记录成就：失败时截取当前游戏画面 + 失败文字，供成就库详情查看
    var shot = '';
    if (!win) { try { shot = cv.toDataURL('image/png'); } catch (e) { shot = ''; } }
    var entry = { name: title, win: !!win, text: quote || desc || '', shot: shot,
                  time: Date.now(), isNew: true };
    var all = achAll().map(function (x) { if (x && typeof x === 'object') x.isNew = false; return x; });
    if (!all.some(function (a) { return (typeof a === 'string' ? a : a.name) === title && (typeof a === 'object' && a.win) === !!win; })) {
      all.push(entry); achSave(all);
    }
    $('achCount').textContent = all.length;
    renderAchList($('achList'), all, S.newAch);
    // 通关第四关 -> end；任意失败 -> fail
    if (BGM) BGM.playForLevel(win ? 'end' : 'fail');
    show('scrEnd');
  }
  // 成就列表（可点进详情）
  function renderAchList(el, all, newName) {
    all = all || achAll();
    el.innerHTML = all.length ? all.map(function (a, i) {
      var name = (typeof a === 'string') ? a : a.name;
      var isNew = (name === newName) || (typeof a === 'object' && a.isNew);
      return '<span class="ach-item' + (isNew ? ' new' : '') + '" data-ach="' + i + '" role="button" tabindex="0">' + name + '</span>';
    }).join('') : '<span class="ach-empty">EMPTY</span>';
    Array.prototype.forEach.call(el.querySelectorAll('[data-ach]'), function (node) {
      node.onclick = function () { openAchDetail(parseInt(node.getAttribute('data-ach'), 10)); };
    });
  }
  function openAchDetail(idx) {
    var all = achAll(), a = all[idx]; if (!a) return;
    var name = (typeof a === 'string') ? a : a.name;
    var panel = $('achDetail'); if (!panel) return;
    $('achDetailTitle').textContent = name;
    $('achDetailMeta').textContent = (typeof a === 'object' && a.win === false) ? '结局 · 失败' : '结局 · 通关';
    $('achDetailText').textContent = (typeof a === 'object' && a.text) ? a.text : '';
    var img = $('achDetailShot');
    if (typeof a === 'object' && a.shot) { img.src = a.shot; img.classList.remove('hidden'); }
    else { img.classList.add('hidden'); }
    show('achDetail');
  }
  $('btnAchDetailClose').onclick = function () { hide('achDetail'); };
  $('btnReplay').onclick = function () { startGame(); };

  /* ---------- 主页 / 继续 / 新建 流程 ---------- */
  /* ============================================================
     开始界面 · 分层动画（千恋万花式入场节奏 / Arcaea 冷峻视觉）
     背景缓慢流转 · 人物线条从模糊苏醒 · 粒子飘落 · 菜单错峰 · 视差
     ============================================================ */
  var startAni = null;
  function initStartScreen() {
    var bg = $('startBg'), hero = $('startHero'), pc = $('startParticles');
    if (!bg || !hero || !pc) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    function fit(cv) { cv.width = view.w * dpr; cv.height = view.h * dpr;
      var c = cv.getContext('2d'); c.setTransform(dpr,0,0,dpr,0,0); return c; }
    var bgc = fit(bg), hc = fit(hero), pcc = fit(pc);
    var parts = [];
    for (var i = 0; i < 22; i++) parts.push({ x: rnd(0,view.w), y: rnd(0,view.h),
      sp: rnd(3,10), len: rnd(4,12), a: rnd(.1,.3), ph: rnd(0,7) });
    // 装饰几何图形（低饱和/白，缓慢漂浮，非单一颜色）
    var shapes = [], scols = ['rgba(255,255,255,.22)','rgba(143,184,221,.28)',
      'rgba(183,166,216,.26)','rgba(143,207,195,.22)','rgba(216,185,143,.20)'];
    for (var si = 0; si < 20; si++) shapes.push({ x: rnd(0,view.w), y: rnd(0,view.h),
      s: rnd(44,120), r: rnd(0,6.28), sp: rnd(.05,.16), kind: si%4,
      col: scols[si%scols.length], ph: rnd(0,7) });
    var parallax = { x:0, y:0, tx:0, ty:0 };
    document.addEventListener('mousemove', function (e) {
      parallax.tx = (e.clientX/view.w - .5) * 6;   // 背景 2-4px / 核心 1-2px
      parallax.ty = (e.clientY/view.h - .5) * 4;
    });
    startAni = { raf:0, t0:performance.now(), hero:hero, ui:$('scrStart').querySelector('.start-ui'),
      bgc:bgc, hc:hc, pcc:pcc, bg:bg, pc:pc, parts:parts, shapes:shapes, px:parallax,
      w:view.w, h:view.h, dpr:dpr };
    function frame() {
      var a = startAni; if (!a) return;
      var now = performance.now(), t = (now - a.t0)/1000;
      a.px.x += (a.px.tx - a.px.x)*0.06; a.px.y += (a.px.ty - a.px.y)*0.06;
      // 背景：极慢流转（周期 24s）的柔光碎片
      a.bgc.clearRect(0,0,a.w,a.h);
      for (var k=0;k<3;k++) {
        var gx = a.w*(.25+k*.28) + Math.sin(t*0.26+k)*40 + a.px.x;
        var gy = a.h*(.35+(k%2)*.25) + Math.cos(t*0.22+k)*30 + a.px.y;
        var rr = Math.min(a.w,a.h)*.34;
        var rg = a.bgc.createRadialGradient(gx,gy,0,gx,gy,rr);
        rg.addColorStop(0,'rgba(143,184,221,'+(.045+.015*Math.sin(t*.3+k))+')');
        rg.addColorStop(1,'rgba(143,184,221,0)');
        a.bgc.fillStyle=rg; a.bgc.fillRect(0,0,a.w,a.h);
      }
      // 装饰几何图形：低饱和/白，缓慢漂浮旋转（非单一颜色）
      (a.shapes||[]).forEach(function(sh){
        sh.y += sh.sp*12; sh.r += sh.sp*0.02;
        if(sh.y>a.h+60){ sh.y=-60; sh.x=rnd(0,a.w); }
        a.bgc.save(); a.bgc.translate(sh.x+a.px.x*.5, sh.y+a.px.y*.5); a.bgc.rotate(sh.r);
        a.bgc.strokeStyle=sh.col; a.bgc.lineWidth=2.2;
        a.bgc.beginPath();
        if(sh.kind===0){ a.bgc.rect(-sh.s/2,-sh.s/2,sh.s,sh.s); }
        else if(sh.kind===1){ a.bgc.moveTo(0,-sh.s/2); a.bgc.lineTo(sh.s/2,sh.s/2); a.bgc.lineTo(-sh.s/2,sh.s/2); a.bgc.closePath(); }
        else if(sh.kind===2){ a.bgc.arc(0,0,sh.s/2,0,7); }
        else { a.bgc.moveTo(0,-sh.s/2); a.bgc.lineTo(sh.s/2,0); a.bgc.lineTo(0,sh.s/2); a.bgc.lineTo(-sh.s/2,0); a.bgc.closePath(); }
        a.bgc.stroke(); a.bgc.restore();
      });
      // 粒子：极细线段缓慢下落
      a.pcc.clearRect(0,0,a.w,a.h);
      a.parts.forEach(function(p){
        p.y += p.sp/60; if (p.y>a.h+10){ p.y=-10; p.x=rnd(0,a.w); }
        a.pcc.strokeStyle='rgba(200,224,255,'+p.a+')'; a.pcc.lineWidth=1;
        a.pcc.beginPath(); a.pcc.moveTo(p.x,p.y); a.pcc.lineTo(p.x,p.y-p.len); a.pcc.stroke();
      });
      a.raf = requestAnimationFrame(frame);
    }
    frame();
    // 人物苏醒：先重置，再在下一帧触发 CSS 过渡（3s 极缓 ease-out）
    hero.classList.remove('awake');
    startAni.ui.classList.remove('in');
    void hero.offsetWidth;
    setTimeout(function () { hero.classList.add('awake'); if (startAni) startAni.ui.classList.add('in'); }, 120);
    // 用游戏同款 drawChar 画核心视觉（白底黑线小人，静态苏醒）
    drawStartHero();
  }
  function drawStartHero() {
    if (!startAni) return;
    var c = startAni.hc, w = startAni.w, h = startAni.h;
    c.clearRect(0,0,w,h);
    // 多个小人形象：1 大（主）+ 2 小（点缀，不同帽型/位置）
    var specs = [
      { x:w*0.68, y:h*0.62, hh:Math.min(260,h*0.42), hat:'top',      col:'#b7a6d8' },
      { x:w*0.58, y:h*0.70, hh:Math.min(150,h*0.24), hat:'round',    col:'#8fcfc3' },
      { x:w*0.80, y:h*0.72, hh:Math.min(130,h*0.20), hat:'diamond',  col:'#d8b98f' }
    ];
    var real = ctx; ctx = c;
    specs.forEach(function (sp) {
      c.save(); c.translate(sp.x, sp.y);
      drawChar(0, 0, sp.hh, { hat: sp.hat, color: sp.col, ink:'#E8E6E0',
        fill:'rgba(232,230,224,0.06)', state:'idle', lw:1.6, ph:sp.x });
      c.restore();
    });
    ctx = real;
  }
  function stopStartScreen() { if (startAni) { cancelAnimationFrame(startAni.raf); startAni = null; } }

  // 回到开始界面（主页）：暂停游戏、清场、切 start BGM、同步成就
  function goHome() {
    running = false; paused = false;
    if (infoRaf) { cancelAnimationFrame(infoRaf); infoRaf = null; }
    hide('scrNarr'); hide('scrInfo'); hide('scrEnd'); hide('scrPause'); hide('scrHelp');
    hide('uiA1'); hide('uiA2'); hide('uiB2'); hide('hud'); hide('toasts');
    $('plazaMask').classList.add('hidden');
    $('btnHome').classList.add('hidden');
    $('btnDevNext').classList.add('hidden');   // 开始界面不显示跳关图标
    cv.style.filter = '';
    exitCharLayer();
    if (window.FX) window.FX.setScene('menu');
    if (BGM) BGM.playForLevel('start');
    renderMenuAch();
    show('scrStart');
    // 重新播放开始界面分层动画
    resize(); initStartScreen();
  }
  $('btnEndHome').onclick = goHome;              // 结束页返回主页
  $('btnHome').onclick = goHome;                 // 全局主页图标
  // 新建游戏：置顶，等同从头开始
  $('btnNew').onclick = function () {
    Snd.init();
    veilSwap(function () { startGame(); });
  };
  // 继续：若有进行中的关卡则恢复，否则提示
  $('btnContinue').onclick = function () {
    if (S && S.scene && S.scene !== 'menu' && S.scene !== 'end') {
      hide('scrStart');
      running = true; paused = false;
      setScene(S.scene);   // 恢复对应 UI 与 BGM
    } else {
      toast('暂无进行中的游戏 · NO ACTIVE GAME');
    }
  };

  function interact() {
    if (!running || paused || !S) return;
    if (S.scene === 'a1' && S.near) {
      var a = ABMAP[S.near.aid];
      ghost(S.near.x, S.near.y - 2, 42, a.color, a.shape); halo(S.near.x, S.near.y - 18, a.color);
      if (window.FX) { window.FX.collect(S.near.x, S.near.y - 20, parseInt(a.color.slice(1),16)); window.FX.shatter(S.near.x, S.near.y - 24, parseInt(a.color.slice(1),16)); }
      S.near.dead = true; S.ab[S.near.aid]++; sfx('pick');
      maintainA1(); renderAbilities(); showEye();
      $('nearA1').classList.add('hidden'); S.near = null;
    } else if (S.scene === 'a2' && S.near && S.near !== 'gate') { S.near.sel = .15; collectA2(S.near); }
    else if (S.scene === 'gate' && S.near) { if (S.near === 'gate') enterGate(); else { S.near.sel = .15; collectA2(S.near); } }
    else if (S.scene === 'b2' && S.near) b2Attack();
  }

  function setScene(sc) {
    S.scene = sc;
    // Phaser 覆盖式视觉层：按场景切换氛围（不改原文字/样式）
    if (window.FX) window.FX.setScene(sc);
    // 用 MP3 背景音乐替代原程序化 BGM（音效 Snd.play 仍保留）
    if (BGM) BGM.playForLevel(SCENE_BGM[sc] || null);
    hide('uiA1'); hide('uiA2'); hide('uiB2');
    if (sc === 'a1') show('uiA1');
    if (sc === 'a2' || sc === 'gate') show('uiA2');
    if (sc === 'b2') show('uiB2');
    if (sc !== 'a1' && sc !== 'a2' && sc !== 'gate' && sc !== 'b2') { setHint(''); }
    // 第二关广场：DOM 蒙版（中心透明/边缘黑）+ 主页图标（游戏中随时回主页）
    if (sc === 'a2' || sc === 'gate') $('plazaMask').classList.remove('hidden');
    else $('plazaMask').classList.add('hidden');
    show('hud');
    $('btnHome').classList.remove('hidden');
    // 开发者模式：游戏进行中显示跳关图标（开始界面不显示）
    var inGame = sc === 'a1' || sc === 'a2' || sc === 'gate' || sc === 'a3' || sc === 'b2';
    $('btnDevNext').classList.toggle('hidden', !devMode || !inGame);
  }
  function update(dt) {
    S.time += dt; stepEphemera(dt);
    if (S.scene === 'a1') updateA1(dt);
    else if (S.scene === 'a2') updateA2(dt);
    else if (S.scene === 'gate') updateA2(dt);
    else if (S.scene === 'a3') updateA3(dt);
    else if (S.scene === 'b2') updateB2(dt);
  }
  function draw() {
    ctx.clearRect(0, 0, view.w, view.h);
    if (S.scene === 'a1') drawA1();
    else if (S.scene === 'a2') drawA2();
    else if (S.scene === 'gate') drawA2();
    else if (S.scene === 'a3' && S.anim) drawA3();
    else if (S.scene === 'b2') drawB2();
  }
  function loop(ts) {
    var dt = Math.min(.033, (ts - lastTs) / 1000 || 0); lastTs = ts;
    if (running && !paused) { update(dt); draw(); }
    else if (running && paused) draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  function startGame() {
    stopStartScreen();   // 停止开始界面动画
    S = freshState(); S.frags = [];
    for (var i = 0; i < 28; i++) S.frags.push({ x: rnd(0, view.w), y: rnd(0, view.h), r: rnd(5, 18), n: 3 + Math.floor(rnd(0, 4)), rot: rnd(0, 7), sp: rnd(.01, .05), d: rnd(.05, .4), a: rnd(.06, .2) });
    exitCharLayer(); running = true; paused = false; idSeq = 0; input.x = 0; input.y = 0; input.keys = {};
    hide('scrStart'); hide('scrEnd'); hide('scrHelp'); hide('scrNarr'); hide('scrInfo'); hide('scrPause');
    cv.style.filter = ''; show('touch'); setStats(''); setHint('');
    // 白幕 w1 替代原序章/第一章提示
    showStory('w1', 'light', function () { veilSwap(function () { initA1(); }); });
  }
  // 开始游戏按钮（主菜单 btnNew）已在上方绑定，此处兼容旧 id（若存在）
  if ($('btnStart')) $('btnStart').onclick = function () { Snd.init(); veilSwap(function () { startGame(); }); };
  // click.wav 仅在鼠标 click 时触发（悬停不发声）
  document.addEventListener('click', function (e) {
    if (e.target && e.target.closest && e.target.closest('button, .menu-item, .dev-next, .home-icon, .start-item')) sfx('click');
  });
  // 页面加载即播放开始界面分层动画
  initStartScreen();
})();
