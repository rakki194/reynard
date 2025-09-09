import { describe, it, expect } from "vitest";
import { ConnectionSecurity } from "./security";
import { SecurityLevel } from "./types";

describe("ConnectionSecurity", () => {
  it("creates headers and reports security info", () => {
    const s = new ConnectionSecurity(SecurityLevel.ENHANCED);
    const h = s.createAuthorizationHeaders("t", "k");
    expect(h.Authorization).toBe("Bearer t");
    expect(h["X-API-Key"]).toBe("k");
    const info = s.getSecurityInfo();
    expect(info.security_level).toBe(SecurityLevel.ENHANCED);
  });
});
