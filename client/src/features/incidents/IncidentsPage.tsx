import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Truck,
  Plus,
  RefreshCw,
  Radio,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { socket } from '../../services/socket';

export interface IncidentItem {
  incidentId: string;
  type: string;
  title: string;
  description: string;
  locationName?: string;
  location?: string;
  coordinates: { lat: number; lng: number } | string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'REPORTED' | 'VERIFIED' | 'REJECTED' | 'RESOLVED';
  reportedBy: { name: string; phone?: string; role: string } | string;
  verifiedBy?: string;
  createdAt: string | Date;
}

export const IncidentsPage: React.FC = () => {
  const [filterType, setFilterType] = useState('ALL');
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [livePulse, setLivePulse] = useState(false);

  const HIGHWAYS = [
    {
      code: 'NH-10',
      route: 'Sevoke (WB) to Gangtok (Sikkim)',
      status: 'Caution Required',
      statusType: 'WARNING',
      details: 'Active mudflow clearance at 29th Mile. Single lane open with BRO marshals.',
    },
    {
      code: 'NH-54',
      route: 'Silchar (Assam) to Aizawl (Mizoram)',
      status: 'Diverted',
      statusType: 'DANGER',
      details: 'Hunthar bypass slump. Light vehicles diverted through Sairang secondary road.',
    },
    {
      code: 'NH-37',
      route: 'Imphal to Jiribam (Manipur)',
      status: 'Single Lane Open',
      statusType: 'WARNING',
      details: 'Heavy monsoon runoff cleared by machinery; night movement restricted.',
    },
    {
      code: 'SH-1',
      route: 'Shillong to Dawki (Meghalaya)',
      status: 'Normal Transit',
      statusType: 'NORMAL',
      details: 'All ghat curves clear. Fog and wet pavement advisory.',
    },
  ];

  // Fetch initial incidents from backend
  const fetchIncidents = async () => {
    try {
      const res = await api.get('/incidents');
      if (res.data?.data) {
        setIncidents(res.data.data);
      }
    } catch (err) {
      console.warn('[IncidentsPage] Failed to fetch incidents, using local state.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();

    // Listen for Real-Time Socket.io Events
    const handleCreated = (newIncident: IncidentItem) => {
      console.log('[IncidentsPage Live Event] New incident created:', newIncident);
      setIncidents((prev) => [newIncident, ...prev.filter((i) => i.incidentId !== newIncident.incidentId)]);
      setLivePulse(true);
      setTimeout(() => setLivePulse(false), 3000);
    };

    const handleUpdated = (updatedIncident: IncidentItem) => {
      console.log('[IncidentsPage Live Event] Incident updated:', updatedIncident);
      setIncidents((prev) =>
        prev.map((i) => (i.incidentId === updatedIncident.incidentId ? { ...i, ...updatedIncident } : i))
      );
      setLivePulse(true);
      setTimeout(() => setLivePulse(false), 3000);
    };

    socket.on('incident:created', handleCreated);
    socket.on('incident:updated', handleUpdated);

    return () => {
      socket.off('incident:created', handleCreated);
      socket.off('incident:updated', handleUpdated);
    };
  }, []);

  const filtered = incidents.filter((inc) =>
    filterType === 'ALL' ? true : inc.type === filterType
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-[#10281F] flex items-center gap-2">
              <Truck className="w-6 h-6 text-[#2E7D5B]" />
              <span>Mountain Highway Status & Road Blockages</span>
            </h1>
            {livePulse && (
              <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full animate-bounce">
                Live Update Received!
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Real-time transit bulletins and citizen incident reports synchronized live across Northeast India (NER).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Real-Time Sync Active</span>
          </div>

          <Link
            to="/report"
            className="bg-[#2E7D5B] hover:bg-[#25684b] text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Report Road Hazard</span>
          </Link>

          <Link
            to="/admin"
            className="bg-[#10281F] hover:bg-slate-900 text-white font-bold px-3 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all shrink-0"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
            <span>Admin Console</span>
          </Link>
        </div>
      </div>

      {/* Arterial Highway Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {HIGHWAYS.map((hw) => {
          const isDanger = hw.statusType === 'DANGER';
          const isWarning = hw.statusType === 'WARNING';
          const badgeClass = isDanger
            ? 'bg-red-100 text-red-800 border-red-200'
            : isWarning
            ? 'bg-amber-100 text-amber-800 border-amber-200'
            : 'bg-emerald-100 text-emerald-800 border-emerald-200';

          return (
            <div key={hw.code} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-base text-slate-900">{hw.code}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                  {hw.status}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-700">{hw.route}</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">{hw.details}</p>
            </div>
          );
        })}
      </div>

      {/* Filter Chips & Total Counts */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {['ALL', 'ROAD_BLOCKAGE', 'LANDSLIDE', 'FLASH_FLOOD', 'CRACKED_SLOPE'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all ${
                filterType === type
                  ? 'bg-[#10281F] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>

        <button
          onClick={fetchIncidents}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 font-medium"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Incident List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl p-10 text-center text-slate-500 text-xs">
            Loading real-time incidents feed...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center space-y-3 border border-slate-200">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No Active Road Blockages in this category</h3>
            <p className="text-xs text-slate-500">All mountain corridors are currently monitored and operational.</p>
          </div>
        ) : (
          filtered.map((inc) => {
            const isVerified = inc.status === 'VERIFIED';
            const isReported = inc.status === 'REPORTED';
            const isCritical = inc.severity === 'CRITICAL' || inc.severity === 'HIGH';

            const locText =
              inc.locationName ||
              inc.location ||
              (typeof inc.coordinates === 'object'
                ? `${inc.coordinates.lat}° N, ${inc.coordinates.lng}° E`
                : 'Northeast Corridor');

            const reporterText =
              typeof inc.reportedBy === 'object'
                ? `${inc.reportedBy.name} (${inc.reportedBy.role})`
                : inc.reportedBy || 'Citizen Reporter';

            const timeText =
              typeof inc.createdAt === 'string' && inc.createdAt.includes('ago')
                ? inc.createdAt
                : new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
                  ', ' +
                  new Date(inc.createdAt).toLocaleDateString();

            return (
              <div
                key={inc.incidentId}
                className={`bg-white rounded-2xl border p-6 shadow-sm space-y-3 transition-all ${
                  isCritical ? 'border-amber-200 hover:border-amber-400' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold font-mono text-[#2E7D5B] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                      {inc.incidentId}
                    </span>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {inc.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{timeText}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isVerified ? (
                      <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified by Officials</span>
                      </span>
                    ) : isReported ? (
                      <span className="text-xs bg-amber-50 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Awaiting Officer Review</span>
                      </span>
                    ) : (
                      <span className="text-xs bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full font-bold">
                        {inc.status}
                      </span>
                    )}

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md text-white ${
                        inc.severity === 'CRITICAL'
                          ? 'bg-red-600'
                          : inc.severity === 'HIGH'
                          ? 'bg-[#E8833A]'
                          : 'bg-slate-600'
                      }`}
                    >
                      {inc.severity}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{inc.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{inc.description}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-500 border-t border-slate-50">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{locText}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>Source: <strong className="text-slate-800">{reporterText}</strong></span>
                    {inc.verifiedBy && (
                      <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Officer: {inc.verifiedBy}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
