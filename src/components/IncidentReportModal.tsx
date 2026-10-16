import React, { useState } from 'react';
import { CaregiverProfile, IncidentRecord, LogEntry } from '../types';
import { AlertTriangle, Bell, ShieldAlert, Check } from 'lucide-react';

interface IncidentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCaregiver: CaregiverProfile;
  clientName: string;
  onReportIncident: (incident: IncidentRecord, logEntry: Omit<LogEntry, 'id'>) => void;
}

export const IncidentReportModal: React.FC<IncidentReportModalProps> = ({
  isOpen,
  onClose,
  activeCaregiver,
  clientName,
  onReportIncident,
}) => {
  const [type, setType] = useState<'fall' | 'skin_tear' | 'med_refusal' | 'behavioral' | 'other'>('fall');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [description, setDescription] = useState('');
  const [immediateAction, setImmediateAction] = useState('');
  const [vitalsNotes, setVitalsNotes] = useState('');
  const [notifiedNurse, setNotifiedNurse] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !immediateAction.trim()) return;

    const timestamp = new Date().toISOString();
    const incident: IncidentRecord = {
      id: `inc-${Date.now()}`,
      type,
      severity,
      description: description.trim(),
      immediateAction: `${immediateAction.trim()}${vitalsNotes ? ` | Vitals: ${vitalsNotes.trim()}` : ''}`,
      notifiedHeadNurse: notifiedNurse,
      timestamp,
      caregiverName: activeCaregiver.name,
    };

    const logEntry: Omit<LogEntry, 'id'> = {
      timestamp,
      caregiverId: activeCaregiver.id,
      caregiverName: activeCaregiver.name,
      category: 'incident',
      content: `[URGENT RED FLAG: ${type.toUpperCase()}] ${description.trim()}. Immediate action: ${immediateAction.trim()}`,
      rawTranscript: `Incident Report filed directly: ${type} - ${description.trim()}`,
      incident,
      isConfirmedByCaregiver: true,
      syncStatus: 'synced',
    };

    onReportIncident(incident, logEntry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border-2 border-red-300 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-red-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Red Flag Incident Report</h2>
              <p className="text-xs text-red-100">
                Pushes immediate alert to Head Nurse & pins to top of team feed
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-red-200 hover:text-white text-xl leading-none px-2"
          >
            ×
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Incident Type */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Incident Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'fall', label: 'Fall / Slip' },
                { id: 'skin_tear', label: 'Skin Tear' },
                { id: 'med_refusal', label: 'Refused Meds' },
                { id: 'behavioral', label: 'Aggression' },
                { id: 'choking', label: 'Choking' },
                { id: 'other', label: 'Other Concern' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setType(item.id as any)}
                  className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                    type === item.id
                      ? 'bg-red-50 text-red-800 border-red-300 ring-2 ring-red-200'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clinical Severity */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Severity Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['low', 'medium', 'high', 'critical'] as const).map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverity(sev)}
                  className={`py-1.5 text-xs font-bold rounded-lg uppercase tracking-wider border transition-all ${
                    severity === sev
                      ? sev === 'critical'
                        ? 'bg-red-900 text-white border-red-900 shadow-sm'
                        : sev === 'high'
                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                        : 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Factual Incident Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State exactly what occurred, time, location, and Arthur's condition..."
              rows={3}
              required
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          {/* Immediate Action Taken */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Immediate Action Taken & First Aid *
            </label>
            <textarea
              value={immediateAction}
              onChange={(e) => setImmediateAction(e.target.value)}
              placeholder="e.g., Assisted safely to bed, inspected for injuries, applied ice pack, vitals checked..."
              rows={2}
              required
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          {/* Vitals */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Vitals Check (optional)
            </label>
            <input
              type="text"
              value={vitalsNotes}
              onChange={(e) => setVitalsNotes(e.target.value)}
              placeholder="e.g. BP 138/84, Pulse 76, Pupils equal & reactive"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          {/* Notification Checkbox */}
          <div className="p-3 bg-red-50 rounded-xl border border-red-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-red-600" />
              <span className="text-xs font-semibold text-red-900">
                Dispatch Urgent Push Alert to Head Nurse Brenda Hall
              </span>
            </div>
            <input
              type="checkbox"
              checked={notifiedNurse}
              onChange={(e) => setNotifiedNurse(e.target.checked)}
              className="rounded text-red-600 focus:ring-red-500 h-4 w-4"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Broadcast Red Flag Incident</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
