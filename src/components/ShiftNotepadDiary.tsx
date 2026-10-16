import React, { useState } from 'react';
import { LogEntry, CaregiverProfile, RoutineTaskItem } from '../types';
import { mlToOz } from '../utils/units';
import {
  Check,
  Plus,
  Mic,
  AlertTriangle,
  Clock,
  Sparkles,
  Paperclip,
  CheckSquare,
  Square,
  PenTool,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

interface ShiftNotepadDiaryProps {
  logs: LogEntry[];
  routineTasks: RoutineTaskItem[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (taskName: string) => void;
  activeCaregiver: CaregiverProfile;
  onOpenVoiceModal: () => void;
  onQuickAddNote: (content: string) => void;
  selectedDateKey: string;
  onSelectDateKey: (dateKey: string) => void;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  isToday: boolean;
  selectedDateLabel: string;
}

export const ShiftNotepadDiary: React.FC<ShiftNotepadDiaryProps> = ({
  logs,
  routineTasks,
  onToggleTask,
  onAddTask,
  activeCaregiver,
  onOpenVoiceModal,
  onQuickAddNote,
  selectedDateKey,
  onSelectDateKey,
  onPrevDay,
  onNextDay,
  onToday,
  isToday,
  selectedDateLabel,
}) => {
  const [quickNoteText, setQuickNoteText] = useState('');
  const [showAddTaskInput, setShowAddTaskInput] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [handwritingStyle, setHandwritingStyle] = useState(true);

  const handleQuickNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNoteText.trim()) return;
    onQuickAddNote(quickNoteText.trim());
    setQuickNoteText('');
  };

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    onAddTask(newTaskName.trim());
    setNewTaskName('');
    setShowAddTaskInput(false);
  };

  // Filter logs for the active selected date
  const dateLogs = logs.filter((log) => {
    if (log.dateStr) return log.dateStr === selectedDateKey;
    return log.timestamp.startsWith(selectedDateKey);
  });

  // Sort logs chronologically (matching the handwritten notebook order from morning to night)
  const sortedLogs = [...dateLogs].sort((a, b) => {
    const aInc = a.category === 'incident' || !!a.incident;
    const bInc = b.category === 'incident' || !!b.incident;
    if (aInc && !bInc) return -1;
    if (!aInc && bInc) return 1;
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  const completedTaskCount = routineTasks.filter((t) => t.completed).length;

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-xl overflow-hidden flex flex-col relative">
      {/* Decorative Spiral Wire Rings along right edge (Authentic Spiral Notebook Visuals) */}
      <div className="hidden sm:flex absolute right-2 top-0 bottom-0 w-6 flex-col justify-between py-6 pointer-events-none z-20">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="flex items-center justify-end">
            <div className="w-4 h-2.5 rounded-full bg-slate-300 border border-slate-400 shadow-sm" />
          </div>
        ))}
      </div>

      {/* Notebook Top Header Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-4 border-b-2 border-slate-700 flex flex-wrap items-center justify-between gap-3 shadow-md relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
            <h1 className="text-sm font-black tracking-widest uppercase font-mono text-white">
              RESIDENT DAILY DIARY · MRS. BRIMBERG
            </h1>
          </div>
          <p className="text-xs text-teal-300 font-mono mt-0.5">
            480 PARK · SPIRAL SHIFT NOTEPAD
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle handwriting pen script vs printed typeface */}
          <button
            onClick={() => setHandwritingStyle(!handwritingStyle)}
            className="text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1.5 border border-slate-700"
            title="Toggle between authentic pen handwriting and printed text"
          >
            <PenTool className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-semibold">
              {handwritingStyle ? 'Pen Script' : 'Clean Print'}
            </span>
          </button>

          <button
            onClick={onOpenVoiceModal}
            className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice-to-Sort</span>
          </button>
        </div>
      </div>

      {/* PAGE FLIPPING & CALENDAR DATE NAVIGATION CONTROLS */}
      <div className="bg-amber-100/70 border-b border-amber-300/80 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left: Previous / Next Day Page Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onPrevDay}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white/90 hover:bg-white text-slate-800 font-bold rounded-lg border border-amber-300 shadow-2xs transition-all active:scale-95"
            title="Flip back to previous day's shift notes"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-amber-800" />
            <span>◀ Prev Day</span>
          </button>

          <button
            onClick={onNextDay}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white/90 hover:bg-white text-slate-800 font-bold rounded-lg border border-amber-300 shadow-2xs transition-all active:scale-95"
            title="Flip forward to next day"
          >
            <span>Next Day ▶</span>
            <ChevronRight className="w-3.5 h-3.5 text-amber-800" />
          </button>

          {!isToday && (
            <button
              onClick={onToday}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg shadow-2xs transition-all"
            >
              <RotateCcw className="w-3 h-3 text-teal-200" />
              <span>Today</span>
            </button>
          )}
        </div>

        {/* Center: Interactive Calendar Date Selector */}
        <div className="flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-xl border border-amber-300 shadow-2xs">
          <Calendar className="w-4 h-4 text-amber-800" />
          <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
            {selectedDateLabel}
          </span>
          <input
            type="date"
            value={selectedDateKey}
            onChange={(e) => {
              if (e.target.value) onSelectDateKey(e.target.value);
            }}
            className="text-[11px] font-mono text-slate-600 bg-transparent border-0 focus:outline-none cursor-pointer"
            title="Pick a specific date from calendar"
          />
        </div>

        {/* Right: Active Caregiver Attribution on Page */}
        <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
          <BookOpen className="w-3.5 h-3.5 text-amber-700" />
          <span className="hidden sm:inline">Logging on iPad as:</span>
          <span className="font-bold text-slate-900 bg-white/80 px-2 py-0.5 rounded border border-amber-200">
            {activeCaregiver.name}
          </span>
        </div>
      </div>

      {/* Historical Archive Banner if viewing past notes */}
      {!isToday && (
        <div className="bg-amber-50 px-6 py-2 border-b border-amber-200 text-xs text-amber-900 flex items-center justify-between">
          <span className="font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Viewing Archive: Prior Shift Record for {selectedDateLabel} (Saved on iPad)
          </span>
          <button
            onClick={onToday}
            className="text-xs text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer"
          >
            Jump to Today's Shift →
          </button>
        </div>
      )}

      <div className="p-6 space-y-6 flex-1 bg-white sm:pr-10 relative">
        {/* SECTION 1: PINNED ROUTINE TASK CHECKMARKS (At the very top of the notepad!) */}
        <section className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-amber-200/70">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-700" />
              <h2 className="text-xs font-black tracking-wider uppercase font-mono text-slate-900">
                MANDATORY ROUTINE CHECKS (TAP TO TICK)
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-800 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                {completedTaskCount} of {routineTasks.length} Checked ✓
              </span>
              <button
                onClick={() => setShowAddTaskInput(!showAddTaskInput)}
                className="text-xs text-slate-700 hover:text-slate-900 font-bold flex items-center gap-0.5 bg-amber-200/60 hover:bg-amber-200 px-2 py-0.5 rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>
          </div>

          {showAddTaskInput && (
            <form onSubmit={handleAddNewTask} className="flex gap-2 pt-1 pb-1">
              <input
                type="text"
                placeholder="e.g. Skin check on bottom, Evening walking exercise"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                Save
              </button>
            </form>
          )}

          {/* Interactive Checkbox Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {routineTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => onToggleTask(t.id)}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer select-none flex items-start gap-2.5 transition-all ${
                  t.completed
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                    t.completed
                      ? 'bg-emerald-700 border-emerald-800 text-white shadow-xs'
                      : 'border-slate-400 bg-white'
                  }`}
                >
                  {t.completed ? (
                    <span className="font-black text-sm leading-none">✓</span>
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-semibold leading-tight ${
                      t.completed ? 'line-through text-emerald-900' : 'text-slate-800'
                    }`}
                  >
                    {t.task}
                  </p>
                  {t.notes && (
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {t.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: TWO-COLUMN LINED PAPER DIARY (Margin Times + Indented Sub-Bullets) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <h2 className="text-xs font-black tracking-wider uppercase font-mono text-slate-800">
              WRITTEN CLINICAL PROGRESS TIMELINE ({selectedDateLabel})
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              {sortedLogs.length} Timepoint {sortedLogs.length === 1 ? 'Entry' : 'Entries'}
            </span>
          </div>

          {/* Ruled Notebook Paper Container */}
          <div className="border-2 border-slate-300 rounded-2xl overflow-hidden shadow-sm bg-white">
            {sortedLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <p className="font-handwriting text-2xl text-slate-500">
                  No notes recorded yet for {selectedDateLabel}
                </p>
                <p className="text-xs text-slate-500 font-sans">
                  Write the first entry using the pen bar below or tap Voice-to-Sort to dictate.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {sortedLogs.map((log, index) => {
                  const isIncident = log.category === 'incident' || !!log.incident;
                  const waterOz = log.metrics?.waterIntakeOz || (log.metrics?.waterIntakeMl ? mlToOz(log.metrics.waterIntakeMl) : null);

                  const displayTime =
                    log.timeLabel ||
                    new Date(log.timestamp).toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                    });

                  return (
                    <div
                      key={log.id}
                      className={`grid grid-cols-12 gap-3 p-4 transition-colors ${
                        isIncident
                          ? 'bg-red-50/90 border-l-4 border-l-red-600'
                          : index % 2 === 0
                          ? 'bg-white'
                          : 'bg-slate-50/40'
                      }`}
                    >
                      {/* Left Column (Marginal Timestamp Column) */}
                      <div className="col-span-3 sm:col-span-2 border-r border-slate-200 pr-3 flex flex-col items-start">
                        <span className="text-base sm:text-lg font-black font-mono tracking-tight text-slate-900 bg-slate-100/80 px-2 py-0.5 rounded">
                          {displayTime}
                        </span>
                        {isIncident && (
                          <span className="mt-1 text-[9px] font-bold text-white bg-red-600 px-1.5 py-0.5 rounded uppercase">
                            INCIDENT
                          </span>
                        )}
                        {waterOz !== null && waterOz > 0 && (
                          <span className="mt-1.5 text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 whitespace-nowrap">
                            {waterOz} oz
                          </span>
                        )}
                        {log.metrics?.bmOccurred && (
                          <span className="mt-1 text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded whitespace-nowrap">
                            BM
                          </span>
                        )}
                      </div>

                      {/* Right Column (Lined Notes with Indented Sub-bullets '▷') */}
                      <div className="col-span-9 sm:col-span-10 pl-1 space-y-2">
                        {/* Main Note */}
                        <p
                          className={`leading-relaxed text-slate-900 ${
                            handwritingStyle
                              ? 'font-handwriting text-xl sm:text-2xl tracking-wide'
                              : 'text-sm font-medium'
                          }`}
                        >
                          {log.content}
                        </p>

                        {/* Indented Sub-bullets '▷' (from handwritten notes) */}
                        {log.subBullets && log.subBullets.length > 0 && (
                          <div className="pl-4 space-y-1.5 border-l-2 border-amber-300/60 my-1">
                            {log.subBullets.map((bullet, bIdx) => (
                              <div key={bIdx} className="flex items-start gap-2">
                                <span className="text-amber-700 text-sm font-bold shrink-0 mt-0.5">
                                  ▷
                                </span>
                                <p
                                  className={`leading-relaxed text-slate-800 ${
                                    handwritingStyle
                                      ? 'font-handwriting text-lg sm:text-xl'
                                      : 'text-xs font-normal'
                                  }`}
                                >
                                  {bullet}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Signature line / author */}
                        <div className="pt-1 text-[11px] text-slate-400 font-mono flex items-center justify-between">
                          <span>Signed: {log.caregiverName}</span>
                          {log.metrics?.isAfter630PM && (
                            <span className="text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.2 rounded">
                              Post-6:30 PM
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Direct Quick Pen Note input bar at bottom of ruled paper */}
            <form
              onSubmit={handleQuickNoteSubmit}
              className="p-3 bg-slate-50 border-t-2 border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={`Write note on Mrs. Brimberg's notepad as ${activeCaregiver.name}...`}
                value={quickNoteText}
                onChange={(e) => setQuickNoteText(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none placeholder-slate-400 font-sans"
              />
              <button
                type="submit"
                disabled={!quickNoteText.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-xl transition-colors whitespace-nowrap shadow-xs"
              >
                Write to Pad
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};
