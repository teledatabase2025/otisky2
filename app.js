const ASSET = (name) => `assets/${name}`;
const AUTOSERVIS_URL = ""; // TODO: sem později vložte finální externí odkaz.

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
      { name: "Kristýna Doležalová", img: "ot12.png", match: 89.2, related: true },
      { name: "Lenka Pospíšilová", img: "ot13.png", match: 91.4, related: false }
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
      { name: "Tamara Vrbová", img: "ot22.png", match: 88.6, related: true },
      { name: "Kristýna Francová", img: "ot23.png", match: 91.3, related: false }
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
      { symbol: "Y", count: 2, answers: ["B1", "C2"] },
      { symbol: "—", count: 3, answers: ["B6", "B7", "B8"] }
    ],
    candidates: [
      { name: "Radka Müllerová", img: "ot31.png", match: 95.4, initialUnrelated: true, detail: "Pokladní v České obchodní bance na náměstí Míru v Praze.", detailRole: "POKLADNÍ V BANCE", detailInstitution: "Československá obchodní banka (ČSOB)", detailPlace: "pracoviště: náměstí Míru, Praha", highlight: true },
      { name: "Marie Tůmová", img: "ot33.png", match: 89.7, initialUnrelated: true, detail: "Zdravotní sestra v nemocnici U Svatého Prokopa.", detailRole: "ZDRAVOTNÍ SESTRA", detailInstitution: "Nemocnice U Svatého Prokopa", detailPlace: "pracovní údaj dohledán – bez zjištěné souvislosti s případem", unrelatedDetail: true }
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
      { name: "Josef Pospíšil", img: "ot41.png", match: 94.6, initialUnrelated: true, detail: "Stav v evidenci: zesnulý.", detailRole: "STAV V EVIDENCI", detailInstitution: "ZESNULÝ", detailPlace: "osoba vedena jako zemřelá", dead: true },
      { name: "František Král", img: "ot42.png", match: 87.7, initialUnrelated: true, detail: "Lesní dělník v pohraničí (Hvozdná nad Radbuzou).", detailRole: "LESNÍ DĚLNÍK", detailInstitution: "Hvozdná nad Radbuzou", detailPlace: "pohraničí" },
      { name: "Karel Liebknecht", img: "ot43.png", match: 91.2, initialUnrelated: true, detail: "Stejný otisk nalezen na vozidle Sebastiana Rýdla po autonehodě dne 9. 6. 2026.", detailRole: "SHODNÝ OTISK V JINÉM PŘÍPADU", detailInstitution: "Vozidlo Sebastiana Rýdla", detailPlace: "dopravní nehoda / 9. 6. 2026", highlight: true }
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
let deepResultsReady = false;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

function showSystemOverlay(title, body, type = "info", ms = 2200) {
  return new Promise(resolve => {
    const old = document.getElementById("systemOverlay");
    if (old) old.remove();
    const layer = document.createElement("div");
    layer.id = "systemOverlay";
    layer.className = `system-overlay ${type}`;
    layer.innerHTML = `
      <div class="system-card">
        <div class="system-icon">${type === 'error' ? '!' : type === 'success' ? '✓' : '◎'}</div>
        <h3>${title}</h3>
        <p>${body}</p>
      </div>`;
    document.body.appendChild(layer);
    requestAnimationFrame(() => layer.classList.add("show"));
    setTimeout(() => {
      layer.classList.remove("show");
      setTimeout(() => { layer.remove(); resolve(); }, 260);
    }, ms);
  });
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
      <span id="scanText">Připravuji skenování povrchu…</span>
    </div>
    <div class="envelope-stage">
      <div class="envelope-wrap">
        <img src="${ASSET('obalka.jpg')}" alt="Obálka nalezená v klubu Nocturno">
        <div class="scanline" id="scanLine" style="animation:none;opacity:0;top:-3%"></div>
        <div class="fp-marker fp1" id="fp1"><span>STOPA 01</span></div>
        <div class="fp-marker fp2" id="fp2"><span>STOPA 02</span></div>
        <div class="fp-marker fp3" id="fp3"><span>STOPA 03</span></div>
        <div class="fp-marker fp4" id="fp4"><span>STOPA 04</span></div>
        <div class="scan-counter" id="scanCounter">DETEKOVÁNO: 0 / 4</div>
      </div>
    </div>`;

  // Dvě sekundy je obálka v klidu. Teprve potom začne jediný plynulý průjezd laseru.
  const scanDelay = 2000;
  const scanDuration = 6500;

  setTimeout(() => {
    const line = document.getElementById("scanLine");
    const txt = document.getElementById("scanText");
    if (txt) txt.textContent = "Skenování povrchu…";
    if (line) {
      line.style.opacity = "1";
      line.style.animation = `scan ${scanDuration}ms linear 1 forwards`;
    }
  }, scanDelay);

  // Časy odpovídají skutečné vertikální poloze otisků na obálce.
  // Kruh se objeví ve chvíli, kdy laser prochází středem daného otisku.
  const markerCenters = [14.85, 37.30, 76.10, 87.95];
  const scanStart = -3;
  const scanEnd = 103;
  const travel = scanEnd - scanStart;

  markerCenters.forEach((center, i) => {
    const progress = (center - scanStart) / travel;
    const t = scanDelay + Math.round(progress * scanDuration);
    setTimeout(() => {
      const el = document.getElementById(`fp${i + 1}`);
      if (!el) return;
      el.classList.add("detected");
      const counter = document.getElementById("scanCounter");
      if (counter) counter.textContent = `DETEKOVÁNO: ${i + 1} / 4`;
    }, t);
  });

  const scanFinished = scanDelay + scanDuration;
  setTimeout(() => {
    const txt = document.getElementById("scanText");
    if (txt) txt.textContent = "Detekovány 4 latentní stopy";
    showToast("DETEKOVÁNY 4 LATENTNÍ STOPY", "success", 1600);
  }, scanFinished + 250);

  // Výsledek necháme krátce na obrazovce, aby hráč viděl všechny čtyři zakroužkované stopy.
  setTimeout(showFoundPrints, scanFinished + 2200);
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
  deepResultsReady = false;
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
    return [...document.querySelectorAll(`.sig-input[data-gi="${gi}"]`)].map(i => i.value.trim().toUpperCase());
  });
}

function validateSignature() {
  const p = prints[currentPrint];
  const entered = getEnteredSignature(p);
  const expected = p.groups.filter(g => g.count > 0).map(g => g.answers);
  const ok = entered.length === expected.length && entered.every((arr, gi) => arr.length === expected[gi].length && arr.every((v, ii) => v === expected[gi][ii]));
  if (!ok) {
    showToast("Biometrický podpis neodpovídá zadání. Otisk není možné zpracovat.", "error", 3000);
    return;
  }
  showToast("Biometrický podpis ověřen. Zadání odpovídá markantové mapě.", "success", 2200);
  document.querySelectorAll('.sig-input').forEach(i => i.disabled = true);
  document.getElementById("validateSignature").disabled = true;
  setTimeout(() => runDatabaseComparison(p), 900);
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
      setTimeout(() => showCandidates(p), 500);
    }
  }, 125);
}

function showCandidates(p) {
  const area = document.getElementById("resultArea");
  area.innerHTML = `
    <div class="candidate-head">
      <h3>KANDIDÁTNÍ SHODY ≥ 85 %</h3>
      <p>Vyberte osobu s nejpravděpodobnější souvislostí s případem.</p>
    </div>
    <div class="candidates ${p.candidates.length===2?'two':''}">
      ${p.candidates.map((c, i) => candidateCard(c, i, false, true)).join('')}
    </div>
    <div id="deepArea"></div>`;
  document.querySelectorAll('.candidate button').forEach(btn => {
    btn.addEventListener('click', () => inspectCandidate(btn.dataset.name));
  });
}

function candidateCard(c, i, details, selectable = false) {
  const highlightClass = details && c.highlight ? 'highlight' : '';
  const revealClass = details ? 'detail-reveal' : '';
  const delaySeconds = i * 0.55;
  const delay = details ? `style="--reveal-delay:${delaySeconds}s;animation-delay:${delaySeconds}s"` : '';
  const detailBlock = details ? `
    <div class="details">
      <div class="new-fact-badge">${c.unrelatedDetail ? 'NOVĚ DOHLEDANÝ ÚDAJ' : 'NOVĚ DOHLEDANÁ SOUVISLOST'}</div>
      ${c.dead ? '<span class="badge dead">ZESNULÝ</span>' : ''}
      <div class="new-fact ${c.highlight ? 'key-fact' : ''} ${c.unrelatedDetail ? 'neutral-fact' : ''}">
        <span class="new-fact-label">${esc(c.detailRole || 'NOVÝ ÚDAJ')}</span>
        <strong>${esc(c.detailInstitution || c.detail || '')}</strong>
        ${c.detailPlace ? `<small>${esc(c.detailPlace)}</small>` : ''}
        ${c.unrelatedDetail ? '<span class="badge">BEZ ZJIŠTĚNÉ VAZBY NA PŘÍPAD</span>' : ''}
      </div>
    </div>` : '';
  return `
    <article class="candidate ${highlightClass} ${revealClass}" ${delay} data-name="${esc(c.name)}">
      <img src="${ASSET(c.img)}" alt="${esc(c.name)}">
      <h4>${esc(c.name)}</h4>
      <div class="match">KOMPATIBILITA: ${c.match.toFixed(1).replace('.',',')} %</div>
      ${detailBlock}
      ${selectable ? `<button class="btn secondary" data-name="${esc(c.name)}">${details ? 'VYBRAT TUTO OSOBU' : 'PROVĚŘIT SOUVISLOST'}</button>` : ''}
    </article>`;
}

function flashCard(card, type) {
  if (!card) return;
  card.classList.remove('confirmed', 'rejected');
  void card.offsetWidth;
  card.classList.add(type === 'success' ? 'confirmed' : 'rejected');
  setTimeout(() => card.classList.remove('rejected'), 1700);
}

function flashCandidateGroup(type = 'error') {
  document.querySelectorAll('.candidate').forEach((card, i) => {
    setTimeout(() => flashCard(card, type), i * 140);
  });
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
      flashCard(card, 'success');
      showToast("Souvislost s případem nalezena.", "success", 3000);
      document.querySelectorAll('.candidate button').forEach(b => b.disabled = true);
      setTimeout(() => {
        appendInlineConfirmation("SOULAD POTVRZEN", "Dostupné případové údaje potvrzují relevantní souvislost vybrané osoby.");
        appendNextButton();
      }, 1500);
    } else {
      flashCard(card, 'error');
      showToast("Tato osoba s případem pravděpodobně nesouvisí.", "error", 2600);
    }
    return;
  }

  flashCard(card, 'error');
  showToast("Tato osoba s případem pravděpodobně nesouvisí.", "error", 2200);
  if (checkedCandidates.size === p.candidates.length && !deepStageRunning) {
    deepStageRunning = true;
    document.querySelectorAll('.candidate button').forEach(b => b.disabled = true);
    beginDeepFailureSequence(p);
  }
}

async function beginDeepFailureSequence(p) {
  await sleep(2400);
  flashCandidateGroup('error');
  showToast("Ani u jedné osoby nebyla nalezena shoda!", "error", 3400);
  await sleep(3700);
  await showSystemOverlay(
    "ZAHAJUJI PODROBNOU ANALÝZU",
    "Standardní případové vazby nebyly nalezeny. DAKTIS rozšiřuje prověření o evidenční, pracovní a institucionální záznamy.",
    "info",
    2600
  );
  runDeepAnalysis(p);
}

function appendInlineConfirmation(title, text) {
  const area = document.getElementById("resultArea");
  if (!area || document.getElementById('inlineConfirmation')) return;
  area.insertAdjacentHTML('beforeend', `
    <div id="inlineConfirmation" class="inline-confirmation">
      <strong>${title}</strong><span>${text}</span>
    </div>`);
}

function appendNextButton() {
  const area = document.getElementById("resultArea");
  if (!area || document.getElementById('nextPrintBtn')) return;
  const next = currentPrint + 1;
  if (next < prints.length) {
    area.insertAdjacentHTML('beforeend', `<div class="action-row next-action"><button id="nextPrintBtn" class="btn primary">K POROVNÁNÍ ${ordinalCzech(next+1)} OTISKU</button></div>`);
    const btn = document.getElementById('nextPrintBtn');
    btn.addEventListener('click', () => openPrint(next));
    setTimeout(() => btn.scrollIntoView({behavior:'smooth', block:'center'}), 150);
  }
}

function ordinalCzech(n){ return ({2:'DRUHÉHO',3:'TŘETÍHO',4:'ČTVRTÉHO'})[n] || `${n}.`; }

function runDeepAnalysis(p) {
  const deep = document.getElementById('deepArea') || document.getElementById('resultArea');
  deep.innerHTML = `
    <div class="deep-analysis emphasized">
      <div class="head">Podrobná analýza souvislostí</div>
      <div class="body">
        <div class="scantext" id="deepScanText">Propojuji evidenční, pracovní a případové záznamy…</div>
        <div class="bar"><span></span></div>
        <div class="analysis-steps">
          <span class="active">Evidence osob</span><span>Pracovní vazby</span><span>Instituce</span><span>Případové stopy</span>
        </div>
      </div>
    </div>`;
  const deepText = document.getElementById('deepScanText');
  const steps = [...document.querySelectorAll('.analysis-steps span')];
  const messages = [
    "Kontroluji rozšířené evidenční záznamy…",
    "Prověřuji pracovní a profesní vazby…",
    "Propojuji institucionální údaje…",
    "Porovnávám vazby s předmětem a případem…"
  ];
  steps.forEach((step, i) => setTimeout(() => {
    steps.forEach((s, j) => { s.classList.toggle('active', j === i); s.classList.toggle('done', j < i); });
    if (deepText) deepText.textContent = messages[i];
  }, i * 900));
  setTimeout(() => showDeepResults(p), 4100);
}

function showDeepResults(p) {
  deepResultsReady = true;
  checkedCandidates = new Set();
  const area = document.getElementById('resultArea');
  area.innerHTML = `
    <div class="analysis-result-banner">
      <strong>PODROBNÁ ANALÝZA DOKONČENA</strong>
      <span>Byly dohledány další údaje. Prohlédněte jednotlivé výsledky a znovu vyberte nejpravděpodobnější osobu.</span>
    </div>
    <div class="candidate-head deep-heading">
      <h3>ROZŠÍŘENÉ PROVĚŘENÍ KANDIDÁTŮ</h3>
      <p>Každý profil byl doplněn o nově dohledaný údaj. Ne každý nový údaj představuje souvislost s případem.</p>
    </div>
    <div class="candidates ${p.candidates.length===2?'two':''}">
      ${p.candidates.map((c,i) => candidateCard(c,i,true,true)).join('')}
    </div>
    <div id="deepFollow"></div>`;

  document.querySelectorAll('.candidate button').forEach(btn => {
    btn.addEventListener('click', () => inspectDeepCandidate(btn.dataset.name));
  });

  setTimeout(() => {
    const first = document.querySelector('.candidate.detail-reveal');
    if (first) first.scrollIntoView({behavior:'smooth', block:'center'});
  }, 350);

  // Každý nově dohledaný údaj se po svém zobrazení ještě krátce výrazně „předvede“,
  // aby hráč jasně viděl, co podrobná analýza přinesla nového.
  document.querySelectorAll('.candidate.detail-reveal').forEach((card, i) => {
    setTimeout(() => {
      card.classList.add('fact-present');
      const fact = card.querySelector('.new-fact');
      if (fact) fact.classList.add('fact-flash');
      setTimeout(() => {
        card.classList.remove('fact-present');
        if (fact) fact.classList.remove('fact-flash');
      }, 1900);
    }, 850 + i * 850);
  });
}

function inspectDeepCandidate(name) {
  const p = prints[currentPrint];
  const c = p.candidates.find(x => x.name === name);
  if (!c) return;
  const card = document.querySelector(`.candidate[data-name="${CSS.escape(name)}"]`);

  if (p.id === 3) {
    if (c.highlight) {
      flashCard(card, 'success');
      showToast("Pravděpodobná souvislost nalezena: Radka Müllerová.", "success", 3200);
      document.querySelectorAll('.candidate button').forEach(b => b.disabled = true);
      appendInlineConfirmation("PRAVDĚPODOBNÁ SOUVISLOST NALEZENA", "Profesní zařazení Radky Müllerové odpovídá možnému kontaktu s bankovní obálkou.");
      setTimeout(appendNextButton, 1300);
    } else {
      flashCard(card, 'error');
      showToast("Tato osoba s předmětem pravděpodobně nesouvisí.", "error", 2500);
    }
    return;
  }

  if (p.id === 4) {
    if (c.highlight) {
      flashCard(card, 'success');
      showToast("Významná případová souvislost nalezena u Karla Liebknechta.", "success", 3200);
      document.querySelectorAll('.candidate button').forEach(b => b.disabled = true);
      showFingerprintVerificationButton();
    } else {
      flashCard(card, 'error');
      showToast("Tato osoba s případem pravděpodobně nesouvisí.", "error", 2500);
    }
  }
}

function showFingerprintVerificationButton() {
  const follow = document.getElementById('deepFollow');
  if (!follow) return;
  follow.innerHTML = `
    <div class="deep-analysis link-check prompt">
      <div class="head">Karel Liebknecht – návaznost na další evidovanou stopu</div>
      <div class="body">
        <p>V databázi je u osoby evidována shoda s otiskem nalezeným na vozidle Sebastiana Rýdla. Pro potvrzení návaznosti proveďte cílené porovnání obou stop.</p>
        <div class="action-row">
          <button id="verifyPrintLink" class="btn primary pulse-button">PROVĚŘIT SOUVISLOST S OTISKEM</button>
        </div>
      </div>
    </div>`;
  const btn = document.getElementById('verifyPrintLink');
  btn.addEventListener('click', verifyFingerprintLink);
  setTimeout(() => follow.scrollIntoView({behavior:'smooth', block:'center'}), 200);
}

async function verifyFingerprintLink() {
  const follow = document.getElementById('deepFollow');
  if (!follow) return;
  follow.innerHTML = `
    <div class="deep-analysis emphasized link-check">
      <div class="head">Cílené porovnání evidovaných stop</div>
      <div class="body">
        <div class="scantext" id="linkScanText">Načítám stopu z vozidla Sebastiana Rýdla…</div>
        <div class="bar long"><span></span></div>
        <div class="link-facts" id="linkFacts">
          <span>STOPA 04 / OBÁLKA</span><b>↔</b><span>VOZIDLO / 9. 6. 2026</span>
        </div>
      </div>
    </div>`;
  const t = document.getElementById('linkScanText');
  await sleep(1500);
  if (t) t.textContent = "Porovnávám markanty a orientaci obou latentních stop…";
  await sleep(1700);
  if (t) t.textContent = "Shoda evidovaných stop potvrzena. Dohledávám profesní vazby osoby…";
  showToast("SHODA OTISKU POTVRZENA", "success", 2300);
  await sleep(2300);
  runProfessionalLink();
}

function runProfessionalLink() {
  const follow = document.getElementById('deepFollow');
  if (!follow) return;
  follow.innerHTML = `
    <div class="deep-analysis emphasized">
      <div class="head">Doplňkové prověření osoby – Karel Liebknecht</div>
      <div class="body">
        <div class="scantext">Prověřuji zaměstnanecké a profesní vazby…<br>Porovnávám dostupné pracovní evidence…</div>
        <div class="bar"><span></span></div>
      </div>
    </div>`;
  setTimeout(() => {
    follow.innerHTML = `
      <div class="deep-analysis final-link">
        <div class="head">Souvislost potvrzena</div>
        <div class="body">
          <p><strong>KAREL LIEBKNECHT</strong></p>
          <p>Zaměstnanec autoservisu <strong>Vopelák s.r.o.</strong><br><strong>Chlumecká 756/5, Praha 14-Černý Most</strong></p>
          <p><span class="badge link">Významná souvislost s případem nalezena</span></p>
          <div class="action-row">
            <button id="contactService" class="btn primary pulse-button">KONTAKTOVAT AUTOSERVIS</button>
          </div>
        </div>
      </div>`;
    showToast("PROFESNÍ VAZBA NA AUTOSERVIS NALEZENA", "success", 3200);
    const btn = document.getElementById('contactService');
    btn.addEventListener('click', () => {
      if (AUTOSERVIS_URL) {
        window.location.href = AUTOSERVIS_URL;
      } else {
        showSystemOverlay("EXTERNÍ ODKAZ NENÍ NASTAVEN", "Tlačítko je připravené. Finální adresa autoservisu bude doplněna později.", "info", 2400);
      }
    });
    setTimeout(() => follow.scrollIntoView({behavior:'smooth', block:'center'}), 200);
  }, 3200);
}
