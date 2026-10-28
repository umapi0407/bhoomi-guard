import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Marker } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  AlertTriangle,
  CloudRain,
  Mountain,
  PhoneCall,
  MessageSquare,
  ShieldAlert,
  Layers,
  Info,
} from 'lucide-react';
import { generateWhatsAppLink } from '../../services/api';

// Monitoring zones data
const ZONES_DATA = [
  {
    code: 'SK-GTK',
    name: 'Gangtok & East Sikkim',
    state: 'Sikkim',
    lat: 27.3389,
    lng: 88.6065,
    riskLevel: 'ORANGE',
    riskScore: 78,
    rainfall24h: 98,
    critThreshold: 75,
    slope: 34.2,
    geology: 'Schist & Gneiss Fragile Slopes',
    roadStatus: 'NH-10 single-lane caution near 29th Mile',
    emergencyPhone: '03592-202416',
    recommendations: 'Restrict heavy goods vehicles at night; monitor Teesta basin seepage.',
  },
  {
    code: 'ML-SHL',
    name: 'Shillong Plateau & Sohra Highway',
    state: 'Meghalaya',
    lat: 25.5788,
    lng: 91.8933,
    riskLevel: 'YELLOW',
    riskScore: 52,
    rainfall24h: 62,
    critThreshold: 90,
    slope: 28.5,
    geology: 'Precambrian Quartzite Bedrock',
    roadStatus: 'Shillong-Dawki Road Operational',
    emergencyPhone: '0364-2224150',
    recommendations: 'Continuous drizzle observed. Visibility caution on highland turns.',
  },
  {
    code: 'AS-GHY',
    name: 'Guwahati Hills & Kamrup',
    state: 'Assam',
    lat: 26.1445,
    lng: 91.7362,
    riskLevel: 'GREEN',
    riskScore: 28,
    rainfall24h: 18,
    critThreshold: 65,
    slope: 22.0,
    geology: 'Alluvial & Weathered Granitic Hills',
    roadStatus: 'GS Road & Jalukbari Transit Normal',
    emergencyPhone: '1079',
    recommendations: 'Normal conditions. Routine automated telemetry active.',
  },
  {
    code: 'MZ-AZL',
    name: 'Aizawl Ridge & NH-54',
    state: 'Mizoram',
    lat: 23.7271,
    lng: 92.7176,
    riskLevel: 'RED',
    riskScore: 92,
    rainfall24h: 104,
    critThreshold: 60,
    slope: 38.0,
    geology: 'Surma Group Soft Sandstone & Shale',
    roadStatus: 'Hunthar Bypass Blockage Observed',
    emergencyPhone: '0389-2322238',
    recommendations: 'Critical saturation! Evacuate vulnerable retaining structures immediately.',
  },
  {
    code: 'NL-KOH',
    name: 'Kohima - Zubza Corridor',
    state: 'Nagaland',
    lat: 25.6751,
    lng: 94.1086,
    riskLevel: 'ORANGE',
    riskScore: 71,
    rainfall24h: 82,
    critThreshold: 70,
    slope: 32.5,
    geology: 'Disang Shales Highly Susceptible',
    roadStatus: 'Zubza fault slow transit',
    emergencyPhone: '0370-2290480',
    recommendations: 'Keep earthmovers on standby. Restrict tourist bus transit.',
  },
  {
    code: 'MN-IMP',
    name: 'Imphal West & NH-37',
    state: 'Manipur',
    lat: 24.8170,
    lng: 93.9368,
    riskLevel: 'YELLOW',
    riskScore: 48,
    rainfall24h: 54,
    critThreshold: 70,
    slope: 29.8,
    geology: 'Tertiary Sedimentary Hills',
    roadStatus: 'NH-37 Jiribam Highway cleared to 1 lane',
    emergencyPhone: '0385-2458110',
    recommendations: 'Field officers monitoring mud accumulation at drainage culverts.',
  },
  {
    code: 'AR-ITN',
    name: 'Itanagar Capital Complex',
    state: 'Arunachal Pradesh',
    lat: 27.0844,
    lng: 93.6053,
    riskLevel: 'ORANGE',
    riskScore: 74,
    rainfall24h: 89,
    critThreshold: 80,
    slope: 35.5,
    geology: 'Siwalik Foothills Siltstone',
    roadStatus: 'Banderdewa route operational with slow moving traffic',
    emergencyPhone: '0360-2212395',
    recommendations: 'Hill cutting sites closed. Patrol deployed along riverbanks.',
  },
];

