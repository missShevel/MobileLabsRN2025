import React from "react";
import styled from "styled-components/native";

const ChatItem = ({ chat }: { chat: any }) => {
  return (
    <ItemContainer>
      <Avatar source={chat.avatar} />
      <Info>
        <Row>
          <Name>{chat.name}</Name>
          <Time>{chat.date}</Time>
        </Row>
        <LastMessage numberOfLines={1}>{chat.message}</LastMessage>
      </Info>
      {chat.unread ? <UnreadDot /> : chat.online && <OnlineDot />}
    </ItemContainer>
  );
};

export default ChatItem;

const ItemContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
`;

const Avatar = styled.Image`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  margin-right: 12px;
`;

const Info = styled.View`
  flex: 1;
`;

const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const Name = styled.Text`
  font-weight: bold;
  color: #fff;
  font-size: 16px;
`;

const Time = styled.Text`
  font-size: 12px;
  color: #9fa8ba;
`;

const LastMessage = styled.Text`
  color: #9fa8ba;
  margin-top: 4px;
  font-size: 14px;
`;

const UnreadDot = styled.View`
  position: absolute;
  bottom: 1px;
  left: 10%;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: #2f80ed;
`;

const OnlineDot = styled.View`
  position: absolute;
  bottom: 1px;
  left: 10%;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: #27ae60;
`;
