import { describe, it, expect, vi } from "vitest";
import { startConversation } from "../features/chat/actions";
import * as serverAuth from "../lib/auth/helpers";
import * as serverSupabase from "../lib/supabase/server";
import * as settingsQueries from "../features/admin/settings/queries";

vi.mock("../lib/auth/helpers", () => ({
  requireRole: vi.fn(),
}));

vi.mock("../lib/supabase/server", () => ({
  createClient: vi.fn(),
  createAdminClient: vi.fn(),
}));

vi.mock("../features/admin/settings/queries", () => ({
  getSetting: vi.fn(),
}));

// Mock next/navigation redirect
vi.mock("next/navigation", () => ({
  redirect: (url: string) => { throw new Error(`Redirect to ${url}`); },
}));

describe("startConversation Security", () => {
  it("blocks messaging when chat is disabled", async () => {
    vi.mocked(serverAuth.requireRole).mockResolvedValue({ id: "u1" } as any);
    vi.mocked(settingsQueries.getSetting).mockResolvedValue(false);

    const result = await startConversation("u2");
    expect(result).toHaveProperty("error", "Messaging is currently disabled by an admin.");
  });

  it("blocks messaging yourself", async () => {
    vi.mocked(serverAuth.requireRole).mockResolvedValue({ id: "u1" } as any);
    vi.mocked(settingsQueries.getSetting).mockResolvedValue(true);

    const result = await startConversation("u1");
    expect(result).toHaveProperty("error", "You can't message yourself.");
  });

  it("blocks messaging if not eligible according to can_message RPC", async () => {
    vi.mocked(serverAuth.requireRole).mockResolvedValue({ id: "u1" } as any);
    vi.mocked(settingsQueries.getSetting).mockResolvedValue(true);
    
    const mockSupabase = {
      rpc: vi.fn().mockResolvedValue({ data: false }),
    };
    vi.mocked(serverSupabase.createClient).mockResolvedValue(mockSupabase as any);

    const result = await startConversation("u2");
    expect(result).toHaveProperty("error", "You're not able to message this person.");
    expect(mockSupabase.rpc).toHaveBeenCalledWith("can_message", { user_a: "u1", user_b: "u2" });
  });

  it("uses admin client for creation after passing checks", async () => {
    vi.mocked(serverAuth.requireRole).mockResolvedValue({ id: "u1" } as any);
    vi.mocked(settingsQueries.getSetting).mockResolvedValue(true);
    
    const mockSupabase = {
      rpc: vi.fn().mockResolvedValue({ data: true }),
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }), // No existing convo
    };

    const mockAdminClient = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: "c1" } }),
    };

    vi.mocked(serverSupabase.createClient).mockResolvedValue(mockSupabase as any);
    vi.mocked(serverSupabase.createAdminClient).mockResolvedValue(mockAdminClient as any);

    // Expect redirect error as success
    await expect(startConversation("u2")).rejects.toThrow("Redirect to /dashboard/chat/c1");
    
    // Verify admin client was used for insertion
    expect(mockAdminClient.insert).toHaveBeenCalled();
  });
});
