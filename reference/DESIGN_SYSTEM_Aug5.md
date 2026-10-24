# AI+Power Design System & Style Guide

> **Audience:** An agent or designer with **no prior context** about this product.
> **Goal:** Build new UI that looks, feels, and moves like the existing AI+Power surfaces.
> **Source of truth:** `theme.js` (colors/surfaces), page `:root` + component CSS (layout/type/radius), `shared-sidebar.js` (nav chrome). Motion is hard-coded per page — follow the recipes below.

---

## 0. Product & visual identity (in one paragraph)

**AI+Power** is a Schneider Electric–flavored **industrial ops console** for intelligent factory / power distribution agentic operations (Chinese UI). It feels like a **frosted glass control room**: translucent panels over a soft navy or cool-white atmospheric background, **Schneider green for action**, **cyan for selection/focus**, **orange/red for severity**. Brand mark is the “dashixiong” mascot tile + **AI+Power** wordmark. Not a consumer SaaS dashboard, not Material, not purple-gradient AI chic — think **ops cockpit + premium product UI**.

**Locale:** `lang="zh-CN"`. Primary typeface: **Microsoft YaHei** (`"微软雅黑", "Microsoft YaHei", sans-serif`). Icons: **Phosphor Icons** (regular + fill).

**Pages that define the style (match these, not the mobile exception):**
| File | Role |
|------|------|
| `index.html` | Main agent workbench (canvas + log + agent column) |
| `create-skill.html` | Agent Studio matrix / multi-stage create flow |
| `knowledge-base.html` / `create-knowledge-base.html` | Knowledge graph studio |
| `shared-sidebar.js` | Shared left nav (brand, scenarios, collapse) |
| `theme.js` | Light/dark CSS variable tokens |

**Exception — do not copy for desktop product UI:** `engineer-work-order.html` uses Inter + phone chrome + standalone dark tokens. Treat it as a mobile companion skin only.

---

## 1. Design principles (non-negotiable)

1. **Token-first.** Colors, borders, shadows, fills come from CSS variables injected by `theme.js` (`data-theme="light"|"dark"`). Prefer `var(--…)` over raw hex in new CSS.
2. **Glass, not cards-by-default.** Surfaces are translucent / soft-alpha panels with thin borders (`var(--line)`), light blur (`backdrop-filter: blur(10–16px)`), and soft elevation — not heavy white Material cards with thick shadows.
3. **Green = do. Cyan = select. Orange = elevated risk. Red = critical. Gold = manual mode.** Never invent a new primary accent.
4. **Heavy type for titles, quiet meta.** Titles are weight **900**; chips/filters **800**; body/meta **700**. Kickers are **uppercase + wide letter-spacing**.
5. **Pills for actions, soft squares for panels.** Buttons/filters → `border-radius: 999px`. Panels → `10 / 14 / 18 / 22px`.
6. **Motion is layered:** micro chrome is short; structure enters with expo-out; ambient loops are slow/linear; drama is reserved for alerts/risk.
7. **Default theme is light** (`localStorage` key `powerGptTheme`). Support both themes via tokens.
8. **Chinese-first copy** in UI chrome; keep density industrial but readable.

---

## 2. Theme system

### How themes work
- `theme.js` injects a `<style id="powerGptThemeTokens">` with `:root, [data-theme="dark"] { … }` and `[data-theme="light"] { … }`.
- Apply with `document.documentElement.setAttribute('data-theme', theme)`.
- API: `PowerGptTheme.getTheme()`, `.applyTheme()`, `.toggleTheme()` (shortcut **M** in product).
- Load `theme.js` early so tokens exist before paint.

### Atmosphere (body background — always use this pattern)

```css
body {
  font-family: "微软雅黑", "Microsoft YaHei", sans-serif;
  color: var(--text-title);
  background:
    radial-gradient(circle at top right, var(--bg-radial-green), transparent 24%),
    radial-gradient(circle at bottom left, var(--bg-radial-blue), transparent 28%),
    linear-gradient(180deg, var(--bg-top) 0%, var(--bg-bottom) 100%);
}
```

Dark: deep navy (`#0a1724` → `#0e1d2c`) with soft green/blue glows.  
Light: cool gray-white (`#f5f8fb` → `#edf1f6`) with the same radial recipe at lower intensity.

---

## 3. Color system

### Core accents (memorize these)

