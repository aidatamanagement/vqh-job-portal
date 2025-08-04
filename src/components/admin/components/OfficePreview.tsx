import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Download, AlertCircle } from 'lucide-react';

interface OfficePreviewProps {
  fileUrl: string;
  fileName: string;
  onDownload?: () => void;
  onViewFull?: () => void;
}

const OfficePreview: React.FC<OfficePreviewProps> = ({
  fileUrl,
  fileName,
  onDownload,
  onViewFull
}) => {
  const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header with actions */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-gray-900">
            Microsoft Office Document Preview
          </span>
        </div>
        <div className="flex space-x-2">
          {onViewFull && (
            <Button
              variant="outline"
              size="sm"
              onClick={onViewFull}
              className="text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View Full Screen
            </Button>
          )}
          {onDownload && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDownload}
              className="text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Office Online Viewer */}
      <div className="flex-1 min-h-0">
        <iframe
          src={officeViewerUrl}
          className="w-full h-full border-0"
          title={`Preview of ${fileName}`}
          allowFullScreen
        />
      </div>

      {/* Footer with info */}
      <div className="p-3 bg-gray-50 border-t">
        <p className="text-xs text-gray-600 text-center">
          Powered by Microsoft Office Online. If the document doesn't load, try downloading it instead.
        </p>
      </div>
    </div>
  );
};

export default OfficePreview; 