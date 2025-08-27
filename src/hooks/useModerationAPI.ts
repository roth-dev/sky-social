import { useCallback } from "react";
import { atprotoClient } from "@/lib/atproto";
import { AtpAgent } from "@atproto/api";

export interface ModerationAction {
  type: "block" | "mute" | "muteWords" | "report";
  target: string;
  reason?: string;
  duration?: number;
}

export interface MutedWord {
  value: string;
  targets: ("content" | "tag")[];
  actorTarget?: "all" | "exclude-following";
  expiresAt?: string;
  createdAt: string;
}

export interface ContentLabel {
  uri: string;
  cid: string;
  val: string;
  neg?: boolean;
  src: string;
  cts: string;
}

export interface ModerationPreferences {
  adultContentEnabled: boolean;
  hideReposts: boolean;
  hideReplies: boolean;
  requireFollowToMention: boolean;
  labelsEnabled: boolean;
  mutedWords: MutedWord[];
  enabledLabelingSources: string[];
  contentLanguages: string[];
  birthdayVisibility: "public" | "contacts" | "nobody";
}

export interface BlockedUser {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
  blockedAt: string;
}

export interface MutedUser {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
  mutedAt: string;
  duration?: number;
}

export interface ReportHistory {
  id: string;
  subject: string;
  subjectType: "post" | "account";
  reason: string;
  createdAt: string;
  status: "pending" | "resolved" | "dismissed";
}

interface BlockRecord {
  subject: string;
  createdAt: string;
}

interface FeedViewPref {
  hideReplies?: boolean;
  hideReposts?: boolean;
}

interface AdultContentPref {
  enabled?: boolean;
}

interface PersonalDetailsPref {
  birthDate?: string;
}

