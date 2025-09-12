import { describe, it, expect } from "vitest";
import {
  ConnectionState,
  ConnectionType,
  ConnectionHealth,
  SecurityLevel,
  RecoveryStrategy,
} from "../types";

describe("connection types enums", () => {
  it("contain expected values", () => {
    expect(ConnectionState.CONNECTED).toBe("connected");
    expect(ConnectionType.HTTP).toBe("http");
    expect(Object.values(ConnectionHealth)).toContain("healthy");
    expect(Object.values(SecurityLevel)).toContain("basic");
    expect(Object.values(RecoveryStrategy)).toContain("reconnect_backoff");
  });
});
