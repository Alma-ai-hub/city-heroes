// Speaking in Hebrew, and little sound effects.
// If recorded voice clips exist (audio/clips.js, made by tools/make-voice.js), the game plays
// them; otherwise it uses the device's built-in voice (the best Hebrew one it has, or the one
// chosen in the parents corner).
// What to say can be a sentence, or a list of parts (["בְּאֵיזוֹ אוֹת מַתְחִילָה הַמִּלָּה", "כַּדּוּר"]),
// so a recorded sentence and a recorded word can be played one after the other.
//
// Tablets and phones only allow sound after the first touch, so the first touch "unlocks" it.

const VOICE_KEY = (s) => String(s).replace(/\s+/g, " ").trim();
const VOICE_PREFS_KEY = "city-heroes-voice";
const IS_TOUCH = window.matchMedia && matchMedia("(pointer: coarse)").matches;
// A tiny silent sound, used to unlock audio on iPad/iPhone.
// (a tenth of a second of silence, as a WAV file made right here)
const SILENT_SOUND = (() => {
  const n = 800, buf = new Uint8Array(44 + n);
  const dv = new DataView(buf.buffer);
  const str = (o, t) => [...t].forEach((c, k) => dv.setUint8(o + k, c.charCodeAt(0)));
  str(0, "RIFF"); dv.setUint32(4, 36 + n, true); str(8, "WAVEfmt "); dv.setUint32(16, 16, true);
  dv.setUint16(20, 1, true); dv.setUint16(22, 1, true); dv.setUint32(24, 8000, true); dv.setUint32(28, 8000, true);
  dv.setUint16(32, 1, true); dv.setUint16(34, 8, true); str(36, "data"); dv.setUint32(40, n, true);
  buf.fill(128, 44);
  return "data:audio/wav;base64," + btoa(String.fromCharCode(...buf));
})();

