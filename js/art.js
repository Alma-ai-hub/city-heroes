// Drawings (SVG): the heroes, the hero base, the robot.

function heroSVG(hero, size = 160, powers = []) {
  const h = HEROES[hero];
  const has = (id) => powers.includes(id);
  return `
  <svg viewBox="0 0 200 220" width="${size}" height="${size * 1.1}" class="hero-svg" aria-label="${h.name}">
    ${has("shield") ? `<circle cx="100" cy="115" r="98" fill="${h.accent}" opacity=".18"/>` : ""}
    ${has("magic") ? `<g fill="#fde047"><text x="18" y="50" font-size="22">✨</text><text x="160" y="70" font-size="20">✨</text></g>` : ""}
    <!-- cape -->
    <path d="M60 95 Q100 80 140 95 L${has("fly") ? 185 : 160} 200 Q100 ${has("fly") ? 185 : 210} ${has("fly") ? 15 : 40} 200 Z" fill="${h.cape}"/>
    <!-- body -->
    <rect x="68" y="98" width="64" height="70" rx="22" fill="${h.suit}"/>
    <circle cx="100" cy="128" r="17" fill="${h.accent}"/>
    <text x="100" y="137" text-anchor="middle" font-size="24" font-weight="900" fill="${h.cape}" font-family="Arial">${h.emblem}</text>
    <!-- legs -->
    <rect x="74" y="160" width="20" height="38" rx="9" fill="${h.cape}"/>
    <rect x="106" y="160" width="20" height="38" rx="9" fill="${h.cape}"/>
    <ellipse cx="84" cy="200" rx="16" ry="9" fill="${has("speed") ? "#facc15" : "#1f2937"}"/>
    <ellipse cx="116" cy="200" rx="16" ry="9" fill="${has("speed") ? "#facc15" : "#1f2937"}"/>
    ${has("speed") ? `<path d="M60 196 h-18 M62 204 h-24" stroke="#facc15" stroke-width="4" stroke-linecap="round"/>` : ""}
    <!-- arms -->
    <rect x="44" y="104" width="22" height="50" rx="11" fill="${h.suit}" transform="rotate(20 55 104)"/>
    <rect x="134" y="104" width="22" height="50" rx="11" fill="${h.suit}" transform="rotate(-20 145 104)"/>
    <!-- head -->
    <circle cx="100" cy="62" r="38" fill="#f8c9a0"/>
    <path d="M62 56 Q66 22 100 22 Q136 22 138 56 Q120 40 100 42 Q78 40 62 56Z" fill="#5b3a1e"/>
    <!-- mask -->
    <path d="M64 58 Q100 46 136 58 L134 74 Q100 66 66 74Z" fill="${h.cape}"/>
    <circle cx="86" cy="64" r="6" fill="#fff"/><circle cx="114" cy="64" r="6" fill="#fff"/>
    <circle cx="87" cy="65" r="3.2" fill="#111"/><circle cx="115" cy="65" r="3.2" fill="#111"/>
    ${has("night") ? `<circle cx="86" cy="64" r="8" fill="none" stroke="#fde047" stroke-width="2"/><circle cx="114" cy="64" r="8" fill="none" stroke="#fde047" stroke-width="2"/>` : ""}
    <path d="M88 82 Q100 92 112 82" stroke="#7a3b1e" stroke-width="4" fill="none" stroke-linecap="round"/>
    ${has("jump") ? `<text x="150" y="215" font-size="22">💨</text>` : ""}
  </svg>`;
}

