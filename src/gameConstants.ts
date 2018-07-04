import { Tetromino, GREY } from "./types";

const initialGrid: Array<Array<any>> = [];

for (let index = 0; index < 15; index++) {
	initialGrid.push([]);
}

for (let index = 0; index < 15; index++) {
	for (let count = 0; count < 25; count++) {
		initialGrid[index].push(GREY)
	}
}

export type shapeName = 'straight' | 'square' | 'cross' | 'leftGun' | 'rightGun' | 'leftSnake' | 'rightSnake'

const tetrominos: { [key: string]: Tetromino } = {
		straight: {
			shape: [
				[1, 1, 1, 1],
				[0, 0, 0, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0],
			],
			color: '#FF0000',
		},
		square: {
			shape: [
				[1, 1, 0, 0],
				[1, 1, 0, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0],
			],
			color: '#00BCD4',
		},
		cross: {
			shape: [
				[0, 1, 0, 0],
				[1, 1, 1, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0],
			],
			color: '#00FF00',
		},
		leftGun: {
			shape: [
				[0, 0, 1, 0],
				[1, 1, 1, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0],
			],
			color: '#FF5555',
		},
		rightGun: {
			shape: [
				[1, 0, 0, 0],
				[1, 1, 1, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0],
			],
			color: '#FFFF00',
		},
		leftSnake: {
			shape: [
				[1, 1, 0, 0],
				[0, 1, 1, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0],
			],
			color: '#0000AA',
		},
		rightSnake: {
			shape: [
				[0, 1, 1, 0],
				[1, 1, 0, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0],
			],
			color: '#551111',
		},
	}

export default {
	fieldWidth: 300,
	fieldHeight: 660,
	blockUnit: 0.5,
	shapesMapping: [
		'straight', 'square', 'cross', 'leftGun', 'rightGun', 'leftSnake', 'rightSnake',
	],
	timeDrop: 100,
	tetrominos,
	initialGrid,
};
