import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { TaskDecompositionService } from '../services/taskDecomposition';
import { LocalStorageService } from '../services/localStorage';
import { Task, TaskStep } from '../types';
import { useNavigate } from 'react-router-dom';

/**
 * 首页组件 - 任务输入和AI分解功能
 * 提供用户输入任务描述，通过AI进行任务分解的核心功能
 */
const Home: React.FC = () => {
  const [taskInput, setTaskInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const taskService = new TaskDecompositionService();
  const storageService = new LocalStorageService();

  /**
   * 计算任务难度
   */
  const calculateTaskDifficulty = (steps: TaskStep[]): 'easy' | 'medium' | 'hard' => {
    const avgDifficulty = steps.reduce((sum, step) => {
      const difficultyScore = step.difficulty === 'easy' ? 1 : step.difficulty === 'medium' ? 2 : 3;
      return sum + difficultyScore;
    }, 0) / steps.length;
    
    if (avgDifficulty <= 1.5) return 'easy';
    if (avgDifficulty <= 2.5) return 'medium';
    return 'hard';
  };

  /**
   * 任务分类
   */
  const categorizeTask = (taskDescription: string): string => {
    const keywords = {
      '工作': ['工作', '项目', '会议', '报告', '文档', '邮件'],
      '学习': ['学习', '阅读', '课程', '练习', '复习', '考试'],
      '生活': ['购物', '清洁', '做饭', '运动', '健身', '休息'],
      '娱乐': ['游戏', '电影', '音乐', '旅行', '聚会', '娱乐']
    };
    
    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => taskDescription.includes(word))) {
        return category;
      }
    }
    
    return '其他';
  };

  /**
   * 处理任务分解提交
   * 调用AI服务分解任务，保存到本地存储，并跳转到执行页面
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskInput.trim()) {
      setError('请输入任务描述');
      return;
    }

    // 检查API密钥是否配置
    const settings = await storageService.getSettings();
    if (!settings.apiKey) {
      setError('请先在设置页面配置豆包API密钥，才能使用AI任务分解功能');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 调用AI服务分解任务
      const steps: TaskStep[] = await taskService.decomposeTask(taskInput.trim());
      
      // 创建新任务对象
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: taskInput.trim(),
        description: `AI智能分解的任务：${taskInput.trim()}`,
        steps,
        createdAt: new Date(),
        updatedAt: new Date(),
        difficulty: calculateTaskDifficulty(steps),
        category: categorizeTask(taskInput.trim()),
        estimatedDuration: steps.reduce((total, step) => total + step.estimatedMinutes, 0),
        status: 'pending',
        totalSteps: steps.length,
        completedSteps: 0
      };

      const tasks = storageService.getTasks();
      tasks.push(newTask);
      storageService.saveTasks(tasks);
      
      // 跳转到任务执行页面
      navigate(`/task-execution/${newTask.id}`);
      
    } catch (err) {
      console.error('任务分解失败:', err);
      setError('任务分解失败，请重试或检查网络连接');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 处理示例任务点击
   * 快速填入预设的示例任务
   */
  const handleExampleClick = (example: string) => {
    setTaskInput(example);
    setError('');
  };

  // 示例任务列表
  const exampleTasks = [
    '学习React开发',
    '准备面试',
    '制定健身计划',
    '学习新语言',
    '整理房间'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 p-4">
      <div className="max-w-2xl mx-auto pt-16">
        {/* 标题区域 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-primary-500 mr-2" />
            <h1 className="text-4xl font-bold text-gray-800">
              智能任务分解助手
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            输入你的目标，让AI帮你制定详细的执行计划
          </p>
        </motion.div>

        {/* 任务输入表单 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="task-input" 
                className="block text-lg font-semibold text-gray-700 mb-3"
              >
                描述你想要完成的任务
              </label>
              <textarea
                id="task-input"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="例如：学习React开发、准备求职面试、制定健身计划..."
                className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none resize-none text-gray-700 placeholder-gray-400 transition-colors"
                disabled={isLoading}
              />
            </div>

            {/* 错误提示 */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm"
              >
                <p className="mb-2">{error}</p>
                {error.includes('API密钥') && (
                  <button
                    onClick={() => navigate('/settings')}
                    className="inline-flex items-center px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-xs font-medium transition-colors"
                  >
                    前往设置页面
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </button>
                )}
              </motion.div>
            )}

            {/* 提交按钮 */}
            <motion.button
              type="submit"
              disabled={isLoading || !taskInput.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>AI正在分解任务...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>开始智能分解</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* 示例任务 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <Sparkles className="w-5 h-5 text-green-500 mr-2" />
            试试这些示例任务
          </h3>
          <div className="flex flex-wrap gap-3">
            {exampleTasks.map((example, index) => (
              <motion.button
                key={index}
                onClick={() => handleExampleClick(example)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-gradient-to-r from-green-100 to-green-200 text-green-700 rounded-full hover:from-green-200 hover:to-green-300 transition-all duration-200 text-sm font-medium"
                disabled={isLoading}
              >
                {example}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* 功能介绍 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-primary-500" />
              </div>
              <h4 className="font-semibold text-gray-700 mb-2">AI智能分解</h4>
              <p className="text-sm text-gray-600">基于豆包大模型，智能分析任务并生成详细步骤</p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ArrowRight className="w-6 h-6 text-green-500" />
              </div>
              <h4 className="font-semibold text-gray-700 mb-2">逐步执行</h4>
              <p className="text-sm text-gray-600">按步骤完成任务，享受每一个小成就</p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Loader2 className="w-6 h-6 text-blue-500" />
              </div>
              <h4 className="font-semibold text-gray-700 mb-2">数据统计</h4>
              <p className="text-sm text-gray-600">记录完成情况，可视化展示你的进步</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;