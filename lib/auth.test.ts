import { describe, it, expect } from "vitest";
import { AUTH_COOKIE, isValidToken, tokenFor } from "@/lib/auth";

describe("auth helper", () => {
  it("exposes a stable cookie name", () => {
    expect(AUTH_COOKIE).toBe("buddyhub_auth");
  });

  it("accepts a token derived from the password", async () => {
    const token = await tokenFor("hunter2");
    expect(await isValidToken(token, "hunter2")).toBe(true);
  });

  it("rejects a token from a different password", async () => {
    const token = await tokenFor("hunter2");
    expect(await isValidToken(token, "different")).toBe(false);
  });

  it("rejects empty/garbage tokens", async () => {
    expect(await isValidToken("", "hunter2")).toBe(false);
    expect(await isValidToken("nope", "hunter2")).toBe(false);
  });
});
