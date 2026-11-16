// New games for the 24 newer worlds (2026-11-16).
// Same rules as the other challenge files: draw into `el`, call api.correct() when solved,
// api.mistake() for a wrong try, and return what to say (a list of parts).

const named = (name, fn) => Object.defineProperty(fn, "name", { value: name });

// ===================== numbers =====================
// Find two cards that together make the target number.
function makeTen(el, lvl, api) {
  const target = lvl <= 1 ? rand(4, 6) : lvl === 2 ? rand(6, 9) : 10;
  let a;
  do { a = rand(1, target - 1); } while (a * 2 === target);
  const b = target - a;
  // The other cards can't make the target with any card (only one right pair).
  const pool = new Set([a, b]);
  for (const x of shuffle(Array.from({ length: target - 1 }, (_, i) => i + 1))) {
    if (pool.size >= (lvl <= 1 ? 4 : 6)) break;
    if (!pool.has(x) && ![...pool].some((p) => p + x === target) && x * 2 !== target) pool.add(x);
  }
  const cards = shuffle([...pool]);
  const dots = (n) => `<span class="dot-card mini">${Array.from({ length: n }, () => "<i></i>").join("")}</span>`;
  const speech = ["מְצָא שְׁנֵי כַּרְטִיסִים, שֶׁבְּיַחַד עוֹשִׂים", N(target)];
  el.innerHTML = `
    ${promptHTML(`מצא שני כרטיסים שביחד עושים ${target}`)}
    <div class="visual"><span class="goal-big">${target}</span></div>
    <div class="ten-cards" dir="ltr">${cards.map((n) => `<button class="ten-card" data-n="${n}"><b>${n}</b>${lvl <= 2 ? dots(n) : ""}</button>`).join("")}</div>`;
  wireSpeak(el, api, speech);
  let first = null, wrong = 0, done = false;
  el.querySelectorAll(".ten-card").forEach((c) => c.addEventListener("click", () => {
    if (done || c.disabled) return;
    if (!first) { first = c; c.classList.add("selected"); Sfx.click(); return; }
    if (c === first) { c.classList.remove("selected"); first = null; return; }
    const sum = +first.dataset.n + +c.dataset.n;
    if (sum === target) {
      done = true; c.classList.add("selected");
      [first, c].forEach((x) => x.classList.add("matched"));
      api.correct([first.dataset.n, "וְעוֹד", c.dataset.n, "זֶה", N(target)]);
    } else {
      wrong++; api.mistake({ quiet: true }); shakeIt(c);
      api.say([first.dataset.n, "וְעוֹד", c.dataset.n, "זֶה", N(sum), "נַסֵּה שׁוּב"]);
      first.classList.remove("selected"); first = null;
      if (wrong >= 2) el.querySelectorAll(`.ten-card[data-n="${a}"], .ten-card[data-n="${b}"]`).forEach(hintGlow);
    }
  }));
  return speech;
}

// A train of numbered wagons with empty wagons to fill.
function trainNumbers(el, lvl, api) {
  const len = 6;
  const start = lvl <= 1 ? 1 : rand(1, lvl === 2 ? 10 : 14);
  const nums = Array.from({ length: len }, (_, i) => start + i);
  const holes = shuffle(nums.map((_, i) => i).slice(1)).slice(0, lvl <= 1 ? 1 : lvl === 2 ? 2 : 3).sort((x, y) => x - y);
  const missing = holes.map((i) => nums[i]);
  const decoys = [start + len, Math.max(0, start - 1)].filter((x) => !nums.includes(x));
  const speech = ["הַשְׁלֵם אֶת הַמִּסְפָּרִים הַחֲסֵרִים בָּרַכֶּבֶת"];
  el.innerHTML = `
    ${promptHTML("השלם את המספרים החסרים ברכבת")}
    <div class="num-train" dir="ltr"><span class="loco">🚂</span>${nums.map((n, i) => `<span class="wagon ${holes.includes(i) ? "hole" : ""}" data-i="${i}">${holes.includes(i) ? "?" : n}</span>`).join("")}</div>
    <div class="tiles">${shuffle([...missing, ...decoys.slice(0, lvl <= 1 ? 1 : 2)]).map((n) => `<button class="tile num-tile" data-n="${n}">${n}</button>`).join("")}</div>`;
  wireSpeak(el, api, speech);
  let left = missing.length, wrong = 0;
  el.querySelectorAll(".num-tile").forEach((t) => t.addEventListener("click", () => {
    if (t.disabled || left <= 0) return;
    const i = nums.indexOf(+t.dataset.n);
    const wagon = el.querySelector(`.wagon.hole[data-i="${i}"]`);
    if (wagon) {
      Sfx.click(); wagon.textContent = t.dataset.n; wagon.classList.remove("hole"); wagon.classList.add("filled");
      t.disabled = true; t.classList.add("used"); left--; wrong = 0;
      if (!left) api.correct();
    } else {
      wrong++; shakeIt(t); api.mistake({ quiet: true });
      if (wrong >= 2) hintGlow(el.querySelector(`.num-tile[data-n="${nums[+el.querySelector(".wagon.hole").dataset.i]}"]`));
    }
  }));
  return speech;
}

