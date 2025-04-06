import { Ionicons } from "@expo/vector-icons";
import { Image, View } from "react-native";
import styled from "styled-components/native";
import { useFonts } from "@expo-google-fonts/abeezee/useFonts";
import { ABeeZee_400Regular } from "@expo-google-fonts/abeezee/400Regular";

export const HeaderApp = ({
  headerTitle,
  showIcon,
  props,
}: {
  headerTitle: string;
  showIcon: boolean;
  props?: any;
}) => {
  let [fontsLoaded] = useFonts({
    ABeeZee_400Regular,
  });
  return (
    <Header>
      <View style={{display: 'flex', flexDirection:'row'
      }}>
        <Image
          style={{ maxHeight: 36, maxWidth: 36 }}
          source={require("@/assets/images/steam-logo.png")}
        />
        <LogoText style={{ fontFamily: "ABeeZee_400Regular " }}>
          {headerTitle}
        </LogoText>
      </View>
      {showIcon && <Ionicons name="search" size={24} color="white" />}
    </Header>
  );
};

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  max-height: 39px;
`;

const LogoText = styled.Text`
  color: white;
  font-size: 28px;
  font-weight: 400;
`;
