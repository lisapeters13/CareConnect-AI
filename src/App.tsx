import React, { useState, useEffect } from 'react';
import {
  Role,
  CaregiverProfile,
  ResidentProfile,
  ProtocolPin,
  LiquidEntry,
  BowelMovementEntry,
  LogEntry,
  IncidentRecord,
  RoutineTaskItem,
} from './types';
import {
  INITIAL_RESIDENT,
  INITIAL_CAREGIVERS,
  INITIAL_PROTOCOLS,
  INITIAL_LIQUID_ENTRIES,
  INITIAL_BM_ENTRIES,
  INITIAL_LOGS,
  TODAY_KEY,
  formatDateKey,
} from './data/mockData';
import { TopNav } from './components/TopNav';
import { ResidentHeader } from './components/ResidentHeader';
import { ShiftNotepadDiary } from './components/ShiftNotepadDiary';
import { InputOutputSheet } from './components/InputOutputSheet';
import { ProtocolOrderMemo } from './components/ProtocolOrderMemo';
import { VoiceToSortModal } from './components/VoiceToSortModal';
import { HandoverBriefingModal } from './components/HandoverBriefingModal';
import { IncidentReportModal } from './components/IncidentReportModal';
import { HeadNurseDashboard } from './components/HeadNurseDashboard';
import { OfflineNotice } from './components/OfflineNotice';
import { mlToOz, ozToMl } from './utils/units';
import { AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';

const INITIAL_ROUTINE_TASKS: RoutineTaskItem[] = [
  { id: 'rt-1', task: 'Morning Meds & Full Ensure Given', completed: true, notes: 'Given with 8 oz juice & morning pills' },
  { id: 'rt-2', task: 'Shoes on for Highchair Transfer', completed: true, notes: 'Always put shoes on Mrs. Brimberg' },
  { id: 'rt-3', task: 'Depend Brief Changed & Skin Cleansed', completed: true, notes: 'Peri area cleansed thoroughly' },
  { id: 'rt-4', task: 'Barrier Cream Applied Between Buttocks', completed: true, notes: 'Thick layer applied after brief change' },
  { id: 'rt-5', task: 'Bristol Stool Chart Scored (Type 6 recorded)', completed: true, notes: 'Mushy stool logged at 7:25 PM' },
  { id: 'rt-6', task: 'PM Pills (2x PM pills, 1x Colace with 6 oz water)', completed: true, notes: 'Swallowed without difficulty' },
  { id: 'rt-7', task: 'Evening Hydration Tracked (3 bottles + 2x prune juice)', completed: true, notes: 'Frontloaded before 5:30 PM' },
];

export default function App() {
  // 1. Roles & Navigation
  const [currentRole, setCurrentRole] = useState<Role>('caregiver');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'diary' | 'head_nurse'>('dashboard');

  // 2. Date Navigation for Notepad & Historical Flowsheet
  const [selectedDateKey, setSelectedDateKey] = useState<string>(() => formatDateKey(new Date()));
  const isToday = selectedDateKey === formatDateKey(new Date());

  // 3. Persistent State with LocalStorage backing
  const [resident, setResident] = useState<ResidentProfile>(() => {
    const saved = localStorage.getItem('irishcare_resident');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name && parsed.name.includes('Brimberg') && parsed.room?.includes('Park')) return parsed;
      } catch (_) {}
    }
    return INITIAL_RESIDENT;
  });

  const [caregivers, setCaregivers] = useState<CaregiverProfile[]>(() => {
    const saved = localStorage.getItem('irishcare_caregivers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((c) => c.name?.includes('Lisa Peters'))) return parsed;
      } catch (_) {}
    }
    return INITIAL_CAREGIVERS;
  });

  const [activeCaregiverId, setActiveCaregiverId] = useState<string>('cg-lisa');

  const [protocols, setProtocols] = useState<ProtocolPin[]>(() => {
    const saved = localStorage.getItem('irishcare_protocols');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((p) => p.createdBy?.includes('Margaret Brady'))) return parsed;
      } catch (_) {}
    }
    return INITIAL_PROTOCOLS;
  });

  const [routineTasks, setRoutineTasks] = useState<RoutineTaskItem[]>(() => {
    const saved = localStorage.getItem('irishcare_routine_tasks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((t) => t.task && (t.task.includes('Highchair') || t.task.includes('Ensure') || t.task.includes('Bristol')))) {
          return parsed;
        }
      } catch (_) {}
    }
    return INITIAL_ROUTINE_TASKS;
  });

  const [liquidEntries, setLiquidEntries] = useState<(LiquidEntry & { dateKey?: string })[]>(() => {
    const saved = localStorage.getItem('irishcare_liquids');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (_) {}
    }
    return INITIAL_LIQUID_ENTRIES;
  });

  const [bmEntries, setBmEntries] = useState<(BowelMovementEntry & { dateKey?: string })[]>(() => {
    const saved = localStorage.getItem('irishcare_bm');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (_) {}
    }
    return INITIAL_BM_ENTRIES;
  });

  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem('irishcare_logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((l) => l.caregiverName?.includes('Lisa') || l.content?.includes('Brimberg'))) {
          return parsed;
        }
      } catch (_) {}
    }
    return INITIAL_LOGS;
  });

  // 4. Offline Mode & Network Listeners
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(false);
  const effectiveOnline = isOnline && !simulatedOffline;

  // 5. Modals State
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);

  // Active toast/alert message
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'alert' | 'urgent';
  } | null>(null);

  // Sync state to local storage (resilient data saving)
  useEffect(() => {
    localStorage.setItem('irishcare_resident', JSON.stringify(resident));
  }, [resident]);

  useEffect(() => {
    localStorage.setItem('irishcare_caregivers', JSON.stringify(caregivers));
  }, [caregivers]);

  useEffect(() => {
    localStorage.setItem('irishcare_protocols', JSON.stringify(protocols));
  }, [protocols]);

  useEffect(() => {
    localStorage.setItem('irishcare_routine_tasks', JSON.stringify(routineTasks));
  }, [routineTasks]);

  useEffect(() => {
    localStorage.setItem('irishcare_liquids', JSON.stringify(liquidEntries));
  }, [liquidEntries]);

  useEffect(() => {
    localStorage.setItem('irishcare_bm', JSON.stringify(bmEntries));
  }, [bmEntries]);

  useEffect(() => {
    localStorage.setItem('irishcare_logs', JSON.stringify(logs));
  }, [logs]);

  // Handle Online/Offline window events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showToast = (text: string, type: 'success' | 'alert' | 'urgent' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const activeCaregiver =
    caregivers.find((c) => c.id === activeCaregiverId) || caregivers[0];

  const pendingSyncLogs = logs.filter((l) => l.syncStatus === 'pending_sync');

  // Date navigation helpers
  const handlePrevDay = () => {
    const [y, m, d] = selectedDateKey.split('-').map(Number);
    const cur = new Date(y, m - 1, d);
    cur.setDate(cur.getDate() - 1);
    setSelectedDateKey(formatDateKey(cur));
  };

  const handleNextDay = () => {
    const [y, m, d] = selectedDateKey.split('-').map(Number);
    const cur = new Date(y, m - 1, d);
    cur.setDate(cur.getDate() + 1);
    setSelectedDateKey(formatDateKey(cur));
  };

  const handleToday = () => {
    setSelectedDateKey(formatDateKey(new Date()));
  };

  const getFormattedDateLabel = (dateKey: string) => {
    const [y, m, d] = dateKey.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const isSelectedToday = dateKey === formatDateKey(new Date());
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    const str = date.toLocaleDateString('en-US', options);
    return isSelectedToday ? `Today (${str})` : str;
  };

  // Toggle Routine Task Checkmark
  const handleToggleTask = (taskId: string) => {
    setRoutineTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
    const task = routineTasks.find((t) => t.id === taskId);
    if (task) {
      showToast(
        !task.completed ? `Checked off: ${task.task}` : `Unchecked: ${task.task}`,
        'success'
      );
    }
  };

  const handleAddTask = (taskName: string) => {
    const newTask: RoutineTaskItem = {
      id: `rt-${Date.now()}`,
      task: taskName,
      completed: false,
      notes: `Added by ${activeCaregiver.name}`,
    };
    setRoutineTasks((prev) => [...prev, newTask]);
    showToast(`Added routine task to shift notepad.`, 'success');
  };

  // Quick Pen Note written directly on the pad (tagged to active date)
  const handleQuickAddNote = (content: string) => {
    const now = new Date();
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      dateStr: selectedDateKey,
      timestamp: now.toISOString(),
      timeLabel: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      caregiverId: activeCaregiver.id,
      caregiverName: activeCaregiver.name,
      category: 'narrative',
      content,
      rawTranscript: `Written on pad by ${activeCaregiver.name}: ${content}`,
      isConfirmedByCaregiver: true,
      syncStatus: effectiveOnline ? 'synced' : 'pending_sync',
    };
    setLogs((prev) => [newLog, ...prev]);
    showToast(`Note written onto Mrs. Brimberg's notepad (${selectedDateKey}).`, 'success');
  };

  // Liquid Handlers (measured in oz and ml, tagged to active 24-hr cycle)
  const handleAddLiquid = (newEntry: Omit<LiquidEntry, 'id'> & { dateKey?: string }) => {
    const volumeOz = newEntry.volumeOz || mlToOz(newEntry.volumeMl);
    const entry: LiquidEntry & { dateKey?: string } = {
      ...newEntry,
      dateKey: selectedDateKey,
      volumeOz,
      id: `liq-${Date.now()}`,
    };
    setLiquidEntries((prev) => [...prev, entry]);

    // Also write a clinical note to the notepad diary!
    const logItem: LogEntry = {
      id: `log-liq-${Date.now()}`,
      dateStr: selectedDateKey,
      timestamp: entry.timestamp,
      timeLabel: entry.loggedAtTime,
      caregiverId: activeCaregiver.id,
      caregiverName: activeCaregiver.name,
      category: 'water',
      content: `Intake: Provided ${volumeOz} oz (${entry.volumeMl} ml) of ${entry.beverage}.${
        entry.isAfter630PM ? ' [Post-6:30 PM Nocturia Warning]' : ''
      }`,
      metrics: {
        waterIntakeMl: entry.volumeMl,
        waterIntakeOz: volumeOz,
        waterLogTime: entry.loggedAtTime,
        isAfter630PM: entry.isAfter630PM,
      },
      isConfirmedByCaregiver: true,
      syncStatus: effectiveOnline ? 'synced' : 'pending_sync',
    };
    setLogs((prev) => [logItem, ...prev]);

    if (entry.isAfter630PM) {
      showToast(
        `Logged ${volumeOz} oz (${entry.volumeMl} ml). Nocturia warning: Liquid consumed post-6:30 PM!`,
        'alert'
      );
    } else {
      showToast(
        `Logged ${volumeOz} oz (${entry.volumeMl} ml) ${entry.beverage} to I&O sheet.`,
        'success'
      );
    }
  };

  // BM Handlers (tagged to active date)
  const handleAddBM = (newBM: Omit<BowelMovementEntry, 'id'> & { dateKey?: string }) => {
    const entry: BowelMovementEntry & { dateKey?: string } = {
      ...newBM,
      dateKey: selectedDateKey,
      id: `bm-${Date.now()}`,
    };
    setBmEntries((prev) => [...prev, entry]);

    // Also write to notepad diary
    const logItem: LogEntry = {
      id: `log-bm-${Date.now()}`,
      dateStr: selectedDateKey,
      timestamp: entry.timestamp,
      caregiverId: activeCaregiver.id,
      caregiverName: activeCaregiver.name,
      category: 'bm',
      content: `Output: Bowel Movement recorded - ${entry.consistency}, ${entry.amount} amount. ${entry.notes || ''}`,
      metrics: {
        bmOccurred: true,
        bmDetails: `${entry.consistency}`,
      },
      isConfirmedByCaregiver: true,
      syncStatus: effectiveOnline ? 'synced' : 'pending_sync',
    };
    setLogs((prev) => [logItem, ...prev]);
    showToast(`BM recorded on I&O sheet. Timer reset.`, 'success');
  };

  // Protocol Acknowledgment
  const handleAcknowledgeProtocol = (protocolId: string) => {
    setProtocols((prev) =>
      prev.map((p) => {
        if (p.id === protocolId) {
          const alreadyAck = p.acknowledgedBy.some((a) => a.caregiverId === activeCaregiver.id);
          if (alreadyAck) return p;
          return {
            ...p,
            acknowledgedBy: [
              ...p.acknowledgedBy,
              {
                caregiverId: activeCaregiver.id,
                caregiverName: activeCaregiver.name,
                timestamp: new Date().toISOString(),
              },
            ],
          };
        }
        return p;
      })
    );
    showToast(`Head Nurse directive acknowledged by ${activeCaregiver.name}.`, 'success');
  };

  const handleAddProtocol = (
    title: string,
    content: string,
    priority: 'routine' | 'high' | 'urgent'
  ) => {
    const newP: ProtocolPin = {
      id: `proto-${Date.now()}`,
      title,
      content,
      createdBy: 'Margaret Brady, RN',
      createdAt: new Date().toISOString(),
      priority,
      status: 'active',
      acknowledgedBy: [],
    };
    setProtocols((prev) => [newP, ...prev]);
    showToast(`New directive memo from Margaret Brady pinned to binder!`, 'success');
  };

  const handleArchiveProtocol = (id: string) => {
    setProtocols((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'archived' } : p))
    );
    showToast(`Directive archived.`, 'success');
  };

  // Voice-to-Sort Safety Gate Save Log
  const handleConfirmSaveLog = (newLog: Omit<LogEntry, 'id'>) => {
    const logItem: LogEntry = {
      ...newLog,
      id: `log-${Date.now()}`,
      dateStr: selectedDateKey,
      caregiverId: activeCaregiver.id,
      caregiverName: activeCaregiver.name,
      syncStatus: effectiveOnline ? 'synced' : 'pending_sync',
    };

    // If fluid intake was included, add to liquid entries
    if (newLog.metrics?.waterIntakeMl && newLog.metrics.waterIntakeMl > 0) {
      const volumeOz = mlToOz(newLog.metrics.waterIntakeMl);
      const liq: LiquidEntry & { dateKey?: string } = {
        id: `liq-${Date.now()}`,
        dateKey: selectedDateKey,
        volumeMl: newLog.metrics.waterIntakeMl,
        volumeOz,
        beverage: 'Fluids dictated via voice',
        timestamp: newLog.timestamp,
        loggedAtTime:
          newLog.metrics.waterLogTime ||
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAfter630PM: newLog.metrics.isAfter630PM || false,
        caregiverName: activeCaregiver.name,
      };
      setLiquidEntries((prev) => [...prev, liq]);
    }

    // If BM was documented, update BM entries
    if (newLog.metrics?.bmOccurred) {
      const bm: BowelMovementEntry & { dateKey?: string } = {
        id: `bm-${Date.now()}`,
        dateKey: selectedDateKey,
        timestamp: newLog.timestamp,
        bristolScale: 4,
        consistency: newLog.metrics.bmDetails || 'Normal bowel movement',
        amount: 'moderate',
        notes: newLog.content,
        caregiverName: activeCaregiver.name,
      };
      setBmEntries((prev) => [...prev, bm]);
    }

    // Auto check off any routine tasks that were completed
    if (newLog.routineTasks && newLog.routineTasks.length > 0) {
      setRoutineTasks((prev) =>
        prev.map((t) => {
          const matched = newLog.routineTasks?.find((rt) =>
            rt.task.toLowerCase().includes(t.task.toLowerCase().split(' ')[0])
          );
          if (matched && matched.completed) {
            return { ...t, completed: true };
          }
          return t;
        })
      );
    }

    setLogs((prev) => [logItem, ...prev]);
    showToast(
      `Voice entry approved & written onto Mrs. Brimberg's notepad (${selectedDateKey})!`,
      'success'
    );
  };

  // Incident Reporting Handler
  const handleReportIncident = (incident: IncidentRecord, logEntry: Omit<LogEntry, 'id'>) => {
    const item: LogEntry = {
      ...logEntry,
      id: `inc-log-${Date.now()}`,
      dateStr: selectedDateKey,
      incident,
      syncStatus: effectiveOnline ? 'synced' : 'pending_sync',
    };
    setLogs((prev) => [item, ...prev]);

    showToast(
      `RED FLAG INCIDENT: ${incident.type.toUpperCase()} recorded! Written to notepad & notified Margaret Brady.`,
      'urgent'
    );
  };

  // Caregiver Start/End Shift
  const handleStartShift = () => {
    setCaregivers((prev) =>
      prev.map((c) =>
        c.id === activeCaregiver.id
          ? { ...c, isShiftActive: true, shiftStartedAt: new Date().toISOString() }
          : c
      )
    );
    showToast(
      `Pre-shift briefing confirmed. Shift active for ${activeCaregiver.name}.`,
      'success'
    );
  };

  const handleEndShift = () => {
    setCaregivers((prev) =>
      prev.map((c) =>
        c.id === activeCaregiver.id
          ? {
              ...c,
              isShiftActive: false,
              lastShiftEnd: new Date().toISOString(),
            }
          : c
      )
    );
    showToast(`Shift signed off by ${activeCaregiver.name}. Ready for next handover.`, 'success');
  };

  const handleToggleCaregiverStatus = (id: string) => {
    setCaregivers((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === 'active' ? 'revoked' : 'active' } : c
      )
    );
    showToast(`Caregiver permissions updated.`, 'success');
  };

  const handleSyncNow = () => {
    setLogs((prev) => prev.map((l) => ({ ...l, syncStatus: 'synced' })));
    showToast(`Offline queue uploaded to clinical cloud.`, 'success');
  };

  // Export & Download Complete Care Record for this date or all dates
  const handleExportData = () => {
    const activeDateLogs = logs.filter((l) =>
      l.dateStr ? l.dateStr === selectedDateKey : l.timestamp.startsWith(selectedDateKey)
    );
    const activeDateLiquids = liquidEntries.filter((l) =>
      l.dateKey ? l.dateKey === selectedDateKey : l.timestamp.startsWith(selectedDateKey)
    );
    const activeDateBM = bmEntries.filter((b) =>
      b.dateKey ? b.dateKey === selectedDateKey : b.timestamp.startsWith(selectedDateKey)
    );

    const exportPayload = {
      facility: 'IrishCareConnect',
      resident: {
        name: resident.name,
        room: resident.room,
        age: resident.age,
        ageNote: resident.ageNote,
        fallRisk: resident.fallRiskScore,
      },
      headNurse: 'Margaret Brady, RN',
      activeCaregiver: activeCaregiver.name,
      selectedDate: selectedDateKey,
      dateLabel: getFormattedDateLabel(selectedDateKey),
      exportedAt: new Date().toISOString(),
      waterSummary: {
        totalIntakeOz: mlToOz(activeDateLiquids.reduce((sum, item) => sum + item.volumeMl, 0)),
        goalOz: resident.waterGoalOz || 48,
        entriesCount: activeDateLiquids.length,
      },
      bmSummary: {
        entriesCount: activeDateBM.length,
      },
      routineTasks: routineTasks.map((t) => ({ task: t.task, completed: t.completed })),
      diaryLogs: activeDateLogs.map((l) => ({
        time: l.timeLabel || l.timestamp,
        author: l.caregiverName,
        category: l.category,
        content: l.content,
        subBullets: l.subBullets || [],
      })),
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `IrishCareConnect_${resident.name.replace(/\s+/g, '_')}_${selectedDateKey}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exported clinical record for ${getFormattedDateLabel(selectedDateKey)}`, 'success');
  };

  // Calculations for Head Nurse Portal (strictly for active day or today)
  const activeDateLiquids = liquidEntries.filter((l) =>
    l.dateKey ? l.dateKey === selectedDateKey : l.timestamp.startsWith(selectedDateKey)
  );
  const totalWaterLoggedToday = activeDateLiquids.reduce((acc, curr) => acc + curr.volumeMl, 0);

  const latestBM = bmEntries.length > 0 ? bmEntries[bmEntries.length - 1] : null;
  const lastBmHours = latestBM
    ? Math.floor((Date.now() - new Date(latestBM.timestamp).getTime()) / (1000 * 60 * 60))
    : 46;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 pb-16">
      {/* Offline Simulator & Sync Bar */}
      <OfflineNotice
        isOnline={effectiveOnline}
        pendingSyncCount={pendingSyncLogs.length}
        onSimulateToggle={() => setSimulatedOffline(!simulatedOffline)}
        onSyncNow={handleSyncNow}
      />

      {/* Top Bar Navigation: IrishCareConnect with Export & User Switcher */}
      <TopNav
        currentRole={currentRole}
        onRoleChange={(role) => {
          setCurrentRole(role);
          if (role === 'head_nurse') setActiveTab('head_nurse');
          else if (activeTab === 'head_nurse') setActiveTab('dashboard');
        }}
        activeCaregiver={activeCaregiver}
        caregivers={caregivers}
        onSelectCaregiver={(cg) => {
          setActiveCaregiverId(cg.id);
          if (!cg.isShiftActive) {
            setIsHandoverModalOpen(true);
          }
        }}
        isOnline={effectiveOnline}
        pendingSyncCount={pendingSyncLogs.length}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenIncidentModal={() => setIsIncidentModalOpen(true)}
        onOpenHandoverModal={() => setIsHandoverModalOpen(true)}
        onExportData={handleExportData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Resident Identity Header (Mrs. Brimberg at 480 Park) + Shared iPad Switcher */}
      <ResidentHeader
        resident={resident}
        activeCaregiver={activeCaregiver}
        teamMembers={caregivers}
        onSelectCaregiver={(cg) => {
          setActiveCaregiverId(cg.id);
          showToast(`Active iPad session switched to ${cg.name}.`, 'success');
        }}
        onOpenHandoverModal={() => setIsHandoverModalOpen(true)}
        onEndShift={handleEndShift}
      />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-bounce-short">
          <div
            className={`p-4 rounded-2xl shadow-xl border flex items-start gap-3 text-xs ${
              toastMessage.type === 'urgent'
                ? 'bg-red-700 text-white border-red-800'
                : toastMessage.type === 'alert'
                ? 'bg-amber-800 text-white border-amber-900'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            {toastMessage.type === 'urgent' || toastMessage.type === 'alert' ? (
              <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-teal-300 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-bold">{toastMessage.text}</p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Care Binder Canvas */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6">
        {/* Pre-Shift Alert Notice if active caregiver hasn't started shift */}
        {currentRole === 'caregiver' && !activeCaregiver.isShiftActive && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <h3 className="font-bold text-amber-900">
                  Pre-Shift Handover Briefing Required for {activeCaregiver.name}
                </h3>
                <p className="text-amber-800 mt-0.5">
                  Review events since your last shift before logging new data onto Mrs. Brimberg's notepad.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsHandoverModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl shadow-xs shrink-0 transition-colors"
            >
              Review Briefing & Start Shift
            </button>
          </div>
        )}

        {/* Tab 1: Care Binder Layout (Notepad Diary + I&O Sheet to the side) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top Order Slip: Head Nurse Margaret Brady Directives Pinned with Paperclip */}
            <ProtocolOrderMemo
              protocols={protocols}
              activeCaregiver={activeCaregiver}
              isHeadNurse={currentRole === 'head_nurse'}
              onAcknowledgeProtocol={handleAcknowledgeProtocol}
              onAddProtocol={handleAddProtocol}
            />

            {/* Two-Column Clinical Layout:
                Left: Shift Notepad Diary with Page Flipping & Date Picker
                Right: Input / Output (I&O) Flow Sheet with Midnight Reset */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (Primary): The Caregiver Shift Notepad (~62% width) */}
              <div className="lg:col-span-8 space-y-6">
                <ShiftNotepadDiary
                  logs={logs}
                  routineTasks={routineTasks}
                  onToggleTask={handleToggleTask}
                  onAddTask={handleAddTask}
                  activeCaregiver={activeCaregiver}
                  onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
                  onQuickAddNote={handleQuickAddNote}
                  selectedDateKey={selectedDateKey}
                  onSelectDateKey={(dateKey) => setSelectedDateKey(dateKey)}
                  onPrevDay={handlePrevDay}
                  onNextDay={handleNextDay}
                  onToday={handleToday}
                  isToday={isToday}
                  selectedDateLabel={getFormattedDateLabel(selectedDateKey)}
                />
              </div>

              {/* Right Column: The Input / Output Sheet to the side (~38% width) */}
              <div className="lg:col-span-4 space-y-6">
                <InputOutputSheet
                  goalMl={resident.waterGoalMl}
                  liquidEntries={liquidEntries}
                  onAddLiquid={handleAddLiquid}
                  bmEntries={bmEntries}
                  onAddBM={handleAddBM}
                  caregiverName={activeCaregiver.name}
                  selectedDateKey={selectedDateKey}
                  isToday={isToday}
                  selectedDateLabel={getFormattedDateLabel(selectedDateKey)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Head Nurse Oversight Portal (Margaret Brady, RN) */}
        {activeTab === 'head_nurse' && (
          <HeadNurseDashboard
            resident={resident}
            onUpdateWaterGoal={(newGoal) => {
              setResident((prev) => ({
                ...prev,
                waterGoalMl: newGoal,
                waterGoalOz: mlToOz(newGoal),
              }));
              showToast(
                `Daily hydration goal updated to ${mlToOz(newGoal)} oz (${newGoal}ml) across all devices.`,
                'success'
              );
            }}
            protocols={protocols}
            onAddProtocol={handleAddProtocol}
            onArchiveProtocol={handleArchiveProtocol}
            caregivers={caregivers}
            onToggleCaregiverStatus={handleToggleCaregiverStatus}
            logs={logs}
            totalWaterLoggedToday={totalWaterLoggedToday}
            lastBmHours={lastBmHours}
          />
        )}
      </main>

      {/* Modal 1: Voice-to-Sort AI Dictation with Review & Confirm Safety Gate */}
      <VoiceToSortModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        activeCaregiver={activeCaregiver}
        clientName={resident.name}
        onConfirmSaveLog={handleConfirmSaveLog}
      />

      {/* Modal 2: Shift Handover Briefing */}
      <HandoverBriefingModal
        isOpen={isHandoverModalOpen}
        onClose={() => setIsHandoverModalOpen(false)}
        activeCaregiver={activeCaregiver}
        clientName={resident.name}
        logs={logs}
        protocols={protocols}
        onStartShift={handleStartShift}
      />

      {/* Modal 3: Red Flag Incident Report */}
      <IncidentReportModal
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        activeCaregiver={activeCaregiver}
        clientName={resident.name}
        onReportIncident={handleReportIncident}
      />
    </div>
  );
}
