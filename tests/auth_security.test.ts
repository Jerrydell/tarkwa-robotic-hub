import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCurrentProfile, requireRole } from "../lib/auth/helpers";
import * as serverSupabase from "../lib/supabase/server";
import { redirect } from "next/navigation";

vi.mock("../lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    const err = new Error("NEXT_REDIRECT");
    (err as any).digest = `NEXT_REDIRECT;replace;${url};307;`;
    throw err;
  }),
}));

vi.mock("react", () => ({
  cache: (fn: any) => fn, // Disable cache for unit testing logic
}));

describe("Auth & Role Security Helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getCurrentProfile returns null when no user is authenticated", async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    };
    vi.mocked(serverSupabase.createClient).mockResolvedValue(mockSupabase as any);

    const profile = await getCurrentProfile();
    expect(profile).toBeNull();
  });

  it("requireRole redirects to /login if not authenticated", async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    };
    vi.mocked(serverSupabase.createClient).mockResolvedValue(mockSupabase as any);

    await expect(requireRole("student")).rejects.toThrow("NEXT_REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("requireRole redirects to /dashboard if role rank is insufficient", async () => {
    const mockUser = { id: "user-1" };
    const mockProfile = { id: "user-1", role: "student", is_active: true };
    
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockProfile }),
    };
    vi.mocked(serverSupabase.createClient).mockResolvedValue(mockSupabase as any);

    await expect(requireRole("super_admin")).rejects.toThrow("NEXT_REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/dashboard");
  });

  it("requireRole returns profile if role is sufficient", async () => {
    const mockUser = { id: "admin-1" };
    const mockProfile = { id: "admin-1", role: "super_admin", is_active: true };
    
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockProfile }),
    };
    vi.mocked(serverSupabase.createClient).mockResolvedValue(mockSupabase as any);

    const profile = await requireRole("super_admin");
    expect(profile).toEqual(mockProfile);
    expect(redirect).not.toHaveBeenCalled();
  });

  it("requireRole redirects to /suspended if user is not active", async () => {
    const mockUser = { id: "user-1" };
    const mockProfile = { id: "user-1", role: "student", is_active: false };
    
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockProfile }),
    };
    vi.mocked(serverSupabase.createClient).mockResolvedValue(mockSupabase as any);

    await expect(requireRole("student")).rejects.toThrow("NEXT_REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/suspended");
  });
});
