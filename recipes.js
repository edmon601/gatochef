'use strict';
/* Recetas del juego y sus minijuegos. Se carga despues de game.js. */

/* =========================================================
   LOS MINIJUEGOS DE LAS GALLETAS
   ========================================================= */
const COOKIE_STEPS = [

  /* 1. Ingredientes (con cantidades en nivel 2 y 3): el calcetin es una trampa graciosa */
  makeIngredients({
    text: '🌾 🧂 🧈 🍫  ¡Al tazón!',
    voice: 'Toca la harina, el azúcar, la mantequilla y las chispas de chocolate para echarlos al tazón. ¡El calcetín no!',
    container: 'bowl', fillColor: '#f1d9a0',
    items: [
      { k: 'a', e: '🌾', l: 'harina', ok: true, bg: '#fff7de' },
      { k: 'b', e: '🧦', l: 'calcetín', ok: false, bg: '#e5eaff', msg: '¡Eso no es para galletas! 🧦' },
      { k: 'c', e: '🧂', l: 'azúcar', ok: true, bg: '#ffe3ee' },
      { k: 'd', e: '🧈', l: 'mantequilla', ok: true, bg: '#fff2b8' },
      { k: 'e', e: '🍫', l: 'chispas', ok: true, bg: '#f1e3dc' }
    ]
  }),

  /* 2. Huevos: tocar una vez para cascar, otra para echarlo */
  {
    text: '🥚 🥚  ¡Toca para romper!',
    voice: 'Toca cada huevo dos veces para romperlo.',
    init(st, G) {
      st.innerHTML = '<div class="eggs"></div><div class="bowl"><div class="bowl-fill lvl3"></div></div>';
      const eggs = $('.eggs', st), bowl = $('.bowl', st);
      let broken = 0;
      for (let i = 0; i < 2; i++) {
        const b = el('button', 'egg', '🥚<svg viewBox="0 0 66 66"><path d="M6 34 L19 25 L28 39 L38 23 L48 37 L60 27" stroke="#6b3a1e" stroke-width="3.5" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg>');
        let taps = 0;
        b.addEventListener('click', () => {
          if (b.disabled) return;
          taps++;
          b.classList.remove('wobble'); void b.offsetWidth; b.classList.add('wobble');
          if (taps === 1) {
            Sound.crack(); b.classList.add('cracked');
          } else {
            b.disabled = true; Sound.crack();
            b.classList.remove('cracked'); b.textContent = '🍳';
            fly(b, bowl, () => { Sound.plop(); broken++; if (broken === 2) G.done(); });
          }
        });
        eggs.appendChild(b);
      }
    }
  },

  /* 3. Mezclar: girar el dedo dentro del tazon, sin salirse */
  {
    text: '🥄 ¡Gira dentro del tazón!',
    voice: 'Gira tu dedo dentro del tazón para mezclar.',
    init(st, G) {
      st.innerHTML = '<div class="mixzone"><div class="bigbowl"><div class="dough"></div></div><div class="hint-circle"></div><div class="spoon">🥄</div></div><div class="meter"><div></div></div>';
      const zone = $('.mixzone', st), dough = $('.dough', st), spoon = $('.spoon', st), bar = $('.meter > div', st), hint = $('.hint-circle', st);
      const LAPS = byLv(3, 4, 6), NEED = Math.PI * 2 * LAPS;
      let prog = 0, down = false, last = 0, outside = false, lastSwoosh = 0;
      const geo = () => { const r = zone.getBoundingClientRect(); return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, R: r.width / 2, r }; };

      zone.addEventListener('pointerdown', (e) => {
        const g = geo(); const dx = e.clientX - g.cx, dy = e.clientY - g.cy;
        if (Math.hypot(dx, dy) > g.R) return;
        down = true; outside = false; last = Math.atan2(dy, dx);
        try { zone.setPointerCapture(e.pointerId); } catch (err) { /* nada */ }
        hint.style.display = 'none';
      });
      zone.addEventListener('pointermove', (e) => {
        if (!down || G.finished) return;
        const g = geo(); const dx = e.clientX - g.cx, dy = e.clientY - g.cy, dist = Math.hypot(dx, dy);
        spoon.style.left = (e.clientX - g.r.left) + 'px'; spoon.style.top = (e.clientY - g.r.top) + 'px';
        if (dist > g.R * 0.98) {
          if (!outside) { outside = true; G.bad('¡Uy, se sale la masa! 💦'); }
          return;
        }
        outside = false;
        if (dist < g.R * 0.1) return;
        const a = Math.atan2(dy, dx);
        let d = a - last;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        last = a;
        if (Math.abs(d) > 1.6) return;
        prog += Math.abs(d);
        dough.style.transform = `rotate(${prog * 57.3}deg)`;
        bar.style.width = Math.min(100, prog / NEED * 100) + '%';
        if (prog - lastSwoosh > Math.PI) { lastSwoosh = prog; Sound.swoosh(); }
        if (prog >= NEED) { down = false; G.done(); }
      });
      const up = () => { down = false; };
      zone.addEventListener('pointerup', up);
      zone.addEventListener('pointercancel', up);
    }
  },

  /* 4. Cortar formas: tocar cada forma; tocar la masa vacia suena mal */
  {
    text: '⭐ ❤️ ¡Toca las formas!',
    voice: 'Toca las formas para cortar las galletas.',
    init(st, G) {
      st.innerHTML = '<div class="roll"></div>';
      const roll = $('.roll', st);
      let cut = 0;
      KINDS.slice().sort(() => Math.random() - 0.5).forEach((k) => {
        const b = el('button', 'cutter', shapeSVG(k));
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          if (b.classList.contains('cut')) return;
          b.classList.add('cut'); Sound.chop(); cut++;
          if (cut === KINDS.length) G.done();
        });
        roll.appendChild(b);
      });
      roll.addEventListener('click', () => G.bad('¡Toca las formas, no la masa! 🍪'));
    }
  },

  /* 5. Hornear: esperar el timbre y tocar en el momento justo */
  {
    text: '🔔 ¡Toca cuando suene!',
    voice: 'Espera a que suene el timbre y saca las galletas.',
    init(st, G) {
      const ZS = byLv(0.55, 0.6, 0.66), ZE = byLv(1.0, 0.88, 0.8), DUR = byLv(7000, 6000, 5200);
      st.innerHTML = `<div class="oven baking"><div class="oven-window"><div class="tray">${KINDS.map(shapeSVG).join('')}</div></div><div class="smoke">💨💨</div></div>
        <div class="timer"><div class="zone"></div><div class="bar"></div></div>
        <button class="bigbtn" id="take">🧤</button>`;
      const win = $('.oven-window', st), timer = $('.timer', st), bar = $('.bar', st), zone = $('.zone', st), smoke = $('.smoke', st), btn = $('#take', st);
      zone.style.left = ZS * 100 + '%'; zone.style.width = (ZE - ZS) * 100 + '%';
      let t0 = performance.now(), dinged = false, alive = true, raf = 0;
      Sound.sizzleStart();
      G.onCleanup(() => { alive = false; cancelAnimationFrame(raf); Sound.sizzleStop(); });
      const restart = () => { t0 = performance.now(); dinged = false; timer.classList.remove('ready'); win.classList.remove('hot'); Sound.sizzleStart(); };
      const loop = (now) => {
        if (!alive || G.finished) return;
        const p = (now - t0) / DUR;
        bar.style.width = Math.min(1, p) * 100 + '%';
        if (p >= ZS && !dinged) { dinged = true; Sound.ding(); timer.classList.add('ready'); win.classList.add('hot'); }
        if (p > ZE + 0.12) {                       // se paso: salen humitos, y a empezar otra vez
          smoke.classList.remove('show'); void smoke.offsetWidth; smoke.classList.add('show');
          G.bad('¡Uy, se quemaron un poquito! 💨');
          Sound.sizzleStop(); G.later(restart, 1200); t0 = now + 1e9;
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      btn.addEventListener('click', () => {
        if (G.finished) return;
        const p = (performance.now() - t0) / DUR;
        if (p < 0) return;
        if (p < ZS) G.bad('¡Todavía no, espera el timbre! 🔔');
        else if (p <= ZE + 0.12) { Sound.pop(); G.done(); }
      });
    }
  },

  /* 6. Decorar: elegir color y tocar las galletas */
  {
    text: '🌈 ¡Decora tus galletas!',
    voice: 'Elige un color y toca las galletas para decorarlas.',
    init(st, G) {
      st.innerHTML = '<div class="tray-big"></div><div class="palette"></div>';
      const tray = $('.tray-big', st), pal = $('.palette', st);
      let sel = 'pink', done = 0;
      Object.keys(TOPPINGS).forEach((name) => {
        const b = el('button', 'topping ' + name + (name === sel ? ' sel' : ''));
        if (name !== 'rainbow') b.style.background = TOPPINGS[name][0];
        b.setAttribute('aria-label', name);
        b.addEventListener('click', (e) => {
          e.stopPropagation(); sel = name; Sound.pop();
          [...pal.children].forEach((c) => c.classList.toggle('sel', c === b));
        });
        pal.appendChild(b);
      });
      KINDS.slice().sort(() => Math.random() - 0.5).forEach((k) => {
        const b = el('button', 'cookie', shapeSVG(k));
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          addSprinkles($('svg', b), k, TOPPINGS[sel]);
          Sound.sparkle();
          if (!b.classList.contains('decorated')) { done++; }
          b.classList.remove('decorated'); void b.offsetWidth; b.classList.add('decorated');
          b.dataset.dec = '1';
          if (done === KINDS.length) G.done();
        });
        tray.appendChild(b);
      });
      tray.addEventListener('click', () => G.bad('¡Toca las galletas! 🍪'));
    }
  }
];


/* =========================================================
   HERRAMIENTAS COMPARTIDAS PARA LOS MINIJUEGOS NUEVOS
   ========================================================= */

// ¿El trazo de a a b pasa por dentro del rectangulo r?
function segHitsRect(a, b, r, pad = 0) {
  const n = Math.max(2, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 6));
  for (let i = 0; i <= n; i++) {
    const x = a.x + (b.x - a.x) * i / n, y = a.y + (b.y - a.y) * i / n;
    if (x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad) return true;
  }
  return false;
}
function shakeEl(e) { e.classList.remove('wrong'); void e.offsetWidth; e.classList.add('wrong'); }

/* Ingredientes: tocar los correctos para echarlos al tazon o a la olla */
function makeIngredients(o) {
  return {
    text: o.text, voice: o.voice,
    init(st, G) {
      const pot = o.container === 'pot';
      let items = o.items.slice();
      if (LV() >= 3) {                                          // nivel Maestro: dos trampas mas
        const pool = shuffle(['🧦', '👟', '🧸', '🪥', '🎈', '🧼'].filter((e) => !items.some((i) => i.e === e)));
        items = shuffle(items.concat(pool.slice(0, 2).map((e) => ({ k: 'x' + e, e, ok: false, bg: '#eceaf6', msg: '¡Eso no va ahí! 🙀' }))));
      }
      st.innerHTML = `<div class="shelf${items.length > 4 ? ' six' : ''}"></div>` + (pot
        ? '<div class="pot"><div class="pot-rim"></div><div class="pot-fill"></div></div>'
        : '<div class="bowl"><div class="bowl-fill"></div></div>');
      const shelf = $('.shelf', st), target = $(pot ? '.pot' : '.bowl', st), fill = $(pot ? '.pot-fill' : '.bowl-fill', st);
      if (o.fillColor) fill.style.background = o.fillColor;
      // cantidades: en nivel 2 y 3 cada ingrediente trae un numero (¡hay que contar!)
      const QTY = [[1, 1, 1, 1], [2, 1, 2, 1], [3, 2, 3, 2]][LV() - 1];
      let gi = 0;
      items.forEach((it) => { if (it.ok) { it.need = QTY[gi % 4]; it.got = 0; gi++; } });
      const totalNeed = items.filter((i) => i.ok).reduce((s, i) => s + i.need, 0);
      let total = 0, finishing = false;
      if (LV() >= 2) showBubble(o.text + '  🔢', '');
      items.forEach((it) => {
        const b = el('button', 'item' + (it.l ? ' hasl' : ''), `<span class="ico">${it.e}</span>` + (it.l ? `<span class="lbl">${it.l}</span>` : ''));
        if (it.bg) b.style.background = it.bg;
        b.dataset.ok = it.ok ? '1' : '0';
        let badge = null;
        if (it.ok && LV() >= 2) { b.dataset.need = it.need; badge = el('span', 'qbadge', '0/' + it.need); b.appendChild(badge); }
        b.addEventListener('click', () => {
          if (b.disabled || finishing) return;
          if (!it.ok) { shakeEl(b); G.bad(it.msg || '¡Eso no va ahí!'); return; }
          if (it.got >= it.need) { shakeEl(b); G.bad('¡Ya pusiste suficiente! ✋'); return; }
          it.got++; total++; Sound.pop();
          if (badge) { badge.textContent = it.got + '/' + it.need; if (it.got >= it.need) { badge.classList.add('full'); b.classList.add('full'); } }
          const last = total >= totalNeed;
          if (last) finishing = true;
          fly(b, target, () => {
            Sound.plop();
            fill.style.transform = `scaleY(${0.35 + 0.65 * Math.min(1, (total - (last ? 0 : 0)) / totalNeed)})`;
            if (last) G.done();
          });
          if (it.got < it.need || LV() >= 2) b.style.visibility = '';   // se puede volver a tocar hasta completar la cantidad
          if (LV() < 2) b.disabled = true;
        });
        shelf.appendChild(b);
      });
    }
  };
}
function makeMix(o) {
  return {
    text: o.text, voice: o.voice,
    init(st, G) {
      st.innerHTML = `<div class="mixzone"><div class="bigbowl ${o.bowlClass || ''}">${o.inner}</div><div class="hint-circle"></div><div class="spoon">${o.spoon || '🥄'}</div></div><div class="meter"><div></div></div>`;
      const zone = $('.mixzone', st), spin = $(o.spinSel || '.dough', st), spoon = $('.spoon', st), bar = $('.meter > div', st), hint = $('.hint-circle', st);
      const NEED = Math.PI * 2 * Math.round((o.laps || 3) * byLv(1, 1.5, 2));
      const EDGE = byLv(0.98, 0.93, 0.88);
      let prog = 0, down = false, last = 0, outside = false, lastSwoosh = 0;
      const geo = () => { const r = zone.getBoundingClientRect(); return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, R: r.width / 2, r }; };
      zone.addEventListener('pointerdown', (e) => {
        const g = geo(); const dx = e.clientX - g.cx, dy = e.clientY - g.cy;
        if (Math.hypot(dx, dy) > g.R) return;
        down = true; outside = false; last = Math.atan2(dy, dx);
        try { zone.setPointerCapture(e.pointerId); } catch (err) { /* nada */ }
        hint.style.display = 'none';
      });
      zone.addEventListener('pointermove', (e) => {
        if (!down || G.finished) return;
        const g = geo(); const dx = e.clientX - g.cx, dy = e.clientY - g.cy, dist = Math.hypot(dx, dy);
        spoon.style.left = (e.clientX - g.r.left) + 'px'; spoon.style.top = (e.clientY - g.r.top) + 'px';
        if (dist > g.R * EDGE) { if (!outside) { outside = true; G.bad(o.spill || '¡Uy, se sale! 💦'); } return; }
        outside = false;
        if (dist < g.R * 0.1) return;
        const a = Math.atan2(dy, dx);
        let d = a - last;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        last = a;
        if (Math.abs(d) > 1.6) return;
        prog += Math.abs(d);
        spin.style.transform = `rotate(${prog * 57.3}deg)`;
        bar.style.width = Math.min(100, prog / NEED * 100) + '%';
        if (prog - lastSwoosh > Math.PI) { lastSwoosh = prog; Sound.swoosh(); }
        if (prog >= NEED) { down = false; G.done(); }
      });
      const up = () => { down = false; };
      zone.addEventListener('pointerup', up);
      zone.addEventListener('pointercancel', up);
    }
  };
}

