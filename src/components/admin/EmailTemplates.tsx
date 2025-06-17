
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Mail, Eye, Edit, Save, X } from 'lucide-react';
import { EmailTemplate } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const EmailTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previewHtml, setPreviewHtml] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our EmailTemplate interface
      const transformedTemplates: EmailTemplate[] = (data || []).map(template => ({
        id: template.id,
        slug: template.slug,
        name: template.name,
        subject: template.subject,
        html_body: template.html_body,
        variables: (template.variables as string[]) || [],
        is_active: template.is_active,
        created_at: template.created_at,
        updated_at: template.updated_at
      }));
      
      setTemplates(transformedTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load email templates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTemplate = async (template: EmailTemplate) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .update({
          name: template.name,
          subject: template.subject,
          html_body: template.html_body,
          is_active: template.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', template.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email template updated successfully",
      });

      setIsEditing(false);
      fetchTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: "Error",
        description: "Failed to update email template",
        variant: "destructive",
      });
    }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Templates</h2>
          <p className="text-gray-600">Manage automated email templates for job applications</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Templates List */}
        <div className="space-y-4">
          {templates.map((template) => (
            <Card key={template.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">{template.name}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={template.is_active ? "default" : "secondary"}>
                    {template.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setIsEditing(false);
                      setPreviewHtml(generatePreview(template));
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">Slug: {template.slug}</p>
              <p className="text-sm text-gray-800 font-medium">Subject: {template.subject}</p>
              
              {template.variables && template.variables.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Variables:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.variables.map((variable) => (
                      <Badge key={variable} variant="outline" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Template Editor/Preview */}
        {selectedTemplate && (
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {isEditing ? 'Edit Template' : 'Preview Template'}
                </h3>
                <div className="flex items-center space-x-2">
                  {!isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Full Preview
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Email Preview: {selectedTemplate.name}</DialogTitle>
                          </DialogHeader>
                          <div 
                            className="border rounded-lg p-4 bg-white"
                            dangerouslySetInnerHTML={{ __html: previewHtml }}
                          />
                        </DialogContent>
                      </Dialog>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSaveTemplate(selectedTemplate)}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input
                      id="template-name"
                      value={selectedTemplate.name}
                      onChange={(e) => setSelectedTemplate({
                        ...selectedTemplate,
                        name: e.target.value
                      })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="template-subject">Subject</Label>
                    <Input
                      id="template-subject"
                      value={selectedTemplate.subject}
                      onChange={(e) => setSelectedTemplate({
                        ...selectedTemplate,
                        subject: e.target.value
                      })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="template-html">HTML Content</Label>
                    <Textarea
                      id="template-html"
                      value={selectedTemplate.html_body}
                      onChange={(e) => setSelectedTemplate({
                        ...selectedTemplate,
                        html_body: e.target.value
                      })}
                      rows={20}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={selectedTemplate.is_active}
                      onCheckedChange={(checked) => setSelectedTemplate({
                        ...selectedTemplate,
                        is_active: checked
                      })}
                    />
                    <Label>Active</Label>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Subject Preview</h4>
                    <p className="text-sm bg-gray-50 p-2 rounded border">
                      {selectedTemplate.subject.replace(/\{\{(\w+)\}\}/g, '[Sample $1]')}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Content Preview</h4>
                    <div 
                      className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto text-sm"
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                    />
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailTemplates;
