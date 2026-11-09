// More challenges, for the newer places in the city.
// Same rules as challenges.js: draw into `el`, call api.correct() when solved,
// api.mistake() for a wrong try, and return the sentence to speak.

const SVG_INK = `stroke="#111" stroke-width="4" stroke-linejoin="round"`;
const BALLOON_COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ec4899", "#14b8a6", "#f97316"];

function hintGlow(btn) { if (btn) btn.classList.add("hint"); }
function shakeIt(node) { node.classList.remove("shake"); void node.offsetWidth; node.classList.add("shake"); }

// ================= Circus: balloons =================
function balloonSVG(label, color) {
  return `<svg viewBox="0 0 80 124" class="balloon-svg" aria-hidden="true">
    <path d="M40 98 Q30 108 40 116 Q48 122 40 124" stroke="#111" stroke-width="2.5" fill="none"/>
    <path d="M40 4 C64 4 76 24 76 44 C76 70 56 88 40 90 C24 88 4 70 4 44 C4 24 16 4 40 4Z" fill="${color}" ${SVG_INK}/>
    <path d="M34 90 L46 90 L40 99Z" fill="${color}" stroke="#111" stroke-width="3" stroke-linejoin="round"/>
    <ellipse cx="25" cy="27" rx="7" ry="12" fill="#ffffff88" transform="rotate(-25 25 27)"/>
    <text x="40" y="60" text-anchor="middle" class="balloon-text">${label}</text>
  </svg>`;
}

// A field of floating balloons. Either pop all the targets (any order), or pop in a set order.
function balloonField(el, api, { text, speech, labels, targets, ordered, showLetter }) {
  el.innerHTML = `
    ${promptHTML(text)}
    ${showLetter ? `<div class="visual"><span class="letter-card small">${showLetter}</span></div>` : ""}
    ${ordered ? `<div class="popped-row" dir="ltr">${ordered.map(() => `<span class="pop-slot"></span>`).join("")}</div>` : ""}
    <div class="balloon-field">
      ${labels.map((l, i) => `<button class="balloon" data-i="${i}" style="--d:${(i % 5) * 0.37}s;--y:${(i * 37) % 30}px">${balloonSVG(l, BALLOON_COLORS[i % BALLOON_COLORS.length])}</button>`).join("")}
    </div>`;
  wireSpeak(el, api, speech);
  const btns = [...el.querySelectorAll(".balloon")];
  let step = 0, wrong = 0, left = ordered ? ordered.length : targets.length;
  const nextTarget = () => btns.find((b) => !b.disabled && (ordered ? String(labels[b.dataset.i]) === String(ordered[step]) : targets.includes(+b.dataset.i)));
  btns.forEach((b) => b.addEventListener("click", () => {
    if (b.disabled || left <= 0) return;
    const i = +b.dataset.i;
    const ok = ordered ? String(labels[i]) === String(ordered[step]) : targets.includes(i);
    if (ok) {
      Sfx.pop();
      b.disabled = true;
      b.classList.add("popped");
      btns.forEach((x) => x.classList.remove("hint"));
      if (ordered) { el.querySelectorAll(".pop-slot")[step].textContent = labels[i]; step++; }
      left--; wrong = 0;
      if (left === 0) api.correct();
    } else {
      wrong++;
      shakeIt(b);
      api.mistake({ quiet: true });
      if (wrong >= 2) hintGlow(nextTarget());
    }
  }));
  return speech;
}

function balloonLetters(el, lvl, api) {
  const pool = lvl <= 1 ? EASY_LETTERS : LETTERS.map((x) => x.l);
  const target = fresh(pool);
  const total = lvl <= 1 ? 6 : 8;
  const nTargets = lvl <= 1 ? 2 : 3;
  const others = otherLetters(target, 4, lvl);
  const labels = shuffle([...Array(nTargets).fill(target), ...Array.from({ length: total - nTargets }, (_, i) => others[i % others.length])]);
  const targets = labels.map((l, i) => (l === target ? i : -1)).filter((i) => i >= 0);
  const speech = `פּוֹצֵץ אֶת כׇּל הַבָּלוֹנִים עִם הָאוֹת ${letterName(target)}`;
  return balloonField(el, api, { text: "פוצץ את כל הבלונים עם האות ששמעת", speech, labels, targets, showLetter: lvl <= 1 ? target : null });
}

function balloonOrder(el, lvl, api) {
  let nums;
  if (lvl <= 1) nums = [1, 2, 3, 4];
  else if (lvl === 2) { const s = rand(1, 8); nums = Array.from({ length: 5 }, (_, i) => s + i); }
  else { const set = new Set(); while (set.size < 5) set.add(rand(1, 20)); nums = [...set].sort((a, b) => a - b); }
  const speech = "פּוֹצֵץ אֶת הַבָּלוֹנִים לְפִי הַסֵּדֶר, מֵהַמִּסְפָּר הַקָּטָן לַגָּדוֹל";
  return balloonField(el, api, { text: "פוצץ לפי הסדר: מהקטן לגדול", speech, labels: shuffle(nums), ordered: nums });
}

function balloonNumber(el, lvl, api) {
  const top = lvl <= 1 ? 10 : 20;
  const target = rand(1, top);
  const set = new Set([target]);
  while (set.size < (lvl <= 1 ? 5 : 7)) set.add(rand(1, top));
  const labels = shuffle([...set]);
  const speech = `פּוֹצֵץ אֶת הַבָּלוֹן עִם הַמִּסְפָּר ${target}`;
  return balloonField(el, api, { text: "פוצץ את הבלון עם המספר ששמעת", speech, labels, targets: [labels.indexOf(target)] });
}

// ================= Bakery =================
function cakeSVG(candles) {
  const xs = Array.from({ length: candles }, (_, i) => 150 + (i - (candles - 1) / 2) * Math.min(24, 200 / Math.max(candles, 1)));
  return `<svg viewBox="0 0 300 230" class="cake-svg">
    <ellipse cx="150" cy="212" rx="135" ry="14" fill="#cbd5e1" ${SVG_INK}/>
    <rect x="40" y="140" width="220" height="70" rx="14" fill="#f9a8d4" ${SVG_INK}/>
    <rect x="60" y="92" width="180" height="56" rx="12" fill="#fde68a" ${SVG_INK}/>
    <path d="M60 104 Q75 120 90 104 Q105 120 120 104 Q135 120 150 104 Q165 120 180 104 Q195 120 210 104 Q225 120 240 104" fill="none" stroke="#fff" stroke-width="7"/>
    <path d="M40 154 Q58 172 76 154 Q94 172 112 154 Q130 172 148 154 Q166 172 184 154 Q202 172 220 154 Q238 172 260 154" fill="none" stroke="#fff" stroke-width="7"/>
    <g fill="#ef4444" stroke="#111" stroke-width="2.5"><circle cx="90" cy="186" r="7"/><circle cx="150" cy="190" r="7"/><circle cx="210" cy="186" r="7"/></g>
    ${xs.map((x) => `<g class="candle"><rect x="${x - 6}" y="52" width="12" height="42" rx="3" fill="#60a5fa" stroke="#111" stroke-width="3"/>
      <path d="M${x - 6} 62 l12 -6 M${x - 6} 76 l12 -6" stroke="#fff" stroke-width="3"/>
      <path d="M${x} 28 C${x + 9} 38 ${x + 7} 50 ${x} 50 C${x - 7} 50 ${x - 9} 38 ${x} 28Z" fill="#fb923c" stroke="#111" stroke-width="2.5" class="flame-small"/></g>`).join("")}
  </svg>`;
}

