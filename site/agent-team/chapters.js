/* =========================================================================
   Agent Team 研发提效 — chapters
   Each chapter builds its DOM into a 1280×764 scene and returns update(t),
   a pure function of chapter time t (ms). Discrete changes toggle classes
   (CSS transitions do the easing); continuous motion is computed here.
   Elements carrying data-at="ms" get class "in" from the player at that time,
   which plays their staggered entrance (rise / card / pop).
   ========================================================================= */
(() => {
  const { svg, agent } = IC;
  const { clamp, prog, lerp, ease, on, css, attr, txt, pad } = K;
  const $ = (r, s) => r.querySelector(s);
  const $$ = (r, s) => [...r.querySelectorAll(s)];
  const range = n => Array.from({ length: n }, (_, i) => i);

  /* Two comparison lanes: A = traditional, B = Agent Team. Returns the two content bodies (956px wide). */
  function lanes(root, a, b) {
    const mk = (k, c, i) => {
      root.insertAdjacentHTML('beforeend', `
        <section class="lane lane-${k}" style="top:${c.top}px;height:${c.h}px">
          <div class="lane-label rv" style="--i:${i}" data-at="60">
            <span class="lane-tag mono">${c.tag}</span>
            <span class="lane-txt"><b>${c.title}</b><small>${c.sub}</small></span>
          </div>
          <div class="lane-body"></div>
        </section>`);
      return root.lastElementChild.querySelector('.lane-body');
    };
    return { a: mk('a', a, 0), b: mk('b', b, 1) };
  }

  /* ───────────────────────── 00 · Intro ───────────────────────── */
  const SDLC = [
    ['doc', '需求', 'REQUIREMENTS'], ['tree', '架构', 'ARCHITECTURE'], ['code', '开发', 'DEVELOPMENT'],
    ['search', '测试', 'TESTING'], ['server', '发布', 'RELEASE'], ['clock', '运维', 'MAINTENANCE'],
  ];
  const intro = {
    id: 'intro', tab: '序章', hero: true, dur: 7200, kicker: '01 / 06 · 序章 INTRO', title: '',
    captions: [
      [0, 'Agent Team 如何改变研发流程？从单点的 AI 辅助，走向覆盖研发全生命周期的 Agent 团队。'],
      [2400, '需求、架构、开发、测试、发布、运维——每个研发环节都嵌入 Agent Team，人来掌舵。'],
    ],
    build(root) {
      root.innerHTML = `
        <span class="hero-k mono rv" data-at="150">AI 提效 · R&amp;D EFFICIENCY</span>
        <h2 class="hero-t rv" style="--i:1" data-at="150"><em>Agent Team</em> 如何改变研发流程</h2>
        <p class="hero-s rv" style="--i:2" data-at="150">从单点的 AI 辅助，到覆盖研发全生命周期的 Agent 团队<span class="mono">FROM INDIVIDUAL AI ASSISTANCE TO SCALE ACROSS THE SDLC</span></p>
        <div class="sdlc">
          ${SDLC.map((s, i) => `
            <div class="sd rv" style="--i:${i};left:${i * 192}px" data-at="1100">
              <span class="sd-ic">${svg(s[0])}</span><b>${s[1]}</b><small class="mono">${s[2]}</small>
              <span class="sd-badge">${agent()}</span>
            </div>
            ${i < 5 ? `<span class="sd-arr rv" style="--i:${i + 1};left:${i * 192 + 178}px" data-at="1100">${svg('chev')}</span>` : ''}`).join('')}
        </div>
        <i class="sweep"></i>
        <p class="hero-e rv" data-at="3700">${agent()}<span><b>Agent Teams embedded</b>每个研发环节都嵌入 Agent Team，人来掌舵</span></p>`;
      const badges = $$(root, '.sd-badge'), cards = $$(root, '.sd'), sweep = $(root, '.sweep');
      return t => {
        const p = ease.out(prog(t, 2400, 1500));
        css(sweep, 'transform', `scaleX(${p.toFixed(4)})`);
        cards.forEach((c, i) => {
          const hit = p >= (i * 192 + 60) / 1152;
          on(c, 'lit', hit); on(badges[i], 'in', hit);
        });
      };
    },
  };

  /* ───────────────────────── 01 · Process ───────────────────────── */
  const process = {
    id: 'process', tab: '流程', dur: 16000,
    kicker: '02 / 06 · 流程 PROCESS',
    title: '从串行交接，到<em>并行协作</em>',
    captions: [
      [0, '传统研发：产品、架构、开发、测试、运维——每一步由人手工完成，逐级交接、排队等待。'],
      [4300, 'Agent Team：人定义目标，Lead Agent 拆解任务，多个专职 Agent 并行推进。'],
      [9000, '人只在关键节点审核批准、对结果负责；护栏与校验贯穿全程。'],
      [13700, '传统流程完成 1 次交付的时间里，Agent Team 已完成 3 轮迭代（示意）。'],
    ],
    build(root) {
      const L = lanes(root,
        { top: 176, h: 214, tag: 'TRADITIONAL', title: '传统研发', sub: '工程师逐环节手工完成，串行交接' },
        { top: 422, h: 282, tag: 'AGENT TEAM', title: 'AI 协同研发', sub: '人来掌舵，Agent 团队执行' });

      /* Lane A: six hand-offs, one ticket travelling station to station. */
      const W = 956 / 6;
      const roles = [['产品经理', '写需求'], ['架构师', '设计方案'], ['开发工程师', '写代码'], ['测试工程师', '测试验证'], ['运维工程师', '部署维护'], ['交付', '发布上线']];
      L.a.innerHTML = roles.map((r, i) => `
          <div class="st rv" style="--i:${i};left:${i * W + 8}px;width:${W - 16}px" data-at="160">
            <span class="st-ic">${svg(i === 5 ? 'cube' : 'person')}</span><b>${r[0]}</b><small>${r[1]}</small>
            <i class="st-bar"><i></i></i><span class="st-done">${svg('check')}</span>
          </div>`).join('')
        + range(5).map(i => `<span class="st-arr rv" style="--i:${i + 1};left:${(i + 1) * W - 7}px" data-at="160">${svg('chev')}</span>`).join('')
        + `<div class="ticket"><span class="tk-card">${svg('doc')}</span><span class="tk-wait mono">等待交接…</span><span class="tk-ok">${svg('check')}</span></div>
           <div class="cyc rv" style="--i:6" data-at="160"><span>交付周期</span><i class="cyc-track"><i class="cyc-fill"></i></i><span class="cyc-end">较长周期<em> · 交付 ×1</em></span></div>`;
      const st = $$(L.a, '.st'), stBar = $$(L.a, '.st-bar>i'), ticket = $(L.a, '.ticket');
      const cycFill = $(L.a, '.cyc-fill'), cycEnd = $(L.a, '.cyc-end');

      /* Lane B: human → coordinated agent team → human approval → delivery. */
      const SP = [
        { zh: '需求', en: 'REQUIREMENTS', ic: 'doc', x: 84, y: 92, d: 900 },
        { zh: '测试', en: 'TESTING', ic: 'search', x: 240, y: 62, d: 1150 },
        { zh: '设计', en: 'DESIGN', ic: 'tree', x: 396, y: 92, d: 800 },
        { zh: '编码', en: 'CODING', ic: 'code', x: 396, y: 200, d: 1200 },
        { zh: '运维', en: 'DEVOPS', ic: 'server', x: 84, y: 200, d: 1000 },
      ];
      const LX = 240, LY = 150, TEAM_X = 184;
      L.b.innerHTML = `
        <div class="hum rv" style="--i:2" data-at="260">
          <span class="hum-ic">${svg('person')}</span>
          <ol class="hum-roles"><li><i>1</i>定义目标、分配任务</li><li><i>2</i>构建、调优 Agent</li><li><i>3</i>审核批准、对结果负责</li></ol>
        </div>
        <span class="flow-arrow rv" style="--i:3;left:157px;top:102px" data-at="260">${svg('arrow')}</span>
        <div class="team rv-card" style="--i:3" data-at="260">
          <div class="team-head"><span class="mono">COORDINATED AGENT TEAM</span><span class="guard">${svg('shield')}护栏 &amp; 校验</span></div>
          <svg class="team-lines" viewBox="0 0 480 282">
            ${SP.map(s => `<line class="ln-base" x1="${LX}" y1="${LY}" x2="${s.x}" y2="${s.y}"/>`).join('')}
            ${SP.map(s => `<line class="ln-on" pathLength="1" x1="${LX}" y1="${LY}" x2="${s.x}" y2="${s.y}"/>`).join('')}
          </svg>
          ${SP.map(s => `
            <div class="node sp" style="left:${s.x}px;top:${s.y}px">
              <svg class="ring" viewBox="0 0 56 56"><circle class="ring-fg" pathLength="1" cx="28" cy="28" r="26"/></svg>
              <span class="disc">${svg(s.ic)}</span>
              <span class="lbl"><b>${s.zh}</b><small class="mono">${s.en}</small></span>
            </div>`).join('')}
          <div class="node lead" style="left:${LX}px;top:${LY}px"><span class="disc">${agent()}</span><span class="lbl"><b>Lead Agent</b></span></div>
          ${SP.map(() => '<i class="tok mini"></i>').join('')}
        </div>
        <span class="flow-arrow rv" style="--i:4;left:671px;top:102px" data-at="260">${svg('arrow')}</span>
        <div class="appr rv" style="--i:4" data-at="260">
          <span class="appr-c"><svg viewBox="0 0 56 56"><circle class="appr-ring" cx="28" cy="28" r="26"/><path class="appr-ck" pathLength="1" d="M17 29l7.5 7.5L40 21"/></svg></span>
          <b>人工审核批准</b><small class="mono">HUMAN APPROVAL</small>
        </div>
        <span class="flow-arrow rv" style="--i:5;left:836px;top:102px" data-at="260">${svg('arrow')}</span>
        <div class="dlv rv" style="--i:5" data-at="260"><span class="dlv-ic">${svg('cube')}</span><b>已验证交付</b><span class="dlv-n mono">×<em>0</em></span></div>
        <i class="tok main"></i>`;
      const roleLi = $$(L.b, '.hum-roles li'), hum = $(L.b, '.hum');
      const lnOn = $$(L.b, '.ln-on'), spNodes = $$(L.b, '.node.sp'), rings = $$(L.b, '.ring-fg');
      const lead = $(L.b, '.node.lead'), minis = $$(L.b, '.tok.mini'), main = $(L.b, '.tok.main');
      const appr = $(L.b, '.appr'), dlvIc = $(L.b, '.dlv-ic'), dlvN = $(L.b, '.dlv-n em');

      // lane A timing
      const A0 = 700, AP = 2200, AWK = 1150, AWT = 600, AMV = 450;
      const cx = i => i * W + W / 2;
      // lane B timing: three iterations of IT ms
      const B0 = 900, IT = 4200, NIT = 3;
      const P0 = { x: 75, y: 42 }, PL = { x: TEAM_X + LX, y: LY }, PA = { x: 765, y: 112 }, PD = { x: 909, y: 112 };

      return t => {
        /* lane A */
        st.forEach((el, k) => {
          const s = A0 + k * AP;
          on(el, 'active', t >= s && t < s + AWK);
          on(el, 'done', t >= s + AWK);
          css(stBar[k], 'transform', `scaleX(${prog(t, s, AWK).toFixed(4)})`);
        });
        const i = clamp(Math.floor((t - A0) / AP), 0, 5), loc = t - A0 - i * AP;
        let x = cx(i), waiting = false;
        if (t >= A0 && i < 5 && loc >= AWK) {
          if (loc < AWK + AWT) waiting = true;
          else x = lerp(cx(i), cx(i + 1), ease.smooth(prog(loc, AWK + AWT, AMV)));
        }
        const aDone = A0 + 5 * AP + AWK;
        css(ticket, 'transform', `translate(${(x - 14).toFixed(1)}px,138px)`);
        on(ticket, 'in', t >= 420);
        on(ticket, 'waiting', waiting);
        on(ticket, 'ok', t >= aDone);
        css(cycFill, 'transform', `scaleX(${prog(t, A0, aDone - A0).toFixed(4)})`);
        on(cycEnd, 'done', t >= aDone);

        /* lane B */
        const k = Math.floor((t - B0) / IT), u = t - B0 - k * IT;
        const live = t >= B0 && k < NIT;
        let mx = P0.x, my = P0.y, mo = 0, ms = 1;
        if (live) {
          if (u < 350) { mo = ease.out(u / 350); ms = 0.6 + 0.4 * ease.back(u / 350); }
          else if (u < 950) { const p = ease.smooth((u - 350) / 600); mx = lerp(P0.x, PL.x, p); my = lerp(P0.y, PL.y, p); mo = 1; }
          else if (u < 3200) { mx = PL.x; my = PL.y; mo = 0; }
          else if (u < 3550) { const p = ease.smooth((u - 3200) / 350); mx = lerp(PL.x, PA.x, p); my = lerp(PL.y, PA.y, p); mo = 1; }
          else if (u < 3800) { mx = PA.x; my = PA.y; mo = 1; }
          else if (u < 4050) { const p = ease.smooth((u - 3800) / 250); mx = lerp(PA.x, PD.x, p); my = lerp(PA.y, PD.y, p); mo = 1; }
          else { mx = PD.x; my = PD.y; mo = 1 - prog(u, 4050, 150); }
        }
        css(main, 'transform', `translate(${(mx - 9).toFixed(1)}px,${(my - 9).toFixed(1)}px) scale(${ms.toFixed(3)})`);
        css(main, 'opacity', mo.toFixed(3));

        SP.forEach((s, j) => {
          let tx = LX, ty = LY, to = 0;
          if (live) {
            const a = 950 + j * 50, r = 2750 + j * 40;
            if (u >= a && u < a + 450) { const p = ease.smooth((u - a) / 450); tx = lerp(LX, s.x, p); ty = lerp(LY, s.y, p); to = 1; }
            else if (u >= r && u < r + 400) { const p = ease.smooth((u - r) / 400); tx = lerp(s.x, LX, p); ty = lerp(s.y, LY, p); to = 1; }
          }
          css(minis[j], 'transform', `translate(${(tx - 6).toFixed(1)}px,${(ty - 6).toFixed(1)}px)`);
          css(minis[j], 'opacity', to);
          const working = live && u >= 1400 && u < 3200;
          css(rings[j], 'stroke-dashoffset', (1 - (working ? prog(u, 1450, s.d) : 0)).toFixed(4));
          on(spNodes[j], 'busy', live && u >= 1400 && u < 1450 + s.d);
          on(spNodes[j], 'ok', live && u >= 1450 + s.d && u < 3200);
          on(lnOn[j], 'on', live && u >= 950 && u < 3250);
        });
        on(lead, 'busy', live && u >= 900 && u < 3300);
        on(hum, 'ping', live && u < 900);
        on(roleLi[0], 'on', live && u < 1000);
        on(roleLi[1], 'on', live && k === 1 && u >= 1000 && u < 3300);
        on(roleLi[2], 'on', live && u >= 3350 && u < 4150);
        on(appr, 'go', live && u >= 3550 && u < 4150);
        const delivered = clamp(Math.floor((t - B0 - 4050) / IT) + 1, 0, NIT);
        txt(dlvN, delivered);
        const bump = live && u >= 4050 ? Math.sin(Math.PI * prog(u, 4050, 380)) : 0;
        css(dlvIc, 'transform', `scale(${(1 + 0.16 * bump).toFixed(3)})`);
      };
    },
  };

  /* ───────────────────────── 02 · Time ───────────────────────── */
  function dayLane(body, human) {
    body.innerHTML = `
      <div class="vig rv" style="--i:2" data-at="260">
        <span class="pill mono"><i></i><em>工作中</em></span>
        <i class="desk"></i><span class="lap">${svg('laptop')}</span>
        ${human ? `<span class="home">${svg('home')}</span><span class="zz mono"><i>Z</i><i>z</i></span>` : `<span class="night-moon">${svg('moon')}</span>`}
        <span class="actor">${human ? svg('person') : agent()}</span>
      </div>
      <div class="out rv" style="--i:3" data-at="260">
        <div class="out-head"><span>已完成</span><b class="mono n-done">0</b>${human ? '<span>排队等待</span><b class="mono n-wait">0</b>' : ''}
          <span class="sum">${human ? '有效工时 <b class="mono">8h</b> / 天' : '有效工时 <b class="mono">24h</b> / 天 · 可用时长 <b class="mono">×3</b>'}</span></div>
        <div class="grid">${range(24).map(() => `<i class="slot"><i class="fill"></i><span class="ck">${svg('check')}</span>${human ? `<span class="wc">${svg('clock')}</span>` : ''}</i>`).join('')}</div>
      </div>
      <div class="tl rv" style="--i:4" data-at="260">
        <div class="tl-track">${range(24).map(() => '<i><i></i></i>').join('')}</div><i class="tl-head"></i>
        ${human ? '' : [0, 3, 6, 9, 12, 15, 18, 21, 24].map(h => `<span class="tl-lab mono${h === 0 ? ' at-start' : h === 24 ? ' at-end' : ''}" style="left:${(h / 24 * 100).toFixed(3)}%">${pad((9 + h) % 24)}:00</span>`).join('')}
      </div>`;
    return {
      vig: $(body, '.vig'), pill: $(body, '.pill'), pillT: $(body, '.pill em'), actor: $(body, '.actor'),
      home: $(body, '.home'), zz: $(body, '.zz'), moon: $(body, '.night-moon'),
      nDone: $(body, '.n-done'), nWait: $(body, '.n-wait'), sum: $(body, '.sum'),
      slots: $$(body, '.slot'), fills: $$(body, '.slot .fill'), cells: $$(body, '.tl-track>i'), cellF: $$(body, '.tl-track>i>i'), head: $(body, '.tl-head'),
    };
  }
  const time = {
    id: 'time', tab: '时间', dur: 18600,
    kicker: '03 / 06 · 时间 TIME',
    title: '人要下班，<em>Agent 24 小时在线</em>',
    captions: [
      [0, '同样的任务流：每小时都有一项新任务进来。'],
      [1800, '白天：工程师和 Agent Team 都在推进任务。'],
      [6600, '18:00 工程师下班，新任务开始排队；Agent Team 继续工作。'],
      [10800, '深夜：Agent 仍在编码、测试、验证，不受工时限制。'],
      [15700, '可用时长 8h → 24h：Agent 把等待时间变成交付时间。'],
    ],
    build(root) {
      root.insertAdjacentHTML('beforeend', `
        <div class="night-tint"></div>
        <div class="clock rv" style="--i:1" data-at="120">
          <span class="clock-ic"><span class="sun">${svg('sun')}</span><span class="moon">${svg('moon')}</span></span>
          <b class="mono clock-t">09:00</b><small class="mono clock-d">DAY 1</small>
        </div>`);
      const clock = $(root, '.clock'), clockT = $(root, '.clock-t'), clockD = $(root, '.clock-d');
      const L = lanes(root,
        { top: 176, h: 226, tag: 'HUMAN', title: '工程师', sub: '每天约 8 小时有效工时，下班后任务排队' },
        { top: 434, h: 250, tag: 'AGENT TEAM', title: 'Agent Team', sub: '7×24 小时持续运行' });
      const hu = dayLane(L.a, true), ag = dayLane(L.b, false);
      const work = h => h < 3 || (h >= 4 && h < 9); // 09–12, 13–18
      const T0 = 1200, HR = 600;

      return t => {
        const H = clamp((t - T0) / HR, 0, 24);
        const mins = Math.floor((9 * 60 + H * 60) / 10) * 10;
        txt(clockT, `${pad(Math.floor(mins / 60) % 24)}:${pad(mins % 60)}`);
        txt(clockD, mins >= 24 * 60 ? 'DAY 2' : 'DAY 1');
        const nf = ease.smooth(clamp((H - 9) / 2)) * (1 - ease.smooth(clamp((H - 20) / 2)));
        css(root, '--nf', nf.toFixed(3));
        on(clock, 'night', nf > 0.5);

        let done = 0, wait = 0;
        for (let h = 0; h < 24; h++) {
          const p = prog(H, h, 1);
          if (work(h)) {
            css(hu.fills[h], 'transform', `scaleY(${p.toFixed(3)})`);
            on(hu.slots[h], 'done', H >= h + 1); if (H >= h + 1) done++;
            css(hu.cellF[h], 'transform', `scaleX(${p.toFixed(3)})`);
          } else {
            const w = H >= h + 0.12; on(hu.slots[h], 'wait', w); if (w) wait++;
            on(hu.cells[h], 'off', H > h);
          }
          css(ag.fills[h], 'transform', `scaleY(${p.toFixed(3)})`);
          on(ag.slots[h], 'done', H >= h + 1);
          css(ag.cellF[h], 'transform', `scaleX(${p.toFixed(3)})`);
        }
        txt(hu.nDone, done); txt(hu.nWait, wait); txt(ag.nDone, Math.floor(H));
        const hx = `translateX(${(H / 24 * 956 - 1).toFixed(1)}px)`;
        css(hu.head, 'transform', hx); css(ag.head, 'transform', hx);

        // the engineer walks home at 18:00 and comes back at 09:00
        const away = ease.smooth(prog(H, 9, 0.7)) * (1 - ease.smooth(prog(H, 23.3, 0.7)));
        css(hu.actor, 'transform', `translateX(${(away * 132).toFixed(1)}px)`);
        css(hu.actor, 'opacity', (1 - away * 0.85).toFixed(3));
        on(hu.vig, 'away', away > 0.5);
        on(hu.home, 'lit', away > 0.8);
        on(hu.zz, 'on', H > 9.9 && H < 23.2);
        const off = (H >= 3 && H < 4) || (H >= 9 && H < 23.6);
        on(hu.pill, 'off', off);
        txt(hu.pillT, H < 3 ? '工作中' : H < 4 ? '午休' : H < 9 ? '工作中' : H < 23.6 ? '已下班 · 离线' : '上班');
        on(ag.pill, 'live', true);
        txt(ag.pillT, nf > 0.5 ? '夜间运行中' : '运行中');
        on(ag.moon, 'in', nf > 0.5);
        on(hu.sum, 'in', t >= 15800);
        on(ag.sum, 'in', t >= 16150);
      };
    },
  };

  /* ───────────────────────── 03 · Scale ───────────────────────── */
  const STEPS = [['编制审批', 'HEADCOUNT', 'stamp'], ['发布 JD', 'POST JD', 'megaphone'], ['筛选面试', 'INTERVIEW', 'chat'], ['Offer 入职', 'ONBOARD', 'badge'], ['培训上手', 'RAMP-UP', 'book']];
  const STAGES = ['需求', '架构', '开发', '测试', '发布', '运维'];
  const TEAMS = [ // two per SDLC stage, as on the slide
    ['R&D Requirement', 'Testing Requirement'], ['PRD Review', 'Architecture Review'], ['EEO Dev', 'AE Dev'],
    ['Feature Testing', 'UI Testing'], ['Cluster Mgmt.', 'Deployment'], ['EEO Trouble Shooting', 'EMS+ Maintenance'],
  ];
  const scale = {
    id: 'scale', tab: '规模', dur: 16200,
    kicker: '04 / 06 · 规模 SCALE',
    title: '扩展到更多团队：<em>招聘 vs 复制</em>',
    captions: [
      [0, '传统扩张：审批、招聘、面试、入职、培训——组建一个新团队往往需要数周到数月。'],
      [2200, 'Agent Team：把验证过的团队模板（技能、知识库、护栏）直接复制到新场景。'],
      [5000, '出现新场景？复用模板，快速拉起一个新的 Agent Team。'],
      [6700, '13 个 Agent Team、25+ 专职 Agent，覆盖 SDLC 全部 6 个阶段。'],
      [11000, '与此同时，传统招聘仍在面试与入职的路上。'],
    ],
    build(root) {
      const L = lanes(root,
        { top: 176, h: 196, tag: 'HIRING', title: '传统扩张', sub: '靠招聘，人力线性增长' },
        { top: 404, h: 280, tag: 'REPLICATE', title: 'Agent 扩张', sub: '复制已验证的团队模板，按需扩展' });

      /* Lane A: hiring funnel */
      const SW = 956 / 5;
      L.a.innerHTML = STEPS.map((s, i) => `
          <div class="hs rv" style="--i:${i};left:${i * SW + 8}px;width:${SW - 16}px" data-at="160">
            <span class="hs-ic">${svg(s[2])}</span>
            <span class="hs-txt"><b>${s[0]}</b><small class="mono">${s[1]}</small></span>
            <span class="st-done">${svg('check')}</span>
          </div>`).join('')
        + range(4).map(i => `<span class="st-arr rv" style="--i:${i + 1};left:${(i + 1) * SW - 7}px;top:40px" data-at="160">${svg('chev')}</span>`).join('')
        + `<div class="pool">${range(5).map(() => `<i>${svg('person')}</i>`).join('')}</div>
           <div class="ruler rv" style="--i:5" data-at="160"><i class="ruler-track"><i class="ruler-fill"></i></i>
             <span style="left:0">启动</span><span style="left:50%;translate:-50% 0">数周</span><span class="ruler-end" style="right:0">数月<em> · 新成员到岗，仍在磨合</em></span></div>`;
      const hs = $$(L.a, '.hs'), pool = $(L.a, '.pool'), people = $$(L.a, '.pool>i');
      const rFill = $(L.a, '.ruler-fill'), rEnd = $(L.a, '.ruler-end');

      /* Lane B: one template → 12 teams (+1 new scenario) */
      const GX = 214, CW = 742 / 6;
      const chipPos = range(12).map(n => { const c = Math.floor(n / 2), r = n % 2; return { l: GX + c * CW + 4, t: 26 + r * 76, c, r }; });
      const CHIP_H = 68, NEW_H = 58; // match .chip-v and .chip-new heights
      L.b.innerHTML = `
        <div class="tpl rv-card" data-at="300">
          <span class="tpl-k mono">TEMPLATE · 团队模板</span><b>Agent Team</b>
          <div class="tpl-faces">${agent()}${agent()}${agent()}</div>
          <ul><li>${svg('check')}Skills 技能</li><li>${svg('check')}知识库 Knowledge</li><li>${svg('check')}护栏 Guardrails</li></ul>
        </div>
        <span class="copy-ic">${svg('copy')}</span>
        ${STAGES.map((s, c) => `<span class="colh mono rv" style="--i:${c};left:${GX + c * CW + 4}px" data-at="1800">${s}</span>`).join('')}
        ${chipPos.map((p, n) => `<div class="chip chip-v" style="left:${p.l}px;top:${p.t}px;width:${CW - 8}px">${agent()}<span>${TEAMS[p.c][p.r]}</span></div>`).join('')}
        <div class="chip chip-new" style="left:0;top:214px;width:176px">${agent()}<span>新场景 Agent Team<em class="mono">复用模板</em></span></div>
        ${range(13).map(() => '<i class="ghost"></i>').join('')}
        <div class="stat rv" style="--i:0;left:${GX}px" data-at="6300"><b class="mono s-n">0</b><span>Agent Teams<small>覆盖关键研发场景</small></span></div>
        <div class="stat rv" style="--i:2;left:${GX + 250}px" data-at="6300"><b class="mono"><em class="s-n">0</em>+</b><span>专职 Agent<small>领域聚焦、可复用</small></span></div>
        <div class="stat rv" style="--i:4;left:${GX + 500}px" data-at="6300"><b class="mono"><em class="s-n">0</em>/6</b><span>SDLC 阶段覆盖<small>端到端支持研发实践</small></span></div>`;
      const tpl = $(L.b, '.tpl'), copyIc = $(L.b, '.copy-ic');
      const chips = $$(L.b, '.chip'), ghosts = $$(L.b, '.ghost'), stats = $$(L.b, '.s-n');
      const TX = 88, TY = 99; // template card centre
      const targets = chipPos.map(p => ({ x: p.l + (CW - 8) / 2, y: p.t + CHIP_H / 2, at: 2600 + (p.c * 2 + p.r) * 90 }))
        .concat([{ x: 88, y: 214 + NEW_H / 2, at: 5000 }]);

      const S0 = 600, SD = 2700;
      const c = k => k * SW + SW / 2;
      return t => {
        /* lane A */
        hs.forEach((el, i) => {
          const s = S0 + i * SD;
          on(el, 'active', t >= s && t < s + SD);
          on(el, 'done', t >= s + SD);        });
        const i = clamp(Math.floor((t - S0) / SD), 0, 4), loc = t - S0 - i * SD;
        let x = c(i);
        if (i < 4 && loc > SD - 500) x = lerp(c(i), c(i + 1), ease.smooth((loc - (SD - 500)) / 500));
        css(pool, 'transform', `translateX(${(x - 60).toFixed(1)}px)`);
        people.forEach((p, k) => {
          on(p, 'in', t >= S0 + SD + 200 + k * 80);
          on(p, 'gone', ((k === 1 || k === 3) && t >= S0 + 2 * SD + 1300) || ((k === 0 || k === 4) && t >= S0 + 3 * SD + 1300));
        });
        css(rFill, 'transform', `scaleX(${prog(t, S0, 5 * SD).toFixed(4)})`);
        on(rEnd, 'done', t >= S0 + 5 * SD);

        /* lane B */
        on(tpl, 'go', (t >= 2150 && t < 3700) || (t >= 4550 && t < 5000));
        on(copyIc, 'go', (t >= 2150 && t < 3700) || (t >= 4550 && t < 5000));
        targets.forEach((g, n) => {
          const g0 = g.at - 450;
          on(chips[n], 'in', t >= g.at);
          on(chips[n], 'fresh', t >= g.at && t < g.at + 900);
          if (t >= g0 && t < g.at) {
            const e = ease.smooth((t - g0) / 450);
            css(ghosts[n], 'transform', `translate(${(lerp(TX, g.x, e) - 20).toFixed(1)}px,${(lerp(TY, g.y, e) - 14).toFixed(1)}px) scale(${lerp(0.7, 1, e).toFixed(3)})`);
            css(ghosts[n], 'opacity', 1);
          } else css(ghosts[n], 'opacity', 0);
        });
        const cnt = (t0, n) => Math.round(n * ease.out(prog(t, t0, 1100)));
        txt(stats[0], cnt(6450, 13)); txt(stats[1], cnt(6600, 25)); txt(stats[2], cnt(6750, 6));
      };
    },
  };

  /* ───────────────────────── 04 · Knowledge ───────────────────────── */
  const KN = [['EEO', '调试经验'], ['EMS+', '部署脚本'], ['POI', '规则细节'], ['EcoOS', '测试用例']];
  const KB = ['EEO', 'EH', 'EMS+', 'POI', 'EcoOS', 'AI Box', 'R&D Rules'];
  const knowledge = {
    id: 'knowledge', tab: '知识', dur: 15200,
    kicker: '05 / 06 · 知识 KNOWLEDGE',
    title: '从知识在人脑中，到<em>共享知识库</em>',
    captions: [
      [0, '传统研发：关键经验分散在每个人脑中，靠口口相传、反复询问。'],
      [3600, 'Agent Team 共享同一个知识库：产品资料、研发规则与历史经验随取随用。'],
      [6000, '人员变动时，经验随人一起流失；'],
      [7800, '而 Agent 每次工作的经验都会沉淀回知识库，越用越强。'],
      [10400, '新 Agent 接入即拥有完整上下文；新人却要从零摸索。'],
    ],
    build(root) {
      const L = lanes(root,
        { top: 176, h: 226, tag: 'IN PEOPLE’S HEADS', title: '传统研发', sub: '知识在人脑中，难复用、易流失' },
        { top: 434, h: 250, tag: 'SHARED KNOWLEDGE', title: 'Agent Team', sub: '共享知识库，经验持续沉淀' });

      const EX = [110, 350, 590, 830];
      L.a.innerHTML = EX.map((x, i) => `
          <div class="eng rv" style="--i:${i};left:${x - 70}px" data-at="200">
            <div class="bub">${KN[i].map((k, j) => `<span style="--j:${j}">${k}</span>`).join('')}</div>
            <span class="p">${svg('person')}</span><span class="nm mono">ENGINEER ${'ABCD'[i]}</span>
          </div>`).join('')
        + `<div class="vacant" style="left:${EX[1] - 70}px"><span class="vac-box">?</span><span class="nm mono">VACANT · 空缺</span></div>`
        + `<div class="eng newbie" style="left:${EX[1] - 70}px"><div class="bub"><span class="q">?</span><span class="late">EMS+</span></div><span class="p">${svg('person')}</span><span class="nm mono">NEW HIRE</span></div>`
        + range(3).map(i => `<div class="ask" style="left:${EX[i] + 36}px;width:${EX[i + 1] - EX[i] - 72}px"><i class="dot"></i></div>`).join('')
        + `<span class="eng-tag t-leave" style="left:${EX[1] - 90}px">离职 / 转岗 · 经验随人流失</span>
           <span class="eng-tag t-new" style="left:${EX[1] - 90}px">新人 · 从零摸索</span>`;
      const engs = $$(L.a, '.eng:not(.newbie)'), newbie = $(L.a, '.newbie'), late = $(L.a, '.late'), vacant = $(L.a, '.vacant');
      const asks = $$(L.a, '.ask'), askDots = $$(L.a, '.ask .dot'), tLeave = $(L.a, '.t-leave'), tNew = $(L.a, '.t-new');

      const AX = [90, 290, 490, 690, 890];
      L.b.innerHTML = `
        <svg class="links" viewBox="0 0 956 250">
          ${AX.map(x => `<line class="lk" pathLength="1" x1="${x}" y1="80" x2="${x}" y2="180"/>`).join('')}
          ${AX.map(x => range(3).map(() => `<circle class="kd" cx="${x}" cy="180" r="3.2"/>`).join('')).join('')}
        </svg>
        ${AX.slice(0, 4).map((x, j) => `<div class="ag rv" style="--i:${j};left:${x - 40}px" data-at="200">${agent()}<span class="mono">AGENT</span><i class="ag-ok">${svg('check')}</i></div>`).join('')}
        <div class="ag newag" style="left:${AX[4] - 40}px">${agent()}<span class="mono">NEW AGENT</span><i class="ag-ok">${svg('check')}</i></div>
        <span class="ag-tag" style="left:${AX[4] - 172}px">即刻接入<br>完整上下文</span>
        <div class="kb rv-card" data-at="3500">
          <span class="kb-l">${svg('db')}<span><b>共享知识库</b><small class="mono">SHARED KNOWLEDGE BASE</small></span></span>
          ${KB.map((k, i) => `<span class="kb-c" style="left:${200 + i * 94}px">${k}</span>`).join('')}
          <span class="kb-c kb-new" style="left:${200 + 7 * 94}px">+ 经验沉淀</span>
        </div>`;
      const lks = $$(L.b, '.lk'), dots = $$(L.b, '.kd'), ags = $$(L.b, '.ag'), agOk = $$(L.b, '.ag-ok');
      const newag = $(L.b, '.newag'), agTag = $(L.b, '.ag-tag'), kb = $(L.b, '.kb'), kbc = $$(L.b, '.kb-c');

      return t => {
        /* lane A */
        asks.forEach((a, k) => {
          const ph = (t - 1200) / 1100, act = t >= 1200 && t < 5700 && Math.floor(ph) % 3 === k;
          on(a, 'on', act);
          on(a, 'cut', t >= 6000 && k < 2 && t < 8400);
          css(askDots[k], 'left', `${(ease.smooth(clamp((ph % 1) / 0.8)) * 100).toFixed(2)}%`);
        });
        on(engs[1], 'gone', t >= 6000);
        on(tLeave, 'in', t >= 6200 && t < 8300);
        on(vacant, 'in', t >= 6450 && t < 8400); // the empty seat, until the new hire fills it
        on(newbie, 'in', t >= 8400);
        on(tNew, 'in', t >= 8700);
        on(late, 'in', t >= 12400);

        /* lane B */
        kbc.forEach((ch, i) => on(ch, 'in', i < 7 ? t >= 3750 + i * 70 : t >= 9000));
        lks.forEach((l, j) => on(l, 'on', j < 4 ? t >= 4000 + j * 110 : t >= 10650));
        const feedback = t >= 7800 && t < 10400;
        on(kb, 'absorb', feedback);
        AX.forEach((x, j) => {
          const live = j < 4 ? t >= 4400 + j * 110 : t >= 11000;
          for (let d = 0; d < 3; d++) {
            const el = dots[j * 3 + d];
            const ph = ((t / 1500) + d / 3 + j * 0.17) % 1;
            const down = feedback && j < 4;
            attr(el, 'cy', (down ? 84 + ph * 92 : 176 - ph * 92).toFixed(1));
            css(el, 'opacity', live ? Math.sin(ph * Math.PI).toFixed(3) : 0);
            on(el, 'down', down);
          }
          const s = t - 4700 - j * 380;
          on(agOk[j], 'in', (j < 4 ? s > 0 : t >= 11400) && (j < 4 ? s % 2600 < 1100 : (t - 11400) % 2600 < 1100));
        });
        on(newag, 'in', t >= 10400);
        on(agTag, 'in', t >= 11000);
      };
    },
  };

  /* ───────────────────────── 05 · Impact ───────────────────────── */
  const BATCH = [4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3]; // 43 rules in 13 batches
  const CASES = [
    { id: 'EEO-462', ic: 'tree', zh: '例行 PR 校验', en: 'Routine PR validation', tags: ['边界清晰', '流程固定'], kind: 'bar', plus: '+ 人工复核', res: '2–4×', rz: '吞吐提升', re: 'HIGHER THROUGHPUT' },
    { id: 'EEO-456', ic: 'bug', zh: '根因排查', en: 'Root-cause investigation', tags: ['证据收集', '需要诊断'], kind: 'range', plus: '+ 人工验证', res: '1.5–3×', rz: '排查提速', re: 'FASTER INVESTIGATION' },
    { id: 'MATRIX-83', ic: 'list', zh: '大规模规则评审', en: 'Large-scale rule review', tags: ['43 条规则', '13 批'], kind: 'dots', res: '100%', rz: '评审覆盖', re: 'REVIEW COVERAGE' },
  ];
  const impact = {
    id: 'impact', tab: '成效', dur: 17000,
    kicker: '06 / 06 · 成效 IMPACT',
    title: '研发提效：<em>已落地的场景</em>',
    captions: [
      [0, '三个已落地的 Agent Team 场景：'],
      [1300, '例行 PR 校验：30 分钟 → 2 分钟 + 人工复核，吞吐提升 2–4 倍。'],
      [3100, '根因排查：2~4 小时 → 约 1 小时 + 人工验证，排查提速 1.5–3 倍。'],
      [4900, '大规模规则评审：43 条规则分 13 批系统化并行评审，覆盖率 100%。'],
      [10200, '从「人做事」，到「人定义意图、治理 Agent、为结果负责」。'],
    ],
    build(root) {
      const cmp = c => c.kind === 'dots' ? `
          <div class="cmp">
            <div class="drow trad"><span class="rl mono">逐条串行</span><b class="v mono">0/43</b><div class="dots">${range(43).map(() => '<i></i>').join('')}</div></div>
            <div class="drow ai"><span class="rl mono">并行 · 13 批</span><b class="v mono">0/43</b><div class="dots">${BATCH.map(n => `<span>${range(n).map(() => '<i></i>').join('')}</span>`).join('')}</div></div>
          </div>` : `
          <div class="cmp">
            <div class="row trad"><span class="rl mono">传统</span><i class="track"><i class="f"></i>${c.kind === 'range' ? '<i class="f2"></i>' : ''}</i><b class="v mono">—</b></div>
            <div class="row ai"><span class="rl mono">AGENT</span><i class="track"><i class="f"></i></i><b class="v mono">—</b></div>
            <span class="plus">${c.plus}</span>
          </div>`;
      root.innerHTML = CASES.map((c, i) => `
          <div class="case kind-${c.kind} rv-card" style="--i:${i * 2};left:${64 + i * 392}px" data-at="250">
            <span class="case-id mono">${c.id}</span><span class="case-ic">${svg(c.ic)}</span>
            <h3>${c.zh}</h3><p class="case-en">${c.en}</p>
            <p class="case-tags">${c.tags.map(x => `<span>${x}</span>`).join('')}</p>
            ${cmp(c)}
            <div class="res"><b class="mono">${c.res}</b><span>${c.rz}<small class="mono">${c.re}</small></span></div>
          </div>`).join('') + `
        <div class="closing">
          <i class="cl-bar"></i>
          <p class="cl-zh">${[['从', ''], ['「人做事」', 'hn'], ['，到 ', ''], ['人定义意图', 'hl'], ['、', ''], ['治理 Agent', 'hl'], ['、', ''], ['为结果负责', 'hl']]
            .map((w, i) => `<span class="rv ${w[1]}" style="--i:${i}" data-at="10350">${w[0]}</span>`).join('')}</p>
          <p class="cl-en mono rv" style="--i:9" data-at="10350">FROM PEOPLE DOING THE WORK TO PEOPLE DEFINING INTENT, GOVERNING AGENTS AND OWNING OUTCOMES</p>
        </div>`;
      const cards = $$(root, '.case'), clBar = $(root, '.cl-bar');
      const A = [1300, 3100, 4900];
      const parts = cards.map(el => ({
        tf: $(el, '.trad .f'), tf2: $(el, '.trad .f2'), tv: $(el, '.trad .v'),
        af: $(el, '.ai .f'), av: $(el, '.ai .v'), plus: $(el, '.plus'), res: $(el, '.res'),
        td: $$(el, '.trad .dots i'), ad: $$(el, '.ai .dots i'), batches: $$(el, '.ai .dots span'),
      }));
      return t => {
        parts.forEach((p, i) => {
          const a = A[i], c = CASES[i];
          on(cards[i], 'live', t >= a && t < a + 2600);
          if (c.kind === 'dots') {
            const n = Math.floor(prog(t, a, 5200) * 43);
            p.td.forEach((d, k) => on(d, 'on', k < n));
            txt(p.tv, `${n}/43`);
            let lit = 0;
            p.batches.forEach((b, k) => { const go = t >= a + 200 + k * 45; on(b, 'on', go); if (go) lit += BATCH[k]; });
            txt(p.av, `${lit}/43`);
            on(p.res, 'in', t >= a + 1500);
          } else {
            const tp = prog(t, a, 1600), ap = ease.out(prog(t, a, 350));
            if (c.kind === 'bar') {
              css(p.tf, 'transform', `scaleX(${tp.toFixed(4)})`);
              txt(p.tv, t < a ? '—' : `${Math.round(30 * tp)} min`);
              css(p.af, 'transform', `scaleX(${(ap * 2 / 30).toFixed(4)})`);
              txt(p.av, t < a ? '—' : `${Math.max(1, Math.round(2 * ap))} min`);
            } else {
              css(p.tf, 'transform', `scaleX(${clamp(tp * 2).toFixed(4)})`);
              css(p.tf2, 'transform', `scaleX(${clamp(tp * 2 - 1).toFixed(4)})`);
              txt(p.tv, t < a ? '—' : tp < 1 ? `${(tp * 4).toFixed(1)} hr` : '2~4 hr');
              css(p.af, 'transform', `scaleX(${(ap * 0.25).toFixed(4)})`);
              txt(p.av, t < a ? '—' : '1 hr');
            }
            on(p.plus, 'in', t >= a + 600);
            on(p.res, 'in', t >= a + 1900);
          }
        });
        css(clBar, 'transform', `scaleY(${ease.out(prog(t, 10200, 600)).toFixed(4)})`);
      };
    },
  };

  window.CHAPTERS = [intro, process, time, scale, knowledge, impact];
})();
