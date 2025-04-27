import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import * as FileSystem from "expo-file-system";

// Define the base directory path (same as in _layout.tsx)
const baseDir = FileSystem.documentDirectory + "AppData/";

// Define the structure for file system items
interface FileSystemItem {
  name: string;
  uri: string;
  isDirectory: boolean;
}

export default function FileManagerScreen() {
  const [currentPath, setCurrentPath] = useState<string>(baseDir);
  const [items, setItems] = useState<FileSystemItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Function to load items from a directory
  const loadDirectoryItems = useCallback(async (path: string) => {
    console.log("Loading directory:", path);
    setIsLoading(true);
    try {
      const fileNames = await FileSystem.readDirectoryAsync(path);
      const detailedItems: FileSystemItem[] = [];

      for (const name of fileNames) {
        const itemUri = path + name; // Construct full URI
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
          // Log error for individual item but continue loading others
          console.error(`Error getting info for ${itemUri}:`, itemError);
        }
      }

      // Sort items: folders first, then alphabetically
      detailedItems.sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) {
          return a.isDirectory ? -1 : 1; // Folders come first
        }
        return a.name.localeCompare(b.name); // Sort alphabetically
      });

      setItems(detailedItems);
    } catch (error) {
      console.error("Error loading directory items:", error);
      Alert.alert("Error", "Could not load directory contents.");
      // Optional: Handle specific errors, e.g., directory not found
      // If path is not baseDir, maybe offer to go back?
      // setCurrentPath(baseDir); // Example fallback
    } finally {
      setIsLoading(false);
    }
  }, []); // useCallback with empty dependency array as it doesn't depend on props/state outside

  // Load items when the component mounts or currentPath changes
  useEffect(() => {
    loadDirectoryItems(currentPath);
  }, [currentPath, loadDirectoryItems]); // Depend on currentPath and the memoized function

  // Render item function for FlatList
  const renderItem = ({ item }: { item: FileSystemItem }) => (
    <TouchableOpacity style={styles.itemContainer}>
      <Text style={styles.itemIcon}>{item.isDirectory ? "📁" : "📄"}</Text>
      <Text style={styles.itemName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.pathText}>
        Current Path:{" "}
        {currentPath.replace(FileSystem.documentDirectory ?? "", "")}
      </Text>
      {isLoading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : items.length === 0 ? (
        <Text style={styles.emptyText}>Directory is empty</Text>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.uri}
          style={styles.list}
        />
      )}
    </View>
  );
}

// Basic Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  pathText: {
    fontSize: 16,
    marginBottom: 10,
    color: "#555",
    paddingHorizontal: 5,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    flex: 1,
  },
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
  itemIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  itemName: {
    fontSize: 16,
    flexShrink: 1, // Allow text to wrap if needed
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#888",
  },
});
