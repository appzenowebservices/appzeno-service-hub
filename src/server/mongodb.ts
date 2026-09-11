import mongoose from "mongoose";
import { env } from "~/env";

const globalForMongo = globalThis as unknown as {
  mongoose: typeof mongoose | undefined;
};

export const connectMongo = async () => {
  if (globalForMongo.mongoose) {
    return globalForMongo.mongoose;
  }

  try {
    const uri = env.MONGODB_URI ?? env.DATABASE_URL;
    if (!uri) throw new Error("Missing DATABASE_URL/MONGODB_URI");
    const connection = await mongoose.connect(uri);
    console.log("Connected to MongoDB");
    globalForMongo.mongoose = connection;
    return connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export const getMongoConnection = () => {
  return mongoose.connection;
};