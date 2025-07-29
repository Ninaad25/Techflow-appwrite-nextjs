import {  Permission } from "node-appwrite"
import { databaseId, voteCollection } from "../name";
import { databases } from "./config"

export default async function createVoteCollection() {
    await databases.createCollection(
      databaseId,
      voteCollection,
      voteCollection,
      [
        // "any" means that the permission is granted to all users who are visiting the app
        Permission.read("any"),
        Permission.read("users"),
        Permission.create("users"),
        Permission.update("users"),
        Permission.delete("users"),
      ]
    );
    console.log("Collection voteCollection created successfully.");

    // create attributes
    await Promise.all([
      databases.createEnumAttribute(
        databaseId,
        voteCollection,
        "voteStatus",
        ["upvote", "downvote"],
        true
      ),
      databases.createEnumAttribute(
        databaseId,
        voteCollection,
        "type",
        ["question", "answer"],
        true
      ),
      databases.createStringAttribute(
        databaseId,
        voteCollection,
        "typeId",
        100,
        true
      ),
      databases.createStringAttribute(
        databaseId,
        voteCollection,
        "votedById",
        100,
        true
      ),
    ]);
    console.log("Attributes for collection voteCollection created successfully.");

}