"use client";

import { databases } from "@/models/client/config";
import { db, voteCollection } from "@/models/name";
import { useAuthStore } from "@/store/Auth";
import { cn } from "@/lib/utils";
import { IconCaretUpFilled, IconCaretDownFilled } from "@tabler/icons-react";
import { ID, Models, Query } from "appwrite";
import { useRouter } from "next/navigation";
import React from "react";



type VoteType = "question" | "answer";
type VoteStatus = "upvoted" | "downvoted" | "none";

interface VoteButtonsProps {
  type: VoteType;
  id: string;
  upvotes: Models.DocumentList;
  downvotes: Models.DocumentList;
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
  const [voteResult, setVoteResult] = React.useState<number>(
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
        setVotedDocument(response.documents[0] as Models.Document || null);
      } catch (error) {
        console.error("Error fetching vote document:", error);
        setVotedDocument(null);
      }
    })();
  }, [user, id, type]);

  const sendVote = async (voteStatus: Exclude<VoteStatus, "none">) => {
    if (!user) return router.push("/login");
    if (votedDocument === undefined) return; // still loading

    try {
      const response = await fetch(`/api/vote`, {
        method: "POST",
        body: JSON.stringify({
          votedById: user.$id,
          voteStatus,
          type,
          typeId: id,
        }),
      });

      const data = await response.json();
      setVotedDocument(data.data.document as Models.Document | null);

      if (!response.ok) throw data;

      setVoteResult(data.data.voteResult);
      setVotedDocument(data.data.document); // updated vote document or null
    } catch (error: any) {
      window.alert(error?.message || "Something went wrong");
    }
  };

  const toggleUpvote = () => sendVote("upvoted");
  const toggleDownvote = () => sendVote("downvoted");

  const currentVoteStatus: "upvoted" | "downvoted" | "none" =
    (votedDocument as VoteDocument | null)?.voteStatus ?? "none";

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <button
        aria-pressed={currentVoteStatus === "upvoted"}
        onClick={toggleUpvote}
        className={cn(
          "p-1 rounded",
          currentVoteStatus === "upvoted"
            ? "text-orange-500"
            : "text-gray-400 hover:text-orange-500"
        )}
        aria-label="Upvote"
        type="button"
        disabled={votedDocument === undefined}
      >
        <IconCaretUpFilled size={24} />
      </button>

      <span className="text-center font-semibold select-none">
        {voteResult}
      </span>

      <button
        aria-pressed={currentVoteStatus === "downvoted"}
        onClick={toggleDownvote}
        className={cn(
          "p-1 rounded",
          currentVoteStatus === "downvoted"
            ? "text-blue-500"
            : "text-gray-400 hover:text-blue-500"
        )}
        aria-label="Downvote"
        type="button"
        disabled={votedDocument === undefined}
      >
        <IconCaretDownFilled size={24} />
      </button>
    </div>
  );
};

export default VoteButtons;
