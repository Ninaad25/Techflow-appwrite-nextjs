import { databases, users } from "@/models/server/config";
import React from "react";
import QuestionCard from "@/components/QuestionCard";
import { UserPrefs } from "@/store/Auth";
import { QuestionDocument } from "@/app/questions/[questId]/[questName]/appwrite";
import {
  answerCollection,
  db,
  questionCollection,
  voteCollection,
} from "@/models/name";
import { Query } from "node-appwrite";
import { notFound } from "next/navigation";
import Pagination from "@/components/Pagination";

type Params = { userId: string; userSlug: string };

const Page = async ({
  searchParams,
  params,
}: {
  searchParams: { page?: string; tag?: string; search?: string };
  params: Promise<Params>;
}) => {
  const pageNum = parseInt(searchParams.page || "1", 10);
  const limit = 25;

  try {
    const resolvedParams = await params;
    const { userId } = resolvedParams;

    const queries = [
      Query.orderDesc("$createdAt"),
      Query.offset((pageNum - 1) * limit),
      Query.limit(limit),
      Query.equal("authorId", userId),
    ];

    if (searchParams.tag) {
      queries.push(Query.equal("tags", searchParams.tag));
    }

    if (searchParams.search) {
      queries.push(
        Query.or([
          Query.search("title", searchParams.search),
          Query.search("content", searchParams.search),
        ])
      );
    }

    const questions = await databases.listDocuments(
      db,
      questionCollection,
      queries
    );

    // Enrich questions with author and stats
    const enrichedQuestions = await Promise.all(
      questions.documents.map(async (ques) => {
        const [author, answers, votes] = await Promise.all([
          users.get(ques.authorId).catch(() => null),
          databases
            .listDocuments(db, answerCollection, [
              Query.equal("questionId", ques.$id),
              Query.limit(1),
            ])
            .catch(() => ({ total: 0 })),
          databases
            .listDocuments(db, voteCollection, [
              Query.equal("type", "question"),
              Query.equal("typeId", ques.$id),
              Query.limit(1),
            ])
            .catch(() => ({ total: 0 })),
        ]);

        return {
          ...ques,
          totalAnswers: answers.total,
          totalVotes: votes.total,
          author: author
            ? {
                $id: author.$id,
                reputation: author.prefs?.reputation ?? 0,
                name: author.name,
              }
            : {
                $id: "unknown",
                reputation: 0,
                name: "Unknown User",
              },
        } as QuestionDocument;
      })
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {questions.total} question{questions.total !== 1 ? "s" : ""}
          </h2>
        </div>

        <div className="space-y-4">
          {enrichedQuestions.map((ques) => (
            <QuestionCard key={ques.$id} ques={ques} />
          ))}
        </div>

        {questions.total > limit && (
          <Pagination total={questions.total} limit={limit} className="mt-8" />
        )}

        {questions.total === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No questions found.</p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error fetching questions:", error);
    notFound();
  }
};

export default Page;
