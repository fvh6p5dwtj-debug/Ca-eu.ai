'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Sparkles, ImageIcon } from 'lucide-react';
import type { Character } from '@/lib/characters';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  prompt?: string;
}

export default function ChatInterface({ character }: { character: Character }) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    };

    const assistantId = crypto.randomUUID();
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput('');
    setIsLoading(true);

    const allMessages = [
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: text },
    ];

    try {
      abortRef.current = new AbortController();
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMessages, characterId: character.id }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || 'Failed to generate response');
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: accumulated } : m
          )
        );
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: `⚠️ ${errorMessage}` }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const generateImage = async () => {
    const text = input.trim();
    const defaultPrompt = `a beautiful photo of ${character.name}, ${character.specialty}, stunning portrait`;
    const imagePrompt = text || defaultPrompt;
    if (isGeneratingImage) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text ? `🎨 ${text}` : '🎨 Generate a photo of me',
    };

    const imageId = crypto.randomUUID();
    const assistantMessage: ChatMessage = {
      id: imageId,
      role: 'assistant',
      content: 'Let me send you a photo... 📸',
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput('');
    setIsGeneratingImage(true);

    try {
      const res = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt, characterId: character.id }),
      });

      const data = await res.json();

      if (data.url) {
        const caption = data.model ? `Here's a photo for you ✨ (${data.model})` : 'Here\'s a photo for you ✨';
        setMessages((prev) =>
          prev.map((m) =>
            m.id === imageId
              ? { ...m, content: caption, imageUrl: data.url, prompt: imagePrompt }
              : m
          )
        );
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === imageId
              ? { ...m, content: `⚠️ ${data.error || 'Image generation failed'}` }
              : m
          )
        );
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === imageId
            ? { ...m, content: '⚠️ Failed to generate image. Make sure ComfyUI is running.' }
            : m
        )
      );
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a1a] overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40 w-80 flex-shrink-0
          bg-[#120a24] border-r border-purple-500/20
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Back button */}
        <div className="p-4 border-b border-purple-500/20">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-purple-400 hover:text-fuchsia-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>

        {/* Character info */}
        <div className="flex-1 flex flex-col items-center p-6 text-center overflow-y-auto">
          {/* Avatar */}
          <div
            className={`
              w-28 h-28 rounded-full bg-gradient-to-br ${character.gradient}
              flex items-center justify-center text-5xl mb-5
              shadow-lg shadow-purple-500/20
            `}
          >
            {character.emoji}
          </div>

          {/* Name */}
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
            {character.name}
          </h2>

          {/* Age & specialty */}
          <p className="text-purple-400 text-sm mt-1">
            {character.age} · {character.specialty}
          </p>

          {/* Bio */}
          <p className="text-gray-400 text-sm mt-4 leading-relaxed">
            {character.bio}
          </p>

          {/* Status */}
          <div className="mt-6 flex items-center gap-2 text-xs text-emerald-400">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Online now
          </div>

          {/* Prompt starter */}
          <div className="mt-8 w-full space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
              Conversation starters
            </p>
            {getStarters(character.id).map((starter, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(starter);
                  inputRef.current?.focus();
                }}
                className="
                  w-full text-left px-4 py-2.5 rounded-xl text-sm
                  bg-[#1a0a2e] border border-purple-500/20
                  text-gray-300 hover:text-purple-300
                  hover:border-purple-500/40 hover:bg-[#221040]
                  transition-all duration-200
                "
              >
                {starter}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-purple-500/20 bg-[#0a0a1a]/80 backdrop-blur-sm flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-purple-500/10 text-purple-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div
            className={`
              w-9 h-9 rounded-full bg-gradient-to-br ${character.gradient}
              flex items-center justify-center text-lg flex-shrink-0
            `}
          >
            {character.emoji}
          </div>
          <div className="min-w-0">
            <h1 className="text-white font-semibold text-sm truncate">{character.name}</h1>
            <p className="text-xs text-purple-400">{character.specialty}</p>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {/* Welcome message */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div
                className={`
                  w-20 h-20 rounded-full bg-gradient-to-br ${character.gradient}
                  flex items-center justify-center text-4xl mb-4
                  shadow-lg shadow-purple-500/20
                `}
              >
                {character.emoji}
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Chat with {character.name}
              </h2>
              <p className="text-gray-400 text-sm max-w-md">
                {character.name} is ready to chat! Say something to start the conversation.
              </p>
            </div>
          )}

          {/* Message list */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3
                  ${msg.role === 'user'
                    ? 'bg-purple-600 text-white rounded-br-md'
                    : 'bg-[#1a0a2e] border border-purple-500/20 text-gray-200 rounded-bl-md'
                  }
                `}
              >
                {msg.content === '' && msg.role === 'assistant' ? (
                  <div className="flex items-center gap-1.5 py-1">
                    <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                    <span className="text-sm text-purple-400">Thinking...</span>
                  </div>
                ) : msg.content === 'Generating your image...' ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-purple-400 animate-pulse">Generating your image...</span>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                    {msg.imageUrl && (
                      <div className="mt-3 space-y-2">
                        <img
                          src={msg.imageUrl}
                          alt="Generated image"
                          className="rounded-xl max-w-xs border border-purple-500/20 object-cover"
                        />
                        {msg.prompt && (
                          <p className="text-xs text-gray-400 text-center italic">{msg.prompt}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-purple-500/20 bg-[#0a0a1a]/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 max-w-4xl mx-auto">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${character.name}...`}
              disabled={isLoading || isGeneratingImage}
              className="
                flex-1 px-4 py-3 rounded-xl
                bg-[#1a0a2e] border border-purple-500/20
                text-white placeholder-gray-500
                focus:outline-none focus:border-purple-500/50
                focus:shadow-lg focus:shadow-purple-500/10
                transition-all duration-200
                disabled:opacity-50
              "
            />
            <button
              onClick={generateImage}
              disabled={isGeneratingImage}
              title="Generate image"
              className="
                bg-purple-500/20 hover:bg-purple-500/30
                rounded-full p-2 transition
                disabled:opacity-40 disabled:cursor-not-allowed
                text-purple-400 hover:text-fuchsia-400
                flex-shrink-0
              "
            >
              {isGeneratingImage ? (
                <span className="flex items-center justify-center w-5 h-5">
                  <span className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                </span>
              ) : (
                <ImageIcon className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading || isGeneratingImage}
              className="
                p-3 rounded-xl
                bg-gradient-to-r from-purple-500 to-fuchsia-500
                text-white
                hover:from-purple-400 hover:to-fuchsia-400
                shadow-lg shadow-purple-500/20
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-purple-500 disabled:hover:to-fuchsia-500
                transition-all duration-200
                flex-shrink-0
              "
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function getStarters(characterId: string): string[] {
  const starters: Record<string, string[]> = {
    sophia: [
      'What is your idea of a perfect date?',
      'Tell me about your favorite love story',
      "What's the most romantic thing you've ever done?",
    ],
    elena: [
      'Tell me your best joke',
      "What's the funniest thing that happened to you?",
      'Roast me (gently)',
    ],
    viktoria: [
      'What do you think happens when we die?',
      "What's the meaning of life?",
      'Tell me about a book that changed your perspective',
    ],
    luna: [
      "What are you doing up so late?",
      "Tell me about your dream vacation",
      "What's your idea of a perfect night?",
    ],
    mia: [
      'What are you working on creatively?',
      'Describe your favorite piece of art',
      'What inspires you the most?',
    ],
    aria: [
      "What's your current workout routine?",
      'Teach me a dance move',
      "What's your biggest fitness goal?",
    ],
    nova: [
      "What's your favorite country you've visited?",
      'Tell me a travel story',
      "Where should I travel next?",
    ],
    zara: [
      "What are you playing right now?",
      "What's the best game ever made?",
      "Let's debate: controller vs keyboard",
    ],
    atlas: [
      "What's the craziest adventure you've been on?",
      'Teach me a survival skill',
      "What's your favorite hiking trail?",
    ],
    damien: [
      "What song are you working on?",
      'Play me something on guitar',
      "What's the most beautiful song you've ever heard?",
    ],
    rex: [
      "What's your signature dish?",
      'Teach me a recipe',
      "What's the best meal you've ever had?",
    ],
    phoenix: [
      "What's your next big idea?",
      "What's the best business advice you've gotten?",
      'How do you stay so motivated?',
    ],
    catalina: [
      'Take me on an adventure',
      "What's the most spontaneous thing you've done?",
      'Let\'s go somewhere exciting',
    ],
    natasha: [
      'Think you can handle me?',
      'Challenge me, I dare you',
      "What makes someone worth your time?",
    ],
    mariana: [
      'Tell me your life story like a movie',
      'What\'s the most dramatic thing that happened to you?',
      'Describe a perfect romantic scene',
    ],
    rebecca: [
      'Teach me something I don\'t know',
      'What\'s your idea of a perfect evening?',
      'Tell me about your life experiences',
    ],
    yuki: [
      'Konnichiwa Yuki! Tell me about yourself',
      'What anime should I watch?',
      'Show me something kawaii!',
    ],
    'sofia-c': [
      'How can I make you happy today?',
      'Tell me what you enjoy',
      'What does devotion mean to you?',
    ],
    riley: [
      'Take me for a ride',
      "What's the craziest thing you've done?",
      'Tell me about your bike',
    ],
    emily: [
      'Cook something for me',
      'Tell me about your garden',
      'How was your day?',
    ],
    serena: [
      'I want to know your secrets',
      'Tell me something mysterious',
      'What are you hiding behind that smile?',
    ],
    isabella: [
      'Should you really marry him?',
      'Tell me your doubts',
      'What does your heart really want?',
    ],
  };
  return starters[characterId] ?? ['Hey! Tell me about yourself'];
}
