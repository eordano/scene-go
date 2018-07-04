import gameConstants from './gameConstants';
import { Tetromino, Grid, GREY, DIRECTION } from './types';

function occupied(grid: Grid, x: number, y: number) {
	return grid[x][y] !== GREY
}

export function getActualCoordinates(newTetromino: Tetromino) {
	const coordinates = [];
	const { shape, offsetX, offsetY } = newTetromino;
	const { blockUnit } = gameConstants;
	for (let i = 0; i < shape.length; i++) {
		for (let j = 0; j < shape[i].length; j++) {
			if (shape[i][j]) {
				coordinates.push({ x: j + (offsetX! / blockUnit), y: i + (offsetY! / blockUnit) });
			}
		}
	}
	return coordinates;
}
export function getNewColoredGrid(grid: Grid, tetromino: Tetromino, color: string) {
	const gridCopy: Grid = grid.map((x) => [...x]);
	const coords = getActualCoordinates(tetromino);
	for (let j = 0; j < coords.length; j++) {
		const { x, y } = coords[j];
		gridCopy[x][y] = color;
	}
	return gridCopy;
}
export function getCompletedLines(grid: Grid, tetromino: Tetromino) {
	const linesToClear = [];
	const gridCopy = getNewColoredGrid(grid, tetromino, 'tmp');
	const coords = getActualCoordinates(tetromino);
	const rows: Array<number> = [] 
	coords.map(cur => {
		rows[cur.y] = rows[cur.y] ? rows[cur.y] + 1 : 1;
	})
	for (const row in rows) {
		let flag = true;
		for (let j = 0; j < 10; j++) {
			if (gridCopy[j][row] === GREY) {
				flag = false;
			}
		}
		if (flag) {
			linesToClear.push(parseInt(row))
		}
	}
	return linesToClear;
}

export function getNewClearedGrid(grid: Grid, tetromino: Tetromino, color: string) {
	const linesToClear = getCompletedLines(grid, tetromino);
	const gridCopy = getNewColoredGrid(grid, tetromino, color);
	for (const row of linesToClear) {
		for (let j = 0; j < 10; j++) {
			gridCopy[j][row] = GREY;
		}
	}
	for (let row = linesToClear[0] - 1; row >= 0; row--) {
		const shift = linesToClear.length;
		for (let j = 0; j < 10; j++) {
			gridCopy[j][row + shift] = gridCopy[j][row];
		}
	}
	return gridCopy;
}
export function rotateArray(tetromino: Tetromino) {
	const matrix = tetromino.shape;
	const n = matrix.length;
	const ret: Array<Array<number>> = [[], [], [], []];
	let closestX = 10;

	for (let i = 0; i < n; ++i) {
		for (let j = 0; j < n; ++j) {
			ret[i][j] = matrix[n - j - 1][i];
			if (ret[i][j]) {
				closestX = Math.min(closestX, j);
			}
		}
	}
	const fill = new Array(closestX).fill(0);
	for (let i = 0; i < n; ++i) {
		ret[i] = ret[i].slice(closestX).concat(fill as any);
	}
	return ret;
}
export function checkCollisions(direction: DIRECTION, activeTetrominos: Grid, currentTetromino: Tetromino) {
	const { blockUnit } = gameConstants;
	const currentX = currentTetromino.offsetX! / blockUnit;
	const currentY = currentTetromino.offsetY! / blockUnit;
	let collision = false;
	let gameOver = false;
	let nx = 0, ny = 0;

	switch(direction) {
		case "left":
			nx = -1;
			break;
		case "right":
			nx = 1;
			break;
		case "down":
			ny = 1;
			break;
	}

	for (let i = 0; i < currentTetromino.shape.length; i++) {
		for (let j = 0; j < currentTetromino.shape[i].length; j++) {
			const coord = currentTetromino.shape[i][j];
			if (coord) {
				const totalX = nx + currentX + j;
				const totalY = ny + currentY + i;
				if (totalX < 0 || totalY >= 22 || totalX >= 10 || occupied(activeTetrominos, totalX, totalY)) {
					collision = true;
				}
				if (collision && currentY === 0 && direction === 'down') {
					gameOver = true;
				}
			}
		}
	}
	return gameOver ? 'GAME_OVER' : collision;
}
