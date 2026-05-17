import { create } from 'zustand';
import { favoritesAPI } from '../api/client.js';

const useFavoritesStore = create((set, get) => ({
  ids: new Set(),
  loaded: false,

  load: async () => {
    if (get().loaded) return;
    try {
      const { data } = await favoritesAPI.list();
      set({ ids: new Set(data.map((f) => String(f.contentId))), loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  toggle: (contentId, favorited) => {
    const ids = new Set(get().ids);
    if (favorited) ids.add(String(contentId));
    else ids.delete(String(contentId));
    set({ ids });
  },

  reset: () => set({ ids: new Set(), loaded: false }),
}));

export default useFavoritesStore;
