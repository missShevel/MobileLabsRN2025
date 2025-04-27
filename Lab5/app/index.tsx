import React, { useState, useEffect, useCallback } from 'react';
// Add TextInput to imports
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Modal, Button, TextInput } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { format } from 'date-fns';

const formatBytes = (bytes: number, decimals = 2): string => { /* ... keep existing implementation ... */
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

interface FileSystemItem { name: string; uri: string; isDirectory: boolean; }
interface ItemDetails extends FileSystemItem { size?: number; modificationTime?: number; type: string; }

const baseDir = FileSystem.documentDirectory + 'AppData/';

export default function FileManagerScreen() {
  const [currentPath, setCurrentPath] = useState<string>(baseDir);
  const [items, setItems] = useState<FileSystemItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false); // Renamed for clarity
  const [selectedItemDetails, setSelectedItemDetails] = useState<ItemDetails | null>(null);

  // --- State for New Folder Modal ---
  const [newFolderModalVisible, setNewFolderModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  // ----------------------------------

  const loadDirectoryItems = useCallback( /* ... keep existing implementation ... */ async (path: string) => {
        setIsLoading(true); // Make sure loading starts
        console.log('Loading directory:', path);
        try {
          const normalizedPath = path.endsWith('/') ? path : path + '/';
          const fileNames = await FileSystem.readDirectoryAsync(normalizedPath);
          const detailedItems: FileSystemItem[] = [];
          for (const name of fileNames) {
              const itemUri = normalizedPath + name;
            try {
              const info = await FileSystem.getInfoAsync(itemUri);
              if (info.exists) {
                detailedItems.push({ name: name, uri: info.uri, isDirectory: info.isDirectory });
              }
            } catch (itemError) { console.error(`Error getting info for ${itemUri}:`, itemError); }
          }
          detailedItems.sort((a, b) => {
            if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
            return a.name.localeCompare(b.name);
          });
          setItems(detailedItems);
        } catch (error) {
          console.error(`Error loading directory items at path ${path}:`, error);
          Alert.alert('Error', `Could not load directory contents for ${path.replace(FileSystem.documentDirectory ?? '', '')}.`);
          if (path !== baseDir) { handleGoUp(); }
        } finally { setIsLoading(false); }
      }, []);


  const handleNavigateToDirectory = (item: FileSystemItem) => { /* ... keep existing implementation ... */
    if (item.isDirectory) {
       const newPath = item.uri.endsWith('/') ? item.uri : item.uri + '/';
       setCurrentPath(newPath);
    } else { Alert.alert("File Tapped", `File: ${item.name}\n(Opening not implemented)`); }
  };

  // Function to handle navigating up (Corrected Version)
  const handleGoUp = () => {
    // Prevent going up from the base directory
    if (currentPath === baseDir) {
      console.log('Already at base directory');
      return;
    }

    // Make a temporary copy to manipulate
    let path = currentPath;

    // Remove trailing slash (if it exists) to find the last directory segment
    path = path.endsWith('/') ? path.substring(0, path.length - 1) : path;

    // Find the index of the last '/'
    const lastSlashIndex = path.lastIndexOf('/');

    // Check if we found a slash and it's not part of the 'file:///' prefix
    // (Ensures we don't go above the documentDirectory root accidentally)
    if (lastSlashIndex > 'file://'.length) {
        // Get the parent path by slicing up to and including the last slash
        const parentPath = path.substring(0, lastSlashIndex + 1);

        // Double check if the calculated parent is somehow shorter than baseDir, default to baseDir
        if (parentPath.length >= baseDir.length) {
            console.log('Navigating up to:', parentPath);
            setCurrentPath(parentPath);
        } else {
             console.log('Calculated parent path is too short, going to baseDir:', baseDir);
             setCurrentPath(baseDir);
        }

    } else {
        // If no suitable slash found, assume parent is the base directory
        console.log('No higher directory found, going to baseDir:', baseDir);
        setCurrentPath(baseDir);
    }
  };

  const fetchAndShowDetails = async (item: FileSystemItem) => { /* ... keep existing implementation ... */
        console.log('Fetching details for:', item.uri);
        try {
            const info = await FileSystem.getInfoAsync(item.uri, { size: true });
            if (!info.exists) { Alert.alert('Error', 'Item no longer exists.'); return; }
            let type = info.isDirectory ? 'Folder' : (item.name.split('.').pop() ? `.${item.name.split('.').pop()}` : 'File');
            const details: ItemDetails = { name: item.name, uri: info.uri, isDirectory: info.isDirectory, size: info.size, modificationTime: info.modificationTime, type: type };
            setSelectedItemDetails(details);
            setDetailsModalVisible(true); // Use renamed state setter
        } catch (error: any) { console.error("Error fetching details:", error); Alert.alert('Error', 'Could not fetch item details.'); }
      };

   // --- Function to handle folder creation ---
    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) {
            Alert.alert('Invalid Name', 'Folder name cannot be empty.');
            return;
        }
        // Basic check for invalid characters (optional, adjust as needed)
        if (/[\\/:\*\?"<>\|]/.test(newFolderName)) {
             Alert.alert('Invalid Name', 'Folder name contains invalid characters.');
             return;
        }

        const newFolderPath = currentPath + newFolderName; // Construct path
        console.log('Attempting to create folder:', newFolderPath);

        try {
            await FileSystem.makeDirectoryAsync(newFolderPath, { intermediates: true });
            console.log('Folder created successfully');
            setNewFolderModalVisible(false); // Close modal
            setNewFolderName(''); // Clear input
            loadDirectoryItems(currentPath); // Refresh the list
        } catch (error: any) {
            console.error('Error creating folder:', error);
            // Check for specific errors if possible, e.g., file exists
             if (error.code === 'EEXIST') {
                 Alert.alert('Error', `An item named "${newFolderName}" already exists.`);
             } else if (error.code === 'EPERM') {
                 Alert.alert('Error', 'Permission denied.');
             }
             else {
                Alert.alert('Error', 'Could not create folder.');
             }
        }
    };
    // ---------------------------------------


  useEffect(() => { /* ... keep existing implementation ... */
    console.log("App's Document Directory Base:", FileSystem.documentDirectory);
    console.log("Current navigation path:", currentPath);
    loadDirectoryItems(currentPath);
  }, [currentPath, loadDirectoryItems]);

  const renderItem = ({ item }: { item: FileSystemItem }) => ( /* ... keep existing implementation ... */
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleNavigateToDirectory(item)} onLongPress={() => fetchAndShowDetails(item)} >
        <Text style={styles.itemIcon}>{item.isDirectory ? '📁' : '📄'}</Text>
        <Text style={styles.itemName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const displayPath = currentPath.replace(FileSystem.documentDirectory ?? '', '').replace(/\/$/, '');

  return (
    <View style={styles.container}>
        {/* Details Modal */}
        <Modal
            animationType="slide"
            transparent={true}
            visible={detailsModalVisible} // Use renamed state variable
            onRequestClose={() => setDetailsModalVisible(false)}>
            {/* ... keep existing Modal content ... */}
             <View style={styles.modalOverlay}>
                 <View style={styles.modalView}>
                     <Text style={styles.modalTitle}>Details</Text>
                     {selectedItemDetails ? (
                         <>
                             <Text style={styles.detailText}>Name: {selectedItemDetails.name}</Text>
                             <Text style={styles.detailText}>Type: {selectedItemDetails.type}</Text>
                             {selectedItemDetails.size !== undefined && ( <Text style={styles.detailText}> Size: {formatBytes(selectedItemDetails.size)} </Text> )}
                             {selectedItemDetails.modificationTime !== undefined && ( <Text style={styles.detailText}> Modified: {format(new Date(selectedItemDetails.modificationTime * 1000), 'Pp')} </Text> )}
                              <Text style={styles.detailTextUri}>URI: {selectedItemDetails.uri}</Text>
                         </>
                     ) : ( <Text>Loading details...</Text> )}
                     <Button title="Close" onPress={() => setDetailsModalVisible(false)} />
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
                setNewFolderName(''); // Clear input on close
            }}>
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
                        <Button title="Cancel" onPress={() => {
                            setNewFolderModalVisible(false);
                            setNewFolderName(''); // Clear input on cancel
                            }} color="#888" />
                         <View style={{ width: 10 }} /> {/* Spacer */}
                        <Button title="Create" onPress={handleCreateFolder} />
                    </View>
                </View>
            </View>
        </Modal>
        {/* ------------------------ */}

        {/* --- Button Row --- */}
        <View style={styles.buttonRow}>
             <TouchableOpacity
                 style={[styles.button, currentPath === baseDir && styles.buttonDisabled]}
                 onPress={handleGoUp}
                 disabled={currentPath === baseDir}
             >
                 <Text style={styles.buttonText}>⬆️ Go Up</Text>
             </TouchableOpacity>

             {/* Add New Folder Button */}
             <TouchableOpacity
                 style={styles.button}
                 onPress={() => {
                     setNewFolderName(''); // Clear name before opening
                     setNewFolderModalVisible(true);
                 }}
             >
                 <Text style={styles.buttonText}>➕ New Folder</Text>
             </TouchableOpacity>
        </View>
        {/* ------------------ */}


        <Text style={styles.pathText}>Path: {displayPath || 'AppData'}</Text>

        {isLoading ? ( <ActivityIndicator size="large" style={styles.loader} /> )
         : items.length === 0 ? ( <Text style={styles.emptyText}>Directory is empty</Text> )
         : ( <FlatList data={items} renderItem={renderItem} keyExtractor={(item) => item.uri} style={styles.list} /> )
        }
    </View>
  );
}

