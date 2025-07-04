import { create } from "zustand";
import { SharedValue, useSharedValue } from "react-native-reanimated";

type ScrollStore = {
  scrollY: SharedValue<number>;
};

export const useScrollStore = create<ScrollStore>(() => ({
  scrollY: useSharedValue(0),
}));
