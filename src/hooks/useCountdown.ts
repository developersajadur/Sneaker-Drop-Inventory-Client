import { useState, useEffect } from 'react'

export function useCountdown(expiresAt: string | null): number {
  // Tick counter — only used to trigger re-renders every second.
  // The actual remaining seconds are computed SYNCHRONOUSLY below,
  // so the value is always correct on the first render after a new
  // expiresAt is set (fixes purchase button staying disabled).
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!expiresAt) return

    const initial = Math.max(
      0,
      Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000),
    )
    if (initial <= 0) return

    const interval = setInterval(() => {
      const diff = Math.max(
        0,
        Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000),
      )
      setTick((t) => t + 1)
      if (diff <= 0) clearInterval(interval)
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt])

  // Synchronous computation — correct on every render, no state lag
  if (!expiresAt) return 0
  return Math.max(
    0,
    Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000),
  )
}
