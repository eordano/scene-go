import { createElement, Vector3Component } from 'metaverse-api'

import gameConstants from '../gameConstants';
import { Tetromino, Grid, GREY } from '../types';

const { blockUnit } = gameConstants;

export function getCoordinates(shape: Grid) {
	const coordinates = [];
	for (let i = 0; i < shape.length; i++) {
		for (let j = 0; j < shape[i].length; j++) {
			if (shape[i][j]) {
				coordinates.push({ x: j, y: i });
			}
		}
	}
	return coordinates;
}

export function tetrominoGroup(xs: Array<number>, ys: Array<number>, color: string|Array<string>) {
	const arr = [];
	for (let i = 0 ; i<xs.length; i++) {
		if ((typeof color === 'string' && color === GREY) || color[i] === GREY) continue
		arr.push(<box scale={blockUnit} position={{
			x: xs[i], y: ys[i], z: 0
		 }} color={typeof color === 'string' ? color : color[i]} />);
	}
	return arr;
}

export function BuildTetrominoGrid(opts: { allTetrominos: Grid }) {
	const { allTetrominos } = opts
	const coordinates = getCoordinates(allTetrominos);
	const xs = coordinates.map((coord) => (coord.x * blockUnit));
	const ys = coordinates.map((coord) => (coord.y * blockUnit));
	const color = coordinates.map((coord) => allTetrominos[coord.y][coord.x])
	const res = <entity id='next'>
			{tetrominoGroup(xs, ys, color)}
		</entity>
	return res
};
export function BuildTetromino(opts: { tetromino: Tetromino }) {
	const { tetromino } = opts
	const { shape, offsetX, offsetY, color } = tetromino
	const coordinates = getCoordinates(shape);
	const xs = coordinates.map((coord) => (coord.x * blockUnit) + offsetX!);
	const ys = coordinates.map((coord) => (coord.y * blockUnit) + offsetY!);
	const res = <entity id='next'>
			{tetrominoGroup(xs, ys, color)}
		</entity>
	return res
};

export function BuildList(opts: { tetrominos: Grid, position: Vector3Component}) {

}








