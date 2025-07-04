import { FunctionComponent } from "react";

export interface Route {
  name: string;
  key: string;
  component: FunctionComponent;
}
export interface TabViewProps {
  refreshing?: boolean;
  onRefresh?: () => void;
  routes: Route[];
  headerHeight?: number;
  onChange?: (tab: Omit<Route, "component">) => void;
  renderHeader?: () => React.ReactElement | null;

  /**
   * web only
   */
  renderTabBar?: (props: {
    activeTab: number;
    setActiveTab: (index: number) => void;
  }) => React.ReactNode;
}
