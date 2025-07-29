// src/store/Auth.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { AppwriteException } from "node-appwrite";
import { Models, ID } from "appwrite";
import { account } from "@/models/client/config";

// Define your custom preferences type
interface CustomPrefs {
  reputation: number;
  [key: string]: any;
}

// UserPrefs extends Models.User to correctly reflect Appwrite response shape with custom prefs
export type UserPrefs = Models.User<CustomPrefs>;

interface IAuthStore {
  session: Models.Session | null;
  jwt: string | null;
  user: UserPrefs | null; // Use UserPrefs to include prefs property
  hydrated: boolean;
  setHydrated(): void;
  verifySession(): Promise<void>;
  login(
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: AppwriteException | null }>;
  createAccount(
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: AppwriteException | null }>;
  logout(): Promise<void>;
}

export const useAuthStore = create<IAuthStore>()(
  persist(
    immer((set) => ({
      session: null,
      jwt: null,
      user: null,
      hydrated: false,
      setHydrated() {
        set({ hydrated: true });
      },
      async verifySession() {
        try {
          const session = await account.getSession("current");
          set({ session });
        } catch {
          set({ session: null });
        }
      },
      async login(email, password) {
        try {
          const session = await account.createEmailPasswordSession(
            email,
            password
          );
          const [user, { jwt }] = await Promise.all([
            account.get<UserPrefs>(),
            account.createJWT(),
          ]);

          if (!user.prefs) {
            // If prefs missing (first login), initialize reputation to 0
            await account.updatePrefs({ reputation: 0 });
            // Optionally refetch user after prefs update
          }

          set({ session, user, jwt });
          return { success: true };
        } catch (error: any) {
          console.error("Login error:", error);
          return {
            success: false,
            error: error instanceof AppwriteException ? error : null,
          };
        }
      },
      async createAccount(name, email, password) {
        try {
          await account.create(ID.unique(), email, password, name);
          return { success: true };
        } catch (error: any) {
          console.error("Create account error:", error);
          return {
            success: false,
            error: error instanceof AppwriteException ? error : null,
          };
        }
      },
      async logout() {
        try {
          await account.deleteSessions();
          set({ session: null, user: null, jwt: null });
        } catch (error: any) {
          console.error("Logout error:", error);
        }
      },
    })),
    {
      name: "auth",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
