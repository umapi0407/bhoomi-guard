import React, { useState } from 'react';
import {
  MessageSquare,
  ExternalLink,
  MapPin,
  HelpCircle,
  Truck,
  AlertTriangle,
  Send,
  Edit2,
  Check,
  ShieldCheck,
} from 'lucide-react';

interface WhatsAppActionCardProps {
  className?: string;
  defaultRegion?: string;
}

export const WhatsAppActionCard: React.FC<WhatsAppActionCardProps> = ({
  className = '',
  defaultRegion = 'GANGTOK',
}) => {
  // WhatsApp designated number (can be configured)
  const [botPhoneNumber, setBotPhoneNumber] = useState('917567556390');
  const [editingPhone, setEditingPhone] = useState(false);

  // User input fields
  const [regionType, setRegionType] = useState<'PRESET' | 'CUSTOM'>('PRESET');
  const [selectedRegion, setSelectedRegion] = useState(defaultRegion);
  const [customRegion, setCustomRegion] = useState('');

  // Intent: STATUS | ROADS | REPORT
  const [intent, setIntent] = useState<'STATUS' | 'ROADS' | 'REPORT'>('STATUS');
  const [reportDetails, setReportDetails] = useState('');

  const PRESET_REGIONS = [
    { code: 'GANGTOK', label: 'Gangtok & East Sikkim (NH-10)' },
    { code: 'SHILLONG', label: 'Shillong Plateau (Meghalaya)' },
    { code: 'AIZAWL', label: 'Aizawl Ridge (Mizoram NH-54)' },
    { code: 'GUWAHATI', label: 'Guwahati & Kamrup Hills (Assam)' },
    { code: 'KOHIMA', label: 'Kohima Zubza Corridor (Nagaland)' },
    { code: 'IMPHAL', label: 'Imphal West & NH-37 (Manipur)' },
    { code: 'ITANAGAR', label: 'Itanagar Capital Belt (Arunachal)' },
  ];

  // Active region name
  const activeLocation =
    regionType === 'PRESET'
      ? selectedRegion
      : customRegion.trim() || 'NORTHEAST';

  // Compute prefilled message
  let computedMessage = '';
  if (intent === 'STATUS') {
    computedMessage = `STATUS ${activeLocation}`;
  } else if (intent === 'ROADS') {
    computedMessage = `ROADS ${activeLocation}`;
  } else {
    const details = reportDetails.trim() ? ` ${reportDetails.trim()}` : '';
    computedMessage = `REPORT ${activeLocation}${details}`;
  }

  // Official universal WhatsApp redirect URL (works on mobile app + WhatsApp Web desktop)
  const cleanPhone = botPhoneNumber.replace(/[^0-9]/g, '');
  const whatsAppRedirectUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(
    computedMessage
  )}`;

  return (
    <div
      className={`bg-[#0E241B]/95 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 text-white ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366] shadow-sm">
            <MessageSquare className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white tracking-tight flex items-center gap-2">
              <span>WhatsApp Live Telemetry & Bot</span>
              <span className="text-[10px] bg-[#25D366]/20 text-[#25D366] px-2 py-0.5 rounded-full font-mono font-semibold">
                BOT ONLINE
              </span>
            </h3>
            <p className="text-xs text-slate-300">
              Select your region & query to open pre-filled WhatsApp chat
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Location Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>1. Select Monitored Region / Area:</span>
          </label>
          <div className="flex items-center gap-1 text-[11px]">
            <button
              type="button"
              onClick={() => setRegionType('PRESET')}
              className={`px-2 py-0.5 rounded-md transition-all ${regionType === 'PRESET'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              List
            </button>
            <span className="text-slate-600">|</span>
            <button
              type="button"
              onClick={() => setRegionType('CUSTOM')}
              className={`px-2 py-0.5 rounded-md transition-all ${regionType === 'CUSTOM'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              Type Custom
            </button>
          </div>
        </div>

        {regionType === 'PRESET' ? (
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full bg-[#183B2D] border border-emerald-500/40 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#25D366]"
          >
            {PRESET_REGIONS.map((r) => (
              <option key={r.code} value={r.code}>
                {r.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={customRegion}
            onChange={(e) => setCustomRegion(e.target.value)}
            placeholder="Type city, village, NH segment or Pincode..."
            className="w-full bg-[#183B2D] border border-emerald-500/40 text-white rounded-xl px-3.5 py-2.5 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#25D366]"
          />
        )}
      </div>

      {/* Step 2: Intent Selector (STATUS, ROADS, REPORT) */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>2. What information do you need?</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {/* Status Tab */}
          <button
            type="button"
            onClick={() => setIntent('STATUS')}
            className={`p-2.5 rounded-xl border text-center transition-all ${intent === 'STATUS'
                ? 'bg-[#2E7D5B] border-emerald-400 text-white shadow-md'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
          >
            <div className="flex items-center justify-center mb-1">
              <span className="text-xs font-extrabold tracking-wide">STATUS</span>
            </div>
            <span className="text-[10px] text-slate-200 block">
              Rain & Risk
            </span>
          </button>

          {/* Roads Tab */}
          <button
            type="button"
            onClick={() => setIntent('ROADS')}
            className={`p-2.5 rounded-xl border text-center transition-all ${intent === 'ROADS'
                ? 'bg-[#2E7D5B] border-emerald-400 text-white shadow-md'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
          >
            <div className="flex items-center justify-center mb-1">
              <Truck className="w-3.5 h-3.5 mr-1" />
              <span className="text-xs font-extrabold tracking-wide">ROADS</span>
            </div>
            <span className="text-[10px] text-slate-200 block">
              Highway Status
            </span>
          </button>

          {/* Report Tab */}
          <button
            type="button"
            onClick={() => setIntent('REPORT')}
            className={`p-2.5 rounded-xl border text-center transition-all ${intent === 'REPORT'
                ? 'bg-[#E8833A] border-amber-400 text-white shadow-md'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
          >
            <div className="flex items-center justify-center mb-1">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
              <span className="text-xs font-extrabold tracking-wide">REPORT</span>
            </div>
            <span className="text-[10px] text-slate-200 block">
              Send Hazard
            </span>
          </button>
        </div>
      </div>

      {/* Step 3: Optional Report Details (only if REPORT chosen) */}
      {intent === 'REPORT' && (
        <div className="space-y-1.5 animate-fadeIn">
          <label className="text-[11px] font-semibold text-amber-300">
            Brief description of the hazard / blockage:
          </label>
          <input
            type="text"
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
            placeholder="e.g. Mudslide near km 24, single lane blocked"
            className="w-full bg-[#183B2D] border border-amber-500/50 text-white rounded-xl px-3.5 py-2 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      )}

      {/* Step 4: Pre-filled String Preview */}
      <div className="bg-black/50 border border-emerald-500/20 rounded-xl p-3.5 font-mono text-xs space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans">
          <span>Pre-filled Message to WhatsApp:</span>
          <span className="text-emerald-400 font-mono text-[10px]">Ready to Send</span>
        </div>
        <div className="text-emerald-300 font-bold bg-[#10281F] px-3 py-2 rounded-lg border border-emerald-500/30 text-xs break-all flex items-center justify-between gap-2">
          <span>&quot;{computedMessage}&quot;</span>
          <Send className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        </div>
        <p className="text-[10px] text-slate-400 font-sans pt-0.5">
          {intent === 'STATUS' &&
            'Bot immediately replies with: 24h rainfall (mm), slope risk score, road status, and advisory.'}
          {intent === 'ROADS' &&
            'Bot immediately replies with: Live highway blockages on NH-10, NH-54, NH-37, and detours.'}
          {intent === 'REPORT' &&
            'Bot logs your ticket with district emergency teams and alerts nearby transit checkposts.'}
        </p>
      </div>

      {/* Step 5: Primary Action Button: Open in WhatsApp App / Web */}
      <div className="space-y-2 pt-1">
        <a
          href={whatsAppRedirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-extrabold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 text-sm group"
        >
          <MessageSquare className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
          <span>Open in WhatsApp & Send Query</span>
          <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
        </a>

        {/* Helper text explaining mobile app / web app opening */}
        <p className="text-[11px] text-slate-300 text-center leading-relaxed">
          Redirects to <strong>WhatsApp Mobile App</strong> or <strong>WhatsApp Web</strong> with your query pre-filled.
          Press <strong>Send</strong> in WhatsApp to receive your automated data report!
        </p>
      </div>

      {/* Bot Number Info & Quick Editor */}
      <div className="border-t border-white/10 pt-3 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Bot Number:</span>
          {editingPhone ? (
            <input
              type="text"
              value={botPhoneNumber}
              onChange={(e) => setBotPhoneNumber(e.target.value)}
              className="bg-black/60 border border-emerald-500 text-white rounded px-1.5 py-0.5 text-[11px] font-mono w-28"
            />
          ) : (
            <span className="text-slate-200 font-mono font-semibold">
              +{botPhoneNumber.slice(0, 2)} {botPhoneNumber.slice(2, 7)}{' '}
              {botPhoneNumber.slice(7)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setEditingPhone(!editingPhone)}
          className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px]"
        >
          {editingPhone ? (
            <>
              <Check className="w-3 h-3" />
              <span>Done</span>
            </>
          ) : (
            <>
              <Edit2 className="w-3 h-3" />
              <span>Change</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
