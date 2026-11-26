
import mongoose from "mongoose";
import { seedDatabase } from "./seedData.js";

export const dbConnection = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is missing from environment variables");
  }

  try {
    console.log("Connecting to MongoDB Atlas...");

    await mongoose.connect(uri, {
      dbName: "MERN_STACK_HOSPITAL_MANAGEMENT",
      serverSelectionTimeoutMS: 10000,
    });

    console.log("Connected to MongoDB Atlas successfully!");

    await seedDatabase();

  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    throw err;
  }
};
