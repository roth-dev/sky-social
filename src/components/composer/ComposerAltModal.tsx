import React, { FunctionComponent } from "react";
import { Modal, View, TextInput, TouchableOpacity } from "react-native";
import { VStack, HStack, Text } from "@/components/ui";

interface ComposerAltModalProps {
  visible: boolean;
  value: string;
  onChange: (val: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

export const ComposerAltModal: FunctionComponent<ComposerAltModalProps> = ({
  visible,
  value,
  onChange,
  onCancel,
  onSave,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onCancel}
  >
    <View className="flex-1 bg-black/60 justify-center items-center">
      <VStack className="bg-zinc-900 rounded-xl p-6 w-80 max-w-[90%]">
        <Text className="text-white text-base mb-3">Edit Alt Text</Text>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="Describe this image"
          placeholderTextColor="#888"
          className="text-white text-base bg-zinc-800 rounded-lg p-2 mb-4 min-h-[60px]"
          multiline
          maxLength={300}
          autoFocus
        />
        <HStack className="justify-end space-x-2">
          <TouchableOpacity onPress={onCancel} className="py-2 px-4">
            <Text className="text-gray-400 text-base">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSave} className="py-2 px-4">
            <Text className="text-primary text-base font-bold">Save</Text>
          </TouchableOpacity>
        </HStack>
      </VStack>
    </View>
  </Modal>
);