| Role | Token | Dark | Light |
|------|-------|------|-------|
| Brand / success / primary CTA | `--green` | `#3dcd58` | `#2db84a` |
| Focus / selection / interactive | `--cyan` | `#59c7ff` | `#1a9fd4` |
| Elevated warning | `--orange` | `#ffac33` | `#d48806` |
| Critical / alert | `--red` | `#ff654f` | `#d94432` |
| Specialty accent | `--accent-purple` | `#a98bff` | `#8b6fe0` |
| Manual-mode status | `--accent-gold` | `#ffc96a` | `#c48820` |

**Primary CTA fill:** `var(--accent-green-gradient)`  
- Dark: `linear-gradient(135deg, #7ef092 → #3dcd58)`  
- Light: `linear-gradient(135deg, #5fd676 → #2db84a)`  
**CTA label on green:** `var(--accent-green-on)` (near-black in dark, white in light).

**Secondary / invert CTA:** `var(--btn-secondary-bg)` / `var(--btn-secondary-fg)` — white-on-dark invert in dark theme; dark ink fill in light theme.

### Text

| Token | Use |
|-------|-----|
| `--text-title` | Headings, brand, primary labels |
| `--text-primary` | Body |
| `--text-secondary` | Supporting copy, kickers |
| `--text-white-dim` / `--text-gray-mid` / `--text-gray-dim` | De-emphasized meta |

### Surfaces & shell

| Token | Use |
|-------|-----|
| `--panel`, `--panel-soft` | Generic panels |
| `--shell-bg`, `--shell-border` | Main stage shell |
| `--shell-panel-top` / `--shell-panel-bottom` | Panel vertical gradients |
| `--panel-header-bg` | Panel headers |
| `--panel-elevated` / `--panel-deep` | Raised vs recessed |
| `--input-bg` / `--input-border` | Form controls |
| `--surface-1` … `--surface-10` (+ higher alphas) | Soft white/black alpha ladder for fills |

Borders: `--line`, `--border-subtle`, `--border-faint`, `--border-mid`, `--border-light`, `--border-strong`.

### Selection / cyan family
Use `--accent-cyan-soft`, `--accent-cyan-mid`, `--accent-cyan-border`, `--accent-cyan-ring`, `--accent-cyan-fill`, `--accent-cyan-glow` for selected rows, active nav, inset focus rings (`box-shadow: inset 0 0 0 1px var(--accent-cyan-ring)`).

### Severity fills
- Critical: `--pri-high-bg`, `--accent-red-bg-*`, `--alert-red-*`
- Elevated: `--pri-mid-bg`, `--accent-orange-bg-*`
- Watch / info: `--pri-low-bg`, cyan soft fills
- Risk dots (8×8): critical=`--red`, elevated=`--orange`, watch=`--cyan`, nominal=`--green`

### Gradients commonly reused
- `--gradient-cyan-green` — cyan→green horizontal (hero accents, progress vibes)
- `--gauge-fill-gradient` — orange→red (gauges)
- `--heat-strip-gradient` — full spectrum heat strip
- `--fill-progress` — green progress fill
- `--modal-panel-gradient` / glass top-bottom pairs for overlays

### Scenario accent colors (sidebar)
| Scenario | Accent |
|----------|--------|
| 预测性维护 | `#59c7ff` (cyan) |
| 日常运维 | `#3dcd58` (green) |
| 报警收敛 | `#ffac33` (orange) |

### Knowledge-graph node palettes
`theme.js` exports five families (amber / green / cyan / purple / orange) each with `{core, mid, edge, dark, glow}` for dark and light. Use these for graph nodes — don’t freehand Tailwind colors.

---

## 4. Typography

### Font stack
```css
font-family: "微软雅黑", "Microsoft YaHei", sans-serif;
```
Do **not** use Inter / Roboto / system-ui on main product pages.

### Weight scale
| Weight | Use |
|--------|-----|
| **900** | Brand name, page titles, primary buttons, skill names |
| **850** | Sidebar chrome labels (theme/collapse) |
| **800** | Pills, chips, filters, toggles, tags |
| **700** | Captions, status, switch labels |
| **650** | Dense device meta |

### Size scale (practical)
| Size | Use |
|------|-----|
| `1.375rem` | Brand / page heading |
| `1.2rem` | Sidebar brand name |
| `1.125rem` | HUD / panel titles |
| `0.875rem` | Body actions (often × `0.85` in side panels) |
| `0.75rem` | Pills, subtitles, selects |
| `0.68–0.72rem` | Meta, captions |
| `0.62–0.65rem` | Collapsed labels, tiny tags |
| Hero (studio): | `calc(1.375rem * 1.5)` title; eyebrows/prompts via `clamp()` |

