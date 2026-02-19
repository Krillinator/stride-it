import {
  loadProgress,
  markSolved,
  getLetterScore,
  getTotalScore,
} from "../progress.js"

loadProgress()

// Elements
const els = {
  letterScore: document.getElementById("letterScore"),
  totalScore: document.getElementById("totalScore"),

  lab1Status: document.getElementById("lab1Status"),
  lab1Result: document.getElementById("lab1Result"),

  attackBtn: document.getElementById("attackBtn"),
  toggleRateBtn: document.getElementById("toggleRateBtn"),
  resetBtn: document.getElementById("resetBtn"),

  serviceStatus: document.getElementById("serviceStatus"),
  rateLimitLabel: document.getElementById("rateLimitLabel"),
  poolLabel: document.getElementById("poolLabel"),
  clickLabel: document.getElementById("clickLabel"),
  poolBar: document.getElementById("poolBar"),

  // lab 2
  lab2Status: document.getElementById("lab2Status"),
  lab2Result: document.getElementById("lab2Result"),

  openConnBtn: document.getElementById("openConnBtn"),
  toggleTimeoutBtn: document.getElementById("toggleTimeoutBtn"),
  resetSlowBtn: document.getElementById("resetSlowBtn"),

  slowServerStatus: document.getElementById("slowServerStatus"),
  slowTimeoutLabel: document.getElementById("slowTimeoutLabel"),
  slowOpenLabel: document.getElementById("slowOpenLabel"),
  slowBlockedLabel: document.getElementById("slowBlockedLabel"),
  slowBar: document.getElementById("slowBar"),

  // lab 3
  lab3Status: document.getElementById("lab3Status"),
  lab3Result: document.getElementById("lab3Result"),

  jsonSubmitBtn: document.getElementById("jsonSubmitBtn"),
  toggleJsonLimitBtn: document.getElementById("toggleJsonLimitBtn"),
  resetJsonBtn: document.getElementById("resetJsonBtn"),

  jsonInput: document.getElementById("jsonInput"),
  jsonStatus: document.getElementById("jsonStatus"),
  jsonLimitLabel: document.getElementById("jsonLimitLabel"),
  jsonDepthLabel: document.getElementById("jsonDepthLabel"),
  jsonWorkLabel: document.getElementById("jsonWorkLabel"),
}

// State
const MAX_POOL = 500_000

let pool = MAX_POOL
let handled = 0
let solved = false

// Rate limiting
let rateLimitOn = false
let lastAllowed = 0
const RATE_LIMIT_MS = 120 // allow ~8 clicks/sec

// Rendering
function renderScores() {
  els.letterScore.textContent = `D: ${getLetterScore("D")}/3`
  els.totalScore.textContent = `Total: ${getTotalScore()}/18`
}

function renderStatusBadge() {
  const progress = loadProgress()

  if (els.lab1Status)
    els.lab1Status.textContent = progress.D.solved[0] ? "Solved" : "Not solved"
  if (els.lab2Status)
    els.lab2Status.textContent = progress.D.solved[1] ? "Solved" : "Not solved"
  if (els.lab3Status)
    els.lab3Status.textContent = progress.D.solved[2] ? "Solved" : "Not solved"
}

function renderUI() {
  els.poolLabel.textContent = `${Math.max(pool, 0)} / ${MAX_POOL}`
  els.clickLabel.textContent = handled
  els.rateLimitLabel.textContent = rateLimitOn ? "ON" : "OFF"

  const percent = Math.max(0, (pool / MAX_POOL) * 100)
  els.poolBar.style.width = `${percent}%`

  if (pool <= 0) {
    els.serviceStatus.textContent = "503 Service Unavailable"
  } else if (pool <= MAX_POOL * 0.2) {
    els.serviceStatus.textContent = "Degraded"
  } else {
    els.serviceStatus.textContent = "Healthy"
  }
}

function showResult(html) {
  els.lab1Result.innerHTML = html
}

// Core Logic
function allowedNow() {
  if (!rateLimitOn) return true

  const now = Date.now()
  if (now - lastAllowed < RATE_LIMIT_MS) return false

  lastAllowed = now
  return true
}

