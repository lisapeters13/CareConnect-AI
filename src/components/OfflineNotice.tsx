import React from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

interface OfflineNoticeProps {
  isOnline: boolean;
  pendingSyncCount: number;
  onSimulateToggle: () => void;
  onSyncNow: () => void;
}

export const OfflineNotice: React.FC<OfflineNoticeProps> = ({
  isOnline,
  pendingSyncCount,
  onSimulateToggle,
  onSyncNow,
}) => {
  return (
    <div className="bg-slate-900 text-white px-4 py-2 text-xs border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold">Clinical Cloud Synced</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-400">
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold">
                Offline Mode Active — Data cached in local secure storage
              </span>
            </div>
          )}

          {pendingSyncCount > 0 && (
            <span className="text-amber-300 font-mono">
              ({pendingSyncCount} entry queued for automatic upload)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {pendingSyncCount > 0 && isOnline && (
            <button
              onClick={onSyncNow}
              className="px-2.5 py-1 text-[11px] font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 rounded flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Sync Now</span>
            </button>
          )}

          <button
            onClick={onSimulateToggle}
            className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
            title="Toggle simulated network drop to test local storage queue"
          >
            {isOnline ? 'Simulate WiFi Drop' : 'Restore Connection'}
          </button>
        </div>
      </div>
    </div>
  );
};
