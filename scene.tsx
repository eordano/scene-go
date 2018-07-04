import { createElement, ScriptableScene } from 'metaverse-api'

import { createStore, applyMiddleware, Store, AnyAction } from 'redux'
import ReduxThunk from 'redux-thunk'

import TetrisApp from './src/reducers'
import { TetrisState } from './src/types'
import { startGame, rotateTetromino, moveRight, moveDown, changePauseState, moveLeft, loadMenu, dropTetromino } from 'src/actions';
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
          this.store!.dispatch(moveLeft())
          break
        case 'right':
          this.store!.dispatch(moveRight())
          break
        case 'down':
          this.store!.dispatch(moveDown())
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
        <GameStatus { ...this.state } />
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
  return <entity position={{x: 8, y: 0, z: -8 }}>
    <box position={{ x: 1, y: 3, z: 1 }} id='left' color={'#00FF00'} {...props} />
    <box position={{ x: 0, y: 3, z: 1 }} id='rotate' color={'#ffFFff'} {...props} />
    <box position={{ x: -1, y: 3, z: 1 }} id='right' color={'#ffFF00'} {...props} />
    <box position={{ x: 0, y: 2, z: 1 }} id='down' color={'#00FFff'} {...props} />
  </entity>
}

function GameStatus(props: any) {
  return <box position={{ x: 5, y: 0, z: 1 }} color={props.status === 'PLAYING' ? '#ff0000' : '#0000ff'} {...props} />
}

function StartButton(props: any) {
  if (props.gameStatus === 'PLAYING') return <entity id='start' />
  else return <box position={{ x: 4, y: 2, z: 2 }} id='start' color='#ff0000' />
}

function CurrentTetromino(opts: any) {
  const tetromino = opts.currentTetromino
  if (!tetromino || opts.gameStatus !== 'PLAYING') {
    return
  }
  return <entity rotation={{ x: 180, y: 0, z: 0 }} position={{ x: 10, y: 15, z: -5 }}>
    { BuildTetromino({tetromino}) }
  </entity>
}

function AllTetrominos(opts: TetrisState) {
  const allTetrominos = opts.activeTetrominos!
  if (opts.gameStatus === 'IDLE' || !allTetrominos) {
    return
  }
  return <entity rotation={{ x: 180, y: 180, z: 90}} position={{x: 10, y: 15, z: -5 }}> 
    {BuildTetrominoGrid({allTetrominos})}
  </entity>
}

function NextTetromino(opts: any) {
  const tetromino = opts.nextTetromino
  if (opts.gameStatus !== 'PLAYING') {
    return
  }
  return <entity position={{x: 0, y: 0, z: -8 }}>
    { BuildTetromino({tetromino}) }
  </entity>
}
