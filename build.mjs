// Genera todos los SVG de /assets.
// Uso: node build.mjs   → assets/*.svg + preview.html
// Fuentes: python fonts/build_fonts.py (crea fonts/fonts.css, se incrusta en cada SVG)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { PROJECTS, ARSENAL, LANGUAGES, SKILLS, SECTIONS, DIAGNOSTIC } from './data.mjs';

const C = {
  red: '#ff2b3a', dim: '#7a0a12', deep: '#2a0306', amb: '#ffa11f', cy: '#3df2ff',
  ink: '#070707', panel: '#0b0b0b', grey: '#a8a8a8', bone: '#ededed',
};

// ───────────────────────── utilidades ─────────────────────────

// PRNG con semilla: el resultado es idéntico en cada build
let seed = 13;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// Anchos aproximados para maquetar sin medir: Share Tech Mono es monoespaciada (0.54em)
const monoW = (s, size) => s.length * size * 0.54;
const wideW = (s, size) => s.length * size * 0.715;

const fontCss = existsSync('fonts/fonts.css') ? readFileSync('fonts/fonts.css', 'utf8') : '';

const BASE_CSS = `${fontCss}
.d{font-family:'Unbounded','Arial Black',Impact,sans-serif;font-weight:900}
.m{font-family:'Share Tech Mono',ui-monospace,Consolas,monospace}
.red{fill:${C.red}}.dim{fill:${C.dim}}.amb{fill:${C.amb}}.cy{fill:${C.cy}}.ink{fill:${C.ink}}.grey{fill:${C.grey}}.bone{fill:${C.bone}}
.fade{animation:fade .01s linear both}
@keyframes fade{from{opacity:0}to{opacity:1}}
.blink{animation:blink 1s steps(1,end) infinite}
@keyframes blink{50%{opacity:0}}
.grow{transform-box:fill-box;transform-origin:left center;animation:grow .6s cubic-bezier(.7,0,.2,1) both}
@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.rise{transform-box:fill-box;transform-origin:center bottom;animation:rise .7s cubic-bezier(.7,0,.2,1) both}
@keyframes rise{from{transform:scaleY(0)}to{transform:scaleY(1)}}
.draw{stroke-dasharray:var(--l);stroke-dashoffset:var(--l);animation:draw .5s linear both}
@keyframes draw{to{stroke-dashoffset:0}}
.rain line{stroke:${C.dim};stroke-width:1.4;animation:fall linear infinite}
@keyframes fall{from{transform:translateY(-140px)}to{transform:translateY(900px)}}
.scan{animation:scan 6s linear infinite}
@keyframes scan{from{transform:translateY(-40px)}to{transform:translateY(var(--h))}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}`;

const DEFS = `<defs>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="13" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .07 0"/></filter>
<pattern id="lines" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000" opacity=".35"/></pattern>
<linearGradient id="beam" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${C.red}" stop-opacity="0"/><stop offset=".5" stop-color="${C.red}" stop-opacity=".08"/><stop offset="1" stop-color="${C.red}" stop-opacity="0"/></linearGradient>
</defs>`;

// Envoltorio común: fondo, cuerpo, barrido de luz, scanlines y grano
function svg({ w, h, title, desc, body, css = '', rain = 0, scan = true }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="t d">
<title id="t">${esc(title)}</title><desc id="d">${esc(desc)}</desc>
<style>${BASE_CSS}${css}</style>${DEFS}
<clipPath id="frame"><rect width="${w}" height="${h}"/></clipPath>
<g clip-path="url(#frame)">
<rect width="${w}" height="${h}" fill="${C.ink}"/>
${rain ? `<g class="rain">${rainLines(rain, w, h)}</g>` : ''}
${body}
${scan ? `<rect class="scan" style="--h:${h + 40}px" width="${w}" height="40" fill="url(#beam)"/>` : ''}
<rect width="${w}" height="${h}" fill="url(#lines)"/>
<rect width="${w}" height="${h}" filter="url(#grain)"/>
</g></svg>`;
}

function rainLines(count, w, h) {
  let out = '';
  for (let i = 0; i < count; i++) {
    const x = Math.round(rand() * w);
    const y = Math.round(rand() * h);
    const len = Math.round(18 + rand() * 60);
    const dur = (1.4 + rand() * 2.2).toFixed(2);
    const delay = (-rand() * 4).toFixed(2);
    const op = (0.2 + rand() * 0.55).toFixed(2);
    out += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + len}" opacity="${op}" style="animation-duration:${dur}s;animation-delay:${delay}s"/>`;
  }
  return out;
}

