export type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  url?: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  format: string;
  location: string;
  onsite: boolean;
  organizer: string;
  source: string; // "internal" | "ctftime"
  status: string; // "upcoming" | "running" | "ended"
};
