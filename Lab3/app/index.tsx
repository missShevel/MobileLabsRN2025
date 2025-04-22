import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router'; // Use Link for navigation

const MainScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Main Game Screen</Text>
      <Text>Score: 0</Text>
      {/* Placeholder for the interactive object */}
      <View style={styles.interactiveObject}></View>

      {/* Use Link component to navigate to the tasks screen */}
      <Link href="/tasks" style={styles.linkButton}>Go to Tasks</Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  interactiveObject: {
    width: 100,
    height: 100,
    backgroundColor: 'blue',
    borderRadius: 10,
  },
  linkButton: {
    padding: 10,
    backgroundColor: '#ddd', // Basic styling for the link
    borderRadius: 5,
    overflow: 'hidden', // Ensures background respects border radius
    textAlign: 'center',
    color: 'black', // Default link color might be blue
  }
});

export default MainScreen;