import { SOLVED_STATE } from './game-helper'

export type Grid = number[]

export type Node = {
  state: Grid
  parent: Node | null
  depth: number
  cost: number
}

export const distanceFromGoal = (
  currTileIndex: number,
  goalIndex: number
): number => {
  const rows = [Math.floor(currTileIndex / 3), Math.floor(goalIndex / 3)]
  const cols = [currTileIndex % 3, goalIndex % 3]

  // Calculate the Manhattan distance: |x2 - x1| + |y2 - y1|
  return Math.abs(rows[0] - rows[1]) + Math.abs(cols[0] - cols[1])
}

export const heuristicCost = (state: Grid): number => {
  const solutionGrid: Grid = SOLVED_STATE

  return state.reduce((cost, tile, index) => {
    if (tile !== 0) {
      cost += distanceFromGoal(index, solutionGrid.indexOf(tile))
    }
    return cost
  }, 0)
}

export const isSolutionExists = (grid: Grid): boolean => {
  let inversions = 0

  grid.forEach((tile, i) => {
    for (let j = i + 1; j < grid.length; j++) {
      if (tile !== 0 && grid[j] !== 0 && tile > grid[j]) {
        inversions++
      }
    }
  })

  // Solution possible if the number of inversions is even
  return inversions % 2 === 0
}

// Reverse Solution Path
export const reverseSolutionPath = (solutionPath: Node): Grid[] => {
  const reversedPath: Grid[] = []
  let current: Node | null = solutionPath

  while (current !== null) {
    reversedPath.push(current.state)
    current = current.parent
  }

  return reversedPath.reverse()
}

export const isSolved = (board: number[]) => {
  return JSON.stringify(board) === JSON.stringify(SOLVED_STATE)
}

export const findMovedElement = (grid1: number[], grid2: number[]): number =>
  grid1.find((element, index) => element !== grid2[index] && element !== 0) || 0

export const moveTile = (
  previousGrid: number[],
  currentGrid: number[]
): void => {
  // Find the moved element
  const movedElement = findMovedElement(previousGrid, currentGrid)

  const button = document.getElementById(`button-${movedElement}`)

  button?.click()
}
