import {
  loadProgress,
  markSolved,
  getLetterScore,
  getTotalScore,
} from "../progress.js"
import { S_PROBLEMS } from "./problems.js"

// Ensure localStorage exists
loadProgress()

// Use the first problem for now (S0)
const problem = S_PROBLEMS[0]

const els = {
  letterScore: document.getElementById("letterScore"),
  totalScore: document.getElementById("totalScore"),

  problemTitle: document.getElementById("problemTitle"),
  problemIntro: document.getElementById("problemIntro"),
  problemMission: document.getElementById("problemMission"),
  problemStatus: document.getElementById("problemStatus"),

  usernameInput: document.getElementById("usernameInput"),
  messageInput: document.getElementById("messageInput"),
  sendBtn: document.getElementById("sendBtn"),
  resetBtn: document.getElementById("resetBtn"),
  labResult: document.getElementById("labResult"),
}

function renderScores() {
  els.letterScore.textContent = `S: ${getLetterScore("S")}/3`
  els.totalScore.textContent = `Total: ${getTotalScore()}/18`
}

function renderProblem() {
  // Show the "locked" username in the UI
  els.usernameInput.value = problem.realUsername
  els.problemTitle.textContent = problem.title
  // Status badge based on progress
  const progress = loadProgress()
  const solved = progress.S.solved[0] === true

  els.problemIntro.textContent = solved ? problem.intro : ""
  els.problemMission.textContent = solved ? problem.mission : ""
  els.problemStatus.textContent = solved ? "Solved " : "Not solved"
}

function showResult(html) {
  els.labResult.innerHTML = html

  // Scroll to result smoothly
  els.labResult.scrollIntoView({
    behavior: "smooth",
    block: "start",
  })
}

// "Real" username lives in JS (trusted)
const REAL_USERNAME = problem.realUsername

els.sendBtn.addEventListener("click", () => {
  const submittedUsername = els.usernameInput.value
  const msg = els.messageInput.value.trim() || "(no message)"

  // Hardcoded value for quick prototyping
  if (submittedUsername !== REAL_USERNAME) {
    markSolved("S", 0)
    showResult(`
          <div class="alert alert-success mb-0">
            <div class="fw-semibold">Spoofing successful  (Problem 1 solved)</div>
            <div class="small">Submitted as <strong>${escapeHtml(submittedUsername)}</strong> but real user is <strong>${escapeHtml(REAL_USERNAME)}</strong>.</div>
            <div class="small mt-1">Lesson: the browser can lie. Identity must be verified server-side.</div>
          </div>
        `)
  } else {
    showResult(`
          <div class="alert alert-warning mb-0">
            <div class="fw-semibold">Failed to succesfully spoof.</div>
            <div class="small">You sent: <strong>${escapeHtml(msg)}</strong> as <strong>${escapeHtml(submittedUsername)}</strong>.</div>
            <div class="small mt-1">Try changing the username through DevTools or delete 'readonly'.</div>
          </div>
        `)
  }

  renderProblem()
  renderScores()
})

// Problem 2
// --- Problem 2: Email sender spoof (data-real-sender) ---
const emailCard = document.getElementById("emailCard")
const emailStatus = document.getElementById("emailStatus")
const realSenderInput = document.getElementById("realSenderInput")
const checkSenderBtn = document.getElementById("checkSenderBtn")
const emailResult = document.getElementById("emailResult")

function renderEmailStatus() {
  const progress = loadProgress()
  emailStatus.textContent = progress.S.solved[1] ? "Solved" : "Not solved"
}

checkSenderBtn.addEventListener("click", () => {
  const realSender = (emailCard.dataset.realSender || "").trim()
  const answer = (realSenderInput.value || "").trim()

  if (answer.toLowerCase() === realSender.toLowerCase()) {
    markSolved("S", 1)
    emailResult.innerHTML = `
      <div class="alert alert-success mb-0">
        <div class="fw-semibold">Correct (Problem 2 solved)</div>
        <div class="small">Real sender: <strong>${escapeHtml(realSender)}</strong></div>
        <div class="small mt-1">Lesson: UI identity can be spoofed—verify the source.</div>
      </div>
    `
  } else {
    emailResult.innerHTML = `
      <div class="alert alert-warning mb-0">
        <div class="fw-semibold">Not quite.</div>
        <div class="small">Inspect the email card and find <code>data-real-sender</code>.</div>
      </div>
    `
  }

  renderScores()
  renderEmailStatus()
})

const site = {
  lab: document.getElementById("siteSpoofLab"),
  status: document.getElementById("siteStatus"),
  link: document.getElementById("secureLink"),
  input: document.getElementById("siteDomainInput"),
  btn: document.getElementById("checkSiteBtn"),
  result: document.getElementById("siteResult"),
}

function getDomain(urlString) {
  try {
    return new URL(urlString).hostname
  } catch {
    return ""
  }
}

function renderSiteStatus() {
  const progress = loadProgress()
  site.status.textContent = progress.S.solved[2] ? "Solved" : "Not solved"
}

site.btn.addEventListener("click", () => {
  const expectedUrl = site.link.dataset.url // full URL
  const answerRaw = (site.input.value || "").trim()

  // normalize a bit (ignore trailing slash + case)
  const norm = (s) => s.trim().replace(/\/+$/, "").toLowerCase()

  if (norm(answerRaw) === norm(expectedUrl)) {
    markSolved("S", 2)
    site.result.innerHTML = `
      <div class="alert alert-success mb-0">
        <div class="fw-semibold">Correct (Problem 3 solved)</div>
        <div class="small">Real destination: <strong>${escapeHtml(expectedUrl)}</strong></div>
        <div class="small mt-1">Lesson: link text can lie — check the real destination.</div>
      </div>
    `
  } else {
    site.result.innerHTML = `
      <div class="alert alert-warning mb-0">
        <div class="fw-semibold">Not quite.</div>
        <div class="small">Tip: copy the link address and paste the full destination URL.</div>
      </div>
    `
  }

  renderSiteStatus()
  renderScores()
  site.result.scrollIntoView({ behavior: "smooth", block: "start" })
})

// Basic escaping
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

// Init
renderSiteStatus()
renderProblem()
renderScores()
renderEmailStatus()