const BLOCK_COLORS = ["#ef4444", "#f59e0b", "#facc15", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#84cc16"];
function towerHTML(n, max = 10) {
  return `<div class="tower" style="--h:${max}">${Array.from({ length: n }, (_, i) => `<i style="--c:${BLOCK_COLORS[i % BLOCK_COLORS.length]}"></i>`).join("")}</div>`;
}
function buildTower(el, lvl, api) {
  const n = lvl <= 1 ? rand(2, 5) : lvl === 2 ? rand(4, 8) : rand(6, 10);
  let count = 0, done = false;
  const speech = ["בְּנֵה מִגְדָּל שֶׁל", N(n), "קֻבִּיּוֹת, וְלַחַץ סִיַּמְתִּי"];
  el.innerHTML = `
    ${promptHTML(`בנה מגדל של ${n} קוביות`)}
    <div class="bake-row"><div class="order-card"><small>צריך</small><b>${n}</b></div><div class="tower-box"></div></div>
    <div class="row-btns"><button class="soft-btn big" data-add>🧱 עוד קובייה</button><button class="soft-btn big" data-remove>➖ להוריד</button><button class="go-btn" data-done>✔️ סיימתי</button></div>`;
  wireSpeak(el, api, speech);
  const box = el.querySelector(".tower-box");
  const draw = () => { box.innerHTML = towerHTML(count, 12); };
  draw();
  el.querySelector("[data-add]").addEventListener("click", () => { if (done || count >= 12) return; count++; Sfx.pop(); draw(); });
  el.querySelector("[data-remove]").addEventListener("click", () => { if (done || !count) return; count--; Sfx.click(); draw(); });
  el.querySelector("[data-done]").addEventListener("click", () => {
    if (done) return;
    if (count === n) { done = true; api.correct(); }
    else { api.mistake({ quiet: true }); api.say(count < n ? ["יֵשׁ", N(count), "קֻבִּיּוֹת. צָרִיךְ עוֹד"] : ["יֵשׁ", N(count), "קֻבִּיּוֹת. זֶה יוֹתֵר מִדַּי"]); }
  });
  return speech;
}

function tallerTower(el, lvl, api) {
  const n = lvl <= 1 ? 2 : 3;
  const set = new Set();
  while (set.size < n) set.add(rand(1, lvl <= 1 ? 8 : 10));
  const heights = [...set];
  if (lvl <= 1 && Math.abs(heights[0] - heights[1]) < 2) return tallerTower(el, lvl, api);
  const askShort = lvl >= 2 && Math.random() < 0.4;
  const answer = askShort ? Math.min(...heights) : Math.max(...heights);
  const speech = askShort ? ["אֵיזֶה מִגְדָּל הֲכִי נָמוּךְ?"] : ["אֵיזֶה מִגְדָּל הֲכִי גָּבוֹהַּ?"];
  choiceQuestion(el, api, {
    text: askShort ? "איזה מגדל הכי נמוך?" : "איזה מגדל הכי גבוה?",
    speech,
    options: heights.map((h) => ({ value: h, html: towerHTML(h, 10) })),
    answer,
    optionClass: "towers",
  });
  return speech;
}

// Share fairly: tap a plate to put the next item on it, until all are shared.
function shareFair(el, lvl, api) {
  const half = lvl <= 1 ? rand(1, 3) : rand(2, 5);
  const total = half * 2;
  const item = pick(["🥕", "🍓", "🍪", "🍎", "🥒"]);
  let left = total, plates = [0, 0], done = false;
  const speech = ["חַלֵּק אֶת", N(total), "בְּשָׁוֶה בֵּין שְׁנֵי הַחֲבֵרִים. לְחַץ עַל צַלַּחַת כְּדֵי לָשִׂים עָלֶיהָ"];
  el.innerHTML = `
    ${promptHTML(`חלק ${total} בשווה בין שני חברים`)}
    <div class="share-pile">${Array.from({ length: total }, () => `<i>${item}</i>`).join("")}</div>
    <div class="share-row">${[0, 1].map((i) => `<button class="share-plate" data-p="${i}"><span class="friend">${i ? "🧒" : "👧"}</span><span class="plate small-plate"></span><b>0</b></button>`).join("")}</div>
    <div class="row-btns"><button class="soft-btn" data-reset>🔄 מההתחלה</button></div>`;
  wireSpeak(el, api, speech);
  const pile = el.querySelector(".share-pile");
  const redraw = () => {
    pile.innerHTML = Array.from({ length: left }, () => `<i>${item}</i>`).join("");
    el.querySelectorAll(".share-plate").forEach((p, i) => {
      p.querySelector(".plate").innerHTML = Array.from({ length: plates[i] }, () => `<i>${item}</i>`).join("");
      p.querySelector("b").textContent = plates[i];
    });
  };
  el.querySelectorAll(".share-plate").forEach((p) => p.addEventListener("click", () => {
    if (done || !left) return;
    plates[+p.dataset.p]++; left--; Sfx.pop(); redraw();
    if (!left) {
      if (plates[0] === plates[1]) { done = true; api.correct(["לְכׇל אֶחָד", N(half)]); }
      else { api.mistake({ quiet: true }); api.say(["זֶה לֹא שָׁוֶה: לְאֶחָד", N(Math.max(...plates)), "וְלַשֵּׁנִי", N(Math.min(...plates)), "נַסֵּה שׁוּב"]); setTimeout(() => { plates = [0, 0]; left = total; redraw(); }, 1600); }
    }
  }));
  el.querySelector("[data-reset]").addEventListener("click", () => { if (done) return; plates = [0, 0]; left = total; redraw(); });
  return speech;
}

// Count by twos: pairs of shoes, socks, gloves.
function countPairs(el, lvl, api) {
  const k = rand(2, lvl <= 1 ? 3 : 5);
  const thing = pick(["👟", "🧦", "🧤", "🥾"]);
  const answer = k * 2;
  const speech = ["יֵשׁ פֹּה זוּגוֹת. כַּמָּה יֵשׁ בְּסַךְ הַכֹּל?"];
  choiceQuestion(el, api, {
    text: "כמה יש בסך הכול? (סופרים בזוגות: 2, 4, 6...)",
    speech,
    visual: `<div class="pairs-row" dir="ltr">${Array.from({ length: k }, () => `<span class="pair">${thing}${thing}</span>`).join("")}</div>`,
    options: numberOptions(answer, 1, 12, [answer - 1, answer + 1]).map((x) => ({ value: x, html: `<span class="num">${x}</span>` })),
    answer,
    optionClass: "numbers",
  });
  return speech;
}

// How many blocks long is the dinosaur?
function measureBlocks(el, lvl, api) {
  const n = rand(lvl <= 1 ? 3 : 4, lvl <= 1 ? 6 : 10);
  const dino = pick(["🦕", "🦖", "🐊", "🐍"]);
  const speech = ["כַּמָּה קֻבִּיּוֹת אָרֹךְ הַדִּינוֹזָאוּר? סְפֹר אֶת הַקֻּבִּיּוֹת"];
  choiceQuestion(el, api, {
    text: "כמה קוביות ארוך הדינוזאור?",
    speech,
    visual: `<div class="measure" dir="ltr" style="--n:${n}"><span class="dino" style="--sx:${(n * 60) / 100}">${dino}</span><div class="ruler">${Array.from({ length: n }, (_, i) => `<i style="--c:${BLOCK_COLORS[i % BLOCK_COLORS.length]}"></i>`).join("")}</div></div>`,
    options: numberOptions(n, 1, 10).map((x) => ({ value: x, html: `<span class="num">${x}</span>` })),
    answer: n,
    optionClass: "numbers",
  });
  return speech;
}

// ===================== letters =====================
function syllableBuild(el, lvl, api) {
  const pool = SYLLABLE_WORDS.filter((w) => w.parts.length <= (lvl <= 1 ? 2 : 3));
  const w = fresh(pool, (x) => x.n);
  const extra = lvl >= 2 ? shuffle(SYLLABLE_WORDS.flatMap((x) => x.parts).filter((p) => !w.parts.includes(p))).slice(0, lvl === 2 ? 1 : 2) : [];
  const tiles = shuffle([...w.parts, ...extra]);
  const speech = ["בְּנֵה אֶת הַמִּלָּה מֵהַחֲלָקִים:", w.n];
  el.innerHTML = `
    ${promptHTML("בנה את המילה מהחלקים")}
    <div class="visual"><button class="big-emoji tap" data-word>${w.e}</button></div>
    <div class="slots syl-slots">${w.parts.map(() => `<span class="slot syl"></span>`).join("")}</div>
    <div class="tiles">${tiles.map((p, i) => `<button class="tile syl-tile" data-i="${i}">${p}</button>`).join("")}</div>`;
  wireSpeak(el, api, speech);
  el.querySelector("[data-word]").addEventListener("click", () => api.say(w.n));
  const slots = el.querySelectorAll(".syl");
  let pos = 0, wrong = 0;
  el.querySelectorAll(".syl-tile").forEach((t) => t.addEventListener("click", () => {
    if (t.disabled || pos >= w.parts.length) return;
    if (t.textContent === w.parts[pos]) {
      Sfx.click(); slots[pos].textContent = w.parts[pos]; slots[pos].classList.add("filled");
      t.disabled = true; t.classList.add("used"); pos++; wrong = 0;
      el.querySelectorAll(".syl-tile.hint").forEach((x) => x.classList.remove("hint"));
      if (pos === w.parts.length) api.correct([w.n]);
    } else {
      wrong++; shakeIt(t); api.mistake({ quiet: true });
      if (wrong >= 2) hintGlow([...el.querySelectorAll(".syl-tile")].find((x) => !x.disabled && x.textContent === w.parts[pos]));
    }
  }));
  return speech;
}

function memoryWordPicture(el, lvl, api) {
  const pairsN = lvl <= 1 ? 3 : 4;
  const words = shuffle(wordsUpTo(Math.max(lvl, 1)).filter((w) => w.w.length <= (lvl <= 1 ? 3 : 5))).slice(0, pairsN);
  const cards = shuffle(words.flatMap((w, i) => [{ pair: i, face: `<span class="word-opt small-word">${w.n}</span>`, say: null }, { pair: i, face: `<span class="emoji-opt">${w.e}</span>`, say: w.n }]));
  const speech = ["מְצָא זוּגוֹת: מִלָּה כְּתוּבָה, וְהַתְּמוּנָה שֶׁלָּהּ"];
  el.innerHTML = `
    ${promptHTML("מצא זוגות: מילה והתמונה שלה")}
    <div class="memory-grid cols-${cards.length > 6 ? 4 : 3}">${cards.map((c, i) => `<button class="mem-card" data-i="${i}"><span class="mem-inner"><span class="mem-back gem">💎</span><span class="mem-front">${c.face}</span></span></button>`).join("")}</div>`;
  wireSpeak(el, api, speech);
  let open = [], matched = 0, busy = false;
  el.querySelectorAll(".mem-card").forEach((b) => b.addEventListener("click", () => {
    if (busy || b.classList.contains("flipped")) return;
    const c = cards[+b.dataset.i];
    b.classList.add("flipped"); Sfx.click();
    if (c.say) api.say(c.say);
    open.push(b);
    if (open.length < 2) return;
    const [x, y] = open; open = [];
    if (cards[+x.dataset.i].pair === cards[+y.dataset.i].pair) {
      setTimeout(() => { x.classList.add("matched"); y.classList.add("matched"); Sfx.good(); }, 300);
      matched++;
      if (matched === pairsN) setTimeout(() => api.correct(), 700);
    } else { busy = true; setTimeout(() => { x.classList.remove("flipped"); y.classList.remove("flipped"); busy = false; }, 1200); }
  }));
  return speech;
}

function oppositePick(el, lvl, api) {
  const o = fresh(OPPOSITES, (x) => x.an);
  const flip = Math.random() < 0.5;
  const [q, qn, a, an] = flip ? [o.b, o.bn, o.a, o.an] : [o.a, o.an, o.b, o.bn];
  const others = shuffle(OPPOSITES.filter((x) => x !== o)).slice(0, lvl <= 1 ? 2 : 3).map((x) => (Math.random() < 0.5 ? x.a : x.b));
  const speech = ["מָה הַהֵפֶךְ שֶׁל", qn, "?"];
  choiceQuestion(el, api, {
    text: "מה ההפך?",
    speech,
    visual: `<div class="opp-q"><span class="emoji-opt">${q}</span><b>${qn.replace(/[֑-ׇ]/g, "")}</b><span class="opp-arrow">⇄</span><span class="blank-box">?</span></div>`,
    options: shuffle([a, ...others]).map((e) => ({ value: e, html: `<span class="emoji-opt">${e}</span>` })),
    answer: a,
    optionClass: "pictures",
    teach: ["הַהֵפֶךְ שֶׁל", qn, "הוּא", an],
  });
  return speech;
}

function storyOrder(el, lvl, api) {
  const story = fresh(STORIES, (s) => s.join(""));
  const speech = ["סַדֵּר אֶת הַסִּפּוּר: מָה קוֹרֶה קֹדֶם, מָה אַחַר כָּךְ, וּמָה בַּסּוֹף?"];
  el.innerHTML = `
    ${promptHTML("סדר את הסיפור: מה קודם, מה אחר כך, ומה בסוף?")}
    <div class="story-slots">${story.map((_, i) => `<span class="story-slot"><small>${["קודם", "אחר כך", "בסוף"][i]}</small><span class="ss"></span></span>`).join("")}</div>
    <div class="tiles">${shuffle(story.map((e, i) => ({ e, i }))).map((x) => `<button class="story-card" data-i="${x.i}"><span class="emoji-opt">${x.e}</span></button>`).join("")}</div>`;
  wireSpeak(el, api, speech);
  const slots = el.querySelectorAll(".ss");
  let step = 0, wrong = 0;
  el.querySelectorAll(".story-card").forEach((c) => c.addEventListener("click", () => {
    if (c.disabled) return;
    if (+c.dataset.i === step) {
      Sfx.click(); slots[step].innerHTML = c.innerHTML; slots[step].parentElement.classList.add("filled");
      c.disabled = true; c.classList.add("used"); step++; wrong = 0;
      el.querySelectorAll(".story-card.hint").forEach((x) => x.classList.remove("hint"));
      if (step === story.length) api.correct();
    } else {
      wrong++; shakeIt(c); api.mistake({ quiet: true });
      if (wrong >= 2) hintGlow(el.querySelector(`.story-card[data-i="${step}"]`));
    }
  }));
  return speech;
}

function sentencePick(el, lvl, api) {
  const s = fresh(SENTENCES, (x) => x.n);
  const speech = ["הַשְׁלֵם אֶת הַמִּשְׁפָּט:", s.n, "..."];
  choiceQuestion(el, api, {
    text: "השלם את המשפט",
    speech,
    visual: `<div class="sentence">${s.t}</div><button class="help-btn" data-again>🔊 לשמוע שוב</button>`,
    options: shuffle(s.o).map((e) => ({ value: e, html: `<span class="emoji-opt">${e}</span>` })),
    answer: s.a,
    optionClass: "pictures",
  });
  el.querySelector("[data-again]").addEventListener("click", () => api.say(speech));
  return speech;
}

function whoDoes(el, lvl, api) {
  const q = fresh(WHO_DOES, (x) => x.n);
  const others = shuffle(WHO_DOES.filter((x) => x.a !== q.a)).slice(0, lvl <= 1 ? 2 : 3).map((x) => x.a);
  const speech = [q.n];
  choiceQuestion(el, api, {
    text: q.t,
    speech,
    visual: `<button class="big-emoji tap small" data-again>👂</button>`,
    options: shuffle([q.a, ...others]).map((e) => ({ value: e, html: `<span class="emoji-opt">${e}</span>` })),
    answer: q.a,
    optionClass: "pictures",
  });
  el.querySelector("[data-again]").addEventListener("click", () => api.say(speech));
  return speech;
}

// ===================== English =====================
const enPickOf = (cats) => named("enPick_" + cats.join("_"), (el, lvl, api) => enPick(el, lvl, api, cats));

// "Is this a ...?" yes or no.
function enYesNo(el, lvl, api, cats) {
  const pool = EN_WORDS.filter((w) => (!cats || cats.includes(w.cat)) && w.lvl <= Math.max(lvl, 1));
  const shown = fresh(pool, (w) => w.en);
  const truth = Math.random() < 0.5;
  const said = truth ? shown : pick(pool.filter((w) => w.e !== shown.e));
  const speech = ["הַאִם זֶה", { en: said.en }, "?"];
  choiceQuestion(el, api, {
    text: "מה שמעת? זה מתאים לתמונה?",
    speech,
    visual: `<div class="big-emoji">${shown.e}</div><button class="en-ear" data-again>👂 <b>${said.en}?</b><small>לשמוע שוב</small></button>`,
    options: [{ value: "yes", html: `<span class="yn">👍<b>Yes</b></span>` }, { value: "no", html: `<span class="yn">👎<b>No</b></span>` }],
    answer: truth ? "yes" : "no",
    optionClass: "yesno",
    teach: truth ? [{ en: "Yes!" }, { en: shown.en }] : [{ en: "No!" }, "זֶה", { en: shown.en }, shown.n],
  });
  el.querySelector("[data-again]").addEventListener("click", () => api.say([{ en: said.en }]));
  return speech;
}
const enYesNoOf = (cats) => named("enYesNo_" + (cats ? cats.join("_") : "all"), (el, lvl, api) => enYesNo(el, lvl, api, cats));

// Memory game: flipping a picture says its English name.
function enMemory(el, lvl, api, cats) {
  const pairsN = lvl <= 1 ? 3 : 4;
  const words = shuffle(EN_WORDS.filter((w) => cats.includes(w.cat))).filter((w, i, arr) => arr.findIndex((x) => x.e === w.e) === i).slice(0, pairsN);
  const cards = shuffle(words.flatMap((w, i) => [{ pair: i, w }, { pair: i, w }]));
  const speech = ["מְצָא זוּגוֹת שֶׁל תְּמוּנוֹת. כׇּל תְּמוּנָה אוֹמֶרֶת אֶת הַשֵּׁם שֶׁלָּהּ בְּאַנְגְּלִית"];
  el.innerHTML = `
    ${promptHTML("מצא זוגות. כל תמונה אומרת את השם שלה באנגלית")}
    <div class="memory-grid cols-${cards.length > 6 ? 4 : 3}">${cards.map((c, i) => `<button class="mem-card" data-i="${i}"><span class="mem-inner"><span class="mem-back en-back">ABC</span><span class="mem-front"><span class="emoji-opt">${c.w.e}</span></span></span></button>`).join("")}</div>`;
  wireSpeak(el, api, speech);
  let open = [], matched = 0, busy = false;
  el.querySelectorAll(".mem-card").forEach((b) => b.addEventListener("click", () => {
    if (busy || b.classList.contains("flipped")) return;
    const c = cards[+b.dataset.i];
    b.classList.add("flipped"); api.say([{ en: c.w.en }]);
    open.push(b);
    if (open.length < 2) return;
    const [x, y] = open; open = [];
    if (cards[+x.dataset.i].pair === cards[+y.dataset.i].pair) {
      setTimeout(() => { x.classList.add("matched"); y.classList.add("matched"); Sfx.good(); }, 300);
      matched++;
      if (matched === pairsN) setTimeout(() => api.correct(), 900);
    } else { busy = true; setTimeout(() => { x.classList.remove("flipped"); y.classList.remove("flipped"); busy = false; }, 1200); }
  }));
  return speech;
}
const enMemoryOf = (cats) => named("enMemory_" + cats.join("_"), (el, lvl, api) => enMemory(el, lvl, api, cats));

function enBigSmall(el, lvl, api) {
  const thing = pick(["🐘", "🐶", "🍎", "🚗", "⭐", "🐟", "🏠", "🎈"]);
  const askBig = Math.random() < 0.5;
  const sizes = lvl <= 1 ? [40, 120] : [36, 76, 124];
  const answer = askBig ? Math.max(...sizes) : Math.min(...sizes);
  const speech = ["לְחַץ עַל הַ", { en: askBig ? "big" : "small" }];
  choiceQuestion(el, api, {
    text: "לחץ על מה ששמעת באנגלית: big (גדול) או small (קטן)",
    speech: ["לְחַץ עַל מָה שֶׁשָּׁמַעְתָּ:", { en: askBig ? "big" : "small" }],
    visual: `<button class="en-ear" data-again>👂 <b>?</b><small>לשמוע שוב</small></button>`,
    options: shuffle(sizes).map((s) => ({ value: s, html: `<span style="font-size:${s}px;line-height:1">${thing}</span>` })),
    answer,
    optionClass: "pictures sizes-opts",
    teach: [{ en: askBig ? "Big!" : "Small!" }, askBig ? "גָּדוֹל" : "קָטָן"],
  });
  el.querySelector("[data-again]").addEventListener("click", () => api.say([{ en: askBig ? "big" : "small" }]));
  return ["לְחַץ עַל מָה שֶׁשָּׁמַעְתָּ:", { en: askBig ? "big" : "small" }];
}

function enShape(el, lvl, api) {
  const pool = EN_SHAPES.filter((s) => s.lvl <= Math.max(lvl, 2));
  const s = fresh(pool, (x) => x.en);
  const others = shuffle(pool.filter((x) => x.en !== s.en)).slice(0, lvl <= 1 ? 2 : 3);
  const speech = ["לְחַץ עַל הַצּוּרָה:", { en: s.en }];
  choiceQuestion(el, api, {
    text: "לחץ על הצורה ששמעת באנגלית",
    speech,
    visual: `<button class="en-ear" data-again>👂 <b>?</b><small>לשמוע שוב</small></button>`,
    options: shuffle([s, ...others]).map((x, i) => ({ value: x.en, html: shapeSVG(x.id, SHAPE_COLORS[i]) })),
    answer: s.en,
    optionClass: "shapes-opts",
    teach: [{ en: s.en }, s.n],
  });
  el.querySelector("[data-again]").addEventListener("click", () => api.say([{ en: s.en }]));
  return speech;
}

function enColorShape(el, lvl, api) {
  const colors = EN_COLORS.filter((c) => c.lvl <= 2 && c.en !== "white");
  const shapes = EN_SHAPES.filter((s) => s.lvl <= 2);
  const tc = pick(colors), ts = pick(shapes);
  const opts = [{ c: tc, s: ts }];
  while (opts.length < (lvl <= 1 ? 3 : 4)) {
    const o = Math.random() < 0.5 ? { c: tc, s: pick(shapes) } : { c: pick(colors), s: ts };
    if (!opts.some((x) => x.c === o.c && x.s === o.s)) opts.push(o);
  }
  const phrase = `${tc.en} ${ts.en}`;
  const speech = ["לְחַץ עַל:", { en: phrase }];
  choiceQuestion(el, api, {
    text: "לחץ על הצבע והצורה ששמעת באנגלית",
    speech,
    visual: `<button class="en-ear" data-again>👂 <b>?</b><small>לשמוע שוב</small></button>`,
    options: shuffle(opts).map((o) => ({ value: `${o.c.en}-${o.s.en}`, html: shapeSVG(o.s.id, o.c.c) })),
    answer: `${tc.en}-${ts.en}`,
    optionClass: "shapes-opts",
    teach: [{ en: phrase }, ts.n, tc.n],
  });
  el.querySelector("[data-again]").addEventListener("click", () => api.say([{ en: phrase }]));
  return speech;
}

// Pop the balloons that show the word you hear.
function enBalloonsWord(el, lvl, api, cats) {
  const pool = EN_WORDS.filter((w) => cats.includes(w.cat)).filter((w, i, arr) => arr.findIndex((x) => x.e === w.e) === i);
  const t = fresh(pool, (w) => w.en);
  const others = shuffle(pool.filter((w) => w.e !== t.e)).slice(0, 3);
  const nT = 2, total = lvl <= 1 ? 6 : 8;
  const labels = shuffle([...Array(nT).fill(t.e), ...Array.from({ length: total - nT }, (_, i) => others[i % others.length].e)]);
  const targets = labels.map((x, i) => (x === t.e ? i : -1)).filter((i) => i >= 0);
  const s = balloonField(el, api, {
    text: "פוצץ את הבלונים עם מה ששמעת באנגלית",
    speech: ["פּוֹצֵץ אֶת הַבָּלוֹנִים עִם", { en: t.en }],
    labels, targets,
  });
  el.querySelectorAll(".balloon-text").forEach((x) => x.classList.add("emoji-label"));
  return s;
}
const enBalloonsOf = (cats) => named("enBalloons_" + cats.join("_"), (el, lvl, api) => enBalloonsWord(el, lvl, api, cats));

function enFishWord(el, lvl, api, cats) {
  const pool = EN_WORDS.filter((w) => cats.includes(w.cat)).filter((w, i, arr) => arr.findIndex((x) => x.e === w.e) === i);
  const t = fresh(pool, (w) => w.en);
  const all = shuffle([t, ...shuffle(pool.filter((w) => w.e !== t.e)).slice(0, lvl <= 1 ? 2 : 3)]);
  const s = fishPond(el, api, {
    text: "דוג את הדג עם מה ששמעת באנגלית",
    speech: ["דּוּג אֶת הַדָּג עִם", { en: t.en }],
    visual: `<button class="en-ear" data-again>👂 <b>?</b><small>לשמוע שוב</small></button>`,
    labels: all.map((w) => w.e), answerIdx: all.indexOf(t), labelClass: "emoji-label",
  });
  el.querySelector("[data-again]").addEventListener("click", () => api.say([{ en: t.en }]));
  return s;
}
const enFishOf = (cats) => named("enFish_" + cats.join("_"), (el, lvl, api) => enFishWord(el, lvl, api, cats));

// "A is for Apple": which picture's English word starts with the letter you hear?
function enLetterSound(el, lvl, api) {
  const pool = EN_WORDS.filter((w) => w.lvl <= 2 && !w.en.includes(" "));
  const byLetter = {};
  pool.forEach((w) => { (byLetter[w.en[0].toUpperCase()] ||= []).push(w); });
  const letters = Object.keys(byLetter);
  const L = fresh(letters);
  const t = pick(byLetter[L]);
  const others = shuffle(pool.filter((w) => w.en[0].toUpperCase() !== L && w.e !== t.e)).filter((w, i, arr) => arr.findIndex((x) => x.en[0] === w.en[0]) === i).slice(0, 2);
  const speech = ["אֵיזוֹ מִלָּה בְּאַנְגְּלִית מַתְחִילָה בָּאוֹת", { en: L }, "?"];
  choiceQuestion(el, api, {
    text: "איזו מילה באנגלית מתחילה באות הזאת?",
    speech,
    visual: `<div class="letter-card en-letter">${L}</div>`,
    options: shuffle([t, ...others]).map((w) => ({ value: w.en, html: `<span class="emoji-opt">${w.e}</span>` })),
    answer: t.en,
    optionClass: "pictures",
    teach: [{ en: `${L} is for ${t.en}` }],
  });
  return speech;
}

// ---------- which games each new world uses ----------
Object.assign(ZONE_CHALLENGES, {
  toyshop: [payCoins, makeTen, compareMore],
  numtrain: [trainNumbers, sequence, countdown],
  blocks: [buildTower, tallerTower, countThings],
  veggarden: [shareFair, countPairs, addPictures],
  dinomuseum: [measureBlocks, sizeOrder, sortNumbers],
  theater: [syllableBuild, listenPickWord, wordFish],
  opposites: [oppositePick, whoDoes],
  storylib: [storyOrder, sentencePick],
  playground: [whoDoes, sentencePick, oppositePick],
  wordcave: [memoryWordPicture, readPick, sameWord],
  enfamily: [enPickOf(["family"]), enMemoryOf(["family"])],
  enhome: [enPickOf(["home"]), enYesNoOf(["home"])],
  enshapes: [enShape, enColorShape],
  entoys: [enPickOf(["toys"]), enBalloonsOf(["toys"])],
  ensea: [enPickOf(["sea"]), enFishOf(["sea"])],
  enweather: [enPickOf(["weather"]), enYesNoOf(["weather"])],
  enfruits: [enPickOf(["fruit"]), enMemoryOf(["fruit"]), enFishOf(["fruit"])],
  envehicles: [enPickOf(["vehicles"]), enBalloonsOf(["vehicles"])],
  enclothes: [enPickOf(["clothes"]), enMemoryOf(["clothes"])],
  enbugs: [enPickOf(["bugs"]), enFishOf(["bugs"])],
  enfeelings: [enPickOf(["feelings"]), enYesNoOf(["feelings"])],
  ensizes: [enBigSmall, enLetterSound],
  enyesno: [enYesNoOf(null), enLetterSound],
  encolorshape: [enColorShape, enColorBalloons],
});
// The rulers' battles now include the new games too.
for (const r of REALMS) ZONE_CHALLENGES[r.ruler] = realmTasks(r.id);
