import mongoose from "mongoose";

export const connectToDatabase = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error(
        "Please provide a MongoDB URI in the environment variables"
      );
    }
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    //exit the process with a failure code
    process.exit(1);
  }
};
