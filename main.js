/**
 * ═══════════════════════════════════════════════════════════
 *  BARCO & FARO — main.js
 *  Arquitectura: GameState + SceneRenderer + UI + ParticleSystem + Game
 *  Vanilla JS ES2020 · Sin dependencias externas
 * ═══════════════════════════════════════════════════════════
 */

'use strict';

// ── Helpers ───────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

// ── Game data ─────────────────────────────────────────────────────────────────

/** Ship X-positions as percentage of scene width, per step */
const SHIP_POSITIONS = ['18%', '29%', '40%', '51%', '62%', '74%', '84%'];

/**
 * Each step has:
 *  type      : 'story' | 'question'
 *  shipPos   : index into SHIP_POSITIONS
 *  chips     : array of chip IDs to show
 *  chipTVal  : value to display in time chip
 *  chipDVal  : value to display in distance chip
 *  chipSVal  : value to display in faro-distance chip
 *  narrator  : HTML string for the narrator bubble
 *  formula   : plain text for the formula hint (null if none)
 *  question  : question text (only for 'question' type)
 *  options   : [{text, correct}] (only for 'question' type)
 *  feedback_ok  : feedback when correct
 *  feedback_bad : feedback when wrong
 *  revealD   : chip-d value to reveal on correct answer
 *  revealS   : chip-s value to reveal on correct answer
 */
