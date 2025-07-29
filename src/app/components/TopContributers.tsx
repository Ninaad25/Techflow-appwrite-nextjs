"use client";

import { cn } from "@/lib/utils";
import { AnimatedList } from "@/components/magicui/animated-list";
import { avatars, users } from "@/models/server/config";
import { Models, Query } from "node-appwrite";
import { UserPrefs } from "@/store/Auth";
import React, { useState, useEffect } from "react";
import convertDateToRelativeTime from "@/utils/relativeTime";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";

const Notification = ({ user }: { user: Models.User<UserPrefs> }) => {
  const [avatarSrc, setAvatarSrc] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    let objectUrl = "";

    const loadAvatar = async (): Promise<void> => {
      try {
        const arrayBuffer = await avatars.getInitials(user.name, 40, 40);

        if (!mounted) return;

        const blob: Blob = new Blob([arrayBuffer], { type: "image/png" });
        objectUrl = URL.createObjectURL(blob);

        setAvatarSrc(objectUrl);
      } catch (e) {
        console.error("Error loading avatar:", e);
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadAvatar();

    return () => {
      mounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [user.name]);

  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-[400px] transform cursor-pointer overflow-hidden rounded-2xl p-4",
        "transition-all duration-200 ease-in-out hover:scale-[103%]",
        "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        "dark:bg-gray-800 dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)]"
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <picture>
          {loading ? (
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
          ) : error ? (
            <div className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-xs font-bold">!</span>
            </div>
          ) : (
            <img
              src={avatarSrc}
              alt={`${user.name}'s avatar`}
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
        </picture>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium dark:text-white">
            <span className="text-sm sm:text-lg truncate">{user.name}</span>
            <span className="mx-1">·</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {convertDateToRelativeTime(new Date(user.$updatedAt))}
            </span>
          </figcaption>
          <p className="text-sm font-normal text-gray-600 dark:text-white/60">
            <span>Reputation</span>
            <span className="mx-1">·</span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              {user.prefs?.reputation ?? 0}
            </span>
          </p>
        </div>
      </div>
    </figure>
  );
};

// ✅ Removed explicit return type - let TypeScript infer
export default function TopContributors() {
  const [usersList, setUsersList] = useState<Models.User<UserPrefs>[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async (): Promise<void> => {
      try {
        const topUsers = await users.list<UserPrefs>([
          Query.orderDesc("prefs.reputation"),
          Query.limit(10),
        ]);
        setUsersList(topUsers.users);
      } catch (e) {
        console.error("Failed to load top contributors:", e);
        setError("Oops! Failed to load contributors");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="relative flex min-h-[400px] w-full items-center justify-center rounded-lg bg-amber-500 p-6 shadow-lg">
        <p className="text-white font-medium">Loading contributors...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative flex min-h-[400px] w-full items-center justify-center rounded-lg bg-red-400 p-6 shadow-lg">
        <p className="text-white font-medium">{error}</p>
      </div>
    );
  }

  if (!usersList.length) {
    return (
      <div className="relative flex min-h-[400px] w-full items-center justify-center rounded-lg bg-amber-500 p-6 shadow-lg">
        <p className="text-white font-medium">No contributors yet!</p>
      </div>
    );
  }

  return (
    <BackgroundBeamsWithCollision>
      <div className="relative flex max-h-[700px] min-h-[400px] w-full flex-col overflow-hidden rounded-lg bg-amber-500 p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-white">Top Contributors</h2>
        <AnimatedList>
          {usersList.map((user) => (
            <Notification user={user} key={user.$id} />
          ))}
        </AnimatedList>
      </div>
    </BackgroundBeamsWithCollision>
  );
}
