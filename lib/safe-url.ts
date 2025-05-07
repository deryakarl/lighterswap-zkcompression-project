/**
 * Validates and sanitizes external URLs to prevent security issues
 * @param url The URL to validate
 * @returns A safe URL or undefined if the URL is invalid
 */
export function getSafeExternalUrl(url: string): string | undefined {
  try {
    // Create a URL object to validate the URL
    const urlObj = new URL(url)

    // Whitelist of allowed domains
    const allowedDomains = ["jup.ag", "explorer.solana.com", "solana.com", "helius.dev", "lightprotocol.com"]

    // Check if the domain is in our whitelist
    if (allowedDomains.some((domain) => urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`))) {
      return url
    }

    // If not in whitelist, return a default safe URL
    return "https://jup.ag"
  } catch (error) {
    console.error("Invalid URL:", error)
    return undefined
  }
}

/**
 * Creates a safe Jupiter swap URL
 * @param fromToken From token symbol
 * @param toToken To token symbol
 * @returns A safe Jupiter swap URL
 */
export function getJupiterSwapUrl(fromToken: string, toToken: string): string {
  return getSafeExternalUrl(`https://jup.ag/swap/${fromToken}-${toToken}`) || "https://jup.ag"
}
