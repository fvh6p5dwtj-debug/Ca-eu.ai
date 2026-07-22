const OPENROUTER_API_KEYS = [
  process.env.OPENROUTER_API_KEY_1,
  process.env.OPENROUTER_API_KEY_2,
  process.env.OPENROUTER_API_KEY_3,
  process.env.OPENROUTER_API_KEY_4,
  process.env.OPENROUTER_API_KEY_5,
  process.env.OPENROUTER_API_KEY_6,
  process.env.OPENROUTER_API_KEY_7,
  process.env.OPENROUTER_API_KEY_8,
].filter(Boolean) as string[];

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

let keyIndex = 0;

function getNextKey(): string {
  if (OPENROUTER_API_KEYS.length === 0) {
    throw new Error('No OpenRouter API keys configured');
  }
  const key = OPENROUTER_API_KEYS[keyIndex % OPENROUTER_API_KEYS.length];
  keyIndex++;
  return key;
}

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function openrouterChat(
  model: string,
  messages: OpenRouterMessage[],
  options: { temperature?: number; stream?: boolean; max_tokens?: number } = {}
): Promise<ReadableStream<Uint8Array> | string> {
  if (OPENROUTER_API_KEYS.length === 0) {
    throw new Error('No OpenRouter API keys configured');
  }

  const body = {
    model,
    messages,
    stream: options.stream ?? false,
    temperature: options.temperature ?? 0.85,
    max_tokens: options.max_tokens ?? 1024,
  };

  let lastError = '';
  for (let attempt = 0; attempt < Math.min(3, OPENROUTER_API_KEYS.length); attempt++) {
    const apiKey = getNextKey();
    try {
      const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'CandyAI',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text();
        lastError = `OpenRouter error ${res.status}: ${errText}`;
        if (res.status === 401 || res.status === 403 || res.status === 429) {
          continue;
        }
        throw new Error(lastError);
      }

      if (options.stream) {
        return res.body as ReadableStream<Uint8Array>;
      }

      const data = await res.json();
      return data.choices[0].message.content as string;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      continue;
    }
  }

  throw new Error(lastError || 'All OpenRouter keys failed');
}

export const DEFAULT_OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

export function hasOpenRouterKeys(): boolean {
  return OPENROUTER_API_KEYS.length > 0;
}