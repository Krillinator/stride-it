import {
  loadProgress,
  markSolved,
  getLetterScore,
  getTotalScore,
} from "../progress.js"

const unusedSecret = "4 /r/index.html -> unhide element"

// Ensure localStorage exists
loadProgress()

// Ensure creation of t_user_info
const T_USER_KEY = "t_user_info"
initTUser()

const els = {
  letterScore: document.getElementById("letterScore"),
  totalScore: document.getElementById("totalScore"),

  tamperStatus: document.getElementById("tamperStatus"),

  productList: document.getElementById("productList"),
  cartDisplay: document.getElementById("cartDisplay"),

  subtotalPrice: document.getElementById("subtotalPrice"),
  finalPrice: document.getElementById("finalPrice"),
  discountLabel: document.getElementById("discountLabel"),

  checkoutBtn: document.getElementById("checkoutBtn"),
  clearCartBtn: document.getElementById("clearCartBtn"),
  checkoutResult: document.getElementById("checkoutResult"),
  userInfoStatus: document.getElementById("userInfoStatus"),

  // lab2
  userIdInput: document.getElementById("userIdInput"),
  checkUserIdBtn: document.getElementById("checkUserIdBtn"),
  userInfoResult: document.getElementById("userInfoResult"),

  // lab3
  loyaltyStatus: document.getElementById("loyaltyStatus"),
  verifyLoyaltyBtn: document.getElementById("verifyLoyaltyBtn"),
  resetLoyaltyBtn: document.getElementById("resetLoyaltyBtn"),
  loyaltyResult: document.getElementById("loyaltyResult"),
}

const products = [
  { id: 1, name: "Headphones", price: 1999 },
  { id: 2, name: "Keyboard", price: 999 },
  { id: 3, name: "USB Cable", price: 199 },
]

let cart = []

// “Server truth” (what the system intended)
const REAL_REFERRAL = "partner_summer2026"

// Simulated discount rules (what a server would decide)
const DISCOUNTS = {
  partner_summer2026: 0.1, // 10%
  vip_50: 0.5, // 50%
  employee_90: 0.9, // 90%
}

// Localstorage
function initTUser() {
  const existing = localStorage.getItem(T_USER_KEY)

  if (!existing) {
    const defaultUser = {
      userId: "user_48291",
      role: "customer",
      loyaltyPoints: 120,
      referral: "partner_summer2026",
    }

    localStorage.setItem(T_USER_KEY, JSON.stringify(defaultUser))
  }
}

function getTUser() {
  try {
    return JSON.parse(localStorage.getItem(T_USER_KEY)) || null
  } catch {
    return null
  }
}

function setTUser(data) {
  localStorage.setItem(T_USER_KEY, JSON.stringify(data))
}

// Lab 2
function renderUserInfoStatus() {
  const progress = loadProgress()
  els.userInfoStatus.textContent = progress.T.solved[1]
    ? "Solved"
    : "Not solved"
}

els.checkUserIdBtn.addEventListener("click", () => {
  const answer = (els.userIdInput.value || "").trim()

  if (answer === "user_48291") {
    markSolved("T", 1)

    els.userInfoResult.innerHTML = `
      <div class="alert alert-success mb-0">
        <div class="fw-semibold">Correct (Task 2 solved)</div>
        <div class="small">User ID: <strong>${escapeHtml(answer)}</strong></div>
        <div class="small mt-1">Lesson: localStorage is fully readable client-side.</div>
      </div>
    `
  } else {
    els.userInfoResult.innerHTML = `
      <div class="alert alert-warning mb-0">
        <div class="fw-semibold">Not quite.</div>
        <div class="small">Hint: open DevTools → Console.</div>
      </div>
    `
  }

  renderUserInfoStatus()
  renderScores()

  els.userInfoResult.scrollIntoView({ behavior: "smooth", block: "start" })
})

// lab3
function renderLoyaltyStatus() {
  const progress = loadProgress()
  els.loyaltyStatus.textContent = progress.T.solved[2] ? "Solved" : "Not solved"
}