function placeCandles(el, lvl, api) {
  const n = lvl <= 1 ? rand(1, 5) : lvl === 2 ? rand(3, 8) : rand(5, 10);
  let count = 0, done = false;
  const speech = `שִׂים עַל הָעוּגָה ${n} נֵרוֹת, וְלַחַץ סִיַּמְתִּי`;
  el.innerHTML = `
    ${promptHTML(`שים על העוגה ${n} נרות`)}
    <div class="bake-row">
      <div class="order-card"><small>הזמנה</small><b>${n}</b><span>${"🕯️".repeat(lvl <= 1 ? n : 0)}</span></div>
      <div class="cake-box">${cakeSVG(0)}</div>
    </div>
    <div class="row-btns">
      <button class="soft-btn big" data-add>➕ עוד נר</button>
      <button class="soft-btn big" data-remove>➖ להוריד נר</button>
      <button class="go-btn" data-done>✔️ סיימתי</button>
    </div>`;
  wireSpeak(el, api, speech);
  const box = el.querySelector(".cake-box");
  const draw = () => { box.innerHTML = cakeSVG(count); };
  el.querySelector("[data-add]").addEventListener("click", () => { if (done || count >= 12) return; count++; Sfx.click(); draw(); });
  el.querySelector("[data-remove]").addEventListener("click", () => { if (done || count <= 0) return; count--; Sfx.click(); draw(); });
  el.querySelector("[data-done]").addEventListener("click", () => {
    if (done) return;
    if (count === n) { done = true; api.correct(); }
    else { api.mistake({ quiet: true }); api.say(count < n ? `יֵשׁ ${count} נֵרוֹת. צָרִיךְ עוֹד` : `יֵשׁ ${count} נֵרוֹת. זֶה יוֹתֵר מִדַּי`); }
  });
  return speech;
}

function tenFrameHTML(k, item) {
  return `<div class="ten-frame" dir="ltr">${Array.from({ length: 10 }, (_, i) => `<span class="${i < k ? "full" : ""}">${i < k ? item : ""}</span>`).join("")}</div>`;
}

function tenFrame(el, lvl, api) {
  const askMissing = lvl >= 3 || (lvl === 2 && Math.random() < 0.5);
  const k = lvl <= 1 ? rand(1, 6) : rand(2, 9);
  const answer = askMissing ? 10 - k : k;
  const speech = askMissing ? "כַּמָּה מְקוֹמוֹת רֵיקִים? כַּמָּה חָסֵר עַד עֶשֶׂר?" : "כַּמָּה עוּגִיּוֹת יֵשׁ בַּתַּבְנִית?";
  choiceQuestion(el, api, {
    text: askMissing ? "כמה חסר כדי שיהיו 10?" : "כמה עוגיות יש בתבנית?",
    speech,
    visual: tenFrameHTML(k, "🍪"),
    options: numberOptions(answer, 0, 10).map((x) => ({ value: x, html: `<span class="num">${x}</span>` })),
    answer,
    optionClass: "numbers",
  });
  return speech;
}

function addPictures(el, lvl, api) {
  const max = lvl <= 1 ? 5 : 10;
  const a = rand(1, max - 1), b = rand(1, max - a);
  const item = pick(["🍪", "🧁", "🍩", "🥐", "🍓"]);
  const plate = (n) => `<div class="plate">${Array.from({ length: n }, () => `<i>${item}</i>`).join("")}</div>`;
  const speech = `בַּצַּלַּחַת הָאַחַת יֵשׁ ${a}, וּבַשְּׁנִיָּה ${b}. כַּמָּה יֵשׁ בְּיַחַד?`;
  choiceQuestion(el, api, {
    text: "כמה יש בשתי הצלחות ביחד?",
    speech,
    visual: `<div class="plates" dir="ltr">${plate(a)}<b class="op">+</b>${plate(b)}</div>${lvl >= 2 ? `<div class="equation small" dir="ltr">${a} + ${b} = <span class="blank">?</span></div>` : ""}`,
    options: numberOptions(a + b, 1, 10).map((x) => ({ value: x, html: `<span class="num">${x}</span>` })),
    answer: a + b,
    optionClass: "numbers",
  });
  return speech;
}

// ================= Lab: patterns and thinking =================
const PATTERN_SETS = [["🔴", "🔵", "🟡", "🟢", "🟣"], ["🍎", "🍌", "🍇", "🍓", "🍊"], ["🐶", "🐱", "🐰", "🐻", "🐸"], ["⭐", "🌙", "☀️", "☁️", "⚡"], ["🚗", "🚌", "🚂", "✈️", "🚀"]];

function patternNext(el, lvl, api) {
  const set = shuffle(pick(PATTERN_SETS));
  const units = lvl <= 1 ? ["AB"] : lvl === 2 ? ["AB", "ABC", "AAB"] : ["ABC", "AAB", "ABB", "AABB"];
  const unit = pick(units);
  const map = { A: set[0], B: set[1], C: set[2] };
  const len = unit.length * 2 + rand(1, unit.length);
  const seq = Array.from({ length: len + 1 }, (_, i) => map[unit[i % unit.length]]);
  const answer = seq.pop();
  const opts = shuffle([...new Set([answer, ...shuffle(set.slice(0, 4))])].slice(0, 3).concat());
  if (!opts.includes(answer)) opts[0] = answer;
  const speech = "מָה בָּא אַחַר כָּךְ? תִּסְתַּכֵּל עַל הַסֵּדֶר";
  choiceQuestion(el, api, {
    text: "מה בא אחר כך?",
    speech,
    visual: `<div class="pattern" dir="ltr">${seq.map((s) => `<span>${s}</span>`).join("")}<span class="blank-box">?</span></div>`,
    options: shuffle(opts).map((s) => ({ value: s, html: `<span class="emoji-opt">${s}</span>` })),
    answer,
    optionClass: "pictures",
  });
  return speech;
}

const ODD_GROUPS = [
  { name: "animals", items: ["🐶", "🐱", "🐰", "🐻", "🦁", "🐸", "🐢", "🐘"] },
  { name: "fruit", items: ["🍎", "🍌", "🍇", "🍓", "🍊", "🍉", "🍐"] },
  { name: "vehicles", items: ["🚗", "🚌", "🚂", "✈️", "🚁", "🚲", "🚀"] },
  { name: "clothes", items: ["👕", "👖", "🧢", "👟", "🧦", "🧤"] },
];

function oddOneOut(el, lvl, api) {
  let main, odd, kind = "emoji";
  const useSymbols = lvl >= 2 && Math.random() < 0.5;
  if (useSymbols) {
    kind = "symbol";
    const letters = shuffle(LETTERS.map((x) => x.l)).slice(0, 3);
    const nums = shuffle(["1", "2", "3", "4", "5", "6", "7", "8", "9"]).slice(0, 3);
    if (Math.random() < 0.5) { main = letters; odd = nums[0]; } else { main = nums; odd = letters[0]; }
  } else {
    const [g1, g2] = shuffle(ODD_GROUPS);
    main = shuffle(g1.items).slice(0, 3);
    odd = pick(g2.items);
  }
  const opts = shuffle([...main, odd]);
  const speech = "מָה לֹא שַׁיָּךְ? מְצָא אֶת מָה שֶׁשּׁוֹנֶה מֵהָאֲחֵרִים";
  choiceQuestion(el, api, {
    text: "מה לא שייך?",
    speech,
    visual: `<div class="big-emoji small">🔬</div>`,
    options: opts.map((s) => ({ value: s, html: kind === "symbol" ? `<span class="letter">${s}</span>` : `<span class="emoji-opt">${s}</span>` })),
    answer: odd,
    optionClass: kind === "symbol" ? "letters" : "pictures",
  });
  return speech;
}

