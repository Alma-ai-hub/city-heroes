// The small challenges inside each mission.
// Each challenge draws itself into `el` and tells the game when it's solved:
//   api.correct()   -> solved
//   api.mistake()   -> a wrong try (we never punish, we just count, to give stars)
//   api.say(text)   -> speak
//   api.cleanup(fn) -> run fn when the challenge is closed

// ---------- small helpers ----------
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const normal = (ch) => FINAL_TO_NORMAL[ch] || ch;
const groupOf = (groups, l) => groups.find((g) => g.includes(l)) || [l];
const letterName = (l) => (LETTERS.find((x) => x.l === normal(l)) || {}).name || l;
const wordsUpTo = (lvl) => WORDS.filter((w) => w.lvl <= lvl);

// Recently used words/letters, so the same one doesn't come back right away.
const recent = [];
function fresh(list, key = (x) => x) {
  const notRecent = list.filter((x) => !recent.includes(key(x)));
  const choice = pick(notRecent.length ? notRecent : list);
  recent.push(key(choice));
  if (recent.length > 12) recent.shift();
  return choice;
}

// Letters to offer next to the right one: not sound-alike (and at level 1 not look-alike).
function otherLetters(answer, n, lvl, extraAvoid = []) {
  let avoid = [...groupOf(SOUND_ALIKE, answer), ...extraAvoid];
  if (lvl <= 1) avoid = avoid.concat(groupOf(LOOK_ALIKE, answer));
  const out = [];
  for (const x of shuffle(LETTERS.map((x) => x.l))) {
    if (out.length >= n) break;
    if (x === answer || avoid.includes(x)) continue;
    if (lvl <= 1 && out.some((o) => groupOf(LOOK_ALIKE, o).includes(x))) continue;
    if (out.some((o) => groupOf(SOUND_ALIKE, o).includes(x))) continue;
    out.push(x);
  }
  return out;
}

function promptHTML(text) {
  return `<div class="prompt"><button class="speak-btn" data-speak title="לשמוע שוב">🔊</button><span>${text}</span></div>`;
}

function wireSpeak(el, api, speech) {
  el.querySelectorAll("[data-speak]").forEach((b) => b.addEventListener("click", () => api.say(speech)));
}

// A question with a few big buttons to choose from.
function choiceQuestion(el, api, { text, speech, visual = "", options, answer, optionClass = "" }) {
  el.innerHTML = `
    ${promptHTML(text)}
    <div class="visual">${visual}</div>
    <div class="options ${optionClass}">
      ${options.map((o) => `<button class="option" data-v="${o.value}">${o.html}</button>`).join("")}
    </div>`;
  wireSpeak(el, api, speech);
  let wrong = 0;
  let done = false;
  el.querySelectorAll(".option").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (done || btn.disabled) return;
      if (btn.dataset.v === String(answer)) {
        done = true;
        btn.classList.add("right");
        api.correct();
      } else {
        wrong++;
        btn.classList.add("wrong");
        btn.disabled = true;
        api.mistake();
        if (wrong >= 2) el.querySelector(`.option[data-v="${answer}"]`).classList.add("hint");
      }
    });
  });
  return speech;
}

// ---------- Letters ----------
const EASY_LETTERS = ["א", "ב", "ג", "ד", "ה", "ל", "מ", "ס", "ר", "ש", "ת", "י"];

function findLetter(el, lvl, api) {
  const pool = lvl <= 1 ? EASY_LETTERS : LETTERS.map((x) => x.l);
  const target = fresh(pool);
  const n = lvl <= 1 ? 2 : lvl === 2 ? 3 : 5;
  const opts = shuffle([target, ...otherLetters(target, n, lvl)]);
  const speech = `מְצָא אֶת הָאוֹת ${letterName(target)}`;
  choiceQuestion(el, api, {
    text: "מצא את האות שהגיבור מבקש",
    speech,
    visual: `<div class="big-emoji">🔎</div>`,
    options: opts.map((l) => ({ value: l, html: `<span class="letter">${l}</span>` })),
    answer: target,
    optionClass: "letters",
  });
  return speech;
}

