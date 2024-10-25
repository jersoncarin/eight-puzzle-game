import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatTime = (timeInSeconds: number) => {
  const hours = Math.floor(timeInSeconds / 3600)
  const minutes = Math.floor((timeInSeconds % 3600) / 60)
  const seconds = timeInSeconds % 60

  // Return formatted string
  return `${hours > 0 ? `${hours}h ` : ''}${
    minutes > 0 ? `${minutes}m ` : ''
  }${seconds}s`
}

export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))
