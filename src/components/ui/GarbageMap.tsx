"use client";

import React, { useMemo, useState } from 'react';
import Map, { Marker, Source, Layer, Popup, NavigationControl, FullscreenControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Truck, AlertTriangle, ShieldCheck, Clock, User, HardHat } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Location {
  lat: number;
  lng: number;
}

interface Report {
  _id: string;
  location: Location;
  status: string;
  address: string;
  username: string;
  timestamp: string;
  image_url: string;
  model_result?: any;
}

interface Worker {
  _id: string;
  firstName: string;
  lastName: string;
  location?: Location; // Mocked if missing
  isActive: boolean;
}

interface GarbageMapProps {
  reports: Report[];
  workers: Worker[];
  center?: Location;
  initialZoom?: number;
  showHeatmap: boolean;
  showWorkers: boolean;
  showReports: boolean;
}

const GarbageMap: React.FC<GarbageMapProps> = ({
  reports,
  workers,
  center = { lat: 23.0225, lng: 72.5714 }, // Ahmedabad
  initialZoom = 12,
  showHeatmap,
  showWorkers,
  showReports,
}) => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [hoveredItem, setHoveredItem] = useState<any>(null);

  // Mock locations for workers since they don't have real ones yet
  const mockedWorkers = useMemo(() => {
    return workers.map((w) => ({
      ...w,
      location: w.location || {
        lat: center.lat + (Math.random() - 0.5) * 0.1,
        lng: center.lng + (Math.random() - 0.5) * 0.1
      }
    }));
  }, [workers, center]);

  // Heatmap Data (GeoJSON)
  const heatmapData = useMemo(() => {
    return {
      type: 'FeatureCollection' as const,
      features: reports.map(r => ({
        type: 'Feature' as const,
        properties: {
          intensity: r.model_result?.total_mass || 0.5,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [r.location.lng, r.location.lat] as [number, number]
        }
      }))
    };
  }, [reports]);

  const heatmapLayer: any = {
    id: 'garbage-heatmap',
    type: 'heatmap',
    source: 'garbage-reports',
    maxzoom: 15,
    paint: {
      'heatmap-weight': {
        property: 'intensity',
        type: 'exponential',
        stops: [
          [0, 0],
          [5, 1]
        ]
      },
      'heatmap-intensity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        0, 1,
        15, 3
      ],
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(33,102,172,0)',
        0.2, 'rgb(103,169,207)',
        0.4, 'rgb(209,229,240)',
        0.6, 'rgb(253,219,199)',
        0.8, 'rgb(239,138,98)',
        1, 'rgb(178,24,43)'
      ],
      'heatmap-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        0, 2,
        15, 20
      ],
      'heatmap-opacity': 0.8
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-emerald-500 bg-emerald-50 border-emerald-200';
      case 'in-progress': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'flagged': return 'text-orange-500 bg-orange-50 border-orange-200';
      default: return 'text-red-500 bg-red-50 border-red-200';
    }
  };

  return (
    <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white relative group">
      <Map
        initialViewState={{
          longitude: center.lng,
          latitude: center.lat,
          zoom: initialZoom
        }}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />

        {/* Heatmap Layer */}
        {showHeatmap && (
          <Source id="garbage-reports" type="geojson" data={heatmapData}>
            <Layer {...heatmapLayer} />
          </Source>
        )}

        {/* Report Markers */}
        {showReports && reports.map((report) => {
          if (selectedItem && selectedItem.type === "report" && selectedItem._id !== report._id) {
            return null; // hide other markers
          }
          return (
            <Marker
              key={report._id}
              longitude={report.location.lng}
              latitude={report.location.lat}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedItem({ ...report, type: 'report' });
              }}
            >
              <motion.div
                whileHover={{ scale: 1.2, y: -5 }}
                className={`p-2.5 rounded-full shadow-xl border-2 cursor-pointer transition-all ${getStatusColor(report.status)}`}
              >
                {report.status === 'completed' ? <ShieldCheck className="w-5 h-5" /> :
                  report.status === 'flagged' ? <AlertTriangle className="w-5 h-5" /> :
                    <MapPin className="w-5 h-5" />}
              </motion.div>
            </Marker>
          )
        })}

        {/* Worker Markers */}
        {showWorkers && mockedWorkers.map((worker) => (
          <Marker
            key={worker._id}
            longitude={worker.location.lng}
            latitude={worker.location.lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedItem({ ...worker, type: 'worker' });
            }}
          >
            <motion.div
              whileHover={{ scale: 1.2, y: -5 }}
              className="p-2.5 bg-slate-900 text-yellow-400 rounded-full shadow-2xl border-2 border-yellow-400/50 cursor-pointer"
            >
              <HardHat className="w-5 h-5" />
            </motion.div>
          </Marker>
        ))}

        {/* Popups */}
        <AnimatePresence>
          {selectedItem && (
            <Popup
              longitude={selectedItem.location.lng}
              latitude={selectedItem.location.lat}
              anchor="bottom"
              onClose={() => setSelectedItem(null)}
              closeButton={false}
              className="z-[999]"
              offset={60}
            >
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white p-4 rounded-2xl shadow-2xl min-w-[320px] border border-slate-100"
              >
                {selectedItem.type === 'report' ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusColor(selectedItem.status)}`}>
                        {selectedItem.status}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">#{selectedItem._id.slice(-6)}</span>
                    </div>
                    <div className="aspect-video w-full bg-slate-100 rounded-xl overflow-hidden relative border border-slate-100">
                      <img
                        src={selectedItem.image_url && selectedItem.image_url.startsWith('http')
                          ? selectedItem.image_url
                          : `https://images.unsplash.com/photo-1574676039880-73da8368f0eb?w=600`}
                        alt="Garbage"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-xs truncate mb-1">{selectedItem.address}</h4>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px] font-medium">{new Date(selectedItem.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 border border-yellow-100 rounded-lg text-[9px] font-black uppercase tracking-widest">
                        Field Worker
                      </span>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="flex items-center gap-4 py-2">
                      <div className="w-12 h-12 bg-slate-900 text-yellow-400 rounded-xl flex items-center justify-center font-black">
                        {selectedItem.firstName[0]}{selectedItem.lastName[0]}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 text-sm leading-tight">{selectedItem.firstName} {selectedItem.lastName}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">ID: {selectedItem._id.slice(-6)}</p>
                      </div>
                    </div>
                    <button className="w-full py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                      Dispatch Instruction
                    </button>
                  </div>
                )}
              </motion.div>
            </Popup>
          )}
        </AnimatePresence>
      </Map>
    </div>
  );
};

export default GarbageMap;
