import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Trophy, 
  ArrowLeft, 
  Sparkles,
  Target,
  Calendar,
  Timer
} from 'lucide-react';
import Confetti from 'react-confetti';
import { Task, TaskStep } from '../types';
import { LocalStorageService } from '../services/localStorage';

/**
 * 任务执行页面组件
 * 显示任务步骤列表，跟踪完成进度，提供庆祝动效
 */
const TaskExecution: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [completedStep, setCompletedStep] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  
  const storageService = new LocalStorageService();

  /**
   * 获取窗口尺寸用于彩带动效
   */
  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);

  /**
   * 加载任务数据
   */
  useEffect(() => {
    const loadTask = async () => {
      if (!taskId) {
        navigate('/');
        return;
      }

      try {
        const taskData = await storageService.getTask(taskId);
        if (!taskData) {
          navigate('/');
          return;
        }
        setTask(taskData);
      } catch (error) {
        console.error('加载任务失败:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [taskId, navigate]);

  /**
   * 切换步骤完成状态
   * 包含庆祝动效和数据更新
   */
  const toggleStepCompletion = async (stepId: string) => {
    if (!task) return;

    const updatedSteps = task.steps.map(step => {
      if (step.id === stepId) {
        const newCompleted = !step.completed;
        if (newCompleted) {
          step.completedAt = new Date();
          // 触发庆祝动效
          setCompletedStep(stepId);
          setShowConfetti(true);
          setTimeout(() => {
            setShowConfetti(false);
            setCompletedStep(null);
          }, 3000);
        } else {
          step.completedAt = undefined;
        }
        return { ...step, completed: newCompleted };
      }
      return step;
    });

    const completedCount = updatedSteps.filter(step => step.completed).length;
    const isTaskCompleted = completedCount === updatedSteps.length;

    const updatedTask: Task = {
      ...task,
      steps: updatedSteps,
      completedSteps: completedCount,
      status: isTaskCompleted ? 'completed' : completedCount > 0 ? 'in_progress' : 'pending',
      updatedAt: new Date(),
      completedAt: isTaskCompleted ? new Date() : undefined
    };

    setTask(updatedTask);
    
    try {
      await storageService.updateTask(updatedTask);
      
      // 如果任务完成，记录完成日志
      if (isTaskCompleted && !task.completedAt) {
        await storageService.addCompletionLog({
          id: `log-${Date.now()}`,
          taskId: task.id,
          taskTitle: task.title,
          stepId: 'task-completion',
          completedAt: new Date(),
          duration: task.estimatedDuration,
          encouragementShown: '🎉 恭喜！任务全部完成！你真棒！'
        });
      }
    } catch (error) {
      console.error('更新任务失败:', error);
    }
  };

  /**
   * 获取鼓励文案
   */
  const getEncouragementText = (completedSteps: number, totalSteps: number): string => {
    const progress = completedSteps / totalSteps;
    
    if (progress === 1) {
      return '🎉 恭喜！任务全部完成！你真棒！';
    } else if (progress >= 0.8) {
      return '💪 快要完成了！最后冲刺！';
    } else if (progress >= 0.5) {
      return '🚀 进展顺利！继续保持！';
    } else if (progress > 0) {
      return '✨ 很好的开始！一步一个脚印！';
    } else {
      return '🌟 开始你的任务之旅吧！';
    }
  };

  /**
   * 格式化预估时间
   */
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}分钟`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载任务中...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">任务不存在</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const progressPercentage = (task.completedSteps / task.totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 p-4">
      {/* 庆祝彩带动效 */}
      <AnimatePresence>
        {showConfetti && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={200}
            gravity={0.3}
          />
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto pt-8">
        {/* 头部导航 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-6"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            返回首页
          </button>
        </motion.div>

        {/* 任务信息卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{task.title}</h1>
              <p className="text-gray-600 mb-4">{task.description}</p>
              
              {/* 任务统计信息 */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Target className="w-4 h-4 mr-1" />
                  {task.completedSteps}/{task.totalSteps} 步骤
                </div>
                <div className="flex items-center">
                  <Timer className="w-4 h-4 mr-1" />
                  预估 {formatDuration(task.estimatedDuration)}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  创建于 {task.createdAt.toLocaleDateString()}
                </div>
              </div>
            </div>
            
            {/* 任务状态图标 */}
            <div className="ml-4">
              {task.status === 'completed' ? (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-green-500" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary-500" />
                </div>
              )}
            </div>
          </div>

          {/* 进度条 */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">完成进度</span>
              <span className="text-sm text-gray-500">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-orange-500 to-green-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* 鼓励文案 */}
          <motion.div
            key={task.completedSteps}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-orange-100 to-green-100 rounded-lg p-3 text-center"
          >
            <p className="text-gray-700 font-medium">
              {getEncouragementText(task.completedSteps, task.totalSteps)}
            </p>
          </motion.div>
        </motion.div>

        {/* 任务步骤列表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {task.steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl shadow-lg p-6 transition-all duration-300 ${
                step.completed ? 'ring-2 ring-green-200' : 'hover:shadow-xl'
              }`}
            >
              <div className="flex items-start space-x-4">
                {/* 步骤完成按钮 */}
                <motion.button
                  onClick={() => toggleStepCompletion(step.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                    step.completed
                      ? 'bg-green-500 text-white'
                      : 'border-2 border-gray-300 hover:border-orange-400'
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </motion.button>

                {/* 步骤内容 */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`text-lg font-semibold transition-all duration-200 ${
                      step.completed ? 'text-green-700 line-through' : 'text-gray-800'
                    }`}>
                      {step.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 ml-4">
                      <Clock className="w-4 h-4 mr-1" />
                      {step.estimatedMinutes}分钟
                    </div>
                  </div>
                  
                  <p className={`text-gray-600 mb-3 transition-all duration-200 ${
                    step.completed ? 'opacity-60' : ''
                  }`}>
                    {step.description}
                  </p>

                  {/* 步骤标签 */}
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      step.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      step.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {step.difficulty === 'easy' ? '简单' : 
                       step.difficulty === 'medium' ? '中等' : '困难'}
                    </span>
                    
                    {step.completed && step.completedAt && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        ✓ 已完成于 {step.completedAt.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 庆祝动效 */}
              <AnimatePresence>
                {completedStep === step.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 bg-green-100 rounded-xl flex items-center justify-center pointer-events-none"
                  >
                    <div className="text-center">
                      <Trophy className="w-12 h-12 text-green-500 mx-auto mb-2" />
                      <p className="text-green-700 font-semibold">太棒了！</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* 任务完成庆祝 - 全屏覆盖 */}
        <AnimatePresence>
          {task.status === 'completed' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", damping: 15, stiffness: 300 }}
                className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md w-full mx-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", damping: 10, stiffness: 200 }}
                  className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Trophy className="w-10 h-10 text-white" />
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold text-gray-800 mb-4"
                >
                  🎉 任务完成！
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 mb-6 text-lg"
                >
                  恭喜你成功完成了所有 {task.totalSteps} 个步骤！
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3"
                >
                  <button
                    onClick={() => navigate('/')}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
                  >
                    返回首页
                  </button>
                  <button
                    onClick={() => setTask({...task, status: 'in_progress'})}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
                  >
                    继续查看任务
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TaskExecution;