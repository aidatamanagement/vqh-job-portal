
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X, Sparkles } from 'lucide-react';
import { EmailTemplate } from '@/types';

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => void;
}

const templatePresets = {
  'application_submitted': {
    name: 'Application Submitted Confirmation',
    subject: 'Application Received - {{position}} at {{location}}',
    html_body: `<h2>Thank you for your application!</h2>
<p>Dear {{firstName}} {{lastName}},</p>
<p>We have received your application for the <strong>{{position}}</strong> position at our {{location}} location.</p>
<p>Your application is being reviewed and we will contact you soon with next steps.</p>
<p>Application Details:</p>
<ul>
  <li>Position: {{position}}</li>
  <li>Location: {{location}}</li>
  <li>Application Date: {{applicationDate}}</li>
  <li>Phone: {{phone}}</li>
  <li>Email: {{email}}</li>
</ul>
<p>You can track your application status using this link: <a href="{{trackingUrl}}">Track Application</a></p>
<p>Thank you for your interest in joining our team!</p>
<p>Best regards,<br>HR Team</p>`
  },
  'under_review': {
    name: 'Application Under Review',
    subject: 'Application Update - {{position}}',
    html_body: `<h2>Application Status Update</h2>
<p>Dear {{firstName}} {{lastName}},</p>
<p>Your application for the <strong>{{position}}</strong> position is currently under review by our team.</p>
<p>We will contact you within the next few business days with an update on your application status.</p>
<p>Track your application: <a href="{{trackingUrl}}">View Status</a></p>
<p>Best regards,<br>HR Team</p>`
  },
  'shortlisted': {
    name: 'Shortlisted Candidate',
    subject: 'Congratulations - You\'ve been shortlisted for {{position}}',
    html_body: `<h2>Congratulations!</h2>
<p>Dear {{firstName}} {{lastName}},</p>
<p>We are pleased to inform you that you have been shortlisted for the <strong>{{position}}</strong> position at our {{location}} location.</p>
<p>Someone from our team will be in touch with you soon to discuss the next steps in the interview process.</p>
<p>Track your application: <a href="{{trackingUrl}}">View Status</a></p>
<p>We look forward to speaking with you!</p>
<p>Best regards,<br>HR Team</p>`
  },
  'interview_scheduled': {
    name: 'Interview Scheduled',
    subject: 'Interview Scheduled - {{position}}',
    html_body: `<h2>Interview Scheduled</h2>
<p>Dear {{firstName}} {{lastName}},</p>
<p>Your interview for the <strong>{{position}}</strong> position has been scheduled.</p>
<p>Please check your email for detailed interview information including date, time, and location.</p>
<p>Track your application: <a href="{{trackingUrl}}">View Status</a></p>
<p>We look forward to meeting with you!</p>
<p>Best regards,<br>HR Team</p>`
  },
  'hired': {
    name: 'Job Offer - Welcome to the Team',
    subject: 'Welcome to the Team - {{position}}',
    html_body: `<h2>Welcome to Our Team!</h2>
<p>Dear {{firstName}} {{lastName}},</p>
<p>Congratulations! We are excited to offer you the <strong>{{position}}</strong> position at our {{location}} location.</p>
<p>Please check your email for detailed offer information including start date, compensation, and next steps.</p>
<p>We are thrilled to have you join our team and look forward to working with you!</p>
<p>Best regards,<br>HR Team</p>`
  },
  'application_rejected': {
    name: 'Application Status Update',
    subject: 'Update on Your Application - {{position}}',
    html_body: `<h2>Application Status Update</h2>
<p>Dear {{firstName}} {{lastName}},</p>
<p>Thank you for your interest in the <strong>{{position}}</strong> position at our {{location}} location.</p>
<p>After careful consideration, we have decided to move forward with other candidates at this time.</p>
<p>We encourage you to apply for future opportunities that match your skills and experience.</p>
<p>Thank you again for considering us as an employer.</p>
<p>Best regards,<br>HR Team</p>`
  },
  'admin_notification': {
    name: 'Admin Notification - New Application',
    subject: 'New Application Received - {{position}}',
    html_body: `<h2>New Application Received</h2>
<p>A new application has been submitted:</p>
<ul>
  <li><strong>Candidate:</strong> {{firstName}} {{lastName}}</li>
  <li><strong>Position:</strong> {{position}}</li>
  <li><strong>Location:</strong> {{location}}</li>
  <li><strong>Email:</strong> {{email}}</li>
  <li><strong>Phone:</strong> {{phone}}</li>
  <li><strong>Application Date:</strong> {{applicationDate}}</li>
</ul>
<p><a href="{{adminUrl}}">View in Admin Panel</a></p>`
  }
};

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
  'adminUrl'
];

