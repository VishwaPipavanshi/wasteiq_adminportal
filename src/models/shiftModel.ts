import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    start_time: {
      type: Date,
      required: true,
    },
    end_time: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Shift = mongoose.models.shifts || mongoose.model("shifts", shiftSchema);

export default Shift;
