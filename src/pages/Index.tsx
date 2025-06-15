
import React from 'react';
import Header from '@/components/Header';
import JobsList from '@/pages/JobsList';
import CursorGlow from '@/components/CursorGlow';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-white relative animate-slide-up">
      <CursorGlow />
      <Header />
      <JobsList />
    </div>
  );
};

export default Index;