function handleRequest() {
  if (pool <= 0) return
  if (!allowedNow()) return

  pool--
  handled++
  renderUI()

  if (pool <= 0 && !solved) {
    solved = true

    markSolved("D", 0)

    showResult(`
  <div class="alert alert-success mb-0">
    <div class="fw-semibold">Correct (Task 1 solved)</div>

    <div class="small mt-2">
      <strong>What just happened:</strong>  
      You automated requests faster than a human could send them and exhausted a limited resource pool.
    </div>

    <div class="small mt-1">
      <strong>Why it slowed down:</strong>  
      The browser executed thousands of synchronous clicks, consuming CPU and blocking normal rendering.
    </div>

    <div class="small mt-1">
      <strong>Why this matters:</strong>  
      When critical resources run out, legitimate users lose access.. availability fails.
    </div>

    <div class="small mt-1">
      <strong>DoS in one sentence:</strong>  
      Denial of Service overwhelms a system until it can't serve real users.
    </div>

    <div class="small mt-2">
      Try enabling rate limiting and repeat the attack.
    </div>
  </div>
`)

    renderStatusBadge()
    renderScores()

    simulateCpuOverload(2000)
  }
}

// Overload Simulation
function simulateCpuOverload(durationMs) {
  const end = performance.now() + durationMs

  function burnChunk() {
    for (let i = 0; i < 2_500_000; i++) {
      Math.sqrt(i)
    }

    if (performance.now() < end) {
      requestAnimationFrame(burnChunk)
    }
  }

  requestAnimationFrame(burnChunk)
}

// Controls
els.attackBtn.addEventListener("click", handleRequest)

els.toggleRateBtn.addEventListener("click", () => {
  rateLimitOn = !rateLimitOn
  lastAllowed = 0

  showResult(`
    <div class="alert alert-info mb-0">
      <div class="fw-semibold">Rate limiting ${rateLimitOn ? "ENABLED" : "DISABLED"}</div>
      <div class="small mt-1">
        Requests faster than ${RATE_LIMIT_MS}ms will be ignored.
      </div>
    </div>
  `)

  renderUI()
})

els.resetBtn.addEventListener("click", () => {
  pool = MAX_POOL
  handled = 0
  solved = false
  lastAllowed = 0

  showResult("")
  renderUI()
})

// lab 2
// --------------------
// Lab 2 — Slowloris (Connection holding)
// --------------------
const SLOW_MAX = 50
const IDLE_TIMEOUT_MS = 2500

let slowOpen = 0
let slowBlocked = 0
let slowSolved = false

let idleTimeoutOn = true
let connTimers = [] // holds timeout IDs for connections

function showLab2(html) {
  if (els.lab2Result) els.lab2Result.innerHTML = html
}

function renderSlowUI() {
  if (!els.slowOpenLabel) return

  els.slowTimeoutLabel.textContent = idleTimeoutOn ? "ON" : "OFF"
  els.slowOpenLabel.textContent = `${slowOpen} / ${SLOW_MAX}`
  els.slowBlockedLabel.textContent = `${slowBlocked}`

  const pct = Math.max(0, Math.min(100, (slowOpen / SLOW_MAX) * 100))
  els.slowBar.style.width = `${pct}%`

  if (slowOpen >= SLOW_MAX) {
    els.slowServerStatus.textContent = "No slots available"
  } else if (slowOpen >= Math.ceil(SLOW_MAX * 0.8)) {
    els.slowServerStatus.textContent = "Degraded"
  } else {
    els.slowServerStatus.textContent = "Healthy"
  }
}

function closeOneSlowConnection() {
  if (slowOpen <= 0) return
  slowOpen--
  renderSlowUI()
}

