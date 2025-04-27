// src/components/modals/NewFolderModal.tsx

import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";

interface NewFolderModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateFolder: (folderName: string) => Promise<void>; // Expects the async function from parent
}

const NewFolderModal: React.FC<NewFolderModalProps> = ({
  visible,
  onClose,
  onCreateFolder,
}) => {
  const [folderName, setFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false); // Optional: To disable button during creation

  // Clear input when modal becomes visible/hidden
  useEffect(() => {
    if (!visible) {
      setFolderName(""); // Clear name when modal is closed
      setIsCreating(false); // Reset creating state
    }
  }, [visible]);

  const handleCreate = async () => {
    const trimmedName = folderName.trim();
    if (!trimmedName) {
      Alert.alert("Invalid Name", "Folder name cannot be empty.");
      return;
    }
    // Basic check for invalid characters (optional, adjust as needed)
    if (/[\\/:\*\?"<>\|]/.test(trimmedName)) {
      Alert.alert(
        "Invalid Name",
        'Folder name contains invalid characters: /\\:*?"<>|'
      );
      return;
    }

    setIsCreating(true); // Disable button
    try {
      // Call the async function passed from the parent
      // Parent component (app/index.tsx) will handle closing the modal on success/error
      await onCreateFolder(trimmedName);
      // No need to call onClose here, parent handles it
    } catch (error) {
      // Error alerts are likely handled in the parent's onCreateFolder,
      // but you could add a generic one here if needed.
      console.error("Error during folder creation call:", error);
    } finally {
      // Re-enable button even if parent handles modal closing
      // Parent might keep modal open on specific errors
      setIsCreating(false);
    }
  };

  // Handle closing action (clears state, calls parent onClose)
  const handleClose = () => {
    setFolderName(""); // Clear local state
    setIsCreating(false);
    onClose(); // Call parent's close handler
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose} // Use internal close handler
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Create New Folder</Text>
          <TextInput
            style={styles.input}
            placeholder="Folder Name"
            value={folderName}
            onChangeText={setFolderName}
            autoCapitalize="none"
            onSubmitEditing={handleCreate} // Allow creating via keyboard 'submit'
            editable={!isCreating} // Disable input while creating
          />
          <View style={styles.modalButtonRow}>
            <Button
              title="Cancel"
              onPress={handleClose} // Use internal close handler
              color="#888"
              disabled={isCreating}
            />
            <View style={{ marginLeft: 10 }}>
              <Button
                title={isCreating ? "Creating..." : "Create"}
                onPress={handleCreate}
                disabled={isCreating} // Disable button while creating
              />
            </View>
          </View>
        </View>
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
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "85%",
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
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
});

export default NewFolderModal;
