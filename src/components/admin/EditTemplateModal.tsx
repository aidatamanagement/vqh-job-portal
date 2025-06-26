import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save, X, Eye, Edit } from 'lucide-react';
import { EmailTemplate } from '@/types';
import { generateEmailPreview, generateSubjectPreview } from '@/utils/emailPreviewUtils';

interface EditTemplateModalProps {
  template: EmailTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: EmailTemplate) => void;
}

const availableVariables = [
  'firstName',
  'lastName', 
  'position',
  'location',
  'email',
  'phone',
  'earliestStartDate',
  'applicationDate',
  'trackingToken',
  'trackingUrl',
  'trackingLink',
  'adminUrl',
  'calendlyUrl'
];

const EditTemplateModal: React.FC<EditTemplateModalProps> = ({
  template,
  isOpen,
  onClose,
  onSave,
}) => {
  const [editedTemplate, setEditedTemplate] = useState<EmailTemplate | null>(null);
  const [activeTab, setActiveTab] = useState('edit');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (template) {
      setEditedTemplate({ ...template });
      setHasUnsavedChanges(false);
    }
  }, [template]);

  const handleInputChange = (field: keyof EmailTemplate, value: string | boolean) => {
    if (editedTemplate) {
      setEditedTemplate({ ...editedTemplate, [field]: value });
      setHasUnsavedChanges(true);
    }
  };

  const handleSave = () => {
    if (editedTemplate) {
      onSave(editedTemplate);
      setHasUnsavedChanges(false);
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
        setHasUnsavedChanges(false);
      }
    } else {
      onClose();
    }
  };

  if (!editedTemplate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Edit Email Template: {editedTemplate.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit" className="flex items-center space-x-2">
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="mt-6 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={editedTemplate.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="template-slug">Slug (Read-only)</Label>
                <Input
                  id="template-slug"
                  value={editedTemplate.slug}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="template-subject">Subject</Label>
              <Input
                id="template-subject"
                value={editedTemplate.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Enter email subject..."
              />
            </div>

            <div>
              <Label>Available Variables</Label>
              <div className="flex flex-wrap gap-2 mt-2 mb-3">
                {availableVariables.map((variable) => (
                  <span
                    key={variable}
                    className={`px-2 py-1 text-xs rounded-md cursor-pointer hover:bg-blue-200 ${
                      variable === 'trackingLink' 
                        ? 'bg-green-100 text-green-800 border border-green-300' 
                        : 'bg-blue-100 text-blue-800'
                    }`}
                    onClick={() => {
                      // Add variable to clipboard for easy copying
                      navigator.clipboard.writeText(`{{${variable}}}`);
                    }}
                    title={`Click to copy {{${variable}}}${variable === 'trackingLink' ? ' - Creates a clickable tracking link' : ''}`}
                  >
                    {`{{${variable}}}`}
                    {variable === 'trackingLink' && ' 🔗'}
                  </span>
                ))}
              </div>
              <div className="text-xs text-gray-600 mb-4 space-y-1">
                <p>Click on any variable to copy it to clipboard, then paste it in your template</p>
                <p className="text-green-600">
                  <strong>{{trackingLink}}</strong> creates a styled, clickable link: "Track your application here"
                </p>
                <p className="text-blue-600">
                  <strong>{{trackingUrl}}</strong> provides just the URL without styling
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="template-html">HTML Content</Label>
              <Textarea
                id="template-html"
                value={editedTemplate.html_body}
                onChange={(e) => handleInputChange('html_body', e.target.value)}
                rows={20}
                className="font-mono text-sm"
                placeholder="Enter HTML content..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={editedTemplate.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <Label>Active Template</Label>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-6 space-y-4">
            <div>
              <h4 className="font-medium mb-2">Subject Preview</h4>
              <p className="text-sm bg-gray-50 p-3 rounded border">
                {generateSubjectPreview(editedTemplate.subject)}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Content Preview</h4>
              <div 
                className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto text-sm"
                dangerouslySetInnerHTML={{ __html: generateEmailPreview(editedTemplate) }}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-end space-x-2 pt-4 border-t mt-6">
          <Button variant="outline" onClick={handleClose}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditTemplateModal;
