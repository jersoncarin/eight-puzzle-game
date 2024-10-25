import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

type VictoryProps = {
  open: boolean
  setOpen: (open: boolean) => void
  onDoAgain: () => void
}

const Victory = ({ open, setOpen, onDoAgain }: VictoryProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-2 border-[#0f3394] rounded-md shadow-none opacity-100 w-96">
        <DialogHeader>
          <div className="w-full flex justify-center my-4">
            <img className="rounded-md w-72 h-64" src="/assets/clapping.gif" />
          </div>
          <DialogDescription className="text-[#485f7a] text-2xl cor text-center">
            Congratulations! You've successfully solved the puzzle!
          </DialogDescription>
          <div className="flex justify-center pt-3">
            <button
              onClick={() => {
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
