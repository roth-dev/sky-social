import { forwardRef } from "react";
import Pager, { PagerViewProps } from "react-native-pager-view";

const PagerView = forwardRef<Pager, PagerViewProps>((props, ref) => (
  <Pager ref={ref} {...props} />
));

PagerView.displayName = "PagerView";

export default PagerView;
