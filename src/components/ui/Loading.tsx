import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { memo } from "react";
import { ActivityIndicator } from "react-native";
const loadingVariants = cva(
  "flex-1 py-2", // base
  {
    variants: {
      size: {
        xs: "w-3 h-3",
        md: "w-5 h-5",
        lg: "w-7 h-7",
        "2xl": "w-10 h-10",
        "3xl": "w-14 h-14",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const Loading = memo(function Comp({
  size,
}: VariantProps<typeof loadingVariants>) {
  return <ActivityIndicator className={cn(loadingVariants({ size }))} />;
});

export default Loading;
