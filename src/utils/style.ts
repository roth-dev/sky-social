import { StyleProp } from "react-native";

export function mergeStyle<T>(
  base: StyleProp<T>,
  addedStyle: StyleProp<T>
): StyleProp<T> {
  if (Array.isArray(base)) {
    return base.concat([addedStyle]);
  }
  return [base, addedStyle];
}
