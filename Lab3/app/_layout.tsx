import 'react-native-gesture-handler';
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { TaskProvider } from '../context/TaskContext'; // Import the provider

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Wrap with TaskProvider */}
      <TaskProvider>
        <StatusBar style="auto" />
        <Stack>
          <Stack.Screen
            name="index"
            options={{ title: 'Clicker Game' }}
           />
          <Stack.Screen
            name="tasks"
            options={{ title: 'Tasks List' }}
           />
        </Stack>
      </TaskProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});