import mongoose from "mongoose";

function getMongoUri(): string {
  let uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    throw new Error(
      "Please define MONGODB_URI environment variable inside .env.local"
    );
  }

  // 🎯 HARD FIX: Agar string mein purana 'mongodb+srv' aur 'saas.qwmunww' aa raha hai,
  // toh hum code ke andar hi usay direct shard cluster string se replace kar dete hain.
  if (uri.includes("mongodb+srv://") && uri.includes("saas.qwmunww.mongodb.net")) {
    console.log("⚠️ Detecting DNS SRV issue. Auto-rewriting connection string to Direct Shard...");
    uri = "mongodb://shuraimbutt4_db_user:uZ5iTe1RuNolhOgV@ac-qxswbmy-shard-00-00.qwmunww.mongodb.net:27017/blog-studio?ssl=true&authSource=admin&retryWrites=true&w=majority";
  }

  if (!/^mongodb(\+srv)?:\/\//.test(uri)) {
    throw new Error(
      'MONGODB_URI must start with "mongodb://" or "mongodb+srv://".'
    );
  }

  return uri;
}

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: CachedConnection | undefined;
}

const cached: CachedConnection =
  global.mongooseCache || {
    conn: null,
    promise: null,
  };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const finalUri = getMongoUri();
    console.log("Creating new MongoDB connection...");
    
    // Server selection timeout ko 15 seconds kiya taake local connection load le sake
    cached.promise = mongoose.connect(finalUri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000,
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log("✅ MongoDB connected successfully");
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error("❌ MongoDB connection failed:", error);
    throw error;
  }
}

export default connectDB;