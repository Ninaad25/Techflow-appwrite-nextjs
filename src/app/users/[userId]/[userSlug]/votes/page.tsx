import Pagination from "@/components/Pagination";
import Link from "next/link";
import slugify from "@/utils/slugify";
import convertDateToRelativeTime from "@/utils/relativeTime";

type Vote = {
  $id: string;
  type: "question" | "answer";
  typeId: string;
  voteStatus: "upvoted" | "downvoted";
  $createdAt: string;
  // Add questionTitle in your API response
  questionTitle: string;
};

export default async function VotePage({
  params,
  searchParams,
}: {
  params: { userId: string; userSlug: string };
  searchParams: { page?: string; voteStatus?: string };
}) {
  const { userId, userSlug } = params;
  const page = parseInt(searchParams.page || "1", 10);
  const voteStatusQuery = searchParams.voteStatus
    ? `&voteStatus=${searchParams.voteStatus}`
    : "";

  // Call your own API
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/vote?userId=${encodeURIComponent(
      userId
    )}&page=${page}${voteStatusQuery}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to load votes");
  const { documents: votes, total } = (await res.json()) as {
    documents: Vote[];
    total: number;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {total} {total === 1 ? "Vote" : "Votes"}
      </h1>

      {votes.length === 0 ? (
        <p className="text-center text-gray-500">No votes to display.</p>
      ) : (
        <div className="space-y-4">
          {votes.map((vote) => (
            <div
              key={vote.$id}
              className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md"
            >
              <div className="flex justify-between items-center">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    vote.voteStatus === "upvoted"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {vote.voteStatus === "upvoted" ? "↑ Upvoted" : "↓ Downvoted"}
                </span>
                <time className="text-sm text-gray-500">
                  {convertDateToRelativeTime(new Date(vote.$createdAt))}
                </time>
              </div>
              <Link
                href={`/questions/${vote.typeId}/${slugify(
                  vote.questionTitle
                )}`}
                className="mt-2 block text-lg text-blue-600 hover:underline"
              >
                {vote.questionTitle}
              </Link>
            </div>
          ))}
        </div>
      )}

      {total > 25 && (
        <div className="flex justify-center">
          <Pagination total={total} limit={25} />
        </div>
      )}
    </div>
  );
}
