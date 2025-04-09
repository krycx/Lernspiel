let currentRound = 0;
let selectedCells = [];
let totalScore = 0;
let timerInterval;
let timeLeft = 60;

const roundData = {
  1: {
    type: "table",
    data: [
      ["ID", "Name", "Geburtsdatum", "E-Mail", "Telefonnummer", "MitgliedSeit", "Vertragstyp"],
      ["1", "Müller", "12.03.1991", "mueller@email.de", "01512ABC987", "2018-05-01", "Premium"],
      ["2", "Peter", "1993-11-30", "", "01761234567", "2019-08-01", "Basic"],
      ["3", "Meier, Anna", "25/07/1985", "anna.meier@web.de", "00491711223344", "2021-02-30", ""],
      ["4", "Schmidt", "31.02.1990", "schmidt[at]mail.com", "+49160123456", "2023-04-15", "PREMIUM"],
      ["5", "Lara", "", "lara@@mail.de", "0160-123-456", "2025-01-01", "Basik"]
    ],
    errors: ["1-4", "2-3", "3-2", "3-6", "4-2", "4-3", "5-2", "5-3", "5-6"],
    learn: "🔎 Gelernt: Fehler in Datensätzen erkennen (z. B. falsche Formate, Tippfehler, Ungültiges)."
  },
  2: {
    type: "codeblock",
    data: [
      '{',
      '  "name": "Peter",',
      '  "email": "peter(at)mail.com",',
      '  "phone": "0176-123-456",',
      '  "birthdate": "1993-30-11"',
      '}'
    ],
    errors: ["2", "3", "4"],
    learn: "🔧 Gelernt: JSON prüfen – typische Fehler wie ungültige E-Mail, falsches Datum, Formatfehler."
  },
  3: {
    type: "cards",
    data: [
      { text: "Telefonnummer auf Webseite sichtbar", category: "verstoß" },
      { text: "Vertragstyp: Premium + Fitness + Ernährung", category: "kritisch" },
      { text: "Geburtsdatum für Kundenrabatt", category: "konform" },
      { text: "E-Mail ohne Verschlüsselung gespeichert", category: "verstoß" },
      { text: "Newsletter mit Einwilligung", category: "konform" },
      { text: "IP-Adresse gespeichert ohne Hinweis", category: "kritisch" }
    ],
    learn: "🛡️ Gelernt: Datenschutzverstöße und Konformität einschätzen."
  },
  4: {
    type: "quiz",
    question: "Welche dieser Formen eignen sich zur Visualisierung von Daten?",
    options: [
      { text: "Kuchendiagramm", correct: true },
      { text: "Textdokument", correct: false },
      { text: "Liniendiagramm", correct: true },
      { text: "Steckbrief", correct: false },
      { text: "Balkendiagramm", correct: true },
      { text: "Heatmap", correct: true }
    ],
    learn: "📊 Gelernt: Zur Visualisierung nutzt man Diagramme, Karten und Grafiken – nicht Fließtext oder Beschreibungen."
  },
  5: {
    type: "quiz",
    question: "Welche Aussagen betreffen personenbezogene oder primäre Daten?",
    options: [
      { text: "IP-Adresse", correct: true },
      { text: "PDF-Download einer Studie", correct: false },
      { text: "Kundennummer", correct: true },
      { text: "Statistikbericht aus Fremdquelle", correct: false },
      { text: "Ergebnisse einer eigenen Umfrage", correct: true },
      { text: "Browsertyp", correct: false }
    ],
    learn: "📂 Gelernt: Personenbezogene Daten identifizieren & zwischen Primär-/Sekundärdaten unterscheiden."
  }
};

function startGame(round) {
  currentRound = round;
  selectedCells = [];
  document.getElementById("roundSelection").classList.add("hidden");
  document.getElementById("gameArea").classList.remove("hidden");
  document.getElementById("result").classList.add("hidden");
  document.getElementById("dataTable").innerHTML = "";
  document.getElementById("codeBlock").innerHTML = "";
  document.getElementById("codeBlock").classList.add("hidden");
  document.getElementById("nextButton").classList.add("hidden");
  document.getElementById("roundLabel").textContent = `🧩 Runde ${currentRound} von ${Object.keys(roundData).length}`;
  resetTimer();

  const type = roundData[round].type;

  if (type === "cards") setupCardGame();
  else if (type === "quiz") setupQuiz();
  else if (type === "codeblock") setupCodeBlock();
  else if (type === "table") setupTable();
}

