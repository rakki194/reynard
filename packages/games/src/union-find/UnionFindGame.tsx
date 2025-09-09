import { createSignal, createEffect, onMount } from "solid-js";
import { Button } from "reynard-components";
import { UnionFind } from "reynard-algorithms";
import { GameState, GameStats, GameConfig } from "../types";
import "./UnionFindGame.css";

interface UnionFindGameProps {
  config?: GameConfig;
}

export function UnionFindGame(props: UnionFindGameProps = {}) {
  const [grid, setGrid] = createSignal<number[][]>([]);
  const [uf, setUf] = createSignal<UnionFind | null>(null);
  const [selectedCells, setSelectedCells] = createSignal(new Set<string>());
  const [score, setScore] = createSignal(0);
  const [gameState, setGameState] = createSignal<GameState["state"]>("playing");
  const [moves, setMoves] = createSignal(0);
  const [stats, setStats] = createSignal<any>(null);
  const [isAnimating, setIsAnimating] = createSignal(false);
  const [comboCount, setComboCount] = createSignal(0);

  const config = {
    gridSize: 8,
    targetConnections: 3,
    colors: [1, 2, 3, 4, 5, 6],
    ...props.config,
  };

  const GRID_SIZE = config.gridSize!;
  const TARGET_CONNECTIONS = config.targetConnections!;
  const COLORS = config.colors!;

  const initializeGame = () => {
    const newGrid = Array(GRID_SIZE)
      .fill(null)
      .map(() =>
        Array(GRID_SIZE)
          .fill(0)
          .map(() => COLORS[Math.floor(Math.random() * COLORS.length)]),
      );
    setGrid(newGrid);
    setUf(new UnionFind(GRID_SIZE * GRID_SIZE));
    setSelectedCells(new Set<string>());
    setScore(0);
    setGameState("playing");
    setMoves(0);
    setStats(null);
    setComboCount(0);
    setIsAnimating(false);
  };

  const getCellId = (row: number, col: number) => row * GRID_SIZE + col;

  const findConnectedComponents = (selectedCells: Set<string>) => {
    const currentUf = uf();
    if (!currentUf) return [];

    const components = new Map<number, number[]>();

    for (const cellKey of Array.from(selectedCells)) {
      const [row, col] = cellKey.split("-").map(Number);
      const cellId = getCellId(row, col);
      const root = currentUf.find(cellId);

      if (!components.has(root)) {
        components.set(root, []);
      }
      components.get(root)!.push(cellId);
    }

    return Array.from(components.values());
  };

  const applyGravity = (newGrid: number[][]) => {
    const updatedGrid = newGrid.map((row) => [...row]);

    for (let col = 0; col < GRID_SIZE; col++) {
      // Create a new column with only non-zero values, packed to the bottom
      const newColumn = new Array(GRID_SIZE).fill(0);
      let writeIndex = GRID_SIZE - 1; // Start from the bottom

      // Read from bottom to top, write to bottom
      for (let row = GRID_SIZE - 1; row >= 0; row--) {
        if (updatedGrid[row][col] !== 0) {
          newColumn[writeIndex] = updatedGrid[row][col];
          writeIndex--;
        }
      }

      // Copy the new column back
      for (let row = 0; row < GRID_SIZE; row++) {
        updatedGrid[row][col] = newColumn[row];
      }
    }

    return updatedGrid;
  };

  const fillEmptySpaces = (newGrid: number[][]) => {
    const updatedGrid = newGrid.map((row) => [...row]);

    // Only fill empty spaces at the top of each column
    for (let col = 0; col < GRID_SIZE; col++) {
      // Count how many empty spaces are at the top
      let emptyCount = 0;
      for (let row = 0; row < GRID_SIZE; row++) {
        if (updatedGrid[row][col] === 0) {
          emptyCount++;
        } else {
          break; // Stop counting once we hit a non-empty cell
        }
      }

      // Fill only the top empty spaces
      for (let row = 0; row < emptyCount; row++) {
        updatedGrid[row][col] =
          COLORS[Math.floor(Math.random() * COLORS.length)];
      }
    }

    return updatedGrid;
  };

  const clearCombo = async (component: number[]) => {
    setIsAnimating(true);

    // Convert component IDs back to grid positions
    const positions = component.map((id) => ({
      row: Math.floor(id / GRID_SIZE),
      col: id % GRID_SIZE,
    }));

    // Mark cells for clearing
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row) => [...row]);
      positions.forEach(({ row, col }) => {
        newGrid[row][col] = 0;
      });
      return newGrid;
    });

    // Wait for animation
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Apply gravity
    setGrid((prevGrid) => applyGravity(prevGrid));

    // Wait for gravity animation
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Update score
    const comboScore = component.length * 10 * (comboCount() + 1);
    setScore(score() + comboScore);
    setComboCount(comboCount() + 1);

    setIsAnimating(false);
  };

  const isAdjacent = (
    row1: number,
    col1: number,
    row2: number,
    col2: number,
  ) => {
    const rowDiff = Math.abs(row1 - row2);
    const colDiff = Math.abs(col1 - col2);
    // Allow both orthogonal (up/down/left/right) and diagonal connections
    return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
  };

  const canAddToSelection = (
    row: number,
    col: number,
    currentSelection: Set<string>,
  ) => {
    if (currentSelection.size === 0) return true;

    const currentColor = grid()[row][col];

    // Check if any selected cell is adjacent and has the same color
    for (const selectedKey of Array.from(currentSelection)) {
      const [selRow, selCol] = selectedKey.split("-").map(Number);
      if (
        grid()[selRow][selCol] === currentColor &&
        isAdjacent(row, col, selRow, selCol)
      ) {
        return true;
      }
    }

    return false;
  };

  const handleCellClick = async (row: number, col: number) => {
    if (gameState() !== "playing" || isAnimating()) return;

    const cellId = getCellId(row, col);
    const currentUf = uf();
    if (!currentUf) return;

    const newSelected = new Set<string>(selectedCells());
    const cellKey = `${row}-${col}`;

    if (newSelected.has(cellKey)) {
      newSelected.delete(cellKey);
    } else {
      // Check if this cell can be added to the current selection
      if (canAddToSelection(row, col, newSelected)) {
        newSelected.add(cellKey);

        // Connect with adjacent selected cells of the same color
        const currentColor = grid()[row][col];
        for (const selectedKey of Array.from(newSelected)) {
          if (selectedKey === cellKey) continue;
          const [selRow, selCol] = selectedKey.split("-").map(Number);
          if (
            grid()[selRow][selCol] === currentColor &&
            isAdjacent(row, col, selRow, selCol)
          ) {
            const selId = getCellId(selRow, selCol);
            currentUf.union(cellId, selId);
          }
        }
      } else {
        // If can't add to current selection, start a new selection
        newSelected.clear();
        newSelected.add(cellKey);
        setUf(new UnionFind(GRID_SIZE * GRID_SIZE));
      }
    }

    setSelectedCells(newSelected);
    setMoves(moves() + 1);

    // Check for game over after each move
    setTimeout(() => {
      checkGameOver();
    }, 100);
  };

  const fillBoard = () => {
    if (gameState() !== "playing") return;
    setGrid((prevGrid) => fillEmptySpaces(prevGrid));
    // Check for game over after filling
    setTimeout(() => {
      checkGameOver();
    }, 100);
  };

  const checkForValidMoves = () => {
    const currentGrid = grid();

    // Check for horizontal lines of 3+ adjacent same-colored blocks
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE - 2; col++) {
        const color = currentGrid[row][col];
        if (color === 0) continue;

        let count = 1;
        for (let c = col + 1; c < GRID_SIZE; c++) {
          if (currentGrid[row][c] === color) {
            count++;
          } else {
            break;
          }
        }

        if (count >= 3) {
          return true; // Found a valid horizontal combo
        }
      }
    }

    // Check for vertical lines of 3+ adjacent same-colored blocks
    for (let col = 0; col < GRID_SIZE; col++) {
      for (let row = 0; row < GRID_SIZE - 2; row++) {
        const color = currentGrid[row][col];
        if (color === 0) continue;

        let count = 1;
        for (let r = row + 1; r < GRID_SIZE; r++) {
          if (currentGrid[r][col] === color) {
            count++;
          } else {
            break;
          }
        }

        if (count >= 3) {
          return true; // Found a valid vertical combo
        }
      }
    }

    // Check for L-shapes, diagonal patterns, and other connected patterns
    for (let row = 0; row < GRID_SIZE - 1; row++) {
      for (let col = 0; col < GRID_SIZE - 1; col++) {
        const color = currentGrid[row][col];
        if (color === 0) continue;

        // Check for L-shape patterns (3 blocks forming an L)
        if (
          currentGrid[row][col + 1] === color &&
          currentGrid[row + 1][col] === color
        ) {
          return true;
        }

        // Check for diagonal patterns (3 blocks in a diagonal line)
        if (currentGrid[row + 1][col + 1] === color) {
          return true;
        }

        // Check for other connected patterns
        if (
          currentGrid[row][col + 1] === color &&
          currentGrid[row + 1][col + 1] === color
        ) {
          return true;
        }

        if (
          currentGrid[row + 1][col] === color &&
          currentGrid[row + 1][col + 1] === color
        ) {
          return true;
        }

        // Check for reverse diagonal patterns
        if (row > 0 && currentGrid[row - 1][col + 1] === color) {
          return true;
        }
      }
    }

    return false; // No valid moves found
  };

  const checkGameOver = () => {
    if (!checkForValidMoves()) {
      setGameState("game-over");
      return true;
    }
    return false;
  };

  const cancelSelection = () => {
    setSelectedCells(new Set<string>());
    setUf(new UnionFind(GRID_SIZE * GRID_SIZE));
  };

  const clearSelectedCombo = async () => {
    const currentSelection = selectedCells();
    if (currentSelection.size < TARGET_CONNECTIONS) return;

    const currentUf = uf();
    if (!currentUf) return;

    // Get the connected components from the current selection
    const components = findConnectedComponents(currentSelection);
    const largestComponent = components.reduce((max, comp) =>
      comp.length > max.length ? comp : max,
    );

    // Clear selected cells
    setSelectedCells(new Set<string>());

    // Clear the combo with animation
    await clearCombo(largestComponent);

    // Reset combo count after clearing
    setComboCount(0);

    // Update stats
    setStats(currentUf.getStats());

    // Check for game over after clearing
    setTimeout(() => {
      checkGameOver();
    }, 100);
  };

  onMount(() => {
    initializeGame();

    // Add keyboard listener for Escape and Enter keys
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameState() !== "playing") return;

      if (event.key === "Escape") {
        cancelSelection();
      } else if (
        event.key === "Enter" &&
        selectedCells().size >= TARGET_CONNECTIONS
      ) {
        clearSelectedCombo();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  });

  return (
    <div class="union-find-game">
      <div class="game-header">
        <h3>🎯 Match-3 Union-Find Puzzle</h3>
        <div class="game-stats">
          <span>Score: {score()}</span>
          <span>Moves: {moves()}</span>
          <span>Combo: {comboCount()}</span>
          <span>
            Status: {gameState() === "game-over" ? "Game Over!" : gameState()}
          </span>
        </div>
        <Button onClick={initializeGame} variant="secondary" size="sm">
          New Game
        </Button>
        <Button onClick={fillBoard} variant="tertiary" size="sm">
          Fill Board
        </Button>
        <Button
          onClick={cancelSelection}
          variant="ghost"
          size="sm"
          disabled={selectedCells().size === 0}
        >
          Cancel Selection
        </Button>
        <Button
          onClick={clearSelectedCombo}
          variant="primary"
          size="sm"
          disabled={selectedCells().size < TARGET_CONNECTIONS}
        >
          Clear Combo ({selectedCells().size})
        </Button>
      </div>

      <div class="game-grid">
        {grid().map((row, rowIndex) =>
          row.map((color, colIndex) => {
            const cellKey = `${rowIndex}-${colIndex}`;
            const isSelected = selectedCells().has(cellKey);
            const cellId = getCellId(rowIndex, colIndex);
            const currentUf = uf();
            const setSize = currentUf ? currentUf.getSetSize(cellId) : 1;
            const isEmpty = color === 0;

            const canSelect =
              !isEmpty &&
              gameState() === "playing" &&
              (selectedCells().size === 0 ||
                canAddToSelection(rowIndex, colIndex, selectedCells()));

            return (
              <div
                class={`game-cell color-${color} ${isSelected ? "selected" : ""} ${isEmpty ? "empty" : ""} ${!canSelect && !isEmpty ? "disabled" : ""} ${selectedCells().size > 0 && !isSelected && !canSelect && !isEmpty ? "non-connectable" : ""} set-size-${setSize}`}
                onClick={() => canSelect && handleCellClick(rowIndex, colIndex)}
              >
                {!isEmpty && <span class="cell-number">{color}</span>}
                {isSelected && !isEmpty && (
                  <span class="set-size">{setSize}</span>
                )}
              </div>
            );
          }),
        )}
      </div>

      {gameState() === "game-over" && (
        <div class="game-over-message">
          <h3>🎮 Game Over!</h3>
          <p>No more valid moves available. Final Score: {score()}</p>
          <Button onClick={initializeGame} variant="primary" size="sm">
            Play Again
          </Button>
        </div>
      )}

      <div class="game-instructions">
        <p>
          🎯 <strong>Goal:</strong> Select connected cells of the same number to
          create combos of 3+ cells (orthogonal and diagonal connections
          allowed!)
        </p>
        <p>
          💡 <strong>Mechanics:</strong> Combos disappear, blocks fall with
          gravity!
        </p>
        <p>
          🔥 <strong>Scoring:</strong> Larger combos = more points! Chain combos
          for bonus multipliers!
        </p>
        <p>
          ⌨️ <strong>Controls:</strong> Click cells to select, press{" "}
          <kbd>Escape</kbd> to cancel, <kbd>Enter</kbd> to clear combo!
        </p>
      </div>

      {stats() && (
        <div class="game-stats-detail">
          <h4>Union-Find Statistics:</h4>
          <pre>{JSON.stringify(stats(), null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
