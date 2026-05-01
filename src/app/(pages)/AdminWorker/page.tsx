"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Trash2, Ban, Plus, CheckCircle, Copy, X, Loader2, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

interface Worker {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  mobile: string;
  zone: string;
  ward: string;
  isActive: boolean;
  createdAt: string;
}

interface Credentials {
  email: string;
  password: string;
}

const ZONES = ["East", "West", "North", "South", "Central"];
const WARDS = ["Ward A", "Ward B", "Ward C", "Ward D", "Ward E"];

export default function AdminWorker() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    mobile: "",
    aadhaar: "",
    address: "",
    zone: "",
    ward: "",
  });

  // Fetch workers from API
  const fetchWorkers = useCallback(async () => {
    try {
      setLoadingWorkers(true);
      const res = await axios.get("/api/worker/all");
      setWorkers(res.data.workers || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load workers");
    } finally {
      setLoadingWorkers(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({ firstName: "", middleName: "", lastName: "", email: "", mobile: "", aadhaar: "", address: "", zone: "", ward: "" });
  };

  const handleSubmit = async () => {
    const required = ["firstName", "lastName", "email", "mobile", "aadhaar", "address", "zone", "ward"] as const;
    for (const field of required) {
      if (!formData[field]) {
        toast.error(`${field} is required`);
        return;
      }
    }

    try {
      setSubmitting(true);
      const res = await axios.post("/api/worker/add", formData);
      setCredentials(res.data.credentials);
      setShowAddModal(false);
      resetForm();
      await fetchWorkers(); // refresh the list
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create worker");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (worker: Worker) => {
    const action = worker.isActive ? "deactivate" : "activate";
    if (!confirm(`Are you sure you want to ${action} ${worker.firstName} ${worker.lastName}?`)) return;
    try {
      await axios.put(`/api/worker/${worker._id}`, { isActive: !worker.isActive });
      toast.success(`Worker ${worker.isActive ? "deactivated" : "activated"} successfully`);
      fetchWorkers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Update failed");
    }
  };

  const handleDelete = async (worker: Worker) => {
    if (!confirm(`Permanently delete ${worker.firstName} ${worker.lastName}? This cannot be undone.`)) return;
    try {
      await axios.delete(`/api/worker/${worker._id}`);
      toast.success("Worker deleted");
      fetchWorkers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const filteredWorkers = workers.filter(
    (w) =>
      `${w.firstName} ${w.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.zone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Toaster position="top-right" />
      <div className="p-6 max-w-7xl mx-auto">

        {/* Search + Add */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6 flex justify-between items-center gap-4">
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, email, or zone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-[#4E9F3D] hover:bg-[#3e8c30] text-white flex gap-2 shrink-0"
          >
            <Plus size={18} /> Add Worker
          </Button>
        </div>

        {/* Workers Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loadingWorkers ? (
            <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading workers...
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No workers found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#F5F5F5] text-sm text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-4 text-left">Worker</th>
                  <th className="px-6 py-4 text-left">Zone / Ward</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Joined</th>
                  <th className="px-6 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkers.map((worker) => (
                  <tr key={worker._id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">
                        {worker.firstName} {worker.middleName} {worker.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{worker.email}</div>
                      <div className="text-sm text-gray-400">{worker.mobile}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {worker.zone} / {worker.ward}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          worker.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {worker.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(worker.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleActive(worker)}
                          title={worker.isActive ? "Deactivate" : "Activate"}
                          className="text-yellow-500 hover:text-yellow-700 transition-colors"
                        >
                          <Ban size={17} />
                        </button>
                        <button
                          onClick={() => handleDelete(worker)}
                          title="Delete"
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Worker Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-[#1E5128]">Add New Worker</h2>
              <button onClick={() => { setShowAddModal(false); resetForm(); }}>
                <X className="w-5 h-5 text-gray-500 hover:text-gray-800" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input name="firstName" placeholder="First Name *" onChange={handleChange} value={formData.firstName} />
              <Input name="middleName" placeholder="Middle Name" onChange={handleChange} value={formData.middleName} />
              <Input name="lastName" placeholder="Last Name *" onChange={handleChange} value={formData.lastName} />
              <Input name="email" type="email" placeholder="Email *" onChange={handleChange} value={formData.email} />
              <Input name="mobile" placeholder="Mobile Number *" onChange={handleChange} value={formData.mobile} />
              <Input name="aadhaar" placeholder="Aadhaar Number *" onChange={handleChange} value={formData.aadhaar} />
              <Input name="address" placeholder="Address *" onChange={handleChange} value={formData.address} className="col-span-2" />

              <select name="zone" onChange={handleChange} value={formData.zone} className="border border-gray-300 p-2.5 rounded-lg text-gray-700 bg-white">
                <option value="">Select Zone *</option>
                {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
              </select>

              <select name="ward" onChange={handleChange} value={formData.ward} className="border border-gray-300 p-2.5 rounded-lg text-gray-700 bg-white">
                <option value="">Select Ward *</option>
                {WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>

            <p className="text-xs text-gray-400 mt-3">* A secure password will be auto-generated. Save the credentials shown after creation.</p>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }}>Cancel</Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-[#4E9F3D] hover:bg-[#3e8c30] text-white"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating...</> : "Create Worker"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Modal — shown once after worker creation */}
      {credentials && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-center text-[#1E5128] mb-1">Worker Created!</h2>
            <p className="text-center text-sm text-gray-500 mb-5">
              Share these credentials with the worker. The password <strong>will not be shown again</strong>.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Login Email</p>
                  <p className="font-mono text-gray-800 text-sm">{credentials.email}</p>
                </div>
                <button onClick={() => copyToClipboard(credentials.email, "Email")} className="text-gray-400 hover:text-[#4E9F3D] transition-colors">
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Password (one-time)</p>
                  <p className="font-mono text-gray-800 text-sm tracking-widest">{credentials.password}</p>
                </div>
                <button onClick={() => copyToClipboard(credentials.password, "Password")} className="text-gray-400 hover:text-[#4E9F3D] transition-colors">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <Button
              onClick={() => setCredentials(null)}
              className="w-full mt-5 bg-[#4E9F3D] hover:bg-[#3e8c30] text-white"
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
