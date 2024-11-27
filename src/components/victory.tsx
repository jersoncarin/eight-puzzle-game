import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'
import { difficultyMapping } from './game'
import { getPuzzleFeedback } from '@/lib/gif-helper'

type VictoryProps = {
  moves: number
  open: boolean
  setOpen: (open: boolean) => void
  onDoAgain: () => void
  difficulty: keyof typeof difficultyMapping
}

const audio = new Audio('/assets/clap.mp3')
const clickAudio = new Audio('/assets/block.mp3')
const whooshAudio = new Audio('/assets/whoosh.mp3')

const Victory = ({
  open,
  setOpen,
  onDoAgain,
  moves,
  difficulty,
}: VictoryProps) => {
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (open) {
      const playAudio = () => {
        audio.currentTime = 0
        audio.play()
      }

      playAudio() // Start playing immediately.

      interval = setInterval(() => {
        playAudio() // Play every 5 seconds.
      }, 5000)
    } else {
      if (interval) clearInterval(interval) // Clear the interval when `open` is false.
      audio.pause()
      audio.currentTime = 0
    }

    return () => {
      if (interval) clearInterval(interval) // Cleanup interval on component unmount.
      audio.pause()
      audio.currentTime = 0
    }
  }, [open])

  const onMouseEnter = () => {
    whooshAudio.currentTime = 0.2
    whooshAudio.play()
  }

  const onMouseLeave = () => {
    whooshAudio.pause()
  }

  const { message, gif } = getPuzzleFeedback(difficulty, moves)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-2 border-[#0f3394] rounded-md shadow-none opacity-100 w-96">
        <DialogHeader>
          <div className="w-full flex justify-center my-4">
            <img className="rounded-md w-72 h-64" src={gif} />
          </div>
          <DialogDescription className="text-[#485f7a] text-2xl cor text-center">
            {message}
          </DialogDescription>
          <div className="flex justify-center pt-3">
            <button
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              onClick={() => {
                clickAudio.currentTime = 0
                clickAudio.play()
                setOpen(false)
                onDoAgain()
              }}
              className={cn(
                'btn-primary cor w-full cor text-2xl text-[#485f7a] hover:text-white'
              )}
            >
              DO ANOTHER
            </button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default Victory
