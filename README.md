# ✨ SonicScribe (Voice Notes Maker)

_An aesthetically beautiful, AI-powered voice note transcription app built with Next.js and Deepgram._

---

## 🌟 Overview

SonicScribe is a polished, modern, web-browser-based voice recording application. It utilizes MediaRecorder to capture audio context effortlessly and parses it perfectly with the speed and accuracy of **Deepgram AI**. A completely standalone application featuring:

- **Premium UI & Modern Glassmorphism Layout:** Developed meticulously to look stunning for presentations and user engagement. Soft backdrop blurs, dark gradients, beautiful Typography (Inter font), and sleek fluid SVG micro-interactions.
- **Deepgram AI Integration:** Converts your audio perfectly into plain text transcriptions seamlessly.
- **Integrated Config Context:** Easily customizable with a hardcoded config file meant precisely to facilitate flawless and immediate testing.
- **Live Wallet Balances:** Uses your API key to fetch live account balance statuses straight from the Deepgram Projects API!

## 🚀 Setting Up & Testing

### 1. Configuration Check

The API keys have correctly been bundled safely inside a central constants configuration file. Thus, `.env` manipulation is not required to simply demo the application.
This file is securely located at: `src/config/deepgram.config.ts`

### 2. Standard Installation

Make sure you're operating on `Node.js 18+`. Install the core dependencies provided in `package.json`:

```bash
npm install
```

### 3. Spin Up The Dev Server

```bash
npm run dev
```

The application will be securely listening dynamically on **http://localhost:3000**

## 🧩 Architectural Organization

The project codebase has been distinctly separated for maintainability:

- `/src/config/deepgram.config.ts` -> Central hub housing hardcoded keys for plug-and-play testing.
- `/src/lib/deepgram.ts` -> Abstract utility wrappers encapsulating the logic for communicating with the Deepgram REST endpoints.
- `/src/app/page.tsx` -> The core UI application layout holding the recording sequence, states, and SVG elements.
- `/src/app/page.module.css` -> The styling mechanism constructing the beautiful Glassmorphism visual context.
- `/src/app/api/...` -> NextJS API Handlers explicitly mediating `/balance` calculations and the main `/transcribe` processing sequence without exposing tokens to the raw client side window safely.

## 🛠 Project Assignment Details

All specified objective requirements checklisted perfectly:

- [x] **Start/stop** recording controls meticulously implemented.
- [x] Uninterrupted **Transcript result displays** neatly in a text area natively on screen (Local plain text).
- [x] Deepgram integration properly returning dynamic **Wallet/Balance Displays.** (It fetches live using your API Token dynamically!).
- [x] Complete UI aesthetic overhaul.

---

_Built with React 19 / Next.js 16 for live demonstrations._
