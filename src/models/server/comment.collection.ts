import { Permission } from "node-appwrite";
import { db, commentCollection } from "../name";
import { databases } from "./config";

export default async function createCommentCollection() {
    await databases.createCollection(
        db,
        commentCollection,
        commentCollection,
        [
            Permission.read("any"),
            Permission.read("users"),
            Permission.create("users"),
            Permission.update("users"),
            Permission.delete("users"),
        ],
    );
    console.log("Comment collection created successfully.");
    
    // create attributes
    await Promise.all([
      databases.createStringAttribute(
        db,
        commentCollection,
        "content",
        10000,
        true
      ),
      databases.createStringAttribute(
        db,
        commentCollection,
        "authorId",
        100,
        true
      ),
      databases.createStringAttribute(
        db,
        commentCollection,
        "typeId",
        100,
        true
      ),
      databases.createEnumAttribute( // "enum" used for passing array of values
        db,
        commentCollection,
        "type",
        ["answer", "question"],
        true
      ),
    ]);
    console.log("Attributes for comment collection created successfully.");
}
