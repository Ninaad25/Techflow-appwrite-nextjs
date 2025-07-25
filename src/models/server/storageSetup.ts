import {  Permission } from "node-appwrite"
import {questionAttachmentBucket } from "../name"
import { storage } from "./config"

export default async function getOrCreateStorage() {
    try {
        await storage.getBucket(questionAttachmentBucket);
        console.log("Storage connected successfully.");
    } catch (error) {
        try {
            await storage.createBucket(
                questionAttachmentBucket,
                questionAttachmentBucket,
                [
                    // "any" means that the permission is granted to all users who are visiting the app
                    Permission.read("any"),
                    Permission.read("users"),
                    Permission.create("users"),
                    Permission.update("users"),
                    Permission.delete("users")
                ],
                false, // isPublic
                undefined, // maximumFileSize
                undefined, // allowedFileExtensions
                ["jpg", "jpeg", "png", "gif", "webp", "svg"], // allowedFileExtensions
            );
            console.log("storage created successfully.");
            console.log("storage connected successfully.");

        } catch (error) {
            console.log("Error creating storage:", error);   
        }
    }
}

    