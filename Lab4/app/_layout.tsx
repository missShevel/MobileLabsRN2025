import { Stack } from "expo-router";
import { useEffect } from "react";
import { OneSignal, LogLevel } from "react-native-onesignal";

export default function RootLayout() {
  useEffect(() => {
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    OneSignal.initialize(process.env.EXPO_PUBLIC_ONE_SIGNAL_APP_ID!);
    OneSignal.Notifications.requestPermission(false);
  }, []); 
  return <Stack />;
}
