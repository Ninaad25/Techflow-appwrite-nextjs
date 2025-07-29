"use client";

import { databases } from "@/models/client/config";
import { db, voteCollection } from "@/models/name";
import { useAuthStore } from "@/store/Auth";
import { cn } from "@/lib/utils";
import { IconCaretUpFilled, IconCaretDownFilled } from "@tabler/icons-react";
import { ID, Models, Query } from "node-appwrite";
import { useRouter } from "next/navigation";
import React from "react";

type VoteType = "question" | "answer";
type VoteStatus = "upvoted" | "downvoted" | "none";

interface VoteButtonsProps {
  type: VoteType;
  id: string;
  upvotes: Models.DocumentList<Models.Document>;
  downvotes: Models.DocumentList<Models.Document>;
  className?: string;
}

interface VoteDocument extends Models.Document {
  voteStatus: "upvoted" | "downvoted";
}

const VoteButtons: React.FC<VoteButtonsProps> = ({
  type,
  id,
  upvotes,
  downvotes,
  className,
}) => {
  const [votedDocument, setVotedDocument] = React.useState<
    Models.Document | null | undefined
  >(undefined);
  const [voteResult, setVoteResult] = React.useState(
    upvotes.total - downvotes.total
  );
  const { user } = useAuthStore();
  const router = useRouter();

  React.useEffect(() => {
    if (!user) {
      setVotedDocument(null);
      return;
    }

    (async () => {
      try {
        const response = await databases.listDocuments(db, voteCollection, [
          Query.equal("type", type),
          Query.equal("typeId", id),
          Query.equal("votedById", user.$id),
        ]);

        setVotedDocument((response.documents[0] as Models.Document) || null);
      } catch (error) {
        console.error("Error fetching vote document:", error);
        setVotedDocument(null);
      }
    })();
  }, [user, id, type]);

  const sendVote = async (voteStatus: Exclude<VoteStatus, "none">) => {
    if (!user) return router.push("/auth/login");
    if (votedDocument === undefined) return; // still loading

    try {
      const response = await fetch(`/api/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          votedById: user.$id,
          voteStatus,
          type,
          typeId: id,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw data;

      setVoteResult(data.data.voteResult);
      setVotedDocument(data.data.document); // updated vote document or null
    } catch (error: any) {
      window.alert(error?.message || "Something went wrong");
    }
  };

  const toggleUpvote = () => sendVote("upvoted");
  const toggleDownvote = () => sendVote("downvoted");

  const currentVoteStatus: VoteStatus =
    (votedDocument as VoteDocument | null)?.voteStatus ?? "none";

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <button
        onClick={toggleUpvote}
        className={cn(
          "p-1 rounded hover:bg-gray-100 transition-colors",
          currentVoteStatus === "upvoted" ? "text-orange-500" : "text-gray-500"
        )}
        disabled={votedDocument === undefined}
        aria-label="Upvote"
      >
        <IconCaretUpFilled size={24} />
      </button>

      <span
        className={cn(
          "font-semibold text-lg",
          voteResult > 0
            ? "text-green-600"
            : voteResult < 0
            ? "text-red-600"
            : "text-gray-600"
        )}
      >
        {voteResult}
      </span>

      <button
        onClick={toggleDownvote}
        className={cn(
          "p-1 rounded hover:bg-gray-100 transition-colors",
          currentVoteStatus === "downvoted"
            ? "text-orange-500"
            : "text-gray-500"
        )}
        disabled={votedDocument === undefined}
        aria-label="Downvote"
      >
        <IconCaretDownFilled size={24} />
      </button>
    </div>
  );
};

export default VoteButtons;
