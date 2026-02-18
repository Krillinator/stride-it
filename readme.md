# STRIDE IT

An interactive learning experience for understanding the STRIDE threat modeling methodology.

STRIDE IT helps learners explore security threats through short scenarios, quick checks, and mitigation thinking — one letter at a time.

---

## What is STRIDE?

STRIDE is a structured threat modeling framework originally developed at Microsoft in 1999 by Loren Kohnfelder and Praerit Garg.

It categorizes threats into:

- **S** — Spoofing
- **T** — Tampering
- **R** — Repudiation
- **I** — Information Disclosure
- **D** — Denial of Service
- **E** — Elevation of Privilege

---

## Features

- Interactive STRIDE tiles
- Per-letter scenario challenges
- Persistent progress tracking (localStorage)
- Animated, modern UI
- Premium dark design aesthetic

---

## Learning Goal

Instead of reacting to incidents, STRIDE IT encourages proactive security thinking.

> Don't react. Anticipate.

---

## Tech Stack

- HTML5
- CSS3 (custom animations + gradients)
- Vanilla JavaScript
- Bootstrap (layout utilities)

---

## How It Works

Progress is stored locally in the browser:

```js
localStorage.setItem("stride_progress_v1", ...)
```
