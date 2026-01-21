import { LocationType } from "../Enums/LocationType";

export default interface LocationTable {
  id: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  address?: string;
  address2?: string;
  city: string; // NOT NULL
  postalcode?: string;
  country: string; // NOT NULL
  latitude?: number; // double precision, nullable
  longitude?: number; // double precision, nullable
  userId: string; // NOT NULL
  type: LocationType; // NOT NULL
  comments?: string;
  state?: string; // text, nullable
}