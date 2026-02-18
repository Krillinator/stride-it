// i/logic.js
import {
  loadProgress,
  markSolved,
  getLetterScore,
  getTotalScore,
} from "../progress.js"

loadProgress()

const els = {
  letterScore: document.getElementById("letterScore"),
  totalScore: document.getElementById("totalScore"),

  // Status badges
  lab1Status: document.getElementById("lab1Status"), // base64
  lab2Status: document.getElementById("lab2Status"), // md5 / debug dump
  lab3Status: document.getElementById("lab3Status"), // jwt

  // Result areas
  lab1Result: document.getElementById("lab1Result"),
  lab2Result: document.getElementById("lab2Result"),
  lab3Result: document.getElementById("lab3Result"),
}

function normalize(s) {
  return (s ?? "").toString().trim().toLowerCase()
}

function renderScores() {
  els.letterScore.textContent = `I: ${getLetterScore("I")}/3`
  els.totalScore.textContent = `Total: ${getTotalScore()}/18`
}

function renderIStatuses() {
  const progress = loadProgress()
  if (els.lab1Status)
    els.lab1Status.textContent = progress.I.solved[0] ? "Solved" : "Not solved"
  if (els.lab2Status)
    els.lab2Status.textContent = progress.I.solved[1] ? "Solved" : "Not solved"
  if (els.lab3Status)
    els.lab3Status.textContent = progress.I.solved[2] ? "Solved" : "Not solved"
}

function makeInputLab({ mountEl, placeholder, buttonText, onCheck }) {
  if (!mountEl) return

  mountEl.innerHTML = `
    <div class="d-flex gap-2 align-items-center flex-wrap">
      <input class="form-control form-control-sm w-auto" style="min-width: 220px"
             type="text" placeholder="${placeholder}" id="labInput">
      <button class="btn btn-primary btn-sm" id="labSubmit">${buttonText}</button>
    </div>
    <div class="mt-3" id="labFeedback"></div>
  `

  const input = mountEl.querySelector("#labInput")
  const submit = mountEl.querySelector("#labSubmit")
  const feedback = mountEl.querySelector("#labFeedback")

  const run = () => onCheck({ input, feedback })

  submit.addEventListener("click", run)
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") run()
  })
}

// Lab 1
makeInputLab({
  mountEl: els.lab2Result,
  placeholder: "Type the core flaw (e.g. md5)",
  buttonText: "Submit",
  onCheck: ({ input, feedback }) => {
    const answer = normalize(input.value)

    if (answer === "md5") {
      markSolved("I", 1) // I task index for this lab
      feedback.innerHTML = `
        <div class="alert alert-success mb-0">
          Correct. Exposing hashes/tokens/IPs + using weak hashing (MD5) is a confidentiality failure.
        </div>
      `
    } else {
      feedback.innerHTML = `
        <div class="alert alert-warning mb-0">
          Not quite. Focus on the sensitive fields and the weak hashing shown in the dump.
        </div>
      `
    }

    renderIStatuses()
    renderScores()
  },
})

// Lab 2
makeInputLab({
  mountEl: els.lab1Result,
  placeholder: "Decoded password (base64 → plaintext)",
  buttonText: "Submit",
  onCheck: ({ input, feedback }) => {
    const answer = normalize(input.value)

    // Accept a couple of variants since you said “or something”
    const accepted = new Set([
      "mysupersecretpas",
      "mysupersecretpass",
      "my super secret pas",
      "my super secret pass",
    ])

    if (accepted.has(answer)) {
      markSolved("I", 0)
      feedback.innerHTML = `
        <div class="alert alert-success mb-0">
          Correct. Base64 is not encryption — it’s just encoding, so secrets are easily revealed.
        </div>
      `
    } else {
      feedback.innerHTML = `
        <div class="alert alert-warning mb-0">
          Not quite. Try decoding the base64 string to plaintext.
        </div>
      `
    }

    renderIStatuses()
    renderScores()
  },
})

// Lab 3
makeInputLab({
  mountEl: els.lab3Result,
  placeholder: "What is the user's password?",
  buttonText: "Submit",
  onCheck: ({ input, feedback }) => {
    const answer = normalize(input.value)

    if (answer === "supersecret") {
      markSolved("I", 2)
      feedback.innerHTML = `
        <div class="alert alert-success mb-0">
          Correct. Never put secrets (passwords/SSNs) inside JWT payloads — anyone holding the token can read them.
        </div>
      `
    } else {
      feedback.innerHTML = `
        <div class="alert alert-warning mb-0">
          Wrong. Hint: JWT payloads are readable by clients (base64url). Submit again.
        </div>
      `
    }

    renderIStatuses()
    renderScores()
  },
})

renderIStatuses()
renderScores()
