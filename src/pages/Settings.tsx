import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Bell,
  Palette,
  Download,
  Upload,
  Trash2,
  Save,
  RefreshCw,
  Shield,
  Info,
  ExternalLink
} from 'lucide-react';
import { LocalStorageService } from '../services/localStorage';
import { UserSettings } from '../types';
import { useThemeColor } from '../hooks/useThemeColor';

/**
 * 设置页面组件
 * 提供用户个人偏好配置、数据管理和系统设置
 */
const Settings: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const storageService = new LocalStorageService();
  
  // 获取主题色彩更新方法
  const { updateThemeColor } = useThemeColor();

  /**
   * 加载用户设置
   */
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const userSettings = await storageService.getSettings();
        setSettings(userSettings);
      } catch (error) {
        console.error('加载设置失败:', error);
        showMessage('error', '加载设置失败');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  /**
   * 显示消息提示
   */
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  /**
   * 保存设置
   */
  const handleSaveSettings = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      await storageService.saveSettings(settings);
      showMessage('success', '设置保存成功！');
    } catch (error) {
      console.error('保存设置失败:', error);
      showMessage('error', '保存设置失败');
    } finally {
      setSaving(false);
    }
  };

  /**
   * 更新设置项
   */
  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  /**
   * 导出数据
   */
  const handleExportData = async () => {
    try {
      const data = await storageService.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `task-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showMessage('success', '数据导出成功！');
    } catch (error) {
      console.error('导出数据失败:', error);
      showMessage('error', '导出数据失败');
    }
  };

  /**
   * 导入数据
   */
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        await storageService.importData(data);
        showMessage('success', '数据导入成功！');
        // 重新加载页面以反映导入的数据
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        console.error('导入数据失败:', error);
        showMessage('error', '导入数据失败，请检查文件格式');
      }
    };
    reader.readAsText(file);
  };

  /**
   * 清除所有数据
   */
  const handleClearAllData = async () => {
    try {
      await storageService.clearAllData();
      showMessage('success', '所有数据已清除！');
      setShowDeleteConfirm(false);
      // 重新加载页面
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('清除数据失败:', error);
      showMessage('error', '清除数据失败');
    }
  };

  /**
   * 获取存储使用情况
   */
  const getStorageInfo = () => {
    try {
      // 计算localStorage使用量
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length;
        }
      }
      const maxSize = 5 * 1024 * 1024; // 假设最大5MB
      const percentage = (totalSize / maxSize) * 100;
      return {
        used: totalSize,
        total: maxSize,
        percentage: Math.min(percentage, 100)
      };
    } catch (error) {
      return { used: 0, total: 0, percentage: 0 };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载设置中...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">设置加载失败</p>
        </div>
      </div>
    );
  }

  const storageInfo = getStorageInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <SettingsIcon className="w-8 h-8 text-primary-500 mr-2" />
            <h1 className="text-3xl font-bold text-gray-800">设置</h1>
          </div>
          <p className="text-gray-600">个性化你的任务管理体验</p>
        </motion.div>

        {/* 消息提示 */}
        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-100 border border-green-200 text-green-700'
                : 'bg-red-100 border border-red-200 text-red-700'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        <div className="space-y-6">


          {/* 通知设置 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center mb-4">
              <Bell className="w-5 h-5 text-green-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">通知设置</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-700">任务提醒</h3>
                  <p className="text-sm text-gray-500">在任务到期前提醒你</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.taskReminders}
                    onChange={(e) => updateSetting('notifications', {
                      ...settings.notifications,
                      taskReminders: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-700">完成庆祝</h3>
                  <p className="text-sm text-gray-500">任务完成时显示庆祝动效</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.completionCelebration}
                    onChange={(e) => updateSetting('notifications', {
                      ...settings.notifications,
                      completionCelebration: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* 主题设置 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center mb-4">
              <Palette className="w-5 h-5 text-purple-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">主题设置</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  主题色彩
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { name: 'orange', color: 'bg-orange-500', label: '橙色' },
                    { name: 'green', color: 'bg-green-500', label: '绿色' },
                    { name: 'blue', color: 'bg-blue-500', label: '蓝色' },
                    { name: 'purple', color: 'bg-purple-500', label: '紫色' },
                  ].map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() => {
                        // 更新设置
                        updateSetting('theme', {
                          ...settings.theme,
                          primaryColor: theme.name as any
                        });
                        // 立即应用主题色彩
                        updateThemeColor(theme.name as 'orange' | 'green' | 'blue' | 'purple');
                      }}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        settings.theme.primaryColor === theme.name
                          ? 'border-gray-800 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-8 h-8 ${theme.name === 'orange' ? 'bg-orange-500' : theme.name === 'green' ? 'bg-green-500' : theme.name === 'blue' ? 'bg-blue-500' : 'bg-purple-500'} rounded-full mx-auto mb-1`}></div>
                      <span className="text-xs text-gray-600">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-700">动画效果</h3>
                  <p className="text-sm text-gray-500">启用页面切换和交互动画</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.theme.animations}
                    onChange={(e) => updateSetting('theme', {
                      ...settings.theme,
                      animations: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* API配置 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center mb-4">
              <ExternalLink className="w-5 h-5 text-indigo-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">豆包API配置</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API密钥
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={settings.apiKey || ''}
                    onChange={(e) => updateSetting('apiKey', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-20"
                    placeholder="输入你的豆包API密钥"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!settings.apiKey) {
                        showMessage('error', '请先输入API密钥');
                        return;
                      }
                      setSaving(true);
                      try {
                        // 先保存当前设置，确保API密钥被保存到localStorage
                        await storageService.saveSettings(settings);
                        
                        // 然后测试连接
                        const { taskDecompositionService } = await import('../services/taskDecomposition');
                        const result = await taskDecompositionService.testConnection();
                        if (result.success) {
                          showMessage('success', 'API连接测试成功！');
                        } else {
                          showMessage('error', `API连接测试失败: ${result.error || '未知错误'}`);
                        }
                      } catch (error) {
                        console.error('API测试失败:', error);
                        showMessage('error', `API连接测试失败: ${error.message || '未知错误'}`);
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving || !settings.apiKey}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? '测试中...' : '测试连接'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  请输入你的豆包大模型API密钥，用于AI任务分解功能
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI模型
                </label>
                <select
                  value={settings.apiModel || 'doubao-1.5-lite-32k-250115'}
                  onChange={(e) => updateSetting('apiModel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="doubao-1.5-lite-32k-250115">Doubao-1.5-lite-32k (推荐)</option>
                  <option value="doubao-1.5-pro-32k-250115">Doubao-1.5-pro-32k</option>
                  <option value="doubao-1.5-pro-128k-250115">Doubao-1.5-pro-128k</option>
                  <option value="doubao-1.5-pro-256k-250115">Doubao-1.5-pro-256k</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  选择用于任务分解的豆包AI模型，不同模型有不同的性能和成本
                </p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">如何获取豆包API密钥：</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>访问豆包大模型官网</li>
                      <li>注册并登录账户</li>
                      <li>在控制台创建API密钥</li>
                      <li>复制密钥并粘贴到上方输入框</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 数据管理 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center mb-4">
              <Shield className="w-5 h-5 text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">数据管理</h2>
            </div>
            
            <div className="space-y-4">
              {/* 存储使用情况 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">存储使用情况</span>
                  <span className="text-sm text-gray-500">
                    {(storageInfo.used / 1024).toFixed(1)} KB / {(storageInfo.total / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              {/* 数据操作按钮 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={handleExportData}
                  className="flex items-center justify-center px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  导出数据
                </button>
                
                <label className="flex items-center justify-center px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  导入数据
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
                
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center justify-center px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  清除数据
                </button>
              </div>
            </div>
          </motion.div>

          {/* 关于信息 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center mb-4">
              <Info className="w-5 h-5 text-gray-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">关于</h2>
            </div>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>应用版本</span>
                <span>1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>AI模型</span>
                <span>豆包大模型 (doubao-1.5-lite-32k)</span>
              </div>
              <div className="flex justify-between">
                <span>数据存储</span>
                <span>本地浏览器存储</span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-center text-gray-500">
                  任务拆解小助手 - 让每个目标都变得可达成
                </p>
              </div>
            </div>
          </motion.div>

          {/* 保存按钮 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center"
          >
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex items-center px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {saving ? (
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              {saving ? '保存中...' : '保存设置'}
            </button>
          </motion.div>
        </div>
      </div>

      {/* 删除确认对话框 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md mx-4"
          >
            <div className="text-center">
              <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                确认清除所有数据？
              </h3>
              <p className="text-gray-600 mb-6">
                此操作将永久删除所有任务、统计数据和设置，且无法恢复。
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleClearAllData}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  确认删除
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Settings;