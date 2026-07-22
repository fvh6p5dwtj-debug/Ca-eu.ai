import { create } from 'zustand';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'image' | 'video';
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

interface ChatState {
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, { ...message, id: crypto.randomUUID(), timestamp: new Date() }],
  })),
  clearMessages: () => set({ messages: [] }),
}));
