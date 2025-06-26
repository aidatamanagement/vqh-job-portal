
import { EmailTemplate } from '@/types';

export const generateEmailPreview = (template: EmailTemplate): string => {
  let html = template.html_body;
  
  // Replace variables with sample data including tracking variables
  const sampleData: Record<string, string> = {
    firstName: 'John',
    lastName: 'Doe',
    position: 'Registered Nurse',
    location: 'New York, NY',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    earliestStartDate: 'January 15, 2024',
    applicationDate: new Date().toLocaleDateString(),
    trackingToken: 'ABC123-DEF456-GHI789',
    trackingURL: `${window.location.origin}/track/ABC123-DEF456-GHI789`,
    trackingUrl: `${window.location.origin}/track/ABC123-DEF456-GHI789`, // Backward compatibility
    adminUrl: `${window.location.origin}/admin`,
    calendlyUrl: 'https://calendly.com/viaquesthospice/interview-scheduling'
  };

  Object.entries(sampleData).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    html = html.replace(new RegExp(placeholder, 'g'), value);
  });

  return html;
};

export const generateSubjectPreview = (subject: string): string => {
  const sampleData: Record<string, string> = {
    firstName: 'John',
    lastName: 'Doe',
    position: 'Registered Nurse',
    location: 'New York, NY',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    earliestStartDate: 'January 15, 2024',
    applicationDate: new Date().toLocaleDateString(),
    trackingToken: 'ABC123-DEF456-GHI789',
    trackingURL: `${window.location.origin}/track/ABC123-DEF456-GHI789`,
    trackingUrl: `${window.location.origin}/track/ABC123-DEF456-GHI789`, // Backward compatibility
    adminUrl: `${window.location.origin}/admin`,
    calendlyUrl: 'https://calendly.com/viaquesthospice/interview-scheduling'
  };

  let previewSubject = subject;
  Object.entries(sampleData).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    previewSubject = previewSubject.replace(new RegExp(placeholder, 'g'), value);
  });

  return previewSubject;
};
