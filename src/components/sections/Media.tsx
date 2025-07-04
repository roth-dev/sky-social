import { useAuthorMediaFeed } from "@/lib/queries";
import { ProfileTabContent } from "../profile/ProfileTabContent";
import { useMemo } from "react";

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
      data={data}
      loading={mediaQuery.isLoading}
      loadingMore={false}
      onRefresh={() => {}}
      onLoadMore={() => {}}
    />
  );
}