function soundStart(el, lvl, api) {
  const word = fresh(wordsUpTo(Math.max(lvl, 2)), (w) => w.w);
  const first = word.w[0];
  const opts = shuffle([first, ...otherLetters(first, 2, lvl)]);
  const speech = `בְּאֵיזוֹ אוֹת מַתְחִילָה הַמִּלָּה ${word.n}?`;
  choiceQuestion(el, api, {
    text: "באיזו אות מתחילה המילה?",
    speech,
    visual: `<button class="big-emoji tap" data-word title="לשמוע את המילה">${word.e}</button>`,
    options: opts.map((l) => ({ value: l, html: `<span class="letter">${l}</span>` })),
    answer: first,
    optionClass: "letters",
  });
  el.querySelector("[data-word]").addEventListener("click", () => api.say(word.n));
  return speech;
}

function missingLetter(el, lvl, api) {
  const list = wordsUpTo(lvl).filter((w) => w.w.length <= (lvl <= 1 ? 3 : 5));
  const word = fresh(list, (w) => w.w);
  const letters = [...word.w];
  let idx = lvl <= 1 ? 0 : rand(0, letters.length - 1);
  if (FINAL_TO_NORMAL[letters[idx]]) idx = 0;
  const answer = letters[idx];
  const opts = shuffle([answer, ...otherLetters(answer, 2, lvl, letters)]);
  const shown = letters.map((l, i) => (i === idx ? `<span class="blank">?</span>` : l)).join("");
  const speech = `אֵיזוֹ אוֹת חֲסֵרָה בַּמִּלָּה ${word.n}?`;
  choiceQuestion(el, api, {
    text: "איזו אות חסרה במילה?",
    speech,
    visual: `<div class="big-emoji">${word.e}</div><div class="word-show">${shown}</div>`,
    options: opts.map((l) => ({ value: l, html: `<span class="letter">${l}</span>` })),
    answer,
    optionClass: "letters",
  });
  return speech;
}

// ---------- Reading ----------
function readPick(el, lvl, api) {
  const list = wordsUpTo(lvl);
  const word = fresh(list, (w) => w.w);
  const others = shuffle(WORDS.filter((w) => w.w !== word.w)).slice(0, 2);
  const opts = shuffle([word, ...others]);
  const speech = "קְרָא אֶת הַמִּלָּה, וּבְחַר אֶת הַתְּמוּנָה הַמַּתְאִימָה";
  choiceQuestion(el, api, {
    text: "קרא את המילה ובחר את התמונה",
    speech,
    visual: `<div class="read-word">${word.n}</div>
             <button class="help-btn" data-read>🙋 עזרה: תקריא לי</button>`,
    options: opts.map((w) => ({ value: w.w, html: `<span class="emoji-opt">${w.e}</span>` })),
    answer: word.w,
    optionClass: "pictures",
  });
  el.querySelector("[data-read]").addEventListener("click", () => api.say(word.n));
  return speech;
}

function pictureWord(el, lvl, api) {
  const word = fresh(wordsUpTo(lvl), (w) => w.w);
  let pool = WORDS.filter((w) => w.w !== word.w);
  // Harder levels: the wrong words start with the same letter, so you must read all of it.
  if (lvl >= 2) {
    const same = pool.filter((w) => w.w[0] === word.w[0]);
    pool = shuffle(same).concat(shuffle(pool.filter((w) => w.w[0] !== word.w[0])));
  } else pool = shuffle(pool);
  const opts = shuffle([word, ...pool.slice(0, 2)]);
  const speech = "אֵיזוֹ מִלָּה מַתְאִימָה לַתְּמוּנָה?";
  choiceQuestion(el, api, {
    text: "איזו מילה מתאימה לתמונה?",
    speech,
    visual: `<div class="big-emoji">${word.e}</div>`,
    options: opts.map((w) => ({ value: w.w, html: `<span class="word-opt">${w.n}</span>` })),
    answer: word.w,
    optionClass: "words",
  });
  return speech;
}

