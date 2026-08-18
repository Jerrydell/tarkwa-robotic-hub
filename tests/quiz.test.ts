import { describe, it, expect, vi } from "vitest";
import { submitQuizAttempt } from "../features/quizzes/actions";
import * as serverAuth from "../lib/auth/helpers";
import * as serverSupabase from "../lib/supabase/server";

vi.mock("../lib/auth/helpers", () => ({
  requireRole: vi.fn(),
}));

vi.mock("../lib/supabase/server", () => ({
  createClient: vi.fn(),
  createAdminClient: vi.fn(),
}));

describe("submitQuizAttempt Security & Logic", () => {
  it("scores correctly and includes review data", async () => {
    // 1. Setup mocks
    const mockUser = { id: "user-123", role: "student" };
    vi.mocked(serverAuth.requireRole).mockResolvedValue(mockUser as any);

    const mockQuiz = {
      questions: [
        { question: "Q1", options: ["A", "B"] },
        { question: "Q2", options: ["C", "D"] },
      ],
      passing_score: 70,
    };

    const mockAnswers = [
      { question_index: 0, correct_index: 1, explanation: "Exp 1" },
      { question_index: 1, correct_index: 0, explanation: "Exp 2" },
    ];

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockQuiz }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    };

    const mockAdminClient = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockAnswers }),
    };

    vi.mocked(serverSupabase.createClient).mockResolvedValue(mockSupabase as any);
    vi.mocked(serverSupabase.createAdminClient).mockResolvedValue(mockAdminClient as any);

    // 2. Execute: Correct answers [1, 0]. User sends [1, 1].
    const result = await submitQuizAttempt("quiz-1", [1, 1]) as any;

    // 3. Verify
    expect(result.score).toBe(50);
    expect(result.passed).toBe(false);
    expect(result.totalQuestions).toBe(2);
    expect(result.correctCount).toBe(1);
    expect(result.review[0].correctIndex).toBe(1);
    expect(result.review[0].selectedIndex).toBe(1);
    expect(result.review[1].correctIndex).toBe(0);
    expect(result.review[1].selectedIndex).toBe(1);
    
    // Check if quiz_attempts insert happened
    expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
      score: 50,
      passed: false,
    }));
  });

  it("fails if quiz is not found", async () => {
    vi.mocked(serverSupabase.createClient).mockResolvedValue({
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null }),
    } as any);

    const result = await submitQuizAttempt("quiz-missing", [0]);
    expect(result).toHaveProperty("error", "Quiz not found.");
  });
});
