import {
  ResidentProfile,
  CaregiverProfile,
  ProtocolPin,
  LogEntry,
  LiquidEntry,
  BowelMovementEntry,
} from '../types';

// Format helper for calendar dates (YYYY-MM-DD)
export const formatDateKey = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getOffsetDateKey = (offsetDays: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return formatDateKey(date);
};

export const TODAY_KEY = formatDateKey(new Date());
export const YESTERDAY_KEY = getOffsetDateKey(-1);
export const TWO_DAYS_AGO_KEY = getOffsetDateKey(-2);

export const INITIAL_RESIDENT: ResidentProfile = {
  id: 'res-brimberg-1',
  name: 'Mrs. Brimberg',
  age: 92,
  ageNote: 'Turning 93 this December (b. Dec 1933)',
  room: '480 Park',
  address: '480 Park',
  fallRiskScore: 'High (Morse: 65)',
  waterGoalMl: 1420,
  waterGoalOz: 48,
  notes: '480 Park resident. Turns 93 in Dec. Highchair transfers always require shoes. Bristol stool monitoring (Type 6 mushy stool protocol: Senna/Colace directed by Head Nurse Margaret Brady). Nocturia guard: monitor liquids after 6:30 PM. Incontinence brief (Depend) care with barrier cream between buttocks.',
};

export const INITIAL_TEAM_MEMBERS: CaregiverProfile[] = [
  {
    id: 'cg-lisa',
    name: 'Lisa Peters',
    title: 'Senior Caregiver',
    role: 'caregiver',
    avatarColor: 'bg-teal-600',
    initials: 'LP',
    lastShiftEnd: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    isShiftActive: true,
    shiftStartedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'cg-fiona',
    name: 'Fiona Byrne',
    title: 'Caregiver / CNA',
    role: 'caregiver',
    avatarColor: 'bg-indigo-600',
    initials: 'FB',
    lastShiftEnd: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isShiftActive: false,
    status: 'active',
  },
  {
    id: 'cg-helene',
    name: 'Helene Cashin',
    title: 'Caregiver / CNA',
    role: 'caregiver',
    avatarColor: 'bg-rose-600',
    initials: 'HC',
    lastShiftEnd: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    isShiftActive: false,
    status: 'active',
  },
  {
    id: 'cg-pauline',
    name: 'Pauline Gilroy',
    title: 'Caregiver / CNA',
    role: 'caregiver',
    avatarColor: 'bg-amber-600',
    initials: 'PG',
    lastShiftEnd: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    isShiftActive: false,
    status: 'active',
  },
  {
    id: 'hn-margaret',
    name: 'Margaret Brady',
    title: 'Head Nurse & Clinical Director',
    role: 'head_nurse',
    avatarColor: 'bg-emerald-700',
    initials: 'MB',
    lastShiftEnd: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    isShiftActive: true,
    status: 'active',
  },
];

export const INITIAL_CAREGIVERS = INITIAL_TEAM_MEMBERS;

export const INITIAL_HEAD_NURSE = {
  id: 'hn-margaret',
  name: 'Margaret Brady, RN',
  title: 'Head Nurse & Clinical Lead',
  avatarColor: 'bg-emerald-700',
  initials: 'MB',
  role: 'head_nurse' as const,
};

