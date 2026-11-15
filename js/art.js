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
  const icon = h.power === "smash"
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
  const boot = has("speed") ? "#fde047" : h.dark;
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
    ${has("shield") ? `<circle cx="100" cy="126" r="98" fill="${h.light}" opacity=".18" stroke="${h.accent}" stroke-width="4" stroke-dasharray="12 8"/>` : ""}
    ${has("magic") ? `<g fill="#fff" stroke="${INK}" stroke-width="2">${[[14, 70], [184, 150], [22, 196], [180, 40]].map(([x, y]) => `<path d="M${x} ${y - 9} L${x + 3} ${y - 3} L${x + 9} ${y} L${x + 3} ${y + 3} L${x} ${y + 9} L${x - 3} ${y + 3} L${x - 9} ${y} L${x - 3} ${y - 3}Z"/>`).join("")}</g>` : ""}
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
    ${has("speed") ? `<path d="M50 200 h-24 M54 210 h-34 M56 220 h-20" stroke="#fde047" stroke-width="5" stroke-linecap="round"/>` : ""}
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
  const part = (id, inner) => `<g class="base-part ${has(id) ? "built" : "ghost-part"}">${inner}</g>`;
  const S = `stroke="${INK}" stroke-width="4" stroke-linejoin="round"`;
  const day = h.power === "smash";
  const sunny = fire || day;
  const sky = day ? ["#0284c7", "#38bdf8", "#7dd3fc", "#ecfccb"] : fire ? ["#4c1d95", "#db2777", "#fb923c", "#fde68a"] : ["#0b1033", "#1e3a8a", "#3b82f6", "#a5f3fc"];
  return `
  <svg viewBox="0 0 900 560" class="base-svg" aria-label="בסיס הגיבורים">
    <defs>
      <linearGradient id="${u}sky" x1="0" y1="0" x2="0" y2="1">${sky.map((c, i) => `<stop offset="${i / 3}" stop-color="${c}"/>`).join("")}</linearGradient>
      <linearGradient id="${u}hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4ade80"/><stop offset="1" stop-color="#15803d"/></linearGradient>
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

    <!-- the hill -->
    <path d="M0 430 Q200 380 450 392 Q700 380 900 430 V560 H0Z" fill="url(#${u}hill)" ${S}/>
    <path d="M60 470 q10 -10 20 0 M150 500 q10 -10 20 0 M760 480 q10 -10 20 0 M830 510 q10 -10 20 0 M300 520 q10 -10 20 0 M600 525 q10 -10 20 0" stroke="#166534" stroke-width="3" fill="none"/>
    <path d="M420 560 Q440 500 450 470 Q460 500 480 560Z" fill="#fde68a" opacity=".7"/>

    <!-- base parts (in the order they're earned) -->
    ${part("floor", `<path d="M220 430 L680 430 L700 452 L200 452Z" fill="url(#${u}stoneTop)" ${S}/><rect x="200" y="452" width="500" height="30" fill="url(#${u}stoneFront)" ${S}/>
      <path d="M260 452 v30 M340 452 v30 M420 452 v30 M500 452 v30 M580 452 v30 M660 452 v30" stroke="#1e293b" stroke-width="2.5"/>`)}
    ${part("walls", `<rect x="262" y="276" width="376" height="156" fill="url(#${u}wall)" ${S}/>
      <path d="M262 316 H638 M262 372 H638" stroke="${h.dark}" stroke-width="3" opacity=".5"/>
      <path d="M276 288 V420" stroke="#ffffff66" stroke-width="8" stroke-linecap="round"/>
      ${[284, 616].map((x) => [292, 340, 396].map((y) => `<circle cx="${x}" cy="${y}" r="4" fill="#ffffffaa"/>`).join("")).join("")}`)}
    ${part("roof", `<path d="M248 280 A202 128 0 0 1 652 280 Z" fill="url(#${u}dome)" ${S}/>
      <path d="M300 246 A170 100 0 0 1 600 246" fill="none" stroke="#ffffff99" stroke-width="7" stroke-linecap="round"/>
      <rect x="240" y="272" width="420" height="16" rx="6" fill="url(#${u}gold)" ${S}/>`)}
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
    ${part("tower", `<rect x="140" y="230" width="66" height="222" fill="url(#${u}metal)" ${S}/>
      <path d="M140 270 L206 300 M140 330 L206 360 M140 390 L206 420" stroke="${h.suit}" stroke-width="8"/>
      <rect x="126" y="186" width="94" height="48" rx="8" fill="#bae6fd" ${S}/><path d="M138 196 l16 0 l-16 16z" fill="#fff"/>
      <path d="M120 188 L173 140 L226 188Z" fill="${h.suit}" ${S}/>`)}
    ${part("antenna", `<g transform="translate(590 222)"><path d="M0 34 L-10 60 H10Z" fill="#475569" ${S}/>
      <path d="M-34 6 A40 30 -25 0 0 34 -24 Z" fill="url(#${u}metal)" ${S}/><path d="M0 -8 L20 -36" stroke="${INK}" stroke-width="4"/><circle cx="22" cy="-38" r="6" fill="#ef4444" ${S}/>
      <g class="signal" fill="none" stroke="#fde047" stroke-width="4" stroke-linecap="round"><path d="M36 -50 q12 12 0 24"/><path d="M48 -62 q22 24 0 48"/></g></g>`)}
    ${part("garden", `${[[180, 470, "#16a34a"], [236, 478, "#22c55e"], [660, 478, "#22c55e"], [716, 470, "#16a34a"]].map(([x, y, c]) => `<ellipse cx="${x}" cy="${y}" rx="38" ry="26" fill="${c}" ${S}/><ellipse cx="${x - 10}" cy="${y - 8}" rx="12" ry="7" fill="#ffffff44"/>`).join("")}
      ${[[170, 462, "#f472b6"], [196, 474, "#facc15"], [246, 468, "#ef4444"], [672, 470, "#a855f7"], [706, 462, "#facc15"], [728, 476, "#f472b6"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="8" fill="${c}" stroke="${INK}" stroke-width="2.5"/><circle cx="${x}" cy="${y}" r="3" fill="#fef9c3"/>`).join("")}`)}
    ${part("lamp", `${[245, 655].map((x) => `<circle cx="${x}" cy="380" r="46" fill="url(#${u}glow)"/><rect x="${x - 5}" y="384" width="10" height="100" fill="#334155" ${S}/>
        <path d="M${x - 16} 384 h32 l-6 -22 h-20z" fill="#1e293b" ${S}/><circle cx="${x}" cy="372" r="10" fill="#fef08a" ${S}/>`).join("")}`)}
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
