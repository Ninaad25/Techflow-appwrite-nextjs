"use client";

import {IconCloud} from "@/components/magicui/icon-cloud";
import {Particles} from "@/components/magicui/particles";
import  ShimmerButton  from "@/components/magicui/shimmer-button";
import { useAuthStore } from "@/store/Auth";
import Link from "next/link";
import React from "react";
import { Confetti } from "@/components/magicui/confetti";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";

const slugs = [
  "typescript",
  "javascript",
  "dart",
  "java",
  "react",
  "flutter",
  "android",
  "html5",
  "css3",
  "nodedotjs",
  "express",
  "nextdotjs",
  "prisma",
  "amazonaws",
  "postgresql",
  "firebase",
  "nginx",
  "vercel",
  "testinglibrary",
  "jest",
  "cypress",
  "docker",
  "git",
  "jira",
  "github",
  "gitlab",
  "visualstudiocode",
  "androidstudio",
  "sonarqube",
  "figma",
];

const HeroSectionHeader = () => {
  const { session } = useAuthStore();


  return (
    <div className="container mx-auto px-4">
      <Particles
        className="fixed inset-0 h-full w-full"
        quantity={500}
        ease={100}
        color="#ffffff"
        refresh
      />
      <div className="relative z-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex items-center justify-center">
          <div className="space-y-4 text-center">
            <AnimatedGradientText className="text-8xl font-extrabold font-mono">
              TechFlow
            </AnimatedGradientText>
            <p className="text-center text-white border-2 border-none p-5 rounded-4xl shadow-pink-500 shadow-sm text-xl font-bold leading-none tracking-tighter">
              Ask questions, share knowledge, and collaborate with developers
              worldwide. Join our community and enhance your coding skills!
            </p>
            <div className="flex items-center justify-center gap-4 ">
              {session ? (
                <Link href="/questions/ask">
                  <ShimmerButton className="shadow-2xl ">
                    <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-black dark:from-white dark:to-slate-900/10 lg:text-lg">
                      Ask a question
                    </span>
                  </ShimmerButton>
                </Link>
              ) : (
                <>
                  <Link href="/auth/register">
                    <ShimmerButton
                      // onClick={handleClick}
                      className="shadow-md hover:shadow-pink-600 border-2"
                    >
                      <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg h shadow-md hover:shadow-amber-600">
                        Sign up
                      </span>
                      
                    </ShimmerButton>
                    
                  </Link>
                  <Link href="/auth/login">
                    <ShimmerButton className="shadow-md hover:shadow-pink-600 border-2">
                      <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg h shadow-md hover:shadow-pink-600">
                        Log in
                      </span>
                    </ShimmerButton>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="relative max-w-[32rem] overflow-hidden">
            <IconCloud iconSlugs={slugs} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSectionHeader;
