import { avatars } from "@/models/client/config";
import { users } from "@/models/server/config";
import type { UserPrefs } from "@/store/Auth";
import convertDateToRelativeTime from "@/utils/relativeTime";
import React from "react";
import EditButton from "./EditButton";
import Navbar from "./Navbar";
import { IconClockFilled, IconUserFilled } from "@tabler/icons-react";
import { notFound } from "next/navigation";

type Params = { userId: string; userSlug: string };

const isValidUserId = (userId: string): boolean => {
  const regex = /^[a-zA-Z0-9][a-zA-Z0-9_]{0,35}$/;
  return regex.test(userId);
};

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Params>;
}) {
  const { userId, userSlug } = await params;

  if (!isValidUserId(userId)) {
    notFound();
  }

  try {
    const user = await users.get<UserPrefs>(userId);
    if (!user) {
      notFound();
    }

    const avatarUrl = avatars.getInitials(user.name || "User", 120, 120);

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Profile Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8 flex items-start space-x-6">
              <div className="flex-shrink-0">
                <img
                  className="h-24 w-24 rounded-full border-4 border-white shadow-lg"
                  src={avatarUrl} // No `.href` since this returns string URL
                  alt={user.name || "User avatar"}
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.name || "User"
                    )}&size=120&background=f97316&color=ffffff`;
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 truncate">
                      {user.name || "Anonymous User"}
                    </h1>
                    <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <IconUserFilled className="w-4 h-4 mr-1" />
                        <span>Reputation: {user.prefs.reputation}</span>
                      </div>
                      <div className="flex items-center">
                        <IconClockFilled className="w-4 h-4 mr-1" />
                        <span>
                          Member since{" "}
                          {convertDateToRelativeTime(new Date(user.$createdAt))}
                        </span>
                      </div>
                    </div>
                  </div>
                  <EditButton />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navbar */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Navbar />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </div>
    );
  } catch (err) {
    console.error("Error fetching user:", err);
    notFound();
  }
}