function barcode(x, y, width, height) {
  let out = '';
  for (let cx = x; cx < x + width; ) {
    const w = [1, 1, 2, 3, 1, 4][Math.floor(rand() * 6)];
    if (rand() > 0.35) out += `<rect x="${cx}" y="${y}" width="${w}" height="${height}" fill="${C.red}"/>`;
    cx += w + 1 + Math.floor(rand() * 2);
  }
  return out;
}

// Barra segmentada: `full` segmentos llenos y `half` a media opacidad
function segBar(x, y, full, half, segW = 8, segH = 14, gap = 2) {
  let out = '';
  for (let i = 0; i < full + half; i++) {
    out += `<rect x="${x + i * (segW + gap)}" y="${y}" width="${segW}" height="${segH}"${i >= full ? ' opacity=".35"' : ''}/>`;
  }
  return out;
}

// Ventana estilo dashboard: barra de título roja + cuadro de cierre
function win(x, y, w, h, label, { fill = C.panel } = {}) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${C.red}" stroke-width="2"/>
<rect x="${x}" y="${y}" width="${w}" height="24" fill="${C.red}"/>
<text x="${x + 10}" y="${y + 17}" class="m ink" font-size="14">${esc(label)}</text>
<rect x="${x + w - 20}" y="${y + 5}" width="14" height="14" fill="${C.ink}"/>`;
}

function chips(list, x, y, maxW, size = 14) {
  let out = '';
  let cx = x;
  let cy = y;
  for (const c of list) {
    const w = Math.round(monoW(c, size) + 18);
    if (cx + w > x + maxW) { cx = x; cy += 34; }
    out += `<rect x="${cx}" y="${cy}" width="${w}" height="26" fill="none" stroke="${C.dim}" stroke-width="1.5"/>
<text x="${cx + 9}" y="${cy + 18}" class="m red" font-size="${size}">${esc(c)}</text>`;
    cx += w + 8;
  }
  return out;
}

function statBox(x, y, w, value, label, delay) {
  return `<g class="fade" style="animation-delay:${delay}s">
<path d="M${x} ${y}H${x + w}V${y + 70}L${x + w - 14} ${y + 84}H${x}Z" fill="none" stroke="${C.dim}" stroke-width="1.5"/>
<text x="${x + 14}" y="${y + 44}" class="d red" font-size="32">${esc(value)}</text>
<text x="${x + 14}" y="${y + 68}" class="m grey" font-size="13">${esc(label)}</text></g>`;
}

const statusColor = { LIVE: C.cy, 'COMING SOON': C.amb, PRIVATE: C.grey };

function titleBar(w, left, right) {
  return `<rect width="${w}" height="30" fill="${C.red}"/>
<text x="16" y="21" class="m ink" font-size="15">${esc(left)}</text>
${right ? `<text x="${w - 64}" y="21" class="m ink" font-size="15" text-anchor="end">${esc(right)}</text>` : ''}
<rect x="${w - 52}" y="8" width="14" height="14" fill="none" stroke="${C.ink}" stroke-width="2"/>
<rect x="${w - 30}" y="8" width="14" height="14" fill="${C.ink}"/>`;
}

function statusLine(x, y, status) {
  const col = statusColor[status];
  return `<rect class="blink" x="${x}" y="${y - 11}" width="12" height="12" fill="${col}"/>