els.verifyLoyaltyBtn.addEventListener("click", () => {
  const user = getTUser()

  const points = Number(user?.loyaltyPoints)

  if (points === 1337) {
    markSolved("T", 2)
    els.loyaltyResult.innerHTML = `
      <div class="alert alert-success mb-0">
        <div class="fw-semibold">Correct (Task 3 solved)</div>
        <div class="small">loyaltyPoints is now <strong>1337</strong>.</div>
        <div class="small mt-1">Lesson: client-side values can be tampered with and must be validated server-side.</div>
      </div>
    `
  } else {
    els.loyaltyResult.innerHTML = `
      <div class="alert alert-warning mb-0">
        <div class="fw-semibold">Not yet.</div>
        <div class="small">Current loyaltyPoints: <strong>${Number.isFinite(points) ? points : "(missing)"}</strong></div>
        <div class="small mt-1">Edit <code>t_user_info.loyaltyPoints</code> in localStorage to <strong>1337</strong>, then verify.</div>
      </div>
    `
  }

  renderLoyaltyStatus()
  renderScores()
  els.loyaltyResult.scrollIntoView({ behavior: "smooth", block: "start" })
})

els.resetLoyaltyBtn.addEventListener("click", () => {
  const user = getTUser()
  if (!user) return

  user.loyaltyPoints = 120
  setTUser(user)

  els.loyaltyResult.innerHTML = `
    <div class="alert alert-secondary mb-0">Points reset to 120.</div>
  `
})

// Score & Status
function renderScores() {
  els.letterScore.textContent = `T: ${getLetterScore("T")}/3`
  els.totalScore.textContent = `Total: ${getTotalScore()}/18`
}

function renderStatus() {
  const progress = loadProgress()
  els.tamperStatus.textContent = progress.T.solved[0] ? "Solved" : "Not solved"
}

// Cart
function getSubtotal() {
  return cart.reduce((sum, item) => sum + item.price, 0)
}

function calcFinal(subtotal, referral) {
  const rate = DISCOUNTS[referral] ?? 0
  const final = Math.round(subtotal * (1 - rate))
  return { rate, final }
}

function renderProducts() {
  els.productList.innerHTML = ""

  products.forEach((p) => {
    const btn = document.createElement("button")
    btn.className = "btn btn-outline-light btn-sm me-2 mb-2"
    btn.textContent = `Add ${p.name} (${p.price} SEK)`
    btn.addEventListener("click", () => addToCart(p.id))
    els.productList.appendChild(btn)
  })
}

function addToCart(productId) {
  const product = products.find((p) => p.id === productId)
  if (!product) return
  cart.push(product)
  renderCart()
}

function renderCart() {
  els.cartDisplay.innerHTML = ""

  cart.forEach((item) => {
    const div = document.createElement("div")
    div.textContent = `${item.name} – ${item.price} SEK`
    els.cartDisplay.appendChild(div)
  })

  const subtotal = getSubtotal()
  els.subtotalPrice.textContent = subtotal

  const referral = (els.checkoutBtn.dataset.referral || "").trim()
  const { rate, final } = calcFinal(subtotal, referral)

  els.finalPrice.textContent = final
  els.discountLabel.textContent =
    rate > 0 ? `(−${Math.round(rate * 100)}%)` : `(no discount)`
}

els.checkoutBtn.addEventListener("click", () => {
  if (!cart.length) {
    els.checkoutResult.innerHTML = `<div class="alert alert-secondary mb-0">Cart is empty.</div>`
    return
  }

  const submittedReferral = (els.checkoutBtn.dataset.referral || "").trim()
  const subtotal = getSubtotal()
  const { rate, final } = calcFinal(subtotal, submittedReferral)

  const tampered = submittedReferral !== REAL_REFERRAL

  if (tampered) {
    // mark solved (T, task 1)
    markSolved("T", 0)

    els.checkoutResult.innerHTML = `
      <div class="alert alert-success mb-0">
        <div class="fw-semibold">Tampering detected (Task 1 solved)</div>
        <div class="small">Submitted referral: <strong>${escapeHtml(submittedReferral || "(empty)")}</strong></div>
        <div class="small">Discount applied: <strong>${Math.round(rate * 100)}%</strong></div>
        <div class="small">Final total: <strong>${final} SEK</strong></div>
        <div class="small mt-1">Lesson: client-controlled referral codes must be validated server-side.</div>
      </div>
    `
  } else {
    els.checkoutResult.innerHTML = `
      <div class="alert alert-warning mb-0">
        <div class="fw-semibold">No tampering yet.</div>
        <div class="small">Checkout <code>data-referral</code> .</div>
      </div>
    `
  }

  // reflect UI updates
  renderStatus()
  renderScores()
  renderCart()

  els.checkoutResult.scrollIntoView({ behavior: "smooth", block: "start" })
})

els.clearCartBtn.addEventListener("click", () => {
  cart = []
  els.checkoutResult.innerHTML = ""
  renderCart()
})

// Basic escaping (same as your S page)
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

// Init
renderProducts()
renderCart()
renderStatus()
renderScores()
renderUserInfoStatus()
renderLoyaltyStatus()
