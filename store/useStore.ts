import { create } from "zustand";

interface State {
  genresId: string | null;
  setSelectedGenresId: (genresId: string | null) => void;
}

export const useStore = create<State>((set: any) => ({
  // state
  genresId: "",

  // actions
  setSelectedGenresId: (genresId: string | null) => set({ genresId }),
}));
