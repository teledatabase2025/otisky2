const ASSET = (name) => `assets/${name}`;
const AUTOSERVIS_URL = "https://example.com/"; // TODO: nahraďte finálním externím odkazem.

const prints = [
  {
    id: 1,
    map: "markant1.png",
    crop: "stopa1.png",
    reversed: false,
    groups: [
      { symbol: "O", count: 2, answers: ["D3", "B5"] },
      { symbol: "Y", count: 1, answers: ["A8"] },
      { symbol: "—", count: 0, answers: [] }
    ],
    candidates: [
      { name: "Hana Koubová", img: "ot11.png", match: 94.3, related: false },
      { name: "Lenka Pospíšilová", img: "ot12.png", match: 91.4, related: false },
      { name: "Kristýna Doležalová", img: "ot13.png", match: 89.2, related: true }
    ]
  },
  {
    id: 2,
    map: "markant2.png",
    crop: "stopa2.png",
    reversed: false,
    groups: [
      { symbol: "O", count: 2, answers: ["E1", "A8"] },
      { symbol: "Y", count: 2, answers: ["C6", "D7"] },
      { symbol: "—", count: 1, answers: ["C6"] }
    ],
    candidates: [
      { name: "Martina Vacková", img: "ot21.png", match: 94.8, related: false },
      { name: "Kristýna Francová", img: "ot23.png", match: 91.3, related: false },
      { name: "Tamara Vrbová", img: "ot22.png", match: 88.6, related: true }
    ]
  },
  {
    id: 3,
    map: "markant3.png",
    crop: "stopa3.png",
    reversed: false,
    deep: true,
    groups: [
      { symbol: "O", count: 1, answers: ["A7"] },
      { symbol: "Y", count: 2, answers: ["C2", "B1"] },
      { symbol: "—", count: 3, answers: ["B6", "B7", "B8"] }
    ],
    candidates: [
      { name: "Radka Müllerová", img: "ot31.png", match: 95.4, initialUnrelated: true, detail: "Pokladní v České obchodní bance na náměstí Míru v Praze.", highlight: true },
      { name: "Marie Tůmová", img: "ot33.png", match: 89.7, initialUnrelated: true, detail: "Zdravotní sestra v nemocnici U Svatého Prokopa." }
    ]
  },
  {
    id: 4,
    map: "markant4.png",
    crop: "stopa4.png",
    reversed: true,
    deep: true,
    groups: [
      { symbol: "O", count: 2, answers: ["B4", "A6"] },
      { symbol: "Y", count: 2, answers: ["E3", "B4"] },
      { symbol: "—", count: 1, answers: ["D5"] }
    ],
    candidates: [
      { name: "Josef Pospíšil", img: "ot41.png", match: 94.6, initialUnrelated: true, detail: "Stav v evidenci: zesnulý.", dead: true },
      { name: "Karel Liebknecht", img: "ot42.png", match: 91.2, initialUnrelated: true, detail: "Stejný otisk nalezen na vozidle Sebastiana Rýdla po autonehodě dne 9. 6. 2026.", highlight: true },
      { name: "František Král", img: "ot43.png", match: 87.7, initialUnrelated: true, detail: "Lesní dělník v pohraničí (Hvozdná nad Radbuzou)." }
    ]
  }
];

const workspace = document.getElementById("workspace");
const modal = document.getElementById("modal");
const startBtn = document.getElementById("startBtn");
const toast = document.getElementById("toast");

let currentPrint = 0;
let checkedCandidates = new Set();
let deepStageRunning = false;

startBtn.addEventListener("click", () => {
  modal.classList.remove("active");
  startScan();
});

function showToast(message, type = "info", ms = 2300) {
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), ms);
}

