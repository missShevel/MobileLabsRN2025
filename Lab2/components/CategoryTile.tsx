import React from "react";
import styled from "styled-components/native";

const CategoryScroll = styled.ScrollView`
  margin-vertical: 16px;
`;

const TileButton = styled.TouchableOpacity<{ $selected: boolean }>`
  padding: 8px 16px;
  background-color: ${({ $selected }: { $selected: boolean }) =>
    $selected ? "#31BCFC" : "#2c2f38"};
  border-radius: 8px;
  margin-right: 10px;
  height: 38px;
  width: auto;
`;

const TileText = styled.Text<{ $selected: boolean }>`
  color: ${({ $selected }: { $selected: boolean }) =>
    $selected ? "#fff" : "#bbb"};
`;

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
}

const CategoryTile = ({ label, selected, onPress }: Props) => (
  <TileButton onPress={onPress} $selected={selected}>
    <TileText $selected={selected}>{label}</TileText>
  </TileButton>
);

const CategoryTiles = ({
  categories,
  selectedCategory,
  setSelectedCategory,
}: {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}) => {
  return (
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
  );
};

export default CategoryTiles;
