/**
 * Games Package Translations
 * Translations for the Reynard Games framework
 */

export const gamesTranslations = {
  // Keyboard controls
  controls: {
    escape: "Escape",
    enter: "Enter",
    arrowUp: "ArrowUp",
    arrowDown: "ArrowDown",
    arrowLeft: "ArrowLeft",
    arrowRight: "ArrowRight",
    keyW: "w",
    keyWUpper: "W",
    keyS: "s",
    keySUpper: "S",
    keyA: "a",
    keyAUpper: "A",
    keyD: "d",
    keyDUpper: "D",
  },

  // Game states
  gameStates: {
    playing: "playing",
    paused: "paused",
    gameOver: "gameOver",
    menu: "menu",
  },

  // Union Find Game
  unionFind: {
    targetConnections: "Target Connections",
    selectedCells: "Selected Cells",
    clearSelectedCombo: "Clear Selected Combo",
    cancelSelection: "Cancel Selection",
  },

  // Roguelike Game
  roguelike: {
    movement: {
      up: "Move Up",
      down: "Move Down",
      left: "Move Left",
      right: "Move Right",
    },
    input: {
      keys: "Keys",
    },
  },

  // Game mechanics
  mechanics: {
    movement: "Movement",
    selection: "Selection",
    interaction: "Interaction",
    navigation: "Navigation",
  },

  // Game UI
  ui: {
    score: "Score",
    level: "Level",
    lives: "Lives",
    time: "Time",
    pause: "Pause",
    resume: "Resume",
    restart: "Restart",
    quit: "Quit",
  },

  // Game messages
  messages: {
    gameOver: "Game Over",
    levelComplete: "Level Complete",
    newHighScore: "New High Score!",
    pauseGame: "Game Paused",
    resumeGame: "Game Resumed",
  },

  // Performance
  performance: {
    fps: "FPS",
    frameTime: "Frame Time",
    memoryUsage: "Memory Usage",
    optimization: "Optimization",
  },

  // Error messages
  errors: {
    unknownError: "Unknown error",
  },
} as const;

export default gamesTranslations;