// ---------- Writing ----------
function slotsHTML(letters, ghost) {
  return `<div class="slots">${letters.map((l) => `<span class="slot">${ghost ? `<i>${l}</i>` : ""}</span>`).join("")}</div>`;
}

function buildWord(el, lvl, api) {
  const list = wordsUpTo(lvl).filter((w) => w.w.length <= (lvl <= 1 ? 3 : lvl === 2 ? 4 : 6));
  const word = fresh(list, (w) => w.w);
  const letters = [...word.w];
  const extra = lvl >= 2 ? otherLetters(letters[0], lvl - 1, lvl, letters) : [];
  const tiles = shuffle([...letters, ...extra]);
  const speech = `בְּנֵה אֶת הַמִּלָּה ${word.n}`;
  el.innerHTML = `
    ${promptHTML("בנה את המילה מהאותיות")}
    <div class="visual"><button class="big-emoji tap" data-word>${word.e}</button></div>
    ${slotsHTML(letters, lvl <= 1)}
    <div class="tiles">${tiles.map((l, i) => `<button class="tile" data-i="${i}">${l}</button>`).join("")}</div>`;
  wireSpeak(el, api, speech);
  el.querySelector("[data-word]").addEventListener("click", () => api.say(word.n));
  const slots = el.querySelectorAll(".slot");
  let pos = 0, wrongHere = 0;
  el.querySelectorAll(".tile").forEach((t) => {
    t.addEventListener("click", () => {
      if (t.disabled || pos >= letters.length) return;
      if (t.textContent === letters[pos]) {
        Sfx.click();
        slots[pos].innerHTML = letters[pos];
        slots[pos].classList.add("filled");
        t.disabled = true;
        t.classList.add("used");
        el.querySelectorAll(".tile.hint").forEach((x) => x.classList.remove("hint"));
        pos++; wrongHere = 0;
        if (pos === letters.length) api.correct();
      } else {
        wrongHere++;
        t.classList.remove("shake"); void t.offsetWidth; t.classList.add("shake");
        api.mistake({ quiet: true });
        if (wrongHere >= 2) {
          const right = [...el.querySelectorAll(".tile")].find((x) => !x.disabled && x.textContent === letters[pos]);
          if (right) right.classList.add("hint");
        }
      }
    });
  });
  return speech;
}

// Hebrew keyboard, by key position, so it works even when Windows is set to English.
const KEY_ROWS = [
  [["KeyE", "ק"], ["KeyR", "ר"], ["KeyT", "א"], ["KeyY", "ט"], ["KeyU", "ו"], ["KeyI", "ן"], ["KeyO", "ם"], ["KeyP", "פ"]],
  [["KeyA", "ש"], ["KeyS", "ד"], ["KeyD", "ג"], ["KeyF", "כ"], ["KeyG", "ע"], ["KeyH", "י"], ["KeyJ", "ח"], ["KeyK", "ל"], ["KeyL", "ך"], ["Semicolon", "ף"]],
  [["KeyZ", "ז"], ["KeyX", "ס"], ["KeyC", "ב"], ["KeyV", "ה"], ["KeyB", "נ"], ["KeyN", "מ"], ["KeyM", "צ"], ["Comma", "ת"], ["Period", "ץ"]],
];
const CODE_TO_LETTER = Object.fromEntries(KEY_ROWS.flat());

