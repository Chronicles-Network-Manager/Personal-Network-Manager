import { LocationType } from "../Enums/LocationType";

export default interface LocationTable {
  id: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  address: string;
  address2?: string;
  city: string;
  postalcode?: string;
  country: string;
  latitude: number;
  longitude: number;
  userId: string;
  type: LocationType;
  comments?: string;
}