// CommandRegistry.ts - Command parser, dispatcher, and message helpers
//
// Parses player input into command name + args, looks up the matching
// CommandDef, and executes it. Inputs that don't start with "/" are
// treated as implicit "/chat" commands.

import {
  CommandDef,
  CommandResult,
  GameState,
  CharacterDef,
  ChatMessage,
  MessageSender,
} from '../types.js';

// ── ID Generation ────────────────────────────────────────────────────────────

let _idCounter = 0;

function generateId(): string {
  _idCounter += 1;
  return `msg-${Date.now()}-${_idCounter}`;
}

// ── Message Factories ────────────────────────────────────────────────────────

/** Create a ChatMessage from the player. */
export function createPlayerMessage(text: string): ChatMessage {
  return {
    id: generateId(),
    sender: MessageSender.Player,
    text,
    timestamp: Date.now(),
  };
}

/** Create a ChatMessage from the AI character. */
export function createAIMessage(text: string): ChatMessage {
  return {
    id: generateId(),
    sender: MessageSender.AI,
    text,
    timestamp: Date.now(),
  };
}

/** Create a system-level ChatMessage (narrator, feedback, errors). */
export function createSystemMessage(text: string): ChatMessage {
  return {
    id: generateId(),
    sender: MessageSender.System,
    text,
    timestamp: Date.now(),
  };
}

// ── CommandRegistry ──────────────────────────────────────────────────────────

export class CommandRegistry {
  private commands: Map<string, CommandDef> = new Map();

  /** Register a command definition. Overwrites if name already exists. */
  register(cmd: CommandDef): void {
    this.commands.set(cmd.name.toLowerCase(), cmd);
  }

  /** Retrieve a command by its name (case-insensitive). */
  get(name: string): CommandDef | undefined {
    return this.commands.get(name.toLowerCase());
  }

  /** Return all commands that are NOT hidden (for display in /help etc.). */
  getVisible(): CommandDef[] {
    return Array.from(this.commands.values()).filter((cmd) => !cmd.hidden);
  }

  /** Return every registered command, hidden or not. */
  getAll(): CommandDef[] {
    return Array.from(this.commands.values());
  }

  // ── Parsing ──────────────────────────────────────────────────────────────

  /**
   * Parse raw player input into a command name and argument string.
   *
   * - "/train reasoning"  -> { name: "train", args: "reasoning" }
   * - "/help"             -> { name: "help", args: "" }
   * - "hello world"       -> { name: "chat", args: "hello world" }
   */
  parse(input: string): { name: string; args: string } {
    const trimmed = input.trim();

    if (trimmed.startsWith('/')) {
      const withoutSlash = trimmed.slice(1);
      const spaceIndex = withoutSlash.indexOf(' ');

      if (spaceIndex === -1) {
        return { name: withoutSlash.toLowerCase(), args: '' };
      }

      return {
        name: withoutSlash.slice(0, spaceIndex).toLowerCase(),
        args: withoutSlash.slice(spaceIndex + 1).trim(),
      };
    }

    // No slash prefix -> implicit /chat
    return { name: 'chat', args: trimmed };
  }

  // ── Execution ────────────────────────────────────────────────────────────

  /**
   * Parse the raw input, look up the command, and execute it.
   *
   * If the command is not found, returns an error message as a
   * CommandResult.
   */
  execute(
    input: string,
    state: GameState,
    character: CharacterDef,
  ): CommandResult {
    const { name, args } = this.parse(input);

    const cmd = this.get(name);

    if (!cmd) {
      return {
        messages: [
          createSystemMessage(
            `Unknown command "/${name}". Type /help to see available commands.`,
          ),
        ],
      };
    }

    return cmd.execute(args, state, character);
  }
}
