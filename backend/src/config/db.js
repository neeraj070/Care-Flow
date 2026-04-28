const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not configured.");
  }

  await mongoose.connect(mongoUri, dbName ? { dbName } : undefined);
  // eslint-disable-next-line no-console
  console.log("MongoDB connected");
};

module.exports = connectDB;
