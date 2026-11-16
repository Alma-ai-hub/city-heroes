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

// ===================== The city map: three kingdoms + Dr. Balagan's fortress =====================
const WORLD_W = 1600, WORLD_H = 1000;
const REALM_AT = { lang: [1210, 560], en: [800, 790], math: [390, 560] };
const FORTRESS_SPOT = [800, 210];
const ISLAND = "M120 140 Q80 40 300 50 Q600 -10 900 40 Q1250 10 1450 80 Q1580 150 1540 420 Q1600 700 1500 880 Q1300 990 900 960 Q500 990 220 930 Q40 860 70 600 Q30 330 120 140Z";

function hoodArt(id) {
  const g = (inner) => `<g ${K}>${inner}</g>`;
  switch (id) {
    case "town": return `${house(-90, 20, "#fef3c7", "#f59e0b")}${house(-20, 0, "#fecaca", "#b91c1c")}${house(60, 24, "#e0f2fe", "#2563eb")}${tree(120, 30, .8)}
      <g font-family="Arial" font-weight="900" font-size="34" fill="#fff" stroke="${INK}" stroke-width="3" class="floaty"><text x="-70" y="-70">א</text><text x="20" y="-90">ב</text><text x="90" y="-60">ג</text></g>`;
    case "harbor": return `${g(`<path d="M-140 30 Q0 60 140 30 V70 H-140Z" fill="#38bdf8"/><rect x="60" y="-110" width="30" height="130" fill="#fff"/><path d="M60 -80 h30 M60 -40 h30" stroke="#ef4444" stroke-width="12"/><rect x="54" y="-130" width="42" height="22" fill="#facc15"/>
      <path d="M-110 20 h90 l-14 24 h-62z" fill="#b45309"/><path d="M-66 20 V-60 L-20 10Z" fill="#fff"/>`)}<text x="-10" y="60" font-size="24">⚓</text>`;
    case "woods": return `${tree(-80, 20, 1.3, "#15803d")}${tree(0, 0, 1.6, "#166534")}${tree(80, 24, 1.2, "#22c55e")}<text x="-30" y="50" font-size="30">🐉</text><text x="40" y="54" font-size="22">🍄</text>`;
    case "downtown": return `${tower(-80, 50, 50, 150, "#475569")}${tower(-20, 50, 56, 200, "#334155")}${tower(46, 50, 50, 130, "#64748b")}${tower(100, 50, 40, 170, "#1e293b")}`;
    case "bay": return `${g(`<path d="M-150 20 Q0 60 150 20 V70 H-150Z" fill="#38bdf8"/><path d="M-60 20 h100 l-16 26 h-68z" fill="#b45309"/><path d="M-20 20 V-80 L50 10Z" fill="#fff"/><rect x="80" y="-60" width="40" height="64" rx="18" fill="#ef4444"/>`)}
      <g font-family="Arial" font-weight="900" font-size="30" fill="#fff" stroke="${INK}" stroke-width="2.5" class="floaty"><text x="-120" y="-40">ק</text><text x="-90" y="-90">ר</text><text x="20" y="-110">א</text></g><text x="60" y="54" font-size="24">🐠</text>`;
    case "sky": case "edge": return `<g ${K}><path d="M-140 40 Q-60 10 0 40 V70 H-140Z" fill="#38bdf8"/><circle cx="80" cy="-60" r="34" fill="#fef9c3"/>
      <path d="M0 -110 C24 -84 28 -30 22 30 H-22 C-28 -30 -24 -84 0 -110Z" fill="#f8fafc"/><circle cx="0" cy="-50" r="10" fill="#38bdf8"/><path d="M-22 0 L-40 40 L-20 30Z M22 0 L40 40 L20 30Z" fill="#ef4444"/></g>
      <text x="-110" y="34" font-size="26">❄️</text><text x="90" y="40" font-size="24">☄️</text>`;
    case "entown": return `${g(`<rect x="-120" y="-20" width="90" height="70" fill="#fecaca"/><path d="M-130 -20 L-75 -70 L-20 -20Z" fill="#dc2626"/>
      <rect x="10" y="-40" width="100" height="56" rx="10" fill="#dc2626"/><rect x="10" y="-2" width="100" height="22" rx="4" fill="#b91c1c"/>${[24, 50, 76].map((x) => `<rect x="${x}" y="-32" width="18" height="18" fill="#bae6fd" stroke-width="2.5"/>`).join("")}<circle cx="34" cy="22" r="10" fill="#334155"/><circle cx="90" cy="22" r="10" fill="#334155"/>`)}
      <text x="-60" y="-80" font-size="30" class="floaty">👋</text><text x="40" y="-60" font-size="20" font-weight="900" font-family="Arial" fill="#fff" stroke="${INK}" stroke-width="1.5">HELLO</text>`;
    case "enpark": return `${g(["#ef4444", "#3b82f6", "#22c55e"].map((c, i) => `<rect x="${-100 + i * 70}" y="-10" width="60" height="60" rx="8" fill="${c}"/>`).join(""))}
      <g font-family="Arial" font-weight="900" font-size="42" fill="#fff" stroke="${INK}" stroke-width="2.5"><text x="-86" y="36">A</text><text x="-16" y="36">B</text><text x="52" y="36">C</text></g>
      <g class="floaty">${[[-110, -70, "#f59e0b"], [110, -80, "#a855f7"], [0, -100, "#ec4899"]].map(([x, y, c]) => `<path d="M${x} ${y + 26} q-4 14 4 26" stroke="${INK}" stroke-width="2" fill="none"/><ellipse cx="${x}" cy="${y}" rx="17" ry="21" fill="${c}" ${K}/>`).join("")}</g>`;
    case "fun": return hoodArt("enpark");
  }
  return "";
}

function realmArt(id) {
  if (id === "math") return `${tower(-90, 40, 50, 130, "#475569")}${tower(-30, 40, 54, 170, "#334155")}
    <g transform="translate(70 -10) scale(.55)">${robotSVG(5, 0).replace(/<svg[^>]*>/, "<g transform='translate(-100 -110)'>").replace("</svg>", "</g>")}</g>
    <g font-family="Arial" font-weight="900" font-size="40" fill="#fde047" stroke="${INK}" stroke-width="3" class="floaty"><text x="-140" y="-80">1</text><text x="-40" y="-130">2</text><text x="60" y="-110">3</text><text x="120" y="-60">+</text></g>`;
  if (id === "lang") return `${house(-100, 30, "#fef3c7", "#f59e0b")}${tree(110, 40, 1.1)}
    <g ${K}><path d="M-40 40 V-60 Q0 -76 40 -60 V40 Q0 24 -40 40Z" fill="#fff"/><path d="M0 -68 V32" /><path d="M-30 -40 h20 M-30 -20 h20 M10 -40 h20 M10 -20 h20" stroke-width="3"/></g>
    <g font-family="Arial" font-weight="900" font-size="40" fill="#fff" stroke="${INK}" stroke-width="3" class="floaty"><text x="-150" y="-60">א</text><text x="-60" y="-120">ב</text><text x="60" y="-110">ג</text><text x="130" y="-50">ד</text></g>`;
  return `${hoodArt("entown")}<g font-family="Arial" font-weight="900" font-size="38" fill="#fff" stroke="${INK}" stroke-width="3" class="floaty"><text x="-150" y="-100">A</text><text x="130" y="-110">B</text></g>`;
}