function tubeSVG(n, max, color) {
  const h = 20 + (n / max) * 120;
  return `<svg viewBox="0 0 60 190" class="tube-svg">
    <rect x="12" y="10" width="36" height="160" rx="18" fill="#f1f5f9" ${SVG_INK}/>
    <path d="M14 ${170 - h} H46 V152 Q46 168 30 168 Q14 168 14 152Z" fill="${color}"/>
    <rect x="12" y="10" width="36" height="160" rx="18" fill="none" ${SVG_INK}/>
    <rect x="6" y="4" width="48" height="12" rx="5" fill="#cbd5e1" stroke="#111" stroke-width="3"/>
    <path d="M22 30 V140" stroke="#fff" stroke-width="4" opacity=".7" stroke-linecap="round"/>
  </svg>`;
}

function sortNumbers(el, lvl, api) {
  const count = lvl <= 1 ? 3 : lvl === 2 ? 4 : 5;
  const top = lvl <= 1 ? 5 : lvl === 2 ? 10 : 20;
  const set = new Set();
  while (set.size < count) set.add(rand(1, top));
  const sorted = [...set].sort((a, b) => a - b);
  const shown = shuffle(sorted);
  const colors = ["#22c55e", "#3b82f6", "#ec4899", "#f59e0b", "#8b5cf6"];
  const speech = "סַדֵּר אֶת הַמַּבְחֵנוֹת מֵהַמִּסְפָּר הַקָּטָן לַגָּדוֹל";
  el.innerHTML = `
    ${promptHTML("סדר את המבחנות מהקטן לגדול")}
    <div class="rack" dir="ltr">${sorted.map(() => `<span class="rack-slot"></span>`).join("")}</div>
    <div class="tubes" dir="ltr">${shown.map((n, i) => `<button class="tube" data-n="${n}">${tubeSVG(n, top, colors[i % colors.length])}<b>${n}</b></button>`).join("")}</div>`;
  wireSpeak(el, api, speech);
  const slots = el.querySelectorAll(".rack-slot");
  let step = 0, wrong = 0;
  el.querySelectorAll(".tube").forEach((t) => t.addEventListener("click", () => {
    if (t.disabled || step >= sorted.length) return;
    if (+t.dataset.n === sorted[step]) {
      Sfx.click();
      slots[step].appendChild(t);
      t.disabled = true;
      el.querySelectorAll(".tube.hint").forEach((x) => x.classList.remove("hint"));
      step++; wrong = 0;
      if (step === sorted.length) api.correct();
    } else {
      wrong++; shakeIt(t); api.mistake({ quiet: true });
      if (wrong >= 2) hintGlow(el.querySelector(`.tubes .tube[data-n="${sorted[step]}"]`));
    }
  }));
  return speech;
}

// ================= Dragon cave: memory =================
function memoryGame(el, lvl, api) {
  const pairsN = lvl <= 1 ? 3 : 4;
  const withPictures = lvl >= 3;
  let letters = [];
  for (const l of shuffle(EASY_LETTERS.concat(lvl >= 2 ? ["פ", "נ", "כ", "ק", "צ", "ז"] : []))) {
    if (letters.length >= pairsN) break;
    if (letters.some((x) => groupOf(LOOK_ALIKE, x).includes(l))) continue;
    if (withPictures && !WORDS.some((w) => w.w[0] === l && w.lvl <= 2)) continue;
    letters.push(l);
  }
  const cards = [];
  letters.forEach((l, i) => {
    cards.push({ pair: i, face: `<span class="letter">${l}</span>`, say: letterName(l) });
    if (withPictures) {
      const w = pick(WORDS.filter((x) => x.w[0] === l && x.lvl <= 2));
      cards.push({ pair: i, face: `<span class="emoji-opt">${w.e}</span>`, say: w.n });
    } else cards.push({ pair: i, face: `<span class="letter">${l}</span>`, say: letterName(l) });
  });
  const deck = shuffle(cards);
  const speech = withPictures ? "מְצָא זוּגוֹת: אוֹת וּתְמוּנָה שֶׁמַּתְחִילָה בָּהּ" : "מְצָא זוּגוֹת שֶׁל אוֹתִיּוֹת זֵהוֹת";
  el.innerHTML = `
    ${promptHTML(withPictures ? "מצא זוגות: אות ותמונה שמתחילה בה" : "מצא זוגות של אותיות זהות")}
    <div class="memory-grid cols-${deck.length > 6 ? 4 : 3}">
      ${deck.map((c, i) => `<button class="mem-card" data-i="${i}"><span class="mem-inner"><span class="mem-back">🐉</span><span class="mem-front">${c.face}</span></span></button>`).join("")}
    </div>`;
  wireSpeak(el, api, speech);
  let open = [], matched = 0, busy = false;
  el.querySelectorAll(".mem-card").forEach((b) => b.addEventListener("click", () => {
    if (busy || b.classList.contains("flipped")) return;
    const c = deck[+b.dataset.i];
    b.classList.add("flipped");
    Sfx.click();
    api.say(c.say);
    open.push(b);
    if (open.length < 2) return;
    const [x, y] = open;
    open = [];
    if (deck[+x.dataset.i].pair === deck[+y.dataset.i].pair) {
      setTimeout(() => { x.classList.add("matched"); y.classList.add("matched"); Sfx.good(); }, 300);
      matched++;
      if (matched === pairsN) setTimeout(() => api.correct(), 700);
    } else {
      busy = true;
      setTimeout(() => { x.classList.remove("flipped"); y.classList.remove("flipped"); busy = false; }, 1100);
    }
  }));
  return speech;
}

// ================= Fire station =================
function houseNumber(el, lvl, api) {
  let nums;
  if (lvl <= 1) nums = [1, 2, 3, 4, 5];
  else if (lvl === 2) { const s = rand(1, 10); nums = Array.from({ length: 6 }, (_, i) => s + i); }
  else { const set = new Set(); while (set.size < 7) set.add(rand(1, 20)); nums = [...set].sort((a, b) => a - b); }
  const target = pick(nums);
  const roofs = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"];
  const speech = `כַּבֵּה אֶת הַשְּׂרֵפָה בַּבַּיִת מִסְפָּר ${target}`;
  choiceQuestion(el, api, {
    text: "כבה את השריפה בבית עם המספר ששמעת",
    speech,
    visual: `<button class="big-emoji tap" data-again>🚒</button>`,
    options: nums.map((n, i) => ({ value: n, html: `<span class="house"><i class="fire">🔥</i><svg viewBox="0 0 80 90"><path d="M6 40 L40 8 L74 40Z" fill="${roofs[i % roofs.length]}" ${SVG_INK}/><rect x="14" y="38" width="52" height="46" fill="#fef3c7" ${SVG_INK}/><rect x="32" y="58" width="16" height="26" fill="#92400e" stroke="#111" stroke-width="3"/></svg><b>${n}</b></span>` })),
    answer: target,
    optionClass: "houses",
  });
  el.querySelector("[data-again]").addEventListener("click", () => api.say(speech));
  return speech;
}

