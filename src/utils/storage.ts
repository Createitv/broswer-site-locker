// Storage management for site locker extension
import { Storage } from "@plasmohq/storage"

const storage = new Storage()

export interface BlockedSite {
  id: string
  domain: string
  name?: string
  isActive: boolean
  createdAt: number
}

export interface AuthorizedSession {
  domain: string
  authorizedAt: number
  expiresAt?: number
}

// Storage keys
export const STORAGE_KEYS = {
  BLOCKED_SITES: "blocked_sites",
  PASSWORD_HASH: "password_hash",
  AUTHORIZED_SESSIONS: "authorized_sessions",
  SETTINGS: "settings"
} as const

export interface SiteLockerSettings {
  sessionTimeout: number // minutes, 0 = no timeout
  requirePasswordOnRestart: boolean
  isEnabled: boolean
}

// Default settings
export const DEFAULT_SETTINGS: SiteLockerSettings = {
  sessionTimeout: 30,
  requirePasswordOnRestart: true,
  isEnabled: true
}

// Hash password using Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

// Verify password against stored hash
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const inputHash = await hashPassword(password)
  return inputHash === storedHash
}

// Storage functions for blocked sites
export async function getBlockedSites(): Promise<BlockedSite[]> {
  const sites = await storage.get(STORAGE_KEYS.BLOCKED_SITES)
  if (!Array.isArray(sites)) {
    return []
  }
  // Filter out any non-object or malformed entries
  return sites.filter(
    (site): site is BlockedSite =>
      typeof site === "object" &&
      site !== null &&
      typeof site.id === "string" &&
      typeof site.domain === "string" &&
      typeof site.name === "string" &&
      typeof site.isActive === "boolean" &&
      typeof site.createdAt === "number"
  )
}

export async function addBlockedSite(
  domain: string,
  name?: string
): Promise<void> {
  const sites = await getBlockedSites()
  const normalizedDomain = extractHostnameFromInput(domain)
  const newSite: BlockedSite = {
    id: crypto.randomUUID(),
    domain: normalizedDomain,
    name: name || domain,
    isActive: true,
    createdAt: Date.now()
  }

  // Check if domain already exists
  const existsIndex = sites.findIndex((site) => site.domain === newSite.domain)
  if (existsIndex >= 0) {
    sites[existsIndex] = newSite
  } else {
    sites.push(newSite)
  }

  await storage.set(STORAGE_KEYS.BLOCKED_SITES, sites)
}

export async function removeBlockedSite(id: string): Promise<void> {
  const sites = await getBlockedSites()
  const filteredSites = sites.filter((site) => site.id !== id)
  await storage.set(STORAGE_KEYS.BLOCKED_SITES, filteredSites)
}

export async function toggleBlockedSite(id: string): Promise<void> {
  const sites = await getBlockedSites()
  const siteIndex = sites.findIndex((site) => site.id === id)
  if (siteIndex >= 0) {
    sites[siteIndex].isActive = !sites[siteIndex].isActive
    await storage.set(STORAGE_KEYS.BLOCKED_SITES, sites)
  }
}

// Check if a URL is blocked (supports full URL and domain blocking)
export async function isUrlBlocked(url: string): Promise<boolean> {
  const sites = await getBlockedSites()
  const urlObj = new URL(url)
  const cleanDomain = urlObj.hostname.toLowerCase().replace(/^www\./, "")

  return sites.some((site) => {
    if (!site.isActive) return false

    const siteDomain = site.domain.replace(/^www\./, "")

    // Direct domain match (covers all paths under that domain)
    if (cleanDomain === siteDomain || cleanDomain.endsWith(`.${siteDomain}`)) {
      return true
    }

    return false
  })
}

// Check if a domain is blocked (legacy function, kept for compatibility)
export async function isDomainBlocked(domain: string): Promise<boolean> {
  const sites = await getBlockedSites()
  const cleanDomain = domain.toLowerCase().replace(/^www\./, "")

  return sites.some((site) => {
    if (!site.isActive) return false

    const siteDomain = site.domain.replace(/^www\./, "")
    // Exact match or subdomain match
    return cleanDomain === siteDomain || cleanDomain.endsWith(`.${siteDomain}`)
  })
}

// Password management
export async function setPassword(password: string): Promise<void> {
  const hash = await hashPassword(password)
  await storage.set(STORAGE_KEYS.PASSWORD_HASH, hash)
}