// ---------- what's open ----------
const zonesOfHood = (hoodId) => NEIGHBORHOODS.find((h) => h.id === hoodId).zones;
const realmZones = (realmId) => REALMS.find((r) => r.id === realmId).hoods.flatMap(zonesOfHood);
const hoodOfZone = (zoneId) => NEIGHBORHOODS.find((h) => h.zones.includes(zoneId));
const realmOfZone = (zoneId) => {
  const z = ZONES.find((x) => x.id === zoneId);
  if (z && z.ruler) return REALMS.find((r) => r.ruler === zoneId);
  const h = hoodOfZone(zoneId);
  return h ? realmOfHood(h.id) : null;
};
// In each kingdom the first neighborhood is open; each next one opens when every place of the
// one before it was played once (or a place in it was already played, or parents opened all).
function hoodOpen(player, hoodId, openAll) {
  if (openAll) return true;
  const r = realmOfHood(hoodId), i = r.hoods.indexOf(hoodId);
  if (i === 0 || zonesOfHood(hoodId).some((z) => player.zones[z])) return true;
  return zonesOfHood(r.hoods[i - 1]).every((z) => player.zones[z]) && hoodOpen(player, r.hoods[i - 1], openAll);
}
const rulerBeaten = (player, realmId) => player.zones[REALMS.find((r) => r.id === realmId).ruler] > 0;
function rulerOpen(player, realmId, openAll) {
  return openAll || rulerBeaten(player, realmId) || realmZones(realmId).every((z) => player.zones[z]);
}
function fortressOpen(player, openAll) {
  return openAll || player.zones.fortress > 0 || REALMS.every((r) => rulerBeaten(player, r.id));
}

function tokenHTML() {
  return `<g id="token" pointer-events="none">
      <ellipse cx="0" cy="40" rx="30" ry="8" fill="#0005"/>
      <g class="token-bob">
        <path d="M0 40 L-16 14 H16Z" fill="${INK}"/>
        <circle r="40" fill="#fff" stroke="${INK}" stroke-width="5"/>
        ${typeof team !== "undefined" && team
          ? TEAM.map((id, i) => `<g transform="translate(${-30 - (TEAM.length - 1) * 20 + i * 40} -30)">${heroFaceSVG(id, 60)}</g>`).join("")
          : `<g transform="translate(-36 -36)">${heroFaceSVG(hero, 72)}</g>`}
      </g>
    </g>`;
}

// ---------- shared pieces of the big maps (2026-11-16: "game graphics, not kids' drawings") ----------
// Emoji are drawn big: on Windows, iPad and Android they are detailed 3D-style pictures.
const emo = (e, x, y, size, cls = "") => `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" dominant-baseline="central" class="emo ${cls}">${e}</text>`;

// A raised round platform with thickness, a soft shadow and light from above.
function plateHTML(rx, ry, color, uid) {
  return `
    <defs><radialGradient id="pl${uid}" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="${shade(color, 0.55)}"/><stop offset=".6" stop-color="${shade(color, 0.15)}"/><stop offset="1" stop-color="${shade(color, -0.15)}"/></radialGradient></defs>
    <ellipse cx="6" cy="${ry * 0.55}" rx="${rx * 1.02}" ry="${ry * 0.95}" fill="#0005" filter="url(#softBlur)"/>
    <ellipse cx="0" cy="22" rx="${rx}" ry="${ry}" fill="${shade(color, -0.45)}" stroke="#111" stroke-width="5"/>
    <ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" fill="url(#pl${uid})" stroke="#111" stroke-width="5"/>
    <ellipse cx="0" cy="0" rx="${rx - 14}" ry="${ry - 10}" fill="none" stroke="#fff" stroke-width="3" opacity=".45"/>`;
}

// A gold-edged ribbon with a name on it.
function ribbonHTML(text, color, w = 330, y = 0) {
  const h = 56, x = -w / 2;
  return `<g transform="translate(0 ${y})">
    <path d="M${x - 34} ${8} L${x} ${2} L${x} ${h + 2} L${x - 34} ${h + 8} L${x - 18} ${h / 2 + 6}Z" fill="${shade(color, -0.35)}" stroke="#111" stroke-width="4" stroke-linejoin="round"/>
    <path d="M${-x + 34} ${8} L${-x} ${2} L${-x} ${h + 2} L${-x + 34} ${h + 8} L${-x + 18} ${h / 2 + 6}Z" fill="${shade(color, -0.35)}" stroke="#111" stroke-width="4" stroke-linejoin="round"/>
    <rect x="${x}" y="0" width="${w}" height="${h}" rx="10" fill="${color}" stroke="#111" stroke-width="5"/>
    <rect x="${x + 6}" y="6" width="${w - 12}" height="${h - 12}" rx="7" fill="none" stroke="#fde68a" stroke-width="3"/>
    <rect x="${x + 8}" y="8" width="${w - 16}" height="${h / 2 - 8}" rx="6" fill="#fff" opacity=".22"/>
    <text x="0" y="${h / 2 + 2}" text-anchor="middle" dominant-baseline="central" class="ribbon-text">${text}</text>
  </g>`;
}

