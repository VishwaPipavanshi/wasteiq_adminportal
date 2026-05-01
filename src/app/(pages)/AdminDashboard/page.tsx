"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  AlertCircle,
  TrendingUp,
  MapPin,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CheckCircle2,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import axios from "axios";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState("7days");
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    verifiedReports: 0,
    activeWorkers: 0,
    totalWorkers: 0,
    idleWorkers: 0
  });
  const [reportsTrend, setReportsTrend] = useState([]);
  const [citizenUsers, setCitizenUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to get dates
  const getDateParams = (range: string) => {
    const end = new Date();
    const start = new Date();
    if (range === "today") {
      start.setHours(0, 0, 0, 0);
    } else if (range === "7days") {
      start.setDate(end.getDate() - 7);
    } else if (range === "30days") {
      start.setDate(end.getDate() - 30);
    }
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString()
    };
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateParams(dateRange);
      const res = await axios.get(`/api/admin/dashboard-stats?startDate=${startDate}&endDate=${endDate}`);

      setStats(res.data.stats);
      setReportsTrend(res.data.reportsTrend);
      setCitizenUsers(res.data.topPerformers); // API sends citizens in topPerformers field
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const StatCard = ({ title, value, icon: Icon, iconColor,trend, color, subtext }: any) => (
    <motion.div
      whileHover={{ y: -5 }}
      className="relative overflow-hidden bg-white/80 backdrop-blur-md rounded-[2rem] p-7 shadow-xl shadow-slate-200/50 border border-white/20 group transition-all duration-500"
    >
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-slate-100 to-transparent rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700" />

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-500 transform group-hover:rotate-6`}>
          <Icon className={`w-7 h-7 ${iconColor}`} />
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
          {trend > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : null}
          {trend ? `${trend}%` : subtext}
        </div>
      </div>

      <div className="relative z-10">
        <h3 className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-2">{title}</h3>
        <div className="flex items-baseline gap-2">
          <p className="text-4xl font-black text-slate-800 tracking-tight">{loading ? "..." : value}</p>
          {!loading && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Command Center</h1>
          <p className="text-slate-400 font-medium mt-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-500" />
            Ahmedabad | Real-time Oversight
          </p>
        </div>

        <div className="flex items-center bg-slate-50 p-2 rounded-2xl border border-slate-100 self-start">
          {['today', '7days', '30days'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${dateRange === range
                  ? 'bg-white text-emerald-600 shadow-md ring-1 ring-slate-200'
                  : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              {range.replace('days', ' Days')}
            </button>
          ))}
          <div className="w-px h-6 bg-slate-200 mx-2" />
          <button
            onClick={fetchDashboardData}
            className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-xl transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Reports in Period" value={stats.totalReports} icon={FileText} color="bg-blue-100" iconColor="text-blue-600" subtext="Live Feed" />
        <StatCard title="Pending Action" value={stats.pendingReports} icon={AlertCircle} color="bg-orange-100" iconColor="text-orange-600" subtext="Requires Review" />
        <StatCard title="Verified Clean" value={stats.verifiedReports} icon={CheckCircle2} color="bg-emerald-100" iconColor="text-emerald-600" subtext="Task Completed" />
        {/* <StatCard title="Active Workers" value={stats.activeWorkers} icon={Users} color="bg-purple-500" subtext="Field Deployed" /> */}
        <StatCard
          title="Active Workers"
          value={
            stats.activeWorkers > 0
              ? stats.activeWorkers
              : stats.totalWorkers ?? 0
          }
          icon={Users}
          color="bg-purple-100"
          iconColor="text-purple-600"
          subtext={
            stats.activeWorkers > 0
              ? "Currently Working"
              : "Total Workers"
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Reports Over Time</h2>
              <p className="text-slate-400 text-sm font-medium mt-1 uppercase tracking-widest">Incident Activity Trends</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-black text-xs uppercase tracking-widest border border-emerald-100">
              <TrendingUp className="w-4 h-4" /> Live Tracking
            </div>
          </div>

          <div className="h-[400px] w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-slate-200 animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reportsTrend}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#10b981"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* User Activity Card */}
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white/20">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">User Activity</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Live Citizen Feed</p>
            </div>
            <button
              onClick={() => router.push('/AdminUsers')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-slate-100 group"
            >
              <span className="text-[10px] font-black uppercase tracking-wider">View All</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="space-y-4">
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse opacity-50 p-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                    <div className="h-3 bg-slate-100 rounded w-1/4" />
                  </div>
                </div>
              ))
            ) : citizenUsers.length === 0 ? (
              <div className="text-center py-20 text-slate-400 font-medium italic">No recent activity detected.</div>
            ) : (
              citizenUsers.map((user: any, index) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={index}
                  className="flex items-center justify-between p-4 hover:bg-slate-50/80 rounded-2xl transition-all border border-transparent hover:border-slate-100 group cursor-pointer"
                  onClick={() => router.push('/AdminUsers')}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center text-slate-800 font-black text-sm uppercase border border-slate-200 group-hover:bg-white group-hover:border-emerald-200 transition-all">
                        {user.name?.[0] || "C"}
                      </div>
                      {user.isOnline && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm shadow-emerald-200 animate-pulse" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-[13px] leading-tight group-hover:text-emerald-600 transition-colors tracking-tight">{user.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${user.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{user.isOnline ? 'Active Now' : 'Offline'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-800 text-sm">{user.tasksCompleted}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Reports</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <button
            onClick={() => router.push('/AdminUsers')}
            className="w-full mt-10 py-5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-slate-200 active:scale-[0.98]"
          >
            Full Monitor Directory
          </button>
        </div>
      </div>
    </div>
  );
}
