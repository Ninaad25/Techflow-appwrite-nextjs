import { Models } from "appwrite";

export interface UserPrefs extends Models.Document {
  // Appwrite system fields: $id, $createdAt, etc. are in Models.Document
  name: string;
  email?: string;
  // The prefs map contains your custom fields (e.g. reputation)
  prefs: {
    reputation: number;
    // add any other custom pref keys here
    [key: string]: any;
  };
}
