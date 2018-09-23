import { createElement, ScriptableScene } from 'decentraland-api'

import { createStore, applyMiddleware, Store, AnyAction } from 'redux'
import ReduxThunk from 'redux-thunk'

import {
    reducer,
    GameState,
    getPositionFromString,
    Board,
    Color,
    getPositionAsString,
    white,
    black,
    empty
} from './src/reducers'

export default class Tetris extends ScriptableScene<any, any> {
  store?: Store<GameState, AnyAction>

  constructor(opts: any, ...other: any[]) {
    super(opts, ...other)
    this.store = createStore(
      reducer,
      applyMiddleware(ReduxThunk)
    )
    this.setState(this.store!.getState() as GameState)
    this.store!.dispatch({ restart: true, type: 'restart' })
  }

  sceneDidMount() {
    this.store!.subscribe(() => {
      this.setState(this.store!.getState())
    })

    this.subscribeTo('click', async (e) => {
      const turn = this.store!.getState().turn
      switch (e.elementId) {
        case 'pass':
          this.store!.dispatch({ pass: true, color: turn, type: 'pass' })
          break
        case 'restart':
          this.store!.dispatch({ restart: true, type: 'restart' })
          break
        default:
          if (e.elementId && e.elementId.startsWith('empty_')) {
              this.store!.dispatch({ color: turn, type: 'move', position: getPositionFromString(e.elementId.substr(6)) })
          }
          break
      }
    })
  }

  async render() {
    return (
      <scene>
        <PassButton { ...this.state } />
        <Restart { ...this.state } />
        <BoardF {...this.state} />
      </scene>
    )
  }
}

function PassButton() {
    return <box id="pass" position={{ x: 0.5, y: 15, z: 0.5 }} color='#0000FF' />
}

function Restart() {
    return <box id="restart" position={{ x: 1.5, y: 15, z: 0.5 }} color='#ff0000' />
}

const WHITE = '#FAFAFA'
const BLACK = '#2f2f2f'

function BoardF(state: { board: Board } ) {
    return <entity
      position={{ x: 1.5, y: 0, z: 1.5 }}
    >
        <material id="transparent" alpha={0} />
        <basic-material id="backboard" texture="board.jpg" />
        <box material="#backboard"
             position={{ x: 8.46, y: 0.01, z: 8.48 }}
            scale={{ x: 19.25, y: 0.001, z: 19.2 }}
        />
        <entity position={{ x: -0.5, y: 0, z: -0.5 }}>
          { state.board && state.board.map(
              (row, rowIndex) => <entity>{
                  row.map((color, colIndex) => token(rowIndex, colIndex, color))
              }</entity>)
          }
        </entity>
    </entity>
}

const TRANSPARENT = '#FF00FF'

function token(rowIndex: number, colIndex: number, color: Color) {
    const pos = getPositionAsString({ x: rowIndex, y: colIndex })
    const id = color + '_' + pos
    const colorValue = (color === white) ? WHITE : (color === black) ? BLACK : TRANSPARENT
    if (color === empty) {
        return <box
            position={{ x: colIndex, y: 0.1, z: rowIndex }}
            scale={{ x: 1, y: 0.01, z: 1 }}
            id={id}
            color={colorValue}
            material={ colorValue === TRANSPARENT ? '#transparent' : '' }
        />
    }
    return <cylinder
        segmentsRadial={16}
        segmentsHeight={1}
        radius={0.5}
        position={{ x: colIndex, y: 0.1, z: rowIndex }}
        scale={{ x: 1, y: 0.01, z: 1 }}
        id={id}
        color={colorValue}
    />
}
