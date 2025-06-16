
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface FileViewerModalProps {
  viewingFile: { url: string; name: string } | null;
  onClose: () => void;
}

const FileViewerModal: React.FC<FileViewerModalProps> = ({
  viewingFile,
  onClose
}) => {
  return (
    <Dialog open={!!viewingFile} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] p-0 m-2">
        <DialogHeader className="p-4 sm:p-6 pb-0">
          <DialogTitle className="text-base sm:text-lg">{viewingFile?.name}</DialogTitle>
        </DialogHeader>
        {viewingFile && (
          <div className="p-4 sm:p-6 pt-4">
            <div className="w-full h-[60vh] sm:h-[70vh] border rounded-lg overflow-hidden">
              <iframe
                src={viewingFile.url}
                className="w-full h-full"
                title={viewingFile.name}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FileViewerModal;
