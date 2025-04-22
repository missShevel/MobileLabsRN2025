import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router'; // Import useRouter for going back

const TasksScreen = () => {
  const router = useRouter(); // Hook to access router functions

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tasks Screen</Text>
      <Text>Task List will go here...</Text>

      {/* You can use a Link with '..' to go up one level, or useRouter */}
      {/* <Link href="..">Go Back to Game</Link> */}

      {/* Or use the router hook to go back programmatically */}
      <Text style={styles.linkButton} onPress={() => router.back()}>
         Go Back to Game
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
   title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
   linkButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
    textAlign: 'center',
    color: 'black',
  }
});

export default TasksScreen;