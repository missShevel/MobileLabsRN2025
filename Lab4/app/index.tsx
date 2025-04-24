import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import DatePicker from "react-native-date-picker";
import { Ionicons, Feather } from "@expo/vector-icons";

const ONE_SIGNAL_APP_ID = process.env.EXPO_PUBLIC_ONE_SIGNAL_APP_ID!;
const ONE_SIGNAL_REST_API_KEY = process.env.EXPO_PUBLIC_ONE_SIGNAL_API_KEY!

interface Todo {
  id: string;
  title: string;
  description: string;
  reminderTime: Date;
  isCompleted: boolean;
  notificationId?: string;
}

export default function TodoScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    let updated = false;
    const updatedTodos = todos.map((todo) => {
      if (todo.reminderTime < now && !todo.isCompleted) {
        updated = true;
        console.log(`Marking past todo "${todo.title}" as completed.`);
        return { ...todo, isCompleted: true };
      }
      return todo;
    });

    if (updated) {
      setTodos(updatedTodos);
    }
  }, [todos]);

  const scheduleNotification = async (
    todo: Omit<Todo, "notificationId" | "isCompleted" | "id">
  ): Promise<string | null> => {
    const notificationBody = {
      app_id: ONE_SIGNAL_APP_ID,
      contents: { en: `!!! ${todo.description}` },
      headings: { en: todo.title },
      included_segments: ["Active Subscriptions"],
      target_channel: "push",
      send_after: todo.reminderTime.toISOString(),
    };

    try {
      const response = await fetch("https://api.onesignal.com/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Key ${ONE_SIGNAL_REST_API_KEY}`,
        },
        body: JSON.stringify(notificationBody),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("OneSignal Error Response:", result);
        throw new Error(
          `HTTP error! status: ${response.status}. ${
            result?.errors?.join(", ") || "Failed to schedule notification."
          }`
        );
      }

      console.log("OneSignal Schedule Success:", result);

      if (result.id) {
        return result.id;
      } else {
        console.warn("OneSignal response did not contain a notification ID.");
        return null;
      }
    } catch (error: any) {
      console.error("Error scheduling notification:", error);
      Alert.alert(
        "Scheduling Error",
        `Failed to schedule notification: ${error.message}`
      );
      return null;
    }
  };

  const cancelNotification = async (
    notificationId: string
  ): Promise<boolean> => {
    const url = `https://api.onesignal.com/api/v1/notifications/${notificationId}?app_id=${ONE_SIGNAL_APP_ID}`;

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Key ${ONE_SIGNAL_REST_API_KEY}`,
        },
      });

      const result = await response.json();

      if (response.status !== 200 && result.success !== "true") {
        console.error("OneSignal Cancellation Error Response:", result);
        const errorMessages =
          result?.errors?.join(", ") || "Failed to cancel notification.";
        throw new Error(
          `HTTP error! status: ${response.status}. ${errorMessages}`
        );
      }

      console.log("OneSignal Cancellation Success:", result);
      return true;
    } catch (error: any) {
      console.error("Error cancelling notification:", error);
      Alert.alert(
        "Cancellation Error",
        `Failed to cancel notification: ${error.message}`
      );
      return false;
    }
  };

  const handleAddTodo = async () => {
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please enter a title for the reminder.");
      return;
    }
    if (date <= new Date()) {
      Alert.alert(
        "Invalid Time",
        "Please select a future time for the reminder."
      );
      return;
    }

    setIsLoading(true);

    const todoDataForScheduling = {
      title: title.trim(),
      description: description.trim(),
      reminderTime: date,
    };

    const scheduledNotificationId = await scheduleNotification(
      todoDataForScheduling
    );

    if (scheduledNotificationId !== null) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        title: title.trim(),
        description: description.trim(),
        reminderTime: date,
        isCompleted: false,
        notificationId: scheduledNotificationId || undefined,
      };

      setTodos((prevTodos) => [...prevTodos, newTodo]);
      setTitle("");
      setDescription("");
      setDate(new Date());

      Alert.alert("Success", "Reminder added and notification scheduled!");
    }

    setIsLoading(false);
  };

  const handleDeleteTodo = async (id: string) => {
    const todoToDelete = todos.find((todo) => todo.id === id);
    if (!todoToDelete) return;

    setIsDeleting(id);

    let cancellationAttempted = false;
    let cancellationSuccess = true;
    const isPastReminder = todoToDelete.reminderTime < new Date();

    if (todoToDelete.notificationId && !isPastReminder) {
      cancellationAttempted = true;
      console.log(
        "Attempting to cancel FUTURE notification ID:",
        todoToDelete.notificationId
      );
      cancellationSuccess = await cancelNotification(
        todoToDelete.notificationId
      );
    } else if (todoToDelete.notificationId && isPastReminder) {
      console.log(
        "Skipping cancellation for PAST notification ID:",
        todoToDelete.notificationId
      );
    } else {
      console.log(
        "No notification ID found for this todo, skipping cancellation."
      );
    }

    if (cancellationSuccess || isPastReminder) {
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
      Alert.alert("Deleted", "Reminder removed successfully.");
    } else if (cancellationAttempted && !cancellationSuccess) {
      Alert.alert(
        "Deletion Failed",
        "Could not cancel the scheduled notification. Reminder not removed."
      );
    }

    setIsDeleting(null);
  };

  const handleToggleTodo = (id: string) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
      )
    );
    const toggledTodo = todos.find((todo) => todo.id === id);
    const wasJustCompleted = todos.find((todo) => todo.id === id)?.isCompleted;
    if (wasJustCompleted && toggledTodo?.notificationId) {
      console.log(
        "Optional: Consider cancelling notification for completed task:",
        toggledTodo.notificationId
      );
    }
  };

  const formatDateTime = (dateObj: Date) => {
    return dateObj.toLocaleString("uk-UA", {
      weekday: "short",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const renderTodoItem = ({ item }: { item: Todo }) => (
    <View style={styles.todoItem}>
      <TouchableOpacity
        onPress={() => handleToggleTodo(item.id)}
        style={styles.todoCheck}
        disabled={!!isDeleting}
      >
        <Feather
          name={item.isCompleted ? "check-circle" : "circle"}
          size={24}
          color={item.isCompleted ? "green" : "gray"}
        />
      </TouchableOpacity>
      <View style={styles.todoTextContainer}>
        <Text
          style={[styles.todoTitle, item.isCompleted && styles.completedText]}
        >
          {item.title}
        </Text>
        {item.description ? (
          <Text
            style={[
              styles.todoDescription,
              item.isCompleted && styles.completedText,
            ]}
          >
            {item.description}
          </Text>
        ) : null}
        <Text
          style={[styles.todoTime, item.isCompleted && styles.completedText]}
        >
          {formatDateTime(item.reminderTime)}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => handleDeleteTodo(item.id)}
        style={styles.deleteButton}
        disabled={isDeleting === item.id}
      >
        {isDeleting === item.id ? (
          <ActivityIndicator size="small" color="red" />
        ) : (
          <Ionicons name="trash-bin" size={24} color="red" />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.heading}>To-Do Reminder</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Назва (Title)"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#aaa"
          />
          <TextInput
            style={styles.input}
            placeholder="Опис (Description)"
            value={description}
            onChangeText={setDescription}
            placeholderTextColor="#aaa"
            multiline
          />
          <TouchableOpacity
            onPress={() => setOpenDatePicker(true)}
            style={styles.datePickerButton}
          >
            <Text style={styles.datePickerButtonText}>
              Обрати час: {formatDateTime(date)}
            </Text>
            <Ionicons
              name="calendar"
              size={20}
              color="#fff"
              style={{ marginLeft: 10 }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddTodo}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Text style={styles.addButtonText}>ДОДАТИ НАГАДУВАННЯ</Text>
                <Ionicons
                  name="add-circle-outline"
                  size={22}
                  color="#fff"
                  style={{ marginLeft: 8 }}
                />
              </>
            )}
          </TouchableOpacity>
        </View>

        <DatePicker
          modal
          open={openDatePicker}
          date={date}
          mode="datetime"
          minimumDate={new Date()}
          onConfirm={(selectedDate) => {
            setOpenDatePicker(false);
            setDate(selectedDate);
          }}
          onCancel={() => {
            setOpenDatePicker(false);
          }}
          locale="uk-UA"
          title="Оберіть дату та час"
          confirmText="Підтвердити"
          cancelText="Скасувати"
        />

        <FlatList
          data={todos}
          renderItem={renderTodoItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyListText}>No reminders yet!</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f0f0f0" },
  container: { flex: 1, padding: 20 },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  form: {
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  datePickerButton: {
    flexDirection: "row",
    backgroundColor: "#6200ee",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  datePickerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#007bff",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    minHeight: 50,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  list: { flex: 1, marginTop: 10 },
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  todoCheck: { marginRight: 15, padding: 5 },
  todoTextContainer: { flex: 1, marginRight: 10 },
  todoTitle: { fontSize: 17, fontWeight: "500", color: "#333" },
  todoDescription: { fontSize: 14, color: "#666", marginTop: 2 },
  todoTime: { fontSize: 13, color: "#888", marginTop: 4 },
  completedText: { textDecorationLine: "line-through", color: "#aaa" },
  deleteButton: { padding: 5 },
  emptyListText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: "#888",
  },
  // Optional style for debugging notification ID
  notificationIdText: { fontSize: 10, color: "blue", marginTop: 3 },
});
