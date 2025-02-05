import { create } from "zustand";

export interface State {
  genresId: string | null;
  selectedType: string;
  historyData: any;

  setSelectedGenresId: (genresId: string | null) => void;
  setSelectedType: (selectedType: string) => void;
  setHistoryData: (historyData: any) => void;
}

export const useStore = create<State>((set) => ({
  // state
  genresId: "",
  selectedType: "movie",
  historyData: {},

  // actions
  setSelectedGenresId: (genresId: string | null) => set({ genresId }),
  setSelectedType: (selectedType) => set(() => ({ selectedType })),
  setHistoryData: (historyData) => set(() => ({ historyData })),
}));
