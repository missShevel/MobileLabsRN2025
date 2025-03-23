import { Text, View, Image, TouchableOpacity, ScrollView } from "react-native";
import { NewsCard } from "../../components/NewsCard";
import { BottomLabel } from "@/components/BottomLabel";

export default function Tab() {
  const cardProps = {
    title: "test",
    date: "test",
    text: "test",
  };
  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
        <Text style={{ alignSelf: "center", fontSize: 35 }}>News</Text>
        <NewsCard {...cardProps} />
        <NewsCard {...cardProps} />
        <NewsCard {...cardProps} />
        <NewsCard {...cardProps} />
        <NewsCard {...cardProps} />
        <NewsCard {...cardProps} />
        <NewsCard {...cardProps} />
        <NewsCard {...cardProps} />
        <NewsCard {...cardProps} />
        <NewsCard {...cardProps} />
      </ScrollView>
      <BottomLabel />
    </>
  );
}
