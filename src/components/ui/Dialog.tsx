import React, { useState, useEffect } from "react";
import { Modal, View, Alert as RNAlert } from "react-native";
import { Text } from "./Text";
import { VStack } from "./Stack";
import { Button } from "./Button";
import { isWeb } from "@/platform";
import { cn } from "@/lib/utils";

interface DialogButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface DialogProps {
  visible: boolean;
  title?: string;
  message?: string;
  buttons?: DialogButton[];
  onDismiss?: () => void;
}

const DialogComponent: React.FC<DialogProps> = ({
  visible,
  title,
  message,
  buttons = [{ text: "OK" }],
  onDismiss,
}) => {
  const handleButtonPress = (button: DialogButton) => {
    button.onPress?.();
    onDismiss?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-5">
        <View className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-80 shadow-lg">
          <VStack className="p-5">
            {title && (
              <Text className="text-lg text-center mb-2 text-black dark:text-white font-bold">
                {title}
              </Text>
            )}
            {message && (
              <Text className="text-sm text-center mb-5 text-gray-600 dark:text-gray-300 leading-5">
                {message}
              </Text>
            )}
            <View className="justify-center gap-2">
              {buttons.length === 2 ? (
                // Two buttons: horizontal layout
                buttons.map((button, index) => (
                  <Button
                    key={index}
                    title={button.text}
                    variant={
                      button.style === "destructive"
                        ? "destructive"
                        : button.style === "cancel"
                        ? "outline"
                        : "primary"
                    }
                    size="medium"
                    className={cn(
                      "flex-1 min-h-11",
                      button.style === "destructive" &&
                        "bg-red-500 dark:bg-red-600",
                      button.style === "cancel" &&
                        "bg-gray-100 dark:bg-gray-700"
                    )}
                    onPress={() => handleButtonPress(button)}
                  />
                ))
              ) : (
                // One or three+ buttons: vertical layout
                <View className="w-full">
                  {buttons.map((button, index) => (
                    <Button
                      key={index}
                      title={button.text}
                      variant={
                        button.style === "destructive"
                          ? "destructive"
                          : button.style === "cancel"
                          ? "outline"
                          : "primary"
                      }
                      size="medium"
                      className={cn(
                        "w-full min-h-11",
                        button.style === "destructive" &&
                          "bg-red-500 dark:bg-red-600",
                        button.style === "cancel" &&
                          "bg-gray-100 dark:bg-gray-700",
                        index < buttons.length - 1 &&
                          "border-b border-gray-200 dark:border-gray-600"
                      )}
                      onPress={() => handleButtonPress(button)}
                    />
                  ))}
                </View>
              )}
            </View>
          </VStack>
        </View>
      </View>
    </Modal>
  );
};

// Global dialog queue for web
let dialogQueue: Array<{
  title?: string;
  message?: string;
  buttons?: DialogButton[];
}> = [];
let dialogInstance: ((props: Omit<DialogProps, "visible">) => void) | null =
  null;

const DialogProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [dialogState, setDialogState] = useState<Omit<
    DialogProps,
    "visible"
  > | null>(null);

  useEffect(() => {
    dialogInstance = (props) => setDialogState(props);

    // Process any queued dialogs
    if (dialogQueue.length > 0) {
      dialogQueue.forEach((dialog) => dialogInstance?.(dialog));
      dialogQueue = [];
    }
  }, []);

  const handleDismiss = () => setDialogState(null);

  return (
    <>
      {children}
      <DialogComponent
        visible={!!dialogState}
        {...(dialogState || {})}
        onDismiss={handleDismiss}
      />
    </>
  );
};

const Dialog = DialogComponent as typeof DialogComponent & {
  show: (title?: string, message?: string, buttons?: DialogButton[]) => void;
};

Dialog.show = (title?: string, message?: string, buttons?: DialogButton[]) => {
  if (isWeb) {
    // On web, use the custom modal
    if (dialogInstance) {
      dialogInstance({ title, message, buttons });
    } else {
      // Queue the dialog if provider is not ready
      dialogQueue.push({ title, message, buttons });
    }
  } else {
    // On mobile, use native Alert for better UX
    RNAlert.alert(
      title || "",
      message,
      buttons?.map((button) => ({
        text: button.text,
        onPress: button.onPress,
        style:
          button.style === "destructive"
            ? "destructive"
            : button.style === "cancel"
            ? "cancel"
            : "default",
      }))
    );
  }
};

export { Dialog, DialogProvider };
