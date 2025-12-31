/**
 * Cache and Storage Utilities for Smello
 * Provides functions to clear cache, reset state, and troubleshoot routing issues
 */

/**
 * Clear all Smello-specific cache and local storage
 * Preserves Clerk authentication data
 */
export function clearSmelloCache() {
    if (typeof window === 'undefined') return

    // Keys to preserve (don't clear Clerk auth)
    const keysToKeep = [
        'clerk-db-jwt',
        'clerk-db-client',
        '__clerk_db_jwt',
        '__clerk_client_uat',
        '__clerk_db_jwt_exp',
    ]

    // Get all localStorage keys
    const allKeys = Object.keys(localStorage)

    // Remove Smello-specific keys
    allKeys.forEach(key => {
        // Keep Clerk keys
        if (keysToKeep.includes(key) || key.startsWith('clerk-') || key.startsWith('__clerk')) {
            return
        }

        // Remove everything else
        localStorage.removeItem(key)
    })

    // Clear sessionStorage completely
    sessionStorage.clear()

    console.log('✅ Smello cache cleared successfully')
}

/**
 * Clear only onboarding data
 * Useful for testing onboarding flow
 */
export function clearOnboardingData() {
    if (typeof window === 'undefined') return

    localStorage.removeItem('smello-user-onboarding')
    localStorage.removeItem('smello-onboarding-temp')

    console.log('✅ Onboarding data cleared')
}

/**
 * Clear only project data
 * Useful for testing project features
 */
export function clearProjectData() {
    if (typeof window === 'undefined') return

    const allKeys = Object.keys(localStorage)
    allKeys.forEach(key => {
        if (key.startsWith('smello-project-') || key === 'smello-projects') {
            localStorage.removeItem(key)
        }
    })

    console.log('✅ Project data cleared')
}

/**
 * Clear API keys
 */
export function clearApiKeys() {
    if (typeof window === 'undefined') return

    localStorage.removeItem('smello-api-keys')

    console.log('✅ API keys cleared')
}

/**
 * Clear usage counter
 */
export function clearUsageCounter() {
    if (typeof window === 'undefined') return

    localStorage.removeItem('smello-ai-usage')

    console.log('✅ Usage counter cleared')
}

/**
 * Full reset - clears everything and reloads
 * Use with caution!
 */
export function fullReset() {
    if (typeof window === 'undefined') return

    if (confirm('⚠️ This will clear ALL Smello data and reload the app. Continue?')) {
        clearSmelloCache()
        window.location.href = '/'
    }
}

/**
 * Get current cache status
 * Useful for debugging
 */
export function getCacheStatus() {
    if (typeof window === 'undefined') return null

    const onboardingData = localStorage.getItem('smello-user-onboarding')
    const apiKeys = localStorage.getItem('smello-api-keys')
    const usage = localStorage.getItem('smello-ai-usage')
    const projects = localStorage.getItem('smello-projects')

    return {
        hasOnboarding: !!onboardingData,
        onboardingData: onboardingData ? JSON.parse(onboardingData) : null,
        hasApiKeys: !!apiKeys,
        apiKeysCount: apiKeys ? JSON.parse(apiKeys).length : 0,
        hasUsage: !!usage,
        usageData: usage ? JSON.parse(usage) : null,
        hasProjects: !!projects,
        projectsCount: projects ? JSON.parse(projects).length : 0,
        totalKeys: Object.keys(localStorage).length,
    }
}

/**
 * Export all data (for backup)
 */
export function exportData() {
    if (typeof window === 'undefined') return null

    const data: Record<string, any> = {}

    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('smello-')) {
            try {
                data[key] = JSON.parse(localStorage.getItem(key) || '{}')
            } catch {
                data[key] = localStorage.getItem(key)
            }
        }
    })

    return data
}

/**
 * Import data (from backup)
 */
export function importData(data: Record<string, any>) {
    if (typeof window === 'undefined') return

    Object.entries(data).forEach(([key, value]) => {
        if (key.startsWith('smello-')) {
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
        }
    })

    console.log('✅ Data imported successfully')
}

/**
 * Download data as JSON file
 */
export function downloadDataBackup() {
    const data = exportData()
    if (!data) return

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `smello-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    console.log('✅ Backup downloaded')
}
