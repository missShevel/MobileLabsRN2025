import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import * as FileSystem from 'expo-file-system';

// Ensure baseDir ends with a slash for consistent path joining
const baseDir = FileSystem.documentDirectory + 'AppData/'; // Should already end with /

interface FileSystemItem {
  name: string;
  uri: string;
  isDirectory: boolean;
}

export default function FileManagerScreen() {
  const [currentPath, setCurrentPath] = useState<string>(baseDir);
  const [items, setItems] = useState<FileSystemItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Function to load items (Keep previous implementation)
  const loadDirectoryItems = useCallback(async (path: string) => {
    console.log('Loading directory:', path);
    setIsLoading(true);
    try {
      // --- Ensure path ends with a slash if it's meant to be a directory ---
      // (Usually FileSystem functions handle this, but good for consistency)
      const normalizedPath = path.endsWith('/') ? path : path + '/';
      // -------------------------------------------------------------------

      const fileNames = await FileSystem.readDirectoryAsync(normalizedPath); // Use normalizedPath
      const detailedItems: FileSystemItem[] = [];

      for (const name of fileNames) {
          // --- Construct itemUri carefully ---
          const itemUri = normalizedPath + name; // Build path using the normalized current path
          // -----------------------------------
        try {
          const info = await FileSystem.getInfoAsync(itemUri);
          if (info.exists) {
            detailedItems.push({
              name: name,
              uri: info.uri, // Store the canonical URI from getInfoAsync
              isDirectory: info.isDirectory,
            });
          }
        } catch (itemError) {
          console.error(`Error getting info for ${itemUri}:`, itemError);
        }
      }

      detailedItems.sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) {
          return a.isDirectory ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      setItems(detailedItems);
    } catch (error) {
      console.error(`Error loading directory items at path ${path}:`, error);
      Alert.alert('Error', `Could not load directory contents for ${path.replace(FileSystem.documentDirectory ?? '', '')}.`);
      // --- More robust error handling: try going back if not in baseDir ---
      if (path !== baseDir) {
          handleGoUp(); // Attempt to go back up if loading failed
      }
      // --------------------------------------------------------------------
    } finally {
      setIsLoading(false);
    }
  }, []); // Keep empty dependency array

  // Function to handle navigating into a folder
  const handleNavigateToDirectory = (item: FileSystemItem) => {
    if (item.isDirectory) {
       // --- Use item.uri which should be correct, ensure it ends with / ---
       const newPath = item.uri.endsWith('/') ? item.uri : item.uri + '/';
       console.log('Navigating to:', newPath);
       setCurrentPath(newPath);
       // --------------------------------------------------------------------
    } else {
      // Later, handle file opening here
      console.log('Tapped on file:', item.name);
      Alert.alert("File Tapped", `You tapped on the file: ${item.name}\n(Opening not implemented yet)`);
    }
  };

  // Function to handle navigating up
  const handleGoUp = () => {
    // Prevent going up from the base directory
    if (currentPath === baseDir) {
      console.log('Already at base directory');
      return;
    }

    // Find the second to last slash to get the parent directory path
    const pathSegments = currentPath.split('/').filter(segment => segment !== ''); // Split and remove empty strings
    pathSegments.pop(); // Remove the last segment (current folder name)
    const parentPath = 'file:///' + pathSegments.join('/') + '/'; // Reconstruct path starting with file:/// and ending with /

    console.log('Navigating up to:', parentPath);
    setCurrentPath(parentPath);
  };


  // Load items when the component mounts or currentPath changes
  useEffect(() => {
    // Log the directory path before loading
    console.log("App's Document Directory Base:", FileSystem.documentDirectory);
    console.log("Current navigation path:", currentPath);
    loadDirectoryItems(currentPath);
  }, [currentPath, loadDirectoryItems]);

  // Render item function for FlatList
  const renderItem = ({ item }: { item: FileSystemItem }) => (
    // --- Make the whole item pressable ---
    <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => handleNavigateToDirectory(item)} // Call navigation handler
    >
      <Text style={styles.itemIcon}>{item.isDirectory ? '📁' : '📄'}</Text>
      <Text style={styles.itemName}>{item.name}</Text>
    </TouchableOpacity>
    // --------------------------------------
  );

  // --- Clean up displayed path slightly ---
  const displayPath = currentPath.replace(FileSystem.documentDirectory ?? '', '').replace(/\/$/, ''); // Remove base and trailing slash
  // ------------------------------------

  return (
    <View style={styles.container}>
        {/* --- Add Go Up Button --- */}
        <TouchableOpacity
            style={[styles.button, currentPath === baseDir && styles.buttonDisabled]} // Style differently when disabled
            onPress={handleGoUp}
            disabled={currentPath === baseDir} // Disable if at base
        >
            <Text style={styles.buttonText}>⬆️ Go Up</Text>
        </TouchableOpacity>
        {/* ----------------------- */}

      <Text style={styles.pathText}>Path: {displayPath || 'AppData'}</Text> {/* Show AppData if displayPath is empty */}

      {/* --- Temporary Check Button (Optional: Remove if not needed) --- */}
       <TouchableOpacity onPress={async () => {
            try {
                const itemsInBase = await FileSystem.readDirectoryAsync(baseDir);
                Alert.alert('Base Dir Contents', `Found: ${itemsInBase.join(', ')}` || 'Empty');
            } catch (e : any) {
                Alert.alert('Error reading base dir', e.message);
            }
        }}>
            <Text style={{ padding: 5, marginBottom: 5, backgroundColor: 'lightblue', textAlign: 'center' }}>
                Check Base Dir Directly
            </Text>
        </TouchableOpacity>
        {/* ------------------------------------------------------------- */}


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

// --- Update Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Apply background to container
  },
  button: {
      backgroundColor: '#007AFF',
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 5,
      margin: 10,
      alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#a0a0a0', // Grey out when disabled
  },
  buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
  },
  pathText: {
    fontSize: 14, // Slightly smaller path text
    marginHorizontal: 10, // Add horizontal margin
    marginBottom: 5, // Reduce bottom margin
    color: '#555',
    paddingHorizontal: 5,
    fontStyle: 'italic', // Italicize path
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50, // Add margin if loader is shown
  },
  list: {
    flex: 1,
    marginHorizontal: 10, // Add margin to list
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderRadius: 5,
    marginBottom: 5,
  },
  itemIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  itemName: {
    fontSize: 16,
    flexShrink: 1,
  },
   emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
});