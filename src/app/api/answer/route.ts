// src/app/api/answers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { databases, users } from "@/models/server/config";
import { databaseId, answerCollection } from "@/models/name";
import { ID } from "node-appwrite";
import { UserPrefs } from "@/store/Auth";

export async function POST(request: NextRequest) {
  try {
    const { answer, questionId, authorId } = await request.json();

    // ✅ Remove generic - let SDK infer type
    const created = await databases.createDocument(
      databaseId,
      answerCollection,
      ID.unique(),
      {
        content: answer,
        questionId,
        authorId,
      }
    );

    // Update reputation
    const prefs = await users.getPrefs<UserPrefs>(authorId);
    await users.updatePrefs(authorId, {
      reputation: (Number(prefs.reputation) || 0) + 1,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error creating answer" },
      { status: 500 }
    );
  }
}


export async function DELETE(request: NextRequest) {
  try {
    const { answerId } = await request.json();

    // ✅ Remove generic - let SDK infer type  
    const existing = await databases.getDocument(
      databaseId,
      answerCollection,
      answerId
    );

    await databases.deleteDocument(databaseId, answerCollection, answerId);

    // Update reputation
    const prefs = await users.getPrefs<UserPrefs>(existing.authorId);
    await users.updatePrefs(existing.authorId, {
      reputation: (Number(prefs.reputation) || 0) - 1,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error deleting answer" },
      { status: 500 }
    );
  }
}
