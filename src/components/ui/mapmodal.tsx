// "use client";

// interface MapModalProps {
//   locationName: string; // For display
//   lat: number;
//   lng: number;
//   onClose: () => void;
// }

// export default function MapModal({ locationName, lat, lng, onClose }: MapModalProps) {
//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-xl w-[90%] md:w-[600px] h-[400px] relative p-4">
//         <button
//           onClick={onClose}
//           className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white rounded-lg"
//         >
//           Close
//         </button>
//         <h3 className="text-center font-semibold mb-2">{locationName}</h3>
//         <iframe
//           className="w-full h-full rounded-lg"
//           src={`https://www.google.com/maps?q=${lat},${lng}&hl=es;z=15&output=embed`}
//           loading="lazy"
//         ></iframe>
//       </div>
//     </div>
//   );
// }


"use client";

import { motion } from "framer-motion";
import { X, MapPin } from "lucide-react";

interface MapModalProps {
  locationName: string;
  lat: number;
  lng: number;
  onClose: () => void;
}

export default function MapModal({ locationName, lat, lng, onClose }: MapModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white rounded-2xl w-[95%] md:w-[700px] h-[450px] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-slate-800 text-sm truncate">
              {locationName}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-red-50 text-slate-500 hover:text-red-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map */}
        <iframe
          className="w-full h-[calc(100%-50px)]"
          src={`https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
          loading="lazy"
        />

        {/* Footer Actions */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          <a
            href={`https://www.google.com/maps?q=${lat},${lng}`}
            target="_blank"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold shadow"
          >
            Open in Maps
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}