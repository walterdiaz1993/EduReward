export interface MockUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: 'student' | 'tutor' | 'teacher';
  points: number;
  studentIds?: string[];
  isPremium?: boolean;
}

export interface RewardRule {
  id: string;
  subject: string;
  condition: 'greater' | 'less';
  value: number;
  rewardType: 'points' | 'console' | 'allowance';
  rewardValue: string | number;
}

export interface StudentWithGrades extends MockUser {
  grades: number[];
  average: number;
  periodType: 'bimonthly' | 'semester';
  gradingSystem: 'percentage' | 'decimal' | 'letters';
  subjectRules: RewardRule[];
}

export interface MockReward {
  id: string;
  title: string;
  pointsRequired: number;
  description: string;
  image: string;
}

export const MOCK_USERS: Record<string, MockUser & { passwordHash: string }> = {
  tutor: {
    id: 'usr_tutor',
    username: 'tutor',
    fullName: 'Carlos Díaz (Tutor)',
    email: 'carlos@edureward.dev',
    role: 'tutor',
    points: 0,
    studentIds: ['usr_nico', 'usr_sofia'],
    passwordHash: 'tutor123',
  },
  teacher: {
    id: 'usr_teacher',
    username: 'teacher',
    fullName: 'Marta Gómez (Docente)',
    email: 'marta@edureward.dev',
    role: 'teacher',
    points: 0,
    studentIds: ['usr_nico'],
    isPremium: false,
    passwordHash: 'teacher123',
  },
  nico: {
    id: 'usr_nico',
    username: 'nico',
    fullName: 'Nico Díaz (Hijo)',
    email: 'nico@edureward.dev',
    role: 'student',
    points: 950,
    passwordHash: 'nico123',
  },
  sofia: {
    id: 'usr_sofia',
    username: 'sofia',
    fullName: 'Sofía Díaz (Hija)',
    email: 'sofia@edureward.dev',
    role: 'student',
    points: 150,
    passwordHash: 'sofia123',
  },
};

export const INITIAL_STUDENTS: StudentWithGrades[] = [
  {
    id: 'usr_nico',
    username: 'nico',
    fullName: 'Nico Díaz',
    email: 'nico@edureward.dev',
    role: 'student',
    points: 950,
    grades: [95, 92, 88, 95],
    average: 92.5,
    periodType: 'semester',
    gradingSystem: 'percentage',
    subjectRules: [
      {
        id: 'rule_1',
        subject: 'Matemáticas',
        condition: 'greater',
        value: 90,
        rewardType: 'points',
        rewardValue: 50,
      },
    ],
  },
  {
    id: 'usr_sofia',
    username: 'sofia',
    fullName: 'Sofía Díaz',
    email: 'sofia@edureward.dev',
    role: 'student',
    points: 150,
    grades: [65, 72, 60, 68],
    average: 66.25,
    periodType: 'bimonthly',
    gradingSystem: 'letters',
    subjectRules: [
      {
        id: 'rule_2',
        subject: 'Español',
        condition: 'less',
        value: 70,
        rewardType: 'allowance',
        rewardValue: '-20% Mesada',
      },
    ],
  },
];

export const MOCK_REWARDS: MockReward[] = [
  {
    id: 'rwd_1',
    title: 'Tarjetas de Regalo Amazon $10',
    pointsRequired: 500,
    description: 'Canjea tus puntos por una tarjeta de regalo digital de Amazon.',
    image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=150',
  },
  {
    id: 'rwd_2',
    title: 'Pase de Tarea Libre',
    pointsRequired: 300,
    description: 'Evita entregar una tarea esta semana sin penalización.',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=150',
  },
  {
    id: 'rwd_3',
    title: 'Libro Educativo a Elección',
    pointsRequired: 800,
    description: 'Elige cualquier libro físico de nuestra lista de recomendados.',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=150',
  },
];

export const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