const WHISK = '<svg viewBox="0 0 64 64" width="1em" height="1em" style="vertical-align:-0.12em"><rect x="29" y="38" width="6" height="24" rx="3" fill="#8a5a3c"/><g fill="none" stroke="#b9bfca" stroke-width="2.4" stroke-linecap="round"><ellipse cx="32" cy="22" rx="18" ry="19"/><ellipse cx="32" cy="22" rx="11" ry="19"/><ellipse cx="32" cy="22" rx="4" ry="19"/><path d="M14 22h36"/></g><rect x="27" y="36" width="10" height="7" rx="3" fill="#6b4328"/></svg>';

/* Contar y calcular: contar objetos, sumar (nivel 2) y restar (nivel 3) */
function makeCount(o) {
  return {
    text: '🔢 ¡Cuenta!',
    voice: 'Vamos a contar.',
    init(st, G) {
      const lv = LV(), what = o.what, e = o.e;
      const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
      let ans, q, parts = [], op = '';
      const Q = o.m ? 'Cuántos' : 'Cuántas', QD = o.m ? 'quedan' : 'quedan';
      if (lv === 1) { ans = rnd(3, 7); parts = [ans]; q = `¿${Q} ${what} hay?`; }
      else if (lv === 2 || Math.random() < 0.5) { const x = lv === 2 ? rnd(1, 5) : rnd(3, 8), y = lv === 2 ? rnd(1, 5) : rnd(3, 8); parts = [x, y]; op = '+'; ans = x + y; q = `¿${Q} ${what} hay en total?`; }
      else { const x = rnd(6, 12), y = rnd(2, 5); parts = [x, y]; op = '-'; ans = x - y; q = `Se comen ${y}. ¿${Q} ${what} ${QD}?`; }
      const msg = '🔢 ' + q;
      showBubble(msg, ''); Game.currentText = msg; Voice.say(q);
      st.innerHTML = `<div class="countbox"></div><div class="shelf cnums"></div>`;
      const box = $('.countbox', st), shelf = $('.cnums', st);
      const group = (n, gone) => { const g = el('div', 'cgroup'); for (let i = 0; i < n; i++) g.appendChild(el('span', 'cthing' + (gone && i >= n - gone ? ' gone' : ''), e)); return g; };
      if (op === '-') { box.appendChild(group(parts[0], parts[1])); box.appendChild(el('div', 'cop', `🍴 −${parts[1]}`)); }
      else { box.appendChild(group(parts[0])); if (parts[1]) { box.appendChild(el('div', 'cop', '➕')); box.appendChild(group(parts[1])); } }
      const opts = new Set([ans]);
      while (opts.size < 4) { const x = ans + rnd(-3, 3); if (x >= 0 && x !== ans) opts.add(x); }
      shuffle([...opts]).forEach((n) => {
        const b = el('button', 'item cnum', String(n)); b.dataset.ok = n === ans ? '1' : '0'; b.dataset.n = n;
        b.addEventListener('click', () => {
          if (G.finished) return;
          if (n !== ans) { shakeEl(b); G.bad('¡Cuenta otra vez! 🔢'); return; }
          Sound.pop(); b.classList.add('full'); G.later(() => G.done(), 250);
        });
        shelf.appendChild(b);
      });
    }
  };
}

/* Machacar (guacamole): tocar muchas veces; el aguacate se va aplastando */
function makeMash(o) {
  return {
    text: o.text, voice: o.voice,
    init(st, G) {
      const NEED = byLv(8, 12, 16);
      st.innerHTML = `<button class="dough-ball mashball">${o.e}</button><div class="meter"><div></div></div>`;
      const ball = $('.mashball', st), bar = $('.meter > div', st);
      let n = 0;
      ball.addEventListener('pointerdown', (e) => {
        if (G.finished) return;
        n++; Sound.plop();
        ball.style.transform = `scale(${1 + n / NEED * 0.25}, ${1 - n / NEED * 0.45})`;
        bar.style.width = Math.min(100, n / NEED * 100) + '%';
        if (n >= NEED) { ball.textContent = o.done || '🥣'; ball.style.transform = ''; G.later(() => G.done(), 350); }
      });
    }
  };
}

/* Rellenar: tocar cada pimiento la cantidad de veces que dice (ni mas ni menos) */
function makeStuff(o) {
  return {
    text: o.text, voice: o.voice,
    init(st, G) {
      const NEED = byLv(2, 3, 4);
      st.innerHTML = '<div class="stuffrow"></div>';
      const row = $('.stuffrow', st); let full = 0;
      const items = o.items || ['🫑', '🫑', '🫑'];
      items.forEach((e) => {
        const b = el('button', 'stuffitem', `<span class="ico">${e}</span><span class="fillbar"><i></i></span><span class="qbadge">0/${NEED}</span>`);
        let n = 0; b.dataset.need = NEED;
        b.addEventListener('click', () => {
          if (G.finished) return;
          if (n >= NEED) { shakeEl(b); G.bad('¡Ya está llena! ✋'); return; }
          n++; Sound.plop();
          $('i', b).style.width = n / NEED * 100 + '%'; $('.qbadge', b).textContent = n + '/' + NEED;
          if (n >= NEED) { b.classList.add('full'); full++; if (full >= items.length) G.later(() => G.done(), 350); }
        });
        row.appendChild(b);
      });
    }
  };
}

/* Decorar libremente (crema, chocolate, fresas, lluvia de colores) y conservar el dibujo */
function makeDecorate(o) {
  const cupcake = o.base === 'cupcake', icecream = o.base === 'icecream';
  return {
    text: o.text || '🎨 ¡Decora tu torta!',
    voice: o.voice || 'Elige crema, chocolate, fresas o lluvia de colores y decora tu torta como quieras. Cuando termines toca el visto.',
    init(st, G) {
      const NEED = byLv(2, 3, 4);
      st.innerHTML = `<canvas class="decor" width="300" height="180"></canvas>
        <div class="tools"><button class="tool sel" data-t="cream">🍦</button><button class="tool" data-t="choc">🍫</button><button class="tool" data-t="straw">🍓</button><button class="tool" data-t="rain">🌈</button><button class="tool" data-t="clear">🧽</button></div>
        <div class="decor-foot"><div class="needdots"></div><button class="roundbtn ok" id="decOk" disabled>✅</button></div>`;
      const cv = $('.decor', st), cx = cv.getContext('2d');
      const base = () => {
        cx.clearRect(0, 0, 300, 180);
        if (icecream) {
          cx.fillStyle = '#e0a45f'; cx.beginPath(); cx.moveTo(95, 100); cx.lineTo(205, 100); cx.lineTo(150, 178); cx.closePath(); cx.fill();
          cx.strokeStyle = '#c98a45'; cx.lineWidth = 3; for (let i = -2; i <= 2; i++) { cx.beginPath(); cx.moveTo(150 + i * 22, 100); cx.lineTo(150, 176); cx.stroke(); }
          cx.fillStyle = '#ffd6e7'; cx.beginPath(); cx.arc(150, 70, 58, 0, Math.PI * 2); cx.fill();
          cx.fillStyle = '#fff6e6'; cx.beginPath(); cx.arc(150, 38, 34, 0, Math.PI * 2); cx.fill();
        } else if (cupcake) {
          cx.fillStyle = '#f7b7d2'; cx.beginPath(); cx.moveTo(60, 100); cx.lineTo(240, 100); cx.lineTo(214, 176); cx.lineTo(86, 176); cx.closePath(); cx.fill();
          cx.strokeStyle = '#e48fb4'; cx.lineWidth = 4; for (let x = 82; x < 230; x += 22) { cx.beginPath(); cx.moveTo(x, 104); cx.lineTo(150 + (x - 150) * 0.78, 174); cx.stroke(); }
          cx.fillStyle = '#e9b36b'; cx.beginPath(); cx.ellipse(150, 98, 98, 58, 0, Math.PI, 0); cx.fill();
        } else {
          cx.fillStyle = '#e0a45f'; cx.beginPath(); cx.roundRect(4, 56, 292, 120, 18); cx.fill();
          cx.fillStyle = '#c98a45'; cx.fillRect(4, 128, 292, 6);
          cx.fillStyle = '#8a5a3c'; cx.beginPath(); cx.roundRect(0, 150, 300, 30, [0, 0, 16, 16]); cx.fill();
          cx.fillStyle = '#fff6e6'; cx.beginPath(); cx.roundRect(4, 22, 292, 58, 20); cx.fill();
        }
      };
      base();
      const used = new Set(); const dots = $('.needdots', st), ok = $('#decOk', st);
      const paint = () => {
        dots.innerHTML = ''; for (let i = 0; i < NEED; i++) dots.appendChild(el('span', 'pdot' + (i < used.size ? ' on' : '')));
        ok.disabled = used.size < NEED; ok.classList.toggle('glow', used.size >= NEED);
      };
      paint();
      let tool = 'cream', down = false, lastP = null;
      $$('.tool', st).forEach((b) => b.addEventListener('click', () => {
        if (b.dataset.t === 'clear') { base(); used.clear(); paint(); Sound.swoosh(); return; }
        tool = b.dataset.t; $$('.tool', st).forEach((x) => x.classList.toggle('sel', x === b)); Sound.pop();
      }));
      const pos = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * 300 / r.width, y: (e.clientY - r.top) * 180 / r.height }; };
      const mark = (p) => {
        if (tool === 'cream') {
          cx.strokeStyle = '#ffd3e4'; cx.lineWidth = 20; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo((lastP || p).x, (lastP || p).y); cx.lineTo(p.x, p.y); cx.stroke();
          cx.strokeStyle = '#fff'; cx.lineWidth = 11; cx.beginPath(); cx.moveTo((lastP || p).x, (lastP || p).y); cx.lineTo(p.x, p.y); cx.stroke();
        } else if (tool === 'choc') {
          cx.strokeStyle = '#5b3420'; cx.lineWidth = 9; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo((lastP || p).x, (lastP || p).y); cx.lineTo(p.x, p.y); cx.stroke();
        } else if (tool === 'rain') {
          for (let i = 0; i < 6; i++) {
            const a = Math.random() * Math.PI * 2, d = Math.random() * 34;
            cx.save(); cx.translate(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d); cx.rotate(Math.random() * 3.14);
            cx.fillStyle = pick(['#ff5a8a', '#ffd23f', '#4fc3f7', '#7ed957', '#b46cff', '#ff9a3c']); cx.fillRect(-6, -2, 12, 4); cx.restore();
          }
        }
        lastP = p;
      };
      cv.addEventListener('pointerdown', (e) => {
        if (G.finished) return;
        down = true; lastP = null; try { cv.setPointerCapture(e.pointerId); } catch (err) { /* nada */ }
        const p = pos(e);
        if (tool === 'straw') { cx.font = '40px serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('🍓', p.x, p.y); Sound.plop(); down = false; }
        else mark(p);
        if (!used.has(tool)) { used.add(tool); paint(); }
      });
      cv.addEventListener('pointermove', (e) => { if (down && !G.finished) { mark(pos(e)); if (tool === 'rain' && Math.random() < 0.15) Sound.salt(); } });
      const up = () => { down = false; lastP = null; };
      cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
      ok.addEventListener('click', () => {
        if (G.finished || ok.disabled) return;
        if (!cupcake && !icecream) { try { Game.art = cv.toDataURL('image/png'); } catch (err) { Game.art = null; } }
        Sound.pop(); G.done();
      });
    }
  };
}

/* Presentacion final: elegir mantel y plato, poner pegatinas y mostrar el plato para ella */
function makePresent(o) {
  return {
    text: '🌟 Decora tu plato',
    voice: 'Decora tu plato.',
    init(st, G) {
      const food = Game.art && o.useArt ? `<span class="foodart" style="background-image:url(${Game.art})"></span>` : `<span class="foodemoji">${o.emoji}</span>`;
      st.innerHTML = `<div class="table" style="--cloth:#ffd6e7"><div class="banner">${NAME() ? '¡Para ' + NAME() + '! 💖' : '¡Buen provecho! 💖'}</div>
          <div class="plate p0">${food}</div><div class="stickers"></div></div>
        <div class="swatches"></div>
        <div class="swatches plates"></div>
        <div class="swatches stk"></div>
        <div class="decor-foot"><button class="roundbtn" id="stUndo">↩️</button><button class="roundbtn ok glow" id="presOk">✅</button></div>`;
      const table = $('.table', st), plate = $('.plate', st), layer = $('.stickers', st);
      ['#ffd6e7', '#cfe8ff', '#d8f7d4', '#fff0b8', '#e8d8ff', '#ffd9b3'].forEach((c) => {
        const b = el('button', 'swatch'); b.style.background = c; b.addEventListener('click', () => { table.style.setProperty('--cloth', c); Sound.pop(); }); $('.swatches', st).appendChild(b);
      });
      ['p0', 'p1', 'p2', 'p3'].forEach((cl, i) => {
        const b = el('button', 'swatch plate-sw ' + cl, ''); b.addEventListener('click', () => { plate.className = 'plate ' + cl; Sound.pop(); }); $('.plates', st).appendChild(b);
      });
      let sel = '🌸';
      ['🌸', '⭐', '🎈', '💖', '🦋', '🍀', '🌈', '✨'].forEach((s, i) => {
        const b = el('button', 'sticker-btn' + (i === 0 ? ' sel' : ''), s);
        b.addEventListener('click', () => { sel = s; $$('.sticker-btn', st).forEach((x) => x.classList.toggle('sel', x === b)); Sound.pop(); });
        $('.stk', st).appendChild(b);
      });
      const placed = [];
      table.addEventListener('pointerdown', (e) => {
        if (G.finished || placed.length >= 14) return;
        const r = table.getBoundingClientRect();
        const s = el('span', 'sticker', sel); s.style.left = (e.clientX - r.left) + 'px'; s.style.top = (e.clientY - r.top) + 'px';
        layer.appendChild(s); placed.push(s); Sound.sparkle();
      });
      $('#stUndo', st).addEventListener('click', () => { const s = placed.pop(); if (s) s.remove(); });
      $('#presOk', st).addEventListener('click', () => {
        if (G.finished) return;
        Game.presentHTML = table.outerHTML;
        Sound.pop(); G.done();
      });
    }
  };
}


