import React, { useState } from 'react';
import { ProtocolPin, CaregiverProfile } from '../types';
import { Pin, CheckCircle, AlertTriangle, ShieldCheck, Plus, Check } from 'lucide-react';

interface ProtocolPinsSectionProps {
  protocols: ProtocolPin[];
  activeCaregiver: CaregiverProfile;
  isHeadNurse: boolean;
  onAcknowledgeProtocol: (protocolId: string) => void;
  onAddProtocol?: (title: string, content: string, priority: 'routine' | 'high' | 'urgent') => void;
}

export const ProtocolPinsSection: React.FC<ProtocolPinsSectionProps> = ({
  protocols,
  activeCaregiver,
  isHeadNurse,
  onAcknowledgeProtocol,
  onAddProtocol,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newPriority, setNewPriority] = useState<'routine' | 'high' | 'urgent'>('high');

  const activeProtocols = protocols.filter((p) => p.status === 'active');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    if (onAddProtocol) {
      onAddProtocol(newTitle.trim(), newContent.trim(), newPriority);
    }
    setNewTitle('');
    setNewContent('');
    setShowAddForm(false);
  };

  return (
    <section className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm border border-slate-800">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
            <Pin className="w-4 h-4 rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Head Nurse Protocol Pins
              </h2>
              <span className="text-[11px] font-mono text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800">
                {activeProtocols.length} Active Directives
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Mandatory standing orders. Remain pinned until acknowledged by caregiver.
            </p>
          </div>
        </div>

        {isHeadNurse && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs font-semibold text-slate-900 bg-teal-400 hover:bg-teal-300 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Pin New Protocol</span>
          </button>
        )}
      </div>

      {/* Head Nurse Add Protocol Form */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="mb-4 p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-3">
          <h3 className="text-xs font-bold text-teal-300 uppercase tracking-wider">
            Issue Global Clinical Order
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Protocol Title (e.g. Skin Tear Dressing Order)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="sm:col-span-2 px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
              required
            />
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as any)}
              className="px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-400"
            >
              <option value="routine">Routine Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent Priority</option>
            </select>
          </div>
          <textarea
            placeholder="Clinical instructions for veteran caregivers..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg"
            >
              Broadcast Pin
            </button>
          </div>
        </form>
      )}

      {/* Protocol Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {activeProtocols.map((protocol) => {
          const isAcknowledgedByCurrent = protocol.acknowledgedBy.some(
            (ack) => ack.caregiverId === activeCaregiver.id
          );

          let priorityBadge = 'bg-slate-800 text-slate-300 border-slate-700';
          if (protocol.priority === 'urgent') {
            priorityBadge = 'bg-rose-950/80 text-rose-300 border-rose-800';
          } else if (protocol.priority === 'high') {
            priorityBadge = 'bg-amber-950/80 text-amber-300 border-amber-800';
          }

          return (
            <div
              key={protocol.id}
              className={`p-4 rounded-xl border transition-all ${
                isAcknowledgedByCurrent
                  ? 'bg-slate-800/50 border-slate-800'
                  : 'bg-slate-800/90 border-teal-500/40 ring-1 ring-teal-500/20'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${priorityBadge}`}>
                      {protocol.priority}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      by {protocol.createdBy}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">
                    {protocol.title}
                  </h3>
                </div>

                {isAcknowledgedByCurrent ? (
                  <span className="shrink-0 text-emerald-400 text-[11px] font-semibold flex items-center gap-1 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800">
                    <Check className="w-3.5 h-3.5" />
                    <span>Acknowledged</span>
                  </span>
                ) : (
                  <button
                    onClick={() => onAcknowledgeProtocol(protocol.id)}
                    className="shrink-0 px-2.5 py-1 text-xs font-bold bg-teal-400 hover:bg-teal-300 text-slate-950 rounded-lg flex items-center gap-1 transition-colors active:scale-95 shadow-sm"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Acknowledge</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {protocol.content}
              </p>

              {/* Acknowledgments list */}
              {protocol.acknowledgedBy.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center gap-1.5 text-[11px] text-slate-400 flex-wrap">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Confirmed by:</span>
                  {protocol.acknowledgedBy.map((ack, idx) => (
                    <span key={idx} className="text-slate-300 font-medium">
                      {ack.caregiverName}
                      {idx < protocol.acknowledgedBy.length - 1 ? ',' : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
