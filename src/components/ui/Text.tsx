import React, { memo } from "react";
import { cn } from "@/lib/utils";
import { Text as BaseText } from "react-native";
import { cva, VariantProps } from "class-variance-authority";
import { isKhmerText } from "@/utils/textUtils";

const FONTS = {
  thin: "KantumruyPro_100Thin",
  normal: "KantumruyPro_400Regular",
  bold: "KantumruyPro_700Bold",
  semiBold: "KantumruyPro_500Medium",
  extrabold: "KantumruyPro_700Bold",
};

// Default Inter fonts for non-Khmer text
const DEFAULT_FONTS = {
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
  autoDetectKhmer?: boolean; // New prop to enable/disable auto-detection
}

let Text = React.forwardRef<React.ComponentRef<typeof BaseText>, TextProps>(
  (
    {
      className,
      size,
      font = "normal",
      autoDetectKhmer = true,
      children,
      ...props
    },
    ref
  ) => {
    // // Determine which font to use based on content and settings
    const getEffectiveFont = (): string => {
      // If autoDetectKhmer is enabled and children contains Khmer text
      if (autoDetectKhmer && children) {
        const textContent =
          typeof children === "string"
            ? children
            : React.Children.toArray(children).join("");

        if (isKhmerText(textContent)) {
          return FONTS[font];
        } else {
          return DEFAULT_FONTS[font];
        }
      }

      return DEFAULT_FONTS[font];
    };

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
          props.style,
          {
            fontFamily: getEffectiveFont(),
          },
        ]}
      >
        {children}
      </BaseText>
    );
  }
);

Text.displayName = "Text";

Text = memo(Text);

export { Text };
