
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { EmailTemplate } from '@/types';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import EmailTemplatesTable from './EmailTemplatesTable';
import EditTemplateModal from './EditTemplateModal';

const EmailTemplates: React.FC = () => {
  const { templates, isLoading, error, fetchTemplates, updateTemplate } = useEmailTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditClick = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsEditModalOpen(true);
  };

  const handleSaveTemplate = async (template: EmailTemplate) => {
    await updateTemplate(template);
    setIsEditModalOpen(false);
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
        <EmailTemplatesTable
          templates={templates}
          onEditClick={handleEditClick}
          onRefresh={fetchTemplates}
          isLoading={isLoading}
          error={error}
        />
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
