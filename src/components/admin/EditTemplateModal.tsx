
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
import { Save, X, Eye, Edit, Code, Palette } from 'lucide-react';
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
  const [editorMode, setEditorMode] = useState<'visual' | 'code'>('visual');
  const [extractedContent, setExtractedContent] = useState('');

  useEffect(() => {
    if (template) {
      setEditedTemplate({ ...template });
      setHasUnsavedChanges(false);
      // Extract content from HTML for visual editing
      extractContentFromHtml(template.html_body);
    }
  }, [template]);

  const extractContentFromHtml = (html: string) => {
    // Look for content between common email content markers
    const contentPatterns = [
      /<div[^>]*id=["']?email-content["']?[^>]*>(.*?)<\/div>/is,
      /<div[^>]*class=["'][^"']*content[^"']*["'][^>]*>(.*?)<\/div>/is,
      /<main[^>]*>(.*?)<\/main>/is,
      /<body[^>]*>(.*?)<\/body>/is
    ];

    for (const pattern of contentPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        setExtractedContent(match[1].trim());
        return;
      }
    }

    // If no specific content area found, extract everything between body tags or use full HTML
    const bodyMatch = html.match(/<body[^>]*>(.*?)<\/body>/is);
    if (bodyMatch && bodyMatch[1]) {
      setExtractedContent(bodyMatch[1].trim());
    } else {
      // Fallback: use the full HTML but warn that structure might be affected
      setExtractedContent(html);
    }
  };

  const rebuildHtmlWithNewContent = (newContent: string): string => {
    if (!editedTemplate) return '';

    const originalHtml = editedTemplate.html_body;

    // Try to replace content in the original structure
    const contentPatterns = [
      {
        pattern: /(<div[^>]*id=["']?email-content["']?[^>]*>)(.*?)(<\/div>)/is,
        replacement: `$1${newContent}$3`
      },
      {
        pattern: /(<div[^>]*class=["'][^"']*content[^"']*["'][^>]*>)(.*?)(<\/div>)/is,
        replacement: `$1${newContent}$3`
      },
      {
        pattern: /(<main[^>]*>)(.*?)(<\/main>)/is,
        replacement: `$1${newContent}$3`
      },
      {
        pattern: /(<body[^>]*>)(.*?)(<\/body>)/is,
        replacement: `$1${newContent}$3`
      }
    ];

    for (const { pattern, replacement } of contentPatterns) {
      if (pattern.test(originalHtml)) {
        return originalHtml.replace(pattern, replacement);
      }
    }

    // If no pattern matches, return the new content wrapped in a basic structure
    if (originalHtml.includes('<html>') || originalHtml.includes('<body>')) {
      return originalHtml.replace(/(<body[^>]*>).*?(<\/body>)/is, `$1${newContent}$2`);
    }

    return newContent;
  };

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

  const handleContentChange = (content: string) => {
    if (editedTemplate) {
      if (editorMode === 'visual') {
        setExtractedContent(content);
        const newHtml = rebuildHtmlWithNewContent(content);
        setEditedTemplate({ ...editedTemplate, html_body: newHtml });
      } else {
        setEditedTemplate({ ...editedTemplate, html_body: content });
      }
      setHasUnsavedChanges(true);
    }
  };

  const handleEditorModeChange = (mode: 'visual' | 'code') => {
    if (editedTemplate) {
      if (mode === 'visual' && editorMode === 'code') {
        // Switching from code to visual - extract content again
        extractContentFromHtml(editedTemplate.html_body);
      }
      setEditorMode(mode);
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
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
                <Label>Email Body</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant={editorMode === 'visual' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleEditorModeChange('visual')}
                  >
                    <Palette className="w-4 h-4 mr-1" />
                    Visual
                  </Button>
                  <Button
                    type="button"
                    variant={editorMode === 'code' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleEditorModeChange('code')}
                  >
                    <Code className="w-4 h-4 mr-1" />
                    Code
                  </Button>
                </div>
              </div>
              
              {editorMode === 'visual' ? (
                <div className="border rounded-lg overflow-hidden">
                  <RichTextEditor
                    value={extractedContent}
                    onChange={handleContentChange}
                    placeholder="Enter email content..."
                    className="min-h-[300px]"
                  />
                </div>
              ) : (
                <Textarea
                  value={editedTemplate.html_body}
                  onChange={(e) => handleContentChange(e.target.value)}
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
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md cursor-pointer hover:bg-blue-200"
                      title="Click to copy"
                      onClick={() => {
                        navigator.clipboard.writeText(`{{${variable}}}`);
                      }}
                    >
                      {`{{${variable}}}`}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Click on variables to copy them to clipboard
                </p>
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