const STEPS = [
  // ── STEP 0: Story intro ──────────────────────────────────────────────────
  {
    type: 'story',
    shipPos: 0,
    chips: ['chip-v', 'chip-shore'],
    narrator: `Son las <strong>12:00 del mediodía</strong>. El barco acaba de pasar frente al faro y sigue su ruta. 🚢<br><br>
      Mira los datos que aparecen en pantalla — esa es toda la información que tienes.<br><br>
      Tu misión: usar esos datos para calcular <strong>a qué distancia estará el barco del faro</strong> en cualquier momento.<br><br>
      Necesitas dos funciones. La primera calcula cuánto ha recorrido el barco. La segunda usa ese resultado para hallar la distancia al faro. ¡Vamos!`,
    formula: null,
  },

  // ── STEP 1: Apply g(t) ──────────────────────────────────────────────────
  {
    type: 'question',
    shipPos: 1,
    chips: ['chip-v', 'chip-shore', 'chip-t'],
    chipTVal: '1 hora',
    narrator: `El barco lleva <strong>1 hora navegando</strong> desde el mediodía. Mira los datos arriba en pantalla.<br><br>
      La <strong>primera función g(t)</strong> usa la velocidad y el tiempo para darte la distancia recorrida:`,
    formula: 'g(t) = velocidad × tiempo = 20 × t',
    question: 'Con los datos de la pantalla (t = 1 hora), ¿cuántas millas ha recorrido el barco a lo largo de la orilla? Halla g(1).',
    options: [
      { text: 'g(1) = 5 millas',  correct: false },
      { text: 'g(1) = 20 millas', correct: true  },
      { text: 'g(1) = 15 millas', correct: false },
      { text: 'g(1) = 25 millas', correct: false },
    ],
    feedback_ok:  '✅ ¡Exacto! g(1) = 20 × 1 = 20 millas. Ese resultado (d = 20) lo usaremos ahora en la segunda función.',
    feedback_bad: '❌ g(t) = 20 × t. Con t = 1 → g(1) = 20 × 1 = 20 millas.',
    revealD: '20 mi',
  },

  // ── STEP 2: Pythagorean theorem ──────────────────────────────────────────
  {
    type: 'question',
    shipPos: 2,
    chips: ['chip-v', 'chip-shore', 'chip-t'],
    chipTVal: '1 hora',
    narrator: `Bien. Ya sabemos que <strong>d = 20 millas</strong> — esa es la distancia horizontal recorrida.<br><br>
      Pero el faro no está en la orilla directamente — está a <strong>5 millas perpendiculares</strong>. El barco, el faro y el punto de la orilla forman un <strong>triángulo rectángulo</strong> 📐<br><br>
      Los dos catetos son: <em>5 millas</em> (perpendicular) y <em>d millas</em> (recorrido). La distancia al faro es la hipotenusa.`,
    formula: null,
    question: '¿Qué fórmula usamos para hallar la hipotenusa s de ese triángulo rectángulo?',
    options: [
      { text: 's = 5 + d',                       correct: false },
      { text: 's² = 5² + d²  →  s = √(25 + d²)', correct: true  },
      { text: 's = 5 × d',                        correct: false },
      { text: 's = d − 5',                        correct: false },
    ],
    feedback_ok:  '✅ ¡Perfecto! Teorema de Pitágoras: s² = 5² + d², entonces s = √(25 + d²). Esa es exactamente nuestra función f(d).',
    feedback_bad: '❌ Tenemos un triángulo rectángulo con catetos 5 y d. Por Pitágoras: s² = 5² + d² → s = √(25 + d²).',
  },

  // ── STEP 3: Apply f(d) ──────────────────────────────────────────────────
  {
    type: 'question',
    shipPos: 3,
    chips: ['chip-v', 'chip-shore', 'chip-t', 'chip-d'],
    chipTVal: '1 hora',
    chipDVal: '20 mi',
    narrator: `Ahora aplica la <strong>segunda función f(d)</strong>. Ya sabes que <strong>d = 20 millas</strong> (calculado con g). Eso es exactamente lo que va dentro de f:`,
    formula: 'f(d) = √(25 + d²)\nf(20) = √(25 + 20²) = √(25 + 400) = √425 = ?',
    question: 'Aplica f(20). ¿A cuántas millas está el barco del faro después de 1 hora?',
    options: [
      { text: 'f(20) ≈ 15.3 millas', correct: false },
      { text: 'f(20) ≈ 20.6 millas', correct: true  },
      { text: 'f(20) = 400 millas',  correct: false },
      { text: 'f(20) = 25 millas',   correct: false },
    ],
    feedback_ok:  '✅ ¡Correcto! f(20) = √425 ≈ 20.6 millas. Completaste los dos pasos — eso es la composición: g primero, luego f con el resultado de g.',
    feedback_bad: '❌ f(20) = √(25 + 20²) = √(25 + 400) = √425 ≈ 20.6 millas.',
    revealS: '≈ 20.6 mi',
  },

  // ── STEP 4: Full composition f∘g ────────────────────────────────────────
  {
    type: 'question',
    shipPos: 4,
    chips: ['chip-v', 'chip-shore', 'chip-t', 'chip-d'],
    chipTVal: '2 horas',
    chipDVal: '?',
    narrator: `Ahora pasaron <strong>2 horas</strong>. Esta vez usemos la función compuesta completa para hacer los dos pasos en uno solo:<br><br>
      Sustituimos g(t) directo dentro de f(d):`,
    formula: '(f∘g)(t) = f(g(t)) = f(20t) = √(25 + (20t)²)\n(f∘g)(2) = √(25 + (20×2)²) = √(25 + 40²) = ?',
    question: 'Con t = 2 horas y los datos de la pantalla, ¿cuánto da (f∘g)(2)?',
    options: [
      { text: '√(25 + 4) ≈ 5.4 millas',      correct: false },
      { text: '20 × 2 = 40 millas',            correct: false },
      { text: '√(25 + 1600) = √1625 ≈ 40.3 millas', correct: true  },
      { text: '√(25 + 400) ≈ 20.6 millas',    correct: false },
    ],
    feedback_ok:  '✅ ¡Excelente! (f∘g)(2) = √(25 + 40²) = √1625 ≈ 40.3 millas. Un solo paso de tiempo a distancia al faro. ¡Eso es la composición de funciones!',
    feedback_bad: '❌ (f∘g)(2) = f(g(2)) = f(40) = √(25 + 40²) = √(25 + 1600) = √1625 ≈ 40.3 millas.',
    revealD: '40 mi',
    revealS: '≈ 40.3 mi',
  },

  // ── STEP 5: Conceptual understanding ────────────────────────────────────
  {
    type: 'question',
    shipPos: 5,
    chips: ['chip-v', 'chip-shore', 'chip-t', 'chip-d', 'chip-s'],
    chipTVal: '2 horas',
    chipDVal: '40 mi',
    chipSVal: '≈ 40.3 mi',
    narrator: `¡Lo lograste! Mira los datos en pantalla — ya tienes todo calculado. 🌊<br><br>
      La función compuesta <strong>(f∘g)(t) = √(25 + (20t)²)</strong> te permite calcular la distancia al faro para <strong>cualquier tiempo t</strong> con un solo paso.`,
    formula: null,
    question: '¿Qué representa (f∘g)(t) en este problema del barco?',
    options: [
      { text: 'La velocidad del barco en el tiempo t',            correct: false },
      { text: 'Las millas recorridas a lo largo de la orilla',    correct: false },
      { text: 'La distancia directa entre el barco y el faro en el tiempo t', correct: true  },
      { text: 'El tiempo que tarda el barco en llegar al faro',   correct: false },
    ],
    feedback_ok:  '✅ ¡Perfecto! (f∘g)(t) nos da la distancia directa barco-faro en cualquier momento t. Encadenamos g (tiempo→distancia recorrida) y f (distancia recorrida→distancia al faro). ¡Misión completada, capitán!',
    feedback_bad: '❌ (f∘g)(t) combina tiempo → distancia recorrida → distancia al faro. Nos da la distancia directa barco-faro.',
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// ParticleSystem — manages floating emoji particles
// ═════════════════════════════════════════════════════════════════════════════
class ParticleSystem {
  /** @param {HTMLElement} container */
  constructor(container) {
    this.container = container;
  }

  /**
   * Spawn `count` emoji particles, staggered by 110ms each.
   * @param {string} emoji
   * @param {number} count
   */
  spawn(emoji, count) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => this._create(emoji), i * 110);
    }
  }

  _create(emoji) {
    const el = document.createElement('div');
    el.className = 'particle';
    el.textContent = emoji;
    el.style.left = (10 + Math.random() * 80) + 'vw';
    el.style.top  = (35 + Math.random() * 45) + 'vh';
    el.style.setProperty('--dur', (1.2 + Math.random() * 0.7) + 's');
    this.container.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// SceneRenderer — handles the ocean scene SVG + ship + stars
// ═════════════════════════════════════════════════════════════════════════════
class SceneRenderer {
  constructor() {
    this.svg      = $('sceneSvg');
    this.ship     = $('ship');
    this.starsLayer = $('starsLayer');
    this._generateStars(38);
  }

  /** Procedurally generate star elements */
  _generateStars(count) {
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left   = (Math.random() * 100) + '%';
      star.style.top    = (Math.random() * 64)  + '%';
      const size = 1 + Math.random() * 2;
      star.style.width  = size + 'px';
      star.style.height = size + 'px';
      star.style.setProperty('--delay', (Math.random() * 4) + 's');
      star.style.setProperty('--dur',   (2 + Math.random() * 3) + 's');
      this.starsLayer.appendChild(star);
    }
  }

  /**
   * Move the ship to a given position index.
   * @param {number} posIndex
   * @param {boolean} [animate=true]
   */
  moveShip(posIndex, animate = true) {
    this.ship.style.transition = animate
      ? 'left 1.9s cubic-bezier(0.45, 0, 0.55, 1)'
      : 'none';
    this.ship.style.left = SHIP_POSITIONS[clamp(posIndex, 0, SHIP_POSITIONS.length - 1)];
  }

  /**
   * Draw SVG guide lines based on the current step.
   * Uses getBoundingClientRect for pixel-accurate positioning.
   * @param {object} step
   */
  drawLines(step) {
    const scene   = $('oceanScene');
    const beacon  = $('lhBeacon');
    const sceneR  = scene.getBoundingClientRect();
    const beaconR = beacon.getBoundingClientRect();

    const W = scene.offsetWidth;
    const H = scene.offsetHeight;

    // Lighthouse beacon center in scene-local coordinates
    const lhX     = beaconR.left - sceneR.left + beaconR.width  / 2;
    const beaconY = beaconR.top  - sceneR.top  + beaconR.height / 2;
    const shoreY  = H - 74; // approximate shore line Y

    // Ship center in scene-local coordinates
    const shipR = this.ship.getBoundingClientRect();
    const shipX = shipR.left - sceneR.left + shipR.width  / 2;
    const shipY = shipR.top  - sceneR.top  + shipR.height / 2;

    let svg = '';

    // Vertical dashed line: perpendicular distance (5 mi)
    svg += `
      <line
        x1="${lhX}" y1="${beaconY + 10}"
        x2="${lhX}" y2="${shoreY}"
        stroke="rgba(255,255,255,0.22)" stroke-width="1.5"
        stroke-dasharray="5,3" stroke-linecap="round"/>
      <text
        x="${lhX + 7}" y="${(beaconY + 10 + shoreY) / 2 + 4}"
        fill="rgba(255,255,255,0.42)" font-size="10"
        font-family="Space Mono,monospace">5mi</text>
    `;

    // Horizontal teal line: d (distance along shore) — shown from step 1 onward
    if (step.shipPos >= 1) {
      svg += `
        <line
          x1="${lhX}" y1="${shoreY}"
          x2="${shipX}" y2="${shoreY}"
          stroke="#06d6a0" stroke-width="2"
          stroke-dasharray="8,5" opacity="0.82" stroke-linecap="round"/>
        <circle cx="${lhX}"   cy="${shoreY}" r="3.5" fill="#06d6a0" opacity="0.85"/>
        <circle cx="${shipX}" cy="${shoreY}" r="3.5" fill="#06d6a0" opacity="0.85"/>
        <text
          x="${(lhX + shipX) / 2}" y="${shoreY + 16}"
          fill="#06d6a0" font-size="11" text-anchor="middle"
          font-family="Space Mono,monospace" font-weight="700">d</text>
      `;
    }

    // Diagonal orange line: s (direct distance to lighthouse) — shown from step 3 onward
    if (step.shipPos >= 3) {
      svg += `
        <line
          x1="${lhX}" y1="${beaconY + 10}"
          x2="${shipX}" y2="${shipY}"
          stroke="#f4845f" stroke-width="2"
          stroke-dasharray="8,5" opacity="0.90" stroke-linecap="round"/>
        <text
          x="${(lhX + shipX) / 2 - 12}" y="${(beaconY + 10 + shipY) / 2 - 8}"
          fill="#f4845f" font-size="11"
          font-family="Space Mono,monospace" font-weight="700">s</text>
      `;
    }

    this.svg.innerHTML = svg;
  }

  /** Redraw lines for current step (called on window resize) */
  redrawLines(step) {
    this.drawLines(step);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// UI — all DOM read/write operations
// ═════════════════════════════════════════════════════════════════════════════
class UI {
  constructor() {
    // Screen references
    this.screens = {
      theory: $('s-theory'),
      game:   $('s-game'),
      win:    $('s-win'),
    };
    // Game screen element refs
    this.el = {
      narMsg:       $('narMsg'),
      formulaHint:  $('formulaHint'),
      questionBox:  $('questionBox'),
      questionText: $('questionText'),
      optionsGrid:  $('optionsGrid'),
      feedback:     $('feedback'),
      btnNext:      $('btnNext'),
      progressSteps:$('progressSteps'),
      scoreVal:     $('scoreVal'),
      finalScore:   $('finalScore'),
      chipTVal:     $('chip-t-val'),
      chipDVal:     $('chip-d-val'),
      chipSVal:     $('chip-s-val'),
    };
  }

  // ── Screen management ────────────────────────────────────────────────────

  /**
   * Show a screen by name, hiding all others.
   * @param {'theory'|'game'|'win'} name
   */
  showScreen(name) {
    const displayMap = { theory: 'block', game: 'flex', win: 'flex' };
    const activeClass = { theory: 'screen--active', game: 'screen--active-flex', win: 'screen--active-flex' };

    Object.entries(this.screens).forEach(([key, el]) => {
      el.style.display = 'none';
      el.classList.remove('screen--active', 'screen--active-flex');
    });

    const target = this.screens[name];
    target.style.display = displayMap[name];
    // Force reflow so animation restarts
    target.offsetHeight;
    target.classList.add(activeClass[name]);
    window.scrollTo(0, 0);
  }

  // ── Progress ─────────────────────────────────────────────────────────────

  /**
   * Render step-dot progress bar.
   * @param {number} current  1-based current step index
   * @param {number} total    total step count
   */
  renderProgress(current, total) {
    const container = this.el.progressSteps;
    container.innerHTML = '';
    container.setAttribute('aria-valuenow', current);
    container.setAttribute('aria-valuemin', 1);
    container.setAttribute('aria-valuemax', total);

    for (let i = 1; i <= total; i++) {
      const dot = document.createElement('div');
      dot.className = 'progress-dot';
      if (i < current)  dot.classList.add('progress-dot--done');
      if (i === current) dot.classList.add('progress-dot--active');
      container.appendChild(dot);
    }
  }

  // ── Score ────────────────────────────────────────────────────────────────

  /**
   * Animate score counter from `from` to `to`.
   * @param {number} from
   * @param {number} to
   */
  animateScore(from, to) {
    const el = this.el.scoreVal;
    const duration = 650;
    const start = performance.now();

    const tick = now => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3); // cubic ease-out
      el.textContent = Math.round(from + (to - from) * ease);
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  setFinalScore(score) {
    this.el.finalScore.textContent = `${score} pts`;
  }

  // ── HUD chips ────────────────────────────────────────────────────────────

  /**
   * Hide all chips, update chip values, then reveal listed chips with stagger.
   * @param {string[]} chipIds   - IDs to show
   * @param {{t?:string, d?:string, s?:string}} values
   */
  showChips(chipIds, values = {}) {
    const ALL_CHIPS = ['chip-v', 'chip-shore', 'chip-t', 'chip-d', 'chip-s'];
    ALL_CHIPS.forEach(id => $(id)?.classList.remove('hud-chip--visible'));

    // Update dynamic values
    if (values.t) this.el.chipTVal.textContent = values.t;
    if (values.d) this.el.chipDVal.textContent = values.d;
    if (values.s) this.el.chipSVal.textContent = values.s;

    chipIds.forEach((id, i) => {
      setTimeout(() => $(id)?.classList.add('hud-chip--visible'), i * 155);
    });
  }

  /**
   * Reveal a single chip with an updated value.
   * @param {'chip-d'|'chip-s'} id
   * @param {string|null} value
   */
  revealChip(id, value) {
    if (id === 'chip-d' && value) this.el.chipDVal.textContent = value;
    if (id === 'chip-s' && value) this.el.chipSVal.textContent = value;
    $(id)?.classList.add('hud-chip--visible');
  }

  // ── Narrator & formula ───────────────────────────────────────────────────

  /**
   * @param {string} html     - innerHTML for narrator message
   * @param {string|null} formula - plain text for formula hint
   */
  renderNarrator(html, formula) {
    this.el.narMsg.innerHTML = html;

    if (formula) {
      this.el.formulaHint.hidden = false;
      this.el.formulaHint.innerHTML = formula.replace(/\n/g, '<br>');
    } else {
      this.el.formulaHint.hidden = true;
    }
  }

  // ── Question ─────────────────────────────────────────────────────────────

  /** @param {string|null} text */
  renderQuestion(text) {
    this.el.questionBox.hidden = !text;
    if (text) this.el.questionText.textContent = text;
  }

  // ── Options ──────────────────────────────────────────────────────────────

  /**
   * Render answer buttons.
   * @param {{text:string, correct:boolean}[]} options
   * @param {(idx:number)=>void} onSelect
   */
  renderOptions(options, onSelect) {
    const grid = this.el.optionsGrid;
    grid.innerHTML = '';

    options.forEach((opt, i) => {
      const letter = String.fromCharCode(65 + i); // A, B, C, D
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');
      btn.setAttribute('aria-label', `Opción ${letter}: ${opt.text}`);
      btn.dataset.index = String(i);

      btn.innerHTML = `<span class="opt-letter" aria-hidden="true">${letter}</span>${opt.text}`;
      btn.addEventListener('click', () => onSelect(i));
      grid.appendChild(btn);
    });
  }

  /**
   * Mark correct/wrong options after an answer is selected.
   * @param {number} correctIdx
   * @param {number} selectedIdx
   */
  markOptions(correctIdx, selectedIdx) {
    this.el.optionsGrid.querySelectorAll('.option-btn').forEach((btn, i) => {
      btn.disabled = true;
      btn.setAttribute('aria-checked', 'true');
      if (i === correctIdx) btn.classList.add('option-btn--correct');
      else if (i === selectedIdx) btn.classList.add('option-btn--wrong');
    });
  }

  clearOptions() {
    this.el.optionsGrid.innerHTML = '';
  }

  // ── Feedback ─────────────────────────────────────────────────────────────

  /**
   * @param {boolean} correct
   * @param {string}  message
   */
  showFeedback(correct, message) {
    const fb = this.el.feedback;
    fb.hidden = false;
    fb.className = `feedback feedback--${correct ? 'correct' : 'wrong'}`;
    fb.textContent = message;
  }

  clearFeedback() {
    const fb = this.el.feedback;
    fb.hidden = true;
    fb.className = 'feedback';
    fb.textContent = '';
  }

  // ── Next button ──────────────────────────────────────────────────────────

  /** @param {string} label */
  showNextButton(label) {
    const btn = this.el.btnNext;
    btn.hidden = false;
    btn.textContent = label;
  }

  hideNextButton() {
    this.el.btnNext.hidden = true;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// Game — main orchestrator. Owns state and coordinates other systems.
// ═════════════════════════════════════════════════════════════════════════════
class Game {
  constructor() {
    /** @type {{stepIdx:number, score:number, answered:boolean}} */
    this.state = { stepIdx: 0, score: 0, answered: false };

    this.scene     = new SceneRenderer();
    this.ui        = new UI();
    this.particles = new ParticleSystem($('particleContainer'));

    this._bindEvents();
  }

  // ── Event binding ────────────────────────────────────────────────────────

  _bindEvents() {
    $('btnStart').addEventListener('click', () => this.start());
    $('btnNext').addEventListener('click',  () => this.next());
    $('btnRestart').addEventListener('click', () => this.restart());

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      const step = STEPS[this.state.stepIdx];

      // Enter / Space → next
      if ((e.key === 'Enter' || e.key === ' ') && !$('btnNext').hidden) {
        e.preventDefault();
        this.next();
        return;
      }

      // 1-4 → select option
      if (['1','2','3','4'].includes(e.key) && step?.type === 'question' && !this.state.answered) {
        this.selectAnswer(parseInt(e.key, 10) - 1);
      }
    });

    // Redraw scene SVG on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const step = STEPS[this.state.stepIdx];
        if (step && $('s-game').style.display !== 'none') {
          this.scene.redrawLines(step);
        }
      }, 120);
    });
  }

  // ── Public API ───────────────────────────────────────────────────────────

  start() {
    this.state = { stepIdx: 0, score: 0, answered: false };
    this.ui.showScreen('game');
    // Give the scene a moment to lay out before reading getBoundingClientRect
    requestAnimationFrame(() => this._render());
  }

  next() {
    this.state.stepIdx++;
    this.state.answered = false;

    if (this.state.stepIdx >= STEPS.length) {
      this._end();
      return;
    }

    this._render();
    $('storyPanel')?.scrollTo(0, 0);
  }

  restart() {
    this.state = { stepIdx: 0, score: 0, answered: false };
    this.ui.showScreen('theory');
  }

  /**
   * Handle option selection.
   * @param {number} idx - 0-based option index
   */
  selectAnswer(idx) {
    if (this.state.answered) return;
    this.state.answered = true;

    const step      = STEPS[this.state.stepIdx];
    const chosen    = step.options[idx];
    const correctIdx = step.options.findIndex(o => o.correct);
    const isCorrect  = chosen.correct;

    // Update DOM
    this.ui.markOptions(correctIdx, idx);

    // Score delta
    const delta = isCorrect ? 100 : 10;
    const prevScore = this.state.score;
    this.state.score += delta;

    // Visual feedback
    this.ui.showFeedback(isCorrect, isCorrect ? step.feedback_ok : step.feedback_bad);
    this.ui.animateScore(prevScore, this.state.score);

    if (isCorrect) {
      this.particles.spawn('⭐', 5);
      if (step.revealD) this.ui.revealChip('chip-d', step.revealD);
      if (step.revealS) this.ui.revealChip('chip-s', step.revealS);
    }

    const isLast = this.state.stepIdx === STEPS.length - 1;
    this.ui.showNextButton(isLast ? '🏆 Ver resultado final' : 'Continuar la historia →');
  }

  // ── Private ──────────────────────────────────────────────────────────────

  _render() {
    const { stepIdx, score } = this.state;
    const step = STEPS[stepIdx];

    // Progress
    this.ui.renderProgress(stepIdx + 1, STEPS.length);

    // Scene
    this.scene.moveShip(step.shipPos);
    // Wait for ship transition before drawing lines (first frame is fine for story steps)
    setTimeout(() => this.scene.drawLines(step), 50);

    // HUD chips
    this.ui.showChips(step.chips ?? [], {
      t: step.chipTVal,
      d: step.chipDVal,
      s: step.chipSVal,
    });

    // Clear transient UI
    this.ui.clearFeedback();
    this.ui.hideNextButton();
    this.ui.clearOptions();

    // Narrator
    this.ui.renderNarrator(step.narrator, step.formula ?? null);

    // Question + options OR story next button
    if (step.type === 'question') {
      this.ui.renderQuestion(step.question);
      this.ui.renderOptions(step.options, idx => this.selectAnswer(idx));
    } else {
      this.ui.renderQuestion(null);
      const nextLabel = stepIdx === 0 ? '⛵ ¡Entendido, a navegar!' : 'Continuar →';
      this.ui.showNextButton(nextLabel);
    }

    // Update score display immediately (no animation needed between steps)
    this.ui.el.scoreVal.textContent = String(score);
  }

  _end() {
    this.ui.setFinalScore(this.state.score);
    this.ui.showScreen('win');

    setTimeout(() => {
      this.particles.spawn('🏆', 5);
      this.particles.spawn('⭐', 10);
      this.particles.spawn('🚢', 3);
    }, 400);
  }
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
// Show the theory screen on load, then instantiate the game
document.addEventListener('DOMContentLoaded', () => {
  const theory = $('s-theory');
  theory.style.display = 'block';
  theory.offsetHeight; // force reflow
  theory.classList.add('screen--active');

  window._game = new Game();
});