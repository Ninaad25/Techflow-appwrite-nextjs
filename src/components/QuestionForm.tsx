"use client";

import React from "react";
import { Models } from "appwrite";
import { databases } from "@/models/client/config";
import { db, questionCollection } from "@/models/name";
import { useAuthStore } from "@/store/Auth";
import { useRouter } from "next/navigation";
import { ID } from "appwrite";
import slugify from "@/utils/slugify";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with MDEditor
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

// Define the proper interface
interface QuestionWithContent extends Models.Document {
  authorId: string;
  title: string;
  content: string;
  tags: string[];
}

// Update the props interface to include isEdit
interface QuestionFormProps {
  question?: QuestionWithContent;
  isEdit?: boolean; // Add this property
}

const QuestionForm = ({ question, isEdit = false }: QuestionFormProps) => {
  const [title, setTitle] = React.useState(question?.title || "");
  const [content, setContent] = React.useState(question?.content || "");
  const [tags, setTags] = React.useState<string[]>(question?.tags || []);
  const [tagInput, setTagInput] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string>("");

  const { user } = useAuthStore();
  const router = useRouter();

  // Handle MDEditor onChange with proper type compatibility
  const handleContentChange = (value?: string) => {
    setContent(value || "");
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag) && tags.length < 5) {
        setTags([...tags, newTag]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      if (isEdit && question) {
        // Update existing question
        await databases.updateDocument(db, questionCollection, question.$id, {
          title: title.trim(),
          content: content.trim(),
          tags: tags,
        });

        // Navigate back to the question page
        router.push(`/questions/${question.$id}/${slugify(title)}`);
      } else {
        // Create new question
        const response = await databases.createDocument(
          db,
          questionCollection,
          ID.unique(),
          {
            title: title.trim(),
            content: content.trim(),
            tags: tags,
            authorId: user.$id,
          }
        );

        // Navigate to the new question
        router.push(`/questions/${response.$id}/${slugify(title)}`);
      }
    } catch (error: any) {
      console.error("Error submitting question:", error);
      setError(error?.message || "Failed to submit question");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">
          You need to be logged in to {isEdit ? "edit" : "ask"} a question.
        </p>
        <button
          onClick={() => router.push("/auth/login")}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {isEdit ? "Edit Question" : "Ask a Question"}
        </h2>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Title field */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Question Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="What's your question? Be specific and clear."
          required
          maxLength={200}
        />
        <p className="text-sm text-gray-500 mt-1">
          {title.length}/200 characters
        </p>
      </div>

      {/* Content field with MDEditor */}
      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Question Details
        </label>
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <MDEditor
            value={content}
            onChange={handleContentChange}
            preview="edit"
            hideToolbar={false}
            data-color-mode="light"
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Provide more details about your question. You can use Markdown
          formatting.
        </p>
      </div>

      {/* Tags field */}
      <div>
        <label
          htmlFor="tags"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Tags (up to 5)
        </label>
        <input
          type="text"
          id="tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Add tags (press Enter to add): javascript, react, nextjs"
          disabled={tags.length >= 5}
        />

        {/* Display tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-orange-600 hover:text-orange-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Add relevant tags to help others find your question. Press Enter to
          add each tag.
        </p>
      </div>

      {/* Submit button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !title.trim() || !content.trim()}
          className="px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting
            ? isEdit
              ? "Updating..."
              : "Posting..."
            : isEdit
            ? "Update Question"
            : "Post Question"}
        </button>
      </div>
    </form>
  );
};

export default QuestionForm;
