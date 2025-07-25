"use client";

import React from "react";
import { BorderBeam } from "./magicui/border-beam";
import Link from "next/link";
import { Models } from "appwrite";
import slugify from "@/utils/slugify";
import { avatars } from "@/models/client/config";
import convertDateToRelativeTime from "@/utils/relativeTime";



// Define the type for the question document
type QuestionDocument = Models.Document & {
  votes?: any[]; // Assuming votes is an array of vote objects
  answers?: any[];
  tags: string[]; // Array of tags associated with the question
  title: string;
  author: {
    name: string;
    $id: string;
    reputation: number | string; 
  };
  $createdAt: string;
};

// QuestionCard component to display a question with its details
const QuestionCard = ({ ques }: { ques: QuestionDocument }) => {

  // State to manage the height of the component for animations
  const [height, setHeight] = React.useState(0); 
  const ref = React.useRef<HTMLDivElement>(null); // Reference to the component's DOM element

  // Effect to set the height of the component when it mounts or updates
  // This is used for animations and layout adjustments
  React.useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.clientHeight);
    }
  }, [ref]);

  return (
    <div
      ref={ref}
      className="relative flex flex-col gap-4 overflow-hidden rounded-xl border border-white/20 bg-white/5 p-4 duration-200 hover:bg-white/10 sm:flex-row"
    >
      <BorderBeam size={height} duration={12} delay={9} />
      <div className="relative shrink-0 text-sm sm:text-right">
        // Display the number of votes and answers for the question
        <p>{ques.votes?.length ?? 0} votes</p> 
        <p>{ques.answers?.length ?? 0} answers</p>
      </div>
      <div className="relative w-full">
        <Link
        // Link to the question detail page using the question ID and slugified title
          href={`/questions/${ques.$id}/${slugify(ques.title)}`}
          className="text-orange-500 duration-200 hover:text-orange-600"
        >
          <h2 className="text-xl">{ques.title}</h2>
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          {ques.tags.map((tag: string) => (
            <Link
              key={tag}
              href={`/questions?tag=${tag}`}
              className="inline-block rounded-lg bg-white/10 px-2 py-0.5 duration-200 hover:bg-white/20"
            >
              #{tag}
            </Link>
          ))}
          <div className="ml-auto flex items-center gap-1">
            <picture>
              <img
                src={avatars.getInitials(ques.author.name, 24, 24)}
                alt={ques.author.name}
                className="rounded-lg"
              />
            </picture>
            <Link
              href={`/users/${ques.author.$id}/${slugify(ques.author.name)}`}
              className="text-orange-500 hover:text-orange-600"
            >
              {ques.author.name}
            </Link>
            <strong>&quot;{ques.author.reputation}&quot;</strong>
          </div>
          <span>
            asked {convertDateToRelativeTime(new Date(ques.$createdAt))}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
