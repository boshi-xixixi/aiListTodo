import { useEffect } from 'react';
import { UserSettings } from '../types';
import { localStorageService } from '../services/localStorage';

/**
 * 主题色彩管理 Hook
 * 根据用户设置动态应用主题色彩
 */
export const useThemeColor = () => {
  useEffect(() => {
    const applyThemeColor = () => {
      const settings: UserSettings = localStorageService.getSettings();
      const primaryColor = settings.theme?.primaryColor || 'orange';
      
      // 设置 data-theme 属性到 document.documentElement
      document.documentElement.setAttribute('data-theme', primaryColor);
    };

    // 初始应用主题色彩
    applyThemeColor();

    // 监听存储变化，当设置更新时重新应用主题
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userSettings') {
        applyThemeColor();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  /**
   * 手动更新主题色彩
   * @param color 主题色彩
   */
  const updateThemeColor = (color: 'orange' | 'green' | 'blue' | 'purple') => {
    document.documentElement.setAttribute('data-theme', color);
  };

  return { updateThemeColor };
};