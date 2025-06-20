import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Eye, Edit } from 'lucide-react';
import { EmailTemplate } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import EditTemplateModal from './EditTemplateModal';

const EmailTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

      setIsEditModalOpen(false);
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

  const handleEditClick = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsEditModalOpen(true);
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

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Template Name</TableHead>
              <TableHead className="w-[200px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell>
                  <div className="font-medium">{template.name}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(template)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                        >
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
                              {template.subject.replace(/\{\{(\w+)\}\}/g, '[Sample $1]')}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Content</h4>
                            <div 
                              className="border rounded-lg p-4 bg-white"
                              dangerouslySetInnerHTML={{ __html: generatePreview(template) }}
                            />
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <EditTemplateModal
        template={selectedTemplate}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTemplate(null);
        }}
        onSave={handleSaveTemplate}
      />
    </div>
  );
};

export default EmailTemplates;
