import { create } from 'zustand';

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  prompt: string;
  timestamp: Date;
}

interface MediaState {
  gallery: MediaItem[];
  addMedia: (item: Omit<MediaItem, 'id' | 'timestamp'>) => void;
  deleteMedia: (id: string) => void;
}

export const useMediaStore = create<MediaState>((set) => ({
  gallery: [],
  addMedia: (item) => set((state) => ({
    gallery: [...state.gallery, { ...item, id: crypto.randomUUID(), timestamp: new Date() }],
  })),
  deleteMedia: (id) => set((state) => ({
    gallery: state.gallery.filter((item) => item.id !== id),
  })),
}));
