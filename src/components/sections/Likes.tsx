import { useActorLikes } from "@/hooks/query/useActorLikes";
import { useMemo } from "react";
import { ProfileTabContent } from "../profile/ProfileTabContent";

interface Props {
  handle: string;
}
export default function UserLikeSection({ handle }: Props) {
  const likedQuery = useActorLikes(handle);
  const data = useMemo(() => {
    if (likedQuery.data) {
      return likedQuery?.data?.pages.flatMap((page) => page?.feed);
    }
    return [];
  }, [likedQuery]);

  return (
    <ProfileTabContent
      tabKey="posts"
      data={data}
      loading={likedQuery.isLoading}
      loadingMore={false}
      onRefresh={() => {}}
      onLoadMore={() => {}}
    />
  );
}
