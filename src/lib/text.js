
export function previewText(text, maxLen = 140) {
  if (!text) return "";
  const clean = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !/^[=\-_]{3,}$/.test(line) && line.toLowerCase() !== "ai profile summary")
    .join(" ");
  return clean.length > maxLen ? `${clean.slice(0, maxLen).trimEnd()}…` : clean;
}