function ladderOrder(el, lvl, api) {
  const len = lvl <= 1 ? 4 : 5;
  const start = lvl <= 1 ? 1 : lvl === 2 ? rand(1, 6) : rand(5, 15);
  const nums = Array.from({ length: len }, (_, i) => start + i);
  const speech = `בְּנֵה אֶת הַסֻּלָּם: לְחַץ עַל הַמִּסְפָּרִים לְפִי הַסֵּדֶר, מִ-${start} וָמַעְלָה`;
  el.innerHTML = `
    ${promptHTML(`בנה סולם לפי הסדר, מ־${start} ומעלה`)}
    <div class="ladder-wrap">
      <div class="ladder">${nums.slice().reverse().map(() => `<span class="rung"></span>`).join("")}<i class="climber">🧑‍🚒</i></div>
      <div class="tiles">${shuffle(nums).map((n) => `<button class="tile num-tile" data-n="${n}">${n}</button>`).join("")}</div>
    </div>`;
  wireSpeak(el, api, speech);
  const rungs = [...el.querySelectorAll(".rung")].reverse(); // bottom first
  const climber = el.querySelector(".climber");
  let step = 0, wrong = 0;
  el.querySelectorAll(".num-tile").forEach((t) => t.addEventListener("click", () => {
    if (t.disabled || step >= len) return;
    if (+t.dataset.n === nums[step]) {
      Sfx.click();
      rungs[step].textContent = nums[step];
      rungs[step].classList.add("filled");
      t.disabled = true; t.classList.add("used");
      el.querySelectorAll(".num-tile.hint").forEach((x) => x.classList.remove("hint"));
      step++; wrong = 0;
      climber.style.bottom = `${(step / len) * 100}%`;
      if (step === len) api.correct();
    } else {
      wrong++; shakeIt(t); api.mistake({ quiet: true });
      if (wrong >= 2) hintGlow(el.querySelector(`.num-tile[data-n="${nums[step]}"]`));
    }
  }));
  return speech;
}

function countFires(el, lvl, api) {
  const n = rand(lvl <= 1 ? 1 : 3, lvl <= 1 ? 5 : 10);
  const speech = "כַּמָּה שְׂרֵפוֹת יֵשׁ? סְפֹר אוֹתָן";
  choiceQuestion(el, api, {
    text: "כמה שריפות יש? ספור אותן",
    speech,
    visual: `<div class="count-box fires">${Array.from({ length: n }, () => `<span>🔥</span>`).join("")}</div>`,
    options: numberOptions(n, 1, 10).map((x) => ({ value: x, html: `<span class="num">${x}</span>` })),
    answer: n,
    optionClass: "numbers",
  });
  return speech;
}

// ================= Stadium =================
function teamBox(color, name, n, showBalls) {
  return `<div class="team" style="--t:${color}"><span class="shirt">${name}</span>
    <div class="goals">${showBalls ? Array.from({ length: n }, () => "<i>⚽</i>").join("") : ""}</div>
    ${showBalls ? "" : `<b class="score">${n}</b>`}</div>`;
}

function scoreAdd(el, lvl, api) {
  const max = lvl <= 1 ? 5 : 10;
  const a = rand(1, max - 1), b = rand(1, max - a);
  const balls = lvl <= 2;
  const speech = `הַקְּבוּצָה הָאֲדֻמָּה הִבְקִיעָה ${a}, וְהַכְּחֻלָּה הִבְקִיעָה ${b}. כַּמָּה שְׁעָרִים הָיוּ בְּסַךְ הַכֹּל?`;
  choiceQuestion(el, api, {
    text: "כמה שערים היו בסך הכול?",
    speech,
    visual: `<div class="scoreboard" dir="ltr">${teamBox("#ef4444", "אדומים", a, balls)}<b class="op">+</b>${teamBox("#3b82f6", "כחולים", b, balls)}</div>`,
    options: numberOptions(a + b, 0, 10).map((x) => ({ value: x, html: `<span class="num">${x}</span>` })),
    answer: a + b,
    optionClass: "numbers",
  });
  return speech;
}

function playersLeave(el, lvl, api) {
  const max = lvl <= 1 ? 5 : 10;
  const x = rand(2, max), y = rand(1, x - 1);
  const speech = `עַל הַמִּגְרָשׁ הָיוּ ${x} שַׂחְקָנִים. ${y} הָלְכוּ הַבַּיְתָה. כַּמָּה נִשְׁאֲרוּ?`;
  choiceQuestion(el, api, {
    text: `היו ${x} שחקנים. ${y} הלכו הביתה. כמה נשארו?`,
    speech,
    visual: `<div class="field" dir="ltr">${Array.from({ length: x }, (_, i) => `<span class="${i >= x - y ? "leaving" : ""}">${i % 2 ? "🏃‍♂️" : "🏃"}</span>`).join("")}</div>`,
    options: numberOptions(x - y, 0, 10).map((v) => ({ value: v, html: `<span class="num">${v}</span>` })),
    answer: x - y,
    optionClass: "numbers",
  });
  return speech;
}

function whoWon(el, lvl, api) {
  const max = lvl <= 1 ? 6 : 10;
  let a, b;
  do { a = rand(0, max); b = rand(0, max); } while (a === b || Math.abs(a - b) < (lvl <= 1 ? 2 : 1));
  const balls = lvl <= 1;
  const speech = "מִי נִצַּח? הַקְּבוּצָה הָאֲדֻמָּה אוֹ הַקְּבוּצָה הַכְּחֻלָּה?";
  choiceQuestion(el, api, {
    text: "מי ניצח? (מי הבקיע יותר שערים)",
    speech,
    visual: `<div class="scoreboard" dir="ltr">${teamBox("#ef4444", "אדומים", a, balls)}<b class="op">:</b>${teamBox("#3b82f6", "כחולים", b, balls)}</div>`,
    options: [{ value: "red", html: `<span class="team-pick" style="--t:#ef4444">👕 אדומים</span>` }, { value: "blue", html: `<span class="team-pick" style="--t:#3b82f6">👕 כחולים</span>` }],
    answer: a > b ? "red" : "blue",
    optionClass: "teams",
  });
  return speech;
}

// ================= Under the sea: reading =================
const SWAP_LOOKS = { "ד": "ר", "ר": "ד", "ב": "כ", "כ": "ב", "ה": "ח", "ח": "ה", "ו": "ז", "ז": "ו", "ג": "נ", "נ": "ג", "ס": "ם" };

function sameWord(el, lvl, api) {
  const finals = Object.keys(FINAL_TO_NORMAL);
  const list = wordsUpTo(lvl).filter((w) => ![...w.w].some((c) => finals.includes(c)) && w.w.length >= 2 && w.w.length <= (lvl <= 1 ? 3 : 5));
  const word = fresh(list, (w) => w.w);
  const letters = [...word.w];
  const fakes = new Set();
  for (let t = 0; t < 40 && fakes.size < 3; t++) {
    let f;
    if (Math.random() < 0.5) {
      const i = rand(0, letters.length - 1);
      const sw = SWAP_LOOKS[letters[i]] || pick(LETTERS).l;
      f = letters.map((c, j) => (j === i ? sw : c)).join("");
    } else f = shuffle(letters).join("");
    if (f !== word.w) fakes.add(f);
  }
  const opts = shuffle([word.w, ...[...fakes].slice(0, lvl <= 1 ? 2 : 3)]);
  const speech = "מְצָא אֶת הַמִּלָּה שֶׁכְּתוּבָה בְּדִיּוּק אוֹתוֹ דָּבָר";
  choiceQuestion(el, api, {
    text: "מצא את המילה שכתובה בדיוק אותו דבר",
    speech,
    visual: `<div class="read-word sea">${word.w}</div>`,
    options: opts.map((w) => ({ value: w, html: `<span class="word-opt">${w}</span>` })),
    answer: word.w,
    optionClass: "words",
  });
  return speech;
}

