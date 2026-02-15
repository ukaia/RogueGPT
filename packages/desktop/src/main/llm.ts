// llm.ts - LLM model loading and IPC handler for the Electron main process
//
// Loads the GGUF model once on app startup and handles 'llm:generate'
// IPC requests from the renderer process.

import { ipcMain, app } from 'electron';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { getLlama, LlamaChatSession, type Llama, type LlamaModel, type LlamaContext } from 'node-llama-cpp';

let llama: Llama | null = null;
let model: LlamaModel | null = null;
let context: LlamaContext | null = null;
let ready = false;

function getModelPath(): string {
  // In packaged app: resources/models/
  const resourcePath = path.join(process.resourcesPath, 'models', 'qwen3-0.6b-q4_k_m.gguf');
  if (existsSync(resourcePath)) return resourcePath;

  // In development: repo root models/
  const devPath = path.join(app.getAppPath(), '..', '..', 'models', 'qwen3-0.6b-q4_k_m.gguf');
  return devPath;
}

export async function initLLM(): Promise<void> {
  const modelPath = getModelPath();
  console.log('[LLM] Checking for model at', modelPath);
  if (!existsSync(modelPath)) {
    console.log('[LLM] Model not found at', modelPath, '— running without LLM');
    return;
  }

  try {
    console.log('[LLM] Loading model from', modelPath);
    llama = await getLlama();
    model = await llama.loadModel({ modelPath });
    context = await model.createContext({ contextSize: 2048 });
    ready = true;
    console.log('[LLM] Model loaded successfully');
  } catch (err) {
    console.error('[LLM] Failed to load model:', err);
    ready = false;
  }
}

export function registerLLMHandlers(): void {
  console.log('[LLM] Registering IPC handlers');
  ipcMain.handle('llm:available', () => {
    console.log('[LLM] IPC handler llm:available called, ready:', ready);
    return ready;
  });

  ipcMain.handle('llm:generate', async (_event, systemPrompt: string, userMessage: string): Promise<string | null> => {
    console.log('[LLM] IPC handler llm:generate called');
    console.log('[LLM] System prompt:', systemPrompt);
    console.log('[LLM] User message:', userMessage);

    if (!ready || !context || !model) {
      console.log('[LLM] Not ready for generation - ready:', ready, 'context:', !!context, 'model:', !!model);
      return null;
    }

    try {
      const contextSequence = context.getSequence();
      const session = new LlamaChatSession({ contextSequence, systemPrompt });
      const response = await session.prompt(userMessage, {
        maxTokens: 200,
        temperature: 0.8,
      });
      session.dispose();
      contextSequence.dispose();
      console.log('[LLM] Generated response:', response);
      return response.trim();
    } catch (err) {
      console.error('[LLM] Generation failed:', err);
      return null;
    }
  });
}

export function disposeLLM(): void {
  context?.dispose();
  model?.dispose();
  llama = null;
  model = null;
  context = null;
  ready = false;
}
