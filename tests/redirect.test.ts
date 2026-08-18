import { describe, it, expect } from "vitest";
import { getSafeRedirect } from "../lib/validation/redirect";

describe("getSafeRedirect", () => {
  it("allows relative paths", () => {
    expect(getSafeRedirect("/dashboard")).toBe("/dashboard");
    expect(getSafeRedirect("/dashboard/settings")).toBe("/dashboard/settings");
  });

  it("defaults to /dashboard for empty or null input", () => {
    expect(getSafeRedirect(null)).toBe("/dashboard");
    expect(getSafeRedirect("")).toBe("/dashboard");
    expect(getSafeRedirect(undefined)).toBe("/dashboard");
  });

  it("rejects absolute URLs", () => {
    expect(getSafeRedirect("https://google.com")).toBe("/dashboard");
    expect(getSafeRedirect("http://malicious.com/dashboard")).toBe("/dashboard");
  });

  it("rejects protocol-relative URLs", () => {
    expect(getSafeRedirect("//google.com")).toBe("/dashboard");
  });

  it("rejects malformed strings", () => {
    expect(getSafeRedirect("javascript:alert(1)")).toBe("/dashboard");
  });
});