function colorWord(el, lvl, api) {
  const pool = COLOR_WORDS.filter((c) => c.lvl <= lvl);
  const target = fresh(pool, (c) => c.w);
  const others = shuffle(COLOR_WORDS.filter((c) => c.w !== target.w && c.lvl <= Math.max(2, lvl))).slice(0, lvl <= 1 ? 2 : 3);
  const speech = "קְרָא אֶת שֵׁם הַצֶּבַע, וְלַחַץ עַל הַצֶּבַע הַזֶּה";
  choiceQuestion(el, api, {
    text: "קרא את שם הצבע ולחץ על הצבע",
    speech,
    visual: `<div class="read-word">${target.n}</div><button class="help-btn" data-read>🙋 עזרה: תקריא לי</button>`,
    options: shuffle([target, ...others]).map((c) => ({ value: c.w, html: `<span class="color-blob" style="--b:${c.c}"></span>` })),
    answer: target.w,
    optionClass: "colors",
  });
  el.querySelector("[data-read]").addEventListener("click", () => api.say(target.n));
  return speech;
}

// ================= Forest: connect the dots, first letter =================
// Letter shapes as lines on a 100×100 grid (each inner list is one line, drawn without lifting the pen).
const LETTER_STROKES = {
  "ו": [[[42, 14], [58, 14], [58, 88]]],
  "ז": [[[24, 14], [76, 14]], [[50, 14], [50, 88]]],
  "י": [[[40, 16], [60, 16], [60, 46]]],
  "ד": [[[14, 16], [84, 16]], [[72, 16], [72, 88]]],
  "ר": [[[16, 16], [62, 16], [80, 30], [80, 88]]],
  "ח": [[[22, 88], [22, 16], [80, 16], [80, 88]]],
  "ה": [[[16, 16], [80, 16], [80, 88]], [[26, 44], [26, 88]]],
  "ת": [[[14, 16], [80, 16], [80, 88]], [[32, 16], [32, 82], [18, 88]]],
  "נ": [[[34, 16], [62, 16], [62, 86], [26, 86]]],
  "ב": [[[16, 16], [70, 16], [70, 80]], [[88, 82], [14, 82]]],
  "כ": [[[16, 16], [70, 16], [84, 32], [84, 68], [70, 84], [16, 84]]],
  "ג": [[[36, 14], [60, 14], [60, 88]], [[60, 58], [32, 88]]],
  "ל": [[[22, 6], [22, 40], [78, 40], [78, 62], [52, 92]]],
  "ס": [[[22, 16], [78, 16], [86, 40], [78, 84], [22, 84], [14, 50], [22, 16]]],
  "ם": [[[18, 16], [82, 16], [82, 86], [18, 86], [18, 16]]],
};

function dotsFor(letter, step) {
  const out = [];
  LETTER_STROKES[letter].forEach((line, s) => {
    line.forEach((p, i) => {
      if (i === 0) { out.push({ x: p[0], y: p[1], s, first: true }); return; }
      const q = line[i - 1];
      const d = Math.hypot(p[0] - q[0], p[1] - q[1]);
      const parts = Math.max(1, Math.round(d / step));
      for (let k = 1; k <= parts; k++) out.push({ x: q[0] + ((p[0] - q[0]) * k) / parts, y: q[1] + ((p[1] - q[1]) * k) / parts, s });
    });
  });
  // A closed shape ends where it started: drop the last dot (it sits on the first one).
  const last = out[out.length - 1], first = out.find((d) => d.s === last.s);
  if (out.length > 2 && Math.hypot(last.x - first.x, last.y - first.y) < 1) out.pop(), (out.closeStroke = last.s);
  return out;
}

function connectDots(el, lvl, api) {
  const easy = ["ו", "ז", "י", "ד", "ר", "ח"];
  const target = fresh(lvl <= 1 ? easy : Object.keys(LETTER_STROKES));
  const dots = dotsFor(target, lvl <= 1 ? 34 : 24);
  const S = 3; // 100 grid → 300 pixels
  const speech = "חַבֵּר אֶת הַנְּקֻדּוֹת לְפִי הַמִּסְפָּרִים, וְתְגַלֶּה אוֹת!";
  el.innerHTML = `
    ${promptHTML("חבר את הנקודות לפי המספרים")}
    <div class="dots-wrap"><svg viewBox="-20 -20 340 340" class="dots-svg">
      <g class="dot-lines"></g>
      <text x="150" y="150" text-anchor="middle" dominant-baseline="central" class="reveal-letter">${target}</text>
      ${dots.map((d, i) => `<g class="dot" data-i="${i}" transform="translate(${d.x * S} ${d.y * S})">
          <circle r="20" class="dot-hit"/><circle r="9" class="dot-c"/>
          <text x="${d.x > 50 ? 16 : -16}" y="-12" text-anchor="middle" class="dot-n">${i + 1}</text></g>`).join("")}
    </svg></div>`;
  wireSpeak(el, api, speech);
  const lines = el.querySelector(".dot-lines");
  const gs = [...el.querySelectorAll(".dot")];
  let next = 0, wrong = 0;
  gs[0].classList.add("next");
  gs.forEach((g) => g.addEventListener("click", () => {
    const i = +g.dataset.i;
    if (i !== next) {
      if (i < next) return;
      wrong++; api.mistake({ quiet: true }); shakeIt(g);
      if (wrong >= 2) gs[next].classList.add("hint-dot");
      return;
    }
    Sfx.click();
    g.classList.remove("next", "hint-dot"); g.classList.add("done");
    const d = dots[i], p = dots[i - 1];
    if (p && p.s === d.s && !d.first) lines.insertAdjacentHTML("beforeend", `<line x1="${p.x * S}" y1="${p.y * S}" x2="${d.x * S}" y2="${d.y * S}"/>`);
    next++; wrong = 0;
    const strokeEnds = !dots[next] || dots[next].s !== d.s;
    if (strokeEnds && dots.closeStroke === d.s) {
      const f = dots.find((x) => x.s === d.s);
      lines.insertAdjacentHTML("beforeend", `<line x1="${d.x * S}" y1="${d.y * S}" x2="${f.x * S}" y2="${f.y * S}"/>`);
    }
    if (next === dots.length) {
      el.querySelector(".dots-svg").classList.add("complete");
      api.say(`גִּלִּיתָ אֶת הָאוֹת ${letterName(target)}!`);
      setTimeout(() => api.correct(), 900);
    } else gs[next].classList.add("next");
  }));
  return speech;
}

// The Hebrew keyboard (by key position), shared by typing tasks.
function keyboardHTML() {
  return `<div class="keyboard" dir="ltr">${KEY_ROWS.map((row) => `<div class="krow">${row.map(([, l]) => `<button class="key" data-l="${l}">${l}</button>`).join("")}</div>`).join("")}</div>`;
}
function attachKeyboard(el, api, onLetter) {
  el.querySelectorAll(".key").forEach((k) => k.addEventListener("click", () => onLetter(k.dataset.l)));
  const onKey = (e) => { const l = CODE_TO_LETTER[e.code]; if (l) { e.preventDefault(); onLetter(l); } };
  document.addEventListener("keydown", onKey);
  api.cleanup(() => document.removeEventListener("keydown", onKey));
}

