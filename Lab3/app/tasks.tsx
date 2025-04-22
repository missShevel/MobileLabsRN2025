import React from "react";
import { View, Text, StyleSheet, FlatList, SafeAreaView } from "react-native";
import { Link, useRouter } from "expo-router";
import { useTasks } from "../context/TaskContext";

// Task interface might be needed if not globally available/inferred
interface Task {
  id: string;
  description: string;
  completed: boolean;
  type: "count" | "boolean" | "value" | "duration";
  targetValue?: number;
}

const TasksScreen = () => {
  const router = useRouter();
  // Get all context values needed for display
  const {
    tasks,
    singleClickCount,
    doubleClickCount,
    score,
    holdDuration,
    didDrag,
    didSwipeLeft,
    didSwipeRight,
    didPinch,
  } = useTasks();

  const getProgressText = (task: Task): string | null => {
    if (task.completed) return null; // Don't show progress if completed

    switch (task.type) {
      case "count":
        const currentCount =
          task.id === "1"
            ? singleClickCount
            : task.id === "2"
            ? doubleClickCount
            : 0;
        return `(${currentCount}/${task.targetValue ?? "?"})`;
      case "value":
        const currentValue = task.id === "8" ? score : 0;
        // Ensure score doesn't exceed target in display if needed
        const displayScore = Math.min(
          currentValue,
          task.targetValue ?? currentValue
        );
        return `(${displayScore}/${task.targetValue ?? "?"})`;
      case "duration":
        // Display current hold duration if needed, or just target
        // For simplicity, we only show target here, completion is binary
        return `(Need ${((task.targetValue ?? 0) / 1000).toFixed(1)}s)`;
      case "boolean":
        // Boolean tasks usually don't show progress, just pending/completed
        // Or you could show (0/1) maybe?
        // const currentStatus = task.id === '4' ? didDrag : task.id === ... etc.
        // return `(${currentStatus ? 1 : 0}/1)`;
        return null; // Keep boolean tasks simple
      default:
        return null;
    }
  };

  const renderTaskItem = ({ item }: { item: Task }) => {
    const progress = getProgressText(item);
    return (
      <View style={styles.taskItem}>
        <View style={styles.taskDescriptionContainer}>
          <Text style={styles.taskText}>{item.description}</Text>
          {!item.completed && progress && (
            <Text style={styles.progressText}>{progress}</Text>
          )}
        </View>
        <Text
          style={item.completed ? styles.statusCompleted : styles.statusPending}
        >
          {item.completed ? "Completed" : "Pending"}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Tasks Screen</Text>

        <FlatList
          data={tasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          extraData={{
            // Add all relevant progress values here to trigger re-renders
            singleClickCount,
            doubleClickCount,
            score,
            holdDuration,
            didDrag,
            didSwipeLeft,
            didSwipeRight,
            didPinch,
          }}
        />

        <Text style={styles.linkButton} onPress={() => router.back()}>
          Go Back to Game
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f0f0f0" },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  list: { width: "100%", marginBottom: 10 },
  taskItem: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginVertical: 5,
    borderRadius: 5,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskDescriptionContainer: {
    flex: 1, // Allow text to take available space
    marginRight: 10, // Space before status
  },
  taskText: { fontSize: 16, flexWrap: "wrap" }, // Allow text wrapping
  progressText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 5, // Indent progress slightly
  },
  statusPending: {
    fontSize: 14,
    color: "orange",
    fontWeight: "bold",
    marginLeft: "auto",
  }, // Push status to the right
  statusCompleted: {
    fontSize: 14,
    color: "green",
    fontWeight: "bold",
    marginLeft: "auto",
  }, // Push status to the right
  linkButton: {
    marginTop: "auto", // Push button towards bottom
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    overflow: "hidden",
    textAlign: "center",
    color: "black",
    width: "80%",
    alignSelf: "center",
    marginBottom: 10,
  },
});

export default TasksScreen;
