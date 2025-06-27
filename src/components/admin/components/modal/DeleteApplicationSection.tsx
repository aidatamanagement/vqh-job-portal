
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { JobApplication } from '@/types';

interface DeleteApplicationSectionProps {
  application: JobApplication;
  onDeleteApplication: (applicationId: string) => void;
  deletingApplication: string | null;
}

const DeleteApplicationSection: React.FC<DeleteApplicationSectionProps> = ({
  application,
  onDeleteApplication,
  deletingApplication
}) => {
  return (
    <div className="lg:w-auto">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Danger Zone</h3>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            disabled={deletingApplication === application.id}
            className="text-sm px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 whitespace-nowrap"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {deletingApplication === application.id ? 'Deleting...' : 'Delete Application'}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this application from {application.firstName} {application.lastName}? 
              This will permanently delete the application record and all uploaded files. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDeleteApplication(application.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Application
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeleteApplicationSection;
