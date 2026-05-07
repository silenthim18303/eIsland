/*
 * eIsland - A sleek, Apple Dynamic Island inspired floating widget for Windows, built with Electron.
 * https://github.com/JNTMTMTM/eIsland
 *
 * Copyright (C) 2026 JNTMTMTM
 * Copyright (C) 2026 pyisland.com
 *
 * Original author: JNTMTMTM[](https://github.com/JNTMTMTM)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */

/**
 * @file settingsConfig.ts
 * @description 设置页面公共配置常量与默认值
 * @author 鸡哥
 */

import type { OverviewLayoutConfig } from '../../../../expand/components/OverviewTab';
import { SvgIcon } from '../../../../../../utils/SvgIcon';
import type { WeatherProvider, WeatherLocationPriority } from '../../../../../../store/utils/storage';

export const LYRICS_SOURCE_OPTIONS = [
  { value: 'auto', label: '自动（跟随播放器）' },
  { value: 'netease-only', label: '仅网易云' },
  { value: 'qqmusic-only', label: '仅 QQ音乐' },
  { value: 'kugou-only', label: '仅酷狗' },
  { value: 'sodamusic-only', label: '仅汽水音乐' },
  { value: 'lrclib-only', label: '仅 LRCLIB' },
];

export const WEATHER_PROVIDER_OPTIONS: Array<{ value: WeatherProvider; label: string }> = [
  { value: 'open-meteo', label: 'Open-Meteo 优先' },
  { value: 'uapi', label: 'UAPI 优先' },
  { value: 'qweather-pro', label: '和风天气优先' },
];

export const WEATHER_LOCATION_PRIORITY_OPTIONS: Array<{ value: WeatherLocationPriority; label: string }> = [
  { value: 'ip', label: 'IP 定位优先' },
  { value: 'custom', label: '自定义位置优先' },
];

export const SETTINGS_TABS = ['index', 'app', 'network', 'mail', 'weather', 'music', 'ai', 'shortcut', 'user', 'update', 'pluginMarket', 'about'] as const;
export type SettingsSidebarTabKey = (typeof SETTINGS_TABS)[number];
export type AppSettingsPageKey = 'layout-preview' | 'maxexpand-layout' | 'album' | 'hide-process-list' | 'position' | 'theme' | 'language' | 'behavior' | 'animation' | 'url-parser' | 'clipboard-history' | 'alarm' | 'autostart';
export type WeatherSettingsPageKey = 'location' | 'provider';
export type MailSettingsPageKey = 'account' | 'imap' | 'preferences';
export type AiSettingsPageKey = 'general' | 'r1pxc' | 'ollama';
export type MusicSettingsPageKey = 'whitelist' | 'lyrics' | 'smtc';
export type MusicNavCardKey = 'music-whitelist' | 'music-lyrics' | 'music-smtc';
export type SettingsTabLabelKey = SettingsSidebarTabKey | AppSettingsPageKey | AiSettingsPageKey | MusicNavCardKey;

export const SETTINGS_TAB_LABELS: Record<SettingsTabLabelKey, string> = {
  index: '快速导航',
  app: '软件设置',
  'layout-preview': '布局预览',
  'maxexpand-layout': '全展开布局',
  album: '相册配置',
  'hide-process-list': '隐藏窗口管理',
  position: '位置校准',
  theme: '主题外观',
  language: '语言切换',
  behavior: '交互行为',
  animation: '软件动画',
  'url-parser': 'URL解析',
  'clipboard-history': '剪贴板历史',
  alarm: '闹钟配置',
  autostart: '实用工具',
  network: '网络配置',
  mail: '邮箱配置',
  weather: '天气配置',
  music: '歌曲设置',
  'music-whitelist': '播放器白名单',
  'music-lyrics': '歌词源',
  'music-smtc': 'SMTC',
  ai: 'AI Agent',
  general: '通用配置',
  r1pxc: 'r1pxc Agent',
  ollama: 'Ollama 本地',
  shortcut: '快捷键',
  user: '用户中心',
  update: '更新设置',
  pluginMarket: '插件市场',
  about: '关于软件',
};

