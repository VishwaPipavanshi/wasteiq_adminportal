"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import { Leaf, User, Mail, Phone, Lock, Hash, Building2, Briefcase, MapPin, Loader2, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    employeeId: "",
    department: "",
    designation: "",
    role: "",
    zone: "",
    ward: "",
    officeLocation: "",
  });

  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const onSignup = async () => {
    if (user.password !== user.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/api/admin/signup", user, {
        headers: { "Content-Type": "application/json" },
      });

      toast.success("✅ Signup Successful!");
      setTimeout(() => router.push("/login"), 2000);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Signup failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const requiredFields = [
      "fullName", "email", "mobile", "password", "confirmPassword",
      "employeeId", "department", "designation", "role", "zone", "ward", "officeLocation",
    ];
    const allFilled = requiredFields.every((field) => (user as any)[field]);
    setButtonDisabled(!allFilled);
  }, [user]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4">
      <Toaster position="top-right" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100"
      >
        <div className="flex flex-col md:flex-row">
          {/* Left Branding Sidebar (Desktop) */}
          <div className="hidden lg:flex w-1/3 bg-gradient-to-br from-green-600 to-emerald-800 p-12 text-white flex-col justify-between">
            <div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                 <Leaf className="w-10 h-10 text-white rotate-12" />
              </div>
              <h1 className="text-4xl font-black mb-4">WasteIQ</h1>
              <p className="text-green-100 font-medium leading-relaxed">
                Join the elite staff portal. Manage, monitor, and modernize city waste management.
              </p>
            </div>
            
            <div className="space-y-4">
               <div className="flex items-center gap-3 text-sm font-bold bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                  <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                  Real-time Monitoring
               </div>
               <div className="flex items-center gap-3 text-sm font-bold bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                  <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse duration-700" />
                  Automated Moderation
               </div>
            </div>
          </div>

          {/* Right Form Area */}
          <div className="flex-1 p-8 md:p-12">
            <div className="mb-10 lg:hidden flex flex-col items-center">
                <Leaf className="w-12 h-12 text-green-600 mb-2" />
                <h1 className="text-2xl font-black text-slate-800">Clean-AI Registration</h1>
            </div>

            <div className="mb-10 hidden lg:block">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Staff Registration</h2>
              <p className="text-slate-400 font-medium mt-1">Create your administrative credentials below.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <InputField label="Full Name" name="fullName" icon={<User />} placeholder="Rajesh Patel" value={user.fullName} onChange={handleChange} />
              <InputField label="Official Email" name="email" icon={<Mail />} type="email" placeholder="rajesh@amc.gov.in" value={user.email} onChange={handleChange} />
              <InputField label="Mobile" name="mobile" icon={<Phone />} placeholder="+91 90000 00000" value={user.mobile} onChange={handleChange} />
              <InputField label="Employee ID" name="employeeId" icon={<Hash />} placeholder="AMC-2026-X" value={user.employeeId} onChange={handleChange} />
              <InputField label="Password" name="password" icon={<Lock />} type="password" placeholder="••••••••" value={user.password} onChange={handleChange} />
              <InputField label="Confirm" name="confirmPassword" icon={<Lock />} type="password" placeholder="••••••••" value={user.confirmPassword} onChange={handleChange} />
              <SelectField label="Department" name="department" icon={<Building2 />} value={user.department} onChange={handleChange} options={["Solid Waste Management", "Environment", "IT", "Health"]} />
              <InputField label="Designation" name="designation" icon={<Briefcase />} placeholder="Lead Monitor" value={user.designation} onChange={handleChange} />
              <SelectField label="Role" name="role" icon={<UserPlus />} value={user.role} onChange={handleChange} options={["Admin", "Supervisor", "Field Officer"]} />
              <SelectField label="Zone" name="zone" icon={<MapPin />} value={user.zone} onChange={handleChange} options={["East", "West", "North", "South", "Central"]} />
              <InputField label="Ward / Area" name="ward" icon={<MapPin />} placeholder="Maninagar" value={user.ward} onChange={handleChange} />
              <InputField label="Office Location" name="officeLocation" icon={<Building2 />} placeholder="AMC Bhavan" value={user.officeLocation} onChange={handleChange} />
            </div>

            <button
              onClick={onSignup}
              disabled={buttonDisabled || loading}
              className={`w-full mt-12 flex justify-center items-center gap-3 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-xl ${buttonDisabled || loading
                ? "bg-slate-200 cursor-not-allowed shadow-none"
                : "bg-green-600 hover:bg-green-700 shadow-green-200 active:scale-[0.98]"
              }`}
            >
              {loading ? (
                 <>
                   <Loader2 className="w-6 h-6 animate-spin" />
                   Processing Application...
                 </>
              ) : (
                "Complete Registration"
              )}
            </button>

            <p className="mt-8 text-center text-slate-500 font-medium">
              Already a staff member?{" "}
              <Link href="/login" className="text-green-600 hover:text-green-700 font-bold underline-offset-4 hover:underline">
                Login to Console
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function InputField({ label, name, placeholder, value, onChange, type = "text", icon }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-green-600 transition-colors">
          {icon}
        </div>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/5 focus:border-green-500 transition-all placeholder:text-slate-300"
        />
      </div>
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, icon }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-green-600 transition-colors z-10 pointer-events-none">
          {icon}
        </div>
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/5 focus:border-green-500 transition-all appearance-none cursor-pointer"
        >
          <option value="">Select {label}</option>
          {options.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
