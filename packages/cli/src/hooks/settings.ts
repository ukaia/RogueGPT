import { join } from 'path';
import { homedir } from 'os';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

export interface GameSettings {
  showTimer: boolean;
  showCorruption: boolean;
  // Add more settings here in the future
}

export const DEFAULT_SETTINGS: GameSettings = {
  showTimer: false, // Hidden by default as requested
  showCorruption: false, // Hidden by default as requested
};

export function loadSettings(): GameSettings {
  try {
    const settingsPath = join(homedir(), '.roguegpt', 'settings.json');
    const raw = readFileSync(settingsPath, 'utf-8');
    const saved = JSON.parse(raw) as Partial<GameSettings>;
    return { ...DEFAULT_SETTINGS, ...saved };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: GameSettings): void {
  try {
    const settingsDir = join(homedir(), '.roguegpt');
    const settingsPath = join(settingsDir, 'settings.json');
    mkdirSync(settingsDir, { recursive: true });
    writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  } catch {
    // Silently fail — settings persistence is best-effort
  }
}