import { Group } from "./Enums/Group";
import { LocationData } from "./locationData";

export interface Contact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  jobTitle: string;
  company: string;
  groups: Group[];
  location: LocationData;
  pastLocations: LocationData[];
  visited: LocationData[];
  birthday: string; // ISO date string
  anniversary?: string | null;
  relatedPersons: string[];
  interests: string[];
  socialLinks: {
    linkedIn?: string;
    whatsapp?: string;
    twitter?: string;
    [key: string]: string | undefined;
  };
  notes: string;
  reminders: string[]; // IDs
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
