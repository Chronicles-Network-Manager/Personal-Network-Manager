import { supabase } from "@/lib/supbaseClient"
import GetContactForUserIdDTO from "@/types/InputDTO/GetContactForUserIdDTO";
import ContactsTable from "@/types/Supabase/ContactsTable";
import LocationTable from "@/types/Supabase/LocationTable";
import RemindersTable from "@/types/Supabase/RemindersTable";
import SocialsTable from "@/types/Supabase/SocialsTable";

export async function getAllContacts(): Promise<ContactsTable[]> {
  const { data, error } = await supabase.from('Contacts').select('*');

  if (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }

  return data as ContactsTable[];
}

export async function getAllLocations(): Promise<LocationTable[]> {
  const { data, error } = await supabase.from('Locations').select('*');

  if (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }

  return data as LocationTable[];
}

export async function getAllSocials(): Promise<SocialsTable[]> {
  const { data, error } = await supabase.from('Socials').select('*');

  if (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }

  return data as SocialsTable[];
}

export async function getAllReminders(): Promise<RemindersTable[]> {
  const { data, error } = await supabase.from('Reminders').select('*');

  if (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }

  return data as RemindersTable[];
}

export async function getContactWithAllDetails(userId?: string) {
  const { data, error } = await supabase
    .from("Contacts")
    .select(`
      *,
      Location(*),
      Socials(*),
      Reminders(*)
    `)
    .eq("userId", userId)
    .single();

  if (error) {
    console.error("Error fetching contact with details:", error);
  }

  return { data, error };
}

export async function getAllContactWithAllDetails() {
  const { data, error } = await supabase
    .from("Contacts")
    .select(`
      *,
      Location(*),
      Socials(*),
      Reminders(*)
    `);

  if (error) {
    console.error("Error fetching contact with details:", error);
  }

  return { data, error };
}