"use client";

import { ID, Models } from "node-appwrite";

import React from "react";

import VoteButtons from "./VoteButtons";

import { useAuthStore } from "@/store/Auth";

import { avatars } from "@/models/client/config";

import RTE, { MarkdownPreview } from "./RTE";

import Comments from "./Comments";

import slugify from "@/utils/slugify";

import Link from "next/link";

import { IconTrash } from "@tabler/icons-react";

interface Author {
  $id: string;
  name: string;
  reputation: number;
  // Add other author fields if necessary
}

// Extend DefaultDocument for Votes Documents
interface VoteDocument extends Models.Document {}

// Votes type using VoteDocument
interface Votes {
  documents: VoteDocument[];
  total: number;
}

// Similarly for Comments
interface CommentDocument extends Models.Document {}

interface CommentList {
  documents: CommentDocument[];
  total: number;
}

export interface AnswerDocument extends Models.Document {
  authorId: string;
  content: string;
  author: Author;
  upvotesDocuments: Votes;
  downvotesDocuments: Votes;
  comments: CommentList;
  // Add other custom fields if needed
}

/**
 * Represents a list of Answer Documents
 */
export interface AnswerDocumentList
  extends Models.DocumentList<AnswerDocument> {}

const Answers = ({
  answers: _answers,
  questionId,
}: {
  answers: AnswerDocumentList;
  questionId: string;
}) => {
  const [answers, setAnswers] = React.useState(_answers);
  const [newAnswer, setNewAnswer] = React.useState("");
  const { user } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswer || !user) return;

    try {
      const response = await fetch("/api/answer", {
        method: "POST",
        body: JSON.stringify({
          questionId,
          answer: newAnswer,
          authorId: user.$id,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw data;

      // Reset input
      setNewAnswer("");

      // Optimistically update with new answer
      // Ensure to add [__default]: true property for votes and comments documents
      const newAnswerDocument: AnswerDocument = {
        ...data,
        author: user,
        upvotesDocuments: { documents: [], total: 0 },
        downvotesDocuments: { documents: [], total: 0 },
        comments: { documents: [], total: 0 },
        // Add the required [__default] to each vote/comment document array - empty now.
      };

      setAnswers((prev) => ({
        total: prev.total + 1,
        // Place the new answer at the beginning
        documents: [newAnswerDocument, ...prev.documents],
      }));
    } catch (error: any) {
      window.alert(error?.message || "Error creating answer");
    }
  };

  const deleteAnswer = async (answerId: string) => {
    try {
      const response = await fetch("/api/answer", {
        method: "DELETE",
        body: JSON.stringify({
          answerId,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw data;

      setAnswers((prev) => ({
        total: prev.total - 1,
        documents: prev.documents.filter((answer) => answer.$id !== answerId),
      }));
    } catch (error: any) {
      window.alert(error?.message || "Error deleting answer");
    }
  };

  return (
    <>
      <h2>{answers.total} Answers</h2>
      {answers.documents.map((answer) => (
        <article key={answer.$id} className="answer-item">
          <header>
            <p>
              {answer.author.name} ({answer.author.reputation})
            </p>
            {user?.$id === answer.authorId ? (
              <button
                onClick={() => deleteAnswer(answer.$id)}
                aria-label="Delete Answer"
                type="button"
              >
                <IconTrash />
              </button>
            ) : null}
          </header>
          <section>{answer.content}</section>
          {/* Additional UI like votes, comments */}
        </article>
      ))}

      <form onSubmit={handleSubmit}>
        <label htmlFor="new-answer">Your Answer</label>
        <textarea
          id="new-answer"
          value={newAnswer}
          onChange={(e) => setNewAnswer(e.target.value)}
          rows={5}
          placeholder="Write your answer here..."
        />
        <button type="submit">Post Your Answer</button>
      </form>
    </>
  );
};

export default Answers;
