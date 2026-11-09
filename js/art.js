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
  const icon = h.power === "fire"
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
      <path d="M${x(-31)} ${y(0)} Q${x(-34)} ${y(-30)} ${x(-16)} ${y(-38)} L${x(-14)} ${y(-50)} L${x(-2)} ${y(-40)} L${x(6)} ${y(-54)} L${x(14)} ${y(-38)} L${x(26)} ${y(-46)} L${x(26)} ${y(-30)} Q${x(36)} ${y(-20)} ${x(31)} ${y(0)} Q${x(22)} ${y(-18)} ${x(4)} ${y(-18)} L${x(-2)} ${y(-26)} L${x(-8)} ${y(-17)} Q${x(-22)} ${y(-16)} ${x(-31)} ${y(0)}Z" fill="#3b2416"/>
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


// The hero base: each part appears once it was earned.
function baseSVG(parts, hero) {
  const h = HEROES[hero];
  const has = (id) => parts.includes(id);
  const g = (id, inner) => `<g class="${has(id) ? "" : "ghost"}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round">${inner}</g>`;
  return `
  <svg viewBox="0 0 400 300" class="base-svg" aria-label="בסיס הגיבורים">
    <defs><radialGradient id="bsky" cx=".5" cy=".9" r="1"><stop offset="0" stop-color="#fde68a"/><stop offset=".45" stop-color="#f472b6"/><stop offset="1" stop-color="#312e81"/></radialGradient></defs>
    <rect x="0" y="0" width="400" height="300" fill="url(#bsky)"/>
    <g fill="#1e1b4b" opacity=".55"><rect x="0" y="170" width="40" height="80"/><rect x="44" y="140" width="30" height="110"/><rect x="330" y="150" width="34" height="100"/><rect x="368" y="185" width="32" height="70"/></g>
    <circle cx="268" cy="40" r="20" fill="#fef9c3" stroke="${INK}" stroke-width="3"/>
    <rect x="0" y="240" width="400" height="60" fill="#4ade80" stroke="${INK}" stroke-width="3"/>
    ${g("floor", `<rect x="70" y="228" width="240" height="16" rx="4" fill="#92400e"/>`)}
    ${g("walls", `<rect x="85" y="140" width="210" height="90" fill="${h.light}"/><path d="M85 165 h210 M85 195 h210" stroke-width="2" opacity=".35"/>`)}
    ${g("door", `<rect x="170" y="172" width="40" height="58" rx="18" fill="${h.dark}"/><path d="M190 182 l12 4 v8 q0 9 -12 14 q-12 -5 -12 -14 v-8z" fill="${h.accent}" stroke-width="2.5"/>`)}
    ${g("windows", `<rect x="105" y="158" width="42" height="32" rx="5" fill="#fef08a"/><rect x="233" y="158" width="42" height="32" rx="5" fill="#fef08a"/><path d="M126 158 v32 M254 158 v32" stroke-width="2.5"/>`)}
    ${g("roof", `<path d="M70 142 L190 80 L310 142Z" fill="${h.suit}"/>`)}
    ${g("flag", `<rect x="188" y="40" width="5" height="44" fill="#475569"/><path d="M193 42 L230 52 L193 64Z" fill="${h.accent}"/>`)}
    ${g("tower", `<rect x="300" y="100" width="34" height="130" fill="#64748b"/><rect x="294" y="90" width="46" height="16" fill="#334155"/><rect x="309" y="120" width="16" height="16" fill="#fef08a"/>`)}
    ${g("antenna", `<rect x="315" y="56" width="4" height="36" fill="#475569"/><circle cx="317" cy="52" r="7" fill="#ef4444"/>`)}
    ${g("garden", `<circle cx="30" cy="250" r="12" fill="#facc15"/><circle cx="58" cy="256" r="10" fill="#f472b6"/><circle cx="356" cy="254" r="11" fill="#fb923c"/>`)}
    ${g("lamp", `<rect x="40" y="170" width="6" height="70" fill="#334155"/><circle cx="43" cy="166" r="10" fill="#fde047"/>`)}
    ${has("lamp") ? `<path d="M43 166 L10 40 L90 40Z" fill="#fde04744"/>` : ""}
    ${g("pad", `<ellipse cx="200" cy="276" rx="62" ry="13" fill="#334155"/><text x="200" y="282" text-anchor="middle" font-size="15" font-weight="900" fill="#fde047" stroke="none" font-family="Arial">H</text>`)}
    ${g("rocket", `<path d="M360 70 q14 22 10 60 h-20 q-4 -38 10 -60z" fill="#e2e8f0"/><circle cx="360" cy="100" r="6" fill="#38bdf8"/><path d="M350 130 l-10 14 h12z M370 130 l10 14 h-12z" fill="#ef4444"/>`)}
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
