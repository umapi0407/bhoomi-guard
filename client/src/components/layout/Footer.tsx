import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall, ShieldCheck, ExternalLink, HeartHandshake } from 'lucide-react';
import logoImg from '../../assets/logo.png';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#10281F] text-slate-300 border-t border-[#1F4D3C] pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Column with logo.png */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={logoImg || '/logo.png'}
                alt="BhoomiGuard Logo"
                className="h-16 w-auto object-contain filter drop-shadow-md rounded-lg"
              />
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">BhoomiGuard</h3>
                <p className="text-xs text-[#2E7D5B] font-semibold">Smarter Monitoring. Safer Tomorrow.</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              An AI-powered software-only disaster risk monitoring platform designed for Northeast India (NER).
              Ingesting real-time rainfall, slope terrain models, and field observations to safeguard vulnerable mountain communities.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Smart India Hackathon Innovation</span>
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-b border-emerald-900/60 pb-2">
              Platform Modules
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/map" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <ExternalLink className="w-3 h-3 text-emerald-500" />
                  <span>GIS Heatmap & Monitoring</span>
                </Link>
              </li>
              <li>
                <Link to="/alerts" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <ExternalLink className="w-3 h-3 text-emerald-500" />
                  <span>Early Warning Bulletins</span>
                </Link>
              </li>
              <li>
                <Link to="/incidents" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <ExternalLink className="w-3 h-3 text-emerald-500" />
                  <span>National Highway Road Status</span>
                </Link>
              </li>
              <li>
                <Link to="/whatsapp" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <ExternalLink className="w-3 h-3 text-emerald-500" />
                  <span>WhatsApp CRM & Instant Bot</span>
                </Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <ExternalLink className="w-3 h-3 text-emerald-500" />
                  <span>Citizen Hazard Reporting (PWA)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Regional NER Disaster Helplines */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-b border-emerald-900/60 pb-2">
              NER Emergency Helplines
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="font-medium text-slate-200">Sikkim SDMA (Gangtok)</span>
                <span className="text-emerald-400 font-mono">03592-202416</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="font-medium text-slate-200">Meghalaya SDMA (Shillong)</span>
                <span className="text-emerald-400 font-mono">0364-2224150</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="font-medium text-slate-200">Assam ASDMA (Guwahati)</span>
                <span className="text-emerald-400 font-mono">1079 / 1070</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="font-medium text-slate-200">Mizoram DM&R (Aizawl)</span>
                <span className="text-emerald-400 font-mono">0389-2322238</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="font-medium text-slate-200">National Emergency Support</span>
                <span className="text-red-400 font-bold font-mono">112</span>
              </div>
            </div>
          </div>

          {/* Legal / Data Transparency */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-b border-emerald-900/60 pb-2">
              Risk Disclosure Notice
            </h4>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 leading-relaxed">
              <p className="mb-2 font-medium text-amber-300 flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4" />
                <span>Transparent Environmental Modeling</span>
              </p>
              BhoomiGuard provides software-based environmental risk assessments using meteorological and terrain data.
              It does not claim to guarantee exact predictions of the precise moment or coordinate of a landslide.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#1F4D3C] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} BhoomiGuard Platform. Built with MERN Stack for Northeast India.</p>
          <div className="flex items-center gap-6">
            <span className="text-emerald-400 font-medium">Software-Only IoT-Free Architecture</span>
            <span>Open-Meteo & SRTM Integrated</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
