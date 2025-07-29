"use client";

import { databases } from "@/models/client/config";
import { db, questionCollection } from "@/models/name";
import { useAuthStore } from "@/store/Auth";
import { IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import React from "react";

const DeleteQuestion = ({
  questionId,
  authorId,
}: {
  questionId: string;
  authorId: string;
}) => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const deleteQuestion = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this question? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await databases.deleteDocument(db, questionCollection, questionId);
      router.push("/questions");
      router.refresh();
    } catch (error: any) {
      console.error("Error deleting question:", error);
      window.alert(error?.message || "Failed to delete question");
    } finally {
      setIsDeleting(false);
    }
  };

  if (user?.$id !== authorId) return null;

  return (
    <button
      onClick={deleteQuestion}
      disabled={isDeleting}
      className="inline-flex items-center gap-1 px-2 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Delete Question"
    >
      <IconTrash size={16} />
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
};

export default DeleteQuestion;
