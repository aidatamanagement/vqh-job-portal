
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

const ApplicationNotFound: React.FC = () => {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Application Not Found
        </h3>
        <p className="text-gray-600">
          We couldn't find an application with this tracking token. 
          Please check the token and try again.
        </p>
      </CardContent>
    </Card>
  );
};

export default ApplicationNotFound;
