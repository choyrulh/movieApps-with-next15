import {
  fetchUserProfile,
  getWatchlistUser,
  getHistoryWatchUser,
  getFavoritesUser,
  getStatsUser,
} from "@/Service/fetchUser";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type QueryType =
  | "userProfile"
  | "watchlist"
  | "history"
  | "favorites"
  | "stats";

interface UseUserDataOptions {
  queryType: QueryType;
  type?: "week" | "month"; // Hanya untuk getFavoritesUser dan getStatsUser
}

export function useUserProfile({
  queryType = "userProfile",
  type = "week",
}: Partial<UseUserDataOptions> = {}) {
  const queryClient = useQueryClient();

  const fetchFunction = () => {
    switch (queryType) {
      case "userProfile":
        return fetchUserProfile();
      case "watchlist":
        return getWatchlistUser();
      case "history":
        return getHistoryWatchUser();
      case "favorites":
        return getFavoritesUser();
      case "stats":
        return getStatsUser(type);
      default:
        throw new Error(`Invalid queryType: ${queryType}`);
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [queryType, queryType === "stats" ? type : undefined].filter(
      Boolean
    ),
    queryFn: fetchFunction,
  });

  // **Fungsi untuk trigger refetch saat data berubah**
  const refetchData = () => {
    queryClient.invalidateQueries({
      queryKey: [queryType, queryType === "stats" ? type : undefined].filter(
        Boolean
      ),
    });
  };

  return { data, isLoading, error, refetch, refetchData };
}
