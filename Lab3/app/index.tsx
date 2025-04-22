import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { Link } from "expo-router";
import {
  GestureDetector,
  Gesture,
  Directions,
  State,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";
import { useTasks } from "../context/TaskContext";

const MainScreen = () => {
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
    incrementSingleClick,
    incrementDoubleClick,
    setScore: setContextScore,
    setHoldDuration,
    setDidDrag,
    setDidSwipeLeft,
    setDidSwipeRight,
    setDidPinch,
    resetProgress,
  } = useTasks();

  const [localScore, setLocalScore] = useState<number>(score);

  useEffect(() => {
    setLocalScore(score);
  }, [score]);

  const longPressStartTime = useRef<number>(0);

  const task1Completed = tasks.find((t) => t.id === "1")?.completed ?? false;
  const task2Completed = tasks.find((t) => t.id === "2")?.completed ?? false;
  const task3Completed = tasks.find((t) => t.id === "3")?.completed ?? false;
  const task4Completed = tasks.find((t) => t.id === "4")?.completed ?? false;
  const task5Completed = tasks.find((t) => t.id === "5")?.completed ?? false;
  const task6Completed = tasks.find((t) => t.id === "6")?.completed ?? false;
  const task7Completed = tasks.find((t) => t.id === "7")?.completed ?? false;
  const task8Completed = tasks.find((t) => t.id === "8")?.completed ?? false;

  // --- Task Completion Logic Effects (remain the same) ---
  useEffect(() => {
    if (!task1Completed && singleClickCount >= 10)
      updateTaskCompletion("1", true);
  }, [singleClickCount, task1Completed, updateTaskCompletion]);
  useEffect(() => {
    if (!task2Completed && doubleClickCount >= 5)
      updateTaskCompletion("2", true);
  }, [doubleClickCount, task2Completed, updateTaskCompletion]);
  useEffect(() => {
    if (!task3Completed && holdDuration >= 3000)
      updateTaskCompletion("3", true);
  }, [holdDuration, task3Completed, updateTaskCompletion]);
  useEffect(() => {
    if (!task4Completed && didDrag) updateTaskCompletion("4", true);
  }, [didDrag, task4Completed, updateTaskCompletion]);
  useEffect(() => {
    if (!task5Completed && didSwipeRight) updateTaskCompletion("5", true);
  }, [didSwipeRight, task5Completed, updateTaskCompletion]);
  useEffect(() => {
    if (!task6Completed && didSwipeLeft) updateTaskCompletion("6", true);
  }, [didSwipeLeft, task6Completed, updateTaskCompletion]);
  useEffect(() => {
    if (!task7Completed && didPinch) updateTaskCompletion("7", true);
  }, [didPinch, task7Completed, updateTaskCompletion]);
  useEffect(() => {
    if (!task8Completed && score >= 100) updateTaskCompletion("8", true);
  }, [score, task8Completed, updateTaskCompletion]);

  // --- Shared Values for Animation (remain the same) ---
  const positionX = useSharedValue(0);
  const positionY = useSharedValue(0);
  const startPositionX = useSharedValue(0);
  const startPositionY = useSharedValue(0);
  const scale = useSharedValue(1);
  const startScale = useSharedValue(1);

  // --- Gesture Handlers (remain the same) ---
  const handleSingleTap = useCallback(() => {
    const newScore = score + 1;
    setLocalScore(newScore);
    setContextScore(newScore);
    incrementSingleClick();
  }, [score, incrementSingleClick, setContextScore]);
  const handleDoubleTap = useCallback(() => {
    const newScore = score + 2;
    setLocalScore(newScore);
    setContextScore(newScore);
    incrementDoubleClick();
  }, [score, incrementDoubleClick, setContextScore]);
  const handleLongPressScore = useCallback(() => {
    const newScore = score + 5;
    setLocalScore(newScore);
    setContextScore(newScore);
    console.log(`Long Press! New Score: ${newScore}`);
  }, [score, setContextScore]);
  const handleFlingScore = useCallback(() => {
    const randomPoints = Math.floor(Math.random() * 10) + 1;
    const newScore = score + randomPoints;
    setLocalScore(newScore);
    setContextScore(newScore);
    console.log(`Fling +${randomPoints}. New Score: ${newScore}`);
  }, [score, setContextScore]);
  const handlePinchScore = useCallback(() => {
    const bonusPoints = 10;
    const newScore = score + bonusPoints;
    setLocalScore(newScore);
    setContextScore(newScore);
    console.log(`Pinch End! +${bonusPoints}. New Score: ${newScore}`);
    setDidPinch(true);
  }, [score, setContextScore, setDidPinch]);

  // --- Gesture Definitions (Updates to Pan and Flings) ---

  // Define Flings first to reference them
  const flingGestureRight = Gesture.Fling()
    .direction(Directions.RIGHT) // Only detect right flings
    .onEnd(() => {
      console.log("Swipe Right Detected (Separate Handler)");
      runOnJS(setDidSwipeRight)(true); // Task 5 flag
      runOnJS(handleFlingScore)(); // Award points
    });

  const flingGestureLeft = Gesture.Fling()
    .direction(Directions.LEFT) // Only detect left flings
    .onEnd(() => {
      console.log("Swipe Left Detected (Separate Handler)");
      runOnJS(setDidSwipeLeft)(true); // Task 6 flag
      runOnJS(handleFlingScore)(); // Award points
    });

  // Define Pan, making it fail if either Fling activates
  const panGesture = Gesture.Pan()
    // .requireExternalGestureToFail(flingGestureLeft, flingGestureRight) // <<< REMOVED THIS LINE
    .onBegin(() => {
      startPositionX.value = positionX.value;
      startPositionY.value = positionY.value;
    })
    .onUpdate((event) => {
      positionX.value = startPositionX.value + event.translationX;
      positionY.value = startPositionY.value + event.translationY;
    })
    .onEnd(() => {
      // Task 4: Drag Object
      console.log("Pan End Detected (Drag Task)");
      runOnJS(setDidDrag)(true);
    });

  // Update tap/long press failure dependencies
  const singleTapGesture = Gesture.Tap()
    .maxDuration(250)
    .requireExternalGestureToFail(
      panGesture,
      flingGestureLeft,
      flingGestureRight
    ) // Update dependencies
    .onStart(() => {
      runOnJS(handleSingleTap)();
    });

  const doubleTapGesture = Gesture.Tap()
    .maxDuration(250)
    .numberOfTaps(2)
    .requireExternalGestureToFail(
      panGesture,
      flingGestureLeft,
      flingGestureRight
    ) // Update dependencies
    .onStart(() => {
      runOnJS(handleDoubleTap)();
    });

  const longPressGesture = Gesture.LongPress()
    .minDuration(800)
    .requireExternalGestureToFail(
      panGesture,
      flingGestureLeft,
      flingGestureRight
    ) // Update dependencies
    .onStart((_event) => {
      longPressStartTime.current = Date.now();
    })
    .onEnd((_event, success) => {
      if (success) {
        const endTime = Date.now();
        const duration = endTime - longPressStartTime.current;
        runOnJS(setHoldDuration)(duration); // Task 3 duration
        runOnJS(handleLongPressScore)();
      }
      longPressStartTime.current = 0;
    });

  const pinchGesture = Gesture.Pinch() // ... (rest remains same)
    .onBegin(() => {
      startScale.value = scale.value;
    })
    .onUpdate((event) => {
      scale.value = startScale.value * event.scale;
    })
    .onEnd(() => {
      runOnJS(handlePinchScore)();
    }); // Task 7 handled inside

  // --- Combine Gestures ---
  const tapGestures = Gesture.Exclusive(
    doubleTapGesture,
    longPressGesture,
    singleTapGesture
  );

  // Update Simultaneous group to include both fling gestures
  const combinedGestures = Gesture.Simultaneous(
    panGesture,
    tapGestures,
    flingGestureLeft, // Add left fling
    flingGestureRight, // Add right fling
    pinchGesture
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: positionX.value },
        { translateY: positionY.value },
        { scale: scale.value }, // Add scale transform
      ],
    };
  });

  // --- Component Return (Remains the same) ---
  return (
    <View style={styles.container}>
      {/* ... */}
      <Text style={styles.scoreText}>Score: {localScore}</Text>
      <GestureDetector gesture={combinedGestures}>
        <Animated.View style={[styles.interactiveObject, animatedStyle]} />
      </GestureDetector>
      {resetProgress && (
        <Button title="Reset Progress (For Testing)" onPress={resetProgress} />
      )}
      <Link href="/tasks" style={styles.linkButton}>
        Go to Tasks
      </Link>
    </View>
  );
};

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
  },
});

// --- Export ---
export default MainScreen;
