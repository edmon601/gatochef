'use strict';
/* =========================================================
   GATO CHEF  -  juego de cocina con minijuegos para peques
   Sin publicidad, sin internet, sin compras, sin enlaces.
   ========================================================= */

const APP_VERSION = '6';
const $ = (s, r = document) => r.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const LV = () => Math.max(1, Math.min(3, +Settings.data.level || 2));            // dificultad 1 facil, 2 chef, 3 maestro
const byLv = (a, b, c) => [a, b, c][LV() - 1];
const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const SVGNS = 'http://www.w3.org/2000/svg';

/* ---------------- Ajustes y progreso (se guardan en el celular) ---------------- */
const Settings = {
  data: { volume: 0.8, voice: true, stress: true, muted: false, mic: true, micGain: 2.5, badVol: 0.35, level: 2 },
  load() { try { Object.assign(this.data, JSON.parse(localStorage.getItem('gatochef.settings') || '{}')); } catch (e) { /* sin almacenamiento */ } },
  save() { try { localStorage.setItem('gatochef.settings', JSON.stringify(this.data)); } catch (e) { /* nada */ } }
};
const Progress = {
  data: { cookies: 0 },
  load() { try { Object.assign(this.data, JSON.parse(localStorage.getItem('gatochef.progress') || '{}')); } catch (e) { /* nada */ } },
  save() { try { localStorage.setItem('gatochef.progress', JSON.stringify(this.data)); } catch (e) { /* nada */ } }
};

/* ---------------- El gato chef (dibujo propio, SVG) ---------------- */
const CAT_SVG = `
<svg class="cat" viewBox="0 0 200 230" xmlns="http://www.w3.org/2000/svg">
  <g class="tail">
    <path d="M148 205 C196 205 200 140 168 124" stroke="#F4963A" stroke-width="17" fill="none" stroke-linecap="round"/>
    <path d="M181 138 C189 148 189 160 183 170" stroke="#C9651A" stroke-width="17" fill="none" stroke-linecap="round" opacity=".8"/>
  </g>
  <g class="body">
    <path d="M52 232 C46 178 68 150 100 150 C132 150 154 178 148 232 Z" fill="#fff" stroke="#e2dccf" stroke-width="3"/>
    <path d="M84 152 L100 172 L116 152" fill="none" stroke="#e2dccf" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="100" cy="186" r="4.5" fill="#d9d2c3"/><circle cx="100" cy="206" r="4.5" fill="#d9d2c3"/>
    <ellipse cx="66" cy="214" rx="15" ry="11" fill="#F4963A"/><ellipse cx="134" cy="214" rx="15" ry="11" fill="#F4963A"/>
    <path d="M60 212 L60 220 M67 211 L67 221 M74 212 L74 220" stroke="#C9651A" stroke-width="2" stroke-linecap="round"/>
    <path d="M126 212 L126 220 M133 211 L133 221 M140 212 L140 220" stroke="#C9651A" stroke-width="2" stroke-linecap="round"/>
  </g>
  <g class="head">
    <path d="M42 84 L44 40 L80 62 Z" fill="#F4963A"/><path d="M52 76 L54 52 L70 62 Z" fill="#F7B6A0"/>
    <path d="M158 84 L156 40 L120 62 Z" fill="#F4963A"/><path d="M148 76 L146 52 L130 62 Z" fill="#F7B6A0"/>
    <ellipse cx="100" cy="98" rx="59" ry="52" fill="#F4963A"/>
    <path d="M100 48 L100 66 M84 52 L88 66 M116 52 L112 66" stroke="#C9651A" stroke-width="6" stroke-linecap="round" fill="none"/>
    <path d="M42 94 L59 96 M44 108 L60 105" stroke="#C9651A" stroke-width="5.5" stroke-linecap="round" fill="none"/>
    <path d="M158 94 L141 96 M156 108 L140 105" stroke="#C9651A" stroke-width="5.5" stroke-linecap="round" fill="none"/>
    <ellipse cx="100" cy="116" rx="27" ry="20" fill="#FFE3C2"/>
    <g class="eyes-normal">
      <ellipse cx="76" cy="94" rx="10" ry="12.5" fill="#2b1a10"/><ellipse cx="124" cy="94" rx="10" ry="12.5" fill="#2b1a10"/>
      <circle cx="80" cy="89" r="4" fill="#fff"/><circle cx="128" cy="89" r="4" fill="#fff"/>
      <circle cx="73" cy="99" r="2" fill="#fff"/><circle cx="121" cy="99" r="2" fill="#fff"/>
    </g>
    <g class="eyes-happy">
      <path d="M65 99 Q76 82 87 99" stroke="#2b1a10" stroke-width="5.5" fill="none" stroke-linecap="round"/>
      <path d="M113 99 Q124 82 135 99" stroke="#2b1a10" stroke-width="5.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="58" cy="112" rx="8" ry="5" fill="#ff8fa3" opacity=".55"/><ellipse cx="142" cy="112" rx="8" ry="5" fill="#ff8fa3" opacity=".55"/>
    </g>
    <g class="eyes-stress">
      <circle cx="76" cy="94" r="15" fill="#fff" stroke="#2b1a10" stroke-width="3.5"/><circle cx="124" cy="94" r="15" fill="#fff" stroke="#2b1a10" stroke-width="3.5"/>
      <circle cx="73" cy="97" r="3.6" fill="#2b1a10"/><circle cx="127" cy="97" r="3.6" fill="#2b1a10"/>
      <path d="M60 74 L88 82 M140 74 L112 82" stroke="#2b1a10" stroke-width="4.5" stroke-linecap="round"/>
    </g>
    <path d="M92 108 L108 108 L100 117 Z" fill="#E87A8C"/>
    <g class="mouth-normal">
      <path d="M100 117 L100 123 M100 123 Q92 132 84 124 M100 123 Q108 132 116 124" stroke="#7a3b1f" stroke-width="3" fill="none" stroke-linecap="round"/>
    </g>
    <g class="mouth-open">
      <path d="M84 123 Q100 150 116 123 Z" fill="#7a2a2a" stroke="#7a3b1f" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="100" cy="137" rx="8" ry="5" fill="#ff8fa3"/>
    </g>
    <g stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".95">
      <path d="M62 114 L30 108 M62 120 L30 124 M138 114 L170 108 M138 120 L170 124"/>
    </g>
    <path class="sweat" d="M160 66 C150 82 170 82 160 66 Z" fill="#7fd0ff" stroke="#3b9ad6" stroke-width="2"/>
    <g class="hat">
      <path d="M56 52 C34 52 34 14 64 18 C66 -4 100 -4 100 12 C100 -4 134 -4 136 18 C166 14 166 52 144 52 Z" fill="#fff" stroke="#e2dccf" stroke-width="3"/>
      <rect x="58" y="44" width="84" height="18" rx="6" fill="#fff" stroke="#e2dccf" stroke-width="3"/>
    </g>
  </g>
</svg>`;

