
import React from 'react';

interface CoverLetterSectionProps {
  coverLetter: string;
}

const CoverLetterSection: React.FC<CoverLetterSectionProps> = ({ coverLetter }) => {
  return (
    <div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Cover Letter</h3>
      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
        <div className="text-gray-700 whitespace-pre-wrap text-sm" dangerouslySetInnerHTML={{ __html: coverLetter }} />
      </div>
    </div>
  );
};

export default CoverLetterSection;