### Tracking & leading
- Titles: `line-height: 1.08–1.1`; optional `letter-spacing: -0.02em ~ -0.03em`
- Kickers / uppercase labels: `letter-spacing: 0.08em–0.12em`; `text-transform: uppercase`
- Pills: `letter-spacing: 0.05em`; uppercase
- Body: `line-height: 1.7–1.75`

### Brand chrome pattern
- Mark: **48×48**, `border-radius: 14px`, green gradient fill, weight 900 (or `dashixiong.png` image)
- Title: **AI+Power**, weight 900, `1.375rem`
- Subtitle: uppercase kicker, `0.75rem`, `letter-spacing: 0.12em`, cyan icon accent

---

## 5. Shape, elevation, blur

### Radii
| Token / pattern | Value | Use |
|-----------------|-------|-----|
| `--radius-md` | `10px` | Small cards, scenario tiles |
| `--radius-lg` | `14px` | HUD cards, brand mark, alert buttons |
| `--radius-xl` | `18px` | Large cards, modals |
| Shell | `22px` | `.stage-grid`, fullscreen shells |
| Pill | `999px` | Buttons, filters, switches, chips |
| Chat shell | `18px` | Composer container |
| Tiny chips | `5–8px` | Device tags, canvas controls |
| Segmented control | `11px` shell / `8px` inner |

### Shadows (use tokens)
Prefer `var(--shadow)`, `--shadow-sm/md/lg/xl`, `--shadow-card`, `--shadow-panel`, `--shadow-modal`, `--shadow-cyan-lg`, green CTA shadow tokens.  
Dark shadows are deep black; light shadows are soft blue-gray (`rgba(15, 35, 55, …)`).

### Borders & glass
- Default: `1px solid var(--line)` or `var(--shell-border)`
- Active: cyan inset ring
- Glass: `backdrop-filter: blur(10px–16px)` on HUD / cards / overlays
- Scrims: `--scrim`, `--modal-scrim`, `--overlay-scrim*`

---

## 6. Layout patterns

### App shell (workbench — `index.html`)
```
body (atmospheric bg)
├── .skill-sidebar     fixed left, z-index ~80
└── .stage-grid        fixed inset --stage-pad (24px), radius 22px, shell-bg
    ├── .canvas-shell      (main)
    ├── .exec-log-panel    (--log-height: 180px)
    └── .agent-column      (--agent-width: 600px)
```
Grid: `minmax(0,1fr) var(--agent-width)` × `minmax(0,1fr) var(--log-height)`, **gap 0**.

### Shared sidebar
- Expanded **248px** (≤980px: **216px**); collapsed **76px**; hidden **0**
- Brand mark + AI+Power; scenario accordions; agent rows (cube icon + green switch)
- Bottom: Agent Studio + Knowledge Base + collapse control
- CSS variable: `--shared-sidebar-width`
- Studio/KB pages: `body.has-skill-sidebar` + content `margin-left: var(--shared-sidebar-width)`

### Studio / KB pages
Hero (cyan eyebrow + heavy title + short prompt) → matrix / sector grid → stage cards.  
Horizontal padding: `clamp(16px, 2.4vw, 40px)`. Top: `clamp(32px, 5vh, 64px)`.

### Spacing (practical, no formal 4pt file)
Common gaps: **2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24px**.  
Panel padding: ~**16–18px**. Stage pad: **24px**. Prefer compact industrial density over airy marketing whitespace.

### Inspector / agent column
`--inspector-width: 392px`. Agent column overlays / chat dock fill the right column; inspector can slide as overlay with shell panel gradients.

---

## 7. Component recipes

### Buttons
| Variant | Shape | Fill | Label |
|---------|-------|------|-------|
| Primary | Pill or 12–14px | `--accent-green-gradient` | `--accent-green-on` |
| Secondary / invert | Pill | `--btn-secondary-bg` | `--btn-secondary-fg` |
| Ghost | Matching radius | `surface-*` + border | secondary → title on hover |

Hover: `translateY(-1px)` (sometimes −2px), shadow steps up, **0.16s ease**.  
Active: return to `translateY(0)`, optional `opacity: 0.85`.

### Inputs
- Select / compact: min-height ~34px, pill, `surface-1` + `line`, weight 800
- Chat composer: shell radius 18px, deep panel, soft border; textarea transparent, min-height ~60px
- Focus-visible: cyan ring / outline — never omit keyboard focus

