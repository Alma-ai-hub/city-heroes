// The illustrated city map: a road through all the places, and the hero walking along it.

const MAP_W = 1600, MAP_H = 1000;

// Where each place sits on the map (same order as ZONES = the order of the road).
const SPOTS = {
  letters: [1360, 800], reading: [985, 845], writing: [610, 815], zoo: [235, 715],
  numbers: [470, 520], market: [860, 455], train: [1300, 470], space: [1310, 195], fortress: [520, 175],
};

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
const ROAD_PTS = [[1660, 880], ...ZONES.map((z) => SPOTS[z.id])];
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

function mapSVG(player) {
  const done = player.zones;
  const scenery = `
    ${cloud(230, 70, 0.9)}${cloud(820, 60, 1.1)}${cloud(1470, 80, 0.8)}
    ${tower(985, 380, 60, 170, "#475569")}${tower(1045, 380, 50, 220, "#334155")}${tower(1100, 380, 56, 140, "#64748b")}${tower(1150, 380, 40, 190, "#1e293b")}
    ${house(1500, 650, "#fecaca", "#b91c1c")}${house(1190, 660, "#fef3c7", "#c2410c")}${house(790, 670, "#e0f2fe", "#1d4ed8")}
    ${house(380, 860, "#ede9fe", "#7c3aed")}${house(1500, 960, "#dcfce7", "#15803d")}${house(80, 930, "#fef9c3", "#ca8a04")}
    ${house(660, 330, "#ffe4e6", "#be123c")}${house(1480, 400, "#e0e7ff", "#4338ca")}
    ${tree(1180, 860)}${tree(1230, 900, 0.8)}${tree(800, 950, 0.9)}${tree(450, 960)}${tree(60, 790, 1.1)}${tree(110, 610, 0.9)}
    ${tree(1560, 520, 0.9)}${tree(1110, 580, 0.8)}${tree(700, 610, 0.8)}${tree(1530, 260, 0.9)}${tree(1450, 590, 0.7)}
    ${tree(190, 330, 0.9, "#4c1d95")}${tree(90, 230, 0.8, "#4c1d95")}${tree(800, 250, 0.8, "#4c1d95")}`;

  const places = ZONES.map((z, i) => {
    const [x, y] = SPOTS[z.id];
    const n = done[z.id] || 0;
    return `
      <g class="spot" data-zone="${z.id}" transform="translate(${x} ${y})" tabindex="0" role="button" aria-label="${z.title}">
        <ellipse cx="0" cy="56" rx="110" ry="18" fill="#0003"/>
        <g class="spot-art">${PLACE_ART[z.id]()}</g>
        <g transform="translate(0 92)">
          <rect x="-104" y="-22" width="208" height="44" rx="12" fill="${INK}" transform="translate(5 5)"/>
          <rect x="-104" y="-22" width="208" height="44" rx="12" fill="#fff" stroke="${INK}" stroke-width="4"/>
          <rect x="-104" y="-22" width="16" height="44" rx="6" fill="${z.color}" stroke="${INK}" stroke-width="4"/>
          <text x="8" y="10" text-anchor="middle" class="spot-label">${z.title}</text>
        </g>
        <g transform="translate(96 -96)">
          <circle r="24" fill="${n ? "#facc15" : "#fff"}" stroke="${INK}" stroke-width="4"/>
          <text y="9" text-anchor="middle" class="spot-count">${n ? n : i + 1}</text>
        </g>
        ${n ? `<text x="96" y="-60" text-anchor="middle" font-size="16">⭐</text>` : ""}
      </g>`;
  }).join("");

  return `
  <svg viewBox="0 0 ${MAP_W} ${MAP_H}" class="map-svg" role="img" aria-label="מפת העיר">
    <defs>
      <pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="2.2" fill="#000" opacity=".08"/></pattern>
      <radialGradient id="evil" cx="520" cy="150" r="480" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#2e1065" stop-opacity=".95"/><stop offset=".6" stop-color="#581c87" stop-opacity=".55"/><stop offset="1" stop-color="#581c87" stop-opacity="0"/></radialGradient>
      <radialGradient id="spaceGlow" cx="1310" cy="160" r="300" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#1e1b4b" stop-opacity=".85"/><stop offset="1" stop-color="#1e1b4b" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="${MAP_W}" height="${MAP_H}" fill="#86efac"/>
    <g fill="#4ade80"><ellipse cx="300" cy="880" rx="260" ry="90"/><ellipse cx="1250" cy="640" rx="300" ry="80"/><ellipse cx="900" cy="300" rx="260" ry="90"/><ellipse cx="1500" cy="120" rx="200" ry="80"/></g>
    <rect width="${MAP_W}" height="${MAP_H}" fill="url(#evil)"/>
    <rect width="${MAP_W}" height="${MAP_H}" fill="url(#spaceGlow)"/>
    <g fill="#fef9c3">${Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 137) % 1600}" cy="${(i * 53) % 260}" r="${i % 3 ? 1.6 : 2.6}" opacity="${i % 2 ? 0.8 : 0.5}"/>`).join("")}</g>
    <path d="M-20 545 C200 520 360 520 470 520 S760 655 1000 660 S1400 615 1620 650" fill="none" stroke="${INK}" stroke-width="76" stroke-linecap="round"/>
    <path d="M-20 545 C200 520 360 520 470 520 S760 655 1000 660 S1400 615 1620 650" fill="none" stroke="#38bdf8" stroke-width="66" stroke-linecap="round"/>
    <path d="M-20 545 C200 520 360 520 470 520 S760 655 1000 660 S1400 615 1620 650" fill="none" stroke="#bae6fd" stroke-width="6" stroke-dasharray="30 60" class="water"/>
    ${scenery}
    <path d="${ROAD_D}" fill="none" stroke="${INK}" stroke-width="60" stroke-linecap="round"/>
    <path d="${ROAD_D}" fill="none" stroke="#fcd9a8" stroke-width="50" stroke-linecap="round"/>
    <path d="${ROAD_D}" id="road" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="22 20"/>
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
function spotLengths(path) {
  const total = path.getTotalLength();
  const out = {};
  for (const z of ZONES) {
    const [x, y] = SPOTS[z.id];
    let best = 0, bestD = Infinity;
    for (let L = 0; L <= total; L += 4) {
      const p = path.getPointAtLength(L);
      const d = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (d < bestD) { bestD = d; best = L; }
    }
    out[z.id] = best;
  }
  return out;
}

// Move the hero token along the road from one place to another, then call done().
function walkToken(svg, fromZone, toZone, done) {
  const path = svg.querySelector("#road");
  const token = svg.querySelector("#token");
  const lens = spotLengths(path);
  const a = lens[fromZone] ?? lens.letters, b = lens[toZone];
  const place = (L) => { const p = path.getPointAtLength(L); token.setAttribute("transform", `translate(${p.x} ${p.y - 30})`); };
  if (Math.abs(a - b) < 5) { place(b); done(); return; }
  const dur = Math.min(2600, Math.max(700, Math.abs(b - a) * 1.1));
  const t0 = performance.now();
  let lastStep = 0;
  token.classList.add("walking");
  const step = (now) => {
    const t = Math.min(1, (now - t0) / dur);
    const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    place(a + (b - a) * e);
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
  svg.querySelector("#token").setAttribute("transform", `translate(${p.x} ${p.y - 30})`);
}
