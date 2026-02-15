// LlamaCppProvider.ts - Loads a GGUF model via node-llama-cpp for the CLI
//
// Provides an LLMProvider implementation that runs inference directly
// in the Node.js process. The model is loaded once on init and reused.

import type { LLMProvider } from '@roguegpt/engine';
import { getLlama, type Llama, type LlamaModel, type LlamaContext } from 'node-llama-cpp';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Walk up from packages/cli/src/llm/ to repo root, then into models/
const DEFAULT_MODEL_PATH = resolve(__dirname, '..', '..', '..', '..', 'models', 'qwen3-0.6b-q4_k_m.gguf');

export class LlamaCppProvider implements LLMProvider {
  private llama: Llama | null = null;
  private model: LlamaModel | null = null;
  private context: LlamaContext | null = null;
  private ready = false;
  private initPromise: Promise<void> | null = null;

  constructor(private modelPath: string = DEFAULT_MODEL_PATH) {}

  async init(): Promise<boolean> {
    if (this.ready) return true;
    if (this.initPromise) {
      await this.initPromise;
      return this.ready;
    }

    this.initPromise = this._doInit();
    await this.initPromise;
    return this.ready;
  }

  private async _doInit(): Promise<void> {
    if (!existsSync(this.modelPath)) {
      return;
    }

    try {
      this.llama = await getLlama();
      this.model = await this.llama.loadModel({ modelPath: this.modelPath });
      this.context = await this.model.createContext({ contextSize: 2048 });
      this.ready = true;
    } catch {
      this.ready = false;
    }
  }

  async generate(systemPrompt: string, userMessage: string): Promise<string> {
    if (!this.ready || !this.context || !this.model) {
      throw new Error('Model not loaded');
    }

    const { LlamaChatSession } = await import('node-llama-cpp');
    const contextSequence = this.context.getSequence();
    const session = new LlamaChatSession({ contextSequence, systemPrompt });

    try {
      const response = await session.prompt(userMessage, {
        maxTokens: 200,
        temperature: 0.8,
      });

      return response.trim();
    } finally {
      session.dispose();
      contextSequence.dispose();
    }
  }

  dispose(): void {
    this.context?.dispose();
    this.model?.dispose();
    this.llama = null;
    this.model = null;
    this.context = null;
    this.ready = false;
  }
}
