import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  CloudRain,
  AlertTriangle,
  ArrowRight,
  Radio,
  CheckCircle2,
  Layers,
  Sparkles,
  Mountain,
  Sliders,
  ShieldAlert,
  Truck,
  ExternalLink,
  MessageSquare,
  Activity,
  Check,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { WhatsAppActionCard } from '../../components/whatsapp/WhatsAppActionCard';
import { generateWhatsAppLink } from '../../services/api';

// Predefined 7 Northeast Monitoring Zones for the interactive radar
const RADAR_ZONES = [
  {
    code: 'SK-GTK',
    name: 'Sikkim',
    subTitle: 'Gangtok & Teesta Valley',
    highway: 'NH-10 (Sevoke–Gangtok)',
    riskLevel: 'ORANGE',
    riskScore: 78,
    rainfall: 98,
    threshold: 75,
    slope: '34.2°',
    geology: 'Schist & Gneiss Fragile Slopes',
    roadStatus: 'Single-lane caution at 29th Mile',
  },
  {
    code: 'ML-SHL',
    name: 'Meghalaya',
    subTitle: 'Shillong & Sohra Plateau',
    highway: 'Shillong–Dawki Highway',
    riskLevel: 'YELLOW',
    riskScore: 52,
    rainfall: 62,
    threshold: 90,
    slope: '28.5°',
    geology: 'Quartzite Bedrock with High Runoff',
    roadStatus: 'Normal transit with fog advisory',
  },
  {
    code: 'MZ-AZL',
    name: 'Mizoram',
    subTitle: 'Aizawl Ridge & Chhimtuipui',
    highway: 'NH-54 (Silchar–Aizawl)',
    riskLevel: 'RED',
    riskScore: 92,
    rainfall: 104,
    threshold: 60,
    slope: '38.0°',
    geology: 'Surma Group Soft Sandstone & Shale',
    roadStatus: 'Hunthar bypass slump, light vehicles diverted',
  },
  {
    code: 'AS-GHY',
    name: 'Assam',
    subTitle: 'Kamrup Foothills & Guwahati',
    highway: 'NH-27 / GS Road',
    riskLevel: 'GREEN',
    riskScore: 28,
    rainfall: 18,
    threshold: 65,
    slope: '22.0°',
    geology: 'Alluvial & Granitic Weathered Residuals',
    roadStatus: 'Fully operational',
  },
  {
    code: 'NL-KOH',
    name: 'Nagaland',
    subTitle: 'Kohima & Zubza Fault Line',
    highway: 'NH-29 (Dimapur–Kohima)',
    riskLevel: 'ORANGE',
    riskScore: 71,
    rainfall: 82,
    threshold: 70,
    slope: '32.5°',
    geology: 'Disang Shales Highly Susceptible to Slump',
    roadStatus: 'Slow moving traffic near Zubza gorge',
  },
  {
    code: 'MN-IMP',
    name: 'Manipur',
    subTitle: 'Imphal West & NH-37 Corridor',
    highway: 'NH-37 (Imphal–Jiribam)',
    riskLevel: 'YELLOW',
    riskScore: 48,
    rainfall: 54,
    threshold: 70,
    slope: '29.8°',
    geology: 'Tertiary Sedimentary Strata',
    roadStatus: 'Single lane cleared at multiple slips',
  },
  {
    code: 'AR-ITN',
    name: 'Arunachal Pradesh',
    subTitle: 'Itanagar & Papum Pare',
    highway: 'NH-415 (Holongi–Banderdewa)',
    riskLevel: 'ORANGE',
    riskScore: 74,
    rainfall: 89,
    threshold: 80,
    slope: '35.5°',
    geology: 'Siwalik Siltstone Unstable Mountain Cuts',
    roadStatus: 'Monsoon transit speed limits in effect',
  },
];

