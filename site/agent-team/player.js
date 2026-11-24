/* Player: scales the 1280×764 stage, runs the clock, swaps chapters and captions. */
(() => {
  const CH = window.CHAPTERS;
  const { on, css, txt } = K;
  const $ = s => document.querySelector(s);
  const app = $('#app'), frame = $('#frame'), stage = $('#stage'), scenes = $('#scenes');
  const kickerEl = $('#kicker'), titleEl = $('#title');
  const trScroll = $('#trScroll'), trList = $('#trList');
  const prevBtn = $('#prev'), nextBtn = $('#next'), tabsEl = $('#tabs'), pageEl = $('#page');

  let idx = 0, T = 0, update = () => {}, reveals = [], capIdx = -2, trItems = [], trTimes = [];

  /* stage scaling. The caption list is padded so its first line of text starts level with
     the top of the slide body (the comparison lanes, BODY_TOP stage units down). */
  const trPanel = $('.transcript');
  const BODY_TOP = 176;
  const fit = () => {
    const s = frame.clientWidth / 1280;
    css(stage, '--s', s.toFixed(5));
    const side = Math.abs(trPanel.getBoundingClientRect().top - frame.getBoundingClientRect().top) < 2;
    if (!side) { trScroll.style.removeProperty('padding-top'); trScroll._css = {}; return; }
    const probe = trList.querySelector('button') ? trList.querySelector('.tr-x') : null;
    const bs = probe ? getComputedStyle(probe.parentElement) : null, xs = probe ? getComputedStyle(probe) : null;
    const btnPad = bs ? parseFloat(bs.paddingTop) : 10;
    const leading = xs ? (parseFloat(xs.lineHeight) - parseFloat(xs.fontSize)) / 2 : 4;
    const target = stage.getBoundingClientRect().top + BODY_TOP * s;
    const pad = target - trScroll.getBoundingClientRect().top - btnPad - leading;
    css(trScroll, 'padding-top', `${Math.max(8, pad).toFixed(1)}px`);
  };
  new ResizeObserver(fit).observe(frame);
  addEventListener('resize', fit);
  document.fonts?.ready.then(fit);
  fit();

  /* sections are numbered from 01 for people; idx stays 0-based inside */
  const num = i => String(i + 1).padStart(2, '0');

  /* chapter tabs */
  tabsEl.innerHTML = CH.map((c, i) => `
    <li><button type="button" data-i="${i}"><span class="tab-n mono">${num(i)}</span><span class="tab-l">${c.tab}</span><i class="tab-p"><i></i></i></button></li>`).join('');
  const tabs = [...tabsEl.querySelectorAll('button')];
  const tabFill = tabs.map(b => b.querySelector('.tab-p>i'));
  tabsEl.addEventListener('click', e => { const b = e.target.closest('button'); if (b) go(+b.dataset.i); });

  /* crossfading text: outgoing drifts up and fades, incoming rises in */
  function swap(el, html) {
    for (const c of [...el.children]) {
      if (c.classList.contains('leave')) continue;
      c.classList.add('leave');
      setTimeout(() => c.remove(), 500);
    }
    if (!html) return;
    const n = document.createElement('span');
    n.className = 'sw enter';
    n.innerHTML = html;
    el.appendChild(n);
    void n.offsetWidth;
    n.classList.remove('enter');
  }

  /* transcript: every line of the chapter's narration, the spoken one at full opacity */
  function buildTranscript() {
    const caps = (CH[idx].captions || []).filter(c => c[1]);
    trTimes = caps.map(c => c[0]);
    trList.innerHTML = caps.map((c, k) => `
      <li class="rv" style="--i:${k}"><button type="button" data-t="${c[0]}" title="从这里播放">
        <span class="tr-t mono">${String(k + 1).padStart(2, '0')}</span><span class="tr-x">${c[1]}</span>
      </button></li>`).join('');
    trItems = [...trList.querySelectorAll('button')];
    trScroll.scrollTop = 0;
    fit();
    void trList.offsetWidth;
    trList.querySelectorAll('li').forEach(li => li.classList.add('in'));
  }
  trList.addEventListener('click', e => { const b = e.target.closest('button'); if (b) go(idx, +b.dataset.t); });

  function go(i, t0 = 0) {
    i = Math.max(0, Math.min(CH.length - 1, i));
    idx = i;
    T = t0; capIdx = -2;
    for (const old of scenes.querySelectorAll('.scene:not(.leaving)')) {
      old.classList.add('leaving');
      setTimeout(() => old.remove(), 650);
    }
    const sc = document.createElement('div');
    sc.className = 'scene';
    sc.dataset.id = CH[idx].id;
    scenes.appendChild(sc);
    update = CH[idx].build(sc) || (() => {});
    reveals = [...sc.querySelectorAll('[data-at]')].map(el => [el, +el.dataset.at]);
    on(stage, 'hero', !!CH[idx].hero);
    swap(kickerEl, CH[idx].kicker);
    swap(titleEl, CH[idx].title ? `<span class="title-n mono">${num(idx)}</span>${CH[idx].title}` : '');
    buildTranscript();
    tabs.forEach((b, k) => { on(b, 'on', k === idx); b.setAttribute('aria-current', k === idx ? 'step' : 'false'); });
    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx === CH.length - 1;
    txt(pageEl, `${num(idx)} / ${num(CH.length - 1)}`);
    try { history.replaceState(null, '', '#' + (idx + 1)); } catch (e) {}
    render();
  }

  function render() {
    for (const [el, at] of reveals) on(el, 'in', T >= at);
    update(T);
    let ci = -1;
    trTimes.forEach((t0, k) => { if (T >= t0) ci = k; });
    if (ci !== capIdx) {
      capIdx = ci;
      trItems.forEach((b, k) => {
        on(b, 'now', k === ci); on(b, 'past', k < ci);
        b.setAttribute('aria-current', k === ci ? 'true' : 'false');
      });
      const cur = trItems[ci];
      if (cur && trScroll.scrollHeight > trScroll.clientHeight) {
        trScroll.scrollTo({ top: Math.max(0, cur.offsetTop - trScroll.clientHeight * 0.3), behavior: 'smooth' });
      }
    }
    tabFill.forEach((f, k) => css(f, 'transform', `scaleX(${k < idx ? 1 : k > idx ? 0 : (T / CH[idx].dur).toFixed(4)})`));
  }

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(50, now - last);
    last = now;
    // play the chapter once, then hold on its final frame; moving on is manual
    T = Math.min(T + dt, CH[idx].dur);
    render();
    requestAnimationFrame(loop);
  }

  const step = d => { const n = idx + d; if (n >= 0 && n < CH.length) go(n); };
  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));

  /* theme */
  $('#theme').addEventListener('click', () => {
    const root = document.documentElement;
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('agent-team-theme', root.dataset.theme); } catch (e) {}
  });

  /* fullscreen */
  const toggleFs = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else app.requestFullscreen?.().catch(() => {});
  };
  $('#fs').addEventListener('click', toggleFs);

  document.addEventListener('keydown', e => {
    if (e.target.closest && e.target.closest('input,textarea')) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); step(-1); }
    else if (e.key === 'f' || e.key === 'F') toggleFs();
    else if (/^[1-9]$/.test(e.key) && +e.key <= CH.length) go(+e.key - 1);
  });

  // console hook for reviewing a moment: AT.go(2); AT.seek(9000)
  window.AT = { go, seek: ms => { T = ms; render(); } };

  const h = parseInt(location.hash.slice(1), 10);
  go(Number.isInteger(h) ? h - 1 : 0); // #1 … #6, matching the section numbers
  requestAnimationFrame(loop);
})();
