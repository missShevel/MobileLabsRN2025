import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button, // Keep Button if needed elsewhere, otherwise can remove
  FlatList,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  Alert,
} from 'react-native';
// Import the new DatePicker library
import DatePicker from 'react-native-date-picker';
import { Ionicons, Feather } from '@expo/vector-icons';

// Define the structure for a Todo item
interface Todo {
  id: string;
  title: string;
  description: string;
  reminderTime: Date;
  isCompleted: boolean;
  notificationId?: string; // Optional: To store the OneSignal notification ID later
}

export default function TodoScreen() {
  // --- State Variables ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date()); // State for the selected date/time
  // Use 'open' state for the modal date picker
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]); // State to hold the list of todos

  // --- Functions ---

  // --- TODO: Implement Add Todo Logic ---
  const handleAddTodo = () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for the reminder.');
      return;
    }
    // Ensure the selected date is in the future
    if (date <= new Date()) {
      Alert.alert(
        'Invalid Time',
        'Please select a future time for the reminder.'
      );
      return;
    }

    const newTodo: Todo = {
      id: Date.now().toString(), // Simple unique ID for now
      title: title.trim(),
      description: description.trim(),
      reminderTime: date,
      isCompleted: false,
      // notificationId will be added here later when scheduling
    };

    // --- Placeholder for OneSignal Scheduling ---
    console.log('Scheduling notification for:', newTodo);
    // scheduleNotification(newTodo); // Call the actual scheduling function here

    setTodos((prevTodos) => [...prevTodos, newTodo]); // Add to list
    setTitle(''); // Clear inputs
    setDescription('');
    // Reset date picker to current time for the next entry, but keep it closed
    setDate(new Date());

    Alert.alert('Success', 'Reminder added!'); // Feedback to user
  };

  // --- TODO: Implement Delete Todo Logic ---
  const handleDeleteTodo = (id: string) => {
    const todoToDelete = todos.find((todo) => todo.id === id);
    if (todoToDelete) {
      // --- Placeholder for OneSignal Cancellation ---
      console.log('Cancelling notification for:', todoToDelete);
      // cancelNotification(todoToDelete.notificationId); // Call the actual cancellation function here

      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
      Alert.alert('Deleted', 'Reminder removed.'); // Feedback
    }
  };

  // --- TODO: Implement Toggle Todo Logic ---
  const handleToggleTodo = (id: string) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
      )
    );
    // Optional: Consider cancelling notification if marked complete
    const toggledTodo = todos.find((todo) => todo.id === id);
    // Check if it was *just* marked complete (!toggledTodo.isCompleted will be true *after* the state update finishes)
    const wasJustCompleted = todos.find(todo => todo.id === id)?.isCompleted;
    if (wasJustCompleted) {
        console.log('Optional: Consider cancelling notification for completed task:', toggledTodo);
        // cancelNotification(toggledTodo?.notificationId);
    }
  };

  // Function to format Date object into a readable string
  const formatDateTime = (dateObj: Date) => {
    // Use options for Ukrainian locale formatting matching the PDF example
    return dateObj.toLocaleString('uk-UA', {
      weekday: 'short', // e.g., "чт"
      day: '2-digit',   // e.g., "03"
      month: 'long',    // e.g., "квітня"
      year: 'numeric',  // e.g., "2025 р."
      hour: '2-digit',  // e.g., "21"
      minute: '2-digit', // e.g., "52"
      hour12: false,    // Use 24-hour format
    });
  };

  // --- Render Function for Each Todo Item ---
  const renderTodoItem = ({ item }: { item: Todo }) => (
    <View style={styles.todoItem}>
      <TouchableOpacity
        onPress={() => handleToggleTodo(item.id)}
        style={styles.todoCheck}
      >
        <Feather
          name={item.isCompleted ? 'check-circle' : 'circle'}
          size={24}
          color={item.isCompleted ? 'green' : 'gray'}
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
          {/* Display the formatted reminder time */}
          {formatDateTime(item.reminderTime)}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => handleDeleteTodo(item.id)}
        style={styles.deleteButton}
      >
        <Ionicons name="trash-bin" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  // --- Component Return JSX ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.heading}>To-Do Reminder</Text>

        {/* --- Input Form --- */}
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

          {/* --- Date/Time Picker Trigger --- */}
          <TouchableOpacity
            onPress={() => setOpenDatePicker(true)} // Open the modal picker
            style={styles.datePickerButton}
          >
            <Text style={styles.datePickerButtonText}>
              {/* Display the currently selected date/time */}
              Обрати час: {formatDateTime(date)}
            </Text>
            <Ionicons
              name="calendar"
              size={20}
              color="#fff"
              style={{ marginLeft: 10 }}
            />
          </TouchableOpacity>

          {/* --- Add Button --- */}
          <TouchableOpacity style={styles.addButton} onPress={handleAddTodo}>
            <Text style={styles.addButtonText}>ДОДАТИ НАГАДУВАННЯ</Text>
            <Ionicons
              name="add-circle-outline"
              size={22}
              color="#fff"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </View>

        {/* --- Modal Date Picker Component --- */}
        <DatePicker
          modal // Render as a modal
          open={openDatePicker} // Control visibility with state
          date={date} // Current date value
          mode="datetime" // Select both date and time
          minimumDate={new Date()} // Prevent selecting past dates/times
          onConfirm={(selectedDate) => {
            setOpenDatePicker(false); // Close the modal
            setDate(selectedDate); // Update the date state
          }}
          onCancel={() => {
            setOpenDatePicker(false); // Close the modal without changes
          }}
          // Optional: Set locale and title if needed
          locale="uk-UA" // Use Ukrainian locale for the picker interface
          title="Оберіть дату та час" // Set a title for the modal
          confirmText="Підтвердити" // Customize confirm button text
          cancelText="Скасувати" // Customize cancel button text
        />

        {/* --- Todo List --- */}
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

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  form: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  datePickerButton: {
    flexDirection: 'row',
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  datePickerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center', // Center text in the button
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  list: {
    flex: 1,
    marginTop: 10,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  todoCheck: {
    marginRight: 15,
    padding: 5,
  },
  todoTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  todoTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#333',
  },
  todoDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  todoTime: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  deleteButton: {
    padding: 5,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#888',
  },
});
