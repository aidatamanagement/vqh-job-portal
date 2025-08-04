export type FileCategory = 'image' | 'video' | 'audio' | 'pdf' | 'text' | 'office' | 'other';

/**
 * Gets the file extension from URL or filename
 */
export function getFileExtension(url: string): string {
  const urlParts = url.split('/');
  const filename = urlParts[urlParts.length - 1];
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  return extension;
}

/**
 * Categorizes files into different types for appropriate viewing
 */
export function getFileCategory(url: string): FileCategory {
  const extension = getFileExtension(url);
  
  // Image files
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)) {
    return 'image';
  }
  
  // Video files
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(extension)) {
    return 'video';
  }
  
  // Audio files
  if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'].includes(extension)) {
    return 'audio';
  }
  
  // PDF files
  if (extension === 'pdf') {
    return 'pdf';
  }
  
  // Text files
  if (['txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'ts'].includes(extension)) {
    return 'text';
  }
  
  // Microsoft Office files
  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
    return 'office';
  }
  
  // Default to other
  return 'other';
}

/**
 * Checks if file is a Microsoft Office document
 */
export function isOfficeDocument(url: string): boolean {
  return getFileCategory(url) === 'office';
}

/**
 * Checks if file can be previewed in iframe
 */
export function canPreviewInIframe(url: string): boolean {
  const category = getFileCategory(url);
  return ['image', 'pdf', 'text'].includes(category);
}

/**
 * Gets the Microsoft Office Online viewer URL
 */
export function getOfficeViewerUrl(fileUrl: string, fullScreen: boolean = false): string {
  const baseUrl = fullScreen 
    ? 'https://view.officeapps.live.com/op/view.aspx'
    : 'https://view.officeapps.live.com/op/embed.aspx';
  
  return `${baseUrl}?src=${encodeURIComponent(fileUrl)}`;
}

/**
 * Gets the filename from URL
 */
export function getFilename(url: string): string {
  const urlParts = url.split('/');
  return urlParts[urlParts.length - 1] || 'unknown-file';
} 