import React from "react";
import { cn } from "@/lib/utils";
import { Text as BaseText } from "react-native";
import { cva, VariantProps } from "class-variance-authority";

// custom font family
// KantumruyPro_700Bold,
// KantumruyPro_100Thin,
// KantumruyPro_500Medium,
// KantumruyPro_600SemiBold,
// KantumruyPro_400Regular,

const FONTS = {
  thin: "KantumruyPro_100Thin",
  normal: "KantumruyPro_400Regular",
  bold: "KantumruyPro_700Bold",
  semiBold: "KantumruyPro_500Medium",
  extrabold: "KantumruyPro_700Bold",
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
        className={cn(
          textVariants({ size }),
          className,
          "leading-snug web:leading-normal"
        )}
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
