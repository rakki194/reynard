/**
 * Reynard Games Demo
 * Interactive Games and Visualizations Showcase
 */

import { Component, createEffect, createSignal } from "solid-js";
import { NotificationsProvider, createNotifications } from "reynard-core";
import { ReynardProvider, useTheme, useI18n } from "reynard-themes";
import { RoguelikeGamePage } from "./pages/RoguelikeGamePage";
import { ThreeDGamesPage } from "./pages/ThreeDGamesPage";
import { GameSelector } from "./components/GameSelector";
import "./styles/global.css";

type GameType = "none" | "roguelike" | "3d-games";

const GamesApp: Component = () => {
  const [currentGame, setCurrentGame] = createSignal<GameType>("none");
  const { theme } = useTheme();
  const { locale } = useI18n();

  // Handle game selection and hash updates
  const handleGameSelect = (game: GameType) => {
    setCurrentGame(game);
    window.location.hash = game === "none" ? "" : `#${game}`;
  };

  // Handle hash-based routing
  createEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      setCurrentGame((hash as GameType) || "none");
    };

    // Set initial page
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  });

  return (
    <div class="app">
      {currentGame() === "roguelike" ? (
        <RoguelikeGamePage />
      ) : currentGame() === "3d-games" ? (
        <ThreeDGamesPage />
      ) : (
        <GameSelector onGameSelect={handleGameSelect} />
      )}
    </div>
  );
};

const App: Component = () => {
  const notificationsModule = createNotifications();

  return (
    <ReynardProvider defaultLocale="en">
      <NotificationsProvider value={notificationsModule}>
        <GamesApp />
      </NotificationsProvider>
    </ReynardProvider>
  );
};

export default App;
