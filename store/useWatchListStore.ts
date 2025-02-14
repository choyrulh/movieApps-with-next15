// src/store/watchlistStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WatchlistItem {
  id: number;
  title: string;
  poster_path: string;
  media_type?: "movie" | "tv" | "person";
  release_date?: string;
}

export interface WatchlistState {
  watchlist: WatchlistItem[];
  addToWatchlist: (item: WatchlistItem) => void;
  removeFromWatchlist: (id: number) => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set) => ({
      watchlist: [],
      addToWatchlist: (item) =>
        set((state) => ({
          watchlist: state.watchlist.some((i) => i.id === item.id)
            ? state.watchlist
            : [...state.watchlist, item],
        })),
      removeFromWatchlist: (id) =>
        set((state) => ({
          watchlist: state.watchlist.filter((item) => item.id !== id),
        })),
    }),
    {
      name: "watchlist-storage",
    }
  )
);
