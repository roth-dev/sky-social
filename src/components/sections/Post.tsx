import { useAuthorFeed } from "@/lib/queries";
import { ProfileTabContent } from "../profile/ProfileTabContent";
import { useMemo } from "react";

interface Props {
  handle: string;
}
export default function UserPostSection({ handle }: Props) {
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
      loading={postsQuery.isLoading}
      loadingMore={false}
      onRefresh={() => {}}
      onLoadMore={() => {}}
    />
  );
}
