import { colors } from "@/constants/Colors";
import React from "react";
import { View } from "react-native";
import styled from "styled-components/native";

interface GameProps {
  title: string;
  platform: string;
  price: string;
  oldPrice?: string;
  discount?: string;
  image: string;
}

const GameItem = ({
  title,
  platform,
  price,
  oldPrice,
  discount,
  image,
}: GameProps) => (
  <GameContainer>
    <GameImage source={image} />
    <GameInfo>
      <GameTitle>{title}</GameTitle>
      <GamePlatform>{platform}</GamePlatform>
    </GameInfo>
    <PriceRow>
      <View style={{ flexDirection: "row" }}>
        {oldPrice && <GameOldPrice>{oldPrice}</GameOldPrice>}
        <GamePrice>{price}</GamePrice>
      </View>
      {discount && <GameDiscount>{discount}</GameDiscount>}
    </PriceRow>
  </GameContainer>
);

export default GameItem;

const GameContainer = styled.View`
  flex-direction: row;
  margin-bottom: 16px;
`;

const GameImage = styled.Image`
  width: 72px;
  height: 50px;
  border-radius: 8px;
  margin-right: 12px;
`;

const GameInfo = styled.View`
  flex: 1;
  justify-content: center;
`;

const GameTitle = styled.Text`
  font-size: 16px;
  color: white;
`;

const GamePlatform = styled.Text`
  color: #bbb;
  font-size: 12px;
`;

const PriceRow = styled.View`
  align-items: center;
  margin-top: 4px;
`;

const GameDiscount = styled.Text`
  color: ${colors.textPrimary};
  font-weight: 300;
  margin-right: 6px;
  padding: 2px 3px;
  background: ${colors.discount};
  border-radius: 4px;
`;

const GameOldPrice = styled.Text`
  color: #aaa;
  text-decoration: line-through;
  font-size: 12px;
  justify-self: bottom;
`;

const GamePrice = styled.Text`
  color: white;
  font-size: 18px;
`;
