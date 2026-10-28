import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Phone,
  QrCode,
  Copy,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Check,
} from 'lucide-react';
import { api, generateWhatsAppLink } from '../../services/api';
import { WhatsAppActionCard } from '../../components/whatsapp/WhatsAppActionCard';

export const WhatsAppCRMPage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('917567556390');
  const [targetLocation, setTargetLocation] = useState('GANGTOK');
  const [customCommand, setCustomCommand] = useState('STATUS');
  const [copied, setCopied] = useState(false);

  // Chat simulator state
  const [messages, setMessages] = useState<
    Array<{ id: string; sender: 'user' | 'bot'; text: string; time: string }>
  >([
    {
      id: '1',
      sender: 'user',
      text: 'STATUS GANGTOK',
      time: '10:15 AM',
    },
    {
      id: '2',
      sender: 'bot',
      text:
        `🛡️ *BHOOMIGUARD EARLY WARNING REPORT*\n` +
        `-----------------------------------------\n` +
        `📍 *Location:* Gangtok & East Sikkim (Sikkim)\n` +
        `🟠 *Current Risk Level:* *ORANGE* (Score: 78/100)\n` +
        `🌧️ *24h Rainfall:* 98 mm (Critical Threshold: 75 mm)\n` +
        `⛰️ *Slope Susceptibility:* 34.2° average gradient\n` +
        `🚧 *Reported Hazards Nearby:* 1 active blockage on NH-10 (29th Mile)\n` +
        `-----------------------------------------\n` +
        `📋 *Safety Advisories:*\n` +
        `• Restrict night travel on NH-10 corridor\n` +
        `• Keep earth-moving machines on standby\n` +
        `\n📞 *Emergency Helpline:* 03592-202416\n` +
        `🔗 *Live GIS Map:* http://localhost:5173/map?zone=SK-GTK`,
      time: '10:15 AM',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const prefilledText = `${customCommand} ${targetLocation}`;
  const waUrl = generateWhatsAppLink(phoneNumber, prefilledText);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(waUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendSimulator = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSending) return;

    const userMsgId = `u-${Date.now()}`;
    const userMsg = {
      id: userMsgId,
      sender: 'user' as const,
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const response = await api.post('/whatsapp/simulate', {
        phone: phoneNumber,
        text: text,
      });

      const replyText = response.data?.replyText || 'Service online.';
      const botMsg = {
        id: `b-${Date.now()}`,
        sender: 'bot' as const,
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      // Offline fallback mock bot
      setTimeout(() => {
        let reply = '';
        const upper = text.toUpperCase();
        if (upper.includes('SHILLONG')) {
          reply =
            `🛡️ *BHOOMIGUARD REPORT*\n📍 *Location:* Shillong Plateau\n🟡 *Risk Level:* YELLOW (52/100)\n🌧️ *24h Rain:* 62 mm\n🚧 *Roads:* Dawki road clear.\n📞 *Helpline:* 0364-2224150`;
        } else if (upper.includes('ROADS')) {
          reply =
            `🚧 *BHOOMIGUARD ROAD CONNECTIVITY*\n• NH-10: Single-lane caution near 29th Mile\n• NH-54: Slow transit at Hunthar bypass\n• NH-37: 1 lane cleared at Jiribam`;
        } else {
          reply =
            `🛡️ *BHOOMIGUARD REPORT*\n📍 *Location:* ${text}\n🟠 *Risk Level:* ORANGE (74/100)\n🌧️ *Rainfall:* 88 mm\n• Advisory: Night mountain driving discouraged.\n📞 *Helpline:* 112`;
        }
        setMessages((prev) => [
          ...prev,
          {
            id: `b-${Date.now()}`,
            sender: 'bot',
            text: reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }, 500);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#2E7D5B] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Multi-Channel Telemetry</span>
          </div>
          <h1 className="text-2xl font-bold text-[#10281F] flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#25D366]" />
            <span>WhatsApp Early Warning & Automated Data Bot</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Send a pre-filled query (e.g. <code>STATUS GANGTOK</code>) to receive instant landslide risk scores, 24h rainfall, and road connectivity telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official Cloud API & Mock Mode Ready</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Generator vs Live WhatsApp Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Reusable WhatsApp Action Card */}
        <div className="lg:col-span-5 space-y-6">
          <WhatsAppActionCard />

          {/* Scannable Poster Notice */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#2E7D5B] text-white rounded-xl">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Field Poster QR Code Ready</h4>
                <p className="text-[11px] text-slate-600">Printable QR for mountain highway transit stops</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Drivers scanning the QR code immediately have <code>STATUS &lt;LOCATION&gt;</code> filled in their WhatsApp chat, returning road blockages and rain warnings within 2 seconds.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive WhatsApp Bot Simulator */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[640px]">
            {/* WhatsApp Chat Header */}
            <div className="bg-[#10281F] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#1F4D3C]">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[#2E7D5B] flex items-center justify-center text-white font-bold">
                    🛡️
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] border-2 border-[#10281F] rounded-full"></span>
                </div>
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-1.5">
                    <span>BhoomiGuard Early Warning Bot</span>
                    <span className="text-[10px] bg-[#2E7D5B]/40 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                      VERIFIED
                    </span>
                  </h4>
                  <p className="text-[11px] text-emerald-400">Online &bull; Automated Disaster Telemetry</p>
                </div>
              </div>

              <button
                onClick={() => handleSendSimulator(prefilledText)}
                className="text-xs bg-[#2E7D5B] hover:bg-[#25684b] text-white px-3 py-1.5 rounded-lg flex items-center gap-1 font-medium transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Send &quot;{prefilledText}&quot;</span>
              </button>
            </div>

            {/* Quick Command Chips */}
            <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto text-[11px]">
              <span className="text-slate-500 font-semibold whitespace-nowrap">Fast Prompts:</span>
              <button
                onClick={() => handleSendSimulator('STATUS GANGTOK')}
                className="bg-white border border-slate-300 hover:border-emerald-500 px-2.5 py-1 rounded-full text-slate-800 font-medium whitespace-nowrap transition-all"
              >
                STATUS GANGTOK
              </button>
              <button
                onClick={() => handleSendSimulator('STATUS SHILLONG')}
                className="bg-white border border-slate-300 hover:border-emerald-500 px-2.5 py-1 rounded-full text-slate-800 font-medium whitespace-nowrap transition-all"
              >
                STATUS SHILLONG
              </button>
              <button
                onClick={() => handleSendSimulator('ROADS')}
                className="bg-white border border-slate-300 hover:border-emerald-500 px-2.5 py-1 rounded-full text-slate-800 font-medium whitespace-nowrap transition-all"
              >
                ROADS
              </button>
              <button
                onClick={() => handleSendSimulator('ALERTS')}
                className="bg-white border border-slate-300 hover:border-emerald-500 px-2.5 py-1 rounded-full text-slate-800 font-medium whitespace-nowrap transition-all"
              >
                ALERTS
              </button>
              <button
                onClick={() => handleSendSimulator('HELP')}
                className="bg-white border border-slate-300 hover:border-emerald-500 px-2.5 py-1 rounded-full text-slate-800 font-medium whitespace-nowrap transition-all"
              >
                HELP
              </button>
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#EAF2EE]/60">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs shadow-sm ${msg.sender === 'user'
                        ? 'bg-[#DCF8C6] text-slate-900 rounded-tr-none'
                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                      }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed font-sans">{msg.text}</div>
                    <div className="text-[10px] text-slate-400 text-right mt-1.5 font-mono">{msg.time}</div>
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl text-xs text-slate-500 rounded-tl-none border border-slate-200 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                    <span>BhoomiGuard Bot querying Open-Meteo & risk matrix...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Simulator Input Box */}
            <div className="p-3 bg-white border-t border-slate-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendSimulator();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type STATUS <LOCATION> (e.g. STATUS AIZAWL) or ROADS..."
                  className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2E7D5B]"
                />
                <button
                  type="submit"
                  disabled={isSending || !inputMessage.trim()}
                  className="bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 p-2.5 rounded-xl font-bold shadow-md transition-all disabled:opacity-50"
                  aria-label="Send message in simulator"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
