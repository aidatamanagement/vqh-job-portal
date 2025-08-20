
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, RefreshCw } from 'lucide-react';
import { EmailTemplate } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import EmailPreviewDialog from './EmailPreviewDialog';

interface EmailTemplatesTableProps {
  templates: EmailTemplate[];
  onEditClick: (template: EmailTemplate) => void;
  onRefresh: () => void;
  isLoading: boolean;
  error: string | null;
}

// Define the order of statuses to match the submissions filter
const STATUS_ORDER = [
  'application_submitted',
  'shortlisted_for_hr', 
  'hr_interviewed',
  'shortlisted_for_manager',
  'manager_interviewed',
  'hired',
  'waiting_list',
  'application_rejected' // This is the rejected template slug
];

// Function to sort templates in the same order as status filter
const sortTemplatesByStatusOrder = (templates: EmailTemplate[]): EmailTemplate[] => {
  return [...templates].sort((a, b) => {
    const aIndex = STATUS_ORDER.indexOf(a.slug);
    const bIndex = STATUS_ORDER.indexOf(b.slug);
    
    // If both templates are in the status order, sort by that order
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    
    // If only one is in the status order, prioritize it
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    
    // If neither is in the status order, sort alphabetically by name
    return a.name.localeCompare(b.name);
  });
};

const EmailTemplatesTable: React.FC<EmailTemplatesTableProps> = ({
  templates,
  onEditClick,
  onRefresh,
  isLoading,
  error
}) => {
  // Sort templates in the same order as status filter
  const sortedTemplates = sortTemplatesByStatusOrder(templates);

  if (templates.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Email Templates Found</h3>
        <p className="text-gray-600 mb-4">
          {error 
            ? "There was an error loading templates. Check the error message above."
            : "Either no templates exist in the database, or there may be a permissions issue."
          }
        </p>
        <Button onClick={onRefresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry Loading
        </Button>
      </div>
    );
  }

  return (
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
        {sortedTemplates.map((template) => (
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
                  onClick={() => onEditClick(template)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <EmailPreviewDialog template={template} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default EmailTemplatesTable;
