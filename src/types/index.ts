/**
 * 任务拆解小助手 - 数据类型定义
 * 定义了系统中使用的所有核心数据结构和接口
 */

// 任务步骤接口
export interface TaskStep {
  id: string;
  title: string; // 步骤标题
  content: string; // 步骤内容
  description: string; // 步骤描述
  encouragement: string; // 鼓励话语
  completed: boolean; // 是否完成
  completedAt?: Date; // 完成时间
  stepOrder: number; // 步骤顺序
  estimatedMinutes: number; // 预估完成时间（分钟）
  difficulty: 'easy' | 'medium' | 'hard'; // 难度等级
}

// 任务状态枚举
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

// 任务接口
export interface Task {
  id: string;
  title: string; // 任务标题
  description: string; // 任务描述（用户原始输入）
  steps: TaskStep[]; // 任务步骤列表
  status: TaskStatus; // 任务状态
  createdAt: Date; // 创建时间
  completedAt?: Date; // 完成时间
  updatedAt?: Date; // 更新时间
  totalSteps: number; // 总步骤数
  completedSteps: number; // 已完成步骤数
  estimatedDuration: number; // 预估总耗时（分钟）
  difficulty: 'easy' | 'medium' | 'hard'; // 任务难度
  category?: string; // 任务分类
}

// 任务完成记录接口
export interface TaskCompletionLog {
  id: string;
  taskId: string;
  taskTitle: string; // 任务标题
  stepId: string;
  completedAt: Date; // 完成时间
  duration: number; // 完成耗时（分钟）
  encouragementShown: string; // 显示的鼓励话语
}

// 每日统计接口
export interface DailyStats {
  date: string; // 日期 (YYYY-MM-DD)
  tasksCompleted: number; // 完成任务数
  stepsCompleted: number; // 完成步骤数
  totalTimeSpent: number; // 总耗时（分钟）
  averageTaskDuration: number; // 平均任务耗时
}

// 周统计接口
export interface WeeklyStats {
  weekStart: string; // 周开始日期
  weekEnd: string; // 周结束日期
  tasksCompleted: number;
  stepsCompleted: number;
  totalTimeSpent: number;
  averageTaskDuration: number;
  mostProductiveDay: string; // 最高效的一天
}

// 月统计接口
export interface MonthlyStats {
  month: string; // 月份 (YYYY-MM)
  tasksCompleted: number;
  stepsCompleted: number;
  totalTimeSpent: number;
  averageTaskDuration: number;
  mostProductiveWeek: string; // 最高效的一周
}

// 任务统计接口
export interface TaskStatistics {
  totalTasks: number; // 总任务数
  completedTasks: number; // 已完成任务数
  pendingTasks: number; // 待处理任务数
  inProgressTasks: number; // 进行中任务数
  averageCompletionTime: number; // 平均完成时间（分钟）
  totalTimeSpent: number; // 总耗时（分钟）
  dailyStats: { [date: string]: DailyStats }; // 每日统计
  weeklyStats: WeeklyStats[]; // 周统计
  monthlyStats: MonthlyStats[]; // 月统计
}

// 统计数据接口（别名）
export interface Statistics extends TaskStatistics {}

// 用户设置接口
export interface UserSettings {
  username: string; // 用户名
  email: string; // 邮箱
  theme: {
    primaryColor: 'orange' | 'green' | 'blue' | 'purple'; // 主色调
    animations: boolean; // 动画效果
  };
  notifications: {
    taskReminders: boolean; // 任务提醒
    completionCelebration: boolean; // 完成庆祝
  };
  autoSave: boolean; // 自动保存
  celebrationEffects: boolean; // 庆祝动效开关
  apiKey?: string; // API密钥（可选）
  apiModel?: string; // AI模型名称（可选）
  language: 'zh' | 'en'; // 语言设置
  soundEffects: boolean; // 音效开关
}

// 本地存储数据结构
export interface TaskStorage {
  tasks: Task[];
  lastUpdated: Date;
}

export interface SettingsStorage {
  settings: UserSettings;
  lastUpdated: Date;
}

export interface StatisticsStorage {
  dailyStats: Record<string, DailyStats>;
  weeklyStats: Record<string, WeeklyStats>;
  monthlyStats: Record<string, MonthlyStats>;
  lastUpdated: Date;
}

export interface CompletionLogStorage {
  logs: TaskCompletionLog[];
  lastUpdated: Date;
}

// 本地存储键名常量
export const STORAGE_KEYS = {
  TASKS: 'ai_todo_tasks',
  SETTINGS: 'ai_todo_settings', 
  STATISTICS: 'ai_todo_statistics',
  COMPLETION_LOGS: 'ai_todo_completion_logs'
} as const;

// AI API 响应接口
export interface AIResponse {
  steps: {
    content: string;
    encouragement: string;
  }[];
}

// 豆包API请求接口
export interface DoubaoAPIRequest {
  model: string;
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  temperature?: number;
  max_tokens?: number;
}

// 豆包API响应接口
export interface DoubaoAPIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// 庆祝动效类型
export type CelebrationType = 'confetti' | 'fireworks' | 'balloons' | 'sparkles';

// 庆祝动效配置接口
export interface CelebrationConfig {
  type: CelebrationType;
  duration: number; // 持续时间（毫秒）
  intensity: 'low' | 'medium' | 'high'; // 强度
  colors: string[]; // 颜色数组
}

// 图表数据接口
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

// 导出默认设置
export const DEFAULT_SETTINGS: UserSettings = {
  username: '用户',
  email: '',
  theme: {
    primaryColor: 'orange',
    animations: true
  },
  notifications: {
    taskReminders: true,
    completionCelebration: true
  },
  autoSave: true,
  celebrationEffects: true,
  language: 'zh',
  soundEffects: true
};

// 导出默认庆祝配置
export const DEFAULT_CELEBRATION_CONFIG: CelebrationConfig = {
  type: 'confetti',
  duration: 3000,
  intensity: 'medium',
  colors: ['#FF6B35', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
};