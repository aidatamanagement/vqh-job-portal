
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, ExternalLink } from 'lucide-react';

interface CoverLetterSectionProps {
  coverLetter: string;
  coverLetterUrl?: string;
  onOpenFileViewer?: (url: string, name: string) => void;
}

const CoverLetterSection: React.FC<CoverLetterSectionProps> = ({ 
  coverLetter, 
  coverLetterUrl, 
  onOpenFileViewer 
}) => {
  return (
    <div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Cover Letter</h3>
      
      {/* Uploaded Cover Letter File */}
      {coverLetterUrl && (
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-3">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <span className="font-medium text-sm "> Cover Letter</span>
                <p className="text-xs  mt-1">Document file provided by applicant</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {onOpenFileViewer && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenFileViewer(coverLetterUrl, 'Cover Letter')}
                  className="text-xs px-2 py-1"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">View Online</span>
                  <span className="sm:hidden">View</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(coverLetterUrl, '_blank')}
                className="text-xs px-2 py-1"
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Text Cover Letter */}
      {coverLetter && (
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Written Cover Letter</span>
          </div>
          <div className="text-gray-700 whitespace-pre-wrap text-sm" dangerouslySetInnerHTML={{ __html: coverLetter }} />
        </div>
      )}
      
      {/* No cover letter provided */}
      {!coverLetter && !coverLetterUrl && (
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <p className="text-gray-500 text-sm italic">No cover letter provided</p>
        </div>
      )}
    </div>
  );
};

export default CoverLetterSection;