function firstLetterType(el, lvl, api) {
  const word = fresh(wordsUpTo(Math.max(2, lvl)), (w) => w.w);
  const first = word.w[0];
  const speech = `בְּאֵיזוֹ אוֹת מַתְחִילָה הַמִּלָּה ${word.n}? הַקְלֵד אוֹתָהּ`;
  el.innerHTML = `
    ${promptHTML("הקלד את האות הראשונה של המילה")}
    <div class="visual first-row"><span class="slot big-slot">${lvl <= 1 ? `<i>${first}</i>` : "?"}</span><button class="big-emoji tap" data-word>${word.e}</button></div>
    ${keyboardHTML()}`;
  wireSpeak(el, api, speech);
  el.querySelector("[data-word]").addEventListener("click", () => api.say(word.n));
  const slot = el.querySelector(".big-slot");
  let wrong = 0, done = false;
  attachKeyboard(el, api, (l) => {
    if (done) return;
    const k = el.querySelector(`.key[data-l="${l}"]`);
    if (k) { k.classList.add("pressed"); setTimeout(() => k.classList.remove("pressed"), 150); }
    if (normal(l) === normal(first)) {
      done = true; slot.textContent = first; slot.classList.add("filled"); api.correct();
    } else {
      wrong++; shakeIt(slot); api.mistake({ quiet: true });
      if (wrong === 1) api.say(`זֹאת הָאוֹת ${letterName(l)}. נַסֵּה שׁוּב`);
      if (wrong >= 2) hintGlow(el.querySelector(`.key[data-l="${first}"]`));
    }
  });
  return speech;
}

// ================= Music hall =================
function drumSVG() {
  return `<svg viewBox="0 0 200 170" class="drum-svg">
    <ellipse cx="100" cy="130" rx="80" ry="24" fill="#b91c1c" ${SVG_INK}/>
    <rect x="20" y="58" width="160" height="72" fill="#ef4444" stroke="none"/>
    <path d="M20 58 V130 M180 58 V130" ${SVG_INK}/>
    <path d="M20 66 L60 126 L100 66 L140 126 L180 66" fill="none" stroke="#fde047" stroke-width="5"/>
    <ellipse cx="100" cy="58" rx="80" ry="24" fill="#fef3c7" ${SVG_INK}/>
    <ellipse cx="100" cy="58" rx="56" ry="15" fill="none" stroke="#e7d9b0" stroke-width="3"/>
  </svg>`;
}

function drumSyllables(el, lvl, api) {
  const word = fresh(WORDS.filter((w) => w.s > 0 && w.lvl <= Math.max(2, lvl)), (w) => w.w);
  let beats = 0, done = false, timer = null;
  const speech = `תּוֹפֵף עַל הַתּוֹף, מַכָּה אַחַת לְכׇל חֵלֶק בַּמִּלָּה: ${word.n}`;
  el.innerHTML = `
    ${promptHTML("תופף על התוף: מכה לכל חלק במילה")}
    <div class="music-row">
      <button class="big-emoji tap" data-word>${word.e}</button>
      <button class="drum" data-drum>${drumSVG()}</button>
    </div>
    <div class="beats"></div>
    <div class="row-btns"><button class="soft-btn big" data-reset>🔄 מההתחלה</button><button class="go-btn" data-done>✔️ סיימתי</button></div>`;
  wireSpeak(el, api, speech);
  const beatsEl = el.querySelector(".beats");
  const drum = el.querySelector("[data-drum]");
  const draw = () => { beatsEl.innerHTML = Array.from({ length: beats }, () => "<i>🥁</i>").join(""); };
  el.querySelector("[data-word]").addEventListener("click", () => api.say(word.n));
  drum.addEventListener("click", () => {
    if (done) return;
    beats++; Sfx.drum(); draw();
    drum.classList.remove("hit"); void drum.offsetWidth; drum.classList.add("hit");
  });
  el.querySelector("[data-reset]").addEventListener("click", () => { beats = 0; draw(); });
  el.querySelector("[data-done]").addEventListener("click", () => {
    if (done || !beats) return;
    if (beats === word.s) { done = true; api.correct(); }
    else {
      api.mistake({ quiet: true });
      api.say(`תּוֹפַפְתָּ ${beats}. בּוֹא נַקְשִׁיב שׁוּב: ${word.n}`);
      clearTimeout(timer); timer = setTimeout(() => { beats = 0; draw(); }, 500);
    }
  });
  return speech;
}

function longerWord(el, lvl, api) {
  const pool = WORDS.filter((w) => w.s > 0 && w.lvl <= Math.max(2, lvl));
  let a, b;
  do { a = pick(pool); b = pick(pool); } while (Math.abs(a.s - b.s) < (lvl <= 1 ? 2 : 1));
  const longer = a.s > b.s ? a : b;
  const speech = `אֵיזוֹ מִלָּה אֲרֻכָּה יוֹתֵר? ${a.n}, אוֹ ${b.n}?`;
  choiceQuestion(el, api, {
    text: "איזו מילה ארוכה יותר? (יותר מחיאות כפיים)",
    speech,
    visual: `<div class="row-btns"><button class="soft-btn" data-a>🔊 ${a.e}</button><button class="soft-btn" data-b>🔊 ${b.e}</button></div>`,
    options: [a, b].map((w) => ({ value: w.w, html: `<span class="emoji-opt">${w.e}</span>` })),
    answer: longer.w,
    optionClass: "pictures",
  });
  el.querySelector("[data-a]").addEventListener("click", () => api.say(a.n));
  el.querySelector("[data-b]").addEventListener("click", () => api.say(b.n));
  return speech;
}

// ================= Color studio =================
const PAINT = {
  red: "#ef4444", blue: "#3b82f6", yellow: "#facc15", green: "#22c55e",
  orange: "#f97316", purple: "#a855f7", pink: "#f472b6", brown: "#a16207",
};
const PICTURES = [
  { name: "דג", regions: [
    { d: "M0 196 H300 V240 H0Z", c: "blue", x: 150, y: 222 },
    { d: "M70 110 C100 40 210 40 245 110 C210 180 100 180 70 110Z", c: "orange", x: 165, y: 118 },
    { d: "M74 110 L18 60 L32 110 L18 160Z", c: "yellow", x: 38, y: 112 },
    { d: "M125 56 C140 18 196 22 206 62 C176 50 150 50 125 56Z", c: "red", x: 165, y: 46 },
    { d: "M262 40 m-20 0 a20 20 0 1 0 40 0 a20 20 0 1 0 -40 0", c: "green", x: 262, y: 48 },
  ], extra: `<circle cx="212" cy="98" r="9" fill="#fff" stroke="#111" stroke-width="3"/><circle cx="214" cy="98" r="4" fill="#111"/><path d="M226 122 q8 4 14 0" stroke="#111" stroke-width="3" fill="none"/>` },
  { name: "בית", regions: [
    { d: "M0 200 H300 V240 H0Z", c: "green", x: 150, y: 224 },
    { d: "M70 110 H230 V200 H70Z", c: "yellow", x: 110, y: 160 },
    { d: "M54 112 L150 40 L246 112Z", c: "red", x: 150, y: 92 },
    { d: "M168 140 H206 V200 H168Z", c: "brown", x: 187, y: 175 },
    { d: "M262 44 m-24 0 a24 24 0 1 0 48 0 a24 24 0 1 0 -48 0", c: "orange", x: 262, y: 52 },
    { d: "M92 126 H132 V160 H92Z", c: "blue", x: 112, y: 147 },
  ] },
  { name: "חללית", regions: [
    { d: "M150 20 C186 50 194 120 186 180 H114 C106 120 114 50 150 20Z", c: "purple", x: 150, y: 150 },
    { d: "M150 20 C166 34 176 50 180 66 H120 C124 50 134 34 150 20Z", c: "red", x: 150, y: 52 },
    { d: "M114 130 L74 196 L116 180Z", c: "orange", x: 104, y: 175 },
    { d: "M186 130 L226 196 L184 180Z", c: "orange", x: 196, y: 175 },
    { d: "M150 98 m-20 0 a20 20 0 1 0 40 0 a20 20 0 1 0 -40 0", c: "blue", x: 150, y: 106 },
    { d: "M124 182 Q150 238 176 182Z", c: "yellow", x: 150, y: 202 },
  ] },
  { name: "פרפר", regions: [
    { d: "M146 110 C110 30 30 30 40 96 C46 128 110 124 146 112Z", c: "pink", x: 90, y: 86 },
    { d: "M154 110 C190 30 270 30 260 96 C254 128 190 124 154 112Z", c: "pink", x: 210, y: 86 },
    { d: "M146 120 C110 130 54 150 76 192 C98 222 140 170 146 126Z", c: "purple", x: 102, y: 168 },
    { d: "M154 120 C190 130 246 150 224 192 C202 222 160 170 154 126Z", c: "purple", x: 198, y: 168 },
    { d: "M150 70 C162 70 162 200 150 204 C138 200 138 70 150 70Z", c: "brown", x: 150, y: 140 },
  ], extra: `<path d="M146 72 Q130 40 120 36 M154 72 Q170 40 180 36" stroke="#111" stroke-width="4" fill="none" stroke-linecap="round"/>` },
];