export const SETTINGS_TAB_DESCRIPTIONS: Record<Exclude<SettingsTabLabelKey, 'index'>, string> = {
  app: '布局预览与隐藏进程规则配置',
  'layout-preview': '进入布局预览并调整左右控件展示。',
  'maxexpand-layout': '自定义全展开界面各页面的显示顺序与可见性。',
  album: '相册轮播与相册入口相关配置。',
  'hide-process-list': '管理隐藏窗口名单与自动隐藏规则。',
  position: '动态调整灵动岛位置并保存',
  theme: '切换深色、浅色或跟随系统主题。',
  language: '切换应用显示语言并即时生效。',
  behavior: '配置鼠标移开后是否自动收回。',
  animation: '灵动岛弹性动画与动画速度配置。',
  'url-parser': '配置剪贴板 URL 识别模式与黑名单。',
  'clipboard-history': '配置剪贴板历史记录能力与条数。',
  alarm: '配置闹钟提醒音、贪睡与通知行为。',
  autostart: '应用控制、日志与开机启动配置。',
  network: '请求超时与网络行为设置',
  mail: '配置 IMAP 收信参数',
  weather: '天气接口优先级设置',
  music: '播放器白名单与歌词来源',
  'music-whitelist': '配置允许接入灵动岛的播放器。',
  'music-lyrics': '选择歌词来源与显示模式。',
  'music-smtc': '系统媒体传输控制相关配置。',
  ai: 'AI 服务与 Prompt 配置',
  general: '模型凭据与工作区配置。',
  r1pxc: 'r1pxc Agent 头像与个性化配置。',
  ollama: '本地 Ollama 模型与连接配置。',
  shortcut: '隐藏、关闭、截图快捷键',
  user: '登录、资料、注销等账号操作',
  update: '检查与下载软件更新',
  pluginMarket: '插件市场入口与安装管理（开发中）',
  about: '版本信息与项目链接',
};

export const SETTINGS_TAB_ICONS: Partial<Record<SettingsTabLabelKey, string>> = {
  'layout-preview': SvgIcon.LAYOUT,
  'maxexpand-layout': SvgIcon.LAYOUT,
  album: SvgIcon.PHOTO_ALBUM,
  'hide-process-list': SvgIcon.TASK_MANAGER,
  position: SvgIcon.MOVE,
  network: SvgIcon.NETWORK,
  mail: SvgIcon.MAIL,
  weather: SvgIcon.WEATHER,
  music: SvgIcon.LRC,
  'music-whitelist': SvgIcon.MUSIC,
  'music-lyrics': SvgIcon.LRC,
  'music-smtc': SvgIcon.SMTC,
  ai: SvgIcon.AI,
  shortcut: SvgIcon.SHORTCUT_KEY,
  update: SvgIcon.REVERT,
  about: SvgIcon.ABOUT,
  user: SvgIcon.USER,
  theme: SvgIcon.THEME,
  language: SvgIcon.LANGUAGE,
  behavior: SvgIcon.INTERACTION,
  animation: SvgIcon.ANIMATION,
  'url-parser': SvgIcon.LINK,
  'clipboard-history': SvgIcon.COPY,
  alarm: SvgIcon.TIMER,
  autostart: SvgIcon.CONTINUE,
};

export const NETWORK_TIMEOUT_OPTIONS = [
  { label: '5 秒', value: 5000 },
  { label: '10 秒（默认）', value: 10000 },
  { label: '15 秒', value: 15000 },
  { label: '20 秒', value: 20000 },
  { label: '30 秒', value: 30000 },
];

