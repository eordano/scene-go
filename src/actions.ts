import { rotateArray, checkCollisions, getCompletedLines } from './lib'
import { default as gameConstants } from './gameConstants'
import { Tetromino, TetrisState, DIRECTION } from './types'

import { Dispatch } from 'redux'

export const SPAWN_TETROMINO = 'SPAWN_TETROMINO';
export const ROTATE_TETROMINO = 'ROTATE_TETROMINO';
export const START_GAME = 'START_GAME';
export const STOP_GAME = 'STOP_GAME';
export const GAME_OVER = 'GAME_OVER';
export const CLEAR_LINE = 'CLEAR_LINE';
export const ADD_SCORE = 'ADD_SCORE';
export const MOVE_TETROMINO = 'MOVE_TETROMINO';
export const MOVE_RIGHT = 'MOVE_RIGHT';
export const MOVE_LEFT = 'MOVE_LEFT';
export const MOVE_DOWN = 'MOVE_DOWN';
export const ADD_TETROMINO = 'ADD_TETROMINO';
export const PAUSE_GAME = 'PAUSE_GAME';
export const UNPAUSE_GAME = 'UNPAUSE_GAME';

export const addTetromino = (currentTetromino: Tetromino, nextTetromino: Tetromino) => {
	const { shapesMapping } = gameConstants;
	const newRandomNumber = Math.floor(Math.random() * 7);
	const nextRandomShape = shapesMapping[newRandomNumber];

	return {
		type: ADD_TETROMINO,
		currentTetromino,
		color: currentTetromino.color,
		nextTetromino,
		nextRandomShape,
	};
};
export const startGame = () => {
	const { shapesMapping } = gameConstants;
	const currentRandomNumber = Math.floor(Math.random() * 7);
	const nextRandomNumber = Math.floor(Math.random() * 7);
	const currentRandomShape = shapesMapping[currentRandomNumber];
	const nextRandomShape = shapesMapping[nextRandomNumber];

	return {
		type: START_GAME,
		currentRandomShape,
		nextRandomShape,
	};
};
export const pauseGame = () => ({
	type: PAUSE_GAME,
});
export const unpauseGame = () => ({
	type: UNPAUSE_GAME,
});
export const changePauseState: any = (dispatch: any, getState: () => TetrisState) => {
	const { gameStatus } = getState();
	if (gameStatus === 'PAUSED') {
		dispatch(unpauseGame());
	} else {
		dispatch(pauseGame());
	}
}
export const gameOver = () => ({
	type: GAME_OVER,
});
export const addScore = (clearedLines: number) => ({
	type: ADD_SCORE,
	points: Math.pow(clearedLines, 2) * 100,
	clearedLines,
});
export const moveRight: any = () => ({
	type: MOVE_RIGHT,
});
export const moveLeft: any = () => ({
	type: MOVE_LEFT,
});
export const moveDown: any = () => ({
	type: MOVE_DOWN,
});
export const rotateRight = (rotatedTetromino: any) => ({
	type: ROTATE_TETROMINO,
	rotatedTetromino,
});
export const rotateTetromino: any = () => (
	function (dispatch: Dispatch, getState: () => TetrisState) {
		const { activeTetrominos, currentTetromino, gameStatus } = getState();
		const rotatedTetromino: Tetromino = Object.assign({}, currentTetromino);
		rotatedTetromino.shape = rotateArray(rotatedTetromino);
		if (!checkCollisions('rotation', activeTetrominos!, rotatedTetromino) && gameStatus === 'PLAYING') {
			dispatch(rotateRight(rotatedTetromino.shape));
		}
	}
);
export const moveTetromino: any = (direction: DIRECTION) => (
	function (dispatch: Dispatch, getState: () => TetrisState) {
		const state = getState();
		const { activeTetrominos, currentTetromino, nextTetromino, gameStatus } = state
		const collisionCheck = currentTetromino && checkCollisions(direction, activeTetrominos!, currentTetromino!);

		if (gameStatus === 'PAUSED' || gameStatus === 'GAME_OVER') {
			return;
		}

		switch (direction) {
		case 'left':
			if (collisionCheck === false) {
				dispatch(moveLeft());
			}
			return;
		case 'right':
			if (collisionCheck === false) {
				dispatch(moveRight());
			}
			return;
		case 'down':
			if (collisionCheck === false) {
				dispatch(moveDown());
			} else if (collisionCheck === GAME_OVER) {
				dispatch(gameOver());
			} else {
				const clearedLines = getCompletedLines(activeTetrominos!, currentTetromino!).length;
				dispatch(addScore(clearedLines));
				dispatch(addTetromino(currentTetromino!, nextTetromino!));
			}
			return;
		default:
			return;
		}
	}
);

export const loadMenu: any = (dispatch: Dispatch) => (
	dispatch(loadGame())
)

export const loadGame: any = (dispatch: Dispatch) => (
	dispatch(startGame())
)

export function dropTetromino(dispatch: Dispatch, getState: any) {
	const { gameStatus } = getState()
	if (gameStatus === 'PLAYING') {
		dispatch(moveTetromino('down'));
	}
}
