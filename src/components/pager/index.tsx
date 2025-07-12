import { forwardRef } from "react";
import Pager, { PagerViewProps } from "react-native-pager-view";

type Props = Omit<PagerViewProps, "orientation"> & {
  orientation: "horizontal" | "vertical" | "stack";
};
const PagerView = forwardRef<Pager, Props>((props, ref) => (
  //@ts-expect-error props
  <Pager ref={ref} {...props} />
));

PagerView.displayName = "PagerView";

export default PagerView;