export const LAYOUT_STORE_KEY = 'overview-layout';
export const DEFAULT_LAYOUT: OverviewLayoutConfig = { left: 'shortcuts', right: 'todo' };

export const MAXEXPAND_NAV_LAYOUT_STORE_KEY = 'maxexpand-nav-layout';

export interface MaxExpandNavItem {
  id: string;
  visible: boolean;
}

export type MaxExpandNavLayoutConfig = MaxExpandNavItem[];

export const MAXEXPAND_CONFIGURABLE_TABS: string[] = ['todo', 'urlFavorites', 'album', 'mail', 'localFileSearch', 'clipboardHistory', 'aiChat', 'memo', 'countdown', 'alarm'];

export const MAXEXPAND_ALWAYS_VISIBLE_TABS: Set<string> = new Set(['aiChat']);

export const MAXEXPAND_TAB_LABELS: Record<string, string> = {
  todo: '待办事项',
  urlFavorites: 'URL 收藏',
  album: '相册',
  mail: '邮箱',
  localFileSearch: '文件查找',
  clipboardHistory: '剪贴板',
  aiChat: 'AI 对话',
  memo: '备忘录',
  countdown: '倒数日',
  alarm: '闹钟',
};

export const DEFAULT_MAXEXPAND_NAV_LAYOUT: MaxExpandNavLayoutConfig = MAXEXPAND_CONFIGURABLE_TABS.map((id) => ({ id, visible: true }));
export const APP_SETTINGS_PAGES: AppSettingsPageKey[] = ['layout-preview', 'maxexpand-layout', 'album', 'hide-process-list', 'position', 'theme', 'language', 'behavior', 'animation', 'url-parser', 'clipboard-history', 'alarm', 'autostart'];
export const WEATHER_SETTINGS_PAGES: WeatherSettingsPageKey[] = ['location', 'provider'];
export const WEATHER_SETTINGS_PAGE_LABELS: Record<WeatherSettingsPageKey, string> = {
  location: '定位配置',
  provider: '接口配置',
};
export const MAIL_SETTINGS_PAGES: MailSettingsPageKey[] = ['account', 'imap', 'preferences'];
export const MAIL_SETTINGS_PAGE_LABELS: Record<MailSettingsPageKey, string> = {
  account: '账户',
  imap: 'IMAP',
  preferences: '收信设置',
};
export const AI_SETTINGS_PAGES: AiSettingsPageKey[] = ['general', 'r1pxc', 'ollama'];
export const AI_SETTINGS_PAGE_LABELS: Record<AiSettingsPageKey, string> = {
  general: '通用配置',
  r1pxc: 'r1pxc Agent',
  ollama: 'Ollama 本地',
};
export const MUSIC_SETTINGS_PAGES: MusicSettingsPageKey[] = ['whitelist', 'lyrics', 'smtc'];
export const MUSIC_SETTINGS_PAGE_LABELS: Record<MusicSettingsPageKey, string> = {
  whitelist: '白名单',
  lyrics: '歌词源',
  smtc: 'SMTC',
};

export interface NavCardDef {
  id: string;
  label: string;
  desc: string;
  icon?: string;
  tab: SettingsSidebarTabKey;
  appPage?: AppSettingsPageKey;
  musicPage?: MusicSettingsPageKey;
  actionId?: string;
}