const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [template, setTemplate] = useState<Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>>({
    slug: '',
    name: '',
    subject: '',
    html_body: '',
    variables: [],
    is_active: true
  });

  const [selectedPreset, setSelectedPreset] = useState<string>('');

  const handleInputChange = (field: keyof typeof template, value: string | boolean | string[]) => {
    setTemplate(prev => ({ ...prev, [field]: value }));
  };

  const handlePresetSelect = (presetKey: string) => {
    if (presetKey && templatePresets[presetKey as keyof typeof templatePresets]) {
      const preset = templatePresets[presetKey as keyof typeof templatePresets];
      setTemplate({
        slug: presetKey,
        name: preset.name,
        subject: preset.subject,
        html_body: preset.html_body,
        variables: availableVariables,
        is_active: true
      });
      setSelectedPreset(presetKey);
    }
  };

  const handleCreate = () => {
    if (template.slug && template.name && template.subject && template.html_body) {
      onCreate(template);
      handleClose();
    }
  };

  const handleClose = () => {
    setTemplate({
      slug: '',
      name: '',
      subject: '',
      html_body: '',
      variables: [],
      is_active: true
    });
    setSelectedPreset('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Email Template</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label>Template Presets</Label>
            <Select value={selectedPreset} onValueChange={handlePresetSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a preset template or create from scratch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="application_submitted">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Application Submitted Confirmation</span>
                  </div>
                </SelectItem>
                <SelectItem value="shortlisted_for_hr">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Shortlisted for HR Interview</span>
                  </div>
                </SelectItem>
                <SelectItem value="hr_interviewed">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>HR Interview Completed</span>
                  </div>
                </SelectItem>
                <SelectItem value="shortlisted_for_manager">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Shortlisted for Manager Interview</span>
                  </div>
                </SelectItem>
                <SelectItem value="manager_interviewed">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Manager Interview Completed</span>
                  </div>
                </SelectItem>
                <SelectItem value="hired">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Job Offer - Welcome to Team</span>
                  </div>
                </SelectItem>
                <SelectItem value="waiting_list">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Added to Waiting List</span>
                  </div>
                </SelectItem>
                <SelectItem value="application_rejected">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Application Rejected</span>
                  </div>
                </SelectItem>
                <SelectItem value="admin_notification">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Admin Notification</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={template.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter template name..."
              />
            </div>
            <div>
              <Label htmlFor="template-slug">Slug</Label>
              <Input
                id="template-slug"
                value={template.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                placeholder="template_slug"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="template-subject">Subject</Label>
            <Input
              id="template-subject"
              value={template.subject}
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
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md cursor-pointer hover:bg-blue-200"
                  onClick={() => {
                    navigator.clipboard.writeText(`{{${variable}}}`);
                  }}
                  title={`Click to copy {{${variable}}}`}
                >
                  {`{{${variable}}}`}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Click on any variable to copy it to clipboard, then paste it in your template content or subject line
            </p>
          </div>

          <div>
            <Label htmlFor="template-html">HTML Content</Label>
            <Textarea
              id="template-html"
              value={template.html_body}
              onChange={(e) => handleInputChange('html_body', e.target.value)}
              rows={20}
              className="font-mono text-sm"
              placeholder="Enter HTML content..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={template.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
            <Label>Active Template</Label>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-4 border-t mt-6">
          <Button variant="outline" onClick={handleClose}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleCreate}
            disabled={!template.slug || !template.name || !template.subject || !template.html_body}
          >
            <Save className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTemplateModal;
