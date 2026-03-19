/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Point {
  x: number;
  y: number;
}

export enum CellType {
  WALL = 1,
  PATH = 0,
  START = 2,
  END = 3,
}

export interface GameState {
  status: 'START' | 'PLAYING' | 'WON' | 'GAMEOVER';
  level: number;
  time: number;
  moves: number;
}
