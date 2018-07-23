export type Color = 'white' | 'black' | 'empty'

export const BOARD_SIZE = 19

export interface Pos {
  x: number
  y: number
}

export type Row = Array<Color>
export type Board = Array<Row>

export interface GameState {
  board: Board
  turn: Color
  tie?: Pos
  pass?: boolean
  ended?: boolean
  moves: Array<Pos>
  scoreBlack: number
  scoreWhite: number
}

export const empty = 'empty'
export const black = 'black'
export const white = 'white'

export function newBoard(): Board {
  return new Array(BOARD_SIZE).fill(0).map(() => new Array(BOARD_SIZE).fill(empty))
}

export const INITIAL_STATE: Readonly<GameState> = {
  board: newBoard(),
  turn: black,
  scoreBlack: 0,
  scoreWhite: 0,
  moves: new Array()
}

export interface Move {
  pass?: true
  position?: Pos
  color: Color
}

export function equalPosition(a: Pos, b: Pos): boolean {
  return a.x === b.x && a.y === b.y
}

export function copyBoard(board: Board): Board {
  return new Array(BOARD_SIZE).fill(0).map((_, row) => board[row].slice(0))
}

export function isValidMove(game: GameState, action: Move): boolean {
  if (action.color !== game.turn) return false
  if (action.pass && action.position) return false
  if (!action.position && !action.pass) return false
  if (!action.pass && game.tie && equalPosition(action.position!, game.tie)) return false
  if (!action.pass && game.board[action.position!.x][action.position!.y] !== empty) return false
  return true
}

export function getPositionAsString(pos: Pos) {
  return `${pos.x},${pos.y}`
}

export function getPositionFromString(pos: string) {
  const values = pos.split(',').map(x => parseInt(x, 10))
  return { x: values[0], y: values[1] }
}

export const DELTA = [
  { x: 0, y: 1 },
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: -1 }
]

function getNeighbours(pos: Pos) {
  return DELTA
    .map(delta => ({ x: pos.x + delta.x, y: pos.y + delta.y }))
    .filter(val => val.x >= 0 && val.x < BOARD_SIZE && val.y >= 0 && val.y < BOARD_SIZE)
}

function countGroup(board: Board, position: Pos): { liberties: number, group: Pos[] } {
  const queue: Pos[] = [position]
  const color = board[position.x][position.y]
  let liberties = 0
  const seen: { [key: string]: boolean } = { [getPositionAsString(position)]: true }
  while (queue.length) {
    const value = queue.shift()
    const neighbours = getNeighbours(value!)
    for (let neighbor of neighbours) {
      if (board[neighbor.x][neighbor.y] === empty) liberties++;
      if (board[neighbor.x][neighbor.y] === color) {
        const neighborString = getPositionAsString(neighbor)
        if (!seen[neighborString]) {
          queue.push(neighbor)
          seen[neighborString] = true
        }
      }
    }
  }
  return { liberties, group: Object.keys(seen).map(getPositionFromString) }
}

function takeout(board: Board, position: Pos): Pos[] {
  const color = board[position.x][position.y]
  let result: Pos[] = []
  for (let neighbor of getNeighbours(position)) {
    if (board[neighbor.x][neighbor.y] === color) continue
    if (board[neighbor.x][neighbor.y] === empty) continue
    const group = countGroup(board, neighbor)
    if (group.liberties === 0) {
      for (let dead of group.group) {
        board[dead.x][dead.y] = empty
      }
      result = Array.prototype.concat(result, group.group)
    }
  }
  return result
}

