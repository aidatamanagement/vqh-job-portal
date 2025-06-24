
import React, { useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X, Eye, Edit, Plus } from 'lucide-react';
import { EmailTemplate } from '@/types';
import { generateEmailPreview, generateSubjectPreview } from '@/utils/emailPreviewUtils';

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => void;
}

const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [activeTab, setActiveTab] = useState('edit');
  const [templateData, setTemplateData] = useState({
    name: '',
    slug: '',
    subject: '',
    html_body: '',
    variables: [] as string[],
    is_active: true
  });

  const commonVariables = [
    'firstName',
    'lastName', 
    'position',
    'location',
    'email',
    'phone',
    'earliestStartDate',
    'applicationDate',
    'trackingToken',
    'trackingUrl'
  ];

  const templatePresets = {
    application_submitted: {
      name: 'Application Submitted Confirmation',
      subject: 'Thank you for your application - {{position}}',
      html_body: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; }
        .tracking-link { background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Application Received</h2>
        </div>
        <div class="content">
            <p>Dear {{firstName}} {{lastName}},</p>
            <p>Thank you for your interest in the <strong>{{position}}</strong> position at ViaQuest Hospice in {{location}}.</p>
            <p>We have successfully received your application submitted on {{applicationDate}}.</p>
            <p>You can track the status of your application using the link below:</p>
            <a href="{{trackingUrl}}" class="tracking-link">Track My Application</a>
            <p>Your tracking code is: <strong>{{trackingToken}}</strong></p>
            <p>We will review your application and contact you if your qualifications match our requirements.</p>
            <p>Best regards,<br>ViaQuest Hospice Careers Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>`,
      variables: commonVariables
    },
    admin_notification: {
      name: 'Admin Notification - New Application',
      subject: 'New Application: {{firstName}} {{lastName}} - {{position}}',
      html_body: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .info-box { background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>New Job Application Received</h2>
        </div>
        <div class="content">
            <p>A new application has been submitted for the <strong>{{position}}</strong> position.</p>
            <div class="info-box">
                <h3>Applicant Details:</h3>
                <p><strong>Name:</strong> {{firstName}} {{lastName}}</p>
                <p><strong>Email:</strong> {{email}}</p>
                <p><strong>Phone:</strong> {{phone}}</p>
                <p><strong>Position:</strong> {{position}}</p>
                <p><strong>Location:</strong> {{location}}</p>
                <p><strong>Earliest Start Date:</strong> {{earliestStartDate}}</p>
                <p><strong>Application Date:</strong> {{applicationDate}}</p>
                <p><strong>Tracking Code:</strong> {{trackingToken}}</p>
            </div>
            <p>Please log into the admin dashboard to review the full application and documents.</p>
        </div>
    </div>
</body>
</html>`,
      variables: commonVariables
    },
    application_approved: {
      name: 'Application Approved',
      subject: 'Congratulations! Your application has been approved - {{position}}',
      html_body: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Application Approved!</h2>
        </div>
        <div class="content">
            <p>Dear {{firstName}} {{lastName}},</p>
            <p>Congratulations! We are pleased to inform you that your application for the <strong>{{position}}</strong> position has been approved.</p>
            <p>Our HR team will contact you soon to discuss the next steps in the hiring process.</p>
            <p>Thank you for your interest in joining the ViaQuest Hospice team.</p>
            <p>Best regards,<br>ViaQuest Hospice Careers Team</p>
        </div>
    </div>
</body>
</html>`,
      variables: commonVariables
    },
    application_rejected: {
      name: 'Application Not Selected',
      subject: 'Update on your application - {{position}}',
      html_body: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #6c757d; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Application Update</h2>
        </div>
        <div class="content">
            <p>Dear {{firstName}} {{lastName}},</p>
            <p>Thank you for your interest in the <strong>{{position}}</strong> position at ViaQuest Hospice.</p>
            <p>After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.</p>
            <p>We encourage you to apply for future opportunities that match your skills and experience.</p>
            <p>Best regards,<br>ViaQuest Hospice Careers Team</p>
        </div>
    </div>
</body>
</html>`,
      variables: commonVariables
    }
  };

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setTemplateData(prev => ({ ...prev, [field]: value }));
  };

  const handlePresetSelect = (preset: string) => {
    if (preset === 'custom') {
      setTemplateData({
        name: '',
        slug: '',
        subject: '',
        html_body: '',
        variables: commonVariables,
        is_active: true
      });
    } else {
      const presetData = templatePresets[preset as keyof typeof templatePresets];
      setTemplateData({
        name: presetData.name,
        slug: preset,
        subject: presetData.subject,
        html_body: presetData.html_body,
        variables: presetData.variables,
        is_active: true
      });
    }
  };

  const handleCreate = () => {
    if (!templateData.name || !templateData.slug || !templateData.subject || !templateData.html_body) {
      alert('Please fill in all required fields');
      return;
    }
    onCreate(templateData);
    setTemplateData({
      name: '',
      slug: '',
      subject: '',
      html_body: '',
      variables: [],
      is_active: true
    });
  };

  const handleClose = () => {
    setTemplateData({
      name: '',
      slug: '',
      subject: '',
      html_body: '',
      variables: [],
      is_active: true
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Email Template</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="template-preset">Template Preset</Label>
            <Select onValueChange={handlePresetSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a preset or start from scratch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom Template</SelectItem>
                <SelectItem value="application_submitted">Application Submitted Confirmation</SelectItem>
                <SelectItem value="admin_notification">Admin Notification</SelectItem>
                <SelectItem value="application_approved">Application Approved</SelectItem>
                <SelectItem value="application_rejected">Application Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                  <Label htmlFor="template-name">Template Name *</Label>
                  <Input
                    id="template-name"
                    value={templateData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter template name"
                  />
                </div>
                <div>
                  <Label htmlFor="template-slug">Slug *</Label>
                  <Input
                    id="template-slug"
                    value={templateData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="e.g., application_submitted"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="template-subject">Subject *</Label>
                <Input
                  id="template-subject"
                  value={templateData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Enter email subject..."
                />
              </div>

              <div>
                <Label htmlFor="template-html">HTML Content *</Label>
                <Textarea
                  id="template-html"
                  value={templateData.html_body}
                  onChange={(e) => handleInputChange('html_body', e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                  placeholder="Enter HTML content..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={templateData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
                <Label>Active Template</Label>
              </div>

              <div>
                <Label>Available Variables</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {commonVariables.map((variable) => (
                    <span
                      key={variable}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                    >
                      {`{{${variable}}}`}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use these variables in your template content and subject line
                </p>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-6 space-y-4">
              <div>
                <h4 className="font-medium mb-2">Subject Preview</h4>
                <p className="text-sm bg-gray-50 p-3 rounded border">
                  {generateSubjectPreview(templateData.subject)}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Content Preview</h4>
                <div 
                  className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto text-sm"
                  dangerouslySetInnerHTML={{ 
                    __html: generateEmailPreview({
                      ...templateData,
                      id: 'preview',
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    })
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-4 border-t mt-6">
          <Button variant="outline" onClick={handleClose}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTemplateModal;
