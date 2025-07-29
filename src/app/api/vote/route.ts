import { NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import {
  databaseId,
  voteCollection,
  questionCollection,
  answerCollection,
} from "@/models/name";
import { Query } from "node-appwrite";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const voteStatus = searchParams.get("voteStatus") as
      | "upvoted"
      | "downvoted"
      | null;
    const pageParam = parseInt(searchParams.get("page") || "1", 10);

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const limit = 25;
    const offset = (pageParam - 1) * limit;
    const queries: any[] = [
      Query.equal("votedById", userId),
      Query.orderDesc("$createdAt"),
      Query.offset(offset),
      Query.limit(limit),
    ];
    if (voteStatus) queries.push(Query.equal("voteStatus", voteStatus));

    // Use databaseId here
    const votesResponse = await databases.listDocuments(
      databaseId,
      voteCollection,
      queries
    );
    const { documents: votes, total } = votesResponse;

    const enriched = await Promise.all(
      votes.map(async (vote) => {
        try {
          const target =
            vote.type === "question" ? questionCollection : answerCollection;
          const doc = await databases.getDocument(
            databaseId,
            target,
            vote.typeId,
            [Query.select(["title"])]
          );
          return { ...vote, questionTitle: doc.title };
        } catch {
          return { ...vote, questionTitle: "Content not found" };
        }
      })
    );

    return NextResponse.json({ documents: enriched, total });
  } catch (err: any) {
    console.error("Error in /api/vote:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
