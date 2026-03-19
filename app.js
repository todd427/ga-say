// ga-say app.js

let voices = [];
let currentUtter = null;
let activeCategory = 'all';
let userWords = JSON.parse(localStorage.getItem('ga-say-words') || '[]');

const allWords = () => [...WORDS, ...userWords];

// ── Theme ──────────────────────────────────────────────
function setTheme(t) {
  document.body.setAttribute('data-theme', t);
  localStorage.setItem('ga-say-theme', t);
  document.getElementById('theme-sel').value = t;
}

function initTheme() {
  const saved = localStorage.getItem('ga-say-theme') || 'parchment';
  setTheme(saved);
}

// ── Voices ─────────────────────────────────────────────
function loadVoices() {
  voices = window.speechSynthesis.getVoices();
  if (!voices.length) return;

  const sel = document.getElementById('voice-sel');
  const badge = document.getElementById('voice-badge');
  sel.innerHTML = '';

  const gaVoices = voices.filter(v => v.lang.startsWith('ga'));
  const ieVoices = voices.filter(v => v.lang.startsWith('en-IE'));
  const gbVoices = voices.filter(v => v.lang.startsWith('en-GB'));
  const rest     = voices.filter(v => !gaVoices.includes(v) && !ieVoices.includes(v) && !gbVoices.includes(v));

  [...gaVoices, ...ieVoices, ...gbVoices, ...rest].forEach(v => {
    const opt = document.createElement('option');
    opt.value = voices.indexOf(v);
    opt.textContent = `${v.name} (${v.lang})`;
    sel.appendChild(opt);
  });

  if (gaVoices.length) {
    sel.value = voices.indexOf(gaVoices[0]);
    badge.textContent = 'Irish (ga)'; badge.className = 'badge ga';
  } else if (ieVoices.length) {
    sel.value = voices.indexOf(ieVoices[0]);
    badge.textContent = 'en-IE'; badge.className = 'badge ga';
  } else if (gbVoices.length) {
    sel.value = voices.indexOf(gbVoices[0]);
    badge.textContent = 'en-GB'; badge.className = 'badge';
  } else {
    badge.textContent = 'no Irish voice'; badge.className = 'badge';
  }
}

// ── Categories ─────────────────────────────────────────
function buildCategoryTabs() {
  const cats = ['all', ...new Set(allWords().map(w => w.cat).filter(Boolean))];
  const nav = document.getElementById('cat-tabs');
  nav.innerHTML = '';
  cats.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'cat-tab' + (c === activeCategory ? ' active' : '');
    btn.textContent = c;
    btn.onclick = () => { activeCategory = c; buildCategoryTabs(); renderGrid(); };
    nav.appendChild(btn);
  });
}

// ── Word Grid ──────────────────────────────────────────
function renderGrid() {
  const grid = document.getElementById('word-grid');
  grid.innerHTML = '';
  const words = activeCategory === 'all'
    ? allWords()
    : allWords().filter(w => w.cat === activeCategory);

  words.forEach((w, i) => {
    const card = document.createElement('div');
    card.className = 'word-card';
    card.id = 'card-' + i;
    const icon = `<svg width="12" height="12" viewBox="0 0 16 16"><polygon points="3,2 13,8 3,14" fill="currentColor"/></svg>`;
    card.innerHTML = `
      <div class="irish-word">${w.irish}</div>
      <div class="english">${w.eng}</div>
      <div class="phonetic">${w.phonetic}</div>
      <button class="btn-speak" onclick="speak(${i}, this, ${JSON.stringify(w).replace(/"/g, '&quot;')})">
        ${icon} Speak
      </button>`;
    grid.appendChild(card);
  });
}

// ── Speech ─────────────────────────────────────────────
function speak(idx, btn, word) {
  if (currentUtter) { window.speechSynthesis.cancel(); }

  document.querySelectorAll('.word-card').forEach(c => c.classList.remove('speaking'));
  document.querySelectorAll('.btn-speak').forEach(b => {
    b.classList.remove('active');
    b.innerHTML = `<svg width="12" height="12" viewBox="0 0 16 16"><polygon points="3,2 13,8 3,14" fill="currentColor"/></svg> Speak`;
  });

  const u = new SpeechSynthesisUtterance(word.irish);
  const vi = parseInt(document.getElementById('voice-sel').value);
  if (!isNaN(vi) && voices[vi]) { u.voice = voices[vi]; u.lang = voices[vi].lang; }
  else { u.lang = 'ga'; }
  u.rate  = parseFloat(document.getElementById('rate-sl').value);
  u.pitch = parseFloat(document.getElementById('pitch-sl').value);

  u.onend = () => {
    btn.classList.remove('active');
    btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 16 16"><polygon points="3,2 13,8 3,14" fill="currentColor"/></svg> Speak`;
    document.getElementById('card-' + idx)?.classList.remove('speaking');
  };

  btn.classList.add('active');
  btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 16 16"><polygon points="3,2 13,8 3,14" fill="currentColor"/></svg> Speaking…`;
  document.getElementById('card-' + idx)?.classList.add('speaking');

  currentUtter = u;
  window.speechSynthesis.speak(u);
}

// ── Add Word ───────────────────────────────────────────
function addWord() {
  const irish    = document.getElementById('in-word').value.trim();
  const eng      = document.getElementById('in-eng').value.trim();
  const phonetic = document.getElementById('in-phon').value.trim();
  const cat      = document.getElementById('in-cat').value.trim() || 'misc';
  if (!irish) return;

  userWords.push({ irish, eng: eng || '—', phonetic: phonetic || '?', cat });
  localStorage.setItem('ga-say-words', JSON.stringify(userWords));
  ['in-word','in-eng','in-phon','in-cat'].forEach(id => document.getElementById(id).value = '');

  buildCategoryTabs();
  renderGrid();
}

// ── Sliders ────────────────────────────────────────────
document.getElementById('rate-sl').addEventListener('input', e => {
  document.getElementById('rate-out').textContent = parseFloat(e.target.value).toFixed(2);
});
document.getElementById('pitch-sl').addEventListener('input', e => {
  document.getElementById('pitch-out').textContent = parseFloat(e.target.value).toFixed(1);
});

// ── Init ───────────────────────────────────────────────
initTheme();
buildCategoryTabs();
renderGrid();
window.speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();
setTimeout(loadVoices, 500);
