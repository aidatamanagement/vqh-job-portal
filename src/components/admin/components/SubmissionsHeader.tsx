
import React from 'react';
import { Inbox } from 'lucide-react';

const SubmissionsHeader: React.FC = () => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: '#005586' }}>
          <Inbox className="w-6 h-6 text-white" />
        </div>
        <h1 className="font-bold text-gray-900 text-lg sm:text-xl lg:text-2xl">Submissions</h1>
      </div>
    </div>
  );
};

export default SubmissionsHeader;
