import Image from "next/image";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import HeroSectionHeader from "./components/HeroSectionHeader";
import TopContributers from "./components/TopContributers";
import Footer from "./components/Footer";
import RootLayout from "./layout";
import loginPage from "@/(auth)/login/page";
import registerPage from "@/(auth)/register/page";
import answerPage from "./users/[userId]/[userSlug]/answers/page";
import editPage from "./users/[userId]/[userSlug]/edit/page";
import questionPage from "./questions/layout";
import Search from "./questions/search";
import DeleteQuestion from "./questions/[questId]/[questName]/deleteQues";
import EditQues from "./questions/[questId]/[questName]/edit/EditQues";
import editQuesPage from "./questions/[questId]/[questName]/page";
import EditQuestion from "./questions/[questId]/[questName]/editQues";
import Page from "./questions/[questId]/[questName]/edit/page";
import votePage from "./users/[userId]/[userSlug]/votes/page";
import EditButton from "./users/[userId]/[userSlug]/EditButton";
import Navbar from "./users/[userId]/[userSlug]/Navbar";
import userPage from "./users/[userId]/[userSlug]/page";
import Answers from "@/components/Answers";
import Comments from "@/components/Comments";
import Pagination from "@/components/Pagination";
import QuestionCard from "@/components/QuestionCard";
import QuestionForm from "@/components/QuestionForm";
import VoteButtons from "@/components/VoteButtons";
import { StrictMode } from "react";
import { createRouteLoader } from "next/dist/client/route-loader";

export default function Home() {
  return <main className="flex dark:bg-black dark:text-white"></main>;
}
