import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, MessageSquare, Shield } from 'lucide-react';
import { JobApplication } from '@/types';

interface AdditionalInformationProps {
  application: JobApplication;
}

const AdditionalInformation: React.FC<AdditionalInformationProps> = ({ application }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Additional Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Previous ViaQuest Employment */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Previous ViaQuest Employment</h4>
          <div className="flex items-center gap-2">
            <Badge variant={application.hasPreviouslyWorkedAtViaQuest ? "default" : "secondary"}>
              {application.hasPreviouslyWorkedAtViaQuest ? "Yes" : "No"}
            </Badge>
            {application.hasPreviouslyWorkedAtViaQuest && application.lastDayOfEmployment && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                Last Day: {new Date(application.lastDayOfEmployment).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Certification Signature */}
        {application.certificationSignature && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Certification Signature</h4>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700 font-medium">
                "{application.certificationSignature}"
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Digital signature provided on application
              </p>
            </div>
          </div>
        )}

        {/* SMS Opt-in */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            SMS Communication
          </h4>
          <Badge variant={application.optInToSMS ? "default" : "secondary"}>
            {application.optInToSMS ? "Opted In" : "Opted Out"}
          </Badge>
          <p className="text-xs text-gray-500">
            {application.optInToSMS 
              ? "Candidate agreed to receive SMS messages regarding application and interview process"
              : "Candidate declined SMS communication"
            }
          </p>
        </div>

        {/* Privacy Policy */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Privacy Policy
          </h4>
          <Badge variant={application.privacyPolicyAccepted ? "default" : "destructive"}>
            {application.privacyPolicyAccepted ? "Accepted" : "Not Accepted"}
          </Badge>
          <p className="text-xs text-gray-500">
            {application.privacyPolicyAccepted 
              ? "Candidate acknowledged and consented to privacy policy terms"
              : "Privacy policy acceptance required"
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdditionalInformation;
