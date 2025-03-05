// src/store/watchlistStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getCookie } from "@/Service/fetchUser";
import { Genre } from "@/types/movie.";

// url for link api add and delete watchlist
const url = "https://backend-movie-apps-api-one.vercel.app/api/watchlist";

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
          // Logika API tetap sama
          try {
            const response = await fetch(`${url}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(item),
            });

            if (!response.ok) throw new Error("Failed to add to watchlist");

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
            const response = await fetch(`${url}/${id}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (!response.ok)
              throw new Error("Failed to remove from watchlist");
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
          // Jika ada token, ambil data dari API dan update state TANPA menyentuh local storage
          try {
            const response = await fetch(`${url}`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!response.ok) throw new Error("Failed to fetch watchlist");

            const serverWatchlist: WatchlistItem[] = await response.json();

            // Update state secara langsung tanpa mempengaruhi local storage
            set({ watchlist: serverWatchlist });
          } catch (error) {
            console.error(error);
          }
        } else {
          // Jika tidak ada token, ambil dari local storage
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
          localStorage.removeItem(name);
        },
      },
    }
  )
);
