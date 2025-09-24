import { createSignal } from "solid-js";
import type { MazeCell } from "../types/maze";

/**
 * Composable for generating mazes using recursive backtracking algorithm
 * Creates a perfect maze with exactly one path between any two points
 */
export function useMazeGeneration(size: number) {
  const [maze, setMaze] = createSignal<MazeCell[][]>([]);

  const generateMaze = () => {
    const newMaze: MazeCell[][] = [];

    // Initialize maze with all walls
    for (let x = 0; x < size; x++) {
      newMaze[x] = [];
      for (let z = 0; z < size; z++) {
        newMaze[x][z] = {
          x,
          z,
          walls: { north: true, south: true, east: true, west: true },
          visited: false,
        };
      }
    }

    // Recursive backtracking algorithm
    const stack: MazeCell[] = [];
    const start = newMaze[0][0];
    start.visited = true;
    stack.push(start);

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = getUnvisitedNeighbors(current, newMaze);

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        removeWallBetween(current, next);
        next.visited = true;
        stack.push(next);
      } else {
        stack.pop();
      }
    }

    setMaze(newMaze);
  };

  const getUnvisitedNeighbors = (cell: MazeCell, maze: MazeCell[][]): MazeCell[] => {
    const neighbors: MazeCell[] = [];
    const { x, z } = cell;

    if (x > 0 && !maze[x - 1][z].visited) neighbors.push(maze[x - 1][z]);
    if (x < maze.length - 1 && !maze[x + 1][z].visited) neighbors.push(maze[x + 1][z]);
    if (z > 0 && !maze[x][z - 1].visited) neighbors.push(maze[x][z - 1]);
    if (z < maze[0].length - 1 && !maze[x][z + 1].visited) neighbors.push(maze[x][z + 1]);

    return neighbors;
  };

  const removeWallBetween = (cell1: MazeCell, cell2: MazeCell) => {
    const dx = cell2.x - cell1.x;
    const dz = cell2.z - cell1.z;

    if (dx === 1) {
      cell1.walls.east = false;
      cell2.walls.west = false;
    } else if (dx === -1) {
      cell1.walls.west = false;
      cell2.walls.east = false;
    } else if (dz === 1) {
      cell1.walls.south = false;
      cell2.walls.north = false;
    } else if (dz === -1) {
      cell1.walls.north = false;
      cell2.walls.south = false;
    }
  };

  return {
    maze,
    generateMaze,
  };
}
