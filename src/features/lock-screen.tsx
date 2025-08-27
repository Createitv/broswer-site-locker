import React, { useState, useEffect } from "react"
import { getTranslations, translations } from "~utils/i18n"
import { checkPassword, addAuthorizedSession } from "~utils/storage"
import type { TranslationStrings } from "~utils/i18n"

interface LockScreenProps {
  domain: string
  onUnlockSuccess: () => void
}

export const LockScreen: React.FC<LockScreenProps> = ({ domain, onUnlockSuccess }) => {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [t, setT] = useState<TranslationStrings>(translations['en-US']) // Default to English

  useEffect(() => {
    loadTranslations()

    // Listen for language changes from storage
    const handleStorageChange = async (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.language) {
        await loadTranslations()
      }
    }

    // Add storage listener for real-time language updates
    chrome.storage.onChanged.addListener(handleStorageChange)

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  const loadTranslations = async () => {
    try {
      const translations = await getTranslations()
      setT(translations)
    } catch (error) {
      console.error("Failed to load translations:", error)
      // Fallback to English if translation loading fails
      setT(translations['en-US'])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password.trim()) {
      setError(t?.passwordRequired || "Please enter password")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const isValid = await checkPassword(password)
      if (isValid) {
        await addAuthorizedSession(domain)
        onUnlockSuccess()
      } else {
        setError(t?.passwordIncorrect || "Incorrect password, please try again")
        setPassword("")
      }
    } catch (error) {
      console.error("Password verification error:", error)
      setError(t?.verificationFailed || "Verification failed, please try again")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="plasmo-fixed plasmo-inset-0 plasmo-bg-black plasmo-bg-opacity-95 plasmo-flex plasmo-items-center plasmo-justify-center plasmo-z-[99999]"
      style={{
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.95)",
        backdropFilter: "blur(10px)",
        zIndex: 999999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}>

      {/* Main lock screen container - centered */}
      <div
        className="plasmo-bg-white plasmo-rounded-2xl plasmo-p-8 plasmo-shadow-2xl plasmo-max-w-md plasmo-w-full plasmo-mx-4"
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          maxWidth: "400px",
          width: "90%",
          animation: "slideIn 0.3s ease-out",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
          margin: "0 16px"
        }}>

        {/* Lock Icon */}
        <div className="plasmo-text-center plasmo-mb-6">
          <div style={{
            color: "#ef4444",
            margin: "0 auto 24px auto",
            display: "flex",
            justifyContent: "center"
          }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <circle cx="12" cy="16" r="1" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="plasmo-text-2xl plasmo-font-semibold plasmo-text-gray-900 plasmo-text-center plasmo-mb-2"
          style={{
            fontSize: "24px",
            fontWeight: "600",
            color: "#1f2937",
            textAlign: "center",
            margin: "0 0 8px 0"
          }}>
          {t.siteLocked}
        </h2>

        {/* Subtitle */}
        <p className="plasmo-text-gray-600 plasmo-text-center plasmo-mb-8"
          style={{
            color: "#6b7280",
            textAlign: "center",
            margin: "0 0 32px 0",
            fontSize: "16px"
          }}>
          {t.enterPasswordToAccess} <span style={{ fontWeight: "600" }}>{domain}</span>
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="plasmo-space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.enterPassword}
              disabled={isLoading}
              autoFocus
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "16px",
                outline: "none",
                transition: "border-color 0.2s",
                backgroundColor: isLoading ? "#f9fafb" : "white"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3b82f6"
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb"
              }}
            />
          </div>

          {error && (
            <div style={{
              color: "#ef4444",
              fontSize: "14px",
              textAlign: "center",
              marginTop: "8px"
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "12px 24px",
              backgroundColor: isLoading ? "#94a3b8" : "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = "#2563eb"
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = "#3b82f6"
              }
            }}
          >
            {isLoading ? t.verifying : t.unlock}
          </button>
        </form>
      </div>

      {/* Plugin attribution - bottom corner, subtle */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          color: "rgba(255, 255, 255, 0.4)",
          fontSize: "11px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          userSelect: "none",
          pointerEvents: "none"
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <circle cx="12" cy="16" r="1" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span>{t?.extensionName || "Site Locker"}</span>
      </div>

      {/* Add styles */}
      <style>
        {`
          @keyframes slideIn {
            from { 
              transform: translateY(-20px); 
              opacity: 0; 
            }
            to { 
              transform: translateY(0); 
              opacity: 1; 
            }
          }
        `}
      </style>
    </div>
  )
}