// This is a simplified version of the sound effects module that doesn't use the Audio object
// to avoid issues with server-side rendering

/**
 * Play a sound effect (stub implementation that does nothing)
 */
export function playSoundEffect(sound: string): void {
  // Do nothing - this is a stub implementation
  console.log(`[Sound Effect]: ${sound} (disabled for SSR compatibility)`)
}
