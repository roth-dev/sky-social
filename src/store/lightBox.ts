import { create } from "zustand";

type LightBoxStore = {
  isOpen: boolean;
  setValue: (open: boolean) => void;
};

export const useLightBoxOpen = create<LightBoxStore>((set) => ({
  isOpen: false,
  setValue: (isOpen: boolean) => set({ isOpen }),
}));
