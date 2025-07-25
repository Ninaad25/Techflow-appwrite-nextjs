import {  Permission, IndexType } from "node-appwrite"
import {db, questionCollection } from "../name"
import { databases } from "./config"

export default async function createQuestionCollection() {
    await databases.createCollection(
      db,
      questionCollection,
      questionCollection,
      [
        // "any" means that the permission is granted to all users who are visiting the app
        Permission.read("any"),
        Permission.read("users"),
        Permission.create("users"),
        Permission.update("users"),
        Permission.delete("users")
      ]
    );
    console.log("Collection questionCollection created successfully.");
    // create attributes

    await Promise.all([
        databases.createStringAttribute(db, questionCollection, "title", 100, true),
        databases.createStringAttribute(db, questionCollection, "content", 10000, true),
        databases.createStringAttribute(db, questionCollection, "authorId", 100, true),
        databases.createStringAttribute(db, questionCollection, "tags", 50, true, undefined, true),
        databases.createStringAttribute(db, questionCollection, "attachmentId", 100, false),
    ]);
    console.log(`Attributes for collection ${questionCollection} created successfully.`);

/*
    // create indexes
    await Promise.all([
        databases.createIndex(db, questionCollection, "title", IndexType.Fulltext, ["title"], ["asc"]),
        databases.createIndex(db, questionCollection, "content", IndexType.Fulltext, ["content"], ["asc"]),
        databases.createIndex(db, questionCollection, "authorId", IndexType.Key, ["authorId"], ["asc"]),
        databases.createIndex(db, questionCollection, "attachmentId", IndexType.Key, ["attachmentId"], ["asc"]),
    ]);
    */
}