// The hero base: each part appears once it was earned.
function baseSVG(parts, hero) {
  const h = HEROES[hero];
  const has = (id) => parts.includes(id);
  const ghost = (id) => (has(id) ? "" : `class="ghost"`);
  return `
  <svg viewBox="0 0 400 300" class="base-svg" aria-label="בסיס הגיבורים">
    <rect x="0" y="0" width="400" height="300" fill="#bae6fd"/>
    <circle cx="268" cy="40" r="22" fill="#fde047"/>
    <rect x="0" y="240" width="400" height="60" fill="#86efac"/>
    <g ${ghost("floor")}><rect x="70" y="228" width="240" height="16" rx="4" fill="#92400e"/></g>
    <g ${ghost("walls")}><rect x="85" y="140" width="210" height="90" fill="${h.suit}"/>
      <path d="M85 160 h210 M85 185 h210 M85 210 h210" stroke="#ffffff55" stroke-width="2"/></g>
    <g ${ghost("door")}><rect x="170" y="175" width="40" height="55" rx="18" fill="${h.cape}"/>
      <circle cx="200" cy="205" r="3" fill="${h.accent}"/>
      <text x="190" y="200" text-anchor="middle" font-size="18" font-weight="900" fill="${h.accent}" font-family="Arial">${h.emblem}</text></g>
    <g ${ghost("windows")}><rect x="105" y="160" width="40" height="32" rx="5" fill="#e0f2fe" stroke="#fff" stroke-width="3"/>
      <rect x="235" y="160" width="40" height="32" rx="5" fill="#e0f2fe" stroke="#fff" stroke-width="3"/></g>
    <g ${ghost("roof")}><path d="M70 142 L190 80 L310 142Z" fill="${h.cape}"/></g>
    <g ${ghost("flag")}><rect x="188" y="40" width="4" height="44" fill="#475569"/>
      <path d="M192 42 L226 52 L192 62Z" fill="${h.accent}"/></g>
    <g ${ghost("tower")}><rect x="300" y="100" width="34" height="130" fill="#64748b"/>
      <rect x="294" y="90" width="46" height="16" fill="#475569"/>
      <rect x="309" y="120" width="16" height="16" fill="#e0f2fe"/></g>
    <g ${ghost("antenna")}><rect x="315" y="55" width="4" height="36" fill="#475569"/>
      <circle cx="317" cy="52" r="7" fill="#ef4444"/></g>
    <g ${ghost("garden")}><text x="20" y="265" font-size="26">🌻</text><text x="48" y="270" font-size="22">🌷</text><text x="345" y="270" font-size="24">🌼</text></g>
    <g ${ghost("lamp")}><rect x="40" y="170" width="5" height="70" fill="#334155"/>
      <circle cx="42" cy="166" r="10" fill="#fde047"/>
      <path d="M42 166 L10 60 L80 60Z" fill="#fde04733"/></g>
    <g ${ghost("pad")}><ellipse cx="200" cy="275" rx="60" ry="12" fill="#334155"/>
      <text x="200" y="281" text-anchor="middle" font-size="14" font-weight="900" fill="#fff" font-family="Arial">H</text></g>
    <g ${ghost("rocket")}><text x="355" y="140" font-size="40">🚀</text></g>
  </svg>`;
}

// Robot that gets sleepier with every right answer (hp goes 5 → 0).
function robotSVG(hp, max) {
  const asleep = hp <= 0;
  const eye = asleep
    ? `<path d="M70 70 q10 8 20 0 M110 70 q10 8 20 0" stroke="#0f172a" stroke-width="5" fill="none" stroke-linecap="round"/>`
    : `<circle cx="80" cy="70" r="10" fill="#ef4444"/><circle cx="120" cy="70" r="10" fill="#ef4444"/>`;
  const bars = Array.from({ length: max }, (_, i) =>
    `<rect x="${52 + i * 20}" y="18" width="16" height="10" rx="3" fill="${i < hp ? "#22c55e" : "#cbd5e1"}"/>`).join("");
  return `
  <svg viewBox="0 0 200 200" class="robot-svg ${asleep ? "asleep" : ""}" aria-label="רובוט">
    ${bars}
    <rect x="96" y="30" width="8" height="18" fill="#64748b"/>
    <circle cx="100" cy="30" r="7" fill="${asleep ? "#94a3b8" : "#f59e0b"}"/>
    <rect x="45" y="45" width="110" height="60" rx="16" fill="#94a3b8"/>
    ${eye}
    <rect x="80" y="88" width="40" height="7" rx="3" fill="#475569"/>
    <rect x="55" y="110" width="90" height="70" rx="14" fill="#a8b5c7"/>
    <circle cx="100" cy="140" r="12" fill="${asleep ? "#64748b" : "#38bdf8"}"/>
    <rect x="25" y="115" width="24" height="50" rx="10" fill="#94a3b8"/>
    <rect x="151" y="115" width="24" height="50" rx="10" fill="#94a3b8"/>
    ${asleep ? `<text x="150" y="45" font-size="26" font-weight="900" fill="#6366f1">Z z</text>` : ""}
  </svg>`;
}
