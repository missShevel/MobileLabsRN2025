// IMPORTANT: Import this at the VERY TOP
import 'react-native-gesture-handler';

import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      {/* StatusBar component from Expo */}
      <StatusBar style="auto" />
      {/* Stack defines the navigator for files in the 'app' directory */}
      <Stack>
        {/* Screen definition for index.tsx */}
        <Stack.Screen
          name="index" // Corresponds to app/index.tsx
          options={{ title: 'Clicker Game' }}
         />
        {/* Screen definition for tasks.tsx */}
        <Stack.Screen
          name="tasks" // Corresponds to app/tasks.tsx
          options={{ title: 'Tasks List' }}
         />
      </Stack>
    </>
  );
}