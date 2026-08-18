"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/helpers";

interface DraftError {
  error: string;
}

interface LessonDraft {
  title: string;
  objectives: string[];
  materials: string[];
  contentBody: Array<{ type: string; content?: string; items?: string[] }>;
  estimatedMinutes: number;
}

interface QuizDraft {
  title: string;
  questions: Array<{
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
  }>;
}

/**
 * Calls OpenRouter's free auto-router (not a pinned model — the free
 * lineup rotates, and auto-routing avoids the feature breaking silently
 * when a specific model gets retired). Returns raw text; callers parse
 * their own expected JSON shape out of it.
 */
async function callOpenRouter(systemPrompt: string, userPrompt: string): Promise<string | DraftError> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { error: "OPENROUTER_API_KEY isn't configured on the server." };
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      return { error: `OpenRouter request failed (${response.status}).` };
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) {
      return { error: "The model returned an empty response." };
    }

    return text;
  } catch {
    return { error: "Couldn't reach OpenRouter. Check your network and try again." };
  }
}

/** Extracts a JSON object/array from model output, tolerating ```json fences. */
function extractJson<T>(text: string): T | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;

  try {
    return JSON.parse(candidate.trim()) as T;
  } catch {
    const start = candidate.search(/[[{]/);
    const end = Math.max(candidate.lastIndexOf("}"), candidate.lastIndexOf("]"));
    if (start === -1 || end === -1) return null;
    try {
      return JSON.parse(candidate.slice(start, end + 1)) as T;
    } catch {
      return null;
    }
  }
}

const LESSON_SYSTEM_PROMPT = `You are drafting a robotics lesson for a Ghanaian senior high school robotics club platform. Respond with ONLY a JSON object, no prose, no markdown fences, matching exactly this shape:
{"title": string, "objectives": string[], "materials": string[], "contentBody": [{"type": "text"|"code"|"list", "content"?: string, "items"?: string[]}], "estimatedMinutes": number}
Keep language clear and practical for teenagers new to robotics. Include at least 3 content blocks. Use "code" blocks only for actual Arduino/C++ snippets where relevant to the topic.`;

const QUIZ_SYSTEM_PROMPT = `You are drafting a short quiz for a robotics lesson. Respond with ONLY a JSON object, no prose, no markdown fences, matching exactly this shape:
{"title": string, "questions": [{"question": string, "options": string[4], "correct_index": number, "explanation": string}]}
Write exactly 3 to 5 questions. correct_index is 0-based into options.`;

export async function generateLessonDraft(
  topic: string,
  level: string
): Promise<LessonDraft | DraftError> {
  await requireRole("super_admin");

  if (!topic?.trim()) return { error: "Enter a topic first." };

  const result = await callOpenRouter(
    LESSON_SYSTEM_PROMPT,
    `Topic: ${topic}\nLevel: ${level}`
  );
  if (typeof result !== "string") return result;

  const parsed = extractJson<LessonDraft>(result);
  if (!parsed) return { error: "Couldn't parse the model's response. Try again." };

  return parsed;
}

export async function generateQuizDraft(
  topic: string,
  level: string
): Promise<QuizDraft | DraftError> {
  await requireRole("super_admin");

  if (!topic?.trim()) return { error: "Enter a topic first." };

  const result = await callOpenRouter(QUIZ_SYSTEM_PROMPT, `Topic: ${topic}\nLevel: ${level}`);
  if (typeof result !== "string") return result;

  const parsed = extractJson<QuizDraft>(result);
  if (!parsed) return { error: "Couldn't parse the model's response. Try again." };

  return parsed;
}

/** Grounds the quiz in a real, already-published lesson's content rather than a fresh topic. */
export async function generateQuizFromLesson(lessonId: string): Promise<QuizDraft | DraftError> {
  await requireRole("super_admin");

  const supabase = await createClient();
  const { data: lesson } = await supabase
    .from("lessons")
    .select("title, content_body")
    .eq("id", lessonId)
    .single();

  if (!lesson) return { error: "Lesson not found." };

  const contentText = JSON.stringify(lesson.content_body).slice(0, 6000);

  const result = await callOpenRouter(
    QUIZ_SYSTEM_PROMPT,
    `Lesson title: ${lesson.title}\nLesson content (structured blocks): ${contentText}\n\nBase every question strictly on this lesson's actual content.`
  );
  if (typeof result !== "string") return result;

  const parsed = extractJson<QuizDraft>(result);
  if (!parsed) return { error: "Couldn't parse the model's response. Try again." };

  return parsed;
}