export const HomePage: React.FC = () => {
  // State for interactive 7-state radar
  const [activeZone, setActiveZone] = useState(RADAR_ZONES[0]);

  // State for interactive Risk Calculator Simulator
  const [simRainfall, setSimRainfall] = useState(95);
  const [simSlope, setSimSlope] = useState(34);
  const [simGeology, setSimGeology] = useState<'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH'>('HIGH');

  // Compute simulated dynamic risk
  const geologyMult =
    simGeology === 'VERY_HIGH' ? 1.35 : simGeology === 'HIGH' ? 1.2 : simGeology === 'MODERATE' ? 1.05 : 0.9;
  const slopeMult = simSlope > 30 ? 1.25 : 1.0;
  const baseScore = Math.min(
    100,
    Math.round((simRainfall / 75) * 60 * geologyMult * slopeMult)
  );

  let simLevel: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' = 'GREEN';
  let simBadgeColor = 'bg-emerald-600';
  let simAction = 'Routine automated telemetry monitoring.';
  if (baseScore >= 85 || simRainfall >= 110) {
    simLevel = 'RED';
    simBadgeColor = 'bg-red-600';
    simAction = 'Critical threshold crossed! Mandatory District Officer sign-off triggered.';
  } else if (baseScore >= 65 || simRainfall >= 75) {
    simLevel = 'ORANGE';
    simBadgeColor = 'bg-[#E8833A]';
    simAction = 'High risk: Automated WhatsApp warning dispatched to road checkposts.';
  } else if (baseScore >= 40 || simRainfall >= 45) {
    simLevel = 'YELLOW';
    simBadgeColor = 'bg-[#F2B84B] text-slate-950';
    simAction = 'Advisory: Mountain commuters notified of localized waterlogging.';
  }

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION WITH WHATSAPP ACTION CARD */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#071711] via-[#0E241B] to-[#143326] text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 shadow-2xl">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#25D366_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

            {/* Left Column: Headlines & Call to Actions */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-sm">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Smart India Hackathon 2024–2026 Innovation</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                See the Risk. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#25D366] via-emerald-300 to-[#F2B84B]">
                  Act Before Disaster.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-200 max-w-2xl leading-relaxed font-normal">
                BhoomiGuard synthesizes Open-Meteo precipitation, SRTM terrain slope models, and live highway status to provide
                early landslide risk warnings across <strong>Northeast India (NER)</strong>. Pure software-based intelligence—zero physical sensor maintenance.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-1">
                <Link
                  to="/map"
                  className="bg-[#2E7D5B] hover:bg-[#25684b] text-white font-bold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-emerald-900/40 transition-all flex items-center gap-2 text-sm"
                >
                  <Layers className="w-4 h-4" />
                  <span>Explore GIS Live Risk Map</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/alerts"
                  className="bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-6 py-3.5 rounded-xl transition-all flex items-center gap-2 text-sm"
                >
                  <AlertTriangle className="w-4 h-4 text-[#F2B84B]" />
                  <span>View Active Warnings (2)</span>
                </Link>
              </div>

              {/* Software-only Guarantees */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 pt-3 text-xs text-slate-300 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>100% Software Ingestion</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Open-Meteo Weather Feed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp Cloud Bot Integrated</span>
                </div>
              </div>
            </div>

            {/* Right Column: High-End Interactive WhatsApp Action Card */}
            <div className="lg:col-span-5">
              <WhatsAppActionCard />
            </div>

          </div>
        </div>
      </section>

      {/* 2. LIVE METRICS TICKER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-[#2E7D5B]">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Monitored Grid</p>
              <h4 className="text-xl font-bold text-slate-900">7 States (NER)</h4>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-50 text-[#E8833A]">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Elevated Warnings</p>
              <h4 className="text-xl font-bold text-[#E8833A]">2 Active (Orange/Red)</h4>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <CloudRain className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Peak 24h Rain Observed</p>
              <h4 className="text-xl font-bold text-slate-900">104.0 mm</h4>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">AI Ingestion Pipeline</p>
              <h4 className="text-xl font-bold text-emerald-700">Healthy & Active</h4>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE NORTHEAST 7-STATE HAZARD RADAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D5B] bg-[#2E7D5B]/10 px-3 py-1 rounded-full">
              Real-Time Regional Console
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#10281F] mt-2">
              Northeast India 7-State Hazard Radar
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Click any state to preview real-time rainfall saturation, critical highway status, and risk level.
            </p>
          </div>

          <Link
            to="/map"
            className="text-xs font-bold text-[#2E7D5B] hover:text-[#1F4D3C] flex items-center gap-1.5"
          >
            <span>Open Advanced GIS Map</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* State Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {RADAR_ZONES.map((zone) => {
            const isSelected = activeZone.code === zone.code;
            const badgeBg =
              zone.riskLevel === 'RED'
                ? 'bg-red-500'
                : zone.riskLevel === 'ORANGE'
                  ? 'bg-[#E8833A]'
                  : zone.riskLevel === 'YELLOW'
                    ? 'bg-[#F2B84B] text-slate-950'
                    : 'bg-emerald-600';

            return (
              <button
                key={zone.code}
                type="button"
                onClick={() => setActiveZone(zone)}
                className={`p-3 rounded-2xl text-left border transition-all ${isSelected
                    ? 'bg-[#10281F] text-white border-emerald-500 shadow-lg scale-[1.02]'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300 hover:bg-slate-50 shadow-sm'
                  }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-extrabold text-xs block">{zone.name}</span>
                  <span className={`w-2 h-2 rounded-full ${badgeBg}`}></span>
                </div>
                <span className={`text-[10px] truncate block ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {zone.subTitle.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Detailed State Telemetry Display Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* State Main Info & Dial */}
            <div className="lg:col-span-5 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-100 lg:pr-8 pb-6 lg:pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    CODE: {activeZone.code}
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                    {activeZone.name} ({activeZone.subTitle})
                  </h3>
                </div>

                <div
                  className={`px-3 py-1 rounded-xl font-bold text-xs text-white shadow-sm ${activeZone.riskLevel === 'RED'
                      ? 'bg-red-600'
                      : activeZone.riskLevel === 'ORANGE'
                        ? 'bg-[#E8833A]'
                        : activeZone.riskLevel === 'YELLOW'
                          ? 'bg-[#F2B84B] text-slate-950'
                          : 'bg-emerald-600'
                    }`}
                >
                  {activeZone.riskLevel} RISK ({activeZone.riskScore}/100)
                </div>
              </div>

              {/* Rainfall Gauge Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <CloudRain className="w-4 h-4 text-blue-500" />
                    <span>24h Rainfall Saturation</span>
                  </span>
                  <span className="font-bold text-slate-900">
                    {activeZone.rainfall} mm <span className="text-slate-400 font-normal">/ {activeZone.threshold} mm critical</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (activeZone.rainfall / activeZone.threshold) * 100)}%`,
                      backgroundColor:
                        activeZone.riskLevel === 'RED'
                          ? '#C8442F'
                          : activeZone.riskLevel === 'ORANGE'
                            ? '#E8833A'
                            : activeZone.riskLevel === 'YELLOW'
                              ? '#F2B84B'
                              : '#2E7D5B',
                    }}
                  />
                </div>
              </div>

              {/* Highway Connectivity */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>{activeZone.highway}</span>
                </div>
                <p className="text-xs text-slate-600">{activeZone.roadStatus}</p>
              </div>
            </div>

            {/* Terrain & Direct WhatsApp Telemetry Action */}
            <div className="lg:col-span-7 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <Mountain className="w-4 h-4 text-emerald-600" />
                    <span>Average Gradient Slope</span>
                  </span>
                  <p className="text-xl font-black text-slate-900 mt-1">{activeZone.slope}</p>
                  <span className="text-[11px] text-amber-700 font-medium">High gravitational shear</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-blue-600" />
                    <span>Geological Formation</span>
                  </span>
                  <p className="text-xs font-bold text-slate-800 mt-1 line-clamp-1">{activeZone.geology}</p>
                  <span className="text-[11px] text-slate-500">SRTM & GSI mapped</span>
                </div>
              </div>

              {/* Quick WhatsApp Link for this specific state */}
              <div className="bg-[#10281F] text-white p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="font-bold text-sm text-white flex items-center justify-center sm:justify-start gap-1.5">
                    <MessageSquare className="w-4 h-4 text-[#25D366]" />
                    <span>Receive {activeZone.name} Telemetry on WhatsApp</span>
                  </h4>
                  <p className="text-xs text-slate-300">
                    Sends pre-filled <code>STATUS {activeZone.code.split('-')[1]}</code> to BhoomiGuard Bot
                  </p>
                </div>

                <a
                  href={generateWhatsAppLink('917567556390', `STATUS ${activeZone.code.split('-')[1]}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all shrink-0"
                >
                  <span>Open WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE LANDSLIDE RISK TRIGGER SIMULATOR (JUDGE & DEMO SHOWCASE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#0B1E17] via-[#10281F] to-[#143326] text-white rounded-3xl p-6 sm:p-10 border border-emerald-500/30 shadow-2xl space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
                <Sliders className="w-3.5 h-3.5" />
                <span>Interactive Math & Heuristics Simulator</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Test the BhoomiGuard Risk Trigger Engine
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Drag the rainfall and slope sliders to witness how empirical Caine thresholds dynamically transition alert states.
              </p>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-mono text-emerald-400 block">EVALUATED SEVERITY:</span>
              <span className={`inline-block px-4 py-1.5 rounded-xl text-xs font-black text-white mt-1 shadow-md ${simBadgeColor}`}>
                {simLevel} ({baseScore}%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Sliders Input Panel */}
            <div className="lg:col-span-7 space-y-6 text-xs">
              {/* Slider 1: 24h Rainfall */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-200 flex items-center gap-1.5">
                    <CloudRain className="w-4 h-4 text-blue-400" />
                    <span>24h Rainfall Accumulation:</span>
                  </label>
                  <span className="font-mono font-bold text-emerald-300 text-sm bg-black/40 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    {simRainfall} mm
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="180"
                  value={simRainfall}
                  onChange={(e) => setSimRainfall(Number(e.target.value))}
                  className="w-full accent-[#25D366] bg-slate-800 h-2.5 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0 mm (Dry)</span>
                  <span>75 mm (Regional Critical Threshold)</span>
                  <span>180 mm (Extreme Monsoon)</span>
                </div>
              </div>

              {/* Slider 2: Average Slope Angle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Mountain className="w-4 h-4 text-emerald-400" />
                    <span>Terrain Slope Gradient:</span>
                  </label>
                  <span className="font-mono font-bold text-emerald-300 text-sm bg-black/40 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    {simSlope}°
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="50"
                  value={simSlope}
                  onChange={(e) => setSimSlope(Number(e.target.value))}
                  className="w-full accent-[#25D366] bg-slate-800 h-2.5 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>15° (Gentle Foothill)</span>
                  <span>30° (Gravitational Shear Onset)</span>
                  <span>50° (Steep Mountain Cut)</span>
                </div>
              </div>

              {/* Selector: Geological Susceptibility */}
              <div className="space-y-2">
                <label className="font-bold text-slate-200">Geological Formation Fragility:</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['LOW', 'MODERATE', 'HIGH', 'VERY_HIGH'] as const).map((geo) => (
                    <button
                      key={geo}
                      type="button"
                      onClick={() => setSimGeology(geo)}
                      className={`py-2 px-2 rounded-xl font-bold text-[11px] transition-all ${simGeology === geo
                          ? 'bg-[#2E7D5B] text-white border border-emerald-400 shadow-md'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                    >
                      {geo.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Computed Output Card */}
            <div className="lg:col-span-5 bg-black/40 border border-emerald-500/20 rounded-2xl p-6 space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
                ENGINE AUTOMATED DECISION
              </span>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Computed Instability Score:</span>
                  <span className="font-mono font-black text-xl text-white">{baseScore} / 100</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${simBadgeColor}`}
                    style={{ width: `${baseScore}%` }}
                  />
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-200 space-y-1">
                <strong className="block text-emerald-300">Automated Protocol:</strong>
                <p className="text-slate-300 text-[11px] leading-relaxed">{simAction}</p>
              </div>

              <div className="text-[11px] text-slate-400 pt-1">
                Algorithm: Modified Caine Intensity-Duration formula combined with static SRTM slope angle vector.
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. SOFTWARE-ONLY MULTI-LAYER INGESTION PIPELINE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D5B] bg-[#2E7D5B]/10 px-3 py-1 rounded-full">
            IoT Hardware Free
          </span>
          <h2 className="text-3xl font-bold text-[#10281F]">Software-Only Architecture Layers</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            How BhoomiGuard eliminates physical sensor maintenance costs by fusing authoritative open meteorological and geomorphic datasets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Precipitation Ingestion</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Open-Meteo & IMD hourly rainfall telemetry, past 24-hour accumulation, and 24h forecasts.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Terrain & Slope Geomorphology</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              SRTM 30-meter Digital Elevation Models providing slope angles, aspect, hill curvature, and relative relief.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Empirical Trigger Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dynamic threshold comparison with deduplication cooldowns and human-in-the-loop validation for RED events.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#25D366] flex items-center justify-center font-bold text-sm">
              04
            </div>
            <h3 className="font-bold text-slate-900 text-sm">WhatsApp Telemetry Bot</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Official Meta Cloud API webhook responding instantly to prefilled queries (STATUS, ROADS, REPORT).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
