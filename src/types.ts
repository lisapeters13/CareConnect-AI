export type Role = 'caregiver' | 'head_nurse';

export interface CaregiverProfile {
  id: string;
  name: string;
  title: string;
  role: Role;
  avatarColor: string;
  initials: string;
  lastShiftEnd: string; // ISO string
  isShiftActive: boolean;
  shiftStartedAt?: string;
  status: 'active' | 'revoked';
}

export interface LiquidEntry {
  id: string;
  volumeMl: number;
  volumeOz?: number;
  beverage: string;
  timestamp: string; // ISO string
  loggedAtTime: string; // "14:20"
  isAfter630PM: boolean;
  caregiverName: string;
}

export interface BowelMovementEntry {
  id: string;
  timestamp: string; // ISO string
  bristolScale: number; // 1-7
  consistency: string;
  amount: 'small' | 'moderate' | 'large';
  notes?: string;
  caregiverName: string;
}

export interface RoutineTaskItem {
  id: string;
  task: string;
  completed: boolean;
  notes: string;
}

export interface IncidentRecord {
  id: string;
  type: 'fall' | 'skin_tear' | 'med_refusal' | 'behavioral' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  immediateAction: string;
  notifiedHeadNurse: boolean;
  timestamp: string;
  caregiverName: string;
}

export interface ProtocolPin {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
  priority: 'routine' | 'high' | 'urgent';
  status: 'active' | 'archived';
  acknowledgedBy: Array<{
    caregiverId: string;
    caregiverName: string;
    timestamp: string;
  }>;
}

export interface LogEntry {
  id: string;
  dateStr?: string; // e.g. "2026-10-08"
  timestamp: string; // ISO string
  timeLabel?: string; // e.g. "6:45", "7:00", "7:25", "8:00"
  caregiverId: string;
  caregiverName: string;
  category: 'water' | 'bm' | 'routine' | 'narrative' | 'incident' | 'combined_shift';
  content: string;
  subBullets?: string[]; // Indented sub-bullet notes like '▷ Dinner served...'
  rawTranscript?: string;
  metrics?: {
    waterIntakeMl?: number;
    waterIntakeOz?: number;
    waterLogTime?: string;
    isAfter630PM?: boolean;
    bmOccurred?: boolean;
    bmDetails?: string;
  };
  routineTasks?: RoutineTaskItem[];
  narrative?: {
    mood: string;
    newOccurrences: string[];
    healthChanges: string[];
  };
  incident?: IncidentRecord;
  isConfirmedByCaregiver: boolean;
  syncStatus: 'synced' | 'pending_sync';
}

export interface ResidentProfile {
  id: string;
  name: string;
  age: number;
  ageNote?: string;
  room: string;
  address?: string;
  photoUrl?: string;
  fallRiskScore: string;
  waterGoalMl: number;
  waterGoalOz?: number;
  notes: string;
}

export interface ParsedVoiceResult {
  metrics: {
    waterIntakeMl: number;
    waterIntakeOz?: number;
    waterLogTime: string;
    isAfter630PM: boolean;
    bmOccurred: boolean;
    bmTimestamp: string | null;
    bmDetails: string;
  };
  routineTasks: RoutineTaskItem[];
  narrative: {
    mood: string;
    newOccurrences: string[];
    healthChanges: string[];
  };
  incidentDetected: boolean;
  incidentSeverity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  incidentSummary: string | null;
  clinicalSummary: string;
}

export interface HandoverBriefingData {
  welcomeGreeting: string;
  hoursSinceLastShift: string;
  highPriorityAlerts: string[];
  hydrationRecap: string;
  bowelMovementStatus: string;
  activeProtocolsToReview: Array<{
    id?: string;
    title: string;
    instruction: string;
  }>;
  clinicalShiftGoals: string[];
}

export interface ManagerReportData {
  executiveSynopsis: string;
  hydrationAnalysis: string;
  bowelEliminationAssessment: string;
  skinAndMobilityStatus: string;
  incidentAndRiskEvaluation: string;
  actionDirectivesForTeam: string[];
  auditTrailQualityScore: string;
}
