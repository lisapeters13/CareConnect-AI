import React, { useState, useEffect } from 'react';
import {
  ResidentProfile,
  CaregiverProfile,
  ProtocolPin,
  LogEntry,
  ManagerReportData,
} from '../types';
import {
  Shield,
  FileText,
  Sliders,
  Users,
  Sparkles,
  AlertTriangle,
  Droplets,
  Clock,
  CheckCircle2,
  Lock,
  Unlock,
  Volume2,
  RefreshCw,
  Search,
} from 'lucide-react';

interface HeadNurseDashboardProps {
  resident: ResidentProfile;
  onUpdateWaterGoal: (newGoal: number) => void;
  protocols: ProtocolPin[];
  onAddProtocol: (title: string, content: string, priority: 'routine' | 'high' | 'urgent') => void;
  onArchiveProtocol: (id: string) => void;
  caregivers: CaregiverProfile[];
  onToggleCaregiverStatus: (id: string) => void;
  logs: LogEntry[];
  totalWaterLoggedToday: number;
  lastBmHours: number;
}

export const HeadNurseDashboard: React.FC<HeadNurseDashboardProps> = ({
  resident,
  onUpdateWaterGoal,
  protocols,
  onAddProtocol,
  onArchiveProtocol,
  caregivers,
  onToggleCaregiverStatus,
  logs,
  totalWaterLoggedToday,
  lastBmHours,
}) => {
  const [activeTab, setActiveTab] = useState<'manager_report' | 'protocols' | 'audit_trail' | 'team_access'>('manager_report');
  const [report, setReport] = useState<ManagerReportData | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [selectedAuditLog, setSelectedAuditLog] = useState<LogEntry | null>(null);
  const [auditSearch, setAuditSearch] = useState('');

  // Hydration goal edit state
  const [waterGoalInput, setWaterGoalInput] = useState(resident.waterGoalMl.toString());

  // Protocol creation form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newPriority, setNewPriority] = useState<'routine' | 'high' | 'urgent'>('high');

  useEffect(() => {
    generateManagerReport();
  }, []);

  const generateManagerReport = async () => {
    setIsGeneratingReport(true);
    try {
      const response = await fetch('/api/ai/manager-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: resident.name,
          logs: logs.slice(0, 8),
          protocols: protocols.filter((p) => p.status === 'active'),
          currentWaterMl: totalWaterLoggedToday,
          waterGoal: resident.waterGoalMl,
          lastBmHours,
        }),
      });

      const res = await response.json();
      if (res.success && res.data) {
        setReport(res.data);
      }
    } catch (err) {
      console.error('Failed to generate AI manager report:', err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleSaveWaterGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(waterGoalInput, 10);
    if (!isNaN(val) && val >= 500 && val <= 4000) {
      onUpdateWaterGoal(val);
    }
  };

  const handleCreateProtocol = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    onAddProtocol(newTitle.trim(), newContent.trim(), newPriority);
    setNewTitle('');
    setNewContent('');
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.content.toLowerCase().includes(auditSearch.toLowerCase()) ||
      (l.rawTranscript && l.rawTranscript.toLowerCase().includes(auditSearch.toLowerCase())) ||
      l.caregiverName.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Head Nurse Portal Title & Subnav */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <Shield className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Head Nurse Clinical Oversight Portal
              </h2>
              <p className="text-xs text-slate-500">
                Supervised by Margaret Brady, RN · Head Nurse & Clinical Director
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium hidden md:inline">
              Mrs. Brimberg (480 Park)
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 pt-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('manager_report')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'manager_report'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Manager's Report</span>
          </button>

          <button
            onClick={() => setActiveTab('protocols')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'protocols'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Protocol & Hydration Goals</span>
          </button>

          <button
            onClick={() => setActiveTab('audit_trail')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'audit_trail'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Voice Audit Trail ({logs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('team_access')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'team_access'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Care Team Access ({caregivers.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: AI Manager's Report */}
      {activeTab === 'manager_report' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Daily Morning Clinical Brief
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Executive 24-Hour Clinical Overview
              </h3>
              <p className="text-xs text-slate-500">
                Filters routine hygiene fluff and highlights clinical trajectory, hydration %, and risk vectors.
              </p>
            </div>

            <button
              onClick={generateManagerReport}
              disabled={isGeneratingReport}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-xl flex items-center gap-1.5 transition-colors self-start"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingReport ? 'animate-spin' : ''}`} />
              <span>{isGeneratingReport ? 'Compiling Report...' : 'Refresh AI Summary'}</span>
            </button>
          </div>

          {isGeneratingReport ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-700 rounded-full animate-spin" />
              <p className="text-sm font-semibold text-slate-700">
                Gemini analyzing 24-hr clinical binder logs...
              </p>
            </div>
          ) : report ? (
            <div className="space-y-5">
              {/* Executive Synopsis Line */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 block mb-1">
                  Executive 24-Hour Synopsis
                </span>
                <p className="text-sm font-bold text-emerald-950 leading-relaxed font-mono">
                  {report.executiveSynopsis}
                </p>
              </div>

              {/* Clinical Analysis Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hydration */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Droplets className="w-4 h-4 text-blue-600" />
                    <span>Hydration Trajectory & Late-Night Intake</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {report.hydrationAnalysis}
                  </p>
                </div>

                {/* Bowel Elimination */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Clock className="w-4 h-4 text-amber-700" />
                    <span>Bowel Elimination & Constipation Risk</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {report.bowelEliminationAssessment}
                  </p>
                </div>

                {/* Skin & Mobility */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>Skin Integrity & Mobility Offloading</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {report.skinAndMobilityStatus}
                  </p>
                </div>

                {/* Incident & Risk */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Incidents & Fall Precautions</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {report.incidentAndRiskEvaluation}
                  </p>
                </div>
              </div>

              {/* Action Directives for Care Team */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-300 block">
                  Head Nurse Standing Directives for Next Shifts
                </span>
                <ul className="space-y-1.5">
                  {report.actionDirectivesForTeam?.map((action, i) => (
                    <li key={i} className="text-xs text-slate-200 flex items-start gap-2">
                      <span className="text-teal-400 font-bold">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Tab 2: Protocols & Hydration Goals */}
      {activeTab === 'protocols' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hydration Goal Settings */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Global Hydration Goal</h3>
              <p className="text-xs text-slate-500">
                Sets the baseline for the resident's liquid progress bar across all shifts.
              </p>
            </div>

            <form onSubmit={handleSaveWaterGoal} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Daily Fluid Target
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-400 block font-mono">Fluid Ounces (oz)</span>
                    <input
                      type="number"
                      min="20"
                      max="135"
                      step="1"
                      value={Math.round((parseInt(waterGoalInput, 10) / 29.57) * 10) / 10}
                      onChange={(e) => {
                        const oz = parseFloat(e.target.value) || 0;
                        setWaterGoalInput(Math.round(oz * 29.57).toString());
                      }}
                      className="w-full px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <span className="text-slate-400 text-sm mt-3">/</span>
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-400 block font-mono">Milliliters (ml)</span>
                    <input
                      type="number"
                      min="500"
                      max="4000"
                      step="50"
                      value={waterGoalInput}
                      onChange={(e) => setWaterGoalInput(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {[
                  { ml: 1500, oz: 50 },
                  { ml: 2000, oz: 68 },
                  { ml: 2500, oz: 85 },
                ].map((preset) => (
                  <button
                    key={preset.ml}
                    type="button"
                    onClick={() => setWaterGoalInput(preset.ml.toString())}
                    className="flex-1 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono"
                  >
                    {preset.oz} oz ({preset.ml}ml)
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm transition-colors"
              >
                Update Global Goal
              </button>
            </form>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
              <strong>Clinical Guardrail:</strong> Changes here update all caregiver dashboards immediately. Over-consumption triggers the Red Alert automatically.
            </div>
          </div>

          {/* Protocol Pins Management */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Issue Protocol Pin</h3>
              <p className="text-xs text-slate-500">
                Pins to the top of every caregiver's dashboard until individually acknowledged.
              </p>
            </div>

            <form onSubmit={handleCreateProtocol} className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Protocol Title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="sm:col-span-2 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  required
                />
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="routine">Routine</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <textarea
                placeholder="Clinical instructions for the caregiving team..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                required
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Broadcast Pin
                </button>
              </div>
            </form>

            {/* Existing Protocol Pins */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Active Protocol Pins ({protocols.filter((p) => p.status === 'active').length})
              </span>

              <div className="space-y-2">
                {protocols.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            p.priority === 'urgent'
                              ? 'bg-rose-100 text-rose-800'
                              : p.priority === 'high'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {p.priority}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">{p.title}</h4>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{p.content}</p>
                      <p className="text-[11px] text-slate-400">
                        Acknowledged by {p.acknowledgedBy.length} caregivers
                      </p>
                    </div>

                    {p.status === 'active' && (
                      <button
                        onClick={() => onArchiveProtocol(p.id)}
                        className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded shrink-0"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Full Audit Trail (Original transcripts vs AI summary) */}
      {activeTab === 'audit_trail' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Voice Dictation & Clinical Audit Trail
              </h3>
              <p className="text-xs text-slate-500">
                Inspect raw unedited voice transcripts side-by-side with AI parsed outputs and caregiver verification stamps.
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search audit entries..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg w-full sm:w-60 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">
                        {log.caregiverName}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {new Date(log.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {log.category === 'incident' && (
                        <span className="text-[10px] font-bold text-white bg-red-600 px-1.5 py-0.5 rounded">
                          RED FLAG INCIDENT
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Safety Gate Approved</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Raw Voice Transcript */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                      <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                      <span>Raw Voice Transcript</span>
                    </span>
                    <p className="italic text-slate-600 leading-relaxed">
                      "{log.rawTranscript || log.content}"
                    </p>
                  </div>

                  {/* AI Categorized Breakdown */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>AI Extracted Record</span>
                    </span>
                    <p className="text-slate-800 font-medium">{log.content}</p>
                    {log.metrics && (
                      <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center gap-3">
                        <span>Fluid: {log.metrics.waterIntakeMl || 0}ml</span>
                        <span>BM: {log.metrics.bmOccurred ? 'Yes' : 'No'}</span>
                        {log.metrics.isAfter630PM && (
                          <span className="text-amber-700 font-semibold">Post-6:30 PM Intake</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Team Access Control */}
      {activeTab === 'team_access' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Caregiver Access & Shift Roster
            </h3>
            <p className="text-xs text-slate-500">
              High-trust team model. Head Nurse can revoke access if a caregiver departs the team.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {caregivers.map((cg) => (
              <div key={cg.id} className="py-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${cg.avatarColor} text-white font-semibold text-sm flex items-center justify-center`}
                  >
                    {cg.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{cg.name}</h4>
                      {cg.isShiftActive ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          Active On Shift
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          Off Duty
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{cg.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                      cg.status === 'active'
                        ? 'text-emerald-700 bg-emerald-50'
                        : 'text-rose-700 bg-rose-50'
                    }`}
                  >
                    {cg.status === 'active' ? 'Full Access Granted' : 'Access Revoked'}
                  </span>

                  <button
                    onClick={() => onToggleCaregiverStatus(cg.id)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors flex items-center gap-1 ${
                      cg.status === 'active'
                        ? 'text-rose-700 border-rose-200 hover:bg-rose-50'
                        : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    {cg.status === 'active' ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Revoke Access</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Restore Access</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
