"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  Hash,
  User,
  ArrowRight,
  Map as MapIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ReportDetailModal from "@/components/ui/reportdetailmodal";
import Image from "next/image";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import MapDashboard from "@/components/ui/MapDashboard";

export default function AdminReports() {
  const searchParams = useSearchParams();
  const initialUserFilter = searchParams.get("user") || "";

  const [searchQuery, setSearchQuery] = useState(initialUserFilter);
  const [filterStatus, setFilterStatus] = useState("all");
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [workers, setWorkers] = useState<any[]>([]);
  const [sliderValue, setSliderValue] = useState(50);

const assignWorkers = async () => {
  try {
    const res = await axios.post("/api/admin/assign-workers");

    if (res.data.success) {
      alert(`✅ Assigned ${res.data.updated} reports`);
      fetchReports(); // refresh UI
    }
  } catch (err) {
    console.error("Assignment failed", err);
  }
};
  useEffect(() => {
    fetchReports();
    fetchWorkers();
  }, [filterStatus]);

  const fetchWorkers = async () => {
    try {
      const response = await axios.get("/api/worker/all");
      if (response.data.success) {
        setWorkers(response.data.workers);
      }
    } catch (error) {
      console.error("Error fetching workers:", error);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/reports?status=${filterStatus}`);
      if (response.data.success) {
        setReports(response.data.reports);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report._id.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleViewDetails = (report: any) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const handleViewMap = (report: any) => {
    setSelectedReport(report);
    setShowMapModal(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              Reports Repository
            </h1>
            <p className="text-slate-400 font-medium mt-1">Review and manage the end-to-end garbage reporting lifecycle.</p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => {
                setSelectedReport(null);
                setShowMapModal(true);
              }}
              className="rounded-xl border-emerald-100 bg-emerald-50 shadow-sm hover:bg-emerald-100 text-emerald-700 font-bold px-6 py-5 border-2 active:scale-95 transition-all flex items-center gap-2"
            >
              <MapIcon className="w-4 h-4" />
              Analytics Map
            </Button>
            <Button
              onClick={fetchReports,assignWorkers}
              className="rounded-xl border-slate-200 bg-white shadow-sm hover:bg-slate-50 text-slate-600 font-bold px-6 py-5 border-2 active:scale-95 transition-all"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Feed
            </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-3xl shadow-sm p-8 mb-10 flex flex-col xl:flex-row items-center gap-6 border border-slate-100">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 focus-within:text-blue-500" />
            <Input
              type="text"
              placeholder="Search by Report ID, Location or Reporter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-7 w-full rounded-2xl border-slate-200 focus:ring-blue-500/10 focus:border-blue-500 text-lg shadow-sm"
            />
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {["all", "pending", "flagged", "in-progress", "completed"].map(
              (status) => (
                <button
                  key={status}
                  className={`rounded-xl px-6 py-3 font-black text-[10px] uppercase tracking-widest transition-all border-2 ${filterStatus === status
                    ? "bg-slate-800 border-slate-800 text-white shadow-lg shadow-slate-200 scale-105"
                    : "bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600"
                    }`}
                  onClick={() => setFilterStatus(status)}
                >
                  {status}
                </button>
              )
            )}
          </div>
        </div>

        {/* Reports Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl shadow-sm border border-slate-100">
            <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-slate-300 font-bold uppercase tracking-widest text-xs">Synchronizing with registry...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-24 text-center border border-slate-100">
            <AlertCircle className="w-20 h-20 text-slate-100 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-slate-800 mb-2">No Reports Found</h3>
            <p className="text-slate-400 font-medium">
              We couldn't find any reports matching your current filter set.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 pb-20">
            {filteredReports.map((report) => {
              const resolvedWorker =
                report.worker_id && typeof report.worker_id === "object"
                  ? report.worker_id
                  : workers.find((w) => w._id.toString() === report.worker_id?.toString()) || null;

              return (
                <div
                  key={report._id}
                  className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-slate-100 group"
                >
                  <div className="flex flex-col lg:flex-row gap-8 p-8">
                    {/* ============================= */
/* Smart Report Image Section */
/* ============================= */}

<div className="flex-shrink-0 w-full lg:w-[340px]">
  {/* COMPLETED REPORT */}
  {report.status === "completed" &&
  (report.worker_completed_image || report.after_image_url) ? (
    
    <div className="group relative overflow-hidden rounded-[2rem] border border-emerald-200 bg-white shadow-sm hover:shadow-2xl transition-all duration-500">
      
      {/* Status Badge */}
      <div className="absolute top-4 left-3 z-20 flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

        <span className="px-3 py-1 rounded-xl bg-emerald-500/90 backdrop-blur-xl text-white text-[10px] font-black uppercase tracking-[0.2em]">
          Completed
        </span>
      </div>


      {/* Image */}
      <div className="relative h-[250px] overflow-hidden">
        <Image
          src={
            report.worker_completed_image ||
            report.after_image_url
          }
          alt="Completed Cleanup"
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          unoptimized
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-transparent" />
      </div>

      {/* Footer */}
      <div className="p-5 bg-white">
        <div className="flex items-start justify-between gap-3">
          
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-1">
              Completed At
            </p>

            <p className="text-sm font-bold text-slate-800">
              {report.completed_at
                ? new Date(report.completed_at).toLocaleString()
                : "Recently"}
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider">
            Cleaned
          </div>
        </div>
      </div>
    </div>

  ) : (
    
    /* NORMAL REPORT */
    <div className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm hover:shadow-2xl transition-all duration-500">
      
      {/* Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />

        <span className="px-3 py-1 rounded-xl bg-black/70 backdrop-blur-xl text-white text-[10px] font-black uppercase tracking-[0.2em]">
          Reported Area
        </span>
      </div>

      {/* Image */}
      <div className="relative h-[250px] overflow-hidden">
        <Image
          src={report.image_url || "/no-image.png"}
          alt="Reported Area"
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          unoptimized
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* Footer */}
      <div className="p-5 bg-white">
        <div className="flex items-start justify-between gap-3">
          
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-1">
              Report Created
            </p>

            <p className="text-sm font-bold text-slate-800">
              {new Date(report.timestamp).toLocaleString()}
            </p>
          </div>

        </div>
      </div>
    </div>
  )}
</div>

                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          {/* Swapped: Primary title is now ID */}
                          <div className="flex items-center gap-2 mb-1">
                            <span className="p-1 px-2 bg-slate-100 text-slate-500 rounded font-black text-[10px] uppercase tracking-tighter">Report ID</span>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">
                              #{report._id.slice(-8)}
                            </h3>
                          </div>
                          {/* Reporter name is secondary and subtle */}
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-2">
                            <User className="w-3.5 h-3.5" /> ID: {report.user_id?.slice(-8) || "ANON"}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${report.status === "completed" || report.status === "verified"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : report.status === "in-progress"
                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                : report.status === "flagged"
                                  ? "bg-orange-50 text-orange-700 border-orange-100"
                                  : "bg-red-50 text-red-700 border-red-100"
                              }`}
                          >
                            {report.status}
                          </span>
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Live Tracking</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {report.status === "completed" && report.completed_at && (
                          <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                              <Clock className="w-4 h-4" />
                            </div>
                            <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
        Cleanup Completed
      </p>

      <p className="font-bold text-emerald-900 text-sm">
        {new Date(report.completed_at).toLocaleString()}
      </p>
    </div>
                          </div>
                        )}
                        {resolvedWorker ? (
                          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                Assigned Worker
                              </p>
                              <p className="font-bold text-emerald-900 text-sm">
                                {`${resolvedWorker.firstName || ""} ${resolvedWorker.lastName || ""}`.trim() || "Worker Assigned"}
                              </p>
                              <p className="text-[10px] text-emerald-700 font-bold">
                                ID: #{(resolvedWorker._id || "").toString().slice(-6) || "N/A"}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                            <div className="p-2 bg-slate-200 text-slate-500 rounded-lg">
                              <User className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-slate-500 text-sm">
                              No Worker Assigned
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-700 text-sm truncate">{report.address || "Verifying location..."}</span>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                          <div className="p-2 bg-slate-200 text-slate-600 rounded-lg">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-700 text-sm">
                            {new Date(report.timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-auto">
                        <button
                          onClick={() => handleViewDetails(report)}
                          className="flex-1 py-4 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group/btn"
                        >
                          <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> View Investigation
                        </button>

                        <button
                          onClick={() => handleViewMap(report)}
                          className="w-16 h-16 flex items-center justify-center border-2 border-slate-100 hover:border-slate-200 hover:bg-white text-slate-400 hover:text-blue-500 rounded-2xl transition-all active:scale-[0.95]"
                        >
                          <MapPin className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setShowDetailModal(false)}
          onDelete={() => { }}
        />
      )}

      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center z-50 p-4 md:p-8">
          <div className="bg-white rounded-[3rem] w-full max-w-7xl h-full max-h-[95vh] relative shadow-2xl overflow-hidden border border-white/20">
            <button
              className="absolute top-8 right-8 z-[60] w-14 h-14 bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl flex items-center justify-center text-slate-800 hover:text-red-500 font-black transition-all active:scale-90 border border-slate-100"
              onClick={() => setShowMapModal(false)}
            >
              ×
            </button>
            <div className="w-full h-full">
              <MapDashboard
                reports={reports}
                workers={workers}
                selectedReport={selectedReport}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
