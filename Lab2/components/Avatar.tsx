import styled from "styled-components/native";
import { Image, View } from "react-native";
const Avatar = styled.Image`
  width: 98px;
  height: 98px;
  border-radius: 50%;
  margin: auto;
`;

const OnlineDot = styled.View`
  position: absolute;
  left: 57%;
  top: 76%;
  width: 23px;
  height: 23px;
  border: 2px solid #1C202C;
  border-radius: 50%;
  background-color: #27ae60;
`;

const UserAvatar = ({ imageSource }: { imageSource: () => (string)}) => {
  return (
    <View>
      <Avatar source={imageSource}/>
      <OnlineDot />
    </View>
  );
};

export default UserAvatar;