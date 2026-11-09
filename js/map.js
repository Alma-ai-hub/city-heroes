// The illustrated city map: a long winding road through all the places (from the start at
// the bottom up to Dr. Balagan's fortress at the top), and the hero walking along it.

const MAP_W = 1600;
const ROW_Y = [2440, 2040, 1640, 1240, 840];   // the rows of places, bottom to top
const COL_X = [1340, 980, 620, 260];          // right to left (Hebrew reading order)
const FORTRESS_AT = [800, 400];
const MAP_H = 2640;

// Places go 4 per row, snaking: right→left, then left→right, and so on. The last is the fortress.
const SPOTS = {};
ZONES.forEach((z, i) => {
  if (z.id === "fortress") { SPOTS[z.id] = FORTRESS_AT; return; }
  const row = Math.floor(i / 4), col = i % 4;
  SPOTS[z.id] = [row % 2 === 0 ? COL_X[col] : COL_X[3 - col], ROW_Y[row]];
});

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
// The road: through every place, with a turn at the end of each row.
const ROAD_PTS = (() => {
  const pts = [[1660, 2500]];
  ZONES.forEach((z, i) => {
    pts.push(SPOTS[z.id]);
    const row = Math.floor(i / 4);
    if (z.id !== "fortress" && i % 4 === 3) pts.push([row % 2 === 0 ? 105 : 1495, ROW_Y[row] - 200]);
  });
  return pts;
})();
const ROAD_D = smoothPath(ROAD_PTS);


// ---------- scenery ----------
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

function mapSVG(player) {
  const done = player.zones;
  // Little houses and trees between the rows of places.
  const decor = [];
  const between = [2600, 2240, 1440, 1040, 640];
  const houseColors = [["#fecaca", "#b91c1c"], ["#fef3c7", "#c2410c"], ["#e0f2fe", "#1d4ed8"], ["#ede9fe", "#7c3aed"], ["#dcfce7", "#15803d"], ["#ffe4e6", "#be123c"]];
  between.forEach((y, r) => {
    for (let k = 0; k < 7; k++) {
      const x = 220 + k * 190 + ((k * 53 + r * 31) % 50) - 25;
      const yy = y + ((k * 29 + r * 17) % 40) - 20;
      if ((k + r) % 3 === 0) { const [w, rf] = houseColors[(k + r) % houseColors.length]; decor.push(house(x, yy, w, rf)); }
      else decor.push(tree(x, yy, 0.8 + ((k + r) % 3) * 0.15, r >= 4 ? "#4c1d95" : (k % 2 ? "#16a34a" : "#22c55e")));
    }
  });
  const skyline = `${tower(740, 1080, 56, 170, "#475569")}${tower(800, 1080, 50, 220, "#334155")}${tower(856, 1080, 56, 140, "#64748b")}`;

  const places = ZONES.map((z, i) => {
    const [x, y] = SPOTS[z.id];
    const n = done[z.id] || 0;
    return `
      <g class="spot" data-zone="${z.id}" transform="translate(${x} ${y})" tabindex="0" role="button" aria-label="${z.title}">
        <ellipse cx="0" cy="56" rx="110" ry="18" fill="#0003"/>
        <g class="spot-art">${PLACE_ART[z.id]()}</g>
        <g transform="translate(0 96)">
          <rect x="-112" y="-22" width="224" height="44" rx="12" fill="${INK}" transform="translate(5 5)"/>
          <rect x="-112" y="-22" width="224" height="44" rx="12" fill="#fff" stroke="${INK}" stroke-width="4"/>
          <rect x="-112" y="-22" width="16" height="44" rx="6" fill="${z.color}" stroke="${INK}" stroke-width="4"/>
          <text x="8" y="10" text-anchor="middle" class="spot-label">${z.title}</text>
        </g>
        <g transform="translate(100 -100)">
          <circle r="24" fill="${n ? "#facc15" : "#fff"}" stroke="${INK}" stroke-width="4"/>
          <text y="9" text-anchor="middle" class="spot-count">${i + 1}</text>
        </g>
        ${n ? `<g transform="translate(100 -62)"><rect x="-26" y="-13" width="52" height="24" rx="12" fill="${INK}"/><text y="5" text-anchor="middle" class="spot-done">⭐${n}</text></g>` : ""}
      </g>`;
  }).join("");

  const river = "M-20 1850 C200 1810 420 1880 700 1850 S1200 1800 1620 1860";
  return `
  <svg viewBox="0 0 ${MAP_W} ${MAP_H}" class="map-svg" role="img" aria-label="מפת העיר">
    <defs>
      <pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="2.2" fill="#000" opacity=".08"/></pattern>
      <radialGradient id="evil" cx="800" cy="330" r="700" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#2e1065" stop-opacity=".95"/><stop offset=".55" stop-color="#581c87" stop-opacity=".6"/><stop offset="1" stop-color="#581c87" stop-opacity="0"/></radialGradient>
      <radialGradient id="night" cx="620" cy="800" r="260" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#1e1b4b" stop-opacity=".9"/><stop offset="1" stop-color="#1e1b4b" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="${MAP_W}" height="${MAP_H}" fill="#86efac"/>
    <g fill="#4ade80"><ellipse cx="300" cy="2560" rx="280" ry="90"/><ellipse cx="1250" cy="2230" rx="300" ry="80"/><ellipse cx="900" cy="1450" rx="300" ry="90"/><ellipse cx="400" cy="1050" rx="260" ry="80"/></g>
    <rect width="${MAP_W}" height="${MAP_H}" fill="url(#evil)"/>
    <rect width="${MAP_W}" height="${MAP_H}" fill="url(#night)"/>
    <g fill="#fef9c3">${Array.from({ length: 60 }, (_, i) => `<circle cx="${(i * 137) % 1600}" cy="${(i * 53) % 700}" r="${i % 3 ? 1.8 : 3}" opacity="${i % 2 ? 0.8 : 0.5}" class="${i % 5 ? "" : "twinkle"}"/>`).join("")}</g>
    <ellipse cx="1360" cy="1650" rx="250" ry="160" fill="#0ea5e9" stroke="${INK}" stroke-width="5"/>
    <ellipse cx="260" cy="1250" rx="230" ry="150" fill="#166534" opacity=".55"/>
    <ellipse cx="260" cy="860" rx="230" ry="140" fill="#f0f9ff" stroke="${INK}" stroke-width="4"/>
    <ellipse cx="1340" cy="860" rx="230" ry="130" fill="#a8a29e" opacity=".6"/>
    <path d="${river}" fill="none" stroke="${INK}" stroke-width="76" stroke-linecap="round"/>
    <path d="${river}" fill="none" stroke="#38bdf8" stroke-width="66" stroke-linecap="round"/>
    <path d="${river}" fill="none" stroke="#bae6fd" stroke-width="6" stroke-dasharray="30 60" class="water"/>
    ${decor.join("")}${skyline}
    ${cloud(260, 120, 0.9)}${cloud(1380, 150, 1)}${cloud(900, 1180, 0.8)}${cloud(300, 2000, 0.8)}${cloud(1250, 2400, 0.9)}
    <path d="${ROAD_D}" fill="none" stroke="${INK}" stroke-width="60" stroke-linecap="round"/>
    <path d="${ROAD_D}" fill="none" stroke="#fcd9a8" stroke-width="50" stroke-linecap="round"/>
    <path d="${ROAD_D}" id="road" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="22 20"/>
    <g ${K}><rect x="1442" y="1790" width="16" height="120" rx="4" fill="#92400e"/><rect x="1542" y="1790" width="16" height="120" rx="4" fill="#92400e"/></g>
    <g transform="translate(1560 2560)"><rect x="-60" y="-26" width="120" height="44" rx="10" fill="#22c55e" ${K}/><text y="6" text-anchor="middle" class="spot-label" fill="#fff">התחלה</text></g>
    <rect width="${MAP_W}" height="${MAP_H}" fill="url(#dots)" pointer-events="none"/>
    ${places}
    <g id="token" pointer-events="none">
      <ellipse cx="0" cy="40" rx="30" ry="8" fill="#0005"/>
      <g class="token-bob">
        <path d="M0 40 L-16 14 H16Z" fill="${INK}"/>
        <circle r="40" fill="#fff" stroke="${INK}" stroke-width="5"/>
        <g transform="translate(-36 -36)">${heroFaceSVG(hero, 72)}</g>
      </g>
    </g>
  </svg>`;
}

