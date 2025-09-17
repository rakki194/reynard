import { World } from "../ecs/types";
import { GameConfig } from "./resources";
export declare class PixelArtRenderer {
    private canvas;
    private ctx;
    private tileSize;
    private fontFamily;
    private fontSize;
    constructor(canvas: HTMLCanvasElement, config: GameConfig);
    private setupCanvas;
    render(world: World): void;
    private renderDungeon;
    private renderTile;
    private renderEntities;
    private renderEntity;
    private renderUI;
    private renderMessageLog;
    private renderPlayerStats;
    private renderFPS;
    resize(width: number, height: number): void;
}
