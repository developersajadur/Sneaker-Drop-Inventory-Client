interface CountdownTimerProps {
  secondsLeft: number
}

export default function CountdownTimer({ secondsLeft }: CountdownTimerProps) {
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  const isUrgent = secondsLeft <= 10

  return (
    <span
      className={`text-sm font-mono font-medium ${
        isUrgent ? 'text-destructive' : 'text-muted-foreground'
      }`}
    >
      {display}
    </span>
  )
}
