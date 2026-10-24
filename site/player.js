/* Player — HUD state per shot, playback, scrubbing, step navigation, lite (reduced-motion) mode. */
(() => {
  const SH = window.SHOTS, TOTAL = window.TOTAL;
  const $ = (id) => document.getElementById(id);
  const pad = (n, w = 2) => String(n).padStart(w, '0');
  const mmss = (t) => `${pad(Math.floor(t / 60))}:${pad(Math.floor(t % 60))}`;
  const msRange = (s) => `${Math.floor(s.start / 60)}:${pad(s.start % 60)}–${Math.floor(s.end / 60)}:${pad(s.end % 60)}`;
  const chars = (s) => [...s].map((c, i) => `<span class="ch" style="--i:${i}">${c}</span>`).join('');

  const player = $('player'), frame = $('frame'), stage = $('stage'), viz = $('viz');

  /* ---------- build HUD ---------- */
  $('titles').innerHTML = SH.map((s, i) => `<div class="title-item">
      <div class="kicker">${pad(i + 1)} · ${s.act}</div>
      <div class="title-row"><h1>${s.title}</h1><span class="sub">${s.sub}</span></div>
    </div>`).join('');
  $('narrStack').innerHTML = SH.map((s) => `<p class="narr" style="margin:0">${chars(s.narr)}<i class="caret"></i></p>`).join('');
  $('pointStack').innerHTML = SH.map((s, i) => `<div class="chip-k swap">K${pad(i + 1)}<span>${s.point}</span></div>`).join('');
  $('metaStack').innerHTML = SH.map((s) => `<dl class="meta-grid swap" style="margin:0">
      <dt>时码</dt><dd class="mono">${msRange(s)}</dd>
      <dt>节奏</dt><dd>${s.pace}</dd>
      <dt>音效</dt><dd>${s.sfx}</dd>
    </dl>`).join('');
  $('track').innerHTML = SH.map((s, i) => `<div class="seg" style="flex:${s.end - s.start}"><div class="blk"><b></b><em>${pad(i + 1)}</em></div><span class="t">${s.short}</span></div>`).join('');

  const titles = [...$('titles').children];
  const narrs = [...$('narrStack').children];
  const points = [...$('pointStack').children];
  const metas = [...$('metaStack').children];
  const caps = [...$('captions').children];
  const segs = [...$('track').children];
  const segFills = segs.map((g) => g.querySelector('b'));

  /* ---------- layout: scale the whole 1920×1080 stage, or (stacked) only the 1252×520 scene ---------- */
  const vizBox = $('vizBox');
  const STACK_MQ = matchMedia('(max-width: 767px) and (orientation: portrait)');
  const fit = () => {
    if (STACK_MQ.matches) {
      stage.style.transform = '';
      viz.style.transform = `scale(${vizBox.clientWidth / 1252})`;
    } else {
      stage.style.transform = `scale(${frame.clientWidth / 1920})`;
      viz.style.transform = '';
    }
  };
  const ro = new ResizeObserver(fit);
  ro.observe(frame);
  ro.observe(vizBox);
  STACK_MQ.addEventListener('change', fit);
  fit();

  /* ---------- clocks ---------- */
  const tl = window.buildTimeline();
  const liteClock = gsap.timeline({ paused: true });
  liteClock.to({}, { duration: TOTAL });

  const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
  let lite = reduceMQ.matches;
  let cur = -1, tone = '', playing = false;

  const clock = () => (lite ? liteClock : tl);
  const now = () => clock().time();
  const shotAt = (t) => { for (let i = SH.length - 1; i >= 0; i--) if (t >= SH[i].start) return i; return 0; };

  /* ---------- PUE readout ---------- */
  const pue = { v: SH[0].pue };
  const pueVal = $('pueVal'), pueBar = $('pueBar');
  const pueColor = (v) => (v > 1.6 ? 'var(--red)' : v > 1.4 ? 'var(--orange)' : 'var(--green)');
  const paintPue = () => {
    pueVal.textContent = pue.v.toFixed(2);
    pueVal.style.color = pueColor(pue.v);
    pueBar.style.transform = `scaleX(${((pue.v - 1) / 0.9).toFixed(3)})`;
  };
  paintPue();

  /* ---------- per-shot HUD swap (CSS transitions → interruptible on rapid stepping) ---------- */
  function applyShot(i) {
    cur = i;
    const s = SH[i];
    titles.forEach((el, j) => { el.classList.toggle('is-active', j === i); el.classList.toggle('is-before', j < i); });
    [narrs, points, metas, caps].forEach((list) => list.forEach((el, j) => el.classList.toggle('is-active', j === i)));
    segs.forEach((el, j) => { el.classList.toggle('is-active', j === i); el.classList.toggle('is-past', j < i); });
    $('vizMeta').textContent = `SHOT ${pad(i + 1)} / ${SH.length} · ${msRange(s)}`;
    gsap.to(pue, { v: s.pue, duration: 0.8, ease: 'hvacOut', overwrite: true, onUpdate: paintPue });
    if (lite) {
      tl.time(s.key, false);
      viz.animate([{ opacity: 0.25 }, { opacity: 1 }], { duration: 360, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
    }
  }

  function render() {
    const t = now();
    const i = shotAt(t);
    if (i !== cur) applyShot(i);

    // tone follows what is on screen (the master timeline), so lite key-frames match their colour
    const vt = tl.time();
    const s = SH[shotAt(vt)];
    let tn = s.tones[0][1];
    s.tones.forEach(([tt, c]) => { if (vt >= tt) tn = c; });
    if (tn !== tone) { tone = tn; player.dataset.tone = tn; }

    SH.forEach((sh, j) => {
      const p = Math.min(1, Math.max(0, (t - sh.start) / (sh.end - sh.start)));
      segFills[j].style.transform = `scaleX(${p})`;
    });

    const w = scrub.clientWidth;
    head.style.transform = `translateX(${((t / TOTAL) * w).toFixed(1)}px)`;
    timeEl.textContent = `${mmss(t)} / ${mmss(TOTAL)}`;
    scrub.setAttribute('aria-valuenow', t.toFixed(1));
    scrub.setAttribute('aria-valuetext', `${mmss(t)}，镜头 ${i + 1} ${SH[i].title}`);
  }

  tl.eventCallback('onUpdate', () => { if (!lite) render(); });
  liteClock.eventCallback('onUpdate', render);
  tl.eventCallback('onComplete', () => setPlaying(false));
  liteClock.eventCallback('onComplete', () => setPlaying(false));

  /* ---------- transport ---------- */
  const playBtn = $('playBtn'), scrub = $('scrub'), head = $('head'), tip = $('tip');
  const timeEl = $('time'), liteBtn = $('liteBtn');

  function setPlaying(p) {
    playing = p;
    frame.classList.toggle('is-playing', p);
    frame.classList.toggle('is-paused', !p);
    const ended = !p && now() >= TOTAL - 0.01;
    playBtn.innerHTML = p
      ? '<i class="ph-fill ph-pause"></i><span>暂停</span>'
      : ended ? '<i class="ph ph-arrow-counter-clockwise"></i><span>重播</span>' : '<i class="ph-fill ph-play"></i><span>播放</span>';
  }

  function seek(t) {
    t = Math.min(TOTAL, Math.max(0, t));
    if (lite) liteClock.time(t, false);
    else tl.time(t, false);
    render();
  }
  function play() {
    if (now() >= TOTAL - 0.01) seek(0);
    clock().play();
    setPlaying(true);
  }
  function pause() { tl.pause(); liteClock.pause(); setPlaying(false); }
  const toggle = () => (playing ? pause() : play());

  function step(dir) {
    const t = now(), i = shotAt(t);
    if (dir < 0) seek(t - SH[i].start > 1 ? SH[i].start : SH[Math.max(0, i - 1)].start);
    else seek(i + 1 < SH.length ? SH[i + 1].start : TOTAL);
  }

  function setLite(on) {
    if (on === lite) return;
    const t = now(), wasPlaying = playing;
    pause();
    lite = on;
    frame.classList.toggle('is-lite', on);
    liteBtn.setAttribute('aria-pressed', String(on));
    cur = -1;
    if (on) liteClock.time(t, false); else tl.time(t, false);
    render();
    if (wasPlaying) play();
  }

  new ResizeObserver(() => render()).observe(scrub); // keep the playhead in place when the timeline resizes

  // landscape fit: tell CSS how much height the non-frame chrome takes (padding + controls + hint)
  const controls = document.querySelector('.controls'), hint = document.querySelector('.hint');
  const outerH = (el) => {
    if (!el.offsetParent) return 0;
    const cs = getComputedStyle(el);
    return el.offsetHeight + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom);
  };
  const measureChrome = () => {
    const ps = getComputedStyle(player);
    const h = parseFloat(ps.paddingTop) + parseFloat(ps.paddingBottom) + outerH(controls) + outerH(hint);
    document.documentElement.style.setProperty('--chrome-h', `${Math.ceil(h) + 1}px`);
  };
  const chromeRO = new ResizeObserver(measureChrome);
  chromeRO.observe(controls);
  chromeRO.observe(hint);
  measureChrome();

  playBtn.addEventListener('click', toggle);
  $('prevBtn').addEventListener('click', () => step(-1));
  $('nextBtn').addEventListener('click', () => step(1));
  liteBtn.addEventListener('click', () => setLite(!lite));
  // tap-to-play: whole frame on desktop; only the picture when stacked, so tapping text doesn't toggle
  stage.addEventListener('click', (e) => { if (!STACK_MQ.matches || e.target.closest('.viz-panel')) toggle(); });
  reduceMQ.addEventListener('change', (e) => setLite(e.matches));

  /* timeline: click a shot block to jump to it, drag to scrub precisely */
  let down = null, dragging = false, resumeAfter = false;
  const tAtX = (x) => {
    const r = scrub.getBoundingClientRect();
    return Math.min(1, Math.max(0, (x - r.left) / r.width)) * TOTAL;
  };
  scrub.addEventListener('pointerdown', (e) => {
    down = e.clientX;
    dragging = false;
    resumeAfter = playing;
    scrub.setPointerCapture(e.pointerId);
  });
  scrub.addEventListener('pointermove', (e) => {
    const t = tAtX(e.clientX), r = scrub.getBoundingClientRect(), i = shotAt(t);
    tip.textContent = `${pad(i + 1)} ${SH[i].title} · ${mmss(dragging ? t : SH[i].start)}`;
    tip.style.left = `${e.clientX - r.left}px`;
    if (down !== null && !dragging && Math.abs(e.clientX - down) > 4) {
      dragging = true;
      tl.pause(); liteClock.pause();
    }
    if (dragging) seek(t);
  });
  const endDrag = (e) => {
    if (down === null) return;
    if (dragging) { if (resumeAfter) play(); else setPlaying(false); }
    else if (e.type === 'pointerup') seek(SH[shotAt(tAtX(e.clientX))].start);
    down = null;
    dragging = false;
  };
  scrub.addEventListener('pointerup', endDrag);
  scrub.addEventListener('pointercancel', endDrag);
  scrub.addEventListener('pointerenter', () => scrub.classList.add('is-hover'));
  scrub.addEventListener('pointerleave', () => scrub.classList.remove('is-hover'));

  /* keyboard */
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const onScrub = document.activeElement === scrub;
    switch (e.key) {
      case ' ':
      case 'k':
        if (e.target.closest('button')) return; // the focused button handles its own activation
        e.preventDefault(); toggle(); break;
      case 'ArrowLeft': e.preventDefault(); onScrub ? seek(now() - 2) : step(-1); break;
      case 'ArrowRight': e.preventDefault(); onScrub ? seek(now() + 2) : step(1); break;
      case 'Home': e.preventDefault(); seek(0); break;
      case 'End': e.preventDefault(); seek(TOTAL); setPlaying(false); break;
      default:
    }
  });

  /* ---------- start ---------- */
  frame.classList.toggle('is-lite', lite);
  liteBtn.setAttribute('aria-pressed', String(lite));
  seek(0);
  setPlaying(false);
  window.HVAC = { tl, seek, play, pause, step, setLite };
})();
