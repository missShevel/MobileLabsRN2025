import { ReactNode } from "react";
import { View } from "react-native";
import styled from "styled-components/native";

const MainContainer = styled.SafeAreaView`
  flex: 1;
  background-color: #1b1f2a;
`;

export const Container = ({ children }: { children: ReactNode }) => {
  return (
    <MainContainer>
      <View style={{ padding: 16 }}>{children}</View>
    </MainContainer>
  );
};
