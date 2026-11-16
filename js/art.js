// Drawings (SVG) in comic-book style: thick black outlines, bold colors.
// heroes, the hero base, the robot, Dr. Balagan (the villain), "BOOM!" bursts.

const INK = "#111";

// A thick limb with a black outline: draws the outline first, then the color on top.
function limb(d, color, w = 20) {
  return `<path d="${d}" stroke="${INK}" stroke-width="${w + 8}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="${d}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
}


// Every drawing needs its own gradient names, because several heroes can be on one screen.
let artId = 0;

// Colors for each power: fire (Bar) and lightning (Yarden).
const POWER_FX = {
  fire: { glow: ["#fde047", "#f97316", "#dc2626"], core: ["#ffffff", "#fde047", "#f97316", "#dc2626"] },
  bolt: { glow: ["#e0f2fe", "#38bdf8", "#1d4ed8"], core: ["#ffffff", "#e0f2fe", "#38bdf8", "#1d4ed8"] },
  smash: { glow: ["#fef9c3", "#a3e635", "#15803d"], core: ["#ffffff", "#fef08a", "#a3e635", "#15803d"] },
  ice: { glow: ["#f0f9ff", "#7dd3fc", "#0369a1"], core: ["#ffffff", "#e0f2fe", "#7dd3fc", "#0284c7"] },
  nature: { glow: ["#fefce8", "#a3e635", "#3f6212"], core: ["#ffffff", "#d9f99d", "#84cc16", "#3f6212"] },
  water: { glow: ["#ecfeff", "#22d3ee", "#0e7490"], core: ["#ffffff", "#a5f3fc", "#22d3ee", "#0369a1"] },
  wind: { glow: ["#f8fafc", "#cbd5e1", "#64748b"], core: ["#ffffff", "#f1f5f9", "#cbd5e1", "#64748b"] },
  magic: { glow: ["#fdf4ff", "#e879f9", "#7e22ce"], core: ["#ffffff", "#f5d0fe", "#e879f9", "#7e22ce"] },
};
// The main effect color of each power (for boots, shields, sparkles...).
const fxColor = (h) => (POWER_FX[h.power] || POWER_FX.fire).glow[1];
// Simple shapes used as the chest emblem of the newer powers.
const EMBLEMS = {
  ice: `<path d="M0 -14 V14 M-12 -7 L12 7 M-12 7 L12 -7 M-4 -11 L0 -7 L4 -11 M-4 11 L0 7 L4 11" stroke="#0369a1" stroke-width="3" stroke-linecap="round" fill="none"/>`,
  nature: `<path d="M-10 10 C-12 -6 0 -14 12 -12 C12 2 4 12 -10 10Z M-10 10 L6 -6" fill="#65a30d" stroke="#111" stroke-width="2.2"/>`,
  water: `<path d="M0 -14 C8 -2 11 3 11 7 C11 13 6 15 0 15 C-6 15 -11 13 -11 7 C-11 3 -8 -2 0 -14Z" fill="#0ea5e9" stroke="#111" stroke-width="2.2"/><path d="M-4 6 q0 4 4 5" stroke="#fff" stroke-width="2" fill="none"/>`,
  wind: `<path d="M-12 -6 H6 Q12 -6 12 -11 Q12 -15 7 -15 M-12 2 H10 Q16 2 16 7 Q16 12 10 12 M-12 9 H0" stroke="#334155" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  magic: `<path d="M0 -14 L4 -4 L14 -4 L6 3 L9 13 L0 7 L-9 13 L-6 3 L-14 -4 L-4 -4Z" fill="#a855f7" stroke="#111" stroke-width="2.2" stroke-linejoin="round"/>`,
};

function heroDefs(h, u) {
  const fx = POWER_FX[h.power];
  return `<defs>
    <linearGradient id="${u}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${h.light}"/><stop offset=".55" stop-color="${h.suit}"/><stop offset="1" stop-color="${h.dark}"/></linearGradient>
    <linearGradient id="${u}c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${h.cape}"/><stop offset="1" stop-color="#000"/></linearGradient>
    <radialGradient id="${u}k" cx=".42" cy=".36" r=".72"><stop offset="0" stop-color="#ffe2c6"/><stop offset="1" stop-color="#e9a679"/></radialGradient>
    <radialGradient id="${u}g" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${fx.glow[0]}" stop-opacity=".95"/><stop offset=".5" stop-color="${fx.glow[1]}" stop-opacity=".55"/><stop offset="1" stop-color="${fx.glow[2]}" stop-opacity="0"/></radialGradient>
    <radialGradient id="${u}b" cx=".45" cy=".45" r=".55"><stop offset="0" stop-color="${fx.core[0]}"/><stop offset=".35" stop-color="${fx.core[1]}"/><stop offset=".7" stop-color="${fx.core[2]}"/><stop offset="1" stop-color="${fx.core[3]}"/></radialGradient>
    <linearGradient id="${u}f" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fde047"/><stop offset=".45" stop-color="#f97316"/><stop offset="1" stop-color="#dc2626"/></linearGradient>
  </defs>`;
}

// The emblem in the middle of the chest: a flame or a lightning bolt.
function emblemIcon(h, cx, cy, s = 1) {
  const star = Array.from({ length: 16 }, (_, i) => { const r = i % 2 ? 6 : 14, a = (Math.PI * i) / 8; return `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`; }).join(" ");
  const icon = EMBLEMS[h.power] ? EMBLEMS[h.power] : h.power === "smash"
    ? `<polygon points="${star}" fill="${h.suit}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><circle r="3.5" fill="#fde047"/>`
    : h.power === "fire"
    ? `<path d="M0 -14 C8 -6 12 0 8 8 C6 12 2 14 0 14 C-4 14 -9 11 -9 5 C-9 0 -5 -3 -4 -8 C-2 -4 -1 -2 1 -1 C3 -5 2 -10 0 -14Z" fill="${h.suit}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
       <path d="M0 2 C3 5 3 9 0 10 C-3 9 -3 6 0 2Z" fill="#fde047"/>`
    : `<path d="M3 -15 L-8 2 L-1 2 L-4 15 L9 -3 L2 -3 L6 -15Z" fill="${h.suit}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>`;
  return `<g transform="translate(${cx} ${cy}) scale(${s})">
    <circle r="17" fill="${h.accent}" stroke="${INK}" stroke-width="4"/><circle r="12" fill="none" stroke="#fff8" stroke-width="2"/>${icon}</g>`;
}

function heroHead(h, u, cx = 100, cy = 64, night = false) {
  const x = (d) => cx + d, y = (d) => cy + d;
  return `
    <g stroke="${INK}" stroke-width="4" stroke-linejoin="round">
      <circle cx="${x(-30)}" cy="${y(6)}" r="7" fill="url(#${u}k)"/><circle cx="${x(30)}" cy="${y(6)}" r="7" fill="url(#${u}k)"/>
      <ellipse cx="${cx}" cy="${cy}" rx="29" ry="31" fill="url(#${u}k)"/>
      <path d="M${x(-31)} ${y(0)} Q${x(-34)} ${y(-30)} ${x(-16)} ${y(-38)} L${x(-14)} ${y(-50)} L${x(-2)} ${y(-40)} L${x(6)} ${y(-54)} L${x(14)} ${y(-38)} L${x(26)} ${y(-46)} L${x(26)} ${y(-30)} Q${x(36)} ${y(-20)} ${x(31)} ${y(0)} Q${x(22)} ${y(-18)} ${x(4)} ${y(-18)} L${x(-2)} ${y(-26)} L${x(-8)} ${y(-17)} Q${x(-22)} ${y(-16)} ${x(-31)} ${y(0)}Z" fill="${h.hair || "#3b2416"}"/>
    </g>
    <path d="M${x(-20)} ${y(-26)} Q${x(-14)} ${y(-36)} ${x(-4)} ${y(-36)}" stroke="#8a5a3b" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M${x(-34)} ${y(-6)} Q${x(-18)} ${y(-14)} ${x(0)} ${y(-6)} Q${x(18)} ${y(-14)} ${x(34)} ${y(-6)} L${x(38)} ${y(-12)} L${x(34)} ${y(8)} Q${x(18)} ${y(16)} ${x(0)} ${y(8)} Q${x(-18)} ${y(16)} ${x(-34)} ${y(8)} L${x(-38)} ${y(-12)}Z"
      fill="${h.dark}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M${x(-28)} ${y(-6)} Q${x(-18)} ${y(-10)} ${x(-8)} ${y(-6)}" stroke="#ffffff66" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M${x(-22)} ${y(1)} Q${x(-14)} ${y(-6)} ${x(-5)} ${y(1)} Q${x(-14)} ${y(7)} ${x(-22)} ${y(1)}Z" fill="#fff" stroke="${INK}" stroke-width="2.5"/>
    <path d="M${x(22)} ${y(1)} Q${x(14)} ${y(-6)} ${x(5)} ${y(1)} Q${x(14)} ${y(7)} ${x(22)} ${y(1)}Z" fill="#fff" stroke="${INK}" stroke-width="2.5"/>
    <circle cx="${x(-12)}" cy="${y(1.5)}" r="3.6" fill="#2b1a10"/><circle cx="${x(12)}" cy="${y(1.5)}" r="3.6" fill="#2b1a10"/>
    <circle cx="${x(-11)}" cy="${y(0)}" r="1.3" fill="#fff"/><circle cx="${x(13)}" cy="${y(0)}" r="1.3" fill="#fff"/>
    ${night ? `<path d="M${x(-24)} ${y(1)} Q${x(-14)} ${y(-9)} ${x(-3)} ${y(1)} Q${x(-14)} ${y(10)} ${x(-24)} ${y(1)}Z M${x(24)} ${y(1)} Q${x(14)} ${y(-9)} ${x(3)} ${y(1)} Q${x(14)} ${y(10)} ${x(24)} ${y(1)}Z" fill="none" stroke="#fde047" stroke-width="2.5"/>` : ""}
    <path d="M${x(-1)} ${y(10)} q3 4 0 7" stroke="#b9714a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M${x(-11)} ${y(19)} Q${x(0)} ${y(28)} ${x(12)} ${y(18)} Q${x(1)} ${y(22)} ${x(-11)} ${y(19)}Z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="${x(-20)}" cy="${y(16)}" r="4.5" fill="#f87171" opacity=".35"/><circle cx="${x(20)}" cy="${y(16)}" r="4.5" fill="#f87171" opacity=".35"/>`;
}

