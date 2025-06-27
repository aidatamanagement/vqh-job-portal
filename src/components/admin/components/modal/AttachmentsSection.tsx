
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, ExternalLink } from 'lucide-react';

interface AttachmentsSectionProps {
  resumeUrl?: string;
  additionalDocsUrls: string[];
  onOpenFileViewer: (url: string, name: string) => void;
}

const AttachmentsSection: React.FC<AttachmentsSectionProps> = ({
  resumeUrl,
  additionalDocsUrls,
  onOpenFileViewer
}) => {
  return (
    <div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Attachments</h3>
      <div className="space-y-2">
        {resumeUrl && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-3">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span className="font-medium text-sm">Resume</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenFileViewer(resumeUrl, 'Resume')}
                className="text-xs px-2 py-1"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">View Online</span>
                <span className="sm:hidden">View</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(resumeUrl, '_blank')}
                className="text-xs px-2 py-1"
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        )}
        
        {additionalDocsUrls.map((docUrl, index) => (
          <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-3">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span className="font-medium text-sm">Additional Document {index + 1}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenFileViewer(docUrl, `Additional Document ${index + 1}`)}
                className="text-xs px-2 py-1"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">View Online</span>
                <span className="sm:hidden">View</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(docUrl, '_blank')}
                className="text-xs px-2 py-1"
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttachmentsSection;
