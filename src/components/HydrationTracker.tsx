import React, { useState } from 'react';
import { LiquidEntry } from '../types';
import { Droplets, AlertTriangle, Moon, Plus, Check, Clock } from 'lucide-react';

interface HydrationTrackerProps {
  goalMl: number;
  entries: LiquidEntry[];
  onAddLiquid: (entry: Omit<LiquidEntry, 'id'>) => void;
  caregiverName: string;
}

export const HydrationTracker: React.FC<HydrationTrackerProps> = ({
  goalMl,
  entries,
  onAddLiquid,
  caregiverName,
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customMl, setCustomMl] = useState('250');
  const [customBeverage, setCustomBeverage] = useState('Water');
  const [isManualLate, setIsManualLate] = useState(false);

  // Calculate totals
  const totalMl = entries.reduce((acc, curr) => acc + curr.volumeMl, 0);
  const percentage = Math.round((totalMl / goalMl) * 100);

  // Check warnings
  // Warning 1: Turns Yellow if ANY liquid is logged after 6:30 PM (18:30)
  const hasLateNightIntake = entries.some((e) => e.isAfter630PM);
  const lateNightVolume = entries
    .filter((e) => e.isAfter630PM)
    .reduce((acc, curr) => acc + curr.volumeMl, 0);

  // Warning 2: Turns Red if total volume exceeds the daily goal
  const isGoalExceeded = totalMl > goalMl;

  // Determine state colors
  let barColor = 'bg-blue-600';
  let badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
  let stateTitle = 'Hydration Pacing Normal';

  if (isGoalExceeded) {
    barColor = 'bg-red-600';
    badgeColor = 'bg-red-50 text-red-700 border-red-200';
    stateTitle = 'Fluid Goal Exceeded (Overload Risk)';
  } else if (hasLateNightIntake) {
    barColor = 'bg-amber-500';
    badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
    stateTitle = 'Late-Night Liquid Logged (Nocturia Risk)';
  }

  const handleQuickAdd = (ml: number, beverage: string) => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isAfter630 = hours > 18 || (hours === 18 && minutes >= 30);

    onAddLiquid({
      volumeMl: ml,
      beverage,
      timestamp: now.toISOString(),
      loggedAtTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAfter630PM: isAfter630,
      caregiverName,
    });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ml = parseInt(customMl, 10);
    if (isNaN(ml) || ml <= 0) return;

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const calculatedAfter630 = hours > 18 || (hours === 18 && minutes >= 30);

    onAddLiquid({
      volumeMl: ml,
      beverage: customBeverage,
      timestamp: now.toISOString(),
      loggedAtTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAfter630PM: isManualLate || calculatedAfter630,
      caregiverName,
    });

    setShowCustomModal(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Liquid Intake Progress</h2>
              <p className="text-xs text-slate-500">
                Daily Goal: <span className="font-mono font-semibold text-slate-700">{goalMl} ml</span> (Set by Head Nurse)
              </p>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${badgeColor}`}>
          {isGoalExceeded ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span>Goal Exceeded ({totalMl}ml)</span>
            </>
          ) : hasLateNightIntake ? (
            <>
              <Moon className="w-3.5 h-3.5 text-amber-600" />
              <span>Post-6:30 PM Intake ({lateNightVolume}ml)</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5 text-blue-600" />
              <span>On Schedule</span>
            </>
          )}
        </div>
      </div>

      {/* Progress Bar & Numerical Breakdown */}
      <div className="space-y-2 mb-5">
        <div className="flex justify-between items-baseline">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
              {totalMl}
            </span>
            <span className="text-sm font-semibold text-slate-500">/ {goalMl} ml</span>
          </div>
          <span className="text-sm font-bold font-mono text-slate-700 tabular-nums">
            {percentage}%
          </span>
        </div>

        {/* The Smart Progress Bar */}
        <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className={`h-full transition-all duration-500 ease-out rounded-full ${barColor}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>

        {/* Warning Explanations */}
        {isGoalExceeded && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>
              <strong>Clinical Alert:</strong> Intake has exceeded the {goalMl}ml goal. Monitor resident for edema and consult Head Nurse before offering further fluids.
            </span>
          </div>
        )}

        {hasLateNightIntake && !isGoalExceeded && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
            <Moon className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Sleep/Nocturia Warning:</strong> {lateNightVolume}ml logged after 6:30 PM cutoff. Ensure bedside commode/urinal is accessible and anticipate frequent nighttime assistance.
            </span>
          </div>
        )}
      </div>

      {/* Quick Fluid Log Actions */}
      <div className="pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-700">Quick Log Beverage</span>
          <button
            onClick={() => setShowCustomModal(true)}
            className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Custom Amount</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleQuickAdd(150, 'Water Sip')}
            className="p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-colors group"
          >
            <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700">+150 ml</p>
            <p className="text-[11px] text-slate-500 truncate">Small Sip / Meds</p>
          </button>

          <button
            onClick={() => handleQuickAdd(250, 'Glass of Water')}
            className="p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-colors group"
          >
            <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700">+250 ml</p>
            <p className="text-[11px] text-slate-500 truncate">Standard Glass</p>
          </button>

          <button
            onClick={() => handleQuickAdd(350, 'Juice / Tea')}
            className="p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-colors group"
          >
            <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700">+350 ml</p>
            <p className="text-[11px] text-slate-500 truncate">Mug / Juice</p>
          </button>
        </div>
      </div>

      {/* Recent Entries Drawer / Mini List */}
      {entries.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Today's Logged Fluids ({entries.length})</span>
            <span className="font-mono text-[11px]">{totalMl} ml total</span>
          </div>
          <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
            {entries.slice(-4).reverse().map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 text-xs"
              >
                <div className="flex items-center gap-2">
                  {e.isAfter630PM ? (
                    <span title="After 6:30 PM">
                      <Moon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    </span>
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span className="font-medium text-slate-700">{e.beverage}</span>
                  <span className="text-[11px] text-slate-400">· {e.loggedAtTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">{e.volumeMl} ml</span>
                  {e.isAfter630PM && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1 rounded">
                      Post-6:30
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Liquid Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-3">Log Fluid Intake</h3>
            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Volume (ml)</label>
                <input
                  type="number"
                  min="10"
                  max="2000"
                  step="10"
                  value={customMl}
                  onChange={(e) => setCustomMl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Beverage Type</label>
                <input
                  type="text"
                  value={customBeverage}
                  onChange={(e) => setCustomBeverage(e.target.value)}
                  placeholder="e.g., Apple Juice, Broth, Water"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="lateToggle"
                  checked={isManualLate}
                  onChange={(e) => setIsManualLate(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="lateToggle" className="text-xs text-slate-700">
                  Mark as Post-6:30 PM Intake (Triggers Nocturia Alert)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
