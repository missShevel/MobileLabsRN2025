import React, { useState, useEffect } from "react"; // No longer need useRef, useCallback here
import { View, Text, StyleSheet, Button } from "react-native";
import { Link } from "expo-router";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { useTasks } from "../context/TaskContext";
import { useClickerGestures } from "../hooks/useClickerGestures";

const MainScreen = () => {
  // Get all necessary values/functions from context
  const {
    tasks,
    updateTaskCompletion,
    singleClickCount,
    doubleClickCount,
    score,
    holdDuration,
    didDrag,
    didSwipeLeft,
    didSwipeRight,
    didPinch,
    resetProgress,
  } = useTasks();

  // Get gesture/style logic from custom hook
  const { combinedGestures, animatedStyle } = useClickerGestures();

  // Local score state for immediate UI updates (optional)
  const [localScore, setLocalScore] = useState<number>(score);
  useEffect(() => {
    setLocalScore(score);
  }, [score]);

  // --- Re-add Consolidated Task Completion Logic Effect ---
  useEffect(() => {
    const taskCompletionChecks = [
      {
        id: "1",
        condition: singleClickCount >= 10,
        dependsOn: singleClickCount,
      },
      {
        id: "2",
        condition: doubleClickCount >= 5,
        dependsOn: doubleClickCount,
      },
      { id: "3", condition: holdDuration >= 3000, dependsOn: holdDuration },
      { id: "4", condition: didDrag, dependsOn: didDrag },
      { id: "5", condition: didSwipeRight, dependsOn: didSwipeRight },
      { id: "6", condition: didSwipeLeft, dependsOn: didSwipeLeft },
      { id: "7", condition: didPinch, dependsOn: didPinch },
      { id: "8", condition: score >= 100, dependsOn: score },
    ];

    taskCompletionChecks.forEach(({ id, condition }) => {
      const task = tasks.find((t) => t.id === id);
      const taskCompleted = task?.completed ?? false;
      if (!taskCompleted && condition) {
        console.log(`Condition met for Task ${id}, marking complete.`);
        updateTaskCompletion(id, true);
      }
    });
  }, [
    // Ensure all dependencies that trigger checks are included
    singleClickCount,
    doubleClickCount,
    holdDuration,
    didDrag,
    didSwipeRight,
    didSwipeLeft,
    didPinch,
    score,
    tasks, // Need tasks here to read the latest completion status inside loop
    updateTaskCompletion,
  ]);

  // --- Component Return ---
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Main Game Screen</Text>
      <Text style={styles.scoreText}>Score: {localScore}</Text>

      <GestureDetector gesture={combinedGestures}>
        <Animated.View style={[styles.interactiveObject, animatedStyle]} />
      </GestureDetector>

      {resetProgress && (
        <Button title="Reset Progress (For Testing)" onPress={resetProgress} />
      )}
      <Link href="/tasks" style={styles.linkButton}>
        {" "}
        Go to Tasks{" "}
      </Link>
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
    padding: 20,
  },
  title: { fontSize: 24, fontWeight: "bold" },
  scoreText: { fontSize: 20, marginVertical: 10 },
  interactiveObject: {
    width: 100,
    height: 100,
    backgroundColor: "blue",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  linkButton: {
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    overflow: "hidden",
    textAlign: "center",
    color: "black",
    marginTop: 10,
  },
});

// --- Export ---
export default MainScreen;