export async function hasPassword(): Promise<boolean> {
  const hash = await storage.get(STORAGE_KEYS.PASSWORD_HASH)
  return !!hash
}

export async function checkPassword(password: string): Promise<boolean> {
  const storedHash = await storage.get(STORAGE_KEYS.PASSWORD_HASH)
  if (!storedHash) return false
  return await verifyPassword(password, storedHash)
}

// Session authorization management
export async function getAuthorizedSessions(): Promise<AuthorizedSession[]> {
  const sessions = await storage.get(STORAGE_KEYS.AUTHORIZED_SESSIONS)
  if (!Array.isArray(sessions)) {
    return []
  }
  // Filter and coerce to expected shape
  return sessions.filter(
    (s): s is AuthorizedSession =>
      typeof s === "object" &&
      s !== null &&
      typeof (s as any).domain === "string" &&
      typeof (s as any).authorizedAt === "number" &&
      (typeof (s as any).expiresAt === "number" ||
        typeof (s as any).expiresAt === "undefined")
  )
}

export async function isSessionAuthorized(domain: string): Promise<boolean> {
  const sessions = await getAuthorizedSessions()
  const host = domain.toLowerCase()
  const now = Date.now()

  // Exact host match only; do not authorize subdomains or parent domains
  const session = sessions.find((s) => s.domain.toLowerCase() === host)

  if (!session) return false

  // Check if session has expired
  if (session.expiresAt && now > session.expiresAt) {
    await removeAuthorizedSession(domain)
    return false
  }

  return true
}

export async function addAuthorizedSession(domain: string): Promise<void> {
  const sessions = await getAuthorizedSessions()
  const host = domain.toLowerCase()
  const settings = await getSettings()

  const newSession: AuthorizedSession = {
    domain: host,
    authorizedAt: Date.now(),
    expiresAt:
      settings.sessionTimeout > 0
        ? Date.now() + settings.sessionTimeout * 60 * 1000
        : undefined
  }

  // Remove existing session for this domain
  const filteredSessions = sessions.filter(
    (s) => s.domain.toLowerCase() !== host
  )
  filteredSessions.push(newSession)

  await storage.set(STORAGE_KEYS.AUTHORIZED_SESSIONS, filteredSessions)
}

export async function removeAuthorizedSession(domain: string): Promise<void> {
  const sessions = await getAuthorizedSessions()
  const host = domain.toLowerCase()
  const filteredSessions = sessions.filter(
    (s) => s.domain.toLowerCase() !== host
  )
  await storage.set(STORAGE_KEYS.AUTHORIZED_SESSIONS, filteredSessions)
}

export async function clearAllAuthorizedSessions(): Promise<void> {
  await storage.set(STORAGE_KEYS.AUTHORIZED_SESSIONS, [])
}

// Settings management
export async function getSettings(): Promise<SiteLockerSettings> {
  const settings = await storage.get(STORAGE_KEYS.SETTINGS)
  // Only spread if it's a plain object
  if (settings && typeof settings === "object" && !Array.isArray(settings)) {
    return { ...DEFAULT_SETTINGS, ...(settings as Partial<SiteLockerSettings>) }
  }
  return { ...DEFAULT_SETTINGS }
}

export async function updateSettings(
  newSettings: Partial<SiteLockerSettings>
): Promise<void> {
  const currentSettings = await getSettings()
  const updatedSettings = { ...currentSettings, ...newSettings }
  await storage.set(STORAGE_KEYS.SETTINGS, updatedSettings)
}

// Utility functions
export function extractDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.toLowerCase()
  } catch {
    return ""
  }
}

// Normalize user input that may include scheme/path to a plain hostname
export function extractHostnameFromInput(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ""
  try {
    // If input looks like a URL with protocol, use URL parser
    if (/^https?:\/\//i.test(trimmed)) {
      return new URL(trimmed).hostname.toLowerCase().replace(/^www\./, "")
    }
    // Otherwise, treat as hostname; strip leading www.
    return trimmed.toLowerCase().replace(/^www\./, "")
  } catch {
    // Fallback: basic cleanup
    return trimmed.toLowerCase().replace(/^www\./, "")
  }
}

export function isValidDomain(domain: string): boolean {
  const domainRegex =
    /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/
  return domainRegex.test(domain)
}
