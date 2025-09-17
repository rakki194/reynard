/**
 * Reynard 3D Demo App - Interactive Games & Visualizations
 * Showcasing the power of our 3D package with multiple games and demos
 */

import { Component, createSignal, createContext, useContext, ParentComponent } from "solid-js";
import { ReynardProvider, useTheme } from "reynard-themes";
import { NotificationsProvider, useNotifications, createNotifications } from "reynard-core";
import { GameSelector } from "./components/GameSelector";
import { ThemeToggle } from "./components/ThemeToggle";
import { GameContainer } from "./components/GameContainer";
import { GameInfo } from "./components/GameInfo";

// Game types
export type GameType = "cube-collector" | "space-shooter" | "maze-explorer" | "particle-demo" | "none";

interface GameContextType {
  currentGame: () => GameType;
  setCurrentGame: (game: GameType) => void;
  gameScore: () => number;
  setGameScore: (score: number) => void;
}

const GameContext = createContext<GameContextType>();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

const GameProvider: ParentComponent<{ value: GameContextType }> = props => {
  return <GameContext.Provider value={props.value}>{props.children}</GameContext.Provider>;
};

const GameApp: Component = () => {
  const [currentGame, setCurrentGame] = createSignal<GameType>("none");
  const [gameScore, setGameScore] = createSignal(0);
  const _themeContext = useTheme();
  const { notify } = useNotifications();

  const gameContext: GameContextType = {
    currentGame,
    setCurrentGame,
    gameScore,
    setGameScore,
  };

  const handleGameSelect = (game: GameType) => {
    setCurrentGame(game);
    setGameScore(0);
    notify(`🦊 Starting ${game.replace("-", " ")} game!`, "success");
  };

  const handleScoreUpdate = (score: number) => {
    setGameScore(score);
  };

  return (
    <GameProvider value={gameContext}>
      <div class="app">
        <header class="app-header">
          <div class="header-content">
            <h1>
              <span class="reynard-logo">🦊</span>
              Reynard 3D Demo
            </h1>
            <p>Interactive Games & Visualizations powered by Three.js</p>
            <div class="header-controls">
              <ThemeToggle />
              <div class="score-display">
                Score: <span class="score-value">{gameScore()}</span>
              </div>
            </div>
          </div>
        </header>

        <main class="app-main">
          {currentGame() === "none" ? (
            <div class="game-selection">
              <GameSelector onGameSelect={handleGameSelect} />
              <GameInfo />
            </div>
          ) : (
            <GameContainer
              game={currentGame()}
              onScoreUpdate={handleScoreUpdate}
              onBackToMenu={() => setCurrentGame("none")}
            />
          )}
        </main>

        <footer class="app-footer">
          <p>
            Built with 🦊 Reynard Framework •
            <a href="https://github.com/your-org/reynard" target="_blank" rel="noopener noreferrer">
              View on GitHub
            </a>
          </p>
        </footer>
      </div>
    </GameProvider>
  );
};

const App: Component = () => {
  const notificationsModule = createNotifications();

  return (
    <ReynardProvider defaultLocale="en" defaultTheme="light">
      <NotificationsProvider value={notificationsModule}>
        <GameApp />
      </NotificationsProvider>
    </ReynardProvider>
  );
};

export default App;
