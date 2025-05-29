import { Contact } from "@/types/contact";
import { getAllContactWithAllDetails } from "./supabaseService";

import { LocationData } from "@/types/locationData";
import { SocialData } from "@/types/socialData";
import GetContactForUserIdDTO from "@/types/InputDTO/GetContactForUserIdDTO";
import { LocationType } from "@/types/Enums/LocationType";
import LocationTable from "@/types/Supabase/LocationTable";

export async function getDataForContactsSection(): Promise<{
  data: Contact[] | null;
  error: any;
}> {
  const { data, error } = await getAllContactWithAllDetails();

  if (error || !data) return { data: null, error };

  const mappedData: Contact[] = data.map((contact: GetContactForUserIdDTO) => {

    const location: LocationData | undefined = contact.Location.find(
    loc => loc.type === LocationType.CURRENT
    ) && mapLocationTableToLocationData(contact.Location.find(loc => loc.type === LocationType.CURRENT)!);

    const pastLocations: LocationData[] = contact.Location
    .filter(loc => loc.type === LocationType.PREVIOUS)
    .map(mapLocationTableToLocationData);

    const visited: LocationData[] = contact.Location
    .filter(loc => loc.type === LocationType.VISITED)
    .map(mapLocationTableToLocationData);

    const socialLinks: SocialData = {
      instagram: contact.Socials[0]?.instagram || "",
      linkedin: contact.Socials[0]?.linkedin || "",
      discord: contact.Socials[0]?.discord || "",
      reddit: contact.Socials[0]?.reddit || "",
      github: contact.Socials[0]?.github || "",
      other: contact.Socials[0]?.other || "",
    };

    const reminders: string[] = contact.Reminders.map(r => r.id);

    return {
      userId: contact.userId,
      firstName: contact.firstName,
      lastName: contact.lastName,
      middleName: contact.middleName,
      phone: contact.phone,
      email: contact.email,
      otherPhones: contact.otherPhones || [],
      otherEmails: contact.otherEmails || [],
      jobTitle: contact.jobTitle,
      company: contact.company,
      work: contact.work,
      birthday: contact.birthday,
      anniversaries: contact.anniversaries || [],
      notes: contact.notes,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
      groups: contact.groups,
      interests: contact.interests,

      location: location!,
      pastLocations,
      visited,
      socialLinks,
      reminders,
    };
  });

  console.log("Mapped Contacts Data:", mappedData);
  
  return { data: mappedData, error: error };
}

function mapLocationTableToLocationData(location: LocationTable): LocationData {
  return {
    address: location.address,
    city: location.city,
    country: location.country,
    latitude: location.latitude,
    longitude: location.longitude,
  };
}