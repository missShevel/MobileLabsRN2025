import { Stack } from "expo-router";
import { useEffect } from "react";
import { OneSignal, LogLevel } from "react-native-onesignal";

export default function RootLayout() {
  useEffect(() => {
    // Enable verbose logging for debugging (remove in production)
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    // Initialize with your OneSignal App ID
    OneSignal.initialize("dd3ae8f6-fc55-45b9-8f62-04d71cdcda8c");
    // Use this method to prompt for push notifications.
    // We recommend removing this method after testing and instead use In-App Messages to prompt for notification permission.
    OneSignal.Notifications.requestPermission(false);
  }, []); // Ensure this only runs once on app mount
  return <Stack />;
}
