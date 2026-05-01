"use client";

import React, { useState, useEffect } from 'react';
import GarbageMap from './GarbageMap';
import { 
  Layers, 
  Users, 
  FileText, 
  Flame, 
  Map as MapIcon, 
  Navigation,
  Info,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MapDashboardProps {
  reports: any[];
  workers: any[];
  selectedReport?: any;
}

const MapDashboard: React.FC<MapDashboardProps> = ({ reports, workers, selectedReport }) => {
  const [showHeatMap, setShowHeatMap] = useState(true);
  const [showWorkers, setShowWorkers] = useState(true);
  const [showReports, setShowReports] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Statistics
  const stats = {
    totalReports: reports.length,
    activeWorkers: workers.length,
    highDensityZones: reports.filter(r => r.status === 'flagged').length
  };

  const ControlButton = ({ active, onClick, icon: Icon, label }: any) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-500 border-2 ${
        active 
        ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200 scale-105' 
        : 'bg-white/80 backdrop-blur-md border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600'
      }`}
    >
      <Icon className={`w-4 h-4 transition-transform ${active ? 'scale-110' : ''}`} />
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
      {active && <motion.div layoutId="dot" className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />}
    </button>
  );

  return (
    <div className={`relative w-full ${isFullscreen ? 'fixed inset-0 z-[100] h-screen p-0' : 'h-[850px] p-2'}`}>
      <div className="w-full h-full relative group">
        <GarbageMap 
          reports={reports} 
          workers={workers} 
          showHeatmap={showHeatMap}
          showWorkers={showWorkers}
          showReports={showReports}
          center={selectedReport?.location}
          initialZoom={selectedReport ? 16 : 12}
        />

        {/* Floating Controls - Left */}
        <div className="absolute top-8 left-8 z-10 flex flex-col gap-3">
          <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/50 mb-4 min-w-[280px]"
          >
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-200">
                    <Navigation className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="font-black text-slate-800 text-sm tracking-tight">Geo-Spatial Command</h3>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Fleet Oversight Engine</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between group/stat">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl transition-colors group-hover/stat:bg-blue-600 group-hover/stat:text-white">
                            <FileText className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reports</span>
                    </div>
                    <span className="text-xl font-black text-slate-800 tracking-tighter">{stats.totalReports}</span>
                </div>

                <div className="flex items-center justify-between group/stat">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-yellow-50 text-yellow-600 rounded-xl transition-colors group-hover/stat:bg-yellow-600 group-hover/stat:text-white">
                            <Users className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Workers</span>
                    </div>
                    <span className="text-xl font-black text-slate-800 tracking-tighter">{stats.activeWorkers}</span>
                </div>

                <div className="flex items-center justify-between group/stat">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl transition-colors group-hover/stat:bg-orange-600 group-hover/stat:text-white">
                            <Flame className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hot Zones</span>
                    </div>
                    <span className="text-xl font-black text-slate-800 tracking-tighter">{stats.highDensityZones}</span>
                </div>
            </div>
          </motion.div>

          <ControlButton 
            active={showReports} 
            onClick={() => setShowReports(!showReports)} 
            icon={FileText} 
            label="Live Reports" 
          />
          <ControlButton 
            active={showWorkers} 
            onClick={() => setShowWorkers(!showWorkers)} 
            icon={Users} 
            label="Field Workers" 
          />
          <ControlButton 
            active={showHeatMap} 
            onClick={() => setShowHeatMap(!showHeatMap)} 
            icon={Flame} 
            label="Heatmap" 
          />
        </div>

        {/* Global Controls - Bottom */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 p-2 bg-white/20 backdrop-blur-md rounded-3xl border border-white/30">
            <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="w-14 h-14 bg-white hover:bg-slate-900 hover:text-white rounded-2xl shadow-xl flex items-center justify-center transition-all active:scale-90"
            >
                <Maximize2 className="w-6 h-6" />
            </button>
            <button className="px-8 bg-slate-900 text-white rounded-2xl shadow-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-emerald-600 transition-all active:scale-95">
                <MapIcon className="w-4 h-4" /> Recenter View
            </button>
            <button className="w-14 h-14 bg-white text-slate-400 rounded-2xl shadow-xl flex items-center justify-center hover:text-blue-500 transition-all">
                <Info className="w-6 h-6" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default MapDashboard;
