// The city map: a big map of 6 neighborhoods (plus Dr. Balagan's fortress), and a screen
// for each neighborhood with its 5 places. The hero walks along the roads.

// A smooth line through points (so the road passes exactly through every place).
function smoothPath(pts) {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(0)} ${c1[1].toFixed(0)} ${c2[0].toFixed(0)} ${c2[1].toFixed(0)} ${p2[0]} ${p2[1]}`;
  }
  return d;
}
const K = `stroke="${INK}" stroke-width="4" stroke-linejoin="round"`;

function tree(x, y, s = 1, c = "#16a34a") {
  return `<g transform="translate(${x} ${y}) scale(${s})" ${K}>
    <rect x="-6" y="-6" width="12" height="30" fill="#92400e"/>
    <circle cx="0" cy="-26" r="26" fill="${c}"/><circle cx="-10" cy="-32" r="7" fill="#ffffff44" stroke="none"/></g>`;
}
function house(x, y, wall, roof) {
  return `<g transform="translate(${x} ${y})" ${K}>
    <rect x="-28" y="-30" width="56" height="44" fill="${wall}"/>
    <path d="M-36 -28 L0 -60 L36 -28Z" fill="${roof}"/>
    <rect x="-8" y="-6" width="16" height="20" fill="#78350f"/>
    <rect x="-22" y="-22" width="10" height="10" fill="#fef08a" stroke-width="2.5"/><rect x="12" y="-22" width="10" height="10" fill="#fef08a" stroke-width="2.5"/></g>`;
}
function tower(x, y, w, h, c) {
  let win = "";
  for (let yy = y - h + 14; yy < y - 14; yy += 22)
    for (let xx = x - w / 2 + 8; xx < x + w / 2 - 12; xx += 18)
      win += `<rect x="${xx}" y="${yy}" width="10" height="12" fill="${Math.random() < 0.7 ? "#fef08a" : "#1e293b"}" stroke="none"/>`;
  return `<g ${K}><rect x="${x - w / 2}" y="${y - h}" width="${w}" height="${h}" fill="${c}"/></g>${win}`;
}
function cloud(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})" ${K} fill="#fff">
    <path d="M-60 10 Q-70 -14 -40 -16 Q-34 -44 -4 -36 Q14 -56 38 -34 Q70 -36 62 -6 Q80 8 56 14Z"/></g>`;
}

// ---------- the places ----------
const PLACE_ART = {
  letters: () => `
    <g ${K}>
      <rect x="-95" y="38" width="190" height="16" fill="#d6d3d1"/><rect x="-82" y="26" width="164" height="14" fill="#e7e5e4"/>
      <rect x="-75" y="-40" width="150" height="68" fill="#fde68a"/>
      ${[-60, -28, 14, 46].map((x) => `<rect x="${x}" y="-36" width="14" height="62" fill="#fff"/>`).join("")}
      <path d="M-92 -40 L0 -92 L92 -40Z" fill="#f59e0b"/>
      <circle cx="0" cy="-58" r="12" fill="#fff"/>
      <rect x="-10" y="-2" width="20" height="28" rx="9" fill="#92400e"/>
    </g>
    <g font-family="Arial" font-weight="900" font-size="38" fill="#fff" stroke="${INK}" stroke-width="3" class="floaty">
      <text x="-80" y="-98">א</text><text x="58" y="-108">ב</text><text x="-12" y="-122">ג</text></g>`,
  reading: () => `
    <ellipse cx="0" cy="34" rx="110" ry="30" fill="#15803d" ${K}/>
    ${tree(-68, 18, 1.1)}${tree(74, 26, 0.9, "#22c55e")}
    <g ${K}>
      <rect x="-5" y="-78" width="10" height="112" fill="#92400e"/>
      <path d="M-6 -82 h66 l14 14 l-14 14 h-66z" fill="#fff"/>
      <path d="M6 -48 h-64 l-14 14 l14 14 h64z" fill="#fde047"/>
    </g>
    <text x="28" y="-60" text-anchor="middle" font-size="22" font-weight="900" fill="${INK}" font-family="Arial">כדור</text>
    <text x="-30" y="-27" text-anchor="middle" font-size="22" font-weight="900" fill="${INK}" font-family="Arial">צב</text>`,
  writing: () => `
    <g ${K}>
      <rect x="-82" y="-30" width="150" height="72" fill="#93c5fd"/>
      <path d="M-82 -30 L-82 -64 L-44 -30 L-44 -64 L-6 -30 L-6 -64 L32 -30 L32 -64 L68 -30Z" fill="#1d4ed8"/>
      <rect x="-24" y="4" width="40" height="38" fill="#1e3a8a"/>
      <rect x="-70" y="-14" width="30" height="22" fill="#fef08a"/>
      <g transform="translate(86 -6) rotate(-25)">
        <rect x="-11" y="-80" width="22" height="96" fill="#facc15"/>
        <rect x="-11" y="-96" width="22" height="18" fill="#f472b6"/>
        <path d="M-11 16 L0 40 L11 16Z" fill="#fde68a"/><path d="M-4 31 L0 40 L4 31Z" fill="${INK}"/>
      </g>
    </g>`,
  zoo: () => `
    <g ${K}>
      <rect x="-104" y="12" width="208" height="30" fill="#a16207"/>
      ${[-90, -70, 50, 70, 90].map((x) => `<path d="M${x} 12 v30" />`).join("")}
      <path d="M-66 42 V-30 Q0 -96 66 -30 V42 H44 V-22 Q0 -66 -44 -22 V42Z" fill="#ea580c"/>
      <rect x="-48" y="-84" width="96" height="30" rx="8" fill="#fff"/>
    </g>
    <text x="0" y="-62" text-anchor="middle" font-size="22" font-weight="900" fill="${INK}" font-family="Arial">גן חיות</text>
    <text x="-20" y="34" font-size="58">🦒</text><text x="70" y="0" font-size="44">🐘</text>`,
  numbers: () => `
    <g ${K}>
      <path d="M-130 16 Q0 -54 130 16 L130 40 Q0 -24 -130 40Z" fill="#a8a29e"/>
      <path d="M-130 8 Q0 -62 130 8" fill="none" stroke-width="5"/>
      ${[-96, -60, -24, 12, 48, 84].map((x, i) => `<path d="M${x} ${-10 - Math.sin(((i + 1) / 7) * Math.PI) * 30} v18" />`).join("")}
      <rect x="-20" y="-104" width="40" height="34" rx="8" fill="#94a3b8"/>
      <rect x="-26" y="-70" width="52" height="42" rx="8" fill="#a8b5c7"/>
      <circle cx="-8" cy="-88" r="6" fill="#ef4444"/><circle cx="8" cy="-88" r="6" fill="#ef4444"/>
      <path d="M0 -104 v-12" /><circle cx="0" cy="-118" r="5" fill="#f59e0b"/>
    </g>`,
  market: () => {
    const stall = (x, c) => `
      <g transform="translate(${x} 0)" ${K}>
        <rect x="-34" y="-30" width="6" height="64" fill="#78350f"/><rect x="28" y="-30" width="6" height="64" fill="#78350f"/>
        <rect x="-38" y="6" width="76" height="30" fill="#fde68a"/>
        <path d="M-44 -30 L-34 -62 H34 L44 -30 Q33 -18 22 -30 Q11 -18 0 -30 Q-11 -18 -22 -30 Q-33 -18 -44 -30Z" fill="${c}"/>
        <path d="M-12 -62 L-16 -28 M12 -62 L16 -28" stroke="#fff" stroke-width="7"/>
      </g>`;
    return `${stall(-80, "#e11d48")}${stall(0, "#16a34a")}${stall(80, "#f59e0b")}
      <g font-size="24"><text x="-108" y="6">🍎🍌</text><text x="-28" y="6">🍉🍇</text><text x="52" y="6">🥕🍊</text></g>`;
  },
  train: () => `
    <g ${K}>
      <rect x="-100" y="-40" width="120" height="78" fill="#67e8f9"/>
      <path d="M-112 -40 L-40 -84 L32 -40Z" fill="#0e7490"/>
      <circle cx="-40" cy="-52" r="15" fill="#fff"/><path d="M-40 -52 v-9 M-40 -52 h7" stroke-width="3"/>
      <rect x="-60" y="-8" width="40" height="46" fill="#155e75"/>
      <path d="M-130 54 H140" stroke-width="5"/>
      ${[-120, -90, -60, -30, 0, 30, 60, 90, 120].map((x) => `<path d="M${x} 46 v16" stroke-width="5"/>`).join("")}
      <rect x="30" y="-20" width="72" height="56" rx="6" fill="#ef4444"/>
      <rect x="40" y="-10" width="26" height="20" fill="#bae6fd"/>
      <rect x="84" y="-46" width="16" height="28" fill="#334155"/>
      <circle cx="48" cy="44" r="12" fill="#334155"/><circle cx="86" cy="44" r="12" fill="#334155"/>
    </g>
    <g class="smoke" fill="#e5e7eb" stroke="${INK}" stroke-width="3"><circle cx="96" cy="-62" r="10"/><circle cx="108" cy="-82" r="14"/></g>`,
  space: () => `
    <g ${K}>
      <rect x="-110" y="34" width="220" height="20" fill="#475569"/>
      <rect x="34" y="-120" width="26" height="156" fill="#94a3b8"/>
      ${[-104, -76, -48, -20, 8].map((y) => `<path d="M34 ${y} l26 26 M60 ${y} l-26 26" stroke-width="2.5"/>`).join("")}
      <path d="M-14 -130 Q12 -96 10 -10 H-38 Q-40 -96 -14 -130Z" fill="#f8fafc"/>
      <circle cx="-14" cy="-70" r="11" fill="#38bdf8"/>
      <path d="M-38 -34 L-58 20 L-36 6Z M10 -34 L30 20 L8 6Z" fill="#ef4444"/>
      <path d="M-30 -10 L-24 24 L-4 24 L2 -10Z" fill="#ef4444"/>
      <g transform="translate(-82 0)"><path d="M0 34 v-30" stroke-width="5"/><path d="M-26 -6 Q0 30 26 -6Z" fill="#cbd5e1" transform="rotate(-25)"/></g>
    </g>
    <g class="flame"><path d="M-26 26 Q-14 64 -2 26Z" fill="#fb923c" stroke="${INK}" stroke-width="3"/></g>`,
  fortress: () => `
    <ellipse cx="0" cy="40" rx="140" ry="40" fill="#3b0764" ${K}/>
    <g ${K}>
      <rect x="-70" y="-50" width="140" height="90" fill="#6d28d9"/>
      <rect x="-104" y="-96" width="44" height="136" fill="#5b21b6"/><rect x="60" y="-96" width="44" height="136" fill="#5b21b6"/>
      <path d="M-110 -96 L-82 -140 L-54 -96Z M54 -96 L82 -140 L110 -96Z" fill="#a3e635"/>
      <path d="M-70 -50 v-14 h18 v14 h16 v-14 h18 v14 h16 v-14 h18 v14 h16 v-14 h18 v14" fill="#6d28d9"/>
      <path d="M-24 40 V2 Q0 -26 24 2 V40Z" fill="#1e1b4b"/>
      <rect x="-90" y="-66" width="16" height="22" fill="#a3e635"/><rect x="74" y="-66" width="16" height="22" fill="#a3e635"/>
      <circle cx="0" cy="-30" r="14" fill="#a3e635"/>
      <path d="M120 -150 L100 -112 L116 -112 L94 -70 L134 -122 L118 -122 L136 -150Z" fill="#facc15"/>
    </g>
    <text x="0" y="-24" text-anchor="middle" font-size="18" font-weight="900" fill="#3b0764" font-family="Arial">@</text>`,
};

// ---------- drawings of the newer places ----------
Object.assign(PLACE_ART, {
  numbers: () => `
    <path d="M-150 30 Q0 50 150 30 L150 60 Q0 76 -150 60Z" fill="#38bdf8" ${K}/>
    <path d="M-120 46 h30 M-30 52 h40 M70 48 h30" stroke="#e0f2fe" stroke-width="4" stroke-linecap="round"/>
    <g ${K}>
      <path d="M-130 16 Q0 -54 130 16 L130 40 Q0 -24 -130 40Z" fill="#a8a29e"/>
      <path d="M-130 8 Q0 -62 130 8" fill="none" stroke-width="5"/>
      ${[-96, -60, -24, 12, 48, 84].map((x, i) => `<path d="M${x} ${-10 - Math.sin(((i + 1) / 7) * Math.PI) * 30} v18" />`).join("")}
      <rect x="-20" y="-104" width="40" height="34" rx="8" fill="#94a3b8"/>
      <rect x="-26" y="-70" width="52" height="42" rx="8" fill="#a8b5c7"/>
      <circle cx="-8" cy="-88" r="6" fill="#ef4444"/><circle cx="8" cy="-88" r="6" fill="#ef4444"/>
      <path d="M0 -104 v-12" /><circle cx="0" cy="-118" r="5" fill="#f59e0b"/>
    </g>`,
  circus: () => `
    <g ${K}>
      <path d="M-100 44 L-92 -20 L92 -20 L100 44Z" fill="#fff"/>
      ${[-70, -30, 10, 50].map((x) => `<path d="M${x} -20 L${x - 6} 44 L${x + 14} 44 L${x + 20} -20Z" fill="#ef4444" stroke="none"/>`).join("")}
      <path d="M-100 44 L-92 -20 L92 -20 L100 44Z" fill="none"/>
      <path d="M-104 -16 L0 -96 L104 -16Z" fill="#ef4444"/>
      <path d="M-60 -48 L0 -96 L-20 -20 M60 -48 L0 -96 L20 -20" fill="none" stroke-width="3"/>
      <path d="M-104 -16 Q-78 0 -52 -16 Q-26 0 0 -16 Q26 0 52 -16 Q78 0 104 -16" fill="#facc15"/>
      <path d="M-20 44 V8 Q0 -8 20 8 V44Z" fill="#7c2d12"/>
      <path d="M0 -96 V-124" stroke-width="4"/><path d="M0 -124 L26 -116 L0 -108Z" fill="#facc15"/>
    </g>
    <g class="floaty">${[[-118, -70, "#3b82f6"], [116, -84, "#22c55e"], [96, -40, "#a855f7"]].map(([x, y, c]) => `<path d="M${x} ${y + 26} q-4 14 4 26" stroke="${INK}" stroke-width="2" fill="none"/><ellipse cx="${x}" cy="${y}" rx="17" ry="21" fill="${c}" ${K}/>`).join("")}</g>`,
  bakery: () => `
    <g ${K}>
      <rect x="-86" y="-20" width="172" height="64" fill="#fef3c7"/>
      <path d="M-96 -20 L-86 -48 H86 L96 -20 Q84 -8 72 -20 Q60 -8 48 -20 Q36 -8 24 -20 Q12 -8 0 -20 Q-12 -8 -24 -20 Q-36 -8 -48 -20 Q-60 -8 -72 -20 Q-84 -8 -96 -20Z" fill="#f472b6"/>
      <rect x="-70" y="0" width="50" height="34" fill="#bae6fd"/><rect x="20" y="0" width="34" height="44" fill="#92400e"/>
      <rect x="-50" y="-96" width="100" height="34" rx="8" fill="#f9a8d4"/>
      <rect x="-36" y="-122" width="72" height="28" rx="7" fill="#fde68a"/>
      <rect x="-4" y="-142" width="8" height="20" fill="#60a5fa"/>
    </g>
    <path d="M0 -158 C6 -150 6 -142 0 -142 C-6 -142 -6 -150 0 -158Z" fill="#fb923c" stroke="${INK}" stroke-width="2.5" class="flame"/>
    <text x="-62" y="26" font-size="22">🧁🍩</text>`,
  treasure: () => `
    <ellipse cx="0" cy="34" rx="150" ry="46" fill="#38bdf8" ${K}/>
    <ellipse cx="0" cy="28" rx="118" ry="32" fill="#fde68a" ${K}/>
    <g ${K}>
      <path d="M-60 26 Q-66 -40 -48 -90" fill="none" stroke="#92400e" stroke-width="12"/>
      <path d="M-60 26 Q-66 -40 -48 -90" fill="none" stroke-width="0"/>
      <path d="M-48 -90 Q-90 -100 -110 -70 Q-80 -84 -48 -90Z M-48 -90 Q-20 -120 14 -104 Q-20 -100 -48 -90Z M-48 -90 Q-60 -130 -90 -130 Q-64 -112 -48 -90Z M-48 -90 Q-10 -84 2 -60 Q-26 -78 -48 -90Z" fill="#22c55e"/>
      <rect x="10" y="-26" width="76" height="46" rx="6" fill="#b45309"/>
      <path d="M10 -26 Q48 -60 86 -26Z" fill="#d97706"/>
      <rect x="40" y="-30" width="16" height="22" fill="#facc15"/>
    </g>
    <text x="10" y="-30" font-size="22">✨</text>
    <path d="M-20 14 l16 14 M-4 14 l-16 14" stroke="#dc2626" stroke-width="6" stroke-linecap="round"/>`,
  underwater: () => `
    <ellipse cx="0" cy="10" rx="140" ry="80" fill="#0ea5e9" ${K}/>
    <path d="M-120 -20 q20 -12 40 0 t40 0 t40 0 t40 0 t40 0" stroke="#e0f2fe" stroke-width="5" fill="none" stroke-linecap="round"/>
    <g ${K}><path d="M-90 60 Q-96 20 -80 -4 M-80 60 Q-70 30 -60 16" fill="none" stroke="#f472b6" stroke-width="8"/>
      <path d="M70 62 Q80 24 96 10 M84 62 Q100 40 112 34" fill="none" stroke="#fb923c" stroke-width="8"/>
      <path d="M-30 50 a30 22 0 0 1 60 0Z" fill="#a5f3fc"/></g>
    <text x="-56" y="10" font-size="36" class="floaty">🐠</text><text x="22" y="-14" font-size="30" class="floaty">🐟</text><text x="40" y="44" font-size="26">🐙</text>`,
  music: () => `
    <g ${K}>
      <rect x="-90" y="-30" width="180" height="74" fill="#f5d0fe"/>
      <path d="M-104 -30 Q0 -110 104 -30Z" fill="#c026d3"/>
      ${[-60, -20, 20, 60].map((x) => `<rect x="${x - 7}" y="-24" width="14" height="66" fill="#fff"/>`).join("")}
      <ellipse cx="0" cy="40" rx="34" ry="10" fill="#b91c1c"/><rect x="-34" y="12" width="68" height="28" fill="#ef4444" stroke="none"/>
      <ellipse cx="0" cy="12" rx="34" ry="10" fill="#fef3c7"/><path d="M-34 12 V40 M34 12 V40"/>
    </g>
    <g class="floaty" font-size="30" fill="${INK}"><text x="-110" y="-70">♪</text><text x="76" y="-90">♫</text><text x="-20" y="-96">♩</text></g>`,
  lab: () => `
    <g ${K}>
      <rect x="-80" y="-36" width="160" height="80" fill="#e0f2fe"/>
      <rect x="-90" y="-50" width="180" height="18" fill="#0ea5e9"/>
      <rect x="-60" y="-14" width="34" height="28" fill="#fef08a"/><rect x="26" y="-14" width="34" height="28" fill="#fef08a"/>
      <rect x="-14" y="6" width="28" height="38" fill="#0369a1"/>
      <path d="M-14 -140 h28 v30 l30 54 q6 12 -8 12 h-72 q-14 0 -8 -12 l30 -54z" fill="#fff"/>
      <path d="M-34 -80 h68 l12 22 q6 12 -8 12 h-76 q-14 0 -8 -12z" fill="#4ade80"/>
    </g>
    <g class="floaty" fill="#bbf7d0" stroke="${INK}" stroke-width="2.5"><circle cx="-6" cy="-150" r="7"/><circle cx="10" cy="-166" r="5"/></g>`,
  forest: () => `
    <ellipse cx="0" cy="40" rx="140" ry="34" fill="#14532d" ${K}/>
    ${tree(-80, 30, 1.4, "#15803d")}${tree(80, 30, 1.3, "#166534")}${tree(0, 10, 1.7, "#22c55e")}
    <g font-family="Arial" font-weight="900" font-size="26" fill="#fde047" stroke="${INK}" stroke-width="2.5"><text x="-8" y="0">ל</text><text x="-88" y="20">ו</text><text x="72" y="20">ד</text></g>
    <g ${K}><path d="M100 40 q14 -24 28 0z" fill="#ef4444"/><rect x="110" y="40" width="8" height="12" fill="#fff"/></g>`,
  fire: () => `
    <g ${K}>
      <rect x="-96" y="-40" width="150" height="84" fill="#ef4444"/>
      <path d="M-104 -40 h166 l-10 -22 h-146z" fill="#7f1d1d"/>
      <rect x="-82" y="-14" width="60" height="58" fill="#fee2e2"/>
      ${[0, 1, 2, 3].map((i) => `<path d="M-82 ${-2 + i * 14} h60" stroke-width="2.5"/>`).join("")}
      <rect x="-6" y="-24" width="44" height="28" fill="#fef08a"/>
      <rect x="54" y="-100" width="30" height="144" fill="#b91c1c"/>
      <rect x="48" y="-110" width="42" height="14" fill="#7f1d1d"/>
      <circle cx="69" cy="-74" r="10" fill="#facc15"/>
      <rect x="90" y="4" width="70" height="40" rx="6" fill="#dc2626"/><rect x="96" y="-16" width="30" height="24" rx="4" fill="#bae6fd"/>
      <circle cx="104" cy="46" r="10" fill="#334155"/><circle cx="146" cy="46" r="10" fill="#334155"/>
      <path d="M130 -2 l30 -20" stroke-width="5"/>
    </g>`,
  stadium: () => `
    <g ${K}>
      <ellipse cx="0" cy="10" rx="130" ry="56" fill="#cbd5e1"/>
      <ellipse cx="0" cy="12" rx="96" ry="36" fill="#22c55e"/>
      <path d="M0 -24 V48" stroke="#fff" stroke-width="3"/><circle cx="0" cy="12" r="12" fill="none" stroke="#fff" stroke-width="3"/>
      <rect x="-122" y="-90" width="8" height="70" fill="#64748b"/><rect x="114" y="-90" width="8" height="70" fill="#64748b"/>
      <rect x="-134" y="-104" width="32" height="18" fill="#fef08a"/><rect x="102" y="-104" width="32" height="18" fill="#fef08a"/>
    </g>
    <path d="M-118 -86 L-60 -20 L-140 -20Z M118 -86 L60 -20 L140 -20Z" fill="#fef08a55"/>
    <text x="-14" y="22" font-size="24">⚽</text>`,
  dragon: () => `
    <g ${K}>
      <path d="M-140 50 L-90 -60 L-40 -30 L0 -110 L60 -40 L100 -70 L150 50Z" fill="#78716c"/>
      <path d="M-90 -60 L-70 -40 M0 -110 L14 -80 M100 -70 L110 -50" stroke="#fff" stroke-width="5"/>
      <path d="M-40 50 V0 Q0 -50 40 0 V50Z" fill="#1c1917"/>
    </g>
    <g transform="translate(0 6) scale(.42)">${dragonSVG(5, 0).replace(/<svg[^>]*>/, "<g transform='translate(-100 -110)'>").replace("</svg>", "</g>")}</g>`,
  studio: () => `
    <g ${K}>
      <path d="M-50 50 L-20 -80 M50 50 L20 -80 M0 50 L0 -20" stroke="#92400e" stroke-width="7"/>
      <rect x="-70" y="-110" width="140" height="100" fill="#fff"/>
      <path d="M-60 -30 Q-20 -100 20 -60 T60 -90" fill="none" stroke="#3b82f6" stroke-width="8"/>
      <circle cx="-30" cy="-80" r="16" fill="#facc15"/>
      <path d="M-20 -26 L10 -60 L40 -26Z" fill="#22c55e"/>
      <path d="M70 20 q50 -30 60 10 q4 26 -24 22 q-10 -2 -10 10 q-6 16 -26 -6z" fill="#fde68a"/>
    </g>
    <g stroke="${INK}" stroke-width="2.5"><circle cx="92" cy="18" r="6" fill="#ef4444"/><circle cx="110" cy="14" r="6" fill="#3b82f6"/><circle cx="118" cy="30" r="6" fill="#22c55e"/></g>`,
  ice: () => `
    <ellipse cx="0" cy="40" rx="150" ry="40" fill="#f0f9ff" ${K}/>
    <g ${K}>
      <rect x="-70" y="-40" width="140" height="80" fill="#bae6fd"/>
      <rect x="-100" y="-90" width="40" height="130" fill="#7dd3fc"/><rect x="60" y="-90" width="40" height="130" fill="#7dd3fc"/>
      <path d="M-106 -90 L-80 -136 L-54 -90Z M54 -90 L80 -136 L106 -90Z M-30 -40 L0 -90 L30 -40Z" fill="#e0f2fe"/>
      <path d="M-20 40 V6 Q0 -16 20 6 V40Z" fill="#0369a1"/>
      <path d="M-60 -30 l14 20 M40 -30 l14 20" stroke="#fff" stroke-width="4"/>
    </g>
    <g class="floaty" font-size="22"><text x="-130" y="-60">❄️</text><text x="110" y="-120">❄️</text></g>`,
});


// ---------- drawings of the 10 newest places ----------
Object.assign(PLACE_ART, {
  monster: () => `
    <g ${K}>
      <path d="M-130 50 Q-120 -80 0 -110 Q120 -80 130 50Z" fill="#57534e"/>
      <path d="M-56 50 V0 Q0 -60 56 0 V50Z" fill="#1c1917"/>
    </g>
    <g transform="translate(0 18) scale(.42)">${monsterSVG(5, 0).replace(/<svg[^>]*>/, "<g transform='translate(-110 -110)'>").replace("</svg>", "</g>")}</g>
    <text x="70" y="40" font-size="28">🍪</text>`,
  maze: () => `
    <g ${K}>
      <rect x="-110" y="-70" width="220" height="120" rx="10" fill="#bbf7d0"/>
      <path d="M-110 -40 H40 M-80 -10 H110 M-110 20 H20 M60 20 V50 M-20 -70 V-40 M80 -40 V-10" stroke="#166534" stroke-width="12" stroke-linecap="round"/>
    </g>
    <text x="-100" y="44" font-size="26">🐾</text><text x="80" y="-46" font-size="26">🏁</text>`,
  farm: () => `
    <g ${K}>
      <rect x="-90" y="-40" width="120" height="84" fill="#dc2626"/>
      <path d="M-100 -40 L-30 -96 L40 -40Z" fill="#991b1b"/>
      <path d="M-50 44 V0 H10 V44Z M-50 0 L10 44 M10 0 L-50 44" fill="#fef3c7" stroke-width="3"/>
      <circle cx="-30" cy="-58" r="12" fill="#fef3c7"/>
      <path d="M60 44 V-10 Q80 -30 100 -10 V44Z" fill="#facc15"/>
      <path d="M50 44 H140" stroke-width="5"/>
    </g>
    <text x="70" y="36" font-size="30">🐄</text><text x="-120" y="40" font-size="26">🧺</text>`,
  post: () => `
    <g ${K}>
      <rect x="-90" y="-40" width="150" height="84" fill="#fecaca"/>
      <path d="M-100 -40 h170 l-12 -24 h-146z" fill="#b91c1c"/>
      <rect x="-70" y="-14" width="44" height="30" fill="#bae6fd"/><rect x="0" y="0" width="34" height="44" fill="#7f1d1d"/>
      <rect x="80" y="-20" width="44" height="64" rx="20" fill="#ef4444"/><rect x="88" y="0" width="28" height="8" fill="#111"/>
      <rect x="98" y="44" width="8" height="12" fill="#334155"/>
    </g>
    <g class="floaty" font-size="26"><text x="-40" y="-80">✉️</text><text x="40" y="-100">✉️</text></g>`,
  lunapark: () => `
    <g ${K}>
      <circle cx="0" cy="-40" r="80" fill="none" stroke-width="6"/>
      ${Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return `<path d="M0 -40 L${(80 * Math.cos(a)).toFixed(0)} ${(-40 + 80 * Math.sin(a)).toFixed(0)}" stroke-width="3"/><circle cx="${(80 * Math.cos(a)).toFixed(0)}" cy="${(-40 + 80 * Math.sin(a)).toFixed(0)}" r="13" fill="${["#ef4444", "#3b82f6", "#22c55e", "#f59e0b"][i % 4]}"/>`; }).join("")}
      <path d="M-40 50 L0 -40 L40 50" fill="none" stroke-width="7"/>
      <circle cx="0" cy="-40" r="10" fill="#facc15"/>
    </g>`,
  shapes: () => `
    <g ${K}>
      <rect x="-110" y="-20" width="80" height="70" fill="#3b82f6"/>
      <path d="M-20 50 L30 -60 L80 50Z" fill="#facc15"/>
      <circle cx="96" cy="10" r="38" fill="#ef4444"/>
      <path d="M-70 -40 L-60 -70 L-30 -70 L-55 -88 L-45 -118 L-70 -100 L-95 -118 L-85 -88 L-110 -70 L-80 -70Z" fill="#22c55e"/>
    </g>`,
  giants: () => `
    <g ${K}>
      <rect x="-100" y="-30" width="200" height="76" fill="#fde68a"/>
      <path d="M-110 -30 L0 -100 L110 -30Z" fill="#a16207"/>
      <rect x="-20" y="4" width="40" height="42" fill="#78350f"/>
      <g transform="translate(70 -10) rotate(-15)"><rect x="-8" y="-90" width="16" height="110" fill="#facc15"/><path d="M-8 -90 h16" stroke-width="3"/>
        ${[0, 1, 2, 3, 4].map((i) => `<path d="M-8 ${-80 + i * 20} h8" stroke-width="2.5"/>`).join("")}</g>
    </g>
    <text x="-110" y="40" font-size="40">🐘</text><text x="-60" y="40" font-size="18">🐭</text>`,
  magic: () => `
    <g ${K}>
      <rect x="-80" y="-40" width="160" height="84" fill="#ddd6fe"/>
      <path d="M-96 -40 L-60 -90 L-24 -40Z M24 -40 L60 -90 L96 -40Z" fill="#7c3aed"/>
      <path d="M-30 -40 L0 -120 L30 -40Z" fill="#8b5cf6"/>
      <path d="M-20 44 V4 Q0 -14 20 4 V44Z" fill="#4c1d95"/>
      <circle cx="-56" cy="-4" r="12" fill="#fef08a"/><circle cx="56" cy="-4" r="12" fill="#fef08a"/>
    </g>
    <g class="floaty" font-size="22"><text x="-110" y="-70">✨</text><text x="80" y="-110">⭐</text><text x="-10" y="-130">✨</text></g>`,
  fishing: () => `
    <ellipse cx="0" cy="10" rx="140" ry="70" fill="#38bdf8" ${K}/>
    <path d="M-110 -10 q20 -10 40 0 t40 0 t40 0 t40 0 t40 0" stroke="#e0f2fe" stroke-width="5" fill="none"/>
    <g ${K}><path d="M-60 -20 h90 l-16 30 h-60z" fill="#b45309"/><path d="M20 -20 L90 -110" stroke-width="5"/><path d="M90 -110 L110 0" stroke-width="2"/></g>
    <text x="-20" y="-24" font-size="36">🧑‍🦱</text><text x="96" y="30" font-size="26" class="floaty">🐟</text><text x="-110" y="40" font-size="24" class="floaty">🐠</text>`,
  meteors: () => `
    <ellipse cx="0" cy="30" rx="130" ry="40" fill="#1e1b4b" ${K}/>
    <g ${K}><circle cx="0" cy="-30" r="48" fill="#6366f1"/><ellipse cx="0" cy="-30" rx="80" ry="16" fill="none" stroke="#fde047" stroke-width="6"/></g>
    <g class="floaty">${[[-100, -100], [70, -120], [110, -50]].map(([x, y]) => `<path d="M${x} ${y} l-30 -30" stroke="#fb923c" stroke-width="8" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="14" fill="#a8a29e" ${K}/>`).join("")}</g>`,
});

// ===================== The big city map (6 neighborhoods) =====================
const WORLD_W = 1600, WORLD_H = 1000;
const HOOD_AT = {
  town: [1250, 770], harbor: [810, 800], woods: [360, 700], downtown: [360, 330], fun: [810, 450], edge: [1250, 340],
};
const FORTRESS_SPOT = [810, 140];

function hoodArt(id) {
  const g = (inner) => `<g ${K}>${inner}</g>`;
  switch (id) {
    case "town": return `${house(-90, 20, "#fef3c7", "#f59e0b")}${house(-20, 0, "#fecaca", "#b91c1c")}${house(60, 24, "#e0f2fe", "#2563eb")}${tree(120, 30, .8)}
      <g font-family="Arial" font-weight="900" font-size="34" fill="#fff" stroke="${INK}" stroke-width="3" class="floaty"><text x="-70" y="-70">א</text><text x="20" y="-90">ב</text><text x="90" y="-60">ג</text></g>`;
    case "harbor": return `${g(`<path d="M-140 30 Q0 60 140 30 V70 H-140Z" fill="#38bdf8"/><rect x="60" y="-110" width="30" height="130" fill="#fff"/><path d="M60 -80 h30 M60 -40 h30" stroke="#ef4444" stroke-width="12"/><rect x="54" y="-130" width="42" height="22" fill="#facc15"/>
      <path d="M-110 20 h90 l-14 24 h-62z" fill="#b45309"/><path d="M-66 20 V-60 L-20 10Z" fill="#fff"/>`)}<text x="-10" y="60" font-size="24">⚓</text>`;
    case "woods": return `${tree(-80, 20, 1.3, "#15803d")}${tree(0, 0, 1.6, "#166534")}${tree(80, 24, 1.2, "#22c55e")}<text x="-30" y="50" font-size="30">🐉</text><text x="40" y="54" font-size="22">🍄</text>`;
    case "downtown": return `${tower(-80, 50, 50, 150, "#475569")}${tower(-20, 50, 56, 200, "#334155")}${tower(46, 50, 50, 130, "#64748b")}${tower(100, 50, 40, 170, "#1e293b")}`;
    case "fun": return `<g ${K}><circle cx="-40" cy="-30" r="70" fill="none" stroke-width="6"/>${Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return `<circle cx="${(-40 + 70 * Math.cos(a)).toFixed(0)}" cy="${(-30 + 70 * Math.sin(a)).toFixed(0)}" r="11" fill="${["#ef4444", "#3b82f6", "#22c55e", "#f59e0b"][i % 4]}"/>`; }).join("")}
      <path d="M-80 50 L-40 -30 L0 50" fill="none" stroke-width="6"/><path d="M40 50 L40 -10 L120 -10 L120 50Z" fill="#fff"/>${[50, 70, 90, 110].map((x) => `<path d="M${x} -10 V50" stroke="#ef4444" stroke-width="8"/>`).join("")}<path d="M30 -10 L80 -60 L130 -10Z" fill="#ef4444"/></g>`;
    case "edge": return `<g ${K}><path d="M-140 40 Q-60 10 0 40 V70 H-140Z" fill="#38bdf8"/><circle cx="80" cy="-60" r="34" fill="#fef9c3"/>
      <path d="M0 -110 C24 -84 28 -30 22 30 H-22 C-28 -30 -24 -84 0 -110Z" fill="#f8fafc"/><circle cx="0" cy="-50" r="10" fill="#38bdf8"/><path d="M-22 0 L-40 40 L-20 30Z M22 0 L40 40 L20 30Z" fill="#ef4444"/></g>
      <text x="-110" y="34" font-size="26">🐠</text><text x="90" y="40" font-size="24">❄️</text>`;
  }
  return "";
}

// Is a neighborhood open? The first one always; each next one when every world of the one
// before it was played at least once (or a world inside it was already played, or parents opened all).
function hoodOpen(player, i, openAll) {
  if (openAll || i === 0) return true;
  const own = NEIGHBORHOODS[i].zones;
  if (own.some((z) => player.zones[z])) return true;
  return NEIGHBORHOODS[i - 1].zones.every((z) => player.zones[z]) && hoodOpen(player, i - 1, openAll);
}
function fortressOpen(player, openAll) {
  return openAll || player.zones.fortress > 0 || NEIGHBORHOODS.every((h) => h.zones.every((z) => player.zones[z]));
}
const hoodOfZone = (zoneId) => NEIGHBORHOODS.find((h) => h.zones.includes(zoneId));

function tokenHTML() {
  return `<g id="token" pointer-events="none">
      <ellipse cx="0" cy="40" rx="30" ry="8" fill="#0005"/>
      <g class="token-bob">
        <path d="M0 40 L-16 14 H16Z" fill="${INK}"/>
        <circle r="40" fill="#fff" stroke="${INK}" stroke-width="5"/>
        <g transform="translate(-36 -36)">${heroFaceSVG(hero, 72)}</g>
      </g>
    </g>`;
}

function worldSVG(player, openAll) {
  const order = NEIGHBORHOODS.map((h) => HOOD_AT[h.id]);
  const road = smoothPath([[1660, 880], ...order, [1060, 230], FORTRESS_SPOT]);
  const fOpen = fortressOpen(player, openAll);
  const regions = NEIGHBORHOODS.map((h, i) => {
    const [x, y] = HOOD_AT[h.id];
    const open = hoodOpen(player, i, openAll);
    const played = h.zones.filter((z) => player.zones[z]).length;
    const stars = h.zones.reduce((s, z) => s + (player.zones[z] || 0), 0);
    return `
      <g class="region ${open ? "" : "locked"}" data-hood="${h.id}" transform="translate(${x} ${y})" tabindex="0" role="button" aria-label="${h.title}">
        <ellipse cx="0" cy="30" rx="190" ry="120" fill="${h.color}" opacity=".35"/>
        <ellipse cx="0" cy="20" rx="175" ry="108" fill="#fff8" stroke="${INK}" stroke-width="5" stroke-dasharray="14 10"/>
        <g class="region-art">${hoodArt(h.id)}</g>
        ${open ? "" : `<g class="lock"><ellipse cx="0" cy="20" rx="178" ry="110" fill="#1e1b4b99"/><text y="44" text-anchor="middle" font-size="76">🔒</text></g>`}
        <g transform="translate(0 112)">
          <rect x="-150" y="-30" width="300" height="60" rx="16" fill="${INK}" transform="translate(6 6)"/>
          <rect x="-150" y="-30" width="300" height="60" rx="16" fill="${h.color}" stroke="${INK}" stroke-width="5"/>
          <text x="0" y="14" text-anchor="middle" class="region-label">${h.icon} ${h.title}</text>
        </g>
        <g transform="translate(150 -80)">
          <rect x="-56" y="-22" width="112" height="44" rx="22" fill="#fff" stroke="${INK}" stroke-width="4"/>
          <text y="9" text-anchor="middle" class="region-count">${played}/${h.zones.length} ⭐${stars}</text>
        </g>
      </g>`;
  }).join("");
  return `
  <svg viewBox="0 0 ${WORLD_W} ${WORLD_H}" class="map-svg world-svg" role="img" aria-label="מפת העיר">
    <defs>
      <pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="2.2" fill="#000" opacity=".08"/></pattern>
      <radialGradient id="evilW" cx="810" cy="130" r="360" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#2e1065"/><stop offset=".6" stop-color="#581c87" stop-opacity=".7"/><stop offset="1" stop-color="#581c87" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="${WORLD_W}" height="${WORLD_H}" fill="#38bdf8"/>
    ${Array.from({ length: 24 }, (_, i) => `<path d="M${(i * 173) % 1560} ${(i * 97) % 980} q14 -10 28 0 t28 0" stroke="#e0f2fe" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>`).join("")}
    <path d="M120 140 Q80 40 300 50 Q600 -10 900 40 Q1250 10 1450 80 Q1580 150 1540 420 Q1600 700 1500 880 Q1300 990 900 960 Q500 990 220 930 Q40 860 70 600 Q30 330 120 140Z" fill="#86efac" stroke="${INK}" stroke-width="7"/>
    <path d="M150 170 Q120 80 310 85 Q600 30 900 75 Q1240 50 1420 110 Q1530 170 1500 420 Q1550 690 1460 850 Q1280 950 900 925 Q500 950 240 895 Q90 830 110 600 Q80 340 150 170Z" fill="#bbf7d0" opacity=".6"/>
    <rect width="${WORLD_W}" height="${WORLD_H}" fill="url(#evilW)"/>
    ${cloud(160, 70, .9)}${cloud(1450, 60, 1)}${cloud(1500, 960, .8)}
    <path d="${road}" fill="none" stroke="${INK}" stroke-width="44" stroke-linecap="round"/>
    <path d="${road}" fill="none" stroke="#fcd9a8" stroke-width="34" stroke-linecap="round"/>
    <path d="${road}" id="road" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="18 16"/>
    <rect width="${WORLD_W}" height="${WORLD_H}" fill="url(#dots)" pointer-events="none"/>
    ${regions}
    <g class="region fortress-spot ${fOpen ? "" : "locked"}" data-hood="fortress" transform="translate(${FORTRESS_SPOT[0]} ${FORTRESS_SPOT[1]}) scale(.8)" tabindex="0" role="button" aria-label="המבצר">
      <g class="region-art">${PLACE_ART.fortress()}</g>
      <g transform="translate(0 100)"><rect x="-150" y="-26" width="300" height="52" rx="14" fill="#7c3aed" stroke="${INK}" stroke-width="5"/>
        <text y="12" text-anchor="middle" class="region-label">🏰 המבצר של ד״ר בלגן</text></g>
      ${fOpen ? "" : `<text y="0" text-anchor="middle" font-size="70">🔒</text>`}
    </g>
    <g transform="translate(1530 905)"><rect x="-70" y="-26" width="140" height="48" rx="12" fill="#22c55e" ${K}/><text y="8" text-anchor="middle" class="spot-label" fill="#fff">התחלה</text></g>
    ${tokenHTML()}
  </svg>`;
}

// ===================== One neighborhood's own screen =====================
const HOOD_SPOTS = [[1320, 790], [950, 815], [580, 740], [300, 480], [720, 290]];
const HOOD_THEMES = {
  town: { ground: "#86efac", patch: "#4ade80", deco: () => `${house(1150, 330, "#fef3c7", "#f59e0b")}${house(1260, 300, "#fecaca", "#b91c1c")}${house(1370, 340, "#e0f2fe", "#2563eb")}${house(1480, 310, "#ede9fe", "#7c3aed")}${tree(1100, 470)}${tree(1500, 480, .9)}${tree(120, 860)}${tree(220, 920, .8)}${house(860, 520, "#dcfce7", "#15803d")}
      <g font-family="Arial" font-weight="900" font-size="46" fill="#fff" stroke="${INK}" stroke-width="3" class="floaty"><text x="1180" y="180">א</text><text x="1300" y="150">ב</text><text x="1420" y="190">ג</text><text x="160" y="200">ד</text><text x="300" y="150">ה</text></g>` },
  harbor: { ground: "#fde68a", patch: "#fcd34d", deco: () => `<path d="M1000 0 H1600 V560 Q1400 600 1200 520 Q1060 470 1000 380Z" fill="#38bdf8" ${K}/>
      ${Array.from({ length: 10 }, (_, i) => `<path d="M${1060 + (i * 61) % 500} ${60 + (i * 47) % 420} q14 -10 28 0 t28 0" stroke="#e0f2fe" stroke-width="4" fill="none"/>`).join("")}
      <g ${K}><path d="M1240 300 h150 l-24 40 h-102z" fill="#b45309"/><path d="M1310 300 V170 L1390 290Z" fill="#fff"/><rect x="1470" y="80" width="40" height="190" fill="#fff"/><path d="M1470 130 h40 M1470 190 h40" stroke="#ef4444" stroke-width="16"/><rect x="1462" y="54" width="56" height="30" fill="#facc15"/></g>
      <g font-family="Arial" font-weight="900" font-size="40" fill="#fff" stroke="${INK}" stroke-width="3"><text x="1120" y="200">1</text><text x="1180" y="430">2</text><text x="1400" y="440">3</text></g>${tree(140, 880, 1, "#65a30d")}` },
  woods: { ground: "#4ade80", patch: "#15803d", deco: () => `${[[1100, 400], [1180, 320], [1280, 420], [1380, 330], [1480, 430], [1540, 300], [1200, 180], [1350, 160], [1500, 170], [100, 860], [200, 930], [60, 700], [880, 520], [1000, 560]].map(([x, y], i) => tree(x, y, 1 + (i % 3) * .2, i % 2 ? "#166534" : "#15803d")).join("")}
      <g font-size="28"><text x="1040" y="250">🍄</text><text x="960" y="600">🍄</text><text x="250" y="780">🦉</text></g>
      <g fill="#fef08a">${Array.from({ length: 14 }, (_, i) => `<circle cx="${(i * 211) % 1500 + 50}" cy="${(i * 131) % 900 + 50}" r="4" class="twinkle"/>`).join("")}</g>` },
  downtown: { ground: "#cbd5e1", patch: "#94a3b8", deco: () => `${tower(1100, 520, 80, 300, "#475569")}${tower(1190, 520, 90, 420, "#334155")}${tower(1290, 520, 80, 260, "#64748b")}${tower(1380, 520, 90, 360, "#1e293b")}${tower(1480, 520, 80, 300, "#475569")}
      <path d="M0 640 H1600" stroke="#64748b" stroke-width="40"/><path d="M0 640 H1600" stroke="#fff" stroke-width="4" stroke-dasharray="30 30"/>${tree(160, 880)}${tree(860, 560, .8)}` },
  fun: { ground: "#fbcfe8", patch: "#f9a8d4", deco: () => `<g ${K}><circle cx="1320" cy="260" r="180" fill="none" stroke-width="8"/>${Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return `<path d="M1320 260 L${(1320 + 180 * Math.cos(a)).toFixed(0)} ${(260 + 180 * Math.sin(a)).toFixed(0)}" stroke-width="3"/><circle cx="${(1320 + 180 * Math.cos(a)).toFixed(0)}" cy="${(260 + 180 * Math.sin(a)).toFixed(0)}" r="22" fill="${["#ef4444", "#3b82f6", "#22c55e", "#f59e0b"][i % 4]}"/>`; }).join("")}
      <path d="M1240 520 L1320 260 L1400 520" fill="none" stroke-width="10"/></g>
      <path d="M40 980 Q200 700 360 900 T700 860" fill="none" stroke="${INK}" stroke-width="10"/><path d="M40 980 Q200 700 360 900 T700 860" fill="none" stroke="#ef4444" stroke-width="5"/>
      <g class="floaty">${[[1050, 120, "#3b82f6"], [1540, 520, "#22c55e"], [120, 200, "#f59e0b"]].map(([x, y, c]) => `<ellipse cx="${x}" cy="${y}" rx="24" ry="30" fill="${c}" ${K}/>`).join("")}</g>` },
  edge: { ground: "#bae6fd", patch: "#7dd3fc", deco: () => `<rect x="0" y="0" width="1600" height="300" fill="#1e1b4b"/><g fill="#fef9c3">${Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 137) % 1600}" cy="${(i * 53) % 290}" r="${i % 3 ? 2 : 3.5}" class="${i % 4 ? "" : "twinkle"}"/>`).join("")}</g>
      <circle cx="1420" cy="140" r="60" fill="#fef9c3" ${K}/><g ${K}><circle cx="1150" cy="110" r="36" fill="#f97316"/><ellipse cx="1150" cy="110" rx="62" ry="12" fill="none" stroke="#fde047" stroke-width="5"/></g>
      <path d="M0 640 Q300 600 520 700 T1000 980 H0Z" fill="#0ea5e9" ${K}/><text x="120" y="820" font-size="40">🐠</text><text x="320" y="900" font-size="34">🐙</text>
      <path d="M1100 1000 Q1250 760 1600 800 V1000Z" fill="#f0f9ff" ${K}/>` },
};

function hoodSVG(hoodId, player) {
  const h = NEIGHBORHOODS.find((x) => x.id === hoodId);
  const t = HOOD_THEMES[hoodId];
  const road = smoothPath([[1680, 880], ...HOOD_SPOTS]);
  const places = h.zones.map((zid, i) => {
    const z = ZONES.find((x) => x.id === zid);
    const [x, y] = HOOD_SPOTS[i];
    const n = player.zones[zid] || 0;
    return `
      <g class="spot" data-zone="${zid}" transform="translate(${x} ${y})" tabindex="0" role="button" aria-label="${z.title}">
        <ellipse cx="0" cy="60" rx="130" ry="22" fill="#0003"/>
        <g class="spot-art" transform="scale(1.15)">${PLACE_ART[zid]()}</g>
        <g transform="translate(0 112)">
          <rect x="-128" y="-26" width="256" height="52" rx="14" fill="${INK}" transform="translate(5 5)"/>
          <rect x="-128" y="-26" width="256" height="52" rx="14" fill="#fff" stroke="${INK}" stroke-width="4"/>
          <rect x="-128" y="-26" width="18" height="52" rx="6" fill="${z.color}" stroke="${INK}" stroke-width="4"/>
          <text x="9" y="12" text-anchor="middle" class="spot-label big">${z.title}</text>
        </g>
        <g transform="translate(118 -112)">
          <circle r="28" fill="${n ? "#facc15" : "#fff"}" stroke="${INK}" stroke-width="4"/>
          <text y="10" text-anchor="middle" class="spot-count">${n ? "⭐" + n : i + 1}</text>
        </g>
      </g>`;
  }).join("");
  return `
  <svg viewBox="0 0 ${WORLD_W} ${WORLD_H}" class="map-svg hood-svg" role="img" aria-label="${h.title}">
    <defs><pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="2.2" fill="#000" opacity=".08"/></pattern></defs>
    <rect width="${WORLD_W}" height="${WORLD_H}" fill="${t.ground}"/>
    <g fill="${t.patch}" opacity=".7"><ellipse cx="300" cy="200" rx="280" ry="120"/><ellipse cx="900" cy="560" rx="260" ry="90"/><ellipse cx="1300" cy="900" rx="320" ry="100"/></g>
    ${t.deco()}
    <path d="${road}" fill="none" stroke="${INK}" stroke-width="64" stroke-linecap="round"/>
    <path d="${road}" fill="none" stroke="#fcd9a8" stroke-width="54" stroke-linecap="round"/>
    <path d="${road}" id="road" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="22 20"/>
    <rect width="${WORLD_W}" height="${WORLD_H}" fill="url(#dots)" pointer-events="none"/>
    ${places}
    ${tokenHTML()}
  </svg>`;
}

// ---------- the walking hero ----------
// Where along the road each target point is (found once per drawn map).
function roadLengths(svg, points) {
  if (svg._lens) return svg._lens;
  const path = svg.querySelector("#road");
  const total = path.getTotalLength();
  const out = {};
  for (const [id, [x, y]] of Object.entries(points)) {
    let best = 0, bestD = Infinity;
    for (let L = 0; L <= total; L += 5) {
      const p = path.getPointAtLength(L);
      const d = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (d < bestD) { bestD = d; best = L; }
    }
    out[id] = best;
  }
  out._start = 0;
  return (svg._lens = out);
}
function putToken(svg, L) {
  const p = svg.querySelector("#road").getPointAtLength(L);
  svg.querySelector("#token").setAttribute("transform", `translate(${p.x} ${p.y - 34})`);
}
function walkToken(svg, points, fromId, toId, done) {
  const lens = roadLengths(svg, points);
  const token = svg.querySelector("#token");
  const a = lens[fromId] ?? 0, b = lens[toId];
  if (Math.abs(a - b) < 5) { putToken(svg, b); done(); return; }
  const dur = Math.min(2600, Math.max(700, Math.abs(b - a) * 1.0));
  const t0 = performance.now();
  let lastStep = 0;
  token.classList.add("walking");
  const step = (now) => {
    const t = Math.min(1, (now - t0) / dur);
    const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    putToken(svg, a + (b - a) * e);
    if (now - lastStep > 180) { Sfx.step(); lastStep = now; }
    if (t < 1) requestAnimationFrame(step);
    else { token.classList.remove("walking"); setTimeout(done, 250); }
  };
  requestAnimationFrame(step);
}
const worldPoints = () => ({ ...HOOD_AT, fortress: FORTRESS_SPOT });
const hoodPoints = (hoodId) => Object.fromEntries(NEIGHBORHOODS.find((h) => h.id === hoodId).zones.map((z, i) => [z, HOOD_SPOTS[i]]));
