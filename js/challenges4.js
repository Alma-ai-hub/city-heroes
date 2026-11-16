// English for beginners (2026-11-16), the rulers' battles and the final battle with Dr. Balagan.
// An English word is said with an English voice: a speech part like { en: "apple" }.
// After a right answer the game says the English word and its Hebrew meaning ("teach").

const EN_FOODS = ["🍎", "🍌", "🍪", "🧁", "🍓"];

// Hear an English word, pick the picture.
function enPick(el, lvl, api, cats) {
  const pool = EN_WORDS.filter((w) => cats.includes(w.cat) && w.lvl <= lvl);
  const word = fresh(pool, (w) => w.en);
  const others = shuffle(EN_WORDS.filter((w) => cats.includes(w.cat) && w.en !== word.en && w.e !== word.e)).slice(0, lvl <= 1 ? 2 : 3);
  const speech = ["הַקְשֵׁב לַמִּלָּה בְּאַנְגְּלִית, וּבְחַר אֶת הַתְּמוּנָה:", { en: word.en }];
  choiceQuestion(el, api, {
    text: "שמע את המילה באנגלית ובחר את התמונה",
    speech,
    visual: `<button class="en-ear" data-again>👂 <b>${lvl <= 1 ? "?" : "?"}</b><small>לשמוע שוב</small></button>`,
    options: shuffle([word, ...others]).map((w) => ({ value: w.en, html: `<span class="emoji-opt">${w.e}</span>` })),
    answer: word.en,
    optionClass: "pictures",
    teach: [{ en: word.en }, word.n],
  });
  el.querySelector("[data-again]").addEventListener("click", () => api.say([{ en: word.en }]));
  return speech;
}
const enFood = (el, lvl, api) => enPick(el, lvl, api, ["food"]);
const enAnimals = (el, lvl, api) => enPick(el, lvl, api, ["animals"]);
const enBody = (el, lvl, api) => enPick(el, lvl, api, ["body"]);
const enThings = (el, lvl, api) => enPick(el, lvl, api, ["things"]);

// "Which animal says Moo?"
function enAnimalSays(el, lvl, api) {
  const pool = EN_WORDS.filter((w) => w.says && w.lvl <= Math.max(2, lvl));
  const a = fresh(pool, (w) => w.en);
  const others = shuffle(EN_WORDS.filter((w) => w.cat === "animals" && w.en !== a.en)).slice(0, lvl <= 1 ? 2 : 3);
  const speech = ["אֵיזוֹ חַיָּה אוֹמֶרֶת", { en: a.says }];
  choiceQuestion(el, api, {
    text: "איזו חיה עושה את הקול הזה?",
    speech,
    visual: `<button class="en-ear" data-again>🔊 <b>${a.says}</b><small>לשמוע שוב</small></button>`,
    options: shuffle([a, ...others]).map((w) => ({ value: w.en, html: `<span class="emoji-opt">${w.e}</span>` })),
    answer: a.en,
    optionClass: "pictures",
    teach: [{ en: a.en }, a.n],
  });
  el.querySelector("[data-again]").addEventListener("click", () => api.say([{ en: a.says }]));
  return speech;
}

function enColor(el, lvl, api) {
  const pool = EN_COLORS.filter((c) => c.lvl <= lvl);
  const c = fresh(pool, (x) => x.en);
  const others = shuffle(EN_COLORS.filter((x) => x.en !== c.en && x.lvl <= Math.max(2, lvl))).slice(0, lvl <= 1 ? 2 : 3);
  const speech = ["לְחַץ עַל הַצֶּבַע", { en: c.en }];
  choiceQuestion(el, api, {
    text: "לחץ על הצבע ששמעת באנגלית",
    speech,
    visual: `<button class="en-ear" data-again>👂 <b>?</b><small>לשמוע שוב</small></button>`,
    options: shuffle([c, ...others]).map((x) => ({ value: x.en, html: `<span class="color-blob" style="--b:${x.c}"></span>` })),
    answer: c.en,
    optionClass: "colors",
    teach: [{ en: c.en }, c.n],
  });
  el.querySelector("[data-again]").addEventListener("click", () => api.say([{ en: c.en }]));
  return speech;
}

