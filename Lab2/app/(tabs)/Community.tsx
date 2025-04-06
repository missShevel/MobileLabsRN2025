import CategoryTiles from '@/components/CategoryTile';
import { Container } from '@/components/Container';
import { HeaderApp } from '@/components/Header';
import { PostItem } from '@/components/PostItem';
import { posts } from '@/data/posts';
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Header } from 'react-native/Libraries/NewAppScreen';
const categories = ['All', 'Screenshots', 'Artwork', 'Workshop'];

export default function Tab() {
  const [selected, setSelected] = useState('All');

  return (
    <Container>
      <HeaderApp headerTitle='Community' showIcon={false} />

      <CategoryTiles categories={categories} selectedCategory={selected} setSelectedCategory={setSelected} />

       <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostItem post={item} />}
        showsVerticalScrollIndicator={false}
      /> 
    </Container>
  );
}