export function useModerationAPI() {
  // Get the agent from the atproto client
  const getAgent = (): AtpAgent => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (atprotoClient as any).agent;
  };

  // Muted Words Management
  const getMutedWords = useCallback(async (): Promise<MutedWord[]> => {
    try {
      const agent = getAgent();
      const session = agent.session;
      if (!session?.did) return [];

      const records = await agent.com.atproto.repo.listRecords({
        repo: session.did,
        collection: "app.bsky.actor.mutedWord",
      });

      if (records.success && records.data) {
        return records.data.records
          .map((record) => record.value as unknown as MutedWord)
          .filter((word) => {
            if (word.expiresAt) {
              return new Date(word.expiresAt) > new Date();
            }
            return true;
          })
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch muted words:", error);
      return [];
    }
  }, []);

  // Preferences Management
  const getModerationPreferences =
    useCallback(async (): Promise<ModerationPreferences | null> => {
      try {
        const agent = getAgent();
        const response = await agent.app.bsky.actor.getPreferences();

        if (response.success && response.data) {
          const prefs = response.data.preferences;
          const feedPref = prefs.find(
            (p) => p.$type === "app.bsky.actor.defs#feedViewPref"
          ) as FeedViewPref;
          const adultContentPref = prefs.find(
            (p) => p.$type === "app.bsky.actor.defs#adultContentPref"
          ) as AdultContentPref;
          const personalPref = prefs.find(
            (p) => p.$type === "app.bsky.actor.defs#personalDetailsPref"
          ) as PersonalDetailsPref;
          const mutedWords = await getMutedWords();

          return {
            adultContentEnabled: adultContentPref?.enabled || false,
            hideReposts: feedPref?.hideReposts || false,
            hideReplies: feedPref?.hideReplies || false,
            requireFollowToMention: false,
            labelsEnabled: true,
            mutedWords,
            enabledLabelingSources: ["did:plc:ar7c4by46qjdydhdevvrndac"],
            contentLanguages: ["en"],
            birthdayVisibility: personalPref?.birthDate ? "public" : "nobody",
          };
        }

        return {
          adultContentEnabled: false,
          hideReposts: false,
          hideReplies: false,
          requireFollowToMention: false,
          labelsEnabled: true,
          mutedWords: [],
          enabledLabelingSources: [],
          contentLanguages: ["en"],
          birthdayVisibility: "nobody",
        };
      } catch (error) {
        console.error("Failed to fetch moderation preferences:", error);
        return null;
      }
    }, [getMutedWords]);

  const updateModerationPreferences = useCallback(
    async (preferences: Partial<ModerationPreferences>): Promise<boolean> => {
      try {
        const agent = getAgent();
        const currentPrefs = await getModerationPreferences();
        if (!currentPrefs) return false;

        const updatedPrefs = { ...currentPrefs, ...preferences };

        const response = await agent.app.bsky.actor.putPreferences({
          preferences: [
            {
              $type: "app.bsky.actor.defs#feedViewPref",
              feed: "following",
              hideReplies: updatedPrefs.hideReplies,
              hideRepliesByUnfollowed: updatedPrefs.hideReplies,
              hideRepliesByLikeCount: 0,
              hideReposts: updatedPrefs.hideReposts,
              hideQuotePosts: false,
            },
            {
              $type: "app.bsky.actor.defs#adultContentPref",
              enabled: updatedPrefs.adultContentEnabled,
            },
          ],
        });

        return response.success;
      } catch (error) {
        console.error("Failed to update moderation preferences:", error);
        return false;
      }
    },
    [getModerationPreferences]
  );

  // Block Management
  const blockUser = useCallback(async (did: string): Promise<boolean> => {
    try {
      const agent = getAgent();
      const session = agent.session;
      if (!session?.did) return false;

      const response = await agent.app.bsky.graph.block.create(
        { repo: session.did },
        {
          subject: did,
          createdAt: new Date().toISOString(),
        }
      );
      return !!response;
    } catch (error) {
      console.error("Failed to block user:", error);
      return false;
    }
  }, []);

  const unblockUser = useCallback(async (did: string): Promise<boolean> => {
    try {
      const agent = getAgent();
      const session = agent.session;
      if (!session?.did) return false;

      const blockRecords = await agent.com.atproto.repo.listRecords({
        repo: session.did,
        collection: "app.bsky.graph.block",
      });

      if (blockRecords.success && blockRecords.data) {
        const blockRecord = blockRecords.data.records.find(
          (record) => (record.value as unknown as BlockRecord).subject === did
        );

        if (blockRecord) {
          await agent.com.atproto.repo.deleteRecord({
            repo: session.did,
            collection: "app.bsky.graph.block",
            rkey: blockRecord.uri.split("/").pop()!,
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Failed to unblock user:", error);
      return false;
    }
  }, []);

  const getBlockedUsers = useCallback(async (): Promise<BlockedUser[]> => {
    try {
      const agent = getAgent();
      const response = await agent.app.bsky.graph.getBlocks({ limit: 100 });

      if (response.success && response.data) {
        return response.data.blocks.map((block) => ({
          did: block.did,
          handle: block.handle,
          displayName: block.displayName,
          avatar: block.avatar,
          blockedAt: new Date().toISOString(),
        }));
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch blocked users:", error);
      return [];
    }
  }, []);

  // Mute Management
  const muteUser = useCallback(async (did: string): Promise<boolean> => {
    try {
      const agent = getAgent();
      const response = await agent.app.bsky.graph.muteActor({ actor: did });
      return response.success;
    } catch (error) {
      console.error("Failed to mute user:", error);
      return false;
    }
  }, []);

  const unmuteUser = useCallback(async (did: string): Promise<boolean> => {
    try {
      const agent = getAgent();
      const response = await agent.app.bsky.graph.unmuteActor({ actor: did });
      return response.success;
    } catch (error) {
      console.error("Failed to unmute user:", error);
      return false;
    }
  }, []);

  const getMutedUsers = useCallback(async (): Promise<MutedUser[]> => {
    try {
      const agent = getAgent();
      const response = await agent.app.bsky.graph.getMutes({ limit: 100 });

      if (response.success && response.data) {
        return response.data.mutes.map((mute) => ({
          did: mute.did,
          handle: mute.handle,
          displayName: mute.displayName,
          avatar: mute.avatar,
          mutedAt: new Date().toISOString(),
        }));
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch muted users:", error);
      return [];
    }
  }, []);

  // Word Filtering
  const addMutedWord = useCallback(
    async (
      word: string,
      targets: ("content" | "tag")[] = ["content"],
      expiresAt?: string
    ): Promise<boolean> => {
      try {
        const agent = getAgent();
        const session = agent.session;
        if (!session?.did) return false;

        const mutedWord: MutedWord = {
          value: word.trim().toLowerCase(),
          targets,
          actorTarget: "all",
          expiresAt,
          createdAt: new Date().toISOString(),
        };

        await agent.com.atproto.repo.createRecord({
          repo: session.did,
          collection: "app.bsky.actor.mutedWord",
          record: {
            value: mutedWord.value,
            targets: mutedWord.targets,
            actorTarget: mutedWord.actorTarget,
            expiresAt: mutedWord.expiresAt,
            createdAt: mutedWord.createdAt,
          } as Record<string, unknown>,
        });

        return true;
      } catch (error) {
        console.error("Failed to add muted word:", error);
        return false;
      }
    },
    []
  );

  const removeMutedWord = useCallback(
    async (word: string): Promise<boolean> => {
      try {
        const agent = getAgent();
        const session = agent.session;
        if (!session?.did) return false;

        const records = await agent.com.atproto.repo.listRecords({
          repo: session.did,
          collection: "app.bsky.actor.mutedWord",
        });

        if (records.success && records.data) {
          const targetRecord = records.data.records.find(
            (record) =>
              (record.value as unknown as MutedWord).value ===
              word.trim().toLowerCase()
          );

          if (targetRecord) {
            await agent.com.atproto.repo.deleteRecord({
              repo: session.did,
              collection: "app.bsky.actor.mutedWord",
              rkey: targetRecord.uri.split("/").pop()!,
            });
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error("Failed to remove muted word:", error);
        return false;
      }
    },
    []
  );

  // Content Reporting
  const reportContent = useCallback(
    async (
      uri: string,
      cid: string,
      reason: string,
      reasonType: string
    ): Promise<boolean> => {
      try {
        const agent = getAgent();
        const response = await agent.com.atproto.moderation.createReport({
          reasonType,
          reason,
          subject: {
            $type: "com.atproto.repo.strongRef",
            uri,
            cid,
          },
        });
        return response.success;
      } catch (error) {
        console.error("Failed to report content:", error);
        return false;
      }
    },
    []
  );

  const reportAccount = useCallback(
    async (
      did: string,
      reason: string,
      reasonType: string
    ): Promise<boolean> => {
      try {
        const agent = getAgent();
        const response = await agent.com.atproto.moderation.createReport({
          reasonType,
          reason,
          subject: {
            $type: "com.atproto.admin.defs#repoRef",
            did,
          },
        });
        return response.success;
      } catch (error) {
        console.error("Failed to report account:", error);
        return false;
      }
    },
    []
  );

  // Content Labels
  const getContentLabels = useCallback(
    async (uris: string[]): Promise<ContentLabel[]> => {
      try {
        const agent = getAgent();
        const response = await agent.com.atproto.label.queryLabels({
          uriPatterns: uris,
        });

        if (response.success && response.data) {
          return response.data.labels.map((label) => ({
            uri: label.uri,
            cid: label.cid || "",
            val: label.val,
            neg: label.neg,
            src: label.src,
            cts: label.cts,
          }));
        }
        return [];
      } catch (error) {
        console.error("Failed to fetch content labels:", error);
        return [];
      }
    },
    []
  );

  // Advanced moderation features
  const hidePost = useCallback(async (uri: string): Promise<boolean> => {
    try {
      const agent = getAgent();
      const session = agent.session;
      if (!session?.did) return false;

      await agent.com.atproto.repo.createRecord({
        repo: session.did,
        collection: "app.bsky.actor.hiddenPost",
        record: {
          subject: uri,
          createdAt: new Date().toISOString(),
        } as Record<string, unknown>,
      });

      return true;
    } catch (error) {
      console.error("Failed to hide post:", error);
      return false;
    }
  }, []);

  const unhidePost = useCallback(async (uri: string): Promise<boolean> => {
    try {
      const agent = getAgent();
      const session = agent.session;
      if (!session?.did) return false;

      const records = await agent.com.atproto.repo.listRecords({
        repo: session.did,
        collection: "app.bsky.actor.hiddenPost",
      });

      if (records.success && records.data) {
        const hiddenRecord = records.data.records.find(
          (record) => (record.value as any).subject === uri
        );

        if (hiddenRecord) {
          await agent.com.atproto.repo.deleteRecord({
            repo: session.did,
            collection: "app.bsky.actor.hiddenPost",
            rkey: hiddenRecord.uri.split("/").pop()!,
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Failed to unhide post:", error);
      return false;
    }
  }, []);

  // Content filtering
  const checkContentFilters = useCallback(
    async (content: string, labels: ContentLabel[]): Promise<boolean> => {
      try {
        const preferences = await getModerationPreferences();
        if (!preferences) return false;

        // Check muted words
        const lowercaseContent = content.toLowerCase();
        const hasMutedWord = preferences.mutedWords.some((word) =>
          lowercaseContent.includes(word.value)
        );

        if (hasMutedWord) return true;

        // Check adult content labels
        if (!preferences.adultContentEnabled) {
          const hasAdultLabel = labels.some((label) =>
            ["sexual", "nudity", "graphic-media"].includes(label.val)
          );
          if (hasAdultLabel) return true;
        }

        return false;
      } catch (error) {
        console.error("Failed to check content filters:", error);
        return false;
      }
    },
    [getModerationPreferences]
  );

  return {
    // Block Management
    blockUser,
    unblockUser,
    getBlockedUsers,

    // Mute Management
    muteUser,
    unmuteUser,
    getMutedUsers,

    // Word Filtering
    addMutedWord,
    removeMutedWord,
    getMutedWords,

    // Content Reporting
    reportContent,
    reportAccount,

    // Preferences
    updateModerationPreferences,
    getModerationPreferences,

    // Content Labels
    getContentLabels,

    // Advanced Features
    hidePost,
    unhidePost,
    checkContentFilters,
  };
}
