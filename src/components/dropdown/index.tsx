import React from "react";
import {
  MenuView,
  type MenuAction as RNMenuAction,
  type NativeActionEvent,
  MenuComponentRef,
} from "@react-native-menu/menu";
import { Button } from "../ui";
import type { PropsWithChildren } from "react";
import { ButtonProps } from "../ui/Button";
import { View } from "react-native";
import { DropDownMenuProps } from "./type";

const DropDownMenu = React.forwardRef<MenuComponentRef, DropDownMenuProps>(
  ({ actions, children, ...menuViewProps }, ref) => {
    // Map your MenuAction to RNMenuAction
    const rnActions: RNMenuAction[] = (actions || []).map((action, idx) => ({
      id: String(idx),
      title: action.label,
      attributes: {
        disabled: action.disabled,
      },
      ...action.native,
    }));

    const handlePressAction = ({ nativeEvent }: NativeActionEvent) => {
      const idx = Number(nativeEvent.event);
      if (actions && actions[idx] && !actions[idx].disabled) {
        actions[idx].onPress();
      }
    };

    return (
      <MenuView
        ref={ref}
        actions={rnActions}
        onPressAction={handlePressAction}
        {...menuViewProps}
      >
        {children}
      </MenuView>
    );
  }
);

DropDownMenu.displayName = "DropDownMenu";

const Trigger = React.forwardRef<View, PropsWithChildren<ButtonProps>>(
  ({ children, ...props }, ref) => (
    <Button ref={ref} {...props}>
      {children}
    </Button>
  )
);
Trigger.displayName = "DropDownMenu.Trigger";

export { DropDownMenu, Trigger };