### Pills / chips / tags
- Padding ~`8px 12px` (filters can be `6px 11px`)
- Pill radius, `0.75rem`, weight 800, uppercase `0.05em`
- Status text colored by severity tokens
- Device tags: `5px` radius, `0.65rem`, soft green/cyan fills

### Switches
- Track ~`42×24`, pill; thumb `16×16` inset 3px
- On: green fill (`--sidebar-switch-on-*`); thumb `translateX(18px)`
- Thumb spring: `0.22s cubic-bezier(0.34, 1.56, 0.64, 1)`

### Cards / HUD
- Padding 14–16px, radius `var(--radius-lg)` or 12–16px
- Soft surface + `1px` line + `backdrop-filter: blur(16px)` + `--shadow-panel`
- Hover lift −2px to −5px with expo-out (content cards), not on every chrome element

### Modals
- Scrim: `--modal-scrim`
- Panel: modal gradient + `--shadow-modal` + `--radius-xl`
- Prefer slide/fade entrance over bounce-heavy UI chrome (see motion)

### Segmented controls
- Soft shell (radius ~11px), active segment cyan mid fill + inset cyan ring

### Icons
Phosphor via CDN (regular + fill). Prefer fill for status/emphasis, regular for chrome.

---

## 8. Interaction style

### Hover
- Micro controls: color/border/bg @ **0.16s ease**; lift **1px**
- Content cards (KB, product, risk): lift **2–5px**, optional glow, **0.2–0.46s** expo-out
- Graph: dim non-path nodes (~0.52 opacity); elevate hovered label
- Studio cards: arrow nudges `translateX(5px)`

### Expand / collapse
- Sidebar width **0.22s ease**; text opacity **0.12–0.18s**; class states: `is-skill-sidebar-collapsed|collapsing|expanding`
- Accordion chevrons rotate **90° / 180°** @ ~0.2s; many bodies use display toggle (instant) — height morph only when intentional (PE steps, docks)
- Chat overlay: opacity + blur **0.24s** when active

### Drag
- Canvas pan: grab cursor; **disable ambient animations while dragging**
- Graph/fault-tree: scale up while dragging (~1.34), spring release
- Panel resize: dim inactive panels to ~0.35 opacity (anime.js ~200–260ms)

### Streaming / agent UX
- Typewriter ~**16ms** interval; `is-streaming` class
- Caret: `▌` with `caret-blink` steps(1) 1s
- Thinking: 3 bouncing dots, 1.2s ease-in-out, stagger 0.15s
- Diagnosis cards enter with small Y offset (8–16px) via GSAP

### Loading (no skeletons)
Use: spinners, dual-ring launch overlays, progress bar fills (`--fill-progress`), ambient PE orbs, typing dots, exec pie states. **Do not** add shimmer skeleton placeholders — they are not part of this language.

### Focus & a11y
- Provide `:focus-visible` outlines on interactive cards/controls
- Honor `@media (prefers-reduced-motion: reduce)` for decorative loops and stage intros

---

## 9. Motion & animation system

There are **no motion tokens in `theme.js`**. Copy these recipes exactly.

### Signature easings
| Name | Value | Use |
|------|-------|-----|
| **Expo-out (enter)** | `cubic-bezier(0.22, 1, 0.36, 1)` | Panels, toasts-in, steppers-in, card entrances |
| **Accelerate (exit)** | `cubic-bezier(0.4, 0, 1, 1)` | Toast-out, stepper exit, collapse |
| **Soft spring** | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Switch thumb, fault-tree node scale |
| **Chrome** | `ease` | Most 0.16–0.22s property transitions |
| **GSAP** | `power2.out` / `power3.out`; modal `back.out(1.5)` | Camera, message cards, alert modal |
| **anime.js** | `easeOutCubic` / `easeOutQuad` | Staggers, dock morph, dim |

### Duration clusters
| Layer | Duration | Pattern |
|-------|----------|---------|
| Micro hover | **0.16s** | color, border, 1px lift |
| Chrome | **0.18–0.22s** | sidebar width, soft lifts |
| Structure enter | **0.42–0.62s** | opacity 0→1, `translateY(8–16px)`, optional `scale(0.92–0.98)` |
| Exit | **0.28–0.42s** | accelerate ease |
| Progress fills | **0.5–1.65s** | width/clip |
| Ambient loops | **7–54s** | linear or ease-in-out breathe |
| Alert / risk loops | **0.65–3.4s** | ants, radar, throb, shake |

### Entrance recipe (canonical)
```css
@keyframes stagePanelIn {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* apply: 0.62s cubic-bezier(0.22, 1, 0.36, 1) both; stagger delays 0 / 0.12 / 0.26 / 0.4s */
```

