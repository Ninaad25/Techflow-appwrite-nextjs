import React from "react";
import { Models } from "node-appwrite";
import { Query } from "node-appwrite";

import { databases, users } from "@/models/server/config";
import {
  db,
  questionCollection,
  answerCollection,
  voteCollection,
  commentCollection,
} from "@/models/name";
import Pagination from "@/components/Pagination";
import VoteButtons from "@/components/VoteButtons";
import Comments from "@/components/Comments";
import { MarkdownPreview } from "@/components/RTE";
import convertDateToRelativeTime from "@/utils/relativeTime";


// Interfaces for author info
interface Author {
  $id: string;
  name: string;
  reputation: number;
}

// Question document interface with additional fields
export interface QuestionDocument extends Models.Document {
  title: string;
  content?: string;
  tags?: string[];
  $sequence?: number;
  author?: {
    $id: string;
    reputation?: number;
    name: string;
  };
  totalAnswers: number;
  totalVotes: number;
  votes?: Models.Document[]; // Optional, can contain vote docs if needed
  answers?: Models.Document[]; // Optional - raw answer docs if needed
  comments?: CommentList;
}

// Vote document and vote list interfaces
interface VoteDocument extends Models.Document {
  authorId: string;
  voteStatus: "upvoted" | "downvoted";
  author: Author;
}

interface Votes {
  documents: VoteDocument[];
  total: number;
}

// Comment document and comment list interfaces
interface CommentDocument extends Models.Document {
  authorId: string;
  content: string;
  createdAt: string;
  author: Author;
}

interface CommentList {
  documents: CommentDocument[];
  total: number;
}

// Answer document interface with votes and comments
interface AnswerDocument extends Models.Document {
  authorId: string;
  author: Author;
  content: string;
  upvotesDocuments: Votes;
  downvotesDocuments: Votes;
  comments: CommentList;
}

interface AnswerDocumentList {
  documents: AnswerDocument[];
  total: number;
}

const QuesPage = async ({
  params,
  searchParams,
}: {
  params: { userId: string; userSlug: string };
  searchParams?: { page?: string };
}) => {
  const pageNum = Number(searchParams?.page ?? "1");
  const queries = [
    Query.equal("authorId", params.userId),
    Query.orderDesc("$createdAt"),
    Query.offset((pageNum - 1) * 25),
    Query.limit(25),
  ];

  // Fetch questions
  const questionsResponse = await databases.listDocuments(
    db,
    questionCollection,
    queries
  );

  // Enrich questions with author, total answers, votes, $sequence, etc.
  const enrichedQuestions: QuestionDocument[] = await Promise.all(
    questionsResponse.documents.map(async (ques): Promise<QuestionDocument> => {
      const [author, answers, votes] = await Promise.all([
        users.get(ques.authorId),
        databases.listDocuments(
          db,
          answerCollection,
          [Query.equal("questionId", ques.$id), Query.limit(1)] // Getting count by total, limit 1 for efficiency
        ),
        databases.listDocuments(db, voteCollection, [
          Query.equal("type", "question"),
          Query.equal("typeId", ques.$id),
          Query.limit(1),
        ]),
      ]);

      return {
        ...ques,
        authorId: ques.authorId,
        $sequence: (ques as any).$sequence ?? 0,
        title: ques.title ?? "Untitled",
        content: ques.content ?? "",
        tags: ques.tags ?? [],
        totalAnswers: answers.total,
        totalVotes: votes.total,
        author: {
          $id: author.$id,
          name: author.name,
          reputation: author.prefs?.reputation ?? 0,
        },
        comments: { documents: [], total: 0 }, 
        // If you want to populate question comments here, do so
        votes: [], // Optionally fill with vote docs if needed
        answers: [], // Optionally fill with answer docs if needed
      };
    })
  );

  // For demo, render a simple list and details. Replace with your UI components as needed.
  return (
    <>
      <h2>
        {questionsResponse.total} Questions by user {params.userSlug}
      </h2>
      {enrichedQuestions.map((q) => (
        <article key={q.$id} className="mb-4 border rounded p-4">
          <h3 className="text-xl font-semibold">{q.title}</h3>
          <p className="text-sm text-gray-600">
            Asked {convertDateToRelativeTime(new Date(q.$createdAt))} by{" "}
            {q.author?.name ?? "Unknown"} (Rep: {q.author?.reputation ?? 0})
          </p>
          <p>{q.content}</p>
          <p className="mt-2">
            Votes: {q.totalVotes} | Answers: {q.totalAnswers} | Tags:{" "}
            {(q.tags ?? []).join(", ")}
          </p>
          {/* Add any further UI like VoteButtons, Comments, Answers list here */}
        </article>
      ))}
      {questionsResponse.total === 0 && (
        <p className="text-center text-gray-500">No questions found.</p>
      )}
      <Pagination
        className="bg-gray-200"
        total={questionsResponse.total}
        limit={25}
      />
    </>
  );
};

export default QuesPage;
