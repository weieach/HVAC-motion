/* =========================================================================
   FDE 的另一半故事 — chapters
   Each chapter builds its DOM into a 1280×764 scene and returns update(t),
   a pure function of chapter time t (ms). Discrete changes toggle classes
   (CSS transitions do the easing); continuous motion is computed here.
   Elements carrying data-at="ms" get class "in" from the player at that time.
   ========================================================================= */
(() => {
  const { svg, figure } = IC;
  const { clamp, prog, lerp, ease, on, css, attr, txt } = K;
  const $ = (r, s) => r.querySelector(s);
  const $$ = (r, s) => [...r.querySelectorAll(s)];
  const range = n => Array.from({ length: n }, (_, i) => i);

  /* Piecewise curve: holds y0, then each [x0, x1, from, to] segment eases between values. */
  const pw = (y0, segs) => x => {
    let y = y0;
    for (const [a, b, f0, f1] of segs) {
      if (x < a) break;
      y = x >= b ? f1 : lerp(f0, f1, ease.smooth((x - a) / (b - a)));
    }
    return y;
  };

  /* Two comparison lanes. Returns the two content bodies (956px wide). */
  function lanes(root, a, b) {
    const mk = (k, c, i) => {
      root.insertAdjacentHTML('beforeend', `
        <section class="lane lane-${k}" style="top:${c.top}px;height:${c.h}px">
          <div class="lane-label rv" style="--i:${i}" data-at="${c.at ?? 60}">
            <span class="lane-tag mono">${c.tag}</span>
            <span class="lane-txt"><b>${c.title}</b><small>${c.sub}</small>${c.extra || ''}</span>
          </div>
          <div class="lane-body"></div>
        </section>`);
      return root.lastElementChild.querySelector('.lane-body');
    };
    return { a: mk('a', a, 0), b: mk('b', b, 1) };
  }

  /* A line drawn left to right as p goes 0 → 1, with an optional "presence" band,
     vertical event marks and labels under the axis. Returns update(p). */
  function curve(host, o) {
    const w = o.w, h = o.h;
    const X0 = o.x0 ?? 8, X1 = o.x1 ?? w - 8, Y0 = o.y0 ?? 34, Y1 = o.y1 ?? h - 58;
    const X = x => X0 + x * (X1 - X0), Y = y => Y1 - y * (Y1 - Y0);
    const N = 240, P = range(N + 1).map(i => [X(i / N), Y(o.f(i / N))]);
    const marks = o.marks || [], ticks = o.ticks || [];
    const band = o.band || (o.bandLabel ? [0, 1] : null);
    host.insertAdjacentHTML('beforeend', `
      <div class="fc fc-${o.kind} rv" style="--i:${o.i ?? 2};left:${o.x}px;top:${o.top || 0}px;width:${w}px;height:${h}px" data-at="${o.at ?? 200}">
        ${o.yLabel ? `<span class="fc-y mono" style="top:${Y0 - 30}px;left:${X0}px">${o.yLabel}</span>` : ''}
        <svg class="fc-svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
          ${band ? `<rect class="fc-band" x="${X(band[0])}" y="${Y0 - 8}" width="0" height="${Y1 - Y0 + 8}" rx="4"/>` : ''}
          <line class="fc-ref" x1="${X0}" y1="${Y0}" x2="${X1}" y2="${Y0}"/>
          <line class="fc-axis" x1="${X0}" y1="${Y1}" x2="${X1}" y2="${Y1}"/>
          ${marks.map(m => `<line class="fc-mk" x1="${X(m[0])}" y1="${Y0 - 8}" x2="${X(m[0])}" y2="${Y1}"/>`).join('')}
          <polyline class="fc-line" points=""/>
          <circle class="fc-head" r="4.5" cx="${X0}" cy="${P[0][1]}"/>
        </svg>
        ${o.bandLabel ? `<span class="fc-bl mono" style="left:${X(band[0]) + 8}px;top:${Y0 - 3}px">${o.bandLabel}</span>` : ''}
        ${marks.map(m => `<span class="fc-ml" style="left:${X(m[0])}px;top:${Y0 - 30}px">${svg('alert')}${m[1]}</span>`).join('')}
        ${ticks.map(k => `<span class="fc-tk${k[2] ? ' ' + k[2] : ''}" style="left:${X(k[0])}px;top:${Y1 + 9}px">${k[1]}</span>`).join('')}
      </div>`);
    const el = host.lastElementChild;
    const line = $(el, '.fc-line'), head = $(el, '.fc-head'), bandEl = $(el, '.fc-band'), bl = $(el, '.fc-bl');
    const mkL = $$(el, '.fc-mk'), mkT = $$(el, '.fc-ml'), tk = $$(el, '.fc-tk');
    return p => {
      const n = p * N, i = Math.min(N, Math.floor(n)), fr = n - i;
      let s = '';
      for (let k = 0; k <= i; k++) s += `${P[k][0].toFixed(1)},${P[k][1].toFixed(1)} `;
      let hx = P[i][0], hy = P[i][1];
      if (i < N && fr > 0) { hx = lerp(P[i][0], P[i + 1][0], fr); hy = lerp(P[i][1], P[i + 1][1], fr); s += `${hx.toFixed(1)},${hy.toFixed(1)}`; }
      attr(line, 'points', p > 0 ? s : '');
      attr(head, 'cx', hx.toFixed(1)); attr(head, 'cy', hy.toFixed(1));
      on(head, 'on', p > 0);
      if (band) {
        const bw = p > band[0] ? X(Math.min(p, band[1])) - X(band[0]) : 0;
        attr(bandEl, 'width', bw.toFixed(1));
        on(bl, 'in', p > band[0] + .02);
      }
      marks.forEach((m, k) => { on(mkL[k], 'in', p >= m[0]); on(mkT[k], 'in', p >= m[0]); });
      ticks.forEach((k2, k) => on(tk[k], 'in', p >= k2[0] - .03));
      return { x: hx, y: hy };
    };
  }

  /* ───────────────────────── 00 · Intro ───────────────────────── */
  const TOPICS = ['模型公司怎么派人', 'AI 创业公司怎么交付', '这个岗位薪资多高', '招聘漏斗多窄'];
  const intro = {
    id: 'intro', tab: '序章', hero: true, dur: 15000, kicker: '01 / 07 · 序章 INTRO', title: '',
    captions: [
      [0, '半年前写 FDE，这还是个冷门词：Forward Deployed Engineer，前线部署工程师。读者多半要先看一遍名词解释。'],
      [2600, '这半年风向完全变了：OpenAI 成立独立部署公司，种子资金四十亿美元；Anthropic 拉着黑石和高盛做企业 AI 服务；一场 FDE 直播，几千人同时在线。'],
      [7000, '模型公司不约而同地从"卖 API"转向"派人进场"——有人把它叫作 the Palantirization of everything。'],
      [10000, '热闹是真热闹。但几乎所有讨论都站在同一个位置上说话：乙方视角。'],
      [12600, '故事的另一半，没人讲：企业自己这一侧，谁来接？'],
    ],
    build(root) {
      const SIG = [
        { k: 'OPENAI · 独立部署公司', ic: 'coin', big: '<span class="n">0</span> 亿美元', sm: '种子资金 · 接连收购 2 家 · 数百名 FDE' },
        { k: 'ANTHROPIC × 黑石 × 高盛', ic: 'building', big: '企业 AI 服务', sm: '模型公司亲自下场，做企业交付' },
        { k: 'FDE 主题直播', ic: 'live', big: '几千人', sm: '<i class="live-dot"></i>同时在线' },
      ];
      root.innerHTML = `
        <span class="hero-k mono rv" data-at="150">FORWARD DEPLOYED ENGINEER · 前线部署工程师</span>
        <h2 class="hero-t rv" style="--i:1" data-at="150">FDE 火了，但<em>一半的故事</em>没人讲</h2>
        <p class="hero-s rv" style="--i:2" data-at="150"><span class="was">半年前：冷门词，读者要先看名词解释</span>${svg('arrow')}<span class="now">这半年：风向完全变了</span></p>
        ${SIG.map((s, i) => `
          <div class="sig rv-card" style="--i:${i};left:${64 + i * 392}px" data-at="2700">
            <span class="sig-k mono">${s.k}</span><span class="sig-ic">${svg(s.ic)}</span>
            <b>${s.big}</b><small>${s.sm}</small>
          </div>`).join('')}
        <div class="shift">
          <span class="sp-pill old rv" data-at="6800">${svg('api')}卖 API</span>
          <i class="sp-arr rv" style="--i:1" data-at="6800"><i></i>${svg('chev')}</i>
          <span class="sp-pill new rv" style="--i:2" data-at="6800">${svg('person')}派人进场</span>
          <span class="sp-note mono rv" style="--i:3" data-at="6800">“THE PALANTIRIZATION OF EVERYTHING”</span>
        </div>
        <div class="pov pov-y rv-card" data-at="900">
          <span class="pov-h"><b>乙方视角</b><span class="mono">讨论 ×<em class="cnt">0</em></span></span>
          <div class="pov-chips">${TOPICS.map(s => `<span class="pchip">${s}</span>`).join('')}</div>
          <div class="dots-g">${range(96).map(() => '<i></i>').join('')}</div>
        </div>
        <div class="pov pov-j rv-card" style="--i:1" data-at="900">
          <span class="pov-h"><b>甲方视角</b><span class="mono">讨论 ×0</span></span>
          <div class="pov-q"><b>?</b><span>企业自己这一侧，谁来接？</span></div>
        </div>`;
      const n = $(root, '.sig .n'), was = $(root, '.hero-s .was'), now = $(root, '.hero-s .now');
      const old = $(root, '.sp-pill.old'), nw = $(root, '.sp-pill.new'), arr = $(root, '.sp-arr > i');
      const chips = $$(root, '.pchip'), dots = $$(root, '.dots-g i'), cnt = $(root, '.pov-y .cnt');
      const povJ = $(root, '.pov-j');
      return t => {
        txt(n, Math.round(40 * ease.out(prog(t, 2900, 1400))));
        on(was, 'off', t >= 2500); on(now, 'on', t >= 2500);
        const s = ease.smooth(prog(t, 7300, 700));
        css(arr, 'transform', `scaleX(${s.toFixed(4)})`);
        on(old, 'off', t >= 7300); on(nw, 'on', t >= 7900);
        // discussion piles up on one side only
        const d = Math.round(dots.length * Math.pow(prog(t, 2700, 9800), 1.4));
        dots.forEach((e, k) => on(e, 'in', k < d));
        txt(cnt, d);
        chips.forEach((c, k) => on(c, 'in', t >= 10300 + k * 420));
        on(povJ, 'q', t >= 12600);
      };
    },
  };

  /* ───────────────────────── 01 · 成衣与版型 ───────────────────────── */
  const fitA = pw(.42, [[.1, .45, .42, .95]]);
  const EV = [.3, .55, .8];
  const fitB = pw(.3, [[.03, .2, .3, .92], [.3, .33, .92, .5], [.34, .46, .5, .93], [.55, .58, .93, .55], [.59, .71, .55, .94], [.8, .83, .94, .6], [.84, .96, .6, .95]]);
  const garment = {
    id: 'garment', tab: '成衣与版型', dur: 18500,
    kicker: '02 / 07 · 成衣与版型 SAAS vs AGENT',
    title: '为什么 SaaS 时代<em>没长出</em>这个岗位',
    captions: [
      [0, 'SaaS 产品像一件成衣：尺码定好，客户成功经理是导购，帮你挑一件最接近的，教你怎么搭配。'],
      [2600, '实施商就是裁缝——但版型是死的。改到合身、验收、交接、走人：改衣是一个项目，有结束的那一天。'],
      [6000, 'AI agent 是一件版型还没定的衣服：接什么工具、喂什么知识、设什么护栏、哪个环节交给人接管，都随业务流程在长。'],
      [10500, '今天改合身了，下个月流程变了、模型升级了，衣服又不合身了。改衣从一个项目，变成了一种常态。'],
      [14800, '任何你能教会客户的，就不是 FDE。实施商在固定的边界内施工，FDE 挪动的是边界本身。'],
    ],
    build(root) {
      const L = lanes(root,
        { top: 176, h: 236, tag: 'SAAS · 成衣', title: '成衣 + 改衣', sub: '版型是死的，实施商在固定的边界内施工' },
        { top: 436, h: 268, tag: 'AI AGENT · 版型未定', title: '版型还在长', sub: '没有移交那一天，FDE 挪动的是边界本身' });

      L.a.innerHTML = `
        <div class="garm rv" style="--i:1;width:200px;height:236px" data-at="160">
          <i class="bound" style="left:38px;top:30px;width:124px;height:124px"></i>
          <span class="fig" style="left:58px;top:50px;width:84px;height:84px">${figure('person')}</span>
          <span class="tailor" style="left:150px;top:22px">${svg('scissors')}</span>
          <span class="garm-l" style="top:170px"><b>人工实施</b><small class="mono">实施商 · 在固定边界内施工</small></span>
        </div>`;
      const drawA = curve(L.a, {
        kind: 'a', x: 236, w: 720, h: 236, f: fitA, band: [.1, .58], bandLabel: '实施商在场', yLabel: '合身度 FIT', at: 300,
        marks: [], ticks: [[.04, '选款 · 导购'], [.27, '改衣 · 二次开发'], [.5, '验收'], [.58, '交接 · 走人', 'strong'], [.82, '项目结束', 'end']],
      });

      const TAGS = ['接工具', '喂知识', '设护栏', '人工接管'];
      L.b.innerHTML = `
        <div class="garm garm-b rv" style="--i:1;width:200px;height:268px" data-at="5900">
          <i class="bound"></i>
          <span class="fig">${figure('agent')}</span>
          <div class="garm-tags">${TAGS.map(s => `<span>${s}</span>`).join('')}</div>
        </div>`;
      const drawB = curve(L.b, {
        kind: 'b', x: 236, w: 720, h: 268, f: fitB, bandLabel: 'FDE 常驻 · 持续改衣', yLabel: '合身度 FIT', at: 5900,
        marks: [[EV[0], '流程变了'], [EV[1], '模型升级'], [EV[2], '新工具接入']],
        ticks: [[.11, '改合身'], [.4, '再改'], [.65, '再改'], [.97, '没有移交那一天 →', 'end']],
      });

      const tailor = $(L.a, '.tailor'), figA = $(L.a, '.fig');
      const garmB = $(L.b, '.garm-b'), boundB = $(L.b, '.bound'), figB = $(L.b, '.fig'), tags = $$(L.b, '.garm-tags span');
      const TAGHIT = [[2, 3], [1], [0]]; // which needs move at each event
      return t => {
        const pA = prog(t, 900, 6000), pB = prog(t, 6300, 9800);
        drawA(pA); drawB(pB);
        on(tailor, 'in', pA > .1 && pA < .58);
        on(figA, 'fit', pA >= .45);

        // the garment and its boundary grow at every event
        const ev = EV.reduce((s, x) => s + ease.smooth(prog(pB, x, .05)), 0);
        const S = 112 + 22 * ev, cx = 100, cy = 94;
        css(boundB, 'width', `${S.toFixed(1)}px`); css(boundB, 'height', `${S.toFixed(1)}px`);
        css(boundB, 'left', `${(cx - S / 2).toFixed(1)}px`); css(boundB, 'top', `${(cy - S / 2).toFixed(1)}px`);
        const sh = 72 + 16 * ev;
        css(figB, 'width', `${sh.toFixed(1)}px`); css(figB, 'height', `${sh.toFixed(1)}px`);
        css(figB, 'left', `${(cx - sh / 2).toFixed(1)}px`); css(figB, 'top', `${(cy - sh / 2).toFixed(1)}px`);
        const misfit = EV.some(x => pB >= x && pB < x + .1);
        on(garmB, 'off', misfit);
        on(figB, 'fit', pB >= .2 && !misfit);
        tags.forEach((g, k) => on(g, 'hit', EV.some((x, e) => TAGHIT[e].includes(k) && pB >= x && pB < x + .14)));
        tags.forEach((g, k) => on(g, 'in', t >= 6300 + k * 140));
      };
    },
  };

  /* ───────────────────────── 02 · 甲方的裁缝 ───────────────────────── */
  const VEND = [0, 328, 656], VW = 300, LEARN = .45;
  const uA = pw(0, [[0, .14, 0, .9], [.314, .343, .9, 0], [.343, .484, 0, .9], [.657, .686, .9, 0], [.686, .827, 0, .9]]);
  const uB = pw(.8, [[0, 1, .8, .97]]);
  const tailor = {
    id: 'tailor', tab: '甲方的裁缝', dur: 22000,
    kicker: '03 / 07 · 甲方的裁缝 THE OTHER HALF',
    title: '另一半故事：<em>甲方的裁缝</em>在哪',
    captions: [
      [0, '所有人都在讨论模型公司该派谁进场，几乎没人问一个对称的问题：企业自己这一侧，谁来接？'],
      [3000, '乙方 FDE 再强，每次进场都要重新理解你的流程、你的黑话、你的数据埋在哪——每换一家供应商，这笔学习成本就重付一次。'],
      [8300, '企业内部一直坐着一群天然免掉这笔成本的人：内部 IT，加上懂业务的人。他们不需要"驻场"，因为本来就在场。必要时，把业务同学直接拉进来。'],
      [14600, 'AI 正在把企业 IT 从需求接单部门，推回业务现场的改造部门。FDE 只是这个变化在乙方那边先长出来的名字。'],
      [18600, '当乙方都开始派工程师贴着你的业务坐，你自己的工程师离业务有多远？'],
    ],
    build(root) {
      const L = lanes(root,
        { top: 176, h: 176, tag: '乙方 FDE · 外部裁缝', title: '每次重新量体', sub: '每换一家供应商，学习成本重付一次', extra: '<span class="lane-cnt mono">学习成本 ×<em>0</em></span>' },
        { top: 376, h: 176, tag: '甲方 · 自己的裁缝', title: '本来就在场', sub: '内部 IT + 懂业务的人，免掉这笔成本', at: 8000 });

      L.a.innerHTML = VEND.map((x, k) => `
          <div class="vd rv" style="--i:${k};left:${x}px;width:${VW}px" data-at="300">
            <span class="vd-h"><span class="vd-ic">${svg('person')}</span><b>供应商 ${'ABC'[k]}</b><span class="vd-chips"><i>流程</i><i>黑话</i><i>数据在哪</i></span></span>
            <div class="blk"><span class="seg learn" style="width:${LEARN * 100}%"><i></i><em>重新理解</em></span><span class="seg work" style="width:${(1 - LEARN) * 100}%"><i></i><em>改衣</em></span></div>
          </div>`).join('')
        + VEND.slice(1).map((x, k) => `<span class="vd-sw rv" style="--i:${k + 1};left:${x - 28}px" data-at="300">${svg('loop')}</span>`).join('');
      const drawUA = curve(L.a, { kind: 'a', x: 0, top: 80, w: 956, h: 96, x0: 0, x1: 956, y0: 26, y1: 90, f: uA, yLabel: '对业务的理解', at: 300 });

      L.b.innerHTML = `
          <div class="vd vd-b rv" style="left:0;width:956px" data-at="8000">
            <span class="vd-h"><span class="vd-ic">${svg('server')}</span><b>内部 IT</b><span class="vd-plus">+</span><span class="vd-ic">${svg('person')}</span><b>懂业务的人</b><span class="vd-note mono">无需驻场 · 本来就在</span></span>
            <div class="blk"><span class="seg learn" style="width:2%"><i></i></span><span class="seg work" style="width:98%"><i></i><em>改衣 · 持续贴着业务</em></span></div>
          </div>
          <span class="pull" style="left:${Math.round(.55 * 956)}px">${svg('person')}业务同学直接拉进来</span>`;
      const drawUB = curve(L.b, { kind: 'b', x: 0, top: 80, w: 956, h: 96, x0: 0, x1: 956, y0: 26, y1: 90, f: uB, yLabel: '对业务的理解', at: 8000 });

      root.insertAdjacentHTML('beforeend', `
        <div class="bx hq rv-card" data-at="14300">
          <span class="bx-ic">${svg('building')}</span><b>需求接单部门</b><small>总部 · 排队 · 集中维护少数大系统</small>
          <span class="queue">${range(5).map(() => svg('doc')).join('')}</span>
        </div>
        <div class="rail rv" style="--i:1" data-at="14300"><i class="rail-fill"></i><span>AI 把企业 IT 推回业务现场</span></div>
        <div class="bx site rv-card" style="--i:2" data-at="14300">
          <span class="bx-ic">${svg('factory')}</span><b>业务现场的改造部门</b><small>贴着业务坐 · 边看边改</small>
        </div>
        <span class="itk rv" style="--i:2" data-at="14300">${svg('server')}内部 IT</span>`);

      const vds = $$(L.a, '.vd'), cntA = $(L.a.parentElement, '.lane-cnt em');
      const segA = vds.map(v => $$(v, '.seg > i')), chipsA = vds.map(v => $$(v, '.vd-chips i'));
      const vdB = $(L.b, '.vd-b'), segB = $$(vdB, '.seg > i'), pull = $(L.b, '.pull');
      const itk = $(root, '.itk'), railFill = $(root, '.rail-fill'), site = $(root, '.site'), hq = $(root, '.hq');
      return t => {
        const pA = prog(t, 900, 6600), pB = prog(t, 8400, 6000);
        drawUA(pA); drawUB(pB);
        let learned = 0;
        VEND.forEach((x, k) => {
          const a = x / 956, b = (x + VW) / 956, m = a + LEARN * (b - a);
          const pl = prog(pA, a, m - a), pw2 = prog(pA, m, b - m);
          css(segA[k][0], 'transform', `scaleX(${pl.toFixed(4)})`);
          css(segA[k][1], 'transform', `scaleX(${pw2.toFixed(4)})`);
          chipsA[k].forEach((c, j) => on(c, 'in', pl > .15 + j * .3));
          on(vds[k], 'active', pA > a && pA < b);
          on(vds[k], 'gone', pA >= b + .01 && k < 2);
          if (pA > a) learned++;
        });
        txt(cntA, learned);
        css(segB[0], 'transform', `scaleX(${prog(pB, 0, .02).toFixed(4)})`);
        css(segB[1], 'transform', `scaleX(${prog(pB, .02, .98).toFixed(4)})`);
        on(vdB, 'active', pB > 0);
        on(pull, 'in', pB >= .55);

        // IT walks from HQ to the business floor
        const m = ease.smooth(prog(t, 15000, 1800));
        css(itk, 'transform', `translateX(${(m * 838).toFixed(1)}px)`);
        css(railFill, 'transform', `scaleX(${m.toFixed(4)})`);
        on(hq, 'left', m > .1);
        on(site, 'lit', m >= 1);
      };
    },
  };

  /* ───────────────────────── 03 · 为什么是现在 ───────────────────────── */
  const NEEDS = [.18, .95, .3, .22, .12, .5, .26, .15, .82, .35, .2, .42, .14, .28, .24, .16];
  function needChart(body, o) {
    const base = o.h - 40, maxH = base - 58;
    body.insertAdjacentHTML('beforeend', `
      <div class="need" style="left:0;top:0;width:580px;height:${o.h}px">
        <span class="need-h mono rv" data-at="${o.at}">业务需求 · 柱高 = 价值</span>
        <span class="need-r rv" data-at="${o.at}">${o.speed}</span>
        ${NEEDS.map((v, i) => `<i class="nbar rv" style="--i:${(i % 8) + 1};left:${i * 36.5}px;top:${(base - v * maxH).toFixed(1)}px;height:${(v * maxH).toFixed(1)}px" data-at="${o.at}"></i>`).join('')}
        <i class="need-base" style="top:${base}px"></i>
        <div class="thr" style="top:${base - .72 * maxH}px"><span class="thr-l mono">值得做的门槛</span></div>
        <span class="need-f mono rv" style="top:${base + 10}px" data-at="${o.at}"><i class="lg done"></i>做了<i class="lg skip"></i>算不过账</span>
        <span class="need-c mono rv" style="top:${base + 10}px" data-at="${o.at}"><em>0</em> / ${NEEDS.length} 做了</span>
      </div>`);
    const el = body.lastElementChild;
    return { el, bars: $$(el, '.nbar'), thr: $(el, '.thr'), cnt: $(el, '.need-c em'), base, maxH };
  }
  function latency(body, o) {
    body.insertAdjacentHTML('beforeend', `
      <div class="lat rv" style="left:620px;top:${o.top}px;width:336px" data-at="${o.at}">
        <div class="lat-h"><b>${o.title}</b><small class="mono">${o.who}</small></div>
        <div class="lat-t"><i class="lat-fill"></i>${o.ticks.map((s, k) => `<span class="lat-tk" style="left:${(k / (o.ticks.length - 1)) * 100}%">${s}</span>`).join('')}<span class="lat-dot"></span></div>
        <span class="lat-r">${o.res}</span>
      </div>`);
    const el = body.lastElementChild;
    return { el, fill: $(el, '.lat-fill'), dot: $(el, '.lat-dot'), res: $(el, '.lat-r') };
  }
  const now = {
    id: 'now', tab: '为什么是现在', dur: 21500,
    kicker: '04 / 07 · 为什么是现在 WHY NOW',
    title: '以前不是不想，<em>是算不过账</em>',
    captions: [
      [0, '让 IT 贴着业务做定制，不是新想法。业务 IT 融合、驻场开发，十几年前就有人提，大多没成。凭什么现在又行了？'],
      [3800, '以前是算不过账：一个需求从排期到上线以月计，IT 人力被存量维护和排队的需求单吃得干干净净。只能退回总部，守着少数大系统。'],
      [8600, 'AI coding 改写的正是这笔账：它压低了"这个小需求值不值得做"的门槛。过去算不过来的流程缝隙，现在一个人带着 AI，以天计就能补上。'],
      [13200, '快是快了，验收、回滚、出了事谁负责——这些标准一样都不能跟着垮。'],
      [16000, '十年前，Palantir 的 FDE 发现问题，推回产品要等版本、按季度算；今天，上午听到问题，下午就能提交代码。同一个岗位，杠杆完全不是一个量级。'],
    ],
    build(root) {
      const L = lanes(root,
        { top: 176, h: 236, tag: '过去 · 定制开发', title: '算不过账', sub: '被成本逼出来的队形，不是觉悟问题' },
        { top: 436, h: 268, tag: '现在 · AI CODING', title: '门槛被压低', sub: '一个人带着 AI，以天计补上流程缝隙', at: 8400 });
      const A = needChart(L.a, { h: 236, at: 300, speed: '排期 → 上线：<b>以月计</b>' });
      const B = needChart(L.b, { h: 268, at: 8400, speed: '一个人 + AI：<b>以天计</b>' });
      L.a.insertAdjacentHTML('beforeend', `
        <div class="cap rv" style="left:620px;top:0;width:336px" data-at="3800">
          <div class="lat-h"><b>IT 人力</b><small class="mono">空闲 0%</small></div>
          <div class="cap-bar"><i class="c1"><em>存量系统维护</em></i><i class="c2"><em>排队的需求单</em></i></div>
        </div>`);
      L.b.insertAdjacentHTML('beforeend', `
        <div class="guard rv" style="left:620px;top:0;width:336px" data-at="13200">${svg('shield')}<span><b>验收 · 回滚 · 谁负责</b><small>标准一样都不能跟着垮</small></span></div>`);
      const LA = latency(L.a, { top: 96, at: 15800, title: '发现问题 → 推回产品', who: 'PALANTIR · 十年前', ticks: ['Q1', 'Q2', 'Q3', 'Q4'], res: '等版本 · <b>按季度算</b>' });
      const LB = latency(L.b, { top: 116, at: 15800, title: '上午听到 → 下午提交代码', who: '今天', ticks: ['9:00', '12:00', '15:00', '18:00'], res: '当天 · <b>杠杆不是一个量级</b>' });
      const c1 = $(L.a, '.cap-bar .c1'), c2 = $(L.a, '.cap-bar .c2');

      return t => {
        // past: a high bar, only the big systems clear it
        const thrA = .72;
        on(A.thr, 'in', t >= 3900);
        let nA = 0;
        A.bars.forEach((b, i) => { const ok = NEEDS[i] >= thrA; on(b, 'done', t >= 4500 && ok); on(b, 'skip', t >= 4500 && !ok); if (t >= 4500 && ok) nA++; });
        txt(A.cnt, nA);
        css(c1, 'transform', `scaleX(${ease.out(prog(t, 4000, 900)).toFixed(4)})`);
        css(c2, 'transform', `scaleX(${ease.out(prog(t, 4600, 900)).toFixed(4)})`);

        // now: the bar slides down and the seams get filled
        const thrB = lerp(.72, .08, ease.smooth(prog(t, 9400, 3200)));
        on(B.thr, 'in', t >= 8800);
        css(B.thr, 'top', `${(B.base - thrB * B.maxH).toFixed(1)}px`);
        let nB = 0;
        B.bars.forEach((b, i) => { const ok = NEEDS[i] >= thrB; on(b, 'done', t >= 9000 && ok); on(b, 'skip', t >= 9000 && !ok); if (t >= 9000 && ok) nB++; });
        txt(B.cnt, nB);

        // the loop from field to product
        [[LA, .5], [LB, .6]].forEach(([l, end]) => {
          const p = ease.smooth(prog(t, 16400, 2200)) * end;
          css(l.dot, 'left', `${(p * 100).toFixed(2)}%`);
          css(l.fill, 'transform', `scaleX(${p.toFixed(4)})`);
          on(l.dot, 'on', t >= 16400);
          on(l.res, 'in', t >= 18700);
        });
      };
    },
  };

  /* ───────────────────────── 04 · 剪裁与量体 ───────────────────────── */
  const BASE = 650, U = 3.8;
  const COLS = [
    { x: 104, zh: '过去', en: '定制开发' },
    { x: 304, zh: 'AI coding 之后', en: '乙方裁缝' },
    { x: 504, zh: 'AI coding 之后', en: '甲方裁缝' },
  ];
  const cost = {
    id: 'cost', tab: '剪裁与量体', dur: 18500,
    kicker: '05 / 07 · 剪裁与量体 CUT vs MEASURE',
    title: '剪裁便宜了，贵的变成了<em>量体</em>',
    captions: [
      [0, '但有一件事 AI coding 没有改变：它降的是动手的成本，不是动脑的成本。'],
      [3800, '剪裁这一段被 AI coding 压了下去；量体——知道该写什么、知道业务的疼在哪——一分钱都没变便宜。'],
      [7600, '剪裁便宜了，贵的变成了量体。'],
      [10400, '乙方裁缝每次进场，都要把身材从头量一遍；而最懂这具身材的，本来就是家里人。'],
      [14400, '这恰恰是甲方裁缝的账，比乙方更好算的原因。'],
    ],
    build(root) {
      root.innerHTML = `
        <div class="legend mono rv" data-at="300"><span><i class="lg cut"></i>剪裁 · 动手</span><span><i class="lg msr"></i>量体 · 动脑</span><span><i class="lg rel"></i>重新量体 · 每次进场</span></div>
        <i class="cbase rv" data-at="300"></i>
        ${COLS.map((c, i) => `
          <div class="col${i ? ' later' : ''}" style="left:${c.x}px">
            <span class="seg-c cut"><em>剪裁</em><b>70</b></span>
            <span class="seg-c msr"><em>量体</em><b>30</b></span>
            ${i === 1 ? '<span class="seg-c rel"><em>重新量体</em><b>0</b></span>' : ''}
            <span class="tot mono">0</span>
            <span class="col-l"><b>${c.zh}</b><small class="mono">${c.en}</small></span>
            ${i === 2 ? `<span class="home-tag">${svg('home')}家里人 · 本来就懂</span>` : ''}
          </div>`).join('')}
        <span class="ai-tag mono">${svg('down')}AI CODING</span>
        <div class="cr r1 rv" data-at="600"><span class="cr-ic">${svg('scissors')}</span><b>剪裁 · 动手的成本</b><span class="badge ok">${svg('down')}AI coding 压低</span></div>
        <div class="cr r2 rv" style="--i:1" data-at="600"><span class="cr-ic">${svg('ruler')}</span><b>量体 · 动脑的成本</b><span class="badge eq">= 一分钱没变便宜</span></div>
        <p class="quote rv" data-at="7600">剪裁便宜了，<br>贵的变成了<em>量体</em>。</p>
        <div class="share rv" data-at="7900"><small>量体在总成本中的占比</small><b><span class="s0">30%</span>${svg('arrow')}<em class="s1">30%</em></b></div>
        <p class="kin rv" data-at="14400">${svg('home')}<span>最懂这具身材的，本来就是家里人——<b>甲方裁缝的账更好算。</b></span></p>`;
      const cols = $$(root, '.col').map(c => ({
        el: c, cut: $(c, '.cut'), msr: $(c, '.msr'), rel: $(c, '.rel'), tot: $(c, '.tot'),
        cutN: $(c, '.cut b'), msrN: $(c, '.msr b'), relN: $(c, '.rel b'), home: $(c, '.home-tag'),
      }));
      const b1 = $(root, '.r1 .badge'), b2 = $(root, '.r2 .badge'), aiTag = $(root, '.ai-tag'), s1 = $(root, '.share .s1');
      const place = (el, bottom, h) => { css(el, 'top', `${(BASE - bottom - h).toFixed(1)}px`); css(el, 'height', `${h.toFixed(1)}px`); };
      return t => {
        cols.forEach((c, i) => {
          const g = i === 0 ? ease.out(prog(t, 500, 1100)) : ease.out(prog(t, 2000, 1000));
          const shrink = i === 0 ? 0 : ease.smooth(prog(t, 3900, 1300));
          const cut = 70 * g - 56 * shrink;
          const msr = 30 * (i === 0 ? ease.out(prog(t, 1000, 900)) : g);
          const rel = i === 1 ? 24 * ease.smooth(prog(t, 10600, 1300)) : 0;
          place(c.cut, 0, cut * U); place(c.msr, cut * U, msr * U);
          if (c.rel) { place(c.rel, (cut + msr) * U, rel * U); txt(c.relN, Math.round(rel)); on(c.rel, 'in', rel > 1); }
          txt(c.cutN, Math.round(cut)); txt(c.msrN, Math.round(msr));
          on(c.el, 'in', i === 0 ? t >= 400 : t >= 1900);
          on(c.el, 'hot', t >= 7600);
          const total = cut + msr + rel;
          txt(c.tot, Math.round(total));
          css(c.tot, 'top', `${(BASE - total * U - 30).toFixed(1)}px`);
          on(c.tot, 'in', t >= 14400);
          on(c.el, 'win', i === 2 && t >= 14400);
          if (c.home) on(c.home, 'in', t >= 11200);
        });
        on(aiTag, 'in', t >= 3700);
        on(b1, 'in', t >= 4200); on(b2, 'in', t >= 5200);
        txt(s1, `${Math.round(lerp(30, 68, ease.out(prog(t, 8300, 1400))))}%`);
      };
    },
  };

  /* ───────────────────────── 05 · 记回版房 ───────────────────────── */
  const SITES = ['财务对账', '客服工单', '采购审批', '排产计划', '质检报告'];
  const ARTS = [['prompt', '提示词'], ['plug', '工具连接'], ['flask', '测试集'], ['prompt', '提示词'], ['flask', '测试集']];
  const EFFORT_B = [1, .78, .6, .46, .36];
  const S0 = 3600, STEP = 2300, WORK = 1500;
  function fittings(body, kind, h) {
    const cardTop = h - 150;
    body.innerHTML = `
      <div class="room rv" style="height:${h}px" data-at="${kind === 'a' ? 300 : 500}">
        <span class="room-h mono">${svg('layers')}版房 · PATTERN ROOM</span>
        <b class="room-v mono">v1</b>
        <ol class="room-list">${ARTS.map(a => `<li>${svg(a[0])}${a[1]}</li>`).join('')}</ol>
        ${kind === 'a' ? '<span class="room-empty">什么都没留下</span>' : ''}
        <span class="stamp">${kind === 'a' ? '借调' : 'FDE'}</span>
      </div>
      ${SITES.map((s, k) => `
        <div class="fit-c rv-card" style="--i:${k};left:${236 + k * 147}px;top:${cardTop}px" data-at="${kind === 'a' ? 300 : 500}">
          <span class="fit-k mono">现场 0${k + 1}</span><span class="fit-ok">${svg('check')}</span>
          <b>${s}</b>
          <span class="fit-bar"><i style="width:${(kind === 'a' ? 1 : EFFORT_B[k]) * 100}%"><i></i></i></span>
          <small>改衣工作量</small>
        </div>`).join('')}
      ${ARTS.map(a => `<span class="art">${svg(a[0])}${a[1]}</span>`).join('')}`;
    return {
      cards: $$(body, '.fit-c'), fills: $$(body, '.fit-bar > i > i'), arts: $$(body, '.art'),
      ver: $(body, '.room-v'), rows: $$(body, '.room-list li'), stamp: $(body, '.stamp'), room: $(body, '.room'), cardTop,
    };
  }
  const room = {
    id: 'room', tab: '记回版房', dur: 20000,
    kicker: '06 / 07 · 记回版房 PATTERN ROOM',
    title: '定制化<em>不是</em>规模化的敌人',
    captions: [
      [0, '很多管理者默认：规模化就是标准、快速、一套东西铺下去；定制化是规模化的敌人，是成本，是要被消灭的。'],
      [3600, '真正跑通的路径恰好相反：规模化在底座，定制化是刚需——让定制变成规模化的输入。'],
      [7600, '好裁缝改完一件衣服，会把这次的修改记回版房。改的人多了，版房就知道下一季的版型该往哪调。'],
      [12000, '每一次现场改衣，都得有东西记回版房：一段提示词、一个工具连接、一套测试集。'],
      [15600, '做不到这一条，FDE 就只是换了名字的外包。派进业务的人如果只改衣服、不记版型，那不叫 FDE，叫借调。'],
    ],
    build(root) {
      const L = lanes(root,
        { top: 176, h: 236, tag: '只改衣服 · 不记版型', title: '只是借调', sub: '换了名字的外包：改完就算了，下一件从头再来' },
        { top: 436, h: 268, tag: '记回版房 · FDE', title: '定制喂给版型', sub: '规模化在底座，定制是规模化的输入' });
      const A = fittings(L.a, 'a', 236), B = fittings(L.b, 'b', 268);
      const ROW = j => ({ x: 14, y: 96 + j * 28 });
      const run = (F, kind, t) => {
        let landed = 0;
        SITES.forEach((_, k) => {
          const s = S0 + k * STEP, w = WORK * (kind === 'a' ? 1 : EFFORT_B[k]), pop = s + w;
          const cx = 236 + k * 147 + 66;
          css(F.fills[k], 'transform', `scaleX(${prog(t, s, w).toFixed(4)})`);
          on(F.cards[k], 'active', t >= s && t < pop);
          on(F.cards[k], 'done', t >= pop);
          const a = F.arts[k];
          let x = cx, y = F.cardTop - 30, o = 0, sc = 1;
          if (t >= pop) {
            const u = t - pop;
            if (kind === 'b') {
              const r = ROW(k), p = ease.smooth(prog(u, 350, 650));
              const ax = lerp(cx, r.x + 84, p), ay = lerp(y, r.y + 12, p) - Math.sin(Math.PI * p) * 36;
              x = ax; y = ay; o = u < 1000 ? ease.out(prog(u, 0, 250)) : 0; sc = 1 - .25 * p;
              if (u >= 1000) landed++;
            } else {
              o = u < 500 ? ease.out(prog(u, 0, 250)) : 1 - prog(u, 500, 600);
              y -= 14 * prog(u, 500, 600);
            }
          }
          css(a, 'transform', `translate(${(x).toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%) scale(${sc.toFixed(3)})`);
          css(a, 'opacity', o.toFixed(3));
          on(a, 'lost', kind === 'a' && t >= pop + 500);
        });
        F.rows.forEach((r, j) => on(r, 'in', j < landed));
        txt(F.ver, `v${1 + landed}`);
        on(F.room, 'absorb', kind === 'b' && SITES.some((_, k) => { const l = S0 + k * STEP + WORK * EFFORT_B[k] + 1000; return t >= l && t < l + 350; }));
        on(F.stamp, 'in', t >= 15600);
      };
      return t => { run(A, 'a', t); run(B, 'b', t); };
    },
  };

  /* ───────────────────────── 06 · 写在最后 ───────────────────────── */
  const closing = {
    id: 'closing', tab: '写在最后', hero: true, dur: 16000,
    kicker: '07 / 07 · 写在最后 CLOSING', title: '',
    captions: [
      [0, 'FDE 这个词，大概率会像很多热词一样，热两年，然后被新词盖过去。'],
      [4200, '但它指向的那个位置不会消失：一件永远在长的衣服，需要一个常驻的裁缝，和一间收集所有改动的版房。'],
      [9800, '乙方在抢着往这个位置派人。'],
      [12200, '甲方这一侧的位置，眼下多半还空着。'],
    ],
    build(root) {
      root.innerHTML = `
        <span class="hero-k mono rv" data-at="150">写在最后 · CLOSING</span>
        <h2 class="hero-t rv" style="--i:1" data-at="150">一件<em>永远在长</em>的衣服</h2>
        <p class="hero-s rv" style="--i:2" data-at="4200">需要一个常驻的裁缝，和一间收集所有改动的版房。</p>
        <div class="seat seat-y rv-card" data-at="600">
          <span class="seat-h"><b>乙方</b><span class="mono">抢着往这个位置派人</span></span>
          <div class="crowd">${range(18).map(() => `<i>${svg('person')}</i>`).join('')}</div>
        </div>
        <svg class="wire" viewBox="0 0 1280 764" aria-hidden="true">
          <line class="w-y" x1="444" y1="420" x2="540" y2="420"/>
          <line class="w-j" x1="740" y1="420" x2="836" y2="420"/>
          ${range(3).map(() => '<circle class="w-dot" r="3.5" cy="420"/>').join('')}
        </svg>
        <div class="pos rv" style="--i:1" data-at="600">
          <span class="word"><s class="w-old mono">FDE</s><span class="w-new mono">下一个热词？</span></span>
          <span class="pos-g"><i class="bound"></i><span class="fig">${figure('agent')}</span></span>
          <span class="pos-l">这个位置不会消失</span>
          <span class="pos-c c1">${svg('ruler')}常驻的裁缝</span>
          <span class="pos-c c2">${svg('layers')}版房</span>
        </div>
        <div class="seat seat-j rv-card" style="--i:2" data-at="600">
          <span class="seat-h"><b>甲方</b><span class="mono">这一侧的位置</span></span>
          <span class="chair">${svg('chair')}</span>
          <span class="empty">眼下多半还空着</span>
        </div>
        <div class="closing">
          <i class="cl-bar"></i>
          <p class="cl-zh"><span class="l1 rv" data-at="9800">乙方在抢着往这个位置派人。</span><br><span class="l2 hl rv" data-at="12200">甲方这一侧的位置，眼下多半还空着。</span></p>
        </div>`;
      const people = $$(root, '.crowd i'), word = $(root, '.word'), g = $(root, '.pos-g');
      const c1 = $(root, '.pos-c.c1'), c2 = $(root, '.pos-c.c2'), posL = $(root, '.pos-l');
      const dots = $$(root, '.w-dot'), seatJ = $(root, '.seat-j'), clBar = $(root, '.cl-bar');
      return t => {
        // a few early arrivals, then a rush
        const n = Math.round(3 * prog(t, 900, 2000) + 15 * ease.out(prog(t, 9800, 2200)));
        people.forEach((p, k) => on(p, 'in', k < n));
        on(word, 'old', t >= 2400);
        // the garment never stops growing: slow steps
        const grow = 1 + .04 * Math.floor(t / 2600) + .04 * ease.smooth(prog(t % 2600, 1900, 600));
        css(g, 'transform', `scale(${Math.min(grow, 1.24).toFixed(4)})`);
        on(posL, 'in', t >= 4200);
        on(c1, 'in', t >= 5600); on(c2, 'in', t >= 7000);
        dots.forEach((d, k) => {
          const p = ((t / 1400) + k / 3) % 1;
          attr(d, 'cx', lerp(444, 540, p).toFixed(1));
          css(d, 'opacity', t >= 9800 ? (Math.sin(Math.PI * p)).toFixed(3) : 0);
        });
        on(seatJ, 'q', t >= 12200);
        css(clBar, 'transform', `scaleY(${ease.out(prog(t, 9800, 600)).toFixed(4)})`);
      };
    },
  };

  window.CHAPTERS = [intro, garment, tailor, now, cost, room, closing];
})();
