import {
  answerCollection,
  db,
  questionCollection,
  voteCollection,
} from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { NextRequest, NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";

export async function POST(request: NextRequest) {
  try {
    // Grab data from request body
    const { votedById, voteStatus, type, typeId } = await request.json();

    // List existing vote documents for this user, type, and item
    const response = await databases.listDocuments(db, voteCollection, [
      Query.equal("type", type),
      Query.equal("typeId", typeId),
      Query.equal("votedById", votedById),
    ]);

    // If vote already exists, delete it (user withdrawing vote)
    if (response.documents.length > 0) {
      await databases.deleteDocument(
        db,
        voteCollection,
        response.documents[0].$id
      );

      // Get the question or answer document to update reputation
      const questionOrAnswer = await databases.getDocument(
        db,
        type === "question" ? questionCollection : answerCollection,
        typeId
      );

      // Get the author preferences
      const authorPrefs = await users.getPrefs(questionOrAnswer.authorId);

      // Update the author's reputation based on the previous vote status being withdrawn
      await users.updatePrefs(questionOrAnswer.authorId, {
        reputation:
          response.documents[0].voteStatus === "upvoted"
            ? Number(authorPrefs.reputation) - 1 // Decrease if it was an upvote
            : Number(authorPrefs.reputation) + 1, // Increase if it was a downvote
      });

      // If previous vote status is different from new voteStatus, create new vote document
      if (response.documents[0]?.voteStatus !== voteStatus) {
        const doc = await databases.createDocument(
          db,
          voteCollection,
          ID.unique(),
          {
            type,
            typeId,
            voteStatus,
            votedById,
          }
        );

        // Get the question or answer document again for updating reputation
        const questionOrAnswerAfterVote = await databases.getDocument(
          db,
          type === "question" ? questionCollection : answerCollection,
          typeId
        );

        // Get updated author preferences
        const authorPrefsAfterVote = await users.getPrefs(
          questionOrAnswerAfterVote.authorId
        );

        await users.updatePrefs(questionOrAnswerAfterVote.authorId, {
          reputation:
            voteStatus === "upvoted"
              ? Number(authorPrefsAfterVote.reputation) + 1
              : Number(authorPrefsAfterVote.reputation) - 1,
        });

        // Fetch the updated vote counts from all users (important: NO votedById filter)
        const [upvotes, downvotes] = await Promise.all([
          databases.listDocuments(db, voteCollection, [
            Query.equal("type", type),
            Query.equal("typeId", typeId),
            Query.equal("voteStatus", "upvoted"),
          ]),
          databases.listDocuments(db, voteCollection, [
            Query.equal("type", type),
            Query.equal("typeId", typeId),
            Query.equal("voteStatus", "downvoted"),
          ]),
        ]);

        // Return success with updated vote document and aggregated vote result
        return NextResponse.json(
          {
            data: {
              document: doc,
              voteResult: upvotes.total - downvotes.total,
            },
            message: response.documents[0] ? "Vote Status Updated" : "Voted",
          },
          { status: 201 }
        );
      }

      // Vote withdrawn case: no new vote created
      const [upvotes, downvotes] = await Promise.all([
        databases.listDocuments(db, voteCollection, [
          Query.equal("type", type),
          Query.equal("typeId", typeId),
          Query.equal("voteStatus", "upvoted"),
        ]),
        databases.listDocuments(db, voteCollection, [
          Query.equal("type", type),
          Query.equal("typeId", typeId),
          Query.equal("voteStatus", "downvoted"),
        ]),
      ]);

      return NextResponse.json(
        {
          data: {
            document: null,
            voteResult: upvotes.total - downvotes.total,
          },
          message: "Vote Withdrawn",
        },
        { status: 200 }
      );
    } else {
      // If no previous vote exists, create a new vote
      const doc = await databases.createDocument(
        db,
        voteCollection,
        ID.unique(),
        {
          type,
          typeId,
          voteStatus,
          votedById,
        }
      );

      // Get the question or answer document to update reputation
      const questionOrAnswer = await databases.getDocument(
        db,
        type === "question" ? questionCollection : answerCollection,
        typeId
      );

      // Get the author preferences
      const authorPrefs = await users.getPrefs(questionOrAnswer.authorId);

      // Update reputation according to new vote
      await users.updatePrefs(questionOrAnswer.authorId, {
        reputation:
          voteStatus === "upvoted"
            ? Number(authorPrefs.reputation) + 1
            : Number(authorPrefs.reputation) - 1,
      });

      // Fetch updated vote counts from all users
      const [upvotes, downvotes] = await Promise.all([
        databases.listDocuments(db, voteCollection, [
          Query.equal("type", type),
          Query.equal("typeId", typeId),
          Query.equal("voteStatus", "upvoted"),
        ]),
        databases.listDocuments(db, voteCollection, [
          Query.equal("type", type),
          Query.equal("typeId", typeId),
          Query.equal("voteStatus", "downvoted"),
        ]),
      ]);

      // Return new vote document and current aggregated vote result
      return NextResponse.json(
        {
          data: { document: doc, voteResult: upvotes.total - downvotes.total },
          message: "Voted",
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Error during voting" },
      { status: error?.status || error?.code || 500 }
    );
  }
}