export const NAV_CARDS: NavCardDef[] = [
  { id: 'user-pro', label: 'PRO功能', desc: '查看 Free 与 Pro 计划权益及当前订阅价格', icon: SvgIcon.PRO, tab: 'user', actionId: 'user-pro' },
  { id: 'user-recharge', label: '余额充值', desc: '为 AI 助手对话余额充值', icon: SvgIcon.RECHARGE, tab: 'user', actionId: 'user-recharge' },
  { id: 'user', label: SETTINGS_TAB_LABELS.user, desc: SETTINGS_TAB_DESCRIPTIONS.user, icon: SETTINGS_TAB_ICONS.user, tab: 'user' },
  { id: 'layout-preview', label: SETTINGS_TAB_LABELS['layout-preview'], desc: SETTINGS_TAB_DESCRIPTIONS['layout-preview'], icon: SETTINGS_TAB_ICONS['layout-preview'], tab: 'app', appPage: 'layout-preview' },
  { id: 'maxexpand-layout', label: SETTINGS_TAB_LABELS['maxexpand-layout'], desc: SETTINGS_TAB_DESCRIPTIONS['maxexpand-layout'], icon: SETTINGS_TAB_ICONS['maxexpand-layout'], tab: 'app', appPage: 'maxexpand-layout' },
  { id: 'album', label: SETTINGS_TAB_LABELS.album, desc: SETTINGS_TAB_DESCRIPTIONS.album, icon: SETTINGS_TAB_ICONS.album, tab: 'app', appPage: 'album' },
  { id: 'hide-process-list', label: SETTINGS_TAB_LABELS['hide-process-list'], desc: SETTINGS_TAB_DESCRIPTIONS['hide-process-list'], icon: SETTINGS_TAB_ICONS['hide-process-list'], tab: 'app', appPage: 'hide-process-list' },
  { id: 'position', label: SETTINGS_TAB_LABELS.position, desc: SETTINGS_TAB_DESCRIPTIONS.position, icon: SETTINGS_TAB_ICONS.position, tab: 'app', appPage: 'position' },
  { id: 'theme', label: SETTINGS_TAB_LABELS.theme, desc: SETTINGS_TAB_DESCRIPTIONS.theme, icon: SETTINGS_TAB_ICONS.theme, tab: 'app', appPage: 'theme' },
  { id: 'language', label: SETTINGS_TAB_LABELS.language, desc: SETTINGS_TAB_DESCRIPTIONS.language, icon: SETTINGS_TAB_ICONS.language, tab: 'app', appPage: 'language' },
  { id: 'behavior', label: SETTINGS_TAB_LABELS.behavior, desc: SETTINGS_TAB_DESCRIPTIONS.behavior, icon: SETTINGS_TAB_ICONS.behavior, tab: 'app', appPage: 'behavior' },
  { id: 'animation', label: SETTINGS_TAB_LABELS.animation, desc: SETTINGS_TAB_DESCRIPTIONS.animation, icon: SETTINGS_TAB_ICONS.animation, tab: 'app', appPage: 'animation' },
  { id: 'url-parser', label: SETTINGS_TAB_LABELS['url-parser'], desc: SETTINGS_TAB_DESCRIPTIONS['url-parser'], icon: SETTINGS_TAB_ICONS['url-parser'], tab: 'app', appPage: 'url-parser' },
  { id: 'clipboard-history', label: SETTINGS_TAB_LABELS['clipboard-history'], desc: SETTINGS_TAB_DESCRIPTIONS['clipboard-history'], icon: SETTINGS_TAB_ICONS['clipboard-history'], tab: 'app', appPage: 'clipboard-history' },
  { id: 'alarm', label: SETTINGS_TAB_LABELS.alarm, desc: SETTINGS_TAB_DESCRIPTIONS.alarm, icon: SETTINGS_TAB_ICONS.alarm, tab: 'app', appPage: 'alarm' },
  { id: 'autostart', label: SETTINGS_TAB_LABELS.autostart, desc: SETTINGS_TAB_DESCRIPTIONS.autostart, icon: SETTINGS_TAB_ICONS.autostart, tab: 'app', appPage: 'autostart' },
  { id: 'network', label: SETTINGS_TAB_LABELS.network, desc: SETTINGS_TAB_DESCRIPTIONS.network, icon: SETTINGS_TAB_ICONS.network, tab: 'network' },
  { id: 'mail', label: SETTINGS_TAB_LABELS.mail, desc: SETTINGS_TAB_DESCRIPTIONS.mail, icon: SETTINGS_TAB_ICONS.mail, tab: 'mail' },
  { id: 'weather', label: SETTINGS_TAB_LABELS.weather, desc: SETTINGS_TAB_DESCRIPTIONS.weather, icon: SETTINGS_TAB_ICONS.weather, tab: 'weather' },
  { id: 'ai', label: SETTINGS_TAB_LABELS.ai, desc: SETTINGS_TAB_DESCRIPTIONS.ai, icon: SETTINGS_TAB_ICONS.ai, tab: 'ai' },
  { id: 'shortcut', label: SETTINGS_TAB_LABELS.shortcut, desc: SETTINGS_TAB_DESCRIPTIONS.shortcut, icon: SETTINGS_TAB_ICONS.shortcut, tab: 'shortcut' },
  { id: 'guide', label: '使用教程', desc: '查看灵动岛功能引导与操作说明。', icon: SvgIcon.GUIDE, tab: 'index', actionId: 'guide' },
  { id: 'about', label: SETTINGS_TAB_LABELS.about, desc: SETTINGS_TAB_DESCRIPTIONS.about, icon: SETTINGS_TAB_ICONS.about, tab: 'about' },
  { id: 'music-whitelist', label: SETTINGS_TAB_LABELS['music-whitelist'], desc: SETTINGS_TAB_DESCRIPTIONS['music-whitelist'], icon: SETTINGS_TAB_ICONS['music-whitelist'], tab: 'music', musicPage: 'whitelist' },
  { id: 'music-lyrics', label: SETTINGS_TAB_LABELS['music-lyrics'], desc: SETTINGS_TAB_DESCRIPTIONS['music-lyrics'], icon: SETTINGS_TAB_ICONS['music-lyrics'], tab: 'music', musicPage: 'lyrics' },
  { id: 'music-smtc', label: SETTINGS_TAB_LABELS['music-smtc'], desc: SETTINGS_TAB_DESCRIPTIONS['music-smtc'], icon: SETTINGS_TAB_ICONS['music-smtc'], tab: 'music', musicPage: 'smtc' },
];

