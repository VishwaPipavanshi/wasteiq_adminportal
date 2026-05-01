"use client";

import { Trash2, MapPin, Calendar, User, XCircle, CheckCircle2, Clock, AlertTriangle, Weight, Zap, Maximize, Leaf, Info, Recycle, Droplets } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { getWasteMetadata } from "@/lib/wasteMetadata";

interface ReportDetailModalProps {
  report: {
    _id: string;
    username: string;
    address: string;
    location: { lat: number; lng: number };
    status: string;
    timestamp: string;
    updatedAt?: string;
    assigned_at?: string;
    completed_at?: string;

    image_url: string;

    worker_completed_image?: string;
    after_image_url?: string;

    model_result?: {
      total_mass?: number;
      total_energy?: number;
      coverage?: number;
      flagged_reason?: string;

      sustainability_summary?: {
        total_estimated_weight_kg?: number;
        total_estimated_energy_recovery_kwh?: number;
        total_detections?: number;
      };

      detections?: {
        label: string;
        confidence: number;
        estimated_weight_kg: number;
        estimated_energy_recovery_kwh: number;
      }[];
    };
  };
  onClose: () => void;
  onDelete: (id: string) => void;
}

export default function ReportDetailModal({ report, onClose, onDelete }: ReportDetailModalProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const getStatusIcon = () => {
    switch (report.status) {
      case "completed":
      case "verified":
        return <CheckCircle2 className="text-green-600 w-5 h-5" />;
      case "in-progress":
        return <Clock className="text-yellow-500 w-5 h-5" />;
      case "flagged":
        return <AlertTriangle className="text-orange-500 w-5 h-5" />;
      default:
        return <XCircle className="text-red-500 w-5 h-5" />;
    }
  };

  const getStatusColor = () => {
    switch (report.status) {
      case "completed":
      case "verified":
        return "bg-green-100 text-green-700 border-green-300";
      case "in-progress":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "flagged":
        return "bg-orange-100 text-orange-700 border-orange-300";
      default:
        return "bg-red-100 text-red-700 border-red-300";
    }
  };

  // Fallback for image src to prevent Next.js errors
  const imageSrc =
    report?.image_url ||
    (report as any)?.image_url ||
    "https://via.placeholder.com/700x400?text=No+Image";


  // const totalMass =
  //   report.model_result?.sustainability_summary?.total_estimated_weight_kg || 0;

  // const energy =
  //   report.model_result?.sustainability_summary?.total_estimated_energy_recovery_kwh || 0;

  // coverage not stored → estimate from detections
  // const detectionsCount = report.model_result?.total_detections || 0;
  const detections = report.model_result?.detections || [];

const totalMass = detections.reduce(
  (sum, d) => sum + (d.estimated_weight_kg || 0),
  0
);

const energy = detections.reduce(
  (sum, d) => sum + (d.estimated_energy_recovery_kwh || 0),
  0
);

const coverage =
  detections.length > 0 ? Math.min(detections.length * 2, 100) : 0;
  // const coverage = detectionsCount > 0 ? Math.min(detectionsCount * 2, 100) : 0;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white/95 backdrop-blur-xl rounded-2xl w-[95%] md:w-[700px] max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center text-gray-600 hover:text-red-600 transition shadow-sm"
        >
          <XCircle className="w-6 h-6" />
        </button>

        {/* Image Header */}
        {/* ============================= */}
{/* BEFORE / AFTER IMAGE SECTION */}
{/* ============================= */}

<div className="relative w-full h-[420px] overflow-hidden rounded-t-2xl bg-black">

  {/* COMPLETED REPORT */}
  {report.status === "completed" &&
  (report.worker_completed_image || report.after_image_url) ? (

    <div
      className="relative w-full h-full"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = (x / rect.width) * 100;
        setSliderPosition(Math.max(0, Math.min(100, percent)));
      }}
    >
      {/* BEFORE IMAGE */}
      <Image
        src={report.image_url}
        alt="Before"
        fill
        className="object-cover"
        unoptimized
      />

      {/* AFTER IMAGE */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          width: `${sliderPosition}%`,
        }}
      >
        <Image
          src={
            report.worker_completed_image ||
            report.after_image_url!
          }
          alt="After"
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      {/* Slider Line */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl z-20"
        style={{
          left: `${sliderPosition}%`,
          transform: "translateX(-50%)",
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border-4 border-emerald-500 shadow-2xl flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-5 left-5 z-30">
        <span className="px-4 py-2 rounded-xl bg-emerald-500/90 text-white text-[10px] font-black uppercase tracking-[0.2em]">
          After
        </span>
      </div>

      <div className="absolute top-5 right-5 z-30">
        <span className="px-4 py-2 rounded-xl  bg-red-500/90 text-white text-[10px] font-black uppercase tracking-[0.2em]">
          Before
        </span>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />

      {/* Bottom Info */}
      <div className="absolute bottom-6 left-6 text-white z-30">
        <h2 className="text-3xl font-black tracking-tight">
          Report #{report._id.slice(-8).toUpperCase()}
        </h2>

        <p className="flex items-center gap-2 text-slate-200 mt-2 font-medium">
          <MapPin className="w-4 h-4" />
          {report.address || "Location unavailable"}
        </p>
      </div>
    </div>

  ) : (

    /* NORMAL IMAGE */

    <div className="relative w-full h-full">
      <Image
        src={imageSrc}
        alt={`Report ${report._id}`}
        fill
        className="object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

      <div className="absolute bottom-6 left-6 text-white">
        <h2 className="text-3xl font-black tracking-tight">
          Report #{report._id.slice(-8).toUpperCase()}
        </h2>

        <p className="flex items-center gap-2 text-slate-200 mt-2 font-medium">
          <MapPin className="w-4 h-4" />
          {report.address || "Location unavailable"}
        </p>
      </div>
    </div>
  )}
</div>

        {/* Content */}
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Info Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl transition-colors group-hover:bg-blue-100">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Submitted by</p>
                  <p className="text-gray-800 font-bold">{report.username}</p>
                </div>
              </div>

              {/* Timeline */}
<div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">

  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-5">
    Report Timeline
  </p>

  <div className="space-y-5">

    {/* Reported */}
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-4 h-4 rounded-full bg-red-500 border-4 border-red-100" />
        <div className="w-[2px] flex-1 bg-slate-200 mt-1" />
      </div>

      <div>
        <p className="text-xs font-black uppercase tracking-wider text-red-500">
          Report Created
        </p>

        <p className="text-sm font-bold text-slate-800 mt-1">
          {new Date(report.timestamp).toLocaleString()}
        </p>
      </div>
    </div>

    {/* Assigned */}
    {(report.assigned_at || report.updatedAt) && (
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className="w-4 h-4 rounded-full bg-blue-500 border-4 border-blue-100" />
          <div className="w-[2px] flex-1 bg-slate-200 mt-1" />
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wider text-blue-500">
            Worker Assigned
          </p>

          <p className="text-sm font-bold text-slate-800 mt-1">
            {new Date(report.assigned_at || report.updatedAt!).toLocaleString()}
          </p>
        </div>
      </div>
    )}

    {/* Completed */}
    {(report.completed_at || report.status === "completed")&& (
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className="w-4 h-4 rounded-full bg-emerald-500 border-4 border-emerald-100" />
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wider text-emerald-500">
            Cleanup Completed
          </p>

          <p className="text-sm font-bold text-slate-800 mt-1">
            {report.completed_at
    ? new Date(report.completed_at).toLocaleString()
    : "Cleanup completed"}
          </p>
        </div>
      </div>
    )}
  </div>
</div>

              <div
                className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border-2 font-bold w-fit ${getStatusColor()}`}
              >
                {getStatusIcon()}
                <span className="uppercase text-xs tracking-wider">
                  {report.status.replace("-", " ")}
                </span>
              </div>
            </div>

            {/* Model Results Section */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                <div className="p-1.5 bg-green-500 text-white rounded-lg">
                  <Leaf className="w-3.5 h-3.5" />
                </div>
                Detailed Inference Analytics
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center group">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Weight className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Mass</span>
                  </div>
                  <span className="text-sm font-black text-slate-900 leading-none">{totalMass.toFixed(3)} kg</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Zap className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Energy Potential</span>
                  </div>
                  <span className="text-sm font-black text-slate-900 leading-none">{energy.toFixed(3)} kWh</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Maximize className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Coverage Area</span>
                  </div>
                  <span className="text-sm font-black text-slate-900 leading-none">{coverage.toFixed(1)}%</span>
                </div>
              </div>

              {/* Environmental Impact Summary */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Waste Nature Summary</p>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(report.model_result?.detections?.map(d => d.label) || [])).map(label => {
                    const meta = getWasteMetadata(label);
                    if (!meta) return null;
                    return (
                      <span key={label} className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${meta.is_biodegradable ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {meta.title}
                      </span>
                    );
                  })}
                  {(report.model_result?.detections?.length || 0) === 0 && <span className="text-[10px] text-slate-400 italic font-medium">No classification data available.</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Environmental Impact & Handling Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
              <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Recycle className="w-4 h-4" /> Environmental Action
              </h4>
              <div className="space-y-4">
                {Array.from(new Set(report.model_result?.detections?.map(d => d.label) || [])).map(label => {
                  const meta = getWasteMetadata(label);
                  if (!meta) return null;
                  return (
                    <div key={label} className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{meta.category}</p>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{meta.handling_tip}</p>
                      </div>
                    </div>
                  );
                })}
                {(report.model_result?.detections?.length || 0) === 0 && (
                  <p className="text-xs text-slate-400 italic">Please wait for verification to see handling tips.</p>
                )}
              </div>
            </div>

            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
              <h4 className="text-xs font-black text-blue-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Info className="w-4 h-4" /> Estimation Notice
              </h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                These values are practical estimates based on typical single waste items and should be treated as guidance, not exact measured output. Total potential energy is calculated using standardized caloric values for {Array.from(new Set(report.model_result?.detections?.map(d => getWasteMetadata(d.label)?.title) || [])).join(", ") || "various materials"}.
              </p>
              <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-blue-200">
                <Droplets className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Recommended Treatment: Biogas/Pyrolysis</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-10">
            <button
              onClick={() => onDelete(report._id)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl transition font-bold shadow-lg shadow-red-200 active:scale-95 duration-200"
            >
              <Trash2 className="w-4 h-4" /> Delete Report
            </button>

            <button
              onClick={onClose}
              className="flex-1 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 px-6 py-3 rounded-xl transition font-bold active:scale-[0.98] duration-200 text-center"
            >
              Close Details
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
