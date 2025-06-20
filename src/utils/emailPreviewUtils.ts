
import { EmailTemplate } from '@/types';

export const generateEmailPreview = (template: EmailTemplate): string => {
  let html = template.html_body;
  
  // Replace variables with sample data
  const sampleData: Record<string, string> = {
    firstName: 'John',
    lastName: 'Doe',
    position: 'Registered Nurse',
    location: 'New York, NY',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    earliestStartDate: 'January 15, 2024',
    applicationDate: new Date().toLocaleDateString(),
    adminUrl: '#'
  };

  Object.entries(sampleData).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    html = html.replace(new RegExp(placeholder, 'g'), value);
  });

  return html;
};

export const generateSubjectPreview = (subject: string): string => {
  return subject.replace(/\{\{(\w+)\}\}/g, '[Sample $1]');
};
