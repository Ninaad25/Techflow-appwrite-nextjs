import { Permission } from "node-appwrite";
import { databaseId, commentCollection } from "../name";
import { databases } from "./config";

export default async function createCommentCollection() {
    await databases.createCollection(
      databaseId,
      commentCollection,
      commentCollection,
      [
        Permission.read("any"),
        Permission.read("users"),
        Permission.create("users"),
        Permission.update("users"),
        Permission.delete("users"),
      ]
    );
    console.log("Comment collection created successfully.");
    
    // create attributes
    await Promise.all([
      databases.createStringAttribute(
        databaseId,
        commentCollection,
        "content",
        10000,
        true
      ),
      databases.createStringAttribute(
        databaseId,
        commentCollection,
        "authorId",
        100,
        true
      ),
      databases.createStringAttribute(
        databaseId,
        commentCollection,
        "typeId",
        100,
        true
      ),
      databases.createEnumAttribute(
        // "enum" used for passing array of values
        databaseId,
        commentCollection,
        "type",
        ["answer", "question"],
        true
      ),
    ]);
    console.log("Attributes for comment collection created successfully.");
}
