import { db, questionCollection } from "@/models/name";
import { databases } from "@/models/server/config";
import React from "react";
import EditQues from "./EditQues";
import { Models } from "node-appwrite"; // base document type

// Define your fully typed question interface including $sequence and authorId, title etc
export interface QuestionWithAuthor extends Models.Document {
  authorId: string;
  title: string;
  content?: string;
  $sequence: number;
  // Add other fields your question document has, e.g. tags, etc
}

const Page = async ({
  params,
}: {
  params: { quesId: string; quesName: string };
}) => {
  // Fetch question document from Appwrite DB
  const questionRaw = await databases.getDocument(
    db,
    questionCollection,
    params.quesId
  );

  // Enrich the question object: ensure $sequence exists (0 fallback)
  const question: QuestionWithAuthor = {
    ...questionRaw,
    $sequence: (questionRaw as any).$sequence ?? 0,
    authorId: questionRaw.authorId,
    title: questionRaw.title,
    content: questionRaw.content ?? "",
  };

  return <EditQues question={question} />;
};

export default Page;
