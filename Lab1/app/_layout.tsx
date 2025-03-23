import { Stack } from "expo-router/stack";
import { Image, Text, View } from "react-native";

function LogoTitle() {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
      <Image
        style={{ width: 50, height: 50 }}
        source={require("@/assets/images/icon.png")}
      />
      <Text style={{ fontWeight: "700" }}>FirstMobileApp</Text>
    </View>
  );
}

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        title: "FirstMobileApp",
        headerTitle: (props) => <LogoTitle {...props} />,
      }}
    >
      <Stack.Screen name="FirstMobileApp" />
    </Stack>
  );
}
