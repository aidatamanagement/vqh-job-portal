
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { EmailTemplate } from '@/types';
import { generateEmailPreview, generateSubjectPreview } from '@/utils/emailPreviewUtils';

interface EmailPreviewDialogProps {
  template: EmailTemplate;
}

const EmailPreviewDialog: React.FC<EmailPreviewDialogProps> = ({ template }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-1" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email Preview: {template.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Subject</h4>
            <p className="text-sm bg-gray-50 p-3 rounded border">
              {generateSubjectPreview(template.subject)}
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Content</h4>
            <div 
              className="border rounded-lg p-4 bg-white"
              dangerouslySetInnerHTML={{ __html: generateEmailPreview(template) }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailPreviewDialog;
