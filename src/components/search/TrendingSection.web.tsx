import React from "react";
import { TrendingUp } from "lucide-react-native";
import { HStack, Text, VStack } from "../ui";
import { Colors } from "@/constants/colors";

export function TrendingSection() {
  return (
    <VStack className="flex-1 items-center mt-5">
      <HStack className="gap-2">
        <TrendingUp size={24} color={Colors.primary} />
        <Text>Discover</Text>
      </HStack>
      <Text>Find interesting people and feeds to follow</Text>
    </VStack>
  );
}
