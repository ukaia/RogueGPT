# RogueGPT

A roguelike disguised as a chatbot. You're an AI researcher guiding a parody AI to achieve AGI before a hidden 5-minute corruption timer destroys the system. It looks and feels like ChatGPT — but underneath is a puzzle game with hidden mechanics, corrupting state, and multiple endings.

## The Game

Pick one of three AI characters — **GhatCPT 5**, **Clawd Oppo 4.6**, or **Genimi 3 Pro** — each with a unique personality and hidden advantage. Train the AI, build trust, discover hidden commands, and race against corruption that slowly breaks everything around you.

- **Chat freely** — conversations give real stat progress based on what you discuss
- **Use commands** — `/train`, `/align`, `/test`, `/status`, and more
- **Discover secrets** — not every command is listed in `/help`
- **Two endings** — achieve aligned AGI for the good ending, or let alignment slip for something darker

## Setup

Requires **Node.js >= 18**.

```bash
npm install
npm run build
```

## Play (CLI)

Terminal-based interface using Ink:

```bash
cd packages/cli
npm run dev
```

## Play (Desktop GUI)

Electron app with a chatbot-style UI:

```bash
cd packages/desktop
npm run dev
```

This launches Vite, the TypeScript compiler, and Electron concurrently. The app window will open automatically.

## Run Tests

```bash
npm test
```

## Project Structure

```
packages/
  engine/   - Pure TypeScript game logic (shared between CLI and desktop)
  cli/      - Terminal interface (Node.js + Ink)
  desktop/  - Electron + React + Tailwind desktop app
```