function colorPicture(el, lvl, api, mode) {
  const pic = fresh(PICTURES, (p) => p.name);
  const colors = [...new Set(pic.regions.map((r) => r.c))];
  const labelPool = mode === "letter" ? shuffle(lvl <= 2 ? EASY_LETTERS : LETTERS.map((x) => x.l)).slice(0, colors.length) : shuffle(Array.from({ length: colors.length }, (_, i) => String(i + 1)));
  const labelOf = Object.fromEntries(colors.map((c, i) => [c, labelPool[i]]));
  const palette = mode === "letter" ? shuffle(colors) : colors.slice().sort((a, b) => +labelOf[a] - +labelOf[b]);
  let selected = null, left = pic.regions.length, wrong = 0;
  const speech = mode === "letter"
    ? "צְבַע לְפִי הָאוֹתִיּוֹת: בְּחַר צֶבַע, וְלַחַץ עַל הַחֲלָקִים עִם אוֹתָהּ אוֹת"
    : "צְבַע לְפִי הַמִּסְפָּרִים: בְּחַר צֶבַע, וְלַחַץ עַל הַחֲלָקִים עִם אוֹתוֹ מִסְפָּר";
  el.innerHTML = `
    ${promptHTML(mode === "letter" ? "צבע לפי האותיות" : "צבע לפי המספרים")}
    <div class="studio">
      <svg viewBox="0 0 300 240" class="paint-svg">
        <rect width="300" height="240" fill="#fff"/>
        ${pic.regions.map((r, i) => `<g class="region" data-i="${i}"><path d="${r.d}" fill="#fff" stroke="#111" stroke-width="4" stroke-linejoin="round"/>
          <text x="${r.x}" y="${r.y}" text-anchor="middle" dominant-baseline="central" class="region-label">${labelOf[r.c]}</text></g>`).join("")}
        ${pic.extra || ""}
      </svg>
      <div class="palette">${palette.map((c) => `<button class="swatch" data-c="${c}" style="--s:${PAINT[c]}"><b>${labelOf[c]}</b></button>`).join("")}</div>
    </div>`;
  wireSpeak(el, api, speech);
  el.querySelectorAll(".swatch").forEach((s) => s.addEventListener("click", () => {
    Sfx.click();
    el.querySelectorAll(".swatch").forEach((x) => x.classList.remove("selected"));
    s.classList.add("selected");
    selected = s.dataset.c;
    api.say(mode === "letter" ? letterName(labelOf[selected]) : labelOf[selected]);
  }));
  el.querySelectorAll(".region").forEach((g) => g.addEventListener("click", () => {
    if (g.classList.contains("painted")) return;
    const r = pic.regions[+g.dataset.i];
    if (!selected) { api.say("קֹדֶם בְּחַר צֶבַע"); hintGlow(el.querySelector(".palette")); return; }
    if (r.c === selected) {
      Sfx.pop();
      g.classList.add("painted");
      g.querySelector("path").setAttribute("fill", PAINT[r.c]);
      left--; wrong = 0;
      if (left === 0) setTimeout(() => api.correct(), 300);
    } else {
      wrong++;
      api.mistake({ quiet: true });
      g.classList.remove("wrong-region"); void g.getBoundingClientRect(); g.classList.add("wrong-region");
      if (wrong >= 2) hintGlow(el.querySelector(`.swatch[data-c="${r.c}"]`));
    }
  }));
  return speech;
}
const colorByNumber = (el, lvl, api) => colorPicture(el, lvl, api, "number");
const colorByLetter = (el, lvl, api) => colorPicture(el, lvl, api, "letter");

// ================= Ice palace =================
function oneMoreLess(el, lvl, api) {
  const top = lvl <= 1 ? 10 : 20;
  const before = lvl >= 2 && Math.random() < 0.5;
  const n = before ? rand(2, top) : rand(1, top - 1);
  const answer = before ? n - 1 : n + 1;
  const speech = before ? `אֵיזֶה מִסְפָּר בָּא לִפְנֵי ${n}?` : `אֵיזֶה מִסְפָּר בָּא אַחֲרֵי ${n}?`;
  const blocks = before ? [`?`, n] : [n, `?`];
  choiceQuestion(el, api, {
    text: before ? `איזה מספר בא לפני ${n}?` : `איזה מספר בא אחרי ${n}?`,
    speech,
    visual: `<div class="ice-track" dir="ltr">${blocks.map((b) => `<span class="ice-block ${b === "?" ? "q" : ""}">${b}</span>`).join("<b>→</b>")}</div>`,
    options: numberOptions(answer, 0, 20, [n]).map((x) => ({ value: x, html: `<span class="num">${x}</span>` })),
    answer,
    optionClass: "numbers",
  });
  return speech;
}

const PIPS = {
  0: [], 1: [[50, 50]], 2: [[28, 28], [72, 72]], 3: [[25, 25], [50, 50], [75, 75]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]], 5: [[26, 26], [74, 26], [50, 50], [26, 74], [74, 74]],
  6: [[28, 22], [72, 22], [28, 50], [72, 50], [28, 78], [72, 78]],
};
function dominoSVG(a, b) {
  const pips = (n, ox) => PIPS[n].map(([x, y]) => `<circle cx="${ox + x}" cy="${y}" r="9" fill="#111"/>`).join("");
  return `<svg viewBox="-6 -6 212 112" class="domino-svg"><rect x="0" y="0" width="200" height="100" rx="16" fill="#fff" ${SVG_INK}/>
    <path d="M100 10 V90" stroke="#111" stroke-width="4"/>${pips(a, 0)}${pips(b, 100)}</svg>`;
}

function dominoCount(el, lvl, api) {
  const max = lvl <= 1 ? 3 : lvl === 2 ? 5 : 6;
  const double = lvl <= 2 && Math.random() < 0.4;
  const a = rand(1, max), b = double ? a : rand(0, max);
  const speech = "כַּמָּה נְקֻדּוֹת יֵשׁ בַּדּוֹמִינוֹ? בִּשְׁנֵי הַצְּדָדִים בְּיַחַד";
  choiceQuestion(el, api, {
    text: "כמה נקודות יש בדומינו? (בשני הצדדים ביחד)",
    speech,
    visual: `<div class="domino-box">${dominoSVG(a, b)}</div>${lvl >= 2 ? `<div class="equation small" dir="ltr">${a} + ${b} = <span class="blank">?</span></div>` : ""}`,
    options: numberOptions(a + b, 0, 12).map((x) => ({ value: x, html: `<span class="num">${x}</span>` })),
    answer: a + b,
    optionClass: "numbers",
  });
  return speech;
}

