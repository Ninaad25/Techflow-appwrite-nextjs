import { Permission } from "node-appwrite";
import { db, answerCollection } from "../name";
import { databases } from "./config";

export default async function createAnswerCollection() {
await databases.createCollection(
  db,
  answerCollection,
  answerCollection,
  [
    Permission.read("any"),
    Permission.read("users"),
    Permission.create("users"),
    Permission.update("users"),
    Permission.delete("users"),
  ],
);
    console.log("Answer collection created successfully.");

    // create attributes
   await Promise.all([
       databases.createStringAttribute(db, answerCollection, "content", 10000, true),
       databases.createStringAttribute(db, answerCollection, "authorId", 100, true),
       databases.createStringAttribute(db, answerCollection, "questionId", 100, true),
       databases.createStringAttribute(db, answerCollection, "attachmentId", 100, false),
   ]);
   console.log("Attributes for answer collection created successfully.");
}
