import { combineReducers } from 'redux';
import { getNewClearedGrid } from './lib';
import gameConstants from './gameConstants';
import * as actions from './actions';
import { Tetromino, GameScoreState, Grid } from './types';

const { initialGrid, tetrominos, blockUnit } = gameConstants;

function gameStatus(state = 'IDLE', action: any) {
	switch (action.type) {
	case actions.START_GAME:
	case actions.UNPAUSE_GAME:
		return 'PLAYING';
	case actions.PAUSE_GAME:
		return 'PAUSED';
	case actions.GAME_OVER:
		return 'GAME_OVER';
	default:
		return state;
	}
}

function activeTetrominos(state = initialGrid, action: any): Grid {
	switch (action.type) {
	case actions.ADD_TETROMINO:
		return getNewClearedGrid(state, action.currentTetromino, action.color);
	case actions.START_GAME:
		return initialGrid;
	default:
		return state;
	}
}
function nextTetromino(state = {}, action: any) {
	switch (action.type) {
	case actions.START_GAME:
	case actions.ADD_TETROMINO:
		return {
			shape: tetrominos[action.nextRandomShape].shape,
			name: action.nextRandomShape,
			color: tetrominos[action.nextRandomShape].color,
			offsetX: 10,
			offsetY: blockUnit,
		};
	default:
		return state;
	}
}
function currentTetromino(state: Tetromino|null, action: { type: string, rotatedTetromino: Tetromino, nextTetromino: Tetromino, currentRandomShape: string }) {
	switch (action.type) {
	case actions.START_GAME:
		return {
			shape: tetrominos[action.currentRandomShape].shape,
			name: action.currentRandomShape,
			color: tetrominos[action.currentRandomShape].color,
			offsetX: blockUnit * 3,
			offsetY: 0,
		};
	case actions.ADD_TETROMINO:
		return Object.assign({}, action.nextTetromino, { offsetX: blockUnit * 3, offsetY: 0 });
	case actions.MOVE_RIGHT:
		return Object.assign({}, state, { offsetX: state!.offsetX! + blockUnit });
	case actions.MOVE_LEFT:
		return Object.assign({}, state, { offsetX: state!.offsetX! - blockUnit });
	case actions.MOVE_DOWN:
		return Object.assign({}, state, { offsetY: state!.offsetY! + blockUnit });
	case actions.ROTATE_TETROMINO:
		return Object.assign({}, state, { shape: action.rotatedTetromino! });
	default:
		return null;
	}
}
function gameScore(state: GameScoreState, action: any) {
	if (!state) {
		state = {
			points: 0,
			clearedLines: 0
		}
	}
	switch (action.type) {
	case actions.START_GAME:
		return {
			points: 0,
			clearedLines: 0,
		};
	case actions.ADD_SCORE:
		return Object.assign({}, state, { points: action.points + state!.points, clearedLines: action.clearedLines + state!.clearedLines });
	default:
		return state;
	}
}
const app = combineReducers({
	activeTetrominos,
	currentTetromino,
	nextTetromino,
	gameScore,
	gameStatus,
} as any);

export default app;
