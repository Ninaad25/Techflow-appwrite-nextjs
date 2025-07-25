"use client";

import { databases } from "@/models/client/config";
import { commentCollection, db } from "@/models/name";
import { useAuthStore } from "@/store/Auth";
import convertDateToRelativeTime from "@/utils/relativeTime";
import slugify from "@/utils/slugify";
import { IconTrash } from "@tabler/icons-react";
import { ID, Models } from "appwrite";
import Link from "next/link";
import React from "react";


interface Author {
  $id: string;
  name: string;
  reputation?: number; // optional if you use it
}


interface CommentDocument extends Models.Document {
  authorId: string;
  content: string;
  author: Author;
  type: "question" | "answer";
  typeId: string;
  // Add other custom fields if you have them
}

interface CommentDocumentList extends Models.DocumentList<CommentDocument> {}

const Comments = ({
  comments: _comments, 
  type,
  typeId,
  className,
}: {
  comments: CommentDocumentList; // Initial comments list
  type: "question" | "answer";
  typeId: string;
  className?: string;
}) => {
  const [comments, setComments] =
    React.useState<CommentDocumentList>(_comments);
  const [newComment, setNewComment] = React.useState("");
  const { user } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newComment || !user) return;

    try {
      const response = await databases.createDocument(
        db,
        commentCollection,
        ID.unique(),
        {
          content: newComment,
          authorId: user.$id,
          type: type,
          typeId: typeId,
        }
      );
      setNewComment("");

      // Optimistically update comments list
      setComments((prev) => ({
        total: prev.total + 1,
        documents: [
          {
            // Assign all required base document properties from response, e.g.:
            $id: response.$id,
            $createdAt: response.$createdAt,
            $updatedAt: response.$updatedAt,
            $permissions: response.$permissions,
            $collectionId: response.$collectionId,
            $databaseId: response.$databaseId,
            $sequence: response.$sequence,

            // Your custom fields:
            authorId: user.$id,
            content: newComment,
            author: user,
            type,
            typeId,

            
          },
          ...prev.documents, // Add new comment at the start
        ],
      }));

    } catch (error: any) {
      window.alert(error?.message || "Error creating comment");
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await databases.deleteDocument(db, commentCollection, commentId);

      setComments((prev) => ({
        total: prev.total - 1,
        documents: prev.documents.filter(
          (comment) => comment.$id !== commentId
        ),
      }));
    } catch (error: any) {
      window.alert(error?.message || "Error deleting comment");
    }
  };

  return (
    <div className={className}>
      {comments.documents.length === 0 && (
        <p className="text-gray-500">No comments yet.</p>
      )}
      // Render each comment
      {comments.documents.map((comment) => (
        <div
          key={comment.$id}
          className="mb-3 flex justify-between items-start gap-2"
        >
          <div className="flex flex-col">
            <p>{comment.content}</p>
            <div className="text-sm text-gray-400 mt-1">
              <Link
                href={`/users/${comment.author.$id}/${slugify(
                  comment.author.name
                )}`}
                className="font-semibold text-orange-500 hover:text-orange-600"
              >
                {comment.author.name}
              </Link>{" "}
              &bull;{" "}
              <time title={new Date(comment.$createdAt).toLocaleString()}>
                {convertDateToRelativeTime(new Date(comment.$createdAt))}
              </time>
            </div>
          </div>
          {user?.$id === comment.authorId && (
            <button
              onClick={() => deleteComment(comment.$id)}
              className="shrink-0 text-red-500 hover:text-red-600 p-1"
              aria-label="Delete Comment"
              type="button"
              title="Delete Comment"
            >
              <IconTrash size={16} />
            </button>
          )}
        </div>
      ))}

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment"
          rows={3}
          className="rounded border border-gray-300 p-2 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
          required
        />
        <button
          type="submit"
          className="self-end rounded bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600"
        >
          Add Comment
        </button>
      </form>
    </div>
  );
};

export default Comments;
