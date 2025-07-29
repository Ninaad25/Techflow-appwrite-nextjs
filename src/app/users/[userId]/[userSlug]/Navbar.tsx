"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import React from "react";

const Navbar = () => {
  const { userId, userSlug } = useParams();
  const pathname = usePathname();

  const items = [
    {
      name: "Summary",
      href: `/users/${userId}/${userSlug}`,
    },
    {
      name: "Questions",
      href: `/users/${userId}/${userSlug}/questions`,
    },
    {
      name: "Answers",
      href: `/users/${userId}/${userSlug}/answers`,
    },
    {
      name: "Votes",
      href: `/users/${userId}/${userSlug}/votes`,
    },
  ];

  return (
    <nav className="flex space-x-8" aria-label="User navigation">
      {items.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              isActive
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
};

export default Navbar;
