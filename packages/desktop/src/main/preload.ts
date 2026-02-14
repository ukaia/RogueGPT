import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('platform', {
  isElectron: true,
});

contextBridge.exposeInMainWorld('electronLLM', {
  isAvailable: (): Promise<boolean> => ipcRenderer.invoke('llm:available'),
  generate: (systemPrompt: string, userMessage: string): Promise<string | null> =>
    ipcRenderer.invoke('llm:generate', systemPrompt, userMessage),
});
