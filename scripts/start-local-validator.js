const { execSync, spawn } = require("child_process")
const fs = require("fs")
const path = require("path")

// Check if solana CLI is installed
function isSolanaCliInstalled() {
  try {
    execSync("solana --version", { stdio: "ignore" })
    return true
  } catch (error) {
    return false
  }
}

// Install solana CLI if not installed
function installSolanaCli() {
  console.log("Solana CLI not found. Please install it manually:")
  console.log("Visit: https://docs.solana.com/cli/install-solana-cli-tools")
  console.log('For macOS/Linux: sh -c "$(curl -sSfL https://release.solana.com/v1.17.7/install)"')
  console.log("For Windows: Use the installer from https://github.com/solana-labs/solana/releases")
  process.exit(1)
}

// Start the local validator
function startLocalValidator() {
  console.log("Starting local test validator...")
  try {
    // Run the validator in the background
    const child = spawn("solana-test-validator", ["--reset"], {
      detached: true,
      stdio: "inherit",
    })

    // Unref the child process so it can run independently
    child.unref()

    console.log("Local test validator started!")
    console.log("RPC endpoint: http://localhost:8899")
    console.log("\nPress Ctrl+C to exit this script (validator will continue running)")
  } catch (error) {
    console.error("Failed to start local test validator:", error)
    process.exit(1)
  }
}

// Main function
function main() {
  console.log("Setting up local Solana environment...")

  if (!isSolanaCliInstalled()) {
    installSolanaCli()
  }

  startLocalValidator()
}

main()
