
export interface Interview {
  id: string;
  application_id: string;
  calendly_event_uri: string;
  calendly_event_id: string;
  scheduled_time: string;
  candidate_email: string;
  interviewer_email?: string;
  meeting_url?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  created_at: string;
  updated_at: string;
}

export interface CalendlySettings {
  id: string;
  api_token: string;
  organization_uri: string;
  webhook_url?: string;
  default_event_type_uri?: string;
  created_at: string;
  updated_at: string;
}

export interface CalendlyEvent {
  uri: string;
  name: string;
  meeting_url: string;
  status: string;
  start_time: string;
  end_time: string;
  event_type: {
    uri: string;
    name: string;
  };
  event_memberships: Array<{
    user: {
      name: string;
      email: string;
    };
  }>;
  event_guests: Array<{
    email: string;
    name: string;
  }>;
}
