import {
  loadProgress,
  markSolved,
  getLetterScore,
  getTotalScore,
} from "../progress.js"

loadProgress()

const LOG_KEY = "r_activity_log"

const els = {
  letterScore: document.getElementById("letterScore"),
  totalScore: document.getElementById("totalScore"),
  logStatus: document.getElementById("logStatus"),
  clearLogBtn: document.getElementById("clearLogBtn"),
  logTerminal: document.getElementById("logTerminal"),
  logResult: document.getElementById("logResult"),
}

function initRLog() {
  const existing = localStorage.getItem(LOG_KEY)

  if (!existing) {
    localStorage.setItem(LOG_KEY, JSON.stringify([]))
  }
}

function renderScores() {
  els.letterScore.textContent = `R: ${getLetterScore("R")}/3`
  els.totalScore.textContent = `Total: ${getTotalScore()}/18`
}

function renderLogStatus() {
  const progress = loadProgress()
  els.logStatus.textContent = progress.R.solved[0] ? "Solved" : "Not solved"
}

function renderRStatuses() {
  const progress = loadProgress()

  // Task 2 (quiz2)
  if (document.getElementById("quiz2Status")) {
    document.getElementById("quiz2Status").textContent = progress.R.solved[1]
      ? "Solved"
      : "Not solved"
  }

  // Task 3 (quiz3)
  if (document.getElementById("quiz3Status")) {
    document.getElementById("quiz3Status").textContent = progress.R.solved[2]
      ? "Solved"
      : "Not solved"
  }
}

function appendLog(message) {
  const entries = JSON.parse(localStorage.getItem(LOG_KEY) || "[]")

  const entry = {
    timestamp: new Date().toISOString(),
    user: "alice",
    action: message,
  }

  entries.push(entry)

  localStorage.setItem(LOG_KEY, JSON.stringify(entries))
  renderLog()
}

fakeActionBtn.addEventListener("click", () => {
  appendLog("Approved invoice #" + Math.floor(Math.random() * 50000))
})

function renderLog() {
  const entries = JSON.parse(localStorage.getItem(LOG_KEY) || "[]")
  els.logTerminal.innerHTML = entries
    .map((e) => `<div>[${e.timestamp}] ${e.action}</div>`)
    .join("")
}

// lab2
const quiz2Options = document.querySelectorAll(".quiz2-option")
const quiz2Result = document.getElementById("quiz2Result")
const quiz2Status = document.getElementById("quiz2Status")

quiz2Options.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.dataset.correct === "true") {
      markSolved("R", 1)

      quiz2Result.innerHTML = `
        <div class="alert alert-success mb-0">
          Correct. Without audit logs, actions can be denied.
        </div>
      `
    } else {
      quiz2Result.innerHTML = `
        <div class="alert alert-warning mb-0">
          Not quite. Think about accountability and proof.
        </div>
      `
    }

    quiz2Status.textContent = loadProgress().R.solved[1]
      ? "Solved"
      : "Not solved"

    renderScores()
  })
})

// lab3
const quiz3Options = document.querySelectorAll(".quiz3-option")
const quiz3Result = document.getElementById("quiz3Result")
const quiz3Status = document.getElementById("quiz3Status")

quiz3Options.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.dataset.correct === "true") {
      markSolved("R", 2)

      quiz3Result.innerHTML = `
        <div class="alert alert-success mb-0">
          Correct. Logs must be protected or tamper-evident.
        </div>
      `
    } else {
      quiz3Result.innerHTML = `
        <div class="alert alert-warning mb-0">
          Not quite. The issue is log integrity.
        </div>
      `
    }

    quiz3Status.textContent = loadProgress().R.solved[2]
      ? "Solved"
      : "Not solved"

    renderScores()
  })
})

els.clearLogBtn.addEventListener("click", () => {
  const entries = JSON.parse(localStorage.getItem(LOG_KEY) || "[]")

  if (entries.length > 0) {
    // They are removing evidence
    localStorage.removeItem(LOG_KEY)

    markSolved("R", 0)

    els.logResult.innerHTML = `
      <div class="alert alert-success mb-0">
        <div class="fw-semibold">Correct (Task 1 solved)</div>
        <div class="small">Activity log removed.</div>
        <div class="small mt-1">Lesson: In repudiation, an attacker may delete or alter logs to remove traces of their actions.</div>
        <div class="small mt-1">If logs can be erased, there is no proof of what really happened.</div>
      </div>
    `
  } else {
    els.logResult.innerHTML = `
      <div class="alert alert-warning mb-0">
        <div class="fw-semibold">Nothing to remove.</div>
        <div class="small">Perform an action first to generate log evidence.</div>
      </div>
    `
  }

  renderLog()
  renderLogStatus()
  renderScores()

  els.logResult.scrollIntoView({ behavior: "smooth", block: "start" })
})

renderLog()
renderLogStatus()
renderRStatuses()
renderScores()
initRLog()
