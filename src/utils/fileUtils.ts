import { supabase } from '@/integrations/supabase/client';

export interface FileUrlResult {
  url: string;
  isAccessible: boolean;
  error?: string;
}

/**
 * Extracts storage path from various URL formats
 */
export function extractStoragePath(url: string): string | null {
  // Handle Supabase storage URLs
  if (url.includes('supabase.co/storage/v1/object/public/')) {
    const parts = url.split('/storage/v1/object/public/');
    if (parts.length > 1) {
      return parts[1];
    }
  }
  
  // Handle direct storage paths
  if (url.startsWith('/') || !url.includes('http')) {
    return url.startsWith('/') ? url.substring(1) : url;
  }
  
  return null;
}

/**
 * Tests if a URL is accessible
 */
async function testUrlAccessibility(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('URL accessibility test failed:', error);
    return false;
  }
}

/**
 * Main function to get file URL with fallback strategies
 */
export async function getFileUrl(fileUrl: string): Promise<FileUrlResult> {
  console.log('getFileUrl called with:', fileUrl);
  
  if (!fileUrl) {
    return {
      url: '',
      isAccessible: false,
      error: 'No URL provided'
    };
  }

  // Strategy 1: Test the original URL accessibility
  try {
    console.log('Strategy 1: Testing original URL accessibility');
    const isOriginalAccessible = await testUrlAccessibility(fileUrl);
    console.log('Original URL accessible:', isOriginalAccessible);
    
    if (isOriginalAccessible) {
      return {
        url: fileUrl,
        isAccessible: true
      };
    } else {
      return {
        url: fileUrl,
        isAccessible: false,
        error: 'File not accessible via preview, but download may work'
      };
    }
  } catch (error) {
    console.warn('URL accessibility test failed:', error);
    return {
      url: fileUrl,
      isAccessible: false,
      error: 'File not accessible via preview, but download may work'
    };
  }
}

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
 * Gets the filename from URL
 */
export function getFilename(url: string): string {
  const urlParts = url.split('/');
  return urlParts[urlParts.length - 1] || 'unknown-file';
}

/**
 * Tries multiple extensions for legacy resume URLs
 * This helps with old applications that don't have the correct extension stored
 */
export async function getLegacyResumeUrl(applicationId: string): Promise<string | null> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    return null;
  }
  
  // Try different extensions in order of likelihood
  const extensions = ['pdf', 'doc', 'docx'];
  
  for (const ext of extensions) {
    const testUrl = `${supabaseUrl}/storage/v1/object/public/job-applications/${applicationId}/resume.${ext}`;
    const isAccessible = await testUrlAccessibility(testUrl);
    if (isAccessible) {
      return testUrl;
    }
  }
  
  return null;
} 