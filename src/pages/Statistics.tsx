import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  TrendingUp,
  Calendar,
  Clock,
  Target,
  Award,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { LocalStorageService } from '../services/localStorage';
import { Task, TaskCompletionLog, Statistics as StatsType } from '../types';

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

/**
 * 数据统计页面组件
 * 展示任务完成情况的各种图表和统计信息
 */
const Statistics: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completionLogs, setCompletionLogs] = useState<TaskCompletionLog[]>([]);
  const [statistics, setStatistics] = useState<StatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');
  
  const storageService = new LocalStorageService();

  /**
   * 加载统计数据
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        const [tasksData, logsData, statsData] = await Promise.all([
          storageService.getAllTasks(),
          storageService.getCompletionLogs(),
          storageService.getStatistics()
        ]);
        
        setTasks(tasksData);
        setCompletionLogs(logsData);
        
        if (statsData) {
           // 从任务数据计算统计信息
           const totalTasks = tasksData.length;
           const completedTasks = tasksData.filter(t => t.status === 'completed').length;
           const pendingTasks = tasksData.filter(t => t.status === 'pending').length;
           const inProgressTasks = tasksData.filter(t => t.status === 'in_progress').length;
           
           // 计算总耗时
           const totalTimeSpent = logsData.reduce((sum, log) => sum + log.duration, 0);
           const averageCompletionTime = completedTasks > 0 ? totalTimeSpent / completedTasks : 0;
           
           // 转换StatisticsStorage到Statistics格式
           const convertedStats: StatsType = {
             totalTasks,
             completedTasks,
             pendingTasks,
             inProgressTasks,
             averageCompletionTime,
             totalTimeSpent,
             dailyStats: statsData.dailyStats || {},
             weeklyStats: Object.values(statsData.weeklyStats || {}),
             monthlyStats: Object.values(statsData.monthlyStats || {})
           };
           setStatistics(convertedStats);
         }
      } catch (error) {
        console.error('加载统计数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /**
   * 获取过滤后的完成日志
   */
  const getFilteredLogs = (): TaskCompletionLog[] => {
    const now = new Date();
    const filterDate = new Date();
    
    switch (selectedPeriod) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'all':
      default:
        return completionLogs;
    }
    
    return completionLogs.filter(log => 
      new Date(log.completedAt) >= filterDate
    );
  };

  /**
   * 生成任务完成趋势图数据
   */
  const getTrendChartData = () => {
    const filteredLogs = getFilteredLogs();
    const dailyCompletions: { [key: string]: number } = {};
    
    // 初始化日期范围
    const days = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 14;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyCompletions[dateKey] = 0;
    }
    
    // 统计每日完成数量
    filteredLogs.forEach(log => {
      const dateKey = new Date(log.completedAt).toISOString().split('T')[0];
      if (dailyCompletions.hasOwnProperty(dateKey)) {
        dailyCompletions[dateKey]++;
      }
    });
    
    const labels = Object.keys(dailyCompletions).map(date => {
      const d = new Date(date);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });
    
    return {
      labels,
      datasets: [
        {
          label: '完成任务数',
          data: Object.values(dailyCompletions),
          borderColor: 'rgb(255, 107, 53)',
          backgroundColor: 'rgba(255, 107, 53, 0.2)',
          tension: 0.4,
        },
      ],
    };
  };

  /**
   * 生成任务状态分布图数据
   */
  const getStatusChartData = () => {
    const statusCounts = {
      completed: tasks.filter(t => t.status === 'completed').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      pending: tasks.filter(t => t.status === 'pending').length,
    };
    
    return {
      labels: ['已完成', '进行中', '待开始'],
      datasets: [
        {
          data: [statusCounts.completed, statusCounts.in_progress, statusCounts.pending],
          backgroundColor: [
            '#10B981', // 绿色 - 已完成
            '#F59E0B', // 橙色 - 进行中
            '#6B7280', // 灰色 - 待开始
          ],
          borderWidth: 0,
        },
      ],
    };
  };

  /**
   * 生成任务难度分布图数据
   */
  const getDifficultyChartData = () => {
    const difficultyCounts = { easy: 0, medium: 0, hard: 0 };
    
    tasks.forEach(task => {
      task.steps.forEach(step => {
        difficultyCounts[step.difficulty]++;
      });
    });
    
    return {
      labels: ['简单', '中等', '困难'],
      datasets: [
        {
          label: '步骤数量',
          data: [difficultyCounts.easy, difficultyCounts.medium, difficultyCounts.hard],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(251, 191, 36, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(251, 191, 36)',
            'rgb(239, 68, 68)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  /**
   * 计算统计摘要
   */
  const getStatsSummary = () => {
    const filteredLogs = getFilteredLogs();
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const totalSteps = tasks.reduce((sum, task) => sum + task.totalSteps, 0);
    const completedSteps = tasks.reduce((sum, task) => sum + task.completedSteps, 0);
    const totalDuration = completedTasks.reduce((sum, task) => sum + task.estimatedDuration, 0);
    
    return {
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      completionRate: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0,
      totalSteps,
      completedSteps,
      stepCompletionRate: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
      totalDuration: Math.round(totalDuration / 60), // 转换为小时
      recentCompletions: filteredLogs.length,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载统计数据中...</p>
        </div>
      </div>
    );
  }

  const statsSummary = getStatsSummary();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto pt-8">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-primary-500 mr-2" />
            <h1 className="text-3xl font-bold text-gray-800">数据统计</h1>
          </div>
          <p className="text-gray-600">查看你的任务完成情况和进步轨迹</p>
        </motion.div>

        {/* 时间筛选器 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white rounded-xl p-2 shadow-lg">
            {(['week', 'month', 'all'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedPeriod === period
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {period === 'week' ? '最近一周' : period === 'month' ? '最近一月' : '全部时间'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* 统计卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{statsSummary.totalTasks}</span>
            </div>
            <h3 className="text-gray-600 font-medium">总任务数</h3>
            <p className="text-sm text-gray-500 mt-1">
              完成率 {statsSummary.completionRate}%
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{statsSummary.completedTasks}</span>
            </div>
            <h3 className="text-gray-600 font-medium">已完成任务</h3>
            <p className="text-sm text-gray-500 mt-1">
              {selectedPeriod === 'week' ? '本周' : selectedPeriod === 'month' ? '本月' : '总计'} {statsSummary.recentCompletions} 个
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary-500" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{statsSummary.completedSteps}</span>
            </div>
            <h3 className="text-gray-600 font-medium">完成步骤</h3>
            <p className="text-sm text-gray-500 mt-1">
              总共 {statsSummary.totalSteps} 步骤
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-500" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{statsSummary.totalDuration}</span>
            </div>
            <h3 className="text-gray-600 font-medium">投入时间</h3>
            <p className="text-sm text-gray-500 mt-1">小时</p>
          </div>
        </motion.div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 完成趋势图 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center mb-4">
              <TrendingUp className="w-5 h-5 text-primary-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">完成趋势</h3>
            </div>
            <div className="h-64">
              <Line
                data={getTrendChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                }}
              />
            </div>
          </motion.div>

          {/* 任务状态分布 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center mb-4">
              <PieChart className="w-5 h-5 text-green-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">任务状态分布</h3>
            </div>
            <div className="h-64">
              <Doughnut
                data={getStatusChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </div>
          </motion.div>

          {/* 难度分布 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-lg lg:col-span-2"
          >
            <div className="flex items-center mb-4">
              <BarChart3 className="w-5 h-5 text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">任务步骤难度分布</h3>
            </div>
            <div className="h-64">
              <Bar
                data={getDifficultyChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* 激励信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-gradient-to-r from-orange-500 to-green-500 rounded-xl p-6 text-white text-center"
        >
          <Award className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">
            {statsSummary.completedTasks > 0 ? '🎉 继续保持！' : '🌟 开始你的第一个任务吧！'}
          </h3>
          <p className="opacity-90">
            {statsSummary.completedTasks > 0
              ? `你已经完成了 ${statsSummary.completedTasks} 个任务，完成了 ${statsSummary.completedSteps} 个步骤！`
              : '每一个伟大的成就都始于第一步，现在就开始吧！'
            }
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Statistics;