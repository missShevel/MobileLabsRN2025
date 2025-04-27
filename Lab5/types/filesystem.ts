export interface FileSystemItem {
  name: string;
  uri: string;
  isDirectory: boolean;
}

export interface ItemDetails extends FileSystemItem {
  size?: number;
  modificationTime?: number;
  type: string;
}
