import { create } from "zustand";

export interface State {
  genresId: string | null;
  selectedType: string;
  detailData: any;

  setSelectedGenresId: (genresId: string | null) => void;
  setSelectedType: (selectedType: string) => void;
  setDetailData: (detailData: any) => void;
}

export const useStore = create<State>((set) => ({
  // state
  genresId: "",
  selectedType: "movie",
  detailData: {},

  // actions
  setSelectedGenresId: (genresId: string | null) => set({ genresId }),
  setSelectedType: (selectedType) => set(() => ({ selectedType })),
  setDetailData: (detailData) => set(() => ({ detailData })),
}));
