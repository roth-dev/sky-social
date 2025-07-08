import { useAuthorFeed } from "@/hooks/query";
import { ProfileTabContent } from "../profile/ProfileTabContent";
import { useMemo } from "react";

interface Props {
  handle: string;
  paddingBottom?: number;
}
export default function UserPostSection({ handle, paddingBottom = 0 }: Props) {
  const postsQuery = useAuthorFeed(handle);

  const data = useMemo(() => {
    if (postsQuery.data) {
      return postsQuery?.data?.pages.flatMap((page) => page?.feed);
    }
    return [];
  }, [postsQuery]);

  return (
    <ProfileTabContent
      tabKey="posts"
      data={data}
      paddingBottom={paddingBottom}
      loading={postsQuery.isLoading}
      loadingMore={false}
      onRefresh={() => {}}
      onLoadMore={() => {}}
    />
  );
}
