import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide a username"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, "Please provide a mobile number"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
    },
    employeeId: {
      type: String,
      required: [true, "Please provide an employee ID"],
      unique: true,
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Please provide a department"],
    },
    designation: {
      type: String,
      required: [true, "Please provide a designation"],
    },
    role: {
      type: String,
      required: [true, "Please provide a role"],
    },
    zone: {
      type: String,
      required: [true, "Please provide a zone"],
    },
    ward: {
      type: String,
      required: [true, "Please provide a ward/area"],
    },
    officeLocation: {
      type: String,
      required: [true, "Please provide an office location"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: true,
    },
    forgotPasswordToken: { type: String, default: null },
    forgotPasswordTokenExpiry: { type: Date, default: null },
    verifyToken: { type: String, default: null },
    verifyTokenExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);
export default Admin;
