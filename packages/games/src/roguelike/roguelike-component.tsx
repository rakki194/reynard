// SolidJS component for the rogue-like game

import { Component, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { RoguelikeGame } from "./roguelike-game";

interface RoguelikeGameProps {
    width?: number;
    height?: number;
    className?: string;
}

export const RoguelikeGameComponent: Component<RoguelikeGameProps> = (props) => {
    let canvasRef: HTMLCanvasElement | undefined;
    let game: RoguelikeGame | null = null;
    const [isLoading, setIsLoading] = createSignal(true);
    const [error, setError] = createSignal<string | null>(null);

    onMount(() => {
        if (!canvasRef) {
            setError("Canvas element not found");
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
                        "image-rendering": "pixelated"
                    }}
                />
            </div>

            <div class="game-info">
                <div class="info-section">
                    <h3>How to Play</h3>
                    <ul>
                        <li>Use <strong>WASD</strong> or <strong>Arrow Keys</strong> to move your character (@)</li>
                        <li>Explore the procedurally generated dungeon</li>
                        <li>Fight enemies (g, o, T) by walking into them</li>
                        <li>Collect items (!, ?, $, )) by walking over them</li>
                        <li>Press <strong>R</strong> to restart the game</li>
                    </ul>
                </div>

                <div class="info-section">
                    <h3>Features</h3>
                    <ul>
                        <li>🦊 <strong>ECS Architecture</strong> - Built with Reynard's Entity-Component-System</li>
                        <li>🏰 <strong>Procedural Generation</strong> - Each dungeon is uniquely generated</li>
                        <li>👁️ <strong>Line of Sight</strong> - Realistic vision and exploration mechanics</li>
                        <li>🤖 <strong>AI Enemies</strong> - Different enemy types with unique behaviors</li>
                        <li>🎨 <strong>Pixel Art</strong> - Retro-style rendering with crisp pixels</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
