import { CellType, Point } from './types';

/**
 * Generates a maze using Recursive Backtracking algorithm.
 * Returns a 2D array where 1 is wall and 0 is path.
 */
export function generateMaze(width: number, height: number): number[][] {
  // Ensure dimensions are odd for the wall/path structure
  const w = width % 2 === 0 ? width + 1 : width;
  const h = height % 2 === 0 ? height + 1 : height;

  const maze: number[][] = Array(h).fill(null).map(() => Array(w).fill(CellType.WALL));

  const stack: Point[] = [];
  const start: Point = { x: 1, y: 1 };
  maze[start.y][start.x] = CellType.PATH;
  stack.push(start);

  const directions = [
    { x: 0, y: -2 }, // Up
    { x: 0, y: 2 },  // Down
    { x: -2, y: 0 }, // Left
    { x: 2, y: 0 },  // Right
  ];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors: Point[] = [];

    for (const dir of directions) {
      const nx = current.x + dir.x;
      const ny = current.y + dir.y;

      if (nx > 0 && nx < w - 1 && ny > 0 && ny < h - 1 && maze[ny][nx] === CellType.WALL) {
        neighbors.push({ x: nx, y: ny });
      }
    }

    if (neighbors.length > 0) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      // Remove wall between current and next
      maze[current.y + (next.y - current.y) / 2][current.x + (next.x - current.x) / 2] = CellType.PATH;
      maze[next.y][next.x] = CellType.PATH;
      stack.push(next);
    } else {
      stack.pop();
    }
  }

  // Set start and end
  maze[1][1] = CellType.START;
  maze[h - 2][w - 2] = CellType.END;

  return maze;
}
