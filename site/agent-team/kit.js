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
    tree: '<rect x="9" y="3.5" width="6" height="4.5" rx="1"/><rect x="3.5" y="16" width="5" height="4.5" rx="1"/><rect x="15.5" y="16" width="5" height="4.5" rx="1"/><path d="M12 8v4M6 16v-4h12v4"/>',
    code: '<rect x="3" y="4.5" width="18" height="15" rx="2"/><path d="M3 8.5h18"/><path d="M10 12l-2.2 2.2L10 16.4M14 12l2.2 2.2L14 16.4"/>',
    search: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5.5 5.5"/>',
    server: '<rect x="4" y="3.5" width="16" height="7" rx="1.5"/><rect x="4" y="13.5" width="16" height="7" rx="1.5"/><path d="M7.5 7h.01M7.5 17h.01M11 7h5M11 17h5"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    moon: '<path d="M19.5 14.6A7.8 7.8 0 0 1 9.4 4.5a7.8 7.8 0 1 0 10.1 10.1z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    cube: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>',
    shield: '<path d="M12 3l7 2.8v5.4c0 4.4-2.9 7.8-7 9.8-4.1-2-7-5.4-7-9.8V5.8z"/><path d="M8.8 12l2.2 2.2 4.2-4.4"/>',
    home: '<path d="M4 11.2L12 4.5l8 6.7"/><path d="M6 9.8V20h12V9.8"/><path d="M10 20v-5h4v5"/>',
    laptop: '<rect x="4.5" y="5" width="15" height="10" rx="1.5"/><path d="M2.5 18.5h19"/>',
    book: '<path d="M4 5.5c2.5-1 5.5-1 8 .8 2.5-1.8 5.5-1.8 8-.8v13c-2.5-1-5.5-1-8 .8-2.5-1.8-5.5-1.8-8-.8z"/><path d="M12 6.3v13"/>',
    db: '<ellipse cx="12" cy="6" rx="7.5" ry="2.8"/><path d="M4.5 6v12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8V6"/><path d="M4.5 12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8"/>',
    megaphone: '<path d="M4 10v4h3l7 4V6L7 10z"/><path d="M17.5 9.5a3.5 3.5 0 0 1 0 5"/>',
    chat: '<path d="M4 5.5h16v10H10l-4 3.5v-3.5H4z"/><path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01"/>',
    badge: '<rect x="5" y="3.5" width="14" height="17" rx="2"/><circle cx="12" cy="10" r="2.6"/><path d="M8.5 16.5c.6-1.7 1.9-2.6 3.5-2.6s2.9.9 3.5 2.6"/>',
    bug: '<rect x="7.5" y="7" width="9" height="12" rx="4.5"/><path d="M12 11v8M7.5 12H4M20 12h-3.5M7.5 16.5l-3 1.5M16.5 16.5l3 1.5M8.5 8L6 5.5M15.5 8L18 5.5"/>',
    list: '<rect x="5" y="3.5" width="14" height="17" rx="1.5"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>',
    arrow: '<path d="M4.5 12h15M13.5 6l6 6-6 6"/>',
    chev: '<path d="M9 5l7 7-7 7"/>',
    stamp: '<path d="M9 3.5h6l-1 7h-4z"/><path d="M5 14.5h14v3H5zM6.5 20.5h11"/>',
  };
  const svg = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;
  // The agent: a rounded head with an antenna. `.sleep` on the wrapper swaps open eyes for closed ones.
  const agent = (cls = '') => `<span class="agent ${cls}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.6V2.6"/><circle class="solid" cx="12" cy="1.9" r="1"/><rect x="3.5" y="4.6" width="17" height="15.4" rx="4.4"/><g class="eyes-on"><circle class="solid" cx="9" cy="12.2" r="1.6"/><circle class="solid" cx="15" cy="12.2" r="1.6"/></g><path class="eyes-off" d="M7.3 12.8h3.3M13.4 12.8h3.3"/><path d="M10.2 16.3h3.6"/></svg></span>`;
  return { svg, agent };
})();
