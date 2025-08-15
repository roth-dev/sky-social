import { ATProfile } from "@/types/atproto";
import { AppBskyActorDefs } from "@atproto/api";

/**
 * Adapts a ProfileViewDetailed type from the Bluesky API to our internal ATProfile type
 */
export function adaptProfileToATProfile(
  profile: AppBskyActorDefs.ProfileViewDetailed
): ATProfile {
  return {
    did: profile.did,
    handle: profile.handle,
    displayName: profile.displayName,
    description: profile.description,
    avatar: profile.avatar,
    banner: profile.banner,
    followersCount: profile.followersCount,
    followsCount: profile.followsCount,
    postsCount: profile.postsCount,
    indexedAt: profile.indexedAt,
    viewer: profile.viewer,
    // Handle the labels type mismatch by ensuring the cid property is always present
    labels: profile.labels?.map((label) => ({
      src: label.src,
      uri: label.uri || "",
      cid: label.cid || "",
      val: label.val,
      cts: label.cts || new Date().toISOString(),
    })),
  };
}
