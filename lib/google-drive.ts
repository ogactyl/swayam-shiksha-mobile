export type DriveFileType = "video" | "pdf" | "meet" | "youtube" | "unknown";

export function extractDriveFileId(url: string): string | null {
  if (!url) return null;
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];
  const docsMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (docsMatch) return docsMatch[1];
  return null;
}

export function isGoogleDriveUrl(url: string): boolean {
  return url.includes("drive.google.com") || url.includes("docs.google.com");
}
export function isGoogleMeetUrl(url: string): boolean {
  return url.includes("meet.google.com");
}
export function isYouTubeUrl(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be");
}
export function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([^&?/]+)/);
  return match ? match[1] : null;
}

export function getEmbedUrl(url: string): string {
  if (!url) return url;
  if (isGoogleDriveUrl(url)) {
    const fileId = extractDriveFileId(url);
    if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  if (isYouTubeUrl(url)) {
    const ytId = extractYouTubeId(url);
    if (ytId) return `https://www.youtube.com/embed/${ytId}`;
  }
  return url;
}

export function getPreviewUrl(url: string): string {
  if (!url) return url;
  if (isGoogleDriveUrl(url)) {
    const fileId = extractDriveFileId(url);
    if (fileId) return `https://drive.google.com/file/d/${fileId}/view`;
  }
  return url;
}

export function detectLinkType(url: string): string {
  if (!url) return "";
  if (isGoogleMeetUrl(url)) return "Google Meet";
  if (isYouTubeUrl(url)) return "YouTube Video";
  if (isGoogleDriveUrl(url)) {
    const fileId = extractDriveFileId(url);
    return fileId ? "Google Drive" : "Invalid Drive link";
  }
  return "Direct URL";
}
