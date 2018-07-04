
export type Shape = Array<Array<number>>;

export type Grid = Array<Array<any>>;

export type IDLE = 'IDLE'
export type PLAYING = 'PLAYING'
export type PAUSED = 'PAUSED'
export type GAME_OVER = 'GAME_OVER'

export interface Tetromino {
  shape: Shape
  name?: string
  color: string
  offsetX?: number
  offsetY?: number
}

export const GREY = '#333333'
export const BLUE = '#0000FF'

export type DIRECTION = 'left' | 'right' | 'down' | 'rotation'

export type ActiveTetrominosState = Array<Array<number>>;

export interface GameScoreState {
  points: number
  clearedLines: number
}

export type GameStatusState = IDLE | PLAYING | PAUSED | GAME_OVER

export interface TetrisState {
  activeTetrominos?: ActiveTetrominosState
  currentTetromino?: Tetromino
  nextTetromino?: Tetromino
  gameScore?: GameScoreState
  gameStatus: GameStatusState
}
