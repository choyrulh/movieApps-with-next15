import { create } from "zustand";

interface State {
  genresId: string;
  setSelectedGenresId: (genresId: string) => void;
}

export const useStore = create<State>((set: any) => ({
  // state
  genresId: "",

  // actions
  setSelectedGenresId: (genresId: string) => set({ genresId }),
}));
