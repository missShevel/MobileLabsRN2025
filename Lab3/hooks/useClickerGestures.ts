import { useRef, useCallback } from "react";
import {
  Gesture,
  Directions,
  State,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";
import { useTasks } from '../context/TaskContext'; // Use tasks context

// This hook encapsulates all gesture and animation logic for the interactive object
export const useClickerGestures = () => {
  // Get necessary functions/state from Task Context
  const {
    score, // Read score for calculations
    incrementSingleClick,
    incrementDoubleClick,
    setScore: setContextScore,
    setHoldDuration,
    setDidDrag,
    setDidSwipeLeft,
    setDidSwipeRight,
    setDidPinch,
  } = useTasks();

  // Animation shared values managed within the hook
  const positionX = useSharedValue(0);
  const positionY = useSharedValue(0);
  const startPositionX = useSharedValue(0);
  const startPositionY = useSharedValue(0);
  const scale = useSharedValue(1);
  const startScale = useSharedValue(1);

  // Ref for long press timing
  const longPressStartTime = useRef<number>(0);

  // --- Gesture Handlers defined inside the hook ---
  // Note: We use score directly from context now, no need for localScore state here
  const handleSingleTap = useCallback(() => {
    const newScore = score + 1;
    setContextScore(newScore);
    incrementSingleClick();
  }, [score, incrementSingleClick, setContextScore]);

  const handleDoubleTap = useCallback(() => {
    const newScore = score + 2;
    setContextScore(newScore);
    incrementDoubleClick();
  }, [score, incrementDoubleClick, setContextScore]);

  const handleLongPressScore = useCallback(() => {
    const newScore = score + 5;
    setContextScore(newScore);
    console.log(`Long Press! New Score: ${newScore}`);
  }, [score, setContextScore]);

  const handleFlingScore = useCallback(() => {
    const randomPoints = Math.floor(Math.random() * 10) + 1;
    const newScore = score + randomPoints;
    setContextScore(newScore);
    console.log(`Fling +${randomPoints}. New Score: ${newScore}`);
  }, [score, setContextScore]);

  const handlePinchScore = useCallback(() => {
    const bonusPoints = 10;
    const newScore = score + bonusPoints;
    setContextScore(newScore);
    console.log(`Pinch End! +${bonusPoints}. New Score: ${newScore}`);
    setDidPinch(true);
  }, [score, setContextScore, setDidPinch]);


  // --- Gesture Definitions ---
  const flingGestureRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => { runOnJS(setDidSwipeRight)(true); runOnJS(handleFlingScore)(); });

  const flingGestureLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(() => { runOnJS(setDidSwipeLeft)(true); runOnJS(handleFlingScore)(); });

  const panGesture = Gesture.Pan()
    .onBegin(() => { startPositionX.value = positionX.value; startPositionY.value = positionY.value; })
    .onUpdate((event) => { positionX.value = startPositionX.value + event.translationX; positionY.value = startPositionY.value + event.translationY; })
    .onEnd(() => { runOnJS(setDidDrag)(true); });

  const singleTapGesture = Gesture.Tap()
    .maxDuration(250)
    .requireExternalGestureToFail(panGesture, flingGestureLeft, flingGestureRight)
    .onStart(() => { runOnJS(handleSingleTap)(); });

  const doubleTapGesture = Gesture.Tap()
    .maxDuration(250)
    .numberOfTaps(2)
    .requireExternalGestureToFail(panGesture, flingGestureLeft, flingGestureRight)
    .onStart(() => { runOnJS(handleDoubleTap)(); });

  const longPressGesture = Gesture.LongPress()
    .minDuration(800)
    .requireExternalGestureToFail(panGesture, flingGestureLeft, flingGestureRight)
    .onStart(() => { longPressStartTime.current = Date.now(); })
    .onEnd((_event, success) => {
         if (success) {
              const endTime = Date.now();
              const duration = endTime - longPressStartTime.current;
              runOnJS(setHoldDuration)(duration);
              runOnJS(handleLongPressScore)();
         }
         longPressStartTime.current = 0;
     });

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => { startScale.value = scale.value; })
    .onUpdate((event) => { scale.value = startScale.value * event.scale; })
    .onEnd(() => { runOnJS(handlePinchScore)(); });

  const tapGestures = Gesture.Exclusive(doubleTapGesture, longPressGesture, singleTapGesture );

  // --- Combined Gesture returned by the hook ---
  const combinedGestures = Gesture.Simultaneous( panGesture, tapGestures, flingGestureLeft, flingGestureRight, pinchGesture );

  // --- Animated Style returned by the hook ---
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: positionX.value },
        { translateY: positionY.value },
        { scale: scale.value },
      ],
    };
  });

  // Return the combined gesture and the animated style for the component to use
  return { combinedGestures, animatedStyle };
};