function typeWord(el, lvl, api) {
  const list = wordsUpTo(lvl).filter((w) => w.w.length <= (lvl <= 1 ? 3 : 5));
  const word = fresh(list, (w) => w.w);
  const letters = [...word.w];
  const speech = `הַקְלֵד אֶת הַמִּלָּה ${word.n} בַּמִּקְלֶדֶת`;
  el.innerHTML = `
    ${promptHTML("הקלד את המילה במקלדת")}
    <div class="visual"><button class="big-emoji tap" data-word>${word.e}</button></div>
    ${slotsHTML(letters, lvl <= 2)}
    <div class="keyboard" dir="ltr">
      ${KEY_ROWS.map((row) => `<div class="krow">${row.map(([c, l]) => `<button class="key" data-l="${l}">${l}</button>`).join("")}</div>`).join("")}
    </div>
    <p class="small-note">אפשר ללחוץ על המקלדת של המחשב או על האותיות כאן</p>`;
  wireSpeak(el, api, speech);
  el.querySelector("[data-word]").addEventListener("click", () => api.say(word.n));
  const slots = el.querySelectorAll(".slot");
  let pos = 0, wrongHere = 0;

  function press(l) {
    if (pos >= letters.length) return;
    const keyBtn = el.querySelector(`.key[data-l="${l}"]`);
    if (keyBtn) { keyBtn.classList.add("pressed"); setTimeout(() => keyBtn.classList.remove("pressed"), 150); }
    if (normal(l) === normal(letters[pos])) {
      Sfx.click();
      slots[pos].innerHTML = letters[pos];
      slots[pos].classList.add("filled");
      el.querySelectorAll(".key.hint").forEach((x) => x.classList.remove("hint"));
      pos++; wrongHere = 0;
      if (pos === letters.length) api.correct();
    } else {
      wrongHere++;
      slots[pos].classList.remove("shake"); void slots[pos].offsetWidth; slots[pos].classList.add("shake");
      api.mistake({ quiet: true });
      if (wrongHere >= 2) {
        const k = el.querySelector(`.key[data-l="${letters[pos]}"]`) || el.querySelector(`.key[data-l="${normal(letters[pos])}"]`);
        if (k) k.classList.add("hint");
      }
    }
  }
  el.querySelectorAll(".key").forEach((k) => k.addEventListener("click", () => press(k.dataset.l)));
  const onKey = (e) => {
    const l = CODE_TO_LETTER[e.code];
    if (l) { e.preventDefault(); press(l); }
  };
  document.addEventListener("keydown", onKey);
  api.cleanup(() => document.removeEventListener("keydown", onKey));
  return speech;
}

const TRACE_EASY = ["ו", "ד", "ר", "ג", "נ", "ז", "ל", "ה", "ב", "כ"];

