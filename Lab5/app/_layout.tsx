import { useEffect } from "react";
import * as FileSystem from "expo-file-system";
import { SplashScreen, Stack } from "expo-router";
import { LogBox } from "react-native";
import { baseDir } from "@/constants/files";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Define the base directory path [cite: 12]
export default function RootLayout() {
  useEffect(() => {
    // Function to check and create the directory
    const setupDirectory = async () => {
      try {
        console.log("Checking directory:", baseDir);
        const dirInfo = await FileSystem.getInfoAsync(baseDir);
        console.log(dirInfo);

        if (!dirInfo.exists) {
          console.log("Directory doesn't exist, creating...");
          await FileSystem.makeDirectoryAsync(baseDir, { intermediates: true });
          console.log("Directory created successfully.");
        } else {
          console.log("Directory already exists.");
        }
      } catch (error) {
        console.error("Error setting up directory:", error);
        // Handle errors appropriately in a real app (e.g., show a message)
      } finally {
        // Hide the splash screen once the setup is done or failed
        SplashScreen.hideAsync();
      }
    };

    // Run the setup function
    setupDirectory();

    // Optional: Ignore specific logs if needed (e.g., related to Expo Router)
    // LogBox.ignoreLogs(['...']);
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "File Manager" }} />
      {/* Add other screens here later */}
    </Stack>
  );
}
