
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Eye, Edit, RefreshCw } from 'lucide-react';
import { EmailTemplate } from '@/types';
import { useAppContext } from '@/contexts/AppContext';
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
  const [error, setError] = useState<string | null>(null);
  const { user, userProfile } = useAppContext();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching templates...');
      console.log('Current user:', user);
      console.log('User profile:', userProfile);
      console.log('User role:', userProfile?.role);

      // First, let's check if we can access the table at all
      const { data, error, count } = await supabase
        .from('email_templates')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      console.log('Supabase response:', { data, error, count });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      if (!data) {
        console.log('No data returned from Supabase');
        setTemplates([]);
        return;
      }

      console.log(`Found ${data.length} templates:`, data);
      
      // Transform the data to match our EmailTemplate interface
      const transformedTemplates: EmailTemplate[] = data.map(template => ({
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
      console.log('Templates set successfully:', transformedTemplates);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      const errorMessage = error.message || 'Failed to load email templates';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
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

  // Debug information
  const debugInfo = {
    isAuthenticated: !!user,
    userId: user?.id,
    userRole: userProfile?.role,
    userEmail: userProfile?.email,
    templatesCount: templates.length,
    isLoading,
    error
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Email Templates</h2>
            <p className="text-gray-600">Manage automated email templates for job applications</p>
          </div>
        </div>
        <Card className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span>Loading templates...</span>
            </div>
          </div>
        </Card>
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
        <Button onClick={fetchTemplates} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Debug Information Card */}
      <Card className="p-4 bg-gray-50">
        <h3 className="font-medium text-sm text-gray-700 mb-2">Debug Information:</h3>
        <pre className="text-xs text-gray-600 overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </Card>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <h3 className="font-medium text-red-800 mb-2">Error Details:</h3>
          <p className="text-sm text-red-600">{error}</p>
          <Button onClick={fetchTemplates} variant="outline" size="sm" className="mt-2">
            Try Again
          </Button>
        </Card>
      )}

      <Card className="p-6">
        {templates.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Email Templates Found</h3>
            <p className="text-gray-600 mb-4">
              {error 
                ? "There was an error loading templates. Check the debug information above."
                : "Either no templates exist in the database, or there may be a permissions issue."
              }
            </p>
            <Button onClick={fetchTemplates} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Loading
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[200px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-gray-500">{template.subject}</div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{template.slug}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={template.is_active ? "default" : "secondary"}>
                      {template.is_active ? "Active" : "Inactive"}
                    </Badge>
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
        )}
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