const Voice = {
  voice: null,
  voices: [],
  ready: false,
  token: 0,
  player: null, // one audio player, reused (iPad only lets an "unlocked" player play)
  prefs: (() => { try { return JSON.parse(localStorage.getItem(VOICE_PREFS_KEY)) || {}; } catch (e) { return {}; } })(),

  init() {
    this.player = new Audio();
    this.player.preload = "auto";
    if ("speechSynthesis" in window) {
      this.pickVoice();
      speechSynthesis.onvoiceschanged = () => this.pickVoice();
    }
    // The first touch or click unlocks speech and sound (needed on tablets and phones).
    const unlock = () => {
      try {
        this.player.src = SILENT_SOUND;
        this.player.play().catch(() => {});
      } catch (e) { /* ignore */ }
      Sfx.wake();
      if ("speechSynthesis" in window) {
        const u = new SpeechSynthesisUtterance(" ");
        u.volume = 0;
        speechSynthesis.speak(u);
      }
      document.removeEventListener("pointerdown", unlock, true);
      document.removeEventListener("keydown", unlock, true);
    };
    document.addEventListener("pointerdown", unlock, true);
    document.addEventListener("keydown", unlock, true);
  },

  // Rank the device's voices: natural/enhanced ones first. Hebrew for most things, English for English words.
  pickVoice() {
    const all = speechSynthesis.getVoices();
    const score = (v) => (/natural|online|neural/i.test(v.name) ? 40 : 0) + (/premium|enhanced|plus/i.test(v.name) ? 30 : 0)
      + (/google/i.test(v.name) ? 15 : 0) + (/samantha|aria|jenny|ava/i.test(v.name) ? 10 : 0) + (v.localService ? 0 : 5);
    this.voices = all.filter((v) => v.lang && /^he|^iw/i.test(v.lang)).sort((a, b) => score(b) - score(a));
    const chosen = this.prefs.voiceName && this.voices.find((v) => v.name === this.prefs.voiceName);
    this.voice = chosen || this.voices[0] || null;
    const en = all.filter((v) => v.lang && /^en[-_]?(us|gb)?/i.test(v.lang)).sort((a, b) => score(b) - score(a) + (/en.us/i.test(b.lang) ? 3 : 0) - (/en.us/i.test(a.lang) ? 3 : 0));
    this.enVoice = en[0] || null;
    this.ready = true;
  },

  setPrefs(p) {
    this.prefs = { ...this.prefs, ...p };
    try { localStorage.setItem(VOICE_PREFS_KEY, JSON.stringify(this.prefs)); } catch (e) { /* ignore */ }
    if ("speechSynthesis" in window) this.pickVoice();
  },

  hasRecorded() { return !!(window.VOICE_CLIPS && Object.keys(window.VOICE_CLIPS).length); },
  hasHebrew() { return this.hasRecorded() || !!this.voice; },

  // A part is a Hebrew text, or { en: "apple" } for an English word (said with an English voice).
  say(text, onEnd) {
    this.stop();
    const parts = (Array.isArray(text) ? text : [text])
      .map((p) => (p && typeof p === "object" ? { en: VOICE_KEY(p.en) } : VOICE_KEY(p ?? "")))
      .filter((p) => (typeof p === "object" ? p.en : p));
    if (!parts.length) { if (onEnd) onEnd(); return; }
    const clips = window.VOICE_CLIPS || {};
    const key = (p) => (typeof p === "object" ? "en:" + p.en : p);
    if (parts.every((p) => clips[key(p)])) return this.playClips(parts.map((p) => clips[key(p)]), onEnd);
    // Join Hebrew parts that come one after another; English words are said on their own.
    const segs = [];
    for (const p of parts) {
      const en = typeof p === "object";
      const last = segs[segs.length - 1];
      if (!en && last && !last.en) last.text += " " + p;
      else segs.push(en ? { text: p.en, en: true } : { text: p, en: false });
    }
    this.speak(segs, onEnd);
  },

  playClips(files, onEnd) {
    const my = this.token;
    const a = this.player;
    let i = 0;
    const next = () => {
      if (my !== this.token) return;
      if (i >= files.length) { if (onEnd) onEnd(); return; }
      a.onended = () => setTimeout(next, 60);
      a.onerror = () => next();
      a.src = files[i++];
      a.play().catch(() => next());
    };
    next();
  },

  speak(segs, onEnd) {
    if (typeof segs === "string") segs = [{ text: segs, en: false }];
    if (!("speechSynthesis" in window)) { if (onEnd) onEnd(); return; }
    const my = this.token;
    const us = segs.map((s, i) => {
      const u = new SpeechSynthesisUtterance(s.text);
      u.lang = s.en ? "en-US" : "he-IL";
      const v = s.en ? this.enVoice : this.voice;
      if (v) u.voice = v;
      u.rate = s.en ? 0.8 : (this.prefs.rate || 0.9);
      u.pitch = 1.05;
      if (i === segs.length - 1 && onEnd) u.onend = onEnd;
      return u;
    });
    // A short pause after stopping the previous sentence: some tablets drop speech said right away.
    setTimeout(() => {
      if (my !== this.token) return;
      try { speechSynthesis.resume(); } catch (e) { /* ignore */ }
      us.forEach((u) => speechSynthesis.speak(u));
    }, 80);
  },

  stop() {
    this.token++;
    if (this.player) { try { this.player.pause(); } catch (e) { /* ignore */ } }
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  },
};

const Sfx = {
  ctx: null,
  wake() {
    try {
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === "suspended") this.ctx.resume();
    } catch (e) { /* ignore */ }
  },
  tone(freq, start, dur, type = "sine", vol = 0.18) {
    try {
      this.wake();
      const t = this.ctx.currentTime + start;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g).connect(this.ctx.destination);
      o.start(t);
      o.stop(t + dur);
    } catch (e) { /* no sound, no problem */ }
  },
  good() { this.tone(660, 0, 0.15); this.tone(880, 0.1, 0.2); },
  oops() { this.tone(220, 0, 0.25, "triangle", 0.12); },
  step() { this.tone(180 + Math.random() * 60, 0, 0.05, "triangle", 0.06); },
  pop() { this.tone(900, 0, 0.05, "square", 0.08); this.tone(300, 0.03, 0.12, "triangle", 0.1); },
  drum() { this.tone(110, 0, 0.18, "sine", 0.35); this.tone(70, 0.01, 0.2, "triangle", 0.2); },
  click() { this.tone(520, 0, 0.06, "square", 0.05); },
  zap() { this.tone(900, 0, 0.1, "sawtooth", 0.06); this.tone(400, 0.08, 0.15, "sawtooth", 0.05); },
  win() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, i * 0.13, 0.3, "triangle", 0.15)); },
};
