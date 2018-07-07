import { createElement, ScriptableScene } from 'metaverse-api'

import { createStore, applyMiddleware, Store, AnyAction } from 'redux'
import ReduxThunk from 'redux-thunk'

import TetrisApp from './src/reducers'
import { TetrisState } from './src/types'
import { startGame, rotateTetromino, moveTetromino, changePauseState, loadMenu, dropTetromino } from 'src/actions';
import { BuildTetromino, BuildTetrominoGrid } from 'src/components/Tetromino';
import gameConstants from 'src/gameConstants';

export default class Tetris extends ScriptableScene<any, TetrisState> {
  store?: Store<any, AnyAction>

  sceneDidMount() {
    this.store = createStore(
      TetrisApp,
      applyMiddleware(ReduxThunk)
    )
    this.state = this.store.getState() as TetrisState

    this.store.subscribe(() => {
      console.log('new state: ', this.store!.getState())
      this.setState(this.store!.getState())
    })

    setInterval(() => {
      dropTetromino(this.store!.dispatch, this.store!.getState)
    }, gameConstants.timeDrop)

    this.subscribeTo('click', async (e) => {
      switch (e.elementId) {
        case 'start':
          this.store!.dispatch(startGame())
          break
        case 'left':
          this.store!.dispatch(moveTetromino('left'))
          break
        case 'right':
          this.store!.dispatch(moveTetromino('right'))
          break
        case 'down':
          this.store!.dispatch(moveTetromino('down'))
          break
        case 'rotate':
          this.store!.dispatch(rotateTetromino())
          break
        case 'pause':
          this.store!.dispatch(changePauseState())
          break
        case 'exit':
          this.store!.dispatch(loadMenu())
          break
        default:
          break
      }
    })
  }

  async render() {
    return (
      <scene>
        <StartButton { ...this.state } />
        <NextTetromino { ...this.state } />
        <CurrentTetromino { ...this.state } />
        <AllTetrominos { ...this.state } />
        <PlayButtons {...this.state} />
      </scene>
    )
  }
}

function PlayButtons(props: any) {
  return <entity position={{x: 5, y: 3, z: 4 }}>
    <material id="transparent" alpha={0.7} />
    <box position={{ x: 1, y: 3, z: 1 }} material="#transparent" withCollisions={false} id='left' color={'#00FF00'} {...props} />
    <box position={{ x: 0, y: 3, z: 1 }} material="#transparent" withCollisions={false} id='rotate' color={'#ffFFff'} {...props} />
    <box position={{ x: -1, y: 3, z: 1 }} material="#transparent" withCollisions={false} id='right' color={'#ffFF00'} {...props} />
    <box position={{ x: 0, y: 2, z: 1 }} material="#transparent" withCollisions={false} id='down' color={'#00FFff'} {...props} />
  </entity>
}

// function GameStatus(props: any) {
//   return <box position={{ x: 5, y: 0, z: 1 }} color={props.status === 'PLAYING' ? '#ff0000' : '#0000ff'} {...props} />
// }

function StartButton(props: any) {
  if (props.gameStatus === 'PLAYING') return <entity id='start' />
  else return <box position={{ x: 4, y: 2, z: 2 }} id='start' color='#ff0000' />
}

function CurrentTetromino(opts: any) {
  const tetromino = opts.currentTetromino
  if (!tetromino || opts.gameStatus !== 'PLAYING') {
    return
  }
  return <entity rotation={{ x: 180, y: 0, z: 0 }} position={{ x: 7, y: 11, z: 5 }}>
    { BuildTetromino({tetromino}) }
  </entity>
}

function AllTetrominos(opts: TetrisState) {
  const allTetrominos = opts.activeTetrominos!
  if (opts.gameStatus === 'IDLE' || !allTetrominos) {
    return
  }
  return <entity rotation={{ x: 180, y: 180, z: 90}} position={{x: 7, y: 11, z: 5 }}> 
    <box position={{ x: 5, y: 2.25, z: -0.5 }} scale={{ x: 12, y: 5.5, z: 0 }} color='#000000' />
    {BuildTetrominoGrid({allTetrominos})}
  </entity>
}

function NextTetromino(opts: any) {
  const tetromino = opts.nextTetromino
  if (opts.gameStatus !== 'PLAYING') {
    return
  }
  return <entity position={{x: -2, y: 1, z: 4 }}>
    { BuildTetromino({tetromino}) }
  </entity>
}
