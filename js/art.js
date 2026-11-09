// Drawings (SVG) in comic-book style: thick black outlines, bold colors.
// heroes, the hero base, the robot, Dr. Balagan (the villain), "BOOM!" bursts.

const INK = "#111";

// A thick limb with a black outline: draws the outline first, then the color on top.
function limb(d, color, w = 20) {
  return `<path d="${d}" stroke="${INK}" stroke-width="${w + 8}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="${d}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function heroHead(h, cx = 100, cy = 66, night = false) {
  return `
    <g stroke="${INK}" stroke-width="4" stroke-linejoin="round">
      <circle cx="${cx}" cy="${cy}" r="31" fill="#f6c39b"/>
      <path d="M${cx - 32} ${cy - 4} Q${cx - 34} ${cy - 38} ${cx - 8} ${cy - 40} L${cx - 2} ${cy - 50} L${cx + 8} ${cy - 40} L${cx + 18} ${cy - 48} L${cx + 22} ${cy - 36} Q${cx + 36} ${cy - 28} ${cx + 32} ${cy - 4} Q${cx + 20} ${cy - 22} ${cx} ${cy - 20} Q${cx - 20} ${cy - 22} ${cx - 32} ${cy - 4}Z" fill="#4a2c17"/>
      <path d="M${cx - 31} ${cy - 2} Q${cx} ${cy - 14} ${cx + 31} ${cy - 2} L${cx + 29} ${cy + 12} Q${cx + 14} ${cy + 6} ${cx} ${cy + 12} Q${cx - 14} ${cy + 6} ${cx - 29} ${cy + 12}Z" fill="${h.dark}"/>
    </g>
    <ellipse cx="${cx - 13}" cy="${cy + 3}" rx="8" ry="6" fill="#fff" stroke="${INK}" stroke-width="2.5"/>
    <ellipse cx="${cx + 13}" cy="${cy + 3}" rx="8" ry="6" fill="#fff" stroke="${INK}" stroke-width="2.5"/>
    <circle cx="${cx - 12}" cy="${cy + 4}" r="3" fill="${INK}"/><circle cx="${cx + 14}" cy="${cy + 4}" r="3" fill="${INK}"/>
    ${night ? `<ellipse cx="${cx - 13}" cy="${cy + 3}" rx="11" ry="9" fill="none" stroke="#fde047" stroke-width="3"/><ellipse cx="${cx + 13}" cy="${cy + 3}" rx="11" ry="9" fill="none" stroke="#fde047" stroke-width="3"/>` : ""}
    <path d="M${cx - 12} ${cy + 18} Q${cx} ${cy + 28} ${cx + 12} ${cy + 18}" stroke="${INK}" stroke-width="4" fill="#fff" stroke-linecap="round"/>
    <circle cx="${cx - 22}" cy="${cy + 17}" r="4" fill="#f59e9e" opacity=".7"/><circle cx="${cx + 22}" cy="${cy + 17}" r="4" fill="#f59e9e" opacity=".7"/>`;
}

function heroSVG(hero, size = 160, powers = []) {
  const h = HEROES[hero];
  const has = (id) => powers.includes(id);
  const fly = has("fly");
  const boot = has("speed") ? "#fde047" : h.accent;
  return `
  <svg viewBox="0 0 200 240" width="${size}" height="${size * 1.2}" class="hero-svg" aria-label="${h.name}">
    ${has("shield") ? `<circle cx="100" cy="125" r="96" fill="${h.accent}" opacity=".25" stroke="${h.accent}" stroke-width="4" stroke-dasharray="10 8"/>` : ""}
    ${has("magic") ? `<g font-size="24"><text x="6" y="60">✨</text><text x="168" y="150">✨</text><text x="20" y="200">✨</text></g>` : ""}
    <!-- cape -->
    <path d="M74 100 C${fly ? "20 130 0 170 -4 214" : "44 140 32 190 26 226"} L${fly ? 50 : 66} ${fly ? 206 : 214} L100 ${fly ? 222 : 232} L${fly ? 150 : 134} ${fly ? 206 : 214} L${fly ? 204 : 174} ${fly ? 214 : 226} C${fly ? "200 170 180 130 126 100" : "168 190 156 140 126 100"}Z"
      fill="${h.cape}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M86 110 C70 150 64 190 62 214" stroke="#0003" stroke-width="6" fill="none"/>
    <!-- legs and boots -->
    ${limb("M88 156 L84 200", h.suit, 22)}
    ${limb("M112 156 L118 200", h.suit, 22)}
    <path d="M70 196 h28 v20 q0 10 -10 10 h-24 q-8 0 -6 -10z" fill="${boot}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M104 196 h28 l2 20 q0 10 10 10 h-34 q-8 0 -6 -10z" fill="${boot}" stroke="${INK}" stroke-width="4" stroke-linejoin="round" transform="translate(-2 0)"/>
    ${has("speed") ? `<path d="M52 204 h-22 M54 214 h-30 M56 224 h-18" stroke="#fde047" stroke-width="5" stroke-linecap="round"/>` : ""}
    <!-- arm on hip (behind body) -->
    ${limb("M76 106 L56 132 L74 150", h.suit, 18)}
    <circle cx="74" cy="150" r="10" fill="${h.accent}" stroke="${INK}" stroke-width="4"/>
    <!-- body -->
    <path d="M70 100 Q100 88 130 100 L134 150 Q100 164 66 150Z" fill="${h.suit}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M78 104 Q86 100 92 102 L88 140" stroke="#ffffff55" stroke-width="5" fill="none" stroke-linecap="round"/>
    <rect x="66" y="146" width="68" height="13" rx="4" fill="${h.accent}" stroke="${INK}" stroke-width="4"/>
    <rect x="93" y="145" width="14" height="15" rx="3" fill="${h.dark}" stroke="${INK}" stroke-width="3"/>
    <!-- chest emblem -->
    <path d="M100 106 l20 6 v12 q0 15 -20 24 q-20 -9 -20 -24 v-12z" fill="${h.accent}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <text x="100" y="134" text-anchor="middle" font-size="24" font-weight="900" fill="${h.cape}" font-family="Arial" stroke="${INK}" stroke-width="1">${h.emblem}</text>
    <!-- arm with raised fist -->
    ${limb("M126 106 L152 80 L160 46", h.suit, 18)}
    <circle cx="160" cy="42" r="13" fill="${h.accent}" stroke="${INK}" stroke-width="4"/>
    <path d="M152 38 h14 M152 44 h14" stroke="${INK}" stroke-width="2.5"/>
    ${has("jump") ? `<text x="150" y="236" font-size="22">💨</text>` : ""}
    ${heroHead(h, 100, 66, has("night"))}
  </svg>`;
}

// Just the hero's face in a round badge (used next to speech bubbles and on the map).
function heroFaceSVG(hero, size = 70) {
  const h = HEROES[hero];
  return `<svg viewBox="40 14 120 120" width="${size}" height="${size}" class="face-svg">
    <circle cx="100" cy="74" r="56" fill="${h.suit}" stroke="${INK}" stroke-width="5"/>
    <path d="M58 110 Q100 92 142 110 L142 130 L58 130Z" fill="${h.cape}"/>
    ${heroHead(h, 100, 72)}
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
    ${g("walls", `<rect x="85" y="140" width="210" height="90" fill="${h.suit}"/><path d="M85 165 h210 M85 195 h210" stroke-width="2" opacity=".35"/>`)}
    ${g("door", `<rect x="170" y="172" width="40" height="58" rx="18" fill="${h.dark}"/><path d="M190 182 l12 4 v8 q0 9 -12 14 q-12 -5 -12 -14 v-8z" fill="${h.accent}" stroke-width="2.5"/>`)}
    ${g("windows", `<rect x="105" y="158" width="42" height="32" rx="5" fill="#fef08a"/><rect x="233" y="158" width="42" height="32" rx="5" fill="#fef08a"/><path d="M126 158 v32 M254 158 v32" stroke-width="2.5"/>`)}
    ${g("roof", `<path d="M70 142 L190 80 L310 142Z" fill="${h.cape}"/>`)}
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
