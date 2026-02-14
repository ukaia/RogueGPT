// LLMProvider.ts - Interface for LLM backends
//
// The engine defines this interface but never imports native LLM libraries.
// Concrete implementations live in the CLI and desktop packages.

export interface LLMProvider {
  /** Generate a response given a system prompt and user message. */
  generate(systemPrompt: string, userMessage: string): Promise<string>;
}
