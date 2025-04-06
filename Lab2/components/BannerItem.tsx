import { colors } from "@/constants/Colors";
import React from "react";
import styled from "styled-components/native";

interface BannerProps {
  title: string;
  description: string;
  price: string;
  oldPrice: string;
  discount: string;
  image: string;
}

const BannerItem = ({
  title,
  description,
  price,
  oldPrice,
  discount,
  image,
}: BannerProps) => {
  return (
    <Container source={image}>
      <Overlay>
        <Title>{title}</Title>
        <Description>{description}</Description>
        <PriceWrapper>
          <Discount>{discount}</Discount>
          <OldPrice>{oldPrice}</OldPrice>
          <NewPrice>{price}</NewPrice>
        </PriceWrapper>
      </Overlay>
    </Container>
  );
};

export default BannerItem;

const Container = styled.ImageBackground`
  width: 350px;
  height: 230px;
  margin-right: 16px;
  border-radius: 12px;
  overflow: hidden;
`;

const Overlay = styled.View`
  flex: 1;
  justify-content: flex-end;
  padding: 12px;
  background: rgba(0, 0, 0, 0.4);
`;

const Title = styled.Text`
  color: white;
  font-weight: 700;
  font-size: 20px;
`;

const Description = styled.Text`
  color: white;
  font-size: 13px;
  color: ${colors.textSecondary};
  letter-spacing: -0.14px
`;

const PriceWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 4px;
  border-radius: 4px;
  padding: 2px 3px;
  background: #000000a4;
  width: 110px;
`;

const Discount = styled.Text`
  color: ${colors.textPrimary};
  font-weight: 400;
  margin-right: 8px;
  background: ${colors.discount};
  padding: 2px 3px;
  border-radius: 4px 0 0 4px;
`;

const OldPrice = styled.Text`
  color: #aaa;
  text-decoration: line-through;
  margin-right: 8px;
`;

const NewPrice = styled.Text`
  color: white;
  font-weight: 400;
`;