function enColorBalloons(el, lvl, api) {
  const pool = EN_COLORS.filter((c) => c.lvl <= Math.max(2, lvl) && c.en !== "white");
  const target = fresh(pool, (x) => x.en);
  const others = shuffle(pool.filter((x) => x.en !== target.en)).slice(0, lvl <= 1 ? 2 : 3);
  const nT = rand(2, 3), total = lvl <= 1 ? 6 : 8;
  const list = shuffle([...Array(nT).fill(target), ...Array.from({ length: total - nT }, (_, i) => others[i % others.length])]);
  const speech = ["פּוֹצֵץ אֶת כׇּל הַבָּלוֹנִים בְּצֶבַע", { en: target.en }];
  el.innerHTML = `
    ${promptHTML("פוצץ את כל הבלונים בצבע ששמעת באנגלית")}
    <div class="visual"><button class="en-ear" data-again>👂 <b>?</b><small>לשמוע שוב</small></button></div>
    <div class="balloon-field">${list.map((c, i) => `<button class="balloon" data-c="${c.en}" style="--d:${(i % 5) * 0.37}s;--y:${(i * 37) % 30}px">${balloonSVG("", c.c)}</button>`).join("")}</div>`;
  wireSpeak(el, api, speech);
  el.querySelector("[data-again]").addEventListener("click", () => api.say([{ en: target.en }]));
  let left = nT, wrong = 0;
  el.querySelectorAll(".balloon").forEach((b) => b.addEventListener("click", () => {
    if (b.disabled || left <= 0) return;
    if (b.dataset.c === target.en) {
      Sfx.pop(); b.disabled = true; b.classList.add("popped"); left--; wrong = 0;
      if (!left) api.correct([{ en: target.en }, target.n]);
    } else {
      wrong++; shakeIt(b); api.mistake({ quiet: true });
      api.say([{ en: b.dataset.c }]);
      if (wrong >= 2) hintGlow(el.querySelector(`.balloon[data-c="${target.en}"]:not(:disabled)`));
    }
  }));
  return speech;
}

function enNumber(el, lvl, api) {
  const top = lvl <= 1 ? 5 : 10;
  const n = rand(1, top);
  const set = new Set([n]);
  while (set.size < (lvl <= 1 ? 3 : lvl === 2 ? 4 : 5)) set.add(rand(1, top));
  const speech = ["לְחַץ עַל הַמִּסְפָּר", { en: EN_NUMBERS[n] }];
  choiceQuestion(el, api, {
    text: "לחץ על המספר ששמעת באנגלית",
    speech,
    visual: `<button class="en-ear" data-again>👂 <b>?</b><small>לשמוע שוב</small></button>`,
    options: shuffle([...set]).map((x) => ({ value: x, html: `<span class="num">${x}</span>` })),
    answer: n,
    optionClass: "numbers",
    teach: [{ en: EN_NUMBERS[n] }],
  });
  el.querySelector("[data-again]").addEventListener("click", () => api.say([{ en: EN_NUMBERS[n] }]));
  return speech;
}

// Count together in English: every tap says the next number, then choose how many.
function enCount(el, lvl, api) {
  const n = rand(lvl <= 1 ? 2 : 3, lvl <= 1 ? 5 : lvl === 2 ? 8 : 10);
  const thing = pick(EN_FOODS);
  const speech = ["בּוֹא נִסְפֹּר בְּאַנְגְּלִית! לְחַץ עַל כׇּל אֶחָד"];
  el.innerHTML = `
    ${promptHTML("סופרים באנגלית! לחץ על כל אחד")}
    <div class="count-box en-count" dir="ltr">${Array.from({ length: n }, (_, i) => `<button class="count-item" data-i="${i}">${thing}<small></small></button>`).join("")}</div>
    <div class="then-ask"></div>`;
  wireSpeak(el, api, speech);
  let counted = 0;
  el.querySelectorAll(".count-item").forEach((b) => b.addEventListener("click", () => {
    if (b.disabled) return;
    b.disabled = true; counted++;
    b.querySelector("small").textContent = EN_NUMBERS[counted];
    b.classList.add("counted");
    Sfx.click();
    api.say([{ en: EN_NUMBERS[counted] }]);
    if (counted === n) setTimeout(() => {
      const box = el.querySelector(".then-ask");
      box.innerHTML = `<p class="then-q">כמה יש?</p><div class="options numbers">${numberOptions(n, 1, 10).map((x) => `<button class="option" data-v="${x}"><span class="num">${x}</span></button>`).join("")}</div>`;
      api.say(["כַּמָּה יֵשׁ?"]);
      let wrong = 0, done = false;
      box.querySelectorAll(".option").forEach((o) => o.addEventListener("click", () => {
        if (done || o.disabled) return;
        if (+o.dataset.v === n) { done = true; o.classList.add("right"); api.correct([{ en: EN_NUMBERS[n] }]); }
        else { wrong++; o.classList.add("wrong"); o.disabled = true; api.mistake(); if (wrong >= 2) hintGlow(box.querySelector(`.option[data-v="${n}"]`)); }
      }));
    }, 900);
  }));
  return speech;
}

