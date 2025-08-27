import {
  addAuthorizedSession,
  clearAllAuthorizedSessions,
  extractDomainFromUrl,
  getSettings,
  isSessionAuthorized,
  isUrlBlocked
} from "~utils/storage"

// Listen for tab updates (navigation)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only act when the page has finished loading
  if (changeInfo.status !== "complete" || !tab.url) return
  
  const settings = await getSettings()
  if (!settings.isEnabled) return

  // Check if the full URL is blocked (this prevents bypassing with subpaths)
  const isBlocked = await isUrlBlocked(tab.url)
  if (!isBlocked) return

  const domain = extractDomainFromUrl(tab.url)
  if (!domain) return

  // Check if session is already authorized
  const isAuthorized = await isSessionAuthorized(domain)
  if (isAuthorized) return

  // Send message to content script to show lock screen
  try {
    await chrome.tabs.sendMessage(tabId, {
      type: "LOCK_SITE",
      domain: domain
    })
  } catch (error) {
    console.error("Failed to send lock message:", error)
  }
})

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "CHECK_LOCK_STATUS") {
    handleLockStatusCheck(message.domain, message.url)
      .then(shouldLock => sendResponse({ shouldLock }))
      .catch(error => {
        console.error("Lock status check error:", error)
        sendResponse({ shouldLock: false })
      })
    return true // Keep message channel open for async response
  }
  
  if (message.type === "VERIFY_PASSWORD") {
    handlePasswordVerification(message.password, message.domain)
      .then(success => sendResponse({ success }))
      .catch(error => {
        console.error("Password verification error:", error)
        sendResponse({ success: false })
      })
    return true // Keep message channel open for async response
  }
})

async function handleLockStatusCheck(domain: string, url: string): Promise<boolean> {
  const settings = await getSettings()
  if (!settings.isEnabled) return false

  // Check if the full URL is blocked (not just domain)
  const isBlocked = await isUrlBlocked(url)
  if (!isBlocked) return false

  // Check if session is already authorized
  const isAuthorized = await isSessionAuthorized(domain)
  return !isAuthorized
}

async function handlePasswordVerification(password: string, domain: string): Promise<boolean> {
  const { checkPassword } = await import("~utils/storage")
  
  console.log("Verifying password for domain:", domain)
  const isValid = await checkPassword(password)
  console.log("Password validation result:", isValid)
  
  if (isValid) {
    // Add authorized session for this domain
    await addAuthorizedSession(domain)
    console.log("Added authorized session for:", domain)
  }
  
  return isValid
}

// Clear authorized sessions when extension starts (optional security measure)
chrome.runtime.onStartup.addListener(async () => {
  const settings = await getSettings()
  if (settings.requirePasswordOnRestart) {
    await clearAllAuthorizedSessions()
  }
})

// Also clear on install/enable
chrome.runtime.onInstalled.addListener(async () => {
  await clearAllAuthorizedSessions()
})