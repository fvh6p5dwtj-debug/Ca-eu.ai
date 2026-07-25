import { NextResponse } from 'next/server';
import { ollamaChat, DEFAULT_MODEL } from '@/lib/ollama';
import { openrouterChat, DEFAULT_OPENROUTER_MODEL, hasOpenRouterKeys } from '@/lib/openrouter';
import { characters } from '@/lib/characters';

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

// Strips <think>...</think> reasoning blocks (emitted by some models) from a
// stream of plain content chunks and encodes the rest to bytes.
function stripThinkTags(): TransformStream<string, Uint8Array> {
  const encoder = new TextEncoder();
  let buffer = '';
  let inThinking = false;

  return new TransformStream({
    transform(content, controller) {
      buffer += content;
      const openTag = '<think>';
      const closeTag = '</think>';
      while (buffer.includes(openTag) || buffer.includes(closeTag)) {
        const openIdx = buffer.indexOf(openTag);
        const closeIdx = buffer.indexOf(closeTag);
        if (openIdx !== -1 && (closeIdx === -1 || openIdx < closeIdx)) {
          if (!inThinking) {
            const before = buffer.substring(0, openIdx);
            if (before) controller.enqueue(encoder.encode(before));
          }
          inThinking = true;
          buffer = buffer.substring(openIdx + openTag.length);
        } else if (closeIdx !== -1) {
          inThinking = false;
          buffer = buffer.substring(closeIdx + closeTag.length);
        }
      }
      if (!inThinking && buffer) {
        const toSend = buffer;
        buffer = '';
        controller.enqueue(encoder.encode(toSend));
      }
    },
    flush(controller) {
      if (buffer && !inThinking) {
        controller.enqueue(encoder.encode(buffer));
      }
    },
  });
}

// Parses Ollama's newline-delimited JSON stream into plain content chunks.
function parseOllamaStream(): TransformStream<Uint8Array, string> {
  const decoder = new TextDecoder();
  let leftover = '';
  return new TransformStream({
    transform(chunk, controller) {
      const text = leftover + decoder.decode(chunk, { stream: true });
      const lines = text.split('\n');
      leftover = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          if (json.message?.content) controller.enqueue(json.message.content);
        } catch {
          // skip malformed lines
        }
      }
    },
  });
}

// Parses an OpenAI-compatible SSE stream ("data: {...}\n\n", terminated by
// "data: [DONE]") into plain content chunks.
function parseSSEStream(): TransformStream<Uint8Array, string> {
  const decoder = new TextDecoder();
  let leftover = '';
  return new TransformStream({
    transform(chunk, controller) {
      const text = leftover + decoder.decode(chunk, { stream: true });
      const lines = text.split('\n');
      leftover = lines.pop() ?? '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === '[DONE]') continue;
        try {
          const json = JSON.parse(payload);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) controller.enqueue(delta);
        } catch {
          // skip malformed lines
        }
      }
    },
  });
}

export async function POST(req: Request) {
  try {
    const { messages, characterId } = await req.json();

    const character = characters.find(c => c.id === characterId);
    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    const chatMessages: ChatMessage[] = [
      { role: 'system', content: character.systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    // Prefer OpenRouter when configured (works anywhere, including serverless
    // deployments); fall back to a local Ollama instance for local dev.
    const useOpenRouter = hasOpenRouterKeys();
    const stream = useOpenRouter
      ? await openrouterChat(DEFAULT_OPENROUTER_MODEL, chatMessages, { stream: true, temperature: 0.85 })
      : await ollamaChat(DEFAULT_MODEL, chatMessages, { stream: true, temperature: 0.85 });

    if (!stream || typeof stream === 'string') {
      return NextResponse.json({ error: 'Failed to get stream' }, { status: 500 });
    }

    const parser = useOpenRouter ? parseSSEStream() : parseOllamaStream();
    const readable = stream.pipeThrough(parser).pipeThrough(stripThinkTags());

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate response';
    console.error('Chat error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
