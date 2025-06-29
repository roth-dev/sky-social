import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Header } from '@/components/Header';
import { Input } from '@/components/ui/Input';
import { Search as SearchIcon } from 'lucide-react-native';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={styles.container}>
      <Header title="Search" />
      <ScrollView style={styles.content}>
        <Input
          placeholder="Search people, posts, and topics"
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchContainer}
        />
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Topics</Text>
          {/* Add trending topics here */}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggested People</Text>
          {/* Add suggested people here */}
        </View>
      </ScrollView>
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
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
});