function mountCat(container) {
  container.innerHTML = `<div class="cat-wrap">${CAT_SVG}</div>`;
  return container;
}
function setCat(root, state, ms) {
  const svg = root.querySelector('.cat');
  if (!svg) return;
  svg.classList.remove('happy', 'stress');
  if (state) svg.classList.add(state);
  clearTimeout(root._catTimer);
  if (state && ms) root._catTimer = setTimeout(() => svg.classList.remove(state), ms);
}
function animCat(root, cls) {
  const w = root.querySelector('.cat-wrap');
  if (!w) return;
  w.classList.remove('jump', 'shake');
  void w.offsetWidth;
  w.classList.add(cls);
}

/* ---------------- Sonido ----------------
   Si existen archivos en /sounds se usan (maullidos reales).
   Si no existen, el juego fabrica sonidos de reemplazo por si solo. */
const Sound = (() => {
  let ctx = null, master = null, noiseBuf = null, sizzleStop = null;
  const buffers = {};
  const FILES = {
    meowOk: ['meow-ok-1', 'meow-ok-2', 'meow-ok-3'],
    meowBad: ['meow-bad-1', 'meow-bad-2', 'meow-bad-3'],
    crack: ['crack'], plop: ['plop'], chop: ['chop'], swoosh: ['swoosh'],
    ding: ['ding'], tada: ['tada'], sizzle: ['sizzle']
  };

  // Estado de la carga de sonidos (se muestra en los ajustes para papas)
  const diag = { embedded: [], files: [], errors: [] };
  const stemOf = (name) => String(name).replace(/\.[a-z0-9]+$/i, '');
  const groupOf = (stem) => Object.keys(FILES).find((g) => FILES[g].includes(stem));
  const b64ToBuf = (dataUrl) => {
    const bin = atob(String(dataUrl).split(',')[1] || '');
    const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return u8.buffer;
  };

  // 1) sonidos incluidos en embedded-sounds.js   2) extras listados en sounds/list.json
  async function loadAll() {
    const have = new Set();
    const emb = window.EMBEDDED_SOUNDS || {};
    for (const stem of Object.keys(emb)) {
      const group = groupOf(stem);
      if (!group) continue;
      try {
        const buf = await ctx.decodeAudioData(b64ToBuf(emb[stem]));
        (buffers[group] = buffers[group] || []).push(buf);
        have.add(stem); diag.embedded.push(stem);
      } catch (e) { diag.errors.push(stem + ': ' + (e && e.message || e)); }
    }
    let list = [];
    try {
      const r = await fetch('sounds/list.json');
      if (r.ok) list = await r.json();
    } catch (e) { /* sin lista de sonidos */ }
    for (const file of list) {
      const stem = stemOf(file), group = groupOf(stem);
      if (!group || have.has(stem)) continue;
      try {
        const r = await fetch('sounds/' + file);
        if (!r.ok) { diag.errors.push(file + ': no se pudo descargar'); continue; }
        const buf = await ctx.decodeAudioData(await r.arrayBuffer());
        (buffers[group] = buffers[group] || []).push(buf);
        have.add(stem); diag.files.push(file);
      } catch (e) { diag.errors.push(file + ': ' + (e && e.message || e)); }
    }
  }

  function init() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    applyVolume();
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp); comp.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    loadAll();
  }
  function resume() { init(); if (ctx && ctx.state === 'suspended') ctx.resume(); }
  function applyVolume() { if (master) master.gain.value = Settings.data.muted ? 0 : Settings.data.volume; }

  /* --- utilidades de sintesis --- */
  function noise(t, dur, { type = 'bandpass', f = 2000, q = 1, vol = 0.3, f2 = null } = {}) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const flt = ctx.createBiquadFilter(); flt.type = type; flt.Q.value = q;
    flt.frequency.setValueAtTime(f, t); if (f2) flt.frequency.linearRampToValueAtTime(f2, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.01, dur / 3)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(flt); flt.connect(g); g.connect(master); s.start(t); s.stop(t + dur + 0.05);
  }
  function tone(t, { type = 'sine', f = 440, f2 = null, dur = 0.2, vol = 0.3 } = {}) {
    const o = ctx.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
  }
  function voiceSweep(t, { f0, peak, end, dur, vib, vibDepth, bp0, bp1, bp2, q = 3, vol = 0.9, type = 'sawtooth' }) {
    const o = ctx.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.linearRampToValueAtTime(peak, t + dur * 0.35);
    o.frequency.linearRampToValueAtTime(end, t + dur);
    const lfo = ctx.createOscillator(); lfo.frequency.value = vib;
    const lg = ctx.createGain(); lg.gain.value = vibDepth; lfo.connect(lg); lg.connect(o.frequency);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = q;
    bp.frequency.setValueAtTime(bp0, t); bp.frequency.linearRampToValueAtTime(bp1, t + dur * 0.4); bp.frequency.linearRampToValueAtTime(bp2, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.06); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(bp); bp.connect(g); g.connect(master);
    o.start(t); lfo.start(t); o.stop(t + dur + 0.05); lfo.stop(t + dur + 0.05);
  }

  /* --- sonidos de reemplazo --- */
  const synth = {
    meowOk() {
      const t = ctx.currentTime, f0 = 380 + Math.random() * 130;
      voiceSweep(t, { f0, peak: f0 * 1.5, end: f0 * 0.85, dur: 0.6, vib: 6, vibDepth: f0 * 0.02, bp0: 600, bp1: 1500, bp2: 800, q: 3, vol: 1.0 });
    },
    meowBad() {
      const t = ctx.currentTime;
      voiceSweep(t, { f0: 640, peak: 1150, end: 600, dur: 0.5, vib: 24, vibDepth: 45, bp0: 1100, bp1: 2600, bp2: 1400, q: 2, vol: 0.9 });
      voiceSweep(t + 0.04, { f0: 660, peak: 1190, end: 620, dur: 0.5, vib: 21, vibDepth: 50, bp0: 1100, bp1: 2600, bp2: 1400, q: 2, vol: 0.5, type: 'square' });
      voiceSweep(t + 0.32, { f0: 780, peak: 1400, end: 700, dur: 0.6, vib: 26, vibDepth: 55, bp0: 1200, bp1: 3000, bp2: 1500, q: 2, vol: 0.9 });
      noise(t + 0.3, 0.18, { type: 'highpass', f: 4200, vol: 0.25 });
    },
    oops() { const t = ctx.currentTime; tone(t, { type: 'triangle', f: 330, f2: 180, dur: 0.28, vol: 0.4 }); },
    crack() { const t = ctx.currentTime; noise(t, 0.07, { f: 2600, q: 1.5, vol: 0.7 }); noise(t + 0.06, 0.09, { f: 1800, q: 1.2, vol: 0.5 }); tone(t, { f: 160, f2: 80, dur: 0.1, vol: 0.4 }); },
    plop() { const t = ctx.currentTime; tone(t, { f: 380, f2: 110, dur: 0.16, vol: 0.55 }); noise(t + 0.02, 0.1, { type: 'lowpass', f: 900, vol: 0.2 }); },
    chop() { const t = ctx.currentTime; noise(t, 0.06, { type: 'lowpass', f: 1500, vol: 0.7 }); tone(t, { f: 200, f2: 90, dur: 0.08, vol: 0.5 }); },
    swoosh() { const t = ctx.currentTime; noise(t, 0.3, { f: 350, f2: 1400, q: 0.8, vol: 0.35 }); },
    ding() { const t = ctx.currentTime; tone(t, { f: 1318, dur: 1.1, vol: 0.4 }); tone(t, { f: 1976, dur: 0.8, vol: 0.2 }); },
    pop() { const t = ctx.currentTime, f = 460 + Math.random() * 120; tone(t, { f, f2: f * 1.7, dur: 0.09, vol: 0.4 }); },
    bloop() { const t = ctx.currentTime, f = 300 + Math.random() * 300; tone(t, { f, f2: f * 2.2, dur: 0.12, vol: 0.45 }); noise(t, 0.05, { type: 'highpass', f: 3000, vol: 0.12 }); },
    salt() { const t = ctx.currentTime; noise(t, 0.18, { type: 'highpass', f: 5000, vol: 0.3 }); noise(t + 0.06, 0.15, { type: 'highpass', f: 6000, vol: 0.2 }); },
    sparkle() { const t = ctx.currentTime; [1568, 2093, 2637].forEach((f, i) => tone(t + i * 0.05, { f, dur: 0.18, vol: 0.25 })); },
    tada() { const t = ctx.currentTime; [523, 659, 784, 1046].forEach((f, i) => tone(t + i * 0.1, { type: 'triangle', f, dur: 0.35, vol: 0.4 })); tone(t + 0.4, { type: 'triangle', f: 1318, dur: 0.6, vol: 0.3 }); }
  };

  // Devuelve cuantos milisegundos dura el audio real que sono (0 si fue un sonido de reemplazo)
  function playGroup(group, synthName, rateVar = 0) {
    if (!ctx) return 0;
    const list = buffers[group];
    if (list && list.length) {
      const src = ctx.createBufferSource();
      const buf = pick(list);
      src.buffer = buf;
      let rate = 1;
      if (rateVar) { rate = 1 + (Math.random() - 0.5) * rateVar; src.playbackRate.value = rate; }
      const gn = ctx.createGain();
      gn.gain.value = group === 'meowBad' ? Math.max(0.05, Math.min(1, Settings.data.badVol == null ? 0.35 : Settings.data.badVol)) : 1;
      src.connect(gn); gn.connect(master); src.start();
      return Math.round(buf.duration / rate * 1000);
    } else if (synth[synthName]) {
      synth[synthName]();
    }
    return 0;
  }

  function sizzleStart() {
    if (!ctx || sizzleStop) return;
    const src = ctx.createBufferSource();
    const real = buffers.sizzle && buffers.sizzle[0];
    src.buffer = real || noiseBuf; src.loop = true;
    const g = ctx.createGain(); g.gain.value = real ? 0.18 : 0.018;
    if (real) { src.connect(g); } else {
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 3500; src.connect(f); f.connect(g);
    }
    g.connect(master); src.start();
    sizzleStop = () => { try { g.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.2); src.stop(ctx.currentTime + 0.25); } catch (e) { /* ya parado */ } sizzleStop = null; };
  }

  // Chorro de liquido mientras se mantiene presionado
  let pourStopFn = null;
  function pourStart() {
    if (!ctx || pourStopFn) return;
    const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 0.7;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 7;
    const lg = ctx.createGain(); lg.gain.value = 450; lfo.connect(lg); lg.connect(f.frequency);
    const g = ctx.createGain(); g.gain.value = 0.06;
    src.connect(f); f.connect(g); g.connect(master); src.start(); lfo.start();
    pourStopFn = () => {
      try { g.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.12); src.stop(ctx.currentTime + 0.15); lfo.stop(ctx.currentTime + 0.15); } catch (e) { /* ya parado */ }
      pourStopFn = null;
    };
  }

  return {
    resume, applyVolume, context: () => ctx,
    report: () => ({
      audio: !!ctx,
      badLoaded: !!(buffers.meowBad && buffers.meowBad.length),
      badSeconds: buffers.meowBad && buffers.meowBad[0] ? +buffers.meowBad[0].duration.toFixed(1) : 0,
      errors: diag.errors.slice()
    }),
    testBad: () => playGroup('meowBad', 'meowBad', 0),
    bloop: () => playGroup('none', 'bloop'),
    salt: () => playGroup('none', 'salt'),
    squish: () => playGroup('plop', 'plop', 0.2),
    pourStart, pourStop: () => { if (pourStopFn) pourStopFn(); },
    meowOk: () => playGroup('meowOk', 'meowOk', 0.12),
    meowBad: () => { if (Settings.data.stress) return playGroup('meowBad', 'meowBad', 0); playGroup('none', 'oops'); return 0; },
    crack: () => playGroup('crack', 'crack', 0.1),
    plop: () => playGroup('plop', 'plop', 0.1),
    chop: () => playGroup('chop', 'chop', 0.1),
    swoosh: () => playGroup('swoosh', 'swoosh', 0.1),
    ding: () => playGroup('ding', 'ding'),
    tada: () => playGroup('tada', 'tada'),
    pop: () => playGroup('none', 'pop'),
    sparkle: () => playGroup('none', 'sparkle'),
    sizzleStart, sizzleStop: () => { if (sizzleStop) sizzleStop(); }
  };
})();


