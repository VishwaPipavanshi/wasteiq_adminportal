import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();


// await mongoose.connect("MONGO_URI");
await mongoose.connect(process.env.MONGO_URI);


// direct collection update (FAST + SAFE + NO IMPORT ISSUES)
await mongoose.connection.collection("reports").updateMany(
  {},
  { $unset: { assigned_at: "" } }
);

console.log("done");
process.exit();