// src/app/users/[userId]/[userSlug]/answers/page.tsx
import Pagination from "@/components/Pagination";
import {
  databaseId,
  answerCollection,
  questionCollection,
} from "@/models/name";
import { databases } from "@/models/server/config";
import convertDateToRelativeTime from "@/utils/relativeTime";
import slugify from "@/utils/slugify";
import Link from "next/link";
import { Query } from "node-appwrite";
import React from "react";

type Params = { userId: string; userSlug: string };
type SearchParams = { page?: string };

interface AnswerDoc {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  authorId: string;
  questionId: string;
  content: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
}

interface QuestionTitle {
  $id: string;
  title: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
}

export default async function AnswersPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { userId } = await params;
  const { page = "1" } = await searchParams;
  const currentPage = parseInt(page, 10);
  const limit = 25;
  const offset = (currentPage - 1) * limit;

  // 1. Fetch raw answers
  const response = await databases.listDocuments<AnswerDoc>(
    databaseId,
    answerCollection,
    [
      Query.equal("authorId", userId),
      Query.orderDesc("$createdAt"),
      Query.offset(offset),
      Query.limit(limit),
    ]
  );
  const answers = response.documents;
  const total = response.total;

  // 2. Enrich with question titles
  const enriched = await Promise.all(
    answers.map(async (ans) => {
      try {
        const q = await databases.getDocument<QuestionTitle>(
          databaseId,
          questionCollection,
          ans.questionId,
          [Query.select(["title"])]
        );
        return { ...ans, question: q };
      } catch {
        return {
          ...ans,
          question: { $id: ans.questionId, title: "Question not found" },
        };
      }
    })
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {total} {total === 1 ? "Answer" : "Answers"}
      </h1>

      {enriched.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No answers yet</h3>
          <p>This user hasn't provided any answers yet.</p>
        </div>
      ) : (
        enriched.map((ans) => (
          <div key={ans.$id} className="bg-white p-6 rounded shadow">
            <div className="mb-4">
              <Link
                href={`/questions/${ans.questionId}/${slugify(
                  ans.question.title
                )}`}
                className="text-blue-600 hover:underline"
              >
                {ans.question.title}
              </Link>
            </div>
            <div className="mb-4">{ans.content}</div>
            <div className="text-sm text-gray-500 flex justify-between">
              <span>
                Answered {convertDateToRelativeTime(new Date(ans.$createdAt))}
              </span>
              <Link
                href={`/questions/${ans.questionId}/${slugify(
                  ans.question.title
                )}#answer-${ans.$id}`}
                className="text-orange-500 hover:underline"
              >
                View Answer
              </Link>
            </div>
          </div>
        ))
      )}

      {total > limit && (
        <div className="flex justify-center">
          <Pagination total={total} limit={limit} />
        </div>
      )}
    </div>
  );
}
