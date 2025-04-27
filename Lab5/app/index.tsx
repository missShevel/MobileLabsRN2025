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
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import * as FileSystem from "expo-file-system";
import { FileSystemItem, ItemDetails } from "@/types/filesystem";
import { formatBytes } from "@/utils/formatters";
import { baseDir } from "@/constants/files";
import FileListItem from "@/components/FileListItem";
import DetailsModal from "@/components/modals/DetailsModal";
import NewFolderModal from "@/components/modals/NewFolderModal";
import NewFileModal from "@/components/modals/NewFileModal";
import ViewEditFileModal from "@/components/modals/ViewFileModal";

export default function FileManagerScreen() {
  const [currentPath, setCurrentPath] = useState<string>(baseDir);
  const [items, setItems] = useState<FileSystemItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false); // Renamed for clarity
  const [selectedItemDetails, setSelectedItemDetails] =
    useState<ItemDetails | null>(null);

  // --- State for New Folder Modal ---
  const [newFolderModalVisible, setNewFolderModalVisible] = useState(false);
  // ----------------------------------

  // --- State for New File Modal ---
  const [newFileModalVisible, setNewFileModalVisible] = useState(false);
  // --------------------------------

  // --- State for View File Modal ---
  const [viewFileModalVisible, setViewFileModalVisible] = useState(false);
  const [viewingFileUri, setViewingFileUri] = useState<string | null>(null);
  const [viewingFileContent, setViewingFileContent] = useState<string | null>(
    null
  );
  const [isFileLoading, setIsFileLoading] = useState<boolean>(false); // Loading state for file content
  // ---------------------------------

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

  const handleSaveFile = async (fileUri: string, editedFileContent: string) => {
    setIsFileLoading(true); // Use loading indicator during save

    try {
      await FileSystem.writeAsStringAsync(fileUri, editedFileContent);
      console.log("File saved successfully");
      setViewingFileContent(editedFileContent); // Update the view content
      Alert.alert("Success", "File saved successfully.");
      await fetchStorageStats();
    } catch (error: any) {
      console.error("Error saving file:", error);
      Alert.alert("Error Saving File", "Could not save changes.");
      // Stay in edit mode on error
    } finally {
      setIsFileLoading(false); // Stop loading indicator
    }
  };

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
  const handleCreateFolder = async (newFolderName: string) => {
    const newFolderPath = currentPath + newFolderName; // Construct path
    console.log("Attempting to create folder:", newFolderPath);

    try {
      await FileSystem.makeDirectoryAsync(newFolderPath, {
        intermediates: true,
      });
      console.log("Folder created successfully");
      setNewFolderModalVisible(false); // Close modal
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

  const handleCreateFile = async (fileName: string, content: string) => {
    const newFilePath = currentPath + fileName;
    console.log("Attempting to create file:", newFilePath);

    try {
      await FileSystem.writeAsStringAsync(newFilePath, content);
      console.log("File created successfully");
      setNewFileModalVisible(false); // Close modal
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
    <FileListItem
      item={item}
      onPress={handleNavigateToDirectory}
      onLongPress={fetchAndShowDetails}
    />
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
        <DetailsModal
          visible={detailsModalVisible}
          itemDetails={selectedItemDetails}
          onClose={() => setDetailsModalVisible(false)} // Pass the close handler
          onDelete={handleDeleteItem}
        />

        <NewFolderModal
          visible={newFolderModalVisible}
          onClose={() => setNewFolderModalVisible(false)}
          onCreateFolder={handleCreateFolder}
        />

        <NewFileModal
          visible={newFileModalVisible}
          onClose={() => setNewFileModalVisible(false)}
          onCreateFile={handleCreateFile}
        />

        <ViewEditFileModal
          visible={viewFileModalVisible}
          fileUri={viewingFileUri}
          initialContent={viewingFileContent}
          isLoading={isFileLoading}
          onClose={() => {
            setViewFileModalVisible(false);
          }}
          onSave={handleSaveFile}
        />

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
              setNewFolderModalVisible(true);
            }}
          >
            <Text style={styles.buttonText}>➕ New Folder</Text>
          </TouchableOpacity>

          {/* --- Add New File Button --- */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
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
    gap: 10,
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
