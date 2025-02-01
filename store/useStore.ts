import { create } from "zustand";

export interface State {
  genresId: string | null;
  selectedType: string;

  setSelectedGenresId: (genresId: string | null) => void;
  setSelectedType: (selectedType: string) => void;
}

export const useStore = create<State>((set) => ({
  // state
  genresId: "",
  selectedType: "movie",

  // actions
  setSelectedGenresId: (genresId: string | null) => set({ genresId }),
  setSelectedType: (selectedType) => set(() => ({ selectedType })),
}));