/* ---------------- Microfono: detectar si la niña SOPLA ----------------
   Solo mide el volumen y la forma del sonido en el momento; NO graba ni guarda nada.
   Un soplido = ruido continuo, grave y sin tono (como viento). Hablar, gritar o aplaudir no cuenta. */
const Mic = (() => {
  let stream = null, an = null, src = null, td = null, fd = null, gen = 0;
  const supported = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  async function open() {
    if (!Settings.data.mic) return { ok: false, reason: 'off' };
    if (an && stream && stream.active) return { ok: true };
    if (!supported()) return { ok: false, reason: 'unsupported' };
    Sound.resume();
    const ctx = Sound.context();
    if (!ctx) return { ok: false, reason: 'error' };
    const my = ++gen;
    let st;
    try {
      st = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    } catch (e) {
      return { ok: false, reason: (e && (e.name === 'NotAllowedError' || e.name === 'SecurityError')) ? 'denied' : 'error' };
    }
    if (my !== gen) { st.getTracks().forEach((t) => t.stop()); return { ok: false, reason: 'closed' }; }
    stream = st;
    try { if (ctx.state === 'suspended') await ctx.resume(); } catch (e) { /* nada */ }
    src = ctx.createMediaStreamSource(stream);
    an = ctx.createAnalyser();
    an.fftSize = 2048; an.smoothingTimeConstant = 0.5;
    src.connect(an);                               // NO se conecta a los parlantes (no hay eco ni se oye)
    td = new Float32Array(an.fftSize);
    fd = new Float32Array(an.frequencyBinCount);
    return { ok: true };
  }
  function close() {
    gen++;
    try { if (src) src.disconnect(); } catch (e) { /* nada */ }
    try { if (stream) stream.getTracks().forEach((t) => t.stop()); } catch (e) { /* nada */ }
    stream = an = src = td = fd = null;
  }

  // Detector: llamar update(dt) en cada cuadro. Devuelve {blowing, level 0..1, rms, low, flat}
  function detector() {
    let floor = null, hold = 0, frames = 0;
    return {
      update(dt) {
        if (!an) return { blowing: false, level: 0, rms: 0, low: 0, flat: 0 };
        an.getFloatTimeDomainData(td);
        let sum = 0;
        for (let i = 0; i < td.length; i++) sum += td[i] * td[i];
        const rms = Math.sqrt(sum / td.length);
        an.getFloatFrequencyData(fd);
        const sr = Sound.context().sampleRate, bw = sr / an.fftSize;
        const bin = (hz) => Math.max(1, Math.min(fd.length - 1, Math.round(hz / bw)));
        let pLow = 0, pAll = 0, lg = 0, la = 0, n = 0;
        const b40 = bin(40), b500 = bin(500), b6k = bin(6000);
        for (let i = b40; i <= b6k; i++) {
          const p = Math.pow(10, fd[i] / 10);
          pAll += p;
          if (i <= b500) { pLow += p; lg += Math.log(p + 1e-20); la += p; n++; }
        }
        const low = pAll > 0 ? pLow / pAll : 0;                       // cuanto del sonido es grave
        const flat = la > 0 ? Math.exp(lg / n) / (la / n) : 0;        // 1 = ruido parejo, ~0 = una nota (voz)
        // ruido de fondo: baja rapido, sube muy despacio
        frames++;
        if (floor === null) floor = rms;
        else if (rms < floor) floor = floor * 0.8 + rms * 0.2;
        const gain = Math.max(0.5, Math.min(8, Settings.data.micGain || 2.5));
        const thr = Math.max(0.0035 / gain, floor * (1 + 2.6 / gain));        // mas "gain" = detecta soplidos mas suaves
        if (rms >= floor) floor += (rms - floor) * (rms < thr ? 0.004 : 0.0004);   // un soplido largo casi no sube el ruido de fondo
        const cand = frames > 15 && rms > thr && low > 0.4 && flat > 0.2;
        hold = cand ? hold + dt : Math.max(0, hold - dt * 2);
        return { blowing: hold > 70, level: Math.min(1, rms / (thr * 3)), rms, low, flat, thr };
      }
    };
  }
  return { open, close, detector, supported, active: () => !!an };
})();

