// Speaking in Hebrew (the browser's built-in voice) and little sound effects.

const Voice = {
  voice: null,
  ready: false,

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

  hasHebrew() {
    return !!this.voice;
  },

  say(text, onEnd) {
    if (!("speechSynthesis" in window) || !text) { if (onEnd) onEnd(); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "he-IL";
    if (this.voice) u.voice = this.voice;
    u.rate = 0.88;
    u.pitch = 1.1;
    if (onEnd) u.onend = onEnd;
    speechSynthesis.speak(u);
  },

  stop() {
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
  click() { this.tone(520, 0, 0.06, "square", 0.05); },
  zap() { this.tone(900, 0, 0.1, "sawtooth", 0.06); this.tone(400, 0.08, 0.15, "sawtooth", 0.05); },
  win() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, i * 0.13, 0.3, "triangle", 0.15)); },
};