function enLetter(el, lvl, api) {
  const pool = EN_LETTERS.slice(0, lvl <= 1 ? 6 : lvl === 2 ? 13 : 26);
  const L = fresh(pool);
  const set = new Set([L]);
  while (set.size < (lvl <= 1 ? 3 : 4)) set.add(pick(pool));
  const speech = ["מְצָא אֶת הָאוֹת בְּאַנְגְּלִית", { en: L }];
  choiceQuestion(el, api, {
    text: "מצא את האות באנגלית ששמעת",
    speech,
    visual: `<button class="en-ear" data-again>👂 <b>?</b><small>לשמוע שוב</small></button>`,
    options: shuffle([...set]).map((x) => ({ value: x, html: `<span class="letter en-letter">${x}</span>` })),
    answer: L,
    optionClass: "letters",
    teach: [{ en: L }],
  });
  el.querySelector("[data-again]").addEventListener("click", () => api.say([{ en: L }]));
  return speech;
}

function enLetterBalloons(el, lvl, api) {
  const pool = EN_LETTERS.slice(0, lvl <= 1 ? 6 : lvl === 2 ? 13 : 26);
  const L = fresh(pool);
  const others = shuffle(pool.filter((x) => x !== L)).slice(0, 4);
  const nT = 2, total = lvl <= 1 ? 6 : 8;
  const labels = shuffle([...Array(nT).fill(L), ...Array.from({ length: total - nT }, (_, i) => others[i % others.length])]);
  const targets = labels.map((x, i) => (x === L ? i : -1)).filter((i) => i >= 0);
  return balloonField(el, api, {
    text: "פוצץ את הבלונים עם האות באנגלית ששמעת",
    speech: ["פּוֹצֵץ אֶת הַבָּלוֹנִים עִם הָאוֹת", { en: L }],
    labels, targets, showLetter: lvl <= 1 ? L : null,
  });
}

