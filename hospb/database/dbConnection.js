import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { seedDatabase } from "./seedData.js";

let mongodInstance = null;

export const dbConnection = async () => {
  const uri = process.env.MONGO_URI;

  try {
    if (uri && !uri.includes("cluster0.b49wfmk.mongodb.net")) {
      console.log("Attempting to connect to configured MongoDB URI...");
      await mongoose.connect(uri, {
        dbName: "MERN_STACK_HOSPITAL_MANAGEMENT",
        serverSelectionTimeoutMS: 4000,
      });
      console.log("Connected to MongoDB database successfully!");
      await seedDatabase();
      return;
    }
  } catch (err) {
    console.warn(`Could not connect to external MongoDB: ${err.message}. Switching to local in-memory instance.`);
  }

  // Fallback to embedded MongoMemoryServer
  try {
    console.log("🚀 Starting embedded in-memory MongoDB engine...");
    mongodInstance = await MongoMemoryServer.create();
    const memoryUri = mongodInstance.getUri();
    await mongoose.connect(memoryUri, {
      dbName: "MERN_STACK_HOSPITAL_MANAGEMENT",
    });
    console.log("Connected to embedded MongoDB successfully at:", memoryUri);
    await seedDatabase();
  } catch (memErr) {
    console.error("Critical: Failed to initialize database:", memErr.message);
  }
};