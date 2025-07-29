import { databases, users } from "@/models/server/config";
import type { UserPrefs } from "@/store/Auth";
import React from "react";
import { MagicCard, MagicContainer } from "@/components/magicui/magic-card";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { answerCollection, databaseId, questionCollection } from "@/models/name";
import { Query } from "node-appwrite";
import { notFound } from "next/navigation";

type Params = { userId: string; userSlug: string };

export default async function UserPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { userId } = await params;

  try {
    const [user, questionsRes, answersRes] = await Promise.all([
      users.get<UserPrefs>(userId),
      databases.listDocuments(databaseId, questionCollection, [
        Query.equal("authorId", userId),
        Query.limit(1),
      ]),
      databases.listDocuments(databaseId, answerCollection, [
        Query.equal("authorId", userId),
        Query.limit(1),
      ]),
    ]);

    if (!user) {
      notFound();
    }

    return (
      <div className="space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MagicContainer className="h-[200px]">
            <MagicCard>
              <div className="text-3xl font-bold text-orange-500">
                <NumberTicker value={user.prefs.reputation} />
              </div>
              <p className="text-sm text-gray-600 mt-2">Reputation Points</p>
            </MagicCard>
          </MagicContainer>
          <MagicContainer className="h-[200px]">
            <MagicCard>
              <div className="text-3xl font-bold text-blue-500">
                <NumberTicker value={questionsRes.total} />
              </div>
              <p className="text-sm text-gray-600 mt-2">Questions Asked</p>
            </MagicCard>
          </MagicContainer>
          <MagicContainer className="h-[200px]">
            <MagicCard>
              <div className="text-3xl font-bold text-green-500">
                <NumberTicker value={answersRes.total} />
              </div>
              <p className="text-sm text-gray-600 mt-2">Answers Provided</p>
            </MagicCard>
          </MagicContainer>
        </div>

        {/* About */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-4">About</h2>
          <div>
            <strong>Member Since:</strong>{" "}
            {new Date(user.$createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div className="mt-2">
            <strong>User ID:</strong> <code>{user.$id}</code>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <p className="text-gray-500">
            No recent activity to display. Start by asking questions or
            providing answers!
          </p>
        </div>
      </div>
    );
  } catch (err) {
    console.error("Error loading profile:", err);
    notFound();
  }
}
