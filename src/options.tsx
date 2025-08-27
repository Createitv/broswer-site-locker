import React, { useEffect, useState } from "react"

import "~style.css"

import {
  addBlockedSite,
  getBlockedSites,
  getSettings,
  hasPassword,
  isValidDomain,
  removeBlockedSite,
  setPassword,
  toggleBlockedSite,
  updateSettings
} from "~utils/storage"
import type { BlockedSite, SiteLockerSettings } from "~utils/storage"
import { getTranslations, getCurrentLanguage, setLanguage, translations } from "~utils/i18n"
import { extractHostnameFromInput } from "~utils/storage"
import type { TranslationStrings, SupportedLanguage } from "~utils/i18n"

const OptionsPage: React.FC = () => {
  const [blockedSites, setBlockedSites] = useState<BlockedSite[]>([])
  const [settings, setSettingsState] = useState<SiteLockerSettings>({
    sessionTimeout: 30,
    requirePasswordOnRestart: false,
    isEnabled: true
  })
  const [passwordExists, setPasswordExists] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [t, setT] = useState<TranslationStrings>(translations['en-US']) // Default to English
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en-US')

  // Add site form
  const [newDomain, setNewDomain] = useState("")
  const [newSiteName, setNewSiteName] = useState("")
  const [domainError, setDomainError] = useState("")

  // Password form
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")

  useEffect(() => {
    loadData()
    loadTranslations()
  }, [])

  const loadTranslations = async () => {
    try {
      const [translations, lang] = await Promise.all([
        getTranslations(),
        getCurrentLanguage()
      ])
      setT(translations)
      setCurrentLanguage(lang)
    } catch (error) {
      console.error("Failed to load translations:", error)
      // Fallback to English
      const { translations } = await import("~utils/i18n")
      setT(translations['en-US'])
      setCurrentLanguage('en-US')
    }
  }

  const handleLanguageChange = async (language: SupportedLanguage) => {
    try {
      await setLanguage(language)
      setCurrentLanguage(language)
      await loadTranslations()
    } catch (error) {
      console.error("Failed to change language:", error)
    }
  }

  const loadData = async () => {
    try {
      const [sites, currentSettings, hasPass] = await Promise.all([
        getBlockedSites(),
        getSettings(),
        hasPassword()
      ])

      setBlockedSites(sites)
      setSettingsState(currentSettings)
      setPasswordExists(hasPass)
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault()
    setDomainError("")

    const domain = extractHostnameFromInput(newDomain)
    if (!domain) {
      setDomainError(t?.passwordRequired || "Please enter domain")
      return
    }

    if (!isValidDomain(domain)) {
      setDomainError(t?.invalidDomain || "Please enter a valid domain")
      return
    }

    try {
      await addBlockedSite(domain, newSiteName.trim() || domain)
      await loadData()
      setNewDomain("")
      setNewSiteName("")
    } catch (error) {
      console.error("Failed to add site:", error)
      setDomainError(t?.addSiteFailed || "Failed to add site")
    }
  }

  const handleRemoveSite = async (id: string) => {
    try {
      await removeBlockedSite(id)
      await loadData()
    } catch (error) {
      console.error("Failed to remove site:", error)
    }
  }

  const handleToggleSite = async (id: string) => {
    try {
      await toggleBlockedSite(id)
      await loadData()
    } catch (error) {
      console.error("Failed to toggle site:", error)
    }
  }

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")
    setPasswordSuccess("")

    if (!newPassword) {
      setPasswordError(t?.passwordRequired || "Password required")
      return
    }

    if (newPassword.length < 4) {
      setPasswordError(t?.passwordMinLength || "Password too short")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t?.passwordMismatch || "Passwords do not match")
      return
    }

    try {
      await setPassword(newPassword)
      setPasswordExists(true)
      setNewPassword("")
      setConfirmPassword("")
      setPasswordSuccess(t?.success + "!" || "Password set successfully!")
      setTimeout(() => setPasswordSuccess(""), 3000)
    } catch (error) {
      console.error("Failed to set password:", error)
      setPasswordError(t?.error || "Failed to set password")
    }
  }

  const handleSettingsChange = async (key: keyof SiteLockerSettings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettingsState(newSettings)

    try {
      await updateSettings({ [key]: value })
    } catch (error) {
      console.error("Failed to update settings:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">{t.loading}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t.extensionName}</h1>
              <p className="text-gray-600">{t.extensionDescription}</p>
            </div>
          </div>
        </div>

        {/* Language Selector */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Language / 语言</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => handleLanguageChange('zh-CN')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentLanguage === 'zh-CN'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              中文简体
            </button>
            <button
              onClick={() => handleLanguageChange('en-US')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentLanguage === 'en-US'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Global Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.globalSettings}</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">{t.enableSiteLocking}</label>
                <p className="text-sm text-gray-500">{t.enableSiteLockingDesc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.isEnabled}
                  onChange={(e) => handleSettingsChange("isEnabled", e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                {t.sessionTimeout}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  max="1440"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingsChange("sessionTimeout", parseInt(e.target.value) || 0)}
                  className="block w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-gray-500 text-sm">{t.sessionTimeoutDesc}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">{t.requirePasswordOnRestart}</label>
                <p className="text-sm text-gray-500">{t.requirePasswordOnRestartDesc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.requirePasswordOnRestart}
                  onChange={(e) => handleSettingsChange("requirePasswordOnRestart", e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Password Setup */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t.password}
            {passwordExists && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {t.passwordSet}
              </span>
            )}
          </h2>

          <form onSubmit={handleSetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {passwordExists ? t.changePassword : t.setPassword}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t.enterPassword}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.confirmPassword}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t.confirmPassword}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {passwordError && (
              <div className="text-red-600 text-sm">{passwordError}</div>
            )}

            {passwordSuccess && (
              <div className="text-green-600 text-sm">{passwordSuccess}</div>
            )}

            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {passwordExists ? t.changePassword : t.setPassword}
            </button>
          </form>
        </div>

        {/* Blocked Sites */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.blockedSites}</h2>

          {/* Add Site Form */}
          <form onSubmit={handleAddSite} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.domain}</label>
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder={t.domainPlaceholder}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.siteName}{t.optionalSuffix}</label>
                <input
                  type="text"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  placeholder={t.siteNamePlaceholder}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {domainError && (
              <div className="text-red-600 text-sm mt-2">{domainError}</div>
            )}

            <button
              type="submit"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t.addSite}
            </button>
          </form>

          {/* Sites List */}
          {blockedSites.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M34 14l-5-5-5 5M29 9v20M15 20l5 5 5-5M20 25V5" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">{t.noBlockedSites}</h3>
              <p className="mt-1 text-sm text-gray-500">{t.addWebsitesToRestrict}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {blockedSites.map((site) => (
                <div
                  key={site.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${site.isActive ? "bg-green-500" : "bg-gray-400"}`}></div>
                    <div>
                      <div className="font-medium text-gray-900">{site.name}</div>
                      <div className="text-sm text-gray-500">{site.domain}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleSite(site.id)}
                      className={`inline-flex items-center px-2.5 py-1.5 rounded text-xs font-medium ${site.isActive
                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        : "bg-green-100 text-green-800 hover:bg-green-200"
                        }`}
                    >
                      {site.isActive ? t.pause : t.resume}
                    </button>
                    <button
                      onClick={() => handleRemoveSite(site.id)}
                      className="inline-flex items-center p-1.5 rounded text-red-600 hover:bg-red-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OptionsPage