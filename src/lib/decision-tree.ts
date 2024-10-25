import { heuristicCost, isSolved, reverseSolutionPath } from './solver'

/* ------------------ Leaf Node Class ------------------ */
export class Leaf {
  state: number[]
  depth: number
  cost: number
  total_cost: number
  parent: Leaf | null

  constructor(state: number[], depth: number, parent: Leaf | null) {
    this.state = state
    this.depth = depth
    this.cost = heuristicCost(this.state)
    this.total_cost = this.depth + this.cost
    this.parent = parent
  }
}

/* ------------------ Decision Tree For A* ------------------ */
export class DecisionTree {
  root: Leaf
  depth: number
  explored: Leaf[]
  toExplore: Leaf[]
  maxCost: number
  createdLeaves: number
  moves: number

  constructor(state: number[]) {
    this.root = new Leaf(state, 0, null)
    this.depth = 0
    this.explored = []
    this.toExplore = [this.root]
    this.maxCost = 0
    this.createdLeaves = 0
    this.moves = 0
  }

  destroy(): void {
    this.root = null!
    this.depth = 0
    this.explored = []
    this.toExplore = []
    this.maxCost = 0
    this.createdLeaves = 0
    this.moves = 0
  }

  findBestLeaf(): Leaf {
    let currentLeaf = this.toExplore[0]
    let leafIndex = 0

    this.toExplore.forEach((leaf, index) => {
      if (leaf.total_cost < currentLeaf.total_cost) {
        currentLeaf = leaf
        leafIndex = index
      }
    })

    this.toExplore.splice(leafIndex, 1)
    this.explored.push(currentLeaf)

    return currentLeaf
  }

  getAdjacentElements(gridArray: number[]): number[] {
    const adjacentElements: number[] = []
    const emptyTileIndex = gridArray.indexOf(0)

    if (emptyTileIndex - 3 >= 0)
      adjacentElements.push(gridArray[emptyTileIndex - 3])
    if (emptyTileIndex + 3 <= 8)
      adjacentElements.push(gridArray[emptyTileIndex + 3])
    if (emptyTileIndex - 1 >= 0 && emptyTileIndex % 3 !== 0)
      adjacentElements.push(gridArray[emptyTileIndex - 1])
    if (emptyTileIndex + 1 <= 8 && emptyTileIndex % 3 !== 2)
      adjacentElements.push(gridArray[emptyTileIndex + 1])

    return adjacentElements
  }

  generateNextDepthStates(leaf: Leaf): Leaf[] {
    const possibleStates: Leaf[] = []
    const state = leaf.state
    const emptyTileIndex = state.indexOf(0)
    const adjacentElements = this.getAdjacentElements(state)

    adjacentElements.forEach((adjacentElement) => {
      const adjacentElementIndex = state.indexOf(adjacentElement)
      const newState = [...state]

      newState[emptyTileIndex] = adjacentElement
      newState[adjacentElementIndex] = 0

      possibleStates.push(new Leaf(newState, leaf.depth + 1, leaf))
      this.createdLeaves++
    })

    return possibleStates
  }

  aStarSearch(): number[][] | undefined {
    while (this.toExplore.length > 0) {
      const currentLeaf = this.findBestLeaf()

      if (isSolved(currentLeaf.state)) {
        const solution = reverseSolutionPath(currentLeaf)

        return solution
      }

      const leaves = this.generateNextDepthStates(currentLeaf)

      for (const leaf of leaves) {
        if (
          !this.explored.some(
            (exploredLeaf) =>
              exploredLeaf.state.toString() === leaf.state.toString()
          ) &&
          !this.toExplore.some(
            (toExploreLeaf) =>
              toExploreLeaf.state.toString() === leaf.state.toString()
          )
        ) {
          this.toExplore.push(leaf)
        }

        if (leaf.depth > this.moves) this.moves = leaf.depth
        if (leaf.total_cost > this.maxCost) this.maxCost = leaf.total_cost
      }
    }
  }
}
