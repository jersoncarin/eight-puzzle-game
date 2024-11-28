import { Hash, Images } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

type LobbyProps = {
  mode: string
  setMode: (mode: string) => void
  setStarted: (started: boolean) => void
}

const clickAudio = new Audio('/assets/block.mp3')
const whooshAudio = new Audio('/assets/whoosh.mp3')
const bgAudio = new Audio('/assets/bg.mp3')

const Lobby = ({ mode, setMode, setStarted }: LobbyProps) => {
  useEffect(() => {
    bgAudio.loop = true
    bgAudio.currentTime = 0
    bgAudio.volume = 0.4
    bgAudio.play()

    return () => {
      bgAudio.currentTime = 0
      bgAudio.pause()
    }
  }, [])

  const onChangeMode = (mode: string) => {
    clickAudio.currentTime = 0
    clickAudio.play()
    setMode(mode)
  }

  const onMouseEnter = (over = '') => {
    if (over === mode) {
      return
    }

    whooshAudio.currentTime = 0.2
    whooshAudio.play()
  }

  const onMouseLeave = () => {
    whooshAudio.pause()
  }

  const onStarted = () => {
    clickAudio.currentTime = 0
    clickAudio.play()
    setStarted(true)
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <h1 className="cor text-[#1B3C73] text-2xl w-full text-center mt-3">
        Choose the mode of your board
      </h1>
      <div className="flex gap-3 mt-4 w-full">
        <button
          onMouseEnter={() => onMouseEnter('image')}
          onMouseLeave={onMouseLeave}
          onClick={() => onChangeMode('image')}
          className={cn('btn-primary group', {
            'bg-[#485f7a]': mode === 'image',
          })}
        >
          <Images
            className={cn(
              'text-[#485f7a] group-hover:text-white transition-all',
              { 'text-white': mode === 'image' }
            )}
            size={70}
          />
          <span
            className={cn(
              'font-mono text-[#485f7a] group-hover:text-white transition-all',
              { 'text-white': mode === 'image' }
            )}
          >
            Puzzle Image
          </span>
        </button>
        <button
          onMouseEnter={() => onMouseEnter('text')}
          onMouseLeave={onMouseLeave}
          onClick={() => onChangeMode('text')}
          className={cn('btn-primary group', {
            'bg-[#485f7a]': mode === 'text',
          })}
        >
          <Hash
            className={cn(
              'text-[#485f7a] group-hover:text-white transition-all',
              { 'text-white': mode === 'text' }
            )}
            size={70}
          />
          <span
            className={cn(
              'font-mono text-[#1B3C73] group-hover:text-white transition-all',
              { 'text-white': mode === 'text' }
            )}
          >
            Puzzle Number
          </span>
        </button>
      </div>
      <Button
        onMouseEnter={() => onMouseEnter('')}
        onMouseLeave={onMouseLeave}
        onClick={onStarted}
        variant="ghost"
        disabled={mode === ''}
        className={cn(
          'btn-primary mt-8 font-mono text-[#1B3C73] hover:text-white',
          { 'pointer-events-none': mode === '' }
        )}
      >
        Play
      </Button>
    </div>
  )
}

export default Lobby
