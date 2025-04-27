// src/components/modals/ViewEditFileModal.tsx

import { getFileNameFromUri } from "@/utils/files";
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView, // Keep KAV for editing
} from "react-native";

// Adjust import paths based on your actual structure

interface ViewEditFileModalProps {
  visible: boolean;
  fileUri: string | null; // URI of the file being viewed/edited
  initialContent: string | null; // Content loaded by the parent
  isLoading: boolean; // Loading state from parent (for initial load)
  onClose: () => void; // Parent handler to close the modal
  onSave: (uri: string, newContent: string) => Promise<void>; // Parent handler to save content
}

const ViewEditFileModal: React.FC<ViewEditFileModalProps> = ({
  visible,
  fileUri,
  initialContent,
  isLoading, // Loading state for initial content fetch
  onClose,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [isSaving, setIsSaving] = useState(false); // Internal saving state

  // Effect to reset state when modal becomes hidden or file changes
  useEffect(() => {
    if (!visible) {
      setIsEditing(false); // Ensure edit mode is off when closed
      setEditedContent(""); // Clear content
    }
  }, [visible]);

  // Effect to initialize editor content when editing starts or initial content loads
  useEffect(() => {
    if (isEditing) {
      // When entering edit mode, start with the currently viewed content
      setEditedContent(initialContent ?? "");
    }
    // Dependency on initialContent ensures editor updates if file is reloaded while modal open
    // Dependency on isEditing ensures it initializes when Edit button is clicked
  }, [isEditing, initialContent]);

  const handleSave = async () => {
    if (!fileUri) return; // Should not happen if modal is visible

    setIsSaving(true);
    try {
      // Call the parent's save function
      await onSave(fileUri, editedContent);
      // Parent's onSave should update the 'initialContent' prop via state,
      // triggering the useEffect above to potentially sync view mode.
      // Exit edit mode after successful save.
      setIsEditing(false);
    } catch (error) {
      // Error alerts likely handled in parent's onSave
      console.error("Error during save call:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle hardware back press or modal request close
  const handleCloseRequest = () => {
    if (isEditing) {
      Alert.alert(
        "Discard Changes?",
        "Are you sure you want to close without saving changes?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            onPress: () => {
              setIsEditing(false); // Exit edit mode first
              onClose(); // Then call parent close
            },
            style: "destructive",
          },
        ]
      );
    } else {
      onClose(); // Just close if not editing
    }
  };

  const fileName = getFileNameFromUri(fileUri);

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={handleCloseRequest}
    >
      {/* KAV specifically for the editing view */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }} // KAV needs flex 1 to manage height/padding
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25} // Adjust offset if header is covered
      >
        <View style={styles.fileViewContainer}>
          {/* Header */}
          <View style={styles.fileViewHeader}>
            <Text
              style={styles.fileViewTitle}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {fileName}
            </Text>
            {isEditing ? (
              <View style={styles.headerButtonRow}>
                <Button
                  title="Cancel"
                  onPress={() => setIsEditing(false)} // Simply exit edit mode
                  color="#888"
                  disabled={isSaving}
                />
                <View style={{ marginLeft: 10 }}>
                  <Button
                    title={isSaving ? "Saving..." : "Save"}
                    onPress={handleSave}
                    disabled={isSaving} // Disable while saving
                  />
                </View>
              </View>
            ) : (
              <View style={styles.headerButtonRow}>
                <Button
                  title="Edit"
                  onPress={() => setIsEditing(true)} // Enter edit mode
                  disabled={isLoading || initialContent === null} // Disable if loading initial content or load failed
                />
                <View style={{ width: 10 }} />
                <Button
                  title="Close"
                  onPress={handleCloseRequest} // Use controlled close
                />
              </View>
            )}
          </View>

          {/* Content Area */}
          <ScrollView
            style={styles.fileContentScrollView}
            contentContainerStyle={styles.scrollViewContent} // Ensure content can grow
            keyboardShouldPersistTaps="handled" // Helps with focus inside ScrollView
          >
            {isLoading ? ( // Show loader only on initial load
              <ActivityIndicator
                size="large"
                style={styles.fileContentLoader}
              />
            ) : isEditing ? (
              <TextInput
                style={styles.fileEditTextInput}
                value={editedContent}
                onChangeText={setEditedContent}
                multiline={true}
                autoFocus={true}
                textAlignVertical="top"
                editable={!isSaving} // Disable input while saving
              />
            ) : (
              <Text style={styles.fileContentText} selectable={true}>
                {initialContent ?? "Error: Could not load content."}
              </Text>
            )}
          </ScrollView>
          {/* Optional: Show saving indicator */}
          {isSaving && (
            <ActivityIndicator
              size="small"
              color="#007AFF"
              style={styles.savingIndicator}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Styles copied and adapted from your app/index.tsx
const styles = StyleSheet.create({
  fileViewContainer: {
    flex: 1,
    // Removed marginTop here, handle safe area with KAV offset or SafeAreaView if needed
    backgroundColor: "#fff",
  },
  fileViewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#f8f8f8",
    minHeight: 50,
    marginTop: Platform.OS === "ios" ? 40 : 0, // Add margin for iOS status bar manually if not using SafeAreaView
  },
  fileViewTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    marginRight: 10,
  },
  headerButtonRow: {
    flexDirection: "row",
    alignItems: "center", // Align buttons vertically if needed
  },
  fileContentScrollView: {
    flex: 1, // ScrollView takes remaining space
  },
  scrollViewContent: {
    flexGrow: 1, // Ensure content area can grow to fill ScrollView
    padding: 15, // Padding inside the scroll area
  },
  fileContentLoader: {
    marginTop: 50,
  },
  fileContentText: {
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    color: "#333",
    // Removed padding here, added to scrollViewContent
  },
  fileEditTextInput: {
    flex: 1, // Allow text input to grow within scroll view padding
    minHeight: 200, // Ensure a minimum height for the text input
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    color: "#333",
    textAlignVertical: "top",
  },
  savingIndicator: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    padding: 5,
    backgroundColor: "rgba(200, 200, 200, 0.5)", // Optional background
    borderRadius: 15,
  },
});

export default ViewEditFileModal;
