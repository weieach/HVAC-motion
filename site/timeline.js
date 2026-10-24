/* Master timeline — every scene tween lives here at absolute script time (seconds),
   so the whole 1:45 piece can be played, paused, scrubbed and stepped shot by shot.

   Motion rules (skills/animate + design system):
   - enter/exit: expo-out  cubic-bezier(.22,1,.36,1)   (design-system token)
   - on-screen moves / camera: strong in-out cubic-bezier(.77,0,.175,1)
   - constant motion (orbits, rotors, flows, scrolls): linear
   - transform / opacity / clip-path only; stroke-dashoffset just for line draw-ins
   - never scale from 0 — entrances start at .6–.97 */
window.buildTimeline = function buildTimeline() {
  gsap.registerPlugin(CustomEase);
  CustomEase.create('hvacOut', '0.22,1,0.36,1');
  CustomEase.create('hvacInOut', '0.77,0,0.175,1');
  // linear deceleration 360°/s → 276°/s (50 Hz → 38.4 Hz) as a bezier
  CustomEase.create('hvacDecel', 'M0,0 C0.333,0.377 0.667,0.711 1,1');
  const E = { out: 'hvacOut', io: 'hvacInOut', spring: 'back.out(1.5)' };

  const tl = gsap.timeline({ paused: true, defaults: { ease: E.out } });
  const q = (s) => document.querySelector(s);
  const qa = (s) => gsap.utils.toArray(s);

  /* ---------- helpers ---------- */
  qa('#viz .draw').forEach((p) => {
    const L = Math.ceil(p.getTotalLength()) + 1;
    p.style.strokeDasharray = L;
    p.style.strokeDashoffset = L;
  });
  gsap.set('[data-c]', { xPercent: -50, yPercent: -50 });

  const show = (t, sel, d = 0.6) => tl.to(sel, { autoAlpha: 1, duration: d, ease: E.out }, t);
  const hide = (t, sel, d = 0.4) => tl.to(sel, { autoAlpha: 0, duration: d, ease: E.out }, t);
  const draw = (t, sel, d = 1, stagger = 0, ease = E.io) => tl.to(sel, { strokeDashoffset: 0, duration: d, ease, stagger }, t);
  const rise = (t, sel, o = {}) => tl.fromTo(sel,
    { autoAlpha: 0, y: o.y ?? 12, scale: o.scale ?? 1 },
    { autoAlpha: 1, y: 0, scale: 1, duration: o.d ?? 0.56, ease: o.ease ?? E.out, stagger: o.stagger ?? 0 }, t);
  const count = (t, d, from, to, el, fmt, ease = 'power2.out') => {
    const o = { v: from };
    const node = typeof el === 'string' ? q(el) : el;
    tl.to(o, { v: to, duration: d, ease, onUpdate: () => { node.textContent = fmt(o.v); } }, t);
  };
  const int = (v) => Math.round(v).toLocaleString('en-US');

  /* =====================================================================
     01 · 混沌  0–8s   red alarm hall, camera push, cyan scan purifies it
     ===================================================================== */
  gsap.set('#s1', { autoAlpha: 1 });
  tl.fromTo('#s1cam', { scale: 1 }, { scale: 1.12, duration: 5.6, ease: E.io }, 0);
  tl.to(qa('#s1red .led'), { opacity: 0.12, duration: 0.14, ease: 'none', stagger: { each: 0.045, from: 'random', repeat: 35, yoyo: true } }, 0.1);

  gsap.set('#s1needle', { rotation: -32, svgOrigin: '110 110' });
  const jitter = [34, -6, 70, 44, 84, 60, 88, 70, 86, 74, 89, 80, 88];
  tl.to('#s1needle', {
    keyframes: jitter.map((r, i) => ({ rotation: r, duration: i < 4 ? 0.45 : 0.32, ease: 'power2.inOut' })),
  }, 0.3);
  count(0.3, 5.6, 58, 97, '#s1gv', (v) => `${Math.round(v)}%`, 'power1.in');
  count(0.3, 5.3, 982, 1486, '#s1kw', int, 'power1.in');
  count(0.3, 5.3, 12, 54, '#s1pct', (v) => Math.round(v), 'power1.in');
  tl.to('#s1warn', { opacity: 0.3, duration: 0.22, repeat: 21, yoyo: true, ease: 'none' }, 0.6);

  // the scan — line and the two clip reveals share one curve, so they stay locked together
  tl.set('#s1scan', { autoAlpha: 1 }, 5.6);
  tl.fromTo('#s1scan', { y: 552 }, { y: -32, duration: 1.5, ease: E.io }, 5.6);
  tl.fromTo('#s1blue', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: E.io }, 5.6);
  tl.fromTo('#s1red', { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.5, ease: E.io }, 5.6);
  tl.to('#s1scan', { autoAlpha: 0, duration: 0.3 }, 7.1);
  hide(6.45, '#s1roRed', 0.3);
  rise(6.5, '#s1roCyan', { y: 8 });
  tl.to('#s1needle', { rotation: -12, duration: 0.9, ease: E.io }, 6.5);
  count(6.5, 0.9, 97, 42, '#s1gv', (v) => `${Math.round(v)}%`, E.io);
  tl.to('#s1arcRed', { opacity: 0, duration: 0.4 }, 6.5);
  tl.to('#s1arcCyan', { opacity: 1, duration: 0.4 }, 6.5);
  tl.to('#s1gv', { color: '#59c7ff', duration: 0.3 }, 6.5);
  hide(8.0, '#s1', 0.8);

  /* =====================================================================
     02 · 觉醒  8–15s   waves converge → AI core → digital-twin wireframe
     ===================================================================== */
  show(7.9, '#s2', 0.3);
  gsap.set('#core', { y: -70 });
  gsap.set('#coreGlow', { opacity: 0.7 });
  tl.fromTo('#waves i', { scale: 5, opacity: 0 }, { scale: 0.55, opacity: 0.9, duration: 1.1, ease: E.io, stagger: 0.18 }, 8.0);
  tl.to('#waves i', { opacity: 0, duration: 0.25, stagger: 0.18, ease: 'none' }, 9.1);
  tl.fromTo('#core', { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.9, ease: E.spring }, 9.2);
  tl.fromTo(['#pulse1', '#pulse2'], { scale: 1, opacity: 0.85 }, { scale: 5.5, opacity: 0, duration: 1.4, stagger: 0.25, immediateRender: false }, 10.0);
  tl.to('#coreBody', { scale: 1.06, duration: 0.45, repeat: 53, yoyo: true, ease: 'sine.inOut' }, 10.1);
  draw(10.1, '#twin .draw', 1.1, 0.028);
  tl.to('#twin .tw-fill', { opacity: 1, duration: 0.8, stagger: 0.01 }, 11.6);
  rise(12.6, '#s2 .s2tag', { stagger: 0.12 });

  /* =====================================================================
     03 · 多维感知  15–25s   pass through the wall, four data orbs orbit
     ===================================================================== */
  tl.to('#twin', { scale: 1.5, autoAlpha: 0, duration: 1.0, ease: E.io, transformOrigin: '50% 62%' }, 15.0);
  hide(15.0, '#s2 .s2tag', 0.3);
  hide(16.0, '#s2', 0.2);
  tl.to('#core', { y: 0, duration: 1.0, ease: E.io }, 15.0);
  show(15.2, '#s3', 0.6);

  const orbPos = qa('#s3 .orb-pos');
  tl.fromTo(orbPos, { x: 760, autoAlpha: 0 }, { x: 200, autoAlpha: 1, duration: 1.1, ease: E.out, stagger: 0.4 }, 15.6);
  tl.fromTo('#orbit', { rotation: 0 }, { rotation: 110, duration: 9.4, ease: 'none' }, 15.6);
  orbPos.forEach((op) => {
    const a = +op.dataset.a;
    tl.fromTo(op.firstElementChild, { rotation: -a }, { rotation: -a - 110, duration: 9.4, ease: 'none' }, 15.6);
  });
  tl.to('#trails', { opacity: 1, duration: 1 }, 17.2);
  tl.fromTo('#s3 .feed', { x: 140, opacity: 1 }, { x: 72, opacity: 0, duration: 0.7, ease: 'none', stagger: { each: 0.17, repeat: 8 }, immediateRender: false }, 18.0);
  tl.to('#coreGlow', { opacity: 1, scale: 1.25, duration: 3, ease: E.io }, 18.0);
  tl.to(orbPos, { x: 0, scale: 0.35, autoAlpha: 0, duration: 0.7, ease: E.io, stagger: 0.06 }, 24.4);
  tl.to('#trails', { opacity: 0, duration: 0.4 }, 24.6);
  hide(25.2, '#s3', 0.3);

  /* =====================================================================
     04 · 安全边界  25–35s   golden hex shield, thresholds, anomalies bounce off
     ===================================================================== */
  tl.to('#core', { y: -188, scale: 0.62, duration: 1.1, ease: E.io }, 25.0);
  tl.to('#coreGlow', { scale: 1, opacity: 0.7, duration: 1.1, ease: E.io }, 25.0);
  show(25.2, '#s4', 0.4);
  draw(25.6, '#s4eq .draw', 1.0, 0.05);
  tl.to('#s4eq .eq-fill', { opacity: 1, duration: 0.6, stagger: 0.01 }, 26.4);
  tl.fromTo('#shieldLayer', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: E.io }, 26.4);
  tl.fromTo('#hexFill', { opacity: 0.5 }, { opacity: 1, duration: 0.8, repeat: 9, yoyo: true, ease: 'sine.inOut' }, 27.6);
  rise(27.8, '#s4 .th', { stagger: 0.15, scale: 0.96, y: 8 });

  const ANOM = [
    [[40, 90], [416, 228], 28.6, true], [[1210, 470], [836, 372], 29.4, false],
    [[30, 330], [346, 300], 30.2, true], [[1220, 110], [836, 228], 31.0, false],
    [[110, 505], [416, 372], 31.8, true], [[1235, 300], [906, 300], 32.6, false],
  ];
  const anoms = qa('#s4 .anom'), rips = qa('#s4 .ripple');
  rise(28.2, '#s4count', { y: 8 });
  ANOM.forEach(([s, p, t, left], i) => {
    const el = anoms[i];
    if (left) el.classList.add('l');
    gsap.set(el, { xPercent: left ? -100 : 0, yPercent: -50 });
    tl.fromTo(el, { x: s[0], y: s[1], autoAlpha: 0 }, { x: p[0], y: p[1], autoAlpha: 1, duration: 0.9, ease: 'power1.in' }, t - 0.9);
    tl.to(el, { x: p[0] + (s[0] - p[0]) * 0.3, y: p[1] + (s[1] - p[1]) * 0.3, autoAlpha: 0, duration: 0.8, ease: E.out }, t);
    tl.fromTo(rips[i], { x: p[0], y: p[1], scale: 0.4, opacity: 0.95 }, { scale: 1.8, opacity: 0, duration: 0.7, ease: E.out, immediateRender: false }, t);
    tl.fromTo('#shieldFlash', { opacity: 0.6 }, { opacity: 0, duration: 0.6, ease: E.out, immediateRender: false }, t);
    tl.set('#blockN', { textContent: i + 1 }, t);
  });
  tl.to('#core', { autoAlpha: 0, scale: 0.4, duration: 0.6, ease: E.io }, 34.8);
  hide(34.9, '#s4', 0.5);

  /* =====================================================================
     05 · 云边协同  35–45s   Python waterfall + net (cloud) / C++ blocks → chip (edge)
     ===================================================================== */
  show(35.1, '#s5', 0.5);
  draw(35.2, '#div5', 0.8, 0, E.out);
  rise(35.3, '#s5 .zone-label', { stagger: 0.15 });
  tl.fromTo('#fall', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 35.3);
  qa('#fall .col').forEach((c, i) => {
    const d = [3.2, 4.1, 2.8][i];
    tl.fromTo(c, { yPercent: -50 }, { yPercent: 0, duration: d, ease: 'none', repeat: Math.ceil(10 / d) }, 35.2);
  });
  tl.fromTo('#s5 .nn-n', { opacity: 0, scale: 0.6, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.5, ease: E.spring, stagger: 0.03 }, 35.8);
  draw(36.1, '#s5 .nn-e', 0.6, 0.008, E.out);
  tl.to('#s5 .nn-hot', { opacity: 0.95, duration: 0.3, ease: 'sine.inOut', stagger: { each: 0.1, from: 'random', repeat: 15, yoyo: true } }, 37.4);

  rise(35.6, '#gw', { y: 10 });
  tl.to('#gw .ln', { opacity: 1, duration: 0.2, stagger: 1.0 }, 36.2);
  tl.to('#gwBar', { scaleX: 1, duration: 2.8, ease: 'none' }, 36.2);
  const cpp = qa('#s5 .cpp');
  gsap.set(cpp, { xPercent: -50, yPercent: -50 });
  cpp.forEach((b, i) => {
    const t0 = 36.3 + i * 0.22;
    tl.fromTo(b, { x: 340 + (i % 3) * 18, y: 330 + ((i * 41) % 100) },
      { x: 960, y: 412, duration: 0.6, ease: 'power3.in', immediateRender: false }, t0);
    tl.to(b, { autoAlpha: 1, duration: 0.12 }, t0);
    tl.to(b, { autoAlpha: 0, scale: 0.5, duration: 0.18 }, t0 + 0.6);
  });
  draw(36.5, '#chip .draw', 0.8, 0.1);
  tl.fromTo('#chip .cells i', { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.4, ease: E.spring, stagger: { each: 0.16, from: 'center', grid: [4, 4] } }, 36.9);
  rise(39.4, '#chipTag', { y: 8 });
  draw(39.6, '#fiber', 0.6, 0, E.out);
  rise(40.0, '#fiberTag', { y: 8 });
  tl.to('#s5 .pulse-dot.down', { keyframes: { y: [0, 112], opacity: [0, 1, 1, 0], easeEach: 'none' }, duration: 0.8, ease: 'none', stagger: { each: 0.27, repeat: 5 } }, 40.2);
  tl.to('#s5 .pulse-dot.up', { keyframes: { y: [112, 0], opacity: [0, 1, 1, 0], easeEach: 'none' }, duration: 0.8, ease: 'none', stagger: { each: 0.27, repeat: 5 } }, 40.35);
  hide(45.0, '#s5', 0.4);

  /* =====================================================================
     06 · 决策大脑  45–60s   chip projects forecast / optimise / evolve; slow 3D orbit
     ===================================================================== */
  show(45.0, '#s6', 0.4);
  gsap.set('#s6rig', { transformPerspective: 1600, transformOrigin: '50% 60%' });
  tl.fromTo('#s6rig', { rotationY: -9, rotationX: 3 }, { rotationY: 9, rotationX: -2, duration: 14.6, ease: 'sine.inOut' }, 45.2);
  rise(45.2, '#s6chip', { y: 10, scale: 0.92, ease: E.spring });

  const beams = qa('#s6 .beam'), holos = qa('#s6 .holo'), rings = qa('#s6 .holo-ring');
  const bdots = qa('#s6 .beam-dot:not(.evo-dot)');
  const ENDS = [[236, 368], [626, 368], [1016, 368]];
  [45.6, 48.0, 50.5].forEach((t, i) => {
    draw(t, beams[i], 0.45, 0, E.out);
    rise(t + 0.35, holos[i], { y: 16, scale: 0.97 });
    tl.fromTo(rings[i], { opacity: 1 }, { opacity: 0, duration: 1.6, immediateRender: false }, t + 0.5);
    gsap.set(bdots[i], { x: 626, y: 420 });
    tl.to(bdots[i], {
      keyframes: { x: [626, ENDS[i][0]], y: [420, ENDS[i][1]], opacity: [0, 1, 1, 0], easeEach: 'none' },
      duration: 0.7, ease: 'none', repeat: Math.floor((59.6 - t - 0.5) / 0.9), repeatDelay: 0.2,
    }, t + 0.5);
  });
  // forecast
  draw(46.4, '#fPast', 1.0);
  tl.to('#fNow', { opacity: 1, duration: 0.4 }, 47.3);
  draw(47.4, '#fFut', 1.1, 0, E.out);
  tl.to('#fBand', { opacity: 1, duration: 0.8 }, 47.6);
  // optimise
  tl.fromTo('#s6 .n6', { opacity: 0, scale: 0.7, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.5, ease: E.spring, stagger: 0.12 }, 48.7);
  draw(48.9, holos[1].querySelectorAll('.draw'), 0.8, 0.08);
  tl.to('#s6 .flowl', { opacity: 1, duration: 0.4 }, 49.6);
  tl.fromTo('#s6 .flowl', { strokeDashoffset: 0 }, { strokeDashoffset: -140, duration: 10, ease: 'none' }, 49.6);
  const SEEK = [[50, 150], [274, 150], [162, 34], [80, 60], [250, 60]];
  qa('#s6 .seek').forEach((c, i) => {
    const [sx, sy] = SEEK[i];
    gsap.set(c, { x: sx, y: sy });
    tl.to(c, {
      keyframes: {
        x: [sx, 162 + (sx - 162) * 0.55 + 30 * Math.sin(i), 162 + (sx - 162) * 0.2 - 20 * Math.cos(i), 162],
        y: [sy, 108 + (sy - 108) * 0.6 + 24 * Math.cos(i), 108 + (sy - 108) * 0.25, 108],
        opacity: [0, 1, 1, 1, 0], easeEach: 'sine.inOut',
      },
      duration: 3, ease: 'none',
    }, 49.5 + i * 0.12);
  });
  tl.to('#optG', { opacity: 1, duration: 0.4 }, 52.6);
  tl.fromTo('#optRing', { scale: 0.6, opacity: 1, transformOrigin: '50% 50%' }, { scale: 1.6, opacity: 0, duration: 1.2, repeat: 5, ease: E.out, immediateRender: false }, 52.6);
  count(49.5, 3, 7.0, 8.5, '#r6a', (v) => v.toFixed(1), E.io);
  count(49.5, 3, 50, 42, '#r6b', (v) => Math.round(v), E.io);
  count(49.5, 3, 40, 35, '#r6c', (v) => Math.round(v), E.io);
  // evolve — four seasons fast-forward
  const SW = 81;
  const seasonKf = [];
  for (let k = 1; k <= 10; k++) seasonKf.push({ x: (k % 4) * SW, duration: k % 4 === 0 ? 0.3 : 0.62, ease: E.io });
  tl.to('#seasonHi', { keyframes: seasonKf }, 51.3);
  qa('#s6 .evo-dot').forEach((d, i) => {
    const dx = 180 - (70 + i * 44) - 5;
    tl.to(d, { keyframes: { x: [0, dx * 0.8], y: [0, 44], opacity: [0, 1, 0], easeEach: 'none' }, duration: 0.6, ease: 'none', repeat: 9, repeatDelay: 0.1 }, 51.4 + i * 0.11);
  });
  tl.fromTo('#modelIco', { scale: 0.72 }, { scale: 1.15, duration: 6.5, ease: 'power2.out' }, 51.3);
  count(51.3, 6.5, 1.0, 4.2, '#ver', (v) => `v${v.toFixed(1)}`, 'power1.inOut');
  tl.fromTo('#accBar', { scaleX: 0.82 }, { scaleX: 0.97, duration: 6.5, ease: 'power2.out' }, 51.3);
  count(51.3, 6.5, 82, 97, '#accTxt', (v) => Math.round(v), 'power2.out');
  hide(60.0, '#s6', 0.4);

  /* =====================================================================
     07 · 精准执行  60–70s   packets travel the bus → VFD slows the motor, valve turns
     ===================================================================== */
  show(60.0, '#s7', 0.4);
  draw(60.3, '#s7 .bus', 0.8, 0.15);
  gsap.set('#fan', { svgOrigin: '1070 130' });
  gsap.set('#hw', { svgOrigin: '900 300' });
  gsap.set('#fanRing', { svgOrigin: '1070 130' });
  gsap.set('#hwRing', { svgOrigin: '900 300' });
  tl.fromTo('#fan', { rotation: 0 }, { rotation: 1116, duration: 3.1, ease: 'none' }, 60.3);
  tl.to('#fan', { rotation: 1116 + 477, duration: 1.5, ease: 'hvacDecel' }, 63.4);
  tl.to('#fan', { rotation: 1116 + 477 + 276 * 5.1, duration: 5.1, ease: 'none' }, 64.9);
  tl.to('#code1 .ch', { opacity: 1, duration: 0.01, stagger: 0.035 }, 61.0);
  tl.to('#code2 .ch', { opacity: 1, duration: 0.01, stagger: 0.035 }, 61.7);

  gsap.set(['#pk1', '#pk2'], { xPercent: -50, yPercent: -50, x: 190, y: 260 });
  const ROUTE1 = { '0%': { x: 190, y: 260 }, '40%': { x: 420, y: 260 }, '62%': { x: 420, y: 130 }, '100%': { x: 640, y: 130 } };
  const ROUTE2 = { '0%': { x: 190, y: 260 }, '32%': { x: 420, y: 260 }, '38%': { x: 420, y: 300 }, '100%': { x: 866, y: 300 } };
  [['#pk1', '.sp1', ROUTE1, 62.0, 1.0], ['#pk2', '.sp2', ROUTE2, 62.4, 1.2]].forEach(([pk, sp, route, t, d]) => {
    tl.set(pk, { autoAlpha: 1 }, t);
    tl.to(pk, { keyframes: { ...route, easeEach: 'none' }, duration: d, ease: 'none' }, t);
    tl.to(pk, { autoAlpha: 0, scale: 0.6, duration: 0.25 }, t + d);
    qa(`#s7 ${sp}`).forEach((s, k) => {
      gsap.set(s, { x: 190, y: 260 });
      tl.to(s, { keyframes: { ...route, easeEach: 'none' }, duration: d, ease: 'none' }, t + 0.1 + k * 0.1);
      tl.fromTo(s, { opacity: 0.9 - k * 0.25 }, { opacity: 0, duration: 0.2, immediateRender: false }, t + 0.1 + k * 0.1 + d);
    });
  });
  // VFD responds
  count(63.0, 1.6, 50, 38.4, '#hz', (v) => v.toFixed(1), E.out);
  tl.set('#vfdSt', { textContent: 'AI 自动 · 变频运行' }, 63.0);
  tl.to('#vfdOk', { opacity: 1, duration: 0.3 }, 63.0);
  tl.to('#fanRing', { opacity: 1, duration: 0.5 }, 63.1);
  tl.fromTo('#fanRing', { rotation: 0 }, { rotation: -200, duration: 6.9, ease: 'none' }, 63.1);
  rise(63.1, '#latTag', { y: 8 });
  // valve responds
  tl.to('#hw', { rotation: 240, duration: 1.6, ease: E.io }, 63.6);
  count(63.6, 1.6, 30, 62, '#valvePct', (v) => Math.round(v), E.io);
  tl.to('#hwRing', { opacity: 1, duration: 0.4 }, 63.6);
  tl.fromTo('#hwRing', { rotation: 0 }, { rotation: 160, duration: 6.4, ease: 'none' }, 63.6);
  // water flow in the pipe
  tl.fromTo('#flows .flow-dot', { x: 566 }, { x: 1226, duration: 2.4, ease: 'none', stagger: { each: 0.267, repeat: 3 } }, 60.2);
  tl.fromTo('#flows', { opacity: 0 }, { opacity: 0.35, duration: 0.6 }, 62.4);
  tl.to('#flows', { opacity: 1, duration: 0.6 }, 64.4);
  rise(65.2, '#pwTag', { y: 8 });
  count(65.2, 1.5, 0, 18.6, '#pw', (v) => v.toFixed(1));
  hide(70.0, '#s7', 0.4);

  /* =====================================================================
     08 · 人机协同  70–80s   AR suggestion (gold) → confirm → auto closed loop (green)
     ===================================================================== */
  show(70.0, '#s8', 0.4);
  draw(70.2, '#s8 .arb', 0.6, 0.06, E.out);
  draw(70.4, '#s8 .ray', 0.6, 0.1, E.out);
  rise(70.5, '#cardGold', { y: 16, scale: 0.97 });
  rise(70.9, '#cardGold .rowi', { y: 8, stagger: 0.08 });
  tl.to('#confBar', { scaleX: 0.94, duration: 1.0 }, 71.4);
  gsap.set('#cursor', { x: 1230, y: 520, transformOrigin: '4px 2px' });
  tl.to('#cursor', { autoAlpha: 1, duration: 0.3 }, 72.4);
  tl.to('#cursor', { x: 1073, y: 435, duration: 1.4, ease: E.io }, 72.6);
  tl.to('#goBtn', { scale: 0.97, duration: 0.1, yoyo: true, repeat: 1 }, 74.3);
  tl.to('#cursor', { scale: 0.88, duration: 0.1, yoyo: true, repeat: 1 }, 74.3);
  tl.fromTo('#clickRing', { x: 1077, y: 437, scale: 0.5, opacity: 0.9 }, { scale: 1.8, opacity: 0, duration: 0.6, immediateRender: false }, 74.35);
  tl.to('#mouthA', { opacity: 0, duration: 0.3 }, 74.6);
  tl.to('#mouthB', { opacity: 1, duration: 0.3 }, 74.6);
  tl.fromTo('#cardGreen', { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: E.io }, 74.8);
  tl.to('#glassG', { opacity: 1, duration: 0.4 }, 74.8);
  tl.to('#cursor', { autoAlpha: 0, duration: 0.3 }, 75.2);
  rise(75.0, '#ackTag', { y: 8 });
  tl.to('#cardGreen .ok', { opacity: 1, duration: 0.3, stagger: 0.35 }, 75.6);
  [75.6, 75.95, 76.3].forEach((t, i) => tl.set('#loopN', { textContent: i + 1 }, t));
  tl.fromTo('#loopIco', { rotation: 0 }, { rotation: 720, duration: 4.6, ease: 'none' }, 75.4);
  hide(80.0, '#s8', 0.4);

  /* =====================================================================
     09 · 产品赋能  80–90s   light sweep upgrades the cabinet, explode, replicate to city
     ===================================================================== */
  show(80.0, '#s9', 0.4);
  rise(80.1, '#cab', { y: 12 });
  gsap.set('#aiBadge', { xPercent: -50 });
  tl.set('#sweep', { autoAlpha: 1 }, 80.8);
  tl.fromTo('#sweep', { x: 215 }, { x: 425, duration: 1.4, ease: E.io }, 80.8);
  tl.fromTo('#cabNew', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: E.io }, 80.8);
  tl.fromTo('#cabOld', { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 100%)', duration: 1.4, ease: E.io }, 80.8);
  tl.to('#sweep', { autoAlpha: 0, duration: 0.3 }, 82.2);
  tl.set('#cabNew', { clipPath: 'none' }, 82.3);
  tl.fromTo('#aiBadge', { scale: 0.94, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 0.6, ease: E.spring }, 82.0);
  // exploded view
  tl.to('#cabDoor', { x: -170, duration: 1.2, ease: E.io }, 83.0);
  tl.to('#cabModule', { x: 230, duration: 1.2, ease: E.io }, 83.15);
  draw(84.0, '#s9 .lead', 0.5, 0.1, E.out);
  rise(84.1, '#s9 .leader', { stagger: 0.12 });
  tl.to('#s9 .leader', { autoAlpha: 0, duration: 0.3 }, 85.9);
  tl.to('#s9 .lead', { opacity: 0, duration: 0.3 }, 85.9);
  tl.to(['#cabDoor', '#cabModule'], { x: 0, duration: 0.9, ease: E.io }, 86.1);
  // city map + replication
  draw(85.6, ['#mapFrame', '#s9 .road'], 0.8, 0.04, E.out);
  tl.to('#s9 .blk', { opacity: 1, duration: 0.4, stagger: { each: 0.012, from: 'random' } }, 86.0);
  const minis = qa('#s9 .mini-cab'), mnodes = qa('#s9 .map-node'), mrings = qa('#s9 .map-ring');
  window.MAPN.forEach(([x, y], i) => {
    const t = 87.0 + i * 0.2, sx = 355, sy = 235;
    gsap.set(minis[i], { x: sx, y: sy });
    tl.to(minis[i], { autoAlpha: 1, duration: 0.2 }, t);
    tl.to(minis[i], {
      keyframes: { x: [sx, (sx + x) / 2, x], y: [sy, Math.min(sy, y) - 110, y], scale: [1.3, 0.95, 0.5], easeEach: 'sine.inOut' },
      duration: 1.1, ease: E.io,
    }, t + 0.05);
    tl.to(minis[i], { autoAlpha: 0, duration: 0.25 }, t + 1.15);
    tl.to(mnodes[i], { opacity: 1, duration: 0.3 }, t + 1.15);
    tl.fromTo(mrings[i], { scale: 0.5, opacity: 1 }, { scale: 1.8, opacity: 0, duration: 0.8, repeat: 2, immediateRender: false }, t + 1.15);
  });
  rise(88.0, '#deployTag', { y: 8 });
  count(88.0, 1.8, 0, 128, '#deployN', (v) => Math.round(v));
  hide(90.0, '#s9', 0.5);

  /* =====================================================================
     10 · 价值升华  90–100s   pull out to orbit, PUE falls, turns into a green arrow
     ===================================================================== */
  show(89.9, '#s10', 0.8);
  tl.fromTo('#earthWrap', { scale: 2.6 }, { scale: 1, duration: 2.4, ease: E.io }, 90.0);
  tl.fromTo('#earthTex', { x: 0 }, { x: -800, duration: 10, ease: 'none' }, 90.0);
  tl.to('#earthTex .node', { opacity: 1, duration: 0.4, stagger: { each: 0.03, from: 'random' } }, 91.6);
  rise(91.4, '#pueCard', { y: 16 });
  draw(92.2, '#pueLine', 2.2, 0, 'power1.inOut');
  tl.to('#aiOn', { opacity: 1, duration: 0.4 }, 92.9);
  count(92.2, 2.2, 1.85, 1.25, '#pueBig', (v) => v.toFixed(2), 'power2.in');
  tl.to('#pueBig', { color: '#3dcd58', duration: 0.4 }, 94.2);
  rise(92.6, '#s10 .stat', { stagger: 0.1 });
  count(92.8, 2.2, 1.85, 1.25, '#st1', (v) => v.toFixed(2));
  count(92.8, 2.2, 0, 23.6, '#st2', (v) => `${v.toFixed(1)}%`);
  count(92.8, 2.2, 0, 12800, '#st3', int);
  tl.to('#pueLine', { opacity: 0.2, duration: 0.6 }, 95.0);
  draw(95.0, '#upArrow', 1.4, 0, E.io);
  tl.fromTo('#arrowHead', { opacity: 0, scale: 0.6, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.4, ease: E.spring }, 96.3);
  rise(96.4, '#valTag', { y: 8 });
  qa('#s10 .leaf').forEach((l, i) => {
    const r = +l.dataset.r;
    tl.fromTo(l, { autoAlpha: 0, scale: 0.3, rotation: r - 20, transformOrigin: '50% 100%' },
      { autoAlpha: 1, scale: 1, rotation: r, duration: 1.0, ease: E.spring }, 96.2 + i * 0.18);
  });
  hide(100.0, '#s10', 0.6);

  /* =====================================================================
     11 · 品牌定格  100–105s   particles converge, logo + slogan, light sweep, "滴"
     ===================================================================== */
  show(99.8, '#s11', 0.6);
  tl.fromTo('#ring1', { rotation: 0 }, { rotation: 40, duration: 5.2, ease: 'none' }, 99.8);
  tl.fromTo('#ring2', { rotation: 0, scale: 0.9 }, { rotation: -30, scale: 1, duration: 5.2, ease: 'none' }, 99.8);
  tl.fromTo('#codeBg', { y: -40 }, { y: 40, duration: 5.2, ease: 'none' }, 99.8);
  qa('#s11 .particle').forEach((p, i) => {
    const px = +p.dataset.x, py = +p.dataset.y;
    gsap.set(p, { x: px, y: py });
    tl.to(p, { keyframes: { x: [px, 626], y: [py, 200], opacity: [0, 1, 1, 0] }, duration: 1.1, ease: E.io }, 100.0 + i * 0.012);
  });
  rise(101.0, '#logoMark', { y: 0, scale: 0.88, ease: E.spring, d: 0.7 });
  rise(101.25, '#logoWord', { y: 14 });
  tl.fromTo('#slogan .ch', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07 }, 101.8);
  gsap.set(['#sweep1', '#sweep2'], { skewX: -18, x: -200 });
  tl.to(['#sweep1', '#sweep2'], { x: 700, duration: 1.0, ease: E.io, stagger: 0.12 }, 102.6);
  rise(104.2, '#ding', { y: 6 });
  tl.fromTo('#dingDot', { scale: 1 }, { scale: 1.8, duration: 0.12, yoyo: true, repeat: 1, immediateRender: false }, 104.3);

  tl.set({}, {}, window.TOTAL);
  return tl;
};