function numberBond(el, lvl, api) {
  const total = lvl <= 1 ? rand(3, 5) : rand(5, 10);
  const part = rand(1, total - 1);
  const answer = total - part;
  const balls = (n) => Array.from({ length: n }, () => "<i>⛄</i>").join("");
  const speech = `יֵשׁ ${total} אַנְשֵׁי שֶׁלֶג. ${part} בַּצַּד הָאֶחָד. כַּמָּה בַּצַּד הַשֵּׁנִי?`;
  choiceQuestion(el, api, {
    text: `יש ${total} אנשי שלג. ${part} בצד אחד. כמה בצד השני?`,
    speech,
    visual: `<div class="bond" dir="ltr">
        <div class="bond-top"><b>${total}</b><span>${lvl <= 2 ? balls(total) : ""}</span></div>
        <svg viewBox="0 0 300 50" class="bond-lines"><path d="M150 0 L45 50 M150 0 L255 50" stroke="#111" stroke-width="5"/></svg>
        <div class="bond-row"><div class="bond-part"><b>${part}</b><span>${lvl <= 2 ? balls(part) : ""}</span></div><div class="bond-part q"><b>?</b></div></div>
      </div>`,
    options: numberOptions(answer, 0, 10).map((x) => ({ value: x, html: `<span class="num">${x}</span>` })),
    answer,
    optionClass: "numbers",
  });
  return speech;
}

// ================= Treasure island =================
function numberGrid(el, lvl, api) {
  const top = lvl <= 1 ? 10 : 20;
  const target = rand(1, top);
  const speech = `חֲפֹר בַּמִּשְׁבֶּצֶת שֶׁל הַמִּסְפָּר ${target}`;
  choiceQuestion(el, api, {
    text: lvl <= 1 ? `חפור במשבצת ${target}` : "חפור במשבצת של המספר ששמעת",
    speech,
    visual: `<button class="big-emoji tap small" data-again>🗺️</button>`,
    options: Array.from({ length: top }, (_, i) => ({ value: i + 1, html: `<span class="sand-num">${i + 1}</span>` })),
    answer: target,
    optionClass: `sand-grid${top > 10 ? " wide" : ""}`,
  });
  el.querySelector("[data-again]").addEventListener("click", () => api.say(speech));
  return speech;
}

function numberLineSVG(top, from, to, showJumps) {
  const W = 620, x0 = 30, step = (W - 60) / top;
  const X = (n) => x0 + n * step;
  const dir = to >= from ? 1 : -1;
  let arcs = "";
  if (showJumps) for (let n = from; n !== to; n += dir) {
    const a = X(n), b = X(n + dir);
    arcs += `<path d="M${a} 70 Q${(a + b) / 2} 30 ${b} 70" fill="none" stroke="#f97316" stroke-width="4" stroke-dasharray="6 5" marker-end="url(#arrowHead)"/>`;
  }
  return `<svg viewBox="0 0 ${W} 130" class="numline-svg">
    <defs><marker id="arrowHead" markerUnits="userSpaceOnUse" markerWidth="14" markerHeight="14" refX="9" refY="7" orient="auto"><path d="M0 0 L14 7 L0 14Z" fill="#f97316"/></marker><marker id="unusedHead"><path d="M0 0 L8 4 L0 8Z" fill="#f97316"/></marker></defs>
    <path d="M${x0 - 10} 80 H${W - 20}" stroke="#111" stroke-width="5" stroke-linecap="round"/>
    ${Array.from({ length: top + 1 }, (_, n) => `<path d="M${X(n)} 70 V90" stroke="#111" stroke-width="4"/><text x="${X(n)}" y="116" text-anchor="middle" class="nl-num">${n}</text>`).join("")}
    ${arcs}
    <text x="${X(from)}" y="66" text-anchor="middle" font-size="34">🐸</text>
  </svg>`;
}

function numberLineJump(el, lvl, api) {
  const top = lvl <= 1 ? 10 : 15;
  const back = lvl >= 2 && Math.random() < 0.4;
  const jumps = rand(1, lvl <= 1 ? 3 : 5);
  const from = back ? rand(jumps, top) : rand(0, top - jumps);
  const answer = back ? from - jumps : from + jumps;
  const speech = back
    ? `הַצְּפַרְדֵּעַ עוֹמֶדֶת עַל ${from}, וְקוֹפֶצֶת ${jumps} קְפִיצוֹת אֲחוֹרָה. לְאָן הִיא מַגִּיעָה?`
    : `הַצְּפַרְדֵּעַ עוֹמֶדֶת עַל ${from}, וְקוֹפֶצֶת ${jumps} קְפִיצוֹת קָדִימָה. לְאָן הִיא מַגִּיעָה?`;
  choiceQuestion(el, api, {
    text: `הצפרדע על ${from} וקופצת ${jumps} ${back ? "אחורה" : "קדימה"}. לאן תגיע?`,
    speech,
    visual: `<div class="numline-box">${numberLineSVG(top, from, answer, lvl <= 2)}</div>`,
    options: numberOptions(answer, 0, top, [from]).map((x) => ({ value: x, html: `<span class="num">${x}</span>` })),
    answer,
    optionClass: "numbers",
  });
  return speech;
}

function countTreasure(el, lvl, api) {
  const n = lvl <= 1 ? rand(3, 10) : rand(8, 20);
  const rows = [];
  for (let i = 0; i < n; i += 5) rows.push(Math.min(5, n - i));
  const speech = "כַּמָּה מַטְבְּעוֹת זָהָב יֵשׁ בָּאוֹצָר? טִיפּ: בְּכׇל שׁוּרָה מְלֵאָה יֵשׁ חָמֵשׁ";
  choiceQuestion(el, api, {
    text: "כמה מטבעות זהב יש באוצר?",
    speech,
    visual: `<div class="chest"><div class="chest-lid">💰</div>${rows.map((r) => `<div class="coin-row" dir="ltr">${Array.from({ length: r }, () => "<i></i>").join("")}</div>`).join("")}</div>`,
    options: numberOptions(n, 1, 20).map((x) => ({ value: x, html: `<span class="num">${x}</span>` })),
    answer: n,
    optionClass: "numbers",
  });
  return speech;
}

// ---------- which tasks each new place uses ----------
Object.assign(ZONE_CHALLENGES, {
  circus: [balloonLetters, balloonOrder, balloonNumber],
  bakery: [placeCandles, tenFrame, addPictures],
  treasure: [numberGrid, numberLineJump, countTreasure],
  underwater: [sameWord, colorWord, readPick],
  music: [drumSyllables, longerWord, syllableClaps],
  lab: [patternNext, oddOneOut, sortNumbers],
  forest: [connectDots, firstLetterType, traceLetter],
  fire: [houseNumber, ladderOrder, countFires],
  stadium: [scoreAdd, playersLeave, whoWon],
  dragon: [memoryGame, missingLetter, startsWithPick],
  studio: [colorByNumber, colorByLetter],
  ice: [oneMoreLess, dominoCount, numberBond],
});
ZONE_CHALLENGES.fortress.push(balloonLetters, patternNext, dominoCount, colorWord, tenFrame, numberLineJump);
