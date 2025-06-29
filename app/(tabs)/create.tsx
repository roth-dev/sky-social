import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useCreatePost } from '@/lib/queries';
import { X, Image as ImageIcon } from 'lucide-react-native';
import { router } from 'expo-router';

export default function CreateScreen() {
  const { isAuthenticated, user } = useAuth();
  const [text, setText] = useState('');
  const createPostMutation = useCreatePost();

  const handlePost = async () => {
    if (!text.trim()) return;

    try {
      await createPostMutation.mutateAsync({ text });
      setText('');
      router.push('/(tabs)/');
      Alert.alert('Success', 'Post created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create post');
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Header title="Create Post" />
        <View style={styles.notAuthenticatedContainer}>
          <Text style={styles.notAuthenticatedText}>
            Please log in to create posts
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="New Post"
        leftIcon={<X size={24} color="#111827" />}
        onLeftPress={() => router.back()}
      />
      
      <View style={styles.content}>
        <TextInput
          style={styles.textInput}
          placeholder="What's happening?"
          placeholderTextColor="#9ca3af"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={300}
          autoFocus
        />
        
        <View style={styles.actions}>
          <TouchableOpacity style={styles.imageButton}>
            <ImageIcon size={24} color="#3b82f6" />
          </TouchableOpacity>
          
          <View style={styles.postSection}>
            <Text style={styles.characterCount}>
              {text.length}/300
            </Text>
            <Button
              title={createPostMutation.isPending ? "Posting..." : "Post"}
              onPress={handlePost}
              disabled={!text.trim() || createPostMutation.isPending}
              size="medium"
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    color: '#111827',
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  imageButton: {
    padding: 8,
  },
  postSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  characterCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  notAuthenticatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notAuthenticatedText: {
    fontSize: 16,
    color: '#6b7280',
  },
});