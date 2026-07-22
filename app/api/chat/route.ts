import { NextResponse } from 'next/server';
import { ollamaChat, DEFAULT_MODEL, type OllamaMessage } from '@/lib/ollama';
import { characters } from '@/lib/characters';

export async function POST(req: Request) {
  try {
    const { messages, characterId } = await req.json();

    const character = characters.find(c => c.id === characterId);
    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    const systemMessage: OllamaMessage = {
      role: 'system',
      content: character.systemPrompt,
    };

    const ollamaMessages: OllamaMessage[] = [
      systemMessage,
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    const stream = await ollamaChat(DEFAULT_MODEL, ollamaMessages, {
      stream: true,
      temperature: 0.85,
    });

    if (!stream || typeof stream === 'string') {
      return NextResponse.json({ error: 'Failed to get stream' }, { status: 500 });
    }

    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = '';
    let inThinking = false;

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = decoder.decode(chunk, { stream: true });
        const lines = text.split('\n').filter(Boolean);

        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.message?.content) {
              buffer += json.message.content;
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
            }
          } catch {
            // skip malformed lines
          }
        }
      },
      flush(controller) {
        if (buffer && !inThinking) {
          controller.enqueue(encoder.encode(buffer));
        }
      },
    });

    const readable = stream.pipeThrough(transformStream);

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