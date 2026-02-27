const isMac = navigator.platform.toUpperCase().includes("MAC")
const shortcut = isMac ? "Cmd + Option + I" : "Ctrl + Shift + I"
document.getElementById("shortcutLine").textContent = `Shortcut: ${shortcut}`

setTimeout(() => {
  document.getElementById("targetArea").classList.add("is-visible")
}, 600)

document.getElementById("step1Target").addEventListener("contextmenu", () => {
  document.getElementById("step2").classList.add("is-visible")

  document.getElementById("step1Arrow").remove()
})

document.getElementById("step2Target").addEventListener("contextmenu", () => {
  document.getElementById("step3").classList.add("is-visible")
})

document.getElementById("doneBtn").addEventListener("click", () => {
  document.getElementById("why").classList.add("is-visible")
})