function traceLetter(el, lvl, api) {
  const target = fresh(lvl <= 1 ? TRACE_EASY : LETTERS.map((x) => x.l));
  const speech = `עֲקֹב עִם הָעַכְבָּר עַל הָאוֹת ${letterName(target)}. לְחַץ וְצַיֵּר עָלֶיהָ`;
  el.innerHTML = `
    ${promptHTML("עקוב עם העכבר אחרי צורת האות")}
    <div class="trace-wrap"><canvas class="trace" width="320" height="320"></canvas></div>
    <div class="row-btns">
      <button class="soft-btn" data-clear>🧽 למחוק ולהתחיל שוב</button>
      <button class="soft-btn" data-skip>⏭️ אות אחרת</button>
    </div>`;
  wireSpeak(el, api, speech);
  const S = 320;
  const canvas = el.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const mk = () => { const c = document.createElement("canvas"); c.width = S; c.height = S; return c; };
  const font = "bold 310px Arial";

  // Where the letter is (mask) and a wider area around it (allowed area).
  const mask = mk(), near = mk(), ink = mk();
  const drawLetter = (c, extraStroke) => {
    const x = c.getContext("2d");
    x.font = font; x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = "#000";
    x.fillText(target, S / 2, S / 2 + 10);
    if (extraStroke) { x.lineWidth = extraStroke; x.strokeStyle = "#000"; x.lineJoin = "round"; x.strokeText(target, S / 2, S / 2 + 10); }
  };
  drawLetter(mask, 0);
  drawLetter(near, 44);
  const STEP = 5;
  const pts = (c) => {
    const d = c.getContext("2d").getImageData(0, 0, S, S).data;
    const out = [];
    for (let y = 0; y < S; y += STEP) for (let x = 0; x < S; x += STEP) if (d[(y * S + x) * 4 + 3] > 128) out.push(y * S + x);
    return out;
  };
  const letterPts = pts(mask);
  const nearData = near.getContext("2d").getImageData(0, 0, S, S).data;
  const color = api.heroColor;

  function redraw() {
    ctx.clearRect(0, 0, S, S);
    ctx.font = font; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = "#e2e8f0";
    ctx.fillText(target, S / 2, S / 2 + 10);
    ctx.setLineDash([6, 8]); ctx.lineWidth = 3; ctx.strokeStyle = "#94a3b8";
    ctx.strokeText(target, S / 2, S / 2 + 10);
    ctx.setLineDash([]);
    ctx.drawImage(ink, 0, 0);
  }
  redraw();

  const ix = ink.getContext("2d");
  ix.lineCap = "round"; ix.lineJoin = "round"; ix.lineWidth = 30; ix.strokeStyle = color;
  let drawing = false, last = null, done = false;
  const posOf = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * S, y: ((e.clientY - r.top) / r.height) * S };
  };
  canvas.addEventListener("pointerdown", (e) => {
    if (done) return;
    drawing = true; last = posOf(e); canvas.setPointerCapture(e.pointerId);
    ix.beginPath(); ix.arc(last.x, last.y, 15, 0, Math.PI * 2); ix.fillStyle = color; ix.fill();
    redraw();
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drawing || done) return;
    const p = posOf(e);
    ix.beginPath(); ix.moveTo(last.x, last.y); ix.lineTo(p.x, p.y); ix.stroke();
    last = p; redraw();
  });
  const stop = () => {
    if (!drawing) return;
    drawing = false;
    check();
  };
  canvas.addEventListener("pointerup", stop);
  canvas.addEventListener("pointercancel", stop);

  function check() {
    const d = ix.getImageData(0, 0, S, S).data;
    let covered = 0;
    for (const i of letterPts) if (d[i * 4 + 3] > 0) covered++;
    let inkCount = 0, outside = 0;
    for (let y = 0; y < S; y += STEP) for (let x = 0; x < S; x += STEP) {
      const i = y * S + x;
      if (d[i * 4 + 3] > 0) { inkCount++; if (nearData[i * 4 + 3] < 50) outside++; }
    }
    const coverage = covered / letterPts.length;
    const out = inkCount ? outside / inkCount : 0;
    if (out > 0.4) {
      api.mistake({ quiet: true });
      api.say("יָצָאתָ קְצָת מֵהָאוֹת. נִמְחַק וּנְנַסֶּה שׁוּב");
      setTimeout(clear, 900);
    } else if (coverage >= 0.62) {
      done = true;
      canvas.classList.add("traced");
      api.correct();
    }
  }
  function clear() { ix.clearRect(0, 0, S, S); redraw(); }
  el.querySelector("[data-clear]").addEventListener("click", clear);
  el.querySelector("[data-skip]").addEventListener("click", () => { api.mistake({ quiet: true }); api.replace(); });
  return speech;
}

// ---------- Numbers ----------
function numberOptions(answer, min, max, avoid = []) {
  const set = new Set([answer]);
  const near = shuffle([answer - 1, answer + 1, answer - 2, answer + 2, answer + 3, answer - 3, answer + 4]);
  for (const n of near) { if (set.size >= 3) break; if (n >= min && n <= max && !avoid.includes(n)) set.add(n); }
  while (set.size < 3) set.add(rand(min, max));
  return shuffle([...set]);
}

