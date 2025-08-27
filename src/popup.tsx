import React, { useEffect, useState } from "react"

import "~style.css"

import {
  clearAllAuthorizedSessions,
  extractDomainFromUrl,
  getAuthorizedSessions,
  getBlockedSites,
  getSettings,
  hasPassword,
  isDomainBlocked,
  isSessionAuthorized,
  updateSettings
} from "~utils/storage"
import type { AuthorizedSession, BlockedSite, SiteLockerSettings } from "~utils/storage"
import { getTranslations, translations } from "~utils/i18n"
import type { TranslationStrings } from "~utils/i18n"

const PopupPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null)
  const [currentDomain, setCurrentDomain] = useState("")
  const [isCurrentSiteBlocked, setIsCurrentSiteBlocked] = useState(false)
  const [isCurrentSiteAuthorized, setIsCurrentSiteAuthorized] = useState(false)
  const [blockedSites, setBlockedSites] = useState<BlockedSite[]>([])
  const [authorizedSessions, setAuthorizedSessions] = useState<AuthorizedSession[]>([])
  const [settings, setSettingsState] = useState<SiteLockerSettings>({
    sessionTimeout: 30,
    requirePasswordOnRestart: true,
    isEnabled: true
  })
  const [passwordExists, setPasswordExists] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [t, setT] = useState<TranslationStrings>(translations['en-US']) // Default to English

  useEffect(() => {
    loadData()
    loadTranslations()
  }, [])

  const loadTranslations = async () => {
    try {
      const translations = await getTranslations()
      setT(translations)
    } catch (error) {
      console.error("Failed to load translations:", error)
      // Fallback to English
      const { translations } = await import("~utils/i18n")
      setT(translations['en-US'])
    }
  }

  const loadData = async () => {
    try {
      // Get current tab info
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
      setCurrentTab(activeTab)

      if (activeTab?.url) {
        const domain = extractDomainFromUrl(activeTab.url)
        setCurrentDomain(domain)
        
        const [isBlocked, isAuthorized] = await Promise.all([
          isDomainBlocked(domain),
          isSessionAuthorized(domain)
        ])
        
        setIsCurrentSiteBlocked(isBlocked)
        setIsCurrentSiteAuthorized(isAuthorized)
      }

      // Load other data
      const [sites, sessions, currentSettings, hasPass] = await Promise.all([
        getBlockedSites(),
        getAuthorizedSessions(),
        getSettings(),
        hasPassword()
      ])

      setBlockedSites(sites)
      setAuthorizedSessions(sessions)
      setSettingsState(currentSettings)
      setPasswordExists(hasPass)
    } catch (error) {
      console.error("Failed to load popup data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleExtension = async () => {
    try {
      await updateSettings({ isEnabled: !settings.isEnabled })
      setSettingsState(prev => ({ ...prev, isEnabled: !prev.isEnabled }))
    } catch (error) {
      console.error("Failed to toggle extension:", error)
    }
  }

  const handleClearAllSessions = async () => {
    try {
      await clearAllAuthorizedSessions()
      await loadData()
    } catch (error) {
      console.error("Failed to clear sessions:", error)
    }
  }

  const openOptions = () => {
    chrome.runtime.openOptionsPage()
  }

  const reloadCurrentTab = () => {
    if (currentTab?.id) {
      chrome.tabs.reload(currentTab.id)
      window.close()
    }
  }

  if (isLoading) {
    return (
      <div className="w-80 h-96 bg-white flex items-center justify-center">
        <div className="text-gray-600">{t.loading}</div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h1 className="font-semibold">{t.extensionName}</h1>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.isEnabled}
              onChange={handleToggleExtension}
            />
            <div className="w-9 h-5 bg-white bg-opacity-30 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-white rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-400"></div>
          </label>
        </div>
      </div>

      <div className="p-4">
        {!settings.isEnabled && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="text-sm">
                <p className="text-yellow-800 font-medium">{t.extensionOff}</p>
                <p className="text-yellow-700">{t.extensionOffDesc}</p>
              </div>
            </div>
          </div>
        )}

        {!passwordExists && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="text-sm">
                <p className="text-red-800 font-medium">{t.noPasswordSet}</p>
                <p className="text-red-700">{t.noPasswordSetDesc}</p>
              </div>
            </div>
          </div>
        )}

        {/* Current Site Status */}
        {currentDomain && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">{t.currentSite}</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  isCurrentSiteBlocked 
                    ? (isCurrentSiteAuthorized ? "bg-green-500" : "bg-red-500")
                    : "bg-gray-400"
                }`}></div>
                <span className="text-sm font-mono text-gray-700">{currentDomain}</span>
              </div>
              <div className="text-xs">
                {isCurrentSiteBlocked ? (
                  isCurrentSiteAuthorized ? (
                    <span className="text-green-600">{t.authorized}</span>
                  ) : (
                    <span className="text-red-600">{t.locked}</span>
                  )
                ) : (
                  <span className="text-gray-500">{t.unrestricted}</span>
                )}
              </div>
            </div>
            
            {isCurrentSiteBlocked && (
              <button
                onClick={reloadCurrentTab}
                className="mt-2 w-full text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
              >
                {t.refreshPage}
              </button>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-900">{blockedSites.filter(s => s.isActive).length}</div>
            <div className="text-xs text-gray-600">{t.blockedSites}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-900">{authorizedSessions.length}</div>
            <div className="text-xs text-gray-600">{t.authorizedSessions}</div>
          </div>
        </div>

        {/* Active Sessions */}
        {authorizedSessions.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-900">{t.authorizedSessions}</h3>
              <button
                onClick={handleClearAllSessions}
                className="text-xs text-red-600 hover:text-red-800"
              >
                {t.clearAll}
              </button>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {authorizedSessions.map((session, index) => (
                <div key={index} className="flex items-center justify-between text-xs bg-green-50 p-2 rounded">
                  <span className="font-mono text-green-800">{session.domain}</span>
                  {session.expiresAt && (
                    <span className="text-green-600">
                      {new Date(session.expiresAt).toLocaleTimeString('zh-CN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })} {t.expires}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={openOptions}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {t.manageSettings}
          </button>
          
          {authorizedSessions.length > 0 && (
            <button
              onClick={handleClearAllSessions}
              className="w-full flex items-center justify-center px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {t.clearAllAuthorizations}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            {t.version} 0.0.1 | 
            <span className={`ml-1 ${settings.isEnabled ? "text-green-600" : "text-red-600"}`}>
              {settings.isEnabled ? t.enabled : t.disabled}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default PopupPage
