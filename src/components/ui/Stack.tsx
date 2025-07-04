import React from "react";
import { View } from "@/components/ui/View";
import { cn } from "@/lib/utils";

const VStack = React.forwardRef<
  React.ComponentRef<typeof View>,
  React.ComponentPropsWithoutRef<typeof View>
>(({ className, ...props }, ref) => (
  <View ref={ref} {...props} className={cn("flex flex-col gap-1", className)} />
));

VStack.displayName = "VStack";

const HStack = React.forwardRef<
  React.ComponentRef<typeof View>,
  React.ComponentPropsWithoutRef<typeof View>
>(({ className, ...props }, ref) => (
  <View
    ref={ref}
    {...props}
    className={cn("flex flex-row gap-2 items-center", className)}
  />
));

HStack.displayName = "HStack";

const ZStack = React.forwardRef<
  React.ComponentRef<typeof View>,
  React.ComponentPropsWithoutRef<typeof View>
>(({ className, ...props }, ref) => (
  <View
    ref={ref}
    {...props}
    darkColor="none"
    className={cn("absolute z-50 bg-transparent", className)}
  />
));

ZStack.displayName = "ZStack";

export { VStack, HStack, ZStack };
