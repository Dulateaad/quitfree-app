// Прогресс пользователя в флоу
export interface UserProgress {
  userId: string;
  userName?: string;
  userEmail?: string;
  currentNodeId: string | null; // ID текущего узла в флоу
  completedNodes: string[]; // Массив ID пройденных узлов
  answers: Record<string, string>; // Ответы на вопросы: { questionNodeId: answerId }
  startedAt: Date;
  lastActivityAt: Date;
  status: 'active' | 'paused' | 'completed';
}

// Общая статистика
export interface FlowStats {
  totalUsers: number;
  activeUsers: number;
  completedUsers: number;
  averageProgress: number; // Процент
  nodesStats: Record<string, {
    completed: number;
    current: number;
    percentage: number;
  }>;
}

