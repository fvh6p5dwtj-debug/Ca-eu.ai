const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const USE_CPU = process.env.OLLAMA_USE_CPU === 'true';

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function ollamaChat(
  model: string,
  messages: OllamaMessage[],
  options: { temperature?: number; stream?: boolean; num_predict?: number } = {}
) {
  const res = await fetch(`${OLLAMA_HOST}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: options.stream ?? false,
      options: {
        temperature: options.temperature ?? 0.8,
        top_p: 0.9,
        num_predict: options.num_predict ?? 512,
        ...(USE_CPU ? { num_gpu: 0 } : {}),
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama error: ${res.status} ${await res.text()}`);
  }

  if (options.stream) {
    return res.body;
  }

  const data = await res.json();
  return data.message.content as string;
}

export async function listModels() {
  const res = await fetch(`${OLLAMA_HOST}/api/tags`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.models?.map((m: any) => m.name) ?? [];
}

export const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'candyai-companion';