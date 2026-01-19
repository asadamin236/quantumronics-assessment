import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB || process.env.MongoDb || process.env.MongoDB;
    if (!uri) {
      const keys = Object.keys(process.env);
      const matchKey = keys.find((k) => k.trim().toUpperCase() === 'MONGODB');
      if (matchKey) uri = process.env[matchKey];
    }
    if (!uri || typeof uri !== 'string') {
      throw new Error('MONGODB env var not set');
    }
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host} 🚀`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