<text x="${x + 20}" y="${y}" class="m" font-size="15" fill="${col}">STATUS: ${esc(status)}</text>`;
}

// ───────────────────────── ilustraciones ─────────────────────────

// Cuadro eliminatorio: 8 parejas → final; las líneas se dibujan ronda a ronda
function illBracket(ox, oy, w, h) {
  const rounds = [8, 4, 2, 1];
  const colX = [24, 140, 256, 352];
  const boxW = [78, 78, 78, 84];
  const top = oy + 26;
  const span = h - 52;
  let out = '';
  const centers = [];
  rounds.forEach((n, r) => {
    centers[r] = [];
    for (let i = 0; i < n; i++) {
      const cy = top + (span / n) * (i + 0.5);
      centers[r].push(cy);
      const x = ox + colX[r];
      const isWin = r === 3;
      const winner = r < 3 && i % 2 === (r === 0 ? 0 : 1);
      out += `<g class="fade" style="animation-delay:${0.2 + r * 0.55}s"><rect x="${x}" y="${cy - 10}" width="${boxW[r]}" height="20" fill="${isWin ? C.red : winner ? C.deep : 'none'}" stroke="${isWin ? C.red : winner ? C.red : C.dim}" stroke-width="1.5"/>
${isWin ? `<text x="${x + boxW[r] / 2}" y="${cy + 5}" class="m ink" font-size="13" text-anchor="middle">CHAMPION</text>` : `<rect x="${x + 6}" y="${cy - 2}" width="${20 + ((i * 7 + r * 13) % 30)}" height="4" fill="${winner ? C.red : C.dim}"/>`}</g>`;
      if (r > 0) {
        const a = centers[r - 1][i * 2];
        const b = centers[r - 1][i * 2 + 1];
        const x0 = ox + colX[r - 1] + boxW[r - 1];
        const xm = (x0 + x) / 2;
        const len = Math.round((xm - x0) * 2 + (b - a) + (x - xm));
        out += `<path class="draw" style="--l:${len};animation-delay:${r * 0.55}s" d="M${x0} ${a}H${xm}V${b}H${x0}M${xm} ${cy}H${x}" fill="none" stroke="${C.red}" stroke-width="1.5"/>`;
      }
    }
  });
  return out;
}

// Calendario de quincenas que se llena + desprendible de pago
function illPayroll(ox, oy, w, h) {
  let out = `<text x="${ox + 24}" y="${oy + 30}" class="m dim" font-size="13">PERIOD 2026-10 — Q1 / Q2</text>`;
  const cell = 19;
  const gap = 4;
  [15, 16].forEach((n, row) => {
    const y = oy + 44 + row * (cell + 10);
    out += `<text x="${ox + 24}" y="${y + 16}" class="m red" font-size="14">Q${row + 1}</text>`;
    for (let i = 0; i < n; i++) {
      const x = ox + 56 + i * (cell + gap);
      const filled = row === 0 || i < 9;
      const delay = (0.15 + (row * 15 + i) * 0.045).toFixed(2);
      out += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" fill="none" stroke="${C.dim}" stroke-width="1.2"/>`;
      if (filled) out += `<rect class="fade" style="animation-delay:${delay}s" x="${x + 3}" y="${y + 3}" width="${cell - 6}" height="${cell - 6}" fill="${row === 0 ? C.red : C.dim}"/>`;
    }
  });
  // desprendible
  const sx = ox + 24;
  const sy = oy + 128;
  const sw = w - 48;
  const rows = [
    ['OPERATIONS LOGGED', '1.284'],
    ['BATCHES', '12'],
    ['ADVANCES', '- $ 120.000'],
  ];
  out += `<g class="fade" style="animation-delay:1.6s"><path d="M${sx} ${sy}H${sx + sw}V${sy + 150}L${sx + sw - 16} ${sy + 166}H${sx}Z" fill="none" stroke="${C.red}" stroke-width="1.5"/>
<text x="${sx + 16}" y="${sy + 26}" class="m red" font-size="14">PAYSLIP // Q1 CLOSED</text>`;
  rows.forEach(([k, v], i) => {
    const y = sy + 56 + i * 26;
    out += `<text x="${sx + 16}" y="${y}" class="m grey" font-size="14">${k}</text><text x="${sx + sw - 16}" y="${y}" class="m red" font-size="14" text-anchor="end">${v}</text>`;
  });
  out += `<rect x="${sx + 16}" y="${sy + 128}" width="${sw - 32}" height="1.5" fill="${C.dim}"/>
<text x="${sx + 16}" y="${sy + 152}" class="m red" font-size="15">TOTAL</text><text x="${sx + sw - 16}" y="${sy + 152}" class="d red" font-size="17" text-anchor="end">$ 1.164.000</text></g>`;
  return out;
}