function openSlowConnection() {
  // If no slots, legit users get blocked
  if (slowOpen >= SLOW_MAX) {
    slowBlocked++
    renderSlowUI()

    // Win condition: we proved availability failure for legit users
    if (!slowSolved && slowBlocked >= 3) {
      slowSolved = true
      markSolved("D", 1)

      showLab2(`
        <div class="alert alert-success mb-0">
          <div class="fw-semibold">Correct (Task 2 solved)</div>
          <div class="small mt-2">
            <strong>What just happened:</strong> You filled the connection slots by keeping connections open.
          </div>
          <div class="small mt-1">
            <strong>Why this matters:</strong> Real users get blocked even without high traffic.. availability fails.
          </div>
          <div class="small mt-1">
            <strong>Slowloris in one line:</strong> Many slow, half-open connections can starve a server.
          </div>
          <div class="small mt-2">
            Toggle idle timeout ON and retry — notice how it recovers.
          </div>
        </div>
      `)

      renderStatusBadge()
      renderScores()
    }

    return
  }

  // Otherwise, consume a slot
  slowOpen++
  renderSlowUI()

  // If idle timeout is ON, connection closes automatically later
  if (idleTimeoutOn) {
    const t = setTimeout(() => {
      closeOneSlowConnection()
    }, IDLE_TIMEOUT_MS)
    connTimers.push(t)
  }
}

function resetSlowLab() {
  connTimers.forEach(clearTimeout)
  connTimers = []

  slowOpen = 0
  slowBlocked = 0
  slowSolved = false

  showLab2("")
  renderSlowUI()
}

if (els.openConnBtn)
  els.openConnBtn.addEventListener("click", openSlowConnection)

if (els.toggleTimeoutBtn)
  els.toggleTimeoutBtn.addEventListener("click", () => {
    idleTimeoutOn = !idleTimeoutOn

    showLab2(`
      <div class="alert alert-info mb-0">
        <div class="fw-semibold">Idle timeout ${idleTimeoutOn ? "ENABLED" : "DISABLED"}</div>
        <div class="small mt-1">
          When enabled, idle connections are closed after ${IDLE_TIMEOUT_MS}ms.
        </div>
      </div>
    `)

    renderSlowUI()
  })

// --------------------
// Lab 3 — JSON Bomb (Deep nesting)
// --------------------
let jsonSolved = false
let depthLimitOn = true

const MAX_SAFE_DEPTH = 120 // when limit is ON, reject above this
const DEGRADE_DEPTH = 160 // where we start calling it "Degraded"
const DOS_DEPTH = 220 // where we call it "Unresponsive" (win condition)

// track "work" so students see cost
let jsonWorkUnits = 0

function showLab3(html) {
  if (els.lab3Result) els.lab3Result.innerHTML = html
}

function setJsonUI({ statusText, depth }) {
  if (els.jsonStatus) els.jsonStatus.textContent = statusText
  if (els.jsonLimitLabel)
    els.jsonLimitLabel.textContent = depthLimitOn ? "ON" : "OFF"
  if (els.jsonDepthLabel) els.jsonDepthLabel.textContent = String(depth ?? 0)
  if (els.jsonWorkLabel) els.jsonWorkLabel.textContent = String(jsonWorkUnits)
}

function getDepth(o) {
  // Only counts nested {a:{a:{...}}} style objects
  let d = 0
  let cur = o
  while (cur && typeof cur === "object" && !Array.isArray(cur) && "a" in cur) {
    d++
    cur = cur.a
    if (d > 5000) break // safety
  }
  return d
}

// expensive-ish processing, chunked so UI doesn't hard-freeze
function expensiveProcessChunked(depth) {
  const targetWork = depth * 15000 // tune cost here
  let i = 0

  setJsonUI({
    statusText:
      depth >= DOS_DEPTH
        ? "Unresponsive"
        : depth >= DEGRADE_DEPTH
          ? "Degraded"
          : "Processing",
    depth,
  })

  return new Promise((resolve) => {
    function chunk() {
      const stopAt = Math.min(targetWork, i + 20000)
      for (; i < stopAt; i++) {
        // meaningless CPU work, but deterministic
        Math.sqrt(i ^ (depth * 1337))
      }

      // count work for UI
      jsonWorkUnits = targetWork
      setJsonUI({
        statusText:
          depth >= DOS_DEPTH
            ? "Unresponsive"
            : depth >= DEGRADE_DEPTH
              ? "Degraded"
              : "Processing",
        depth,
      })

      if (i < targetWork) {
        requestAnimationFrame(chunk)
      } else {
        resolve()
      }
    }
    requestAnimationFrame(chunk)
  })
}

