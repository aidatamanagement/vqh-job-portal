
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { getFileUrl, FileUrlResult } from '@/utils/fileUtils';
import { getFileCategory, isOfficeDocument, getOfficeViewerUrl, getFilename } from '@/utils/fileTypeUtils';
import OfficePreview from './OfficePreview';

interface FileViewerModalProps {
  viewingFile: { url: string; name: string } | null;
  onClose: () => void;
}

const FileViewerModal: React.FC<FileViewerModalProps> = ({
  viewingFile,
  onClose
}) => {
  const [fileUrlResult, setFileUrlResult] = useState<FileUrlResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (viewingFile) {
      loadFileUrl();
    }
  }, [viewingFile]);

  const loadFileUrl = async () => {
    if (!viewingFile) return;

    console.log('FileViewerModal - loadFileUrl called with:', viewingFile);
    setIsLoading(true);
    setError(null);

    try {
      const result = await getFileUrl(viewingFile.url);
      console.log('FileViewerModal - getFileUrl result:', result);
      setFileUrlResult(result);
      
      if (!result.isAccessible) {
        setError(result.error || 'File not accessible');
      }
    } catch (err) {
      setError('Failed to load file');
      console.error('Error loading file:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (fileUrlResult?.url) {
      window.open(fileUrlResult.url, '_blank');
    }
  };

  const handleViewFull = () => {
    if (viewingFile && isOfficeDocument(viewingFile.url)) {
      const fullScreenUrl = getOfficeViewerUrl(fileUrlResult?.url || viewingFile.url, true);
      window.open(fullScreenUrl, '_blank');
    } else if (fileUrlResult?.url) {
      window.open(fileUrlResult.url, '_blank');
    }
  };

  const renderFilePreview = () => {
    if (!viewingFile || !fileUrlResult) return null;

    const fileCategory = getFileCategory(viewingFile.url);
    const fileName = getFilename(viewingFile.url);

    // If file is not accessible, show download option
    if (!fileUrlResult.isAccessible) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8">
          <AlertCircle className="w-16 h-16 text-yellow-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            File Not Accessible for Preview
          </h3>
          <p className="text-gray-600 text-center mb-6">
            {fileUrlResult.error || 'This file cannot be previewed in the browser, but you can download it to view.'}
          </p>
          <div className="flex space-x-3">
            <Button onClick={handleDownload} variant="default">
              <Download className="w-4 h-4 mr-2" />
              Download File
            </Button>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      );
    }

    // Office documents
    if (isOfficeDocument(viewingFile.url)) {
      return (
        <OfficePreview
          fileUrl={fileUrlResult.url}
          fileName={fileName}
          onDownload={handleDownload}
          onViewFull={handleViewFull}
        />
      );
    }

    // PDF, images, and other iframe-compatible files
    if (['pdf', 'image', 'text'].includes(fileCategory)) {
      return (
        <div className="w-full h-full flex flex-col">
          {/* Header with actions */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                {fileCategory === 'pdf' ? 'PDF Document' : 
                 fileCategory === 'image' ? 'Image Preview' : 'Text Document'}
              </span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewFull}
                className="text-xs"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Open in New Tab
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            </div>
          </div>

          {/* File Preview */}
          <div className="flex-1 min-h-0">
            <iframe
              src={fileUrlResult.url}
              className="w-full h-full border-0"
              title={`Preview of ${fileName}`}
            />
          </div>
        </div>
      );
    }

    // Unsupported file types
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8">
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          File Type Not Supported for Preview
        </h3>
        <p className="text-gray-600 text-center mb-6">
          This file type cannot be previewed in the browser. Please download it to view.
        </p>
        <div className="flex space-x-3">
          <Button onClick={handleDownload} variant="default">
            <Download className="w-4 h-4 mr-2" />
            Download File
          </Button>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={!!viewingFile} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] p-0 m-2">
        <DialogHeader className="p-4 sm:p-6 pb-0">
          <DialogTitle className="text-base sm:text-lg">
            {viewingFile?.name || 'File Preview'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-4 sm:p-6 pt-4">
          <div className="w-full h-[60vh] sm:h-[70vh] border rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm text-gray-600">Loading file...</span>
                </div>
              </div>
            ) : error ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-8">
                <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  File Not Accessible
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  {error}
                </p>
                <div className="flex space-x-3">
                  <Button onClick={handleDownload} variant="default">
                    <Download className="w-4 h-4 mr-2" />
                    Try Download
                  </Button>
                  <Button onClick={onClose} variant="outline">
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              renderFilePreview()
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileViewerModal;