// Sistema solar en perspectiva con planetas orbitando
function illOrbits(ox, oy, w, h) {
  const cx = ox + w / 2;
  const cy = oy + h / 2 + 6;
  const orbits = [[42, 9, 3.5], [74, 14, 4.5], [108, 20, 6], [146, 30, 5], [190, 44, 4]];
  // animateMotion sobre la elipse: los planetas giran sin deformarse
  let out = '';
  orbits.forEach(([r, dur, pr], i) => {
    const ry = r * 0.36;
    const path = `M${cx + r} ${cy}A${r} ${ry} 0 1 1 ${cx - r} ${cy}A${r} ${ry} 0 1 1 ${cx + r} ${cy}`;
    out += `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${ry}" fill="none" stroke="${C.dim}" stroke-width="1.2" stroke-dasharray="${i % 2 ? '5 5' : 'none'}"/>
<circle r="${pr}" fill="${i === 2 ? C.amb : C.red}"><animateMotion dur="${dur}s" begin="-${i * 3}s" repeatCount="indefinite" path="${path}"/></circle>`;
  });
  out += `<circle cx="${cx}" cy="${cy}" r="14" fill="${C.red}"/><circle cx="${cx}" cy="${cy}" r="22" fill="none" stroke="${C.red}" stroke-width="1" opacity=".5"/>`;
  return out;
}

// Teléfono con balance + barras de gasto mensual
function illPhone(ox, oy, w, h) {
  const px = ox + 30;
  const py = oy + 14;
  let out = `<rect x="${px}" y="${py}" width="92" height="${h - 28}" rx="10" fill="none" stroke="${C.red}" stroke-width="2"/>
<rect x="${px + 34}" y="${py + 7}" width="24" height="4" fill="${C.red}"/>
<text x="${px + 10}" y="${py + 34}" class="m dim" font-size="10">BALANCE</text>
<text x="${px + 10}" y="${py + 52}" class="m red" font-size="13">$ 1.500.000</text>`;
  [0.8, 0.5, 0.65, 0.35].forEach((v, i) => {
    out += `<rect x="${px + 10}" y="${py + 66 + i * 18}" width="72" height="10" fill="none" stroke="${C.dim}"/><rect class="grow" style="animation-delay:${0.3 + i * 0.15}s" x="${px + 10}" y="${py + 66 + i * 18}" width="${72 * v}" height="10" fill="${C.red}"/>`;
  });
  // gráfico de barras mensual
  const bx = px + 130;
  const base = oy + h - 30;
  const vals = [0.55, 0.7, 0.45, 0.8, 0.6, 0.9, 0.5, 0.65, 0.75, 0.4, 0.85, 0.6];
  const bw = (ox + w - 30 - bx) / vals.length;
  vals.forEach((v, i) => {
    out += `<rect class="rise" style="animation-delay:${0.4 + i * 0.07}s" x="${bx + i * bw + 3}" y="${base - v * (h - 70)}" width="${bw - 6}" height="${v * (h - 70)}" fill="${i === vals.length - 1 ? C.amb : i % 3 === 0 ? C.red : C.dim}"/>`;
  });
  out += `<rect x="${bx}" y="${base}" width="${ox + w - 30 - bx}" height="1.5" fill="${C.red}"/>
<text x="${bx}" y="${oy + 26}" class="m dim" font-size="13">MONTHLY SPEND — COP</text>
<text x="${bx}" y="${base + 18}" class="m dim" font-size="11">JAN</text><text x="${ox + w - 30}" y="${base + 18}" class="m dim" font-size="11" text-anchor="end">DEC</text>`;
  return out;
}

