import { EmbedImage } from "@/types/embed";
import { create } from "zustand";

type LightBoxStore = {
  index: number | undefined;
  shareId: string | undefined;
  images: EmbedImage[];
  setValue: (
    images: EmbedImage[],
    index: number | undefined,
    shareId: string | undefined
  ) => void;
  clearValue: () => void;
};

export const useLightBoxOpen = create<LightBoxStore>((set) => ({
  index: 0,
  shareId: "",
  images: [],
  setValue: (
    images: EmbedImage[],
    index: number | undefined,
    shareId: string | undefined
  ) => set({ images, index, shareId }),
  clearValue: () => set({ images: [], index: undefined, shareId: undefined }),
}));
