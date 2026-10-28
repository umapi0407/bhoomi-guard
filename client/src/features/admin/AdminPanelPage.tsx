import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  Clock,
  Radio,
  RefreshCw,
  Send,
  Truck,
  PlusCircle,
  UserCheck,
  XCircle,
  MapPin,
  Sparkles,
  PhoneCall,
  Check,
  Sliders,
} from 'lucide-react';
import { api } from '../../services/api';
import { socket } from '../../services/socket';
import { IncidentItem } from '../incidents/IncidentsPage';

export const AdminPanelPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'INCIDENTS' | 'ALERTS' | 'BROADCAST'>('INCIDENTS');
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Manual Alert Form State
  const [newAlert, setNewAlert] = useState({
    regionCode: 'SK-GTK',
    regionName: 'Gangtok & East Sikkim (NH-10)',
    severity: 'ORANGE',
    title: '',
    reason: '',
    rainfallRecorded: 85,
    thresholdValue: 75,
    recommendations: 'Restrict heavy truck transit along steep hill cuts.',
  });
  const [broadcasting, setBroadcasting] = useState(false);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [incRes, altRes] = await Promise.all([api.get('/incidents'), api.get('/alerts')]);
      if (incRes.data?.data) setIncidents(incRes.data.data);
      if (altRes.data?.data) setAlerts(altRes.data.data);
    } catch (e) {
      console.warn('[AdminPanel] Error fetching initial data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Socket.io real-time listeners for live updates
    const handleIncCreated = (newInc: IncidentItem) => {
      setIncidents((prev) => [newInc, ...prev.filter((i) => i.incidentId !== newInc.incidentId)]);
      showNotification(`⚡ New Incident Reported: ${newInc.title}`);
    };

    const handleIncUpdated = (updInc: IncidentItem) => {
      setIncidents((prev) =>
        prev.map((i) => (i.incidentId === updInc.incidentId ? { ...i, ...updInc } : i))
      );
    };

    const handleAltCreated = (newAlt: any) => {
      setAlerts((prev) => [newAlt, ...prev.filter((a) => a.alertId !== newAlt.alertId)]);
      showNotification(`🚨 New Alert Generated: ${newAlt.title}`);
    };

    const handleAltApproved = (updAlt: any) => {
      setAlerts((prev) =>
        prev.map((a) => (a.alertId === updAlt.alertId ? { ...a, status: 'APPROVED' } : a))
      );
    };

    socket.on('incident:created', handleIncCreated);
    socket.on('incident:updated', handleIncUpdated);
    socket.on('alert:created', handleAltCreated);
    socket.on('alert:approved', handleAltApproved);

    return () => {
      socket.off('incident:created', handleIncCreated);
      socket.off('incident:updated', handleIncUpdated);
      socket.off('alert:created', handleAltCreated);
      socket.off('alert:approved', handleAltApproved);
    };
  }, []);

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 4000);
  };

  // 1. Verify Incident Action
  const handleVerifyIncident = async (incidentId: string, status: 'VERIFIED' | 'RESOLVED' | 'REJECTED') => {
    try {
      await api.post(`/incidents/${incidentId}/verify`, {
        status,
        verifiedBy: 'District Magistrate Emergency Control Cell',
        notes: `Status changed to ${status} via BhoomiGuard Admin Console`,
      });
      showNotification(`Incident #${incidentId} updated to ${status} in real time!`);
    } catch (e) {
      // Optimistic update
      setIncidents((prev) =>
        prev.map((i) =>
          i.incidentId === incidentId
            ? { ...i, status, verifiedBy: 'District Magistrate Emergency Cell' }
            : i
        )
      );
      showNotification(`Incident #${incidentId} updated to ${status} (Local)`);
    }
  };

  // 2. Approve Alert Action
  const handleApproveAlert = async (alertId: string) => {
    try {
      await api.post(`/alerts/${alertId}/approve`, { officerName: 'State Disaster Response Officer' });
      showNotification(`Alert #${alertId} approved and broadcasted to public!`);
    } catch (e) {
      setAlerts((prev) =>
        prev.map((a) => (a.alertId === alertId ? { ...a, status: 'APPROVED' } : a))
      );
    }
  };

  // 3. Resolve Alert Action
  const handleResolveAlert = async (alertId: string) => {
    try {
      await api.post(`/alerts/${alertId}/resolve`);
      showNotification(`Alert #${alertId} marked as RESOLVED.`);
    } catch (e) {
      setAlerts((prev) =>
        prev.map((a) => (a.alertId === alertId ? { ...a, status: 'RESOLVED' } : a))
      );
    }
  };

  // 4. Create Custom Alert Broadcast
  const handleCreateBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlert.title || !newAlert.reason) return;
    setBroadcasting(true);

    try {
      await api.post('/alerts', {
        regionCode: newAlert.regionCode,
        regionName: newAlert.regionName,
        severity: newAlert.severity,
        title: newAlert.title,
        reason: newAlert.reason,
        rainfallRecorded: newAlert.rainfallRecorded,
        thresholdValue: newAlert.thresholdValue,
        recommendations: [newAlert.recommendations],
        officerName: 'District Disaster Management Authority',
      });

      showNotification('Emergency Warning Broadcasted live across website and WhatsApp!');
      setNewAlert({
        regionCode: 'SK-GTK',
        regionName: 'Gangtok & East Sikkim (NH-10)',
        severity: 'ORANGE',
        title: '',
        reason: '',
        rainfallRecorded: 85,
        thresholdValue: 75,
        recommendations: 'Restrict heavy truck transit along steep hill cuts.',
      });
      setActiveTab('ALERTS');
    } catch (err: any) {
      showNotification('Failed to broadcast alert: ' + err.message);
    } finally {
      setBroadcasting(false);
    }
  };

  const pendingIncidentsCount = incidents.filter((i) => i.status === 'REPORTED').length;
  const pendingAlertsCount = alerts.filter((a) => a.status === 'PENDING_APPROVAL').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Action Notification Banner */}
      {actionMessage && (
        <div className="p-4 bg-emerald-600 text-white font-bold text-xs rounded-2xl shadow-xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-white hover:text-emerald-200">
            &times;
          </button>
        </div>
      )}

      {/* Admin Dashboard Header */}
      <div className="bg-[#10281F] text-white p-6 sm:p-8 rounded-3xl border border-emerald-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              OFFICIAL EMERGENCY DISPATCH
            </span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <Radio className="w-3.5 h-3.5 animate-pulse text-[#25D366]" />
              <span>Real-Time Socket Hub Active</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            District Command & Incident Moderation Console
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Verify incoming citizen reports, approve critical RED landslide warnings, and push real-time updates to public dashboards and WhatsApp subscribers.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all border border-white/20 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Database</span>
        </button>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Pending Reports</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-amber-600">{pendingIncidentsCount}</span>
            <span className="text-[10px] text-slate-400">Needs officer review</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Red Alerts Gate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-red-600">{pendingAlertsCount}</span>
            <span className="text-[10px] text-slate-400">Awaiting authorization</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Total Incidents Logged</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">{incidents.length}</span>
            <span className="text-[10px] text-slate-400">Real-time database</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Active Public Alerts</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600">
              {alerts.filter((a) => a.status === 'APPROVED').length}
            </span>
            <span className="text-[10px] text-slate-400">Live on map & site</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('INCIDENTS')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'INCIDENTS'
              ? 'bg-[#10281F] text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Truck className="w-4 h-4 text-emerald-400" />
          <span>Incident Moderation Queue ({incidents.length})</span>
          {pendingIncidentsCount > 0 && (
            <span className="text-[10px] bg-amber-500 text-white px-2 py-0.2 rounded-full font-bold">
              {pendingIncidentsCount} new
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ALERTS')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'ALERTS'
              ? 'bg-[#10281F] text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Early Warning Authorizations ({alerts.length})</span>
          {pendingAlertsCount > 0 && (
            <span className="text-[10px] bg-red-600 text-white px-2 py-0.2 rounded-full font-bold">
              {pendingAlertsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('BROADCAST')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'BROADCAST'
              ? 'bg-[#10281F] text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <PlusCircle className="w-4 h-4 text-emerald-400" />
          <span>Broadcast Manual Alert</span>
        </button>
      </div>

      {/* TAB 1: INCIDENTS MODERATION QUEUE */}
      {activeTab === 'INCIDENTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing all citizen & field reports. Verifying an item instantly reflects on the public <strong>/incidents</strong> and <strong>GIS Map</strong>.
            </span>
            <span>Sorted by newest submission</span>
          </div>

          <div className="space-y-4">
            {incidents.map((inc) => {
              const isReported = inc.status === 'REPORTED';
              const isVerified = inc.status === 'VERIFIED';
              const isResolved = inc.status === 'RESOLVED';

              const reporterName =
                typeof inc.reportedBy === 'object' ? inc.reportedBy.name : inc.reportedBy || 'Citizen';
              const reporterPhone =
                typeof inc.reportedBy === 'object' ? inc.reportedBy.phone : '';

              const loc =
                inc.locationName ||
                inc.location ||
                (typeof inc.coordinates === 'object'
                  ? `${inc.coordinates.lat}° N, ${inc.coordinates.lng}° E`
                  : 'Northeast Corridor');

              return (
                <div
                  key={inc.incidentId}
                  className={`bg-white rounded-2xl border p-6 shadow-sm space-y-4 transition-all ${
                    isReported
                      ? 'border-amber-300 bg-amber-50/20'
                      : isVerified
                      ? 'border-emerald-200'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {inc.incidentId}
                      </span>
                      <span className="text-xs font-bold text-[#10281F] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {inc.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(inc.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          isVerified
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isReported
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        STATUS: {inc.status}
                      </span>
                      <span className="text-[10px] font-bold bg-slate-800 text-white px-2 py-0.5 rounded">
                        {inc.severity}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{inc.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{inc.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span>{loc}</span>
                    </div>
                    <div>
                      Reporter: <strong>{reporterName}</strong> {reporterPhone && `(${reporterPhone})`}
                    </div>
                    {inc.verifiedBy && (
                      <div className="text-emerald-700">Verified by: {inc.verifiedBy}</div>
                    )}
                  </div>

                  {/* Admin Live Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                    {isReported && (
                      <button
                        onClick={() => handleVerifyIncident(inc.incidentId, 'VERIFIED')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Verify & Broadcast Live</span>
                      </button>
                    )}

                    {!isResolved && (
                      <button
                        onClick={() => handleVerifyIncident(inc.incidentId, 'RESOLVED')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Mark as Cleared / Resolved</span>
                      </button>
                    )}

                    {isReported && (
                      <button
                        onClick={() => handleVerifyIncident(inc.incidentId, 'REJECTED')}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject / Spam</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ALERTS AUTHORIZATION & GATES */}
      {activeTab === 'ALERTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Manage early warnings. Critical RED alerts remain in pending gate until authorized.</span>
          </div>

          <div className="space-y-4">
            {alerts.map((alt) => {
              const isPending = alt.status === 'PENDING_APPROVAL';
              const isRed = alt.severity === 'RED';

              return (
                <div
                  key={alt.alertId}
                  className={`bg-white rounded-2xl border-2 p-6 shadow-sm space-y-4 ${
                    isPending ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {alt.alertId}
                      </span>
                      <span
                        className={`text-xs font-bold text-white px-2.5 py-0.5 rounded-full ${
                          isRed ? 'bg-red-600' : 'bg-[#E8833A]'
                        }`}
                      >
                        {alt.severity}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(alt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        isPending
                          ? 'bg-red-100 text-red-800 animate-pulse'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {alt.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{alt.title}</h3>
                    <p className="text-xs text-slate-600 mt-1">{alt.reason}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                    <span>Region: <strong>{alt.regionName}</strong></span>
                    <span>&bull;</span>
                    <span>Rainfall Recorded: <strong>{alt.rainfallRecorded} mm</strong></span>
                    <span>&bull;</span>
                    <span>Threshold: <strong>{alt.thresholdValue} mm</strong></span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    {isPending && (
                      <button
                        onClick={() => handleApproveAlert(alt.alertId)}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Authorize & Dispatch Emergency Broadcast</span>
                      </button>
                    )}

                    {alt.status !== 'RESOLVED' && (
                      <button
                        onClick={() => handleResolveAlert(alt.alertId)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Mark Alert Resolved</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: BROADCAST MANUAL EMERGENCY ALERT */}
      {activeTab === 'BROADCAST' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#2E7D5B]" />
              <span>Broadcast Official Emergency Warning</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Submitting here creates a live alert event that appears in real-time across the website, map layers, and WhatsApp alert channel.
            </p>
          </div>

          <form onSubmit={handleCreateBroadcast} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Region / Sector *</label>
                <select
                  value={newAlert.regionCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    let name = 'Northeast India';
                    if (code === 'SK-GTK') name = 'Gangtok & East Sikkim (NH-10)';
                    if (code === 'MZ-AZL') name = 'Aizawl Ridge & NH-54';
                    if (code === 'ML-SHL') name = 'Shillong Plateau (Meghalaya)';
                    if (code === 'AS-GHY') name = 'Guwahati Hills (Assam)';
                    if (code === 'NL-KOH') name = 'Kohima Zubza Corridor';
                    if (code === 'MN-IMP') name = 'Imphal West & NH-37';
                    if (code === 'AR-ITN') name = 'Itanagar Capital Belt';
                    setNewAlert({ ...newAlert, regionCode: code, regionName: name });
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#2E7D5B] focus:outline-none"
                >
                  <option value="SK-GTK">Gangtok & East Sikkim (NH-10)</option>
                  <option value="MZ-AZL">Aizawl Ridge & NH-54 (Mizoram)</option>
                  <option value="ML-SHL">Shillong Plateau (Meghalaya)</option>
                  <option value="AS-GHY">Guwahati Hills (Assam)</option>
                  <option value="NL-KOH">Kohima Zubza Corridor (Nagaland)</option>
                  <option value="MN-IMP">Imphal West & NH-37 (Manipur)</option>
                  <option value="AR-ITN">Itanagar Capital Belt (Arunachal)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Severity Level *</label>
                <select
                  value={newAlert.severity}
                  onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#2E7D5B] focus:outline-none"
                >
                  <option value="ORANGE">ORANGE (High Preparedness Required)</option>
                  <option value="RED">RED (Critical Danger / Evacuation Advisory)</option>
                  <option value="YELLOW">YELLOW (Cautionary Advisory)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Alert Headline *</label>
              <input
                type="text"
                required
                placeholder="e.g. ORANGE Alert: Heavy Slump Warning on NH-10 near 29th Mile"
                value={newAlert.title}
                onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#2E7D5B] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Reason & Contributing Conditions *</label>
              <textarea
                required
                rows={3}
                placeholder="e.g. 110mm rainfall in last 18 hours exceeding critical 75mm threshold on 34° slope..."
                value={newAlert.reason}
                onChange={(e) => setNewAlert({ ...newAlert, reason: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#2E7D5B] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">SOP Recommendations / Advisories *</label>
              <input
                type="text"
                required
                placeholder="e.g. Halt heavy commercial trucks at night; deploy quick response units."
                value={newAlert.recommendations}
                onChange={(e) => setNewAlert({ ...newAlert, recommendations: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#2E7D5B] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={broadcasting}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{broadcasting ? 'Broadcasting Emergency Alert...' : 'Dispatch Live Emergency Warning'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
