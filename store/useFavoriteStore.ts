// src/store/useFavoriteStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getCookie } from "@/Service/fetchUser";
import {
  addToFavoritesAPI,
  removeFromFavoritesAPI,
  getFavoritesUserAPI,
} from "@/Service/actionUser";

export interface FavoriteItem {
  itemId: any;
  type: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  imagePath?: string;
  release_date?: string;
  backdrop_path?: string;
  vote_average?: number;
  genres?: Array<{ id: number; name: string }>;
  media_type?: string;
  id?: number;
  profile_path?: string;
  first_air_date?: string;
  poster_path?: string;
}

export interface FavoriteState {
  favorites: FavoriteItem[];
  addToFavorites: (item: FavoriteItem) => void;
  removeFromFavorites: (itemId: number, type: string) => void;
  syncWithServer: () => Promise<void>;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favorites: [],

      addToFavorites: async (item) => {
        const token = getCookie("user");

        if (token) {
          try {
            await addToFavoritesAPI(item);

            // Sync setelah berhasil menambahkan
            await get().syncWithServer();
          } catch (error) {
            console.error(error);
          }
        }
      },

      removeFromFavorites: async (itemId, type) => {
        const token = getCookie("user");
        if (token) {
          try {
            await removeFromFavoritesAPI(itemId, type);
            await get().syncWithServer();
          } catch (error) {
            console.error(error);
          }
        }
      },

      syncWithServer: async () => {
        const token = getCookie("user");

        if (token) {
          try {
            const serverData: FavoriteItem[] = await getFavoritesUserAPI();

            set({ favorites: serverData });
          } catch (error) {
            console.error(error);
          }
        }
      },
    }),
    {
      name: "favorites-storage",
      storage: {
        getItem: (name) => {
          if (typeof window === "undefined") return null;
          const str = localStorage.getItem(name);
          if (!str) return null;

          // Parse data dengan format yang benar
          const { state } = JSON.parse(str);
          return {
            state: {
              favorites: state?.favorites || [],
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
                  favorites: value.state.favorites,
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
