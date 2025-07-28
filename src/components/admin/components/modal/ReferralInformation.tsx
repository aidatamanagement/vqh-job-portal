import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Users } from 'lucide-react';
import { JobApplication } from '@/types';

interface ReferralInformationProps {
  application: JobApplication;
}

const ReferralInformation: React.FC<ReferralInformationProps> = ({ application }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5" />
          Employee Referral
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant={application.isReferredByEmployee ? "default" : "secondary"}>
            {application.isReferredByEmployee ? "Referred by Employee" : "No Employee Referral"}
          </Badge>
        </div>
        
        {application.isReferredByEmployee && application.referredByEmployeeName && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span className="font-medium">Referred by:</span>
            </div>
            <div className="ml-6 p-3 bg-gray-50 rounded-md">
              <p className="font-medium text-gray-900">
                {application.referredByEmployeeName}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Current ViaQuest Hospice Employee
              </p>
            </div>
          </div>
        )}
        
        {!application.isReferredByEmployee && (
          <div className="text-sm text-gray-500 italic">
            This applicant was not referred by a current employee.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReferralInformation; 