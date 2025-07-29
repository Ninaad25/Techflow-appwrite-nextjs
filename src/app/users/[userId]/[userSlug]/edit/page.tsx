"use client";

import { useAuthStore } from "@/store/Auth";
import { useParams, useRouter } from "next/navigation";
import React from "react";

const EditUserPage = () => {
  const { userId } = useParams();
  const { user } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Check if user is authorized to edit this profile
    if (!user || user.$id !== userId) {
      router.push(`/users/${userId}`);
      return;
    }

    setIsLoading(false);
  }, [user, userId, router]);

  // Show loading while checking authorization
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authorized, don't render anything (redirect is handled in useEffect)
  if (!user || user.$id !== userId) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>

        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Profile editing coming soon
          </h3>
          <p className="text-gray-500 mb-4">
            Profile editing functionality will be available in a future update.
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white font-medium text-sm rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserPage;