const ILLUSTRATIONS = { bracket: illBracket, payroll: illPayroll, orbits: illOrbits, phone: illPhone };


// ───────────────────────── tarjetas de nivel ─────────────────────────

function bigCard(p) {
  const W = 1280;
  const H = 430;
  const statW = 170;
  let stats = '';
  p.stats.forEach(([v, l], i) => { stats += statBox(40 + i * (statW + 12), 206, statW, v, l, 0.3 + i * 0.12); });
  const panelX = 800;
  const body = `
<path d="M1 1H${W - 1}V${H - 30}L${W - 30} ${H - 1}H1Z" fill="none" stroke="${C.red}" stroke-width="2"/>
${titleBar(W, `LEVEL ${p.level}  //  ${p.kind}`, p.url ? `${p.url} →` : '')}
${statusLine(40, 74, p.status)}
<text x="40" y="146" class="d red" font-size="50">${esc(p.title)}</text>
<text x="40" y="180" class="m grey" font-size="17">${esc(p.tagline)}</text>
${stats}
<g class="fade" style="animation-delay:.8s">${chips(p.chips, 40, 318, 730)}</g>
${win(panelX, 52, W - panelX - 32, 346, p.panel)}
${ILLUSTRATIONS[p.ill](panelX, 76, W - panelX - 32, 322)}`;
  return svg({ w: W, h: H, title: `${p.title} — ${p.tagline}`, desc: p.alt, body, rain: 24 });
}

function smallCard(p) {
  const W = 630;
  const H = 496;
  const statW = 180;
  let stats = '';
  p.stats.forEach(([v, l], i) => { stats += statBox(24 + i * (statW + 12), 338, statW, v, l, 0.3 + i * 0.12); });
  const body = `
<path d="M1 1H${W - 1}V${H - 30}L${W - 30} ${H - 1}H1Z" fill="none" stroke="${C.red}" stroke-width="2"/>
${titleBar(W, `LEVEL ${p.level}  //  ${p.kind}`)}
${win(24, 48, W - 48, 196, p.panel)}
${ILLUSTRATIONS[p.ill](24, 72, W - 48, 172)}
${statusLine(24, 278, p.status)}
<text x="24" y="318" class="d red" font-size="30">${esc(p.title)}</text>
<text x="${W - 24}" y="278" class="m grey" font-size="13" text-anchor="end">${esc(p.tagline)}</text>
${stats}
<g class="fade" style="animation-delay:.8s">${chips(p.chips, 24, 444, W - 48, 13)}</g>`;
  return svg({ w: W, h: H, title: `${p.title} — ${p.tagline}`, desc: p.alt, body, rain: 12 });
}

// ───────────────────────── cabeceras de sección ─────────────────────────

function header(s) {
  const W = 1280;
  const H = 96;
  const tx = 92;
  const lineX = Math.round(tx + wideW(s.title, 34) + 24);
  const body = `
<rect x="0" y="16" width="70" height="64" fill="${C.red}"/>
<text x="35" y="60" class="d ink" font-size="28" text-anchor="middle">${s.n}</text>
<text x="${tx}" y="56" class="d red" font-size="34">${esc(s.title)}</text>
<text x="${tx}" y="80" class="m grey" font-size="15">${esc(s.sub)}</text>
<rect class="grow" style="animation-delay:.2s" x="${lineX}" y="44" width="${W - 54 - lineX}" height="2" fill="${C.dim}"/>
<rect x="${W - 42}" y="38" width="14" height="14" fill="none" stroke="${C.red}" stroke-width="2"/>
<rect x="${W - 20}" y="38" width="14" height="14" fill="${C.red}"/>`;
  return svg({ w: W, h: H, title: `${s.title} — ${s.sub}`, desc: s.sub, body, scan: false });
}

// ───────────────────────── diagnóstico (sobre mí) ─────────────────────────

function diagnostic() {
  const W = 1280;
  const H = 440;
  const tone = { info: C.amb, error: C.red, ok: C.cy };
  let log = '';
  DIAGNOSTIC.forEach(([t, line], i) => {
    log += `<text class="fade m" style="animation-delay:${(0.3 + i * 0.32).toFixed(2)}s" x="40" y="${88 + i * 32}" font-size="21" fill="${tone[t]}">${esc(line)}</text>`;
  });
  const end = 0.3 + DIAGNOSTIC.length * 0.32;
  // túnel: marcos que avanzan hacia el espectador desde el punto de fuga
  const vx = 1030;
  const vy = 236;
  let tunnel = '';
  for (let i = 0; i < 7; i++) {
    tunnel += `<rect class="tun" style="animation-delay:-${(i * 0.85).toFixed(2)}s" x="${vx - 210}" y="${vy - 170}" width="420" height="340" fill="none" stroke="${i % 3 ? C.dim : C.red}" stroke-width="2"/>`;
  }
  let rays = '';
  [[-210, -170], [210, -170], [210, 170], [-210, 170], [0, -170], [0, 170], [-210, 0], [210, 0]].forEach(([dx, dy]) => {
    rays += `<line x1="${vx}" y1="${vy}" x2="${vx + dx * 1.4}" y2="${vy + dy * 1.4}" stroke="${C.dim}" stroke-width="1.2"/>`;
  });
  const body = `
<g clip-path="url(#tclip)">${rays}${tunnel}<rect x="${vx - 3}" y="${vy - 3}" width="6" height="6" fill="${C.bone}" class="blink"/></g>
<clipPath id="tclip"><rect x="790" y="40" width="458" height="384"/></clipPath>
<rect x="790" y="40" width="458" height="384" fill="none" stroke="${C.red}" stroke-width="2"/>
<rect x="790" y="40" width="458" height="24" fill="${C.red}"/><text x="800" y="57" class="m ink" font-size="14">CORE.VIEW</text>
<rect x="1228" y="45" width="14" height="14" fill="${C.ink}"/>
<text x="40" y="46" class="m dim" font-size="15">// DIAGNOSTIC.LOG — OPERATOR JHD</text>
${log}
<rect class="blink" x="40" y="${88 + DIAGNOSTIC.length * 32 - 18}" width="12" height="22" fill="${C.cy}" style="animation-delay:${end.toFixed(2)}s"/>`;
  const css = `.tun{transform-box:view-box;transform-origin:${vx}px ${vy}px;animation:tun 6s linear infinite}
@keyframes tun{0%{transform:scale(.04);opacity:0}15%{opacity:1}100%{transform:scale(1.5);opacity:.9}}`;
  return svg({
    w: W, h: H, title: 'Diagnostic log — Julian Hinestroza Duarte',
    desc: DIAGNOSTIC.map((d) => d[1]).join(' / '), body, css, rain: 20,
  });
}

// ───────────────────────── arsenal (stack) ─────────────────────────

function arsenal() {
  const W = 1280;
  const cols = 3;
  const gap = 20;
  const ww = (W - 2 * 24 - (cols - 1) * gap) / cols;
  const wh = 236;
  const top = 92;
  const H = top + Math.ceil(ARSENAL.length / cols) * (wh + gap) + 4;
  let body = `<text x="24" y="40" class="m dim" font-size="15">// AMMO — LANGUAGES</text>`;
  let lx = 24;
  LANGUAGES.forEach((l, i) => {
    const w = monoW(l, 16) + 30;
    body += `<g class="fade" style="animation-delay:${0.1 + i * 0.08}s"><path d="M${lx} 52H${lx + w}V${70}L${lx + w - 8} 78H${lx}Z" fill="${C.red}"/><text x="${lx + 12}" y="70" class="m ink" font-size="16">${l}</text></g>`;
    lx += w + 10;
  });
  ARSENAL.forEach((slot, i) => {
    const x = 24 + (i % cols) * (ww + gap);
    const y = top + Math.floor(i / cols) * (wh + gap);
    body += `<g class="fade" style="animation-delay:${0.3 + i * 0.12}s">${win(x, y, ww, wh, `[${i + 1}] ${slot.name}`)}`;
    slot.items.forEach((item, j) => {
      const cx = x + 16 + (j % 2) * (ww / 2 - 8);
      const cy = y + 54 + Math.floor(j / 2) * 34;
      const primary = j === 0;
      body += primary
        ? `<rect x="${cx - 6}" y="${cy - 17}" width="${ww / 2 - 22}" height="24" fill="${C.deep}" stroke="${C.red}"/><text x="${cx}" y="${cy}" class="m red" font-size="15">${esc(item)}</text>`
        : `<rect x="${cx - 2}" y="${cy - 9}" width="6" height="6" fill="${C.dim}"/><text x="${cx + 12}" y="${cy}" class="m red" font-size="15">${esc(item)}</text>`;
    });
    body += `<text x="${x + ww - 14}" y="${y + wh - 12}" class="m dim" font-size="12" text-anchor="end">${slot.items.length} LOADED</text></g>`;
  });
  return svg({
    w: W, h: H, title: 'Arsenal — tech stack',
    desc: `Languages: ${LANGUAGES.join(', ')}. ${ARSENAL.map((s) => `${s.name}: ${s.items.join(', ')}`).join('. ')}.`,
    body, rain: 16,
  });
}

