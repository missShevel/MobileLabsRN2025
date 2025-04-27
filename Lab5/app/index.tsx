import React, { useState, useEffect, useCallback, useMemo } from "react";
// Add TextInput to imports
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  Button,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import * as FileSystem from "expo-file-system";
import { format } from "date-fns";

const formatBytes = (bytes: number, decimals = 2): string => {
  /* ... keep existing implementation ... */
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

interface FileSystemItem {
  name: string;
  uri: string;
  isDirectory: boolean;
}
interface ItemDetails extends FileSystemItem {
  size?: number;
  modificationTime?: number;
  type: string;
}

const baseDir = FileSystem.documentDirectory + "AppData/";

export default function FileManagerScreen() {
  const [currentPath, setCurrentPath] = useState<string>(baseDir);
  const [items, setItems] = useState<FileSystemItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false); // Renamed for clarity
  const [selectedItemDetails, setSelectedItemDetails] =
    useState<ItemDetails | null>(null);

  // --- State for New Folder Modal ---
  const [newFolderModalVisible, setNewFolderModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  // ----------------------------------

  // --- State for New File Modal ---
  const [newFileModalVisible, setNewFileModalVisible] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileContent, setNewFileContent] = useState("");
  // --------------------------------

  // --- State for View File Modal ---
  const [viewFileModalVisible, setViewFileModalVisible] = useState(false);
  const [viewingFileUri, setViewingFileUri] = useState<string | null>(null);
  const [viewingFileContent, setViewingFileContent] = useState<string | null>(
    null
  );
  const [isFileLoading, setIsFileLoading] = useState<boolean>(false); // Loading state for file content
  // ---------------------------------

  // --- State for Editing within View File Modal ---
  const [isEditingFile, setIsEditingFile] = useState<boolean>(false);
  const [editedFileContent, setEditedFileContent] = useState<string>("");
  // ---------------------------------------------

  // --- State for Storage Stats ---
  const [totalSpace, setTotalSpace] = useState<number | null>(null);
  const [freeSpace, setFreeSpace] = useState<number | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(true); // Loading state for stats
  // -------------------------------

  // --- Function to fetch storage stats ---
  const fetchStorageStats = async () => {
    console.log("Fetching storage stats...");
    setIsStatsLoading(true);
    try {
      const total = await FileSystem.getTotalDiskCapacityAsync();
      const free = await FileSystem.getFreeDiskStorageAsync();
      setTotalSpace(total);
      setFreeSpace(free);
      console.log(`Storage: Total=${total}, Free=${free}`);
    } catch (error) {
      console.error("Error fetching storage stats:", error);
      Alert.alert("Error", "Could not fetch storage statistics.");
      // Keep stats null or set to 0? Let's keep null to indicate failure.
      setTotalSpace(null);
      setFreeSpace(null);
    } finally {
      setIsStatsLoading(false);
    }
  };
  // -------------------------------------

  // --- useEffect for fetching stats on mount ---
  useEffect(() => {
    fetchStorageStats(); // Fetch stats when the component mounts
  }, []); // Empty dependency array ensures it runs only once
  // -------------------------------------------

  const readFileContent = async (item: FileSystemItem) => {
    console.log("Reading file:", item.uri);
    setViewingFileUri(item.uri); // Store URI to get name later if needed
    setIsEditingFile(false);
    setIsFileLoading(true); // Start loading file content
    setViewingFileContent(null); // Clear previous content
    setViewFileModalVisible(true); // Show modal immediately

    try {
      const content = await FileSystem.readAsStringAsync(item.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      setViewingFileContent(content);
    } catch (error: any) {
      console.error("Error reading file:", error);
      Alert.alert("Error Reading File", "Could not read the file content.");
      setViewingFileContent("Error: Could not load content."); // Show error in modal
      // Optional: close modal on error after a delay? setViewFileModalVisible(false);
    } finally {
      setIsFileLoading(false); // Stop loading file content
    }
  };

  const handleDeleteItem = async (itemToDelete: ItemDetails | null) => {
    if (!itemToDelete) {
      Alert.alert("Error", "No item selected for deletion.");
      return;
    }

    console.log("Attempting to delete item:", itemToDelete.uri);
    try {
      await FileSystem.deleteAsync(itemToDelete.uri, { idempotent: true });
      console.log("Item deleted successfully");
      Alert.alert("Success", `"${itemToDelete.name}" deleted successfully.`);
      setDetailsModalVisible(false); // Close details modal after deletion
      setSelectedItemDetails(null); // Clear selected item
      loadDirectoryItems(currentPath); // Refresh the list
      await fetchStorageStats();
    } catch (error: any) {
      console.error("Error deleting item:", error);
      Alert.alert("Error", `Could not delete "${itemToDelete.name}".`);
      setDetailsModalVisible(false); // Close modal even on error
      setSelectedItemDetails(null);
    }
  };

  const handleSaveFile = async () => {
    if (!viewingFileUri) {
      Alert.alert("Error", "No file URI specified for saving.");
      return;
    }
    console.log("Saving file:", viewingFileUri);
    setIsFileLoading(true); // Use loading indicator during save

    try {
      await FileSystem.writeAsStringAsync(viewingFileUri, editedFileContent);
      console.log("File saved successfully");
      setViewingFileContent(editedFileContent); // Update the view content
      setIsEditingFile(false); // Exit edit mode
      Alert.alert("Success", "File saved successfully.");
    } catch (error: any) {
      console.error("Error saving file:", error);
      Alert.alert("Error Saving File", "Could not save changes.");
      // Stay in edit mode on error
    } finally {
      setIsFileLoading(false); // Stop loading indicator
    }
  };

  // --- Function to show deletion confirmation ---
  const confirmDeletion = (itemToConfirm: ItemDetails | null) => {
    if (!itemToConfirm) return;

    const itemType = itemToConfirm.isDirectory ? "folder" : "file";
    Alert.alert(
      `Confirm Deletion`, // Title
      `Are you sure you want to delete the ${itemType} "${itemToConfirm.name}"? This cannot be undone.`, // Message [cite: 8]
      [
        // Buttons [cite: 8]
        {
          text: "Cancel",
          onPress: () => console.log("Deletion cancelled"),
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => handleDeleteItem(itemToConfirm), // Call delete function on confirm
          style: "destructive", // iOS style hint
        },
      ],
      { cancelable: true } // Allow dismissing by tapping outside on Android
    );
  };
  // ------------------------------------------

  const loadDirectoryItems = useCallback(
    /* ... keep existing implementation ... */ async (path: string) => {
      setIsLoading(true); // Make sure loading starts
      console.log("Loading directory:", path);
      try {
        const normalizedPath = path.endsWith("/") ? path : path + "/";
        const fileNames = await FileSystem.readDirectoryAsync(normalizedPath);
        const detailedItems: FileSystemItem[] = [];
        for (const name of fileNames) {
          const itemUri = normalizedPath + name;
          try {
            const info = await FileSystem.getInfoAsync(itemUri);
            if (info.exists) {
              detailedItems.push({
                name: name,
                uri: info.uri,
                isDirectory: info.isDirectory,
              });
            }
          } catch (itemError) {
            console.error(`Error getting info for ${itemUri}:`, itemError);
          }
        }
        detailedItems.sort((a, b) => {
          if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
        setItems(detailedItems);
      } catch (error) {
        console.error(`Error loading directory items at path ${path}:`, error);
        Alert.alert(
          "Error",
          `Could not load directory contents for ${path.replace(
            FileSystem.documentDirectory ?? "",
            ""
          )}.`
        );
        if (path !== baseDir) {
          handleGoUp();
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleNavigateToDirectory = (item: FileSystemItem) => {
    if (item.isDirectory) {
      const newPath = item.uri.endsWith("/") ? item.uri : item.uri + "/";
      setCurrentPath(newPath);
    } else {
      // Check if it's a .txt file
      if (item.name.toLowerCase().endsWith(".txt")) {
        readFileContent(item); // Call the read function
      } else {
        // Handle other file types (optional)
        Alert.alert(
          "Cannot Open File",
          `Cannot open files of type "${
            item.name.split(".").pop() || "unknown"
          }".`
        );
      }
    }
  };

  const getFileNameFromUri = (uri: string | null): string => {
    if (!uri) return "";
    return uri.split("/").pop() || "";
  };

  // Function to handle navigating up (Corrected Version)
  const handleGoUp = () => {
    // Prevent going up from the base directory
    if (currentPath === baseDir) {
      console.log("Already at base directory");
      return;
    }

    // Make a temporary copy to manipulate
    let path = currentPath;

    // Remove trailing slash (if it exists) to find the last directory segment
    path = path.endsWith("/") ? path.substring(0, path.length - 1) : path;

    // Find the index of the last '/'
    const lastSlashIndex = path.lastIndexOf("/");

    // Check if we found a slash and it's not part of the 'file:///' prefix
    // (Ensures we don't go above the documentDirectory root accidentally)
    if (lastSlashIndex > "file://".length) {
      // Get the parent path by slicing up to and including the last slash
      const parentPath = path.substring(0, lastSlashIndex + 1);

      // Double check if the calculated parent is somehow shorter than baseDir, default to baseDir
      if (parentPath.length >= baseDir.length) {
        console.log("Navigating up to:", parentPath);
        setCurrentPath(parentPath);
      } else {
        console.log(
          "Calculated parent path is too short, going to baseDir:",
          baseDir
        );
        setCurrentPath(baseDir);
      }
    } else {
      // If no suitable slash found, assume parent is the base directory
      console.log("No higher directory found, going to baseDir:", baseDir);
      setCurrentPath(baseDir);
    }
  };

  const fetchAndShowDetails = async (item: FileSystemItem) => {
    /* ... keep existing implementation ... */
    console.log("Fetching details for:", item.uri);
    try {
      const info = await FileSystem.getInfoAsync(item.uri, { size: true });
      if (!info.exists) {
        Alert.alert("Error", "Item no longer exists.");
        return;
      }
      let type = info.isDirectory
        ? "Folder"
        : item.name.split(".").pop()
        ? `.${item.name.split(".").pop()}`
        : "File";
      const details: ItemDetails = {
        name: item.name,
        uri: info.uri,
        isDirectory: info.isDirectory,
        size: info.size,
        modificationTime: info.modificationTime,
        type: type,
      };
      setSelectedItemDetails(details);
      setDetailsModalVisible(true); // Use renamed state setter
    } catch (error: any) {
      console.error("Error fetching details:", error);
      Alert.alert("Error", "Could not fetch item details.");
    }
  };

  // --- Function to handle folder creation ---
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      Alert.alert("Invalid Name", "Folder name cannot be empty.");
      return;
    }
    // Basic check for invalid characters (optional, adjust as needed)
    if (/[\\/:\*\?"<>\|]/.test(newFolderName)) {
      Alert.alert("Invalid Name", "Folder name contains invalid characters.");
      return;
    }

    const newFolderPath = currentPath + newFolderName; // Construct path
    console.log("Attempting to create folder:", newFolderPath);

    try {
      await FileSystem.makeDirectoryAsync(newFolderPath, {
        intermediates: true,
      });
      console.log("Folder created successfully");
      setNewFolderModalVisible(false); // Close modal
      setNewFolderName(""); // Clear input
      loadDirectoryItems(currentPath); // Refresh the list
      await fetchStorageStats();
    } catch (error: any) {
      console.error("Error creating folder:", error);
      // Check for specific errors if possible, e.g., file exists
      if (error.code === "EEXIST") {
        Alert.alert(
          "Error",
          `An item named "${newFolderName}" already exists.`
        );
      } else if (error.code === "EPERM") {
        Alert.alert("Error", "Permission denied.");
      } else {
        Alert.alert("Error", "Could not create folder.");
      }
    }
  };
  // ---------------------------------------

  const handleCreateFile = async () => {
    let fileName = newFileName.trim();
    if (!fileName) {
      Alert.alert("Invalid Name", "File name cannot be empty.");
      return;
    }

    // Ensure filename ends with .txt
    if (!fileName.endsWith(".txt")) {
      fileName += ".txt";
    }

    // Optional: Basic check for invalid characters
    if (/[\\/:\*\?"<>\|]/.test(fileName.replace(".txt", ""))) {
      // Check name part without extension
      Alert.alert("Invalid Name", "File name contains invalid characters.");
      return;
    }

    const newFilePath = currentPath + fileName;
    console.log("Attempting to create file:", newFilePath);

    try {
      await FileSystem.writeAsStringAsync(newFilePath, newFileContent);
      console.log("File created successfully");
      setNewFileModalVisible(false); // Close modal
      setNewFileName(""); // Clear inputs
      setNewFileContent("");
      loadDirectoryItems(currentPath); // Refresh the list
      await fetchStorageStats();
    } catch (error: any) {
      console.error("Error creating file:", error);
      if (error.code === "EEXIST") {
        // Although write should overwrite, good to check context
        Alert.alert(
          "Error",
          `An item named "${fileName}" might already exist or is a directory.`
        );
      } else if (error.code === "EPERM") {
        Alert.alert("Error", "Permission denied.");
      } else {
        Alert.alert("Error", "Could not create file.");
      }
    }
  };

  const usedSpace = useMemo(
    () =>
      totalSpace !== null && freeSpace !== null ? totalSpace - freeSpace : 0,
    [totalSpace, freeSpace]
  );

  useEffect(() => {
    /* ... keep existing implementation ... */
    console.log("App's Document Directory Base:", FileSystem.documentDirectory);
    console.log("Current navigation path:", currentPath);
    loadDirectoryItems(currentPath);
  }, [currentPath, loadDirectoryItems]);

  const renderItem = (
    {
      item,
    }: { item: FileSystemItem } /* ... keep existing implementation ... */
  ) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleNavigateToDirectory(item)}
      onLongPress={() => fetchAndShowDetails(item)}
    >
      <Text style={styles.itemIcon}>{item.isDirectory ? "📁" : "📄"}</Text>
      <Text style={styles.itemName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const displayPath = currentPath
    .replace(FileSystem.documentDirectory ?? "", "")
    .replace(/\/$/, "");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        {/* Details Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={detailsModalVisible} // Use renamed state variable
          onRequestClose={() => setDetailsModalVisible(false)}
        >
          {/* ... keep existing Modal content ... */}
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Details</Text>
              {selectedItemDetails ? (
                <>
                  <Text style={styles.detailText}>
                    Name: {selectedItemDetails.name}
                  </Text>
                  <Text style={styles.detailText}>
                    Type: {selectedItemDetails.type}
                  </Text>
                  {selectedItemDetails.size !== undefined && (
                    <Text style={styles.detailText}>
                      {" "}
                      Size: {formatBytes(selectedItemDetails.size)}{" "}
                    </Text>
                  )}
                  {selectedItemDetails.modificationTime !== undefined && (
                    <Text style={styles.detailText}>
                      {" "}
                      Modified:{" "}
                      {format(
                        new Date(selectedItemDetails.modificationTime * 1000),
                        "Pp"
                      )}{" "}
                    </Text>
                  )}
                  <Text style={styles.detailTextUri}>
                    URI: {selectedItemDetails.uri}
                  </Text>
                </>
              ) : (
                <Text>Loading details...</Text>
              )}
              <Button
                title="Close"
                onPress={() => setDetailsModalVisible(false)}
              />
              <View style={{ height: 10 }} />
              <Button
                title="Delete"
                color="#FF3B30" // Red color for destructive action
                onPress={() => confirmDeletion(selectedItemDetails)} // Trigger confirmation
              />
            </View>
          </View>
        </Modal>

        {/* --- New Folder Modal --- */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={newFolderModalVisible}
          onRequestClose={() => {
            setNewFolderModalVisible(false);
            setNewFolderName(""); // Clear input on close
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Create New Folder</Text>
              <TextInput
                style={styles.input}
                placeholder="Folder Name"
                value={newFolderName}
                onChangeText={setNewFolderName}
                autoCapitalize="none"
              />
              <View style={styles.modalButtonRow}>
                <Button
                  title="Cancel"
                  onPress={() => {
                    setNewFolderModalVisible(false);
                    setNewFolderName(""); // Clear input on cancel
                  }}
                  color="#888"
                />
                <View style={{ width: 10 }} /> {/* Spacer */}
                <Button title="Create" onPress={handleCreateFolder} />
              </View>
            </View>
          </View>
        </Modal>
        {/* ------------------------ */}

        {/* --- New File Modal --- */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={newFileModalVisible}
          onRequestClose={() => {
            setNewFileModalVisible(false);
            setNewFileName("");
            setNewFileContent("");
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Create New Text File</Text>
              <TextInput
                style={styles.input}
                placeholder="File Name (.txt)"
                value={newFileName}
                onChangeText={setNewFileName}
                autoCapitalize="none"
              />
              <TextInput
                style={[styles.input, styles.multilineInput]} // Add multiline style
                placeholder="Initial Content (optional)"
                value={newFileContent}
                onChangeText={setNewFileContent}
                multiline={true} // Enable multiline
                numberOfLines={4} // Suggest initial height
              />
              <View style={styles.modalButtonRow}>
                <Button
                  title="Cancel"
                  onPress={() => {
                    setNewFileModalVisible(false);
                    setNewFileName("");
                    setNewFileContent("");
                  }}
                  color="#888"
                />
                <View style={{ width: 10 }} />
                <Button title="Create" onPress={handleCreateFile} />
              </View>
            </View>
          </View>
        </Modal>
        {/* ---------------------- */}

        {/* --- View File Modal --- */}
        <Modal
          animationType="slide"
          transparent={false} // Usually false for full screen view
          visible={viewFileModalVisible}
          onRequestClose={() => {
            if (isEditingFile) {
              // Ask for confirmation if editing
              Alert.alert(
                "Discard Changes?",
                "Are you sure you want to close without saving changes?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Discard",
                    onPress: () => {
                      setIsEditingFile(false);
                      setViewFileModalVisible(false);
                    },
                    style: "destructive",
                  },
                ]
              );
            } else {
              setViewFileModalVisible(false);
            }
            // Reset state if not editing or discarded
            if (!isEditingFile) {
              setViewingFileUri(null);
              setViewingFileContent(null);
              setIsEditingFile(false); // Ensure edit mode is off
            }
          }}
        >
          <View style={styles.fileViewContainer}>
            {/* Header with Filename and Action Buttons */}
            <View style={styles.fileViewHeader}>
              <Text
                style={styles.fileViewTitle}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {getFileNameFromUri(viewingFileUri)}
              </Text>
              {/* Conditional Buttons based on edit mode */}
              {isEditingFile ? (
                <View style={styles.headerButtonRow}>
                  <Button
                    title="Cancel"
                    onPress={() => setIsEditingFile(false)}
                    color="#888"
                  />
                  <View style={{ width: 10 }} />
                  <Button
                    title="Save"
                    onPress={handleSaveFile}
                    disabled={isFileLoading}
                  />
                </View>
              ) : (
                <View style={styles.headerButtonRow}>
                  <Button
                    title="Edit"
                    onPress={() => {
                      setEditedFileContent(viewingFileContent ?? ""); // Initialize editor
                      setIsEditingFile(true);
                    }}
                    disabled={isFileLoading || viewingFileContent === null} // Disable if loading or content failed
                  />
                  <View style={{ width: 10 }} />
                  <Button
                    title="Close"
                    onPress={() => setViewFileModalVisible(false)}
                  />
                </View>
              )}
            </View>

            {/* Content Area */}
            <ScrollView
              style={styles.fileContentScrollView}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              {isFileLoading && !isEditingFile ? ( // Show loader only when loading initial content
                <ActivityIndicator
                  size="large"
                  style={styles.fileContentLoader}
                />
              ) : isEditingFile ? (
                // --- Editing View ---
                <TextInput
                  style={styles.fileEditTextInput}
                  value={editedFileContent}
                  onChangeText={setEditedFileContent}
                  multiline={true}
                  autoFocus={true} // Focus input when editing starts
                  textAlignVertical="top" // Android alignment
                />
              ) : (
                // --------------------
                // --- Reading View ---
                <Text style={styles.fileContentText} selectable={true}>
                  {viewingFileContent ?? "Could not load content."}
                </Text>
                // ------------------
              )}
            </ScrollView>
            {isFileLoading && isEditingFile && (
              <ActivityIndicator
                size="small"
                color="#007AFF"
                style={{
                  position: "absolute",
                  bottom: 10,
                  alignSelf: "center",
                }}
              />
            )}
          </View>
        </Modal>
        {/* ----------------------- */}

        {/* --- Button Row --- */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.button,
              currentPath === baseDir && styles.buttonDisabled,
            ]}
            onPress={handleGoUp}
            disabled={currentPath === baseDir}
          >
            <Text style={styles.buttonText}>⬆️ Go Up</Text>
          </TouchableOpacity>

          {/* Add New Folder Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setNewFolderName(""); // Clear name before opening
              setNewFolderModalVisible(true);
            }}
          >
            <Text style={styles.buttonText}>➕ New Folder</Text>
          </TouchableOpacity>

          {/* --- Add New File Button --- */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setNewFileName(""); // Clear inputs before opening
              setNewFileContent("");
              setNewFileModalVisible(true);
            }}
          >
            <Text style={styles.buttonText}>➕ New File</Text>
          </TouchableOpacity>
          {/* --------------------------- */}
        </View>
        {/* ------------------ */}

        <Text style={styles.pathText}>Path: {displayPath || "AppData"}</Text>

        {isLoading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.uri}
            style={styles.list}
          />
        )}

        {/* --- Storage Stats Area --- */}
        <View style={styles.statsArea}>
          {isStatsLoading ? (
            <ActivityIndicator size="small" />
          ) : totalSpace !== null && freeSpace !== null ? (
            <>
              <Text style={styles.statsText}>
                Storage: {formatBytes(usedSpace)} Used /{" "}
                {formatBytes(totalSpace)} Total ({formatBytes(freeSpace)} Free)
              </Text>
            </>
          ) : (
            <Text style={styles.statsText}>Storage info unavailable.</Text>
          )}
        </View>
        {/* ----------------------- */}
      </View>
    </KeyboardAvoidingView>
  );
}

// --- Add/Update Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  buttonRow: {
    // Style for holding buttons horizontally
    flexDirection: "row",
    justifyContent: "space-around", // Space out buttons
    paddingVertical: 5, // Add padding
    marginHorizontal: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    // margin: 10, // Removed margin for row layout
    alignItems: "center",
    flex: 1, // Allow buttons to grow
    marginHorizontal: 5, // Add horizontal spacing between buttons
  },
  buttonDisabled: { backgroundColor: "#a0a0a0" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  pathText: {
    fontSize: 14,
    marginHorizontal: 10,
    marginBottom: 5,
    color: "#555",
    paddingHorizontal: 5,
    fontStyle: "italic",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  list: { flex: 1, marginHorizontal: 10 },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    borderRadius: 5,
    marginBottom: 5,
  },
  itemIcon: { fontSize: 20, marginRight: 10 },
  itemName: { fontSize: 16, flexShrink: 1 },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#888",
  },
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
  }, // Increased bottom margin
  detailText: { marginBottom: 10, fontSize: 16, textAlign: "left" },
  detailTextUri: {
    marginBottom: 15,
    fontSize: 12,
    color: "#555",
    textAlign: "left",
    fontStyle: "italic",
  },
  // --- New Folder Modal Styles ---
  input: {
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 20, // Increased margin
    paddingHorizontal: 15, // Increased padding
    borderRadius: 5,
    fontSize: 16,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end", // Align buttons to the right
    marginTop: 10, // Add margin above buttons
  },
  multilineInput: {
    height: 100, // Initial height for multiline
    textAlignVertical: "top", // Align text to top in Android
    paddingTop: 10, // Add padding top
  },
  fileViewContainer: {
    flex: 1,
    marginTop: 40, // Add margin for status bar area
    backgroundColor: "#fff",
  },
  fileViewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#f8f8f8", // Light header background
  },
  fileViewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1, // Allow title to take space
    marginRight: 10, // Space before button
  },
  fileContentScrollView: {
    flex: 1,
    padding: 15, // Padding around content
  },
  fileContentLoader: {
    marginTop: 50, // Space loader down
  },
  fileContentText: {
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace", // Monospace font for code/text
    color: "#333",
  },
  modalActionRow: {
    flexDirection: "row",
    justifyContent: "space-between", // Space out Close and Delete
    marginTop: 20, // Add margin above buttons
    paddingTop: 10, // Add padding top
    borderTopColor: "#eee", // Separator line
    borderTopWidth: 1,
  },
  fileEditTextInput: {
    flex: 1, // Take up available space in ScrollView
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    color: "#333",
    padding: 15,
    textAlignVertical: "top", // Important for Android multiline
  },
  headerButtonRow: {
    // Style for buttons in header
    flexDirection: "row",
  },
  // --- Storage Stats Area Styles ---
  statsArea: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    backgroundColor: "#f8f8f8", // Slightly different background
  },
  statsText: {
    fontSize: 13,
    color: "#333",
    textAlign: "center",
  },
  refreshButton: {
    padding: 5,
  },
  refreshButtonText: {
    fontSize: 18, // Adjust size as needed
  },
});
