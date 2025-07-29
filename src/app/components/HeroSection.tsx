import React from "react"
import {HeroParallax}  from "@/components/ui/hero-parallax";
import { databases } from "@/models/server/config";
import { storage } from "@/models/client/config";
import {
  db,
  questionAttachmentBucket,
  questionCollection,
} from "@/models/name";
import { Query } from "node-appwrite";
import slugify from "@/utils/slugify";
import HeroSectionHeader from "./HeroSectionHeader";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
 

export default async function HeroSection() {
  const questions = await databases.listDocuments(db, questionCollection, [
    Query.orderDesc("$createdAt"),
    Query.limit(15),
  ]);

  // ✅ Process all images asynchronously with Promise.all()
  const products = await Promise.all(
    questions.documents.map(async (q) => {
      try {
        // Get the ArrayBuffer from Appwrite
        const arrayBuffer = await storage.getFilePreview(
          questionAttachmentBucket,
          q.attachmentId
        );
        
        // Convert ArrayBuffer to Blob
        const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
        
        // Create object URL (string) for the thumbnail
        const thumbnailUrl = URL.createObjectURL(blob);
        
        return {
          title: q.title,
          link: `/questions/${q.$id}/${slugify(q.title)}`,
          thumbnail: thumbnailUrl, // ✅ Now it's a string!
        };
      } catch (error) {
        console.error(`Failed to load thumbnail for question ${q.$id}:`, error);
        
        // Return fallback image for failed loads
        return {
          title: q.title,
          link: `/questions/${q.$id}/${slugify(q.title)}`,
          thumbnail: '/placeholder-image.jpg', // ✅ Fallback string URL
        };
      }
    })
  );

  return (
    <HeroParallax
      header={<HeroSectionHeader />}
      products={products} // ✅ Now properly typed with string thumbnails
    />

  );
}