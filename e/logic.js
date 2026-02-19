import {
  loadProgress,
  markSolved,
  getLetterScore,
  getTotalScore,
} from "../progress.js"

loadProgress()

const __INTERNAL_RBAC__ = {
  enum: ["guest", "user", "owner"],
  promoteEndpoint: "/internal/promote",
}

const els = {
  letterScore: document.getElementById("letterScore"),
  totalScore: document.getElementById("totalScore"),

  lab1Status: document.getElementById("lab1Status"),
  lab1Result: document.getElementById("lab1Result"),

  rolesInput: document.getElementById("rolesInput"),
  endpointInput: document.getElementById("endpointInput"),
  checkBtn: document.getElementById("checkBtn"),

  // lab 2
  lab2Status: document.getElementById("lab2Status"),
  lab2Result: document.getElementById("lab2Result"),

  statusCodeInput: document.getElementById("statusCodeInput"),
  checkStatusBtn: document.getElementById("checkStatusBtn"),

  // lab 3
  lab3Status: document.getElementById("lab3Status"),
  lab3Result: document.getElementById("lab3Result"),
  finalInput: document.getElementById("finalInput"),
  checkFinalBtn: document.getElementById("checkFinalBtn"),
}

function normalize(s) {
  return (s ?? "").toString().trim().toLowerCase()
}

function normalizeRolesInput(s) {
  // "guest, user, owner" -> "guest,user,owner"
  return normalize(s)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .join(",")
}

function renderScores() {
  els.letterScore.textContent = `E: ${getLetterScore("E")}/3`
  els.totalScore.textContent = `Total: ${getTotalScore()}/18`
}

function renderEStatuses() {
  const progress = loadProgress()

  if (els.lab1Status)
    els.lab1Status.textContent = progress.E.solved[0] ? "Solved" : "Not solved"

  if (els.lab2Status)
    els.lab2Status.textContent = progress.E.solved[1] ? "Solved" : "Not solved"

  if (els.lab3Status)
    els.lab3Status.textContent = progress.E.solved[2] ? "Solved" : "Not solved"
}

function showResult(html) {
  if (els.lab1Result) els.lab1Result.innerHTML = html
}

function checkTask1() {
  const roles = normalizeRolesInput(els.rolesInput?.value)
  const endpoint = normalize(els.endpointInput?.value)

  const expectedRoles = __INTERNAL_RBAC__.enum.join(",")
  const rolesOk = roles === expectedRoles

  // recommended: forgiving match
  const endpointOk = endpoint.includes(__INTERNAL_RBAC__.promoteEndpoint)

  if (rolesOk && endpointOk) {
    markSolved("E", 0)
    showResult(`<div class="alert alert-success mb-0"> Task 1 solved</div>`)
  } else {
    showResult(
      `<div class="alert alert-warning mb-0">Go inside the <code>logic.js</code> file</div>`,
    )
  }

  renderEStatuses()
  renderScores()
}

function onEnterRunCheck(e) {
  if (e.key === "Enter") checkTask1()
}

// Create user
function bootstrapEopUser() {
  const existing = localStorage.getItem("eop_user")
  if (existing) return

  const user = {
    id: crypto.randomUUID(),
    username: "eop_user",
    email: "eop_user@corp.local",

    profile: {
      firstName: "Eop",
      lastName: "User",
      createdAt: new Date().toISOString(),
      loginCount: 1,

      security: {
        session: {
          issuedAt: Date.now(),
          expiresAt: Date.now() + 1000 * 60 * 60,
          trustLevel: 1,
        },
        claims: {
          tenant: "corp-internal",
          scope: ["read:profile", "read:orders"],
          access: {
            level: "guest",
            hierarchy: 0,
          },
        },
      },
    },

    flags: {
      emailVerified: false,
      mfaEnabled: false,
      betaAccess: false,
    },

    metadata: {
      lastLoginIp: "83.91.22.101",
      device: "Chrome 122 / macOS",
      riskScore: 12,
    },
  }

  localStorage.setItem("eop_user", JSON.stringify(user))
}

// lab2
function checkTask2() {
  const value = normalize(els.statusCodeInput?.value)

  if (value === "304") {
    markSolved("E", 1)

    els.lab2Result.innerHTML = `
  <div class="alert alert-success mb-0">
    <div class="fw-semibold">Correct (Task 2 solved)</div>

    <div class="small mt-2">
      <strong>304 = Not Modified.</strong> This is a browser cache response..
      not an authorization decision.
    </div>

    <div class="small mt-1">
      You were redirected because of a <em>client-side</em> role check,
      not because the server blocked you.
    </div>

    <div class="small mt-1">
      <strong>Why this matters:</strong> If protection happens only in JavaScript,
      attackers can bypass it by modifying localStorage.

      Print the value: 
      <code>JSON.parse(localStorage.getItem("eop_user"))</code>

      Edit the ownership <br>
      <code>
      const user = JSON.parse(localStorage.getItem("eop_user")); <br>
      <br>
      JSON.parse(localStorage.getItem("eop_user")) <br>
      user.profile.security.claims.access.level = "owner"; <br>
      user.profile.security.claims.access.hierarchy = 999; <br>
      <br>
      localStorage.setItem("eop_user", JSON.stringify(user));</code> <br>
      Now you can go back to <code>/internal</code>
      <br>
      This is also achievable by just disabling javascript
    </code>
    </div>
  </div>
`
  } else {
    els.lab2Result.innerHTML = `
      <div class="alert alert-warning mb-0">
        Not quite. Check the Network tab carefully for /internal 
      </div>
    `
  }

  renderEStatuses()
  renderScores()
}

// lab 3
function checkTask3() {
  const value = els.finalInput?.value?.trim()

  if (value === "Z29vZCBqb2I=") {
    markSolved("E", 2)

    els.lab3Result.innerHTML = `
      <div class="alert alert-success mb-0">
        Access accepted.
      </div>
    `
  } else {
    els.lab3Result.innerHTML = `
      <div class="alert alert-warning mb-0">
        Try again.
      </div>
    `
  }

  renderEStatuses()
  renderScores()
}

els.checkBtn?.addEventListener("click", checkTask1)
els.endpointInput?.addEventListener("keydown", onEnterRunCheck)
els.rolesInput?.addEventListener("keydown", onEnterRunCheck)
els.checkStatusBtn?.addEventListener("click", checkTask2)
els.statusCodeInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") checkTask2()
})
els.checkFinalBtn?.addEventListener("click", checkTask3)
els.finalInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") checkTask3()
})

renderEStatuses()
renderScores()
bootstrapEopUser()
