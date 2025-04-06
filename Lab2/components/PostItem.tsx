import { colors } from "@/constants/Colors";
import { AntDesign, Feather, FontAwesome } from "@expo/vector-icons";
import React from "react";
import styled from "styled-components/native";

export const PostItem = ({ post }: any) => {
  return (
    <Container>
      <Header>
        <Avatar source={post.avatar} resizeMode="contain" />
        <HeaderInfo>
          <UserRow>
            <Username>{post.user}</Username>
            <Badge>{post.badge}</Badge>
          </UserRow>
          <Time>{post.time}</Time>
        </HeaderInfo>
        <Options>⋯</Options>
      </Header>

      <PostImage source={post.image} resizeMode="cover" />
      <Title>{post.title}</Title>
      <Description>{post.description}</Description>

      <Footer>
        <IconRow>
          {/* <Icon>👍</Icon> */}
          <AntDesign name="like2" size={24} color={colors.discount} />
          <Count style={{ color: colors.discount }}>{post.likes}</Count>
        </IconRow>
        <IconRow>
          <Feather name="message-square" size={24} color={colors.textSecondary} />
          <Count style={{ color: colors.textSecondary }}>{post.comments}</Count>
        </IconRow>
        <IconRow>
        <FontAwesome name="share" size={24} color={colors.textSecondary} />        </IconRow>
      </Footer>
    </Container>
  );
};

const Container = styled.View`
  background-color: #1c202c;
  padding: 15px 3px;
  margin-bottom: 10px;
  border-radius: 12px;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
`;

const Avatar = styled.Image`
  width: 36px;
  height: 36px;
  border-radius: 18px;
`;

const HeaderInfo = styled.View`
  flex: 1;
  margin-left: 10px;
`;

const UserRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Username = styled.Text`
  color: white;
  font-weight: bold;
  font-size: 14px;
`;

const Badge = styled.Text`
  font-size: 10px;
  background-color: #d946ef;
  color: white;
  padding: 2px 6px;
  margin-left: 6px;
  border-radius: 4px;
`;

const Time = styled.Text`
  color: #aaa;
  font-size: 12px;
`;

const Options = styled.Text`
  color: #aaa;
  font-size: 20px;
`;

const PostImage = styled.Image`
  width: 100%;
  height: 160px;
  border-radius: 10px;
  margin-vertical: 10px;
`;

const Title = styled.Text`
  color: white;
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const Description = styled.Text`
  color: #ccc;
  font-size: 13px;
`;

const Footer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 10px;
`;

const IconRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Icon = styled.Text`
  font-size: 16px;
  margin-right: 5px;
`;

const Count = styled.Text`
  font-size: 13px;
  margin: 0 2px;
`;
