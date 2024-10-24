import { Hash, Images } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type LobbyProps = {
  mode: string
  setMode: (mode: string) => void
  setStarted: (started: boolean) => void
}

const Lobby = ({ mode, setMode, setStarted }: LobbyProps) => {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <h1 className="cor text-[#1B3C73] text-2xl w-full text-center mt-3">
        Choose the mode of your board
      </h1>
      <div className="flex gap-3 mt-4 w-full">
        <button
          onClick={() => setMode('image')}
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
          onClick={() => setMode('text')}
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
        onClick={() => setStarted(true)}
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