function esc(s) {
  return String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function startScan() {
  workspace.innerHTML = `
    <div class="section-title">
      <h2>ANALÝZA PŘEDMĚTU – OBÁLKA</h2>
      <span class="meta">Zdroj: Nocturno / nalezený předmět</span>
    </div>
    <div class="status-strip">
      <span class="live"><span class="dot"></span> DETEKCE LATENTNÍCH STOP</span>
      <span id="scanText">Analýza povrchu…</span>
    </div>
    <div class="envelope-stage">
      <div class="envelope-wrap">
        <img src="${ASSET('obalka.jpg')}" alt="Obálka nalezená v klubu Nocturno">
        <div class="scanline"></div>
        <div class="fp-marker fp1" id="fp1"><span>STOPA 01</span></div>
        <div class="fp-marker fp2" id="fp2"><span>STOPA 02</span></div>
        <div class="fp-marker fp3" id="fp3"><span>STOPA 03</span></div>
        <div class="fp-marker fp4" id="fp4"><span>STOPA 04</span></div>
        <div class="scan-counter" id="scanCounter">DETEKOVÁNO: 0 / 4</div>
      </div>
    </div>`;

  const timings = [700, 2300, 4200, 5500];
  timings.forEach((t, i) => setTimeout(() => {
    const el = document.getElementById(`fp${i+1}`);
    if (!el) return;
    el.classList.add("detected");
    const counter = document.getElementById("scanCounter");
    if (counter) counter.textContent = `DETEKOVÁNO: ${i+1} / 4`;
  }, t));
  setTimeout(() => {
    const txt = document.getElementById("scanText");
    if (txt) txt.textContent = "Detekovány 4 latentní stopy";
    showToast("DETEKOVÁNY 4 LATENTNÍ STOPY", "success", 1500);
  }, 6100);
  setTimeout(showFoundPrints, 7200);
}

function showFoundPrints() {
  workspace.innerHTML = `
    <div class="section-title">
      <h2>DETEKOVANÉ LATENTNÍ STOPY</h2>
      <span class="meta">Celkem: 4</span>
    </div>
    <div class="status-strip"><span>EXTRAKCE STOP DOKONČENA</span><span>4 / 4</span></div>
    <div class="found-grid">
      ${prints.map(p => `
        <div class="found-card">
          <span class="tag">STOPA 0${p.id}</span>
          <img src="${ASSET(p.crop)}" alt="Otisk ${p.id}">
          <p>Latentní daktyloskopická stopa</p>
        </div>`).join("")}
    </div>
    <div class="action-row">
      <button id="compareFirst" class="btn primary">K POROVNÁNÍ PRVNÍHO OTISKU</button>
    </div>`;
  document.getElementById("compareFirst").addEventListener("click", () => openPrint(0));
}

function symbolHTML(symbol) {
  if (symbol === "O") return `<span class="mark-symbol" aria-label="Ukončení linie">○</span>`;
  if (symbol === "Y") return `<span class="mark-symbol y" aria-label="Rozdvojení linie">Y</span>`;
  return `<span class="mark-symbol dash" aria-label="Krátká linie">—</span>`;
}

function openPrint(index) {
  currentPrint = index;
  checkedCandidates = new Set();
  deepStageRunning = false;
  const p = prints[index];
  workspace.innerHTML = `
    <div class="section-title">
      <h2>BIOMETRICKÉ ZPRACOVÁNÍ – STOPA 0${p.id}</h2>
      <span class="meta">Krok ${p.id} / 4</span>
    </div>
    <div class="compare-layout">
      <aside class="current-print">
        <span class="tag">AKTIVNÍ STOPA 0${p.id}</span>
        <img src="${ASSET(p.crop)}" alt="Aktivní otisk ${p.id}">
        <div class="orientation ${p.reversed ? 'reversed' : ''}">
          <strong>STRANOVÁ ORIENTACE:</strong><br>
          ${p.reversed ? 'STOPA JE STRANOVĚ PŘEVRÁCENÁ. Sektory čtěte v zrcadlovém pořadí.' : 'Stopa není stranově převrácená.'}
        </div>
      </aside>
      <section class="main-compare">
        <div class="map-panel">
          <h3>Markantová mapa</h3>
          <img src="${ASSET(p.map)}" alt="Markantová mapa ${p.id}">
        </div>
        <div class="signature-panel">
          <div class="panel-head">Biometrický podpis</div>
          <div class="signature-body">
            <div class="signature-help">Doplňte pozice markantů ve formátu A1–E8. Vyplňují se pouze přednastavená pole.</div>
            <div id="signatureLine" class="signature-line">
              ${p.groups.filter(g => g.count > 0).map((g, gi) => `
                <div class="mark-group" data-group="${gi}">
                  ${symbolHTML(g.symbol)}
                  ${Array.from({length:g.count}, (_,ii) => `<input class="sig-input" data-gi="${gi}" data-ii="${ii}" maxlength="2" inputmode="text" autocomplete="off" aria-label="Hodnota ${g.symbol} ${ii+1}">`).join('<span class="sep">–</span>')}
                </div>`).join("")}
            </div>
            <div class="action-row">
              <button id="validateSignature" class="btn primary">OVĚŘIT BIOMETRICKÝ PODPIS</button>
            </div>
          </div>
        </div>
        <div id="resultArea"></div>
      </section>
    </div>`;

  document.querySelectorAll('.sig-input').forEach((input, idx, list) => {
    input.addEventListener('input', (e) => {
      let v = e.target.value.toUpperCase().replace(/[^A-E1-8]/g, '');
      if (v.length >= 2) v = v.slice(0,2);
      e.target.value = v;
      if (v.length === 2 && idx < list.length - 1) list[idx+1].focus();
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') validateSignature();
    });
  });
  document.getElementById("validateSignature").addEventListener("click", validateSignature);
}

function getEnteredSignature(p) {
  return p.groups.filter(g => g.count > 0).map((g, gi) => {
    const vals = [...document.querySelectorAll(`.sig-input[data-gi="${gi}"]`)].map(i => i.value.trim().toUpperCase());
    return vals;
  });
}

function validateSignature() {
  const p = prints[currentPrint];
  const entered = getEnteredSignature(p);
  const expected = p.groups.filter(g => g.count > 0).map(g => g.answers);
  const ok = entered.length === expected.length && entered.every((arr, gi) => arr.length === expected[gi].length && arr.every((v, ii) => v === expected[gi][ii]));
  if (!ok) {
    showToast("Biometrický podpis neodpovídá zadání. Otisk není možné zpracovat.", "error", 2800);
    return;
  }
  showToast("Biometrický podpis ověřen. Zadání odpovídá markantové mapě.", "success", 1800);
  document.querySelectorAll('.sig-input').forEach(i => i.disabled = true);
  document.getElementById("validateSignature").disabled = true;
  setTimeout(() => runDatabaseComparison(p), 650);
}

function runDatabaseComparison(p) {
  const area = document.getElementById("resultArea");
  area.innerHTML = `
    <div class="progress-box">
      <div class="progress-title"><span>Porovnávám otisk na základě biometrického podpisu s naší databází</span><span id="pct">0 %</span></div>
      <div class="progress-track"><span id="bar"></span></div>
      <div class="progress-log" id="log">Inicializace vyhledávání…</div>
    </div>`;
  const bar = document.getElementById("bar");
  const pct = document.getElementById("pct");
  const log = document.getElementById("log");
  const logs = [
    "Normalizace biometrického podpisu…",
    "Vyhledávání kompatibilních profilů ≥ 85 %…",
    "Porovnání markantů a orientace stopy…",
    "Kandidátní profily nalezeny."
  ];
  let n = 0;
  const timer = setInterval(() => {
    n = Math.min(100, n + 4 + Math.floor(Math.random()*8));
    bar.style.width = `${n}%`;
    pct.textContent = `${n} %`;
    log.textContent = logs[Math.min(logs.length-1, Math.floor(n/27))];
    if (n >= 100) {
      clearInterval(timer);
      setTimeout(() => showCandidates(p), 450);
    }
  }, 110);
}

function showCandidates(p) {
  const area = document.getElementById("resultArea");
  const sorted = [...p.candidates].sort((a,b) => b.match-a.match);
  area.innerHTML = `
    <div class="candidate-head">
      <h3>KANDIDÁTNÍ SHODY ≥ 85 %</h3>
      <p>Vyberte osobu s nejpravděpodobnější souvislostí s případem.</p>
    </div>
    <div class="candidates ${sorted.length===2?'two':''}">
      ${sorted.map((c, i) => candidateCard(c, i, false)).join('')}
    </div>
    <div id="deepArea"></div>`;
  document.querySelectorAll('.candidate button').forEach(btn => {
    btn.addEventListener('click', () => inspectCandidate(btn.dataset.name));
  });
}

function candidateCard(c, i, details) {
  return `
    <article class="candidate ${details && c.highlight ? 'highlight' : ''}" data-name="${esc(c.name)}">
      <img src="${ASSET(c.img)}" alt="${esc(c.name)}">
      <h4>${esc(c.name)}</h4>
      <div class="match">KOMPATIBILITA: ${c.match.toFixed(1).replace('.',',')} %</div>
      ${details ? `<div class="details">
        ${c.dead ? '<span class="badge dead">Zesnulý</span><br><br>' : ''}
        ${esc(c.detail || '')}
      </div>` : ''}
      ${!details ? `<button class="btn secondary" data-name="${esc(c.name)}">PROVĚŘIT SOUVISLOST</button>` : ''}
    </article>`;
}

function inspectCandidate(name) {
  const p = prints[currentPrint];
  const c = p.candidates.find(x => x.name === name);
  if (!c) return;
  checkedCandidates.add(name);
  const card = document.querySelector(`.candidate[data-name="${CSS.escape(name)}"]`);
  if (card) card.classList.add('checked');

  if (p.id <= 2) {
    if (c.related) {
      showToast("Souvislost s případem nalezena.", "success", 2200);
      const buttons = document.querySelectorAll('.candidate button');
      buttons.forEach(b => b.disabled = true);
      appendNextButton();
    } else {
      showToast("Tato osoba s případem pravděpodobně nesouvisí.", "error", 2300);
    }
    return;
  }

  showToast("Tato osoba s případem pravděpodobně nesouvisí.", "error", 2000);
  if (checkedCandidates.size === p.candidates.length && !deepStageRunning) {
    deepStageRunning = true;
    document.querySelectorAll('.candidate button').forEach(b => b.disabled = true);
    setTimeout(() => runDeepAnalysis(p), 1400);
  }
}

function appendNextButton() {
  const area = document.getElementById("resultArea");
  if (document.getElementById('nextPrintBtn')) return;
  const next = currentPrint + 1;
  if (next < prints.length) {
    area.insertAdjacentHTML('beforeend', `<div class="action-row"><button id="nextPrintBtn" class="btn primary">K POROVNÁNÍ ${ordinalCzech(next+1)} OTISKU</button></div>`);
    document.getElementById('nextPrintBtn').addEventListener('click', () => openPrint(next));
  }
}

function ordinalCzech(n){ return ({2:'DRUHÉHO',3:'TŘETÍHO',4:'ČTVRTÉHO'})[n] || `${n}.`; }

function runDeepAnalysis(p) {
  const deep = document.getElementById('deepArea');
  deep.innerHTML = `
    <div class="deep-analysis">
      <div class="head">Rozšířená analýza souvislostí</div>
      <div class="body">
        <div class="scantext">Načítám podrobné prozkoumávání souvislostí…<br>Propojuji evidenční, pracovní a případové záznamy…</div>
        <div class="bar"><span></span></div>
      </div>
    </div>`;
  setTimeout(() => showDeepResults(p), 3100);
}

function showDeepResults(p) {
  const deep = document.getElementById('deepArea');
  deep.innerHTML = `
    <div class="candidate-head">
      <h3>ROZŠÍŘENÉ PROVĚŘENÍ KANDIDÁTŮ</h3>
      <p>Byly nalezeny další evidenční souvislosti.</p>
    </div>
    <div class="candidates ${p.candidates.length===2?'two':''}">
      ${[...p.candidates].sort((a,b) => b.match-a.match).map((c,i) => candidateCard(c,i,true)).join('')}
    </div>
    <div id="deepFollow"></div>`;

  if (p.id === 3) {
    showToast("Pravděpodobná souvislost nalezena: Radka Müllerová.", "success", 3000);
    setTimeout(appendNextButton, 850);
  } else if (p.id === 4) {
    showToast("Významná případová stopa nalezena u Karla Liebknechta.", "success", 2800);
    setTimeout(() => runProfessionalLink(), 1100);
  }
}

function runProfessionalLink() {
  const follow = document.getElementById('deepFollow');
  follow.innerHTML = `
    <div class="deep-analysis">
      <div class="head">Doplňkové prověření osoby – Karel Liebknecht</div>
      <div class="body">
        <div class="scantext">Prověřuji zaměstnanecké a profesní vazby…<br>Porovnávám dostupné pracovní evidence…</div>
        <div class="bar"><span></span></div>
      </div>
    </div>`;
  setTimeout(() => {
    follow.innerHTML = `
      <div class="deep-analysis">
        <div class="head">Souvislost potvrzena</div>
        <div class="body">
          <p><strong>KAREL LIEBKNECHT</strong></p>
          <p>Zaměstnanec autoservisu <strong>Vopelák s.r.o.</strong><br><strong>Chlumecká 756/5, Praha 14-Černý Most</strong></p>
          <p><span class="badge link">Významná souvislost s případem nalezena</span></p>
          <div class="action-row">
            <button id="contactService" class="btn primary">KONTAKTOVAT AUTOSERVIS</button>
          </div>
        </div>
      </div>`;
    const btn = document.getElementById('contactService');
    btn.addEventListener('click', () => window.location.href = AUTOSERVIS_URL);
  }, 3100);
}
