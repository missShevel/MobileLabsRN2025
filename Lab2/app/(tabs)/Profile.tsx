import UserAvatar from "@/components/Avatar";
import { Container } from "@/components/Container";
import { HeaderApp } from "@/components/Header";
import MenuList from "@/components/MenuList";
import { View, Text, StyleSheet } from "react-native";
import styled from "styled-components/native";

const UserText = styled.Text`
  padding-top: 10px;
  font-size: 16px;
  color: #ffffff;
  text-align: center;
`;
export default function Tab() {
  const menuItems = [
    { id: "1", title: "Settings" },
    { id: "2", title: "Logout" },
  ];
  return (
    <Container>
      <UserAvatar imageSource={require("@/assets/images/avatar2.png")} />
      <UserText>Olha Shevel</UserText>
      <UserText>IPZ-21-1</UserText>
      <MenuList menuItems={menuItems} />
    </Container>
  );
}