/* ---------------- Voz que explica los pasos ---------------- */
const Voice = {
  v: null,
  init() {
    if (!('speechSynthesis' in window)) return;
    const choose = () => {
      const vs = speechSynthesis.getVoices() || [];
      this.v = vs.find((x) => /^es[-_]/i.test(x.lang) && /female|mujer|monica|paulina|helena|laura|sabina|google/i.test(x.name)) ||
               vs.find((x) => /^es/i.test(x.lang)) || null;
    };
    choose();
    speechSynthesis.onvoiceschanged = choose;
  },
  say(text) {
    if (!text || !Settings.data.voice || Settings.data.muted || !('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = this.v ? this.v.lang : 'es-ES';
      if (this.v) u.voice = this.v;
      u.rate = 0.9; u.pitch = 1.25; u.volume = Settings.data.volume;
      speechSynthesis.speak(u);
    } catch (e) { /* sin voz */ }
  },
  stop() { try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) { /* nada */ } }
};

/* ---------------- Formas de galletas ---------------- */
const SHAPES = {
  star: '<path class="shape" stroke-linejoin="round" d="M12 1.5 L14.9 8.4 L22.3 9.1 L16.7 14 L18.4 21.3 L12 17.4 L5.6 21.3 L7.3 14 L1.7 9.1 L9.1 8.4 Z"/>',
  heart: '<path class="shape" d="M12 21.6 C3 14.6 1 9.6 1 6.8 C1 3.8 3.4 2 6 2 C8.6 2 10.8 3.4 12 5.6 C13.2 3.4 15.4 2 18 2 C20.6 2 23 3.8 23 6.8 C23 9.6 21 14.6 12 21.6 Z"/>',
  circle: '<circle class="shape" cx="12" cy="12" r="10.5"/>',
  square: '<rect class="shape" x="2.5" y="2.5" width="19" height="19" rx="5"/>'
};
const KINDS = ['star', 'heart', 'circle', 'square'];
// Zona segura donde caen las chispas de cada forma: [centroX, centroY, radio]
const SAFE = { star: [12, 12.5, 4.6], heart: [12, 10.5, 5.4], circle: [12, 12, 8], square: [12, 12, 7.5] };
const shapeSVG = (kind) => `<svg viewBox="0 0 24 24" data-kind="${kind}">${SHAPES[kind]}</svg>`;