const ROAD_HAZARDS = [
  {
    id: 'RH-1',
    name: 'NH-10 (29th Mile, Sikkim)',
    lat: 27.215,
    lng: 88.512,
    issue: 'Debris flow from upper hill cut',
    status: 'Partially Blocked',
  },
  {
    id: 'RH-2',
    name: 'NH-54 (Hunthar Bypass, Mizoram)',
    lat: 23.745,
    lng: 92.71,
    issue: 'Subsidence along outer verge',
    status: 'Diverted',
  },
];

const getRiskColor = (level: string) => {
  switch (level) {
    case 'RED':
      return '#C8442F';
    case 'ORANGE':
      return '#E8833A';
    case 'YELLOW':
      return '#F2B84B';
    default:
      return '#2E7D5B';
  }
};

export const RiskMapPage: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState<(typeof ZONES_DATA)[0]>(ZONES_DATA[0]);
  const [showRoadHazards, setShowRoadHazards] = useState(true);

  const demoPhoneNumber = '917567556390';
  const prefilledWhatsApp = `STATUS ${selectedZone.code.split('-')[1] || selectedZone.name.split(' ')[0]}`;
  const whatsAppLink = generateWhatsAppLink(demoPhoneNumber, prefilledWhatsApp);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#10281F] flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#2E7D5B]" />
            <span>GIS Landslide Risk & Hazard Map</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Spatial monitoring across 7 Northeast Indian States. Ingesting Open-Meteo precipitation and SRTM terrain slope angle.
          </p>
        </div>

        {/* Legend Pills & Toggles */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <input
              type="checkbox"
              checked={showRoadHazards}
              onChange={(e) => setShowRoadHazards(e.target.checked)}
              className="accent-[#2E7D5B] rounded"
            />
            <span>Show Road Blockages</span>
          </label>

          <div className="flex items-center gap-2 text-xs font-semibold bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#2E7D5B] text-white">Safe</span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F2B84B] text-slate-900">Advisory</span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E8833A] text-white">High</span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#C8442F] text-white">Critical</span>
          </div>
        </div>
      </div>

      {/* Main Grid: GIS Map + Telemetry Inspection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Leaflet Interactive Map Container */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-2 overflow-hidden h-[620px] relative">
          <MapContainer
            center={[25.8, 92.5]}
            zoom={7}
            scrollWheelZoom={true}
            className="rounded-xl w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Render Monitored Zones */}
            {ZONES_DATA.map((zone) => {
              const color = getRiskColor(zone.riskLevel);
              const isSelected = selectedZone.code === zone.code;
              return (
                <CircleMarker
                  key={zone.code}
                  center={[zone.lat, zone.lng]}
                  radius={isSelected ? 26 : 20}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: isSelected ? 0.75 : 0.5,
                    weight: isSelected ? 3 : 2,
                  }}
                  eventHandlers={{
                    click: () => setSelectedZone(zone),
                  }}
                >
                  <Popup>
                    <div className="text-xs space-y-1 font-sans">
                      <strong className="text-sm font-bold block">{zone.name}</strong>
                      <span className="inline-block px-2 py-0.5 rounded font-bold text-white text-[10px]" style={{ backgroundColor: color }}>
                        {zone.riskLevel} RISK ({zone.riskScore}/100)
                      </span>
                      <p className="text-slate-600">24h Rain: <strong>{zone.rainfall24h} mm</strong></p>
                      <p className="text-slate-600">Slope: <strong>{zone.slope}°</strong></p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

            {/* Render Road Hazard Markers */}
            {showRoadHazards &&
              ROAD_HAZARDS.map((hazard) => (
                <CircleMarker
                  key={hazard.id}
                  center={[hazard.lat, hazard.lng]}
                  radius={10}
                  pathOptions={{
                    color: '#000000',
                    fillColor: '#E8833A',
                    fillOpacity: 0.9,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="text-xs space-y-1">
                      <strong className="text-red-700 block">{hazard.name}</strong>
                      <p className="text-slate-700">{hazard.issue}</p>
                      <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-bold">
                        {hazard.status}
                      </span>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
          </MapContainer>

          <div className="absolute bottom-6 left-6 z-[400] bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-slate-200 shadow-md text-xs text-slate-600">
            <span className="font-bold text-slate-800 block mb-1">Click any circle to inspect telemetry</span>
            <span>Currently selected: <strong className="text-[#2E7D5B]">{selectedZone.name}</strong></span>
          </div>
        </div>

        {/* Selected Zone Deep Telemetry Inspection Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            {/* Zone Title & Badge */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  {selectedZone.code} &bull; {selectedZone.state}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{selectedZone.name}</h3>
              </div>
              <div
                className="px-3 py-1 rounded-xl text-white font-bold text-xs shadow-sm"
                style={{ backgroundColor: getRiskColor(selectedZone.riskLevel) }}
              >
                {selectedZone.riskLevel} ({selectedZone.riskScore}%)
              </div>
            </div>

            {/* Rainfall vs Threshold Gauge */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <CloudRain className="w-4 h-4 text-blue-500" />
                  <span>24h Rainfall Saturation</span>
                </span>
                <span className="font-bold text-slate-900">
                  {selectedZone.rainfall24h} mm <span className="text-slate-400 font-normal">/ {selectedZone.critThreshold} mm limit</span>
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (selectedZone.rainfall24h / selectedZone.critThreshold) * 100)}%`,
                    backgroundColor: getRiskColor(selectedZone.riskLevel),
                  }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Critical regional trigger threshold: <strong>{selectedZone.critThreshold} mm</strong>.
              </p>
            </div>

            {/* Terrain & Geology Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <Mountain className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Average Gradient</span>
                </span>
                <p className="text-base font-bold text-slate-900 mt-1">{selectedZone.slope}°</p>
                <span className="text-[10px] text-amber-700">High gravitational shear</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                  <span>Highway Status</span>
                </span>
                <p className="text-xs font-bold text-slate-800 mt-1 truncate">{selectedZone.roadStatus}</p>
                <span className="text-[10px] text-slate-500">Monitored segment</span>
              </div>
            </div>

            {/* Geology & Formation */}
            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-slate-700 space-y-1">
              <span className="font-semibold text-emerald-900 block">Geological Susceptibility:</span>
              <p className="text-slate-600 leading-relaxed">{selectedZone.geology}</p>
            </div>

            {/* Advisories & Recommendations */}
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
              <span className="font-semibold flex items-center gap-1.5 text-amber-900">
                <Info className="w-4 h-4 text-amber-600" />
                <span>Actionable Advisory:</span>
              </span>
              <p className="leading-relaxed">{selectedZone.recommendations}</p>
            </div>

            {/* Direct WhatsApp Pre-filled Query Link */}
            <div className="pt-2 space-y-2">
              <a
                href={whatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-bold py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Send &quot;{prefilledWhatsApp}&quot; via WhatsApp</span>
              </a>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>District Helpline:</span>
                <a href={`tel:${selectedZone.emergencyPhone}`} className="text-[#2E7D5B] font-bold flex items-center gap-1 hover:underline">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{selectedZone.emergencyPhone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
