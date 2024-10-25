import { formatTime } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'

type TimerProps = { isGameOver: boolean; isGameStarted: boolean }

const Timer = ({ isGameOver, isGameStarted }: TimerProps) => {
  const [time, setTime] = useState(0) // Time in seconds
  const timerRef = useRef<NodeJS.Timeout>()
  const isPaused = useRef(false) // Track if the timer is paused

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTime((prevTime) => prevTime + 1)
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  // Pause the timer when the window loses focus
  useEffect(() => {
    const handleBlur = () => {
      stopTimer()
      isPaused.current = true
    }

    const handleFocus = () => {
      if (isPaused.current && isGameStarted && !isGameOver) {
        startTimer()
      }

      isPaused.current = false
    }

    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [isGameStarted, isGameOver])

  // Start the timer when the game starts and stop it when the game is over
  useEffect(() => {
    if (!isGameOver) {
      setTime(0)
    }

    if (isGameStarted && !isGameOver) {
      startTimer()
    } else if (isGameOver) {
      stopTimer()
    }

    return () => stopTimer()
  }, [isGameStarted, isGameOver])

  return (
    <button className="btn cor text-2xl text-[#485f7a] pointer-events-none text-balance tabular-nums select-none">
      TIME: {formatTime(time)}
    </button>
  )
}

export default Timer
