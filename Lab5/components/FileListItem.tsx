import { FileSystemItem } from "@/types/filesystem";
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface FileListItemProps {
  item: FileSystemItem;
  onPress: (item: FileSystemItem) => void;
  onLongPress: (item: FileSystemItem) => void;
}

const FileListItem: React.FC<FileListItemProps> = ({
  item,
  onPress,
  onLongPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => onPress(item)}
      onLongPress={() => onLongPress(item)}
    >
      <Text style={styles.itemIcon}>{item.isDirectory ? "📁" : "📄"}</Text>
      <Text style={styles.itemName}>{item.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  itemIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  itemName: {
    fontSize: 16,
  },
});

export default FileListItem;
