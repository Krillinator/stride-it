const STORAGE_KEY = "stride_progress_v1"

const DEFAULT_PROGRESS = {
  S: { solved: [false, false, false] },
  T: { solved: [false, false, false] },
  R: { solved: [false, false, false] },
  I: { solved: [false, false, false] },
  D: { solved: [false, false, false] },
  E: { solved: [false, false, false] },
}

const FIRST_VISIT_KEY = "stride_first_visit_v1"
const HIDE_WELCOME_KEY = "stride_hide_welcome_v1"
const isFirstVisit = !localStorage.getItem(FIRST_VISIT_KEY)
const hideWelcome = localStorage.getItem(HIDE_WELCOME_KEY) === "true"

if (isFirstVisit) localStorage.setItem(FIRST_VISIT_KEY, "1")

if ((isFirstVisit || !hideWelcome) && !hideWelcome) {
  const modalEl = document.getElementById("firstVisitModal")
  if (modalEl) {
    const modal = new bootstrap.Modal(modalEl, { backdrop: "static" })
    modal.show()

    modalEl.addEventListener("hidden.bs.modal", () => {
      const cb = document.getElementById("dontShowAgain")
      if (cb?.checked) localStorage.setItem(HIDE_WELCOME_KEY, "true")
    })
  }
}

export function loadProgress() {
  const raw = localStorage.getItem(STORAGE_KEY)

  // First visit: create it
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROGRESS))
    return structuredClone(DEFAULT_PROGRESS)
  }

  // Existing: parse + merge to avoid breaking if you add more later
  try {
    const parsed = JSON.parse(raw)
    return {
      ...structuredClone(DEFAULT_PROGRESS),
      ...parsed,
      S: { ...DEFAULT_PROGRESS.S, ...parsed.S },
      T: { ...DEFAULT_PROGRESS.T, ...parsed.T },
      R: { ...DEFAULT_PROGRESS.R, ...parsed.R },
      I: { ...DEFAULT_PROGRESS.I, ...parsed.I },
      D: { ...DEFAULT_PROGRESS.D, ...parsed.D },
      E: { ...DEFAULT_PROGRESS.E, ...parsed.E },
    }
  } catch {
    // Corrupt storage -> reset
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROGRESS))
    return structuredClone(DEFAULT_PROGRESS)
  }
}

export function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function markSolved(letter, index) {
  const progress = loadProgress()
  if (!progress[letter] || index < 0 || index > 2) return progress

  progress[letter].solved[index] = true
  saveProgress(progress)
  return progress
}

export function getLetterScore(letter) {
  const progress = loadProgress()
  const solved = progress[letter]?.solved ?? [false, false, false]
  return solved.filter(Boolean).length // 0..3
}

export function getTotalScore() {
  const progress = loadProgress()
  return Object.values(progress).reduce(
    (sum, v) => sum + v.solved.filter(Boolean).length,
    0,
  )
}

export function isAllSolved() {
  return getTotalScore() >= 18
}

export function getCompletionHint() {
  if (!isAllSolved()) return null

  const fragments = ["L3MvaW5kZXguaHRtbA==", "IHNoaWZ0K2NsaWNr", "IHRoZSBTIDN4"]

  const decoded = fragments.map((f) => atob(f)).join("")

  return {
    level: "hidden",
    channel: "secret task",
    payload: decoded,
  }
}
