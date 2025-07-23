import React, {
  forwardRef,
  PropsWithChildren,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { Modal, View as RNView } from "react-native";
import { Button, Text } from "../ui";
import { ButtonProps } from "../ui/Button";
import { Colors } from "../../constants/colors";
import { useSettings } from "@/contexts/SettingsContext";
import { DropDownMenuAction } from "./type";

export type MenuRef = {
  open: () => void;
  close: () => void;
};

type DisplayArea = "left" | "right" | "bottom" | "top";

interface MenuViewProps {
  visible?: boolean;
  close: () => void;
  anchor: { x: number; y: number; width: number; height: number } | null;
  displayArea?: DisplayArea;
  actions?: DropDownMenuAction[];
}
const MenuView = ({
  visible,
  close,
  anchor,
  displayArea = "bottom",
  actions,
}: MenuViewProps) => {
  const { colorScheme } = useSettings();
  const menuRef = useRef<HTMLDivElement>(null);

  // Calculate menu position based on displayArea
  let style: React.CSSProperties = useMemo(
    () => ({
      position: "absolute",
      minWidth: 150,
      zIndex: 999,
    }),
    []
  );

  // Clamp menu position to viewport
  const clampMenuPosition = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;
      const rect = node.getBoundingClientRect();
      let newLeft = style.left as number;
      let newTop = style.top as number;
      const menuWidth = rect.width;
      const menuHeight = rect.height;
      const padding = 8;
      // Clamp right
      if (rect.left + menuWidth > window.innerWidth - padding) {
        newLeft = window.innerWidth - menuWidth - padding;
        style.transform = undefined;
      }
      // Clamp left
      if (rect.left < padding) {
        newLeft = padding;
        style.transform = undefined;
      }
      // Clamp bottom
      if (rect.top + menuHeight > window.innerHeight - padding) {
        newTop = window.innerHeight - menuHeight - padding;
        style.transform = undefined;
      }
      // Clamp top
      if (rect.top < padding) {
        newTop = padding;
        style.transform = undefined;
      }
      style.left = newLeft;
      style.top = newTop;
    },
    [style]
  );
  // Use effect to clamp after render
  useEffect(() => {
    if (menuRef.current) {
      clampMenuPosition(menuRef.current);
    }
  }, [anchor, visible, clampMenuPosition]);

  if (!anchor) return null;

  switch (displayArea) {
    case "bottom":
      style.top = anchor.y + anchor.height;
      style.left = anchor.x + anchor.width / 2;
      style.transform = `translateX(-50%)`;
      break;
    case "top":
      style.top = anchor.y - 1; // -1 for border
      style.left = anchor.x + anchor.width / 2;
      style.transform = `translate(-50%, -100%)`;
      break;
    case "left":
      style.top = anchor.y;
      style.left = anchor.x;
      style.transform = `translateX(-100%)`;
      break;
    case "right":
      style.top = anchor.y;
      style.left = anchor.x + anchor.width;
      break;
    default:
      style.top = anchor.y + anchor.height;
      style.left = anchor.x;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <div
        className="flex-1 dark:bg-black/60"
        style={{
          backgroundColor: "rgba(0,0,0,0)",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 998,
        }}
        onClick={close}
      >
        {/* Menu Content */}
        <div
          ref={menuRef}
          className="py-2 px-1 rounded border dark:border-gray-700 border-gray-200"
          style={{
            ...style,
            backgroundColor: Colors.background.primary[colorScheme],
          }}
          onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
        >
          {actions && actions.length > 0 ? (
            <div className="flex flex-col gap-2">
              {actions.map((action, idx) => (
                <Button
                  key={idx}
                  onPress={() => {
                    action.onPress(action);
                    close();
                  }}
                  size="small"
                  disabled={action.disabled}
                  className="justify-between items-end "
                  variant="ghost"
                >
                  <div className="flex flex-1 flex-row items-center">
                    <Text size="sm" className="flex-1">
                      {action.label}
                    </Text>
                    {action.web?.icon && (
                      <div className="flex-0">{action.web.icon}</div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <Text className="text-gray-400">No actions</Text>
          )}
        </div>
      </div>
    </Modal>
  );
};

// Context for menu open function
const MenuContext = createContext<{ open: () => void } | undefined>(undefined);

interface MenuProps extends PropsWithChildren<unknown> {
  displayArea?: DisplayArea;
  actions?: DropDownMenuAction[];
}
const DropDownMenu = forwardRef<MenuRef, MenuProps>((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [anchor, setAnchor] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const open = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setAnchor({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });
    }
    setVisible(true);
  }, []);

  useImperativeHandle(ref, () => ({
    open,
    close: () => setVisible(false),
  }));

  return (
    <MenuContext.Provider value={{ open }}>
      <>
        <MenuView
          close={() => setVisible(false)}
          visible={visible}
          anchor={anchor}
          displayArea={props.displayArea}
          actions={props.actions}
        />
        <div ref={triggerRef}>{props.children}</div>
      </>
    </MenuContext.Provider>
  );
});

DropDownMenu.displayName = "DropDownMenu";

const Trigger = forwardRef<RNView, PropsWithChildren<ButtonProps>>(
  (props, ref) => {
    const menu = useContext(MenuContext);
    const handlePress = () => {
      menu?.open();
    };
    return <Button ref={ref} {...props} onPress={handlePress} />;
  }
);
Trigger.displayName = "DropDownMenu.Trigger";

export { DropDownMenu, Trigger };
