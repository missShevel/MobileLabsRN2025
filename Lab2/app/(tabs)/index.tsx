import BannerCarousel from "@/components/BannerCarousel";
import CategoryTile from "@/components/CategoryTile";
import GameItem from "@/components/GameItem";
import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { HeaderApp } from "@/components/Header";
import { games } from "@/data/games";
import { Container } from "@/components/Container";
import CategoryTiles from "@/components/CategoryTile";

const categories = ["Top Sellers", "Free to play", "Early Access"];

export default function Tab() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  const filteredGames = games.filter(
    (game) => game.category === selectedCategory
  );

  return (
    <Container>
      
        <HeaderApp headerTitle="Store" showIcon />
        <BannerCarousel />

        <CategoryTiles
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        <FlatList
          data={filteredGames}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => <GameItem {...item} />}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
    </Container>
  );
}
