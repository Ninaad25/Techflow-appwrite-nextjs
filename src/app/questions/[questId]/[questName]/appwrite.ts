import { Models } from "node-appwrite";

export interface QuestionDocument extends Models.Document {
  title: string;
  content: string;
  tags: string[];
  authorId: string;
  $createdAt: string;
  $updatedAt: string;

  // Computed fields added during enrichment
  totalAnswers?: number;
  totalVotes?: number;
  author?: {
    $id: string;
    name: string;
    reputation: number;
  };
}

export interface AnswerDocument extends Models.Document {
  content: string;
  authorId: string;
  questionId: string;
  isAccepted?: boolean;
  $createdAt: string;
  $updatedAt: string;

  // Computed fields
  totalVotes?: number;
  author?: {
    $id: string;
    name: string;
    reputation: number;
  };
}

export interface VoteDocument extends Models.Document {
  type: "question" | "answer";
  typeId: string;
  votedById: string;
  voteStatus: "upvoted" | "downvoted";
  $createdAt: string;
}

export interface CommentDocument extends Models.Document {
  content: string;
  authorId: string;
  type: "question" | "answer";
  typeId: string;
  $createdAt: string;

  // Computed fields
  author?: {
    $id: string;
    name: string;
    reputation: number;
  };
}
