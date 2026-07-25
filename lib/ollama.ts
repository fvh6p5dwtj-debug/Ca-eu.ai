// An OLLAMA_API_KEY points this at Ollama Cloud (ollama.com) instead of a
// local install: same /api/chat wire format (NDJSON, streaming or not),
// authenticated with a Bearer token. OLLAMA_HOST always wins if set explicitly.
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;
const OLLAMA_HOST = process.env.OLLAMA_HOST || (OLLAMA_API_KEY ? 'https://ollama.com' : 'http://localhost:11434');
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
    headers: {
      'Content-Type': 'application/json',
      ...(OLLAMA_API_KEY ? { Authorization: `Bearer ${OLLAMA_API_KEY}` } : {}),
    },
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
  const res = await fetch(`${OLLAMA_HOST}/api/tags`, {
    headers: OLLAMA_API_KEY ? { Authorization: `Bearer ${OLLAMA_API_KEY}` } : {},
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.models?.map((m: any) => m.name) ?? [];
}

// candyai-companion is a locally built custom model for a local install;
// Ollama Cloud doesn't have it, so default to a real cloud model instead
// whenever OLLAMA_API_KEY is set and OLLAMA_MODEL isn't given explicitly.
export const DEFAULT_MODEL = process.env.OLLAMA_MODEL || (OLLAMA_API_KEY ? 'gpt-oss:20b' : 'candyai-companion');

export function hasOllamaCloudKey(): boolean {
  return Boolean(OLLAMA_API_KEY);
}