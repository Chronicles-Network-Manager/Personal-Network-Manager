import { Group } from "../Enums/Group";
import { Pair } from "../Utils/Pair";

export default interface ContactsTable {
  userId: string;
  firstName: string;
  lastName: string;
  middleNames?: string;
  phone: string;
  email: string;
  otherPhones?: string[];
  otherEmails?: string[];
  jobTitle?: string;
  company?: string;
  work?: string;
  notes?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  groups?: Group[];
  interests?: Pair[] | Record<string, any>; // jsonb can be any JSON structure
  yoe?: number; // integer with CHECK (yoe > 0)
  workLink?: string;
  favourites?: string;
}