function setupTable() {
  const table = document.getElementById("dataTable");
  roundData[currentRound].data.forEach((row, r) => {
    const tr = document.createElement("tr");
    row.forEach((cell, c) => {
      const td = r === 0 ? document.createElement("th") : document.createElement("td");
      td.textContent = cell;
      if (r !== 0) {
        td.dataset.cellId = `${r}-${c}`;
        td.onclick = () => {
          td.classList.toggle("selected");
          toggleSelection(td.dataset.cellId);
        };
      }
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
  document.getElementById("checkButton").classList.remove("hidden");
}

function setupCodeBlock() {
  const block = document.getElementById("codeBlock");
  block.classList.remove("hidden");
  roundData[currentRound].data.forEach((line, i) => {
    const div = document.createElement("div");
    div.textContent = line;
    div.className = "code-line";
    div.dataset.cellId = i.toString();
    div.onclick = () => {
      div.classList.toggle("selected");
      toggleSelection(div.dataset.cellId);
    };
    block.appendChild(div);
  });
  document.getElementById("checkButton").classList.remove("hidden");
}

function setupQuiz() {
  const block = document.getElementById("codeBlock");
  block.classList.remove("hidden");
  const quiz = roundData[currentRound];
  let html = `<h3>${quiz.question}</h3><form id="quizForm">`;
  quiz.options.forEach((opt, i) => {
    html += `
      <label>
        <input type="checkbox" data-correct="${opt.correct}"> ${opt.text}
      </label><br>`;
  });
  html += `</form>`;
  block.innerHTML = html;
  document.getElementById("checkButton").classList.remove("hidden");
}

function setupCardGame() {
  const block = document.getElementById("codeBlock");
  block.classList.remove("hidden");
  block.innerHTML = `
    <h3>Ziehe jede Karte in die passende Kategorie:</h3>
    <div class="card-area">
      <div class="card-pool" id="cardPool"></div>
      <div class="categories">
        <div class="dropzone" data-zone="verstoß">🔒 Verstoß</div>
        <div class="dropzone" data-zone="kritisch">⚠️ Kritisch</div>
        <div class="dropzone" data-zone="konform">✅ Konform</div>
      </div>
    </div>
  `;

  const pool = document.getElementById("cardPool");
  roundData[3].data.forEach((item, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.textContent = item.text;
    card.draggable = true;
    card.dataset.correct = item.category;
    card.ondragstart = e => e.dataTransfer.setData("text/plain", i);
    pool.appendChild(card);
  });

  document.querySelectorAll(".dropzone").forEach(zone => {
    zone.ondragover = e => e.preventDefault();
    zone.ondrop = e => {
      e.preventDefault();
      const idx = e.dataTransfer.getData("text/plain");
      const card = document.querySelectorAll(".card")[idx];
      zone.appendChild(card);
      card.dataset.dropped = zone.dataset.zone;
    };
  });

  document.getElementById("checkButton").classList.remove("hidden");
}

function toggleSelection(id) {
  const index = selectedCells.indexOf(id);
  if (index === -1) selectedCells.push(id);
  else selectedCells.splice(index, 1);
}

function checkErrors() {
  clearInterval(timerInterval);
  const info = roundData[currentRound];
  let score = 0;

  if (info.type === "cards") {
    document.querySelectorAll(".card").forEach(card => {
      if (card.dataset.correct === card.dataset.dropped) {
        score += 2;
        card.style.backgroundColor = "#3a7d44";
      } else {
        card.style.backgroundColor = "#992222";
      }
    });
  } else if (info.type === "quiz") {
    const inputs = document.querySelectorAll("#quizForm input[type='checkbox']");
    inputs.forEach(input => {
      const correct = input.dataset.correct === "true";
      if (input.checked === correct) {
        score += 1;
        input.parentElement.style.color = "#3a7d44";
      } else {
        input.parentElement.style.color = "#992222";
      }
    });
  } else {
    selectedCells.forEach(id => {
      if (info.errors.includes(id)) score += 2;
      else score -= 1;
    });
  }

  totalScore += score;
  let res = `<p>Runde ${currentRound}: <strong>${score}</strong> Punkte</p><p>${info.learn}</p>`;
  if (currentRound === Object.keys(roundData).length) {
    res += `<hr><p><strong>Gesamtpunktzahl: ${totalScore}</strong></p>`;
  }

  document.getElementById("result").innerHTML = res;
  document.getElementById("result").classList.remove("hidden");
  document.getElementById("checkButton").classList.add("hidden");

  if (currentRound < Object.keys(roundData).length) {
    document.getElementById("nextButton").classList.remove("hidden");
  }
}

function nextRound() {
  if (currentRound < Object.keys(roundData).length) {
    startGame(currentRound + 1);
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  timeLeft = 60;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      checkErrors();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById("timer").textContent = `⏱️ ${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
}
