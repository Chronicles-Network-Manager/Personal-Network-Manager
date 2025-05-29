import { Group } from "../Enums/Group";
import LocationTable from "../Supabase/LocationTable";
import RemindersTable from "../Supabase/RemindersTable";
import SocialsTable from "../Supabase/SocialsTable";
import { Pair } from "../Utils/Pair";

export default interface GetContactForUserIdDTO {
    Location: LocationTable[];
    Reminders: RemindersTable[];
    Socials: SocialsTable[];
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
}