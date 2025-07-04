import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { memo, useEffect } from "react";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const loadingVariants = cva(
  "rounded-full border-2 border-gray-200 border-t-blue-500", // base
  {
    variants: {
      size: {
        xs: "w-3 h-3 border-[1.5px]",
        md: "w-5 h-5 border-2",
        lg: "w-7 h-7 border-2",
        "2xl": "w-10 h-10 border-[2.5px]",
        "3xl": "w-14 h-14 border-4",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface LoadingProps extends VariantProps<typeof loadingVariants> {}

const Loading = memo(function Comp({ size }: LoadingProps) {
  const rotate = useSharedValue(0);

  useEffect(() => {
    rotate.value = withRepeat(withTiming(1, { duration: 1000 }), -1, false);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${interpolate(rotate.value, [0, 1], [0, 360])}deg`,
        },
      ],
    };
  });

  return (
    <Animated.View
      className={cn(loadingVariants({ size }))}
      style={animatedStyle}
    />
  );
});

export default Loading;
