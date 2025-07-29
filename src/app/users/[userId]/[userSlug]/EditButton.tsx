"use client";

import { useAuthStore } from "@/store/Auth";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

const EditButton = () => {
  const { userId, userSlug } = useParams();
  const { user } = useAuthStore();

  // Only show edit button if current user matches the profile user
  if (user?.$id !== userId) return null;

  return (
    <Link
      href={`/users/${userId}`}
      className="inline-flex items-center px-4 py-2 bg-orange-500 text-white font-medium text-sm rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors duration-200"
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
      Edit Profile
    </Link>
  );
};

export default EditButton;
