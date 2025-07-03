import React from "react";
import { TextInput, TextInputProps } from "react-native";
import { Text } from "./Text";
import { cn } from "@/lib/utils";
import { View } from "./View";
import { VStack } from "./Stack";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  style,
  className,
  containerClassName,
  ...props
}: InputProps) {
  return (
    <VStack className={cn("gap-2", containerClassName)}>
      {label && (
        <Text font="semiBold" size="sm">
          {label}
        </Text>
      )}
      <TextInput
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
      {error && (
        <Text size="sm" className="text-red-500">
          {error}
        </Text>
      )}
    </VStack>
  );
}