const TOPPINGS = {
  pink: ['#ff4f8b', '#ff9ec0', '#ff6fa5'],
  blue: ['#2f8cff', '#8cc6ff', '#4fa8ff'],
  yellow: ['#ffd21f', '#fff08a', '#ffb800'],
  rainbow: ['#ff4f8b', '#ffd21f', '#5cc46a', '#4fa8ff', '#b57bff', '#ff9a3c']
};
function addSprinkles(svg, kind, colors, n = 14) {
  const [cx, cy, R] = SAFE[kind];
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * R;
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    const s = document.createElementNS(SVGNS, 'rect');
    s.setAttribute('x', x - 1.1); s.setAttribute('y', y - 0.4); s.setAttribute('width', 2.2); s.setAttribute('height', 0.9); s.setAttribute('rx', 0.45);
    s.setAttribute('fill', pick(colors));
    s.setAttribute('transform', `rotate(${Math.floor(Math.random() * 180)} ${x} ${y})`);
    svg.appendChild(s);
  }
}

/* ---------------- Utilidad: ingrediente que vuela al tazón ---------------- */
function fly(elm, target, after) {
  const r = elm.getBoundingClientRect(), t = target.getBoundingClientRect();
  const clone = elm.cloneNode(true);
  clone.classList.add('flying');
  Object.assign(clone.style, {
    position: 'fixed', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px',
    margin: '0', zIndex: 60, transition: 'transform .55s cubic-bezier(.3,-0.35,.6,1), opacity .55s'
  });
  document.body.appendChild(clone);
  elm.style.visibility = 'hidden';
  const dx = t.left + t.width / 2 - (r.left + r.width / 2);
  const dy = t.top + t.height * 0.3 - (r.top + r.height / 2);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    clone.style.transform = `translate(${dx}px, ${dy}px) scale(.45) rotate(25deg)`;
    clone.style.opacity = '0.25';
  }));
  setTimeout(() => { clone.remove(); if (after) after(); }, 580);
}

