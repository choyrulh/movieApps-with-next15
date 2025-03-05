// src/store/useFavoriteStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getCookie } from "@/Service/fetchUser";

const url = "https://backend-movie-apps-api-one.vercel.app/api/favorites";

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
            const response = await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(item),
            });

            if (!response.ok) throw new Error("Failed to add to favorites");

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
            const response = await fetch(`${url}/${itemId}?type=${type}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!response.ok)
              throw new Error("Failed to remove from favorites");
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
            const response = await fetch(url, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!response.ok) throw new Error("Failed to fetch favorites");

            const serverData: FavoriteItem[] = await response.json();

            // Mapping data dari server ke format local
            // const formattedFavorites = serverData.map((item) => ({
            //   itemId: item.itemId,
            //   type: item.type,
            //   title: item.title,
            //   name: item.name,
            //   imagePath: item.imagePath,
            //   release_date: item.release_date,
            //   backdrop_path: item.backdrop_path,
            //   vote_average: item.vote_average,
            //   genres: item.genres || [],
            // }));

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
          localStorage.removeItem(name);
        },
      },
    }
  )
);

//     removeFromFavorites: async (itemId, type) => {
//       const token = getCookie("user");
//       if (token) {
//         try {
//           const response = await fetch(`${url}/${itemId}?type=${type}`, {
//             method: "DELETE",
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           });

//           if (!response.ok) throw new Error("Failed to remove from favorites");
//           await get().syncWithServer();
//         } catch (error) {
//           console.error(error);
//         }
//       }
//     },

//     syncWithServer: async () => {
//       const token = getCookie("user");

//       if (token) {
//         try {
//           const response = await fetch(url, {
//             method: "GET",
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           });

//           if (!response.ok) throw new Error("Failed to fetch favorites");

//           const serverData: FavoriteItem[] = await response.json();

//           // Mapping data dari server ke format local
//           // const formattedFavorites = serverData.map((item) => ({
//           //   itemId: item.itemId,
//           //   type: item.type,
//           //   title: item.title,
//           //   name: item.name,
//           //   imagePath: item.imagePath,
//           //   release_date: item.release_date,
//           //   backdrop_path: item.backdrop_path,
//           //   vote_average: item.vote_average,
//           //   genres: item.genres || [],
//           // }));

//           set({ favorites: serverData });
//         } catch (error) {
//           console.error(error);
//         }
//       }
//     },
//   }))
// );
