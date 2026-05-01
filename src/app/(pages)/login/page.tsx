"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import { Leaf, Mail, Lock, LogIn, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState({ email: "", password: "" });
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const onLogin = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/admin/login", user);
      toast.success("Login Successful!");
      router.push("/AdminDashboard");
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Invalid email or password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setButtonDisabled(!(user.email && user.password));
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <Toaster position="top-right" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-2xl shadow-xl shadow-slate-200/50 w-full max-w-md border border-slate-100"
      >
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4 border border-green-100">
             <Leaf className="w-10 h-10 text-green-600 rotate-12" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">WasteIQ</h1>
          <p className="text-slate-400 font-medium text-sm mt-1 uppercase tracking-widest px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">Admin Portal</p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-green-600 transition-colors" />
              <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleChange}
                placeholder="admin@clean-ai.com"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all placeholder:text-slate-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-green-600 transition-colors" />
              <input
                type="password"
                name="password"
                value={user.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all placeholder:text-slate-300"
              />
            </div>
          </div>
        </div>

        <button
          onClick={onLogin}
          disabled={loading || buttonDisabled}
          className={`w-full mt-8 flex justify-center items-center gap-3 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg ${loading || buttonDisabled
              ? "bg-slate-200 cursor-not-allowed shadow-none"
              : "bg-green-600 hover:bg-green-700 shadow-green-200 active:scale-[0.98]"
            }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Authenticating...
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Login to Console
            </>
          )}
        </button>

        <p className="mt-8 text-center text-slate-500 font-medium">
          New to the system?{" "}
          <Link
            href="/signup"
            className="text-green-600 hover:text-green-700 font-bold underline-offset-4 hover:underline"
          >
            Create Admin Account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
