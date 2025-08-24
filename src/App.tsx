import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home as HomeIcon,
  Play,
  BarChart3,
  Settings as SettingsIcon,
  Menu,
  X
} from 'lucide-react';

// 导入页面组件
import Home from './pages/Home';
import TaskExecution from './pages/TaskExecution';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';

// 导入主题色彩 Hook
import { useThemeColor } from './hooks/useThemeColor';

/**
 * 主应用组件
 * 配置路由系统和响应式布局
 */
function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // 应用主题色彩
  useThemeColor();

  /**
   * 导航菜单项配置
   */
  const navigationItems = [
    {
      path: '/',
      name: '首页',
      icon: HomeIcon,
      color: 'text-orange-500'
    },
    {
      path: '/task-execution',
      name: '任务执行',
      icon: Play,
      color: 'text-green-500'
    },
    {
      path: '/statistics',
      name: '数据统计',
      icon: BarChart3,
      color: 'text-blue-500'
    },
    {
      path: '/settings',
      name: '设置',
      icon: SettingsIcon,
      color: 'text-purple-500'
    }
  ];

  /**
   * 切换移动端菜单
   */
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  /**
   * 关闭移动端菜单
   */
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
        {/* 桌面端侧边栏 */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          <div className="flex min-h-0 flex-1 flex-col bg-white shadow-xl">
            {/* Logo区域 */}
            <div className="flex h-16 flex-shrink-0 items-center px-4 bg-gradient-to-r from-primary-500 to-primary-600">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
                  <span className="text-primary-500 font-bold text-lg">T</span>
                </div>
                <h1 className="text-white font-bold text-lg">任务分解器</h1>
              </div>
            </div>
            
            {/* 导航菜单 */}
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.path}
                    href={item.path}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 hover:bg-gray-50 ${item.color}`}
                    onClick={(e) => {
                      e.preventDefault();
                      window.history.pushState({}, '', item.path);
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </a>
                );
              })}
            </nav>
            
            {/* 底部信息 */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 text-center">
                <p>智能任务分解与激励系统</p>
                <p className="mt-1">v1.0.0</p>
              </div>
            </div>
          </div>
        </div>

        {/* 移动端顶部导航栏 */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between h-16 px-4 bg-white shadow-sm">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <h1 className="text-gray-800 font-bold text-lg">任务分解器</h1>
            </div>
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* 移动端侧边菜单 */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* 遮罩层 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
                onClick={closeMobileMenu}
              />
              
              {/* 侧边菜单 */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl"
              >
                <div className="flex h-16 items-center px-4 bg-gradient-to-r from-primary-500 to-primary-600">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
                      <span className="text-primary-500 font-bold text-lg">T</span>
                    </div>
                    <h1 className="text-white font-bold text-lg">任务分解器</h1>
                  </div>
                </div>
                
                <nav className="mt-5 space-y-1 px-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.path}
                        href={item.path}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 hover:bg-gray-50 ${item.color}`}
                        onClick={(e) => {
                          e.preventDefault();
                          window.history.pushState({}, '', item.path);
                          window.dispatchEvent(new PopStateEvent('popstate'));
                          closeMobileMenu();
                        }}
                      >
                        <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        {item.name}
                      </a>
                    );
                  })}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* 主内容区域 */}
        <div className="lg:pl-64">
          <main className="min-h-screen">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/task-execution" element={<TaskExecution />} />
              <Route path="/task-execution/:taskId" element={<TaskExecution />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/settings" element={<Settings />} />
              {/* 默认重定向到首页 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