// The power around the hero: flames behind Bar, lightning around Yarden.
function heroAura(h, u) {
  const glow = `<ellipse cx="100" cy="128" rx="96" ry="104" fill="url(#${u}g)" opacity=".7"/>`;
  if (h.power === "ice") return `<g class="aura aura-ice">${glow}${[[24, 60], [176, 90], [30, 170], [172, 190], [100, 18]].map(([x, y], i) => `<g transform="translate(${x} ${y}) rotate(${i * 20})"><path d="M0 -14 V14 M-12 -7 L12 7 M-12 7 L12 -7" stroke="#e0f2fe" stroke-width="5" stroke-linecap="round"/><path d="M0 -14 V14 M-12 -7 L12 7 M-12 7 L12 -7" stroke="#0369a1" stroke-width="2" stroke-linecap="round"/></g>`).join("")}</g>`;
  if (h.power === "nature") return `<g class="aura aura-nature">${glow}<path d="M30 220 C10 160 40 120 20 70 M170 220 C190 160 160 120 180 70" stroke="#3f6212" stroke-width="6" fill="none"/>${[[22, 80], [34, 140], [178, 90], [168, 150], [20, 190], [180, 196]].map(([x, y], i) => `<path transform="translate(${x} ${y}) rotate(${i * 50})" d="M0 0 C-4 -14 6 -22 16 -20 C16 -8 10 0 0 0Z" fill="#84cc16" stroke="${INK}" stroke-width="2.5"/>`).join("")}</g>`;
  if (h.power === "water") return `<g class="aura aura-water">${glow}<path d="M6 210 Q30 180 54 210 T102 210 T150 210 T198 210" stroke="#0ea5e9" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M6 210 Q30 180 54 210 T102 210 T150 210 T198 210" stroke="#e0f2fe" stroke-width="3" fill="none"/>${[[24, 80], [176, 110], [30, 150]].map(([x, y]) => `<path transform="translate(${x} ${y})" d="M0 -12 C6 -3 8 1 8 4 C8 9 4 11 0 11 C-4 11 -8 9 -8 4 C-8 1 -6 -3 0 -12Z" fill="#38bdf8" stroke="${INK}" stroke-width="2.5"/>`).join("")}</g>`;
  if (h.power === "wind") return `<g class="aura aura-wind">${glow}<g fill="none" stroke="#f8fafc" stroke-width="7" stroke-linecap="round"><path d="M10 80 H60 Q80 80 80 64 Q80 50 64 50"/><path d="M130 150 H186 Q200 150 200 136"/><path d="M6 190 H70 Q90 190 90 206"/></g><g fill="none" stroke="#64748b" stroke-width="3" stroke-linecap="round"><path d="M10 80 H60 Q80 80 80 64 Q80 50 64 50"/><path d="M130 150 H186 Q200 150 200 136"/><path d="M6 190 H70 Q90 190 90 206"/></g></g>`;
  if (h.power === "magic") return `<g class="aura aura-magic">${glow}${[[20, 60, 12], [178, 80, 10], [26, 170, 9], [176, 186, 12], [100, 14, 8]].map(([x, y, r]) => `<path transform="translate(${x} ${y})" d="M0 ${-r} L${r * .3} ${-r * .3} L${r} 0 L${r * .3} ${r * .3} L0 ${r} L${-r * .3} ${r * .3} L${-r} 0 L${-r * .3} ${-r * .3}Z" fill="#f5d0fe" stroke="${INK}" stroke-width="2"/>`).join("")}</g>`;
  if (h.power === "smash") {
    const burst = Array.from({ length: 24 }, (_, i) => { const r = i % 2 ? 70 : 104, a = (Math.PI * i) / 12; return `${(100 + r * Math.cos(a)).toFixed(0)},${(120 + r * Math.sin(a) * 1.05).toFixed(0)}`; }).join(" ");
    return `<g class="aura aura-smash">
      <ellipse cx="100" cy="125" rx="96" ry="104" fill="url(#${u}g)" opacity=".6"/>
      <polygon points="${burst}" fill="#d9f99d" stroke="${INK}" stroke-width="3" stroke-linejoin="round" opacity=".85"/>
      <ellipse cx="100" cy="226" rx="88" ry="14" fill="none" stroke="#a3e635" stroke-width="5" class="shock"/>
      <ellipse cx="100" cy="226" rx="60" ry="9" fill="none" stroke="#fde047" stroke-width="4" class="shock s2"/>
      <path d="M40 228 l14 -10 l6 8 l12 -12 M160 228 l-12 -10 l-8 8 l-12 -10" stroke="${INK}" stroke-width="3" fill="none" stroke-linejoin="round"/>
      <g fill="#a8a29e" stroke="${INK}" stroke-width="2.5" class="rocks"><path d="M22 196 l10 -8 l10 6 l-4 10z"/><path d="M168 186 l12 -6 l6 10 l-12 4z"/><path d="M36 150 l8 -6 l6 6 l-6 6z"/></g>
    </g>`;
  }
  if (h.power === "fire") {
    return `<g class="aura aura-fire">
      <ellipse cx="100" cy="130" rx="92" ry="100" fill="url(#${u}g)" opacity=".55"/>
      <g transform="translate(100 236) scale(1.28 1.08) translate(-100 -236)">
      <path d="M100 236 C26 234 14 160 46 108 C48 136 60 148 70 142 C56 108 72 58 98 16 C106 58 140 80 132 138 C142 144 152 130 152 108 C188 158 176 234 100 236Z"
        fill="url(#${u}f)" stroke="${INK}" stroke-width="3" stroke-linejoin="round" opacity=".95"/>
      <path d="M100 232 C56 230 46 186 64 152 C70 170 80 174 86 168 C82 140 92 110 104 88 C110 120 128 136 122 168 C130 172 138 164 140 150 C156 186 144 230 100 232Z" fill="#fde047" opacity=".85"/>
      </g>
    </g>`;
  }
  const bolt = (x, y, s, r) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">
      <path d="M0 0 L14 18 L4 22 L20 46 L-2 24 L8 20 Z" fill="#fde047" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></g>`;
  return `<g class="aura aura-bolt">
      <ellipse cx="100" cy="128" rx="96" ry="104" fill="url(#${u}g)" opacity=".7"/>
      <path d="M20 90 l18 10 l-8 8 l20 12 M180 150 l-18 8 l8 8 l-22 10 M30 190 l16 -6 l-2 10 l18 -8" stroke="#e0f2fe" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      ${bolt(22, 40, 0.9, -15)}${bolt(168, 92, 0.8, 20)}${bolt(14, 150, 0.7, 10)}
    </g>`;
}

// What the raised hand holds: a fireball or a lightning bolt.
function handPower(h, u) {
  const orb = `<circle cx="156" cy="30" r="30" fill="url(#${u}g)"/>`;
  if (h.power === "ice") return `<g class="hand-power">${orb}<path d="M156 0 L170 22 L162 44 L150 44 L142 22Z" fill="#e0f2fe" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M156 6 L156 38" stroke="#7dd3fc" stroke-width="3"/></g>`;
  if (h.power === "nature") return `<g class="hand-power">${orb}${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="156" cy="18" rx="7" ry="13" fill="#f472b6" stroke="${INK}" stroke-width="2.5" transform="rotate(${a} 156 30)"/>`).join("")}<circle cx="156" cy="30" r="7" fill="#facc15" stroke="${INK}" stroke-width="2.5"/></g>`;
  if (h.power === "water") return `<g class="hand-power">${orb}<circle cx="156" cy="26" r="18" fill="url(#${u}b)" stroke="${INK}" stroke-width="3.5"/><path d="M146 20 q6 -8 14 -6" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;
  if (h.power === "wind") return `<g class="hand-power">${orb}<path d="M140 4 H172 M144 14 H168 M148 24 H164 M151 34 H161 M154 42 H158" stroke="#64748b" stroke-width="5" stroke-linecap="round"/></g>`;
  if (h.power === "magic") return `<g class="hand-power">${orb}<path d="M156 -4 L163 16 L184 16 L167 28 L174 48 L156 36 L138 48 L145 28 L128 16 L149 16Z" fill="#fde047" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/></g>`;
  if (h.power === "smash") {
    const pts = Array.from({ length: 20 }, (_, i) => { const r = i % 2 ? 16 : 34, a = (Math.PI * i) / 10; return `${(156 + r * Math.cos(a)).toFixed(0)},${(40 + r * Math.sin(a)).toFixed(0)}`; }).join(" ");
    return `<g class="hand-power">
      <circle cx="156" cy="40" r="34" fill="url(#${u}g)"/>
      <polygon points="${pts}" fill="#fde047" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M128 12 l-12 -10 M186 14 l12 -10 M190 50 l14 4" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
    </g>`;
  }
  if (h.power === "fire") {
    return `<g class="hand-power">
      <circle cx="158" cy="26" r="30" fill="url(#${u}g)"/>
      <path d="M158 2 C168 12 176 20 172 32 C170 40 164 44 158 44 C150 44 143 39 143 30 C143 22 149 18 150 10 C153 16 155 18 157 19 C160 13 160 8 158 2Z"
        fill="url(#${u}f)" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M158 22 C163 28 164 34 158 38 C152 35 152 28 158 22Z" fill="#fff7c2"/>
    </g>`;
  }
  return `<g class="hand-power">
      <circle cx="158" cy="26" r="30" fill="url(#${u}g)"/>
      <path d="M163 -2 L146 26 L157 26 L150 52 L174 18 L162 18 L170 -2Z" fill="#fde047" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M163 4 L154 22" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
    </g>`;
}

