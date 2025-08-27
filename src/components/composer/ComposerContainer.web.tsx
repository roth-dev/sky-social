import { cn } from "@/lib/utils";
import { View } from "../ui";
import { PropsWithChildren } from "react";

export default function ComposerContainer({
  children,
}: PropsWithChildren<unknown>) {
  return (
    <View
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      darkColor="none"
      className="flex-1 items-center mx-3"
    >
      <View
        className={cn(
          "main-content-desktop",
          "w-[550px] h-[400px] bg-white mt-12 border dark:border-gray-700 border-gray-300 rounded-md"
        )}
      >
        {children}
      </View>
    </View>
  );
}
