import React, { useState } from 'react';
import { LogEntry } from '../types';
import {
  AlertTriangle,
  Droplets,
  Clock,
  CheckCircle2,
  Volume2,
  WifiOff,
  Filter,
  Check,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface CareDiaryFeedProps {
  logs: LogEntry[];
  onOpenVoiceModal: () => void;
  onOpenIncidentModal: () => void;
}

export const CareDiaryFeed: React.FC<CareDiaryFeedProps> = ({
  logs,
  onOpenVoiceModal,
  onOpenIncidentModal,
}) => {
  const [filter, setFilter] = useState<'all' | 'incident' | 'water' | 'bm' | 'routine'>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Sorting: Incidents MUST be moved to the top of everyone's feed!
  const sortedLogs = [...logs].sort((a, b) => {
    // If one is an incident and the other is not, incident comes first
    const aIsIncident = a.category === 'incident' || !!a.incident;
    const bIsIncident = b.category === 'incident' || !!b.incident;

    if (aIsIncident && !bIsIncident) return -1;
    if (!aIsIncident && bIsIncident) return 1;

    // Otherwise sort by timestamp descending
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const filteredLogs = sortedLogs.filter((log) => {
    if (filter === 'all') return true;
    if (filter === 'incident') return log.category === 'incident' || !!log.incident;
    if (filter === 'water') return log.metrics?.waterIntakeMl && log.metrics.waterIntakeMl > 0;
    if (filter === 'bm') return log.metrics?.bmOccurred;
    if (filter === 'routine') return log.routineTasks && log.routineTasks.length > 0;
    return true;
  });

  const incidentCount = logs.filter((l) => l.category === 'incident' || !!l.incident).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Clinical Shift Diary
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              ({filteredLogs.length} Entries)
            </span>
            {incidentCount > 0 && (
              <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-red-600" />
                <span>{incidentCount} Incident Pin{incidentCount > 1 ? 's' : ''}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Replaces paper binder. Fluff-free entries with strict safety gate confirmations.
          </p>
        </div>

        {/* Quick Dictate & Red Flag buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenVoiceModal}
            className="px-3 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Voice-to-Sort</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs (Interactive Segmented Control) */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            filter === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Entries
        </button>

        <button
          onClick={() => setFilter('incident')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
            filter === 'incident'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-red-700 hover:bg-red-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Red Flags ({incidentCount})</span>
        </button>

        <button
          onClick={() => setFilter('water')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
            filter === 'water'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Droplets className="w-3.5 h-3.5" />
          <span>Fluids</span>
        </button>

        <button
          onClick={() => setFilter('bm')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
            filter === 'bm'
              ? 'bg-white text-amber-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Bowel Movements</span>
        </button>

        <button
          onClick={() => setFilter('routine')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
            filter === 'routine'
              ? 'bg-white text-teal-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Routine Tasks</span>
        </button>
      </div>

      {/* Entries List */}
      <div className="space-y-3">
        {filteredLogs.map((log) => {
          const isIncident = log.category === 'incident' || !!log.incident;
          const isExpanded = expandedLogId === log.id;

          return (
            <div
              key={log.id}
              className={`rounded-2xl border transition-all ${
                isIncident
                  ? 'bg-red-50/70 border-red-300 ring-2 ring-red-100 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              } p-4`}
            >
              {/* Item Header */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {isIncident && (
                    <span className="text-[10px] font-bold text-white bg-red-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>URGENT INCIDENT PINNED</span>
                    </span>
                  )}
                  <span className="text-xs font-bold text-slate-900">
                    {log.caregiverName}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    ·{' '}
                    {new Date(log.timestamp).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  {log.syncStatus === 'pending_sync' && (
                    <span className="text-[10px] font-mono text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded flex items-center gap-1">
                      <WifiOff className="w-2.5 h-2.5" />
                      <span>Cached Offline</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="hidden sm:inline">Caregiver Verified</span>
                  </span>
                </div>
              </div>

              {/* Main Clinical Content */}
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {log.content}
              </p>

              {/* Clinical Metrics Snapshot Pills (No pills on metadata, clean inline metrics) */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                {log.metrics?.waterIntakeMl !== undefined && log.metrics.waterIntakeMl > 0 && (
                  <span className="flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-mono font-bold text-slate-900">
                      {log.metrics.waterIntakeMl}ml
                    </span>
                    {log.metrics.isAfter630PM && (
                      <span className="text-[10px] text-amber-800 font-semibold bg-amber-100 px-1 rounded ml-1">
                        Post-6:30
                      </span>
                    )}
                  </span>
                )}

                {log.metrics?.bmOccurred && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span className="font-bold text-amber-900">Bowel Movement Documented</span>
                  </span>
                )}

                {log.routineTasks && log.routineTasks.length > 0 && (
                  <span className="flex items-center gap-1 text-slate-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>
                      {log.routineTasks.filter((t) => t.completed).length} routine tasks completed
                    </span>
                  </span>
                )}

                {log.narrative?.mood && (
                  <span className="text-slate-500">
                    Mood: <strong className="text-slate-700">{log.narrative.mood}</strong>
                  </span>
                )}
              </div>

              {/* Expandable Audit Details */}
              {log.rawTranscript && (
                <div className="mt-2.5">
                  <button
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isExpanded ? 'Hide Raw Voice Transcript' : 'Audit Raw Transcript'}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                      <div>
                        <span className="font-bold text-slate-700 block mb-0.5 text-[11px] uppercase tracking-wider">
                          Preserved Original Voice Dictation:
                        </span>
                        <p className="italic text-slate-600 leading-relaxed">
                          "{log.rawTranscript}"
                        </p>
                      </div>

                      {log.routineTasks && (
                        <div>
                          <span className="font-bold text-slate-700 block mb-1 text-[11px] uppercase tracking-wider">
                            Verified Care Tasks:
                          </span>
                          <div className="grid grid-cols-2 gap-1">
                            {log.routineTasks.map((t, idx) => (
                              <div
                                key={idx}
                                className={`p-1.5 rounded text-[11px] flex items-center gap-1.5 ${
                                  t.completed ? 'bg-emerald-50 text-emerald-900 font-medium' : 'text-slate-500 line-through'
                                }`}
                              >
                                <span>{t.completed ? '✓' : '—'}</span>
                                <span>{t.task}: {t.notes}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