function heroSVG(hero, size = 160, powers = []) {
  const h = HEROES[hero];
  const u = "a" + ++artId;
  const has = (id) => powers.includes(id);
  const fly = has("fly");
  const boot = has("speed") ? fxColor(h) : h.dark;
  const capeOuter = fly
    ? "M66 98 C24 130 -2 180 -8 226 Q50 214 100 232 Q150 214 208 226 C202 180 176 130 134 98Z"
    : "M66 98 C40 140 26 196 20 230 Q60 220 100 232 Q140 220 180 230 C174 196 160 140 134 98Z";
  const capeInner = fly
    ? "M72 104 C34 136 12 180 4 216 Q52 206 100 222 Q148 206 196 216 C188 180 166 136 128 104Z"
    : "M72 104 C48 144 36 194 32 220 Q66 212 100 222 Q134 212 168 220 C164 194 152 144 128 104Z";
  return `
  <svg viewBox="0 0 200 240" width="${size}" height="${size * 1.2}" class="hero-svg hero-${h.power}" aria-label="${h.title}">
    ${heroDefs(h, u)}
    ${heroAura(h, u)}
    ${has("shield") ? `<circle cx="100" cy="126" r="98" fill="${fxColor(h)}" opacity=".18" stroke="${fxColor(h)}" stroke-width="5" stroke-dasharray="12 8"/>` : ""}
    ${has("magic") ? `<g fill="${POWER_FX[h.power] ? POWER_FX[h.power].core[1] : "#fff"}" stroke="${INK}" stroke-width="2">${[[14, 70], [184, 150], [22, 196], [180, 40]].map(([x, y]) => `<path d="M${x} ${y - 9} L${x + 3} ${y - 3} L${x + 9} ${y} L${x + 3} ${y + 3} L${x} ${y + 9} L${x - 3} ${y + 3} L${x - 9} ${y} L${x - 3} ${y - 3}Z"/>`).join("")}</g>` : ""}
    <ellipse cx="100" cy="228" rx="46" ry="7" fill="#0005"/>
    <!-- cape: colored lining at the edge, dark cape inside -->
    <path d="${capeOuter}" fill="${h.lining}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="${capeInner}" fill="url(#${u}c)"/>
    <path d="M84 112 C68 150 60 190 58 214 M116 112 C130 150 138 190 142 214" stroke="#ffffff1f" stroke-width="5" fill="none"/>
    <!-- legs and boots -->
    <path d="M77 150 L99 150 L97 198 L80 198Z" fill="url(#${u}s)" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M101 150 L123 150 L121 198 L103 198Z" fill="url(#${u}s)" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M77 190 h25 l1 22 q0 10 -10 10 h-24 q-9 0 -6 -9 l12 -6z" fill="${boot}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M99 190 h25 l6 17 q3 9 -6 9 l0 6 h-18 q-8 0 -8 -10z" fill="${boot}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M77 188 h26 v8 h-26z M98 188 h26 v8 h-26z" fill="${h.accent}" stroke="${INK}" stroke-width="3"/>
    ${has("speed") ? `<path d="M50 200 h-24 M54 210 h-34 M56 220 h-20" stroke="${fxColor(h)}" stroke-width="5" stroke-linecap="round"/>` : ""}
    <!-- arm on the hip -->
    ${limb("M74 106 L54 130 L72 148", h.suit, 17)}
    <path d="M70 110 L56 128" stroke="${h.light}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="72" cy="148" r="10" fill="${h.dark}" stroke="${INK}" stroke-width="4"/>
    <!-- body: wide shoulders, slim waist -->
    <path d="M62 102 Q100 86 138 102 L126 150 Q100 158 74 150Z" fill="url(#${u}s)" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M86 96 Q100 104 114 96" stroke="${INK}" stroke-width="3" fill="none"/>
    <path d="M70 106 Q76 100 84 100" stroke="#ffffff88" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M90 140 h20 M92 132 h16" stroke="${h.dark}" stroke-width="2.5" opacity=".5"/>
    <!-- belt -->
    <path d="M73 144 Q100 152 127 144 L126 154 Q100 162 74 154Z" fill="${h.accent}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
    <rect x="93" y="145" width="14" height="13" rx="3" fill="${h.dark}" stroke="${INK}" stroke-width="3"/>
    ${emblemIcon(h, 100, 119)}
    <!-- arm with raised fist and the power -->
    ${limb("M128 106 L148 82 L154 52", h.suit, 17)}
    <path d="M132 104 L146 86" stroke="${h.light}" stroke-width="4" stroke-linecap="round"/>
    ${handPower(h, u)}
    <circle cx="155" cy="46" r="12" fill="${h.dark}" stroke="${INK}" stroke-width="4"/>
    <path d="M147 42 h14 M147 48 h14" stroke="${INK}" stroke-width="2"/>
    ${has("jump") ? `<g stroke="${INK}" stroke-width="3" fill="#fff"><circle cx="60" cy="232" r="6"/><circle cx="140" cy="232" r="6"/><circle cx="48" cy="226" r="4"/></g>` : ""}
    ${heroHead(h, u, 100, 62, has("night"))}
  </svg>`;
}

// Just the hero's face in a round badge (used next to speech bubbles and on the map).
function heroFaceSVG(hero, size = 70) {
  const h = HEROES[hero];
  const u = "a" + ++artId;
  return `<svg viewBox="40 12 120 120" width="${size}" height="${size}" class="face-svg">
    ${heroDefs(h, u)}
    <clipPath id="${u}r"><circle cx="100" cy="72" r="56"/></clipPath>
    <circle cx="100" cy="72" r="56" fill="url(#${u}s)"/>
    <g clip-path="url(#${u}r)">
      <circle cx="100" cy="72" r="50" fill="url(#${u}g)" opacity=".7"/>
      <path d="M44 132 Q50 112 72 108 Q100 118 128 108 Q150 112 156 132Z" fill="${h.dark}" stroke="${INK}" stroke-width="4"/>
      <g transform="translate(100 80) scale(.92) translate(-100 -80)">${heroHead(h, u, 100, 80)}</g>
    </g>
    <circle cx="100" cy="72" r="56" fill="none" stroke="${INK}" stroke-width="5"/>
  </svg>`;
}


// The hero base: a big scene. Earned parts are drawn in full color; parts still to come
// are shown as a dotted outline, so the kids can see what they're building towards.
function baseSVG(parts, hero, powers = []) {
  const h = HEROES[hero];
  const u = "b" + ++artId;
  const has = (id) => parts.includes(id);
  const fire = h.power === "fire";
  // Built parts in full color; only the next part to earn shows as a dotted outline.
  const nextPart = (BASE_PARTS.find((b) => !parts.includes(b.id)) || {}).id;
  const part = (id, inner) => (has(id) ? `<g class="base-part built">${inner}</g>` : id === nextPart ? `<g class="base-part ghost-part next-part">${inner}</g>` : "");
  const S = `stroke="${INK}" stroke-width="4" stroke-linejoin="round"`;
  const P = h.power;
  const day = ["smash", "ice", "nature", "water", "wind"].includes(P);
  const sunny = fire || day;
  const SKIES = {
    fire: ["#4c1d95", "#db2777", "#fb923c", "#fde68a"], bolt: ["#0b1033", "#1e3a8a", "#3b82f6", "#a5f3fc"],
    smash: ["#0284c7", "#38bdf8", "#7dd3fc", "#ecfccb"], ice: ["#0c4a6e", "#38bdf8", "#bae6fd", "#f0f9ff"],
    nature: ["#0369a1", "#38bdf8", "#bef264", "#fefce8"], water: ["#0c4a6e", "#0284c7", "#67e8f9", "#ecfeff"],
    wind: ["#475569", "#94a3b8", "#cbd5e1", "#f8fafc"], magic: ["#2e1065", "#7e22ce", "#c084fc", "#fae8ff"],
  };
  const sky = SKIES[P] || SKIES.bolt;
  const hill = P === "ice" ? ["#f8fafc", "#bae6fd"] : P === "fire" ? ["#a3e635", "#4d7c0f"] : ["#4ade80", "#15803d"];
  const fx = POWER_FX[P] || POWER_FX.fire;
  return `
  <svg viewBox="0 0 900 560" class="base-svg" aria-label="בסיס הגיבורים">
    <defs>
      <linearGradient id="${u}sky" x1="0" y1="0" x2="0" y2="1">${sky.map((c, i) => `<stop offset="${i / 3}" stop-color="${c}"/>`).join("")}</linearGradient>
      <linearGradient id="${u}hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hill[0]}"/><stop offset="1" stop-color="${hill[1]}"/></linearGradient>
      <radialGradient id="${u}fxglow"><stop offset="0" stop-color="${fx.glow[0]}" stop-opacity=".95"/><stop offset=".5" stop-color="${fx.glow[1]}" stop-opacity=".6"/><stop offset="1" stop-color="${fx.glow[1]}" stop-opacity="0"/></radialGradient>
      <linearGradient id="${u}mtn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${day ? "#65a30d" : fire ? "#7c3aed" : "#1e40af"}"/><stop offset="1" stop-color="${day ? "#14532d" : fire ? "#be185d" : "#0f172a"}"/></linearGradient>
      <linearGradient id="${u}wall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${h.light}"/><stop offset=".55" stop-color="${h.suit}"/><stop offset="1" stop-color="${h.dark}"/></linearGradient>
      <linearGradient id="${u}dome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".25" stop-color="${h.light}"/><stop offset="1" stop-color="${h.dark}"/></linearGradient>
      <linearGradient id="${u}stoneTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2e8f0"/><stop offset="1" stop-color="#94a3b8"/></linearGradient>
      <linearGradient id="${u}stoneFront" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#64748b"/><stop offset="1" stop-color="#334155"/></linearGradient>
      <linearGradient id="${u}win" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fef9c3"/><stop offset="1" stop-color="#f59e0b"/></linearGradient>
      <linearGradient id="${u}gold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a16207"/><stop offset=".5" stop-color="#fde047"/><stop offset="1" stop-color="#a16207"/></linearGradient>
      <linearGradient id="${u}metal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#475569"/><stop offset=".45" stop-color="#e2e8f0"/><stop offset="1" stop-color="#475569"/></linearGradient>
      <radialGradient id="${u}glow"><stop offset="0" stop-color="#fef08a" stop-opacity=".95"/><stop offset="1" stop-color="#fef08a" stop-opacity="0"/></radialGradient>
      <radialGradient id="${u}sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="${sunny ? "#fde68a" : "#e0f2fe"}"/><stop offset="1" stop-color="${sunny ? "#fde68a" : "#e0f2fe"}" stop-opacity="0"/></radialGradient>
      <radialGradient id="${u}flame" cx=".5" cy=".2" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".3" stop-color="#fde047"/><stop offset=".7" stop-color="#f97316"/><stop offset="1" stop-color="#dc2626"/></radialGradient>
    </defs>

    <!-- sky, sun or moon, stars -->
    <rect width="900" height="560" fill="url(#${u}sky)"/>
    <circle cx="${sunny ? 640 : 700}" cy="${day ? 110 : fire ? 200 : 90}" r="90" fill="url(#${u}sun)"/>
    <circle cx="${sunny ? 640 : 700}" cy="${day ? 110 : fire ? 200 : 90}" r="36" fill="${sunny ? "#fef3c7" : "#f8fafc"}" ${S}/>
    ${sunny ? "" : `<circle cx="714" cy="80" r="30" fill="#0b1033"/>`}
    ${sunny ? "" : `<g fill="#fff">${Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 137) % 900}" cy="${(i * 61) % 230}" r="${i % 4 ? 1.6 : 2.8}" class="${i % 5 ? "" : "twinkle"}"/>`).join("")}</g>`}
    <g fill="#ffffffcc" stroke="${INK}" stroke-width="3">
      <path d="M90 120 q-6 -26 22 -26 q8 -22 34 -12 q22 -16 40 6 q28 0 22 26 Z"/>
      <path d="M460 70 q-6 -20 18 -20 q6 -18 28 -10 q18 -12 32 4 q22 0 18 20 Z" opacity=".8"/>
    </g>

    <!-- mountains and city far away -->
    <path d="M0 330 L120 210 L210 290 L330 170 L450 280 L560 190 L690 300 L800 200 L900 280 V420 H0Z" fill="url(#${u}mtn)" opacity=".85"/>
    <path d="M330 170 L300 200 L330 192 L360 205Z M800 200 L775 225 L800 218 L825 228Z" fill="#fff" opacity=".8"/>
    <g fill="${day ? "#334155" : fire ? "#3b0764" : "#020617"}" opacity=".8">
      ${[[40, 300, 40, 110], [86, 270, 34, 140], [126, 320, 46, 90], [760, 290, 40, 120], [806, 260, 36, 150], [846, 310, 50, 100]].map(([x, y, w, hh]) => `<rect x="${x}" y="${y}" width="${w}" height="${hh}"/>`).join("")}
    </g>
    <g fill="#fde68a" opacity=".9">${[[50, 320], [62, 340], [96, 290], [96, 320], [140, 340], [770, 310], [818, 280], [818, 320], [860, 330], [770, 340]].map(([x, y]) => `<rect x="${x}" y="${y}" width="8" height="10"/>`).join("")}</g>

    <!-- this hero's own scenery -->
    ${{
      fire: `<path d="M500 420 L610 210 L690 210 L800 420Z" fill="#78350f" ${S}/><path d="M610 210 L690 210 L676 236 L624 236Z" fill="#f97316" ${S}/>
        <path d="M640 230 Q630 290 650 330 Q660 370 640 420" stroke="#f97316" stroke-width="10" fill="none"/><circle cx="650" cy="200" r="40" fill="url(#${u}fxglow)"/>
        <g fill="#cbd5e1" stroke="${INK}" stroke-width="2.5" class="smoke"><circle cx="660" cy="170" r="14"/><circle cx="680" cy="140" r="18"/></g>`,
      bolt: `<g fill="#475569" stroke="${INK}" stroke-width="3"><path d="M140 110 q-10 -30 30 -32 q14 -30 50 -16 q30 -18 52 10 q36 0 28 34 Z"/></g>
        <path d="M210 112 L190 160 L210 160 L188 210 L236 148 L214 148 L232 112Z" fill="#fde047" stroke="${INK}" stroke-width="3" class="twinkle"/>`,
      smash: `<g fill="#a8a29e" stroke="${INK}" stroke-width="4"><path d="M30 420 l20 -50 l50 -10 l30 40 l-10 30Z"/><path d="M820 430 l10 -40 l40 -12 l24 30 v30Z"/></g>`,
      ice: `<g fill="#fff" opacity=".9">${Array.from({ length: 24 }, (_, i) => `<circle cx="${(i * 97) % 900}" cy="${(i * 53) % 380}" r="${i % 3 ? 3 : 5}" class="twinkle"/>`).join("")}</g>`,
      nature: `<g ${S}><rect x="54" y="300" width="26" height="130" fill="#78350f"/><circle cx="66" cy="280" r="70" fill="#16a34a"/><circle cx="30" cy="300" r="40" fill="#22c55e"/><circle cx="110" cy="300" r="40" fill="#22c55e"/></g>`,
      water: `<path d="M0 392 H900 V430 H0Z" fill="#0ea5e9"/><path d="M0 400 q20 -10 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" stroke="#e0f2fe" stroke-width="4" fill="none"/>`,
      wind: `<g ${S}><path d="M60 430 L74 280 H90 L104 430Z" fill="#e2e8f0"/><g class="spin-slow" style="transform-origin:82px 280px">${[0, 90, 180, 270].map((a) => `<path d="M82 280 L82 200 L100 210 L90 280Z" fill="#94a3b8" transform="rotate(${a} 82 280)"/>`).join("")}</g><circle cx="82" cy="280" r="8" fill="#475569"/></g>`,
      magic: `<g fill="#fde047" stroke="${INK}" stroke-width="2">${[[120, 100], [260, 60], [780, 150], [840, 60]].map(([x, y]) => `<path transform="translate(${x} ${y})" d="M0 -12 L3 -3 L12 0 L3 3 L0 12 L-3 3 L-12 0 L-3 -3Z" class="twinkle"/>`).join("")}</g>`,
    }[P] || ""}

    <!-- the hill -->
    <path d="M0 430 Q200 380 450 392 Q700 380 900 430 V560 H0Z" fill="url(#${u}hill)" ${S}/>
    <path d="M60 470 q10 -10 20 0 M150 500 q10 -10 20 0 M760 480 q10 -10 20 0 M830 510 q10 -10 20 0 M300 520 q10 -10 20 0 M600 525 q10 -10 20 0" stroke="#166534" stroke-width="3" fill="none"/>
    <path d="M420 560 Q440 500 450 470 Q460 500 480 560Z" fill="#fde68a" opacity=".7"/>

    <!-- base parts (in the order they're earned) -->
    ${part("floor", `<path d="M220 430 L680 430 L700 452 L200 452Z" fill="url(#${u}stoneTop)" ${S}/><rect x="200" y="452" width="500" height="30" fill="url(#${u}stoneFront)" ${S}/>
      <path d="M260 452 v30 M340 452 v30 M420 452 v30 M500 452 v30 M580 452 v30 M660 452 v30" stroke="#1e293b" stroke-width="2.5"/>`)}
    ${part("walls", `<rect x="262" y="276" width="376" height="156" fill="url(#${u}wall)" ${S}/>
      <path d="M262 316 H638 M262 372 H638" stroke="${h.dark}" stroke-width="3" opacity=".5"/>
      ${P === "fire" || P === "smash" ? `<path d="M300 276 v40 M380 276 v40 M460 316 v56 M540 276 v40 M600 316 v56 M340 372 v60 M520 372 v60" stroke="${h.dark}" stroke-width="3" opacity=".45"/>` : ""}
      <path d="M276 288 V420" stroke="#ffffff66" stroke-width="8" stroke-linecap="round"/>
      ${[284, 616].map((x) => [292, 340, 396].map((y) => `<circle cx="${x}" cy="${y}" r="4" fill="#ffffffaa"/>`).join("")).join("")}`)}
    ${part("roof", `<path d="M248 280 A202 128 0 0 1 652 280 Z" fill="url(#${u}dome)" ${S}/>
      <path d="M300 246 A170 100 0 0 1 600 246" fill="none" stroke="#ffffff99" stroke-width="7" stroke-linecap="round"/>
      <rect x="240" y="272" width="420" height="16" rx="6" fill="url(#${u}gold)" ${S}/>
      ${{
        fire: [380, 450, 520].map((x, i) => `<path d="M${x} ${i === 1 ? 150 : 176} C${x + 16} ${i === 1 ? 170 : 192} ${x + 16} ${i === 1 ? 196 : 210} ${x} ${i === 1 ? 204 : 216} C${x - 16} ${i === 1 ? 196 : 210} ${x - 16} ${i === 1 ? 170 : 192} ${x} ${i === 1 ? 150 : 176}Z" fill="url(#${u}flame)" ${S} class="flame"/>`).join(""),
        bolt: `<path d="M360 170 L346 196 L358 196 L344 222 L372 188 L360 188 L372 170Z" fill="#fde047" ${S}/>`,
        smash: `<path d="M330 230 l20 14 l-6 16 M560 220 l-16 18 l8 14" stroke="${INK}" stroke-width="3" fill="none"/>`,
        ice: [290, 340, 400, 500, 560, 610].map((x) => `<path d="M${x} 288 l8 30 l8 -30Z" fill="#e0f2fe" ${S}/>`).join(""),
        nature: [330, 420, 520, 590].map((x, i) => `<path transform="translate(${x} ${i % 2 ? 214 : 236}) rotate(${i * 40})" d="M0 0 C-4 -16 8 -26 20 -22 C20 -8 12 0 0 0Z" fill="#84cc16" ${S}/>`).join(""),
        magic: `<path d="M450 130 L456 146 L474 146 L460 156 L466 172 L450 162 L434 172 L440 156 L426 146 L444 146Z" fill="#fde047" ${S}/>`,
      }[P] || ""}`)}
    ${part("windows", `${[[288, 300], [550, 300]].map(([x, y]) => `<rect x="${x}" y="${y}" width="62" height="58" rx="10" fill="url(#${u}win)" ${S}/>
        <path d="M${x + 31} ${y} v58 M${x} ${y + 29} h62" stroke="${INK}" stroke-width="3"/><path d="M${x + 8} ${y + 8} l14 0 l-14 14z" fill="#fff" opacity=".8"/>`).join("")}
      <circle cx="450" cy="224" r="26" fill="url(#${u}win)" ${S}/><path d="M436 214 l10 -6" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`)}
    ${part("door", `<path d="M402 432 V352 A48 48 0 0 1 498 352 V432Z" fill="${h.dark}" ${S}/>
      <path d="M414 432 V356 A36 36 0 0 1 486 356 V432" fill="none" stroke="#ffffff33" stroke-width="5"/>
      <g transform="translate(450 372) scale(1.3)">${emblemIcon(h, 0, 0)}</g>
      <rect x="390" y="432" width="120" height="10" fill="url(#${u}gold)" ${S}/>`)}
    ${part("flag", `<rect x="447" y="70" width="7" height="90" fill="url(#${u}gold)" stroke="${INK}" stroke-width="3"/><circle cx="450" cy="66" r="8" fill="#fde047" ${S}/>
      <path d="M454 78 Q490 66 520 82 Q550 98 580 84 L580 132 Q550 146 520 130 Q490 114 454 126Z" fill="${h.suit}" ${S} class="wave"/>
      <g transform="translate(512 104) scale(.9)">${emblemIcon(h, 0, 0)}</g>`)}
    ${part("tower", P === "fire"
      ? `<path d="M126 452 L150 220 H196 L220 452Z" fill="#92400e" ${S}/><path d="M150 220 H196 L190 240 H156Z" fill="#f97316" ${S}/><path d="M168 236 Q160 300 172 340 Q180 380 168 452" stroke="#f97316" stroke-width="9" fill="none"/>
        <circle cx="173" cy="214" r="34" fill="url(#${u}fxglow)"/><path d="M160 214 C166 196 172 190 173 178 C178 192 186 198 186 214Z" fill="url(#${u}flame)" ${S} class="flame"/>`
      : P === "bolt"
      ? `<rect x="164" y="210" width="18" height="242" fill="url(#${u}metal)" ${S}/>${[260, 310, 360, 410].map((y, i) => `<ellipse cx="173" cy="${y}" rx="${44 - i * 4}" ry="12" fill="none" stroke="#b45309" stroke-width="7"/><ellipse cx="173" cy="${y}" rx="${44 - i * 4}" ry="12" fill="none" stroke="${INK}" stroke-width="2"/>`).join("")}
        <circle cx="173" cy="196" r="24" fill="url(#${u}metal)" ${S}/><g stroke="#fde047" stroke-width="4" fill="none" stroke-linecap="round" class="twinkle"><path d="M150 180 l-14 -10 l6 -6 l-16 -10"/><path d="M196 176 l14 -12 l-6 -6 l16 -8"/></g>`
      : P === "smash"
      ? `${[[173, 430, 46], [173, 380, 40], [173, 334, 36], [173, 292, 32]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * .62}" fill="#a8a29e" ${S}/>`).join("")}
        <g transform="translate(173 236)"><rect x="-26" y="-20" width="52" height="46" rx="14" fill="${h.suit}" ${S}/><path d="M-26 -6 h52 M-26 8 h52 M-10 -20 v20 M8 -20 v20" stroke="${INK}" stroke-width="3"/></g>`
      : `<rect x="140" y="230" width="66" height="222" fill="url(#${u}metal)" ${S}/>
        <path d="M140 270 L206 300 M140 330 L206 360 M140 390 L206 420" stroke="${h.suit}" stroke-width="8"/>
        <rect x="126" y="186" width="94" height="48" rx="8" fill="${P === "ice" ? "#e0f2fe" : "#bae6fd"}" ${S}/><path d="M138 196 l16 0 l-16 16z" fill="#fff"/>
        <path d="M120 188 L173 140 L226 188Z" fill="${h.suit}" ${S}/>`)}
    ${part("antenna", `<g transform="translate(590 222)"><path d="M0 34 L-10 60 H10Z" fill="#475569" ${S}/>
      <path d="M-34 6 A40 30 -25 0 0 34 -24 Z" fill="url(#${u}metal)" ${S}/><path d="M0 -8 L20 -36" stroke="${INK}" stroke-width="4"/><circle cx="22" cy="-38" r="6" fill="#ef4444" ${S}/>
      <g class="signal" fill="none" stroke="#fde047" stroke-width="4" stroke-linecap="round"><path d="M36 -50 q12 12 0 24"/><path d="M48 -62 q22 24 0 48"/></g></g>`)}
    ${part("garden", P === "fire"
      ? `${[180, 716].map((x) => `<ellipse cx="${x}" cy="478" rx="54" ry="18" fill="#f97316" ${S}/><ellipse cx="${x}" cy="476" rx="34" ry="9" fill="#fde047"/>`).join("")}
         ${[[150, 462], [210, 460], [690, 462], [744, 462]].map(([x, y]) => `<path d="M${x} ${y + 14} v-14" stroke="#166534" stroke-width="4"/><circle cx="${x}" cy="${y}" r="9" fill="#dc2626" stroke="${INK}" stroke-width="2.5"/>`).join("")}`
      : P === "bolt"
      ? `${[[170, 470], [214, 478], [670, 478], [720, 470]].map(([x, y], i) => `<rect x="${x - 5}" y="${y - 6}" width="10" height="22" fill="#f8fafc" ${S}/><path d="M${x - 24} ${y - 4} Q${x} ${y - 40} ${x + 24} ${y - 4}Z" fill="${i % 2 ? "#38bdf8" : "#a78bfa"}" ${S}/><circle cx="${x}" cy="${y - 18}" r="22" fill="url(#${u}fxglow)" opacity=".6"/>`).join("")}`
      : P === "smash"
      ? `${[[170, 474, 34], [226, 482, 24], [670, 482, 26], [726, 474, 32]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * .7}" fill="#a8a29e" ${S}/>`).join("")}
         <g ${S}><path d="M200 470 v-46 q0 -10 10 -10 q10 0 10 10 v46Z M188 444 q-10 0 -10 -10 v-10 h10Z" fill="#16a34a"/></g>`
      : `${[[180, 470, "#16a34a"], [236, 478, "#22c55e"], [660, 478, "#22c55e"], [716, 470, "#16a34a"]].map(([x, y, c]) => `<ellipse cx="${x}" cy="${y}" rx="38" ry="26" fill="${c}" ${S}/><ellipse cx="${x - 10}" cy="${y - 8}" rx="12" ry="7" fill="#ffffff44"/>`).join("")}
      ${[[170, 462, "#f472b6"], [196, 474, "#facc15"], [246, 468, "#ef4444"], [672, 470, "#a855f7"], [706, 462, "#facc15"], [728, 476, "#f472b6"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="8" fill="${c}" stroke="${INK}" stroke-width="2.5"/><circle cx="${x}" cy="${y}" r="3" fill="#fef9c3"/>`).join("")}`)}
    ${part("lamp", [245, 655].map((x) => P === "fire"
      ? `<circle cx="${x}" cy="370" r="46" fill="url(#${u}fxglow)"/><rect x="${x - 6}" y="384" width="12" height="100" fill="#78350f" ${S}/><path d="M${x - 14} 384 h28 l-4 -10 h-20z" fill="#334155" ${S}/>
         <path d="M${x} 330 C${x + 14} 346 ${x + 14} 368 ${x} 374 C${x - 14} 368 ${x - 14} 346 ${x} 330Z" fill="url(#${u}flame)" ${S} class="flame"/>`
      : P === "smash"
      ? `<circle cx="${x}" cy="420" r="44" fill="url(#${u}fxglow)"/><path d="M${x - 20} 470 L${x - 12} 410 L${x} 380 L${x + 12} 410 L${x + 20} 470Z" fill="#a3e635" ${S}/><path d="M${x} 380 V470" stroke="#fff" stroke-width="3" opacity=".7"/>`
      : `<circle cx="${x}" cy="380" r="46" fill="url(#${u}fxglow)"/><rect x="${x - 5}" y="384" width="10" height="100" fill="#334155" ${S}/>
         <path d="M${x - 16} 384 h32 l-6 -22 h-20z" fill="#1e293b" ${S}/><circle cx="${x}" cy="372" r="10" fill="${fx.glow[0]}" ${S}/>`).join(""))}
    ${part("pad", `<ellipse cx="790" cy="508" rx="96" ry="28" fill="#334155" ${S}/><ellipse cx="790" cy="504" rx="70" ry="18" fill="none" stroke="#fde047" stroke-width="4" stroke-dasharray="10 8"/>
      <text x="790" y="514" text-anchor="middle" font-family="Arial" font-weight="900" font-size="26" fill="#fde047" stroke="${INK}" stroke-width="1.5">H</text>
      ${[712, 868].map((x) => `<circle cx="${x}" cy="508" r="6" fill="#ef4444" stroke="${INK}" stroke-width="2" class="twinkle"/>`).join("")}`)}
    ${part("rocket", `<g transform="translate(790 300)">
      <ellipse cx="0" cy="196" rx="34" ry="10" fill="#0004"/>
      <path d="M-16 150 Q0 214 16 150Z" fill="url(#${u}flame)" class="flame"/>
      <path d="M0 0 C34 30 40 100 30 150 H-30 C-40 100 -34 30 0 0Z" fill="url(#${u}metal)" ${S}/>
      <path d="M0 0 C14 12 22 26 26 40 H-26 C-22 26 -14 12 0 0Z" fill="${h.suit}" ${S}/>
      <circle cx="0" cy="76" r="15" fill="#38bdf8" ${S}/><path d="M-6 70 l6 -4" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
      <path d="M-30 110 L-54 160 L-30 150Z M30 110 L54 160 L30 150Z" fill="${h.suit}" ${S}/></g>`)}

    <!-- the hero in front of the door -->
    <g transform="translate(372 352)">${heroSVG(hero, 150, powers).replace('class="hero-svg', 'class="hero-svg base-hero-svg')}</g>
  </svg>`;
}

// Robot that falls asleep as you answer (hp goes 5 → 0).
function robotSVG(hp, max) {
  const asleep = hp <= 0;
  const eye = asleep
    ? `<path d="M68 72 q11 9 22 0 M110 72 q11 9 22 0" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`
    : `<circle cx="80" cy="72" r="11" fill="#ef4444" stroke="${INK}" stroke-width="3"/><circle cx="120" cy="72" r="11" fill="#ef4444" stroke="${INK}" stroke-width="3"/><path d="M66 58 l24 8 M134 58 l-24 8" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
  return `
  <svg viewBox="0 0 200 210" class="boss-svg ${asleep ? "asleep" : ""}" aria-label="רובוט">
    ${hpBar(hp, max)}
    <g stroke="${INK}" stroke-width="4" stroke-linejoin="round">
      <rect x="96" y="30" width="8" height="18" fill="#64748b"/>
      <circle cx="100" cy="30" r="8" fill="${asleep ? "#94a3b8" : "#f59e0b"}"/>
      <rect x="45" y="45" width="110" height="62" rx="16" fill="#94a3b8"/>
      <rect x="55" y="112" width="90" height="70" rx="14" fill="#a8b5c7"/>
      <circle cx="100" cy="146" r="13" fill="${asleep ? "#64748b" : "#38bdf8"}"/>
      <rect x="22" y="116" width="26" height="52" rx="10" fill="#94a3b8"/>
      <rect x="152" y="116" width="26" height="52" rx="10" fill="#94a3b8"/>
      <rect x="70" y="182" width="22" height="22" rx="5" fill="#64748b"/><rect x="108" y="182" width="22" height="22" rx="5" fill="#64748b"/>
    </g>
    ${eye}
    <rect x="78" y="90" width="44" height="8" rx="3" fill="#334155"/>
    ${asleep ? `<text x="145" y="45" font-size="28" font-weight="900" fill="#6366f1" stroke="${INK}" stroke-width="1.5">Z z</text>` : ""}
  </svg>`;
}

function hpBar(hp, max) {
  return Array.from({ length: max }, (_, i) =>
    `<rect x="${52 + i * 20}" y="6" width="16" height="12" rx="3" fill="${i < hp ? "#ef4444" : "#cbd5e1"}" stroke="${INK}" stroke-width="2.5"/>`).join("");
}

// Dr. Balagan, the city's (silly) villain.
function villainSVG(hp = 5, max = 5, size) {
  const asleep = hp <= 0;
  return `
  <svg viewBox="0 0 200 220" class="boss-svg villain ${asleep ? "asleep" : ""}" ${size ? `width="${size}" height="${size * 1.1}"` : ""} aria-label="${VILLAIN.name}">
    ${max ? hpBar(hp, max) : ""}
    <g stroke="${INK}" stroke-width="4" stroke-linejoin="round">
      <path d="M40 215 Q50 130 100 120 Q150 130 160 215Z" fill="#7c3aed"/>
      <path d="M100 120 L84 215 M100 120 L116 215" stroke-width="3"/>
      <path d="M82 124 L100 150 L118 124" fill="#fff"/>
      <circle cx="100" cy="190" r="10" fill="#a3e635"/>
      <path d="M50 40 Q30 30 38 60 Q20 60 34 80 M150 40 Q170 30 162 60 Q180 60 166 80" fill="none" stroke="#a3e635" stroke-width="10"/>
      <ellipse cx="100" cy="80" rx="46" ry="48" fill="#c4f1a7"/>
      <path d="M58 52 Q70 18 100 30 Q130 16 142 52 Q120 40 100 46 Q80 40 58 52Z" fill="#e5e7eb"/>
    </g>
    <g stroke="${INK}" stroke-width="4">
      <circle cx="80" cy="76" r="15" fill="#fef08a"/><circle cx="120" cy="76" r="15" fill="#fef08a"/>
      <path d="M95 76 h10" />
    </g>
    ${asleep
      ? `<path d="M72 78 q8 6 16 0 M112 78 q8 6 16 0" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`
      : `<circle cx="83" cy="78" r="5" fill="${INK}"/><circle cx="117" cy="74" r="5" fill="${INK}"/>`}
    <path d="M74 102 Q86 94 100 100 Q114 94 126 102 Q114 108 100 104 Q86 108 74 102Z" fill="#4a2c17" stroke="${INK}" stroke-width="3"/>
    ${asleep
      ? `<ellipse cx="100" cy="114" rx="6" ry="4" fill="${INK}"/><text x="140" y="40" font-size="28" font-weight="900" fill="#a3e635" stroke="${INK}" stroke-width="1.5">Z z z</text>`
      : `<path d="M84 112 Q100 124 116 112" stroke="${INK}" stroke-width="4" fill="#fff"/>`}
  </svg>`;
}

// Comic "BOOM!" burst with a word in it.
function burstSVG(word, color = "#facc15") {
  const pts = [];
  for (let i = 0; i < 28; i++) {
    const r = i % 2 ? 62 : 100;
    const a = (Math.PI * 2 * i) / 28;
    pts.push(`${(110 + r * Math.cos(a)).toFixed(1)},${(110 + r * Math.sin(a)).toFixed(1)}`);
  }
  return `<svg viewBox="0 0 220 220" class="burst-svg">
    <polygon points="${pts.join(" ")}" fill="#ef4444" stroke="${INK}" stroke-width="5" stroke-linejoin="round" transform="rotate(8 110 110)"/>
    <polygon points="${pts.join(" ")}" fill="${color}" stroke="${INK}" stroke-width="4" stroke-linejoin="round" transform="translate(110 110) scale(.78) translate(-110 -110)"/>
    <text x="110" y="128" text-anchor="middle" class="burst-text">${word}</text>
  </svg>`;
}

// The dragon Dr. Balagan put a spell on (a friendly one, it just falls asleep).
function dragonSVG(hp = 5, max = 5) {
  const asleep = hp <= 0;
  return `
  <svg viewBox="0 0 200 210" class="boss-svg dragon ${asleep ? "asleep" : ""}" aria-label="דרקון">
    ${max ? hpBar(hp, max) : ""}
    <g stroke="${INK}" stroke-width="4" stroke-linejoin="round">
      <path d="M60 110 L10 70 L30 112 L4 116 L52 140Z" fill="#a7f3d0"/>
      <path d="M140 110 L190 70 L170 112 L196 116 L148 140Z" fill="#a7f3d0"/>
      <path d="M140 170 Q190 176 186 140 Q180 160 150 152Z" fill="#22c55e"/>
      <ellipse cx="100" cy="150" rx="48" ry="46" fill="#22c55e"/>
      <ellipse cx="100" cy="160" rx="28" ry="30" fill="#fde68a"/>
      <path d="M80 140 h40 M78 156 h44 M82 172 h36" stroke-width="2.5" opacity=".5"/>
      <ellipse cx="78" cy="196" rx="16" ry="9" fill="#16a34a"/><ellipse cx="122" cy="196" rx="16" ry="9" fill="#16a34a"/>
      <path d="M72 46 L64 18 L86 40Z M128 46 L136 18 L114 40Z" fill="#fef3c7"/>
      <ellipse cx="100" cy="72" rx="46" ry="38" fill="#22c55e"/>
      <ellipse cx="100" cy="92" rx="30" ry="18" fill="#4ade80"/>
      <path d="M100 34 l8 -10 l4 12 l10 -6 l-2 12" fill="#f97316" stroke-width="3"/>
    </g>
    <circle cx="90" cy="92" r="3.5" fill="${INK}"/><circle cx="110" cy="92" r="3.5" fill="${INK}"/>
    ${asleep
      ? `<path d="M68 66 q10 8 20 0 M112 66 q10 8 20 0" stroke="${INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
         <text x="140" y="44" font-size="26" font-weight="900" fill="#22c55e" stroke="${INK}" stroke-width="1.5">Z z</text>`
      : `<ellipse cx="78" cy="64" rx="12" ry="13" fill="#fff" stroke="${INK}" stroke-width="3.5"/><ellipse cx="122" cy="64" rx="12" ry="13" fill="#fff" stroke="${INK}" stroke-width="3.5"/>
         <circle cx="80" cy="66" r="6" fill="#7c3aed"/><circle cx="120" cy="66" r="6" fill="#7c3aed"/>
         <path d="M64 50 l24 6 M136 50 l-24 6" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>
         <g class="smoke"><circle cx="148" cy="96" r="7" fill="#e5e7eb" stroke="${INK}" stroke-width="2.5"/><circle cx="162" cy="86" r="9" fill="#e5e7eb" stroke="${INK}" stroke-width="2.5"/></g>`}
    <path d="M86 104 Q100 ${asleep ? 108 : 112} 114 104" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  </svg>`;
}

// The hungry monster (gets full and sleepy as you answer).
function monsterSVG(hp = 5, max = 5) {
  const asleep = hp <= 0;
  return `
  <svg viewBox="0 0 220 220" class="boss-svg monster ${asleep ? "asleep" : ""}" aria-label="מפלצת">
    ${max ? hpBar(hp, max) : ""}
    <g stroke="${INK}" stroke-width="5" stroke-linejoin="round">
      <path d="M50 70 L36 26 L76 56Z M170 70 L184 26 L144 56Z" fill="#a3e635"/>
      <path d="M24 130 Q24 50 110 46 Q196 50 196 130 Q196 206 110 206 Q24 206 24 130Z" fill="#84cc16"/>
      <path d="M40 196 l10 -16 l10 16 M160 196 l10 -16 l10 16" fill="#65a30d"/>
    </g>
    ${asleep
      ? `<path d="M64 98 q16 10 32 0 M124 98 q16 10 32 0" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>
         <path d="M80 150 Q110 166 140 150" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/>
         <text x="150" y="50" font-size="28" font-weight="900" fill="#65a30d" stroke="${INK}" stroke-width="1.5">Z z</text>`
      : `<circle cx="80" cy="96" r="22" fill="#fff" stroke="${INK}" stroke-width="5"/><circle cx="140" cy="96" r="22" fill="#fff" stroke="${INK}" stroke-width="5"/>
         <circle cx="84" cy="100" r="9" fill="${INK}"/><circle cx="136" cy="100" r="9" fill="${INK}"/>
         <path d="M62 140 Q110 200 158 140Z" fill="#7f1d1d" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
         <path d="M76 142 l8 13 l8 -13 M128 142 l8 13 l8 -13" fill="#fff" stroke="${INK}" stroke-width="2.5"/>`}
  </svg>`;
}

// ---------- the three rulers (2026-11-16) ----------
const sleepyEyes = (lx, rx, y) => `<path d="M${lx - 10} ${y} q10 8 20 0 M${rx - 10} ${y} q10 8 20 0" stroke="${INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
const zzz = (x, y, c) => `<text x="${x}" y="${y}" font-size="26" font-weight="900" fill="${c}" stroke="${INK}" stroke-width="1.5">Z z</text>`;

// Mega-Robot, king of numbers.
function robotKingSVG(hp = 5, max = 5) {
  const asleep = hp <= 0;
  return `
  <svg viewBox="0 0 200 220" class="boss-svg robotking ${asleep ? "asleep" : ""}" aria-label="מגה־רובוט">
    ${max ? hpBar(hp, max) : ""}
    <g stroke="${INK}" stroke-width="4" stroke-linejoin="round">
      <path d="M40 120 Q20 170 30 214 H170 Q180 170 160 120Z" fill="#dc2626"/>
      <rect x="50" y="116" width="100" height="84" rx="14" fill="#94a3b8"/>
      <rect x="66" y="128" width="68" height="44" rx="6" fill="#0f172a"/>
      <rect x="18" y="122" width="30" height="62" rx="12" fill="#94a3b8"/><rect x="152" y="122" width="30" height="62" rx="12" fill="#94a3b8"/>
      <rect x="52" y="44" width="96" height="70" rx="18" fill="#cbd5e1"/>
      <path d="M56 46 L64 18 L82 36 L100 12 L118 36 L136 18 L144 46Z" fill="#facc15"/>
      <circle cx="82" cy="30" r="4" fill="#ef4444"/><circle cx="100" cy="22" r="5" fill="#3b82f6"/><circle cx="118" cy="30" r="4" fill="#22c55e"/>
    </g>
    <text x="100" y="158" text-anchor="middle" font-family="Arial" font-weight="900" font-size="26" fill="#4ade80">${asleep ? "0" : "+ − ="}</text>
    ${asleep ? sleepyEyes(80, 120, 78) + zzz(150, 40, "#60a5fa") : `<circle cx="80" cy="78" r="11" fill="#ef4444" stroke="${INK}" stroke-width="3"/><circle cx="120" cy="78" r="11" fill="#ef4444" stroke="${INK}" stroke-width="3"/><path d="M64 62 l24 8 M136 62 l-24 8" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`}
    <rect x="80" y="96" width="40" height="8" rx="3" fill="#334155"/>
  </svg>`;
}

// Balbula, the witch who mixes up letters (silly, not scary).
function witchSVG(hp = 5, max = 5) {
  const asleep = hp <= 0;
  return `
  <svg viewBox="0 0 200 220" class="boss-svg witch ${asleep ? "asleep" : ""}" aria-label="המכשפה בלבולה">
    ${max ? hpBar(hp, max) : ""}
    <g stroke="${INK}" stroke-width="4" stroke-linejoin="round">
      <path d="M44 214 Q52 130 100 122 Q148 130 156 214Z" fill="#7c3aed"/>
      <path d="M60 88 Q40 110 52 140 M140 88 Q160 110 148 140" fill="none" stroke="#f97316" stroke-width="12" stroke-linecap="round"/>
      <circle cx="100" cy="90" r="38" fill="#bef264"/>
      <path d="M40 62 Q100 44 160 62 L150 70 Q100 58 50 70Z" fill="#1e1b4b"/>
      <path d="M62 60 L100 2 L140 60Z" fill="#4c1d95"/>
      <path d="M100 2 q16 6 22 20" fill="none"/>
      <path d="M150 150 L186 100" stroke="#92400e" stroke-width="7"/>
    </g>
    <path d="M70 54 L132 54" stroke="#facc15" stroke-width="8"/>
    <text x="96" y="40" font-size="18">⭐</text>
    <g font-family="Arial" font-weight="900" font-size="22" fill="#fde047" stroke="${INK}" stroke-width="1.5" class="floaty"><text x="176" y="92">א</text><text x="10" y="120">ב</text><text x="164" y="150">ג</text></g>
    ${asleep ? sleepyEyes(86, 114, 90) + zzz(140, 30, "#a3e635") : `<circle cx="86" cy="88" r="8" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="114" cy="88" r="8" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="88" cy="90" r="3.5" fill="${INK}"/><circle cx="112" cy="90" r="3.5" fill="${INK}"/>`}
    <path d="M100 96 l8 14 h-14z" fill="#84cc16" stroke="${INK}" stroke-width="3"/>
    <path d="M84 114 Q100 ${asleep ? 118 : 126} 116 114" stroke="${INK}" stroke-width="4" fill="${asleep ? "none" : "#fff"}" stroke-linecap="round"/>
  </svg>`;
}

// Mister Mix, the magician who makes English words disappear.
function mrMixSVG(hp = 5, max = 5) {
  const asleep = hp <= 0;
  return `
  <svg viewBox="0 0 200 220" class="boss-svg mrmix ${asleep ? "asleep" : ""}" aria-label="מיסטר מיקס">
    ${max ? hpBar(hp, max) : ""}
    <g stroke="${INK}" stroke-width="4" stroke-linejoin="round">
      <path d="M46 214 Q54 132 100 124 Q146 132 154 214Z" fill="#be185d"/>
      <path d="M86 126 L100 160 L114 126Z" fill="#fff"/><path d="M92 132 l8 6 l8 -6 l-8 6z" fill="#111"/>
      <circle cx="100" cy="90" r="36" fill="#fcd9b6"/>
      <rect x="66" y="10" width="68" height="52" rx="4" fill="#1e1b4b"/><rect x="66" y="44" width="68" height="10" fill="#db2777"/>
      <ellipse cx="100" cy="62" rx="54" ry="10" fill="#1e1b4b"/>
      <path d="M150 168 L190 128" stroke="#111" stroke-width="8"/><path d="M182 136 l10 -10" stroke="#fff" stroke-width="8"/>
    </g>
    <g font-family="Arial" font-weight="900" font-size="20" fill="#fff" stroke="${INK}" stroke-width="1.5" class="floaty"><text x="160" y="104">A</text><text x="12" y="112">B</text><text x="22" y="160">C</text></g>
    ${asleep ? sleepyEyes(86, 114, 86) + zzz(140, 30, "#f472b6") : `<circle cx="86" cy="84" r="7" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="114" cy="84" r="10" fill="#e0f2fe" stroke="${INK}" stroke-width="3"/><circle cx="87" cy="85" r="3.5" fill="${INK}"/><circle cx="114" cy="85" r="3.5" fill="${INK}"/><path d="M124 88 q8 14 4 30" stroke="#facc15" stroke-width="2" fill="none"/>`}
    <path d="M78 104 Q90 96 100 102 Q110 96 122 104 Q110 110 100 106 Q90 110 78 104Z" fill="#111"/>
    <path d="M88 114 Q100 ${asleep ? 118 : 122} 112 114" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  </svg>`;
}

const BOSS_ART = { robot: robotSVG, villain: villainSVG, dragon: dragonSVG, monster: monsterSVG, robotking: robotKingSVG, witch: witchSVG, mrmix: mrMixSVG };
