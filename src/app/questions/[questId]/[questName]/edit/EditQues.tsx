"use client";

import QuestionForm from "@/components/QuestionForm";
import { useAuthStore } from "@/store/Auth";
import slugify from "@/utils/slugify";
import { Models } from "appwrite";
import { useRouter } from "next/navigation";
import React from "react";

// Import the interface from page.tsx
import type { QuestionWithAuthor } from "./page";

const EditQues = ({ question }: { question: QuestionWithAuthor }) => {
  const { user } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Check if user is authorized to edit this question
    if (!user || question.authorId !== user.$id) {
      router.push(`/questions/${question.$id}/${slugify(question.title)}`);
      return;
    }

    setIsLoading(false);
  }, [user, question.authorId, question.$id, question.title, router]);

  // Show loading while checking authorization
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authorized, don't render anything (redirect is handled in useEffect)
  if (!user || user.$id !== question.authorId) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Question</h1>
        <p className="text-gray-600">
          Make changes to your question to improve clarity and get better
          answers.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <QuestionForm question={question} isEdit={true} />
      </div>
    </div>
  );
};

export default EditQues;
