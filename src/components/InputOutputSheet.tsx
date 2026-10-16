import React, { useState } from 'react';
import { LiquidEntry, BowelMovementEntry } from '../types';
import { mlToOz, ozToMl } from '../utils/units';
import {
  Droplets,
  AlertTriangle,
  Moon,
  Plus,
  Clock,
  CheckCircle2,
  Calendar,
  FileSpreadsheet,
  RotateCcw,
} from 'lucide-react';

interface InputOutputSheetProps {
  goalMl: number;
  liquidEntries: (LiquidEntry & { dateKey?: string })[];
  onAddLiquid: (entry: Omit<LiquidEntry, 'id'> & { dateKey?: string }) => void;
  bmEntries: (BowelMovementEntry & { dateKey?: string })[];
  onAddBM: (entry: Omit<BowelMovementEntry, 'id'> & { dateKey?: string }) => void;
  caregiverName: string;
  selectedDateKey?: string;
  isToday?: boolean;
  selectedDateLabel?: string;
}

export const InputOutputSheet: React.FC<InputOutputSheetProps> = ({
  goalMl,
  liquidEntries,
  onAddLiquid,
  bmEntries,
  onAddBM,
  caregiverName,
  selectedDateKey,
  isToday = true,
  selectedDateLabel,
}) => {
  const [preferredUnit, setPreferredUnit] = useState<'oz' | 'ml'>('oz');
  const [showCustomLiquidModal, setShowCustomLiquidModal] = useState(false);
  const [showLogBMModal, setShowLogBMModal] = useState(false);
  const [simulatedHoursOffset, setSimulatedHoursOffset] = useState<number | null>(null);

  // Custom liquid form state (default in oz!)
  const [customOz, setCustomOz] = useState('8');
  const [customBeverage, setCustomBeverage] = useState('Fresh Water');
  const [isManualLate, setIsManualLate] = useState(false);

  // BM form state
  const [bristolScale, setBristolScale] = useState(4);
  const [bmAmount, setBmAmount] = useState<'small' | 'moderate' | 'large'>('moderate');
  const [bmNotes, setBmNotes] = useState('');

  // 24-HOUR MIDNIGHT RESET LOGIC:
  // Strictly filter liquids logged in the selected 24-hour cycle (00:00 to 23:59 of selected date)
  const activeLiquidEntries = selectedDateKey
    ? liquidEntries.filter((e) => {
        if (e.dateKey) return e.dateKey === selectedDateKey;
        return e.timestamp.startsWith(selectedDateKey);
      })
    : liquidEntries;

  // Active bowel movements for this date
  const activeBMEntries = selectedDateKey
    ? bmEntries.filter((e) => {
        if (e.dateKey) return e.dateKey === selectedDateKey;
        return e.timestamp.startsWith(selectedDateKey);
      })
    : bmEntries;

  // Calculations for current 24-hour window
  const totalMl = activeLiquidEntries.reduce((acc, curr) => acc + curr.volumeMl, 0);
  const totalOz = mlToOz(totalMl);
  const goalOz = mlToOz(goalMl);
  const percentage = Math.min(Math.round((totalMl / goalMl) * 100), 150);

  // Warnings for the 24-hour window
  const hasLateNightIntake = activeLiquidEntries.some((e) => e.isAfter630PM);
  const lateNightVolumeMl = activeLiquidEntries
    .filter((e) => e.isAfter630PM)
    .reduce((acc, curr) => acc + curr.volumeMl, 0);
  const lateNightVolumeOz = mlToOz(lateNightVolumeMl);

  const isGoalExceeded = totalMl > goalMl;

  // BM Timer logic
  const latestBM = bmEntries.length > 0 ? bmEntries[bmEntries.length - 1] : null;
  let hoursElapsed = 46;
  let minutesElapsed = 20;

  if (simulatedHoursOffset !== null) {
    hoursElapsed = simulatedHoursOffset;
    minutesElapsed = 15;
  } else if (latestBM) {
    const diffMs = Date.now() - new Date(latestBM.timestamp).getTime();
    hoursElapsed = Math.floor(diffMs / (1000 * 60 * 60));
    minutesElapsed = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  }

  const isCriticalBMAlert = hoursElapsed >= 72;
  const isWarningBM = hoursElapsed >= 48 && hoursElapsed < 72;

  // Color logic for compact intake meter
  let intakeColor = 'bg-blue-600';
  let intakeStatusText = 'Intake on schedule';

  if (isGoalExceeded) {
    intakeColor = 'bg-red-600';
    intakeStatusText = 'Daily goal exceeded';
  } else if (hasLateNightIntake) {
    intakeColor = 'bg-amber-500';
    intakeStatusText = 'Post-6:30 PM intake caution';
  }

  const handleQuickAddOz = (oz: number, beverage: string) => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isAfter630 = hours > 18 || (hours === 18 && minutes >= 30);
    const volumeMl = ozToMl(oz);

    onAddLiquid({
      dateKey: selectedDateKey,
      volumeMl,
      volumeOz: oz,
      beverage,
      timestamp: now.toISOString(),
      loggedAtTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAfter630PM: isAfter630,
      caregiverName,
    });
  };

  const handleCustomLiquidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const oz = parseFloat(customOz);
    if (isNaN(oz) || oz <= 0) return;

    const volumeMl = ozToMl(oz);
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isAfter630 = isManualLate || hours > 18 || (hours === 18 && minutes >= 30);

    onAddLiquid({
      dateKey: selectedDateKey,
      volumeMl,
      volumeOz: oz,
      beverage: customBeverage,
      timestamp: now.toISOString(),
      loggedAtTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAfter630PM: isAfter630,
      caregiverName,
    });

    setShowCustomLiquidModal(false);
  };

  const handleSaveBM = (e: React.FormEvent) => {
    e.preventDefault();
    const bristolNames: Record<number, string> = {
      1: 'Type 1: Hard lumps (constipated)',
      2: 'Type 2: Lumpy sausage',
      3: 'Type 3: Sausage with surface cracks (normal)',
      4: 'Type 4: Smooth soft snake (ideal target)',
      5: 'Type 5: Soft blobs',
      6: 'Type 6: Mushy pieces (mild diarrhea)',
      7: 'Type 7: Watery liquid (diarrhea)',
    };

    onAddBM({
      dateKey: selectedDateKey,
      timestamp: new Date().toISOString(),
      bristolScale,
      consistency: bristolNames[bristolScale] || 'Normal stool',
      amount: bmAmount,
      notes: bmNotes.trim() || 'Logged via I&O sheet',
      caregiverName,
    });

    setSimulatedHoursOffset(null);
    setShowLogBMModal(false);
    setBmNotes('');
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-md overflow-hidden flex flex-col">
      {/* Clipboard Header Strip */}
      <div className="bg-slate-800 text-white px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-teal-400" />
          <h2 className="text-xs font-bold tracking-wider uppercase font-mono">
            CLINICAL I&O FLOW SHEET
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-slate-400">Unit:</span>
          <button
            onClick={() => setPreferredUnit('oz')}
            className={`px-2 py-0.5 rounded font-bold transition-colors ${
              preferredUnit === 'oz'
                ? 'bg-teal-500 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            oz
          </button>
          <span className="text-slate-500">/</span>
          <button
            onClick={() => setPreferredUnit('ml')}
            className={`px-2 py-0.5 rounded font-bold transition-colors ${
              preferredUnit === 'ml'
                ? 'bg-teal-500 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            ml
          </button>
        </div>
      </div>

      {/* 24-Hour Midnight Reset Badge Strip */}
      <div className="bg-teal-900/90 text-teal-100 px-4 py-1.5 text-[11px] font-medium flex items-center justify-between border-b border-teal-800">
        <div className="flex items-center gap-1.5">
          <RotateCcw className="w-3 h-3 text-teal-300 animate-spin-once" />
          <span>
            {isToday ? '24-Hour Cycle (12:00 AM – 11:59 PM)' : `Archive Record (${selectedDateLabel || selectedDateKey})`}
          </span>
        </div>
        <span className="text-[10px] bg-teal-800/80 text-teal-200 px-2 py-0.5 rounded-full font-mono border border-teal-700">
          {isToday ? 'Resets at Midnight' : 'Daily Record'}
        </span>
      </div>

      <div className="p-4 space-y-6 flex-1 bg-slate-50/50">
        {/* SECTION 1: COMPACT LIQUID INTAKE (Does NOT run over full way, measured in oz) */}
        <section className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Fluid Intake (Daily Goal: {goalOz} oz / {goalMl} ml)
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-black font-mono text-slate-900 tracking-tight tabular-nums">
                  {preferredUnit === 'oz' ? `${totalOz} oz` : `${totalMl} ml`}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {preferredUnit === 'oz'
                    ? `(${totalMl} ml / ${goalOz} oz goal)`
                    : `(${totalOz} oz / ${goalMl} ml goal)`}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-sm font-extrabold font-mono text-slate-800 tabular-nums">
                {Math.round((totalMl / goalMl) * 100)}%
              </span>
              <p className="text-[10px] text-slate-400 font-medium">of 24-hr goal</p>
            </div>
          </div>

          {/* Compact Graduated Carafe / Fluid Cylinder Tracker */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-2">
              {/* Vertical Graduated Tube / Carafe (Controlled width so it never runs across full way) */}
              <div className="relative w-12 h-28 bg-slate-100 rounded-xl border-2 border-slate-300 p-1 flex flex-col justify-end overflow-hidden shrink-0 shadow-inner">
                {/* 6:30 PM cutoff line marker at ~70% */}
                <div
                  className="absolute left-0 right-0 border-t border-dashed border-amber-500 z-10"
                  style={{ bottom: '70%' }}
                  title="6:30 PM Cutoff Line (Nocturia risk above this)"
                />
                {/* Liquid Fill */}
                <div
                  className={`w-full rounded-b-lg transition-all duration-500 ease-out ${intakeColor}`}
                  style={{ height: `${Math.min(percentage, 100)}%` }}
                />
              </div>

              {/* Status and warnings breakdown */}
              <div className="flex-1 space-y-1 text-xs">
                {isGoalExceeded ? (
                  <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-800 text-[11px] leading-tight">
                    <span className="font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-red-600" />
                      Goal Exceeded ({totalOz} oz)
                    </span>
                    Potential fluid overload. Consult Head Nurse Margaret Brady.
                  </div>
                ) : hasLateNightIntake ? (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] leading-tight">
                    <span className="font-bold flex items-center gap-1">
                      <Moon className="w-3 h-3 text-amber-600" />
                      Post-6:30 PM Intake: {lateNightVolumeOz} oz
                    </span>
                    Nocturia precaution active. Monitor nighttime transfers.
                  </div>
                ) : (
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-[11px] leading-tight">
                    <span className="font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-blue-600" />
                      Daytime Pacing Normal
                    </span>
                    Frontloading fluids before 5:00 PM recommended.
                  </div>
                )}

                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Logged: {totalOz} oz</span>
                  <span>Remaining: {Math.max(0, Math.round((goalOz - totalOz) * 10) / 10)} oz</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Add Buttons Measured in OZ */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Quick Log Drink (in oz)
              </span>
              <button
                onClick={() => setShowCustomLiquidModal(true)}
                className="text-[11px] text-teal-700 hover:text-teal-900 font-bold flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" />
                <span>Custom</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleQuickAddOz(4, 'Small Sip / Water')}
                className="py-1.5 px-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-center transition-colors group"
              >
                <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700">+4 oz</p>
                <p className="text-[10px] text-slate-400">120 ml (Sip)</p>
              </button>

              <button
                onClick={() => handleQuickAddOz(8, 'Glass of Water')}
                className="py-1.5 px-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-center transition-colors group"
              >
                <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700">+8 oz</p>
                <p className="text-[10px] text-slate-400">240 ml (Glass)</p>
              </button>

              <button
                onClick={() => handleQuickAddOz(12, 'Juice / Hot Tea')}
                className="py-1.5 px-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-center transition-colors group"
              >
                <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700">+12 oz</p>
                <p className="text-[10px] text-slate-400">355 ml (Mug)</p>
              </button>
            </div>
          </div>

          {/* Mini Flowsheet Log of Fluids for this 24-hr period */}
          {activeLiquidEntries.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Intake in this 24-hr period
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {activeLiquidEntries.length} entries
                </span>
              </div>
              <div className="max-h-24 overflow-y-auto space-y-1 text-xs">
                {activeLiquidEntries.slice(-4).reverse().map((e) => {
                  const entryOz = e.volumeOz || mlToOz(e.volumeMl);
                  return (
                    <div
                      key={e.id}
                      className="flex items-center justify-between p-1 bg-slate-50 rounded text-[11px]"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {e.isAfter630PM ? (
                          <span title="Post-6:30 PM">
                            <Moon className="w-3 h-3 text-amber-500 shrink-0" />
                          </span>
                        ) : (
                          <Droplets className="w-3 h-3 text-blue-500 shrink-0" />
                        )}
                        <span className="font-medium text-slate-700 truncate">{e.beverage}</span>
                        <span className="text-[10px] text-slate-400">· {e.loggedAtTime}</span>
                      </div>
                      <div className="font-mono font-bold text-slate-900 shrink-0 pl-1">
                        {preferredUnit === 'oz' ? `${entryOz} oz` : `${e.volumeMl} ml`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* SECTION 2: OUTPUT & BOWEL MOVEMENT TIMER */}
        <section className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Output / Elimination
              </span>
              <h3 className="text-xs font-bold text-slate-900">Bowel Movement Timer</h3>
            </div>

            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                isCriticalBMAlert
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : isWarningBM
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {isCriticalBMAlert ? '72h Emergency' : isWarningBM ? '48h-72h Warning' : 'Normal'}
            </span>
          </div>

          {/* Time Display */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <p className="text-[10px] text-slate-500 font-medium">Time Since Last Documented BM</p>
            <p
              className={`text-2xl font-black font-mono tracking-tight tabular-nums mt-0.5 ${
                isCriticalBMAlert ? 'text-red-600 animate-pulse' : isWarningBM ? 'text-amber-700' : 'text-slate-900'
              }`}
            >
              {hoursElapsed}h {minutesElapsed}m
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Threshold: Turns RED at 72 hours</p>
          </div>

          {isCriticalBMAlert && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-900 text-[11px] space-y-1">
              <span className="font-bold flex items-center gap-1 text-red-800">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                Standing 72h Constipation Protocol Active
              </span>
              <p className="text-red-700 leading-snug">
                Offer 4 oz warm prune juice. Complete abdominal check and notify Head Nurse Margaret Brady.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="pt-1 flex items-center justify-between gap-2">
            <button
              onClick={() => setShowLogBMModal(true)}
              className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record BM</span>
            </button>

            {/* Test Simulation Toggle */}
            {simulatedHoursOffset === null ? (
              <button
                onClick={() => setSimulatedHoursOffset(75)}
                className="py-2 px-2 text-[10px] font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors whitespace-nowrap"
                title="Preview the 72-hour Red Warning"
              >
                Test 75h
              </button>
            ) : (
              <button
                onClick={() => setSimulatedHoursOffset(null)}
                className="py-2 px-2 text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </section>
      </div>

      {/* Custom Liquid Modal (in OZ) */}
      {showCustomLiquidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Log Custom Beverage</h3>
            <form onSubmit={handleCustomLiquidSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Volume in Fluid Ounces (oz)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="64"
                    step="0.5"
                    value={customOz}
                    onChange={(e) => setCustomOz(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                  <span className="text-xs text-slate-500 font-mono shrink-0">
                    ~{ozToMl(parseFloat(customOz) || 0)} ml
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Beverage Name
                </label>
                <input
                  type="text"
                  value={customBeverage}
                  onChange={(e) => setCustomBeverage(e.target.value)}
                  placeholder="e.g. Apple Juice, Prune Juice, Tea"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="lateToggleIO"
                  checked={isManualLate}
                  onChange={(e) => setIsManualLate(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="lateToggleIO" className="text-xs text-slate-700">
                  Consumed post-6:30 PM (Nocturia Risk)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCustomLiquidModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log BM Modal */}
      {showLogBMModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Record Bowel Movement</h3>
            <form onSubmit={handleSaveBM} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bristol Stool Scale Form (1-7)
                </label>
                <div className="grid grid-cols-7 gap-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setBristolScale(num)}
                      className={`h-9 rounded border text-xs font-bold ${
                        bristolScale === num
                          ? 'bg-amber-800 text-white border-amber-900'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-1 font-medium">
                  {bristolScale === 1 && 'Type 1: Separate hard lumps (Severe constipation)'}
                  {bristolScale === 2 && 'Type 2: Lumpy sausage (Mild constipation)'}
                  {bristolScale === 3 && 'Type 3: Sausage with cracks (Normal)'}
                  {bristolScale === 4 && 'Type 4: Smooth snake (Normal & ideal)'}
                  {bristolScale === 5 && 'Type 5: Soft blobs (Lacks fiber)'}
                  {bristolScale === 6 && 'Type 6: Mushy stool (Mild diarrhea)'}
                  {bristolScale === 7 && 'Type 7: Watery liquid (Diarrhea)'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['small', 'moderate', 'large'] as const).map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setBmAmount(amt)}
                      className={`py-1 text-xs font-semibold rounded capitalize border ${
                        bmAmount === amt
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={bmNotes}
                  onChange={(e) => setBmNotes(e.target.value)}
                  placeholder="e.g. Assisted to commode, pericare done"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLogBMModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
                >
                  Reset Timer & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
