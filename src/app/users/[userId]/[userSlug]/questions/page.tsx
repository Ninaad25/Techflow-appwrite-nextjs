import React from "react";

import Pagination from "@/components/Pagination";
import QuestionCard from "@/components/QuestionCard";

import {
  answerCollection,
  db,
  questionCollection,
  voteCollection,
} from "@/models/name";

import { databases, users } from "@/models/server/config";

import { Query } from "node-appwrite";

import { Models } from "node-appwrite"; // For base Document type

// Define Author interface used in QuestionDocument
interface Author {
  $id: string;
  reputation: number;
  name: string;
  authorId?: string; // Optional, if needed for other purposes
}

// Extend Appwrite Document model with needed fields for the question
export interface QuestionDocument extends Models.Document {
  authorId: string;
  $sequence: number;
  totalAnswers: number;
  totalVotes: number;
  author: Author;
  votes?: any[];
  answers?: any[];
  title: string;
  tags: string[];
}

const Page = async ({
  params,
  searchParams,
}: {
  params: { userId: string; userSlug: string };
  searchParams: { page?: string };
}) => {
  searchParams.page ||= "1";

  // Build Appwrite queries
  const queries = [
    Query.equal("authorId", params.userId),
    Query.orderDesc("$createdAt"),
    Query.offset((+searchParams.page - 1) * 25),
    Query.limit(25),
  ];

  // Fetch question documents
  const questionsResponse = await databases.listDocuments(
    db,
    questionCollection,
    queries
  );

  // Map documents to include author, votes, answers, and ensure $sequence presence
  const enrichedDocuments: QuestionDocument[] = await Promise.all(
    questionsResponse.documents.map(async (ques): Promise<QuestionDocument> => {
      const [author, answers, votes] = await Promise.all([
        users.get(ques.authorId),
        databases.listDocuments(db, answerCollection, [
          Query.equal("questionId", ques.$id),
          Query.limit(1),
        ]),
        databases.listDocuments(db, voteCollection, [
          Query.equal("type", "question"),
          Query.equal("typeId", ques.$id),
          Query.limit(1),
        ]),
      ]);
      return {
        ...ques,
        authorId: ques.authorId, // <--- Required property added here
        $sequence: ques.$sequence ?? 0,
        author: {
          $id: author.$id,
          reputation: author.prefs?.reputation ?? 0,
          name: author.name,
        },
        totalAnswers: answers.total,
        totalVotes: votes.total,
        votes: [],
        answers: [],
        title: ques.title ?? "Untitled",
        tags: ques.tags ?? [],
      };
    })
  );


  return (
    <>
      <h2>{questionsResponse.total} questions</h2>

      {enrichedDocuments.map((ques) => (
        <QuestionCard key={ques.$id} ques={ques} />
      ))}

      {/* You can add Pagination here if needed */}
      {/* <Pagination currentPage={+searchParams.page} totalCount={questionsResponse.total} /> */}
    </>
  );
};

export default Page;
