// IPCProvider.ts - LLMProvider that delegates to the Electron main process via IPC

import type { LLMProvider } from '@roguegpt/engine';

declare global {
  interface Window {
    electronLLM?: {
      isAvailable: () => Promise<boolean>;
      generate: (systemPrompt: string, userMessage: string) => Promise<string | null>;
    };
  }
}

export class IPCProvider implements LLMProvider {
  async isAvailable(): Promise<boolean> {
    if (!window.electronLLM) return false;
    try {
      return await window.electronLLM.isAvailable();
    } catch {
      return false;
    }
  }

  async generate(systemPrompt: string, userMessage: string): Promise<string> {
    if (!window.electronLLM) {
      throw new Error('electronLLM bridge not available');
    }

    const result = await window.electronLLM.generate(systemPrompt, userMessage);
    if (result === null) {
      throw new Error('LLM generation failed');
    }
    return result;
  }
}