async function submitJsonPayload() {
  const raw = (els.jsonInput?.value ?? "").trim()
  if (!raw) {
    showLab3(`
      <div class="alert alert-warning mb-0">
        Paste a JSON payload first.
      </div>
    `)
    return
  }

  jsonWorkUnits = 0
  setJsonUI({ statusText: "Parsing", depth: 0 })

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    showLab3(`
      <div class="alert alert-warning mb-0">
        Invalid JSON. It must be valid JSON to demonstrate application-layer DoS.
      </div>
    `)
    setJsonUI({ statusText: "Idle", depth: 0 })
    return
  }

  const depth = getDepth(parsed)

  // Mitigation (when ON): reject early
  if (depthLimitOn && depth > MAX_SAFE_DEPTH) {
    showLab3(`
      <div class="alert alert-info mb-0">
        <div class="fw-semibold">Request rejected (mitigation)</div>
        <div class="small mt-1">
          Depth limit is ON. Detected depth <strong>${depth}</strong> exceeds safe limit <strong>${MAX_SAFE_DEPTH}</strong>.
        </div>
        <div class="small mt-1">
          Lesson: validate + limit payload complexity before doing expensive work.
        </div>
      </div>
    `)
    setJsonUI({ statusText: "Blocked", depth })
    return
  }

  // Vulnerable path (limit OFF or below safe depth): process it
  await expensiveProcessChunked(depth)

  if (depth >= DOS_DEPTH && !jsonSolved) {
    jsonSolved = true
    markSolved("D", 2)

    showLab3(`
      <div class="alert alert-success mb-0">
        <div class="fw-semibold">Correct (Task 3 solved)</div>

        <div class="small mt-2">
          <strong>What just happened:</strong>
          A valid but deeply nested JSON payload triggered expensive processing.
        </div>

        <div class="small mt-1">
          <strong>Why it matters:</strong>
          Availability can fail without high traffic — complexity alone can overwhelm systems.
        </div>

        <div class="small mt-1">
          <strong>Why it felt slower:</strong>
          The browser had to do lots of CPU work, so UI updates were delayed.
        </div>

        <div class="small mt-2">
          Turn the depth limit ON and try again — notice how early rejection prevents DoS.
        </div>
      </div>
    `)

    renderStatusBadge()
    renderScores()
  } else {
    showLab3(`
      <div class="alert alert-info mb-0">
        Processed. Detected depth: <strong>${depth}</strong>.
        ${depth >= DEGRADE_DEPTH ? "System is degraded — push it deeper to cause unresponsiveness." : "Try a deeper payload to increase cost."}
      </div>
    `)
  }

  setJsonUI({
    statusText:
      depth >= DOS_DEPTH
        ? "Unresponsive"
        : depth >= DEGRADE_DEPTH
          ? "Degraded"
          : "Done",
    depth,
  })
}

function resetJsonLab() {
  jsonSolved = false
  jsonWorkUnits = 0
  if (els.jsonInput) els.jsonInput.value = ""
  showLab3("")
  setJsonUI({ statusText: "Idle", depth: 0 })
}

if (els.jsonSubmitBtn)
  els.jsonSubmitBtn.addEventListener("click", submitJsonPayload)

if (els.toggleJsonLimitBtn)
  els.toggleJsonLimitBtn.addEventListener("click", () => {
    depthLimitOn = !depthLimitOn
    showLab3(`
      <div class="alert alert-info mb-0">
        <div class="fw-semibold">Depth limit ${depthLimitOn ? "ENABLED" : "DISABLED"}</div>
        <div class="small mt-1">
          When enabled, payloads deeper than ${MAX_SAFE_DEPTH} are rejected early.
        </div>
      </div>
    `)
    setJsonUI({
      statusText: "Idle",
      depth: Number(els.jsonDepthLabel?.textContent ?? 0),
    })
  })

if (els.resetJsonBtn) els.resetJsonBtn.addEventListener("click", resetJsonLab)
if (els.resetSlowBtn) els.resetSlowBtn.addEventListener("click", resetSlowLab)

// RUN
renderUI()
renderStatusBadge()
renderScores()

// Init UI for lab 2
renderSlowUI()

// init UI for lab 3
setJsonUI({ statusText: "Idle", depth: 0 })
