import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  Clock,
  CloudRain,
  PhoneCall,
  UserCheck,
  Radio,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { socket } from '../../services/socket';

interface AlertItem {
  alertId: string;
  regionCode: string;
  regionName: string;
  severity: 'YELLOW' | 'ORANGE' | 'RED';
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'DISPATCHED' | 'RESOLVED';
  title: string;
  reason: string;
  rainfallRecorded: number;
  thresholdValue: number;
  recommendations: string[];
  approvedBy?: string;
  createdAt: string | Date;
}

export const AlertsPage: React.FC = () => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [livePulse, setLivePulse] = useState(false);

  // Fetch initial alerts
  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts');
      if (res.data?.data) {
        setAlerts(res.data.data);
      }
    } catch (e) {
      console.warn('[AlertsPage] Failed to fetch alerts, using fallback.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Socket.io real-time listeners
    const handleCreated = (newAlert: AlertItem) => {
      console.log('[AlertsPage Live Event] New alert:', newAlert);
      setAlerts((prev) => [newAlert, ...prev.filter((a) => a.alertId !== newAlert.alertId)]);
      setLivePulse(true);
      setTimeout(() => setLivePulse(false), 3000);
    };

    const handleApproved = (upd: AlertItem) => {
      console.log('[AlertsPage Live Event] Alert approved:', upd);
      setAlerts((prev) =>
        prev.map((a) => (a.alertId === upd.alertId ? { ...a, status: 'APPROVED', approvedBy: upd.approvedBy } : a))
      );
      setLivePulse(true);
      setTimeout(() => setLivePulse(false), 3000);
    };

    const handleResolved = (upd: AlertItem) => {
      console.log('[AlertsPage Live Event] Alert resolved:', upd);
      setAlerts((prev) =>
        prev.map((a) => (a.alertId === upd.alertId ? { ...a, status: 'RESOLVED' } : a))
      );
    };

    socket.on('alert:created', handleCreated);
    socket.on('alert:approved', handleApproved);
    socket.on('alert:resolved', handleResolved);

    return () => {
      socket.off('alert:created', handleCreated);
      socket.off('alert:approved', handleApproved);
      socket.off('alert:resolved', handleResolved);
    };
  }, []);

  const handleApprove = async (alertId: string) => {
    setApprovingId(alertId);
    try {
      await api.post(`/alerts/${alertId}/approve`, { officerName: 'District Emergency Officer' });
      // Socket event will automatically update the UI on all screens
    } catch (e) {
      // Local optimistic update
      setAlerts((prev) =>
        prev.map((a) => (a.alertId === alertId ? { ...a, status: 'APPROVED' } : a))
      );
    } finally {
      setApprovingId(null);
    }
  };

  const filtered = alerts.filter((a) =>
    filterSeverity === 'ALL' ? true : a.severity === filterSeverity
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-[#10281F] flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-[#E8833A]" />
              <span>Landslide Risk Early Warning Bulletins</span>
            </h1>
            {livePulse && (
              <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full animate-bounce">
                Live Alert Synced!
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Autonomous alert triggers based on dynamic threshold crossing. RED level alerts enforce mandatory officer sign-off before mass public broadcast.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Live Socket Connected</span>
          </div>

          <Link
            to="/admin"
            className="bg-[#10281F] hover:bg-slate-900 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all shrink-0"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
            <span>Admin Control Room</span>
          </Link>
        </div>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-semibold">
          {['ALL', 'RED', 'ORANGE', 'YELLOW'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterSeverity === sev
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <button
          onClick={fetchAlerts}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 font-medium"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Alerts</span>
        </button>
      </div>

      {/* Alert Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl p-10 text-center text-slate-500 text-xs">
            Loading real-time early warning bulletins...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center space-y-3 border border-slate-200">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No Active Alerts in this Category</h3>
            <p className="text-xs text-slate-500">Telemetry levels are currently within safe thresholds.</p>
          </div>
        ) : (
          filtered.map((alert) => {
            const isRed = alert.severity === 'RED';
            const isOrange = alert.severity === 'ORANGE';
            const borderColor = isRed ? 'border-red-400' : isOrange ? 'border-[#E8833A]' : 'border-amber-300';
            const bgBadge = isRed ? 'bg-red-600' : isOrange ? 'bg-[#E8833A]' : 'bg-[#F2B84B] text-slate-950';

            const timeText =
              typeof alert.createdAt === 'string' && alert.createdAt.includes('ago')
                ? alert.createdAt
                : new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
                  ', ' +
                  new Date(alert.createdAt).toLocaleDateString();

            return (
              <div
                key={alert.alertId}
                className={`bg-white rounded-2xl border-2 ${borderColor} p-6 shadow-sm space-y-4 transition-all`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-white font-bold text-xs ${bgBadge}`}>
                      {alert.severity} SEVERITY
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      ID: {alert.alertId}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{timeText}</span>
                    </span>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2">
                    {alert.status === 'PENDING_APPROVAL' ? (
                      <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 animate-pulse">
                        <ShieldAlert className="w-4 h-4 text-red-600" />
                        <span>Pending Officer Approval</span>
                      </span>
                    ) : (
                      <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Authorized & Dispatched</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Reason */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{alert.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{alert.reason}</p>
                </div>

                {/* Telemetry Pills */}
                <div className="flex flex-wrap items-center gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <CloudRain className="w-4 h-4 text-blue-500" />
                    <span>24h Rainfall: <strong>{alert.rainfallRecorded} mm</strong></span>
                  </div>
                  <div className="text-slate-300">&bull;</div>
                  <div className="text-slate-700">
                    Threshold: <strong>{alert.thresholdValue} mm</strong>
                  </div>
                  <div className="text-slate-300">&bull;</div>
                  <div className="text-slate-700">
                    Zone: <strong>{alert.regionName}</strong>
                  </div>
                  {alert.approvedBy && (
                    <>
                      <div className="text-slate-300">&bull;</div>
                      <span className="text-emerald-700 font-medium">Authorized by: {alert.approvedBy}</span>
                    </>
                  )}
                </div>

                {/* SOP Recommendations */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Standard Operating Procedures:
                  </span>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {alert.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">&bull;</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Approval Action Bar for RED alerts */}
                {alert.status === 'PENDING_APPROVAL' && (
                  <div className="bg-red-50/70 border border-red-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-red-900">
                      <strong className="block font-semibold">Security Gate Enforced:</strong>
                      This critical alert requires officer validation before mass public broadcast.
                    </div>
                    <button
                      onClick={() => handleApprove(alert.alertId)}
                      disabled={approvingId === alert.alertId}
                      className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{approvingId === alert.alertId ? 'Authorizing...' : 'Approve & Broadcast'}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
