export const getFileNameFromUri = (uri: string | null): string => {
  if (!uri) return "";
  return uri.split("/").pop() || "";
};