/* =========================================================
   CONTROL DEL JUEGO
   ========================================================= */
const screens = { home: $('#home'), game: $('#game'), win: $('#win') };
const stage = $('#stage');
const bubble = $('#bubble');
const guide = $('#catGuide');
const PRAISE = ['¡Muy bien! 🌟', '¡Genial! 🎉', '¡Qué rico! 😋', '¡Miau, perfecto! 😺', '¡Bravo! 👏'];

function show(name) {
  Object.entries(screens).forEach(([k, s]) => s.classList.toggle('active', k === name));
}
function showBubble(text, kind) {
  bubble.className = 'bubble' + (kind ? ' ' + kind : '');
  bubble.textContent = text;
}

const Game = {
  idx: 0, token: 0, finished: false, lastBad: 0, cleanups: [], currentText: '', recipe: 'cookies',

  steps() { return RECIPES[this.recipe].steps.filter((s) => (s.minLevel || 1) <= LV()); },

  start(recipe) {
    this.token++; this.idx = 0;
    this.recipe = recipe || this.recipe;
    show('game'); buildDots();
    this.runStep();
  },
  stop() {
    this.token++; this.runCleanups(); Voice.stop(); Sound.sizzleStop(); Sound.pourStop();
  },
  runCleanups() {
    this.cleanups.forEach((f) => { try { f(); } catch (e) { /* nada */ } });
    this.cleanups = [];
  },
  onCleanup(f) { this.cleanups.push(f); },
  later(fn, ms) {
    const tk = this.token;
    return setTimeout(() => { if (tk === this.token) fn(); }, ms);
  },

  runStep() {
    this.runCleanups();
    this.finished = false;
    const step = this.steps()[this.idx];
    stage.innerHTML = '';
    updateDots();
    this.currentText = step.text;
    showBubble(step.text, '');
    setCat(guide, null);
    Voice.say(step.voice);
    step.init(stage, this);
  },

  // Algo salio mal: maullido estresado (sin castigo, siempre puede reintentar)
  bad(msg) {
    const now = Date.now();
    if (this.finished || now - this.lastBad < 2000 || now < (this.badUntil || 0)) return;
    this.lastBad = now;
    const ms = Sound.meowBad();                 // >0 solo si sono el audio real del gato estresado
    const dur = 2000;                           // maullido y reaccion del gato: 2 s
    this.badUntil = now + dur;                  // mientras maulla no se apila otro maullido
    setCat(guide, 'stress', dur);
    animCat(guide, 'shake');
    showBubble(msg || '¡Ay, casi! 😿', 'bad');
    if (!ms) Voice.say(msg);                    // con el audio real la voz no lo tapa
    this.later(() => { if (!this.finished) showBubble(this.currentText, ''); }, dur);
  },

  // Paso terminado
  done() {
    if (this.finished) return;
    this.finished = true;
    Sound.sizzleStop();
    Sound.tada();
    setCat(guide, 'happy', 1500);
    animCat(guide, 'jump');
    const p = pick(PRAISE);
    showBubble(p, 'good');
    Voice.say(p.replace(/[^\p{L}\s¡!¿?,]/gu, ''));
    this.later(() => {
      this.idx++;
      if (this.idx >= this.steps().length) this.win(); else this.runStep();
    }, 1700);
  },

  win() {
    this.runCleanups();
    show('win');
    mountCat($('#winCat'));
    setCat($('#winCat'), 'happy');
    animCat($('#winCat'), 'jump');
    const rec = RECIPES[this.recipe];
    $('.win-title').textContent = rec.winTitle;
    const wc = $('#winCookies'); wc.innerHTML = '';
    rec.result(wc);
    const conf = $('#confetti'); conf.innerHTML = '';
    for (let i = 0; i < 32; i++) {
      const s = el('span', '', pick(['⭐', '🎉', rec.emoji, '✨', '💖']));
      s.style.left = Math.random() * 100 + '%';
      s.style.animationDuration = 2.5 + Math.random() * 2.5 + 's';
      s.style.animationDelay = Math.random() * 1.5 + 's';
      conf.appendChild(s);
    }
    Sound.tada();
    this.later(() => Sound.meowOk(), 450);
    Voice.say(rec.winVoice);
    Progress.data[this.recipe] = (Progress.data[this.recipe] || 0) + 1;
    Progress.save(); renderRecipeCards();
  }
};

