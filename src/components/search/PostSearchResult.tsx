import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Post } from '@/components/Post';
import { ATPost } from '@/types/atproto';

interface PostSearchResultProps {
  post: ATPost;
  onLike?: (uri: string, cid: string) => void;
  onRepost?: (uri: string, cid: string) => void;
  onComment?: (uri: string) => void;
}

export function PostSearchResult({ 
  post, 
  onLike, 
  onRepost, 
  onComment 
}: PostSearchResultProps) {
  return (
    <View style={styles.container}>
      <Post
        post={post}
        onLike={onLike}
        onRepost={onRepost}
        onComment={onComment}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
  },
});