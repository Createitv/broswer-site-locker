// Internationalization (i18n) system for the site locker extension

import React from "react"

export type SupportedLanguage = "zh-CN" | "en-US"

export interface TranslationStrings {
  // Extension info
  extensionName: string
  extensionDescription: string

  // Common
  enable: string
  disable: string
  enabled: string
  disabled: string
  save: string
  cancel: string
  delete: string
  confirm: string
  loading: string
  error: string
  success: string
  // Optional suffix
  optionalSuffix: string

  // Password related
  password: string
  enterPassword: string
  confirmPassword: string
  setPassword: string
  changePassword: string
  passwordSet: string
  passwordIncorrect: string
  passwordRequired: string
  passwordMinLength: string
  passwordMismatch: string

  // Site management
  blockedSites: string
  addSite: string
  removeSite: string
  siteName: string
  domain: string
  domainPlaceholder: string
  siteNamePlaceholder: string
  invalidDomain: string
  addSiteFailed: string
  noBlockedSites: string
  addWebsitesToRestrict: string

  // Lock screen
  siteLocked: string
  enterPasswordToAccess: string
  unlock: string
  verifying: string
  verificationFailed: string

  // Popup
  manageSettings: string
  currentSite: string
  authorized: string
  locked: string
  unrestricted: string
  refreshPage: string
  authorizedSessions: string
  clearAll: string
  clearAllAuthorizations: string
  extensionOff: string
  extensionOffDesc: string
  noPasswordSet: string
  noPasswordSetDesc: string
  version: string
  expires: string

  // Options
  globalSettings: string
  enableSiteLocking: string
  enableSiteLockingDesc: string
  sessionTimeout: string
  sessionTimeoutDesc: string
  requirePasswordOnRestart: string
  requirePasswordOnRestartDesc: string
  minutes: string
  noTimeoutDesc: string

  // Status
  active: string
  inactive: string
  pause: string
  resume: string
}

