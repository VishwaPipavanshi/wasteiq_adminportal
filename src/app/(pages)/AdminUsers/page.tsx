"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, User, Mail, Calendar, FileText, CheckCircle, ChevronRight, RefreshCw, Filter, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/admin/users');

      console.log("API RESPONSE:", response.data);

      // const data = await response.json();
      // if (response.data.success) {
      //   setUsers(response.data.users);
      // }
      if (response.data?.users) {
        setUsers(response.data.users);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load user directory");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true;
    const username = u.username?.toLowerCase() || "";
    const email = u.email?.toLowerCase() || "";


    return (
      username.includes(searchQuery.toLowerCase()) ||
      email.includes(searchQuery.toLowerCase())
    );
  }
    // u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    // u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewReports = (username: string) => {
    // Redirect to Reports page with a filter (assuming AdminReports handles search query params)
    router.push(`/AdminReports?user=${username}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Citizen Directory</h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 bg-slate-100 w-fit px-3 py-1 rounded-lg">Community Intelligence Hub</p>
          </div>
          <Button
            onClick={fetchUsers}
            className="rounded-2xl bg-slate-900 hover:bg-emerald-600 text-white shadow-xl shadow-slate-200 px-8 py-7 font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 group"
          >
            <RefreshCw className={`w-5 h-5 mr-3 group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`} />
            Sync Registry
          </Button>
        </div>

        {/* Search & Stats Bar */}
        <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-white/20 mb-12 flex flex-col md:flex-row gap-8 items-center">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
            <Input
              placeholder="Identify citizen by credentials..."
              className="pl-16 py-8 rounded-[1.5rem] border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-emerald-500/10 focus:border-emerald-500 text-lg placeholder:text-slate-300 placeholder:font-medium shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Monitors</p>
              <p className="text-2xl font-black text-slate-800 leading-none">{filteredUsers.length}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
              <User className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Users Grid */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm p-40 text-center border border-slate-100">
            <RefreshCw className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Synchronizing with citizen registry...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-20 text-center border border-slate-100">
            <User className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800">No users found</h3>
            <p className="text-slate-500">Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredUsers.map((user, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={user._id}
                className="group relative bg-white/70 backdrop-blur-sm rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-white/50 overflow-hidden hover:bg-white hover:shadow-2xl transition-all duration-500"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-50 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 opacity-50" />

                <div className="p-8 relative z-10">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="w-16 h-16 bg-slate-900 rounded-[1.25rem] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-slate-200 group-hover:rotate-6 transition-transform duration-500">
                          {/* {user.username?.[0]?.toUpperCase() || "U"} */}
                          {user.profile_pic ? (
                            <img
                              src={user.profile_pic}
                              className="w-16 h-16 rounded-[1.25rem] object-cover"
                            />
                          ) : (
                            <span>{user.username?.[0]?.toUpperCase() || "U"}</span>
                          )}
                        </div>
                        {user.isOnline && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white shadow-lg animate-pulse" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800 text-xl tracking-tight group-hover:text-emerald-600 transition-colors">{user.username}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            {user.isOnline ? 'Active Now' : 'Last Seen'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Rank</p>
                      <div className="px-3 py-1 bg-slate-50 rounded-lg border border-slate-100 font-bold text-slate-800 text-xs">
                        #{(idx + 1).toString().padStart(2, '0')}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors duration-500">
                      <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400 mb-2">Intel Reports</p>
                      <div className="flex items-center gap-2.5 font-black text-slate-800 text-lg">
                        <FileText className="w-4 h-4 text-slate-900" />
                        {user.reportCount || 0}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors duration-500">
                      <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400 mb-2">Verified Cleans</p>
                      <div className="flex items-center gap-2.5 font-black text-emerald-600 text-lg">
                        <CheckCircle className="w-4 h-4" />
                        {user.verifiedCount ?? 0}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[150px]">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {user.lastActive
                            ? new Date(user.lastActive).toLocaleString()
                            : 'No activity'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewReports(user.username)}
                    className="w-full py-5 rounded-[1.25rem] bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 active:scale-[0.98] group/btn flex items-center justify-center gap-3"
                  >
                    Assess Operational Logs
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