function makeWash(o) {
  return {
    text: '🧽 ¡Frota para lavar!',
    voice: o.voice || 'Pasa tu dedo por las verduras para quitar la suciedad.',
    init(st, G) {
      const veg = o.veg;
      const spots = [[22, 30], [68, 26], [45, 62], [74, 68], [26, 70]];
      st.innerHTML = '<div class="washzone"><div class="washrow"></div><div class="spoon">🧽</div></div><div class="meter"><div></div></div>';
      const zone = $('.washzone', st), row = $('.washrow', st), sponge = $('.spoon', st), bar = $('.meter > div', st);
      const dirt = [];
      veg.forEach((v, vi) => {
        const t = el('div', 'veg', v);
        for (let i = 0; i < 3; i++) {
          const d = el('span', 'dirt');
          const s = spots[(vi * 2 + i) % spots.length];
          d.style.left = s[0] + '%'; d.style.top = s[1] + '%';
          t.appendChild(d); dirt.push(d);
        }
        row.appendChild(t);
      });
      const TOTAL = dirt.length; let clean = 0, down = false;
      const scrub = (e) => {
        const zr = zone.getBoundingClientRect();
        sponge.style.left = (e.clientX - zr.left) + 'px'; sponge.style.top = (e.clientY - zr.top) + 'px';
        dirt.forEach((d) => {
          if (d.dataset.gone) return;
          const r = d.getBoundingClientRect();
          if (Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < 36) {
            d.dataset.gone = '1'; d.classList.add('gone'); Sound.bloop(); clean++;
            const fx = el('span', 'fx', '💧'); fx.style.left = (r.left - zr.left) + 'px'; fx.style.top = (r.top - zr.top) + 'px'; zone.appendChild(fx);
            setTimeout(() => fx.remove(), 700);
            bar.style.width = clean / TOTAL * 100 + '%';
            if (clean >= TOTAL) { down = false; G.done(); }
          }
        });
      };
      zone.addEventListener('pointerdown', (e) => { down = true; try { zone.setPointerCapture(e.pointerId); } catch (err) { /* nada */ } scrub(e); });
      zone.addEventListener('pointermove', (e) => { if (down && !G.finished) scrub(e); });
      const up = () => { down = false; };
      zone.addEventListener('pointerup', up);
      zone.addEventListener('pointercancel', up);
    }
  };
}

function makeSwipeCut(o) {
  return {
    text: '🔪 ¡Desliza para cortar!',
    voice: o.voice,
    init(st, G) {
      const tiles = o.tiles;
      st.innerHTML = '<div class="cutzone"><div class="cutgrid"></div><div class="spoon">🔪</div></div>';
      const zone = $('.cutzone', st), grid = $('.cutgrid', st), knife = $('.spoon', st);
      const els = tiles.map((t) => { const d = el('div', 'tile', `<span class="whole">${t.e}</span>`); grid.appendChild(d); return d; });
      const NEED = tiles.filter((t) => t.ok).length; let cut = 0, a = null, b = null;
      zone.addEventListener('pointerdown', (e) => { a = { x: e.clientX, y: e.clientY }; b = a; try { zone.setPointerCapture(e.pointerId); } catch (err) { /* nada */ } });
      zone.addEventListener('pointermove', (e) => {
        if (!a) return; b = { x: e.clientX, y: e.clientY };
        const r = zone.getBoundingClientRect(); knife.style.left = (e.clientX - r.left) + 'px'; knife.style.top = (e.clientY - r.top) + 'px';
      });
      const end = () => {
        if (!a || G.finished) { a = null; return; }
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        let hitAny = false, hitTrap = false;
        tiles.forEach((t, i) => {
          if (els[i].dataset.cut) return;
          if (!segHitsRect(a, b, els[i].getBoundingClientRect(), 0)) return;
          hitAny = true;
          if (!t.ok) { hitTrap = true; shakeEl(els[i]); return; }
          els[i].dataset.cut = '1';
          els[i].innerHTML = `<span class="half l">${t.e}</span><span class="half r">${t.e}</span>`;
          els[i].classList.add('cut'); Sound.chop(); cut++;
        });
        if (hitTrap) G.bad(o.trapMsg || '¡No cortes eso! 🙀');
        else if (!hitAny && len > 40) G.bad('¡Pasa el cuchillo por las verduras! 🔪');
        if (cut >= NEED) G.done();
        a = null;
      };
      zone.addEventListener('pointerup', end);
      zone.addEventListener('pointercancel', () => { a = null; });
    }
  };
}

/* Hervir: reventar burbujas (en nivel 2 y 3 aparecen burbujas de fuego 🔥 que NO se tocan) */
function makeBubbles(o) {
  return {
    text: o.text || '🫧 ¡Revienta las burbujas!', voice: o.voice,
    init(st, G) {
      st.innerHTML = '<div class="boilwrap"><div class="boilpot"><div class="soup"></div><div class="bubzone"></div></div><div class="flame">🔥</div></div><div class="meter"><div></div></div>';
      const zone = $('.bubzone', st), bar = $('.meter > div', st);
      const NEED = byLv(8, 12, 16), MAXACT = byLv(3, 4, 5), HOT = byLv(0, 0.18, 0.28), GAP = byLv(450, 380, 300);
      let pops = 0, active = 0, alive = true, timer = 0, done = false;
      G.onCleanup(() => { alive = false; clearTimeout(timer); });
      const finish = () => {
        done = true; alive = false; clearTimeout(timer);
        zone.querySelectorAll('.bub').forEach((x) => x.remove());          // no queda ninguna burbuja de mas
        G.done();
      };
      const spawn = () => {
        if (!alive || G.finished || done) return;
        if (active < MAXACT && pops + active < NEED + 2) {
          active++;
          const hot = Math.random() < HOT;
          const b = el('button', 'bub' + (hot ? ' hot' : '') + (o.emoji ? ' emo' : ''), hot ? '🔥' : (o.emoji || ''));
          const size = 58 + Math.random() * 26;
          b.style.width = b.style.height = size + 'px';
          if (hot || o.emoji) b.style.fontSize = size * 0.55 + 'px';
          b.style.left = (6 + Math.random() * 78) + '%';
          const rm = () => { if (b.parentNode) { b.remove(); active--; } };
          b.addEventListener('animationend', (e) => { if (e.animationName === 'rise') rm(); });
          b.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            if (b.dataset.p || G.finished || done) return;
            b.dataset.p = '1'; b.classList.add('pop');
            if (hot) { G.bad('¡Esa quema! 🔥'); setTimeout(rm, 180); return; }
            Sound.bloop(); pops++;
            bar.style.width = Math.min(100, pops / NEED * 100) + '%';
            setTimeout(rm, 180);
            if (pops >= NEED) finish();
          });
          zone.appendChild(b);
        }
        timer = setTimeout(spawn, GAP + Math.random() * 350);
      };
      spawn();
    }
  };
}

