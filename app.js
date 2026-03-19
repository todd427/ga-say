// ga-say app.js

let voices = [];
let currentUtter = null;
let activeCategory = 'all';
let userWords = JSON.parse(localStorage.getItem('ga-say-words') || '[]');

// Azure Speech state
let azureToken = null;
let azureRegion = null;
let azureTokenExpiry = 0;
let azureSynthesizer = null;

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

// ── Azure Token ────────────────────────────────────────
async function getAzureToken() {
  if (azureToken && Date.now() < azureTokenExpiry) return { token: azureToken, region: azureRegion };
  try {
    const resp = await fetch('/speech-token');
    if (!resp.ok) return null;
    const data = await resp.json();
    if (!data.token) return null;
    azureToken = data.token;
    azureRegion = data.region;
    azureTokenExpiry = Date.now() + 9 * 60 * 1000; // 9 min (token lasts 10)
    return { token: azureToken, region: azureRegion };
  } catch {
    return null;
  }
}

// ── Azure TTS ──────────────────────────────────────────
async function speakAzure(text, voiceName, btn, cardId) {
  const auth = await getAzureToken();
  if (!auth) return false;

  // Lazy-load Azure Speech SDK from CDN
  if (!window.SpeechSDK) {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/microsoft-cognitiveservices-speech-sdk@latest/distrib/browser/microsoft.cognitiveservices.speech.sdk.bundle.js';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  const SDK = window.SpeechSDK;
  const config = SDK.SpeechConfig.fromAuthorizationToken(auth.token, auth.region);
  config.speechSynthesisVoiceName = voiceName;
  config.speechSynthesisOutputFormat = SDK.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

  const player = new SDK.SpeakerAudioDestination();
  const audioConfig = SDK.AudioConfig.fromSpeakerOutput(player);

  // Stop any current synthesis
  if (azureSynthesizer) {
    try { azureSynthesizer.close(); } catch {}
  }

  const synthesizer = new SDK.SpeechSynthesizer(config, audioConfig);
  azureSynthesizer = synthesizer;

  return new Promise((resolve) => {
    synthesizer.speakTextAsync(
      text,
      result => {
        synthesizer.close();
        azureSynthesizer = null;
        resetSpeakButton(btn, cardId);
        resolve(true);
      },
      err => {
        console.warn('Azure TTS error:', err);
        synthesizer.close();
        azureSynthesizer = null;
        resetSpeakButton(btn, cardId);
        resolve(false);
      }
    );
  });
}

// ── Web Speech fallback ────────────────────────────────
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
  } else {
    badge.textContent = 'Web Speech fallback'; badge.className = 'badge';
  }
}

function speakWebSpeech(text, btn, cardId) {
  if (currentUtter) { window.speechSynthesis.cancel(); }
  const u = new SpeechSynthesisUtterance(text);
  const vi = parseInt(document.getElementById('voice-sel').value);
  if (!isNaN(vi) && voices[vi]) { u.voice = voices[vi]; u.lang = voices[vi].lang; }
  else { u.lang = 'ga'; }
  u.rate  = parseFloat(document.getElementById('rate-sl').value);
  u.pitch = parseFloat(document.getElementById('pitch-sl').value);
  u.onend = () => resetSpeakButton(btn, cardId);
  currentUtter = u;
  window.speechSynthesis.speak(u);
}

// ── Voice selector UI ──────────────────────────────────
async function initVoiceSelector() {
  const sel = document.getElementById('voice-sel');
  const badge = document.getElementById('voice-badge');

  // Try Azure first
  const auth = await getAzureToken();
  if (auth) {
    sel.innerHTML = `
      <option value="ga-IE-OrlaNeural">Orla — Irish Female (Azure)</option>
      <option value="ga-IE-ColmNeural">Colm — Irish Male (Azure)</option>
    `;
    badge.textContent = 'Azure Neural Irish'; badge.className = 'badge ga';
    // Hide rate/pitch controls — Azure ignores them via this path
    document.querySelector('.ctrl-row:has(#rate-sl)').style.opacity = '0.4';
    document.querySelector('.ctrl-row:has(#pitch-sl)').style.opacity = '0.4';
    return;
  }

  // Fallback to Web Speech
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
  setTimeout(loadVoices, 500);
}

// ── Speak dispatcher ───────────────────────────────────
async function speak(idx, btn, word) {
  // Reset all UI
  document.querySelectorAll('.word-card').forEach(c => c.classList.remove('speaking'));
  document.querySelectorAll('.btn-speak').forEach(b => {
    b.classList.remove('active');
    b.innerHTML = icon() + ' Speak';
  });

  btn.classList.add('active');
  btn.innerHTML = icon() + ' Speaking…';
  document.getElementById('card-' + idx)?.classList.add('speaking');

  const sel = document.getElementById('voice-sel');
  const voiceVal = sel.value;
  const isAzureVoice = voiceVal.includes('Neural');

  if (isAzureVoice) {
    const ok = await speakAzure(word.irish, voiceVal, btn, idx);
    if (!ok) {
      // Azure failed — fall back to Web Speech
      speakWebSpeech(word.irish, btn, idx);
    }
  } else {
    speakWebSpeech(word.irish, btn, idx);
  }
}

function resetSpeakButton(btn, cardId) {
  btn.classList.remove('active');
  btn.innerHTML = icon() + ' Speak';
  document.getElementById('card-' + cardId)?.classList.remove('speaking');
}

function icon() {
  return `<svg width="12" height="12" viewBox="0 0 16 16"><polygon points="3,2 13,8 3,14" fill="currentColor"/></svg>`;
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
    card.innerHTML = `
      <div class="irish-word">${w.irish}</div>
      <div class="english">${w.eng}</div>
      <div class="phonetic">${w.phonetic}</div>
      <button class="btn-speak" onclick="speak(${i}, this, ${JSON.stringify(w).replace(/"/g, '&quot;')})">
        ${icon()} Speak
      </button>`;
    grid.appendChild(card);
  });
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
initVoiceSelector();
