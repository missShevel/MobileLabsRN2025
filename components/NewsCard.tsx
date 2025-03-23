import { View, Text, Image } from "react-native";

export const NewsCard = ({
  title,
  date,
  text,
}: {
  title: string;
  date: string;
  text: string;
}) => {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        paddingBlock: 10,
        paddingHorizontal: 20,
      }}
    >
      <Image
        style={{ width: 70, height: 70 }}
        source={require("@/assets/images/icon.png")}
      />
      <View style={{ paddingHorizontal: 8 }}>
        <Text style={{ fontWeight: "bold", fontSize: 25 }}>{title}</Text>
        <Text style={{color: 'rgb(140 140 140)'}}>{date}</Text>
        <Text>{text}</Text>
      </View>
    </View>
  );
};
