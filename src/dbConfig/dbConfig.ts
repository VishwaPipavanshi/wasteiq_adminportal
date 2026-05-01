import mongoose from "mongoose";

export async function connect() {
  try {
    mongoose.connect(process.env.MONGO_URI!);
    const connection = mongoose.connection;

    connection.on('connected', () => {
      console.log("MongoDB Connected successfully");
    })
    connection.on('error', (err) => {
      console.log("MongoDB connection failed");
      console.log(err);
      process.exit();
    });
  } catch (error) {
    console.log('Some thing went wrong!');
    console.log(error);
  }
}