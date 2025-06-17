
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
import { Save, X, Eye, Edit, Code, Type } from 'lucide-react';
import { EmailTemplate } from '@/types';
import RichTextEditor from '@/components/ui/rich-text-editor';

interface EditTemplateModalProps {
  template: EmailTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: EmailTemplate) => void;
}

const EditTemplateModal: React.FC<EditTemplateModalProps> = ({
  template,
  isOpen,
  onClose,
  onSave,
}) => {
  const [editedTemplate, setEditedTemplate] = useState<EmailTemplate | null>(null);
  const [activeTab, setActiveTab] = useState('edit');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editorMode, setEditorMode] = useState<'visual' | 'html'>('visual');

  useEffect(() => {
    if (template) {
      setEditedTemplate({ ...template });
      setHasUnsavedChanges(false);
    }
  }, [template]);

  const generatePreview = (template: EmailTemplate) => {
    let html = template.html_body;
    
    // Replace variables with sample data
    const sampleData: Record<string, string> = {
      firstName: 'John',
      lastName: 'Doe',
      position: 'Registered Nurse',
      location: 'New York, NY',
      email: 'john.doe@example.com',
      phone: '(555) 123-4567',
      earliestStartDate: 'January 15, 2024',
      applicationDate: new Date().toLocaleDateString(),
      adminUrl: '#'
    };

    Object.entries(sampleData).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      html = html.replace(new RegExp(placeholder, 'g'), value);
    });

    return html;
  };

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
          <DialogTitle className="flex items-center justify-between">
            <span>Edit Email Template: {editedTemplate.name}</span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleClose}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
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
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="template-html">Email Body</Label>
                <div className="flex items-center space-x-2">
                  <Type className="w-4 h-4" />
                  <Switch
                    checked={editorMode === 'html'}
                    onCheckedChange={(checked) => setEditorMode(checked ? 'html' : 'visual')}
                  />
                  <Code className="w-4 h-4" />
                  <span className="text-sm text-gray-600">
                    {editorMode === 'visual' ? 'Visual' : 'HTML'} Editor
                  </span>
                </div>
              </div>
              
              {editorMode === 'visual' ? (
                <RichTextEditor
                  value={editedTemplate.html_body}
                  onChange={(value) => handleInputChange('html_body', value)}
                  placeholder="Enter email content..."
                  className="min-h-[300px]"
                />
              ) : (
                <Textarea
                  id="template-html"
                  value={editedTemplate.html_body}
                  onChange={(e) => handleInputChange('html_body', e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                  placeholder="Enter HTML content..."
                />
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={editedTemplate.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <Label>Active Template</Label>
            </div>

            {editedTemplate.variables && editedTemplate.variables.length > 0 && (
              <div>
                <Label>Available Variables</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {editedTemplate.variables.map((variable) => (
                    <span
                      key={variable}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                    >
                      {`{{${variable}}}`}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview" className="mt-6 space-y-4">
            <div>
              <h4 className="font-medium mb-2">Subject Preview</h4>
              <p className="text-sm bg-gray-50 p-3 rounded border">
                {editedTemplate.subject.replace(/\{\{(\w+)\}\}/g, '[Sample $1]')}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Content Preview</h4>
              <div 
                className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto text-sm"
                dangerouslySetInnerHTML={{ __html: generatePreview(editedTemplate) }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EditTemplateModal;
