import React, { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Text as BaseText } from "react-native";
import { cva, VariantProps } from "class-variance-authority";
import { isKhmerText, extractTextFromReactChildren } from "@/utils/textUtils";
import { useI18n } from "@/contexts/I18nProvider";

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
    const { locale } = useI18n();

    // Memoize the font selection to avoid expensive calculations on every render
    const effectiveFont = useMemo((): string => {
      // If autoDetectKhmer is disabled, always use default fonts
      if (!autoDetectKhmer || !children) {
        return DEFAULT_FONTS[font];
      }

      // For React elements (including Trans components), check current locale FIRST
      // This avoids expensive text extraction for Trans components
      if (React.isValidElement(children)) {
        // If we're in Khmer locale, use Khmer font
        return locale === "km" ? FONTS[font] : DEFAULT_FONTS[font];
      }

      // For regular text content, check if it contains Khmer characters
      // Only extract and analyze text if children is not a React element
      const textContent = extractTextFromReactChildren(children);
      return isKhmerText(textContent) ? FONTS[font] : DEFAULT_FONTS[font];
    }, [autoDetectKhmer, children, font, locale]); // Dependencies for memoization

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
            fontFamily: effectiveFont,
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
