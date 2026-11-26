import mongoose from "mongoose";
import { seedDatabase } from "./seedData.js";

export const dbConnection = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("MONGO_URI is missing from environment variables!");
    throw new Error("MONGO_URI is missing from environment variables");
  }

  try {
    console.log("Connecting to MongoDB Atlas...");

    // Format URI gracefully if provided as bare cluster URL
    let connectionUri = uri.trim();
    if (connectionUri.endsWith("/")) {
      connectionUri = `${connectionUri}MERN_STACK_HOSPITAL_MANAGEMENT?retryWrites=true&w=majority`;
    } else if (!connectionUri.includes("?")) {
      connectionUri = `${connectionUri}/MERN_STACK_HOSPITAL_MANAGEMENT?retryWrites=true&w=majority`;
    }

    await mongoose.connect(connectionUri, {
      dbName: "MERN_STACK_HOSPITAL_MANAGEMENT",
      serverSelectionTimeoutMS: 15000,
    });

    console.log("Connected to MongoDB Atlas successfully!");

    await seedDatabase();
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    throw err;
  }
};
