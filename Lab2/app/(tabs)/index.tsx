import BannerCarousel from '@/components/BannerCarousel';
import CategoryTile from '@/components/CategoryTile';
import GameItem from '@/components/GameItem';
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { HeaderApp } from '@/components/Header';
import { games } from '@/data/games';


const categories = ['Top Sellers', 'Free to play', 'Early Access'];


export default function Tab() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  const filteredGames = games.filter(
    (game) => game.category === selectedCategory
  );

  return (
    <Container>
      <View style={{padding: 16}}>
      <HeaderApp headerTitle='Store' showIcon/>
      <BannerCarousel />

      <CategoryScroll horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((cat) => (
          <CategoryTile
            key={cat}
            label={cat}
            selected={selectedCategory === cat}
            onPress={() => setSelectedCategory(cat)}
          />
        ))}
      </CategoryScroll>

      <FlatList
        data={filteredGames}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => <GameItem {...item} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      </View>
    </Container>
  );
}

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: #1b1f2a;
`;

const CategoryScroll = styled.ScrollView`
  margin-vertical: 16px;
`;