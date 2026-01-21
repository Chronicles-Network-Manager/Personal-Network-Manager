import { Group } from "./Enums/Group";
import { LocationData } from "./locationData";
import { SocialData } from "./socialData";
import { Pair } from "./Utils/Pair";
import RemindersTable from "./Supabase/RemindersTable";

export interface Contact {
  userId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone: string;
  email: string;
  otherPhones?: string[];
  otherEmails?: string[];
  jobTitle: string;
  company: string;
  work: string,
  birthday: string;
  anniversaries?: string[];
  notes?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  groups: Group[];
  interests: Pair[];

  location: LocationData;
  pastLocations: LocationData[];
  visited: LocationData[];
   
  socialLinks: SocialData
  reminders: RemindersTable[]; // Full reminder objects
}