/* Servir: mantener presionado la botella y soltar cuando el liquido llegue a la zona verde */
function makeHoldPour(o) {
  return {
    text: o.text, voice: o.voice,
    init(st, G) {
      const [zz0, zz1] = o.zone || [0.45, 0.8];
      const zmid = (zz0 + zz1) / 2, zhalf = (zz1 - zz0) / 2 * byLv(1, 0.7, 0.5);
      const z0 = zmid - zhalf, z1 = zmid + zhalf;
      st.innerHTML = `<div class="pourwrap"><button class="bottle">${o.bottle}</button><div class="stream"></div>
        <div class="vessel ${o.vesselClass || ''}"><div class="zoneband"></div><div class="liquid"></div></div></div>`;
      const wrap = $('.pourwrap', st), bottle = $('.bottle', st), stream = $('.stream', st), vessel = $('.vessel', st), liquid = $('.liquid', st), band = $('.zoneband', st);
      wrap.style.setProperty('--liq', o.color || '#4fa8ff');
      band.style.bottom = z0 * 100 + '%'; band.style.height = (z1 - z0) * 100 + '%';
      const FILL = (o.fillMs || 3200) * byLv(1, 0.85, 0.72);
      wrap.dataset.fill = FILL; wrap.dataset.mid = zmid;
      let level = 0, pouring = false, alive = true, inZone = false, lock = false, last = performance.now(), raf = 0;
      G.onCleanup(() => { alive = false; cancelAnimationFrame(raf); Sound.pourStop(); });

      const reset = (ms) => { lock = true; G.later(() => { level = 0; inZone = false; lock = false; }, ms); };
      const stop = () => { pouring = false; bottle.classList.remove('pouring'); Sound.pourStop(); };
      const loop = (now) => {
        if (!alive || G.finished) return;
        const dt = now - last; last = now;
        if (pouring && !lock) {
          level += dt / FILL;
          if (level >= z0 && !inZone) { inZone = true; Sound.pop(); }
          if (level >= 1) { level = 1; stop(); G.bad(o.spill || '¡Uy, se derramó! 💦'); reset(900); }
        }
        liquid.style.height = Math.min(level, 1) * 100 + '%';
        if (pouring && !lock) {
          const wr = wrap.getBoundingClientRect(), vr = vessel.getBoundingClientRect(), br = bottle.getBoundingClientRect();
          const top = br.bottom - wr.top - 22, liqY = vr.bottom - wr.top - Math.min(level, 1) * vr.height;
          stream.style.display = 'block'; stream.style.top = top + 'px'; stream.style.height = Math.max(0, liqY - top) + 'px';
        } else stream.style.display = 'none';
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

      wrap.addEventListener('pointerdown', (e) => {
        if (G.finished || lock) return;
        pouring = true; inZone = level >= z0; bottle.classList.add('pouring'); Sound.pourStart();
        try { wrap.setPointerCapture(e.pointerId); } catch (err) { /* nada */ }
      });
      const release = () => {
        if (!pouring) return;
        stop();
        if (lock) return;
        if (level >= z0 && level <= z1) { G.done(); return; }
        if (level > z1) { G.bad(o.spill || '¡Mucho! 💦'); reset(900); return; }
        showBubble(o.hint || '¡Un poquito más! 💧', '');
        G.later(() => { if (!G.finished) showBubble(G.currentText, ''); }, 1800);
      };
      wrap.addEventListener('pointerup', release);
      wrap.addEventListener('pointercancel', release);
    }
  };
}

/* Hornear: esperar el timbre y tocar en el momento justo */
function makeBake(o) {
  return {
    text: o.text, voice: o.voice,
    init(st, G) {
      const ZS = byLv(0.55, 0.6, 0.66), ZE = byLv(1.0, 0.88, 0.8), DUR = byLv(7000, 6000, 5200);
      st.innerHTML = `<div class="oven baking"><div class="oven-window"><div class="tray">${o.tray}</div></div><div class="smoke">💨💨</div></div>
        <div class="timer"><div class="zone"></div><div class="bar"></div></div>
        <button class="bigbtn" id="take">🧤</button>`;
      const win = $('.oven-window', st), timer = $('.timer', st), bar = $('.bar', st), zone = $('.zone', st), smoke = $('.smoke', st), btn = $('#take', st);
      zone.style.left = ZS * 100 + '%'; zone.style.width = (ZE - ZS) * 100 + '%';
      let t0 = performance.now(), dinged = false, alive = true, raf = 0;
      Sound.sizzleStart();
      G.onCleanup(() => { alive = false; cancelAnimationFrame(raf); Sound.sizzleStop(); });
      const restart = () => { t0 = performance.now(); dinged = false; timer.classList.remove('ready'); win.classList.remove('hot'); Sound.sizzleStart(); };
      const loop = (now) => {
        if (!alive || G.finished) return;
        const p = (now - t0) / DUR;
        bar.style.width = Math.min(1, Math.max(0, p)) * 100 + '%';
        if (p >= ZS && !dinged) { dinged = true; Sound.ding(); timer.classList.add('ready'); win.classList.add('hot'); }
        if (p > ZE + 0.12) {
          smoke.classList.remove('show'); void smoke.offsetWidth; smoke.classList.add('show');
          G.bad(o.burnt || '¡Uy, se quemó un poquito! 💨');
          Sound.sizzleStop(); G.later(restart, 1200); t0 = now + 1e9;
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      btn.addEventListener('click', () => {
        if (G.finished) return;
        const p = (performance.now() - t0) / DUR;
        if (p < 0) return;
        if (p < ZS) G.bad('¡Todavía no, espera el timbre! 🔔');
        else if (p <= ZE + 0.12) { Sound.pop(); G.done(); }
      });
    }
  };
}

/* =========================================================
   PIZZA 🍕
   ========================================================= */
const PIZZA_STEPS = [

  /* 1. Amasar: tocar la masa varias veces */
  {
    text: '👆 ¡Toca para amasar!',
    voice: 'Toca la masa muchas veces para amasarla.',
    init(st, G) {
      st.innerHTML = '<button class="dough-ball">👆</button><div class="meter"><div></div></div>';
      const ball = $('.dough-ball', st), bar = $('.meter > div', st);
      const NEED = byLv(10, 14, 18); let n = 0;
      ball.addEventListener('pointerdown', () => {
        if (G.finished) return;
        n++; Sound.squish();
        const sx = 1 + n * 0.045, sy = 1 - n * 0.032;
        ball.textContent = '';
        ball.animate([
          { transform: `scale(${sx - 0.045},${sy + 0.032})` },
          { transform: `scale(${sx * 1.14},${sy * 0.84})`, offset: 0.4 },
          { transform: `scale(${sx},${sy})` }
        ], { duration: 170, fill: 'forwards' });
        bar.style.width = n / NEED * 100 + '%';
        if (n >= NEED) G.done();
      });
    }
  },

  /* 2. Salsa: pintar con el dedo sobre la masa, sin salirse */
  {
    text: '🍅 ¡Pinta la salsa con el dedo!',
    voice: 'Pasa tu dedo por la masa para extender la salsa de tomate.',
    init(st, G) {
      st.innerHTML = '<div class="pizza-zone"><div class="pizza"><canvas></canvas></div><div class="spoon">🥄</div><div class="hint-circle"></div></div><div class="meter"><div></div></div>';
      const zone = $('.pizza-zone', st), cv = $('canvas', st), spoon = $('.spoon', st), bar = $('.meter > div', st), hint = $('.hint-circle', st);
      const dpr = window.devicePixelRatio || 1;
      const S0 = zone.getBoundingClientRect().width, inner = S0 * 0.88;
      cv.width = cv.height = Math.round(inner * dpr);
      const c2 = cv.getContext('2d');
      c2.scale(dpr, dpr); c2.lineCap = 'round'; c2.lineJoin = 'round'; c2.strokeStyle = '#d6342b'; c2.fillStyle = '#d6342b';
      c2.lineWidth = inner * 0.15;
      const N = 10, cells = new Array(N * N).fill(false), centers = [];
      let insideTotal = 0, marked = 0;
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        const x = (j + 0.5) * inner / N, y = (i + 0.5) * inner / N;
        const ins = Math.hypot(x - inner / 2, y - inner / 2) < inner / 2 * 0.9;
        centers.push({ x, y, ins }); if (ins) insideTotal++;
      }
      let down = false, last = null, outside = false;
      const NEEDCOV = 0.8;
      zone.addEventListener('pointerdown', (e) => {
        const r = zone.getBoundingClientRect();
        if (Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) > r.width / 2) return;
        down = true; last = null; outside = false; hint.style.display = 'none';
        try { zone.setPointerCapture(e.pointerId); } catch (err) { /* nada */ }
        paintAt(e);
      });
      function paintAt(e) {
        const r = zone.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        spoon.style.left = (e.clientX - r.left) + 'px'; spoon.style.top = (e.clientY - r.top) + 'px';
        if (Math.hypot(e.clientX - cx, e.clientY - cy) > r.width / 2) {
          if (!outside) { outside = true; G.bad('¡Se mancha la mesa! 🍅'); }
          last = null; return;
        }
        outside = false;
        const ox = r.left + (r.width - inner) / 2, oy = r.top + (r.height - inner) / 2;
        const p = { x: e.clientX - ox, y: e.clientY - oy };
        c2.beginPath();
        if (last) { c2.moveTo(last.x, last.y); c2.lineTo(p.x, p.y); c2.stroke(); }
        else { c2.arc(p.x, p.y, c2.lineWidth / 2, 0, Math.PI * 2); c2.fill(); }
        last = p;
        const rad = c2.lineWidth * 0.55;
        centers.forEach((c, k) => {
          if (c.ins && !cells[k] && Math.hypot(c.x - p.x, c.y - p.y) < rad) { cells[k] = true; marked++; }
        });
        const cov = marked / insideTotal;
        bar.style.width = Math.min(100, cov / NEEDCOV * 100) + '%';
        if (cov >= NEEDCOV) { down = false; G.done(); }
      }
      zone.addEventListener('pointermove', (e) => { if (down && !G.finished) paintAt(e); });
      const up = () => { down = false; last = null; };
      zone.addEventListener('pointerup', up);
      zone.addEventListener('pointercancel', up);
    }
  },

  /* 3. Ingredientes: elegir uno y tocar la pizza para ponerlo (el peluche es una trampa) */
  {
    text: '🍄 🍅 🧀  ¡Pon ingredientes!',
    voice: 'Elige un ingrediente y toca la pizza para ponerlo.',
    init(st, G) {
      st.innerHTML = '<div class="pizza-zone"><div class="pizza cheesy"></div></div><div class="palette"></div><div class="meter"><div></div></div>';
      const zone = $('.pizza-zone', st), pizza = $('.pizza', st), pal = $('.palette', st), bar = $('.meter > div', st);
      const opts = [{ e: '🍄', ok: true }, { e: '🍅', ok: true }, { e: '🧀', ok: true }, { e: '🧸', ok: false }];
      let sel = opts[0], placed = 0;
      const NEED = byLv(8, 10, 12);
      opts.forEach((op) => {
        const b = el('button', 'topbtn' + (op === sel ? ' sel' : ''), op.e);
        b.addEventListener('click', () => { sel = op; Sound.pop(); [...pal.children].forEach((c) => c.classList.toggle('sel', c === b)); });
        pal.appendChild(b);
      });
      pizza.addEventListener('click', (e) => {
        e.stopPropagation();
        if (G.finished) return;
        if (!sel.ok) { G.bad('¡Eso no va en la pizza! 🧸'); return; }
        const r = pizza.getBoundingClientRect();
        const t = el('span', 'placed', sel.e);
        t.style.left = (e.clientX - r.left) + 'px'; t.style.top = (e.clientY - r.top) + 'px';
        t.style.setProperty('--rot', Math.floor(Math.random() * 60 - 30) + 'deg');
        pizza.appendChild(t);
        Sound.plop(); placed++;
        bar.style.width = placed / NEED * 100 + '%';
        if (placed >= NEED) G.done();
      });
      zone.addEventListener('click', () => G.bad('¡Ponlos sobre la pizza! 🍕'));
    }
  },

  /* 4. Hornear la pizza */
  makeBake({
    text: '🔔 ¡Toca cuando suene!',
    voice: 'Espera a que suene el timbre y saca la pizza.',
    tray: '<span class="bake-emoji">🍕</span>',
    burnt: '¡Uy, se quemó un poquito! 💨'
  }),

  /* 5. Cortar la pizza: deslizar el dedo de lado a lado */
  {
    text: '🔪 ¡Desliza el dedo para cortar!',
    voice: 'Desliza tu dedo de un lado a otro de la pizza para cortarla en trozos.',
    init(st, G) {
      const peps = Array.from({ length: 9 }, () => {
        const a = Math.random() * 6.28, r = Math.sqrt(Math.random()) * 36;
        return `<i class="pep" style="left:${50 + Math.cos(a) * r}%;top:${50 + Math.sin(a) * r}%"></i>`;
      }).join('');
      st.innerHTML = `<div class="swipe-area"><div class="pizza-zone"><div class="pizza cheesy done-pizza">${peps}</div><svg class="cuts" viewBox="0 0 100 100"></svg><div class="hint-swipe">👆</div><div class="spoon">🔪</div></div></div><div class="meter"><div></div></div>`;
      const zone = $('.pizza-zone', st), area = $('.swipe-area', st), cuts = $('.cuts', st), hint = $('.hint-swipe', st), knife = $('.spoon', st), bar = $('.meter > div', st);
      const NEED = 3; let n = 0, a = null, b = null;
      area.addEventListener('pointerdown', (e) => {
        a = { x: e.clientX, y: e.clientY }; b = a; hint.style.display = 'none';
        try { area.setPointerCapture(e.pointerId); } catch (err) { /* nada */ }
      });
      area.addEventListener('pointermove', (e) => {
        if (!a) return;
        b = { x: e.clientX, y: e.clientY };
        const r = zone.getBoundingClientRect();
        knife.style.left = (e.clientX - r.left) + 'px'; knife.style.top = (e.clientY - r.top) + 'px';
      });
      const end = () => {
        if (!a || G.finished) { a = null; return; }
        const r = zone.getBoundingClientRect(), R = r.width / 2, cx = r.left + R, cy = r.top + r.height / 2;
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        const dir = { x: (b.x - a.x) / (len || 1), y: (b.y - a.y) / (len || 1) };
        const t = (cx - a.x) * dir.x + (cy - a.y) * dir.y;
        const p0 = { x: a.x + dir.x * t, y: a.y + dir.y * t };
        const h = Math.hypot(p0.x - cx, p0.y - cy);
        const startedOn = Math.hypot(a.x - cx, a.y - cy) < R * 1.25;
        if (len >= R * 1.1 && h < R * 0.6 && startedOn) {
          const half = Math.sqrt(Math.max(0, R * R - h * h));
          const toSvg = (p) => ({ x: (p.x - r.left) / r.width * 100, y: (p.y - r.top) / r.height * 100 });
          const p1 = toSvg({ x: p0.x - dir.x * half, y: p0.y - dir.y * half }), p2 = toSvg({ x: p0.x + dir.x * half, y: p0.y + dir.y * half });
          const ln = document.createElementNS(SVGNS, 'line');
          ln.setAttribute('x1', p1.x); ln.setAttribute('y1', p1.y); ln.setAttribute('x2', p2.x); ln.setAttribute('y2', p2.y);
          cuts.appendChild(ln);
          Sound.chop(); Sound.swoosh(); n++;
          bar.style.width = n / NEED * 100 + '%';
          if (n >= NEED) G.done();
        } else if (len > 30) {
          G.bad('¡Corta de lado a lado! 🍕');
        }
        a = null;
      };
      area.addEventListener('pointerup', end);
      area.addEventListener('pointercancel', () => { a = null; });
    }
  }
];

/* =========================================================
   ENSALADA 🥗
   ========================================================= */
const SALAD_STEPS = [

  makeWash({ veg: ['🥬', '🍅', '🥕'] }),

  makeSwipeCut({
    tiles: [{ e: '🥕', ok: true }, { e: '🥒', ok: true }, { e: '👟', ok: false }, { e: '🍅', ok: true }],
    voice: 'Corta los ingredientes.', trapMsg: '¡No cortes el zapato! 👟'
  }),

  /* 3. Al tazon: arrastrar (o tocar) las verduras; el peluche no va */
  {
    text: '👉 ¡Llévalas al tazón!',
    voice: 'Arrastra las verduras hasta el tazón grande.',
    init(st, G) {
      const items = [{ e: '🥬', ok: true }, { e: '🍅', ok: true }, { e: '🧸', ok: false }, { e: '🥕', ok: true }, { e: '🥒', ok: true }];
      st.innerHTML = '<div class="dragshelf"></div><div class="bowl big"><div class="bowl-fill"></div></div>';
      const shelf = $('.dragshelf', st), bowl = $('.bowl', st), fill = $('.bowl-fill', st);
      fill.style.background = '#a8e08c';
      const NEED = items.filter((i) => i.ok).length; let got = 0;
      const accept = (b) => {
        b.dataset.used = '1'; Sound.pop();
        b.style.transform = ''; b.classList.remove('dragging');
        fly(b, bowl, () => { Sound.plop(); got++; fill.style.transform = `scaleY(${0.35 + 0.65 * got / NEED})`; if (got >= NEED) G.done(); });
      };
      items.forEach((it) => {
        const b = el('button', 'drag-item', it.e);
        let sx = 0, sy = 0, moved = 0, drag = false;
        b.addEventListener('pointerdown', (e) => {
          if (b.dataset.used || G.finished) return;
          drag = true; sx = e.clientX; sy = e.clientY; moved = 0; b.classList.add('dragging');
          try { b.setPointerCapture(e.pointerId); } catch (err) { /* nada */ }
        });
        b.addEventListener('pointermove', (e) => {
          if (!drag) return;
          const dx = e.clientX - sx, dy = e.clientY - sy; moved = Math.max(moved, Math.hypot(dx, dy));
          b.style.transform = `translate(${dx}px,${dy}px) scale(1.2)`;
        });
        const release = (e) => {
          if (!drag) return; drag = false; b.classList.remove('dragging');
          const r = bowl.getBoundingClientRect();
          const over = e.clientX > r.left - 20 && e.clientX < r.right + 20 && e.clientY > r.top - 30 && e.clientY < r.bottom + 20;
          const tap = moved < 12;
          if (over || tap) {
            if (!it.ok) { b.style.transform = ''; shakeEl(b); G.bad('¡El peluche no va en la ensalada! 🧸'); return; }
            accept(b);
          } else {
            b.style.transition = 'transform .25s'; b.style.transform = '';
            setTimeout(() => { b.style.transition = ''; }, 280);
          }
        };
        b.addEventListener('pointerup', release);
        b.addEventListener('pointercancel', () => { drag = false; b.style.transform = ''; b.classList.remove('dragging'); });
        shelf.appendChild(b);
      });
    }
  },

  /* 4. Aliño: mantener presionado y soltar en la zona verde */
  makeHoldPour({
    text: '🫒 ¡Mantén presionado!',
    voice: 'Mantén presionada la botella de aceite de oliva y suelta cuando llegue a la zona verde.',
    bottle: '🫒', color: '#c9b834', vesselClass: 'jar', zone: [0.45, 0.8],
    hint: '¡Un poquito más de aceite! 🫒', spill: '¡Uy, mucho aceite! 💦'
  }),

  /* 5. Mezclar la ensalada */
  makeMix({
    text: '🥄 ¡Gira para mezclar!',
    voice: 'Gira tu dedo dentro del tazón para mezclar la ensalada.',
    bowlClass: '', spill: '¡Uy, se salen las verduras! 🥬',
    inner: '<div class="mixinner salad"><span>🥬</span><span>🍅</span><span>🥕</span><span>🥒</span><span>🥬</span></div>',
    spinSel: '.mixinner', spoon: '🥄', laps: 3
  })
];

/* =========================================================
   SOPA 🍲
   ========================================================= */
const SOUP_STEPS = [

  /* 1. Ingredientes a la olla (el chocolate es una trampa) */
  makeIngredients({
    text: '🥕 🥔 🧅  ¡A la olla!',
    voice: 'Toca la zanahoria, la papa y la cebolla para echarlas a la olla.',
    container: 'pot', fillColor: '#f6b85a',
    items: [
      { k: 'a', e: '🥕', l: 'zanahoria', ok: true, bg: '#ffe9d0' },
      { k: 'b', e: '🍫', l: 'chocolate', ok: false, bg: '#f1e3dc', msg: '¡El chocolate no va en la sopa! 🍫' },
      { k: 'c', e: '🥔', l: 'papa', ok: true, bg: '#fff3d6' },
      { k: 'd', e: '🧅', l: 'cebolla', ok: true, bg: '#f7e8f3' }
    ]
  }),

  /* 2. Agua: servir hasta la zona verde */
  makeHoldPour({
    text: '🚰 ¡Mantén presionado!',
    voice: 'Mantén presionado el grifo y suelta cuando el agua llegue a la zona verde.',
    bottle: '🚰', color: '#4fb4ff', vesselClass: 'potv', zone: [0.5, 0.82],
    hint: '¡Un poquito más de agua! 💧', spill: '¡Uy, se desbordó la olla! 💦'
  }),

  /* 3. Hervir: reventar burbujas (¡las de fuego no!) */
  makeBubbles({ voice: 'Toca las burbujas de la sopa para reventarlas. ¡Las burbujas de fuego no!' }),

  /* 4. Revolver la sopa */
  makeMix({
    text: '🥄 ¡Gira para revolver!',
    voice: 'Gira tu dedo dentro de la olla para revolver la sopa.',
    bowlClass: 'pot-round', spill: '¡Uy, salpica la sopa! 💦',
    inner: '<div class="mixinner soupmix"><span>🥕</span><span>🥔</span><span>🧅</span><span>🥕</span><span>🥔</span></div>',
    spinSel: '.mixinner', spoon: '🥄', laps: 3
  }),

  /* 5. Sal: exactamente tres pizcas y probar */
  {
    text: '🧂 ¡Tres pizcas de sal!',
    voice: 'Toca la sal tres veces y luego toca la cuchara para probar la sopa.',
    init(st, G) {
      const TARGET = byLv(3, 2 + Math.floor(Math.random() * 4), 3 + Math.floor(Math.random() * 4));
      if (TARGET !== 3) { const msg = `🧂 ¡${TARGET} pizcas de sal!`; showBubble(msg, ''); Game.currentText = msg; Voice.say(`Echa ${TARGET} pizcas de sal y luego toca la cuchara para probar la sopa.`); }
      st.innerHTML = '<div class="boilpot small"><div class="soup"></div><div class="saltfx"></div></div><div class="pinches"></div><div class="saltrow"><button class="saltbtn">🧂</button><button class="tastebtn">🥄</button></div>';
      const pinchesEl = $('.pinches', st), fx = $('.saltfx', st);
      let n = 0;
      const paint = () => {
        pinchesEl.innerHTML = '';
        pinchesEl.dataset.target = TARGET;
        for (let i = 0; i < Math.max(TARGET, n); i++) pinchesEl.appendChild(el('span', 'pdot' + (i < n ? ' on' : '') + (i >= TARGET ? ' over' : '')));
      };
      paint();
      $('.saltbtn', st).addEventListener('click', () => {
        if (G.finished) return;
        n = Math.min(n + 1, 7); Sound.salt(); paint();
        for (let i = 0; i < 6; i++) {
          const s = el('i', 'grain'); s.style.left = 40 + Math.random() * 20 + '%'; s.style.animationDelay = i * 0.04 + 's';
          fx.appendChild(s); setTimeout(() => s.remove(), 900);
        }
      });
      $('.tastebtn', st).addEventListener('click', () => {
        if (G.finished) return;
        if (n === TARGET) { Sound.pop(); G.done(); }
        else if (n < TARGET) G.bad('¡Le falta sal! 🧂');
        else { n = 0; paint(); G.bad('¡Demasiada sal! Otra vez 😝'); }
      });
    }
  }
];

/* =========================================================
   SOPLAR 💨 (usa el microfono; si no hay, un boton)
   La comida empieza muy caliente. Cuando el microfono detecta un soplido de verdad, baja la temperatura.
   Si la niña intenta comer antes de que se enfrie: ¡quema! (maullido estresado).
   ========================================================= */
function makeBlow(o) {
  return {
    text: o.text || '💨 ¡Sopla para enfriar!',
    voice: o.voice || 'Está muy caliente. Sopla hacia el celular para enfriarla y luego toca la cuchara.',
    init(st, G) {
      st.innerHTML = `<div class="blow">
        <div class="blow-food"><span class="steam">♨️</span><span class="steam">♨️</span><span class="steam">♨️</span><span class="blow-wind">💨</span><div class="blow-plate">${o.food}</div></div>
        <div class="blow-temp"><span>😋</span><div class="blow-bar"><div class="blow-fill"></div></div><span>🥵</span></div>
        <div class="blow-mic"><span>🎤</span><div class="micmeter"><div class="micfill"></div></div></div>
        <button class="blow-btn" hidden>💨</button>
        <button class="blow-eat">${o.eat || '🥄'}</button></div>`;
      const wrap = $('.blow', st), plate = $('.blow-plate', st), fill = $('.blow-fill', st), micRow = $('.blow-mic', st),
        mfill = $('.micfill', st), btn = $('.blow-btn', st), eat = $('.blow-eat', st);
      const COOL_MS = o.coolMs || 1100;
      let t = 1, cool = false, alive = true, held = false, det = null, quiet = 0, hinted = false, last = performance.now(), raf = 0;
      G.onCleanup(() => { alive = false; cancelAnimationFrame(raf); Mic.close(); });

      micRow.style.visibility = 'hidden';
      Mic.open().then((r) => {
        if (!alive) return;
        if (r.ok) { det = Mic.detector(); micRow.style.visibility = 'visible'; }
        else { micRow.hidden = true; btn.hidden = false; showBubble('💨 Mantén presionado y sopla', ''); }
      });
      btn.addEventListener('pointerdown', (e) => { held = true; btn.classList.add('held'); try { btn.setPointerCapture(e.pointerId); } catch (err) { /* nada */ } });
      ['pointerup', 'pointercancel'].forEach((ev) => btn.addEventListener(ev, () => { held = false; btn.classList.remove('held'); }));

      const loop = (now) => {
        if (!alive || G.finished) return;
        const dt = Math.min(100, now - last); last = now;
        const m = det ? det.update(dt) : { blowing: false, level: 0 };
        const b = (m.blowing || held) && !cool;
        wrap.classList.toggle('blowing', b);
        mfill.style.width = Math.round(m.level * 100) + '%';
        mfill.classList.toggle('on', m.blowing);
        if (!cool) {
          if (b) { t = Math.max(0, t - dt / COOL_MS); quiet = 0; }
          else quiet += dt;                                   // una vez que baja, NO vuelve a calentarse
          fill.style.width = (t * 100) + '%';
          if (t <= 0.04) {
            cool = true; wrap.classList.remove('blowing'); wrap.classList.add('cool');
            Sound.pop(); showBubble('¡Ya se enfrió! ¡A comer! 😋', 'good');
          } else if (quiet > 9000 && !hinted) {
            hinted = true; showBubble('¡Sopla fuerte hacia el celular! 💨', '');
            G.later(() => { hinted = false; quiet = 0; if (!G.finished) showBubble(G.currentText, ''); }, 3500);
          }
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

      eat.addEventListener('click', () => {
        if (G.finished) return;
        if (cool) { Mic.close(); Sound.pop(); G.done(); return; }
        plate.classList.remove('shake'); void plate.offsetWidth; plate.classList.add('shake');
        G.bad(o.hot || '¡Quema! Sopla primero 🔥');
      });
    }
  };
}

/* Voltear: deslizar el dedo hacia arriba cuando este dorado (ni antes ni muy tarde) */
function makeFlip(o) {
  return {
    text: o.text, voice: o.voice,
    init(st, G) {
      const FLIPS = o.flips || byLv(2, 3, 4), READY = byLv(2300, 2500, 2700), BURN = byLv(6800, 5600, 4600);
      st.innerHTML = `<div class="panwrap"><div class="panhint">⬆️</div><div class="pancake"></div><div class="pan"></div></div><div class="pdots"></div>`;
      const wrap = $('.panwrap', st), cake = $('.pancake', st), dots = $('.pdots', st);
      let n = 0, t0 = performance.now(), alive = true, dinged = false, busy = false, raf = 0, y0 = null, tdown = 0;
      G.onCleanup(() => { alive = false; cancelAnimationFrame(raf); Sound.sizzleStop(); });
      const paint = () => { dots.innerHTML = ''; for (let i = 0; i < FLIPS; i++) dots.appendChild(el('span', 'pdot' + (i < n ? ' on' : ''))); };
      paint(); Sound.sizzleStart();
      const restart = () => { t0 = performance.now(); dinged = false; cake.classList.remove('ready', 'burnt'); Sound.sizzleStart(); };
      const loop = (now) => {
        if (!alive || G.finished) return;
        const age = now - t0;
        if (!busy) {
          if (age > READY && !dinged) { dinged = true; cake.classList.add('ready'); Sound.ding(); }
          if (age > BURN) {
            cake.classList.add('burnt'); Sound.sizzleStop(); busy = true;
            G.bad(o.burnt || '¡Uy, se quemó! 💨');
            G.later(() => { busy = false; restart(); }, 1500);
          }
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      wrap.addEventListener('pointerdown', (e) => { y0 = e.clientY; tdown = performance.now(); try { wrap.setPointerCapture(e.pointerId); } catch (err) { /* nada */ } });
      wrap.addEventListener('pointerup', (e) => {
        if (y0 === null || busy || G.finished) { y0 = null; return; }
        const dy = e.clientY - y0, dt = performance.now() - tdown; y0 = null;
        if (dy > -50 || dt > 900) return;                       // no fue un deslizamiento hacia arriba
        if (performance.now() - t0 < READY) { G.bad(o.raw || '¡Todavía está crudo! 🥞'); return; }
        busy = true; Sound.swoosh(); cake.classList.remove('flip'); void cake.offsetWidth; cake.classList.add('flip');
        G.later(() => {
          n++; paint();
          if (n >= FLIPS) { Sound.sizzleStop(); G.done(); return; }
          busy = false; restart();
        }, 650);
      });
      wrap.addEventListener('pointercancel', () => { y0 = null; });
    }
  };
}

/* Apilar: tocar las capas en el orden correcto */
function makeStack(o) {
  return {
    text: o.text, voice: o.voice,
    init(st, G) {
      st.innerHTML = `<div class="seqrow"></div><div class="stack"></div><div class="shelf stackshelf"></div>`;
      const seq = $('.seqrow', st), stack = $('.stack', st), shelf = $('.shelf', st);
      const hard = LV() >= 2 && o.orderHard;
      const order = hard ? o.orderHard : o.order;                // [{e, c}, ...] de abajo hacia arriba
      const btns = hard ? o.buttonsHard : o.buttons;
      if (hard) showBubble(order.map((l) => l.e).join(' ') + '  ¡Apila!', '');
      let n = 0;
      const paint = () => { seq.innerHTML = ''; order.forEach((l, i) => seq.appendChild(el('span', 'seqdot' + (i < n ? ' on' : i === n ? ' next' : ''), l.e))); };
      paint();
      btns.forEach((b) => {
        const btn = el('button', 'item', b.e);
        if (b.bg) btn.style.background = b.bg;
        btn.addEventListener('click', () => {
          if (G.finished) return;
          if (n >= order.length) return;
          if (b.e !== order[n].e) { shakeEl(btn); G.bad(b.msg || o.wrong || '¡Ese no va ahora! 🙀'); return; }
          const layer = el('div', 'layer', order[n].e);
          layer.style.background = order[n].c;
          stack.appendChild(layer); Sound.plop(); n++; paint();
          if (n >= order.length) G.later(() => G.done(), 350);
        });
        shelf.appendChild(btn);
      });
    }
  };
}

/* Memoria (nivel 2 y 3): mirar los ingredientes y despues elegirlos de memoria */
function makeMemory(o) {
  return {
    minLevel: 2,
    text: '🧠 ¡Memoriza la receta!',
    voice: 'Memoriza los ingredientes.',
    init(st, G) {
      const SHOW = byLv(0, 4000, 2800);
      st.innerHTML = '<div class="memcard"></div><div class="memtimer"><div></div></div><div class="shelf six memshelf"></div>';
      const card = $('.memcard', st), tm = $('.memtimer > div', st), shelf = $('.memshelf', st);
      o.items.forEach((e) => card.appendChild(el('span', '', e)));
      shelf.style.visibility = 'hidden';
      tm.style.transition = `width ${SHOW}ms linear`; requestAnimationFrame(() => requestAnimationFrame(() => { tm.style.width = '0%'; }));
      let left = o.items.length, ready = false;
      // se muestran los ingredientes un rato y luego se tapan, pero SOLO cuando el gato termino de explicar
      const t0 = Date.now();
      const reveal = () => {
        if (G.finished) return;
        if (Voice.speaking() && Date.now() - t0 < 14000) { G.later(reveal, 150); return; }
        ready = true;
        card.innerHTML = o.items.map(() => '<span class="q">❓</span>').join('');
        showBubble('¿Cuáles eran? 🤔', ''); Game.currentText = '¿Cuáles eran? 🤔';
        Voice.say('¿Cuáles eran?', { queue: true });
        shelf.style.visibility = 'visible';
      };
      G.later(reveal, SHOW);
      const pool = shuffle(['🍌', '🍓', '🥦', '🍋', '🍞', '🍟', '🥒', '🍇', '🍒', '🥔'].filter((e) => !o.items.includes(e))).slice(0, 3);
      shuffle(o.items.concat(pool)).forEach((e) => {
        const b = el('button', 'item', e); b.dataset.ok = o.items.includes(e) ? '1' : '0';
        b.addEventListener('click', () => {
          if (!ready || G.finished || b.disabled) return;
          if (b.dataset.ok === '0') { shakeEl(b); G.bad('¡Esa no estaba en la receta! 🙀'); return; }
          b.disabled = true; b.classList.add('full'); Sound.pop(); left--;
          if (left === 0) G.later(() => G.done(), 300);
        });
        shelf.appendChild(b);
      });
    }
  };
}

/* Torta para las velas: usa la torta que decoro la niña (si existe) */
function cakeHTML(big, withFlames) {
  const inner = Game.art
    ? `<div class="cakeart" style="background-image:url(${Game.art})"></div>`
    : '<div class="cake-top"></div><div class="cake-mid"></div><div class="cake-bot"></div>';
  return `<div class="cakebox${big ? ' big' : ''}${Game.art ? ' art' : ''}">${withFlames ? '<div class="flames"></div>' : ''}<div class="candles"></div>${inner}</div>`;
}

/* Velas: contar y poner exactamente las que pide el pastel */
/* ajusta el tamano de las velas para que siempre quepan encima de la torta */
function fitCandles(box, n) {
  const w = box.clientWidth || 190;
  box.style.setProperty('--cs', Math.max(14, Math.min(30, Math.floor(w * 0.84 / (Math.max(n, 1) * 1.25)))) + 'px');
}

function makeCandleCount() {
  return {
    text: '🕯️ ¡Pon las velas!',
    voice: 'Toca la vela para ponerla en la torta. ¡Pon justo las que dice el número! Luego toca el visto.',
    init(st, G) {
      const N = byLv(5, 3 + Math.floor(Math.random() * 6), 4 + Math.floor(Math.random() * 6));
      showBubble(`🕯️ ¡Pon ${N} velas!`, ''); Game.currentText = `🕯️ ¡Pon ${N} velas!`;
      Voice.say(`Pon ${N} velas en la torta y luego toca el visto.`);
      st.innerHTML = `<div class="bignum" data-n="${N}">${N}</div>${cakeHTML(false, false)}
        <div class="candlerow"><button class="roundbtn" id="candUndo">↩️</button><button class="item candbtn">🕯️</button><button class="roundbtn ok" id="candOk">✅</button></div>`;
      const row = $('.candles', st); let n = 0;
      const paint = () => { row.innerHTML = ''; for (let i = 0; i < n; i++) row.appendChild(el('span', 'cand', '🕯️')); fitCandles(row.parentNode, n); };
      $('.candbtn', st).addEventListener('click', () => { if (G.finished) return; if (n >= 10) { G.bad('¡Es demasiado! 🙀'); return; } n++; Sound.pop(); paint(); });
      $('#candUndo', st).addEventListener('click', () => { if (G.finished || n <= 0) return; n--; paint(); });
      $('#candOk', st).addEventListener('click', () => {
        if (G.finished) return;
        if (n === N) { Sound.pop(); G.done(); }
        else G.bad(n < N ? '¡Faltan velas! 🕯️' : '¡Sobran velas! 🕯️');
      });
    }
  };
}

/* Soplar las velas con el microfono (o con el boton 💨) */
function makeBlowCandles() {
  return {
    text: '🎂 ¡Sopla las velas!',
    voice: 'Pide un deseo y sopla hacia el celular para apagar todas las velas.',
    init(st, G) {
      const N = byLv(5, 6, 7);
      st.innerHTML = `<div class="blow">${cakeHTML(true, true)}
        <div class="blow-mic"><span>🎤</span><div class="micmeter"><div class="micfill"></div></div></div><button class="blow-btn" hidden>💨</button></div>`;
      const wrap = $('.blow', st), flames = $('.flames', st), candles = $('.candles', st), micRow = $('.blow-mic', st), mfill = $('.micfill', st), btn = $('.blow-btn', st);
      const fl = [];
      fitCandles(candles.parentNode, N); for (let i = 0; i < N; i++) { candles.appendChild(el('span', 'cand', '🕯️')); const f = el('span', 'flame2', '🔥'); flames.appendChild(f); fl.push(f); }
      let p = 0, alive = true, held = false, det = null, last = performance.now(), raf = 0, out = 0;
      G.onCleanup(() => { alive = false; cancelAnimationFrame(raf); Mic.close(); });
      micRow.style.visibility = 'hidden';
      Mic.open().then((r) => {
        if (!alive) return;
        if (r.ok) { det = Mic.detector(); micRow.style.visibility = 'visible'; }
        else { micRow.hidden = true; btn.hidden = false; showBubble('💨 Mantén presionado y sopla', ''); }
      });
      btn.addEventListener('pointerdown', (e) => { held = true; btn.classList.add('held'); try { btn.setPointerCapture(e.pointerId); } catch (err) { /* nada */ } });
      ['pointerup', 'pointercancel'].forEach((ev) => btn.addEventListener(ev, () => { held = false; btn.classList.remove('held'); }));
      const loop = (now) => {
        if (!alive || G.finished) return;
        const dt = Math.min(100, now - last); last = now;
        const m = det ? det.update(dt) : { blowing: false, level: 0 };
        const b = m.blowing || held;
        wrap.classList.toggle('blowing', b);
        mfill.style.width = Math.round(m.level * 100) + '%'; mfill.classList.toggle('on', m.blowing);
        if (b) p = Math.min(1, p + dt / (byLv(1000, 1400, 1800)));
        const should = Math.floor(p * N + 1e-6);
        while (out < should) { fl[out].classList.add('out'); out++; Sound.pop(); }
        if (out >= N) { Mic.close(); G.later(() => G.done(), 450); return; }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }
  };
}

/* Soplar tambien en Sopa y Pizza */
SOUP_STEPS.push(makeBlow({ food: '🍲', voice: 'La sopa está muy caliente. Sopla hacia el celular para enfriarla y luego toca la cuchara.' }));
PIZZA_STEPS.splice(4, 0, makeBlow({ food: '🍕', eat: '🍴', voice: 'La pizza está muy caliente. Sopla hacia el celular para enfriarla y luego toca el tenedor.' }));

/* =========================================================
   ESPAGUETI 🍝
   ========================================================= */
const PASTA_STEPS = [
  SOUP_STEPS[1],                                                // agua hasta la zona verde
  makeIngredients({
    text: '🍝 🧂 🫒  ¡A la olla!',
    voice: 'Toca los espaguetis, la sal y el aceite para echarlos a la olla.',
    container: 'pot', fillColor: '#f3d68a',
    items: [
      { k: 'a', e: '🍝', l: 'espagueti', ok: true, bg: '#fff3d6' },
      { k: 'b', e: '🧦', l: 'calcetín', ok: false, bg: '#e5eaff', msg: '¡El calcetín no va en la olla! 🧦' },
      { k: 'c', e: '🧂', l: 'sal', ok: true, bg: '#eef2f5' },
      { k: 'd', e: '🫒', l: 'aceite', ok: true, bg: '#eaf3d3' }
    ]
  }),
  makeBubbles({ voice: 'Toca las burbujas del agua para reventarlas. ¡Las burbujas de fuego no!' }),
  makeHoldPour({
    text: '🍅 ¡Mantén presionado!',
    voice: 'Mantén presionado el tomate y suelta cuando la salsa llegue a la zona verde.',
    bottle: '🍅', color: '#e8432b', vesselClass: 'jar', zone: [0.45, 0.8],
    hint: '¡Un poquito más de salsa! 🍅', spill: '¡Uy, mucha salsa! 💦'
  }),
  makeMix({
    text: '🥄 ¡Gira para mezclar!',
    voice: 'Gira tu dedo dentro de la olla para mezclar los espaguetis con la salsa.',
    bowlClass: 'pot-round', spill: '¡Uy, salpica la salsa! 💦',
    inner: '<div class="mixinner soupmix"><span>🍝</span><span>🍅</span><span>🍝</span><span>🍅</span><span>🍝</span></div>',
    spinSel: '.mixinner', spoon: '🥄', laps: 3
  }),
  makeBlow({ food: '🍝', eat: '🍴', voice: 'Los espaguetis están muy calientes. Sopla hacia el celular para enfriarlos y luego toca el tenedor.' })
];

/* =========================================================
   CHOCOLATE CALIENTE ☕
   ========================================================= */
const COCOA_STEPS = [
  makeHoldPour({
    text: '🥛 ¡Mantén presionado!',
    voice: 'Mantén presionada la leche y suelta cuando llegue a la zona verde.',
    bottle: '🥛', color: '#f4efe6', vesselClass: 'jar', zone: [0.5, 0.82],
    hint: '¡Un poquito más de leche! 🥛', spill: '¡Uy, se derramó la leche! 💦'
  }),
  makeIngredients({
    text: '🍫 🫘 🍯  ¡A la olla!',
    voice: 'Toca el chocolate, el cacao y la miel para echarlos a la olla. ¡La cebolla no!',
    container: 'pot', fillColor: '#8a5a3c',
    items: [
      { k: 'a', e: '🍫', l: 'chocolate', ok: true, bg: '#f1e3dc' },
      { k: 'b', e: '🧅', l: 'cebolla', ok: false, bg: '#f7e8f3', msg: '¡La cebolla no va en el chocolate! 🧅' },
      { k: 'c', e: '🫘', l: 'cacao', ok: true, bg: '#efe0d6' },
      { k: 'd', e: '🍯', l: 'miel', ok: true, bg: '#fff0c4' }
    ]
  }),
  makeMix({
    text: '🥣 ¡Bate con el batidor!',
    voice: 'Gira tu dedo dentro de la olla para batir el chocolate con el batidor.',
    bowlClass: 'pot-round', spill: '¡Uy, salpica el chocolate! 💦',
    inner: '<div class="mixinner soupmix"><span>🍫</span><span>🥛</span><span>🍫</span><span>🍯</span><span>🥛</span></div>',
    spinSel: '.mixinner', spoon: WHISK, laps: 3
  }),
  makeBake({
    text: '🔔 ¡Toca cuando suene!',
    voice: 'Espera a que suene el timbre y saca la taza caliente.',
    tray: '<span class="bake-emoji">☕</span>',
    burnt: '¡Uy, hirvió de más! 💨'
  }),
  makeBlow({ food: '☕', eat: '👄', hot: '¡Quema! Sopla primero 🔥', voice: 'El chocolate está muy caliente. Sopla hacia el celular para enfriarlo y luego toca la boquita.' }),
  makeIngredients({
    text: '☁️ 🍫 🍪  ¡Para decorar!',
    voice: 'Toca los malvaviscos, las virutas de chocolate y la galleta para decorar tu chocolate. ¡El brócoli no!',
    container: 'bowl', fillColor: '#fff',
    items: [
      { k: 'a', e: '☁️', l: 'malvaviscos', ok: true, bg: '#eef6ff' },
      { k: 'b', e: '🥦', l: 'brócoli', ok: false, bg: '#e3f4dc', msg: '¡El brócoli no va en el chocolate! 🥦' },
      { k: 'c', e: '🍫', l: 'virutas', ok: true, bg: '#f1e3dc' },
      { k: 'd', e: '🍪', l: 'galleta', ok: true, bg: '#fff0d6' }
    ]
  })
];

/* =========================================================
   PANQUEQUES 🥞
   ========================================================= */
const PANCAKE_STEPS = [
  makeIngredients({
    text: '🌾 🥚 🥛 🧈  ¡Al tazón!',
    voice: 'Toca la harina, los huevos, la leche y la mantequilla para echarlos al tazón. ¡El osito no!',
    container: 'bowl', fillColor: '#f6dca0',
    items: [
      { k: 'a', e: '🌾', l: 'harina', ok: true, bg: '#fff3d6' },
      { k: 'b', e: '🧸', l: 'osito', ok: false, bg: '#f4e3d3', msg: '¡El osito no va en la masa! 🧸' },
      { k: 'c', e: '🥚', l: 'huevos', ok: true, bg: '#fff7de' },
      { k: 'd', e: '🥛', l: 'leche', ok: true, bg: '#eef6ff' },
      { k: 'e', e: '🧈', l: 'mantequilla', ok: true, bg: '#fff2b8' }
    ]
  }),
  makeMix({
    text: '🥣 ¡Bate con el batidor!',
    voice: 'Gira tu dedo dentro del tazón para batir la masa con el batidor.',
    bowlClass: '', spill: '¡Uy, se sale la masa! 💦',
    inner: '<div class="mixinner salad"><span>🥚</span><span>🥛</span><span>🌾</span><span>🥚</span><span>🥛</span></div>',
    spinSel: '.mixinner', spoon: WHISK, laps: 3
  }),
  makeFlip({
    text: '🥞 ¡Desliza hacia arriba!',
    voice: 'Cuando el panqueque esté dorado, desliza tu dedo hacia arriba para voltearlo.'
  }),
  makeHoldPour({
    text: '🍯 ¡Mantén presionado!',
    voice: 'Mantén presionada la miel y suelta cuando llegue a la zona verde.',
    bottle: '🍯', color: '#e8a21c', vesselClass: 'jar', zone: [0.45, 0.8],
    hint: '¡Un poquito más de miel! 🍯', spill: '¡Uy, mucha miel! 💦'
  }),
  makeIngredients({
    text: '🍓 🍌 🫐  ¡Fruta encima!',
    voice: 'Toca la fresa, el plátano y los arándanos para ponerlos encima. ¡El zapato no!',
    container: 'bowl', fillColor: '#ffd9a8',
    items: [
      { k: 'a', e: '🍓', l: 'fresa', ok: true, bg: '#ffe3e3' },
      { k: 'b', e: '👟', l: 'zapato', ok: false, bg: '#e5eaff', msg: '¡El zapato no es fruta! 👟' },
      { k: 'c', e: '🍌', l: 'plátano', ok: true, bg: '#fff7c9' },
      { k: 'd', e: '🫐', l: 'arándanos', ok: true, bg: '#e8e6ff' }
    ]
  })
];

/* =========================================================
   HAMBURGUESA 🍔
   ========================================================= */
const BURGER_STEPS = [
  makeWash({ veg: ['🥬', '🍅', '🧅'] }),                          // lavar las verduras
  makeBake({
    text: '🔔 ¡Toca cuando suene!',
    voice: 'Espera a que suene el timbre y saca la carne.',
    tray: '<span class="bake-emoji">🥩</span>',
    burnt: '¡Uy, se quemó la carne! 💨'
  }),
  makeStack({
    text: '🍞 🥩 🧀 🥬 🍞  ¡Apila!',
    voice: 'Elige los ingredientes en orden.',
    order: [{ e: '🍞', c: '#f0b45c' }, { e: '🥩', c: '#b3593a' }, { e: '🧀', c: '#ffd24d' }, { e: '🥬', c: '#8ad46a' }, { e: '🍞', c: '#f0b45c' }],
    buttons: [{ e: '🍞', bg: '#fff3d6' }, { e: '🥩', bg: '#ffe3de' }, { e: '🧀', bg: '#fff7c9' }, { e: '🥬', bg: '#e3f4dc' }, { e: '🧦', bg: '#e5eaff', msg: '¡El calcetín no va en la hamburguesa! 🧦' }],
    orderHard: [{ e: '🍞', c: '#f0b45c' }, { e: '🥩', c: '#b3593a' }, { e: '🧀', c: '#ffd24d' }, { e: '🍅', c: '#ee5a4a' }, { e: '🥬', c: '#8ad46a' }, { e: '🥩', c: '#b3593a' }, { e: '🍞', c: '#f0b45c' }],
    buttonsHard: [{ e: '🍞', bg: '#fff3d6' }, { e: '🥩', bg: '#ffe3de' }, { e: '🧀', bg: '#fff7c9' }, { e: '🍅', bg: '#ffe3e3' }, { e: '🥬', bg: '#e3f4dc' }, { e: '🧦', bg: '#e5eaff', msg: '¡El calcetín no va en la hamburguesa! 🧦' }]
  }),
  makeHoldPour({
    text: '🍅 ¡Mantén presionado!',
    voice: 'Mantén presionado el kétchup y suelta cuando llegue a la zona verde.',
    bottle: '🍅', color: '#d62b1b', vesselClass: 'jar', zone: [0.45, 0.8],
    hint: '¡Un poquito más de kétchup! 🍅', spill: '¡Uy, mucho kétchup! 💦'
  }),
  makeIngredients({
    text: '🥔 🫒 🧂  ¡Papas fritas!',
    voice: 'Toca las papas, el aceite y la sal para hacer papas fritas. ¡El chocolate no!',
    container: 'bowl', fillColor: '#ffe08a',
    items: [
      { k: 'a', e: '🥔', l: 'papas', ok: true, bg: '#fff3d6' },
      { k: 'b', e: '🍫', l: 'chocolate', ok: false, bg: '#f1e3dc', msg: '¡El chocolate no va con las papas! 🍫' },
      { k: 'c', e: '🫒', l: 'aceite', ok: true, bg: '#eaf3d3' },
      { k: 'd', e: '🧂', l: 'sal', ok: true, bg: '#eef2f5' }
    ]
  })
];

/* Masa de pastel/cupcake: primero los ingredientes secos y despues los humedos (como en la vida real) */
const dryStep = (what) => makeIngredients({
  text: '🌾 🧂 🫙  ¡Ingredientes secos!',
  voice: `Toca la harina, el azúcar y el polvo de hornear para echarlos al tazón. ¡El calcetín no!`,
  container: 'bowl', fillColor: '#f6e6c4',
  items: [
    { k: 'a', e: '🌾', l: 'harina', ok: true, bg: '#fff7de' },
    { k: 'b', e: '🧦', l: 'calcetín', ok: false, bg: '#e5eaff', msg: `¡El calcetín no va en ${what}! 🧦` },
    { k: 'c', e: '🧂', l: 'azúcar', ok: true, bg: '#ffe3ee' },
    { k: 'd', e: '🫙', l: 'polvo de hornear', ok: true, bg: '#eef2f5' }
  ]
});
const wetStep = (what) => makeIngredients({
  text: '🥚 🥛 🧈  ¡Ingredientes húmedos!',
  voice: `Ahora toca los huevos, la leche y la mantequilla para echarlos al tazón. ¡El pescado no!`,
  container: 'bowl', fillColor: '#f6dca0',
  items: [
    { k: 'a', e: '🥚', l: 'huevos', ok: true, bg: '#fff7de' },
    { k: 'b', e: '🐟', l: 'pescado', ok: false, bg: '#e5eaff', msg: `¡El pescado no va en ${what}! 🐟` },
    { k: 'c', e: '🥛', l: 'leche', ok: true, bg: '#eef6ff' },
    { k: 'd', e: '🧈', l: 'mantequilla', ok: true, bg: '#fff2b8' }
  ]
});
const whiskStep = (voice) => makeMix({
  text: '🥣 ¡Bate con el batidor!', voice,
  bowlClass: '', spill: '¡Uy, se sale la masa! 💦',
  inner: '<div class="mixinner salad"><span>🥚</span><span>🥛</span><span>🌾</span><span>🥚</span><span>🥛</span></div>',
  spinSel: '.mixinner', spoon: WHISK, laps: 3
});

/* =========================================================
   CUPCAKES 🧁
   ========================================================= */
const CUPCAKE_STEPS = [
  dryStep('los cupcakes'),
  wetStep('los cupcakes'),
  whiskStep('Gira tu dedo dentro del tazón para batir la masa con el batidor.'),
  makeBake({
    text: '🔔 ¡Toca cuando suene!',
    voice: 'Espera a que suene el timbre y saca los cupcakes.',
    tray: '<span class="bake-emoji">🧁</span><span class="bake-emoji">🧁</span>',
    burnt: '¡Uy, se quemaron un poquito! 💨'
  }),
  makeHoldPour({
    text: '🍦 ¡Mantén presionado!',
    voice: 'Mantén presionada la crema y suelta cuando llegue a la zona verde.',
    bottle: '🍦', color: '#ffb6d5', vesselClass: 'jar', zone: [0.45, 0.8],
    hint: '¡Un poquito más de crema! 🍦', spill: '¡Uy, mucha crema! 💦'
  }),
  makeDecorate({ base: 'cupcake', text: '🎨 ¡Decora tu cupcake!', voice: 'Elige crema, chocolate, fresas o lluvia de colores y decora tu cupcake como quieras. Cuando termines toca el visto.' })
];

/* =========================================================
   TORTA 🎂
   ========================================================= */
const CAKE_STEPS = [
  dryStep('la torta'),
  wetStep('la torta'),
  whiskStep('Gira tu dedo dentro del tazón para batir la masa de la torta con el batidor.'),
  makeHoldPour({
    text: '🥣 ¡Mantén presionado!',
    voice: 'Mantén presionada la masa y suelta cuando llegue a la zona verde del molde.',
    bottle: '🥣', color: '#f2d39b', vesselClass: 'jar', zone: [0.5, 0.8],
    hint: '¡Un poquito más de masa! 🥣', spill: '¡Uy, se desbordó el molde! 💦'
  }),
  makeBake({
    text: '🔔 ¡Toca cuando suene!',
    voice: 'Espera a que suene el timbre y saca la torta del horno.',
    tray: '<span class="bake-emoji">🎂</span>',
    burnt: '¡Uy, se quemó la torta! 💨'
  }),
  makeHoldPour({
    text: '🍦 ¡Mantén presionado!',
    voice: 'Mantén presionada la crema y suelta cuando llegue a la zona verde.',
    bottle: '🍦', color: '#ffb6d5', vesselClass: 'jar', zone: [0.45, 0.8],
    hint: '¡Un poquito más de crema! 🍦', spill: '¡Uy, mucha crema! 💦'
  }),
  makeDecorate({ base: 'cake' }),
  makeCandleCount(),
  makeBlowCandles()
];

/* =========================================================
   SOPA DE TOMATE 🍅
   ========================================================= */
const TOMATO_STEPS = [
  makeWash({ veg: ['🍅', '🧅', '🧄'], voice: 'Pasa tu dedo por los tomates, la cebolla y el ajo para quitar la suciedad.' }),
  makeSwipeCut({
    tiles: [{ e: '🍅', ok: true }, { e: '🧅', ok: true }, { e: '👟', ok: false }, { e: '🧄', ok: true }],
    voice: 'Corta los ingredientes.', trapMsg: '¡No cortes el zapato! 👟'
  }),
  makeIngredients({
    text: '🍅 🧅 🧄 🫒  ¡A la olla!',
    voice: 'Toca los tomates, la cebolla, el ajo y el aceite para echarlos a la olla. ¡El chocolate no!',
    container: 'pot', fillColor: '#e8553f',
    items: [
      { k: 'a', e: '🍅', l: 'tomates', ok: true, bg: '#ffe3e3' },
      { k: 'b', e: '🍫', l: 'chocolate', ok: false, bg: '#f1e3dc', msg: '¡El chocolate no va en la sopa! 🍫' },
      { k: 'c', e: '🧅', l: 'cebolla', ok: true, bg: '#f7e8f3' },
      { k: 'd', e: '🧄', l: 'ajo', ok: true, bg: '#f4f1e8' },
      { k: 'e', e: '🫒', l: 'aceite', ok: true, bg: '#eaf3d3' }
    ]
  }),
  makeBubbles({ voice: 'Toca las burbujas de la sopa de tomate para reventarlas. ¡Las burbujas de fuego no!' }),
  makeMix({
    text: '🥄 ¡Gira para revolver!',
    voice: 'Gira tu dedo dentro de la olla para revolver la sopa de tomate.',
    bowlClass: 'pot-round', spill: '¡Uy, salpica la sopa! 💦',
    inner: '<div class="mixinner soupmix"><span>🍅</span><span>🧅</span><span>🍅</span><span>🧄</span><span>🍅</span></div>',
    spinSel: '.mixinner', spoon: '🥄', laps: 3
  }),
  SOUP_STEPS[4],                                                // la sal (exacta)
  makeBlow({ food: '🍅', eat: '🥄', voice: 'La sopa de tomate está muy caliente. Sopla hacia el celular para enfriarla y luego toca la cuchara.' })
];

/* =========================================================
   PIMIENTOS RELLENOS 🫑
   ========================================================= */
const PEPPER_STEPS = [
  makeWash({ veg: ['🫑', '🍅', '🧅'], voice: 'Pasa tu dedo por los pimientos, el tomate y la cebolla para quitar la suciedad.' }),
  makeSwipeCut({
    tiles: [{ e: '🧅', ok: true }, { e: '🍅', ok: true }, { e: '🧦', ok: false }, { e: '🫑', ok: true }],
    voice: 'Corta los ingredientes.', trapMsg: '¡No cortes el calcetín! 🧦'
  }),
  makeIngredients({
    text: '🍚 🍅 🧅 🧀  ¡Al tazón!',
    voice: 'Toca el arroz, el tomate, la cebolla y el queso para echarlos al tazón. ¡El osito no!',
    container: 'bowl', fillColor: '#f4e2b8',
    items: [
      { k: 'a', e: '🍚', l: 'arroz', ok: true, bg: '#f7f3ea' },
      { k: 'b', e: '🧸', l: 'osito', ok: false, bg: '#f4e3d3', msg: '¡El osito no va en el relleno! 🧸' },
      { k: 'c', e: '🍅', l: 'tomate', ok: true, bg: '#ffe3e3' },
      { k: 'd', e: '🧅', l: 'cebolla', ok: true, bg: '#f7e8f3' },
      { k: 'e', e: '🧀', l: 'queso', ok: true, bg: '#fff7c9' }
    ]
  }),
  makeMix({
    text: '🥄 ¡Gira para mezclar!',
    voice: 'Gira tu dedo dentro del tazón para mezclar el relleno.',
    bowlClass: '', spill: '¡Uy, se sale el relleno! 💦',
    inner: '<div class="mixinner salad"><span>🍚</span><span>🍅</span><span>🧅</span><span>🧀</span><span>🍚</span></div>',
    spinSel: '.mixinner', spoon: '🥄', laps: 3
  }),
  makeStuff({
    text: '🫑 ¡Rellena cada pimiento!',
    voice: 'Toca cada pimiento las veces que dice el número para rellenarlo. ¡Ni más ni menos!'
  }),
  makeBake({
    text: '🔔 ¡Toca cuando suene!',
    voice: 'Espera a que suene el timbre y saca los pimientos del horno.',
    tray: '<span class="bake-emoji">🫑</span><span class="bake-emoji">🫑</span>',
    burnt: '¡Uy, se quemaron un poquito! 💨'
  }),
  makeBlow({ food: '🫑', eat: '🍴', voice: 'Los pimientos están muy calientes. Sopla hacia el celular para enfriarlos y luego toca el tenedor.' })
];

/* =========================================================
   6 RECETAS MAS
   ========================================================= */
const ing = (t, v, container, fill, items) => makeIngredients({ text: t, voice: v, container, fillColor: fill, items });
const IT = (e, l, bg, ok = true, msg) => ({ k: l, e, l, ok, bg, msg });

/* --- Sandwich 🥪 --- */
const SANDWICH_STEPS = [
  makeWash({ veg: ['🥬', '🍅', '🥒'], voice: 'Pasa tu dedo por la lechuga, el tomate y el pepino para quitar la suciedad.' }),
  makeSwipeCut({
    tiles: [{ e: '🍅', ok: true }, { e: '🥒', ok: true }, { e: '🧦', ok: false }, { e: '🧀', ok: true }],
    voice: 'Corta los ingredientes.', trapMsg: '¡No cortes el calcetín! 🧦'
  }),
  makeHoldPour({
    text: '🫙 ¡Mantén presionado!',
    voice: 'Mantén presionada la mayonesa y suelta cuando llegue a la zona verde.',
    bottle: '🫙', color: '#fff2b0', vesselClass: 'jar', zone: [0.4, 0.75],
    hint: '¡Un poquito más de mayonesa! 🫙', spill: '¡Uy, mucha mayonesa! 💦'
  }),
  makeStack({
    text: '🍞 🧀 🥓 🥬 🍞  ¡Arma el sándwich!',
    voice: 'Elige los ingredientes en orden.',
    order: [{ e: '🍞', c: '#f0b45c' }, { e: '🧀', c: '#ffd24d' }, { e: '🥓', c: '#e8838a' }, { e: '🥬', c: '#8ad46a' }, { e: '🍞', c: '#f0b45c' }],
    buttons: [{ e: '🍞', bg: '#fff3d6' }, { e: '🧀', bg: '#fff7c9' }, { e: '🥓', bg: '#ffe3e3' }, { e: '🥬', bg: '#e3f4dc' }, { e: '🧦', bg: '#e5eaff', msg: '¡El calcetín no va en el sándwich! 🧦' }],
    orderHard: [{ e: '🍞', c: '#f0b45c' }, { e: '🧀', c: '#ffd24d' }, { e: '🥓', c: '#e8838a' }, { e: '🍅', c: '#ee5a4a' }, { e: '🥒', c: '#9bd56a' }, { e: '🥬', c: '#8ad46a' }, { e: '🍞', c: '#f0b45c' }],
    buttonsHard: [{ e: '🍞', bg: '#fff3d6' }, { e: '🧀', bg: '#fff7c9' }, { e: '🥓', bg: '#ffe3e3' }, { e: '🍅', bg: '#ffe3e3' }, { e: '🥒', bg: '#e8f6dc' }, { e: '🥬', bg: '#e3f4dc' }, { e: '🧦', bg: '#e5eaff', msg: '¡El calcetín no va en el sándwich! 🧦' }]
  }),
  makeBake({
    text: '🔔 ¡Toca cuando suene!', voice: 'Espera a que suene el timbre y saca el sándwich tostado.',
    tray: '<span class="bake-emoji">🥪</span>', burnt: '¡Uy, se quemó el pan! 💨'
  })
];

/* --- Tacos 🌮 --- */
const TACO_STEPS = [
  makeWash({ veg: ['🍅', '🥬', '🧅'], voice: 'Pasa tu dedo por el tomate, la lechuga y la cebolla para quitar la suciedad.' }),
  makeSwipeCut({
    tiles: [{ e: '🍅', ok: true }, { e: '🧅', ok: true }, { e: '👟', ok: false }, { e: '🥑', ok: true }],
    voice: 'Corta los ingredientes.', trapMsg: '¡No cortes el zapato! 👟'
  }),
  ing('🥑 🍋 🧂  ¡Guacamole!', 'Toca el aguacate, el limón y la sal para echarlos al tazón. ¡El osito no!', 'bowl', '#b9d86a',
    [IT('🥑', 'aguacate', '#e8f3d3'), IT('🧸', 'osito', '#f4e3d3', false, '¡El osito no va en el guacamole! 🧸'), IT('🍋', 'limón', '#fff7c9'), IT('🧂', 'sal', '#eef2f5')]),
  makeMash({ text: '🥑 ¡Machaca el aguacate!', voice: 'Toca el aguacate muchas veces para machacarlo y hacer guacamole.', e: '🥑', done: '🥣' }),
  makeStack({
    text: '🫓 🥩 🥬 🍅 🧀  ¡Arma el taco!',
    voice: 'Elige los ingredientes en orden.',
    order: [{ e: '🫓', c: '#f3d9a4' }, { e: '🥩', c: '#b3593a' }, { e: '🥬', c: '#8ad46a' }, { e: '🍅', c: '#ee5a4a' }, { e: '🧀', c: '#ffd24d' }],
    buttons: [{ e: '🫓', bg: '#fff3d6' }, { e: '🥩', bg: '#ffe3de' }, { e: '🥬', bg: '#e3f4dc' }, { e: '🍅', bg: '#ffe3e3' }, { e: '🧀', bg: '#fff7c9' }, { e: '🧦', bg: '#e5eaff', msg: '¡El calcetín no va en el taco! 🧦' }],
    orderHard: [{ e: '🫓', c: '#f3d9a4' }, { e: '🥩', c: '#b3593a' }, { e: '🥑', c: '#a8d070' }, { e: '🥬', c: '#8ad46a' }, { e: '🍅', c: '#ee5a4a' }, { e: '🧅', c: '#e9d2ee' }, { e: '🧀', c: '#ffd24d' }],
    buttonsHard: [{ e: '🫓', bg: '#fff3d6' }, { e: '🥩', bg: '#ffe3de' }, { e: '🥑', bg: '#e8f3d3' }, { e: '🥬', bg: '#e3f4dc' }, { e: '🍅', bg: '#ffe3e3' }, { e: '🧅', bg: '#f7e8f3' }, { e: '🧀', bg: '#fff7c9' }, { e: '🧦', bg: '#e5eaff', msg: '¡El calcetín no va en el taco! 🧦' }]
  }),
  makeBake({
    text: '🔔 ¡Toca cuando suene!', voice: 'Espera a que suene el timbre y saca los tacos calientes.',
    tray: '<span class="bake-emoji">🌮</span><span class="bake-emoji">🌮</span>', burnt: '¡Uy, se quemó la tortilla! 💨'
  })
];

/* --- Batido de frutas 🥤 --- */
const SMOOTHIE_STEPS = [
  ing('🍓 🍌 🥛 🧊  ¡A la licuadora!', 'Toca la fresa, el plátano, la leche y el hielo para echarlos a la licuadora. ¡El calcetín no!', 'bowl', '#ffb3c7',
    [IT('🍓', 'fresa', '#ffe3e3'), IT('🧦', 'calcetín', '#e5eaff', false, '¡El calcetín no va en el batido! 🧦'), IT('🍌', 'plátano', '#fff7c9'), IT('🥛', 'leche', '#eef6ff'), IT('🧊', 'hielo', '#e3f2ff')]),
  makeMix({
    text: '🌀 ¡Licúa!', voice: 'Gira tu dedo dentro de la licuadora para licuar el batido.',
    bowlClass: 'pot-round', spill: '¡Uy, salpica el batido! 💦',
    inner: '<div class="mixinner soupmix"><span>🍓</span><span>🍌</span><span>🥛</span><span>🍓</span><span>🧊</span></div>',
    spinSel: '.mixinner', spoon: '🌀', laps: 3
  }),
  makeHoldPour({
    text: '🫗 ¡Mantén presionado!', voice: 'Mantén presionada la jarra y suelta cuando el batido llegue a la zona verde del vaso.',
    bottle: '🫗', color: '#ff9fb8', vesselClass: 'jar', zone: [0.5, 0.82],
    hint: '¡Un poquito más de batido! 🥤', spill: '¡Uy, se derramó el batido! 💦'
  }),
  ing('🍓 🍒 🍋  ¡A decorar!', 'Toca la fresa, la cereza y el limón para decorar tu vaso. ¡La cebolla no!', 'bowl', '#ffc2dc',
    [IT('🍓', 'fresa', '#ffe3e3'), IT('🧅', 'cebolla', '#f7e8f3', false, '¡La cebolla no va en el batido! 🧅'), IT('🍒', 'cereza', '#ffe0e6'), IT('🍋', 'limón', '#fff7c9')])
];

/* --- Palomitas 🍿 --- */
const POPCORN_STEPS = [
  ing('🌽 🫒 🧂  ¡A la olla!', 'Toca el maíz, el aceite y la sal para echarlos a la olla. ¡El calcetín no!', 'pot', '#f7d96a',
    [IT('🌽', 'maíz', '#fff3c4'), IT('🧦', 'calcetín', '#e5eaff', false, '¡El calcetín no va en la olla! 🧦'), IT('🫒', 'aceite', '#eaf3d3'), IT('🧂', 'sal', '#eef2f5')]),
  makeBake({
    text: '🔔 ¡Toca cuando suene!', voice: 'Espera a que suene el timbre y destapa la olla para que empiecen a saltar.',
    tray: '<span class="bake-emoji">🌽</span>', burnt: '¡Uy, se quemó el maíz! 💨'
  }),
  makeBubbles({ text: '🍿 ¡Atrapa las palomitas!', emoji: '🍿', voice: 'Toca las palomitas que saltan para atraparlas. ¡Las de fuego no!' }),
  makeHoldPour({
    text: '🧈 ¡Mantén presionado!', voice: 'Mantén presionada la mantequilla derretida y suelta cuando llegue a la zona verde.',
    bottle: '🧈', color: '#ffe066', vesselClass: 'jar', zone: [0.4, 0.75],
    hint: '¡Un poquito más de mantequilla! 🧈', spill: '¡Uy, mucha mantequilla! 💦'
  }),
  makeBlow({ food: '🍿', eat: '👄', voice: 'Las palomitas están muy calientes. Sopla hacia el celular para enfriarlas y luego toca la boquita.' })
];

/* --- Tortilla de huevo 🍳 --- */
const OMELETTE_STEPS = [
  COOKIE_STEPS[1],                                              // cascar huevos
  makeMix({
    text: '🥣 ¡Bate con el batidor!', voice: 'Gira tu dedo dentro del tazón para batir los huevos con el batidor.',
    bowlClass: '', spill: '¡Uy, se salen los huevos! 💦',
    inner: '<div class="mixinner salad"><span>🥚</span><span>🥚</span><span>🥚</span><span>🥚</span><span>🥚</span></div>',
    spinSel: '.mixinner', spoon: WHISK, laps: 3
  }),
  ing('🧀 🍅 🫑  ¡Al relleno!', 'Toca el queso, el tomate y el pimiento para echarlos al tazón. ¡El osito no!', 'bowl', '#ffe38a',
    [IT('🧀', 'queso', '#fff7c9'), IT('🧸', 'osito', '#f4e3d3', false, '¡El osito no va en la tortilla! 🧸'), IT('🍅', 'tomate', '#ffe3e3'), IT('🫑', 'pimiento', '#e3f4dc')]),
  makeHoldPour({
    text: '🥣 ¡Mantén presionado!', voice: 'Mantén presionado el tazón y suelta cuando los huevos lleguen a la zona verde de la sartén.',
    bottle: '🥣', color: '#ffe38a', vesselClass: 'jar', zone: [0.45, 0.8],
    hint: '¡Un poquito más de huevo! 🥣', spill: '¡Uy, se derramó el huevo! 💦'
  }),
  makeFlip({ text: '🍳 ¡Desliza hacia arriba!', voice: 'Cuando la tortilla esté dorada, desliza tu dedo hacia arriba para voltearla.', flips: undefined }),
  makeBlow({ food: '🍳', eat: '🍴', voice: 'La tortilla está muy caliente. Sopla hacia el celular para enfriarla y luego toca el tenedor.' })
];

/* --- Helado 🍨 --- */
const ICECREAM_STEPS = [
  ing('🥛 🧂 🍓  ¡A la heladera!', 'Toca la leche, el azúcar y las fresas para echarlos a la heladera. ¡La cebolla no!', 'bowl', '#ffd1df',
    [IT('🥛', 'leche', '#eef6ff'), IT('🧅', 'cebolla', '#f7e8f3', false, '¡La cebolla no va en el helado! 🧅'), IT('🧂', 'azúcar', '#ffe3ee'), IT('🍓', 'fresas', '#ffe3e3')]),
  makeMix({
    text: '🥣 ¡Bate con el batidor!', voice: 'Gira tu dedo dentro de la heladera para batir la mezcla con el batidor.',
    bowlClass: '', spill: '¡Uy, se sale la mezcla! 💦',
    inner: '<div class="mixinner salad"><span>🥛</span><span>🍓</span><span>🥛</span><span>🍓</span><span>🥛</span></div>',
    spinSel: '.mixinner', spoon: WHISK, laps: 3
  }),
  makeBake({
    text: '❄️ ¡Toca cuando suene!', voice: 'Espera a que suene el timbre y saca el helado del congelador.',
    tray: '<span class="bake-emoji">🧊</span>', burnt: '¡Uy, se congeló demasiado! 🧊'
  }),
  makeStack({
    text: '🍓 🍫 🍦  ¡Pon las bolas!',
    voice: 'Elige los ingredientes en orden.',
    order: [{ e: '🍓', c: '#ffb3c7' }, { e: '🍫', c: '#8a5a3c' }, { e: '🍦', c: '#fff3d6' }],
    buttons: [{ e: '🍓', bg: '#ffe3e3' }, { e: '🍫', bg: '#f1e3dc' }, { e: '🍦', bg: '#fff7e6' }, { e: '🧦', bg: '#e5eaff', msg: '¡El calcetín no es un sabor de helado! 🧦' }],
    orderHard: [{ e: '🍓', c: '#ffb3c7' }, { e: '🍫', c: '#8a5a3c' }, { e: '🍦', c: '#fff3d6' }, { e: '🍋', c: '#fff08a' }, { e: '🍌', c: '#ffe27a' }],
    buttonsHard: [{ e: '🍓', bg: '#ffe3e3' }, { e: '🍫', bg: '#f1e3dc' }, { e: '🍦', bg: '#fff7e6' }, { e: '🍋', bg: '#fff7c9' }, { e: '🍌', bg: '#fff3b0' }, { e: '🧦', bg: '#e5eaff', msg: '¡El calcetín no es un sabor de helado! 🧦' }]
  }),
  makeHoldPour({
    text: '🍫 ¡Mantén presionado!', voice: 'Mantén presionada la salsa de chocolate y suelta cuando llegue a la zona verde.',
    bottle: '🍫', color: '#6b3a22', vesselClass: 'jar', zone: [0.45, 0.8],
    hint: '¡Un poquito más de chocolate! 🍫', spill: '¡Uy, mucho chocolate! 💦'
  }),
  makeDecorate({ base: 'icecream', text: '🎨 ¡Decora tu helado!', voice: 'Elige crema, chocolate, fresas o lluvia de colores y decora tu helado como quieras. Cuando termines toca el visto.' })
];

// Memoria: ingredientes de cada receta (para el paso "memoriza", nivel 2 y 3)
const MEM = {
  cookies: ['🌾', '🧈', '🍫'], pizza: ['🍅', '🧀', '🍄'], salad: ['🥬', '🍅', '🥕'], soup: ['🥕', '🥔', '🧅'],
  pasta: ['🍝', '🧂', '🫒'], cocoa: ['🍫', '🥛', '🍯'], pancakes: ['🥚', '🥛', '🌾'], burger: ['🥩', '🧀', '🥬'],
  cupcakes: ['🥚', '🥛', '🌾'], cake: ['🌾', '🥚', '🧈'], tomato: ['🍅', '🧅', '🧄'], peppers: ['🫑', '🍚', '🧀'],
  sandwich: ['🍞', '🧀', '🥬'], tacos: ['🥩', '🍅', '🧀'], smoothie: ['🍓', '🍌', '🥛'], popcorn: ['🌽', '🫒', '🧂'], omelette: ['🥚', '🧀', '🍅'], icecream: ['🥛', '🍓', '🍫']
};
// Contar y calcular al final de cada receta (m = nombre masculino)
const COUNT = {
  cookies: { e: '🍪', what: 'galletas' }, pizza: { e: '🍕', what: 'porciones' }, salad: { e: '🍅', what: 'tomates', m: 1 },
  soup: { e: '🥕', what: 'zanahorias' }, pasta: { e: '🍅', what: 'tomates', m: 1 }, cocoa: { e: '☁️', what: 'malvaviscos', m: 1 },
  pancakes: { e: '🥞', what: 'panqueques', m: 1 }, burger: { e: '🍔', what: 'hamburguesas' }, cupcakes: { e: '🧁', what: 'cupcakes', m: 1 },
  cake: { e: '🍓', what: 'fresas' }, tomato: { e: '🍅', what: 'tomates', m: 1 }, peppers: { e: '🫑', what: 'pimientos', m: 1 },
  sandwich: { e: '🥪', what: 'sándwiches', m: 1 }, tacos: { e: '🌮', what: 'tacos', m: 1 }, smoothie: { e: '🥤', what: 'vasos', m: 1 },
  popcorn: { e: '🍿', what: 'bolsas de palomitas' }, omelette: { e: '🍳', what: 'huevos', m: 1 }, icecream: { e: '🍨', what: 'bolas de helado' }
};

/* =========================================================
   RECETAS DEL JUEGO
   ========================================================= */
const RECIPES = {
  cookies: {
    emoji: '🍪', name: 'Galletas', steps: COOKIE_STEPS,
    winTitle: '¡Galletas listas!', winVoice: '¡Galletas listas! ¡Qué ricas!',
    result(box) {
      KINDS.forEach((k) => {
        box.insertAdjacentHTML('beforeend', shapeSVG(k));
        addSprinkles(box.lastElementChild, k, pick(Object.values(TOPPINGS)), 16);
      });
    }
  },
  pizza: {
    emoji: '🍕', name: 'Pizza', steps: PIZZA_STEPS,
    winTitle: '¡Pizza lista!', winVoice: '¡Pizza lista! ¡Qué rica!',
    result(box) { ['🍕', '🧀', '🍄', '🍕'].forEach((e) => box.appendChild(el('span', 'win-emoji', e))); }
  },
  salad: {
    emoji: '🥗', name: 'Ensalada', steps: SALAD_STEPS,
    winTitle: '¡Ensalada lista!', winVoice: '¡Ensalada lista! ¡Qué fresca!',
    result(box) { ['🥗', '🥕', '🍅', '🥗'].forEach((e) => box.appendChild(el('span', 'win-emoji', e))); }
  },
  soup: {
    emoji: '🍲', name: 'Sopa', steps: SOUP_STEPS,
    winTitle: '¡Sopa lista!', winVoice: '¡Sopa lista! ¡Qué calentita!',
    result(box) { ['🍲', '🥕', '🥔', '🍲'].forEach((e) => box.appendChild(el('span', 'win-emoji', e))); }
  },
  pasta: {
    emoji: '🍝', name: 'Espagueti', steps: PASTA_STEPS,
    winTitle: '¡Espagueti listo!', winVoice: '¡Espagueti listo! ¡Qué rico!',
    result(box) { ['🍝', '🍅', '🧀', '🍝'].forEach((e) => box.appendChild(el('span', 'win-emoji', e))); }
  },
  cocoa: {
    emoji: '☕', name: 'Chocolate', steps: COCOA_STEPS,
    winTitle: '¡Chocolate listo!', winVoice: '¡Chocolate caliente listo! ¡Qué rico!',
    result(box) { ['☕', '🍫', '☁️', '☕'].forEach((e) => box.appendChild(el('span', 'win-emoji', e))); }
  },
  pancakes: {
    emoji: '🥞', name: 'Panqueques', steps: PANCAKE_STEPS,
    winTitle: '¡Panqueques listos!', winVoice: '¡Panqueques listos! ¡Qué ricos!',
    result(box) { ['🥞', '🍓', '🍯', '🥞'].forEach((e) => box.appendChild(el('span', 'win-emoji', e))); }
  },
  burger: {
    emoji: '🍔', name: 'Hamburguesa', steps: BURGER_STEPS,
    winTitle: '¡Hamburguesa lista!', winVoice: '¡Hamburguesa lista! ¡Qué rica!',
    result(box) { ['🍔', '🍟', '🥤', '🍔'].forEach((e) => box.appendChild(el('span', 'win-emoji', e))); }
  },
  tomato: {
    emoji: '🍅', name: 'Sopa de tomate', steps: TOMATO_STEPS,
    winTitle: '¡Sopa de tomate lista!', winVoice: '¡Sopa de tomate lista! ¡Qué rica!',
    result(box) { ['🍅', '🧅', '🧄', '🍅'].forEach((e) => box.appendChild(el('span', 'win-emoji', e))); }
  },
  peppers: {
    emoji: '🫑', name: 'Pimientos rellenos', steps: PEPPER_STEPS,
    winTitle: '¡Pimientos listos!', winVoice: '¡Pimientos rellenos listos! ¡Qué ricos!',
    result(box) { ['🫑', '🧀', '🍅', '🫑'].forEach((e) => box.appendChild(el('span', 'win-emoji', e))); }
  },
  sandwich: {
    emoji: '🥪', name: 'Sándwich', steps: SANDWICH_STEPS,
    winTitle: '¡Sándwich listo!', winVoice: '¡Sándwich listo! ¡Qué rico!',
    result(box) { ['🥪', '🧀', '🥬', '🥪'].forEach((e) => box.appendChild(el('span', 'win-emoji', e))); }
  },
  tacos: {
    emoji: '🌮', name: 'Tacos', steps: TACO_STEPS,
    winTitle: '¡Tacos listos!', winVoice: '¡Tacos listos! ¡Qué ricos!',
    result(box) { ['🌮', '🥑', '🍅', '🌮'].forEach((e) => box.appendChild(el('span', 'win-emoji', e))); }
  },
  smoothie: {
    emoji: '🥤', name: 'Batido de frutas', steps: SMOOTHIE_STEPS,
    winTitle: '¡Batido listo!', winVoice: '¡Batido de frutas listo! ¡Qué rico!',
    result(box) { ['🥤', '🍓', '🍌', '🥤'].forEach((e) => box.appendChild(el('span', 'win-emoji', e))); }
  },
  popcorn: {
    emoji: '🍿', name: 'Palomitas', steps: POPCORN_STEPS,
    winTitle: '¡Palomitas listas!', winVoice: '¡Palomitas listas! ¡Qué ricas!',
    result(box) { ['🍿', '🌽', '🧈', '🍿'].forEach((e) => box.appendChild(el('span', 'win-emoji', e))); }
  },
  omelette: {
    emoji: '🍳', name: 'Tortilla de huevo', steps: OMELETTE_STEPS,
    winTitle: '¡Tortilla lista!', winVoice: '¡Tortilla de huevo lista! ¡Qué rica!',
    result(box) { ['🍳', '🧀', '🍅', '🍳'].forEach((e) => box.appendChild(el('span', 'win-emoji', e))); }
  },
  icecream: {
    emoji: '🍨', name: 'Helado', steps: ICECREAM_STEPS,
    winTitle: '¡Helado listo!', winVoice: '¡Helado listo! ¡Qué rico!',
    result(box) { ['🍨', '🍓', '🍫', '🍨'].forEach((e) => box.appendChild(el('span', 'win-emoji', e))); }
  },
  cake: {
    emoji: '🎂', name: 'Torta', steps: CAKE_STEPS,
    winTitle: '¡Torta lista!', winVoice: '¡Torta lista! ¡Feliz cumpleaños!',
    result(box) { ['🎂', '🕯️', '🍓', '🎂'].forEach((e) => box.appendChild(el('span', 'win-emoji', e))); }
  },
  cupcakes: {
    emoji: '🧁', name: 'Cupcakes', steps: CUPCAKE_STEPS,
    winTitle: '¡Cupcakes listos!', winVoice: '¡Cupcakes listos! ¡Qué ricos!',
    result(box) { ['🧁', '🍓', '⭐', '🧁'].forEach((e) => box.appendChild(el('span', 'win-emoji', e))); }
  }
};

// Al final de cada receta: contar/calcular y presentar el plato; al principio (nivel 2 y 3): memorizar la receta
Object.keys(MEM).forEach((k) => {
  RECIPES[k].steps.push(makeCount(COUNT[k]));
  RECIPES[k].steps.push(makePresent({ emoji: RECIPES[k].emoji, useArt: k === 'cake' }));
  RECIPES[k].steps.unshift(makeMemory({ items: MEM[k] }));
});
