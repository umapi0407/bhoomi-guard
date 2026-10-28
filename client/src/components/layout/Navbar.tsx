import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Map,
  AlertTriangle,
  Truck,
  MessageSquare,
  PlusCircle,
  Menu,
  X,
  Home,
  PhoneCall,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Info,
  Radio,
} from 'lucide-react';
import logoBg from '../../assets/logo-bg.png';

export const Navbar: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [drawerOpen]);

  // Primary top-level navigation links
  const mainNav = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'GIS Risk Map', path: '/map', icon: Map },
    { name: 'Alerts', path: '/alerts', icon: AlertTriangle, badge: '2 Active' },
    { name: 'Roads & Hazards', path: '/incidents', icon: Truck },
  ];

  // Secondary drawer links
  const drawerSections = [
    {
      title: 'Operational GIS & Monitoring',
      items: [
        { name: 'Home Overview', path: '/', icon: Home, desc: 'Live system stats & hazard radar' },
        { name: 'GIS Risk Heatmap', path: '/map', icon: Map, desc: 'Interactive Leaflet 7-state map' },
        { name: 'Active Alerts Bulletin', path: '/alerts', icon: AlertTriangle, desc: 'Early warning alerts & officer sign-offs', badge: '2 Active' },
        { name: 'Mountain Highway Status', path: '/incidents', icon: Truck, desc: 'NH-10, NH-54, NH-37 connectivity' },
      ],
    },
    {
      title: 'Disaster Communication & Reporting',
      items: [
        {
          name: 'WhatsApp Bot & CRM',
          path: '/whatsapp',
          icon: MessageSquare,
          desc: 'Instant pre-filled queries (STATUS, ROADS, REPORT)',
          highlight: true,
        },
        {
          name: 'Report Hazard (Citizen PWA)',
          path: '/report',
          icon: PlusCircle,
          desc: 'Submit field landslide or road obstruction report',
        },
      ],
    },
    {
      title: 'District Control & Administration',
      items: [
        {
          name: 'Admin Command Console',
          path: '/admin',
          icon: ShieldAlert,
          desc: 'Verify citizen reports, approve red alerts & broadcast live',
          highlight: true,
        },
      ],
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0B1E17]/95 backdrop-blur-md border-b border-emerald-900/50 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-2.5">
            
            {/* Logo and Brand Title */}
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <div className="h-11 w-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:border-emerald-500/50 transition-all p-1">
                <img
                  src={logoBg || '/logo-bg.png'}
                  alt="BhoomiGuard Logo"
                  className="h-full w-full object-contain filter drop-shadow-[0_2px_8px_rgba(37,211,102,0.3)]"
                  onError={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-white">
                    Bhoomi<span className="text-[#25D366]">Guard</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.2 rounded-full font-bold">
                    NER AI
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Landslide Early Warning Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links (Clean Floating Pill Style) */}
            <nav className="hidden md:flex items-center gap-1 bg-white/[0.04] border border-white/10 p-1 rounded-xl">
              {mainNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      active
                        ? 'bg-[#2E7D5B] text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="text-[9px] bg-[#E8833A] text-white px-1.5 py-0.2 rounded-full font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Header Utilities */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Telemetry Status Dot */}
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
                <span>Telemetry: Live</span>
              </div>

              {/* Direct WhatsApp Quick Launch */}
              <Link
                to="/whatsapp"
                className="bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md hover:shadow-emerald-500/20 transition-all shrink-0"
              >
                <MessageSquare className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">WhatsApp Alerts</span>
                <span className="sm:hidden">WhatsApp</span>
              </Link>

              {/* Slide-over Menu Button (Clean Drawer Toggle) */}
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 hover:text-white transition-all text-xs font-semibold"
                aria-label="Open complete menu drawer"
              >
                <Menu className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Menu</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Slide-Over Command Drawer & Dimmed Backdrop */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
          {/* Dimmed Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#0B1E17] border-l border-emerald-900/60 text-white shadow-2xl flex flex-col">
              
              {/* Drawer Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/30">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-[#2E7D5B]/30 rounded-lg text-emerald-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">BhoomiGuard Command Center</h3>
                    <p className="text-[11px] text-slate-400">All Modules & Emergency Resources</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body Links */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {drawerSections.map((sec, idx) => (
                  <div key={idx} className="space-y-2.5">
                    <h4 className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                      {sec.title}
                    </h4>

                    <div className="space-y-1.5">
                      {sec.items.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                              active
                                ? 'bg-[#2E7D5B] text-white shadow-sm'
                                : 'bg-white/[0.03] hover:bg-white/10 text-slate-200 border border-white/5'
                            }`}
                          >
                            <div className="p-2 rounded-lg bg-black/30 text-emerald-400 mt-0.5">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span>{item.name}</span>
                                {'highlight' in item && item.highlight && (
                                  <span className="text-[9px] bg-[#25D366]/20 text-[#25D366] px-2 py-0.5 rounded font-mono font-bold">
                                    INSTANT BOT
                                  </span>
                                )}
                                {'badge' in item && item.badge && (
                                  <span className="text-[9px] bg-[#E8833A] text-white px-2 py-0.5 rounded-full font-bold">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500 self-center" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Emergency Helplines Direct Card */}
                <div className="bg-red-950/30 border border-red-500/30 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                      <PhoneCall className="w-3.5 h-3.5 text-red-400" />
                      <span>Northeast India SDMA Helplines</span>
                    </span>
                    <span className="text-[10px] bg-red-600 text-white font-mono font-extrabold px-2 py-0.5 rounded-full">
                      24x7 ACTIVE
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                    <div className="p-2 rounded-lg bg-black/40 border border-red-500/10">
                      <span className="text-slate-400 block text-[10px]">National Helpline</span>
                      <strong className="text-red-400 text-sm font-mono">112</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-black/40 border border-red-500/10">
                      <span className="text-slate-400 block text-[10px]">Sikkim SDMA</span>
                      <strong className="text-slate-200 font-mono">03592-202416</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-black/40 border border-red-500/10">
                      <span className="text-slate-400 block text-[10px]">Meghalaya SDMA</span>
                      <strong className="text-slate-200 font-mono">0364-2224150</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-black/40 border border-red-500/10">
                      <span className="text-slate-400 block text-[10px]">Assam ASDMA</span>
                      <strong className="text-slate-200 font-mono">1079 / 1070</strong>
                    </div>
                  </div>
                </div>

                {/* Software Ingestion Notice */}
                <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-[11px] text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <Info className="w-3.5 h-3.5" />
                    <span>Pure Software Intelligence</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    BhoomiGuard requires zero physical sensor hardware. It continuously ingests Open-Meteo precipitation, NASA satellite observations, and SRTM terrain elevation models.
                  </p>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-white/10 bg-black/30 flex items-center justify-between text-[11px] text-slate-400">
                <span>BhoomiGuard v1.0 &bull; SIH Edition</span>
                <span className="text-emerald-400 font-mono">NER High-Risk Grid</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
