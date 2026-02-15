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
    console.log('[IPCProvider] Checking availability...');
    if (!window.electronLLM) {
      console.log('[IPCProvider] electronLLM bridge not available');
      return false;
    }
    try {
      const result = await window.electronLLM.isAvailable();
      console.log('[IPCProvider] IPC availability check result:', result);
      return result;
    } catch (error) {
      console.error('[IPCProvider] Error checking availability:', error);
      return false;
    }
  }

  async generate(systemPrompt: string, userMessage: string): Promise<string> {
    console.log('[IPCProvider] Generating response for:', userMessage);
    if (!window.electronLLM) {
      throw new Error('electronLLM bridge not available');
    }

    try {
      const result = await window.electronLLM.generate(systemPrompt, userMessage);
      console.log('[IPCProvider] Generation result:', result);
      if (result === null) {
        throw new Error('LLM generation failed');
      }
      return result;
    } catch (error) {
      console.error('[IPCProvider] Error during generation:', error);
      throw error;
    }
  }
}