export const INITIAL_PROTOCOLS: ProtocolPin[] = [
  {
    id: 'proto-1',
    title: 'Senna 2 & Colace Stool Protocol',
    content: 'Add Senna 2 tablets tonight if Bristol Stool Chart reaches 6 (mushy stool/soft blobs). Administer 1x Colace with PM pills and 6 oz fresh water.',
    createdBy: 'Margaret Brady, RN',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    priority: 'urgent',
    status: 'active',
    acknowledgedBy: [
      {
        caregiverId: 'cg-lisa',
        caregiverName: 'Lisa Peters',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'proto-2',
    title: 'Highchair Transfer Shoes & Buttocks Barrier Cream',
    content: 'Always put shoes on Mrs. Brimberg before highchair transfer even if she demurs. During Depend brief change, clean peri area and apply barrier cream between buttocks.',
    createdBy: 'Margaret Brady, RN',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    status: 'active',
    acknowledgedBy: [
      {
        caregiverId: 'cg-lisa',
        caregiverName: 'Lisa Peters',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
      {
        caregiverId: 'cg-fiona',
        caregiverName: 'Fiona Byrne',
        timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'proto-3',
    title: 'Post-6:30 PM Liquid Pacing (Nocturia Guard)',
    content: 'Cap liquids after 18:30 (6:30 PM). Reset tracker after midnight for each new 24-hr period. Nighttime liquids should be small sips only with medications to prevent sleep disruption.',
    createdBy: 'Margaret Brady, RN',
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    priority: 'routine',
    status: 'active',
    acknowledgedBy: [
      {
        caregiverId: 'cg-helene',
        caregiverName: 'Helene Cashin',
        timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
];

// Seeded liquid entries tagged by dateKey
export const INITIAL_LIQUID_ENTRIES: (LiquidEntry & { dateKey?: string })[] = [
  // Today's entries
  {
    id: 'liq-today-1',
    dateKey: TODAY_KEY,
    volumeMl: 500,
    volumeOz: 17,
    beverage: '1st Bottle of Fresh Water',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    loggedAtTime: '09:30 AM',
    isAfter630PM: false,
    caregiverName: 'Lisa Peters',
  },
  {
    id: 'liq-today-2',
    dateKey: TODAY_KEY,
    volumeMl: 240,
    volumeOz: 8,
    beverage: '1x Full Ensure (Vanilla)',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    loggedAtTime: '11:15 AM',
    isAfter630PM: false,
    caregiverName: 'Lisa Peters',
  },
  {
    id: 'liq-today-3',
    dateKey: TODAY_KEY,
    volumeMl: 240,
    volumeOz: 8,
    beverage: 'Prune Juice (Bowel Support)',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    loggedAtTime: '01:45 PM',
    isAfter630PM: false,
    caregiverName: 'Fiona Byrne',
  },

  // Yesterday's entries (preserved in history!)
  {
    id: 'liq-yest-1',
    dateKey: YESTERDAY_KEY,
    volumeMl: 500,
    volumeOz: 17,
    beverage: '1st Bottle of Fresh Water',
    timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    loggedAtTime: '09:15 AM',
    isAfter630PM: false,
    caregiverName: 'Fiona Byrne',
  },
  {
    id: 'liq-yest-2',
    dateKey: YESTERDAY_KEY,
    volumeMl: 240,
    volumeOz: 8,
    beverage: 'Ensure Plus with Breakfast',
    timestamp: new Date(Date.now() - 27 * 60 * 60 * 1000).toISOString(),
    loggedAtTime: '11:30 AM',
    isAfter630PM: false,
    caregiverName: 'Fiona Byrne',
  },
  {
    id: 'liq-yest-3',
    dateKey: YESTERDAY_KEY,
    volumeMl: 500,
    volumeOz: 17,
    beverage: '2nd Bottle of Water (by 5:30pm)',
    timestamp: new Date(Date.now() - 21 * 60 * 60 * 1000).toISOString(),
    loggedAtTime: '05:30 PM',
    isAfter630PM: false,
    caregiverName: 'Helene Cashin',
  },
  {
    id: 'liq-yest-4',
    dateKey: YESTERDAY_KEY,
    volumeMl: 90,
    volumeOz: 3,
    beverage: 'Fresh Water with Dinner',
    timestamp: new Date(Date.now() - 19 * 60 * 60 * 1000).toISOString(),
    loggedAtTime: '06:45 PM',
    isAfter630PM: true,
    caregiverName: 'Helene Cashin',
  },
  {
    id: 'liq-yest-5',
    dateKey: YESTERDAY_KEY,
    volumeMl: 180,
    volumeOz: 6,
    beverage: 'Water with PM Pills & Colace',
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    loggedAtTime: '08:00 PM',
    isAfter630PM: true,
    caregiverName: 'Pauline Gilroy',
  },
];

export const INITIAL_BM_ENTRIES: (BowelMovementEntry & { dateKey?: string })[] = [
  {
    id: 'bm-today-1',
    dateKey: TODAY_KEY,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    bristolScale: 4,
    consistency: 'Type 4: Like a sausage or snake, smooth and soft',
    amount: 'moderate',
    notes: 'Normal formed BM in toilet after breakfast. Cleansed gently, barrier cream reapplied.',
    caregiverName: 'Lisa Peters',
  },
  {
    id: 'bm-yest-1',
    dateKey: YESTERDAY_KEY,
    timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    bristolScale: 6,
    consistency: 'Type 6: Fluffy pieces with ragged edges, mushy stool',
    amount: 'large',
    notes: 'Depend was full of BM at 7:25pm. Ripped two sides, cleaned bottom & peri area. Applied cream between buttocks. Margaret asked to add Senna 2 tablets.',
    caregiverName: 'Helene Cashin',
  },
];

// Multi-day initial logs formatted to match diary
export const INITIAL_LOGS: LogEntry[] = [
  // TODAY'S SHIFT NOTES
  {
    id: 'log-today-1',
    dateStr: TODAY_KEY,
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    timeLabel: '2:15 PM',
    caregiverId: 'cg-lisa',
    caregiverName: 'Lisa Peters',
    category: 'narrative',
    content: 'Mrs. Brimberg is resting comfortably in bedroom armchair listening to afternoon classical music. Alert and conversational about 480 Park family visits.',
    subBullets: [
      'Vital signs stable: BP 122/78, Pulse 72.',
      'Drank 8 oz prune juice without resistance.',
      'Skin check sacrum clear; barrier cream in place.',
    ],
    narrative: {
      mood: 'Calm, cheerful, enjoyed music',
      newOccurrences: ['Talked about upcoming 93rd birthday in December'],
      healthChanges: ['Sacrum clear, good peripheral circulation'],
    },
    isConfirmedByCaregiver: true,
    syncStatus: 'synced',
  },
  {
    id: 'log-today-2',
    dateStr: TODAY_KEY,
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    timeLabel: '11:30 AM',
    caregiverId: 'cg-lisa',
    caregiverName: 'Lisa Peters',
    category: 'combined_shift',
    content: 'Morning Meds & 1x Full Ensure (Vanilla) administered with 8 oz water. Transfer to living room completed safely with footwear on.',
    subBullets: [
      'Depend brief inspected: dry at 10:45 AM, replaced with fresh pull-up.',
      'Gait steady with 2-person standby assist.',
    ],
    metrics: {
      waterIntakeMl: 240,
      waterIntakeOz: 8,
      waterLogTime: '11:15 AM',
      isAfter630PM: false,
    },
    routineTasks: [
      { id: 'rt-meds', task: 'Morning Meds & Full Ensure Given', completed: true, notes: 'Given with 8 oz water' },
      { id: 'rt-shoes', task: 'Shoes on for Highchair Transfer', completed: true, notes: 'Footwear secured' },
    ],
    narrative: {
      mood: 'Engaged and cooperative during transfer',
      newOccurrences: ['Ate full morning snack'],
      healthChanges: [],
    },
    isConfirmedByCaregiver: true,
    syncStatus: 'synced',
  },
  {
    id: 'log-today-3',
    dateStr: TODAY_KEY,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    timeLabel: '9:30 AM',
    caregiverId: 'cg-lisa',
    caregiverName: 'Lisa Peters',
    category: 'water',
    content: 'Opened 1st bottle of fresh water. Mrs. Brimberg finished entire bottle (17 oz) during morning routine.',
    metrics: {
      waterIntakeMl: 500,
      waterIntakeOz: 17,
      waterLogTime: '09:30 AM',
      isAfter630PM: false,
    },
    routineTasks: [
      { id: 'rt-water-1', task: '1st bottle hydration completed', completed: true, notes: '17 oz consumed' },
    ],
    isConfirmedByCaregiver: true,
    syncStatus: 'synced',
  },

  // YESTERDAY'S SHIFT NOTES (The authentic handwritten notebook entries!)
  {
    id: 'log-yest-1',
    dateStr: YESTERDAY_KEY,
    timestamp: new Date(Date.now() - 17 * 60 * 60 * 1000).toISOString(),
    timeLabel: '8:10 PM',
    caregiverId: 'cg-helene',
    caregiverName: 'Helene Cashin',
    category: 'narrative',
    content: 'Slice of strawberry shortcake given with 1x strawberry sliced, 6x blueberries (threw the rest of strawberries and raspberries).',
    subBullets: [
      'Overall a mixed day. Morning and after 4:15pm good.',
      'Period from 3:00pm - 4:10pm not good - withdrawn.',
      'Ate well: 3 bottles of water by 5:30pm, 2x prune juice, 1x Full Ensure.',
    ],
    narrative: {
      mood: 'Mixed day: Withdrawn 3-4pm, evening settled and cooperative',
      newOccurrences: ['Enjoyed dessert, evening pop music on Ch 13'],
      healthChanges: ['Hydration goal met, appetite strong for dinner & dessert'],
    },
    isConfirmedByCaregiver: true,
    syncStatus: 'synced',
  },
  {
    id: 'log-yest-2',
    dateStr: YESTERDAY_KEY,
    timestamp: new Date(Date.now() - 17 * 60 * 60 * 1000 - 10 * 60 * 1000).toISOString(),
    timeLabel: '8:05 PM',
    caregiverId: 'cg-helene',
    caregiverName: 'Helene Cashin',
    category: 'narrative',
    content: "Ch 13 pop music from '60s on in bedroom.",
    narrative: {
      mood: 'Relaxed, listening to 60s radio',
      newOccurrences: ['Channel 13 radio on in bedroom'],
      healthChanges: [],
    },
    isConfirmedByCaregiver: true,
    syncStatus: 'synced',
  },
  {
    id: 'log-yest-3',
    dateStr: YESTERDAY_KEY,
    timestamp: new Date(Date.now() - 17 * 60 * 60 * 1000 - 20 * 60 * 1000).toISOString(),
    timeLabel: '8:00 PM',
    caregiverId: 'cg-helene',
    caregiverName: 'Helene Cashin',
    category: 'combined_shift',
    content: 'Mrs. Brimberg leaves some meatloaf (chewed but spit out), some avocado (2x small pieces but had to encourage her to eat it as it is wet). Eats all rest. Loved the corn.',
    subBullets: [
      '2x PM pills given - 1x Colace. Given with 6 oz of water.',
    ],
    metrics: {
      waterIntakeMl: 180,
      waterIntakeOz: 6,
      waterLogTime: '8:00 PM',
      isAfter630PM: true,
    },
    routineTasks: [
      { id: 'rt-pm-pills-yest', task: 'PM pills administered', completed: true, notes: '2x PM pills + 1x Colace' },
      { id: 'rt-water-pills-yest', task: 'Pill hydration', completed: true, notes: '6 oz water with meds' },
    ],
    narrative: {
      mood: 'Good appetite for corn, some chewing reluctance on meatloaf',
      newOccurrences: ['Spit out small meatloaf piece, took all evening pills'],
      healthChanges: ['Pills swallowed without difficulty using water'],
    },
    isConfirmedByCaregiver: true,
    syncStatus: 'synced',
  },
  {
    id: 'log-yest-4',
    dateStr: YESTERDAY_KEY,
    timestamp: new Date(Date.now() - 17 * 60 * 60 * 1000 - 30 * 60 * 1000).toISOString(),
    timeLabel: '7:50 PM',
    caregiverId: 'cg-helene',
    caregiverName: 'Helene Cashin',
    category: 'narrative',
    content: 'Movie over now.',
    isConfirmedByCaregiver: true,
    syncStatus: 'synced',
  },
  {
    id: 'log-yest-5',
    dateStr: YESTERDAY_KEY,
    timestamp: new Date(Date.now() - 17 * 60 * 60 * 1000 - 45 * 60 * 1000).toISOString(),
    timeLabel: '7:35 PM',
    caregiverId: 'cg-helene',
    caregiverName: 'Helene Cashin',
    category: 'routine',
    content: 'Back out to bedroom to finish dinner in Highchair.',
    subBullets: [
      '(Senna 2 Margaret asked me to add tonight since she had 6 on Bristol stool chart) Continues to eat now.',
    ],
    routineTasks: [
      { id: 'rt-senna-yest', task: 'Senna 2 added to tonight protocol', completed: true, notes: 'Bristol 6 protocol' },
    ],
    isConfirmedByCaregiver: true,
    syncStatus: 'synced',
  },
  {
    id: 'log-yest-6',
    dateStr: YESTERDAY_KEY,
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    timeLabel: '7:25 PM',
    caregiverId: 'cg-helene',
    caregiverName: 'Helene Cashin',
    category: 'bm',
    content: 'Mrs. Brimberg says she needs to go to bathroom. As she is starting to move to bathroom she says "she is going". I tell her that\'s ok we have more depends. Depend is full of BM so rip off two sides, clean her and then get her to sit down. New depend given. No void. No more BM. Clean peri area and bottom - some cleaning needed. Cream between buttocks.',
    metrics: {
      bmOccurred: true,
      bmDetails: 'Bristol 6 mushy stool, Depend brief full',
    },
    routineTasks: [
      { id: 'rt-depend-yest', task: 'Depend brief changed', completed: true, notes: 'Full BM cleansed' },
      { id: 'rt-cream-yest', task: 'Cream applied between buttocks', completed: true, notes: 'Clean bottom care' },
    ],
    narrative: {
      mood: 'Reassured during brief change, cooperative',
      newOccurrences: ['Incontinence urgency on transfer, handled calmly'],
      healthChanges: ['Skin intact, cream applied to buttocks'],
    },
    isConfirmedByCaregiver: true,
    syncStatus: 'synced',
  },
  {
    id: 'log-yest-7',
    dateStr: YESTERDAY_KEY,
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000 - 30 * 60 * 1000).toISOString(),
    timeLabel: '7:00 PM',
    caregiverId: 'cg-helene',
    caregiverName: 'Helene Cashin',
    category: 'narrative',
    content: '"Spartacus" still on and she\'s actually enjoying.',
    narrative: {
      mood: 'Engaged, enjoying movie on TV',
      newOccurrences: ['Watching Spartacus in room'],
      healthChanges: [],
    },
    isConfirmedByCaregiver: true,
    syncStatus: 'synced',
  },
  {
    id: 'log-yest-8',
    dateStr: YESTERDAY_KEY,
    timestamp: new Date(Date.now() - 19 * 60 * 60 * 1000).toISOString(),
    timeLabel: '6:45 PM',
    caregiverId: 'cg-helene',
    caregiverName: 'Helene Cashin',
    category: 'combined_shift',
    content: 'Walked Mrs. Brimberg over to Highchair (Said she didn\'t need shoes to go over so I put them on her).',
    subBullets: [
      'Dinner Served - Corn on cob with butter (end cutoff), crinkle carrots, meatloaf ends cutoff, 1/2 baked potato with butter, 1/2 avocado. 3 oz of fresh water from 4th bottle.',
    ],
    metrics: {
      waterIntakeMl: 90,
      waterIntakeOz: 3,
      waterLogTime: '6:45 PM',
      isAfter630PM: true,
    },
    routineTasks: [
      { id: 'rt-shoes-yest', task: 'Shoes put on for highchair transfer', completed: true, notes: 'Assisted safely' },
      { id: 'rt-dinner-yest', task: 'Dinner served in highchair', completed: true, notes: 'Corn, carrots, meatloaf, potato' },
    ],
    narrative: {
      mood: 'Good spirits, mild demur on wearing shoes',
      newOccurrences: ['Safe transfer to highchair with shoes on'],
      healthChanges: ['Good posture in highchair for dinner'],
    },
    isConfirmedByCaregiver: true,
    syncStatus: 'synced',
  },
];

// Presets for testing Voice-to-Sort for Mrs. Brimberg
export const SAMPLE_DICTATIONS = [
  {
    title: 'Dinner, Highchair Transfer & 3 oz Water',
    description: 'Walked to highchair with shoes, served dinner, 3 oz water from bottle.',
    text: "Walked Mrs. Brimberg over to highchair with her shoes on. Served her dinner with corn on cob, crinkle carrots, meatloaf ends cutoff, baked potato with butter, and avocado. She drank 3 oz of fresh water from her fourth bottle. Settled into Spartacus movie.",
  },
  {
    title: 'Depend Change, Bristol 6 BM & Buttocks Cream',
    description: 'Incontinence brief change, Bristol 6 loose stool, cream applied.',
    text: "Mrs. Brimberg reported needing bathroom, had a bowel movement in her Depend brief. Cleaned peri area and bottom thoroughly, put on fresh Depend. Stool was Bristol scale 6 mushy, so Margaret asked to add Senna 2 tablets tonight. Applied protective cream between buttocks.",
  },
  {
    title: 'PM Pills with 6 oz Water & Dessert',
    description: 'PM pills and Colace with 6 oz water, strawberry shortcake dessert.',
    text: "At 8pm gave Mrs. Brimberg her two evening PM pills and one Colace with 6 oz of fresh water. She ate her corn, left small meatloaf and avocado pieces. Then served a slice of strawberry shortcake with fresh sliced strawberry and blueberries. Radio on channel 13 pop music.",
  },
  {
    title: 'Critical Incident: Unassisted Transfer Refusal',
    description: 'Red flag incident triggering immediate nurse triage.',
    text: "URGENT INCIDENT REPORT: Mrs. Brimberg attempted unassisted transfer without shoes or walker at 4:20 PM and stumbled against bedpost. No loss of consciousness, vitals BP 134/82. Cleansed minor skin scrape on right elbow. Notified Head Nurse Margaret Brady immediately.",
  },
];
