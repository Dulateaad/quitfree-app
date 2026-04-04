export type FlowNodeType =
  | 'welcome'
  | 'registration'
  | 'intro'
  | 'rule'
  | 'thesis'
  | 'practice'
  | 'question'
  | 'track_check'
  | 'first_days'
  | 'breakdown'
  | 'stop'
  | 'rollback'
  | 'content';

export type AnswerType = 'understood' | 'half-understood' | 'not-understood';

export type TrackCheckAnswerType = 'positive' | 'neutral' | 'negative' | 'breakdown';

export interface FlowAnswer {
  id: string;
  type: AnswerType | TrackCheckAnswerType;
  label: string;
  nextNodeId: string | null;
}

export interface FlowNode {
  id: string;
  type: FlowNodeType;
  title: string;
  audioUrl?: string;
  text?: string;
  nextNodeId?: string | null;
  answers?: FlowAnswer[];
  position: { x: number; y: number };
  // Legacy fields kept for migration compatibility
  parentId?: string | null;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Flow {
  id: string;
  name: string;
  description?: string;
  rootNodeId: string;
  nodes: FlowNode[];
  createdAt: Date;
  updatedAt: Date;
}

export const NODE_TYPE_CONFIG: Record<FlowNodeType, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  hasAudio: boolean;
  hasAnswers: boolean;
  answerCount?: number;
}> = {
  welcome:      { label: 'Приветствие',  color: '#f97316', bgColor: '#fff7ed', borderColor: '#fb923c', hasAudio: true,  hasAnswers: false },
  registration: { label: 'Регистрация',  color: '#6b7280', bgColor: '#f9fafb', borderColor: '#9ca3af', hasAudio: false, hasAnswers: false },
  intro:        { label: 'Вступление',   color: '#f59e0b', bgColor: '#fffbeb', borderColor: '#fbbf24', hasAudio: true,  hasAnswers: false },
  rule:         { label: 'Правило',      color: '#3b82f6', bgColor: '#eff6ff', borderColor: '#60a5fa', hasAudio: true,  hasAnswers: false },
  thesis:       { label: 'Тезис',        color: '#22c55e', bgColor: '#f0fdf4', borderColor: '#4ade80', hasAudio: true,  hasAnswers: false },
  practice:     { label: 'Практика',     color: '#10b981', bgColor: '#ecfdf5', borderColor: '#34d399', hasAudio: true,  hasAnswers: false },
  question:     { label: 'Вопрос',       color: '#ef4444', bgColor: '#fef2f2', borderColor: '#f87171', hasAudio: false, hasAnswers: true, answerCount: 3 },
  track_check:  { label: 'Трек-чек',     color: '#eab308', bgColor: '#fefce8', borderColor: '#facc15', hasAudio: false, hasAnswers: true, answerCount: 4 },
  first_days:   { label: 'Первые дни',   color: '#06b6d4', bgColor: '#ecfeff', borderColor: '#22d3ee', hasAudio: true,  hasAnswers: false },
  breakdown:    { label: 'Срыв',         color: '#a855f7', bgColor: '#faf5ff', borderColor: '#c084fc', hasAudio: true,  hasAnswers: false },
  stop:         { label: 'Остановка',    color: '#8b5cf6', bgColor: '#f5f3ff', borderColor: '#a78bfa', hasAudio: true,  hasAnswers: false },
  rollback:     { label: 'Откат',        color: '#64748b', bgColor: '#f8fafc', borderColor: '#94a3b8', hasAudio: true,  hasAnswers: false },
  content:      { label: 'Контент',      color: '#0ea5e9', bgColor: '#f0f9ff', borderColor: '#38bdf8', hasAudio: true,  hasAnswers: false },
};

export const DEFAULT_QUESTION_ANSWERS: FlowAnswer[] = [
  { id: '', type: 'understood',       label: 'Понял',            nextNodeId: null },
  { id: '', type: 'half-understood',  label: 'Понял наполовину', nextNodeId: null },
  { id: '', type: 'not-understood',   label: 'Не понял',         nextNodeId: null },
];

export const DEFAULT_TRACK_CHECK_ANSWERS: FlowAnswer[] = [
  { id: '', type: 'positive',  label: '+',           nextNodeId: null },
  { id: '', type: 'neutral',   label: '=',           nextNodeId: null },
  { id: '', type: 'negative',  label: '−',           nextNodeId: null },
  { id: '', type: 'breakdown', label: 'Я сорвался',  nextNodeId: null },
];
