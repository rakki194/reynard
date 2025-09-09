import { describe, it, expect } from "vitest";
import type {
  GameStats,
  GameState,
  Ball,
  Collision,
  SpatialObject,
  QueryRect,
  Shape,
  Operation,
  Measurement,
  GameConfig,
  GameControls,
} from "./index";

describe("Game Types", () => {
  describe("GameStats", () => {
    it("should allow all optional properties", () => {
      const stats: GameStats = {
        totalCollisions: 10,
        activeBalls: 5,
        averageSpeed: 2.5,
        score: 100,
        moves: 15,
        comboCount: 3,
      };

      expect(stats.totalCollisions).toBe(10);
      expect(stats.activeBalls).toBe(5);
      expect(stats.averageSpeed).toBe(2.5);
      expect(stats.score).toBe(100);
      expect(stats.moves).toBe(15);
      expect(stats.comboCount).toBe(3);
    });

    it("should allow empty object", () => {
      const stats: GameStats = {};
      expect(stats).toEqual({});
    });

    it("should allow partial properties", () => {
      const stats: GameStats = {
        score: 50,
        moves: 8,
      };

      expect(stats.score).toBe(50);
      expect(stats.moves).toBe(8);
      expect(stats.totalCollisions).toBeUndefined();
    });
  });

  describe("GameState", () => {
    it("should allow all valid state values", () => {
      const states: GameState[] = [
        { state: "playing" },
        { state: "won" },
        { state: "lost" },
        { state: "game-over" },
        { state: "paused" },
      ];

      states.forEach((gameState) => {
        expect(["playing", "won", "lost", "game-over", "paused"]).toContain(
          gameState.state,
        );
      });
    });

    it("should allow optional isAnimating property", () => {
      const gameState: GameState = {
        state: "playing",
        isAnimating: true,
      };

      expect(gameState.state).toBe("playing");
      expect(gameState.isAnimating).toBe(true);
    });
  });

  describe("Ball", () => {
    it("should have all required properties", () => {
      const ball: Ball = {
        id: 1,
        x: 100,
        y: 200,
        vx: 5,
        vy: -3,
        radius: 10,
        color: "#ff0000",
      };

      expect(ball.id).toBe(1);
      expect(ball.x).toBe(100);
      expect(ball.y).toBe(200);
      expect(ball.vx).toBe(5);
      expect(ball.vy).toBe(-3);
      expect(ball.radius).toBe(10);
      expect(ball.color).toBe("#ff0000");
    });
  });

  describe("Collision", () => {
    it("should have all required properties", () => {
      const collision: Collision = {
        ball1: 1,
        ball2: 2,
        timestamp: Date.now(),
      };

      expect(collision.ball1).toBe(1);
      expect(collision.ball2).toBe(2);
      expect(typeof collision.timestamp).toBe("number");
    });
  });

  describe("SpatialObject", () => {
    it("should have all required properties", () => {
      const object: SpatialObject = {
        id: 1,
        x: 50,
        y: 75,
        width: 100,
        height: 50,
        color: "#00ff00",
      };

      expect(object.id).toBe(1);
      expect(object.x).toBe(50);
      expect(object.y).toBe(75);
      expect(object.width).toBe(100);
      expect(object.height).toBe(50);
      expect(object.color).toBe("#00ff00");
    });
  });

  describe("QueryRect", () => {
    it("should have all required properties", () => {
      const rect: QueryRect = {
        x: 0,
        y: 0,
        width: 200,
        height: 150,
      };

      expect(rect.x).toBe(0);
      expect(rect.y).toBe(0);
      expect(rect.width).toBe(200);
      expect(rect.height).toBe(150);
    });
  });

  describe("Shape", () => {
    it("should allow all valid shape types", () => {
      const shapes: Shape[] = [
        { id: 1, type: "point", data: { x: 10, y: 20 }, color: "#ff0000" },
        {
          id: 2,
          type: "line",
          data: { x1: 0, y1: 0, x2: 100, y2: 100 },
          color: "#00ff00",
        },
        {
          id: 3,
          type: "rectangle",
          data: { x: 0, y: 0, width: 50, height: 30 },
          color: "#0000ff",
        },
        {
          id: 4,
          type: "circle",
          data: { x: 25, y: 25, radius: 15 },
          color: "#ffff00",
        },
        {
          id: 5,
          type: "polygon",
          data: {
            points: [
              { x: 0, y: 0 },
              { x: 10, y: 0 },
              { x: 5, y: 10 },
            ],
          },
          color: "#ff00ff",
        },
      ];

      shapes.forEach((shape) => {
        expect(["point", "line", "rectangle", "circle", "polygon"]).toContain(
          shape.type,
        );
        expect(typeof shape.id).toBe("number");
        expect(typeof shape.color).toBe("string");
        expect(shape.data).toBeDefined();
      });
    });
  });

  describe("Operation", () => {
    it("should have all required properties", () => {
      const operation: Operation = {
        type: "union",
        result: { connected: true },
        timestamp: Date.now(),
      };

      expect(typeof operation.type).toBe("string");
      expect(operation.result).toBeDefined();
      expect(typeof operation.timestamp).toBe("number");
    });
  });

  describe("Measurement", () => {
    it("should have all required properties", () => {
      const measurement: Measurement = {
        name: "collision_detection",
        duration: 15.5,
        memory: 1024,
        timestamp: Date.now(),
      };

      expect(typeof measurement.name).toBe("string");
      expect(typeof measurement.duration).toBe("number");
      expect(typeof measurement.memory).toBe("number");
      expect(typeof measurement.timestamp).toBe("number");
    });
  });

  describe("GameConfig", () => {
    it("should allow all optional properties", () => {
      const config: GameConfig = {
        gridSize: 8,
        targetConnections: 5,
        colors: [1, 2, 3, 4],
        canvasWidth: 800,
        canvasHeight: 600,
        ballCount: 20,
        objectCount: 50,
      };

      expect(config.gridSize).toBe(8);
      expect(config.targetConnections).toBe(5);
      expect(config.colors).toEqual([1, 2, 3, 4]);
      expect(config.canvasWidth).toBe(800);
      expect(config.canvasHeight).toBe(600);
      expect(config.ballCount).toBe(20);
      expect(config.objectCount).toBe(50);
    });

    it("should allow empty object", () => {
      const config: GameConfig = {};
      expect(config).toEqual({});
    });

    it("should allow partial configuration", () => {
      const config: GameConfig = {
        gridSize: 10,
        canvasWidth: 1024,
      };

      expect(config.gridSize).toBe(10);
      expect(config.canvasWidth).toBe(1024);
      expect(config.targetConnections).toBeUndefined();
    });
  });

  describe("GameControls", () => {
    it("should allow all optional callback functions", () => {
      const onStart = () => console.log("start");
      const onPause = () => console.log("pause");
      const onReset = () => console.log("reset");
      const onNewGame = () => console.log("new game");

      const controls: GameControls = {
        onStart,
        onPause,
        onReset,
        onNewGame,
      };

      expect(typeof controls.onStart).toBe("function");
      expect(typeof controls.onPause).toBe("function");
      expect(typeof controls.onReset).toBe("function");
      expect(typeof controls.onNewGame).toBe("function");
    });

    it("should allow empty object", () => {
      const controls: GameControls = {};
      expect(controls).toEqual({});
    });

    it("should allow partial callbacks", () => {
      const onStart = () => console.log("start");
      const controls: GameControls = { onStart };

      expect(typeof controls.onStart).toBe("function");
      expect(controls.onPause).toBeUndefined();
      expect(controls.onReset).toBeUndefined();
      expect(controls.onNewGame).toBeUndefined();
    });
  });
});
