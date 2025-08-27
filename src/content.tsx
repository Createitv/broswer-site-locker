import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import React, { useEffect, useState } from "react"

import { LockScreen } from "~features/lock-screen"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_end"
}

/**
 * Generates a style element with adjusted CSS to work correctly within a Shadow DOM.
 */
export const getStyle = (): HTMLStyleElement => {
  const baseFontSize = 16

  let updatedCssText = cssText.replaceAll(":root", ":host(plasmo-csui)")
  const remRegex = /([\d.]+)rem/g
  updatedCssText = updatedCssText.replace(remRegex, (_match, remValue) => {
    const pixelsValue = parseFloat(remValue) * baseFontSize
    return `${pixelsValue}px`
  })

  const styleElement = document.createElement("style")
  styleElement.textContent = updatedCssText

  return styleElement
}

const PlasmoOverlay = () => {
  const [shouldShowLock, setShouldShowLock] = useState(false)
  const [currentDomain, setCurrentDomain] = useState("")

  useEffect(() => {
    const checkLockStatus = async () => {
      try {
        // Get current domain
        const domain = window.location.hostname.toLowerCase()
        setCurrentDomain(domain)

        // Send message to background script to check if site should be locked
        const response = await chrome.runtime.sendMessage({
          type: "CHECK_LOCK_STATUS",
          domain: domain,
          url: window.location.href
        })

        setShouldShowLock(response?.shouldLock || false)
      } catch (error) {
        console.error("Failed to check lock status:", error)
      }
    }

    checkLockStatus()

    // Listen for messages from background script
    const messageListener = (message: any) => {
      if (message.type === "LOCK_SITE") {
        setShouldShowLock(true)
        setCurrentDomain(message.domain)
      } else if (message.type === "UNLOCK_SITE") {
        setShouldShowLock(false)
      }
    }

    chrome.runtime.onMessage.addListener(messageListener)

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener)
    }
  }, [])

  const handleUnlockSuccess = () => {
    setShouldShowLock(false)
    // Reload the page to show unlocked content
    window.location.reload()
  }

  if (!shouldShowLock) {
    return null
  }

  return <LockScreen domain={currentDomain} onUnlockSuccess={handleUnlockSuccess} />
}

export default PlasmoOverlay
