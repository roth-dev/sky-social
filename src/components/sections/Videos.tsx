import { useAuthorMediaFeed } from "@/hooks/query";
import { ProfileTabContent } from "../profile/ProfileTabContent";
import { useMemo } from "react";

interface Props {
  handle: string;
}
export default function UserVideoSection({ handle }: Props) {
  const mediaQuery = useAuthorMediaFeed(handle);

  const data = useMemo(() => {
    if (mediaQuery.data) {
      return mediaQuery?.data;
    }
    return [];
  }, [mediaQuery.data]);

  return (
    <ProfileTabContent
      tabKey="video"
      data={data}
      loading={mediaQuery.isLoading}
      loadingMore={false}
      onRefresh={() => {}}
      onLoadMore={() => {}}
    />
  );
}
