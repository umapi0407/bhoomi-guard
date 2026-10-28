import mongoose from 'mongoose';

export let isDbConnected = false;

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bhoomiguard';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    isDbConnected = true;
    console.log(`[Database] MongoDB successfully connected to ${uri}`);
  } catch (error: any) {
    isDbConnected = false;
    console.warn(`[Database Warning] Could not connect to MongoDB (${error.message}). Running in Resilient In-Memory Mode.`);
  }
};
