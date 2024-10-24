import { useEffect, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { scores, asyncScramblePuzzle, SOLVED_STATE } from '@/lib/game-helper'
import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type GameProps = {
  mode: string
}

const difficultyMapping = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
} as const

const Game = ({ mode }: GameProps) => {
  console.log(mode)
  // Initial state of the board (0 represents the empty space)
  const [board, setBoard] = useState<number[]>(SOLVED_STATE)
  const [tileClickedIndex, setTileClickedIndex] = useState<number | null>(null)
  const [draggedTileIndex, setDraggedTileIndex] = useState<number | null>(null)
  const [difficulty, setDifficulty] =
    useState<keyof typeof difficultyMapping>('easy')
  const [moves, setMoves] = useState(0)
  const [isScrambling, setIsScrambling] = useState(false)
  const [originalBoard, setOriginalBoard] = useState<number[]>([])

  // Scramble the puzzle initially in easy mode
  useEffect(() => {
    const { moves, minDifficulty } = scores[difficulty]

    setIsScrambling(true)

    asyncScramblePuzzle(SOLVED_STATE, moves, minDifficulty).then((puzzle) => {
      setBoard(puzzle)
      setMoves(0)
      setIsScrambling(false)
      setOriginalBoard(puzzle)
    })
  }, [])

  // Handle difficulty change
  const handleDifficultyChange = (
    difficulty: keyof typeof difficultyMapping
  ) => {
    const { moves, minDifficulty } = scores[difficulty]

    setIsScrambling(true)
    setDifficulty(difficulty)

    asyncScramblePuzzle(SOLVED_STATE, moves, minDifficulty).then((puzzle) => {
      setBoard(puzzle)
      setMoves(0)
      setIsScrambling(false)
      setOriginalBoard(puzzle)
    })
  }

  // Helper to get the position of the empty space
  const getEmptyIndex = () => board.indexOf(0)

  // Helper to check if the move is valid (adjacent to empty space)
  const canMove = (index: number) => {
    const emptyIndex = getEmptyIndex()
    const validMoves = [
      emptyIndex - 1, // left
      emptyIndex + 1, // right
      emptyIndex - 3, // above
      emptyIndex + 3, // below
    ]
    return validMoves.includes(index)
  }

  // Handle button click (move the tile if valid)
  const handleMove = (index: number) => {
    if (canMove(index)) setTileClickedIndex(index)
  }

  const getTransformDirection = (index: number) => {
    const emptyIndex = getEmptyIndex()

    if (index === tileClickedIndex) {
      // Move to right
      if (emptyIndex === index + 1) {
        return 'translateX(calc(100% + 13px + 2px))'
      }

      // Move to left
      if (emptyIndex === index - 1) {
        return 'translateX(calc(-100% - 13px - 2px))'
      }

      // Move to down
      if (emptyIndex === index + 3) {
        return 'translateY(calc(100% + 13px + 2px))'
      }

      // Move to up
      if (emptyIndex === index - 3) {
        return 'translateY(calc(-100% - 13px - 2px))'
      }
    }

    return 'none'
  }

  const onTransitionEnd = () => {
    setMoves((prev) => prev + 1)
    const newBoard = [...board]
    const emptyIndex = getEmptyIndex()

    // Swap the clicked tile with the empty space
    newBoard[emptyIndex] = newBoard[tileClickedIndex || 0]
    newBoard[tileClickedIndex || 0] = 0

    setBoard(newBoard)
    setTileClickedIndex(null)

    // Check if the puzzle is solved
    if (isSolved(newBoard)) {
      // alert('You solved the puzzle!')
    }
  }

  const handleDragOver = (
    e: React.DragEvent<HTMLButtonElement>,
    index: number
  ) => {
    e.preventDefault()

    const emptyIndex = getEmptyIndex()

    if (index === emptyIndex && canMove(draggedTileIndex || -1)) {
      e.dataTransfer.dropEffect = 'move'
    }
  }

  const handleDrop = (index: number) => {
    const emptyIndex = getEmptyIndex()

    // Ensure that the drop is on the empty tile and is a valid move
    if (
      draggedTileIndex !== null &&
      index === emptyIndex &&
      canMove(draggedTileIndex)
    ) {
      const newBoard = [...board]

      newBoard[emptyIndex] = newBoard[draggedTileIndex]
      newBoard[draggedTileIndex] = 0

      setBoard(newBoard)
      setDraggedTileIndex(null)
    }
  }

  const isSolved = (board: number[]) => {
    return JSON.stringify(board) === JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 0])
  }

  return (
    <div className="mt-2 flex flex-col">
      <div className="cor text-2xl text-center mb-3 text-[#485f7a] uppercase">
        {isScrambling
          ? 'Scrambling...'
          : `${difficultyMapping[difficulty]} Mode`}
      </div>
      <div className="flex gap-3 mb-4">
        <button className="btn cor text-2xl text-[#485f7a]">TIME: 0s</button>
        <button className="btn cor text-2xl text-[#485f7a]">
          MOVES: {moves}
        </button>
      </div>
      <div className="relative w-full overflow-hidden">
        <div className="absolute top-0 left-0 board-shadow game-board p-4 rounded-md w-full pointer-events-none select-none">
          {board.map((tile, index) => (
            <button
              disabled
              key={'overlay_' + index}
              className={cn(
                'tile-shadow aspect-square rounded-md flex-grow bg-[#EEEEEF] pointer-events-none',
                { 'animate-pulse': isScrambling }
              )}
            >
              <div className="text-5xl text-[#EEEEEF] cor opacity-0">
                {tile}
              </div>
            </button>
          ))}
        </div>
        <div className="board-shadow rounded-md game-board p-4 w-full select-none">
          {board.map((tile, index) =>
            tile !== 0 ? (
              <button
                draggable
                onDragStart={() => setDraggedTileIndex(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onTransitionEnd={onTransitionEnd}
                key={index}
                onClick={() => handleMove(index)}
                className={cn(
                  'game-btn-shadow game-btn flex-grow rounded-md aspect-square transition-transform duration-200 ease-out',
                  { 'z-10': !isScrambling }
                )}
                style={{
                  transform: canMove(index)
                    ? getTransformDirection(index)
                    : 'none',
                }}
              >
                <span className="text-5xl cor text-[#485f7a]">{tile}</span>
              </button>
            ) : (
              <button
                disabled
                onDragStart={() => setDraggedTileIndex(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                key={index}
                className="tile-shadow aspect-square rounded-md flex-grow bg-[#EEEEEF] cursor-default -z-10"
              >
                <span className="text-5xl text-[#EEEEEF] cor">e</span>
              </button>
            )
          )}
        </div>
      </div>
      <div className=" flex text-lg rounded-md cor uppercase mt-5 gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              disabled={isScrambling}
              className={cn(
                'btn-primary cor w-full cor text-2xl text-[#485f7a] hover:text-white',
                { 'pointer-events-none': isScrambling }
              )}
            >
              {isScrambling ? (
                <LoaderCircle
                  size={30}
                  color={'#485f7a'}
                  className="animate-spin"
                />
              ) : (
                <span>NEW</span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="cor w-40 game-btn-shadow border-[#485f7a] border-2">
            <DropdownMenuItem
              onClick={() => handleDifficultyChange('easy')}
              className="text-2xl text-[#485f7a] cursor-pointer"
            >
              EASY
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDifficultyChange('medium')}
              className="text-2xl text-[#485f7a] cursor-pointer"
            >
              MEDIUM
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDifficultyChange('hard')}
              className="text-2xl text-[#485f7a] cursor-pointer"
            >
              HARD
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          onClick={() => setBoard(originalBoard)}
          disabled={isScrambling}
          className={cn(
            'btn-primary cor w-full cor text-2xl text-[#485f7a] hover:text-white',
            { 'pointer-events-none': isScrambling }
          )}
        >
          RESET
        </button>
        <button
          disabled={isScrambling}
          className={cn(
            'btn-primary cor w-full cor text-2xl text-[#485f7a] hover:text-white',
            { 'pointer-events-none': isScrambling }
          )}
        >
          AI SOLVE
        </button>
      </div>
    </div>
  )
}

export default Game
