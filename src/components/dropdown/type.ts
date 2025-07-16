import { ReactNode } from "react";
import { type MenuAction as RNMenuAction } from "@react-native-menu/menu";

export type DropDownMenuAction = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  web?: {
    icon?: ReactNode;
  };
  native?: RNMenuAction;
};

export interface DropDownMenuProps extends React.PropsWithChildren {
  actions?: DropDownMenuAction[];
}
