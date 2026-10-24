/* Builds the DOM for all 11 shot scenes inside #viz.
   Coordinate space for every scene: 1252 × 520 (the visual panel). */
(() => {
  const VW = 1252, VH = 520, CX = 626;
  const viz = document.getElementById('viz');
  const captions = document.getElementById('captions');

  let seed = 11;
  const reseed = (s) => { seed = s; };
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const R = (a, b) => a + (b - a) * rnd();
  const f = (n) => +n.toFixed(1);
  const add = (html) => viz.insertAdjacentHTML('beforeend', html);
  const svgOpen = `<svg viewBox="0 0 ${VW} ${VH}" aria-hidden="true">`;
  const chars = (s, cls = 'ch') => [...s].map((c, i) => `<span class="${cls}" style="--i:${i}">${c === ' ' ? '&nbsp;' : c}</span>`).join('');

  /* ---------------------------------------------------------------------
     S1 · 混沌 — server hall, red alarm state, then cyan after the scan
     --------------------------------------------------------------------- */
  function racks(c, front) {
    let s = '';
    for (let i = 0; i < 7; i++) {
      const x = 98 + i * 156, y = 150;
      s += `<rect x="${x}" y="${y}" width="120" height="300" rx="4" fill="${c.fill}" stroke="${c.frame}" stroke-width="1.5"/>`;
      s += `<rect x="${x + 6}" y="${y - 7}" width="108" height="7" rx="2" fill="${c.frame}" opacity=".3"/>`;
      for (let k = 0; k < 10; k++) {
        const yy = y + 12 + k * 28.4;
        s += `<rect x="${x + 10}" y="${f(yy)}" width="100" height="20" rx="2" fill="none" stroke="${c.slot}"/>`;
        s += `<rect x="${x + 16}" y="${f(yy + 8.5)}" width="${f(R(16, 50))}" height="3" fill="${c.slot}"/>`;
        const col = c.leds[rnd() < 0.6 ? 0 : 1];
        s += `<circle${front ? ' class="led"' : ''} cx="${x + 100}" cy="${f(yy + 10)}" r="3" fill="${col}"/>`;
        s += `<circle cx="${x + 91}" cy="${f(yy + 10)}" r="2" fill="${col}" opacity=".5"/>`;
      }
    }
    return s;
  }

  function rackSvg(red) {
    reseed(11);
    const c = red
      ? { frame: 'rgba(255,128,102,.6)', slot: 'rgba(255,101,79,.24)', fill: 'rgba(255,101,79,.045)', leds: ['#ff654f', '#ffac33'], cable: 'rgba(255,172,51,.4)', floor: 'rgba(255,101,79,.18)' }
      : { frame: 'rgba(89,199,255,.85)', slot: 'rgba(89,199,255,.26)', fill: 'rgba(89,199,255,.06)', leds: ['#59c7ff', '#3dcd58'], cable: 'rgba(89,199,255,.5)', floor: 'rgba(89,199,255,.22)' };
    let s = '';
    for (let i = -5; i <= 13; i++) {
      const xb = CX + (i - 4) * 170;
      const xt = CX + (xb - CX) * 0.7535;
      s += `<line x1="${f(xt)}" y1="450" x2="${f(xb)}" y2="520" stroke="${c.floor}"/>`;
    }
    [462, 481, 504].forEach((y) => { s += `<line x1="0" y1="${y}" x2="${VW}" y2="${y}" stroke="${c.floor}"/>`; });
    s += `<line x1="0" y1="450" x2="${VW}" y2="450" stroke="${c.frame}" opacity=".5"/>`;
    s += `<g opacity=".28" transform="translate(${CX} 236) scale(.58) translate(${-CX} -236)">${racks(c, false)}</g>`;
    s += racks(c, true);
    if (red) {
      for (let i = 0; i < 12; i++) {
        const x1 = R(90, 1160), x2 = R(90, 1160), sag = R(40, 170);
        s += `<path d="M${f(x1)} 146 C ${f(x1)} ${f(146 + sag)}, ${f(x2)} ${f(146 + sag)}, ${f(x2)} 146" fill="none" stroke="${c.cable}" stroke-width="${f(R(1.2, 2.8))}"/>`;
      }
      for (let i = 0; i < 8; i++) {
        const x1 = R(60, 1190), x2 = x1 + R(-160, 160);
        s += `<path d="M${f(x1)} 0 C ${f(x1)} 80, ${f(x2)} 60, ${f(x2)} 146" fill="none" stroke="${c.cable}" stroke-width="1.5" opacity=".7"/>`;
      }
    } else {
      s += `<rect x="80" y="104" width="1092" height="12" rx="3" fill="rgba(89,199,255,.06)" stroke="${c.cable}"/>`;
      for (let i = 0; i < 7; i++) {
        const x = 98 + i * 156 + 60;
        s += `<line x1="${x - 6}" y1="116" x2="${x - 6}" y2="143" stroke="${c.cable}" stroke-width="2"/>`;
        s += `<line x1="${x + 6}" y1="116" x2="${x + 6}" y2="143" stroke="rgba(61,205,88,.5)" stroke-width="2"/>`;
      }
    }
    return s;
  }

  function gaugeSvg() {
    let ticks = '';
    for (let k = 0; k <= 10; k++) {
      const t = (-90 + 18 * k) * Math.PI / 180;
      ticks += `<line x1="${f(110 + 60 * Math.sin(t))}" y1="${f(110 - 60 * Math.cos(t))}" x2="${f(110 + 68 * Math.sin(t))}" y2="${f(110 - 68 * Math.cos(t))}" stroke="rgba(255,255,255,.35)" stroke-width="${k % 5 ? 1 : 2}"/>`;
    }
    return `<svg viewBox="0 0 220 120" aria-hidden="true">
      <path d="M30 110 A80 80 0 0 1 190 110" stroke="rgba(255,255,255,.12)" stroke-width="10" fill="none"/>
      <path id="s1arcRed" d="M157 45.3 A80 80 0 0 1 190 110" stroke="#ff654f" stroke-width="10" fill="none"/>
      <path id="s1arcCyan" d="M30 110 A80 80 0 0 1 110 30" stroke="#59c7ff" stroke-width="10" fill="none" opacity="0"/>
      ${ticks}
      <g id="s1needle"><line x1="110" y1="110" x2="110" y2="44" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="110" cy="110" r="7" fill="#fff"/></g>
    </svg>`;
  }

  add(`<div class="scene" id="s1">
    <div class="cam" id="s1cam">
      <div class="layer" id="s1red">${svgOpen}${rackSvg(true)}</svg></div>
      <div class="layer" id="s1blue">${svgOpen}${rackSvg(false)}</svg></div>
    </div>
    <div class="glass s1-ro" id="s1roRed"><div class="k">实时能耗 · kW</div><b id="s1kw">982</b><div class="d">▲ 超基线 <span id="s1pct">12</span>% · 凭经验调参</div><span class="pill" id="s1warn">⚠ OVERLOAD 超限</span></div>
    <div class="glass s1-ro" id="s1roCyan"><div class="k">AI 扫描 · 接管</div><b>SCAN ✓</b><div class="d">1,248 台设备 · 3,906 测点已识别</div><span class="pill">● AI ONLINE</span></div>
    <div class="glass s1-gauge"><div class="k">冷机负荷 · CH-01</div>${gaugeSvg()}<div class="gv" id="s1gv">58%</div></div>
    <div class="scanline" id="s1scan"><i></i></div>
  </div>`);

  /* ---------------------------------------------------------------------
     S2 · 觉醒 — converging waves → AI core → isometric digital twin
     --------------------------------------------------------------------- */
  const S = 34, OX = 582, OY = 151.5;
  const iso = (x, y, z) => [OX + (x - y) * 0.866 * S, OY + (x + y) * 0.5 * S - z * S];
  const pt = (p) => iso(...p).map(f).join(' ');
  const poly = (pts) => 'M' + pts.map(pt).join(' L') + ' Z';
  const pline = (pts) => 'M' + pts.map(pt).join(' L');
  const box = (x, y, z, w, d, h) => [
    poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]]),
    poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]]),
    poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]]),
  ];

  let tw = '', twFill = '';
  const P = (d, st = 'rgba(89,199,255,.75)', sw = 1.3) => { tw += `<path class="draw" d="${d}" stroke="${st}" stroke-width="${sw}"/>`; };
  P(poly([[0, 0, 0], [12, 0, 0], [12, 9, 0], [0, 9, 0]]), 'rgba(89,199,255,.9)', 1.6);
  P(poly([[0, 0, 0], [0, 9, 0], [0, 9, 4], [0, 0, 4]]), 'rgba(89,199,255,.45)');
  P(poly([[0, 0, 0], [12, 0, 0], [12, 0, 4], [0, 0, 4]]), 'rgba(89,199,255,.45)');
  for (let x = 2; x < 12; x += 2) P(pline([[x, 0, 0], [x, 9, 0]]), 'rgba(89,199,255,.16)', 1);
  for (let y = 1.5; y < 9; y += 1.5) P(pline([[0, y, 0], [12, y, 0]]), 'rgba(89,199,255,.16)', 1);
  [[0.15, 2.4], [0.15, 5.6]].forEach(([x, y]) => box(x, y, 0, 0.6, 1.3, 2.6).forEach((d) => P(d, 'rgba(61,205,88,.85)')));
  for (const yy of [2.6, 5.2]) {
    for (let i = 0; i < 6; i++) {
      box(2 + i * 1.4, yy, 0, 1.0, 0.9, 2.2).forEach((d, k) => {
        P(d);
        twFill += `<path class="tw-fill" d="${d}" fill="rgba(89,199,255,${k === 0 ? 0.14 : 0.06})" opacity="0"/>`;
      });
    }
  }
  box(9.6, 7.0, 0, 2.0, 1.5, 1.3).forEach((d) => P(d, 'rgba(255,201,106,.9)'));
  P(pline([[9.6, 7.5, 0.35], [1.2, 7.5, 0.35], [1.2, 6.9, 0.35]]), 'rgba(89,199,255,.65)', 2);
  P(pline([[9.6, 8.1, 0.35], [0.9, 8.1, 0.35], [0.9, 6.9, 0.35]]), 'rgba(61,205,88,.65)', 2);

  add(`<div class="scene" id="s2">
    <div class="layer" id="twin">${svgOpen}${twFill}${tw}</svg></div>
    <div class="waves" id="waves"><i></i><i></i><i></i></div>
    <div class="tag s2tag" style="left:40px;top:34px">DIGITAL TWIN<b>数字孪生已建立</b></div>
    <div class="tag s2tag" style="left:1000px;top:34px">SENSOR 3,906<b>测点在线</b></div>
    <div class="tag green s2tag" style="left:120px;top:330px">CRAC × 2<b>精密空调</b></div>
    <div class="tag gold s2tag" style="left:780px;top:430px">CH-01<b>冷水机组</b></div>
  </div>`);

  /* shared AI core (S2–S4) */
  add(`<div class="core" id="core">
    <div class="core-glow" id="coreGlow"></div>
    <div class="core-ring r1"></div>
    <div class="core-ring r2"></div>
    <div class="core-pulse" id="pulse1"></div>
    <div class="core-pulse" id="pulse2"></div>
    <div class="core-body" id="coreBody">
      <svg viewBox="0 0 112 112" aria-hidden="true">
        <polygon points="56,2 104,30 104,82 56,110 8,82 8,30" fill="rgba(89,199,255,.14)" stroke="#59c7ff" stroke-width="2"/>
        <polygon points="56,18 90,38 90,74 56,94 22,74 22,38" fill="none" stroke="rgba(61,205,88,.7)" stroke-width="1.5"/>
      </svg>
      <span>AI</span>
      <small>DECISION CORE</small>
    </div>
  </div>`);

  /* ---------------------------------------------------------------------
     S3 · 多维感知 — four data orbs orbit the core
     --------------------------------------------------------------------- */
  const SLOTS = [225, 315, 45, 135];
  const arc = (a1, a2, r = 200) => {
    const p = (a) => [f(r * Math.cos(a * Math.PI / 180)), f(r * Math.sin(a * Math.PI / 180))];
    const [x1, y1] = p(a1), [x2, y2] = p(a2);
    return `M${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2}`;
  };
  let trails = '';
  SLOTS.forEach((a) => {
    [[54, 0.16], [34, 0.2], [18, 0.28]].forEach(([len, o]) => {
      trails += `<path d="${arc(a - len - 6, a - 6)}" stroke="#59c7ff" stroke-width="4" stroke-linecap="round" fill="none" opacity="${o}"/>`;
    });
  });
  const heat = Array.from({ length: 18 }, (_, i) => {
    const v = [0.9, 0.5, 0.3, 0.7, 0.95, 0.4, 0.6, 0.85, 0.2, 0.5, 0.75, 0.35, 0.3, 0.65, 0.9, 0.45, 0.25, 0.55][i];
    const col = v > 0.8 ? `rgba(255,172,51,${v})` : `rgba(89,199,255,${v})`;
    return `<i style="background:${col}"></i>`;
  }).join('');
  const ORBS = [
    `<div class="orb"><i class="ph ph-cloud-sun"></i><b>气象</b><span>32℃ · 68%RH</span></div>`,
    `<div class="orb"><svg viewBox="0 0 70 24"><polyline points="0,18 10,16 20,8 30,6 40,12 50,3 60,10 70,15" fill="none" stroke="#ffc96a" stroke-width="2"/></svg><b>电价</b><span>峰 1.12 ¥/kWh</span></div>`,
    `<div class="orb"><div class="heat">${heat}</div><b>业务负载</b><span>IT 4.2 MW</span></div>`,
    `<div class="orb o-green"><i class="ph ph-gear-six"></i><b>设备状态</b><span>COP 5.1 · 健康 96%</span></div>`,
  ];
  add(`<div class="scene" id="s3">
    ${svgOpen}
      <circle cx="${CX}" cy="260" r="200" fill="none" stroke="rgba(89,199,255,.18)" stroke-dasharray="3 7"/>
      <circle cx="${CX}" cy="260" r="128" fill="none" stroke="rgba(89,199,255,.1)"/>
    </svg>
    <div class="orbit" id="orbit">
      <svg class="trails" id="trails" viewBox="-300 -300 600 600" aria-hidden="true">${trails}</svg>
      ${SLOTS.map((a, i) => `<div class="slot" style="transform:rotate(${a}deg)">
        <i style="position:absolute;left:72px;top:-.5px;width:62px;height:1px;background:linear-gradient(90deg,rgba(89,199,255,.6),rgba(89,199,255,.05))"></i>
        <i class="feed"></i><i class="feed"></i>
        <div class="orb-pos" data-a="${a}">${ORBS[i]}</div>
      </div>`).join('')}
    </div>
  </div>`);

  /* ---------------------------------------------------------------------
     S4 · 安全边界 — golden hex shield, thresholds, bouncing anomalies
     --------------------------------------------------------------------- */
  const HEX = '346,300 486,155 766,155 906,300 766,445 486,445';
  add(`<div class="scene" id="s4">
    <div class="layer" id="shieldLayer">${svgOpen}
      <defs>
        <pattern id="hexpat" width="56" height="100" patternUnits="userSpaceOnUse" patternTransform="scale(.42)">
          <path d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100" fill="none" stroke="rgba(255,201,106,.42)" stroke-width="2.4"/>
        </pattern>
      </defs>
      <polygon points="${HEX}" fill="rgba(255,201,106,.05)"/>
      <polygon id="hexFill" points="${HEX}" fill="url(#hexpat)"/>
      <polygon points="${HEX}" fill="none" stroke="#ffc96a" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="${HEX}" fill="none" stroke="rgba(255,201,106,.35)" stroke-width="1" transform="translate(626 300) scale(.93) translate(-626 -300)"/>
    </svg></div>
    <div class="shield-flash" id="shieldFlash"></div>
    <div class="layer" id="s4eq">${svgOpen}
      <line class="draw" x1="626" y1="118" x2="626" y2="155" stroke="#ffc96a" stroke-width="2"/>
      <rect class="draw" x="450" y="262" width="150" height="76" rx="6" stroke="rgba(238,245,251,.8)" stroke-width="1.6"/>
      <circle class="draw" cx="492" cy="300" r="20" stroke="rgba(238,245,251,.8)" stroke-width="1.6"/>
      <circle class="draw" cx="558" cy="300" r="20" stroke="rgba(238,245,251,.8)" stroke-width="1.6"/>
      <path class="draw" d="M450 282 L410 282 M450 318 L410 318" stroke="rgba(89,199,255,.8)" stroke-width="3"/>
      ${[680, 718, 756].map((x) => `<rect class="draw" x="${x}" y="245" width="30" height="110" rx="3" stroke="rgba(238,245,251,.8)" stroke-width="1.6"/>`).join('')}
      ${[680, 718, 756].map((x) => [0, 1, 2, 3, 4, 5].map((k) => `<line x1="${x + 5}" y1="${258 + k * 16}" x2="${x + 25}" y2="${258 + k * 16}" stroke="rgba(89,199,255,.5)" class="eq-fill" opacity="0"/>`).join('')).join('')}
      <text class="eq-fill" x="525" y="368" text-anchor="middle" fill="#c9d6e2" font-size="15" font-weight="800" opacity="0">冷水机组</text>
      <text class="eq-fill" x="733" y="384" text-anchor="middle" fill="#c9d6e2" font-size="15" font-weight="800" opacity="0">服务器集群</text>
    </svg></div>
    <div class="tag gold th" data-c style="left:240px;top:230px">TEMP<b>&lt; 25℃</b></div>
    <div class="tag gold th" data-c style="left:1010px;top:230px">冷冻水<b>≥ 7℃</b></div>
    <div class="tag gold th" data-c style="left:240px;top:380px">压差<b>≥ 80 kPa</b></div>
    <div class="tag gold th" data-c style="left:1010px;top:380px">湿度<b>40–60%RH</b></div>
    ${['异常指令 SET 16℃', '越限请求', '数据漂移', '传感器噪声', '过载调度', '非法写入'].map((t) => `<div class="anom"><i></i><span>${t}</span></div>`).join('')}
    ${Array.from({ length: 6 }, () => '<i class="ripple"></i>').join('')}
    <div class="tag gold" id="s4count" style="left:530px;top:478px;opacity:0;visibility:hidden">边界守护<b>已拦截 <span id="blockN">0</span> / 6</b></div>
  </div>`);

  /* ---------------------------------------------------------------------
     S5 · 云边协同 — python waterfall + neural net / C++ blocks → chip
     --------------------------------------------------------------------- */
  const PY = ['import torch.nn as nn', 'X = load_bms(window="15min")', 'model = LSTM(hidden=256)', 'for epoch in range(500):', '    pred = model(X)', '    loss = mse(pred, y)', '    loss.backward()', '    optimizer.step()', 'cop = model.optimize(state)', 'torch.save(model, "cop.pt")', 'weather = fetch_forecast()', 'tariff = price.tou(hours=24)'];
  const fallCols = Array.from({ length: 3 }, (_, c) => {
    const lines = PY.slice(c * 4).concat(PY.slice(0, c * 4));
    const html = lines.concat(lines).map((l) => `<div>${l.replace(/ /g, '&nbsp;')}</div>`).join('');
    return `<div class="col">${html}</div>`;
  }).join('');
  const LAYERS = [[760, 4], [880, 6], [1000, 6], [1120, 3]];
  const nodes = LAYERS.map(([x, n]) => Array.from({ length: n }, (_, j) => [x, 140 + (j - (n - 1) / 2) * 34]));
  let edges = '', hot = '', nnNodes = '';
  for (let l = 0; l < nodes.length - 1; l++) {
    nodes[l].forEach((a) => nodes[l + 1].forEach((b) => {
      edges += `<line class="draw nn-e" x1="${a[0]}" y1="${f(a[1])}" x2="${b[0]}" y2="${f(b[1])}" stroke="rgba(61,205,88,.32)"/>`;
      if (rnd() < 0.22) hot += `<line class="nn-hot" x1="${a[0]}" y1="${f(a[1])}" x2="${b[0]}" y2="${f(b[1])}" stroke="#9ff5ae" stroke-width="2" opacity="0"/>`;
    }));
  }
  nodes.flat().forEach(([x, y]) => { nnNodes += `<circle class="nn-n" cx="${x}" cy="${f(y)}" r="7" fill="#06140a" stroke="#3dcd58" stroke-width="2"/>`; });
  let pins = '';
  for (let k = 0; k < 6; k++) {
    const p = 16 + k * 17.6;
    pins += `M${f(p)} 0 L${f(p)} -10 M${f(p)} 120 L${f(p)} 130 M0 ${f(p)} L-10 ${f(p)} M120 ${f(p)} L130 ${f(p)} `;
  }
  const CPP = ['infer(ctx, &t);', 'vfd.set_hz(38.4f);', '#include <rt.h>', 'valve->open(.62);', 'q8_t w[256];', 'auto t0 = now();', 'simd::dot(a, b);', 'rt.tick();', 'return 0;', 'mutex.lock();', 'u8 buf[64];', 'static_cast<f32>'];
  add(`<div class="scene" id="s5">
    ${svgOpen}
      <line class="draw" id="div5" x1="20" y1="268" x2="1232" y2="268" stroke="rgba(255,255,255,.16)"/>
      ${edges}${hot}${nnNodes}
      <line class="draw" id="fiber" x1="960" y1="244" x2="960" y2="352" stroke="#bff6ff" stroke-width="2.5"/>
    </svg>
    <div class="zone-label" style="left:28px;top:20px;color:var(--green)">CLOUD · PYTHON<b>云端深度训练</b></div>
    <div class="zone-label" style="left:28px;top:286px;color:var(--orange)">EDGE · C++<b>边缘毫秒级推理</b></div>
    <div class="fall" id="fall">${fallCols}</div>
    <div class="glass gw" id="gw">
      <div class="k">EDGE GATEWAY · 边缘网关</div>
      <div class="log">
        <div class="ln"><span>[cc]</span> cop_infer.cpp · -O3</div>
        <div class="ln"><span>[ld]</span> libedge.so · INT8</div>
        <div class="ln ok">✓ BUILD OK · 1.2 MB</div>
      </div>
      <div class="gbar"><i id="gwBar"></i></div>
    </div>
    ${CPP.map((t) => `<div class="cpp">${t}</div>`).join('')}
    <div class="chip" id="chip">
      <svg viewBox="0 0 120 120" style="position:absolute;inset:0;width:120px;height:120px;overflow:visible" aria-hidden="true">
        <rect class="draw" x="0" y="0" width="120" height="120" rx="10" stroke="#ffac33" stroke-width="2.5"/>
        <path class="draw" d="${pins}" stroke="#ffac33" stroke-width="2"/>
      </svg>
      <div class="cells">${'<i></i>'.repeat(16)}</div>
    </div>
    <div class="tag orange" id="chipTag" style="left:1050px;top:396px;opacity:0;visibility:hidden">EDGE NPU<b>INT8 · 8 ms</b></div>
    <div class="tag green" id="fiberTag" style="left:986px;top:280px;opacity:0;visibility:hidden">MODEL ↓ OTA<b>光纤互联</b></div>
    ${'<i class="pulse-dot down"></i>'.repeat(3)}${'<i class="pulse-dot up"></i>'.repeat(3)}
  </div>`);

  /* ---------------------------------------------------------------------
     S6 · 决策大脑 — edge chip projects three holograms
     --------------------------------------------------------------------- */
  const load = (x) => 118 - 52 * Math.sin((x / 324) * Math.PI * 2 * 0.85 - 1.1) - 8 * Math.sin(x / 19);
  let past = 'M0 ' + f(load(0)), fut = 'M180 ' + f(load(180)), bandU = [], bandL = [];
  for (let x = 6; x <= 180; x += 6) past += ` L${x} ${f(load(x))}`;
  for (let x = 186; x <= 324; x += 6) fut += ` L${x} ${f(load(x))}`;
  for (let x = 180; x <= 324; x += 12) {
    const w = 4 + (x - 180) * 0.12;
    bandU.push(`${x},${f(load(x) - w)}`);
    bandL.unshift(`${x},${f(load(x) + w)}`);
  }
  const NODES6 = { CH: [50, 150], PU: [274, 150], CT: [162, 34] };
  const OPT = [162, 108];
  add(`<div class="scene" id="s6">
    <div id="s6rig">
      ${svgOpen}
        <line class="draw beam" x1="626" y1="420" x2="236" y2="368" stroke="url(#beamG)" stroke-width="3"/>
        <line class="draw beam" x1="626" y1="420" x2="626" y2="368" stroke="url(#beamG)" stroke-width="3"/>
        <line class="draw beam" x1="626" y1="420" x2="1016" y2="368" stroke="url(#beamG)" stroke-width="3"/>
        <defs><linearGradient id="beamG" gradientUnits="userSpaceOnUse" x1="0" y1="420" x2="0" y2="368"><stop offset="0" stop-color="#ffc96a"/><stop offset="1" stop-color="#59c7ff"/></linearGradient></defs>
      </svg>
      ${'<i class="beam-dot"></i>'.repeat(3)}

      <div class="glass holo" style="left:56px">
        <div class="hk"><span>01 · FORECAST</span><i class="ph ph-chart-line-up"></i></div>
        <h3>负荷预测</h3>
        <svg class="plot" viewBox="0 0 324 200" aria-hidden="true">
          ${[40, 90, 140].map((y) => `<line x1="0" y1="${y}" x2="324" y2="${y}" stroke="rgba(255,255,255,.06)"/>`).join('')}
          <line x1="0" y1="186" x2="324" y2="186" stroke="rgba(255,255,255,.2)"/>
          <polygon id="fBand" points="${bandU.concat(bandL).join(' ')}" fill="rgba(89,199,255,.14)" opacity="0"/>
          <path class="draw" id="fPast" d="${past}" stroke="#59c7ff" stroke-width="3"/>
          <path class="draw" id="fFut" d="${fut}" stroke="#3dcd58" stroke-width="3" stroke-linecap="round"/>
          <g id="fNow" opacity="0"><line x1="180" y1="10" x2="180" y2="186" stroke="rgba(255,255,255,.4)" stroke-dasharray="3 4"/><text x="186" y="20" fill="#8aa0b3" font-size="12" font-family="JetBrains Mono">NOW</text></g>
        </svg>
        <div class="foot">未来 24h 峰值 <b>14:00 · 4.6 MW</b> · 误差 <b>2.7%</b></div>
        <i class="holo-ring"></i>
      </div>

      <div class="glass holo" style="left:446px">
        <div class="hk"><span>02 · OPTIMIZE</span><i class="ph ph-target"></i></div>
        <h3>全局寻优</h3>
        <svg class="plot" viewBox="0 0 324 200" aria-hidden="true">
          <path class="draw" d="M${NODES6.CH} L${NODES6.PU} L${NODES6.CT} Z" stroke="rgba(89,199,255,.5)" stroke-width="1.5"/>
          <path class="flowl" d="M${NODES6.CH} L${NODES6.PU} L${NODES6.CT} Z" stroke="#59c7ff" stroke-width="2" stroke-dasharray="4 10" fill="none" opacity="0"/>
          ${Object.values(NODES6).map((p) => `<line class="draw" x1="${p[0]}" y1="${p[1]}" x2="${OPT[0]}" y2="${OPT[1]}" stroke="rgba(61,205,88,.35)" stroke-dasharray="0"/>`).join('')}
          ${Object.entries(NODES6).map(([k, p]) => `<g class="n6"><circle cx="${p[0]}" cy="${p[1]}" r="25" fill="#071624" stroke="#59c7ff" stroke-width="2"/><text x="${p[0]}" y="${p[1] + 5}" text-anchor="middle" fill="#eef5fb" font-size="13" font-weight="800">${{ CH: '冷机', PU: '水泵', CT: '冷却塔' }[k]}</text></g>`).join('')}
          ${Array.from({ length: 5 }, () => `<circle class="seek" cx="0" cy="0" r="4" fill="#ffc96a" opacity="0"/>`).join('')}
          <g id="optG" opacity="0">
            <circle cx="${OPT[0]}" cy="${OPT[1]}" r="22" fill="none" stroke="#3dcd58" stroke-width="2" id="optRing"/>
            <polygon points="${OPT[0]},${OPT[1] - 11} ${OPT[0] + 10},${OPT[1]} ${OPT[0]},${OPT[1] + 11} ${OPT[0] - 10},${OPT[1]}" fill="#3dcd58"/>
            <text x="${OPT[0] + 30}" y="${OPT[1] + 6}" fill="#3dcd58" font-size="16" font-weight="700" font-family="JetBrains Mono">COP 6.8</text>
          </g>
        </svg>
        <div class="foot">冷冻水 <b id="r6a">7.0</b>℃ · 水泵 <b id="r6b">50</b>Hz · 塔 <b id="r6c">40</b>Hz</div>
        <i class="holo-ring"></i>
      </div>

      <div class="glass holo" style="left:836px">
        <div class="hk"><span>03 · EVOLVE</span><i class="ph ph-dna"></i></div>
        <h3>持续进化</h3>
        <div class="seasons"><i class="hi" id="seasonHi"></i><span>春</span><span>夏</span><span>秋</span><span>冬</span></div>
        ${Array.from({ length: 6 }, (_, i) => `<i class="beam-dot evo-dot" style="left:${70 + i * 44}px;top:136px;box-shadow:0 0 10px 2px #3dcd58;background:#c9ffd4"></i>`).join('')}
        <div class="model-ico" id="modelIco">
          <svg viewBox="0 0 92 92" aria-hidden="true">
            <polygon points="46,2 86,24 86,68 46,90 6,68 6,24" fill="rgba(61,205,88,.14)" stroke="#3dcd58" stroke-width="2"/>
            <path d="M26 46 L46 30 L66 46 L46 62 Z M46 30 L46 62 M26 46 L66 46" stroke="rgba(201,255,212,.8)" stroke-width="1.5" fill="none"/>
            <circle cx="46" cy="30" r="4" fill="#c9ffd4"/><circle cx="26" cy="46" r="4" fill="#c9ffd4"/><circle cx="66" cy="46" r="4" fill="#c9ffd4"/><circle cx="46" cy="62" r="4" fill="#c9ffd4"/>
          </svg>
        </div>
        <div class="acc"><i id="accBar"></i></div>
        <div class="foot">模型 <b id="ver">v1.0</b> · 准确率 <b id="accTxt">82</b>%</div>
        <i class="holo-ring"></i>
      </div>

      <div class="edge-chip" id="s6chip" style="left:584px;top:420px">EDGE<br>AI</div>
    </div>
  </div>`);

  /* ---------------------------------------------------------------------
     S7 · 精准执行 — instruction packets → VFD + motor, valve + pipe
     --------------------------------------------------------------------- */
  const blades = [0, 90, 180, 270].map((a) => `<path d="M1070 130 C 1050 100, 1062 62, 1070 52 C 1082 64, 1090 100, 1070 130 Z" fill="rgba(89,199,255,.28)" stroke="#59c7ff" stroke-width="1.5" transform="rotate(${a} 1070 130)"/>`).join('');
  add(`<div class="scene" id="s7">
    ${svgOpen}
      <path class="draw bus" d="M190 260 L420 260 L420 130 L640 130" stroke="#ffc96a" stroke-width="2"/>
      <path class="draw bus" d="M420 260 L420 300 L866 300" stroke="#ffc96a" stroke-width="2"/>
      <path class="draw bus" d="M890 130 L982 130" stroke="rgba(89,199,255,.7)" stroke-width="3"/>
      <circle cx="1070" cy="130" r="86" fill="rgba(5,14,24,.8)" stroke="rgba(238,245,251,.5)" stroke-width="2"/>
      <g id="fan">${blades}<circle cx="1070" cy="130" r="12" fill="#0e1d2c" stroke="#eef5fb" stroke-width="2"/></g>
      <circle id="fanRing" cx="1070" cy="130" r="100" fill="none" stroke="#59c7ff" stroke-width="2" stroke-dasharray="6 10" opacity="0"/>
      <text x="1070" y="246" text-anchor="middle" fill="#8aa0b3" font-size="13" font-family="JetBrains Mono" letter-spacing="2">PUMP MOTOR</text>
      <path d="M560 406 L1240 406 M560 434 L1240 434" stroke="rgba(238,245,251,.55)" stroke-width="2"/>
      <rect x="556" y="400" width="10" height="40" rx="2" fill="#2a3138" stroke="rgba(238,245,251,.55)"/>
      <line x1="900" y1="332" x2="900" y2="400" stroke="rgba(238,245,251,.7)" stroke-width="4"/>
      <path d="M872 398 L900 420 L872 442 Z M928 398 L900 420 L928 442 Z" fill="#1a2733" stroke="rgba(238,245,251,.8)" stroke-width="2"/>
      <g id="hw">
        <circle cx="900" cy="300" r="32" fill="none" stroke="#eef5fb" stroke-width="3"/>
        <path d="M900 268 L900 332 M868 300 L932 300" stroke="#eef5fb" stroke-width="2.5"/>
        <circle cx="900" cy="300" r="6" fill="#eef5fb"/>
      </g>
      <circle id="hwRing" cx="900" cy="300" r="44" fill="none" stroke="#ffc96a" stroke-width="2" stroke-dasharray="5 8" opacity="0"/>
    </svg>
    <div class="flows" id="flows">${Array.from({ length: 9 }, () => '<i class="flow-dot"></i>').join('')}</div>
    <div class="glass vfd">
      <div class="k">VFD-02 · 冷却泵变频器</div>
      <div class="disp"><span id="hz">50.0</span><small>Hz</small></div>
      <div class="st"><span class="leds"><i class="led"></i><i class="led ok" id="vfdOk"></i></span><span id="vfdSt">工频运行 · 手动</span></div>
    </div>
    <div class="edge-chip" style="left:98px;top:218px">EDGE<br>AI</div>
    <div class="typed" id="code1" style="left:52px;top:322px">${chars('vfd.set_hz(38.4f);')}</div>
    <div class="typed" id="code2" style="left:52px;top:348px">${chars('valve->open(0.62);')}</div>
    <div class="tag green" id="latTag" style="left:56px;top:150px;opacity:0;visibility:hidden">端到端延迟<b>8 ms ✓</b></div>
    <div class="tag gold" id="valveTag" style="left:952px;top:258px">EV-07 电动阀<b>开度 <span id="valvePct">30</span>%</b></div>
    <div class="tag" id="pwTag" style="left:600px;top:466px;opacity:0;visibility:hidden">冷却泵功率<b>↓ <span id="pw">0.0</span>%</b></div>
    <div class="packet" id="pk1">SET_HZ 38.4</div>
    <div class="packet" id="pk2">VALVE 62%</div>
    ${'<i class="spark sp1"></i>'.repeat(3)}${'<i class="spark sp2"></i>'.repeat(3)}
  </div>`);

  /* ---------------------------------------------------------------------
     S8 · 人机协同 — AR suggestion card, confirm, switch to auto loop
     --------------------------------------------------------------------- */
  const rows = (green) => [
    ['冷冻水出水温度', '7.0℃', '8.5℃'],
    ['冷却泵频率', '50 Hz', '42 Hz'],
    ['冷却塔风机', '40 Hz', '35 Hz'],
  ].map(([k, a, b]) => `<div class="rowi"><span>${k}</span><span class="v">${a}</span><span class="arr">→</span><span class="v2">${b}</span><span class="ok${green ? ' okg' : ''}">✓</span></div>`).join('');
  const bl = (x, y, dx, dy) => `M${x + dx * 26} ${y} L${x} ${y} L${x} ${y + dy * 26}`;
  add(`<div class="scene" id="s8">
    ${svgOpen}
      <path d="M80 520 C 80 384, 124 328, 200 328 C 276 328, 320 384, 320 520 Z" fill="#0c1c2a" stroke="rgba(89,199,255,.4)" stroke-width="1.5"/>
      <rect x="176" y="266" width="48" height="70" rx="12" fill="#0c1c2a" stroke="rgba(89,199,255,.4)" stroke-width="1.5"/>
      <circle cx="200" cy="214" r="66" fill="#0f2232" stroke="rgba(89,199,255,.45)" stroke-width="1.5"/>
      <rect x="138" y="190" width="124" height="32" rx="14" fill="rgba(255,201,106,.28)" stroke="#ffc96a" stroke-width="2"/>
      <rect id="glassG" x="138" y="190" width="124" height="32" rx="14" fill="rgba(61,205,88,.3)" stroke="#3dcd58" stroke-width="2" opacity="0"/>
      <path id="mouthA" d="M182 252 L218 252" stroke="rgba(238,245,251,.6)" stroke-width="3" stroke-linecap="round"/>
      <path id="mouthB" d="M178 248 Q200 268 222 248" stroke="#eef5fb" stroke-width="3" stroke-linecap="round" fill="none" opacity="0"/>
      <path class="draw ray" d="M262 206 L426 60" stroke="rgba(255,201,106,.35)" stroke-dasharray="0"/>
      <path class="draw ray" d="M262 206 L426 500" stroke="rgba(255,201,106,.35)"/>
      <path class="draw arb" d="${bl(426, 20, 1, 1)}" stroke="#59c7ff" stroke-width="2.5"/>
      <path class="draw arb" d="${bl(1194, 20, -1, 1)}" stroke="#59c7ff" stroke-width="2.5"/>
      <path class="draw arb" d="${bl(426, 500, 1, -1)}" stroke="#59c7ff" stroke-width="2.5"/>
      <path class="draw arb" d="${bl(1194, 500, -1, -1)}" stroke="#59c7ff" stroke-width="2.5"/>
    </svg>
    <div class="tag" style="left:60px;top:40px">ENGINEER · AR<b>值班工程师</b></div>
    <div class="tag green" id="ackTag" style="left:60px;top:84px;opacity:0;visibility:hidden">已确认<b>10:24:08</b></div>
    <div class="card gold-ui" id="cardGold">
      <div class="top"><span class="mode-pill">建议模式 · HITL</span><span class="conf">AI 置信度 94%</span></div>
      <h3>AI 决策建议<small>#A-1024</small></h3>
      <div class="rows">${rows(false)}</div>
      <div class="foot"><span>预计节能 <b>12.6%</b></span><span>风险 <b>nominal</b></span><span>安全边界 <b>✓</b></span></div>
      <div class="confbar"><i id="confBar"></i></div>
      <div class="actions"><span class="fake-btn ghost">驳回</span><span class="fake-btn go" id="goBtn"><i class="ph-bold ph-check"></i>确认执行</span></div>
    </div>
    <div class="card green-ui" id="cardGreen">
      <div class="top"><span class="mode-pill">自动闭环模式 · AUTO</span><span class="conf">AI 置信度 94%</span></div>
      <h3>闭环执行中<small>#A-1024</small></h3>
      <div class="rows">${rows(true)}</div>
      <div class="foot"><span>实时节能 <b>12.6%</b></span><span>风险 <b>nominal</b></span><span>安全边界 <b>✓</b></span></div>
      <div class="confbar"><i style="transform:scaleX(1);background:var(--gradient-cyan-green)"></i></div>
      <div class="loop-st"><i class="ph ph-arrows-clockwise" id="loopIco"></i><span>闭环运行中 · <span id="loopN">0</span>/3</span></div>
    </div>
    <div class="cursor" id="cursor"><svg viewBox="0 0 34 34" aria-hidden="true"><path d="M4 2 L4 28 L11 21 L16 32 L21 30 L16 19 L26 19 Z" fill="#fff" stroke="#05101a" stroke-width="2" stroke-linejoin="round"/></svg></div>
    <i class="click-ring" id="clickRing"></i>
  </div>`);

  /* ---------------------------------------------------------------------
     S9 · 产品赋能 — cabinet upgrade, exploded view, replicate to city
     --------------------------------------------------------------------- */
  reseed(5);
  let blocks = '';
  for (let c = 0; c < 8; c++) {
    for (let r = 0; r < 7; r++) {
      const x = 712 + c * 64, y = 46 + r * 62;
      const tall = rnd() < 0.25;
      blocks += `<rect class="blk" x="${f(x + R(2, 8))}" y="${f(y + R(2, 8))}" width="${f(R(34, 50))}" height="${f(R(30, 46))}" rx="3" fill="rgba(89,199,255,${tall ? 0.12 : 0.04})" stroke="rgba(89,199,255,${tall ? 0.45 : 0.22})" opacity="0"/>`;
    }
  }
  const MAPN = [[790, 112], [1012, 92], [1166, 236], [884, 334], [1090, 420]];
  add(`<div class="scene" id="s9">
    ${svgOpen}
      <rect class="draw" id="mapFrame" x="700" y="34" width="530" height="452" rx="14" stroke="rgba(89,199,255,.35)"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7].map((c) => `<line class="draw road" x1="${708 + c * 64}" y1="40" x2="${708 + c * 64}" y2="480" stroke="rgba(89,199,255,.1)"/>`).join('')}
      ${blocks}
      <path class="draw lead" d="M262 94 L150 60" stroke="rgba(89,199,255,.6)"/>
      <path class="draw lead" d="M600 274 L640 400" stroke="rgba(89,199,255,.6)"/>
      <path class="draw lead" d="M360 440 L360 452" stroke="rgba(89,199,255,.6)"/>
    </svg>
    <div class="cab" id="cab">
      <div class="part cab-old" id="cabOld">
        <div class="scr"></div>
        ${[150, 172, 194, 216, 238, 260, 282, 304].map((y) => `<i class="vent" style="top:${y}px"></i>`).join('')}
        <div class="lbl">BMS · 2016</div>
      </div>
      <div class="part cab-new" id="cabNew">
        <div class="part cab-frame">
          <i class="rail" style="top:86px"></i><i class="rail" style="top:338px"></i>
          ${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => `<i class="brk" style="left:${22 + k * 21}px;top:296px"></i><i class="brk" style="left:${22 + k * 21}px;top:44px"></i>`).join('')}
          <i class="bay"></i>
        </div>
        <div class="part cab-module" id="cabModule">AI 边缘推理<br>模块</div>
        <div class="part cab-door" id="cabDoor">
          <div class="scr"></div>
          <div class="ai-badge" id="aiBadge"><i class="ph-fill ph-lightning"></i>AI 智控</div>
          <div class="strip-led"></div>
        </div>
      </div>
    </div>
    <i class="sweep" id="sweep"></i>
    <div class="leader" style="left:40px;top:14px"><small>01 · FRONT</small>触控 HMI 前面板</div>
    <div class="leader" style="left:560px;top:404px"><small>02 · CORE</small>AI 边缘推理模块</div>
    <div class="leader" style="left:372px;top:456px"><small>03 · BASE</small>标准化机柜底座</div>
    ${MAPN.map(([x, y]) => `<i class="map-ring" style="left:${x - 22}px;top:${y - 22}px"></i><i class="map-node" style="left:${x - 9}px;top:${y - 9}px"></i>`).join('')}
    ${MAPN.map(() => '<i class="mini-cab"></i>').join('')}
    <div class="tag green" id="deployTag" style="left:944px;top:446px;opacity:0;visibility:hidden">已部署<b><span id="deployN">0</span> 栋建筑</b></div>
  </div>`);
  window.MAPN = MAPN;

  /* ---------------------------------------------------------------------
     S10 · 价值升华 — earth, PUE drop → green arrow, stats, leaves
     --------------------------------------------------------------------- */
  reseed(23);
  let stars = '';
  for (let i = 0; i < 70; i++) stars += `<circle cx="${f(R(0, VW))}" cy="${f(R(0, VH))}" r="${f(R(0.5, 1.6))}" fill="#cfe9ff" opacity="${f(R(0.15, 0.6))}"/>`;
  const land = (x, y) => {
    const t = (x / 800) * Math.PI * 2;
    return Math.sin(t * 2 + 0.5) * 0.6 + Math.sin(t * 3 + y * 0.025) * 0.5 + Math.cos(y * 0.035 - 1) * 0.6 > 0.2 && Math.abs(y - 200) < 165;
  };
  let tex = '';
  const landPts = [];
  for (let x = 5; x < 800; x += 10) {
    for (let y = 5; y < 400; y += 10) {
      if (land(x, y)) { tex += `<circle cx="${x}" cy="${y}" r="1.7" fill="rgba(89,199,255,.55)"/>`; landPts.push([x, y]); } // ocean dots: CSS pattern
    }
  }
  for (let i = 0; i < 16; i++) {
    const [x, y] = landPts[Math.floor(rnd() * landPts.length)];
    tex += `<circle class="node" cx="${x}" cy="${y}" r="4.5" fill="#3dcd58" opacity="0"/><circle class="node" cx="${x}" cy="${y}" r="9" fill="none" stroke="#3dcd58" stroke-width="1.5" opacity="0"/>`;
  }
  const PUEV = [1.86, 1.84, 1.87, 1.85, 1.82, 1.7, 1.52, 1.4, 1.33, 1.29, 1.27, 1.25];
  const px = (i) => 44 + i * (476 / 11);
  const py = (v) => 190 - ((v - 1.2) / 0.8) * 180;
  const pueD = 'M' + PUEV.map((v, i) => `${f(px(i))} ${f(py(v))}`).join(' L');
  const ang = Math.atan2(34 - 120, 500 - 360);
  const ah = (d, s) => [f(500 - Math.cos(ang) * d + Math.sin(ang) * s), f(34 - Math.sin(ang) * d - Math.cos(ang) * s)];
  const leaf = `<svg viewBox="0 0 46 64" aria-hidden="true"><path d="M23 64 C 0 40, 4 12, 23 0 C 42 12, 46 40, 23 64 Z" fill="rgba(61,205,88,.22)" stroke="#3dcd58" stroke-width="1.5"/><path d="M23 62 L23 8 M23 40 L12 28 M23 30 L34 18" stroke="rgba(61,205,88,.8)" stroke-width="1.2" fill="none"/></svg>`;
  const LEAVES = [[150, 400, -30], [92, 300, -60], [490, 420, 25], [540, 320, 55], [1150, 214, 15], [612, 250, -20]];
  add(`<div class="scene" id="s10">
    ${svgOpen}${stars}</svg>
    <div class="earth-wrap" id="earthWrap">
      <div class="earth-halo"></div>
      <div class="earth">
        <div class="earth-tex" id="earthTex">
          <svg viewBox="0 0 800 400" style="left:0" aria-hidden="true">${tex}</svg>
          <svg viewBox="0 0 800 400" style="left:800px" aria-hidden="true">${tex}</svg>
        </div>
        <svg class="earth-grid" viewBox="0 0 400 400" aria-hidden="true">
          ${[200, 140, 70].map((rx) => `<ellipse cx="200" cy="200" rx="${rx}" ry="200" fill="none" stroke="rgba(89,199,255,.12)"/>`).join('')}
          ${[80, 140, 200, 260, 320].map((y) => { const h = Math.sqrt(200 * 200 - (y - 200) ** 2); return `<line x1="${f(200 - h)}" y1="${y}" x2="${f(200 + h)}" y2="${y}" stroke="rgba(89,199,255,.12)"/>`; }).join('')}
        </svg>
        <div class="earth-shade"></div>
      </div>
    </div>
    <div class="glass pue-card" id="pueCard">
      <div class="hk"><span>PUE · 数据中心能效 · 12 个月</span><b id="pueBig">1.85</b></div>
      <svg viewBox="0 0 532 214" aria-hidden="true">
        ${[1.2, 1.4, 1.6, 1.8, 2.0].map((v) => `<line x1="40" y1="${f(py(v))}" x2="524" y2="${f(py(v))}" stroke="rgba(255,255,255,.06)"/><text x="0" y="${f(py(v) + 4)}" fill="#5a6f82" font-size="12" font-family="JetBrains Mono">${v.toFixed(1)}</text>`).join('')}
        <g id="aiOn" opacity="0"><line x1="${f(px(5))}" y1="6" x2="${f(px(5))}" y2="196" stroke="rgba(89,199,255,.5)" stroke-dasharray="3 4"/><text x="${f(px(5) + 6)}" y="18" fill="#59c7ff" font-size="12" font-family="JetBrains Mono">AI 上线</text></g>
        <path class="draw" id="pueLine" d="${pueD}" stroke="#ff654f" stroke-width="3" stroke-linejoin="round"/>
        <path class="draw" id="upArrow" d="M60 176 C 220 170, 360 120, 500 34" stroke="#3dcd58" stroke-width="4" stroke-linecap="round"/>
        <polygon id="arrowHead" points="500,34 ${ah(22, 10).join(',')} ${ah(22, -10).join(',')}" fill="#3dcd58" opacity="0"/>
      </svg>
      <div class="tag green" id="valTag" style="left:300px;top:200px;opacity:0;visibility:hidden">企业效益 ↑<b>环保价值 ↑</b></div>
    </div>
    <div class="glass stat" style="left:640px"><div class="k">PUE</div><b id="st1">1.85</b><span>降至行业标杆水平</span></div>
    <div class="glass stat" style="left:837px"><div class="k">节能率</div><b id="st2">0.0%</b><span>制冷系统综合能耗</span></div>
    <div class="glass stat" style="left:1034px"><div class="k">年减碳 tCO₂e</div><b id="st3">0</b><span>≈ 70 万棵树 / 年</span></div>
    ${LEAVES.map(([x, y, r]) => `<div class="leaf" data-r="${r}" style="left:${x}px;top:${y}px">${leaf}</div>`).join('')}
  </div>`);

  /* ---------------------------------------------------------------------
     S11 · 品牌定格 — particles converge into logo + slogan, sweep, "滴"
     --------------------------------------------------------------------- */
  reseed(41);
  const CODE = ['optimize(cop)', 'PUE=1.25', 'infer<8ms>', 'kWh -23.6%', 'safety.lock()', 'model v4.2', 'twin.sync()', 'CO2 -12800t'];
  const codeCols = Array.from({ length: 9 }, (_, c) => `<div class="col">${Array.from({ length: 34 }, (_, i) => CODE[(i + c * 3) % CODE.length]).join('<br>')}</div>`).join('');
  const slogan = '智冷未来，绿动世界';
  add(`<div class="scene" id="s11">
    <div class="code-bg" id="codeBg">${codeCols}</div>
    <i class="big-ring" id="ring1"></i><i class="big-ring b2" id="ring2"></i>
    ${Array.from({ length: 28 }, () => `<i class="particle" data-x="${f(R(-80, VW + 80))}" data-y="${f(R(-60, VH + 60))}"></i>`).join('')}
    <div class="logo">
      <div class="logo-mark" id="logoMark">AI<i class="logo-sweep" id="sweep1"></i></div>
      <div class="logo-word" id="logoWord"><b>AI+Power</b><small>智冷纪元 · HVAC 智能能效</small><i class="logo-sweep" id="sweep2"></i></div>
    </div>
    <div class="slogan" id="slogan">${[...slogan].map((c, i) => `<span class="ch${i === 5 || i === 6 ? ' g' : ''}">${c}</span>`).join('')}</div>
    <div class="ding" id="ding"><i id="dingDot"></i>每一度电 · 精准计算</div>
  </div>`);

  /* captions (字幕) */
  captions.innerHTML = window.SHOTS.map((s) => `<div class="caption">${s.caption}</div>`).join('');

})();