const translations: Record<SupportedLanguage, TranslationStrings> = {
  "zh-CN": {
    // Extension info
    extensionName: "网站锁定器",
    extensionDescription:
      "Chrome 扩展程序，阻止指定网站或网站功能，直到用户输入配置的密码。",

    // Common
    enable: "启用",
    disable: "关闭",
    enabled: "已启用",
    disabled: "已关闭",
    save: "保存",
    cancel: "取消",
    delete: "删除",
    confirm: "确认",
    loading: "加载中...",
    error: "错误",
    success: "成功",

    // Optional suffix
    optionalSuffix: "（可选）",

    // Password related
    password: "密码",
    enterPassword: "输入密码",
    confirmPassword: "确认密码",
    setPassword: "设置密码",
    changePassword: "更改密码",
    passwordSet: "已设置",
    passwordIncorrect: "密码错误，请重试",
    passwordRequired: "请输入密码",
    passwordMinLength: "密码长度至少4位",
    passwordMismatch: "两次输入的密码不一致",

    // Site management
    blockedSites: "受限网站",
    addSite: "添加网站",
    removeSite: "删除网站",
    siteName: "网站名称",
    domain: "域名",
    domainPlaceholder: "例如：example.com",
    siteNamePlaceholder: "网站名称",
    invalidDomain: "请输入有效的域名（如：example.com）",
    addSiteFailed: "添加网站失败",
    noBlockedSites: "暂无受限网站",
    addWebsitesToRestrict: "添加您要限制访问的网站",

    // Lock screen
    siteLocked: "网站已锁定",
    enterPasswordToAccess: "请输入密码以访问",
    unlock: "解锁",
    verifying: "验证中...",
    verificationFailed: "验证失败，请重试",

    // Popup
    manageSettings: "管理设置",
    currentSite: "当前网站",
    authorized: "已授权",
    locked: "已锁定",
    unrestricted: "不受限",
    refreshPage: "刷新页面",
    authorizedSessions: "已授权网站",
    clearAll: "清除全部",
    clearAllAuthorizations: "清除所有授权",
    extensionOff: "插件已关闭",
    extensionOffDesc: "网站锁定功能当前未启用",
    noPasswordSet: "未设置密码",
    noPasswordSetDesc: "请先设置解锁密码",
    version: "版本",
    expires: "到期",

    // Options
    globalSettings: "全局设置",
    enableSiteLocking: "启用网站锁定",
    enableSiteLockingDesc: "关闭后将不会锁定任何网站",
    sessionTimeout: "会话超时时间（分钟）",
    sessionTimeoutDesc: "0表示永不超时",
    requirePasswordOnRestart: "浏览器重启后需要重新验证",
    requirePasswordOnRestartDesc: "重启浏览器后清除所有授权状态",
    minutes: "分钟",
    noTimeoutDesc: "0表示永不超时",

    // Status
    active: "活跃",
    inactive: "非活跃",
    pause: "暂停",
    resume: "启用"
  },

  "en-US": {
    // Extension info
    extensionName: "Site Locker",
    extensionDescription:
      "A Chrome extension that blocks specified websites or site functionality until the user enters a configured password.",

    // Common
    enable: "Enable",
    disable: "Disable",
    enabled: "Enabled",
    disabled: "Disabled",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    confirm: "Confirm",
    loading: "Loading...",
    error: "Error",
    success: "Success",

    // Optional suffix
    optionalSuffix: " (optional)",

    // Password related
    password: "Password",
    enterPassword: "Enter password",
    confirmPassword: "Confirm password",
    setPassword: "Set Password",
    changePassword: "Change Password",
    passwordSet: "Set",
    passwordIncorrect: "Incorrect password, please try again",
    passwordRequired: "Please enter a password",
    passwordMinLength: "Password must be at least 4 characters",
    passwordMismatch: "Passwords do not match",

    // Site management
    blockedSites: "Blocked Sites",
    addSite: "Add Site",
    removeSite: "Remove Site",
    siteName: "Site Name",
    domain: "Domain",
    domainPlaceholder: "e.g. example.com",
    siteNamePlaceholder: "Site name",
    invalidDomain: "Please enter a valid domain (e.g. example.com)",
    addSiteFailed: "Failed to add site",
    noBlockedSites: "No blocked sites",
    addWebsitesToRestrict: "Add websites you want to restrict access to",

    // Lock screen
    siteLocked: "Site Locked",
    enterPasswordToAccess: "Enter password to access",
    unlock: "Unlock",
    verifying: "Verifying...",
    verificationFailed: "Verification failed, please try again",

    // Popup
    manageSettings: "Manage Settings",
    currentSite: "Current Site",
    authorized: "Authorized",
    locked: "Locked",
    unrestricted: "Unrestricted",
    refreshPage: "Refresh Page",
    authorizedSessions: "Authorized Sites",
    clearAll: "Clear All",
    clearAllAuthorizations: "Clear All Authorizations",
    extensionOff: "Extension Disabled",
    extensionOffDesc: "Site locking feature is currently disabled",
    noPasswordSet: "No Password Set",
    noPasswordSetDesc: "Please set an unlock password first",
    version: "Version",
    expires: "expires",

    // Options
    globalSettings: "Global Settings",
    enableSiteLocking: "Enable Site Locking",
    enableSiteLockingDesc: "When disabled, no sites will be locked",
    sessionTimeout: "Session Timeout (minutes)",
    sessionTimeoutDesc: "0 means no timeout",
    requirePasswordOnRestart: "Require password after browser restart",
    requirePasswordOnRestartDesc:
      "Clear all authorization states when browser restarts",
    minutes: "minutes",
    noTimeoutDesc: "0 means no timeout",

    // Status
    active: "Active",
    inactive: "Inactive",
    pause: "Pause",
    resume: "Resume"
  }
}

// Get browser language or default to English
export function getBrowserLanguage(): SupportedLanguage {
  const browserLang = navigator.language || navigator.languages?.[0]
  if (browserLang?.startsWith("zh")) {
    return "zh-CN"
  }
  // Default to English
  return "en-US"
}

// Get current language from storage or set default to English
export async function getCurrentLanguage(): Promise<SupportedLanguage> {
  try {
    const { Storage } = await import("@plasmohq/storage")
    const storage = new Storage()
    const savedLang = (await storage.get("language")) as SupportedLanguage
    
    // If no saved language, set English as default and save it
    if (!savedLang) {
      await storage.set("language", "en-US")
      return "en-US"
    }
    
    return savedLang
  } catch {
    return "en-US"
  }
}

// Set language preference
export async function setLanguage(language: SupportedLanguage): Promise<void> {
  try {
    const { Storage } = await import("@plasmohq/storage")
    const storage = new Storage()
    await storage.set("language", language)
  } catch (error) {
    console.error("Failed to save language preference:", error)
  }
}

// Get translation function for current language
export async function getTranslations(): Promise<TranslationStrings> {
  const currentLang = await getCurrentLanguage()
  return translations[currentLang]
}

// Hook for React components
export function useTranslations() {
  const [t, setT] = React.useState<TranslationStrings>(translations["en-US"])

  React.useEffect(() => {
    getTranslations().then(setT)
  }, [])

  return t
}

// For non-React usage
export { translations }