function buildDots() {
  const d = $('#dots'); d.innerHTML = '';
  Game.steps().forEach(() => d.appendChild(el('span', 'dot')));
}
function updateDots() {
  [...$('#dots').children].forEach((dot, i) => {
    dot.className = 'dot' + (i < Game.idx ? ' done' : i === Game.idx ? ' now' : '');
  });
}

/* =========================================================
   INICIO, AJUSTES Y ARRANQUE
   ========================================================= */
// Tarjetas de recetas del inicio (una por receta, con sus estrellas)
function renderRecipeCards() {
  const box = $('#recipes'); box.innerHTML = '';
  Object.entries(RECIPES).forEach(([key, rec]) => {
    const n = Progress.data[key] || 0;
    const b = el('button', 'recipe-card', `<span class="recipe-emoji">${rec.emoji}</span><span class="recipe-stars">${'⭐'.repeat(Math.min(5, n))}</span>`);
    b.setAttribute('aria-label', rec.name);
    b.addEventListener('click', () => { Sound.pop(); Game.start(key); });
    box.appendChild(b);
  });
}

function setupSettings() {
  const box = $('#settings'), vol = $('#setVolume'), voice = $('#setVoice'), stress = $('#setStress');
  vol.value = Settings.data.volume; voice.checked = Settings.data.voice; stress.checked = Settings.data.stress;
  vol.addEventListener('input', () => { Settings.data.volume = +vol.value; Sound.applyVolume(); Settings.save(); });
  voice.addEventListener('change', () => { Settings.data.voice = voice.checked; if (!voice.checked) Voice.stop(); Settings.save(); });
  stress.addEventListener('change', () => { Settings.data.stress = stress.checked; Settings.save(); });
  const bv = $('#setBadVol'), lvl = $('#setLevel');
  bv.value = Settings.data.badVol; lvl.value = Settings.data.level;
  bv.addEventListener('input', () => { Settings.data.badVol = +bv.value; Settings.save(); });
  bv.addEventListener('change', () => { Sound.resume(); setTimeout(() => Sound.testBad(), 60); });
  lvl.addEventListener('change', () => { Settings.data.level = +lvl.value; Settings.save(); });
  const micChk = $('#setMic'), sens = $('#setSens');
  micChk.checked = Settings.data.mic; sens.value = Settings.data.micGain;
  micChk.addEventListener('change', () => { Settings.data.mic = micChk.checked; Settings.save(); });
  sens.addEventListener('input', () => { Settings.data.micGain = +sens.value; Settings.save(); });
  // Probar el microfono: barra en vivo + aviso de "soplido detectado"
  const meter = $('#micMeter'), fill = $('#micFill'), mstate = $('#micState'), btnMic = $('#btnTestMic');
  let testing = false, testRaf = 0;
  const stopTest = () => { testing = false; cancelAnimationFrame(testRaf); Mic.close(); meter.hidden = true; mstate.hidden = true; btnMic.textContent = '🎤 Probar micrófono (sopla hacia el celular)'; };
  btnMic.addEventListener('click', async () => {
    if (testing) { stopTest(); return; }
    const was = Settings.data.mic; Settings.data.mic = true;
    mstate.hidden = false; mstate.textContent = 'Activando micrófono… acepta el permiso si te lo pide.';
    const r = await Mic.open();
    Settings.data.mic = was;
    if (!r.ok) {
      mstate.textContent = r.reason === 'denied' ? 'Permiso de micrófono NEGADO. En Chrome: candado de la dirección → Permisos → Micrófono → Permitir. Mientras tanto el juego usa un botón 💨.'
        : r.reason === 'unsupported' ? 'Este navegador no permite micrófono (hace falta HTTPS).' : 'No se pudo abrir el micrófono.';
      return;
    }
    testing = true; meter.hidden = false; btnMic.textContent = '⏹ Parar prueba';
    const det = Mic.detector(); let last = performance.now();
    const loop = (now) => {
      if (!testing) return;
      const o = det.update(now - last); last = now;
      fill.style.width = Math.round(o.level * 100) + '%';
      fill.classList.toggle('on', o.blowing);
      mstate.textContent = o.blowing ? '💨 ¡Soplido detectado!' : (o.level > 0.5 ? '🗣️ Hay ruido, pero no parece un soplido' : '🎤 Escuchando… sopla hacia el micrófono del celular');
      testRaf = requestAnimationFrame(loop);
    };
    testRaf = requestAnimationFrame(loop);
  });
  $('#btnCloseSettings').addEventListener('click', () => { stopTest(); box.hidden = true; });
  const diagEl = $('#diag');
  const paintDiag = () => {
    const r = Sound.report();
    diagEl.textContent = 'Versión ' + APP_VERSION + ' · Maullido de error: ' +
      (r.badLoaded ? 'cargado ✓ (' + r.badSeconds + ' s)' : (r.audio ? 'NO cargado ✗ (suena el de reemplazo)' : 'se carga con el primer toque')) +
      (r.errors.length ? ' · ' + r.errors.join('; ') : '');
  };
  $('#btnTestMeow').addEventListener('click', () => { Sound.resume(); setTimeout(() => { Sound.testBad(); paintDiag(); }, 60); });
  paintDiag();
  // Para que no lo abra la peque: hay que mantener presionado el engranaje
  const gear = $('#btnGear'); let timer = null;
  gear.addEventListener('pointerdown', () => { timer = setTimeout(() => { paintDiag(); box.hidden = false; }, 1200); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => gear.addEventListener(ev, () => clearTimeout(timer)));
}

function boot() {
  Settings.load(); Progress.load(); Voice.init();
  mountCat($('#homeCat')); setCat($('#homeCat'), null);
  mountCat(guide);
  renderRecipeCards(); setupSettings();
  const soundBtn = $('#btnSound');
  const paintSound = () => { soundBtn.textContent = Settings.data.muted ? '🔇' : '🔊'; };
  paintSound();

  // El primer toque activa el audio (regla de Android/Chrome)
  document.addEventListener('pointerdown', () => Sound.resume(), { passive: true });
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  const meowCat = (root) => () => { Sound.meowOk(); setCat(root, 'happy', 900); animCat(root, 'jump'); };
  $('#homeCat').addEventListener('click', meowCat($('#homeCat')));
  guide.addEventListener('click', meowCat(guide));

  $('#btnHome').addEventListener('click', () => { Game.stop(); show('home'); });
  $('#btnWinHome').addEventListener('click', () => { Game.stop(); show('home'); });
  $('#btnAgain').addEventListener('click', () => { Game.start(); });
  soundBtn.addEventListener('click', () => { Settings.data.muted = !Settings.data.muted; Sound.applyVolume(); if (Settings.data.muted) Voice.stop(); Settings.save(); paintSound(); });

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* sin cache offline */ });
  }
}
// boot() se llama desde index.html, despues de cargar recipes.js
