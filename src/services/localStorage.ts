/**
 * 本地存储服务
 * 负责管理任务、设置、统计数据等的本地存储操作
 * 使用浏览器的LocalStorage进行数据持久化
 */

import {
  Task,
  TaskStep,
  TaskCompletionLog,
  UserSettings,
  TaskStatistics,
  DailyStats,
  WeeklyStats,
  MonthlyStats,
  TaskStorage,
  SettingsStorage,
  StatisticsStorage,
  CompletionLogStorage,
  STORAGE_KEYS,
  DEFAULT_SETTINGS
} from '../types';

/**
 * 本地存储服务类
 */
export class LocalStorageService {
  /**
   * 保存任务数据
   * @param tasks 任务数组
   */
  saveTasks(tasks: Task[]): void {
    try {
      const taskStorage: TaskStorage = {
        tasks,
        lastUpdated: new Date()
      };
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(taskStorage));
    } catch (error) {
      console.error('保存任务数据失败:', error);
      throw new Error('任务数据保存失败，请检查存储空间');
    }
  }

  /**
   * 获取任务数据
   * @returns Task[] 任务数组
   */
  getTasks(): Task[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!data) return [];
      
      const taskStorage: TaskStorage = JSON.parse(data);
      
      // 转换日期字符串为Date对象
      return taskStorage.tasks.map(task => ({
        ...task,
        createdAt: new Date(task.createdAt),
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        updatedAt: task.updatedAt ? new Date(task.updatedAt) : undefined,
        steps: task.steps.map(step => ({
          ...step,
          completedAt: step.completedAt ? new Date(step.completedAt) : undefined
        }))
      }));
    } catch (error) {
      console.error('获取任务数据失败:', error);
      return [];
    }
  }

  /**
   * 获取所有任务（别名方法）
   */
  getAllTasks(): Task[] {
    return this.getTasks();
  }

  /**
   * 根据ID获取单个任务
   */
  getTask(taskId: string): Task | null {
    const tasks = this.getTasks();
    return tasks.find(task => task.id === taskId) || null;
  }

  /**
   * 添加新任务
   * @param task 新任务
   */
  addTask(task: Task): void {
    const tasks = this.getTasks();
    tasks.push(task);
    this.saveTasks(tasks);
  }

  /**
   * 更新任务
   * @param taskId 任务ID
   * @param updates 更新内容
   */
  updateTask(task: Task): void;
  updateTask(taskId: string, updates: Partial<Task>): void;
  updateTask(taskOrId: Task | string, updates?: Partial<Task>): void {
    const tasks = this.getTasks();
    let taskIndex: number;
    let updatedTask: Task;
    
    if (typeof taskOrId === 'string') {
      // 使用taskId和updates的方式
      taskIndex = tasks.findIndex(task => task.id === taskOrId);
      if (taskIndex === -1) {
        throw new Error(`任务不存在: ${taskOrId}`);
      }
      updatedTask = { ...tasks[taskIndex], ...updates, updatedAt: new Date() };
    } else {
      // 直接传入Task对象的方式
      taskIndex = tasks.findIndex(task => task.id === taskOrId.id);
      if (taskIndex === -1) {
        throw new Error(`任务不存在: ${taskOrId.id}`);
      }
      updatedTask = { ...taskOrId, updatedAt: new Date() };
    }
    
    // 更新任务
    tasks[taskIndex] = updatedTask;
    this.saveTasks(tasks);
  }

  /**
   * 删除任务
   * @param taskId 任务ID
   */
  deleteTask(taskId: string): void {
    const tasks = this.getTasks();
    const filteredTasks = tasks.filter(task => task.id !== taskId);
    this.saveTasks(filteredTasks);
  }

  /**
   * 更新任务步骤
   * @param taskId 任务ID
   * @param stepId 步骤ID
   * @param completed 是否完成
   */
  updateTaskStep(taskId: string, stepId: string, completed: boolean): void {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
      const step = task.steps.find(s => s.id === stepId);
      if (step) {
        step.completed = completed;
        step.completedAt = completed ? new Date() : undefined;
        
        // 更新任务的完成步骤数
        task.completedSteps = task.steps.filter(s => s.completed).length;
        
        // 检查任务是否全部完成
        if (task.completedSteps === task.totalSteps) {
          task.status = 'completed';
          task.completedAt = new Date();
          
          // 记录完成日志
          this.addCompletionLog({
            id: `log-${Date.now()}`,
            taskId: task.id,
            taskTitle: task.title,
            stepId: 'task-complete',
            completedAt: new Date(),
            duration: this.calculateTaskDuration(task),
            encouragementShown: '🎉 恭喜完成任务！'
          });
        } else if (task.completedSteps > 0) {
          task.status = 'in_progress';
        }
        
        this.saveTasks(tasks);
      }
    }
  }

  /**
   * 计算任务持续时间（分钟）
   * @param task 任务对象
   * @returns number 持续时间
   */
  private calculateTaskDuration(task: Task): number {
    if (!task.completedAt) return 0;
    
    const startTime = task.createdAt.getTime();
    const endTime = task.completedAt.getTime();
    return Math.round((endTime - startTime) / (1000 * 60));
  }

  /**
   * 保存用户设置
   * @param settings 用户设置
   */
  saveSettings(settings: UserSettings): void {
    try {
      const settingsStorage: SettingsStorage = {
        settings,
        lastUpdated: new Date()
      };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settingsStorage));
    } catch (error) {
      console.error('保存设置失败:', error);
      throw new Error('设置保存失败');
    }
  }

  /**
   * 获取用户设置
   * @returns UserSettings 用户设置
   */
  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      
      const settingsStorage: SettingsStorage = JSON.parse(data);
      return { ...DEFAULT_SETTINGS, ...settingsStorage.settings };
    } catch (error) {
      console.error('获取设置失败:', error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * 添加完成记录
   * @param log 完成记录
   */
  addCompletionLog(log: TaskCompletionLog): void {
    try {
      const logs = this.getCompletionLogs();
      logs.push(log);
      
      const logStorage: CompletionLogStorage = {
        logs,
        lastUpdated: new Date()
      };
      
      localStorage.setItem(STORAGE_KEYS.COMPLETION_LOGS, JSON.stringify(logStorage));
      
      // 同时更新统计数据
      this.updateStatistics(log);
    } catch (error) {
      console.error('保存完成记录失败:', error);
    }
  }

  /**
   * 获取完成记录
   * @returns TaskCompletionLog[] 完成记录数组
   */
  getCompletionLogs(): TaskCompletionLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPLETION_LOGS);
      if (!data) return [];
      
      const logStorage: CompletionLogStorage = JSON.parse(data);
      return logStorage.logs.map(log => ({
        ...log,
        completedAt: new Date(log.completedAt)
      }));
    } catch (error) {
      console.error('获取完成记录失败:', error);
      return [];
    }
  }

  /**
   * 更新统计数据
   * @param log 完成记录
   */
  private updateStatistics(log: TaskCompletionLog): void {
    const stats = this.getStatistics();
    const dateKey = this.formatDate(log.completedAt);
    
    // 更新日统计
    if (!stats.dailyStats[dateKey]) {
        stats.dailyStats[dateKey] = {
          date: dateKey,
          tasksCompleted: 0,
          stepsCompleted: 0,
          totalTimeSpent: 0,
          averageTaskDuration: 0
        };
      }
    
    stats.dailyStats[dateKey].tasksCompleted += 1;
    stats.dailyStats[dateKey].stepsCompleted += 1; // 每个日志代表一个步骤完成
    stats.dailyStats[dateKey].totalTimeSpent += log.duration;
    
    this.saveStatistics(stats);
  }

  /**
   * 保存统计数据
   * @param stats 统计数据
   */
  private saveStatistics(stats: StatisticsStorage): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STATISTICS, JSON.stringify({
        ...stats,
        lastUpdated: new Date()
      }));
    } catch (error) {
      console.error('保存统计数据失败:', error);
    }
  }

  /**
   * 获取统计数据
   * @returns StatisticsStorage 统计数据
   */
  getStatistics(): StatisticsStorage {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATISTICS);
      if (!data) {
        return {
          dailyStats: {},
          weeklyStats: {},
          monthlyStats: {},
          lastUpdated: new Date()
        };
      }
      
      const stats: StatisticsStorage = JSON.parse(data);
      return {
        ...stats,
        lastUpdated: new Date(stats.lastUpdated)
      };
    } catch (error) {
      console.error('获取统计数据失败:', error);
      return {
        dailyStats: {},
        weeklyStats: {},
        monthlyStats: {},
        lastUpdated: new Date()
      };
    }
  }

  /**
   * 获取任务统计摘要
   * @returns TaskStatistics 任务统计摘要
   */
  getTaskStatistics(): TaskStatistics {
    const tasks = this.getTasks();
    const completedTasks = tasks.filter(task => task.status === 'completed');
    const stats = this.getStatistics();
    
    const totalTasks = tasks.length;
    const completedCount = completedTasks.length;
    const completionRate = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;
    
    const totalSteps = tasks.reduce((sum, task) => sum + task.totalSteps, 0);
    const averageStepsPerTask = totalTasks > 0 ? totalSteps / totalTasks : 0;
    
    // 构建每日完成数据
    const dailyCompletions: Record<string, number> = {};
    Object.values(stats.dailyStats).forEach(day => {
      dailyCompletions[day.date] = day.tasksCompleted;
    });
    
    return {
      totalTasks,
      completedTasks: completedCount,
      pendingTasks: tasks.filter(t => t.status === 'pending').length,
      inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
      averageCompletionTime: Math.round(averageStepsPerTask * 100) / 100,
      totalTimeSpent: 0,
      dailyStats: {},
      weeklyStats: [],
      monthlyStats: []
    };
  }

  /**
   * 格式化日期为YYYY-MM-DD格式
   * @param date 日期对象
   * @returns string 格式化的日期字符串
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * 清空所有数据
   */
  clearAllData(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('清空数据失败:', error);
    }
  }

  /**
   * 导出数据
   * @returns object 所有数据的JSON对象
   */
  exportData(): object {
    return {
      tasks: this.getTasks(),
      settings: this.getSettings(),
      statistics: this.getStatistics(),
      completionLogs: this.getCompletionLogs(),
      exportDate: new Date().toISOString()
    };
  }

  /**
   * 导入数据
   * @param data 要导入的数据
   */
  importData(data: any): void {
    try {
      if (data.tasks) {
        this.saveTasks(data.tasks);
      }
      if (data.settings) {
        this.saveSettings(data.settings);
      }
      if (data.statistics) {
        this.saveStatistics(data.statistics);
      }
      if (data.completionLogs) {
        const logStorage: CompletionLogStorage = {
          logs: data.completionLogs,
          lastUpdated: new Date()
        };
        localStorage.setItem(STORAGE_KEYS.COMPLETION_LOGS, JSON.stringify(logStorage));
      }
    } catch (error) {
      console.error('导入数据失败:', error);
      throw new Error('数据导入失败');
    }
  }

  /**
   * 获取存储使用情况
   * @returns object 存储使用情况信息
   */
  getStorageInfo(): { used: number; total: number; percentage: number } {
    try {
      let used = 0;
      Object.values(STORAGE_KEYS).forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          used += new Blob([data]).size;
        }
      });
      
      // 估算总可用空间（通常为5-10MB）
      const total = 5 * 1024 * 1024; // 5MB
      const percentage = (used / total) * 100;
      
      return {
        used,
        total,
        percentage: Math.round(percentage * 100) / 100
      };
    } catch (error) {
      console.error('获取存储信息失败:', error);
      return { used: 0, total: 0, percentage: 0 };
    }
  }
}

// 导出单例实例
export const localStorageService = new LocalStorageService();