// Points along the road where each place is (found once, after the map is drawn).
let spotLenCache = null;
function spotLengths(path) {
  if (spotLenCache) return spotLenCache;
  const total = path.getTotalLength();
  const out = {};
  for (const z of ZONES) {
    const [x, y] = SPOTS[z.id];
    let best = 0, bestD = Infinity;
    for (let L = 0; L <= total; L += 6) {
      const p = path.getPointAtLength(L);
      const d = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (d < bestD) { bestD = d; best = L; }
    }
    out[z.id] = best;
  }
  return (spotLenCache = out);
}

// Keep the hero on screen while the page scrolls.
function followToken(token, smooth) {
  const r = token.getBoundingClientRect();
  const off = r.top + r.height / 2 - window.innerHeight / 2;
  if (Math.abs(off) > 30) window.scrollBy({ top: smooth ? off * 0.12 : off, behavior: "instant" });
}

// Move the hero token along the road from one place to another, then call done().
function walkToken(svg, fromZone, toZone, done) {
  const path = svg.querySelector("#road");
  const token = svg.querySelector("#token");
  const lens = spotLengths(path);
  const a = lens[fromZone] ?? lens.letters, b = lens[toZone];
  const place = (L) => { const p = path.getPointAtLength(L); token.setAttribute("transform", `translate(${p.x} ${p.y - 30})`); };
  if (Math.abs(a - b) < 5) { place(b); done(); return; }
  const dur = Math.min(3200, Math.max(700, Math.abs(b - a) * 0.6));
  const t0 = performance.now();
  let lastStep = 0;
  token.classList.add("walking");
  const step = (now) => {
    const t = Math.min(1, (now - t0) / dur);
    const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    place(a + (b - a) * e);
    followToken(token, true);
    if (now - lastStep > 180) { Sfx.step(); lastStep = now; }
    if (t < 1) requestAnimationFrame(step);
    else { token.classList.remove("walking"); setTimeout(done, 250); }
  };
  requestAnimationFrame(step);
}

function placeToken(svg, zoneId) {
  const path = svg.querySelector("#road");
  const L = spotLengths(path)[zoneId] ?? 0;
  const p = path.getPointAtLength(L);
  const token = svg.querySelector("#token");
  token.setAttribute("transform", `translate(${p.x} ${p.y - 30})`);
  requestAnimationFrame(() => followToken(token, false));
}