// ───────────────────────── style meter (habilidades) ─────────────────────────

function styleMeter() {
  const W = 1280;
  const RANKS = ['D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
  const top = 70;
  const rowH = 58;
  const H = top + SKILLS.length * rowH + 30;
  const barX = 330;
  const segW = 82;
  let body = `<text x="24" y="40" class="m dim" font-size="15">// STYLE METER — RANK PER DISCIPLINE</text>`;
  RANKS.forEach((r, i) => {
    body += `<text x="${barX + i * (segW + 6) + segW / 2}" y="40" class="m dim" font-size="14" text-anchor="middle">${r}</text>`;
  });
  SKILLS.forEach(([name, rank, note], i) => {
    const y = top + i * rowH;
    const lvl = RANKS.indexOf(rank) + 1;
    body += `<text x="24" y="${y + 26}" class="m red" font-size="18">${esc(name)}</text><text x="24" y="${y + 46}" class="m grey" font-size="12">${esc(note)}</text>`;
    RANKS.forEach((_, j) => {
      const x = barX + j * (segW + 6);
      body += `<path d="M${x + 8} ${y + 8}H${x + segW}L${x + segW - 8} ${y + 40}H${x}Z" fill="none" stroke="${C.dim}" stroke-width="1.2"/>`;
      if (j < lvl) {
        const col = j === lvl - 1 ? C.red : j >= 4 ? C.red : C.dim;
        body += `<path class="fade" style="animation-delay:${(0.2 + i * 0.12 + j * 0.07).toFixed(2)}s" d="M${x + 12} ${y + 12}H${x + segW - 4}L${x + segW - 10} ${y + 36}H${x + 6}Z" fill="${col}"/>`;
      }
    });
    const rx = barX + RANKS.length * (segW + 6) + 30;
    body += `<text class="fade d" style="animation-delay:${(0.3 + i * 0.12 + lvl * 0.07).toFixed(2)}s" x="${rx}" y="${y + 38}" font-size="34" fill="${lvl >= 5 ? C.red : C.amb}">${rank}</text>`;
  });
  return svg({
    w: W, h: H, title: 'Style meter — skills',
    desc: SKILLS.map(([n, r]) => `${n}: ${r}`).join(', '), body, rain: 14,
  });
}

// ───────────────────────── footer ─────────────────────────

function footer() {
  const W = 1280;
  const H = 150;
  const body = `
<rect x="0" y="0" width="${W}" height="2" fill="${C.red}"/>
<g>${barcode(24, 34, 200, 70)}</g>
<text x="24" y="126" class="m dim" font-size="11" letter-spacing="2">SERIAL Nº KLM-0013-CO</text>
<text x="260" y="70" class="d red" font-size="30">JULIAN HINESTROZA DUARTE</text>
<text x="260" y="100" class="m grey" font-size="16">Construyendo desde Pereira, Colombia · Building from Pereira, Colombia</text>
<text x="260" y="126" class="m dim" font-size="13">SOFTWARE ENGINEER // FULL-STACK DEVELOPER — 2026</text>
<text x="${W - 24}" y="70" class="m red" font-size="15" text-anchor="end">04.81N 75.69W</text>
<rect class="blink" x="${W - 36}" y="112" width="12" height="12" fill="${C.cy}"/>
<text x="${W - 46}" y="123" class="m cy" font-size="13" text-anchor="end">ONLINE</text>`;
  return svg({ w: W, h: H, title: 'Julian Hinestroza Duarte — Pereira, Colombia', desc: 'Construyendo desde Pereira, Colombia', body, rain: 18, scan: false });
}

// ───────────────────────── hero (plantilla en src/hero.svg) ─────────────────────────

function hero() {
  seed = 13;
  return readFileSync('src/hero.svg', 'utf8')
    .replace('{{RAIN}}', rainLines(70, 1280, 560))
    .replace('{{BARCODE}}', barcode(172, 458, 230, 58))
    .replace(/\{\{BAR:(\d+),(\d+),(\d+),(\d+)\}\}/, (_, x, y, f, h) => segBar(+x, +y, +f, +h))
    .replace('/*FONTS*/', fontCss);
}

// ───────────────────────── salida ─────────────────────────

mkdirSync('assets', { recursive: true });
const out = {
  'hero.svg': hero(),
  'diagnostic.svg': diagnostic(),
  'arsenal.svg': arsenal(),
  'style-meter.svg': styleMeter(),
  'footer.svg': footer(),
};
for (const s of SECTIONS) out[`h-${s.id}.svg`] = header(s);
for (const p of PROJECTS) out[`level-${p.id}.svg`] = p.size === 'big' ? bigCard(p) : smallCard(p);

for (const [name, content] of Object.entries(out)) {
  writeFileSync(`assets/${name}`, content);
  console.log(`  ${name.padEnd(24)} ${(content.length / 1024).toFixed(1)} KB`);
}

// preview.html: los SVG como <img>, igual que los renderiza GitHub
const gallery = Object.keys(out).map((n) => `<figure><img src="assets/${n}"><figcaption>${n}</figcaption></figure>`).join('');
writeFileSync('preview.html', `<!doctype html><html><head><meta charset="utf-8"><title>Assets preview</title>
<style>body{margin:0;background:#0d1117;color:#8b949e;font:13px monospace;padding:24px;display:grid;gap:18px;max-width:1000px}img{width:100%;display:block}figure{margin:0}</style></head><body>${gallery}</body></html>`);
console.log('ok → assets/, preview.html');
