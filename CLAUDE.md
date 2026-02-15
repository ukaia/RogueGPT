# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RogueGPT is a roguelike game disguised as a chatbot interface. Players guide a parody AI character to achieve AGI before a hidden 5-minute corruption timer destroys the system. It's built as an npm workspaces monorepo with three packages:

- `@roguegpt/engine`: Pure TypeScript game logic (shared between CLI and desktop)
- `@roguegpt/cli`: Terminal interface using Node.js + Ink (React for CLIs)
- `@roguegpt/desktop`: Electron + React + Tailwind desktop app

## Common Development Commands

### Building & Running
- Full build: `npm run build` (from repo root)
- CLI development: `cd packages/cli && npm run dev` or `npx tsx src/index.tsx`
- Desktop development: `cd packages/desktop && npm run dev`
- Run tests: `npm test` (runs vitest in engine package)

### Packaging
- Build standalone apps: `cd packages/desktop && npm run package`
- macOS .dmg: `cd packages/desktop && CSC_IDENTITY_AUTO_DISCOVERY=false npx electron-builder --mac dmg`
- Windows .exe: `cd packages/desktop && CSC_IDENTITY_AUTO_DISCOVERY=false npx electron-builder --win nsis`

## Architecture Overview

### Core Game Engine (`packages/engine`)
The engine is the heart of the game, containing all game logic and being shared between CLI and desktop interfaces.

Key components:
- `GameEngine.ts`: Main game logic, state management, tick loop, command processing
- `CommandRegistry.ts`: Command parsing and execution system
- `types.ts`: All game types, enums, and interfaces
- `characters/`: Character definitions with unique personalities and modifiers
- `commands/`: Game commands organized in visible/hidden categories
- `corruption/`: Corruption system with visual effects and gameplay impacts
- `llm/`: LLM integration interfaces and utilities

### CLI Interface (`packages/cli`)
Terminal-based interface using Ink (React for CLIs):
- `App.tsx`: Main React component managing game state and UI
- `components/`: UI components (ChatView, InputBar, StatusBar, etc.)
- `hooks/`: Custom React hooks for game state management
- `llm/`: LLM provider implementation for CLI

### Desktop Interface (`packages/desktop`)
Electron app with React/Tailwind frontend:
- `main/`: Electron main process (LLM loading, IPC handlers)
- `renderer/`: React UI (similar architecture to CLI but with Tailwind styling)
- LLM runs in main process, renderer communicates via IPC

## Key Systems

### Command System
- Commands start with `/` (e.g., `/train reasoning`)
- Non-command input routes to implicit `/chat` command
- Commands defined in `packages/engine/src/commands/` with factory functions
- Hidden commands exist for discovery-based gameplay

### LLM Integration
- Uses Qwen3 0.6B GGUF model (378MB) in `models/` directory
- CLI: Direct node-llama-cpp integration
- Desktop: Model in main process, IPC bridge to renderer
- Fallback to keyword matching when model unavailable or fails
- Post-processing removes markdown/emojis and detects repetition

### Corruption System
- Time-based exponential curve reaching 100% at game end
- Five levels: normal (0%), glitch (15%), unstable (35%), corrupted (55%), critical (80%)
- Visual effects implemented as atmospheric elements (occasional flickers)
- High corruption causes probabilistic corrupted responses and command misfires

### Game State Management
- Centralized in `GameEngine` class with strict state transitions
- Event system for UI updates (messagesAdded, gameEnded, etc.)
- Stats: intelligence, alignment, corruption, trust, awareness
- Three endings based on AGI achievement and alignment score

## Testing
- 128 unit tests using Vitest in engine package
- Tests cover: command parsing, game state transitions, character behavior, corruption calculations
- Run with `npm test` from repo root

## Critical Implementation Details

### LLM Sequence Management
Must call `contextSequence.dispose()` after each generation to prevent "No sequences left" error:
```typescript
const contextSequence = context.getSequence();
try {
  const session = new LlamaChatSession({ contextSequence, systemPrompt });
  // ... use session
} finally {
  session.dispose();
  contextSequence.dispose(); // CRITICAL
}
```

### Text Corruption Philosophy
Text is stored clean and displayed clean. Corruption effects are atmospheric only:
- No `corruptText()` in display layer
- Occasional visual flickers instead of constant re-rendering
- Probabilistic corrupted response pool at high corruption levels

### Stat Extraction
Stats are extracted from player INPUT (not LLM output) to preserve game balance.

## File Locations
- Public API: `packages/engine/src/index.ts`
- Game engine: `packages/engine/src/GameEngine.ts`
- Chat command: `packages/engine/src/commands/visible/chat.ts`
- Characters: `packages/engine/src/characters/CharacterFactory.ts`
- Corruption effects: `packages/engine/src/corruption/effects.ts`
- CLI LLM provider: `packages/cli/src/llm/LlamaCppProvider.ts`
- Desktop LLM: `packages/desktop/src/main/llm.ts`