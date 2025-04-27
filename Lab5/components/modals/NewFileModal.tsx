// src/components/modals/NewFileModal.tsx

import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView, // Added ScrollView
  KeyboardAvoidingView, // Added KAV
  Platform,
} from "react-native";

interface NewFileModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateFile: (fileName: string, content: string) => Promise<void>; // Expects async function
}

const NewFileModal: React.FC<NewFileModalProps> = ({
  visible,
  onClose,
  onCreateFile,
}) => {
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Clear inputs when modal visibility changes
  useEffect(() => {
    if (!visible) {
      setFileName("");
      setFileContent("");
      setIsCreating(false);
    }
  }, [visible]);

  const handleCreate = async () => {
    let name = fileName.trim();
    if (!name) {
      Alert.alert("Invalid Name", "File name cannot be empty.");
      return;
    }
    // Ensure filename ends with .txt
    if (!name.toLowerCase().endsWith(".txt")) {
      name += ".txt";
    }
    // Optional: Basic check for invalid characters
    if (/[\\/:\*\?"<>\|]/.test(name.replace(".txt", ""))) {
      Alert.alert(
        "Invalid Name",
        'File name contains invalid characters: /\\:*?"<>|'
      );
      return;
    }

    setIsCreating(true);
    try {
      // Call parent's async function
      // Parent handles success (closing modal, refreshing list) and errors
      await onCreateFile(name, fileContent);
    } catch (error) {
      console.error("Error during file creation call:", error);
    } finally {
      // Re-enable button (parent might keep modal open on error)
      setIsCreating(false);
    }
  };

  // Handle closing action
  const handleClose = () => {
    setFileName(""); // Clear local state
    setFileContent("");
    setIsCreating(false);
    onClose(); // Call parent's close handler
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        {/* Wrap modal content in KAV */}
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Create New Text File</Text>
            <TextInput
              style={styles.input}
              placeholder="File Name (.txt)"
              value={fileName}
              onChangeText={setFileName}
              autoCapitalize="none"
              editable={!isCreating}
            />
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Initial Content (optional)"
              value={fileContent}
              onChangeText={setFileContent}
              multiline={true}
              numberOfLines={4}
              editable={!isCreating}
            />
            <View style={styles.modalButtonRow}>
              <Button
                title="Cancel"
                onPress={handleClose}
                color="#888"
                disabled={isCreating}
              />
              <View style={{ marginLeft: 10 }}>
                <Button
                  title={isCreating ? "Creating..." : "Create"}
                  onPress={handleCreate}
                  disabled={isCreating}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

// Styles copied and adapted from your app/index.tsx
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  kavWrapper: {
    // Style KAV to constrain modal size like overlay does
    width: "100%",
    alignItems: "center", // Center the scrollview/modalview
  },
  modalView: {
    marginVertical: 20, // Add vertical margin for scroll/KAV
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "85%", // Keep modal width consistent
    maxHeight: "90%", // Prevent modal from exceeding screen height
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  input: {
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 5,
    fontSize: 16,
  },
  multilineInput: {
    height: 100, // Initial height for multiline
    textAlignVertical: "top", // Align text to top in Android
    paddingTop: 10, // Add padding top
    marginBottom: 20, // Ensure margin at bottom
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end", // Align buttons to the right
    marginTop: 10, // Add margin above buttons
  },
});

export default NewFileModal;
