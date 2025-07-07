import { useAuthorMediaFeed } from "@/lib/queries";
import { ProfileTabContent } from "../profile/ProfileTabContent";
import { useMemo } from "react";
import { ATFeedItem } from "@/types/atproto";

interface Props {
  handle: string;
}
export default function UserMediaSection({ handle }: Props) {
  const mediaQuery = useAuthorMediaFeed(handle);

  const data = useMemo(() => {
    if (mediaQuery.data) {
      return mediaQuery?.data;
    }
    return [];
  }, [mediaQuery]);

  return (
    <ProfileTabContent
      tabKey="media"
      data={data as unknown as ATFeedItem[]}
      loading={mediaQuery.isLoading}
      loadingMore={false}
      onRefresh={() => {}}
      onLoadMore={() => {}}
    />
  );
}
