// ---------- Config ----------
const MANIFEST_URL = './manifest.json';     // root
const WORD_STRIP_SELECTOR = '#wordRow';

// ---------- State ----------
let manifest = [];
let currentDeck = null;          // selected surah manifest entry
let surahData = null;            // object { surah, name_ar, name_bn, verses: [...] }
let currentAyahIndex = 0;

// ---------- Boot ----------
document.addEventListener('DOMContentLoaded', async () => {
  await loadManifest();
  await initSurahSelect();
  bindUI();
  await loadSelectedSurah();
});

// ---------- Loaders ----------
async function loadManifest(){
  try{
    const res = await fetch(MANIFEST_URL, { cache:'no-store' });
    if(!res.ok) throw new Error('Manifest fetch failed');
    manifest = await res.json();
  }catch(err){
    console.error(err);
    alert('Could not load manifest. Check file path & hosting.');
  }
}

async function initSurahSelect(){
  const sel = document.getElementById('surahSelect');
  sel.innerHTML = '';

  manifest.forEach((m,i)=>{
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = m.name;
    sel.appendChild(opt);
  });

  sel.addEventListener('change', async (e)=>{
    currentDeck = manifest[parseInt(e.target.value,10)];
    currentAyahIndex = 0;
    await loadSelectedSurah();
  });

  // default to first deck
  if(manifest.length){
    sel.value = 0;
    currentDeck = manifest[0];
  }
}

async function loadSelectedSurah(){
  if(!currentDeck) return;
  const path = currentDeck.json;
  try{
    const res = await fetch(path, { cache:'no-store' });
    if(!res.ok) throw new Error(`Could not load surah data from ${path}`);
    surahData = await res.json();
    renderSurahInfo(surahData);
    renderAyah(surahData.verses[currentAyahIndex]);
  }catch(err){
    console.error(err);
    alert(`Could not load surah data: ${path}`);
  }
}

// ---------- Renderers ----------
function renderSurahInfo(data){
  document.getElementById('surahTitleAr').textContent = data.name_ar;
  document.getElementById('surahTitleBn').textContent = data.name_bn;
}

function renderAyah(data){
  const ayahNum = data.ayah_id.split(':')[1];
  document.getElementById('ayahChip').textContent = `Ayah ${ayahNum}`;
  document.getElementById('ayahArabic').textContent = data.arabic;
  document.getElementById('ayahBangla').textContent = data.bangla;

  // Render the word tiles
  const wordStrip = document.querySelector(WORD_STRIP_SELECTOR);
  wordStrip.innerHTML = ''; // Clear previous words
  wordStrip.classList.toggle('ar-dir', document.getElementById('ayahArabic').dir === 'rtl');
  data.words.forEach(w => {
    wordStrip.innerHTML += createWordTile(w);
  });
  
  // Position the strip based on direction
  positionWordStripForDirection();
}

function createWordTile(w){
  // Handle derived words
  const derivedTiles = (w.derived || []).map(d =>
    ` <div class=\"derived-tile\">
        <h4 class=\"derived-ar\" lang=\"ar\" dir=\"rtl\">${d.ar || ''}</h4>
        <div class=\"derived-meta\">
          <span>${d.bn || ''}</span>
          <span>${d.tr || ''}</span>
        </div>
      </div>
    `).join('');

  // Handle chips
  const chips = [
    w.root ? `<span class=\"chip\" dir=\"ltr\">Root: ${w.root || ''}</span>` : '',
    w.pattern ? `<span class=\"chip\" dir=\"ltr\">Pattern: ${w.pattern || ''}</span>` : ''
  ].join('');

  return `
    <article class=\"word-card\">
      <div class=\"card-head\">MAIN</div>
      <h3 class=\"word-ar\" lang=\"ar\" dir=\"rtl\">${w.ar || ''}</h3>
      <p class=\"word-bn\">${escapeHtml(w.bn || '')}</p>
      <div class=\"chips\">${chips}</div>

      <div class=\"derived-row\">
        <span class=\"derived-label\">DERIVED</span>
        <button class=\"derived-toggle\" type=\"button\" aria-expanded=\"false\">
          Derived <span class=\"plus\">+</span>
        </button>
      </div>

      <div class=\"derived-grid\" hidden>
        ${derivedTiles}
      </div>
    </article>
  `;
}

// ---------- Helpers ----------
function escapeHtml(s){
  return String(s || '').replace(/[&<>"']/g, m =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])
  );
}

function positionWordStripForDirection(){
  const strip = document.querySelector(WORD_STRIP_SELECTOR);
  if(!strip) return;
  requestAnimationFrame(()=>{
    if(document.body.classList.contains('rtl')){
      strip.scrollLeft = strip.scrollWidth;
    }else{
      strip.scrollLeft = 0;
    }
  });
}

function scrollByStep(which){
  const strip = document.querySelector(WORD_STRIP_SELECTOR);
  if(!strip) return;
  const step = 200; // px
  if(which === 'prev'){
    strip.scrollBy({ left: -step, behavior: 'smooth' });
  }else if(which === 'next'){
    strip.scrollBy({ left: step, behavior: 'smooth' });
  }
}

// ---------- UI Binders ----------
function bindUI(){
  document.getElementById('btnPrev').addEventListener('click', ()=> scrollByStep('prev'));
  document.getElementById('btnNext').addEventListener('click', ()=> scrollByStep('next'));
  document.getElementById('dirToggle').addEventListener('click', toggleDirection);
}

function toggleDirection(){
  const toggle = document.getElementById('dirToggle');
  if(document.body.dir === 'ltr'){
    document.body.dir = 'rtl';
    toggle.textContent = 'RTL';
  }else{
    document.body.dir = 'ltr';
    toggle.textContent = 'LTR';
  }
  positionWordStripForDirection();
}