import React, { useState, useEffect } from 'react';
import { CaregiverProfile, LogEntry, ProtocolPin, HandoverBriefingData } from '../types';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Droplets,
  CheckCircle2,
  ArrowRight,
  Pin,
} from 'lucide-react';

interface HandoverBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCaregiver: CaregiverProfile;
  clientName: string;
  logs: LogEntry[];
  protocols: ProtocolPin[];
  onStartShift: () => void;
}

export const HandoverBriefingModal: React.FC<HandoverBriefingModalProps> = ({
  isOpen,
  onClose,
  activeCaregiver,
  clientName,
  logs,
  protocols,
  onStartShift,
}) => {
  const [briefing, setBriefing] = useState<HandoverBriefingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBriefing();
    }
  }, [isOpen, activeCaregiver.id]);

  const fetchBriefing = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/handover-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverName: activeCaregiver.name,
          lastShiftTime: activeCaregiver.lastShiftEnd,
          logsSinceLastShift: logs.slice(0, 5),
          activeProtocols: protocols.filter((p) => p.status === 'active'),
          clientName,
        }),
      });

      const res = await response.json();
      if (res.success && res.data) {
        setBriefing(res.data);
      }
    } catch (err) {
      console.error('Failed to load handover briefing:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 30) {
      setHasScrolledToBottom(true);
    }
  };

  const handleConfirmStart = () => {
    onStartShift();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Intelligent Shift Handover Briefing</h2>
              <p className="text-xs text-slate-400">
                AI Handover personalized for {activeCaregiver.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl leading-none px-2"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content (Safety Gate: Caregiver must scroll to start) */}
        <div
          onScroll={handleScroll}
          className="p-6 overflow-y-auto space-y-5 flex-1"
        >
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-700 rounded-full animate-spin" />
              <p className="text-sm font-semibold text-slate-700">
                Compiling clinical intelligence since your last shift...
              </p>
            </div>
          ) : briefing ? (
            <>
              {/* Personalized Greeting Banner */}
              <div className="p-4 bg-teal-50/80 border border-teal-200 rounded-2xl">
                <h3 className="text-sm font-bold text-teal-950">
                  {briefing.welcomeGreeting}
                </h3>
                <p className="text-xs text-teal-800 mt-1">
                  Timeline context: <span className="font-semibold">{briefing.hoursSinceLastShift}</span>
                </p>
              </div>

              {/* High Priority Alerts */}
              {briefing.highPriorityAlerts && briefing.highPriorityAlerts.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Watchouts & High-Priority Changes</span>
                  </span>
                  <div className="space-y-2">
                    {briefing.highPriorityAlerts.map((alert, i) => (
                      <div
                        key={i}
                        className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 leading-relaxed font-medium"
                      >
                        • {alert}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Recap Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Hydration Recap */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                    <Droplets className="w-4 h-4 text-blue-600" />
                    <span>Hydration Pacing</span>
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {briefing.hydrationRecap}
                  </p>
                </div>

                {/* Bowel Elimination Status */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                    <Clock className="w-4 h-4 text-amber-700" />
                    <span>Bowel Timer Status</span>
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {briefing.bowelMovementStatus}
                  </p>
                </div>
              </div>

              {/* Pinned Protocols to Acknowledge */}
              {briefing.activeProtocolsToReview && briefing.activeProtocolsToReview.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Pin className="w-3.5 h-3.5 rotate-45 text-teal-600" />
                    <span>Head Nurse Orders in Effect</span>
                  </span>
                  <div className="space-y-2">
                    {briefing.activeProtocolsToReview.map((p, i) => (
                      <div
                        key={i}
                        className="p-3 bg-slate-900 text-white rounded-xl text-xs space-y-1"
                      >
                        <p className="font-bold text-teal-300">{p.title}</p>
                        <p className="text-slate-300 leading-relaxed">{p.instruction}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clinical Goals for Shift */}
              {briefing.clinicalShiftGoals && briefing.clinicalShiftGoals.length > 0 && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Action Checklist for This Shift
                  </span>
                  <ul className="space-y-1.5">
                    {briefing.clinicalShiftGoals.map((goal, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer with Safety Gate Button */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500">
            {activeCaregiver.isShiftActive ? (
              <span className="text-emerald-700 font-semibold">Shift already active</span>
            ) : hasScrolledToBottom ? (
              <span className="text-emerald-700 font-semibold">
                ✓ Briefing reviewed. Ready to begin shift.
              </span>
            ) : (
              <span>Scroll through clinical handover to confirm comprehension.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
            >
              Close
            </button>
            <button
              onClick={handleConfirmStart}
              className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95"
            >
              <span>{activeCaregiver.isShiftActive ? 'Re-confirm Shift' : 'Acknowledge & Start Shift'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-teal-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
