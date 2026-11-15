// Makes the recorded voice for the game with ElevenLabs (a natural-sounding AI voice).
//
//   node tools/make-voice.js --count          how many sentences/words, and how many characters
//   node tools/make-voice.js --voices         list the voices in your ElevenLabs account
//   node tools/make-voice.js --sample         make 6 test sentences in audio/sample/ to listen to
//   node tools/make-voice.js                  make everything (skips clips that already exist)
//
// Needs a file .env.local in the project folder (it is never uploaded) with:
//   ELEVENLABS_API_KEY=...
//   ELEVENLABS_VOICE_ID=...          (from --voices)
//   ELEVENLABS_MODEL=eleven_v3       (optional)

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const JS = path.join(ROOT, "js");
const OUT = path.join(ROOT, "audio", "clips");

// ---------- settings ----------
function readEnv() {
  const env = {};
  const f = path.join(ROOT, ".env.local");
  if (fs.existsSync(f)) for (const line of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

// Same rule as the game (js/sound.js) for matching a sentence to its clip.
const KEY = (s) => String(s).replace(/\s+/g, " ").trim();
const NIQQUD = /[ְ-ׇ]/;

// Numbers are said as words (counting form).
const NUMBER_WORDS = ["אֶפֶס", "אַחַת", "שְׁתַּיִם", "שָׁלוֹשׁ", "אַרְבַּע", "חָמֵשׁ", "שֵׁשׁ", "שֶׁבַע", "שְׁמוֹנֶה", "תֵּשַׁע", "עֶשֶׂר",
  "אַחַת עֶשְׂרֵה", "שְׁתֵּים עֶשְׂרֵה", "שְׁלוֹשׁ עֶשְׂרֵה", "אַרְבַּע עֶשְׂרֵה", "חֲמֵשׁ עֶשְׂרֵה", "שֵׁשׁ עֶשְׂרֵה", "שְׁבַע עֶשְׂרֵה",
  "שְׁמוֹנֶה עֶשְׂרֵה", "תְּשַׁע עֶשְׂרֵה", "עֶשְׂרִים"];

// ---------- everything the game can say ----------
function collectPhrases() {
  const ctx = vm.createContext({});
  vm.runInContext(fs.readFileSync(path.join(JS, "data.js"), "utf8"), ctx);
  const get = (expr) => vm.runInContext(expr, ctx);
  const set = new Set();
  const add = (s) => { if (s !== undefined && s !== null && KEY(s)) set.add(KEY(s)); };

  get("WORDS").forEach((w) => add(w.n));
  get("LETTERS").forEach((l) => add(l.name));
  get("COLOR_WORDS").forEach((c) => add(c.n));
  get("ZONES").forEach((z) => { add(z.story); add(z.title.replace(NIQQUD, "")); });
  get("NEIGHBORHOODS").forEach((h) => add(h.spoken));
  Object.values(get("HEROES")).forEach((h) => { add(h.spokenTitle); add(h.spokenName); add(h.spokenAnd); });
  get("BASE_PARTS").forEach((p) => add(p.name));
  get("POWERS").forEach((p) => add(p.name));
  ["PRAISE", "BURSTS", "TRY_AGAIN"].forEach((k) => get(k).forEach(add));
  for (let n = 0; n <= 20; n++) add(String(n));
  add("מדליית גיבור");

  // Every quoted sentence with vowel marks in the game's code.
  for (const f of fs.readdirSync(JS).filter((x) => x.endsWith(".js"))) {
    const src = fs.readFileSync(path.join(JS, f), "utf8");
    for (const m of src.matchAll(/"([^"\n]*)"/g)) if (NIQQUD.test(m[1])) add(m[1]);
  }
  return [...set];
}

// What is actually sent to the voice (numbers become words).
const spokenText = (key) => (/^\d+$/.test(key) ? NUMBER_WORDS[+key] || key : key);
const fileFor = (key) => crypto.createHash("sha1").update(key).digest("hex").slice(0, 12) + ".mp3";

// ---------- ElevenLabs ----------
async function tts(env, text) {
  const model = env.ELEVENLABS_MODEL || "eleven_v3";
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${env.ELEVENLABS_VOICE_ID}?output_format=mp3_44100_64`, {
    method: "POST",
    headers: { "xi-api-key": env.ELEVENLABS_API_KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text, model_id: model }),
  });
  if (!res.ok) throw new Error(`ElevenLabs answered ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return Buffer.from(await res.arrayBuffer());
}

function writeClipsFile(keys) {
  const map = {};
  for (const k of keys) if (fs.existsSync(path.join(OUT, fileFor(k)))) map[k] = `audio/clips/${fileFor(k)}`;
  fs.writeFileSync(path.join(ROOT, "audio", "clips.js"),
    `// Recorded voice clips, made by tools/make-voice.js. ${Object.keys(map).length} clips.\nwindow.VOICE_CLIPS = ${JSON.stringify(map, null, 0)};\n`);
  return Object.keys(map).length;
}

async function main() {
  const arg = process.argv[2] || "";
  const phrases = collectPhrases();
  if (arg === "--count") {
    const chars = phrases.reduce((s, k) => s + spokenText(k).length, 0);
    console.log(`${phrases.length} clips, about ${chars} characters (with vowel marks).`);
    return;
  }
  const env = readEnv();
  if (!env.ELEVENLABS_API_KEY) { console.log("Missing ELEVENLABS_API_KEY in .env.local"); process.exit(1); }
  if (arg === "--voices") {
    const res = await fetch("https://api.elevenlabs.io/v1/voices", { headers: { "xi-api-key": env.ELEVENLABS_API_KEY } });
    const data = await res.json();
    for (const v of data.voices || []) console.log(`${v.voice_id}  ${v.name}  ${v.labels ? JSON.stringify(v.labels) : ""}`);
    return;
  }
  if (!env.ELEVENLABS_VOICE_ID) { console.log("Missing ELEVENLABS_VOICE_ID in .env.local (see --voices)"); process.exit(1); }
  if (arg === "--sample") {
    const dir = path.join(ROOT, "audio", "sample");
    fs.mkdirSync(dir, { recursive: true });
    const samples = ["שָׁלוֹם בַּר אִישׁ הָאֵשׁ! דּוֹקְטוֹר בַּלָּגָן מְבַלְגֵּן אֶת הָעִיר. לְאָן רָצִים?", "בְּאֵיזוֹ אוֹת מַתְחִילָה הַמִּלָּה", "כַּדּוּר", "כׇּל הַכָּבוֹד!", "כַּמָּה זֶה", "שָׁלוֹשׁ"];
    for (let i = 0; i < samples.length; i++) { fs.writeFileSync(path.join(dir, `sample-${i + 1}.mp3`), await tts(env, samples[i])); console.log("made sample", i + 1); }
    console.log("Listen to the files in audio/sample/");
    return;
  }
  fs.mkdirSync(OUT, { recursive: true });
  let made = 0, skipped = 0;
  for (const k of phrases) {
    const f = path.join(OUT, fileFor(k));
    if (fs.existsSync(f)) { skipped++; continue; }
    try { fs.writeFileSync(f, await tts(env, spokenText(k))); made++; }
    catch (e) { console.log(`Stopped after ${made} new clips: ${e.message}`); break; }
    if (made % 25 === 0) console.log(`${made} made...`);
  }
  const total = writeClipsFile(phrases);
  console.log(`Done: ${made} new, ${skipped} already there. The game now has ${total} of ${phrases.length} clips.`);
}

main();
