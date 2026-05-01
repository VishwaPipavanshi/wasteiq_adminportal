"use client";

import React, { useState, useEffect } from 'react';
import { Search, Check, X, AlertCircle, Flag, RefreshCw, Eye, ShieldAlert, BadgeInfo } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminModeration() {
  const [reports, setReports] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchFlaggedReports();
  }, []);

  const fetchFlaggedReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/moderation');
      if (response.data.success) {
        setReports(response.data.reports);
      }
    } catch (error) {
      console.error("Error fetching flagged reports:", error);
      toast.error("Failed to load flagged reports");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (reportId: string, action: 'approve' | 'reject') => {
    try {
      const response = await axios.patch('/api/moderation', { reportId, action });
      if (response.data.success) {
        toast.success(`Report ${action}d successfully`);
        setReports(reports.filter(r => r._id !== reportId));
      }
    } catch (error) {
      console.error(`Error ${action}ing report:`, error);
      toast.error(`Failed to ${action} report`);
    }
  };

  const filteredReports = reports.filter(report => {
    return report.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.flagged_reason.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-4">
              Moderation Pipeline
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 bg-red-50 text-red-500 w-fit px-4 py-1.5 rounded-xl border border-red-100 shadow-sm">
              High-Precision Anomaly Analytics
            </p>
          </div>
          <Button
            onClick={fetchFlaggedReports}
            className="rounded-[1.5rem] bg-slate-900 hover:bg-red-600 text-white shadow-2xl shadow-slate-200 px-10 py-8 font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 group"
          >
            <RefreshCw className={`w-5 h-5 mr-3 group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`} />
            Refresh Audit Logs
          </Button>
        </div>

        {/* Global Search Bar */}
        <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 mb-12 border border-white/20 flex flex-col xl:flex-row items-center gap-8">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-red-500 transition-colors" />
            <Input
              type="text"
              placeholder="Search by reporter name or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-16 py-8 rounded-[1.5rem] border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-red-500/10 focus:border-red-500 text-lg placeholder:text-slate-200 shadow-inner transition-all"
            />
          </div>
          <div className="flex items-center gap-4 px-8 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <span>Intercepted Reports: {reports.length}</span>
          </div>
        </div>

        {/* Audit Feed */}
        {loading ? (
          <div className="bg-white rounded-3xl shadow-sm p-40 text-center border border-slate-100">
            <RefreshCw className="w-16 h-16 text-red-500 animate-spin mx-auto mb-6" />
            <p className="text-slate-300 font-black uppercase tracking-widest text-xs">Scanning registry for anomalies...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-24 text-center border border-slate-100">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-100">
              <Check className="w-12 h-12 text-emerald-500" />
            </div>
            <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-2">Registry Compliant</h3>
            <p className="text-slate-400 font-medium max-w-sm mx-auto">
              Deployment systems have verified all active reports as genuine. No manual moderation required.
            </p>
          </div>
        ) : (
          <div className="grid gap-10 pb-20">
            {filteredReports.map((report) => (
              <div key={report._id} className="bg-white rounded-3xl shadow-lg border border-red-50 overflow-hidden hover:border-red-200 transition-all group">
                <div className="p-10">
                  <div className="flex flex-col xl:flex-row gap-10">
                    {/* Media Proof */}
                    <div className="w-full xl:w-96 relative h-80 bg-slate-100 rounded-2xl overflow-hidden shadow-inner border border-slate-100 group-hover:scale-[1.01] transition-transform duration-500">
                      <Image
                        src={report.image_url?.startsWith("http")
                          ? report.image_url
                          : "https://images.unsplash.com/photo-1574676039880-73da8368f0eb?w=800"}
                        alt="Anomaly Proof"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    {/* Forensic info */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 font-black text-2xl border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-all">
                            {report.username[0].toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tighter leading-none">{report.username}</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Reporter ID: #{report.user_id?.slice(-8) || "XXXX"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-5 py-2 bg-red-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">
                          <Flag className="w-4 h-4 fill-white" /> AI Flagged
                        </div>
                      </div>

                      <div className="bg-red-50/50 p-6 rounded-2xl border-2 border-red-100/50 mb-8 shadow-sm">
                        <div className="flex items-start gap-4">
                          <BadgeInfo className="w-6 h-6 text-red-600 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1.5">Anomaly Reason</p>
                            <p className="text-red-900 font-bold text-lg tracking-tight leading-snug">{report.flagged_reason}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Incident Reference</p>
                          <p className="text-sm font-bold text-slate-800 truncate">#{report._id.slice(-8).toUpperCase()}</p>
                        </div>
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Detection Prob.</p>
                          <p className="text-sm font-bold text-slate-800">
                            {report.model_result?.detections?.[0]?.confidence ? `${(report.model_result.detections[0].confidence * 100).toFixed(1)}%` : "N/A Logic"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                          onClick={() => handleAction(report._id, 'approve')}
                          className="flex-1 py-7 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-200 active:scale-95 transition-all"
                        >
                          <Check className="w-5 h-5 mr-3" /> Override & Approve
                        </Button>
                        <Button
                          onClick={() => handleAction(report._id, 'reject')}
                          variant="outline"
                          className="flex-1 py-7 border-2 border-slate-200 bg-white text-slate-600 hover:bg-red-600 hover:text-white hover:border-red-600 font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all shadow-sm"
                        >
                          <X className="w-5 h-5 mr-3" /> Permanent Rejection
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
