// Speaking in Hebrew, and little sound effects.
// If recorded voice clips exist (audio/clips.js, made by tools/make-voice.js), the game plays
// them; otherwise it uses the browser's built-in voice.
// What to say can be a sentence, or a list of parts (["בְּאֵיזוֹ אוֹת מַתְחִילָה הַמִּלָּה", "כַּדּוּר"]),
// so a recorded sentence and a recorded word can be played one after the other.

const VOICE_KEY = (s) => String(s).replace(/\s+/g, " ").trim();

const Voice = {
  voice: null,
  ready: false,
  playing: [],
  token: 0,

  init() {
    const pick = () => {
      const voices = speechSynthesis.getVoices();
      const he = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith("he"));
      // Natural "Online" voices (in Edge) sound much better.
      this.voice = he.find((v) => /online|natural/i.test(v.name)) || he[0] || null;
      this.ready = true;
    };
    if (!("speechSynthesis" in window)) return;
    pick();
    speechSynthesis.onvoiceschanged = pick;
  },

  hasRecorded() { return !!(window.VOICE_CLIPS && Object.keys(window.VOICE_CLIPS).length); },
  hasHebrew() { return this.hasRecorded() || !!this.voice; },

  say(text, onEnd) {
    this.stop();
    const parts = (Array.isArray(text) ? text : [text]).map(VOICE_KEY).filter(Boolean);
    if (!parts.length) { if (onEnd) onEnd(); return; }
    const clips = window.VOICE_CLIPS || {};
    if (parts.every((p) => clips[p])) return this.playClips(parts.map((p) => clips[p]), onEnd);
    this.speak(parts.join(" "), onEnd);
  },

  playClips(files, onEnd) {
    const my = ++this.token;
    let i = 0;
    const next = () => {
      if (my !== this.token) return;
      if (i >= files.length) { if (onEnd) onEnd(); return; }
      const a = new Audio(files[i++]);
      this.playing.push(a);
      a.onended = () => setTimeout(next, 60);
      a.onerror = () => next();
      a.play().catch(() => next());
    };
    next();
  },

  speak(text, onEnd) {
    if (!("speechSynthesis" in window)) { if (onEnd) onEnd(); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "he-IL";
    if (this.voice) u.voice = this.voice;
    u.rate = 0.88;
    u.pitch = 1.1;
    if (onEnd) u.onend = onEnd;
    speechSynthesis.speak(u);
  },

  stop() {
    this.token++;
    this.playing.forEach((a) => { try { a.pause(); } catch (e) { /* ignore */ } });
    this.playing = [];
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  },
};

const Sfx = {
  ctx: null,
  tone(freq, start, dur, type = "sine", vol = 0.18) {
    try {
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
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
