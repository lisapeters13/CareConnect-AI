import React, { useState } from 'react';
import { BowelMovementEntry } from '../types';
import { AlertCircle, Clock, Plus, CheckCircle2, AlertTriangle } from 'lucide-react';

interface BowelMovementTrackerProps {
  entries: BowelMovementEntry[];
  onAddBM: (entry: Omit<BowelMovementEntry, 'id'>) => void;
  caregiverName: string;
}

export const BowelMovementTracker: React.FC<BowelMovementTrackerProps> = ({
  entries,
  onAddBM,
  caregiverName,
}) => {
  const [showLogModal, setShowLogModal] = useState(false);
  const [simulatedHoursOffset, setSimulatedHoursOffset] = useState<number | null>(null);

  // Stool form states
  const [bristolScale, setBristolScale] = useState(4);
  const [amount, setAmount] = useState<'small' | 'moderate' | 'large'>('moderate');
  const [notes, setNotes] = useState('');

  // Find latest BM
  const latestBM = entries.length > 0 ? entries[entries.length - 1] : null;

  // Calculate hours since last BM
  let hoursElapsed = 0;
  let minutesElapsed = 0;

  if (simulatedHoursOffset !== null) {
    hoursElapsed = simulatedHoursOffset;
    minutesElapsed = 15;
  } else if (latestBM) {
    const diffMs = Date.now() - new Date(latestBM.timestamp).getTime();
    hoursElapsed = Math.floor(diffMs / (1000 * 60 * 60));
    minutesElapsed = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  } else {
    // Default fallback if no entries: 46 hours
    hoursElapsed = 46;
    minutesElapsed = 20;
  }

  // Clinical Alert Logic: Turns Red if > 72 hours (3 days)
  const isCriticalAlert = hoursElapsed >= 72;
  const isWarningAlert = hoursElapsed >= 48 && hoursElapsed < 72;

  let timerColorClass = 'text-slate-900';
  let badgeColorClass = 'bg-slate-100 text-slate-700 border-slate-200';
  let bgCardBorder = 'border-slate-200';

  if (isCriticalAlert) {
    timerColorClass = 'text-red-600 animate-pulse';
    badgeColorClass = 'bg-red-50 text-red-700 border-red-300 font-bold';
    bgCardBorder = 'border-red-300 ring-2 ring-red-100';
  } else if (isWarningAlert) {
    timerColorClass = 'text-amber-600';
    badgeColorClass = 'bg-amber-50 text-amber-800 border-amber-300 font-semibold';
  }

  const handleSaveBM = (e: React.FormEvent) => {
    e.preventDefault();
    const bristolNames: Record<number, string> = {
      1: 'Separate hard lumps (severe constipation)',
      2: 'Lumpy and sausage-like (mild constipation)',
      3: 'Sausage shape with cracks on surface (normal)',
      4: 'Smooth and soft sausage or snake (normal/ideal)',
      5: 'Soft blobs with clear-cut edges (lacking fiber)',
      6: 'Mushy consistency, fluffy pieces (mild diarrhea)',
      7: 'Entirely liquid, watery (diarrhea)',
    };

    onAddBM({
      timestamp: new Date().toISOString(),
      bristolScale,
      consistency: bristolNames[bristolScale] || 'Normal formed stool',
      amount,
      notes: notes.trim() || 'Logged via visual BM tracker',
      caregiverName,
    });

    setSimulatedHoursOffset(null);
    setShowLogModal(false);
    setNotes('');
  };

  return (
    <div className={`bg-white rounded-2xl border ${bgCardBorder} p-5 shadow-sm transition-all`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isCriticalAlert ? 'bg-red-100 text-red-700' : 'bg-amber-50 text-amber-700'
            }`}
          >
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">BM Visual Timer</h2>
            <p className="text-xs text-slate-500">Clinical Alert Threshold: 72 hrs (3 Days)</p>
          </div>
        </div>

        {/* Status Pill */}
        <div className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 ${badgeColorClass}`}>
          {isCriticalAlert ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span>&gt;72hr Emergency Protocol</span>
            </>
          ) : isWarningAlert ? (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Monitoring (48–72h)</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Normal Frequency</span>
            </>
          )}
        </div>
      </div>

      {/* Main Timer Display */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight tabular-nums ${timerColorClass}`}>
            {hoursElapsed}h {minutesElapsed}m
          </span>
          <span className="text-xs text-slate-500 font-medium">since last bowel movement</span>
        </div>

        {/* Clinical Alert Banner for >72 hours */}
        {isCriticalAlert && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-red-800">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>CRITICAL CONSTIPATION ALERT: Over 72 Hours Elapsed!</span>
            </div>
            <p className="text-red-700 pl-5 leading-relaxed">
              Arthur has passed 3 full days without evacuation. Standing order: offer 120ml warm prune juice immediately, perform abdominal assessment for distension/tenderness, and alert Head Nurse Brenda Hall.
            </p>
          </div>
        )}

        {isWarningAlert && !isCriticalAlert && (
          <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Approaching 48h Marker:</strong> Encourage hydration and mobilize client during morning shift.
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons & Simulation Toggle */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <button
          onClick={() => setShowLogModal(true)}
          className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Bowel Movement</span>
        </button>

        {/* Demo/Reviewer Toggle to test 72h Red Alert */}
        <div className="flex items-center gap-1.5 justify-end">
          <span className="text-[11px] text-slate-500">Test Alert:</span>
          {simulatedHoursOffset === null ? (
            <button
              onClick={() => setSimulatedHoursOffset(75)}
              className="text-[11px] text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-1 rounded-md font-medium transition-colors"
              title="Preview >72h Red Warning state"
            >
              Simulate 75h Alert
            </button>
          ) : (
            <button
              onClick={() => setSimulatedHoursOffset(null)}
              className="text-[11px] text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md font-medium transition-colors"
            >
              Reset to Actual ({hoursElapsed > 72 ? '46h' : `${hoursElapsed}h`})
            </button>
          )}
        </div>
      </div>

      {/* Log BM Modal with Bristol Stool Scale */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Record Bowel Movement</h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveBM} className="space-y-4">
              {/* Bristol Stool Scale Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Bristol Stool Scale Form (Type 1 to 7)
                </label>
                <div className="grid grid-cols-7 gap-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setBristolScale(num)}
                      className={`h-11 rounded-lg border text-xs font-bold transition-all flex flex-col items-center justify-center ${
                        bristolScale === num
                          ? 'bg-amber-800 text-white border-amber-900 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>Type {num}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-1.5 p-2 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
                  {bristolScale === 1 && 'Type 1: Separate hard lumps, like nuts (hard to pass). Constipation.'}
                  {bristolScale === 2 && 'Type 2: Sausage-shaped, but lumpy. Mild constipation.'}
                  {bristolScale === 3 && 'Type 3: Like a sausage with cracks on surface. Normal.'}
                  {bristolScale === 4 && 'Type 4: Like a sausage or snake, smooth and soft. Ideal target.'}
                  {bristolScale === 5 && 'Type 5: Soft blobs with clear-cut edges. Passed easily.'}
                  {bristolScale === 6 && 'Type 6: Fluffy pieces with ragged edges, a mushy stool.'}
                  {bristolScale === 7 && 'Type 7: Watery, no solid pieces. Entirely liquid (Diarrhea).'}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Amount</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['small', 'moderate', 'large'] as const).map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt)}
                      className={`py-1.5 text-xs font-semibold rounded-lg capitalize border ${
                        amount === amt
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinical Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Assisted to commode, no discomfort, pericare completed."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
                >
                  Reset Timer & Save BM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
