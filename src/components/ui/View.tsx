import React from "react";
import { View as BaseView, ViewProps as BaseViewProps } from "react-native";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const viewVariants = cva("bg-background", {
  variants: {
    darkColor: {
      none: "bg-transparent",
      primary: "dark:bg-[#111827]",
      secondary: "dark:bg-[#1f2937]",
    },
  },
  defaultVariants: {
    darkColor: "primary",
  },
});
export interface ViewProps
  extends BaseViewProps,
    VariantProps<typeof viewVariants> {}

const View = React.forwardRef<
  React.ComponentRef<typeof BaseView>,
  React.PropsWithChildren<ViewProps>
>(({ className, darkColor, ...props }, ref) => (
  <BaseView
    ref={ref}
    {...props}
    className={cn(viewVariants({ darkColor }), className)}
  />
));

View.displayName = "View";

export { View };