let plateUid = 0;
// A place on a big map: platform, landmarks, ribbon, progress badge, lock.
function districtHTML({ id, kind, x, y, title, color, art, open, count, crown, rx = 220, ry = 110 }) {
  const u = ++plateUid;
  return `
    <g class="district ${open ? "" : "locked"}" data-${kind}="${id}" transform="translate(${x} ${y})" tabindex="0" role="button" aria-label="${title}">
      <ellipse cx="0" cy="0" rx="${rx + 40}" ry="${ry + 40}" fill="url(#glow${kind === "ruler" ? "Gold" : ""})" class="district-glow"/>
      ${plateHTML(rx, ry, color, u)}
      <g class="district-art">${art}</g>
      ${open ? "" : `<g class="lock"><ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" fill="#0f172acc" stroke="#111" stroke-width="5"/>${emo("🔒", 0, -10, 84)}</g>`}
      ${ribbonHTML(title, color, Math.max(280, title.length * 17), ry + 6)}
      ${count ? `<g transform="translate(${rx - 30} ${-ry - 10})"><rect x="-64" y="-24" width="128" height="48" rx="24" fill="#fff" stroke="#111" stroke-width="4"/><text y="2" text-anchor="middle" dominant-baseline="central" class="region-count">${count}</text></g>` : ""}
      ${crown ? emo("👑", -rx + 20, -ry - 10, 64, "bob") : ""}
    </g>`;
}

function glowingRoad(pts) {
  const d = smoothPath(pts);
  return `<path d="${d}" fill="none" stroke="#0007" stroke-width="58" stroke-linecap="round" transform="translate(4 8)" filter="url(#softBlur)"/>
    <path d="${d}" fill="none" stroke="#111" stroke-width="50" stroke-linecap="round"/>
    <path d="${d}" fill="none" stroke="url(#roadGrad)" stroke-width="40" stroke-linecap="round"/>
    <path d="${d}" fill="none" stroke="#fff7" stroke-width="10" stroke-linecap="round" transform="translate(-3 -6)"/>
    <path d="${d}" id="road" fill="none" stroke="#fde047" stroke-width="5" stroke-dasharray="14 18" class="road-dash"/>`;
}

const MAP_DEFS = `
  <filter id="softBlur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="10"/></filter>
  <radialGradient id="glow"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <radialGradient id="glowGold"><stop offset="0" stop-color="#fde047" stop-opacity=".75"/><stop offset="1" stop-color="#fde047" stop-opacity="0"/></radialGradient>
  <linearGradient id="roadGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fef3c7"/><stop offset="1" stop-color="#f59e0b"/></linearGradient>
  <radialGradient id="seaGrad" cx=".5" cy=".45" r=".75"><stop offset="0" stop-color="#22d3ee"/><stop offset=".55" stop-color="#0284c7"/><stop offset="1" stop-color="#082f49"/></radialGradient>
  <radialGradient id="landLight" cx=".35" cy=".25" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></radialGradient>
  <radialGradient id="vignette" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></radialGradient>
  <pattern id="waves" width="120" height="60" patternUnits="userSpaceOnUse"><path d="M10 30 q15 -12 30 0 t30 0" stroke="#e0f2fe" stroke-width="3" fill="none" opacity=".35"/><path d="M70 50 q10 -8 20 0" stroke="#fff" stroke-width="2" fill="none" opacity=".25"/></pattern>
  <pattern id="grass2" width="70" height="70" patternUnits="userSpaceOnUse"><path d="M10 24 l3 -10 l3 10 M45 52 l3 -10 l3 10 M34 14 l2 -7 l2 7 M58 32 l2 -7 l2 7 M18 58 l2 -7 l2 7" stroke="#14532d" stroke-width="2" fill="none" opacity=".35"/></pattern>`;

const ISLAND2 = "M150 150 Q140 70 330 80 Q560 40 800 70 Q1060 40 1290 80 Q1470 90 1470 240 Q1520 420 1480 620 Q1500 860 1290 910 Q1040 950 800 930 Q540 955 320 915 Q120 880 120 660 Q90 420 150 150Z";

function seaAndIsland(groundGrad) {
  return `
    <rect width="1600" height="1000" fill="url(#seaGrad)"/>
    <rect width="1600" height="1000" fill="url(#waves)" class="sea-waves"/>
    <path d="${ISLAND2}" fill="#fde68a" stroke="#fff" stroke-width="40" stroke-linejoin="round" opacity=".55" transform="translate(800 500) scale(1.035) translate(-800 -500)"/>
    <path d="${ISLAND2}" fill="#fcd34d" stroke="#111" stroke-width="7"/>
    <path d="${ISLAND2}" fill="${groundGrad}" transform="translate(800 500) scale(.975) translate(-800 -500)"/>
    <path d="${ISLAND2}" fill="url(#grass2)" transform="translate(800 500) scale(.975) translate(-800 -500)"/>
    <path d="${ISLAND2}" fill="url(#landLight)" transform="translate(800 500) scale(.975) translate(-800 -500)"/>`;
}
const seaLife = () => `
  <g class="sail">${emo("⛵", 70, 230, 56)}</g><g class="sail s2">${emo("🚤", 1540, 760, 46)}</g>
  <g class="sail s3">${emo("⛵", 1530, 160, 48)}</g>${emo("🐬", 60, 860, 50, "jump")}${emo("🐋", 1550, 500, 54, "bob")}`;
const sky = () => `
  <g class="drift">${cloud(250, 60, 1.1)}</g><g class="drift d2">${cloud(1300, 50, .9)}</g>
  <g class="fly">${emo("🕊️", 0, 0, 36)}</g><g class="fly f2">${emo("🦅", 0, 0, 40)}</g>`;

// ===================== The city map: three kingdoms + Dr. Balagan's volcano fortress =====================
const KINGDOM_ART = {
  math: () => `${emo("🏙️", 0, -60, 170)}${emo("🤖", -140, 10, 74, "bob")}${emo("🚀", 140, -40, 84)}${emo("🛰️", -130, -120, 54, "bob")}
    <g class="glow-digits"><text x="70" y="-150" class="glow-num">1</text><text x="140" y="-120" class="glow-num">+</text><text x="-60" y="-160" class="glow-num">3</text></g>`,
  lang: () => `${emo("🏰", 0, -60, 170)}${emo("📚", -140, 10, 70)}${emo("🌳", 150, 0, 80)}${emo("🦉", 140, -110, 54, "bob")}
    <g class="glow-digits"><text x="-80" y="-160" class="glow-letter">א</text><text x="70" y="-170" class="glow-letter">ב</text><text x="-150" y="-110" class="glow-letter">ג</text></g>`,
  en: () => `${emo("🎡", -20, -60, 160, "spin-slow-emo")}${emo("🎠", 140, 0, 80)}${emo("🚌", -150, 16, 70)}${emo("🎈", 160, -110, 54, "bob")}${emo("🎈", -170, -100, 46, "bob")}
    <g class="glow-digits"><text x="60" y="-160" class="glow-abc">ABC</text></g>`,
};

function citySVG(player, openAll) {
  const fOpen = fortressOpen(player, openAll);
  const road = glowingRoad([[1650, 960], REALM_AT.lang, REALM_AT.en, REALM_AT.math, [560, 420], FORTRESS_SPOT]);
  const kingdoms = REALMS.map((r) => {
    const zs = realmZones(r.id);
    const played = zs.filter((z) => player.zones[z]).length;
    return districtHTML({ id: r.id, kind: "realm", x: REALM_AT[r.id][0], y: REALM_AT[r.id][1], title: `${r.icon} ${r.title}`, color: r.color,
      art: KINGDOM_ART[r.id](), open: true, count: `⭐ ${played}/${zs.length}`, crown: rulerBeaten(player, r.id) });
  }).join("");
  const [fx, fy] = FORTRESS_SPOT;
  return `
  <svg viewBox="0 0 ${WORLD_W} ${WORLD_H}" class="map-svg world-svg wow" role="img" aria-label="מפת העיר">
    <defs>${MAP_DEFS}
      <linearGradient id="landCity" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4ade80"/><stop offset=".6" stop-color="#22c55e"/><stop offset="1" stop-color="#15803d"/></linearGradient>
      <radialGradient id="evilGlow" cx="${fx}" cy="${fy}" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3b0764" stop-opacity=".95"/><stop offset=".55" stop-color="#581c87" stop-opacity=".55"/><stop offset="1" stop-color="#581c87" stop-opacity="0"/></radialGradient>
      <linearGradient id="volcano" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e1b4b"/><stop offset="1" stop-color="#4c1d95"/></linearGradient>
      <radialGradient id="lava"><stop offset="0" stop-color="#fde047"/><stop offset=".5" stop-color="#f97316"/><stop offset="1" stop-color="#dc2626" stop-opacity="0"/></radialGradient>
    </defs>
    ${seaAndIsland("url(#landCity)")}
    ${seaLife()}
    <!-- regions: tinted ground under each kingdom -->
    <g opacity=".35"><ellipse cx="${REALM_AT.math[0]}" cy="${REALM_AT.math[1]}" rx="330" ry="230" fill="#60a5fa"/><ellipse cx="${REALM_AT.lang[0]}" cy="${REALM_AT.lang[1]}" rx="330" ry="230" fill="#fcd34d"/><ellipse cx="${REALM_AT.en[0]}" cy="${REALM_AT.en[1]}" rx="300" ry="170" fill="#f9a8d4"/></g>
    <!-- the villain's volcano -->
    <rect width="1600" height="1000" fill="url(#evilGlow)"/>
    <path d="M${fx - 330} ${fy + 220} L${fx - 110} ${fy - 70} L${fx + 110} ${fy - 70} L${fx + 330} ${fy + 220}Z" fill="url(#volcano)" stroke="#111" stroke-width="6" stroke-linejoin="round"/>
    <path d="M${fx - 70} ${fy - 60} Q${fx - 90} ${fy + 60} ${fx - 150} ${fy + 210} M${fx + 60} ${fy - 60} Q${fx + 100} ${fy + 80} ${fx + 170} ${fy + 210}" stroke="#f97316" stroke-width="12" fill="none" stroke-linecap="round" class="lava-flow"/>
    <ellipse cx="${fx}" cy="${fy - 60}" rx="160" ry="70" fill="url(#lava)" class="lava-glow"/>
    ${emo("🏔️", fx - 400, fy + 120, 120)}${emo("🏔️", fx + 420, fy + 110, 110)}${emo("⛰️", fx - 300, fy + 200, 90)}${emo("⛰️", fx + 300, fy + 200, 90)}
    <g class="storm"><path d="M${fx - 150} ${fy - 150} q-10 -40 40 -42 q16 -36 64 -18 q36 -24 66 12 q46 -4 38 42Z" fill="#334155" stroke="#111" stroke-width="4"/>
      <path d="M${fx - 40} ${fy - 150} L${fx - 60} ${fy - 100} L${fx - 40} ${fy - 100} L${fx - 64} ${fy - 50} L${fx - 10} ${fy - 116} L${fx - 32} ${fy - 116} L${fx - 14} ${fy - 150}Z" fill="#fde047" stroke="#111" stroke-width="3" class="lightning"/></g>
    <!-- forests, villages, fields -->
    ${[[200, 330, 70], [270, 280, 80], [150, 430, 66], [330, 360, 60], [1380, 320, 78], [1440, 400, 66], [1320, 260, 60], [1100, 880, 66], [470, 880, 70], [560, 900, 56], [1500, 700, 60]].map(([x, y, s], i) => emo(i % 3 ? "🌲" : "🌳", x, y, s)).join("")}
    ${emo("🏡", 1010, 470, 56)}${emo("🏘️", 620, 470, 62)}${emo("🏡", 1060, 680, 50)}${emo("🏘️", 540, 690, 54)}${emo("🌾", 230, 780, 56)}${emo("🌻", 290, 820, 44)}${emo("🌾", 1380, 790, 56)}${emo("🐄", 1440, 830, 44)}
    ${sky()}
    ${road}
    <!-- the fortress on the volcano -->
    <g class="district fortress-spot ${fOpen ? "" : "locked"}" data-realm="fortress" transform="translate(${fx} ${fy - 20})" tabindex="0" role="button" aria-label="המבצר">
      <g class="district-art" transform="scale(1.05)">${PLACE_ART.fortress()}</g>
      ${fOpen ? "" : emo("🔒", 0, -30, 80)}
      ${ribbonHTML("🏰 המבצר של ד״ר בלגן", "#7c3aed", 380, 70)}
      ${player.zones.fortress ? emo("🏅", 150, -100, 64, "bob") : ""}
    </g>
    ${kingdoms}
    <g transform="translate(1520 930)">${ribbonHTML("🚩 התחלה", "#16a34a", 170, -28)}</g>
    <rect width="1600" height="1000" fill="url(#vignette)" pointer-events="none"/>
    ${tokenHTML()}
  </svg>`;
}

// ===================== A kingdom: its neighborhoods and its ruler's castle =====================
const RULER_AT = [800, 250];
const realmHoodSpots = (n) => (n === 2 ? [[1150, 720], [460, 720]] : n === 3 ? [[1260, 690], [800, 790], [340, 690]] : [[1300, 620], [960, 800], [630, 800], [290, 620]]);

function rulerCastleArt(realm) {
  const z = ZONES.find((x) => x.id === realm.ruler);
  return `<g transform="translate(0 -10) scale(1.15)"><g ${K}>
      <rect x="-80" y="-40" width="160" height="70" fill="#e2e8f0"/>
      <rect x="-110" y="-80" width="44" height="110" fill="#cbd5e1"/><rect x="66" y="-80" width="44" height="110" fill="#cbd5e1"/>
      <path d="M-116 -80 L-88 -124 L-60 -80Z M60 -80 L88 -124 L116 -80Z" fill="${realm.color}"/>
      <path d="M-80 -40 v-14 h18 v14 h16 v-14 h18 v14 h16 v-14 h18 v14 h16 v-14 h18 v14" fill="#e2e8f0"/>
      <path d="M-24 30 V4 Q0 -22 24 4 V30Z" fill="#334155"/>
    </g>
    <g transform="translate(0 -120) scale(.45)">${BOSS_ART[z.boss](5, 0).replace(/<svg[^>]*>/, "<g transform='translate(-100 -110)'>").replace("</svg>", "</g>")}</g></g>`;
}

// Landmarks of each neighborhood.
const HOOD_LANDMARKS = {
  harbor: [["⚓", 0, -40, 110], ["⛵", -130, -10, 70], ["🏝️", 130, -10, 70], ["🍰", 60, 20, 44]],
  downtown: [["🏙️", 0, -50, 120], ["🚒", -130, 10, 62], ["🏟️", 130, 0, 66], ["🔬", 70, -110, 44]],
  sky: [["🚀", 0, -50, 110], ["🪐", -130, -50, 70], ["❄️", 130, -20, 60], ["☄️", 100, -110, 48]],
  town: [["🏘️", 0, -40, 110], ["📚", -130, 0, 64], ["🎪", 130, -20, 70], ["🦁", 60, 20, 44]],
  woods: [["🌲", -40, -50, 110], ["🐉", 70, -40, 84], ["🍄", -140, 10, 54], ["🎵", 140, -100, 44]],
  bay: [["🌊", 0, -30, 100], ["🐠", -130, -10, 62], ["📮", 130, -20, 62], ["🚂", 60, 30, 50]],
  entown: [["🍎", -60, -40, 90], ["🐶", 70, -40, 86], ["🎨", -140, 10, 54], ["👋", 140, 0, 50]],
  enpark: [["🔤", -40, -40, 92], ["🔟", 80, -40, 76], ["🧸", -140, 10, 58], ["🎈", 140, -90, 50]],
  toys: [["🎁", 0, -40, 100], ["🧱", -130, 0, 60], ["🦕", 130, -10, 66], ["🚃", 60, 30, 44]],
  stories: [["📕", 0, -40, 100], ["🎭", -130, 0, 62], ["🔄", 130, -10, 56], ["🛝", 60, 30, 46]],
  beach: [["🏖️", 0, -40, 100], ["🐙", -130, 0, 60], ["🌦️", 130, -20, 60], ["🚗", 60, 30, 44]],
  rainbow: [["🌈", 0, -40, 100], ["🐞", -130, 0, 56], ["😀", 130, -10, 56], ["👍", 60, 30, 44]],
};
const landmarks = (hid) => `<g transform="scale(${realmOfHood(hid).hoods.length > 3 ? 0.8 : 1})">${(HOOD_LANDMARKS[hid] || []).map(([e, x, y, s], i) => emo(e, x, y, s, i === 0 ? "" : i % 2 ? "bob" : "")).join("")}</g>`;

const REALM_LOOK = {
  math: {
    ground: ["#7dd3fc", "#0ea5e9", "#0369a1"],
    deco: () => `<g stroke="#e0f2fe" stroke-width="3" opacity=".35" fill="none">${Array.from({ length: 12 }, (_, i) => `<path d="M${180 + i * 110} 120 V900 M140 ${160 + i * 70} H1460"/>`).join("")}</g>
      ${emo("🏢", 200, 330, 110)}${emo("🏬", 330, 270, 90)}${emo("🏙️", 1320, 330, 120)}${emo("🏗️", 1440, 420, 80)}${emo("🛰️", 1150, 160, 60, "bob")}${emo("🪐", 330, 150, 76, "bob")}
      ${emo("🤖", 540, 470, 64, "bob")}${emo("🚀", 1060, 450, 76)}${emo("💡", 200, 520, 50)}${emo("🔢", 1460, 560, 56)}
      <g class="glow-digits"><text x="460" y="200" class="glow-num">7</text><text x="1180" y="560" class="glow-num">4</text><text x="230" y="640" class="glow-num">+</text></g>`,
  },
  lang: {
    ground: ["#bef264", "#84cc16", "#4d7c0f"],
    deco: () => `${[[180, 330, 80], [260, 280, 70], [140, 430, 64], [1380, 300, 80], [1460, 380, 66], [1320, 250, 60], [560, 330, 56]].map(([x, y, s], i) => emo(i % 2 ? "🌲" : "🌳", x, y, s)).join("")}
      ${emo("🏡", 420, 430, 60)}${emo("🏰", 1180, 430, 90)}${emo("📖", 1440, 560, 70)}${emo("🦉", 580, 480, 52, "bob")}${emo("🌻", 230, 560, 46)}${emo("🌻", 300, 600, 40)}${emo("🍄", 1080, 300, 44)}
      <path d="M1500 120 Q1300 220 1320 380 Q1340 520 1540 600" stroke="#111" stroke-width="40" fill="none"/><path d="M1500 120 Q1300 220 1320 380 Q1340 520 1540 600" stroke="#38bdf8" stroke-width="32" fill="none"/>
      <g class="glow-digits"><text x="460" y="200" class="glow-letter">ש</text><text x="1060" y="560" class="glow-letter">ל</text><text x="230" y="660" class="glow-letter">ם</text></g>`,
  },
  en: {
    ground: ["#fbcfe8", "#f472b6", "#be185d"],
    deco: () => `<g opacity=".35">${Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 137) % 1300 + 150}" cy="${(i * 89) % 720 + 140}" r="7" fill="${["#fde047", "#22d3ee", "#a3e635", "#fff"][i % 4]}"/>`).join("")}</g>
      ${emo("🎪", 220, 330, 110)}${emo("🍭", 380, 270, 72)}${emo("🎢", 1220, 400, 110)}${emo("🍦", 1400, 300, 80)}${emo("🎈", 150, 170, 56, "bob")}${emo("🎈", 1450, 160, 50, "bob")}${emo("🧸", 540, 470, 60)}${emo("🎠", 1440, 560, 64)}
      <g class="glow-digits"><text x="460" y="200" class="glow-abc">A</text><text x="1080" y="560" class="glow-abc">Z</text><text x="230" y="640" class="glow-abc">Hi!</text></g>`,
  },
};

function realmSVG(realmId, player, openAll) {
  const realm = REALMS.find((r) => r.id === realmId);
  const look = REALM_LOOK[realmId];
  const spots = realmHoodSpots(realm.hoods.length);
  const road = glowingRoad([[1650, 960], ...spots, RULER_AT]);
  const hoods = realm.hoods.map((hid, i) => {
    const h = NEIGHBORHOODS.find((x) => x.id === hid);
    const played = h.zones.filter((z) => player.zones[z]).length;
    return districtHTML({ id: hid, kind: "hood", x: spots[i][0], y: spots[i][1], title: `${h.icon} ${h.title}`, color: h.color, art: landmarks(hid),
      open: hoodOpen(player, hid, openAll), count: `⭐ ${played}/${h.zones.length}`, rx: realm.hoods.length > 3 ? 165 : 210, ry: realm.hoods.length > 3 ? 82 : 100 });
  }).join("");
  const rz = ZONES.find((x) => x.id === realm.ruler);
  const ruler = districtHTML({ id: realm.ruler, kind: "ruler", x: RULER_AT[0], y: RULER_AT[1], title: `👑 ${rz.title}`, color: rz.color,
    art: rulerCastleArt(realm), open: rulerOpen(player, realmId, openAll), crown: rulerBeaten(player, realmId), rx: 230, ry: 110 });
  return `
  <svg viewBox="0 0 ${WORLD_W} ${WORLD_H}" class="map-svg world-svg wow" role="img" aria-label="${realm.title}">
    <defs>${MAP_DEFS}
      <linearGradient id="landRealm" x1="0" y1="0" x2="0" y2="1">${look.ground.map((c, i) => `<stop offset="${i / 2}" stop-color="${c}"/>`).join("")}</linearGradient>
    </defs>
    ${seaAndIsland("url(#landRealm)")}
    ${seaLife()}
    ${look.deco()}
    ${sky()}
    ${road}
    ${hoods}${ruler}
    <g transform="translate(1520 930)">${ribbonHTML("🚩 כניסה", "#16a34a", 170, -28)}</g>
    <rect width="1600" height="1000" fill="url(#vignette)" pointer-events="none"/>
    ${tokenHTML()}
  </svg>`;
}

// ===================== One neighborhood's own screen =====================
const HOOD_THEMES = {
  town: { ground: "#86efac", patch: "#4ade80", deco: () => `${house(1150, 330, "#fef3c7", "#f59e0b")}${house(1260, 300, "#fecaca", "#b91c1c")}${house(1370, 340, "#e0f2fe", "#2563eb")}${house(1480, 310, "#ede9fe", "#7c3aed")}${tree(1100, 470)}${tree(1500, 480, .9)}${tree(120, 860)}${tree(220, 920, .8)}${house(860, 520, "#dcfce7", "#15803d")}
      <g font-family="Arial" font-weight="900" font-size="46" fill="#fff" stroke="${INK}" stroke-width="3" class="floaty"><text x="1180" y="180">א</text><text x="1300" y="150">ב</text><text x="1420" y="190">ג</text><text x="160" y="200">ד</text><text x="300" y="150">ה</text></g>` },
  harbor: { ground: "#fde68a", patch: "#fcd34d", tex: "#b45309", deco: () => `<path d="M1000 0 H1600 V560 Q1400 600 1200 520 Q1060 470 1000 380Z" fill="#38bdf8" ${K}/>
      ${Array.from({ length: 10 }, (_, i) => `<path d="M${1060 + (i * 61) % 500} ${60 + (i * 47) % 420} q14 -10 28 0 t28 0" stroke="#e0f2fe" stroke-width="4" fill="none"/>`).join("")}
      <g ${K}><path d="M1240 300 h150 l-24 40 h-102z" fill="#b45309"/><path d="M1310 300 V170 L1390 290Z" fill="#fff"/><rect x="1470" y="80" width="40" height="190" fill="#fff"/><path d="M1470 130 h40 M1470 190 h40" stroke="#ef4444" stroke-width="16"/><rect x="1462" y="54" width="56" height="30" fill="#facc15"/></g>
      <g font-family="Arial" font-weight="900" font-size="40" fill="#fff" stroke="${INK}" stroke-width="3"><text x="1120" y="200">1</text><text x="1180" y="430">2</text><text x="1400" y="440">3</text></g>${tree(140, 880, 1, "#65a30d")}` },
  bay: { ground: "#fde68a", patch: "#fcd34d", tex: "#b45309", deco: () => `<path d="M1000 0 H1600 V560 Q1400 600 1200 520 Q1060 470 1000 380Z" fill="#38bdf8" ${K}/>
      ${Array.from({ length: 10 }, (_, i) => `<path d="M${1060 + (i * 61) % 500} ${60 + (i * 47) % 420} q14 -10 28 0 t28 0" stroke="#e0f2fe" stroke-width="4" fill="none"/>`).join("")}
      <g ${K}><path d="M1240 300 h150 l-24 40 h-102z" fill="#b45309"/><path d="M1310 300 V170 L1390 290Z" fill="#fff"/></g>
      <g font-family="Arial" font-weight="900" font-size="44" fill="#fff" stroke="${INK}" stroke-width="3" class="floaty"><text x="1120" y="200">ק</text><text x="1180" y="430">ר</text><text x="1420" y="440">א</text></g>
      <text x="1460" y="160" font-size="50">🐙</text><text x="1100" y="320" font-size="40">🐠</text>${tree(140, 880, 1, "#65a30d")}` },
  woods: { ground: "#4ade80", patch: "#15803d", deco: () => `${[[1100, 400], [1180, 320], [1280, 420], [1380, 330], [1480, 430], [1540, 300], [1200, 180], [1350, 160], [1500, 170], [100, 860], [200, 930], [60, 700], [880, 520], [1000, 560]].map(([x, y], i) => tree(x, y, 1 + (i % 3) * .2, i % 2 ? "#166534" : "#15803d")).join("")}
      <g font-size="28"><text x="1040" y="250">🍄</text><text x="960" y="600">🍄</text><text x="250" y="780">🦉</text></g>
      <g fill="#fef08a">${Array.from({ length: 14 }, (_, i) => `<circle cx="${(i * 211) % 1500 + 50}" cy="${(i * 131) % 900 + 50}" r="4" class="twinkle"/>`).join("")}</g>` },
  downtown: { ground: "#cbd5e1", patch: "#94a3b8", tex: "#475569", deco: () => `${tower(1100, 520, 80, 300, "#475569")}${tower(1190, 520, 90, 420, "#334155")}${tower(1290, 520, 80, 260, "#64748b")}${tower(1380, 520, 90, 360, "#1e293b")}${tower(1480, 520, 80, 300, "#475569")}
      <path d="M0 640 H1600" stroke="#64748b" stroke-width="40"/><path d="M0 640 H1600" stroke="#fff" stroke-width="4" stroke-dasharray="30 30"/>${tree(160, 880)}${tree(860, 560, .8)}` },
  fun: { ground: "#fbcfe8", patch: "#f9a8d4", tex: "#be185d", deco: () => `<g ${K}><circle cx="1320" cy="260" r="180" fill="none" stroke-width="8"/>${Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return `<path d="M1320 260 L${(1320 + 180 * Math.cos(a)).toFixed(0)} ${(260 + 180 * Math.sin(a)).toFixed(0)}" stroke-width="3"/><circle cx="${(1320 + 180 * Math.cos(a)).toFixed(0)}" cy="${(260 + 180 * Math.sin(a)).toFixed(0)}" r="22" fill="${["#ef4444", "#3b82f6", "#22c55e", "#f59e0b"][i % 4]}"/>`; }).join("")}
      <path d="M1240 520 L1320 260 L1400 520" fill="none" stroke-width="10"/></g>
      <g font-family="Arial" font-weight="900" font-size="54" fill="#fff" stroke="${INK}" stroke-width="3" class="floaty"><text x="120" y="200">A</text><text x="240" y="150">B</text><text x="1000" y="560">C</text></g>
      <g class="floaty">${[[1050, 120, "#3b82f6"], [1540, 520, "#22c55e"], [120, 300, "#f59e0b"]].map(([x, y, c]) => `<ellipse cx="${x}" cy="${y}" rx="24" ry="30" fill="${c}" ${K}/>`).join("")}</g>` },
  en: { ground: "#fecdd3", patch: "#fda4af", tex: "#be123c", deco: () => `${house(1150, 330, "#fff", "#dc2626")}${house(1260, 300, "#dbeafe", "#1d4ed8")}${house(1370, 340, "#fef3c7", "#dc2626")}${house(1480, 310, "#fff", "#1d4ed8")}${tree(1100, 470)}${tree(1500, 480, .9)}${tree(120, 860)}
      <g ${K}><rect x="1040" y="520" width="200" height="90" rx="14" fill="#dc2626"/><rect x="1040" y="572" width="200" height="38" rx="6" fill="#b91c1c"/>${[1060, 1110, 1160].map((x) => `<rect x="${x}" y="532" width="34" height="30" fill="#bae6fd" stroke-width="3"/>`).join("")}<circle cx="1080" cy="616" r="16" fill="#334155"/><circle cx="1200" cy="616" r="16" fill="#334155"/></g>
      <g font-family="Arial" font-weight="900" font-size="46" fill="#fff" stroke="${INK}" stroke-width="3" class="floaty"><text x="1170" y="170">Hi!</text><text x="160" y="200">ABC</text></g>` },
  edge: { ground: "#bae6fd", patch: "#7dd3fc", tex: "#0369a1", deco: () => `<rect x="0" y="0" width="1600" height="300" fill="#1e1b4b"/><g fill="#fef9c3">${Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 137) % 1600}" cy="${(i * 53) % 290}" r="${i % 3 ? 2 : 3.5}" class="${i % 4 ? "" : "twinkle"}"/>`).join("")}</g>
      <circle cx="1420" cy="140" r="60" fill="#fef9c3" ${K}/><g ${K}><circle cx="1150" cy="110" r="36" fill="#f97316"/><ellipse cx="1150" cy="110" rx="62" ry="12" fill="none" stroke="#fde047" stroke-width="5"/></g>
      <path d="M0 640 Q300 600 520 700 T1000 980 H0Z" fill="#0ea5e9" ${K}/><text x="120" y="820" font-size="40">🐠</text><text x="320" y="900" font-size="34">🐙</text>
      <path d="M1100 1000 Q1250 760 1600 800 V1000Z" fill="#f0f9ff" ${K}/>` },
};


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
const cityPoints = () => ({ ...REALM_AT, fortress: FORTRESS_SPOT });
const realmPoints = (realmId) => { const r = REALMS.find((x) => x.id === realmId); const sp = realmHoodSpots(r.hoods.length); return { ...Object.fromEntries(r.hoods.map((h, i) => [h, sp[i]])), [r.ruler]: RULER_AT }; };
const hoodPoints = (hoodId) => { const zs = zonesOfHood(hoodId); const sp = hoodSpots(zs.length); return Object.fromEntries(zs.map((z, i) => [z, sp[i]])); };

// ---------- drawings of the English places ----------
Object.assign(PLACE_ART, {
  enfood: () => `
    <g ${K}>
      <rect x="-90" y="-30" width="180" height="76" fill="#fff7ed"/>
      <path d="M-100 -30 L-90 -60 H90 L100 -30 Q88 -18 76 -30 Q64 -18 52 -30 Q40 -18 28 -30 Q16 -18 4 -30 Q-8 -18 -20 -30 Q-32 -18 -44 -30 Q-56 -18 -68 -30 Q-80 -18 -92 -30Z" fill="#ef4444"/>
      <rect x="-70" y="-6" width="56" height="40" fill="#bae6fd"/><rect x="20" y="-2" width="40" height="48" fill="#7c2d12"/>
      <rect x="-50" y="-104" width="100" height="38" rx="10" fill="#fff"/>
    </g>
    <text x="0" y="-78" text-anchor="middle" font-family="Arial" font-weight="900" font-size="22" fill="${INK}">YUMMY</text>
    <text x="-110" y="40" font-size="30">🍎</text><text x="88" y="40" font-size="28">🍕</text>`,
  enanimals: () => `
    <g ${K}>
      <rect x="-80" y="-34" width="130" height="80" fill="#dc2626"/>
      <path d="M-92 -34 L-15 -96 L62 -34Z" fill="#991b1b"/>
      <path d="M-40 46 V0 H20 V46Z M-40 0 L20 46 M20 0 L-40 46" fill="#fef3c7" stroke-width="3"/>
      <path d="M60 46 h80 M70 20 h70" stroke-width="5"/>${[70, 95, 120].map((x) => `<path d="M${x} 12 v34" stroke-width="5"/>`).join("")}
    </g>
    <text x="68" y="10" font-size="34">🐄</text><text x="-120" y="40" font-size="28">🐶</text>
    <text x="-60" y="-110" font-family="Arial" font-weight="900" font-size="22" fill="#fff" stroke="${INK}" stroke-width="1.5" class="floaty">MOO!</text>`,
  encolors: () => `
    <g ${K}>
      <path d="M-120 40 A120 120 0 0 1 120 40" fill="none" stroke="#ef4444" stroke-width="16"/>
      <path d="M-104 40 A104 104 0 0 1 104 40" fill="none" stroke="#f59e0b" stroke-width="16" stroke-linecap="butt"/>
      <path d="M-88 40 A88 88 0 0 1 88 40" fill="none" stroke="#facc15" stroke-width="16"/>
      <path d="M-72 40 A72 72 0 0 1 72 40" fill="none" stroke="#22c55e" stroke-width="16"/>
      <path d="M-56 40 A56 56 0 0 1 56 40" fill="none" stroke="#3b82f6" stroke-width="16"/>
      <path d="M-40 40 A40 40 0 0 1 40 40" fill="none" stroke="#a855f7" stroke-width="16"/>
    </g>
    <g stroke="${INK}" stroke-width="3"><circle cx="-120" cy="56" r="12" fill="#ef4444"/><circle cx="120" cy="56" r="12" fill="#3b82f6"/></g>`,
  ennumbers: () => `
    <g ${K}>
      <rect x="-12" y="-110" width="24" height="160" fill="#64748b"/>
      <path d="M-100 -96 h96 l18 18 l-18 18 h-96z" fill="#0ea5e9"/>
      <path d="M100 -46 h-96 l-18 18 l18 18 h96z" fill="#f59e0b"/>
    </g>
    <text x="-56" y="-70" text-anchor="middle" font-family="Arial" font-weight="900" font-size="22" fill="#fff" stroke="${INK}" stroke-width="1.2">ONE, TWO</text>
    <text x="54" y="-21" text-anchor="middle" font-family="Arial" font-weight="900" font-size="24" fill="#fff" stroke="${INK}" stroke-width="1.2">1 2 3</text>`,
  enabc: () => `
    <g ${K}>${[["#ef4444", -84, 0], ["#3b82f6", -14, 0], ["#22c55e", 56, 0], ["#f59e0b", -50, -66], ["#a855f7", 20, -66]].map(([c, x, y]) => `<rect x="${x}" y="${y - 20}" width="62" height="62" rx="8" fill="${c}"/>`).join("")}</g>
    <g font-family="Arial" font-weight="900" font-size="40" fill="#fff" stroke="${INK}" stroke-width="2.5"><text x="-68" y="26">A</text><text x="2" y="26">B</text><text x="72" y="26">C</text><text x="-34" y="-40">D</text><text x="36" y="-40">E</text></g>`,
  enbody: () => `
    <g ${K}>
      <rect x="-90" y="-36" width="150" height="82" fill="#fce7f3"/>
      <path d="M-102 -36 L-15 -96 L72 -36Z" fill="#db2777"/>
      <rect x="-66" y="-12" width="44" height="34" fill="#bae6fd"/><rect x="14" y="0" width="34" height="46" fill="#9d174d"/>
    </g>
    <text x="70" y="40" font-size="40">🧸</text><text x="-130" y="-50" font-size="30" class="floaty">✋</text><text x="40" y="-100" font-size="28" class="floaty">👃</text>`,
});

// ---------- the newest neighborhoods' screens ----------
Object.assign(HOOD_THEMES, {
  toys: { ground: "#fed7aa", patch: "#fdba74", tex: "#c2410c", deco: () => `${emo("🎁", 1180, 220, 90)}${emo("🧸", 1330, 300, 80)}${emo("🪀", 1460, 200, 60)}${emo("🧱", 1100, 420, 70)}${emo("🚂", 1420, 470, 70)}${emo("🎈", 160, 160, 60, "bob")}${emo("🦕", 1500, 640, 80)}${emo("🎲", 200, 880, 60)}` },
  stories: { ground: "#fef3c7", patch: "#fde68a", tex: "#a16207", deco: () => `${emo("📚", 1180, 220, 90)}${emo("🏰", 1350, 280, 100)}${emo("🦉", 1480, 190, 60, "bob")}${emo("📖", 1120, 430, 70)}${emo("🌳", 1450, 460, 90)}${emo("🎭", 180, 170, 60)}${emo("🌳", 160, 860, 80)}${emo("✨", 300, 150, 40, "bob")}` },
  beach: { ground: "#fde68a", patch: "#fcd34d", tex: "#b45309", deco: () => `<path d="M1000 0 H1600 V560 Q1400 600 1200 520 Q1060 470 1000 380Z" fill="#38bdf8" ${K}/>${emo("🏖️", 1180, 240, 90)}${emo("🐙", 1350, 300, 70, "bob")}${emo("⛵", 1460, 150, 70)}${emo("🐬", 1300, 440, 60, "bob")}${emo("🌴", 160, 860, 90)}${emo("🦀", 300, 920, 50)}${emo("☀️", 200, 160, 80)}` },
  garden: { ground: "#bbf7d0", patch: "#86efac", deco: () => `${emo("🌈", 1300, 200, 140)}${emo("🌷", 1120, 420, 60)}${emo("🌻", 1460, 440, 70)}${emo("🦋", 1180, 330, 50, "bob")}${emo("🐞", 1420, 340, 44)}${emo("🌸", 160, 860, 60)}${emo("🐝", 260, 160, 44, "bob")}${emo("🍄", 320, 900, 50)}` },
});

// The newest places are drawn as big pictures on a little round stage.
const PLACE_PICS = {
  toyshop: ["🧸", "🪀", "🪙"], numtrain: ["🚃", "🔢", "🚂"], blocks: ["🧱", "🏗️", "🔢"], veggarden: ["🥕", "🥒", "🧺"], dinomuseum: ["🦕", "🦖", "📏"],
  theater: ["🎭", "🎤", "🎟️"], opposites: ["🔄", "☀️", "🌙"], storylib: ["📕", "📖", "🐣"], playground: ["🛝", "🏃", "⚽"], wordcave: ["💎", "🔤", "🔦"],
  enfamily: ["👪", "👵", "👶"], enhome: ["🏠", "🛏️", "🪑"], enshapes: ["🔷", "🔺", "⭐"], entoys: ["🪁", "🧸", "🧩"],
  ensea: ["🐙", "🐋", "🦀"], enweather: ["🌦️", "🌈", "❄️"], enfruits: ["🍍", "🍒", "🍋"], envehicles: ["🚗", "🚌", "🚲"], enclothes: ["👕", "👗", "🧦"],
  enbugs: ["🐞", "🦋", "🐝"], enfeelings: ["😀", "😢", "😴"], ensizes: ["🐘", "🐭", "📏"], enyesno: ["👍", "👎", "❓"], encolorshape: ["🔺", "🟦", "🟡"],
};

// ===================== Neighborhood screens, in the same style as the big maps (2026-11-16) =====================
// Every place: a raised platform with three big pictures and a ribbon (same look everywhere).
Object.assign(PLACE_PICS, {
  letters: ["📚", "✏️", "🔤"], circus: ["🎪", "🎈", "🤹"], reading: ["🪧", "📖", "🌳"], bakery: ["🎂", "🧁", "🍪"], writing: ["✏️", "📝", "🖍️"],
  treasure: ["🏝️", "💰", "🗺️"], zoo: ["🦁", "🦒", "🐘"], numbers: ["🤖", "🌉", "🔢"], underwater: ["🐠", "🐚", "🫧"], market: ["🍉", "🧺", "🍎"],
  music: ["🥁", "🎵", "🎺"], lab: ["🧪", "🔬", "⚗️"], forest: ["🌳", "🍄", "🦉"], fire: ["🚒", "🔥", "🧯"], train: ["🚂", "🎫", "🚉"],
  stadium: ["🏟️", "⚽", "🏆"], dragon: ["🐉", "💎", "🏔️"], studio: ["🎨", "🖌️", "🖼️"], space: ["🚀", "🪐", "⭐"], ice: ["⛄", "❄️", "🧊"],
  monster: ["👾", "🍪", "🍩"], maze: ["🧭", "🐾", "🏁"], farm: ["🚜", "🐄", "🌾"], post: ["📮", "✉️", "📦"], lunapark: ["🎡", "🎠", "🎢"],
  shapes: ["🔷", "🔺", "⭕"], giants: ["📏", "🐘", "🐭"], magic: ["🧙", "✨", "🪄"], fishing: ["🎣", "🐟", "🚣"], meteors: ["☄️", "🌠", "🪐"],
  enfood: ["🍎", "🍕", "🍔"], enanimals: ["🐶", "🐄", "🐷"], encolors: ["🎨", "🌈", "🖍️"], ennumbers: ["🔟", "🧮", "🎲"], enabc: ["🔤", "🅰️", "🅱️"], enbody: ["🧍", "✋", "👃"],
});
const placePics = (id) => {
  const [a, b, c] = PLACE_PICS[id] || ["⭐", "✨", "🎈"];
  return `${emo(a, 0, -50, 120)}${emo(b, -105, 4, 58, "bob")}${emo(c, 105, 0, 54)}`;
};

// Ground colors and scenery for each kind of neighborhood.
const HOOD_LOOK = {
  town:     { g: ["#d9f99d", "#84cc16", "#4d7c0f"], deco: ["🏡", "🏠", "🌳", "📚", "🏘️", "🌻", "🌳", "🏡", "🌷", "🐈", "🌳", "🚲"] },
  woods:    { g: ["#86efac", "#16a34a", "#14532d"], deco: ["🌲", "🌲", "🍄", "🦉", "🌳", "🦊", "🌲", "🦌", "🍄", "🌲", "🐿️", "🌳"] },
  bay:      { g: ["#a5f3fc", "#22d3ee", "#0e7490"], deco: ["🐚", "⛵", "🐠", "🌴", "🦀", "🐬", "⛵", "🌊", "🐙", "🏝️", "🐟", "🌴"] },
  harbor:   { g: ["#fef3c7", "#fcd34d", "#b45309"], deco: ["⚓", "⛵", "🛳️", "🦀", "🌴", "🐚", "🏝️", "🐟", "🚢", "🪝", "🌴", "🐬"] },
  downtown: { g: ["#e2e8f0", "#94a3b8", "#475569"], deco: ["🏢", "🏙️", "🏬", "🚕", "🚦", "🏢", "🚌", "🌳", "🏬", "🚓", "🏙️", "🚲"] },
  edge:     { g: ["#c7d2fe", "#6366f1", "#1e1b4b"], deco: ["🪐", "⭐", "🌙", "🛰️", "☄️", "❄️", "🌟", "👽", "⭐", "🌠", "🪐", "❄️"] },
  toys:     { g: ["#fed7aa", "#fb923c", "#c2410c"], deco: ["🎁", "🧸", "🪀", "🎲", "🚂", "🎈", "🪁", "🧩", "🎁", "🦕", "🎈", "🧸"] },
  stories:  { g: ["#fef9c3", "#fde047", "#a16207"], deco: ["📚", "🏰", "🦉", "📖", "🌳", "🎭", "✨", "🐉", "📕", "🌳", "🧚", "✨"] },
  en:       { g: ["#fbcfe8", "#f472b6", "#9d174d"], deco: ["🏠", "🍎", "🐶", "🚌", "🌳", "👋", "🎈", "🍕", "🌳", "🐱", "🎈", "🚕"] },
  fun:      { g: ["#fde68a", "#fb923c", "#be123c"], deco: ["🎪", "🎈", "🍭", "🎢", "🍦", "🎠", "🎈", "🧸", "🍿", "🎡", "🎈", "🍭"] },
  beach:    { g: ["#fef3c7", "#fcd34d", "#d97706"], deco: ["🏖️", "🌴", "⛵", "🐚", "🦀", "☀️", "🌴", "🐬", "🏄", "⛱️", "🐙", "🌴"] },
  garden:   { g: ["#dcfce7", "#4ade80", "#166534"], deco: ["🌈", "🌷", "🌻", "🦋", "🐞", "🌸", "🐝", "🍄", "🌼", "🌷", "🦋", "🌳"] },
};
const DECO_SLOTS = [[1150, 170, 90], [1360, 230, 80], [1520, 140, 70], [1120, 440, 64], [1500, 470, 76], [170, 150, 80],
  [360, 170, 60], [140, 820, 84], [270, 920, 60], [1560, 680, 64], [620, 520, 56], [1050, 600, 52]];
const HOOD_SPOTS2 = [[1290, 780], [900, 820], [500, 770], [330, 450], [760, 290]];
const hoodSpots = (n) => (n >= 5 ? HOOD_SPOTS2 : n === 3 ? [HOOD_SPOTS2[0], HOOD_SPOTS2[2], HOOD_SPOTS2[4]] : HOOD_SPOTS2.slice(0, n));

function hoodSVG(hoodId, player) {
  const h = NEIGHBORHOODS.find((x) => x.id === hoodId);
  const look = HOOD_LOOK[h.theme] || HOOD_LOOK.town;
  const spots = hoodSpots(h.zones.length);
  const places = h.zones.map((zid, i) => {
    const z = ZONES.find((x) => x.id === zid);
    const n = player.zones[zid] || 0;
    return districtHTML({ id: zid, kind: "zone", x: spots[i][0], y: spots[i][1], title: z.title, color: z.color,
      art: placePics(zid), open: true, count: n ? `⭐ ${n}` : `${i + 1}`, rx: 150, ry: 66 });
  }).join("");
  const deco = DECO_SLOTS.map(([x, y, s], i) => emo(look.deco[i % look.deco.length], x, y, s, i % 4 === 1 ? "bob" : "")).join("");
  return `
  <svg viewBox="0 0 ${WORLD_W} ${WORLD_H}" class="map-svg hood-svg wow" role="img" aria-label="${h.title}">
    <defs>${MAP_DEFS}
      <radialGradient id="hoodGround" cx=".5" cy=".45" r=".8">${look.g.map((c, i) => `<stop offset="${i / 2}" stop-color="${c}"/>`).join("")}</radialGradient>
    </defs>
    <rect width="1600" height="1000" fill="url(#hoodGround)"/>
    <rect width="1600" height="1000" fill="url(#grass2)"/>
    <g fill="#fff" opacity=".18"><ellipse cx="420" cy="260" rx="320" ry="120"/><ellipse cx="1150" cy="620" rx="300" ry="100"/><ellipse cx="900" cy="140" rx="260" ry="70"/></g>
    <rect width="1600" height="1000" fill="url(#landLight)"/>
    ${deco}
    ${sky()}
    ${glowingRoad([[1680, 900], ...spots])}
    ${places}
    <g transform="translate(1520 935)">${ribbonHTML("🚩 כניסה", "#16a34a", 170, -28)}</g>
    <rect width="1600" height="1000" fill="url(#vignette)" pointer-events="none"/>
    ${tokenHTML()}
  </svg>`;
}

for (const id of Object.keys(PLACE_PICS)) PLACE_ART[id] = PLACE_ART[id] && !PLACE_PICS[id] ? PLACE_ART[id] : () => placePics(id);
