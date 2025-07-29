// QuestionCard.tsx
import React from "react";
import { QuestionDocument } from "@/app/questions/[questId]/[questName]/appwrite";

interface QuestionCardProps {
  ques: QuestionDocument;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ ques }) => {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold">{ques.title}</h3>
      <p className="text-gray-600 mt-2">{ques.content}</p>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-4">
          <span>{ques.totalVotes ?? 0} votes</span>
          <span>{ques.totalAnswers ?? 0} answers</span>
        </div>

        <div className="text-sm text-gray-500">
          Asked by {ques.author?.name ?? "Unknown"}
          (Rep: {ques.author?.reputation ?? 0})
        </div>
      </div>

      {ques.tags && (
        <div className="flex flex-wrap gap-2 mt-2">
          {ques.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