function countThings(el, lvl, api) {
  const max = lvl <= 1 ? 5 : lvl === 2 ? 8 : 10;
  const n = rand(lvl <= 1 ? 1 : 3, max);
  const thing = pick(COUNT_THINGS);
  const speech = "כַּמָּה יֵשׁ כָּאן? סְפֹר וּבְחַר אֶת הַמִּסְפָּר";
  choiceQuestion(el, api, {
    text: "כמה יש כאן? ספור ובחר",
    speech,
    visual: `<div class="count-box">${Array.from({ length: n }, () => `<span>${thing}</span>`).join("")}</div>`,
    options: numberOptions(n, 1, 10).map((x) => ({ value: x, html: `<span class="num">${x}</span>` })),
    answer: n,
    optionClass: "numbers",
  });
  return speech;
}

function sequence(el, lvl, api) {
  const top = lvl <= 1 ? 10 : lvl === 2 ? 15 : 20;
  const len = 4;
  const start = rand(1, top - len + 1);
  const seq = Array.from({ length: len }, (_, i) => start + i);
  const hide = lvl <= 1 ? len - 1 : rand(0, len - 1);
  const answer = seq[hide];
  const speech = "אֵיזֶה מִסְפָּר חָסֵר?";
  choiceQuestion(el, api, {
    text: "איזה מספר חסר ברצף?",
    speech,
    visual: `<div class="seq" dir="ltr">${seq.map((x, i) => `<span class="${i === hide ? "blank" : ""}">${i === hide ? "?" : x}</span>`).join("<b>→</b>")}</div>`,
    options: numberOptions(answer, 1, top, seq.filter((x) => x !== answer)).map((x) => ({ value: x, html: `<span class="num">${x}</span>` })),
    answer,
    optionClass: "numbers",
  });
  return speech;
}

function arithmetic(el, lvl, api) {
  const max = lvl <= 1 ? 5 : 10;
  const minus = lvl >= 2 && Math.random() < 0.45;
  let a, b, answer;
  if (minus) { a = rand(2, max); b = rand(1, a - 1); answer = a - b; }
  else { a = rand(1, max - 1); b = rand(1, max - a); answer = a + b; }
  const thing = pick(COUNT_THINGS);
  const pics = lvl <= 2;
  const picture = !pics ? "" : minus
    ? `<div class="count-box" dir="ltr">${Array.from({ length: a }, (_, i) => `<span class="${i >= a - b ? "gone" : ""}">${thing}</span>`).join("")}</div>`
    : `<div class="count-box" dir="ltr">${Array.from({ length: a }, () => `<span>${thing}</span>`).join("")}<b class="plus">+</b>${Array.from({ length: b }, () => `<span>${thing}</span>`).join("")}</div>`;
  const speech = minus ? `כַּמָּה זֶה ${a} פָּחוֹת ${b}?` : `כַּמָּה זֶה ${a} וְעוֹד ${b}?`;
  choiceQuestion(el, api, {
    text: "פתור את התרגיל",
    speech,
    visual: `<div class="equation" dir="ltr">${a} ${minus ? "−" : "+"} ${b} = <span class="blank">?</span></div>${picture}`,
    options: numberOptions(answer, 0, 10).map((x) => ({ value: x, html: `<span class="num">${x}</span>` })),
    answer,
    optionClass: "numbers",
  });
  return speech;
}

// Which challenges each zone uses.
const ZONE_CHALLENGES = {
  letters: [findLetter, soundStart, missingLetter],
  reading: [readPick, pictureWord],
  writing: [buildWord, traceLetter, typeWord],
  numbers: [countThings, sequence, arithmetic],
};

// A mission = 5 challenges, mixing the zone's types.
function planMission(zoneId) {
  const types = ZONE_CHALLENGES[zoneId];
  const plan = [];
  let bag = [];
  while (plan.length < 5) {
    if (!bag.length) bag = shuffle(types);
    plan.push(bag.pop());
  }
  return plan;
}
