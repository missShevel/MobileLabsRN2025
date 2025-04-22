import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";
import {
  GestureDetector,
  Gesture,
  Directions,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";

const MainScreen = () => {
  const [score, setScore] = useState<number>(0);

  const positionX = useSharedValue(0);
  const positionY = useSharedValue(0);
  const startPositionX = useSharedValue(0);
  const startPositionY = useSharedValue(0);

  const handleSingleTap = () => {
    setScore((currentScore) => {
      const newScore = currentScore + 1;
      console.log(`Single Tap! New Score: ${newScore}`);
      return newScore;
    });
  };

  const handleDoubleTap = () => {
    setScore((currentScore) => {
      const newScore = currentScore + 2;
      console.log(`Double Tap! New Score: ${newScore}`);
      return newScore;
    });
  };

  const handleLongPress = () => {
    setScore((currentScore) => {
      const newScore = currentScore + 5;
      console.log(`Long Press! New Score: ${newScore}`);
      return newScore;
    });
  };

  const handleFling = () => {
    const randomPoints = Math.floor(Math.random() * 10) + 1;
    setScore((currentScore) => {
      const newScore = currentScore + randomPoints;
      console.log(`Fling +${randomPoints}. New Score: ${newScore}`);
      return newScore;
    });
  };

  // Define Pan and Fling first to get references
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      startPositionX.value = positionX.value;
      startPositionY.value = positionY.value;
    })
    .onUpdate((event) => {
      positionX.value = startPositionX.value + event.translationX;
      positionY.value = startPositionY.value + event.translationY;
    });

  const flingGesture = Gesture.Fling()
    .direction(Directions.LEFT | Directions.RIGHT)
    .onEnd(() => {
      runOnJS(handleFling)();
    });

  // Now define taps, requiring Pan and Fling to fail
  const singleTapGesture = Gesture.Tap()
    .maxDuration(250)
    .requireExternalGestureToFail(panGesture, flingGesture) // Add this
    .onStart(() => {
      runOnJS(handleSingleTap)();
    });

  const doubleTapGesture = Gesture.Tap()
    .maxDuration(250)
    .numberOfTaps(2)
    .requireExternalGestureToFail(panGesture, flingGesture) // Add this
    .onStart(() => {
      runOnJS(handleDoubleTap)();
    });

  const longPressGesture = Gesture.LongPress()
    .minDuration(800)
    .requireExternalGestureToFail(panGesture, flingGesture) // Add this
    .onStart(() => {
      runOnJS(handleLongPress)();
    });

  // Group the taps/long press
  const tapGestures = Gesture.Exclusive(
    doubleTapGesture,
    longPressGesture,
    singleTapGesture
  );

  // Combine all using Simultaneous - interactions are now managed by requireExternalGestureToFail
  const combinedGestures = Gesture.Simultaneous(
    panGesture,
    tapGestures,
    flingGesture
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: positionX.value },
        { translateY: positionY.value },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Main Game Screen</Text>
      <Text style={styles.scoreText}>Score: {score}</Text>

      <GestureDetector gesture={combinedGestures}>
        <Animated.View style={[styles.interactiveObject, animatedStyle]} />
      </GestureDetector>

      <Link href="/tasks" style={styles.linkButton}>
        Go to Tasks
      </Link>
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