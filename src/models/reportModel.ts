import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    image_url: {
      type: String,
      required: true,
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "flagged", "in-progress", "completed", "verified", "rejected"],
      default: "pending",
    },
    is_genuine: {
      type: Boolean,
      default: true,
    },
    model_result: {
      error: { type: String, default: null },
      detections: [
        {
          label: String,
          confidence: Number,
          mass: Number,
          energy_potential: Number,
          area: Number,
        },
      ],
      total_mass: { type: Number, default: 0 },
      total_energy: { type: Number, default: 0 },
      coverage: { type: Number, default: 0 },
      sustainability_summary: {
    total_estimated_weight_kg: {
      type: Number,
      default: 0,
    },

    severity: {
      type: String,
      default: "low",
    },
  },
    },
    worker_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      default: null,
    }, 
    flagged_reason: {
      type: String,
      default: "",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    worker_completed_image: {
      type: String,
      default: null
    },
  },
  { timestamps: true }
);

const Report = mongoose.models.Report || mongoose.model("Report", reportSchema);
export default Report;
