// IMPORTANT: Import this at the VERY TOP
import "react-native-gesture-handler";

import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <>
      <GestureHandlerRootView>
        <StatusBar style="auto" />
        <Stack>
          <Stack.Screen
            name="index" 
            options={{ title: "Clicker Game" }}
          />
          <Stack.Screen
            name="tasks"
            options={{ title: "Tasks List" }}
          />
        </Stack>
      </GestureHandlerRootView>
    </>
  );
}
