
export enum Subject {
  CHINESE = '國語',
  MATH = '數學',
  ENGLISH = '英文',
  SCIENCE = '自然',
  SOCIAL = '社會',
  BOSS = '期末魔王'
}

export type CharacterType = 'boy' | 'girl' | null;

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
}

export interface Task {
  id: string;
  subject: Subject;
  title: string;
  description: string;
  isCompleted: boolean;
  rewardCoins: number;
  isQuizTask?: boolean;
  questions?: QuizQuestion[];
  iconUrl?: string;
}

export interface Reward {
  id: string;
  name: string;
  cost: number;
  type: 'virtual' | 'physical' | 'privilege';
  icon: string;
}

export interface UserProfile {
  id: string;
  name: string;
  character: CharacterType;
  coins: number;
  completedTasks: string[];
  claimedTaskRewards: string[];
  history: { date: string; taskId: string }[];
}

export interface AppState {
  activeProfileId: string | null;
  profiles: UserProfile[];
  parentPassword: string;
  examDate: string;
  subjectWeights: Record<Subject, number>;
  tasks: Task[];
  rewards: Reward[];
  subjectIcons: Record<string, string>; // 儲存各科目自定義場景圖片 (Subject -> base64)
}

export type UserRole = 'student' | 'parent';
