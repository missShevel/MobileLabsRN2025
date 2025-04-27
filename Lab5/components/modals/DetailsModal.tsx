// src/components/modals/DetailsModal.tsx

import React from "react";
import { Modal, View, Text, Button, StyleSheet, Alert } from "react-native";
import { format } from "date-fns";

// Adjust import paths based on your actual structure
import { ItemDetails } from "../../types/filesystem";
import { formatBytes } from "../../utils/formatters";

interface DetailsModalProps {
  visible: boolean;
  itemDetails: ItemDetails | null;
  onClose: () => void;
  onDelete: (item: ItemDetails) => void; // Function to call after confirmation
}

const DetailsModal: React.FC<DetailsModalProps> = ({
  visible,
  itemDetails,
  onClose,
  onDelete,
}) => {
  // Function to show deletion confirmation (lives inside the modal component)
  const confirmDeletion = () => {
    if (!itemDetails) return; // Should not happen if button is visible, but good check

    const itemType = itemDetails.isDirectory ? "folder" : "file";
    Alert.alert(
      `Confirm Deletion`, // Title
      `Are you sure you want to delete the ${itemType} "${itemDetails.name}"? This cannot be undone.`, // Message [cite: 8]
      [
        // Buttons [cite: 8]
        {
          text: "Cancel",
          onPress: () => console.log("Deletion cancelled"),
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => onDelete(itemDetails), // Call the passed onDelete handler
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose} // Use onClose prop for hardware back button etc.
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Details</Text>
          {itemDetails ? (
            <>
              <Text
                style={styles.detailText}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                Name: {itemDetails.name}
              </Text>
              <Text style={styles.detailText}>Type: {itemDetails.type}</Text>
              {/* Only show size if it exists (usually for files) */}
              {itemDetails.size !== undefined && (
                <Text style={styles.detailText}>
                  Size: {formatBytes(itemDetails.size)}
                </Text>
              )}
              {/* Format modification time */}
              {itemDetails.modificationTime !== undefined && (
                <Text style={styles.detailText}>
                  Modified:{" "}
                  {format(new Date(itemDetails.modificationTime * 1000), "Pp")}
                </Text>
              )}
              <Text style={styles.detailTextUri} selectable={true}>
                URI: {itemDetails.uri}
              </Text>

              {/* Action Buttons */}
              <View style={styles.modalActionRow}>
                <Button title="Close" onPress={onClose} />
                <Button
                  title="Delete"
                  color="#FF3B30" // Red color
                  onPress={confirmDeletion} // Trigger local confirmation
                />
              </View>
            </>
          ) : (
            // Show a loading indicator or placeholder text if itemDetails is null
            <Text style={styles.detailText}>Loading details...</Text>
          )}
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
    padding: 25, // Adjusted padding
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "85%",
  },
  modalTitle: {
    marginBottom: 20, // Adjusted margin
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  detailText: {
    marginBottom: 12, // Adjusted margin
    fontSize: 16,
    textAlign: "left",
  },
  detailTextUri: {
    marginBottom: 20, // Adjusted margin
    fontSize: 12,
    color: "#555",
    textAlign: "left",
    fontStyle: "italic",
  },
  modalActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end", // Align buttons to the right
    marginTop: 15, // Adjusted margin
    paddingTop: 10,
    borderTopColor: "#eee",
    borderTopWidth: 1,
    gap: 10,
  },
});

export default DetailsModal;
