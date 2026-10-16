import React, { useState } from 'react';
import { ProtocolPin, CaregiverProfile } from '../types';
import { Paperclip, Check, Plus, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ProtocolOrderMemoProps {
  protocols: ProtocolPin[];
  activeCaregiver: CaregiverProfile;
  isHeadNurse: boolean;
  onAcknowledgeProtocol: (protocolId: string) => void;
  onAddProtocol?: (title: string, content: string, priority: 'routine' | 'high' | 'urgent') => void;
}

export const ProtocolOrderMemo: React.FC<ProtocolOrderMemoProps> = ({
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
    <div className="relative bg-amber-100/90 border-2 border-amber-300 rounded-2xl p-4 shadow-md text-amber-950">
      {/* Visual Paperclip Decoration */}
      <div className="absolute -top-3 left-6 text-slate-500 transform -rotate-12">
        <Paperclip className="w-6 h-6 text-slate-600" />
      </div>

      <div className="flex items-center justify-between gap-3 mb-3 pl-8">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-black tracking-widest uppercase font-mono text-amber-900">
              HEAD NURSE CLINICAL DIRECTIVE MEMO
            </h2>
            <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded border border-amber-300 font-mono">
              {activeProtocols.length} Orders Pinned
            </span>
          </div>
          <p className="text-[11px] text-amber-800">
            Issued by Margaret Brady, RN. Mandatory standing orders across shifts.
          </p>
        </div>

        {isHeadNurse && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs font-bold text-slate-900 bg-amber-300 hover:bg-amber-400 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Pin Order</span>
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} className="mb-3 p-3 bg-white/90 rounded-xl border border-amber-300 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Order Title (e.g. Heel Float Protocol)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="sm:col-span-2 px-2.5 py-1.5 text-xs border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
              required
            />
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs border border-amber-300 rounded-lg focus:outline-none"
            >
              <option value="routine">Routine</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <textarea
            placeholder="Clinical order instructions..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={2}
            className="w-full px-2.5 py-1.5 text-xs border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-2.5 py-1 text-xs text-amber-800 hover:text-amber-950"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-xs font-bold bg-amber-900 text-white rounded-lg"
            >
              Broadcast Order
            </button>
          </div>
        </form>
      )}

      {/* Pinned Orders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {activeProtocols.map((protocol) => {
          const isAck = protocol.acknowledgedBy.some(
            (a) => a.caregiverId === activeCaregiver.id
          );

          return (
            <div
              key={protocol.id}
              className={`p-3 rounded-xl border transition-all ${
                isAck
                  ? 'bg-amber-50/70 border-amber-300/80 text-amber-900'
                  : 'bg-white border-amber-400 text-slate-900 shadow-xs ring-1 ring-amber-400'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                      protocol.priority === 'urgent'
                        ? 'bg-red-600 text-white'
                        : 'bg-amber-800 text-white'
                    }`}
                  >
                    {protocol.priority}
                  </span>
                  <h3 className="text-xs font-bold">{protocol.title}</h3>
                </div>

                {isAck ? (
                  <span className="text-[10px] text-emerald-800 font-bold flex items-center gap-0.5 bg-emerald-100 px-1.5 py-0.5 rounded">
                    <Check className="w-3 h-3" />
                    <span>Ack'd</span>
                  </span>
                ) : (
                  <button
                    onClick={() => onAcknowledgeProtocol(protocol.id)}
                    className="text-[11px] font-bold bg-amber-900 hover:bg-black text-white px-2 py-0.5 rounded transition-colors shadow-xs"
                  >
                    Acknowledge
                  </button>
                )}
              </div>

              <p className="text-xs leading-relaxed opacity-90">{protocol.content}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
