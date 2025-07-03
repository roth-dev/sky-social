import React from "react";
import { cn } from "@/lib/utils";
import { Text as BaseText } from "react-native";
import { cva, VariantProps } from "class-variance-authority";

// custom font family
// Inter_400Regular,
// Inter_900Black,
// Inter_500Medium,
// Inter_700Bold,
// Inter_600SemiBold,
// Inter_100Thin,
// Inter_800ExtraBold,

const FONTS = {
  thin: "Inter_100Thin",
  normal: "Inter_400Regular",
  bold: "Inter_700Bold",
  semiBold: "Inter_600SemiBold",
  extrabold: "Inter_800ExtraBold",
};

const textVariants = cva("dark:text-white text-black bg-transparent", {
  variants: {
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "4xl": "text-4xl",
      "5xl": "text-5xl",
    },
  },
  defaultVariants: {
    size: "base",
  },
});

export interface TextProps
  extends React.ComponentPropsWithoutRef<typeof BaseText>,
    VariantProps<typeof textVariants> {
  font?: keyof typeof FONTS;
}

const Text = React.forwardRef<React.ComponentRef<typeof BaseText>, TextProps>(
  ({ className, size, font = "normal", ...props }, ref) => {
    return (
      <BaseText
        ref={ref}
        className={cn(textVariants({ size }), className, "leading-snug")}
        {...props}
        style={[
          {
            fontFamily: FONTS[font],
          },
          props.style,
        ]}
      />
    );
  }
);

Text.displayName = "Text";

export { Text };
