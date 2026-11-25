/* Shared helpers: easing, idempotent DOM writes, and line-art icons. */
window.K = (() => {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const prog = (t, t0, d) => clamp((t - t0) / d);
  const lerp = (a, b, p) => a + (b - a) * p;
  const ease = {
    smooth: x => x * x * (3 - 2 * x),
    out: x => 1 - Math.pow(1 - x, 4),
    back: x => 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2),
  };
  // Writes are cached so a 60fps update loop only touches the DOM when a value changes.
  const on = (el, cls, cond) => { if (el && el.classList.contains(cls) !== !!cond) el.classList.toggle(cls, !!cond); };
  const css = (el, prop, val) => {
    if (!el) return; val = String(val);
    const c = el._css || (el._css = {});
    if (c[prop] !== val) { c[prop] = val; el.style.setProperty(prop, val); }
  };
  const attr = (el, k, v) => {
    if (!el) return; v = String(v);
    const c = el._attr || (el._attr = {});
    if (c[k] !== v) { c[k] = v; el.setAttribute(k, v); }
  };
  const txt = (el, s) => { if (!el) return; s = String(s); if (el._txt !== s) { el._txt = s; el.textContent = s; } };
  const pad = n => String(n).padStart(2, '0');
  return { clamp, prog, lerp, ease, on, css, attr, txt, pad };
})();

window.IC = (() => {
  const P = {
    person: '<circle cx="12" cy="7.8" r="3.6"/><path d="M4.8 20.3c.6-3.9 3.5-6.4 7.2-6.4s6.6 2.5 7.2 6.4"/>',
    doc: '<path d="M6 3.5h8.2L18 7.3v13.2H6z"/><path d="M14 3.5v4h4"/><path d="M9 11.5h6M9 14.5h6M9 17.5h3.5"/>',
    server: '<rect x="4" y="3.5" width="16" height="7" rx="1.5"/><rect x="4" y="13.5" width="16" height="7" rx="1.5"/><path d="M7.5 7h.01M7.5 17h.01M11 7h5M11 17h5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    shield: '<path d="M12 3l7 2.8v5.4c0 4.4-2.9 7.8-7 9.8-4.1-2-7-5.4-7-9.8V5.8z"/><path d="M8.8 12l2.2 2.2 4.2-4.4"/>',
    home: '<path d="M4 11.2L12 4.5l8 6.7"/><path d="M6 9.8V20h12V9.8"/><path d="M10 20v-5h4v5"/>',
    arrow: '<path d="M4.5 12h15M13.5 6l6 6-6 6"/>',
    down: '<path d="M12 4.5v15M6 13.5l6 6 6-6"/>',
    chev: '<path d="M9 5l7 7-7 7"/>',
    scissors: '<circle cx="6.5" cy="17.5" r="2.8"/><circle cx="6.5" cy="6.5" r="2.8"/><path d="M8.7 8.3L20 18M8.7 15.7L20 6"/>',
    ruler: '<rect x="2.5" y="8" width="19" height="8" rx="1.5"/><path d="M6 8v3M9.5 8v4.5M13 8v3M16.5 8v4.5"/>',
    building: '<path d="M4 20.5V5.5l8-2v17M12 8.5h8v12"/><path d="M2.5 20.5h19M7 8h2M7 11.5h2M7 15h2M15 12h2M15 15.5h2"/>',
    factory: '<path d="M3 20.5V10l5 3V10l5 3V10l5 3V4.5h3v16z"/><path d="M2 20.5h20"/>',
    plug: '<path d="M9 3.5v4M15 3.5v4M6.5 7.5h11v3.5a5.5 5.5 0 0 1-11 0z"/><path d="M12 16.5v4"/>',
    prompt: '<rect x="3" y="4.5" width="18" height="15" rx="2"/><path d="M7 10l3 2.5L7 15M12 15h5"/>',
    flask: '<path d="M9.5 3.5h5M10.5 3.5v5.5L5 18.5a1.5 1.5 0 0 0 1.3 2h11.4a1.5 1.5 0 0 0 1.3-2L13.5 9V3.5"/><path d="M7.5 14.5h9"/>',
    loop: '<path d="M19.5 12a7.5 7.5 0 0 1-13.3 4.8M4.5 12a7.5 7.5 0 0 1 13.3-4.8"/><path d="M18.5 3.5v4h-4M5.5 20.5v-4h4"/>',
    api: '<path d="M8 6.5L3.5 12 8 17.5M16 6.5l4.5 5.5-4.5 5.5M13.5 5l-3 14"/>',
    live: '<circle cx="12" cy="12" r="2"/><path d="M8 8a5.6 5.6 0 0 0 0 8M16 8a5.6 5.6 0 0 1 0 8M5.2 5.2a9.6 9.6 0 0 0 0 13.6M18.8 5.2a9.6 9.6 0 0 1 0 13.6"/>',
    coin: '<circle cx="12" cy="12" r="8.5"/><path d="M14.8 8.8c-.5-.9-1.6-1.4-2.8-1.4-1.6 0-2.8.8-2.8 2.1 0 3 5.8 1.6 5.8 4.7 0 1.3-1.3 2.2-3 2.2-1.3 0-2.5-.6-3-1.6M12 5.5v1.9M12 16.6v1.9"/>',
    layers: '<path d="M12 3.5l9 4.5-9 4.5-9-4.5z"/><path d="M3 12.5l9 4.5 9-4.5M3 16.5l9 4.5 9-4.5"/>',
    chair: '<path d="M7 3.5h10v9H7z"/><path d="M5 12.5h14v3H5zM7 15.5v5M17 15.5v5"/>',
    alert: '<path d="M12 4L21 19.5H3z"/><path d="M12 10v4.5M12 17.2h.01"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  };
  const svg = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;
  // The agent: a rounded head with an antenna (same character as ../agent-team).
  const agent = (cls = '') => `<span class="agent ${cls}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.6V2.6"/><circle class="solid" cx="12" cy="1.9" r="1"/><rect x="3.5" y="4.6" width="17" height="15.4" rx="4.4"/><g class="eyes-on"><circle class="solid" cx="9" cy="12.2" r="1.6"/><circle class="solid" cx="15" cy="12.2" r="1.6"/></g><path class="eyes-off" d="M7.3 12.8h3.3M13.4 12.8h3.3"/><path d="M10.2 16.3h3.6"/></svg></span>`;
  // A large figure for the comparison lanes: a person (traditional) or an agent (present).
  const figure = kind => kind === 'agent' ? agent() : `<span class="person">${svg('person')}</span>`;
  return { svg, agent, figure };
})();
