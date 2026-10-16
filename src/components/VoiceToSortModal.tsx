import React, { useState, useEffect, useRef } from 'react';
import { CaregiverProfile, ParsedVoiceResult, LogEntry } from '../types';
import { SAMPLE_DICTATIONS } from '../data/mockData';
import {
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Droplets,
  Clock,
  ShieldCheck,
  Edit2,
  FileText,
  RotateCcw,
  Volume2,
} from 'lucide-react';

interface VoiceToSortModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCaregiver: CaregiverProfile;
  clientName: string;
  onConfirmSaveLog: (log: Omit<LogEntry, 'id'>) => void;
}

export const VoiceToSortModal: React.FC<VoiceToSortModalProps> = ({
  isOpen,
  onClose,
  activeCaregiver,
  clientName,
  onConfirmSaveLog,
}) => {
  // Dictation phase states: 'dictating' | 'processing' | 'review_gate'
  const [phase, setPhase] = useState<'dictating' | 'processing' | 'review_gate'>('dictating');
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Parsed AI result
  const [parsedData, setParsedData] = useState<ParsedVoiceResult | null>(null);

  // Editable fields in the Safety Gate
  const [editableWaterMl, setEditableWaterMl] = useState<number>(0);
  const [editableLateNight, setEditableLateNight] = useState<boolean>(false);
  const [editableBmOccurred, setEditableBmOccurred] = useState<boolean>(false);
  const [editableBmDetails, setEditableBmDetails] = useState<string>('');
  const [editableTasks, setEditableTasks] = useState<
    Array<{ id: string; task: string; completed: boolean; notes: string }>
  >([]);
  const [editableMood, setEditableMood] = useState<string>('');
  const [editableOccurrences, setEditableOccurrences] = useState<string[]>([]);
  const [editableHealthChanges, setEditableHealthChanges] = useState<string[]>([]);
  const [editableClinicalSummary, setEditableClinicalSummary] = useState<string>('');

  // Speech Recognition ref
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      setPhase('dictating');
      setTranscript('');
      setIsRecording(false);
      setParsedData(null);
      setErrorMessage(null);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    }
  }, [isOpen]);

  const startSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(
        'Live speech recognition is not supported in this browser. You can type or use the clinical voice presets below.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        setTranscript(currentTranscript.trim());
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access blocked. Please grant microphone permission.');
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsRecording(false);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  const handleApplySample = (sampleText: string) => {
    stopSpeechRecognition();
    setTranscript(sampleText);
  };

  // Submit transcript to Gemini Voice-to-Sort API
  const handleProcessAI = async () => {
    if (!transcript.trim()) {
      setErrorMessage('Please dictate or enter your shift note first.');
      return;
    }

    stopSpeechRecognition();
    setPhase('processing');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/ai/voice-to-sort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          caregiverName: activeCaregiver.name,
          clientName,
        }),
      });

      const res = await response.json();
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to parse dictation');
      }

      const data: ParsedVoiceResult = res.data;
      setParsedData(data);

      // Initialize Safety Gate review fields
      setEditableWaterMl(data.metrics.waterIntakeMl || 0);
      setEditableLateNight(data.metrics.isAfter630PM || false);
      setEditableBmOccurred(data.metrics.bmOccurred || false);
      setEditableBmDetails(data.metrics.bmDetails || '');
      setEditableTasks(
        data.routineTasks.map((t, idx) => ({
          id: `task-${idx}`,
          task: t.task,
          completed: t.completed,
          notes: t.notes,
        }))
      );
      setEditableMood(data.narrative.mood || 'Stable and pleasant');
      setEditableOccurrences(data.narrative.newOccurrences || []);
      setEditableHealthChanges(data.narrative.healthChanges || []);
      setEditableClinicalSummary(data.clinicalSummary || '');

      setPhase('review_gate');
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Could not process voice dictation with AI. Please retry.');
      setPhase('dictating');
    }
  };

  // Toggle routine task completion in Safety Gate
  const toggleTask = (index: number) => {
    setEditableTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, completed: !t.completed } : t))
    );
  };

  // Final confirmation to commit into care binder
  const handleApproveAndSave = () => {
    if (!parsedData) return;

    const newLog: Omit<LogEntry, 'id'> = {
      timestamp: new Date().toISOString(),
      caregiverId: activeCaregiver.id,
      caregiverName: activeCaregiver.name,
      category: parsedData.incidentDetected ? 'incident' : 'combined_shift',
      content: editableClinicalSummary || `Shift summary: ${editableWaterMl}ml fluids, Mood: ${editableMood}`,
      rawTranscript: transcript,
      metrics: {
        waterIntakeMl: editableWaterMl,
        waterLogTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAfter630PM: editableLateNight,
        bmOccurred: editableBmOccurred,
        bmDetails: editableBmDetails,
      },
      routineTasks: editableTasks,
      narrative: {
        mood: editableMood,
        newOccurrences: editableOccurrences,
        healthChanges: editableHealthChanges,
      },
      incident: parsedData.incidentDetected
        ? {
            id: `inc-${Date.now()}`,
            type: 'other',
            severity: parsedData.incidentSeverity === 'none' ? 'medium' : parsedData.incidentSeverity,
            description: parsedData.incidentSummary || 'Caregiver voice log flagged an incident',
            immediateAction: 'Caregiver reported via voice-to-sort safety triage',
            notifiedHeadNurse: true,
            timestamp: new Date().toISOString(),
            caregiverName: activeCaregiver.name,
          }
        : undefined,
      isConfirmedByCaregiver: true,
      syncStatus: 'synced',
    };

    onConfirmSaveLog(newLog);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Voice-to-Sort AI Engine</h2>
              <p className="text-xs text-slate-400">
                {phase === 'review_gate'
                  ? 'Mandatory Safety Gate: Review & Confirm Categorized Data'
                  : 'Dictate shift observations without paper binders'}
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

        {/* Modal Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Phase 1: Dictating */}
          {phase === 'dictating' && (
            <div className="space-y-5">
              {/* Central Mic Button */}
              <div className="flex flex-col items-center justify-center py-4">
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all shadow-lg ${
                    isRecording
                      ? 'bg-red-600 scale-105 ring-8 ring-red-100 animate-pulse'
                      : 'bg-teal-700 hover:bg-teal-800 ring-4 ring-teal-50 active:scale-95'
                  }`}
                  title={isRecording ? 'Click to stop recording' : 'Click to start speaking'}
                >
                  {isRecording ? <MicOff className="w-9 h-9" /> : <Mic className="w-9 h-9" />}
                </button>
                <p className="mt-3 text-xs font-semibold text-slate-700">
                  {isRecording ? 'Listening... Speak your shift report' : 'Tap Microphone to Speak'}
                </p>
                <p className="text-[11px] text-slate-400">
                  Mention water (ml/oz), BM, medications, creams, and Arthur's mood
                </p>
              </div>

              {/* Dictation Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Dictation Transcript (Speech or Edit)</span>
                  {transcript && (
                    <button
                      onClick={() => setTranscript('')}
                      className="text-[11px] text-slate-400 hover:text-slate-600"
                    >
                      Clear
                    </button>
                  )}
                </label>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Example: Gave Arthur his morning meds with 300ml cranberry juice. Applied barrier cream to sacrum. Formed normal BM at 10am. Mood was cheerful, no skin tears..."
                  rows={4}
                  className="w-full p-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all placeholder-slate-400"
                />
              </div>

              {/* Clinical Presets for Rapid Evaluation */}
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-2">
                  Clinical Audio Presets (One-click evaluation):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SAMPLE_DICTATIONS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplySample(sample.text)}
                      className="p-2.5 text-left border border-slate-200 rounded-xl bg-slate-50/70 hover:bg-teal-50/60 hover:border-teal-200 transition-all group"
                    >
                      <p className="text-xs font-bold text-slate-800 group-hover:text-teal-900">
                        {sample.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {sample.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Process Button */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProcessAI}
                  disabled={!transcript.trim()}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-teal-300" />
                  <span>Process with Clinical AI</span>
                </button>
              </div>
            </div>
          )}

          {/* Phase 2: Processing Spinner */}
          {phase === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-700 rounded-full animate-spin" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Clinical AI Parsing in Progress...
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Extracting hydration volume, bowel movement, routine task checklist, and clinical narrative.
                </p>
              </div>
            </div>
          )}

          {/* Phase 3: The Mandatory Safety Gate ("Review & Confirm" Screen) */}
          {phase === 'review_gate' && parsedData && (
            <div className="space-y-5">
              {/* Safety Gate Banner */}
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-teal-900">Clinical Safety Gate Active:</span>
                  <p className="text-teal-800 mt-0.5">
                    Caregiver must review each extracted category before saving to Arthur's binder. Adjust any values if needed.
                  </p>
                </div>
              </div>

              {/* Category 1: Metrics (Water & BM) */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    1. Extracted Clinical Metrics
                  </span>
                  <span className="text-[11px] text-teal-700 font-semibold">Editable</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Fluid Intake */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-blue-600" />
                        <span>Fluid Intake Volume</span>
                      </label>
                      <span className="text-[11px] font-mono text-slate-400">oz & ml</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.5"
                            value={Math.round((editableWaterMl / 29.57) * 10) / 10}
                            onChange={(e) => {
                              const oz = parseFloat(e.target.value) || 0;
                              setEditableWaterMl(Math.round(oz * 29.57));
                            }}
                            className="w-16 px-2 py-1 text-sm font-mono font-bold border border-slate-300 rounded text-slate-900"
                          />
                          <span className="text-xs font-bold text-slate-700">oz</span>
                        </div>
                        <span className="text-slate-400">·</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editableWaterMl}
                            onChange={(e) => setEditableWaterMl(parseInt(e.target.value, 10) || 0)}
                            className="w-20 px-2 py-1 text-sm font-mono font-bold border border-slate-300 rounded text-slate-900"
                          />
                          <span className="text-xs text-slate-500">ml</span>
                        </div>
                      </div>
                      <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editableLateNight}
                          onChange={(e) => setEditableLateNight(e.target.checked)}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span>Post-6:30 PM (Nocturia Risk)</span>
                      </label>
                    </div>
                  </div>

                  {/* Bowel Movement */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        <span>Bowel Movement Logged</span>
                      </label>
                    </div>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-800">
                        <input
                          type="checkbox"
                          checked={editableBmOccurred}
                          onChange={(e) => setEditableBmOccurred(e.target.checked)}
                          className="rounded text-amber-800 focus:ring-amber-700"
                        />
                        <span>BM occurred on this shift</span>
                      </label>
                      {editableBmOccurred && (
                        <input
                          type="text"
                          value={editableBmDetails}
                          onChange={(e) => setEditableBmDetails(e.target.value)}
                          placeholder="Consistency / Bristol description"
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded text-slate-800"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Category 2: Routine Tasks Checklist */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                  2. Routine Tasks Checklist
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {editableTasks.map((t, index) => (
                    <div
                      key={t.id}
                      onClick={() => toggleTask(index)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-start gap-2 transition-colors ${
                        t.completed
                          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-emerald-600 pointer-events-none"
                      />
                      <div>
                        <p className="font-bold">{t.task}</p>
                        <p className="text-[11px] opacity-80">{t.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category 3: Narrative (Mood & Changes) */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                  3. Narrative & Clinical Observations
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                      Mood / Affect
                    </span>
                    <input
                      type="text"
                      value={editableMood}
                      onChange={(e) => setEditableMood(e.target.value)}
                      className="w-full text-xs font-medium text-slate-800 border-b border-slate-200 pb-0.5 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 sm:col-span-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                      New Occurrences & Skin Status
                    </span>
                    <input
                      type="text"
                      value={editableOccurrences.join('; ')}
                      onChange={(e) =>
                        setEditableOccurrences(e.target.value.split(';').map((s) => s.trim()))
                      }
                      className="w-full text-xs font-medium text-slate-800 border-b border-slate-200 pb-0.5 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                {/* Clinical handover summary */}
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    AI Clinical Shift Summary
                  </span>
                  <textarea
                    value={editableClinicalSummary}
                    onChange={(e) => setEditableClinicalSummary(e.target.value)}
                    rows={2}
                    className="w-full text-xs text-slate-800 border border-slate-200 rounded p-2 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Raw Transcript View for Audit Comparison */}
              <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600 border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">
                  Original Voice Audio Transcript (Preserved for Head Nurse Audit Trail):
                </span>
                <p className="italic text-slate-600 line-clamp-2">"{transcript}"</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setPhase('dictating')}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Re-dictate</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApproveAndSave}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>Approve & Save to Binder</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