export function reducer(game?: Readonly<GameState>, action?: any): Readonly<GameState> {
  if (!game) return Object.freeze(INITIAL_STATE) && INITIAL_STATE
  if (!action) return game
  if (action.restart) return INITIAL_STATE
  if (game.ended) return game
  if (!isValidMove(game, action)) return game
  const board = copyBoard(game.board)

  let eaten = 0
  let isTie = undefined
  let isPass = !!action.pass
  let isEnded = game.pass && !!action.pass
  let moves = Array.prototype.concat([], game.moves, action)

  if (!action.pass) {
    board[action.position!.x][action.position!.y] = action.color
    const deletedBlocks = takeout(board, action.position!)
    if (!countGroup(board, action.position!).liberties) {
      if (!deletedBlocks.length) {
        // Suicide Move
        return game
      }
    } 
    if (deletedBlocks.length === 1) {
      const hypothetical = copyBoard(board)
      hypothetical[deletedBlocks[0].x][deletedBlocks[0].y] = action.color === white ? black : white
      hypothetical[action.position!.x][action.position!.y] = action.color
      const deletedHypothetical = takeout(hypothetical, action.position!)
      if (!countGroup(hypothetical, deletedBlocks[0]).liberties && deletedHypothetical.length === 1) {
        isTie = deletedBlocks[0]
      }
    }
    eaten = deletedBlocks.length
  } else {
    if (!!game.pass) {
      isEnded = true
    }
  }

  return {
    board,
    turn: game.turn === white ? black: white,
    tie: isTie,
    pass: isPass,
    ended: isEnded,
    moves: moves,
    scoreBlack: game.turn === black ? game.scoreBlack + eaten : game.scoreBlack,
    scoreWhite: game.turn === white ? game.scoreWhite + eaten : game.scoreWhite
  }
}

interface TestingCase {
  caseName: string
  actions: Move[]
  evaluation: (game: GameState) => boolean
}
const cases: TestingCase[] = [{
  caseName: 'First move',
  actions: [ { color: black, position: { x: 10, y: 10 }} ],
  evaluation: (game) => game.turn === white
}, {
  caseName: 'Pass',
  actions: [ { color: black, position: { x: 10, y: 10 }}, { color: white, pass: true } ],
  evaluation: (game) => game.turn === black && game.moves.length === 2
}, {
  caseName: 'Invalid position',
  actions: [ { color: black, position: { x: 10, y: 10 }}, { color: white, position: { x: 10, y: 10 } } ],
  evaluation: (game) => game.turn === white && game.moves.length === 1
}, {
  caseName: 'Capture increases score',
  actions: [
    { color: black, position: { x: 0, y: 1 } },
    { color: white, position: { x: 0, y: 0 } },
    { color: black, position: { x: 1, y: 0 } },
  ],
  evaluation: (game) => game.turn === white && game.scoreBlack === 1
}, {
  caseName: 'Cant play tie',
  actions: [
    { color: black, position: { x: 1, y: 0 } },
    { color: white, position: { x: 1, y: 3 } },
    { color: black, position: { x: 0, y: 1 } },
    { color: white, position: { x: 0, y: 2 } },
    { color: black, position: { x: 2, y: 1 } },
    { color: white, position: { x: 2, y: 2 } },
    { color: black, position: { x: 1, y: 2 } },
    { color: white, position: { x: 1, y: 1 } },
    { color: black, position: { x: 1, y: 1 } },
  ],
  evaluation: (game) => game.turn === black && !!(game.tie) && equalPosition(game.tie!, { x: 1, y: 2 }) 
}]

if (!module.parent) {
  function testIt(testCase: TestingCase) {
    let game = INITIAL_STATE
    for (let action of testCase.actions) {
      game = reducer(game, action)
    }
    return testCase.evaluation(game)
  }
  const sum = (a: number, b: boolean) => a + (b ? 1 : 0)
  const count = cases.map((testCase, index) => {
    const result = testIt(testCase)
    if (result) console.log (` ✅ ${index+1}: ${testCase.caseName}`)
    else  console.log (` ⛔️ ${index+1}: ${testCase.caseName}`)
    return result
  }).reduce(sum, 0)
  console.log(`\n${count}/${cases.length} tests passed`)
}