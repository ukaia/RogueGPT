<img width="1112" height="761" alt="Screenshot 2026-02-14 at 9 17 35 PM" src="https://github.com/user-attachments/assets/708afc75-cb93-4644-b9a0-e7e83b845ea9" />
# RogueGPT

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

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

### LLM Model (Optional)

For dynamic AI-generated chat responses, download the Qwen3 0.6B model:

```bash
mkdir -p models
curl -L -o models/qwen3-0.6b-q4_k_m.gguf \
  https://huggingface.co/unsloth/Qwen3-0.6B-GGUF/resolve/main/Qwen3-0.6B-Q4_K_M.gguf
```

Without the model, the game falls back to its built-in keyword-matching dialogue system.

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

## Build Standalone Apps

```bash
cd packages/desktop
npm run package
```

This produces platform-specific installers in `packages/desktop/out/`.

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
models/     - Local GGUF model files (not committed, see setup above)
```

## Credits

### AI & Language Model

- **[Qwen3 0.6B](https://huggingface.co/Qwen/Qwen3-0.6B)** by Alibaba Cloud Qwen Team — the embedded language model powering in-game chat responses. GGUF quantization (Q4_K_M) provided by [Unsloth](https://huggingface.co/unsloth/Qwen3-0.6B-GGUF). Licensed under Apache 2.0.
- **[node-llama-cpp](https://github.com/withcatai/node-llama-cpp)** by withcatai — Node.js bindings for llama.cpp enabling local LLM inference with automatic Metal/CUDA/CPU detection. Licensed under MIT.
- **[llama.cpp](https://github.com/ggerganov/llama.cpp)** by Georgi Gerganov — the C++ inference engine that makes running LLMs locally possible. Licensed under MIT.

### Frameworks & Runtime

- **[Electron](https://www.electronjs.org/)** by OpenJS Foundation — cross-platform desktop app framework. Licensed under MIT.
- **[React](https://react.dev/)** by Meta — UI component library powering both the desktop renderer and CLI interface. Licensed under MIT.
- **[Node.js](https://nodejs.org/)** by OpenJS Foundation — JavaScript runtime. Licensed under MIT.
- **[TypeScript](https://www.typescriptlang.org/)** by Microsoft — typed superset of JavaScript used across all packages. Licensed under Apache 2.0.

### CLI Interface

- **[Ink](https://github.com/vadimdemedes/ink)** by Vadim Demedes — React renderer for interactive CLI apps. Licensed under MIT.
- **[ink-text-input](https://github.com/vadimdemedes/ink-text-input)** by Vadim Demedes — text input component for Ink. Licensed under MIT.
- **[tsx](https://github.com/privatenumber/tsx)** by Hiroki Osame — TypeScript execution engine for Node.js. Licensed under MIT.

### Desktop UI & Build

- **[Vite](https://vitejs.dev/)** by Evan You — fast frontend build tool and dev server. Licensed under MIT.
- **[@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react)** — React Fast Refresh support for Vite. Licensed under MIT.
- **[Tailwind CSS](https://tailwindcss.com/)** by Tailwind Labs — utility-first CSS framework for the desktop UI. Licensed under MIT.
- **[PostCSS](https://postcss.org/)** — CSS transformation tool used with Tailwind. Licensed under MIT.
- **[Autoprefixer](https://github.com/postcss/autoprefixer)** — PostCSS plugin for vendor CSS prefixes. Licensed under MIT.
- **[electron-builder](https://www.electron.build/)** — packaging and distribution tool for Electron apps (.dmg, .exe, .AppImage). Licensed under MIT.
- **[concurrently](https://github.com/open-cli-tools/concurrently)** — run multiple commands concurrently during development. Licensed under MIT.
- **[vite-plugin-electron](https://github.com/electron-vite/vite-plugin-electron)** — Vite integration for Electron main/preload scripts. Licensed under MIT.
- **[react-dom](https://react.dev/)** by Meta — React DOM renderer for the desktop app. Licensed under MIT.

### Testing

- **[Vitest](https://vitest.dev/)** by Anthony Fu & Vitest Team — fast unit test framework. Licensed under MIT.

### Development Tools

- **[Claude Code](https://claude.ai/claude-code)** by Anthropic — AI coding assistant used extensively during development.

### Game Design Inspiration

- The concept of a "roguelike disguised as a chatbot" draws from the tradition of games that subvert their interface as a game mechanic, including *Pony Island*, *Doki Doki Literature Club*, and *Undertale*.
- AI character parodies are affectionate nods to ChatGPT (OpenAI), Claude (Anthropic), and Gemini (Google).

## License

This project is licensed under the **Apache License 2.0** — see the [LICENSE](LICENSE) file for details.

The bundled Qwen3 0.6B model is separately licensed under Apache 2.0 by Alibaba Cloud. All third-party dependencies retain their original licenses as listed in the credits above.
