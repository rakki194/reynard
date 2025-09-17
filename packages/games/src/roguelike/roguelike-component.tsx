// SolidJS component for the rogue-like game

import { Component, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { RoguelikeGame } from "./roguelike-game";
import { useI18n } from "reynard-i18n";

interface RoguelikeGameProps {
  width?: number;
  height?: number;
  className?: string;
}

export const RoguelikeGameComponent: Component<RoguelikeGameProps> = props => {
  const { t } = useI18n();
  let canvasRef: HTMLCanvasElement | undefined;
  let game: RoguelikeGame | null = null;
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  onMount(() => {
    if (!canvasRef) {
      setError(t("games.canvasElementNotFound"));
      setIsLoading(false);
      return;
    }

    try {
      // Initialize the game
      game = new RoguelikeGame(canvasRef);

      // Set canvas size
      const width = props.width || 1280;
      const height = props.height || 720;
      canvasRef.width = width;
      canvasRef.height = height;

      // Start the game
      game.start();
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to initialize rogue-like game:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setIsLoading(false);
    }
  });

  onCleanup(() => {
    if (game) {
      game.stop();
    }
  });

  // Handle window resize
  createEffect(() => {
    const handleResize = () => {
      if (game && canvasRef) {
        const width = props.width || window.innerWidth - 40;
        const height = props.height || window.innerHeight - 200;
        game.resize(width, height);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

  return (
    <div class={`roguelike-game-container ${props.className || ""}`}>
      <div class="game-header">
        <h2>🦊 Reynard Rogue-like</h2>
        <div class="game-controls">
          <div class="control-group">
            <span class="control-label">Movement:</span>
            <span class="control-keys">WASD or Arrow Keys</span>
          </div>
          <div class="control-group">
            <span class="control-label">Restart:</span>
            <span class="control-keys">R</span>
          </div>
        </div>
      </div>

      <div class="game-canvas-container">
        {isLoading() && (
          <div class="loading-overlay">
            <div class="loading-spinner"></div>
            <p>Loading dungeon...</p>
          </div>
        )}

        {error() && (
          <div class="error-overlay">
            <div class="error-message">
              <h3>Game Error</h3>
              <p>{error()}</p>
              <button
                class="retry-button"
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                  // Retry initialization
                  setTimeout(() => {
                    if (canvasRef) {
                      try {
                        game = new RoguelikeGame(canvasRef);
                        const width = props.width || 1280;
                        const height = props.height || 720;
                        canvasRef.width = width;
                        canvasRef.height = height;
                        game.start();
                        setIsLoading(false);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Unknown error");
                        setIsLoading(false);
                      }
                    }
                  }, 100);
                }}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          class="game-canvas"
          style={{
            width: `${props.width || 1280}px`,
            height: `${props.height || 720}px`,
            "image-rendering": "pixelated",
          }}
        />
      </div>

      <div class="game-info">
        <div class="info-section">
          <h3>{t("games.howToPlay")}</h3>
          <ul>
            <li>{t("games.useWASDOrArrowKeysToMove")}</li>
            <li>{t("games.exploreProcedurallyGeneratedDungeon")}</li>
            <li>{t("games.fightEnemiesByWalkingIntoThem")}</li>
            <li>{t("games.collectItemsByWalkingOverThem")}</li>
            <li>{t("games.pressRToRestartGame")}</li>
          </ul>
        </div>

        <div class="info-section">
          <h3>{t("games.features")}</h3>
          <ul>
            <li>
              🦊 <strong>{t("games.ecsArchitecture")}</strong> - {t("games.builtWithReynardsECS")}
            </li>
            <li>
              🏰 <strong>{t("games.proceduralGeneration")}</strong> - {t("games.eachDungeonUniquelyGenerated")}
            </li>
            <li>
              👁️ <strong>{t("games.lineOfSight")}</strong> - {t("games.realisticVisionAndExplorationMechanics")}
            </li>
            <li>
              🤖 <strong>{t("games.aiEnemies")}</strong> - {t("games.differentEnemyTypesWithUniqueBehaviors")}
            </li>
            <li>
              🎨 <strong>{t("games.pixelArt")}</strong> - {t("games.retroStyleRenderingWithCrispPixels")}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
