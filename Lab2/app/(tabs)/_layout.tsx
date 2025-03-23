import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { Image } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "#4B5664",
        tabBarIconStyle: { fontSize: 13 },
        tabBarStyle: { backgroundColor: "#12141C", height: 90, paddingTop: 10 },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Store",
          tabBarIcon: ({ size, focused, color }) => {
            return (
              <Image
                style={{
                  width: size,
                  height: size,
                  tintColor: color,
                  resizeMode: "contain",
                }}
                source={require("@/assets/images/menu-icons/store.png")}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="Community"
        options={{
          title: "Community",
          tabBarIcon: ({ size, focused, color }) => {
            return (
              <Image
                style={{
                  width: size,
                  height: size,
                  tintColor: color,
                  resizeMode: "contain",
                }}
                source={require("@/assets/images/menu-icons/community.png")}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="Chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ size, focused, color }) => {
            return (
              <Image
                style={{
                  width: size,
                  height: size,
                  tintColor: color,
                  resizeMode: "contain",
                }}
                source={require("@/assets/images/menu-icons/chat.png")}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="Safety"
        options={{
          title: "Safety",
          tabBarIcon: ({ size, focused, color }) => {
            return (
              <Image
                style={{
                  width: size,
                  height: size,
                  tintColor: color,
                  resizeMode: "contain",
                }}
                source={require("@/assets/images/menu-icons/safety.png")}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ size, focused, color }) => {
            return (
              <Image
                style={{
                  width: size,
                  height: size,
                  resizeMode: "contain",
                }}
                source={require("@/assets/images/menu-icons/profile.png")}
              />
            );
          },
        }}
      />
    </Tabs>
  );
}