Toast: in **0.34s** expo-out; out **0.28s** accelerate.

### Ambient vs urgency (layering)
1. **UI chrome** — short, quiet  
2. **Content enter** — expo-out fade/slide  
3. **Ambient industrial** — slow ring drift, link-flow dashes, equipment marquee (**22s** linear), PE spins (**14–22s**)  
4. **Risk/alert only** — marching ants, radar (`fx-radar`), throb, shake/flash, scanlines  

Risk tier node FX (keep semantics):
- critical → radar expand  
- elevated → double-pulse throb  
- watch → soft sonar  
- nominal → gentle water wave  

### Libraries
| Lib | Version (CDN) | Use for |
|-----|---------------|---------|
| GSAP | 3.12.5 | Camera pan/zoom, modal spring, message/card enter, SVG clip reveal |
| anime.js | 3.2.2 | Staggered lists/cards, dock height morph, panel dim, draggable graph |

Prefer CSS keyframes for chrome/ambient; GSAP/anime for choreographed sequences. Gate decorative infinite animations under reduced-motion.

### Stepper / stage transitions (create flows)
Exit: blur + scale down + move up (`flowStepperExit`, accelerate).  
Enter: reverse with expo-out.  
PE engine: stacked aura/spin/breath/scan loops — “alive processing,” not busy UI.

---

## 10. Do / Don’t

### Do
- Use `theme.js` tokens and dual theme parity for every new color
- Keep YaHei + heavy titles + uppercase kickers
- Use green gradient pills for primary actions; cyan for selection
- Build glass panels with thin borders and soft blur
- Match hover **0.16s** and enter **expo-out 0.42–0.62s**
- Write zh-CN labels consistent with ops language (巡检、告警、诊断、工单、部署…)
- Include Phosphor icons; reuse `dashixiong.png` for brand marks
- Dim / freeze ambient motion while dragging canvases

### Don’t
- Don’t introduce purple-on-white / indigo AI gradients as the main theme
- Don’t use Inter/system fonts on desktop product surfaces
- Don’t make flat opaque Material cards the default container
- Don’t use skeleton shimmer loaders
- Don’t apply alert-level motion (shake, fast ants, radar) to neutral chrome
- Don’t invent a third primary brand color
- Don’t copy `engineer-work-order.html` tokens into the main shell
- Don’t hardcode only-dark or only-light hex without light/dark token pairs

---

## 11. Copy & content tone (UI)

- Product name in chrome: **AI+Power** (not “PowerGPT”)
- Voice: professional industrial ops, concise, action-oriented
- Scenario names: 预测性维护 / 日常运维 / 报警收敛
- Module names: Agent Studio · 知识图谱工作室 · 智能体工作台
- Status language: 运行中 / 等待确认 / 已完成 / 告警 / 风险分级（critical / elevated / watch / nominal）

---

## 12. Implementation checklist for a new surface

1. Include `theme.js`; set `data-theme`; use atmospheric body background.
2. Include `shared-sidebar.js` if the page is part of the main product nav.
3. Declare local layout tokens (`--radius-*`, widths) mirroring index/create pages.
4. Type: YaHei, weight 900 titles, 800 chips, uppercase kickers.
5. Accents: green CTA, cyan selection, severity colors for status.
6. Panels: translucent surfaces, `1px` line, radius 10–22px, optional blur.
7. Interactions: 0.16s hover lift; expo-out entrances; reduced-motion fallbacks.
8. Loading: spinner / progress / ambient — no skeletons.
9. Verify **light and dark**.
10. Keep Chinese UI strings and Phosphor iconography.

---

## 13. Quick reference — files to read when implementing

| Need | Open |
|------|------|
| All color/surface/shadow tokens | `theme.js` |
| Sidebar brand + widths + switches | `shared-sidebar.js` |
| Workbench layout, pills, chat, canvas FX | `index.html` (`:root`, body, stage, components) |
| Studio hero + stage cards + PE motion | `create-skill.html` |
| KB cards + stagger entrances | `knowledge-base.html` |
| Product narrative / module map | `产品总览.md` |

---

## 14. One-line style summary

**Frosted industrial cockpit: YaHei + heavy titles, Schneider green actions, cyan selection, glass navy/white panels, pill CTAs, soft 0.16s chrome, expo-out structure, slow ambient loops, dramatic motion only for risk — never skeuomorphic skeletons, never purple SaaS defaults.**
