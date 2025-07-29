import { db, questionCollection } from "@/models/name";
import { databases } from "@/models/server/config";
import React from "react";
import EditQues from "./EditQues";
import { Models } from "node-appwrite";
import { notFound } from "next/navigation";

// ✅ Fixed: Correct interface name
export interface QuestionWithAuthor extends Models.Document {
  authorId: string;
  title: string;
  content: string;
  tags: string[];
}

type Params = {
  questId: string;
  questName: string;
};

const Page = async ({
  params,
}: {
  params: Promise<Params>;
}) => {
  try {
    const resolvedParams = await params;
    const { questId } = resolvedParams;

    // Fetch question document from Appwrite DB
    const questionRaw = await databases.getDocument(
      db,
      questionCollection,
      questionCollection
    );
    if (!questionRaw.authorId || !questionRaw.title) {
      notFound();
    }

    // Create the properly typed question object
    const question: QuestionWithAuthor = {
      ...questionRaw,
      authorId: questionRaw.authorId,
      title: questionRaw.title,
      content: questionRaw.content || "",
      tags: questionRaw.tags || [],
    };

    return <EditQues question={question} />;
  } catch (error) {
    console.error("Error fetching question for edit:", error);
    notFound();
  }
};

export default Page;
