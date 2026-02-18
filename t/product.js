const products = [
  { id: 1, name: "Headphones", price: 1999 },
  { id: 2, name: "Keyboard", price: 999 },
  { id: 3, name: "USB Cable", price: 199 },
]

let cart = []

const productListEl = document.getElementById("productList")
const cartDisplayEl = document.getElementById("cartDisplay")
const totalPriceEl = document.getElementById("totalPrice")

const checkoutTotalEl = document.getElementById("checkoutTotal")
const checkoutBtn = document.getElementById("checkoutBtn")
const clearCartBtn = document.getElementById("clearCartBtn")
const checkoutResultEl = document.getElementById("checkoutResult")

function getRealTotal() {
  return cart.reduce((sum, item) => sum + item.price, 0)
}

function renderProducts() {
  productListEl.innerHTML = ""

  products.forEach((product) => {
    const btn = document.createElement("button")
    btn.className = "btn btn-outline-light btn-sm me-2 mb-2"
    btn.textContent = `Add ${product.name} (${product.price} SEK)`
    btn.addEventListener("click", () => addToCart(product.id))
    productListEl.appendChild(btn)
  })
}

function addToCart(productId) {
  const product = products.find((p) => p.id === productId)
  if (!product) return
  cart.push(product)
  renderCart()
}

function renderCart() {
  cartDisplayEl.innerHTML = ""

  cart.forEach((item) => {
    const div = document.createElement("div")
    div.textContent = `${item.name} – ${item.price} SEK`
    cartDisplayEl.appendChild(div)
  })

  const realTotal = getRealTotal()
  totalPriceEl.textContent = realTotal

  // Keep the editable checkout total in sync (unless the student changed it)
  // We’ll only auto-set when it's empty or equals the previous real total.
  if (
    !checkoutTotalEl.dataset.touched ||
    checkoutTotalEl.value === "" ||
    Number(checkoutTotalEl.value) ===
      Number(checkoutTotalEl.dataset.lastReal || 0)
  ) {
    checkoutTotalEl.value = realTotal
  }

  checkoutTotalEl.dataset.lastReal = String(realTotal)
}

checkoutTotalEl.addEventListener("input", () => {
  checkoutTotalEl.dataset.touched = "true"
})

checkoutBtn.addEventListener("click", () => {
  const realTotal = getRealTotal()
  const submittedTotal = Number(checkoutTotalEl.value)

  if (!cart.length) {
    checkoutResultEl.innerHTML = `<div class="alert alert-secondary mb-0">Cart is empty.</div>`
    return
  }

  if (Number.isNaN(submittedTotal)) {
    checkoutResultEl.innerHTML = `<div class="alert alert-warning mb-0">Enter a valid number.</div>`
    return
  }

  if (submittedTotal !== realTotal) {
    checkoutResultEl.innerHTML = `
      <div class="alert alert-success mb-0">
        <div class="fw-semibold">Tampering detected (Task solved)</div>
        <div class="small">Submitted total: <strong>${submittedTotal} SEK</strong></div>
        <div class="small">Real total: <strong>${realTotal} SEK</strong></div>
        <div class="small mt-1">Lesson: the server must calculate totals — never trust client totals.</div>
      </div>
    `
  } else {
    checkoutResultEl.innerHTML = `
      <div class="alert alert-warning mb-0">
        <div class="fw-semibold">No tampering.</div>
        <div class="small">Try changing the checkout total before clicking checkout.</div>
      </div>
    `
  }

  checkoutResultEl.scrollIntoView({ behavior: "smooth", block: "start" })
})

clearCartBtn.addEventListener("click", () => {
  cart = []
  checkoutResultEl.innerHTML = ""
  checkoutTotalEl.dataset.touched = ""
  renderCart()
})

renderProducts()
renderCart()
