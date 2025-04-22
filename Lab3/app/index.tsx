import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { runOnJS } from 'react-native-reanimated';

const MainScreen = () => {
  const [score, setScore] = useState<number>(0);

  const handleSingleTap = () => {
    setScore(currentScore => {
       const newScore = currentScore + 1;
       console.log(`Single Tap! New Score: ${newScore}`);
       return newScore;
    });
  };

  const handleDoubleTap = () => {
    setScore(currentScore => {
       const newScore = currentScore + 2; // Add 2 points for double tap
       console.log(`Double Tap! New Score: ${newScore}`);
       return newScore;
    });
  };

  const singleTapGesture = Gesture.Tap()
    .maxDuration(250)
    .onStart(() => {
      runOnJS(handleSingleTap)();
    });

  const doubleTapGesture = Gesture.Tap()
    .maxDuration(250)
    .numberOfTaps(2) // Specify this is a double tap
    .onStart(() => {
      runOnJS(handleDoubleTap)();
    });

  // Combine gestures: double tap takes priority if detected, otherwise single tap
  const combinedTap = Gesture.Exclusive(doubleTapGesture, singleTapGesture);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Main Game Screen</Text>
      <Text style={styles.scoreText}>Score: {score}</Text>

      {/* Use the combined gesture */}
      <GestureDetector gesture={combinedTap}>
        <View style={styles.interactiveObject} />
      </GestureDetector>

      <Link href="/tasks" style={styles.linkButton}>Go to Tasks</Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "space-around", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold" },
  scoreText: { fontSize: 20, marginVertical: 10 },
  interactiveObject: { width: 100, height: 100, backgroundColor: "blue", borderRadius: 10, justifyContent: "center", alignItems: "center" },
  linkButton: { padding: 10, backgroundColor: "#ddd", borderRadius: 5, overflow: "hidden", textAlign: "center", color: "black" },
});

export default MainScreen;