// --- Add/Update Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    buttonRow: { // Style for holding buttons horizontally
        flexDirection: 'row',
        justifyContent: 'space-around', // Space out buttons
        paddingVertical: 5, // Add padding
        marginHorizontal: 10,
    },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        // margin: 10, // Removed margin for row layout
        alignItems: 'center',
        flex: 1, // Allow buttons to grow
        marginHorizontal: 5, // Add horizontal spacing between buttons
    },
    buttonDisabled: { backgroundColor: '#a0a0a0' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    pathText: { fontSize: 14, marginHorizontal: 10, marginBottom: 5, color: '#555', paddingHorizontal: 5, fontStyle: 'italic' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    list: { flex: 1, marginHorizontal: 10 },
    itemContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', borderRadius: 5, marginBottom: 5 },
    itemIcon: { fontSize: 20, marginRight: 10 },
    itemName: { fontSize: 16, flexShrink: 1 },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#888' },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    modalView: { margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'stretch', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '85%' },
    modalTitle: { marginBottom: 20, textAlign: 'center', fontSize: 20, fontWeight: 'bold' }, // Increased bottom margin
    detailText: { marginBottom: 10, fontSize: 16, textAlign: 'left' },
    detailTextUri: { marginBottom: 15, fontSize: 12, color: '#555', textAlign: 'left', fontStyle: 'italic' },
    // --- New Folder Modal Styles ---
    input: {
        height: 45,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 20, // Increased margin
        paddingHorizontal: 15, // Increased padding
        borderRadius: 5,
        fontSize: 16,
    },
    modalButtonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end', // Align buttons to the right
        marginTop: 10, // Add margin above buttons
    },
    // ---------------------------
});