export const DEFAULT_NAV_ORDER: string[] = NAV_CARDS.map((c) => c.id);
export const NAV_CARDS_MAP = new Map(NAV_CARDS.map((c) => [c.id, c]));

export interface SearchableSettingItem {
  label: string;
  desc: string;
  tab: SettingsSidebarTabKey;
  appPage?: AppSettingsPageKey;
  musicPage?: MusicSettingsPageKey;
  aiPage?: AiSettingsPageKey;
}

export const SEARCHABLE_SETTINGS: SearchableSettingItem[] = [
  // ── 软件设置 > 布局预览 ──
  { label: '总览布局预览', desc: '实时显示左右控件组合后的 Expand 态灵动岛样式，切换下方控件可即时预览。', tab: 'app', appPage: 'layout-preview' },
  { label: '控件组合', desc: '分别选择左右两侧展示的控件，切换后自动保存。', tab: 'app', appPage: 'layout-preview' },
  // ── 软件设置 > 全展开布局 ──
  { label: '全展开导航预览', desc: '预览底部导航点的排列顺序，灰色表示已隐藏的页面。', tab: 'app', appPage: 'maxexpand-layout' },
  { label: '页面排序与可见性', desc: '拖拽调整页面顺序，点击开关控制页面显示或隐藏。', tab: 'app', appPage: 'maxexpand-layout' },
  // ── 软件设置 > 相册 ──
  { label: '相册轮播方式', desc: '配置总览相册卡片的轮播顺序、频率、展示内容与点击行为', tab: 'app', appPage: 'album' },
  { label: '展示资源', desc: '选择总览相册卡片参与轮播的资源类型', tab: 'app', appPage: 'album' },
  { label: '点击卡片行为', desc: '配置点击总览相册卡片后的行为', tab: 'app', appPage: 'album' },
  { label: '自动播放与视频行为', desc: '仅影响总览相册轮播卡片，不影响相册主页面。', tab: 'app', appPage: 'album' },
  // ── 软件设置 > 隐藏窗口管理 ──
  { label: '隐藏窗口管理', desc: '当黑名单进程对应窗口处于焦点状态时，将立即隐藏灵动岛；失去焦点后自动显示。', tab: 'app', appPage: 'hide-process-list' },
  { label: '当前运行的窗口', desc: '在列表中点击可将窗口加入 / 移出黑名单，支持按进程名搜索。', tab: 'app', appPage: 'hide-process-list' },
  // ── 软件设置 > 位置校准 ──
  { label: '显示器选择', desc: '多显示器环境可指定灵动岛显示器。', tab: 'app', appPage: 'position' },
  { label: '快速微调', desc: '每次按钮点击以 10px 步进移动灵动岛位置，并自动保存。', tab: 'app', appPage: 'position' },
  { label: '精确偏移', desc: '手动输入水平 / 垂直偏移量（单位 px），回车或点击"应用"后生效。', tab: 'app', appPage: 'position' },
  // ── 软件设置 > 主题外观 ──
  { label: '主题模式', desc: '选择深色、浅色或跟随系统主题', tab: 'app', appPage: 'theme' },
  { label: '独立窗口控制按钮样式', desc: '启用后，独立窗口右上角将显示 macOS 风格三色圆点控制按钮', tab: 'app', appPage: 'theme' },
  { label: '壁纸背景', desc: '选择内置壁纸，或从本地导入图片 / 视频作为灵动岛背景', tab: 'app', appPage: 'theme' },
  { label: '背景显示效果', desc: '调整背景的透明度与模糊度', tab: 'app', appPage: 'theme' },
  { label: '视频播放', desc: '背景视频的填充、声音与播放控制', tab: 'app', appPage: 'theme' },
  { label: '灵动岛透明度', desc: '数值越低越透明（10% - 100%）', tab: 'app', appPage: 'theme' },
  // ── 软件设置 > 语言 ──
  { label: '显示语言', desc: '切换后将立即应用到支持多语言的界面文案', tab: 'app', appPage: 'language' },
  // ── 软件设置 > 交互行为 ──
  { label: '鼠标移开自动收回', desc: '启用后，鼠标离开灵动岛时将自动回到空闲状态（若正在播放音乐则切到歌词态）', tab: 'app', appPage: 'behavior' },
  { label: '空闲态点击展开', desc: '启用后，鼠标悬停在灵动岛上不会自动展开，需要点击才能展开，后续交互不受影响', tab: 'app', appPage: 'behavior' },
  { label: '待办事项 / 倒数日 / 设置 打开方式', desc: '选择点击导航时，在灵动岛内显示还是打开独立窗口', tab: 'app', appPage: 'behavior' },
  { label: '悬停界面截图按钮模式', desc: '配置 hover 界面的截图按钮触发选区截图或显示器截图', tab: 'app', appPage: 'behavior' },
  // ── 软件设置 > 动画 ──
  { label: '灵动岛弹性动画', desc: '关闭后，展开和收起动画将变得更加平滑内敛，消除弹跳感', tab: 'app', appPage: 'animation' },
  { label: '灵动岛动画速度', desc: '控制灵动岛状态切换时的过渡动画快慢', tab: 'app', appPage: 'animation' },
  { label: 'Expand 切换动画', desc: '启用后，展开态切换页面时将播放左右滑动过渡动画', tab: 'app', appPage: 'animation' },
  { label: 'MaxExpand 切换动画', desc: '启用后，最大展开态切换页面时将播放左右滑动过渡动画', tab: 'app', appPage: 'animation' },
  // ── 软件设置 > URL 解析 ──
  { label: '剪贴板 URL 监听', desc: '启用后，检测到剪贴板含链接时会弹出询问通知', tab: 'app', appPage: 'url-parser' },
  { label: '识别项目', desc: '选择剪贴板中被识别为 URL 的匹配范围，并可在收藏界面临时静音通知。', tab: 'app', appPage: 'url-parser' },
  { label: 'URL 黑名单（按域名）', desc: '命中黑名单域名时：单个链接不弹窗，多链接自动剔除', tab: 'app', appPage: 'url-parser' },
  // ── 软件设置 > 剪贴板历史 ──
  { label: '历史记录开关', desc: '关闭后不再追加新的剪贴板记录，已有记录会保留。', tab: 'app', appPage: 'clipboard-history' },
  { label: '最大保留条数', desc: '新记录会在前端按该条数滚动保存。', tab: 'app', appPage: 'clipboard-history' },
  { label: '复制后自动退出', desc: '复制历史项后自动退出最大展开；有歌曲时回到歌曲态，无歌曲时回到 idle。', tab: 'app', appPage: 'clipboard-history' },
  { label: '数据管理', desc: '可一键清空已保存的剪贴板历史记录。', tab: 'app', appPage: 'clipboard-history' },
  // ── 软件设置 > 闹钟 ──
  { label: '提醒音', desc: '闹钟到点时播放提示音效。', tab: 'app', appPage: 'alarm' },
  { label: '系统通知', desc: '闹钟触发时发送系统通知提醒。', tab: 'app', appPage: 'alarm' },
  { label: '贪睡时长', desc: '点击贪睡后延迟再次提醒的分钟数。', tab: 'app', appPage: 'alarm' },
  { label: '自动关闭', desc: '闹钟响铃后自动关闭的分钟数，设为"不自动关闭"则需手动操作。', tab: 'app', appPage: 'alarm' },
  // ── 软件设置 > 实用工具 ──
  { label: '实用工具', desc: '常用应用操作与日志工具', tab: 'app', appPage: 'autostart' },
  { label: '开机自启', desc: '设置系统启动时是否自动运行灵动岛', tab: 'app', appPage: 'autostart' },
  // ── 网络配置 ──
  { label: '请求超时时间', desc: '设置网络请求的最长等待时间，网络较差时可适当增大', tab: 'network' },
  { label: '静态资源节点', desc: '所有用户默认使用 R2，PRO 用户可选择 R2/COS/OSS。', tab: 'network' },
  // ── 邮箱配置 ──
  { label: '账户信息', desc: '邮箱地址用于展示与默认发件人信息。', tab: 'mail' },
  { label: 'IMAP', desc: '用于收信、同步收件箱和文件夹状态。', tab: 'mail' },
  { label: '收信设置', desc: '控制每次获取邮件的数量和其他收信行为。', tab: 'mail' },
  // ── 天气配置 ──
  { label: '定位来源优先级', desc: '选择天气定位优先使用 IP 自动定位或自定义位置', tab: 'weather' },
  { label: '自定义城市', desc: '仅在"自定义位置优先"生效，可先测试再保存；支持中文 / 拼音 / 英文。', tab: 'weather' },
  { label: '天气接口优先级', desc: '可选择优先使用 Open-Meteo 或 UAPI，失败时自动切换到另一源', tab: 'weather' },
  { label: '启动天气预警提醒', desc: '应用启动自动检查更新前，先请求和风天气预警并提示；确认关闭后再继续检查更新。', tab: 'weather' },
  // ── 歌曲设置 > 白名单 ──
  { label: '播放器白名单', desc: '只有白名单内的播放器才会触发歌曲信息获取', tab: 'music', musicPage: 'whitelist' },
  { label: '添加播放器', desc: '手动输入播放器进程名，或自动从当前 SMTC 会话中检测', tab: 'music', musicPage: 'whitelist' },
  // ── 歌曲设置 > 歌词源 ──
  { label: '歌词源', desc: '自动模式根据 SMTC 检测到的播放器进程选择对应源，失败后依次尝试其他源，最后使用 LRCLIB 兜底', tab: 'music', musicPage: 'lyrics' },
  { label: '歌词显示', desc: '控制歌词界面的展示效果', tab: 'music', musicPage: 'lyrics' },
  // ── 歌曲设置 > SMTC ──
  { label: 'SMTC 自动取消订阅', desc: '用于清理长时间无更新的播放会话，默认永不取消订阅', tab: 'music', musicPage: 'smtc' },
  // ── AI Agent ──
  { label: '模型凭据', desc: '用于 Agent 中转调用的自定义 API 凭据（可选）', tab: 'ai', aiPage: 'general' },
  { label: 'Agent 工作区', desc: '配置 Agent 可操作的文件目录,所有文件读写、搜索、命令执行仅限于工作区内', tab: 'ai', aiPage: 'general' },
  { label: 'r1pxc Agent 头像配置', desc: '支持拖入图片或从文件资源管理器选择，不支持 URL', tab: 'ai', aiPage: 'r1pxc' },
  { label: 'Ollama 本地模型', desc: '配置本地 Ollama 服务地址与默认模型，在模型下拉中选择 ollama 即可使用', tab: 'ai', aiPage: 'ollama' },
  // ── 快捷键 > 窗口操作 ──
  { label: '隐藏/显示快捷键', desc: '点击"修改"后按下组合键（如 Alt+X、Ctrl+Shift+H）', tab: 'shortcut' },
  { label: '关闭灵动岛快捷键', desc: '按下此快捷键将立即关闭灵动岛应用（如 Alt+Q、Ctrl+Shift+Q）', tab: 'shortcut' },
  { label: '还原默认位置快捷键', desc: '按下此快捷键将把灵动岛恢复到默认顶部居中位置', tab: 'shortcut' },
  { label: '隐藏/显示托盘图标快捷键', desc: '按下此快捷键将隐藏或显示系统托盘中的灵动岛图标', tab: 'shortcut' },
  { label: '显示配置窗口快捷键', desc: '仅在独立窗口模式下生效：按下后将打开独立配置窗口并切换到设置页', tab: 'shortcut' },
  { label: '打开剪贴板历史快捷键', desc: '按下后将打开灵动岛并直接切换到剪贴板历史界面', tab: 'shortcut' },
  { label: '切换鼠标穿透快捷键', desc: '按下此快捷键将锁定或解锁鼠标穿透状态，锁定后灵动岛不会拦截鼠标事件', tab: 'shortcut' },
  { label: '切换 UI 状态锁定快捷键', desc: '按下后锁定当前 UI 状态，锁定期间不会因鼠标进入/移出或自动逻辑切换状态，再次按下解锁', tab: 'shortcut' },
  // ── 快捷键 > AI ──
  { label: 'Agent 语音输入快捷键', desc: '长按此快捷键将触发 Agent 语音输入，释放后自动关闭', tab: 'shortcut' },
  // ── 快捷键 > 截图 ──
  { label: '选区截图快捷键', desc: '按下此快捷键将触发截图选区流程（如 Alt+A、Ctrl+Shift+A）', tab: 'shortcut' },
  // ── 快捷键 > 媒体 ──
  { label: '快速切换歌曲快捷键', desc: '按下后触发系统下一曲媒体按键（仅白名单播放器生效）', tab: 'shortcut' },
  { label: '暂停/播放歌曲快捷键', desc: '按下后触发系统播放/暂停媒体按键（仅白名单播放器生效）', tab: 'shortcut' },
  // ── 更新设置 ──
  { label: '版本信息', desc: '查看当前版本并选择更新源,应用所有补丁包均通过该更新源下载', tab: 'update' },
  { label: '检查与安装', desc: '手动触发检查,有新版本时可下载安装;下载完成后点击"安装并重启"应用更新', tab: 'update' },
];
