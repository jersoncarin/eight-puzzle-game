import { useEffect, useRef, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { scores, scramblePuzzle, SOLVED_STATE } from '@/lib/game-helper'
import { LoaderCircle } from 'lucide-react'
import { cn, waitFor } from '@/lib/utils'
import Victory from './victory'
import { useWindowSize } from 'react-use'
import Confetti from 'react-confetti'
import Timer from './timer'
import { isSolutionExists, isSolved, moveTile } from '@/lib/solver'
import { DecisionTree } from '@/lib/decision-tree'
import { Checkbox } from './ui/checkbox'
import { PRELOAD_IMAGES } from '@/lib/constants'

type GameProps = {
  mode: string
}

export const difficultyMapping = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
} as const

const clickAudio = new Audio('/assets/block.mp3')
const mouseClick = new Audio('/assets/mouse-click.mp3')
const whooshAudio = new Audio('/assets/whoosh.mp3')
const bgAudio = new Audio('/assets/bg.mp3')

const Game = ({ mode }: GameProps) => {
  const [board, setBoard] = useState<number[]>(SOLVED_STATE)
  const [tileClickedIndex, setTileClickedIndex] = useState<number | null>(null)
  const [draggedTileIndex, setDraggedTileIndex] = useState<number | null>(null)
  const [difficulty, setDifficulty] =
    useState<keyof typeof difficultyMapping>('easy')
  const [moves, setMoves] = useState(0)
  const [isScrambling, setIsScrambling] = useState(false)
  const [originalBoard, setOriginalBoard] = useState<number[]>([])
  const [isDifficultyMenuOpen, setIsDifficultyMenuOpen] = useState(false)
  const [isVictoryOpen, setIsVictoryOpen] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const [isAISolving, setIsAISolving] = useState(false)
  const [isAIThinking, setAIIsThinking] = useState(false)
  const [isNumberShown, setIsNumberShown] = useState(true)
  const [randomImage, setRandomImage] = useState(PRELOAD_IMAGES[2]) // Default cat, since i like cats
  const { width, height } = useWindowSize()
  const initialPosRef = useRef(new Map<string, [string, string]>())

  useEffect(() => {
    bgAudio.currentTime = 0
    bgAudio.volume = 0.2
    bgAudio.play()

    return () => {
      bgAudio.currentTime = 0
      bgAudio.pause()
    }
  }, [])

  // Scramble the puzzle initially in easy mode
  useEffect(() => {
    updateBoard(difficulty)

    if (mode === 'image') {
      calculateInitialCropImagePosition()
    }
  }, [mode])

  const updateBoard = (difficulty: keyof typeof difficultyMapping) => {
    if (mode === 'image') {
      setRandomImage(
        PRELOAD_IMAGES[Math.floor(Math.random() * PRELOAD_IMAGES.length)]
      )
    }

    setIsGameOver(false)

    const { moves, minDifficulty } = scores[difficulty]

    setIsScrambling(true)

    scramblePuzzle(SOLVED_STATE, moves, minDifficulty).then((puzzle) => {
      setBoard(puzzle)
      setMoves(0)
      setIsScrambling(false)
      setOriginalBoard(puzzle)
    })
  }

  // Handle difficulty change
  const handleDifficultyChange = (
    difficulty: keyof typeof difficultyMapping
  ) => {
    clickAudio.currentTime = 0
    clickAudio.play()
    setDifficulty(difficulty)
    updateBoard(difficulty)
  }

  // Get the position of the empty space
  const getEmptyIndex = () => board.indexOf(0)

  // Check if the move is valid (adjacent to empty space)
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
  const handleMove = async (index: number) => {
    if (canMove(index)) {
      setTileClickedIndex(index)
      clickAudio.currentTime = 0
      clickAudio.play()
    }
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

  const onTransitionEnd = async () => {
    setMoves((prev) => prev + 1)
    const newBoard = [...board]
    const emptyIndex = getEmptyIndex()

    // Swap the clicked tile with the empty space
    newBoard[emptyIndex] = newBoard[tileClickedIndex || 0]
    newBoard[tileClickedIndex || 0] = 0

    setBoard(newBoard)
    setTileClickedIndex(null)
    setIsStarted(() => true)

    // Check if the puzzle is solved
    if (isSolved(newBoard)) {
      await waitFor(600)
      setIsStarted(() => false)
      setIsGameOver(true)
      setIsVictoryOpen(true)
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

  const onAISolve = async () => {
    clickAudio.currentTime = 0
    clickAudio.play()

    setIsAISolving(true)
    setAIIsThinking(true)

    if (!isSolutionExists(board)) {
      setIsAISolving(false)
    }

    const decisionTree = new DecisionTree(board)
    const solutions = await decisionTree.aStarSearch()

    setAIIsThinking(false)

    if (solutions) {
      for (let i = 0; i < solutions.length; i++) {
        const currentGrid = solutions[i]
        let previousGrid: number[] = []

        // This prevents the first grid from being undefined
        if (i > 0) previousGrid = solutions[i - 1]

        if (previousGrid.length > 0) {
          moveTile(previousGrid, currentGrid)
          await waitFor(450)
        }
      }
    }

    setIsAISolving(false)
  }

  const onGameStateReset = () => {
    clickAudio.currentTime = 0
    clickAudio.play()

    setIsGameOver(false)
    setMoves(0)
    setBoard(originalBoard)
  }

  const calculateInitialCropImagePosition = () => {
    const cell = document.querySelector(`.cell-btn`)
    const width = cell?.clientWidth || 0
    const height = cell?.clientHeight || 0

    const puzzlePieceHeight = height * 3
    const puzzlePieceWidth = width * 3

    document
      .querySelectorAll<HTMLButtonElement>('.cell-btn')
      .forEach((tile) => {
        // Parse the actual tile ID from the button ID
        const tileId = parseInt(tile.id.replace('button-', ''))

        // Calculate row and column based on tileId (assuming it's a 3x3 grid)
        const row = Math.floor((tileId - 1) / 3) // Row number (0, 1, 2)
        const col = (tileId - 1) % 3 // Column number (0, 1, 2)

        initialPosRef.current.set(tileId.toString(), [
          `${puzzlePieceWidth}px ${puzzlePieceHeight}px`,
          `-${col * width}px -${row * height}px`,
        ])
      })
  }

  const onMouseEnter = () => {
    whooshAudio.currentTime = 0.2
    whooshAudio.play()
  }

  const onMouseLeave = () => {
    whooshAudio.pause()
  }

  return (
    <div className="mt-2 flex flex-col">
      <div className="cor text-2xl text-center mb-3 text-[#485f7a] uppercase">
        {isScrambling ? (
          'Scrambling...'
        ) : isGameOver ? (
          'Solved! click new to start again'
        ) : isAIThinking ? (
          'Ai is thinking...'
        ) : isAISolving ? (
          'AI is solving...'
        ) : (
          <span
            className="cursor-pointer hover:text-[#ff407d] transition-all"
            onClick={() => setIsDifficultyMenuOpen(true)}
          >{`${difficultyMapping[difficulty]} Mode`}</span>
        )}
      </div>
      <div className="flex gap-3 mb-4">
        <Timer isGameStarted={isStarted} isGameOver={isGameOver} />
        <button className="btn cor text-2xl text-[#485f7a] pointer-events-none select-none">
          MOVES: {moves}
        </button>
      </div>
      <div className="relative w-full overflow-hidden">
        <div className="absolute top-0 left-0 board-shadow game-board p-4 rounded-md w-full pointer-events-none select-none z-10 overflow-hidden">
          {board.map((tile, index) => (
            <button
              disabled
              key={'overlay_' + index}
              className={cn('aspect-square flex-grow pointer-events-none', {
                'bg-[#EEEEEF]': mode === 'text',
                'bg-transparent': mode === 'image',
                'rounded-md': mode === 'text',
                'tile-text': mode === 'text',
                'tile-image': mode === 'image',
                'animate-pulse': isScrambling && mode === 'text',
                'tile-shadow': mode === 'text',
              })}
            >
              <div className="text-5xl text-[#EEEEEF] cor opacity-0">
                {tile}
              </div>
            </button>
          ))}
        </div>
        {mode === 'image' && (
          <div className="p-4 w-full h-full absolute top-0 left-0">
            <div
              className="rounded-md w-full pointer-events-none select-none h-full dim aspect-square"
              style={{
                backgroundImage: `url('${randomImage}')`,
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            ></div>
          </div>
        )}
        <div
          className={cn(
            'board-shadow rounded-md game-board p-4 w-full select-none',
            { 'pointer-events-none': isGameOver }
          )}
        >
          {board.map((tile, index) =>
            tile !== 0 ? (
              <button
                id={`button-${tile}`}
                draggable
                onDragStart={() => setDraggedTileIndex(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onTransitionEnd={onTransitionEnd}
                key={index}
                onClick={() => handleMove(index)}
                className={cn(
                  'flex-grow aspect-square transition-transform duration-200 ease-out cell-btn',
                  {
                    'rounded-md': mode === 'text',
                    'tile-text': mode === 'text',
                    'tile-image': mode === 'image',
                    'game-btn-shadow game-btn': mode === 'text',
                    'game-btn-image': mode === 'image',
                    'z-20': !isScrambling,
                    correct:
                      tile === SOLVED_STATE[index] &&
                      !isScrambling &&
                      mode === 'text',
                  }
                )}
                style={{
                  transform: canMove(index)
                    ? getTransformDirection(index)
                    : 'none',
                  ...(mode === 'image' && {
                    backgroundImage: `url('${randomImage}')`,
                    backgroundSize: initialPosRef.current.get(
                      tile.toString()
                    )?.[0],
                    backgroundPosition: initialPosRef.current.get(
                      tile.toString()
                    )?.[1],
                  }),
                }}
              >
                <span
                  className={cn('text-5xl cor', {
                    'text-[#485f7a]': mode === 'text',
                    'text-white': mode === 'image',
                    'opacity-0': mode === 'image' && !isNumberShown,
                  })}
                >
                  {tile}
                </span>
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
      {mode === 'image' && (
        <div className="flex items-center space-x-2 mt-3">
          <Checkbox
            checked={isNumberShown}
            onCheckedChange={(checked) => {
              mouseClick.currentTime = 0.4
              mouseClick.play()
              setIsNumberShown(typeof checked === 'boolean' && checked)
            }}
            className="border-[#485f7a] data-[state=checked]:bg-[#485f7a]"
            id="show_numbers"
          />
          <label
            htmlFor="show_numbers"
            className="cor text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#485f7a]"
          >
            Show numbers
          </label>
        </div>
      )}
      <div className=" flex text-lg rounded-md cor uppercase mt-5 gap-3">
        <DropdownMenu
          onOpenChange={setIsDifficultyMenuOpen}
          open={isDifficultyMenuOpen}
        >
          <DropdownMenuTrigger asChild>
            <button
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              disabled={isScrambling || isAISolving}
              className={cn(
                'btn-primary cor w-full cor text-2xl text-[#485f7a] hover:text-white',
                { 'pointer-events-none': isScrambling || isAISolving }
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
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={onGameStateReset}
          disabled={isScrambling || isAISolving}
          className={cn(
            'btn-primary cor w-full cor text-2xl text-[#485f7a] hover:text-white',
            { 'pointer-events-none': isScrambling || isAISolving }
          )}
        >
          RESET
        </button>
        <button
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={onAISolve}
          disabled={isScrambling || isAISolving}
          className={cn(
            'btn-primary cor w-full cor text-2xl text-[#485f7a] hover:text-white',
            { 'pointer-events-none': isScrambling || isAISolving }
          )}
        >
          {isAISolving ? (
            <LoaderCircle
              size={30}
              color={'#485f7a'}
              className="animate-spin"
            />
          ) : (
            <span>AI SOLVE</span>
          )}
        </button>
      </div>
      <Victory
        difficulty={difficulty}
        moves={moves}
        open={isVictoryOpen}
        setOpen={setIsVictoryOpen}
        onDoAgain={() => updateBoard(difficulty)}
      />
      {isVictoryOpen && (
        <Confetti style={{ zIndex: 9999 }} width={width} height={height} />
      )}
    </div>
  )
}

export default Game
