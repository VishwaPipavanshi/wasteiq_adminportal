import mongoose from "mongoose";

const workerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
      default: "",
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
    },
    aadhaar: {
      type: String,
      required: [true, "Aadhaar number is required"],
      unique: true,
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    zone: {
      type: String,
      required: [true, "Zone is required"],
    },
    ward: {
      type: String,
      required: [true, "Ward is required"],
    },
    // Geographic location for task assignment
    location: {
      lat: { type: Number, default: 23.0225 }, // Ahmedabad Default
      lng: { type: Number, default: 72.5714 },
    },
    // Reference to the admin who created this worker
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // OTP for forgot-password flow in the Flutter worker app
    forgotPasswordOTP: {
      type: String,
      default: null,
    },
    forgotPasswordOTPExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Worker =
  mongoose.models.Worker || mongoose.model("Worker", workerSchema);
export default Worker;
