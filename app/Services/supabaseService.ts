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

export async function updateContact(
  userId: string,
  contactData: Partial<ContactsTable>
) {
  // Remove undefined values to avoid issues
  const cleanedData = Object.fromEntries(
    Object.entries(contactData).filter(([_, v]) => v !== undefined)
  );

  const { data, error } = await supabase
    .from("Contacts")
    .update({
      ...cleanedData,
      updatedAt: new Date().toISOString(),
    })
    .eq("userId", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating contact:", error);
    console.error("Attempted data:", cleanedData);
  }

  return { data, error };
}

export async function updateLocation(
  locationId: string,
  locationData: Partial<LocationTable>
) {
  const { data, error } = await supabase
    .from("Location")
    .update({
      ...locationData,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", locationId)
    .select()
    .single();

  if (error) {
    console.error("Error updating location:", error);
  }

  return { data, error };
}

export async function upsertSocials(userId: string, socialData: Partial<SocialsTable>) {
  // Remove undefined values
  const cleanedData = Object.fromEntries(
    Object.entries(socialData).filter(([_, v]) => v !== undefined && v !== "")
  );

  // First, try to get existing socials
  const { data: existing, error: fetchError } = await supabase
    .from("Socials")
    .select("id")
    .eq("userId", userId)
    .maybeSingle();

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error("Error fetching socials:", fetchError);
    return { data: null, error: fetchError };
  }

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from("Socials")
      .update({
        ...cleanedData,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating socials:", error);
      console.error("Attempted data:", cleanedData);
    }
    return { data, error };
  } else {
    // Insert new
    const { data, error } = await supabase
      .from("Socials")
      .insert({
        userId,
        ...cleanedData,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating socials:", error);
      console.error("Attempted data:", { userId, ...cleanedData });
    }
    return { data, error };
  }
}

export async function upsertLocations(
  userId: string,
  locations: Array<Partial<LocationTable>>,
  locationType: LocationType
) {
  // If no locations to insert, return success
  if (!locations || locations.length === 0) {
    return { data: [], error: null };
  }

  // Prepare locations for insert (only new ones with city and country)
  const locationsToInsert = locations
    .filter(loc => loc.city && loc.country && loc.city.trim() !== "" && loc.country.trim() !== "") // Only insert if city and country are provided
    .map(loc => ({
      userId,
      type: locationType,
      city: loc.city!.trim(),
      country: loc.country!.trim(),
      address: loc.address?.trim() || null,
      address2: loc.address2?.trim() || null,
      postalcode: loc.postalcode?.trim() || null,
      state: loc.state?.trim() || null,
      latitude: loc.latitude || 0,
      longitude: loc.longitude || 0,
      comments: loc.comments?.trim() || null,
    }));

  if (locationsToInsert.length === 0) {
    return { data: [], error: null };
  }

  // Insert new locations (append to existing)
  const { data, error } = await supabase
    .from("Location")
    .insert(locationsToInsert)
    .select();

  if (error) {
    console.error(`Error inserting ${locationType} locations:`, error);
    console.error("Attempted data:", locationsToInsert);
  }

  return { data, error };
}

export async function upsertReminder(
  reminderId: string | null,
  userId: string,
  reminderData: {
    type: string;
    message?: string;
    date: string;
    isRecurring?: boolean;
    recurringType: string;
    send?: string;
  }
) {
  const cleanedData = Object.fromEntries(
    Object.entries(reminderData).filter(([_, v]) => v !== undefined && v !== "")
  );

  if (reminderId) {
    // Update existing reminder
    const { data, error } = await supabase
      .from("Reminders")
      .update({
        ...cleanedData,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", reminderId)
      .select()
      .single();

    if (error) {
      console.error("Error updating reminder:", error);
    }
    return { data, error };
  } else {
    // Insert new reminder
    const { data, error } = await supabase
      .from("Reminders")
      .insert({
        userId,
        ...cleanedData,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating reminder:", error);
    }
    return { data, error };
  }
}

export async function deleteReminder(reminderId: string) {
  const { data, error } = await supabase
    .from("Reminders")
    .delete()
    .eq("id", reminderId)
    .select()
    .single();

  if (error) {
    console.error("Error deleting reminder:", error);
  }
  return { data, error };
}