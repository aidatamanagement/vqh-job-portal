
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Calendar, MapPin, User, Mail, Phone } from 'lucide-react';

interface ApplicationData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  applied_position: string;
  earliest_start_date: string;
  city_state: string;
  status: 'waiting' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  job_id: string;
}

interface ApplicationDetailsProps {
  application: ApplicationData;
}

const ApplicationDetails: React.FC<ApplicationDetailsProps> = ({ application }) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="application-details">
        <AccordionTrigger>
          <div className="flex items-center gap-3">
            <User className="w-5 h-5" />
            Application Details
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Applicant Name</p>
                <p className="font-semibold">{application.first_name} {application.last_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-semibold">{application.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-semibold">{application.phone || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-semibold">{application.city_state || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Position Applied</p>
                <p className="font-semibold">{application.applied_position}</p>
              </div>
            </div>

            {application.earliest_start_date && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Earliest Start Date</p>
                  <p className="font-semibold">
                    {new Date(application.earliest_start_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ApplicationDetails;
