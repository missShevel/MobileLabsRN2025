import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, TouchableOpacity } from "react-native";
import styled from "styled-components/native";

const MenuItemContainer = styled(TouchableOpacity)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 18px; 
  background-color: #202532;
`;

const MenuItemText = styled.Text`
  color: #ffffff; /* White color */
  font-size: 16px;
`;

const Separator = styled.View`
  height: 1px;
  background-color: #1C202C; /* Separator color */
  width: 100%;
`;

type MenuItem = {
  id: string;
  title: string;
};
type Props = {
  menuItems: MenuItem[];
};

const MenuList = ({ menuItems }: Props) => {
  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <MenuItemContainer onPress={() => console.log("Pressed:", item.title)}>
      <MenuItemText>{item.title}</MenuItemText>
      <Ionicons name="chevron-forward" size={20} color="#5a6a7a" />
    </MenuItemContainer>
  );
  return (
    <FlatList
      data={menuItems}
      renderItem={renderMenuItem}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={() => <Separator />}
      scrollEnabled={false}
      style={{borderRadius: 8}}
    />
  );
};

export default MenuList;