// ---------- the final battle's special game ----------
function balaganMachineSVG(hp) {
  return `<svg viewBox="0 0 300 200" class="machine-svg ${hp <= 0 ? "broken" : ""}">
    <g stroke="#111" stroke-width="5" stroke-linejoin="round">
      <ellipse cx="150" cy="150" rx="120" ry="30" fill="#7c3aed"/>
      <path d="M50 150 Q150 60 250 150Z" fill="#a78bfa"/>
      <ellipse cx="150" cy="150" rx="120" ry="30" fill="none"/>
      ${[70, 110, 150, 190, 230].map((x) => `<circle cx="${x}" cy="156" r="7" fill="${hp > 0 ? "#a3e635" : "#475569"}"/>`).join("")}
      <path d="M90 180 l-14 18 M210 180 l14 18" stroke-width="6"/>
    </g>
    <g transform="translate(150 96) scale(.42)">${villainSVG(hp, 0).replace(/<svg[^>]*>/, "<g transform='translate(-100 -110)'>").replace("</svg>", "</g>")}</g>
    ${hp > 0 ? `<g fill="#fff" stroke="#111" stroke-width="2.5" class="floaty"><path d="M30 40 q20 -20 40 0 q-20 20 -40 0z"/><path d="M240 40 q20 -20 40 0 q-20 20 -40 0z"/></g>` : ""}
  </svg>`;
}

function finalShowdown(el, lvl, api) {
  let hp = 3, round = 0;
  const kinds = shuffle(["math", "letter", "english"]);
  el.innerHTML = `
    ${promptHTML("הקרב האחרון! כל תשובה נכונה יורה את הכוח שלך על המכונה של ד״ר בלגן")}
    <div class="showdown">
      <div class="machine-box" id="machine">${balaganMachineSVG(hp)}</div>
      <div class="hp-row">${[0, 1, 2].map((i) => `<span class="hp-dot on"></span>`).join("")}</div>
      <div class="beam" id="beam"></div>
      <div class="showdown-q"></div>
      <div class="showdown-hero">${heroSVG(hero, 120, (state.players[hero] || {}).powers || [])}</div>
    </div>`;
  wireSpeak(el, api, ["הַקְּרָב הָאַחֲרוֹן! כׇּל תְּשׁוּבָה נְכוֹנָה יוֹרָה אֶת הַכֹּחַ שֶׁלְּךָ עַל הַמְּכוֹנָה שֶׁל דּוֹקְטוֹר בַּלָּגָן"]);
  const q = el.querySelector(".showdown-q");
  const machine = el.querySelector("#machine");
  const beam = el.querySelector("#beam");
  beam.style.setProperty("--b", HEROES[hero].suit);

  function ask() {
    const kind = kinds[round];
    let speech, options, answer, text;
    if (kind === "math") {
      const a = rand(1, 5), b = rand(1, 4);
      answer = a + b; text = `${a} + ${b} = ?`;
      speech = ["כַּמָּה זֶה", String(a), "וְעוֹד", String(b)];
      options = numberOptions(answer, 1, 10).map((x) => ({ v: x, html: `<span class="num">${x}</span>` }));
    } else if (kind === "letter") {
      const t = pick(EASY_LETTERS);
      answer = t; text = "איזו אות?";
      speech = ["מְצָא אֶת הָאוֹת", letterName(t)];
      options = shuffle([t, ...otherLetters(t, 2, 1)]).map((x) => ({ v: x, html: `<span class="letter">${x}</span>` }));
    } else {
      const w = pick(EN_WORDS.filter((x) => x.lvl === 1));
      answer = w.en; text = "?";
      speech = ["מָה זֶה בְּאַנְגְּלִית:", { en: w.en }];
      options = shuffle([w, ...shuffle(EN_WORDS.filter((x) => x.lvl === 1 && x.en !== w.en)).slice(0, 2)]).map((x) => ({ v: x.en, html: `<span class="emoji-opt">${x.e}</span>` }));
    }
    q.innerHTML = `<div class="showdown-text" dir="ltr">${text}</div><div class="options">${options.map((o) => `<button class="option" data-v="${o.v}">${o.html}</button>`).join("")}</div>`;
    api.say(speech);
    let wrong = 0, done = false;
    q.querySelectorAll(".option").forEach((b) => b.addEventListener("click", () => {
      if (done || b.disabled) return;
      if (b.dataset.v === String(answer)) {
        done = true; b.classList.add("right"); fire();
      } else {
        wrong++; b.classList.add("wrong"); b.disabled = true; api.mistake({ quiet: true });
        api.say(["חָה חָה! לֹא תְּנַצֵּחַ אוֹתִי!"]);
        shakeIt(machine);
        if (wrong >= 2) hintGlow(q.querySelector(`.option[data-v="${answer}"]`));
      }
    }));
  }
  function fire() {
    Sfx.zap();
    beam.classList.remove("shoot"); void beam.offsetWidth; beam.classList.add("shoot");
    setTimeout(() => {
      hp--; round++;
      machine.innerHTML = balaganMachineSVG(hp);
      machine.classList.remove("hit"); void machine.offsetWidth; machine.classList.add("hit");
      el.querySelectorAll(".hp-dot").forEach((d, i) => d.classList.toggle("on", i < hp));
      if (hp <= 0) {
        Sfx.win(); confetti();
        q.innerHTML = `<div class="showdown-text">💥 בום! המכונה התפרקה!</div>`;
        setTimeout(() => api.correct(["בּוּם! הַמְּכוֹנָה שֶׁל דּוֹקְטוֹר בַּלָּגָן הִתְפָּרְקָה!"]), 1200);
      } else ask();
    }, 600);
  }
  setTimeout(ask, 2600);
  return ["הַקְּרָב הָאַחֲרוֹן! כׇּל תְּשׁוּבָה נְכוֹנָה יוֹרָה אֶת הַכֹּחַ שֶׁלְּךָ עַל הַמְּכוֹנָה שֶׁל דּוֹקְטוֹר בַּלָּגָן"];
}

// ---------- which tasks each English place uses, and the rulers' battles ----------
Object.assign(ZONE_CHALLENGES, {
  enfood: [enFood, enCount, enThings],
  enanimals: [enAnimals, enAnimalSays],
  encolors: [enColor, enColorBalloons],
  ennumbers: [enNumber, enCount],
  enabc: [enLetter, enLetterBalloons],
  enbody: [enBody, enThings],
});
// A ruler's battle mixes the tasks of all the places in that kingdom.
const realmTasks = (realmId) => {
  const r = REALMS.find((x) => x.id === realmId);
  return [...new Set(r.hoods.flatMap((h) => NEIGHBORHOODS.find((n) => n.id === h).zones).flatMap((z) => ZONE_CHALLENGES[z] || []))]
    .filter((f) => f !== traceLetter && f !== catchLetters && f !== catchNumbers);
};
for (const r of REALMS) ZONE_CHALLENGES[r.ruler] = realmTasks(r.id);

// The final battle: two tasks from each kingdom, then the special showdown.
function planFortress() {
  const pickN = (arr, n) => shuffle(arr).slice(0, n);
  return [...shuffle([...pickN(realmTasks("math"), 2), ...pickN(realmTasks("lang"), 2), ...pickN(realmTasks("en"), 2)]), finalShowdown];
}
