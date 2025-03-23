import { BottomLabel } from "@/components/BottomLabel";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";

const images = [
  { id: "1", source: require("@/assets/images/icon.png") },
  { id: "2", source: require("@/assets/images/icon.png") },
  { id: "3", source: require("@/assets/images/icon.png") },
  { id: "4", source: require("@/assets/images/icon.png") },
  { id: "5", source: require("@/assets/images/icon.png") },
  { id: "6", source: require("@/assets/images/icon.png") },
  { id: "7", source: require("@/assets/images/icon.png") },
  { id: "8", source: require("@/assets/images/icon.png") },
  { id: "9", source: require("@/assets/images/icon.png") },
  { id: "10", source: require("@/assets/images/icon.png") },
  { id: "11", source: require("@/assets/images/icon.png") },
  { id: "12", source: require("@/assets/images/icon.png") },
];

export default function Tab() {
  return (
    <>
      <FlatList
        data={images}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.imageContainer}>
            <Image source={item.source} style={styles.image} />
          </View>
        )}
      />
      <BottomLabel />
    </>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    padding: 5,
    backgroundColor: "white",
  },
  image: {
    width: "100%", // Take full width of container
    height: 150, // Adjust height as needed
    borderRadius: 10, // Optional: rounded corners
    boxShadow: "rgb(199 199 199)",
  },
});
