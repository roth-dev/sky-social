import { Composer, type CompopserRef } from "@/components/composer/Composer";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useRef,
} from "react";

const ComposerContext = createContext<{
  composeMessage: () => void;
}>({
  composeMessage: () => {},
});

export default function ComposerProvider({
  children,
}: PropsWithChildren<unknown>) {
  const composerRef = useRef<CompopserRef>(null);

  const value = useMemo(() => {
    return {
      composeMessage: () => {
        composerRef.current?.open();
      },
    };
  }, []);

  return (
    <ComposerContext.Provider value={value}>
      <Composer ref={composerRef} onClose={() => {}} onPost={() => {}} />
      {children}
    </ComposerContext.Provider>
  );
}

export function useComposeMessage() {
  const context = useContext(ComposerContext);
  if (context === undefined) {
    throw new Error("useComposeMessage must be used within a ComposerProvider");
  }
  return context;
}
