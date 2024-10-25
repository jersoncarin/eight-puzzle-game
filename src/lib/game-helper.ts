export const SOLVED_STATE = [1, 2, 3, 4, 5, 6, 7, 8, 0]

export const scores = {
  easy: { moves: 5, minDifficulty: 10 },
  medium: { moves: 25, minDifficulty: 15 },
  hard: { moves: 30, minDifficulty: 20 },
}

// Helper function to swap two elements in the puzzle array
export const swap = (puzzle: number[], i: number, j: number) => {
  const newPuzzle = [...puzzle]
  ;[newPuzzle[i], newPuzzle[j]] = [newPuzzle[j], newPuzzle[i]]
  return newPuzzle
}

// Get valid moves based on the empty space position
export const getValidMoves = (puzzle: number[]) => {
  const emptyIndex = puzzle.indexOf(0)
  const validMoves = []

  // Puzzle is 3x3, so we calculate valid moves
  // Move up
  if (emptyIndex > 2) validMoves.push(emptyIndex - 3)
  // Move down
  if (emptyIndex < 6) validMoves.push(emptyIndex + 3)
  // Move left
  if (emptyIndex % 3 !== 0) validMoves.push(emptyIndex - 1)
  // Move right
  if (emptyIndex % 3 !== 2) validMoves.push(emptyIndex + 1)

  return validMoves
}

// Manhattan distance heuristic
export const calculateManhattanDistance = (puzzle: number[]) => {
  const distance = puzzle.reduce((total, value, index) => {
    if (value === 0) return total
    const targetIndex = value - 1
    const currentRow = Math.floor(index / 3)
    const currentCol = index % 3
    const targetRow = Math.floor(targetIndex / 3)
    const targetCol = targetIndex % 3
    return (
      total +
      Math.abs(currentRow - targetRow) +
      Math.abs(currentCol - targetCol)
    )
  }, 0)

  return distance
}

export const asyncScramblePuzzle = (
  puzzle: number[],
  moves: number,
  minDifficulty: number
) => {
  const delay = Math.abs(scores.hard.moves - moves + 1)

  return new Promise<number[]>((resolve) => {
    let scrambledPuzzle = [...puzzle]
    let moveCount = 0
    let difficultyScore = 0

    const scrambleInterval = setInterval(() => {
      if (moveCount >= moves && difficultyScore >= minDifficulty) {
        clearInterval(scrambleInterval)
        resolve(scrambledPuzzle)
        return
      }

      const validMoves = getValidMoves(scrambledPuzzle)
      const randomMove =
        validMoves[Math.floor(Math.random() * validMoves.length)]
      scrambledPuzzle = swap(
        scrambledPuzzle,
        scrambledPuzzle.indexOf(0),
        randomMove
      )

      // Update the difficulty score after each move
      difficultyScore = calculateManhattanDistance(scrambledPuzzle)

      moveCount++
    }, delay) // Adjust the interval based on the difficulty
  })
}
