export function getExclusiveEntryValues(entryType, primaryUrl, localPath) {
  return entryType === "path"
    ? { primaryUrl: "", localPath: String(localPath || "").trim() }
    : { primaryUrl: String(primaryUrl || "").trim(), localPath: "" };
}
