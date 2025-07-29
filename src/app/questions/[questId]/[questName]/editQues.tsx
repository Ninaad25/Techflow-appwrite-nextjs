"use client";

import { useAuthStore } from "@/store/Auth";
import slugify from "@/utils/slugify";
import { IconEdit } from "@tabler/icons-react";
import Link from "next/link";
import React from "react";

const EditQuestion = ({
  questionId,
  questionTitle,
  authorId,
}: {
  questionId: string;
  questionTitle: string;
  authorId: string;
}) => {
  const { user } = useAuthStore();

  if (user?.$id !== authorId) return null;

  return (
    <Link
      href={`/questions/${questionId}/${slugify(questionTitle)}/edit`}
      className="inline-flex items-center gap-1 px-2 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
      title="Edit Question"
    >
      <IconEdit size={16} />
      Edit
    </Link>
  );
};

export default EditQuestion;
