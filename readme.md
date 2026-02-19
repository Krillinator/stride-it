# STRIDE IT

An interactive learning experience for understanding the STRIDE threat modeling methodology.

STRIDE IT helps learners explore security threats through short scenarios, quick checks, and mitigation thinking — one letter at a time.

<img width="788" height="363" alt="Screenshot 2026-02-18 at 22 01 39" src="https://github.com/user-attachments/assets/e6bb5bfe-a886-4799-ab8e-8974de662a3c" />

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

<img width="1355" height="595" alt="Screenshot 2026-02-18 at 21 59 29" src="https://github.com/user-attachments/assets/2372e8f9-9378-4d2f-9b89-456f84f331c5" />

---

## Learning Goal

Instead of reacting to incidents, STRIDE IT encourages proactive security thinking.

> Don't react. Anticipate.

---

## Tech Stack

- HTML5
- CSS3 (custom animations + gradients)
- Vanilla JavaScript (for 'safe' client side labboration)
- Bootstrap (layout utilities)

---

## How It Works

Progress is stored locally in the browser:

```js
localStorage.setItem("stride_progress_v1", ...)
```
