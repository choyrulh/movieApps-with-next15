// src/store/watchlistStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getCookie } from "@/Service/fetchUser";
import {
  addToWatchlistAPI,
  removeFromWatchlistAPI,
  fetchWatchlist as fetchWatchlistAPI,
} from "@/Service/actionUser";
import { Genre } from "@/types/movie.";

export interface WatchlistItem {
  id: number;
  title: string;
  poster?: string;
  type?: "movie" | "tv" | "person";
  release_date?: string;
  backdrop_path?: string;
  vote_average?: number;
  genres?: Genre[];
  movieId?: any;
  name?: string;
  first_air_date?: string;
  poster_path?: string;
  watchlist?: WatchlistItem[];
  media_type: string;
}

export interface WatchlistState {
  watchlist: WatchlistItem[];
  addToWatchlist: (item: WatchlistItem) => void;
  removeFromWatchlist: (id: number) => void;
  syncWithServer: () => Promise<void>;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      watchlist: [],
      addToWatchlist: async (item) => {
        const token = getCookie("user");

        if (token) {
          // Use Server Action
          try {
            await addToWatchlistAPI(
              item,
              item.type || item.media_type || "movie"
            );

            set((state) => ({
              watchlist: [...state.watchlist, item],
            }));
          } catch (error) {
            console.error(error);
          }
        } else {
          // Hanya update state, biarkan persist handle storage
          set((state) => {
            const exists = state.watchlist.some((i) => i.id === item.id);
            return exists ? state : { watchlist: [...state.watchlist, item] };
          });
        }
      },

      removeFromWatchlist: async (id) => {
        const token = getCookie("user");
        if (token) {
          try {
            await removeFromWatchlistAPI(id);
            // Jalankan syncWithServer setelah berhasil menghapus
            await get().syncWithServer();
          } catch (error) {
            console.error(error);
          }
        } else {
          set((state) => ({
            watchlist: state.watchlist.filter((item) => item.id !== id),
          }));
        }
      },
      syncWithServer: async () => {
        const token = getCookie("user");

        if (token) {
          // Jika ada token, ambil data dari API (via Server Action) dan update state
          try {
            const serverWatchlist = await fetchWatchlistAPI();

            if (serverWatchlist) {
              // Update state secara langsung tanpa mempengaruhi local storage
              set({ watchlist: serverWatchlist as WatchlistItem[] });
            }
          } catch (error) {
            console.error(error);
          }
        } else {
          // Jika tidak ada token (atau server action fail), ambil dari local storage
          const localData = JSON.parse(
            localStorage.getItem("watchlist-storage") || "{}"
          );
          set({ watchlist: localData?.state?.watchlist || [] });
        }
      },
    }),
    {
      name: "watchlist-storage",
      storage: {
        getItem: (name) => {
          if (typeof window === "undefined") return null;
          const str = localStorage.getItem(name);
          if (!str) return null;

          // Parse data dengan format yang benar
          const { state } = JSON.parse(str);
          return {
            state: {
              watchlist: state?.watchlist || [],
            },
          };
        },
        setItem: (name, value) => {
          if (typeof window === "undefined") return;
          const token = getCookie("user");
          if (!token) {
            // Simpan dengan format yang benar
            localStorage.setItem(
              name,
              JSON.stringify({
                state: {
                  watchlist: value.state.watchlist,
                },
              })
            );
          }
        },
        removeItem: (name) => {
          if (typeof window === "undefined") return;
          localStorage.removeItem(name);
        },
      },
    }
  )
);
