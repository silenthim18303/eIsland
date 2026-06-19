/**
 * @file theme.ts
 * @description 主题相关工具函数
 * @author 鸡哥
 */

/** 判断当前是否为亮色主题 */
export function isLightTheme(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.dataset.theme === 'light' || document.body.dataset.theme === 'light';
}
